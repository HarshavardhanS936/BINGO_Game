import { useState, useEffect } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BingoBoard from "../components/BingoBoard";
import toast from "react-hot-toast";
import { Copy, Users, ChevronLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Game = ({ mode = "auto" }) => {
    const { user, userData } = useAuth();
    const { roomId: paramRoomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const customGrid = location.state?.customGrid || null;

    const [playerName, setPlayerName] = useState(userData?.username || user?.displayName || user?.phoneNumber || "Guest");
    const [roomId, setRoomId] = useState(paramRoomId || "");
    const [joined, setJoined] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        socket.connect();

        socket.on('room_update', (data) => {
            setRoomData((prev) => {
                if (data.gameState === 'gameOver' && prev?.gameState !== 'gameOver') {
                    handleStreakUpdate(data.winner === socket.id);
                }
                return data;
            });
            setJoined(true);
            setIsJoining(false);
            if (data.players.length === 2 && roomData?.players.length === 1) {
                toast.success("Hostile detected! Combat initialized.");
            }
        });

        const handleStreakUpdate = async (isWinner) => {
            if (!user) return; // Guest mode doesn't have streaks
            try {
                const { db } = await import("../firebase");
                const { doc, updateDoc, increment, getDoc } = await import("firebase/firestore");
                const userRef = doc(db, "users", user.uid);

                const userSnap = await getDoc(userRef);
                const currentData = userSnap.data();
                const lastPlayed = currentData?.lastPlayed?.toDate();
                const today = new Date();

                const isNewDay = !lastPlayed ||
                    lastPlayed.getDate() !== today.getDate() ||
                    lastPlayed.getMonth() !== today.getMonth() ||
                    lastPlayed.getFullYear() !== today.getFullYear();

                if (isWinner) {
                    const updates = {
                        lastPlayed: today,
                        points: increment(10) // Always give points for a win
                    };

                    if (isNewDay) {
                        updates.streak = increment(1);
                        toast.success(`DAILY_STREAK_INCREASED: System performance optimized`);
                    } else {
                        toast.success(`VICTORY_CONFIRMED: Points updated`);
                    }

                    await updateDoc(userRef, updates);
                } else {
                    // Only reset streak if it's a new day and they lose.
                    // If they already won today, don't reset the streak on a subsequent loss.
                    if (isNewDay) {
                        await updateDoc(userRef, {
                            streak: 0,
                            lastPlayed: today
                        });
                        toast.error("STREAK_RESET: PERFORMANCE_CRITICAL");
                    }
                }
            } catch (error) {
                console.error("Streak update failed:", error);
            }
        };

        socket.on('error_msg', (msg) => {
            toast.error(msg);
            setIsJoining(false);
        });

        // Auto-create room if in auto mode and no roomId
        if (mode === 'auto' && !paramRoomId && !joined && !isJoining) {
            handleAutoCreate();
        }

        // Auto-join if paramRoomId is provided (from Dashboard or direct link)
        if (paramRoomId && !joined && !isJoining) {
            setIsJoining(true);
            socket.emit('join_room', { roomId: paramRoomId, playerName, customGrid, userId: user?.uid });
        }

        return () => {
            socket.off('room_update');
            socket.off('error_msg');
        };
    }, [mode, paramRoomId]);

    const handleAutoCreate = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(randomId);
        setIsJoining(true);
        socket.emit('join_room', { roomId: randomId, playerName, userId: user?.uid });
    };

    const handleJoinByCode = (e) => {
        e.preventDefault();
        if (roomId) {
            setIsJoining(true);
            socket.emit('join_room', { roomId, playerName, userId: user?.uid });
        }
    };

    const handleMakeMove = (number) => socket.emit('make_move', { roomId, number });
    const handleRestart = () => socket.emit('restart_game', { roomId });

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        toast.success("Room ID copied to clipboard");
    };

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md space-y-4 text-center"
                >
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black cyber-title italic tracking-tighter">JOIN_ROOM</h1>
                        <p className="text-white/30 text-xs font-black tracking-[0.1em] uppercase">Secure Link Establishment</p>
                    </div>

                    <form onSubmit={handleJoinByCode} className="space-y-4">
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            className="w-full bg-white/5 border-b border-white/10 py-4 text-center text-2xl font-black text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-white/5"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isJoining}
                            className="glow-btn disabled:opacity-50 !py-3 !px-8 text-xs"
                        >
                            {isJoining ? "Connecting..." : "Initialize Link"}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 mx-auto text-white/20 text-xs font-black tracking-wider uppercase hover:text-white/60 transition-all"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Abort Operation
                    </button>
                </motion.div>
            </div>
        );
    }

    const me = roomData?.players.find(p => p.id === socket.id);
    const opponent = roomData?.players.find(p => p.id !== socket.id);
    const isMyTurn = roomData?.players[roomData.turnIndex]?.id === socket.id;

    return (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-56px)] p-2 md:p-4 space-y-4 overflow-hidden">
            <header className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-2">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-xl font-black cyber-title uppercase italic leading-none">Combat_Zone</h1>
                    <div
                        onClick={copyRoomId}
                        className="group flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all mt-1"
                    >
                        <span className="text-[10px] font-black tracking-wider text-cyan-400">{roomId}</span>
                        <Copy className="w-1.5 h-1.5 text-white/20 group-hover:text-cyan-400 transition-all" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                        <p className="text-[8px] font-black tracking-wider uppercase text-cyan-500/50 mb-0.5">Operator</p>
                        <span className="text-xs font-black text-cyan-400 italic leading-none">{playerName}</span>
                    </div>

                    <div className={`px-3 py-1 rounded-lg border transition-all ${isMyTurn ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-white/10'}`}>
                        <p className="text-[8px] font-black tracking-wider uppercase text-white/40 mb-0.5">Status</p>
                        <span className={`text-xs font-black tracking-wider ${isMyTurn ? 'text-green-400' : 'text-white/20'}`}>
                            {isMyTurn ? 'YOUR_TURN' : 'WAIT'}
                        </span>
                    </div>

                    {opponent && (
                        <div className="px-3 py-1 rounded-lg bg-magenta-500/10 border border-magenta-500/30">
                            <p className="text-[8px] font-black tracking-wider uppercase text-magenta-500/50 mb-0.5">Target</p>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-magenta-400 italic leading-none">{opponent.name}</span>
                                <div className="flex gap-0.5">
                                    {"BINGO".split('').map((c, i) => (
                                        <div key={i} className={`w-0.5 h-0.5 rounded-full ${i < opponent.bingoCount ? 'bg-magenta-500' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {roomData.gameState === 'waiting' ? (
                <div className="flex flex-col items-center space-y-4 py-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"></div>
                        <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50 animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-xs font-black tracking-[0.05em] text-cyan-500/80 uppercase">Deploying Signal...</p>
                        <p className="text-white/20 text-[10px] font-bold tracking-wider uppercase">Waiting for player 2/2</p>
                    </div>
                </div>
            ) : (
                <main className="flex flex-col items-center w-full max-w-2xl space-y-4 overflow-hidden animate-in fade-in zoom-in duration-700">
                    <BingoBoard
                        grid={me.grid}
                        numbersStruck={roomData.numbersStruck}
                        onNumberClick={handleMakeMove}
                        isMyTurn={isMyTurn}
                        isSelf={true}
                    />

                    <div className="w-full max-w-xl text-center space-y-4">
                        <div className="flex justify-center gap-2 md:gap-4">
                            {"BINGO".split('').map((char, i) => {
                                const isMarked = i < (me.bingoLetters?.length || 0);
                                return (
                                    <div key={i} className="relative group">
                                        <motion.span
                                            animate={isMarked ? {
                                                scale: [1, 1.1, 1],
                                                filter: ["drop-shadow(0 0 0px #00f2ff)", "drop-shadow(0 0 5px #00f2ff)", "drop-shadow(0 0 2px #00f2ff)"]
                                            } : {}}
                                            transition={{ duration: 1, repeat: isMarked ? Infinity : 0, repeatType: "reverse" }}
                                            className={`text-3xl md:text-5xl font-black transition-all duration-700 select-none ${isMarked ? 'text-cyan-400' : 'text-white/5'}`}
                                        >
                                            {char}
                                        </motion.span>
                                        {isMarked && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                className="absolute -bottom-0.5 left-0 h-0.5 bg-cyan-500 shadow-[0_0_5px_#00f2ff]"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-md">
                            <p className="text-[10px] font-black tracking-[0.1em] text-cyan-400 uppercase">System: {me.bingoCount}/5</p>
                        </div>
                    </div>
                </main>
            )}

            <AnimatePresence>
                {roomData.gameState === 'gameOver' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
                    >
                        <div className="max-w-md w-full text-center space-y-12">
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <h2 className={`text-8xl md:text-[10rem] font-black tracking-tighter italic ${roomData.winner === socket.id ? 'text-cyan-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.5)]' : 'text-rose-600 drop-shadow-[0_0_50px_rgba(225,29,72,0.5)]'}`}>
                                    {roomData.winner === socket.id ? 'VICTORY' : 'DEFEAT'}
                                </h2>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <p className="text-white/40 text-xs font-black tracking-[0.1em] uppercase leading-loose">
                                    {roomData.winner === socket.id ? 'LOCAL_NODE_DOMINANCE_CONFIRMED' : 'CRITICAL_SYSTEM_TAKEOVER_DETECTED'}
                                </p>
                            </motion.div>

                            <div className="flex flex-col gap-4">
                                <button onClick={handleRestart} className="group flex items-center justify-center gap-3 w-full py-6 bg-white text-black font-black uppercase tracking-[0.1em] text-xs hover:bg-cyan-400 transition-all rounded-2xl">
                                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-all duration-500" />
                                    Initialize Re_Match
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full py-6 bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-[0.1em] text-xs hover:bg-white/10 hover:text-white transition-all rounded-2xl"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Game;
import { useState, useEffect } from 'react';
import { socket } from './socket';
import BingoBoard from './components/BingoBoard';

function App() {
    const [playerName, setPlayerName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        socket.connect();
        socket.on('room_update', (data) => {
            setRoomData(data);
            setJoined(true);
            setError('');
        });
        socket.on('error_msg', (msg) => setError(msg));
        return () => {
            socket.off('room_update');
            socket.off('error_msg');
        };
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (playerName && roomId) socket.emit('join_room', { roomId, playerName });
    };

    const handleMakeMove = (number) => socket.emit('make_move', { roomId, number });
    const handleRestart = () => socket.emit('restart_game', { roomId });

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-screen animate-in fade-in duration-1000">
                <div className="text-center mb-16 px-4">
                    <h1 className="text-5xl md:text-8xl cyber-title mb-4">BINGO</h1>
                    <p className="text-cyan-500/50 font-black tracking-[1em] text-[10px] uppercase">Node Connection Required</p>
                </div>

                <form onSubmit={handleJoin} className="w-full max-w-md space-y-12 px-8">
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-2xl font-light text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-white/10"
                            placeholder="PLAYER_NAME"
                            required
                        />
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-white/10 py-4 text-center text-2xl font-light text-white focus:outline-none focus:border-magenta-500 transition-all placeholder:text-white/10"
                            placeholder="ROOM_CODE"
                            required
                        />
                    </div>

                    {error && <p className="text-rose-500 text-center text-xs font-black tracking-widest animate-pulse">{error}</p>}

                    <div className="flex justify-center">
                        <button type="submit" className="glow-btn">Start</button>
                    </div>
                </form>
            </div>
        );
    }

    const me = roomData?.players.find(p => p.id === socket.id);
    const opponent = roomData?.players.find(p => p.id !== socket.id);
    const isMyTurn = roomData?.players[roomData.turnIndex]?.id === socket.id;

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen py-20 px-4 space-y-16">
            <header className="text-center space-y-6">
                <h1 className="text-4xl md:text-6xl cyber-title">BINGO</h1>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-widest text-cyan-400">
                        ZONE: {roomId}
                    </div>
                    <div className={`px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-widest ${isMyTurn ? 'text-green-400 active-pulse' : 'text-slate-500'}`}>
                        {isMyTurn ? 'STATE: ACTIVE_MOVE' : 'STATE: STANDBY'}
                    </div>
                    {opponent && (
                        <div className="px-6 py-2 rounded-full border border-magenta-500/30 bg-magenta-500/5 text-[10px] font-black tracking-widest text-magenta-500">
                            TARGET: {opponent.name} [{opponent.bingoLetters || '-'}]
                        </div>
                    )}
                </div>
            </header>

            {roomData.gameState === 'waiting' ? (
                <div className="flex flex-col items-center space-y-8">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                    <p className="text-xs font-black tracking-[0.5em] text-cyan-500 animate-pulse">SEARCHING_FOR_HOSTILES...</p>
                </div>
            ) : (
                <main className="flex flex-col items-center w-full max-w-4xl space-y-16">
                    <BingoBoard
                        grid={me.grid}
                        numbersStruck={roomData.numbersStruck}
                        onNumberClick={handleMakeMove}
                        isMyTurn={isMyTurn}
                        isSelf={true}
                    />

                    <div className="w-full max-w-xl text-center space-y-8">
                        <div className="flex justify-center gap-4">
                            {"BINGO".split('').map((char, i) => {
                                const isMarked = i < (me.bingoLetters?.length || 0);
                                return (
                                    <span key={i} className={`text-5xl md:text-7xl font-black transition-all duration-1000 ${isMarked ? 'text-cyan-500 drop-shadow-[0_0_20px_rgba(0,242,255,0.8)]' : 'text-white/5'}`}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="text-[10px] font-black tracking-[1em] text-white/20 uppercase">Tactical Advantage: {me.bingoCount}/5</div>
                    </div>
                </main>
            )}

            {roomData.gameState === 'gameOver' && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-12">
                        <h2 className={`text-7xl md:text-9xl font-black tracking-tighter ${roomData.winner === socket.id ? 'text-cyan-400' : 'text-rose-600'}`}>
                            {roomData.winner === socket.id ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <p className="text-white/30 text-xs font-black tracking-widest leading-loose">
                            COMMAND_RESULT: {roomData.winner === socket.id ? 'LOCAL_NODE_DOMINANCE' : 'HOSTILE_NODE_TAKEOVER'}
                        </p>
                        <button onClick={handleRestart} className="glow-btn !border-white !text-white hover:!bg-white hover:!text-black">
                            Re_Match
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

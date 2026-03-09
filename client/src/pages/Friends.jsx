import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    User,
    UserPlus,
    Users,
    Check,
    X,
    Copy,
    Clock,
    ShieldCheck,
    Search,
    MessageSquare,
    UserMinus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Friends = () => {
    const { userData, friendRequests, friendsList, sendFriendRequest, respondToFriendRequest } = useAuth();
    const [targetId, setTargetId] = useState("");

    const handleSend = async (e) => {
        e.preventDefault();
        console.log("[Friends] handleSend triggered");
        const cleanId = targetId.trim();
        if (!cleanId.startsWith("BNG-") || cleanId.length < 9) {
            console.warn("[Friends] Validation failed for ID:", cleanId);
            toast.error("INVALID_PROTOCOL: Unique ID must follow BNG-XXXXX standard.");
            return;
        }
        console.log("[Friends] Calling sendFriendRequest with:", cleanId);
        await sendFriendRequest(cleanId);
        console.log("[Friends] handleSend completed, clearing input");
        setTargetId("");
    };

    return (
        <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--glass-bg)] backdrop-blur-3xl border border-[var(--glass-border)] p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-magenta-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                        <Users className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-main)]">Registry_Link</h1>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/5 border border-cyan-500/10 w-fit">
                            <span className="text-[10px] font-black tracking-widest text-[var(--text-muted)] uppercase">My_Node_ID:</span>
                            <span className="text-xs font-black text-cyan-400 font-mono">{userData?.uniqueId}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSend} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative z-10">
                    <div className="relative group flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-cyan-400 transition-colors" />
                        <input
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                            placeholder="TARGET_BNG_ID"
                            className="bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 pl-12 rounded-2xl text-[var(--text-main)] font-black tracking-[0.2em] outline-none focus:border-cyan-500/50 transition-all text-xs w-full sm:w-64"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-8 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Initialize Link
                    </button>
                </form>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Incoming Requests */}
                <section className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Pending_Inbound
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-magenta-500/10 text-magenta-500 text-[10px] font-black">{friendRequests.length}</span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {friendRequests.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 border border-white/5 rounded-3xl text-center space-y-3 bg-white/[0.02]"
                                >
                                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mx-auto opacity-20">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-white/10 tracking-[0.2em] uppercase">No incoming data streams</p>
                                </motion.div>
                            ) : (
                                friendRequests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 rounded-3xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-magenta-500/10 flex items-center justify-center border border-magenta-500/20">
                                                <User className="w-5 h-5 text-magenta-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-rose-500 italic uppercase leading-none mb-1">{req.fromUser?.username}</p>
                                                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{req.fromUser?.uniqueId}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => respondToFriendRequest(req.id, 'accepted')}
                                                className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black transition-all border border-green-500/20 flex items-center justify-center"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => respondToFriendRequest(req.id, 'rejected')}
                                                className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Friend List */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Active_Establishments
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-black">{friendsList.length}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {friendsList.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="sm:col-span-2 p-12 border border-white/5 rounded-[2.5rem] text-center space-y-4 bg-white/[0.02]"
                                >
                                    <div className="w-16 h-16 rounded-3xl border border-white/5 flex items-center justify-center mx-auto opacity-10">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-white/20 tracking-[0.3em] uppercase">Registry Empty</p>
                                        <p className="text-[10px] font-bold text-white/5 uppercase">No authenticated nodes linked</p>
                                    </div>
                                </motion.div>
                            ) : (
                                friendsList.map((friend) => (
                                    <motion.div
                                        key={friend.uid}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group bg-[var(--glass-bg)] border border-[var(--glass-border)] p-6 rounded-[2rem] hover:border-cyan-500/30 transition-all flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-transparent flex items-center justify-center border border-white/5 relative">
                                                <User className="w-6 h-6 text-cyan-400" />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-[var(--text-main)] italic uppercase leading-none mb-1">{friend.username}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{friend.uniqueId}</span>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className="text-[8px] font-black text-cyan-400/40 uppercase tracking-[0.1em]">{friend.points}pts</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-9 h-9 rounded-xl bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/10">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="w-9 h-9 rounded-xl bg-rose-500/5 text-rose-500/40 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-500/10">
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Friends;

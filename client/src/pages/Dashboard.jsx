import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Play, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Dashboard = () => {
    const { user, userData, logout } = useAuth();
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState("");

    const handleModeSelect = (mode) => {
        if (mode === 'manual' && !user) {
            toast.error("IDENTITY_UNKNOWN: Authorization required for Manual Deployment.");
            return;
        }
        navigate(mode === 'manual' ? '/manual-fill' : '/auto-fill');
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (joinCode.length !== 6) {
            toast.error("INVALID_CODE: Room ID must be 6 characters.");
            return;
        }
        navigate(`/game/${joinCode.toUpperCase()}`);
    };

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 h-[calc(100vh-56px)] flex flex-col justify-center overflow-hidden">
            {/* Join Room Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 p-6 rounded-2xl"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                            <span className="text-xs font-black text-cyan-500/50 uppercase tracking-[0.2em]">Active_Operator:</span>
                            <span className="text-sm font-black text-rose-500 uppercase italic">
                                {userData?.username || user?.displayName || "COMMANDER"}
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-[var(--text-main)] tracking-wider uppercase">Join Operation</h3>
                        <p className="text-[var(--text-secondary)] text-xs font-bold tracking-wider uppercase">Enter 6-digit Room ID to link</p>
                    </div>
                    <form onSubmit={handleJoinRoom} className="flex gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="CODE_ID"
                            maxLength={6}
                            className="bg-[var(--input-bg)] border border-[var(--glass-border)] px-4 py-3 rounded-lg text-cyan-400 font-black tracking-[0.1em] text-center outline-none focus:border-cyan-500 transition-all w-full md:w-40 text-base"
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-[var(--text-main)] text-[var(--bg-deep)] font-black uppercase tracking-wider text-xs hover:opacity-80 transition-all shadow-xl whitespace-nowrap"
                        >
                            Join in a Team
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* Game Modes */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Auto Fill Mode */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="group relative overflow-hidden holographic-card p-8 rounded-[32px] space-y-6 flex flex-col justify-between"
                >
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <Play className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">Auto_Fill</h3>
                        <p className="text-[var(--text-secondary)] text-sm font-medium leading-tight">
                            Fast-paced randomized board deployment. No authorization required.
                        </p>
                    </div>
                    <button
                        onClick={() => handleModeSelect('auto')}
                        className="w-full py-4 rounded-xl bg-[var(--text-main)] text-[var(--bg-deep)] font-black uppercase tracking-wider text-xs hover:opacity-80 transition-all shadow-lg group-hover:shadow-cyan-500/40"
                    >
                        Auto Play
                    </button>
                    <div className="absolute top-0 right-0 p-6 text-[var(--text-muted)] select-none pointer-events-none">
                        <span className="text-6xl font-black tracking-tighter opacity-10 uppercase italic">GUEST</span>
                    </div>
                </motion.div>

                {/* Manual Fill Mode */}
                <motion.div
                    whileHover={user ? { y: -5 } : {}}
                    className={`group relative overflow-hidden p-8 rounded-[32px] space-y-6 flex flex-col justify-between border transition-all ${user
                        ? 'holographic-card border-magenta-500/20'
                        : 'bg-[var(--glass-hex)] border-[var(--glass-border)] opacity-50 cursor-not-allowed'
                        }`}
                >
                    <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user ? 'bg-magenta-500/10' : 'bg-[var(--glass-hex)]'}`}>
                            <LayoutGrid className={`w-5 h-5 ${user ? 'text-magenta-400' : 'text-[var(--text-muted)]'}`} />
                        </div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase italic">Manual_Deploy</h3>
                            {!user && <span className="px-2 py-0.5 bg-[var(--glass-hex)] text-[10px] font-black tracking-wider uppercase rounded-full text-[var(--text-secondary)]">Locked</span>}
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm font-medium leading-tight">
                            Strategic board configuration. Requires operator authorization.
                        </p>
                    </div>

                    <button
                        onClick={() => handleModeSelect('manual')}
                        disabled={!user}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs transition-all ${user
                            ? 'bg-[var(--text-main)] text-[var(--bg-deep)] hover:opacity-80 shadow-lg'
                            : 'bg-[var(--glass-hex)] text-[var(--text-muted)]'
                            }`}
                    >
                        Manual Play
                    </button>

                    <div className="absolute top-0 right-0 p-6 text-[var(--text-muted)] select-none pointer-events-none">
                        <span className="text-6xl font-black tracking-tighter opacity-10 uppercase italic">AUTH</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

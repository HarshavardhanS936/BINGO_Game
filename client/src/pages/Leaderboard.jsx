import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Medal, Zap, User, ArrowLeft, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
                const querySnapshot = await getDocs(q);
                const leadersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLeaders(leadersList);
            } catch (error) {
                console.error("Failed to fetch leaders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-12 space-y-12 overflow-y-auto">
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors text-xs font-black uppercase tracking-wider mb-4"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Return to Dashboard
                    </button>
                    <h1 className="text-5xl font-black cyber-title uppercase italic tracking-tighter">Cyber_Rankings</h1>
                    <p className="text-[var(--text-muted)] text-xs font-black tracking-[0.1em] uppercase">Elite Operator Status</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-magenta-500/20 border border-magenta-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.2)] rotate-12">
                    <Trophy className="w-8 h-8 text-magenta-400 -rotate-12" />
                </div>
            </header>

            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                <div className="p-8 space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
                            <p className="text-xs font-black text-cyan-500/50 tracking-wider uppercase">Decryption in progress...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaders.map((leader, index) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={leader.id}
                                    className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${index === 0
                                        ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                        : 'bg-[var(--glass-hex)] border-[var(--glass-border)] hover:border-cyan-500/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 flex items-center justify-center font-black italic text-xl ${index === 0 ? 'text-cyan-400' :
                                            index === 1 ? 'text-[var(--text-main)]' :
                                                index === 2 ? 'text-orange-400' : 'text-[var(--text-muted)]'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${index === 0 ? 'bg-cyan-500/20' : 'bg-[var(--glass-hex)]'}`}>
                                                <User className={`w-5 h-5 ${index === 0 ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-main)] tracking-wider uppercase truncate max-w-[150px] md:max-w-xs px-1">
                                                    {leader.username}
                                                </p>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] tracking-[0.05em] uppercase px-1">Active Combatant</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center gap-3 justify-end">
                                            <span className={`text-2xl font-black ${index === 0 ? 'text-cyan-400' : 'text-magenta-500'}`}>
                                                {leader.points || 0}
                                            </span>
                                            <Zap className={`w-5 h-5 ${index === 0 ? 'text-cyan-400' : 'text-magenta-500'} animate-pulse`} />
                                        </div>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] tracking-wider uppercase">Max_Points (Streak: {leader.streak || 0})</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

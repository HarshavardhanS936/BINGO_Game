import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Users, Zap, Shield, ChevronRight } from "lucide-react";

const Instructions = ({ isOpen, onClose }) => {
    const rules = [
        {
            icon: Target,
            title: "deployment",
            desc: "Select a 5x5 grid. Choose Manual Setup for tactical control or Auto Fill for immediate combat."
        },
        {
            icon: Users,
            title: "neutralization",
            desc: "Take turns with your opponent selecting numbers. When a number is neutralized, it's marked on both boards."
        },
        {
            icon: Zap,
            title: "bingo_os",
            desc: "Complete lines (vertical, horizontal, or diagonal) to strike the letters B-I-N-G-O. First to strike all 5 letters wins."
        },
        {
            icon: Shield,
            title: "streak_sync",
            desc: "Each victory increases your combat streak. Defeat resets your streak to baseline. Maintain dominance."
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
                >
                    {/* Background Detail */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-magenta-500/10 rounded-full blur-[100px]" />

                    <div className="relative space-y-12">
                        <header className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-4xl font-black cyber-title uppercase italic tracking-tighter">Combat_Manual</h2>
                                <p className="text-white/20 text-xs font-black tracking-[0.1em] uppercase">Tactical Operating procedures</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/40 transition-all group"
                            >
                                <X className="w-5 h-5 text-white/30 group-hover:text-rose-500 transition-all" />
                            </button>
                        </header>

                        <div className="grid md:grid-cols-2 gap-8">
                            {rules.map((rule, index) => (
                                <div key={index} className="space-y-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all shadow-xl shadow-black">
                                            <rule.icon className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <h3 className="text-xs font-black text-white italic tracking-wider uppercase group-hover:text-cyan-400 transition-all">{rule.title}</h3>
                                    </div>
                                    <p className="text-white/40 text-sm uppercase font-bold tracking-wider leading-relaxed">
                                        {rule.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <button
                                onClick={onClose}
                                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.1em] text-xs hover:bg-cyan-400 transition-all shadow-xl flex items-center justify-center gap-2"
                            >Back to Home
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Instructions;

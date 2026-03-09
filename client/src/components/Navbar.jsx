import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Instructions from "./Instructions";
import {
    LogOut,
    LogIn,
    ShieldAlert,
    Home,
    Users,
    Globe,
    UserPlus,
    Trophy,
    HelpCircle,
    Flame,
    Zap,
    User,
    ChevronRight,
    Edit2,
    Menu,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Navbar = () => {
    const { user, userData, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const navLinks = [
        { name: "Home", path: "/dashboard", icon: Home },
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
        { name: "Friends", path: "/friends", icon: Users },
    ];

    const handleDisabledClick = (e, name) => {
        if (name === "Friends") {
            e.preventDefault();
            toast.success(`${name.toUpperCase()}_SYSTEM: Initialization pending in future update.`);
        }
    };

    return (
        <nav className="w-full bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] sticky top-0 z-[100] px-4 md:px-8">
            <div className="max-w-7xl mx-auto h-12 flex items-center justify-between gap-2">
                {/* Logo Section */}
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)] group-hover:bg-cyan-500/40 transition-all">
                            <ShieldAlert className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                            <span className="text-sm font-black text-[var(--text-main)] leading-none tracking-tighter italic uppercase group-hover:text-cyan-400 transition-all">
                                Bingo_os
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={(e) => link.disabled && handleDisabledClick(e, link.name)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isActive
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-hex)] border border-transparent'
                                        } ${link.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.name}
                                </Link>
                            );
                        })}

                        {/* Instructions Trigger */}
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-hex)] border border-transparent transition-all"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Help
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl holographic-card border-[var(--glass-border)] shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-[var(--text-muted)] tracking-wider uppercase mb-0.5">Points</p>
                                        <p className="text-xs font-black text-[var(--neon-cyan)] drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                            {userData?.points || 0}
                                        </p>
                                    </div>
                                    <Zap className="w-5 h-5 text-[var(--neon-cyan)] animate-pulse" />
                                </div>

                                <div className="w-px h-8 bg-[var(--glass-border)]" />

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-[var(--text-muted)] tracking-wider uppercase mb-0.5">Streak</p>
                                        <p className="text-xs font-black text-[var(--neon-magenta)] drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                                            {userData?.streak || 0}
                                        </p>
                                    </div>
                                    <Flame className="w-5 h-5 text-[var(--neon-magenta)] fill-[var(--neon-magenta)] animate-pulse" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="hidden sm:block text-lg font-black text-rose-500 italic tracking-tighter">
                                    {userData?.username || user?.displayName || user?.phoneNumber || "COMMANDER"}
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfile(!showProfile)}
                                        className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/20 transition-all group shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-cyan-500/20"
                                    >
                                        <User className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    </button>

                                    <AnimatePresence>
                                        {showProfile && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowProfile(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                                                    className="absolute right-0 mt-4 w-64 bg-[var(--glass-bg)] backdrop-blur-3xl border border-[var(--glass-border)] rounded-2xl p-6 shadow-2xl z-50 space-y-6 overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                                                    <div className="space-y-4 relative">
                                                        <div className="space-y-1">
                                                            <h3 className="text-lg font-black text-rose-500 uppercase truncate">
                                                                {userData?.username || user?.displayName || user?.phoneNumber || "Commander"}
                                                            </h3>
                                                            <div className="flex flex-col gap-2 mt-1">
                                                                <div className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                                                                    <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase">
                                                                        ID: {userData?.uniqueId || "INITIALIZING..."}
                                                                    </span>
                                                                </div>
                                                                <Link
                                                                    to="/profile"
                                                                    onClick={() => setShowProfile(false)}
                                                                    className="flex items-center gap-2 text-xs font-black text-cyan-400/60 hover:text-cyan-400 uppercase tracking-[0.1em] transition-colors"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                    Manage Registry
                                                                </Link>
                                                            </div>
                                                        </div>

                                                        <div className="h-px w-full bg-[var(--glass-border)]" />

                                                        <button
                                                            onClick={() => {
                                                                logout();
                                                                setShowProfile(false);
                                                            }}
                                                            className="group flex items-center justify-between w-full p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                                                                    <LogOut className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-rose-500 tracking-[0.1em] uppercase">Terminate</span>
                                                            </div>
                                                            <ChevronRight className="w-3 h-3 text-rose-500/30 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login', { state: { mode: 'login' } })}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-black uppercase tracking-wider text-[10px] hover:bg-cyan-400 transition-all shadow-xl"
                            >
                                <LogIn className="w-4 h-4" />
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 text-black font-black uppercase tracking-wider text-[10px] hover:bg-white transition-all shadow-cyan-500/20 shadow-lg"
                            >
                                <UserPlus className="w-4 h-4" />
                                Signup
                            </button>
                        </div>
                    )}

                    {/* Hamburger Button — mobile only */}
                    <button
                        onClick={() => setShowMenu(prev => !prev)}
                        className="lg:hidden w-9 h-9 rounded-xl bg-[var(--glass-hex)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                    >
                        {showMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="lg:hidden overflow-hidden border-t border-[var(--glass-border)]"
                    >
                        <div className="py-3 px-2 flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={(e) => {
                                            if (link.disabled) handleDisabledClick(e, link.name);
                                            setShowMenu(false);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isActive
                                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-hex)] border border-transparent'
                                            } ${link.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}

                            <button
                                onClick={() => { setShowInstructions(true); setShowMenu(false); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--glass-hex)] border border-transparent transition-all"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Help
                            </button>

                            {/* Mobile auth buttons if not logged in */}
                            {!user && (
                                <div className="flex gap-2 mt-2 px-2">
                                    <button
                                        onClick={() => { navigate('/login', { state: { mode: 'login' } }); setShowMenu(false); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-black uppercase tracking-wider text-[10px] hover:bg-cyan-400 transition-all"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </button>
                                    <button
                                        onClick={() => { navigate('/login', { state: { mode: 'signup' } }); setShowMenu(false); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-black font-black uppercase tracking-wider text-[10px] hover:bg-white transition-all"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Signup
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions Modal */}
            <Instructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
        </nav>
    );
};

export default Navbar;

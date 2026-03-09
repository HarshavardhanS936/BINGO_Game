import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Phone,
    ShieldCheck,
    Chrome,
    ArrowRight,
    ChevronLeft,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Login = () => {
    const {
        googleSignIn,
        setupRecaptcha,
        phoneSignIn,
        updateUsername,
        registerWithEmail,
        loginWithEmail
    } = useAuth();

    const [authMode, setAuthMode] = useState('login');
    const [flow, setFlow] = useState('main');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [newUsername, setNewUsername] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setupRecaptcha("recaptcha-container");
        if (location.state?.mode) {
            setAuthMode(location.state.mode);
        }
    }, [location.state]);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await googleSignIn();
            toast.success("Identity Authorized.");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Google Auth Failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        try {
            setLoading(true);
            if (authMode === 'signup') {
                if (!newUsername.trim()) {
                    toast.error("Callsign Required.");
                    return;
                }
                await registerWithEmail(newUsername.trim(), email, password);
                toast.success("Account Initialized.");
                navigate("/dashboard");
            } else {
                await loginWithEmail(email, password);
                toast.success("Welcome back, Commander.");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message.replace("Firebase: ", ""));
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const cleanedNumber = phoneNumber.replace(/[\s-]/g, "");
        if (!cleanedNumber.startsWith("+")) {
            toast.error("Format error: Use +[CountryCode]");
            return;
        }
        try {
            setLoading(true);
            const result = await phoneSignIn(cleanedNumber);
            setConfirmationResult(result);
            toast.success("Code transmitted.");
        } catch (error) {
            console.error(error);
            toast.error("Auth Failure: Check Firebase settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await confirmationResult.confirm(otp);
            toast.success("Verification Complete.");
            setFlow('name');
        } catch (error) {
            console.error(error);
            toast.error("Invalid Code.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!newUsername.trim()) return;
        try {
            setLoading(true);
            await updateUsername(newUsername.trim());
            toast.success("Profile Synchronized.");
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Update Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-black/60 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-magenta-500 rounded-2xl flex items-center justify-center mb-4 transform rotate-12">
                        <Globe className="w-10 h-10 text-white -rotate-12" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic">Bingo_os</h1>
                </div>

                <AnimatePresence mode="wait">
                    {flow === 'main' && (
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="space-y-3">
                                    {authMode === 'signup' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="relative group"
                                        >
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                placeholder="Operator Name / Callsign"
                                                className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-cyan-500/50 transition-all text-sm"
                                                required={authMode === 'signup'}
                                            />
                                        </motion.div>
                                    )}
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="E-mail Address"
                                            className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-cyan-500/50 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-magenta-400 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-magenta-500/50 transition-all text-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all shadow-xl"
                                >
                                    {loading ? "Initializing..." : (authMode === 'login' ? "Sign In" : "Register")}
                                </button>
                            </form>

                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest px-1">
                                <button className="text-white/30 hover:text-white transition-colors">Forgot Password?</button>
                                <button
                                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                    className="text-cyan-400 hover:text-white transition-colors"
                                >
                                    {authMode === 'login' ? "Sign Up" : "Back to Login"}
                                </button>
                            </div>

                            <div className="relative py-4 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <span className="relative bg-black px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Signin Through</span>
                            </div>

                            <div className="flex justify-center gap-6">
                                <button onClick={handleGoogleSignIn} className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                    <Chrome className="w-5 h-5" />
                                </button>
                                <button onClick={() => setFlow('phone')} className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/5 flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-400 transition-all">
                                    <Phone className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="pt-4 text-center">
                                <button
                                    onClick={() => navigate("/auto-fill")}
                                    className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] hover:text-white/40 transition-colors"
                                >
                                    Play as a Guest
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {flow === 'phone' && (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <form onSubmit={!confirmationResult ? handleSendOtp : handleVerifyOtp} className="space-y-4">
                                <div className="space-y-3">
                                    {!confirmationResult ? (
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="+[Country] Number"
                                                className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-magenta-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="6-Digit Terminal Code"
                                                className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-magenta-500 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-all shadow-xl"
                                >
                                    {loading ? "Verifying..." : (confirmationResult ? "Authorize" : "Request Code")}
                                </button>
                            </form>
                            <button onClick={() => setFlow('main')} className="w-full text-xs font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                                Back to Login
                            </button>
                        </motion.div>
                    )}

                    {flow === 'name' && (
                        <motion.div
                            key="name"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <form onSubmit={handleUpdateName} className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Initialize Callsign"
                                        className="w-full bg-white/[0.03] border border-white/5 py-4 px-12 rounded-2xl text-white outline-none focus:border-cyan-500 transition-all text-sm font-bold"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl"
                                >
                                    {loading ? "Activating..." : "Sync Profile"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div id="recaptcha-container"></div>
            </motion.div>
        </div>
    );
};

export default Login;

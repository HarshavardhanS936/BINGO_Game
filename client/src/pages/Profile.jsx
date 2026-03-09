import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
    User,
    Mail,
    Phone,
    Shield,
    Globe,
    Moon,
    Sun,
    UserPlus,
    Save,
    Edit2,
    Check,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Profile = () => {
    const { userData, updateProfile, sendFriendRequest } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phoneNumber: "",
        theme: "dark",
        language: "en"
    });

    const [friendId, setFriendId] = useState("");

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || "",
                email: userData.email || "",
                phoneNumber: userData.phoneNumber || "",
                theme: userData.theme || "dark",
                language: userData.language || "en"
            });
        }
    }, [userData]);

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            setIsEditing(false);
            toast.success("PROFILE_SYNC: Data successfully uploaded.");
        } catch (error) {
            toast.error("SYNC_ERROR: Failed to update profile.");
        }
    };

    const handleThemeChange = async (newTheme) => {
        setFormData({ ...formData, theme: newTheme });
        if (isEditing) {
            // Update profile immediately for live preview
            await updateProfile({ ...userData, theme: newTheme });
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        const cleanId = friendId.trim();
        if (!cleanId.startsWith("BNG-") || cleanId.length < 9) {
            toast.error("INVALID_ID: Unique ID must follow BNG-XXXXX standard.");
            return;
        }
        await sendFriendRequest(cleanId);
        setFriendId("");
    };

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Header / Avatar Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-8 rounded-[2.5rem] overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-magenta-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
                            <User className="w-16 h-16 text-cyan-400" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Edit2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-green-500 border-4 border-black" />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                {userData?.username || "Commander"}
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-black text-cyan-400 tracking-widest uppercase">
                                Operator
                            </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                            <p className="text-sm font-mono text-[var(--text-secondary)] tracking-[0.2em]">
                                UID: <span className="text-cyan-400/80">{userData?.uniqueId}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${isEditing
                            ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-white text-black hover:bg-cyan-400'
                            }`}
                    >
                        {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? "Synchronize" : "Modify Profile"}
                    </button>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Data Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-8 rounded-[2.5rem] space-y-6"
                >
                    <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Basic_Information
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Callsign</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    disabled={!isEditing}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 pl-12 rounded-2xl text-[var(--text-main)] font-bold outline-none focus:border-cyan-500/50 disabled:opacity-50 transition-all"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email_Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    disabled={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 pl-12 rounded-2xl text-[var(--text-main)] font-bold outline-none focus:border-cyan-500/50 disabled:opacity-50 transition-all"
                                    placeholder="Add email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Communication_Line</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    disabled={!isEditing}
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 pl-12 rounded-2xl text-[var(--text-main)] font-bold outline-none focus:border-cyan-500/50 disabled:opacity-50 transition-all"
                                    placeholder="Add phone number"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings & Social Section */}
                <div className="space-y-8">
                    {/* Theme & Language */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] p-8 rounded-[2.5rem] space-y-6"
                    >
                        <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> System_Configurations
                        </h3>

                        <div className="flex gap-4">
                            <button
                                onClick={() => isEditing && handleThemeChange('dark')}
                                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${formData.theme === 'dark'
                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                                    : 'bg-[var(--glass-hex)] border-[var(--glass-border)] text-[var(--text-muted)]'
                                    } ${!isEditing && 'cursor-default'}`}
                            >
                                <Moon className="w-6 h-6" />
                                <span className="text-xs font-black uppercase tracking-widest">Dark_Mode</span>
                            </button>
                            <button
                                onClick={() => isEditing && handleThemeChange('light')}
                                className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${formData.theme === 'light'
                                    ? 'bg-white text-black border-white'
                                    : 'bg-[var(--glass-hex)] border-[var(--glass-border)] text-[var(--text-muted)]'
                                    } ${!isEditing && 'cursor-default'}`}
                            >
                                <Sun className="w-6 h-6" />
                                <span className="text-xs font-black uppercase tracking-widest">White_Ops</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Linguistic_Module</label>
                            <select
                                disabled={!isEditing}
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 rounded-2xl text-[var(--text-main)] font-bold outline-none focus:border-cyan-500/50 disabled:opacity-50 appearance-none"
                            >
                                <option value="en">English (US)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Social Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-magenta-500/5 backdrop-blur-xl border border-magenta-500/10 p-8 rounded-[2.5rem] space-y-6"
                    >
                        <h3 className="text-sm font-black text-magenta-500/40 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                            <UserPlus className="w-3 h-3" /> Online_Social_Link
                        </h3>

                        <form onSubmit={handleSendRequest} className="flex gap-3">
                            <input
                                value={friendId}
                                onChange={(e) => setFriendId(e.target.value.toUpperCase())}
                                placeholder="BNG-XXXXX"
                                className="flex-1 bg-[var(--input-bg)] border border-[var(--glass-border)] p-4 rounded-2xl text-magenta-400 font-black tracking-widest outline-none focus:border-magenta-500/50 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                className="px-6 py-4 rounded-2xl bg-magenta-500 text-white font-black uppercase tracking-widest text-xs hover:bg-magenta-400 transition-all shadow-lg"
                            >
                                Link
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

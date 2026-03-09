import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { ChevronLeft, Save, AlertCircle, Hash } from "lucide-react";
import { motion } from "framer-motion";

const ManualBoard = () => {
    const { user, userData } = useAuth();
    const navigate = useNavigate();
    const [grid, setGrid] = useState(Array(25).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (index, value) => {
        const newGrid = [...grid];
        // Only allow numbers 1-25
        if (value === "" || (Number(value) >= 1 && Number(value) <= 25)) {
            newGrid[index] = value;
            setGrid(newGrid);
        }
    };

    const validateGrid = () => {
        const numbers = grid.map(n => Number(n)).filter(n => n !== 0);
        if (numbers.length < 25) {
            toast.error("Please fill all nodes in the grid.");
            return false;
        }
        const uniqueNumbers = new Set(numbers);
        if (uniqueNumbers.size < 25) {
            toast.error("Duplicate coordinates detected. Each node must be unique (1-25).");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateGrid()) return;

        const matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(grid.slice(i * 5, (i + 1) * 5).map(Number));
        }

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        toast.success("Tactical board deployed! Opening room.");
        // Pass the custom grid in state to Game.jsx
        navigate(`/game/${roomId}`, { state: { customGrid: matrix } });
    };

    const fillRandomly = () => {
        const nums = Array.from({ length: 25 }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        setGrid(nums.map(String));
    };

    return (
        <div className="h-[calc(100vh-56px)] p-2 md:p-4 space-y-4 max-w-md mx-auto flex flex-col items-center justify-center overflow-hidden">
            <header className="w-full flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black cyber-title uppercase italic">Manual_Setup</h1>
                    <p className="text-white/30 text-xs font-black tracking-wider uppercase">Configure tactical grid</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                    >
                        <ChevronLeft className="w-2.5 h-2.5" />
                        Abort
                    </button>
                    <button
                        onClick={fillRandomly}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all text-[10px] font-black uppercase tracking-wider"
                    >
                        <Hash className="w-2.5 h-2.5" />
                        AutoFill
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="w-full space-y-3">
                <div className="grid grid-cols-5 gap-1 p-2 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl">
                    {grid.map((val, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="aspect-square relative"
                        >
                            <input
                                type="number"
                                value={val}
                                onChange={(e) => handleInputChange(idx, e.target.value)}
                                className="w-full h-full bg-white/5 border border-white/5 text-center text-base font-black text-white rounded-lg focus:outline-none focus:border-magenta-500 focus:bg-magenta-500/5 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="-"
                                required
                            />
                            <span className="absolute top-0.5 left-1 text-[8px] font-black text-white/10 select-none">{idx + 1}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-magenta-500/5 border border-magenta-500/10 p-2.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-magenta-500 shrink-0" />
                    <div>
                        <p className="text-white/80 text-xs font-black tracking-wider uppercase italic leading-none">Validator</p>
                        <p className="text-white/30 text-[10px] font-medium leading-none mt-0.5">
                            Unique integers 1-25 required.
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full glow-btn flex items-center justify-center gap-2 group !py-3 !rounded-lg !text-xs"
                >
                    <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    Deploy Tactical Grid
                </button>
            </form>
        </div>
    );
};

export default ManualBoard;

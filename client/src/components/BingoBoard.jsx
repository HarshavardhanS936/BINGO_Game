import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const BingoBoard = ({ grid, numbersStruck, onNumberClick, isMyTurn, isSelf }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-all duration-1000 ${isMyTurn && isSelf ? 'scale-105' : 'scale-100'}`}
        >
            <div
                className="grid gap-1.5 md:gap-2 p-3 md:p-4 liquid-card relative overflow-hidden"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    width: 'fit-content'
                }}
            >
                {/* Internal HUD Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-cyan-500"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-cyan-500"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-cyan-500"></div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-cyan-500"></div>
                </div>

                {grid.flat().map((num, idx) => {
                    const isStruck = numbersStruck.includes(num);
                    return (
                        <motion.button
                            key={idx}
                            whileHover={isMyTurn && isSelf && !isStruck ? { scale: 1.1, translateZ: "20px" } : {}}
                            whileTap={isMyTurn && isSelf && !isStruck ? { scale: 0.9 } : {}}
                            disabled={!isMyTurn || isStruck || !isSelf}
                            onClick={() => onNumberClick(num)}
                            className={`
                w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all duration-500 relative group
                ${isStruck
                                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.8)]'
                                    : isMyTurn && isSelf
                                        ? 'bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-white/10'
                                        : 'bg-white/2 opacity-20 cursor-not-allowed border border-white/5'
                                }
              `}
                        >
                            <span className={`text-sm md:text-xl font-black transition-all ${isStruck ? 'scale-110' : ''}`}>
                                {isStruck || isSelf ? num : '?'}
                            </span>

                            {isStruck && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [1, 1.5, 2], opacity: [1, 0.5, 0] }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0 border-2 border-cyan-500 rounded-lg"
                                    />
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [1, 1.8, 2.5], opacity: [0.8, 0.3, 0] }}
                                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                                        className="absolute inset-0 border-4 border-cyan-400/30 rounded-lg blur-sm"
                                    />
                                </>
                            )}

                            {/* Decorative HUD Corner */}
                            {isMyTurn && isSelf && !isStruck && (
                                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-500 opacity-50 group-hover:opacity-100"></div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default BingoBoard;

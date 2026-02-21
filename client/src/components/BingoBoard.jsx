import React from 'react';

const BingoBoard = ({ grid, numbersStruck, onNumberClick, isMyTurn, isSelf }) => {
    return (
        <div className={`transition-all duration-1000 ${isMyTurn && isSelf ? 'scale-105' : 'scale-100'}`}>
            <div
                className="grid gap-4 p-8 liquid-card"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    width: 'fit-content'
                }}
            >
                {grid.flat().map((num, idx) => {
                    const isStruck = numbersStruck.includes(num);
                    return (
                        <button
                            key={idx}
                            disabled={!isMyTurn || isStruck || !isSelf}
                            onClick={() => onNumberClick(num)}
                            className={`
                w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-2xl transition-all duration-500 relative group
                ${isStruck
                                    ? 'bg-cyan-500 text-black shadow-[0_0_30px_rgba(0,242,255,0.6)]'
                                    : isMyTurn && isSelf
                                        ? 'bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-white/10 hover:-translate-y-2'
                                        : 'bg-white/2 opacity-20 cursor-not-allowed border border-white/5'
                                }
              `}
                        >
                            <span className={`text-xl md:text-3xl font-black transition-all ${isStruck ? 'scale-110' : ''}`}>
                                {isStruck || isSelf ? num : '?'}
                            </span>

                            {/* Decorative HUD Corner */}
                            {isMyTurn && isSelf && !isStruck && (
                                <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-500 opacity-50 group-hover:opacity-100"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BingoBoard;

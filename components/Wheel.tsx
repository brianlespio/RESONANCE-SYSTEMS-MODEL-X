import React, { useState } from 'react';

interface WheelProps {
    label: string;
    type?: 'pitch' | 'mod';
}

export const Wheel: React.FC<WheelProps> = ({ label, type = 'mod' }) => {
    const [value, setValue] = useState(50);
    
    const handleMove = (e: React.MouseEvent) => {
        if (e.buttons !== 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const h = rect.height;
        const val = 100 - ((y / h) * 100);
        setValue(Math.min(100, Math.max(0, val)));
    };

    const handleUp = () => {
        if (type === 'pitch') setValue(50);
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div 
                className="w-8 h-20 bg-[#0a0a0a] rounded border border-neutral-700 shadow-inner relative overflow-hidden group cursor-ns-resize"
                onMouseMove={handleMove}
                onMouseDown={handleMove}
                onMouseUp={handleUp}
                onMouseLeave={handleUp}
            >
                <div 
                    className="absolute left-[2px] right-[2px] bg-neutral-800 rounded-[1px] shadow-[inset_0_0_5px_rgba(0,0,0,1)] transition-transform duration-75"
                    style={{ 
                        top: '5%', bottom: '5%',
                        transform: `translateY(${(50 - value) * 0.8}%)` 
                    }}
                >
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-full h-[1px] bg-black/50 mb-2 mt-0.5 shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none"></div>
            </div>
            <span className="text-[8px] font-mono font-bold text-neutral-500">{label}</span>
        </div>
    );
};
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Switch } from './Switch';

interface MixerProps {
    levels: { osc1: number, osc2: number, osc3: number, sub: number, noise: number };
    onUpdate: (channel: string, val: number) => void;
    mutes: Record<string, boolean>;
    onMute: (channel: string) => void;
}

const Fader: React.FC<{ label: string; value: number; id: string; color?: string; onUpdate: (val: number) => void; }> = ({ 
    label, value, id, color = 'amber', onUpdate 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    
    // Use refs for drag state to avoid closure staleness and excessive re-renders
    const dragStartRef = useRef<{ y: number, val: number } | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const onUpdateRef = useRef(onUpdate);

    // Keep onUpdate ref current so event listeners don't need to re-bind
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    // --- Metrics Helper ---
    const getMetrics = () => {
        if (!trackRef.current) return null;
        const rect = trackRef.current.getBoundingClientRect();
        // Travel area is top-2 (8px) to bottom-2 (8px). 
        // Total padding = 16px. 
        // The center of the thumb travels this full distance.
        const travelHeight = rect.height - 16; 
        return { rect, travelHeight: Math.max(travelHeight, 1) };
    };

    // --- Thumb Handler (Relative Drag) ---
    const handleThumbMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); 
        setIsDragging(true);
        dragStartRef.current = { y: e.clientY, val: value };
        document.body.style.cursor = 'ns-resize';
    };

    // --- Track Handler (Jump + Drag) ---
    const handleTrackMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        
        const metrics = getMetrics();
        if (!metrics) return;

        // Calculate click position relative to value 0 (bottom of travel area)
        // Travel area bottom is at rect.bottom - 8px
        const trackBottom = metrics.rect.bottom - 8;
        const clickY = e.clientY;
        const distFromBottom = trackBottom - clickY;
        
        const pct = (distFromBottom / metrics.travelHeight) * 100;
        const clamped = Math.min(Math.max(pct, 0), 100);
        
        onUpdateRef.current(Math.round(clamped));
        setIsDragging(true);
        // Set drag start to this new position so subsequent drags are relative to it
        dragStartRef.current = { y: e.clientY, val: clamped };
        document.body.style.cursor = 'ns-resize';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragStartRef.current) return;

        const metrics = getMetrics();
        if (!metrics) return;

        const deltaY = dragStartRef.current.y - e.clientY; // Positive = Up
        const deltaVal = (deltaY / metrics.travelHeight) * 100;

        const newVal = Math.min(Math.max(dragStartRef.current.val + deltaVal, 0), 100);
        onUpdateRef.current(Math.round(newVal));
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.body.style.cursor = 'default';
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div 
            ref={trackRef} 
            className="flex-1 w-full bg-black/40 rounded-[2px] border border-neutral-800 relative py-2 select-none min-h-0 cursor-pointer" 
            onMouseDown={handleTrackMouseDown}
        >
            {/* Center Line Track */}
            <div className="absolute top-2 bottom-2 left-1/2 w-[1px] bg-neutral-800 -translate-x-1/2"></div>
            
            {/* Travel Area */}
            <div className="absolute top-2 bottom-2 left-0 right-0 pointer-events-none">
                {/* Thumb - Draggable */}
                <div 
                    className={`absolute left-1 right-1 h-3 bg-gradient-to-t from-neutral-500 to-neutral-300 rounded-[1px] shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-neutral-400 z-10 group pointer-events-auto ${isDragging ? 'brightness-110' : ''}`}
                    style={{ bottom: `${value}%`, transform: `translateY(50%)` }}
                    onMouseDown={handleThumbMouseDown}
                >
                     {/* Thumb Line */}
                    <div className={`w-full h-[1px] mt-[5px] ${color === 'indigo' ? 'bg-indigo-400' : color === 'white' ? 'bg-white' : 'bg-amber-500'} shadow-[0_0_2px_currentColor] opacity-90`}></div>
                </div>
            </div>
        </div>
    );
};

export const Mixer: React.FC<MixerProps> = ({ levels, onUpdate, mutes, onMute }) => {
    
    const Channel = ({ label, value, id, color = 'amber' }: { label: string, value: number, id: string, color?: string }) => (
        <div className="flex flex-col items-center h-full gap-0.5 flex-1 min-w-[30px] min-h-0">
            {/* Track Container with Logic */}
            <Fader label={label} value={value} id={id} color={color} onUpdate={(val) => onUpdate(id, val)} />
            
            <div className="scale-90 origin-bottom pt-1">
                 <Switch label="" value={!mutes[id]} onChange={() => onMute(id)} vertical={false} />
            </div>
            <span className="text-[6px] font-mono font-bold text-neutral-500">{label}</span>
        </div>
    );

    return (
        <div className="bg-neutral-800/20 rounded-sm p-1.5 border border-neutral-800 shadow-inner flex flex-col h-full">
            <h3 className="text-[8px] font-bold text-neutral-400 tracking-widest mb-1 border-b border-neutral-700/50 pb-0.5 text-center">MIXER</h3>
            <div className="flex justify-between items-end flex-1 gap-1 min-h-0 pb-1">
                <Channel label="OSC1" id="osc1" value={levels.osc1} />
                <Channel label="OSC2" id="osc2" value={levels.osc2} />
                <Channel label="OSC3" id="osc3" value={levels.osc3} />
                <Channel label="SUB" id="sub" value={levels.sub} color="indigo" />
                <Channel label="NOISE" id="noise" value={levels.noise} color="white" />
            </div>
        </div>
    );
};
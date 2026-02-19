import React, { useState } from 'react';

interface KeyboardProps {
    onNoteOn?: (note: number) => void;
    onNoteOff?: (note: number) => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onNoteOn, onNoteOff }) => {
  const keys = Array.from({ length: 29 }, (_, i) => i);
  const isBlack = (i: number) => {
    const indexInOctave = i % 12;
    const notes = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'];
    return notes[indexInOctave].includes('#');
  };
  
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const handleNoteOn = (note: number) => {
    setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(note);
        return next;
    });
    if (onNoteOn) onNoteOn(note);
  };

  const handleNoteOff = (note: number) => {
    setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
    });
    if (onNoteOff) onNoteOff(note);
  };

  const handleMouseEnter = (e: React.MouseEvent, note: number) => {
      if (e.buttons === 1) { 
          handleNoteOn(note);
      }
  };

  const handleMouseLeave = (note: number) => {
      if (activeKeys.has(note)) {
        handleNoteOff(note);
      }
  };

  return (
    <div 
        className="h-28 flex bg-[#0d0d0d] rounded-b border-t-4 border-[#1a1a1a] relative select-none shadow-lg overflow-hidden"
        onMouseLeave={() => {
            // Stop all active keys when leaving the keyboard area
            activeKeys.forEach(k => handleNoteOff(k));
        }} 
    >
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-900 z-10 shadow-inner"></div>

        {keys.map((k) => {
            const black = isBlack(k);
            if (black) return null;
            const isActive = activeKeys.has(k);
            return (
                <div 
                    key={k}
                    onMouseDown={() => handleNoteOn(k)}
                    onMouseUp={() => handleNoteOff(k)}
                    onMouseEnter={(e) => handleMouseEnter(e, k)}
                    onMouseLeave={() => handleMouseLeave(k)}
                    className={`
                        relative flex-1 border-r border-neutral-400 rounded-b-[2px] 
                        transition-colors duration-75 origin-top
                        ${isActive ? 'bg-neutral-300 shadow-inner scale-[0.99]' : 'bg-ivory white shadow-[inset_0_-2px_5px_rgba(0,0,0,0.1)]'}
                    `}
                    style={{ backgroundColor: isActive ? '#d1d1d1' : '#fffff0' }}
                ></div>
            );
        })}

        {keys.map((k, i) => {
             if (!isBlack(k)) return null;
             let whiteKeysBefore = 0;
             for(let j=0; j<k; j++) { if(!isBlack(j)) whiteKeysBefore++; }
             const isActive = activeKeys.has(k);
             return (
                <div 
                    key={k}
                    onMouseDown={() => handleNoteOn(k)}
                    onMouseUp={() => handleNoteOff(k)}
                    onMouseEnter={(e) => handleMouseEnter(e, k)}
                    onMouseLeave={() => handleMouseLeave(k)}
                    className={`
                        absolute h-[60%] w-[3.5%] z-20 rounded-b-[2px] border-x border-b border-black
                        transition-transform duration-75 origin-top
                        ${isActive ? 'bg-neutral-800 scale-[0.98]' : 'bg-black shadow-[1px_1px_3px_rgba(0,0,0,0.5)]'}
                    `}
                    style={{ left: `calc(${(whiteKeysBefore * (100 / 17))}% - 1.75%)` }}
                >
                    <div className="absolute bottom-1 left-0 right-0 h-4 bg-neutral-800/50 rounded-b opacity-50 pointer-events-none"></div>
                </div>
             );
        })}
    </div>
  );
};
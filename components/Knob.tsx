import React, { useState, useRef, useCallback, useEffect } from 'react';
import { KnobProps } from '../types';

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  size = 'md',
  color = 'silver',
  formatValue
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(value);

  // Reducción drástica de tamaños (~50% visual weight)
  const sizeClasses = {
    sm: 'w-7 h-7',   // Antes w-10
    md: 'w-10 h-10', // Antes w-14
    lg: 'w-14 h-14', // Antes w-20
  };

  const indicatorSize = {
    sm: 'h-0.5 w-0.5',
    md: 'h-1 w-1',
    lg: 'h-1.5 w-1.5',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
    document.body.style.cursor = 'ns-resize';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || startYRef.current === null) return;

    const deltaY = startYRef.current - e.clientY;
    const range = max - min;
    const sensitivity = 200;
    const deltaValue = (deltaY / sensitivity) * range;
    
    let newValue = startValueRef.current + deltaValue;
    if (step) newValue = Math.round(newValue / step) * step;
    newValue = Math.min(Math.max(newValue, min), max);
    onChange(newValue);
  }, [isDragging, min, max, onChange, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    startYRef.current = null;
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

  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);

  const knobColorClass = color === 'gold' 
    ? 'bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-900' 
    : color === 'black'
    ? 'bg-gradient-to-b from-neutral-700 to-neutral-900 border-neutral-950'
    : 'bg-gradient-to-b from-slate-200 to-slate-400 border-slate-500';

  const indicatorColor = color === 'black' ? 'bg-white' : 'bg-black';

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div 
        className={`relative rounded-full shadow-md border-b-2 active:translate-y-[1px] transition-all cursor-ns-resize ${sizeClasses[size]} ${knobColorClass}`}
        onMouseDown={handleMouseDown}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className={`absolute top-[15%] left-1/2 -translate-x-1/2 rounded-full shadow-sm ${indicatorColor} ${indicatorSize[size]}`} />
      </div>
      <div className="text-center leading-none">
        <div className="text-[8px] font-mono font-bold text-neutral-400 tracking-wider uppercase mb-[1px]">{label}</div>
        <div className="text-[7px] font-mono text-neutral-500">
            {formatValue ? formatValue(value) : value.toFixed(step < 1 ? 2 : 0)}
        </div>
      </div>
    </div>
  );
};
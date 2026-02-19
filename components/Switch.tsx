import React from 'react';
import { SwitchProps } from '../types';

export const Switch: React.FC<SwitchProps> = ({ label, value, onChange, vertical = true }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div 
        className={`relative cursor-pointer bg-neutral-800 border-2 border-neutral-900 shadow-inner rounded-sm transition-colors ${vertical ? 'w-6 h-10' : 'w-10 h-6'}`}
        onClick={() => onChange(!value)}
      >
        {/* Toggle Handle */}
        <div 
          className={`absolute bg-neutral-300 rounded-[1px] shadow-md border-b-2 border-neutral-500 transition-all duration-200 
            ${vertical 
              ? `left-0.5 w-4 h-4 ${value ? 'top-0.5' : 'top-[20px]'}` 
              : `top-0.5 h-4 w-4 ${value ? 'left-[20px]' : 'left-0.5'}`
            }`}
        />
      </div>
      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">{label}</span>
      {/* LED Indicator */}
      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-all duration-300 ${value ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-900'}`} />
    </div>
  );
};

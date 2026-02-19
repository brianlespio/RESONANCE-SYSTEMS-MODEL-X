import React from 'react';
import { Waveform } from '../types';

interface SubOscProps {
  waveform: Waveform;
  octave: number;
  onUpdate: (field: string, val: any) => void;
}

export const SubOscillator: React.FC<SubOscProps> = ({ waveform, octave, onUpdate }) => {
  return (
    <div className="flex-1 bg-neutral-800/40 rounded-[2px] px-1 py-1 border border-neutral-700/60 flex flex-col relative min-h-0 overflow-hidden justify-center">
      <div className="flex justify-between items-center border-b border-indigo-900/30 pb-[1px] mb-1">
        <h3 className="text-[7px] font-bold text-indigo-400 tracking-widest leading-none">SUB OSC</h3>
      </div>

      <div className="flex items-center justify-between px-0.5 flex-1">
          {/* Wave Section */}
          <div className="flex flex-col gap-0.5 scale-90 origin-left">
              <span className="text-[6px] font-mono text-neutral-500 leading-none">WAVE</span>
              <div className="flex gap-[1px]">
                 <button 
                    onClick={() => onUpdate('waveform', Waveform.SQUARE)}
                    className={`w-4 h-4 border rounded-[1px] flex items-center justify-center ${waveform === Waveform.SQUARE ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_2px_rgba(79,70,229,0.5)]' : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:bg-neutral-800'}`}
                 >
                    <div className="w-2 h-2 border-t border-r border-l border-current h-1.5"></div>
                 </button>
                 <button 
                    onClick={() => onUpdate('waveform', Waveform.SINE)}
                    className={`w-4 h-4 border rounded-[1px] flex items-center justify-center ${waveform === Waveform.SINE ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_2px_rgba(79,70,229,0.5)]' : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:bg-neutral-800'}`}
                 >
                    <div className="w-2 h-0.5 bg-current rounded-full"></div>
                 </button>
              </div>
          </div>

          {/* Octave Section */}
          <div className="flex flex-col gap-0.5 items-end scale-90 origin-right">
              <span className="text-[6px] font-mono text-neutral-500 leading-none">OCTAVE</span>
              <div className="flex gap-[1px]">
                  <button 
                    onClick={() => onUpdate('octave', -1)}
                    className={`text-[6px] font-bold w-4 h-4 border rounded-[1px] flex items-center justify-center ${octave === -1 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:bg-neutral-800'}`}
                  >-1</button>
                  <button 
                    onClick={() => onUpdate('octave', -2)}
                    className={`text-[6px] font-bold w-4 h-4 border rounded-[1px] flex items-center justify-center ${octave === -2 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:bg-neutral-800'}`}
                  >-2</button>
              </div>
          </div>
      </div>
    </div>
  );
};
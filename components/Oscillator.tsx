import React from 'react';
import { Knob } from './Knob';
import { Waveform } from '../types';

interface OscillatorProps {
  id: number;
  waveform: Waveform;
  octave: number;
  detune: number;
  onUpdate: (field: string, val: any) => void;
  isSync?: boolean;
}

export const Oscillator: React.FC<OscillatorProps> = ({ id, waveform, octave, detune, onUpdate, isSync }) => {
  const waveforms = [Waveform.SINE, Waveform.TRIANGLE, Waveform.SAWTOOTH, Waveform.SQUARE, Waveform.PULSE];

  return (
    <div className="flex-1 bg-neutral-800/40 rounded-[2px] px-1 py-[2px] border border-neutral-700/60 flex flex-col justify-between relative overflow-hidden group min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-700/50 pb-[1px] mb-0.5">
        <h3 className="text-[7px] font-bold text-neutral-400 tracking-widest leading-none">OSC {id}</h3>
        {isSync && <span className="text-[6px] bg-amber-900/40 text-amber-500 px-1 rounded-[1px] border border-amber-700/50 leading-none">SYNC</span>}
      </div>

      <div className="flex justify-between items-center gap-1 flex-1">
        {/* Waveform Selector */}
        <div className="flex flex-col gap-[1px] w-4">
           {waveforms.map((w) => (
             <button
                key={w}
                onClick={() => onUpdate('waveform', w)}
                className={`h-1.5 w-full flex items-center justify-center rounded-[1px] border ${waveform === w ? 'bg-amber-600 border-amber-500 shadow-[0_0_2px_rgba(245,158,11,0.5)]' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'}`}
             >
               <div className={`w-full h-[1px] ${waveform === w ? 'bg-white' : 'bg-neutral-600'}`}></div>
             </button>
           ))}
        </div>

        {/* Controls - Scaled down to prevent overlap */}
        <div className="flex gap-1 pr-1 items-center justify-end flex-1">
            <div className="scale-75 origin-right">
                <Knob 
                    label="RANGE" 
                    value={octave} 
                    min={-2} max={2} step={1} 
                    onChange={(v) => onUpdate('octave', v)} 
                    size="sm"
                    formatValue={(v) => `${v > 0 ? '+' : ''}${v * 12}`}
                />
            </div>
            <div className="scale-75 origin-right">
                <Knob 
                    label="FREQ" 
                    value={detune} 
                    min={-700} max={700} step={1} 
                    onChange={(v) => onUpdate('detune', v)} 
                    size="sm"
                    formatValue={(v) => `${v > 0 ? '+' : ''}${v}c`}
                />
            </div>
        </div>
      </div>
    </div>
  );
};
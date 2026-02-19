import React from 'react';
import { Knob } from './Knob';

interface EffectsProps {
  values: {
    drive: number;
    chorusRate: number;
    chorusDepth: number;
    delayTime: number;
    delayMix: number;
    reverbSize: number;
    reverbMix: number;
  };
  onUpdate: (field: string, val: number) => void;
}

export const Effects: React.FC<EffectsProps> = ({ values, onUpdate }) => {
  return (
    <div className="w-26 px-1 flex flex-col border-r border-neutral-800">
      <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">FX RACK</h2>
      <div className="flex-1 flex flex-col gap-1 pb-1">
        
        {/* DRIVE MODULE */}
        <div className="bg-neutral-800/20 rounded-[1px] border border-neutral-700/30 flex items-center justify-between flex-1 px-2 relative group min-h-0">
           <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-amber-900/40 rounded-full"></div>
           <div className="flex flex-col justify-center pl-2">
             <span className="text-[6px] font-bold text-neutral-500 leading-tight tracking-wider">ANALOG</span>
             <span className="text-[8px] font-black text-amber-600 leading-none tracking-widest">DRIVE</span>
           </div>
           <div className="scale-75 origin-right mr-1">
             <Knob label="SAT" value={values.drive} min={0} max={10} onChange={(v) => onUpdate('drive', v)} size="sm" color="gold" />
           </div>
        </div>

        {/* CHORUS MODULE */}
        <div className="bg-neutral-800/20 rounded-[1px] border border-neutral-700/30 flex flex-col flex-1 relative overflow-hidden px-0.5 py-0.5 min-h-0 justify-center">
             <div className="flex justify-between items-center border-b border-neutral-700/30 pb-[1px] mb-0.5 bg-black/20 px-1 rounded-t-[1px]">
                <span className="text-[6px] font-bold text-neutral-500 tracking-wider">CHORUS</span>
                <div className="w-1 h-1 rounded-full bg-indigo-900/80 border border-indigo-700/50 shadow-[0_0_2px_rgba(99,102,241,0.5)]"></div>
             </div>
             <div className="flex justify-around items-center flex-1">
                <div className="scale-75 origin-center"><Knob label="RATE" value={values.chorusRate} min={0} max={100} onChange={(v) => onUpdate('chorusRate', v)} size="sm" /></div>
                <div className="scale-75 origin-center"><Knob label="DEPTH" value={values.chorusDepth} min={0} max={100} onChange={(v) => onUpdate('chorusDepth', v)} size="sm" /></div>
             </div>
        </div>

        {/* DELAY MODULE */}
        <div className="bg-neutral-800/20 rounded-[1px] border border-neutral-700/30 flex flex-col flex-1 relative overflow-hidden px-0.5 py-0.5 min-h-0 justify-center">
             <div className="flex justify-between items-center border-b border-neutral-700/30 pb-[1px] mb-0.5 bg-black/20 px-1 rounded-t-[1px]">
                <span className="text-[6px] font-bold text-neutral-500 tracking-wider">DELAY</span>
                <div className="w-1 h-1 rounded-full bg-cyan-900/80 border border-cyan-700/50 shadow-[0_0_2px_rgba(6,182,212,0.5)]"></div>
             </div>
             <div className="flex justify-around items-center flex-1">
                <div className="scale-75 origin-center"><Knob label="TIME" value={values.delayTime} min={0} max={100} onChange={(v) => onUpdate('delayTime', v)} size="sm" /></div>
                <div className="scale-75 origin-center"><Knob label="MIX" value={values.delayMix} min={0} max={100} onChange={(v) => onUpdate('delayMix', v)} size="sm" /></div>
             </div>
        </div>

        {/* REVERB MODULE */}
        <div className="bg-neutral-800/20 rounded-[1px] border border-neutral-700/30 flex flex-col flex-1 relative overflow-hidden px-0.5 py-0.5 min-h-0 justify-center">
             <div className="flex justify-between items-center border-b border-neutral-700/30 pb-[1px] mb-0.5 bg-black/20 px-1 rounded-t-[1px]">
                <span className="text-[6px] font-bold text-neutral-500 tracking-wider">REVERB</span>
                <div className="w-1 h-1 rounded-full bg-purple-900/80 border border-purple-700/50 shadow-[0_0_2px_rgba(168,85,247,0.5)]"></div>
             </div>
             <div className="flex justify-around items-center flex-1">
                <div className="scale-75 origin-center"><Knob label="DECAY" value={values.reverbSize} min={0} max={100} onChange={(v) => onUpdate('reverbSize', v)} size="sm" /></div>
                <div className="scale-75 origin-center"><Knob label="MIX" value={values.reverbMix} min={0} max={100} onChange={(v) => onUpdate('reverbMix', v)} size="sm" /></div>
             </div>
        </div>

      </div>
    </div>
  );
};
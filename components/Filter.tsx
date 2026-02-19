import React from 'react';
import { Knob } from './Knob';
import { Switch } from './Switch';

interface FilterProps {
  cutoff: number;
  resonance: number;
  drive: number;
  envAmount: number;
  keyTrack: boolean;
  onUpdate: (field: string, val: any) => void;
}

export const Filter: React.FC<FilterProps> = ({ cutoff, resonance, drive, envAmount, keyTrack, onUpdate }) => {
  return (
    <div className="bg-neutral-800/30 rounded-sm p-1 border border-neutral-700/50 shadow-inner flex flex-col h-full">
      <h3 className="text-[8px] font-bold text-neutral-400 tracking-widest mb-1 border-b border-neutral-700/50 pb-0.5 text-center">LADDER VCF</h3>
      
      <div className="flex-1 flex flex-col justify-around py-0.5">
        {/* Main Controls */}
        <div className="flex justify-center items-end gap-3">
            <Knob 
                label="CUTOFF" 
                value={cutoff} 
                min={20} max={20000} step={10} 
                onChange={(v) => onUpdate('cutoff', v)} 
                size="md" 
                color="black"
                formatValue={(v) => v < 1000 ? `${v}` : `${(v/1000).toFixed(1)}k`}
            />
            <Knob 
                label="EMPHASIS" 
                value={resonance} 
                min={0} max={10} 
                onChange={(v) => onUpdate('resonance', v)} 
                size="sm" 
            />
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-between items-end px-1 mt-1">
            <Knob 
                label="DRIVE" 
                value={drive} 
                min={0} max={10} 
                onChange={(v) => onUpdate('drive', v)} 
                size="sm" 
                color="gold"
            />
            <Knob 
                label="CONTOUR" 
                value={envAmount} 
                min={-100} max={100} 
                onChange={(v) => onUpdate('envAmount', v)} 
                size="sm" 
            />
            <div className="pb-1">
                 <Switch label="KB.TRK" value={keyTrack} onChange={(v) => onUpdate('keyTrack', v)} vertical={true} />
            </div>
        </div>
      </div>
    </div>
  );
};
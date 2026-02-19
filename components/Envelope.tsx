import React from 'react';

interface EnvelopeProps {
  title: string;
  adsr: { a: number; d: number; s: number; r: number };
  onUpdate: (stage: 'a'|'d'|'s'|'r', val: number) => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({ title, adsr, onUpdate }) => {
  const Slider = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex flex-col items-center h-full group w-5">
      <div className="relative flex-1 w-3 bg-neutral-900 rounded-[1px] border border-neutral-800 shadow-inner">
         <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-neutral-800 -translate-x-1/2"></div>
         <div 
            className="absolute bottom-0 left-0 right-0 bg-neutral-800/50 pointer-events-none" 
            style={{ height: `${value * 100}%`}} 
         />
         <input 
            type="range" 
            min={0} max={1} step={0.01}
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
            orient="vertical"
         />
         <div 
            className="absolute left-0 right-0 h-1.5 bg-neutral-300 rounded-[1px] shadow border-b border-neutral-500 z-10 pointer-events-none"
            style={{ bottom: `${value * 100}%`, transform: 'translateY(50%)' }}
         >
            <div className="w-full h-[1px] bg-black mt-[2px] opacity-30"></div>
         </div>
      </div>
      <span className="mt-0.5 text-[7px] font-mono text-neutral-400 font-bold">{label}</span>
    </div>
  );

  return (
    <div className="bg-neutral-800/30 px-1 py-[2px] rounded border border-neutral-700/50 flex-1 flex flex-col min-h-0">
       <h4 className="text-[7px] font-mono text-neutral-500 mb-0.5 uppercase text-center border-b border-neutral-700/50 pb-0.5 leading-none">{title}</h4>
       <div className="flex gap-0.5 justify-center flex-1 min-h-0">
         <Slider label="A" value={adsr.a} onChange={(v) => onUpdate('a', v)} />
         <Slider label="D" value={adsr.d} onChange={(v) => onUpdate('d', v)} />
         <Slider label="S" value={adsr.s} onChange={(v) => onUpdate('s', v)} />
         <Slider label="R" value={adsr.r} onChange={(v) => onUpdate('r', v)} />
       </div>
    </div>
  );
};
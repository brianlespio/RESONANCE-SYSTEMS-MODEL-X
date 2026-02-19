import React, { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { Oscillator } from './components/Oscillator';
import { SubOscillator } from './components/SubOscillator';
import { Filter } from './components/Filter';
import { Envelope } from './components/Envelope';
import { Knob } from './components/Knob';
import { Switch } from './components/Switch';
import { Keyboard } from './components/Keyboard';
import { Wheel } from './components/Wheel';
import { Mixer } from './components/Mixer';
import { Effects } from './components/Effects';
import { Waveform } from './types';
import { AudioEngine } from './utils/audio';

const App: React.FC = () => {
  // --- STATE ---
  const [power, setPower] = useState(true);
  
  const [osc1, setOsc1] = useState({ waveform: Waveform.SAWTOOTH, octave: 0, detune: 0 });
  const [osc2, setOsc2] = useState({ waveform: Waveform.SQUARE, octave: 0, detune: 12 });
  const [osc3, setOsc3] = useState({ waveform: Waveform.TRIANGLE, octave: -1, detune: -5 });
  const [subOsc, setSubOsc] = useState({ waveform: Waveform.SQUARE, octave: -1 });

  const [mixerLevels, setMixerLevels] = useState({ osc1: 80, osc2: 60, osc3: 40, sub: 50, noise: 15 });
  const [mutes, setMutes] = useState<Record<string, boolean>>({ osc1: false, osc2: false, osc3: false, sub: false, noise: false });

  const [filter, setFilter] = useState({ cutoff: 2400, resonance: 2, drive: 4, envAmount: 40, keyTrack: true });
  const [ampEnv, setAmpEnv] = useState({ a: 0.01, d: 0.4, s: 0.8, r: 0.3 });
  const [filterEnv, setFilterEnv] = useState({ a: 0.2, d: 0.6, s: 0.2, r: 0.5 });
  
  const [effects, setEffects] = useState({
    drive: 2,
    chorusRate: 20,
    chorusDepth: 0,
    delayTime: 30,
    delayMix: 0,
    reverbSize: 50,
    reverbMix: 15
  });

  const [masterVol, setMasterVol] = useState(75);
  const [glide, setGlide] = useState(10);
  const [lfoRate, setLfoRate] = useState(4.5);
  const [modAmount, setModAmount] = useState(20);

  // --- AUDIO ENGINE REF ---
  const audioEngine = useRef<AudioEngine | null>(null);

  // Init Engine
  useEffect(() => {
    audioEngine.current = new AudioEngine();
    return () => {
       if (audioEngine.current) {
         audioEngine.current.ctx.close();
       }
    }
  }, []);

  // Sync Parameters to Audio Engine
  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setOscType(1, osc1.waveform);
    audioEngine.current.setOscOctave(1, osc1.octave);
    audioEngine.current.setOscDetune(1, osc1.detune);
  }, [osc1]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setOscType(2, osc2.waveform);
    audioEngine.current.setOscOctave(2, osc2.octave);
    audioEngine.current.setOscDetune(2, osc2.detune);
  }, [osc2]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setOscType(3, osc3.waveform);
    audioEngine.current.setOscOctave(3, osc3.octave);
    audioEngine.current.setOscDetune(3, osc3.detune);
  }, [osc3]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setOscType(4, subOsc.waveform);
    audioEngine.current.setOscOctave(4, subOsc.octave);
  }, [subOsc]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setMixerLevel('osc1', mutes.osc1 ? 0 : mixerLevels.osc1);
    audioEngine.current.setMixerLevel('osc2', mutes.osc2 ? 0 : mixerLevels.osc2);
    audioEngine.current.setMixerLevel('osc3', mutes.osc3 ? 0 : mixerLevels.osc3);
    audioEngine.current.setMixerLevel('sub', mutes.sub ? 0 : mixerLevels.sub);
  }, [mixerLevels, mutes]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setFilter(filter.cutoff, filter.resonance, filter.envAmount);
  }, [filter]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setAmpEnv(ampEnv.a, ampEnv.d, ampEnv.s, ampEnv.r);
  }, [ampEnv]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setFilterEnv(filterEnv.a, filterEnv.d, filterEnv.s, filterEnv.r);
  }, [filterEnv]);

  useEffect(() => {
    if (!audioEngine.current) return;
    audioEngine.current.setMasterVolume(masterVol);
  }, [masterVol]);

  const handleMixerUpdate = (ch: string, val: number) => setMixerLevels(p => ({...p, [ch]: val}));
  const handleMute = (ch: string) => setMutes(p => ({...p, [ch]: !p[ch]}));

  // Handlers for Keyboard
  const handleNoteOn = (note: number) => {
      if (power && audioEngine.current) {
          audioEngine.current.noteOn(note);
      }
  };

  const handleNoteOff = (note: number) => {
      if (power && audioEngine.current) {
          audioEngine.current.noteOff(note);
      }
  };

  const togglePower = () => {
      setPower(!power);
      if (!power && audioEngine.current) {
          audioEngine.current.resume();
      }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      
      {/* CHASSIS COMPACTO EXPANDIDO */}
      <div className={`
        relative w-full max-w-[1024px] bg-[#141414] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-opacity duration-1000 
        ${power ? 'opacity-100' : 'opacity-40 grayscale'}
        border-t-2 border-neutral-600
      `}>
        
        {/* WOOD SIDES */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#3d2314] border-r border-black shadow-xl z-20 bg-cover opacity-90" style={{ backgroundImage: "url('https://img.freepik.com/free-photo/wood-texture-background_1373-316.jpg')" }}></div>
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#3d2314] border-l border-black shadow-xl z-20 bg-cover opacity-90" style={{ backgroundImage: "url('https://img.freepik.com/free-photo/wood-texture-background_1373-316.jpg')" }}></div>

        {/* TOP HEADER - BRANDING: RESONANCE SYSTEMS — MODEL X */}
        <div className="h-9 bg-[#0a0a0a] flex items-center justify-between px-5 border-b border-neutral-800 z-10">
            <div className="flex items-center gap-2.5">
                <Zap className="text-neutral-500 fill-neutral-600/20" size={14} strokeWidth={2} />
                <h1 className="text-[10px] font-black text-neutral-300 tracking-[0.2em] font-mono leading-none">
                    RESONANCE SYSTEMS <span className="text-neutral-600 mx-1">—</span> MODEL X
                </h1>
            </div>
            <button onClick={togglePower} className={`px-2 py-0.5 border rounded-[1px] text-[7px] font-bold uppercase tracking-wider transition-all duration-300 ${power ? 'border-red-900/50 bg-red-900/10 text-red-500 shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 'border-neutral-800 text-neutral-700 bg-black'}`}>Power</button>
        </div>

        {/* MAIN PANEL - Height Increased to 320px for better fit */}
        <div className="px-3 py-3 bg-[#1a1a1a] relative">
            {/* Panel Texture */}
            <div className="absolute inset-0 bg-neutral-900 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="flex gap-1 relative z-10 h-[320px]">
                
                {/* SECTION 1: CONTROLLERS */}
                <div className="w-24 flex flex-col gap-1 pr-1 border-r border-neutral-800">
                    <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">MOD</h2>
                    <div className="flex flex-col items-center gap-1 bg-neutral-800/20 p-1 rounded-[1px] h-full justify-between pt-2 pb-2 border border-neutral-800/50">
                        <div className="flex flex-col items-center gap-2">
                            <Knob label="TUNE" value={0} min={-12} max={12} onChange={() => {}} size="sm" />
                            <Knob label="GLIDE" value={glide} min={0} max={10} onChange={setGlide} size="sm" />
                        </div>
                        
                        <div className="w-full px-2"><div className="w-full h-[1px] bg-neutral-800"></div></div>
                        
                        <Knob label="MIX" value={modAmount} min={0} max={100} onChange={setModAmount} size="sm" />
                        
                        <div className="flex flex-col gap-2 items-center mb-1">
                            <Switch label="LFO HI" value={lfoRate > 5} onChange={(v) => setLfoRate(v ? 10 : 1)} />
                            <Knob label="RATE" value={lfoRate} min={0.1} max={20} onChange={setLfoRate} size="sm" formatValue={v => `${v}`} />
                        </div>
                    </div>
                </div>

                {/* SECTION 2: OSCILLATOR BANK */}
                <div className="w-44 flex flex-col gap-1 px-1 border-r border-neutral-800">
                    <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">OSCILLATORS</h2>
                    <div className="flex-1 flex flex-col gap-1">
                        <Oscillator id={1} {...osc1} onUpdate={(k, v) => setOsc1(p => ({...p, [k]: v}))} />
                        <Oscillator id={2} {...osc2} isSync onUpdate={(k, v) => setOsc2(p => ({...p, [k]: v}))} />
                        <Oscillator id={3} {...osc3} isSync onUpdate={(k, v) => setOsc3(p => ({...p, [k]: v}))} />
                        <SubOscillator {...subOsc} onUpdate={(k, v) => setSubOsc(p => ({...p, [k]: v}))} />
                    </div>
                </div>

                {/* SECTION 3: MIXER */}
                <div className="w-60 px-1 flex flex-col border-r border-neutral-800">
                     <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">MIXER</h2>
                     <Mixer levels={mixerLevels} onUpdate={handleMixerUpdate} mutes={mutes} onMute={handleMute} />
                </div>

                {/* SECTION 4: FILTER */}
                <div className="w-36 px-1 flex flex-col border-r border-neutral-800">
                    <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">FILTER</h2>
                    <div className="flex-1">
                        <Filter {...filter} onUpdate={(k, v) => setFilter(p => ({...p, [k]: v}))} />
                    </div>
                </div>

                {/* SECTION 5: ENVELOPES */}
                <div className="w-32 px-1 flex flex-col border-r border-neutral-800">
                    <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px]">ENVELOPES</h2>
                    <div className="flex flex-col gap-1 h-full">
                        <Envelope title="FILTER" adsr={filterEnv} onUpdate={(k, v) => setFilterEnv(p => ({...p, [k]: v}))} />
                        <Envelope title="AMPLIFIER" adsr={ampEnv} onUpdate={(k, v) => setAmpEnv(p => ({...p, [k]: v}))} />
                    </div>
                </div>

                {/* SECTION 6: EFFECTS */}
                <Effects values={effects} onUpdate={(k, v) => setEffects(p => ({...p, [k]: v}))} />

                {/* SECTION 7: OUTPUT - Increased Width & Added Padding */}
                <div className="w-28 pl-1 border-l border-neutral-800 flex flex-col items-center">
                    <h2 className="text-[7px] font-bold text-neutral-500 text-center tracking-widest mb-0.5 bg-black/40 py-0.5 rounded-[1px] w-full">MAIN</h2>
                    <div className="flex-1 flex flex-col justify-between py-4 gap-4 px-3 w-full bg-neutral-800/10 rounded-[1px] border border-neutral-800/30">
                        <div className="flex justify-center mt-2">
                             <Knob label="VOLUME" value={masterVol} min={0} max={100} onChange={setMasterVol} size="lg" color="black" />
                        </div>
                        <div className="w-full h-[1px] bg-neutral-800/50"></div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-full border-[3px] border-neutral-800 bg-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center">
                                <div className="w-4 h-4 bg-black rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]"></div>
                            </div>
                            <span className="text-[7px] font-mono text-neutral-600 tracking-wider">PHONES</span>
                        </div>
                        <div className="mt-2 scale-100 mb-2">
                            <Switch label="A-440" value={false} onChange={() => {}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* KEYBOARD SECTION */}
        <div className="bg-[#111] p-2 pb-4 border-t border-[#000] flex gap-2 shadow-[inset_0_10px_20px_rgba(0,0,0,1)] z-20">
            {/* Left Controls (Wheels) */}
            <div className="w-16 bg-[#181818] rounded-[2px] border border-neutral-800 shadow-lg flex flex-col items-center justify-center gap-2 p-1">
                 <div className="flex gap-1.5">
                     <Wheel label="PITCH" type="pitch" />
                     <Wheel label="MOD" type="mod" />
                 </div>
            </div>

            {/* Keys */}
            <div className="flex-1 relative">
                <Keyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
                {/* Logo Badge on keybed */}
                <div className="absolute top-[-8px] right-3 text-neutral-600 text-[8px] font-bold tracking-[0.2em] font-mono opacity-50">
                    RESONANCE SYSTEMS — MODEL X
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
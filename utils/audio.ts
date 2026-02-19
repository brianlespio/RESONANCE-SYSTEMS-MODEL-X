import { Waveform } from '../types';

export class AudioEngine {
  ctx: AudioContext;
  masterGain: GainNode;
  filter: BiquadFilterNode;
  
  // Oscillators nodes (active voice)
  oscNodes: OscillatorNode[] = [];
  subOscNode: OscillatorNode | null = null;
  
  // Mixer Gains
  gainNodes: GainNode[] = [];
  subGain: GainNode;
  
  // Envelopes reference values
  ampEnv = { a: 0.01, d: 0.4, s: 0.8, r: 0.3 };
  filterEnv = { a: 0.2, d: 0.6, s: 0.2, r: 0.5 };
  
  // State
  currentNote: number | null = null;
  isPlaying = false;
  
  // Params
  oscParams = [
    { type: 'sawtooth' as OscillatorType, detune: 0, octave: 0 },
    { type: 'square' as OscillatorType, detune: 0, octave: 0 },
    { type: 'triangle' as OscillatorType, detune: 0, octave: -1 },
  ];
  subParams = { type: 'square' as OscillatorType, octave: -1 };
  
  mixerLevels = { osc1: 0.8, osc2: 0.6, osc3: 0.4, sub: 0.5 };
  filterParams = { cutoff: 2400, res: 2, modAmount: 2000 };
  masterVol = 0.75;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create Master Chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0; // Start silent
    
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 2400;
    this.filter.Q.value = 2;

    // Connect: Filter -> Master -> Destination
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Initialize mixer gains
    this.gainNodes = [0, 1, 2].map(() => this.ctx.createGain());
    this.subGain = this.ctx.createGain();

    // Connect mixer gains to filter
    this.gainNodes.forEach(g => g.connect(this.filter));
    this.subGain.connect(this.filter);
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Parameter Setters ---

  setMasterVolume(val: number) { // 0-100
    this.masterVol = val / 100;
    // If holding a note, we could update linearly, but mostly this affects next triggers or sustain
    // Dynamic update for held note:
    if (this.isPlaying) {
         const now = this.ctx.currentTime;
         this.masterGain.gain.cancelScheduledValues(now);
         this.masterGain.gain.linearRampToValueAtTime(this.masterVol * this.ampEnv.s, now + 0.1);
    }
  }

  setOscType(id: number, type: Waveform) {
    const oscType = this.mapWaveform(type);
    if (id === 4) { // Sub
        this.subParams.type = oscType;
    } else {
        this.oscParams[id - 1].type = oscType;
    }
    this.refreshOscs();
  }

  setOscOctave(id: number, oct: number) {
    if (id === 4) this.subParams.octave = oct;
    else this.oscParams[id - 1].octave = oct;
    this.refreshOscs();
  }

  setOscDetune(id: number, cents: number) {
    if (id < 4) {
        this.oscParams[id - 1].detune = cents;
        this.refreshOscs();
    }
  }

  setMixerLevel(channel: string, val: number) { // 0-100
    const gain = val / 100;
    if (channel === 'osc1') this.mixerLevels.osc1 = gain;
    if (channel === 'osc2') this.mixerLevels.osc2 = gain;
    if (channel === 'osc3') this.mixerLevels.osc3 = gain;
    if (channel === 'sub') this.mixerLevels.sub = gain;
    
    // Update live gains
    const now = this.ctx.currentTime;
    this.gainNodes[0].gain.setTargetAtTime(this.mixerLevels.osc1, now, 0.1);
    this.gainNodes[1].gain.setTargetAtTime(this.mixerLevels.osc2, now, 0.1);
    this.gainNodes[2].gain.setTargetAtTime(this.mixerLevels.osc3, now, 0.1);
    this.subGain.gain.setTargetAtTime(this.mixerLevels.sub, now, 0.1);
  }

  setFilter(cutoff: number, res: number, envAmt: number) {
      this.filterParams = { cutoff, res, modAmount: envAmt * 50 }; // Scale env amount
      const now = this.ctx.currentTime;
      
      // Update steady state if not playing, or base value
      // Note: In a real analog synth, knob moves cutoff immediately.
      // If envelope is active, it adds to this base.
      // For simplicity, we update base frequency.
      // If playing, the envelope is running, so we might fight it.
      // Simple approach: set value immediately.
      this.filter.frequency.setTargetAtTime(cutoff, now, 0.1);
      this.filter.Q.setTargetAtTime(res, now, 0.1);
  }

  setAmpEnv(a: number, d: number, s: number, r: number) {
      this.ampEnv = { a, d, s, r };
  }

  setFilterEnv(a: number, d: number, s: number, r: number) {
      this.filterEnv = { a, d, s, r };
  }

  // --- Voice Management ---

  noteOn(note: number) {
    this.resume();
    this.currentNote = note;
    this.isPlaying = true;
    
    const now = this.ctx.currentTime;
    const freq = this.midiToFreq(note);

    // Stop previous oscillators if any (monophonic retrigger)
    this.stopOscillators();

    // Create Oscillators
    this.oscNodes = this.oscParams.map((param, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = param.type;
        // Frequency calculation: Note freq * 2^(octave)
        const noteFreq = freq * Math.pow(2, param.octave);
        osc.frequency.value = noteFreq;
        osc.detune.value = param.detune;
        osc.connect(this.gainNodes[i]);
        osc.start(now);
        return osc;
    });

    // Create Sub Osc
    const subOsc = this.ctx.createOscillator();
    subOsc.type = this.subParams.type;
    subOsc.frequency.value = freq * Math.pow(2, this.subParams.octave);
    subOsc.connect(this.subGain);
    subOsc.start(now);
    this.subOscNode = subOsc;

    // --- Envelopes ---
    
    // AMP ENVELOPE (VCA)
    // Reset
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    // Attack
    this.masterGain.gain.linearRampToValueAtTime(this.masterVol, now + Math.max(0.005, this.ampEnv.a));
    // Decay to Sustain
    this.masterGain.gain.linearRampToValueAtTime(this.masterVol * this.ampEnv.s, now + Math.max(0.005, this.ampEnv.a) + this.ampEnv.d);

    // FILTER ENVELOPE
    const baseFreq = this.filterParams.cutoff;
    const peakFreq = Math.min(20000, baseFreq + this.filterParams.modAmount);
    const sustainFreq = baseFreq + (this.filterParams.modAmount * this.filterEnv.s);

    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(baseFreq, now);
    // Attack
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(20, peakFreq), now + Math.max(0.005, this.filterEnv.a));
    // Decay
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(20, sustainFreq), now + Math.max(0.005, this.filterEnv.a) + this.filterEnv.d);
  }

  noteOff(note: number) {
    // Only stop if the released note is the one playing (Last note priority basic handling)
    if (this.currentNote === note) {
        this.isPlaying = false;
        const now = this.ctx.currentTime;
        
        // AMP Release
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now); // Anchor
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.01, this.ampEnv.r));

        // Filter Release
        this.filter.frequency.cancelScheduledValues(now);
        this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
        this.filter.frequency.exponentialRampToValueAtTime(Math.max(20, this.filterParams.cutoff), now + Math.max(0.01, this.filterEnv.r));
        
        // Stop oscillators after release
        const stopTime = now + Math.max(0.01, this.ampEnv.r) + 0.1;
        this.oscNodes.forEach(o => o.stop(stopTime));
        if (this.subOscNode) this.subOscNode.stop(stopTime);
        
        // Cleanup array later to avoid memory leaks? 
        // For this simple engine, we just let them stop.
    }
  }

  private stopOscillators() {
     const now = this.ctx.currentTime;
     this.oscNodes.forEach(o => {
         try { o.stop(now); } catch(e) {}
         o.disconnect();
     });
     this.oscNodes = [];
     if (this.subOscNode) {
         try { this.subOscNode.stop(now); } catch(e) {}
         this.subOscNode.disconnect();
         this.subOscNode = null;
     }
  }

  private refreshOscs() {
     if (this.isPlaying && this.currentNote !== null) {
         // Simple way to apply pitch/wave changes while playing:
         // Just update the frequency/type of current nodes
         const freq = this.midiToFreq(this.currentNote);
         
         this.oscNodes.forEach((osc, i) => {
             const p = this.oscParams[i];
             osc.type = p.type;
             osc.frequency.setTargetAtTime(freq * Math.pow(2, p.octave), this.ctx.currentTime, 0.05);
             osc.detune.setTargetAtTime(p.detune, this.ctx.currentTime, 0.05);
         });

         if (this.subOscNode) {
             this.subOscNode.type = this.subParams.type;
             this.subOscNode.frequency.setTargetAtTime(freq * Math.pow(2, this.subParams.octave), this.ctx.currentTime, 0.05);
         }
     }
  }

  private mapWaveform(w: Waveform): OscillatorType {
      switch (w) {
          case Waveform.SINE: return 'sine';
          case Waveform.TRIANGLE: return 'triangle';
          case Waveform.SAWTOOTH: return 'sawtooth';
          case Waveform.SQUARE: return 'square';
          case Waveform.PULSE: return 'square'; // WebAudio limitation
          default: return 'sawtooth';
      }
  }

  private midiToFreq(note: number): number {
      // A4 = 69 = 440Hz
      // Our keyboard starts at 0 (C), usually MIDI 48 (C3) or 36 (C2)
      // Let's map our key 0 to MIDI 36 (C2) for bass heavy default
      const midiNote = note + 36;
      return 440 * Math.pow(2, (midiNote - 69) / 12);
  }
}
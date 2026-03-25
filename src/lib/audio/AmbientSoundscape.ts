/**
 * AmbientSoundscape - Synthesized ambient audio layers
 * Creates immersive cyberpunk atmosphere without any audio files
 *
 * Layers:
 * - Table Hum: Low electronic drone (15-20% volume)
 * - Neon Buzz: High-frequency electrical crackle (10% volume)
 * - Digital Pad: Soft wash, state-reactive (20-25% volume)
 */

export type AmbientState = 'menu' | 'active' | 'matchPoint' | 'overtime' | 'goal' | 'paused';

interface StatePreset {
  filterFreq: number;
  reverbMix: number;
  brightness: number;
  humVolume: number;
  buzzIntensity: number;
  tensionDrone: boolean;
}

const STATE_PRESETS: Record<AmbientState, StatePreset> = {
  menu: { filterFreq: 800, reverbMix: 0.6, brightness: 0.3, humVolume: 0.15, buzzIntensity: 0.3, tensionDrone: false },
  active: { filterFreq: 1200, reverbMix: 0.4, brightness: 0.5, humVolume: 0.18, buzzIntensity: 0.5, tensionDrone: false },
  matchPoint: { filterFreq: 1500, reverbMix: 0.35, brightness: 0.7, humVolume: 0.20, buzzIntensity: 0.7, tensionDrone: true },
  overtime: { filterFreq: 2000, reverbMix: 0.3, brightness: 0.9, humVolume: 0.22, buzzIntensity: 0.9, tensionDrone: true },
  goal: { filterFreq: 2500, reverbMix: 0.5, brightness: 1.0, humVolume: 0.25, buzzIntensity: 1.0, tensionDrone: false },
  paused: { filterFreq: 600, reverbMix: 0.7, brightness: 0.2, humVolume: 0.10, buzzIntensity: 0.2, tensionDrone: false },
};

// ═══════════════════════════════════════════════════════════
// TABLE HUM - Low Electronic Drone
// ═══════════════════════════════════════════════════════════

class TableHum {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private oscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode;
  private started = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.15;

    // Lowpass filter to smooth everything
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 200;
    this.filter.Q.value = 1;

    this.masterGain.connect(this.filter);
  }

  connect(destination: AudioNode): this {
    this.filter.connect(destination);
    return this;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    const now = this.ctx.currentTime;
    const baseFreq = 55; // A1 - low fundamental
    const detunes = [0, -8, 8]; // cents detuning for chorus effect

    // Create detuned oscillators for thickness
    detunes.forEach((detune, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      osc.detune.value = detune;
      gain.gain.value = i === 0 ? 0.6 : 0.3;

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      this.oscillators.push(osc);
    });

    // Add second harmonic (110 Hz)
    const harmonic = this.ctx.createOscillator();
    const harmonicGain = this.ctx.createGain();
    harmonic.type = 'triangle';
    harmonic.frequency.value = 110;
    harmonicGain.gain.value = 0.15;
    harmonic.connect(harmonicGain);
    harmonicGain.connect(this.masterGain);
    harmonic.start(now);
    this.oscillators.push(harmonic);

    // LFO for subtle movement
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.1;
    lfoGain.gain.value = 3;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start(now);
  }

  setVolume(value: number, rampTime = 0.5): void {
    this.masterGain.gain.linearRampToValueAtTime(
      value,
      this.ctx.currentTime + rampTime
    );
  }

  stop(): void {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    if (this.lfo) {
      try { this.lfo.stop(); } catch { /* already stopped */ }
    }
    this.started = false;
  }
}

// ═══════════════════════════════════════════════════════════
// NEON BUZZ - High-Frequency Electrical Crackle
// ═══════════════════════════════════════════════════════════

class NeonBuzz {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer;
  private noiseGain: GainNode;
  private noiseFilter: BiquadFilterNode;
  private hum: OscillatorNode | null = null;
  private humGain: GainNode;
  private started = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.10;

    // Create noise buffer
    this.noiseBuffer = this.createPinkNoiseBuffer();

    // Noise path
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.4;

    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 4000;
    this.noiseFilter.Q.value = 2;

    this.noiseGain.connect(this.noiseFilter);
    this.noiseFilter.connect(this.masterGain);

    // 60 Hz hum
    this.humGain = ctx.createGain();
    this.humGain.gain.value = 0.15;
    this.humGain.connect(this.masterGain);
  }

  private createPinkNoiseBuffer(): AudioBuffer {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  connect(destination: AudioNode): this {
    this.masterGain.connect(destination);
    return this;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    const now = this.ctx.currentTime;

    // Start noise source
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = this.noiseBuffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.noiseGain);
    this.noiseSource.start(now);

    // Start hum
    this.hum = this.ctx.createOscillator();
    this.hum.type = 'square';
    this.hum.frequency.value = 60;
    this.hum.connect(this.humGain);
    this.hum.start(now);
  }

  setIntensity(value: number, rampTime = 0.3): void {
    const baseVolume = 0.10;
    this.masterGain.gain.linearRampToValueAtTime(
      baseVolume * (0.5 + value * 0.5),
      this.ctx.currentTime + rampTime
    );
    this.noiseFilter.frequency.linearRampToValueAtTime(
      3000 + value * 3000,
      this.ctx.currentTime + rampTime
    );
  }

  stop(): void {
    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch { /* already stopped */ }
    }
    if (this.hum) {
      try { this.hum.stop(); } catch { /* already stopped */ }
    }
    this.started = false;
  }
}

// ═══════════════════════════════════════════════════════════
// DIGITAL PAD - Soft Wash (State-Reactive)
// ═══════════════════════════════════════════════════════════

class DigitalPad {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private oscillators: OscillatorNode[] = [];
  private oscGain: GainNode;
  private filter: BiquadFilterNode;
  private convolver: ConvolverNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  private tensionOsc: OscillatorNode | null = null;
  private tensionGain: GainNode;
  private lfo: OscillatorNode | null = null;
  private started = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.20;

    // Oscillator gain
    this.oscGain = ctx.createGain();
    this.oscGain.gain.value = 0.7;

    // Main lowpass filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 800;
    this.filter.Q.value = 2;

    this.oscGain.connect(this.filter);

    // Synthetic reverb
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = this.generateReverbImpulse(3, 2);

    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.dryGain.gain.value = 0.4;
    this.wetGain.gain.value = 0.6;

    this.filter.connect(this.dryGain);
    this.filter.connect(this.convolver);
    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);

    // Tension drone
    this.tensionGain = ctx.createGain();
    this.tensionGain.gain.value = 0;
    this.tensionGain.connect(this.masterGain);
  }

  private generateReverbImpulse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-decay * t);
        const earlyReflection = i < sampleRate * 0.05 ? Math.random() * 0.3 : 0;
        channelData[i] = (Math.random() * 2 - 1) * envelope + earlyReflection;
      }
    }
    return impulse;
  }

  connect(destination: AudioNode): this {
    this.masterGain.connect(destination);
    return this;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    const now = this.ctx.currentTime;
    const baseFreq = 110; // A2
    const detunes = [-24, -12, -5, 0, 5, 12, 24];

    // Create super saw oscillators
    detunes.forEach(detune => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = baseFreq;
      osc.detune.value = detune;
      gain.gain.value = 1 / detunes.length;
      osc.connect(gain);
      gain.connect(this.oscGain);
      osc.start(now);
      this.oscillators.push(osc);
    });

    // LFO for filter movement
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.05;
    lfoGain.gain.value = 100;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start(now);

    // Tension oscillator
    this.tensionOsc = this.ctx.createOscillator();
    this.tensionOsc.type = 'sine';
    this.tensionOsc.frequency.value = 82.4; // E2
    this.tensionOsc.connect(this.tensionGain);
    this.tensionOsc.start(now);
  }

  setState(preset: StatePreset, transitionTime = 1.0): void {
    const now = this.ctx.currentTime;
    const endTime = now + transitionTime;

    // Filter frequency
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(preset.filterFreq, endTime);

    // Reverb mix
    this.wetGain.gain.cancelScheduledValues(now);
    this.wetGain.gain.setValueAtTime(this.wetGain.gain.value, now);
    this.wetGain.gain.linearRampToValueAtTime(preset.reverbMix, endTime);

    this.dryGain.gain.cancelScheduledValues(now);
    this.dryGain.gain.setValueAtTime(this.dryGain.gain.value, now);
    this.dryGain.gain.linearRampToValueAtTime(1 - preset.reverbMix, endTime);

    // Tension drone
    const tensionTarget = preset.tensionDrone ? 0.15 : 0;
    this.tensionGain.gain.cancelScheduledValues(now);
    this.tensionGain.gain.setValueAtTime(this.tensionGain.gain.value, now);
    this.tensionGain.gain.linearRampToValueAtTime(tensionTarget, endTime);

    // LFO rate
    if (this.lfo) {
      this.lfo.frequency.setValueAtTime(0.05 + preset.brightness * 0.1, now);
    }
  }

  triggerGoalSwell(duration = 0.5): void {
    const now = this.ctx.currentTime;

    // Volume swell
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.35, now + duration * 0.3);
    this.masterGain.gain.linearRampToValueAtTime(0.20, now + duration);

    // Filter sweep
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
    this.filter.frequency.linearRampToValueAtTime(2500, now + duration * 0.3);
    this.filter.frequency.linearRampToValueAtTime(1200, now + duration);
  }

  setVolume(value: number, rampTime = 0.5): void {
    this.masterGain.gain.linearRampToValueAtTime(
      value,
      this.ctx.currentTime + rampTime
    );
  }

  stop(): void {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    if (this.lfo) {
      try { this.lfo.stop(); } catch { /* already stopped */ }
    }
    if (this.tensionOsc) {
      try { this.tensionOsc.stop(); } catch { /* already stopped */ }
    }
    this.started = false;
  }
}

// ═══════════════════════════════════════════════════════════
// MASTER AMBIENT CONTROLLER
// ═══════════════════════════════════════════════════════════

class AmbientSoundscape {
  private static instance: AmbientSoundscape;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  private tableHum: TableHum | null = null;
  private neonBuzz: NeonBuzz | null = null;
  private digitalPad: DigitalPad | null = null;

  private currentState: AmbientState = 'menu';
  private isRunning = false;
  private initialized = false;
  private muted = false;
  private volume = 0.7; // 70% default ambient volume

  private constructor() {}

  static getInstance(): AmbientSoundscape {
    if (!AmbientSoundscape.instance) {
      AmbientSoundscape.instance = new AmbientSoundscape();
    }
    return AmbientSoundscape.instance;
  }

  async init(audioContext?: AudioContext): Promise<void> {
    if (this.initialized) return;
    if (!audioContext) return; // Require shared context — never create our own

    this.ctx = audioContext;

    // Master compression
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.compressor.connect(this.ctx.destination);

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.compressor);

    // Initialize layers
    this.tableHum = new TableHum(this.ctx);
    this.neonBuzz = new NeonBuzz(this.ctx);
    this.digitalPad = new DigitalPad(this.ctx);

    // Connect layers
    this.tableHum.connect(this.masterGain);
    this.neonBuzz.connect(this.masterGain);
    this.digitalPad.connect(this.masterGain);

    this.initialized = true;
  }

  async start(): Promise<void> {
    if (!this.ctx || !this.initialized) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.isRunning) {
      this.tableHum?.start();
      this.neonBuzz?.start();
      this.digitalPad?.start();
      this.isRunning = true;
    }

    this.setState('menu');
  }

  stop(): void {
    this.tableHum?.stop();
    this.neonBuzz?.stop();
    this.digitalPad?.stop();
    this.isRunning = false;
  }

  setState(state: AmbientState, transitionTime = 1.0): void {
    if (!this.isRunning) return;

    this.currentState = state;
    const preset = STATE_PRESETS[state];

    this.tableHum?.setVolume(preset.humVolume, transitionTime);
    this.neonBuzz?.setIntensity(preset.buzzIntensity, transitionTime);
    this.digitalPad?.setState(preset, transitionTime);
  }

  getState(): AmbientState {
    return this.currentState;
  }

  triggerGoal(): void {
    if (!this.isRunning) return;

    this.digitalPad?.triggerGoalSwell(0.5);
    this.neonBuzz?.setIntensity(1.0, 0.1);

    // Return to previous intensity after swell
    setTimeout(() => {
      const preset = STATE_PRESETS[this.currentState];
      this.neonBuzz?.setIntensity(preset.buzzIntensity, 0.4);
    }, 500);
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.volume,
        (this.ctx?.currentTime || 0) + 0.1
      );
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        muted ? 0 : this.volume,
        (this.ctx?.currentTime || 0) + 0.1
      );
    }
  }

  pause(): void {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        0,
        (this.ctx?.currentTime || 0) + 0.5
      );
    }
  }

  resume(): void {
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.volume,
        (this.ctx?.currentTime || 0) + 0.5
      );
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export default AmbientSoundscape;

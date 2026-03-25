/**
 * SynthAudio - Game SFX using HTML5 Audio elements
 *
 * Uses pre-rendered WAV files played via <audio> elements for maximum
 * compatibility with iOS webviews (Warpcast, etc.) where Web Audio API
 * is unreliable or completely blocked.
 *
 * Lazy-loads: Audio elements are created on first play, not on init.
 * This avoids blocking the main thread with 60+ simultaneous network requests.
 */

type SfxName =
  | 'hit_0' | 'hit_1' | 'hit_2' | 'hit_3' | 'hit_4'
  | 'wall_bounce'
  | 'goal_player' | 'goal_opponent'
  | 'countdown_beep' | 'countdown_go'
  | 'match_point' | 'match_end'
  | 'victory' | 'defeat'
  | 'click' | 'hover' | 'back'
  | 'toggle_on' | 'toggle_off'
  | 'error'
  | 'panel_open' | 'panel_close';

class SynthAudio {
  private static instance: SynthAudio;

  /** Lazily-created Audio elements per SFX name */
  private elements: Map<SfxName, HTMLAudioElement> = new Map();

  private initialized = false;
  private unlocked = false;
  private muted = false;

  private masterVolume = 0.8;
  private sfxVolume = 1.0;

  private constructor() {}

  static getInstance(): SynthAudio {
    if (!SynthAudio.instance) {
      SynthAudio.instance = new SynthAudio();
    }
    return SynthAudio.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    // No eager loading — elements created lazily on first play
  }

  /** Get or create an Audio element for a sound */
  private getAudio(name: SfxName): HTMLAudioElement {
    let audio = this.elements.get(name);
    if (!audio) {
      audio = new Audio(`/audio/sfx/${name}.wav`);
      audio.preload = 'auto';
      this.elements.set(name, audio);
    }
    return audio;
  }

  /**
   * Unlock audio on user gesture.
   * iOS requires play() inside a user-initiated event.
   * Only unlocks already-created elements (not all 22).
   */
  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;

    for (const el of this.elements.values()) {
      if (el.paused) {
        el.volume = 0;
        el.play().then(() => {
          el.pause();
          el.currentTime = 0;
          el.volume = 1;
        }).catch(() => {});
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CORE PLAYBACK
  // ═══════════════════════════════════════════════════════════

  private play(name: SfxName, volume?: number): void {
    if (this.muted || !this.initialized) return;

    const audio = this.getAudio(name);
    const effectiveVolume = (volume ?? 1) * this.sfxVolume * this.masterVolume;
    audio.volume = Math.max(0, Math.min(1, effectiveVolume));
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // ═══════════════════════════════════════════════════════════
  // VOLUME CONTROL
  // ═══════════════════════════════════════════════════════════

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(_volume: number): void {
    // Music is handled by MusicPlayer — no-op here for interface compat
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  // ═══════════════════════════════════════════════════════════
  // GAMEPLAY SOUNDS
  // ═══════════════════════════════════════════════════════════

  playHit(velocity: number): void {
    let intensity: number;
    if (velocity < 3) intensity = 0;
    else if (velocity < 8) intensity = 1;
    else if (velocity < 15) intensity = 2;
    else if (velocity < 25) intensity = 3;
    else intensity = 4;

    this.play(`hit_${intensity}` as SfxName);
  }

  playWallBounce(): void {
    this.play('wall_bounce');
  }

  playGoal(isPlayer: boolean): void {
    this.play(isPlayer ? 'goal_player' : 'goal_opponent');
  }

  playCountdownBeep(): void {
    this.play('countdown_beep');
  }

  playCountdownGo(): void {
    this.play('countdown_go');
  }

  playMatchPoint(): void {
    this.play('match_point');
  }

  playMatchEnd(): void {
    this.play('match_end');
  }

  playVictory(): void {
    this.play('victory');
  }

  playDefeat(): void {
    this.play('defeat');
  }

  // ═══════════════════════════════════════════════════════════
  // UI SOUNDS
  // ═══════════════════════════════════════════════════════════

  playClick(): void {
    this.play('click');
  }

  playHover(): void {
    this.play('hover');
  }

  playBack(): void {
    this.play('back');
  }

  playToggle(isOn: boolean): void {
    this.play(isOn ? 'toggle_on' : 'toggle_off');
  }

  playError(): void {
    this.play('error');
  }

  playPanelOpen(): void {
    this.play('panel_open');
  }

  playPanelClose(): void {
    this.play('panel_close');
  }

  // ═══════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════

  dispose(): void {
    for (const audio of this.elements.values()) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    this.elements.clear();
    this.initialized = false;
    this.unlocked = false;
  }
}

export default SynthAudio;

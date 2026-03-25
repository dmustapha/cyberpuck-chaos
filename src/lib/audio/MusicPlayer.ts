/**
 * MusicPlayer - Background music using HTML5 Audio elements
 *
 * Uses <audio> elements instead of Web Audio API for maximum compatibility
 * with iOS webviews (Warpcast, etc.) where AudioContext is unreliable.
 * Crossfading is done via requestAnimationFrame volume transitions.
 */

export type MusicTrack = 'menu' | 'gameplay' | 'overtime' | 'victory' | 'defeat';

interface TrackConfig {
  url: string;
  loop: boolean;
  volume: number;
}

const TRACK_CONFIGS: Record<MusicTrack, TrackConfig> = {
  menu: { url: '/audio/music/menu-theme.mp3', loop: true, volume: 1.0 },
  gameplay: { url: '/audio/music/gameplay-loop.mp3', loop: true, volume: 1.0 },
  overtime: { url: '/audio/music/overtime.mp3', loop: true, volume: 1.0 },
  victory: { url: '/audio/music/victory.mp3', loop: false, volume: 1.0 },
  defeat: { url: '/audio/music/defeat.mp3', loop: false, volume: 1.0 },
};

const CROSSFADE_DURATION = 1.5; // seconds

class MusicPlayer {
  private static instance: MusicPlayer;

  private currentAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private fadeFrame: number | null = null;
  private pendingCleanup: HTMLAudioElement[] = [];

  private initialized = false;
  private muted = false;
  private volume = 0.6;

  private constructor() {}

  static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  /**
   * Retry playing current track if blocked by autoplay policy.
   * Call from a user gesture handler (click/touch).
   */
  unlock(): void {
    if (this.currentTrack && this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {});
    }
  }

  async play(track: MusicTrack): Promise<void> {
    if (!this.initialized) return;

    // Same track already playing
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    const config = TRACK_CONFIGS[track];
    const newAudio = new Audio(config.url);
    newAudio.loop = config.loop;
    newAudio.preload = 'auto';

    // Handle non-looping track end
    if (!config.loop) {
      newAudio.addEventListener('ended', () => {
        if (this.currentAudio === newAudio) {
          this.currentAudio = null;
          this.currentTrack = null;
        }
      });
    }

    // Crossfade if something is currently playing
    if (this.currentAudio && !this.currentAudio.paused) {
      this.crossfadeTo(newAudio, track, config);
    } else {
      this.cancelFade();
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.removeAttribute('src');
        this.currentAudio.load();
      }

      this.currentAudio = newAudio;
      this.currentTrack = track;
      newAudio.volume = this.muted ? 0 : this.volume * config.volume;

      newAudio.play().catch(() => {
        // Autoplay blocked — will retry via unlock() on next user gesture
      });
    }
  }

  private crossfadeTo(newAudio: HTMLAudioElement, track: MusicTrack, config: TrackConfig): void {
    this.cancelFade();

    // Track old audio for cleanup (handles rapid switching)
    if (this.currentAudio) {
      this.pendingCleanup.push(this.currentAudio);
    }

    const oldAudio = this.currentAudio;
    const oldVolume = oldAudio ? oldAudio.volume : 0;
    const targetVolume = this.muted ? 0 : this.volume * config.volume;

    // Start new track silent
    newAudio.volume = 0;
    newAudio.play().catch(() => {});

    // Update state immediately
    this.currentAudio = newAudio;
    this.currentTrack = track;

    // Animate crossfade with rAF
    const startTime = performance.now();
    const duration = CROSSFADE_DURATION * 1000;

    const fade = () => {
      const progress = Math.min((performance.now() - startTime) / duration, 1);

      if (oldAudio) {
        oldAudio.volume = Math.max(0, oldVolume * (1 - progress));
      }
      newAudio.volume = targetVolume * progress;

      if (progress < 1) {
        this.fadeFrame = requestAnimationFrame(fade);
      } else {
        // Clean up ALL pending audio elements (handles rapid switching)
        for (const audio of this.pendingCleanup) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
        this.pendingCleanup = [];
        this.fadeFrame = null;
      }
    };

    this.fadeFrame = requestAnimationFrame(fade);
  }

  private cancelFade(): void {
    if (this.fadeFrame !== null) {
      cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }
  }

  stop(fadeOut = true): void {
    this.cancelFade();

    const audio = this.currentAudio;
    if (!audio) return;

    // Clear state immediately
    this.currentAudio = null;
    this.currentTrack = null;

    if (fadeOut) {
      const startVolume = audio.volume;
      const startTime = performance.now();

      const fade = () => {
        const progress = Math.min((performance.now() - startTime) / 500, 1);
        audio.volume = Math.max(0, startVolume * (1 - progress));

        if (progress < 1) {
          this.fadeFrame = requestAnimationFrame(fade);
        } else {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
          this.fadeFrame = null;
        }
      };
      this.fadeFrame = requestAnimationFrame(fade);
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }

  pause(): void {
    this.currentAudio?.pause();
  }

  resume(): void {
    if (this.currentAudio && this.currentTrack) {
      this.currentAudio.play().catch(() => {});
    }
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.currentAudio && !this.muted) {
      const config = this.currentTrack ? TRACK_CONFIGS[this.currentTrack] : { volume: 1 };
      this.currentAudio.volume = this.volume * config.volume;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.currentAudio) {
      if (muted) {
        this.currentAudio.volume = 0;
      } else {
        const config = this.currentTrack ? TRACK_CONFIGS[this.currentTrack] : { volume: 1 };
        this.currentAudio.volume = this.volume * config.volume;
      }
    }
  }

  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  hasTracksAvailable(): boolean {
    return true; // HTML5 Audio loads on demand
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  playMenuMusic(): void { this.play('menu'); }
  playGameMusic(): void { this.play('gameplay'); }
  playOvertimeMusic(): void { this.play('overtime'); }
  playVictory(): void { this.stop(false); this.play('victory'); }
  playDefeat(): void { this.stop(false); this.play('defeat'); }
  stopMusic(): void { this.stop(true); }
}

export default MusicPlayer;

// File: src/lib/audio/AudioManager.ts
import { Howl, Howler } from 'howler';

type SoundName =
  | 'wallHit'
  | 'paddleHit'
  | 'goalScored'
  | 'countdown'
  | 'matchStart'
  | 'modifierActivate'
  | 'modifierExpire'
  | 'victory';

const SOUND_FILES: Record<SoundName, string> = {
  wallHit: '/sounds/wall-hit.mp3',
  paddleHit: '/sounds/paddle-hit.mp3',
  goalScored: '/sounds/goal-scored.mp3',
  countdown: '/sounds/countdown.mp3',
  matchStart: '/sounds/match-start.mp3',
  modifierActivate: '/sounds/modifier-activate.mp3',
  modifierExpire: '/sounds/modifier-expire.mp3',
  victory: '/sounds/victory.mp3',
};

class AudioManagerSingleton {
  private sounds: Map<SoundName, Howl> = new Map();
  private muted = false;
  private volume = 0.7;
  private initialized = false;

  init(): void {
    if (this.initialized) return;

    for (const [name, src] of Object.entries(SOUND_FILES)) {
      this.sounds.set(name as SoundName, new Howl({
        src: [src],
        volume: this.volume,
        preload: true,
      }));
    }

    this.initialized = true;
  }

  play(name: SoundName): void {
    if (this.muted || !this.initialized) return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Slight pitch variation for impacts (±5%)
      if (name === 'wallHit' || name === 'paddleHit') {
        sound.rate(0.95 + Math.random() * 0.1);
      }
      sound.play();
    }
  }

  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(1, level));
    Howler.volume(this.volume);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}

export const audioManager = new AudioManagerSingleton();

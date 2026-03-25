/**
 * Audio System Types for Cyber Air Hockey
 * Based on "Neon Voltage" audio design specification
 */

// Sound effect identifiers
export type SFXName =
  // Gameplay - Hits (5 intensity levels mapped by velocity)
  | 'paddleHitLight'
  | 'paddleHitMedium'
  | 'paddleHitHeavy'
  | 'paddleHitPower'
  | 'paddleHitCritical'
  // Gameplay - Bounces
  | 'wallBounce'
  // Gameplay - Goals
  | 'goalPlayer'
  | 'goalOpponent'
  // Gameplay - Match flow
  | 'countdownBeep'
  | 'countdownGo'
  | 'matchPoint'
  | 'matchEnd'
  // UI - Navigation
  | 'uiHover'
  | 'uiClick'
  | 'uiBack'
  | 'uiToggleOn'
  | 'uiToggleOff'
  | 'uiError'
  | 'panelOpen'
  | 'panelClose';

// Music track identifiers
export type MusicName =
  | 'menu'        // 98 BPM, anticipatory
  | 'gameplay'    // 128 BPM, driving
  | 'overtime'    // 145 BPM, intense
  | 'victory'     // 130 BPM, triumphant sting
  | 'defeat';     // 88 BPM, reflective sting

// Ambient sound identifiers
export type AmbientName = 'arenaLoop';

// Hit intensity levels (0-4)
export type HitIntensity = 0 | 1 | 2 | 3 | 4;

// Sound configuration types
export interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

export interface VariantSoundConfig {
  variants: string[];
  volume?: number;
}

export interface AudioConfig {
  music: Record<MusicName, SoundConfig>;
  sfx: Record<SFXName, SoundConfig | VariantSoundConfig>;
  ambient: Record<AmbientName, SoundConfig>;
}

// Audio state
export interface AudioState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMuted: boolean;
  currentMusic: MusicName | null;
}

// SFX playback options
export interface SFXOptions {
  volume?: number;    // Override channel volume (0.0 - 1.0)
  rate?: number;      // Playback rate (0.5 - 2.0)
  pan?: number;       // Stereo pan (-1.0 to 1.0)
}

// Volume channels
export interface VolumeChannels {
  master: number;   // 0-100
  music: number;    // 0-100
  sfx: number;      // 0-100
  ambient: number;  // 0-100
}

// Velocity thresholds for hit intensity mapping
export const VELOCITY_THRESHOLDS = {
  light: 3,     // < 3 = light
  medium: 8,    // 3-8 = medium
  heavy: 15,    // 8-15 = heavy
  power: 25,    // 15-25 = power
  // >= 25 = critical
} as const;

// Map velocity to hit intensity
export function velocityToIntensity(velocity: number): HitIntensity {
  if (velocity < VELOCITY_THRESHOLDS.light) return 0;
  if (velocity < VELOCITY_THRESHOLDS.medium) return 1;
  if (velocity < VELOCITY_THRESHOLDS.heavy) return 2;
  if (velocity < VELOCITY_THRESHOLDS.power) return 3;
  return 4;
}

// Map intensity to SFX name
export function intensityToSFXName(intensity: HitIntensity): SFXName {
  const names: Record<HitIntensity, SFXName> = {
    0: 'paddleHitLight',
    1: 'paddleHitMedium',
    2: 'paddleHitHeavy',
    3: 'paddleHitPower',
    4: 'paddleHitCritical',
  };
  return names[intensity];
}

// Hook return type
export interface UseAudioReturn {
  // State
  isInitialized: boolean;
  isUnlocked: boolean;
  isMuted: boolean;

  // Initialization
  unlock: () => Promise<void>;

  // SFX
  playSFX: (name: SFXName, options?: SFXOptions) => void;
  playHit: (velocity: number) => void;
  playWallBounce: () => void;
  playGoal: (isPlayer: boolean) => void;

  // UI Sounds
  playClick: () => void;
  playHover: () => void;

  // Music
  playMusic: (track: MusicName) => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  stopMusic: () => void;
  fadeToTrack: (track: MusicName, duration?: number) => void;

  // Ambient
  playAmbient: () => void;
  stopAmbient: () => void;

  // Global controls
  mute: () => void;
  unmute: () => void;
  toggleMute: () => boolean;
}

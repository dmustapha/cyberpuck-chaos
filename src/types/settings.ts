/**
 * Settings Types for Cyber Esports Air Hockey
 */

import type { Difficulty, MatchType, ScoreToWin } from './match';

export interface GameSettings {
  scoreToWin: ScoreToWin;
  aiDifficulty: Difficulty;
  matchType: MatchType;
}

export interface DisplaySettings {
  particleEffects: boolean;
  glowEffects: boolean;
  hudAnimations: boolean;
  screenShake: boolean;
  showFPS: boolean;
  reducedMotion: boolean;
}

export interface AudioSettings {
  masterVolume: number; // 0-100
  sfxVolume: number; // 0-100
  musicVolume: number; // 0-100
  ambientVolume: number; // 0-100
}

export interface ControlSettings {
  sensitivity: number; // 0.5-2.0
  invertY: boolean;
  touchMode: 'direct' | 'relative';
}

export interface AppSettings {
  game: GameSettings;
  display: DisplaySettings;
  audio: AudioSettings;
  controls: ControlSettings;
}

// Default settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  scoreToWin: 7,
  aiDifficulty: 'medium',
  matchType: 'ranked',
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  particleEffects: true,
  glowEffects: true,
  hudAnimations: true,
  screenShake: true,
  showFPS: false,
  reducedMotion: false,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 80,
  sfxVolume: 100,
  musicVolume: 60,
  ambientVolume: 70,
};

export const DEFAULT_CONTROL_SETTINGS: ControlSettings = {
  sensitivity: 1.0,
  invertY: false,
  touchMode: 'direct',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  game: DEFAULT_GAME_SETTINGS,
  display: DEFAULT_DISPLAY_SETTINGS,
  audio: DEFAULT_AUDIO_SETTINGS,
  controls: DEFAULT_CONTROL_SETTINGS,
};

/**
 * Settings Store - Manages user preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppSettings,
  GameSettings,
  DisplaySettings,
  AudioSettings,
  ControlSettings,
} from '@/types/settings';

interface SettingsStore {
  // State
  settings: AppSettings;

  // Actions
  updateGameSettings: (settings: Partial<GameSettings>) => void;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateControlSettings: (settings: Partial<ControlSettings>) => void;
  resetSettings: () => void;
  resetGameSettings: () => void;
  resetDisplaySettings: () => void;
  resetAudioSettings: () => void;
  resetControlSettings: () => void;
}

const defaultGameSettings: GameSettings = {
  scoreToWin: 7,
  aiDifficulty: 'medium',
  matchType: 'ranked',
};

const defaultDisplaySettings: DisplaySettings = {
  particleEffects: true,
  glowEffects: true,
  hudAnimations: true,
  screenShake: true,
  showFPS: false,
  reducedMotion: false,
};

const defaultAudioSettings: AudioSettings = {
  masterVolume: 80,
  sfxVolume: 100,
  musicVolume: 50,
  ambientVolume: 70,
};

const defaultControlSettings: ControlSettings = {
  sensitivity: 1.0,
  invertY: false,
  touchMode: 'direct',
};

const defaultSettings: AppSettings = {
  game: defaultGameSettings,
  display: defaultDisplaySettings,
  audio: defaultAudioSettings,
  controls: defaultControlSettings,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,

      // Actions
      updateGameSettings: (gameSettings) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            game: { ...settings.game, ...gameSettings },
          },
        });
      },

      updateDisplaySettings: (displaySettings) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            display: { ...settings.display, ...displaySettings },
          },
        });
      },

      updateAudioSettings: (audioSettings) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            audio: { ...settings.audio, ...audioSettings },
          },
        });
      },

      updateControlSettings: (controlSettings) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            controls: { ...settings.controls, ...controlSettings },
          },
        });
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      resetGameSettings: () => {
        const { settings } = get();
        set({
          settings: { ...settings, game: defaultGameSettings },
        });
      },

      resetDisplaySettings: () => {
        const { settings } = get();
        set({
          settings: { ...settings, display: defaultDisplaySettings },
        });
      },

      resetAudioSettings: () => {
        const { settings } = get();
        set({
          settings: { ...settings, audio: defaultAudioSettings },
        });
      },

      resetControlSettings: () => {
        const { settings } = get();
        set({
          settings: { ...settings, controls: defaultControlSettings },
        });
      },
    }),
    {
      name: 'cyber_hockey_settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Export defaults for reference
export { defaultSettings, defaultGameSettings, defaultDisplaySettings, defaultAudioSettings, defaultControlSettings };

/**
 * Sound Configuration for Cyber Air Hockey
 * "Neon Voltage" Audio Design Specification
 *
 * Asset structure:
 * /public/audio/
 * ├── /music/     - Background tracks (OGG for seamless looping)
 * ├── /sfx/       - Sound effects (WAV for precision)
 * └── /ambient/   - Atmospheric loops (OGG)
 */

import { AudioConfig, SoundConfig, VariantSoundConfig } from './types';

export const AUDIO_CONFIG: AudioConfig = {
  // ═══════════════════════════════════════════════════════════
  // MUSIC TRACKS
  // Synthwave style, minor keys, 98-145 BPM
  // ═══════════════════════════════════════════════════════════
  music: {
    menu: {
      src: '/audio/music/menu-theme.ogg',
      loop: true,
      volume: 0.4,
    },
    gameplay: {
      src: '/audio/music/gameplay-loop.ogg',
      loop: true,
      volume: 0.5,
    },
    overtime: {
      src: '/audio/music/overtime-intensity.ogg',
      loop: true,
      volume: 0.55,
    },
    victory: {
      src: '/audio/music/sting-victory.ogg',
      loop: false,
      volume: 0.7,
    },
    defeat: {
      src: '/audio/music/sting-defeat.ogg',
      loop: false,
      volume: 0.6,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // SOUND EFFECTS
  // Layered digital + analog character
  // ═══════════════════════════════════════════════════════════
  sfx: {
    // ─────────────────────────────────────────────────────────
    // Paddle Hits - 5 intensity levels
    // Each level has variants for variation
    // ─────────────────────────────────────────────────────────
    paddleHitLight: {
      src: '/audio/sfx/hits/paddle-light.wav',
      volume: 0.5,
    },
    paddleHitMedium: {
      src: '/audio/sfx/hits/paddle-medium.wav',
      volume: 0.6,
    },
    paddleHitHeavy: {
      src: '/audio/sfx/hits/paddle-heavy.wav',
      volume: 0.7,
    },
    paddleHitPower: {
      src: '/audio/sfx/hits/paddle-power.wav',
      volume: 0.8,
    },
    paddleHitCritical: {
      src: '/audio/sfx/hits/paddle-critical.wav',
      volume: 0.9,
    },

    // ─────────────────────────────────────────────────────────
    // Wall Bounces - Multiple variants for variety
    // ─────────────────────────────────────────────────────────
    wallBounce: {
      variants: [
        '/audio/sfx/game/wall-bounce-1.wav',
        '/audio/sfx/game/wall-bounce-2.wav',
        '/audio/sfx/game/wall-bounce-3.wav',
      ],
      volume: 0.4,
    },

    // ─────────────────────────────────────────────────────────
    // Goals - Distinct sounds for player vs opponent
    // ─────────────────────────────────────────────────────────
    goalPlayer: {
      src: '/audio/sfx/game/goal-player.wav',
      volume: 0.8,
    },
    goalOpponent: {
      src: '/audio/sfx/game/goal-opponent.wav',
      volume: 0.7,
    },

    // ─────────────────────────────────────────────────────────
    // Match Flow
    // ─────────────────────────────────────────────────────────
    countdownBeep: {
      src: '/audio/sfx/game/countdown-beep.wav',
      volume: 0.6,
    },
    countdownGo: {
      src: '/audio/sfx/game/countdown-go.wav',
      volume: 0.75,
    },
    matchPoint: {
      src: '/audio/sfx/game/match-point.wav',
      volume: 0.7,
    },
    matchEnd: {
      src: '/audio/sfx/game/match-end.wav',
      volume: 0.75,
    },

    // ─────────────────────────────────────────────────────────
    // UI Sounds - Electric arcade cabinet feel
    // ─────────────────────────────────────────────────────────
    uiHover: {
      src: '/audio/sfx/ui/hover.wav',
      volume: 0.3,
    },
    uiClick: {
      src: '/audio/sfx/ui/click.wav',
      volume: 0.5,
    },
    uiBack: {
      src: '/audio/sfx/ui/back.wav',
      volume: 0.45,
    },
    uiToggleOn: {
      src: '/audio/sfx/ui/toggle-on.wav',
      volume: 0.5,
    },
    uiToggleOff: {
      src: '/audio/sfx/ui/toggle-off.wav',
      volume: 0.45,
    },
    uiError: {
      src: '/audio/sfx/ui/error.wav',
      volume: 0.5,
    },
    panelOpen: {
      src: '/audio/sfx/ui/panel-open.wav',
      volume: 0.4,
    },
    panelClose: {
      src: '/audio/sfx/ui/panel-close.wav',
      volume: 0.35,
    },
  },

  // ═══════════════════════════════════════════════════════════
  // AMBIENT SOUNDS
  // Universal electric arena atmosphere
  // ═══════════════════════════════════════════════════════════
  ambient: {
    arenaLoop: {
      src: '/audio/ambient/arena-loop.ogg',
      loop: true,
      volume: 0.25,
    },
  },
};

// Helper to check if config has variants
export function isVariantConfig(
  config: SoundConfig | VariantSoundConfig
): config is VariantSoundConfig {
  return 'variants' in config;
}

// Get all sound file paths for preloading
export function getAllSoundPaths(): string[] {
  const paths: string[] = [];

  // Music
  Object.values(AUDIO_CONFIG.music).forEach((config) => {
    paths.push(config.src);
  });

  // SFX
  Object.values(AUDIO_CONFIG.sfx).forEach((config) => {
    if (isVariantConfig(config)) {
      paths.push(...config.variants);
    } else {
      paths.push(config.src);
    }
  });

  // Ambient
  Object.values(AUDIO_CONFIG.ambient).forEach((config) => {
    paths.push(config.src);
  });

  return paths;
}

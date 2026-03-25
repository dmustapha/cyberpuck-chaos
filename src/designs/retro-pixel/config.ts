import { DesignConfig } from '../types';

export const retroPixelConfig: DesignConfig = {
  id: 'retro-pixel',
  name: 'Retro Pixel',
  description: '8-bit pixel art style with chunky graphics and nostalgia',

  colors: {
    background: '#000000',
    backgroundSecondary: '#001100',
    surface: '#002200',
    border: '#00ff00',

    player1: '#00ff00',
    player1Glow: '#00ff00',
    player2: '#ff0000',
    player2Glow: '#ff0000',

    puck: '#ffff00',
    puckGlow: '#ffff00',

    text: '#00ff00',
    textMuted: '#008800',
    accent: '#ffff00',

    goalZone1: '#00ff0030',
    goalZone2: '#ff000030',
  },

  effects: {
    glowIntensity: 10,
    scanlines: true,
    crtCurve: false,
    pixelated: true,
    trailEffect: false,
    screenShake: true,
  },

  fonts: {
    heading: "var(--font-press-start), 'Press Start 2P', monospace",
    body: "var(--font-press-start), 'Press Start 2P', monospace",
    score: "var(--font-press-start), 'Press Start 2P', monospace",
  },
};

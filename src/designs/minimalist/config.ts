import { DesignConfig } from '../types';

export const minimalistConfig: DesignConfig = {
  id: 'minimalist',
  name: 'Minimalist Pro',
  description: 'Clean tournament-ready interface with elegant simplicity',

  colors: {
    background: '#fafafa',
    backgroundSecondary: '#f0f0f0',
    surface: '#ffffff',
    border: '#e0e0e0',

    player1: '#1a1a1a',
    player1Glow: '#00000010',
    player2: '#666666',
    player2Glow: '#00000010',

    puck: '#1a1a1a',
    puckGlow: '#00000020',

    text: '#1a1a1a',
    textMuted: '#888888',
    accent: '#0066ff',

    goalZone1: '#22c55e20',
    goalZone2: '#ef444420',
  },

  effects: {
    glowIntensity: 0,
    scanlines: false,
    crtCurve: false,
    pixelated: false,
    trailEffect: false,
    screenShake: false,
  },

  fonts: {
    heading: "var(--font-inter), -apple-system, sans-serif",
    body: "var(--font-inter), -apple-system, sans-serif",
    score: "'SF Mono', 'Roboto Mono', monospace",
  },
};

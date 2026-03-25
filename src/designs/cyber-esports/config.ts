import { DesignConfig } from '../types';

export const cyberEsportsConfig: DesignConfig = {
  id: 'cyber-esports',
  name: 'Cyber Esports',
  description: 'Futuristic competitive gaming with stats and rankings',

  colors: {
    background: '#030712',
    backgroundSecondary: '#111827',
    surface: '#1f2937',
    border: '#1E40AF',

    player1: '#10b981',
    player1Glow: '#10b981',
    player2: '#f43f5e',
    player2Glow: '#f43f5e',

    puck: '#f8fafc',
    puckGlow: '#1D4ED8',

    text: '#f8fafc',
    textMuted: '#6b7280',
    accent: '#1D4ED8',

    goalZone1: '#10b98130',
    goalZone2: '#f43f5e30',
  },

  effects: {
    glowIntensity: 20,
    scanlines: false,
    crtCurve: false,
    pixelated: false,
    trailEffect: true,
    screenShake: true,
  },

  fonts: {
    heading: "var(--font-orbitron), 'Orbitron', sans-serif",
    body: "var(--font-inter), 'Exo 2', sans-serif",
    score: "var(--font-orbitron), 'Orbitron', monospace",
  },
};

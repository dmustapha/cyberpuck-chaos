import { DesignConfig } from '../types';

export const neonArcadeConfig: DesignConfig = {
  id: 'neon-arcade',
  name: 'Neon Arcade',
  description: '1980s arcade cabinet with CRT effects and neon glow',

  colors: {
    background: '#0a0015',
    backgroundSecondary: '#1a0030',
    surface: '#12001f',
    border: '#ff00ff',

    player1: '#00ff88',
    player1Glow: '#00ff88',
    player2: '#ff0088',
    player2Glow: '#ff0088',

    puck: '#ffffff',
    puckGlow: '#00ffff',

    text: '#ffffff',
    textMuted: '#888899',
    accent: '#ffff00',

    goalZone1: '#00ff8840',
    goalZone2: '#ff008840',
  },

  effects: {
    glowIntensity: 30,
    scanlines: true,
    crtCurve: false,
    pixelated: false,
    trailEffect: true,
    screenShake: true,
  },

  fonts: {
    heading: "var(--font-orbitron), 'Orbitron', sans-serif",
    body: "var(--font-orbitron), 'Orbitron', sans-serif",
    score: "var(--font-orbitron), 'Orbitron', monospace",
  },
};

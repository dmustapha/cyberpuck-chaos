import { DesignConfig } from '../types';

export const iceStadiumConfig: DesignConfig = {
  id: 'ice-stadium',
  name: 'Ice Stadium',
  description: 'Realistic hockey arena with broadcast-style presentation',

  colors: {
    background: '#0c1929',
    backgroundSecondary: '#1a3a5c',
    surface: '#d4e5f7',
    border: '#2563eb',

    player1: '#1e40af',
    player1Glow: '#3b82f640',
    player2: '#dc2626',
    player2Glow: '#ef444440',

    puck: '#1a1a1a',
    puckGlow: '#00000040',

    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#fbbf24',

    goalZone1: '#dc262640',
    goalZone2: '#dc262640',
  },

  effects: {
    glowIntensity: 5,
    scanlines: false,
    crtCurve: false,
    pixelated: false,
    trailEffect: true,
    screenShake: false,
  },

  fonts: {
    heading: "var(--font-bebas), 'Bebas Neue', sans-serif",
    body: "var(--font-inter), 'Open Sans', sans-serif",
    score: "var(--font-bebas), 'Bebas Neue', sans-serif",
  },
};

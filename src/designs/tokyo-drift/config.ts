import { DesignConfig } from '../types';

export const tokyoDriftConfig: DesignConfig = {
  id: 'tokyo-drift',
  name: 'Tokyo Drift',
  description: 'Neon-soaked Tokyo street racing aesthetic',
  colors: {
    // Deep purple-black night sky, like Tokyo at 2am
    background: '#0a0312',
    backgroundSecondary: '#150520',

    // Dark asphalt surface with subtle purple tint
    surface: '#1a0f2e',

    // Hot pink neon border - like Tokyo street lights
    border: '#ff006e',

    // Player 1: Electric cyan (bottom paddle) - drift car headlights
    player1: '#00f5ff',
    player1Glow: '#00f5ff',

    // Player 2: Hot pink/magenta (top paddle) - tail lights
    player2: '#ff006e',
    player2Glow: '#ff006e',

    // Puck: White with intense cyan glow - like a racing puck
    puck: '#ffffff',
    puckGlow: '#00f5ff',

    // Text: Clean white with cyan accent
    text: '#ffffff',
    textMuted: '#a89bff',

    // Accent: Japanese red (rising sun)
    accent: '#ff3366',

    // Goal zones: Glowing neon with transparency
    goalZone1: '#00f5ff40', // Bottom - cyan with 25% opacity
    goalZone2: '#ff006e40', // Top - pink with 25% opacity

    // Extended colors for full app
    primary: '#00f5ff',
    secondary: '#ff006e',
    success: '#00ff88',
    warning: '#ffcc00',
    error: '#ff3366',
    navBackground: 'rgba(10, 3, 18, 0.95)',
    cardBackground: '#1a0f2e',
    buttonPrimary: '#00f5ff',
    buttonSecondary: '#ff006e',
  },
  effects: {
    // Maximum glow for that neon street aesthetic
    glowIntensity: 28,

    // No retro effects - this is modern Tokyo
    scanlines: false,
    crtCurve: false,
    pixelated: false,

    // Drift trail like tire marks on asphalt
    trailEffect: true,

    // Shake on impact like drift collisions
    screenShake: true,
  },
  fonts: {
    // Bold, angular heading - Japanese street culture
    heading: "'Bebas Neue', 'Anton', 'Impact', sans-serif",

    // Clean, modern body text
    body: "'Inter', 'Helvetica Neue', sans-serif",

    // Sharp, technical score display - like racing timers
    score: "'Orbitron', 'Share Tech Mono', monospace",
  },
  backgroundEffect: 'gradient',
  backgroundGradient: 'radial-gradient(ellipse at top, #1a0f2e 0%, #0a0312 50%), radial-gradient(ellipse at bottom, #200f35 0%, #0a0312 70%)',
};

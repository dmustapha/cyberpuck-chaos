import { DesignConfig } from '../types';

export const synthwaveSunsetConfig: DesignConfig = {
  id: 'synthwave-sunset',
  name: 'Synthwave Sunset',
  description: '80s retrowave vibes with sunset gradients',
  colors: {
    // Deep purple-navy night sky background with gradient feel
    background: '#1a0a2e',
    backgroundSecondary: '#16213e',

    // Table surface: darker purple with slight transparency for scanline effect
    surface: '#2d1b4e',

    // Chrome/silver border with slight pink tint
    border: '#c792ff',

    // Player 1: Hot pink/magenta (classic synthwave color)
    player1: '#ff006e',
    player1Glow: '#ff4d94',

    // Player 2: Electric cyan/turquoise (synthwave complementary)
    player2: '#00f5ff',
    player2Glow: '#6efaff',

    // Puck: Bright orange-yellow (sunset core)
    puck: '#ffb703',
    puckGlow: '#fb8500',

    // Text: Bright cyan for that retro computer feel
    text: '#00f5ff',
    textMuted: '#8338ec',

    // Accent: Hot pink
    accent: '#ff006e',

    // Goal zones: Subtle purple with pink/cyan tints
    goalZone1: 'rgba(255, 0, 110, 0.15)',
    goalZone2: 'rgba(0, 245, 255, 0.15)',

    // Extended colors for full app
    primary: '#ff006e',
    secondary: '#00f5ff',
    success: '#00ff99',
    warning: '#ffb703',
    error: '#ff3366',
    navBackground: 'rgba(26, 10, 46, 0.98)',
    cardBackground: '#2d1b4e',
    buttonPrimary: '#ff006e',
    buttonSecondary: '#00f5ff',
  },
  effects: {
    // High glow for that neon feel (0-30 range)
    glowIntensity: 25,

    // Essential for 80s VHS aesthetic
    scanlines: true,

    // CRT curve for vintage monitor feel
    crtCurve: true,

    // No pixelation - keep it smooth like a CRT
    pixelated: false,

    // Trail effect for motion blur like old monitors
    trailEffect: true,

    // Subtle screen shake for impacts
    screenShake: true,
  },
  fonts: {
    // Retro-futuristic display font
    heading: "'Orbitron', 'Audiowide', sans-serif",

    // Clean but slightly stylized body text
    body: "'Rajdhani', 'Roboto Condensed', sans-serif",

    // Bold digital score display
    score: "'Orbitron', monospace",
  },
  backgroundEffect: 'gradient',
  backgroundGradient: 'linear-gradient(to bottom, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #ff006e20 100%)',
};

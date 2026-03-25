import { DesignConfig } from '../types';

export const moltenCoreConfig: DesignConfig = {
  id: 'molten-core',
  name: 'Molten Core',
  description: 'Volcanic intensity with flowing lava aesthetics',
  colors: {
    // Deep volcanic backgrounds
    background: '#0a0604',
    backgroundSecondary: '#1a0e08',

    // Dark charcoal surface with subtle red undertone
    surface: '#1c1210',

    // Glowing ember border
    border: '#ff4500',

    // Player 1: Molten orange/yellow (hotter lava)
    player1: '#ff6600',
    player1Glow: '#ff9933',

    // Player 2: Deep red/crimson (cooling lava)
    player2: '#cc0000',
    player2Glow: '#ff3333',

    // Puck: White-hot molten metal core
    puck: '#ffdd00',
    puckGlow: '#ff8800',

    // Text: Bright ember glow
    text: '#ffa500',
    textMuted: '#cc6600',

    // Accent: Bright lava flow
    accent: '#ff5500',

    // Goal zones: Magma pools
    goalZone1: 'rgba(255, 102, 0, 0.3)',
    goalZone2: 'rgba(204, 0, 0, 0.3)',

    // Extended colors for full app
    primary: '#ff6600',
    secondary: '#cc0000',
    success: '#4ade80',
    warning: '#ffdd00',
    error: '#ff3333',
    navBackground: 'rgba(10, 6, 4, 0.98)',
    cardBackground: '#1c1210',
    buttonPrimary: '#ff6600',
    buttonSecondary: '#cc0000',
  },
  effects: {
    // Maximum glow for that molten metal look (0-30 range)
    glowIntensity: 28,

    // No scanlines - we want pure heat distortion feel
    scanlines: false,

    // No CRT curve - keep it modern and intense
    crtCurve: false,

    // Not pixelated - smooth molten flow
    pixelated: false,

    // YES - trail effect makes puck look like flowing lava
    trailEffect: true,

    // YES - screen shake for impact intensity
    screenShake: true,
  },
  fonts: {
    // Heavy, industrial, intense fonts
    heading: "'Black Ops One', 'Impact', sans-serif",
    body: "'Teko', 'Rajdhani', sans-serif",
    score: "'Black Ops One', 'Impact', sans-serif",
  },
  backgroundEffect: 'gradient',
  backgroundGradient: 'radial-gradient(ellipse at center bottom, #2a1510 0%, #0a0604 60%), radial-gradient(ellipse at top, #1a0e08 0%, #0a0604 70%)',
};

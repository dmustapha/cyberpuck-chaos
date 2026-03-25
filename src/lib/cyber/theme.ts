/**
 * Cyber Esports Design System Tokens
 */

export const cyberTheme = {
  colors: {
    // Primary palette
    primary: '#1D4ED8', // Deep Blue - main accent
    secondary: '#1E40AF', // Blue 800 - secondary accent

    // Backgrounds
    bg: {
      primary: '#050510', // Darkest
      secondary: '#0a0a20', // Dark
      tertiary: '#111827', // Slightly lighter
      panel: 'rgba(29, 78, 216, 0.1)',
      panelHover: 'rgba(29, 78, 216, 0.15)',
      overlay: 'rgba(5, 5, 16, 0.95)',
    },

    // Player semantic colors
    player: {
      you: '#22c55e', // Green
      youDark: '#052e16',
      youGlow: 'rgba(34, 197, 94, 0.5)',
      opponent: '#ef4444', // Red
      opponentDark: '#450a0a',
      opponentGlow: 'rgba(239, 68, 68, 0.5)',
    },

    // Rank tier colors
    rank: {
      BRONZE: '#cd7f32',
      SILVER: '#c0c0c0',
      GOLD: '#ffd700',
      PLATINUM: '#00ffff',
      DIAMOND: '#b9f2ff',
      MASTER: '#ff00ff',
    },

    // State colors
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#3b82f6',

    // Text hierarchy
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
      accent: '#1D4ED8',
    },

    // Borders
    border: {
      default: 'rgba(29, 78, 216, 0.3)',
      active: '#1D4ED8',
      subtle: 'rgba(29, 78, 216, 0.1)',
    },

    // Puck
    puck: '#ffffff',
    puckGlow: 'rgba(255, 255, 255, 0.5)',
  },

  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '9xl': '8rem',
  },

  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 700,
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    // HUD pulse interval in ms
    hudPulse: 50,
    // Particle spawn interval in ms
    particleSpawn: 70,
  },

  shadows: {
    glow: (color: string) => `0 0 20px ${color}40`,
    glowStrong: (color: string) => `0 0 30px ${color}60`,
    glowText: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}`,
    panel: '0 4px 20px rgba(0, 0, 0, 0.5)',
    button: '0 4px 15px rgba(0, 0, 0, 0.3)',
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type for the theme
export type CyberTheme = typeof cyberTheme;

// Helper to get rank color
export function getRankColor(tier: keyof typeof cyberTheme.colors.rank): string {
  return cyberTheme.colors.rank[tier];
}

// Helper to create glow shadow
export function createGlow(color: string, intensity: 'normal' | 'strong' = 'normal'): string {
  return intensity === 'strong'
    ? cyberTheme.shadows.glowStrong(color)
    : cyberTheme.shadows.glow(color);
}

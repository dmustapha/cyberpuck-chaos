/**
 * Theme-aware styles hook
 * Maps the new theme system to the old cyberTheme structure
 * This allows gradual migration of components
 */

import { useThemeStore } from '@/stores/themeStore';
import { Theme } from '@/lib/themes';

/**
 * Returns a cyberTheme-compatible object that uses current theme colors
 * Use this hook to migrate components from hardcoded cyberTheme to dynamic theming
 */
export function useThemedStyles() {
  const theme = useThemeStore((state) => state.theme);
  return createThemedStyles(theme);
}

/**
 * Creates cyberTheme-compatible styles from a Theme object
 */
export function createThemedStyles(theme: Theme) {
  return {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,

      bg: {
        primary: theme.colors.background,
        secondary: adjustColor(theme.colors.background, 10),
        tertiary: adjustColor(theme.colors.background, 20),
        panel: `${theme.colors.primary}15`,
        panelHover: `${theme.colors.primary}20`,
        overlay: `${theme.colors.background}f5`,
      },

      player: {
        you: theme.colors.paddle1,
        youDark: theme.colors.paddle1Inner,
        youGlow: theme.colors.paddle1Glow,
        opponent: theme.colors.paddle2,
        opponentDark: theme.colors.paddle2Inner,
        opponentGlow: theme.colors.paddle2Glow,
      },

      rank: {
        BRONZE: '#cd7f32',
        SILVER: '#94a3b8',
        GOLD: '#fbbf24',
        PLATINUM: theme.colors.primary,
        DIAMOND: theme.colors.accent,
        MASTER: theme.colors.secondary,
      },

      success: theme.colors.primary,
      warning: '#fbbf24',
      error: theme.colors.secondary,
      info: theme.colors.accent,

      text: {
        primary: theme.colors.text,
        secondary: theme.colors.textMuted,
        muted: adjustColor(theme.colors.textMuted, -20),
        accent: theme.colors.primary,
      },

      border: {
        default: `${theme.colors.primary}33`,
        active: theme.colors.primary,
        subtle: 'rgba(255, 255, 255, 0.08)',
      },

      puck: theme.colors.puck,
      puckGlow: theme.colors.puckGlow,
    },

    fonts: {
      heading: theme.fonts.heading,
      body: theme.fonts.body,
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
      hudPulse: 50,
      particleSpawn: 70,
    },

    shadows: {
      glow: (color: string) => `0 0 ${theme.effects.glowIntensity}px ${color}40`,
      glowStrong: (color: string) => `0 0 ${theme.effects.glowIntensity * 1.5}px ${color}60`,
      glowText: (color: string) => `0 0 ${theme.effects.glowIntensity / 2}px ${color}, 0 0 ${theme.effects.glowIntensity}px ${color}`,
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

    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    // Extra: expose the raw theme for direct access
    _theme: theme,
  } as const;
}

/**
 * Adjust a hex color's brightness
 */
function adjustColor(hex: string, amount: number): string {
  // Handle rgba format
  if (hex.startsWith('rgba')) {
    return hex;
  }

  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Adjust
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

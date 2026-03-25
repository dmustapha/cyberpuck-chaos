/**
 * Design-aware styles hook
 * Maps DesignConfig to a component-friendly style object
 * Similar to useThemedStyles but works with the Design system
 */

import { useDesign } from './DesignContext';
import { DesignConfig } from './types';

/**
 * Returns a comprehensive style object based on the current design
 */
export function useDesignStyles() {
  const { config } = useDesign();
  return createDesignStyles(config);
}

/**
 * Creates component-friendly styles from a DesignConfig
 */
export function createDesignStyles(config: DesignConfig) {
  const { colors, fonts, effects } = config;

  // Derive extended colors with fallbacks
  const primary = colors.primary || colors.accent;
  const secondary = colors.secondary || colors.player2;
  const navBg = colors.navBackground || `${colors.background}f5`;
  const cardBg = colors.cardBackground || colors.surface;

  return {
    colors: {
      primary,
      secondary,

      bg: {
        primary: colors.background,
        secondary: colors.backgroundSecondary,
        tertiary: adjustColor(colors.background, 15),
        panel: `${primary}15`,
        panelHover: `${primary}25`,
        overlay: `${colors.background}f5`,
        nav: navBg,
        card: cardBg,
      },

      player: {
        you: colors.player1,
        youGlow: colors.player1Glow,
        opponent: colors.player2,
        opponentGlow: colors.player2Glow,
      },

      rank: {
        BRONZE: '#cd7f32',
        SILVER: '#94a3b8',
        GOLD: '#fbbf24',
        PLATINUM: primary,
        DIAMOND: colors.accent,
        MASTER: secondary,
      },

      success: colors.success || '#22c55e',
      warning: colors.warning || '#fbbf24',
      error: colors.error || '#ef4444',
      info: colors.accent,

      text: {
        primary: colors.text,
        secondary: colors.textMuted,
        muted: adjustColor(colors.textMuted, -20),
        accent: primary,
      },

      border: {
        default: `${primary}33`,
        active: primary,
        subtle: `${colors.border}40`,
        strong: colors.border,
      },

      surface: colors.surface,
      puck: colors.puck,
      puckGlow: colors.puckGlow,
      accent: colors.accent,
    },

    fonts: {
      heading: fonts.heading,
      body: fonts.body,
      score: fonts.score,
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

    effects: {
      glowIntensity: effects.glowIntensity,
      scanlines: effects.scanlines,
      crtCurve: effects.crtCurve,
      pixelated: effects.pixelated,
      trailEffect: effects.trailEffect,
      screenShake: effects.screenShake,
    },

    shadows: {
      glow: (color: string) => `0 0 ${effects.glowIntensity}px ${color}40`,
      glowStrong: (color: string) => `0 0 ${effects.glowIntensity * 1.5}px ${color}60`,
      glowText: (color: string) => `0 0 ${effects.glowIntensity / 2}px ${color}, 0 0 ${effects.glowIntensity}px ${color}`,
      panel: '0 4px 20px rgba(0, 0, 0, 0.5)',
      button: '0 4px 15px rgba(0, 0, 0, 0.3)',
      card: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 ${colors.border}20`,
    },

    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
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
    },

    // Raw config for direct access
    _config: config,
  } as const;
}

/**
 * Adjust a hex color's brightness
 */
function adjustColor(hex: string, amount: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    return hex;
  }

  hex = hex.replace('#', '');

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export type DesignStyles = ReturnType<typeof createDesignStyles>;

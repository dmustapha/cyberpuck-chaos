import { ReactNode } from 'react';

export type DesignId =
  | 'neon-arcade'
  | 'minimalist'
  | 'retro-pixel'
  | 'ice-stadium'
  | 'cyber-esports'
  | 'tokyo-drift'
  | 'arctic-frost'
  | 'molten-core'
  | 'synthwave-sunset'
  | 'midnight-club';

export interface DesignConfig {
  id: DesignId;
  name: string;
  description: string;

  // Visual configuration
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    border: string;

    player1: string;
    player1Glow: string;
    player2: string;
    player2Glow: string;

    puck: string;
    puckGlow: string;

    text: string;
    textMuted: string;
    accent: string;

    goalZone1: string;
    goalZone2: string;

    // Extended colors for full app
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    navBackground?: string;
    cardBackground?: string;
    buttonPrimary?: string;
    buttonSecondary?: string;
  };

  effects: {
    glowIntensity: number;
    scanlines: boolean;
    crtCurve: boolean;
    pixelated: boolean;
    trailEffect: boolean;
    screenShake: boolean;
  };

  fonts: {
    heading: string;
    body: string;
    score: string;
  };

  // Background effects (optional)
  backgroundEffect?: 'none' | 'gradient' | 'mesh' | 'particles' | 'grid';
  backgroundGradient?: string;
}

export interface DesignComponents {
  GamePage: React.ComponentType;
  GameCanvas: React.ComponentType<{ getBodies: () => any }>;
  ScoreBoard: React.ComponentType;
  Menu: React.ComponentType;
  CountdownOverlay: React.ComponentType;
  GameOverModal: React.ComponentType;
  PauseMenu: React.ComponentType;
}

export interface Design {
  config: DesignConfig;
  components: DesignComponents;
}

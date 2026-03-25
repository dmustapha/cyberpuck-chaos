/**
 * Air Hockey Theme System
 * 5 World-Class Themes
 * Each theme is a complete visual identity with unique animations
 */

export type ThemeId = 'cyber' | 'arcade' | 'retro' | 'premium' | 'electric';

export interface ThemeColors {
  // Background
  background: string;
  backgroundGradient?: string;
  backgroundSecondary?: string;

  // Table
  table: string;
  tableBorder: string;
  centerLine: string;
  centerCircle: string;

  // Goals
  goalPlayer1: string;
  goalPlayer2: string;

  // Puck
  puck: string;
  puckGlow: string;
  puckShadow?: string;

  // Paddles
  paddle1: string;
  paddle1Glow: string;
  paddle1Inner: string;
  paddle2: string;
  paddle2Glow: string;
  paddle2Inner: string;

  // UI
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;

  // Score
  score1: string;
  score2: string;
}

export interface ThemeAnimations {
  // Animation class names for each event
  scoreChange: string;
  victory: string;
  defeat: string;
  buttonHover: string;
  buttonClick: string;
  cardEnter: string;
  screenFlash: string;
  idle: string;
}

export interface ThemeEffects {
  glowIntensity: number;
  trailEffect: boolean;
  particles: boolean;
  scanlines: boolean;
  blur: number;
  // Visual effect settings
  screenCurvature: boolean;
  phosphorBloom: boolean;
  starfield: boolean;
  meshGradient: boolean;
  metallicShimmer: boolean;
  ambientLight: boolean;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  tagline: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  fonts: {
    heading: string;
    body: string;
    score: string;
  };
  animations: ThemeAnimations;
  // CSS class prefix for theme-specific styles
  cssPrefix: string;
  // Border radius style
  borderRadius: string;
}

// ============================================
// THEME 0: CYBER ESPORTS
// Deep blue neon on deep navy - esports competitive vibes
// COMPETE • DOMINATE • WIN
// ============================================
export const cyberTheme: Theme = {
  id: 'cyber',
  name: 'Cyber Esports',
  description: 'Deep blue neon on deep navy. Competitive esports aesthetics.',
  tagline: 'DOMINATE THE ARENA',
  colors: {
    background: '#050510',
    backgroundGradient: 'radial-gradient(ellipse at center, #0a0a20 0%, #050510 100%)',
    backgroundSecondary: '#0a0a20',
    table: '#080818',
    tableBorder: '#1D4ED8',
    centerLine: '#1D4ED850',
    centerCircle: '#1D4ED840',
    goalPlayer1: '#22c55e40',
    goalPlayer2: '#ef444440',
    puck: '#ffffff',
    puckGlow: '#1D4ED8',
    paddle1: '#22c55e',
    paddle1Glow: '#22c55e',
    paddle1Inner: '#052e16',
    paddle2: '#ef4444',
    paddle2Glow: '#ef4444',
    paddle2Inner: '#450a0a',
    primary: '#1D4ED8',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    text: '#f8fafc',
    textMuted: '#64748b',
    score1: '#22c55e',
    score2: '#ef4444',
  },
  effects: {
    glowIntensity: 20,
    trailEffect: true,
    particles: false,
    scanlines: false,
    blur: 0,
    screenCurvature: false,
    phosphorBloom: false,
    starfield: false,
    meshGradient: true,
    metallicShimmer: false,
    ambientLight: true,
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Inter', sans-serif",
    score: "'Orbitron', sans-serif",
  },
  animations: {
    scoreChange: 'cyber-score-pop',
    victory: 'cyber-victory',
    defeat: 'cyber-defeat',
    buttonHover: 'cyber-btn-hover',
    buttonClick: 'cyber-btn-click',
    cardEnter: 'cyber-card-enter',
    screenFlash: 'cyber-flash',
    idle: 'cyber-idle-pulse',
  },
  cssPrefix: 'cyber',
  borderRadius: '12px',
};

// ============================================
// THEME 1: ARCADE CLASSIC
// Bold neon on black - classic arcade cabinet vibes
// INSERT COIN • HIGH SCORE • GAME OVER
// ============================================
export const arcadeTheme: Theme = {
  id: 'arcade',
  name: 'Arcade Classic',
  description: 'Bold neon colors on black. Classic arcade cabinet vibes.',
  tagline: 'INSERT COIN TO PLAY',
  colors: {
    background: '#000000',
    backgroundGradient: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)',
    backgroundSecondary: '#0a0a0a',
    table: '#050505',
    tableBorder: '#FF0040',
    centerLine: '#FFE60050',
    centerCircle: '#FFE60040',
    goalPlayer1: '#00FF8840',
    goalPlayer2: '#FF004040',
    puck: '#ffffff',
    puckGlow: '#FFE600',
    paddle1: '#00FF88',
    paddle1Glow: '#00FF88',
    paddle1Inner: '#003322',
    paddle2: '#FF0040',
    paddle2Glow: '#FF0040',
    paddle2Inner: '#330011',
    primary: '#FF0040',
    secondary: '#00FF88',
    accent: '#FFE600',
    text: '#ffffff',
    textMuted: '#888888',
    score1: '#00FF88',
    score2: '#FF0040',
  },
  effects: {
    glowIntensity: 25,
    trailEffect: true,
    particles: false,
    scanlines: false,
    blur: 0,
    screenCurvature: false,
    phosphorBloom: false,
    starfield: true,
    meshGradient: false,
    metallicShimmer: false,
    ambientLight: false,
  },
  fonts: {
    heading: "'Press Start 2P', monospace",
    body: "'Inter', sans-serif",
    score: "'Press Start 2P', monospace",
  },
  animations: {
    scoreChange: 'arcade-score-pop',
    victory: 'arcade-victory',
    defeat: 'arcade-defeat',
    buttonHover: 'arcade-btn-hover',
    buttonClick: 'arcade-btn-click',
    cardEnter: 'arcade-card-enter',
    screenFlash: 'arcade-flash',
    idle: 'arcade-idle-pulse',
  },
  cssPrefix: 'arcade',
  borderRadius: '0',
};

// ============================================
// THEME 2: RETRO GAMING
// CRT phosphor glow - 80s terminal aesthetics
// SYSTEM LOADING... READY.
// ============================================
export const retroTheme: Theme = {
  id: 'retro',
  name: 'Retro Gaming',
  description: 'Warm CRT phosphor glow. 80s computer terminal aesthetics.',
  tagline: 'SYSTEM READY_',
  colors: {
    background: '#0D0D0D',
    backgroundGradient: 'linear-gradient(180deg, #121210 0%, #0D0D0D 100%)',
    backgroundSecondary: '#0A0A08',
    table: '#0A0A08',
    tableBorder: '#33FF00',
    centerLine: '#33FF0040',
    centerCircle: '#33FF0030',
    goalPlayer1: '#33FF0030',
    goalPlayer2: '#FFAA0030',
    puck: '#FFFFFF',
    puckGlow: '#33FF00',
    paddle1: '#33FF00',
    paddle1Glow: '#33FF00',
    paddle1Inner: '#0A2200',
    paddle2: '#FFAA00',
    paddle2Glow: '#FFAA00',
    paddle2Inner: '#221800',
    primary: '#33FF00',
    secondary: '#FFAA00',
    accent: '#00FFFF',
    text: '#33FF00',
    textMuted: '#116600',
    score1: '#33FF00',
    score2: '#FFAA00',
  },
  effects: {
    glowIntensity: 15,
    trailEffect: false,
    particles: false,
    scanlines: true,
    blur: 0.5,
    screenCurvature: true,
    phosphorBloom: true,
    starfield: false,
    meshGradient: false,
    metallicShimmer: false,
    ambientLight: false,
  },
  fonts: {
    heading: "'VT323', monospace",
    body: "'VT323', monospace",
    score: "'VT323', monospace",
  },
  animations: {
    scoreChange: 'retro-score-flicker',
    victory: 'retro-victory',
    defeat: 'retro-defeat',
    buttonHover: 'retro-btn-hover',
    buttonClick: 'retro-btn-click',
    cardEnter: 'retro-card-enter',
    screenFlash: 'retro-flash',
    idle: 'retro-cursor-blink',
  },
  cssPrefix: 'retro',
  borderRadius: '0',
};

// ============================================
// THEME 3: PREMIUM GAMING
// Sophisticated dark with luxurious gold accents
// EXCELLENCE • PRESTIGE • VICTORY
// ============================================
export const premiumTheme: Theme = {
  id: 'premium',
  name: 'Premium Gaming',
  description: 'Sophisticated dark theme with luxurious gold accents.',
  tagline: 'EXCELLENCE AWAITS',
  colors: {
    background: '#0C0C0E',
    backgroundGradient: 'linear-gradient(180deg, #121214 0%, #0C0C0E 100%)',
    backgroundSecondary: '#0F0F11',
    table: '#0F0F11',
    tableBorder: '#D4AF37',
    centerLine: '#D4AF3730',
    centerCircle: '#D4AF3720',
    goalPlayer1: '#D4AF3725',
    goalPlayer2: '#C0C0C025',
    puck: '#FFFFFF',
    puckGlow: '#D4AF37',
    puckShadow: '#00000080',
    paddle1: '#D4AF37',
    paddle1Glow: '#D4AF37',
    paddle1Inner: '#2A2206',
    paddle2: '#C0C0C0',
    paddle2Glow: '#C0C0C0',
    paddle2Inner: '#1A1A1A',
    primary: '#D4AF37',
    secondary: '#B87333',
    accent: '#E8D5B7',
    text: '#F5F5F5',
    textMuted: '#71717A',
    score1: '#D4AF37',
    score2: '#C0C0C0',
  },
  effects: {
    glowIntensity: 12,
    trailEffect: true,
    particles: false,
    scanlines: false,
    blur: 0,
    screenCurvature: false,
    phosphorBloom: false,
    starfield: false,
    meshGradient: false,
    metallicShimmer: true,
    ambientLight: true,
  },
  fonts: {
    heading: "'Bebas Neue', sans-serif",
    body: "'Inter', sans-serif",
    score: "'Bebas Neue', sans-serif",
  },
  animations: {
    scoreChange: 'premium-score-elegant',
    victory: 'premium-victory',
    defeat: 'premium-defeat',
    buttonHover: 'premium-btn-hover',
    buttonClick: 'premium-btn-click',
    cardEnter: 'premium-card-enter',
    screenFlash: 'premium-flash',
    idle: 'premium-shimmer',
  },
  cssPrefix: 'premium',
  borderRadius: '16px',
};

// ============================================
// THEME 4: ELECTRIC VIBRANT
// Fresh teal and coral - modern, energetic
// POWER UP • LEVEL UP • GAME ON
// ============================================
export const electricTheme: Theme = {
  id: 'electric',
  name: 'Electric Vibrant',
  description: 'Fresh teal and coral. Modern, energetic, bold.',
  tagline: 'POWER UP',
  colors: {
    background: '#0A0F14',
    backgroundGradient: 'linear-gradient(135deg, #0A0F14 0%, #0F1419 50%, #0A0F14 100%)',
    backgroundSecondary: '#0D1218',
    table: '#0D1218',
    tableBorder: '#14B8A6',
    centerLine: '#14B8A640',
    centerCircle: '#14B8A630',
    goalPlayer1: '#14B8A630',
    goalPlayer2: '#FF6B6B30',
    puck: '#FFFFFF',
    puckGlow: '#3B82F6',
    paddle1: '#14B8A6',
    paddle1Glow: '#14B8A6',
    paddle1Inner: '#042F2B',
    paddle2: '#FF6B6B',
    paddle2Glow: '#FF6B6B',
    paddle2Inner: '#331515',
    primary: '#14B8A6',
    secondary: '#FF6B6B',
    accent: '#3B82F6',
    text: '#F8FAFC',
    textMuted: '#64748B',
    score1: '#14B8A6',
    score2: '#FF6B6B',
  },
  effects: {
    glowIntensity: 18,
    trailEffect: true,
    particles: false,
    scanlines: false,
    blur: 0,
    screenCurvature: false,
    phosphorBloom: false,
    starfield: false,
    meshGradient: true,
    metallicShimmer: false,
    ambientLight: false,
  },
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    score: "'Space Grotesk', sans-serif",
  },
  animations: {
    scoreChange: 'electric-score-spring',
    victory: 'electric-victory',
    defeat: 'electric-defeat',
    buttonHover: 'electric-btn-hover',
    buttonClick: 'electric-btn-click',
    cardEnter: 'electric-card-enter',
    screenFlash: 'electric-flash',
    idle: 'electric-gradient-flow',
  },
  cssPrefix: 'electric',
  borderRadius: '20px',
};

export const themes: Record<ThemeId, Theme> = {
  cyber: cyberTheme,
  arcade: arcadeTheme,
  retro: retroTheme,
  premium: premiumTheme,
  electric: electricTheme,
};

export const themeList = Object.values(themes);

export const defaultTheme: ThemeId = 'cyber';

// Helper function to get CSS variables from theme
export function getThemeCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--theme-bg': theme.colors.background,
    '--theme-bg-secondary': theme.colors.backgroundSecondary || theme.colors.background,
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-accent': theme.colors.accent,
    '--theme-text': theme.colors.text,
    '--theme-text-muted': theme.colors.textMuted,
    '--theme-glow': `${theme.effects.glowIntensity}px`,
    '--theme-radius': theme.borderRadius,
    '--theme-font-heading': theme.fonts.heading,
    '--theme-font-body': theme.fonts.body,
    '--theme-font-score': theme.fonts.score,
  };
}

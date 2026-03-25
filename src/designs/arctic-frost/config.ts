import { DesignConfig } from '../types';

export const arcticFrostConfig: DesignConfig = {
  id: 'arctic-frost',
  name: 'Arctic Frost',
  description: 'Frozen ice rink with glacial elegance',
  colors: {
    // Crisp white with subtle ice blue tint
    background: '#E8F4F8',
    backgroundSecondary: '#D4E8F0',
    
    // Semi-transparent ice surface with subtle blue
    surface: 'rgba(200, 230, 245, 0.3)',
    
    // Clean ice blue border
    border: '#B8D8E8',
    
    // Player 1: Cool cyan blue (like fresh ice)
    player1: '#4FC3F7',
    player1Glow: 'rgba(79, 195, 247, 0.5)',
    
    // Player 2: Arctic silver white
    player2: '#ECEFF1',
    player2Glow: 'rgba(236, 239, 241, 0.6)',
    
    // Puck: Deep frozen blue-grey
    puck: '#546E7A',
    puckGlow: 'rgba(84, 110, 122, 0.4)',
    
    // Text: Dark grey-blue for contrast on light background
    text: '#263238',
    textMuted: '#607D8B',
    
    // Accent: Bright ice blue for highlights
    accent: '#00B8D4',
    
    // Goal zones: Subtle frost tints
    goalZone1: 'rgba(79, 195, 247, 0.15)',
    goalZone2: 'rgba(236, 239, 241, 0.2)',

    // Extended colors for full app
    primary: '#4FC3F7',
    secondary: '#00B8D4',
    success: '#26A69A',
    warning: '#FFB74D',
    error: '#EF5350',
    navBackground: 'rgba(232, 244, 248, 0.98)',
    cardBackground: 'rgba(212, 232, 240, 0.6)',
    buttonPrimary: '#4FC3F7',
    buttonSecondary: '#546E7A',
  },
  effects: {
    // Medium glow like soft ice reflection (0-30 range)
    glowIntensity: 15,
    
    // No retro effects - clean and modern
    scanlines: false,
    crtCurve: false,
    pixelated: false,
    
    // Subtle trail for smooth ice gliding
    trailEffect: true,
    
    // No screen shake - keep it elegant
    screenShake: false,
  },
  fonts: {
    // Clean, geometric, modern font for headings
    heading: '"Rajdhani", "Exo 2", "Roboto Condensed", sans-serif',
    
    // Crisp sans-serif for body text
    body: '"Inter", "Roboto", system-ui, sans-serif',
    
    // Bold geometric for score display
    score: '"Rajdhani", "Orbitron", monospace',
  },
  backgroundEffect: 'gradient',
  backgroundGradient: 'linear-gradient(135deg, #E8F4F8 0%, #D4E8F0 50%, #C8E4EC 100%)',
};

import { DesignConfig } from '../types';

export const midnightClubConfig: DesignConfig = {
  id: 'midnight-club',
  name: 'Midnight Club',
  description: 'Luxury nightclub with gold accents',
  
  colors: {
    // Deep, rich blacks and charcoals - like a VIP room
    background: '#0a0a0f',
    backgroundSecondary: '#14141c',
    
    // Polished dark surface with subtle warmth
    surface: '#1a1a26',
    
    // Gold border - like velvet rope accents
    border: '#d4af37',
    
    // Player 1: Champagne gold with warm glow
    player1: '#f4e5c3',
    player1Glow: '#d4af37',
    
    // Player 2: Deep burgundy/wine with warm rose glow
    player2: '#8b2846',
    player2Glow: '#c73b5e',
    
    // Puck: Bright gold with warm champagne glow
    puck: '#ffd700',
    puckGlow: '#f4e5c3',
    
    // Text: Gold and muted gold
    text: '#f4e5c3',
    textMuted: '#8b7355',
    
    // Accent: Bright gold
    accent: '#d4af37',
    
    // Goal zones: Subtle gold tints
    goalZone1: 'rgba(212, 175, 55, 0.08)',
    goalZone2: 'rgba(139, 40, 70, 0.08)',

    // Extended colors for full app
    primary: '#d4af37',
    secondary: '#8b2846',
    success: '#4ade80',
    warning: '#ffd700',
    error: '#ef4444',
    navBackground: 'rgba(10, 10, 15, 0.98)',
    cardBackground: '#1a1a26',
    buttonPrimary: '#d4af37',
    buttonSecondary: '#8b2846',
  },

  effects: {
    // Subtle, sophisticated glow - no harsh effects (0-30 range)
    glowIntensity: 8,
    scanlines: false,
    crtCurve: false,
    pixelated: false,
    trailEffect: false,
    screenShake: false,
  },
  
  fonts: {
    // Luxury serif for headings
    heading: "'Playfair Display', serif",
    
    // Clean sans-serif for UI
    body: "'Montserrat', sans-serif",
    
    // Elegant display for scores
    score: "'Playfair Display', serif",
  },
  backgroundEffect: 'gradient',
  backgroundGradient: 'radial-gradient(ellipse at top, #1a1a26 0%, #0a0a0f 50%), radial-gradient(ellipse at bottom right, #14141c 0%, #0a0a0f 60%)',
};

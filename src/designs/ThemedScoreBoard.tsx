'use client';

import { useGameStore } from '@/stores/gameStore';
import { useDesign } from './DesignContext';

export function ThemedScoreBoard() {
  const scores = useGameStore((state) => state.scores);
  const mode = useGameStore((state) => state.mode);
  const maxScore = useGameStore((state) => state.maxScore);
  const { config } = useDesign();
  const { colors, effects, fonts } = config;

  // Design-specific container styles
  const getContainerStyle = (): React.CSSProperties => {
    switch (config.id) {
      case 'neon-arcade':
        return {
          background: `${colors.background}cc`,
          border: `3px solid ${colors.border}`,
          boxShadow: `0 0 20px ${colors.border}40`,
          padding: '1rem 2rem',
        };
      case 'minimalist':
        return {
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          padding: '1rem 2rem',
          borderRadius: '8px',
        };
      case 'retro-pixel':
        return {
          background: colors.background,
          border: `4px solid ${colors.border}`,
          padding: '0.75rem 1.5rem',
        };
      case 'ice-stadium':
        return {
          background: `${colors.background}ee`,
          borderLeft: `4px solid ${colors.player1}`,
          borderRight: `4px solid ${colors.player2}`,
          padding: '1rem 2rem',
        };
      case 'cyber-esports':
        return {
          background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundSecondary} 100%)`,
          border: `2px solid ${colors.border}`,
          boxShadow: `0 0 15px ${colors.border}30`,
          padding: '1rem 2rem',
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
        };
      default:
        return { padding: '1rem 2rem' };
    }
  };

  const getPlayerLabel = (isPlayer1: boolean) => {
    if (config.id === 'retro-pixel') {
      return isPlayer1 ? 'P1' : (mode === 'ai' ? 'CPU' : 'P2');
    }
    if (config.id === 'ice-stadium') {
      return isPlayer1 ? 'HOME' : 'AWAY';
    }
    if (config.id === 'cyber-esports') {
      return isPlayer1 ? 'PLAYER' : (mode === 'ai' ? 'AI-X' : 'P2');
    }
    return isPlayer1 ? 'YOU' : (mode === 'ai' ? 'AI' : 'P2');
  };

  return (
    <div
      className="flex items-center justify-center gap-8 mb-4"
      style={getContainerStyle()}
    >
      {/* Player 2 / AI Score */}
      <div className="text-center">
        <div
          className="text-sm font-medium mb-1 uppercase tracking-wider"
          style={{
            color: colors.player2,
            fontFamily: fonts.body,
          }}
        >
          {getPlayerLabel(false)}
        </div>
        <div
          className="text-5xl font-bold tabular-nums"
          style={{
            color: colors.player2,
            fontFamily: fonts.score,
            textShadow: effects.glowIntensity > 0
              ? `0 0 ${effects.glowIntensity / 2}px ${colors.player2Glow}`
              : 'none',
            fontSize: config.id === 'retro-pixel' ? '2rem' : '3rem',
          }}
        >
          {scores.player2}
        </div>
      </div>

      {/* Divider */}
      <div className="flex flex-col items-center gap-1">
        <div
          className="text-3xl font-light"
          style={{
            color: colors.textMuted,
            fontFamily: fonts.score,
          }}
        >
          {config.id === 'retro-pixel' ? 'VS' :
           config.id === 'cyber-esports' ? '⚡' : '-'}
        </div>
        {config.id === 'cyber-esports' && (
          <div
            className="text-xs uppercase tracking-widest"
            style={{ color: colors.textMuted }}
          >
            FT{maxScore}
          </div>
        )}
        {config.id === 'ice-stadium' && (
          <div
            className="text-xs uppercase"
            style={{ color: colors.accent }}
          >
            LIVE
          </div>
        )}
      </div>

      {/* Player 1 Score */}
      <div className="text-center">
        <div
          className="text-sm font-medium mb-1 uppercase tracking-wider"
          style={{
            color: colors.player1,
            fontFamily: fonts.body,
          }}
        >
          {getPlayerLabel(true)}
        </div>
        <div
          className="text-5xl font-bold tabular-nums"
          style={{
            color: colors.player1,
            fontFamily: fonts.score,
            textShadow: effects.glowIntensity > 0
              ? `0 0 ${effects.glowIntensity / 2}px ${colors.player1Glow}`
              : 'none',
            fontSize: config.id === 'retro-pixel' ? '2rem' : '3rem',
          }}
        >
          {scores.player1}
        </div>
      </div>
    </div>
  );
}

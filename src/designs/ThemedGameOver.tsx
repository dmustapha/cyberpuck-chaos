'use client';

import { useGameStore } from '@/stores/gameStore';
import { useDesign } from './DesignContext';
import { useRouter } from 'next/navigation';

export function ThemedGameOver() {
  const router = useRouter();
  const status = useGameStore((state) => state.status);
  const winner = useGameStore((state) => state.winner);
  const scores = useGameStore((state) => state.scores);
  const mode = useGameStore((state) => state.mode);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);
  const { config } = useDesign();
  const { colors, effects, fonts } = config;

  if (status !== 'gameover') return null;

  const playerWon = winner === 'player1';

  const handlePlayAgain = () => {
    startGame();
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/');
  };

  // Design-specific victory text
  const getVictoryText = () => {
    if (playerWon) {
      switch (config.id) {
        case 'neon-arcade': return 'VICTORY!';
        case 'retro-pixel': return 'YOU WIN!!';
        case 'ice-stadium': return 'GAME WON';
        case 'cyber-esports': return 'MATCH WON';
        case 'minimalist': return 'Victory';
        default: return 'You Win!';
      }
    } else {
      switch (config.id) {
        case 'neon-arcade': return 'GAME OVER';
        case 'retro-pixel': return 'GAME OVER';
        case 'ice-stadium': return 'GAME LOST';
        case 'cyber-esports': return 'DEFEATED';
        case 'minimalist': return 'Defeat';
        default: return mode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!';
      }
    }
  };

  const getIcon = () => {
    if (playerWon) {
      switch (config.id) {
        case 'neon-arcade': return '★';
        case 'retro-pixel': return '♦';
        case 'ice-stadium': return '🏆';
        case 'cyber-esports': return '◆';
        case 'minimalist': return '●';
        default: return '🏆';
      }
    } else {
      switch (config.id) {
        case 'neon-arcade': return '✕';
        case 'retro-pixel': return '☠';
        case 'ice-stadium': return '—';
        case 'cyber-esports': return '◇';
        case 'minimalist': return '○';
        default: return '😢';
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: config.id === 'minimalist'
      ? 'rgba(255,255,255,0.98)'
      : `${colors.background}f8`,
    backdropFilter: 'blur(8px)',
  };

  const modalStyle: React.CSSProperties = {
    background: colors.surface,
    border: `2px solid ${playerWon ? colors.player1 : colors.player2}`,
    padding: config.id === 'retro-pixel' ? '2rem' : '3rem',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center' as const,
    borderRadius: config.id === 'retro-pixel' ? 0 : '16px',
    boxShadow: effects.glowIntensity > 0
      ? `0 0 40px ${playerWon ? colors.player1Glow : colors.player2Glow}`
      : '0 20px 60px rgba(0,0,0,0.3)',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: config.id === 'retro-pixel' ? '0.75rem' : '1rem',
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    border: 'none',
    borderRadius: config.id === 'retro-pixel' ? 0 : '8px',
    transition: 'all 0.2s',
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: colors.accent,
    color: colors.background,
    boxShadow: effects.glowIntensity > 0 ? `0 0 20px ${colors.accent}40` : 'none',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text,
  };

  return (
    <div style={containerStyle}>
      {/* Background effects */}
      {config.id === 'neon-arcade' && playerWon && (
        <>
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ background: colors.accent }}
          />
        </>
      )}

      {config.id === 'cyber-esports' && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${colors.border}20 1px, transparent 1px), linear-gradient(90deg, ${colors.border}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <div style={modalStyle}>
        {/* Icon */}
        <div
          className="mb-4"
          style={{
            fontSize: config.id === 'retro-pixel' ? '3rem' : '4rem',
            color: playerWon ? colors.player1 : colors.player2,
            textShadow: effects.glowIntensity > 0
              ? `0 0 20px ${playerWon ? colors.player1Glow : colors.player2Glow}`
              : 'none',
          }}
        >
          {getIcon()}
        </div>

        {/* Victory/Defeat Text */}
        <div
          className="font-bold mb-2"
          style={{
            fontSize: config.id === 'retro-pixel' ? '1.5rem' : '2.5rem',
            fontFamily: fonts.heading,
            color: playerWon ? colors.player1 : colors.player2,
            textShadow: effects.glowIntensity > 0
              ? `0 0 10px ${playerWon ? colors.player1Glow : colors.player2Glow}`
              : 'none',
          }}
        >
          {getVictoryText()}
        </div>

        {/* Score */}
        <div
          className="mb-8"
          style={{
            fontFamily: fonts.score,
            fontSize: config.id === 'retro-pixel' ? '1rem' : '1.5rem',
          }}
        >
          <span style={{ color: colors.player1 }}>{scores.player1}</span>
          <span style={{ color: colors.textMuted }}> - </span>
          <span style={{ color: colors.player2 }}>{scores.player2}</span>
        </div>

        {/* Stats for cyber theme */}
        {config.id === 'cyber-esports' && (
          <div
            className="mb-6 p-3 text-xs"
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex justify-between mb-1">
              <span style={{ color: colors.textMuted }}>MATCH RESULT</span>
              <span style={{ color: playerWon ? colors.player1 : colors.player2 }}>
                {playerWon ? 'VICTORY' : 'DEFEAT'}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textMuted }}>FINAL SCORE</span>
              <span style={{ color: colors.accent }}>
                {scores.player1} - {scores.player2}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={handlePlayAgain} style={primaryButtonStyle}>
            {config.id === 'retro-pixel' ? '> PLAY AGAIN' :
             config.id === 'cyber-esports' ? 'REMATCH' : 'Play Again'}
          </button>
          <button onClick={handleMainMenu} style={secondaryButtonStyle}>
            {config.id === 'retro-pixel' ? '> MAIN MENU' :
             config.id === 'cyber-esports' ? 'EXIT MATCH' : 'Main Menu'}
          </button>
        </div>

        {/* Retro coin insert */}
        {config.id === 'retro-pixel' && (
          <div
            className="mt-4 text-xs animate-pulse"
            style={{ color: colors.textMuted }}
          >
            INSERT COIN TO CONTINUE
          </div>
        )}
      </div>
    </div>
  );
}

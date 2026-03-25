'use client';

import { useGameStore } from '@/stores/gameStore';
import { useDesign } from './DesignContext';
import { useRouter } from 'next/navigation';

export function ThemedPauseMenu() {
  const router = useRouter();
  const status = useGameStore((state) => state.status);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const { config } = useDesign();
  const { colors, effects, fonts } = config;

  if (status !== 'paused') return null;

  const handleResume = () => {
    resumeGame();
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/');
  };

  // Design-specific pause text
  const getPauseTitle = () => {
    switch (config.id) {
      case 'neon-arcade': return 'PAUSED';
      case 'retro-pixel': return 'PAUSE';
      case 'ice-stadium': return 'TIME OUT';
      case 'cyber-esports': return 'MATCH PAUSED';
      case 'minimalist': return 'Paused';
      default: return 'Game Paused';
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
      ? 'rgba(255,255,255,0.95)'
      : `${colors.background}f0`,
    backdropFilter: 'blur(8px)',
  };

  const modalStyle: React.CSSProperties = {
    background: colors.surface,
    border: `2px solid ${colors.border}`,
    padding: config.id === 'retro-pixel' ? '2rem' : '3rem',
    maxWidth: '350px',
    width: '90%',
    textAlign: 'center' as const,
    borderRadius: config.id === 'retro-pixel' ? 0 : '16px',
    boxShadow: effects.glowIntensity > 0
      ? `0 0 30px ${colors.border}40`
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
    <div style={containerStyle} onClick={handleResume}>
      {/* Background effects */}
      {config.id === 'cyber-esports' && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${colors.border}20 1px, transparent 1px), linear-gradient(90deg, ${colors.border}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {config.id === 'neon-arcade' && (
        <>
          <div
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 -top-32 -left-32"
            style={{ background: colors.accent }}
          />
          <div
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 -bottom-32 -right-32"
            style={{ background: colors.border }}
          />
        </>
      )}

      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Pause icon */}
        <div
          className="mb-4 flex justify-center gap-2"
          style={{ color: colors.accent }}
        >
          {config.id === 'cyber-esports' ? (
            <span className="text-4xl">⏸</span>
          ) : config.id === 'retro-pixel' ? (
            <span className="text-2xl">■ ■</span>
          ) : (
            <>
              <div
                className="w-4 h-12 rounded"
                style={{ background: colors.accent }}
              />
              <div
                className="w-4 h-12 rounded"
                style={{ background: colors.accent }}
              />
            </>
          )}
        </div>

        {/* Title */}
        <div
          className="font-bold mb-8"
          style={{
            fontSize: config.id === 'retro-pixel' ? '1.5rem' : '2rem',
            fontFamily: fonts.heading,
            color: colors.text,
            textShadow: effects.glowIntensity > 0
              ? `0 0 10px ${colors.accent}40`
              : 'none',
          }}
        >
          {getPauseTitle()}
        </div>

        {/* Hint for cyber theme */}
        {config.id === 'cyber-esports' && (
          <div
            className="mb-6 text-xs uppercase tracking-widest"
            style={{ color: colors.textMuted }}
          >
            Press ESC or click outside to resume
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={handleResume} style={primaryButtonStyle}>
            {config.id === 'retro-pixel' ? '> CONTINUE' :
             config.id === 'cyber-esports' ? 'RESUME MATCH' : 'Resume'}
          </button>
          <button onClick={handleMainMenu} style={secondaryButtonStyle}>
            {config.id === 'retro-pixel' ? '> QUIT' :
             config.id === 'cyber-esports' ? 'ABANDON MATCH' : 'Main Menu'}
          </button>
        </div>

        {/* Retro decoration */}
        {config.id === 'retro-pixel' && (
          <div
            className="mt-6 text-xs"
            style={{ color: colors.textMuted }}
          >
            ════════════════════
          </div>
        )}

        {/* Neon decoration */}
        {config.id === 'neon-arcade' && (
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i === 2 ? colors.accent : colors.border,
                  boxShadow: `0 0 ${i === 2 ? 10 : 5}px ${i === 2 ? colors.accent : colors.border}`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

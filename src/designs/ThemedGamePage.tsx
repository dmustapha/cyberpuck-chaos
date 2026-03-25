'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { useDesign } from './DesignContext';
import { ThemedGameCanvas, ThemedGameCanvasRef } from './ThemedGameCanvas';
import { ThemedScoreBoard } from './ThemedScoreBoard';
import { ThemedCountdown } from './ThemedCountdown';
import { ThemedGameOver } from './ThemedGameOver';
import { ThemedPauseMenu } from './ThemedPauseMenu';

export function ThemedGamePage() {
  const router = useRouter();
  const canvasRef = useRef<ThemedGameCanvasRef>(null);
  const { config } = useDesign();
  const { colors, fonts, effects } = config;

  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const { movePaddle, getBodies } = useGameEngine();

  // Player 1 input (bottom paddle)
  const handlePlayer1Move = useCallback(
    (x: number, y: number) => {
      movePaddle('player1', x, y);
    },
    [movePaddle]
  );

  usePlayerInput({
    canvasRef: { current: canvasRef.current?.canvas ?? null },
    onMove: handlePlayer1Move,
    enabled: status === 'playing',
  });

  // AI opponent (top paddle) - only in AI mode
  const handleAIMove = useCallback(
    (x: number, y: number) => {
      movePaddle('player2', x, y);
    },
    [movePaddle]
  );

  const getPuck = useCallback(() => {
    const bodies = getBodies();
    return bodies?.puck ?? null;
  }, [getBodies]);

  useAIOpponent({
    enabled: mode === 'ai' && status === 'playing',
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (status === 'playing') {
          pauseGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, pauseGame]);

  // Redirect to menu if game hasn't started
  useEffect(() => {
    if (status === 'menu') {
      router.push('/');
    }
  }, [status, router]);

  const handlePause = () => {
    pauseGame();
  };

  const handleQuit = () => {
    resetGame();
    router.push('/');
  };

  // Design-specific mode label
  const getModeLabel = () => {
    if (mode === 'ai') {
      switch (config.id) {
        case 'retro-pixel': return `CPU: ${difficulty.toUpperCase()}`;
        case 'cyber-esports': return `AI-X [${difficulty.toUpperCase()}]`;
        case 'ice-stadium': return `vs CPU (${difficulty})`;
        default: return `AI: ${difficulty}`;
      }
    }
    switch (config.id) {
      case 'retro-pixel': return '2 PLAYERS';
      case 'cyber-esports': return 'LOCAL PVP';
      case 'ice-stadium': return 'Exhibition Match';
      default: return 'Local Multiplayer';
    }
  };

  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    padding: config.id === 'retro-pixel' ? '0.5rem 0.75rem' : '0.5rem 1rem',
    fontSize: config.id === 'retro-pixel' ? '0.625rem' : '0.875rem',
    fontFamily: fonts.body,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderRadius: config.id === 'retro-pixel' ? 0 : '4px',
    transition: 'all 0.2s',
  };

  const containerStyle: React.CSSProperties = {
    background: colors.background,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      {/* Background effects */}
      {config.id === 'neon-arcade' && (
        <>
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 -top-48 -left-48"
            style={{ background: colors.player1 }}
          />
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 -bottom-48 -right-48"
            style={{ background: colors.player2 }}
          />
        </>
      )}

      {config.id === 'cyber-esports' && (
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${colors.border}30 1px, transparent 1px), linear-gradient(90deg, ${colors.border}30 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Scanlines */}
      {effects.scanlines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}

      {/* Header with controls */}
      <div
        className="w-full max-w-md flex justify-between items-center mb-4 relative z-10"
        style={{
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
        }}
      >
        <button onClick={handleQuit} style={buttonStyle}>
          {config.id === 'retro-pixel' ? '< QUIT' : 'Quit'}
        </button>

        <div
          className="text-sm"
          style={{
            color: colors.textMuted,
            fontFamily: fonts.body,
            fontSize: config.id === 'retro-pixel' ? '0.625rem' : '0.875rem',
          }}
        >
          {getModeLabel()}
        </div>

        <button
          onClick={handlePause}
          style={{
            ...buttonStyle,
            opacity: status !== 'playing' ? 0.5 : 1,
          }}
          disabled={status !== 'playing'}
        >
          {config.id === 'retro-pixel' ? 'PAUSE' : 'Pause'}
        </button>
      </div>

      {/* Scoreboard */}
      <ThemedScoreBoard />

      {/* Game canvas */}
      <div className="relative z-10">
        <ThemedGameCanvas ref={canvasRef} getBodies={getBodies} />
      </div>

      {/* Instructions */}
      <div
        className="mt-4 text-center relative z-10"
        style={{
          color: colors.textMuted,
          fontFamily: fonts.body,
          fontSize: config.id === 'retro-pixel' ? '0.625rem' : '0.875rem',
        }}
      >
        {config.id === 'retro-pixel'
          ? 'MOVE MOUSE TO CONTROL PADDLE'
          : config.id === 'cyber-esports'
          ? '◈ Mouse/Touch to control | ESC to pause ◈'
          : 'Move your mouse or touch to control the paddle'}
      </div>

      {/* Design indicator */}
      <div
        className="absolute bottom-4 flex items-center gap-2 z-10"
        style={{ color: colors.textMuted }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: colors.accent }}
        />
        <span
          className="text-xs"
          style={{ fontFamily: fonts.body }}
        >
          {config.name}
        </span>
      </div>

      {/* Overlays */}
      <ThemedCountdown />
      <ThemedGameOver />
      <ThemedPauseMenu />
    </div>
  );
}

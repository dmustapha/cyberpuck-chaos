'use client';

/**
 * Cyber Esports Game Page
 *
 * Uses state machine to manage flow:
 * - mode-selection: Choose AI or Multiplayer
 * - ai-setup: Select difficulty for AI mode
 * - multiplayer-lobby: Create or Join game
 * - waiting: Creator waiting for opponent
 * - ready: Both connected, ready up
 * - countdown/playing/paused/goal/gameover: Game states
 *
 * Architecture:
 * - AI Mode: Uses local physics engine (useGameEngine)
 * - Multiplayer Mode: Uses server-authoritative model (useMultiplayerGameEngine)
 *   - Server runs physics and broadcasts state at 30Hz
 *   - Client only renders server state and sends paddle inputs
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore, GamePageState } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useMultiplayerGameEngine } from '@/hooks/useMultiplayerGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useAudioOptional } from '@/contexts/AudioContext';
import { GameCanvas, GameCanvasRef } from '@/components/game/GameCanvas';
import { ModifierHUD } from '@/components/game/ModifierHUD';
import { useLocalChaos } from '@/hooks/useLocalChaos';
import {
  GameHUD,
  ScoreOverlay,
  GameModeSelectorScreen,
  AISetupScreen,
  MultiplayerLobbyScreen,
  WaitingForOpponentScreen,
  GameReadyScreen,
} from '@/components/cyber/game';
import { MultiplayerPauseOverlay } from '@/components/cyber/game/MultiplayerPauseOverlay';
import { OpponentQuitModal } from '@/components/cyber/game/OpponentQuitModal';
import { MultiplayerGameOverModal } from '@/components/cyber/game/MultiplayerGameOverModal';
import { RematchRequestModal } from '@/components/cyber/game/RematchRequestModal';

export default function CyberGamePage() {
  const gameCanvasRef = useRef<GameCanvasRef>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  // Wallet connection
  useDynamicWallet();

  const pageState = useGameStore((state) => state.pageState);
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const maxScore = useGameStore((state) => state.maxScore);
  const difficulty = useGameStore((state) => state.difficulty);
  const mode = useGameStore((state) => state.mode);
  const gameModeType = useGameStore((state) => state.gameModeType);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const multiplayerGameInfo = useGameStore((state) => state.multiplayerGameInfo);
  const setCountdown = useGameStore((state) => state.setCountdown);
  const setMaxScore = useGameStore((state) => state.setMaxScore);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const settings = useSettingsStore((state) => state.settings);

  // Audio context for music and sound effects
  const audio = useAudioOptional();

  // Is this a multiplayer game in active play?
  // Use gameModeType (explicit) OR mode for backwards compatibility
  // gameModeType is more reliable as it's explicitly set during game creation/joining
  const isMultiplayerGame = (gameModeType === 'multiplayer' || mode === 'multiplayer') && multiplayerGameInfo?.gameId;
  const isInMultiplayerGameplay = isMultiplayerGame && ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);

  // Debug: Log multiplayer state
  console.log('[GamePage] State:', { mode, gameModeType, pageState, isMultiplayerGame, isInMultiplayerGameplay, gameId: multiplayerGameInfo?.gameId, playerNumber });

  // Use the playerId stored in the game store (set when game was created/joined)
  const playerId = multiplayerGameInfo?.playerId || '';

  // Sync maxScore with settings
  useEffect(() => {
    if (maxScore !== settings.game.scoreToWin) {
      setMaxScore(settings.game.scoreToWin);
    }
  }, [settings.game.scoreToWin, maxScore, setMaxScore]);

  // Reset game state when navigating away from /game page
  // This ensures fresh state when user returns via "Play Now" or navigation
  useEffect(() => {
    return () => {
      // Only reset if game has ended - don't reset if user is mid-game
      const currentPageState = useGameStore.getState().pageState;
      if (currentPageState === 'gameover') {
        resetGame();
      }
    };
  }, [resetGame]);

  // ============================================================================
  // Fullscreen Mode: Lock body scroll and prevent interactions outside game
  // ============================================================================
  const isInFullscreenGame = ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);

  useEffect(() => {
    if (isInFullscreenGame) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Prevent touch scroll on mobile
      document.body.style.touchAction = 'none';
    } else {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isInFullscreenGame]);

  // ============================================================================
  // Audio: Music state management
  // ============================================================================
  useEffect(() => {
    if (!audio) return;

    // Play menu music during setup screens
    if (['mode-selection', 'ai-setup', 'multiplayer-lobby', 'waiting', 'ready'].includes(pageState)) {
      audio.playMenuMusic();
    }
    // Play gameplay music during active game
    else if (['countdown', 'playing', 'paused', 'goal'].includes(pageState)) {
      audio.playGameMusic();
    }
    // Stop music at game over (fanfares will play instead)
    else if (pageState === 'gameover') {
      audio.stopMusic();
    }
  }, [pageState, audio]);

  // Audio: Countdown beeps
  useEffect(() => {
    if (!audio) return;

    if (status === 'countdown' && countdown > 0) {
      audio.playCountdownBeep();
    } else if (status === 'countdown' && countdown === 0) {
      audio.playCountdownGo();
    }
  }, [status, countdown, audio]);

  // Audio: Victory/Defeat at game over (AI mode only - multiplayer handles its own)
  const scores = useGameStore((state) => state.scores);
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (!audio || isInMultiplayerGameplay) return;

    // Only trigger on transition TO gameover
    if (status === 'gameover' && prevStatusRef.current !== 'gameover') {
      const playerWon = scores.player1 >= maxScore;
      if (playerWon) {
        audio.playVictory();
      } else {
        audio.playDefeat();
      }
    }
    prevStatusRef.current = status;
  }, [status, scores, maxScore, audio, isInMultiplayerGameplay]);

  // Keep canvas element ref in sync
  useEffect(() => {
    const updateCanvasRef = () => {
      const canvas = gameCanvasRef.current?.canvas;
      if (canvas && canvas !== canvasElementRef.current) {
        canvasElementRef.current = canvas;
      }
    };
    updateCanvasRef();
    const interval = setInterval(updateCanvasRef, 100);
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // AI Mode: Local Physics Engine
  // ============================================================================
  const aiEngine = useGameEngine();

  // ============================================================================
  // AI Mode: Local Chaos Agent (LLM modifier system)
  // ============================================================================
  const isAIPlaying = status === 'playing' && mode === 'ai' && !isInMultiplayerGameplay;
  const localChaosModifier = useLocalChaos({ enabled: isAIPlaying });

  // Destructure stable refs so the effect doesn't re-fire on every render
  // (aiEngine is a new object each render; these useCallback fns are stable)
  const { applyGameModifier, revertGameModifier } = aiEngine;

  // Apply/revert modifiers when they change (AI mode only)
  useEffect(() => {
    if (isInMultiplayerGameplay) return; // Multiplayer handles its own modifiers
    if (localChaosModifier) {
      applyGameModifier(localChaosModifier);
    } else {
      revertGameModifier();
    }
  }, [localChaosModifier, applyGameModifier, revertGameModifier, isInMultiplayerGameplay]);

  // ============================================================================
  // Multiplayer Mode: Server-Authoritative Engine
  // ============================================================================
  // IMPORTANT: Only connect when in active gameplay states, NOT during 'waiting' or 'ready'
  // because WaitingForOpponentScreen and GameReadyScreen have their own useMultiplayerGame hooks.
  // This prevents duplicate WebSocket connections with the same playerId causing "Player already in room" errors.
  const shouldConnectMultiplayer = isMultiplayerGame && ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);
  const multiplayerEngine = useMultiplayerGameEngine({
    gameId: shouldConnectMultiplayer ? (multiplayerGameInfo?.gameId || '') : '',
    playerId: shouldConnectMultiplayer ? playerId : '',
  });

  // ============================================================================
  // Unified Interface - Select the appropriate engine
  // ============================================================================
  // CRITICAL: Log which engine is being used for debugging multiplayer issues
  if (status === 'playing') {
    console.log('[GamePage] Engine selection:', {
      isInMultiplayerGameplay,
      usingEngine: isInMultiplayerGameplay ? 'MULTIPLAYER' : 'AI',
      multiplayerPlayerNumber: multiplayerEngine.playerNumber,
      multiplayerConnected: multiplayerEngine.isConnected,
    });
  }

  const getBodies = isInMultiplayerGameplay
    ? multiplayerEngine.getBodies
    : aiEngine.getBodies;

  const movePaddle = isInMultiplayerGameplay
    ? multiplayerEngine.movePaddle
    : aiEngine.movePaddle;

  // Get puck for AI
  const getPuck = useCallback(() => {
    const bodies = aiEngine.getBodies();
    return bodies?.puck ?? null;
  }, [aiEngine]);

  // Handle player movement
  const handlePlayerMove = useCallback(
    (x: number, y: number) => {
      // Always use 'player1' as paddleOwner because:
      // - In AI mode: player controls paddle1
      // - In Multiplayer: each player sees their own paddle as paddle1 (bottom of screen)
      //   The coordinate transformation in useMultiplayerGameEngine handles the rest
      movePaddle('player1', x, y);
    },
    [movePaddle]
  );

  // Handle AI movement (only for AI mode)
  const handleAIMove = useCallback(
    (x: number, y: number) => {
      aiEngine.movePaddle('player2', x, y);
    },
    [aiEngine]
  );

  // Handle player input with stable canvas ref
  // Allow movement during 'goal' status so players can reposition
  usePlayerInput({
    canvasRef: canvasElementRef,
    onMove: handlePlayerMove,
    enabled: status === 'playing' || status === 'goal',
  });

  // Handle AI opponent (only for AI mode, not multiplayer)
  useAIOpponent({
    enabled: status === 'playing' && mode === 'ai' && !isInMultiplayerGameplay,
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Countdown timer (only for AI mode - multiplayer gets countdown from server)
  useEffect(() => {
    if (isInMultiplayerGameplay) {
      // Server handles countdown in multiplayer
      return;
    }

    if (status === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'countdown' && countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(-1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, countdown, setCountdown, isInMultiplayerGameplay]);

  // Determine what to show based on pageState
  const showScoreboard = ['playing', 'paused', 'goal'].includes(status);
  const isInGame = ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);

  // Render based on page state
  const renderPageContent = (): React.ReactNode => {
    switch (pageState) {
      case 'mode-selection':
        return <GameModeSelectorScreen />;

      case 'ai-setup':
        return <AISetupScreen />;

      case 'multiplayer-lobby':
        return <MultiplayerLobbyScreen />;

      case 'waiting':
        return <WaitingForOpponentScreen />;

      case 'ready':
        return <GameReadyScreen />;

      case 'countdown':
      case 'playing':
      case 'paused':
      case 'goal':
      case 'gameover':
        // Show game canvas - FULLSCREEN MODE
        return (
          <div
            className="fixed inset-0 flex flex-col items-center justify-center"
            style={{
              backgroundColor: cyberTheme.colors.bg.primary,
              zIndex: 100,
              height: '100dvh',
              padding: 'env(safe-area-inset-top, 8px) env(safe-area-inset-right, 8px) env(safe-area-inset-bottom, 8px) env(safe-area-inset-left, 8px)',
              touchAction: 'manipulation',
            }}
          >
            {/* Scoreboard - flex-shrink-0 so it keeps its size */}
            {showScoreboard && (
              <ScoreOverlay
                className="flex-shrink-0 w-full max-w-md mb-2"
                onPause={status === 'playing' ? pauseGame : undefined}
              />
            )}

            {/* Canvas container - flex-1 with min-h-0 to allow shrinking */}
            <div className="relative flex-1 min-h-0 w-full max-w-md flex items-center justify-center">
              {/* Decorative frame - hidden on mobile to save space */}
              <div
                className="absolute -inset-2 rounded-xl opacity-50 hidden sm:block"
                style={{
                  background: `linear-gradient(135deg, ${cyberTheme.colors.primary}30 0%, transparent 50%, ${cyberTheme.colors.secondary}30 100%)`,
                }}
              />

              {/* Corner accents - hidden on mobile */}
              <div className="hidden sm:block">
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
              </div>

              {/* Game HUD with canvas */}
              <GameHUD>
                <GameCanvas
                  ref={gameCanvasRef}
                  getBodies={getBodies}
                  getEffectiveRadii={!isInMultiplayerGameplay ? aiEngine.getEffectiveRadii ?? undefined : undefined}
                  activeModifierType={!isInMultiplayerGameplay ? localChaosModifier?.type ?? null : null}
                  isPuckFrozen={!isInMultiplayerGameplay ? aiEngine.isPuckFrozen : undefined}
                />

                {/* Chaos modifier HUD (AI mode) */}
                {!isInMultiplayerGameplay && (
                  <ModifierHUD modifier={localChaosModifier} />
                )}

                {/* Multiplayer pause overlay */}
                {isInMultiplayerGameplay && (
                  <MultiplayerPauseOverlay
                    pauseState={multiplayerEngine.pauseState}
                    playerNumber={multiplayerEngine.playerNumber}
                    onResume={multiplayerEngine.sendResumeRequest}
                    onQuit={multiplayerEngine.sendQuitGame}
                  />
                )}

                {/* Opponent quit modal (mid-game quit) */}
                {isInMultiplayerGameplay && (
                  <OpponentQuitModal
                    opponentQuit={multiplayerEngine.opponentQuit}
                    playerNumber={multiplayerEngine.playerNumber}
                    onContinue={resetGame}
                  />
                )}

                {/* Multiplayer game over modal (normal end) */}
                {isInMultiplayerGameplay && multiplayerEngine.gameStatus === 'ended' && !multiplayerEngine.opponentQuit.hasQuit && (
                  <MultiplayerGameOverModal
                    isVisible={true}
                    winner={multiplayerEngine.winner}
                    playerNumber={multiplayerEngine.playerNumber}
                    finalScore={multiplayerEngine.gameState?.score || null}
                    rematchState={multiplayerEngine.rematchState}
                    opponentExited={multiplayerEngine.opponentExited}
                    onPlayAgain={multiplayerEngine.sendRematchRequest}
                    onExit={multiplayerEngine.sendPlayerExit}
                    onResetGame={resetGame}
                  />
                )}

                {/* Rematch request modal (when opponent wants rematch) */}
                {isInMultiplayerGameplay && multiplayerEngine.rematchState.opponentRequested && (
                  <RematchRequestModal
                    isVisible={true}
                    onAccept={() => multiplayerEngine.sendRematchResponse(true)}
                    onDecline={() => multiplayerEngine.sendRematchResponse(false)}
                    onResetGame={resetGame}
                  />
                )}
              </GameHUD>
            </div>

            {/* Desktop: ESC to pause hint */}
            {status === 'playing' && (
              <div className="hidden sm:block absolute top-4 right-4 z-10">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: `${cyberTheme.colors.primary}15`,
                    border: `1px solid ${cyberTheme.colors.primary}40`,
                  }}
                >
                  <kbd
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: cyberTheme.colors.bg.tertiary,
                      color: cyberTheme.colors.primary,
                      border: `1px solid ${cyberTheme.colors.primary}`,
                      fontFamily: cyberTheme.fonts.heading,
                    }}
                  >
                    ESC
                  </kbd>
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: cyberTheme.colors.text.secondary }}
                  >
                    to pause
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <GameModeSelectorScreen />;
    }
  };

  return renderPageContent();
}



'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createGameEngine,
  updatePhysics,
  GameEngine,
  GameBodies,
  ResetPuckOptions,
} from '@/lib/physics/engine';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import { useGameStore } from '@/stores/gameStore';
import { Player } from '@/types/game';
import { useAudioOptional } from '@/contexts/AudioContext';

export function useGameEngine() {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const gameModeType = useGameStore((state) => state.gameModeType);
  const lastScorer = useGameStore((state) => state.lastScorer);
  const scoreGoal = useGameStore((state) => state.scoreGoal);
  const resumeAfterGoal = useGameStore((state) => state.resumeAfterGoal);

  // Only run AI engine when NOT in multiplayer mode
  const isMultiplayer = mode === 'multiplayer' || gameModeType === 'multiplayer';

  // Audio context for sound effects
  const audio = useAudioOptional();

  // Store audio ref for use in callbacks
  const audioRef = useRef(audio);
  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  // Initialize engine
  useEffect(() => {
    const gameEngine = createGameEngine({
      onGoal: (scorer: Player) => {
        // Play goal sound
        audioRef.current?.playGoalScored();
        // scoreGoal handles status transition internally
        scoreGoal(scorer);
      },
      onPaddleHit: () => {
        // Play paddle hit sound
        audioRef.current?.playPaddleHit();
      },
      onWallHit: () => {
        // Play wall bounce sound
        audioRef.current?.playWallBounce();
      },
    });

    gameEngineRef.current = gameEngine;

    return () => {
      gameEngine.cleanup();
    };
  }, [scoreGoal]);

  // Handle goal pause and reset (AI mode only - server handles this in multiplayer)
  useEffect(() => {
    if (isMultiplayer) return; // Server is authoritative in multiplayer

    if (status === 'goal') {
      const timer = setTimeout(() => {
        if (gameEngineRef.current) {
          // Reset puck to the loser's end, stationary
          const serveToward =
            lastScorer === 'player1' ? 'player2' : 'player1';
          gameEngineRef.current.resetPuck({
            serveToward,
            isGameStart: false, // Stationary at loser's end
          });
        }
        resumeAfterGoal();
      }, PHYSICS_CONFIG.game.goalPauseMs);

      return () => clearTimeout(timer);
    }
  }, [status, lastScorer, resumeAfterGoal, isMultiplayer]);

  // Reset puck when game starts (AI mode only - server handles this in multiplayer)
  useEffect(() => {
    if (isMultiplayer) return; // Server is authoritative in multiplayer

    if (status === 'playing' && gameEngineRef.current) {
      // Only reset if scores are 0-0 (new game)
      const store = useGameStore.getState();
      if (store.scores.player1 === 0 && store.scores.player2 === 0) {
        gameEngineRef.current.resetPuck({ isGameStart: true });
      }
    }
  }, [status, isMultiplayer]);

  // Game loop - only runs for AI mode, NOT multiplayer
  useEffect(() => {
    // Skip physics loop entirely in multiplayer mode - server is authoritative
    if (isMultiplayer) {
      return;
    }

    if (status !== 'playing') {
      lastTimeRef.current = 0;
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const delta = Math.min(currentTime - lastTimeRef.current, 32);
      lastTimeRef.current = currentTime;

      if (gameEngineRef.current) {
        updatePhysics(gameEngineRef.current.engine, delta);
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [status, isMultiplayer]);

  // Move paddle function - allow during goal status for repositioning
  const movePaddle = useCallback(
    (player: Player, x: number, y: number) => {
      if (gameEngineRef.current && (status === 'playing' || status === 'goal')) {
        gameEngineRef.current.movePaddle(player, x, y);
      }
    },
    [status]
  );

  // Reset puck function
  const resetPuck = useCallback((options?: ResetPuckOptions) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetPuck(options);
    }
  }, []);

  // Get current bodies for rendering
  const getBodies = useCallback((): GameBodies | null => {
    return gameEngineRef.current?.bodies ?? null;
  }, []);

  return {
    movePaddle,
    resetPuck,
    getBodies,
  };
}

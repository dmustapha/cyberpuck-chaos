'use client';

/**
 * useGameAPI Hook
 *
 * A React hook for game components that need to interact with games.
 * Uses the backend REST API for game operations (cross-browser compatible).
 */

import { useCallback, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { gameAPI, Game as APIGame } from '@/lib/api/game-api';

// ============================================================================
// Types
// ============================================================================

export interface Game {
  id: string;
  roomCode: string;
  creator: string;
  opponent?: string | null;
  stake: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  player1Score?: number;
  player2Score?: number;
  winner?: string | null;
  createdAt: number | string;
}

export interface CreateGameParams {
  stake: string;
  roomCode: string;
}

export interface SubmitResultParams {
  gameId: string;
  player1Score: number;
  player2Score: number;
}

export interface UseGameAPIReturn {
  // State
  isReady: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  isServerConnected: boolean;
  error: Error | null;

  // Game Operations
  createGame: (stake: string, roomCode: string) => Promise<string>;
  joinGame: (gameIdOrRoomCode: string) => Promise<{ gameId: string; game: Game }>;
  submitResult: (gameId: string, player1Score: number, player2Score: number) => Promise<void>;
  cancelGame: (gameId: string) => Promise<void>;

  // Queries
  getOpenGames: () => Promise<Game[]>;
  getMyGames: () => Promise<Game[]>;
  getGame: (gameId: string) => Promise<Game | null>;

  // Utility
  clearError: () => void;
  connect: () => Promise<void>;
}

// ============================================================================
// Helper to convert API Game to local Game type
// ============================================================================

function toGame(apiGame: APIGame): Game {
  return {
    id: apiGame.id,
    roomCode: apiGame.roomCode,
    creator: apiGame.creator,
    opponent: apiGame.opponent,
    stake: apiGame.stake,
    status: apiGame.status,
    player1Score: apiGame.player1Score,
    player2Score: apiGame.player2Score,
    winner: apiGame.winner,
    createdAt: apiGame.createdAt,
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGameAPI(): UseGameAPIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isServerReady, setIsServerReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { address, isConnected } = useAccount();

  // Check server health on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const health = await gameAPI.health();
        if (health.status === 'healthy') {
          setIsServerReady(true);
        }
      } catch (err) {
        console.warn('[useGameAPI] Server not available:', err);
        setIsServerReady(false);
      }
    };

    checkServer();
    // Re-check every 10 seconds
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // State derived from wallet connection and server status
  const isAuthenticated = isConnected;
  const isServerConnected = isConnected && isServerReady;
  const isReady = isServerReady;

  // Create a new game
  const createGame = useCallback(async (stake: string, roomCode: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useGameAPI] Creating game with roomCode:', roomCode);
      const result = await gameAPI.createGame(stake, roomCode);
      console.log('[useGameAPI] Created game:', result.gameId);
      return result.gameId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create game');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join an existing game
  const joinGame = useCallback(async (gameIdOrRoomCode: string): Promise<{ gameId: string; game: Game }> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useGameAPI] Joining game:', gameIdOrRoomCode);
      const result = await gameAPI.joinGame(gameIdOrRoomCode);
      console.log('[useGameAPI] Joined game:', result.gameId);
      return { gameId: result.gameId, game: toGame(result.game) };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join game');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit game result
  const submitResult = useCallback(async (
    gameId: string,
    player1Score: number,
    player2Score: number
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useGameAPI] Submitting result:', { gameId, player1Score, player2Score });
      await gameAPI.submitResult(gameId, player1Score, player2Score);
      console.log('[useGameAPI] Result submitted');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit result');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel a game
  const cancelGame = useCallback(async (gameId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useGameAPI] Cancelling game:', gameId);
      await gameAPI.cancelGame(gameId);
      console.log('[useGameAPI] Game cancelled');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel game');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get open games
  const getOpenGames = useCallback(async (): Promise<Game[]> => {
    setIsLoading(true);
    try {
      const games = await gameAPI.getOpenGames();
      return games.map(toGame);
    } catch (err) {
      console.error('[useGameAPI] Failed to get open games:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get my games (not implemented on backend yet)
  const getMyGames = useCallback(async (): Promise<Game[]> => {
    console.log('[useGameAPI] getMyGames not yet implemented on backend');
    return [];
  }, []);

  // Get a specific game
  const getGame = useCallback(async (gameId: string): Promise<Game | null> => {
    setIsLoading(true);
    try {
      const game = await gameAPI.getGame(gameId);
      return game ? toGame(game) : null;
    } catch (err) {
      console.error('[useGameAPI] Failed to get game:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect to server
  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      const health = await gameAPI.health();
      if (health.status === 'healthy') {
        setIsServerReady(true);
      } else {
        throw new Error('Server is not healthy');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to server');
      setError(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isReady,
    isLoading,
    isConnecting,
    isAuthenticated,
    isServerConnected,
    error,

    // Game Operations
    createGame,
    joinGame,
    submitResult,
    cancelGame,

    // Queries
    getOpenGames,
    getMyGames,
    getGame,

    // Utility
    clearError,
    connect,
  };
}

export default useGameAPI;

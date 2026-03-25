'use client';

/**
 * useMultiplayerGameEngine - Client-side rendering of server-authoritative game state
 *
 * This hook does NOT run physics locally. Instead, it:
 * 1. Connects to the WebSocket server via useMultiplayerGame
 * 2. Receives authoritative game state from server
 * 3. Provides render-ready state to the GameCanvas
 * 4. Sends paddle inputs to the server
 *
 * The server owns all physics and game logic. The client only renders.
 *
 * Player 2 Perspective:
 * - Coordinates are transformed so Player 2 sees the game from their perspective
 * - Their paddle appears at the bottom, opponent's paddle at the top
 * - All coordinates are rotated 180 degrees around the canvas center
 */

import { useCallback, useRef, useEffect } from 'react';
import { useMultiplayerContext, ServerGameState } from '@/contexts/MultiplayerContext';
import { useGameStore } from '@/stores/gameStore';
import { useInterpolation, usePaddleInterpolation } from './useInterpolation';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

// Canvas dimensions for coordinate transformation
const CANVAS_WIDTH = PHYSICS_CONFIG.table.width;
const CANVAS_HEIGHT = PHYSICS_CONFIG.table.height;

// Half dimensions for server-to-canvas coordinate conversion
const HALF_WIDTH = CANVAS_WIDTH / 2;
const HALF_HEIGHT = CANVAS_HEIGHT / 2;

interface MultiplayerBodies {
  puck: { position: { x: number; y: number } };
  paddle1: { position: { x: number; y: number } };
  paddle2: { position: { x: number; y: number } };
}

interface UseMultiplayerGameEngineOptions {
  gameId: string;
  playerId: string;
}

/**
 * Convert server coordinates (centered: 0,0 at center) to canvas coordinates (top-left: 0,0 at top-left).
 * Server: x in [-200, 200], y in [-300, 300] where +y = bottom
 * Canvas: x in [0, 400], y in [0, 600] where +y = bottom
 */
function serverToCanvas(x: number, y: number): { x: number; y: number } {
  return {
    x: x + HALF_WIDTH,
    y: y + HALF_HEIGHT,
  };
}

/**
 * Convert canvas coordinates (top-left) to server coordinates (centered).
 */
function canvasToServer(x: number, y: number): { x: number; y: number } {
  return {
    x: x - HALF_WIDTH,
    y: y - HALF_HEIGHT,
  };
}

/**
 * Rotate a point 180 degrees around the canvas center.
 * Used to transform coordinates for Player 2's perspective.
 * Works on canvas coordinates (top-left system).
 */
function rotatePoint(x: number, y: number): { x: number; y: number } {
  return {
    x: CANVAS_WIDTH - x,
    y: CANVAS_HEIGHT - y,
  };
}

export function useMultiplayerGameEngine({ gameId, playerId }: UseMultiplayerGameEngineOptions) {
  // Shared WebSocket connection from context
  const {
    isConnected,
    isConnecting,
    connectionError,
    gameState,
    playerNumber,
    opponentJoined,
    countdown,
    gameStatus,
    winner,
    pauseState,
    opponentQuit,
    rematchState,
    opponentExited,
    sendPaddleMove,
    sendPauseRequest,
    sendResumeRequest,
    sendQuitGame,
    sendRematchRequest,
    sendRematchResponse,
    sendPlayerExit,
    connect,
    disconnect,
  } = useMultiplayerContext();

  // Connect when gameId and playerId are available
  useEffect(() => {
    if (gameId && playerId) {
      connect(gameId, playerId);
    }
  }, [gameId, playerId, connect]);

  // Interpolation for smoother visuals
  const puckInterpolation = useInterpolation({ delayMs: 33, maxExtrapolateMs: 50 }); // ~2 frames delay
  const opponentPaddleInterp = usePaddleInterpolation(0.4);
  const puckSeqRef = useRef<number>(0); // Local sequence counter for puck updates

  // Store refs for rendering
  const lastServerStateRef = useRef<ServerGameState | null>(null);
  // localPaddleRef stores position in LOCAL VIEW coordinates (bottom of screen for both players)
  const localPaddleRef = useRef<{ x: number; y: number }>({
    x: PHYSICS_CONFIG.table.width / 2,
    y: PHYSICS_CONFIG.table.height - PHYSICS_CONFIG.paddle.radius - 30,
  });

  // Game store actions
  const setMultiplayerScores = useGameStore((s) => s.setMultiplayerScores);
  const setMultiplayerGameOver = useGameStore((s) => s.setMultiplayerGameOver);
  const setOpponentConnected = useGameStore((s) => s.setOpponentConnected);
  const setPageState = useGameStore((s) => s.setPageState);
  const setCountdown = useGameStore((s) => s.setCountdown);
  const storeStatus = useGameStore((s) => s.status);

  // Update local paddle position based on player number
  // Both players see their paddle at the bottom of THEIR view
  useEffect(() => {
    if (playerNumber) {
      localPaddleRef.current = {
        x: PHYSICS_CONFIG.table.width / 2,
        y: PHYSICS_CONFIG.table.height - PHYSICS_CONFIG.paddle.radius - 30,
      };
    }
  }, [playerNumber]);

  // Sync server state to game store
  useEffect(() => {
    if (gameState) {
      lastServerStateRef.current = gameState;
      setMultiplayerScores({
        player1: gameState.score.player1,
        player2: gameState.score.player2,
      });

      // Feed puck data to interpolation system for smooth rendering
      // Convert from server coordinates to canvas coordinates
      const puckCanvas = serverToCanvas(gameState.puck.x, gameState.puck.y);
      puckSeqRef.current += 1;
      puckInterpolation.addSnapshot({
        x: puckCanvas.x,
        y: puckCanvas.y,
        vx: gameState.puck.vx,
        vy: gameState.puck.vy,
        seq: puckSeqRef.current,
      });

      // Update opponent paddle interpolation target
      // Convert from server coordinates (center-origin) to canvas coordinates (top-left origin)
      const opponentPaddle = playerNumber === 1 ? gameState.paddle2 : gameState.paddle1;
      const canvasCoords = serverToCanvas(opponentPaddle.x, opponentPaddle.y);
      opponentPaddleInterp.setTarget(canvasCoords.x, canvasCoords.y);
    }
  }, [gameState, playerNumber, setMultiplayerScores, opponentPaddleInterp, puckInterpolation]);

  // Sync countdown to game store
  useEffect(() => {
    if (countdown !== null && countdown >= 0) {
      setCountdown(countdown);
    }
  }, [countdown, setCountdown]);

  // Handle opponent connection state
  useEffect(() => {
    setOpponentConnected(opponentJoined);
  }, [opponentJoined, setOpponentConnected]);

  // Handle game status transitions
  useEffect(() => {
    if (gameStatus === 'countdown') {
      setPageState('countdown');
    } else if (gameStatus === 'playing') {
      setPageState('playing');
    } else if (gameStatus === 'paused' || gameStatus === 'resuming') {
      // Keep pageState as 'playing' so the game canvas remains visible
      // The pause overlay will be rendered based on pauseState from context
      setPageState('playing');
    } else if (gameStatus === 'ended') {
      // Handle opponent quit or regular game over
      if (opponentQuit.hasQuit && opponentQuit.winner && opponentQuit.finalScore) {
        setMultiplayerGameOver(opponentQuit.winner, opponentQuit.finalScore);
      } else if (winner && gameState) {
        // Server sent game-over with winner and final score
        setMultiplayerGameOver(winner, {
          player1: gameState.score.player1,
          player2: gameState.score.player2,
        });
      }
    }
  }, [gameStatus, setPageState, winner, gameState, opponentQuit, setMultiplayerGameOver]);

  // Move player's paddle and send to server
  const movePaddle = useCallback(
    (paddleOwner: 'player1' | 'player2', x: number, y: number) => {
      // Must have playerNumber assigned from server before we can send moves
      if (!playerNumber) {
        console.log('[MultiplayerEngine] Cannot move paddle: playerNumber not yet assigned');
        return;
      }

      // Only allow moving our own paddle
      // Note: In our rendering, paddle1 is always "our" paddle (bottom of screen)
      // So we accept 'player1' from input handler for the local player
      const isOurPaddle =
        (playerNumber === 1 && paddleOwner === 'player1') ||
        (playerNumber === 2 && paddleOwner === 'player1'); // Player 2 also controls paddle1 in their view

      if (!isOurPaddle) return;

      // Input x, y are in CANVAS coordinates (top-left origin, 0-400 x 0-600)
      // For Player 2, rotate from their view to absolute canvas view first
      let canvasX = x;
      let canvasY = y;
      if (playerNumber === 2) {
        const rotated = rotatePoint(x, y);
        canvasX = rotated.x;
        canvasY = rotated.y;
      }

      // Convert canvas coordinates to server coordinates (center-origin)
      const serverCoords = canvasToServer(canvasX, canvasY);

      // Constrain paddle to valid area (in server coordinate space: center-origin)
      // Server: Player 1 at positive Y (bottom half), Player 2 at negative Y (top half)
      const { table, paddle: paddleConfig } = PHYSICS_CONFIG;
      const halfHeight = table.height / 2; // 300

      // Server coordinate constraints (center-origin: -200 to 200 for X, -300 to 300 for Y)
      // Player 1: y from 0 to +300 (bottom half in server coords)
      // Player 2: y from -300 to 0 (top half in server coords)
      const minY = playerNumber === 1
        ? paddleConfig.radius  // Player 1: slightly above center
        : -halfHeight + paddleConfig.radius; // Player 2: top edge
      const maxY = playerNumber === 1
        ? halfHeight - paddleConfig.radius  // Player 1: bottom edge
        : -paddleConfig.radius; // Player 2: slightly below center
      const minX = -HALF_WIDTH + paddleConfig.radius;
      const maxX = HALF_WIDTH - paddleConfig.radius;

      const constrainedServerX = Math.max(minX, Math.min(maxX, serverCoords.x));
      const constrainedServerY = Math.max(minY, Math.min(maxY, serverCoords.y));

      // Convert back to canvas coordinates for local ref
      const constrainedCanvas = serverToCanvas(constrainedServerX, constrainedServerY);

      // Update local ref for immediate visual feedback (in local view coordinates)
      if (playerNumber === 2) {
        // Store in Player 2's local view (rotated)
        const localView = rotatePoint(constrainedCanvas.x, constrainedCanvas.y);
        localPaddleRef.current = { x: localView.x, y: localView.y };
      } else {
        localPaddleRef.current = { x: constrainedCanvas.x, y: constrainedCanvas.y };
      }

      // Send server coordinates to server (center-origin)
      sendPaddleMove(constrainedServerX, constrainedServerY);
    },
    [playerNumber, sendPaddleMove]
  );

  // Get bodies for rendering (compatible with GameCanvas interface)
  // For Player 2: transforms coordinates so their paddle appears at bottom
  const getBodies = useCallback((): MultiplayerBodies | null => {
    const serverState = lastServerStateRef.current;
    const isPlayer2 = playerNumber === 2;

    if (!serverState) {
      // Return default positions before game starts
      // paddle1 is always "our" paddle (bottom), paddle2 is opponent (top)
      return {
        puck: {
          position: {
            x: PHYSICS_CONFIG.table.width / 2,
            y: PHYSICS_CONFIG.table.height / 2,
          },
        },
        paddle1: {
          position: {
            x: PHYSICS_CONFIG.table.width / 2,
            y: PHYSICS_CONFIG.table.height - PHYSICS_CONFIG.paddle.radius - 30,
          },
        },
        paddle2: {
          position: {
            x: PHYSICS_CONFIG.table.width / 2,
            y: PHYSICS_CONFIG.paddle.radius + 30,
          },
        },
      };
    }

    // Get interpolated positions for smoother rendering
    const interpolatedPuck = puckInterpolation.getInterpolatedPosition();
    const opponentPos = opponentPaddleInterp.getPosition();

    // Use interpolated puck position, fall back to server state if interpolation not ready
    const puckCanvas = interpolatedPuck || serverToCanvas(serverState.puck.x, serverState.puck.y);

    if (isPlayer2) {
      // Player 2 perspective: rotate everything 180 degrees
      // - Their paddle (server's paddle2) appears at bottom as paddle1
      // - Opponent's paddle (server's paddle1) appears at top as paddle2

      // Puck: already in canvas coords from interpolation, rotate for Player 2's view
      const puckRotated = rotatePoint(puckCanvas.x, puckCanvas.y);

      // Our paddle (Player 2's): use local ref (already in local view coords)
      const ourPaddlePos = localPaddleRef.current;

      // Opponent's paddle (Player 1's): already in canvas coords from interpolation, rotate for our view
      const opponentCanvasPos = opponentPos || serverToCanvas(serverState.paddle1.x, serverState.paddle1.y);
      const opponentRotated = rotatePoint(opponentCanvasPos.x, opponentCanvasPos.y);

      return {
        puck: { position: puckRotated },
        paddle1: { position: ourPaddlePos },      // Our paddle at bottom
        paddle2: { position: opponentRotated },   // Opponent at top
      };
    }

    // Player 1 perspective: use canvas coordinates directly
    const paddle1Pos = localPaddleRef.current;
    const paddle2Pos = opponentPos || serverToCanvas(serverState.paddle2.x, serverState.paddle2.y);

    return {
      puck: { position: puckCanvas },
      paddle1: { position: paddle1Pos },
      paddle2: { position: paddle2Pos },
    };
  }, [playerNumber, opponentPaddleInterp, puckInterpolation]);

  // Reset puck (clear interpolation buffers)
  const resetPuck = useCallback(() => {
    // Server is authoritative for physics, but clear local interpolation buffers
    puckInterpolation.clear();
    opponentPaddleInterp.clear();
    puckSeqRef.current = 0;
  }, [puckInterpolation, opponentPaddleInterp]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Game state
    playerNumber,
    opponentJoined,
    countdown,
    gameStatus,
    winner,
    gameState,

    // Pause state
    pauseState,
    opponentQuit,

    // Rematch state
    rematchState,
    opponentExited,

    // Rendering interface (compatible with useGameEngine)
    getBodies,
    movePaddle,
    resetPuck,

    // Actions
    sendPaddleMove,
    sendPauseRequest,
    sendResumeRequest,
    sendQuitGame,
    sendRematchRequest,
    sendRematchResponse,
    sendPlayerExit,
    disconnect,
  };
}

export type { MultiplayerBodies };

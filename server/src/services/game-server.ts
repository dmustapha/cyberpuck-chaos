import { WebSocket } from 'ws';
import { roomManager, type PauseState } from '../websocket/room-manager';
import { PhysicsEngine } from '../physics/engine';
import { PHYSICS_CONFIG } from '../physics/config';
import type { PauseReason, Score } from '../websocket/message-types';
import { ChaosMiddleware } from '../chaos/middleware';
import { OnChainService } from './on-chain';
import type { ChaosInput } from '../types/shared';
import type { PhysicsBodies } from '../chaos/executor';

const ZERO_ADDRESS = '0x' + '0'.repeat(64);

function normalizeAddress(address: string | undefined): string {
  if (!address || !address.startsWith('0x')) return ZERO_ADDRESS;
  return address;
}

export class GameServer {
  // === Chaos Agent Integration ===
  private chaosPerRoom = new Map<string, ChaosMiddleware>();
  private onChain: OnChainService;
  private matchStartTimes = new Map<string, number>();

  constructor(onChain: OnChainService) {
    this.onChain = onChain;
  }

  // State locks to prevent race conditions
  private startingGames: Set<string> = new Set();
  private endingGames: Set<string> = new Set();
  private countdownIntervals: Map<string, NodeJS.Timeout> = new Map();
  // Track current countdown value for reconnecting players
  private countdownValues: Map<string, number> = new Map();
  // Grace period for reconnection (prevents instant forfeit on screen transitions)
  private disconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly RECONNECT_GRACE_MS = 5000; // 5 seconds to reconnect
  // Resume countdown intervals
  private resumeCountdownIntervals: Map<string, NodeJS.Timeout> = new Map();
  // Pause rate limiting (1 pause per 5 seconds per player)
  private lastPauseTime: Map<string, number> = new Map();
  private readonly PAUSE_COOLDOWN_MS = 5000;
  // Disconnect grace period for pause-on-disconnect
  private readonly DISCONNECT_GRACE_PERIOD_MS = 30000; // 30 seconds

  async handleJoinRoom(ws: WebSocket, gameId: string, playerId: string, walletAddress?: string): Promise<void> {
    // 1. Check if room exists, if not create it
    let room = roomManager.getRoom(gameId);
    if (!room) {
      room = roomManager.createRoom(gameId);
    }

    // 2. Join the room
    const result = roomManager.joinRoom(gameId, playerId, ws, walletAddress);
    if (!result.success) {
      try {
        ws.send(JSON.stringify({ type: 'error', code: 'JOIN_FAILED', message: result.error }));
      } catch (error) {
        console.error('[GameServer] Failed to send join error:', error);
      }
      return;
    }

    // Cancel any pending disconnect timeout for this player (they reconnected)
    const timeoutKey = `${gameId}:${playerId}`;
    const pendingTimeout = this.disconnectTimeouts.get(timeoutKey);
    if (pendingTimeout) {
      console.log(`[GameServer] Player ${playerId} reconnected, cancelling disconnect timeout`);
      clearTimeout(pendingTimeout);
      this.disconnectTimeouts.delete(timeoutKey);
    }

    // 3. Send room-joined to this player
    try {
      ws.send(JSON.stringify({ type: 'room-joined', gameId, playerNumber: result.playerNumber }));
    } catch (error) {
      console.error('[GameServer] Failed to send room-joined:', error);
    }

    // 3.5. If game is already in progress (reconnection scenario), send current state
    if (room.state === 'countdown') {
      // Send opponent-joined and current countdown value
      const currentCountdown = this.countdownValues.get(gameId);
      try {
        ws.send(JSON.stringify({ type: 'opponent-joined', opponentId: 'opponent' }));
        if (currentCountdown !== undefined) {
          ws.send(JSON.stringify({ type: 'countdown', seconds: currentCountdown }));
        }
      } catch (error) {
        console.error('[GameServer] Failed to send countdown state on reconnect:', error);
      }
      console.log(`[GameServer] Player ${playerId} reconnected during countdown, sent current state (${currentCountdown}s)`);
    } else if (room.state === 'playing' && room.physicsEngine) {
      // Sync modifier radii before sending state so reconnecting player sees correct sizes
      const roomChaos = this.chaosPerRoom.get(gameId);
      if (roomChaos) {
        room.physicsEngine.setCurrentRadii(roomChaos.getExecutor().getCurrentRadii());
        room.physicsEngine.setMaxSpeedOverride(roomChaos.getExecutor().getEffectiveMaxSpeed());
      }
      const state = room.physicsEngine.getState();
      try {
        ws.send(JSON.stringify({ type: 'opponent-joined', opponentId: 'opponent' }));
        ws.send(JSON.stringify({ type: 'state-update', ...state }));
      } catch (error) {
        console.error('[GameServer] Failed to send state on reconnect:', error);
      }
      console.log(`[GameServer] Player ${playerId} reconnected during playing, sent current state`);
    } else if ((room.state === 'paused' || room.state === 'resuming') && room.pauseState) {
      // Player reconnected during pause - send current pause state
      const state = room.pauseState.savedGameState;
      try {
        ws.send(JSON.stringify({ type: 'opponent-joined', opponentId: 'opponent' }));
        ws.send(JSON.stringify({ type: 'state-update', ...state }));
        ws.send(JSON.stringify({
          type: 'game-paused',
          reason: room.pauseState.reason,
          pausedBy: room.pauseState.pausedBy,
          canResume: true, // They can now resume since they reconnected
          gracePeriodMs: room.pauseState.disconnectedPlayerId ? this.DISCONNECT_GRACE_PERIOD_MS : undefined
        }));
      } catch (error) {
        console.error('[GameServer] Failed to send pause state on reconnect:', error);
      }
      console.log(`[GameServer] Player ${playerId} reconnected during ${room.state}, sent current state`);

      // If this was the disconnected player, update pause state to allow resume
      if (room.pauseState.disconnectedPlayerId === playerId) {
        console.log(`[GameServer] Disconnected player ${playerId} reconnected - game can now resume`);
        // Update canResume for both players
        roomManager.broadcast(gameId, {
          type: 'game-paused',
          reason: room.pauseState.reason,
          pausedBy: room.pauseState.pausedBy,
          canResume: true
        });
      }
    }

    // 4. If 2 players now, notify both and start countdown
    // Use startingGames lock to prevent race condition with simultaneous joins
    if (room.players.size === 2 && !this.startingGames.has(gameId)) {
      this.startingGames.add(gameId);
      roomManager.broadcast(gameId, { type: 'opponent-joined', opponentId: 'opponent' });
      this.startCountdown(gameId);
    }
  }

  handlePaddleMove(ws: WebSocket, x: number, y: number): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const room = roomManager.getRoom(roomInfo.gameId);
    if (!room || !room.physicsEngine) return;

    const player = room.players.get(roomInfo.playerId);
    if (!player) return;

    room.physicsEngine.setPaddleTarget(player.playerNumber, x, y);
  }

  handlePlayerReady(ws: WebSocket, gameId: string): void {
    // Could track ready state if needed
  }

  /**
   * Handle pause request from a player
   */
  handlePauseRequest(ws: WebSocket): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId, playerId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Only allow pause during playing state
    if (room.state !== 'playing') {
      console.log(`[GameServer] Pause request ignored - game not playing (state: ${room.state})`);
      return;
    }

    // Rate limit: check cooldown
    const pauseKey = `${gameId}:${playerId}`;
    const lastPause = this.lastPauseTime.get(pauseKey);
    const now = Date.now();
    if (lastPause && now - lastPause < this.PAUSE_COOLDOWN_MS) {
      console.log(`[GameServer] Pause request rate limited for player ${playerId}`);
      return;
    }
    this.lastPauseTime.set(pauseKey, now);

    // Get player number for the pause message
    const player = room.players.get(playerId);
    if (!player) return;

    this.pauseGame(gameId, 'player_pause', player.playerNumber);
  }

  /**
   * Handle resume request from a player
   */
  handleResumeRequest(ws: WebSocket): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Only allow resume during paused state
    if (room.state !== 'paused') {
      console.log(`[GameServer] Resume request ignored - game not paused (state: ${room.state})`);
      return;
    }

    // Don't allow resume if paused due to disconnect and player hasn't reconnected
    if (room.pauseState?.reason === 'opponent_disconnected' && room.pauseState.disconnectedPlayerId) {
      const disconnectedPlayer = room.players.get(room.pauseState.disconnectedPlayerId);
      if (!disconnectedPlayer || disconnectedPlayer.ws.readyState !== 1) {
        console.log(`[GameServer] Resume request ignored - disconnected player hasn't reconnected`);
        return;
      }
    }

    this.startResumeCountdown(gameId);
  }

  /**
   * Handle quit request from a player
   */
  handleQuitGame(ws: WebSocket): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId, playerId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Get the quitting player's number
    const quittingPlayer = room.players.get(playerId);
    if (!quittingPlayer) return;

    // Determine winner (opponent of quitting player)
    const winner: 1 | 2 = quittingPlayer.playerNumber === 1 ? 2 : 1;

    // Get current score or default
    const score = room.physicsEngine?.getState().score || { player1: 0, player2: 0 };

    console.log(`[GameServer] Player ${playerId} (P${quittingPlayer.playerNumber}) quit game ${gameId}`);

    // Stop physics and intervals
    room.physicsEngine?.stop();
    if (room.broadcastInterval) {
      clearInterval(room.broadcastInterval);
      room.broadcastInterval = null;
    }

    // Clear any pause-related state
    this.clearPauseState(gameId);

    // Mark room as ended
    roomManager.setRoomState(gameId, 'ended');

    // Notify all players that opponent quit
    roomManager.broadcast(gameId, {
      type: 'opponent-quit',
      winner,
      finalScore: score
    });

    // Clean up state locks
    this.startingGames.delete(gameId);
    this.endingGames.delete(gameId);
  }

  /**
   * Pause the game (internal method)
   */
  private pauseGame(gameId: string, reason: PauseReason, pausedBy: 1 | 2 | null, disconnectedPlayerId?: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room || !room.physicsEngine) return;

    console.log(`[GameServer] Pausing game ${gameId} - reason: ${reason}, by: P${pausedBy}`);

    // Stop broadcast interval (preserves physics state)
    if (room.broadcastInterval) {
      clearInterval(room.broadcastInterval);
      room.broadcastInterval = null;
    }

    // Pause physics engine
    const savedState = room.physicsEngine.pause();

    // Store pause state
    room.pauseState = {
      reason,
      pausedBy,
      pausedAt: Date.now(),
      disconnectedPlayerId,
      savedGameState: savedState
    };

    // Set room state to paused
    roomManager.setRoomState(gameId, 'paused');

    // Determine if can resume (not if disconnected player hasn't reconnected)
    const canResume = reason !== 'opponent_disconnected';
    const gracePeriodMs = reason === 'opponent_disconnected' ? this.DISCONNECT_GRACE_PERIOD_MS : undefined;

    // Broadcast pause to all players
    roomManager.broadcast(gameId, {
      type: 'game-paused',
      reason,
      pausedBy,
      canResume,
      gracePeriodMs
    });
  }

  /**
   * Start the resume countdown (3-2-1 then resume)
   */
  private startResumeCountdown(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Cancel any existing resume countdown
    const existingInterval = this.resumeCountdownIntervals.get(gameId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    roomManager.setRoomState(gameId, 'resuming');
    let seconds = 3;

    console.log(`[GameServer] Starting resume countdown for game ${gameId}`);

    // Send initial countdown
    roomManager.broadcast(gameId, { type: 'resume-countdown', seconds });

    const interval = setInterval(() => {
      seconds--;

      if (seconds > 0) {
        roomManager.broadcast(gameId, { type: 'resume-countdown', seconds });
      } else {
        clearInterval(interval);
        this.resumeCountdownIntervals.delete(gameId);
        this.resumeGame(gameId);
      }
    }, 1000);

    this.resumeCountdownIntervals.set(gameId, interval);
  }

  /**
   * Resume the game after countdown
   */
  private resumeGame(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room || !room.physicsEngine) return;

    console.log(`[GameServer] Resuming game ${gameId}`);

    // Resume physics
    room.physicsEngine.resume();

    // Clear pause state
    room.pauseState = null;

    // Set room state back to playing
    roomManager.setRoomState(gameId, 'playing');

    // Restart broadcast loop with chaos sync
    const broadcastMs = 1000 / PHYSICS_CONFIG.game.broadcastRate;
    room.broadcastInterval = setInterval(() => {
      const physics = room.physicsEngine!;
      const roomChaos = this.chaosPerRoom.get(gameId);
      if (roomChaos) {
        const executor = roomChaos.getExecutor();
        physics.setCurrentRadii(executor.getCurrentRadii());
        physics.setMaxSpeedOverride(executor.getEffectiveMaxSpeed());
      }
      const state = physics.getState();
      roomManager.broadcast(gameId, { type: 'state-update', ...state });
    }, broadcastMs);

    // Notify players game resumed
    roomManager.broadcast(gameId, { type: 'game-resumed' });
  }

  /**
   * Clear all pause-related state for a game
   */
  private clearPauseState(gameId: string): void {
    // Clear resume countdown if running
    const resumeInterval = this.resumeCountdownIntervals.get(gameId);
    if (resumeInterval) {
      clearInterval(resumeInterval);
      this.resumeCountdownIntervals.delete(gameId);
    }

    // Clear grace period timeout if any
    const room = roomManager.getRoom(gameId);
    if (room?.pauseState?.gracePeriodTimeout) {
      clearTimeout(room.pauseState.gracePeriodTimeout);
    }

    // Clear pause state
    if (room) {
      room.pauseState = null;
    }

    // Clear pause rate limiting for this game
    for (const [key] of this.lastPauseTime) {
      if (key.startsWith(gameId)) {
        this.lastPauseTime.delete(key);
      }
    }
  }

  handleDisconnect(gameId: string, playerId: string, disconnectedWs?: WebSocket): void {
    const room = roomManager.getRoom(gameId);

    if (!room) {
      return;
    }

    // Check if the disconnected WebSocket is still the current one for this player
    // If not, this is a stale disconnect from a previous connection (player reconnected)
    const currentPlayer = room.players.get(playerId);
    if (disconnectedWs && currentPlayer && currentPlayer.ws !== disconnectedWs) {
      console.log(`[GameServer] Ignoring stale disconnect for player ${playerId} (already reconnected)`);
      return;
    }

    const timeoutKey = `${gameId}:${playerId}`;

    // Handle disconnect during active gameplay - PAUSE the game
    if (room.state === 'playing') {
      console.log(`[GameServer] Player ${playerId} disconnected during gameplay, pausing game`);

      // Get disconnected player's number
      const disconnectedPlayer = room.players.get(playerId);
      const disconnectedPlayerNumber = disconnectedPlayer?.playerNumber || null;

      // Pause the game with disconnect reason
      this.pauseGame(gameId, 'opponent_disconnected', disconnectedPlayerNumber, playerId);

      // Start grace period timeout for forfeit
      const timeout = setTimeout(() => {
        this.disconnectTimeouts.delete(timeoutKey);

        const currentRoom = roomManager.getRoom(gameId);
        if (!currentRoom) return;

        // Check if player reconnected
        const player = currentRoom.players.get(playerId);
        if (player && player.ws !== disconnectedWs && player.ws.readyState === 1) {
          console.log(`[GameServer] Player ${playerId} reconnected during grace period`);
          return;
        }

        // Grace period expired - forfeit
        console.log(`[GameServer] Disconnect grace period expired for player ${playerId}, forfeiting`);

        const otherPlayer = Array.from(currentRoom.players.entries()).find(([id]) => id !== playerId);
        if (otherPlayer) {
          const winner = otherPlayer[1].playerNumber;
          const score = currentRoom.pauseState?.savedGameState.score ||
                       currentRoom.physicsEngine?.getState().score ||
                       { player1: 0, player2: 0 };
          this.endGame(gameId, winner, score);
        }

        roomManager.leaveRoom(gameId, playerId);
      }, this.DISCONNECT_GRACE_PERIOD_MS);

      this.disconnectTimeouts.set(timeoutKey, timeout);

      // Store the timeout reference in pause state for cleanup
      if (room.pauseState) {
        room.pauseState.gracePeriodTimeout = timeout;
      }

      return;
    }

    // Handle disconnect during paused state - just update grace period
    if (room.state === 'paused' || room.state === 'resuming') {
      console.log(`[GameServer] Player ${playerId} disconnected during ${room.state}, maintaining pause`);
      // Don't do anything - game is already paused
      return;
    }

    // Handle disconnect during countdown or waiting - use short grace period
    if (room.state === 'countdown' || room.state === 'waiting') {
      console.log(`[GameServer] Player ${playerId} disconnected during ${room.state}, starting ${this.RECONNECT_GRACE_MS}ms grace period`);

      const timeout = setTimeout(() => {
        this.disconnectTimeouts.delete(timeoutKey);

        const currentRoom = roomManager.getRoom(gameId);
        if (!currentRoom) return;

        // Check if player reconnected
        const player = currentRoom.players.get(playerId);
        if (player && player.ws !== disconnectedWs) {
          console.log(`[GameServer] Player ${playerId} already reconnected, skipping disconnect handling`);
          return;
        }

        console.log(`[GameServer] Grace period expired for player ${playerId}, processing disconnect`);

        if (currentRoom.state === 'countdown') {
          // Cancel countdown and notify remaining player
          const interval = this.countdownIntervals.get(gameId);
          if (interval) {
            clearInterval(interval);
            this.countdownIntervals.delete(gameId);
          }
          this.countdownValues.delete(gameId);
          roomManager.setRoomState(gameId, 'waiting');
          this.startingGames.delete(gameId);

          // Notify remaining player that opponent disconnected
          roomManager.broadcast(gameId, { type: 'opponent-disconnected' });
        } else if (currentRoom.state === 'waiting') {
          // Notify other player (if any) that opponent disconnected
          roomManager.broadcast(gameId, { type: 'opponent-disconnected' }, playerId);
        }

        roomManager.leaveRoom(gameId, playerId);
      }, this.RECONNECT_GRACE_MS);

      this.disconnectTimeouts.set(timeoutKey, timeout);
      return;
    }

    // For 'ended' state, disconnect immediately (no reconnection needed)
    roomManager.leaveRoom(gameId, playerId);
  }

  private startCountdown(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    roomManager.setRoomState(gameId, 'countdown');
    let seconds = PHYSICS_CONFIG.game.countdownSeconds;

    // Initialize countdown tracking
    this.countdownValues.set(gameId, seconds);

    // Store interval for cleanup on disconnect
    const countdownInterval = setInterval(() => {
      const currentRoom = roomManager.getRoom(gameId);
      if (!currentRoom || currentRoom.state !== 'countdown') {
        clearInterval(countdownInterval);
        this.countdownIntervals.delete(gameId);
        this.countdownValues.delete(gameId);
        return;
      }

      // Update tracked value BEFORE broadcast so reconnecting players get current value
      this.countdownValues.set(gameId, seconds);
      roomManager.broadcast(gameId, { type: 'countdown', seconds });
      seconds--;

      if (seconds < 0) {
        clearInterval(countdownInterval);
        this.countdownIntervals.delete(gameId);
        this.countdownValues.delete(gameId);
        this.startGame(gameId);
      }
    }, 1000);

    this.countdownIntervals.set(gameId, countdownInterval);
  }

  private startGame(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Create physics engine
    const physics = new PhysicsEngine();
    room.physicsEngine = physics;

    // === Chaos Agent: init per-room chaos middleware ===
    const chaos = new ChaosMiddleware();
    this.chaosPerRoom.set(gameId, chaos);
    const matchStartTime = Date.now();
    this.matchStartTimes.set(gameId, matchStartTime);
    chaos.onMatchStart(matchStartTime);

    // Register goal callback
    physics.onGoal((scorer) => {
      const state = physics.getState();
      roomManager.broadcast(gameId, { type: 'goal', scorer, newScore: state.score });

      // Check for game over
      if (state.score.player1 >= PHYSICS_CONFIG.game.maxScore) {
        this.endGame(gameId, 1, state.score);
      } else if (state.score.player2 >= PHYSICS_CONFIG.game.maxScore) {
        this.endGame(gameId, 2, state.score);
      }
    });

    // Start physics
    physics.start();
    roomManager.setRoomState(gameId, 'playing');

    // Start broadcast loop (30Hz) with chaos integration
    const broadcastMs = 1000 / PHYSICS_CONFIG.game.broadcastRate;
    room.broadcastInterval = setInterval(() => {
      // === Chaos Agent: tick ===
      const roomChaos = this.chaosPerRoom.get(gameId);
      if (roomChaos) {
        const bodies: PhysicsBodies = {
          puck: physics.getPuckBody(),
          paddles: [physics.getPaddle1Body(), physics.getPaddle2Body()],
        };

        // Build chaos input from current state, then tick chaos
        const preState = physics.getState();
        const chaosInput = this.buildChaosInput(gameId, preState);
        const chaosEvent = roomChaos.tick(bodies, chaosInput, physics.isPuckFrozen());

        // Sync modifier radii + speed cap AFTER chaos tick (so expiry is reflected immediately)
        const executor = roomChaos.getExecutor();
        physics.setCurrentRadii(executor.getCurrentRadii());
        physics.setMaxSpeedOverride(executor.getEffectiveMaxSpeed());

        const state = physics.getState();

        if (chaosEvent?.type === 'modifier_applied' && chaosEvent.modifier) {
          roomManager.broadcast(gameId, {
            type: 'MODIFIER_APPLIED',
            modifier: {
              id: chaosEvent.modifier.id,
              type: chaosEvent.modifier.type,
              variation: chaosEvent.modifier.variation,
              target: chaosEvent.modifier.target,
              duration: chaosEvent.modifier.duration,
              reason: chaosEvent.modifier.reason,
              startTime: chaosEvent.modifier.startTime,
            },
          });
        }

        if (chaosEvent?.type === 'modifier_expired' && chaosEvent.modifierId) {
          roomManager.broadcast(gameId, {
            type: 'MODIFIER_EXPIRED',
            modifierId: chaosEvent.modifierId,
          });
        }

        roomManager.broadcast(gameId, { type: 'state-update', ...state });
      } else {
        const state = physics.getState();
        roomManager.broadcast(gameId, { type: 'state-update', ...state });
      }
    }, broadcastMs);
  }

  private buildChaosInput(gameId: string, state: ReturnType<PhysicsEngine['getState']>): ChaosInput {
    const matchStart = this.matchStartTimes.get(gameId) ?? Date.now();
    const elapsed = (Date.now() - matchStart) / 1000;
    const maxScore = PHYSICS_CONFIG.game.maxScore;
    const highScore = Math.max(state.score.player1, state.score.player2);

    const matchPhase: 'early' | 'mid' | 'late' =
      highScore >= maxScore - 2 ? 'late' :
      highScore >= Math.ceil(maxScore * 0.4) ? 'mid' : 'early';

    // Get recent modifier types from chaos middleware
    const chaos = this.chaosPerRoom.get(gameId);
    const recentModifiers = chaos?.getRecentTypes() ?? [];

    return {
      score: [state.score.player1, state.score.player2],
      matchPhase,
      recentModifiers,
      matchTimeSeconds: Math.floor(elapsed),
      maxScore,
    };
  }

  private async endGame(gameId: string, winner: 1 | 2, score: { player1: number; player2: number }): Promise<void> {
    // Idempotency check - prevent double execution
    if (this.endingGames.has(gameId)) {
      return;
    }
    this.endingGames.add(gameId);

    const room = roomManager.getRoom(gameId);
    if (!room || room.state === 'ended') {
      this.endingGames.delete(gameId);
      return;
    }

    // Stop physics and broadcast interval
    room.physicsEngine?.stop();
    if (room.broadcastInterval) {
      clearInterval(room.broadcastInterval);
      room.broadcastInterval = null;
    }

    // Clear any countdown interval (safety check)
    const countdownInterval = this.countdownIntervals.get(gameId);
    if (countdownInterval) {
      clearInterval(countdownInterval);
      this.countdownIntervals.delete(gameId);
    }
    this.countdownValues.delete(gameId);

    roomManager.setRoomState(gameId, 'ended');

    // Broadcast game-over IMMEDIATELY — don't block on on-chain recording
    roomManager.broadcast(gameId, { type: 'game-over', winner, finalScore: score });

    // === Chaos Agent: end match + on-chain recording (async, non-blocking) ===
    const chaos = this.chaosPerRoom.get(gameId);
    if (chaos) {
      const { decisions, modifierCount } = chaos.onMatchEnd();

      if (this.onChain.enabled) {
        const matchStart = this.matchStartTimes.get(gameId) ?? Date.now();
        const wallets = roomManager.getPlayerWallets(gameId);
        this.onChain.recordMatchWithDecisions(
          {
            player1: normalizeAddress(wallets.player1),
            player2: normalizeAddress(wallets.player2),
            score1: score.player1,
            score2: score.player2,
            durationSeconds: Math.floor((Date.now() - matchStart) / 1000),
            modifiersDeployed: modifierCount,
            timestamp: Math.floor(Date.now() / 1000),
          },
          decisions
            .filter((d) => d.decision.action === 'deploy_modifier' && d.decision.modifier)
            .map((d) => ({
              modifierType: d.decision.modifier!.type,
              target: d.decision.modifier!.target,
              reason: d.decision.modifier!.reason,
              timestamp: Math.floor(d.timestamp / 1000),
            })),
        ).then((result) => {
          if (result) {
            // Send txDigest as follow-up to any still-connected players
            roomManager.broadcast(gameId, { type: 'tx-recorded', txDigest: result.digest });
          }
        }).catch((err) => console.error('[GameServer] On-chain recording failed:', err));
      }

      // Clean up chaos state
      this.chaosPerRoom.delete(gameId);
      this.matchStartTimes.delete(gameId);
    }

    // Clean up state locks
    this.endingGames.delete(gameId);
    this.startingGames.delete(gameId);
  }

  /**
   * Handle rematch request from a player
   * Notifies the other player that opponent wants to play again
   */
  handleRematchRequest(ws: WebSocket): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId, playerId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Only allow rematch request when game is ended
    if (room.state !== 'ended') {
      console.log(`[GameServer] Rematch request ignored - game not ended (state: ${room.state})`);
      return;
    }

    // Check if there's already a pending rematch request
    if (room.rematchState) {
      console.log(`[GameServer] Rematch already requested by player ${room.rematchState.requestedBy}`);
      return;
    }

    console.log(`[GameServer] Player ${playerId} requested rematch in game ${gameId}`);

    // Store rematch state
    room.rematchState = {
      requestedBy: playerId,
      requestedAt: Date.now()
    };

    // Notify the other player
    roomManager.broadcast(gameId, { type: 'rematch-requested' }, playerId);
  }

  /**
   * Handle rematch response from the other player
   */
  handleRematchResponse(ws: WebSocket, accepted: boolean): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId, playerId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Only process if there's a pending rematch request
    if (!room.rematchState) {
      console.log(`[GameServer] No pending rematch request in game ${gameId}`);
      return;
    }

    // Make sure this is NOT the player who requested the rematch
    if (room.rematchState.requestedBy === playerId) {
      console.log(`[GameServer] Player ${playerId} cannot respond to their own rematch request`);
      return;
    }

    console.log(`[GameServer] Player ${playerId} ${accepted ? 'accepted' : 'declined'} rematch in game ${gameId}`);

    if (accepted) {
      // Both players agreed - reset room for new game
      room.rematchState = null;
      room.pauseState = null;
      room.physicsEngine = null;

      // Reset room state to waiting temporarily, then start countdown
      roomManager.setRoomState(gameId, 'waiting');

      // Clear any old state locks
      this.startingGames.delete(gameId);
      this.endingGames.delete(gameId);

      // Notify both players rematch is starting
      roomManager.broadcast(gameId, { type: 'rematch-accepted' });

      // Start countdown for new game
      this.startingGames.add(gameId);
      this.startCountdown(gameId);
    } else {
      // Rematch declined - notify both players
      room.rematchState = null;
      roomManager.broadcast(gameId, { type: 'rematch-declined' });
    }
  }

  /**
   * Handle player exit (leaving the post-game screen)
   * This is different from quit-game which happens during gameplay
   */
  handlePlayerExit(ws: WebSocket): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const { gameId, playerId } = roomInfo;
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    console.log(`[GameServer] Player ${playerId} exited game ${gameId}`);

    // Clear any rematch state
    room.rematchState = null;

    // Notify the other player
    roomManager.broadcast(gameId, { type: 'opponent-exited' }, playerId);

    // Remove this player from the room
    roomManager.leaveRoom(gameId, playerId);

    // If room is empty, it will be cleaned up automatically by leaveRoom
  }
}

// Singleton created later with OnChainService — see createGameServer()
let _gameServer: GameServer | null = null;
export function createGameServer(onChain: OnChainService): GameServer {
  _gameServer = new GameServer(onChain);
  return _gameServer;
}
export function getGameServer(): GameServer {
  if (!_gameServer) throw new Error('GameServer not initialized — call createGameServer first');
  return _gameServer;
}
// Backward-compatible lazy getter (used by existing imports)
export const gameServer = new Proxy({} as GameServer, {
  get(_, prop) {
    return (getGameServer() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

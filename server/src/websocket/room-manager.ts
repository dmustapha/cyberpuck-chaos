import type { WebSocket } from 'ws';
import type { PhysicsEngine, GameState } from '../physics/engine';
import type { ServerMessage, PauseReason } from './message-types';

export type { PhysicsEngine };

export interface PauseState {
  reason: PauseReason;
  pausedBy: 1 | 2 | null;
  pausedAt: number;
  disconnectedPlayerId?: string;
  savedGameState: GameState;
  gracePeriodTimeout?: NodeJS.Timeout;
}

export interface RematchState {
  requestedBy: string; // playerId who requested
  requestedAt: number;
}

export interface GameRoom {
  gameId: string;
  players: Map<string, { ws: WebSocket; playerNumber: 1 | 2 }>;
  state: 'waiting' | 'countdown' | 'playing' | 'paused' | 'resuming' | 'ended';
  physicsEngine: PhysicsEngine | null;
  broadcastInterval: NodeJS.Timeout | null;
  pauseState: PauseState | null;
  rematchState: RematchState | null;
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private wsToRoom: Map<WebSocket, { gameId: string; playerId: string }> = new Map();

  /**
   * Create a new game room
   */
  createRoom(gameId: string): GameRoom {
    if (this.rooms.has(gameId)) {
      throw new Error(`Room ${gameId} already exists`);
    }

    const room: GameRoom = {
      gameId,
      players: new Map(),
      state: 'waiting',
      physicsEngine: null,
      broadcastInterval: null,
      pauseState: null,
      rematchState: null,
    };

    this.rooms.set(gameId, room);
    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(gameId: string): GameRoom | undefined {
    return this.rooms.get(gameId);
  }

  /**
   * Add player to room (max 2 players)
   */
  joinRoom(
    gameId: string,
    playerId: string,
    ws: WebSocket
  ): { success: boolean; playerNumber?: 1 | 2; error?: string } {
    const room = this.rooms.get(gameId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Check if player is already in the room
    const existingPlayer = room.players.get(playerId);
    if (existingPlayer) {
      // Player is reconnecting with a new WebSocket - this is a valid scenario
      // that happens during screen transitions (e.g., waiting -> ready)
      console.log(`[RoomManager] Player ${playerId} reconnecting to room ${gameId}`);

      // Remove the old WebSocket mapping
      this.wsToRoom.delete(existingPlayer.ws);

      // Update to new WebSocket while preserving player number
      room.players.set(playerId, { ws, playerNumber: existingPlayer.playerNumber });

      // Track new WebSocket for reverse lookup
      this.wsToRoom.set(ws, { gameId, playerId });

      return { success: true, playerNumber: existingPlayer.playerNumber };
    }

    if (room.players.size >= 2) {
      return { success: false, error: 'Room is full' };
    }

    if (room.state !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    // Assign player number (1 for first player, 2 for second)
    const playerNumber: 1 | 2 = room.players.size === 0 ? 1 : 2;

    room.players.set(playerId, { ws, playerNumber });

    // Track WebSocket for reverse lookup
    this.wsToRoom.set(ws, { gameId, playerId });

    return { success: true, playerNumber };
  }

  /**
   * Remove player from room, cleanup if empty
   */
  leaveRoom(gameId: string, playerId: string): void {
    const room = this.rooms.get(gameId);

    if (!room) {
      return;
    }

    const player = room.players.get(playerId);
    if (player) {
      this.wsToRoom.delete(player.ws);
    }

    room.players.delete(playerId);

    // Cleanup empty room
    if (room.players.size === 0) {
      if (room.broadcastInterval) {
        clearInterval(room.broadcastInterval);
      }
      this.rooms.delete(gameId);
    }
  }

  /**
   * Send message to all players in room
   */
  broadcast(gameId: string, message: ServerMessage, excludePlayerId?: string): void {
    const room = this.rooms.get(gameId);

    if (!room) {
      return;
    }

    const messageStr = JSON.stringify(message);

    for (const [playerId, player] of room.players) {
      if (excludePlayerId && playerId === excludePlayerId) {
        continue;
      }

      try {
        if (player.ws.readyState === 1) { // WebSocket.OPEN
          player.ws.send(messageStr);
        }
      } catch (error) {
        console.error(`[RoomManager] Failed to send to player ${playerId}:`, error);
        // Optionally mark this player for cleanup
      }
    }
  }

  /**
   * Send message to specific player
   */
  sendToPlayer(gameId: string, playerId: string, message: ServerMessage): void {
    const room = this.rooms.get(gameId);

    if (!room) {
      return;
    }

    const player = room.players.get(playerId);

    try {
      if (player && player.ws.readyState === 1) { // WebSocket.OPEN
        player.ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error(`[RoomManager] Failed to send to player ${playerId}:`, error);
    }
  }

  /**
   * Update room state
   */
  setRoomState(gameId: string, state: GameRoom['state']): void {
    const room = this.rooms.get(gameId);

    if (room) {
      room.state = state;
    }
  }

  /**
   * Find room and player by WebSocket connection (O(1) lookup)
   */
  getRoomByWebSocket(ws: WebSocket): { gameId: string; playerId: string } | undefined {
    return this.wsToRoom.get(ws);
  }

  /**
   * Get all rooms (for debugging/admin)
   */
  getAllRooms(): Map<string, GameRoom> {
    return this.rooms;
  }

  /**
   * Get count of active rooms
   */
  getRoomCount(): number {
    return this.rooms.size;
  }

  /**
   * Force cleanup a room and all its resources
   */
  cleanupRoom(gameId: string): void {
    const room = this.rooms.get(gameId);
    if (!room) {
      return;
    }

    // Clear broadcast interval
    if (room.broadcastInterval) {
      clearInterval(room.broadcastInterval);
      room.broadcastInterval = null;
    }

    // Remove all WebSocket mappings
    for (const [playerId, player] of room.players) {
      this.wsToRoom.delete(player.ws);
    }

    // Delete the room
    this.rooms.delete(gameId);

    console.log(`[RoomManager] Cleaned up room ${gameId}`);
  }
  // === Quick Match ===
  private matchmakingQueue: Array<{
    ws: WebSocket;
    playerId: string;
    walletAddress?: string;
    joinedAt: number;
  }> = [];

  private matchmakingTimer: ReturnType<typeof setInterval> | null = null;

  quickMatch(ws: WebSocket, playerId: string, walletAddress?: string): void {
    // Prevent duplicate queue entries
    if (this.matchmakingQueue.some((q) => q.ws === ws)) return;

    this.matchmakingQueue.push({ ws, playerId, walletAddress, joinedAt: Date.now() });

    try {
      ws.send(JSON.stringify({ type: 'MATCHMAKING_START' }));
    } catch { /* ignore */ }

    this.tryMatchmake();

    if (!this.matchmakingTimer) {
      this.matchmakingTimer = setInterval(() => this.checkMatchmakingTimeouts(), 5000);
    }
  }

  cancelMatchmaking(ws: WebSocket): void {
    this.matchmakingQueue = this.matchmakingQueue.filter((q) => q.ws !== ws);
    try {
      ws.send(JSON.stringify({ type: 'MATCHMAKING_CANCEL' }));
    } catch { /* ignore */ }
  }

  private tryMatchmake(): void {
    while (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift()!;
      const player2 = this.matchmakingQueue.shift()!;

      const gameId = `qm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      this.createRoom(gameId);
      this.joinRoom(gameId, player1.playerId, player1.ws);
      this.joinRoom(gameId, player2.playerId, player2.ws);

      const found = JSON.stringify({ type: 'MATCHMAKING_FOUND', roomCode: gameId });
      try { player1.ws.send(found); } catch { /* ignore */ }
      try { player2.ws.send(found); } catch { /* ignore */ }
    }

    if (this.matchmakingQueue.length === 0 && this.matchmakingTimer) {
      clearInterval(this.matchmakingTimer);
      this.matchmakingTimer = null;
    }
  }

  private checkMatchmakingTimeouts(): void {
    const now = Date.now();
    const timedOut = this.matchmakingQueue.filter((q) => now - q.joinedAt > 60_000);

    for (const player of timedOut) {
      this.matchmakingQueue = this.matchmakingQueue.filter((q) => q.ws !== player.ws);
      try {
        player.ws.send(JSON.stringify({ type: 'WAITING_TIMEOUT' }));
      } catch { /* ignore */ }
    }
  }
}

// Singleton instance
export const roomManager = new RoomManager();

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { roomManager } from './room-manager';
import {
  ClientMessage,
  isClientMessage,
  isJoinRoomMessage,
  isPaddleMoveMessage,
  isPlayerReadyMessage,
  isPingMessage,
  isPauseRequestMessage,
  isResumeRequestMessage,
  isQuitGameMessage,
  isRematchRequestMessage,
  isRematchResponseMessage,
  isPlayerExitMessage
} from './message-types';
import { GameServer } from '../services/game-server';
import { RATE_LIMIT } from '../types';

export function setupWebSocketServer(httpServer: HttpServer, gameServer: GameServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectionTimeouts: Map<WebSocket, NodeJS.Timeout> = new Map();
  const messageRates: Map<WebSocket, { count: number; windowStart: number }> = new Map();

  const clearConnectionTimeout = (ws: WebSocket) => {
    const timeout = connectionTimeouts.get(ws);
    if (timeout) {
      clearTimeout(timeout);
      connectionTimeouts.delete(ws);
    }
  };

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] New connection');

    // Set a timeout - client must join a room within 30 seconds
    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Connection timeout - no room joined');
        try {
          ws.send(JSON.stringify({
            type: 'error',
            code: 'CONNECTION_TIMEOUT',
            message: 'Must join a room within 30 seconds'
          }));
        } catch (error) {
          console.error('[WebSocket] Failed to send timeout error:', error);
        }
        ws.close(4000, 'Connection timeout');
      }
      connectionTimeouts.delete(ws);
    }, 30000);
    connectionTimeouts.set(ws, timeout);

    ws.on('message', (data: Buffer) => {
      // Rate limit check
      const now = Date.now();
      let rateInfo = messageRates.get(ws);
      if (!rateInfo || now - rateInfo.windowStart > 1000) {
        rateInfo = { count: 0, windowStart: now };
        messageRates.set(ws, rateInfo);
      }
      rateInfo.count++;
      if (rateInfo.count > RATE_LIMIT.maxMessagesPerSecond) {
        try {
          ws.send(JSON.stringify({
            type: 'error',
            code: 'RATE_LIMITED',
            message: 'Too many messages'
          }));
        } catch {}
        return;
      }

      try {
        const parsed = JSON.parse(data.toString());

        // Validate it's a known client message before routing
        if (!isClientMessage(parsed)) {
          console.warn('[WebSocket] Unknown message type:', parsed?.type);
          try {
            ws.send(JSON.stringify({
              type: 'error',
              code: 'INVALID_MESSAGE',
              message: `Unknown message type: ${parsed?.type || 'undefined'}`
            }));
          } catch (error) {
            console.error('[WebSocket] Failed to send invalid message error:', error);
          }
          return;
        }

        // Clear timeout on join-room (they're engaging with the server)
        if (isJoinRoomMessage(parsed)) {
          clearConnectionTimeout(ws);
        }

        handleMessage(ws, parsed, gameServer);
      } catch (error) {
        console.error('[WebSocket] Invalid message:', error);
        try {
          ws.send(JSON.stringify({
            type: 'error',
            code: 'INVALID_MESSAGE',
            message: 'Invalid message format'
          }));
        } catch (sendError) {
          console.error('[WebSocket] Failed to send parse error:', sendError);
        }
      }
    });

    ws.on('close', () => {
      clearConnectionTimeout(ws);
      messageRates.delete(ws);
      handleDisconnect(ws, gameServer);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      clearConnectionTimeout(ws);
    });
  });

  return wss;
}

function handleMessage(ws: WebSocket, message: ClientMessage, gameServer: GameServer): void {
  if (isJoinRoomMessage(message)) {
    console.log(`[WebSocket] Join room request: gameId=${message.gameId}, playerId=${message.playerId}`);
    gameServer.handleJoinRoom(ws, message.gameId, message.playerId);
  } else if (isPaddleMoveMessage(message)) {
    gameServer.handlePaddleMove(ws, message.x, message.y);
  } else if (isPlayerReadyMessage(message)) {
    gameServer.handlePlayerReady(ws, message.gameId);
  } else if (isPingMessage(message)) {
    // Respond to heartbeat ping with pong
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (error) {
      console.error('[WebSocket] Failed to send pong:', error);
    }
  } else if (isPauseRequestMessage(message)) {
    console.log('[WebSocket] Pause request received');
    gameServer.handlePauseRequest(ws);
  } else if (isResumeRequestMessage(message)) {
    console.log('[WebSocket] Resume request received');
    gameServer.handleResumeRequest(ws);
  } else if (isQuitGameMessage(message)) {
    console.log('[WebSocket] Quit game request received');
    gameServer.handleQuitGame(ws);
  } else if (isRematchRequestMessage(message)) {
    console.log('[WebSocket] Rematch request received');
    gameServer.handleRematchRequest(ws);
  } else if (isRematchResponseMessage(message)) {
    console.log('[WebSocket] Rematch response received:', message.accepted);
    gameServer.handleRematchResponse(ws, message.accepted);
  } else if (isPlayerExitMessage(message)) {
    console.log('[WebSocket] Player exit received');
    gameServer.handlePlayerExit(ws);
  } else if ((message as Record<string, unknown>).type === 'matchmaking-start') {
    const msg = message as Record<string, unknown>;
    console.log('[WebSocket] Quick match request received');
    roomManager.quickMatch(ws, (msg.playerId as string) ?? `anon-${Date.now()}`, msg.walletAddress as string | undefined);
  } else if ((message as Record<string, unknown>).type === 'matchmaking-cancel') {
    console.log('[WebSocket] Cancel matchmaking received');
    roomManager.cancelMatchmaking(ws);
  }
}

function handleDisconnect(ws: WebSocket, gameServer: GameServer): void {
  const roomInfo = roomManager.getRoomByWebSocket(ws);
  if (roomInfo) {
    console.log(`[WebSocket] Player disconnected: gameId=${roomInfo.gameId}, playerId=${roomInfo.playerId}`);
    // Pass the WebSocket to verify it's still the current one (not stale from reconnection)
    gameServer.handleDisconnect(roomInfo.gameId, roomInfo.playerId, ws);
  } else {
    console.log('[WebSocket] Disconnect from untracked connection (no room joined)');
  }
}

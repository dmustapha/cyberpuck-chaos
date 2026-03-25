// Load environment variables FIRST, before any other imports that depend on them
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket/server';
import { gameServer } from './services/game-server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// In-memory game store (will be replaced by Base contract in Phase 3)
interface Game {
  id: string;
  creator: string;
  opponent: string | null;
  stake: string;
  roomCode: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner: string | null;
  player1Score: number;
  player2Score: number;
  createdAt: string;
}

const games = new Map<string, Game>();
let nextGameId = 1;

// Initialize Express
const app = express()

// Middleware
app.use(express.json());
app.use(helmet({ frameguard: false, contentSecurityPolicy: false }));

// CORS configuration - allow Vercel frontend and localhost
const allowedOrigins = [
  'https://cyberairhockey.vercel.app',
  'https://cyber-air-hockey.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow if origin is in allowed list or matches vercel pattern
      if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS blocked'));
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', apiLimiter);

// ============================================
// Health Check
// ============================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// Game Operations
// ============================================

// Create a new game
app.post('/api/games', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stake, roomCode } = req.body;

    if (stake === undefined || !roomCode) {
      res.status(400).json({ error: 'Missing required fields: stake, roomCode' });
      return;
    }

    // Input validation
    if (typeof roomCode !== 'string' || !/^[a-zA-Z0-9-]{4,20}$/.test(roomCode)) {
      res.status(400).json({ error: 'Invalid roomCode: must be 4-20 alphanumeric characters or hyphens' });
      return;
    }

    const stakeNum = Number(stake);
    if (isNaN(stakeNum) || stakeNum < 0) {
      res.status(400).json({ error: 'Invalid stake: must be a non-negative number' });
      return;
    }

    const creator = req.body.creator || 'anonymous';
    if (typeof creator !== 'string' || creator.length > 100) {
      res.status(400).json({ error: 'Invalid creator: must be a string of 100 characters or fewer' });
      return;
    }

    const id = String(nextGameId++);
    const game: Game = {
      id,
      creator,
      opponent: null,
      stake: String(stake),
      roomCode,
      status: 'waiting',
      winner: null,
      player1Score: 0,
      player2Score: 0,
      createdAt: new Date().toISOString(),
    };

    games.set(id, game);
    res.status(201).json({ gameId: id });
  } catch (error) {
    next(error);
  }
});

// List open games
app.get('/api/games', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const openGames = Array.from(games.values()).filter(g => g.status === 'waiting');
    res.json(openGames);
  } catch (error) {
    next(error);
  }
});

// Get game by ID or room code
app.get('/api/games/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrCode = req.params.id;

    // Try by ID first
    let game = games.get(idOrCode);

    // Fall back to room code lookup
    if (!game) {
      game = Array.from(games.values()).find(g => g.roomCode === idOrCode);
    }

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
});

// Join a game (accepts gameId or roomCode)
app.post('/api/games/:id/join', (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrCode = req.params.id;

    let game = games.get(idOrCode);
    if (!game) {
      game = Array.from(games.values()).find(g => g.roomCode === idOrCode);
    }

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    if (game.status !== 'waiting') {
      res.status(400).json({ error: 'Game is not available to join' });
      return;
    }

    game.opponent = req.body.opponent || 'anonymous';
    game.status = 'active';

    res.json({ success: true, gameId: game.id, game });
  } catch (error) {
    next(error);
  }
});

// Submit game result
app.post('/api/games/:id/result', (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;
    const { player1Score, player2Score } = req.body;

    if (typeof player1Score !== 'number' || typeof player2Score !== 'number') {
      res.status(400).json({ error: 'Missing required fields: player1Score, player2Score' });
      return;
    }

    // Score range validation
    if (player1Score < 0 || player1Score > 10 || player2Score < 0 || player2Score > 10) {
      res.status(400).json({ error: 'Invalid scores: must be between 0 and 10' });
      return;
    }

    const game = games.get(gameId);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    game.player1Score = player1Score;
    game.player2Score = player2Score;
    game.winner = player1Score > player2Score ? game.creator : game.opponent;
    game.status = 'completed';

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Cancel a game
app.post('/api/games/:id/cancel', (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    const game = games.get(gameId);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    game.status = 'cancelled';

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Clean up stale games every hour
setInterval(() => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  for (const [id, game] of games) {
    if (now - new Date(game.createdAt).getTime() > ONE_DAY) {
      games.delete(id);
    }
  }
}, 60 * 60 * 1000);

// ============================================
// Error Handling Middleware
// ============================================

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Server] Error: ${err.message}`);
  console.error(err.stack);

  // Manually set CORS headers for error responses
  // This is critical because if an error occurs mid-request,
  // the cors middleware may not have set these headers yet
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// ============================================
// Server Startup
// ============================================

async function startServer(): Promise<void> {
  // Create HTTP server from Express app
  const httpServer = createServer(app);

  // Setup WebSocket server on /ws path
  const wss = setupWebSocketServer(httpServer, gameServer);
  console.log('[Server] WebSocket server ready on /ws');

  httpServer.listen(PORT, () => {
    console.log(`[Server] Air Hockey API listening on port ${PORT}`);
  });
}

// ============================================
// Graceful Shutdown
// ============================================

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Global error handlers to prevent crashes from unhandled async errors
// These are critical for stability on Railway where crashes = 502 errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Promise Rejection:', reason);
  // Don't exit - log and continue. The server should stay up.
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  // For uncaught exceptions, we log but don't immediately exit
  // This allows in-flight requests to complete
  // The process will be restarted by Railway if it becomes unhealthy
});

// Start the server
startServer();

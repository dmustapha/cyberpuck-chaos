/**
 * Game Store - Core game state management with combo system and match tracking
 */

import { create } from 'zustand';
import { GameMode, Difficulty, GameStatus, Player, Scores } from '@/types/game';
import { MatchType } from '@/types/match';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import { generateId } from '@/lib/cyber/utils';

interface ComboState {
  current: number;
  max: number;
  lastGoalTime: number;
  comboWindow: number; // ms to maintain combo
}

export interface MatchMetadata {
  id: string;
  startTime: number;
  type: MatchType;
  maxDeficit: number; // Largest point deficit during match
  comebackWin: boolean;
}

// Simplified game mode type
export type GameModeType = 'ai' | 'multiplayer';

// Game page state machine
export type GamePageState =
  | 'mode-selection'     // Choose AI or Multiplayer
  | 'ai-setup'           // Choose difficulty for AI
  | 'multiplayer-lobby'  // Create or Join game
  | 'waiting'            // Creator waiting for opponent
  | 'joining'            // Joiner connecting to game
  | 'ready'              // Both connected, ready up
  | 'countdown'          // 3-2-1 countdown
  | 'playing'            // Game in progress
  | 'paused'             // Game paused
  | 'goal'               // Goal scored pause
  | 'gameover';          // Game finished

// Multiplayer game info (blockchain-based)
export interface MultiplayerGameInfo {
  gameId: string;              // Blockchain game ID (numeric like "6")
  roomCode: string;            // Display code for sharing (e.g., "A3B7-K9M2")
  creatorWallet: string;       // Creator's wallet address
  opponentWallet: string | null; // Opponent's wallet (null until joined)
  createdAt: number;           // Unix timestamp
  isCreator: boolean;          // True if current user created this game
  playerId: string;            // Stable playerId for WebSocket connections
}

interface GameStore {
  // State
  status: GameStatus;
  mode: GameMode;
  difficulty: Difficulty;
  scores: Scores;
  maxScore: number;
  lastScorer: Player | null;
  winner: Player | null;
  countdown: number;

  // Combo system
  combo: ComboState;

  // Match tracking
  matchMetadata: MatchMetadata | null;

  // Game page state
  pageState: GamePageState;

  // Multiplayer state
  playerNumber: 1 | 2 | null;
  isHost: boolean;
  roomId: string | null;
  opponentConnected: boolean;
  opponentReady: boolean;
  isReady: boolean;

  // Extended mode
  gameModeType: GameModeType;
  multiplayerGameInfo: MultiplayerGameInfo | null;

  // Actions
  setStatus: (status: GameStatus) => void;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setMaxScore: (score: number) => void;
  setCountdown: (count: number) => void;

  // Page state actions
  setPageState: (state: GamePageState) => void;
  goToModeSelection: () => void;
  goToAISetup: () => void;
  goToMultiplayerLobby: () => void;

  // Multiplayer actions
  setPlayerNumber: (num: 1 | 2) => void;
  setRoomId: (id: string | null) => void;
  setOpponentConnected: (connected: boolean) => void;
  setOpponentReady: (ready: boolean) => void;
  setIsReady: (ready: boolean) => void;
  setMultiplayerScores: (scores: Scores) => void;
  setMultiplayerGameOver: (winner: 1 | 2, finalScore: Scores) => void;
  resetMultiplayer: () => void;

  // Mode actions
  setGameModeType: (modeType: GameModeType) => void;
  setMultiplayerGameInfo: (info: MultiplayerGameInfo | null) => void;

  // Create game flow
  createMultiplayerGame: (gameId: string, roomCode: string, creatorWallet: string, playerId: string) => void;

  // Join game flow
  joinMultiplayerGame: (gameId: string, roomCode: string, creatorWallet: string, opponentWallet: string, playerId: string) => void;

  // Start multiplayer game (both ready)
  startMultiplayerMatch: () => void;

  // Game lifecycle
  startGame: (matchType?: MatchType) => void;
  startMultiplayerGame: (playerNum: 1 | 2, roomId: string) => void;
  scoreGoal: (scorer: Player) => void;
  resumeAfterGoal: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;

  // Match data accessors
  getMatchDuration: () => number;
  getMatchResult: () => {
    metadata: MatchMetadata | null;
    scores: Scores;
    winner: Player | null;
    maxCombo: number;
    duration: number;
    isPerfectGame: boolean;
    isComebackWin: boolean;
  };

  // Internal
  _clearMatch: () => void;
}

const COMBO_WINDOW = 5000; // 5 seconds to maintain combo

const initialCombo: ComboState = {
  current: 0,
  max: 0,
  lastGoalTime: 0,
  comboWindow: COMBO_WINDOW,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  status: 'menu',
  mode: 'ai',
  difficulty: 'medium',
  scores: { player1: 0, player2: 0 },
  maxScore: PHYSICS_CONFIG.game.maxScore,
  lastScorer: null,
  winner: null,
  countdown: 0,
  combo: { ...initialCombo },
  matchMetadata: null,

  // Game page state
  pageState: 'mode-selection',

  // Multiplayer initial state
  playerNumber: null,
  isHost: false,
  roomId: null,
  opponentConnected: false,
  opponentReady: false,
  isReady: false,

  // Extended mode initial state
  gameModeType: 'ai',
  multiplayerGameInfo: null,

  // Basic setters
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMaxScore: (score) => set({ maxScore: score }),

  setCountdown: (count) => {
    if (count <= 0) {
      set({ countdown: 0, status: 'playing', pageState: 'playing' });
    } else {
      set({ countdown: count });
    }
  },

  // Page state actions
  setPageState: (state) => set({ pageState: state }),

  goToModeSelection: () => set({
    pageState: 'mode-selection',
    gameModeType: 'ai',
    multiplayerGameInfo: null,
  }),

  goToAISetup: () => set({
    pageState: 'ai-setup',
    gameModeType: 'ai',
    mode: 'ai',
  }),

  goToMultiplayerLobby: () => set({
    pageState: 'multiplayer-lobby',
    gameModeType: 'multiplayer',
    mode: 'multiplayer',
  }),

  // Multiplayer setters
  setPlayerNumber: (num) => set({ playerNumber: num, isHost: num === 1 }),
  setRoomId: (id) => set({ roomId: id }),
  setOpponentConnected: (connected) => set({ opponentConnected: connected }),
  setOpponentReady: (ready) => set({ opponentReady: ready }),
  setIsReady: (ready) => set({ isReady: ready }),
  setMultiplayerScores: (scores) => set({ scores }),

  setMultiplayerGameOver: (winnerNum, finalScore) => {
    // Convert 1|2 to 'player1'|'player2'
    const winnerPlayer: Player = winnerNum === 1 ? 'player1' : 'player2';
    set({
      scores: finalScore,
      winner: winnerPlayer,
      status: 'gameover',
      pageState: 'gameover',
    });
  },

  resetMultiplayer: () =>
    set({
      playerNumber: null,
      isHost: false,
      roomId: null,
      opponentConnected: false,
      opponentReady: false,
      isReady: false,
      mode: 'ai',
      gameModeType: 'ai',
      multiplayerGameInfo: null,
      pageState: 'mode-selection',
    }),

  // Mode setters
  setGameModeType: (modeType) => set({ gameModeType: modeType }),
  setMultiplayerGameInfo: (info) => set({ multiplayerGameInfo: info }),

  // Create multiplayer game (called after blockchain TX succeeds)
  createMultiplayerGame: (gameId, roomCode, creatorWallet, playerId) => {
    set({
      pageState: 'waiting',
      gameModeType: 'multiplayer',
      mode: 'multiplayer',
      playerNumber: 1,
      isHost: true,
      roomId: gameId,
      multiplayerGameInfo: {
        gameId,
        roomCode,
        creatorWallet,
        opponentWallet: null,
        createdAt: Date.now(),
        isCreator: true,
        playerId, // Store playerId for consistent WebSocket connections
      },
    });
  },

  // Join multiplayer game (called after blockchain TX succeeds)
  joinMultiplayerGame: (gameId, roomCode, creatorWallet, opponentWallet, playerId) => {
    set({
      pageState: 'ready',
      gameModeType: 'multiplayer',
      mode: 'multiplayer',
      playerNumber: 2,
      isHost: false,
      roomId: gameId,
      opponentConnected: true,
      multiplayerGameInfo: {
        gameId,
        roomCode,
        creatorWallet,
        opponentWallet,
        createdAt: Date.now(),
        isCreator: false,
        playerId, // Store playerId for consistent WebSocket connections
      },
    });
  },

  // Start multiplayer match (both players ready)
  // NOTE: In multiplayer, the server is authoritative. When this is called,
  // the server has already transitioned to 'playing' state. We set pageState
  // to 'playing' directly to show the game canvas. The useMultiplayerGameEngine
  // hook will receive state-update messages and sync the game state from server.
  startMultiplayerMatch: () => {
    const { multiplayerGameInfo } = get();
    set({
      status: 'playing',
      pageState: 'playing',
      mode: 'multiplayer', // Explicitly set to ensure multiplayer mode is active
      gameModeType: 'multiplayer',
      scores: { player1: 0, player2: 0 },
      lastScorer: null,
      winner: null,
      countdown: 0, // Server already finished countdown
      combo: { ...initialCombo },
      matchMetadata: {
        id: multiplayerGameInfo?.gameId || generateId(),
        startTime: Date.now(),
        type: 'ranked',
        maxDeficit: 0,
        comebackWin: false,
      },
    });
  },

  // Start a new game (single player / AI)
  startGame: (matchType = 'ranked') => {
    set({
      status: 'countdown',
      pageState: 'countdown',
      mode: 'ai',
      scores: { player1: 0, player2: 0 },
      lastScorer: null,
      winner: null,
      countdown: PHYSICS_CONFIG.game.countdownSeconds,
      combo: { ...initialCombo },
      matchMetadata: {
        id: generateId(),
        startTime: Date.now(),
        type: matchType,
        maxDeficit: 0,
        comebackWin: false,
      },
    });
  },

  // Start a multiplayer game (legacy - for WebSocket ready)
  startMultiplayerGame: (playerNum, roomId) => {
    set({
      status: 'countdown',
      pageState: 'countdown',
      mode: 'multiplayer',
      scores: { player1: 0, player2: 0 },
      lastScorer: null,
      winner: null,
      countdown: PHYSICS_CONFIG.game.countdownSeconds,
      combo: { ...initialCombo },
      playerNumber: playerNum,
      isHost: playerNum === 1,
      roomId,
      opponentConnected: true,
      matchMetadata: {
        id: generateId(),
        startTime: Date.now(),
        type: 'ranked',
        maxDeficit: 0,
        comebackWin: false,
      },
    });
  },

  // Handle a goal being scored
  scoreGoal: (scorer: Player) => {
    const { scores, maxScore, matchMetadata, combo } = get();
    const now = Date.now();

    const newScores = {
      ...scores,
      [scorer]: scores[scorer] + 1,
    };

    // Track max deficit for comeback detection
    let maxDeficit = matchMetadata?.maxDeficit || 0;
    if (scorer === 'player1') {
      const deficit = scores.player2 - scores.player1;
      if (deficit > maxDeficit) {
        maxDeficit = deficit;
      }
    }

    // Update combo for player goals
    let newCombo = { ...combo };
    if (scorer === 'player1') {
      const timeSinceLastGoal = now - combo.lastGoalTime;
      if (timeSinceLastGoal < combo.comboWindow && combo.lastGoalTime > 0) {
        newCombo = {
          ...newCombo,
          current: combo.current + 1,
          max: Math.max(combo.max, combo.current + 1),
          lastGoalTime: now,
        };
      } else {
        newCombo = {
          ...newCombo,
          current: 1,
          max: Math.max(combo.max, 1),
          lastGoalTime: now,
        };
      }
    } else {
      // Opponent scored, reset combo
      newCombo = { ...newCombo, current: 0, lastGoalTime: 0 };
    }

    // Check for winner
    if (newScores[scorer] >= maxScore) {
      const isWin = scorer === 'player1';
      const comebackWin = isWin && maxDeficit >= 3;

      set({
        scores: newScores,
        lastScorer: scorer,
        winner: scorer,
        status: 'gameover',
        pageState: 'gameover',
        combo: newCombo,
        matchMetadata: matchMetadata
          ? { ...matchMetadata, maxDeficit, comebackWin }
          : null,
      });
    } else {
      // Go to goal status (brief pause)
      set({
        scores: newScores,
        lastScorer: scorer,
        status: 'goal',
        pageState: 'goal',
        combo: newCombo,
        matchMetadata: matchMetadata ? { ...matchMetadata, maxDeficit } : null,
      });
    }
  },

  // Resume playing after goal celebration
  resumeAfterGoal: () => {
    const { status } = get();
    if (status === 'goal') {
      set({ status: 'playing', pageState: 'playing' });
    }
  },

  pauseGame: () => {
    const { status } = get();
    if (status === 'playing') {
      set({ status: 'paused', pageState: 'paused' });
    }
  },

  resumeGame: () => {
    const { status } = get();
    if (status === 'paused') {
      set({ status: 'playing', pageState: 'playing' });
    }
  },

  resetGame: () => {
    set({
      status: 'menu',
      mode: 'ai',
      scores: { player1: 0, player2: 0 },
      lastScorer: null,
      winner: null,
      countdown: 0,
      combo: { ...initialCombo },
      matchMetadata: null,
      pageState: 'mode-selection',
      // Reset multiplayer state
      playerNumber: null,
      isHost: false,
      roomId: null,
      opponentConnected: false,
      opponentReady: false,
      isReady: false,
      // Reset extended mode state
      gameModeType: 'ai',
      multiplayerGameInfo: null,
    });
  },

  // Get match duration in seconds
  getMatchDuration: () => {
    const { matchMetadata } = get();
    if (!matchMetadata) return 0;
    return Math.floor((Date.now() - matchMetadata.startTime) / 1000);
  },

  // Get complete match result data
  getMatchResult: () => {
    const { matchMetadata, scores, winner, combo } = get();
    const duration = get().getMatchDuration();
    const isPerfectGame = winner === 'player1' && scores.player2 === 0;
    const isComebackWin = matchMetadata?.comebackWin || false;

    return {
      metadata: matchMetadata,
      scores,
      winner,
      maxCombo: combo.max,
      duration,
      isPerfectGame,
      isComebackWin,
    };
  },

  // Internal: Clear match data after processing
  _clearMatch: () => {
    set({ matchMetadata: null });
  },
}));

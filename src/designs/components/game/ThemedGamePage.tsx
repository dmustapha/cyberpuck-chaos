'use client';

import { useState } from 'react';
import { ThemedModeSelector } from './ThemedModeSelector';
import { ThemedDifficultySelector } from './ThemedDifficultySelector';
import { ThemedCountdown } from './ThemedCountdown';
import { ThemedPauseMenu } from './ThemedPauseMenu';
import { ThemedGameOver } from './ThemedGameOver';

type GameState = 'mode-select' | 'difficulty-select' | 'countdown' | 'playing' | 'paused' | 'game-over';
type GameMode = 'ai' | 'multiplayer';
type Difficulty = 'easy' | 'medium' | 'hard';

export function ThemedGamePage() {
  const [gameState, setGameState] = useState<GameState>('mode-select');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'ai') {
      setGameState('difficulty-select');
    } else {
      startCountdown();
    }
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    startCountdown();
  };

  const startCountdown = () => {
    setGameState('countdown');
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    }
  };

  const handleResume = () => {
    if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const handleRestart = () => {
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
    startCountdown();
  };

  const handleQuit = () => {
    setGameState('mode-select');
    setGameMode(null);
    setDifficulty(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setWinner(null);
  };

  const handleGameOver = (winner: 'player' | 'opponent', playerScore: number, opponentScore: number) => {
    setWinner(winner);
    setPlayerScore(playerScore);
    setOpponentScore(opponentScore);
    setGameState('game-over');
  };

  // Render based on game state
  switch (gameState) {
    case 'mode-select':
      return <ThemedModeSelector onSelect={handleModeSelect} />;

    case 'difficulty-select':
      return (
        <ThemedDifficultySelector
          onSelect={handleDifficultySelect}
          onBack={() => setGameState('mode-select')}
        />
      );

    case 'countdown':
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <ThemedCountdown count={countdown} />
        </div>
      );

    case 'playing':
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          {/* Game Canvas would go here */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: '#fff',
            }}
          >
            Game Canvas Placeholder - Press ESC to Pause
            <br />
            <button onClick={handlePause} style={{ margin: '20px', padding: '10px 20px' }}>
              Pause
            </button>
            <button
              onClick={() => handleGameOver('player', 7, 5)}
              style={{ margin: '20px', padding: '10px 20px' }}
            >
              Simulate Win
            </button>
            <button
              onClick={() => handleGameOver('opponent', 3, 7)}
              style={{ margin: '20px', padding: '10px 20px' }}
            >
              Simulate Loss
            </button>
          </div>
        </div>
      );

    case 'paused':
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <ThemedPauseMenu onResume={handleResume} onRestart={handleRestart} onQuit={handleQuit} />
        </div>
      );

    case 'game-over':
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <ThemedGameOver
            winner={winner!}
            playerScore={playerScore}
            opponentScore={opponentScore}
            xpGained={winner === 'player' ? 250 : 50}
            levelUp={winner === 'player'}
            newLevel={25}
            onPlayAgain={handleRestart}
            onQuit={handleQuit}
          />
        </div>
      );

    default:
      return null;
  }
}

'use client';

import { useGameStore } from '@/stores/gameStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function GameOverModal() {
  const router = useRouter();
  const status = useGameStore((state) => state.status);
  const winner = useGameStore((state) => state.winner);
  const scores = useGameStore((state) => state.scores);
  const mode = useGameStore((state) => state.mode);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);

  const txExplorerUrl = useGameStore((state) => state.txExplorerUrl);

  const isOpen = status === 'gameover';
  const playerWon = winner === 'player1';

  const handlePlayAgain = () => {
    startGame();
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/');
  };


  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        {/* Winner announcement */}
        <div
          className={`text-3xl sm:text-4xl font-bold mb-4 ${
            playerWon ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {playerWon ? 'You Win!' : mode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!'}
        </div>

        {/* Final score */}
        <div className="text-gray-400 mb-6 sm:mb-8">
          Final Score:{' '}
          <span className="text-green-400 text-xl sm:text-2xl font-bold">{scores.player1}</span>
          {' - '}
          <span className="text-red-400 text-xl sm:text-2xl font-bold">{scores.player2}</span>
        </div>

        {/* On-chain recording link */}
        {txExplorerUrl && (
          <a
            href={txExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            Recorded on-chain →
          </a>
        )}

        {/* Trophy or defeat icon */}
        <div className="text-5xl sm:text-6xl mb-6 sm:mb-8">{playerWon ? '🏆' : '😢'}</div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={handlePlayAgain} variant="primary" size="lg">
            Play Again
          </Button>
          <Button onClick={handleMainMenu} variant="secondary" size="md">
            Main Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
}

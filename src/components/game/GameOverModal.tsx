'use client';

import { useGameStore } from '@/stores/gameStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';

export function GameOverModal() {
  const router = useRouter();
  const status = useGameStore((state) => state.status);
  const winner = useGameStore((state) => state.winner);
  const scores = useGameStore((state) => state.scores);
  const mode = useGameStore((state) => state.mode);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);

  const txExplorerUrl = useGameStore((state) => state.txExplorerUrl);
  const txPending = useGameStore((state) => state.txPending);

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
        {/* Winner icon */}
        <div className="flex justify-center mb-6">
          {playerWon ? (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${cyberTheme.colors.player.you}20`,
                border: `3px solid ${cyberTheme.colors.player.you}`,
                boxShadow: `0 0 30px ${cyberTheme.colors.player.youGlow}`,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={cyberTheme.colors.player.you} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 22V14.6a7 7 0 0 1-3.3-5.3L6 4h12l-.7 5.3A7 7 0 0 1 14 14.6V22" />
              </svg>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${cyberTheme.colors.player.opponent}20`,
                border: `3px solid ${cyberTheme.colors.player.opponent}`,
                boxShadow: `0 0 30px ${cyberTheme.colors.player.opponentGlow}`,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={cyberTheme.colors.player.opponent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
          )}
        </div>

        {/* Winner announcement */}
        <div
          className="text-3xl sm:text-4xl font-bold mb-4 uppercase tracking-wider"
          style={{
            color: playerWon ? cyberTheme.colors.player.you : cyberTheme.colors.player.opponent,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 20px ${playerWon ? cyberTheme.colors.player.youGlow : cyberTheme.colors.player.opponentGlow}`,
          }}
        >
          {playerWon ? 'You Win!' : mode === 'ai' ? 'AI Wins!' : 'Player 2 Wins!'}
        </div>

        {/* Final score */}
        <div className="mb-6 sm:mb-8" style={{ color: cyberTheme.colors.text.secondary }}>
          Final Score:{' '}
          <span
            className="text-xl sm:text-2xl font-bold"
            style={{ color: cyberTheme.colors.player.you, fontFamily: cyberTheme.fonts.heading }}
          >
            {scores.player1}
          </span>
          {' - '}
          <span
            className="text-xl sm:text-2xl font-bold"
            style={{ color: cyberTheme.colors.player.opponent, fontFamily: cyberTheme.fonts.heading }}
          >
            {scores.player2}
          </span>
        </div>

        {/* On-chain recording status */}
        {txPending && !txExplorerUrl && (
          <div
            className="text-sm animate-pulse mb-4"
            style={{ color: cyberTheme.colors.primary }}
          >
            Recording on-chain...
          </div>
        )}
        {txExplorerUrl && (
          <a
            href={txExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline mb-4 inline-block"
            style={{ color: cyberTheme.colors.primary }}
          >
            Recorded on-chain
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline ml-1">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        )}

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

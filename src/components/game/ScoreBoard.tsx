'use client';

import { useGameStore } from '@/stores/gameStore';

export function ScoreBoard() {
  const scores = useGameStore((state) => state.scores);
  const mode = useGameStore((state) => state.mode);

  return (
    <div className="flex items-center justify-center gap-8 mb-4 bg-gray-900/80 px-8 py-4 rounded-xl">
      {/* Player 2 / AI Score */}
      <div className="text-center">
        <div className="text-sm text-red-400 font-medium mb-1">
          {mode === 'ai' ? 'AI' : 'Player 2'}
        </div>
        <div className="text-5xl font-bold text-red-500 tabular-nums">
          {scores.player2}
        </div>
      </div>

      {/* Divider */}
      <div className="text-3xl text-gray-500 font-light">-</div>

      {/* Player 1 Score */}
      <div className="text-center">
        <div className="text-sm text-green-400 font-medium mb-1">You</div>
        <div className="text-5xl font-bold text-green-500 tabular-nums">
          {scores.player1}
        </div>
      </div>
    </div>
  );
}

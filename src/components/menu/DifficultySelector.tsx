'use client';

import { useGameStore } from '@/stores/gameStore';
import { Difficulty } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface DifficultySelectorProps {
  onConfirm: () => void;
  onBack: () => void;
}

const difficulties: { value: Difficulty; label: string; description: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Slower reactions, less accurate predictions',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced gameplay for casual players',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Fast reactions, highly accurate predictions',
  },
];

export function DifficultySelector({ onConfirm, onBack }: DifficultySelectorProps) {
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-4xl font-bold text-white mb-8">Select Difficulty</h2>

      <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => setDifficulty(diff.value)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              difficulty === diff.value
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-lg font-bold ${
                    difficulty === diff.value ? 'text-blue-400' : 'text-white'
                  }`}
                >
                  {diff.label}
                </div>
                <div className="text-sm text-gray-400">{diff.description}</div>
              </div>
              {difficulty === diff.value && (
                <div className="text-blue-400 text-xl">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button onClick={onConfirm} variant="primary" size="lg">
          Start Game
        </Button>
        <Button onClick={onBack} variant="secondary" size="md">
          Back
        </Button>
      </div>
    </div>
  );
}

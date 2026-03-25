'use client';

import { GameMode } from '@/types/game';
import { Button } from '@/components/ui/Button';

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}

export function ModeSelector({ onSelect, onBack }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-4xl font-bold text-white mb-8">Select Mode</h2>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* VS AI */}
        <button
          onClick={() => onSelect('ai')}
          className="p-6 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
              🤖
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                VS Computer
              </div>
              <div className="text-sm text-gray-400">
                Challenge the AI opponent
              </div>
            </div>
          </div>
        </button>

        {/* Multiplayer (local) */}
        <button
          onClick={() => onSelect('multiplayer')}
          className="p-6 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-green-500 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
              👥
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                Local Multiplayer
              </div>
              <div className="text-sm text-gray-400">
                Play with a friend (same device)
              </div>
            </div>
          </div>
        </button>
      </div>

      <Button onClick={onBack} variant="secondary" size="md" className="mt-8">
        Back
      </Button>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { ModeSelector } from './ModeSelector';
import { DifficultySelector } from './DifficultySelector';
import { GameMode } from '@/types/game';

export function MainMenu() {
  const router = useRouter();
  const [step, setStep] = useState<'main' | 'mode' | 'difficulty'>('main');

  const setMode = useGameStore((state) => state.setMode);
  const startGame = useGameStore((state) => state.startGame);

  const handlePlayClick = () => {
    setStep('mode');
  };

  const handleModeSelect = (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === 'ai') {
      setStep('difficulty');
    } else {
      startGame();
      router.push('/game');
    }
  };

  const handleDifficultyConfirm = () => {
    startGame();
    router.push('/game');
  };

  const handleBack = () => {
    if (step === 'difficulty') {
      setStep('mode');
    } else if (step === 'mode') {
      setStep('main');
    }
  };

  if (step === 'mode') {
    return <ModeSelector onSelect={handleModeSelect} onBack={handleBack} />;
  }

  if (step === 'difficulty') {
    return (
      <DifficultySelector onConfirm={handleDifficultyConfirm} onBack={handleBack} />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-950">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Air Hockey
        </h1>
        <p className="text-gray-400 text-lg">Classic arcade game reimagined</p>
      </div>

      {/* Puck animation */}
      <div className="w-20 h-20 bg-white rounded-full mb-12 shadow-lg shadow-white/30 animate-bounce" />

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={handlePlayClick} variant="primary" size="lg">
          Play Game
        </Button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-gray-500 text-sm">
        Built with Next.js & Matter.js
      </div>
    </div>
  );
}

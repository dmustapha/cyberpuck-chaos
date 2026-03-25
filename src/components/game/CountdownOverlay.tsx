'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function CountdownOverlay() {
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const setCountdown = useGameStore((state) => state.setCountdown);

  useEffect(() => {
    if (status !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, setCountdown]);

  if (status !== 'countdown') return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-9xl font-bold text-white animate-pulse drop-shadow-2xl">
          {countdown > 0 ? countdown : 'GO!'}
        </div>
        <div className="text-2xl text-gray-300 mt-4">Get Ready!</div>
      </div>
    </div>
  );
}

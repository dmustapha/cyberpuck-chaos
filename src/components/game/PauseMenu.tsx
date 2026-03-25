'use client';

import { useGameStore } from '@/stores/gameStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function PauseMenu() {
  const router = useRouter();
  const status = useGameStore((state) => state.status);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);

  const isOpen = status === 'paused';

  const handleResume = () => {
    resumeGame();
  };

  const handleMainMenu = () => {
    resetGame();
    router.push('/');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResume}>
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-8">Game Paused</div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleResume} variant="primary" size="lg">
            Resume
          </Button>
          <Button onClick={handleMainMenu} variant="secondary" size="md">
            Main Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
}

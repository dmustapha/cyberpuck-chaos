import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export function useCursorPosition() {
  const [cursor, setCursor] = useState<CursorPosition>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle to requestAnimationFrame
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          setCursor(prev => ({
            x: e.clientX,
            y: e.clientY,
            prevX: lastX,
            prevY: lastY,
          }));
          lastX = e.clientX;
          lastY = e.clientY;
          animationFrameId = 0;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return cursor;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export function PaddleCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  const trailIdRef = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Smooth cursor follow with GSAP
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out'
        });
      }

      // Add trail point
      setTrails(prev => {
        const newTrails = [
          ...prev,
          { x: e.clientX, y: e.clientY, id: trailIdRef.current++ }
        ].slice(-10); // Keep last 10 points
        return newTrails;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <>
      {/* Trail points */}
      {trails.map((point, index) => (
        <div
          key={point.id}
          className="fixed pointer-events-none z-40"
          style={{
            left: point.x,
            top: point.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div
            className="rounded-full bg-cyan-400"
            style={{
              width: `${8 - index * 0.5}px`,
              height: `${8 - index * 0.5}px`,
              opacity: (10 - index) / 15,
              boxShadow: `0 0 ${12 - index}px rgba(34, 211, 238, ${0.6 - index * 0.05})`
            }}
          />
        </div>
      ))}

      {/* Main cursor paddle */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50"
        style={{
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 -m-4">
          <div className="w-12 h-12 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
        </div>

        {/* Paddle shape */}
        <div className="relative">
          {/* Main paddle circle */}
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-white via-cyan-200 to-cyan-400 border-2 border-white/80"
            style={{
              boxShadow: `
                0 0 15px rgba(34, 211, 238, 0.8),
                0 0 30px rgba(34, 211, 238, 0.5),
                inset 0 0 10px rgba(255, 255, 255, 0.5),
                inset 0 2px 5px rgba(255, 255, 255, 0.8)
              `
            }}
          >
            {/* Highlight */}
            <div className="absolute top-1 left-2 w-2 h-2 bg-white/90 rounded-full blur-[1px]" />

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-600/50" />
            </div>
          </div>

          {/* Energy rings */}
          <div className="absolute inset-0 -m-2">
            <div
              className="w-12 h-12 rounded-full border border-cyan-400/30 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

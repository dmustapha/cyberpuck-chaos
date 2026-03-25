'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import { GameBodies } from '@/lib/physics/engine';
import { useDesign } from './DesignContext';

interface ThemedGameCanvasProps {
  getBodies: () => GameBodies | null;
}

export interface ThemedGameCanvasRef {
  canvas: HTMLCanvasElement | null;
}

// Trail effect storage
interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export const ThemedGameCanvas = forwardRef<ThemedGameCanvasRef, ThemedGameCanvasProps>(
  function ThemedGameCanvas({ getBodies }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const trailRef = useRef<TrailPoint[]>([]);
    const { config } = useDesign();

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
    }));

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;
      const { colors, effects } = config;

      // Clear canvas
      ctx.fillStyle = colors.surface;
      ctx.fillRect(0, 0, table.width, table.height);

      // Scanlines effect (for retro/neon themes)
      if (effects.scanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < table.height; y += 3) {
          ctx.fillRect(0, y, table.width, 1);
        }
      }

      // Draw goal zones
      const goalWidth = table.goalWidth;
      const goalX = (table.width - goalWidth) / 2;

      // Top goal zone
      ctx.fillStyle = colors.goalZone2;
      ctx.fillRect(goalX, 0, goalWidth, 25);
      if (effects.glowIntensity > 0) {
        ctx.shadowColor = colors.player2Glow;
        ctx.shadowBlur = effects.glowIntensity / 2;
      }
      ctx.strokeStyle = colors.player2;
      ctx.lineWidth = effects.pixelated ? 4 : 2;
      ctx.strokeRect(goalX, 0, goalWidth, 25);
      ctx.shadowBlur = 0;

      // Bottom goal zone
      ctx.fillStyle = colors.goalZone1;
      ctx.fillRect(goalX, table.height - 25, goalWidth, 25);
      if (effects.glowIntensity > 0) {
        ctx.shadowColor = colors.player1Glow;
        ctx.shadowBlur = effects.glowIntensity / 2;
      }
      ctx.strokeStyle = colors.player1;
      ctx.strokeRect(goalX, table.height - 25, goalWidth, 25);
      ctx.shadowBlur = 0;

      // Draw center line
      ctx.strokeStyle = colors.border + '40';
      ctx.lineWidth = effects.pixelated ? 4 : 2;
      ctx.setLineDash(effects.pixelated ? [] : [10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, table.height / 2);
      ctx.lineTo(table.width, table.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw center circle
      ctx.beginPath();
      ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Draw border
      if (effects.glowIntensity > 0) {
        ctx.shadowColor = colors.border;
        ctx.shadowBlur = effects.glowIntensity / 2;
      }
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = effects.pixelated ? 6 : 3;
      ctx.strokeRect(2, 2, table.width - 4, table.height - 4);
      ctx.shadowBlur = 0;

      // Get physics bodies
      const bodies = getBodies();
      if (!bodies) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const { puck, paddle1, paddle2 } = bodies;

      // Trail effect
      if (effects.trailEffect) {
        const trail = trailRef.current;
        trail.unshift({ x: puck.position.x, y: puck.position.y, age: 0 });
        if (trail.length > 12) trail.pop();

        trail.forEach((point, i) => {
          point.age++;
          const alpha = 1 - (i / trail.length);
          const size = puckConfig.radius * (1 - i * 0.05);

          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = colors.puckGlow;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Draw puck
      if (effects.glowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = colors.puckGlow;
        ctx.shadowBlur = effects.glowIntensity;
      }
      ctx.fillStyle = colors.puck;
      ctx.beginPath();
      ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
      ctx.fill();
      if (effects.glowIntensity > 0) {
        ctx.restore();
      }

      // Draw paddle 2 (top - AI/opponent)
      if (effects.glowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = colors.player2Glow;
        ctx.shadowBlur = effects.glowIntensity;
      }
      ctx.fillStyle = colors.player2;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      ctx.fillStyle = colors.backgroundSecondary;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      if (effects.glowIntensity > 0) {
        ctx.restore();
      }

      // Draw paddle 1 (bottom - player)
      if (effects.glowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = colors.player1Glow;
        ctx.shadowBlur = effects.glowIntensity;
      }
      ctx.fillStyle = colors.player1;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      ctx.fillStyle = colors.backgroundSecondary;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      if (effects.glowIntensity > 0) {
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(draw);
    }, [getBodies, config]);

    useEffect(() => {
      animationRef.current = requestAnimationFrame(draw);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [draw]);

    // Theme-specific canvas styles
    const getCanvasStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
        maxWidth: '100%',
        height: 'auto',
        aspectRatio: `${PHYSICS_CONFIG.table.width} / ${PHYSICS_CONFIG.table.height}`,
      };

      const { effects, colors } = config;

      if (effects.pixelated) {
        base.imageRendering = 'pixelated';
      }

      if (effects.glowIntensity > 0) {
        base.boxShadow = `0 0 ${effects.glowIntensity}px ${colors.border}40`;
      }

      return base;
    };

    return (
      <canvas
        ref={canvasRef}
        width={PHYSICS_CONFIG.table.width}
        height={PHYSICS_CONFIG.table.height}
        className="cursor-none"
        style={getCanvasStyle()}
      />
    );
  }
);

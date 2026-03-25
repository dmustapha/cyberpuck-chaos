'use client';

import { useRef, useEffect, useState } from 'react';
import { usePhysics } from '@/hooks/usePhysics';
import gsap from 'gsap';

interface PhysicsCanvasProps {
  onPuckHit?: (count: number) => void;
  onChaosChange?: (level: number) => void;
  targetPosition?: { x: number; y: number; radius: number } | null;
}

export function PhysicsCanvas({ onPuckHit, onChaosChange, targetPosition }: PhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
  }>>([]);

  const { getState, updatePaddle, hitTarget } = usePhysics(dimensions.width, dimensions.height, 30);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Set canvas size
  useEffect(() => {
    if (canvasRef.current && dimensions.width > 0) {
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = dimensions.width * dpr;
      canvasRef.current.height = dimensions.height * dpr;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [dimensions]);

  // Create particle explosion
  const createExplosion = (x: number, y: number, count: number = 30) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 + 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
    particlesRef.current.push(...particles);
  };

  // Render loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastHitCheck = 0;

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      const state = getState();
      const { pucks, paddle, stats } = state;

      // Draw puck trails
      pucks.forEach((puck) => {
        puck.trail.forEach((point, i) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, puck.radius * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `${puck.color}${Math.floor(point.alpha * 30).toString(16).padStart(2, '0')}`;
          ctx.fill();
        });
      });

      // Draw pucks
      pucks.forEach((puck) => {
        // Outer glow
        const gradient = ctx.createRadialGradient(puck.x, puck.y, 0, puck.x, puck.y, puck.radius * 2);
        gradient.addColorStop(0, `${puck.color}80`);
        gradient.addColorStop(0.5, `${puck.color}40`);
        gradient.addColorStop(1, `${puck.color}00`);
        
        ctx.beginPath();
        ctx.arc(puck.x, puck.y, puck.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
        ctx.fillStyle = puck.color;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(puck.x - puck.radius * 0.3, puck.y - puck.radius * 0.3, puck.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // Speed indicator (spark)
        if (puck.speed > 5) {
          const sparkLength = Math.min(puck.speed * 2, 20);
          const angle = Math.atan2(puck.vy, puck.vx);
          const sparkX = puck.x - Math.cos(angle) * sparkLength;
          const sparkY = puck.y - Math.sin(angle) * sparkLength;

          ctx.beginPath();
          ctx.moveTo(sparkX, sparkY);
          ctx.lineTo(puck.x, puck.y);
          ctx.strokeStyle = `${puck.color}80`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      });

      // Draw paddle
      const paddleGradient = ctx.createRadialGradient(
        paddle.x, paddle.y, 0,
        paddle.x, paddle.y, paddle.radius
      );
      paddleGradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      paddleGradient.addColorStop(0.7, 'rgba(0, 240, 255, 0.2)');
      paddleGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.beginPath();
      ctx.arc(paddle.x, paddle.y, paddle.radius, 0, Math.PI * 2);
      ctx.fillStyle = paddleGradient;
      ctx.fill();

      // Paddle ring
      ctx.beginPath();
      ctx.arc(paddle.x, paddle.y, paddle.radius - 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw target if provided
      if (targetPosition) {
        const now = Date.now();
        if (now - lastHitCheck > 100) {
          const hitCount = hitTarget(targetPosition.x, targetPosition.y, targetPosition.radius);
          if (hitCount > 0 && onPuckHit) {
            onPuckHit(hitCount);
            createExplosion(targetPosition.x, targetPosition.y, hitCount * 10);
          }
          lastHitCheck = now;
        }

        // Pulsing target
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
        const targetGradient = ctx.createRadialGradient(
          targetPosition.x, targetPosition.y, 0,
          targetPosition.x, targetPosition.y, targetPosition.radius * pulse
        );
        targetGradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
        targetGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.beginPath();
        ctx.arc(targetPosition.x, targetPosition.y, targetPosition.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = targetGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(targetPosition.x, targetPosition.y, targetPosition.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.alpha -= 0.02;

        if (particle.alpha > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${particle.alpha})`;
          ctx.fill();
          return true;
        }
        return false;
      });

      // Notify chaos level
      if (onChaosChange) {
        onChaosChange(stats.chaosLevel);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dimensions, getState, hitTarget, onPuckHit, onChaosChange, targetPosition]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updatePaddle(e.clientX - rect.left, e.clientY - rect.top);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (containerRef.current && e.touches.length > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        updatePaddle(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [updatePaddle]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

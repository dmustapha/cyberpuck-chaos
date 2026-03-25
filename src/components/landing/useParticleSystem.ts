'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  baseOpacity: number;
  life: number;
  maxLife: number;
}

interface MouseState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  velocity: number;
  isDown: boolean;
}

interface ParticleSystemConfig {
  particleCount: number;
  maxSpeed: number;
  friction: number;
  mouseRadius: number;
  mouseForce: number;
  returnForce: number;
  colors: string[];
}

const defaultConfig: ParticleSystemConfig = {
  particleCount: 2000,
  maxSpeed: 8,
  friction: 0.95,
  mouseRadius: 150,
  mouseForce: 0.5,
  returnForce: 0.08,
  colors: ['#00f0ff', '#ffffff', '#ffaa00'],
};

export function useParticleSystem(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  targetPoints: { x: number; y: number }[],
  config: Partial<ParticleSystemConfig> = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };
  const particles = useRef<Particle[]>([]);
  const mouse = useRef<MouseState>({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    velocity: 0,
    isDown: false,
  });
  const animationFrame = useRef<number | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newParticles: Particle[] = [];
    const { particleCount, colors } = mergedConfig;

    for (let i = 0; i < particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const baseOpacity = colorIndex === 0 ? 0.6 + Math.random() * 0.4 : 0.3 + Math.random() * 0.3;

      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.5 + 0.5,
        color: colors[colorIndex],
        opacity: baseOpacity,
        baseOpacity,
        life: 0,
        maxLife: 1,
      });
    }

    particles.current = newParticles;
    setIsReady(true);
  }, [canvasRef, mergedConfig]);

  // Set target positions for particles
  const setTargets = useCallback(
    (points: { x: number; y: number }[]) => {
      if (!points.length || !particles.current.length) return;

      const particlesPerPoint = Math.floor(particles.current.length / points.length);

      particles.current.forEach((particle, i) => {
        const pointIndex = Math.min(Math.floor(i / particlesPerPoint), points.length - 1);
        const point = points[pointIndex];

        // Add some randomness to target positions for organic feel
        const spread = 2;
        particle.targetX = point.x + (Math.random() - 0.5) * spread;
        particle.targetY = point.y + (Math.random() - 0.5) * spread;
      });
    },
    []
  );

  // Physics update
  const updateParticles = useCallback(() => {
    const m = mouse.current;
    const { maxSpeed, friction, mouseRadius, mouseForce, returnForce } = mergedConfig;

    particles.current.forEach((particle) => {
      // Distance to target
      const dx = particle.targetX - particle.x;
      const dy = particle.targetY - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Return force (attraction to target)
      if (dist > 0.1) {
        particle.vx += (dx / dist) * returnForce;
        particle.vy += (dy / dist) * returnForce;
      }

      // Mouse interaction
      const mdx = m.x - particle.x;
      const mdy = m.y - particle.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mDist < mouseRadius) {
        const force = ((mouseRadius - mDist) / mouseRadius) * mouseForce;
        const angle = Math.atan2(mdy, mdx);

        // Repel particles away from mouse
        particle.vx -= Math.cos(angle) * force * (1 + m.velocity * 0.5);
        particle.vy -= Math.sin(angle) * force * (1 + m.velocity * 0.5);

        // Increase opacity near mouse
        particle.opacity = Math.min(1, particle.baseOpacity + (1 - mDist / mouseRadius) * 0.4);
      } else {
        // Return to base opacity
        particle.opacity += (particle.baseOpacity - particle.opacity) * 0.05;
      }

      // Mouse click shockwave
      if (m.isDown && mDist < mouseRadius * 2) {
        const shockForce = ((mouseRadius * 2 - mDist) / (mouseRadius * 2)) * 2;
        const angle = Math.atan2(mdy, mdx);
        particle.vx -= Math.cos(angle) * shockForce;
        particle.vy -= Math.sin(angle) * shockForce;
      }

      // Apply velocity
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Friction
      particle.vx *= friction;
      particle.vy *= friction;

      // Speed limit
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > maxSpeed) {
        particle.vx = (particle.vx / speed) * maxSpeed;
        particle.vy = (particle.vy / speed) * maxSpeed;
      }

      // Life cycle
      particle.life = Math.min(particle.maxLife, particle.life + 0.02);
    });
  }, [mergedConfig]);

  // Render particles
  const renderParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((particle) => {
      const alpha = particle.opacity * (particle.life / particle.maxLife);

      // Draw glow
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 3
      );
      gradient.addColorStop(0, particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.5, particle.color + '33');
      gradient.addColorStop(1, particle.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw mouse cursor glow
    if (mouse.current.x > 0 && mouse.current.y > 0) {
      const m = mouse.current;
      const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 80);
      gradient.addColorStop(0, '#00f0ff44');
      gradient.addColorStop(0.5, '#00f0ff22');
      gradient.addColorStop(1, '#00f0ff00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 80, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [canvasRef]);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    renderParticles();
    animationFrame.current = requestAnimationFrame(animate);
  }, [updateParticles, renderParticles]);

  // Mouse handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    mouse.current.prevX = mouse.current.x;
    mouse.current.prevY = mouse.current.y;
    mouse.current.x = newX;
    mouse.current.y = newY;

    // Calculate velocity
    const dx = mouse.current.x - mouse.current.prevX;
    const dy = mouse.current.y - mouse.current.prevY;
    mouse.current.velocity = Math.sqrt(dx * dx + dy * dy);
  }, [canvasRef]);

  const handleMouseDown = useCallback(() => {
    mouse.current.isDown = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    mouse.current.isDown = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouse.current.isDown = false;
  }, []);

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles();
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse events
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef, initializeParticles, handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave]);

  // Start animation when targets are set
  useEffect(() => {
    if (!isReady || targetPoints.length === 0) return;

    setTargets(targetPoints);

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    animate();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isReady, targetPoints, setTargets, animate]);

  return { particles: particles.current, setTargets, isReady };
}

'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * Minimal interface for bodies that can be rendered.
 * This interface is satisfied by both:
 * - Local physics engine (GameBodies from useGameEngine)
 * - Server-authoritative state (MultiplayerBodies from useMultiplayerGameEngine)
 */
export interface RenderableBodies {
  puck: { position: { x: number; y: number } };
  paddle1: { position: { x: number; y: number } };
  paddle2: { position: { x: number; y: number } };
}

interface GameCanvasProps {
  getBodies: () => RenderableBodies | null;
  getEffectiveRadii?: () => { puck: number; paddle1: number; paddle2: number } | null;
  activeModifierType?: string | null;
  isPuckFrozen?: () => boolean;
}

export interface GameCanvasRef {
  canvas: HTMLCanvasElement | null;
}

// Puck trail configuration
const TRAIL_LENGTH = 12; // Number of trail points
const TRAIL_FADE_RATE = 0.85; // How quickly opacity fades (0-1)

// Paddle trail configuration (shorter than puck)
const PADDLE_TRAIL_LENGTH = 6;
const PADDLE_TRAIL_FADE_RATE = 0.75;

// Paddle glow animation
const GLOW_PULSE_SPEED = 0.003; // Speed of pulsing
const GLOW_MIN = 25;
const GLOW_MAX = 50;

// Contact flash duration (ms)
const CONTACT_FLASH_DURATION = 150;

// ============================================================================
// BACKGROUND EFFECTS CONFIGURATION
// ============================================================================

// Neon grid configuration
const GRID_SIZE = 40; // Size of each grid cell
const GRID_COLOR = 'rgba(29, 78, 216, 0.15)'; // Subtle blue grid
const GRID_GLOW_COLOR = 'rgba(29, 78, 216, 0.3)';

// Floating particles configuration
const PARTICLE_COUNT = 25;
const PARTICLE_MIN_SIZE = 1;
const PARTICLE_MAX_SIZE = 3;
const PARTICLE_MIN_SPEED = 0.2;
const PARTICLE_MAX_SPEED = 0.8;
const PARTICLE_COLOR = 'rgba(147, 197, 253, 0.6)'; // Light blue

// Border glow configuration
const BORDER_GLOW_MIN = 8;
const BORDER_GLOW_MAX = 20;
const BORDER_PULSE_SPEED = 0.002;
const BORDER_COLOR = '#1D4ED8'; // Primary blue

// Center elements pulse configuration
const CENTER_PULSE_SPEED = 0.002;
const CENTER_GLOW_MIN = 5;
const CENTER_GLOW_MAX = 15;
const CENTER_COLOR = 'rgba(59, 130, 246, 0.5)'; // Blue

// Particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

// Initialize particles
function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (PARTICLE_MAX_SPEED - PARTICLE_MIN_SPEED) + PARTICLE_MIN_SPEED,
      vy: (Math.random() - 0.5) * (PARTICLE_MAX_SPEED - PARTICLE_MIN_SPEED) + PARTICLE_MIN_SPEED,
      size: Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE) + PARTICLE_MIN_SIZE,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }
  return particles;
}

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  function GameCanvas({ getBodies, getEffectiveRadii, activeModifierType, isPuckFrozen }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    // Store puck position history for trail effect
    const puckTrailRef = useRef<{ x: number; y: number }[]>([]);
    // Store paddle position history for trail effects
    const paddle1TrailRef = useRef<{ x: number; y: number }[]>([]);
    const paddle2TrailRef = useRef<{ x: number; y: number }[]>([]);
    // Track time for pulsing animation
    const timeRef = useRef<number>(0);
    // Track contact flash state
    const paddle1ContactRef = useRef<number>(0); // timestamp of last contact
    const paddle2ContactRef = useRef<number>(0);
    // Track previous puck position to detect new collisions
    const lastPuckPosRef = useRef<{ x: number; y: number } | null>(null);
    // Floating particles for background
    const particlesRef = useRef<Particle[] | null>(null);
    // Visual radii with smooth lerp for modifier transitions
    const visualRadiiRef = useRef({
      puck: PHYSICS_CONFIG.puck.radius,
      paddle1: PHYSICS_CONFIG.paddle.radius,
      paddle2: PHYSICS_CONFIG.paddle.radius,
    });
    // Puck alpha for invisible_puck modifier
    const visualPuckAlphaRef = useRef(1);
    // Ref for activeModifierType — avoids restarting animation loop when modifier changes
    const activeModifierTypeRef = useRef<string | null | undefined>(null);
    activeModifierTypeRef.current = activeModifierType;
    // Ref for isPuckFrozen getter — read inside draw without restarting loop
    const isPuckFrozenRef = useRef<(() => boolean) | undefined>(undefined);
    isPuckFrozenRef.current = isPuckFrozen;

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
    }));

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const { table } = PHYSICS_CONFIG;
      const now = performance.now();

      // Initialize particles on first draw
      if (!particlesRef.current) {
        particlesRef.current = createParticles(table.width, table.height);
      }

      // Calculate pulse values for animations
      const borderPulse = Math.sin(now * BORDER_PULSE_SPEED);
      const borderGlow = BORDER_GLOW_MIN + (BORDER_GLOW_MAX - BORDER_GLOW_MIN) * (0.5 + 0.5 * borderPulse);
      const centerPulse = Math.sin(now * CENTER_PULSE_SPEED);
      const centerGlow = CENTER_GLOW_MIN + (CENTER_GLOW_MAX - CENTER_GLOW_MIN) * (0.5 + 0.5 * centerPulse);
      const centerOpacity = 0.3 + 0.2 * (0.5 + 0.5 * centerPulse);

      // ========================================================================
      // BACKGROUND
      // ========================================================================

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, table.width, table.height);

      // ========================================================================
      // NEON GRID
      // ========================================================================
      ctx.save();
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = GRID_SIZE; x < table.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, table.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = GRID_SIZE; y < table.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(table.width, y);
        ctx.stroke();
      }

      // Add subtle glow at intersections
      ctx.fillStyle = GRID_GLOW_COLOR;
      for (let x = GRID_SIZE; x < table.width; x += GRID_SIZE) {
        for (let y = GRID_SIZE; y < table.height; y += GRID_SIZE) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // ========================================================================
      // ANIMATED PARTICLES
      // ========================================================================
      ctx.save();
      const particles = particlesRef.current;
      for (const particle of particles) {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = table.width;
        if (particle.x > table.width) particle.x = 0;
        if (particle.y < 0) particle.y = table.height;
        if (particle.y > table.height) particle.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${particle.opacity})`;
        ctx.shadowColor = 'rgba(147, 197, 253, 0.8)';
        ctx.shadowBlur = 5;
        ctx.fill();
      }
      ctx.restore();

      // ========================================================================
      // PULSING CENTER ELEMENTS
      // ========================================================================

      // Draw center line with pulsing glow
      ctx.save();
      ctx.shadowColor = CENTER_COLOR;
      ctx.shadowBlur = centerGlow;
      ctx.strokeStyle = `rgba(59, 130, 246, ${centerOpacity})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, table.height / 2);
      ctx.lineTo(table.width, table.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Draw center circle with pulsing glow
      ctx.save();
      ctx.shadowColor = CENTER_COLOR;
      ctx.shadowBlur = centerGlow;
      ctx.strokeStyle = `rgba(59, 130, 246, ${centerOpacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot at center
      ctx.fillStyle = `rgba(59, 130, 246, ${centerOpacity * 0.8})`;
      ctx.beginPath();
      ctx.arc(table.width / 2, table.height / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ========================================================================
      // GOAL ZONES
      // ========================================================================
      const goalWidth = table.goalWidth;
      const goalX = (table.width - goalWidth) / 2;

      // Top goal zone (red - AI/Player 2 defends this)
      ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
      ctx.fillRect(goalX, 0, goalWidth, 30);
      ctx.save();
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(goalX, 0, goalWidth, 30);
      ctx.restore();

      // Bottom goal zone (green - Player 1 defends this)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
      ctx.fillRect(goalX, table.height - 30, goalWidth, 30);
      ctx.save();
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(goalX, table.height - 30, goalWidth, 30);
      ctx.restore();

      // ========================================================================
      // GLOWING ANIMATED BORDER
      // ========================================================================
      ctx.save();
      ctx.shadowColor = BORDER_COLOR;
      ctx.shadowBlur = borderGlow;
      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, table.width - 4, table.height - 4);

      // Add corner accents
      const cornerSize = 20;
      ctx.lineWidth = 4;
      ctx.shadowBlur = borderGlow * 1.5;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(2, cornerSize);
      ctx.lineTo(2, 2);
      ctx.lineTo(cornerSize, 2);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(table.width - cornerSize, 2);
      ctx.lineTo(table.width - 2, 2);
      ctx.lineTo(table.width - 2, cornerSize);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(2, table.height - cornerSize);
      ctx.lineTo(2, table.height - 2);
      ctx.lineTo(cornerSize, table.height - 2);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(table.width - cornerSize, table.height - 2);
      ctx.lineTo(table.width - 2, table.height - 2);
      ctx.lineTo(table.width - 2, table.height - cornerSize);
      ctx.stroke();
      ctx.restore();

      // Get physics bodies
      const bodies = getBodies();
      if (!bodies) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const { puck, paddle1, paddle2 } = bodies;
      timeRef.current = now;

      // Lerp visual radii toward target (smooth modifier transitions)
      const LERP = 0.12;
      const SNAP = 0.5;
      const defaults = {
        puck: PHYSICS_CONFIG.puck.radius,
        paddle1: PHYSICS_CONFIG.paddle.radius,
        paddle2: PHYSICS_CONFIG.paddle.radius,
      };
      const target = getEffectiveRadii?.() ?? defaults;
      // Log radii every ~2s (120 frames) when they differ from defaults
      if (Math.round(now / 2000) !== Math.round((now - 16) / 2000)) {
        if (target.paddle1 !== defaults.paddle1 || target.paddle2 !== defaults.paddle2 || target.puck !== defaults.puck) {
          console.log('[GameCanvas] Effective radii:', target, 'visual:', { ...visualRadiiRef.current });
        }
      }
      for (const key of ['puck', 'paddle1', 'paddle2'] as const) {
        const diff = target[key] - visualRadiiRef.current[key];
        if (Math.abs(diff) < SNAP) {
          visualRadiiRef.current[key] = target[key];
        } else {
          visualRadiiRef.current[key] += diff * LERP;
        }
      }
      const vr = visualRadiiRef.current;

      // Lerp puck alpha for invisible_puck modifier (read from ref — stable, no dep needed)
      const targetAlpha = activeModifierTypeRef.current === 'invisible_puck' ? 0.05 : 1;
      const alphaDiff = targetAlpha - visualPuckAlphaRef.current;
      if (Math.abs(alphaDiff) < 0.01) {
        visualPuckAlphaRef.current = targetAlpha;
      } else {
        visualPuckAlphaRef.current += alphaDiff * LERP;
      }

      // Calculate pulsing glow intensity
      const pulsePhase = Math.sin(now * GLOW_PULSE_SPEED);
      const baseGlow = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * (0.5 + 0.5 * pulsePhase);

      // Detect paddle-puck collisions for flash effect
      const collisionDistance = vr.paddle1 + vr.puck;
      const dist1 = Math.hypot(
        puck.position.x - paddle1.position.x,
        puck.position.y - paddle1.position.y
      );
      const dist2 = Math.hypot(
        puck.position.x - paddle2.position.x,
        puck.position.y - paddle2.position.y
      );

      // Check if this is a new collision (not continuous contact)
      const lastPuck = lastPuckPosRef.current;
      if (lastPuck) {
        const lastDist1 = Math.hypot(lastPuck.x - paddle1.position.x, lastPuck.y - paddle1.position.y);
        const lastDist2 = Math.hypot(lastPuck.x - paddle2.position.x, lastPuck.y - paddle2.position.y);

        // Trigger flash only on new contact
        if (dist1 <= collisionDistance * 1.1 && lastDist1 > collisionDistance * 1.1) {
          paddle1ContactRef.current = now;
        }
        if (dist2 <= collisionDistance * 1.1 && lastDist2 > collisionDistance * 1.1) {
          paddle2ContactRef.current = now;
        }
      }
      lastPuckPosRef.current = { x: puck.position.x, y: puck.position.y };

      // Calculate flash intensity (fades over CONTACT_FLASH_DURATION)
      const flash1 = Math.max(0, 1 - (now - paddle1ContactRef.current) / CONTACT_FLASH_DURATION);
      const flash2 = Math.max(0, 1 - (now - paddle2ContactRef.current) / CONTACT_FLASH_DURATION);

      // Update puck trail history
      const trail = puckTrailRef.current;
      trail.unshift({ x: puck.position.x, y: puck.position.y });
      if (trail.length > TRAIL_LENGTH) {
        trail.pop();
      }

      // Update paddle trails
      const paddle1Trail = paddle1TrailRef.current;
      paddle1Trail.unshift({ x: paddle1.position.x, y: paddle1.position.y });
      if (paddle1Trail.length > PADDLE_TRAIL_LENGTH) {
        paddle1Trail.pop();
      }

      const paddle2Trail = paddle2TrailRef.current;
      paddle2Trail.unshift({ x: paddle2.position.x, y: paddle2.position.y });
      if (paddle2Trail.length > PADDLE_TRAIL_LENGTH) {
        paddle2Trail.pop();
      }

      // Draw paddle 1 trail
      ctx.save();
      for (let i = paddle1Trail.length - 1; i >= 1; i--) {
        const point = paddle1Trail[i];
        const opacity = Math.pow(PADDLE_TRAIL_FADE_RATE, i) * 0.4;
        const size = vr.paddle1 * (1 - i / paddle1Trail.length * 0.3);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 204, 0, ${opacity})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw paddle 2 trail
      ctx.save();
      for (let i = paddle2Trail.length - 1; i >= 1; i--) {
        const point = paddle2Trail[i];
        const opacity = Math.pow(PADDLE_TRAIL_FADE_RATE, i) * 0.4;
        const size = vr.paddle2 * (1 - i / paddle2Trail.length * 0.3);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 0, 0, ${opacity})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw puck trail (before the puck itself)
      ctx.save();
      for (let i = trail.length - 1; i >= 1; i--) {
        const point = trail[i];
        const opacity = Math.pow(TRAIL_FADE_RATE, i) * 0.6;
        const size = vr.puck * (1 - i / trail.length * 0.5);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * visualPuckAlphaRef.current})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw puck with glow (respects invisible_puck alpha + freeze pulse)
      ctx.save();
      const frozen = isPuckFrozenRef.current?.() ?? false;
      let puckAlpha = visualPuckAlphaRef.current;
      let puckGlow = 15;
      if (frozen) {
        // Pulse alpha between 0.3 and 1.0 during freeze
        puckAlpha = Math.sin(now * 0.01) * 0.35 + 0.65;
        puckGlow = 25 + Math.sin(now * 0.008) * 10; // Extra glow pulse
      }
      ctx.globalAlpha = puckAlpha;
      ctx.shadowColor = frozen ? '#00ffff' : '#ffffff';
      ctx.shadowBlur = puckGlow;
      ctx.fillStyle = frozen ? '#00ffff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(puck.position.x, puck.position.y, vr.puck, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      // Draw paddle 1 (player - bottom) with pulsing glow and contact flash
      ctx.save();
      const glow1 = baseGlow + flash1 * 25; // Extra glow on contact
      const green1 = Math.min(255, 204 + flash1 * 51); // Brighten on contact (204 -> 255)
      ctx.shadowColor = `rgb(0, ${green1}, 0)`;
      ctx.shadowBlur = glow1;
      ctx.fillStyle = `rgb(0, ${green1}, 0)`;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, vr.paddle1, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      const innerGreen1 = Math.min(100, 68 + flash1 * 32);
      ctx.fillStyle = `rgb(0, ${innerGreen1}, 0)`;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, vr.paddle1 * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw paddle 2 (AI/opponent - top) with pulsing glow and contact flash
      ctx.save();
      const glow2 = baseGlow + flash2 * 25;
      const red2 = Math.min(255, 204 + flash2 * 51); // Brighten on contact
      ctx.shadowColor = `rgb(${red2}, 0, 0)`;
      ctx.shadowBlur = glow2;
      ctx.fillStyle = `rgb(${red2}, 0, 0)`;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, vr.paddle2, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      const innerRed2 = Math.min(100, 68 + flash2 * 32);
      ctx.fillStyle = `rgb(${innerRed2}, 0, 0)`;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, vr.paddle2 * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    }, [getBodies, getEffectiveRadii]);

    useEffect(() => {
      animationRef.current = requestAnimationFrame(draw);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [draw]);

    return (
      <canvas
        ref={canvasRef}
        width={PHYSICS_CONFIG.table.width}
        height={PHYSICS_CONFIG.table.height}
        className="rounded-lg border-4 border-gray-700 shadow-2xl cursor-none"
        style={{
          maxWidth: '100%',
          maxHeight: 'calc(100dvh - 120px)',
          height: 'auto',
          width: 'auto',
          aspectRatio: `${PHYSICS_CONFIG.table.width} / ${PHYSICS_CONFIG.table.height}`,
        }}
      />
    );
  }
);

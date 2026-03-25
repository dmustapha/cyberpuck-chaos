import { useRef, useEffect, useCallback } from 'react';

export interface Puck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  speed: number;
}

export interface Paddle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

export interface PhysicsState {
  pucks: Puck[];
  paddle: Paddle;
  stats: {
    pucksHit: number;
    topSpeed: number;
    chaosLevel: number;
  };
}

const GRAVITY = 0;
const FRICTION = 0.995;
const BOUNCE_DAMPING = 0.85;
const PUCK_RADIUS = 12;
const PADDLE_RADIUS = 40;
const TRAIL_LENGTH = 8;
const MIN_SPEED = 0.5;
const COLLISION_FORCE = 1.2;

export function usePhysics(width: number, height: number, puckCount: number = 30) {
  const stateRef = useRef<PhysicsState>({
    pucks: [],
    paddle: { x: width / 2, y: height / 2, radius: PADDLE_RADIUS, vx: 0, vy: 0 },
    stats: { pucksHit: 0, topSpeed: 0, chaosLevel: 0 }
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastMouseRef = useRef({ x: width / 2, y: height / 2, time: Date.now() });

  // Initialize pucks
  const initializePucks = useCallback(() => {
    const pucks: Puck[] = [];
    const colors = ['#00f0ff', '#00d4ff', '#00b8ff', '#009cff', '#0080ff'];
    
    for (let i = 0; i < puckCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      
      pucks.push({
        id: i,
        x: Math.random() * (width - PUCK_RADIUS * 2) + PUCK_RADIUS,
        y: Math.random() * (height - PUCK_RADIUS * 2) + PUCK_RADIUS,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: PUCK_RADIUS,
        color: colors[i % colors.length],
        trail: [],
        speed: 0
      });
    }
    
    stateRef.current.pucks = pucks;
  }, [width, height, puckCount]);

  // Check collision between two circles
  const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  };

  // Resolve collision between two circles
  const resolveCollision = (
    obj1: { x: number; y: number; vx: number; vy: number; radius: number },
    obj2: { x: number; y: number; vx: number; vy: number; radius: number },
    mass1: number = 1,
    mass2: number = 1
  ) => {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = obj1.vx - obj2.vx;
    const dvy = obj1.vy - obj2.vy;

    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;

    // Don't resolve if velocities are separating
    if (dvn < 0) return;

    // Collision impulse
    const impulse = (2 * dvn) / (mass1 + mass2);

    // Update velocities
    obj1.vx -= impulse * mass2 * nx * COLLISION_FORCE;
    obj1.vy -= impulse * mass2 * ny * COLLISION_FORCE;
    obj2.vx += impulse * mass1 * nx * COLLISION_FORCE;
    obj2.vy += impulse * mass1 * ny * COLLISION_FORCE;

    // Separate overlapping circles
    const overlap = obj1.radius + obj2.radius - distance;
    const separationX = (overlap / 2) * nx;
    const separationY = (overlap / 2) * ny;
    
    obj1.x -= separationX;
    obj1.y -= separationY;
    obj2.x += separationX;
    obj2.y += separationY;
  };

  // Update physics
  const update = useCallback(() => {
    const state = stateRef.current;
    const { pucks, paddle, stats } = state;

    // Update pucks
    pucks.forEach((puck) => {
      // Apply gravity
      puck.vy += GRAVITY;

      // Apply friction
      puck.vx *= FRICTION;
      puck.vy *= FRICTION;

      // Update position
      puck.x += puck.vx;
      puck.y += puck.vy;

      // Wall collisions
      if (puck.x - puck.radius < 0) {
        puck.x = puck.radius;
        puck.vx *= -BOUNCE_DAMPING;
      }
      if (puck.x + puck.radius > width) {
        puck.x = width - puck.radius;
        puck.vx *= -BOUNCE_DAMPING;
      }
      if (puck.y - puck.radius < 0) {
        puck.y = puck.radius;
        puck.vy *= -BOUNCE_DAMPING;
      }
      if (puck.y + puck.radius > height) {
        puck.y = height - puck.radius;
        puck.vy *= -BOUNCE_DAMPING;
      }

      // Stop very slow pucks
      if (Math.abs(puck.vx) < MIN_SPEED && Math.abs(puck.vy) < MIN_SPEED) {
        puck.vx *= 0.9;
        puck.vy *= 0.9;
      }

      // Update trail
      puck.trail.unshift({ x: puck.x, y: puck.y, alpha: 1 });
      if (puck.trail.length > TRAIL_LENGTH) {
        puck.trail.pop();
      }
      puck.trail.forEach((t, i) => {
        t.alpha = 1 - (i / TRAIL_LENGTH);
      });

      // Calculate speed
      puck.speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
    });

    // Puck-puck collisions
    for (let i = 0; i < pucks.length; i++) {
      for (let j = i + 1; j < pucks.length; j++) {
        if (checkCollision(pucks[i].x, pucks[i].y, pucks[i].radius, pucks[j].x, pucks[j].y, pucks[j].radius)) {
          resolveCollision(pucks[i], pucks[j]);
        }
      }
    }

    // Paddle-puck collisions
    pucks.forEach((puck) => {
      if (checkCollision(puck.x, puck.y, puck.radius, paddle.x, paddle.y, paddle.radius)) {
        resolveCollision(puck, paddle, 1, 3); // Paddle is 3x heavier
        stats.pucksHit++;
        
        // Track top speed
        const puckSpeed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
        if (puckSpeed > stats.topSpeed) {
          stats.topSpeed = puckSpeed;
        }
      }
    });

    // Calculate chaos level (average speed of all pucks)
    const totalSpeed = pucks.reduce((sum, p) => sum + p.speed, 0);
    const averageSpeed = totalSpeed / pucks.length;
    stats.chaosLevel = Math.min(100, (averageSpeed / 10) * 100);

    animationFrameRef.current = requestAnimationFrame(update);
  }, [width, height]);

  // Update paddle position from mouse
  const updatePaddle = useCallback((x: number, y: number) => {
    const now = Date.now();
    const dt = (now - lastMouseRef.current.time) / 1000;
    
    if (dt > 0) {
      const paddle = stateRef.current.paddle;
      paddle.vx = (x - lastMouseRef.current.x) / dt;
      paddle.vy = (y - lastMouseRef.current.y) / dt;
      paddle.x = x;
      paddle.y = y;
    }
    
    lastMouseRef.current = { x, y, time: now };
  }, []);

  // Hit CTA target
  const hitTarget = useCallback((targetX: number, targetY: number, targetRadius: number): number => {
    const { pucks } = stateRef.current;
    let hitCount = 0;

    pucks.forEach((puck) => {
      if (checkCollision(puck.x, puck.y, puck.radius, targetX, targetY, targetRadius)) {
        hitCount++;
      }
    });

    return hitCount;
  }, []);

  // Get current state
  const getState = useCallback(() => stateRef.current, []);

  // Reset stats
  const resetStats = useCallback(() => {
    stateRef.current.stats = { pucksHit: 0, topSpeed: 0, chaosLevel: 0 };
  }, []);

  // Start physics loop
  useEffect(() => {
    initializePucks();
    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializePucks, update]);

  return {
    getState,
    updatePaddle,
    hitTarget,
    resetStats
  };
}

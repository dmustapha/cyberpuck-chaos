import { useEffect, useRef, useState, useCallback } from 'react';

export interface Puck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  trail: Array<{ x: number; y: number }>;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface PhysicsStats {
  pucksHit: number;
  topSpeed: number;
  chaosLevel: number;
}

interface UsePhysicsEngineOptions {
  puckCount: number;
  width: number;
  height: number;
  cursorX: number;
  cursorY: number;
  paddleWidth: number;
  paddleHeight: number;
  buttonBounds?: DOMRect | null;
}

const FRICTION = 0.985;
const RESTITUTION = 0.9;
const PADDLE_POWER = 1.5;
const MIN_SPEED = 0.5;
const MAX_SPEED = 15;
const TRAIL_LENGTH = 5;
const PARTICLE_COUNT = 20;

export function usePhysicsEngine(options: UsePhysicsEngineOptions) {
  const {
    puckCount,
    width,
    height,
    cursorX,
    cursorY,
    paddleWidth,
    paddleHeight,
    buttonBounds,
  } = options;

  const [pucks, setPucks] = useState<Puck[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stats, setStats] = useState<PhysicsStats>({
    pucksHit: 0,
    topSpeed: 0,
    chaosLevel: 0,
  });

  const pucksRef = useRef<Puck[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const statsRef = useRef<PhysicsStats>({ pucksHit: 0, topSpeed: 0, chaosLevel: 0 });
  const prevCursorRef = useRef({ x: cursorX, y: cursorY });
  const animationFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  // Initialize pucks
  useEffect(() => {
    if (width === 0 || height === 0) return;

    const initialPucks: Puck[] = Array.from({ length: puckCount }, (_, i) => {
      const radius = 8 + Math.random() * 4;
      return {
        id: i,
        x: radius + Math.random() * (width - 2 * radius),
        y: radius + Math.random() * (height - 2 * radius),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius,
        trail: [],
      };
    });

    pucksRef.current = initialPucks;
    setPucks(initialPucks);
  }, [puckCount, width, height]);

  // Collision detection helpers
  const checkCircleCollision = (
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  };

  const resolveCollision = (puck1: Puck, puck2: Puck) => {
    const dx = puck2.x - puck1.x;
    const dy = puck2.y - puck1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normalize
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = puck2.vx - puck1.vx;
    const dvy = puck2.vy - puck1.vy;
    const dotProduct = dvx * nx + dvy * ny;

    // Don't resolve if velocities are separating
    if (dotProduct > 0) return;

    // Apply impulse
    const impulse = (2 * dotProduct) / 2; // Equal mass
    puck1.vx += impulse * nx * RESTITUTION;
    puck1.vy += impulse * ny * RESTITUTION;
    puck2.vx -= impulse * nx * RESTITUTION;
    puck2.vy -= impulse * ny * RESTITUTION;

    // Separate pucks to prevent overlap
    const overlap = (puck1.radius + puck2.radius - distance) / 2;
    puck1.x -= overlap * nx;
    puck1.y -= overlap * ny;
    puck2.x += overlap * nx;
    puck2.y += overlap * ny;
  };

  const createParticleExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      return {
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 30 + Math.random() * 30,
      };
    });
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Main physics loop
  useEffect(() => {
    if (width === 0 || height === 0) return;

    let lastTime = performance.now();

    const updatePhysics = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x normal speed
      lastTime = currentTime;

      const pucksClone = [...pucksRef.current];
      const particlesClone = [...particlesRef.current];
      let hitCount = statsRef.current.pucksHit;

      // Update pucks
      pucksClone.forEach((puck, i) => {
        // Apply velocity
        puck.x += puck.vx * deltaTime;
        puck.y += puck.vy * deltaTime;

        // Wall collisions
        if (puck.x - puck.radius < 0) {
          puck.x = puck.radius;
          puck.vx = Math.abs(puck.vx) * RESTITUTION;
        } else if (puck.x + puck.radius > width) {
          puck.x = width - puck.radius;
          puck.vx = -Math.abs(puck.vx) * RESTITUTION;
        }

        if (puck.y - puck.radius < 0) {
          puck.y = puck.radius;
          puck.vy = Math.abs(puck.vy) * RESTITUTION;
        } else if (puck.y + puck.radius > height) {
          puck.y = height - puck.radius;
          puck.vy = -Math.abs(puck.vy) * RESTITUTION;
        }

        // Paddle collision (cursor)
        const paddleLeft = cursorX - paddleWidth / 2;
        const paddleTop = cursorY - paddleHeight / 2;
        const paddleRight = paddleLeft + paddleWidth;
        const paddleBottom = paddleTop + paddleHeight;

        if (
          puck.x + puck.radius > paddleLeft &&
          puck.x - puck.radius < paddleRight &&
          puck.y + puck.radius > paddleTop &&
          puck.y - puck.radius < paddleBottom
        ) {
          const cursorVx = (cursorX - prevCursorRef.current.x) * PADDLE_POWER;
          const cursorVy = (cursorY - prevCursorRef.current.y) * PADDLE_POWER;
          puck.vx += cursorVx;
          puck.vy += cursorVy;
          hitCount++;
        }

        // Button collision
        if (buttonBounds) {
          const buttonCenterX = buttonBounds.left + buttonBounds.width / 2;
          const buttonCenterY = buttonBounds.top + buttonBounds.height / 2;
          const buttonRadius = Math.max(buttonBounds.width, buttonBounds.height) / 2;

          if (
            checkCircleCollision(
              puck.x,
              puck.y,
              puck.radius,
              buttonCenterX,
              buttonCenterY,
              buttonRadius
            )
          ) {
            createParticleExplosion(puck.x, puck.y);
            // Bounce off button
            const dx = puck.x - buttonCenterX;
            const dy = puck.y - buttonCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              const nx = dx / distance;
              const ny = dy / distance;
              puck.vx = nx * Math.abs(puck.vx) * 1.2;
              puck.vy = ny * Math.abs(puck.vy) * 1.2;
            }
          }
        }

        // Puck-puck collisions
        for (let j = i + 1; j < pucksClone.length; j++) {
          const other = pucksClone[j];
          if (checkCircleCollision(puck.x, puck.y, puck.radius, other.x, other.y, other.radius)) {
            resolveCollision(puck, other);
          }
        }

        // Apply friction
        puck.vx *= FRICTION;
        puck.vy *= FRICTION;

        // Minimum speed to prevent stuck pucks
        const speed = Math.sqrt(puck.vx * puck.vx + puck.vy * puck.vy);
        if (speed > 0 && speed < MIN_SPEED) {
          puck.vx = (puck.vx / speed) * MIN_SPEED;
          puck.vy = (puck.vy / speed) * MIN_SPEED;
        }

        // Max speed cap
        if (speed > MAX_SPEED) {
          puck.vx = (puck.vx / speed) * MAX_SPEED;
          puck.vy = (puck.vy / speed) * MAX_SPEED;
        }

        // Update trail
        puck.trail.push({ x: puck.x, y: puck.y });
        if (puck.trail.length > TRAIL_LENGTH) {
          puck.trail.shift();
        }

        // Track top speed
        if (speed > statsRef.current.topSpeed) {
          statsRef.current.topSpeed = speed;
        }
      });

      // Update particles
      const activeParticles = particlesClone.filter(p => {
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 0.2 * deltaTime; // Gravity
        p.life++;
        return p.life < p.maxLife;
      });

      // Calculate chaos level (average speed)
      const totalSpeed = pucksClone.reduce((sum, p) => {
        return sum + Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      }, 0);
      const avgSpeed = totalSpeed / pucksClone.length;
      const chaosLevel = Math.min(100, (avgSpeed / MAX_SPEED) * 100);

      // Update refs
      pucksRef.current = pucksClone;
      particlesRef.current = activeParticles;
      statsRef.current = {
        pucksHit: hitCount,
        topSpeed: statsRef.current.topSpeed,
        chaosLevel: Math.round(chaosLevel),
      };
      prevCursorRef.current = { x: cursorX, y: cursorY };

      // Update state (throttle to avoid too many renders)
      setPucks(pucksClone);
      setParticles(activeParticles);
      setStats(statsRef.current);

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height, cursorX, cursorY, paddleWidth, paddleHeight, buttonBounds, createParticleExplosion]);

  return { pucks, particles, stats };
}

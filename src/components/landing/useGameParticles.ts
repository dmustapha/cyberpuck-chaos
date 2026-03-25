import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GameState {
  stage: 'arena' | 'paddles' | 'puck' | 'game' | 'title';
  puckPosition: { x: number; y: number };
  playerPosition: { x: number; y: number };
  opponentPosition: { x: number; y: number };
  goalExplosion: boolean;
}

export function useGameParticles(count: number = 2000) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocityRef = useRef<Float32Array>(new Float32Array(count * 3));
  const targetRef = useRef<Float32Array>(new Float32Array(count * 3));
  const scrollProgressRef = useRef(0);
  const gameStateRef = useRef<GameState>({
    stage: 'arena',
    puckPosition: { x: 0, y: 0 },
    playerPosition: { x: 0, y: -4 },
    opponentPosition: { x: 0, y: 4 },
    goalExplosion: false,
  });

  // Initialize random scattered particles
  const initialPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 15 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Create arena outline (rectangular with rounded corners)
  const createArenaShape = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    const width = 12;
    const height = 16;
    const cornerRadius = 1;
    const particlesPerSection = Math.floor(count / 6); // Arena outline + center line + goal areas

    let particleIndex = 0;

    // Main arena outline
    const outlineParticles = particlesPerSection * 4;
    for (let i = 0; i < outlineParticles; i++) {
      const i3 = particleIndex * 3;
      const t = i / outlineParticles;
      const perimeter = 2 * (width + height);
      const distance = t * perimeter;

      if (distance < width) {
        positions[i3] = (distance / width - 0.5) * width;
        positions[i3 + 1] = -height / 2;
      } else if (distance < width + height) {
        positions[i3] = width / 2;
        positions[i3 + 1] = ((distance - width) / height - 0.5) * height;
      } else if (distance < 2 * width + height) {
        positions[i3] = (1 - (distance - width - height) / width - 0.5) * width;
        positions[i3 + 1] = height / 2;
      } else {
        positions[i3] = -width / 2;
        positions[i3 + 1] = (1 - (distance - 2 * width - height) / height - 0.5) * height;
      }

      positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
      particleIndex++;
    }

    // Center line
    const centerLineParticles = particlesPerSection;
    for (let i = 0; i < centerLineParticles; i++) {
      const i3 = particleIndex * 3;
      const t = i / centerLineParticles;
      positions[i3] = (t - 0.5) * width;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
      particleIndex++;
    }

    // Goal areas (top and bottom)
    const goalParticles = particlesPerSection;
    for (let i = 0; i < goalParticles; i++) {
      const i3 = particleIndex * 3;
      const t = i / goalParticles;
      const isTopGoal = i < goalParticles / 2;
      const goalWidth = width * 0.4;

      positions[i3] = (t - 0.5) * goalWidth * 2;
      positions[i3 + 1] = isTopGoal ? height / 2 : -height / 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.3;
      particleIndex++;
    }

    return positions;
  }, [count]);

  // Create paddle shape
  const createPaddleShape = useCallback((x: number, y: number, isPlayer: boolean): Float32Array => {
    const positions = new Float32Array(count * 3);
    const paddleRadius = 1.2;
    const paddleParticles = Math.floor(count / 6); // Reserve particles for paddles

    let particleIndex = 0;

    // Keep arena particles
    const arenaPositions = createArenaShape();
    const arenaParticles = Math.floor(count * 0.6);
    for (let i = 0; i < arenaParticles; i++) {
      const i3 = i * 3;
      positions[i3] = arenaPositions[i3];
      positions[i3 + 1] = arenaPositions[i3 + 1];
      positions[i3 + 2] = arenaPositions[i3 + 2];
    }
    particleIndex = arenaParticles;

    // Add paddle particles
    for (let i = 0; i < paddleParticles; i++) {
      const i3 = particleIndex * 3;
      const angle = (i / paddleParticles) * Math.PI * 2;
      const r = paddleRadius * Math.sqrt(Math.random());

      positions[i3] = x + r * Math.cos(angle);
      positions[i3 + 1] = y + r * Math.sin(angle);
      positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
      particleIndex++;
    }

    return positions;
  }, [count, createArenaShape]);

  // Create puck shape
  const createPuckShape = useCallback((x: number, y: number): Float32Array => {
    const positions = new Float32Array(count * 3);
    const puckRadius = 0.6;
    const puckParticles = Math.floor(count * 0.05); // Small for the puck

    let particleIndex = 0;

    // Keep existing arena and paddle setup (simplified)
    const baseParticles = count - puckParticles;
    for (let i = 0; i < baseParticles; i++) {
      const i3 = i * 3;
      // Keep particles in their current positions
      positions[i3] = targetRef.current[i3];
      positions[i3 + 1] = targetRef.current[i3 + 1];
      positions[i3 + 2] = targetRef.current[i3 + 2];
    }
    particleIndex = baseParticles;

    // Add puck particles
    for (let i = 0; i < puckParticles; i++) {
      const i3 = particleIndex * 3;
      const angle = (i / puckParticles) * Math.PI * 2;
      const r = puckRadius * Math.sqrt(Math.random());

      positions[i3] = x + r * Math.cos(angle);
      positions[i3 + 1] = y + r * Math.sin(angle);
      positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
      particleIndex++;
    }

    return positions;
  }, [count]);

  // Create explosion
  const createExplosion = useCallback((x: number, y: number): Float32Array => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 5 + Math.random() * 15;

      positions[i3] = x + radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = y + radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }

    return positions;
  }, [count]);

  // Create title text
  const createTitleText = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return positions;

    canvas.width = 1024;
    canvas.height = 256;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw "CYBER" in white
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Orbitron, Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('CYBER', 100, 90);

    // Draw "AIR HOCKEY" in cyan
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 80px Orbitron, Arial';
    ctx.fillText('AIR HOCKEY', 100, 180);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels: { x: number; y: number }[] = [];

    for (let y = 0; y < canvas.height; y += 3) {
      for (let x = 0; x < canvas.width; x += 3) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i] > 128) {
          pixels.push({
            x: (x - canvas.width / 2) / 40,
            y: -(y - canvas.height / 2) / 40,
          });
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const pixel = pixels[i % pixels.length];
      const i3 = i * 3;
      positions[i3] = pixel.x + (Math.random() - 0.5) * 0.1;
      positions[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.1;
      positions[i3 + 2] = (Math.random() - 0.5) * 1;
    }

    return positions;
  }, [count]);

  // Update game state based on scroll
  const updateGameState = useCallback((progress: number) => {
    const state = gameStateRef.current;

    if (progress < 0.2) {
      // Stage 1: Arena forms
      state.stage = 'arena';
      targetRef.current.set(createArenaShape());
    } else if (progress < 0.4) {
      // Stage 2: Paddles appear
      state.stage = 'paddles';
      const paddlePositions = createPaddleShape(
        state.playerPosition.x,
        state.playerPosition.y,
        true
      );
      targetRef.current.set(paddlePositions);
    } else if (progress < 0.6) {
      // Stage 3: Puck appears
      state.stage = 'puck';
      const puckPositions = createPuckShape(state.puckPosition.x, state.puckPosition.y);
      targetRef.current.set(puckPositions);
    } else if (progress < 0.8) {
      // Stage 4: Game plays (handled by external GSAP timeline)
      state.stage = 'game';
      if (state.goalExplosion) {
        targetRef.current.set(createExplosion(0, 4));
      } else {
        const puckPositions = createPuckShape(state.puckPosition.x, state.puckPosition.y);
        targetRef.current.set(puckPositions);
      }
    } else {
      // Stage 5: Title reveal
      state.stage = 'title';
      targetRef.current.set(createTitleText());
    }
  }, [createArenaShape, createPaddleShape, createPuckShape, createExplosion, createTitleText]);

  // Set scroll progress
  const setScrollProgress = useCallback((progress: number) => {
    scrollProgressRef.current = progress;
    updateGameState(progress);
  }, [updateGameState]);

  // Update game element positions (called by GSAP)
  const updatePuckPosition = useCallback((x: number, y: number) => {
    gameStateRef.current.puckPosition = { x, y };
    if (gameStateRef.current.stage === 'game') {
      const puckPositions = createPuckShape(x, y);
      targetRef.current.set(puckPositions);
    }
  }, [createPuckShape]);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    gameStateRef.current.playerPosition = { x, y };
  }, []);

  const updateOpponentPosition = useCallback((x: number, y: number) => {
    gameStateRef.current.opponentPosition = { x, y };
  }, []);

  const triggerGoalExplosion = useCallback(() => {
    gameStateRef.current.goalExplosion = true;
    const explosionPositions = createExplosion(0, 4);
    targetRef.current.set(explosionPositions);
  }, [createExplosion]);

  const resetGoalExplosion = useCallback(() => {
    gameStateRef.current.goalExplosion = false;
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Current position
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      // Target position
      const tx = targetRef.current[i3];
      const ty = targetRef.current[i3 + 1];
      const tz = targetRef.current[i3 + 2];

      // Smooth attraction to target
      const attractionSpeed = 0.08;
      velocityRef.current[i3] += (tx - x) * attractionSpeed;
      velocityRef.current[i3 + 1] += (ty - y) * attractionSpeed;
      velocityRef.current[i3 + 2] += (tz - z) * attractionSpeed;

      // Apply damping
      const damping = 0.85;
      velocityRef.current[i3] *= damping;
      velocityRef.current[i3 + 1] *= damping;
      velocityRef.current[i3 + 2] *= damping;

      // Update position
      positions[i3] += velocityRef.current[i3];
      positions[i3 + 1] += velocityRef.current[i3 + 1];
      positions[i3 + 2] += velocityRef.current[i3 + 2];

      // Subtle float for non-explosion states
      if (!gameStateRef.current.goalExplosion) {
        positions[i3 + 1] += Math.sin(time + i * 0.01) * 0.003;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return {
    particlesRef,
    initialPositions,
    setScrollProgress,
    updatePuckPosition,
    updatePlayerPosition,
    updateOpponentPosition,
    triggerGoalExplosion,
    resetGoalExplosion,
    gameState: gameStateRef.current,
  };
}

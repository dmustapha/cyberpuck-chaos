import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleTarget {
  positions: Float32Array;
  label: string;
}

export function useParticles(count: number = 2000) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocityRef = useRef<Float32Array>(new Float32Array(count * 3));
  const targetRef = useRef<Float32Array>(new Float32Array(count * 3));
  const mouseRef = useRef({ x: 0, y: 0, z: 0 });
  const scrollProgressRef = useRef(0);
  const shockwaveRef = useRef({ active: false, strength: 0, x: 0, y: 0, z: 0 });

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

  // Text vertices generator
  const createTextShape = useCallback((text: string, scale: number = 1): Float32Array => {
    const positions = new Float32Array(count * 3);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return positions;
    
    canvas.width = 512;
    canvas.height = 256;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels: { x: number; y: number }[] = [];
    
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i] > 128) {
          pixels.push({
            x: (x - canvas.width / 2) / 25 * scale,
            y: -(y - canvas.height / 2) / 25 * scale,
          });
        }
      }
    }
    
    for (let i = 0; i < count; i++) {
      const pixel = pixels[i % pixels.length];
      const i3 = i * 3;
      positions[i3] = pixel.x + (Math.random() - 0.5) * 0.2;
      positions[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    return positions;
  }, [count]);

  // Shape generators
  const createPuckShape = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 4 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      positions[i3] = radius * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(theta);
      positions[i3 + 2] = (Math.random() - 0.5) * 1;
    }
    return positions;
  }, [count]);

  const createFeatureIcons = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    const iconCount = 3;
    const spacing = 10;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const iconIndex = Math.floor((i / count) * iconCount);
      const offsetX = (iconIndex - 1) * spacing;
      const radius = 2 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      
      positions[i3] = offsetX + radius * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(theta);
      positions[i3 + 2] = (Math.random() - 0.5) * 1;
    }
    return positions;
  }, [count]);

  const createArenaOutline = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    const width = 16;
    const height = 10;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;
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
      
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return positions;
  }, [count]);

  const createPointCollapse = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.1;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return positions;
  }, [count]);

  const createExplosion = useCallback((): Float32Array => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 30 + Math.random() * 20;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);

  // Get target based on scroll progress
  const getScrollTarget = useCallback((progress: number): ParticleTarget => {
    if (progress < 0.25) {
      return {
        positions: createTextShape('CYBER AIR HOCKEY'),
        label: 'title',
      };
    } else if (progress < 0.5) {
      return {
        positions: createPuckShape(),
        label: 'puck',
      };
    } else if (progress < 0.75) {
      return {
        positions: createFeatureIcons(),
        label: 'features',
      };
    } else if (progress < 0.95) {
      return {
        positions: createArenaOutline(),
        label: 'arena',
      };
    } else if (progress < 0.98) {
      return {
        positions: createPointCollapse(),
        label: 'collapse',
      };
    } else {
      return {
        positions: createExplosion(),
        label: 'explosion',
      };
    }
  }, [createTextShape, createPuckShape, createFeatureIcons, createArenaOutline, createPointCollapse, createExplosion]);

  // Update scroll progress
  const setScrollProgress = useCallback((progress: number) => {
    scrollProgressRef.current = progress;
    const target = getScrollTarget(progress);
    targetRef.current.set(target.positions);
  }, [getScrollTarget]);

  // Update mouse position
  const setMousePosition = useCallback((x: number, y: number, z: number = 0) => {
    mouseRef.current = { x, y, z };
  }, []);

  // Trigger shockwave
  const triggerShockwave = useCallback((x: number, y: number, z: number = 0) => {
    shockwaveRef.current = { active: true, strength: 5, x, y, z };
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
      
      // Mouse gravity
      const mouseInfluence = 0.3;
      const dx = mouseRef.current.x - x;
      const dy = mouseRef.current.y - y;
      const dz = mouseRef.current.z - z;
      const distToMouse = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const mouseForce = distToMouse > 0 ? mouseInfluence / (distToMouse * distToMouse + 1) : 0;
      
      // Shockwave
      let shockForce = 0;
      if (shockwaveRef.current.active) {
        const sdx = x - shockwaveRef.current.x;
        const sdy = y - shockwaveRef.current.y;
        const sdz = z - shockwaveRef.current.z;
        const shockDist = Math.sqrt(sdx * sdx + sdy * sdy + sdz * sdz);
        shockForce = shockwaveRef.current.strength / (shockDist + 1);
      }
      
      // Combine forces
      const attractionSpeed = 0.05;
      velocityRef.current[i3] += (tx - x) * attractionSpeed + dx * mouseForce + (x - shockwaveRef.current.x) * shockForce;
      velocityRef.current[i3 + 1] += (ty - y) * attractionSpeed + dy * mouseForce + (y - shockwaveRef.current.y) * shockForce;
      velocityRef.current[i3 + 2] += (tz - z) * attractionSpeed + dz * mouseForce + (z - shockwaveRef.current.z) * shockForce;
      
      // Apply damping
      const damping = 0.9;
      velocityRef.current[i3] *= damping;
      velocityRef.current[i3 + 1] *= damping;
      velocityRef.current[i3 + 2] *= damping;
      
      // Update position
      positions[i3] += velocityRef.current[i3];
      positions[i3 + 1] += velocityRef.current[i3 + 1];
      positions[i3 + 2] += velocityRef.current[i3 + 2];
      
      // Subtle float
      positions[i3 + 1] += Math.sin(time + i * 0.01) * 0.005;
    }
    
    // Decay shockwave
    if (shockwaveRef.current.active) {
      shockwaveRef.current.strength *= 0.95;
      if (shockwaveRef.current.strength < 0.01) {
        shockwaveRef.current.active = false;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return {
    particlesRef,
    initialPositions,
    setScrollProgress,
    setMousePosition,
    triggerShockwave,
  };
}

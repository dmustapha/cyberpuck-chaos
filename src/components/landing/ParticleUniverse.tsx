'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useParticles } from './useParticles';

interface ParticleSystemProps {
  scrollProgress: number;
  onMouseMove?: (x: number, y: number) => void;
  onClick?: (x: number, y: number) => void;
}

function ParticleSystem({ scrollProgress, onMouseMove, onClick }: ParticleSystemProps) {
  const { camera, viewport, raycaster, pointer } = useThree();
  const {
    particlesRef,
    initialPositions,
    setScrollProgress,
    setMousePosition,
    triggerShockwave,
  } = useParticles(2000);

  // Track scroll changes
  useEffect(() => {
    setScrollProgress(scrollProgress);
  }, [scrollProgress, setScrollProgress]);

  // Track mouse movement in 3D space
  useEffect(() => {
    const handlePointerMove = () => {
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      setMousePosition(x, y, 0);
      onMouseMove?.(pointer.x, pointer.y);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [pointer, viewport, setMousePosition, onMouseMove]);

  // Track clicks for shockwave
  useEffect(() => {
    const handleClick = () => {
      const x = (pointer.x * viewport.width) / 2;
      const y = (pointer.y * viewport.height) / 2;
      triggerShockwave(x, y, 0);
      onClick?.(pointer.x, pointer.y);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [pointer, viewport, triggerShockwave, onClick]);

  // Create varying particle colors
  const colors = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000; i++) {
    const isAccent = Math.random() > 0.9;
    if (isAccent) {
      // Amber accent
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.75;
      colors[i * 3 + 2] = 0.2;
    } else {
      // Cyan primary
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0.94;
      colors[i * 3 + 2] = 1;
    }
  }

  return (
    <>
      <Points ref={particlesRef} positions={initialPositions}>
        <PointMaterial
          transparent
          vertexColors
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
        <bufferAttribute
          attach="geometry-attributes-color"
          args={[colors, 3]}
        />
      </Points>

      {/* Ambient nebula glow */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color="#001a33"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle light */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00f0ff" />
    </>
  );
}

export interface ParticleUniverseProps {
  scrollProgress: number;
  className?: string;
}

export function ParticleUniverse({ scrollProgress, className = '' }: ParticleUniverseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorTrailRef = useRef<HTMLDivElement>(null);

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cursorTrailRef.current) return;
      
      const trail = document.createElement('div');
      trail.className = 'particle-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      cursorTrailRef.current.appendChild(trail);
      
      setTimeout(() => trail.remove(), 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <ParticleSystem scrollProgress={scrollProgress} />
      </Canvas>

      {/* Cursor trails container */}
      <div
        ref={cursorTrailRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80" />

      <style jsx>{`
        .particle-trail {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: trail-fade 1s ease-out forwards;
          transform: translate(-50%, -50%);
        }

        @keyframes trail-fade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}

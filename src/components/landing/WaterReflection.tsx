'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface WaterReflectionProps {
  ripples: Array<{ x: number; y: number; age: number; id: number }>;
}

export function WaterReflection({ ripples }: WaterReflectionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Create custom shader material for water with ripple distortion
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        rippleData: { value: new Float32Array(100) },
        rippleCount: { value: 0 },
        color: { value: new THREE.Color('#0a1628') },
        highlightColor: { value: new THREE.Color('#00f0ff') },
      },
      vertexShader: `
        uniform float time;
        uniform float rippleData[100];
        uniform int rippleCount;

        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
          vUv = uv;
          vec3 pos = position;

          float displacement = 0.0;

          // Apply ripple distortions
          for(int i = 0; i < 10; i++) {
            if(i >= rippleCount) break;

            int idx = i * 4;
            float rippleX = rippleData[idx];
            float rippleY = rippleData[idx + 1];
            float age = rippleData[idx + 2];
            float strength = rippleData[idx + 3];

            vec2 ripplePos = vec2(rippleX, rippleY);
            float dist = distance(uv, ripplePos);

            // Create expanding ripple wave
            float wave = sin((dist - age * 0.5) * 20.0) * strength * 0.15;
            wave *= smoothstep(1.0, 0.0, age);
            wave *= smoothstep(0.5, 0.0, dist);

            displacement += wave;
          }

          // Add gentle base wave motion
          displacement += sin(pos.x * 3.0 + time * 0.5) * 0.03;
          displacement += cos(pos.y * 2.0 + time * 0.3) * 0.02;

          pos.z += displacement;
          vDisplacement = displacement;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 highlightColor;
        uniform float time;

        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
          // Base water color
          vec3 waterColor = color;

          // Add cyan highlights on wave peaks
          float highlight = smoothstep(0.02, 0.08, vDisplacement);
          waterColor = mix(waterColor, highlightColor, highlight * 0.6);

          // Add subtle shimmer
          float shimmer = sin(vUv.x * 50.0 + time) * sin(vUv.y * 50.0 + time * 0.7);
          shimmer = smoothstep(0.8, 1.0, shimmer) * 0.1;
          waterColor += highlightColor * shimmer;

          // Depth gradient - darker at bottom
          float depth = 1.0 - vUv.y;
          waterColor = mix(waterColor, color * 0.3, depth * 0.5);

          // Edge fade for seamless blend
          float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
          edgeFade *= smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);

          gl_FragColor = vec4(waterColor, 0.9 * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  // Update ripple data every frame
  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.time.value = state.clock.getElapsedTime();

    // Update ripple uniforms
    const rippleData = new Float32Array(100);
    const activeRipples = ripples.slice(0, 10);

    activeRipples.forEach((ripple, i) => {
      const idx = i * 4;
      rippleData[idx] = ripple.x;
      rippleData[idx + 1] = ripple.y;
      rippleData[idx + 2] = ripple.age;
      rippleData[idx + 3] = 1.0 - ripple.age;
    });

    material.uniforms.rippleData.value = rippleData;
    material.uniforms.rippleCount.value = activeRipples.length;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      material={waterMaterial}
    >
      <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5, 128, 128]} />
    </mesh>
  );
}

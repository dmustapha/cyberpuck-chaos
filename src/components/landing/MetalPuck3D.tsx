'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';
import gsap from 'gsap';

interface MetalPuck3DProps {
  scrollProgress: MotionValue<number>;
}

export function MetalPuck3D({ scrollProgress }: MetalPuck3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  // Track current morph stage
  const morphStage = useRef(0);
  const previousProgress = useRef(0);

  // Create geometries for morphing
  const geometries = useMemo(() => {
    return {
      // Stage 1: Puck (flattened sphere)
      puck: new THREE.SphereGeometry(2, 64, 64),
      
      // Stage 2: Trophy (extruded shape)
      trophy: createTrophyGeometry(),
      
      // Stage 3: Hexagon badge
      hexagon: createHexagonGeometry(),
      
      // Stage 4: Stats ring (torus)
      statsRing: new THREE.TorusGeometry(2, 0.5, 32, 64),
      
      // Stage 5: Game table (box)
      gameTable: new THREE.BoxGeometry(4, 0.3, 3, 32, 32, 32),
    };
  }, []);

  // Setup morph attributes
  useEffect(() => {
    if (!meshRef.current) return;

    const puckGeo = geometries.puck;
    const positions = puckGeo.attributes.position;

    // Scale puck to be flatter
    const puckPositions = new Float32Array(positions.array);
    for (let i = 0; i < puckPositions.length; i += 3) {
      puckPositions[i + 1] *= 0.4; // Flatten Y axis
    }
    
    puckGeo.setAttribute('position', new THREE.BufferAttribute(puckPositions, 3));
    puckGeo.computeVertexNormals();
  }, [geometries]);

  // Smooth morphing with GSAP
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (latest) => {
      if (!meshRef.current) return;

      const delta = latest - previousProgress.current;
      previousProgress.current = latest;

      // Determine target stage based on scroll
      let targetStage = 0;
      if (latest >= 0.8) targetStage = 4;
      else if (latest >= 0.6) targetStage = 3;
      else if (latest >= 0.4) targetStage = 2;
      else if (latest >= 0.2) targetStage = 1;

      // Only morph if stage changed
      if (targetStage !== morphStage.current) {
        const geometryKeys = Object.keys(geometries) as (keyof typeof geometries)[];
        const targetGeometry = geometries[geometryKeys[targetStage]];
        
        morphStage.current = targetStage;
        
        // Smooth transition using GSAP
        gsap.to(meshRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.2,
          ease: 'power3.inOut',
        });

        // Rotate during transition for liquid effect
        gsap.to(meshRef.current.rotation, {
          y: meshRef.current.rotation.y + Math.PI * 0.5,
          duration: 1.2,
          ease: 'power3.inOut',
        });

        // Morph geometry
        morphGeometry(meshRef.current, targetGeometry, 1.2);
      }

      // Continuous slow rotation
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    });

    return () => unsubscribe();
  }, [scrollProgress, geometries]);

  // Ambient rotation and floating animation
  useFrame((state) => {
    if (!meshRef.current) return;

    // Gentle floating motion
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    
    // Slow ambient rotation
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <>
      {/* HDR Environment for realistic reflections */}
      <Environment preset="studio" />
      
      {/* Key lights for chrome effect */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      
      {/* Liquid metal puck */}
      <mesh ref={meshRef} geometry={geometries.puck}>
        <meshStandardMaterial
          ref={materialRef}
          metalness={1}
          roughness={0.08}
          envMapIntensity={1.2}
          color="#e8e8e8"
        />
      </mesh>

      {/* Rim light for edge glow */}
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#88aaff" />
    </>
  );
}

// Helper: Morph between geometries smoothly
function morphGeometry(
  mesh: THREE.Mesh,
  targetGeometry: THREE.BufferGeometry,
  duration: number
) {
  const currentGeometry = mesh.geometry;
  const currentPositions = currentGeometry.attributes.position.array as Float32Array;
  const targetPositions = targetGeometry.attributes.position.array as Float32Array;

  // Ensure same vertex count (simplified - in production use proper morphing)
  const minLength = Math.min(currentPositions.length, targetPositions.length);
  
  const startPositions = new Float32Array(currentPositions);
  
  gsap.to({ progress: 0 }, {
    progress: 1,
    duration,
    ease: 'power3.inOut',
    onUpdate: function() {
      const progress = this.targets()[0].progress;
      
      for (let i = 0; i < minLength; i++) {
        currentPositions[i] = THREE.MathUtils.lerp(
          startPositions[i],
          targetPositions[i],
          progress
        );
      }
      
      currentGeometry.attributes.position.needsUpdate = true;
      currentGeometry.computeVertexNormals();
    },
  });
}

// Create trophy geometry
function createTrophyGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  
  // Trophy cup outline
  shape.moveTo(-1, 0);
  shape.lineTo(-1, 1.5);
  shape.quadraticCurveTo(-1, 2, -0.5, 2.2);
  shape.lineTo(0.5, 2.2);
  shape.quadraticCurveTo(1, 2, 1, 1.5);
  shape.lineTo(1, 0);
  shape.lineTo(0.3, 0);
  shape.lineTo(0.3, -1.5);
  shape.lineTo(0.8, -1.5);
  shape.lineTo(0.8, -2);
  shape.lineTo(-0.8, -2);
  shape.lineTo(-0.8, -1.5);
  shape.lineTo(-0.3, -1.5);
  shape.lineTo(-0.3, 0);
  shape.lineTo(-1, 0);

  const extrudeSettings = {
    steps: 2,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 8,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// Create hexagon geometry
function createHexagonGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const sides = 6;
  const radius = 2;

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.15,
    bevelSegments: 16,
  };

  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

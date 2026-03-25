'use client';

import { Canvas } from '@react-three/fiber';
import { MetalPuck3D } from './MetalPuck3D';
import { MotionValue } from 'framer-motion';

interface MorphShapeProps {
  scrollProgress: MotionValue<number>;
}

export function MorphShape({ scrollProgress }: MorphShapeProps) {
  return (
    <div className="w-[600px] h-[600px] mx-auto">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance' 
        }}
      >
        <MetalPuck3D scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';
import gsap from 'gsap';
import * as THREE from 'three';

interface ScrollMorphProps {
  scrollProgress: MotionValue<number>;
  onStageChange?: (stage: number) => void;
}

export function useScrollMorph({ scrollProgress, onStageChange }: ScrollMorphProps) {
  const currentStage = useRef(0);

  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (latest) => {
      let newStage = 0;
      
      if (latest >= 0.8) newStage = 4;
      else if (latest >= 0.6) newStage = 3;
      else if (latest >= 0.4) newStage = 2;
      else if (latest >= 0.2) newStage = 1;

      if (newStage !== currentStage.current) {
        currentStage.current = newStage;
        onStageChange?.(newStage);
      }
    });

    return () => unsubscribe();
  }, [scrollProgress, onStageChange]);

  return currentStage.current;
}

// Type guard to check if element is a Three.js Object3D
function isObject3D(element: HTMLElement | THREE.Object3D): element is THREE.Object3D {
  return 'scale' in element && element.scale instanceof THREE.Vector3;
}

// Morph timeline creator for smooth transitions
export function createMorphTimeline(
  element: HTMLElement | THREE.Object3D,
  fromStage: number,
  toStage: number
) {
  const timeline = gsap.timeline({
    defaults: {
      duration: 1.2,
      ease: 'power3.inOut',
    },
  });

  // Get the target based on element type
  const target = isObject3D(element) ? element.scale : element;

  // Add liquid squash and stretch effect
  timeline
    .to(target, {
      scaleY: 0.8,
      scaleX: 1.1,
      duration: 0.3,
    })
    .to(target, {
      scaleY: 1.1,
      scaleX: 0.9,
      duration: 0.3,
    })
    .to(target, {
      scaleY: 1,
      scaleX: 1,
      duration: 0.6,
    });

  return timeline;
}

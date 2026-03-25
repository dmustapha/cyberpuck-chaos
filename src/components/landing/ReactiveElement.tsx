'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

interface ReactiveElementProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  type?: 'bounce' | 'shake' | 'ripple';
}

export function ReactiveElement({
  children,
  className = '',
  intensity = 'medium',
  type = 'bounce'
}: ReactiveElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);
  const [isNear, setIsNear] = useState(false);
  const particleIdRef = useRef(0);

  // Intensity settings
  const settings = {
    low: { distance: 60, bounce: 8, duration: 0.3 },
    medium: { distance: 80, bounce: 15, duration: 0.4 },
    high: { distance: 100, bounce: 25, duration: 0.5 }
  }[intensity];

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      // Check proximity
      if (distance < settings.distance) {
        setIsNear(true);

        // Calculate angle for direction-based reaction
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const pushX = -Math.cos(angle) * settings.bounce;
        const pushY = -Math.sin(angle) * settings.bounce;

        if (type === 'bounce') {
          gsap.to(element, {
            x: pushX,
            y: pushY,
            duration: 0.2,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(element, {
                x: 0,
                y: 0,
                duration: settings.duration,
                ease: 'elastic.out(1, 0.3)'
              });
            }
          });
        } else if (type === 'shake') {
          gsap.to(element, {
            x: `+=${Math.random() * 6 - 3}`,
            y: `+=${Math.random() * 6 - 3}`,
            rotation: `+=${Math.random() * 4 - 2}`,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: 'power2.inOut',
            onComplete: () => {
              gsap.to(element, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }
          });
        }

        // Create particle burst on contact
        if (distance < settings.distance * 0.5) {
          createParticleBurst(e.clientX, e.clientY);
        }
      } else {
        setIsNear(false);
      }
    };

    const createParticleBurst = (x: number, y: number) => {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        x,
        y,
        id: particleIdRef.current++
      }));

      setParticles(prev => [...prev, ...newParticles]);

      // Remove particles after animation
      setTimeout(() => {
        setParticles(prev =>
          prev.filter(p => !newParticles.find(np => np.id === p.id))
        );
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [settings, type]);

  return (
    <>
      {/* Particle effects */}
      {particles.map((particle, index) => {
        const angle = (index / 6) * Math.PI * 2;
        const distance = 50;
        const targetX = particle.x + Math.cos(angle) * distance;
        const targetY = particle.y + Math.sin(angle) * distance;

        return (
          <motion.div
            key={particle.id}
            className="fixed pointer-events-none z-30"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 1
            }}
            animate={{
              x: targetX,
              y: targetY,
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut'
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              style={{
                boxShadow: '0 0 8px rgba(34, 211, 238, 0.8)'
              }}
            />
          </motion.div>
        );
      })}

      {/* Reactive element */}
      <div ref={elementRef} className={`relative ${className}`}>
        {/* Proximity glow effect */}
        {isNear && type === 'ripple' && (
          <motion.div
            className="absolute inset-0 -m-2 rounded-lg pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
              filter: 'blur(10px)'
            }}
          />
        )}

        {/* Pulse effect when near */}
        <motion.div
          animate={isNear ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, repeat: isNear ? Infinity : 0 }}
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}

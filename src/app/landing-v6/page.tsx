'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Dynamic imports for Three.js components (SSR disabled)
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false });
const WaterReflection = dynamic(() => import('@/components/landing/WaterReflection').then(mod => mod.WaterReflection), { ssr: false });

interface Ripple {
  x: number;
  y: number;
  age: number;
  id: number;
}

export default function ReflectionPoolLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [mounted, setMounted] = useState(false);
  const rippleIdRef = useRef(0);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Set mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Create ripple on mouse move (throttled)
  useEffect(() => {
    let lastRippleTime = 0;
    const minInterval = 150; // ms between ripples
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const now = Date.now();
      if (now - lastRippleTime < minInterval) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
      
      // Create new ripple
      const newRipple: Ripple = {
        x,
        y,
        age: 0,
        id: rippleIdRef.current++,
      };
      
      setRipples((prev) => [...prev, newRipple]);
      lastRippleTime = now;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Age and remove old ripples
  useEffect(() => {
    const interval = setInterval(() => {
      setRipples((prev) => {
        const updated = prev
          .map((ripple) => ({
            ...ripple,
            age: ripple.age + 0.05,
          }))
          .filter((ripple) => ripple.age < 1);
        
        return updated;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#0a1628]"
    >
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Top half: Content floating above water */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center px-6"
        >
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8"
            style={{
              fontFamily: 'var(--font-orbitron)',
              color: '#00ffff',
              textShadow: `
                0 0 10px rgba(0, 255, 255, 0.8),
                0 0 20px rgba(0, 255, 255, 0.6),
                0 0 30px rgba(0, 255, 255, 0.4),
                0 0 40px rgba(0, 255, 255, 0.2)
              `,
            }}
            animate={{
              textShadow: [
                `0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6)`,
                `0 0 15px rgba(0, 255, 255, 1), 0 0 30px rgba(0, 255, 255, 0.8)`,
                `0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6)`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            CYBER
            <br />
            AIR HOCKEY
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              className="pointer-events-auto px-12 py-5 text-xl font-bold tracking-wider relative overflow-hidden group"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#0a1628',
                background: 'linear-gradient(135deg, #00ffff 0%, #00cccc 100%)',
                border: '2px solid #00ffff',
                boxShadow: `
                  0 0 20px rgba(0, 255, 255, 0.5),
                  inset 0 0 20px rgba(255, 255, 255, 0.1)
                `,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `
                  0 0 30px rgba(0, 255, 255, 0.8),
                  inset 0 0 30px rgba(255, 255, 255, 0.2)
                `,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">ENTER ARENA</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Water reflection with Three.js */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 5, 0], fov: 45, near: 0.1, far: 1000 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff" />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#0066cc" />
          
          <WaterReflection ripples={ripples} />
        </Canvas>
      </div>

      {/* Ripple overlay effects (CSS) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-cyan-400/40"
            style={{
              left: `${ripple.x * 100}%`,
              top: `${ripple.y * 100}%`,
              width: 0,
              height: 0,
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{
              width: 300,
              height: 300,
              opacity: 0,
              x: -150,
              y: -150,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Bottom gradient to blend water */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/50 to-transparent pointer-events-none z-20" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

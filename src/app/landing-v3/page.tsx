'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { PhysicsCanvas } from '@/components/landing/PhysicsCanvas';
import gsap from 'gsap';

export default function LandingV3() {
  const [stats, setStats] = useState({
    pucksHit: 0,
    topSpeed: 0,
    chaosLevel: 0
  });
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; radius: number } | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pucksHitRef = useRef<HTMLSpanElement>(null);
  const topSpeedRef = useRef<HTMLSpanElement>(null);
  const chaosLevelRef = useRef<HTMLSpanElement>(null);
  
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Update target position when CTA is visible
  useEffect(() => {
    const updateCtaPosition = () => {
      if (ctaRef.current && heroRef.current) {
        const ctaRect = ctaRef.current.getBoundingClientRect();
        const heroRect = heroRef.current.getBoundingClientRect();
        
        setTargetPosition({
          x: ctaRect.left + ctaRect.width / 2 - heroRect.left,
          y: ctaRect.top + ctaRect.height / 2 - heroRect.top,
          radius: Math.max(ctaRect.width, ctaRect.height) / 2 + 20
        });
      }
    };

    updateCtaPosition();
    window.addEventListener('resize', updateCtaPosition);
    window.addEventListener('scroll', updateCtaPosition);

    return () => {
      window.removeEventListener('resize', updateCtaPosition);
      window.removeEventListener('scroll', updateCtaPosition);
    };
  }, []);

  // Animate stats with GSAP
  const animateCounter = (ref: React.RefObject<HTMLSpanElement | null>, value: number, decimals: number = 0) => {
    if (!ref.current) return;
    
    const current = parseFloat(ref.current.textContent || '0');
    const element = ref.current;
    
    gsap.to({ value: current }, {
      value,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: function() {
        if (element) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          element.textContent = (this.targets()[0] as any).value.toFixed(decimals);
        }
      }
    });
  };

  const handlePuckHit = (count: number) => {
    setStats(prev => {
      const newHit = prev.pucksHit + count;
      animateCounter(pucksHitRef, newHit);
      return { ...prev, pucksHit: newHit };
    });

    // Screen shake on hit
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  };

  const handleChaosChange = (level: number) => {
    if (Math.abs(level - stats.chaosLevel) > 5) {
      setStats(prev => {
        animateCounter(chaosLevelRef, level, 0);
        return { ...prev, chaosLevel: level };
      });
    }
  };

  const handlePlayNow = () => {
    // Celebration animation
    if (ctaRef.current) {
      const tl = gsap.timeline();
      
      // Button explode
      tl.to(ctaRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Confetti-like particles (handled by PhysicsCanvas)
      setTimeout(() => {
        window.location.href = '/game'; // Navigate to game
      }, 800);
    }
  };

  const features = [
    {
      icon: '⚡',
      title: 'Real Physics',
      description: 'Every collision calculated in real-time at 60fps with momentum transfer and energy conservation.'
    },
    {
      icon: '🎯',
      title: 'Addictive Gameplay',
      description: 'Use your cursor as a paddle. Hit pucks, create chaos, watch the particle explosions.'
    },
    {
      icon: '🌊',
      title: 'Fluid Motion',
      description: 'Smooth trails, wall bounces, and puck-to-puck interactions that feel natural and satisfying.'
    },
    {
      icon: '💫',
      title: 'Visual Feedback',
      description: 'Speed sparks, collision glows, and explosion particles reward every interaction.'
    }
  ];

  return (
    <main className="min-h-screen bg-[#030308] text-white overflow-x-hidden">
      {/* Hero Section with Physics */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
        <PhysicsCanvas
          onPuckHit={handlePuckHit}
          onChaosChange={handleChaosChange}
          targetPosition={targetPosition}
        />
        
        {/* Hero Content */}
        <motion.div 
          style={{ opacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight font-[family-name:var(--font-orbitron)]">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#00d4ff] to-[#00f0ff] bg-clip-text text-transparent">
                PHYSICS
              </span>
            </h1>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-[family-name:var(--font-orbitron)]">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#009cff] to-[#00d4ff] bg-clip-text text-transparent">
                PLAYGROUND
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Move your cursor. Hit the pucks. Create chaos.
            </p>

            <div ref={ctaRef}>
              <motion.button
                onClick={handlePlayNow}
                className="relative group px-12 py-6 text-2xl font-bold rounded-full overflow-hidden font-[family-name:var(--font-orbitron)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#0080ff]"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#00f0ff] opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
                
                <span className="relative z-10 text-[#030308]">PLAY NOW</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Cursor hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#00f0ff] text-sm"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wider">Move your cursor</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M19 12l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="sticky top-0 z-20 bg-[#030308]/80 backdrop-blur-md border-b border-[#00f0ff]/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#00f0ff]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span ref={pucksHitRef}>0</span>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Pucks Hit</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00f0ff]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span ref={topSpeedRef}>0</span>
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Top Speed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00f0ff]" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span ref={chaosLevelRef}>0</span>%
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wider mt-2">Chaos Level</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#00f0ff] to-[#0080ff] bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real physics simulation meets addictive gameplay
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-[#0080ff]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                
                <div className="relative bg-[#030308] border border-[#00f0ff]/20 rounded-2xl p-8 h-full hover:border-[#00f0ff]/40 transition-colors duration-300">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-[#00f0ff] font-[family-name:var(--font-orbitron)]">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-[#00f0ff] via-[#00d4ff] to-[#00f0ff] bg-clip-text text-transparent"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              Ready to Play?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join thousands of players experiencing the most addictive physics playground ever created.
            </p>

            <motion.button
              onClick={handlePlayNow}
              className="relative group px-16 py-8 text-3xl font-bold rounded-full overflow-hidden"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#00f0ff] to-[#0080ff]"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              />
              
              <div className="absolute inset-0 bg-[#00f0ff] opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-300" />
              
              <span className="relative z-10 text-[#030308]">START PLAYING</span>
            </motion.button>
          </motion.div>
        </div>
      </section>


    </main>
  );
}

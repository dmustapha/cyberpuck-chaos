'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { MorphShape } from './MorphShape';
import { useRef } from 'react';

interface ScrollStage {
  range: [number, number];
  title: string;
  subtitle: string;
}

const stages: ScrollStage[] = [
  {
    range: [0, 0.2],
    title: 'AIR HOCKEY',
    subtitle: 'Where precision meets velocity in the ultimate arena',
  },
  {
    range: [0.2, 0.4],
    title: 'COMPETE',
    subtitle: 'Face opponents worldwide in real-time battles',
  },
  {
    range: [0.4, 0.6],
    title: 'ASCEND',
    subtitle: 'Rise through elite divisions with every victory',
  },
  {
    range: [0.6, 0.8],
    title: 'EVOLVE',
    subtitle: 'Track performance. Master technique. Dominate.',
  },
  {
    range: [0.8, 1],
    title: 'BEGIN',
    subtitle: 'Your arena awaits',
  },
];

export function LiquidMetalPuck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const getCurrentStage = (progress: number): ScrollStage => {
    return (
      stages.find(
        (stage) => progress >= stage.range[0] && progress < stage.range[1]
      ) || stages[stages.length - 1]
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed viewport for morphing shape */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background gradient - deeper, darker */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a20] via-[#030308] to-[#000000]" />

        {/* Multi-layered ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-400/6 rounded-full blur-[80px]" />

        {/* Morphing shape */}
        <motion.div
          className="relative z-10"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
          }}
        >
          <MorphShape scrollProgress={scrollYProgress} />
        </motion.div>

        {/* Title and subtitle - refined typography */}
        <motion.div
          className="absolute bottom-32 left-0 right-0 text-center px-8 max-w-5xl mx-auto"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]),
          }}
        >
          <AnimatedText scrollProgress={scrollYProgress} stages={stages} />
        </motion.div>

        {/* CTA button - premium glass morphism */}
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
          style={{
            opacity: useTransform(scrollYProgress, [0.75, 0.82, 0.95, 1], [0, 1, 1, 0]),
            scale: useTransform(scrollYProgress, [0.75, 0.82], [0.85, 1]),
            y: useTransform(scrollYProgress, [0.75, 0.82], [20, 0]),
          }}
        >
          <button className="group relative px-16 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-out" />
            
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <span className="relative text-white font-medium text-xl tracking-[0.2em] uppercase">
              Enter Arena
            </span>
          </button>
        </motion.div>

        {/* Scroll indicator - minimal and elegant */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.08], [1, 0]),
          }}
        >
          <span className="text-white/30 text-xs uppercase tracking-[0.3em] font-light">
            Scroll
          </span>
          <motion.div
            className="w-5 h-9 border border-white/15 rounded-full flex items-start justify-center p-1.5"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className="w-1 h-1 bg-white/80 rounded-full"
              animate={{
                y: [0, 14, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Spacer to enable scroll */}
      <div className="h-[400vh]" />
    </div>
  );
}

function AnimatedText({
  scrollProgress,
  stages,
}: {
  scrollProgress: any;
  stages: ScrollStage[];
}) {
  return (
    <div className="relative min-h-[200px]">
      {stages.map((stage, index) => {
        const progress = scrollProgress.get();
        const isActive = progress >= stage.range[0] && progress < stage.range[1];
        
        // Calculate smooth transition values
        const fadeInStart = stage.range[0];
        const fadeInEnd = stage.range[0] + 0.05;
        const fadeOutStart = stage.range[1] - 0.05;
        const fadeOutEnd = stage.range[1];
        
        let opacity = 0;
        if (progress >= fadeInStart && progress < fadeInEnd) {
          opacity = (progress - fadeInStart) / (fadeInEnd - fadeInStart);
        } else if (progress >= fadeInEnd && progress < fadeOutStart) {
          opacity = 1;
        } else if (progress >= fadeOutStart && progress < fadeOutEnd) {
          opacity = 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
        }

        return (
          <motion.div
            key={index}
            className="absolute inset-0 text-center flex flex-col items-center justify-center"
            style={{
              opacity,
              y: isActive ? 0 : 30,
              filter: isActive ? 'blur(0px)' : 'blur(10px)',
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
            }}
          >
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 tracking-tight"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, rgba(255,255,255,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                textShadow: '0 0 40px rgba(255,255,255,0.1)',
              }}
            >
              {stage.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-white/50 max-w-2xl mx-auto font-light tracking-wide leading-relaxed">
              {stage.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

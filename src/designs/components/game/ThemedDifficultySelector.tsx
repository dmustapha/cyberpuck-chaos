'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedCard } from '../ui/ThemedCard';
import { ThemedButton } from '../ui/ThemedButton';

type Difficulty = 'easy' | 'medium' | 'hard';

interface ThemedDifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

export function ThemedDifficultySelector({ onSelect, onBack }: ThemedDifficultySelectorProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const difficulties = [
    {
      id: 'easy' as Difficulty,
      title: 'Easy',
      description: 'Perfect for beginners',
      icon: '🌱',
      color: styles.colors.success,
      stats: ['Slower AI', 'Forgiving gameplay', '+50% XP'],
    },
    {
      id: 'medium' as Difficulty,
      title: 'Medium',
      description: 'Balanced challenge',
      icon: '⚡',
      color: styles.colors.warning,
      stats: ['Standard AI', 'Competitive play', '+100% XP'],
    },
    {
      id: 'hard' as Difficulty,
      title: 'Hard',
      description: 'For experienced players',
      icon: '🔥',
      color: styles.colors.error,
      stats: ['Fast AI', 'Intense gameplay', '+200% XP'],
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h1
            style={{
              fontFamily: styles.fonts.heading,
              fontSize: styles.fontSize['5xl'],
              fontWeight: 900,
              background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: config.effects.glowIntensity > 15
                ? styles.shadows.glowText(styles.colors.primary)
                : 'none',
              marginBottom: '1rem',
            }}
          >
            SELECT DIFFICULTY
          </h1>
          <p
            style={{
              fontFamily: styles.fonts.body,
              fontSize: styles.fontSize.lg,
              color: styles.colors.text.secondary,
            }}
          >
            Choose your challenge level
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {difficulties.map((difficulty, index) => (
            <motion.div
              key={difficulty.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ThemedCard hoverable clickable onClick={() => onSelect(difficulty.id)}>
                <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 1rem auto',
                      borderRadius: styles.borderRadius.full,
                      background: `linear-gradient(135deg, ${difficulty.color}, ${styles.colors.secondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      boxShadow: styles.shadows.glowStrong(difficulty.color),
                    }}
                  >
                    {difficulty.icon}
                  </motion.div>

                  <h2
                    style={{
                      fontFamily: styles.fonts.heading,
                      fontSize: styles.fontSize.xl,
                      fontWeight: 700,
                      color: styles.colors.text.primary,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {difficulty.title}
                  </h2>

                  <p
                    style={{
                      fontFamily: styles.fonts.body,
                      fontSize: styles.fontSize.sm,
                      color: styles.colors.text.secondary,
                      marginBottom: '1rem',
                    }}
                  >
                    {difficulty.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {difficulty.stats.map((stat) => (
                      <div
                        key={stat}
                        style={{
                          fontFamily: styles.fonts.body,
                          fontSize: styles.fontSize.xs,
                          color: styles.colors.text.muted,
                          padding: '0.25rem 0.5rem',
                          backgroundColor: styles.colors.bg.secondary,
                          borderRadius: styles.borderRadius.sm,
                        }}
                      >
                        {stat}
                      </div>
                    ))}
                  </div>
                </div>
              </ThemedCard>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <ThemedButton variant="ghost" onClick={onBack}>
            Back to Mode Selection
          </ThemedButton>
        </div>
      </div>
    </div>
  );
}

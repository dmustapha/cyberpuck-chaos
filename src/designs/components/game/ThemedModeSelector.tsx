'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedCard } from '../ui/ThemedCard';

type GameMode = 'ai' | 'multiplayer';

interface ThemedModeSelectorProps {
  onSelect: (mode: GameMode) => void;
}

export function ThemedModeSelector({ onSelect }: ThemedModeSelectorProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const modes = [
    {
      id: 'ai' as GameMode,
      title: 'VS AI',
      description: 'Challenge our intelligent AI opponents',
      icon: '🤖',
      color: styles.colors.primary,
    },
    {
      id: 'multiplayer' as GameMode,
      title: 'Multiplayer',
      description: 'Play against another player locally',
      icon: '👥',
      color: styles.colors.secondary,
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
      <div style={{ maxWidth: '800px', width: '100%' }}>
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
            SELECT MODE
          </h1>
          <p
            style={{
              fontFamily: styles.fonts.body,
              fontSize: styles.fontSize.lg,
              color: styles.colors.text.secondary,
            }}
          >
            Choose how you want to play
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ThemedCard hoverable clickable onClick={() => onSelect(mode.id)}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto 1.5rem auto',
                      borderRadius: styles.borderRadius.full,
                      background: `linear-gradient(135deg, ${mode.color}, ${styles.colors.secondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '50px',
                      boxShadow: styles.shadows.glowStrong(mode.color),
                    }}
                  >
                    {mode.icon}
                  </motion.div>

                  <h2
                    style={{
                      fontFamily: styles.fonts.heading,
                      fontSize: styles.fontSize['2xl'],
                      fontWeight: 700,
                      color: styles.colors.text.primary,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {mode.title}
                  </h2>

                  <p
                    style={{
                      fontFamily: styles.fonts.body,
                      fontSize: styles.fontSize.base,
                      color: styles.colors.text.secondary,
                    }}
                  >
                    {mode.description}
                  </p>
                </div>
              </ThemedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedButton } from '../ui/ThemedButton';
import { ThemedCard } from '../ui/ThemedCard';

interface ThemedPauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function ThemedPauseMenu({ onResume, onRestart, onQuit }: ThemedPauseMenuProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${styles.colors.bg.primary}dd`,
        backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onResume();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <ThemedCard glow padding="lg">
          <div style={{ minWidth: '400px', textAlign: 'center' }}>
            <motion.h1
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                fontFamily: styles.fonts.heading,
                fontSize: styles.fontSize['4xl'],
                fontWeight: 900,
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: config.effects.glowIntensity > 15
                  ? styles.shadows.glowText(styles.colors.primary)
                  : 'none',
                marginBottom: '2rem',
              }}
            >
              PAUSED
            </motion.h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ThemedButton variant="primary" size="lg" fullWidth onClick={onResume}>
                Resume Game
              </ThemedButton>

              <ThemedButton variant="secondary" size="lg" fullWidth onClick={onRestart}>
                Restart Match
              </ThemedButton>

              <ThemedButton variant="ghost" size="lg" fullWidth onClick={onQuit}>
                Quit to Menu
              </ThemedButton>
            </div>

            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: styles.colors.bg.secondary,
                borderRadius: styles.borderRadius.md,
                border: `1px solid ${styles.colors.border.subtle}`,
              }}
            >
              <p
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.sm,
                  color: styles.colors.text.muted,
                  marginBottom: '0.5rem',
                }}
              >
                Controls
              </p>
              <div
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.xs,
                  color: styles.colors.text.secondary,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div>
                  <kbd
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: styles.colors.bg.primary,
                      borderRadius: styles.borderRadius.sm,
                      border: `1px solid ${styles.colors.border.subtle}`,
                      marginRight: '0.5rem',
                    }}
                  >
                    ESC
                  </kbd>
                  Pause/Resume
                </div>
                <div>
                  <kbd
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: styles.colors.bg.primary,
                      borderRadius: styles.borderRadius.sm,
                      border: `1px solid ${styles.colors.border.subtle}`,
                      marginRight: '0.5rem',
                    }}
                  >
                    Mouse
                  </kbd>
                  Move Paddle
                </div>
              </div>
            </div>
          </div>
        </ThemedCard>
      </motion.div>
    </motion.div>
  );
}

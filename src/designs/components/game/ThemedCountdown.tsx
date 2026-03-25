'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';

interface ThemedCountdownProps {
  count: number;
}

export function ThemedCountdown({ count }: ThemedCountdownProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          key={count}
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${styles.colors.bg.primary}cc`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
          >
            <div
              style={{
                fontFamily: styles.fonts.score,
                fontSize: styles.fontSize['9xl'],
                fontWeight: 900,
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: config.effects.glowIntensity > 15
                  ? `0 0 ${styles.effects.glowIntensity * 2}px ${styles.colors.primary}, 0 0 ${styles.effects.glowIntensity * 4}px ${styles.colors.secondary}`
                  : 'none',
                filter: config.effects.glowIntensity > 15
                  ? `drop-shadow(0 0 ${styles.effects.glowIntensity}px ${styles.colors.primary})`
                  : 'none',
              }}
            >
              {count}
            </div>
          </motion.div>

          {/* Expanding Ring Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: `4px solid ${styles.colors.primary}`,
              boxShadow: styles.shadows.glowStrong(styles.colors.primary),
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

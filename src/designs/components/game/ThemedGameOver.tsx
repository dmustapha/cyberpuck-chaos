'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedButton } from '../ui/ThemedButton';
import { ThemedCard } from '../ui/ThemedCard';
import { ThemedProgressBar } from '../ui/ThemedProgressBar';

interface ThemedGameOverProps {
  winner: 'player' | 'opponent';
  playerScore: number;
  opponentScore: number;
  xpGained?: number;
  levelUp?: boolean;
  newLevel?: number;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function ThemedGameOver({
  winner,
  playerScore,
  opponentScore,
  xpGained = 150,
  levelUp = false,
  newLevel,
  onPlayAgain,
  onQuit,
}: ThemedGameOverProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const isVictory = winner === 'player';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          delay: 0.2,
        }}
      >
        <ThemedCard glow padding="lg">
          <div style={{ minWidth: '500px', textAlign: 'center' }}>
            {/* Result Title */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <h1
                style={{
                  fontFamily: styles.fonts.heading,
                  fontSize: styles.fontSize['5xl'],
                  fontWeight: 900,
                  background: isVictory
                    ? `linear-gradient(135deg, ${styles.colors.success}, ${styles.colors.primary})`
                    : `linear-gradient(135deg, ${styles.colors.error}, ${styles.colors.warning})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: config.effects.glowIntensity > 15
                    ? `0 0 ${styles.effects.glowIntensity * 2}px ${isVictory ? styles.colors.success : styles.colors.error}`
                    : 'none',
                  marginBottom: '0.5rem',
                }}
              >
                {isVictory ? 'VICTORY!' : 'DEFEAT'}
              </h1>
              <p
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.lg,
                  color: styles.colors.text.secondary,
                  marginBottom: '2rem',
                }}
              >
                {isVictory ? 'You dominated the game!' : 'Better luck next time!'}
              </p>
            </motion.div>

            {/* Score Display */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '2rem',
                backgroundColor: styles.colors.bg.secondary,
                borderRadius: styles.borderRadius.lg,
                border: `1px solid ${styles.colors.border.subtle}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: styles.fonts.body,
                    fontSize: styles.fontSize.sm,
                    color: styles.colors.text.muted,
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  You
                </div>
                <div
                  style={{
                    fontFamily: styles.fonts.score,
                    fontSize: styles.fontSize['4xl'],
                    fontWeight: 900,
                    color: styles.colors.player.you,
                    textShadow: styles.shadows.glowText(styles.colors.player.you),
                  }}
                >
                  {playerScore}
                </div>
              </div>

              <div
                style={{
                  fontFamily: styles.fonts.heading,
                  fontSize: styles.fontSize['3xl'],
                  color: styles.colors.text.muted,
                }}
              >
                -
              </div>

              <div>
                <div
                  style={{
                    fontFamily: styles.fonts.body,
                    fontSize: styles.fontSize.sm,
                    color: styles.colors.text.muted,
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                  }}
                >
                  Opponent
                </div>
                <div
                  style={{
                    fontFamily: styles.fonts.score,
                    fontSize: styles.fontSize['4xl'],
                    fontWeight: 900,
                    color: styles.colors.player.opponent,
                    textShadow: styles.shadows.glowText(styles.colors.player.opponent),
                  }}
                >
                  {opponentScore}
                </div>
              </div>
            </div>

            {/* XP Gain */}
            <div
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: styles.colors.bg.secondary,
                borderRadius: styles.borderRadius.lg,
                border: `1px solid ${styles.colors.border.subtle}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: styles.fonts.body,
                    fontSize: styles.fontSize.base,
                    color: styles.colors.text.primary,
                  }}
                >
                  XP Gained
                </span>
                <span
                  style={{
                    fontFamily: styles.fonts.score,
                    fontSize: styles.fontSize.xl,
                    fontWeight: 700,
                    color: styles.colors.success,
                    textShadow: styles.shadows.glowText(styles.colors.success),
                  }}
                >
                  +{xpGained}
                </span>
              </div>

              {levelUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                  style={{
                    padding: '1rem',
                    backgroundColor: `${styles.colors.success}20`,
                    border: `2px solid ${styles.colors.success}`,
                    borderRadius: styles.borderRadius.md,
                    boxShadow: styles.shadows.glow(styles.colors.success),
                  }}
                >
                  <div
                    style={{
                      fontFamily: styles.fonts.heading,
                      fontSize: styles.fontSize.lg,
                      fontWeight: 700,
                      color: styles.colors.success,
                    }}
                  >
                    🎉 LEVEL UP!
                  </div>
                  <div
                    style={{
                      fontFamily: styles.fonts.body,
                      fontSize: styles.fontSize.sm,
                      color: styles.colors.text.secondary,
                    }}
                  >
                    You reached Level {newLevel}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ThemedButton variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
                Play Again
              </ThemedButton>
              <ThemedButton variant="ghost" size="lg" fullWidth onClick={onQuit}>
                Quit to Menu
              </ThemedButton>
            </div>
          </div>
        </ThemedCard>
      </motion.div>
    </motion.div>
  );
}

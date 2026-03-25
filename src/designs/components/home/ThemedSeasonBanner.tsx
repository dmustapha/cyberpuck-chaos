'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedCard } from '../ui/ThemedCard';
import { ThemedProgressBar } from '../ui/ThemedProgressBar';

interface ThemedSeasonBannerProps {
  seasonName?: string;
  seasonNumber?: number;
  daysLeft?: number;
  currentTier?: number;
  maxTier?: number;
}

export function ThemedSeasonBanner({
  seasonName = 'Winter Championship',
  seasonNumber = 5,
  daysLeft = 23,
  currentTier = 7,
  maxTier = 10,
}: ThemedSeasonBannerProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const rewards = [
    { tier: 1, reward: '🏆 Bronze Trophy' },
    { tier: 3, reward: '🥈 Silver Trophy' },
    { tier: 5, reward: '🥇 Gold Trophy' },
    { tier: 7, reward: '💎 Diamond Trophy' },
    { tier: 10, reward: '👑 Master Trophy' },
  ];

  return (
    <ThemedCard glow padding="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        {/* Season Info */}
        <div>
          <div
            style={{
              fontFamily: styles.fonts.body,
              fontSize: styles.fontSize.sm,
              color: styles.colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.25rem',
            }}
          >
            Season {seasonNumber}
          </div>
          <h2
            style={{
              fontFamily: styles.fonts.heading,
              fontSize: styles.fontSize['3xl'],
              fontWeight: 700,
              background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: config.effects.glowIntensity > 15
                ? styles.shadows.glowText(styles.colors.primary)
                : 'none',
            }}
          >
            {seasonName}
          </h2>
        </div>

        {/* Time Left */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: `${styles.colors.warning}15`,
            border: `2px solid ${styles.colors.warning}`,
            borderRadius: styles.borderRadius.lg,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: styles.fonts.score,
              fontSize: styles.fontSize['2xl'],
              fontWeight: 700,
              color: styles.colors.warning,
            }}
          >
            {daysLeft}
          </div>
          <div
            style={{
              fontFamily: styles.fonts.body,
              fontSize: styles.fontSize.xs,
              color: styles.colors.text.muted,
              textTransform: 'uppercase',
            }}
          >
            Days Left
          </div>
        </motion.div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <ThemedProgressBar
          value={currentTier}
          max={maxTier}
          label={`Tier Progress`}
          showPercentage
          color="primary"
          size="lg"
        />
      </div>

      {/* Rewards */}
      <div>
        <h3
          style={{
            fontFamily: styles.fonts.body,
            fontSize: styles.fontSize.sm,
            color: styles.colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
          }}
        >
          Season Rewards
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {rewards.map(({ tier, reward }) => (
            <motion.div
              key={tier}
              whileHover={{ scale: 1.05, y: -2 }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: currentTier >= tier
                  ? `${styles.colors.success}20`
                  : styles.colors.bg.secondary,
                border: `1px solid ${currentTier >= tier ? styles.colors.success : styles.colors.border.subtle}`,
                borderRadius: styles.borderRadius.md,
                fontFamily: styles.fonts.body,
                fontSize: styles.fontSize.sm,
                color: currentTier >= tier ? styles.colors.success : styles.colors.text.secondary,
                opacity: currentTier >= tier ? 1 : 0.6,
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>Tier {tier}</span>
              <span>{reward}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </ThemedCard>
  );
}

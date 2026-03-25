'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedCard } from '../ui/ThemedCard';
import { ThemedProgressBar } from '../ui/ThemedProgressBar';

interface ThemedProfilePreviewProps {
  username?: string;
  rank?: string;
  level?: number;
  xp?: number;
  maxXp?: number;
  wins?: number;
  losses?: number;
}

export function ThemedProfilePreview({
  username = 'Player',
  rank = 'GOLD',
  level = 24,
  xp = 1847,
  maxXp = 2000,
  wins = 142,
  losses = 89,
}: ThemedProfilePreviewProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const winRate = ((wins / (wins + losses)) * 100).toFixed(1);
  const rankColor = styles.colors.rank[rank as keyof typeof styles.colors.rank] || styles.colors.primary;

  return (
    <ThemedCard glow>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: styles.borderRadius.full,
            background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: styles.shadows.glowStrong(styles.colors.primary),
          }}
        >
          🏒
        </motion.div>

        {/* Player Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2
              style={{
                fontFamily: styles.fonts.heading,
                fontSize: styles.fontSize['2xl'],
                fontWeight: 700,
                color: styles.colors.text.primary,
              }}
            >
              {username}
            </h2>
            <span
              style={{
                fontFamily: styles.fonts.body,
                fontSize: styles.fontSize.xs,
                fontWeight: 600,
                padding: '0.25rem 0.75rem',
                borderRadius: styles.borderRadius.full,
                backgroundColor: `${rankColor}20`,
                color: rankColor,
                border: `1px solid ${rankColor}`,
                boxShadow: styles.shadows.glow(rankColor),
                textTransform: 'uppercase',
              }}
            >
              {rank}
            </span>
          </div>

          {/* Level & XP */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                fontFamily: styles.fonts.body,
                fontSize: styles.fontSize.sm,
                color: styles.colors.text.secondary,
              }}
            >
              <span>Level {level}</span>
              <span>{xp} / {maxXp} XP</span>
            </div>
            <ThemedProgressBar value={xp} max={maxXp} color="primary" size="md" />
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <div
                style={{
                  fontFamily: styles.fonts.score,
                  fontSize: styles.fontSize.xl,
                  fontWeight: 700,
                  color: styles.colors.success,
                }}
              >
                {wins}
              </div>
              <div
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.xs,
                  color: styles.colors.text.muted,
                  textTransform: 'uppercase',
                }}
              >
                Wins
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: styles.fonts.score,
                  fontSize: styles.fontSize.xl,
                  fontWeight: 700,
                  color: styles.colors.error,
                }}
              >
                {losses}
              </div>
              <div
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.xs,
                  color: styles.colors.text.muted,
                  textTransform: 'uppercase',
                }}
              >
                Losses
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: styles.fonts.score,
                  fontSize: styles.fontSize.xl,
                  fontWeight: 700,
                  color: styles.colors.primary,
                }}
              >
                {winRate}%
              </div>
              <div
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.xs,
                  color: styles.colors.text.muted,
                  textTransform: 'uppercase',
                }}
              >
                Win Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemedCard>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedButton } from '../ui/ThemedButton';
import { useRouter } from 'next/navigation';

export function ThemedHeroSection() {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const router = useRouter();

  const stats = [
    { label: 'Active Players', value: '12,847' },
    { label: 'Games Today', value: '3,421' },
    { label: 'Online Now', value: '1,234' },
  ];

  return (
    <section
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Main Title */}
        <h1
          style={{
            fontFamily: styles.fonts.heading,
            fontSize: styles.fontSize['6xl'],
            fontWeight: 900,
            marginBottom: '1rem',
            background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: config.effects.glowIntensity > 15
              ? styles.shadows.glowText(styles.colors.primary)
              : 'none',
            letterSpacing: '0.02em',
          }}
        >
          AIR HOCKEY
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: styles.fonts.body,
            fontSize: styles.fontSize.xl,
            color: styles.colors.text.secondary,
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto',
          }}
        >
          Experience the thrill of competitive air hockey with stunning {config.name} aesthetics
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '4rem',
          }}
        >
          <ThemedButton
            variant="primary"
            size="lg"
            onClick={() => router.push('/game')}
          >
            Play Now
          </ThemedButton>
          <ThemedButton
            variant="ghost"
            size="lg"
            onClick={() => router.push('/leaderboard')}
          >
            View Leaderboard
          </ThemedButton>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              style={{
                padding: '1.5rem',
                backgroundColor: styles.colors.bg.card,
                border: `1px solid ${styles.colors.border.subtle}`,
                borderRadius: styles.borderRadius.lg,
                boxShadow: styles.shadows.card,
              }}
            >
              <div
                style={{
                  fontFamily: styles.fonts.score,
                  fontSize: styles.fontSize['3xl'],
                  fontWeight: 700,
                  color: styles.colors.primary,
                  textShadow: config.effects.glowIntensity > 15
                    ? styles.shadows.glowText(styles.colors.primary)
                    : 'none',
                  marginBottom: '0.5rem',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.sm,
                  color: styles.colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

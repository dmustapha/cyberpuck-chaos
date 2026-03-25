'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ThemedCard } from '../ui/ThemedCard';
import { useRouter } from 'next/navigation';

export function ThemedQuickLinks() {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const router = useRouter();

  const quickLinks = [
    {
      title: 'Quick Match',
      description: 'Jump into a game instantly',
      icon: '⚡',
      color: styles.colors.primary,
      onClick: () => router.push('/game?mode=quick'),
    },
    {
      title: 'Ranked',
      description: 'Compete for glory and climb the ladder',
      icon: '🏆',
      color: styles.colors.warning,
      onClick: () => router.push('/game?mode=ranked'),
    },
    {
      title: 'Practice',
      description: 'Train against AI opponents',
      icon: '🎯',
      color: styles.colors.success,
      onClick: () => router.push('/game?mode=practice'),
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {quickLinks.map((link, index) => (
        <motion.div
          key={link.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ThemedCard hoverable clickable onClick={link.onClick}>
            <div style={{ textAlign: 'center' }}>
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 1rem auto',
                  borderRadius: styles.borderRadius.full,
                  background: `linear-gradient(135deg, ${link.color}, ${styles.colors.secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  boxShadow: styles.shadows.glowStrong(link.color),
                }}
              >
                {link.icon}
              </motion.div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: styles.fonts.heading,
                  fontSize: styles.fontSize.xl,
                  fontWeight: 700,
                  color: styles.colors.text.primary,
                  marginBottom: '0.5rem',
                }}
              >
                {link.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.sm,
                  color: styles.colors.text.secondary,
                }}
              >
                {link.description}
              </p>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

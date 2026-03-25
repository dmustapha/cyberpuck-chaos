'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import Link from 'next/link';

export function ThemedNavBar() {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Play', href: '/game' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: styles.colors.bg.nav,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${styles.colors.border.subtle}`,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 ${styles.effects.glowIntensity}px ${styles.colors.primary}10`,
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Logo/Brand */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: styles.borderRadius.md,
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
                boxShadow: styles.shadows.glow(styles.colors.primary),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '24px' }}>🏒</span>
            </div>
            <h1
              style={{
                fontFamily: styles.fonts.heading,
                fontSize: styles.fontSize['2xl'],
                fontWeight: 700,
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: config.effects.glowIntensity > 15
                  ? styles.shadows.glowText(styles.colors.primary)
                  : 'none',
              }}
            >
              AIR HOCKEY
            </h1>
          </motion.div>
        </Link>

        {/* Nav Items */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontFamily: styles.fonts.body,
                  fontSize: styles.fontSize.base,
                  fontWeight: 500,
                  color: styles.colors.text.secondary,
                  padding: '0.5rem 1rem',
                  borderRadius: styles.borderRadius.md,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onHoverStart={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = styles.colors.text.accent;
                  target.style.backgroundColor = styles.colors.bg.panelHover;
                }}
                onHoverEnd={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.color = styles.colors.text.secondary;
                  target.style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </motion.div>
            </Link>
          ))}

          {/* Player Stats Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: styles.borderRadius.full,
              backgroundColor: styles.colors.primary,
              color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
              fontFamily: styles.fonts.body,
              fontSize: styles.fontSize.sm,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: styles.shadows.glow(styles.colors.primary),
            }}
          >
            Profile
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

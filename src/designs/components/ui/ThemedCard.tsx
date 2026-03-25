'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { ReactNode } from 'react';

interface ThemedCardProps {
  children: ReactNode;
  glow?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

export function ThemedCard({
  children,
  glow = false,
  hoverable = false,
  clickable = false,
  onClick,
  padding = 'md',
}: ThemedCardProps) {
  const styles = useDesignStyles();

  const paddingStyles = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  return (
    <motion.div
      whileHover={hoverable || clickable ? { scale: 1.02, y: -4 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      style={{
        padding: paddingStyles[padding],
        backgroundColor: styles.colors.bg.card,
        border: `1px solid ${styles.colors.border.subtle}`,
        borderRadius: styles.borderRadius.lg,
        boxShadow: glow
          ? `${styles.shadows.card}, ${styles.shadows.glow(styles.colors.primary)}`
          : styles.shadows.card,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
      }}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </motion.div>
  );
}

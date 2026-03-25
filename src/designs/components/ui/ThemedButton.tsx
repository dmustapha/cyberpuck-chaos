'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';
import { useDesign } from '../../DesignContext';
import { ReactNode } from 'react';

interface ThemedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function ThemedButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
}: ThemedButtonProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  const sizeStyles = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: styles.fontSize.sm,
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: styles.fontSize.base,
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: styles.fontSize.lg,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: styles.colors.primary,
      color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
      border: 'none',
      boxShadow: disabled ? 'none' : styles.shadows.glow(styles.colors.primary),
    },
    secondary: {
      backgroundColor: styles.colors.secondary,
      color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
      border: 'none',
      boxShadow: disabled ? 'none' : styles.shadows.glow(styles.colors.secondary),
    },
    ghost: {
      backgroundColor: 'transparent',
      color: styles.colors.text.primary,
      border: `2px solid ${styles.colors.border.active}`,
      boxShadow: 'none',
    },
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: fullWidth ? '100%' : 'auto',
        fontFamily: styles.fonts.body,
        fontWeight: 600,
        borderRadius: styles.borderRadius.md,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

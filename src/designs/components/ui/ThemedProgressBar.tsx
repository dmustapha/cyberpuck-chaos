'use client';

import { motion } from 'framer-motion';
import { useDesignStyles } from '../../useDesignStyles';

interface ThemedProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemedProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  color = 'primary',
  size = 'md',
}: ThemedProgressBarProps) {
  const styles = useDesignStyles();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: { height: '4px', fontSize: styles.fontSize.xs },
    md: { height: '8px', fontSize: styles.fontSize.sm },
    lg: { height: '12px', fontSize: styles.fontSize.base },
  };

  const colorMap = {
    primary: styles.colors.primary,
    secondary: styles.colors.secondary,
    success: styles.colors.success,
    warning: styles.colors.warning,
    error: styles.colors.error,
  };

  const barColor = colorMap[color];

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontFamily: styles.fonts.body,
            fontSize: sizeStyles[size].fontSize,
            color: styles.colors.text.secondary,
          }}
        >
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage.toFixed(0)}%</span>}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: sizeStyles[size].height,
          backgroundColor: styles.colors.bg.secondary,
          borderRadius: styles.borderRadius.full,
          overflow: 'hidden',
          border: `1px solid ${styles.colors.border.subtle}`,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            height: '100%',
            backgroundColor: barColor,
            boxShadow: styles.shadows.glow(barColor),
            borderRadius: styles.borderRadius.full,
          }}
        />
      </div>
    </div>
  );
}

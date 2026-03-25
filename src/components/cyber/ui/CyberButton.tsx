'use client';

/**
 * CyberButton - Theme-aware button component
 */

import React from 'react';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function CyberButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: CyberButtonProps) {
  const theme = useThemedStyles();

  const baseStyles = `
    relative
    inline-flex items-center justify-center gap-2
    font-semibold
    rounded-md
    transition-all duration-200
    cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeStyles[size]}
  `;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.primary}`,
          boxShadow: glow ? `0 0 20px ${theme.colors.primary}60` : 'none',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.primary}`,
          boxShadow: glow ? `0 0 15px ${theme.colors.primary}40` : 'none',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.text.secondary,
          border: '1px solid transparent',
          boxShadow: 'none',
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.error}`,
          boxShadow: glow ? `0 0 20px ${theme.colors.error}60` : 'none',
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.success}`,
          boxShadow: glow ? `0 0 20px ${theme.colors.success}60` : 'none',
        };
    }
  };

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>, entering: boolean) => {
    const target = e.currentTarget;
    if (disabled) return;

    if (entering) {
      if (variant === 'secondary') {
        target.style.backgroundColor = `${theme.colors.primary}20`;
      } else if (variant === 'ghost') {
        target.style.backgroundColor = `${theme.colors.primary}10`;
        target.style.color = theme.colors.primary;
      } else if (variant === 'primary') {
        target.style.filter = 'brightness(1.1)';
      }
    } else {
      target.style.backgroundColor = getVariantStyles().backgroundColor;
      target.style.filter = 'none';
      if (variant === 'ghost') {
        target.style.color = theme.colors.text.secondary;
      }
    }
  };

  return (
    <button
      className={`${baseStyles} ${className}`}
      style={{
        ...getVariantStyles(),
        fontFamily: theme.fonts.heading,
      }}
      disabled={disabled || loading}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'currentColor' }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}

export default CyberButton;

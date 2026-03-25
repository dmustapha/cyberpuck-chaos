'use client';

/**
 * Toggle - On/off switch component
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeConfig = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  color = cyberTheme.colors.primary,
  className = '',
}: ToggleProps) {
  const sizes = sizeConfig[size];

  return (
    <label
      className={`flex items-center gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Toggle track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative ${sizes.track} rounded-full transition-colors duration-200`}
        style={{
          backgroundColor: checked ? color : cyberTheme.colors.bg.tertiary,
          boxShadow: checked ? `0 0 10px ${color}` : 'none',
        }}
      >
        {/* Thumb */}
        <span
          className={`absolute top-0.5 left-0.5 ${sizes.thumb} rounded-full transition-transform duration-200`}
          style={{
            backgroundColor: cyberTheme.colors.text.primary,
            transform: checked ? sizes.translate : 'translateX(0)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </button>

      {/* Label */}
      {label && (
        <span
          className="text-sm font-medium"
          style={{ color: cyberTheme.colors.text.primary }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

export default Toggle;

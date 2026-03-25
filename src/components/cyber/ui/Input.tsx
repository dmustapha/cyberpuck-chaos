'use client';

/**
 * Input - Cyber-styled text input field
 */

import React, { forwardRef } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost';
}

const sizeConfig = {
  sm: { input: 'px-3 py-1.5 text-sm', icon: 'px-2' },
  md: { input: 'px-4 py-2 text-base', icon: 'px-3' },
  lg: { input: 'px-5 py-3 text-lg', icon: 'px-4' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes = sizeConfig[size];
    const hasError = !!error;

    const getBorderColor = () => {
      if (hasError) return cyberTheme.colors.error;
      return cyberTheme.colors.border.default;
    };

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon left */}
          {icon && iconPosition === 'left' && (
            <div
              className={`absolute left-0 top-0 bottom-0 flex items-center ${sizes.icon}`}
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            disabled={disabled}
            className={`w-full rounded-md outline-none transition-all duration-200 ${sizes.input} ${
              icon && iconPosition === 'left' ? 'pl-10' : ''
            } ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
            style={{
              backgroundColor:
                variant === 'ghost'
                  ? 'transparent'
                  : cyberTheme.colors.bg.tertiary,
              border: `1px solid ${getBorderColor()}`,
              color: cyberTheme.colors.text.primary,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = hasError
                ? cyberTheme.colors.error
                : cyberTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 2px ${
                hasError ? cyberTheme.colors.error : cyberTheme.colors.primary
              }20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = getBorderColor();
              e.target.style.boxShadow = 'none';
            }}
            {...props}
          />

          {/* Icon right */}
          {icon && iconPosition === 'right' && (
            <div
              className={`absolute right-0 top-0 bottom-0 flex items-center ${sizes.icon}`}
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            className="mt-1 text-xs"
            style={{ color: cyberTheme.colors.error }}
          >
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p
            className="mt-1 text-xs"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

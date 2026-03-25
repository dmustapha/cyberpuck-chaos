'use client';

/**
 * Slider - Range input with glow effect
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeConfig = {
  sm: { track: 'h-1', thumb: 'h-3 w-3' },
  md: { track: 'h-2', thumb: 'h-4 w-4' },
  lg: { track: 'h-3', thumb: 'h-5 w-5' },
};

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  label,
  size = 'md',
  color = cyberTheme.colors.primary,
  className = '',
}: SliderProps) {
  const sizes = sizeConfig[size];
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span
              className="text-sm font-medium"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              className="text-sm font-bold tabular-nums"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {value}
            </span>
          )}
        </div>
      )}

      {/* Slider container */}
      <div className="relative">
        {/* Track background */}
        <div
          className={`absolute inset-0 ${sizes.track} rounded-full`}
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />

        {/* Filled track */}
        <div
          className={`absolute ${sizes.track} rounded-full pointer-events-none`}
          style={{
            backgroundColor: color,
            width: `${percentage}%`,
            top: '50%',
            transform: 'translateY(-50%)',
            boxShadow: `0 0 10px ${color}`,
          }}
        />

        {/* Input */}
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="relative w-full appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 z-10"
          style={
            {
              '--thumb-color': color,
              '--thumb-glow': `0 0 10px ${color}`,
            } as React.CSSProperties
          }
        />
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: ${size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'};
          height: ${size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'};
          background: var(--thumb-color);
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: var(--thumb-glow);
        }
        input[type='range']::-moz-range-thumb {
          width: ${size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'};
          height: ${size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px'};
          background: var(--thumb-color);
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: var(--thumb-glow);
        }
        input[type='range']:focus::-webkit-slider-thumb {
          box-shadow: var(--thumb-glow), 0 0 0 4px rgba(29, 78, 216, 0.2);
        }
      `}</style>
    </div>
  );
}

export default Slider;

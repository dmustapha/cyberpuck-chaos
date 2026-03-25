'use client';

/**
 * DifficultySelector - Choose AI difficulty level
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import type { Difficulty } from '@/types/game';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  className?: string;
}

const difficulties: { value: Difficulty; label: string; description: string; color: string }[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Relaxed gameplay, slower AI reactions',
    color: cyberTheme.colors.success,
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced challenge for most players',
    color: cyberTheme.colors.warning,
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Fast AI with precise predictions',
    color: cyberTheme.colors.error,
  },
];

export function DifficultySelector({ value, onChange, className = '' }: DifficultySelectorProps) {
  return (
    <div className={className}>
      <label
        className="block text-sm font-medium mb-3 uppercase tracking-wider"
        style={{ color: cyberTheme.colors.text.secondary }}
      >
        Select Difficulty
      </label>

      <div className="space-y-2">
        {difficulties.map((diff) => {
          const isSelected = value === diff.value;

          return (
            <button
              key={diff.value}
              onClick={() => onChange(diff.value)}
              className="w-full p-4 rounded-lg text-left transition-all duration-200"
              style={{
                backgroundColor: isSelected
                  ? `${diff.color}15`
                  : cyberTheme.colors.bg.tertiary,
                border: `2px solid ${isSelected ? diff.color : cyberTheme.colors.border.default}`,
                boxShadow: isSelected ? cyberTheme.shadows.glow(diff.color) : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className="font-bold uppercase"
                    style={{
                      color: isSelected ? diff.color : cyberTheme.colors.text.primary,
                      fontFamily: cyberTheme.fonts.heading,
                    }}
                  >
                    {diff.label}
                  </h4>
                  <p
                    className="text-sm mt-1"
                    style={{ color: cyberTheme.colors.text.muted }}
                  >
                    {diff.description}
                  </p>
                </div>

                {/* Selection indicator */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: isSelected ? diff.color : cyberTheme.colors.border.default,
                  }}
                >
                  {isSelected && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: diff.color }}
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DifficultySelector;

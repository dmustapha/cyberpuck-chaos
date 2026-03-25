'use client';

/**
 * Select - Cyber-styled dropdown select
 */

import React, { useState, useRef, useEffect } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  size = 'md',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 rounded-md ${sizeConfig[size]} transition-all duration-200`}
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${isOpen ? cyberTheme.colors.primary : cyberTheme.colors.border.default}`,
          color: selectedOption
            ? cyberTheme.colors.text.primary
            : cyberTheme.colors.text.muted,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <span
          className="text-xs transition-transform duration-200"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: cyberTheme.colors.text.secondary,
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-md overflow-hidden"
          style={{
            backgroundColor: cyberTheme.colors.bg.secondary,
            border: `1px solid ${cyberTheme.colors.border.default}`,
            boxShadow: cyberTheme.shadows.panel,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => !option.disabled && handleSelect(option.value)}
              disabled={option.disabled}
              className={`w-full flex items-center gap-2 ${sizeConfig[size]} text-left transition-colors duration-150`}
              style={{
                backgroundColor:
                  option.value === value
                    ? `${cyberTheme.colors.primary}20`
                    : 'transparent',
                color: option.disabled
                  ? cyberTheme.colors.text.muted
                  : cyberTheme.colors.text.primary,
                opacity: option.disabled ? 0.5 : 1,
                cursor: option.disabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = `${cyberTheme.colors.primary}10`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  option.value === value
                    ? `${cyberTheme.colors.primary}20`
                    : 'transparent';
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;

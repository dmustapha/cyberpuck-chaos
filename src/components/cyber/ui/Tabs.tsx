'use client';

/**
 * Tabs - Tab navigation component
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const getTabStyles = (isActive: boolean, isDisabled: boolean) => {
    if (isDisabled) {
      return {
        color: cyberTheme.colors.text.muted,
        cursor: 'not-allowed',
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'pills':
        return {
          backgroundColor: isActive ? cyberTheme.colors.primary : 'transparent',
          color: isActive
            ? cyberTheme.colors.text.primary
            : cyberTheme.colors.text.secondary,
          borderRadius: '0.5rem',
        };
      case 'underline':
        return {
          backgroundColor: 'transparent',
          color: isActive
            ? cyberTheme.colors.primary
            : cyberTheme.colors.text.secondary,
          borderBottom: isActive
            ? `2px solid ${cyberTheme.colors.primary}`
            : '2px solid transparent',
        };
      default:
        return {
          backgroundColor: isActive
            ? `${cyberTheme.colors.primary}20`
            : 'transparent',
          color: isActive
            ? cyberTheme.colors.primary
            : cyberTheme.colors.text.secondary,
          borderBottom: isActive
            ? `2px solid ${cyberTheme.colors.primary}`
            : '2px solid transparent',
        };
    }
  };

  return (
    <div
      className={`flex ${fullWidth ? 'w-full' : ''} ${
        variant === 'pills' ? 'gap-2' : 'gap-0'
      } ${className}`}
      style={{
        borderBottom:
          variant !== 'pills'
            ? `1px solid ${cyberTheme.colors.border.subtle}`
            : 'none',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const styles = getTabStyles(isActive, !!tab.disabled);

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`${sizeConfig[size]} ${
              fullWidth ? 'flex-1' : ''
            } flex items-center justify-center gap-2 font-semibold uppercase tracking-wider transition-all duration-200`}
            style={{
              ...styles,
              fontFamily: cyberTheme.fonts.heading,
            }}
            disabled={tab.disabled}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

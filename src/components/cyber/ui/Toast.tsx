'use client';

/**
 * Toast - Achievement unlock and notification toasts
 */

import React, { useEffect, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

type ToastType = 'achievement' | 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
  show: boolean;
  className?: string;
}

const typeConfig: Record<ToastType, { color: string; icon: React.ReactNode }> = {
  achievement: {
    color: '#ffd700',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 22V14.6a7 7 0 0 1-3.3-5.3L6 4h12l-.7 5.3A7 7 0 0 1 14 14.6V22" />
      </svg>
    ),
  },
  success: {
    color: '#22c55e',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    color: '#ef4444',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  info: {
    color: '#3b82f6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  warning: {
    color: '#fbbf24',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
};

export function Toast({
  type = 'info',
  title,
  message,
  icon,
  duration = 5000,
  onClose,
  show,
  className = '',
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = typeConfig[type];
  const displayIcon = icon || config.icon;

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsLeaving(false);

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}
      style={{
        animation: isLeaving
          ? 'slideOutRight 0.3s ease-out forwards'
          : 'slideInRight 0.3s ease-out forwards',
      }}
    >
      <div
        className="relative rounded-lg p-4 shadow-lg"
        style={{
          backgroundColor: cyberTheme.colors.bg.secondary,
          border: `1px solid ${config.color}50`,
          boxShadow: `0 0 20px ${config.color}30, ${cyberTheme.shadows.panel}`,
        }}
      >
        {/* Accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: config.color }}
        />

        <div className="flex gap-3">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            {displayIcon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-sm"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {title}
            </h4>
            {message && (
              <p
                className="text-sm mt-0.5 line-clamp-2"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                {message}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-lg opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            ×
          </button>
        </div>

        {/* Progress bar for duration */}
        {duration > 0 && (
          <div
            className="absolute bottom-0 left-0 h-0.5 rounded-b-lg"
            style={{
              backgroundColor: config.color,
              animation: `shrinkWidth ${duration}ms linear forwards`,
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export default Toast;

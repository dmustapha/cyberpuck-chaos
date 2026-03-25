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

const typeConfig: Record<ToastType, { color: string; icon: string }> = {
  achievement: { color: '#ffd700', icon: '🏆' },
  success: { color: '#22c55e', icon: '✓' },
  error: { color: '#ef4444', icon: '✕' },
  info: { color: '#3b82f6', icon: 'ℹ' },
  warning: { color: '#fbbf24', icon: '⚠' },
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

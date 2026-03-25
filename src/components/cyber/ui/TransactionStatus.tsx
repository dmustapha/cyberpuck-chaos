'use client';

/**
 * TransactionStatus - Transaction progress indicator
 *
 * Shows the current state of a blockchain transaction:
 * - Pending: Waiting for user signature
 * - Confirming: Waiting for block confirmation
 * - Success: Transaction confirmed
 * - Error: Transaction failed
 */

import React, { useEffect, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
type TxStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

interface TransactionStatusProps {
  // Transaction state
  status: TxStatus;
  hash?: string | null;
  description?: string | null;
  error?: string | null;

  // Actions
  onDismiss?: () => void;

  // Configuration
  autoHideDelay?: number; // ms to auto-hide success (0 = no auto-hide)
  showHash?: boolean;

  // Styling
  variant?: 'inline' | 'toast' | 'modal';
  className?: string;
}

export function TransactionStatus({
  status,
  hash,
  description,
  error,
  onDismiss,
  autoHideDelay = 3000,
  showHash = true,
  variant = 'inline',
  className = '',
}: TransactionStatusProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide on success
  useEffect(() => {
    if (status === 'success' && autoHideDelay > 0 && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Allow fade animation
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [status, autoHideDelay, onDismiss]);

  // Reset visibility when status changes
  useEffect(() => {
    setIsVisible(true);
  }, [status]);

  // Don't render if idle or not visible
  if (status === 'idle' || !isVisible) {
    return null;
  }

  // Status-specific styling
  const statusConfig = {
    pending: {
      icon: '⏳',
      label: 'Waiting for signature...',
      color: cyberTheme.colors.warning,
      bgColor: `${cyberTheme.colors.warning}15`,
      borderColor: `${cyberTheme.colors.warning}40`,
    },
    confirming: {
      icon: '🔄',
      label: 'Confirming on chain...',
      color: cyberTheme.colors.primary,
      bgColor: `${cyberTheme.colors.primary}15`,
      borderColor: `${cyberTheme.colors.primary}40`,
    },
    success: {
      icon: '✅',
      label: 'Transaction confirmed!',
      color: cyberTheme.colors.success,
      bgColor: `${cyberTheme.colors.success}15`,
      borderColor: `${cyberTheme.colors.success}40`,
    },
    error: {
      icon: '❌',
      label: 'Transaction failed',
      color: cyberTheme.colors.error,
      bgColor: `${cyberTheme.colors.error}15`,
      borderColor: `${cyberTheme.colors.error}40`,
    },
  };

  const config = statusConfig[status];

  // Shortened hash for display
  const shortHash = hash ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : null;

  // Toast variant
  if (variant === 'toast') {
    return (
      <div
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        } ${className}`}
      >
        <div
          className="flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-sm"
          style={{
            backgroundColor: cyberTheme.colors.bg.secondary,
            border: `1px solid ${config.borderColor}`,
            boxShadow: `0 0 20px ${config.color}30`,
          }}
        >
          <span className="text-2xl">{config.icon}</span>
          <div className="flex-1">
            <div
              className="font-bold mb-1"
              style={{ color: config.color }}
            >
              {config.label}
            </div>
            {description && (
              <div
                className="text-sm mb-1"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                {description}
              </div>
            )}
            {showHash && shortHash && status !== 'error' && (
              <div
                className="text-xs font-mono"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                {shortHash}
              </div>
            )}
            {status === 'error' && error && (
              <div
                className="text-sm"
                style={{ color: cyberTheme.colors.error }}
              >
                {error}
              </div>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  // Modal variant
  if (variant === 'modal') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={status === 'success' || status === 'error' ? onDismiss : undefined}
        />
        <div
          className="relative p-6 rounded-lg max-w-md w-full mx-4 text-center"
          style={{
            backgroundColor: cyberTheme.colors.bg.secondary,
            border: `2px solid ${config.borderColor}`,
            boxShadow: `0 0 40px ${config.color}40`,
          }}
        >
          {/* Animated icon */}
          <div className="text-5xl mb-4">
            {status === 'pending' || status === 'confirming' ? (
              <span className="inline-block animate-pulse">{config.icon}</span>
            ) : (
              config.icon
            )}
          </div>

          {/* Status label */}
          <div
            className="text-xl font-bold mb-2"
            style={{
              color: config.color,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {config.label}
          </div>

          {/* Description */}
          {description && (
            <div
              className="text-sm mb-3"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              {description}
            </div>
          )}

          {/* Hash or error */}
          {showHash && shortHash && status !== 'error' && (
            <div
              className="text-sm font-mono p-2 rounded mb-4"
              style={{
                backgroundColor: cyberTheme.colors.bg.tertiary,
                color: cyberTheme.colors.text.muted,
              }}
            >
              {shortHash}
            </div>
          )}
          {status === 'error' && error && (
            <div
              className="text-sm p-2 rounded mb-4"
              style={{
                backgroundColor: `${cyberTheme.colors.error}20`,
                color: cyberTheme.colors.error,
              }}
            >
              {error}
            </div>
          )}

          {/* Progress bar for pending/confirming */}
          {(status === 'pending' || status === 'confirming') && (
            <div
              className="h-1 rounded-full overflow-hidden mb-4"
              style={{ backgroundColor: cyberTheme.colors.bg.tertiary }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  backgroundColor: config.color,
                  width: status === 'pending' ? '30%' : '70%',
                  transition: 'width 0.5s ease-out',
                }}
              />
            </div>
          )}

          {/* Dismiss button */}
          {onDismiss && (status === 'success' || status === 'error') && (
            <button
              onClick={onDismiss}
              className="px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all hover:opacity-80"
              style={{
                backgroundColor: config.color,
                color: cyberTheme.colors.bg.primary,
              }}
            >
              {status === 'success' ? 'Continue' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${className}`}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      {/* Icon */}
      <span className={status === 'pending' || status === 'confirming' ? 'animate-pulse' : ''}>
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className="font-medium text-sm"
          style={{ color: config.color }}
        >
          {config.label}
        </div>
        {description && (
          <div
            className="text-xs truncate"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            {description}
          </div>
        )}
        {showHash && shortHash && status !== 'error' && (
          <div
            className="text-xs font-mono truncate"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            {shortHash}
          </div>
        )}
        {status === 'error' && error && (
          <div
            className="text-xs"
            style={{ color: cyberTheme.colors.error }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {onDismiss && (status === 'success' || status === 'error') && (
        <button
          onClick={onDismiss}
          className="opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default TransactionStatus;

'use client';

/**
 * Modal - Cyber-styled modal overlay
 */

import React, { useEffect, useCallback } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: cyberTheme.colors.bg.overlay,
          backdropFilter: 'blur(4px)',
        }}
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal content */}
      <div
        className={`relative w-full ${sizeStyles[size]} max-h-[90dvh] overflow-y-auto rounded-lg shadow-xl animate-modal-in ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.secondary,
          border: `1px solid ${cyberTheme.colors.border.default}`,
          boxShadow: `0 0 30px ${cyberTheme.colors.primary}30`,
        }}
      >
        {/* Corner accents (hidden on small screens to save space) */}
        <div
          className="hidden sm:block absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
          style={{ borderColor: cyberTheme.colors.primary }}
        />
        <div
          className="hidden sm:block absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2"
          style={{ borderColor: cyberTheme.colors.primary }}
        />
        <div
          className="hidden sm:block absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2"
          style={{ borderColor: cyberTheme.colors.primary }}
        />
        <div
          className="hidden sm:block absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
          style={{ borderColor: cyberTheme.colors.primary }}
        />

        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between p-3 sm:p-4 border-b"
            style={{ borderColor: cyberTheme.colors.border.default }}
          >
            {title && (
              <h2
                className="text-lg font-bold uppercase tracking-wider"
                style={{
                  color: cyberTheme.colors.text.primary,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-2xl leading-none opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-3 sm:p-4">{children}</div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modalIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Modal;

'use client';

/**
 * AchievementIcon - SVG icons for achievement display, replacing emojis
 */

import React from 'react';

interface AchievementIconProps {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
}

export function AchievementIcon({ icon, size = 24, color = 'currentColor', className = '' }: AchievementIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (icon) {
    case 'gamepad':
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 12h4M8 10v4" />
          <circle cx="17" cy="10" r="1" fill={color} stroke="none" />
          <circle cx="15" cy="12" r="1" fill={color} stroke="none" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'medal':
      return (
        <svg {...props}>
          <circle cx="12" cy="9" r="6" fill={`${color}20`} />
          <path d="M12 15l-3 6 3-2 3 2-3-6" />
          <path d="M9 6l3 3 3-3" strokeWidth="1.5" />
        </svg>
      );
    case 'gem':
      return (
        <svg {...props}>
          <path d="M6 3h12l3 6-9 12L3 9z" fill={`${color}15`} />
          <path d="M6 3h12l3 6-9 12L3 9z" />
          <path d="M3 9h18" />
          <path d="M12 21L9 9l3-6 3 6z" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...props}>
          <path d="M2 20h20" />
          <path d="M4 20V10l4 4 4-8 4 8 4-4v10" fill={`${color}20`} />
          <path d="M4 20V10l4 4 4-8 4 8 4-4v10" />
        </svg>
      );
    case 'hat':
      return (
        <svg {...props}>
          <path d="M4 20h16" />
          <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
          <ellipse cx="12" cy="10" rx="4" ry="6" />
        </svg>
      );
    case 'power':
      return (
        <svg {...props}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M12 2v4" />
          <circle cx="8" cy="14" r="1" fill={color} stroke="none" />
          <circle cx="12" cy="15" r="1" fill={color} stroke="none" />
          <circle cx="16" cy="14" r="1" fill={color} stroke="none" />
        </svg>
      );
    case 'flame':
      return (
        <svg {...props}>
          <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 3-6 3-10 0 0 2 2 3 4 1-2 2-6 5-8 0 4 2 6 4 8 1-1 2-3 2-3 1.5 2.5 1 5 1 7 0 3.31-4.03 8-9 8z" fill={`${color}15`} />
          <path d="M12 22c-4.97 0-9-2.69-9-6 0-4 3-6 3-10 0 0 2 2 3 4 1-2 2-6 5-8 0 4 2 6 4 8 1-1 2-3 2-3 1.5 2.5 1 5 1 7 0 3.31-4.03 8-9 8z" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...props}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" />
        </svg>
      );
    case 'timer':
      return (
        <svg {...props}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2" />
          <path d="M10 2h4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={`${color}15`} />
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      );
    case 'trending':
      return (
        <svg {...props}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 22V14.6a7 7 0 0 1-3.3-5.3L6 4h12l-.7 5.3A7 7 0 0 1 14 14.6V22" fill={`${color}15`} />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
        </svg>
      );
    case 'hourglass':
      return (
        <svg {...props}>
          <path d="M5 22h14" />
          <path d="M5 2h14" />
          <path d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22" />
          <path d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
        </svg>
      );
    case 'explosion':
      return (
        <svg {...props}>
          <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
          <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5z" />
          <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z" />
        </svg>
      );
    case 'rocket':
      return (
        <svg {...props}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case 'award':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      );
    case 'question':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

export default AchievementIcon;

'use client';

/**
 * NavLinks - Theme-aware navigation links
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavLinksProps {
  links?: NavLink[];
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// SVG icon components for consistent cyber aesthetic
const IconHome = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconPlay = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconProfile = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconRanks = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
    <path d="M4 22h16" />
    <path d="M10 22V2h4v20" />
    <path d="M6 22V10h12v12" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const defaultLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: <IconHome /> },
  { href: '/game', label: 'Play', icon: <IconPlay /> },
  { href: '/profile', label: 'Profile', icon: <IconProfile /> },
  { href: '/leaderboard', label: 'Ranks', icon: <IconRanks /> },
  { href: '/settings', label: 'Settings', icon: <IconSettings /> },
];

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function NavLinks({
  links = defaultLinks,
  direction = 'horizontal',
  size = 'md',
  className = '',
}: NavLinksProps) {
  const pathname = usePathname();
  const theme = useThemedStyles();

  return (
    <nav
      className={`flex ${
        direction === 'vertical' ? 'flex-col' : 'items-center gap-1'
      } ${className}`}
    >
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-md ${sizeConfig[size]} transition-all duration-200`}
            style={{
              backgroundColor: isActive
                ? `${theme.colors.primary}20`
                : 'transparent',
              color: isActive
                ? theme.colors.primary
                : theme.colors.text.secondary,
              fontFamily: theme.fonts.heading,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary}10`;
                e.currentTarget.style.color = theme.colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.text.secondary;
              }
            }}
          >
            {link.icon && <span className="text-base">{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default NavLinks;

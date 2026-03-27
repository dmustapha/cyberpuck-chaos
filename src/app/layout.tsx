import type { Metadata, Viewport } from 'next';
import { Inter, Orbitron, Press_Start_2P, Bebas_Neue, VT323, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Base font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Arcade font
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

// Arcade Classic font
const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
});

// Premium Gaming font
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

// Retro Gaming font (CRT terminal style)
const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
});

// Electric Vibrant font
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'CyberPuck Chaos',
  description: 'On-chain air hockey with chaos modifiers, ranked ELO, and real-time multiplayer',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
  other: {
    'fc:frame': 'vNext',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${orbitron.variable} ${pressStart.variable} ${bebasNeue.variable} ${vt323.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

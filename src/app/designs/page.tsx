'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

// Import all design configs for preview
import { tokyoDriftConfig } from '@/designs/tokyo-drift/config';
import { arcticFrostConfig } from '@/designs/arctic-frost/config';
import { moltenCoreConfig } from '@/designs/molten-core/config';
import { synthwaveSunsetConfig } from '@/designs/synthwave-sunset/config';
import { midnightClubConfig } from '@/designs/midnight-club/config';

const designs = [
  { config: tokyoDriftConfig, path: '/designs/tokyo-drift' },
  { config: arcticFrostConfig, path: '/designs/arctic-frost' },
  { config: moltenCoreConfig, path: '/designs/molten-core' },
  { config: synthwaveSunsetConfig, path: '/designs/synthwave-sunset' },
  { config: midnightClubConfig, path: '/designs/midnight-club' },
];

function DesignPreview({ config, path, index }: { config: typeof tokyoDriftConfig; path: string; index: number }) {
  const { colors, name, description } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={path}>
        <div
          className="relative overflow-hidden rounded-xl cursor-pointer group transition-transform hover:scale-[1.02]"
          style={{
            background: colors.background,
            border: `2px solid ${colors.border}`,
          }}
        >
          {/* Mini game preview */}
          <div className="p-6 aspect-[3/4] flex flex-col">
            {/* Mini scoreboard */}
            <div
              className="flex justify-between items-center p-3 rounded-lg mb-4"
              style={{
                background: colors.backgroundSecondary,
                border: `1px solid ${colors.border}40`,
              }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: colors.player1 }}
              >
                0
              </div>
              <span style={{ color: colors.textMuted }}>VS</span>
              <div
                className="text-2xl font-bold"
                style={{ color: colors.player2 }}
              >
                0
              </div>
            </div>

            {/* Mini game table */}
            <div
              className="flex-1 rounded-lg relative"
              style={{
                background: colors.surface,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 0 20px ${colors.border}40`,
              }}
            >
              {/* Goal zones */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 rounded-b"
                style={{ background: colors.goalZone2 }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-4 rounded-t"
                style={{ background: colors.goalZone1 }}
              />

              {/* Center line */}
              <div
                className="absolute top-1/2 left-0 right-0 h-[2px]"
                style={{ background: `${colors.border}40` }}
              />

              {/* Center circle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2"
                style={{ borderColor: `${colors.border}40` }}
              />

              {/* Paddles */}
              <div
                className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full"
                style={{
                  background: colors.player2,
                  boxShadow: `0 0 15px ${colors.player2Glow}`,
                }}
              />
              <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full"
                style={{
                  background: colors.player1,
                  boxShadow: `0 0 15px ${colors.player1Glow}`,
                }}
              />

              {/* Puck */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                style={{
                  background: colors.puck,
                  boxShadow: `0 0 10px ${colors.puckGlow}`,
                }}
              />
            </div>

            {/* Design name */}
            <div className="mt-4 text-center">
              <h3
                className="text-xl font-bold mb-1"
                style={{ color: colors.text }}
              >
                {name}
              </h3>
              <p
                className="text-sm opacity-70"
                style={{ color: colors.textMuted }}
              >
                {description}
              </p>
            </div>

            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{
                background: `${colors.background}90`,
              }}
            >
              <span
                className="px-6 py-3 rounded-lg font-bold text-lg"
                style={{
                  background: colors.accent,
                  color: colors.background,
                }}
              >
                PLAY
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function DesignShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="text-center py-12 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-600 to-pink-500 bg-clip-text text-transparent"
        >
          AIR HOCKEY
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          Choose your visual style
        </motion.p>
      </div>

      {/* Design grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {designs.map((design, index) => (
            <DesignPreview
              key={design.config.id}
              config={design.config}
              path={design.path}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="text-center pb-12">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to main game
        </Link>
      </div>
    </div>
  );
}

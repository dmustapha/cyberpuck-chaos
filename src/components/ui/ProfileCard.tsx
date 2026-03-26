// File: src/components/ui/ProfileCard.tsx
'use client';

import { usePlayerProfile } from '../../hooks/usePlayerProfile';

export function ProfileCard() {
  const { profile, isLoading, isConnected, createProfile } =
    usePlayerProfile();

  if (!isConnected) return null;

  if (isLoading) {
    return (
      <div
        className="rounded-xl px-4 py-3 border border-cyan-500/20"
        style={{ background: 'rgba(10, 10, 30, 0.6)', backdropFilter: 'blur(8px)' }}
      >
        <span className="text-xs text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <button
        onClick={createProfile}
        className="rounded-xl px-4 py-3 border border-cyan-500/40 text-cyan-400 text-sm font-bold tracking-wide hover:bg-cyan-500/10 transition-colors"
        style={{
          background: 'rgba(10, 10, 30, 0.6)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Orbitron', monospace",
        }}
      >
        CREATE PROFILE
      </button>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-3 border border-cyan-500/20 flex items-center gap-4"
      style={{ background: 'rgba(10, 10, 30, 0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex flex-col items-center">
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "'Orbitron', monospace", color: '#00f0ff' }}
        >
          {profile.elo}
        </span>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">
          ELO
        </span>
      </div>
      <div className="w-px h-8 bg-gray-700" />
      <div className="flex gap-3 text-xs">
        <div className="flex flex-col items-center">
          <span className="text-green-400 font-bold">{profile.wins}</span>
          <span className="text-gray-500">W</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-red-400 font-bold">{profile.losses}</span>
          <span className="text-gray-500">L</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 font-bold">
            {profile.modifiersSurvived}
          </span>
          <span className="text-gray-500">MOD</span>
        </div>
      </div>
    </div>
  );
}

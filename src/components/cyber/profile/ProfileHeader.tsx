'use client';

/**
 * ProfileHeader - Avatar, name, title display with edit capability
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { RankBadge } from '../ui/RankBadge';
import { formatLevel } from '@/lib/cyber/xp';
import { validateUsername } from '@/lib/cyber/utils';
import { getTitles } from '@/lib/cyber/achievements';

interface ProfileHeaderProps {
  className?: string;
}

export function ProfileHeader({ className = '' }: ProfileHeaderProps) {
  const profile = usePlayerStore((state) => state.profile);
  const updateUsername = usePlayerStore((state) => state.updateUsername);
  const updateAvatar = usePlayerStore((state) => state.updateAvatar);
  const updateTitle = usePlayerStore((state) => state.updateTitle);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [usernameError, setUsernameError] = useState('');

  if (!profile) return null;

  const availableTitles = getTitles();

  const handleSave = () => {
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      setUsernameError(validation.error || 'Invalid username');
      return;
    }
    updateUsername(newUsername);
    setIsEditModalOpen(false);
    setUsernameError('');
  };

  return (
    <>
      <HUDPanel className={className} padding="lg">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}20`,
              border: `3px solid ${cyberTheme.colors.primary}`,
              boxShadow: `0 0 20px ${cyberTheme.colors.primary}40`,
            }}
          >
            👤
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name and rank */}
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-2xl font-black truncate"
                style={{
                  color: cyberTheme.colors.text.primary,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {profile.username}
              </h1>
              <RankBadge rank={profile.rank} size="md" />
            </div>

            {/* Title if equipped */}
            {profile.titleId && (
              <div
                className="text-sm mb-2"
                style={{ color: cyberTheme.colors.primary }}
              >
                {availableTitles.find((t) => t.id === profile.titleId)?.title ||
                  'Unknown Title'}
              </div>
            )}

            {/* Level and ELO */}
            <div className="flex items-center gap-4 mb-3">
              <span
                className="text-sm"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                {formatLevel(profile.level.current)}
              </span>
              <span
                className="text-sm"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                •
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: cyberTheme.colors.text.primary,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {profile.rank.elo} ELO
              </span>
              <span
                className="text-sm"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                •
              </span>
              <span
                className="text-sm"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                Peak: {profile.rank.peakElo}
              </span>
            </div>

            {/* Edit button */}
            <CyberButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewUsername(profile.username);
                setIsEditModalOpen(true);
              }}
            >
              Edit Profile
            </CyberButton>
          </div>
        </div>
      </HUDPanel>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            error={usernameError}
            hint="3-16 characters, letters, numbers, underscores only"
          />

          <div className="flex gap-3 pt-4">
            <CyberButton
              variant="ghost"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </CyberButton>
            <CyberButton
              variant="primary"
              onClick={handleSave}
              className="flex-1"
            >
              Save
            </CyberButton>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ProfileHeader;

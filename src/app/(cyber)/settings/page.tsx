'use client';

/**
 * Cyber Esports Settings Page
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useMatchHistoryStore } from '@/stores/matchHistoryStore';
import { useAchievementStore } from '@/stores/achievementStore';
import {
  HUDPanel,
  CyberButton,
  Select,
  Slider,
  Toggle,
  Modal,
} from '@/components/cyber/ui';

export default function CyberSettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateGameSettings = useSettingsStore((state) => state.updateGameSettings);
  const updateDisplaySettings = useSettingsStore((state) => state.updateDisplaySettings);
  const updateAudioSettings = useSettingsStore((state) => state.updateAudioSettings);
  const updateControlSettings = useSettingsStore((state) => state.updateControlSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const resetProfile = usePlayerStore((state) => state.resetProfile);
  const clearHistory = useMatchHistoryStore((state) => state.clearHistory);
  const resetAchievements = useAchievementStore((state) => state.resetAchievements);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetAll = () => {
    resetProfile();
    clearHistory();
    resetAchievements();
    resetSettings();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Settings
          </h1>
          <p style={{ color: cyberTheme.colors.text.secondary }}>
            Customize your gaming experience
          </p>
        </div>

        {/* Game Settings */}
        <HUDPanel className="mb-6" padding="lg">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Game Settings
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="font-medium"
                  style={{ color: cyberTheme.colors.text.primary }}
                >
                  Score to Win
                </div>
                <div
                  className="text-sm"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  Goals needed to win a match
                </div>
              </div>
              <Select
                options={[
                  { value: '5', label: '5 Goals' },
                  { value: '7', label: '7 Goals' },
                  { value: '10', label: '10 Goals' },
                ]}
                value={settings.game.scoreToWin.toString()}
                onChange={(v) =>
                  updateGameSettings({ scoreToWin: parseInt(v) as 5 | 7 | 10 })
                }
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div
                  className="font-medium"
                  style={{ color: cyberTheme.colors.text.primary }}
                >
                  Match Type
                </div>
                <div
                  className="text-sm"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  Default match type
                </div>
              </div>
              <Select
                options={[
                  { value: 'ranked', label: 'Ranked' },
                  { value: 'casual', label: 'Casual' },
                ]}
                value={settings.game.matchType}
                onChange={(v) =>
                  updateGameSettings({ matchType: v as 'ranked' | 'casual' })
                }
                size="sm"
              />
            </div>
          </div>
        </HUDPanel>

        {/* Display Settings */}
        <HUDPanel className="mb-6" padding="lg">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Display Settings
          </h2>

          <div className="space-y-4">
            <Toggle
              checked={settings.display.particleEffects}
              onChange={(v) => updateDisplaySettings({ particleEffects: v })}
              label="Particle Effects"
            />
            <Toggle
              checked={settings.display.glowEffects}
              onChange={(v) => updateDisplaySettings({ glowEffects: v })}
              label="Glow Effects"
            />
            <Toggle
              checked={settings.display.hudAnimations}
              onChange={(v) => updateDisplaySettings({ hudAnimations: v })}
              label="HUD Animations"
            />
            <Toggle
              checked={settings.display.screenShake}
              onChange={(v) => updateDisplaySettings({ screenShake: v })}
              label="Screen Shake"
            />
            <Toggle
              checked={settings.display.showFPS}
              onChange={(v) => updateDisplaySettings({ showFPS: v })}
              label="Show FPS"
            />
            <Toggle
              checked={settings.display.reducedMotion}
              onChange={(v) => updateDisplaySettings({ reducedMotion: v })}
              label="Reduced Motion"
            />
          </div>
        </HUDPanel>

        {/* Audio Settings */}
        <HUDPanel className="mb-6" padding="lg">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Audio Settings
          </h2>

          <div className="space-y-6">
            <Slider
              value={settings.audio.masterVolume}
              onChange={(v) => updateAudioSettings({ masterVolume: v })}
              label="Master Volume"
              min={0}
              max={100}
            />
            <Slider
              value={settings.audio.sfxVolume}
              onChange={(v) => updateAudioSettings({ sfxVolume: v })}
              label="Sound Effects"
              min={0}
              max={100}
            />
            <Slider
              value={settings.audio.musicVolume}
              onChange={(v) => updateAudioSettings({ musicVolume: v })}
              label="Music"
              min={0}
              max={100}
            />
          </div>
        </HUDPanel>

        {/* Control Settings */}
        <HUDPanel className="mb-6" padding="lg">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Control Settings
          </h2>

          <div className="space-y-6">
            <Slider
              value={settings.controls.sensitivity * 100}
              onChange={(v) =>
                updateControlSettings({ sensitivity: v / 100 })
              }
              label="Sensitivity"
              min={50}
              max={200}
            />

            <div className="flex items-center justify-between">
              <div>
                <div
                  className="font-medium"
                  style={{ color: cyberTheme.colors.text.primary }}
                >
                  Touch Mode
                </div>
                <div
                  className="text-sm"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  How touch controls work
                </div>
              </div>
              <Select
                options={[
                  { value: 'direct', label: 'Direct' },
                  { value: 'relative', label: 'Relative' },
                ]}
                value={settings.controls.touchMode}
                onChange={(v) =>
                  updateControlSettings({ touchMode: v as 'direct' | 'relative' })
                }
                size="sm"
              />
            </div>
          </div>
        </HUDPanel>

        {/* Danger Zone */}
        <HUDPanel padding="lg" className="border-red-500/30">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-4"
            style={{
              color: cyberTheme.colors.error,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Danger Zone
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <div
                className="font-medium"
                style={{ color: cyberTheme.colors.text.primary }}
              >
                Reset All Data
              </div>
              <div
                className="text-sm"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                Delete all progress, stats, and settings
              </div>
            </div>
            <CyberButton
              variant="danger"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset
            </CyberButton>
          </div>
        </HUDPanel>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Confirm Reset"
        size="sm"
      >
        <div className="text-center">
          <p
            className="mb-6"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Are you sure you want to reset all data? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <CyberButton
              variant="ghost"
              onClick={() => setShowResetConfirm(false)}
              className="flex-1"
            >
              Cancel
            </CyberButton>
            <CyberButton
              variant="danger"
              onClick={handleResetAll}
              className="flex-1"
            >
              Reset All
            </CyberButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

'use client';

/**
 * CreateGameModal - Create a new multiplayer game
 *
 * Displays wallet info and creates a multiplayer game via the game API.
 * On success, generates unique game ID and transitions to waiting state.
 */

import React, { useState, useMemo } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useGameAPI } from '@/hooks/useGameAPI';
import { useGameStore } from '@/stores/gameStore';
import { generateGameId } from '@/lib/cyber/gameId';
import { Modal } from '../ui/Modal';
import { CyberButton } from '../ui/CyberButton';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreateState = 'idle' | 'creating' | 'success' | 'error';

export function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const [state, setState] = useState<CreateState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  const { address, shortAddress, isConnected } = useDynamicWallet();
  const { createGame, isLoading } = useGameAPI();
  const createMultiplayerGame = useGameStore((s) => s.createMultiplayerGame);

  // Generate stable playerId once per modal instance - will be stored in game store
  // Append "-creator" to distinguish from joiner even if same wallet is used (testing on same machine)
  const playerId = useMemo(() => {
    const base = address || `player-${Math.random().toString(36).slice(2, 10)}`;
    return `${base}-creator`;
  }, [address]);

  const handleCreateGame = async () => {

    setState('creating');
    setError(null);

    try {
      // Generate unique room code for display
      const roomCode = generateGameId();

      // Create game via API - returns actual gameId
      const actualGameId = await createGame('0', roomCode);

      // Display the roomCode to user (more friendly than numeric ID)
      setGameId(roomCode);

      // Update store with actual gameId for API calls, roomCode for display, and playerId for WebSocket
      createMultiplayerGame(actualGameId, roomCode, address, playerId);

      setState('success');

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        resetState();
      }, 500);
    } catch (err) {
      console.error('[CreateGameModal] Error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const resetState = () => {
    setState('idle');
    setError(null);
    setGameId(null);
  };

  const handleClose = () => {
    if (state === 'creating') return; // Don't close while processing
    resetState();
    onClose();
  };

  const isProcessing = state === 'creating' || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Game"
      size="sm"
      closeOnOverlay={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      <div className="space-y-3 sm:space-y-6">
        {/* Wallet Info */}
        <div
          className="p-3 sm:p-4 rounded-lg"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${isConnected ? cyberTheme.colors.border.default : cyberTheme.colors.warning + '60'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Your Wallet
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isConnected ? cyberTheme.colors.success : cyberTheme.colors.warning }}
              />
              <span
                className="font-mono text-sm"
                style={{ color: isConnected ? cyberTheme.colors.success : cyberTheme.colors.warning }}
              >
                {shortAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-center">
          <p
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Creating a game will set up a multiplayer room. Share the Game ID with your opponent.
          </p>
        </div>

        {/* Game ID Preview (when creating) */}
        {gameId && (
          <div
            className="p-3 sm:p-4 rounded-lg text-center"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}10`,
              border: `1px solid ${cyberTheme.colors.primary}30`,
            }}
          >
            <span
              className="text-xs uppercase tracking-wider block mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Game ID
            </span>
            <span
              className="font-mono text-2xl font-bold"
              style={{
                color: cyberTheme.colors.primary,
                letterSpacing: '0.1em',
              }}
            >
              {gameId}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: `${cyberTheme.colors.error}10`,
              border: `1px solid ${cyberTheme.colors.error}30`,
              color: cyberTheme.colors.error,
            }}
          >
            {error}
          </div>
        )}

        {/* Status Messages */}
        {state === 'creating' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Creating game...
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <CyberButton
            variant="ghost"
            className="flex-1"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </CyberButton>
          <CyberButton
            variant="primary"
            className="flex-1"
            onClick={handleCreateGame}
            disabled={isProcessing || state === 'success'}
          >
            {state === 'idle' && 'Create Game'}
            {state === 'creating' && 'Creating...'}
            {state === 'success' && 'Success!'}
            {state === 'error' && 'Try Again'}
          </CyberButton>
        </div>

        {/* Info */}
        <div
          className="text-xs text-center"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          This transaction is free and does not cost any gas fees.
        </div>
      </div>
    </Modal>
  );
}

export default CreateGameModal;

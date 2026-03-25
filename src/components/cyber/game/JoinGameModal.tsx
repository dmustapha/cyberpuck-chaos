'use client';

/**
 * JoinGameModal - Join an existing multiplayer game
 *
 * User enters a Game ID and joins a multiplayer game via the game API.
 * Connects to WebSocket room and transitions to ready state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useGameAPI } from '@/hooks/useGameAPI';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayerContext } from '@/contexts/MultiplayerContext';
import { isValidGameId, normalizeGameId } from '@/lib/cyber/gameId';
import { Modal } from '../ui/Modal';
import { CyberButton } from '../ui/CyberButton';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type JoinState = 'idle' | 'validating' | 'joining' | 'connecting' | 'success' | 'error';

export function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const [gameIdInput, setGameIdInput] = useState('');
  const [state, setState] = useState<JoinState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [actualGameId, setActualGameId] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { address, shortAddress, isConnected: walletConnected, connect: connectWallet } = useDynamicWallet();
  const { joinGame, isLoading } = useGameAPI();
  const joinMultiplayerGame = useGameStore((s) => s.joinMultiplayerGame);
  const setRoomId = useGameStore((s) => s.setRoomId);

  const normalizedGameId = normalizeGameId(gameIdInput);
  // Append "-joiner" to distinguish from creator even if same wallet is used (testing on same machine)
  const playerId = `${address || `player-${Date.now()}`}-joiner`;

  // Shared WebSocket connection from context
  const {
    isConnected,
    isConnecting,
    connectionError,
    playerNumber,
    opponentJoined,
    connect,
    disconnect,
  } = useMultiplayerContext();

  // Connect when shouldConnect becomes true
  useEffect(() => {
    if (shouldConnect && actualGameId && playerId) {
      connect(actualGameId, playerId);
    }
  }, [shouldConnect, actualGameId, playerId, connect]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle successful room join
  useEffect(() => {
    if (state === 'connecting' && isConnected && playerNumber) {
      console.log('[JoinGameModal] Successfully joined room, player:', playerNumber);

      // Placeholder creator wallet until server provides it
      const mockCreatorWallet = '0x' + '1'.repeat(40);

      // Update store with joined game (use actualGameId for API, roomCode for display, playerId for WebSocket)
      joinMultiplayerGame(actualGameId, roomCode, mockCreatorWallet, address!, playerId);
      setRoomId(actualGameId);

      setState('success');

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        resetState();
      }, 500);
    }
  }, [state, isConnected, playerNumber, actualGameId, roomCode, address, joinMultiplayerGame, setRoomId, onClose]);

  // Handle WebSocket errors
  useEffect(() => {
    if (connectionError && state === 'connecting') {
      setState('error');
      setError(connectionError);
    }
  }, [connectionError, state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format as user types
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Add dash after 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }

    setGameIdInput(value);
    setError(null);
  };

  const handleJoinGame = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setState('validating');
    setError(null);

    // Validate Game ID (user enters roomCode)
    const normalizedId = normalizeGameId(gameIdInput);
    if (!isValidGameId(normalizedId)) {
      setState('error');
      setError('Invalid Game ID format. Please enter a valid ID (e.g., A3B7-K9M2)');
      return;
    }

    setState('joining');

    try {
      // Join game via API (returns actual gameId)
      const result = await joinGame(normalizedId);

      // Store both the actual gameId and the roomCode
      setActualGameId(result.gameId);
      setRoomCode(result.game.roomCode || normalizedId);

      // Start WebSocket connection
      setState('connecting');
      setShouldConnect(true);

    } catch (err) {
      console.error('[JoinGameModal] Error:', err);
      setState('error');

      if (err instanceof Error) {
        if (err.message.includes('rejected')) {
          setError('Operation rejected. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to join game. Please check the Game ID and try again.');
      }
    }
  };

  const resetState = () => {
    setState('idle');
    setError(null);
    setGameIdInput('');
    setShouldConnect(false);
    setActualGameId('');
    setRoomCode('');
  };

  const handleClose = () => {
    if (state === 'joining' || state === 'connecting') return;

    // Disconnect WebSocket if we started connecting
    if (shouldConnect) {
      disconnect();
    }

    resetState();
    onClose();
  };

  const isProcessing = state === 'validating' || state === 'joining' || state === 'connecting' || isLoading;
  const canJoin = walletConnected && gameIdInput.length >= 9 && !isProcessing; // XXXX-XXXX = 9 chars

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Game"
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
            border: `1px solid ${walletConnected ? cyberTheme.colors.border.default : cyberTheme.colors.warning + '60'}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Your Wallet
            </span>
            {walletConnected ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cyberTheme.colors.success }}
                />
                <span
                  className="font-mono text-sm"
                  style={{ color: cyberTheme.colors.success }}
                >
                  {shortAddress}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-3 py-1 rounded-md transition-colors"
                style={{
                  backgroundColor: `${cyberTheme.colors.warning}20`,
                  border: `1px solid ${cyberTheme.colors.warning}40`,
                  color: cyberTheme.colors.warning,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cyberTheme.colors.warning }}
                />
                <span className="text-xs uppercase tracking-wider font-bold">
                  Connect Wallet
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Game ID Input */}
        <div>
          <label
            className="block text-xs uppercase tracking-wider mb-2"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Enter Game ID
          </label>
          <input
            ref={inputRef}
            type="text"
            value={gameIdInput}
            onChange={handleInputChange}
            placeholder="XXXX-XXXX"
            maxLength={9}
            disabled={isProcessing}
            className="w-full p-3 sm:p-4 rounded-lg font-mono text-xl sm:text-2xl text-center tracking-[0.1em] sm:tracking-[0.15em] placeholder:tracking-[0.1em] sm:placeholder:tracking-[0.15em] outline-none transition-all"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${error ? cyberTheme.colors.error : gameIdInput.length === 9 ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              color: cyberTheme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = cyberTheme.colors.primary;
              e.target.style.boxShadow = cyberTheme.shadows.glow(cyberTheme.colors.primary);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? cyberTheme.colors.error : gameIdInput.length === 9 ? cyberTheme.colors.success : cyberTheme.colors.border.default;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

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
        {state === 'validating' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Validating game ID...
          </div>
        )}

        {state === 'joining' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Joining game...
          </div>
        )}

        {state === 'connecting' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Connecting to game server...
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
            variant="success"
            className="flex-1"
            onClick={handleJoinGame}
            disabled={!canJoin || state === 'success'}
          >
            {state === 'idle' && 'Join Game'}
            {state === 'validating' && 'Checking...'}
            {state === 'joining' && 'Joining...'}
            {state === 'connecting' && 'Connecting...'}
            {state === 'success' && 'Success!'}
            {state === 'error' && 'Try Again'}
          </CyberButton>
        </div>

        {/* Info */}
        <div
          className="text-xs text-center"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Ask your opponent for the Game ID they received when creating the game.
        </div>
      </div>
    </Modal>
  );
}

export default JoinGameModal;

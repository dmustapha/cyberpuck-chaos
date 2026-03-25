'use client';

/**
 * GameReadyScreen - Both players connected, game about to start
 *
 * Shows both players' wallet addresses and countdown status.
 * With server-authoritative architecture, the game starts automatically
 * once both players have joined (no manual ready-up needed).
 */

import React, { useEffect } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useMultiplayerContext } from '@/contexts/MultiplayerContext';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface GameReadyScreenProps {
  className?: string;
}

export function GameReadyScreen({ className = '' }: GameReadyScreenProps) {
  const { shortAddress } = useDynamicWallet();
  const multiplayerGameInfo = useGameStore((s) => s.multiplayerGameInfo);
  const startMultiplayerMatch = useGameStore((s) => s.startMultiplayerMatch);
  const goToMultiplayerLobby = useGameStore((s) => s.goToMultiplayerLobby);
  const resetMultiplayer = useGameStore((s) => s.resetMultiplayer);

  const gameId = multiplayerGameInfo?.gameId || '';
  // Display roomCode (friendly format like "7FKK-YVWM") instead of numeric gameId
  const displayGameId = multiplayerGameInfo?.roomCode || 'XXXX-XXXX';
  const isCreator = multiplayerGameInfo?.isCreator || false;
  // Use the playerId stored in the game store (set when game was created/joined)
  const playerId = multiplayerGameInfo?.playerId || '';

  // Shared WebSocket connection from context
  const {
    isConnected,
    connectionError,
    playerNumber,
    opponentJoined,
    countdown,
    gameStatus,
    connect,
    disconnect,
  } = useMultiplayerContext();

  // Ensure connected to the game (connection should persist from WaitingScreen)
  useEffect(() => {
    if (gameId && playerId) {
      connect(gameId, playerId);
    }
  }, [gameId, playerId, connect]);

  // Debug: Log all context state changes
  useEffect(() => {
    console.log('[GameReadyScreen] Context state:', {
      isConnected,
      playerNumber,
      opponentJoined,
      countdown,
      gameStatus,
    });
  }, [isConnected, playerNumber, opponentJoined, countdown, gameStatus]);

  // When game transitions to playing, start the match
  useEffect(() => {
    console.log('[GameReadyScreen] Checking gameStatus:', gameStatus);
    if (gameStatus === 'playing') {
      console.log('[GameReadyScreen] Game starting! Calling startMultiplayerMatch()');
      startMultiplayerMatch();
    }
  }, [gameStatus, startMultiplayerMatch]);

  // Get opponent wallet display
  const getOpponentDisplay = () => {
    if (isCreator) {
      const opponentWallet = multiplayerGameInfo?.opponentWallet;
      if (opponentWallet) {
        return `${opponentWallet.slice(0, 6)}...${opponentWallet.slice(-4)}`;
      }
      return 'Connecting...';
    } else {
      const creatorWallet = multiplayerGameInfo?.creatorWallet;
      if (creatorWallet) {
        return `${creatorWallet.slice(0, 6)}...${creatorWallet.slice(-4)}`;
      }
      return 'Connecting...';
    }
  };

  const handleCancel = () => {
    disconnect();
    resetMultiplayer();
    goToMultiplayerLobby();
  };

  const isInCountdown = gameStatus === 'countdown' && countdown !== null;
  const isWaitingForOpponent = !opponentJoined;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.primary,
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, ${cyberTheme.colors.primary}15 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${cyberTheme.colors.secondary}10 0%, transparent 40%)
        `,
      }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${cyberTheme.colors.border.subtle} 1px, transparent 1px),
            linear-gradient(90deg, ${cyberTheme.colors.border.subtle} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <HUDPanel className="relative z-10 w-full max-w-lg" variant="glow" padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚔️</div>
          <h1
            className="text-2xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {isInCountdown ? 'MATCH STARTING' : 'MATCH READY'}
          </h1>
          <div
            className="font-mono text-sm"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Game ID: <span style={{ color: cyberTheme.colors.primary }}>{displayGameId}</span>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div
            className="p-3 rounded-lg text-center mb-6"
            style={{
              backgroundColor: `${cyberTheme.colors.warning}10`,
              border: `1px solid ${cyberTheme.colors.warning}30`,
            }}
          >
            <span className="text-sm" style={{ color: cyberTheme.colors.warning }}>
              {connectionError || 'Reconnecting to game server...'}
            </span>
          </div>
        )}

        {/* Countdown Display */}
        {isInCountdown && (
          <div className="text-center mb-8">
            <div
              className="text-8xl font-black animate-pulse"
              style={{
                color: cyberTheme.colors.primary,
                textShadow: cyberTheme.shadows.glowText(cyberTheme.colors.primary),
              }}
            >
              {countdown}
            </div>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Player 1 (You) */}
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${isConnected ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              boxShadow: isConnected ? cyberTheme.shadows.glow(cyberTheme.colors.success) : 'none',
            }}
          >
            <div className="text-4xl mb-3">
              {playerNumber === 1 ? '👑' : '🎮'}
            </div>
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {playerNumber === 1 ? 'Player 1 (You)' : 'Player 2 (You)'}
            </div>
            <div
              className="font-mono text-sm mb-3"
              style={{ color: cyberTheme.colors.player.you }}
            >
              {shortAddress}
            </div>
            <div
              className="text-xs uppercase tracking-wider py-1 px-3 rounded-full inline-block"
              style={{
                backgroundColor: `${cyberTheme.colors.success}20`,
                color: cyberTheme.colors.success,
              }}
            >
              CONNECTED
            </div>
          </div>

          {/* Player 2 (Opponent) */}
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${opponentJoined ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              boxShadow: opponentJoined ? cyberTheme.shadows.glow(cyberTheme.colors.success) : 'none',
            }}
          >
            <div
              className="text-4xl mb-3"
              style={{ filter: opponentJoined ? 'none' : 'grayscale(1) opacity(0.5)' }}
            >
              {playerNumber === 1 ? '🎮' : '👑'}
            </div>
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {playerNumber === 1 ? 'Player 2' : 'Player 1'}
            </div>
            <div
              className="font-mono text-sm mb-3"
              style={{ color: cyberTheme.colors.player.opponent }}
            >
              {opponentJoined ? getOpponentDisplay() : 'Waiting...'}
            </div>
            <div
              className="text-xs uppercase tracking-wider py-1 px-3 rounded-full inline-block"
              style={{
                backgroundColor: opponentJoined
                  ? `${cyberTheme.colors.success}20`
                  : `${cyberTheme.colors.warning}20`,
                color: opponentJoined
                  ? cyberTheme.colors.success
                  : cyberTheme.colors.warning,
              }}
            >
              {opponentJoined ? 'CONNECTED' : 'WAITING'}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div
          className="text-center text-4xl font-black mb-8"
          style={{
            color: cyberTheme.colors.text.muted,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          VS
        </div>

        {/* Status Message */}
        <div className="text-center space-y-4">
          {isWaitingForOpponent && (
            <div
              className="text-lg animate-pulse"
              style={{ color: cyberTheme.colors.warning }}
            >
              Waiting for opponent to join...
            </div>
          )}

          {opponentJoined && !isInCountdown && (
            <div
              className="text-lg animate-pulse"
              style={{ color: cyberTheme.colors.info }}
            >
              Both players connected! Starting soon...
            </div>
          )}

          {isInCountdown && (
            <div
              className="text-xl font-bold uppercase"
              style={{ color: cyberTheme.colors.success }}
            >
              Get Ready!
            </div>
          )}
        </div>

        {/* Cancel button */}
        <div className="mt-6 text-center">
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isInCountdown}
          >
            Leave Match
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default GameReadyScreen;

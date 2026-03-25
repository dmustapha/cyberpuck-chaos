'use client';

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { AIR_HOCKEY_ABI } from './abi';
import { CONTRACT_ADDRESS } from './config';

if (typeof window !== 'undefined' && !CONTRACT_ADDRESS) {
  console.warn('[AirHockey] Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS env var.');
}

// ── Types matching the contract structs ──

export enum GameStatus {
  Waiting = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface OnChainGame {
  id: bigint;
  creator: `0x${string}`;
  opponent: `0x${string}`;
  status: GameStatus;
  winner: `0x${string}`;
  player1Score: number;
  player2Score: number;
  roomCode: string;
  createdAt: bigint;
}

export interface PlayerStats {
  gamesPlayed: bigint;
  wins: bigint;
  losses: bigint;
}

// ── Write Hooks ──

export function useCreateGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const createGame = (roomCode: string) => {
    if (!CONTRACT_ADDRESS)
      throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AIR_HOCKEY_ABI,
      functionName: 'createGame',
      args: [roomCode],
    });
  };

  return { createGame, hash, isPending, isConfirming, isSuccess, error };
}

export function useJoinGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const joinGame = (gameId: bigint) => {
    if (!CONTRACT_ADDRESS)
      throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AIR_HOCKEY_ABI,
      functionName: 'joinGame',
      args: [gameId],
    });
  };

  return { joinGame, hash, isPending, isConfirming, isSuccess, error };
}

// Note: submitResult is oracle-only on-chain. Only the designated oracle address can call this.
export function useSubmitResult() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const submitResult = (gameId: bigint, p1Score: number, p2Score: number) => {
    if (!CONTRACT_ADDRESS)
      throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AIR_HOCKEY_ABI,
      functionName: 'submitResult',
      args: [gameId, p1Score, p2Score],
    });
  };

  return { submitResult, hash, isPending, isConfirming, isSuccess, error };
}

export function useCancelGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const cancelGame = (gameId: bigint) => {
    if (!CONTRACT_ADDRESS)
      throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AIR_HOCKEY_ABI,
      functionName: 'cancelGame',
      args: [gameId],
    });
  };

  return { cancelGame, hash, isPending, isConfirming, isSuccess, error };
}

export function useExpireGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });

  const expireGame = (gameId: bigint) => {
    if (!CONTRACT_ADDRESS)
      throw new Error('Contract address not configured. Set NEXT_PUBLIC_CONTRACT_ADDRESS.');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: AIR_HOCKEY_ABI,
      functionName: 'expireGame',
      args: [gameId],
    });
  };

  return { expireGame, hash, isPending, isConfirming, isSuccess, error };
}

// ── Read Hooks ──

export function useGameData(gameId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AIR_HOCKEY_ABI,
    functionName: 'getGame',
    args: gameId !== undefined ? [gameId] : undefined,
    query: { enabled: gameId !== undefined && !!CONTRACT_ADDRESS },
  });
}

export function useGameByRoomCode(roomCode: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AIR_HOCKEY_ABI,
    functionName: 'getGameByRoomCode',
    args: roomCode ? [roomCode] : undefined,
    query: { enabled: !!roomCode && !!CONTRACT_ADDRESS },
  });
}

export function usePlayerStats(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const playerAddress = address || connectedAddress;

  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: AIR_HOCKEY_ABI,
    functionName: 'getPlayerStats',
    args: playerAddress ? [playerAddress] : undefined,
    query: { enabled: !!playerAddress && !!CONTRACT_ADDRESS },
  });
}

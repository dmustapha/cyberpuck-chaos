'use client';

import { useRef, useCallback, useMemo } from 'react';

interface Snapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seq: number;
  timestamp: number;
}

interface InterpolatedPosition {
  x: number;
  y: number;
}

interface InterpolationOptions {
  delayMs?: number;        // Render delay for smooth interpolation (default: 50ms)
  maxSnapshots?: number;   // Max snapshots to keep (default: 30)
  maxExtrapolateMs?: number; // Max time to extrapolate into the future (default: 100ms)
}

/**
 * Hook for interpolating puck position from network snapshots.
 * Uses snapshot interpolation with a small render delay for smooth visuals.
 *
 * Note on velocity units:
 * - Matter.js velocity is in pixels per tick (typically ~16.67ms at 60fps)
 * - We receive raw Matter.js velocity values
 * - For extrapolation: position += velocity * (elapsedMs / 16.67)
 */
export function useInterpolation(options: InterpolationOptions = {}) {
  const {
    delayMs = 50,           // 50ms render delay (3 frames at 60fps)
    maxSnapshots = 30,      // Keep 30 snapshots (~1 second at 30Hz)
    maxExtrapolateMs = 100, // Don't extrapolate more than 100ms
  } = options;

  const snapshotsRef = useRef<Snapshot[]>([]);
  const lastSeqRef = useRef<number>(-1);

  // Threshold for detecting position jumps (e.g., puck reset to center)
  // If position changes by more than this in one update, clear the buffer
  const JUMP_THRESHOLD = 100; // pixels

  /**
   * Add a new snapshot from the network.
   * Snapshots are expected in order (by seq), but we handle out-of-order arrivals.
   * Detects position jumps (like puck reset) and clears buffer to prevent interpolation artifacts.
   */
  const addSnapshot = useCallback((data: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    seq: number;
  }) => {
    // Ignore old/duplicate snapshots
    if (data.seq <= lastSeqRef.current) {
      return;
    }

    // Check for position jump (puck reset detection)
    const snapshots = snapshotsRef.current;
    if (snapshots.length > 0) {
      const last = snapshots[snapshots.length - 1];
      const dx = data.x - last.x;
      const dy = data.y - last.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If position jumped significantly, clear buffer to prevent interpolation artifacts
      if (distance > JUMP_THRESHOLD) {
        snapshotsRef.current = [];
      }
    }

    const snapshot: Snapshot = {
      ...data,
      timestamp: Date.now(),
    };

    snapshotsRef.current.push(snapshot);
    lastSeqRef.current = data.seq;

    // Keep only the most recent snapshots
    if (snapshotsRef.current.length > maxSnapshots) {
      snapshotsRef.current.shift();
    }
  }, [maxSnapshots]);

  /**
   * Get the interpolated puck position for the current render frame.
   * Returns null if no snapshots are available.
   */
  const getInterpolatedPosition = useCallback((): InterpolatedPosition | null => {
    const snapshots = snapshotsRef.current;

    if (snapshots.length === 0) {
      return null;
    }

    // If only one snapshot, return it directly
    if (snapshots.length === 1) {
      return { x: snapshots[0].x, y: snapshots[0].y };
    }

    // Calculate render time (slightly in the past for smooth interpolation)
    const renderTime = Date.now() - delayMs;

    // Find the two snapshots surrounding our render time
    let before: Snapshot | null = null;
    let after: Snapshot | null = null;

    for (let i = 0; i < snapshots.length - 1; i++) {
      if (snapshots[i].timestamp <= renderTime && snapshots[i + 1].timestamp >= renderTime) {
        before = snapshots[i];
        after = snapshots[i + 1];
        break;
      }
    }

    // Case 1: Found surrounding snapshots - interpolate
    if (before && after) {
      const range = after.timestamp - before.timestamp;
      const t = range > 0 ? (renderTime - before.timestamp) / range : 0;
      const clampedT = Math.max(0, Math.min(1, t));

      return {
        x: before.x + (after.x - before.x) * clampedT,
        y: before.y + (after.y - before.y) * clampedT,
      };
    }

    // Case 2: Render time is before all snapshots - use oldest
    if (snapshots[0].timestamp > renderTime) {
      return { x: snapshots[0].x, y: snapshots[0].y };
    }

    // Case 3: Render time is after all snapshots - extrapolate from latest
    const latest = snapshots[snapshots.length - 1];
    const elapsedMs = Date.now() - latest.timestamp;

    // Don't extrapolate too far into the future
    if (elapsedMs > maxExtrapolateMs) {
      return { x: latest.x, y: latest.y };
    }

    // Extrapolate using velocity
    // Matter.js velocity is pixels per tick (~16.67ms)
    // So: position += velocity * (elapsedMs / 16.67)
    const ticksElapsed = elapsedMs / 16.67;

    return {
      x: latest.x + latest.vx * ticksElapsed,
      y: latest.y + latest.vy * ticksElapsed,
    };
  }, [delayMs, maxExtrapolateMs]);

  /**
   * Get the most recent raw position (no interpolation).
   * Useful for collision detection or when low latency is more important than smoothness.
   */
  const getLatestPosition = useCallback((): InterpolatedPosition | null => {
    const snapshots = snapshotsRef.current;
    if (snapshots.length === 0) return null;

    const latest = snapshots[snapshots.length - 1];
    return { x: latest.x, y: latest.y };
  }, []);

  /**
   * Get the current velocity from the latest snapshot.
   */
  const getVelocity = useCallback((): { vx: number; vy: number } | null => {
    const snapshots = snapshotsRef.current;
    if (snapshots.length === 0) return null;

    const latest = snapshots[snapshots.length - 1];
    return { vx: latest.vx, vy: latest.vy };
  }, []);

  /**
   * Clear all snapshots (e.g., on game reset).
   */
  const clear = useCallback(() => {
    snapshotsRef.current = [];
    lastSeqRef.current = -1;
  }, []);

  /**
   * Get the number of buffered snapshots.
   */
  const getBufferSize = useCallback(() => snapshotsRef.current.length, []);

  return useMemo(() => ({
    addSnapshot,
    getInterpolatedPosition,
    getLatestPosition,
    getVelocity,
    clear,
    getBufferSize,
  }), [addSnapshot, getInterpolatedPosition, getLatestPosition, getVelocity, clear, getBufferSize]);
}

/**
 * Hook for interpolating opponent paddle position.
 * Uses simpler lerp since paddle updates are less frequent.
 */
export function usePaddleInterpolation(smoothing = 0.3) {
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const currentRef = useRef<{ x: number; y: number } | null>(null);

  const setTarget = useCallback((x: number, y: number) => {
    targetRef.current = { x, y };
    // Initialize current if not set
    if (!currentRef.current) {
      currentRef.current = { x, y };
    }
  }, []);

  const getPosition = useCallback((): { x: number; y: number } | null => {
    if (!targetRef.current || !currentRef.current) {
      return targetRef.current;
    }

    // Lerp toward target
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing;

    return { ...currentRef.current };
  }, [smoothing]);

  const clear = useCallback(() => {
    targetRef.current = null;
    currentRef.current = null;
  }, []);

  return useMemo(() => ({ setTarget, getPosition, clear }), [setTarget, getPosition, clear]);
}

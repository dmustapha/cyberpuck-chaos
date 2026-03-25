'use client';

import { useEffect, useCallback, useRef, RefObject } from 'react';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

interface UsePlayerInputOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onMove: (x: number, y: number) => void;
  enabled: boolean;
}

export function usePlayerInput({
  canvasRef,
  onMove,
  enabled,
}: UsePlayerInputOptions) {
  // Track current smoothed position
  const currentPosRef = useRef({ x: PHYSICS_CONFIG.table.width / 2, y: PHYSICS_CONFIG.table.height * 0.85 });
  const isTrackingRef = useRef(false);
  const lastCanvasRectRef = useRef<DOMRect | null>(null);
  const prevEnabledRef = useRef(enabled);

  // Update canvas rect periodically (handles resize)
  const updateCanvasRect = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      lastCanvasRectRef.current = canvas.getBoundingClientRect();
    }
  }, [canvasRef]);

  const getCanvasPosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = lastCanvasRectRef.current;
      if (!rect) return null;

      const scaleX = PHYSICS_CONFIG.table.width / rect.width;
      const scaleY = PHYSICS_CONFIG.table.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  useEffect(() => {
    // Detect enabled transition from false to true (e.g., after goal countdown)
    const wasEnabled = prevEnabledRef.current;
    prevEnabledRef.current = enabled;

    if (!enabled) {
      isTrackingRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update canvas rect initially and on resize
    updateCanvasRect();

    // Auto-resume tracking when enabled transitions from false to true
    // This prevents requiring a click after goals/pauses
    if (!wasEnabled && enabled) {
      isTrackingRef.current = true;
    }
    window.addEventListener('resize', updateCanvasRect);

    // Use raw position - smoothing is handled in physics engine
    const handleMove = (clientX: number, clientY: number) => {
      const pos = getCanvasPosition(clientX, clientY);
      if (!pos) return;

      // Pass raw position directly - velocity tracking needs accurate deltas
      currentPosRef.current = { x: pos.x, y: pos.y };
      onMove(pos.x, pos.y);
    };

    // Mouse events - track on document to prevent losing cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTrackingRef.current) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Check if click is on or near the canvas
      const rect = lastCanvasRectRef.current;
      if (!rect) return;

      const isNearCanvas =
        e.clientX >= rect.left - 50 &&
        e.clientX <= rect.right + 50 &&
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50;

      if (isNearCanvas) {
        isTrackingRef.current = true;
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      // Keep tracking even after mouse up for continuous control
      // Only stop if mouse leaves the general area
    };

    const handleMouseLeave = () => {
      // Stop tracking when mouse leaves document
      isTrackingRef.current = false;
    };

    // Touch events
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isTrackingRef.current = true;
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      isTrackingRef.current = false;
    };

    // Auto-start tracking when mouse is over canvas
    const handleCanvasMouseEnter = () => {
      isTrackingRef.current = true;
    };

    // Document-level mouse events for smooth tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Canvas-specific events
    canvas.addEventListener('mouseenter', handleCanvasMouseEnter);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('resize', updateCanvasRect);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mouseenter', handleCanvasMouseEnter);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasRef, onMove, enabled, getCanvasPosition, updateCanvasRect]);

  // Reset position when disabled
  useEffect(() => {
    if (!enabled) {
      currentPosRef.current = {
        x: PHYSICS_CONFIG.table.width / 2,
        y: PHYSICS_CONFIG.table.height * 0.85,
      };
    }
  }, [enabled]);
}

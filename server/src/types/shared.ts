// File: server/src/types/shared.ts
// Shared types and constants used by both server and client.
// Client imports via copy or shared package.

// === Modifier Types ===

export type ModifierType =
  | 'puck_speed'
  | 'paddle_size'
  | 'goal_width'
  | 'puck_size'
  | 'invisible_puck';

export type ModifierVariation =
  | 'boost'
  | 'slow'
  | 'shrink'
  | 'grow'
  | 'widen'
  | 'narrow'
  | 'hidden';

export type ModifierTarget = 'player1' | 'player2' | 'both' | 'puck';

export interface ActiveModifier {
  id: string;
  type: ModifierType;
  variation: ModifierVariation;
  target: ModifierTarget;
  intensity: number;
  duration: number;
  reason: string;
  startTime: number;
  expiresAt: number;
}

export interface ModifierAppliedMessage {
  type: 'MODIFIER_APPLIED';
  modifier: {
    id: string;
    type: ModifierType;
    variation: ModifierVariation;
    target: ModifierTarget;
    duration: number;
    reason: string;
    startTime: number;
  };
}

export interface ModifierExpiredMessage {
  type: 'MODIFIER_EXPIRED';
  modifierId: string;
}

// === Chaos Agent Types ===

export interface ChaosInput {
  score: [number, number];
  matchPhase: 'early' | 'mid' | 'late';
  recentModifiers: string[];
  matchTimeSeconds: number;
  maxScore: number;
}

export interface ModifierDecisionResult {
  action: 'deploy_modifier' | 'skip';
  modifier: {
    type: ModifierType;
    variation: ModifierVariation;
    target: ModifierTarget;
    reason: string;
  } | null;
}

// === Physics Config (UNIFIED — no mismatch between AI and multiplayer) ===

export const PHYSICS_CONFIG = {
  puckRadius: 14,
  puckRestitution: 0.95,
  puckFrictionAir: 0.001,
  puckMaxSpeed: 22,
  puckMinSpeed: 2,
  paddleRadius: 36,
  tableWidth: 400,
  tableHeight: 700,
  goalWidth: 120,
  wallThickness: 20,
} as const;

// === Chaos Agent Timing ===

// Score-based ramp thresholds: [mediumThreshold, fastThreshold]
export function getChaosThresholds(maxScore: number): [number, number] {
  switch (maxScore) {
    case 5: return [3, 4];
    case 7: return [4, 5];
    case 10: return [6, 8];
    default: return [Math.ceil(maxScore * 0.57), Math.ceil(maxScore * 0.71)];
  }
}

export const CHAOS_TIMING = {
  firstObserveDelay: 5_000,     // 5s before first modifier
  baseInterval: 5_000,          // 5s normal pace
  mediumInterval: 3_500,        // 3.5s getting intense
  fastInterval: 2_000,          // 2s endgame frenzy
  modifierDuration: 6_000,      // 6s per modifier
  maxActiveModifiers: 1,
  llmTimeoutMs: 8_000,
} as const;

export function getChaosInterval(highScore: number, maxScore: number): number {
  const [medium, fast] = getChaosThresholds(maxScore);
  if (highScore >= fast) return CHAOS_TIMING.fastInterval;
  if (highScore >= medium) return CHAOS_TIMING.mediumInterval;
  return CHAOS_TIMING.baseInterval;
}

// Local fallback pool — used when LLM is unreachable or returns null
// Balanced: 2 each of puck_speed, paddle_size, puck_size + 1 invisible_puck = 7 entries
// Anti-repeat tracks by TYPE so each type appears at most once per 3 observations
export const MODIFIER_FALLBACK_POOL: Array<{
  type: ModifierType;
  variation: ModifierVariation;
  target: ModifierTarget;
  reason: string;
}> = [
  { type: 'puck_speed', variation: 'boost', target: 'puck', reason: 'TURBO MODE! Puck is blazing fast!' },
  { type: 'paddle_size', variation: 'shrink', target: 'player2', reason: 'Paddle shrunk! Time to attack!' },
  { type: 'puck_size', variation: 'grow', target: 'puck', reason: 'Giant puck incoming!' },
  { type: 'invisible_puck', variation: 'hidden', target: 'puck', reason: 'Ghost puck! Where did it go?!' },
  { type: 'puck_speed', variation: 'slow', target: 'puck', reason: 'Slow motion activated!' },
  { type: 'puck_size', variation: 'shrink', target: 'puck', reason: 'Tiny puck! Precision mode!' },
  { type: 'paddle_size', variation: 'grow', target: 'player1', reason: 'Paddle powered up!' },
];

// === Modifier Definitions ===

export const MODIFIER_DEFS: Record<string, {
  type: ModifierType;
  variation: ModifierVariation;
  intensity: number;
  duration: number;
}> = {
  puck_speed_boost:  { type: 'puck_speed',     variation: 'boost',  intensity: 1.5, duration: 7_000 },
  puck_speed_slow:   { type: 'puck_speed',     variation: 'slow',   intensity: 0.5, duration: 7_000 },
  paddle_shrink:     { type: 'paddle_size',    variation: 'shrink', intensity: 0.6, duration: 8_000 },
  paddle_grow:       { type: 'paddle_size',    variation: 'grow',   intensity: 1.5, duration: 8_000 },
  goal_widen:        { type: 'goal_width',     variation: 'widen',  intensity: 1.3, duration: 6_000 },
  goal_narrow:       { type: 'goal_width',     variation: 'narrow', intensity: 0.7, duration: 6_000 },
  puck_grow:         { type: 'puck_size',      variation: 'grow',   intensity: 2.0, duration: 7_000 },
  puck_shrink:       { type: 'puck_size',      variation: 'shrink', intensity: 0.5, duration: 7_000 },
  invisible_puck:    { type: 'invisible_puck', variation: 'hidden', intensity: 1.0, duration: 3_000 },
};

// === Modifier Type → u8 Encoding (for Move contracts) ===

export const MODIFIER_TYPE_ENCODING: Record<ModifierType, number> = {
  puck_speed: 0,
  paddle_size: 1,
  goal_width: 2,
  puck_size: 3,
  invisible_puck: 4,
};

export const TARGET_ENCODING: Record<ModifierTarget, number> = {
  player1: 0,
  player2: 1,
  both: 2,
  puck: 3,
};

// === WebSocket Message Types (29 total: 27 existing + 2 new) ===

export const WS_MODIFIER_APPLIED = 'MODIFIER_APPLIED' as const;
export const WS_MODIFIER_EXPIRED = 'MODIFIER_EXPIRED' as const;

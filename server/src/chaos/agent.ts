// File: server/src/chaos/agent.ts
// Multiplayer chaos agent — ALWAYS deploys a modifier, never skips.
// Score-based frequency ramp matching AI-mode useLocalChaos.ts.
// Tracks recent modifiers to avoid repeats. Local fallback when LLM fails.

import { analyzeMatchSkill } from './skills';
import {
  CHAOS_TIMING,
  getChaosInterval,
  MODIFIER_FALLBACK_POOL,
} from '../types/shared';
import type { ChaosInput, ModifierDecisionResult, ModifierType, ModifierVariation, ModifierTarget } from '../types/shared';

export class ChaosAgent {
  private matchStartTime = 0;
  private active = false;
  private nextObserveTime = 0;
  private recentTypes: string[] = []; // last 3 modifier types for anti-repeat
  private poolIndex = 0;
  private decisionLog: Array<{
    timestamp: number;
    decision: ModifierDecisionResult;
  }> = [];

  start(matchStartTime: number): void {
    this.matchStartTime = matchStartTime;
    this.active = true;
    this.recentTypes = [];
    this.poolIndex = Math.floor(Math.random() * MODIFIER_FALLBACK_POOL.length);
    this.decisionLog = [];
    // First observation after fixed delay
    this.nextObserveTime = matchStartTime + CHAOS_TIMING.firstObserveDelay;
  }

  stop(): Array<{ timestamp: number; decision: ModifierDecisionResult }> {
    this.active = false;
    return [...this.decisionLog];
  }

  shouldObserve(now: number): boolean {
    return this.active && now >= this.nextObserveTime;
  }

  getRecentTypes(): string[] {
    return [...this.recentTypes];
  }

  private trackRecent(type: string): void {
    this.recentTypes.push(type);
    if (this.recentTypes.length > 3) this.recentTypes.shift();
  }

  private pickFromPool(): { type: ModifierType; variation: ModifierVariation; target: ModifierTarget; reason: string } {
    let attempts = 0;
    let mod = MODIFIER_FALLBACK_POOL[this.poolIndex % MODIFIER_FALLBACK_POOL.length];
    while (this.recentTypes.includes(mod.type) && attempts < MODIFIER_FALLBACK_POOL.length) {
      this.poolIndex++;
      mod = MODIFIER_FALLBACK_POOL[this.poolIndex % MODIFIER_FALLBACK_POOL.length];
      attempts++;
    }
    this.poolIndex++;
    return mod;
  }

  private scheduleNext(score: [number, number], maxScore: number): void {
    const highScore = Math.max(score[0], score[1]);
    const interval = getChaosInterval(highScore, maxScore);
    this.nextObserveTime = Date.now() + interval;
  }

  /**
   * Observe the game and ALWAYS return a modifier decision.
   * Tries LLM first, falls back to pool on failure or null result.
   */
  async observe(input: ChaosInput): Promise<ModifierDecisionResult> {
    if (!this.active) {
      return this.fallbackDecision(input.score, input.maxScore);
    }

    try {
      const resultStr = await Promise.race([
        analyzeMatchSkill.execute({
          score: input.score,
          matchPhase: input.matchPhase,
          recentModifiers: input.recentModifiers,
          matchTimeSeconds: input.matchTimeSeconds,
          maxScore: input.maxScore,
        }),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error('LLM timeout')),
            CHAOS_TIMING.llmTimeoutMs,
          ),
        ),
      ]);

      const decision: ModifierDecisionResult = JSON.parse(resultStr);
      this.decisionLog.push({ timestamp: Date.now(), decision });

      // If LLM returned a valid modifier, use it
      if (decision?.action === 'deploy_modifier' && decision.modifier) {
        this.trackRecent(decision.modifier.type);
        this.scheduleNext(input.score, input.maxScore);
        return decision;
      }

      // LLM returned skip or null modifier — force from pool
      return this.fallbackDecision(input.score, input.maxScore);
    } catch (err) {
      console.error('[ChaosAgent] observe failed:', err);
      return this.fallbackDecision(input.score, input.maxScore);
    }
  }

  private fallbackDecision(score: [number, number], maxScore: number): ModifierDecisionResult {
    const mod = this.pickFromPool();
    this.trackRecent(mod.type);
    this.scheduleNext(score, maxScore);

    const decision: ModifierDecisionResult = {
      action: 'deploy_modifier',
      modifier: {
        type: mod.type,
        variation: mod.variation,
        target: mod.target,
        reason: mod.reason,
      },
    };
    this.decisionLog.push({ timestamp: Date.now(), decision });
    return decision;
  }

  onModifierExpired(): void {
    // No-op — scheduling is handled in observe/fallback
  }
}

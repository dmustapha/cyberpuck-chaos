// File: server/src/chaos/agent.ts
// Copied from ARCHITECTURE.md Section 5 (lines 783-894)
import { analyzeMatchSkill } from './skills';
import { CHAOS_TIMING } from '../types/shared';
import type { ChaosInput, ModifierDecisionResult } from '../types/shared';

export class ChaosAgent {
  private matchStartTime = 0;
  private lastModifierEndTime = 0;
  private active = false;
  private nextObserveTime = 0;
  private decisionLog: Array<{
    timestamp: number;
    decision: ModifierDecisionResult;
  }> = [];

  start(matchStartTime: number): void {
    this.matchStartTime = matchStartTime;
    this.active = true;
    this.lastModifierEndTime = 0;
    this.decisionLog = [];

    // Schedule first observation at 10-20s after match start
    const firstDelay =
      CHAOS_TIMING.firstModifierMinDelay +
      Math.random() *
        (CHAOS_TIMING.firstModifierMaxDelay -
          CHAOS_TIMING.firstModifierMinDelay);
    this.nextObserveTime = matchStartTime + firstDelay;
  }

  stop(): Array<{ timestamp: number; decision: ModifierDecisionResult }> {
    this.active = false;
    return [...this.decisionLog];
  }

  shouldObserve(now: number): boolean {
    return this.active && now >= this.nextObserveTime;
  }

  async observe(input: ChaosInput): Promise<ModifierDecisionResult | null> {
    if (!this.active) return null;

    const now = Date.now();
    const elapsed = now - this.matchStartTime;
    const totalMs = input.matchDurationLimit * 1000;
    const remaining = totalMs - elapsed;

    // Guard: no modifier in first 10s
    if (elapsed < CHAOS_TIMING.noModifierStartMs) {
      this.scheduleNext(now);
      return null;
    }

    // Guard: no modifier in last 5s
    if (remaining < CHAOS_TIMING.noModifierEndMs) {
      this.active = false;
      return null;
    }

    // Guard: cool-down after previous modifier
    if (this.lastModifierEndTime > 0) {
      const cooldown =
        CHAOS_TIMING.cooldownMin +
        Math.random() * (CHAOS_TIMING.cooldownMax - CHAOS_TIMING.cooldownMin);
      if (now - this.lastModifierEndTime < cooldown) {
        this.scheduleNext(now);
        return null;
      }
    }

    try {
      const resultStr = await Promise.race([
        analyzeMatchSkill.execute({
          score: input.score,
          streaks: input.streaks,
          paddleActivity: input.paddleActivity,
          puckAvgSpeed: input.puckAvgSpeed,
          matchPhase: input.matchPhase,
          recentModifiers: input.recentModifiers,
          matchTimeSeconds: input.matchTimeSeconds,
        }),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error('LLM timeout')),
            CHAOS_TIMING.llmTimeoutMs,
          ),
        ),
      ]);

      const decision: ModifierDecisionResult = JSON.parse(resultStr);
      this.decisionLog.push({ timestamp: now, decision });
      this.scheduleNext(now);
      return decision;
    } catch (err) {
      console.error('[ChaosAgent] observe failed:', err);
      this.scheduleNext(now);
      return null;
    }
  }

  onModifierExpired(): void {
    this.lastModifierEndTime = Date.now();
  }

  private scheduleNext(now: number): void {
    const interval =
      CHAOS_TIMING.intervalMin +
      Math.random() * (CHAOS_TIMING.intervalMax - CHAOS_TIMING.intervalMin);
    this.nextObserveTime = now + interval;
  }
}

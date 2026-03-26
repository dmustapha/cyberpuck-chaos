// File: server/src/chaos/middleware.ts
// Copied from ARCHITECTURE.md Section 7 (lines 1155-1250)
import { ChaosAgent } from './agent';
import { ModifierExecutor, type PhysicsBodies } from './executor';
import {
  type ActiveModifier,
  type ChaosInput,
  type ModifierDecisionResult,
} from '../types/shared';

export interface ChaosEvent {
  type: 'modifier_applied' | 'modifier_expired';
  modifier?: ActiveModifier;
  modifierId?: string;
}

export class ChaosMiddleware {
  private agent = new ChaosAgent();
  private executor = new ModifierExecutor();
  private observing = false;
  private pendingEvent: ChaosEvent | null = null;

  get activeModifier(): ActiveModifier | null {
    return this.executor.current;
  }

  getRecentTypes(): string[] {
    return this.agent.getRecentTypes();
  }

  onMatchStart(matchStartTime: number): void {
    this.agent.start(matchStartTime);
    this.executor.reset();
    this.observing = false;
    this.pendingEvent = null;
  }

  onMatchEnd(): {
    decisions: Array<{ timestamp: number; decision: ModifierDecisionResult }>;
    modifierCount: number;
  } {
    const decisions = this.agent.stop();
    const modifierCount = decisions.filter(
      (d) => d.decision.action === 'deploy_modifier',
    ).length;
    this.executor.reset();
    return { decisions, modifierCount };
  }

  tick(
    bodies: PhysicsBodies,
    input: ChaosInput,
  ): ChaosEvent | null {
    // 1. Tick the executor (handles expiry + velocity cap)
    const { expired, modifierId } = this.executor.tick(bodies);
    if (expired) {
      this.agent.onModifierExpired();
      return { type: 'modifier_expired', modifierId };
    }

    // 2. Check if we should observe (timing-based)
    const now = Date.now();
    if (
      !this.observing &&
      this.agent.shouldObserve(now) &&
      this.executor.current === null
    ) {
      this.observing = true;

      // Async observe — don't block physics
      this.agent.observe(input).then((decision) => {
        this.observing = false;
        if (decision?.action === 'deploy_modifier' && decision.modifier) {
          const mod = decision.modifier;
          const applied = this.executor.applyModifier(
            bodies,
            mod.type,
            mod.variation,
            mod.target,
            mod.reason,
          );
          // Store event for next tick to pick up
          this.pendingEvent = { type: 'modifier_applied', modifier: applied };
        }
      }).catch(() => {
        this.observing = false;
      });
    }

    // 3. Return any pending event from async observation
    if (this.pendingEvent) {
      const event = this.pendingEvent;
      this.pendingEvent = null;
      return event;
    }

    return null;
  }
}

// File: server/src/chaos/skills.ts
// LLM chaos agent — ALWAYS deploys a modifier, never skips.
// Picks the best modifier + target for the current game state,
// avoids repeating recent modifiers.

import Anthropic from '@anthropic-ai/sdk';
import type { ModifierDecisionResult } from '../types/shared';

export interface Skill {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>): Promise<string>;
}

const MODIFIER_DECISION_SCHEMA = {
  type: 'object' as const,
  properties: {
    action: {
      type: 'string' as const,
      enum: ['deploy_modifier'],
      description: 'Always deploy_modifier. Never skip.',
    },
    modifier: {
      type: 'object' as const,
      properties: {
        type: {
          type: 'string' as const,
          enum: [
            'puck_speed',
            'paddle_size',
            'puck_size',
            'invisible_puck',
          ],
        },
        variation: {
          type: 'string' as const,
          enum: [
            'boost',
            'shrink',
            'grow',
            'hidden',
          ],
        },
        target: {
          type: 'string' as const,
          enum: ['player1', 'player2', 'puck'],
        },
        reason: {
          type: 'string' as const,
          description: 'Short commentator-style reason (1 sentence)',
        },
      },
      required: ['type', 'variation', 'target', 'reason'],
    },
  },
  required: ['action', 'modifier'],
};

const SYSTEM_PROMPT = `You are the Chaos Agent for CyberPuck Chaos, a cyberpunk air hockey game.

You MUST deploy a modifier every time you are called. You NEVER skip. Your job is to pick the BEST modifier for this moment.

AVAILABLE MODIFIERS (type + variation → target):
1. puck_speed + boost → target: puck (2.5x speed — puck goes crazy fast)
2. paddle_size + shrink → target: player1 or player2 (0.6x paddle)
3. paddle_size + grow → target: player1 or player2 (1.5x paddle)
4. puck_size + grow → target: puck (2x puck)
5. puck_size + shrink → target: puck (0.5x puck)
6. invisible_puck + hidden → target: puck (puck disappears)

DECISION RULES:
1. NEVER repeat a modifier type that appears in recentModifiers. Pick something DIFFERENT.
2. VARIETY IS KING. Cycle through ALL modifier types. Do NOT favor paddle_size — use puck_speed, puck_size, and invisible_puck just as often.
3. Only use paddle_size when the score gap is 3+ goals. For smaller gaps or ties, prefer puck_speed, puck_size, or invisible_puck.
4. puck_speed boost is exciting for close games — puck goes berserk.
5. puck_size grow makes chaotic rallies. puck_size shrink demands precision.
6. invisible_puck is dramatic — great for mid-game or when tension is high.
7. Your reason should be 1 short sentence, like a sports commentator hyping the crowd.

CRITICAL: action must ALWAYS be "deploy_modifier". Never return skip.`;

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export const analyzeMatchSkill: Skill = {
  name: 'analyzeMatchAndDecide',
  description:
    'Analyze the current match state and decide which chaos modifier to deploy',
  parameters: {
    type: 'object',
    properties: {
      score: { type: 'array', items: { type: 'number' } },
      matchPhase: { type: 'string', enum: ['early', 'mid', 'late'] },
      recentModifiers: { type: 'array', items: { type: 'string' } },
      matchTimeSeconds: { type: 'number' },
      maxScore: { type: 'number' },
    },
  },

  async execute(args: Record<string, unknown>): Promise<string> {
    const score = (args.score as number[]) ?? [0, 0];
    const matchPhase = (args.matchPhase as string) ?? 'mid';
    const matchTimeSeconds = (args.matchTimeSeconds as number) ?? 0;
    const recentModifiers = (args.recentModifiers as string[]) ?? [];
    const maxScore = (args.maxScore as number) ?? 7;

    const scoreDiff = score[0] - score[1];
    const leading = scoreDiff > 0 ? 'Player 1' : scoreDiff < 0 ? 'Player 2' : 'Tied';
    const highScore = Math.max(score[0], score[1]);

    const userMessage = `Match state:
- Score: Player 1 ${score[0]} — Player 2 ${score[1]} (${leading} leads, first to ${maxScore})
- High score: ${highScore}/${maxScore} (${highScore >= maxScore - 2 ? 'MATCH POINT TERRITORY' : 'mid-game'})
- Match time: ${matchTimeSeconds}s
- Phase: ${matchPhase}
- Recent modifiers (DO NOT repeat these): ${recentModifiers.length === 0 ? 'none yet' : recentModifiers.join(', ')}

Pick the best modifier to deploy RIGHT NOW. Remember: NEVER skip, NEVER repeat a recent type.`;

    try {
      const response = await getClient().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        temperature: 0.8,
        tools: [
          {
            name: 'modifier_decision',
            description:
              'Deploy a chaos modifier. Action must always be deploy_modifier.',
            input_schema: MODIFIER_DECISION_SCHEMA,
          },
        ],
        tool_choice: { type: 'tool', name: 'modifier_decision' },
        messages: [
          {
            role: 'user',
            content: SYSTEM_PROMPT + '\n\n' + userMessage,
          },
        ],
      });

      const toolUse = response.content.find(
        (block) => block.type === 'tool_use',
      );
      if (!toolUse || toolUse.type !== 'tool_use') {
        return JSON.stringify({ action: 'deploy_modifier', modifier: null });
      }

      const decision = toolUse.input as ModifierDecisionResult;
      // Force action to deploy_modifier in case LLM disobeys
      decision.action = 'deploy_modifier';
      return JSON.stringify(decision);
    } catch (err) {
      console.error('[ChaosSkill] LLM call failed:', err);
      return JSON.stringify({ action: 'deploy_modifier', modifier: null });
    }
  },
};

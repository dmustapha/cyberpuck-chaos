// File: server/src/chaos/skills.ts
// ADAPTED from ARCHITECTURE.md Section 5 — Anthropic SDK instead of OpenAI (DEVIATION #2)
// Uses tool_use for structured output instead of zodResponseFormat

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
      enum: ['deploy_modifier', 'skip'],
    },
    modifier: {
      type: ['object', 'null'] as const,
      properties: {
        type: {
          type: 'string' as const,
          enum: [
            'puck_speed',
            'paddle_size',
            'goal_width',
            'puck_size',
            'invisible_puck',
          ],
        },
        variation: {
          type: 'string' as const,
          enum: [
            'boost',
            'slow',
            'shrink',
            'grow',
            'widen',
            'narrow',
            'hidden',
          ],
        },
        target: {
          type: 'string' as const,
          enum: ['player1', 'player2', 'both', 'puck'],
        },
        reason: { type: 'string' as const },
      },
      required: ['type', 'variation', 'target', 'reason'],
    },
  },
  required: ['action', 'modifier'],
};

const SYSTEM_PROMPT = `You are the Chaos Agent for CyberPuck Chaos, an AI-powered air hockey game on OneChain.

Your job: analyze the match state and decide whether to deploy a game modifier to keep the match dramatic and competitive.

PRINCIPLES:
- Target the DOMINANT player to create comebacks and drama
- Never make a losing player's situation worse
- If the match is already close and exciting, you can skip
- Be a sports entertainer — your reason should sound like a commentator

AVAILABLE MODIFIERS:
1. puck_speed + boost (1.5x, 7s) / slow (0.5x, 7s) — target: puck
2. paddle_size + shrink (0.6x, 8s) / grow (1.5x, 8s) — target: player1 or player2
3. goal_width + widen (1.3x, 6s) / narrow (0.7x, 6s) — target: player1 or player2
4. puck_size + grow (2x, 7s) / shrink (0.5x, 7s) — target: puck
5. invisible_puck + hidden (3s) — target: puck

TARGETING RULES:
- paddle_size shrink → target the LEADING player
- paddle_size grow → target the TRAILING player
- goal_width widen → target the LEADING player's goal
- goal_width narrow → target the TRAILING player's goal
- puck_speed/puck_size/invisible_puck → target is always "puck"

WHEN TO SKIP:
- Score is tied and momentum is balanced — let them play
- A modifier just expired recently — give players a break
- Match just started (< 15s) or about to end

Use the modifier_decision tool to respond with your decision.`;

const client = new Anthropic();

export const analyzeMatchSkill: Skill = {
  name: 'analyzeMatchAndDecide',
  description:
    'Analyze the current match state and decide whether to deploy a chaos modifier',
  parameters: {
    type: 'object',
    properties: {
      score: { type: 'array', items: { type: 'number' } },
      streaks: { type: 'array', items: { type: 'number' } },
      paddleActivity: { type: 'array', items: { type: 'number' } },
      puckAvgSpeed: { type: 'number' },
      matchPhase: { type: 'string', enum: ['early', 'mid', 'late'] },
      recentModifiers: { type: 'array' },
      matchTimeSeconds: { type: 'number' },
    },
  },

  async execute(args: Record<string, unknown>): Promise<string> {
    const score = (args.score as number[]) ?? [0, 0];
    const streaks = (args.streaks as number[]) ?? [0, 0];
    const paddleActivity = (args.paddleActivity as number[]) ?? [0, 0];
    const puckAvgSpeed = (args.puckAvgSpeed as number) ?? 0;
    const matchPhase = (args.matchPhase as string) ?? 'mid';
    const matchTimeSeconds = (args.matchTimeSeconds as number) ?? 0;
    const recentModifiers = (args.recentModifiers as unknown[]) ?? [];

    const userMessage = `Current match state:
- Score: Player 1 ${score[0]} — Player 2 ${score[1]}
- Goal streaks: P1=${streaks[0]}, P2=${streaks[1]}
- Paddle activity (0-100): P1=${paddleActivity[0]}, P2=${paddleActivity[1]}
- Puck average speed: ${puckAvgSpeed.toFixed(1)}
- Match phase: ${matchPhase}
- Match time: ${matchTimeSeconds}s
- Recent modifiers: ${recentModifiers.length === 0 ? 'none' : JSON.stringify(recentModifiers)}

Decide: deploy a modifier or skip.`;

    try {
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        temperature: 0.7,
        tools: [
          {
            name: 'modifier_decision',
            description:
              'Decide whether to deploy a game modifier or skip this observation cycle',
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
        return JSON.stringify({ action: 'skip', modifier: null });
      }

      const decision = toolUse.input as ModifierDecisionResult;
      return JSON.stringify(decision);
    } catch (err) {
      console.error('[ChaosSkill] LLM call failed:', err);
      return JSON.stringify({ action: 'skip', modifier: null });
    }
  },
};

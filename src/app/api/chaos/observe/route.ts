// File: src/app/api/chaos/observe/route.ts
// Vercel serverless endpoint for AI-mode chaos decisions.
// Mirrors server/src/index.ts POST /api/chaos/observe so AI mode works
// without the separate Node.js server.

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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
          enum: ['puck_speed', 'paddle_size', 'puck_size', 'invisible_puck'],
        },
        variation: {
          type: 'string' as const,
          enum: ['boost', 'shrink', 'grow', 'hidden'],
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

// Fallback pool — used when LLM is unavailable
const FALLBACK_POOL = [
  { type: 'puck_speed', variation: 'boost', target: 'puck', reason: 'TURBO MODE! Puck is blazing fast!' },
  { type: 'paddle_size', variation: 'shrink', target: 'player2', reason: 'AI paddle shrunk! Time to attack!' },
  { type: 'puck_size', variation: 'grow', target: 'puck', reason: 'Giant puck incoming!' },
  { type: 'invisible_puck', variation: 'hidden', target: 'puck', reason: 'Ghost puck! Where did it go?!' },
  { type: 'puck_size', variation: 'shrink', target: 'puck', reason: 'Tiny puck! Precision mode!' },
  { type: 'paddle_size', variation: 'grow', target: 'player1', reason: 'Your paddle powered up!' },
];

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    if (!input.score || !input.matchPhase) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const score: [number, number] = input.score;
    const matchPhase: string = input.matchPhase;
    const matchTimeSeconds: number = input.matchTimeSeconds ?? 0;
    const recentModifiers: string[] = input.recentModifiers ?? [];
    const maxScore: number = input.maxScore ?? 7;

    // If no API key, fall straight to pool
    if (!process.env.ANTHROPIC_API_KEY) {
      const mod = FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
      const now = Date.now();
      return NextResponse.json({
        action: 'deploy_modifier',
        modifier: { id: `ai-chaos-${now}`, ...mod, duration: 8000, startTime: now, expiresAt: now + 8000 },
      });
    }

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

    const response = await Promise.race([
      getClient().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        temperature: 0.8,
        tools: [
          {
            name: 'modifier_decision',
            description: 'Deploy a chaos modifier. Action must always be deploy_modifier.',
            input_schema: MODIFIER_DECISION_SCHEMA,
          },
        ],
        tool_choice: { type: 'tool', name: 'modifier_decision' },
        messages: [{ role: 'user', content: SYSTEM_PROMPT + '\n\n' + userMessage }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('LLM timeout')), 8000)),
    ]);

    const toolUse = response.content.find((block) => block.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No tool use in response');
    }

    const decision = toolUse.input as { action: string; modifier: { type: string; variation: string; target: string; reason: string } };
    decision.action = 'deploy_modifier';

    if (decision.modifier) {
      const now = Date.now();
      const duration = 8000;
      return NextResponse.json({
        action: 'deploy_modifier',
        modifier: {
          id: `ai-chaos-${now}`,
          type: decision.modifier.type,
          variation: decision.modifier.variation,
          target: decision.modifier.target,
          reason: decision.modifier.reason,
          duration,
          startTime: now,
          expiresAt: now + duration,
        },
      });
    }

    throw new Error('No modifier in decision');
  } catch (err) {
    console.error('[ChaosAPI] observe failed:', err);
    // Return a fallback modifier so the game never gets stuck
    const mod = FALLBACK_POOL[Math.floor(Math.random() * FALLBACK_POOL.length)];
    const now = Date.now();
    return NextResponse.json({
      action: 'deploy_modifier',
      modifier: { id: `ai-chaos-${now}`, ...mod, duration: 8000, startTime: now, expiresAt: now + 8000 },
    });
  }
}

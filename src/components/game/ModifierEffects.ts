// File: src/components/game/ModifierEffects.ts
// Canvas 2D visual effects for active modifiers.
// Called from GameCanvas render loop.

import type { ActiveModifier } from '../../types/game';

interface EffectContext {
  ctx: CanvasRenderingContext2D;
  puckX: number;
  puckY: number;
  puckRadius: number;
  modifier: ActiveModifier;
  theme: { primary: string; secondary: string; accent: string };
}

// Ease-out cubic for smooth transitions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function renderModifierEffects(eff: EffectContext): void {
  const { modifier } = eff;

  switch (modifier.type) {
    case 'puck_speed':
      renderSpeedLines(eff);
      break;
    case 'puck_size':
      renderSizeGlow(eff);
      break;
    case 'invisible_puck':
      renderInvisibilityEffect(eff);
      break;
    case 'paddle_size':
    case 'goal_width':
      renderActiveGlow(eff);
      break;
  }
}

function renderSpeedLines(eff: EffectContext): void {
  const { ctx, puckX, puckY, puckRadius, modifier } = eff;
  const isBoosted = modifier.variation === 'boost';
  const color = isBoosted ? '#39ff14' : '#ff3366';
  const lineCount = isBoosted ? 6 : 4;

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  for (let i = 0; i < lineCount; i++) {
    const angle = (Math.PI * 2 * i) / lineCount + Date.now() * 0.003;
    const len = puckRadius * (isBoosted ? 2.5 : 1.5);
    const startR = puckRadius + 4;
    ctx.beginPath();
    ctx.moveTo(
      puckX + Math.cos(angle) * startR,
      puckY + Math.sin(angle) * startR,
    );
    ctx.lineTo(
      puckX + Math.cos(angle) * (startR + len),
      puckY + Math.sin(angle) * (startR + len),
    );
    ctx.stroke();
  }

  ctx.restore();
}

function renderSizeGlow(eff: EffectContext): void {
  const { ctx, puckX, puckY, puckRadius, modifier } = eff;
  const isGrowing = modifier.variation === 'grow';
  const color = isGrowing ? '#00f0ff' : '#ff0080';
  const pulsePhase = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

  ctx.save();
  ctx.globalAlpha = 0.3 * pulsePhase;
  ctx.beginPath();
  ctx.arc(puckX, puckY, puckRadius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.restore();
}

function renderInvisibilityEffect(eff: EffectContext): void {
  const { ctx, puckX, puckY, puckRadius, modifier } = eff;
  const elapsed = Date.now() - modifier.startTime;
  const totalDuration = modifier.duration;

  // Fade out over first 500ms, stay hidden, fade back in last 500ms
  let alpha: number;
  if (elapsed < 500) {
    alpha = 1 - easeOutCubic(elapsed / 500);
  } else if (elapsed > totalDuration - 500) {
    alpha = easeOutCubic((elapsed - (totalDuration - 500)) / 500);
  } else {
    alpha = 0;
  }

  // Ghost trail — faint outline showing approximate position
  if (alpha < 0.3) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(puckX, puckY, puckRadius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.stroke();
    ctx.restore();
  }
}

function renderActiveGlow(eff: EffectContext): void {
  // Generic glow effect for paddle/goal modifiers
  const { ctx, puckX, puckY } = eff;
  const pulsePhase = Math.sin(Date.now() * 0.004) * 0.2 + 0.3;

  ctx.save();
  ctx.globalAlpha = pulsePhase;
  const gradient = ctx.createRadialGradient(
    puckX, puckY, 0,
    puckX, puckY, 60,
  );
  gradient.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(puckX - 60, puckY - 60, 120, 120);
  ctx.restore();
}

// Get puck visibility alpha for invisible_puck modifier
export function getPuckAlpha(modifier: ActiveModifier | null): number {
  if (!modifier || modifier.type !== 'invisible_puck') return 1;

  const elapsed = Date.now() - modifier.startTime;
  if (elapsed < 500) return 1 - easeOutCubic(elapsed / 500);
  if (elapsed > modifier.duration - 500) {
    return easeOutCubic((elapsed - (modifier.duration - 500)) / 500);
  }
  return 0;
}

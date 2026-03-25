#!/usr/bin/env node
/**
 * Generate WAV files for all game SFX.
 *
 * Matches the synthesis parameters from the original SynthAudio.ts
 * (Web Audio API oscillators → pre-rendered 16-bit PCM WAV files).
 *
 * Usage: node scripts/generate-sfx.js
 * Output: public/audio/sfx/*.wav
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'sfx');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ═══════════════════════════════════════════════════════════
// WAV ENCODING
// ═══════════════════════════════════════════════════════════

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);   // PCM
  buffer.writeUInt16LE(1, 22);   // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);   // block align
  buffer.writeUInt16LE(16, 34);  // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  return buffer;
}

// ═══════════════════════════════════════════════════════════
// OSCILLATORS
// ═══════════════════════════════════════════════════════════

const oscFn = {
  sine:     (p) => Math.sin(2 * Math.PI * p),
  square:   (p) => Math.sin(2 * Math.PI * p) >= 0 ? 1 : -1,
  sawtooth: (p) => 2 * (p - Math.floor(p + 0.5)),
  triangle: (p) => 2 * Math.abs(2 * (p - Math.floor(p + 0.5))) - 1,
};

// ═══════════════════════════════════════════════════════════
// SYNTHESIS PRIMITIVES
// ═══════════════════════════════════════════════════════════

function tone(freq, duration, type = 'square', volume = 0.3, attack = 0.01, decay = 0.1) {
  const n = Math.ceil(SAMPLE_RATE * duration);
  const out = new Float64Array(n);
  const fn = oscFn[type] || oscFn.square;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const phase = freq * t;

    let env;
    if (t < attack) {
      env = t / attack;
    } else if (t < attack + decay) {
      env = 1 - ((t - attack) / decay) * 0.3;
    } else {
      const remaining = duration - t;
      const release = duration - attack - decay;
      env = 0.7 * Math.max(0, remaining / Math.max(release, 0.001));
    }

    out[i] = fn(phase) * volume * Math.max(0, env);
  }
  return out;
}

function noise(duration, volume = 0.2, filterFreq = 2000) {
  const n = Math.ceil(SAMPLE_RATE * duration);
  const out = new Float64Array(n);
  const alpha = Math.min(1, (filterFreq / SAMPLE_RATE) * 2 * Math.PI);
  let prev = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const white = Math.random() * 2 - 1;
    prev += alpha * (white - prev);
    out[i] = prev * volume * (1 - t / duration);
  }
  return out;
}

function sweep(startFreq, endFreq, duration, type = 'sine', volume = 0.3) {
  const n = Math.ceil(SAMPLE_RATE * duration);
  const out = new Float64Array(n);
  const fn = oscFn[type] || oscFn.sine;
  const ratio = endFreq / startFreq;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const freq = startFreq * Math.pow(ratio, Math.min(progress / 0.67, 1));
    const phase = freq * t;
    const env = volume * (1 - progress);
    out[i] = fn(phase) * Math.max(0, env);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════
// MIXING
// ═══════════════════════════════════════════════════════════

function mix(...arrays) {
  const len = Math.max(...arrays.map(a => a.length));
  const out = new Float64Array(len);
  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) out[i] += arr[i];
  }
  return out;
}

function offset(base, addition, seconds) {
  const off = Math.round(seconds * SAMPLE_RATE);
  const len = Math.max(base.length, addition.length + off);
  const out = new Float64Array(len);
  for (let i = 0; i < base.length; i++) out[i] += base[i];
  for (let i = 0; i < addition.length; i++) {
    if (i + off < len) out[i + off] += addition[i];
  }
  return out;
}

function save(name, samples) {
  const buf = createWavBuffer(Array.from(samples));
  fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.wav`), buf);
  console.log(`  ${name}.wav  (${(buf.length / 1024).toFixed(1)} KB)`);
}

// ═══════════════════════════════════════════════════════════
// SOUND DEFINITIONS  (match SynthAudio.ts parameters)
// ═══════════════════════════════════════════════════════════

console.log('Generating SFX...\n');

// --- Paddle hits (5 intensity levels) ---
for (let i = 0; i < 5; i++) {
  const baseFreq = 200 + i * 100;
  const vol = 0.2 + i * 0.15;
  const dur = 0.08 + i * 0.04;

  let s = tone(baseFreq, dur, 'square', vol, 0.005, 0.02);
  s = mix(s, tone(baseFreq * 4, 0.03, 'sine', vol * 0.5, 0.001, 0.01));
  if (i >= 2) s = mix(s, noise(dur * 0.5, vol * 0.3, 3000 + i * 500));
  save(`hit_${i}`, s);
}

// --- Wall bounce ---
save('wall_bounce', mix(
  tone(800, 0.08, 'sine', 0.15, 0.001, 0.02),
  tone(1200, 0.05, 'sine', 0.1, 0.001, 0.01),
));

// --- Goal: player scored (ascending fanfare + bass) ---
{
  const bass = tone(130, 0.4, 'sine', 0.4, 0.01, 0.1);
  let s = new Float64Array(Math.ceil(SAMPLE_RATE * 0.7));
  s = mix(s, bass);
  [523, 659, 784, 1047].forEach((freq, i) => {
    s = offset(s,
      mix(tone(freq, 0.3, 'square', 0.25, 0.01, 0.05),
          tone(freq * 2, 0.2, 'sine', 0.15, 0.01, 0.03)),
      i * 0.08);
  });
  save('goal_player', s);
}

// --- Goal: opponent scored (descending) ---
{
  let s = tone(400, 0.3, 'sawtooth', 0.2, 0.01, 0.1);
  s = offset(s, tone(300, 0.3, 'sawtooth', 0.15, 0.01, 0.1), 0.1);
  s = offset(s, tone(200, 0.4, 'sawtooth', 0.1, 0.01, 0.15), 0.2);
  save('goal_opponent', s);
}

// --- Countdown beep ---
save('countdown_beep', tone(880, 0.1, 'square', 0.3, 0.005, 0.02));

// --- Countdown GO ---
{
  const sw = sweep(400, 1200, 0.3, 'sawtooth', 0.4);
  let s = sw;
  [523, 659, 784].forEach(f => { s = mix(s, tone(f, 0.25, 'square', 0.2, 0.01, 0.05)); });
  save('countdown_go', s);
}

// --- Match point ---
{
  let s = tone(440, 0.15, 'square', 0.25, 0.01, 0.03);
  s = offset(s, tone(440, 0.15, 'square', 0.25, 0.01, 0.03), 0.2);
  s = offset(s, tone(660, 0.2, 'square', 0.3, 0.01, 0.05), 0.4);
  save('match_point', s);
}

// --- Match end (final horn chord) ---
save('match_end', mix(
  tone(220, 0.5, 'sawtooth', 0.3, 0.02, 0.1),
  tone(277, 0.5, 'sawtooth', 0.25, 0.02, 0.1),
  tone(330, 0.5, 'sawtooth', 0.2, 0.02, 0.1),
));

// --- Victory fanfare ---
{
  let s = new Float64Array(Math.ceil(SAMPLE_RATE * 1.1));
  [
    { f: 523, d: 0 },    { f: 659, d: 0.15 },
    { f: 784, d: 0.3 },  { f: 1047, d: 0.45 },
    { f: 784, d: 0.6 },  { f: 1047, d: 0.75 },
  ].forEach(({ f, d }) => {
    s = offset(s, mix(
      tone(f, 0.25, 'square', 0.25, 0.01, 0.05),
      tone(f / 2, 0.3, 'sine', 0.2, 0.01, 0.08),
    ), d);
  });
  save('victory', s);
}

// --- Defeat (sad descending) ---
{
  let s = new Float64Array(Math.ceil(SAMPLE_RATE * 1.2));
  [392, 349, 330, 262].forEach((f, i) => {
    s = offset(s, tone(f, 0.35, 'triangle', 0.2, 0.02, 0.1), i * 0.2);
  });
  save('defeat', s);
}

// --- UI: Click ---
save('click', mix(
  tone(1000, 0.05, 'square', 0.2, 0.001, 0.01),
  tone(1500, 0.03, 'sine', 0.1, 0.001, 0.005),
));

// --- UI: Hover ---
save('hover', tone(2000, 0.03, 'sine', 0.08, 0.001, 0.01));

// --- UI: Back ---
save('back', mix(
  tone(800, 0.06, 'square', 0.15, 0.001, 0.02),
  tone(600, 0.08, 'square', 0.12, 0.001, 0.02),
));

// --- UI: Toggle on / off ---
save('toggle_on', offset(
  tone(880, 0.05, 'sine', 0.2, 0.001, 0.01),
  tone(1320, 0.05, 'sine', 0.15, 0.001, 0.01),
  0.03,
));
save('toggle_off', offset(
  tone(1320, 0.05, 'sine', 0.15, 0.001, 0.01),
  tone(880, 0.05, 'sine', 0.2, 0.001, 0.01),
  0.03,
));

// --- UI: Error ---
save('error', offset(
  tone(200, 0.15, 'sawtooth', 0.25, 0.005, 0.03),
  tone(150, 0.2, 'sawtooth', 0.2, 0.005, 0.05),
  0.1,
));

// --- UI: Panel open (rising sweep) ---
save('panel_open', sweep(300, 800, 0.15, 'sine', 0.15));

// --- UI: Panel close (falling sweep) ---
save('panel_close', sweep(800, 300, 0.12, 'sine', 0.12));

console.log('\nAll SFX generated successfully!');
console.log(`Output: ${OUTPUT_DIR}`);

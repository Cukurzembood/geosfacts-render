// lib/motion.ts — reusable motion helpers for the GeosFact's GitHub pipeline.
//
// Every helper is pure (no Pen, no three.js) except the two impact Fx
// (ripple / splat), so this file is unit-testable in plain node.
//
// WHY THIS FILE EXISTS (lessons, 26 Nov 2026):
// - Video 050 v1 shipped drops + wind streaks at CONSTANT linear speed that
//   TELEPORTED back to the start on cycle wrap — that is what read as
//   "gak halus" (choppy/glitchy). The v3 fix proved the cure: gravity
//   (accelerating fall), fade in at the start, fade + squash into the
//   landing, never a pop. Those are `fallState` / `ripple` / `splat` here.
// - The reference clip (skill author's bridge demo) moves the way it does
//   because NOTHING moves linearly: camera glides ease in-out (smootherstep),
//   marching feet follow a cycloid (zero ground speed at contact), bodies
//   bob lowest at foot contact, expressions only change behind a blink.
//   Those are `glide`, `walkCycle`, `blinkProfile` here.
// RULE: no animation in a video file may use a raw linear `t` for motion.
//   Run it through one of these helpers first.
import type { Pen } from "../../bridge/toon";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * clamp01(u);

/** smoothstep between a and b: 0 below a, 1 above b, S-curve between. */
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** smootherstep 0..1 -> 0..1 (zero velocity at BOTH ends). THE default
 *  camera/position glide — use for every camera move and every walk-on. */
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};

/** cubic ease-out: fast start, soft landing. Use for entrances that should
 *  arrive gently (a prop dropping into frame, a camera settling). */
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);

/** cubic ease-in: slow start, accelerating. Use for things leaving frame
 *  or a fall that starts from rest. */
export const easeIn = (u: number) => Math.pow(clamp01(u), 3);

/** cubic ease-in-out: the standard "alive" curve for gestures and head
 *  turns — slow at both ends, fastest in the middle. */
export const easeInOut = (u: number) => {
  const x = clamp01(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** ease-out with a small overshoot that settles back (s = 1.70158).
 *  Use SPARINGLY: a lever snapping, a head doing a double-take, a book
 *  landing on a pile. Never on cameras. */
export const easeOutBack = (u: number) => {
  const x = clamp01(u), c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** hex colour -> rgba() string with the given alpha (0..1). */
export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp01(a).toFixed(3)})`;
};

// ---------------------------------------------------------------------------
// GRAVITY FALL — one drop cycle, u = 0..1 cycle progress.
// y follows u^2 (accelerating, like real gravity), alpha fades in at the
// spout (first 8%) and out at the pool (last 10%), ry stretches with speed
// and squashes on impact, rx widens on impact. Cycle wrap never pops.
// Usage: const d = fallState(ph); const y = topY + d.yFrac * fallH;
//   p.ell(x, y, rx * d.rx, ry * d.ry, rgba(col, d.alpha), 0);
// ---------------------------------------------------------------------------
export type FallState = { yFrac: number; alpha: number; ry: number; rx: number };
export const fallState = (u: number): FallState => {
  const yFrac = u * u;
  const alpha = Math.min(smooth(0, 0.08, u), 1 - smooth(0.9, 1, u));
  const stretch = 1 + 0.9 * u;
  const squash = 1 - 0.45 * smooth(0.92, 1, u);
  const widen = 1 + 0.7 * smooth(0.92, 1, u);
  return { yFrac, alpha, ry: stretch * squash, rx: widen / Math.sqrt(stretch) };
};

/** Cycle phase for a looping drop: t = 0..1 shot progress, cycles = falls
 *  per shot, offset = per-tap stagger (e.g. i * 0.37). Returns 0..1. */
export const dropPhase = (t: number, cycles: number, offset = 0) =>
  (((t * cycles + offset) % 1) + 1) % 1;

/** Impact ripple: flat ring on the pool surface, expanding + fading over
 *  the last 12% of the cycle. Draw BEFORE the drop so the drop overlaps it. */
export const ripple = (p: Pen, x: number, y: number, u: number, col: string) => {
  const k = smooth(0.88, 1, u);
  if (k <= 0) return;
  const rx = 14 + 58 * k, ry = 5 + 16 * k;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]);
  }
  p.stroke(pts, 5, rgba(col, 0.7 * (1 - k)));
};

/** Goo splat: flat blob spreading on the pool surface over the last 12%
 *  of the cycle, fading as it spreads. For thick/sticky drops. */
export const splat = (p: Pen, x: number, y: number, u: number, col: string) => {
  const k = smooth(0.88, 1, u);
  if (k <= 0) return;
  p.ell(x, y, 26 + 46 * k, 12 - 4 * k, rgba(col, 0.8 * (1 - k)), 0);
};

// ---------------------------------------------------------------------------
// WALK CYCLE — from the reference clip's marching: the swinging foot follows
// a cycloid (zero ground speed at lift-off AND landing), the body bobs
// lowest at foot contact, the torso leans most at contact.
// phase = 0..1, one full step cycle (2 steps/s at 1 Hz, like story050).
// Returns: lift 0..1 (swinging-foot height), bob 0..1 (0 = lowest hip),
//   leanDeg (torso lean, max at contact). Feed into nerdSide / nerdFront
//   phase + a hip-y offset + a torso tilt — never move a walker linearly.
// ---------------------------------------------------------------------------
export type WalkState = { lift: number; bob: number; leanDeg: number };
export const walkCycle = (phase: number): WalkState => {
  const p = (((phase % 1) + 1) % 1);
  const lift = Math.max(0, Math.sin(Math.PI * 2 * p)); // 0 at contact, 1 mid-swing
  const bob = 0.5 - 0.5 * Math.cos(2 * Math.PI * 2 * p); // 0 lowest at contact, 1 highest mid-stance
  const leanDeg = 4 + 3 * Math.cos(2 * Math.PI * 2 * p); // 7 deg at contact, 1 at passing
  return { lift, bob, leanDeg };
};

// ---------------------------------------------------------------------------
// BLINK — deterministic lid profile: a blink every ~1-2 s, 4 frames
// (half / shut / shut / half). Same timing grammar as cast050's lidAt.
// RULE (v3 lesson): an expression may ONLY change on a frame where this
// returns > 0 — the swap hides behind the shut lids instead of popping
// mid-sentence (the old talkExpr swapped every 12 frames = a visible pop
// 2.5x/second). Usage: const blink = blinkProfile(f, seed);
//   if (blink > 0) expr = nextExpr;
// ---------------------------------------------------------------------------
const LID = [0.5, 1, 1, 0.5];
const hash = (i: number, s = 0) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export const blinkProfile = (f: number, seed: number): number => {
  let s = Math.round(-60 * hash(seed, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hash(seed * 31 + n, 13));
  }
  return 0;
};

// ---------------------------------------------------------------------------
// TALK GESTURE — right hand rises and falls once per ~1.8 s of talking.
// u = 0..1 progress inside the shot. Returns 0..1 (0 = hand down).
// ---------------------------------------------------------------------------
export const talkGest = (u: number) => 0.5 + 0.5 * Math.sin(clamp01(u) * Math.PI * 1.1);

// ---------------------------------------------------------------------------
// BREATHING — one slow breath every `period` seconds (default 4 s).
// Returns 0..1 phase. Feed into a chest/head bob of a few units — the
// difference between "alive" and "frozen" between gestures. Never use the
// 2 Hz talk bounce as breathing: that reads as nerves, not breath.
// ---------------------------------------------------------------------------
export const breathePhase = (tSec: number, period = 4) =>
  (((tSec / period) % 1) + 1) % 1;
/** breath bob in drawing units: +3 at full inhale, 0 at exhale. */
export const breathBob = (tSec: number, period = 4) =>
  3 * Math.sin(2 * Math.PI * breathePhase(tSec, period));

// ---------------------------------------------------------------------------
// PENDULUM GESTURE — one arm/body swing with anticipation + follow-through,
// like the reference clip's swing (slowest at the extremes, fastest at the
// bottom; the body trails the arm, the head trails the body).
// u = 0..1 progress inside the shot. Returns hand height 0..1 (0.5 = rest),
// torso tilt deg, head tilt deg. The first 15% is the wind-back
// (anticipation): the hand dips and comes back to rest before the swings,
// so there is no jump at the handover.
// ---------------------------------------------------------------------------
export type PendulumState = { hand: number; body: number; head: number };
export const pendulumSwing = (u: number): PendulumState => {
  const x = clamp01(u);
  if (x < 0.15) {
    const k = easeInOut(x / 0.15);
    const dip = -0.3 * Math.sin(Math.PI * k); // dips to -0.3, back to 0
    return { hand: 0.5 + dip, body: 1.5 * dip, head: 1 * dip };
  }
  const v = (x - 0.15) / 0.85;
  const env = 1 - 0.45 * v; // swings decay, settle by the end
  const w = v * Math.PI * 4; // 2 full swings across the shot
  // ramp: body/head start at 0 (the anticipation end value) and catch up
  // to the hand — without this they teleport ~1.8 deg at the handover.
  const ramp = smooth(0, 0.15, v);
  return {
    hand: 0.5 + 0.5 * Math.sin(w) * env,
    body: 2.5 * Math.sin(w - 0.6) * env * ramp, // body lags the hand
    head: 2 * Math.sin(w - 1.1) * env * ramp, // head lags the body
  };
};

/** LED blink: on for `duty` of each `period`-second cycle, offset by phase. */
export const ledBlink = (tSec: number, period = 1, phase = 0, duty = 0.6) =>
  (((tSec / period + phase) % 1) + 1) % 1 < duty;

/** slow drift position that never wraps inside a 57 s video: base + speed*t.
 *  57 s * 1.2 m/s = ~68 m total — use for clouds (distant, no pop). */
export const driftX = (base: number, tSec: number, speed = 1.2) => base + tSec * speed;

// ---------------------------------------------------------------------------
// CAMERA GLIDE — lerp a 3-vector along `glide` (smootherstep). Use for every
// camera key: the camera must ease in AND out, never start/stop at full
// speed. For a full shot camera, see shots.ts (camRun + presets).
// ---------------------------------------------------------------------------
export type V3 = [number, number, number];
export const glideVec = (from: V3, to: V3, u: number): V3 => {
  const k = glide(u);
  return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k];
};

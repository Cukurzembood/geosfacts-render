// lib/shots.ts — shot presets: camera grammar for our videos.
//
// Same key grammar as story050.ts (a shot = a list of keys; each key is a
// camera state at a frame; keys blend with smootherstep `glide`; a key
// flagged `cut` jumps instead of blending) — but standalone, so any video
// can build its cameras from presets instead of hand-writing keys.
//
// HOUSE RULES (Shanty): hard cuts only, no transitions. A new shot ALWAYS
// starts with a cut (its first key), and the camera angle or movement
// changes on every cut. Inside a shot the camera glides (ease in-out) —
// it never starts or stops at full speed, and it never moves linearly.
//
// Frames: keys take LOCAL frames (0 = shot start). A shot's keys are
// evaluated with camRun(keys, f - shotStart).
import { glide, clamp01 } from "./motion";
import type { V3 } from "./motion";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
export type CamKey = { f: number; dur?: number; cut?: boolean; s: (lf: number) => Shot };

const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k,
  roll: a.roll + (b.roll - a.roll) * k,
});

/** Evaluate camera keys at local frame `lf` (0 = shot start). */
export const camRun = (keys: CamKey[], lf: number): Cam => {
  let cur = full(keys[0].s(lf));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (lf < k.f) break;
    cur = k.cut ? full(k.s(lf)) : mix(cur, full(k.s(lf)), glide((lf - k.f) / (k.dur ?? 24)));
  }
  return cur;
};

/** 0..1 progress of frame f inside shot [a, b). The only progress value
 *  staging code should use — never a hardcoded frame range. */
export const shotU = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// ---------------------------------------------------------------------------
// PRESETS — each returns CamKey[] for one shot. `dur` = shot length in
// frames (for hold lengths); `from`/`to` are world positions.
// ---------------------------------------------------------------------------

/** WIDE PUSH-IN — opens a scene: slow dolly toward the look point.
 *  Usage: widePushIn({ dur: 105, from: [0, 2.2, 6], to: [0, 1.8, 3.5],
 *    look: [0, 1.2, -4] }) — the classic hook opener. */
export const widePushIn = (o: { dur: number; from: V3; to: V3; look: V3; fov?: number }): CamKey[] => [
  { f: 0, s: () => ({ pos: o.from, look: o.look, fov: o.fov ?? 40 }) },
  { f: 0, dur: o.dur, s: () => ({ pos: o.to, look: o.look, fov: o.fov ?? 40 }) },
];

/** SIDE TRACKING — camera slides sideways while the character walks,
 *  keeping the same distance. The walker's speed must match the camera
 *  glide (both eased) or the feet slide. Usage: sideTracking({ dur, from,
 *  to, look }) with from/to differing only in x. */
export const sideTracking = (o: { dur: number; from: V3; to: V3; look: V3; fov?: number }): CamKey[] => [
  { f: 0, s: () => ({ pos: o.from, look: o.look, fov: o.fov ?? 40 }) },
  { f: 0, dur: o.dur, s: () => ({ pos: o.to, look: o.look, fov: o.fov ?? 40 }) },
];

/** CLOSE-UP with DOF — tight on the face / prop, with a gentle push-in.
 *  Returns { keys, focus } where focus = distance from camera to the look
 *  point: feed it to the DOF pass (dofAt in the story file).
 *  Usage: closeUp({ dur: 90, pos: [0.4, 1.6, -20.5], look: [0.4, 1.5, -23.8],
 *    push: 0.6, fov: 34 }). */
export const closeUp = (o: { dur: number; pos: V3; look: V3; push?: number; fov?: number }) => {
  const push = o.push ?? 0.5;
  const to: V3 = [o.pos[0], o.pos[1], o.pos[2] + push];
  const focus = Math.hypot(o.look[0] - o.pos[0], o.look[1] - o.pos[1], o.look[2] - o.pos[2]);
  return {
    keys: [
      { f: 0, s: () => ({ pos: o.pos, look: o.look, fov: o.fov ?? 34 }) },
      { f: 0, dur: o.dur, s: () => ({ pos: to, look: o.look, fov: o.fov ?? 34 }) },
    ] as CamKey[],
    focus,
  };
};

/** PULL-BACK REVEAL — starts tight, dollies out to reveal the scene.
 *  Usage: pullBackReveal({ dur: 90, from: [0, 1.5, -20], to: [0, 2.5, -14],
 *    look: [0, 1.2, -23] }) — for a "drops keep flowing" second look. */
export const pullBackReveal = (o: { dur: number; from: V3; to: V3; look: V3; fov?: number }): CamKey[] => [
  { f: 0, s: () => ({ pos: o.from, look: o.look, fov: o.fov ?? 40 }) },
  { f: 0, dur: o.dur, s: () => ({ pos: o.to, look: o.look, fov: o.fov ?? 40 }) },
];

/** STATIC CARD — locked camera for a full-frame set card (mouth cutaway,
 *  brain room). The card itself animates; the camera does not move.
 *  Usage: staticCard({ pos: [0, 3, -7.6], look: [0, 3, -14] }). */
export const staticCard = (o: { pos: V3; look: V3; fov?: number }): CamKey[] => [
  { f: 0, s: () => ({ pos: o.pos, look: o.look, fov: o.fov ?? 40 }) },
];

/** OVER-THE-SHOULDER / MEDIUM — two-key reframing inside one shot: hold
 *  the first framing, then glide to a tighter one at frame `at`.
 *  Usage: reframe({ dur: 105, at: 48, first: {...}, second: {...} }). */
export const reframe = (o: {
  dur: number; at: number;
  first: { pos: V3; look: V3; fov?: number };
  second: { pos: V3; look: V3; fov?: number };
}): CamKey[] => [
  { f: 0, s: () => ({ ...o.first, fov: o.first.fov ?? 40 }) },
  { f: o.at, dur: o.dur - o.at, s: () => ({ ...o.second, fov: o.second.fov ?? 40 }) },
];

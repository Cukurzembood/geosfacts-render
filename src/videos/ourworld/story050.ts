// Video 050 — "Why Does Your Mouth Go Dry When You're Nervous?" — FULL 57 s video
// built from our own script stock in the GitHub parallel pipeline (Phase 2).
// 17 shots, HARD CUTS only, new shot every 3-4 s, camera gliding with a slow
// push-in, angle/movement change on every cut. No music, no subtitles, no text.
// Sets: auditorium stage (new zone in World050, in front of the library),
// mouth cutaway card + brain control-room card (big Pen-drawn billboards that
// fill the frame), campus path + bench (existing world).
//
// === TIMING + RETIME RULE (Shanty, 26 Nov 2026 — VO WAJIB SINKRON) ===
// The shot boundaries below are ESTIMATES from the script word count
// (~57 s at 2.72 wps / 0.9 pace, per deliverable.md). They are NOT locked.
// Single source of truth for timing is the BEATS table: one row per script
// beat (start/end seconds + the script text). SHOTS are derived from beats
// (shot -> beat map below), cameras run on frames RELATIVE to their shot
// start, and cast050.ts derives every progress value from shotAt(f).
// RETIME PROCEDURE (after the real Arlo VO exists, ~15:00 WIB 26 Nov):
//   1. Run faster-whisper on voiceover.mp3 (same VO pipeline: trim the
//      style-prompt head, cut the noise burst, join gap 0.15 s, atempo 0.90).
//   2. Read the word timestamps; update ONLY the BEATS aSec/bSec values
//      (and the per-beat shot splits if a beat moved a lot).
//   3. Re-render. Do NOT hand-edit frame numbers anywhere else.
// Until the VO is muxed and the sync is checked, this video is NOT sync-
// verified — the silent render is visuals-only (see REPORT.md section 9).
export const FPS = 30;

/** One script beat = one spoken sentence-group. aSec/bSec are ESTIMATES
 *  (deliverable.md timestamps); update them from the real VO word
 *  timestamps when the VO exists. */
export type Beat = { beat: number; aSec: number; bSec: number; text: string };
export const BEATS: Beat[] = [
  { beat: 1, aSec: 0.0, bSec: 6.5, text: "Wait, you are about to speak, and your mouth is suddenly bone dry, so what just happened?" },
  { beat: 2, aSec: 6.5, bSec: 13.0, text: "Three major saliva gland pairs do most of the work, making around a liter of spit a day." },
  { beat: 3, aSec: 13.0, bSec: 21.5, text: "Your nerves run those glands, and when you get nervous, your fight or flight side cuts the watery flow, leaving thick saliva behind." },
  { beat: 4, aSec: 21.5, bSec: 28.0, text: "It feels thick and sticky, and your tongue feels glued to the roof of your mouth." },
  { beat: 5, aSec: 28.0, bSec: 35.0, text: "Then you breathe through your mouth, fast and shallow, and that air dries out what moisture is left." },
  { beat: 6, aSec: 35.0, bSec: 44.5, text: "Your brain means well, because in a real emergency, running matters more than making spit, but it can not tell an interview from a bear." },
  { beat: 7, aSec: 44.5, bSec: 57.0, text: "So the dry mouth is just your body getting ready to run, and it fades as you calm down. Does it hit you too? Tell us below, then watch why you can not tickle yourself, and follow." },
];

export type V3 = [number, number, number];
export type Light = "day";
export type ShotDef = { id: number; a: number; b: number; light: Light };
/** Shot boundaries in frames — derived from BEATS (aSec/bSec * 30). If a beat
 *  moves, move the shot a/b values here and nowhere else. */
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 90, light: "day" },     // beat 1: stage wide, nerd walks on under the spotlight
  { id: 2, a: 90, b: 195, light: "day" },   // beat 1: stage medium, at the podium, mouth goes dry (shock)
  { id: 3, a: 195, b: 300, light: "day" },  // beat 2: mouth cutaway, three taps pour watery blue spit
  { id: 4, a: 300, b: 390, light: "day" },  // beat 2: mouth cutaway, pull-back, drops keep flowing
  { id: 5, a: 390, b: 480, light: "day" },  // beat 3: brain room, FIGHT OR FLIGHT switch flips red
  { id: 6, a: 480, b: 570, light: "day" },  // beat 3: mouth cutaway, taps drip thick sticky goo
  { id: 7, a: 570, b: 645, light: "day" },  // beat 3: stage close, worried, hand to throat (think)
  { id: 8, a: 645, b: 735, light: "day" },  // beat 4: stage close-up, tries to speak, tongue stuck (shock)
  { id: 9, a: 735, b: 840, light: "day" },  // beat 4: mouth cutaway, tongue glued to the roof, goo strands
  { id: 10, a: 840, b: 945, light: "day" }, // beat 5: campus side, fast shallow mouth breathing, wind + puddle
  { id: 11, a: 945, b: 1050, light: "day" },// beat 5: stage, breathing at the podium, wind gusts
  { id: 12, a: 1050, b: 1155, light: "day" },// beat 6: brain room, interview screen vs bear screen
  { id: 13, a: 1155, b: 1230, light: "day" },// beat 6: brain room, bear screen wins, push-in
  { id: 14, a: 1230, b: 1335, light: "day" },// beat 6: stage medium, relieved smile, brain means well
  { id: 15, a: 1335, b: 1470, light: "day" },// beat 7: mouth cutaway, taps flow watery blue again
  { id: 16, a: 1470, b: 1590, light: "day" },// beat 7: bench close, talking to camera, open book (CTA)
  { id: 17, a: 1590, b: 1710, light: "day" },// beat 7: bench closer, grin, follow gesture (CTA)
];
export const TOTAL = SHOTS[SHOTS.length - 1].b; // 1710 frames = 57 s
/** which script beat each shot illustrates (for the retime + sync QC) */
export const SHOT_BEAT: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 4, 9: 4, 10: 5, 11: 5, 12: 6, 13: 6, 14: 6, 15: 7, 16: 7, 17: 7,
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * clamp01(u);

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** 0..1 progress of frame f inside its own shot (the only progress value
 *  staging code should use — never a hardcoded frame range) */
export const shotU = (f: number) => { const s = shotAt(f); return clamp01((f - s.a) / (s.b - s.a)); };

// ---------------- character placement ----------------
// Stage platform top is y = 0.35; podium at (0.4, -23.8); bench nerd at (1.8, -2).
export const STAGE_Y = 0.35;
export const charPos = (f: number): { x: number; y: number; z: number } => {
  const s = shotAt(f), u = shotU(f);
  // NOTE (fix 26 Nov 2026, v3 motion pass): walk-on / tracking positions
  // used to move at constant linear speed — the nerd started and stopped
  // at full speed. glide(u) (smootherstep) eases in and out instead.
  if (s.id === 1) return { x: lerp(-5.5, -1.5, glide(u)), y: STAGE_Y, z: -23.2 };
  if (s.id === 10) return { x: 0, y: 0, z: lerp(-8, -2, glide(u)) };
  if (s.id === 16 || s.id === 17) return { x: 1.8, y: 0, z: -2 };
  return { x: 0.4, y: STAGE_Y, z: -23.8 };
};
/** 1 Hz walk cycle = 2 steps/s */
export const walkPhase = (f: number) => ((f / FPS) % 1 + 1) % 1;
/** talk gesture 0..1 within the current shot: right hand rises and falls.
 *  `start` must be the shot's own start frame (shotAt(f).a). */
export const talkGest = (f: number, start: number) => 0.5 + 0.5 * Math.sin(((f - start) / FPS) * Math.PI * 1.1);
export const talkExpr = (f: number, start: number): "smile" | "grin" => (Math.floor((f - start) / 12) % 2 === 0 ? "smile" : "grin");

// ---------------- camera ----------------
// Same grammar as story.ts: symmetric smootherstep glides, holds push in
// (dolly toward the look point), big reframes are hard cuts.
// Camera keys are RELATIVE to their shot start (local frame), so moving a
// shot's boundaries in SHOTS moves its whole camera move with it.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0 (local frame): the subject grows ~rate per frame */
const pushK = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

// The cutaway cards (mouth + brain) hang at (0, 3.0, -14), 3.4 x 6.04 m —
// they overfill the 9:16 frame from ~6.5 m away at fov 40, so the card IS
// the whole shot. Card-shot cameras only move a little (pan / push-in).
const CARD: V3 = [0, 3.0, -14];

const CAMS: Record<number, Key[]> = {
  // 1: stage wide — library + curtains + platform, nerd walks in small
  1: [
    { f: 0, s: () => dolly([6.5, 4.6, 2], [0, 2.0, -24], 1, { fov: 44 }) },
    { f: 45, dur: 40, s: (f) => dolly([4.5, 3.8, -2], [0, 1.9, -24], pushK(f, 45, 0.002), { fov: 42, roll: -0.02 }) },
  ],
  // 2: stage medium at the podium — shock, mouth dry
  2: [
    { f: 0, s: () => dolly([1.4, 2.0, -17.2], [0.4, 1.55, -23.8], 1, { fov: 40 }) },
    { f: 50, dur: 40, s: (f) => dolly([1.1, 1.9, -18.2], [0.4, 1.55, -23.8], pushK(f, 50, 0.002), { fov: 39 }) },
  ],
  // 3: mouth cutaway — slow pan left across the three taps
  3: [
    { f: 0, s: () => dolly([-0.5, 3.1, -7.4], CARD, 1, { fov: 40 }) },
    { f: 55, dur: 40, s: () => dolly([0.5, 2.9, -7.6], CARD, 1, { fov: 40 }) },
  ],
  // 4: mouth cutaway — pull-back a touch, different angle
  4: [
    { f: 0, s: () => dolly([0.6, 3.3, -7.9], [0.2, 2.9, -14], 1, { fov: 40 }) },
    { f: 45, dur: 35, s: (f) => dolly([0.2, 3.1, -7.5], CARD, pushK(f, 45, 0.002), { fov: 39 }) },
  ],
  // 5: brain room — push-in on the big red switch
  5: [
    { f: 0, s: () => dolly([0, 3.0, -7.4], [0, 2.4, -14], 1, { fov: 40 }) },
    { f: 45, dur: 35, s: (f) => dolly([0, 2.8, -8.0], [0, 2.3, -14], pushK(f, 45, 0.0022), { fov: 38 }) },
  ],
  // 6: mouth cutaway — closer on one tap, thick goo
  6: [
    { f: 0, s: () => dolly([0.7, 2.7, -8.1], [-0.3, 3.2, -14], 1, { fov: 40 }) },
    { f: 45, dur: 35, s: (f) => dolly([0.4, 2.8, -7.7], [-0.1, 3.1, -14], pushK(f, 45, 0.002), { fov: 39 }) },
  ],
  // 7: stage close — worried, hand to throat
  7: [
    { f: 0, s: () => dolly([1.7, 2.05, -18.3], [0.4, 1.6, -23.8], 1, { fov: 38 }) },
    { f: 40, dur: 30, s: (f) => dolly([1.4, 1.95, -18.9], [0.4, 1.6, -23.8], pushK(f, 40, 0.002), { fov: 37 }) },
  ],
  // 8: stage close-up — tries to speak, tongue stuck (head + shoulders)
  8: [
    { f: 0, s: () => dolly([0.8, 2.0, -20.6], [0.4, 1.85, -23.8], 1, { fov: 34 }) },
    { f: 45, dur: 35, s: (f) => dolly([0.75, 1.95, -21.0], [0.4, 1.85, -23.8], pushK(f, 45, 0.0022), { fov: 33, roll: 0.02 }) },
  ],
  // 9: mouth cutaway — tongue glued to the roof, goo strands
  9: [
    { f: 0, s: () => dolly([-0.5, 3.3, -7.8], [0.2, 2.9, -14], 1, { fov: 40 }) },
    { f: 55, dur: 40, s: (f) => dolly([-0.2, 3.1, -7.4], CARD, pushK(f, 55, 0.002), { fov: 39 }) },
  ],
  // 10: campus side tracking — nerd walks the path, wind + shrinking puddle
  10: [
    { f: 0, s: (f) => { const z = lerp(-8, -2, glide(f / 105)); return dolly([7.5, 2.3, z + 1.5], [0, 1.3, z], 1, { fov: 40 }); } },
    { f: 50, dur: 40, s: (f) => { const z = lerp(-8, -2, glide(f / 105)); return dolly([6.4, 2.0, z + 1.2], [0, 1.25, z], pushK(f, 50, 0.0018), { fov: 38, roll: 0.025 }); } },
  ],
  // 11: stage low angle — breathing at the podium, wind gusts across the stage
  11: [
    { f: 0, s: () => dolly([-5.5, 1.3, -15.5], [0.4, 1.7, -23.8], 1, { fov: 42 }) },
    { f: 55, dur: 40, s: (f) => dolly([-4.6, 1.5, -16.8], [0.4, 1.6, -23.8], pushK(f, 55, 0.0018), { fov: 40 }) },
  ],
  // 12: brain room — two screens, interview vs bear
  12: [
    { f: 0, s: () => dolly([0, 3.0, -7.4], CARD, 1, { fov: 40 }) },
    { f: 50, dur: 40, s: () => dolly([-0.4, 3.1, -7.7], CARD, 1, { fov: 40 }) },
  ],
  // 13: brain room — bear screen wins, push-in on it
  13: [
    { f: 0, s: () => dolly([0.6, 2.9, -8.0], [0.5, 2.9, -14], 1, { fov: 39 }) },
    { f: 40, dur: 30, s: (f) => dolly([0.7, 2.8, -8.4], [0.6, 2.9, -14], pushK(f, 40, 0.0022), { fov: 37 }) },
  ],
  // 14: stage medium — relieved smile, brain means well
  14: [
    { f: 0, s: () => dolly([2.3, 2.1, -17.0], [0.4, 1.55, -23.8], 1, { fov: 40 }) },
    { f: 55, dur: 40, s: (f) => dolly([1.9, 2.0, -17.8], [0.4, 1.55, -23.8], pushK(f, 55, 0.002), { fov: 39, roll: -0.02 }) },
  ],
  // 15: mouth cutaway — taps flow watery blue again, gentle pan
  15: [
    { f: 0, s: () => dolly([0.5, 2.9, -7.6], CARD, 1, { fov: 40 }) },
    { f: 65, dur: 50, s: () => dolly([-0.5, 3.1, -7.4], CARD, 1, { fov: 40 }) },
  ],
  // 16: bench close — talking to camera, open book (CTA)
  16: [
    { f: 0, s: () => dolly([1.8, 1.85, 3.8], [1.8, 1.35, -1.2], 1, { fov: 38 }) },
    { f: 60, dur: 45, s: (f) => dolly([1.8, 1.75, 3.3], [1.8, 1.4, -1.2], pushK(f, 60, 0.0022), { fov: 37 }) },
  ],
  // 17: bench closer — grin, follow gesture (CTA)
  17: [
    { f: 0, s: () => dolly([1.8, 1.7, 3.0], [1.8, 1.4, -1.2], 1, { fov: 36 }) },
    { f: 60, dur: 45, s: (f) => dolly([1.8, 1.65, 2.6], [1.8, 1.42, -1.2], pushK(f, 60, 0.0022), { fov: 35, roll: -0.02 }) },
  ],
};

/** camera for shot id at global frame f — converts to the shot's local frame
 *  first, so moving a shot's boundaries moves its camera move with it. */
export const camAt = (id: number, f: number): Cam => {
  const shot = SHOTS[id - 1];
  return run(CAMS[id], f - shot.a);
};

// ---------------- lens: depth of field ----------------
// Close-ups get mild DOF on the nerd; card shots and wides stay sharp.
// (Shot-based, not frame-based, so a retime keeps the DOF on the same shots.)
export const dofAt = (f: number): { cInf: number; focus?: V3 } => {
  const id = shotAt(f).id;
  if (id === 8) return { cInf: 10, focus: [0.4, 1.85, -23.8] };
  if (id === 16 || id === 17) return { cInf: 10, focus: [1.8, 1.4, -1.2] };
  return { cInf: 0 };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ?? camAt(id, f).look;
};

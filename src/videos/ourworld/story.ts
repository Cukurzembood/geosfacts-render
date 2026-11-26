// Timeline of the OurWorld test clip: 300 frames (10 s at 30 fps), 3 shots,
// HARD CUTS only (no crossfades — our channel rule), camera always gliding
// with a slow push-in, angle/movement change on every cut, parallax.
// The nerd walks the campus path from the library toward the bench, then
// stops and talks with his open book.
export const FPS = 30;
export const TOTAL = 300;

export type V3 = [number, number, number];
export type Light = "day";
export type ShotDef = { id: number; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 120, light: "day" },   // wide: library + lawn, nerd walks in from the steps
  { id: 2, a: 120, b: 210, light: "day" }, // side tracking: nerd walks the path, books under his arm
  { id: 3, a: 210, b: 300, light: "day" }, // close-up at the bench: nerd talks with his open book
];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

/** character z on the path (library steps -16 -> bench -2); x stays 0 until the cut to shot 3 */
export const charZ = (f: number) => (f < 120 ? -16 + (f / 120) * 6 : f < 210 ? -10 + ((f - 120) / 90) * 8 : -2);
export const charX = (f: number) => (f < 210 ? 0 : 1.8);
export const charY = 0;
/** 1 Hz walk cycle = 2 steps/s */
export const walkPhase = (f: number) => ((f / FPS) % 1 + 1) % 1;
/** talk gesture 0..1: right hand rises and falls while he explains */
export const talkGest = (f: number) => 0.5 + 0.5 * Math.sin(((f - 210) / FPS) * Math.PI * 1.1);
export const talkExpr = (f: number): "smile" | "grin" => (Math.floor((f - 210) / 12) % 2 === 0 ? "smile" : "grin");

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

// ---------------- camera ----------------
// Same grammar as the bridge skill: symmetric smootherstep glides, holds push
// in (dolly toward the look point), big reframes are hard cuts.
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
/** push-in factor since f0: the subject grows ~rate per frame */
const pushK = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

// shot 1: wide of the library, slow push-in; the nerd walks in small from the steps
const S1a = (f: number) => dolly([7.5, 5.2, 18], [0, 2.2, -16], pushK(f, 0, 0.0022), { fov: 44 });
const S1b = (f: number) => dolly([4.5, 3.6, 13], [0, 1.9, -15], pushK(f, 60, 0.002), { fov: 42, roll: -0.02 });
// shot 2: side tracking shot that rides along with the nerd (camera z follows him)
const S2a = (f: number) => { const z = charZ(f); return dolly([7.5, 2.3, z + 1.5], [0, 1.3, z], pushK(f, 120, 0.0018), { fov: 40 }); };
const S2b = (f: number) => { const z = charZ(f); return dolly([6.2, 1.9, z + 1.2], [0, 1.25, z], pushK(f, 165, 0.0018), { fov: 38, roll: 0.025 }); };
// shot 3: close-up at the bench, slow push-in on the talking nerd
const S3a = (f: number) => dolly([1.8, 1.85, 3.8], [1.8, 1.35, -1.2], pushK(f, 210, 0.0028), { fov: 38 });
const S3b = (f: number) => dolly([1.8, 1.7, 3.0], [1.8, 1.4, -1.2], pushK(f, 255, 0.0022), { fov: 36, roll: -0.02 });

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: S1a },
    { f: 60, dur: 40, s: S1b },
  ],
  2: [
    { f: 120, s: S2a },
    { f: 165, dur: 30, s: S2b },
  ],
  3: [
    { f: 210, s: S3a },
    { f: 255, dur: 30, s: S3b },
  ],
};

export const camAt = (id: number, f: number): Cam => run(CAMS[id], f);

// ---------------- lens: depth of field ----------------
// Wide + tracking shots stay sharp; the close-up gets mild DOF on the nerd.
export const dofAt = (f: number): { cInf: number; focus?: V3 } => {
  if (f < 210) return { cInf: 0 };
  return { cInf: 10, focus: [1.8, 1.4, -1.2] };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ?? camAt(id, f).look;
};

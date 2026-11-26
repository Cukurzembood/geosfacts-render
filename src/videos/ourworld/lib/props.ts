// lib/props.ts — reusable topic props, drawn with the toon.ts Canvas2D Pen
// API on a 1080x1920 portrait card (unless noted). Every prop takes
// (p, t, params) so any video can place it: no hardcoded shot, no hardcoded
// frame range. All motion runs through lib/motion.ts — no raw linear `t`,
// no teleport on cycle wrap.
//
// Provenance: mouthCutaway / brainRoom / windStreaks / dryingPuddle are the
// video-050 sets (sets050.ts, incl. the 26 Nov v3 motion fix) generalised
// with parameters. swellSponge / flowArrows / nostrilSeesaw are new generic
// helpers in the same style, built for the 051 assembly plan (see README).
// NO template copying: no bridge, no soldiers, no template world — only our
// Kampus Sains props and our nerd.
import { Pen, blobPts } from "../../bridge/toon";
import { clamp01, smooth, rgba, fallState, dropPhase, ripple, splat } from "./motion";

const rad = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------------------
// MOUTH CUTAWAY — inside the mouth: palate at top, tongue at bottom, gland
// taps hanging from the palate. Modes:
//   watery — taps pour thin blue streams, pool full
//   thick  — taps drip slow fat amber goo, pool low and sticky
//   glued  — tongue pressed to the palate, goo strands, almost no pool
// `t` is 0..1 progress inside the shot. Params: tap count / spacing /
// colours override the 050 defaults; everything else is the proven card.
// Usage: mouthCutaway(p, "watery", u) — full-frame card, camera looks at it.
// ---------------------------------------------------------------------------
export type MouthMode = "watery" | "thick" | "glued";
export type MouthOpts = {
  taps?: number; tapGap?: number; spoutY?: number;
  watery?: string; wateryLight?: string; goo?: string; gooLight?: string;
  poolY?: number;
};
export const mouthCutaway = (p: Pen, mode: MouthMode, t: number, o: MouthOpts = {}) => {
  const taps = o.taps ?? 3, gap = o.tapGap ?? 270, spoutY = o.spoutY ?? 470;
  const TAP_X = Array.from({ length: taps }, (_, i) => 540 + (i - (taps - 1) / 2) * gap);
  const watery = o.watery ?? "#5fb7e8", wateryLight = o.wateryLight ?? "#7cc7ee";
  const goo = o.goo ?? "#d9a441", gooLight = o.gooLight ?? "#f0c96a", gooDark = "#c98f2e";
  const poolY = o.poolY ?? 1760;
  p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#7a2233", 0);
  const inner = blobPts(540, 960, { a: 560, b: 980, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 3 });
  p.shadedFill(inner, "#c65a6e", "#8e2f42", rad(-60), 560);
  const palate = blobPts(540, 260, { a: 520, b: 260, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(palate, "#e08a97", "#c65a6e", rad(-120), 300);
  for (const x of TAP_X) {
    p.poly([[x - 42, 250], [x + 42, 250], [x + 42, 430], [x - 42, 430]], "#8fa3b5", 8);
    p.poly([[x - 26, 430], [x + 26, 430], [x + 26, spoutY], [x - 26, spoutY]], "#6d8398", 8);
    p.ell(x, spoutY + 8, 26, 12, "#5a6d80", 6);
  }
  if (mode === "watery") {
    for (let i = 0; i < taps; i++) {
      const x = TAP_X[i];
      const ph = dropPhase(t, 2, i * 0.37);
      p.stroke([[x, spoutY + 14], [x, spoutY + 130]], 10, watery);
      const d = fallState(ph);
      ripple(p, x, poolY - 125, ph, watery);
      p.ell(x, spoutY + 150 + d.yFrac * 1000, 16 * d.rx, 24 * d.ry, rgba(watery, d.alpha), 0);
      const ph2 = (ph + 0.5) % 1, d2 = fallState(ph2);
      ripple(p, x - 26, poolY - 125, ph2, wateryLight);
      p.ell(x - 26, spoutY + 300 + d2.yFrac * 850, 11 * d2.rx, 16 * d2.ry, rgba(wateryLight, d2.alpha), 0);
    }
    const pool = blobPts(540, poolY, { a: 520, b: 150, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 9 });
    p.shadedFill(pool, "#6fc3ef", "#3f8fc4", rad(-120), 200);
    p.stroke([[80, poolY - 80], [300, poolY - 105], [540, poolY - 85], [780, poolY - 108], [1000, poolY - 88]], 8, "#bfe6fb");
  } else if (mode === "thick") {
    for (let i = 0; i < taps; i++) {
      const x = TAP_X[i];
      const ph = dropPhase(t, 0.6, i * 0.31);
      const d = fallState(ph);
      const dy = spoutY + 60 + d.yFrac * 1200;
      const strandA = 1 - smooth(0.25, 0.45, ph);
      if (strandA > 0.01) p.stroke([[x, spoutY + 14], [x, dy - 26 * d.ry]], 14, rgba(gooDark, strandA));
      splat(p, x, poolY - 15, ph, gooDark);
      p.ell(x, dy, 26 * d.rx, 36 * d.ry, rgba(goo, d.alpha), 0);
      p.ell(x, dy - 8 * d.ry, 12 * d.rx, 14 * d.ry, rgba(gooLight, d.alpha * 0.9), 0);
    }
    const pool = blobPts(540, poolY + 70, { a: 480, b: 90, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 9 });
    p.shadedFill(pool, gooDark, "#8a5f1c", rad(-120), 160);
    p.stroke([[200, poolY + 30], [500, poolY + 10], [820, poolY + 28]], 7, "#e8bc62");
  } else {
    const tongue = blobPts(540, 1150, { a: 430, b: 780, nTop: 2, nBot: 2, egg: 0.35, asym: 0, rot: 0, noise: 0.01, seed: 11 });
    p.shadedFill(tongue, "#e88a96", "#c65a6e", rad(-120), 420);
    for (const x of [330, 540, 750]) {
      p.stroke([[x, 480], [x - 18, 700], [x + 10, 900]], 12, goo);
      p.ell(x, 500, 14, 20, goo, 6);
    }
    const dry = blobPts(540, 1850, { a: 300, b: 60, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: 13 });
    p.poly(dry, "#a86a4e", 6);
    p.stroke([[380, 1830], [540, 1845], [700, 1832]], 6, gooDark);
  }
  p.poly([[14, 14], [1066, 14], [1066, 1906], [14, 1906]], null, 16);
};

// ---------------------------------------------------------------------------
// BRAIN CONTROL ROOM — dark room, two screens on the wall (left / right),
// a worried brain blob, a control panel with a big lever, an alarm light.
// `sw` 0 = calm (blue, lever left) .. 1 = fight (red, lever right);
// `focus` highlights one screen; `t` drives the alarm pulse.
// Usage: brainRoom(p, { sw: glide(u), focus: "bear", t: u }).
// ---------------------------------------------------------------------------
export type BrainFocus = "none" | "interview" | "bear";
export type BrainOpts = { sw?: number; focus?: BrainFocus; t?: number };
export const brainRoom = (p: Pen, o: BrainOpts = {}) => {
  const sw = o.sw ?? 0, focus = o.focus ?? "none", t = o.t ?? 0;
  p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#2e2a36", 0);
  p.poly([[0, 1420], [1080, 1420], [1080, 1920], [0, 1920]], "#241f2e", 0);
  for (const x of [60, 380, 700, 1020]) p.stroke([[x, 60], [x, 1420]], 6, "#3d3749");
  const screen = (x0: number, x1: number, on: boolean, glow: string) => {
    p.poly([[x0, 240], [x1, 240], [x1, 900], [x0, 900]], on ? "#20242e" : "#1a1d26", on ? 14 : 8);
    if (on) p.stroke([[x0 - 14, 226], [x1 + 14, 226], [x1 + 14, 914], [x0 - 14, 914]], 10, glow);
  };
  // left screen: job interview — desk, nerd with glasses, interviewer
  screen(70, 500, focus === "interview", "#7cc7ee");
  p.poly([[110, 780], [460, 780], [460, 860], [110, 860]], "#5a4632", 6);
  p.ell(210, 640, 62, 62, "#ffffff", 8);
  p.dot(192, 632, 6); p.dot(228, 632, 6);
  p.ell(192, 632, 20, 20, null, 5); p.ell(228, 632, 20, 20, null, 5);
  p.poly([[150, 700], [270, 700], [285, 790], [135, 790]], "#d9a441", 6);
  p.ell(400, 640, 62, 62, "#f5c9a0", 8);
  p.dot(388, 632, 6); p.dot(412, 632, 6);
  p.arc(400, 668, 18, 10, 20, 160, 5);
  p.poly([[340, 700], [460, 700], [460, 790], [340, 790]], "#3f6fb5", 6);
  // right screen: the bear — brown blob, ears, snout, on green
  screen(580, 1010, focus === "bear", "#e8a34c");
  p.poly([[600, 260], [990, 260], [990, 880], [600, 880]], "#4a6b3a", 0);
  const bear = blobPts(795, 620, { a: 150, b: 170, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 7 });
  p.shadedFill(bear, "#8a5a34", "#5f3c20", rad(-120), 150);
  p.ell(680, 480, 46, 46, "#8a5a34", 8); p.ell(910, 480, 46, 46, "#8a5a34", 8);
  p.ell(680, 480, 20, 20, "#c9a184", 0); p.ell(910, 480, 20, 20, "#c9a184", 0);
  p.ell(795, 700, 62, 44, "#c9a184", 8);
  p.ell(795, 682, 26, 18, "#3a2a1c", 5);
  p.dot(745, 590, 9); p.dot(845, 590, 9);
  p.arc(795, 740, 26, 14, 20, 160, 6);
  // worried brain blob on a stand between the screens
  const brain = blobPts(540, 1080, { a: 92, b: 82, nTop: 2.4, nBot: 2.2, egg: 0, asym: 0.08, rot: 0, noise: 0.03, seed: 15 });
  p.shadedFill(brain, "#f2a0b5", "#d4738e", rad(-120), 90);
  p.inkRing(brain, 8, 0.6);
  p.dot(512, 1062, 6); p.dot(568, 1062, 6);
  p.arc(540, 1110, 16, 9, 200, 340, 5);
  p.stroke([[540, 1162], [540, 1240]], 8);
  // control panel + big lever (lever x eases with sw — never a snap)
  p.poly([[120, 1480], [960, 1480], [960, 1840], [120, 1840]], "#4a4456", 10);
  const lx = 330 + sw * 420;
  p.stroke([[330, 1660], [750, 1660]], 16, "#2e2a36");
  p.ell(330, 1660, 22, 22, "#7cc7ee", 6);
  p.ell(750, 1660, 22, 22, "#c0392b", 6);
  p.stroke([[lx, 1660], [lx - 26, 1560]], 18, "#8fa3b5");
  p.ell(lx - 30, 1548, 30, 30, sw > 0.5 ? "#c0392b" : "#7cc7ee", 8);
  const alarm = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
  const alarmCol = sw > 0.5 ? rgba("#e0392b", 0.55 + 0.45 * alarm) : "#5a5468";
  p.ell(880, 1560, 34, 34, alarmCol, 8);
  if (sw > 0.5) {
    for (let i = 0; i < 8; i++) {
      const a = rad(i * 45 + t * 30);
      p.stroke([[880 + Math.cos(a) * 48, 1560 + Math.sin(a) * 48], [880 + Math.cos(a) * 74, 1560 + Math.sin(a) * 74]], 7, "#e0392b");
    }
  }
  for (const [x, v] of [[220, 0.3], [300, 0.7]] as const) {
    p.ell(x, 1760, 26, 26, "#2e2a36", 6);
    p.stroke([[x, 1760], [x + 18 * Math.cos(rad(-90 + v * 180)), 1760 + 18 * Math.sin(rad(-90 + v * 180))]], 6, "#e8c45a");
  }
  p.poly([[14, 14], [1066, 14], [1066, 1906], [14, 1906]], null, 16);
};

// ---------------------------------------------------------------------------
// WIND STREAKS — soft white gust lines streaming past (fast breathing,
// wind, drying air). `t` 0..1 shot progress; `dir` 1 = blows left,
// -1 = blows right. Streaks travel on a smoothstep curve and fade in/out
// at the ends — never a constant-speed teleport (v3 fix).
// Usage: windStreaks(p, u, { dir: 1 }) on a full-frame transparent card.
// ---------------------------------------------------------------------------
export type WindOpts = { dir?: number; count?: number; color?: string };
export const windStreaks = (p: Pen, t: number, o: WindOpts = {}) => {
  const dir = o.dir ?? 1, count = o.count ?? 4, col = o.color ?? "#ffffff";
  for (let i = 0; i < count; i++) {
    const y = 60 + i * 70;
    const ph = dropPhase(t, 1.4, i * 0.27);
    const tr = ph * ph * (3 - 2 * ph);
    const fade = Math.min(smooth(0, 0.12, ph), 1 - smooth(0.85, 1, ph));
    const off = tr * 560 * dir;
    const x0 = dir > 0 ? 560 - off : off;
    p.stroke([[x0, y], [x0 - 150 * dir, y + 18], [x0 - 300 * dir, y + 6]], 10, rgba(col, 0.85 * fade));
    p.stroke([[x0 - 40 * dir, y + 40], [x0 - 160 * dir, y + 52]], 7, rgba(col, 0.6 * fade));
  }
};

// ---------------------------------------------------------------------------
// DRYING PUDDLE — flat blue ellipse on the ground, shrinking as it dries.
// Drawn on a 256x256 flat Fx card. `u` 0 = full puddle .. 1 = gone.
// Usage: dryingPuddle(p, shotU) with the card scaled down over the shot.
// ---------------------------------------------------------------------------
export const dryingPuddle = (p: Pen, u: number) => {
  const k = 1 - smooth(0.1, 0.95, clamp01(u));
  if (k <= 0.01) return;
  const pool = blobPts(128, 128, { a: 120 * k, b: 70 * k, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: 4 });
  p.shadedFill(pool, "#6fc3ef", "#3f8fc4", rad(-120), 120 * k);
  p.stroke([[50, 110], [120, 96], [200, 108]], 6, rgba("#bfe6fb", k));
};

// ---------------------------------------------------------------------------
// SWELL SPONGE — a spongy blob (turbinate, gland, tissue) that swells as
// it fills with fluid. `fill` 0 = slim/empty .. 1 = swollen/full. Vessel
// dots inside spread apart as it swells; colour deepens with fill.
// Generic: any "thing that fills up like a sponge" in a cutaway.
// Usage (051 nose cutaway): swellSponge(p, { cx: 540, cy: 900,
//   rx: 200, ry: 320, fill: glide(u), base: "#e88a96", full: "#b03040" }).
// ---------------------------------------------------------------------------
export type SpongeOpts = {
  cx?: number; cy?: number; rx?: number; ry?: number; fill?: number;
  base?: string; full?: string; seed?: number;
};
export const swellSponge = (p: Pen, o: SpongeOpts = {}) => {
  const cx = o.cx ?? 540, cy = o.cy ?? 960, rx = o.rx ?? 200, ry = o.ry ?? 300;
  const fill = clamp01(o.fill ?? 0), seed = o.seed ?? 5;
  const base = o.base ?? "#e88a96", full = o.full ?? "#b03040";
  const a = rx * (1 + 0.35 * fill), b = ry * (1 + 0.3 * fill);
  const blob = blobPts(cx, cy, { a, b, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot: 0, noise: 0.03, seed });
  // colour deepens with fill: mix base -> full
  const mix2 = (c1: string, c2: string, k: number) => {
    const A = parseInt(c1.slice(1), 16), B = parseInt(c2.slice(1), 16);
    const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k).toString(16).padStart(2, "0");
    return `#${ch(16)}${ch(8)}${ch(0)}`;
  };
  const col = mix2(base, full, fill);
  p.shadedFill(blob, col, mix2(col, "#5a1e28", 0.45), rad(-120), a);
  p.inkRing(blob, 8, 0.6);
  // vessel dots: 8 dots that drift outward as the sponge swells
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 + seed;
    const rr = 0.45 + 0.25 * fill;
    p.dot(cx + Math.cos(ang) * a * rr, cy + Math.sin(ang) * b * rr * 0.8, 7 + 4 * fill, rgba("#7a2233", 0.55));
  }
};

// ---------------------------------------------------------------------------
// FLOW ARROWS — gravity / flow direction arrows that drift along their
// direction on an eased loop and fade at both ends (never pop in/out).
// `dir` 1 = pointing down (flow down), -1 = pointing up (flow back up).
// Usage (051): flowArrows(p, { x: 540, y: 500, dir: -1, t: u })
//   for "blood flows back up" when lying flat.
// ---------------------------------------------------------------------------
export type FlowArrowOpts = { x?: number; y?: number; dir?: 1 | -1; t?: number; color?: string; count?: number };
export const flowArrows = (p: Pen, o: FlowArrowOpts = {}) => {
  const x = o.x ?? 540, y = o.y ?? 600, dir = o.dir ?? 1, t = o.t ?? 0;
  const col = o.color ?? "#7cc7ee", count = o.count ?? 3;
  for (let i = 0; i < count; i++) {
    const ph = dropPhase(t, 1, i / count);
    const tr = ph * ph * (3 - 2 * ph); // eased travel
    const fade = Math.min(smooth(0, 0.15, ph), 1 - smooth(0.8, 1, ph));
    const ay = y + (tr - 0.5) * 260 * dir;
    const ax = x + (i - (count - 1) / 2) * 150;
    const d = dir * 34;
    p.stroke([[ax, ay - d], [ax, ay + d]], 12, rgba(col, fade));
    p.poly([[ax - 20, ay + d - dir * 26], [ax + 20, ay + d - dir * 26], [ax, ay + d]], rgba(col, fade), 0);
  }
};

// ---------------------------------------------------------------------------
// NOSTRIL SEESAW — two sides taking turns: a plank tilts by a slow sine,
// one side's blob swells while the other opens. `t` 0..1 shot progress;
// `period` = swaps per shot (0.5 = one swap across the shot).
// Generic: any two-side alternation (nostrils, eyes, scales).
// Usage (051): nostrilSeesaw(p, { t: u, period: 0.5, left: "#e88a96" }).
// ---------------------------------------------------------------------------
export type SeesawOpts = { cx?: number; cy?: number; t?: number; period?: number; left?: string; right?: string };
export const nostrilSeesaw = (p: Pen, o: SeesawOpts = {}) => {
  const cx = o.cx ?? 540, cy = o.cy ?? 1000, t = o.t ?? 0, period = o.period ?? 0.5;
  const left = o.left ?? "#e88a96", right = o.right ?? "#7cc7ee";
  const tilt = Math.sin(t * Math.PI * 2 * period) * 0.35; // radians, slow
  const fillL = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * period);
  const fillR = 1 - fillL;
  // plank
  const c = Math.cos(tilt), s = Math.sin(tilt), hw = 380, hh = 18;
  const corners: Array<[number, number]> = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(
    ([dx, dy]) => [cx + dx * c - dy * s, cy + dx * s + dy * c],
  );
  p.poly(corners, "#8a5a3a", 8);
  // fulcrum
  p.poly([[cx - 40, cy + 40], [cx + 40, cy + 40], [cx, cy - 10]], "#5a4632", 6);
  // two blobs riding the plank ends: swollen side = bigger + deeper red
  for (const [side, fill, col] of [[-1, fillL, left], [1, fillR, right]] as const) {
    const ex = cx + side * hw * c, ey = cy + side * hw * s - 60 - 50 * fill;
    const blob = blobPts(ex, ey, { a: 90 + 50 * fill, b: 80 + 40 * fill, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: side > 0 ? 6 : 8 });
    p.shadedFill(blob, col, "#5a1e28", rad(-120), 110);
    p.inkRing(blob, 7, 0.6);
    p.dot(ex - 22, ey - 8, 6); p.dot(ex + 22, ey - 8, 6);
  }
};

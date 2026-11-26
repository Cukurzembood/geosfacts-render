// Topic-specific sets for video 050, drawn with the same toon.ts Canvas2D Pen
// API as the nerd character. Two big portrait "set cards" (1080x1920 canvas)
// that fill the frame when the camera looks at them, plus small Fx pieces
// (wind streaks, drying puddle). No text anywhere on screen.
import { Pen, INK, blobPts, mul } from "../bridge/toon";

const rad = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------------------
// MOUTH CUTAWAY — inside the mouth: palate at top, tongue at bottom, three
// gland taps hanging from the palate. States:
//   watery — taps pour thin blue streams, pool at the bottom is full
//   thick  — taps drip slow fat amber goo, pool is low and sticky
//   glued  — tongue pressed up to the palate, goo strands, almost no pool
// `t` is 0..1 progress inside the shot (drives drop positions).
// ---------------------------------------------------------------------------
export type MouthMode = "watery" | "thick" | "glued";
const TAP_X = [270, 540, 810];
const SPOUT_Y = 470;

// --- droplet physics (fix 26 Nov 2026: drops fell at constant linear
// speed and TELEPORTED from pool back to spout on cycle wrap, and the card
// texture only refreshed 12x/shot, so the motion read as choppy/glitchy) ---
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** smoothstep between a and b */
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
};
/**
 * Fall state for one drop cycle, u = 0..1 cycle progress.
 * Gravity: y follows u^2, so the drop accelerates instead of falling at a
 * constant speed. alpha fades in at the spout (first 8%) and out at the
 * pool (last 10%), so the cycle wrap never pops. ry stretches with speed
 * and squashes on impact; rx widens on impact.
 */
const fallState = (u: number) => {
  const yFrac = u * u;
  const alpha = Math.min(smooth(0, 0.08, u), 1 - smooth(0.9, 1, u));
  const stretch = 1 + 0.9 * u;
  const squash = 1 - 0.45 * smooth(0.92, 1, u);
  const widen = 1 + 0.7 * smooth(0.92, 1, u);
  return { yFrac, alpha, ry: stretch * squash, rx: widen / Math.sqrt(stretch) };
};
/** Impact ripple: flat ring on the pool surface, expanding + fading over
 *  the last 12% of the cycle. Drawn before the drop so the drop overlaps it. */
const ripple = (p: Pen, x: number, y: number, u: number, col: string) => {
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
 *  of the cycle, fading as it spreads. */
const splat = (p: Pen, x: number, y: number, u: number, col: string) => {
  const k = smooth(0.88, 1, u);
  if (k <= 0) return;
  p.ell(x, y, 26 + 46 * k, 12 - 4 * k, rgba(col, 0.8 * (1 - k)), 0);
};

export const mouthCard = (p: Pen, mode: MouthMode, t: number) => {
  // interior: deep red mouth, darker toward the edges
  p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#7a2233", 0);
  const inner = blobPts(540, 960, { a: 560, b: 980, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 3 });
  p.shadedFill(inner, "#c65a6e", "#8e2f42", rad(-60), 560);
  // upper palate: lighter pink arch at the top
  const palate = blobPts(540, 260, { a: 520, b: 260, nTop: 2, nBot: 2, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(palate, "#e08a97", "#c65a6e", rad(-120), 300);
  // three gland taps: grey-blue pipes hanging from the palate
  for (const x of TAP_X) {
    p.poly([[x - 42, 250], [x + 42, 250], [x + 42, 430], [x - 42, 430]], "#8fa3b5", 8);
    p.poly([[x - 26, 430], [x + 26, 430], [x + 26, SPOUT_Y], [x - 26, SPOUT_Y]], "#6d8398", 8);
    p.ell(x, SPOUT_Y + 8, 26, 12, "#5a6d80", 6);
  }
  if (mode === "watery") {
    // thin blue streams + falling drops, staggered per tap. Drops fall with
    // gravity (accelerating), fade in at the spout, fade + squash into the
    // pool with a ripple on impact — no teleport on cycle wrap.
    for (let i = 0; i < 3; i++) {
      const x = TAP_X[i];
      const ph = (t * 2 + i * 0.37) % 1;
      p.stroke([[x, SPOUT_Y + 14], [x, SPOUT_Y + 130]], 10, "#5fb7e8");
      const d = fallState(ph);
      const dy = SPOUT_Y + 150 + d.yFrac * 1000;
      ripple(p, x, 1635, ph, "#5fb7e8");
      p.ell(x, dy, 16 * d.rx, 24 * d.ry, rgba("#5fb7e8", d.alpha), 0);
      // second, smaller droplet half a cycle out of phase
      const ph2 = (ph + 0.5) % 1;
      const d2 = fallState(ph2);
      const dy2 = SPOUT_Y + 300 + d2.yFrac * 850;
      ripple(p, x - 26, 1635, ph2, "#7cc7ee");
      p.ell(x - 26, dy2, 11 * d2.rx, 16 * d2.ry, rgba("#7cc7ee", d2.alpha), 0);
    }
    // full pool at the bottom
    const pool = blobPts(540, 1760, { a: 520, b: 150, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 9 });
    p.shadedFill(pool, "#6fc3ef", "#3f8fc4", rad(-120), 200);
    p.stroke([[80, 1680], [300, 1655], [540, 1675], [780, 1652], [1000, 1672]], 8, "#bfe6fb");
  } else if (mode === "thick") {
    // one fat amber drop per tap: slow, accelerates, stretches a sticky
    // strand that snaps mid-fall, then free-falls and splats into the pool.
    for (let i = 0; i < 3; i++) {
      const x = TAP_X[i];
      const ph = (t * 0.6 + i * 0.31) % 1;
      const d = fallState(ph);
      const dy = SPOUT_Y + 60 + d.yFrac * 1200;
      // strand to the spout while still attached, snapping at u ~ 0.4
      const strandA = 1 - smooth(0.25, 0.45, ph);
      if (strandA > 0.01) {
        p.stroke([[x, SPOUT_Y + 14], [x, dy - 26 * d.ry]], 14, rgba("#c98f2e", strandA));
      }
      splat(p, x, 1745, ph, "#c98f2e");
      p.ell(x, dy, 26 * d.rx, 36 * d.ry, rgba("#d9a441", d.alpha), 0);
      p.ell(x, dy - 8 * d.ry, 12 * d.rx, 14 * d.ry, rgba("#f0c96a", d.alpha * 0.9), 0);
    }
    // low sticky pool
    const pool = blobPts(540, 1830, { a: 480, b: 90, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 9 });
    p.shadedFill(pool, "#c98f2e", "#8a5f1c", rad(-120), 160);
    p.stroke([[200, 1790], [500, 1770], [820, 1788]], 7, "#e8bc62");
  } else {
    // glued: tongue stretched up to the palate, goo strands holding it
    const tongue = blobPts(540, 1150, { a: 430, b: 780, nTop: 2, nBot: 2, egg: 0.35, asym: 0, rot: 0, noise: 0.01, seed: 11 });
    p.shadedFill(tongue, "#e88a96", "#c65a6e", rad(-120), 420);
    for (const x of [330, 540, 750]) {
      p.stroke([[x, 480], [x - 18, 700], [x + 10, 900]], 12, "#d9a441");
      p.ell(x, 500, 14, 20, "#d9a441", 6);
    }
    // almost-dry patch at the bottom
    const dry = blobPts(540, 1850, { a: 300, b: 60, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: 13 });
    p.poly(dry, "#a86a4e", 6);
    p.stroke([[380, 1830], [540, 1845], [700, 1832]], 6, "#c98f2e");
  }
  // ink frame so the card reads as a scene, not a flat fill
  p.poly([[14, 14], [1066, 14], [1066, 1906], [14, 1906]], null, 16);
};

// ---------------------------------------------------------------------------
// BRAIN CONTROL ROOM — dark room, two screens on the wall (interview left,
// bear right), a big FIGHT OR FLIGHT lever on the panel below, and a small
// worried brain blob. `sw` 0 = calm (blue, lever left) .. 1 = fight (red,
// lever right). `focus` highlights one screen. `t` drives the alarm pulse.
// ---------------------------------------------------------------------------
export type BrainFocus = "none" | "interview" | "bear";
export const brainCard = (p: Pen, sw: number, focus: BrainFocus, t: number) => {
  // room: charcoal walls, floor band, wall panels
  p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#2e2a36", 0);
  p.poly([[0, 1420], [1080, 1420], [1080, 1920], [0, 1920]], "#241f2e", 0);
  for (const x of [60, 380, 700, 1020]) p.stroke([[x, 60], [x, 1420]], 6, "#3d3749");
  // screens
  const screen = (x0: number, x1: number, on: boolean, glow: string) => {
    p.poly([[x0, 240], [x1, 240], [x1, 900], [x0, 900]], on ? "#20242e" : "#1a1d26", on ? 14 : 8);
    if (on) p.stroke([[x0 - 14, 226], [x1 + 14, 226], [x1 + 14, 914], [x0 - 14, 914]], 10, glow);
  };
  // left screen: job interview — desk, two figures (nerd with glasses, interviewer)
  screen(70, 500, focus === "interview", "#7cc7ee");
  p.poly([[110, 780], [460, 780], [460, 860], [110, 860]], "#5a4632", 6);
  p.ell(210, 640, 62, 62, "#ffffff", 8); // nerd head
  p.dot(192, 632, 6); p.dot(228, 632, 6);
  p.ell(192, 632, 20, 20, null, 5); p.ell(228, 632, 20, 20, null, 5);
  p.poly([[150, 700], [270, 700], [285, 790], [135, 790]], "#d9a441", 6); // mustard vest
  p.ell(400, 640, 62, 62, "#f5c9a0", 8); // interviewer head
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
  // control panel + big lever
  p.poly([[120, 1480], [960, 1480], [960, 1840], [120, 1840]], "#4a4456", 10);
  const lx = 330 + sw * 420; // lever x: left (calm) -> right (fight)
  p.stroke([[330, 1660], [750, 1660]], 16, "#2e2a36");
  p.ell(330, 1660, 22, 22, "#7cc7ee", 6);
  p.ell(750, 1660, 22, 22, "#c0392b", 6);
  p.stroke([[lx, 1660], [lx - 26, 1560]], 18, "#8fa3b5");
  p.ell(lx - 30, 1548, 30, 30, sw > 0.5 ? "#c0392b" : "#7cc7ee", 8);
  // alarm light: pulses red when the switch is on fight
  const alarm = 0.5 + 0.5 * Math.sin(t * Math.PI * 4);
  const alarmCol = sw > 0.5 ? `rgba(224,57,43,${0.55 + 0.45 * alarm})` : "#5a5468";
  p.ell(880, 1560, 34, 34, alarmCol, 8);
  if (sw > 0.5) {
    for (let i = 0; i < 8; i++) {
      const a = rad(i * 45 + t * 30);
      p.stroke([[880 + Math.cos(a) * 48, 1560 + Math.sin(a) * 48], [880 + Math.cos(a) * 74, 1560 + Math.sin(a) * 74]], 7, "#e0392b");
    }
  }
  // small dials
  for (const [x, v] of [[220, 0.3], [300, 0.7]] as const) {
    p.ell(x, 1760, 26, 26, "#2e2a36", 6);
    p.stroke([[x, 1760], [x + 18 * Math.cos(rad(-90 + v * 180)), 1760 + 18 * Math.sin(rad(-90 + v * 180))]], 6, "#e8c45a");
  }
  p.poly([[14, 14], [1066, 14], [1066, 1906], [14, 1906]], null, 16);
};

// ---------------------------------------------------------------------------
// WIND STREAKS — soft white gust lines streaming past (mouth breathing).
// `t` 0..1 progress inside the shot; `dir` 1 = blows left, -1 = blows right.
// FIX 26 Nov 2026 (v3): streaks used to travel at constant speed and
// TELEPORT back on wrap (same bug class as the drops). Now they travel on
// a smoothstep curve (slow in/out) and fade in/out at the ends, so no
// streak ever pops in or out.
// ---------------------------------------------------------------------------
export const windCard = (p: Pen, t: number, dir = 1) => {
  for (let i = 0; i < 4; i++) {
    const y = 60 + i * 70;
    const ph = (t * 1.4 + i * 0.27) % 1;
    const tr = ph * ph * (3 - 2 * ph); // eased travel, slow in/out
    const fade = Math.min(smooth(0, 0.12, ph), 1 - smooth(0.85, 1, ph));
    const off = tr * 560 * dir;
    const x0 = dir > 0 ? 560 - off : off;
    p.stroke([[x0, y], [x0 - 150 * dir, y + 18], [x0 - 300 * dir, y + 6]], 10, rgba("#ffffff", 0.85 * fade));
    p.stroke([[x0 - 40 * dir, y + 40], [x0 - 160 * dir, y + 52]], 7, rgba("#ffffff", 0.6 * fade));
  }
};

// ---------------------------------------------------------------------------
// DRYING PUDDLE — flat blue ellipse on the ground (drawn on a flat Fx card).
// ---------------------------------------------------------------------------
export const puddleCard = (p: Pen) => {
  const pool = blobPts(128, 128, { a: 120, b: 70, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: 4 });
  p.shadedFill(pool, "#6fc3ef", "#3f8fc4", rad(-120), 120);
  p.stroke([[50, 110], [120, 96], [200, 108]], 6, "#bfe6fb");
};

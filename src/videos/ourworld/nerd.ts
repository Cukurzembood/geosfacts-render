// Our nerd bookworm stickman, drawn with the same toon.ts Canvas2D Pen API as
// the bridge skill's cast — but a NEW character implementation, not a reskin:
// big round white head, tiny dot eyes, big round glasses, mustard sweater vest
// over a white shirt, stick arms/legs, always carrying books. No red-white
// striped shirt, no pink blush, no big anime eyes (character-spec-nerd.md).
// Design space 600 x 1000 units, soles at y = 975 (same as the skill's cast,
// so the same Actor billboard geometry fits).
import { Pen, INK, mul, blobPts, thickAngle } from "../bridge/toon";

export const MUSTARD = "#d9a441";
export const SHIRT = "#f7f1e1";
export const PANTS = "#3b3f52";
export const SHOE = "#2e2a36";
export const MOUTH_DARK = "#5a1e28";
const BOOKS = ["#c0392b", "#2f6a43", "#3f6fb5"];
const rad = (d: number) => (d * Math.PI) / 180;

export type NerdExpr = "smile" | "grin" | "shock" | "think";
export type NerdMode = "stand" | "walk" | "talk";
export type NerdOpts = {
  phase?: number; mode?: NerdMode; expr?: NerdExpr; blink?: number;
  light?: number; book?: "stack" | "open" | "none"; gest?: number; tilt?: number; headTilt?: number;
};

const HEAD = { x: 300, y: 360, r: 120 };
const SOLE = 975;
const HIP_Y = 712;
const CHIN = 480;

/** book stack: 3 books, drawn at (cx, topY), widths shrink upward */
const bookStack = (p: Pen, cx: number, topY: number, w = 96) => {
  const hs = [22, 20, 18];
  let y = topY;
  for (let i = 0; i < 3; i++) {
    const bw = w - i * 8, bh = hs[i];
    p.poly([[cx - bw / 2, y], [cx + bw / 2, y], [cx + bw / 2, y + bh], [cx - bw / 2, y + bh]], BOOKS[i], 3);
    p.stroke([[cx - bw / 2 + 8, y + bh / 2], [cx + bw / 2 - 8, y + bh / 2]], 2, "#f7f1e1");
    y += bh + 2;
  }
};

/** open book held in front, centre spine at (cx, cy) */
const openBook = (p: Pen, cx: number, cy: number) => {
  p.poly([[cx - 52, cy - 18], [cx, cy - 4], [cx, cy + 34], [cx - 52, cy + 20]], "#ffffff", 3);
  p.poly([[cx + 52, cy - 18], [cx, cy - 4], [cx, cy + 34], [cx + 52, cy + 20]], "#ffffff", 3);
  p.stroke([[cx, cy - 4], [cx, cy + 34]], 3);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
    p.stroke([[cx + s * 42, cy - 8 + i * 10], [cx + s * 10, cy - 2 + i * 10]], 2, "#8a8a8a");
};

const faceFront = (p: Pen, expr: NerdExpr, blink: number) => {
  const { x, y } = HEAD;
  // dot eyes (or dashes when blinking)
  for (const s of [-1, 1]) {
    const ex = x + s * 42, ey = y - 10;
    if (blink > 0.5) p.stroke([[ex - 9, ey], [ex + 9, ey]], 6);
    else p.dot(ex, ey, 7);
  }
  // big round glasses: two lenses + bridge + temples
  for (const s of [-1, 1]) p.ell(x + s * 42, y - 10, 37, 37, null, 7);
  p.stroke([[x - 5, y - 10], [x + 5, y - 10]], 6);
  p.stroke([[x - 79, y - 14], [x - 104, y - 22]], 6);
  p.stroke([[x + 79, y - 14], [x + 104, y - 22]], 6);
  // mouth
  const mx = x, my = y + 58;
  if (expr === "smile") p.arc(mx, my - 6, 24, 14, 20, 160, 6);
  else if (expr === "grin") {
    p.ell(mx, my - 2, 22, 12, MOUTH_DARK, 3, 0, 180);
    p.ell(mx, my - 2, 22, 6, "#ffffff", 0, 0, 180);
  } else if (expr === "shock") p.ell(mx, my + 4, 10, 13, MOUTH_DARK, 3);
  else {
    p.stroke([[mx - 10, my], [mx + 10, my]], 5);
    p.stroke([[x + 30, y - 62], [x + 54, y - 68]], 5); // one raised brow
  }
};

/** front view: character faces the camera (walking toward it, standing, talking) */
export const nerdFront = (p: Pen, opts: NerdOpts = {}) => {
  const { phase = 0, mode = "stand", expr = "smile", blink = 0, light = rad(-120),
    book = "stack", gest = 0, tilt = 0, headTilt = 0 } = opts;
  const two = Math.PI * 2;
  const bob = mode === "walk" ? 14 * Math.cos(2 * two * phase) : mode === "talk" ? 4 * Math.sin(two * phase * 2) : 0;
  const thick = thickAngle(light);
  const ow = 10;
  // ---- legs (not rotated) ----
  p.rot = null;
  if (mode === "walk") {
    const L = 55;
    for (const [s, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + s * 16, fx = 300 + s * 20, fy = SOLE - 4 - up;
      p.line([[hx, HIP_Y], [(hx + fx) / 2 + s * 4, (HIP_Y + fy) / 2 - up * 0.08], [fx, fy]], PANTS, 11);
      p.ell(fx + s * 8, fy, 16, 8, SHOE, 3);
    }
  } else {
    for (const s of [-1, 1]) {
      const fx = 300 + s * 18;
      p.line([[300 + s * 16, HIP_Y], [fx, SOLE - 4]], PANTS, 11);
      p.ell(fx + s * 8, SOLE - 4, 16, 8, SHOE, 3);
    }
  }
  // ---- upper body: rotates about the hips ----
  const A = tilt + (mode === "walk" ? 1.6 * Math.sin(two * phase) : 0);
  p.rot = A ? [rad(A), 300, HIP_Y] : null;
  const tcx = 300, tcy = 600 - bob;
  const tp = blobPts(tcx, tcy, { a: 88, b: 122, nTop: 2.2, nBot: 2.6, egg: 0.12, asym: 0, rot: 0, noise: 0.006, seed: 7 });
  p.gradFill(tp, MUSTARD, mul(MUSTARD, [0.64, 0.66, 0.74]), light);
  p.clip(tp, () => {
    // white shirt V under the vest
    p.poly([[tcx - 34, CHIN + 6 - bob], [tcx + 34, CHIN + 6 - bob], [tcx, 585 - bob]], SHIRT, 0);
    p.stroke([[tcx - 34, CHIN + 6 - bob], [tcx, 585 - bob]], 3);
    p.stroke([[tcx + 34, CHIN + 6 - bob], [tcx, 585 - bob]], 3);
    for (const by of [620, 660]) { p.dot(tcx, by - bob, 4, INK); p.dot(tcx, by - bob, 2.5, "#e8c45a"); }
  });
  p.inkRing(tp, ow, thick);
  // arms (white shirt sleeves, ink rim)
  const shL: [number, number] = [tcx - 78, 512 - bob], shR: [number, number] = [tcx + 78, 512 - bob];
  if (mode === "talk" && book === "open") {
    // both hands hold the open book in front
    p.line([shL, [tcx - 108, 600 - bob], [tcx - 52, 668 - bob]], SHIRT, 10);
    p.line([shR, [tcx + 108, 600 - bob], [tcx + 52, 668 - bob]], SHIRT, 10);
    p.dot(tcx - 52, 668 - bob, 6); p.dot(tcx + 52, 668 - bob, 6);
    openBook(p, tcx, 648 - bob);
  } else {
    // left arm: bent, book stack tucked under it
    p.line([shL, [tcx - 104, 608 - bob], [tcx - 88, 690 - bob]], SHIRT, 10);
    p.dot(tcx - 88, 690 - bob, 6);
    if (book === "stack") bookStack(p, tcx - 118, 622 - bob);
    // right arm: hangs, or raised in a talk gesture
    const g = mode === "talk" ? gest : 0;
    const hx = 398 + 54 * g, hy = 705 - 185 * g - bob;
    p.line([shR, [404, 620 - bob], [hx, hy]], SHIRT, 10);
    p.dot(hx, hy, 6);
  }
  // ---- head: rotates about the chin, plus its own tilt ----
  const Ah = A + headTilt;
  p.rot = Ah ? [rad(Ah), 300, CHIN - bob] : null;
  const hp = blobPts(HEAD.x, HEAD.y - bob, { a: HEAD.r, b: HEAD.r, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0, seed: 1 });
  p.shadedFill(hp, "#ffffff", "#e6dfd2", light, HEAD.r);
  p.inkRing(hp, ow, thick);
  faceFront(p, expr, blink);
  p.rot = null;
};

/** side view, facing screen-right (mirror via the billboard for the other way) */
export const nerdSide = (p: Pen, opts: NerdOpts = {}) => {
  const { phase = 0, mode = "stand", expr = "smile", blink = 0, light = rad(-120), book = "stack" } = opts;
  const two = Math.PI * 2;
  const bob = mode === "walk" ? 12 * Math.cos(2 * two * phase) : 0;
  const thick = thickAngle(light);
  const ow = 10;
  const hx = 312, hy = 360 - bob;
  p.rot = null;
  // ---- legs: two segments, knee forward (+x) ----
  if (mode === "walk") {
    for (const [s, ph] of [[1, 0], [-1, 0.5]] as const) {
      const sw = 58 * Math.sin(two * (phase + ph));
      const up = 42 * Math.max(0, Math.cos(two * (phase + ph)));
      const hip: [number, number] = [296 + s * 4, HIP_Y];
      const knee: [number, number] = [296 + sw * 0.5 + 16, HIP_Y + 130];
      const foot: [number, number] = [296 + sw, SOLE - 4 - up];
      p.line([hip, knee, foot], PANTS, 11);
      p.ell(foot[0] + 8, foot[1], 16, 8, s > 0 ? SHOE : mul(SHOE, [0.8, 0.8, 0.8]), 3);
    }
  } else {
    for (const s of [-1, 1]) {
      const fx = 296 + s * 18;
      p.line([[296 + s * 6, HIP_Y], [fx, SOLE - 4]], PANTS, 11);
      p.ell(fx + 8, SOLE - 4, 16, 8, SHOE, 3);
    }
  }
  // ---- torso (narrower bean, shirt strip on the front edge) ----
  const tp = blobPts(296, 600 - bob, { a: 70, b: 122, nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06, rot: 0, noise: 0.006, seed: 7 });
  p.gradFill(tp, MUSTARD, mul(MUSTARD, [0.64, 0.66, 0.74]), light);
  p.clip(tp, () => {
    p.poly([[322, 490 - bob], [352, 505 - bob], [340, 582 - bob], [322, 576 - bob]], SHIRT, 0);
    p.dot(340, 620 - bob, 4, INK);
  });
  p.inkRing(tp, ow, thick);
  // ---- near arm swings with the walk; book stack held at the chest ----
  const sw = mode === "walk" ? 26 * Math.sin(two * phase) : 0;
  p.line([[330, 515 - bob], [338 + sw, 600 - bob], [344 + sw, 672 - bob]], SHIRT, 10);
  p.dot(344 + sw, 672 - bob, 6);
  if (book === "stack") bookStack(p, 386, 596 - bob, 84);
  // ---- head (profile) ----
  const hp = blobPts(hx, hy, { a: HEAD.r, b: HEAD.r, nTop: 2, nBot: 2, egg: 0, asym: 0.12, rot: 0, noise: 0, seed: 1 });
  p.shadedFill(hp, "#ffffff", "#e6dfd2", light, HEAD.r);
  p.inkRing(hp, ow, thick);
  // one dot eye + one glasses lens + temple, nose tick, mouth near the front edge
  if (blink > 0.5) p.stroke([[343, 350 - bob], [361, 350 - bob]], 6);
  else p.dot(352, 350 - bob, 7);
  p.ell(352, 350 - bob, 37, 37, null, 7);
  p.stroke([[388, 348 - bob], [428, 338 - bob]], 6);
  p.stroke([[428, 392 - bob], [438, 406 - bob], [424, 412 - bob]], 4);
  const mx = 398, my = 432 - bob;
  if (expr === "smile") p.arc(mx, my - 6, 18, 11, 20, 160, 5);
  else if (expr === "grin") { p.ell(mx, my - 2, 16, 9, MOUTH_DARK, 3, 0, 180); p.ell(mx, my - 2, 16, 4.5, "#ffffff", 0, 0, 180); }
  else if (expr === "shock") p.ell(mx, my + 4, 8, 10, MOUTH_DARK, 3);
  else p.stroke([[mx - 8, my], [mx + 8, my]], 4);
  p.rot = null;
};

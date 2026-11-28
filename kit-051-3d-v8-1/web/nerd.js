// Our nerd bookworm stickman, drawn with the kit's Pen API (./toon.js) —
// a JS port of the reference implementation in
// github-parallel/src/videos/ourworld/nerd.ts (same character, different
// engine). LOCKED design (approved Shanty 2026-11-25, character-spec-nerd.md):
// big round white head, tiny dot eyes, big round glasses, mustard sweater
// vest over a white shirt, stick arms/legs, always carrying books.
// NO red-white striped shirt, NO pink blush, NO big anime eyes.
// Design space 600 x 1000 units, soles at y = 975.
// Kit addition vs the reference: `mouth` (0..1) — VO-driven open amount
// (story.js bakes the whisper speech segments); when mouth > 0.12 the open
// mouth overrides the expression mouth, so the nerd talks with the VO.
import { INK, mul, blobPts, thickAngle } from './toon.js';

export const MUSTARD = "#d9a441";
export const SHIRT = "#f7f1e1";
export const PANTS = "#3b3f52";
export const SHOE = "#2e2a36";
export const MOUTH_DARK = "#5a1e28";
const BOOKS = ["#c0392b", "#2f6a43", "#3f6fb5"];
const rad = (d) => (d * Math.PI) / 180;

const HEAD = { x: 300, y: 360, r: 120 };
const SOLE = 975;
const HIP_Y = 712;
const CHIN = 480;

/** book stack: 3 books, drawn at (cx, topY), widths shrink upward */
const bookStack = (p, cx, topY, w = 96) => {
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
const openBook = (p, cx, cy) => {
  p.poly([[cx - 52, cy - 18], [cx, cy - 4], [cx, cy + 34], [cx - 52, cy + 20]], "#ffffff", 3);
  p.poly([[cx + 52, cy - 18], [cx, cy - 4], [cx, cy + 34], [cx + 52, cy + 20]], "#ffffff", 3);
  p.stroke([[cx, cy - 4], [cx, cy + 34]], 3);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
    p.stroke([[cx + s * 42, cy - 8 + i * 10], [cx + s * 10, cy - 2 + i * 10]], 2, "#8a8a8a");
};

const faceFront = (p, expr, blink, mouth = 0) => {
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
  // mouth: VO-driven open mouth wins; otherwise the expression mouth
  const mx = x, my = y + 58;
  if (mouth > 0.12) {
    p.ell(mx, my + 2, 20, 5 + 13 * mouth, MOUTH_DARK, 3);
  } else if (expr === "smile") p.arc(mx, my - 6, 24, 14, 20, 160, 6);
  else if (expr === "grin") {
    p.ell(mx, my - 2, 22, 12, MOUTH_DARK, 3, 0, 180);
    p.ell(mx, my - 2, 22, 6, "#ffffff", 0, 0, 180);
  } else if (expr === "shock") p.ell(mx, my + 4, 10, 13, MOUTH_DARK, 3);
  else {
    p.stroke([[mx - 10, my], [mx + 10, my]], 5);
    p.stroke([[x + 30, y - 62], [x + 54, y - 68]], 5); // one raised brow
  }
};

export const BLANKET_RED = "#e8483f";
export const BLANKET_DARK = "#b8282b";

/** lying-in-bed view (kit-051v2): head on a pillow at the left, body
 *  stretched horizontally right under a bold blanket, feet poking out.
 *  Design space 600x1000 like the other painters; the figure occupies
 *  canvas x 55..590, y ~705..920, so the card sits low (base at mattress
 *  top, s ~1.35). Face is front-on (lying on his back, camera looking
 *  down at him from the foot side). opts: expr ('sleep'|'shock'|'smile'|
 *  'grin'|'think'), blink, mouth (VO-driven open amount). */
export const nerdLie = (p, opts = {}) => {
  const { expr = 'sleep', blink = 0, light = rad(-120), mouth = 0 } = opts;
  const thick = thickAngle(light);
  const ow = 10;
  // blanket: bold coral mound over the body, low and flat — its top edge
  // tucks just under the chin (head bottom ~ canvas y 845). No drawn
  // pillow: the 3D pillow mesh behind the card is the pillow. No raised
  // arm: both arms are under the blanket.
  const bl = blobPts(420, 890, { a: 170, b: 45, nTop: 2.2, nBot: 2.6, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: 5 });
  p.gradFill(bl, BLANKET_RED, BLANKET_DARK, light);
  p.inkRing(bl, ow, thick);
  p.stroke([[300, 872], [540, 872]], 4, '#8a1f1a'); // blanket fold
  // feet poking out of the blanket's right end
  p.ell(572, 898, 15, 8, SHOE, 3);
  p.ell(576, 918, 15, 8, SHOE, 3);
  // head: big round white head, front-on, resting where the 3D pillow is
  const hx = 165, hy = 760, hr = 85;
  const hp = blobPts(hx, hy, { a: hr, b: hr, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0, seed: 1 });
  p.shadedFill(hp, '#ffffff', '#e6dfd2', light, hr);
  p.inkRing(hp, ow, thick);
  // face: dot eyes (closed dashes when asleep), big round glasses, mouth
  for (const s of [-1, 1]) {
    const ex = hx + s * 30, ey = hy - 15;
    if (expr === 'sleep' || blink > 0.5) p.stroke([[ex - 8, ey], [ex + 8, ey]], 5);
    else p.dot(ex, ey, 6);
  }
  for (const s of [-1, 1]) p.ell(hx + s * 30, hy - 15, 27, 27, null, 5);
  p.stroke([[hx - 4, hy - 15], [hx + 4, hy - 15]], 5);
  const mx = hx + 12, my = hy + 40;
  if (mouth > 0.12) {
    p.ell(mx, my + 2, 15, 4 + 10 * mouth, MOUTH_DARK, 3);
  } else if (expr === 'smile') p.arc(mx, my - 5, 18, 11, 20, 160, 5);
  else if (expr === 'grin') {
    p.ell(mx, my - 2, 17, 10, MOUTH_DARK, 3, 0, 180);
    p.ell(mx, my - 2, 17, 5, '#ffffff', 0, 0, 180);
  } else if (expr === 'shock') p.ell(mx, my + 3, 8, 11, MOUTH_DARK, 3);
  else if (expr === 'sleep') p.stroke([[mx - 8, my], [mx + 8, my]], 4);
  else p.stroke([[mx - 8, my], [mx + 8, my]], 4);
  p.rot = null;
};

/** front view: character faces the camera (walking toward it, standing, talking).
 *  opts: phase, mode ('stand'|'walk'|'talk'|'sit'), expr ('smile'|'grin'|'shock'|'think'),
 *  blink (0..1), light (rad), book ('stack'|'open'|'none'), gest (0..1 right-arm
 *  raise in talk mode), tilt, headTilt, breath (0..1 slow ~4s breath phase),
 *  mouth (0..1 VO-driven open amount).
 *  'sit' (kit-051v2): sitting up in bed — no legs; a bold blanket mound
 *  covers the lap (drawn after the arms, before the head). The card base
 *  sits at floor level so the torso rises from the mattress. */
export const nerdFront = (p, opts = {}) => {
  const { phase = 0, mode = "stand", expr = "smile", blink = 0, light = rad(-120),
    book = "stack", gest = 0, tilt = 0, headTilt = 0, breath = 0, mouth = 0 } = opts;
  const two = Math.PI * 2;
  // slow breath (chest rises ~3 units on a 4 s cycle) under the faster talk
  // bounce, so the torso never holds dead-still between gestures.
  const br = 3 * Math.sin(two * breath);
  const bob = mode === "walk" ? 14 * Math.cos(2 * two * phase) : mode === "talk" ? 4 * Math.sin(two * phase * 2) + br : br;
  const thick = thickAngle(light);
  const ow = 10;
  // ---- legs (not rotated). 'sit' has no legs — the blanket covers the lap. ----
  p.rot = null;
  if (mode === "walk") {
    const L = 55;
    for (const [s, ph] of [[-1, 0], [1, 0.5]]) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + s * 16, fx = 300 + s * 20, fy = SOLE - 4 - up;
      p.line([[hx, HIP_Y], [(hx + fx) / 2 + s * 4, (HIP_Y + fy) / 2 - up * 0.08], [fx, fy]], PANTS, 11);
      p.ell(fx + s * 8, fy, 16, 8, SHOE, 3);
    }
  } else if (mode !== "sit") {
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
  const shL = [tcx - 78, 512 - bob], shR = [tcx + 78, 512 - bob];
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
    // right arm: hangs, or raised in a talk gesture (talk and sit both wave)
    const g = (mode === "talk" || mode === "sit") ? gest : 0;
    const hx = 398 + 54 * g, hy = 705 - 185 * g - bob;
    p.line([shR, [404, 620 - bob], [hx, hy]], SHIRT, 10);
    p.dot(hx, hy, 6);
  }
  // ---- sit mode: bold blanket mound over the lap (covers hips/legs) ----
  if (mode === "sit") {
    const bl = blobPts(300, 850, { a: 200, b: 175, nTop: 2.2, nBot: 2.6, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: 9 });
    p.gradFill(bl, BLANKET_RED, BLANKET_DARK, light);
    p.inkRing(bl, ow, thick);
    p.stroke([[180, 700], [420, 700]], 4, "#8a1f1a"); // blanket fold
  }
  // ---- head: rotates about the chin, plus its own tilt ----
  const Ah = A + headTilt;
  p.rot = Ah ? [rad(Ah), 300, CHIN - bob] : null;
  const hp = blobPts(HEAD.x, HEAD.y - bob, { a: HEAD.r, b: HEAD.r, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0, seed: 1 });
  p.shadedFill(hp, "#ffffff", "#e6dfd2", light, HEAD.r);
  p.inkRing(hp, ow, thick);
  faceFront(p, expr, blink, mouth);
  p.rot = null;
};

/** side view, facing screen-right (mirror via the billboard for the other way).
 *  Same opts as nerdFront (mouth applies to the profile mouth too). */
export const nerdSide = (p, opts = {}) => {
  const { phase = 0, mode = "stand", expr = "smile", blink = 0, light = rad(-120), book = "stack", breath = 0, mouth = 0 } = opts;
  const two = Math.PI * 2;
  const br = 3 * Math.sin(two * breath);
  const bob = mode === "walk" ? 12 * Math.cos(2 * two * phase) : br;
  const thick = thickAngle(light);
  const ow = 10;
  const hx = 312, hy = 360 - bob;
  p.rot = null;
  // ---- legs: two segments, knee forward (+x) ----
  if (mode === "walk") {
    for (const [s, ph] of [[1, 0], [-1, 0.5]]) {
      const sw = 58 * Math.sin(two * (phase + ph));
      const up = 42 * Math.max(0, Math.cos(two * (phase + ph)));
      const hip = [296 + s * 4, HIP_Y];
      const knee = [296 + sw * 0.5 + 16, HIP_Y + 130];
      const foot = [296 + sw, SOLE - 4 - up];
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
  if (mouth > 0.12) p.ell(mx, my + 2, 15, 4 + 10 * mouth, MOUTH_DARK, 3);
  else if (expr === "smile") p.arc(mx, my - 6, 18, 11, 20, 160, 5);
  else if (expr === "grin") { p.ell(mx, my - 2, 16, 9, MOUTH_DARK, 3, 0, 180); p.ell(mx, my - 2, 16, 4.5, "#ffffff", 0, 0, 180); }
  else if (expr === "shock") p.ell(mx, my + 4, 8, 10, MOUTH_DARK, 3);
  else p.stroke([[mx - 8, my], [mx + 8, my]], 4);
  p.rot = null;
};

// ambient.ts — Pen-drawn ambient life for video 050 (v4 pass).
// Every helper draws on its own small Fx canvas (see cast050.ts for placement)
// and is driven by GLOBAL seconds (tSec = f / FPS), NOT shot progress, so a
// mote/leaf/bird keeps its own continuous life across a shot and never
// restarts at a cut — the cut itself is the only break, which is correct:
// hard cuts are the house style.
//
// RULES (from the v2/v3 fixes): nothing moves linearly and nothing pops.
// Every traveller fades in at its start and out at its end; every loop is
// a sine/smootherstep, never a raw wrap.
import type { Pen } from "../bridge/toon";
import { clamp01, rgba, smooth } from "./lib/motion";

const rad = (d: number) => (d * Math.PI) / 180;
const hash = (i: number, s = 0) => {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

// ---------------------------------------------------------------------------
// DUST MOTES — soft specks drifting in the spotlight beam. Canvas 640x360.
// Each mote drifts slowly sideways, bobs on a sine, and twinkles (alpha
// breathes). Slow on purpose: dust is the quietest layer, it should be
// felt, not noticed.
// ---------------------------------------------------------------------------
export const dustMotes = (p: Pen, tSec: number, seed = 3, count = 14, cw = 640, ch = 360) => {
  for (let i = 0; i < count; i++) {
    const bx = hash(i, seed) * cw;
    const by = 30 + hash(i, seed + 7) * (ch - 60);
    const speed = 6 + hash(i, seed + 13) * 10; // px per second
    const x = ((bx + tSec * speed) % (cw + 60)) - 30;
    const y = by + 9 * Math.sin(tSec * 0.7 + i * 1.7);
    const tw = 0.5 + 0.5 * Math.sin(tSec * 1.3 + i * 2.3);
    const r = 2.5 + hash(i, seed + 21) * 3.5;
    p.ell(x, y, r, r, rgba("#fff2c8", 0.10 + 0.22 * tw), 0);
  }
};

// ---------------------------------------------------------------------------
// LEAVES — 7 small leaves drifting across the frame on the wind, each with
// its own lane, speed, wobble and slow tumble. Canvas 640x300. Fade in over
// the first 10% of each crossing and out over the last 10% — no pop at the
// edge. v4 fix: first version drew 22 cm leaves (rx 11) with a heavy ink
// rim — they read as floating rings, and near the camera they loomed huge.
// Now 13 cm, thin rim, mostly green: small leaves, not cheerios.
// ---------------------------------------------------------------------------
export const leaves = (p: Pen, tSec: number, seed = 5) => {
  const cols = ["#7fae5a", "#a8c66a", "#8fb35e", "#7fae5a", "#a8c66a", "#d9a441", "#8fb35e"];
  for (let i = 0; i < 7; i++) {
    const lane = 40 + hash(i, seed) * 220;
    const speed = 0.045 + hash(i, seed + 3) * 0.03; // crossings per second
    const ph = ((tSec * speed + i * 0.23) % 1 + 1) % 1;
    const x = -30 + ph * 700;
    const y = lane + 26 * Math.sin(tSec * 1.1 + i * 2.1) + 18 * Math.sin(tSec * 0.5 + i);
    const fade = Math.min(smooth(0, 0.1, ph), 1 - smooth(0.9, 1, ph));
    if (fade <= 0.01) continue;
    const ang = 25 * Math.sin(tSec * 1.6 + i * 2.9);
    const col = cols[i % cols.length];
    p.rot = [rad(ang), x, y];
    p.ell(x, y, 7, 4, rgba(col, 0.9 * fade), 1);
    p.stroke([[x - 7, y], [x + 7, y]], 1.5, rgba("#5a7a3a", 0.7 * fade));
    p.rot = null;
  }
};

// ---------------------------------------------------------------------------
// BIRDS — 3 birds crossing the sky, wings flapping on a sine (fastest
// mid-flap, still at the extremes — same pendulum grammar as the swing).
// Canvas 640x240. One crossing per ~14 s, staggered, faded at the edges.
// ---------------------------------------------------------------------------
export const birds = (p: Pen, tSec: number, seed = 9) => {
  for (let i = 0; i < 3; i++) {
    const lane = 50 + hash(i, seed) * 130;
    const speed = 0.055 + hash(i, seed + 4) * 0.02;
    const ph = ((tSec * speed + i * 0.31) % 1 + 1) % 1;
    const x = -40 + ph * 720;
    const y = lane + 14 * Math.sin(tSec * 0.8 + i * 2.4);
    const fade = Math.min(smooth(0, 0.08, ph), 1 - smooth(0.92, 1, ph));
    if (fade <= 0.01) continue;
    const flap = 22 * Math.sin(tSec * 7 + i * 2.0);
    const w = 16;
    const col = rgba("#3d414c", 0.85 * fade);
    p.stroke([[x - w, y - flap * 0.4], [x, y], [x + w, y - flap * 0.4]], 4, col);
  }
};

// ---------------------------------------------------------------------------
// SPOTLIGHT GLOW — breathing pool of warm light on the stage floor.
// Canvas 256x256. Alpha breathes on the 4 s breath cycle: the light itself
// feels alive under the nerd. Drawn flat over the static pool mesh.
// ---------------------------------------------------------------------------
export const spotGlow = (p: Pen, tSec: number) => {
  const br = 0.5 + 0.5 * Math.sin((tSec / 4) * Math.PI * 2);
  const a = 0.10 + 0.08 * br;
  for (let i = 3; i >= 1; i--) {
    p.ell(128, 128, 52 * i, 52 * i, rgba("#ffe9b0", a * (1 - i * 0.22)), 0);
  }
};

// ---------------------------------------------------------------------------
// POND RIPPLES — flat rings expanding + fading on the pond surface.
// Canvas 256x256, drawn flat. Three rings staggered so there is always one
// mid-expansion; a ring never pops — it fades in from nothing and out to
// nothing. (v4 note: the pond is out of frame in 050's shots, so this is
// library stock for 051+, not wired into 050.)
// ---------------------------------------------------------------------------
export const pondRipples = (p: Pen, tSec: number, seed = 11) => {
  for (let i = 0; i < 3; i++) {
    const ph = ((tSec * 0.25 + i / 3) % 1 + 1) % 1;
    const k = ph * ph * (3 - 2 * ph); // eased expansion
    const rx = 12 + 100 * k, ry = 5 + 40 * k;
    const fade = Math.sin(Math.PI * clamp01(ph)); // 0 at both ends
    if (fade <= 0.02) continue;
    const pts: Array<[number, number]> = [];
    for (let j = 0; j <= 28; j++) {
      const a = (j / 28) * Math.PI * 2;
      pts.push([128 + Math.cos(a) * rx, 128 + Math.sin(a) * ry]);
    }
    p.stroke(pts, 4, rgba("#bfe6fb", 0.55 * fade));
  }
};

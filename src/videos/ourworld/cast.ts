// Cast for OurWorld: one character (the nerd) + his contact shadow.
// Reuses the bridge skill's Pool/Actor/Fx billboard machinery — the character
// drawing itself (nerd.ts) is ours.
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import type { Place, FxPlace, Stage } from "../bridge/cast";
import { Pen, fxContact } from "../bridge/toon";
import { nerdFront, nerdSide } from "./nerd";
import { FPS, charX, charZ, walkPhase, talkGest, talkExpr } from "./story";

export { Pool, Actor, Fx, SU };
export type { Place, FxPlace, Stage };

const q = (v: number, n = 120) => Math.round(v * n) / n;
/** eyelid 0 open .. 1 shut: a blink every ~1-2 s, 4 frames (half/shut/shut/half) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (f: number, seed: number) => {
  const h = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
  let s = Math.round(-60 * h(seed, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * h(seed * 31 + n, 13));
  }
  return 0;
};

/** ground contact blob under the nerd (soft multiply pool, like the bridge cast) */
const blob = (out: Stage, x: number, z: number, sc = 1) => {
  out.fx.push({ key: "blob|contact|#2e2f4a", cw: 128, ch: 128, draw: (p: Pen) => fxContact(p, "#2e2f4a"),
    x, y: 0.022, z, w: 0.62 * sc, h: 0.48 * sc, flat: true, rot: 0 });
};

export const stage = (id: number, f: number): Stage => {
  const out: Stage = { places: [], fx: [] };
  const t = f / FPS;
  const x = charX(f), z = charZ(f);
  const blink = lidAt(f, 7);
  if (id === 1) {
    // walking toward the camera from the library steps, books under his arm
    out.places.push({
      key: `nerd|F|walk|${q(walkPhase(f), 60)}|${blink}`,
      x, y: 0, z, mirror: false,
      draw: (p) => nerdFront(p, { phase: walkPhase(f), mode: "walk", expr: "smile", blink, book: "stack" }),
      size: [1080, 1800, 1.8],
    });
  } else if (id === 2) {
    // side tracking: he walks screen-left (camera looks -x, screen-right is -z),
    // so the right-facing side drawing is mirrored
    out.places.push({
      key: `nerd|S|walk|${q(walkPhase(f), 60)}|${blink}`,
      x, y: 0, z, mirror: true,
      draw: (p) => nerdSide(p, { phase: walkPhase(f), mode: "walk", expr: "smile", blink, book: "stack" }),
      size: [1080, 1800, 1.8],
    });
  } else {
    // close-up at the bench: talking with his open book, gesturing
    out.places.push({
      key: `nerd|F|talk|${q(talkGest(f), 30)}|${talkExpr(f)}|${blink}`,
      x, y: 0, z, mirror: false,
      draw: (p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: talkExpr(f), blink, book: "open", gest: talkGest(f), headTilt: 2 * Math.sin(t * 2.2) }),
      size: [1800, 3000, 3.0],
    });
  }
  blob(out, x, z);
  return out;
};

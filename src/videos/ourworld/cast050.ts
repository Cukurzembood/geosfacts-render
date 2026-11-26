// Staging for video 050: the nerd on the auditorium stage / campus path /
// bench, plus the two big set cards (mouth cutaway, brain control room) and
// the wind + drying-puddle Fx. Cards only exist in their own shots, so they
// never float in the background of other shots.
import { Pool, Actor, Fx, SU } from "../bridge/cast";
import type { Place, FxPlace, Stage } from "../bridge/cast";
import { Pen, fxContact } from "../bridge/toon";
import { nerdFront, nerdSide } from "./nerd";
import { mouthCard, brainCard, windCard, puddleCard } from "./sets050";
import { FPS, charPos, walkPhase, talkGest, talkExpr, shotAt, shotU, glide } from "./story050";

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

/**
 * Expression that only changes while the nerd blinks, so a smile<->grin
 * swap hides behind a 4-frame blink instead of popping mid-sentence.
 * (Fix 26 Nov 2026, v3: talkExpr swapped every 12 frames = a visible pop
 * 2.5x/second in the talk shots 14/16/17. The reference clip holds one
 * expression for seconds and only changes it on a blink.)
 * Freezes the expression at the latest blink frame at or before f.
 */
const exprBlinkMasked = (f: number, start: number, seed: number) => {
  for (let b = f; b >= start && b > f - 90; b--) {
    if (lidAt(b, seed) > 0) return talkExpr(b, start);
  }
  return talkExpr(start, start);
};

/** ground contact blob under the nerd (soft multiply pool, like the bridge cast) */
const blob = (out: Stage, x: number, z: number, sc = 1) => {
  out.fx.push({ key: "blob|contact|#2e2f4a", cw: 128, ch: 128, draw: (p: Pen) => fxContact(p, "#2e2f4a"),
    x, y: 0.022, z, w: 0.62 * sc, h: 0.48 * sc, flat: true, rot: 0 });
};
// contact blob on the stage platform (y = 0.35 top)
const blobStage = (out: Stage, x: number, z: number, sc = 1) => {
  out.fx.push({ key: "blob|contact|#2e2f4a", cw: 128, ch: 128, draw: (p: Pen) => fxContact(p, "#2e2f4a"),
    x, y: 0.372, z, w: 0.62 * sc, h: 0.48 * sc, flat: true, rot: 0 });
};

/** the cutaway cards hang here; they overfill the 9:16 frame from ~6.5 m */
const CARD_POS = { x: 0, y: 3.0, z: -14 };
const CARD_W = 3.4, CARD_H = 6.04;

export const stage050 = (id: number, f: number): Stage => {
  const out: Stage = { places: [], fx: [] };
  const t = f / FPS;
  const pos = charPos(f);
  const blink = lidAt(f, 7);
  // u = 0..1 progress inside THIS shot — the only progress value staging
  // uses, so retiming a beat (story050.ts BEATS) moves every animation
  // with it. Never hardcode a frame range here.
  const shot = shotAt(f);
  const u = shotU(f);
  const nerd = (draw: (p: Pen) => void, size: [number, number, number], mirror = false) => {
    out.places.push({ key: `nerd050|${id}|${q(walkPhase(f), 60)}|${blink}`, x: pos.x, y: pos.y, z: pos.z, mirror, draw, size });
  };

  if (id === 1) {
    // walks onto the stage from the wings, books under his arm
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "walk", expr: "smile", blink, book: "stack" }), [1080, 1800, 1.8]);
    blobStage(out, pos.x, pos.z);
  } else if (id === 2) {
    // at the podium: opens his mouth to speak — shock, mouth suddenly dry
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: "shock", blink, book: "none", gest: talkGest(f, shot.a), headTilt: 2 * Math.sin(t * 1.8) }), [1440, 2400, 2.4]);
    blobStage(out, pos.x, pos.z);
  } else if (id === 3 || id === 4) {
    // mouth cutaway: three taps pour watery blue spit
    // NOTE (fix 26 Nov 2026): the card texture is cached by key, so q(u, 12)
    // only redrew the card 12x/shot and the drops jumped ~9 frames at a
    // time — that was half the choppiness. q(u, 120) redraws ~every frame.
    out.fx.push({ key: `mouth|watery|${q(u, 120)}`, cw: 1080, ch: 1920, draw: (p) => mouthCard(p, "watery", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 5) {
    // brain room: the FIGHT OR FLIGHT switch flips to red — eased (v3: the
    // lever used to flip at constant linear speed; glide() accelerates it
    // into the flip and settles it, like the reference's switch moments)
    out.fx.push({ key: `brain|switch|${q(u, 12)}`, cw: 1080, ch: 1920, draw: (p) => brainCard(p, glide(u), "none", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 6) {
    // mouth cutaway: taps drip thick sticky goo (per-frame redraw, see id 3)
    out.fx.push({ key: `mouth|thick|${q(u, 120)}`, cw: 1080, ch: 1920, draw: (p) => mouthCard(p, "thick", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 7) {
    // at the podium, worried: hand to throat, thinking
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: "think", blink, book: "none", gest: talkGest(f, shot.a) * 0.6 }), [1440, 2400, 2.4]);
    blobStage(out, pos.x, pos.z);
  } else if (id === 8) {
    // close-up: tries to speak, tongue stuck — shock
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: "shock", blink, book: "none", gest: talkGest(f, shot.a) * 0.5 }), [1800, 3000, 3.0]);
    blobStage(out, pos.x, pos.z);
  } else if (id === 9) {
    // mouth cutaway: tongue glued to the roof, goo strands
    out.fx.push({ key: `mouth|glued|${q(u, 12)}`, cw: 1080, ch: 1920, draw: (p) => mouthCard(p, "glued", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 10) {
    // side tracking on the campus path: fast shallow mouth breathing
    nerd((p) => nerdSide(p, { phase: walkPhase(f), mode: "walk", expr: "smile", blink, book: "stack" }), [1080, 1800, 1.8], true);
    blob(out, pos.x, pos.z);
    // wind gusts streaming past him + a puddle shrinking on the path
    // (v3: wind redrawn per frame + eased/faded in sets050, and moved
    // BEHIND the nerd — streaks used to cross his face, §9 nit #1)
    out.fx.push({ key: `wind|${q(u, 120)}`, cw: 560, ch: 280, draw: (p) => windCard(p, u, 1),
      x: pos.x + 0.4, y: 0.9, z: pos.z - 0.8, w: 2.4, h: 1.2, soft: true });
    const pw = 2.4 - 1.2 * glide(u); // eased shrink (v3: was linear)
    out.fx.push({ key: `puddle|${q(u, 60)}`, cw: 256, ch: 256, draw: (p) => puddleCard(p),
      x: 2.8, y: 0.03, z: -5, w: pw, h: pw * 0.6, flat: true, rot: 0 });
  } else if (id === 11) {
    // at the podium, breathing fast and shallow; wind gusts across the stage
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: "think", blink, book: "none", gest: talkGest(f, shot.a) * 0.5 }), [1440, 2400, 2.4]);
    blobStage(out, pos.x, pos.z);
    out.fx.push({ key: `wind|${q(u, 120)}`, cw: 560, ch: 280, draw: (p) => windCard(p, u, -1),
      x: pos.x + 0.6, y: 1.1, z: pos.z - 0.8, w: 2.6, h: 1.3, soft: true });
  } else if (id === 12) {
    // brain room: interview screen vs bear screen
    out.fx.push({ key: `brain|screens|${q(u, 12)}`, cw: 1080, ch: 1920, draw: (p) => brainCard(p, 1, "none", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 13) {
    // brain room: the bear screen wins
    out.fx.push({ key: `brain|bear|${q(u, 12)}`, cw: 1080, ch: 1920, draw: (p) => brainCard(p, 1, "bear", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else if (id === 14) {
    // at the podium, relieved smile — the brain means well
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: exprBlinkMasked(f, shot.a, 7), blink, book: "none", gest: talkGest(f, shot.a), headTilt: 2 * Math.sin(t * 2.2) }), [1440, 2400, 2.4]);
    blobStage(out, pos.x, pos.z);
  } else if (id === 15) {
    // mouth cutaway: taps flow watery blue again (per-frame redraw, see id 3)
    out.fx.push({ key: `mouth|watery2|${q(u, 120)}`, cw: 1080, ch: 1920, draw: (p) => mouthCard(p, "watery", u),
      x: CARD_POS.x, y: CARD_POS.y, z: CARD_POS.z, w: CARD_W, h: CARD_H });
  } else {
    // bench close-up: talking to camera with his open book (CTA)
    nerd((p) => nerdFront(p, { phase: walkPhase(f), mode: "talk", expr: exprBlinkMasked(f, shot.a, 7), blink, book: "open", gest: talkGest(f, shot.a), headTilt: 2 * Math.sin(t * 2.2) }), [1800, 3000, 3.0]);
    blob(out, pos.x, pos.z);
  }
  return out;
};

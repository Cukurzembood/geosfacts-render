// Shot plan for the kit-051v2 TEST video — GeosFact's 051
// "Why Does Your Nose Get Stuffy When You Lie Down?" rendered with the
// cartoon-kit on GitHub, using the EXISTING VO on disk (voiceover.mp3,
// 59.21 s at 0.9x). A/B test vs the Claude version on YouTube
// (https://youtube.com/shorts/M9xPB_6eVuA) — same script, same VO, so
// Shanty can compare motion + narration + lip-sync directly.
//
// v2 = EXPLAINER, not cinematic (Shanty 27 Nov 18:45 WIB): BOLD colors,
// BRIGHT light. The v1 bedroom was dark indigo night and murky in wide
// shots; v2 is a bright daytime bedroom (aqua-teal walls, coral blanket,
// sunny yellow rug, daylight + sun through the window). Mechanism boards
// are BIGGER (s 1.0, near full-bleed like Claude's) and the nerd finally
// LIES IN BED for the hook (new nerdLie painter) and SITS UP for the
// payoff (new 'sit' mode in nerdFront).
//
// TEST ONLY. No upload anywhere. No Gemini TTS (0 requests — quota is
// reserved for the 19:03 pipeline-prep run for 052-056).
//
// 7 shots, one per script sentence, cut at the Whisper sentence starts:
// 1 hook 0.00-7.2s | 2 turbinates 7.2-15.2s | 3 stand up 15.2-23.2s |
// 4 lie flat 23.2-31.4s | 5 nasal cycle 31.4-38.5s | 6 roll over 38.5-46.7s |
// 7 payoff + CTA 46.7-59.2s. TOTAL 1777 frames (59.23 s at 30 fps).
//
// World: 'bedroom' (worlds.js) — now bright bold DAY. Nerd in EVERY shot
// (nerd.js, LOCKED design), no subtitles, no music (VO only), hard cuts,
// one distinct camera per shot. Lip-sync: mouth opens from the Whisper
// speech spans baked below (SPEECH), same approach as 049 v2 / kit-051 v1.
import { nerdFront, nerdLie } from './nerd.js';
import { noseSection, gravityBoard, nostrilSeesaw, lampGlow } from './cutaways.js';
import { camFromKeys, blinkAt, walk, q } from './motion.js';

export const FPS = 30, TOTAL = 1777, DECK = 6;
export const WORLD = 'bedroom';
export const SHOTS = [
  { id: 'hook', a: 0, b: 215, light: 'day' },        // lying in bed, head hits pillow, nose clogs
  { id: 'turbinates', a: 216, b: 456, light: 'day' }, // nose-section board, near full-bleed
  { id: 'standup', a: 457, b: 696, light: 'day' },    // gravity board: arrows down, sponges slim
  { id: 'lieflat', a: 697, b: 940, light: 'day' },    // nose board: sponge swells, airway narrows
  { id: 'cycle', a: 941, b: 1155, light: 'day' },      // seesaw board: nostrils take turns
  { id: 'rollover', a: 1156, b: 1401, light: 'day' },  // lying in bed, rolls over, blockage follows
  { id: 'payoff', a: 1402, b: 1776, light: 'dayWarm' },// sits up in bed, breathes free, wave
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- lights: BRIGHT bold day (v2) — strong even light, saturated,
// no more indigo night. Payoff slightly warmer. ----------
export const LIGHTS = {
  day: { az: 250, el: 45, sky: '#fff6d8', ground: '#e8c890', hemi: 1.4, sun: '#fff2c8', sunI: 3.0, fog: '#ffeec2', fogNear: 40, fogFar: 400,
    skyTop: '#6ec1f0', skyHor: '#d8f0fc', sat: 1.35, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#fff6d8', vig: 0.10, shadowExt: 12,
    sunDisc: '#fffbe0', sunSize: 0.03 },
  dayWarm: { az: 250, el: 38, sky: '#fff2c8', ground: '#e8c890', hemi: 1.4, sun: '#ffd9a0', sunI: 3.0, fog: '#ffeec2', fogNear: 40, fogFar: 400,
    skyTop: '#6ec1f0', skyHor: '#ffe9b8', sat: 1.35, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffe2a8', vig: 0.10, shadowExt: 12,
    sunDisc: '#fffbe0', sunSize: 0.03 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot.
// Room: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Boards (s 1.0) stand at x -22.3, z 0.9; nerd (s 0.8) at x -24.5, z -0.3.
// Lying nerd on the bed: card base DECK+0.55, centre ~(-24.3, -3.2). ----------
const CAMS = {
  hook: [ // medium on the bed: he lies asleep, then the nose clogs at f=120
    { f: 0, pos: [-19.8, 8.1, 0.8], look: [-24.4, 7.0, -3.0], fov: 44 },
    { f: 120, pos: [-20.8, 7.8, 0.2], look: [-24.6, 7.0, -3.1], fov: 40 },
    { f: 215, pos: [-21.2, 7.7, 0.0], look: [-24.6, 7.0, -3.1], fov: 38 },
  ],
  turbinates: [ // board hero: nose-section fills the frame, nerd at the left edge
    { f: 216, pos: [-19.7, 7.5, 3.6], look: [-23.1, 7.15, 0.3], fov: 44 },
    { f: 456, pos: [-20.0, 7.45, 3.4], look: [-23.1, 7.15, 0.3], fov: 43 },
  ],
  standup: [ // board hero: gravity board, nerd standing tall at the left edge
    { f: 457, pos: [-19.7, 7.5, 3.6], look: [-23.1, 7.15, 0.3], fov: 44 },
    { f: 696, pos: [-20.0, 7.45, 3.4], look: [-23.1, 7.15, 0.3], fov: 43 },
  ],
  lieflat: [ // closer on the nose board as the sponge swells
    { f: 697, pos: [-20.2, 7.5, 3.3], look: [-22.4, 7.25, 0.8], fov: 42 },
    { f: 940, pos: [-20.5, 7.45, 3.1], look: [-22.4, 7.25, 0.8], fov: 41 },
  ],
  cycle: [ // board hero: seesaw board, nerd grinning at the left edge
    { f: 941, pos: [-19.7, 7.5, 3.6], look: [-23.1, 7.15, 0.3], fov: 44 },
    { f: 1155, pos: [-20.0, 7.45, 3.4], look: [-23.1, 7.15, 0.3], fov: 43 },
  ],
  rollover: [ // along the bed: he lies there, rolls over halfway, blockage follows
    { f: 1156, pos: [-20.2, 8.2, 1.4], look: [-24.2, 7.2, -2.8], fov: 44 },
    { f: 1401, pos: [-21.0, 8.1, 0.8], look: [-24.2, 7.2, -2.8], fov: 42 },
  ],
  payoff: [ // tighter on the bed: he sits up, breathes free, waves at the CTA
    { f: 1402, pos: [-21.2, 7.4, 0.8], look: [-24.0, 6.95, -3.0], fov: 38 },
    { f: 1776, pos: [-20.6, 7.6, 1.2], look: [-24.0, 6.95, -3.0], fov: 40 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f);
  // head-hits-pillow thud at f=120: small camera kick (0.5 threw the
  // subject out of frame on the closer v2 hook camera — kept gentle)
  const kicks = S.id === 'hook' ? [{ f: 120, a: 0.2 }] : [];
  const c = camFromKeys(CAMS[S.id], f, { kicks });
  c.flash = 0;
  return c;
};

// ---------- lens: DOF OFF (cinf 0) — same call as 049 v2 / eerie / kit-051 v1 ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const C = camAt(f);
  return { focus: dist(C.pos, [-23.0, 7.0, 0]), cinf: 0 };
};

// ---------- world state: bedroom is static; all change is cards ----------
export const worldAt = (f) => ({ collapse: 0, banner: 'gone', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- VO timing: Whisper 'small' speech spans [start, end] seconds
// (same VO as v1, kit-051-work/whisper-segments.json, 7 spans = 7 sentences).
// The nerd's mouth opens only while speech is happening. ----------
const SPEECH = [[0.0, 6.1], [7.2, 14.58], [15.22, 22.4], [23.24, 30.64], [31.38, 37.74], [38.54, 45.8], [46.72, 59.02]];
const mouthAt = (f) => {
  const t = f / 30;
  const speaking = SPEECH.some(([s, e]) => t >= s - 0.05 && t <= e + 0.08);
  if (!speaking) return 0;
  return q(0.35 + 0.65 * Math.abs(Math.sin(t * 21)), 2);
};

// ---------- actors: the nerd in EVERY shot ----------
const breathAt = (f) => (f / 120) % 1; // slow ~4 s breath cycle
const N = (o, pos, extra = {}) => ({
  key: 'nerd' + JSON.stringify(o), draw: (p) => nerdFront(p, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});
// lying nerd: card base just above the mattress (DECK+0.38) so the head
// rests on the 3D pillow, s 1.6 so the figure fills half the bed,
// no floor blob shadow. Head lands at x ~-25.4 (over the pillow).
const LIE = (o, pos, extra = {}) => ({
  key: 'nerdLie' + JSON.stringify(o), draw: (p) => nerdLie(p, o),
  x: pos[0], y: pos[1], z: pos[2], blob: false, ...extra,
});
const B = (key, draw, pos, s = 0.7, extra = {}) => ({
  key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, order: 3, ...extra,
});

// Boards stand on the floor facing +z (toward the front-wall cameras).
// flatYaw cancels the billboard rotation so the card faces the camera
// square-on instead of swinging its edges (same lesson as eerie windows).
const flatYaw = (f, x, z) => {
  const C = camAt(f);
  return -Math.atan2(C.pos[0] - x, C.pos[2] - z);
};

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = '#ffffff'; // bright day: no cool tint on the nerd
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  const front = (o, pos = [-23.0, DECK, 0.5], extra = {}) => out.push(N({ ...base, ...o }, pos, { tint, ...extra }));
  const lie = (o, pos = [-24.9, DECK + 0.38, -3.2], extra = {}) => out.push(LIE({ ...base, ...o }, pos, { tint, s: 1.6, ...extra }));
  // diagram shots: nerd smaller at the left edge (s 0.8), board is the hero (s 1.0)
  const BOARD_POS = [-22.3, DECK, 0.9];
  const NERD_SIDE = [-24.5, DECK, -0.3];
  switch (S.id) {
    case 'hook': {
      // LYING IN BED: asleep (eyes closed) until f=120, then his head hits
      // the pillow, the nose clogs — shock face, mouth talks with the VO.
      const expr = f < 120 ? 'sleep' : 'shock';
      lie({ expr, book: 'none' });
      break;
    }
    case 'turbinates': {
      // explains with the open book; the nose-section board is the hero
      // (slim sponges here — this is the anatomy intro)
      front({ mode: 'talk', expr: 'smile', book: 'open', gest: 0.4 }, NERD_SIDE, { s: 0.8 });
      out.push(B('nose0.15', (p) => noseSection(p, 0.15, 1), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'standup': {
      // standing tall, gravity arrows point DOWN, sponges stay slim
      front({ mode: 'talk', expr: 'smile', book: 'stack', gest: 0.5 }, NERD_SIDE, { s: 0.8 });
      out.push(B('gravdown', (p) => gravityBoard(p, true), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'lieflat': {
      // the sponge swells across the shot: fill 0.15 -> 1, airway narrows
      const fill = q(0.15 + 0.85 * ((f - 697) / (940 - 697)), 2);
      const flow = q(1 - 0.8 * ((f - 697) / (940 - 697)), 2);
      front({ mode: 'talk', expr: 'shock', book: 'stack', gest: 0.3, headTilt: 4 }, NERD_SIDE, { s: 0.8 });
      out.push(B('nose' + fill, (p) => noseSection(p, fill, flow), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'cycle': {
      // seesaw: left nostril clogged first, swaps to the right halfway
      const side = f < 1048 ? 0 : 1;
      front({ mode: 'talk', expr: 'grin', book: 'stack', gest: 0.5 }, NERD_SIDE, { s: 0.8 });
      out.push(B('seesaw' + side, (p) => nostrilSeesaw(p, side), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'rollover': {
      // LYING IN BED: he rolls over across the shot — a small slide along
      // the bed (head stays over the pillow) + the blocked side follows
      // him, the mini seesaw swaps with him at f=1280. NO card flip: the
      // flip mirrored the head to the far end of the bed and it floated
      // in mid-air (smoke round 2, f1300).
      const swapSide = f < 1280 ? 0 : 1;
      const slide = 0.25 * ((f - 1156) / (1401 - 1156));
      lie({ expr: f < 1280 ? 'think' : 'shock', book: 'none' }, [-24.9 + slide, DECK + 0.38, -3.2]);
      // mini seesaw at the foot of the bed, fully in frame (v2 fix: it was
      // half out of frame at the bottom-right corner)
      out.push(B('minisee' + swapSide, (p) => nostrilSeesaw(p, swapSide), [-22.8, DECK, -1.8], 0.5, { yaw: flatYaw(f, -22.8, -1.8) }));
      break;
    }
    case 'payoff': {
      // SITS UP IN BED: relieved grin, wave at the CTA. Card base at the
      // floor so the torso rises from the mattress, blanket over the lap.
      front({ mode: 'sit', expr: 'grin', book: 'none', gest: q(0.6 + 0.4 * Math.sin(f * 0.5), 1) }, [-23.8, DECK, -3.0]);
      break;
    }
  }
  return out;
};

// ---------- 2D effects: bedside lamp glow (faint in daylight) ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const LAMP = [-19.3, 7.7, -3.9];
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  // daylight: the lamp glow is faint, just a warm accent
  out.push(FX('lamp0.35', (p) => lampGlow(p, 0.35), LAMP, 0.9));
  return out;
};

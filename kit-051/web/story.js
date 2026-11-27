// Shot plan for the kit-051 TEST video — GeosFact's 051
// "Why Does Your Nose Get Stuffy When You Lie Down?" rendered with the
// cartoon-kit on GitHub, using the EXISTING VO on disk (voiceover.mp3,
// 59.21 s at 0.9x). A/B test vs the Claude version on YouTube
// (https://youtube.com/shorts/M9xPB_6eVuA) — same script, same VO, so
// Shanty can compare motion + narration + lip-sync directly.
//
// TEST ONLY. No upload anywhere. No Gemini TTS (0 requests — quota is
// reserved for the 19:03 pipeline-prep run for 052-056).
//
// 7 shots, one per script sentence, cut at the Whisper sentence starts:
// 1 hook 0.00-7.2s | 2 turbinates 7.2-15.2s | 3 stand up 15.2-23.2s |
// 4 lie flat 23.2-31.4s | 5 nasal cycle 31.4-38.5s | 6 roll over 38.5-46.7s |
// 7 payoff + CTA 46.7-59.2s. TOTAL 1777 frames (59.23 s at 30 fps).
//
// World: NEW 'bedroom' (worlds.js) — deep indigo night + warm lamplight
// amber + dusty rose blanket, per the video-051 visual direction.
// Nerd in EVERY shot (nerd.js, LOCKED design), no subtitles, no music
// (VO only), hard cuts, one distinct camera per shot.
// Lip-sync: mouth opens from the Whisper speech spans baked below
// (SPEECH), same approach as 049 v2.
import { nerdFront, nerdSide } from './nerd.js';
import { noseSection, gravityBoard, nostrilSeesaw, lampGlow } from './cutaways.js';
import { camFromKeys, blinkAt, walk, q } from './motion.js';

export const FPS = 30, TOTAL = 1777, DECK = 6;
export const WORLD = 'bedroom';
export const SHOTS = [
  { id: 'hook', a: 0, b: 215, light: 'night' },        // bedroom wide, he leans to the pillow, nose clogs
  { id: 'turbinates', a: 216, b: 456, light: 'night' }, // nose-section board: spongy turbinates
  { id: 'standup', a: 457, b: 696, light: 'night' },    // gravity board: arrows down, sponges slim
  { id: 'lieflat', a: 697, b: 940, light: 'nightDim' }, // nose board: sponge swells, airway narrows
  { id: 'cycle', a: 941, b: 1155, light: 'night' },      // seesaw board: nostrils take turns
  { id: 'rollover', a: 1156, b: 1401, light: 'night' },  // side view: he rolls over, blockage follows
  { id: 'payoff', a: 1402, b: 1776, light: 'nightWarm' },// wide pull-back: sits up, breathes free, wave
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- lights: indigo moonlight, dim (lie flat), warm lamp (payoff) ----------
export const LIGHTS = {
  night: { az: 250, el: 40, sky: '#141a2e', ground: '#1a1c2e', hemi: 0.7, sun: '#9db8e8', sunI: 1.5, fog: '#141a2e', fogNear: 30, fogFar: 260,
    skyTop: '#0a0e1e', skyHor: '#1c2440', sat: 0.95, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#dfe9ff', vig: 0.3, shadowExt: 12,
    sunDisc: '#eef2fb', sunSize: 0.02 },
  nightDim: { az: 250, el: 40, sky: '#0e1222', ground: '#12141f', hemi: 0.4, sun: '#7d97c4', sunI: 0.7, fog: '#0e1222', fogNear: 22, fogFar: 190,
    skyTop: '#070a16', skyHor: '#141a30', sat: 0.92, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#dfe9ff', vig: 0.36, shadowExt: 12,
    sunDisc: '#dfe6f5', sunSize: 0.02 },
  nightWarm: { az: 250, el: 40, sky: '#171a2c', ground: '#1d1a24', hemi: 0.7, sun: '#ffc890', sunI: 1.5, fog: '#181426', fogNear: 30, fogFar: 260,
    skyTop: '#0c0a18', skyHor: '#241c2e', sat: 0.98, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffe2a8', vig: 0.28, shadowExt: 12,
    sunDisc: '#ffe9c4', sunSize: 0.018 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot.
// Room: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Nerd SOL (-23.0, DECK, 0.5). Boards stand at z ~0.9, x ~-22. ----------
const CAMS = {
  hook: [ // wide bedroom, then push-in close as his head reaches the pillow
    { f: 0, pos: [-18.2, 8.8, 4.0], look: [-24.6, 6.8, -2.2], fov: 48 },
    { f: 120, pos: [-20.6, 8.0, 2.6], look: [-24.9, 7.0, -2.6], fov: 42 },
    { f: 215, pos: [-21.4, 7.7, 2.0], look: [-25.0, 7.0, -2.8], fov: 38 },
  ],
  turbinates: [ // medium two-shot: nerd + nose-section board
    { f: 216, pos: [-19.4, 7.7, 3.6], look: [-22.9, 7.2, 0.3], fov: 44 },
    { f: 456, pos: [-19.8, 7.65, 3.4], look: [-22.9, 7.2, 0.3], fov: 43 },
  ],
  standup: [ // medium-wide: nerd standing tall + gravity board
    { f: 457, pos: [-18.4, 8.2, 4.0], look: [-22.9, 7.0, 0.0], fov: 47 },
    { f: 696, pos: [-18.8, 8.15, 3.8], look: [-22.9, 7.0, 0.0], fov: 46 },
  ],
  lieflat: [ // close on the nose board as the sponge swells
    { f: 697, pos: [-20.4, 7.7, 3.3], look: [-22.5, 7.3, 0.5], fov: 43 },
    { f: 940, pos: [-20.8, 7.65, 3.1], look: [-22.5, 7.3, 0.5], fov: 42 },
  ],
  cycle: [ // medium two-shot: nerd + seesaw board
    { f: 941, pos: [-19.4, 7.7, 3.6], look: [-22.9, 7.2, 0.3], fov: 44 },
    { f: 1155, pos: [-19.8, 7.65, 3.4], look: [-22.9, 7.2, 0.3], fov: 43 },
  ],
  rollover: [ // side tracking shot: he rolls over across the bed front
    { f: 1156, pos: [-24.6, 8.2, 4.3], look: [-24.6, 6.9, 0.2], fov: 50 },
    { f: 1401, pos: [-22.2, 8.2, 4.3], look: [-22.2, 6.9, 0.2], fov: 50 },
  ],
  payoff: [ // wide pull-back + slight crane-up; he sits up, breathes free, waves
    { f: 1402, pos: [-18.8, 8.0, 4.0], look: [-22.6, 7.0, -0.2], fov: 44 },
    { f: 1776, pos: [-18.0, 8.6, 4.2], look: [-22.6, 7.0, -0.3], fov: 46 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f);
  // head-hits-pillow thud at f=120: one-frame camera kick
  const kicks = S.id === 'hook' ? [{ f: 120, a: 0.5 }] : [];
  const c = camFromKeys(CAMS[S.id], f, { kicks });
  c.flash = 0;
  return c;
};

// ---------- lens: DOF OFF (cinf 0) — same call as 049 v2 / eerie (swiftshader speed) ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const C = camAt(f);
  return { focus: dist(C.pos, [-23.0, 7.0, 0]), cinf: 0 };
};

// ---------- world state: bedroom is static; all change is cards ----------
export const worldAt = (f) => ({ collapse: 0, banner: 'gone', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- VO timing: Whisper 'small' speech spans [start, end] seconds
// (kit-051-work/whisper-segments.json, 7 spans = 7 sentences).
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
const NS = (o, pos, extra = {}) => ({
  key: 'nerdSide' + JSON.stringify(o), draw: (p) => nerdSide(p, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
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
  const tint = S.light === 'nightWarm' ? '#ffe2c8' : '#cdd8ea';
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  const front = (o, pos = [-23.0, DECK, 0.5], extra = {}) => out.push(N({ ...base, ...o }, pos, { tint, ...extra }));
  const side = (o, pos, extra = {}) => out.push(NS({ ...base, ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': {
      // bedtime: no books (they are on the nightstand). He stands by the
      // bed, leans toward the pillow (headTilt grows to f=120), then his
      // nose clogs on contact — shock face for the rest of the shot.
      const lean = f < 120 ? q((f / 120) * 10, 1) : 10;
      const expr = f < 120 ? 'think' : 'shock';
      front({ mode: 'talk', expr, book: 'none', headTilt: lean }, [-24.6, DECK, -2.0]);
      break;
    }
    case 'turbinates': {
      // explains with the open book; the nose-section board carries the
      // turbinate sponges (slim here — this is the anatomy intro)
      front({ mode: 'talk', expr: 'smile', book: 'open', gest: 0.4 }, [-24.2, DECK, -0.3]);
      out.push(B('nose0.15', (p) => noseSection(p, 0.15, 1), [-21.7, DECK, 0.9], 0.55, { yaw: flatYaw(f, -21.7, 0.9) }));
      break;
    }
    case 'standup': {
      // standing tall, gravity arrows point DOWN, sponges stay slim
      front({ mode: 'talk', expr: 'smile', book: 'stack', gest: 0.5 }, [-24.2, DECK, -0.3]);
      out.push(B('gravdown', (p) => gravityBoard(p, true), [-21.7, DECK, 0.9], 0.55, { yaw: flatYaw(f, -21.7, 0.9) }));
      break;
    }
    case 'lieflat': {
      // the sponge swells across the shot: fill 0.15 -> 1, airway narrows
      const fill = q(0.15 + 0.85 * ((f - 697) / (940 - 697)), 2);
      const flow = q(1 - 0.8 * ((f - 697) / (940 - 697)), 2);
      front({ mode: 'talk', expr: 'shock', book: 'stack', gest: 0.3, headTilt: 4 }, [-24.2, DECK, -0.3]);
      out.push(B('nose' + fill, (p) => noseSection(p, fill, flow), [-21.7, DECK, 0.9], 0.55, { yaw: flatYaw(f, -21.7, 0.9) }));
      break;
    }
    case 'cycle': {
      // seesaw: left nostril clogged first, swaps to the right halfway
      const side = f < 1048 ? 0 : 1;
      front({ mode: 'talk', expr: 'grin', book: 'stack', gest: 0.5 }, [-24.2, DECK, -0.3]);
      out.push(B('seesaw' + side, (p) => nostrilSeesaw(p, side), [-21.7, DECK, 0.9], 0.55, { yaw: flatYaw(f, -21.7, 0.9) }));
      break;
    }
    case 'rollover': {
      // side view: he rolls over across the front of the bed (slow walk,
      // 0.35 m/s). At the midpoint he stops, turns his head, and the
      // blocked side follows him — the mini seesaw swaps with him.
      const t = (f - 1156) / 30, dist = Math.min(t * 0.35, 2.6);
      const phase = q((t * 0.35 / 1.6) % 1, 2);
      const swapSide = f < 1280 ? 0 : 1;
      side({ mode: 'walk', phase, expr: f < 1280 ? 'think' : 'shock', book: 'none' }, [-24.8 + dist, DECK, 0.8]);
      // mini seesaw behind his path (z 0.0, so he walks past it, never behind it)
      out.push(B('minisee' + swapSide, (p) => nostrilSeesaw(p, swapSide), [-22.9, DECK, 0.0], 0.35, { yaw: flatYaw(f, -22.9, 0.0) }));
      break;
    }
    case 'payoff': {
      // sits up, breathes free: relieved grin, wave at the CTA
      front({ mode: 'talk', expr: 'grin', book: 'none', gest: q(0.6 + 0.4 * Math.sin(f * 0.5), 1) }, [-22.6, DECK, 0.8]);
      break;
    }
  }
  return out;
};

// ---------- 2D effects: warm lamp glow on the nightstand ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const LAMP = [-19.3, 7.7, -3.9];
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  // the bedside lamp glows in every shot (dimmer in the lie-flat shot)
  const a = S.id === 'lieflat' ? 0.5 : S.id === 'payoff' ? 1 : 0.8;
  out.push(FX('lamp' + a, (p) => lampGlow(p, a), LAMP, 0.9));
  return out;
};

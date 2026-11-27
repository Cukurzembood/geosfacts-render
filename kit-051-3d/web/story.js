// Shot plan for the kit-051-3d TEST video — GeosFact's 051
// "Why Does Your Nose Get Stuffy When You Lie Down?" rendered with the
// cartoon-kit on GitHub, using the EXISTING VO on disk (voiceover.mp3,
// 59.21 s at 0.9x). A/B test vs the Claude version on YouTube
// (https://youtube.com/shorts/M9xPB_6eVuA) — same script, same VO.
//
// 3D SEMI-REALISTIC version (Shanty 27 Nov 23:00 WIB: the kit look is
// template + generic AI — upgrade to 3D semi-realistic). The nerd is a
// REAL 3D figure (nerd3d.js: sphere head, torus glasses, capsule vest,
// stick cylinder arms/legs), the bedroom is a real 3D set (bedroom3d:
// dented pillow the head sinks into, folded blanket over the body bump),
// MeshStandardMaterial + soft env light, NO ink outlines (ink 0).
// STYLE REFERENCE (Shanty 27 Nov 23:15 WIB): Zack D. Films (@zackdfilms)
// — cinematic 3D, semi-realistic materials + lighting, HYPER-REALISTIC
// CLOSE-UPS of mechanisms, fast cuts, calm narration, one strange fact
// per short. So: cinematic light (warm key, deeper shadows, vignette),
// a tight face close-up opening the hook, and the two nose shots were
// tried as a REAL 3D nasal passage (worlds.js buildNose3D) — CUT after
// two smoke rounds: smooth ellipsoids in a cylinder read as giant red
// fingers, not anatomy. The nose boards (graphic, verified f=400) carry
// the mechanism instead. Only the visual language is the reference —
// our nerd, our script, our content, no copying.
// Diagram boards stay graphic by design in the other diagram shots
// (gravity, seesaw) — they ARE diagrams.
// Same 7 shots / frame ranges / Whisper lip-sync spans as kit-051 v2.
//
// TEST ONLY. No upload anywhere. No Gemini TTS (0 requests).
//
// 7 shots, one per script sentence, cut at the Whisper sentence starts:
// 1 hook 0.00-7.2s | 2 turbinates 7.2-15.2s | 3 stand up 15.2-23.2s |
// 4 lie flat 23.2-31.4s | 5 nasal cycle 31.4-38.5s | 6 roll over 38.5-46.7s |
// 7 payoff + CTA 46.7-59.2s. TOTAL 1777 frames (59.23 s at 30 fps).
//
// World: 'bedroom3d' (worlds.js). Nerd in EVERY shot (nerd3d.js, LOCKED
// design), no subtitles, no music (VO only), hard cuts, one distinct
// camera per shot. Lip-sync: mouth opens from the Whisper speech spans
// baked below (SPEECH), same approach as 049 v2 / kit-051 v1/v2.
import { noseSection, gravityBoard, nostrilSeesaw } from './cutaways.js';
import { camFromKeys, blinkAt, walk, q } from './motion.js';

export const FPS = 30, TOTAL = 1777, DECK = 6;
export const WORLD = 'bedroom3d';
export const SHOTS = [
  { id: 'hook', a: 0, b: 215, light: 'day' },        // lying in bed, head hits pillow, nose clogs
  { id: 'turbinates', a: 216, b: 456, light: 'day' }, // nose-section board, near full-bleed (3D nose interior cut — see worlds.js)
  { id: 'standup', a: 457, b: 696, light: 'day' },    // gravity board: arrows down, sponges slim
  { id: 'lieflat', a: 697, b: 940, light: 'day' },    // nose board: sponge swells, airway narrows
  { id: 'cycle', a: 941, b: 1155, light: 'day' },      // seesaw board: nostrils take turns
  { id: 'rollover', a: 1156, b: 1401, light: 'day' },  // lying in bed, rolls over, blockage follows
  { id: 'payoff', a: 1402, b: 1776, light: 'dayWarm' },// sits up in bed, breathes free, wave
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- lights: CINEMATIC day (Zack D. Films direction) — warm key,
// deeper shadows, stronger vignette than the flat bright v2 day.
// ink 0 = NO outlines — the semi-realistic look. Payoff warmer.
// 'nose' is the dark interior light for the 3D mechanism close-ups. ----------
export const LIGHTS = {
  day: { az: 250, el: 45, sky: '#fff6d8', ground: '#e8c890', hemi: 0.9, sun: '#ffe9b0', sunI: 2.6, fog: '#ffeec2', fogNear: 40, fogFar: 400,
    skyTop: '#6ec1f0', skyHor: '#d8f0fc', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#fff6d8', vig: 0.14, shadowExt: 12,
    sunDisc: '#fffbe0', sunSize: 0.03, ink: 0 },
  dayWarm: { az: 250, el: 38, sky: '#fff2c8', ground: '#e8c890', hemi: 0.9, sun: '#ffd9a0', sunI: 2.6, fog: '#ffeec2', fogNear: 40, fogFar: 400,
    skyTop: '#6ec1f0', skyHor: '#ffe9b8', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffe2a8', vig: 0.14, shadowExt: 12,
    sunDisc: '#fffbe0', sunSize: 0.03, ink: 0 },
  nose: { // UNUSED — kept for the cut 3D nose interior experiment (see worlds.js)
    az: 250, el: 45, sky: '#3a0a0a', ground: '#2a0606', hemi: 0.3, sun: '#ff9a80', sunI: 0.5, fog: '#2a0606', fogNear: 8, fogFar: 40,
    skyTop: '#3a0a0a', skyHor: '#2a0606', sat: 1.15, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ff9a80', vig: 0.18, shadowExt: 12,
    sunDisc: '#000000', sunSize: 0, ink: 0 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot.
// Room: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Boards (s 1.0) stand at x -22.3, z 0.9; nerd (s 0.8) at x -24.5, z -0.3.
// Lying nerd on the bed: card base DECK+0.55, centre ~(-24.3, -3.2). ----------
const CAMS = {
  hook: [ // Zack-style open: TIGHT close-up on the sleeping face, then pull back at f=120 when the nose clogs
    { f: 0, pos: [-24.2, 7.35, -1.6], look: [-25.4, 6.9, -3.2], fov: 36 },
    { f: 120, pos: [-21.0, 8.5, 1.0], look: [-24.8, 6.9, -3.1], fov: 38 },
    { f: 215, pos: [-21.3, 8.4, 0.9], look: [-24.8, 6.9, -3.1], fov: 38 },
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

const breathAt = (f) => (f / 120) % 1; // slow ~4 s breath cycle

// ---------- 3D nerd poses (nerd3d.js — the nerd is a real 3D figure now,
// not a card). Lying: root origin = feet; feet at (-23.98, 6.92, -3.2)
// puts the head centre on the dented pillow (-25.45, 6.92, -3.2) with
// the body under the blanket bump. Sitting: root origin = soles, torso
// rises from the mattress. Standing: root at NERD_SIDE, facing +z. ----------
const LIE_POS = [-23.98, 6.92, -3.2];
const SIT_POS = [-23.9, 6.09, -3.1];
const NERD_SIDE = [-24.5, DECK, -0.3];

export const nerdAt = (f) => {
  const S = shotAt(f);
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  switch (S.id) {
    case 'hook':
      // LYING IN BED: asleep (eyes closed) until f=120, then the nose
      // clogs — shock face, mouth talks with the VO.
      return { mode: 'lie', expr: f < 120 ? 'sleep' : 'shock', book: 'none', sink: 0.03, x: LIE_POS[0], y: LIE_POS[1], z: LIE_POS[2], ...base };
    case 'turbinates':
      return { mode: 'stand', expr: 'smile', book: 'open', gest: 0.4, x: NERD_SIDE[0], y: NERD_SIDE[1], z: NERD_SIDE[2], ...base };
    case 'standup':
      return { mode: 'stand', expr: 'smile', book: 'stack', gest: 0.5, x: NERD_SIDE[0], y: NERD_SIDE[1], z: NERD_SIDE[2], ...base };
    case 'lieflat':
      return { mode: 'stand', expr: 'shock', book: 'stack', gest: 0.3, x: NERD_SIDE[0], y: NERD_SIDE[1], z: NERD_SIDE[2], ...base };
    case 'cycle':
      return { mode: 'stand', expr: 'grin', book: 'stack', gest: 0.5, x: NERD_SIDE[0], y: NERD_SIDE[1], z: NERD_SIDE[2], ...base };
    case 'rollover': {
      // LYING IN BED: rolls over across the shot — the 3D body rotates
      // about its own long axis (real roll, not a card slide) + a small
      // slide along the bed; the blocked side follows at f=1280.
      const t = (f - 1156) / (1401 - 1156);
      return { mode: 'lie', expr: f < 1280 ? 'think' : 'shock', book: 'none', sink: 0.03, roll: 0.35 * t, x: LIE_POS[0] + 0.25 * t, y: LIE_POS[1], z: LIE_POS[2], ...base };
    }
    case 'payoff':
      // SITS UP IN BED: relieved grin, wave at the CTA.
      return { mode: 'sit', expr: 'grin', book: 'none', gest: q(0.6 + 0.4 * Math.sin(f * 0.5), 1), x: SIT_POS[0], y: SIT_POS[1], z: SIT_POS[2], ...base };
    default: return null;
  }
};

// ---------- actors: diagram boards only (the nerd is 3D now) ----------
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
  // diagram shots: board is the hero (s 1.0); the 3D nerd stands at the
  // left edge (see nerdAt — NERD_SIDE).
  const BOARD_POS = [-22.3, DECK, 0.9];
  switch (S.id) {
    case 'hook':
    case 'payoff':
      break; // bedroom shots: no boards, the 3D nerd + set carry it
    case 'turbinates': {
      out.push(B('nose0.15', (p) => noseSection(p, 0.15, 1), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'standup': {
      out.push(B('gravdown', (p) => gravityBoard(p, true), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'lieflat': {
      const fill = q(0.15 + 0.85 * ((f - 697) / (940 - 697)), 2);
      const flow = q(1 - 0.8 * ((f - 697) / (940 - 697)), 2);
      out.push(B('nose' + fill, (p) => noseSection(p, fill, flow), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'cycle': {
      const side = f < 1048 ? 0 : 1;
      out.push(B('seesaw' + side, (p) => nostrilSeesaw(p, side), BOARD_POS, 1.0, { yaw: flatYaw(f, BOARD_POS[0], BOARD_POS[2]) }));
      break;
    }
    case 'rollover': {
      const swapSide = f < 1280 ? 0 : 1;
      out.push(B('minisee' + swapSide, (p) => nostrilSeesaw(p, swapSide), [-22.8, DECK, -1.8], 0.5, { yaw: flatYaw(f, -22.8, -1.8) }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects: none in 3D mode — the bedside lamp is a real
// point light in the world now, not a glow card. ----------
export const fxAt = (f, T) => [];

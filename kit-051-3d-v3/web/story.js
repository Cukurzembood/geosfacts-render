// Shot plan for the kit-051-3d-v3 GRID build — GeosFact's 051
// "Why Does Your Nose Get Stuffy When You Lie Down?" rendered with the
// cartoon-kit on GitHub, using the EXISTING VO on disk (voiceover.mp3,
// 59.21 s at 0.9x). Same script, same VO as v1/v2.
//
// v3 (Shanty 28 Nov 02:38 WIB: build FROM the approved storyboard grid):
// CHARACTER = the grid nerd bookworm (nerd3d.js): big round WHITE BALL
// head, tiny dot eyes, big round black glasses, mustard sweater vest,
// THIN BLACK STICK arms/legs, always carrying books. NOT nerd2's
// semi-realistic human. Cinematic night bedroom (bedroomCine) + real 3D
// nasal passage (buildNose2) carried over from v2, zero flat boards.
//
// Same 7 shots / frame ranges / Whisper lip-sync spans as v1.
// STILLS ONLY for now — no full 59 s render until Shanty approves the
// stills. TEST ONLY. No upload anywhere. No Gemini TTS (0 requests).
//
// 7 shots, one per script sentence, cut at the Whisper sentence starts:
// 1 hook 0.00-7.2s | 2 turbinates 7.2-15.2s | 3 stand up 15.2-23.2s |
// 4 lie flat 23.2-31.4s | 5 nasal cycle 31.4-38.5s | 6 roll over 38.5-46.7s |
// 7 payoff + CTA 46.7-59.2s. TOTAL 1777 frames (59.23 s at 30 fps).
//
// World: 'bedroomCine' (worlds.js) + nose passage 'nose2' (same world
// file, group at y=60). Nerd in EVERY shot (nerd2.js), no subtitles,
// no music (VO only), hard cuts, one distinct camera per shot.
import { camFromKeys, blinkAt, walk, q } from './motion.js';

export const FPS = 30, TOTAL = 1777, DECK = 6;
export const WORLD = 'bedroomCine';
export const SHOTS = [
  { id: 'hook', a: 0, b: 215, light: 'night' },       // night bedroom: asleep, head hits pillow, nose clogs
  { id: 'turbinates', a: 216, b: 456, light: 'nose' },// INSIDE the nose: slim scroll turbinates + airflow
  { id: 'standup', a: 457, b: 696, light: 'nose' },   // INSIDE the nose: blood drains down (gravity)
  { id: 'lieflat', a: 697, b: 940, light: 'nose' },   // INSIDE the nose: turbinates swell, airway narrows
  { id: 'cycle', a: 941, b: 1155, light: 'nose' },     // INSIDE the nose: left swells, right opens, then swap
  { id: 'rollover', a: 1156, b: 1401, light: 'night' },// night bedroom: rolls over, blockage follows
  { id: 'payoff', a: 1402, b: 1776, light: 'nightWarm' },// night bedroom, lamp warm: sits up, breathes free, wave
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- lights: CINEMATIC NIGHT (Zack D. Films direction).
// 'night': cool moonlight key vs warm tungsten lamp (the lamp is a real
// point light in the world; the moonlight is a cool point by the window).
// The scene sun is dim + cool — the room walls block it, hemi + points
// do the real work. 'nose': warm pink interior, dark red fog.
// ink 0 = NO outlines — the semi-realistic look. ----------
export const LIGHTS = {
  night: { az: 180, el: 28, sky: '#4a5a78', ground: '#1a1410', hemi: 0.95, sun: '#9ab8e8', sunI: 0.9, fog: '#0e1420', fogNear: 40, fogFar: 400,
    skyTop: '#0a1226', skyHor: '#1a2438', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#9ab8e8', vig: 0.16, shadowExt: 12,
    sunDisc: '#e8eef8', sunSize: 0.03, ink: 0 },
  nightWarm: { az: 180, el: 28, sky: '#5a4a3a', ground: '#241a10', hemi: 0.65, sun: '#ffd9a0', sunI: 0.8, fog: '#14100c', fogNear: 40, fogFar: 400,
    skyTop: '#14100c', skyHor: '#2a2018', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffd9a0', vig: 0.16, shadowExt: 12,
    sunDisc: '#ffe9b0', sunSize: 0.03, ink: 0 },
  nose: { az: 250, el: 45, sky: '#5a1a1a', ground: '#2a0606', hemi: 0.5, sun: '#ff9a80', sunI: 0.8, fog: '#3a0a0a', fogNear: 8, fogFar: 40,
    skyTop: '#3a0a0a', skyHor: '#2a0606', sat: 1.15, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ff9a80', vig: 0.18, shadowExt: 12,
    sunDisc: '#000000', sunSize: 0, ink: 0 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot.
// Bedroom: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Nose passage: group at y=60, tube z -3.5..3.5, radius ~0.95 — every
// nose camera stays INSIDE the tube (x within ±0.8, y 59.6..60.6) and OFF
// the septum plane (x=0). The nerd (s 0.45) presents inside the passage,
// facing the camera (yaw PI).
const CAMS = {
  hook: [ // v3 round 3: round 2's low foot-end camera put the near blanket
    // ON the lens (only the top of the head showed). Come HIGHER and
    // back toward the headboard so the sightline clears the blanket
    // bump: pos (-23.9, 7.9, -1.5), fov 44 → face ~55% width, pillow +
    // books + blanket edge in frame like grid panel 1.
    { f: 0, pos: [-23.9, 7.9, -1.5], look: [-25.45, 6.98, -3.2], fov: 44 },
    { f: 120, pos: [-23.8, 7.92, -1.4], look: [-25.45, 6.98, -3.2], fov: 43 },
    // f=150 WIDE (REV round): window (left wall) + lamp (moved beside the
    // bed foot, x -22.0) + bed in ONE frame, back-wall pictures filling
    // the top half. Verified by projection: win (-0.84, 0.34), lamp
    // (0.83, 0.01), face (0.03, 0.01), pics (0.34, 0.50) / (0.74, 0.55).
    { f: 150, pos: [-17.0, 8.5, 3.0], look: [-24.0, 7.2, -2.0], fov: 72 },
    { f: 215, pos: [-17.6, 8.7, 3.2], look: [-23.8, 7.4, -1.8], fov: 68 },
  ],
  turbinates: [ // v3: CENTRED axis view down the tunnel (camera x -0.18,
    // clear of the septum's max extent ±0.08). v2's left-passage camera
    // hid the right scrolls behind the nerd and filled the left half
    // with flat septum/wall; the centred view shows BOTH scrolls at the
    // frame edges, the tunnel receding, and the nerd presenting in the
    // middle — grid panel 2. Nerd deeper (z -1.6) + smaller (s 0.38).
    { f: 216, pos: [-0.18, 60.08, -3.35], look: [0, 59.95, 2.2], fov: 56 },
    { f: 456, pos: [-0.16, 60.06, -3.3], look: [0.02, 59.96, 2.0], fov: 55 },
  ],
  standup: [ // v3: SAME centred view (v2's x 0.5 camera sat in the RIGHT
    // passage while the nerd stood in the LEFT — he was INVISIBLE at
    // f=600). Blood now drips in both passages + pools at his feet.
    { f: 457, pos: [-0.18, 60.10, -3.35], look: [0, 59.88, 1.6], fov: 54 },
    { f: 696, pos: [-0.16, 60.08, -3.3], look: [0.02, 59.90, 1.8], fov: 53 },
  ],
  lieflat: [ // v3: centred view — swollen scrolls bulge INWARD toward
    // the septum (worlds.js setSwell) so the narrowing gap reads.
    { f: 697, pos: [-0.18, 60.08, -3.35], look: [0, 59.92, 2.0], fov: 56 },
    { f: 940, pos: [-0.16, 60.06, -3.3], look: [0.02, 59.94, 1.9], fov: 55 },
  ],
  cycle: [ // v3: centred view — the septum reads as a thin vertical
    // divider, left passage swollen / right open (then swap at f=1048),
    // nerd centred between them pointing side to side — grid panel 5.
    // v2's left-passage camera could never show the swap (the left
    // scroll sat behind the lens edge).
    { f: 941, pos: [-0.18, 60.08, -3.35], look: [0, 59.95, 2.4], fov: 58 },
    { f: 1155, pos: [-0.16, 60.06, -3.3], look: [0.02, 59.96, 2.3], fov: 57 },
  ],
  rollover: [ // v3 round 4: REVERT to the f=150 wide setup — round 3's
    // tighter fov 64 cropped the window out (only a curtain sliver
    // left) while the head stayed just as small. The wide is the shot.
    { f: 1156, pos: [-17.0, 8.5, 3.0], look: [-24.0, 7.2, -2.0], fov: 72 },
    { f: 1401, pos: [-17.6, 8.7, 3.2], look: [-23.8, 7.4, -1.8], fov: 68 },
  ],
  payoff: [ // v3 round 4: back to a FOOT-END camera, centred on the nerd
    // and closer than round 2 (4.8 m, head ~28% width). Round 3's
    // window-side camera cropped half his head off; the lamp shade
    // stays out of frame from any bedroom camera — the warm lamp LIGHT
    // on the wall carries the warm/cool contrast instead (noted in QC).
    { f: 1402, pos: [-21.4, 7.5, 1.0], look: [-24.0, 7.05, -3.1], fov: 44 },
    { f: 1776, pos: [-21.0, 7.6, 1.2], look: [-24.0, 7.05, -3.1], fov: 45 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f);
  // head-hits-pillow thud at f=120: small camera kick (kept gentle)
  const kicks = S.id === 'hook' ? [{ f: 120, a: 0.2 }] : [];
  const c = camFromKeys(CAMS[S.id], f, { kicks });
  c.flash = 0;
  return c;
};

// ---------- lens: DOF ON for the hook close-up only (cinf 7, focus on
// the face — the look point). Everywhere else DOF off (cinf 0).
// focus = camera-to-look distance, so it tracks the shot. ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const C = camAt(f), S = shotAt(f);
  const cinf = (S.id === 'hook' && f < 120) ? 3 : 0; // v3: 4->3 — camera is now ~3 m out, 4 smeared the face at that distance.
  return { focus: dist(C.pos, C.look), cinf };
};

// ---------- world state: bedroom + nose are static except the nose
// updater (world.userData.updateNose2, called from main.js) ----------
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

// ---------- 3D nerd poses (nerd3d.js — the grid bookworm nerd).
// Lying: root origin = feet; feet at (-23.98, 6.92, -3.2) puts the head
// centre on the dented pillow (-25.45, 6.92, -3.2) with the body under
// the blanket bump. Sitting: root origin = soles, torso rises from the
// mattress. Standing: root at NERD_SIDE, facing +z.
// Nose shots: the nerd presents inside the passage (s 0.45, facing the
// camera (yaw PI)) — REV round: bigger + closer to the lens so he reads
// as the presenter, not a speck in red. ----------
const LIE_POS = [-23.98, 6.88, -3.2]; // v3 round 3: 6.86->6.88 — round 2's head was half-sunk (only cap + glasses showed in the wide); blanket profile 0.36 keeps the torso covered at this height.
const SIT_POS = [-23.9, 6.09, -3.1];
const NERD_SIDE = [-24.5, DECK, -0.3];

export const nerdAt = (f) => {
  const S = shotAt(f);
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  switch (S.id) {
    case 'hook':
      // LYING IN BED: asleep (eyes closed) until f=120, then the nose
      // clogs — shock face, mouth talks with the VO.
      return { mode: 'lie', expr: f < 120 ? 'sleep' : 'shock', book: 'stack', sink: 0.03, x: LIE_POS[0], y: LIE_POS[1], z: LIE_POS[2], ...base };
    case 'turbinates':
      // INSIDE THE NOSE, presenting the slim turbinates + airflow.
      // v3: centred in the tunnel (x -0.08), feet ON the floor (y 59.5),
      // s 0.38, z -1.6 — v2's x -0.32 put him against the left wall and
      // the left-passage camera cropped him huge.
      return { mode: 'stand', expr: 'smile', book: 'stack', gest: 0.5, s: 0.38, yaw: Math.PI, x: -0.08, y: 59.5, z: -1.6, ...base };
    case 'standup':
      // INSIDE THE NOSE: blood drains down through the turbinate (gravity).
      // v3: pointDown — right arm points forward-down at the blood pool.
      return { mode: 'stand', expr: 'shock', book: 'stack', gest: 0.4, pointDown: true, s: 0.38, yaw: Math.PI, x: -0.08, y: 59.5, z: -1.6, ...base };
    case 'lieflat':
      // INSIDE THE NOSE: turbinates swell, airway narrows — he watches it.
      return { mode: 'stand', expr: 'shock', book: 'stack', gest: 0.3, s: 0.38, yaw: Math.PI, x: -0.08, y: 59.5, z: -1.6, ...base };
    case 'cycle':
      // INSIDE THE NOSE: left swollen / right open, then swap at f=1048.
      return { mode: 'stand', expr: 'grin', book: 'stack', gest: 0.5, s: 0.38, yaw: Math.PI, x: -0.08, y: 59.5, z: -1.6, ...base };
    case 'rollover': {
      // LYING IN BED: rolls over across the shot — the 3D body rotates
      // about its own long axis (real roll, not a card slide) + a small
      // slide along the bed; the blocked side follows at f=1280.
      const t = (f - 1156) / (1401 - 1156);
      return { mode: 'lie', expr: f < 1280 ? 'think' : 'shock', book: 'none', sink: 0.03, roll: 0.35 * t, x: LIE_POS[0] + 0.25 * t, y: LIE_POS[1], z: LIE_POS[2], ...base };
    }
    case 'payoff':
      // SITS UP IN BED: relieved grin, wave at the CTA. v3: gest stays
      // high (0.85 base) so the waving hand reads in any still, not only
      // at the sine peak.
      return { mode: 'sit', expr: 'grin', book: 'stack', gest: q(0.85 + 0.15 * Math.sin(f * 0.5), 1), x: SIT_POS[0], y: SIT_POS[1], z: SIT_POS[2], ...base };
    default: return null;
  }
};

// ---------- actors: NONE. No boards in v2 — the mechanism is real 3D
// (nose interior) and the bedroom carries the rest. ----------
export const actorsAt = (f, T) => [];

// ---------- 2D effects: none in 3D mode — the bedside lamp is a real
// point light in the world now, not a glow card. ----------
export const fxAt = (f, T) => [];

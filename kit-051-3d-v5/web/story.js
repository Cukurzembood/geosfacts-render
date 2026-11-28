// Shot plan for the kit-051-3d-v5 036-FORMULA build — GeosFact's 051
// "Why Does Your Nose Get Stuffy When You Lie Down?" rendered with the
// cartoon-kit on GitHub, using the EXISTING VO on disk (voiceover.mp3,
// 59.21 s at 0.9x). Same script, same VO as v1-v4.
//
// v5 (Shanty 28 Nov 12:28 WIB — CONFIRMED Claude formula + 3D semirealistis
// CARTOON): TWO alternating worlds, hard cuts. PRESENTER (1, 6, 7): the nerd
// bookworm PERFORMING to camera in the brightened bedroom. ILLUSTRATION
// (2-5): dedicated FULL-SCREEN mechanism shots on ONE clean backdrop
// (warm cream -> dusty rose + soft bubbles, worlds.js) — the narrator is
// NEVER inside the diagram. Pop-ups timed to the VO: "?" hook, "!" at the
// cycle twist, magnifier ring on the cycle swap. Same 7 shots / frame
// ranges / Whisper lip-sync spans as v4; VO byte-identical.
// STILLS FIRST, then full GitHub render. TEST ONLY. No upload anywhere.
// No Gemini TTS (0 requests).
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
// v5 (036 formula): TWO alternating worlds.
// PRESENTER (shots 1, 6, 7): the nerd PERFORMING to camera in the bedroom
// — brightened to explainer lighting (hemi/sun up vs v4's cinematic night).
// ILLUSTRATION (shots 2-5): dedicated full-screen mechanism shots on ONE
// clean backdrop (worlds.js) — the narrator is NEVER inside the diagram.
// Pop-ups: "?" hook, "!" at the cycle twist, magnifier ring on the swap.
export const SHOTS = [
  { id: 'hook', a: 0, b: 215, light: 'night' },       // PRESENTER bedroom: asleep, head hits pillow, nose clogs + "?" pops
  { id: 'turbinates', a: 216, b: 456, light: 'illustr' },// ILLUSTRATION: turbinate close-up + airflow streams, clean backdrop
  { id: 'standup', a: 457, b: 696, light: 'illustr' },   // ILLUSTRATION: blood visibly draining down into the pool
  { id: 'lieflat', a: 697, b: 940, light: 'illustr' },   // ILLUSTRATION: turbinate swelling, airway narrowing
  { id: 'cycle', a: 941, b: 1155, light: 'illustr' },     // ILLUSTRATION: nasal-cycle split + swap, "!" then magnifier ring
  { id: 'rollover', a: 1156, b: 1401, light: 'night' },// PRESENTER bedroom: rolls over, blockage follows
  { id: 'payoff', a: 1402, b: 1776, light: 'nightWarm' },// PRESENTER bedroom, lamp warm: sits up, breathes free, wave
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
  night: { az: 180, el: 28, sky: '#4a5a78', ground: '#1a1410', hemi: 1.12, sun: '#9ab8e8', sunI: 1.05, fog: '#0e1420', fogNear: 40, fogFar: 400,
    skyTop: '#0a1226', skyHor: '#1a2438', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#9ab8e8', vig: 0.16, shadowExt: 12,
    sunDisc: '#e8eef8', sunSize: 0.03, ink: 0 },
  nightWarm: { az: 180, el: 28, sky: '#5a4a3a', ground: '#241a10', hemi: 0.85, sun: '#ffd9a0', sunI: 1.0, fog: '#14100c', fogNear: 40, fogFar: 400,
    skyTop: '#14100c', skyHor: '#2a2018', sat: 1.08, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffd9a0', vig: 0.16, shadowExt: 12,
    sunDisc: '#ffe9b0', sunSize: 0.03, ink: 0 },
  nose: { az: 250, el: 45, sky: '#5a1a1a', ground: '#2a0606', hemi: 0.5, sun: '#ff9a80', sunI: 0.8, fog: '#3a0a0a', fogNear: 8, fogFar: 40,
    skyTop: '#3a0a0a', skyHor: '#2a0606', sat: 1.15, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ff9a80', vig: 0.18, shadowExt: 12,
    sunDisc: '#000000', sunSize: 0, ink: 0 },
  // v5 'illustr': same warm nose key as 'nose' but brighter overall — the
  // mechanism now sits on a light backdrop, so it needs more fill to read
  // as bright 3D-cartoon, not a dark tunnel object. (Backdrop itself is
  // unlit MeshBasicMaterial, unaffected by this.)
  illustr: { az: 250, el: 45, sky: '#6a2a2a', ground: '#3a1010', hemi: 0.9, sun: '#ff9a80', sunI: 1.05, fog: '#3a0a0a', fogNear: 8, fogFar: 40,
    skyTop: '#3a0a0a', skyHor: '#2a0606', sat: 1.15, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ff9a80', vig: 0.18, shadowExt: 12,
    sunDisc: '#000000', sunSize: 0, ink: 0 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot.
// Bedroom: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Nose mechanism: group at y=60. v5: NO tube — the mechanism (scrolls at
// x ±0.78, septum x=0, z 0.5..3.5) floats on the clean illustration
// backdrop (z 3.8) + stage floor (y ~59.45); every illustration camera
// frames the mechanism against that backdrop. No nerd in these shots.
// v5 round 9: shots 2 + 4 restack the two inferior scrolls as VERTICAL
// columns (worlds.js) — see their camera notes; shots 3 + 5 keep the
// horizontal layout.
const CAMS = {
  hook: [ // v4: pulled back + wider (was -23.9/7.9/-1.5 fov 44) — face
    // ~40% width, blanket no longer half the frame. Window + lamp still
    // cannot fit a 9:16 close-up WITH the face (geometry: they sit ~50°
    // off the look axis); the f=150 wide carries the room.
    { f: 0, pos: [-23.3, 8.15, -0.9], look: [-25.45, 6.98, -3.2], fov: 50 },
    { f: 120, pos: [-23.2, 8.17, -0.8], look: [-25.45, 6.98, -3.2], fov: 49 },
    // f=150 WIDE (REV round): window (left wall) + lamp (moved beside the
    // bed foot, x -22.0) + bed in ONE frame, back-wall pictures filling
    // the top half. Verified by projection: win (-0.84, 0.34), lamp
    // (0.83, 0.01), face (0.03, 0.01), pics (0.34, 0.50) / (0.74, 0.55).
    { f: 150, pos: [-17.0, 8.5, 3.0], look: [-24.0, 7.2, -2.0], fov: 72 },
    { f: 215, pos: [-17.6, 8.7, 3.2], look: [-23.8, 7.4, -1.8], fov: 68 },
  ],
  turbinates: [ // v5 round 9: VERTICAL restack — the scrolls are 2.4 m
    // long along z, viewed end-on: the near ends crop at any front
    // camera (round 8: f300/f400 cut at the right edge, streams
    // detached) and a pull-back shrinks the mechanism into a small band
    // of tall empty cream. The two inferior scrolls are now vertical
    // columns (worlds.js round 9): 2.4 m tall x ~1.35 m wide = the 9:16
    // aspect. One centred establish + slow push-in; the whole mechanism
    // in frame with margin at every frame, streams flowing down the
    // central channel.
    { f: 216, pos: [0, 60.2, -3.9], look: [0, 60.2, 0], fov: 52 },
    { f: 456, pos: [0, 60.2, -3.4], look: [0, 60.2, 0], fov: 48 },
  ],
  standup: [ // v5 round 3: slightly closer + look raised so the mechanism
    // sits higher in frame; the pedestal + pool fill the bottom.
    { f: 457, pos: [-0.02, 60.35, -4.5], look: [0, 59.85, 0.7], fov: 54 },
    { f: 696, pos: [-0.02, 60.33, -4.45], look: [0.02, 59.87, 0.8], fov: 53 },
  ],
  lieflat: [ // v5 round 9: same vertical framing as shot 2 — both
    // swollen columns fully in frame with margin, slow push-in as they
    // swell. The gap narrows 0.64 m (shot 2) -> ~0.22 m (f900) and stays
    // a visible passage in every sampled still (tempered swell, worlds.js).
    { f: 697, pos: [0, 60.2, -3.4], look: [0, 60.2, 0], fov: 48 },
    { f: 940, pos: [0, 60.2, -3.25], look: [0, 60.2, 0], fov: 47 },
  ],
  cycle: [ // v5 round 4: closer (z -4.0, was -4.6) — round 3's split read
    // but the mechanism was small in a tall empty frame.
    { f: 941, pos: [-0.02, 60.3, -4.0], look: [0, 60.15, 1.0], fov: 58 },
    { f: 1155, pos: [-0.02, 60.28, -3.95], look: [0, 60.16, 0.9], fov: 57 },
  ],
  rollover: [ // v3 round 4: REVERT to the f=150 wide setup — round 3's
    // tighter fov 64 cropped the window out (only a curtain sliver
    // left) while the head stayed just as small. The wide is the shot.
    { f: 1156, pos: [-17.0, 8.5, 3.0], look: [-24.0, 7.2, -2.0], fov: 72 },
    { f: 1401, pos: [-17.6, 8.7, 3.2], look: [-23.8, 7.4, -1.8], fov: 68 },
  ],
  payoff: [ // v4: pulled back + wider (was -21.4/7.5/1.0 fov 44) — the
    // back-wall pictures + the nightstand lamp enter the frame; the
    // nerd is smaller but still the subject (~22% width). Verify in
    // stills; the v3 note (lamp out of frame from any bedroom camera)
    // was at fov 44 — the wider lens + higher look should fix it.
    { f: 1402, pos: [-19.9, 8.0, 2.3], look: [-23.6, 7.3, -3.2], fov: 60 },
    { f: 1776, pos: [-19.7, 8.05, 2.5], look: [-23.6, 7.3, -3.2], fov: 60 },
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
  // v4: the 'shock' mouth is a permanent open circle — in v3 it showed
  // as an OPEN mouth during VO pauses (f=690, t=23.0 s). So shock is
  // only used WHILE speaking; during pauses the face drops to a smile.
  const speaking = base.mouth > 0.12;
  const shockOrSmile = speaking ? 'shock' : 'smile';
  switch (S.id) {
    case 'hook':
      // LYING IN BED: asleep (eyes closed) until f=120, then the nose
      // clogs — shock face, mouth talks with the VO.
      return { mode: 'lie', expr: f < 120 ? 'sleep' : shockOrSmile, book: 'stack', sink: 0.03, x: LIE_POS[0], y: LIE_POS[1], z: LIE_POS[2], ...base };
    case 'turbinates':
    case 'standup':
    case 'lieflat':
    case 'cycle':
      // v5 (036 formula): the narrator is NEVER inside the diagram.
      // Illustration shots carry the explanation alone — no nerd at all,
      // not even the tiny deep presenter v4 kept. main.js hides the
      // nerd when nerdAt returns null.
      return null;
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

// ---------- pop-up symbols (v5, 036 formula): "?" hook, "!" twist at the
// cycle reveal, magnifier ring on the cycle swap. Camera-space billboards
// built in main.js; this returns {kind, x, y, s} or null. Positions are in
// camera space (x/y in metres at z -3.5, ~±0.9 = frame edge at fov ~50).
// v5 round 2: z was -2.2, where the frame half-width is only 0.58 m — the
// "?" at x 0.62 and the "!" at x 0.58 were BOTH cut off at the right edge
// in round 1. At z -3.5 the half-width is 0.92-1.09 m, so x 0.45/0.5 fits
// with the 0.75 m symbol inside the frame. Timing follows the VO: "?"
// while "so what changed?" (f 30-150); "!" at the twist "Your nostrils
// take turns" (f 941-1048); the magnifier ring pops on exactly at the
// swap (f 1048) and holds to the end of the shot.
const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const popScale = (f, f0, f1, f2, f3) => { // pop in f0-f1, hold, pop out f2-f3
  if (f < f0 || f >= f3) return 0;
  if (f < f1) return Math.max(0, easeOutBack((f - f0) / (f1 - f0)));
  if (f < f2) return 1;
  return 1 - (f - f2) / (f3 - f2);
};
export const popupAt = (f) => {
  let s = popScale(f, 30, 45, 135, 150);
  if (s > 0) return { kind: 'q', x: 0.45, y: 0.62, s };
  s = popScale(f, 941, 956, 1030, 1048);
  if (s > 0) return { kind: 'bang', x: 0.5, y: 0.55, s };
  s = popScale(f, 1048, 1063, 1140, 1155);
  if (s > 0) return { kind: 'mag', x: 0.3, y: 0.05, s };
  return null;
};

// ---------- actors: NONE. No boards in v2 — the mechanism is real 3D
// (nose interior) and the bedroom carries the rest. ----------
export const actorsAt = (f, T) => [];

// ---------- 2D effects: none in 3D mode — the bedside lamp is a real
// point light in the world now, not a glow card. ----------
export const fxAt = (f, T) => [];

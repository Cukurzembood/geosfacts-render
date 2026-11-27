// Shot plan for the eerie TEST video "The Window That Watched Back".
// Narrative cinematic short, 66.0 s at 30 fps (1980 frames), 1080x1920.
// NO VO — narration is a silent track (Gemini TTS quota is reserved for
// pipeline prep 052-056). The script below (script.txt) defines the shot
// timing; the story is carried by the visuals. SPEECH is empty on purpose:
// the nerd never talks to camera in this one — he walks, looks, reacts.
// Original story. NOT the lift / floor-13 story from the Threads reference.
//
// Motion test goals: camera variety (wide / tracking / low close-up /
// reverse / crane-up / pull-back), hard cuts (14 shots), parallax through
// the 3D street, character acting (walk, stop, look up, freeze, flinch),
// and things that CHANGE per shot (lit windows, flickering lamp, backwards
// clock, door that opens and slams, drifting fog).
import { nerdFront, nerdSide } from './nerd.js';
import { litWindow, bookPage, wallClock, doorGlow, spillGlow, lampGlow, fogPuff } from './cutaways.js';
import { camFromKeys, blinkAt, walk, q } from './motion.js';

export const FPS = 30, TOTAL = 1980, DECK = 6;
export const WORLD = 'nightlane';
export const SHOTS = [
  { id: 'establish', a: 0, b: 179, light: 'night' },       // wide night street, he walks in
  { id: 'track', a: 180, b: 359, light: 'night' },         // tracking shot, one lit window
  { id: 'lookup', a: 360, b: 539, light: 'night' },        // close-up: someone in the window, then gone
  { id: 'flicker', a: 540, b: 619, light: 'night' },       // lamp above him buzzes, flickers
  { id: 'dark', a: 620, b: 719, light: 'nightDim' },       // lamp dies, darkness
  { id: 'eyes', a: 720, b: 899, light: 'nightDim' },       // two lit windows, like eyes
  { id: 'book', a: 900, b: 1079, light: 'nightDim' },      // the page he never wrote: DON'T KNOCK
  { id: 'door', a: 1080, b: 1259, light: 'nightWarm' },    // front door stands open
  { id: 'clock', a: 1260, b: 1439, light: 'nightWarm' },   // clock ticks backwards
  { id: 'preslam', a: 1440, b: 1499, light: 'nightWarm' }, // the open door, one breath
  { id: 'slam', a: 1500, b: 1619, light: 'nightDim' },     // the door slams shut (camera kick)
  { id: 'lampback', a: 1620, b: 1699, light: 'nightDim' }, // lamp flickers back on
  { id: 'lampsteady', a: 1700, b: 1799, light: 'night' },  // lamp steady, he stands alone
  { id: 'empty', a: 1800, b: 1979, light: 'night' },       // wide pull-back: street empty, his book on the ground
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- lights: cold moonlight, dim (lamp dead), warm (door open) ----------
export const LIGHTS = {
  night: { az: 205, el: 55, sky: '#0a1220', ground: '#0a0e16', hemi: 0.55, sun: '#9db8e8', sunI: 1.15, fog: '#0d1524', fogNear: 30, fogFar: 260,
    skyTop: '#05080f', skyHor: '#0e1828', sat: 0.92, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#dfe9ff', vig: 0.32, shadowExt: 12,
    sunDisc: '#eef2fb', sunSize: 0.014 },
  nightDim: { az: 205, el: 55, sky: '#070b14', ground: '#070a10', hemi: 0.3, sun: '#7d97c4', sunI: 0.5, fog: '#080d18', fogNear: 22, fogFar: 190,
    skyTop: '#030509', skyHor: '#0a101c', sat: 0.9, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#dfe9ff', vig: 0.38, shadowExt: 12,
    sunDisc: '#dfe6f5', sunSize: 0.014 },
  nightWarm: { az: 205, el: 55, sky: '#0d1017', ground: '#0d0b10', hemi: 0.6, sun: '#ffc890', sunI: 1.25, fog: '#151019', fogNear: 30, fogFar: 260,
    skyTop: '#07060a', skyHor: '#1d1418', sat: 0.95, waterDeep: '#0a1420', waterShal: '#16283e', glint: '#ffe2a8', vig: 0.3, shadowExt: 12,
    sunDisc: '#ffe9c4', sunSize: 0.012 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: one distinct setup per shot (never reuse an establishing shot).
// camFromKeys gives spline glides + a gentle push-in creep on every hold;
// the slam shot gets a kick at f=1500. ----------
const CAMS = {
  establish: [
    { f: 0, pos: [-19.6, 8.3, 7.4], look: [-25.2, 7.2, -0.6], fov: 48 },
    { f: 179, pos: [-20.6, 8.1, 6.8], look: [-25.0, 7.2, -0.6], fov: 46 },
  ],
  track: [
    { f: 180, pos: [-23.8, 7.5, 4.6], look: [-25.8, 7.1, 0], fov: 40 },
    { f: 359, pos: [-21.0, 7.5, 4.6], look: [-23.0, 7.1, 0], fov: 40 },
  ],
  lookup: [
    { f: 360, pos: [-18.2, 7.4, 5.6], look: [-19.6, 8.0, -3.0], fov: 44 },
    { f: 539, pos: [-18.5, 7.3, 5.3], look: [-19.6, 8.0, -3.0], fov: 43 },
  ],
  flicker: [
    { f: 540, pos: [-18.6, 8.0, 6.0], look: [-21.8, 7.8, -0.4], fov: 46 },
    { f: 619, pos: [-18.9, 7.9, 5.7], look: [-21.6, 7.8, -0.4], fov: 45 },
  ],
  dark: [
    { f: 620, pos: [-19.2, 7.8, 5.4], look: [-21.6, 7.6, -0.4], fov: 46 },
    { f: 719, pos: [-19.5, 7.8, 5.1], look: [-21.5, 7.6, -0.4], fov: 45 },
  ],
  eyes: [
    { f: 720, pos: [-23.8, 8.2, 4.6], look: [-18.8, 8.0, -4.8], fov: 46 },
    { f: 899, pos: [-23.4, 8.1, 4.4], look: [-18.8, 8.0, -4.8], fov: 45 },
  ],
  book: [
    { f: 900, pos: [-17.4, 7.6, 4.4], look: [-19.6, 7.2, 0.5], fov: 44 },
    { f: 1079, pos: [-17.6, 7.6, 4.2], look: [-19.6, 7.2, 0.5], fov: 43 },
  ],
  door: [
    { f: 1080, pos: [-13.8, 8.0, 5.0], look: [-18.4, 7.0, -3.0], fov: 52 },
    { f: 1259, pos: [-14.2, 7.9, 4.7], look: [-18.4, 7.0, -3.0], fov: 51 },
  ],
  clock: [
    { f: 1260, pos: [-15.2, 7.9, 1.2], look: [-17.0, 7.9, -4.0], fov: 44 },
    { f: 1439, pos: [-15.5, 7.8, 1.0], look: [-17.0, 7.9, -4.0], fov: 43 },
  ],
  preslam: [
    { f: 1440, pos: [-14.2, 7.9, 4.8], look: [-18.4, 7.2, -3.0], fov: 52 },
    { f: 1499, pos: [-14.6, 7.9, 4.5], look: [-18.4, 7.2, -3.0], fov: 51 },
  ],
  slam: [
    { f: 1500, pos: [-13.6, 8.0, 5.0], look: [-18.2, 7.2, -3.2], fov: 52 },
    { f: 1619, pos: [-14.0, 7.9, 4.7], look: [-18.2, 7.2, -3.2], fov: 51 },
  ],
  lampback: [
    { f: 1620, pos: [-18.8, 8.2, 6.4], look: [-20.2, 7.7, -0.6], fov: 46 },
    { f: 1699, pos: [-18.6, 8.1, 6.1], look: [-20.2, 7.7, -0.6], fov: 45 },
  ],
  lampsteady: [
    { f: 1700, pos: [-18.6, 8.1, 6.1], look: [-20.2, 7.7, -0.6], fov: 45 },
    { f: 1799, pos: [-17.6, 9.6, 7.6], look: [-20.6, 7.4, -0.8], fov: 48 },
  ],
  empty: [
    { f: 1800, pos: [-15.5, 9.8, 7.2], look: [-21.0, 6.6, -1.5], fov: 48 },
    { f: 1979, pos: [-13.8, 11.6, 8.8], look: [-21.5, 6.6, -1.5], fov: 50 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f);
  const kicks = S.id === 'slam' ? [{ f: 1500, a: 0.7 }] : [];
  const c = camFromKeys(CAMS[S.id], f, { kicks });
  c.flash = 0;
  return c;
};

// ---------- lens: DOF OFF (cinf 0) — same call as 049 v2 (swiftshader speed) ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const C = camAt(f);
  return { focus: dist(C.pos, [-20, 7.0, 0]), cinf: 0 };
};

// ---------- world state: night lane is static; all change is cards ----------
export const worldAt = (f) => ({ collapse: 0, banner: 'gone', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- VO: NONE (silent narration track). Mouth stays shut the whole video. ----------
const SPEECH = [];
const mouthAt = (f) => 0;

// ---------- actors ----------
const breathAt = (f) => (f / 120) % 1; // slow ~4 s breath cycle
// walk plan: [shot, f0, x0, speed m/s] — nerd walks +x down the street
const WALKS = {
  establish: { f0: 0, x0: -27.8, speed: 0.367 },
  track: { f0: 180, x0: -25.6, speed: 0.4 },
  flicker: { f0: 540, x0: -22.7, speed: 0.1 },
  dark: { f0: 620, x0: -21.9, speed: 0.07 },
};
const walkState = (shotId, f) => {
  const w = WALKS[shotId];
  if (!w) return null;
  const s = walk(f, w.f0, w.speed, 0.8);
  return { x: w.x0 + s.dist, phase: q(s.phase, 2) };
};
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

// Cards that sit ON the facade (lit windows, clock, door glow) must lie
// flat against it: a billboard card swings its edges behind the wall at
// oblique angles and the wall occludes it. yaw cancels the billboard
// rotation so rotation.y = 0 (card faces +z, parallel to the facade).
const flatYaw = (f, x, z) => {
  const C = camAt(f);
  return -Math.atan2(C.pos[0] - x, C.pos[2] - z);
};

// lit-window cards: upper windows of the main house (no mesh behind them;
// the card IS the window). Card bottom y = 9.45, s = 0.7.
const WIN_A = [-19.7, 9.45, -5.35], WIN_B = [-17.3, 9.45, -5.35];
const winCard = (f, which, figure) => B('win' + which + (figure ? 'F' : ''),
  (p) => litWindow(p, figure), which === 'A' ? WIN_A : WIN_B, 0.7,
  { yaw: flatYaw(f, which === 'A' ? WIN_A[0] : WIN_B[0], -5.35) });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'nightWarm' ? '#ffe2c8' : '#cdd8ea';
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  const front = (o, pos = [-21.5, DECK, 0], extra = {}) => out.push(N({ ...base, ...o }, pos, { tint, ...extra }));
  const side = (o, pos, extra = {}) => out.push(NS({ ...base, ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'establish': {
      const w = walkState('establish', f);
      side({ mode: 'walk', phase: w.phase, expr: 'think', book: 'stack' }, [w.x, DECK, 0.3]);
      break;
    }
    case 'track': {
      const w = walkState('track', f);
      side({ mode: 'walk', phase: w.phase, expr: 'think', book: 'stack' }, [w.x, DECK, 0.3]);
      out.push(winCard(f, 'A', false)); // one lit window, ahead of him
      break;
    }
    case 'lookup': {
      // stops, looks up: someone stands in the lit window for the first
      // half of the shot, then the light is empty
      front({ mode: 'stand', expr: 'shock', book: 'stack', headTilt: -5 }, [-20.0, DECK, 0.3]);
      out.push(winCard(f, 'A', f < 450));
      break;
    }
    case 'flicker': {
      const w = walkState('flicker', f);
      side({ mode: 'walk', phase: w.phase, expr: 'think', book: 'stack' }, [w.x, DECK, 0.3]);
      break;
    }
    case 'dark': {
      const w = walkState('dark', f);
      side({ mode: 'walk', phase: w.phase, expr: 'shock', book: 'stack' }, [w.x, DECK, 0.3]);
      break;
    }
    case 'eyes': {
      // frozen in profile, facing the house: TWO lit windows, like eyes
      side({ mode: 'stand', expr: 'shock', book: 'stack' }, [-20.8, DECK, 0.3]);
      out.push(winCard(f, 'A', false));
      out.push(winCard(f, 'B', false));
      break;
    }
    case 'book': {
      // opens the book; the page board carries DON'T KNOCK
      front({ mode: 'talk', expr: 'shock', book: 'open', gest: 0.3 }, [-20.0, DECK, 0.2]);
      out.push(B('bookpage', (p) => bookPage(p, 0), [-19.2, DECK, 0.9], 0.45));
      break;
    }
    case 'door': {
      // at the gate, hesitating; the door stands open, warm light spills out
      front({ mode: 'stand', expr: 'think', book: 'stack' }, [-18.8, DECK, -1.4]);
      out.push(B('doorglow', (p) => doorGlow(p), [-18.5, 6.3, -5.3], 0.9, { yaw: flatYaw(f, -18.5, -5.3) }));
      out.push(B('spill', (p) => spillGlow(p), [-18.5, 5.75, -3.9], 0.9));
      break;
    }
    case 'clock': {
      // the wall clock beside the door ticks BACKWARDS
      const ang = q(-0.06 * (f - 1260), 2);
      front({ mode: 'stand', expr: 'think', book: 'stack', headTilt: 4 }, [-17.6, DECK, -3.2]);
      out.push(B('clock' + ang, (p) => wallClock(p, ang), [-17.1, 8.3, -5.35], 0.5, { yaw: flatYaw(f, -17.1, -5.35) }));
      break;
    }
    case 'preslam': {
      // one breath before it happens; door still open
      front({ mode: 'stand', expr: 'shock', book: 'stack' }, [-18.8, DECK, -1.4]);
      out.push(B('doorglow', (p) => doorGlow(p), [-18.5, 6.3, -5.3], 0.9, { yaw: flatYaw(f, -18.5, -5.3) }));
      out.push(B('spill', (p) => spillGlow(p), [-18.5, 5.75, -3.9], 0.9));
      break;
    }
    case 'slam': {
      // door shut, light gone; he flinches as it slams (headTilt jumps)
      front({ mode: 'stand', expr: 'shock', book: 'stack', headTilt: f < 1512 ? 5 : 1 }, [-18.8, DECK, -1.4]);
      break;
    }
    case 'lampback': {
      // lamp flickers back on; he stands alone, breathing
      front({ mode: 'stand', expr: 'think', book: 'stack' }, [-19.8, DECK, 0.2]);
      break;
    }
    case 'lampsteady': {
      front({ mode: 'stand', expr: 'think', book: 'stack' }, [-19.8, DECK, 0.2]);
      break;
    }
    case 'empty': {
      // he is gone. Only his book lies on the ground, pages turning.
      const fl = q((f % 30) / 30, 2);
      out.push(B('bookground' + fl, (p) => bookPage(p, fl), [-19.6, 5.9, 0.0], 0.45));
      break;
    }
  }
  return out;
};

// ---------- 2D effects: lamp halos + drifting fog ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
const LAMP1 = [-26.5, 7.95, 1.7], LAMP2 = [-20.3, 7.95, 1.7];
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  // lamp halos. lamp1 always on (dim after the dark shot); lamp2 is the
  // flickering one: on in establish/track/lookup, flickers in flicker +
  // lampback, dead in dark/eyes/book/door/clock/preslam/slam, steady in
  // lampsteady/empty.
  const lamp1a = S.id === 'establish' || S.id === 'track' || S.id === 'lookup' ? 1 : 0.5;
  out.push(FX('lamp1', (p) => lampGlow(p, lamp1a), LAMP1, 0.9));
  let lamp2 = null;
  if (['establish', 'track', 'lookup'].includes(S.id)) lamp2 = 1;
  else if (S.id === 'flicker' || S.id === 'lampback') lamp2 = (f % 6 < 3) ? 1 : 0.15;
  else if (S.id === 'lampsteady' || S.id === 'empty') lamp2 = 1;
  if (lamp2 !== null) out.push(FX('lamp2' + lamp2, (p) => lampGlow(p, lamp2), LAMP2, 0.9));
  // drifting ground fog in the wide / quiet shots
  if (['establish', 'track', 'eyes', 'lampback', 'lampsteady', 'empty'].includes(S.id)) {
    for (let i = 0; i < 3; i++) {
      const x = q(-27 + ((f * 0.015 + i * 4.3) % 13), 1);
      out.push(FX('fog' + i + x, (p) => fogPuff(p, 0.08), [x, 5.9, -1.5 + i * 1.3], 1.8));
    }
  }
  return out;
};

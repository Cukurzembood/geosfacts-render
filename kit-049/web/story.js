// Shot plan for GeosFact's 049 "Why Do You Shiver After You Pee?" — v2.
// Timed to voice.mp3 (53.62 s, 30 fps). Same sentences as v1:
// 0.00-6.70 hook | 7.42-15.04 the fancy name | 15.68-24.20 hold it in, let go |
// 24.20-29.88 pressure drops, switch trips the shiver | 30.56-35.52 full bladder, guys report it more |
// 36.28-41.78 cold air can not explain it | 42.52-53.42 payoff + CTA.
//
// v2 changes (Shanty approved): the bean-head Roman cast is GONE — the
// narrator is our nerd stickman (web/nerd.js, LOCKED design) in EVERY shot,
// and the single static bridge world is replaced by the bathroom world
// (web/worlds.js id 'bathroom'). Camera variety per shot: close-up, medium,
// wide, tracking push-in, medium-wide, close-up from the other side,
// pull-back. Science cutaways (web/cutaways.js) carry the mechanism:
// bladder-as-balloon (hold), pressure gauge (drop), nerve switch (cold),
// name plaque (name). Niche rules kept: narrator in EVERY shot, no
// subtitles, no music (SFX only, audio049.py), hard cuts (each shot has its
// own camera), no transitions. Mouth opens/closes from the whisper speech
// segments baked below (SPEECH), quantized so the card redraws only when
// the mouth visibly changes. Expressions change per shot; blinks come from
// blinkAt (4-frame lids) — the expression itself never swaps mid-shot.
import { nerdFront } from './nerd.js';
import { bladderBalloon, pressureGauge, nerveSwitch, namePlaque, fxShiver } from './cutaways.js';

export const FPS = 30, TOTAL = 1609, DECK = 6;
export const WORLD = 'bathroom';
export const SHOTS = [
  { id: 'hook', a: 0, b: 221, light: 'bathroom' },
  { id: 'name', a: 222, b: 469, light: 'bathroom' },
  { id: 'hold', a: 470, b: 725, light: 'bathroom' },
  { id: 'drop', a: 726, b: 915, light: 'bathroom' },
  { id: 'guys', a: 916, b: 1087, light: 'bathroom' },
  { id: 'cold', a: 1088, b: 1274, light: 'bathroom' },
  { id: 'payoff', a: 1275, b: 1608, light: 'bathroomWarm' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

// ---------- lights: warm indoor bathroom (sun through the left window) ----------
export const LIGHTS = {
  bathroom: { az: 175, el: 38, sky: '#e8dcc8', ground: '#8a7a62', hemi: 1.0, sun: '#ffd9a0', sunI: 2.2, fog: '#e8dcc8', fogNear: 60, fogFar: 500,
    skyTop: '#f2e2c0', skyHor: '#e8d0a8', sat: 1.08, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 8 },
  bathroomWarm: { az: 175, el: 22, sky: '#e8d0a8', ground: '#7a6248', hemi: 0.95, sun: '#ffb46c', sunI: 2.6, fog: '#f0c088', fogNear: 60, fogFar: 500,
    skyTop: '#e8b878', skyHor: '#ffd9a0', sat: 1.12, gain: '#fff2e2', waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#ffe2a8', vig: 0.26, shadowExt: 8 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: keys { f, pos, look, fov, roll }. Smootherstep glides; every hold creeps.
// Room: x -27..-16, z -4.5..4.5, floor y 6, ceiling 12.6. Narrator SOL (-21.5, 6, 0).
// Each shot is a DIFFERENT setup (close-up / medium / wide / tracking /
// medium-wide / reverse close-up / pull-back) — never reuse an establishing shot. ----------
const SOL = [-21.5, DECK, 0];
const CAMS = {
  hook: [ // close-up on the shivering nerd
    { f: 0, pos: [-19.2, 7.7, 2.0], look: [-21.5, 7.5, 0], fov: 30 },
    { f: 221, pos: [-19.7, 7.7, 1.7], look: [-21.5, 7.5, 0], fov: 28 },
  ],
  name: [ // medium two-shot: nerd + plaque board (portrait frame is narrow — the board sits ~0.8 m off the sightline, look centred between them)
    { f: 222, pos: [-17.6, 7.6, 3.2], look: [-21.9, 7.3, 0.3], fov: 42 },
    { f: 469, pos: [-18.0, 7.55, 3.0], look: [-21.9, 7.3, 0.3], fov: 40 },
  ],
  hold: [ // wide: tub + sink + nerd + bladder board
    { f: 470, pos: [-17.0, 8.8, 3.9], look: [-22.8, 6.9, -1.0], fov: 46 },
    { f: 725, pos: [-17.4, 8.7, 3.7], look: [-22.8, 6.9, -1.0], fov: 44 },
  ],
  drop: [ // two-shot + slow push-in as the pressure drops
    { f: 726, pos: [-18.2, 7.5, 2.6], look: [-21.75, 7.2, 0.3], fov: 40 },
    { f: 915, pos: [-18.8, 7.45, 2.3], look: [-21.75, 7.2, 0.3], fov: 38 },
  ],
  guys: [ // medium-wide, three nerds (pulled back so all three fit the narrow portrait frame)
    { f: 916, pos: [-16.6, 8.1, 3.8], look: [-21.7, 7.0, 0], fov: 48 },
    { f: 1087, pos: [-17.0, 8.05, 3.6], look: [-21.7, 7.0, 0], fov: 46 },
  ],
  cold: [ // reverse two-shot from the other side, nerve board in frame
    { f: 1088, pos: [-18.4, 7.6, -2.6], look: [-21.8, 7.2, -0.2], fov: 40 },
    { f: 1274, pos: [-18.8, 7.55, -2.4], look: [-21.8, 7.2, -0.2], fov: 38 },
  ],
  payoff: [ // pull-back wide; the look target TRACKS the walking nerd (1275-1450), then settles for the wave
    { f: 1275, pos: [-19.5, 7.7, 3.4], look: [-23.6, 7.0, 0], fov: 44 },
    { f: 1450, pos: [-18.2, 8.2, 3.6], look: [-21.5, 7.0, 0], fov: 45 },
    { f: 1608, pos: [-17.6, 8.6, 3.8], look: [-21.5, 7.0, 0], fov: 46 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  let c;
  if (f <= K[0].f) c = { ...K[0] };
  else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) {
    const t = smooth((f - K[i].f) / (K[i + 1].f - K[i].f)), a = K[i], b = K[i + 1];
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
  c.flash = 0;
  return c;
};

// ---------- lens: DOF OFF (cinf 0) — the 48-tap DOF pass is what makes swiftshader slow;
// the ink + grade pass still runs, so the look stays painted. ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const C = camAt(f);
  return { focus: dist(C.pos, [-21.5, 7.0, 0]), cinf: 0 };
};

// ---------- world state: bathroom is static (no collapse/ageing); bridge fields unused ----------
export const worldAt = (f) => ({ collapse: 0, banner: 'gone', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- VO timing: whisper speech segments [start, end] seconds (work/phrases.json).
// The nerd's mouth opens only while speech is happening. ----------
const SPEECH = [[0.308542, 1.91175], [2.181708, 3.252083], [3.520083, 5.234333], [5.597167, 6.808083], [7.421, 8.931167], [9.476375, 12.117083], [12.500292, 15.198083], [15.386667, 15.510375], [15.977917, 20.315917], [20.566292, 22.476167], [22.979292, 23.362292], [23.718792, 24.326708], [24.642667, 26.479958], [26.621792, 30.04], [30.5745, 31.763417], [31.924, 32.670083], [32.85875, 35.805042], [36.389625, 37.901167], [38.296708, 39.607208], [39.749542, 41.920917], [42.593667, 46.266875], [46.741125, 47.535167], [48.309458, 49.092708], [49.641042, 50.278792], [50.558708, 53.006458], [53.153125, 53.622292]];
const mouthAt = (f) => {
  const t = f / 30;
  const speaking = SPEECH.some(([s, e]) => t >= s - 0.05 && t <= e + 0.08);
  if (!speaking) return 0;
  return q(0.35 + 0.65 * Math.abs(Math.sin(t * 21)), 2);
};

// ---------- actors: the nerd in EVERY shot ----------
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const breathAt = (f) => (f / 120) % 1; // slow ~4 s breath cycle
const N = (o, pos, extra = {}) => ({
  key: 'nerd' + JSON.stringify(o), draw: (p) => nerdFront(p, o),
  x: pos[0], y: pos[1], z: pos[2], ...extra,
});
const B = (key, draw, pos, s = 0.7) => ({
  key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, order: 3,
});

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'bathroomWarm' ? '#ffe2c8' : '#ffffff';
  const base = { blink: blinkAt(f, 11), mouth: mouthAt(f), breath: q(breathAt(f), 2) };
  const narr = (o, pos = SOL, extra = {}) => out.push(N({ ...base, ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': {
      // shiver: tiny alternating head tilt while he asks the hook question
      narr({ mode: 'talk', expr: 'shock', book: 'stack', headTilt: f % 2 ? 2 : -2 });
      break;
    }
    case 'name': {
      // explains with the open book; the plaque carries the fancy name
      narr({ mode: 'talk', expr: 'smile', book: 'open', gest: 0.4 });
      out.push(B('plaque', (p) => namePlaque(p), [-22.27, DECK, 0.92], 0.55));
      break;
    }
    case 'hold': {
      // bracing: one hand on the belly idea, bladder board filling up
      const fill = q((f - 470) / (725 - 470), 2);
      narr({ mode: 'talk', expr: 'think', book: 'stack', gest: 0.3 });
      out.push(B('bladder' + fill, (p) => bladderBalloon(p, fill), [-24.6, DECK, -0.6], 0.9));
      break;
    }
    case 'drop': {
      // pressure falls across the shot: gauge needle sweeps high -> low
      const pressure = q(1 - (f - 726) / (915 - 726), 2);
      narr({ mode: 'talk', expr: 'shock', book: 'stack', gest: 0.8 });
      out.push(B('gauge' + pressure, (p) => pressureGauge(p, pressure), [-22.0, DECK, 0.63], 0.55));
      break;
    }
    case 'guys': {
      // two nerd friends laugh along — same character, smaller, flanking
      narr({ mode: 'talk', expr: 'grin', book: 'stack', gest: 0.5 });
      out.push(N({ ...base, mode: 'talk', expr: 'grin', book: 'stack', blink: blinkAt(f, 32) }, [-21.0, DECK, -0.55], { tint, s: 0.9 }));
      out.push(N({ ...base, mode: 'talk', expr: 'grin', book: 'stack', blink: blinkAt(f, 33) }, [-22.2, DECK, 0.55], { tint, s: 0.9 }));
      break;
    }
    case 'cold': {
      // shiver again + the nerve-switch board: HOLD flips to GO
      const state = f < 1180 ? 0 : 1;
      narr({ mode: 'talk', expr: 'think', book: 'stack', headTilt: f % 2 ? 1.5 : -1.5 });
      out.push(B('nerve' + state, (p) => nerveSwitch(p, state), [-22.08, DECK, -0.55], 0.55));
      break;
    }
    case 'payoff': {
      // walk in from the tub (1275-1450), then stand and wave at the CTA
      if (f <= 1450) {
        const t = (f - 1275) / 30, dist = t * 0.48, phase = q((t * 0.3) % 1, 2);
        narr({ mode: 'walk', phase, expr: 'smile', book: 'stack' }, [-24.3 + dist, DECK, 0]);
      } else {
        narr({ mode: 'talk', expr: 'grin', book: 'stack', gest: q(0.6 + 0.4 * Math.sin(f * 0.5), 1) });
      }
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 6, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'hook' || S.id === 'cold') {
    // shiver zigzags beside the nerd's head
    out.push(FX('shiver', (p) => fxShiver(p, f / 30), [-21.5, 7.25, 0.85], 0.45));
  }
  if (S.id === 'drop') {
    // drips falling from the tub faucet as the pressure drops
    for (let i = 0; i < 3; i++) {
      const t = ((f - 726) * 0.03 + i * 0.37) % 1;
      out.push(FX('drop', (p) => T.fxDrip(p), [-23.05 + i * 0.3, 7.5 - t * 0.7, -3.9], 0.1));
    }
  }
  return out;
};

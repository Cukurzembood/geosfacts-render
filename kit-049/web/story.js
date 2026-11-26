// Shot plan for GeosFact's 049 "Why Do You Shiver After You Pee?" — timed to voice.mp3 (53.62 s, 30 fps).
// Sentences (whisper timings): 0.00-6.70 hook | 7.42-15.04 the fancy name | 15.68-24.20 hold it in, let go |
// 24.20-29.88 pressure drops, switch trips the shiver | 30.56-35.52 full bladder, guys report it more |
// 36.28-41.78 cold air can not explain it | 42.52-53.42 payoff + CTA.
// Niche rules applied: narrator (civA) in EVERY shot, no subtitles, no music (SFX only, audio049.py),
// hard cuts (each shot has its own camera), no transitions. NOTE: this kit draws BEAN-HEAD Roman-era
// characters on its fixed bridge world — not our nerd stickman, and no bathroom/bladder set exists
// in this engine. The story is staged on the bridge with the narrator acting it out.
export const FPS = 30, TOTAL = 1609, DECK = 6;
export const SHOTS = [
  { id: 'hook', a: 0, b: 221, light: 'day' },
  { id: 'name', a: 222, b: 469, light: 'day' },
  { id: 'hold', a: 470, b: 725, light: 'day' },
  { id: 'drop', a: 726, b: 915, light: 'day' },
  { id: 'guys', a: 916, b: 1087, light: 'day' },
  { id: 'cold', a: 1088, b: 1274, light: 'day' },
  { id: 'payoff', a: 1275, b: 1608, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));

// ---------- lights (same palettes as the soldier example) ----------
export const LIGHTS = {
  day: { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#2c6c8c', waterShal: '#5aaec4', glint: '#effaff', vig: 0.2, shadowExt: 18 },
  golden: { az: 8, el: 9, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e',
    glint: '#ffe2a8', vig: 0.26, shadowExt: 18 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- cameras: keys { f, pos, look, fov, roll }. Smootherstep glides; every hold creeps. ----------
const SOL = [-21.5, DECK, 0];
const CAMS = {
  hook: [
    { f: 0, pos: [-18.6, 7.5, 1.0], look: [-21.5, 7.05, 0], fov: 40 },
    { f: 221, pos: [-19.4, 7.55, 0.7], look: [-21.5, 7.05, 0], fov: 38 },
  ],
  name: [
    { f: 222, pos: [-16.5, 7.4, -1.2], look: [-21.5, 7.05, 0], fov: 38 },
    { f: 469, pos: [-17.0, 7.35, -0.9], look: [-21.5, 7.05, 0], fov: 36 },
  ],
  hold: [
    { f: 470, pos: [-15.0, 7.6, 1.6], look: [-21.0, 7.0, -0.25], fov: 40 },
    { f: 725, pos: [-15.8, 7.5, 1.3], look: [-21.0, 7.0, -0.25], fov: 38 },
  ],
  drop: [
    { f: 726, pos: [-15.0, 7.3, 1.0], look: [-21.5, 6.95, 0], fov: 34 },
    { f: 915, pos: [-16.5, 7.35, 0.6], look: [-21.5, 6.95, 0], fov: 30 },
  ],
  guys: [
    { f: 916, pos: [-14.0, 7.65, 1.6], look: [-21.5, 7.0, 0], fov: 44 },
    { f: 1087, pos: [-15.5, 7.5, 1.0], look: [-21.5, 7.0, 0], fov: 40 },
  ],
  cold: [
    { f: 1088, pos: [-16.0, 7.5, -1.5], look: [-21.5, 7.1, 0], fov: 40 },
    { f: 1274, pos: [-17.0, 7.45, -1.0], look: [-21.5, 7.1, 0], fov: 38 },
  ],
  payoff: [
    { f: 1275, pos: [-28.5, 10.8, 9.5], look: [-19.8, 6.7, -0.3], fov: 46 },
    { f: 1608, pos: [-26.5, 10, 8.5], look: [-19.8, 6.7, -0.3], fov: 44 },
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

// ---------- world state: no collapse, no ageing, no helmet ----------
export const worldAt = (f) => ({ collapse: 0, banner: 'fall', bannerFall: 0, old: false, braceFall: 0, helmet: null });

// ---------- actors: narrator civA in EVERY shot ----------
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const tint = S.light === 'golden' ? '#ffe2c8' : '#ffffff';
  const narr = (o, pos = SOL, extra = {}) => out.push(R(T, 'civA', { seed: 11, blink: blinkAt(f, 11), ...o }, pos, { tint, ...extra }));
  switch (S.id) {
    case 'hook': {
      // shiver: tiny alternating head tilt while he asks the hook question
      narr({ expr: 'shock', headTilt: f % 2 ? 2 : -2, look: 0.3 });
      break;
    }
    case 'name': {
      narr({ expr: 'neutral', L: 'point', R: 'hang', look: 0.5 });
      break;
    }
    case 'hold': {
      // two halves of the nervous system bracing against each other
      narr({ expr: 'stubborn', L: 'belly', R: 'belly', look: 0.4 });
      out.push(R(T, 'toga', { seed: 21, expr: 'stubborn', L: 'belly', R: 'belly', facing: -1, blink: blinkAt(f, 21) }, [-20.3, DECK, -0.5], { tint }));
      break;
    }
    case 'drop': {
      narr({ expr: 'shock', look: 0.3 });
      break;
    }
    case 'guys': {
      narr({ expr: 'grin', L: 'point', R: 'hang', look: 0.5 });
      out.push(R(T, 'civB', { seed: 32, expr: 'laugh', L: 'belly', R: 'belly', facing: -1, bob: q(Math.abs(Math.sin(f * 0.55)) * 0.025, 3), blink: blinkAt(f, 32) }, [-20.8, DECK, -0.8], { tint }));
      out.push(R(T, 'civC', { seed: 33, expr: 'laugh', L: 'belly', R: 'belly', facing: 1, bob: q(Math.abs(Math.sin(f * 0.55 + 1)) * 0.025, 3), blink: blinkAt(f, 33) }, [-22.5, DECK, 0.8], { tint }));
      break;
    }
    case 'cold': {
      narr({ expr: 'squint', headTilt: f % 2 ? 1.5 : -1.5, look: 0.3 });
      break;
    }
    case 'payoff': {
      // shrug it off, then wave at the CTA
      const wv = f > 1450 ? Math.sin(f * 0.5) : 0;
      narr({ expr: f > 1450 ? 'grin' : 'smile', R: f > 1450 ? 'wave' : 'hang', wv, look: 0.4 });
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'drop') {
    // falling drips as the pressure drops
    for (let i = 0; i < 3; i++) { const t = ((f - 726) * 0.03 + i * 0.37) % 1; out.push(FX('drop', (p) => T.fxDrip(p), [-23 + i * 2.2, 8.6 - t * 3.4, 1.2], 0.12)); }
  }
  if (S.id === 'cold') {
    // cold air blowing through: leaves streaming past
    for (let i = 0; i < 9; i++) {
      const t = ((f - 1088) * 0.012 + i / 9) % 1, cols = ['#d9822b', '#c4452c', '#e6b13a'];
      const x = -24 + t * 7 + Math.sin(i * 3.1) * 0.6, y = DECK + 3.2 - t * 3.4 + Math.sin(t * 9 + i) * 0.25, z = -1.5 + i * 0.45;
      out.push(FX('leaf' + i % 3, (p) => T.fxLeaf(p, cols[i % 3]), [x, y, z], 0.12, { roll: q(t * 8 + i, 1) }));
    }
  }
  return out;
};

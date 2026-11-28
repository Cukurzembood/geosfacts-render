// kit-051-3d-v7 HYBRID plates — photorealistic full-screen backgrounds.
//
// The world is LIVE ACTION now (Shanty 28 Nov 21:52, "Iya, gas v7"): the
// nerd stays 3D cartoon, but the bedroom and the nose illustrations are
// PHOTO plates, composited behind him / behind the mechanism overlays.
//
// How it works: two camera-parented planes (plateA / plateB) at a
// per-frame depth BEHIND the nearest 3D subject (nerd root + 2 m in
// presenter shots, 8 m in illustration shots), MeshBasicMaterial (unlit
// — the photo is the light), depthTest true so the nerd / overlays show
// through it, depthWrite false, renderOrder -1, ndSkip (hidden in the
// normal-depth pass, so they draw no ink).
//
// Plates (web/plates/, all 9:16):
//   bedroom-night.webp — photorealistic night bedroom, EMPTY bed, moon
//     window left, warm lamp right (generated for v7, matches the
//     live-action hook-test look).
//   nose-turbinates.webp — v2 storyboard shot 2, human boy REMOVED by
//     generative edit (mucosa floor filled in).
//   nose-gravity.webp — v2 storyboard shot 3, boy removed the same way.
//   nose-swell.webp — v2 storyboard shot 4, boy removed the same way.
//   nose-cycle.webp — generated for v7: left turbinate swollen shut,
//     right passage open with blue airflow. The swap at f1048 crossfades
//     to a HORIZONTALLY MIRRORED copy of the same plate (cycleM) —
//     same photo, sides flipped, so the blockage visibly swaps sides.
// Motion on static plates (honest, no faking):
//   shot 4 swell = crossfade nose-turbinates -> nose-swell across the
//     shot (slim photo -> swollen photo = the swell, in real tissue).
//   shot 5 swap = 1 s crossfade to the mirrored plate at f1048.
//   shots 2/3/5 keep the 3D airflow streams + falling blood drips from
//     worlds.js as motion overlays (the 3D scrolls/septum/panel/stage/
//     pool are HIDDEN in v7 — the plate IS the turbinates now).
//   every shot gets the Ken Burns push above.
import * as THREE from './lib/three.module.js';
import { shotAt } from './story.js';

export const PLATE_FILES = {
  bedroom: 'plates/bedroom-night.webp',
  nose2: 'plates/nose-turbinates.webp',
  nose3: 'plates/nose-gravity.webp',
  nose4: 'plates/nose-swell.webp',
  cycle: 'plates/nose-cycle.webp',
};

// Per-shot framing. ox/oy shift the plate in camera space (metres at
// z -3.5) to align the photo bed with the nerd; zoom is the base scale
// (Ken Burns adds up to +0.03 across the shot). Tune from stills.
export const PLATE_SHOTS = {
  hook: { tex: 'bedroom', ox: 0, oy: 0, zoom: 1.0 },
  turbinates: { tex: 'nose2', ox: 0, oy: 0, zoom: 1.0 },
  standup: { tex: 'nose3', ox: 0, oy: 0, zoom: 1.0 },
  lieflat: { tex: 'nose2', ox: 0, oy: 0, zoom: 1.0 },
  cycle: { tex: 'cycle', ox: 0, oy: 0, zoom: 1.0 },
  rollover: { tex: 'bedroom', ox: 0, oy: 0, zoom: 1.0 },
  payoff: { tex: 'bedroom', ox: 0, oy: 0, zoom: 1.0 },
};

const DIST = 8.0; // default plate depth in camera space (illustration
// shots: the 3D overlays sit 3-8 m out, so 8 m is behind all of them)
const ASPECT = 1080 / 1920;

const mkPlate = () => {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    // v7 r2: depthTest TRUE — round 1 had depthTest false, so the plate
    // painted OVER the nerd (he was invisible in every presenter
    // still). With depthTest true the plate tests against the depth the
    // nerd wrote in the opaque pass, so the nerd shows through it. The
    // plate sits BEHIND the nearest 3D subject (see updatePlates DIST),
    // so the test only ever hides plate pixels the nerd covers.
    // depthWrite stays false (two crossfading plates must not occlude
    // each other) and transparent stays true (crossfade opacities).
    new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthTest: true, depthWrite: false })
  );
  m.renderOrder = -1;
  m.userData.ndSkip = true;
  m.position.set(0, 0, -DIST);
  m.visible = false;
  return m;
};
export const plateA = mkPlate();
export const plateB = mkPlate();
export const plateMeshes = [plateA, plateB];

// --- texture loading (async: window.ready waits on platesReady) ---
const loader = new THREE.TextureLoader();
const textures = {};
export const platesReady = new Promise((resolve, reject) => {
  const names = Object.keys(PLATE_FILES);
  let done = 0;
  for (const n of names) {
    loader.load(PLATE_FILES[n], (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      textures[n] = t;
      if (++done === names.length) {
        // mirrored cycle plate for the swap (same photo, flipped)
        const cm = textures.cycle.clone();
        cm.wrapS = THREE.RepeatWrapping;
        cm.repeat.x = -1;
        cm.needsUpdate = true;
        textures.cycleM = cm;
        resolve(textures);
      }
    }, undefined, () => reject(new Error('plate load failed: ' + PLATE_FILES[n])));
  }
});

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

const place = (mesh, name, opacity, w, h, ox, oy, dist) => {
  if (!name || opacity <= 0.001 || !textures[name]) { mesh.visible = false; return; }
  const mat = mesh.material;
  if (mat.map !== textures[name]) { mat.map = textures[name]; mat.needsUpdate = true; }
  mat.opacity = opacity;
  mesh.visible = true;
  mesh.scale.set(w, h, 1);
  mesh.position.set(ox, oy, -dist);
};

// Per-frame plate state. Called from main.js renderFrame AFTER the camera
// is placed (fov must be final). f = global frame, S = shotAt(f), C = camAt(f),
// nerdDist = distance camera -> nerd root (0 when the nerd is absent).
export function updatePlates(f, S, C, nerdDist = 0) {
  const cfg = PLATE_SHOTS[S.id] || PLATE_SHOTS.hook;
  // Plate depth: BEHIND the nearest 3D subject, so the depth test lets
  // the subject show through. Presenter shots: nerd root + 2 m margin
  // (his body extends ~1.75 m from the root, worst case toward the lens).
  // Illustration shots (no nerd): 8 m, behind the airflow/blood overlays.
  const dist = nerdDist > 0 ? nerdDist + 2 : DIST;
  // Ken Burns: slow push-in across the shot (1.00 -> 1.03)
  const prog = clamp01((f - S.a) / Math.max(1, S.b - S.a));
  const zoom = (cfg.zoom || 1) * (1 + 0.03 * prog);
  const h = 2 * dist * Math.tan(THREE.MathUtils.degToRad(C.fov) / 2) * zoom;
  const w = h * ASPECT;
  let a = null, b = null, oa = 0, ob = 0;
  if (S.id === 'lieflat') {
    // swell = crossfade slim photo -> swollen photo across the shot
    const p = smooth((f - 697) / (940 - 697));
    a = 'nose2'; oa = 1 - p; b = 'nose4'; ob = p;
  } else if (S.id === 'cycle') {
    // swap = 1 s crossfade to the mirrored plate at f1048
    const p = clamp01((f - 1048) / 30);
    a = 'cycle'; oa = 1 - p; b = 'cycleM'; ob = p;
  } else {
    a = cfg.tex; oa = 1;
  }
  place(plateA, a, oa, w, h, cfg.ox, cfg.oy, dist);
  place(plateB, b, ob, w, h, cfg.ox, cfg.oy, dist);
}

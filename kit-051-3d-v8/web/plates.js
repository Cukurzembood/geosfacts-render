// kit-051-3d-v8 HYBRID plates — photorealistic full-screen backgrounds.
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

// v8 swell mask: a 540x960 canvas used as plateB's alphaMap in the
// lieflat shot. The swollen photo does NOT dissolve in globally — it
// grows OUT OF the turbinate folds: white radial blobs centred on the
// four swollen masses (positions read off nose-swell.webp: left upper
// (0.24,0.36), left mid (0.28,0.55), right upper (0.72,0.40), right mid
// (0.78,0.58)), radius growing 0.05 -> 0.33 of the frame width as the
// swell progresses. Canvas coords = screen coords (flipY puts the
// canvas top at the plane top), so the mask stays registered to the
// plate. Black = slim photo shows, white = swollen photo shows.
const maskCv = document.createElement('canvas'); maskCv.width = 540; maskCv.height = 960;
const maskCtx = maskCv.getContext('2d');
const maskTex = new THREE.CanvasTexture(maskCv);
const SWELL_BLOBS = [ // [x, y, radius multiplier] — 7 blobs, not 4: the
  // growth front must be IRREGULAR. r1's 4 equal circles left a visible
  // circular cut across the tunnel (f800: a red ball with a hard round
  // edge). r2: overlapping blobs of different sizes + a much softer
  // falloff (white only in the inner 45%), so the edge dissolves into
  // the slim photo instead of cutting it.
  [0.24, 0.34, 1.0], [0.28, 0.55, 1.15], [0.20, 0.68, 0.8],
  [0.72, 0.38, 1.0], [0.78, 0.58, 1.15], [0.84, 0.70, 0.8],
  [0.50, 0.30, 0.7]];
function drawSwellMask(p) {
  maskCtx.fillStyle = '#000'; maskCtx.fillRect(0, 0, 540, 960);
  const r0 = (0.04 + 0.26 * p) * 540;
  for (const [fx, fy, mult] of SWELL_BLOBS) {
    const r = r0 * mult;
    const gr = maskCtx.createRadialGradient(fx * 540, fy * 960, 0, fx * 540, fy * 960, r);
    gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, '#ccc'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    maskCtx.fillStyle = gr;
    maskCtx.beginPath(); maskCtx.arc(fx * 540, fy * 960, r, 0, 7); maskCtx.fill();
  }
  maskTex.needsUpdate = true;
}

const place = (mesh, name, opacity, w, h, ox, oy, dist, scaleMul = 1) => {
  if (!name || opacity <= 0.001 || !textures[name]) { mesh.visible = false; return; }
  const mat = mesh.material;
  if (mat.map !== textures[name]) { mat.map = textures[name]; mat.needsUpdate = true; }
  mat.opacity = opacity;
  mesh.visible = true;
  mesh.scale.set(w * scaleMul, h * scaleMul, 1);
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
  let a = null, b = null, oa = 0, ob = 0, bulge = 1;
  if (S.id === 'lieflat') {
    // v8 SWELL = a growing morph, not a dissolve. plateB (swollen photo)
    // is revealed by the alpha mask growing out of the turbinate folds
    // (drawSwellMask), plus a 0->3% bulge zoom on plateB so the masses
    // also push toward the lens as they grow. At p=1 the mask covers
    // the frame and the swollen photo fully owns it.
    const p = smooth((f - 697) / (940 - 697));
    a = 'nose2'; oa = 1; b = 'nose4'; ob = 1; bulge = 1 + 0.03 * p;
    drawSwellMask(p);
    if (plateB.material.alphaMap !== maskTex) { plateB.material.alphaMap = maskTex; plateB.material.needsUpdate = true; }
  } else if (S.id === 'cycle') {
    // v8 SWAP = a left->right wipe, not a dissolve. plateB (mirrored
    // cycle photo) is revealed by a plane that grows from the left edge:
    // width w*p, texture repeat -p / offset 1 so the image is NOT
    // stretched — the left p fraction of the mirrored photo shows. The
    // fx2d overlay draws a soft bright edge riding the wipe boundary.
    a = 'cycle'; oa = 1; b = 'cycleM'; ob = 1;
    if (plateB.material.alphaMap) { plateB.material.alphaMap = null; plateB.material.needsUpdate = true; }
  } else {
    a = cfg.tex; oa = 1;
    if (plateB.material.alphaMap) { plateB.material.alphaMap = null; plateB.material.needsUpdate = true; }
  }
  place(plateA, a, oa, w, h, cfg.ox, cfg.oy, dist);
  place(plateB, b, ob, w, h, cfg.ox, cfg.oy, dist, bulge);
  if (S.id === 'cycle') {
    const p = clamp01((f - 1048) / 30);
    if (p <= 0) { plateB.visible = false; }
    else {
      // anchor the narrowed plateB to the LEFT frame edge and sample
      // only the left p fraction of the mirrored texture (repeat -p,
      // offset 1: sampled u in [1-p, 1] = mirrored image's left part).
      const wB = w * p;
      plateB.scale.set(wB, h, 1);
      plateB.position.set(cfg.ox - w / 2 + wB / 2, cfg.oy, -dist);
      const cm = textures.cycleM;
      if (cm && (cm.repeat.x !== -p || cm.offset.x !== 1)) { cm.repeat.x = -p; cm.offset.x = 1; cm.needsUpdate = true; }
    }
  }
}

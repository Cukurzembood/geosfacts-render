// kit-051-3d-v8 — explainer motion overlay (Shanty 28 Nov 23:05:
// "Explainer nya jgn cuma gambar di tempel"). Shots 2-5 must MOVE, not
// sit as a still photo under a Ken Burns push.
//
// v8.1 (28 Nov, parent-verified defects in the rendered v8 MP4):
//   1. the wipe edge line is GONE (it was the grey bar at f1050/f1063);
//      the wipe boundary is softened in plates.js instead.
//   2. overlays MUCH stronger/faster: v8's wisps measured identical
//      1 s-pair diffs (7.88 / 7.88 = pure zoom) — numerically invisible.
//      Now ~2.5x alpha, wider, ~2x speed, more wisps, bigger drops,
//      wobbling pool edge; the 1 s diff must beat the FX_OFF baseline.
//
// How it works: a 540x960 2D canvas, drawn fresh every frame, on a
// camera-parented plane at z -3.5 sized to fill the frame (like the
// pop-up billboards, but full-frame and BELOW them: renderOrder 998 vs
// pop-ups 999). The drawing is in the plates' own painted style —
// wispy pale-blue airflow streaks that follow the plates' painted
// streams, and dark-red blood drops that fall from the turbinate folds
// into a slowly growing pool. Nothing 3D: the v7 3D airflow rods and
// blood capsules read as fake grey pills (v7 round 1), so the motion
// lives in 2D, painted to match.
//
// Canvas coordinates are screen fractions (x 0..1 left->right, y 0..1
// top->bottom), mapped from the v7 stills: shot 2's painted stream runs
// bottom-centre -> top-right; shot 3's blood drips off both fold walls
// into a pool at the bottom; shot 4's stream is a thin slit down the
// centre; shot 5's open passage is RIGHT before the swap, LEFT after.
// The Ken Burns push moves the plate by at most ~1.5%, so the overlay
// stays registered to the plate features throughout each shot.
//
// updateFx(f, S, C) is called from main.js renderFrame AFTER the camera
// is placed (it needs C.fov to size the plane). Hidden outside
// illustration shots.
import * as THREE from './lib/three.module.js';

const W = 540, H = 960;
const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');
const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
export const fxMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthTest: false })
);
fxMesh.renderOrder = 998;
fxMesh.userData.ndSkip = true; // hidden in the normal-depth pass: no ink
fxMesh.visible = false;
fxMesh.position.set(0, 0, -3.5);

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const lerp = (a, b, t) => a + (b - a) * t;
// quadratic bezier point
const qbez = (p0, p1, p2, t) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
          u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};

// One airflow streak: a short segment of a bezier path, drifting along
// it and looping. path = [p0, p1, p2] in screen fractions. t0 advances
// with time; the segment [t0, t0+len] is drawn soft + bright core.
// r1 drew this as a UNIFORM-WIDTH, HIGH-ALPHA line — it read as a grey
// ROD (the v7 3D-rod failure, in 2D). r2: the segment is drawn piece by
// piece with alpha + width TAPERING at both ends (fade in at the tail,
// fade out at the head) and three passes (wide faint halo, mid, hairline
// core), so it reads as a wisp of air, not a stick. The paths are also
// much curvier now (strong S-bend) so the curve itself is visible.
function streak(path, phase, speed, f, len = 0.22, wob = 0.02) {
  const t0 = (((f / 30) * speed + phase) % 1 + 1) % 1;
  const N = 14;
  const pts = [], seg = [];
  for (let i = 0; i <= N; i++) {
    const t = t0 + (i / N) * len;
    const tt = t > 1 ? t - 1 : t; // wrap: the stream loops
    seg.push(t > 1 ? 1 : 0);
    const [x, y] = qbez(path[0], path[1], path[2], tt);
    pts.push([x * W + Math.sin(tt * 22 + phase * 40 + f * 0.06) * wob * W, y * H]);
  }
  // taper envelope: 0 at both ends, 1 in the middle
  const env = (i) => Math.sin((i / N) * Math.PI);
  const pass = (width, alpha, col) => {
    g.strokeStyle = col; g.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      // r8 fix: a segment straddling the t=1 wrap used to draw a long
      // straight chord from the path END back to its START (the full-
      // height "scratch" line in r2/r5 f300). Skip that piece.
      if (seg[i] !== seg[i + 1]) continue;
      g.globalAlpha = alpha * env(i + 0.5);
      g.lineWidth = width * (0.6 + 0.4 * env(i + 0.5));
      g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke();
    }
  };
  // v8.1: stronger than v8 — but r1 overshot the CORE (2.5 px at 0.55
  // read as solid white ropes/cords down the frame, the v7 "rod"
  // failure in white). r2: core back to a bright THREAD (2.0 px,
  // 0.35) — the halo + mid passes carry the wisp body, the core only
  // sparks the centre. Speed/count/length stay (they drive the
  // motion numbers); only the core brightness is cut.
  pass(12, 0.10, '#bcd8ff');
  pass(5, 0.20, '#cfe4ff');
  pass(2.0, 0.35, '#e8f2ff');
  g.globalAlpha = 1;
}

// A blood drop falling from a fold (x0,y0) with gravity: y grows as
// tau^2 over a ~2.6 s fall, then it vanishes into the pool. Drawn as a
// teardrop with a thin rivulet trail back to its fold, same dark red as
// the plate's painted blood (#8f0f14 core, #c02020 edge light).
function drop(x0, y0, fallH, phase, f, dur = 78) {
  const tau = (((f / 30) * (30 / dur) + phase) % 1 + 1) % 1; // 0..1 over the fall
  const y = y0 + fallH * tau * tau;
  const x = x0 + 0.012 * Math.sin(tau * 9 + phase * 20) * W / W; // tiny sway, fractions
  const px = x * W, py = y * H;
  // v8.1: drops BIGGER (r 6-13 px on the half-res canvas = 12-26 px on
  // screen, was 4-9) with a thicker, stronger trail — v8's drops were
  // near-invisible against the painted drips.
  const r = (6 + 7 * tau);
  const a = tau < 0.06 ? tau / 0.06 : (tau > 0.92 ? (1 - tau) / 0.08 : 1);
  // rivulet trail from the fold down to the drop
  g.strokeStyle = '#a01418'; g.lineWidth = 4; g.globalAlpha = 0.55 * a;
  g.beginPath(); g.moveTo(x0 * W, y0 * H); g.lineTo(px, py - r); g.stroke();
  // teardrop body
  g.globalAlpha = 0.92 * a;
  g.fillStyle = '#8f0f14';
  g.beginPath();
  g.moveTo(px, py - r * 1.7);
  g.quadraticCurveTo(px + r, py - r * 0.2, px + r * 0.85, py + r * 0.4);
  g.quadraticCurveTo(px + r * 0.5, py + r * 1.05, px, py + r * 1.05);
  g.quadraticCurveTo(px - r * 0.5, py + r * 1.05, px - r * 0.85, py + r * 0.4);
  g.quadraticCurveTo(px - r, py - r * 0.2, px, py - r * 1.7);
  g.fill();
  // wet highlight
  g.globalAlpha = 0.55 * a; g.fillStyle = '#ff7070';
  g.beginPath(); g.arc(px - r * 0.3, py - r * 0.25, r * 0.28, 0, 7); g.fill();
  g.globalAlpha = 1;
}

export function updateFx(f, S, C) {
  const id = S.id;
  const illustr = id === 'turbinates' || id === 'standup' || id === 'lieflat' || id === 'cycle';
  // v8.1 debug hook: FX_OFF=1 (set by render.mjs from the FX_OFF env
  // var) hides the overlay so a zoom-only baseline pair can be
  // rendered for the motion measurement. Production never sets it.
  if (window.FX_OFF) { fxMesh.visible = false; return; }
  if (!illustr) { fxMesh.visible = false; return; }
  // size the plane to exactly fill the frame at z -3.5 for this shot's fov
  const halfH = 3.5 * Math.tan(THREE.MathUtils.degToRad(C.fov) / 2);
  const halfW = halfH * (1080 / 1920);
  fxMesh.scale.set(halfW * 2, halfH * 2, 1);
  fxMesh.visible = true;
  g.clearRect(0, 0, W, H);

  if (id === 'turbinates') {
    // Shot 2: airflow visibly flowing. The plate's painted stream runs
    // bottom-centre up to top-right in a big S-sweep; the overlay bundle
    // follows the same curve (control point pulled LEFT mid-way so the
    // bend is visible), 6 wisps staggered so the passage never looks
    // empty. r2: curvier path + tapered wisps (was: near-straight rods).
    const path = [[0.40, 0.86], [0.26, 0.45], [0.72, 0.10]];
    // v8.1: 9 wisps (was 6), speed 0.55 (was 0.30), len 0.30 (was
    // 0.22) — a wisp now travels ~half the path in 1 s, so 1 s-apart
    // frames visibly differ beyond the zoom.
    for (let i = 0; i < 9; i++) {
      const off = (i - 4) * 0.022;
      streak([[path[0][0] + off, path[0][1]], [path[1][0] + off * 1.2, path[1][1]], [path[2][0] + off * 1.3, path[2][1]]],
        i * 0.11, 0.55, f, 0.30);
    }
  } else if (id === 'standup') {
    // Shot 3: blood visibly draining. Drops fall from both fold walls
    // (spawn points read off f600: left folds x~0.30-0.33, right folds
    // x~0.74-0.77) all the way down into the pool, which rises from the
    // bottom edge across the shot. A faint airflow fan still drifts
    // down-right behind them.
    const arc = [[0.36, 0.38], [0.55, 0.62], [0.78, 0.88]];
    // v8.1: 6 streaks at 0.45 (was 4 at 0.20).
    for (let i = 0; i < 6; i++) streak([[arc[0][0] + (i - 2.5) * 0.03, arc[0][1]], [arc[1][0] + (i - 2.5) * 0.02, arc[1][1]], [arc[2][0] + (i - 2.5) * 0.04, arc[2][1]]], i * 0.18, 0.45, f, 0.25);
    const prog = clamp01((f - 457) / (696 - 457));
    const spawns = [[0.30, 0.52], [0.335, 0.62], [0.285, 0.70], [0.745, 0.50], [0.77, 0.60], [0.72, 0.68]];
    spawns.forEach(([x, y], i) => drop(x, y, 0.90 - y, i * 0.17 + 0.05, f, 60)); // v8.1: 60-frame falls (was 78) — drops visibly descend within 1 s
    // pool: r1 drew a flat red DISC mid-frame — a cartoon sticker on
    // the photo. r2: liquid rising from below the frame edge — a wide
    // ellipse centred just under the bottom edge, so only its top arc
    // shows, growing wider/taller with prog. v8.1: the arc WOBBLES
    // (rx/ry breathing with f) so the pool edge itself moves frame to
    // frame, not just grows over the shot.
    const wob = Math.sin(f * 0.15);
    const rx = (0.26 + 0.07 * prog + 0.012 * wob) * W, ry = (0.055 + 0.008 * Math.sin(f * 0.15 + 1)) * H;
    g.globalAlpha = 0.80; g.fillStyle = '#5f0b10';
    g.beginPath(); g.ellipse(0.5 * W, 1.04 * H, rx, ry, 0, 0, 7); g.fill();
    g.globalAlpha = 0.30; g.fillStyle = '#a02020';
    g.beginPath(); g.ellipse(0.47 * W, 1.03 * H, rx * 0.6, ry * 0.5, 0, 0, 7); g.fill();
    g.globalAlpha = 1;
  } else if (id === 'lieflat') {
    // Shot 4: the swell. The stream through the centre slit gets
    // NARROWER and FASTER as the swell progresses (p 0->1) — the airway
    // visibly choking. The tissue growth itself is the plates.js alpha
    // mask (swollen photo growing out of the folds); the streaks sell
    // the narrowing. 5 wisps, x-spread shrinking with p, slight S-bend.
    const p = clamp01((f - 697) / (940 - 697));
    const spread = lerp(0.055, 0.010, p);
    // v8.1: 7 wisps at 0.50->0.80 (was 5 at 0.30->0.52), len 0.26
    // (was 0.18) — the choking stream must read in 1 s-apart frames.
    const speed = lerp(0.50, 0.80, p);
    for (let i = 0; i < 7; i++) {
      const off = (i - 3) * spread;
      streak([[0.50 + off, 0.40], [0.50 - off * 0.5, 0.58], [0.50 + off * 0.3, 0.76]], i * 0.14, speed, f, 0.26, 0.012);
    }
  } else if (id === 'cycle') {
    // Shot 5: the cycle swap. Before the wipe the OPEN passage is RIGHT
    // (painted streams on the right, f1000); after it, LEFT. The overlay
    // stream's home side follows the wipe, so the air visibly moves to
    // the other nostril as the swap crosses. v8.1: the soft bright edge
    // that used to ride the wipe boundary is GONE (it was the grey bar
    // in the v8 MP4); the boundary is softened in plates.js instead.
    const p = clamp01((f - 1048) / 30);
    const cx = lerp(0.72, 0.28, p); // open-side centre x
    const dir = p < 0.5 ? 1 : -1;   // streams sweep down-outward
    // v8.1: 8 wisps at 0.55, len 0.28 (was 6 at 0.30, len 0.20).
    for (let i = 0; i < 8; i++) {
      const off = (i - 3.5) * 0.020;
      streak([[cx + off, 0.28], [cx + off + dir * 0.03, 0.58], [cx + off + dir * 0.09, 0.88]], i * 0.12, 0.55, f, 0.28);
    }
    // v8.1: NO edge line is drawn at the wipe boundary. v8 drew a soft
    // bright line + glow riding it — in the rendered v8 MP4 that WAS the
    // bar (full-height grey/white line at the wipe position: left edge
    // at f1050, dead centre at f1063). The boundary is now softened in
    // plates.js (plateB alpha-fade), so nothing is drawn here.
  }
  tex.needsUpdate = true;
}

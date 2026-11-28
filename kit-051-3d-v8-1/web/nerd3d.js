// 3D semi-realistic nerd bookworm (kit-051-3d) — a REAL 3D figure built
// from primitives, not a painted card. LOCKED design (Shanty 2026-11-25):
// big round white head, tiny dot eyes, big round glasses, mustard sweater
// vest over a white shirt, stick arms/legs as thin cylinders, always
// carrying books. No red-white striped shirt, no pink blush, no big anime
// eyes. Semi-realistic = MeshStandardMaterial, soft shadows, no ink
// outlines; the head is a sphere the camera can orbit, the body has
// volume, the mouth opens in 3D with the VO.
//
// Figure is ~1.75 m tall, origin at the soles (feet), facing +z.
// Structure: root (position + roll about the bed axis) -> inner (pose
// rotation: upright / lying / sitting) -> parts. Parts are named on the
// returned group: head, eyeL, eyeR, mouthOpen, mouthSmile, mouthFlat,
// mouthShock, armR, armL, legL, legR, torso, bookStack, bookOpen,
// lapBlanket, glasses.
import * as THREE from './lib/three.module.js';

export const MUSTARD = '#d9a441';
export const SHIRT = '#f7f1e1';
export const PANTS = '#3b3f52';
export const SHOE = '#2e2a36';
export const MOUTH_DARK = '#5a1e28';
const BOOK_COLS = ['#c0392b', '#2f6a43', '#3f6fb5'];

const std = (color, roughness = 0.75, extra = {}) =>
  // v8: envMapIntensity 0.55 -> 0.30 — the v7 nerd glowed against the dark
  // photo room (Shanty: "cuma gambar di tempel"). Less IBL sheen everywhere.
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, envMapIntensity: 0.30, ...extra });
const skinWhite = () => std('#e9dfc8', 0.55, { envMapIntensity: 0.35 }); // v8: was near-white #fdfcf6, roughness 0.38, env 0.75 — the head was the brightest thing in the room. Now a warm dim cream, lit BY the room, not glowing on top of it.
const dark = (c = '#241f1c') => std(c, 0.35, { metalness: 0.35 });

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}

export function buildNerd() {
  const root = new THREE.Group();          // position + roll (bed axis)
  const inner = new THREE.Group();         // pose rotation
  root.add(inner); root.userData.inner = inner;
  const P = {}; root.userData.parts = P;

  // ---- head (big round white sphere, slightly squashed) ----
  const head = new THREE.Group(); head.position.set(0, 1.47, 0); inner.add(head);
  P.head = head;
  mesh(new THREE.SphereGeometry(0.30, 48, 32), skinWhite(), 0, 0, 0, head).scale.set(1, 0.96, 0.94);
  // tiny dot eyes (small dark spheres, slightly embedded in the face)
  P.eyeL = mesh(new THREE.SphereGeometry(0.032, 16, 12), dark(), -0.115, 0.03, 0.272, head);
  P.eyeR = mesh(new THREE.SphereGeometry(0.032, 16, 12), dark(), 0.115, 0.03, 0.272, head);
  // big round glasses: two tori + bridge + temples
  const glassM = dark('#1c1a18');
  for (const s of [-1, 1]) {
    const lens = mesh(new THREE.TorusGeometry(0.088, 0.013, 10, 40), glassM, s * 0.115, 0.03, 0.278, head);
    lens.rotation.x = 0.06;
    const temple = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.24, 8), glassM, s * 0.21, 0.05, 0.16, head);
    temple.rotation.x = Math.PI / 2 - 0.12; temple.rotation.z = s * 0.08;
  }
  const bridge = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 8), glassM, 0, 0.03, 0.28, head);
  bridge.rotation.z = Math.PI / 2;
  // mouths (only one visible at a time): open (VO-driven), smile arc,
  // flat line, shock circle. All sit on the lower face.
  P.mouthOpen = mesh(new THREE.SphereGeometry(0.05, 20, 14), std(MOUTH_DARK, 0.5), 0, -0.13, 0.27, head);
  P.mouthOpen.scale.set(1, 0.5, 0.45);
  const smile = mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 24, Math.PI), dark(), 0, -0.10, 0.272, head);
  smile.rotation.z = Math.PI; // arc opening upward = smile curve
  P.mouthSmile = smile;
  P.mouthFlat = mesh(new THREE.BoxGeometry(0.11, 0.014, 0.01), dark(), 0, -0.13, 0.278, head);
  P.mouthShock = mesh(new THREE.SphereGeometry(0.038, 16, 12), std(MOUTH_DARK, 0.5), 0, -0.13, 0.272, head);
  P.mouthShock.scale.set(1, 1.25, 0.5);
  // one raised brow (thin box) for the thinking face
  P.brow = mesh(new THREE.BoxGeometry(0.09, 0.014, 0.01), dark(), 0.11, 0.16, 0.28, head);
  P.brow.rotation.z = 0.18;

  // ---- neck + torso: mustard sweater vest over a white shirt ----
  mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 16), std(SHIRT, 0.7), 0, 1.13, 0, inner);
  const torso = new THREE.Group(); torso.position.set(0, 0.86, 0); inner.add(torso);
  P.torso = torso;
  const vest = mesh(new THREE.CapsuleGeometry(0.185, 0.30, 8, 24), std(MUSTARD, 0.85), 0, 0, 0, torso);
  vest.scale.set(1.05, 1, 0.82);
  // white shirt V at the chest + collar
  const shirtV = mesh(new THREE.CylinderGeometry(0.10, 0.05, 0.16, 12), std(SHIRT, 0.7), 0, 0.17, 0.115, torso);
  shirtV.scale.set(1, 1, 0.5); shirtV.rotation.x = 0.15;
  const collar = mesh(new THREE.TorusGeometry(0.105, 0.02, 8, 24), std(SHIRT, 0.7), 0, 0.235, 0, torso);
  collar.rotation.x = Math.PI / 2 - 0.25;
  // vest buttons
  for (const y of [0.05, -0.08]) mesh(new THREE.SphereGeometry(0.016, 10, 8), std('#8a6a1f', 0.4), 0, y, 0.165, torso);

  // ---- arms: THIN BLACK STICK arms (grid) + white mitten hands ----
  // v3: grid shows thin black stick limbs, not white shirt sleeves.
  const armGeo = new THREE.CylinderGeometry(0.020, 0.018, 0.46, 10);
  armGeo.translate(0, -0.23, 0); // pivot at the top
  const mkArm = (s) => {
    const g = new THREE.Group(); g.position.set(s * 0.20, 1.08, 0); inner.add(g);
    mesh(armGeo, dark('#1c1a18'), 0, 0, 0, g);
    mesh(new THREE.SphereGeometry(0.05, 14, 10), skinWhite(), 0, -0.47, 0, g);
    return g;
  };
  P.armL = mkArm(-1); P.armR = mkArm(1);

  // ---- legs: THIN BLACK STICK legs (grid) + shoe blobs ----
  const legGeo = new THREE.CylinderGeometry(0.026, 0.024, 0.52, 10);
  legGeo.translate(0, -0.26, 0);
  const mkLeg = (s) => {
    const g = new THREE.Group(); g.position.set(s * 0.09, 0.56, 0); inner.add(g);
    mesh(legGeo, dark('#1c1a18'), 0, 0, 0, g);
    const shoe = mesh(new THREE.SphereGeometry(0.075, 14, 10), std(SHOE, 0.6), 0, -0.53, 0.03, g);
    shoe.scale.set(1, 0.55, 1.5);
    return { g, shoe };
  };
  const legL = mkLeg(-1), legR = mkLeg(1);
  P.legL = legL.g; P.legR = legR.g; P.shoeL = legL.shoe; P.shoeR = legR.shoe;

  // ---- books: a stack tucked under the left arm, an open book for talks ----
  const stack = new THREE.Group(); stack.position.set(-0.30, 0.72, 0.10); inner.add(stack);
  P.bookStack = stack;
  BOOK_COLS.forEach((c, i) => {
    const b = mesh(new THREE.BoxGeometry(0.24 - i * 0.02, 0.055, 0.17), std(c, 0.7), 0, i * 0.06, 0, stack);
    b.rotation.y = (i - 1) * 0.06;
  });
  const open = new THREE.Group(); open.position.set(0, 0.82, 0.24); inner.add(open);
  P.bookOpen = open;
  for (const s of [-1, 1]) {
    const page = mesh(new THREE.BoxGeometry(0.16, 0.012, 0.22), std('#ffffff', 0.6), s * 0.085, 0, 0, open);
    page.rotation.z = s * -0.22;
  }
  mesh(new THREE.BoxGeometry(0.02, 0.014, 0.22), std('#c0392b', 0.7), 0, -0.005, 0, open);

  // ---- lap blanket (sit mode): coral half-ellipsoid over the hidden legs ----
  const lap = mesh(new THREE.SphereGeometry(0.34, 24, 16), std('#e8483f', 0.9), 0, 0.62, 0.10, inner);
  lap.scale.set(1.15, 0.62, 1.05);
  P.lapBlanket = lap;

  // ---- v8.1 blanket mound (lie mode): v8's drape was a GIANT red
  // cocoon in the hook close-up (f60 of the rendered v8 MP4: the mound
  // filled ~40% of the frame, bigger than the head — parent-verified).
  // Root cause: 0.20 m tall x 0.65 m long is a dome, not a drape, and
  // the hook camera sits at the foot end, so the mound's length
  // foreshortens straight at the lens. v8.1: DRASTIC shrink — 0.068 m
  // tall, 0.34 m long, 0.31 m wide, top (z 0.034) well BELOW the torso
  // front (z ~0.15), still long enough to reach the waist (y up to
  // 0.55) so the torso ends under blanket, not mid-air. The bed must
  // read as a BED with a subtle rise over the legs; the nerd + "?"
  // dominate the hook, not the blanket. Folds shrunk in proportion.
  const mound = mesh(new THREE.SphereGeometry(0.34, 24, 16), std('#7e3226', 1.0, { envMapIntensity: 0.10 }), 0, 0.30, 0.0, inner);
  mound.scale.set(0.45, 0.50, 0.10);
  P.blanketMound = mound;
  // v8.1 folds: low lumps ON the flattened drape (tops ~z 0.034, flush
  // with the mound top), not second domes.
  const fold1 = mesh(new THREE.SphereGeometry(0.34, 24, 16), std('#75301f', 1.0, { envMapIntensity: 0.10 }), 0.08, 0.20, 0.01, inner);
  fold1.scale.set(0.30, 0.32, 0.07);
  P.blanketFold1 = fold1;
  const fold2 = mesh(new THREE.SphereGeometry(0.34, 24, 16), std('#8e3a2c', 1.0, { envMapIntensity: 0.10 }), -0.09, 0.42, 0.01, inner);
  fold2.scale.set(0.28, 0.30, 0.07);
  P.blanketFold2 = fold2;

  return root;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** Pose the nerd for one frame. pose = {
 *  mode: 'stand' | 'lie' | 'sit', expr: 'smile'|'grin'|'shock'|'think'|'sleep',
 *  blink 0..1, mouth 0..1 (VO open amount), breath 0..1 (~4 s cycle),
 *  gest 0..1 (right-arm raise), roll 0..1 (rollover about the bed axis),
 *  book: 'stack'|'open'|'none', x,y,z (root position), yaw (facing) }.
 *  The caller owns root.position; this sets rotations + visibilities. */
export function poseNerd(root, pose) {
  const P = root.userData.parts, inner = root.userData.inner;
  const { mode = 'stand', expr = 'smile', blink = 0, mouth = 0, breath = 0, gest = 0, roll = 0, book = 'stack' } = pose;
  // root roll: rotating about the bed's long axis (world x) for rollover
  root.rotation.set(roll * 0.9, 0, 0);
  // inner pose rotation
  if (mode === 'lie') {
    // lying on his back: face up, head toward -x (headboard). R = Ry(90) * Rx(-90).
    inner.rotation.set(-Math.PI / 2, Math.PI / 2, 0, 'YXZ');
    inner.position.set(0, 0, 0);
  } else if (mode === 'sit') {
    inner.rotation.set(0, 0, 0);
    inner.position.set(0, 0, 0);
  } else {
    inner.rotation.set(0, 0, 0);
    inner.position.set(0, 0, 0);
  }
  // legs + lap blanket visibility
  const sitting = mode === 'sit', lying = mode === 'lie';
  // v7: legs are hidden in lie mode too (was: visible when lying) —
  // the 3D world blanket used to cover them; on the photo plate the
  // long stick legs dangle off the bed toward the floor and read as
  // floating stilts (round 3 f60/f120). Hidden, the mustard torso ends
  // mid-blanket and reads as tucked under it, like v6's blanket did.
  P.legL.visible = P.legR.visible = !sitting && !lying;
  P.shoeL.visible = P.shoeR.visible = !sitting && !lying; // shoes poke through the blanket when lying
  // v8: the rust blanket mound covers the waist/legs while lying, so the
  // body reads as UNDER the blanket instead of cut off at the torso.
  // The two fold bumps ride with it (same visibility).
  P.blanketMound.visible = lying;
  P.blanketFold1.visible = lying;
  P.blanketFold2.visible = lying;
  // v3: the world bed blanket already covers the lap in the payoff shot
  // — the lap blanket ellipsoid SWALLOWED the book stack (f=1600 round 1:
  // no books at all). Hide it when books are carried.
  P.lapBlanket.visible = sitting && book !== 'stack';
  // lying: arms rest at the sides, slightly out (they disappear under the
  // world blanket anyway); standing: left arm holds the book stack.
  P.armL.rotation.set(0, 0, lying ? 0.25 : -0.12);
  P.armR.rotation.set(0, 0, lying ? -0.25 : 0.12);
  // gesture / wave: standing talks with the right arm; sitting waves with
  // the LEFT arm (it is on the camera side in the payoff shot — the right
  // arm hides behind the torso from that angle)
  if (!lying) {
    const wave = mode === 'sit' ? Math.sin(pose.f * 0.5) * 0.35 : 0;
    if (pose.pointDown) {
      // v3: point forward-DOWN at the blood pool (gravity shot) — arm
      // swings forward from the shoulder, not up.
      P.armR.rotation.set(-1.05, 0, 0.3);
    } else if (mode === 'sit') {
      // v3 round 4: wave arc 2.0 — hand lands BESIDE the head (x +0.24,
      // y 1.20, just outside the head silhouette). Round 3's 1.4 left the
      // hand below the blanket top; round 2's 2.6 hid it behind the head.
      P.armL.rotation.z = -0.12 + gest * 2.0;
      P.armL.rotation.x = -0.35 + wave * 0.2;
    } else {
      // v3: gesture swings mostly SIDEWAYS (z), barely forward (x):
      // round 1's -gest*0.5 forward swing foreshortened the arm to a
      // nub from the front camera.
      P.armR.rotation.z = 0.12 - gest * 1.6;
      P.armR.rotation.x = -gest * 0.15 + wave * 0.3;
    }
  }
  // breathing: torso swells a touch, head bobs a hair
  const br = Math.sin(breath * Math.PI * 2);
  P.torso.scale.set(1 + 0.015 * br, 1 + 0.02 * br, 1 + 0.015 * br);
  P.head.position.y = 1.47 + 0.006 * br;
  // head sink: in lie mode the head rests INTO the pillow (set by caller
  // via pose.sink — a small downward offset of the head group)
  P.head.position.y -= pose.sink || 0;
  // lying face-up, the face points straight at the ceiling and the camera
  // (low, at the foot end) sees only the top of the head. Tilt the head
  // toward the foot end so the face, glasses and mouth read on camera.
  P.head.rotation.x = mode === 'lie' ? 0.7 : 0;
  // eyes: blink squashes, sleep closes to a slit
  const eyeScaleY = expr === 'sleep' ? 0.06 : blink > 0.5 ? 0.08 : 1;
  P.eyeL.scale.set(1, eyeScaleY, 1); P.eyeR.scale.set(1, eyeScaleY, 1);
  // mouth: VO open wins; otherwise the expression mouth
  const open = mouth > 0.12;
  P.mouthOpen.visible = open;
  P.mouthSmile.visible = !open && (expr === 'smile' || expr === 'grin');
  P.mouthFlat.visible = !open && (expr === 'think' || expr === 'sleep');
  P.mouthShock.visible = !open && expr === 'shock';
  if (open) P.mouthOpen.scale.set(1 + 0.2 * mouth, 0.3 + 0.75 * mouth, 0.4);
  P.brow.visible = expr === 'think';
  // books: stack visible whenever asked, incl. lying (grid panel 1:
  // he clutches the books on his chest even asleep; panel 7: holds
  // them while sitting up waving). Position is torso-local, so in lie
  // mode it rides on the chest under/over the blanket edge.
  // torso — at its stand height (y 0.72) the world bed blanket (top
  // ~7.04) buried it completely in both payoff rounds. v7 r5: (-0.20,
  // 0.88, 0.14) — x touches the torso, z pulled back INTO the chest
  // (was 0.22, in front of the chest, so from the payoff camera it
  // projected a hand's width left of the body), y lowered so its bottom
  // rests on the bed line. It must read as books held against his side,
  // not floating over the pillow.
  if (mode === 'sit' && book === 'stack') P.bookStack.position.set(-0.20, 0.88, 0.14);
  else P.bookStack.position.set(-0.30, 0.72, 0.10);
  P.bookStack.visible = book === 'stack';
  P.bookOpen.visible = book === 'open' && !lying;
  // facing
  root.rotation.y = pose.yaw || 0;
}

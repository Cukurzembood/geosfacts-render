// SEMI-REALISTIC human-ish nerd (kit-051-3d-v2 — REDESIGN test only).
// The channel nerd character is UNCHANGED for Claude; this is a look test
// for the kit. Zack D. Films direction: a real person, not a ball head.
// Proportioned head with skin + hair, REAL eyes (sclera/iris/pupil) behind
// round glasses, eyebrows, a nose, lips, real clothes (light shirt +
// mustard sweater VEST as an accent, dark trousers, leather shoes),
// books as a prop. No white ball head, no dot eyes, no capsule body.
//
// Figure is ~1.75 m tall, origin at the soles (feet), facing +z.
// Structure: root (position + roll about the bed axis) -> inner (pose
// rotation: upright / lying / sitting) -> parts. Same interface as
// nerd3d.js so story.js works unchanged: root.userData.parts holds
// head, eyeL, eyeR, mouthOpen, mouthSmile, mouthFlat, mouthShock,
// armR, armL, legL, legR, torso, bookStack, bookOpen, lapBlanket,
// glasses, brow (+ browL/browR, eyeGroupL/eyeGroupR, hair, nose).
import * as THREE from './lib/three.module.js';

export const MUSTARD = '#d9a441';
export const SHIRT = '#b9c9d8';
export const PANTS = '#2e3440';
export const SHOE = '#3a2a20';
export const SKIN = '#e6b183';
export const SKIN_DARK = '#d99e6e';
export const HAIR = '#2e2018';
export const MOUTH_DARK = '#5a1e28';
export const LIP = '#9a4a3a';
const BOOK_COLS = ['#c0392b', '#2f6a43', '#3f6fb5'];

const std = (color, roughness = 0.6, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, envMapIntensity: 0.6, ...extra });
const skin = (roughness = 0.5) => std(SKIN, roughness);
const dark = (c = '#241f1c') => std(c, 0.35, { metalness: 0.3 });

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}

export function buildNerd2() {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  root.add(inner); root.userData.inner = inner;
  const P = {}; root.userData.parts = P;

  // ---- head: proportioned, slightly egg-shaped, skin ----
  const head = new THREE.Group(); head.position.set(0, 1.40, 0); inner.add(head);
  P.head = head;
  const cranium = mesh(new THREE.SphereGeometry(0.13, 48, 32), skin(0.48), 0, 0.02, 0, head);
  cranium.scale.set(0.92, 1.12, 0.98);
  // jaw / chin: smaller sphere merged into the lower face
  const jaw = mesh(new THREE.SphereGeometry(0.085, 32, 24), skin(0.5), 0, -0.09, 0.02, head);
  jaw.scale.set(0.95, 0.8, 0.9);
  // cheeks: faint warm spheres for life
  for (const s of [-1, 1]) {
    const ch = mesh(new THREE.SphereGeometry(0.032, 16, 12), std('#e8a87e', 0.55), s * 0.068, -0.045, 0.095, head);
    ch.scale.set(1, 0.8, 0.5);
  }
  // ears
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.032, 16, 12), skin(0.55), s * 0.122, -0.01, 0, head);
    ear.scale.set(0.5, 1, 0.8);
  }
  // ---- hair: dark cap on the top-back + fringe swoop + temple tufts ----
  const hairM = std(HAIR, 0.85);
  const cap = mesh(new THREE.SphereGeometry(0.135, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.05, -0.012, head);
  cap.scale.set(0.96, 1.05, 1.0); cap.rotation.x = -0.28;
  const fringe = mesh(new THREE.SphereGeometry(0.085, 24, 16), hairM, 0.02, 0.105, 0.095, head);
  fringe.scale.set(1.25, 0.42, 0.55); fringe.rotation.z = -0.15; fringe.rotation.x = 0.25;
  for (const s of [-1, 1]) {
    const tuft = mesh(new THREE.SphereGeometry(0.035, 12, 10), hairM, s * 0.118, 0.03, 0.02, head);
    tuft.scale.set(0.6, 1.2, 0.8);
  }
  P.hair = cap;

  // ---- REAL eyes: sclera + iris + pupil, grouped so blinks squash them ----
  const mkEye = (s) => {
    const g = new THREE.Group(); g.position.set(s * 0.048, 0.02, 0.108); head.add(g);
    const sclera = mesh(new THREE.SphereGeometry(0.030, 24, 18), std('#f5f2ea', 0.25), 0, 0, 0, g);
    sclera.scale.set(1, 1.15, 0.55);
    const iris = mesh(new THREE.SphereGeometry(0.0145, 16, 12), std('#4a2e14', 0.25), 0, 0, 0.017, g);
    iris.scale.set(1, 1, 0.4);
    const pupil = mesh(new THREE.SphereGeometry(0.007, 12, 8), std('#100c08', 0.2), 0, 0, 0.024, g);
    pupil.scale.set(1, 1, 0.4);
    // upper lid crease: thin dark arc above the eye
    const lid = mesh(new THREE.TorusGeometry(0.032, 0.004, 6, 20, Math.PI * 0.85), dark('#3a2a20'), 0, 0.012, 0.016, g);
    lid.rotation.z = Math.PI * 0.075;
    return g;
  };
  P.eyeGroupL = mkEye(-1); P.eyeGroupR = mkEye(1);
  P.eyeL = P.eyeGroupL; P.eyeR = P.eyeGroupR;
  // eyebrows: thin curved bars (torus arcs), animate for expressions
  const mkBrow = (s) => {
    const b = mesh(new THREE.TorusGeometry(0.038, 0.006, 6, 16, Math.PI * 0.8), dark('#2e2018'), s * 0.048, 0.075, 0.115, head);
    b.rotation.z = Math.PI * 0.1 + (s > 0 ? -0.15 : 0.15);
    return b;
  };
  P.browL = mkBrow(-1); P.browR = mkBrow(1); P.brow = P.browR;
  // nose: small rounded nose, skin, slightly darker tip
  const nose = mesh(new THREE.SphereGeometry(0.02, 16, 12), skin(0.5), 0, -0.035, 0.118, head);
  nose.scale.set(0.75, 1.1, 1.0);
  P.nose = nose;
  // big round glasses: thin frames + faint lenses + bridge + temples
  const glassM = dark('#1c1a18');
  const glasses = new THREE.Group(); head.add(glasses); P.glasses = glasses;
  for (const s of [-1, 1]) {
    const lens = mesh(new THREE.TorusGeometry(0.052, 0.007, 10, 40), glassM, s * 0.048, 0.02, 0.122, glasses);
    lens.rotation.x = 0.04;
    const glass = mesh(new THREE.CircleGeometry(0.05, 32),
      new THREE.MeshStandardMaterial({ color: '#cfe0ea', roughness: 0.08, metalness: 0, transparent: true, opacity: 0.13, envMapIntensity: 1.2 }),
      s * 0.048, 0.02, 0.121, glasses);
    glass.material.side = THREE.DoubleSide;
    const temple = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 8), glassM, s * 0.115, 0.035, 0.03, glasses);
    temple.rotation.x = Math.PI / 2 - 0.1; temple.rotation.z = s * 0.06;
  }
  const bridge = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.045, 8), glassM, 0, 0.02, 0.124, glasses);
  bridge.rotation.z = Math.PI / 2;
  // mouths (only one visible at a time), built from lips + opening
  const mouthG = new THREE.Group(); mouthG.position.set(0, -0.095, 0.112); head.add(mouthG);
  P.mouthOpen = mesh(new THREE.SphereGeometry(0.024, 20, 14), std(MOUTH_DARK, 0.45), 0, 0, 0, mouthG);
  P.mouthOpen.scale.set(1, 0.65, 0.5);
  const teeth = mesh(new THREE.BoxGeometry(0.03, 0.008, 0.006), std('#f5f2ea', 0.3), 0, 0.012, 0.008, mouthG);
  P.teeth = teeth;
  const smile = mesh(new THREE.TorusGeometry(0.03, 0.006, 8, 24, Math.PI), std(LIP, 0.5), 0, 0.004, 0, mouthG);
  smile.rotation.z = Math.PI; // arc opening upward = smile curve
  P.mouthSmile = smile;
  P.mouthFlat = mesh(new THREE.BoxGeometry(0.045, 0.006, 0.008), std(LIP, 0.5), 0, 0, 0, mouthG);
  P.mouthShock = mesh(new THREE.SphereGeometry(0.017, 16, 12), std(MOUTH_DARK, 0.45), 0, 0, 0, mouthG);
  P.mouthShock.scale.set(1, 1.3, 0.5);
  // lower lip: small warm bump under the mouth line
  const lipLow = mesh(new THREE.SphereGeometry(0.02, 14, 10), std('#c07a5e', 0.55), 0, -0.02, 0.004, mouthG);
  lipLow.scale.set(1.2, 0.45, 0.4);
  P.lipLow = lipLow;

  // ---- neck + torso: light shirt + mustard sweater VEST (accent) ----
  // The neck is LONG enough to meet the chin: head group sits at 1.40,
  // jaw bottom at ~1.24, neck spans 1.07-1.25. (Round-1 bug: neck was
  // 0.1 tall at 1.12 while the head bottomed at 1.31 — the head floated.)
  mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.18, 16), skin(0.55), 0, 1.16, 0, inner);
  const torso = new THREE.Group(); torso.position.set(0, 0.86, 0); inner.add(torso);
  P.torso = torso;
  const shirt = mesh(new THREE.CapsuleGeometry(0.16, 0.28, 8, 24), std(SHIRT, 0.75), 0, 0, 0, torso);
  shirt.scale.set(1.05, 1, 0.82);
  // vest: mustard capsule slightly larger, front V in shirt colour
  const vest = mesh(new THREE.CapsuleGeometry(0.172, 0.24, 8, 24), std(MUSTARD, 0.85), 0, -0.02, -0.01, torso);
  vest.scale.set(1.06, 1, 0.84);
  const shirtV = mesh(new THREE.CylinderGeometry(0.085, 0.045, 0.18, 12), std(SHIRT, 0.7), 0, 0.15, 0.115, torso);
  shirtV.scale.set(1, 1, 0.45); shirtV.rotation.x = 0.12;
  const collar = mesh(new THREE.TorusGeometry(0.095, 0.018, 8, 24), std(SHIRT, 0.7), 0, 0.235, 0, torso);
  collar.rotation.x = Math.PI / 2 - 0.25;
  for (const y of [0.03, -0.09]) mesh(new THREE.SphereGeometry(0.014, 10, 8), std('#8a6a1f', 0.4), 0, y, 0.155, torso);

  // ---- arms: real shirt sleeves + skin hands ----
  const armGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.46, 12);
  armGeo.translate(0, -0.23, 0); // pivot at the top
  const mkArm = (s) => {
    const g = new THREE.Group(); g.position.set(s * 0.20, 1.08, 0); inner.add(g);
    mesh(armGeo, std(SHIRT, 0.75), 0, 0, 0, g);
    const hand = mesh(new THREE.SphereGeometry(0.052, 16, 12), skin(0.5), 0, -0.48, 0, g);
    hand.scale.set(0.85, 1.25, 0.7);
    mesh(new THREE.SphereGeometry(0.016, 10, 8), skin(0.5), s * 0.04, -0.46, 0.03, g); // thumb
    return g;
  };
  P.armL = mkArm(-1); P.armR = mkArm(1);

  // ---- legs: dark trousers + leather shoes ----
  const legGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.52, 12);
  legGeo.translate(0, -0.26, 0);
  const mkLeg = (s) => {
    const g = new THREE.Group(); g.position.set(s * 0.095, 0.56, 0); inner.add(g);
    mesh(legGeo, std(PANTS, 0.8), 0, 0, 0, g);
    const shoe = mesh(new THREE.SphereGeometry(0.075, 16, 12), std(SHOE, 0.45), 0, -0.53, 0.035, g);
    shoe.scale.set(1, 0.5, 1.6);
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

  // ---- lap blanket (sit mode): deep rust half-ellipsoid over hidden legs ----
  const lap = mesh(new THREE.SphereGeometry(0.34, 24, 16), std('#8a3a30', 0.9), 0, 0.62, 0.10, inner);
  lap.scale.set(1.15, 0.62, 1.05);
  P.lapBlanket = lap;

  return root;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** Pose the redesigned nerd for one frame. Same pose contract as
 * nerd3d.js poseNerd: { mode, expr, blink, mouth, breath, gest, roll,
 * book, x,y,z (root position), yaw, sink, f }. */
export function poseNerd2(root, pose) {
  const P = root.userData.parts, inner = root.userData.inner;
  const { mode = 'stand', expr = 'smile', blink = 0, mouth = 0, breath = 0, gest = 0, roll = 0, book = 'stack' } = pose;
  root.rotation.set(roll * 0.9, 0, 0);
  if (mode === 'lie') {
    inner.rotation.set(-Math.PI / 2, Math.PI / 2, 0, 'YXZ');
    inner.position.set(0, 0, 0);
  } else {
    inner.rotation.set(0, 0, 0);
    inner.position.set(0, 0, 0);
  }
  const sitting = mode === 'sit', lying = mode === 'lie';
  // Legs are hidden when sitting AND when lying — under the blanket the
  // body bump IS the legs; leaving them visible lets a dark trouser
  // triangle poke through the blanket plane (round-1 bug).
  P.legL.visible = P.legR.visible = !sitting && !lying;
  P.shoeL.visible = P.shoeR.visible = !sitting && !lying;
  P.lapBlanket.visible = sitting;
  P.armL.rotation.set(0, 0, lying ? 0.25 : -0.12);
  P.armR.rotation.set(0, 0, lying ? -0.25 : 0.12);
  if (!lying) {
    const wave = mode === 'sit' ? Math.sin(pose.f * 0.5) * 0.35 : 0;
    if (mode === 'sit') {
      P.armL.rotation.z = -0.12 + gest * 2.2;
      P.armL.rotation.x = -gest * 0.5 + wave * 0.3;
    } else {
      P.armR.rotation.z = 0.12 - gest * 2.2;
      P.armR.rotation.x = -gest * 0.5 + wave * 0.3;
    }
  }
  const br = Math.sin(breath * Math.PI * 2);
  P.torso.scale.set(1 + 0.015 * br, 1 + 0.02 * br, 1 + 0.015 * br);
  P.head.position.y = 1.40 + 0.006 * br;
  P.head.position.y -= pose.sink || 0;
  P.head.rotation.x = mode === 'lie' ? 0.7 : 0;
  // eyes: blink squashes the whole eye group; sleep closes to a slit
  const eyeScaleY = expr === 'sleep' ? 0.06 : blink > 0.5 ? 0.08 : 1;
  P.eyeGroupL.scale.set(1, eyeScaleY, 1); P.eyeGroupR.scale.set(1, eyeScaleY, 1);
  // brows: shock raises both, think raises the left
  P.browL.position.y = 0.075 + (expr === 'shock' ? 0.018 : expr === 'think' ? 0.014 : 0);
  P.browR.position.y = 0.075 + (expr === 'shock' ? 0.018 : 0);
  P.browL.rotation.z = Math.PI * 0.1 + 0.15 + (expr === 'think' ? 0.12 : 0);
  P.browR.rotation.z = Math.PI * 0.1 - 0.15;
  // mouth: VO open wins; otherwise the expression mouth
  const open = mouth > 0.12;
  P.mouthOpen.visible = open;
  P.teeth.visible = open && mouth > 0.35;
  P.mouthSmile.visible = !open && (expr === 'smile' || expr === 'grin');
  P.mouthFlat.visible = !open && (expr === 'think' || expr === 'sleep');
  P.mouthShock.visible = !open && expr === 'shock';
  if (open) P.mouthOpen.scale.set(1 + 0.2 * mouth, 0.45 + 0.75 * mouth, 0.5);
  P.brow.visible = expr === 'think';
  P.bookStack.visible = book === 'stack' && !lying;
  P.bookOpen.visible = book === 'open' && !lying;
  root.rotation.y = pose.yaw || 0;
}

// lib/stage.ts — reusable 3D auditorium stage kit for Kampus Sains.
//
// The video-050 stage (world050.ts) generalised: platform + backdrop +
// curtains + valance + wings + podium + mic + footlights, all parameterised
// by palette + position so the next video stages its hook in a different
// colour without re-coding geometry. Same Batch + lam + THREE pattern as
// world050.ts; nothing here touches the template world (no bridge, no
// soldiers).
import * as THREE from "three";
import { Batch, lam } from "../../bridge/build";

/** Palette for one stage. 050's: dusty rose curtains, warm amber
 *  footlights, deep charcoal wings, wood platform. */
export type StagePalette = {
  wood: string; curtainA: string; curtainB: string; valance: string;
  dark: string; backdrop: string; trim: string; seam: string;
  podium: string; lampGlow: string; iron: string;
};
export const STAGE_050: StagePalette = {
  wood: "#6b4a35", curtainA: "#b0606a", curtainB: "#9c4f5c", valance: "#a85460",
  dark: "#2e2a36", backdrop: "#54404e", trim: "#c9a45a", seam: "#46333f",
  podium: "#4a3527", lampGlow: "#ffe9b0", iron: "#3d414c",
};

export type StageOpts = {
  /** centre of the stage on the ground plane (050: x 0, z -23.75) */
  cx?: number; cz?: number; topY?: number;
  /** stage size in metres (050: 14 wide, 6.5 deep) */
  width?: number; depth?: number;
  palette?: StagePalette;
  /** podium x offset from centre (050: +1.7, beside the nerd) */
  podiumX?: number; podiumZ?: number;
  /** footlight globes along the front edge (050: warm amber, no centre) */
  footlights?: boolean;
  /** material key suffix so two stages in one world don't collide */
  key?: string;
};

/**
 * Build the stage into `root` (a THREE.Object3D, usually the world root).
 * Returns the mic-head world position (for a camera look target) and the
 * platform top Y. Usage:
 *   const { micHead, topY } = buildStage(root, { palette: STAGE_050 });
 *   // nerd stands at y = topY; podium at podiumX.
 */
export const buildStage = (root: THREE.Object3D, o: StageOpts = {}) => {
  const cx = o.cx ?? 0, cz = o.cz ?? -23.75, topY = o.topY ?? 0.35;
  const W = o.width ?? 14, D = o.depth ?? 6.5;
  const P = o.palette ?? STAGE_050, key = o.key ?? "lib";
  const podiumX = (o.podiumX ?? 1.7) + cx, podiumZ = (o.podiumZ ?? -23.6);
  const M = {
    stageWood: lam(`stageWood${key}`, () => ({ color: P.wood })),
    curtainA: lam(`curtainA${key}`, () => ({ color: P.curtainA })),
    curtainB: lam(`curtainB${key}`, () => ({ color: P.curtainB })),
    valance: lam(`valance${key}`, () => ({ color: P.valance })),
    dark: lam(`stageDark${key}`, () => ({ color: P.dark })),
    backdrop: lam(`stageBackdrop${key}`, () => ({ color: P.backdrop })),
    trim: lam(`stageTrim${key}`, () => ({ color: P.trim })),
    seam: lam(`stageSeam${key}`, () => ({ color: P.seam })),
    podium: lam(`podium${key}`, () => ({ color: P.podium })),
    lampGlow: lam(`footlight${key}`, () => ({ color: P.lampGlow })),
    iron: lam(`stageIron${key}`, () => ({ color: P.iron })),
  };
  const b = new Batch();
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  // platform: top at topY
  b.add(box(W, topY, D).translate(cx, topY / 2, cz), M.stageWood);
  // backdrop panel behind the stage (hides the world behind in stage shots)
  const bz = cz - D / 2 - 0.2;
  b.add(box(W, 6, 0.2).translate(cx, 3.0, bz), M.backdrop);
  b.add(box(W, 0.12, 0.06).translate(cx, 4.6, bz + 0.15), M.trim);
  for (const x of [-4, 0, 4]) b.add(box(0.08, 5.5, 0.06).translate(cx + x, 2.75, bz + 0.15), M.seam);
  // curtains: side drapes of vertical slats + top valance
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const m = box(0.62, 5.6, 0.25).translate(cx + side * (5.2 + i * 0.45), 2.8, bz + 0.3 - (i % 2) * 0.06);
      b.add(m, i % 2 === 0 ? M.curtainA : M.curtainB);
    }
    b.add(box(0.3, 5.5, 5.5).translate(cx + side * 7.3, 2.75, cz - 0.25), M.dark);
  }
  b.add(box(W, 1.3, 0.3).translate(cx, 5.6, bz + 0.3), M.valance);
  // podium beside the nerd (mic on top)
  b.add(box(1.2, 1.15, 0.7).translate(podiumX, topY + 0.575, podiumZ), M.podium);
  b.add(box(1.3, 0.08, 0.8).translate(podiumX, topY + 1.19, podiumZ), M.podium);
  b.build(root);
  // mic: thin pole + small head (meshes, not batch — like world050.ts)
  const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), M.iron);
  micPole.position.set(podiumX, topY + 1.55, podiumZ);
  micPole.rotation.z = -0.25; micPole.castShadow = true;
  const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), M.dark);
  micHead.position.set(podiumX - 0.15, topY + 1.9, podiumZ);
  micHead.castShadow = true;
  root.add(micPole, micHead);
  // footlights: warm amber globes along the front edge, none at centre
  // (a centre globe would sit directly behind the character's head)
  if (o.footlights ?? true) {
    for (const x of [-5.5, -3.5, -1.5, 1.5, 3.5, 5.5]) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), M.lampGlow);
      g.position.set(cx + x, topY + 0.16, cz + D / 2 - 0.4);
      root.add(g);
    }
  }
  return { micHead: [podiumX - 0.15, topY + 1.9, podiumZ] as [number, number, number], topY, podiumX, podiumZ };
};

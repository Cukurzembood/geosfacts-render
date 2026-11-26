// World050: the "Kampus Sains" campus (base World) + a school auditorium
// stage in front of the library — the set for video 050's hook. The stage
// only exists in this subclass, so the Phase 1 OurWorldTest composition is
// untouched. Palette for this video (from deliverable.md): dusty rose
// curtain + warm amber footlights + deep charcoal wings.
import * as THREE from "three";
import { Batch, lam, Kit } from "../bridge/build";
import { World } from "./world";
import { SHOTS, camAt } from "./story050";
import { stage050 } from "./cast050";

export class World050 extends World {
  constructor(kit: Kit) {
    super(kit, { SHOTS, camAt }, stage050);
    const R = this.root;
    const M = {
      stageWood: lam("stageWood050", () => ({ color: "#6b4a35" })),
      curtainA: lam("curtainA050", () => ({ color: "#b0606a" })),
      curtainB: lam("curtainB050", () => ({ color: "#9c4f5c" })),
      valance: lam("valance050", () => ({ color: "#a85460" })),
      dark: lam("stageDark050", () => ({ color: "#2e2a36" })),
      backdrop: lam("stageBackdrop050", () => ({ color: "#54404e" })),
      trim: lam("stageTrim050", () => ({ color: "#c9a45a" })),
      seam: lam("stageSeam050", () => ({ color: "#46333f" })),
      podium: lam("podium050", () => ({ color: "#4a3527" })),
      lampGlow: lam("footlight050", () => ({ color: "#ffe9b0" })),
      iron: lam("stageIron050", () => ({ color: "#3d414c" })),
    };
    const b = new Batch();
    const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
    // ---- platform: 14 wide, 6.5 deep, top at y = 0.35 ----
    b.add(box(14, 0.35, 6.5).translate(0, 0.175, -23.75), M.stageWood);
    // ---- backdrop panel behind the stage (hides the library in stage shots) ----
    b.add(box(14, 6, 0.2).translate(0, 3.0, -27.2), M.backdrop);
    // gold trim bar + vertical seams so the backdrop is not a flat void
    b.add(box(14, 0.12, 0.06).translate(0, 4.6, -27.05), M.trim);
    for (const x of [-4, 0, 4]) b.add(box(0.08, 5.5, 0.06).translate(x, 2.75, -27.05), M.seam);
    // ---- curtains: side drapes of vertical slats + top valance ----
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const m = box(0.62, 5.6, 0.25).translate(side * (5.2 + i * 0.45), 2.8, -26.9 - (i % 2) * 0.06);
        b.add(m, i % 2 === 0 ? M.curtainA : M.curtainB);
      }
      // wing panels framing the stage
      b.add(box(0.3, 5.5, 5.5).translate(side * 7.3, 2.75, -24), M.dark);
    }
    b.add(box(14, 1.3, 0.3).translate(0, 5.6, -26.9), M.valance);
    // ---- podium beside the nerd (mic on top) ----
    b.add(box(1.2, 1.15, 0.7).translate(1.7, 0.35 + 0.575, -23.6), M.podium);
    b.add(box(1.3, 0.08, 0.8).translate(1.7, 0.35 + 1.19, -23.6), M.podium);
    b.build(R);
    // mic: thin pole + small head on the podium
    const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), M.iron);
    micPole.position.set(1.7, 0.35 + 1.55, -23.6); micPole.rotation.z = -0.25; micPole.castShadow = true;
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), M.dark);
    micHead.position.set(1.55, 0.35 + 1.9, -23.6); micHead.castShadow = true;
    R.add(micPole, micHead);
    // ---- footlights: warm amber globes along the front edge (no center
    // one — it sits in the shot-2 sightline as a stray white ball) ----
    for (const x of [-5, -2.5, 2.5, 5]) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), M.lampGlow);
      g.position.set(x, 0.5, -20.7);
      R.add(g);
    }
    // ---- spotlight pool on the stage floor where the nerd stands ----
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 32),
      new THREE.MeshBasicMaterial({ color: "#fff2c8", transparent: true, opacity: 0.32, depthWrite: false }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0.4, 0.362, -23.8);
    R.add(pool);
  }
}

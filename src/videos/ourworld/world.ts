// Our own world: "Kampus Sains" — a bright science-campus park.
// Library building at the back, winding cobble path, pond with stepping
// stones on the right, lawn with trees / flower beds / benches / lamps.
// Deliberately NOT the bridge template: no river, no town rows, no bridge,
// no soldiers. Three zones (library steps, path + pond, bench corner) can
// host many everyday-science "Why..." topics.
import * as THREE from "three";
import { Batch, lam, prop, house, Kit } from "../bridge/build";
import { grassHD, cobbleHD, stoneHD, water, beam, cloudHD } from "../bridge/paint";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx, stage as stageDefault } from "./cast";
import type { Stage } from "./cast";
import { loadKit } from "../bridge/world";
import { SHOTS as SHOTS0, camAt as camAt0 } from "./story";

/** story module shape (story.ts / story050.ts both fit): shot list + camera */
export type StoryMod = { SHOTS: typeof SHOTS0; camAt: typeof camAt0 };
export type StageFn = (id: number, f: number) => Stage;

export { loadKit };

const GROUND = 0;

/** horizontal quad facing up at height y covering x0..x1, z0..z1 */
function quadUp(x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = GROUND) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
}

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#b8d0ec", 40, 320);
  private clouds: THREE.Mesh[] = [];
  private cloudMaps: THREE.Texture[];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  private story: StoryMod;
  private stageFn: StageFn;

  constructor(kit: Kit, storyMod: StoryMod = { SHOTS: SHOTS0, camAt: camAt0 }, stageFn: StageFn = stageDefault) {
    this.story = storyMod;
    this.stageFn = stageFn;
    const R = this.root, M: Record<string, THREE.Material> = {};
    // ---- sky: 5 colour stops by elevation (same shader approach as the skill) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    // ---- lights ----
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud));
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4, d = 500 + (i % 3) * 70;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 120 + (i % 4) * 35;
      m.position.set(Math.cos(a) * d, 130 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- ground: lawn + cobble path + library steps ----
    const b = new Batch();
    M.grass = lam("grassHD", () => ({ map: grassHD() }));
    M.cobble = lam("cobbleHD", () => ({ map: cobbleHD() }));
    M.stone = lam("stoneHD", () => ({ map: stoneHD() }));
    M.wood = lam("wood", () => ({ map: beam() }));
    M.iron = lam("iron", () => ({ color: "#3d414c" }));
    M.pond = lam("pondWater", () => ({ map: water() }));
    b.add(quadUp(-70, 70, -45, 32, 35, 19), M.grass);
    b.add(quadUp(-1.7, 1.7, -27, 16, 1.7, 21.5, 0.02), M.cobble); // the path
    b.add(quadUp(-6, 6, -29.5, -27, 3, 0.6, 0.06), M.stone);    // library steps
    // ---- library (big, cream, front faces +z toward the camera) + study hut ----
    house(b, 0, -34, 0, 16, 10, 6, 0, 0);
    house(b, -20, -20, 0.5, 8, 7, 5, 3, 0);
    // ---- pond (right) + stepping stones ----
    const pond = new THREE.CircleGeometry(1, 40); pond.rotateX(-Math.PI / 2);
    const pondMesh = new THREE.Mesh(pond, M.pond);
    pondMesh.position.set(14, 0.03, -6); pondMesh.scale.set(6.5, 4.5, 1); pondMesh.receiveShadow = true;
    R.add(pondMesh);
    for (const [x, z] of [[8.5, -2.5], [10.5, -4.5], [12.5, -6.5]] as const) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.14, 12), M.stone);
      st.position.set(x, 0.07, z); st.castShadow = true; st.receiveShadow = true; R.add(st);
    }
    // ---- benches (seat + back + legs) ----
    const bench = (x: number, z: number, yaw: number) => {
      const g = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.09, 0.55), M.wood); seat.position.y = 0.46;
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.07), M.wood); back.position.set(0, 0.8, -0.26);
      g.add(seat, back);
      for (const s of [-0.8, 0.8]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.46, 0.5), M.iron);
        leg.position.set(s, 0.23, 0); g.add(leg);
      }
      // a stack of books left on the bench
      const cols = ["#c0392b", "#2f6a43", "#3f6fb5"];
      cols.forEach((c, i) => {
        const bk = new THREE.Mesh(new THREE.BoxGeometry(0.5 - i * 0.05, 0.07, 0.36),
          lam("book" + c, () => ({ color: c })));
        bk.position.set(0.55, 0.54 + i * 0.075, 0); bk.rotation.y = (i - 1) * 0.12; g.add(bk);
      });
      g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
      g.position.set(x, 0, z); g.rotation.y = yaw;
      R.add(g);
    };
    bench(2.8, -1.2, -Math.PI / 2 - 0.15); // the talk bench, facing the path
    bench(-3.2, -9, Math.PI / 2);
    // ---- lamp posts ----
    for (const [x, z] of [[-2.4, 4], [4.2, -12]] as const) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.7, 10), M.iron);
      pole.position.set(x, 1.35, z); pole.castShadow = true;
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10),
        lam("lampGlow", () => ({ color: "#ffe9b0" })));
      lamp.position.set(x, 2.85, z);
      R.add(pole, lamp);
    }
    b.build(R);
    // ---- vegetation (procedural Kenney-style via build.ts prop) ----
    const pb = new Batch();
    const trees: [string, number, number, number][] = [
      ["tree_oak", -12, -14, 9], ["tree_default", 12, -20, 10], ["tree_fat", -22, -6, 8],
      ["tree-high-round", 22, 6, 9], ["tree_detailed", -8, -30, 8], ["tree_oak", 17, -28, 9],
      ["tree_cone", -26, 8, 7], ["tree_default", 26, -12, 8],
    ];
    for (const [n, x, z, h] of trees) prop(pb, kit, n, x, 0, z, h, x * 0.7);
    const bushes: [number, number][] = [[-4, -16], [5, -18], [-6, 2], [7, -2], [-14, -24], [18, -14]];
    for (const [x, z] of bushes) prop(pb, kit, "plant_bushDetailed", x, 0, z, 1.2, x);
    const flowers: [string, number, number][] = [];
    for (let i = 0; i < 8; i++) flowers.push([["flower_redA", "flower_yellowA", "flower_purpleA"][i % 3], -2.6 - (i % 2) * 0.4, -18 + i * 3.4]);
    for (let i = 0; i < 8; i++) flowers.push([["flower_yellowA", "flower_purpleA", "flower_redA"][i % 3], 2.6 + (i % 2) * 0.4, -14 + i * 3.2]);
    for (const [n, x, z] of flowers) prop(pb, kit, n, x, 0, z, 0.55, x * 2);
    for (const [x, z] of [[-3, -6], [4, -8], [-5, 8], [6, 10], [-9, -20], [10, 2]] as const)
      prop(pb, kit, "grass", x, 0, z, 0.5, x);
    pb.build(R);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = this.story.SHOTS[id - 1], L = LIGHTS[s.light];
    // ---- camera ----
    const c = this.story.camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = new THREE.Vector3(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: fixed day sun (upper-left, in front of the library shots) ----
    const K = LOOK[s.light];
    const sunDir = new THREE.Vector3(0.5, 0.75, 0.45).normalize();
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i];
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
    }
    // ---- cast ----
    const st = this.stageFn(id, f);
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}

// Background-variation system for the cartoon-short-kit engine.
//
// Every video picks ONE world by id (story.js `WORLD`). A world is a
// self-contained 3D set: its own palette, lighting direction, layout and
// props, built by one function that receives the engine context
// (THREE, scene, world group, the main.js helpers add/box/tbox/texM/toon,
// painters P, Pen module T, rx, DECK).
//
// RULES (baked in, not a suggestion):
//  1. Never reuse the same establishing shot twice — every shot in a video
//     gets its own camera (see story.js CAMS), and every video gets its own
//     world + palette. A second video in the same world must change the
//     palette, the time of day, or the camera side — preferably all three.
//  2. The narrator is a 2D card; the world is the 3D set around them. The
//     world builder must leave a clear standing spot (SOL) with nothing
//     between it and the cameras.
//  3. Cutaway diagrams (cutaways.js) carry the science; the world carries
//     the place. Keep them separate: boards are cards, worlds are meshes.
//
// HOW TO ADD A NEW WORLD for the next video:
//  1. Add an entry to WORLDS below (id, human description, palette notes).
//  2. Write build<Name>(ctx) following buildBathroom: floor at y = DECK,
//     room/set roughly centred on x = -21.5, z = 0 (the narrator's SOL),
//     everything opaque so the old sky/hills never show through.
//  3. Add a matching light palette in story.js LIGHTS (warm/cool, sun az/el
//     through the world's window or open side) and set story.js WORLD to it.
//  4. Re-block the cameras in story.js CAMS for the new layout (wide /
//     close-up / tracking / pull-back — at least one of each per video).
//  5. Register the id in the `buildWorld` switch at the bottom of this file.
//
// The old bridge world lives in main.js behind `WORLD === 'bridge'` and is
// kept as the fallback example; new videos should NOT reuse it unchanged.

export const WORLDS = {
  bridge: {
    label: "Roman bridge over a river (v1, video 049 first render)",
    palette: "outdoor day / golden hour, river blue + grass green",
    note: "Legacy set. Do not reuse for a new video without re-paleting it.",
  },
  bathroom: {
    label: "Warm bathroom at night (video 049 v2 — the pee-shiver story)",
    palette: "cream + pale-blue tile, mustard rug (matches the nerd vest), warm tungsten light",
    props: "tub, sink + mirror, toilet, window, towel rail, rug, shelf of books, plant",
  },
};

// ---------- bathroom (video 049 v2) ----------
// Room: floor top at y = DECK (6), x -27..-16, z -4.5..4.5, ceiling y 12.6.
// Narrator SOL (-21.5, DECK, 0) stands mid-room; tub on the back-left wall,
// sink + mirror on the back-right, toilet on the right wall, window on the
// left wall (the warm key light comes through it), door on the front-right.
export const buildBathroom = (ctx) => {
  const { THREE, scene, world, add, box, tbox, texM, toon, P, DECK } = ctx;
  const tileWall = texM(P.tiles(20, [205, 18, 82], [32, 45, 78]), 1, 1);
  const tileFloor = texM(P.tiles(21, [32, 30, 76], [205, 25, 72]), 1, 1);
  const tileBlue = texM(P.tiles(22, [200, 30, 80], [32, 45, 78]), 1, 1);
  const plaster = texM(P.plaster(23, 42), 1, 1);
  const wood = toon({ color: '#7a5434' });
  const woodDark = toon({ color: '#5a3a24' });
  const porcelain = toon({ color: '#f4f6f2' });
  const porcelainBlue = toon({ color: '#dcebf2' });
  const chrome = toon({ color: '#c8ccd2' });
  const mirror = toon({ color: '#bcd9e8' });
  const warmGlow = new THREE.MeshBasicMaterial({ color: '#ffe9b0' });
  const towelA = toon({ color: '#c25a7a' });
  const towelB = toon({ color: '#3f6fb5' });
  const rugM = toon({ color: '#d9a441' });
  const leafM = toon({ color: '#4d7a32' });
  const potM = toon({ color: '#b0623a' });
  const bookCols = ['#c0392b', '#2f6a43', '#3f6fb5'];

  const X0 = -27, X1 = -16, Z0 = -4.5, Z1 = 4.5, TOP = DECK + 6.6;

  // floor + ceiling
  add(tbox(X1 - X0, 0.3, Z1 - Z0, 1.2), tileFloor, (X0 + X1) / 2, DECK - 0.15, 0, world, { cast: false });
  add(tbox(X1 - X0, 0.25, Z1 - Z0, 2), plaster, (X0 + X1) / 2, TOP + 0.12, 0, world, { cast: false });
  // walls: tiled wainscot (lower 2.2 m) + warm plaster above
  const wall = (w, h, d, x, y, z, mat) => add(tbox(w, h, d, 1.6), mat, x, y, z, world, { cast: false });
  // back wall (z = Z0), front wall (z = Z1), left (x = X0), right (x = X1)
  wall(X1 - X0, 2.2, 0.3, (X0 + X1) / 2, DECK + 1.1, Z0, tileWall);
  wall(X1 - X0, 4.4, 0.3, (X0 + X1) / 2, DECK + 4.4, Z0, plaster);
  wall(X1 - X0, 2.2, 0.3, (X0 + X1) / 2, DECK + 1.1, Z1, tileWall);
  wall(X1 - X0, 4.4, 0.3, (X0 + X1) / 2, DECK + 4.4, Z1, plaster);
  wall(0.3, 2.2, Z1 - Z0, X0, DECK + 1.1, 0, tileBlue);
  wall(0.3, 4.4, Z1 - Z0, X0, DECK + 4.4, 0, plaster);
  wall(0.3, 2.2, Z1 - Z0, X1, DECK + 1.1, 0, tileWall);
  wall(0.3, 4.4, Z1 - Z0, X1, DECK + 4.4, 0, plaster);
  // skirting
  for (const z of [Z0 + 0.18, Z1 - 0.18]) add(tbox(X1 - X0, 0.22, 0.1, 1), woodDark, (X0 + X1) / 2, DECK + 0.11, z, world, { cast: false });

  // window on the left wall (x = X0), warm bright pane + frame + sill
  const win = new THREE.Group(); win.position.set(X0 + 0.18, DECK + 3.4, 0); world.add(win);
  add(new THREE.PlaneGeometry(2.6, 2.4), warmGlow, 0, 0, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(box(0.12, 2.6, 0.12), wood, 0, 1.25, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, -1.25, 0, win, { cast: false });
  add(box(0.12, 0.12, 2.8), wood, 0, 0, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, 0, 0, win, { cast: false }); // vertical centre bar
  add(box(0.3, 0.12, 3.0), wood, 0.05, -1.35, 0, win, { cast: false }); // sill
  // curtain rod + two curtain panels
  add(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 8), chrome, 0.12, 1.55, 0, win, { cast: false }).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    const cur = add(box(0.1, 2.9, 0.55), s < 0 ? towelA : towelB, 0.12, 0, s * 1.45, win, { cast: false });
    cur.rotation.x = s * 0.06;
  }

  // bathtub along the back-left wall
  const tub = new THREE.Group(); tub.position.set(-24.6, DECK, -3.55); world.add(tub);
  add(box(3.6, 0.75, 1.5), porcelain, 0, 0.38, 0, tub);
  add(box(3.3, 0.1, 1.2), porcelainBlue, 0, 0.72, 0, tub, { cast: false }); // water surface
  add(box(0.18, 0.9, 0.18), chrome, 1.55, 1.1, -0.55, tub); // faucet stem
  add(box(0.5, 0.12, 0.14), chrome, 1.35, 1.5, -0.55, tub); // spout
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 10), chrome, 1.55 + s * 0.3, 0.8, -0.55, tub); // taps
  add(box(0.5, 0.06, 0.35), towelB, -1.2, 0.78, 0.3, tub, { cast: false }); // folded towel on the rim

  // sink + mirror on the back-right wall
  const sink = new THREE.Group(); sink.position.set(-18.2, DECK, -3.9); world.add(sink);
  add(new THREE.CylinderGeometry(0.16, 0.22, 0.85, 12), porcelain, 0, 0.42, 0, sink); // pedestal
  add(box(1.5, 0.22, 0.8), porcelain, 0, 0.95, 0, sink); // basin
  add(new THREE.CylinderGeometry(0.55, 0.45, 0.12, 16), porcelainBlue, 0, 1.05, 0, sink, { cast: false }); // basin bowl
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), chrome, 0, 1.3, -0.25, sink); // faucet
  add(box(0.3, 0.08, 0.08), chrome, 0, 1.52, -0.1, sink);
  add(new THREE.PlaneGeometry(1.5, 1.9), mirror, -18.2, DECK + 2.9, -4.28, world, { cast: false });
  add(box(1.7, 2.1, 0.08), wood, -18.2, DECK + 2.9, -4.33, world, { cast: false }); // mirror frame (behind the pane)
  // toothbrush cup + soap on the sink
  add(new THREE.CylinderGeometry(0.09, 0.07, 0.22, 10), towelA, -18.7, DECK + 1.18, -3.85, world);
  add(box(0.28, 0.08, 0.16), towelB, -17.6, DECK + 1.1, -3.85, world);

  // toilet on the right wall (faces -x, into the room)
  const wc = new THREE.Group(); wc.position.set(-17.0, DECK, 2.2); wc.rotation.y = -Math.PI / 2; world.add(wc);
  add(box(0.9, 0.9, 0.35), porcelain, 0, 0.85, -0.55, wc); // tank
  add(box(0.95, 0.08, 0.4), porcelain, 0, 1.32, -0.55, wc, { cast: false }); // tank lid
  add(new THREE.CylinderGeometry(0.32, 0.26, 0.45, 14), porcelain, 0, 0.22, 0, wc); // bowl base
  add(new THREE.CylinderGeometry(0.42, 0.36, 0.12, 14), porcelain, 0, 0.5, 0.05, wc); // seat
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 14), porcelainBlue, 0, 0.52, 0.05, wc, { cast: false }); // water
  add(box(0.12, 0.1, 0.3), chrome, 0.42, 1.05, -0.55, wc); // flush handle

  // towel rail + towels on the back wall between tub and sink
  add(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), chrome, -21.2, DECK + 2.6, -4.28, world, { cast: false }).rotation.z = Math.PI / 2;
  add(box(0.55, 1.1, 0.06), towelA, -21.6, DECK + 2.05, -4.26, world);
  add(box(0.55, 0.95, 0.06), towelB, -20.85, DECK + 2.12, -4.26, world);

  // rug (mustard, matches the nerd's vest) + bath mat by the tub
  add(box(2.6, 0.04, 1.6), rugM, -21.5, DECK + 0.03, 1.9, world, { cast: false });
  add(box(1.6, 0.04, 0.9), towelB, -24.6, DECK + 0.03, -1.9, world, { cast: false });

  // shelf with books (the nerd's) on the front wall + plant by the door
  add(box(1.8, 0.08, 0.4), wood, -19.0, DECK + 2.4, 4.15, world);
  bookCols.forEach((col, i) => add(box(0.16, 0.55 - i * 0.05, 0.3), toon({ color: col }), -19.6 + i * 0.2, DECK + 2.72, 4.15, world));
  add(box(0.3, 0.4, 0.3), toon({ color: '#2f6a43' }), -18.3, DECK + 2.64, 4.15, world); // leaning book
  const plant = new THREE.Group(); plant.position.set(-16.9, DECK, -3.9); world.add(plant);
  add(new THREE.CylinderGeometry(0.28, 0.2, 0.45, 12), potM, 0, 0.22, 0, plant);
  for (let i = 0; i < 5; i++) {
    const s = add(new THREE.SphereGeometry(0.22, 8, 6), leafM, Math.sin(i * 2.4) * 0.16, 0.75 + (i % 2) * 0.18, Math.cos(i * 2.4) * 0.16, plant);
    s.scale.y = 1.5;
  }

  // door (front-right, on the right wall) with a round knob
  add(box(0.1, 3.4, 1.5), wood, -16.05, DECK + 1.7, 1.2, world, { cast: false });
  add(box(0.06, 1.2, 1.1), woodDark, -15.98, DECK + 2.4, 1.2, world, { cast: false });
  add(new THREE.SphereGeometry(0.07, 10, 8), chrome, -15.98, DECK + 1.65, 0.65, world);

  // ceiling light: warm fixture + a real point light so the room glows
  add(box(0.9, 0.08, 0.5), woodDark, -21.5, TOP - 0.05, 0, world, { cast: false });
  add(new THREE.PlaneGeometry(0.7, 0.35), warmGlow, -21.5, TOP - 0.1, 0, world, { cast: false }).rotation.x = Math.PI / 2;
  const lamp = new THREE.PointLight('#ffd9a0', 25, 25, 2);
  lamp.position.set(-21.5, DECK + 5.6, 0);
  scene.add(lamp);

  return { groundY: DECK };
};

export const buildWorld = (kind, ctx) => {
  if (kind === 'bathroom') return buildBathroom(ctx);
  if (kind === 'bridge') return null; // built inline in main.js (legacy)
  throw new Error(`worlds: unknown world id "${kind}" — add it to WORLDS and buildWorld`);
};

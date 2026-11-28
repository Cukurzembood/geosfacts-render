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
  nightlane: {
    label: "Foggy night street, crooked houses, one lit window (eerie test — 'The Window That Watched Back')",
    palette: "dark blue-grey + cobbles, one amber window, warm streetlamps, pale moon",
    props: "3 house facades, 2 streetlamps (one flickers), bare tree, fence, barrel + crate",
  },
  bedroom: {
    label: "Bright bold daytime bedroom (kit-051v2 explainer — bold colors, bright light)",
    palette: "aqua-teal walls + coral blanket + sunny yellow rug, daylight through the window",
    props: "bed + pillow + coral blanket, nightstand + lamp, sunny window, rug, shelf of books, mint wardrobe",
  },
  bedroom3d: {
    label: "3D SEMI-REALISTIC bedroom (kit-051-3d test — standard materials, soft light, no ink)",
    palette: "same bold aqua-teal + coral + yellow, but real 3D: dented pillow, folded blanket, soft shadows",
    props: "bed with dented pillow + folded blanket over the body bump, nightstand + warm lamp, sunny window, rug, shelf of books, mint wardrobe",
  },
  bedroomCine: {
    label: "CINEMATIC NIGHT bedroom (kit-051-3d-v2 redesign — Zack D. Films direction)",
    palette: "night: cool moonlight blue vs warm tungsten amber, deep rust blanket, dark walnut, muted plaster — depth + atmosphere, no flat teal",
    props: "bed with dented pillow + folded blanket, nightstand + warm lamp + books + glass + alarm clock + phone, moon window + heavy curtains, poster, plant, rug, wardrobe, dust motes",
  },
  nose2: {
    label: "3D nasal passage v2 (kit-051-3d-v2 — folded scroll turbinates, real passage shape, no smooth ellipsoids)",
    palette: "moist mucosa reds/pinks, glossy, warm pink light + cool entrance rim",
    props: "irregular folded passage, septum, scroll turbinates (inferior + middle, both sides), mucus gloss, airflow streaks, blood drain",
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
  if (kind === 'nightlane') return buildNightStreet(ctx);
  if (kind === 'bedroom') return buildBedroom(ctx);
  if (kind === 'bedroom3d') return buildBedroom3D(ctx);
  if (kind === 'bedroomCine') return buildBedroomCine(ctx);
  if (kind === 'bridge') return null; // built inline in main.js (legacy)
  throw new Error(`worlds: unknown world id "${kind}" — add it to WORLDS and buildWorld`);
};

// ---------- bedroom3d (kit-051-3d — 3D SEMI-REALISTIC test) ----------
// Same room + layout as the v2 bedroom (bed along the back wall, window
// on the left wall, nightstand + lamp, rug, wardrobe, shelf of books) but
// built for the semi-realistic look: MeshStandardMaterial, soft painted
// textures (no dark seams), a REAL bed with volume — a pillow with a
// dent the head sinks into, a blanket with folds draped over the body
// bump, curtains with folds. The nerd is a 3D figure (nerd3d.js), not a
// card; the world blanket bump matches his lying pose exactly.
export const buildBedroom3D = (ctx) => {
  const { THREE, scene, world, add, box, tbox, texM, toon, std, stdM, P, DECK } = ctx;
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const wallM = stdM(P.softWall(40, 174, 55, 58), 2, 1);   // aqua-teal, soft
  const wallLowM = stdM(P.softWall(41, 174, 50, 56), 2, 1);
  const ceilM = std({ color: '#fdf6e3', roughness: 0.9 });
  const floorM = stdM(P.softWood(42, 30, 45, 54), 3, 3);    // honey wood, soft grain
  const wood = std({ color: '#9a6a3c', roughness: 0.7 });
  const woodDark = std({ color: '#7a5230', roughness: 0.7 });
  const sheetM = stdM(P.softSheet(43), 2, 2);
  const blanketM = stdM(P.softFabric(44, 8, 70, 55), 2, 2); // coral, woven
  const pillowM = stdM(P.softSheet(45), 1, 1);
  const lampShadeM = std({ color: '#ffd94d', roughness: 0.6 });
  const lampGlowM = new THREE.MeshBasicMaterial({ color: '#ffe9b0' });
  const daySkyM = new THREE.MeshBasicMaterial({ color: '#7ec8f0' });
  const sunM = new THREE.MeshBasicMaterial({ color: '#ffe066' });
  const rugM = stdM(P.softFabric(46, 48, 85, 62), 1, 1);    // sunny yellow rug
  const curtainM = stdM(P.softFabric(47, 12, 75, 58), 1, 1); // coral curtains
  const bookCols = ['#c0392b', '#2f6a43', '#3f6fb5'];

  const X0 = -27, X1 = -16, Z0 = -4.5, Z1 = 4.5, TOP = DECK + 6.6;

  // floor + ceiling
  add(tbox(X1 - X0, 0.3, Z1 - Z0, 1.2), floorM, (X0 + X1) / 2, DECK - 0.15, 0, world, { cast: false });
  add(tbox(X1 - X0, 0.25, Z1 - Z0, 2), ceilM, (X0 + X1) / 2, TOP + 0.12, 0, world, { cast: false });
  // walls: teal plaster + darker wainscot band
  const wall = (w, h, d, x, y, z, mat) => add(tbox(w, h, d, 1.6), mat, x, y, z, world, { cast: false });
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z0, wallM);
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z1, wallM);
  wall(0.3, 6.6, Z1 - Z0, X0, DECK + 3.3, 0, wallM);
  wall(0.3, 6.6, Z1 - Z0, X1, DECK + 3.3, 0, wallM);
  wall(X1 - X0, 1.1, 0.34, (X0 + X1) / 2, DECK + 0.55, Z0, wallLowM);
  wall(X1 - X0, 1.1, 0.34, (X0 + X1) / 2, DECK + 0.55, Z1, wallLowM);
  for (const z of [Z0 + 0.18, Z1 - 0.18]) add(tbox(X1 - X0, 0.22, 0.1, 1), woodDark, (X0 + X1) / 2, DECK + 0.11, z, world, { cast: false });

  // window on the left wall (x = X0): bright day sky + big sun + frame
  const win = new THREE.Group(); win.position.set(X0 + 0.18, DECK + 3.4, 0); world.add(win);
  add(new THREE.PlaneGeometry(2.6, 2.4), daySkyM, 0, 0, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(new THREE.CircleGeometry(0.5, 24), sunM, 0.02, 0.55, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(box(0.12, 2.6, 0.12), wood, 0, 1.25, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, -1.25, 0, win, { cast: false });
  add(box(0.12, 0.12, 2.8), wood, 0, 0, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, 0, 0, win, { cast: false });
  add(box(0.3, 0.12, 3.0), wood, 0.05, -1.35, 0, win, { cast: false });
  // curtain panels with real vertical folds (displaced planes)
  for (const s of [-1, 1]) {
    const cg = new THREE.PlaneGeometry(0.55, 2.9, 8, 1);
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.06 * Math.sin(cp.getY(i) * 9 + s));
    cg.computeVertexNormals();
    const cur = add(cg, curtainM, 0.14, 0, s * 1.45, win, { cast: false });
    cur.rotation.y = Math.PI / 2; cur.rotation.x = s * 0.04;
  }

  // bed along the back wall: frame + mattress + headboard + dented pillow + folded blanket
  const bed = new THREE.Group(); bed.position.set(-24.1, DECK, -3.2); world.add(bed);
  add(box(3.8, 0.35, 2.3), wood, 0, 0.2, 0, bed);
  // mattress: sheet texture on TOP only; plain cream sides (the blotch
  // texture stretched on the vertical faces read as grime)
  const sheetSideM = std({ color: '#f7f2e6', roughness: 0.9 });
  const mattressM = [sheetSideM, sheetSideM, sheetM, sheetSideM, sheetSideM, sheetSideM];
  add(box(3.6, 0.3, 2.1), mattressM, 0, 0.52, 0, bed, { cast: false }); // mattress, top at 0.67
  add(box(0.15, 1.3, 2.3), woodDark, -1.95, 0.95, 0, bed); // headboard
  // pillow: sphere squashed flat, with a dent where the head rests
  const pillowGeo = new THREE.SphereGeometry(0.55, 48, 32);
  {
    const pp = pillowGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i);
      const dx = (x + 0.12) / 0.34, dz = z / 0.34, d2 = dx * dx + dz * dz;
      if (y > 0) pp.setY(i, y - 0.26 * Math.exp(-d2) * Math.max(0, y / 0.55));
    }
    pillowGeo.computeVertexNormals();
  }
  const pillow = add(pillowGeo, pillowM, -1.35, 0.62, 0, bed);
  pillow.scale.set(0.85, 0.32, 0.95);
  // blanket: displaced plane — body bump where the nerd lies (chest high,
  // legs taper), sine folds, draped over the foot end. Kept inside the
  // mattress edges so no wavy ribbon hangs down the side.
  const blGeo = new THREE.PlaneGeometry(3.0, 2.0, 48, 32);
  blGeo.rotateX(-Math.PI / 2);
  {
    const pp = blGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const x = pp.getX(i), z = pp.getZ(i);
      const sx = sstep(-1.35, -1.05, x) * (1 - sstep(0.35, 0.65, x));
      const sz = Math.max(0, Math.cos((z / 0.95) * Math.PI / 2));
      const profile = 0.35 * (1 - 0.28 * sstep(-0.1, 0.35, x)); // chest 0.35, legs 0.25
      let y = profile * sx * sz;
      y += 0.06 * sstep(-1.35, -1.1, x) * (1 - sstep(-0.9, -0.6, x)) * sz; // shoulder step: blanket pulled up to the neck
      y += (0.022 + 0.02 * sx) * Math.sin(x * 13 + z * 2.5);
      y += 0.012 * Math.sin(x * 27 + 1.7);
      y -= 0.30 * sstep(1.15, 1.5, x);            // drape over the foot end
      y -= 0.06 * sstep(0.9, 1.0, Math.abs(z));   // slight tuck at the sides
      pp.setY(i, y);
    }
    blGeo.computeVertexNormals();
  }
  const blanket = add(blGeo, blanketM, 0.3, 0.70, 0, bed, { cast: false });
  blanket.material.side = THREE.DoubleSide;
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]])
    add(box(0.14, 0.4, 0.14), woodDark, sx * 1.75, 0.2, sz * 1.0, bed);

  // nightstand + bedside lamp (back-right wall) + warm point light
  const ns = new THREE.Group(); ns.position.set(-19.3, DECK, -4.0); world.add(ns);
  add(box(0.9, 0.85, 0.6), wood, 0, 0.42, 0, ns);
  add(box(0.8, 0.08, 0.5), woodDark, 0, 0.88, 0, ns, { cast: false });
  add(new THREE.CylinderGeometry(0.09, 0.12, 0.3, 10), woodDark, 0, 1.0, 0, ns);
  add(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 12), lampShadeM, 0, 1.3, 0, ns);
  add(new THREE.SphereGeometry(0.12, 10, 8), lampGlowM, 0, 1.28, 0, ns);
  bookCols.forEach((col, i) => add(box(0.3, 0.07, 0.22), std({ color: col, roughness: 0.7 }), -0.25, 0.95 + i * 0.08, 0.12, ns));
  const lamp = new THREE.PointLight('#ffe9a8', 14, 16, 2);
  lamp.position.set(-19.3, DECK + 1.5, -3.9);
  scene.add(lamp);

  // rug (sunny yellow) mid-room + slippers by the bed
  const rugGeo = new THREE.CircleGeometry(1.1, 32);
  const rug = add(rugGeo, rugM, -21.8, DECK + 0.03, 0.4, world, { cast: false });
  rug.rotation.x = -Math.PI / 2;
  add(box(0.5, 0.06, 0.22), std({ color: '#ff5a8a', roughness: 0.8 }), -22.2, DECK + 0.05, -1.6, world, { cast: false });
  add(box(0.5, 0.06, 0.22), std({ color: '#ff5a8a', roughness: 0.8 }), -22.2, DECK + 0.05, -1.2, world, { cast: false });

  // shelf with books on the front wall + mint wardrobe on the right wall
  add(box(1.8, 0.08, 0.4), wood, -19.0, DECK + 2.4, 4.15, world);
  bookCols.forEach((col, i) => add(box(0.16, 0.55 - i * 0.05, 0.3), std({ color: col, roughness: 0.7 }), -19.6 + i * 0.2, DECK + 2.72, 4.15, world));
  add(box(0.8, 3.4, 2.0), std({ color: '#7ed491', roughness: 0.8 }), -16.4, DECK + 1.7, 2.0, world, { cast: false });
  add(box(0.06, 3.0, 0.08), wood, -16.0, DECK + 1.7, 2.0, world, { cast: false });
  add(new THREE.SphereGeometry(0.06, 10, 8), std({ color: '#c8ccd2', roughness: 0.35, metalness: 0.6 }), -15.98, DECK + 1.6, 1.7, world);

  // 3D nose interior experiment (Zack-style mechanism close-up) — CUT
  // after two smoke rounds (head-on + low 3/4): two smooth ellipsoids in
  // a cylinder read as giant red fingers/sausages, not anatomy, and the
  // passage reads as a plastic tunnel. The builder (buildNose3D below)
  // is kept for future work; shots 2 + 4 use the graphic nose boards,
  // which read clean and professional (verified f=400). The Zack
  // direction is carried by the cinematic light + hook close-up + real
  // 3D character and set instead.
  // buildNose3D(ctx);

  return { groundY: DECK };
};

// ---------- 3D nose interior (kit-051-3d — Zack D. Films reference) ----------
// Hyper-realistic mechanism close-up: a moist nasal passage with two
// spongy turbinates that SWELL across shot 4 (lie flat) while airflow
// particles slow and shrink — the "why" made visible in 3D, not a flat
// diagram board. Shot 2 holds them slim with free flow. The camera
// pushes in from the nostril entrance (story.js CAMS).
// Frame ranges are the shot boundaries from story.js SHOTS.
const NOSE_Y = 60;
export const buildNose3D = (ctx) => {
  const { THREE, world, add, std, stdM, P } = ctx;
  const nose = new THREE.Group(); nose.position.set(0, NOSE_Y, 0); world.add(nose);
  const noCast = { cast: false };
  // passage wall: open cylinder along z, seen from INSIDE (BackSide)
  const tubeM = stdM(P.softTissue(50, 6, 62, 42), 2, 2);
  tubeM.side = THREE.BackSide; tubeM.roughness = 0.55; tubeM.envMapIntensity = 0.45;
  const tubeGeo = new THREE.CylinderGeometry(1.15, 1.15, 9, 28, 1, true);
  tubeGeo.rotateX(Math.PI / 2);
  add(tubeGeo, tubeM, 0, 0, 0, nose, noCast);
  // far end capped with tissue (an open tube reads as a black void)
  const capM = stdM(P.softTissue(53, 4, 58, 30), 1, 1); capM.roughness = 0.5;
  const cap = add(new THREE.CircleGeometry(1.15, 28), capM, 0, 0, 4.5, nose, noCast);
  cap.rotation.y = Math.PI;
  // nostril rim at the entrance
  const rimM = stdM(P.softTissue(51, 4, 58, 34), 1, 1); rimM.roughness = 0.4;
  add(new THREE.TorusGeometry(1.15, 0.22, 12, 28), rimM, 0, 0, -4.5, nose, noCast);
  // turbinates: bumpy sponges hanging from the ceiling of the passage.
  // The geometry is translated so its TOP sits at y=0 — the mesh is
  // scaled from the ceiling attachment, so it grows DOWNWARD like real
  // engorgement and never floats detached from the wall.
  const turbGeo = new THREE.SphereGeometry(1, 20, 14);
  {
    const pp = turbGeo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pp.count; i++) {
      v.set(pp.getX(i), pp.getY(i), pp.getZ(i));
      const b = 0.03 * Math.sin(v.x * 12 + v.y * 9) * Math.sin(v.z * 10 + v.y * 7);
      v.normalize().multiplyScalar(1 + b); pp.setXYZ(i, v.x, v.y, v.z);
    }
    turbGeo.computeVertexNormals();
    turbGeo.translate(0, -1, 0); // top of the sponge at y=0 (the ceiling)
  }
  const turbM = stdM(P.softTissue(52, 10, 68, 52), 1, 1); turbM.roughness = 0.45;
  const mkTurb = (sx) => {
    const g = new THREE.Group(); g.position.set(sx * 0.42, 1.15, 0.5); nose.add(g);
    const m = add(turbGeo, turbM, 0, 0, 0, g, noCast);
    m.scale.set(0.38, 0.34, 1.8);
    return g;
  };
  const turbL = mkTurb(-1), turbR = mkTurb(1);
  // glossy mucus blobs on the passage wall
  const mucM = std({ color: '#b03a3a', roughness: 0.12, envMapIntensity: 1.6 });
  const mucSpots = [[0.9, 0.5, -2.0, 0.10], [-0.95, -0.3, -0.5, 0.13], [0.7, -0.8, 1.5, 0.09], [-0.6, 0.85, 2.8, 0.11]];
  for (const [x, y, z, r] of mucSpots) add(new THREE.SphereGeometry(r, 10, 8), mucM, x, y, z, nose, noCast);
  // airflow particles: small streaks streaming down the passage
  const airM = std({ color: '#cfe8ff', roughness: 0.2, envMapIntensity: 1.6 });
  const parts = [];
  for (let i = 0; i < 16; i++) parts.push(add(new THREE.SphereGeometry(0.04, 12, 8), airM, 0, 0, 0, nose, noCast));
  // warm pink point lights inside the passage (distance-limited: they
  // never reach the bedroom 54 m below)
  const pl1 = new THREE.PointLight('#ff9a8a', 12, 12, 2); pl1.position.set(0, 0.4, -2.5); nose.add(pl1);
  const pl2 = new THREE.PointLight('#ff7a6a', 8, 10, 2); pl2.position.set(0, 0.2, 2.5); nose.add(pl2);
  const pl3 = new THREE.PointLight('#ff8a7a', 5, 8, 2); pl3.position.set(0, 0.3, 3.8); nose.add(pl3);
  // per-frame updater (called from main.js renderFrame): swell + airflow
  world.userData.updateNose = (f) => {
    const inTurb = f >= 216 && f <= 456, inLie = f >= 697 && f <= 940;
    let fill = 0.15, flow = 1;
    if (inLie) { const p = (f - 697) / (940 - 697); fill = 0.15 + 0.85 * p; flow = 1 - 0.8 * p; }
    const s = (0.55 + 0.45 * fill) * (1 + 0.01 * Math.sin(f * 0.1));
    turbL.scale.setScalar(s); turbR.scale.setScalar(s);
    for (let i = 0; i < parts.length; i++) {
      const pt = parts[i];
      const z = ((f * 0.10 * flow + i * 0.56) % 9) - 4.5;
      const x = 0.25 * Math.sin(i * 2.3 + f * 0.08) * (0.5 + 0.5 * flow);
      const y = 0.12 * Math.sin(i * 1.7 + f * 0.05);
      pt.position.set(x, y, z);
      const ps = 0.4 + 0.6 * flow;
      pt.scale.set(ps, ps, ps * 2.2); // streaked along the flow
      pt.visible = inTurb || inLie;
    }
  };
};

// ---------- bedroom (kit-051v2 — "Why Does Your Nose Get Stuffy When You Lie Down?") ----------
// EXPLAINER version (Shanty 27 Nov 18:45 WIB): BOLD colors, BRIGHT light —
// no more dark indigo night. Aqua-teal walls, coral blanket, sunny yellow
// rug, daylight + big sun through the window, like Claude's bright flat 2D.
// Room: floor top at y = DECK (6), x -27..-16, z -4.5..4.5, ceiling y 12.6.
// Bed along the back wall (headboard x -26, pillow ~-25.4, z -3.2).
// Nerd SOL (-23.0, DECK, 0.5) stands mid-room in front of the bed.
// Daylight comes through the window on the left wall (x = X0).
export const buildBedroom = (ctx) => {
  const { THREE, scene, world, add, box, tbox, texM, toon, P, DECK } = ctx;
  const wallM = toon({ color: '#2fb3a8' });       // bold aqua-teal walls
  const wallLow = toon({ color: '#25a094' });
  const ceilM = toon({ color: '#fdf6e3' });       // warm white ceiling
  const floorM = toon({ color: '#c98f4e' });      // light honey wood floor
  const wood = toon({ color: '#9a6a3c' });
  const woodDark = toon({ color: '#7a5230' });
  const sheetM = toon({ color: '#fffdf5' });
  const blanketM = toon({ color: '#e8483f' });    // BOLD coral blanket
  const pillowM = toon({ color: '#ffffff' });
  const lampShadeM = toon({ color: '#ffd94d' });   // sunny yellow shade
  const lampGlowM = new THREE.MeshBasicMaterial({ color: '#ffe9b0' });
  const daySkyM = new THREE.MeshBasicMaterial({ color: '#7ec8f0' }); // bright day sky
  const sunM = new THREE.MeshBasicMaterial({ color: '#ffe066' });    // big sun disc
  const rugM = toon({ color: '#ffc93c' });        // bold yellow rug
  const bookCols = ['#c0392b', '#2f6a43', '#3f6fb5'];

  const X0 = -27, X1 = -16, Z0 = -4.5, Z1 = 4.5, TOP = DECK + 6.6;

  // floor + ceiling
  add(tbox(X1 - X0, 0.3, Z1 - Z0, 1.2), floorM, (X0 + X1) / 2, DECK - 0.15, 0, world, { cast: false });
  add(tbox(X1 - X0, 0.25, Z1 - Z0, 2), ceilM, (X0 + X1) / 2, TOP + 0.12, 0, world, { cast: false });
  // walls: bold teal plaster + darker wainscot band
  const wall = (w, h, d, x, y, z, mat) => add(tbox(w, h, d, 1.6), mat, x, y, z, world, { cast: false });
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z0, wallM);
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z1, wallM);
  wall(0.3, 6.6, Z1 - Z0, X0, DECK + 3.3, 0, wallM);
  wall(0.3, 6.6, Z1 - Z0, X1, DECK + 3.3, 0, wallM);
  // skirting
  for (const z of [Z0 + 0.18, Z1 - 0.18]) add(tbox(X1 - X0, 0.22, 0.1, 1), woodDark, (X0 + X1) / 2, DECK + 0.11, z, world, { cast: false });

  // window on the left wall (x = X0): bright day sky + big sun + frame
  const win = new THREE.Group(); win.position.set(X0 + 0.18, DECK + 3.4, 0); world.add(win);
  add(new THREE.PlaneGeometry(2.6, 2.4), daySkyM, 0, 0, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(new THREE.CircleGeometry(0.5, 24), sunM, 0.02, 0.55, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(box(0.12, 2.6, 0.12), wood, 0, 1.25, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, -1.25, 0, win, { cast: false });
  add(box(0.12, 0.12, 2.8), wood, 0, 0, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, 0, 0, win, { cast: false }); // vertical centre bar
  add(box(0.3, 0.12, 3.0), wood, 0.05, -1.35, 0, win, { cast: false }); // sill
  // curtain panels (bold coral, pulled to the sides)
  for (const s of [-1, 1]) {
    const cur = add(box(0.1, 2.9, 0.55), toon({ color: '#ff7a59' }), 0.12, 0, s * 1.45, win, { cast: false });
    cur.rotation.x = s * 0.06;
  }

  // bed along the back wall: frame + mattress + headboard + pillow + blanket
  const bed = new THREE.Group(); bed.position.set(-24.1, DECK, -3.2); world.add(bed);
  add(box(3.8, 0.35, 2.3), wood, 0, 0.2, 0, bed);
  add(box(3.6, 0.3, 2.1), sheetM, 0, 0.52, 0, bed, { cast: false }); // mattress
  add(box(0.15, 1.3, 2.3), woodDark, -1.95, 0.95, 0, bed); // headboard
  add(box(0.9, 0.18, 1.0), pillowM, -1.35, 0.75, 0, bed); // pillow (head end)
  add(box(2.2, 0.12, 2.15), blanketM, 0.7, 0.7, 0, bed, { cast: false }); // dusty rose blanket
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]])
    add(box(0.14, 0.4, 0.14), woodDark, sx * 1.75, 0.2, sz * 1.0, bed);

  // nightstand + bedside lamp (back-right wall)
  const ns = new THREE.Group(); ns.position.set(-19.3, DECK, -4.0); world.add(ns);
  add(box(0.9, 0.85, 0.6), wood, 0, 0.42, 0, ns);
  add(box(0.8, 0.08, 0.5), woodDark, 0, 0.88, 0, ns, { cast: false }); // top slab
  add(new THREE.CylinderGeometry(0.09, 0.12, 0.3, 10), woodDark, 0, 1.0, 0, ns); // lamp base
  add(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 12), lampShadeM, 0, 1.3, 0, ns); // shade
  add(new THREE.SphereGeometry(0.12, 10, 8), lampGlowM, 0, 1.28, 0, ns); // bulb glow
  // the nerd's book stack on the nightstand (he reads before bed)
  bookCols.forEach((col, i) => add(box(0.3, 0.07, 0.22), toon({ color: col }), -0.25, 0.95 + i * 0.08, 0.12, ns));
  const lamp = new THREE.PointLight('#ffe9a8', 12, 16, 2);
  lamp.position.set(-19.3, DECK + 1.5, -3.9);
  scene.add(lamp);

  // rug (bold yellow) mid-room + slippers by the bed
  add(box(2.2, 0.04, 1.4), rugM, -21.8, DECK + 0.03, 0.4, world, { cast: false });
  add(box(0.5, 0.06, 0.22), toon({ color: '#ff5a8a' }), -22.2, DECK + 0.05, -1.6, world, { cast: false });
  add(box(0.5, 0.06, 0.22), toon({ color: '#ff5a8a' }), -22.2, DECK + 0.05, -1.2, world, { cast: false });

  // shelf with books on the front wall + mint wardrobe on the right wall
  add(box(1.8, 0.08, 0.4), wood, -19.0, DECK + 2.4, 4.15, world);
  bookCols.forEach((col, i) => add(box(0.16, 0.55 - i * 0.05, 0.3), toon({ color: col }), -19.6 + i * 0.2, DECK + 2.72, 4.15, world));
  add(box(0.8, 3.4, 2.0), toon({ color: '#7ed491' }), -16.4, DECK + 1.7, 2.0, world, { cast: false }); // mint wardrobe
  add(box(0.06, 3.0, 0.08), wood, -16.0, DECK + 1.7, 2.0, world, { cast: false }); // wardrobe door seam
  add(new THREE.SphereGeometry(0.06, 10, 8), toon({ color: '#c8ccd2' }), -15.98, DECK + 1.6, 1.7, world); // knob

  // moonlight shaft: removed — the translucent quad read as a giant grey
  // slab across the frame in smoke renders. The window + moon disc carry
  // the moonlight on their own.

  return { groundY: DECK };
};

// ---------- night lane (eerie test — "The Window That Watched Back") ----------
// Outdoor night street. Floor top at y = DECK (6), x -30..-13, z -6..+6.
// Narrator walks +x along the street (z ~ 0). House facades stand on the
// back line (z = -5.5): main house x -20.8..-16.2 with the door at -18.5 and
// two upper windows at -19.7 / -17.3 (centred y = DECK+4.2). The windows
// themselves are dark meshes here; the LIT window is a card from story.js
// (actorsAt) so it can switch on/off per shot. Same for the door glow.
// Streetlamps at (-26.5, 2.6) and (-20.3, 2.6); lamp2 is the flickering one
// (its glow is an FX card, the mesh head stays dark). Bare tree at (-28.2,
// -3.8). End caps at both street ends so no void shows through the fog.
export const buildNightStreet = (ctx) => {
  const { THREE, scene, world, add, box, tbox, texM, toon, P, DECK } = ctx;
  const cobble = texM(P.stone(31, 222, 10, 26), 1, 1);
  const facadeA = toon({ color: '#2b3345' });
  const facadeB = toon({ color: '#242b3a' });
  const facadeC = toon({ color: '#1e2534' });
  const roofM = toon({ color: '#151a25' });
  const doorWood = toon({ color: '#3a2a1c' });
  const doorDark = toon({ color: '#241a12' });
  const winDark = toon({ color: '#0a0d15' });
  const iron = toon({ color: '#3c3a38' });
  const lampGlowM = new THREE.MeshBasicMaterial({ color: '#ffd9a0' });
  const trunkM = toon({ color: '#14100c' });
  const fenceM = toon({ color: '#241c14' });
  const barrelM = toon({ color: '#4a3620' });

  // street floor (cobbles) + a darker centre strip where the nerd walks
  add(tbox(17, 0.3, 12, 2), cobble, -21.5, DECK - 0.15, 0, world, { cast: false });
  add(box(17, 0.04, 1.4), toon({ color: '#232936' }), -21.5, DECK + 0.02, 0, world, { cast: false });

  // house facades on the back line (front face at z = -5.5)
  const facade = (w, h, x, y, mat) => add(tbox(w, h, 0.3, 2), mat, x, y, -5.65, world, { cast: false });
  facade(4.6, 6.4, -18.5, DECK + 3.2, facadeA); // main house
  facade(4.0, 4.2, -24.5, DECK + 2.1, facadeB); // left neighbour
  facade(2.6, 5.0, -14.4, DECK + 2.5, facadeC); // right neighbour (partial)
  // pitched roofs (4-sided cones, rotated 45 deg). Footprint exactly w x d:
  // cone base is a square of side r*sqrt(2); scale x/z to hit w and d.
  const roof = (x, y, w, d) => {
    const r = Math.max(w, d) / 2 + 0.3;
    const m = add(new THREE.ConeGeometry(r, 1.4, 4), roofM, x, y, -5.65, world);
    m.rotation.y = Math.PI / 4; m.scale.set(w / (r * 1.414), 1, d / (r * 1.414));
  };
  roof(-18.5, DECK + 7.1, 4.6, 2.2);
  roof(-24.5, DECK + 4.9, 4.0, 2.2);
  roof(-14.4, DECK + 5.7, 2.6, 2.2);
  // door (main house) + step + frame
  add(box(1.1, 2.6, 0.12), doorWood, -18.5, DECK + 1.3, -5.48, world, { cast: false });
  add(box(1.3, 0.12, 0.16), doorDark, -18.5, DECK + 2.66, -5.46, world, { cast: false });
  add(box(1.6, 0.18, 0.8), toon({ color: '#2e2a24' }), -18.5, DECK + 0.09, -5.0, world, { cast: false });
  add(new THREE.SphereGeometry(0.06, 10, 8), iron, -18.05, DECK + 1.35, -5.4, world);
  // dark windows (meshes). NOTE: the two UPPER windows of the main house
  // are NOT meshes — the lit-window CARDS from story.js are the windows
  // there (a mesh behind a billboard card occludes it at oblique angles).
  const win = (x, y, w = 1.1, h = 1.5) => {
    add(box(w, h, 0.08), winDark, x, y, -5.48, world, { cast: false });
    add(box(0.07, h, 0.1), iron, x, y, -5.44, world, { cast: false });
    add(box(w, 0.07, 0.1), iron, x, y, -5.44, world, { cast: false });
  };
  win(-17.0, DECK + 1.6, 0.9, 1.2); // ground dark window
  win(-25.6, DECK + 2.6, 0.9, 1.2); win(-23.4, DECK + 2.6, 0.9, 1.2); // left house
  win(-14.4, DECK + 3.2, 0.9, 1.2); // right house
  // door on the left house (dark, never opens)
  add(box(0.95, 2.2, 0.1), doorDark, -24.5, DECK + 1.1, -5.48, world, { cast: false });

  // streetlamps: post + arm + head; lamp2 is the flickering one
  const lamp = (x, z) => {
    add(new THREE.CylinderGeometry(0.09, 0.13, 3.4, 10), iron, x, DECK + 1.7, z, world);
    add(box(0.09, 0.09, 1.0), iron, x, DECK + 3.35, z - 0.45, world);
    add(box(0.34, 0.22, 0.34), iron, x, DECK + 3.28, z - 0.9, world);
    add(new THREE.SphereGeometry(0.17, 12, 10), lampGlowM, x, DECK + 3.1, z - 0.9, world);
  };
  lamp(-26.5, 2.6); lamp(-20.3, 2.6);
  const lamp1 = new THREE.PointLight('#ffc890', 8, 14, 2);
  lamp1.position.set(-26.5, DECK + 3.1, 1.7); scene.add(lamp1);
  const lamp2 = new THREE.PointLight('#ffc890', 20, 20, 2);
  lamp2.position.set(-20.3, DECK + 3.1, 1.7); scene.add(lamp2);

  // bare tree (silhouette): trunk + 3 modest branches, Y-shaped
  const tree = new THREE.Group(); tree.position.set(-28.2, DECK, -3.8); world.add(tree);
  add(new THREE.CylinderGeometry(0.13, 0.2, 3.6, 8), trunkM, 0, 1.8, 0, tree);
  const branch = (ry, rz, len, y0) => {
    const b = add(box(0.05, len, 0.05), trunkM, 0, y0 + len * 0.42, 0, tree);
    b.rotation.set(0, ry, rz); b.position.x = Math.sin(rz) * len * 0.42;
  };
  branch(0.3, 0.45, 1.5, 3.4);
  branch(-0.5, -0.5, 1.3, 3.5);
  branch(1.1, 0.35, 1.1, 3.6);
  add(new THREE.CylinderGeometry(0.42, 0.38, 0.9, 14), barrelM, -25.5, DECK + 0.45, -4.2, world);
  add(box(0.7, 0.7, 0.7), fenceM, -24.7, DECK + 0.35, -4.4, world);

  // low fence along the front (z = +5.5) — foreground depth for wide shots
  for (let x = -29; x <= -14; x += 1.25) add(box(0.09, 1.1, 0.09), fenceM, x, DECK + 0.55, 5.5, world, { cast: false });
  add(box(15.5, 0.09, 0.09), fenceM, -21.5, DECK + 0.95, 5.5, world, { cast: false });
  add(box(15.5, 0.09, 0.09), fenceM, -21.5, DECK + 0.5, 5.5, world, { cast: false });

  // end caps so no void shows through the fog at either street end
  add(box(1.5, 9, 12), toon({ color: '#141a26' }), -30.8, DECK + 4.5, 0, world, { cast: false });
  add(box(1.5, 9, 12), toon({ color: '#141a26' }), -12.2, DECK + 4.5, 0, world, { cast: false });

  return { groundY: DECK };
};

// ---------- bedroomCine (kit-051-3d-v2 — REDESIGN, Zack D. Films) ----------
// CINEMATIC NIGHT bedroom. Same room + layout as bedroom3d (bed along the
// back wall, window on the left wall, nightstand + lamp, rug, wardrobe,
// shelf of books) but re-lit and re-dressed: cool moonlight vs warm
// tungsten, muted plaster + dark walnut, deep rust blanket, real clutter
// (books, glass of water, alarm clock, phone, poster, plant, dust motes).
// No flat teal walls, no flat coral, no sunny yellow. The redesigned nerd
// (nerd2.js) lies in this bed; the blanket bump matches his slimmer torso.
export const buildBedroomCine = (ctx) => {
  const { THREE, scene, world, add, box, tbox, std, stdM, P, DECK } = ctx;
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // REV round (Shanty 27 Nov): room was too dark — walls lig 30->40,
  // ceiling #23232c->#3a3a46, floor lig 26->32. Still night, but readable.
  const wallM = stdM(P.softWall(60, 215, 20, 40), 2, 1);   // muted blue-grey plaster
  const wallLowM = stdM(P.softWall(61, 215, 16, 32), 2, 1);
  const ceilM = std({ color: '#3a3a46', roughness: 0.95 });
  const floorM = stdM(P.softWood(62, 25, 38, 32), 3, 3);   // dark walnut
  const wood = std({ color: '#4a3220', roughness: 0.7 });
  const woodDark = std({ color: '#332216', roughness: 0.7 });
  const sheetM = stdM(P.softSheet(63), 2, 2);
  const blanketM = stdM(P.softFabric(64, 8, 55, 34), 2, 2); // deep rust, woven
  const pillowM = stdM(P.softSheet(65), 1, 1);
  const lampShadeM = std({ color: '#c98a3a', roughness: 0.6 });
  const lampGlowM = new THREE.MeshBasicMaterial({ color: '#ffb46a' });
  const curtainM = stdM(P.softFabric(66, 220, 22, 26), 1, 1); // heavy slate curtains
  const rugM = stdM(P.softFabric(67, 30, 25, 38), 1, 1);      // muted rug
  const bookCols = ['#c0392b', '#2f6a43', '#3f6fb5'];

  const X0 = -27, X1 = -16, Z0 = -4.5, Z1 = 4.5, TOP = DECK + 6.6;

  // floor + ceiling
  add(tbox(X1 - X0, 0.3, Z1 - Z0, 1.2), floorM, (X0 + X1) / 2, DECK - 0.15, 0, world, { cast: false });
  add(tbox(X1 - X0, 0.25, Z1 - Z0, 2), ceilM, (X0 + X1) / 2, TOP + 0.12, 0, world, { cast: false });
  // walls: muted plaster + dark wood wainscot band
  const wall = (w, h, d, x, y, z, mat) => add(tbox(w, h, d, 1.6), mat, x, y, z, world, { cast: false });
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z0, wallM);
  wall(X1 - X0, 6.6, 0.3, (X0 + X1) / 2, DECK + 3.3, Z1, wallM);
  wall(0.3, 6.6, Z1 - Z0, X0, DECK + 3.3, 0, wallM);
  wall(0.3, 6.6, Z1 - Z0, X1, DECK + 3.3, 0, wallM);
  wall(X1 - X0, 1.1, 0.34, (X0 + X1) / 2, DECK + 0.55, Z0, wallLowM);
  wall(X1 - X0, 1.1, 0.34, (X0 + X1) / 2, DECK + 0.55, Z1, wallLowM);
  for (const z of [Z0 + 0.18, Z1 - 0.18]) add(tbox(X1 - X0, 0.22, 0.1, 1), woodDark, (X0 + X1) / 2, DECK + 0.11, z, world, { cast: false });

  // window on the left wall (x = X0): night sky canvas (dark blue + stars
  // + moon) + frame + sill. The moon is the cool key light.
  const nightSky = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#0e1a33'); gr.addColorStop(0.6, '#16233f'); gr.addColorStop(1, '#1e2c4a');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const r = P.rng(71);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; g.beginPath(); g.arc(r() * 256, r() * 256, 0.8 + r() * 1.4, 0, 7); g.fill(); }
    const mg = g.createRadialGradient(190, 70, 4, 190, 70, 42);
    mg.addColorStop(0, '#f4f7ff'); mg.addColorStop(0.35, '#dfe8f8'); mg.addColorStop(0.6, 'rgba(200,215,240,0.25)'); mg.addColorStop(1, 'rgba(200,215,240,0)');
    g.fillStyle = mg; g.beginPath(); g.arc(190, 70, 42, 0, 7); g.fill();
    g.fillStyle = '#e8eef8'; g.beginPath(); g.arc(190, 70, 20, 0, 7); g.fill();
    g.fillStyle = 'rgba(160,175,200,0.5)';
    g.beginPath(); g.arc(184, 64, 4, 0, 7); g.arc(196, 76, 3, 0, 7); g.arc(192, 60, 2.5, 0, 7); g.fill();
    return c;
  })();
  const nightSkyM = new THREE.MeshBasicMaterial({ map: P.tex(nightSky, 1, 1) });
  const win = new THREE.Group(); win.position.set(X0 + 0.18, DECK + 3.4, 0); world.add(win);
  add(new THREE.PlaneGeometry(2.6, 2.4), nightSkyM, 0, 0, 0, win, { cast: false }).rotation.y = Math.PI / 2;
  add(box(0.12, 2.6, 0.12), wood, 0, 1.25, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, -1.25, 0, win, { cast: false });
  add(box(0.12, 0.12, 2.8), wood, 0, 0, 0, win, { cast: false });
  add(box(0.12, 2.6, 0.12), wood, 0, 0, 0, win, { cast: false });
  add(box(0.3, 0.12, 3.0), wood, 0.05, -1.35, 0, win, { cast: false });
  // heavy slate curtains with real vertical folds (displaced planes)
  for (const s of [-1, 1]) {
    const cg = new THREE.PlaneGeometry(0.6, 3.0, 8, 1);
    const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, 0.07 * Math.sin(cp.getY(i) * 8 + s));
    cg.computeVertexNormals();
    const cur = add(cg, curtainM, 0.16, 0, s * 1.5, win, { cast: false });
    cur.rotation.y = Math.PI / 2; cur.rotation.x = s * 0.03;
  }
  // moonlight shaft: very soft additive gradient plane from the window.
  // Opacity is deliberately low — if it reads as a slab in stills, delete it.
  const shaftCv = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(150,180,230,0.55)'); gr.addColorStop(1, 'rgba(150,180,230,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    return c;
  })();
  const shaftM = new THREE.MeshBasicMaterial({ map: P.tex(shaftCv, 1, 1), transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const shaft = add(new THREE.PlaneGeometry(2.4, 7.5), shaftM, -24.6, DECK + 2.6, -1.6, world, { cast: false });
  shaft.rotation.set(0.35, 0.9, 0.5);

  // bed along the back wall: dark frame + mattress + headboard + dented pillow + folded blanket
  const bed = new THREE.Group(); bed.position.set(-24.1, DECK, -3.2); world.add(bed);
  add(box(3.8, 0.35, 2.3), wood, 0, 0.2, 0, bed);
  const sheetSideM = std({ color: '#d8cbb0', roughness: 0.9 }); // muted cream — the bright #e8e0cc glared in the dark room (round 1)
  const mattressM = [sheetSideM, sheetSideM, sheetM, sheetSideM, sheetSideM, sheetSideM];
  add(box(3.6, 0.3, 2.1), mattressM, 0, 0.52, 0, bed, { cast: false });
  add(box(0.15, 1.3, 2.3), woodDark, -1.95, 0.95, 0, bed);
  const pillowGeo = new THREE.SphereGeometry(0.55, 48, 32);
  {
    const pp = pillowGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i);
      const dx = (x + 0.12) / 0.34, dz = z / 0.34, d2 = dx * dx + dz * dz;
      if (y > 0) pp.setY(i, y - 0.26 * Math.exp(-d2) * Math.max(0, y / 0.55));
    }
    pillowGeo.computeVertexNormals();
  }
  const pillow = add(pillowGeo, pillowM, -1.35, 0.62, 0, bed);
  pillow.scale.set(0.85, 0.32, 0.95);
  // blanket: displaced plane — body bump where the redesigned nerd lies
  // (slimmer torso than v1: chest 0.30, legs 0.22), sine folds, foot drape
  const blGeo = new THREE.PlaneGeometry(3.0, 2.0, 48, 32);
  blGeo.rotateX(-Math.PI / 2);
  {
    const pp = blGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const x = pp.getX(i), z = pp.getZ(i);
      const sx = sstep(-1.35, -1.05, x) * (1 - sstep(0.35, 0.65, x));
      const sz = Math.max(0, Math.cos((z / 0.95) * Math.PI / 2));
      const profile = 0.36 * (1 - 0.28 * sstep(-0.1, 0.35, x)); // v3 round 3: 0.34->0.36 — matches LIE_POS 6.88 so the torso stays covered
      let y = profile * sx * sz;
      y += 0.06 * sstep(-1.35, -1.1, x) * (1 - sstep(-0.9, -0.6, x)) * sz;
      y += (0.022 + 0.02 * sx) * Math.sin(x * 13 + z * 2.5);
      y += 0.012 * Math.sin(x * 27 + 1.7);
      y -= 0.30 * sstep(1.15, 1.5, x);
      y -= 0.06 * sstep(0.9, 1.0, Math.abs(z));
      pp.setY(i, y);
    }
    blGeo.computeVertexNormals();
  }
  const blanket = add(blGeo, blanketM, 0.3, 0.70, 0, bed, { cast: false });
  blanket.material.side = THREE.DoubleSide;
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]])
    add(box(0.14, 0.4, 0.14), woodDark, sx * 1.75, 0.2, sz * 1.0, bed);

  // nightstand + bedside lamp — REV round: moved from x -19.3 (3 m from
  // the bed, out of every wide frame) to x -22.0, beside the bed foot,
  // so the f=150 wide holds window + lamp + bed in ONE frame.
  const ns = new THREE.Group(); ns.position.set(-22.0, DECK, -4.0); world.add(ns);
  add(box(0.9, 0.85, 0.6), wood, 0, 0.42, 0, ns);
  add(box(0.8, 0.08, 0.5), woodDark, 0, 0.88, 0, ns, { cast: false });
  add(new THREE.CylinderGeometry(0.09, 0.12, 0.3, 10), woodDark, 0, 1.0, 0, ns);
  add(new THREE.CylinderGeometry(0.22, 0.32, 0.4, 12), lampShadeM, 0, 1.3, 0, ns);
  add(new THREE.SphereGeometry(0.12, 10, 8), lampGlowM, 0, 1.28, 0, ns);
  // clutter on the nightstand: book stack + glass of water + alarm clock + phone
  bookCols.forEach((col, i) => add(box(0.3, 0.07, 0.22), std({ color: col, roughness: 0.7 }), -0.25, 0.95 + i * 0.08, 0.12, ns));
  const glassM = new THREE.MeshStandardMaterial({ color: '#bcd8e8', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.35, envMapIntensity: 1.4 });
  add(new THREE.CylinderGeometry(0.09, 0.08, 0.22, 14), glassM, 0.28, 1.03, -0.12, ns);
  add(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 14), std({ color: '#9ab8cc', roughness: 0.1 }), 0.28, 1.0, -0.12, ns, { cast: false }); // water
  const clock = new THREE.Group(); clock.position.set(0.05, 1.02, 0.18); ns.add(clock);
  add(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 20), std({ color: '#2a2a30', roughness: 0.5 }), 0, 0, 0, clock).rotation.x = Math.PI / 2;
  add(new THREE.CircleGeometry(0.11, 20), std({ color: '#f5f2ea', roughness: 0.4 }), 0, 0, 0.035, clock);
  add(box(0.012, 0.07, 0.008), std({ color: '#1c1a18', roughness: 0.4 }), 0, 0.02, 0.04, clock).rotation.z = 0.5;
  add(box(0.012, 0.05, 0.008), std({ color: '#1c1a18', roughness: 0.4 }), 0.01, 0, 0.04, clock).rotation.z = -1.1;
  add(new THREE.SphereGeometry(0.035, 10, 8), std({ color: '#8a6a1f', roughness: 0.4, metalness: 0.5 }), -0.09, 0.13, 0, clock);
  add(new THREE.SphereGeometry(0.035, 10, 8), std({ color: '#8a6a1f', roughness: 0.4, metalness: 0.5 }), 0.09, 0.13, 0, clock);
  add(box(0.3, 0.02, 0.16), std({ color: '#1c1a18', roughness: 0.35 }), -0.28, 0.93, -0.18, ns); // phone
  // REV round: lamp 18->32, moon 8->16 — v2's room read almost black.
  // Plus a warm fill above the bed so the sleeping face lifts out of
  // the dark (moon cool from the left, lamp warm from the right).
  const lamp = new THREE.PointLight('#ffb46a', 32, 16, 2);
  lamp.position.set(-22.0, DECK + 1.5, -3.9);
  scene.add(lamp);
  const bedFill = new THREE.PointLight('#ffb46a', 8, 9, 2);
  bedFill.position.set(-24.0, DECK + 4.2, -1.2);
  scene.add(bedFill);
  // moonlight spill through the window: cool fill from the left wall so
  // the bed reads in cool blue against the lamp's warm amber (the scene
  // sun can't enter — the room walls are solid).
  const moon = new THREE.PointLight('#8ab0e8', 16, 12, 2);
  moon.position.set(-25.8, DECK + 3.2, 0);
  scene.add(moon);

  // rug (muted, woven) mid-room + slippers by the bed
  const rugGeo = new THREE.CircleGeometry(1.1, 32);
  const rug = add(rugGeo, rugM, -21.8, DECK + 0.03, 0.4, world, { cast: false });
  rug.rotation.x = -Math.PI / 2;
  const rugInner = add(new THREE.CircleGeometry(0.8, 32), stdM(P.softFabric(68, 35, 30, 44), 1, 1), -21.8, DECK + 0.035, 0.4, world, { cast: false });
  rugInner.rotation.x = -Math.PI / 2;
  add(box(0.5, 0.06, 0.22), std({ color: '#3a2a20', roughness: 0.8 }), -22.2, DECK + 0.05, -1.6, world, { cast: false });
  add(box(0.5, 0.06, 0.22), std({ color: '#3a2a20', roughness: 0.8 }), -22.2, DECK + 0.05, -1.2, world, { cast: false });

  // poster (framed muted landscape) on the front wall + shelf of books
  const posterCv = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 192;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 192);
    gr.addColorStop(0, '#2a3a55'); gr.addColorStop(0.55, '#8a6a4a'); gr.addColorStop(1, '#3a2a1c');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(200, 40, 16, 0, 7); g.fill();
    g.fillStyle = '#1e2a3a';
    g.beginPath(); g.moveTo(0, 192); g.lineTo(70, 80); g.lineTo(140, 192); g.fill();
    g.beginPath(); g.moveTo(90, 192); g.lineTo(170, 60); g.lineTo(256, 192); g.fill();
    g.fillStyle = '#2e4a2a'; g.fillRect(0, 160, 256, 32);
    return c;
  })();
  const poster = add(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshStandardMaterial({ map: P.tex(posterCv, 1, 1), roughness: 0.85 }), -22.5, DECK + 3.6, 4.32, world, { cast: false });
  poster.rotation.y = Math.PI;
  add(box(1.66, 1.26, 0.06), woodDark, -22.5, DECK + 3.6, 4.36, world, { cast: false });
  // REV round: the f=150 wide's top half was a big empty dark wall — the
  // back wall above the bed had NOTHING on it. Two framed pictures above
  // the headboard + a wall shelf with books above the nightstand.
  const picCv = (seed, sky1, sky2, sunX) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 192;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 192);
    gr.addColorStop(0, sky1); gr.addColorStop(0.6, sky2); gr.addColorStop(1, '#2a2018');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(sunX, 42, 15, 0, 7); g.fill();
    g.fillStyle = '#1e2a3a';
    g.beginPath(); g.moveTo(0, 192); g.lineTo(80, 90); g.lineTo(150, 192); g.fill();
    g.beginPath(); g.moveTo(100, 192); g.lineTo(180, 70); g.lineTo(256, 192); g.fill();
    g.fillStyle = '#2e4a2a'; g.fillRect(0, 164, 256, 28);
    return c;
  };
  for (const [px, seed, s1, s2, sx] of [[-24.8, 91, '#3a2a4a', '#8a5a4a', 200], [-22.8, 92, '#1e3a4a', '#4a7a6a', 60]]) {
    add(new THREE.PlaneGeometry(1.3, 0.95), new THREE.MeshStandardMaterial({ map: P.tex(picCv(seed, s1, s2, sx), 1, 1), roughness: 0.85 }), px, DECK + 4.6, -4.32, world, { cast: false });
    add(box(1.44, 1.09, 0.06), woodDark, px, DECK + 4.6, -4.36, world, { cast: false });
  }
  // wall shelf with books above the nightstand (back wall, right of bed)
  add(box(1.4, 0.07, 0.32), wood, -20.6, DECK + 3.3, -4.3, world);
  bookCols.forEach((col, i) => add(box(0.15, 0.5 - i * 0.04, 0.26), std({ color: col, roughness: 0.7 }), -21.1 + i * 0.19, DECK + 3.6, -4.3, world));
  add(box(1.8, 0.08, 0.4), wood, -19.0, DECK + 2.4, 4.15, world);
  bookCols.forEach((col, i) => add(box(0.16, 0.55 - i * 0.05, 0.3), std({ color: col, roughness: 0.7 }), -19.6 + i * 0.2, DECK + 2.72, 4.15, world));
  // wardrobe (dark wood) on the right wall
  add(box(0.8, 3.4, 2.0), std({ color: '#3a2a1a', roughness: 0.8 }), -16.4, DECK + 1.7, 2.0, world, { cast: false });
  add(box(0.06, 3.0, 0.08), wood, -16.0, DECK + 1.7, 2.0, world, { cast: false });
  add(new THREE.SphereGeometry(0.06, 10, 8), std({ color: '#c8a24a', roughness: 0.35, metalness: 0.6 }), -15.98, DECK + 1.6, 1.7, world);
  // plant in the far corner (pot + leaves)
  const plant = new THREE.Group(); plant.position.set(-16.9, DECK, -3.9); world.add(plant);
  add(new THREE.CylinderGeometry(0.28, 0.2, 0.45, 12), std({ color: '#6a3a28', roughness: 0.8 }), 0, 0.22, 0, plant);
  const leafM = std({ color: '#2e4a22', roughness: 0.8 });
  for (let i = 0; i < 7; i++) {
    const leaf = add(new THREE.SphereGeometry(0.2, 8, 6), leafM, Math.sin(i * 2.4) * 0.18, 0.8 + (i % 3) * 0.2, Math.cos(i * 2.4) * 0.18, plant);
    leaf.scale.set(0.7, 1.8, 0.7); leaf.rotation.z = Math.sin(i * 2.4) * 0.4;
  }
  // dust motes drifting in the lamp light + moonlight (static for stills)
  const moteM = new THREE.MeshBasicMaterial({ color: '#ffe9b0', transparent: true, opacity: 0.55 });
  const moteR = P.rng(81);
  for (let i = 0; i < 36; i++) {
    const nearLamp = i < 22;
    const x = nearLamp ? -22.0 + (moteR() - 0.5) * 2.2 : -25.5 + (moteR() - 0.5) * 2.5;
    const y = DECK + 0.8 + moteR() * (nearLamp ? 2.6 : 3.2);
    const z = nearLamp ? -3.9 + (moteR() - 0.5) * 2.0 : -2.2 + (moteR() - 0.5) * 2.4;
    add(new THREE.SphereGeometry(0.008 + moteR() * 0.008, 6, 4), moteM, x, y, z, world, { cast: false });
  }

  return { groundY: DECK };
};

// ---------- 3D nasal passage v2 (kit-051-3d-v2 — REDESIGN) ----------
// Zack's signature mechanism close-up, rebuilt properly. v1 failed because
// it was two smooth ellipsoids floating in a perfect cylinder. v2:
// - the PASSAGE is an irregular folded tube (custom BufferGeometry:
//   S-curved centreline, rounded-triangular cross-section with a flattened
//   floor, longitudinal folds, varying radius) — not a cylinder;
// - a SEPTUM (wavy vertical wall) divides the cavity into left/right;
// - the TURBINATES are folded SCROLLS: cylinders displaced into
//   longitudinal folds with a curled lower edge, attached along the
//   lateral wall (never floating), inferior + middle on both sides;
// - mucosa is glossy (roughness ~0.32) with mucus blobs;
// - airflow is streak particles that slow + bunch when swollen;
// - blood drains DOWN through the turbinate in the gravity shot.
// The group sits at NOSE2_Y = 60, far above the bedroom (as in v1).
// Per-frame state comes from story.js shot ranges via updateNose2(f).
const NOSE2_Y = 60;
export const buildNose2 = (ctx) => {
  const { THREE, world, add, std, stdM, P } = ctx;
  const nose = new THREE.Group(); nose.position.set(0, NOSE2_Y, 0); world.add(nose);
  const noCast = { cast: false };
  // REV round: v2 was monochrome red — every part used nearly the same
  // softTissue (hue 4-10, lig 42-46). Now each part has its own tone so
  // the passage reads in layers: wall DEEP dark red, turbinates LIGHTER
  // pink-orange (they pop against the wall), septum PALE pink, far cap
  // DARK maroon (depth), rim skin-toned.
  const wallM = stdM(P.softTissue(70, 3, 58, 36), 2, 2);
  // FrontSide: the tube's winding faces INWARD (computed normals point
  // into the passage), so FrontSide renders the interior and culls the
  // outside. BackSide was the v2 round-1 bug — the tube vanished from
  // inside and the sky/clouds showed through the void.
  wallM.side = THREE.FrontSide; wallM.roughness = 0.42; wallM.envMapIntensity = 0.35; // v3: 0.5->0.35 — kills the white flame hotspot on the roof folds (f=300 round 1)
  const turbM = stdM(P.softTissue(71, 12, 70, 52), 1, 1);
  // roughness 0.55 + envMap 0.4: round 4's 0.32/1.0 blew the swollen
  // turbinate out to a pure-white pillar under the close point light.
  turbM.roughness = 0.55; turbM.envMapIntensity = 0.4;
  turbM.side = THREE.DoubleSide; // open-ended scrolls: render both faces

  // ---- passage: irregular folded tube, S-curved, flat floor ----
  const NZ = 28, NA = 20, Z0 = -3.5, Z1 = 3.5;
  const pos = [], uv = [], idx = [];
  for (let iz = 0; iz <= NZ; iz++) {
    const z = Z0 + (Z1 - Z0) * (iz / NZ);
    const cx = 0.12 * Math.sin(z * 0.5), cy = 0.08 * Math.sin(z * 0.8 + 1);
    const rz = 1 - 0.12 * Math.sin(z * 0.6); // narrower at entrance + back
    for (let ia = 0; ia <= NA; ia++) {
      const a = (ia / NA) * Math.PI * 2;
      let x = 0.95 * Math.cos(a), y = 0.85 * Math.sin(a);
      if (y < -0.5) y = -0.5 - (y + 0.5) * 0.25; // flattened floor
      if (y > 0.6) y = 0.6 + (y - 0.6) * 0.7;    // pinched roof
      const fold = 0.05 * Math.sin(a * 6 + z * 1.8) + 0.03 * Math.sin(a * 3 - z * 1.1);
      const rr = rz * (1 + fold);
      pos.push(cx + x * rr, cy + y * rr, z);
      uv.push(ia / NA * 4, iz / NZ * 3);
    }
  }
  for (let iz = 0; iz < NZ; iz++) for (let ia = 0; ia < NA; ia++) {
    const a = iz * (NA + 1) + ia, b = a + 1, c = a + NA + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const tubeGeo = new THREE.BufferGeometry();
  tubeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  tubeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  tubeGeo.setIndex(idx); tubeGeo.computeVertexNormals();
  const tube = add(tubeGeo, wallM, 0, 0, 0, nose, noCast);
  // far end capped with tissue (an open tube reads as a black void)
  const capM = stdM(P.softTissue(72, 2, 55, 26), 1, 1); capM.roughness = 0.5;
  const cap = add(new THREE.CircleGeometry(1.0, 28), capM, 0, 0, 3.5, nose, noCast);
  cap.rotation.y = Math.PI;
  // nostril rim at the entrance (skin-toned, rounded)
  const rimM = stdM(P.softTissue(73, 18, 45, 50), 1, 1); rimM.roughness = 0.4;
  const rim = add(new THREE.TorusGeometry(0.95, 0.2, 12, 28), rimM, 0, 0, -3.5, nose, noCast);

  // ---- v5 ILLUSTRATION BACKDROP (036 formula) ----
  // The pink tunnel is GONE in illustration shots (2-5): the mechanism
  // floats on ONE clean, consistent backdrop — warm cream -> dusty rose
  // (the video's own palette) with soft translucent bubbles baked in,
  // 036-style — plus a soft round stage floor the pool sits on. This kills
  // v4's gaps in one move: no empty pink floor, no roof-fold hotspot, no
  // septum-as-sail (no tunnel walls at all). The mechanism is the same
  // proven v4 geometry (scrolls, septum, streams, blood, pool); only its
  // stage changes. Backdrop is unlit (MeshBasicMaterial, fog:false) so it
  // reads flat and clean like 036's green, while the mechanism stays 3D
  // semi-realistic cartoon under the nose point lights.
  const bdCanvas = document.createElement('canvas'); bdCanvas.width = bdCanvas.height = 1024;
  {
    const g = bdCanvas.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1024);
    gr.addColorStop(0, '#f7e8d8'); gr.addColorStop(0.55, '#f2d3c4'); gr.addColorStop(1, '#e0ad9e');
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    const bub = (x, y, r, a) => { const rg = g.createRadialGradient(x, y, r * 0.2, x, y, r); rg.addColorStop(0, `rgba(255,255,255,${a})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    bub(120, 180, 120, 0.75); bub(880, 260, 150, 0.65); bub(760, 820, 130, 0.7); bub(180, 700, 95, 0.6); bub(520, 120, 80, 0.55); bub(940, 560, 95, 0.55); bub(80, 420, 75, 0.5); bub(420, 500, 110, 0.45); bub(680, 420, 70, 0.5);
  }
  const bdTex = new THREE.CanvasTexture(bdCanvas); bdTex.colorSpace = THREE.SRGBColorSpace;
  // z 3.8: behind the septum's back end (3.5); v5 round 4: 16x14 — round
  // 3's 11-wide backdrop left a dark sky band at the frame edge in the
  // diagonal close-up views (the plane's edge enters the frame).
  const backdrop = add(new THREE.PlaneGeometry(16, 14), new THREE.MeshBasicMaterial({ map: bdTex, fog: false, side: THREE.DoubleSide }), 0, 1, 3.8, nose, { cast: false });
  backdrop.receiveShadow = false;
  // v5 round 3: SMALL pedestal (r 1.5, was 1.9) under the pool only, and
  // it shows ONLY in the gravity shot — round 2's big disc filled the
  // bottom half of every illustration still with empty pink. The pool
  // sits at z -1.2, so the disc is centred z -0.3 (spans -1.8..1.2).
  const stageM = std({ color: '#eec9b8', roughness: 0.9, envMapIntensity: 0.1 });
  const stage = add(new THREE.CylinderGeometry(0.65, 0.75, 0.14, 40), stageM, 0, -0.62, -0.5, nose, noCast); // top at y -0.55 = pool base; v6 r2: r 0.65 (was 0.95) — the r 0.95 disc's bottom rim spanned ~95% of the frame in shot 3

  // ---- v6 NOSE CROSS-SECTION CONTEXT (Shanty 28 Nov: "video tentang
  // hidung harus mengilustrasikan hidungnya juga") ----
  // Coronal front-section of the nose, as a BACK PANEL at z 1.6 behind
  // the mechanism (a foreground frame can never enclose the mechanism:
  // the 9:16 frame is narrower closer to the camera, so anything in
  // front of the scrolls that covers them crops at the edges — the
  // panel MUST sit behind). The panel is the cut face: skin-tone outer
  // silhouette + mucosa-pink inner face, two DARK passage arches (the
  // open cavities), a pale septum ridge between them, and a dark
  // nostril opening + skin rim at the bottom of each passage. The
  // turbinates sit INSIDE the dark passages, hugging the outer walls.
  // All children are designed in LOCAL coords for the VERTICAL layout
  // (shots 2+4): true size = apparent-at-mechanism-plane x 1.44
  // (camera z ~-3.6, panel z 1.6). The updater re-lays the passages /
  // silhouette / nostrils out for the HORIZONTAL layout (shots 3+5),
  // where the scrolls sit wider (x ±0.78). Panel materials are
  // DoubleSide (camera sees the -z face) and lit, like the mechanism.
  // (2) Z-ORDER: the camera sits at -z looking +z, so SMALLER z is
  // CLOSER. Layer the cut face front-to-back: silhouette back (z 0),
  // mucosa face (-0.03), dark passages (-0.06), nostrils/rims (-0.09),
  // septum ridge front (-0.10, box depth 0.12). Round 1 had these
  // INVERTED (passages at +0.06 = behind the solid silhouette face),
  // so the passages/nostrils/septum were invisible except where they
  // poked outside the silhouette outline.
  // (3) FLAT clear colours, not the mottled softTissue texture (round 1
  // rendered as dirty brown under the nose lights): light peach skin,
  // clear pink mucosa, pale-pink septum, deep red-brown cavities.
  const noseSection = new THREE.Group(); noseSection.position.set(0, 0, 1.6); nose.add(noseSection);
  const sectSkinM = std({ color: '#f0c39a', roughness: 0.6, envMapIntensity: 0.3 }); sectSkinM.side = THREE.DoubleSide;
  const sectMucM = std({ color: '#e58a7d', roughness: 0.6, envMapIntensity: 0.3 }); sectMucM.side = THREE.DoubleSide;
  const sectDarkM = std({ color: '#3d0d0d', roughness: 0.9, envMapIntensity: 0.1 }); sectDarkM.side = THREE.DoubleSide;
  const sectNostM = std({ color: '#200606', roughness: 0.9, envMapIntensity: 0.1 }); sectNostM.side = THREE.DoubleSide;
  const sectSepM = std({ color: '#f6c9bd', roughness: 0.55, envMapIntensity: 0.3 }); sectSepM.side = THREE.DoubleSide;
  // outer silhouette: TOMBSTONE, not a tapered triangle — near-vertical
  // sides (half-width 1.27 bottom -> 1.05 at y 1.95) so the tall passage
  // arches stay INSIDE it with margin (round 1's tapered bell let the
  // passages poke out as black slabs at the top corners). Top 2.28.
  const silShape = new THREE.Shape();
  silShape.moveTo(-1.27, -1.66);
  silShape.bezierCurveTo(-1.27, -0.6, -1.22, 0.4, -1.16, 1.2);
  silShape.bezierCurveTo(-1.12, 1.7, -1.05, 1.95, -0.95, 2.12);
  silShape.bezierCurveTo(-0.5, 2.28, 0.5, 2.28, 0.95, 2.12);
  silShape.bezierCurveTo(1.05, 1.95, 1.12, 1.7, 1.16, 1.2);
  silShape.bezierCurveTo(1.22, 0.4, 1.27, -0.6, 1.27, -1.66);
  silShape.bezierCurveTo(0.6, -1.55, -0.6, -1.55, -1.27, -1.66);
  const sectOuter = add(new THREE.ShapeGeometry(silShape, 24), sectSkinM, 0, 0, 0, noseSection, noCast);
  const sectInner = add(new THREE.ShapeGeometry(silShape, 24), sectMucM, 0, 0.05, -0.03, noseSection, noCast);
  sectInner.scale.set(0.92, 0.92, 1);
  // passage arch: rounded-top slot, width 0.80, straight part 3.05 +
  // arch (top y 1.87 local) — the column tips (to 2.02) merge into the
  // upper wall, as a real turbinate merges into the wall at its ends.
  const archShape = (w, hStraight) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0); s.lineTo(-w / 2, hStraight);
    s.absarc(0, hStraight, w / 2, Math.PI, 0, true);
    s.lineTo(w / 2, 0); s.closePath();
    return s;
  };
  const passGeo = new THREE.ShapeGeometry(archShape(0.8, 3.05), 20);
  const passL = add(passGeo, sectDarkM, -0.59, -1.58, -0.06, noseSection, noCast);
  const passR = add(passGeo, sectDarkM, 0.59, -1.58, -0.06, noseSection, noCast);
  // septum ridge: pale strip filling the gap between the passages
  // (v6 r3: 0.26 wide, was 0.34 — the wide ridge read as a pillar)
  const septumRidge = add(new THREE.BoxGeometry(0.26, 3.6, 0.12), sectSepM, 0, 0.29, -0.1, noseSection, noCast);
  // nostrils: dark ellipses + skin rims at the bottom of each passage
  // (v6 r3: y -1.52, was -1.44 — clears the shortened vertical columns)
  const nostGeo = new THREE.CircleGeometry(0.3, 24);
  const nostL = add(nostGeo, sectNostM, -0.59, -1.52, -0.09, noseSection, noCast); nostL.scale.set(1, 0.55, 1);
  const nostR = add(nostGeo, sectNostM, 0.59, -1.52, -0.09, noseSection, noCast); nostR.scale.set(1, 0.55, 1);
  const rimGeo = new THREE.TorusGeometry(0.3, 0.05, 10, 24);
  const nostRimL = add(rimGeo, sectSkinM, -0.59, -1.52, -0.09, noseSection, noCast); nostRimL.scale.set(1, 0.55, 1);
  const nostRimR = add(rimGeo, sectSkinM, 0.59, -1.52, -0.09, noseSection, noCast); nostRimR.scale.set(1, 0.55, 1);
  // septum: wavy vertical wall dividing left/right — v3: SHORTENED to
  // the BACK half only (z 0.5..3.5, was the full -3.5..3.5). A full-length
  // septum puts a flat pink WALL between the entrance camera and the
  // nerd (round 2: his left half was hidden behind it in every nose
  // shot, and the book stack sat in the other passage). v5 round 2:
  // shortened FURTHER to z 1.8..3.5 (see below) — with the tunnel gone,
  // the 0.5..3.5 septum stood mid-frame as a red fin in the close-ups.
  const sepM = stdM(P.softTissue(74, 350, 55, 44), 1, 1); sepM.roughness = 0.55; // REV round 2: 0.4->0.55 — kills the white starburst specular glint on the septum edge; v4: lig 52->44 + height 1.1->0.85 — round 1's tall pale septum read as a red SAIL behind the nerd's head
  // v5 round 2: septum SHORTENED to the BACK only (z 1.8..3.5, was
  // 0.5..3.5) — round 1's full-length septum stood mid-frame as a red FIN
  // in the close-ups once the tunnel walls were gone. Deep behind the
  // scrolls it still reads as the centre divider in the cycle shot.
  const sepGeo = new THREE.BoxGeometry(0.06, 0.85, 1.7, 1, 8, 24);
  {
    const pp = sepGeo.attributes.position;
    for (let i = 0; i < pp.count; i++) {
      const y = pp.getY(i), z = pp.getZ(i);
      pp.setX(i, pp.getX(i) + 0.05 * Math.sin(y * 5 + z * 0.9));
    }
    sepGeo.computeVertexNormals();
  }
  // v5 round 6: keep a handle — the septum is HIDDEN in shots 2 + 4 (it
  // stood alone in empty space as a stray red ribbon once the tunnel was
  // gone) and kept in shots 3 + 5, where it is the centre divider.
  const septum = add(sepGeo, sepM, 0, 0.05, 2.65, nose, noCast); // v5: z 2.65 → spans 1.8..3.5 (back only)

  // ---- turbinates: folded scrolls, attached to the lateral walls ----
  // Cylinder displaced into longitudinal folds + a curled lower edge.
  // The group origin sits at the wall attachment; scale grows the scroll
  // inward/downward (never floats, never pokes through the wall).
  function scrollGeo(r, len, seed) {
    // OPEN-ENDED + tapered ends: a real turbinate merges into the wall
    // at both ends — round 3's closed cylinder ended in flat orange
    // discs that read as cut sausages. Deeper folds (0.18/0.10/0.06)
    // so the scroll ridges actually shade instead of reading smooth.
    const g = new THREE.CylinderGeometry(r, r, len, 24, 18, true);
    g.rotateX(Math.PI / 2); // axis along z
    const pp = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pp.count; i++) {
      v.set(pp.getX(i), pp.getY(i), pp.getZ(i));
      const ang = Math.atan2(v.y, v.x);
      const tz = Math.min(1, (len / 2 - Math.abs(v.z)) / 0.5);
      const taper = 0.35 + 0.65 * tz;
      // REV round: folds deeper (0.26/0.15/0.09, was 0.18/0.10/0.06) so
      // the scroll ridges shade and read as FOLDED tissue, not blobs.
      const fold = 1 + 0.26 * Math.sin(ang * 3 + v.z * 2.0) + 0.15 * Math.sin(ang * 5 - v.z * 1.2) + 0.09 * Math.sin(ang * 8 + v.z * 3.1);
      let x = v.x * fold * taper, y = v.y * fold * taper;
      // curl the lower-inner quadrant under (the scroll lip)
      if (y < 0) { const k = -y / r; x *= (1 - 0.28 * k); y *= (1 - 0.35 * k); }
      pp.setXYZ(i, x, y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  const mkScroll = (sx, y, z, s) => {
    // attached to the lateral wall (x ±0.78; wall at ~0.95, scroll
    // half-width ~0.19) — round 3 sat at ±0.62 with a visible gap and
    // read as floating.
    const grp = new THREE.Group(); grp.position.set(sx * 0.78, y, z); grp.userData.bx = sx * 0.78; nose.add(grp); // v3: base x kept — setSwell bulges the scroll INWARD as it swells
    const m = add(scrollGeo(0.26, 2.4, 1), turbM, 0, 0, 0, grp, noCast); // v3: r 0.22->0.26 — rounder scrolls, less leaf-like
    m.scale.set(0.9 * s, 0.68 * s, 1.0 * s); // v3: y 0.55->0.68 — bulkier cross-section
    // v5 round 9 (vertical restack): handles for the per-shot layout —
    // the updater rotates/repositions these groups in shots 2 + 4.
    grp.userData.mesh = m; grp.userData.s0 = s; grp.userData.y0 = y; grp.userData.z0 = z; grp.userData.sx = sx;
    return grp;
  };
  const turbInfL = mkScroll(-1, 0.28, 0, 1.0);   // inferior, left
  const turbInfR = mkScroll(1, 0.28, 0, 1.0);    // inferior, right
  const turbMidL = mkScroll(-1, 0.50, -0.3, 0.65); // middle, left (smaller)
  const turbMidR = mkScroll(1, 0.50, -0.3, 0.65);  // middle, right
  // v6 r3: middle scrolls lowered (y 0.62->0.50) + bigger (s 0.55->0.65)
  // so they touch the inferior scrolls instead of floating as debris
  // in the dark passages of shots 3/5.
  // REV round 2: blobs SMALLER + FLATTENED (scale y 0.5-0.6) — round 1's
  // r 0.07-0.11 spheres read as floating peach/red BALLS next to the
  // scrolls. Wet sheen hugs the tissue; it doesn't sit on it like a ball.
  // v5: wall mucus + gloss sit ON the tunnel walls — they float in air
  // once the tunnel is hidden, so they are collected here and hidden with
  // it in illustration shots. (Mucus ON the turbinates, mucTurb below,
  // stays — it belongs to the mechanism.)
  const wallSpots = [];
  const mucM = std({ color: '#b03a3a', roughness: 0.1, envMapIntensity: 1.8 });
  const mucSpots = [[0.75, 0.45, -1.5, 0.06], [-0.8, 0.2, -0.2, 0.07], [0.7, -0.55, 1.2, 0.05], [-0.65, 0.7, 2.2, 0.06], [0.85, 0.1, 2.6, 0.05], [-0.85, -0.4, 1.6, 0.05]];
  for (const [x, y, z, r] of mucSpots) { const m = add(new THREE.SphereGeometry(r, 10, 8), mucM, x, y, z, nose, noCast); m.scale.set(1, 0.6, 1); wallSpots.push(m); }
  // REV round: wet gloss HIGHLIGHTS on the turbinate ridges — pale, almost
  // mirror-smooth blobs that catch the lights and break the red monotony,
  // plus extra mucus ON the turbinates (v2's sat only on the walls).
  const glossM = std({ color: '#e8a08e', roughness: 0.05, envMapIntensity: 2.0 });
  const glossSpots = [[-0.68, 0.46, -0.4, 0.035], [-0.72, 0.32, 0.9, 0.03], [0.68, 0.46, -0.2, 0.035], [-0.6, 0.5, -1.1, 0.03]];
  const glossMeshes = []; // v5 round 9: hidden in the vertical shots (2 + 4) — they sit on the horizontal scrolls and would float in air once the scrolls stand up
  for (const [x, y, z, r] of glossSpots) { const m = add(new THREE.SphereGeometry(r, 10, 8), glossM, x, y, z, nose, noCast); m.scale.set(1, 0.5, 1); glossMeshes.push(m); } // v5: NOT in wallSpots — these hug the scroll ridges, they belong to the mechanism
  const mucTurb = [[-0.62, 0.42, 0.3, 0.05], [-0.85, 0.15, -0.9, 0.04], [0.62, 0.42, 0.5, 0.05], [0.8, 0.2, 1.4, 0.04]];
  const mucTurbMeshes = []; // v5 round 9: same as gloss — horizontal-layout spots only
  for (const [x, y, z, r] of mucTurb) { const m = add(new THREE.SphereGeometry(r, 10, 8), mucM, x, y, z, nose, noCast); m.scale.set(1, 0.6, 1); mucTurbMeshes.push(m); }
  // v4 ILLUSTRATION — airflow STREAMS: long pale-blue tubes streaming
  // along the passage, not dots. From the v4 3/4 illustration cameras
  // they read as visible flow LINES past the turbinate; v3's spheres
  // read as dots from the front. Length follows the flow (choked side =
  // short stubs); in the cycle shot the blocked side gets NO streams.
  // Round 2: CAPSULES (rounded ends — round 1's flat-capped cylinders
  // read as fluorescent rods), thinner (r 0.014), bluer, fainter
  // (opacity 0.5, envMap 0.4) so they read as air, not hardware.
  const airM = std({ color: '#5aa8ff', roughness: 0.15, envMapIntensity: 0.4, transparent: true, opacity: 0.5 });
  const streamGeo = new THREE.CapsuleGeometry(0.014, 0.85, 4, 8);
  streamGeo.rotateX(Math.PI / 2); // axis along z = the flow direction
  const parts = [];
  for (let i = 0; i < 12; i++) parts.push(add(streamGeo, airM, 0, 0, 0, nose, noCast));
  // v4 ILLUSTRATION — blood STREAMS: thin vertical threads pouring down
  // from the turbinates in the gravity shot (not just falling balls).
  // Each thread hangs from a scroll's underside (y 0.10) and grows
  // downward across the shot until it reaches the pool.
  // Round 2: CAPSULES (rounded ends), thinner (r 0.018), glossier.
  const streamBloodM = std({ color: '#7a1212', roughness: 0.2, envMapIntensity: 0.8 });
  const bloodGeo = new THREE.CapsuleGeometry(0.018, 1, 4, 8);
  bloodGeo.translate(0, -0.5, 0); // top of the thread at y=0, grows down
  const bloodStreams = [];
  for (const [sx, sz] of [[-0.62, -0.5], [0.62, -0.5], [-0.62, 0.6], [0.62, 0.6]])
    bloodStreams.push(add(bloodGeo, streamBloodM, sx, 0.10, sz, nose, noCast));
  // blood: tiny red spheres that drain DOWN through the turbinate (gravity shot only)
  const bloodM = std({ color: '#8a1a1a', roughness: 0.3, envMapIntensity: 0.8 });
  const blood = [];
  for (let i = 0; i < 8; i++) blood.push(add(new THREE.SphereGeometry(0.03, 10, 8), bloodM, 0, 0, 0, nose, noCast));
  // v3: blood POOL on the passage floor in front of the nerd (gravity
  // shot only) — grid panel 3 has blood pooling at the bottom.
  const poolM = std({ color: '#5a0c0c', roughness: 0.6, envMapIntensity: 0.3 }); // v3 round 4: matte dark red — round 3's glossy pool mirrored the bright env and read as a white puddle
  const pool = add(new THREE.SphereGeometry(0.28, 20, 12), poolM, 0, -0.5, -1.2, nose, noCast); // v3: r 0.45->0.28, z -2.0->-1.2 — round 2's pool sat on the lens and filled the frame as a beige dome
  pool.scale.set(1, 0.18, 1); pool.visible = false;
  // REV round 2: pl1 moved onto the turbinate side (-0.45, 0.75, 0.2)
  // — round 1's scrolls read dark maroon because the warm key sat over
  // the septum. pl4 (cool rim) 3->1.5: it washed the scrolls blue.
  // pl3 6->5 with the rougher septum.
  // v4 round 3: pl1 MOVED to the front (0.1, 0.3, -1.8) — round 2's
  // close-ups had pl1 sitting ON the left scroll, blowing the roof
  // fold white; pl3 moved deep (0.3, 0.5, 2.8) as the back rim.
  // Round 4: pl1 lower + dimmer (0.2, 0.15, -1.6, 2.5) — round 3's
  // top-left roof hotspot survived; the light must graze the roof,
  // not hit it head-on.
  const pl1 = new THREE.PointLight('#ff9a8a', 2.5, 12, 2); pl1.position.set(0.2, 0.15, -1.6); nose.add(pl1);
  const pl2 = new THREE.PointLight('#ff7a6a', 4, 10, 2); pl2.position.set(-0.35, 0.3, 2.0); nose.add(pl2);
  const pl3 = new THREE.PointLight('#cfe0ff', 2.0, 9, 2); pl3.position.set(0.3, 0.5, 2.8); nose.add(pl3); // v3: 4->2.5 — the cool rim was blowing the roof fold white; v4 round 2: 2.5->2.0
  const pl4 = new THREE.PointLight('#8ab0e8', 1.5, 8, 2); pl4.position.set(-0.5, -0.3, 1.8); nose.add(pl4);

  // per-frame updater (called from main.js renderFrame): swell + airflow + blood
  // Shot ranges from story.js: turbinates 216-456 (slim), standup/gravity
  // 457-696 (blood drains down), lieflat 697-940 (swell 0.15->1), cycle
  // 941-1155 (left/right swap at f=1048).
  world.userData.updateNose2 = (f) => {
    // v5: TWO WORLDS. Illustration shots (216-1155) hide the tunnel tube /
    // cap / rim / wall mucus and show the clean backdrop + stage floor
    // instead; the mechanism (scrolls, septum, streams, blood, pool)
    // carries the shot with the narrator NOWHERE inside it (036 formula).
    const inIllu = f >= 216 && f <= 1155;
    tube.visible = cap.visible = rim.visible = !inIllu;
    for (const m of wallSpots) m.visible = !inIllu;
    backdrop.visible = false; // v7: the photo plate is the backdrop — the cream canvas never shows
    // v6: the 3D septum is hidden in ALL illustration shots — the panel's
    // septum ridge is the divider now (a freestanding septum read as a
    // red fin/sail once the tunnel was gone; the ridge is attached to
    // the cut face, so it cannot float).
    septum.visible = !inIllu;
    // v6: nose-section panel shows in illustration shots only. VERTICAL
    // layout (shots 2+4): passages hug the columns (local centres ±0.59,
    // scale 1). HORIZONTAL layout (shots 3+5): passages spread to hug
    // the wider scrolls (centres ±0.82, scale.x 1.52) and the silhouette
    // widens with them (scale.x 1.27); the septum ridge stays put.
    noseSection.visible = false; // v7: the photo plate IS the nose context — the cartoon cross-section panel never shows
    // v5 round 3: the stage pedestal shows ONLY in the gravity shot (the
    // pool lives there) — in shots 2/4/5 the mechanism floats on the
    // backdrop alone, 036-style, with no empty pink floor in the still.
    stage.visible = false; // v7: no 3D stage disc on the photo plate
    // v5 round 9: VERTICAL restack for shots 2 + 4 (9:16 framing fix).
    // The scrolls are 2.4 m long along z, viewed end-on — the near ends
    // sit ~2 m closer to the camera than the far ends, so any front
    // camera crops the near ends (round 8: f300/f400 cut at the right
    // edge, f800/f900 at both edges) while a pull-back shrinks the
    // mechanism into a small band of a tall empty frame. In shots 2 + 4
    // the two inferior scrolls become VERTICAL columns (axis along y):
    // 2.4 m tall x ~1.35 m wide = the 9:16 aspect, so the whole
    // mechanism fills the frame with margin. Airflow flows DOWN the
    // central channel. Shots 3 + 5 keep the proven horizontal layout
    // (their cameras pass) — everything below restores per frame.
    const inVert = (f >= 216 && f <= 456) || (f >= 697 && f <= 940);
    const VX = 0.5, VY = 0.2; // vertical column centres: x ±0.5, y 0.2
    const setVert = (g) => {
      g.rotation.x = inVert ? -Math.PI / 2 : 0; // group axis: z (horizontal) -> y (vertical column)
      g.userData.bx = g.userData.sx * (inVert ? VX : 0.78); // setSwell bulges from this base x
      g.userData.mesh.scale.x = (inVert ? 0.55 : 0.9) * g.userData.s0; // flatten the column sideways so the pair fits 9:16
      if (inVert) { g.position.y = VY; g.position.z = 0; }
      else { g.position.y = g.userData.y0; g.position.z = g.userData.z0; }
    };
    [turbInfL, turbInfR, turbMidL, turbMidR].forEach(setVert);
    turbMidL.visible = turbMidR.visible = !inVert; // vertical shot = the two main columns only
    // v7: in illustration shots the 3D SCROLLS are hidden entirely — the
    // photo plate IS the turbinates (real tissue). Only the airflow
    // streams + blood drips below survive as motion overlays.
    if (inIllu) { turbInfL.visible = turbInfR.visible = turbMidL.visible = turbMidR.visible = false; }
    for (const m of glossMeshes) m.visible = !inVert && !inIllu;
    for (const m of mucTurbMeshes) m.visible = !inVert && !inIllu;
    // v6: per-shot nose-section layout (see build notes above).
    if (inIllu) {
      if (inVert) {
        sectOuter.scale.set(1, 1, 1);
        sectInner.scale.set(0.92, 0.92, 1);
        passL.position.x = -0.59; passR.position.x = 0.59;
        passL.scale.set(1, 1, 1); passR.scale.set(1, 1, 1);
        nostL.position.x = -0.59; nostR.position.x = 0.59;
        nostL.scale.set(1, 0.55, 1); nostR.scale.set(1, 0.55, 1);
        nostRimL.position.x = -0.59; nostRimR.position.x = 0.59;
        nostRimL.scale.set(1, 0.55, 1); nostRimR.scale.set(1, 0.55, 1);
      } else {
        sectOuter.scale.set(1.35, 1, 1);
        sectInner.scale.set(0.92 * 1.35, 0.92, 1);
        passL.position.x = -0.82; passR.position.x = 0.82;
        passL.scale.set(1.52, 1, 1); passR.scale.set(1.52, 1, 1);
        nostL.position.x = -0.82; nostR.position.x = 0.82;
        nostL.scale.set(1.2, 0.55, 1); nostR.scale.set(1.2, 0.55, 1);
        nostRimL.position.x = -0.82; nostRimR.position.x = 0.82;
        nostRimL.scale.set(1.2, 0.55, 1); nostRimR.scale.set(1.2, 0.55, 1);
      }
    }
    let fillL = 0.15, fillR = 0.15, flow = 1, showBlood = false;
    if (f >= 457 && f <= 696) { fillL = fillR = 0.3; flow = 0.6; showBlood = true; }
    // REV round: swell front-loaded (p^0.6) so f=800 already reads
    // clearly swollen (fill ~0.65, was 0.51 on the linear ramp), and
    // growth stronger (0.70+0.75*fill, was 0.75+0.55*fill) so the
    // airway narrowing reads at the still frame, not just at f=940.
    else if (f >= 697 && f <= 940) { const p = (f - 697) / (940 - 697); fillL = fillR = 0.15 + 0.85 * Math.pow(p, 0.6); flow = 1 - 0.8 * p; }
    // v4: cycle split EXAGGERATED — swollen side fill 1.15 (scroll
    // nearly touches the septum), open side 0.10. v3's 1.0/0.15 did not
    // read as a split in a still.
    else if (f >= 941 && f <= 1155) { const left = f < 1048; fillL = left ? 1.15 : 0.10; fillR = left ? 0.10 : 1.15; flow = 0.55; }
    const wob = 1 + 0.012 * Math.sin(f * 0.1);
    // v3: swollen scrolls BULGE INWARD toward the septum (x moves 30%
    // toward centre at fill 1) and grow harder (0.65+1.0*fill) — round 1's
    // swell only scaled in place at the frame edge and the airway gap
    // never visibly narrowed.
    // v5 round 9: in the vertical shots the swell is TEMPERED (0.75x) —
    // at full strength the columns would meet in the middle and the
    // airway would close completely; tempered, the gap narrows 0.64 m
    // (shot 2) -> ~0.22 m (f900) and stays a visible passage in every
    // sampled still.
    const setSwell = (g, fill) => { const fv = inVert ? fill * 0.75 : fill; const s = (0.65 + 1.0 * fv) * wob; g.scale.set(s, s, inVert ? 0.92 : 1); g.position.x = g.userData.bx * (1 - 0.30 * fv); };
    // v6 r3: vertical columns shortened (scale.z 0.92) — at full length
    // their tapered tips poked THROUGH the nostril rings like legs
    // through hoops; shortened, the tips end just above the rings.
    setSwell(turbInfL, fillL); setSwell(turbInfR, fillR);
    setSwell(turbMidL, fillL * 0.8); setSwell(turbMidR, fillR * 0.8);
    pool.visible = false; // v7: the plate carries its own blood pool — no 3D blob on the photo
    // v4: blood streams grow downward across the gravity shot
    // (0.12 -> 0.62 long = scroll underside down to the pool) and the
    // pool grows with them.
    const gp = showBlood ? (f - 457) / (696 - 457) : 0;
    // v5: blood threads are FLOWING streams, not stiff rods — each thread
    // sways slightly and tapers (thinner x/z) so it reads as liquid falling.
    bloodStreams.forEach((s, i) => { s.visible = false; // v7: the plate carries the blood streams — no 3D rods on the photo
      s.scale.set(0.85, 0.12 + 0.50 * gp, 0.85); s.rotation.z = 0.05 * Math.sin(f * 0.12 + i * 1.7); });
    if (showBlood) pool.scale.set(1 + 0.7 * gp, 0.18 + 0.12 * gp, 1 + 0.7 * gp);
    const inNose = f >= 216 && f <= 1155;
    for (let i = 0; i < parts.length; i++) {
      const pt = parts[i];
      const side = i % 2 ? 1 : -1;
      // airflow hugs the gap between septum and turbinate; swollen side chokes it
      const fillHere = side < 0 ? fillL : fillR;
      if (inVert) {
        // v6: vertical — streams flow UP through the passages, entering
        // at the nostrils (y -1.05) and rising past the columns. They run
        // in the INNER gap (x ±0.22, between the septum ridge and the
        // column's inner edge) — the air channel around the turbinate,
        // not down the centre where the septum belongs (v5's downward
        // central flow put air where the septum should be). As the shot
        // swells, flow drops so the streams slow + shorten into stubs
        // near the nostrils (choked at entry).
        pt.rotation.x = -Math.PI / 2;
        // v6 r3: CLAMPED tighter (centres -0.60..1.00, capsule half
        // ~0.41) — round 2's tips still crossed the panel's top edge.
        const drift = (f * 0.11 * flow + i * 0.55) % 1.6;
        pt.position.set(
          side * 0.22 + 0.03 * Math.sin(i * 2.3 + f * 0.08),
          -0.60 + drift,
          0.05 * Math.sin(i * 1.7 + f * 0.05));
      } else {
        // v6 r3: horizontal streams TILTED 0.5 rad — a capsule along z
        // is foreshortened to a pill from the front camera; tilted, it
        // reads as a diagonal flow streak through the passage.
        pt.rotation.x = 0.5;
        // z clamped to -1.2..3.2 — REV round 3: the nerd stands at z -1.5,
        // so particles starting at -1.8 drifted IN FRONT of his chest and
        // sat on him like bubbles. Now they all stream behind him.
        const z = -1.2 + ((f * 0.11 * flow + i * 0.55) % 4.4);
        const x = side * (0.22 + 0.1 * (1 - fillHere)) + 0.06 * Math.sin(i * 2.3 + f * 0.08);
        const y = -0.18 + 0.14 * Math.sin(i * 1.7 + f * 0.05) * (1 - fillHere * 0.5);
        pt.position.set(x, y, z);
      }
      // v4: LONG streams — length follows the flow (choked side = short
      // stubs). In the cycle shot the blocked side gets NO airflow at
      // all (it is shut), the open side gets long bright streams.
      // Round 2: shorter overall (capsule total ~0.85 + len scale) so
      // they read as flow lines, not rods crossing the frame.
      // Round 3: in the cycle shot the OPEN side's streams are boosted
      // (1.5x longer, 1.3x thicker) so "this side flows" pops.
      const inCycle = f >= 941 && f <= 1155;
      const blocked = inCycle && fillHere > 0.5;
      const boost = inCycle && !blocked ? 1.5 : 1;
      const len = blocked ? 0 : (0.5 + 0.5 * flow) * (1 - 0.5 * fillHere) * boost;
      pt.scale.set(inCycle && !blocked ? 1.6 : 1, inCycle && !blocked ? 1.6 : 1, len);
      pt.visible = false; // v7 r2: NO 3D airflow capsules on the photo — round 1's grey-blue rods read as scratches doubling the plate's own painted streams, which already carry the airflow. Motion on static plates = Ken Burns push + crossfades only (see plates.js).
    }
    for (let i = 0; i < blood.length; i++) {
      const b = blood[i];
      // v3: drips in BOTH passages (v2's sat at x 0.74 in the right passage
      // only, reading as floating bubbles) — alternate sides, fall from
      // the roof toward the pool at the nerd's feet (z -2.0).
      const side = i % 2 ? 1 : -1;
      const y = 0.45 - ((f * 0.02 + i * 0.11) % 0.9);
      b.position.set(side * (0.55 + 0.08 * Math.sin(i * 3.1)), y, -1.2 + (i % 5) * 0.4);
      b.scale.set(1, 1.6, 1); // v4 round 2: 2.2->1.6 — round 1's read as red pills/capsules
      b.visible = false; // v7 r2: NO 3D blood drips on the photo — same verdict as the airflow rods (round 1); the plate's own dripping blood carries shot 3.
    }
  };
};

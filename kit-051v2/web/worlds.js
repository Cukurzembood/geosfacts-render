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
  if (kind === 'bridge') return null; // built inline in main.js (legacy)
  throw new Error(`worlds: unknown world id "${kind}" — add it to WORLDS and buildWorld`);
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

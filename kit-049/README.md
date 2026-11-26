# kit-049 — cartoon-short-kit render of GeosFact's video 049 on GitHub Actions

Test only. Renders "Why Do You Shiver After You Pee?" (53.62 s, 1609 frames,
1080x1920, 30 fps) with the cartoon-short-kit engine (three.js in headless
Chromium, 2D nerd cards in a painted 3D world) in parallel across
10 GitHub runners, then stitches + muxes the audio mix.

The local VM render of this same project was ~14 frames/min (477/1609 frames
in 34 min) — too slow for a 2-video/day pipeline. This is the parallel
variant, mirroring `github-parallel`'s proven Remotion workflow.

## v2 — nerd port + bathroom world (2026-11-26, approved by Shanty)

- **Character:** the bean-head Roman cast is gone. The narrator is our nerd
  stickman (`web/nerd.js`, a JS port of the reference implementation in
  `github-parallel/src/videos/ourworld/nerd.ts`): big round white head, tiny
  dot eyes, big round glasses, mustard sweater vest, always carrying books,
  stick arms/legs. No red-white striped shirt, no pink blush, no big anime
  eyes. Mouth opens/closes from the whisper speech segments baked into
  `web/story.js`; expressions change per shot; blinks are 4-frame lids.
  Verified with stills first — see `stills-v2/contact-sheet.jpg` in the
  local project (`~/workspace/cartoon-kit-test/v049/stills-v2/`): front view,
  talking with the open book, full-lid blink, walking, book stack.
- **World:** the single static bridge world is replaced by the bathroom
  world (`web/worlds.js`, id `bathroom`): tiled walls, tub, sink + mirror,
  toilet, window with warm light, towel rail, mustard rug, shelf of books.
- **Cutaways:** the science is carried by diagram boards (`web/cutaways.js`):
  bladder-as-balloon filling up (hold), pressure gauge sweeping high → low
  (drop), nerve HOLD/GO switch (cold), name plaque (name shot).
- **Cameras:** every shot has its own setup — close-up (hook), medium
  two-shot (name), wide (hold), two-shot + push-in (drop), medium-wide with
  three nerds (guys), reverse two-shot (cold), pull-back with a walk-in
  (payoff). Portrait 9:16 is narrow (~20° horizontal FOV), so boards sit
  ~0.8 m off the camera→narrator sightline with the look target centred
  between nerd and board; putting a board beside the camera never works.
- **Audio:** unchanged v1 mix (`mix_raw.wav`, Arlo VO + SFX only, no music).
- **Output:** `final-kit049-v2.mp4` (local name; the workflow artifact is
  still `final-video-kit049` / `final-kit049.mp4`).

## Background-variation system (how to add a world for the next video)

`web/worlds.js` is the registry. Rules, baked in:

1. **Never reuse the same establishing shot twice** — every shot gets its
   own camera (story.js `CAMS`), and every video gets its own world +
   palette. A second video in the same world must change the palette, the
   time of day, or the camera side — preferably all three.
2. The narrator is a 2D card; the world is the 3D set around them. The
   builder must leave a clear standing spot (SOL, `[-21.5, DECK, 0]`) with
   nothing between it and the cameras.
3. Cutaway diagrams (`web/cutaways.js`) carry the science; the world
   carries the place. Keep them separate: boards are cards, worlds are
   meshes.

To add a world:

1. Add an entry to `WORLDS` in `web/worlds.js` (id, description, palette).
2. Write `build<Name>(ctx)` following `buildBathroom`: floor top at
   `y = DECK`, set roughly centred on `x = -21.5, z = 0`, everything opaque
   so the sky/hills never show through.
3. Add a matching light palette in `web/story.js` `LIGHTS` (sun az/el
   through the world's window or open side) and set `WORLD` to the new id.
4. Re-block the cameras in `web/story.js` `CAMS` for the new layout
   (wide / close-up / tracking / pull-back — at least one of each).
5. Register the id in the `buildWorld` switch at the bottom of
   `web/worlds.js`. The old bridge world stays in `main.js` behind
   `WORLD === 'bridge'` as the fallback example; do not reuse it unchanged
   for a new video.

## Contents

- `render.mjs` — the kit's frame renderer (unchanged except `--no-sandbox`
  added to the Chromium launch args for GitHub runners).
- `web/` — the whole renderable project: `index.html`, `main.js`, `story.js`
  (shot plan, TOTAL = 1609), `paint.js`, `nerd.js`, `cutaways.js`,
  `worlds.js`, `roman.js` (legacy cast, unused by v2 story but kept),
  `motion.js`, `toon.js`, `toonbase.js`, `lib/three.module.js`.
  Self-contained; no fetch of external timing files (timings are baked into
  `story.js`).
- `mix_raw.wav` — final audio: Arlo VO (voice.mp3, 53.62 s) + SFX only
  (whoosh/thunk/drips/leaves/ting). NO music (channel rule).
- `scripts/compute-chunks.py` — splits 0..1608 into N contiguous chunks.
- `scripts/stitch.py` — copy of the github-parallel stitcher; its frame
  regex also accepts the kit's `fNNNN.jpg` names.
- `package.json` / `package-lock.json` — playwright 1.65.1 (same as local).

## Workflow

`.github/workflows/render-kit049.yml` (workflow_dispatch):
prepare -> 10x render-chunk -> stitch -> `final-video-kit049` artifact.

## Notes

- v1 (bean-head, bridge world): run
  https://github.com/Cukurzembood/geosfacts-render/actions/runs/45776748155
  (~11 min, final-kit049.mp4 53.63 s, md5 e9ae178ad640b1dc2436440ed46a4acd).
- Never upload the output to YouTube; test only.

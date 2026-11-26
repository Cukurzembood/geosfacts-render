# kit-049 — cartoon-short-kit render of GeosFact's video 049 on GitHub Actions

Test only. Renders "Why Do You Shiver After You Pee?" (53.62 s, 1609 frames,
1080x1920, 30 fps) with the cartoon-short-kit engine (three.js in headless
Chromium, 2D bean-head cards in a painted 3D world) in parallel across
10 GitHub runners, then stitches + muxes the audio mix.

The local VM render of this same project was ~14 frames/min (477/1609 frames
in 34 min) — too slow for a 2-video/day pipeline. This is the parallel
variant, mirroring `github-parallel`'s proven Remotion workflow.

## Contents

- `render.mjs` — the kit's frame renderer (unchanged except `--no-sandbox`
  added to the Chromium launch args for GitHub runners).
- `web/` — the whole renderable project: `index.html`, `main.js`, `story.js`
  (shot plan, TOTAL = 1609), `paint.js`, `roman.js`, `motion.js`, `toon.js`,
  `toonbase.js`, `lib/three.module.js`. Self-contained; no fetch of external
  timing files (timings are baked into `story.js`).
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

- Characters here are the kit's BEAN-HEAD style, NOT our nerd stickman.
  Do not port the nerd into this test.
- Never upload the output to YouTube; test only.

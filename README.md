# Cartoon 3D short — parallel render on GitHub Actions

Render the `cartoon-3d-short` skill's Remotion video (2D characters in a
3D world, three.js) the way the poster in the Threads thread did it:
**split the video into frame chunks, render each chunk on its own
GitHub Actions runner in parallel, then stitch the frames + audio into
the final MP4.** The skill itself has no parallel-rendering support —
this workflow is custom-built around it.

This folder is a **ready-to-push repo template**. Nothing here has been
pushed to GitHub yet.

## Repo layout

```
.github/workflows/render.yml   the parallel workflow (prepare -> N render jobs -> stitch)
package.json / package-lock.json
remotion.config.ts              JPEG frames, overwrite output
src/index.ts / src/Root.tsx     registers the BridgeShort composition
src/videos/bridge/              the skill's bridge template (13 files, unchanged)
public/bridge/kenney/           Kenney CC0 3D props the world loads (17 .glb, 212 KB)
audio/                          put the finished mix here as mix.wav (see audio/README.md)
scripts/compute-chunks.py       splits [0, total) into N contiguous ranges -> matrix JSON
scripts/stitch.py               sorts frames numerically, checks for gaps, ffmpeg-joins + muxes audio
```

`public/` is intentionally tiny (212 KB). The skill warns that Remotion
copies `public/` into a temp folder on every render (~1.3 GB in the
original project) — keep this folder lean and the CI stays fast.
`node_modules` is cached by `actions/setup-node` (`cache: npm`).

## How a render runs

1. **Prepare** (1 job, seconds): `compute-chunks.py` turns
   `total_frames` + `chunks` into a matrix, e.g. 2025 frames / 10 chunks
   gives chunk 0 = frames 0–202, chunk 1 = 203–405, … chunk 9 =
   1823–2024.
2. **Render** (N jobs, in parallel): each job runs
   `npx remotion render src/index.ts BridgeShort out/chunk-N
   --frames=start-end --sequence --image-format=jpeg --gl=swangle`.
   Output is one JPEG per frame, named by its **global** frame number
   (`element-000.jpg` … `element-2024.jpg`). Frames are uploaded as an
   artifact (`frames-chunk-N`, kept 1 day).
3. **Stitch** (1 job): downloads all chunk artifacts, sorts frames
   **numerically** (Remotion zero-pads filenames per chunk, so plain
   alphabetical order would mis-order frames across chunks), fails
   loudly if any frame is missing, then ffmpeg-joins the sequence at
   30 fps (`libx264`, CRF 16, `yuv420p`) and muxes `audio/mix.wav`.
   The finished `final.mp4` is uploaded as the `final-video` artifact
   (kept 7 days). Download it from the workflow run page.

## Trigger a render

Actions tab → **Render short (parallel)** → **Run workflow**:

| Input | Default | Notes |
|---|---|---|
| `composition` | `BridgeShort` | Composition ID in `src/Root.tsx` |
| `total_frames` | `2025` | BridgeShort = 2025 frames (67.5 s at 30 fps). Must match the composition, or the stitch fails its frame-count check. |
| `chunks` | `10` | Parallel runners. More chunks = faster wall-clock, same total minutes. |
| `scale` | `1` | `1` = 1080×1920. `1.3333` = 2K 1440×2560 (the skill's final export), slower. |
| `jpeg_quality` | `90` | Chunk frame quality. Use `png` instead by editing the workflow if you want lossless frames (much bigger artifacts). |
| `crf` | `16` | Final x264 quality, the skill's default. |

## Time & cost — honest numbers

- **Wall clock:** the skill's own figure is ~4 fps for a 2K render on a
  real PC (~10 min for a 67 s video). GitHub runners are 2-core shared
  VMs, slower per frame — expect roughly **10–20 min wall-clock for a
  1080p render split across 10 runners**, 25–40 min at 2K scale. The
  poster's "25 min" was 2K on 10 machines; treat it as a best case.
- **Actions minutes:** parallel jobs save **time, not minutes**.
  10 jobs × ~10 min ≈ **~100 minutes per render**. GitHub free tier:
  **2,000 min/month on private repos, unlimited on public repos.**
  That is ~20 renders/month if this repo is private, unlimited if
  public. Keep this repo **public** unless you have a reason not to.
- **Storage:** chunk artifacts are ~200–500 MB total (JPEG) and
  auto-delete after 1 day; the final MP4 (~50–150 MB) after 7 days.

## What is still needed before it can run

1. **A GitHub account + a repo.** Create a repo (public recommended,
   see cost above), push this folder's contents to it.
   GitHub account on file: `Cukurzembood` (logged in via `gh` device
   flow 26 Nov 2026) — the push itself has **not** been done.
2. **The audio mix.** `audio/mix.wav` must exist in the repo or the
   video renders silent (with a warning). Build it per the skill's
   pipeline step 8 before triggering a render.
3. **A first-run check.** The first workflow run is the real test:
   watch for Chrome download issues, three.js/WebGL failures under
   `--gl=swangle`, or out-of-memory errors. If a chunk fails, fix it
   and use **Re-run failed jobs** — the stitch job refuses to run with
   missing frames, so a partial video can never be produced silently.

## Verified locally (no GitHub account needed)

- `render.yml` parses as valid YAML (checked with Python `yaml`).
- `compute-chunks.py` covers 0..2024 with no gaps/overlaps at 10
  chunks, and at other chunk counts.
- `stitch.py` verified end-to-end on synthetic frames, including the
  mixed zero-padding case (frames from different chunks sort
  numerically, missing-frame detection works, output frame count is
  checked with `ffprobe`).
- All `remotion render` flags used (`--frames` ranges, `--sequence`,
  `--image-format`, `--jpeg-quality`, `--gl=swangle`, `--scale`) exist
  in the installed Remotion **4.0.544** CLI and match the official
  Remotion docs for that version.

## NOT verified (needs a real GitHub run)

- The full workflow end-to-end on GitHub runners (npm ci time,
  Chrome Headless Shell download, actual render fps on 2-core runners,
  artifact upload/download of hundreds of MB).
- Whether the three.js scene renders correctly under `--gl=swangle`
  (software GL). A local still render is being tested separately.
- Real wall-clock time and real Actions-minutes cost per render.

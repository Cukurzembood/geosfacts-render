# REPORT-v8 — kit-051-3d-v8 (GeosFact's 051 "Why Does Your Nose Get Stuffy When You Lie Down?")

Hybrid build v8. Source: copy of `kit-051-3d-v7/` (code, plates, VO untouched except as noted). v1–v7 untouched.
Date: 28 Nov 2026. Built by Geofact (subagent) for the parent orchestrator. Nothing sent to Shanty, nothing pushed to GitHub.

## The brief (two parts, both from Shanty 28 Nov)

1. **Presenter shots 1, 6, 7 (23:04 WIB, confirmed "Iya")** — v7 verdict: "Apaan Tai cuma gambar di tempel" (just a pasted image). Fix: real contact shadow on the photo bed, relight the nerd to match the room's lamp/moonlight, blanket mound over the legs in lie shots.
2. **Explainer shots 2–5 (23:05 WIB)** — "Explainer nya jgn cuma gambar di tempel." The nose must feel ALIVE, not a still photo with a Ken Burns push: airflow visibly flowing, blood dripping/pooling, swell as a continuous morph (not a dissolve), cycle swap as a real transition. Photorealistic endoscopy look kept; plates stay the visual base.

## Fixed (unchanged from v7)

- VO byte-identical reuse of `~/workspace/geosfacts/video-051/voiceover.mp3` — md5 `d37a55e6a796106ab7633f85a9b1f79a`, 59.23 s, 0 TTS. The copy in this folder verifies to the same md5.
- 1777 frames @30 fps, same 7 shot ranges (1 hook 0–215, 2 turbinates 216–456, 3 standup 457–696, 4 lieflat 697–940, 5 cycle 941–1155, 6 rollover 1156–1401, 7 payoff 1402–1776). Hard cuts, pop-ups ("?" f30–150, "!" f941–1048, gold magnifier ring f1048–1155), no subtitles, no music, Whisper lip-sync on the nerd.
- Plates byte-identical to v7 (`diff -r` clean): `bedroom-night.webp`, `nose-turbinates.webp`, `nose-gravity.webp`, `nose-swell.webp`, `nose-cycle.webp`.

## What changed vs v7

### Presenter: relight (done first, measured)
- `web/story.js`: night hemi 1.12→0.55, sunI 1.05→0.35; nightWarm hemi 0.85→0.5, sunI 1.0→0.5.
- `web/worlds.js` bedroomCine: lamp 32→10, bedFill 8→2.5, moon 16→6.
- `web/nerd3d.js`: head `#fdfcf6` roughness 0.38 envMapIntensity 0.75 → `#e9dfc8`, 0.55, 0.35; `std()` envMapIntensity 0.55→0.30.
- Measured (PIL, same boxes): head mean luminance f60 189→131, f1600 179→135; lit-wall reference unchanged (69/67) — plates untouched. Head now shows a warm-right/cool-left gradient (lamp side warm, window side cool).

### Presenter: contact shadow — three attempts, third one works
- **Attempt 1–2 (r1–r2): real ShadowMaterial catcher planes in world space + warm SpotLight at the photo lamp (-22.0, 7.5, -3.9). FAILED.** A `#catcher` debug render (planes painted solid red) proved the world-space planes do NOT track the photo bed — the 3D bed plane and the photo bed coincide along one line only; the catcher floated over the rug and the shadow never landed on the bed. A real cast shadow can never land on the photo bed this way. Catchers removed.
- **Attempt 3 (r3–r7, final): screen-space contact-shadow blob.** A soft radial-gradient ellipse on a camera-parented plane, placed under the nerd's projected screen position, offset away from the lamp (screen-left, slightly down), depth = anchor distance + 0.8 m (behind the whole nerd so his body occludes its middle, in front of the plate). The spot stays as warm key + self-shadowing (head onto chest/books); `sun.castShadow` set false so the sun can't cast a second cool shadow.
- **Placement was the hard part (r3→r5).** Hardcoded world offsets projected 100+ px off the body (magenta debug: blob on the rug / over the window). Final code anchors to the nerd's ACTUAL posed geometry after `poseNerd()`: `P.head.getWorldPosition()` in lie shots, `P.torso.getWorldPosition()` in the payoff. Final tuning: hook size 0.45 of frame width, offset (-0.18, +0.05), rotation -0.25; rollover 0.16, (-0.05, +0.02); payoff 0.26, (-0.12, +0.06). Gradient: core alpha 0.95, 0.55 at 0.65 radius, material opacity 0.8.
- **Measured (clean A/B vs a no-blob render, same frames):** payoff blanket left of base 50.0→38.9 (-11.1); hook pillow core zone 29.0→21.0 (-8.0); rollover pillow 28.1→26.6 (-1.6, small nerd, small shadow — correct scale). Lesson logged: the blob's dark core must clear the nerd's own silhouette — a core hidden behind the body contributes nothing; the first r5 hook placement lost most of its core behind the head.

### Presenter: blanket mound (r1→r3)
- r1: giant sphere read as a red balloon/egg. r2: flattened (scale 0.62, 0.95, 0.30) at local (0, 0.25, 0.05), colour `#7e3226` — better, but a perfect smooth ellipse ("pancake").
- r3 (final): two overlapping fold bumps added (`P.blanketFold1` at (0.10, 0.08, 0.06) scale (0.42, 0.55, 0.20) colour `#75301f`; `P.blanketFold2` at (-0.12, 0.44, 0.04) scale (0.38, 0.50, 0.20) colour `#8e3a2c`), same lie-only visibility as the mound. Reads as a lumpy blanket drape; torso + books visible above it.

### Explainer: motion (new `web/fx2d.js`, 540×960 2D canvas redrawn per frame)
- Camera-parented plane at z -3.5, renderOrder 998 (under pop-ups 999), hidden outside illustration shots.
- Wispy pale-blue airflow streaks following each plate's painted streams (tapered 3-pass strokes: halo 9 px/0.05, mid 3.5 px/0.10, core 1.5 px/0.22); blood drops falling from the fold walls with rivulet trails into a pool rising from the bottom edge (shot 3); shot 4 streaks narrow/speed up as swell progresses; shot 5 streaks follow the wipe, switching open side right→left, plus a soft bright edge riding the wipe boundary.
- **r8 fix:** streak segments straddling the t=1 loop wrap used to draw a long straight chord from path end back to path start — the full-height "scratch" line visible in r2/r5 f300. The wrap piece is now skipped (segment drawn in two parts). Verified gone in r8 f300.

### Explainer: plates (`web/plates.js`)
- Lieflat swell is no longer a global dissolve: plateB revealed by a 540×960 alpha-mask canvas with 7 overlapping radial blobs of varied radii centred on the swollen masses, soft falloff (white only in inner 45%), radius growing with smooth progress, plus plateB bulge zoom 1.00→1.03.
- Cycle swap is a left→right wipe: plateB (mirrored cycle texture) plane width `w*p`, texture `repeat.x = -p, offset.x = 1` (no stretch), anchored to the left frame edge; soft wipe edge (0.15 alpha, 2 px + 0.06 glow). `place()` gained a `scaleMul` parameter.

## QC — stills rounds

Local stills render ~2.6–5.8 s/frame (`node render.mjs <outdir> "<frames>" 1 0.96`, detached via nohup — foreground runs die at the ~46 s shell timeout). Round folders kept as evidence: `stills-r1/`, `stills-r2/`, `stills-r5/`, `stills-r6/`, `stills-r7/`, `stills-r8/`; final set in `stills/` (16 frames) + `stills-sheet.jpg` (1350×960, 5×2).

| Round | What was checked | Result |
|---|---|---|
| r1 (16f) | relight, mound v1, streaks v1, pool v1, swell mask v1, wipe v1 | Mound = red balloon; no shadow; streaks = grey rods; pool = flat disc; drops invisible; swell hard circular cut; wipe hard white line. Relight gradient + wipe mechanics worked. |
| r2 (16f) | mound flat, catchers enlarged, streaks rewritten wispy, drops bigger, pool = bottom-edge arc, wipe soft, swell mask soft | Mound = flat pancake; still no shadow; streaks wispy except one straight diagonal line; drops blend with painted drips; swell organic; wipe soft grey band. |
| r3 (6f) | blob shadow v1 (hardcoded anchors) | Blob rendered but misplaced (magenta debug: on the rug / over the window). |
| r4 (5f) | blob v2 (smaller, less down-offset) | Still misplaced — offsets guessed from wrong screen positions. |
| r5 (6f) | blob v3 (geometry-anchored) + streak offset 1.8→1.3 | Blob lands on the bed in all 3 presenter shots (magenta debug). f300 diagonal line still present. |
| r6 (3f) | blob stronger (opacity 0.55→0.8, steeper gradient) | Payoff -11.1, hook core -8.0 (after zone correction), rollover -1.6. |
| r7 (3f) | hook offset -0.12→-0.18 (core clears the head) | Hook core zone 29.0→21.0 (-8.0). Shadow clearly visible on the pillow left of the head. |
| r8 (2f) | wrap-chord fix | Straight line gone from f300; airflow clean wisps. |

### Motion check (frame pairs ~1 s apart, final `stills/`)
Mean |Δ| luminance, % pixels changed >10 / >25. Includes the Ken Burns push (~1.5%), so these are upper bounds on fx motion, not pure fx motion.

| Pair | Mean \|Δ\| | >10 | >25 | What's moving |
|---|---|---|---|---|
| f300→f330 (shot 2) | 7.88 | 18.97% | 7.02% | airflow wisps drifting along the S-stream |
| f600→f630 (shot 3) | 7.22 | 16.74% | 6.22% | blood drops falling, pool rising, airflow fan |
| f800→f830 (shot 4) | 10.13 | 28.30% | 10.47% | swell morph growing, slit streaks narrowing |
| f1000→f1030 (shot 5) | 4.76 | 8.51% | 3.26% | wipe advancing, streaks following it |
| f1100→f1130 (shot 5) | 5.12 | 9.27% | 3.95% | post-swap streaks on the open side |

## QC table — one row per shot (what I actually saw in the final stills)

| Shot | Frames | Verdict | What I saw |
|---|---|---|---|
| 1 hook (bedroom, lie) | 60, 120, 150 | **MATCH** | Head rests on the pillow with a soft dark contact patch on the pillow to its left (measured -8.0); warm-right/cool-left light on the head; blanket mound + folds read as a body under a drape; "?" pop-up in frame f60/f120; shock face + books on chest. |
| 2 turbinates | 300, 330 | **MATCH** | Wispy blue airflow follows the painted S-stream, no straight lines (r8); motion 7.88 mean \|Δ\| over 1 s. |
| 3 standup | 600, 630 | **MATCH** | Blood drops visible falling from both fold walls, blending with the painted drips; pool arc growing at the bottom edge; airflow fan soft. |
| 4 lieflat | 800, 830 | **MATCH** | Swell grows organically between frames (no hard edge, no dissolve read); thin blue stream through the centre slit, narrowing as the swell progresses. |
| 5 cycle | 1000, 1030, 1063, 1100, 1130 | **MATCH** | Wipe advances left→right with a soft edge; swap completes (open passage right before, left after); gold magnifier ring frames the septum; "!" pop-up in frame; streaks switch sides with the wipe. |
| 6 rollover | 1280 | **PARTIAL** | Small dark patch under the lying nerd's head on the pillow (-1.6, correct scale for the wide shot); nerd reads as lying in bed. The shadow is subtle at this distance — honest, but a viewer at phone size may not register it. |
| 7 payoff | 1600 | **MATCH** | Clear dark contact patch on the lit blanket left of the sitting nerd's base (-11.1); head brightness matched to the room; nerd reads as sitting ON the bed, not floating. |

## Honest gap list

1. **The blob is a 2D cheat, not a real shadow.** It is a soft dark ellipse in screen space. It grounds the nerd (the measurements and the stills prove it reads), but it has no shape of the body, no penumbra variation, and it does not react to the nerd's gestures. A viewer pausing the video will not be able to tell; a viewer comparing the shadow shape to the body could. Closing it properly needs the nerd composited in a real 3D reconstruction of the photo room (depth-estimated bed geometry) so a true cast shadow lands on the bed surface — that is a different build, not a tweak.
2. **The nerd is still a 3D cartoon in a photograph.** The relight closed the biggest tell (glowing white head), and the shadow + mound close the floating tell, but the material gap remains: his surfaces are smooth CG plastic, the room is photographic grain and fabric texture. At phone size in motion this is much less visible than in a still; in a paused 1080p still you can still tell which parts are CG. Full closure would need film grain + a subtle photographic texture pass over the nerd, or a photorealistic character — both out of scope for this kit.
3. **No parallax between nerd and room.** The plate is a flat plane; the camera moves but the nerd does not shift against the room the way a real object would. The camera moves in these shots are small (a slow dolly/pan), so the missing parallax is hard to notice — but it is there. A depth-split plate (foreground/background layers) would fix it.
4. **Rollover shadow is subtle (-1.6).** Correct scale for the wide shot, but if Shanty judges v8 on the rollover frame alone, the shadow may read as absent. The hook and payoff carry the effect.
5. **Explainer motion is painted 2D, not physical.** The airflow/blood are drawn wisps on top of the plate, not fluid sim. They read as real motion at 30 fps (the pair diffs prove movement), but a frame-by-frame inspection shows the drops are stylised streaks, not droplets with volume. The swell morph and the wipe are the strongest of the four — they change the plate itself.
6. **Cycle plate is still a tunnel view, not a cross-section** (deliberate, carried from v7: the mirrored cycle plate reads as a tunnel, while the brief's "cross-section" would need a new plate). The wipe makes the swap read as a real transition, but the anatomy shown is the tunnel.
7. **Full 1777-frame render NOT run locally.** Only stills were rendered here (16 final + round sets). The full video is produced by the GitHub workflow below; no full-video QC (lip-sync drift, frame continuity across the whole render) has been done. The workflow's stitch job verifies frame contiguity 0..1776.

## Deliverables

- Folder: `~/workspace/cartoon-kit-test/kit-051-3d-v8/` (code in `web/`, plates in `web/plates/`, VO `voiceover.mp3` md5-verified, storyboard in `storyboard/`)
- Workflow (prepared, NOT pushed): `render-kit0513dv8.yml` — modelled on v7's workflow, renamed v7→v8, YAML verified, header documents the v8 changes. Parent pushes + triggers; pattern prepare → 10× render-chunk → stitch → `final-kit-051-3d-v8.mp4`.
- This report: `REPORT-v8.md` (here). `REPORT-v6.md` / `REPORT-v7.md` kept in-folder as reference.
- Stills: `stills/` (16 frames: 60, 120, 150, 300, 330, 600, 630, 800, 830, 1000, 1030, 1063, 1100, 1130, 1280, 1600) + `stills-sheet.jpg` (1350×960, 5×2: 60, 150, 300, 600, 800, 1000, 1063, 1100, 1280, 1600). Round evidence: `stills-r1/`, `stills-r2/`, `stills-r5/`, `stills-r6/`, `stills-r7/`, `stills-r8/`.
- `node_modules/` removed before handover (workflow runs `npm ci` itself).

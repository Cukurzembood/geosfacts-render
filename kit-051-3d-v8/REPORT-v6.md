# kit-051-3d-v6 — WHOLE-NOSE build report

**Video:** GeosFact's 051 "Why Does Your Nose Get Stuffy When You Lie Down?"
**Build:** `~/workspace/cartoon-kit-test/kit-051-3d-v6/` (copy of kit-051-3d-v5; v1–v5 untouched — verified: 0 files in v1/v2/v3/v4/v5 modified after the build started)
**Trigger:** Shanty 28 Nov, after watching v5 — the video under-illustrates: "video tentang hidung harus mengilustrasikan hidungnya juga". CONFIRMED fix: illustration shots must show a WHOLE NOSE CROSS-SECTION — cavity + septum + nostril opening visible, turbinates attached INSIDE the passage, air flowing through it — not red columns floating on an empty background.
**Reference:** storyboard grid `kit-051-3d-v2/storyboard/media-generation-storyboard-grid-nerd-051-0-33b944af-4055-4034-92bf-118288646b22.webp` (studied first — the grid shows the nose as a pink tunnel interior with the nerd inside it; v6 keeps the 036 formula instead — narrator NEVER inside the diagram — and renders the nose as a coronal front-section, per the confirmed fix).
**VO:** existing `~/workspace/geosfacts/video-051/voiceover.mp3`, reused byte-identical, md5 `d37a55e6a796106ab7633f85a9b1f79a` — **0 Gemini TTS requests**.
**Render:** full 1777-frame render NOT run (parent pushes to GitHub and triggers it). Stills QC is DONE (3 rounds + baseline, local render.mjs + Playwright). Workflow file ready: `render-kit0513dv6.yml` (renamed from the v5 workflow, all v5→v6 references renamed, YAML verified — 0 leftover v5 references, same output name `final-kit-051-3d-v6.mp4`).

## What changed vs v5 — the whole-nose cross-section

Illustration shots ONLY (2, 3, 4, 5). Shots 1/6/7 (presenter bedroom), pop-ups ("?" f30–150, "!" f941–1048, magnifier ring f1048–1155), VO, lip-sync, hard cuts, no subtitles, no music: UNCHANGED.

1. **Coronal front-section back panel** (`web/worlds.js`, new `noseSection` group at z 1.6, behind the mechanism, visible only in illustration shots 216–1155): skin-tone outer silhouette + mucosa-pink inner face, two DARK passage arches (the open cavities), a pale septum ridge between them, and a dark nostril opening + skin rim at the bottom of each passage. The turbinates sit INSIDE the dark passages, hugging the outer walls. The panel is a BACK panel, not a foreground frame — a foreground frame can never enclose the mechanism, because the 9:16 frame is narrower closer to the camera, so anything in front of the scrolls that covers them crops at the edges.
2. **Per-shot panel layout** (`updateNose2`): VERTICAL layout (shots 2+4) — passages hug the columns (local centres ±0.59); HORIZONTAL layout (shots 3+5) — passages spread to hug the wider scrolls (centres ±0.82, scale.x 1.52) and the silhouette widens with them (scale.x 1.35). The septum ridge stays put in both.
3. **3D septum retired:** the freestanding septum is now hidden in ALL illustration shots — the panel's septum ridge is the divider (a freestanding septum read as a red fin/sail once the tunnel was gone; the ridge is attached to the cut face, so it cannot float).
4. **Airflow rerouted (vertical shots):** streams now flow UP through the passages, entering at the nostrils and rising past the columns in the INNER gap (x ±0.22, between the septum ridge and the column's inner edge). v5's downward central flow put air where the septum belongs. As shot 4 swells, the streams slow + shorten into stubs near the nostrils (choked at entry).
5. **Horizontal streams tilted 0.5 rad:** a capsule along z is foreshortened to a pill from the front camera; tilted, it reads as a diagonal flow streak. Cycle open-side streams thickened 1.3×→1.6×.
6. **Middle scrolls attached:** lowered (y 0.62→0.50) + bigger (s 0.55→0.65) so they touch the inferior scrolls instead of floating as debris in the dark passages of shots 3/5.
7. **Stage disc shrunk** (r 1.3→0.65): the r 0.95 disc's bottom rim still spanned ~95% of the frame in shot 3; the small disc is now a modest pedestal under the pool.
8. **Cameras pulled back** (illustration shots only) so the nose outline fits with margin: shot 2 z −3.9/−3.4 → −4.4/−3.95; shot 3 z −4.5/−4.45 → −5.2/−5.15, look y raised 59.85→60.15 (centres the panel); shot 4 z −3.4/−3.25 → −4.15/−4.0; shot 5 z −4.0/−3.95 → −4.9/−4.85.
9. **`illustr` light brightened** (hemi 0.9→1.25, sunI 1.05→1.15) so the panel reads pink/peach, not muddy brown.

Fixed, unchanged from v5: nerd BOOKWORM; 7 shots / frame ranges @30fps, 1777 frames; VO byte-identical; Whisper lip-sync; hard cuts; no subtitles; no music; v5 round-9 vertical restack for shots 2+4 (columns at x ±0.5, y 0.2, tempered swell).

## Stills QC — baseline + 3 rounds

- **r0 (baseline, 10 frames):** the v5 copy renders exactly as v5 (vertical red columns floating on cream, no nose context; presenter shots identical). Confirms the copy is a clean start.
- **Round 1 found:** (a) Z-ORDER INVERTED — the camera sits at −z, so smaller z is closer; I layered the passages at z +0.06 (behind the solid silhouette face at z 0), so the passages/nostrils/septum were invisible except where they poked outside the silhouette as black slabs; (b) the tapered-bell silhouette let the tall passage arches poke out at the top corners; (c) the mottled softTissue texture rendered as dirty brown under the nose lights; (d) the stage disc's bottom rim still spanned ~95% of the frame in shot 3; (e) vertical streams crossed the panel's hard bottom edge into the cream. Fixed: z-order reversed (silhouette 0 → mucosa −0.03 → passages −0.06 → nostrils −0.09 → septum ridge −0.10), tombstone silhouette with near-vertical sides, flat clear colours (peach skin #f0c39a, pink mucosa #e58a7d, pale septum #f6c9bd, deep red-brown cavities #3d0d0d), disc r 0.65, streams clamped to the panel.
- **Round 2 found:** the nose now read at a glance (dark passages + septum + nostril rings), but (a) the vertical columns' tapered tips poked THROUGH the nostril rings like legs through hoops; (b) the septum ridge (0.34) read as a wide pillar; (c) the middle scrolls floated as debris in the dark passages of shots 3/5; (d) horizontal streams read as pills (foreshortened capsules); (e) shot 3's panel sat high with a dead cream band below. Fixed: columns shortened (group scale.z 0.92 in vertical shots) + rings lowered to local y −1.52, septum narrowed to 0.26, middle scrolls lowered/enlarged to touch the inferior scrolls, horizontal streams tilted 0.5 rad + cycle-open thickness 1.6×, shot-3 look raised.
- **Round 3 (final):** columns end just above the rings (tips lightly touch the rim at max swell, f900 — reads as "turbinate ends at the nostril", no poke-through); streams stay inside the panel; middle scrolls read as one turbinate mass with the inferior scrolls; tilted streams read as flow streaks. Accepted as final. Final 10-frame set rendered fresh to `stills/` + `stills-sheet.jpg` (ffmpeg tile filter, 5×2).

## QC table — final stills vs the confirmed fix

Every row was verified on the final stills with my own eyes.

| Shot | Frames | Type | Verdict | What I actually saw (final stills) |
|---|---|---|---|---|
| 1 Hook | 0–215 | PRESENTER | MATCH | f60: ball head, sleeping slit eyes, big glasses, mouth open speaking, books on chest; big yellow "?" fully in frame top-right. f150 wide: window+moon left, lamp+nightstand right, bed centre, pictures top, rug. Identical to v5. |
| 2 Turbinates | 216–456 | ILLUSTRATION | MATCH | f300: WHOLE NOSE at a glance — skin rim, pink mucosa, two dark passage arches, pale septum divider, nostril rings at the bottom; two slim red columns INSIDE the passages, blue streams rising through the inner gaps from the nostrils. Nothing touches the frame edges. |
| 3 Gravity | 457–696 | ILLUSTRATION | MATCH | f600: scrolls + middle scrolls as one folded red mass inside the dark passages, thin red blood STREAMS pouring down + falling droplets, dark pool growing on the small pedestal, septum a clear pale divider, nostril rings below the disc. |
| 4 Swell | 697–940 | ILLUSTRATION | MATCH | f800/f900: both columns clearly fatter than shot 2, gap narrowed to a slim visible passage with stream stubs choked near the nostrils; nose context intact; nothing touches the edges. |
| 5 Cycle | 941–1155 | ILLUSTRATION | MATCH | f1000: split reads in one still — one side a huge swollen mass, other side slim scrolls + boosted blue streaks, red "!" fully in frame. f1050/f1100: the SWAP reads (swollen side flips) with the gold magnifier ring framing the open side + its streams. |
| 6 Rollover | 1156–1401 | PRESENTER | MATCH | f1280: wide bedroom — window+moon left, lamp+nightstand right, bed centre, pictures, rug; nerd asleep under the red blanket. Identical to v5. |
| 7 Payoff | 1402–1776 | PRESENTER | MATCH | f1600: sitting up, dot eyes open, mouth open speaking, mustard vest, books on the blanket, waving hand, back-wall pictures + lamp shade at the right edge. Identical to v5. |

Character in every presenter shot: ball head ✓, dot eyes ✓, big round glasses ✓, mustard vest ✓, thin black stick limbs ✓, books ✓. No flat white boards, no subtitles, no music (VO only), hard cuts, presenter/illustration alternation obvious across the sheet.

### Illustration beats (the core of this job)

| Beat | Verdict | Evidence (single still) |
|---|---|---|
| Nose reads as a nose at a glance (shots 2–5) | ✓ READS | f300/f600/f800/f1000: skin rim + pink mucosa + two dark arches + septum + nostril rings |
| Turbinates attached inside the passage (shot 2) | ✓ READS | f300: columns inside the dark arches, outer edges near the passage walls, tips ending at the nostrils |
| Blood draining down into a pool, inside the passage (shot 3) | ✓ READS | f600: red streams + droplets from the scrolls, dark pool on the pedestal, septum visible |
| Swell + narrowed airway (shot 4) | ✓ READS | f900: fat columns, gap a slim visible passage, streams choked to stubs |
| Cycle split L/R + swap (shot 5) | ✓ READS | f1000 vs f1050: swollen side flips; ring frames the open side |

### Pop-up timing (verified in stills)

| Symbol | Frames | Evidence |
|---|---|---|
| "?" hook | 30–150 | f60: fully in frame, top-right, yellow/black (unchanged from v5) |
| "!" twist | 941–1048 | f1000: fully in frame, top-right, red/black (over the swollen side, black outline keeps it readable) |
| Magnifier ring | 1048–1155 | f1050: popping in at the swap; f1100: full ring around the open side + streams |

## Honest gap list vs the storyboard grid

- **Columns are still smooth pods in the vertical shots:** the fold detail is subtle at full-frame distance (known v5 gap, unchanged). They read as turbinates because of the passage context now, not because of their folds.
- **The swollen side in shot 5 is a formless red blob:** the swell kills the fold detail and the middle scroll merges into one amoeba-like mass. The split/blocked beat reads clearly, but it is not a pretty turbinate.
- **Empty cream above/below the panel in shots 3/5:** the coronal section is nearly square while the 9:16 frame is tall, so ~40% of the frame is backdrop above/below the nose (the width constraint binds — pulling the camera closer would crop the silhouette sides). Same class of gap as v5's shot 5; 036's own illustrations are similarly empty.
- **Blood streams are still straight rods:** tapered + swaying, but straight; droplets + pool growth carry the "flowing" read in motion.
- **Airflow streams read as rods/streaks in stills:** thin blue capsules — they read as flow lines; in the horizontal shots they are tilted streaks, in the vertical shots vertical lines in the inner gaps.
- **Column tips touch the nostril rims at max swell (f900):** the shortened columns end just above the rings in shot 2, but at full swell the fat tips lightly overlap the rim tops. Reads as "turbinate ends at the nostril", not a poke-through — accepted.
- **The grid's tunnel interior is NOT reproduced:** the storyboard draws the nose as a pink tunnel the nerd walks inside; v6 follows Shanty's confirmed coronal-section direction instead, with the 036 rule (narrator never inside the diagram). If Shanty wants the tunnel back, that is a different build, not a tweak.
- **Motion untested beyond stills:** the pop in/out curves, the swell ramp, the blood growth, the swap, and the upward airflow drift were verified only at sampled frames, not as continuous motion. The full render (GitHub) is the first motion check.

## Full render status

**NOT RUN.** Stills QC passes (3 rounds). To render: parent pushes `kit-051-3d-v6/` to GitHub and runs the `render-kit0513dv6.yml` workflow (prepare → 10× render-chunk → stitch, 1777 frames, `final-kit-051-3d-v6.mp4`). No clone/push done by this build. Nothing sent to Shanty.

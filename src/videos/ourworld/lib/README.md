# lib/ — reusable motion + prop library (Kampus Sains pipeline)

Assembly, not hand-coding: a new video wires BEATS → shots → library
calls. New files only — nothing in 050's files was touched.

## Files

| File | What it is |
|---|---|
| `motion.ts` | Pure easing + physics helpers (unit-tested, see below). |
| `props.ts` | Pen-drawn topic props on 1080x1920 cards. |
| `stage.ts` | 3D auditorium stage kit (Batch + lam + THREE). |
| `shots.ts` | Camera presets + `camRun` key grammar. |
| `index.ts` | Barrel import for all of the above. |
| `LibTest.tsx` | Smoke-test composition (local test bed only). |

## motion.ts — the rules, as code

- `glide(u)` — smootherstep, zero velocity at both ends. THE default for
  every camera move and walk-on. Nothing may move linearly.
- `easeIn / easeOut / easeInOut / easeOutBack` — cubic curves + overshoot
  settle (levers, double-takes; never on cameras).
- `fallState(u)` — gravity fall: y = u², fade in at the spout, fade +
  squash into the landing, stretch mid-fall. Cycle wrap never pops.
  (The v3 fix for 050's choppy drops, now reusable.)
- `dropPhase(t, cycles, offset)` — looping drop phase, staggered per tap.
- `ripple(p, x, y, u, col)` / `splat(p, x, y, u, col)` — impact Fx.
- `walkCycle(phase)` — cycloid foot (zero ground speed at contact), body
  bob lowest at contact, torso lean max at contact. From the reference
  clip's marching.
- `blinkProfile(f, seed)` — deterministic 4-frame blink. RULE: an
  expression may ONLY change on a blink frame (v3 lesson — the old
  talkExpr swapped every 12 frames = a visible pop 2.5x/second).
- `talkGest(u)` — hand rise/fall while talking. `glideVec(from, to, u)` —
  eased 3-vector lerp for cameras.

## props.ts — Pen props (1080x1920 card unless noted)

- `mouthCutaway(p, mode, t, opts?)` — 050's mouth card, generalised:
  `watery | thick | glued`, tap count / spacing / colours parameterised.
- `brainRoom(p, { sw, focus, t })` — control room; `sw` 0 calm .. 1 fight
  (lever eases, never snaps), `focus` highlights a screen, `t` alarm pulse.
- `windStreaks(p, t, { dir, count })` — eased gusts, fade in/out at ends.
- `dryingPuddle(p, u)` — 256x256 flat card, shrinks as it dries.
- `swellSponge(p, { cx, cy, rx, ry, fill, base, full })` — spongy blob
  that swells + deepens in colour as `fill` 0..1 rises (turbinate analog).
- `flowArrows(p, { x, y, dir, t })` — gravity/flow arrows, eased drift,
  fade at both ends. `dir: 1` down, `-1` up.
- `nostrilSeesaw(p, { t, period })` — two sides taking turns on a tilting
  plank, one blob swelling while the other opens.

## stage.ts — 3D stage kit

- `buildStage(root, opts)` — platform + backdrop + trim + curtains +
  valance + wings + podium + mic + footlights. `STAGE_050` is 050's
  palette; pass a different palette for a fresh look. Returns
  `{ micHead, topY, podiumX, podiumZ }`. Footlights skip the centre
  (a centre globe sits behind the character's head — 050 lesson).

## shots.ts — camera presets

- `camRun(keys, lf)` — evaluate keys at local frame (`lf` = 0 at shot
  start). Keys blend with `glide`; a key flagged `cut` jumps.
- `widePushIn / sideTracking / closeUp (+focus for DOF) /
  pullBackReveal / staticCard / reframe` — each returns `CamKey[]`.
- House rule: hard cuts only, camera angle/movement changes every cut.

## Verification (26 Nov 2026)

- `npx tsc --noEmit` in `github-parallel`: CLEAN (0 errors).
- Node assertions on the compiled math (`/tmp/libcheck-test.js`):
  all passed — glide endpoints/monotonic, fallState u² + fades +
  stretch/squash, dropPhase wrap, walkCycle contact values, blink
  presence, camera preset endpoints + eased mid-glide, closeUp focus.
  (One real bug caught by the test: `walkCycle` bob was inverted —
  body must be LOWEST at foot contact. Fixed.)
- Visual proof: `LibTest` still, frame 22
  (`github-skills-test/out/libtest-still-22.jpg`): all four quadrants
  draw — watery mouth card, brain room (fight/bear), swell sponge +
  flow arrows + wind, nostril seesaw. `LibTest` is registered in the
  LOCAL test bed (`~/workspace/remotion/src/RemotionRoot.tsx`) only.
- NOT pushed: the 050 motion-fix agent owns the repo push right now.
  These files are new + uncommitted in the working tree.

## HOWTO — assembling video 051 from the library

Topic: "Why Does Your Nose Get Stuffy When You Lie Down?"
Script: `~/workspace/geosfacts/video-051/` (160 words, 7 beats, FINAL +
Gemini PASS; VO blocked until ~15:00 WIB 26 Nov — same retime rule as
050: BEATS is the single source of truth, update from Whisper timestamps).
Palette (deliverable.md): deep indigo night + warm lamplight amber +
soft dusty rose. Nerd in pajamas, moonlit bedroom.

| Beat | Time | Shot (library calls) |
|---|---|---|
| 1 — hook | 0.0–6.6s | Bedroom wide: `widePushIn` to the bed; nerd hits the pillow (new: bed zone + pajama outfit — hand work, see below). Nose clogs on contact: `swellSponge` small, `fill: 0 → 0.4` fast. |
| 2 — turbinates | 6.6–13.9s | Nose cutaway card (NEW card, assembled from lib): `swellSponge` x2 (one per nostril wall) + `flowArrows` down, `dir: 1`. `staticCard` camera. |
| 3 — standing, gravity drains | 13.9–21.3s | Nerd standing (campus/bedroom): `flowArrows(p, { dir: 1 })` + `swellSponge` `fill: 0.15` (slim). `sideTracking` slow. |
| 4 — lie flat, blood back up | 21.4–29.1s | Same cutaway card: `flowArrows(p, { dir: -1 })` (flip!) + `swellSponge` `fill: glide(u)` 0.15 → 1 (swells like a sponge soaking up water). `closeUp` + focus for DOF. |
| 5 — nostrils take turns | 29.1–36.5s | `nostrilSeesaw(p, { t: u, period: 0.5 })` full-frame card, `staticCard` camera. One swap across the shot. |
| 6 — roll over, blockage follows | 36.5–44.9s | Bed side shot: nerd rolls (new pose — hand work); `nostrilSeesaw` with `period` flipped, or the seesaw card cutting in as the roll completes. `reframe` (wide → tighter) inside the shot. |
| 7 — payoff + CTA | 44.9–59.3s | Nerd sits up, breathing free: `swellSponge` `fill: 1 → 0.2`, relieved shrug (grin, `blinkProfile`-masked), `talkGest(u)` for the follow gesture. `widePushIn` then `closeUp` on the grin. CTA → long-004. |

New files for 051 (assembly, not invention): `story051.ts` (BEATS +
SHOTS + `camAt` built from the presets above), `world051.ts` (base
World + bedroom zone + `buildStage` only if a stage shot is wanted —
051 has no stage, skip it), `cast051.ts` (nerd placements +
`mouthCutaway`-style nose card + seesaw card as Fx), `sets051.ts`
(thin: the nose-cutaway card layout wiring `swellSponge` +
`flowArrows` together). No new motion code, no new prop code.

Estimated effort: ~15 min wiring the story/cast/sets files from the
table above + ~20 min GitHub render (57 s, 10 chunks, same as 050) +
frame check. Compare 050: ~35 min hand-coding cards/Fx from scratch
for the same shot count — the library removes the card/Fx coding
entirely for beats 2–5 and 7.

## What still needs hand work per video (honest note)

- A NEW ZONE when the script needs one (051's bedroom: bed, window,
  moonlight — ~30 min of three.js layout, same as 050's stage was).
- A NEW OUTFIT / POSE when the script needs one (051's pajamas, the
  roll-over in bed — small additions to `nerd.ts`, not a new character).
- The script-specific CARD LAYOUT (which lib props go where on the
  1080x1920 card for a new cutaway — 051's nose interior).
- BEATS timing + the VO retime step (Whisper timestamps → BEATS →
  re-render) and the sync QC after muxing. The library does not
  remove the VO dependency.
- Thumbnail + chapters (long only) and the upload itself.
- Anything the script invents that no prop covers yet — then the new
  prop gets built ONCE in `props.ts` and joins the library for the
  next video (that is how the library grows: 050 gave us 4 props,
  051 adds the nose card pieces as reusable parts).

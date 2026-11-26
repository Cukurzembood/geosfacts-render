# Shot plan — Video 050 "Why Does Your Mouth Go Dry When You're Nervous?"
Full 57 s Short, GitHub parallel pipeline, our world + nerd character.
Source script: `~/workspace/geosfacts/video-050/deliverable.md` (154 words,
Gemini check PASS). VO: Arlo, NOT YET GENERATED (Gemini TTS quota resets
~15:00 WIB 26 Nov 2026) — this render is VISUALS-ONLY (silent).

## Beat table (ESTIMATED timestamps — see Retime rule below)

| Beat | Time (est) | Script |
|---|---|---|
| 1 | 0.0–6.5 s | Wait, you are about to speak, and your mouth is suddenly bone dry, so what just happened? |
| 2 | 6.5–13.0 s | Three major saliva gland pairs do most of the work, making around a liter of spit a day. |
| 3 | 13.0–21.5 s | Your nerves run those glands, and when you get nervous, your fight or flight side cuts the watery flow, leaving thick saliva behind. |
| 4 | 21.5–28.0 s | It feels thick and sticky, and your tongue feels glued to the roof of your mouth. |
| 5 | 28.0–35.0 s | Then you breathe through your mouth, fast and shallow, and that air dries out what moisture is left. |
| 6 | 35.0–44.5 s | Your brain means well, because in a real emergency, running matters more than making spit, but it can not tell an interview from a bear. |
| 7 | 44.5–57.0 s | So the dry mouth is just your body getting ready to run, and it fades as you calm down. Does it hit you too? Tell us below, then watch why you can not tickle yourself, and follow. |

## Shots (17, hard cuts only, camera glides + slow push-in, angle/movement change every cut)

| Shot | Frames | Beat | Set / action |
|---|---|---|---|
| 1 | 0–90 | 1 | Stage wide: nerd walks on under the spotlight, books under arm |
| 2 | 90–195 | 1 | Stage medium, podium: opens mouth to speak — shock, mouth dry |
| 3 | 195–300 | 2 | Mouth cutaway: three taps pour watery blue spit |
| 4 | 300–390 | 2 | Mouth cutaway: pull-back, drops keep flowing |
| 5 | 390–480 | 3 | Brain room: FIGHT OR FLIGHT switch flips to red |
| 6 | 480–570 | 3 | Mouth cutaway: taps drip thick sticky goo |
| 7 | 570–645 | 3 | Stage close: worried, hand to throat (think) |
| 8 | 645–735 | 4 | Stage close-up: tries to speak, tongue stuck (shock) |
| 9 | 735–840 | 4 | Mouth cutaway: tongue glued to the roof, goo strands |
| 10 | 840–945 | 5 | Campus side tracking: fast shallow mouth breathing, wind + shrinking puddle |
| 11 | 945–1050 | 5 | Stage low angle: breathing at the podium, wind gusts |
| 12 | 1050–1155 | 6 | Brain room: interview screen vs bear screen |
| 13 | 1155–1230 | 6 | Brain room: bear screen wins, push-in |
| 14 | 1230–1335 | 6 | Stage medium: relieved smile, brain means well |
| 15 | 1335–1470 | 7 | Mouth cutaway: taps flow watery blue again |
| 16 | 1470–1590 | 7 | Bench close: talking to camera, open book (CTA) |
| 17 | 1590–1710 | 7 | Bench closer: grin, follow gesture (CTA) |

Sets: auditorium stage (dusty rose curtain + amber footlights + charcoal
wings, in front of the library) — `world050.ts`; mouth cutaway + brain
control-room cards (Pen-drawn billboards, 1080x1920) — `sets050.ts`;
campus path + bench (existing world). Character: nerd bookworm stickman
(`nerd.ts`), no lip-sync — gestures timed to beats (see below).

## RETIME RULE (Shanty, 26 Nov 2026 — VO WAJIB SINKRON)

Shot boundaries above are ESTIMATES from word count (~57 s at 2.72 wps).
They are NOT locked. Single source of truth: the `BEATS` table in
`src/videos/ourworld/story050.ts`. Cameras run on frames RELATIVE to their
shot start; `cast050.ts` derives every progress value from `shotAt(f)` /
`shotU(f)`; DOF is shot-based. To retime, edit ONLY `BEATS` aSec/bSec (and
the per-beat shot splits in `SHOTS` if a beat moved a lot) — nothing else.

### Procedure once the real VO exists (after ~15:00 WIB 26 Nov)
1. Generate VO 050 with the locked pipeline (`vo_pipeline.py` in
   `~/workspace/geosfacts/video-050/`): Arlo + promote, gemini-3.8-flash-tts,
   chunked, trim the style-prompt head via faster-whisper timestamps, cut
   the noise burst at each chunk end + fade out, join with 0.15 s gap,
   ffmpeg atempo 0.90. Verify duration ≤ 60 s, full script spoken
   (faster-whisper word coverage), no clipping.
2. Run faster-whisper on the final `voiceover.mp3`; take the WORD
   timestamps. Map each script beat's first/last word to seconds.
3. Update `BEATS` aSec/bSec in `story050.ts` to those real times; adjust
   `SHOTS` a/b frames (seconds × 30) so each shot still covers its beat
   (keep 3–4 s shots; a beat that grew gets an extra cut, a beat that
   shrank loses one — never stretch a shot past ~5 s).
4. Re-render on GitHub (same workflow inputs, composition OurWorld050).
5. Mux: put the VO at `audio/mix.wav` in the repo (the stitch job muxes
   it in), OR mux locally with ffmpeg after download.
6. SYNC QC (mandatory, same rule as Claude): watch the finished video
   against the VO word timestamps — every beat's visual must land on its
   words (hook shock on "bone dry", switch flip on "fight or flight",
   goo on "thick and sticky", bear screen on "interview from a bear",
   CTA gesture on "Does it hit you too?"). If a beat is off by more than
   ~0.5 s, retime that beat and re-render. DO NOT claim sync before this
   check passes.

## Current status (26 Nov 2026, before VO)
- Visuals rendered on GitHub, SILENT. Estimated timestamps only.
- NOT sync-verified. Mux + retime + sync QC are required follow-up steps
  after the VO exists. Do not present this video as finished/synced.

// LibTest — test composition for the lib/ library ONLY (local test bed).
// Draws the Pen props on a 2D canvas in four quadrants so one still proves
// they all draw: mouth cutaway (watery), brain room (fight/bear),
// swell sponge + flow arrows, nostril seesaw + thick mouth.
// NOT a video, NOT for upload — delete or keep as the library smoke test.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen } from "../../bridge/toon";
import { mouthCutaway, brainRoom, windStreaks, swellSponge, flowArrows, nostrilSeesaw } from "./index";

export const LIB_TEST_FRAMES = 90;

export const LibTest: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const u = (frame % 45) / 45; // 0..1 loop so any frame shows motion mid-way

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, 1080, 1920);
    const p = new Pen(g);
    // TL: mouth cutaway, watery, mid-fall
    g.save(); g.translate(0, 0); g.scale(0.5, 0.5);
    mouthCutaway(p, "watery", 0.35);
    g.restore();
    // TR: brain room, fight mode, bear screen
    g.save(); g.translate(540, 0); g.scale(0.5, 0.5);
    brainRoom(p, { sw: 1, focus: "bear", t: 0.3 });
    g.restore();
    // BL: swell sponge (full) + flow arrows pointing up + wind streaks
    g.save(); g.translate(0, 960); g.scale(0.5, 0.5);
    p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#1d2030", 0);
    swellSponge(p, { cx: 540, cy: 800, rx: 260, ry: 340, fill: 0.8, base: "#e88a96", full: "#b03040", seed: 5 });
    flowArrows(p, { x: 540, y: 1500, dir: -1, t: u, color: "#7cc7ee" });
    windStreaks(p, u, { dir: 1 });
    g.restore();
    // BR: nostril seesaw + thick mouth (small, bottom corner strip)
    g.save(); g.translate(540, 960); g.scale(0.5, 0.5);
    p.poly([[0, 0], [1080, 0], [1080, 1920], [0, 1920]], "#241f2e", 0);
    nostrilSeesaw(p, { cx: 540, cy: 700, t: u, period: 0.5 });
    g.restore();
  }, [frame, u]);

  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <canvas ref={ref} width={1080} height={1920} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

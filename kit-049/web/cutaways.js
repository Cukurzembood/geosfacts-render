// Science cutaway cards for the kit engine — 2D Pen drawings on the
// 600x1000 card canvas. Each draw function paints its own diagram board
// (cream board, ink border) so the card reads as a presentation board
// standing in the world, not a floating shape. Used by story.js fx/actors
// for the shots that explain the mechanism; the background is secondary
// there. All deterministic; params are quantized by the caller so the card
// redraws only when the picture visibly changes.
import { INK } from './toon.js';

const BOARD = "#f6efdd", BOARD_DARK = "#e3d5b3";

/** shared board: rounded rect + pin dots. Leaves the inner area for the diagram. */
const board = (p, title) => {
  const g = p.g;
  p.poly([[60, 60], [540, 60], [540, 940], [60, 940]], BOARD, 10);
  p.poly([[60, 60], [540, 60], [540, 150], [60, 150]], BOARD_DARK, 0);
  p.dot(90, 105, 8, "#b8282b"); p.dot(510, 105, 8, "#b8282b");
  g.save();
  g.fillStyle = INK; g.font = "bold 34px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(title, 300, 108);
  g.restore();
};

/** Bladder filling like a balloon. fill 0..1 = how full it is. */
export const bladderBalloon = (p, fill = 0.5) => {
  board(p, "BLADDER");
  const g = p.g;
  // balloon body: circle that grows with fill, tied at the bottom
  const cx = 300, cy = 520, r = 90 + 90 * fill;
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.08]);
  }
  p.gradFill(pts, "#7fb8d8", "#3f7ea8", -2.1);
  p.inkRing(pts, 10, 0.6);
  // water level inside: rises with fill
  const lvl = cy + r * 1.08 - 2 * r * 1.08 * fill;
  p.clip(pts, () => {
    g.save(); g.fillStyle = "#2f6f9f";
    g.beginPath(); g.rect(cx - r, lvl, r * 2, cy + r * 1.08 - lvl); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)";
    g.beginPath(); g.ellipse(cx - r * 0.35, cy - r * 0.45, r * 0.28, r * 0.14, -0.5, 0, 7); g.fill();
    g.restore();
  });
  // knot + string at the bottom
  p.poly([[cx - 16, cy + r * 1.08 - 6], [cx + 16, cy + r * 1.08 - 6], [cx, cy + r * 1.08 + 34]], "#3f7ea8", 6);
  p.stroke([[cx, cy + r * 1.08 + 34], [cx + 30, cy + r * 1.08 + 130], [cx - 10, cy + r * 1.08 + 220]], 5, INK);
  // pressure ticks on the right
  for (let i = 0; i <= 4; i++) {
    const y = 300 + i * 110;
    p.stroke([[470, y], [500, y]], 5, INK);
  }
  const fy = 300 + (1 - fill) * 440;
  p.stroke([[440, fy], [505, fy]], 10, "#b8282b");
  g.save();
  g.fillStyle = INK; g.font = "bold 30px Arial, sans-serif"; g.textAlign = "center";
  g.fillText(fill > 0.66 ? "FULL!" : fill > 0.33 ? "FILLING..." : "EMPTY", 300, 880);
  g.restore();
};

/** Pressure gauge. pressure 1..0 = needle from HIGH to LOW. */
export const pressureGauge = (p, pressure = 1) => {
  board(p, "PRESSURE");
  const cx = 300, cy = 540, r = 190;
  // dial
  const dial = [];
  for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2; dial.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  p.gradFill(dial, "#fdfaf0", "#e8dfc8", -2.1);
  p.inkRing(dial, 10, 0.6);
  // green (low, right) -> yellow -> red (high, left) along the TOP arc.
  // Canvas angles: 0 = right, PI/2 = down, PI = left, 3PI/2 = up.
  const g = p.g;
  g.save(); g.lineWidth = 26; g.lineCap = "butt";
  g.strokeStyle = "#3f8a4a"; g.beginPath(); g.arc(cx, cy, r - 26, 1.6 * Math.PI, 1.85 * Math.PI); g.stroke();
  g.strokeStyle = "#d9a441"; g.beginPath(); g.arc(cx, cy, r - 26, 1.4 * Math.PI, 1.6 * Math.PI); g.stroke();
  g.strokeStyle = "#b8282b"; g.beginPath(); g.arc(cx, cy, r - 26, 1.15 * Math.PI, 1.4 * Math.PI); g.stroke();
  g.restore();
  // ticks along the top arc, low (right) to high (left)
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI * (1.15 + (i / 6) * 0.7);
    const x0 = cx + Math.cos(a) * (r - 44), y0 = cy + Math.sin(a) * (r - 44);
    const x1 = cx + Math.cos(a) * (r - 62), y1 = cy + Math.sin(a) * (r - 62);
    p.stroke([[x0, y0], [x1, y1]], 5, INK);
  }
  // needle: pressure 1 = up-left/high (1.25PI), 0 = up-right/low (1.75PI)
  const na = Math.PI * (1.25 + (1 - pressure) * 0.5);
  p.stroke([[cx, cy], [cx + Math.cos(na) * (r - 70), cy + Math.sin(na) * (r - 70)]], 10, "#b8282b");
  p.dot(cx, cy, 16, INK); p.dot(cx, cy, 8, "#d9a441");
  g.save();
  g.fillStyle = INK; g.font = "bold 30px Arial, sans-serif"; g.textAlign = "center";
  g.fillText("LOW", 430, 800); g.fillText("HIGH", 170, 800);
  g.fillText(pressure > 0.5 ? "DROPPING FAST" : "PRESSURE DOWN", 300, 880);
  g.restore();
};

/** The nervous-system handover: two switches. state 0 = HOLD half on
 *  (sympathetic, bladder shut), 1 = GO half on (parasympathetic, release).
 *  t 0..1 crossfades the zigzag nerve signal between the two. */
export const nerveSwitch = (p, state = 0) => {
  board(p, "NERVE SWITCH");
  const g = p.g;
  const sw = (cx, label, on, col) => {
    p.poly([[cx - 110, 300], [cx + 110, 300], [cx + 110, 480], [cx - 110, 480]], on ? col : "#d8cfba", 8);
    p.dot(cx, 340, 10, on ? "#ffffff" : INK);
    g.save(); g.fillStyle = on ? "#ffffff" : INK; g.font = "bold 34px Arial, sans-serif"; g.textAlign = "center";
    g.fillText(label, cx, 420); g.restore();
  };
  sw(170, "HOLD", state < 0.5, "#3f6fb5");
  sw(430, "GO", state >= 0.5, "#2f6a43");
  // zigzag nerve line between the switches and down to a shiver burst
  const zz = [];
  for (let i = 0; i <= 10; i++) zz.push([110 + i * 38, 620 + (i % 2 ? -46 : 46)]);
  p.stroke(zz, 7, state < 0.5 ? "#3f6fb5" : "#2f6a43");
  // shiver burst at the bottom when the switch flips
  const bx = 300, by = 800, n = state < 0.5 ? 4 : 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    p.stroke([[bx + Math.cos(a) * 34, by + Math.sin(a) * 34], [bx + Math.cos(a) * 74, by + Math.sin(a) * 74]], 7, "#b8282b");
  }
  p.dot(bx, by, 12, "#b8282b");
  g.save();
  g.fillStyle = INK; g.font = "bold 28px Arial, sans-serif"; g.textAlign = "center";
  g.fillText(state < 0.5 ? "holding it in..." : "switch flips: SHIVER!", 300, 920);
  g.restore();
};

/** Framed plaque with the fancy name (name shot). */
export const namePlaque = (p) => {
  board(p, "THE FANCY NAME");
  const g = p.g;
  g.save();
  g.fillStyle = INK; g.font = "bold 44px Arial, sans-serif"; g.textAlign = "center";
  const lines = ["POST-", "MICTURITION", "CONVULSION", "SYNDROME"];
  lines.forEach((t, i) => g.fillText(t, 300, 300 + i * 88));
  g.font = "28px Arial, sans-serif"; g.fillStyle = "#5a5142";
  g.fillText("the pee shiver,", 300, 700);
  g.fillText("with a diploma.", 300, 744);
  g.restore();
  // little medal
  p.ell(300, 830, 34, 34, "#d9a441", 6);
  p.dot(300, 830, 10, "#8a6a1f");
};

/** Shiver zigzags beside the head (hook / cold FX card, transparent bg).
 *  The zigzags sit at the card's left/right edges so they flank the head
 *  instead of drawing over it. */
export const fxShiver = (p, t = 0) => {
  for (const s of [-1, 1]) {
    const pts = [];
    for (let i = 0; i < 5; i++) pts.push([300 + s * (190 + (i % 2) * 44), 280 + i * 130 + (s > 0 ? 60 : 0) + Math.sin(t * 6 + i) * 8]);
    p.stroke(pts, 12, "#4a90c2");
  }
};

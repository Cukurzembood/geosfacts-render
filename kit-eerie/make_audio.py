#!/usr/bin/env python3
"""Ambient bed for the eerie test video — NO Gemini TTS (quota reserved
for pipeline prep 052-056). 66.0 s, 44.1 kHz mono 16-bit WAV.
Wind (brown noise, slow swell) + low drone (55 + 110 Hz) + heartbeat
(a soft 55 Hz thump every 1.2 s) + one door-slam thud at t = 50.0 s
(frame 1500). Narration stays silent; VO is pending."""
import numpy as np

SR = 44100
DUR = 66.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

# --- wind: brown noise, lowpassed by moving average, slow swell ---
white = rng.standard_normal(N)
brown = np.cumsum(white)
brown -= np.linspace(brown[0], brown[-1], N)  # detrend
k = 400
kernel = np.ones(k) / k
wind = np.convolve(brown, kernel, mode="same")
wind /= np.max(np.abs(wind)) + 1e-9
swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / 17.0 + 1.0)
wind *= 0.30 * swell

# --- drone: 55 Hz + 110.5 Hz, very quiet ---
drone = 0.10 * np.sin(2 * np.pi * 55 * t) + 0.05 * np.sin(2 * np.pi * 110.5 * t)
drone *= 0.5 + 0.5 * np.sin(2 * np.pi * t / 33.0)  # slow breathing swell

# --- heartbeat: 55 Hz thump every 1.2 s, exp-decay envelope ---
heart = np.zeros(N)
period = 1.2
for start in np.arange(0.6, DUR, period):
    i0 = int(start * SR)
    L = int(0.22 * SR)
    if i0 + L > N:
        break
    tt = np.arange(L) / SR
    heart[i0:i0 + L] += 0.55 * np.sin(2 * np.pi * 55 * tt) * np.exp(-28 * tt)

# --- door slam at t = 50.0 s: 70 Hz thud + noise burst ---
slam = np.zeros(N)
i0 = int(50.0 * SR)
L = int(0.5 * SR)
tt = np.arange(L) / SR
slam[i0:i0 + L] = (
    0.85 * np.sin(2 * np.pi * 70 * tt) * np.exp(-10 * tt)
    + 0.35 * rng.standard_normal(L) * np.exp(-30 * tt)
)

mix = wind + drone + heart + slam
# gentle fade in / out (0.5 s each)
fade = min(int(0.5 * SR), N // 2)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)
peak = np.max(np.abs(mix))
mix = (mix / peak * 0.7 * 32767).astype(np.int16)

import wave
with wave.open("/home/hatch/workspace/cartoon-kit-test/eerie/mix_eerie.wav", "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(mix.tobytes())
print(f"wrote mix_eerie.wav: {DUR}s, peak {peak:.2f} (normalized to 0.7)")

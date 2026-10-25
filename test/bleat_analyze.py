import numpy as np, scipy.io.wavfile as wf, scipy.signal as sg, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt, pathlib, sys
names = sys.argv[1:] or ["ewe", "ewe2", "ram", "lamb", "lamb2"]
fig, axes = plt.subplots(2, len(names), figsize=(4 * len(names), 7), gridspec_kw={"height_ratios": [3, 1.3]})
for col, n in enumerate(names):
    sr, x = wf.read(f"shots/audio/bleat-{n}.wav"); x = x.astype(float) / 32768
    f, t, S = sg.spectrogram(x, sr, nperseg=1024, noverlap=900, window="hann")
    ax = axes[0, col]; ax.pcolormesh(t, f, 10 * np.log10(S + 1e-12), vmin=-110, vmax=-30, shading="auto", cmap="magma")
    ax.set_ylim(0, 5000); ax.set_title(n); ax.set_xlabel("s")
    # F0 track by autocorrelation
    hop, win = int(sr * 0.005), int(sr * 0.03); ts, f0s = [], []
    for i in range(0, len(x) - win, hop):
        seg = x[i:i + win] * np.hanning(win)
        if np.sqrt(np.mean(seg ** 2)) < 0.01: continue
        ac = np.correlate(seg, seg, "full")[win - 1:]
        lo, hi = int(sr / 900), int(sr / 120)
        k = lo + np.argmax(ac[lo:hi]); ts.append(i / sr); f0s.append(sr / k)
    ts, f0s = np.array(ts), np.array(f0s)
    ax2 = axes[1, col]; ax2.plot(ts, f0s, lw=1); ax2.set_ylabel("F0 Hz"); ax2.set_xlabel("s")
    # vibrato rate from F0 track (detrended)
    m = (ts > 0.15) & (ts < ts.max() - 0.15)
    if m.sum() > 20:
        y = f0s[m] - np.polyval(np.polyfit(ts[m], f0s[m], 2), ts[m])
        spec = np.abs(np.fft.rfft(y * np.hanning(len(y)), 4096)); fr = np.fft.rfftfreq(4096, hop / sr)
        sel = (fr > 4) & (fr < 25); rate = fr[sel][np.argmax(spec[sel])]
        depth = np.std(y) / np.mean(f0s[m]) * 100 * 1.41
        print(f"{n}: dur {len(x)/sr:.2f}s  mean F0 {np.mean(f0s[m]):.0f} Hz  vibrato {rate:.1f} Hz  depth ~{depth:.1f}%")
    # long-term spectrum peaks (formant regions)
    P = np.mean(S[:, (t > 0.1) & (t < t.max() - 0.15)], axis=1)
    env = sg.savgol_filter(10 * np.log10(P + 1e-12), 31, 2)
    pk, _ = sg.find_peaks(env, distance=20, prominence=3)
    print("   spectral envelope peaks (Hz):", [int(f[p]) for p in pk if f[p] < 4500][:5])
plt.tight_layout(); plt.savefig("shots/bleat-spectrograms.png", dpi=80)

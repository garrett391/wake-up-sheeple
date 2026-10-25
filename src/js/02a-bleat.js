/* ---------------- a sheep's voice ----------------
   Additive source-filter synthesis: a glottal buzz built from harmonics, shaped by "b -> aa -> eh"
   vowel formants, with the fast irregular quaver (coupled pitch and loudness wobble) that makes a bleat a bleat.
   As the pitch wobbles, harmonics sweep across the formants, which gives the "baa-aa-aa" its texture. */
function synthBleat(sr, o) {
  const n = Math.floor(sr * o.dur), out = new Float32Array(n), TAU2 = Math.PI * 2;
  let seed = (o.seed * 7919 + 104729) % 2147483647;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const fs = o.fs || 1;
  const FB = [330, 950, 2350, 3300, 4200], FA = [840, 1640, 2700, 3600, 4400], FE = [640, 1820, 2600, 3500, 4300], BW = [100, 130, 190, 270, 380];
  const K = Math.max(8, Math.min(48, Math.floor(6200 / (o.f0 * 0.8))));
  const gains = new Float32Array(K + 1), F = [0, 0, 0, 0, 0];
  const reso = (f, bw) => { const r = Math.exp((-Math.PI * bw) / sr), th = (TAU2 * f) / sr; return { a1: 2 * r * Math.cos(th), a2: -r * r, g: 1 - r, y1: 0, y2: 0 }; };
  const r2 = reso(1700 * fs, 320), r3 = reso(2800 * fs, 420);
  let phase = 0, vph = rnd() * TAU2, jit = 0, peak = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const contour = (0.9 + 0.15 * sm(0, 0.07, t)) * (1 - 0.1 * sm(0.12, o.dur, t)) * (1 - 0.09 * sm(o.dur - 0.16, o.dur, t));
    const depth = o.depth * sm(0.02, 0.14, t) * (1 + 0.25 * Math.sin(t * 2.7 + o.seed));
    vph += (TAU2 * o.rate * (1 + 0.07 * Math.sin(t * 1.9 + o.seed * 0.7))) / sr;
    const vib = Math.sin(vph) + 0.22 * Math.sin(2 * vph + 0.8);
    const f0 = o.f0 * contour * (1 + depth * vib) * (1 + jit);
    phase += (TAU2 * f0) / sr;
    if (phase >= TAU2) { phase -= TAU2; jit = (rnd() * 2 - 1) * (0.006 + 0.035 * sm(o.dur - 0.2, o.dur, t)); }
    if (i % 32 === 0) {
      const kO = sm(0, 0.06, t), kE = sm(o.dur - 0.28, o.dur, t);
      for (let j = 0; j < 5; j++) { let f = FB[j] + (FA[j] - FB[j]) * kO; f += (FE[j] - f) * kE; F[j] = f * fs; }
      for (let k = 1; k <= K; k++) {
        const f = k * f0;
        if (f > sr * 0.45) { gains[k] = 0; continue; }
        let g = 1 / Math.pow(k, 0.8);
        for (let j = 0; j < 5; j++) { const b = BW[j] * 0.5 * fs, Fj = F[j]; g *= (Fj * Fj + b * b) / Math.sqrt(((f - Fj) * (f - Fj) + b * b) * ((f + Fj) * (f + Fj) + b * b)); }
        gains[k] = g;
      }
    }
    const s1 = Math.sin(phase), c1 = Math.cos(phase);
    let sk = s1, ck = c1, v = 0;
    for (let k = 1; k <= K; k++) { v += gains[k] * sk; const ns = sk * c1 + ck * s1; ck = ck * c1 - sk * s1; sk = ns; }
    const env = Math.pow(sm(0, 0.04, t), 1.2) * Math.pow(1 - sm(o.dur - 0.15, o.dur, t), 1.1);
    const am = 1 - o.am + o.am * (0.5 + (0.5 * vib) / 1.22);
    const w = rnd() * 2 - 1;
    const y2 = r2.a1 * r2.y1 + r2.a2 * r2.y2 + w * r2.g; r2.y2 = r2.y1; r2.y1 = y2;
    const y3 = r3.a1 * r3.y1 + r3.a2 * r3.y2 + w * r3.g; r3.y2 = r3.y1; r3.y1 = y3;
    const breathEnv = 0.25 + 0.75 * (1 - sm(0.02, 0.09, t)) + 0.8 * sm(o.dur - 0.25, o.dur, t);
    out[i] = (v * am + (y2 + 0.7 * y3) * breathEnv * (0.55 + 0.45 * Math.cos(phase)) * o.breath * 30) * env;
    const a = Math.abs(out[i]); if (a > peak) peak = a;
  }
  const ci = Math.floor(0.028 * sr), cl = Math.floor(0.006 * sr);
  for (let i = 0; i < cl && ci + i < n; i++) out[ci + i] += (rnd() * 2 - 1) * 0.12 * peak * (1 - i / cl);
  const norm = 0.9 / (peak || 1);
  for (let i = 0; i < n; i++) out[i] *= norm;
  return out;
}
const BLEATS = {
  ewe: { f0: 290, dur: 0.78, rate: 10.8, depth: 0.065, am: 0.3, breath: 0.12, fs: 1, seed: 1 },
  ewe2: { f0: 255, dur: 0.9, rate: 9.8, depth: 0.075, am: 0.32, breath: 0.14, fs: 0.97, seed: 2 },
  ram: { f0: 185, dur: 0.85, rate: 9.2, depth: 0.06, am: 0.28, breath: 0.12, fs: 0.88, seed: 3 },
  lamb: { f0: 470, dur: 0.6, rate: 12.5, depth: 0.085, am: 0.34, breath: 0.1, fs: 1.18, seed: 4 },
  lamb2: { f0: 520, dur: 0.5, rate: 13.5, depth: 0.09, am: 0.34, breath: 0.1, fs: 1.2, seed: 5 },
};

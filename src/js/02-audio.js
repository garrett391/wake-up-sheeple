/* ---------------- audio: one jingle, three moods, plus synthesized bleats ---------------- */
const Snd = (() => {
  let ac = null, master = null, mus = null, fx = null, noiseBuf = null;
  let muted = !!store.get().muted;
  let mode = 'candy', nextT = 0, step = 0;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // "Graze hap-py, graze hap-py..." in scale degrees, eighth notes, null = rest
  const MEL = [4, 4, 2, null, 4, 4, 2, null, 2, 3, 4, 5, 4, 2, 0, null, 5, 5, 4, null, 3, 3, 2, null, 1, 2, 3, 1, 0, null, null, null];
  const BASS = [0, 0, 0, 4, 3, 4, 4, 0];
  const SCALE = { candy: [0, 2, 4, 5, 7, 9, 11], truth: [0, 2, 3, 5, 7, 8, 10], real: [0, 2, 4, 5, 7, 9, 11], quiet: [0, 2, 3, 5, 7, 8, 10] };
  const BPM = { candy: 132, truth: 84, real: 100, quiet: 100 };
  const deg = (sc, d) => sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const now = () => (ac ? ac.currentTime : 0);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ac = new AC(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.85; master.connect(ac.destination);
    mus = ac.createGain(); mus.gain.value = 0.3; mus.connect(master);
    fx = ac.createGain(); fx.gain.value = 0.75; fx.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    nextT = ac.currentTime + 0.15; step = 0;
    setInterval(schedule, 30);
    setTimeout(buildBleats, 0);
    if (ac.state === 'suspended') ac.resume().catch(() => {});
  }
  function schedule() {
    if (!ac || ac.state !== 'running') return;
    if (nextT < ac.currentTime - 0.25) nextT = ac.currentTime + 0.05;
    while (nextT < ac.currentTime + 0.14) {
      const m = mode, sc = SCALE[m], spb = 60 / BPM[m] / 2;
      const d = MEL[step % MEL.length];
      if (d !== null && m !== 'quiet') note(m, 72 + deg(sc, d), nextT);
      if (step % 4 === 0) bass(m, 48 + deg(sc, BASS[(step >> 2) % BASS.length]), nextT, spb * 4);
      if (m === 'candy' && step % 2 === 1) noise(nextT, 0.04, 0.02, 7000, 'highpass', 0.7, mus);
      nextT += spb; step++;
    }
  }
  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function osc(type, f, t, dur, peak, a, bus, detune) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.setValueAtTime(detune, t);
    env(g, t, a || 0.005, peak, dur);
    o.connect(g); g.connect(bus || fx); o.start(t); o.stop(t + (a || 0.005) + dur + 0.05);
    return o;
  }
  function noise(t, dur, peak, f, type, q, bus, f1) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f, t);
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    fl.Q.value = q || 1;
    const g = ac.createGain(); env(g, t, 0.01, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(bus || fx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.06);
  }
  function note(m, midi, t) {
    const f = mtof(midi);
    if (m === 'candy') { osc('triangle', f, t, 0.24, 0.16, 0.004, mus); osc('square', f * 2, t, 0.1, 0.022, 0.003, mus); }
    else if (m === 'truth') { const dt = (Math.random() * 2 - 1) * 26; osc('sine', f, t, 1.1, 0.13, 0.008, mus, dt); osc('triangle', f * 2.005, t, 0.6, 0.03, 0.008, mus, dt); }
    else { osc('sine', f, t, 0.5, 0.12, 0.01, mus); osc('triangle', f, t, 0.3, 0.04, 0.01, mus); }
  }
  function bass(m, midi, t, dur) { osc(m === 'truth' || m === 'quiet' ? 'sine' : 'triangle', mtof(midi), t, dur * 0.9, m === 'quiet' ? 0.07 : 0.12, 0.01, mus); }
  let bleats = null;
  function buildBleats() {
    bleats = {};
    const keys = Object.keys(BLEATS);
    let i = 0;
    const step = () => {
      if (i >= keys.length) return;
      const k = keys[i++], o = BLEATS[k];
      try {
        const data = synthBleat(ac.sampleRate, o), buf = ac.createBuffer(1, data.length, ac.sampleRate);
        buf.getChannelData(0).set(data);
        bleats[k] = { buf, rel: o.f0 / BLEATS.ewe.f0 };
      } catch (e) { /* keep the simple synth for this one */ }
      setTimeout(step, 0);
    };
    step();
  }
  function baa(p, vol, when) {
    if (!ac || ac.state !== 'running') return;
    p = p || 1; vol = vol || 0.5;
    const key = p >= 1.3 ? (Math.random() < 0.5 ? 'lamb' : 'lamb2') : p < 0.8 ? 'ram' : p === 1 ? 'ewe' : Math.random() < 0.5 ? 'ewe' : 'ewe2';
    const b = bleats && bleats[key];
    if (!b) { baaSynth(p, vol, when); return; }
    const t = now() + (when || 0);
    const src = ac.createBufferSource(); src.buffer = b.buf;
    src.playbackRate.setValueAtTime(clamp(p / b.rel, 0.86, 1.16) * (p === 1 ? 1 : 1 + (Math.random() * 2 - 1) * 0.03), t);
    const g = ac.createGain(); g.gain.value = vol * 1.15;
    src.connect(g); g.connect(fx); src.start(t);
  }
  function baaSynth(p, vol, when) {
    if (!ac || ac.state !== 'running') return;
    p = p || 1; vol = vol || 0.5;
    const t = now() + (when || 0);
    const o = ac.createOscillator(); o.type = 'sawtooth';
    const f0 = 290 * p;
    o.frequency.setValueAtTime(f0 * 1.06, t); o.frequency.linearRampToValueAtTime(f0, t + 0.08); o.frequency.linearRampToValueAtTime(f0 * 0.9, t + 0.55);
    const lfo = ac.createOscillator(); lfo.frequency.value = 24 + Math.random() * 6;
    const lg = ac.createGain(); lg.gain.value = 0.45; lfo.connect(lg);
    const am = ac.createGain(); am.gain.value = 0.55; lg.connect(am.gain);
    const b1 = ac.createBiquadFilter(); b1.type = 'bandpass'; b1.frequency.value = 1000 * Math.sqrt(p); b1.Q.value = 1.3;
    const b2 = ac.createBiquadFilter(); b2.type = 'bandpass'; b2.frequency.value = 2500 * Math.sqrt(p); b2.Q.value = 2.2;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.05);
    g.gain.setValueAtTime(vol, t + 0.36); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(am); am.connect(b1); am.connect(b2); b1.connect(g); b2.connect(g); g.connect(fx);
    o.start(t); lfo.start(t); o.stop(t + 0.66); lfo.stop(t + 0.66);
  }
  const arp = (notes, gap, type, vol, dur) => { const t = now(); notes.forEach((m, i) => osc(type || 'triangle', mtof(m), t + i * gap, dur || 0.25, vol || 0.14, 0.004)); };
  const SFX = {
    click() { osc('triangle', 880, now(), 0.05, 0.05); },
    pickup() { arp([84, 91], 0.08, 'triangle', 0.14); },
    proof() { arp([72, 76, 79, 84], 0.07, 'triangle', 0.15, 0.3); },
    wake() { arp([79, 83, 86, 91], 0.06, 'triangle', 0.14, 0.35); osc('sine', mtof(103), now() + 0.24, 0.4, 0.05); },
    alertQ() { osc('square', 660, now(), 0.07, 0.05); },
    alertX() { const t = now(); osc('square', 990, t, 0.06, 0.06); osc('square', 1320, t + 0.08, 0.08, 0.06); },
    caught() { const t = now(); const o = osc('sawtooth', 640, t, 0.75, 0.12, 0.01); o.frequency.exponentialRampToValueAtTime(110, t + 0.75); noise(t, 0.4, 0.08, 900, 'lowpass', 0.7); },
    bonk() { const t = now(); const o = osc('sine', 200, t, 0.28, 0.25, 0.005); o.frequency.exponentialRampToValueAtTime(70, t + 0.28); },
    specsOn() { const t = now(); noise(t, 0.5, 0.12, 3200, 'bandpass', 1.2, fx, 260); const o = osc('sine', 220, t + 0.05, 0.6, 0.12, 0.02); o.frequency.exponentialRampToValueAtTime(90, t + 0.65); },
    specsOff() { noise(now(), 0.45, 0.1, 300, 'bandpass', 1.2, fx, 3600); arp([84, 88, 91], 0.05, 'triangle', 0.08); },
    ach() { arp([79, 84, 88, 91], 0.09, 'square', 0.05, 0.3); },
    tick(accent) { osc('sine', accent ? 1560 : 1040, now(), 0.04, accent ? 0.2 : 0.12, 0.002); },
    kick() { const t = now(); const o = osc('sine', 150, t, 0.2, 0.35, 0.003); o.frequency.exponentialRampToValueAtTime(42, t + 0.2); },
    chorus(n) { for (let i = 0; i < (n || 3); i++) baa(0.75 + Math.random() * 0.6, 0.16, 0.02 + i * 0.05); },
    bigBaa() { [0.62, 0.74, 0.86, 1, 1.15, 1.32].forEach((p, i) => baa(p, 0.32, i * 0.015)); noise(now(), 1.4, 0.3, 140, 'lowpass', 0.8); },
    yelp() { const t = now(); const o = osc('sawtooth', 700, t, 0.38, 0.07, 0.01); o.frequency.exponentialRampToValueAtTime(1400, t + 0.12); o.frequency.exponentialRampToValueAtTime(500, t + 0.38); },
    woof() { const t = now(); const o = osc('sawtooth', 260, t, 0.16, 0.12, 0.005); o.frequency.exponentialRampToValueAtTime(140, t + 0.16); noise(t, 0.12, 0.06, 500, 'bandpass', 1); },
    crash() { noise(now(), 0.9, 0.25, 600, 'lowpass', 0.6); },
    rumble() { noise(now(), 2.6, 0.22, 160, 'lowpass', 0.9); },
    fanfare() { arp([72, 76, 79, 84, 88], 0.09, 'triangle', 0.15, 0.4); },
    door() { const t = now(); const o = osc('sawtooth', 170, t, 0.35, 0.05, 0.02); o.frequency.linearRampToValueAtTime(110, t + 0.35); noise(t, 0.3, 0.05, 900, 'bandpass', 2); },
    dig() { const t = now(); for (let i = 0; i < 4; i++) noise(t + i * 0.12, 0.08, 0.12, 500 + i * 120, 'bandpass', 1.5); },
    organ() { const t = now(); [48, 55, 60, 64, 67, 72].forEach((m, i) => { osc('sine', mtof(m), t + i * 0.025, 1.7, 0.05, 0.14); osc('triangle', mtof(m + 12), t + i * 0.025, 1.3, 0.012, 0.14); }); },
    amen() { const t = now(); [[53, 57, 60, 65], [48, 55, 60, 64]].forEach((ch, j) => ch.forEach((m) => { osc('sine', mtof(m), t + j * 0.5, 0.55 + j * 0.6, 0.045, 0.07); osc('triangle', mtof(m + 12), t + j * 0.5, 0.45 + j * 0.5, 0.01, 0.07); })); },
    bell() { const t = now(), f = 392; [[0.5, 0.07, 2.6], [1, 0.1, 2.2], [1.19, 0.05, 1.7], [1.5, 0.045, 1.4], [2, 0.035, 1.2], [2.52, 0.02, 0.9], [3, 0.014, 0.7]].forEach(([r, v, d]) => osc('sine', f * r, t, d, v, 0.003)); },
    caw() { const t = now(); for (let i = 0; i < 2; i++) { const o = osc('sawtooth', 860, t + i * 0.2, 0.15, 0.07, 0.005); o.frequency.exponentialRampToValueAtTime(470, t + i * 0.2 + 0.15); noise(t + i * 0.2, 0.13, 0.05, 1600, 'bandpass', 2.2); } },
    oink() { const t = now(); for (let i = 0; i < 2; i++) { const o = osc('sawtooth', 230 - i * 20, t + i * 0.16, 0.14, 0.08, 0.008); o.frequency.exponentialRampToValueAtTime(150, t + i * 0.16 + 0.14); noise(t + i * 0.16, 0.12, 0.05, 650, 'bandpass', 3); } },
    snap() { const t = now(); noise(t, 0.07, 0.22, 3200, 'highpass', 1); osc('square', 1900, t, 0.04, 0.05); noise(t + 0.05, 0.12, 0.08, 900, 'bandpass', 2); },
    lickDrop() { arp([84, 88, 91, 96], 0.05, 'triangle', 0.09, 0.22); },
    kick() { const t = now(); const o = osc('sine', 190, t, 0.18, 0.3, 0.003); o.frequency.exponentialRampToValueAtTime(60, t + 0.18); noise(t + 0.02, 0.3, 0.12, 2400, 'bandpass', 0.8, fx, 700); },
    crunch() { const t = now(); for (let i = 0; i < 3; i++) noise(t + i * 0.09, 0.07, 0.12, 2600 - i * 400, 'bandpass', 1.4); [79, 76, 72, 67].forEach((m, i) => osc('sine', mtof(m), t + 0.32 + i * 0.13, 0.4, 0.07, 0.01)); },
    sniff() { const t = now(); noise(t, 0.07, 0.08, 4000, 'highpass', 0.7); noise(t + 0.12, 0.07, 0.08, 4200, 'highpass', 0.7); },
  };
  return {
    init,
    baa,
    get muted() { return muted; },
    get bleatsReady() { return !!(bleats && bleats.ewe && bleats.lamb2); },
    setMode(m) { mode = m; },
    toggleMute() {
      muted = !muted; store.patch({ muted });
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.85, ac.currentTime, 0.03);
      return muted;
    },
    play(name, arg) {
      if (!ac || ac.state !== 'running' || !SFX[name]) return;
      try { SFX[name](arg); } catch (e) { /* a dropped sound effect is harmless */ }
    },
  };
})();

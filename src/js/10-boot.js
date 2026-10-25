/* ---------------- camera and sizing ---------------- */
function titleCam() {
  const vw = view.w / zoom, vh = view.h / zoom, narrow = view.w < 700 || view.h > view.w;
  return { x: 640 - vw * (narrow ? 0.5 : 0.68), y: 440 - vh * (narrow ? 0.52 : 0.56) };
}
function updateCamera(dt, snap) {
  const vw = view.w / zoom, vh = view.h / zoom;
  let tx, ty;
  if (G.mode === 'title') { const c = titleCam(); tx = c.x; ty = c.y; }
  else if (G.camTarget) { tx = G.camTarget.x - vw / 2; ty = G.camTarget.y - vh / 2; }
  else { const p = G.player; tx = p.x + p.vx * 0.2 - vw / 2; ty = p.y - 24 + p.vy * 0.2 - vh / 2; }
  const fx = G.camTarget ? G.camTarget.x : G.player ? G.player.x : 640, fy = G.camTarget ? G.camTarget.y : G.player ? G.player.y : 440;
  const RG = REGIONS[G.mode === 'title' ? 'ranch' : regionOf(fx, fy)], rw = RG.x1 - RG.x0, rh = RG.y1 - RG.y0;
  tx = vw >= rw ? RG.x0 + (rw - vw) / 2 : clamp(tx, RG.x0, RG.x1 - vw);
  ty = vh >= rh ? RG.y0 + (rh - vh) / 2 : clamp(ty, RG.y0, RG.y1 - vh);
  if (snap) { cam.x = tx; cam.y = ty; return; }
  const k = 1 - Math.exp(-dt * (G.camTarget ? 2.6 : 6));
  cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, k);
}
function resize() {
  const r = app.getBoundingClientRect();
  view.w = Math.max(1, r.width); view.h = Math.max(1, r.height);
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (view.w * view.h * dpr * dpr > 4.2e6) dpr = Math.sqrt(4.2e6 / (view.w * view.h));
  view.dpr = dpr;
  cv.width = Math.round(view.w * dpr); cv.height = Math.round(view.h * dpr);
  zoom = clamp(view.w / 900, view.h > view.w ? 0.8 : 0.62, 1.55);
  if (view.h / zoom < 460) zoom = Math.max(0.5, view.h / 460);
  vigCache.g = null;
  measureHud();
  if (G.player) { updateCamera(0, true); if (G.mode === 'title') resetLens(); }
}

/* ---------------- per-mode updates ---------------- */
function updateLens(dt) {
  const L = G.lens, wg = G.wolves[0];
  if (L.active > 0) L.active -= dt;
  else {
    const [fx, fy] = toScreen(wg.x, wg.y - 40);
    L.tx = fx + (RM ? 0 : Math.sin(G.clock * 0.6) * 46); L.ty = fy + (RM ? 0 : Math.sin(G.clock * 1.2) * 12);
  }
  const k = 1 - Math.exp(-dt * 10);
  L.x = lerp(L.x, L.tx, k); L.y = lerp(L.y, L.ty, k);
}
function updateTitle(dt) {
  for (const s of G.sheep) updateSheep(s, dt);
  separate();
  updateWolves(dt);
  updateParticles(dt);
  updateCamera(dt);
  updateLens(dt);
}
function updatePlay(dt) {
  updateWipe(dt);
  G.flash = Math.max(0, G.flash - dt * 2.5);
  if (G.modal) { updateCamera(dt); return; }
  if (G.fade) {
    G.fade.t += dt;
    if (!G.fade.fired && G.fade.t >= G.fade.dur / 2) { G.fade.fired = true; G.fade.mid(); }
    if (G.fade.t >= G.fade.dur) G.fade = null;
    pressed.clear(); updateCamera(dt); return;
  }
  if (G.pendingEnd) { const k = G.pendingEnd; G.pendingEnd = null; endGame(k); return; }
  G.time += dt;
  G.invuln = Math.max(0, G.invuln - dt); G.woozy = Math.max(0, G.woozy - dt); G.baaCd = Math.max(0, G.baaCd - dt);
  if (pressed.has(' ')) { if (G.phase === 'bigbaa') rhythmPress(); else toggleSpecs(); }
  if (pressed.has('b')) doBaa();
  if (pressed.has('e') && G.interact && canTalk()) doInteract(G.interact);
  pressed.clear();
  if (G.modal) return;
  if (G.cut) updateCut(dt);
  updatePlayer(dt);
  for (const s of G.sheep) updateSheep(s, dt);
  separate();
  updateChurch(dt);
  updateCh2(dt);
  updateWolves(dt);
  if (G.phase === 'fleecing') detect(dt); else { G.maxAlert = 0; G.seenBy = null; G.hiddenFrom = false; }
  if (G.modal) return;
  checkPickups();
  if (G.modal) return;
  const p = G.player;
  if (G.phase === 'meadow') {
    updateButterfly(dt);
    if (!G.flags.outside && p.x > FX1 + 12) { G.flags.outside = true; setObjective('Something is glinting in the mud.', "It's all gray out here. Creepy."); }
  } else {
    if (G.bfly && G.bfly.away) updateButterfly(dt);
    if (G.phase === 'fleecing') {
      updateLick(dt);
      if (G.ch === 1 && p.specsOn && G.view === 1 && !G.flags.sawRainbow && dist(p.x, p.y, RAINBOW.x, RAINBOW.y) < 220) { G.flags.sawRainbow = true; unlock('kevin'); }
    } else if (G.phase === 'herd') herdCheck();
    else if (G.phase === 'bigbaa') updateRhythm(dt);
    else if (G.phase === 'stampede') updateStampede(dt);
  }
  if (G.view === 1 && (G.ch === 2 || G.realT < 0.5) && regionOf(p.x, p.y) === 'ranch') fenceSparks(dt);
  if (regionOf(p.x, p.y) === 'field') {
    G.flags[p.x < DIVIDER.x ? 'sawNorth' : 'sawSouth'] = true;
    if (G.flags.sawNorth && G.flags.sawSouth && !G.flags.samePasture) { G.flags.samePasture = true; unlock('pasture'); toast('It is one field', 'The North Pasture and the South Pasture are the same pasture.'); }
  }
  tickTimers(dt);
  updateParticles(dt);
  updateCamera(dt);
  G.interact = canTalk() && !G.fade ? findInteract() : null;
  updateTouchButtons(); syncKeyHints();
}
function doBaa() {
  if (G.phase === 'bigbaa') { rhythmPress(); return; }
  if (G.baaCd > 0 || G.phase === 'stampede') return;
  G.baaCd = 0.5;
  const p = G.player;
  Snd.baa(1, 0.5); say(p, 'Baa!', 1); p.hopT = 1;
  if (G.phase === 'fleecing') makeNoise(p.x, p.y);
  let n = 0;
  for (const s of G.sheep) {
    if (n >= 3 || dist(s.x, s.y, p.x, p.y) > 260) continue;
    n++;
    later(0.35 + n * 0.25 + Math.random() * 0.2, () => { say(s, 'Baa!', 1); Snd.baa(s.kind === 'lamb' ? 1.4 : 0.85 + Math.random() * 0.3, 0.22); });
  }
}
function updateEnding(dt) {
  updateWipe(dt);
  for (const s of G.sheep) updateSheep(s, dt);
  if (G.endKind === 'counted') updateWolves(dt);
  updateParticles(dt);
  G.player.grazing = true; G.player.walk = 0;
  updateCamera(dt);
}

/* ---------------- loop ---------------- */
let lastT = performance.now(), lastErr = '';
function frame(now) {
  let dt = (now - lastT) / 1000; lastT = now;
  if (!(dt > 0)) dt = 0;
  if (dt > 0.05) dt = 0.05;
  G.clock += dt;
  try {
    shakeUpdate(dt);
    if (G.mode === 'title') updateTitle(dt);
    else if (G.mode === 'play') updatePlay(dt);
    else updateEnding(dt);
    render();
    const dlg = G.modal === 'dialog';
    if (app.classList.contains('dlg-open') !== dlg) app.classList.toggle('dlg-open', dlg);
  } catch (err) {
    const m = String(err && err.stack || err);
    if (m !== lastErr) { lastErr = m; console.error(err); }
  }
  requestAnimationFrame(frame);
}

/* ---------------- keep a run going across page updates ---------------- */
function makeSnapshot() {
  if (G.mode !== 'play' || !G.player || G.ch === 2) return { wakeUpSheeple: null };
  const p = G.player;
  return { wakeUpSheeple: {
    v: 1, phase: G.phase, px: p.x, py: p.y, hasSpecs: p.hasSpecs, specsOn: p.specsOn, cred: G.cred,
    proof: Array.from(G.proof), woke: G.sheep.filter((s) => s.state === 'woke').map((s) => s.id), wokeCount: G.woke, wokePersonal: G.wokePersonal,
    heat: G.heat, time: G.time, flags: { retry: !!G.flags.retry, sawRainbow: !!G.flags.sawRainbow, outside: !!G.flags.outside, visitedAcres: !!G.flags.visitedAcres, lickAt1: !!G.flags.lickAt1, lickAt3: !!G.flags.lickAt3 }, glassesTaken: G.glasses.taken,
    ally: !!(G.wolves.find((w) => w.id === 'biscuit') || {}).ally, region: regionOf(p.x, p.y),
  } };
}
function restoreSnapshot(s) {
  if (!s || s.v !== 1) return false;
  try {
    newGame({ retry: !!(s.flags && s.flags.retry) });
    Object.assign(G.flags, s.flags || {});
    let phase = s.phase;
    if (phase === 'reveal' || phase === 'herd' || phase === 'bigbaa' || phase === 'stampede') phase = 'fleecing';
    if (['meadow', 'glasses', 'fleecing'].indexOf(phase) < 0) return false;
    G.phase = phase;
    startPlay();
    const p = G.player;
    p.x = +s.px || p.x; p.y = +s.py || p.y; p.hasSpecs = !!s.hasSpecs || phase !== 'meadow';
    if (s.region && s.region !== 'ranch') { p.x = 410; p.y = 300; }
    if (s.ally) { const b = G.wolves.find((w) => w.id === 'biscuit'); if (b) b.ally = true; }
    G.cred = clamp(s.cred | 0, 1, 3); G.time = +s.time || 0;
    G.glasses.taken = !!s.glassesTaken || phase !== 'meadow';
    if (G.glasses.taken) G.bfly.gone = true;
    for (const id of s.proof || []) { const pr = G.proofs.find((q) => q.id === id); if (pr) { pr.found = true; G.proof.add(id); } }
    for (const id of s.woke || []) {
      const sh = G.sheep.find((q) => q.id === id);
      if (!sh) continue;
      sh.state = 'woke';
      if (sh.kind === 'lamb') startFollowing(sh);
      if (sh.id === 'gerald') { sh.home = 'ranch'; sh.x = sh.hx = sh.tx = 430; sh.y = sh.hy = sh.ty = 330; PEN_GATE.on = false; }
      if (sh.id === 'ewenice') G.church.ewenice = true; else if (sh.home === 'church') G.church.walkout = true;
      if (sh.home === 'church') exitChurch(sh, false);
    }
    G.woke = s.wokeCount | 0; G.wokePersonal = s.wokePersonal | 0; G.playerDark = Math.min(0.72, G.woke * 0.24); G.heat = s.heat | 0;
    if (G.heat >= 2) { const b = G.wolves.find((w) => w.id === 'biscuit'); if (b) b.active = true; }
    if (phase === 'fleecing') G.wolves[0].waving = false;
    setPhase(phase);
    if (s.specsOn && p.hasSpecs && phase === 'fleecing') { p.specsOn = true; G.view = 1; setUIMode('truth'); Snd.setMode('truth'); }
    syncHUD(true); updateCamera(0, true);
    if (phase === 'fleecing' && G.woke >= WOKE_GOAL) startHerd();
    return true;
  } catch (e) { return false; }
}

/* ---------------- start ---------------- */
function boot(data) {
  newGame({});
  G.mode = 'title';
  resize();
  if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(app); else window.addEventListener('resize', resize);
  if (COARSE) enableTouch();
  syncSoundBtn(); refreshTitleFoot(); resetLens();
  if (CH2_PARAM && !store.get().ch2) store.patch({ ch2: true });
  const snap = data && data.wakeUpSheeple;
  if (!(snap && restoreSnapshot(snap))) { ui.scrTitle.hidden = false; ui.btnPlay.focus({ preventScroll: true }); }
  const unlockAudio = () => { if (G.mode === 'play') Snd.init(); };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio);
  requestAnimationFrame((t) => { lastT = t; frame(t); });
}
if (DEBUG) {
  window.__wus = {
    G, cam, view, solids, ui, Snd, STATIC,
    state: () => ({ mode: G.mode, phase: G.phase, modal: G.modal, cred: G.cred, woke: G.woke, proof: Array.from(G.proof), view: G.view, px: Math.round(G.player.x), py: Math.round(G.player.y), maxAlert: G.maxAlert, wipe: !!G.wipe, realT: G.realT, cut: G.cut && G.cut.stage }),
    tp(x, y) { G.player.x = x; G.player.y = y; G.player.vx = G.player.vy = 0; updateCamera(0, true); },
    skipReveal() { G.cut = null; G.camTarget = null; G.wolves[0].waving = false; G.glasses.taken = true; G.bfly.gone = true; G.player.hasSpecs = true; G.player.specsOn = true; G.view = 1; G.wipe = null; setUIMode('truth'); Snd.setMode('truth'); setPhase('fleecing'); },
    give(id) { const pr = G.proofs.find((q) => q.id === id); if (pr && !pr.found) { pr.found = true; G.proof.add(id); syncHUD(); updateFleeceObjective(); } },
    talk(id) { talkTo(G.sheep.find((s) => s.id === id)); },
    choose(i) { if (dlgTyping) finishTyping(); const b = ui.dlgChoices.querySelectorAll('button')[i]; if (b) b.click(); return !!b; },
    choices() { return Array.from(ui.dlgChoices.querySelectorAll('button')).map((b) => b.textContent); },
    beat() { const r = G.rh; if (!r) return; const k = Math.max(0, Math.ceil((r.t - r.start) / r.iv)); r.t = r.start + k * r.iv; rhythmPress(); },
    catchMe(id) { caught(G.wolves.find((w) => w.id === (id || 'wolfgang'))); },
    setCred(n) { G.cred = n; syncHUD(); },
    bench(n) { n = n || 60; const t0 = performance.now(); for (let i = 0; i < n; i++) render(); return (performance.now() - t0) / n; },
    portal(id) { const pt = PORTALS.find((q) => q.id === id); const dest = PORTALS.find((q) => q.id === pt.to); doTeleport(dest); },
    interact() { return G.interact && { kind: G.interact.kind, label: G.interact.label }; },
    use() { if (G.interact) doInteract(G.interact); },
    region() { return regionOf(G.player.x, G.player.y); },
    wolf(id) { const w = G.wolves.find((q) => q.id === id); return w && { x: Math.round(w.x), y: Math.round(w.y), alert: w.alert, ally: w.ally, distracted: w.distracted, sees: w.sees }; },
    sheep(id) { const s = G.sheep.find((q) => q.id === id); return s && { x: Math.round(s.x), y: Math.round(s.y), state: s.state, follow: s.follow, sulk: s.sulk }; },
    wear(on) { const p = G.player; p.hasSpecs = true; p.specsOn = !!on; G.view = on ? 1 : 0; G.wipe = null; setUIMode(on ? 'truth' : offMode()); Snd.setMode(on ? 'truth' : offMode()); },
    ch2(intro) { newGame({ ch: 2 }); startPlay(); if (intro) later(0.4, openCh2Intro); },
    convince(id) { const s = G.sheep.find((q) => q.id === id); if (s) convince(s); },
    crow(i) { const w = G.wolves.find((q) => q.id === 'crow' + (i || 0)); if (w) crowReport(w); },
    retireMe() { retire(G.wolves.find((q) => q.id === 'agentA')); },
    protest() { startProtest(); },
    chew() { chewRack(); },
    pig(id) { const w = G.wolves.find((q) => q.id === id); return w && { x: Math.round(w.x), y: Math.round(w.y), active: w.active, mode: w.mode, alert: w.alert, limp: !!w.limp, distracted: w.distracted }; },
    talkDog() { talkToDog(G.wolves.find((w) => w.id === 'biscuit')); },
    setZoom(z) { zoom = z; updateCamera(0, true); },
    church() { const C = G.church; return { mode: C.mode, t: +C.t.toFixed(2), len: C.len, ewenice: C.ewenice, walkout: C.walkout, bellT: +C.bellT.toFixed(2), prayers: C.prayers }; },
    setChurch(mode, t) { const C = G.church; C.mode = mode; C.t = t || 0; if (mode === 'warn') C.warn = C.warn || 2; },
    face(id, x, y) { const w = G.wolves.find((q) => q.id === id); if (w) { w.dir = Math.atan2(y - w.y, x - w.x); } },
    lick() { const L = G.lick; return L ? { x: Math.round(L.x), y: Math.round(L.y), tx: Math.round(L.tx), ty: Math.round(L.ty), sheep: L.sheep.id, prog: +lickProgress().toFixed(2), due: G.lickDue } : { due: G.lickDue, cd: +G.lickCd.toFixed(2), kicked: G.licksKicked }; },
    dropLick(id) { return dropLick(id); },
    kick() { kickLick(); },
  };
}
try { if (window.claude && window.claude.hot && typeof window.claude.hot.snapshot === 'function') window.claude.hot.snapshot(() => makeSnapshot()); } catch (e) { /* the viewer may not offer live updates */ }
{
  const hot = window.claude && window.claude.hot;
  if (hot && typeof hot.ready === 'function') hot.ready(boot); else boot((hot && hot.data) || {});
}

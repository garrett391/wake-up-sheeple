/* ---------------- state ---------------- */
const G = { mode: 'title', ch: 1, phase: 'meadow', clock: 0, lens: { x: 0, y: 0, tx: 0, ty: 0, active: 0 }, flags: {}, ach: new Set() };
let touchMode = false;

function makeSheep(d) {
  return {
    def: d, id: d.id, name: d.name, kind: d.kind, x: d.x, y: d.y, hx: d.x, hy: d.y, wander: d.wander, tx: d.x, ty: d.y,
    facing: Math.random() < 0.5 ? 1 : -1, phase: Math.random() * TAU, walk: 0, grazing: Math.random() < 0.6, grazeIdle: true,
    idle: 1 + Math.random() * 3, state: 'asleep', scale: d.kind === 'lamb' ? 0.74 : 1, follow: false, fi: 0,
    bubble: null, zT: Math.random() * 2, wakeFx: 0, hopT: 0, panic: 0, run: null, stuck: 0, home: d.home || 'ranch', sulk: 0,
  };
}
function makeWolf(d) {
  return Object.assign({}, d, {
    active: !d.inactive, wp: 0, pause: 0, lookBase: d.dir, alert: 0, sees: false, sheepCd: 0, facing: Math.cos(d.dir) < 0 ? -1 : 1,
    walk: 0, phase: 0, bubble: null, hatBounce: 0, hatOff: false, waving: d.id === 'wolfgang', route: null, ri: 0, talkT: 1 + Math.random() * 2, sitting: false,
    ally: false, distracted: 0, distractBy: null, cd: 0, goal: null, heard: 0, stuck: 0, dash: null, sulk: 0,
  });
}
function newGame(opts) {
  opts = opts || {};
  const ch = opts.ch === 2 ? 2 : 1;
  Object.assign(G, {
    ch, phase: ch === 2 ? 'glasses' : 'meadow', modal: null, time: 0, view: 0, wipe: null, realT: 0,
    proof: new Set(), woke: 0, wokePersonal: 0, cred: 3, heat: 0, sheepish: 0, ach: new Set(),
    flags: { retry: !!opts.retry }, timers: [], particles: [], pops: [], cut: null, camTarget: null,
    maxAlert: 0, invuln: 0, woozy: 0, playerDark: 0, rh: null, st: 0, fenceT: 0, disguisesGone: false, shock: null,
    flash: 0, flashColor: '255,255,255', talkTarget: null, hint: '', pendingEnd: null, afterDialog: null, sparkT: 0, baaCd: 0,
    seenBy: null, hiddenFrom: false, prayHidden: false, church: newChurch(), followCount: 0, endKind: null, interact: null, fade: null, noise: null,
    lick: null, lickDue: 0, lickCd: 0, licksKicked: 0, licksDropped: 0, lickCut: null, studio: newStudio(), camHidden: false, heatLater: false,
  });
  for (const b of solids) b.on = !b.ch || b.ch === ch;
  G.player = {
    id: 'you', name: 'You', kind: 'player', state: 'woke', x: opts.retry ? 1150 : 600, y: opts.retry ? 800 : 965, vx: 0, vy: 0,
    facing: 1, phase: 0, walk: 0, grazing: false, specsOn: false, hasSpecs: false, bubble: null, scale: 1, hopT: 0, caughtFx: 0,
  };
  G.sheep = SHEEP_DEFS.map(makeSheep);
  G.wolves = WOLF_DEFS.filter((d) => !d.ch || d.ch === ch).map(makeWolf);
  G.proofs = (ch === 2 ? PROOF_DEFS2 : PROOF_DEFS).map((p) => Object.assign({}, p, { found: false, ph: Math.random() * 6 }));
  G.glasses = { taken: false };
  const last = BFLY_PATH[BFLY_PATH.length - 1];
  G.bfly = opts.retry ? { x: last[0], y: last[1], i: BFLY_PATH.length - 1, gone: false, away: 0 } : { x: 650, y: 935, i: 0, gone: false, away: 0 };
  WOKE_GOAL = ch === 2 ? 3 : 4; PROOF_COUNT = G.proofs.length;
  if (ch === 2) setupCh2();
  hudKey = '';
  setUIMode(ch === 2 ? 'real' : 'candy');
}

/* ---------------- physics and sight ---------------- */
function collideCircle(e, r) {
  for (let it = 0; it < 2; it++) {
    for (const b of solids) {
      if (!b.on) continue;
      const cx = clamp(e.x, b.x0, b.x1), cy = clamp(e.y, b.y0, b.y1);
      const dx = e.x - cx, dy = e.y - cy, d2 = dx * dx + dy * dy;
      if (d2 >= r * r) continue;
      if (d2 > 1e-6) { const d = Math.sqrt(d2), push = r - d; e.x += (dx / d) * push; e.y += (dy / d) * push; }
      else {
        const l = e.x - b.x0, rr = b.x1 - e.x, t = e.y - b.y0, bt = b.y1 - e.y, m = Math.min(l, rr, t, bt);
        if (m === l) e.x = b.x0 - r; else if (m === rr) e.x = b.x1 + r; else if (m === t) e.y = b.y0 - r; else e.y = b.y1 + r;
      }
    }
  }
  e.x = clamp(e.x, 16, W - 16); e.y = clamp(e.y, 16, H - 16);
}
function blockedAt(x, y, pad) {
  for (const b of solids) if (b.on && x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad) return true;
  return false;
}
function segHitT(x, y, dx, dy, b) {
  let t0 = 0, t1 = 1;
  if (Math.abs(dx) < 1e-9) { if (x < b.x0 || x > b.x1) return null; }
  else { let a = (b.x0 - x) / dx, c = (b.x1 - x) / dx; if (a > c) { const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return null; }
  if (Math.abs(dy) < 1e-9) { if (y < b.y0 || y > b.y1) return null; }
  else { let a = (b.y0 - y) / dy, c = (b.y1 - y) / dy; if (a > c) { const s = a; a = c; c = s; } t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return null; }
  return t0;
}
function segBlocked(x1, y1, x2, y2) {
  for (const b of solids) if (b.on && b.opaque && segHitT(x1, y1, x2 - x1, y2 - y1, b) !== null) return true;
  return false;
}
function rayLen(x, y, ang, range) {
  const dx = Math.cos(ang) * range, dy = Math.sin(ang) * range; let best = 1;
  for (const b of solids) { if (!b.on || !b.opaque) continue; const t = segHitT(x, y, dx, dy, b); if (t !== null && t < best) best = t; }
  return best * range;
}
const coneDirs = (w) => (w.type === 'twohead' ? [w.dir, w.dir + Math.PI] : [w.dir]);
function inCone(w, x, y) {
  const d = dist(w.x, w.y, x, y);
  if (d > w.range) return -1;
  const a = Math.atan2(y - w.y, x - w.x);
  for (const dir of coneDirs(w)) if (Math.abs(angDiff(dir, a)) <= w.half && !segBlocked(w.x, w.y, x, y)) return d;
  return -1;
}
function turnToward(w, target, maxStep) { w.dir += clamp(angDiff(w.dir, target), -maxStep, maxStep); }
function setFacing(w) { const c = Math.cos(w.dir); if (c > 0.2) w.facing = 1; else if (c < -0.2) w.facing = -1; }

/* ---------------- timers, particles, bubbles ---------------- */
function later(t, fn) { G.timers.push({ t, fn }); }
function tickTimers(dt) {
  if (!G.timers.length) return;
  for (const tm of G.timers) tm.t -= dt;
  const due = G.timers.filter((tm) => tm.t <= 0);
  G.timers = G.timers.filter((tm) => tm.t > 0);
  for (const tm of due) tm.fn();
}
function spawn(p) { G.particles.push(Object.assign({ life: 1, vx: 0, vy: 0, g: 0, rot: 0, vr: 0, size: 4, mode: 'any' }, p, { max: p.life || 1 })); }
function updateParticles(dt) {
  for (const p of G.particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.rot += p.vr * dt; }
  if (G.particles.length) G.particles = G.particles.filter((p) => p.life > 0);
  for (const q of G.pops) q.t -= dt;
  if (G.pops.length) G.pops = G.pops.filter((q) => q.t > 0);
}
function say(e, txt, dur) { e.bubble = { text: txt, t: dur || 2 }; }
function pop(x, y, txt, good) { G.pops.push({ x, y, txt, good, t: 0.9 }); }

/* ---------------- sheep ---------------- */
function pickWander(s) {
  const free = G.realT > 0.5 && G.ch !== 2;
  for (let k = 0; k < 8; k++) {
    const a = Math.random() * TAU, r = Math.random() * s.wander;
    const x = s.hx + Math.cos(a) * r, y = s.hy + Math.sin(a) * r * 0.7;
    const RB = REGIONS[s.home || 'ranch'];
    const ok = s.home && s.home !== 'ranch' ? x > RB.ix0 + 20 && x < RB.ix1 - 20 && y > RB.iy0 + 20 && y < RB.iy1 - 20
      : free ? x > 40 && x < MW - 40 && y > 170 && y < MH - 24 : x > FX0 + 22 && x < FX1 - 22 && y > FY0 + 22 && y < FY1 - 18;
    if (ok && !blockedAt(x, y, 16)) { s.tx = x; s.ty = y; return; }
  }
  s.tx = s.hx; s.ty = s.hy;
}
function startFollowing(s) { if (s.follow) return; s.follow = true; s.fi = G.followCount++; }
function updateSheep(s, dt) {
  if (s.wakeFx > 0) s.wakeFx = Math.max(0, s.wakeFx - dt);
  if (s.hopT > 0) s.hopT = Math.max(0, s.hopT - dt * 3.2);
  if (s.bubble) { s.bubble.t -= dt; if (s.bubble.t <= 0) s.bubble = null; }
  if (s.sulk > 0) s.sulk = Math.max(0, s.sulk - dt);
  const p = G.player;
  let tx = null, ty = null, speed = 0;
  if (s.run) {
    tx = s.run.x; ty = s.run.y; speed = s.run.speed || 215;
    if (dist(s.x, s.y, tx, ty) < 6) { const then = s.run.then; s.hx = tx; s.hy = ty; s.run = null; s.follow = false; s.wander = 80; s.idle = rand(0.5, 2); s.tx = s.x; s.ty = s.y; tx = null; if (then) then(s); }
  } else if (s.lure) {
    const L = lureTarget(s, dt);
    if (L) { tx = L.tx; ty = L.ty; speed = L.speed; }
  } else if (s.follow && regionOf(s.x, s.y) === regionOf(p.x, p.y)) {
    const ang = s.fi * 2.39996 + 1.2, rad = 46 + 15 * Math.sqrt(s.fi + 1);
    tx = p.x + Math.cos(ang) * rad; ty = p.y + Math.sin(ang) * rad * 0.72;
    if (s.id === 'gerald' && s.x > PEN.x0 && s.x < PEN.x1 && s.y > PEN.y0 - 2 && s.y < PEN.y1) { tx = (PEN.g0 + PEN.g1) / 2; ty = PEN.y0 - 24; }
    const d = dist(s.x, s.y, tx, ty);
    speed = d > 22 ? Math.min(G.phase === 'bigbaa' ? 70 : 200, 40 + d * 2) : 0;
  } else if (s.panic > 0) {
    s.panic -= dt; const a = Math.atan2(s.y - p.y, s.x - p.x); tx = s.x + Math.cos(a) * 60; ty = s.y + Math.sin(a) * 60; speed = 150;
  } else if (s.idle > 0) {
    s.idle -= dt; s.grazing = s.grazeIdle;
  } else {
    s.stuck += dt;
    if (dist(s.x, s.y, s.tx, s.ty) < 4 || s.stuck > 4) { s.stuck = 0; s.idle = rand(1.8, 5); s.grazeIdle = Math.random() < 0.65; pickWander(s); }
    else { tx = s.tx; ty = s.ty; speed = s.kind === 'lamb' ? 48 : 34; }
  }
  if (tx !== null && speed > 0) {
    const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    if (d > 1) {
      const v = Math.min(d, speed * dt); s.x += (dx / d) * v; s.y += (dy / d) * v;
      s.walk = Math.min(1, speed / 60); s.phase += dt * (8 + speed * 0.03); s.grazing = false;
      if (Math.abs(dx) > 1.5) s.facing = dx > 0 ? 1 : -1;
    } else s.walk = 0;
  } else s.walk = 0;
  if (!s.run && !s.lure) collideCircle(s, 12); // a lured sheep walks a path that was checked when the lick dropped
}
function separate() {
  const all = G.sheep, p = G.player;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const a = all[i], b = all[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
    if (d2 < 576 && d2 > 0.01) { const d = Math.sqrt(d2), push = (24 - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; }
  }
  for (const s of all) {
    const dx = s.x - p.x, dy = s.y - p.y, d2 = dx * dx + dy * dy;
    if (d2 < 676 && d2 > 0.01) { const d = Math.sqrt(d2); s.x += (dx / d) * (26 - d); s.y += (dy / d) * (26 - d); if (!s.run) collideCircle(s, 12); }
  }
  for (const w of G.wolves) {
    if (!w.active || w.ally || w.limp || w.type === 'crow' || G.phase === 'stampede') continue;
    const min = w.type === 'twohead' ? 30 : w.type === 'tower' ? 34 : 22, dx = p.x - w.x, dy = p.y - w.y, d2 = dx * dx + dy * dy;
    if (d2 < min * min && d2 > 0.01) { const d = Math.sqrt(d2); p.x += (dx / d) * (min - d); p.y += (dy / d) * (min - d); collideCircle(p, 13); }
  }
}

/* ---------------- player ---------------- */
function updatePlayer(dt) {
  const p = G.player;
  p.caughtFx = Math.max(0, p.caughtFx - dt);
  if (p.hopT > 0) p.hopT = Math.max(0, p.hopT - dt * 3.2);
  if (p.bubble) { p.bubble.t -= dt; if (p.bubble.t <= 0) p.bubble = null; }
  const canMove = G.phase === 'meadow' || G.phase === 'glasses' || G.phase === 'fleecing' || G.phase === 'herd';
  let ix = 0, iy = 0;
  if (canMove) {
    if (keys.has('arrowleft') || keys.has('a')) ix -= 1;
    if (keys.has('arrowright') || keys.has('d')) ix += 1;
    if (keys.has('arrowup') || keys.has('w')) iy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) iy += 1;
    ix += touchState.jx; iy += touchState.jy;
    const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
  }
  p.grazing = canMove && G.phase !== 'herd' && (keys.has('shift') || touchState.graze);
  if (p.grazing) { ix = 0; iy = 0; }
  let speed = 175;
  if (G.phase === 'stampede' && G.ch !== 2 && G.st > 1.4) {
    const dx = GATEX - p.x, dy = 1190 - p.y, d = Math.hypot(dx, dy);
    if (d > 6) { ix = dx / d; iy = dy / d; speed = 205; }
  }
  const k = 1 - Math.exp(-dt * 12);
  p.vx = lerp(p.vx, ix * speed, k); p.vy = lerp(p.vy, iy * speed, k);
  p.x += p.vx * dt; p.y += p.vy * dt;
  collideCircle(p, 13);
  const sp = Math.hypot(p.vx, p.vy);
  p.walk = sp > 10 ? Math.min(1, sp / 120) : 0;
  if (sp > 10) p.phase += dt * (8 + sp * 0.035);
  if (Math.abs(p.vx) > 14) p.facing = p.vx > 0 ? 1 : -1;
}

/* ---------------- wolves ---------------- */
function updateWolves(dt) {
  const spd = 1 + 0.2 * G.heat, p = G.player;
  if (G.noise) { G.noise.t -= dt; if (G.noise.t <= 0) G.noise = null; }
  for (const w of G.wolves) {
    if (!w.active) continue;
    if (w.bubble) { w.bubble.t -= dt; if (w.bubble.t <= 0) w.bubble = null; }
    if (w.sulk > 0) w.sulk = Math.max(0, w.sulk - dt);
    w.hatBounce = Math.max(0, w.hatBounce - dt * 3);
    if (w.limp) { w.walk = 0; continue; }
    if (G.phase === 'herd' || G.phase === 'bigbaa') { herdWolf(w, dt); continue; }
    if (G.phase === 'stampede') continue;
    if (w.ally) { allyMove(w, dt); continue; }
    if (w.waving) { w.walk = 0; w.facing = -1; continue; }
    if (w.distracted > 0) {
      w.distracted -= dt; w.walk = 0;
      const b = w.distractBy; if (b) turnToward(w, Math.atan2(b.y - w.y, b.x - w.x), 4 * dt);
      if (w.type !== 'twohead' && w.type !== 'tower') setFacing(w);
      continue;
    }
    if (G.phase === 'fleecing' && w.alert > 0.35 && (w.sense || 'cone') !== 'sniff') {
      const a = Math.atan2(p.y - w.y, p.x - w.x);
      if (w.type === 'twohead') { const d1 = Math.abs(angDiff(w.dir, a)), d2 = Math.abs(angDiff(w.dir + Math.PI, a)); turnToward(w, d1 <= d2 ? a : a - Math.PI, 3 * dt); }
      else turnToward(w, a, (w.type === 'tower' ? 1.2 : 3.2) * dt);
      w.walk = 0; if (w.type !== 'twohead' && w.type !== 'tower') setFacing(w); continue;
    }
    if (w.id === 'pastor' && G.church.mode !== 'sermon') { turnToward(w, Math.PI / 2, 2.5 * dt); w.walk = 0; continue; }
    if (w.behavior === 'agent') { updateAgent(w, dt, spd); continue; }
    if (w.behavior === 'roam') updateRoam(w, dt, spd);
    else if (w.behavior === 'patrol') {
      if (w.pause > 0) { w.pause -= dt; w.walk = 0; turnToward(w, w.lookBase + Math.sin((1.4 - w.pause) * 2.2) * 0.9, 2.5 * dt); }
      else {
        const t = w.path[w.wp], dx = t[0] - w.x, dy = t[1] - w.y, d = Math.hypot(dx, dy);
        if (d < 3) { w.wp = (w.wp + 1) % w.path.length; w.pause = 1.4; w.lookBase = w.dir; }
        else { const v = Math.min(d, w.speed * spd * dt); w.x += (dx / d) * v; w.y += (dy / d) * v; turnToward(w, Math.atan2(dy, dx), 4 * dt); w.walk = 1; w.phase += dt * 9; }
      }
    } else if (w.behavior === 'sweep') { turnToward(w, w.base + Math.sin(G.time * w.freq * spd) * w.amp, 2.5 * dt); w.walk = 0; }
    else if (w.behavior === 'spin') { w.dir += w.spin * spd * dt; w.walk = 0; }
    else if (w.behavior === 'sit') { w.walk = 0; }
    if (w.type !== 'twohead' && w.type !== 'tower') setFacing(w);
  }
}
function makeNoise(x, y) { G.noiseId = (G.noiseId || 0) + 1; G.noise = { x, y, t: 5, id: G.noiseId }; }
function moveToward(w, tx, ty, speed, dt) {
  const dx = tx - w.x, dy = ty - w.y, d = Math.hypot(dx, dy);
  if (d < 1) { w.walk = 0; return; }
  const v = Math.min(d, speed * dt); w.x += (dx / d) * v; w.y += (dy / d) * v;
  w.dir = Math.atan2(dy, dx); w.facing = dx >= 0 ? 1 : -1; w.walk = 1; w.phase += dt * 12;
  collideCircle(w, 12);
}
function pickRoamGoal() {
  const p = G.player;
  for (let k = 0; k < 12; k++) {
    let x, y;
    if (G.phase === 'fleecing' && regionOf(p.x, p.y) === 'ranch' && Math.random() < 0.25 + 0.1 * G.heat) { x = p.x + rand(-230, 230); y = p.y + rand(-170, 170); }
    else { x = rand(FX0 + 50, FX1 - 50); y = rand(FY0 + 60, FY1 - 40); }
    if (x > FX0 + 30 && x < FX1 - 30 && y > FY0 + 30 && y < FY1 - 30 && !blockedAt(x, y, 24)) return { x, y };
  }
  return { x: 700, y: 760 };
}
function updateRoam(w, dt, spd) {
  const n = G.noise;
  if (n && n.t > 0 && w.heard !== n.id && regionOf(n.x, n.y) === 'ranch' && dist(w.x, w.y, n.x, n.y) < 700) {
    w.heard = n.id; w.goal = { x: n.x, y: n.y, inv: true }; w.pause = 0; w.stuck = 0;
    if (G.phase === 'fleecing') say(w, pick(['Hm? *sniff sniff*', 'Who said that?', 'Sounds like trouble!']), 1.4);
  }
  if (w.pause > 0) { w.pause -= dt; w.walk = 0; turnToward(w, w.lookBase + Math.sin((2.4 - w.pause) * 2.6) * 1.1, 3 * dt); return; }
  if (!w.goal) { w.goal = pickRoamGoal(); w.stuck = 0; }
  const dx = w.goal.x - w.x, dy = w.goal.y - w.y, d = Math.hypot(dx, dy);
  w.stuck += dt;
  if (d < 8 || w.stuck > 6) { w.pause = w.goal.inv ? 2.4 : rand(0.6, 1.6); w.lookBase = w.dir; w.goal = null; return; }
  const v = Math.min(d, (w.goal.inv ? 112 : w.speed) * spd * dt);
  w.x += (dx / d) * v; w.y += (dy / d) * v; turnToward(w, Math.atan2(dy, dx), 5 * dt); w.walk = 1; w.phase += dt * 11;
  collideCircle(w, 12);
}
function allyMove(w, dt) {
  w.cd = Math.max(0, w.cd - dt);
  if (w.dash && w.dash.t > 0) { w.dash.t -= dt; moveToward(w, w.dash.x, w.dash.y, 240, dt); return; }
  const p = G.player;
  if (regionOf(p.x, p.y) !== 'ranch') { w.walk = 0; w.sitting = true; return; }
  w.sitting = false;
  const tx = p.x - (p.facing || 1) * 64, ty = p.y + 26, d = dist(w.x, w.y, tx, ty);
  if (d > 30) moveToward(w, tx, ty, Math.min(230, 60 + d * 2), dt); else w.walk = 0;
}
function herdWolf(w, dt) {
  if (w.type === 'dog') { w.sitting = true; w.walk = 0; return; }
  if (!w.route) { w.route = GATE_ROUTES[w.id]; w.ri = 0; }
  if (!w.route) return;
  if (w.ri < w.route.length) {
    const t = w.route[w.ri], dx = t[0] - w.x, dy = t[1] - w.y, d = Math.hypot(dx, dy);
    if (d < 4) { w.ri++; return; }
    const v = Math.min(d, 100 * dt); w.x += (dx / d) * v; w.y += (dy / d) * v; w.walk = 1; w.phase += dt * 10;
    w.dir = Math.atan2(dy, dx); if (w.type !== 'twohead') setFacing(w);
    collideCircle(w, 12);
    return;
  }
  w.walk = 0; w.dir = -Math.PI / 2; if (w.type !== 'twohead') w.facing = w.x < GATEX ? 1 : -1;
  w.talkT -= dt;
  if (w.talkT <= 0) { w.talkT = rand(3.2, 5.5); say(w, pick(HERD_LINES), 2.2); }
}

/* ---------------- being seen ---------------- */
function detect(dt) {
  const p = G.player, moving = p.walk > 0.15 && !p.grazing, glassesOut = p.specsOn && !p.grazing;
  let maxA = 0; G.seenBy = null; G.hiddenFrom = false; G.prayHidden = false; G.camHidden = false;
  for (const w of G.wolves) {
    if (!w.active) continue;
    w.sheepCd = Math.max(0, w.sheepCd - dt);
    if (w.ally) { w.alert = 0; w.sees = false; continue; }
    if (w.limp) { w.alert = 0; w.sees = false; continue; }
    if (w.rest > 0) { w.rest -= dt; w.alert = 0; w.sees = false; continue; }
    if (w.distracted > 0) { w.alert = Math.max(0, w.alert - dt); w.sees = false; continue; }
    const sense = w.id === 'pastor' && G.church.mode === 'pray' ? 'pray' : w.sense || 'cone';
    // studio cameras only see while ON AIR
    if (sense === 'camera' && !studioLive()) { w.alert = Math.max(0, w.alert - dt); w.sees = false; maxA = Math.max(maxA, w.alert); continue; }
    let d;
    if (sense === 'sniff') { const dd = dist(w.x, w.y, p.x, p.y); d = dd <= w.range ? dd : -1; }
    else if (sense === 'pray') d = prayView(w, p);
    else d = inCone(w, p.x, p.y);
    w.sees = d >= 0;
    const exposed = G.invuln <= 0 && (sense === 'beam' ? true : sense === 'sniff' || sense === 'camera' ? moving : sense === 'pray' ? !p.grazing : glassesOut);
    if (w.sees && exposed) {
      const base = sense === 'pray' ? 1.2 : sense === 'beam' ? 1.3 : sense === 'sniff' ? 1.35 : sense === 'camera' ? 1.4 : 0.55 + 1.2 * (1 - d / w.range);
      const before = w.alert;
      w.alert = Math.min(1, w.alert + base * (1 + 0.15 * G.heat) * dt);
      if (before < 0.15 && w.alert >= 0.15) Snd.play(sense === 'sniff' ? 'sniff' : 'alertQ');
      if (before < 0.7 && w.alert >= 0.7) { Snd.play('alertX'); makeNoise(p.x, p.y); }
      if (w.id === 'biscuit' && before < 0.5 && w.alert >= 0.5) biscuitBark(w);
      G.seenBy = w;
      if (w.alert >= 1) { if (w.type === 'crow') { crowReport(w); continue; } if (w.type === 'pig') { retire(w); return; } caught(w); return; }
    } else {
      w.alert = Math.max(0, w.alert - 0.42 * dt);
      if (w.sees && sense === 'cone' && p.specsOn && p.grazing) {
        G.hiddenFrom = true;
        if (w.sheepCd <= 0) { w.sheepCd = 2.5; G.sheepish++; if (G.sheepish >= 10) unlock('sheepish'); }
      }
      if (w.sees && sense === 'sniff' && p.grazing) G.hiddenFrom = true;
      if (w.sees && sense === 'camera') { G.hiddenFrom = true; G.camHidden = true; }
      if (w.sees && sense === 'pray' && p.grazing) {
        G.hiddenFrom = true; G.prayHidden = true;
        if (w.sheepCd <= 0) { w.sheepCd = 2.5; G.sheepish++; if (G.sheepish >= 10) unlock('sheepish'); }
      }
    }
    maxA = Math.max(maxA, w.alert);
  }
  G.maxAlert = maxA;
  allyGuard();
}
function biscuitBark(w) {
  say(w, 'WOOF! WOOF! Shepherds!', 1.6); Snd.play('woof');
  const p = G.player;
  for (const o of G.wolves) {
    if (o === w || !o.active || o.ally || (o.sense || 'cone') !== 'cone' || dist(o.x, o.y, p.x, p.y) > 380) continue;
    o.alert = Math.min(0.9, o.alert + 0.38); o.dir = Math.atan2(p.y - o.y, p.x - o.x);
  }
}
function allyGuard() {
  const b = G.wolves.find((w) => w.id === 'biscuit');
  if (!b || !b.ally || b.cd > 0 || G.phase !== 'fleecing' || regionOf(G.player.x, G.player.y) !== 'ranch') return;
  let target = null;
  for (const w of G.wolves) if (w !== b && w.active && !w.ally && (w.sense || 'cone') === 'cone' && w.alert >= 0.45 && (!target || w.alert > target.alert)) target = w;
  if (!target) return;
  target.alert = 0; target.distracted = 3.2; target.distractBy = b;
  b.cd = 9; b.dash = { x: target.x + rand(-30, 30), y: target.y + 44, t: 1.4 };
  say(b, 'WOOF! Look, a squirrel!', 1.6); say(target, pick(['A squirrel?!', 'Where?', 'Huh?']), 1.4); Snd.play('woof');
}
function fenceSparks(dt) {
  G.sparkT -= dt;
  if (G.sparkT > 0) return;
  G.sparkT = 0.16;
  const vis = FENCE.filter((s) => s.bx1 >= VB.x0 && s.bx0 <= VB.x1 && s.by1 >= VB.y0 && s.by0 <= VB.y1);
  if (!vis.length) return;
  const s = pick(vis), along = Math.random() * s.len;
  const x = s.v ? s.x : s.x + along, y = (s.v ? s.y + along : s.y) - (Math.random() < 0.5 ? 25 : 15);
  for (let i = 0; i < 3; i++) spawn({ type: 'spark', mode: 'truth', x, y, vx: rand(-70, 70), vy: rand(-90, -10), g: 240, life: 0.32 });
}

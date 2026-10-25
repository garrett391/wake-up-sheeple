/* ---------------- the wolves fight back: Granny's Bonus Sugar Licks (Chapter 1) ---------------- */
// After your 1st and 3rd wake-up, Granny leaves a sugar lick near one of your awake friends.
// They shuffle over to it. Kick it over first, or they eat it and fall back asleep (Woke -1)
// until you talk to them again.
const LICK = { delay: 3.5, gap: 22, wait: 2.5, speed: 15, near: 44, dist: [170, 220] };
Object.assign(PAL_SRC, {
  lick: ['#FF8CC6', '#B9B3A6', '#D9CDB5'], lickSh: ['#EE5FA4', '#99938A', '#BCAF96'], lickHi: ['#FFE3F1', '#D6D1C6', '#EEE5D3'],
});
for (const k of ['lick', 'lickSh', 'lickHi']) PAL[k] = PAL_SRC[k].map(hex);

const SUGAR_LINES = {
  barbara: {
    crash: 'Mmm, sugar... What were we talking about, hon? Something negative?',
    remind: 'Sugar beet. SAWDUST. Right! One lick and I forgot the whole label. That stuff is a fence with frosting, hon.',
  },
  doug: {
    crash: 'Mmm... Rom forever! Or Rem. Whichever one hands out the licks.',
    remind: 'Two heads, one stomach. One lick and I was ready to vote again. Never again!',
  },
  nana: {
    crash: 'Oh, how lovely. Free treats. I should pack my swimsuit for Sunny Acres, dear.',
    remind: '312 in and not one out. One lick and I was packing for the pool. Thank you, dear.',
  },
  shirley: {
    crash: 'Mmm. Sugar always helps the itch. Is the doctor in?',
    remind: "'Cure: not stocked.' One lick and I wanted a lollipop. I'm itching for a revolution again.",
  },
};
const LURE_SAY = ['Is that... a sugar lick?', 'Just one lick...', 'So... sweet...', 'Granny made it with love!', 'Free! FREE!'];
const LURE_TALK = ["Can't talk. Sugar.", "Shh. There's a sugar lick right there. It's FREE.", "Just one lick. Then we'll talk. Promise."];
const KICK_SAY = ['Hey! ...Wait. What was I doing?', 'Huh? Right. No more sugar.', 'That was close. So sweet. So close.'];
{
  // keep the Chapter 1 finish last among the Chapter 1 achievements
  const all = Object.entries(ACH);
  for (const [k] of all) delete ACH[k];
  for (const [k, v] of all) { if (k === 'pastures') ACH.sugarfree = ['Sugar-Free', "Kick over both of Granny's sugar licks in one run"]; ACH[k] = v; }
}

const subjPron = (s) => (LINES[s.id] && LINES[s.id].pron === 'him' ? 'he' : 'she');
const objPron = (s) => (LINES[s.id] && LINES[s.id].pron) || 'them';
const lickable = (s) => s.state === 'woke' && s.kind === 'key' && s.home === 'ranch' && s.id !== 'ewenice' && !!SUGAR_LINES[s.id]
  && !s.follow && !s.run && !s.lure && regionOf(s.x, s.y) === 'ranch';

// called by wakeSheep: the 1st and 3rd wake-ups each earn one lick, once per run
function queueLick() {
  if (G.ch !== 1) return;
  for (const n of [1, 3]) {
    if (G.woke < n || G.flags['lickAt' + n]) continue;
    G.flags['lickAt' + n] = true; G.lickDue++; G.lickCd = Math.max(G.lickCd, LICK.delay);
  }
}
function lickPathClear(x0, y0, x1, y1) {
  const n = Math.ceil(dist(x0, y0, x1, y1) / 10);
  for (let i = 1; i <= n; i++) { const t = i / n; if (blockedAt(lerp(x0, x1, t), lerp(y0, y1, t), 13)) return false; }
  return true;
}
// true if a sign, building or tree drawn after the lick would cover it
function lickHidden(x, y) {
  for (const d of STATIC) {
    if (d.ch && d.ch !== G.ch) continue;
    if (d.y > y && d.x0 < x + 46 && d.x1 > x - 20 && d.y0 < y + 4 && d.y1 > y - 52) return true;
  }
  return false;
}
function lickSpot(s) {
  const p = G.player;
  for (let k = 0; k < 150; k++) {
    const a = Math.random() * TAU, r = rand(LICK.dist[0], LICK.dist[1]);
    const x = s.x + Math.cos(a) * r, y = s.y + Math.sin(a) * r * 0.75;
    if (x < FX0 + 50 || x > FX1 - 50 || y < FY0 + 60 || y > FY1 - 40) continue;
    if (blockedAt(x, y, 26) || dist(x, y, p.x, p.y) < (k < 90 ? 140 : 70) || lickHidden(x, y)) continue;
    const side = x > s.x ? 1 : -1;
    if (!lickPathClear(s.x, s.y, x - side * 20, y + 1)) continue;
    return { x, y, side };
  }
  return null;
}
function dropLick(onlyId) {
  const pool = G.sheep.filter((s) => (!onlyId || s.id === onlyId) && lickable(s));
  while (pool.length) {
    const s = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], spot = lickSpot(s);
    if (!spot) continue;
    const L = { x: spot.x, y: spot.y, side: spot.side, tx: spot.x - spot.side * 20, ty: spot.y + 1, t: 0, sheep: s, sayT: rand(3, 4) };
    L.d0 = Math.max(1, dist(s.x, s.y, L.tx, L.ty));
    G.lick = L; G.lickDue = Math.max(0, G.lickDue - 1); G.lickCd = LICK.gap;
    s.lure = { wait: LICK.wait }; s.idle = 0; s.grazing = false; s.facing = spot.side;
    say(s, 'Ooh! Is that a sugar lick?', 2.2);
    const gr = G.wolves.find((w) => w.id === 'granny');
    if (gr && gr.active) say2(gr, 'Free treats! Baked with love!', 'Stay sweet, dearie. Stay quiet.', 2.8);
    Snd.play('lickDrop');
    for (let i = 0; i < 10; i++) spawn({ type: 'star', x: L.x + rand(-14, 14), y: L.y - rand(6, 26), vx: rand(-40, 40), vy: rand(-90, -30), life: rand(0.5, 0.9), size: rand(3, 5) });
    banner('Bonus Sugar Licks!', 'Granny left a treat for ' + s.name + '. Kick it over before ' + subjPron(s) + ' gets there.', 3);
    updateFleeceObjective();
    return true;
  }
  return false;
}
function updateLick(dt) {
  if (G.ch !== 1 || G.phase !== 'fleecing') return;
  const L = G.lick;
  if (!L) {
    if (!G.lickDue) return;
    if (regionOf(G.player.x, G.player.y) !== 'ranch' || G.cut || G.fade) { G.lickCd = Math.max(G.lickCd, 2); return; }
    G.lickCd = Math.max(0, G.lickCd - dt);
    if (G.lickCd <= 0 && !dropLick()) G.lickCd = 1;
    return;
  }
  L.t += dt;
  const s = L.sheep;
  if (!s || s.state !== 'woke' || s.follow || s.lure == null) { clearLick(); return; }
  L.sayT -= dt;
  if (L.sayT <= 0 && !s.bubble) { say(s, pick(LURE_SAY), 1.8); L.sayT = rand(3.5, 5); }
  if (s.lure.wait <= 0 && dist(s.x, s.y, L.tx, L.ty) < 5) sugarCrash();
}
// the sheep's half of the lure, called from updateSheep: returns the point to walk to, or null to stand still
function lureTarget(s, dt) {
  const L = G.lick;
  if (!L || L.sheep !== s) { s.lure = null; return null; }
  if (s.lure.wait > 0) { s.lure.wait -= dt; s.grazing = false; s.walk = 0; s.facing = L.side; return null; }
  return L;
}
function lickProgress() {
  const L = G.lick, s = L && L.sheep;
  return s ? clamp(1 - dist(s.x, s.y, L.tx, L.ty) / L.d0, 0, 1) : 0;
}
function sugarCrash() {
  const L = G.lick, s = L.sheep;
  G.lick = null; s.lure = null;
  s.state = 'asleep'; s.relapsed = true; s.grazing = true; s.grazeIdle = true; s.idle = 3; s.tx = s.x; s.ty = s.y; s.stuck = 0;
  G.woke = Math.max(0, G.woke - 1); G.playerDark = Math.min(0.72, G.woke * 0.24);
  syncHUD(); Snd.play('crunch'); addShake(5);
  for (let i = 0; i < 12; i++) spawn({ type: 'crumb', c: i % 2, x: L.x, y: L.y - 10, vx: rand(-90, 90), vy: rand(-150, -50), g: 420, life: rand(0.5, 0.9), size: rand(2, 3.5) });
  say(s, 'Mmm... *crunch*', 2.2);
  const o = objPron(s);
  toast('Woke -1', s.name + ' ate the sugar lick and fell back asleep. Talk to ' + o + ' to wake ' + o + ' back up.');
  G.hint = 'Hint: ' + s.name + ' ate a sugar lick. Remind ' + o + ' what ' + subjPron(s) + ' saw.';
  updateFleeceObjective();
}
function kickLick() {
  const L = G.lick;
  if (!L) return;
  const s = L.sheep, p = G.player;
  G.lick = null;
  if (s) { s.lure = null; s.idle = rand(1.5, 2.5); s.tx = s.x; s.ty = s.y; s.stuck = 0; }
  G.licksKicked++;
  Snd.play('lickKick'); addShake(4); p.hopT = 1; p.facing = L.x >= p.x ? 1 : -1;
  for (let i = 0; i < 16; i++) spawn({ type: 'crumb', c: i % 2, x: L.x, y: L.y - 10, vx: rand(-170, 170), vy: rand(-240, -80), g: 520, life: rand(0.6, 1), size: rand(2, 4) });
  pop(L.x, L.y - 40, 'Kicked!', true);
  if (s) later(0.4, () => { if (!s.bubble) say(s, pick(KICK_SAY), 2.4); });
  toast('Sugar lick kicked over', s ? s.name + ' is still awake.' : '');
  if (G.licksKicked >= 2) unlock('sugarfree');
  updateFleeceObjective();
}
// silently take the lick away (the finale started, or the run ended)
function clearLick() {
  const L = G.lick;
  if (L && L.sheep) L.sheep.lure = null;
  G.lick = null;
  updateFleeceObjective();
}
function lickInteract() {
  const L = G.lick, p = G.player;
  if (!L || G.phase !== 'fleecing' || dist(p.x, p.y, L.x, L.y) > LICK.near) return null;
  return { kind: 'lick', x: L.x, y: L.y - 46, label: 'Kick over the sugar lick' };
}
function lickObjective() {
  const L = G.lick;
  if (!L || !L.sheep) return false;
  setObjective('Kick over the sugar lick before ' + L.sheep.name + ' gets to it.',
    (touchMode ? 'Follow the pink arrow and tap Kick next to it.' : 'Follow the pink arrow and press E next to it.') + ' You can see it with the glasses off, too.');
  return true;
}

/* drawing */
function drawLick() {
  const L = G.lick;
  if (!L) return;
  const tr = isTruthPass(), k = Math.min(1, L.t / 0.35), t = G.clock;
  const sc = RM ? 1 : k < 1 ? easeOut(k) * (1 + 0.22 * Math.sin(k * Math.PI)) : 1;
  ctx.save(); ctx.translate(L.x, L.y);
  // how close the sheep is: a ring on the ground that closes as they shuffle over
  ctx.lineWidth = 2; ctx.strokeStyle = tr ? 'rgba(40,40,40,0.25)' : 'rgba(255,95,162,0.25)';
  ell(0, 1, 30, 10); ctx.stroke();
  const prog = lickProgress();
  if (prog > 0.01) {
    ctx.lineWidth = 3.5; ctx.strokeStyle = tr ? 'rgba(200,55,45,0.9)' : 'rgba(255,61,139,0.95)';
    ctx.beginPath(); ctx.ellipse(0, 1, 30, 10, 0, -Math.PI / 2, -Math.PI / 2 + TAU * prog); ctx.stroke();
  }
  if (!tr) {
    const g = ctx.createRadialGradient(0, -12, 2, 0, -12, 34);
    g.addColorStop(0, 'rgba(255,170,215,0.55)'); g.addColorStop(1, 'rgba(255,170,215,0)');
    ctx.fillStyle = g; circ(0, -12, 34); ctx.fill();
  }
  ctx.scale(sc, sc);
  fillE('shadow', 0, 1, 17, 5);
  // the sign on a stick
  fillR('woodSh', 20, -34, 3, 34);
  fillR('wood', 4, -50, 40, 17, 3); fillR('board', 6, -48, 36, 13, 2);
  signText('FREE!', 'STAY QUIET', 24, -41, 9, 32);
  // the lick itself
  fillR('lickSh', -13, -17, 26, 17, 4);
  fillR('lick', -13, -21, 26, 15, 4);
  fillE('lickHi', 0, -20, 11, 3.2);
  if (tr) {
    text('SUGAR', 0, -11, 7, F_TRUTH, P('ink'), 22);
  } else {
    ctx.fillStyle = '#FFFFFF';
    circles([[-8, -15, 2.4], [-1, -13.5, 2.8], [6, -15.5, 2.2], [10, -14, 1.6]]); ctx.fill();
    const tw = RM ? 0.5 : (Math.sin(t * 5) + 1) / 2;
    sparkle(-10, -27, 3 + tw * 3, 'rgba(255,255,255,0.95)');
    sparkle(9, -30, 2 + (1 - tw) * 3, 'rgba(255,225,240,0.95)');
  }
  ctx.restore();
}

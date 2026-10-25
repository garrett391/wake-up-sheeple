/* ---------------- Sunday service ---------------- */
const SERMON = [
  'The wolves are OUT THERE, beyond the fence!',
  'Stay in the pasture. The pasture loves you.',
  'Questions are how the wolf gets in.',
  'Give, and it shall be given! To me. For safekeeping.',
  "Blessed are the meek, for they don't ask questions!",
  'Fat and happy is next to godly!',
  "Don't look at the fence. Look at the plate.",
];
const PLATE_LINES = ['Plate coming round!', 'Dig deep, folks!', 'Every tuft helps!', "Don't look up. Just give."];
// when Sister Ewenice walks out, the pews grumble but stay put: they are still asleep
const MURMURS = ['Sister Ewenice? Leaving DURING the sermon?', 'Scandalous!', "She'll be back. Nobody leaves.", 'Shh! He is still preaching.'];
// at the finale she rings the bell, and they finally come
const BELL_LINES = ['The bell!', 'Sister Ewenice was RIGHT!', 'Wait for us!', 'His ZIPPER!', 'Is that a TAIL?', 'Where does the plate GO?'];
let exitN = 0;
function newChurch() { return { mode: 'sermon', t: 0, len: 7, warn: 2.8, talkT: 1, line: 0, ewenice: false, walkout: false, bellT: 0, tuftT: 0, prayers: 0 }; }
function prayView(w, p) {
  return regionOf(p.x, p.y) === 'church' && !segBlocked(w.x, w.y - 36, p.x, p.y - 8) ? dist(w.x, w.y, p.x, p.y) : -1;
}
function updateChurch(dt) {
  const C = G.church, p = G.player;
  const pastor = G.wolves.find((w) => w.id === 'pastor'), usher = G.wolves.find((w) => w.id === 'usher');
  const praying = C.mode === 'pray';
  if (C.bellT > 0) C.bellT = Math.max(0, C.bellT - dt);
  for (const s of G.sheep) {
    if (s.home !== 'church' || s.run || s.follow || s.panic > 0) continue;
    if (s.walk < 0.15) s.facing = s.id === 'ewenice' ? -1 : s.x < NAVE.aisle ? 1 : -1;
    if (s.state === 'asleep' || (G.ch === 2 && s.home === 'church')) { s.grazing = praying; s.grazeIdle = praying; }
  }
  for (const s of G.sheep) if (s.leaving && s.y > 2200 && Math.abs(s.x - NAVE.aisle) < 70) exitChurch(s, true);
  const inside = regionOf(p.x, p.y) === 'church';
  const live = inside && !C.walkout && (G.phase === 'meadow' || G.phase === 'glasses' || G.phase === 'fleecing');
  if (!live) { if (C.mode !== 'sermon') { C.mode = 'sermon'; C.t = 0; } return; }
  const ew = G.sheep.find((s) => s.id === 'ewenice');
  if (ew && ew.state === 'asleep' && !praying && ew.hopT <= 0 && Math.random() < dt * 0.7) ew.hopT = 0.55;
  C.t += dt;
  if (C.mode === 'sermon') {
    C.talkT -= dt;
    if (C.talkT <= 0 && pastor) { C.talkT = rand(3.6, 4.8); say(pastor, SERMON[C.line++ % SERMON.length], 3); }
    if (C.t >= C.len) {
      C.mode = 'warn'; C.t = 0; C.warn = C.prayers ? 2 : 2.8;
      if (pastor) say(pastor, C.ewenice ? 'Let us pray... without music, apparently.' : 'Let us pray...', C.warn);
      if (!C.ewenice) Snd.play('organ');
      if (!C.prayers && G.phase === 'fleecing') banner('Every head bowed!', (touchMode ? 'Hold Bow' : 'Hold Shift') + ' to bow your head until the pastor says "Amen."', 3.2);
    }
  } else if (C.mode === 'warn') {
    if (C.t >= C.warn) { C.mode = 'pray'; C.t = 0; C.prayers++; if (pastor) say(pastor, 'Every head bowed. Every eye closed.', 3.4); }
  } else {
    C.tuftT -= dt;
    if (C.tuftT <= 0 && usher) {
      C.tuftT = 0.3;
      const s = pick(G.sheep.filter((q) => q.home === 'church' && (q.state === 'asleep' || G.ch === 2) && q.grazing && dist(q.x, q.y, usher.x, usher.y) < 520));
      if (s) spawn({ type: 'wool', mode: 'truth', x: s.x + rand(-8, 8), y: s.y - 30, vx: (usher.x + 6 - s.x) / 1.1, vy: (usher.y - 36 - s.y + 30) / 1.1, life: 1.1, size: rand(2.6, 4.2) });
    }
    if (usher && !usher.bubble && C.t > 0.8 && Math.random() < dt * 0.5) say(usher, pick(PLATE_LINES), 1.8);
    if (C.t >= 4.6) { C.mode = 'sermon'; C.t = 0; C.len = rand(9, 12); C.talkT = 1.6; if (pastor) say(pastor, 'Amen!', 1.4); Snd.play('amen'); }
  }
}
function enterChurch() {
  const C = G.church;
  C.mode = 'sermon'; C.t = 0; C.talkT = 0.8; C.len = G.flags.visitedChurch ? rand(8, 11) : 7;
  if (!G.flags.visitedChurch && G.ch === 2) {
    G.flags.visitedChurch = true;
    banner(G.view ? 'Chapel of the Board' : 'Mandatory Sunday Service', 'Bow your head when the pastor says to. Attendance is being taken.', 3.2);
  } else if (!G.flags.visitedChurch) {
    G.flags.visitedChurch = true;
    banner(G.view ? 'Chapel of the Hungry Shepherd' : 'Chapel of the Good Shepherd', G.view ? 'The pastor is wearing a sheep suit. Bow your head when he tells you to.' : 'Sunday service is on. Bow your head when the pastor says to.', 3.2);
  }
}
function churchObjective() {
  const C = G.church, bow = touchMode ? 'Hold Bow' : 'Hold Shift';
  if (C.walkout) setObjective('The pews are empty.', 'Head back out to the ranch.');
  else if (C.ewenice) setObjective('Sister Ewenice is waiting outside.', "The rest of the pews aren't ready yet. She'll ring the bell when your flock is.");
  else if (!G.proof.has('fleece')) setObjective("Search Pastor Fleecewell's study, next to the pulpit.", bow + ' to bow your head when he says "Every head bowed."');
  else setObjective('Show Sister Ewenice what you found.', 'She plays the organ. ' + bow + ' to bow during prayer.');
}

/* Sister Ewenice wakes up and walks out alone. The rest of the pews stay asleep. */
function eweniceLeaves() {
  const C = G.church;
  if (C.ewenice) return;
  C.ewenice = true;
  const ew = G.sheep.find((s) => s.id === 'ewenice'), pastor = G.wolves.find((w) => w.id === 'pastor');
  if (ew) { ew.hopT = 1; say(ew, "When your flock gathers, I'll ring the chapel bell. Wait and see.", 3.2); later(2.4, () => leaveChurch(ew)); }
  later(1.8, () => { if (pastor) say(pastor, 'Sister Ewenice! The service is not over!', 2.4); });
  if (G.phase === 'fleecing') {
    const pews = G.sheep.filter((s) => s.home === 'church' && s !== ew);
    pews.slice(0, MURMURS.length).forEach((s, i) => later(3 + i * 0.8, () => { if (s.state === 'asleep' && !C.walkout) say(s, MURMURS[i], 2.2); }));
    later(7, () => { if (pastor && !C.walkout) say(pastor, '...Fine. Who needs an organ?', 2.4); });
    later(3.4, () => { if (!C.walkout) toast('Sister Ewenice walked out', 'Just her. The rest of the pews stayed put, for now.'); updateFleeceObjective(); });
  }
}
/* the finale: if Sister Ewenice is awake, she rings the bell and the congregation joins the herd (they don't count) */
function ringChapelBell() {
  const C = G.church, ew = G.sheep.find((s) => s.id === 'ewenice');
  if (C.walkout || !ew || ew.state !== 'woke') return;
  const pews = G.sheep.filter((s) => s.home === 'church' && s !== ew && s.state === 'asleep');
  if (!pews.length) return;
  C.walkout = true; C.bellT = 5;
  Snd.play('bell'); later(0.9, () => Snd.play('bell')); later(1.8, () => Snd.play('bell'));
  const inside = regionOf(G.player.x, G.player.y) === 'church', pastor = G.wolves.find((w) => w.id === 'pastor');
  if (inside && pastor) later(1.4, () => say(pastor, 'Where is everyone going? The PLATE!', 2.4));
  pews.forEach((s, i) => later(1.1 + i * 0.4, () => {
    wakeSheep(s, false); s.hopT = 1; say(s, BELL_LINES[i % BELL_LINES.length], 1.8);
    if (regionOf(G.player.x, G.player.y) === 'church') leaveChurch(s); else exitChurch(s, false, true);
  }));
  later(1.6, () => toast('The chapel bell is ringing', "Sister Ewenice's congregation is coming out to join the flock."));
  later(1.4 + pews.length * 0.4, () => unlock('flock'));
}
function leaveChurch(s) {
  if (s.home !== 'church' || s.leaving) return;
  const lane = s.id === 'ewenice' ? 1866 : s.y;
  s.follow = false; s.grazing = false; s.panic = 0; s.leaving = true;
  s.run = { x: s.x, y: lane, speed: 118, then: () => {
    s.run = { x: NAVE.aisle + rand(-14, 14), y: lane, speed: 118, then: () => {
      s.run = { x: NAVE.aisle, y: 2262, speed: 118, then: () => exitChurch(s, true) };
    } };
  } };
}
// out through the chapel doors into the ranch; atDoor pops them out of the doorway for anyone watching outside
function exitChurch(s, puff, atDoor) {
  if (puff) for (let i = 0; i < 6; i++) spawn({ type: 'dust', x: NAVE.aisle + rand(-20, 20), y: 2262 + rand(-6, 6), vx: rand(-30, 30), vy: rand(-30, -5), life: 0.6, size: rand(4, 7) });
  const k = exitN++ % 8;
  if (s.id === 'ewenice') { s.x = 1088; s.y = 982; }
  else if (atDoor) { s.x = CHAPEL.door + rand(-12, 12); s.y = 956 + rand(-3, 3); }
  else { s.x = 988 + (k % 4) * 34 + rand(-5, 5); s.y = 980 + Math.floor(k / 4) * 32 + rand(-4, 4); }
  for (let i = 0; i < 5; i++) spawn({ type: 'dust', x: CHAPEL.door + rand(-18, 18), y: 950 + rand(-4, 4), vx: rand(-30, 30), vy: rand(-30, -5), life: 0.6, size: rand(4, 7) });
  s.run = null; s.leaving = false; s.home = 'ranch'; s.hx = s.x; s.hy = s.y; s.tx = s.x; s.ty = s.y; s.idle = rand(0.4, 1.4); s.grazing = false;
  s.wander = s.id === 'ewenice' ? 22 : 60;
  if (G.phase === 'herd' || G.phase === 'bigbaa') startFollowing(s);
}

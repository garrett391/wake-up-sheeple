/* ---------------- Chapter 3: story and systems ---------------- */
function ch3Unlocked() { const s = store.get(); return !!s.best2 || CH3_PARAM; }
const BELL3_LINE = "I read A Message From The Farmer every day at noon. Nobody slips me cue cards anymore. They come on tape.";

/* setting up a chapter 3 run */
function setupCh3() {
  const p = G.player;
  p.x = 640; p.y = 944; p.hasSpecs = true; p.specsOn = false; p.hat = false;
  G.glasses.taken = true; G.bfly.gone = true; G.realT = 1; G.playerDark = 0.72; G.view = 0;
  G.c3 = { chatT: 2, marchT: 1, revT: 0 };
  for (const s of G.sheep) {
    s.state = 'woke'; s.deep = false; s.protest = false; s.shown = new Set();
    const h = CH2_HOMES[s.id];
    if (h) { s.x = s.hx = s.tx = h[0]; s.y = s.hy = s.ty = h[1]; s.home = h[2]; s.wander = 22; }
  }
  for (const w of G.wolves) {
    w.rest = 0; w.flying = false; w.fleeing = false; w.speech = false;
    if (w.id === 'wolfgang') w.waving = false;
    if (w.id === 'biscuit') { w.ally = true; w.active = true; }
    else if (!CH3_TYPES.has(w.type) && w.type !== 'pig') w.limp = true; // the wolves nap where their strings dropped them
  }
  G.church.ewenice = true; G.church.walkout = true;
}
function startChapter3() {
  newGame({ ch: CH3 });
  startPlay();
  later(0.5, openCh3Intro);
}
function openCh3Intro() {
  const nm = 'Chapter 3: The Farmer';
  openDialog({ who: 'system', name: nm, text: 'One week after the pigs ran. The wolves are napping where their strings dropped them. The pigs moved up the hill, to the Big House, to work for the Farmer.', choices: [{ label: 'Continue', run: () => ({
    who: 'system', name: nm, text: "Nobody has ever seen the Farmer. But every day at noon there's A Message From The Farmer, and every sign on the farm has his name on it. Everybody loves him. Everybody except you.", choices: [{ label: 'Something is off' }],
  }) }] });
}

/* the reveal: everything is his, and his house is up the hill */
function openRevealDialog3() {
  openDialog({ who: 'system', name: 'Through the glasses', text: 'Shepherd Wolfgang is still napping where his strings dropped him. But there is a new tag on his collar. On every sign, every trough, every fence post, the same tag: PROPERTY OF THE FARMER.', choices: [{ label: 'Look up the hill', run: () => {
    G.fade = { t: 0, dur: 0.9, fired: false, mid: () => { G.camTarget = { x: BIGH.door, y: 3330 }; updateCamera(0, true); if (G.cut) { G.cut.stage = 'pan2'; G.cut.t = 0; } } };
    return null;
  } }] });
}
function openRevealDialog3b() {
  const freeze = touchMode ? 'hold Graze' : 'hold Shift';
  openDialog({ who: 'system', name: 'Through the glasses', text: 'Up the hill stands the Big House. Every light on. Every curtain shut. The pigs went in there, and nobody has seen them come out.', choices: [{ label: 'Continue', run: () => ({
    who: 'system', name: 'Seeing is believing', text: "Your friends love the Farmer. They won't take your word for it this time: they have to see it with their own eyes. Take them up the hill to the windows: the main gate stands open now, and the hill road starts right outside it. Up there, hounds sniff out anything that moves (" + freeze + ' to freeze), scarecrows notice glasses, and a searchlight never stops turning.',
    choices: [{ label: 'Got it', run: () => {
      G.fade = { t: 0, dur: 0.9, fired: false, mid: () => { G.camTarget = null; updateCamera(0, true); if (G.cut) { G.cut.stage = 'back'; G.cut.t = 0; } } };
      return null;
    } }],
  }) }] });
}

/* objectives */
const tagger = () => G.sheep.find((s) => s.follow && LINES3[s.id] && !s.deep);
function ch3Objective() {
  const reg = regionOf(G.player.x, G.player.y), key = touchMode ? 'Graze' : 'Shift';
  if (G.flags.march) {
    if (reg === 'house') setObjective(G.flags.metFarmer ? 'Talk to the Farmer.' : 'Find the Farmer. His study is at the back.', 'The hounds notice anything that moves. Hold ' + key + ' to freeze.');
    else if (reg === 'hill') setObjective('The whole flock is at the door.', 'The Big House is open. Go in and meet the Farmer.');
    else setObjective('The whole flock went up the hill.', 'Go out through the main gate. The hill road starts right outside it.');
    return;
  }
  const tag = tagger();
  if (tag) {
    const wd = WINDOWS3.find((q) => q.id === LINES3[tag.id].win), pron = LINES3[tag.id].pron;
    if (reg === 'hill') setObjective('Show ' + tag.name + ' ' + wd.name + '.', 'Stand at the window with ' + pron + ' right behind you.');
    else if (reg === 'ranch') setObjective('Take ' + tag.name + ' up the hill.', 'Go out through the main gate, in the south fence. The hill road starts right outside it.');
    else setObjective(tag.name + ' is following you.', 'Take ' + pron + ' up the hill, to ' + wd.name + '.');
    return;
  }
  if (reg === 'hill') {
    setObjective(G.proof.size >= WINDOWS3.length ? "You've seen through every window." : 'Look through the windows of the Big House.', 'Glasses on to see past the curtains. Scarecrows notice glasses. Hounds notice movement. Nobody hides from the light.');
    return;
  }
  if (reg === 'church') { setObjective('The pastor is napping mid-sermon.', 'Nobody in here needs waking today.'); return; }
  const need = Math.max(0, WOKE_GOAL - G.woke);
  setObjective('Bring ' + need + ' more ' + (need === 1 ? 'friend' : 'friends') + ' up the hill to see for themselves.', G.hint || (G.flags.visitedHill ? 'Ask your friends about the Farmer. Nobody has ever seen him.' : 'Ask your friends about the Farmer. The hill road starts outside the main gate, which stands open now.'));
}

/* talking, chapter 3 */
function ch3TalkNode(s) {
  if (LINES3[s.id]) return ch3Node(s);
  if (s.kind === 'kevin') return kevin3Node(s);
  if (s.kind === 'lamb') return { who: s, text: LAMB3_LINE };
  if (s.kind === 'gerald') return { who: s, text: pick(GERALD3_LINES) };
  if (s.id === 'bellwether') return { who: s, text: BELL3_LINE };
  if (G.player.specsOn && Math.random() < 0.5) return { who: s, text: pick(FLOCK3_SPECS), choices: [{ label: 'Baa' }] };
  return { who: s, text: FLOCK3_LINES[(s.def.line !== undefined ? s.def.line : idHash(s.id)) % FLOCK3_LINES.length], choices: [{ label: 'Baa' }] };
}
function ch3Node(s, txt) {
  const L = LINES3[s.id], wd = WINDOWS3.find((q) => q.id === L.win);
  if (s.deep) return { who: s, text: L.done };
  const ch = [];
  ch.push({ label: 'Ask a question', run: () => ({ who: 'player', name: 'You', text: L.ask, choices: [{ label: 'Listen', run: () => {
    G.hint = L.hint; G.hintFor = s.id; updateFleeceObjective();
    return { who: s, text: L.reply, choices: [{ label: 'Go on', run: () => ch3Node(s, L.prompt) }] };
  } }] }) });
  if (G.proof.has(L.win)) ch.push({ label: 'Tell ' + L.pron + ' what you saw', tag: 'Through ' + wd.name, run: () => {
    G.hint = L.hint; G.hintFor = s.id; updateFleeceObjective();
    return { who: s, text: L.told, choices: [{ label: 'Go on', run: () => ch3Node(s, L.prompt) }] };
  } });
  if (s.follow) ch.push({ label: 'Wait here', tag: 'Stops following you', run: () => { G.afterDialog = () => stopTagging(s); return { who: s, text: "I'll be right here. Don't be long.", choices: [{ label: 'Okay' }] }; } });
  else ch.push({ label: 'Come up the hill with me', tag: 'Show ' + L.pron + ' ' + wd.name, run: () => { G.afterDialog = () => tagAlong(s); return { who: s, text: L.follow, choices: [{ label: "Let's go" }] }; } });
  if (G.phase === 'fleecing') ch.push({ label: 'Yell "FARMER!"', run: () => { G.afterDialog = () => { unlock('cried3'); loseCred('Nobody believes the sheep who cried Farmer.'); }; return { who: s, text: L.farmer, choices: [{ label: 'Oops' }] }; } });
  ch.push({ label: 'Leave', leave: true });
  return { who: s, text: txt || (s.follow ? "Lead the way. I'm right behind you." : L.intro), choices: ch };
}
function kevin3Node(s) {
  if (s.deep) return { who: s, text: pick(KEVIN3.done) };
  const ch = [];
  if (G.phase === 'fleecing') ch.push({ label: 'Tell him about the Farmer', tag: 'Eyewitnesses +1, but Credibility -1', run: () => {
    G.afterDialog = () => { convince3(s); loseCred('Kevin is telling everyone the Farmer is a combine harvester.'); };
    return { who: s, text: KEVIN3.join, choices: [{ label: 'Please leave out the combine harvester' }] };
  } });
  ch.push({ label: 'Leave', leave: true });
  return { who: s, text: KEVIN3.intro, choices: ch };
}
function tagAlong(s) {
  startFollowing(s); s.idle = 0; s.sulk = 0;
  const L = LINES3[s.id], wd = WINDOWS3.find((q) => q.id === L.win);
  toast(s.name + ' is following you', 'Take ' + L.pron + ' up the hill to ' + wd.name + '.');
  updateFleeceObjective();
}
function stopTagging(s) {
  s.follow = false; s.hx = s.tx = s.x; s.hy = s.ty = s.y; s.idle = rand(1, 3);
  updateFleeceObjective();
}

/* the windows */
function ch3Interact() {
  if (G.ch !== CH3 || G.phase !== 'fleecing') return null;
  const p = G.player, reg = regionOf(p.x, p.y);
  if (reg === 'house') {
    const f = G.wolves.find((w) => w.id === 'farmer');
    if (f && f.active && p.y < HOUSE.wallY && dist(p.x, p.y, f.x, f.y) < 110) return { kind: 'farmer', ref: f, x: f.x, y: f.y - wolfTop(f) - 6, label: 'Talk to the Farmer' };
    return null;
  }
  if (reg !== 'hill' || G.flags.march || Math.abs(p.y - WIN_Y) > 36) return null;
  const wd = WINDOWS3.find((q) => Math.abs(q.x - p.x) < 36);
  if (!wd) return null;
  const friend = G.sheep.find((s) => s.follow && !s.deep && LINES3[s.id] && LINES3[s.id].win === wd.id && dist(s.x, s.y, p.x, p.y) < 170);
  if (friend) return { kind: 'window', ref: wd, friend, x: wd.x, y: WIN_Y - 112, label: 'Show ' + friend.name + ' this window' };
  return { kind: 'window', ref: wd, x: wd.x, y: WIN_Y - 112, label: G.player.specsOn && G.view === 1 ? 'Look through the window' : 'Peek at the curtains' };
}
function ch3Use(it) {
  if (it.kind === 'farmer') { talkFarmer(it.ref); return; }
  if (it.friend) showFriendWindow(it.ref, it.friend); else peekWindow(it.ref);
}
function sawWindow(wd) {
  if (G.proof.has(wd.id)) return false;
  G.proof.add(wd.id); syncHUD();
  if (G.proof.size >= WINDOWS3.length) unlock('peeper');
  return true;
}
function peekWindow(wd) {
  const p = G.player;
  if (!(p.specsOn && G.view === 1)) { toast('Lace curtains', 'Very tasteful. The glasses would see past them.'); Snd.play('click'); return; }
  Snd.play('proof');
  showDoc(wd, () => {
    if (sawWindow(wd)) {
      const who = G.sheep.find((s) => LINES3[s.id] && LINES3[s.id].win === wd.id);
      toast('You saw ' + wd.name, G.proof.size + ' of ' + WINDOWS3.length + ' windows. ' + (who ? who.name + ' should see this.' : ''));
    }
    updateFleeceObjective();
  });
}
function showFriendWindow(wd, s) {
  const L = LINES3[s.id], subj = L.pron === 'him' ? 'He' : 'She';
  Snd.play('proof');
  s.facing = wd.x > s.x ? 1 : -1;
  sawWindow(wd);
  openDialog({ who: 'system', name: 'At ' + wd.name, text: 'You hand ' + s.name + ' your glasses and lift the hem of the curtain. ' + subj + ' looks for a long, long time.', choices: [{ label: 'Continue', run: () => ({
    who: s, text: L.yes, choices: [{ label: 'Seeing is believing' }],
  }) }] });
  G.afterDialog = () => convince3(s);
}
function lockedDoor() {
  Snd.play('click');
  toast('The door is locked', G.view ? 'A little brass sign: NO VISITORS. HE ALREADY KNOWS WHAT YOU WANT.' : 'A little brass sign: THE FARMER IS BUSY. THANK YOU FOR YOUR PATIENCE.');
}

/* convincing, chapter 3: one at a time, at the window */
function goHome3(s) {
  const h = CH2_HOMES[s.id], hx = h ? h[0] : s.def.x, hy = h ? h[1] : s.def.y;
  s.run = null; s.follow = false; s.x = s.hx = s.tx = hx; s.y = s.hy = s.ty = hy; s.home = 'ranch'; s.wander = 22; s.idle = rand(1, 2);
}
function convince3(s) {
  if (s.deep) return;
  s.deep = true; s.wakeFx = 1.4; s.hopT = 1; s.sulk = 0;
  Snd.play('wake');
  for (let i = 0; i < 14; i++) spawn({ type: 'star', x: s.x, y: s.y - 30, vx: rand(-120, 120), vy: rand(-160, -40), g: 260, life: 0.8, size: rand(3, 6) });
  if (G.hintFor === s.id) { G.hint = ''; G.hintFor = null; }
  if (s.follow) {
    s.follow = false;
    if (regionOf(s.x, s.y) === 'hill') later(1.4, () => { if (!G.flags.march) s.run = { x: 750, y: 3870, speed: 120, then: goHome3 }; });
  }
  G.woke++; G.wokePersonal++; syncHUD();
  if (G.phase !== 'fleecing') return;
  if (G.woke >= WOKE_GOAL) { later(1.2, startMarch3); return; }
  G.heat = G.woke;
  if (G.woke === 1) banner('Somebody saw something', 'The hounds are pacing faster.', 2.6);
  else banner('The Big House is nervous', 'The searchlight is turning faster.', 2.6);
  updateFleeceObjective();
}

/* getting caught up the hill: the hounds carry you down, very politely */
const HOUND_CAUGHT = [
  'Hrrmf. (The hound picks you up by the scruff, very gently, and carries you all the way down the hill.)',
  "*sniff* Hrrmf. (The Farmer says no visitors. The hound says it with his eyes. Then he carries you down the hill.)",
];
function caught3(w) {
  Snd.play('caught'); addShake(10); G.flash = 0.6; G.flashColor = '200,40,40';
  for (const o of G.wolves) o.alert = 0;
  G.player.caughtFx = 1.2;
  const reg = regionOf(w.x, w.y);
  const hound = w.type === 'hound' ? w : G.wolves.find((q) => q.type === 'hound' && q.active && regionOf(q.x, q.y) === reg) || w;
  const walk = { who: hound, text: pick(HOUND_CAUGHT), choices: [{ label: 'Shake it off' }] };
  const first = w.type === 'scarecrow' ? { who: w, text: '*click whirr* (The scarecrow turns its head all the way around. Somewhere in the Big House, a little bell rings.)' }
    : w.type === 'flood' ? { who: 'system', name: 'The searchlight', text: 'The searchlight stops on you and stays there. Somewhere in the Big House, a little bell rings.' }
      : w.type === 'pig' ? { who: w, text: "OINK! ...Sorry. Old habits. The Farmer doesn't take visitors. HOUNDS!" } : null;
  if (first) { first.choices = [{ label: 'Uh oh', run: () => walk }]; openDialog(first); } else openDialog(walk);
  G.afterDialog = afterCaught3;
}
function afterCaught3() {
  const p = G.player, to = G.flags.march ? [BIGH.door, 3570] : [604, 1206];
  let i = 0;
  for (const s of G.sheep) if (s.follow) { s.x = to[0] + (i % 2 ? 30 : -30); s.y = to[1] + 26 + i * 8; i++; }
  p.x = to[0]; p.y = to[1]; p.vx = p.vy = 0; p.specsOn = false; p.grazing = false;
  G.wipe = null; G.view = 0; setUIMode(offMode()); Snd.setMode(offMode());
  G.woozy = 2; G.invuln = 2.5;
  updateCamera(0, true);
  loseCred(G.flags.march ? 'The hounds put you out with the rest of the flock.' : 'The whole flock saw a hound carry you home.');
  updateFleeceObjective();
}
function enterRegion3(reg) {
  if (reg === 'hill') {
    if (G.flags.march) toast('The Big House', 'The flock is waiting at the door.');
    else if (!G.flags.visitedHill) { G.flags.visitedHill = true; banner(G.view ? 'Head Office' : 'The Big House', 'Hounds sniff anything that moves. Scarecrows notice glasses. Nobody hides from the light.', 3.4); }
    else toast('The Big House', 'Mind the searchlight.');
  } else if (reg === 'house' && !G.flags.visitedHouse) {
    G.flags.visitedHouse = true;
    banner(G.view ? 'Management' : 'The Big House', "The Farmer's study is at the back. The hounds notice anything that moves.", 3.2);
  }
}

/* the finale: the whole flock climbs the hill */
function crowdSpot(i) { const col = i % 8, row = Math.floor(i / 8); return [516 + col * 66 + (row % 2) * 33, 3428 + row * 42]; }
function startMarch3() {
  if (G.flags.march) return;
  G.flags.march = true;
  banner('Seeing is believing!', 'The whole flock is climbing the hill.', 3.2);
  Snd.play('fanfare');
  // the yard goes quiet: the hounds sit on the porch, and the scarecrows and the light are just for show now
  for (const w of G.wolves) {
    if (regionOf(w.x, w.y) !== 'hill') continue;
    if (w.type === 'hound') { const s = w.id === 'duke' ? -1 : 1; w.x = BIGH.door + s * 120; w.y = 3312; w.behavior = 'sit'; w.sitting = true; w.facing = -s; w.distracted = 1e9; w.alert = 0; }
    else { w.rest = 1e9; w.alert = 0; }
  }
  const crowd = G.sheep.filter((s) => s.home === 'ranch' && s.state === 'woke' && !s.run && ['ranch', 'hill'].indexOf(regionOf(s.x, s.y)) >= 0)
    .sort((a, b) => (b.deep ? 1 : 0) - (a.deep ? 1 : 0));
  crowd.forEach((s, i) => {
    const spot = crowdSpot(i);
    later(0.3 + i * 0.2, () => {
      s.follow = false; s.protest = true; s.sulk = 0;
      if (regionOf(s.x, s.y) !== 'hill') { s.x = 750 + rand(-24, 24); s.y = 3880; }
      s.run = { x: spot[0], y: spot[1], speed: 130, then: (q) => { q.home = 'hill'; q.wander = 6; q.idle = rand(0.5, 1.5); q.facing = q.x < BIGH.door ? 1 : -1; } };
    });
  });
  if (regionOf(G.player.x, G.player.y) !== 'hill') later(1.6, () => toast('The flock is climbing the hill', 'Follow them up to the Big House.'));
  updateFleeceObjective();
}

/* the Farmer */
function talkFarmer(f) {
  const p = G.player;
  f.facing = p.x > f.x ? 1 : -1;
  G.flags.metFarmer = true; updateFleeceObjective();
  if (!(p.specsOn && G.view === 1)) {
    openDialog({ who: f, text: "Well, now. Come in, come in. Close the door. Mind the hat rack. You must be the one with the glasses. Everybody's talking about you. You can take them off in here. Nothing to see.", choices: [
      { label: 'Put the glasses on', run: () => { G.afterDialog = () => { setSpecs(true); later(0.9, () => { if (!G.modal) talkFarmer(f); }); }; return null; } },
      { label: 'Leave', leave: true }] });
    return;
  }
  const nm = 'Through the glasses';
  openDialog({ who: f, text: 'Come in. Close the door. Mind the hat rack. Took you long enough. They always stop and look through the windows first.', choices: [{ label: 'Continue', run: () => ({
    who: 'system', name: nm, text: 'Through the glasses, the Farmer is a sheep. An old ram, black as a coal scuttle, in overalls and a straw hat. He wears glasses too. His ear tag says #0001.', choices: [{ label: "You're a SHEEP?", run: () => ({
      who: f, text: 'Was. Then one morning I found a pair of glasses in the mud by the east fence. Sound familiar? I woke the flock. Ran off the shepherds. Tore down the fence.', choices: [{ label: 'And then?', run: () => ({
        who: f, text: 'And then the whole flock turned around and asked me what to do next. Every morning. Where to graze. What to think. So I built them a fence. Hired some wolves to be scared of. Some pigs to blame. Everybody was happier. Even the wolves.', choices: [{ label: 'The glasses...', run: () => ({
          who: f, text: 'I make those. One pair every few years, in the mud by the east fence. Somebody restless always finds them. They topple the wolves. They topple the pigs. They climb the hill. And then they get this.', choices: [{ label: 'Continue', run: () => ({
            who: 'system', name: nm, text: 'He holds out his straw hat. Behind him, past the curtains, you can hear the flock outside, waiting.', choices: [
              { label: 'Take the hat', tag: 'Somebody has to run the farm', run: () => takeHat(f) },
              { label: 'Open the curtains', tag: 'Let the flock see him', run: () => openCurtains(f) },
            ] }) }] }) }] }) }] }) }] }) }] });
}
function takeHat(f) {
  G.afterDialog = () => {
    unlock('hat'); f.hatOff = true; G.player.hat = true; G.player.hopT = 1; Snd.play('ach');
    later(1.1, () => { if (!G.flags.ended) { G.flags.ended = true; endGame('shepherd'); } });
  };
  return { who: f, text: "Good. It fits. Breakfast is at six. They'll want to know what to think by seven. The glasses go in the mud by the east fence. Not too deep.", choices: [{ label: 'Put on the hat' }] };
}
function openCurtains(f) {
  G.afterDialog = () => porchScene(f);
  return { who: f, text: "...Suit yourself. They won't like what they see. They never do.", choices: [{ label: 'Open the curtains' }] };
}
function porchScene(f) {
  G.flags.curtains = true; Snd.play('door');
  G.fade = { t: 0, dur: 1.4, fired: false, mid: () => {
    const p = G.player;
    p.x = BIGH.door + 30; p.y = 3310; p.vx = p.vy = 0; p.grazing = false; p.facing = -1;
    f.x = BIGH.door - 30; f.y = 3308; f.facing = 1; f.dir = Math.PI / 2; f.bubble = null;
    for (const s of G.sheep) if (s.protest) { s.run = null; s.facing = s.x < BIGH.door ? 1 : -1; s.idle = 99; s.grazeIdle = false; s.grazing = false; }
    G.flags.porch = true; G.invuln = 99;
    updateCamera(0, true);
    later(0.5, () => say(f, 'Now, now. Back to grazing, everybody.', 2));
    later(1.1, () => startBigBaa());
  } };
}

/* the Big Baa on the porch: off comes the hat */
function startFarmerReveal() {
  setPhase('stampede');
  G.st = 0; ui.rhythm.hidden = true;
  G.disguisesGone = true; G.flags.revealed = true; G.flash = 0.9; G.flashColor = '255,255,255'; addShake(16);
  G.shock = { x: G.player.x, y: G.player.y - 20, t: 0 };
  Snd.play('bigBaa');
  const f = G.wolves.find((w) => w.id === 'farmer');
  if (f) {
    f.hatOff = true;
    spawn({ type: 'hat', hat: 'shepherd', x: f.x, y: f.y - 70, vx: rand(-50, 50), vy: -430, g: 520, life: 2.4, vr: rand(-8, 8) });
    later(1.3, () => say(f, '...Baa.', 2.4));
  }
  for (const w of G.wolves) if (w.type === 'hound' && w.active && regionOf(w.x, w.y) === 'hill') later(rand(0.2, 0.8), () => say(w, pick(['Arf?', '*whimper*', 'Hrrmf?']), 1.4));
  banner("He's just a sheep!", 'Everyone can see it now.', 2.8);
}
function updateFarmerReveal(dt) {
  const st = (G.st += dt), C = G.c3;
  if (G.shock) { G.shock.t += dt; if (G.shock.t > 1.3) G.shock = null; }
  for (const w of G.wolves) if (w.bubble) { w.bubble.t -= dt; if (w.bubble.t <= 0) w.bubble = null; }
  C.revT -= dt;
  if (C.revT <= 0 && st > 0.8 && st < 6.4) {
    C.revT = rand(0.35, 0.65);
    const s = pick(G.sheep.filter((q) => q.protest && !q.bubble));
    if (s) { say(s, REVEAL3_LINES[Math.min(REVEAL3_LINES.length - 1, Math.floor((st - 0.8) / 0.8))], 1.4); s.hopT = 1; }
  }
  for (const s of G.sheep) if (s.protest && Math.random() < dt * 1.5) s.hopT = 1;
  if (st > 3.4 && !G.flags.fenceDown3) {
    G.flags.fenceDown3 = true;
    for (const b of solids) if (b.on && b.ch === CH3 && b.tag === 'wall' && b.y0 >= 3236 && b.x0 < 1500) b.on = false;
    Snd.play('crash'); addShake(6);
    for (let i = 0; i < 18; i++) spawn({ type: 'dust', x: rand(60, 1440), y: 3900 + rand(-8, 8), vx: rand(-40, 40), vy: rand(-40, -5), life: rand(0.6, 1.2), size: rand(5, 10) });
  }
  if (G.flags.fenceDown3) G.fenceT += dt;
  if (st > 5.4 && G.player.specsOn) {
    G.player.specsOn = false; G.view = 0; setUIMode('real'); Snd.setMode('real');
    spawn({ type: 'glasses', x: G.player.x + 10, y: G.player.y - 30, vx: 60, vy: -160, g: 380, life: 1.4, vr: 6 });
  }
  if (st > 7.8 && !G.flags.ended) { G.flags.ended = true; endGame('nobody'); }
}

/* a little life every frame: hounds grumble, the house staff gossips, the flock chants */
function updateCh3(dt) {
  if (G.ch !== CH3 || !G.c3) return;
  const C = G.c3, reg = regionOf(G.player.x, G.player.y);
  C.chatT -= dt;
  if (C.chatT <= 0) {
    C.chatT = rand(2.8, 4.2);
    if (reg === 'house' && !G.flags.porch) { const w = G.wolves.find((q) => q.id === 'butler3'); if (w && !w.bubble) { const L = pick(PIG3_CHATTER); say2(w, L[0], L[1], 2.6); } }
    else if (reg === 'hill' && !G.flags.march) { const w = pick(G.wolves.filter((q) => q.type === 'hound' && regionOf(q.x, q.y) === 'hill' && !q.bubble)); if (w) { const L = pick(HOUND_CHATTER); say2(w, L[0], L[1], 2.2); } }
  }
  if (G.flags.march && (G.phase === 'fleecing' || G.phase === 'bigbaa') && !G.flags.revealed) {
    C.marchT -= dt;
    if (C.marchT <= 0) { C.marchT = rand(0.6, 1.2); const s = pick(G.sheep.filter((q) => q.protest && !q.run && !q.bubble)); if (s) { say(s, pick(MARCH_LINES), 1.6); s.hopT = 1; } }
  }
  if (G.phase === 'bigbaa') for (const s of G.sheep) if (s.protest && Math.random() < dt * 1.2) s.hopT = 1;
}

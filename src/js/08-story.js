/* ---------------- phases and objectives ---------------- */
const moveHint = () => (touchMode ? 'Drag on the left side of the screen to move.' : 'Move with WASD or the arrow keys.');
function setPhase(p) {
  G.phase = p;
  if (p === 'meadow') {
    if (G.flags.retry) setObjective('The glasses are still in the mud by the fence.', 'Squeeze through the hole in the east fence.');
    else setObjective('Morning at Greener Pastures! Follow the butterfly east.', moveHint());
  } else if (p === 'glasses') setObjective(G.ch === 2 ? 'Something is off. Put the glasses back on.' : 'Put on the glasses.', touchMode ? 'Tap Glasses.' : 'Press Space.');
  else if (p === 'reveal') setObjective('Act natural.', '');
  else if (p === 'fleecing') updateFleeceObjective();
  else if (p === 'herd') setObjective('Herd Mentality!', 'The flock is waking up.');
  else if (p === 'bigbaa') setObjective('Big Baa!', touchMode ? 'Tap Baa when the ring closes.' : 'Press B when the ring closes.');
  else if (p === 'stampede') setObjective(G.ch === 2 ? 'Run them off!' : 'Stampede!', '');
  updateTouchButtons();
}
function updateFleeceObjective() {
  if (G.phase !== 'fleecing') return;
  if (G.ch === 2) { ch2Objective(); return; }
  const reg = regionOf(G.player.x, G.player.y), g = G.sheep.find((q) => q.id === 'gerald');
  if (reg === 'acres') {
    if (g && g.follow && g.state !== 'woke') { setObjective("Get Gerald out through Kevin's tunnel.", 'The tunnel is in the northwest corner. Stay out of the light.'); return; }
    setObjective(G.proof.has('guestbook') ? 'You have the guest book. Is anyone waiting in that pen?' : 'Find the guest book at the front desk.',
      'Hide from the searchlight behind hedges. Freeze when the chef gets close.');
    return;
  }
  if (reg === 'church') { churchObjective(); return; }
  if (reg === 'field') {
    setObjective(G.proof.has('checks') ? 'You have the campaign checks.' : 'Find the campaign checks at Rom HQ.', G.view ? 'Two doors. Two signs. One field.' : 'The South Pasture is through the other door. Supposedly.');
    return;
  }
  const need = Math.max(0, WOKE_GOAL - G.woke);
  const main = G.proof.size === 0 ? 'Find proof. It only shows up while you wear the glasses.' : 'Wake ' + need + ' more sheep. Each one needs the right proof.';
  setObjective(main, G.hint || 'Ask sheep questions to find out what they care about.');
}

/* ---------------- the glasses ---------------- */
function toggleSpecs() {
  const p = G.player;
  if (!p.hasSpecs || G.wipe) return;
  if (G.phase === 'reveal' || G.phase === 'bigbaa' || G.phase === 'stampede' || G.phase === 'meadow') return;
  setSpecs(!p.specsOn);
}
function setSpecs(on) {
  const p = G.player;
  p.specsOn = on;
  G.wipe = { from: G.view, to: on ? 1 : 0, t: 0, dur: RM ? 0.25 : 0.55, wx: p.x, wy: p.y - 28, half: false };
  Snd.play(on ? 'specsOn' : 'specsOff');
  Snd.setMode(on ? 'truth' : offMode());
  if (on && G.phase === 'glasses') { setPhase('reveal'); G.cut = { stage: 'wipe', t: 0 }; }
  updateTouchButtons();
}
function updateWipe(dt) {
  const w = G.wipe;
  if (!w) return;
  w.t += dt / w.dur;
  if (!w.half && w.t >= 0.5) { w.half = true; if (G.ch === 2 || G.realT < 0.5) setUIMode(w.to ? 'truth' : offMode()); }
  if (w.t >= 1) { G.view = w.to; G.wipe = null; }
}
function pickupGlasses() {
  G.glasses.taken = true; G.player.hasSpecs = true;
  Snd.play('pickup');
  if (G.bfly) G.bfly.away = 0.001;
  openDialog({ who: 'system', name: 'In the mud', text: 'A pair of glasses, half-buried in the mud. Sheep-sized. A little smudged.', choices: [{ label: 'Pick them up', run: () => { G.afterDialog = () => setPhase('glasses'); return null; } }] });
}
function updateCut(dt) {
  const c = G.cut;
  if (!c) return;
  c.t += dt;
  const wg = G.wolves[0];
  if (c.stage === 'wipe') { if (!G.wipe && c.t > 0.8) { c.stage = 'pan'; c.t = 0; G.camTarget = { x: wg.x, y: wg.y - 40 }; } }
  else if (c.stage === 'pan') { if (c.t > 1.5) { c.stage = 'talk'; openRevealDialog(); } }
  else if (c.stage === 'pan2') { if (c.t > 1.7) { c.stage = 'talk2'; openRevealDialog2b(); } }
  else if (c.stage === 'back') {
    G.camTarget = null;
    if (c.t > 1.0) {
      G.cut = null; wg.waving = false; setPhase('fleecing');
      toast('Glasses on', touchMode ? 'Tap Glasses to take them off.' : 'Press Space to take them off.');
    }
  }
}
function openRevealDialog() {
  if (G.ch === 2) { openRevealDialog2(); return; }
  const sys = 'Through the glasses';
  openDialog({ who: 'system', name: sys, text: 'The shepherd waving from the hill is a wolf in a straw hat.', choices: [{ label: 'Continue', run: () => ({
    who: 'system', name: sys, text: "He's waving at you. Wave back. Act natural.", choices: [{ label: 'Wave back', run: () => {
      Snd.baa(1, 0.4); G.player.hopT = 1;
      const graze = touchMode ? 'hold Graze' : 'hold Shift', off = touchMode ? 'tap Glasses' : 'press Space';
      return { who: 'system', name: 'How not to get eaten', text: 'Wolves notice a sheep wearing glasses. When a red cone sweeps toward you, ' + graze + ' to put your head down, or ' + off + ' to take the glasses off. Proof only shows up while you wear them.',
        choices: [{ label: 'Got it', run: () => { if (G.cut) { G.cut.stage = 'back'; G.cut.t = 0; } return null; } }] };
    } }],
  }) }] });
}
function updateButterfly(dt) {
  const b = G.bfly;
  if (!b || b.gone) return;
  if (b.away) { b.away += dt; b.x += 70 * dt; b.y -= 90 * dt; if (b.away > 5) b.gone = true; return; }
  const t = BFLY_PATH[b.i], dx = t[0] - b.x, dy = t[1] - b.y, d = Math.hypot(dx, dy);
  const last = b.i === BFLY_PATH.length - 1;
  if (last || dist(G.player.x, G.player.y, b.x, b.y) < 190) {
    if (d < 6 && !last) b.i++;
    else if (d > 2) { const v = Math.min(d, 95 * dt); b.x += (dx / d) * v; b.y += (dy / d) * v; }
  }
}
function checkPickups() {
  const p = G.player;
  if (G.phase === 'meadow' && !G.glasses.taken && dist(p.x, p.y, GLASSES_AT.x, GLASSES_AT.y) < 36) { pickupGlasses(); return; }
  if (G.phase !== 'fleecing' || !p.specsOn || G.view !== 1 || G.wipe) return;
  for (const pr of G.proofs) {
    if (pr.found || dist(p.x, p.y, pr.x, pr.y) > 40) continue;
    pr.found = true; G.proof.add(pr.id); Snd.play('proof'); syncHUD();
    showDoc(pr, () => { toast('Proof found', pr.name + ' (' + G.proof.size + ' of ' + PROOF_COUNT + ')'); updateFleeceObjective(); });
    return;
  }
}

/* ---------------- talking ---------------- */
const canTalk = () => G.phase === 'meadow' || G.phase === 'glasses' || G.phase === 'fleecing' || G.phase === 'herd';
function findInteract() {
  const p = G.player, reg = regionOf(p.x, p.y);
  let best = null, bd = Infinity;
  for (const s of G.sheep) {
    if (s.run) continue;
    const d = dist(p.x, p.y, s.x, s.y);
    if (d < 60 && d < bd) { bd = d; best = { kind: 'sheep', ref: s, x: s.x, y: s.y - 56 * (s.scale || 1) - 6, label: 'Talk to ' + s.name }; }
  }
  const b = G.wolves.find((w) => w.id === 'biscuit');
  if (b && b.active && b.alert < 0.5 && !b.dash && G.phase !== 'stampede') {
    const d = dist(p.x, p.y, b.x, b.y);
    if (d < 62 && d < bd) { bd = d; best = { kind: 'dog', ref: b, x: b.x, y: b.y - 48, label: 'Talk to Sgt. Biscuit' }; }
  }
  if (G.phase === 'meadow' || G.phase === 'fleecing' || (G.phase === 'herd' && reg !== 'ranch')) {
    for (const pt of PORTALS) {
      if (pt.region !== reg || (pt.ch && pt.ch !== G.ch) || (pt.truthOnly && !(p.specsOn && G.view === 1))) continue;
      const d = dist(p.x, p.y, pt.x, pt.y);
      if (d < pt.r && d - 12 < bd) { bd = d - 12; best = { kind: 'portal', ref: pt, x: pt.x, y: pt.y - 44, label: G.view && pt.labelTruth ? pt.labelTruth : pt.label }; }
    }
  }
  const rk = rackInteract();
  if (rk) best = rk;
  return best;
}
function doInteract(it) {
  if (it.kind === 'rack') { chewRack(); return; }
  if (it.kind === 'portal') usePortal(it.ref);
  else if (it.kind === 'dog') talkToDog(it.ref);
  else talkTo(it.ref);
}
function usePortal(pt) {
  const dest = PORTALS.find((q) => q.id === pt.to);
  if (!dest || G.fade) return;
  Snd.play(pt.id.indexOf('tunnel') === 0 ? 'dig' : 'door');
  G.fade = { t: 0, dur: 0.8, fired: false, mid: () => doTeleport(dest) };
}
function doTeleport(dest) {
  const p = G.player, from = regionOf(p.x, p.y);
  p.x = dest.arrive[0]; p.y = dest.arrive[1]; p.vx = p.vy = 0;
  let i = 0;
  for (const s of G.sheep) if (s.follow && regionOf(s.x, s.y) === from) { s.x = p.x + (i % 2 ? 28 : -28); s.y = p.y + 24 + i * 8; i++; }
  G.invuln = Math.max(G.invuln, 1.2);
  for (const w of G.wolves) w.alert = 0;
  updateCamera(0, true);
  onEnterRegion(regionOf(p.x, p.y), dest);
}
function onEnterRegion(reg, dest) {
  if (reg === 'acres') {
    if (!G.flags.visitedAcres) { G.flags.visitedAcres = true; banner('Sunny Acres', 'Back here, every sheep is off-limits. Glasses or not.', 3); }
    else toast('Sunny Acres', 'Mind the searchlight.');
  } else if (reg === 'field') {
    const north = dest.id === 'fieldN';
    toast(G.view ? 'Same Pasture' : north ? 'North Pasture' : 'South Pasture', G.view ? 'Which door did you use? Does it matter?' : north ? 'Home of the North Pasture sheep.' : 'Home of the South Pasture sheep.');
  } else if (reg === 'church') {
    enterChurch();
  } else if (reg === 'farm') {
    if (!G.flags.visitedFarm) { G.flags.visitedFarm = true; banner(G.view ? 'Pig HQ' : 'The Farmhouse', G.view ? 'The Board is in session. Pigs notice anything that moves.' : 'It smells like a barn in here. A very expensive barn.', 3); }
  } else {
    if (G.ch === 2) backFromRetirement();
    const g = G.sheep.find((q) => q.id === 'gerald');
    if (g && g.follow && g.state !== 'woke' && regionOf(g.x, g.y) === 'ranch') {
      g.home = 'ranch'; g.hx = g.x; g.hy = g.y;
      later(0.9, () => { say(g, "Wait. That wasn't a spa line, was it?", 2.6); unlock('gerald'); wakeSheep(g, true); });
    }
  }
  updateFleeceObjective();
}
function talkTo(s) {
  if (!s) return;
  Snd.baa(s.kind === 'lamb' ? 1.45 : 0.9 + Math.random() * 0.2, 0.3);
  s.facing = G.player.x > s.x ? 1 : -1; s.grazing = false; s.idle = Math.max(s.idle, 2);
  let node;
  if (G.ch === 2 && !(s.sulk > 0)) { openDialog(ch2TalkNode(s)); return; }
  if (s.sulk > 0) node = { who: s, text: pick(["Hmph. I'm not talking to you right now.", 'Hmph. Still thinking about what you said. Go away.', 'Hmph. Ask me later.']) };
  else if (s.kind === 'gerald') node = geraldNode(s);
  else if (s.kind === 'flock') node = flockNode(s);
  else if (s.kind === 'lamb') node = lambNode(s);
  else if (s.kind === 'kevin') node = kevinNode(s);
  else node = s.state === 'woke' ? { who: s, text: LINES[s.id].woke } : keyNode(s);
  openDialog(node);
}
function keyNode(s, txt) {
  const L = LINES[s.id], ch = [];
  ch.push({ label: 'Ask a question', run: () => ({ who: 'player', name: 'You', text: L.ask, choices: [{ label: 'Listen', run: () => {
    G.hint = L.hint; updateFleeceObjective();
    return { who: s, text: L.reply, choices: [{ label: 'Go on', run: () => keyNode(s, L.prompt) }] };
  } }] }) });
  if (G.proof.size) ch.push({ label: 'Show proof', tag: G.proof.size + ' of ' + PROOF_COUNT + ' found', run: () => proofNode(s) });
  const ger = G.sheep.find((q) => q.id === 'gerald');
  if (L.geraldOK && ger && (ger.follow || ger.state === 'woke') && regionOf(ger.x, ger.y) === 'ranch' && dist(ger.x, ger.y, s.x, s.y) < 240) {
    ch.push({ label: 'Introduce Gerald', tag: 'He came back from Sunny Acres', run: () => { G.afterDialog = () => wakeSheep(s, true); return { who: s, text: L.geraldOK, choices: [{ label: 'Welcome to the Black Sheep Society' }] }; } });
  }
  if (G.player.hasSpecs && G.phase === 'fleecing') {
    ch.push({ label: 'Lend ' + L.pron + ' your glasses', tag: 'Risky: works half the time', run: () => lendNode(s) });
    ch.push({ label: 'Yell "WOLF!"', run: () => { G.afterDialog = () => { unlock('cried'); loseCred('Nobody believes the sheep who cried wolf.'); }; return { who: s, text: L.wolf, choices: [{ label: 'Oops' }] }; } });
  }
  ch.push({ label: 'Leave', leave: true });
  return { who: s, text: txt || L.intro, choices: ch };
}
function proofNode(s) {
  const L = LINES[s.id];
  const ch = G.proofs.filter((p) => p.found).map((p) => ({ label: 'Show ' + p.short, run: () => {
    if (p.id === s.def.needs) { G.afterDialog = () => wakeSheep(s, true); return { who: s, text: L.proofOK, choices: [{ label: 'Welcome to the Black Sheep Society' }] }; }
    G.afterDialog = () => { s.sulk = 20; say(s, 'Hmph.', 1.6); };
    return { who: s, text: L.proofNo + ' Hmph.', choices: [{ label: 'Oops. Wrong proof.' }] };
  } }));
  ch.push({ label: 'Back', leave: true, run: () => keyNode(s, L.prompt) });
  return { who: 'player', name: 'You', text: 'Which proof should you show ' + L.pron + '?', choices: ch };
}
function lendNode(s) {
  const L = LINES[s.id];
  if (Math.random() < 0.5) { G.afterDialog = () => wakeSheep(s, true); return { who: s, text: L.lendOK, choices: [{ label: 'Welcome to the Black Sheep Society' }] }; }
  G.afterDialog = () => { s.panic = 2.2; makeNoise(s.x, s.y); loseCred(s.name + ' panicked and ran to the shepherds.'); };
  return { who: s, text: L.lendNo, choices: [{ label: 'Uh oh' }] };
}
function kevinNode(s) {
  if (s.state === 'woke') return { who: s, text: pick(['Have you considered that the moon is ALSO a wolf?', "I've been awake since before it was cool.", 'The clouds are taking notes. Act casual.']) };
  const saw = G.flags.sawRainbow;
  const intro = saw ? "You looked at the rainbow, didn't you? Plywood. Told you. I'm not crazy. Well, not about the rainbow." : "Psst. You see it too, don't you? The moon is a wolf. The rainbow is fake. The clouds are taking notes.";
  const ch = [];
  if (G.player.hasSpecs) ch.push({ label: 'Ask about Sunny Acres', run: () => {
    G.flags.tunnelHint = true; G.hint = "Hint: Kevin's tunnel is next to the rainbow. Wear your glasses to see it."; updateFleeceObjective();
    return { who: s, text: "Sunny Acres? I've been inside, man. Dug a tunnel. Took me three years. It's right by the rainbow. You'll only see it with the right glasses.", choices: [{ label: 'Back', run: () => kevinNode(s) }] };
  } });
  ch.push({ label: 'Ask about the rainbow', run: () => ({ who: s, text: saw ? "It's plywood, man. You saw it. Now nobody can call me crazy. About that one thing." : "It's plywood, man. Put on your weird glasses and go look at it.", choices: [{ label: 'Back', run: () => kevinNode(s) }] }) });
  if (G.player.hasSpecs && G.phase === 'fleecing') ch.push({ label: 'Join the cause?', tag: 'Woke +1, but Credibility -1', run: () => {
    G.afterDialog = () => { wakeSheep(s, true); loseCred('Kevin is telling everyone the moon is a wolf.'); };
    return { who: s, text: "FINALLY. I'll tell everyone. Starting with the moon thing.", choices: [{ label: "Please don't start with the moon thing" }] };
  } });
  ch.push({ label: 'Leave', leave: true });
  return { who: s, text: intro, choices: ch };
}
function lambNode(s) {
  if (s.state === 'woke') return { who: s, text: "I told everyone! Nobody listened! Because I'm a lamb!" };
  if (!G.player.hasSpecs) return { who: s, text: 'Hi! Hi! Wanna race to the fence? Mom says never go near the fence. Why not, though?' };
  return { who: s, text: 'Hi! Are those glasses? Can I have glasses? Is the shepherd a wolf? I KNEW it!', choices: [
    { label: 'Tell him everything', run: () => {
      G.afterDialog = () => { wakeSheep(s, false); startFollowing(s); toast('Lambert is awake!', 'Nobody listens to lambs. Woke +0.'); };
      return { who: s, text: "I KNEW IT! I'm gonna tell EVERYONE!", choices: [{ label: 'Good luck, kid' }] };
    } },
    { label: 'Leave', leave: true }] };
}
function flockNode(s) {
  if (s.state === 'woke') return { who: s, text: pick(FLOCK_WOKE) };
  if (s.def.say) return { who: s, text: G.player.specsOn ? s.def.saySpecs : pick(s.def.say), choices: [{ label: 'Baa' }] };
  const line = G.player.specsOn && Math.random() < 0.5 ? pick(FLOCK_SPECS) : FLOCK_LINES[s.def.line % FLOCK_LINES.length];
  return { who: s, text: line, choices: [{ label: 'Baa' }] };
}

/* ---------------- consequences ---------------- */
function unlock(id) {
  if (G.ach.has(id)) return;
  G.ach.add(id);
  const saved = store.get(), ever = new Set(saved.ach || []);
  const isNew = !ever.has(id);
  ever.add(id); store.patch({ ach: Array.from(ever) });
  toast((isNew ? 'Achievement: ' : 'Achievement again: ') + ACH[id][0], ACH[id][1], 'ach');
  Snd.play('ach');
}
function loseCred(msg) {
  G.cred = Math.max(0, G.cred - 1);
  Snd.play('bonk'); addShake(7); syncHUD();
  toast('Credibility -1', msg);
  if (G.cred <= 0) G.pendingEnd = G.ch === 2 ? 'retired' : 'counted';
}
function wakeSheep(s, counts) {
  if (s.state === 'woke') return;
  s.state = 'woke'; s.wakeFx = 1.4; s.grazing = false;
  Snd.play('wake');
  for (let i = 0; i < 14; i++) spawn({ type: 'star', x: s.x, y: s.y - 30, vx: rand(-120, 120), vy: rand(-160, -40), g: 260, life: 0.8, size: rand(3, 6) });
  if (s.id === 'ewenice' && G.ch === 1) later(0.5, eweniceLeaves);
  if (!counts) return;
  G.woke++; G.wokePersonal++;
  G.playerDark = Math.min(0.72, G.woke * 0.24);
  syncHUD(); unlock('wool');
  if (G.phase !== 'fleecing') return;
  if (G.woke >= WOKE_GOAL) { later(0.6, startHerd); return; }
  G.heat = G.woke;
  const dog = G.wolves.find((w) => w.id === 'biscuit');
  if (G.woke === 1) banner('The wolves are nervous', 'Patrols are speeding up.');
  else if (G.woke === 2) banner(dog && dog.ally ? 'Short a sheepdog' : 'Double duty', dog && dog.ally ? 'The shepherds are patrolling harder without Biscuit.' : 'Sgt. Biscuit is running faster.');
  else if (G.woke === 3) banner('Snap election!', 'Rom & Rem are spinning faster than ever.');
  updateFleeceObjective();
}
function activateBiscuit() {
  const b = G.wolves.find((w) => w.id === 'biscuit');
  if (!b || b.active) return;
  b.active = true; G.invuln = Math.max(G.invuln, 1.5);
  say(b, 'WOOF! Sgt. Biscuit reporting!', 2.4); Snd.play('woof');
}
function caught(w) {
  Snd.play('caught'); addShake(10); G.flash = 0.6; G.flashColor = '200,40,40';
  for (const o of G.wolves) o.alert = 0;
  G.player.caughtFx = 1.2;
  const docW = G.wolves.find((o) => o.id === 'doc');
  openDialog({ who: w, text: CAUGHT_LINES[w.id] || 'Caught!', choices: [{ label: 'Uh oh', run: () => ({ who: docW, text: 'Calm Drops, twice daily. You will feel bright and happy in no time. Next!', choices: [{ label: 'Shake it off' }] }) }] });
  G.afterDialog = afterCaught;
}
function afterCaught() {
  const p = G.player, ger = G.sheep.find((q) => q.id === 'gerald');
  if (ger && ger.follow && ger.state !== 'woke' && regionOf(ger.x, ger.y) !== 'ranch') {
    ger.follow = false; ger.x = 2220; ger.y = 752; ger.hx = 2220; ger.hy = 752; ger.tx = ger.x; ger.ty = ger.y; PEN_GATE.on = true;
    toast('Gerald is back in the pen', 'The staff walked him back to the line.');
  }
  for (const s of G.sheep) if (s.follow && regionOf(s.x, s.y) !== 'ranch') { s.x = 300 + rand(-20, 20); s.y = 800; }
  p.x = 330; p.y = 772; p.vx = p.vy = 0; p.specsOn = false; p.grazing = false;
  G.wipe = null; G.view = 0; setUIMode(offMode()); Snd.setMode(offMode());
  G.woozy = 3.2; G.invuln = 2.5;
  for (let i = 0; i < 16; i++) spawn({ type: 'heart', mode: 'candy', x: p.x + rand(-40, 40), y: p.y - rand(20, 70), vx: rand(-20, 20), vy: rand(-50, -20), life: rand(1.2, 2.2), size: rand(5, 9) });
  updateCamera(0, true);
  loseCred('The flock saw you leave the clinic.');
}

/* ---------------- finale ---------------- */
function startHerd() {
  if (G.phase !== 'fleecing') return;
  if (G.wipe) { G.view = G.wipe.to; G.wipe = null; }
  setPhase('herd');
  banner('Herd Mentality!', 'Awake sheep are waking their neighbors.', 3);
  ringChapelBell();
  if (regionOf(G.player.x, G.player.y) !== 'ranch') later(1.4, () => toast('Back to the ranch', 'The flock is gathering at the gate. Head for the exit.'));
  Snd.play('fanfare');
  for (const s of G.sheep) if (s.state === 'woke' && regionOf(s.x, s.y) === 'ranch') startFollowing(s);
  for (const w of G.wolves) { w.alert = 0; w.distracted = 0; }
  const sleepers = G.sheep.filter((s) => s.state === 'asleep' && regionOf(s.x, s.y) === 'ranch').sort((a, b) => dist(a.x, a.y, G.player.x, G.player.y) - dist(b.x, b.y, G.player.x, G.player.y));
  sleepers.forEach((s, i) => later(0.9 + i * 0.32, () => { wakeSheep(s, false); startFollowing(s); say(s, pick(FLOCK_WOKE), 1.8); }));
  later(1.4 + sleepers.length * 0.32, () => {
    G.flags.herdReady = true;
    setObjective('Lead the flock to the main gate. Then baa!', 'The gate is in the south fence. The wolves are waiting there.');
  });
}
function herdCheck() {
  if (!G.flags.herdReady) return;
  const p = G.player;
  if (dist(p.x, p.y, GATEX, 985) > 175) return;
  const flock = G.sheep.filter((s) => s.follow);
  const near = flock.filter((s) => dist(s.x, s.y, p.x, p.y) < 300).length;
  if (near >= Math.ceil(flock.length * 0.7)) startBigBaa();
}
function startBigBaa() {
  setPhase('bigbaa');
  G.rh = { t: 0, start: 1.8, iv: 0.6, last: -1, hit: -99, vol: 0, done: false };
  ui.rhythm.hidden = false; ui.rhythmFill.style.width = '0%';
  ui.rhythmHint.textContent = touchMode ? 'Tap Baa when the ring closes' : 'Press B or Space when the ring closes';
  banner('Big Baa!', (G.ch === 2 ? 'Drown out the Chairman. ' : '') + (touchMode ? 'Tap Baa on the beat.' : 'Press B on the beat.'), 2.2);
  Snd.setMode('quiet');
  G.player.vx = G.player.vy = 0;
}
function updateRhythm(dt) {
  const r = G.rh;
  if (!r || r.done) return;
  r.t += dt;
  const k = Math.floor((r.t - r.start) / r.iv);
  if (k >= 0 && k > r.last) {
    r.last = k; Snd.play('tick', k % 4 === 0);
    for (const s of G.sheep) if (s.follow && Math.random() < 0.25) s.hopT = 1;
  }
}
function rhythmPress() {
  const r = G.rh;
  if (!r || r.done) return;
  const p = G.player, k = Math.round((r.t - r.start) / r.iv), off = r.t - (r.start + k * r.iv);
  if (k < 0 || Math.abs(off) > 0.17 || k === r.hit) { pop(p.x, p.y - 74, off < 0 || k < 0 ? 'Too early' : 'Too late', false); Snd.baa(0.8, 0.18); return; }
  r.hit = k;
  const perfect = Math.abs(off) <= 0.075;
  r.vol = Math.min(1, r.vol + (perfect ? 0.22 : 0.15));
  ui.rhythmFill.style.width = Math.round(r.vol * 100) + '%';
  pop(p.x, p.y - 74, perfect ? 'Perfect!' : 'Good!', true);
  Snd.baa(1, 0.4); Snd.play('chorus', 2 + Math.round(r.vol * 4)); Snd.play('kick');
  say(p, 'BAA!', 0.5); p.hopT = 1;
  for (const w of G.wolves) w.hatBounce = 1;
  addShake(2 + r.vol * 4);
  for (const s of G.sheep) if (s.follow && Math.random() < 0.6) s.hopT = 1;
  if (r.vol >= 1) { r.done = true; later(0.35, startStampede); }
}
function startStampede() {
  if (G.ch === 2) { startPigRout(); return; }
  setPhase('stampede');
  G.st = 0; ui.rhythm.hidden = true;
  G.disguisesGone = true; G.flash = 0.9; G.flashColor = '255,255,255'; addShake(16);
  G.shock = { x: G.player.x, y: G.player.y - 20, t: 0 };
  Snd.play('bigBaa');
  for (const w of G.wolves) {
    if (!w.active || w.type === 'dog' || regionOf(w.x, w.y) !== 'ranch') continue;
    w.hatOff = true;
    if (w.type === 'twohead') { for (const h of ['sashA', 'sashB']) spawn({ type: 'hat', hat: h, x: w.x, y: w.y - 40, vx: rand(-90, 90), vy: rand(-360, -240), g: 520, life: 2.2, vr: rand(-8, 8) }); }
    else spawn({ type: 'hat', hat: w.type, x: w.x, y: w.y - 72, vx: rand(-80, 80), vy: rand(-380, -260), g: 520, life: 2.2, vr: rand(-8, 8) });
    later(rand(0.15, 0.5), () => Snd.play('yelp'));
    say(w, pick(['YIPE!', 'AWOO?!', 'Our hats!', 'Run!']), 1.4);
  }
  banner('Disguises off!', 'Every sheep can see the wolves now.', 2.4);
}
function updateStampede(dt) {
  if (G.ch === 2) { updatePigRout(dt); return; }
  const st = (G.st += dt);
  if (G.shock) { G.shock.t += dt; if (G.shock.t > 1.3) G.shock = null; }
  for (const w of G.wolves) {
    if (!w.active || regionOf(w.x, w.y) !== 'ranch') continue;
    if (w.bubble) { w.bubble.t -= dt; if (w.bubble.t <= 0) w.bubble = null; }
    if (st < 0.5) continue;
    if (w.type === 'dog') {
      w.sitting = false;
      if (!w.chasing) { w.chasing = true; say(w, 'WOOF! Get off my ranch!', 2.2); Snd.play('woof'); }
    }
    const tx = w.x + (w.x - GATEX) * 0.2, ty = MH + 140, dx = tx - w.x, dy = ty - w.y, d = Math.hypot(dx, dy);
    const v = (w.type === 'dog' ? 200 : 250) * dt;
    w.x += (dx / d) * v; w.y += (dy / d) * v; w.walk = 1; w.phase += dt * 14; w.dir = Math.atan2(dy, dx);
    if (w.type !== 'twohead') w.facing = dx >= 0 ? 1 : -1;
    if (w.y > MH + 60) w.active = false;
  }
  if (st > 0.9 && !G.flags.fenceDown) {
    G.flags.fenceDown = true;
    for (const b of solids) if (b.tag === 'fence' || b.tag === 'gate' || b.tag === 'wild') b.on = false;
    Snd.play('crash');
    for (let i = 0; i < 24; i++) spawn({ type: 'dust', x: GATEX + rand(-90, 90), y: FY1 + rand(-10, 10), vx: rand(-60, 60), vy: rand(-40, -5), life: rand(0.6, 1.2), size: rand(5, 10) });
  }
  if (G.flags.fenceDown) G.fenceT += dt;
  if (st > 1.4 && !G.flags.stampeding) {
    G.flags.stampeding = true; Snd.play('rumble');
    G.sheep.forEach((s, i) => { if (regionOf(s.x, s.y) !== 'ranch') return; s.follow = false; s.run = { x: 120 + ((i * 137) % 1060), y: 1118 + ((i * 53) % 130) }; });
  }
  if (st > 1.4 && Math.random() < 0.5) spawn({ type: 'dust', x: G.player.x + rand(-60, 60), y: G.player.y + rand(-6, 6), vx: rand(-30, 30), vy: rand(-30, -5), life: 0.7, size: rand(4, 8) });
  if (st > 2.4) {
    G.realT = easeIO(clamp((st - 2.4) / 2.4, 0, 1));
    if (!G.flags.realMusic) { G.flags.realMusic = true; Snd.setMode('real'); setUIMode('real'); }
  }
  if (st > 5 && G.player.specsOn) {
    G.player.specsOn = false; G.view = 0;
    spawn({ type: 'glasses', x: G.player.x + 10, y: G.player.y - 30, vx: 60, vy: -160, g: 380, life: 1.4, vr: 6 });
  }
  if (st > 6.6 && !G.flags.ended) { G.flags.ended = true; endGame('win'); }
}

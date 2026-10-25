/* ---------------- Gerald, and the sheepdog who could be a good boy ---------------- */
function geraldNode(s) {
  if (s.state === 'woke') return { who: s, text: pick(['That was NOT a spa.', "They kept saying 'marinate'. I thought it was a massage thing.", 'Nana! I have to tell Nana!']) };
  if (s.follow) return { who: s, text: 'Lead the way! Is the exit near the onions? Everything here smells like onions.' };
  return { who: s, text: 'Oh, hello! Are you here for the spa too? The line has not moved since yesterday. Also, it smells like onions.', choices: [
    { label: 'Open the gate', run: () => {
      G.afterDialog = () => openPen(s);
      return { who: s, text: 'Oh! Are we skipping the line? How exciting. Lead the way!', choices: [{ label: 'Stay close' }] };
    } },
    { label: 'Leave', leave: true }] };
}
function openPen(s) {
  PEN_GATE.on = false;
  s.tx = s.x; s.ty = s.y - 60;
  startFollowing(s);
  Snd.play('door');
  toast('Gerald is following you', "Get him out through Kevin's tunnel.");
  updateFleeceObjective();
}
function talkToDog(w) {
  Snd.play('woof'); w.alert = 0;
  w.dir = Math.atan2(G.player.y - w.y, G.player.x - w.x); setFacing(w); w.pause = Math.max(w.pause || 0, 2.5); w.goal = null;
  if (w.sulk > 0) { openDialog({ who: w, text: 'Sgt. Biscuit is pretending not to hear you.' }); return; }
  openDialog(dogNode(w));
}
function dogNode(w) {
  if (w.ally && G.ch === 2) return { who: w, text: pick(DOG2_LINES) };
  if (w.ally) return { who: w, text: pick(["Sgt. Biscuit, reporting for the resistance! I'll keep the shepherds busy.", 'If a shepherd spots you, I bark. Squirrel trick. Works every time.', 'I walked them to the gate. Every one. Never again.']) };
  const ch = [{ label: 'Ask a question', run: () => ({ who: 'player', name: 'You', text: 'Where do the old sheep go?', choices: [{ label: 'Listen', run: () => {
    G.hint = 'Hint: Biscuit walks sheep to Sunny Acres. He has never been inside.'; updateFleeceObjective();
    return { who: w, text: 'Sunny Acres! I walk them to the gate myself. Good sheep. They never come back. They must love it there.', choices: [{ label: 'Go on', run: () => dogNode(w) }] };
  } }] }) }];
  if (G.proof.size) ch.push({ label: 'Show proof', tag: G.proof.size + ' of ' + PROOF_COUNT + ' found', run: () => dogProofNode(w) });
  const ger = G.sheep.find((q) => q.id === 'gerald');
  if (ger && (ger.follow || ger.state === 'woke') && regionOf(ger.x, ger.y) === 'ranch' && dist(ger.x, ger.y, w.x, w.y) < 240) {
    ch.push({ label: 'Show him Gerald', run: () => flipNode(w, 'Gerald? I walked you to Sunny Acres YESTERDAY. You said it smelled like onions... Permission to bite a shepherd, sir?') });
  }
  if (G.player.hasSpecs && G.phase === 'fleecing') ch.push({ label: 'Yell "WOLF!"', run: () => {
    G.afterDialog = () => { unlock('cried'); loseCred('Nobody believes the sheep who cried wolf. Not even the dog.'); };
    return { who: w, text: "WOLF?! Where?! ...That's Shepherd Wolfgang. Nice try, civilian.", choices: [{ label: 'Oops' }] };
  } });
  ch.push({ label: 'Leave', leave: true });
  return { who: w, text: "Sgt. Biscuit, on duty! Keeping the flock safe from wolves. Haven't seen a single wolf in years. Good, right?", choices: ch };
}
function dogProofNode(w) {
  const ch = G.proofs.filter((p) => p.found).map((p) => ({ label: 'Show ' + p.short, run: () => {
    if (p.id === 'fleece') { G.afterDialog = () => { w.sulk = 15; say(w, '*sniff* Smells like wolf.', 1.6); }; return { who: w, text: "*sniff sniff* A sheep suit that smells like wolf. That's a Sunday matter, sir. I don't do Sundays.", choices: [{ label: 'Oops. Wrong proof.' }] }; }
    if (p.id === 'guestbook') return flipNode(w, '312 in. Zero out. I walked them there. I WALKED THEM THERE. ...Permission to bite a shepherd, sir?');
    G.afterDialog = () => { w.sulk = 15; say(w, '*sniffs paper, unimpressed*', 1.6); };
    return { who: w, text: "That's a piece of paper, sir. I'm a dog.", choices: [{ label: 'Oops. Wrong proof.' }] };
  } }));
  ch.push({ label: 'Back', leave: true, run: () => dogNode(w) });
  return { who: 'player', name: 'You', text: 'Which proof should you show him?', choices: ch };
}
function flipNode(w, line) {
  G.afterDialog = () => {
    w.ally = true; w.alert = 0; w.goal = null; w.cd = 2;
    unlock('biscuit');
    banner('Good boy!', 'Sgt. Biscuit will bark to distract any shepherd who spots you.', 3);
    Snd.play('fanfare');
  };
  return { who: w, text: line, choices: [{ label: 'Permission granted' }] };
}

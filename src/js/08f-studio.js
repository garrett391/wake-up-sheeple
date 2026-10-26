/* ---------------- The Bleat: Bellwether's TV studio (Chapter 1) ----------------
   Outside: a small studio in the southwest pasture, by the main gate. Inside: its own room, far below the ranch.
   Bellwether reads the news the whole flock follows. Through the glasses, his cue cards come in under the back
   door, pushed by a paw. While the ON AIR light is on, the two studio cameras catch anything that moves; you move
   during the commercial breaks. Show him the cue cards and he rings his bell: Woke +2, because his viewers come too. */
const STUDIO = { x0: 96, y0: 935, x1: 246, y1: 990, door: 171 };
solid(STUDIO.x0, STUDIO.y0, STUDIO.x1, STUDIO.y1, 'building', true);
PATHS.push([[618, 985], [420, 990], [236, 1008]]);
{
  // clear flowers and tufts off the new building and its path; the lollipop tree that stood here moves a little east
  const L0 = LOLLI.findIndex(([x, y]) => x === 160 && y === 880);
  if (L0 >= 0) {
    LOLLI[L0] = [330, 892];
    const b = solids.find((s) => s.tag === 'prop' && s.x0 === 156 && s.y0 === 875);
    if (b) { b.x0 = 326; b.x1 = 334; b.y0 = 887; b.y1 = 892; }
    const d = STATIC.findIndex((q) => q.y === 880 && q.x0 === 134 && q.x1 === 186);
    if (d >= 0) STATIC.splice(d, 1);
    addStatic(892, 304, 806, 356, 894, () => drawLolliTree(330, 892));
  }
  const np = PATHS[PATHS.length - 1];
  const nearPath = (x, y, w) => { for (let i = 1; i < np.length; i++) if (distToSeg(x, y, np[i - 1][0], np[i - 1][1], np[i][0], np[i][1]) < w) return true; return false; };
  const onStudio = (x, y, pad) => x > STUDIO.x0 - pad && x < STUDIO.x1 + pad && y > STUDIO.y0 - pad - 40 && y < STUDIO.y1 + pad;
  for (let i = FLOWERS.length - 1; i >= 0; i--) { const f = FLOWERS[i]; if (onStudio(f.x, f.y, 14) || nearPath(f.x, f.y, 22) || dist(f.x, f.y, 330, 892) < 24) FLOWERS.splice(i, 1); }
  for (let i = TUFTS_IN.length - 1; i >= 0; i--) if (onStudio(TUFTS_IN[i][0], TUFTS_IN[i][1], 4)) TUFTS_IN.splice(i, 1);
}
Object.assign(SHEEP_DEFS.find((d) => d.id === 'ewan'), { x: 390, y: 960 });

// the studio inside: its own walled room
REGIONS.studio = { x0: 160, y0: 2420, x1: 1240, y1: 2990, ix0: 250, iy0: 2530, ix1: 1150, iy1: 2930 };
const SET = { x0: 250, y0: 2530, x1: 1150, y1: 2930, exit: 700, cueX: 1085 };
solid(230, 2510, 1170, 2530, 'wall', true);
solid(230, 2510, 250, 2950, 'wall', true); solid(1150, 2510, 1170, 2950, 'wall', true);
solid(230, 2930, 1170, 2950, 'wall', true);
const NEWSDESK = { x0: 610, y0: 2622, x1: 790, y1: 2648 };
solid(NEWSDESK.x0, NEWSDESK.y0, NEWSDESK.x1, NEWSDESK.y1, 'prop');
const CAMS = [[480, 2800], [930, 2800]];
for (const [x, y] of CAMS) solid(x - 14, y - 6, x + 14, y + 4, 'prop');

PORTALS.push(
  { id: 'studio', ch: 1, region: 'ranch', x: STUDIO.door, y: 1008, r: 32, to: 'studioOut', label: 'Visit the Bleat', labelTruth: 'Sneak into the Bleat', arrive: [STUDIO.door + 40, 1014] },
  { id: 'studioOut', ch: 1, region: 'studio', x: SET.exit, y: 2912, r: 34, to: 'studio', label: 'Leave the studio', labelTruth: 'Get out of here', arrive: [SET.exit, 2888] },
);

SHEEP_DEFS.push({ id: 'bellwether', name: 'Bellwether', kind: 'key', x: 700, y: 2612, wander: 0, home: 'studio', needs: 'cuecards', worth: 2 });
WOLF_DEFS.push(
  { id: 'producer', name: 'Producer Howlin', type: 'producer', ch: 1, x: 880, y: 2580, behavior: 'patrol', path: [[880, 2580], [1110, 2580], [1110, 2740], [880, 2740]], range: 170, half: 0.5, speed: 38, dir: 0 },
  { id: 'camA', name: 'Camera A', type: 'camera', ch: 1, x: CAMS[0][0], y: CAMS[0][1] - 30, behavior: 'sweep', base: -Math.PI / 2, amp: 0.6, freq: 0.33, range: 340, half: 0.3, sense: 'camera', dir: -Math.PI / 2 },
  { id: 'camB', name: 'Camera B', type: 'camera', ch: 1, x: CAMS[1][0], y: CAMS[1][1] - 30, behavior: 'sweep', base: -Math.PI / 2, amp: 0.6, freq: 0.29, range: 340, half: 0.3, sense: 'camera', dir: -Math.PI / 2 },
);
Object.assign(CAUGHT_LINES, {
  producer: "Hey! Nobody gets on set without a pass. Especially not in glasses. Clinic. Now.",
  camA: "We're LIVE! There's a sheep wandering around the set! Cut to commercial and call the clinic!",
  camB: "We're LIVE! There's a sheep wandering around the set! Cut to commercial and call the clinic!",
});
PROOF_DEFS.push({ id: 'cuecards', x: SET.cueX, y: 2566, name: "Bellwether's cue cards", short: 'the cue cards', title: "Tonight's cue cards",
  lines: [['Top story', 'The grass has never been greener'], ['Weather', 'Sunny. Always sunny.'], ['North vs. South', 'Remind them to be angry'], ['Sunny Acres', 'Say "pool." Never say "stew."']],
  note: 'Written in crayon. Signed with a paw print. Slid under the back door at 6 a.m. sharp.' });
LINES.bellwether = {
  pron: 'him',
  intro: "Good evening, flock. I'm Bellwether, and this is the Bleat: news you can graze to. Tonight, the grass has never been greener.",
  prompt: "We're on a break. Make it quick, kid. I'm back on in a minute.",
  ask: 'Who writes your news?',
  reply: 'I do, of course! Well. The cards come in under the back door every morning. Fresh news, right on time. I just read them. With feeling.',
  hint: "Hint: Bellwether's cue cards come in under the back door. Wear your glasses to see who pushes them.",
  proofOK: "Crayon. A paw print. 'Remind them to be angry'?! I've been reading wolf mail to the whole flock. This just in: the news is written by wolves.",
  proofNo: "That's not news, kid. If it were news, it'd be on a card.",
  wolf: 'WOLF? Not in my script, kid. Next story.',
  lendOK: 'These glasses... my camera crew has TAILS. This just in: I need a new crew.',
  lendNo: "AAAH! We're LIVE! Somebody get this kid off my set!",
  woke: 'This just in: the truth. Pass it on.',
};
FLOCK_LINES[2] = "Did you catch the Bleat? Bellwether says the grass has never been greener! The studio's right by the gate.";
CH2_HOMES.bellwether = [STUDIO.door + 64, 1012, 'ranch'];
CH2_SIGNS['NEWS YOU CAN GRAZE TO'] = ['NOW PIG-APPROVED NEWS', 'THE PIGS WRITE THE CARDS'];
{
  const all = Object.entries(ACH);
  for (const [k] of all) delete ACH[k];
  for (const [k, v] of all) { if (k === 'pastures') ACH.ringleader = ['Ringleader', 'Get Bellwether to ring his bell']; ACH[k] = v; }
}
PROOF_COUNT = PROOF_DEFS.length;

/* the broadcast: ON AIR, then a warning, then a commercial break */
const NEWS = ['Tonight: the grass has never been greener.', 'South Pasture sheep: still the worst. More at eleven.', 'Weather: sunny, with a chance of more sun.',
  'Sunny Acres pool temperature: perfect. Just perfect.', 'Clover Crunch is now part of an even more balanced breakfast.', 'Remember, flock: questions are how the wolf gets in.'];
const NEWS_TRUTH = ['*reads card* Tonight: the grass has never... been painted?', '*reads card* Remind them to be angry.', '*reads card* Say pool. Never say stew.'];
const BREAK_LINES = ['*sips water*', '*practices his serious face*', 'Is my bell straight?', '*clears throat* Mi mi mi mi.'];
const ONAIR_TALK = ["*whispers* We're LIVE, kid. Catch me on the break.", "*through a frozen smile* Not now. ON AIR.", '*whispers* After the commercial. Go stand somewhere.'];
function newStudio() { return { mode: 'air', t: 0, len: 7, talkT: 1, line: 0 }; }
const studioLive = () => G.ch === 1 && G.studio && (G.studio.mode === 'air' || G.studio.mode === 'wrap') && regionOf(G.player.x, G.player.y) === 'studio' && G.phase === 'fleecing';
function updateStudio(dt) {
  const S = G.studio;
  if (G.ch !== 1 || !S || S.mode === 'off') return;
  if (regionOf(G.player.x, G.player.y) !== 'studio' || G.phase !== 'fleecing') return;
  const bw = G.sheep.find((s) => s.id === 'bellwether');
  S.t += dt;
  if (S.mode === 'air') {
    S.talkT -= dt;
    if (S.talkT <= 0 && bw) { S.talkT = rand(3.2, 4.2); const i = S.line++; say2(bw, NEWS[i % NEWS.length], NEWS_TRUTH[i % NEWS_TRUTH.length], 2.8); }
    if (S.t >= S.len) { S.mode = 'wrap'; S.t = 0; if (bw) say(bw, "We'll be right back after this!", 2); }
  } else if (S.mode === 'wrap') {
    if (S.t >= 2) { S.mode = 'break'; S.t = 0; Snd.play('adBreak'); if (bw) say(bw, pick(BREAK_LINES), 2.4); }
  } else if (S.t >= 6) {
    S.mode = 'air'; S.t = 0; S.len = rand(9, 12); S.talkT = 1.4; Snd.play('sting');
    if (bw) say(bw, "And we're back!", 1.4);
  }
}
function enterStudio() {
  const S = G.studio;
  if (S.mode !== 'off') { S.mode = 'air'; S.t = 0; S.len = G.flags.visitedStudio ? rand(8, 10) : 7; S.talkT = 0.8; }
  if (!G.flags.visitedStudio) {
    G.flags.visitedStudio = true;
    banner(G.view ? 'The Bleat: News We Feed You' : 'The Bleat', 'When the ON AIR light is on, the cameras catch anything that moves. Move during the commercial breaks.', 3.6);
  }
}
function studioObjective() {
  const bw = G.sheep.find((s) => s.id === 'bellwether');
  if (bw && bw.state === 'woke') { setObjective('Bellwether is taking the truth outside.', 'Head back to the ranch.'); return; }
  const tip = 'Hold still while ON AIR. Move during the commercial breaks.';
  if (!G.proof.has('cuecards')) setObjective("Find out who writes Bellwether's news.", tip + ' The cue cards come in under the back door.');
  else setObjective('Show Bellwether the cue cards.', 'Wait for a commercial break to talk to him. ' + tip);
}
// called by wakeSheep once Bellwether is convinced
function bellwetherRings(s) {
  G.studio.mode = 'off';
  s.hopT = 1; Snd.play('bell'); later(0.8, () => Snd.play('bell'));
  say(s, 'This just in: the news is written by wolves!', 2.6);
  unlock('ringleader');
  later(1.4, () => toast('Woke +2', "Bellwether's viewers heard the bell."));
  // around the end of the desk, then down past the cameras to the door
  const leg = (x, y, then) => ({ x, y, speed: 118, then });
  later(2.6, () => { if (regionOf(s.x, s.y) === 'studio') s.run = leg(NEWSDESK.x1 + 34, s.y, () => { s.run = leg(NEWSDESK.x1 + 34, 2760, () => { s.run = leg(SET.exit, 2900, () => studioExit(s, true)); }); }); });
  updateFleeceObjective();
}
function studioExit(s, puff) {
  s.run = null; s.home = 'ranch';
  s.x = s.hx = s.tx = STUDIO.door + 64; s.y = s.hy = s.ty = 1012; s.wander = 24; s.idle = rand(0.4, 1.2); s.grazing = false;
  if (puff) for (let i = 0; i < 6; i++) spawn({ type: 'dust', x: STUDIO.door + rand(-18, 18), y: 1000 + rand(-4, 4), vx: rand(-30, 30), vy: rand(-30, -5), life: 0.6, size: rand(4, 7) });
  if (G.phase === 'herd' || G.phase === 'bigbaa') startFollowing(s);
}
// the finale started while he was still inside
function studioHerd() {
  const s = G.sheep.find((q) => q.id === 'bellwether');
  if (s && s.state === 'woke' && regionOf(s.x, s.y) === 'studio') studioExit(s, true);
}

/* drawing */
Object.assign(PAL_SRC, {
  stFloor: ['#4B3C86', '#3B3A37', '#4B3C86'], stFloor2: ['#5A4A9A', '#44433F', '#5A4A9A'], stWall: ['#FFE4F3', '#77736C', '#FFE4F3'], stWallSh: ['#F2BFDD', '#5F5B55', '#F2BFDD'],
  stDesk: ['#5B5BD6', '#4A4B52', '#5B5BD6'], stDeskSh: ['#4545B8', '#3B3C42', '#4545B8'], stLamp: ['#FFF4B8', '#D8D2B8', '#FFF4B8'], onair: ['#FF3B4E', '#D23A32', '#FF3B4E'],
  stOut: ['#A98BE0', '#6C6862', '#B59A7A'], stOutSh: ['#8F70CC', '#5A5651', '#9C8264'],
});
for (const k of Object.keys(PAL_SRC)) if (!PAL[k]) PAL[k] = PAL_SRC[k].map(hex);
const onAirLit = () => G.studio && (G.studio.mode === 'air' || G.studio.mode === 'wrap');

function drawStudioOutside() {
  const { x0, x1, y0, y1, door } = STUDIO, top = y1 - 74, tr = isTruthPass(), t = G.clock;
  // antenna and dish on the roof
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1 - 34, top - 20); ctx.lineTo(x1 - 34, top - 66); ctx.moveTo(x1 - 44, top - 52); ctx.lineTo(x1 - 24, top - 52); ctx.moveTo(x1 - 40, top - 62); ctx.lineTo(x1 - 28, top - 62); ctx.stroke();
  if (!RM && !tr) { const k = (t * 0.8) % 1; ctx.strokeStyle = 'rgba(255,95,162,' + (1 - k).toFixed(2) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x1 - 34, top - 66, 4 + k * 12, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  fillE('foilSh', x0 + 30, top - 24, 13, 9, -0.5); fillE('foil', x0 + 31, top - 25, 10, 7, -0.5);
  fillR('stOutSh', x0 - 6, y0 - 22, x1 - x0 + 12, top - y0 + 26, 4);
  fillR('stOut', x0, top, x1 - x0, y1 - top); fillR('stOutSh', x0, top, x1 - x0, 6);
  fillR('wood', door - 40, top - 40, 80, 36, 5); fillR('board', door - 37, top - 37, 74, 30, 4);
  text('THE BLEAT', door, top - 26, 13, tr ? F_TRUTH : F_CANDY, P('ink'), 66);
  signText('NEWS YOU CAN GRAZE TO', 'NEWS WE FEED YOU', door, top - 13, 7, 68, 'sackInk');
  // ON AIR light by the door
  const lit = G.studio && G.studio.mode !== 'off'; // the station is always broadcasting, until Bellwether tells the truth
  fillR('nose', x1 - 46, top + 12, 36, 14, 3); fillR(lit ? 'onair' : 'iron', x1 - 44, top + 14, 32, 10, 2);
  text('ON AIR', x1 - 28, top + 19.5, 6.5, F_BODY, lit ? '#FFFFFF' : 'rgba(255,255,255,0.45)', 28, 'center', '700');
  fillR('trim', door - 17, y1 - 44, 34, 44, 3); fillR('stDeskSh', door - 14, y1 - 41, 28, 41, 2); fillC('tag', door + 8, y1 - 20, 1.8);
  fillR('trim', x0 + 12, top + 14, 30, 22, 3); fillR('glass', x0 + 15, top + 17, 24, 16, 2);
  if (tr) { ctx.fillStyle = 'rgba(20,20,20,0.5)'; circ(x0 + 27, top + 27, 5); ctx.fill(); }
}
function drawStudioGround() {
  const R = REGIONS.studio;
  if (!regionInVB({ x0: R.x0 - 320, y0: R.y0 - 230, x1: R.x1 + 320, y1: R.y1 + 260 })) return;
  ctx.fillStyle = P('chOut'); ctx.fillRect(R.x0 - 320, R.y0 - 230, R.x1 - R.x0 + 640, R.y1 - R.y0 + 490);
  const { x0, y0, x1, y1 } = SET;
  fillR('stFloor', x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = P('stFloor2'); ctx.lineWidth = 2; ctx.beginPath();
  for (let x = x0 + 50; x < x1; x += 50) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = y0 + 50; y < y1; y += 50) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  // tape marks where the cameras stand, and a rug under the desk
  ctx.strokeStyle = 'rgba(255,225,77,0.6)'; ctx.lineWidth = 3;
  for (const [cx, cy] of CAMS) { ctx.beginPath(); ctx.moveTo(cx - 24, cy + 18); ctx.lineTo(cx - 12, cy + 18); ctx.moveTo(cx + 12, cy + 18); ctx.lineTo(cx + 24, cy + 18); ctx.stroke(); }
  fillR('carpetSh', 560, 2590, 280, 90, 6); fillR('carpet', 566, 2596, 268, 78, 5);
  fillR('chWallSh', 230, 2420, 20, 530); fillR('chWallSh', 1150, 2420, 20, 530);
}
function drawStudioBackWall() {
  const tr = isTruthPass(), t = G.clock, lit = onAirLit();
  fillR('stWall', 230, 2416, 940, 114); fillR('stWallSh', 230, 2496, 940, 34); fillR('trim', 230, 2494, 940, 3);
  // the big logo behind the desk
  fillR('stDesk', 560, 2430, 280, 62, 8); fillR('stDeskSh', 566, 2436, 268, 50, 6);
  text('THE BLEAT', 700, 2453, 26, tr ? F_TRUTH : F_CANDY, '#FFFFFF', 250);
  signText('NEWS YOU CAN GRAZE TO', 'NEWS WE FEED YOU', 700, 2478, 11, 250, 'stLamp');
  // the ON AIR sign
  fillR('nose', 360, 2440, 120, 40, 6); fillR(lit ? 'onair' : 'iron', 365, 2445, 110, 30, 4);
  if (lit) { const g = ctx.createRadialGradient(420, 2460, 4, 420, 2460, 90); g.addColorStop(0, 'rgba(255,59,78,0.35)'); g.addColorStop(1, 'rgba(255,59,78,0)'); ctx.fillStyle = g; circ(420, 2460, 90); ctx.fill(); }
  text('ON AIR', 420, 2461, 18, F_BODY, lit ? '#FFFFFF' : 'rgba(255,255,255,0.35)', 100, 'center', '700');
  // the back door the cue cards come under
  const dx = SET.cueX;
  fillR('trim', dx - 30, 2462, 60, 68, 3); fillR('woodSh', dx - 26, 2466, 52, 64, 2); fillC('tag', dx + 16, 2500, 2);
  fillR('board', dx - 28, 2446, 56, 13, 2); signText('STAFF ONLY', 'WOLVES ONLY', dx, 2452.5, 8, 50);
  if (tr && !G.proof.has('cuecards')) {
    // a paw slides a fresh card under the door, again and again
    const k = RM ? 0.5 : (t * 0.45) % 1, push = Math.sin(Math.min(1, k * 1.6) * Math.PI) * 16;
    ctx.fillStyle = '#F2EEDF'; ctx.save(); ctx.translate(dx - 6, 2532 + push * 0.6); ctx.rotate(-0.15); ctx.fillRect(-9, -3, 18, 10); ctx.restore();
    fillE('fur', dx + 6, 2530 + push, 9, 5); fillE('furLt', dx + 10, 2532 + push, 4, 3);
    ctx.strokeStyle = P('teeth'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(dx + 13, 2531 + push); ctx.lineTo(dx + 17, 2533 + push); ctx.stroke();
  }
  // studio lights
  for (const lx of [320, 1000]) { fillR('iron', lx - 2, 2416, 4, 26); fillE('iron', lx, 2446, 16, 9); fillE('stLamp', lx, 2450, 11, 4); }
}
function drawNewsDesk() {
  const { x0, y0, x1, y1 } = NEWSDESK, tr = isTruthPass();
  fillR('stDeskSh', x0 - 4, y0 - 8, x1 - x0 + 8, y1 - y0 + 12, 6); fillR('stDesk', x0, y0 - 6, x1 - x0, y1 - y0 + 4, 5);
  fillR('trim', x0 + 6, y0 - 9, x1 - x0 - 12, 4, 2);
  signText('THE BLEAT', "READ, DON'T THINK", (x0 + x1) / 2, y0 + 8, 12, x1 - x0 - 24, 'stLamp');
  // papers and a microphone
  fillR('apron', x0 + 30, y0 - 14, 26, 8, 1); fillR('apron', x0 + 34, y0 - 16, 26, 8, 1);
  fillR('iron', (x0 + x1) / 2 + 40, y0 - 30, 3, 22); fillE('nose', (x0 + x1) / 2 + 41.5, y0 - 32, 4, 6);
  if (tr) text('*READ*', x0 + 46, y0 - 21, 6, F_TRUTH, P('ink'), 30);
}
function drawStudioFrontWall() {
  fillR('stWallSh', 230, 2928, 940, 26); fillR('stWall', 230, 2923, 940, 7);
  fillR('wood', SET.exit - 52, 2918, 104, 36, 3); fillR('woodSh', SET.exit - 47, 2922, 46, 32, 2); fillR('woodSh', SET.exit + 1, 2922, 46, 32, 2);
  fillR('wood', SET.exit - 38, 2898, 76, 17, 3); fillR('board', SET.exit - 35, 2900, 70, 13, 2);
  signText('EXIT', 'BACK TO THE PASTURE', SET.exit, 2906.5, 9, 64);
}
// a studio camera on a tripod, seen from behind, pointing at the desk
function drawCameraRig(w) {
  const lit = onAirLit(), fy = w.y + 30; // w.y is the camera head; the tripod stands 30 px below it
  ctx.save(); ctx.translate(w.x, fy);
  ctx.fillStyle = P('shadow'); ell(0, 2, 20, 6); ctx.fill();
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(0, -30); ctx.lineTo(14, 2); ctx.moveTo(0, -30); ctx.lineTo(0, 4); ctx.stroke();
  ctx.translate(0, -30); ctx.rotate(w.dir + Math.PI / 2); // turn the camera on its head, lens toward where it looks
  fillR('nose', -11, -14, 22, 24, 4); fillR('iron', -8, -24, 16, 12, 3); fillE('glass', 0, -24, 6, 3);
  ctx.restore();
  fillC(lit ? 'onair' : 'iron', w.x + 13, w.y + 2, 3);
  if (lit) text('REC', w.x + 13, w.y - 8, 7, F_BODY, P('onair'), 20, 'center', '700');
}
// the cameras' view: a pale light while ON AIR, a faint outline during the break
function drawCamCone(w) {
  const live = onAirLit(), N = 22, x = w.x, y = w.y;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i <= N; i++) { const a = w.dir - w.half + (2 * w.half * i) / N, L = rayLen(x, y, a, w.range); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
  ctx.closePath();
  if (live) {
    const g = ctx.createRadialGradient(x, y, 8, x, y, w.range);
    g.addColorStop(0, 'rgba(255,250,225,0.42)'); g.addColorStop(1, 'rgba(255,250,225,0.08)');
    ctx.fillStyle = g; ctx.fill();
    if (w.alert > 0.04) { ctx.fillStyle = 'rgba(220,60,40,' + (w.alert * 0.4).toFixed(2) + ')'; ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,59,78,0.75)'; ctx.lineWidth = 1.6; ctx.stroke();
  } else {
    ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.restore();
  }
}
// "ON AIR" / "Commercial break": a caption pinned to the screen with a countdown, like the chapel's prayer caption
function drawStudioCaption() {
  const S = G.studio, p = G.player;
  if (G.ch !== 1 || !S || S.mode === 'off' || G.mode !== 'play' || G.modal || G.fade || G.phase !== 'fleecing' || regionOf(p.x, p.y) !== 'studio') return;
  const tr = G.view === 1, air = S.mode === 'air', wrap = S.mode === 'wrap';
  const line = air ? 'ON AIR' : wrap ? "We'll be right back..." : 'Commercial break';
  const sub = air ? 'Hold still while the cameras roll.' : wrap ? 'Get ready to move.' : 'Move now. Bellwether can talk.';
  const left = clamp(air ? 1 - S.t / S.len : wrap ? 1 - S.t / 2 : 1 - S.t / 6, 0, 1);
  const hudH = parseFloat(app.style.getPropertyValue('--hud-h')) || 0;
  const font = tr ? F_TRUTH : F_BODY, wt = tr ? '' : '700', ink = tr ? '#22211F' : '#3E1F7A', seen = air && G.maxAlert > 0.05;
  ctx.font = fontStr(18, font, wt); const w1 = ctx.measureText(line).width;
  ctx.font = fontStr(13.5, font, wt); const w2 = ctx.measureText(sub).width;
  const w = Math.min(view.w - 24, Math.max(w1, w2) + 44), h = 66, x = view.w / 2 - w / 2, y = view.w >= 1100 ? 20 : touchMode ? view.h - h - 250 : Math.max(hudH + 14, view.h - h - 96);
  ctx.fillStyle = air ? '#FF3B4E' : tr ? '#E8E4D8' : '#FFFFFF'; ctx.strokeStyle = seen ? '#7A0F18' : ink; ctx.lineWidth = seen ? 3 : 2;
  rrect(x, y, w, h, tr ? 3 : 16); ctx.fill(); ctx.stroke();
  const fg = air ? '#FFFFFF' : ink;
  text(line, view.w / 2, y + 20, 18, font, fg, w - 24, 'center', wt);
  text(sub, view.w / 2, y + 40, 13.5, font, air ? 'rgba(255,255,255,0.9)' : tr ? '#55524D' : '#7A5AC8', w - 24, 'center', wt);
  ctx.fillStyle = air ? 'rgba(0,0,0,0.18)' : tr ? 'rgba(0,0,0,0.12)' : 'rgba(62,31,122,0.12)'; rrect(x + 18, y + h - 13, w - 36, 5, 2.5); ctx.fill();
  ctx.fillStyle = air ? '#FFFFFF' : wrap ? (tr ? '#8A857C' : '#FFB84D') : tr ? '#C9A92E' : '#5FC96E'; rrect(x + 18, y + h - 13, (w - 36) * left, 5, 2.5); ctx.fill();
}
addStatic(STUDIO.y1, STUDIO.x0 - 12, STUDIO.y0 - 110, STUDIO.x1 + 12, STUDIO.y1 + 6, drawStudioOutside);
addStatic(2530, 226, 2410, 1174, 2540, drawStudioBackWall);
addStatic(NEWSDESK.y1, NEWSDESK.x0 - 8, NEWSDESK.y0 - 40, NEWSDESK.x1 + 8, NEWSDESK.y1 + 8, drawNewsDesk);
addStatic(2954, 226, 2890, 1174, 2956, drawStudioFrontWall);

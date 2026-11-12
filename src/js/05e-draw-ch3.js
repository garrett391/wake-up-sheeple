/* ---------------- drawing Chapter 3 ---------------- */
// like chapter 2, chapter 3 swaps between real (glasses off) and truth (glasses on)
for (const [k, real, truth] of [
  ['bigWall', '#F4EEE2', '#7A766E'], ['bigWallSh', '#DCD2C0', '#64615A'], ['bigRoof', '#4E6B58', '#3C3A37'], ['bigRoofSh', '#3E5646', '#302E2B'],
  ['curtain', '#F2E6CC', '#55524C'], ['curtainSh', '#DCCBA8', '#45423D'], ['lampGlow', '#FFE9A8', '#FFF6D0'],
  ['straw', '#E6C25A', '#9A9070'], ['strawSh', '#C9A23E', '#7E765C'], ['sackF', '#C9A878', '#8A8274'],
  ['hound', '#B9824F', '#7A7064'], ['houndSh', '#9A683C', '#625A50'], ['houndEar', '#6E4A2E', '#4A443D'], ['houndW', '#F4EEE2', '#C9C4BA'],
  ['overall', '#3E6EA8', '#4A4C52'], ['overallSh', '#2F5684', '#3A3C42'], ['plaid', '#C0453A', '#5E5650'],
  ['floorH', '#B98E62', '#57524B'], ['floorH2', '#A67C52', '#4D4842'], ['wallH', '#EADFC8', '#3D3A36'], ['wallHSh', '#D2C4A6', '#312E2B'],
  ['rugH', '#8E3B32', '#5E2A24'], ['rugH2', '#74302A', '#4A201C'], ['deskH', '#6E4B30', '#3A2A20'], ['deskHSh', '#563A24', '#2C2018'],
  ['camRed', '#B98E62', '#E0352B'],
]) { PAL_SRC[k] = [real, truth, real]; PAL[k] = PAL_SRC[k].map(hex); }
const ch3Truth = () => isTruthPass() || G.disguisesGone;

/* ---------------- the hill ---------------- */
const HILL_TUFTS = [], HILL_FLOWERS = [];
for (let i = 0; i < 260; i++) { const x = 60 + R() * 1380, y = 3270 + R() * 600; if (!blockedAt(x, y, 8)) HILL_TUFTS.push([x, y]); }
for (let i = 0; i < 90; i++) { const x = 70 + R() * 1360, y = 3290 + R() * 580; if (Math.abs(x - 750) > 50) HILL_FLOWERS.push({ x, y, c: (R() * 3) | 0 }); }
const HILL_PATH = [[750, 3930], [750, 3810], [668, 3742], [676, 3650], [716, 3560], [750, 3520], [750, 3270]];
function drawCh3Grounds() {
  if (G.ch !== CH3) return;
  if (regionInVB(REGIONS.hill)) drawHillGround();
  if (regionInVB(REGIONS.house)) drawHouseGround();
}
function drawHillGround() {
  const R3 = REGIONS.hill, tr = isTruthPass();
  ctx.fillStyle = P('out'); ctx.fillRect(R3.x0 - 320, R3.y0 - 240, R3.x1 - R3.x0 + 640, R3.y1 - R3.y0 + 480);
  ctx.fillStyle = P('out2'); for (let x = R3.x0 - 300; x < R3.x1 + 300; x += 140) ctx.fillRect(x, R3.y0 - 240, 60, 290);
  fillR('grass', 40, 3236, 1420, 690);
  ctx.fillStyle = P('grass2'); for (let x = 70; x < 1440; x += 116) ctx.fillRect(x, 3262, 52, 640);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(HILL_PATH[0][0], HILL_PATH[0][1]);
  for (let i = 1; i < HILL_PATH.length; i++) ctx.lineTo(HILL_PATH[i][0], HILL_PATH[i][1]);
  ctx.strokeStyle = P('path'); ctx.lineWidth = 40; ctx.stroke(); ctx.strokeStyle = P('path2'); ctx.lineWidth = 24; ctx.stroke();
  ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.6; ctx.beginPath();
  for (const t of HILL_TUFTS) if (inVB(t[0], t[1])) tuftPath(t[0], t[1]);
  ctx.stroke();
  for (const f of HILL_FLOWERS) {
    if (!inVB(f.x, f.y)) continue;
    if (tr) fillC('rock2', f.x, f.y - 3, 1.6);
    else { ctx.fillStyle = WILD_COLS[f.c]; circles([[f.x - 2, f.y - 4, 1.7], [f.x + 2, f.y - 4, 1.7], [f.x, f.y - 6, 1.7], [f.x, f.y - 2, 1.7]]); ctx.fill(); }
  }
  // porch steps
  fillR('board', BIGH.door - 46, BIGH.y1, 92, 8, 2); fillR('woodSh', BIGH.door - 50, BIGH.y1 + 8, 100, 6, 2);
  // a "seen" mark under each window you've looked through
  for (const wd of WINDOWS3) if (G.proof.has(wd.id)) { ctx.strokeStyle = tr ? 'rgba(255,225,120,0.6)' : 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ell(wd.x, WIN_Y + 4, 20, 6); ctx.stroke(); }
}

/* the Big House, outside */
function drawBigHouse() {
  const { x0, x1, y1, door } = BIGH, top = 3122, tr = isTruthPass(), t = G.clock, mv = RM ? 0 : 1;
  // chimney, with smoke (or with wires) going up
  fillR('bigRoofSh', 900, 3040, 26, 60, 2); fillR('bigRoof', 896, 3036, 34, 8, 2);
  if (tr) { ctx.strokeStyle = 'rgba(236,232,216,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(906 + i * 5, 3036); ctx.lineTo(906 + i * 5 + Math.sin(t + i) * 3 * mv, 2990); } ctx.stroke(); }
  else for (let i = 0; i < 3; i++) { const k = (t * 0.25 * mv + i / 3) % 1; ctx.fillStyle = 'rgba(235,235,235,' + (0.45 * (1 - k)).toFixed(2) + ')'; circ(913 + k * 16, 3032 - k * 36, 6 + k * 8); ctx.fill(); }
  // roof
  ctx.fillStyle = P('bigRoofSh'); ctx.beginPath(); ctx.moveTo(x0 - 22, top + 6); ctx.lineTo(x0 + 50, 3062); ctx.lineTo(x1 - 50, 3062); ctx.lineTo(x1 + 22, top + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P('bigRoof'); ctx.beginPath(); ctx.moveTo(x0 - 14, top + 2); ctx.lineTo(x0 + 54, 3068); ctx.lineTo(x1 - 54, 3068); ctx.lineTo(x1 + 14, top + 2); ctx.closePath(); ctx.fill();
  for (const dx of [610, 890]) { fillR('bigWall', dx - 22, 3078, 44, 34, 3); fillR('trim', dx - 16, 3084, 32, 24, 2); fillR(tr ? 'glass' : 'curtain', dx - 13, 3087, 26, 18, 1); }
  // walls
  fillR('bigWall', x0, top, x1 - x0, y1 - top);
  ctx.strokeStyle = P('bigWallSh'); ctx.lineWidth = 1.3; ctx.beginPath(); for (let y = top + 10; y < y1; y += 10) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); } ctx.stroke();
  fillR('trim', x0, top, x1 - x0, 5);
  // sign
  fillR('wood', door - 82, top + 10, 164, 24, 4); fillR('board', door - 78, top + 13, 156, 18, 3);
  text(tr ? 'HEAD OFFICE' : 'THE BIG HOUSE', door, top + 22.5, 13, tr ? F_TRUTH : F_BODY, P('ink'), 146, 'center', tr ? '' : '700');
  // porch
  fillR('bigRoofSh', door - 74, 3196, 148, 10, 2); for (const px of [door - 68, door + 64]) fillR('trim', px, 3204, 5, y1 - 3204);
  // door
  const open = G.flags.march;
  fillR('woodSh', door - 22, 3210, 44, y1 - 3210, 3);
  if (open) fillR('farmOut', door - 18, 3214, 36, y1 - 3214, 2); else { fillR('deskH', door - 18, 3214, 36, y1 - 3214, 2); fillC('tag', door + 11, 3240, 2); }
  fillR('board', door - 20, y1 - 2, 40, 5, 1); text(tr ? 'WE KNOW' : 'WELCOME', door, y1 + 0.5, 5.5, tr ? F_TRUTH : F_BODY, P('ink'), 36, 'center', tr ? '' : '700');
  // the four windows
  for (const wd of WINDOWS3) drawBigWindow(wd, tr);
}
function drawBigWindow(wd, tr) {
  const x = wd.x, y0 = 3184, w = 58, h = 48;
  fillR('trim', x - w / 2 - 4, y0 - 4, w + 8, h + 8, 3);
  fillR(tr ? 'glass' : 'lampGlow', x - w / 2, y0, w, h, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y0, w, h); ctx.clip();
  if (tr) drawWindowInside(wd.id, x, y0 + h);
  else {
    // lace curtains, drawn shut
    for (const s of [-1, 1]) {
      ctx.fillStyle = P('curtain'); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + s * (w / 2), y0); ctx.lineTo(x + s * (w / 2), y0 + h); ctx.quadraticCurveTo(x + s * 6, y0 + h - 4, x, y0 + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = P('curtainSh'); ctx.lineWidth = 1; ctx.beginPath(); for (let i = 1; i < 4; i++) { const xx = x + s * i * 7; ctx.moveTo(xx, y0); ctx.lineTo(xx + s * 2, y0 + h); } ctx.stroke();
    }
  }
  ctx.restore();
  fillR('trim', x - 2, y0, 4, h); fillR('woodSh', x - w / 2 - 6, y0 + h + 4, w + 12, 6, 2);
  if (!tr) { ctx.fillStyle = '#E8735A'; circles([[x - 18, y0 + h + 3, 3], [x - 6, y0 + h + 2, 3.4], [x + 8, y0 + h + 3, 3], [x + 19, y0 + h + 2, 3.2]]); ctx.fill(); }
}
// what the glasses show through each window
function drawWindowInside(id, x, yb) {
  ctx.fillStyle = 'rgba(30,28,26,0.35)'; ctx.fillRect(x - 30, yb - 50, 60, 50);
  if (id === 'kitchen') {
    fillR('deskH', x - 28, yb - 12, 56, 12);
    [['#C9A456', 'CC'], ['#9C9A94', 'NEW'], ['#B9B5AA', 'F.O.']].forEach(([c, l], i) => { ctx.fillStyle = c; ctx.fillRect(x - 22 + i * 16, yb - 32, 12, 20); text(l, x - 16 + i * 16, yb - 22, 4.5, F_TRUTH, '#22211F', 11); });
  } else if (id === 'radio') {
    fillR('deskH', x - 28, yb - 12, 56, 12);
    fillR('iron', x - 3, yb - 30, 6, 18, 2); fillC('iron', x, yb - 33, 5);
    for (let i = 0; i < 4; i++) { fillR('board', x - 26 + i * 7, yb - 46, 5, 9); fillR('board', x + 12 + (i % 2) * 7, yb - 46 + (i >> 1) * 10, 5, 9); }
  } else if (id === 'records') {
    for (let i = 0; i < 3; i++) { fillR('iron', x - 27 + i * 19, yb - 44, 16, 44, 1); for (let j = 0; j < 4; j++) fillR('steth', x - 25 + i * 19, yb - 41 + j * 10, 12, 7, 1); }
    fillR('board', x + 2, yb - 22, 14, 8, 1);
  } else {
    fillR('deskH', x - 28, yb - 12, 56, 12);
    ctx.strokeStyle = '#151413'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const gx = x - 20 + i * 13; ell(gx - 2.5, yb - 16, 2.4, 1.8); ctx.stroke(); ell(gx + 2.5, yb - 16, 2.4, 1.8); ctx.stroke(); }
    fillR('board', x - 16, yb - 42, 32, 12, 1); text('1 PER GEN.', x, yb - 36, 4.6, F_TRUTH, '#22211F', 30);
  }
}
// the Farmer's white fence. Through the glasses it is the same electric wire as the ranch's.
const HILL_FENCE = [];
function fenceRun3(x0, y0, x1, y1, skip) {
  const horiz = y0 === y1, len = horiz ? x1 - x0 : y1 - y0, n = Math.round(len / 29), step = len / n;
  for (let i = 0; i < n; i++) {
    const a = (horiz ? x0 : y0) + i * step, mid = a + step / 2;
    if (skip && mid > skip[0] && mid < skip[1]) continue;
    const seg = horiz ? { x: a, y: y0, len: step, v: false } : { x: x0, y: a, len: step, v: true };
    seg.sortY = horiz ? y0 : a + step / 2; seg.delay = 0;
    seg.bx0 = seg.x - 6; seg.by0 = seg.y - 34; seg.bx1 = seg.x + (horiz ? step : 0) + 6; seg.by1 = seg.y + (horiz ? 4 : step + 4);
    HILL_FENCE.push(seg);
  }
}
fenceRun3(40, 3252, BIGH.x0 - 4, 3252); fenceRun3(BIGH.x1 + 4, 3252, 1460, 3252);
fenceRun3(40, 3252, 40, 3904); fenceRun3(1460, 3252, 1460, 3904); fenceRun3(40, 3904, 1460, 3904, [700, 800]);

/* the searchlight on its post */
function drawLampPost(w) {
  const tr = isTruthPass();
  fillE('iron', 0, -1, 9, 3); fillR('iron', -3, -118, 6, 118, 2);
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -112); ctx.lineTo(10, -112); ctx.stroke();
  ctx.save(); ctx.translate(0, -122);
  fillC('iron', 0, 0, 10);
  ctx.fillStyle = P('lampGlow'); ell(Math.cos(w.dir) * 5.5, Math.sin(w.dir) * 3.8, 6.5, 5.5); ctx.fill();
  if (tr) { fillC('camRed', -6, -7, 1.8); }
  ctx.restore();
}
/* scarecrows: straw to the naked eye, cameras on a pole through the glasses */
function drawScarecrow(w) {
  const tr = ch3Truth(), f = Math.cos(w.dir) < 0 ? -1 : 1, t = G.clock, mv = RM ? 0 : 1;
  fillR('woodSh', -2.5, -64, 5, 64, 1.5);
  fillR('woodSh', -26, -54, 52, 4, 1.5);
  // body: a stuffed shirt, arms out
  fillR('plaid', -12, -58, 24, 26, 5);
  ctx.strokeStyle = P('plaid'); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -52); ctx.lineTo(-24, -50); ctx.moveTo(10, -52); ctx.lineTo(24, -50); ctx.stroke();
  ctx.strokeStyle = P('straw'); ctx.lineWidth = 1.3; ctx.beginPath();
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { ctx.moveTo(s * 27, -50); ctx.lineTo(s * (31 + i), -56 + i * 4 + Math.sin(t * 2 + i) * mv); }
  for (let i = 0; i < 5; i++) { ctx.moveTo(-8 + i * 4, -32); ctx.lineTo(-9 + i * 4.5, -26); }
  ctx.stroke();
  fillR('pants', -10, -40, 20, 8, 2);
  ctx.save(); ctx.translate(0, -72); ctx.scale(f, 1);
  if (tr) {
    fillR('iron', -10, -9, 22, 16, 3); fillC('iron', 13, -1, 6); fillC('camRed', 14.5, -1, 3.4);
    if (!RM && Math.sin(t * 3) > 0) fillC('camRed', -6, -5, 1.6);
    fillR('tag', -8, 8, 12, 4, 1);
  } else {
    fillC('sackF', 0, 0, 11);
    ctx.strokeStyle = P('ink'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(1, -3); ctx.lineTo(4, 0); ctx.moveTo(4, -3); ctx.lineTo(1, 0);
    ctx.moveTo(6, -3); ctx.lineTo(9, 0); ctx.moveTo(9, -3); ctx.lineTo(6, 0); ctx.moveTo(-1, 5); ctx.quadraticCurveTo(4, 8, 9, 4); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.translate(0, -72); strawHat(0, 0); ctx.restore();
}
/* the Farmer's hounds: droopy bassets, and through the glasses, spiked collars */
function drawHound(w) {
  ctx.scale(w.facing || 1, 1);
  const tr = ch3Truth(), moving = w.walk > 0.1, sw = moving ? Math.sin(w.phase) * 2.5 : 0, sit = w.sitting || (w.distracted > 0 && !moving), t = G.clock;
  ctx.strokeStyle = P('hound'); ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, -14); ctx.quadraticCurveTo(-26, -22 + (RM ? 0 : Math.sin(t * 6) * 2), -24, -28); ctx.stroke();
  if (!sit) for (const lx of [-15 + sw, -9 - sw, 9 - sw, 15 + sw]) fillR('houndSh', lx - 2, -8, 5, 8, 2);
  else { fillR('houndSh', 8, -8, 5, 8, 2); fillR('houndSh', 14, -8, 5, 8, 2); fillE('houndSh', -10, -3, 9, 4); }
  ctx.save(); if (sit) { ctx.translate(-4, -2); ctx.rotate(-0.28); }
  fillE('hound', 0, -13, 21, 8.5); fillE('houndW', 6, -9.5, 10, 4);
  ctx.restore();
  const hx = 20, hy = sit ? -26 : -20;
  fillE('hound', hx, hy, 8.5, 7.5); fillE('hound', hx + 8, hy + 3, 6.5, 4.5); fillC('nose', hx + 13.5, hy + 2, 2.2);
  fillE('houndEar', hx - 3, hy + 7, 3.6, 8.5, 0.2);
  fillC('pupil', hx + 3, hy - 2, 1.2); ctx.strokeStyle = P('houndSh'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hx, hy - 4); ctx.lineTo(hx + 5, hy - 3.5); ctx.stroke();
  if (tr) {
    ctx.strokeStyle = P('iron'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx - 6, hy + 4); ctx.lineTo(hx + 1, hy + 9); ctx.stroke();
    ctx.fillStyle = P('foil'); for (let i = 0; i < 3; i++) { const sx = hx - 5 + i * 2.8, sy = hy + 5 + i * 1.8; ctx.beginPath(); ctx.moveTo(sx - 1.2, sy); ctx.lineTo(sx - 2.4, sy - 3); ctx.lineTo(sx + 0.6, sy - 1); ctx.closePath(); ctx.fill(); }
    fillC('tag', hx - 1, hy + 12, 2.2); text('F', hx - 1, hy + 12.2, 3.2, F_TRUTH, '#22211F');
  } else { fillR('band', hx - 6, hy + 4, 7, 3, 1); fillC('tag', hx - 2, hy + 8.5, 1.6); }
}
/* the Farmer. Glasses off: a big kind man in overalls. Glasses on: an old black ram in overalls, with glasses. */
const farmerSheepy = () => ch3Truth();
function drawFarmer(w) {
  if (farmerSheepy()) {
    const k = 1.22, pd = G.playerDark;
    G.playerDark = 0.86;
    try { drawSheep({ id: 'farmer', x: 0, y: 0, facing: w.facing || 1, walk: 0, phase: 0, grazing: false, hopT: w.hopT || 0, specsOn: true, scale: k, caughtFx: 0, state: 'woke' }, true, { portrait: true }); }
    finally { G.playerDark = pd; }
    ctx.save(); ctx.scale((w.facing || 1) * k, k);
    // overalls over the wool
    fillR('overall', -9, -27, 17, 13, 3); fillR('overallSh', -9, -16, 17, 3);
    ctx.strokeStyle = P('overall'); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-7, -26); ctx.lineTo(-11, -34); ctx.moveTo(6, -26); ctx.lineTo(9, -34); ctx.stroke();
    fillC('tag', -6, -23, 1.2); fillC('tag', 5, -23, 1.2);
    if (!w.hatOff) { ctx.translate(15, -36 - (w.hatBounce || 0) * 4); strawHat(0, 0); }
    ctx.restore();
    return;
  }
  ctx.scale((w.facing || 1) * 1.14, 1.14);
  const hy = -60;
  fillR('overall', -8, -26, 7, 26, 2); fillR('overall', 1, -26, 7, 26, 2);
  fillE('boots', -4.5, -1.5, 5.4, 2.8); fillE('boots', 4.5, -1.5, 5.4, 2.8);
  fillR('plaid', -12, -50, 24, 28, 7);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = -9; i < 12; i += 5) { ctx.moveTo(i, -50); ctx.lineTo(i, -24); } ctx.stroke();
  fillR('overall', -9, -42, 18, 22, 3); fillC('tag', -6, -40, 1.4); fillC('tag', 6, -40, 1.4);
  ctx.strokeStyle = P('plaid'); ctx.lineWidth = 6.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, -46); ctx.lineTo(-13, -28); ctx.moveTo(8, -46); ctx.lineTo(13, -28); ctx.stroke();
  fillC('skin', -13, -27, 3.4); fillC('skin', 13, -27, 3.4);
  humanHead('farmer', hy);
  ctx.fillStyle = P('hairG'); ctx.beginPath(); ctx.moveTo(-2, hy + 4); ctx.quadraticCurveTo(4, hy + 16, 11, hy + 4); ctx.quadraticCurveTo(5, hy + 8, -2, hy + 4); ctx.fill();
  if (!w.hatOff) strawHat(hy, (w.hatBounce || 0) * 4);
}
function drawCh3Char(w) {
  if (w.type === 'flood') drawLampPost(w);
  else if (w.type === 'scarecrow') drawScarecrow(w);
  else if (w.type === 'hound') drawHound(w);
  else if (w.type === 'farmer') drawFarmer(w);
}

/* ---------------- the Big House, inside ---------------- */
function drawHouseGround() {
  const R3 = REGIONS.house, { x0, y0, x1, y1 } = HOUSE, tr = isTruthPass();
  ctx.fillStyle = P('farmOut'); ctx.fillRect(R3.x0 - 320, R3.y0 - 240, R3.x1 - R3.x0 + 640, R3.y1 - R3.y0 + 480);
  fillR('floorH', x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = P('floorH2'); ctx.lineWidth = 2; ctx.beginPath();
  for (let y = y0 + 22, r = 0; y < y1; y += 22, r++) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); for (let x = x0 + (r % 2 ? 40 : 100); x < x1; x += 130) { ctx.moveTo(x, y - 22); ctx.lineTo(x, y); } }
  ctx.stroke();
  fillR('rugH2', HOUSE.door - 46, HOUSE.wallY + 14, 92, y1 - HOUSE.wallY - 14); fillR('rugH', HOUSE.door - 40, HOUSE.wallY + 14, 80, y1 - HOUSE.wallY - 14);
  fillR('rugH2', 2160, 3236, 380, 140, 6); fillR('rugH', 2166, 3242, 368, 128, 5);
  if (tr) { ctx.strokeStyle = P('gold'); ctx.lineWidth = 1.5; ctx.strokeRect(2174, 3250, 352, 112); }
}
function drawHouseBackWall() {
  const tr = isTruthPass(), cx = HOUSE.door;
  fillR('wallH', 1780, 3100, 1140, 100); fillR('wallHSh', 1780, 3170, 1140, 30); fillR(tr ? 'gold' : 'trim', 1780, 3168, 1140, 3);
  // the big window behind the desk, curtains shut
  fillR('trim', cx - 92, 3112, 184, 62, 3); fillR('glass', cx - 86, 3116, 172, 54, 2);
  const shut = !G.flags.curtains;
  for (const s of [-1, 1]) {
    const w = shut ? 86 : 20;
    ctx.fillStyle = P('rugH'); ctx.fillRect(s < 0 ? cx - 92 : cx + 92 - w, 3108, w, 70);
    ctx.strokeStyle = P('rugH2'); ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 6; i < w; i += 9) { const xx = s < 0 ? cx - 92 + i : cx + 92 - i; ctx.moveTo(xx, 3108); ctx.lineTo(xx, 3178); } ctx.stroke();
  }
  fillR('gold', cx - 98, 3104, 196, 5, 2);
  // the plan, on an easel chart (or a calendar of farm chores)
  fillR('wood', 2560, 3112, 110, 60, 2); fillR('board', 2564, 3116, 102, 52, 1);
  if (tr) {
    text('THE PLAN', 2615, 3124, 8, F_TRUTH, P('ink'), 90);
    [['YR 1', 'WOLVES'], ['YR 7', 'PIGS'], ['YR 9', 'FARMER'], ['YR 10', '?']].forEach(([a, b], i) => { text(a, 2584, 3136 + i * 8, 6, F_TRUTH, P('ink'), 30); text(b, 2634, 3136 + i * 8, 6, F_TRUTH, i === 3 ? P('band') : P('ink'), 60); });
  } else {
    text('CHORES', 2615, 3124, 8.5, F_BODY, P('ink'), 90, 'center', '700');
    for (let i = 0; i < 4; i++) { fillR('steth', 2576, 3134 + i * 8, 6, 5); ctx.strokeStyle = P('ink'); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(2588, 3137 + i * 8); ctx.lineTo(2650 - i * 6, 3137 + i * 8); ctx.stroke(); }
  }
  // bookshelves
  for (const bx of [1840, 1990]) { fillR('deskH', bx, 3110, 110, 62, 2); for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) fillR(['band', 'overall', 'tag', 'steth'][(i + r) % 4], bx + 6 + i * 11, 3115 + r * 19, 8, 15, 1); }
}
function drawHouseInnerWall() {
  const tr = isTruthPass(), [d0, d1] = HOUSE.sd;
  for (const [a, b] of [[1800, d0], [d1, 2900]]) { fillR('wallHSh', a, HOUSE.wallY - 46, b - a, 60); fillR('wallH', a, HOUSE.wallY - 52, b - a, 8, 2); }
  for (const x of [d0, d1]) fillR(tr ? 'gold' : 'deskH', x - 3, HOUSE.wallY - 58, 6, 72, 2);
  fillR('wood', HOUSE.door - 38, HOUSE.wallY - 66, 76, 14, 3); fillR('board', HOUSE.door - 35, HOUSE.wallY - 64, 70, 10, 2);
  text(tr ? 'MANAGEMENT' : 'STUDY', HOUSE.door, HOUSE.wallY - 58.5, 7, tr ? F_TRUTH : F_BODY, P('ink'), 64, 'center', tr ? '' : '700');
  // the portrait gallery, facing the hall
  [[1960, 'THE FARMER', 'YEAR 1'], [2140, 'THE FARMER', 'YEAR 9'], [2600, 'THE FARMER', 'NEXT']].forEach(([px, a, b], i) => {
    fillR(tr ? 'gold' : 'deskH', px - 34, HOUSE.wallY - 44, 68, 46, 3); fillR(tr ? 'farmOut' : 'glass', px - 29, HOUSE.wallY - 39, 58, 32, 2);
    ctx.save(); ctx.beginPath(); ctx.rect(px - 29, HOUSE.wallY - 39, 58, 32); ctx.clip();
    if (i < 2) {
      if (tr) { ctx.translate(px - 4, HOUSE.wallY - 2); ctx.scale(0.62, 0.62); const pd = G.playerDark; G.playerDark = i === 0 ? 0.6 : 0.86; try { drawSheep({ id: 'farmer', x: 0, y: 0, facing: 1, walk: 0, phase: 0, grazing: false, hopT: 0, specsOn: true, scale: 1, caughtFx: 0, state: 'woke' }, true, { portrait: true }); } finally { G.playerDark = pd; } if (i === 1) { ctx.translate(15, -36); strawHat(0, 0); } }
      else { ctx.translate(px, HOUSE.wallY + 26); ctx.scale(0.7, 0.7); fillR('plaid', -12, -50, 24, 28, 7); humanHead('farmer', -60); strawHat(-60, 0); }
    } else if (!tr) { ctx.translate(px, HOUSE.wallY + 26); ctx.scale(0.7, 0.7); fillR('plaid', -12, -50, 24, 28, 7); humanHead('farmer', -60); strawHat(-60, 0); }
    ctx.restore();
    fillR('board', px - 30, HOUSE.wallY + 2, 60, 10, 2); text(tr ? b : a, px, HOUSE.wallY + 7, 6, tr ? F_TRUTH : F_BODY, P(tr && i === 2 ? 'band' : 'ink'), 56, 'center', tr ? '' : '700');
  });
}
function drawHouseFrontWall() {
  fillR('wallHSh', 1780, 3798, 1140, 26); fillR('wallH', 1780, 3793, 1140, 7);
  fillR('deskH', HOUSE.door - 44, 3790, 88, 34, 3); fillR('deskHSh', HOUSE.door - 39, 3794, 38, 30, 2); fillR('deskHSh', HOUSE.door + 1, 3794, 38, 30, 2);
}
function drawFarmerDesk() {
  const { x0, y0, x1, y1 } = FDESK, tr = isTruthPass();
  fillR('deskHSh', x0, y0 - 10, x1 - x0, y1 - y0 + 10, 4); fillR('deskH', x0 + 3, y0 - 8, x1 - x0 - 6, 16, 3);
  fillR('board', x0 + 18, y0 - 12, 30, 9, 1); fillR('board', x0 + 22, y0 - 14, 30, 9, 1);
  if (tr) { text('A MESSAGE FROM THE FARMER', x0 + 37, y0 - 9.5, 2.6, F_TRUTH, P('ink'), 28); fillR('iron', x1 - 40, y0 - 22, 5, 14, 2); fillC('iron', x1 - 37.5, y0 - 24, 4); }
  else { fillE('glass', x1 - 36, y0 - 9, 7, 4); fillR('apron', x1 - 64, y0 - 14, 14, 9, 1); }
}
function drawGlassesBox() {
  const { x0, y0, x1, y1 } = GBOX, tr = isTruthPass();
  fillR('woodSh', x0, y0 - 20, x1 - x0, y1 - y0 + 20, 3); fillR('wood', x0 + 3, y0 - 18, x1 - x0 - 6, 16, 2);
  ctx.strokeStyle = '#151413'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) { const gx = x0 + 18 + i * 21; ell(gx - 3.5, y0 - 12, 3.2, 2.4); ctx.stroke(); ell(gx + 3.5, y0 - 12, 3.2, 2.4); ctx.stroke(); }
  fillR('board', x0 + 10, y1 - 8, x1 - x0 - 20, 9, 1);
  text(tr ? 'FOR THE EAST FENCE' : 'READING GLASSES', (x0 + x1) / 2, y1 - 3.5, 5.5, tr ? F_TRUTH : F_BODY, P('ink'), x1 - x0 - 24, 'center', tr ? '' : '700');
}
// the hat rack: coats and hats to the naked eye; through the glasses, every disguise on the farm
function drawHatRack() {
  const { x, y } = HATRACK, tr = isTruthPass();
  fillE('deskHSh', x, y, 14, 4); fillR('deskH', x - 2.5, y - 86, 5, 86, 2);
  ctx.strokeStyle = P('deskH'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - 16, y - 80); ctx.lineTo(x + 16, y - 72); ctx.moveTo(x + 16, y - 80); ctx.lineTo(x - 16, y - 72); ctx.stroke();
  if (tr) {
    ctx.save(); ctx.translate(x - 14, y - 70); ctx.scale(0.6, 0.6); strawHat(0, 0); ctx.restore();
    ctx.save(); ctx.translate(x + 14, y - 74); ctx.scale(0.55, 0.55); bonnetFront(0, 0); ctx.restore();
    fillR('band', x - 4, y - 66, 3, 14); fillR('apron', x + 4, y - 64, 6, 10, 1);
  } else { fillR('coat', x - 14, y - 76, 12, 30, 4); fillR('plaid', x + 3, y - 74, 12, 26, 4); ctx.save(); ctx.translate(x, y - 88); ctx.scale(0.6, 0.6); strawHat(0, 0); ctx.restore(); }
}

for (const d of [
  addStatic(BIGH.y1 + 2, BIGH.x0 - 40, 2980, BIGH.x1 + 40, BIGH.y1 + 16, drawBigHouse),
  ...HEDGES3.map((h) => addStatic(h[3], h[0] - 6, h[1] - 32, h[2] + 6, h[3] + 2, () => drawHedgeBox(h))),
  ...HILL_FENCE.map((seg) => addStatic(seg.sortY, seg.bx0, seg.by0, seg.bx1, seg.by1, () => drawFenceSeg(seg))),
  addStatic(3200, 1776, 3090, 2924, 3202, drawHouseBackWall),
  addStatic(HOUSE.wallY + 14, 1796, HOUSE.wallY - 70, 2904, HOUSE.wallY + 16, drawHouseInnerWall),
  addStatic(3824, 1776, 3786, 2924, 3826, drawHouseFrontWall),
  addStatic(FDESK.y1, FDESK.x0 - 6, FDESK.y0 - 30, FDESK.x1 + 6, FDESK.y1 + 4, drawFarmerDesk),
  addStatic(GBOX.y1, GBOX.x0 - 4, GBOX.y0 - 26, GBOX.x1 + 4, GBOX.y1 + 4, drawGlassesBox),
  addStatic(HATRACK.y, HATRACK.x - 22, HATRACK.y - 96, HATRACK.x + 22, HATRACK.y + 6, drawHatRack),
  ...[[110, 3150, 1.1], [260, 3120, 1], [1240, 3130, 1.05], [1390, 3160, 1.15], [380, 3100, 0.9], [1130, 3096, 0.95]].map(([x, y, s]) => addStatic(y, x - 30 * s, y - 86 * s, x + 30 * s, y + 2, () => drawOutTree(x, y, s))),
]) d.ch = CH3;

// a little arrow at the screen edge when a friend is tagging along: where to take them
function drawCh3Overlays() {
  if (G.ch !== CH3 || G.mode !== 'play' || G.phase !== 'fleecing' || G.modal) return;
  if (G.flags.march && regionOf(G.player.x, G.player.y) === 'ranch') { drawEdgeArrow(604, 1240, 'Hill road', '#FFE14D', 'ranch'); return; }
  const reg = regionOf(G.player.x, G.player.y), tag = G.sheep.find((s) => s.follow && LINES3[s.id] && !s.deep);
  if (reg === 'ranch' && (tag || !G.flags.visitedHill)) drawEdgeArrow(604, 1240, 'Hill road', '#FFE14D', 'ranch');
  if (!tag) return;
  if (reg === 'hill') { const wd = WINDOWS3.find((q) => q.id === LINES3[tag.id].win); if (wd) drawEdgeArrow(wd.x, WIN_Y, 'Window', '#FFE14D', 'hill'); }
}

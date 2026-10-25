/* ---------------- drawing Chapter 2 ---------------- */
// chapter 2 swaps between the real view (glasses off) and the truth view (glasses on), so candy = real here
for (const [k, real, truth] of [
  ['pig', '#F4A9B8', '#D69AA6'], ['pigSh', '#E38A9C', '#B97E8A'], ['pigDk', '#9C4E5E', '#6E3E48'], ['pigMud', '#7A5A3C', '#5E4A3A'],
  ['suitDk', '#2B2A2E', '#1F1E22'], ['crow', '#2A2830', '#1E1D22'], ['crowSh', '#47434F', '#34323A'], ['beak', '#57525E', '#3E3B44'],
  ['farmWall', '#F2EBDD', '#6B675F'], ['farmWallSh', '#D9CDB6', '#57534C'], ['farmRoof', '#B5523B', '#3E3B37'], ['farmRoofSh', '#97412E', '#33302D'],
  ['farmOut', '#2E2A26', '#1A1918'], ['floorF', '#C9A57C', '#5C5852'], ['floorF2', '#B8936A', '#524E48'], ['rugF', '#9A6B4A', '#7A2A2A'], ['rugF2', '#86593B', '#5E2020'],
  ['wallF', '#EFE4CC', '#3F3B38'], ['wallFSh', '#D8C9AA', '#33302D'], ['gold', '#C9A456', '#C9A92E'], ['mahog', '#8A6040', '#4E2A1E'], ['mahogSh', '#6E4B30', '#3A1F16'],
  ['slop', '#8C6A3E', '#4A463F'], ['screen', '#7FA7B5', '#2E4A3A'],
]) { PAL_SRC[k] = [real, truth, real]; PAL[k] = PAL_SRC[k].map(hex); }
const ch2Truth = () => isTruthPass() || G.disguisesGone;
for (const k of ['acres', 'acres2', 'acresOut', 'tile', 'wall', 'wallSh', 'hedge', 'hedgeSh', 'water', 'water2']) { PAL_SRC[k][2] = PAL_SRC[k][0]; PAL[k] = PAL_SRC[k].map(hex); }

/* pigs: dumb farm pigs to the naked eye, masterminds in suits through the glasses */
function pigReal(w) {
  const moving = w.walk > 0.1, ph = w.phase || 0, sw = moving ? Math.sin(ph) * 3 : 0, bob = moving ? Math.abs(Math.sin(ph)) * 1.5 : 0;
  for (const [lx, s] of [[-15, 1], [-7, -1], [6, -1], [13, 1]]) { fillR('pigSh', lx + sw * s, -10, 5, 10, 2); fillR('pigDk', lx + sw * s, -2.5, 5, 2.5, 1); }
  ctx.translate(0, -bob);
  ctx.strokeStyle = P('pigSh'); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-20, -20); ctx.bezierCurveTo(-28, -24, -27, -31, -22.5, -29.5); ctx.bezierCurveTo(-18.5, -28, -21.5, -23, -25.5, -24.5); ctx.stroke();
  fillE('pigSh', 0, -15.5, 22, 13); fillE('pig', -1, -17.5, 21, 11.5);
  fillE('pigMud', -9, -11, 6.5, 3.2, 0.25); fillE('pigMud', 5, -8.5, 4.5, 2.2, -0.2); fillE('pigMud', -2, -24, 3, 1.6);
  fillC('pig', 17, -22, 10.5);
  ctx.fillStyle = P('pigSh'); ctx.beginPath(); ctx.moveTo(9.5, -29); ctx.lineTo(12.5, -38.5); ctx.lineTo(17.5, -30.5); ctx.closePath(); ctx.fill();
  fillE('pigSh', 26, -20, 5.2, 4.3); fillE('pigDk', 24.8, -20.5, 0.95, 1.5); fillE('pigDk', 27.4, -20.5, 0.95, 1.5);
  fillC('pupil', 19.5, -25.5, 1.35); fillC('eyeW', 19.9, -26, 0.45);
  fillE('cheek', 20, -19, 2.2, 1.4);
  ctx.strokeStyle = P('pigDk'); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(21.5, -16.5, 2.4, 0.2, Math.PI - 0.6); ctx.stroke();
}
function pigHead(hy, role) {
  ctx.fillStyle = P('pigSh'); ctx.beginPath();
  ctx.moveTo(-7.5, hy - 5); ctx.lineTo(-5.5, hy - 17); ctx.lineTo(-0.5, hy - 8); ctx.closePath();
  ctx.moveTo(2, hy - 8.5); ctx.lineTo(6.5, hy - 17); ctx.lineTo(8.5, hy - 5); ctx.closePath(); ctx.fill();
  fillC('pig', 0, hy, 10.5);
  fillE('pigSh', 9.6, hy + 2.6, 5.1, 4.3); fillE('pigDk', 8.4, hy + 2.3, 0.95, 1.5); fillE('pigDk', 11, hy + 2.3, 0.95, 1.5);
  ctx.strokeStyle = P('pigDk'); ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1.5, hy + 7.2); ctx.quadraticCurveTo(6, hy + 9, 9.5, hy + 7.4); ctx.stroke();
  if (role !== 'agent') {
    fillE('pupil', 2.2, hy - 2.4, 1.35, 1.1); fillE('pupil', 7, hy - 2.7, 1.25, 1.05);
    ctx.beginPath(); ctx.moveTo(-0.8, hy - 6.2); ctx.lineTo(4, hy - 4.6); ctx.moveTo(5.2, hy - 4.8); ctx.lineTo(9.4, hy - 6); ctx.stroke();
  }
  if (role === 'agent') {
    fillR('nose', -1.6, hy - 5.2, 11.8, 4.2, 1.6); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0.5, hy - 4.6, 2, 1);
    ctx.strokeStyle = P('iron'); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-6, hy + 1); ctx.bezierCurveTo(-9, hy + 5, -5, hy + 7, -7.5, hy + 12); ctx.stroke();
    fillC('iron', -6, hy + 0.5, 1.4);
  } else if (role === 'chairman') {
    fillE('nose', 0, hy - 10.5, 12.5, 2.6); fillR('nose', -7, hy - 25, 14.5, 15, 2); fillR('band', -7, hy - 15.5, 14.5, 3);
    ctx.strokeStyle = P('gold'); ctx.lineWidth = 1.1; circ(7, hy - 2.7, 3.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8.5, hy + 0.3); ctx.quadraticCurveTo(10, hy + 6, 6, hy + 10); ctx.stroke();
  } else if (role === 'exec') {
    ctx.strokeStyle = P('nose'); ctx.lineWidth = 0.9; circ(2.2, hy - 2.5, 2.5); ctx.stroke(); circ(7, hy - 2.8, 2.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4.7, hy - 2.7); ctx.lineTo(4.6, hy - 2.7); ctx.stroke();
  } else if (role === 'operator') {
    ctx.strokeStyle = P('iron'); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(-1, hy - 2, 10.5, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    fillC('iron', -3, hy + 0.5, 3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, hy + 3); ctx.quadraticCurveTo(0, hy + 9, 6, hy + 8.5); ctx.stroke();
  }
}
function pigSuit(w) {
  const role = w.role, moving = w.walk > 0.1, sw = moving ? Math.sin(w.phase) * 3.5 : 0, bob = moving ? Math.abs(Math.sin(w.phase)) * 1.6 : 0;
  ctx.translate(0, -bob);
  const suit = role === 'agent' || role === 'butler' ? 'suitDk' : role === 'operator' ? 'shirtW' : 'suit';
  ctx.strokeStyle = P('pigSh'); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-10, -24); ctx.bezierCurveTo(-17, -27, -16, -33, -12.5, -32); ctx.bezierCurveTo(-9.5, -31, -11.5, -27, -14.5, -28); ctx.stroke();
  const leg = role === 'operator' ? 'pants' : 'suitDk';
  fillR(leg, -7 + sw * 0.5, -24, 6, 24 + bob, 2); fillR(leg, 1 - sw * 0.5, -24, 6, 24 + bob, 2);
  fillE('pigDk', -4 + sw * 0.5, bob - 1.5, 4.6, 2.4); fillE('pigDk', 4.5 - sw * 0.5, bob - 1.5, 4.6, 2.4);
  ctx.strokeStyle = P(suit); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-7, -44); ctx.lineTo(-12.5, -27 + sw * 0.4); ctx.stroke();
  fillC('pigDk', -12.5, -26, 3);
  fillR(suit, -12, -49, 24, 29, 7);
  ctx.fillStyle = P('apron'); ctx.beginPath(); ctx.moveTo(-4.5, -49); ctx.lineTo(4.5, -49); ctx.lineTo(0, -37); ctx.closePath(); ctx.fill();
  if (role === 'butler') { ctx.fillStyle = P('suitDk'); ctx.beginPath(); ctx.moveTo(-4, -49); ctx.lineTo(0, -46.5); ctx.lineTo(-4, -44); ctx.closePath(); ctx.moveTo(4, -49); ctx.lineTo(0, -46.5); ctx.lineTo(4, -44); ctx.closePath(); ctx.fill(); }
  else { ctx.fillStyle = P(role === 'agent' ? 'suitDk' : 'band'); ctx.beginPath(); ctx.moveTo(-1.4, -48); ctx.lineTo(1.4, -48); ctx.lineTo(2, -38); ctx.lineTo(0, -35.5); ctx.lineTo(-2, -38); ctx.closePath(); ctx.fill(); }
  if (role === 'chairman') { ctx.strokeStyle = P('gold'); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-7, -33); ctx.quadraticCurveTo(-1, -29, 6, -33); ctx.stroke(); }
  let fx = 12, fy = -28 + sw * 0.4;
  if (role === 'butler') { fx = 15; fy = -42; }
  if (role === 'chairman' && w.speech) { fx = 15; fy = -60 + (RM ? 0 : Math.sin(G.clock * 6) * 4); }
  ctx.strokeStyle = P(suit); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(7, -44); ctx.lineTo(fx, fy); ctx.stroke();
  fillC('pigDk', fx, fy, 3.1);
  if (role === 'agent') { fillR('board', fx - 1, fy - 13, 10, 13, 1); ctx.strokeStyle = P('ink'); ctx.lineWidth = 0.7; ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(fx + 1, fy - 10 + i * 3); ctx.lineTo(fx + 7, fy - 10 + i * 3); } ctx.stroke(); }
  else if (role === 'butler') { fillE('foil', fx + 2, fy - 2.5, 11, 2.6); fillC('pigDk', fx - 1, fy - 5, 2.2); fillC('pigDk', fx + 4, fy - 5.4, 2); }
  else if (role === 'exec') { fillR('apron', fx - 2, fy - 10, 8, 10, 1); }
  pigHead(-57, role);
}
function drawPig(w) {
  const k = w.role === 'chairman' ? 1.12 : 1;
  ctx.scale((w.facing || 1) * k, k);
  if (ch2Truth()) pigSuit(w); else pigReal(w);
}

/* crows: the Bureau's eyes on every pole */
function drawCrow(w) {
  const tr = ch2Truth(), t = G.clock, mv = RM ? 0 : 1;
  if (!w.flying) { fillR('woodSh', -2.6, -46, 5.2, 46, 1.5); fillR('wood', -1.8, -46, 2.6, 46, 1); fillR('woodSh', -9, -49, 18, 4, 1.5); }
  ctx.save(); ctx.translate(0, w.flying ? -54 : -50); ctx.scale(w.facing || 1, 1);
  const bob = Math.sin(t * 2.4 + w.x) * 0.7 * mv, flap = w.flying ? Math.sin(t * 22) : 0;
  ctx.fillStyle = P('crowSh'); ctx.beginPath(); ctx.moveTo(-6, -3); ctx.lineTo(-15, 0.5); ctx.lineTo(-7, 3); ctx.closePath(); ctx.fill();
  fillE('crow', 0, -4, 8.2, 6, -0.2);
  if (w.flying) { ctx.fillStyle = P('crowSh'); ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(-8, -6 - 12 * flap); ctx.lineTo(4, -7); ctx.closePath(); ctx.fill(); }
  else fillE('crowSh', -1.5, -4, 5.4, 3.5, -0.3);
  fillC('crow', 6, -10 + bob, 4.7);
  ctx.fillStyle = P('beak'); ctx.beginPath(); ctx.moveTo(9.6, -11.4 + bob); ctx.lineTo(15.8, -9.6 + bob); ctx.lineTo(9.6, -8.4 + bob); ctx.closePath(); ctx.fill();
  if (tr) {
    fillR('nose', 4.4, -12.8 + bob, 6.4, 2.8, 1); fillC('nose', 3.6, -11.2 + bob, 0.9);
    ctx.strokeStyle = P('iron'); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(3.2, -9 + bob); ctx.quadraticCurveTo(1, -5, 2.4, -2); ctx.stroke();
    fillC('tag', 2.4, -2.4, 1.3);
  } else { fillC('eyeW', 7.6, -11.2 + bob, 1.35); fillC('pupil', 8, -11.1 + bob, 0.7); }
  if (!w.flying) { ctx.strokeStyle = P('beak'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1, 1); ctx.lineTo(-1, 4.5); ctx.moveTo(2, 1); ctx.lineTo(2, 4.5); ctx.stroke(); }
  ctx.restore();
}

/* the wolves' strings: only the glasses show them, and they all go up */
const PUPPET_TYPES = new Set(['shepherd', 'granny', 'doctor', 'twohead', 'chef', 'pastor', 'usher', 'guard', 'tower']);
function drawStrings(w) {
  if (G.ch !== CH2 || !isTruthPass() || !PUPPET_TYPES.has(w.type)) return;
  const t = G.clock, mv = RM ? 0 : 1;
  const pts = w.type === 'tower' ? [[-14, -150], [-2, -146]] : w.type === 'twohead' ? [[-20, -27], [20, -27], [-9, -84], [9, -84]] : w.type === 'pastor' ? [[-16, -80], [20, -80], [0, -98]] : [[-12, -28], [12, -28], [0, -84]];
  ctx.lineWidth = 1; ctx.lineCap = 'round';
  if (w.limp) {
    ctx.strokeStyle = 'rgba(236,232,216,0.7)'; ctx.beginPath();
    for (let i = 0; i < pts.length; i++) { const sx = w.x + (i - 1) * 12, sy = w.y - 4; ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 10, sy - 8, sx + 18, sy + 6, sx + 26, sy - 3); }
    ctx.stroke(); return;
  }
  const reg = regionOf(w.x, w.y);
  const ceiling = reg === 'farm' ? (w.y > FARM.wallY + 14 ? FARM.wallY - 30 : 2124) : reg === 'church' ? 1610 : -1e9;
  const top = Math.max(VB.y0 - 10, ceiling), sway = Math.sin(t * 1.3 + w.x * 0.01) * 5 * mv;
  ctx.strokeStyle = 'rgba(236,232,216,0.75)'; ctx.beginPath();
  for (const [dx, dy] of pts) { const x = w.x + dx * (w.facing || 1), y = w.y + dy; ctx.moveTo(x, y); ctx.lineTo(x * 0.85 + w.x * 0.15 + sway, top); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(236,232,216,0.9)'; for (const [dx, dy] of pts) { circ(w.x + dx * (w.facing || 1), w.y + dy, 1.4); ctx.fill(); }
}

/* the Farmhouse, outside */
function drawFarmhouse() {
  const { x0, x1, y1 } = FARMX, cx = FARMX.door, top = y1 - 84, tr = isTruthPass(), t = G.clock, mv = RM ? 0 : 1;
  const chx = x1 - 48, chy = top - 52;
  fillR('farmRoofSh', chx - 10, chy - 26, 22, 44, 2); fillR('farmRoof', chx - 12, chy - 30, 26, 7, 2);
  if (tr) {
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(236,232,216,0.7)'; ctx.beginPath();
    for (let i = 0; i < 9; i++) { const a = -1.32 - i * 0.075 + Math.sin(t * 0.8 + i) * 0.015 * mv; ctx.moveTo(chx + (i - 4) * 1.5, chy - 30); ctx.lineTo(chx + Math.cos(a) * 700, chy - 30 + Math.sin(a) * 700); }
    ctx.stroke();
  } else {
    for (let i = 0; i < 3; i++) { const k = (t * 0.25 * mv + i / 3) % 1; ctx.fillStyle = 'rgba(235,235,235,' + (0.45 * (1 - k)).toFixed(2) + ')'; circ(chx + k * 18, chy - 34 - k * 40, 6 + k * 8); ctx.fill(); }
  }
  ctx.fillStyle = P('farmRoofSh'); tri(x0 - 14, top + 4, cx, top - 60, x1 + 14, top + 4); ctx.fill();
  ctx.fillStyle = P('farmRoof'); tri(x0 - 8, top + 1, cx, top - 54, x1 + 8, top + 1); ctx.fill();
  ctx.fillStyle = P('farmWall'); ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 46); ctx.lineTo(x1, top); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); ctx.strokeStyle = P('farmWallSh'); ctx.lineWidth = 1.4; ctx.beginPath();
  for (let y = top - 40; y < y1; y += 9) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke(); ctx.restore();
  ctx.strokeStyle = P('trim'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 46); ctx.lineTo(x1, top); ctx.stroke();
  fillC('trim', cx, top - 18, 10); fillC('glass', cx, top - 18, 7.5);
  if (tr) { ctx.save(); ctx.beginPath(); ctx.arc(cx, top - 18, 7.5, 0, TAU); ctx.clip(); ctx.translate(cx - 3, top - 7); ctx.scale(0.55, 0.55); pigHead(-20, 'chairman'); ctx.restore(); }
  for (const wx of [x0 + 36, x1 - 36]) {
    fillR('trim', wx - 17, top + 16, 34, 30, 2); fillR('glass', wx - 14, top + 19, 28, 24, 1);
    if (tr) { ctx.fillStyle = 'rgba(20,20,20,0.55)'; circ(wx - 3, top + 30, 6); ctx.fill(); ctx.fillRect(wx - 9, top + 35, 12, 8); fillR('band', wx - 4, top + 35, 2, 6); }
    else { ctx.strokeStyle = P('trim'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx, top + 19); ctx.lineTo(wx, top + 43); ctx.moveTo(wx - 14, top + 31); ctx.lineTo(wx + 14, top + 31); ctx.stroke(); fillR('woodSh', wx - 18, top + 46, 36, 6, 2); ctx.fillStyle = '#E8735A'; circles([[wx - 10, top + 45, 3], [wx, top + 44, 3.4], [wx + 10, top + 45, 3]]); ctx.fill(); }
  }
  fillR('farmRoofSh', x0 + 30, y1 - 46, x1 - x0 - 60, 9, 2);
  for (const px of [x0 + 34, x1 - 38]) fillR('trim', px, y1 - 38, 4, 38);
  fillR('woodSh', cx - 17, y1 - 40, 34, 40, 3); fillR('wood', cx - 14, y1 - 37, 28, 37, 2); fillC('tag', cx + 8, y1 - 18, 1.8);
  fillR('board', cx - 32, y1, 64, 6, 2); fillR('woodSh', cx - 36, y1 + 6, 72, 5, 2);
  fillR('wood', cx - 64, top - 2, 128, 22, 4); fillR('board', cx - 61, top + 1, 122, 16, 3);
  text(tr ? 'HOG HOLDINGS HQ' : 'THE FARMHOUSE', cx, top + 9.5, 11, tr ? F_TRUTH : F_BODY, P('ink'), 112, 'center', tr ? '' : '700');
  if (tr) {
    for (const [sx, sd] of [[x0 + 4, -1], [x1 - 4, 1]]) { fillR('iron', sx - 5, top + 2, 10, 6, 1); fillC('band', sx + sd * 4, top + 5, 1.6); }
    ctx.save(); ctx.translate(x0 + 34, top - 16); ctx.rotate(-0.5); fillE('iron', 0, 0, 10, 5); fillR('iron', -1, 0, 2, 9); ctx.restore();
  } else {
    ctx.strokeStyle = P('iron'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, top - 54); ctx.lineTo(cx, top - 68); ctx.stroke();
    ctx.save(); ctx.translate(cx + 2, top - 72); ctx.scale(0.42, 0.42); pigReal({ walk: 0, phase: 0 }); ctx.restore();
  }
}

/* the Farmhouse, inside */
function drawFarmGround() {
  const R = REGIONS.farm;
  if (!regionInVB({ x0: R.x0 - 320, y0: R.y0 - 230, x1: R.x1 + 320, y1: R.y1 + 260 })) return;
  ctx.fillStyle = P('farmOut'); ctx.fillRect(R.x0 - 320, R.y0 - 230, R.x1 - R.x0 + 640, R.y1 - R.y0 + 490);
  const { x0, y0, x1, y1 } = FARM, tr = isTruthPass();
  fillR('floorF', x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = P('floorF2'); ctx.lineWidth = 2; ctx.beginPath();
  for (let y = y0 + 20, r = 0; y < y1; y += 20, r++) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); for (let x = x0 + (r % 2 ? 30 : 90); x < x1; x += 120) { ctx.moveTo(x, y - 20); ctx.lineTo(x, y); } }
  ctx.stroke();
  fillR('rugF2', 1866, 2350, 430, 124, 6); fillR('rugF', 1872, 2356, 418, 112, 5);
  fillR('rugF2', FARM.door - 44, 2614, 88, 224); fillR('rugF', FARM.door - 38, 2614, 76, 224);
  fillR('rugF2', 2050, 2700, 700, 40, 4); fillR('rugF', 2054, 2704, 692, 32, 3);
  if (tr) { ctx.strokeStyle = P('gold'); ctx.lineWidth = 1.5; ctx.strokeRect(1878, 2362, 406, 100); ctx.strokeRect(FARM.door - 32, 2614, 64, 224); }
  else { fillE('pigMud', 1960, 2500, 34, 9); fillE('pigMud', 2700, 2780, 22, 6); fillE('pigMud', 2240, 2770, 16, 5); }
  fillR('wallFSh', 1760, 2120, 20, 740); fillR('wallFSh', 3020, 2120, 20, 740);
}
function drawFarmBackWall() {
  const tr = isTruthPass();
  fillR('wallF', 1760, 2112, 1280, 110); fillR('wallFSh', 1760, 2186, 1280, 36); fillR(tr ? 'gold' : 'trim', 1760, 2184, 1280, 3); fillR('wallFSh', 1760, 2112, 1280, 5);
  // a portrait over the board table
  fillR(tr ? 'gold' : 'wood', 2040, 2126, 80, 56, 3); fillR(tr ? 'mahog' : 'glass', 2045, 2131, 70, 46, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(2045, 2131, 70, 46); ctx.clip();
  if (tr) { ctx.translate(2080, 2196); ctx.scale(1.25, 1.25); fillR('suit', -14, -22, 28, 20, 6); pigHead(-32, 'chairman'); }
  else { fillR('grass', 2045, 2160, 70, 17); ctx.translate(2070, 2178); ctx.scale(0.7, 0.7); pigReal({ walk: 0, phase: 0 }); }
  ctx.restore();
  // an easel chart, or a chalkboard doodle
  fillR('wood', 2252, 2140, 76, 48, 2); fillR(tr ? 'apron' : 'nose', 2256, 2144, 68, 40, 1);
  if (tr) {
    text('FLOCK SIZE', 2290, 2152, 8, F_TRUTH, P('ink'), 60);
    ctx.strokeStyle = P('band'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2262, 2160); ctx.lineTo(2280, 2166); ctx.lineTo(2296, 2172); ctx.lineTo(2316, 2180); ctx.stroke();
    text('GALA', 2306, 2166, 7, F_TRUTH, P('band'), 30);
  } else { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.4; circ(2290, 2164, 9); ctx.stroke(); ctx.beginPath(); ctx.arc(2290, 2166, 5, 0.3, Math.PI - 0.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2287, 2161); ctx.lineTo(2287, 2161.5); ctx.moveTo(2293, 2161); ctx.lineTo(2293, 2161.5); ctx.stroke(); }
  // the puppet room's ceiling: where the strings leave, or a plain window
  if (tr) { for (let i = 0; i < PUPPET_BARS.length; i++) { const x = RACK2.x0 + 40 + i * 76; fillE('nose', x, 2124, 7, 3); } }
  else { fillR('trim', 2680, 2128, 120, 50, 2); fillR('glass', 2685, 2133, 110, 40, 1); fillR('band', 2680, 2128, 20, 50, 2); fillR('band', 2780, 2128, 20, 50, 2); }
}
function drawFarmFrontWall() {
  fillR('wallFSh', 1760, 2836, 1280, 26); fillR('wallF', 1760, 2831, 1280, 7);
  fillR('wood', FARM.door - 52, 2826, 104, 36, 3); fillR('woodSh', FARM.door - 47, 2830, 46, 32, 2); fillR('woodSh', FARM.door + 1, 2830, 46, 32, 2);
  fillC('tag', FARM.door - 6, 2846, 2); fillC('tag', FARM.door + 6, 2846, 2);
}
function drawFarmInnerWall() {
  const tr = isTruthPass();
  for (const [a, b] of [[1780, BOARD_DOOR[0]], [BOARD_DOOR[1], PUPPET_DOOR[0]], [PUPPET_DOOR[1], 3020]]) { fillR('wallFSh', a, 2578, b - a, 36); fillR('wallF', a, 2574, b - a, 7, 2); }
  for (const x of [BOARD_DOOR[0], BOARD_DOOR[1], PUPPET_DOOR[0], PUPPET_DOOR[1]]) fillR(tr ? 'gold' : 'wood', x - 3, 2566, 6, 48, 2);
  for (const [cx, a, b] of [[(BOARD_DOOR[0] + BOARD_DOOR[1]) / 2, 'DINING ROOM', 'BOARD ROOM'], [(PUPPET_DOOR[0] + PUPPET_DOOR[1]) / 2, 'LAUNDRY', 'OPERATIONS']]) {
    fillR('wood', cx - 70, 2584, 54, 18, 3); fillR('board', cx - 68, 2586, 50, 14, 2);
    text(tr ? b : a, cx - 43, 2593.5, 7.5, tr ? F_TRUTH : F_BODY, P('ink'), 46, 'center', tr ? '' : '700');
  }
}
function drawFarmMidWall() { fillR('wallFSh', 2400, 2160, 14, 440); fillR('wallF', 2399, 2156, 16, 7, 2); }
function drawBoardTable() {
  const { x0, y0, x1, y1 } = BOARD_TABLE, tr = isTruthPass();
  if (!tr) {
    fillR('mahogSh', x0, y0 - 6, x1 - x0, y1 - y0 + 6, 4); fillR('slop', x0 + 6, y0 - 2, x1 - x0 - 12, 14, 4);
    ctx.fillStyle = '#E8C547'; for (let x = x0 + 30; x < x1 - 20; x += 70) { ell(x, y0 + 4, 7, 2.6, 0.3); ctx.fill(); }
    fillR('mahog', x0, y0 + 12, x1 - x0, y1 - y0 - 12, 3);
    for (const lx of [x0 + 8, x1 - 16]) fillR('mahogSh', lx, y1 - 2, 8, 6);
    return;
  }
  fillR('mahogSh', x0 - 4, y0 - 8, x1 - x0 + 8, y1 - y0 + 14, 6); fillR('mahog', x0, y0 - 6, x1 - x0, y1 - y0 + 2, 5);
  ctx.strokeStyle = P('gold'); ctx.lineWidth = 1.2; ctx.strokeRect(x0 + 4, y0 - 2, x1 - x0 - 8, y1 - y0 - 6);
  for (const x of [1985, 2105, 2225]) { fillR('apron', x - 12, y0 + 2, 20, 14, 1); fillR('glass', x + 12, y0, 6, 9, 1); fillR('board', x - 10, y0 + 18, 22, 7, 1); }
  fillR('wood', x1 - 22, y0 + 8, 14, 5, 2); fillR('woodSh', x1 - 14, y0 + 4, 4, 9, 1);
  text('THE BOARD', (x0 + x1) / 2, y1 - 10, 8, F_TRUTH, P('gold'), 100);
}
function drawLedgerCab() {
  const { x0, y0, x1, y1 } = LEDGER_CAB, tr = isTruthPass();
  fillR(tr ? 'iron' : 'wood', x0, y0 - 40, x1 - x0, y1 - y0 + 40, 3);
  if (tr) { for (let i = 0; i < 3; i++) { fillR('steth', x0 + 4, y0 - 34 + i * 22, x1 - x0 - 8, 18, 2); fillR('gold', (x0 + x1) / 2 - 5, y0 - 27 + i * 22, 10, 3, 1); } text('CONFIDENTIAL', (x0 + x1) / 2, y0 - 44, 6.5, F_TRUTH, P('band'), 60); }
  else { for (const [jx, c] of [[x0 + 14, '#E8C547'], [x0 + 32, '#C9734A'], [x0 + 50, '#9BC46A']]) { ctx.fillStyle = c; ctx.fillRect(jx - 6, y0 - 30, 12, 16); fillR('woodSh', jx - 7, y0 - 33, 14, 4, 1); } fillR('woodSh', x0, y0 - 12, x1 - x0, 4); text('FEED', (x0 + x1) / 2, y0 + 6, 9, F_BODY, P('board'), 50, 'center', '700'); }
}
function drawPuppetRack() {
  const tr = isTruthPass(), t = G.clock, mv = RM ? 0 : 1, chewed = G.flags.chewed || 0;
  if (!tr) {
    ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(RACK2.x0, 2236); ctx.quadraticCurveTo(RACK2.cx, 2252, RACK2.x1, 2236); ctx.stroke();
    const cols = ['#E8735A', '#7FA7D9', '#F2D16B', '#9BC46A', '#C99AE0', '#F2F2F2'];
    for (let i = 0; i < 6; i++) { const x = RACK2.x0 + 40 + i * 76, y = 2244 + Math.sin(i) * 2; ctx.fillStyle = cols[i]; if (i % 2) ctx.fillRect(x - 9, y, 18, 24); else { ctx.fillRect(x - 4, y, 9, 18); ctx.fillRect(x - 4, y + 14, 15, 7); } fillR('woodSh', x - 2, y - 4, 4, 6, 1); }
    fillE('steth', RACK2.x1 - 20, 2300, 22, 9); fillE('glass', RACK2.x1 - 20, 2297, 17, 6);
    return;
  }
  fillR('mahogSh', RACK2.x0, 2226, RACK2.x1 - RACK2.x0, 10, 2);
  PUPPET_BARS.forEach((bar, i) => {
    const x = RACK2.x0 + 40 + i * 76, cut = i < chewed, sway = Math.sin(t * 1.4 + i) * 2 * mv;
    ctx.strokeStyle = 'rgba(236,232,216,0.8)'; ctx.lineWidth = 1;
    if (!cut) { ctx.beginPath(); ctx.moveTo(x - 14 + sway, 2244); ctx.lineTo(x - 14, 2124); ctx.moveTo(x + 14 + sway, 2244); ctx.lineTo(x + 14, 2124); ctx.moveTo(x + sway, 2236); ctx.lineTo(x, 2124); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(x - 14, 2124); ctx.lineTo(x - 15, 2150); ctx.moveTo(x + 14, 2124); ctx.lineTo(x + 13, 2146); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 14, 2252); ctx.bezierCurveTo(x - 4, 2262, x + 6, 2250, x + 18, 2262); ctx.stroke(); }
    ctx.save(); ctx.translate(x + (cut ? 0 : sway), cut ? 2256 : 2244); if (cut) ctx.rotate(0.5);
    fillR('wood', -18, -3, 36, 6, 2); fillR('wood', -3, -12, 6, 24, 2);
    ctx.restore();
    fillR('board', x - 30, 2272, 60, 13, 2); text(bar.label, x, 2279, 7.5, F_TRUTH, P(cut ? 'band' : 'ink'), 56);
    if (cut) { ctx.strokeStyle = P('band'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 26, 2278.5); ctx.lineTo(x + 26, 2278.5); ctx.stroke(); }
  });
}
function drawPhotoTable() {
  const { x0, y0, x1, y1 } = PHOTO_TABLE, tr = isTruthPass();
  fillR('mahogSh', x0, y0 - 18, x1 - x0, y1 - y0 + 18, 3); fillR('mahog', x0 + 2, y0 - 16, x1 - x0 - 4, 14, 2);
  if (tr) { fillR('iron', x0 + 12, y0 - 30, 22, 14, 2); fillC('glass', x0 + 23, y0 - 23, 4.5); fillR('apron', x0 + 42, y0 - 24, 14, 12, 1); fillR('apron', x0 + 52, y0 - 28, 14, 12, 1); }
  else { fillE('wood', x0 + 38, y0 - 22, 26, 9); ctx.fillStyle = '#F2F2F2'; circles([[x0 + 30, y0 - 26, 6], [x0 + 42, y0 - 28, 7], [x0 + 52, y0 - 25, 5]]); ctx.fill(); }
}
function drawGuardDesk() {
  const { x0, y0, x1, y1 } = GUARD_DESK, tr = isTruthPass();
  fillR('mahogSh', x0, y0 - 24, x1 - x0, y1 - y0 + 24, 3); fillR('mahog', x0 + 3, y0 - 21, x1 - x0 - 6, 18, 2);
  if (tr) {
    for (let i = 0; i < 3; i++) { const sx = x0 + 10 + i * 30; fillR('iron', sx, y0 - 46, 24, 20, 2); fillR('screen', sx + 2, y0 - 44, 20, 14, 1); text('CAM ' + (i + 1), sx + 12, y0 - 37, 5.5, F_TRUTH, 'rgba(180,255,190,0.85)', 18); }
    fillR('board', x0 + 8, y0 + 4, 84, 14, 2); text('VISITORS WILL BE RETIRED', x0 + 50, y0 + 11, 6.2, F_TRUTH, P('band'), 80);
  } else {
    fillR('board', x0 + 8, y0 + 4, 84, 14, 2); text('WIPE YOUR HOOVES', x0 + 50, y0 + 11, 7, F_BODY, P('ink'), 80, 'center', '700');
    fillE('pigMud', x0 + 20, y0 - 26, 7, 3); fillR('pigDk', x0 + 66, y0 - 40, 6, 16, 2); fillR('pigDk', x0 + 76, y0 - 38, 6, 14, 2);
  }
}
for (const d of [
  addStatic(FARMX.y1 + 2, FARMX.x0 - 260, FARMX.y0 - 800, FARMX.x1 + 120, FARMX.y1 + 14, drawFarmhouse),
  addStatic(2222, 1756, 2100, 3044, 2224, drawFarmBackWall),
  addStatic(2862, 1756, 2820, 3044, 2864, drawFarmFrontWall),
  addStatic(2614, 1776, 2560, 3024, 2616, drawFarmInnerWall),
  addStatic(2600, 2396, 2150, 2418, 2602, drawFarmMidWall),
  addStatic(BOARD_TABLE.y1, BOARD_TABLE.x0 - 8, BOARD_TABLE.y0 - 14, BOARD_TABLE.x1 + 8, BOARD_TABLE.y1 + 8, drawBoardTable),
  addStatic(LEDGER_CAB.y1, LEDGER_CAB.x0 - 4, LEDGER_CAB.y0 - 54, LEDGER_CAB.x1 + 4, LEDGER_CAB.y1 + 10, drawLedgerCab),
  addStatic(RACK2.y + 26, RACK2.x0 - 8, 2110, RACK2.x1 + 8, RACK2.y + 30, drawPuppetRack),
  addStatic(PHOTO_TABLE.y1, PHOTO_TABLE.x0 - 4, PHOTO_TABLE.y0 - 34, PHOTO_TABLE.x1 + 4, PHOTO_TABLE.y1 + 2, drawPhotoTable),
  addStatic(GUARD_DESK.y1, GUARD_DESK.x0 - 4, GUARD_DESK.y0 - 50, GUARD_DESK.x1 + 4, GUARD_DESK.y1 + 20, drawGuardDesk),
]) d.ch = CH2;
// trees that stood where the Farmhouse and the protest go
for (const d of STATIC) if (d.treeAt && ((d.treeAt[0] === 1300 && d.treeAt[1] === 300) || (d.treeAt[0] === 1420 && d.treeAt[1] === 232) || (d.treeAt[0] === 1430 && d.treeAt[1] === 520))) d.ch = 1;

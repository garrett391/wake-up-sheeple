/* ---------------- drawing the chapel ---------------- */
Object.assign(PAL_SRC, {
  chOut: ['#3B2A55', '#1E1D1B', '#3A3530'],
  floor: ['#FFE3C2', '#67615A', '#B8946F'], floor2: ['#F5CFA2', '#5C5650', '#A8845F'],
  carpet: ['#FF6FA8', '#5A4A48', '#8E3B3B'], carpetSh: ['#E8558F', '#4C3E3C', '#7A3232'],
  chWall: ['#FFF3FA', '#7A766F', '#E8E1D2'], chWallSh: ['#F4CDE2', '#5F5B55', '#C9C0AE'],
  chRoof: ['#B69CFF', '#55524D', '#6B4F3A'], chRoofSh: ['#9479F0', '#47443F', '#5C4330'],
  robe: ['#8E6CFF', '#4B4651', '#5B4A78'], robeSh: ['#7352E6', '#3D3943', '#4A3B63'],
  stole: ['#FFE07A', '#A29D92', '#D9B95F'], pipe: ['#FFE07A', '#8A857C', '#C9B27A'], pipeSh: ['#F2C14C', '#6E6A62', '#A8925E'],
  flame: ['#FFC23D', '#E8A33A', '#F2B54A'],
});
for (const k of Object.keys(PAL_SRC)) if (!PAL[k]) PAL[k] = PAL_SRC[k].map(hex);
const GLASS_COLS = [['#FF5FA2', '#FFE14D', '#7FD8FF', '#B69CFF', '#7BE38F'], ['#6E6A64', '#85817A', '#5E5A55', '#77736C', '#8E8A82'], ['#C98A8A', '#D9C27A', '#8AB0C9', '#A894C9', '#8EBF8A']];
const glassCols = () => GLASS_COLS[RR > 0.5 ? 2 : RT > 0.5 ? 1 : 0];
const tri = (ax, ay, bx, by, cx, cy) => { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); };
function archPath(x, y0, w, h) { const r = w / 2; ctx.beginPath(); ctx.moveTo(x - r, y0 + h); ctx.lineTo(x - r, y0 + r); ctx.arc(x, y0 + r, r, Math.PI, TAU); ctx.lineTo(x + r, y0 + h); ctx.closePath(); }
function drawArchWindow(x, y0, w, h) {
  ctx.fillStyle = P('trim'); archPath(x, y0 - 3, w + 6, h + 5); ctx.fill();
  const cols = glassCols(), n = 3, sw = w / n;
  ctx.save(); archPath(x, y0, w, h); ctx.clip();
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { ctx.fillStyle = cols[(i + j * 2) % cols.length]; ctx.fillRect(x - w / 2 + i * sw, y0 + (j * h) / 4, sw + 0.5, h / 4 + 0.5); }
  ctx.restore();
  ctx.strokeStyle = P('ink'); ctx.lineWidth = 1.1; archPath(x, y0, w, h); ctx.stroke();
  ctx.beginPath(); for (let i = 1; i < n; i++) { ctx.moveTo(x - w / 2 + i * sw, y0 + 4); ctx.lineTo(x - w / 2 + i * sw, y0 + h); } for (let j = 1; j < 4; j++) { ctx.moveTo(x - w / 2, y0 + (j * h) / 4); ctx.lineTo(x + w / 2, y0 + (j * h) / 4); } ctx.stroke();
}

/* the pastor's head: a kindly sheep, or a wolf with a sheep mask pushed up like a hood */
function pastorHead(hy, wolfy, open) {
  if (!wolfy) {
    ctx.fillStyle = P('woolSh'); circles([[-6, hy - 6, 7.5], [1, hy - 10, 8.5], [-9, hy + 2, 6.5]]); ctx.fill();
    ctx.fillStyle = P('wool'); circles([[-6, hy - 7, 6.5], [1, hy - 11, 7.5], [-9, hy + 1, 5.5], [7, hy - 8, 5]]); ctx.fill();
    fillE('faceSh', -3, hy - 3, 5.5, 2.4, -0.5);
    fillE('face', 4, hy + 2, 8, 9.5);
    fillE('face', 10.5, hy - 4.5, 4.6, 2.1, 0.6);
    ctx.fillStyle = P('wool'); circles([[1, hy - 6, 4.2], [6, hy - 7.5, 3.6]]); ctx.fill();
    eye(2.2, hy + 1, open ? 'open' : 'happy'); eye(8.2, hy + 1, open ? 'open' : 'happy');
    fillE('cheek', 0.5, hy + 6, 2.2, 1.4);
    ctx.strokeStyle = P('pupil'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(6.5, hy + 6, 2.4, 0.25, Math.PI - 0.55); ctx.stroke();
    return;
  }
  ctx.fillStyle = P('woolSh'); circles([[-7, hy - 2, 9.5], [-3, hy - 9, 9.5], [5, hy - 11, 7.5], [-9, hy + 7, 5.5]]); ctx.fill();
  ctx.fillStyle = P('wool'); circles([[-7, hy - 3, 8.5], [-3, hy - 10, 8.5], [5, hy - 12, 6.5], [-9, hy + 6, 4.6]]); ctx.fill();
  wolfHead(hy);
  if (open) { ctx.fillStyle = 'rgba(255,226,90,0.35)'; circles([[2.6, hy - 2.6, 4.6], [8.3, hy - 2.9, 4.4]]); ctx.fill(); }
  ctx.save(); ctx.translate(1, hy - 15); ctx.rotate(-0.35);
  ctx.fillStyle = P('wool'); circles([[-7.5, -1, 3.4], [-4, -5, 3.6], [1, -6.2, 3.6], [5.8, -4.4, 3.4], [8, 0.5, 3]]); ctx.fill();
  fillE('face', 0, 0, 7.6, 5.3);
  fillC('eyeW', -2.7, -0.7, 2.1); fillC('eyeW', 2.9, -0.7, 2.1);
  fillC('pupil', -2.3, -0.4, 1.05); fillC('pupil', 3.3, -0.4, 1.05);
  ctx.strokeStyle = P('pupil'); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3, 2.4); ctx.lineTo(3, 2.4);
  for (let i = -2; i <= 2; i += 2) { ctx.moveTo(i, 1.5); ctx.lineTo(i, 3.3); }
  ctx.stroke();
  ctx.restore();
  wolfEars(hy);
}
function drawPastor(w, wolfy, portrait) {
  const t = G.clock, mv = RM ? 0 : 1, hy = -60, C = G.church || {};
  const pray = C.mode === 'pray' || C.mode === 'warn', preach = !!w.bubble && !pray;
  const hand = (x, y) => {
    if (!wolfy) { fillE('legs', x, y, 3.3, 3.6); return; }
    fillC('fur', x, y, 3.5);
    ctx.strokeStyle = P('teeth'); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x + 2.2, y - 2.6); ctx.lineTo(x + 4.6, y - 3.8); ctx.moveTo(x + 3, y); ctx.lineTo(x + 5.4, y); ctx.stroke();
  };
  const sc = portrait ? 1 : 1.18;
  ctx.scale((w.facing || 1) * sc, sc);
  if (wolfy) {
    ctx.fillStyle = P('fur'); ctx.beginPath(); ctx.moveTo(-8, -32);
    ctx.quadraticCurveTo(-31, -36 + Math.sin(t * 3) * 2 * mv, -25, -15); ctx.quadraticCurveTo(-18, -24, -7, -26); ctx.closePath(); ctx.fill();
    fillE('furLt', -25, -17, 3, 2.2, 0.4);
  }
  const back = pray ? [-20, -71 + Math.sin(t * 2) * 1.5 * mv] : [-13, -30];
  ctx.lineCap = 'round'; ctx.strokeStyle = P('robeSh'); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-7, -46); ctx.lineTo(back[0], back[1]); ctx.stroke();
  hand(back[0], back[1]);
  ctx.fillStyle = P('robe'); ctx.beginPath(); ctx.moveTo(-10, -51); ctx.lineTo(10, -51); ctx.lineTo(16, 0); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill();
  fillR('robeSh', -16, -8, 32, 8);
  fillR('stole', -7.5, -49, 3.5, 47, 1); fillR('stole', 4, -49, 3.5, 47, 1);
  if (wolfy) {
    ctx.fillStyle = P('wool'); circles([[-6, -49, 4], [0, -51, 4.4], [6, -49, 4]]); ctx.fill();
    ctx.strokeStyle = P('nose'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(0, -6); ctx.stroke();
    ctx.lineWidth = 0.9; ctx.beginPath(); for (let y = -44; y < -8; y += 3) { ctx.moveTo(-1.8, y); ctx.lineTo(1.8, y); } ctx.stroke();
    fillR('steth', -2, -42, 4, 6, 1);
  } else fillR('apron', -5, -52, 10, 3.6, 1.5);
  let fx = 14, fy = -30;
  if (pray) { fx = 21; fy = -71 + Math.sin(t * 2 + 1) * 1.5 * mv; }
  else if (preach) { fx = 18; fy = -62 + Math.sin(t * 7) * 6 * mv; }
  ctx.strokeStyle = P('robe'); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(7, -46); ctx.lineTo(fx, fy); ctx.stroke();
  hand(fx, fy);
  pastorHead(hy, wolfy, pray);
}
function drawPlate(x, y, wolfy) {
  fillE('woodSh', x + 4, y - 3, 10.5, 4); fillE('wood', x + 4, y - 4, 8.5, 3);
  if (wolfy) { ctx.fillStyle = P('wool'); circles([[x + 1, y - 6, 2.6], [x + 5, y - 7.4, 3], [x + 8.5, y - 5.6, 2.4]]); ctx.fill(); }
  else fillE('carpet', x + 4, y - 4.3, 6, 1.8);
}

/* the prayer: while he says "every head bowed", the pastor sees everything he has a line of sight to */
function drawPrayGaze(w, k) {
  const x = w.x, y = w.y - 36, N = 44, R = 760, pulse = RM ? 1 : 0.85 + 0.15 * Math.sin(G.clock * 5);
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i <= N; i++) { const a = 0.04 + ((Math.PI - 0.08) * i) / N, L = rayLen(x, y, a, R); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
  ctx.closePath();
  const c = isTruthPass() ? '255,230,160' : '255,206,110';
  const g = ctx.createRadialGradient(x, y, 20, x, y, R);
  g.addColorStop(0, 'rgba(' + c + ',' + (0.5 * k * pulse).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + c + ',' + (0.12 * k).toFixed(3) + ')');
  ctx.fillStyle = g; ctx.fill();
  if (w.alert > 0.04) { ctx.fillStyle = 'rgba(220,60,40,' + (w.alert * 0.32).toFixed(2) + ')'; ctx.fill(); }
  ctx.strokeStyle = 'rgba(' + c + ',' + (0.7 * k).toFixed(2) + ')'; ctx.lineWidth = 1.5; ctx.stroke();
}

/* ground and walls */
function drawChurchGround() {
  const C = REGIONS.church;
  if (!regionInVB({ x0: C.x0 - 320, y0: C.y0 - 260, x1: C.x1 + 320, y1: C.y1 + 260 })) return;
  ctx.fillStyle = P('chOut'); ctx.fillRect(C.x0 - 320, C.y0 - 260, C.x1 - C.x0 + 640, C.y1 - C.y0 + 520);
  const { x0, y0, x1, y1 } = NAVE;
  fillR('floor', x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = P('floor2'); ctx.lineWidth = 2; ctx.beginPath();
  for (let y = y0 + 22, r = 0; y < y1; y += 22, r++) {
    ctx.moveTo(x0, y); ctx.lineTo(x1, y);
    for (let x = x0 + (r % 2 ? 40 : 100); x < x1; x += 120) { ctx.moveTo(x, y - 22); ctx.lineTo(x, y); }
  }
  ctx.stroke();
  fillR('carpetSh', 706, CHANCEL.y1, 88, y1 - CHANCEL.y1); fillR('carpet', 712, CHANCEL.y1, 76, y1 - CHANCEL.y1);
  fillR('carpetSh', 712, 2240, 76, 36, 4);
  fillR('woodSh', CHANCEL.x0 - 4, CHANCEL.y0, CHANCEL.x1 - CHANCEL.x0 + 8, CHANCEL.y1 - CHANCEL.y0 + 8);
  fillR('wood', CHANCEL.x0, CHANCEL.y0, CHANCEL.x1 - CHANCEL.x0, CHANCEL.y1 - CHANCEL.y0 - 6);
  fillR('carpet', 696, CHANCEL.y0, 108, CHANCEL.y1 - CHANCEL.y0 - 6);
  fillR('board', CHANCEL.x0, CHANCEL.y1 - 6, CHANCEL.x1 - CHANCEL.x0, 2.5);
  fillR('floor2', VESTRY.x0 + 12, VESTRY.y0, VESTRY.x1 - VESTRY.x0 - 12, VESTRY.y1 - VESTRY.y0 - 12);
  fillE('carpetSh', 1112, 1808, 74, 28); fillE('carpet', 1112, 1808, 62, 22);
  fillR('chWallSh', 230, 1596, 20, 706); fillR('chWall', 230, 1596, 6, 706);
  fillR('chWallSh', 1250, 1596, 20, 706); fillR('chWall', 1264, 1596, 6, 706);
}
function drawChurchBackWall() {
  const tr = isTruthPass();
  fillR('chWall', 230, 1596, 1040, 126);
  fillR('chWallSh', 230, 1684, 1040, 38); fillR('trim', 230, 1682, 1040, 3); fillR('chWallSh', 230, 1596, 1040, 5);
  for (let i = 0; i < 11; i++) {
    const x = 299 + i * 15, h = 100 - Math.abs(i - 5) * 8, y = 1716 - h;
    fillR('pipeSh', x, y, 12, h, 3); fillR('pipe', x + 1.5, y, 7, h, 3); fillR('pipeSh', x + 3, y + h - 28, 6, 5, 2);
  }
  fillR('wood', 486, 1624, 76, 54, 4); fillR('board', 490, 1628, 68, 46, 3);
  text('TITHE', 524, 1641, 11, tr ? F_TRUTH : F_CANDY, P('ink'), 60);
  text(tr ? '100%' : '10%', 524, 1661, 17, tr ? F_TRUTH : F_CANDY, P('sackInk'), 60);
  drawArchWindow(612, 1614, 40, 66); drawArchWindow(888, 1614, 40, 66);
  fillC('trim', 750, 1629, 25);
  const cols = glassCols();
  for (let i = 0; i < 10; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(750, 1629); ctx.arc(750, 1629, 22, (i * TAU) / 10, ((i + 1) * TAU) / 10); ctx.closePath(); ctx.fill(); }
  fillC('glass', 750, 1629, 12.5);
  ctx.save(); ctx.beginPath(); ctx.arc(750, 1629, 12.5, 0, TAU); ctx.clip(); ctx.translate(745, 1636); ctx.scale(0.62, 0.62); pastorHead(-8, tr, false); ctx.restore();
  ctx.strokeStyle = P('ink'); ctx.lineWidth = 1.1; circ(750, 1629, 22); ctx.stroke(); circ(750, 1629, 12.5); ctx.stroke();
  fillR('wood', 636, 1656, 228, 30, 5); fillR('board', 640, 1659, 220, 24, 4);
  signText('THE WOLVES ARE OUT THERE', 'THE WOLVES ARE UP HERE', 750, 1671.5, 14, 206);
  // in the study: a portrait of the pastor
  fillR('wood', 1098, 1616, 54, 62, 3); fillR(tr ? 'glass' : 'board', 1102, 1620, 46, 54, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(1102, 1620, 46, 54); ctx.clip(); ctx.translate(1121, 1664); ctx.scale(1.3, 1.3);
  fillR('robe', -13, 0, 28, 14, 5); fillR('stole', -7, 0, 3, 12, 1); fillR('stole', 4, 0, 3, 12, 1); pastorHead(-9, tr, false); ctx.restore();
}
function drawOrgan() {
  const { x0, x1, y1 } = ORGAN;
  fillR('woodSh', x0 + 4, y1 - 50, x1 - x0 - 8, 50, 4); fillR('wood', x0 + 8, y1 - 46, x1 - x0 - 16, 38, 3);
  fillR('woodSh', x0, y1 - 58, x1 - x0, 11, 3);
  fillR('apron', x0 + 16, y1 - 31, x1 - x0 - 32, 9, 1.5);
  for (let x = x0 + 21; x < x1 - 22; x += 9) fillR('nose', x, y1 - 31, 3.5, 5.5);
  fillR('apron', x0 + 66, y1 - 80, 40, 22, 1.5);
  ctx.strokeStyle = P('ink'); ctx.lineWidth = 0.8; ctx.beginPath();
  for (let i = 0; i < 3; i++) { ctx.moveTo(x0 + 70, y1 - 75 + i * 6); ctx.lineTo(x0 + 102, y1 - 75 + i * 6); }
  ctx.stroke();
  ctx.fillStyle = P('ink'); for (const [nx, ny] of [[74, 73], [82, 70], [90, 67], [98, 64]]) { circ(x0 + nx, y1 - ny, 1.6); ctx.fill(); }
}
function drawCandle(x, y) {
  fillR('iron', x - 1.5, y - 40, 3, 40); fillE('iron', x, y - 1, 7, 2.5); fillE('iron', x, y - 40, 5, 1.8);
  fillR('apron', x - 3, y - 54, 6, 14, 1.5);
  const fl = RM ? 0 : Math.sin(G.clock * 13 + x) * 1.2;
  const g = ctx.createRadialGradient(x, y - 60, 1, x, y - 60, 18); g.addColorStop(0, 'rgba(255,214,110,0.45)'); g.addColorStop(1, 'rgba(255,214,110,0)');
  ctx.fillStyle = g; circ(x, y - 60, 18); ctx.fill();
  ctx.fillStyle = P('flame'); ctx.beginPath(); ctx.moveTo(x - 3, y - 54); ctx.quadraticCurveTo(x - 3 + fl, y - 60, x + fl * 0.5, y - 67); ctx.quadraticCurveTo(x + 3, y - 60, x + 3, y - 54); ctx.closePath(); ctx.fill();
}
function drawPulpit() {
  const x = NAVE.aisle, y = 1834, tr = isTruthPass();
  fillR('woodSh', x - 30, y - 50, 60, 50, 4); fillR('wood', x - 26, y - 46, 52, 42, 3);
  fillR('woodSh', x - 35, y - 57, 70, 10, 3);
  fillR('apron', x - 14, y - 63, 28, 7, 1.5); fillR(tr ? 'nose' : 'carpet', x - 15, y - 58, 30, 2.6, 1);
  if (tr) {
    ctx.fillStyle = P('woodSh'); circles([[x, y - 22, 5.5], [x - 6.5, y - 30, 2.6], [x - 2.2, y - 33, 2.6], [x + 2.2, y - 33, 2.6], [x + 6.5, y - 30, 2.6]]); ctx.fill();
  } else {
    ctx.fillStyle = P('carpet'); ctx.beginPath(); const hy = y - 30;
    ctx.moveTo(x, hy + 9); ctx.bezierCurveTo(x - 11, hy + 1, x - 7, hy - 7, x, hy - 2); ctx.bezierCurveTo(x + 7, hy - 7, x + 11, hy + 1, x, hy + 9); ctx.fill();
  }
}
function drawPew(p) {
  const w = p.x1 - p.x0, tr = isTruthPass();
  fillR('woodSh', p.x0, p.y - 20, w, 30, 4); fillR('wood', p.x0 + 3, p.y - 17, w - 6, 20, 3);
  fillR('woodSh', p.x0 + 2, p.y + 8, w - 4, 9, 2);
  fillR('woodSh', p.x0 - 3, p.y - 25, 9, 44, 3); fillR('woodSh', p.x1 - 6, p.y - 25, 9, 44, 3);
  for (let x = p.x0 + 30; x < p.x1 - 24; x += 58) fillR(tr ? 'robeSh' : 'carpet', x, p.y - 12, 10, 7, 1);
}
function drawPillar(x, y) {
  fillR('chWallSh', x - 17, y + 1, 34, 12, 3);
  fillR('chWall', x - 11, y - 84, 22, 88); fillR('chWallSh', x + 4, y - 84, 7, 88);
  fillR('chWallSh', x - 17, y - 94, 34, 12, 3); fillR('chWall', x - 15, y - 96, 30, 5, 2);
}
function drawChurchFrontWall() {
  fillR('chWallSh', 230, 2276, 1040, 26); fillR('chWall', 230, 2271, 1040, 7);
  fillR('wood', 698, 2266, 104, 36, 3); fillR('woodSh', 703, 2270, 46, 32, 2); fillR('woodSh', 751, 2270, 46, 32, 2);
  fillC('tag', 744, 2286, 2); fillC('tag', 756, 2286, 2);
  fillR('wood', 712, 2246, 76, 17, 3); fillR('board', 715, 2248, 70, 13, 2);
  signText('GO IN PEACE', 'NO REFUNDS', 750, 2254.5, 9, 64);
}
function drawVestryWallL() { fillR('chWallSh', 1000, 1690, 12, 174); fillR('chWall', 999, 1686, 14, 8, 2); }
function drawVestryWallB() {
  for (const [a, b] of [[1000, VESTRY.g0], [VESTRY.g1, 1250]]) { fillR('chWallSh', a, 1826, b - a, 38); fillR('chWall', a, 1822, b - a, 7, 2); }
  fillR('wood', VESTRY.g0 - 4, 1814, 7, 50, 2); fillR('wood', VESTRY.g1 - 3, 1814, 7, 50, 2);
  fillR('wood', 1054, 1833, 90, 20, 3); fillR('board', 1057, 1835, 84, 16, 2);
  signText("PASTOR'S STUDY", "PASTOR'S DEN", 1099, 1843.5, 9.5, 78);
}
function drawVestryDesk() {
  const { x0, x1, y1 } = VDESK, tr = isTruthPass();
  fillR('woodSh', x0, y1 - 36, x1 - x0, 36, 3); fillR('wood', x0 + 3, y1 - 33, x1 - x0 - 6, 18, 2);
  fillR('woodSh', x0 - 3, y1 - 40, x1 - x0 + 6, 7, 3);
  for (let i = 0; i < 4; i++) { fillE('woodSh', x0 + 20, y1 - 42 - i * 3.2, 12, 4); fillE('wood', x0 + 20, y1 - 43 - i * 3.2, 10, 3); }
  for (const [sx, s] of [[x0 + 50, 1], [x0 + 68, 0.82]]) {
    ctx.save(); ctx.translate(sx, y1 - 40); ctx.scale(s, s);
    fillE('sack', 0, -10, 9, 10.5); fillE('sack', 0, -21, 5, 3.2); fillR('woodSh', -5, -20, 10, 2.2, 1);
    text(tr ? 'WOOL' : 'TITHE', 0, -9, 6.5, tr ? F_TRUTH : F_CANDY, P('sackInk'), 15);
    ctx.restore();
  }
}
function drawRack() {
  const { x, y } = RACK, tr = isTruthPass();
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(x - 24, y); ctx.lineTo(x - 24, y - 78); ctx.lineTo(x + 24, y - 78); ctx.lineTo(x + 24, y);
  ctx.moveTo(x - 31, y); ctx.lineTo(x - 17, y); ctx.moveTo(x + 17, y); ctx.lineTo(x + 31, y); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 78); ctx.lineTo(x, y - 72); ctx.stroke();
  if (!tr) {
    ctx.fillStyle = P('robe'); ctx.beginPath(); ctx.moveTo(x - 9, y - 70); ctx.lineTo(x + 9, y - 70); ctx.lineTo(x + 15, y - 20); ctx.lineTo(x - 15, y - 20); ctx.closePath(); ctx.fill();
    fillR('stole', x - 6.5, y - 68, 3, 46, 1); fillR('stole', x + 3.5, y - 68, 3, 46, 1); fillR('apron', x - 5, y - 72, 10, 3.4, 1.5);
    return;
  }
  const body = [[x - 7, y - 58, 8], [x + 7, y - 58, 8], [x, y - 48, 9], [x - 8, y - 38, 8], [x + 8, y - 38, 8], [x, y - 28, 8.5], [x - 15, y - 54, 5], [x + 15, y - 54, 5], [x - 17, y - 44, 4.5], [x + 17, y - 44, 4.5], [x - 6, y - 18, 4.5], [x + 6, y - 18, 4.5]];
  ctx.fillStyle = P('woolSh'); circles(body.map((c) => [c[0], c[1], c[2] + 1.2])); ctx.fill();
  ctx.fillStyle = P('wool'); circles(body); ctx.fill();
  ctx.strokeStyle = P('nose'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y - 62); ctx.lineTo(x, y - 22); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.beginPath(); for (let yy = y - 60; yy < y - 24; yy += 3) { ctx.moveTo(x - 1.6, yy); ctx.lineTo(x + 1.6, yy); } ctx.stroke();
  fillR('steth', x - 2, y - 56, 4, 6, 1);
  ctx.fillStyle = P('woolSh'); circles([[x - 7, y - 70, 5.5], [x, y - 74, 6], [x + 7, y - 70, 5.5]]); ctx.fill();
  fillE('face', x, y - 67, 7, 6);
  fillC('pupil', x - 2.6, y - 68, 1.2); fillC('pupil', x + 2.6, y - 68, 1.2);
  ctx.strokeStyle = P('pupil'); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - 3, y - 64); ctx.lineTo(x + 3, y - 64); ctx.stroke();
  fillR('board', x + 11, y - 36, 17, 10, 1);
  text('XL', x + 19.5, y - 31, 6.5, F_TRUTH, P('ink'), 15);
}

/* outside, in the ranch */
function drawChapel() {
  const { x0, x1, y1 } = CHAPEL, cx = CHAPEL.door, top = y1 - 80, tr = isTruthPass(), real = RR > 0.5;
  fillR('chWallSh', cx - 17, top - 100, 34, 70, 2); fillR('chWall', cx - 15, top - 100, 30, 68, 2);
  ctx.fillStyle = P('chRoofSh'); archPath(cx, top - 92, 16, 22); ctx.fill();
  const ring = G.church && G.church.bellT > 0 ? Math.min(1, G.church.bellT) : 0;
  ctx.save(); ctx.translate(cx, top - 84); if (ring && !RM) ctx.rotate(Math.sin(G.clock * 10) * 0.55 * ring);
  fillC('tag', 0, 10, 5.5); fillR('tag', -6.5, 9, 13, 4, 1); ctx.restore();
  if (ring) {
    ctx.strokeStyle = tr ? 'rgba(34,33,31,' + (0.8 * ring).toFixed(2) + ')' : 'rgba(255,95,162,' + (0.9 * ring).toFixed(2) + ')'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    const k = RM ? 0.5 : (G.clock * 1.6) % 1;
    for (const sd of [-1, 1]) for (const r of [8 + k * 6, 15 + k * 6]) { ctx.beginPath(); ctx.arc(cx + sd * 18, top - 78, r, sd > 0 ? -0.7 : Math.PI - 0.7, sd > 0 ? 0.7 : Math.PI + 0.7); ctx.stroke(); }
  }
  ctx.fillStyle = P('chRoofSh'); tri(cx - 22, top - 98, cx, top - 150, cx + 22, top - 98); ctx.fill();
  ctx.fillStyle = P('chRoof'); tri(cx - 18, top - 99, cx, top - 146, cx + 14, top - 99); ctx.fill();
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, top - 148); ctx.lineTo(cx, top - 160); ctx.stroke();
  if (tr) { ctx.save(); ctx.translate(cx - 4, top - 164); ctx.scale(0.42, 0.42); wolfHead(0); wolfEars(0); ctx.restore(); }
  else { ctx.fillStyle = P('wool'); circles([[cx - 5, top - 165, 4], [cx, top - 168, 4.5], [cx + 5, top - 165, 4], [cx, top - 162, 4]]); ctx.fill(); fillE('face', cx + 8, top - 165, 2.6, 2.2); fillR('legs', cx - 4, top - 162, 1.6, 4); fillR('legs', cx + 3, top - 162, 1.6, 4); }
  ctx.fillStyle = P('chRoofSh'); tri(x0 - 14, top + 4, cx, top - 62, x1 + 14, top + 4); ctx.fill();
  ctx.fillStyle = P('chRoof'); tri(x0 - 8, top + 1, cx, top - 56, x1 + 8, top + 1); ctx.fill();
  ctx.fillStyle = P('chWall'); ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 48); ctx.lineTo(x1, top); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P('trim'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 48); ctx.lineTo(x1, top); ctx.stroke();
  fillR('chWallSh', x0, y1 - 9, x1 - x0, 9);
  const cols = glassCols();
  fillC('trim', cx, top - 18, 13);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(cx, top - 18); ctx.arc(cx, top - 18, 10.5, (i * TAU) / 8, ((i + 1) * TAU) / 8); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = P('ink'); ctx.lineWidth = 1; circ(cx, top - 18, 10.5); ctx.stroke();
  drawArchWindow(x0 + 30, top + 14, 22, 38); drawArchWindow(x1 - 30, top + 14, 22, 38);
  if (!tr && !real) for (const wx of [x0 + 30, x1 - 30]) { fillR('woodSh', wx - 16, top + 54, 32, 7, 2); ctx.fillStyle = '#FF8FC8'; circles([[wx - 9, top + 53, 3.4], [wx, top + 52, 3.6], [wx + 9, top + 53, 3.4]]); ctx.fill(); }
  ctx.fillStyle = P('trim'); archPath(cx, y1 - 52, 46, 52); ctx.fill();
  ctx.fillStyle = P('woodSh'); archPath(cx, y1 - 48, 38, 48); ctx.fill();
  fillR('wood', cx - 17, y1 - 36, 16, 36, 1); fillR('wood', cx + 1, y1 - 36, 16, 36, 1);
  fillC('tag', cx - 4, y1 - 18, 1.8); fillC('tag', cx + 4, y1 - 18, 1.8);
  if (tr) { ctx.strokeStyle = P('nose'); ctx.lineWidth = 1.3; ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(cx + 3 + i * 4, y1 - 32); ctx.lineTo(cx + 8 + i * 4, y1 - 20); } ctx.stroke(); }
  else { ctx.fillStyle = '#FF5FA2'; ctx.beginPath(); const hy = y1 - 41; ctx.moveTo(cx, hy + 5); ctx.bezierCurveTo(cx - 7, hy, cx - 4, hy - 5, cx, hy - 1.5); ctx.bezierCurveTo(cx + 4, hy - 5, cx + 7, hy, cx, hy + 5); ctx.fill(); }
  fillR('board', cx - 30, y1, 60, 5, 2);
}
function drawChapelSign() {
  const { x, y } = CHAPEL_SIGN;
  fillR('woodSh', x - 3, y - 26, 6, 26);
  fillR('wood', x - 101, y - 74, 202, 50, 5); fillR('board', x - 97, y - 71, 194, 44, 4);
  signText('CHAPEL OF THE GOOD SHEPHERD', 'CHAPEL OF THE HUNGRY SHEPHERD', x, y - 59, 12.5, 182);
  signText('SUNDAY: BLESSED ARE THE MEEK', 'SUNDAY: BLESSED ARE THE TENDER', x, y - 39, 11, 182, 'sackInk');
}

addStatic(CHAPEL.y1, CHAPEL.x0 - 20, CHAPEL.y1 - 250, CHAPEL.x1 + 20, CHAPEL.y1 + 8, drawChapel);
addStatic(CHAPEL_SIGN.y, CHAPEL_SIGN.x - 104, CHAPEL_SIGN.y - 78, CHAPEL_SIGN.x + 104, CHAPEL_SIGN.y + 2, drawChapelSign);
addStatic(1722, 226, 1590, 1274, 1724, drawChurchBackWall);
addStatic(ORGAN.y1, ORGAN.x0 - 4, ORGAN.y1 - 84, ORGAN.x1 + 4, ORGAN.y1 + 2, drawOrgan);
for (const cx of [612, 888]) addStatic(1800, cx - 20, 1726, cx + 20, 1802, () => drawCandle(cx, 1800));
addStatic(1834, NAVE.aisle - 38, 1770, NAVE.aisle + 38, 1836, drawPulpit);
addStatic(1864, 996, 1680, 1016, 1866, drawVestryWallL);
addStatic(1865, 996, 1812, 1254, 1866, drawVestryWallB);
addStatic(VDESK.y1, VDESK.x0 - 6, VDESK.y1 - 70, VDESK.x1 + 6, VDESK.y1 + 2, drawVestryDesk);
addStatic(RACK.y, RACK.x - 34, RACK.y - 90, RACK.x + 34, RACK.y + 2, drawRack);
for (const p of PEWS) addStatic(p.y + 12, p.x0 - 6, p.y - 28, p.x1 + 6, p.y + 20, () => drawPew(p));
for (const [x, y] of PILLARS) addStatic(y + 13, x - 19, y - 98, x + 19, y + 15, () => drawPillar(x, y));
addStatic(2302, 226, 2240, 1274, 2304, drawChurchFrontWall);

/* "Every head bowed": a caption pinned to the screen, with a countdown to "Amen" */
function drawPrayerCaption() {
  const C = G.church, p = G.player;
  if (G.mode !== 'play' || G.modal || G.fade || C.walkout || C.mode === 'sermon' || G.phase !== 'fleecing' || regionOf(p.x, p.y) !== 'church') return;
  const tr = G.view === 1, warn = C.mode === 'warn', key = touchMode ? 'Bow' : 'Shift';
  const line = warn ? 'Let us pray...' : 'Every head bowed. Every eye closed.';
  const sub = warn ? 'Get ready to hold ' + key + '.' : p.grazing ? 'Stay down until "Amen."' : 'Hold ' + key + ' to bow your head!';
  const left = clamp(warn ? 1 - C.t / C.warn : 1 - C.t / 4.6, 0, 1);
  const hudH = parseFloat(app.style.getPropertyValue('--hud-h')) || 0;
  const font = tr ? F_TRUTH : F_BODY, wt = tr ? '' : '700', ink = tr ? '#22211F' : '#3E1F7A', seen = !warn && G.maxAlert > 0.05;
  ctx.font = fontStr(18, font, wt); const w1 = ctx.measureText(line).width;
  ctx.font = fontStr(13.5, font, wt); const w2 = ctx.measureText(sub).width;
  const w = Math.min(view.w - 24, Math.max(w1, w2) + 44), h = 66, x = view.w / 2 - w / 2, y = view.w >= 1100 ? 20 : touchMode ? view.h - h - 250 : Math.max(hudH + 14, view.h - h - 96);
  ctx.fillStyle = tr ? '#E8E4D8' : '#FFFFFF'; ctx.strokeStyle = seen ? '#C8372D' : ink; ctx.lineWidth = seen ? 3 : 2;
  rrect(x, y, w, h, tr ? 3 : 16); ctx.fill(); ctx.stroke();
  text(line, view.w / 2, y + 20, 18, font, ink, w - 24, 'center', wt);
  text(sub, view.w / 2, y + 40, 13.5, font, seen ? '#C8372D' : tr ? '#55524D' : '#7A5AC8', w - 24, 'center', wt);
  ctx.fillStyle = tr ? 'rgba(0,0,0,0.12)' : 'rgba(62,31,122,0.12)'; rrect(x + 18, y + h - 13, w - 36, 5, 2.5); ctx.fill();
  ctx.fillStyle = warn ? (tr ? '#8A857C' : '#FFB84D') : tr ? '#C9A92E' : '#FF5FA2'; rrect(x + 18, y + h - 13, (w - 36) * left, 5, 2.5); ctx.fill();
}

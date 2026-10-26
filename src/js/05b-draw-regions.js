/* ---------------- drawing the new pastures ---------------- */
Object.assign(PAL_SRC, {
  acres: ['#C6F5DE', '#6E6A63', '#6E6A63'], acres2: ['#D4FAE8', '#74706A', '#74706A'], acresOut: ['#F2D3E8', '#3F3C38', '#3F3C38'],
  tile: ['#FFE2F0', '#5A5650', '#5A5650'], wall: ['#FFF0F6', '#5F5B54', '#5F5B54'], wallSh: ['#F3C7DC', '#4B4842', '#4B4842'],
  hedge: ['#6FD68A', '#4E5847', '#4E5847'], hedgeSh: ['#4FBE70', '#3F473A', '#3F473A'],
  water: ['#7FD8FF', '#8A5A2E', '#8A5A2E'], water2: ['#B8EDFF', '#A8743E', '#A8743E'], pot: ['#FFFFFF', '#26252A', '#26252A'],
});
for (const k of ['acres', 'acres2', 'acresOut', 'tile', 'wall', 'wallSh', 'hedge', 'hedgeSh', 'water', 'water2', 'pot']) PAL[k] = PAL_SRC[k].map(hex);

const regionInVB = (r) => r.x1 >= VB.x0 && r.x0 <= VB.x1 && r.y1 >= VB.y0 && r.y0 <= VB.y1;
const FIELD_COLS = { north: ['#20C6B6', '#7FD8FF'], south: ['#FF9F1C', '#FFE14D'] };
function drawRegionGrounds() {
  const tr = isTruthPass(), tm = G.clock;
  const A = REGIONS.acres, F = REGIONS.field;
  if (regionInVB(A)) {
    ctx.fillStyle = P('acresOut'); ctx.fillRect(A.x0, A.y0, A.x1 - A.x0, A.y1 - A.y0);
    ctx.fillStyle = P('acres'); ctx.fillRect(A.ix0, A.iy0, A.ix1 - A.ix0, A.iy1 - A.iy0);
    ctx.fillStyle = P('acres2'); for (let y = A.iy0 + 20; y < A.iy1; y += 80) ctx.fillRect(A.ix0, y, A.ix1 - A.ix0, 40);
    ctx.strokeStyle = P('tile'); ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    ctx.moveTo(2500, 920); ctx.lineTo(2500, 540); ctx.moveTo(2500, 700); ctx.lineTo(2850, 700); ctx.lineTo(2850, 760);
    ctx.moveTo(2620, 470); ctx.lineTo(2930, 300); ctx.moveTo(2380, 470); ctx.lineTo(2020, 200);
    ctx.stroke();
    for (const f of ACRES_FLOWERS) {
      if (!inVB(f.x, f.y)) continue;
      if (tr) { ctx.strokeStyle = P('hedgeSh'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(f.x + 1, f.y - 8, f.x + 4.5, f.y - 5.5); ctx.stroke(); }
      else { ctx.fillStyle = FLOWER_COLS[f.c]; circles([[f.x - 2.5, f.y - 5, 2.4 * f.s], [f.x + 2.5, f.y - 5, 2.4 * f.s], [f.x, f.y - 8, 2.4 * f.s], [f.x, f.y - 2, 2.4 * f.s]]); ctx.fill(); }
    }
  }
  if (regionInVB(F)) {
    ctx.fillStyle = P('grass'); ctx.fillRect(F.ix0, F.iy0, F.ix1 - F.ix0, F.iy1 - F.iy0);
    ctx.fillStyle = P('grass2'); for (let x = F.ix0 + 30; x < F.ix1 - 20; x += 116) ctx.fillRect(x, F.iy0, 52, F.iy1 - F.iy0);
    if (!tr && RR < 0.5) {
      ctx.fillStyle = 'rgba(32,198,182,0.10)'; ctx.fillRect(F.ix0, F.iy0, DIVIDER.x - F.ix0, F.iy1 - F.iy0);
      ctx.fillStyle = 'rgba(255,159,28,0.10)'; ctx.fillRect(DIVIDER.x, F.iy0, F.ix1 - DIVIDER.x, F.iy1 - F.iy0);
    }
    for (const f of FIELD_FLOWERS) {
      if (!inVB(f.x, f.y)) continue;
      if (tr) { ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(f.x + 1, f.y - 8, f.x + 4.5, f.y - 5.5); ctx.stroke(); fillC('rock2', f.x + 5, f.y - 4.5, 2.1); continue; }
      const sway = RM ? 0 : Math.sin(tm * 2 + f.ph) * 1.4, x = f.x + sway, y = f.y - 7 * f.s, cols = FIELD_COLS[f.north ? 'north' : 'south'];
      ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = cols[(f.ph * 10 | 0) % 2]; circles([[x - 2.6, y, 2.3 * f.s], [x + 2.6, y, 2.3 * f.s], [x, y - 2.6, 2.3 * f.s], [x, y + 2.6, 2.3 * f.s]]); ctx.fill();
    }
  }
  drawChurchGround();
  drawFarmGround();
  drawStudioGround();
}

/* Sunny Acres */
function drawAcresBack() {
  const tr = isTruthPass();
  fillR('wallSh', 1920, 66, 1160, 74); fillR('wall', 1920, 60, 1160, 64);
  fillR('wallSh', 1920, 60, 20, 880); fillR('wall', 1922, 60, 14, 880);
  fillR('wallSh', 3060, 60, 20, 880); fillR('wall', 3064, 60, 14, 880);
  if (tr) {
    ctx.fillStyle = P('pot'); ctx.beginPath();
    for (let x = 1924; x < 3076; x += 16) { ctx.moveTo(x, 60); ctx.lineTo(x + 6, 46); ctx.lineTo(x + 12, 60); }
    ctx.fill();
  } else {
    ctx.fillStyle = '#FF8FC8'; for (let x = 1940; x < 3070; x += 34) { circ(x, 66 + Math.sin(x) * 3, 4); ctx.fill(); }
    ctx.fillStyle = '#7BD88F'; for (let x = 1957; x < 3070; x += 34) { ell(x, 68, 7, 3); ctx.fill(); }
  }
  fillR('wood', 2056, 78, 248, 32, 5); fillR('board', 2060, 81, 240, 26, 4);
  signText("RELAX. YOU'VE EARNED IT.", "RELAX. YOU'RE BEING SEASONED.", 2180, 94.5, 15, 226);
}
function drawAcresFront() {
  const tr = isTruthPass();
  fillR('wallSh', 1920, 900, 520, 40); fillR('wall', 1920, 896, 520, 30);
  fillR('wallSh', 2560, 900, 520, 40); fillR('wall', 2560, 896, 520, 30);
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2.5; ctx.beginPath();
  for (let x = 2446; x < 2560; x += 10) { ctx.moveTo(x, 938); ctx.lineTo(x, 892); }
  ctx.moveTo(2440, 904); ctx.lineTo(2560, 904); ctx.moveTo(2440, 926); ctx.lineTo(2560, 926); ctx.stroke();
  fillR('trim', 2432, 840, 10, 100, 2); fillR('trim', 2558, 840, 10, 100, 2);
  fillR('wood', 2404, 842, 192, 30, 5); fillR('board', 2408, 845, 184, 24, 4);
  signText('WELCOME TO SUNNY ACRES', 'NOBODY CHECKS OUT', 2500, 857.5, 13, 172);
  if (tr) { ctx.fillStyle = P('pot'); ctx.beginPath(); for (let x = 1924; x < 3076; x += 16) { if (x > 2430 && x < 2570) continue; ctx.moveTo(x, 896); ctx.lineTo(x + 6, 884); ctx.lineTo(x + 12, 896); } ctx.fill(); }
}
const POT_BITS = [[-70, -10, 0, 0.3], [-30, 12, 1, 1.1], [10, -18, 0, 2.2], [45, 8, 0, 0.9], [80, -6, 1, 1.7], [-5, 24, 0, 2.9], [-95, 10, 1, 0.5]];
function drawPool() {
  const { x, y, rx, ry } = POT, t = G.clock, mv = RM ? 0 : 1;
  if (!isTruthPass()) {
    fillE('tile', x, y, rx + 14, ry + 11); fillE('water', x, y, rx, ry);
    ctx.strokeStyle = P('water2'); ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const k = (t * 0.3 * mv + i / 3) % 1; ctx.globalAlpha = 1 - k; ell(x - 30 + i * 30, y + 6 - i * 8, 18 + k * 40, (18 + k * 40) * 0.45); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(x + 52, y - 6 + Math.sin(t * 1.5) * 2 * mv);
    ctx.strokeStyle = '#FF7AC6'; ctx.lineWidth = 7; ell(0, 0, 18, 8); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(14, -3); ctx.quadraticCurveTo(24, -22, 14, -30); ctx.stroke();
    ctx.fillStyle = '#FF7AC6'; circ(14, -31, 4.2); ctx.fill(); ctx.fillStyle = '#2B1B4A'; ctx.beginPath(); ctx.moveTo(17, -31); ctx.lineTo(23, -28); ctx.lineTo(17, -28.5); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#C9D3DC'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - rx + 16, y - 16); ctx.lineTo(x - rx + 16, y + 6); ctx.moveTo(x - rx + 28, y - 18); ctx.lineTo(x - rx + 28, y + 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { const sx = x - 60 + i * 55, k = (t * 0.4 * mv + i * 0.3) % 1; ctx.globalAlpha = 0.6 * (1 - k); ctx.beginPath(); ctx.moveTo(sx, y - 10 - k * 40); ctx.quadraticCurveTo(sx + 8, y - 20 - k * 40, sx, y - 30 - k * 40); ctx.stroke(); }
    ctx.globalAlpha = 1;
    return;
  }
  for (let i = 0; i < 10; i++) {
    const fx = x - 110 + i * 24.5, h = 16 + Math.sin(t * 9 * mv + i * 1.7) * 5;
    ctx.fillStyle = '#E8642A'; ctx.beginPath(); ctx.moveTo(fx - 9, y + ry + 26); ctx.quadraticCurveTo(fx - 4, y + ry + 18 - h * 0.5, fx, y + ry + 24 - h); ctx.quadraticCurveTo(fx + 4, y + ry + 18 - h * 0.5, fx + 9, y + ry + 26); ctx.fill();
    ctx.fillStyle = '#F7C548'; ctx.beginPath(); ctx.moveTo(fx - 4, y + ry + 26); ctx.quadraticCurveTo(fx, y + ry + 22 - h * 0.4, fx + 4, y + ry + 26); ctx.fill();
  }
  fillE('pot', x, y + 18, rx + 18, ry + 22);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ell(x - 60, y + 30, 40, 13); ctx.fill();
  fillE('pot', x, y, rx + 12, ry + 9); fillE('water', x, y, rx, ry);
  ctx.fillStyle = P('water2'); ell(x - 20, y - 10, rx * 0.6, ry * 0.45); ctx.fill();
  for (const b of POT_BITS) {
    const bx = x + b[0] + Math.sin(t * 1.2 * mv + b[3]) * 3, by = y + b[1] + Math.cos(t * 1.5 * mv + b[3]) * 2;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(b[3]);
    if (b[2] === 0) { ctx.fillStyle = '#FF8A2A'; ctx.beginPath(); ctx.moveTo(-11, -3); ctx.lineTo(11, 0); ctx.lineTo(-11, 3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#5FAF3A'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-17, -4); ctx.lineTo(-16, 0); ctx.lineTo(-17, 4); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = '#F3EEE0'; circ(0, 0, 6); ctx.fill(); ctx.strokeStyle = '#C9C0A8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, 3.5, -1, 1); ctx.stroke(); }
    ctx.restore();
  }
  for (let i = 0; i < 6; i++) { const k = (t * 0.7 * mv + i * 0.37) % 1, bx = x - 90 + ((i * 53) % 180), by = y - 22 + ((i * 29) % 40); ctx.strokeStyle = 'rgba(220,170,110,' + (1 - k).toFixed(2) + ')'; ctx.lineWidth = 1.2; circ(bx, by, 2 + k * 5); ctx.stroke(); }
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const sx = x - 75 + i * 50, k = (t * 0.35 * mv + i * 0.27) % 1; ctx.strokeStyle = 'rgba(235,235,235,' + (0.4 * (1 - k)).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(sx, y - 20 - k * 60); ctx.bezierCurveTo(sx + 14, y - 34 - k * 60, sx - 14, y - 48 - k * 60, sx, y - 62 - k * 60); ctx.stroke(); }
  ctx.strokeStyle = P('steth'); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 66, y - 6); ctx.lineTo(x + 116, y - 72); ctx.stroke();
}
function drawKitchen() {
  const { x0, y0, x1, y1 } = KITCHEN, cx = (x0 + x1) / 2, top = y1 - 84, tr = isTruthPass(), t = G.clock;
  if (tr) {
    fillR('pot', x1 - 54, y0 - 64, 22, 52, 2);
    for (let i = 0; i < 3; i++) { const k = (t * 0.3 * (RM ? 0 : 1) + i / 3) % 1; ctx.fillStyle = 'rgba(200,200,200,' + (0.5 * (1 - k)).toFixed(2) + ')'; circ(x1 - 43 + k * 20, y0 - 70 - k * 50, 9 + k * 10); ctx.fill(); }
  }
  fillR('wallSh', x0 - 6, y0 - 22, x1 - x0 + 12, top - y0 + 26, 4);
  fillR('wall', x0, top, x1 - x0, y1 - top); fillR('wallSh', x0, top, x1 - x0, 6);
  fillR('woodSh', cx - 15, y1 - 48, 30, 48, 3);
  for (const wx of [x0 + 40, x1 - 40]) { fillC('trim', wx, top + 34, 16); fillC('glass', wx, top + 34, 12); }
  if (!tr) {
    for (let i = 0; i < 5; i++) { ctx.fillStyle = P(i % 2 ? 'awnB' : 'awnA'); ctx.beginPath(); const ax = cx - 30 + i * 12; ctx.moveTo(ax, top + 18); ctx.lineTo(ax + 12, top + 18); ctx.lineTo(ax + 12, top + 28); ctx.arc(ax + 6, top + 28, 6, 0, Math.PI); ctx.closePath(); ctx.fill(); }
    for (const px of [x0 - 14, x1 + 14]) { fillR('awnA', px - 8, y1 - 16, 16, 16, 3); ctx.fillStyle = '#5FC96E'; circles([[px - 6, y1 - 24, 8], [px + 6, y1 - 26, 8], [px, y1 - 34, 8]]); ctx.fill(); }
  }
  fillR('wood', cx - 74, top - 33, 148, 30, 5); fillR('board', cx - 70, top - 30, 140, 24, 4);
  signText('SPA & MASSAGE', 'KITCHEN', cx, top - 18, 15, 128);
}
function drawHedgeBox(h) {
  const [x0, , x1, y1] = h, w = x1 - x0, tr = isTruthPass();
  fillR('wallSh', x0, y1 - 18, w, 18, 3); fillR('wall', x0 + 2, y1 - 16, w - 4, 5, 2);
  const n = Math.max(3, Math.round(w / 18)), list = [];
  for (let i = 0; i < n; i++) list.push([x0 + 9 + (i * (w - 18)) / (n - 1), y1 - 26, 12]);
  ctx.fillStyle = P('hedgeSh'); circles(list); ctx.fill();
  ctx.fillStyle = P('hedge'); circles(list.map((c) => [c[0], c[1] - 5, c[2] - 2])); ctx.fill();
  if (!tr) { ctx.fillStyle = '#FF8FC8'; for (const c of list) { circ(c[0] + 3, c[1] - 9, 2.2); ctx.fill(); } }
}
function drawDesk() {
  const { x0, x1, y1 } = DESK, cx = (x0 + x1) / 2;
  fillR('wood', x0, y1 - 34, x1 - x0, 34, 2); fillR('woodSh', x0 - 4, y1 - 40, x1 - x0 + 8, 8, 3);
  fillR('board', cx - 36, y1 - 26, 72, 16, 2); signText('CHECK-IN', 'CHECK-IN ONLY', cx, y1 - 18, 10, 64);
  fillC('foil', x0 + 14, y1 - 44, 5); fillC('foilSh', x0 + 14, y1 - 48, 1.6);
  if (!G.proof.has('guestbook')) { fillR('sackInk', x1 - 36, y1 - 47, 24, 7, 1); fillR('board', x1 - 34, y1 - 46, 20, 2); }
}
function penRail(x0, x1, y) {
  for (let x = x0; x <= x1; x += 20) fillR('fenceSh', x - 2, y - 22, 4, 22, 1);
  fillR('fence', x0, y - 18, x1 - x0, 3); fillR('fence', x0, y - 9, x1 - x0, 3);
}
function drawPenBack() {
  const { x0, y0, x1, y1, g0, g1 } = PEN, cx = (g0 + g1) / 2;
  penRail(x0, g0, y0); penRail(g1, x1, y0);
  for (const x of [x0 + 3, x1 - 3]) { fillR('fence', x - 1.5, y0 - 18, 3, y1 - y0, 1); fillR('fenceSh', x - 2, y1 - 22, 4, 22, 1); }
  if (PEN_GATE.on) { fillR('wood', g0 + 2, y0 - 20, g1 - g0 - 4, 18, 2); ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(g0 + 2, y0 - 20); ctx.lineTo(g1 - 2, y0 - 2); ctx.stroke(); }
  else { ctx.save(); ctx.translate(g0, y0); ctx.rotate(-1.1); fillR('wood', 0, -18, g1 - g0 - 4, 16, 2); ctx.restore(); }
  fillR('woodSh', cx - 2, y0 - 46, 4, 26); fillR('wood', cx - 76, y0 - 70, 152, 28, 4); fillR('board', cx - 72, y0 - 67, 144, 22, 3);
  signText("SPA LINE: YOU'RE NEXT!", "STEW LINE: YOU'RE NEXT!", cx, y0 - 56, 12, 134);
}
function drawPenFront() { penRail(PEN.x0, PEN.x1, PEN.y1); }
const LOUNGERS = [[2300, 560], [2700, 560], [2210, 380], [2780, 380]];
function drawLounger(x, y) {
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 18, y - 9); ctx.moveTo(x + 16, y); ctx.lineTo(x + 12, y - 9); ctx.stroke();
  for (let i = 0; i < 4; i++) fillR(i % 2 ? 'awnB' : 'awnA', x - 24 + i * 10, y - 14, 10, 6);
  ctx.save(); ctx.translate(x + 16, y - 12); ctx.rotate(-0.7); for (let i = 0; i < 2; i++) fillR(i % 2 ? 'awnB' : 'awnA', i * 11, -3, 11, 6); ctx.restore();
}
function drawTunnelHole(x, y, side) {
  const tr = isTruthPass();
  if (side === 'ranch' && !tr) {
    ctx.fillStyle = P('tuft'); circles([[x - 11, y - 6, 10], [x + 9, y - 7, 11], [x, y - 15, 10]]); ctx.fill();
    ctx.fillStyle = '#FF8FC8'; for (const [a, b] of [[-8, -12], [6, -16], [12, -6], [-2, -4]]) { circ(x + a, y + b, 2.4); ctx.fill(); }
    return;
  }
  fillE('mud', x, y, 25, 12); fillE('mud2', x, y + 1, 18, 8); ctx.fillStyle = '#1D1A16'; ell(x, y + 2, 12, 5.5); ctx.fill();
  fillE('mud', x + 26, y - 3, 11, 6); fillE('mud2', x + 24, y - 5, 5, 2.5);
  fillR('woodSh', x - 31, y - 28, 3, 28); fillR('board', x - 62, y - 46, 62, 20, 2);
  text(side === 'ranch' ? "KEVIN'S TUNNEL" : 'TO THE RANCH', x - 31, y - 36, 8.5, tr ? F_TRUTH : F_CANDY, P('ink'), 56);
}
addStatic(140, 1900, 40, 3100, 945, drawAcresBack);
addStatic(942, 1900, 830, 3100, 945, drawAcresFront);
addStatic(POT.y, POT.x - 170, POT.y - 170, POT.x + 170, POT.y + 110, drawPool);
addStatic(KITCHEN.y1, KITCHEN.x0 - 30, KITCHEN.y0 - 140, KITCHEN.x1 + 30, KITCHEN.y1 + 5, drawKitchen);
for (const h of HEDGES) addStatic(h[3], h[0] - 6, h[1] - 32, h[2] + 6, h[3] + 2, () => drawHedgeBox(h));
addStatic(DESK.y1, DESK.x0 - 10, DESK.y0 - 60, DESK.x1 + 10, DESK.y1 + 2, drawDesk);
addStatic(PEN.y0, PEN.x0 - 10, PEN.y0 - 80, PEN.x1 + 10, PEN.y1, drawPenBack);
addStatic(PEN.y1, PEN.x0 - 10, PEN.y1 - 30, PEN.x1 + 10, PEN.y1 + 4, drawPenFront);
for (const l of LOUNGERS) addStatic(l[1], l[0] - 40, l[1] - 40, l[0] + 40, l[1] + 4, () => drawLounger(l[0], l[1]));
addStatic(270, 320, 210, 440, 284, () => drawTunnelHole(395, 270, 'ranch'));
addStatic(182, 1920, 120, 2050, 196, () => drawTunnelHole(1990, 182, 'acres'));

/* the North Pasture and the South Pasture */
function drawDividerSeg(seg) {
  const x = DIVIDER.x, tr = isTruthPass(), h = 46;
  if (!tr) {
    ctx.fillStyle = P('tuft'); circles([[x, seg.y0 - h * 0.45, 15], [x, seg.y1 - h * 0.45, 15], [x, seg.y1 - 8, 14]]); ctx.fill();
    ctx.fillStyle = P('grass2'); circles([[x - 4, seg.y0 - h * 0.55, 6], [x - 4, seg.y1 - h * 0.55, 6]]); ctx.fill();
    return;
  }
  fillR('woodSh', x - 5, seg.y0 - h, 10, seg.y1 - seg.y0 + h - 4); fillR('board', x - 3, seg.y0 - h, 4, seg.y1 - seg.y0 + h - 4);
  ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#5E8A4E'; circles([[x, seg.y0 - h * 0.5, 4], [x, seg.y1 - h * 0.6, 4]]); ctx.fill(); ctx.restore();
  ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 3, seg.y1 - 34); ctx.lineTo(x + 16, seg.y1 - 2); ctx.stroke();
  fillC('iron', x, seg.y1 - 2, 3.5);
}
function drawBarnBack() {
  const { x0, x1 } = BARN_BACK;
  fillR('roofSh', x0 - 12, 1700, x1 - x0 + 24, 70); fillR('roof', x0 - 8, 1704, x1 - x0 + 16, 60);
  fillR('barn', x0, 1652, x1 - x0, 48);
  ctx.strokeStyle = P('barnSh'); ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = x0 + 16; x < x1; x += 16) { ctx.moveTo(x, 1652); ctx.lineTo(x, 1700); } ctx.stroke();
  for (const [dx, a, b] of [[2250, 'NORTH', 'SAME'], [2550, 'SOUTH', 'FIELD']]) {
    fillR('trim', dx - 32, 1666, 64, 34, 2); fillR('barnSh', dx - 28, 1670, 56, 30, 1);
    fillR('board', dx - 28, 1653, 56, 12, 2); signText(a, b, dx, 1659, 9.5, 50);
  }
}
function drawHQ(d) {
  const cx = (d.x0 + d.x1) / 2, w = d.x1 - d.x0, north = d.side === 'north', tr = isTruthPass(), sash = north ? 'sashA' : 'sashB';
  fillR('woodSh', cx - 2, d.y0 - 62, 4, 62);
  fillR('wood', cx - 33, d.y0 - 104, 66, 52, 4); fillR(sash, cx - 30, d.y0 - 101, 60, 46, 3);
  ctx.save(); ctx.translate(cx - 3, d.y0 - 80); ctx.scale(0.95, 0.95); ctx.translate(0, 57);
  if (tr) { wolfHead(-57); wolfEars(-57); } else humanHead('candidate', -57);
  ctx.restore();
  fillR('wood', d.x0, d.y1 - 30, w, 30, 2); fillR('woodSh', d.x0 - 3, d.y1 - 34, w + 6, 6, 2);
  fillR(sash, d.x0 + 8, d.y1 - 24, w - 16, 15, 2);
  text(tr ? 'WOLFGANG HQ' : north ? 'ROM HQ' : 'REM HQ', cx, d.y1 - 16.5, 10, tr ? F_TRUTH : F_CANDY, P('eyeW'), w - 22);
}
const FIELD_FENCE = [];
(function () {
  const run = (x0, y0, x1, y1) => {
    const horiz = y0 === y1, len = horiz ? x1 - x0 : y1 - y0, n = Math.max(1, Math.round(len / 29)), step = len / n;
    for (let i = 0; i < n; i++) {
      const a = (horiz ? x0 : y0) + i * step;
      const seg = horiz ? { x: a, y: y0, len: step, v: false } : { x: x0, y: a, len: step, v: true };
      seg.delay = 999; seg.sortY = horiz ? y0 : a + step / 2;
      seg.bx0 = seg.x - 6; seg.by0 = seg.y - 34; seg.bx1 = seg.x + (horiz ? step : 0) + 6; seg.by1 = seg.y + (horiz ? 4 : step + 4);
      FIELD_FENCE.push(seg);
    }
  };
  run(1913, 1140, 2887, 1140); run(1913, 1140, 1913, 1650); run(2887, 1140, 2887, 1650);
  run(1913, 1650, 2100, 1650); run(2700, 1650, 2887, 1650);
})();
for (const seg of FIELD_FENCE) addStatic(seg.sortY, seg.bx0, seg.by0, seg.bx1, seg.by1, () => drawFenceSeg(seg));
for (let y = DIVIDER.y0; y < DIVIDER.y1; y += 34) { const seg = { y0: y, y1: Math.min(DIVIDER.y1, y + 34) }; addStatic(seg.y1, DIVIDER.x - 24, seg.y0 - 60, DIVIDER.x + 24, seg.y1 + 2, () => drawDividerSeg(seg)); }
addStatic(1700, 2080, 1640, 2720, 1780, drawBarnBack);
for (const d of HQ) addStatic(d.y1, d.x0 - 20, d.y0 - 110, d.x1 + 20, d.y1 + 4, () => drawHQ(d));
for (const t of REGION_TREES) addStatic(t.y, t.x - 30 * t.s, t.y - 86 * t.s, t.x + 30 * t.s, t.y + 2, () => drawOutTree(t.x, t.y, t.s));

/* new characters: the searchlight tower */
function drawTower(w) {
  const wolfy = isTruthPass() || G.disguisesGone || RR > 0.5;
  ctx.save(); ctx.translate(w.x, w.y);
  ctx.fillStyle = P('shadow'); ell(0, 2, 30, 8); ctx.fill();
  ctx.strokeStyle = P('woodSh'); ctx.lineCap = 'round'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-14, -112); ctx.moveTo(22, 0); ctx.lineTo(14, -112); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(-20, -22); ctx.lineTo(18, -58); ctx.moveTo(20, -22); ctx.lineTo(-18, -58); ctx.moveTo(-17, -64); ctx.lineTo(16, -98); ctx.moveTo(17, -64); ctx.lineTo(-16, -98);
  ctx.stroke();
  fillR('wood', -34, -122, 68, 12, 3);
  ctx.save(); ctx.translate(-12, -142); ctx.scale(0.75, 0.75); ctx.translate(0, 57);
  fillR('coat', -11, -48, 22, 20, 6);
  if (wolfy) { wolfHead(-57); wolfEars(-57); } else humanHead('nurse', -57);
  fillR('coat', -9, -73, 18, 8, 3);
  ctx.fillStyle = '#FF5FA2'; ctx.beginPath(); ctx.moveTo(0, -66.5); ctx.bezierCurveTo(-5, -70, -3, -74, 0, -71.5); ctx.bezierCurveTo(3, -74, 5, -70, 0, -66.5); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = P('wood'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-32, -122); ctx.lineTo(-32, -140); ctx.lineTo(32, -140); ctx.lineTo(32, -122); ctx.moveTo(-32, -131); ctx.lineTo(32, -131); ctx.stroke();
  ctx.save(); ctx.translate(16, -138);
  fillC('iron', 0, 0, 9.5);
  ctx.fillStyle = '#FFF6C0'; ell(Math.cos(w.dir) * 5, Math.sin(w.dir) * 3.5, 6.5, 5.5); ctx.fill();
  ctx.restore();
  ctx.restore();
}

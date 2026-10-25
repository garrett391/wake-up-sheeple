/* ---------------- buildings and props ---------------- */
function drawBarn() {
  const { x0, x1, y1 } = BARN, cx = (x0 + x1) / 2, top = y1 - 96;
  ctx.fillStyle = P('roofSh'); ctx.beginPath(); ctx.moveTo(x0 - 14, top + 4); ctx.lineTo(cx, top - 70); ctx.lineTo(x1 + 14, top + 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P('roof'); ctx.beginPath(); ctx.moveTo(x0 - 8, top + 1); ctx.lineTo(cx, top - 64); ctx.lineTo(x1 + 8, top + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P('barn'); ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 56); ctx.lineTo(x1, top); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P('barnSh'); ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = x0 + 14; x < x1; x += 16) { const tt = top - 56 * (1 - Math.abs(x - cx) / (cx - x0)); ctx.moveTo(x, tt + 3); ctx.lineTo(x, y1); }
  ctx.stroke();
  ctx.strokeStyle = P('trim'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(cx, top - 56); ctx.lineTo(x1, top); ctx.stroke();
  fillR('trim', cx - 15, top - 36, 30, 26, 2); fillR('woodSh', cx - 11, top - 32, 22, 20, 1);
  fillR('board', cx - 80, top + 6, 160, 24, 4);
  signText('EVERY VOTE COUNTS!', 'EITHER WAY, WE EAT', cx, top + 18.5, 15, 148);
  const labels = [['NORTH', 'SAME'], ['SOUTH', 'FIELD']];
  [-50, 50].forEach((dx, i) => {
    const d = cx + dx;
    fillR('trim', d - 34, y1 - 50, 68, 50, 2); fillR('barnSh', d - 30, y1 - 46, 60, 46, 1);
    ctx.strokeStyle = P('trim'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(d - 30, y1 - 46); ctx.lineTo(d + 30, y1); ctx.moveTo(d + 30, y1 - 46); ctx.lineTo(d - 30, y1); ctx.stroke();
    fillR('board', d - 27, y1 - 64, 54, 13, 3);
    signText(labels[i][0], labels[i][1], d, y1 - 57.5, 10, 48);
  });
}
function drawClinic() {
  const { x0, x1, y0, y1 } = CLINIC, cx = (x0 + x1) / 2, top = y1 - 78;
  fillR('clinicRf', x0 - 6, y0 - 18, x1 - x0 + 12, top - y0 + 22, 4);
  fillR('clinic', x0, top, x1 - x0, y1 - top);
  fillR('clinicSh', x0, top, x1 - x0, 6);
  fillR('board', cx - 76, y0 - 12, 152, 22, 4);
  text("DR. FANGSWORTH'S", cx, y0 - 0.5, 13, isTruthPass() ? F_TRUTH : F_CANDY, P('ink'), 142);
  fillR('clinicRf', cx - 14, y1 - 46, 28, 46, 3); fillC('trim', cx + 8, y1 - 22, 1.8);
  for (const wx of [x0 + 22, x1 - 50]) { fillR('trim', wx - 3, top + 13, 34, 28, 3); fillR('glass', wx, top + 16, 28, 22, 2); }
  if (isTruthPass()) { ctx.strokeStyle = P('ink'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0 + 28, top + 20); ctx.lineTo(x0 + 44, top + 34); ctx.moveTo(x0 + 44, top + 20); ctx.lineTo(x0 + 28, top + 34); ctx.stroke(); }
  else { fillC('awnA', x1 - 36, top + 27, 6.5); fillC('awnB', x1 - 36, top + 27, 3); }
}
function drawShack() {
  const { x0, x1, y1 } = SHACK, cx = (x0 + x1) / 2, top = y1 - 52;
  fillR('shack', x0, top, x1 - x0, 52);
  fillR('shackSh', x0, y1 - 20, x1 - x0, 20);
  fillR('woodSh', x0 - 4, y1 - 22, x1 - x0 + 8, 4, 2);
  for (let i = 0; i < 4; i++) fillR(i % 2 ? 'candyA' : 'candyB', x0 + 14 + i * 25, y1 - 32, 14, 10, 2);
  if (isTruthPass()) text('SUGAR', cx, y1 - 10, 9, F_TRUTH, P('ink'), 60);
  const aw0 = x0 - 10, aw1 = x1 + 10, ay = top - 10, n = 8, sw = (aw1 - aw0) / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = P(i % 2 ? 'awnB' : 'awnA'); ctx.beginPath();
    ctx.moveTo(aw0 + i * sw, ay - 14); ctx.lineTo(aw0 + (i + 1) * sw, ay - 14); ctx.lineTo(aw0 + (i + 1) * sw, ay + 6);
    ctx.arc(aw0 + i * sw + sw / 2, ay + 6, sw / 2, 0, Math.PI); ctx.closePath(); ctx.fill();
  }
  fillR('wood', cx - 74, ay - 44, 148, 30, 5); fillR('board', cx - 70, ay - 41, 140, 24, 4);
  signText('FREE SUGAR LICKS', 'FAT, DUMB & HAPPY', cx, ay - 29, 15, 128);
}
function drawTrough() {
  const { x0, x1, y0, y1 } = TROUGH;
  fillR('woodSh', x0, y0 - 6, x1 - x0, 12, 3);
  fillR('food', x0 + 4, y0 - 4, x1 - x0 - 8, 8, 3);
  for (const f of FOOD) { if (isTruthPass()) fillR('woodSh', f[0], f[1], 2, 1.4); else fillC(f[2] ? 'shack' : 'awnB', f[0], f[1], 1.6); }
  fillR('wood', x0, y0 + 4, x1 - x0, y1 - y0 - 2, 3);
  signText('CLOVER CRUNCH', '0% CLOVER', (x0 + x1) / 2, y0 + 16, 13, x1 - x0 - 18);
  fillR('woodSh', x0 + 6, y1 + 1, 6, 6); fillR('woodSh', x1 - 12, y1 + 1, 6, 6);
}
function drawSacks() {
  for (const [x, y, s] of [[783, 772, 1], [804, 768, 0.88]]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    fillE('sack', 0, -13, 11.5, 13.5); fillE('sack', 0, -26, 6.5, 4); fillR('woodSh', -6, -24, 12, 2.4, 1);
    text('CC', 0, -11, 9, isTruthPass() ? F_TRUTH : F_CANDY, P('sackInk'));
    ctx.restore();
  }
}
function drawCrate() {
  const x0 = 776, x1 = 812, y1 = 346;
  fillR('woodSh', x0, y1 - 30, x1 - x0, 30, 2); fillR('wood', x0 + 2, y1 - 28, x1 - x0 - 4, 26, 1);
  ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 2, y1 - 28); ctx.lineTo(x1 - 2, y1 - 2); ctx.moveTo(x1 - 2, y1 - 28); ctx.lineTo(x0 + 2, y1 - 2); ctx.stroke();
  fillR('woodSh', x0 - 1, y1 - 34, x1 - x0 + 2, 6, 2);
  text(isTruthPass() ? 'DONATIONS' : 'VOTE!', (x0 + x1) / 2, y1 - 15, 8, isTruthPass() ? F_TRUTH : F_CANDY, P('board'), 30);
}
function drawBoard() {
  const x = 334, y = 706;
  fillR('woodSh', x - 15, y - 28, 3, 28); fillR('woodSh', x + 12, y - 28, 3, 28);
  fillR('wood', x - 20, y - 54, 40, 30, 3); fillR('board', x - 16, y - 50, 32, 22, 2);
  signText('SMILE!', 'PRICES', x, y - 39, 10, 28);
}
function drawBillboard() {
  const cx = RAINBOW.x, by = 248;
  if (RT < 0.5 && RR < 0.5) {
    const cols = ['#FF5FA2', '#FF9F43', '#FFE14D', '#7BE38F', '#7FD8FF', '#B69CFF'];
    ctx.lineCap = 'butt';
    cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 9.5; ctx.beginPath(); ctx.arc(cx, by, 94 - i * 9, Math.PI, TAU); ctx.stroke(); });
    for (const fx of [cx - 70, cx + 70]) { ctx.fillStyle = '#FFFFFF'; circles([[fx - 15, by - 4, 12], [fx, by - 13, 15], [fx + 15, by - 4, 12], [fx, by + 1, 11]]); ctx.fill(); }
    return;
  }
  fillR('woodSh', 430, 136, 8, 116); fillR('woodSh', 562, 136, 8, 116);
  fillR('wood', 408, 136, 184, 100, 2);
  ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 1; ctx.beginPath(); for (let y = 156; y < 236; y += 20) { ctx.moveTo(408, y); ctx.lineTo(592, y); } ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.32;
  ['#B98A8A', '#B99A7A', '#B9B07A', '#8AA88A', '#8AA0B0', '#9A8AB0'].forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, 232, 80 - i * 8, Math.PI, TAU); ctx.stroke(); });
  ctx.restore();
  fillR('board', 424, 216, 152, 15, 2);
  text(G.ch === 2 ? 'PROPERTY OF HOG HOLDINGS MARKETING' : 'PROPERTY OF GREENER PASTURES MARKETING', cx, 223.5, 9, F_TRUTH, P('ink'), 144);
}
function drawSunnyGate() {
  const x0 = 150, x1 = 230, y = FY0, cx = 190;
  ctx.strokeStyle = P('iron'); ctx.lineWidth = 2; ctx.beginPath();
  for (let x = x0 + 6; x < x1; x += 9) { ctx.moveTo(x, y); ctx.lineTo(x, y - 40); }
  ctx.moveTo(x0, y - 34); ctx.lineTo(x1, y - 34); ctx.moveTo(x0, y - 12); ctx.lineTo(x1, y - 12); ctx.stroke();
  fillR('trim', x0 - 7, y - 60, 9, 60, 2); fillR('trim', x1 - 2, y - 60, 9, 60, 2);
  fillR('wood', cx - 104, y - 92, 208, 30, 5); fillR('board', cx - 100, y - 89, 200, 24, 4);
  signText('SUNNY ACRES: HEATED POOL!', 'NOBODY HAS EVER COME BACK', cx, y - 77, 14, 188);
}
function drawGatePosts() {
  fillR('woodSh', GATE0 - 8, FY1 - 64, 10, 64, 2); fillR('woodSh', GATE1 - 2, FY1 - 64, 10, 64, 2);
  if (!G.flags.fenceDown) {
    for (const [a, b] of [[GATE0 + 2, GATEX - 1], [GATEX + 1, GATE1 - 2]]) {
      fillR('wood', a, FY1 - 34, b - a, 30, 2);
      ctx.strokeStyle = P('woodSh'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, FY1 - 34); ctx.lineTo(b, FY1 - 4);
      for (let x = a + 12; x < b; x += 12) { ctx.moveTo(x, FY1 - 34); ctx.lineTo(x, FY1 - 4); }
      ctx.stroke();
    }
  }
  if (G.flags.fenceDown && G.fenceT > 0.4) return;
  fillR('wood', GATE0 - 16, FY1 - 66, GATE1 - GATE0 + 32, 26, 4);
  fillR('board', GATE0 - 12, FY1 - 63, GATE1 - GATE0 + 24, 20, 3);
  signText('GREENER PASTURES RANCH', 'THE GRASS IS PAINTED', GATEX, FY1 - 53, 13, GATE1 - GATE0 + 14);
}
function drawSign(sg) {
  const { x, y, w } = sg, h = 26;
  fillR('woodSh', x - 3, y - 22, 6, 22);
  fillR('wood', x - w / 2 - 3, y - 22 - h - 3, w + 6, h + 6, 5);
  fillR('board', x - w / 2, y - 22 - h, w, h, 4);
  signText(sg.candy, sg.truth, x, y - 22 - h / 2 + 1, 14, w - 12);
}
function drawLolliTree(x, y) {
  if (RT < 0.5 && RR < 0.5) {
    fillR('ltTrunk', x - 3, y - 44, 6, 44, 2);
    ctx.strokeStyle = '#FF5FA2'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 5; i++) { ctx.moveTo(x - 3, y - 6 - i * 8); ctx.lineTo(x + 3, y - 10 - i * 8); }
    ctx.stroke();
    fillC('ltTop', x, y - 60, 22);
    ctx.strokeStyle = P('ltTop2'); ctx.lineWidth = 4; ctx.beginPath();
    for (let a = 0; a < 11; a += 0.25) ctx.lineTo(x + Math.cos(a) * a * 1.8, y - 60 + Math.sin(a) * a * 1.8);
    ctx.stroke();
    return;
  }
  ctx.strokeStyle = P('ltTrunk'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 1, y - 30); ctx.lineTo(x + 12, y); ctx.stroke();
  fillC('ltTop', x, y - 60, 22); fillR('ltTop', x - 3, y - 44, 6, 44);
  text('PROP', x, y - 60, 9, F_TRUTH, P('ink'), 34);
}
function drawOutTree(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillR('otTrunk', -4, -40, 8, 40, 2);
  if (RT < 0.5 && RR < 0.5) {
    ctx.strokeStyle = P('otTrunk'); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(0, -36); ctx.lineTo(-14, -58); ctx.moveTo(0, -40); ctx.lineTo(12, -62); ctx.moveTo(-8, -48); ctx.lineTo(-20, -50);
    ctx.moveTo(6, -52); ctx.lineTo(18, -54); ctx.moveTo(0, -42); ctx.lineTo(1, -66); ctx.stroke();
  } else {
    ctx.fillStyle = P('otTop'); circles([[-12, -52, 14], [10, -54, 15], [0, -66, 16], [0, -46, 14]]); ctx.fill();
    ctx.fillStyle = P('otTop2'); circles([[-5, -68, 8], [8, -59, 7]]); ctx.fill();
  }
  ctx.restore();
}
function drawRock(r) {
  if (r.bush && (RT > 0.5 || RR > 0.5)) { ctx.fillStyle = P('otTop'); circles([[r.x - 9 * r.s, r.y - 6 * r.s, 9 * r.s], [r.x + 8 * r.s, r.y - 7 * r.s, 10 * r.s], [r.x, r.y - 13 * r.s, 9 * r.s]]); ctx.fill(); return; }
  fillE('rock2', r.x, r.y - 4 * r.s, 13 * r.s, 8 * r.s); fillE('rock', r.x - 2 * r.s, r.y - 6 * r.s, 10 * r.s, 6 * r.s);
}
function drawBrokenBoards() {
  const tr = isTruthPass();
  ctx.save(); ctx.translate(1232, 842); ctx.rotate(0.5); fillR('fence', -12, -2, 24, 4); ctx.restore();
  ctx.save(); ctx.translate(1208, 760); ctx.rotate(-0.25); fillR('fence', -2, -22, 4, 22); ctx.restore();
  if (tr) { ctx.strokeStyle = P('wire'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(FX1, HOLE0 - 25); ctx.quadraticCurveTo(FX1 + 10, HOLE0 + 10, FX1 + 4, HOLE0 + 24); ctx.stroke(); }
}
function picket(x, h, w) {
  ctx.fillStyle = P('fence'); ctx.beginPath(); ctx.moveTo(x - w, 0); ctx.lineTo(x - w, -h + w); ctx.lineTo(x, -h); ctx.lineTo(x + w, -h + w); ctx.lineTo(x + w, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = P('fenceSh'); ctx.lineWidth = 1; ctx.stroke();
}
function drawFenceSeg(s) {
  const f = G.fenceT > 0 ? clamp((G.fenceT - s.delay) / 0.45, 0, 1) : 0;
  const tr = isTruthPass();
  ctx.save(); ctx.translate(s.x, s.y);
  if (f >= 1) { ctx.globalAlpha = 0.8; if (s.v) fillR('fenceSh', -2, 0, 4, s.len); else fillR('fenceSh', 0, 2, s.len, 4); ctx.restore(); return; }
  if (f > 0) { if (s.v) ctx.rotate((s.x < 640 ? -1 : 1) * easeOut(f) * 1.45); else ctx.scale(1, s.y > 600 ? 1 - easeOut(f) * 1.25 : 1 - easeOut(f) * 0.9); }
  if (!s.v) {
    if (tr) {
      fillR('fence', -2.5, -30, 5, 30, 1);
      ctx.strokeStyle = P('wire'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(s.len, -25); ctx.moveTo(0, -15); ctx.lineTo(s.len, -15); ctx.stroke();
      fillC('fenceSh', 0, -25, 1.8); fillC('fenceSh', 0, -15, 1.8);
    } else {
      fillR('fenceSh', 0, -20.5, s.len, 4); fillR('fenceSh', 0, -10.5, s.len, 4);
      fillR('fence', 0, -22, s.len, 3.5); fillR('fence', 0, -12, s.len, 3.5);
      picket(0, 30, 3.4); picket(s.len / 3, 25, 2.6); picket((2 * s.len) / 3, 25, 2.6);
    }
  } else if (tr) {
    fillR('fence', -2.5, -30, 5, 30, 1);
    ctx.strokeStyle = P('wire'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-1, -25); ctx.lineTo(-1, s.len - 25); ctx.moveTo(1, -15); ctx.lineTo(1, s.len - 15); ctx.stroke();
  } else {
    fillR('fenceSh', -1.2, -21, 3.6, s.len); fillR('fence', -1.8, -22, 3.6, s.len);
    picket(0, 30, 3.4);
    for (const k of [1 / 3, 2 / 3]) { ctx.save(); ctx.translate(0, s.len * k); picket(0, 25, 2.6); ctx.restore(); }
  }
  ctx.restore();
}

const STATIC = [];
function addStatic(y, x0, y0, x1, y1, draw) { const d = { y, x0, y0, x1, y1, draw }; STATIC.push(d); return d; }
addStatic(BARN.y1, BARN.x0 - 20, BARN.y0 - 110, BARN.x1 + 20, BARN.y1 + 5, drawBarn);
addStatic(CLINIC.y1, CLINIC.x0 - 10, CLINIC.y0 - 30, CLINIC.x1 + 10, CLINIC.y1 + 5, drawClinic);
addStatic(SHACK.y1, SHACK.x0 - 20, SHACK.y0 - 70, SHACK.x1 + 20, SHACK.y1 + 5, drawShack);
addStatic(TROUGH.y1, TROUGH.x0 - 5, TROUGH.y0 - 15, TROUGH.x1 + 5, TROUGH.y1 + 10, drawTrough);
addStatic(772, 765, 735, 820, 775, drawSacks);
addStatic(346, 770, 300, 820, 350, drawCrate);
addStatic(706, 310, 645, 360, 708, drawBoard);
addStatic(252, 400, 120, 600, 258, drawBillboard);
addStatic(FY0 + 1, 80, FY0 - 95, 300, FY0 + 5, drawSunnyGate);
addStatic(FY1 + 2, GATE0 - 20, FY1 - 70, GATE1 + 20, FY1 + 8, drawGatePosts);
addStatic(845, 1195, 735, 1250, 850, drawBrokenBoards);
for (const sg of SIGNS) addStatic(sg.y, sg.x - sg.w / 2 - 5, sg.y - 60, sg.x + sg.w / 2 + 5, sg.y + 2, () => drawSign(sg));
for (const [x, y] of LOLLI) addStatic(y, x - 26, y - 86, x + 26, y + 2, () => drawLolliTree(x, y));
for (const t of OUTTREES) addStatic(t.y, t.x - 30 * t.s, t.y - 86 * t.s, t.x + 30 * t.s, t.y + 2, () => drawOutTree(t.x, t.y, t.s)).treeAt = [t.x, t.y];
for (const r of ROCKS) addStatic(r.y, r.x - 22, r.y - 26, r.x + 22, r.y + 4, () => drawRock(r));
for (const seg of FENCE) addStatic(seg.sortY, seg.bx0, seg.by0, seg.bx1, seg.by1, () => drawFenceSeg(seg));

/* ---------------- ground ---------------- */
const VB = { x0: 0, y0: 0, x1: 0, y1: 0 };
const inVB = (x, y) => x >= VB.x0 && x <= VB.x1 && y >= VB.y0 && y <= VB.y1;
const FLOWER_COLS = ['#FF5FA2', '#FFE14D', '#B69CFF', '#7FD8FF', '#FF9F43'];
const WILD_COLS = ['#FFFFFF', '#FFD84A', '#C9A8FF'];
function tuftPath(x, y) { ctx.moveTo(x - 3, y); ctx.lineTo(x - 4.5, y - 5); ctx.moveTo(x, y); ctx.lineTo(x + 0.5, y - 7); ctx.moveTo(x + 3, y); ctx.lineTo(x + 5, y - 4.5); }
function drawGround() {
  ctx.fillStyle = P('out'); ctx.fillRect(VB.x0, VB.y0, VB.x1 - VB.x0, VB.y1 - VB.y0);
  ctx.strokeStyle = P('out2'); ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
  for (const t of TUFTS_OUT) if (inVB(t[0], t[1])) tuftPath(t[0], t[1]);
  ctx.stroke();
  ctx.lineCap = 'butt'; ctx.lineJoin = 'round'; ctx.strokeStyle = P('road'); ctx.lineWidth = 64;
  ctx.beginPath(); ctx.moveTo(GATEX, FY1); ctx.lineTo(GATEX + 10, 1180); ctx.lineTo(GATEX - 30, MH + 30); ctx.stroke();
  fillE('mud', GLASSES_AT.x, GLASSES_AT.y + 2, 54, 25);
  fillE('mud2', GLASSES_AT.x - 16, GLASSES_AT.y + 7, 18, 7); fillE('mud2', GLASSES_AT.x + 22, GLASSES_AT.y - 5, 11, 5);
  const tr = isTruthPass(), real = RR > 0.5;
  for (const f of WILDFLOWERS) {
    if (!inVB(f.x, f.y)) continue;
    if (!tr && !real) fillC('rock2', f.x, f.y - 3, 1.6);
    else { ctx.fillStyle = WILD_COLS[f.c]; circles([[f.x - 2, f.y - 4, 1.7], [f.x + 2, f.y - 4, 1.7], [f.x, f.y - 6, 1.7], [f.x, f.y - 2, 1.7]]); ctx.fill(); }
  }
  ctx.fillStyle = P('grass'); ctx.fillRect(FX0, FY0, FX1 - FX0, FY1 - FY0);
  ctx.fillStyle = P('grass2'); for (let x = FX0 + 30; x < FX1 - 20; x += 116) ctx.fillRect(x, FY0, 52, FY1 - FY0);
  fillE('hill', HILL.x, HILL.y, 150, 78); fillE('hillHi', HILL.x - 14, HILL.y - 14, 110, 50);
  ctx.lineCap = 'round'; ctx.beginPath();
  for (const p of PATHS) { ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); }
  ctx.strokeStyle = P('path'); ctx.lineWidth = 32; ctx.stroke();
  ctx.strokeStyle = P('path2'); ctx.lineWidth = 18; ctx.stroke();
  ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.6; ctx.beginPath();
  for (const t of TUFTS_IN) if (inVB(t[0], t[1])) tuftPath(t[0], t[1]);
  ctx.stroke();
  const tm = G.clock;
  for (const f of FLOWERS) {
    if (!inVB(f.x, f.y)) continue;
    if (real) {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath();
      for (let i = 0; i < 5; i++) { const a = (i * TAU) / 5, px = f.x + Math.cos(a) * 2.2, py = f.y - 4 + Math.sin(a) * 2.2; ctx.moveTo(px + 1.6, py); ctx.arc(px, py, 1.6, 0, TAU); }
      ctx.fill(); ctx.fillStyle = '#F2C230'; circ(f.x, f.y - 4, 1.3); ctx.fill();
    } else if (tr) {
      ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.quadraticCurveTo(f.x + 1, f.y - 8, f.x + 4.5, f.y - 5.5); ctx.stroke();
      fillC('rock2', f.x + 5, f.y - 4.5, 2.1);
    } else {
      const sway = RM ? 0 : Math.sin(tm * 2 + f.ph) * 1.6, x = f.x + sway, y = f.y - 7 * f.s, r = 2.4 * f.s;
      ctx.strokeStyle = P('tuft'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = FLOWER_COLS[f.c]; ctx.beginPath();
      for (let i = 0; i < 5; i++) { const a = (i * TAU) / 5 + f.ph, px = x + Math.cos(a) * 3.1 * f.s, py = y + Math.sin(a) * 3.1 * f.s; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU); }
      ctx.fill(); ctx.fillStyle = '#FFF6C8'; circ(x, y, 1.7 * f.s); ctx.fill();
    }
  }
}
function drawGlassesProp() {
  if (G.glasses.taken) return;
  const { x, y } = GLASSES_AT;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#2B1B4A'; ctx.lineWidth = 2.2; ctx.fillStyle = 'rgba(200,235,255,0.4)';
  ell(-7, 0, 6, 4.4); ctx.fill(); ctx.stroke(); ell(7, 0, 6, 4.4); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-1.2, -0.6); ctx.lineTo(1.2, -0.6); ctx.stroke();
  const g = (Math.sin(G.clock * 3) + 1) / 2;
  sparkle(-9, -7, 4 + g * 5, 'rgba(255,255,255,' + (0.55 + g * 0.45).toFixed(2) + ')');
  ctx.restore();
}

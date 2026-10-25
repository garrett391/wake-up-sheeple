/* ---------------- sheep ---------------- */
const PUFFS = [[-14, 3, 7.5], [-9, -5, 9], [0, -8, 9.5], [9, -5, 8.5], [14, 3, 7], [7, 8, 8], [-3, 9, 8], [-12, 8, 7], [0, 1, 11]];
function exprFor(s, isP) {
  if (isP) return s.caughtFx > 0 ? 'wide' : 'open';
  if (s.wakeFx > 0 || s.panic > 0) return 'wide';
  if (s.deep) return 'wide';
  if (s.state === 'woke') return 'open';
  return isTruthPass() ? 'glazed' : 'happy';
}
function eye(x, y, expr) {
  const pc = P('pupil');
  if (expr === 'happy') { ctx.strokeStyle = pc; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x, y + 1.4, 2.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); return; }
  if (expr === 'closed') { ctx.strokeStyle = pc; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x - 1.9, y + 0.6); ctx.lineTo(x + 1.9, y + 0.6); ctx.stroke(); return; }
  const r = expr === 'wide' ? 3 : 2.6;
  fillC('eyeW', x, y, r);
  if (expr === 'glazed') {
    ctx.fillStyle = pc; circ(x + 0.2, y + 1, 1.1); ctx.fill();
    ctx.fillStyle = P('faceSh'); ctx.beginPath(); ctx.arc(x, y, r + 0.3, Math.PI, TAU); ctx.lineTo(x + r + 0.3, y + 0.6); ctx.lineTo(x - r - 0.3, y + 0.6); ctx.closePath(); ctx.fill();
    return;
  }
  ctx.fillStyle = pc; circ(x + 0.7, y + 0.2, expr === 'wide' ? 1.25 : 1.6); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; circ(x + 1.2, y - 0.6, 0.55); ctx.fill();
}
function drawSpecsOnFace(x1, x2, y) {
  ctx.strokeStyle = P('frames'); ctx.lineWidth = 1.3; ctx.fillStyle = 'rgba(190,232,255,0.28)';
  circ(x1, y, 3.3); ctx.fill(); ctx.stroke(); circ(x2, y, 3.3); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1 - 3.3, y - 0.6); ctx.lineTo(x1 - 7.6, y - 2.8); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x2, y, 2.3, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
}
function drawSheep(s, isP, opt) {
  const sc = s.scale || 1;
  const portrait = opt && opt.portrait;
  ctx.save();
  ctx.translate(s.x, s.y);
  if (!portrait) { ctx.fillStyle = P('shadow'); ell(0, 1, 19 * sc, 6 * sc); ctx.fill(); }
  ctx.scale((s.facing || 1) * sc, sc);
  const moving = s.walk > 0.15;
  const bob = moving ? Math.abs(Math.sin(s.phase)) * 2.4 : 0;
  const hop = s.hopT > 0 ? Math.sin((1 - s.hopT) * Math.PI) * 9 : 0;
  ctx.translate(0, -bob - hop);
  const graze = s.grazing && !moving;
  const sw = moving ? Math.sin(s.phase) * 3 : 0;
  ctx.fillStyle = P('legs');
  rrect(-13 + sw, -12, 4.2, 12 + bob, 2); ctx.fill();
  rrect(-6 - sw, -12, 4.2, 12 + bob, 2); ctx.fill();
  rrect(5 - sw, -12, 4.2, 12 + bob, 2); ctx.fill();
  rrect(11 + sw, -12, 4.2, 12 + bob, 2); ctx.fill();
  const by = -22;
  const dark = isP ? G.playerDark : 0;
  const woolC = dark > 0 ? PM('wool', 'blackWool', dark) : P('wool');
  const woolS = dark > 0 ? PM('woolSh', 'blackWool', Math.min(1, dark * 1.15)) : P('woolSh');
  ctx.fillStyle = woolS; ctx.beginPath();
  for (const c of PUFFS) { ctx.moveTo(c[0] + c[2] + 1.6, by + c[1]); ctx.arc(c[0], by + c[1], c[2] + 1.6, 0, TAU); }
  ctx.fill();
  ctx.fillStyle = woolC; ctx.beginPath();
  for (const c of PUFFS) { ctx.moveTo(c[0] + c[2], by + c[1] - 0.8); ctx.arc(c[0], by + c[1] - 0.8, c[2], 0, TAU); }
  ctx.fill();
  ctx.fillStyle = P('woolHi'); ell(-4, by - 8, 7, 3.6, -0.2); ctx.fill();
  if (s.id === 'nana') { ctx.fillStyle = P('shawl'); ctx.beginPath(); ctx.moveTo(-8, by - 8); ctx.quadraticCurveTo(4, by - 2, 13, by - 9); ctx.lineTo(14, by + 1); ctx.quadraticCurveTo(3, by + 7, -7, by + 1); ctx.closePath(); ctx.fill(); }
  if (s.id === 'doug' || s.id === 'norm') { fillC('sashA', 2, by + 3, 3.6); fillC('wool', 2, by + 3, 1.3); }
  if (s.id === 'southby') { fillC('sashB', 2, by + 3, 3.6); fillC('wool', 2, by + 3, 1.3); }
  if (s.deep) { ctx.strokeStyle = '#D9342B'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, by - 6); ctx.lineTo(-2, by + 1); ctx.lineTo(6, by - 7); ctx.stroke(); fillC('bow', -2, by + 1, 2.4); fillC('woolHi', -2.6, by + 0.4, 0.9); }
  const hx = graze ? 18 : 16.5, hy = graze ? by + 11 : by - 6;
  ctx.save(); ctx.translate(hx, hy); if (graze) ctx.rotate(0.35);
  fillE('faceSh', -6.5, -5, 6, 2.6, -0.55);
  if (isP) fillR('tag', -11.5, -7, 3.8, 4.4, 1);
  fillE('face', 0, 0, 8.4, 10);
  fillE('face', 6.4, -6.6, 5.2, 2.4, 0.65);
  ctx.fillStyle = woolC; circles([[-2.5, -8.6, 4.6], [2.5, -9.6, 4], [-6, -5.6, 3.4]]); ctx.fill();
  const ex1 = -1.5, ex2 = 5.6, ey = -1;
  const ex = exprFor(s, isP);
  if (graze) { eye(ex1, ey, 'closed'); eye(ex2, ey, 'closed'); } else { eye(ex1, ey, ex); eye(ex2, ey, ex); }
  if (!graze && ex !== 'glazed') fillE('cheek', -3.4, 4.4, 2.4, 1.5);
  ctx.strokeStyle = P('pupil'); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  if (graze) { const ch = RM ? 0.6 : Math.abs(Math.sin(G.clock * 9 + s.x)) * 1.3; fillE('faceSh', 4.6, 6.4, 1.9, 0.6 + ch); }
  else if (ex === 'glazed') { ctx.beginPath(); ctx.moveTo(2.4, 6); ctx.lineTo(6, 6); ctx.stroke(); }
  else if (ex === 'wide') { fillE('faceSh', 4.2, 5.8, 1.6, 2); }
  else { ctx.beginPath(); ctx.arc(3.6, 4.4, 2.4, 0.25, Math.PI - 0.55); ctx.stroke(); }
  if (s.state === 'woke' && !isP && !graze) {
    ctx.strokeStyle = P('pupil'); ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(ex1 - 2.2, ey - 4.8); ctx.lineTo(ex1 + 1.8, ey - 3.8); ctx.moveTo(ex2 - 1.8, ey - 3.8); ctx.lineTo(ex2 + 2.2, ey - 4.8); ctx.stroke();
  }
  if (isP && s.specsOn) drawSpecsOnFace(ex1, ex2, ey);
  if (s.id === 'barbara') {
    ctx.fillStyle = P('bow'); ctx.beginPath();
    ctx.moveTo(-2, -12); ctx.lineTo(-8.5, -16.5); ctx.lineTo(-7.5, -8.5); ctx.closePath();
    ctx.moveTo(-2, -12); ctx.lineTo(3.5, -17.5); ctx.lineTo(4.5, -9.5); ctx.closePath(); ctx.fill();
    fillC('bow', -2, -12.2, 2);
  }
  if (s.id === 'ewenice') {
    fillE('shawl', -1, -10.5, 11.5, 3.2, -0.12);
    ctx.fillStyle = P('shawl'); rrect(-6.5, -19.5, 12, 9.5, 4.5); ctx.fill();
    fillR('bow', -6.5, -13, 12, 2.2);
    fillC('bow', 4.6, -15.8, 2.7); fillC('tag', 4.6, -15.8, 1.1);
  }
  if (s.id === 'gerald') {
    fillE('candyA', -1, -11, 9.5, 5.5, -0.15); fillE('candyA', 1, -15, 7, 4.5, -0.1); fillC('candyA', 4, -18, 3.4);
    ctx.strokeStyle = P('candyB'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(7, -13); ctx.stroke();
  }
  if (s.id === 'kevin') {
    ctx.fillStyle = P('foil'); ctx.beginPath(); ctx.moveTo(-8.5, -8); ctx.lineTo(-1.5, -29); ctx.lineTo(7, -9.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P('foilSh'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(0, -17); ctx.lineTo(-2, -21); ctx.moveTo(2, -12); ctx.lineTo(4, -16); ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
  if (portrait) return;
  if (!isP && s.state === 'asleep' && isTruthPass()) {
    const zt = (G.clock * 0.55 + s.zT) % 1.8;
    if (zt < 1.3) text('z', s.x + 10 * (s.facing || 1), s.y - 48 * sc - zt * 14, 10 + zt * 5, F_TRUTH, 'rgba(34,33,31,' + (1 - zt / 1.3).toFixed(2) + ')');
  }
  if (s.wakeFx > 0) textOutlined('!', s.x, s.y - 62 * sc - (1 - Math.min(1, s.wakeFx)) * 12, 26, F_CANDY, P('alertInk'), '#FFFFFF');
}

/* ---------------- shepherds (and what is under the hats) ---------------- */
function humanHead(type, hy) {
  if (type === 'granny') fillC('hairG', -3, hy - 3, 6);
  fillC('skin', 0, hy, 9.5);
  ctx.fillStyle = P(type === 'granny' ? 'hairG' : 'hair');
  ctx.beginPath();
  if (type === 'doctor') { ctx.arc(0, hy - 1, 9.9, Math.PI * 0.98, Math.PI * 1.98); ctx.quadraticCurveTo(3, hy - 7, -9, hy - 1); }
  else if (type === 'candidate') { ctx.arc(0, hy - 1.5, 9.8, Math.PI * 0.95, Math.PI * 2.0); ctx.lineTo(4, hy - 5); ctx.closePath(); }
  else { ctx.arc(0, hy - 1.5, 9.7, Math.PI * 0.92, Math.PI * 2.02); ctx.closePath(); }
  ctx.fill();
  ctx.fillStyle = P('pupil'); circ(2.6, hy + 0.5, 1.3); ctx.fill(); circ(7.2, hy + 0.5, 1.3); ctx.fill();
  ctx.strokeStyle = P('pupil'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(5, hy + 3.6, 2.6, 0.3, Math.PI - 0.3); ctx.stroke();
  fillE('cheek', 0.5, hy + 4, 2.2, 1.4);
  fillE('skinSh', 9.4, hy + 1.6, 1.5, 1.8);
}
function wolfHead(hy) {
  fillC('fur', 0, hy, 10);
  fillE('furLt', 8.5, hy + 3.8, 9, 5.2, 0.08);
  fillC('nose', 17, hy + 2.6, 2.4);
  ctx.strokeStyle = P('nose'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(3, hy + 6.8); ctx.quadraticCurveTo(10, hy + 9.6, 16.5, hy + 6); ctx.stroke();
  ctx.fillStyle = P('teeth'); ctx.beginPath();
  for (let i = 0; i < 4; i++) { const x = 5.6 + i * 2.6; ctx.moveTo(x, hy + 7.7); ctx.lineTo(x + 1.3, hy + 10.2); ctx.lineTo(x + 2.6, hy + 7.9); }
  ctx.fill();
  ctx.fillStyle = P('wolfEye'); ell(2.6, hy - 2.6, 2.6, 2, -0.15); ctx.fill(); ell(8.3, hy - 2.9, 2.4, 1.9, 0.15); ctx.fill();
  ctx.fillStyle = P('nose'); ell(3, hy - 2.6, 0.7, 1.7); ctx.fill(); ell(8.7, hy - 2.9, 0.7, 1.6); ctx.fill();
  ctx.strokeStyle = P('furDk'); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-0.5, hy - 6.6); ctx.lineTo(5, hy - 4.8); ctx.moveTo(6.5, hy - 5); ctx.lineTo(11, hy - 6.8); ctx.stroke();
}
function wolfEars(hy) {
  ctx.fillStyle = P('fur'); ctx.beginPath();
  ctx.moveTo(-8.5, hy - 6); ctx.lineTo(-6.5, hy - 22); ctx.lineTo(-1, hy - 8); ctx.closePath();
  ctx.moveTo(1, hy - 8.5); ctx.lineTo(5, hy - 23); ctx.lineTo(8.5, hy - 6.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P('furDk'); ctx.beginPath();
  ctx.moveTo(-6.5, hy - 9); ctx.lineTo(-6, hy - 18); ctx.lineTo(-3.2, hy - 9.5); ctx.closePath();
  ctx.moveTo(3, hy - 9.5); ctx.lineTo(5, hy - 19); ctx.lineTo(6.8, hy - 9.5); ctx.closePath(); ctx.fill();
}
function strawHat(hy, b) {
  const y = hy - 8 - b;
  fillE('hatSh', 0, y + 1.2, 17.5, 4.6); fillE('hat', 0, y, 17, 4.2);
  fillR('hat', -9, y - 9, 18, 10, 5); fillR('band', -9, y - 3.2, 18, 3);
}
function bonnetFront(hy, b) {
  ctx.strokeStyle = P('bonnet'); ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, hy - 1 - b, 11, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
  ctx.strokeStyle = P('band'); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-7, hy + 8); ctx.lineTo(0, hy + 11); ctx.lineTo(7, hy + 8); ctx.stroke();
}
function headMirror(hy, b) {
  ctx.strokeStyle = P('steth'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9.5, hy - 4 - b); ctx.quadraticCurveTo(0, hy - 12 - b, 9.5, hy - 5 - b); ctx.stroke();
  fillC('foil', 4.5, hy - 8.5 - b, 4.3); fillC('foilSh', 4.5, hy - 8.5 - b, 1.7);
}
function drawWolf(w, opt) { drawWolfBody(w, opt); if (!(opt && opt.portrait)) drawStrings(w); }
function drawWolfBody(w, opt) {
  const wolfy = isTruthPass() || G.disguisesGone || RR > 0.5;
  const portrait = opt && opt.portrait;
  ctx.save(); ctx.translate(w.x, w.y);
  if (!portrait && !w.flying) { ctx.fillStyle = P('shadow'); ell(0, 1, w.type === 'twohead' ? 27 : w.type === 'dog' ? 17 : w.type === 'pig' ? 19 : w.type === 'crow' ? 8 : 15, w.type === 'crow' ? 3 : 5.5); ctx.fill(); }
  if (w.type === 'tower') { ctx.restore(); drawTower(w); return; }
  if (w.type === 'crow') { drawCrow(w); ctx.restore(); return; }
  if (w.limp && !portrait) { ctx.translate(0, -5); ctx.rotate(-1.42 * (w.facing || 1)); }
  if (w.type === 'pig') { drawPig(w); ctx.restore(); return; }
  if (w.type === 'dog') { drawDog(w); ctx.restore(); return; }
  if (w.type === 'twohead') { drawTwoHead(w, wolfy); ctx.restore(); return; }
  if (w.type === 'pastor') { drawPastor(w, wolfy, portrait); ctx.restore(); return; }
  ctx.scale(w.facing || 1, 1);
  const moving = w.walk > 0.1;
  const bob = moving ? Math.abs(Math.sin(w.phase)) * 1.6 : 0;
  const sw = moving ? Math.sin(w.phase) * 3.5 : 0;
  ctx.translate(0, -bob);
  const t = G.clock, hy = -57;
  if (wolfy) {
    ctx.fillStyle = P('fur'); ctx.beginPath(); ctx.moveTo(-7, -27);
    ctx.quadraticCurveTo(-27, -30 + (RM ? 0 : Math.sin(t * 3) * 2), -22, -8); ctx.quadraticCurveTo(-15, -15, -6, -19); ctx.closePath(); ctx.fill();
    fillE('furLt', -21, -10, 3.2, 2.4, 0.4);
  }
  if (w.type === 'shepherd' && !w.hatOff) {
    ctx.strokeStyle = P('crook'); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(-13, bob - 1); ctx.lineTo(-13, -74); ctx.arc(-7.5, -74, 5.5, Math.PI, TAU); ctx.lineTo(-2, -70); ctx.stroke();
  }
  const armK = w.type === 'usher' ? 'suit' : w.type === 'guard' ? 'cap' : w.type === 'granny' ? 'shirtG' : w.type === 'doctor' || w.type === 'chef' ? 'coat' : 'shirtW';
  const handK = wolfy ? 'fur' : 'skin';
  ctx.lineCap = 'round'; ctx.strokeStyle = P(armK); ctx.lineWidth = 6;
  const bx = w.type === 'shepherd' ? -12.5 : -12, byy = w.type === 'shepherd' ? -30 : -27 + sw * 0.4;
  ctx.beginPath(); ctx.moveTo(-7, -44); ctx.lineTo(bx, byy); ctx.stroke(); fillC(handK, bx, byy + 1, 3.3);
  ctx.fillStyle = P('pants'); rrect(-7 + sw * 0.5, -24, 6, 24 + bob, 2); ctx.fill(); rrect(1 - sw * 0.5, -24, 6, 24 + bob, 2); ctx.fill();
  const footK = wolfy ? 'furDk' : 'boots';
  fillE(footK, -4 + sw * 0.5, bob - 1.5, 5, 2.6); fillE(footK, 4.5 - sw * 0.5, bob - 1.5, 5, 2.6);
  if (w.type === 'shepherd') {
    fillR('shirtW', -11, -48, 22, 27, 7); fillR('pants', -8, -38, 16, 17, 3);
    ctx.strokeStyle = P('pants'); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-6, -38); ctx.lineTo(-7, -47); ctx.moveTo(6, -38); ctx.lineTo(7, -47); ctx.stroke();
    fillC('hatSh', -4, -33, 1.4); fillC('hatSh', 4, -33, 1.4);
  } else if (w.type === 'granny') {
    ctx.fillStyle = P('shirtG'); ctx.beginPath(); ctx.moveTo(-10, -48); ctx.lineTo(10, -48); ctx.lineTo(15, -7); ctx.lineTo(-15, -7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P('apron'); ctx.beginPath(); ctx.moveTo(-5, -37); ctx.lineTo(8, -37); ctx.lineTo(11, -11); ctx.lineTo(-3, -11); ctx.closePath(); ctx.fill();
  } else if (w.type === 'chef') {
    fillR('coat', -12, -48, 24, 30, 7);
    for (const by of [-43, -37, -31]) { fillC('steth', -3, by, 1.2); fillC('steth', 4, by, 1.2); }
    ctx.fillStyle = P('awnA'); ctx.beginPath(); ctx.moveTo(-9, -30); ctx.lineTo(9, -30); ctx.lineTo(12, -8); ctx.lineTo(-12, -8); ctx.closePath(); ctx.fill();
  } else if (w.type === 'guard') {
    fillR('cap', -11, -48, 22, 28, 6); fillR('nose', -11, -26, 22, 4, 1); fillC('tag', 5, -41, 2.6); fillR('apron', -1.5, -48, 3, 6, 1);
  } else if (w.type === 'usher') {
    fillR('suit', -11, -48, 22, 28, 6);
    ctx.fillStyle = P('apron'); ctx.beginPath(); ctx.moveTo(-4, -48); ctx.lineTo(4, -48); ctx.lineTo(0, -37); ctx.closePath(); ctx.fill();
    fillR('band', -3.6, -47.5, 7.2, 3, 1.2); fillC('awnA', 6.5, -42, 1.8);
  } else {
    fillR('shirtW', -9, -48, 18, 26, 6);
    ctx.fillStyle = P('coat'); ctx.beginPath(); ctx.moveTo(-12, -48); ctx.lineTo(-2, -48); ctx.lineTo(1, -40); ctx.lineTo(4, -48); ctx.lineTo(12, -48); ctx.lineTo(14, -13); ctx.lineTo(-14, -13); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P('steth'); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-5, -47); ctx.quadraticCurveTo(-3, -33, 2, -31); ctx.quadraticCurveTo(7, -33, 6, -47); ctx.stroke();
    fillC('steth', 2, -30, 2.1);
  }
  if (G.ch === 2 && w.type !== 'guard') fillC('tag', 4, -40, 2.3);
  let fx = 12, fy = -28 + sw * 0.4;
  if (w.waving) { fx = 17 + (RM ? 0 : Math.sin(t * 9) * 4); fy = -80; }
  ctx.strokeStyle = P(armK); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(7, -44); ctx.lineTo(fx, fy); ctx.stroke(); fillC(handK, fx, fy, 3.3);
  if (!w.waving && !w.hatOff) {
    if (w.type === 'granny') fillR('candyA', fx - 1, fy - 9, 8, 7, 1.5);
    if (w.type === 'usher') drawPlate(fx, fy, wolfy);
    if (w.type === 'guard') { fillR('iron', fx - 1, fy - 3, 10, 5, 1.5); fillC('flame', fx + 9, fy - 0.5, 2); }
    if (w.type === 'doctor') { fillR('wood', fx - 2, fy - 11, 9, 12, 1); fillR('apron', fx - 0.5, fy - 9, 6, 8); }
    if (w.type === 'chef') {
      if (wolfy) { ctx.strokeStyle = P('steth'); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(fx + 1, fy - 22); ctx.lineTo(fx, fy + 6); ctx.stroke(); fillE('iron', fx, fy + 8, 5, 3.5); }
      else fillR('awnB', fx - 3, fy - 1, 7, 13, 2);
    }
  }
  if (w.type === 'granny' && !w.hatOff) fillC('bonnet', -1.5, hy - 1, 12.5);
  if (wolfy) wolfHead(hy); else humanHead(w.type, hy);
  const hb = (w.hatBounce || 0) * 4;
  if (!w.hatOff) {
    if (w.type === 'shepherd') strawHat(hy, hb);
    else if (w.type === 'granny') bonnetFront(hy, hb);
    else if (w.type === 'chef') {
      if (wolfy) { fillR('coat', -8, hy - 24 - hb, 16, 14, 3); ctx.fillStyle = P('coat'); circles([[-6, hy - 26 - hb, 6], [0, hy - 29 - hb, 7], [6, hy - 26 - hb, 6]]); ctx.fill(); fillR('apron', -8, hy - 13 - hb, 16, 3); }
      else { fillR('awnA', -10, hy - 10 - hb, 20, 4, 2); fillE('awnA', 8, hy - 7.5 - hb, 7, 2.4); }
    }
    else if (w.type === 'guard') { fillR('cap', -9.5, hy - 15 - hb, 19, 8, 3); fillE('nose', 6, hy - 7 - hb, 7.5, 1.8); fillC('tag', 0, hy - 11.5 - hb, 1.7); }
    else if (w.type !== 'usher') headMirror(hy, hb);
  }
  if (wolfy) wolfEars(hy);
  ctx.restore();
}
function drawTwoHead(w, wolfy) {
  const t = G.clock, hy = -57;
  if (!wolfy) {
    for (const side of [-1, 1]) {
      ctx.save(); ctx.translate(side * 10.5, 0); ctx.scale(side, 1);
      fillR('pants', -6, -24, 5, 24, 2); fillR('pants', 1, -24, 5, 24, 2);
      fillE('boots', -3.5, -1.5, 4.5, 2.4); fillE('boots', 3.5, -1.5, 4.5, 2.4);
      fillR('suit', -9, -47, 18, 26, 6);
      ctx.strokeStyle = P(side < 0 ? 'sashA' : 'sashB'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-7, -45); ctx.lineTo(7, -26); ctx.stroke();
      const wy = -64 + (RM ? 0 : Math.sin(t * 4 + side) * 3);
      ctx.strokeStyle = P('suit'); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(6, -43); ctx.lineTo(13, wy); ctx.stroke();
      fillC('skin', 13, wy - 1, 3);
      humanHead('candidate', hy);
      ctx.restore();
    }
    return;
  }
  ctx.fillStyle = P('fur'); ctx.beginPath(); ctx.moveTo(-4, -26); ctx.quadraticCurveTo(-9, -6, 3, -3); ctx.quadraticCurveTo(0, -14, 4, -24); ctx.closePath(); ctx.fill();
  fillR('pants', -10, -24, 7, 24, 2); fillR('pants', 3, -24, 7, 24, 2);
  fillE('furDk', -6.5, -1.5, 5, 2.6); fillE('furDk', 6.5, -1.5, 5, 2.6);
  fillR('suit', -17, -48, 34, 28, 9);
  ctx.lineWidth = 4; ctx.strokeStyle = P('sashA'); ctx.beginPath(); ctx.moveTo(-15, -46); ctx.lineTo(13, -24); ctx.stroke();
  ctx.strokeStyle = P('sashB'); ctx.beginPath(); ctx.moveTo(15, -46); ctx.lineTo(-13, -24); ctx.stroke();
  ctx.strokeStyle = P('suit'); ctx.lineWidth = 5.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-15, -43); ctx.lineTo(-20, -27); ctx.moveTo(15, -43); ctx.lineTo(20, -27); ctx.stroke();
  fillC('fur', -20, -26, 3.2); fillC('fur', 20, -26, 3.2);
  for (const side of [-1, 1]) { ctx.save(); ctx.translate(side * 9, 0); ctx.scale(side, 1); fillR('fur', -4, hy + 4, 8, 9, 3); wolfHead(hy); wolfEars(hy); ctx.restore(); }
}
function drawDog(w) {
  ctx.scale(w.facing || 1, 1);
  const moving = w.walk > 0.1, sw = moving ? Math.sin(w.phase) * 3 : 0, t = G.clock, sit = w.sitting;
  ctx.strokeStyle = P('dog'); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-13, -14);
  ctx.quadraticCurveTo(-22, -22 + (RM ? 0 : Math.sin(t * 12) * 3), -18, -30); ctx.stroke();
  ctx.fillStyle = P('dog');
  if (!sit) { for (const lx of [-11 + sw, -5 - sw, 6 - sw, 11 + sw]) { rrect(lx, -10, 4, 10, 2); ctx.fill(); } }
  else { rrect(6, -12, 4, 12, 2); ctx.fill(); rrect(11, -12, 4, 12, 2); ctx.fill(); fillE('dog', -6, -3, 8, 3.5); }
  fillE('dog', 0, sit ? -13 : -14, 15, 8.5, sit ? -0.5 : 0);
  fillE('dogW', 9, sit ? -17 : -12, 6, 6);
  const hx = 13, hy = sit ? -31 : -25;
  fillC('dog', hx, hy, 8);
  fillE('dogW', hx + 4, hy + 3, 5, 3.6);
  fillR('dogW', hx - 1, hy - 8, 2.5, 8);
  fillC('nose', hx + 8.5, hy + 2, 1.8);
  fillC('eyeW', hx + 3.5, hy - 2, 1.8); fillC('pupil', hx + 4, hy - 2, 1);
  ctx.fillStyle = P('dog'); ctx.beginPath(); ctx.moveTo(hx - 6, hy - 5); ctx.lineTo(hx - 2, hy - 13); ctx.lineTo(hx + 1, hy - 6); ctx.closePath(); ctx.fill();
  fillR('cap', hx - 7, hy - 12, 13, 5, 2); fillR('cap', hx + 3, hy - 8.5, 7, 2, 1); fillC('tag', hx - 1, hy - 9.5, 1.3);
  if (w.ally) { ctx.fillStyle = '#FF5FA2'; ctx.beginPath(); ctx.moveTo(hx - 7, hy + 6); ctx.lineTo(hx + 6, hy + 7); ctx.lineTo(hx - 1, hy + 14); ctx.closePath(); ctx.fill(); }
}
function drawButterfly(b) {
  const t = G.clock, flap = RM ? 0.6 : Math.abs(Math.sin(t * 14));
  ctx.save(); ctx.translate(b.x, b.y - 34 + (RM ? 0 : Math.sin(t * 3) * 5));
  ctx.fillStyle = '#FF7AC6'; ell(-4 * flap - 1, -3, 5 * flap + 1, 6, -0.4); ctx.fill(); ell(4 * flap + 1, -3, 5 * flap + 1, 6, 0.4); ctx.fill();
  ctx.fillStyle = '#FFD23F'; ell(-3 * flap - 1, 3, 3.5 * flap + 0.8, 4, 0.4); ctx.fill(); ell(3 * flap + 1, 3, 3.5 * flap + 0.8, 4, -0.4); ctx.fill();
  ctx.fillStyle = '#3A2A55'; ell(0, 0, 1.3, 5); ctx.fill();
  ctx.restore();
}

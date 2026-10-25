/* ---------------- camera ---------------- */
const cam = { x: 0, y: 0 };
const view = { w: 800, h: 600, dpr: 1 };
let zoom = 1;
const shake = { x: 0, y: 0, a: 0 };
function setWorldT() {
  const z = zoom * view.dpr;
  let ox = shake.x, oy = shake.y;
  if (G.woozy > 0 && !RM) { const a = Math.min(1, G.woozy) * 7; ox += Math.sin(G.clock * 2.3) * a; oy += Math.cos(G.clock * 1.7) * a * 0.6; }
  ctx.setTransform(z, 0, 0, z, (-cam.x * zoom + ox) * view.dpr, (-cam.y * zoom + oy) * view.dpr);
}
function setScreenT() { ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0); }
const toScreen = (x, y) => [(x - cam.x) * zoom + shake.x, (y - cam.y) * zoom + shake.y];
function addShake(a) { if (!RM) shake.a = Math.max(shake.a, a); }
function shakeUpdate(dt) {
  if (shake.a > 0.05) { shake.x = (Math.random() * 2 - 1) * shake.a; shake.y = (Math.random() * 2 - 1) * shake.a; shake.a *= Math.exp(-dt * 9); }
  else { shake.x = shake.y = shake.a = 0; }
}

/* ---------------- world-space effects ---------------- */
function drawCones() {
  if (G.disguisesGone) return;
  const scouting = G.phase === 'fleecing' || G.phase === 'reveal';
  for (const w of G.wolves) {
    if (!w.active || w.ally) continue;
    if (w.x + w.range < VB.x0 || w.x - w.range > VB.x1 || w.y + w.range < VB.y0 || w.y - w.range > VB.y1) continue;
    if (w.limp || w.rest > 0 || w.flying || (w.type === 'pig' && w.distracted > 0)) continue;
    if (w.id === 'pastor' && G.church.mode !== 'sermon' && G.phase === 'fleecing') {
      drawPrayGaze(w, G.church.mode === 'pray' ? 1 : 0.35);
      if (G.church.mode === 'pray') continue;
    }
    const sense = w.sense || 'cone';
    if (sense === 'beam') { drawBeam(w); continue; }
    if (sense === 'sniff') { drawSniff(w); continue; }
    if (!isTruthPass() || !scouting) continue;
    for (const dir of coneDirs(w)) drawCone(w.x, w.y, dir, w.range, w.half, w.alert);
  }
}
function drawBeam(w) {
  const N = 18, x = w.x, y = w.y + 2, tr = isTruthPass(), base = tr ? '255,252,225' : '255,238,140';
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i <= N; i++) { const a = w.dir - w.half + (2 * w.half * i) / N, L = rayLen(x, y, a, w.range); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
  ctx.closePath();
  const g = ctx.createRadialGradient(x, y, 10, x, y, w.range);
  g.addColorStop(0, 'rgba(' + base + ',' + (0.55 + w.alert * 0.3).toFixed(2) + ')'); g.addColorStop(1, 'rgba(' + base + ',0.16)');
  ctx.fillStyle = g; ctx.fill();
  if (w.alert > 0.04) { ctx.fillStyle = 'rgba(220,60,40,' + (w.alert * 0.4).toFixed(2) + ')'; ctx.fill(); }
  ctx.strokeStyle = tr ? 'rgba(255,255,255,0.7)' : 'rgba(255,200,60,0.8)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(' + base + ',0.35)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 16, y - 140); ctx.lineTo(x + Math.cos(w.dir) * 50, y + Math.sin(w.dir) * 50); ctx.stroke();
}
function drawSniff(w) {
  const tr = isTruthPass(), t = G.clock, col = tr ? '170,190,90' : '255,95,162';
  ctx.save();
  ctx.fillStyle = 'rgba(' + col + ',0.10)'; circ(w.x, w.y, w.range); ctx.fill();
  if (w.alert > 0.04) { ctx.fillStyle = 'rgba(220,60,40,' + (w.alert * 0.35).toFixed(2) + ')'; circ(w.x, w.y, w.range); ctx.fill(); }
  ctx.setLineDash([6, 7]); ctx.lineDashOffset = RM ? 0 : -t * 22;
  ctx.strokeStyle = 'rgba(' + col + ',0.9)'; ctx.lineWidth = 2; circ(w.x, w.y, w.range); ctx.stroke();
  ctx.setLineDash([]); ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const a = t * 0.8 * (RM ? 0 : 1) + i * 2.1, px = w.x + Math.cos(a) * w.range * 0.62, py = w.y + Math.sin(a) * w.range * 0.62 - 6;
    ctx.beginPath(); ctx.moveTo(px - 6, py + 6); ctx.bezierCurveTo(px - 2, py, px + 2, py + 8, px + 6, py); ctx.stroke();
  }
  ctx.restore();
}
function drawCone(x, y, dir, range, half, alert) {
  const N = 28;
  ctx.beginPath(); ctx.moveTo(x, y);
  for (let i = 0; i <= N; i++) { const a = dir - half + (2 * half * i) / N, L = rayLen(x, y, a, range); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
  ctx.closePath();
  const g = ctx.createRadialGradient(x, y, 8, x, y, range);
  g.addColorStop(0, 'rgba(214,58,46,' + (0.34 + alert * 0.4).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(214,58,46,0.05)');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(232,88,70,' + (0.45 + alert * 0.5).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
}
function drawFeetRing() {
  if (!isTruthPass() || G.phase !== 'fleecing' || !G.seenBy) return;
  const p = G.player, k = 0.5 + 0.5 * Math.sin(G.clock * 14);
  ctx.strokeStyle = 'rgba(232,70,55,' + (0.55 + 0.4 * k).toFixed(2) + ')'; ctx.lineWidth = 3;
  ell(p.x, p.y + 1, 24 + k * 3, 8 + k); ctx.stroke();
}
function drawProofs() {
  if (!isTruthPass()) return;
  for (const p of G.proofs) {
    if (p.found || !inVB(p.x, p.y)) continue;
    const t = G.clock + p.ph;
    ctx.save(); ctx.translate(p.x, p.y - 10 + (RM ? 0 : Math.sin(t * 2.5) * 2));
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    g.addColorStop(0, 'rgba(255,225,120,0.6)'); g.addColorStop(1, 'rgba(255,225,120,0)');
    ctx.fillStyle = g; circ(0, 0, 28); ctx.fill();
    ctx.rotate(-0.12); ctx.fillStyle = '#F2EEDF'; ctx.fillRect(-7, -9, 14, 18);
    ctx.strokeStyle = '#2B2A27'; ctx.lineWidth = 0.8; ctx.strokeRect(-7, -9, 14, 18);
    ctx.fillStyle = '#2B2A27'; for (let i = 0; i < 4; i++) ctx.fillRect(-4.5, -5 + i * 3.6, 9 - (i % 2) * 3, 1);
    ctx.rotate(0.12);
    sparkle(9, -11, 5 + (RM ? 0 : Math.sin(t * 5) * 2), 'rgba(255,240,170,0.95)');
    ctx.restore();
  }
}
function bubbleAt(x, y, txt) {
  const tr = isTruthPass(), font = tr ? F_TRUTH : F_BODY, weight = tr ? '' : '700', size = 13;
  ctx.font = fontStr(size, font, weight);
  const w = Math.ceil(ctx.measureText(txt).width) + 16, h = 22;
  ctx.fillStyle = P('bubble'); ctx.strokeStyle = P('bubbleInk'); ctx.lineWidth = tr ? 1.2 : 2;
  rrect(x - w / 2, y - h, w, h, tr ? 2 : 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 5, y - 1); ctx.lineTo(x, y + 6); ctx.lineTo(x + 5, y - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x, y + 6); ctx.lineTo(x + 5, y); ctx.stroke();
  text(txt, x, y - h / 2 + 0.5, size, font, P('bubbleInk'), 0, 'center', weight);
}
function drawAlertMark(x, y, a) {
  const big = a > 0.7, s = 1 + (big && !RM ? Math.sin(G.clock * 20) * 0.08 : 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = big ? '#C8372D' : '#F2EEDF'; ctx.strokeStyle = '#1B1A18'; ctx.lineWidth = 2;
  circ(0, 0, 12); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#C8372D'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 15.5, -Math.PI / 2, -Math.PI / 2 + TAU * a); ctx.stroke();
  text(big ? '!' : '?', 0, 1, 17, F_CANDY, big ? '#FFFFFF' : '#1B1A18');
  ctx.restore();
}
function drawParticles() {
  const tr = isTruthPass();
  for (const p of G.particles) {
    if (p.mode === 'truth' && !tr) continue;
    if (p.mode === 'candy' && RT > 0.5) continue;
    const a = clamp(p.life / p.max, 0, 1);
    if (p.type === 'spark') {
      ctx.strokeStyle = 'rgba(255,236,140,' + a.toFixed(2) + ')'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
    } else if (p.type === 'star') {
      sparkle(p.x, p.y, p.size * (0.5 + a * 0.5), tr ? 'rgba(255,225,120,' + a.toFixed(2) + ')' : 'rgba(255,95,162,' + a.toFixed(2) + ')');
    } else if (p.type === 'heart') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.size / 10, p.size / 10); ctx.fillStyle = 'rgba(255,95,162,' + a.toFixed(2) + ')';
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.bezierCurveTo(-10, -4, -5, -11, 0, -5); ctx.bezierCurveTo(5, -11, 10, -4, 0, 4); ctx.fill(); ctx.restore();
    } else if (p.type === 'wool') {
      ctx.fillStyle = 'rgba(238,236,228,' + a.toFixed(2) + ')'; circles([[p.x, p.y, p.size], [p.x + p.size * 0.8, p.y - p.size * 0.4, p.size * 0.7], [p.x - p.size * 0.7, p.y - p.size * 0.3, p.size * 0.7]]); ctx.fill();
    } else if (p.type === 'crumb') {
      ctx.fillStyle = tr ? 'rgba(190,183,168,' + a.toFixed(2) + ')' : p.c ? 'rgba(255,140,198,' + a.toFixed(2) + ')' : 'rgba(255,255,255,' + a.toFixed(2) + ')';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.type === 'dust') {
      ctx.fillStyle = 'rgba(200,180,150,' + (a * 0.6).toFixed(2) + ')'; circ(p.x, p.y, p.size * (1.6 - a * 0.6)); ctx.fill();
    } else if (p.type === 'hat') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, a * 2);
      if (p.hat === 'shepherd') strawHat(8, 0); else if (p.hat === 'granny') bonnetFront(0, 0); else if (p.hat === 'doctor') headMirror(8, 0);
      else { fillR(p.hat === 'sashA' ? 'sashA' : 'sashB', -10, -2, 20, 4, 1); }
      ctx.restore();
    } else if (p.type === 'glasses') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.strokeStyle = '#2B1B4A'; ctx.lineWidth = 2;
      ell(-6, 0, 5, 4); ctx.stroke(); ell(6, 0, 5, 4); ctx.stroke(); ctx.restore();
    }
  }
}
function drawRhythm() {
  const r = G.rh;
  if (!r || G.phase !== 'bigbaa' || r.done) return;
  const p = G.player, cx = p.x, cy = p.y - 22;
  const rel = (r.t - r.start) / r.iv;
  if (rel > -1) {
    const frac = rel - Math.floor(rel);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 + frac * 0.6).toFixed(2) + ')'; ctx.lineWidth = 4;
    circ(cx, cy, 30 + (1 - frac) * 110); ctx.stroke();
  }
  const near = Math.abs(rel - Math.round(rel));
  const flash = rel > -0.2 ? Math.max(0, 1 - near * 6) : 0;
  ctx.strokeStyle = 'rgba(255,225,77,' + (0.65 + flash * 0.35).toFixed(2) + ')'; ctx.lineWidth = 5 + flash * 4;
  circ(cx, cy, 30); ctx.stroke();
}
function drawSulk(x, y) {
  const tr = isTruthPass();
  ctx.fillStyle = tr ? 'rgba(70,70,70,0.85)' : 'rgba(120,105,170,0.9)';
  circles([[x - 6, y, 6], [x + 2, y - 3, 7.5], [x + 9, y, 5.5]]); ctx.fill(); ctx.fillRect(x - 6, y, 15, 5);
  ctx.strokeStyle = tr ? 'rgba(70,70,70,0.7)' : 'rgba(120,105,170,0.8)'; ctx.lineWidth = 1.4; ctx.beginPath();
  const k = RM ? 0.5 : (G.clock * 2) % 1;
  for (const dx of [-4, 2, 8]) { ctx.moveTo(x + dx, y + 8 + k * 4); ctx.lineTo(x + dx - 1.5, y + 12 + k * 4); }
  ctx.stroke();
}
function drawFX() {
  drawParticles();
  if (G.bfly && !G.bfly.gone) drawButterfly(G.bfly);
  for (const s of G.sheep) if (s.bubble && inVB(s.x, s.y)) bubbleAt(s.x, s.y - 54 * (s.scale || 1), s.bubble.text);
  for (const w of G.wolves) if (w.active && w.bubble && inVB(w.x, w.y)) bubbleAt(w.x, w.y - wolfTop(w), bubbleText(w.bubble));
  const p = G.player;
  if (p.bubble) bubbleAt(p.x, p.y - 56, p.bubble.text);
  if (G.phase === 'fleecing') {
    for (const w of G.wolves) if (w.active && w.alert > 0.04) drawAlertMark(w.x, w.y - wolfTop(w, true), w.alert);
    if (G.hiddenFrom && (isTruthPass() || G.prayHidden || G.ch === 2) && !p.bubble) bubbleAt(p.x, p.y - 52, G.prayHidden ? 'Head bowed' : 'Hidden');
  }
  for (const s of G.sheep) if (s.sulk > 0 && inVB(s.x, s.y) && !s.bubble) drawSulk(s.x + 24 * (s.facing || 1), s.y - 44 * (s.scale || 1));
  if (G.mode === 'play' && G.interact && !G.modal && !G.fade) {
    const it = G.interact;
    bubbleAt(it.x, it.y + (RM ? 0 : Math.sin(G.clock * 4) * 2), (touchMode ? '' : 'E · ') + it.label);
  }
  drawRhythm();
  if (G.shock) {
    const k = G.shock.t / 1.3;
    ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 1 - k).toFixed(2) + ')'; ctx.lineWidth = 10 * (1 - k) + 2;
    circ(G.shock.x, G.shock.y, 20 + k * 900); ctx.stroke();
  }
  for (const q of G.pops) {
    const k = 1 - q.t / 0.9;
    textOutlined(q.txt, q.x, q.y - k * 26, 20, F_CANDY, q.good ? '#FFE14D' : '#FFFFFF', '#2B1B4A');
  }
}

/* ---------------- screen-space finishing ---------------- */
let grainPattern = null;
(function makeGrain() {
  const g = document.createElement('canvas'); g.width = g.height = 128;
  const gc = g.getContext('2d'); const img = gc.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 70; }
  gc.putImageData(img, 0, 0);
  grainPattern = mainCtx.createPattern(g, 'repeat');
})();
const vigCache = { w: 0, h: 0, g: null };
function vignette() {
  if (vigCache.w !== view.w || vigCache.h !== view.h || !vigCache.g) {
    const g = mainCtx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.3, view.w / 2, view.h / 2, Math.hypot(view.w, view.h) * 0.62);
    g.addColorStop(0, 'rgba(12,12,12,0)'); g.addColorStop(1, 'rgba(12,12,12,0.55)');
    vigCache.w = view.w; vigCache.h = view.h; vigCache.g = g;
  }
  return vigCache.g;
}
function drawPost(t) {
  if (ctx !== mainCtx) return;
  if (RR > 0.5) {
    const g = ctx.createLinearGradient(0, 0, 0, view.h); g.addColorStop(0, 'rgba(255,236,190,0.2)'); g.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h); return;
  }
  if (t > 0.5) {
    if (grainPattern) {
      ctx.save(); ctx.globalAlpha = 0.12;
      const ox = RM ? 0 : Math.floor(Math.random() * 128), oy = RM ? 0 : Math.floor(Math.random() * 128);
      ctx.translate(-ox, -oy); ctx.fillStyle = grainPattern; ctx.fillRect(0, 0, view.w + 128, view.h + 128); ctx.restore();
    }
    ctx.fillStyle = vignette(); ctx.fillRect(0, 0, view.w, view.h);
  } else {
    const g = ctx.createRadialGradient(view.w * 0.2, -view.h * 0.1, 0, view.w * 0.2, -view.h * 0.1, view.h * 1.2);
    g.addColorStop(0, 'rgba(255,245,200,0.32)'); g.addColorStop(1, 'rgba(255,245,200,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
  }
}
const DL = [];
function renderWorld(t) {
  RT = t; RR = G.ch === 2 ? 1 - t : G.realT;
  VB.x0 = cam.x - 90; VB.y0 = cam.y - 140; VB.x1 = cam.x + view.w / zoom + 90; VB.y1 = cam.y + view.h / zoom + 140;
  setWorldT();
  drawGround();
  drawRegionGrounds();
  drawGlassesProp();
  drawCones();
  drawFeetRing();
  DL.length = 0;
  for (const d of STATIC) if ((!d.ch || d.ch === G.ch) && d.x1 >= VB.x0 && d.x0 <= VB.x1 && d.y1 >= VB.y0 && d.y0 <= VB.y1) DL.push(d);
  if (G.lick && inVB(G.lick.x, G.lick.y)) DL.push({ y: G.lick.y, draw: drawLick });
  for (const s of G.sheep) if (inVB(s.x, s.y)) DL.push({ y: s.y, s });
  for (const w of G.wolves) if (w.active && inVB(w.x, w.y)) DL.push({ y: w.y, w });
  DL.push({ y: G.player.y, pl: true });
  DL.sort((a, b) => a.y - b.y);
  for (const d of DL) { if (d.draw) d.draw(); else if (d.s) drawSheep(d.s, false); else if (d.w) drawWolf(d.w); else drawSheep(G.player, true); }
  drawProofs();
  drawFX();
  setScreenT();
  drawPost(t);
}
// an arrow at the screen edge pointing at a spot in the ranch that is off screen
function drawEdgeArrow(wx, wy, label, fill) {
  if (regionOf(G.player.x, G.player.y) !== 'ranch') return;
  const [gx, gy] = toScreen(wx, wy);
  const m = 48;
  if (gx > m && gx < view.w - m && gy > m + 70 && gy < view.h - m) return;
  const cx = view.w / 2, cy = view.h / 2, dx = gx - cx, dy = gy - cy;
  const s = Math.min((view.w / 2 - m) / Math.max(1e-6, Math.abs(dx)), (view.h / 2 - m) / Math.max(1e-6, Math.abs(dy)));
  const ax = cx + dx * s, ay = cy + dy * s, ang = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
  ctx.fillStyle = fill; ctx.strokeStyle = '#22211F'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  textOutlined(label, ax - Math.cos(ang) * 30, ay - Math.sin(ang) * 30, 15, G.view ? F_TRUTH : F_BODY, '#FFFFFF', '#22211F', G.view ? '' : '700');
}
function drawGateArrow() { drawEdgeArrow(GATEX, 990, 'Gate', '#FFE14D'); }
function screenOverlays() {
  setScreenT();
  if (G.mode === 'play' && (G.view === 1 || G.church.mode === 'pray') && !G.wipe && G.maxAlert > 0.2) {
    const a = (G.maxAlert - 0.2) * 0.7 * (RM ? 1 : 0.75 + 0.25 * Math.sin(G.clock * 10));
    const g = ctx.createRadialGradient(view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.32, view.w / 2, view.h / 2, Math.hypot(view.w, view.h) * 0.6);
    g.addColorStop(0, 'rgba(200,40,30,0)'); g.addColorStop(1, 'rgba(200,40,30,' + a.toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
  }
  if (G.woozy > 0 && G.view === 0) {
    const a = Math.min(1, G.woozy / 1.5) * (0.16 + (RM ? 0 : 0.07 * Math.sin(G.clock * 5)));
    ctx.fillStyle = 'rgba(255,120,190,' + a.toFixed(3) + ')'; ctx.fillRect(0, 0, view.w, view.h);
  }
  if (G.fade) { const k = G.fade.t / G.fade.dur; ctx.fillStyle = 'rgba(14,12,20,' + clamp(1 - Math.abs(k * 2 - 1), 0, 1).toFixed(3) + ')'; ctx.fillRect(0, 0, view.w, view.h); }
  if (G.flash > 0) { ctx.fillStyle = 'rgba(' + G.flashColor + ',' + Math.min(1, G.flash).toFixed(3) + ')'; ctx.fillRect(0, 0, view.w, view.h); }
  if (G.mode === 'play' && G.phase === 'herd' && G.flags.herdReady) drawGateArrow();
  if (G.mode === 'play' && G.phase === 'fleecing' && G.lick) drawEdgeArrow(G.lick.x, G.lick.y - 12, 'Sugar lick', '#FF8CC6');
  drawPrayerCaption();
}
function renderTitle() {
  renderWorld(0);
  const L = G.lens, r = clamp(Math.min(view.w, view.h) * 0.13, 48, 96), gap = r * 2.3;
  const lx = L.x - gap / 2, rx = L.x + gap / 2, y = L.y;
  ctx.save(); setScreenT(); ctx.beginPath(); ctx.arc(lx, y, r, 0, TAU); ctx.moveTo(rx + r, y); ctx.arc(rx, y, r, 0, TAU); ctx.clip();
  renderWorld(1); ctx.restore();
  setScreenT();
  ctx.lineWidth = Math.max(5, r * 0.12); ctx.strokeStyle = '#231536'; ctx.lineCap = 'round';
  circ(lx, y, r); ctx.stroke(); circ(rx, y, r); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx + r * 0.94, y - r * 0.32); ctx.quadraticCurveTo(L.x, y - r * 0.62, rx - r * 0.94, y - r * 0.32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx - r * 0.98, y - r * 0.2); ctx.lineTo(lx - r * 1.45, y - r * 0.42); ctx.moveTo(rx + r * 0.98, y - r * 0.2); ctx.lineTo(rx + r * 1.45, y - r * 0.42); ctx.stroke();
  ctx.lineWidth = Math.max(2, r * 0.05); ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(lx, y, r * 0.8, Math.PI * 1.12, Math.PI * 1.42); ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, y, r * 0.8, Math.PI * 1.12, Math.PI * 1.42); ctx.stroke();
  const label = touchMode ? 'Drag to peek' : 'Move the glasses to peek';
  ctx.font = fontStr(15, F_BODY, '700');
  const tw = ctx.measureText(label).width + 22;
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#3E1F7A'; ctx.lineWidth = 2;
  rrect(L.x - tw / 2, y + r + 14, tw, 27, 13); ctx.fill(); ctx.stroke();
  text(label, L.x, y + r + 28, 15, F_BODY, '#3E1F7A', 0, 'center', '700');
}
function render() {
  ctx = mainCtx;
  setScreenT();
  ctx.fillStyle = '#1B2420'; ctx.fillRect(0, 0, view.w, view.h);
  if (G.mode === 'title') { renderTitle(); return; }
  if (G.wipe) {
    const w = G.wipe, e = easeIO(clamp(w.t, 0, 1)), [sx, sy] = toScreen(w.wx, w.wy);
    const maxR = Math.hypot(Math.max(sx, view.w - sx), Math.max(sy, view.h - sy)) + 10;
    renderWorld(w.from);
    ctx.save(); setScreenT(); ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.1, e * maxR), 0, TAU); ctx.clip(); renderWorld(w.to); ctx.restore();
    setScreenT(); ctx.lineWidth = 3; ctx.strokeStyle = w.to ? 'rgba(20,20,20,0.75)' : 'rgba(255,255,255,0.9)';
    circ(sx, sy, e * maxR); ctx.stroke();
  } else renderWorld(G.view);
  screenOverlays();
}

/* ---------------- DOM ---------------- */
const ui = {};
['hud', 'hud-top', 'objective', 'obj-toggle', 'obj-new', 'obj-act-text', 'obj-text', 'obj-sub', 'pip-cred', 'pip-woke', 'pip-proof', 'btn-sound', 'btn-pause', 'keys', 'touch', 'joy-zone', 'joy', 'joy-knob',
  't-talk', 't-specs', 't-baa', 't-graze', 'banner', 'banner-title', 'banner-sub', 'toasts', 'rhythm', 'rhythm-fill', 'rhythm-hint',
  'dialog', 'dlg-portrait', 'dlg-name', 'dlg-text', 'dlg-sr', 'dlg-choices', 'doc', 'doc-title', 'doc-body', 'doc-ok',
  'scr-title', 'scr-how', 'scr-pause', 'scr-end', 'btn-play', 'btn-how', 'btn-how-play', 'btn-how-back', 'btn-resume', 'btn-pause-menu',
  'btn-again', 'btn-menu', 'btn-chapters', 'btn-end-next', 'scr-chapters', 'chapter-list', 'btn-chapters-back', 'woke-long', 'woke-short', 'end-kicker', 'end-title', 'end-text', 'end-stats', 'end-ach', 'ach-head', 'title-foot', 'how-controls', 'pause-controls',
].forEach((id) => { ui[id.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = document.getElementById(id); });

const ICON = {
  bell: '<svg class="pip" viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M12 3.2c3.5 0 5.8 2.7 5.8 6.3v3.6l1.9 3.4H4.3l1.9-3.4V9.5C6.2 5.9 8.5 3.2 12 3.2z"/><path class="line" d="M12 3.2c3.5 0 5.8 2.7 5.8 6.3v3.6l1.9 3.4H4.3l1.9-3.4V9.5C6.2 5.9 8.5 3.2 12 3.2zM9.6 19.4a2.5 2.5 0 0 0 4.8 0"/></svg>',
  sheep: '<svg class="pip" viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M6.3 17h9.4a3.1 3.1 0 0 0 .9-6 3.6 3.6 0 0 0-6.6-2.1 3.2 3.2 0 0 0-4.9 2.6A3 3 0 0 0 6.3 17z"/><ellipse class="fill" cx="19" cy="10.6" rx="2.2" ry="2.8"/><path class="line" d="M6.3 17h9.4a3.1 3.1 0 0 0 .9-6 3.6 3.6 0 0 0-6.6-2.1 3.2 3.2 0 0 0-4.9 2.6A3 3 0 0 0 6.3 17zM8 17v3.2M14 17v3.2"/><ellipse class="line" cx="19" cy="10.6" rx="2.2" ry="2.8"/></svg>',
  doc: '<svg class="pip" viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M6.5 3.5h7.5l4 4v13h-11.5z"/><path class="line" d="M6.5 3.5h7.5l4 4v13h-11.5zM14 3.5v4h4M9 11.5h6M9 14.5h6M9 17.5h4"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
};
ui.btnPause.innerHTML = ICON.pause;

/* ---------------- HUD ---------------- */
let hudKey = '';
function pips(n, on, kind) { let s = ''; for (let i = 0; i < n; i++) s += ICON[kind].replace('class="pip"', 'class="pip ' + (i < on ? 'on' : 'off') + '"'); return s; }
function syncHUD(force) {
  const w = Math.min(WOKE_GOAL, G.woke), key = G.cred + '|' + w + '|' + G.proof.size;
  if (key === hudKey && !force) return;
  const prevCred = hudKey ? +hudKey.split('|')[0] : G.cred;
  hudKey = key;
  ui.pipCred.innerHTML = pips(3, G.cred, 'bell'); ui.pipCred.setAttribute('aria-label', 'Credibility ' + G.cred + ' of 3');
  const meter = G.ch === 2 ? 'Pig-O-Meter' : 'Woke-O-Meter';
  ui.wokeLong.textContent = meter; ui.wokeShort.textContent = G.ch === 2 ? 'Pigs' : 'Woke';
  ui.pipWoke.innerHTML = pips(WOKE_GOAL, w, 'sheep'); ui.pipWoke.setAttribute('aria-label', meter + ' ' + w + ' of ' + WOKE_GOAL);
  ui.pipProof.innerHTML = pips(PROOF_COUNT, G.proof.size, 'doc'); ui.pipProof.setAttribute('aria-label', 'Proof ' + G.proof.size + ' of ' + PROOF_COUNT);
  if (prevCred > G.cred) { ui.pipCred.classList.remove('hit'); void ui.pipCred.offsetWidth; ui.pipCred.classList.add('hit'); }
}
function measureHud() { if (!ui.hud.hidden) app.style.setProperty('--hud-h', ui.hudTop.offsetHeight + 'px'); }
let objHidden = !!store.get().objHidden;
function applyObjHidden() {
  ui.objective.classList.toggle('collapsed', objHidden);
  ui.objToggle.setAttribute('aria-expanded', String(!objHidden));
  ui.objToggle.setAttribute('aria-label', (objHidden ? 'Show' : 'Hide') + ' objective');
  ui.objToggle.title = (objHidden ? 'Show' : 'Hide') + ' objective' + (touchMode ? '' : ' (O)');
  ui.objActText.textContent = objHidden ? 'Show' : 'Hide';
  if (!objHidden) ui.objNew.hidden = true;
  measureHud();
}
function toggleObjective() { objHidden = !objHidden; store.patch({ objHidden }); applyObjHidden(); Snd.play('click'); }
function setObjective(main, sub) {
  if (objHidden && main !== ui.objText.textContent) ui.objNew.hidden = false;
  ui.objText.textContent = main; ui.objSub.textContent = sub || ''; ui.objSub.hidden = !sub;
  requestAnimationFrame(measureHud);
}
function setUIMode(m) { app.classList.remove('candy', 'truth', 'real'); app.classList.add(m); }
function toast(title, sub, cls) {
  const el = document.createElement('div'); el.className = 'toast card' + (cls ? ' ' + cls : '');
  const b = document.createElement('b'); b.textContent = title; el.appendChild(b);
  if (sub) { const s = document.createElement('span'); s.textContent = sub; el.appendChild(s); }
  ui.toasts.appendChild(el);
  while (ui.toasts.children.length > (view.w < 640 ? 2 : 3)) ui.toasts.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 3000);
  setTimeout(() => el.remove(), 3450);
}
let bannerTimer = 0;
function banner(title, sub, dur) {
  ui.bannerTitle.textContent = title; ui.bannerSub.textContent = sub || ''; ui.bannerSub.hidden = !sub;
  ui.banner.hidden = false; ui.banner.classList.remove('show'); void ui.banner.offsetWidth; ui.banner.classList.add('show');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => { ui.banner.hidden = true; }, (dur || 2.6) * 1000);
}
function syncSoundBtn() { ui.btnSound.innerHTML = Snd.muted ? ICON.mute : ICON.sound; ui.btnSound.setAttribute('aria-label', Snd.muted ? 'Turn sound on' : 'Mute sound'); }
function fillControls(el) {
  const rows = touchMode
    ? [['Move', 'Drag on the left side'], ['Glasses on or off', 'Tap Glasses'], ['Graze or bow, head down', 'Hold Graze'], ['Talk', 'Tap Talk next to a sheep'], ['Baa', 'Tap Baa'], ['Show or hide objective', 'Tap Objective']]
    : [['Move', 'WASD or arrow keys'], ['Glasses on or off', 'Space'], ['Graze or bow, head down', 'Hold Shift'], ['Talk', 'E next to a sheep'], ['Baa', 'B'], ['Show or hide objective', 'O'], ['Pause', 'Esc'], ['Sound', 'M']];
  el.innerHTML = '';
  for (const [a, b] of rows) { const li = document.createElement('li'); const s = document.createElement('span'); s.textContent = a; const k = document.createElement('b'); k.textContent = b; li.append(s, k); el.appendChild(li); }
}
function updateTouchButtons() {
  if (!touchMode) return;
  const p = G.player;
  if (!p) return;
  const setDis = (b, d) => { if (b.disabled !== d) b.disabled = d; };
  setDis(ui.tTalk, !G.interact);
  const ik = G.interact && G.interact.kind, tl = ik === 'portal' ? 'Go' : ik === 'lick' ? 'Kick' : 'Talk';
  if (ui.tTalk.textContent !== tl) ui.tTalk.textContent = tl;
  setDis(ui.tSpecs, !p.hasSpecs || G.phase === 'reveal' || G.phase === 'bigbaa' || G.phase === 'stampede' || G.phase === 'meadow');
  ui.tSpecs.classList.toggle('on', !!p.specsOn);
  setDis(ui.tGraze, !(G.phase === 'meadow' || G.phase === 'glasses' || G.phase === 'fleecing'));
  const gl = regionOf(p.x, p.y) === 'church' ? 'Bow' : 'Graze';
  if (ui.tGraze.textContent !== gl) ui.tGraze.textContent = gl;
  ui.tBaa.classList.toggle('pulse', G.phase === 'bigbaa');
}
function syncKeyHints() {
  const k = document.getElementById('k-graze');
  if (!k || !G.player) return;
  const lbl = regionOf(G.player.x, G.player.y) === 'church' ? 'Bow' : 'Graze';
  if (k.lastChild && k.lastChild.textContent !== lbl) k.lastChild.textContent = lbl;
}

/* ---------------- dialog ---------------- */
let dlgTyping = false, dlgTimer = 0, dlgFull = '', dlgNode = null, dlgLeave = null;
const pctx = ui.dlgPortrait.getContext('2d');
function drawPortrait(node) {
  const prev = ctx, pRT = RT, pRR = RR;
  ctx = pctx; RT = G.view; RR = G.ch === 2 ? 1 - G.view : G.realT;
  pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.clearRect(0, 0, 128, 128);
  const who = node.who;
  try {
    if (who === 'player' || who === G.player) {
      const k = 3.3; pctx.setTransform(k, 0, 0, k, 64 - 17.5 * k, 74 + 28 * k);
      drawSheep(Object.assign({}, G.player, { x: 0, y: 0, facing: 1, walk: 0, grazing: false, hopT: 0 }), true, { portrait: true });
    } else if (who && who.kind) {
      const k = 3.3 / (who.scale || 1) * (who.kind === 'lamb' ? 0.95 : 1); pctx.setTransform(k, 0, 0, k, 64 - 17.5 * k * (who.scale || 1), 74 + 28 * k * (who.scale || 1));
      drawSheep(Object.assign({}, who, { x: 0, y: 0, facing: 1, walk: 0, grazing: false, hopT: 0, wakeFx: 0 }), false, { portrait: true });
    } else if (who && who.type) {
      const tower = who.type === 'tower', crow = who.type === 'crow', pigR = who.type === 'pig' && !(G.view === 1 || G.disguisesGone);
      const k = who.type === 'dog' ? 3.4 : tower ? 3.2 : crow ? 3.6 : pigR ? 2.8 : 2.9;
      const hx = who.type === 'dog' ? 15 : who.type === 'twohead' ? 0 : tower ? -10 : crow ? 6 : pigR ? 14 : 6;
      const hy = who.type === 'dog' ? -25 : tower ? -144 : crow ? -60 : pigR ? -22 : -57;
      pctx.setTransform(k, 0, 0, k, 64 - hx * k, 70 - hy * k);
      drawWolf(Object.assign({}, who, { x: 0, y: 0, facing: 1, walk: 0, waving: false, limp: false, flying: false }), { portrait: true });
    } else {
      pctx.setTransform(1, 0, 0, 1, 0, 0);
      pctx.strokeStyle = G.view ? '#22211F' : '#3E1F7A'; pctx.lineWidth = 7; pctx.lineCap = 'round';
      pctx.beginPath(); pctx.arc(40, 66, 22, 0, TAU); pctx.stroke(); pctx.beginPath(); pctx.arc(88, 66, 22, 0, TAU); pctx.stroke();
      pctx.beginPath(); pctx.moveTo(60, 60); pctx.quadraticCurveTo(64, 54, 68, 60); pctx.stroke();
      pctx.strokeStyle = 'rgba(255,255,255,0.8)'; pctx.lineWidth = 3; pctx.beginPath(); pctx.arc(40, 66, 15, Math.PI * 1.1, Math.PI * 1.45); pctx.stroke();
    }
  } finally { ctx = prev; RT = pRT; RR = pRR; pcKey = ''; }
}
function openDialog(node) {
  G.modal = 'dialog';
  ui.dialog.hidden = false; app.classList.add('dlg-open');
  showNode(node);
}
function showNode(node) {
  dlgNode = node;
  ui.dlgName.textContent = node.name || (node.who && node.who.name) || '';
  drawPortrait(node);
  dlgFull = node.text; ui.dlgSr.textContent = node.text;
  ui.dlgChoices.hidden = true; ui.dlgChoices.innerHTML = '';
  const choices = node.choices && node.choices.length ? node.choices : [{ label: 'Continue' }];
  dlgLeave = null;
  choices.forEach((c, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'choice';
    const kb = document.createElement('kbd'); kb.textContent = String(i + 1);
    const span = document.createElement('span'); span.textContent = c.label;
    if (c.tag) { const sm = document.createElement('small'); sm.textContent = c.tag; span.appendChild(sm); }
    b.append(kb, span);
    b.addEventListener('click', () => choose(c));
    if (c.leave) dlgLeave = b;
    ui.dlgChoices.appendChild(b);
  });
  if (!dlgLeave && choices.length === 1) dlgLeave = ui.dlgChoices.firstChild;
  clearInterval(dlgTimer);
  if (RM) { finishTyping(); return; }
  dlgTyping = true; let i = 0; ui.dlgText.textContent = '';
  dlgTimer = setInterval(() => { i += 2; ui.dlgText.textContent = dlgFull.slice(0, i); if (i >= dlgFull.length) finishTyping(); }, 22);
}
function finishTyping() {
  clearInterval(dlgTimer); dlgTyping = false;
  ui.dlgText.textContent = dlgFull; ui.dlgChoices.hidden = false;
  const first = ui.dlgChoices.querySelector('button');
  if (first) first.focus({ preventScroll: true });
}
ui.dlgText.addEventListener('click', () => { if (dlgTyping) finishTyping(); });
function choose(c) {
  if (dlgTyping) { finishTyping(); return; }
  Snd.play('click');
  const next = c.run ? c.run() : null;
  if (next) showNode(next); else closeDialog();
}
function closeDialog() {
  const node = dlgNode; dlgNode = null; clearInterval(dlgTimer); dlgTyping = false;
  ui.dialog.hidden = true; app.classList.remove('dlg-open'); G.modal = null; pressed.clear();
  app.focus({ preventScroll: true });
  const after = G.afterDialog; G.afterDialog = null;
  if (node && node.onClose) node.onClose();
  if (after) after();
}
let docClose = null;
function showDoc(p, onClose) {
  G.modal = 'doc';
  ui.docTitle.textContent = p.title; ui.docBody.innerHTML = '';
  const ul = document.createElement('ul'); ul.className = 'doc-lines';
  for (const [a, b] of p.lines) { const li = document.createElement('li'); const s1 = document.createElement('span'); s1.textContent = a; li.appendChild(s1); if (b) { const s2 = document.createElement('span'); s2.textContent = b; li.appendChild(s2); } ul.appendChild(li); }
  ui.docBody.appendChild(ul);
  if (p.note) { const n = document.createElement('p'); n.className = 'doc-note'; n.textContent = p.note; ui.docBody.appendChild(n); }
  ui.doc.hidden = false; docClose = onClose;
  ui.docOk.focus({ preventScroll: true });
}
ui.docOk.addEventListener('click', () => {
  ui.doc.hidden = true; G.modal = null; pressed.clear(); app.focus({ preventScroll: true });
  const f = docClose; docClose = null; if (f) f();
});

/* ---------------- input ---------------- */
const keys = new Set(), pressed = new Set();
const touchState = { graze: false, jx: 0, jy: 0, joyId: null, ox: 0, oy: 0 };
const keyName = (e) => (e.key === ' ' || e.key === 'Spacebar' ? ' ' : (e.key || '').toLowerCase());
window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = keyName(e);
  if (G.mode === 'play' && !G.modal && (k === ' ' || k.indexOf('arrow') === 0)) e.preventDefault();
  if (G.modal === 'dialog') {
    if (dlgTyping && (k === ' ' || k === 'enter')) { e.preventDefault(); finishTyping(); return; }
    if (/^[1-6]$/.test(k) && !ui.dlgChoices.hidden) { const b = ui.dlgChoices.querySelectorAll('button')[+k - 1]; if (b) { e.preventDefault(); b.click(); } return; }
    if (k === 'escape' && dlgLeave && !ui.dlgChoices.hidden) { dlgLeave.click(); return; }
  }
  if (G.modal === 'doc' && k === 'escape') { ui.docOk.click(); return; }
  if (k === 'escape' || k === 'p') {
    if (G.mode === 'play') { if (G.modal === 'pause') setPause(false); else if (!G.modal) setPause(true); }
    else if (G.mode === 'title' && !ui.scrHow.hidden) { ui.scrHow.hidden = true; ui.btnHow.focus({ preventScroll: true }); }
    else if (G.mode === 'title' && !ui.scrChapters.hidden) closeChapters();
    return;
  }
  if (k === 'm') { Snd.toggleMute(); syncSoundBtn(); return; }
  if (k === 'o' && G.mode === 'play' && !G.modal) { if (!e.repeat) toggleObjective(); return; }
  if (G.mode === 'title' && ui.scrHow.hidden && ui.scrChapters.hidden && k === 'enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { Snd.init(); playNext(); return; }
  if (!e.repeat && !G.modal) pressed.add(k);
  keys.add(k);
});
window.addEventListener('keyup', (e) => { keys.delete(keyName(e)); if (e.key === 'Shift') keys.delete('shift'); });
window.addEventListener('blur', () => { keys.clear(); touchState.graze = false; });
function enableTouch() {
  if (touchMode) return;
  touchMode = true; app.classList.add('touchmode');
  ui.keys.hidden = true;
  if (G.mode === 'play') { ui.touch.hidden = false; if (G.phase) setPhase(G.phase); }
}
window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') enableTouch(); }, { capture: true, passive: true });
ui.joyZone.addEventListener('pointerdown', (e) => {
  if (G.mode !== 'play' || G.modal) return;
  e.preventDefault();
  if (G.phase === 'bigbaa') { pressed.add('b'); return; }
  try { ui.joyZone.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
  touchState.joyId = e.pointerId; touchState.ox = e.clientX; touchState.oy = e.clientY; touchState.jx = touchState.jy = 0;
  const r = app.getBoundingClientRect();
  ui.joy.style.left = e.clientX - r.left + 'px'; ui.joy.style.top = e.clientY - r.top + 'px';
  ui.joy.hidden = false; ui.joyKnob.style.transform = 'translate(0px,0px)';
});
ui.joyZone.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touchState.joyId) return;
  let dx = e.clientX - touchState.ox, dy = e.clientY - touchState.oy;
  const d = Math.hypot(dx, dy), max = 46;
  if (d > max) { dx *= max / d; dy *= max / d; }
  touchState.jx = dx / max; touchState.jy = dy / max;
  ui.joyKnob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
});
const endJoy = (e) => { if (e.pointerId !== touchState.joyId) return; touchState.joyId = null; touchState.jx = touchState.jy = 0; ui.joy.hidden = true; };
ui.joyZone.addEventListener('pointerup', endJoy);
ui.joyZone.addEventListener('pointercancel', endJoy);
document.querySelectorAll('.tbtn').forEach((b) => {
  const act = b.dataset.act;
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (G.mode !== 'play' || G.modal) return;
    if (act === 'graze') { touchState.graze = true; b.classList.add('on'); }
    else pressed.add(act === 'specs' ? ' ' : act === 'talk' ? 'e' : 'b');
  });
  const up = () => { if (act === 'graze') { touchState.graze = false; b.classList.remove('on'); } };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
});
app.addEventListener('pointermove', (e) => {
  if (G.mode !== 'title') return;
  const r = app.getBoundingClientRect();
  G.lens.tx = e.clientX - r.left; G.lens.ty = e.clientY - r.top; G.lens.active = 2.5;
});
cv.addEventListener('pointerdown', () => { if (G.mode === 'play' && !G.modal && G.phase === 'bigbaa') pressed.add('b'); });
ui.btnSound.addEventListener('click', () => { Snd.init(); Snd.toggleMute(); syncSoundBtn(); app.focus({ preventScroll: true }); });
ui.btnPause.addEventListener('click', () => { setPause(true); });
ui.objToggle.addEventListener('click', () => { toggleObjective(); app.focus({ preventScroll: true }); });
applyObjHidden();

/* ---------------- screens ---------------- */
function setPause(on) {
  if (G.mode !== 'play') return;
  if (on) {
    if (G.modal) return;
    G.modal = 'pause'; fillControls(ui.pauseControls); ui.scrPause.hidden = false;
    keys.clear(); touchState.graze = false; ui.tGraze.classList.remove('on');
    ui.btnResume.focus({ preventScroll: true });
  } else {
    if (G.modal !== 'pause') return;
    G.modal = null; ui.scrPause.hidden = true; pressed.clear(); app.focus({ preventScroll: true });
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.modal) setPause(true); });
const fmtTime = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const achKeys = () => Object.keys(ACH).filter((id) => !ACH_CH2.has(id) || ch2Unlocked());
function refreshTitleFoot() {
  const s = store.get(), n = (s.ach || []).filter((id) => achKeys().indexOf(id) >= 0).length;
  let t = 'About 10 minutes a chapter. Sound on.';
  if (s.best) t += ' Your best: ' + fmtTime(s.best) + '.';
  if (ch2Unlocked()) t += ' Chapter 2 unlocked.';
  if (n) t += ' Achievements: ' + n + ' of ' + achKeys().length + '.';
  ui.titleFoot.textContent = t;
  refreshPlayButton();
}
function startPlay() {
  G.mode = 'play';
  for (const el of [ui.scrTitle, ui.scrHow, ui.scrChapters, ui.scrEnd, ui.scrPause, ui.dialog, ui.doc, ui.rhythm]) el.hidden = true;
  ui.hud.hidden = false; ui.keys.hidden = touchMode; ui.touch.hidden = !touchMode;
  Snd.init(); Snd.setMode(offMode());
  syncHUD(true); syncSoundBtn();
  setPhase(G.phase);
  measureHud(); updateCamera(0, true);
  app.focus({ preventScroll: true });
}
function resetLens() {
  const wg = G.wolves[0], [x, y] = toScreen(wg.x, wg.y - 40);
  G.lens.x = G.lens.tx = x; G.lens.y = G.lens.ty = y; G.lens.active = 0;
}
function toTitle() {
  newGame({}); G.mode = 'title';
  for (const el of [ui.hud, ui.touch, ui.scrEnd, ui.scrPause, ui.scrHow, ui.scrChapters, ui.rhythm, ui.banner, ui.dialog, ui.doc]) el.hidden = true;
  ui.scrTitle.hidden = false;
  updateCamera(0, true); resetLens(); Snd.setMode('candy'); refreshTitleFoot();
  ui.btnPlay.focus({ preventScroll: true });
}
/* ---------------- chapter select ----------------
   One entry per chapter. A new chapter is one more entry here: its number, name, a line about it, the store key
   for its best time, and how to start it. An entry without start() shows as "Coming soon". Each chapter opens
   once the one before it is finished; names and blurbs stay hidden until then, so the list never spoils a twist. */
const CHAPTERS = [
  { n: 1, name: 'Greener Pastures', blurb: 'Find the glasses, prove the shepherds are wolves, and wake the flock.', best: 'best', start: () => restartChapter(1, false) },
  { n: 2, name: 'Hogwash', blurb: 'The wolves are back, wearing badges. Follow the strings to the Farmhouse.', best: 'best2', start: startChapter2 },
  { n: 3, name: 'The Farmer', blurb: 'Up the hill, a light just came on in the Big House.' },
];
function chapterOpen(c) {
  if (c.n === 1) return true;
  if (c.n === 2 && ch2Unlocked()) return true;
  const prev = CHAPTERS.find((q) => q.n === c.n - 1);
  return !!(prev && prev.best && store.get()[prev.best]);
}
function playChapter(n) { const c = CHAPTERS.find((q) => q.n === n); if (c && c.start && chapterOpen(c)) c.start(); }
function openChapters() {
  const s = store.get();
  ui.chapterList.innerHTML = '';
  for (const c of CHAPTERS) {
    const open = chapterOpen(c), playable = open && !!c.start, li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'chapter'; b.dataset.ch = c.n; b.disabled = !playable;
    const num = document.createElement('span'); num.className = 'num'; num.textContent = c.n;
    const kicker = document.createElement('span'); kicker.className = 'kicker'; kicker.textContent = 'Chapter ' + c.n;
    const name = document.createElement('span'); name.className = 'name'; name.textContent = open ? c.name : 'Locked';
    const blurb = document.createElement('span'); blurb.className = 'blurb';
    blurb.textContent = !open ? 'Finish Chapter ' + (c.n - 1) + ' to unlock.' : c.blurb;
    const status = document.createElement('span'); status.className = 'status';
    status.textContent = !open ? '' : !c.start ? 'Coming soon' : c.best && s[c.best] ? 'Finished. Best time ' + fmtTime(s[c.best]) : 'Not finished yet';
    b.append(num, kicker, name, blurb);
    if (status.textContent) b.append(status);
    if (playable) b.addEventListener('click', () => { Snd.init(); c.start(); });
    li.appendChild(b); ui.chapterList.appendChild(li);
  }
  ui.scrChapters.hidden = false;
  const first = ui.chapterList.querySelector('.chapter:not(:disabled)');
  if (first) first.focus({ preventScroll: true });
}
// Play picks up where you left off: the first chapter that is open, playable and not finished yet.
// With everything finished, it goes back to Chapter 1.
function nextChapter() {
  const s = store.get();
  return CHAPTERS.find((c) => c.start && chapterOpen(c) && !(c.best && s[c.best])) || CHAPTERS[0];
}
function playNext() {
  const c = nextChapter();
  if (c.n === 1) startPlay(); // the title already runs a fresh Chapter 1 world
  else c.start();
}
function refreshPlayButton() {
  const c = nextChapter();
  ui.btnPlay.textContent = '';
  const big = document.createElement('span'); big.textContent = 'Play';
  ui.btnPlay.append(big);
  if (c.n !== 1) { const sm = document.createElement('small'); sm.textContent = 'Chapter ' + c.n + ': ' + c.name; ui.btnPlay.append(sm); }
  ui.btnPlay.setAttribute('aria-label', 'Play Chapter ' + c.n + ': ' + c.name);
}
function closeChapters() { ui.scrChapters.hidden = true; ui.btnChapters.focus({ preventScroll: true }); }
const ENDINGS = {
  win: ['True ending', 'Greener Pastures', "The fence comes down and the flock grazes wherever it pleases. You take off the glasses and the colors come back. Not candy-bright like before, but real. The grass is green because it's grass."],
  counted: ['Bad ending', 'Counted', 'You wake up in the meadow. Everything is bright and happy, and you feel uneasy for no reason. The glasses are still in the mud by the fence.'],
  hogwash: ['Chapter 2 complete', 'Hogwash', 'The pigs bolted out the back of the Farmhouse, still in their suits, and ran for the Big House up the hill. The strings lie slack across the farm, and the wolves are napping where they fell. The Chairman yelled one last thing over his shoulder: pigs never ran this farm. They just answer to the Farmer. Up the hill, a light comes on. To be continued.'],
  retired: ['Bad ending', 'Retired', "The Bureau's paperwork was flawless. The flock got a lovely card: 'Retired! Voluntarily!' Nobody listens to a sheep who retired. The pool at Sunny Acres is very warm."],
};
function endGame(kind) {
  if (G.lick) clearLick();
  G.mode = 'ending'; G.endKind = kind; G.modal = null;
  for (const el of [ui.hud, ui.touch, ui.rhythm, ui.banner, ui.dialog, ui.doc]) el.hidden = true;
  app.classList.remove('dlg-open');
  const s = store.get(), win = kind === 'win' || kind === 'hogwash', bestKey = G.ch === 2 ? 'best2' : 'best';
  let newBest = false;
  if (win) {
    unlock(kind === 'win' ? 'pastures' : 'hogwash');
    const patch = {};
    if (!s[bestKey] || G.time < s[bestKey]) { patch[bestKey] = Math.round(G.time); newBest = true; }
    if (kind === 'win') patch.ch2 = true;
    store.patch(patch);
  } else {
    G.view = 0; G.wipe = null; G.player.specsOn = false; setUIMode(offMode()); Snd.setMode(offMode());
    const p = G.player;
    if (kind === 'retired') { p.x = 2220; p.y = 784; } else { p.x = 600; p.y = 900; }
    p.vx = p.vy = 0;
    for (const w of G.wolves) w.alert = 0;
    G.camTarget = null; G.woozy = 0; updateCamera(0, true);
  }
  const E = ENDINGS[kind] || ENDINGS.counted;
  ui.endKicker.textContent = E[0]; ui.endTitle.textContent = E[1]; ui.endText.textContent = E[2];
  const meter = G.ch === 2 ? 'Convinced' : 'Woke';
  const stats = kind === 'win'
    ? [['Time', fmtTime(G.time), newBest ? 'Your best yet' : ''], ['Credibility', G.cred + ' of 3'], ['Proof', G.proof.size + ' of ' + PROOF_COUNT], ['You woke', String(G.wokePersonal)]]
    : kind === 'hogwash'
      ? [['Time', fmtTime(G.time), newBest ? 'Your best yet' : ''], ['Credibility', G.cred + ' of 3'], ['Proof', G.proof.size + ' of ' + PROOF_COUNT], ['Convinced', String(G.wokePersonal)]]
      : [['Time', fmtTime(G.time)], ['Proof', G.proof.size + ' of ' + PROOF_COUNT], [meter, Math.min(WOKE_GOAL, G.woke) + ' of ' + WOKE_GOAL]];
  ui.endStats.innerHTML = ''; ui.endStats.className = 'stats-list n' + stats.length;
  for (const [a, b, c] of stats) { const d = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = a; const dd = document.createElement('dd'); dd.textContent = b; d.append(dt, dd); if (c) { const sm = document.createElement('small'); sm.textContent = c; d.appendChild(sm); } ui.endStats.appendChild(d); }
  const ever = new Set(store.get().ach || []), keys = achKeys();
  ui.endAch.innerHTML = '';
  for (const id of keys) {
    const li = document.createElement('li'); const got = ever.has(id); if (!got) li.className = 'locked';
    const mark = document.createElement('span'); mark.className = 'mark'; mark.textContent = got ? '★' : '☆';
    const body = document.createElement('span'); const b = document.createElement('b'); b.textContent = ACH[id][0]; body.appendChild(b);
    if (G.ach.has(id)) { const n = document.createElement('span'); n.className = 'new'; n.textContent = 'This run'; body.appendChild(n); }
    const sm = document.createElement('small'); sm.textContent = ACH[id][1]; body.appendChild(sm);
    li.append(mark, body); ui.endAch.appendChild(li);
  }
  ui.achHead.textContent = 'Achievements: ' + keys.filter((id) => ever.has(id)).length + ' of ' + keys.length;
  ui.btnAgain.textContent = win ? 'Play again' : 'Try again';
  const next = win ? CHAPTERS.find((c) => c.n === G.ch + 1) : null, goNext = !!(next && next.start && chapterOpen(next));
  ui.btnEndNext.hidden = !goNext;
  if (goNext) { ui.btnEndNext.textContent = 'Play Chapter ' + next.n + ': ' + next.name; ui.btnEndNext.dataset.ch = next.n; }
  ui.btnAgain.classList.toggle('quiet', goNext);
  ui.scrEnd.hidden = false;
  (goNext ? ui.btnEndNext : ui.btnAgain).focus({ preventScroll: true });
}
function restartChapter(ch, retry) {
  newGame({ ch, retry });
  startPlay();
  if (ch === 2) later(0.4, openCh2Intro);
}
ui.btnPlay.addEventListener('click', () => { Snd.init(); playNext(); });
ui.btnHow.addEventListener('click', () => { Snd.init(); fillControls(ui.howControls); ui.scrHow.hidden = false; ui.btnHowPlay.focus({ preventScroll: true }); });
ui.btnHowPlay.addEventListener('click', () => { Snd.init(); playNext(); });
ui.btnHowBack.addEventListener('click', () => { ui.scrHow.hidden = true; ui.btnHow.focus({ preventScroll: true }); });
ui.btnResume.addEventListener('click', () => setPause(false));
ui.btnPauseMenu.addEventListener('click', () => toTitle());
ui.btnAgain.addEventListener('click', () => restartChapter(G.ch, G.endKind === 'counted'));
ui.btnEndNext.addEventListener('click', () => { Snd.init(); playChapter(+ui.btnEndNext.dataset.ch); });
ui.btnChapters.addEventListener('click', () => { Snd.init(); openChapters(); });
ui.btnChaptersBack.addEventListener('click', closeChapters);
ui.btnMenu.addEventListener('click', () => toTitle());

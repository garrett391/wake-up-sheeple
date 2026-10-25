/* ---------------- basics ---------------- */
const DEBUG = /[?&]debug\b/.test(location.search);
const $ = (s) => document.querySelector(s);
const app = $('#app');
const cv = $('#cv');
const mainCtx = cv.getContext('2d');
let ctx = mainCtx;
const RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const COARSE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
function mulberry(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay; const l2 = dx * dx + dy * dy;
  const t = l2 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

const store = {
  get() {
    try { const v = JSON.parse(localStorage.getItem('wake-up-sheeple') || '{}'); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  },
  patch(obj) {
    try { localStorage.setItem('wake-up-sheeple', JSON.stringify(Object.assign(store.get(), obj))); }
    catch (e) { /* storage unavailable: progress just isn't remembered */ }
  },
};

/* ---------------- palette: [candy (glasses off), truth (glasses on), real (fence down)] ---------------- */
const PAL_SRC = {
  grass: ['#8BE36A', '#6B7166', '#7AAE5C'], grass2: ['#9DEB7E', '#71776B', '#83B664'], tuft: ['#56C246', '#575D53', '#5C9443'],
  out: ['#A6A79F', '#76B05B', '#82B862'], out2: ['#8F918A', '#5D9C46', '#679F4B'], road: ['#B4B1A8', '#A08A6C', '#C8A77C'],
  path: ['#FFD49C', '#7A746A', '#C8A77C'], path2: ['#FFE4BF', '#837C71', '#D4B68E'],
  mud: ['#9D9389', '#6A4D33', '#7A5A3C'], mud2: ['#8A8076', '#563D27', '#634830'],
  hill: ['#A6EF88', '#757C6F', '#8CBC6C'], hillHi: ['#C2F6AB', '#7F8679', '#9AC77B'],
  ltTrunk: ['#FFFFFF', '#6F665B', '#7A5A3E'], ltTop: ['#FF8FC8', '#7D766C', '#7E9A5E'], ltTop2: ['#FFC2E2', '#8A8378', '#8FAA6E'],
  otTrunk: ['#8A877F', '#6B4A2E', '#7A5A3E'], otTop: ['#A2A49B', '#4E9A43', '#5E9A4C'], otTop2: ['#B2B4AB', '#63AE52', '#6FAA58'],
  rock: ['#B7B8B1', '#8E8C86', '#9A968E'], rock2: ['#9C9D96', '#76746F', '#827E77'],
  fence: ['#FFFFFF', '#8F8A80', '#E7E0D2'], fenceSh: ['#FFC4DF', '#6E6A62', '#BDB4A2'], wire: ['#00000000', '#D9C25E', '#00000000'],
  iron: ['#FFFFFF', '#3E3D3A', '#5B574F'],
  barn: ['#FF5C7A', '#6E5E5B', '#A94E3E'], barnSh: ['#E8436A', '#5D4F4C', '#8F4033'], trim: ['#FFFFFF', '#A7A39B', '#EFE8DA'],
  roof: ['#FFC94D', '#55524D', '#6B4F3A'], roofSh: ['#F2A93B', '#47443F', '#5C4330'],
  clinic: ['#E9F7FF', '#9C9C98', '#E3DDCF'], clinicSh: ['#C6E8FA', '#868682', '#C8C1B1'], clinicRf: ['#7FD8FF', '#5D5F61', '#5F7480'],
  shack: ['#FFE14D', '#8A8478', '#D3AF67'], shackSh: ['#F5C631', '#757064', '#B8954F'],
  awnA: ['#FF5FA2', '#77716B', '#B8553E'], awnB: ['#FFFFFF', '#A29E96', '#F1EADC'],
  wood: ['#F3B36B', '#6F6457', '#A57A4F'], woodSh: ['#D98E45', '#5A5047', '#7E5A38'],
  board: ['#FFF6D6', '#B9B4A8', '#EADFC6'], ink: ['#5A2DB0', '#24231F', '#3A3226'], glass: ['#BDEBFF', '#7A8086', '#A9C3CF'],
  sack: ['#FFEFB0', '#A39C8E', '#D7C8A2'], sackInk: ['#FF5FA2', '#4A4741', '#8A6A3A'], food: ['#FF8CC6', '#8D7356', '#9B8255'],
  shadow: ['#5A2DB02B', '#0000003D', '#1E28142E'],
  wool: ['#FFFFFF', '#CFCBC2', '#F3EEE5'], woolSh: ['#FFD0E5', '#A19D95', '#D8D0C2'], woolHi: ['#FFFFFFB3', '#E4E1DA80', '#FFFFFF80'],
  blackWool: ['#5E4A78', '#3A3836', '#4A4440'],
  face: ['#FFB6D2', '#57534E', '#43392F'], faceSh: ['#F28FB7', '#46423E', '#33291F'], legs: ['#FF97C0', '#3F3C39', '#3A3029'],
  eyeW: ['#FFFFFF', '#E3E0D9', '#FFFFFF'], pupil: ['#2E1658', '#1B1A18', '#1C1915'], cheek: ['#FF6FA866', '#00000000', '#D0706033'],
  bow: ['#FF3D8B', '#5E5A55', '#C04A5A'], shawl: ['#B69CFF', '#6E6875', '#8E7BA8'],
  foil: ['#E9EEF5', '#B3B6BA', '#D5D9DE'], foilSh: ['#B9C2CF', '#8A8D91', '#A8ADB4'], tag: ['#FFD400', '#C9A92E', '#E2B93B'],
  frames: ['#2B1B4A', '#151413', '#1E1B18'],
  skin: ['#FFD1B0', '#A39A8F', '#E6BF9C'], skinSh: ['#F2B48E', '#8C847A', '#CDA27E'],
  hair: ['#9B5B2E', '#4E4740', '#6B4A2E'], hairG: ['#E6E1F0', '#A9A59E', '#D9D4CC'],
  shirtW: ['#6EC6FF', '#5E6670', '#5B7FA0'], shirtG: ['#C99CFF', '#6B6470', '#8E6BA8'], apron: ['#FFFFFF', '#AFAAA2', '#F0EBE0'],
  coat: ['#FFFFFF', '#B5B3AE', '#EEEAE2'], suit: ['#5B5BD6', '#4A4B52', '#3D4A5C'],
  sashA: ['#20C6B6', '#5C6B69', '#2E8C83'], sashB: ['#FF9F1C', '#7A6A58', '#C97A1E'],
  pants: ['#6B3FD1', '#3E3C3A', '#4A4036'], boots: ['#7A3E1D', '#2E2C2A', '#3B2B1E'],
  hat: ['#FFE07A', '#8D8571', '#D9B95F'], hatSh: ['#F2C94C', '#766F5E', '#BE9F4A'], band: ['#FF5FA2', '#5B5248', '#8A3B2E'],
  bonnet: ['#FFFFFF', '#B0ABA2', '#F2ECE0'], crook: ['#C98A4B', '#5E544A', '#8A6340'], steth: ['#8A93A6', '#3E3E40', '#5A5F68'],
  fur: ['#8A8E96', '#6B6E74', '#7B7F86'], furDk: ['#62666E', '#4A4D52', '#565A60'], furLt: ['#B4B8BF', '#8E9197', '#A3A7AD'],
  wolfEye: ['#FFD23F', '#FFD23F', '#FFD23F'], teeth: ['#FFFFFF', '#F2F0EA', '#FFFFFF'], nose: ['#2B2A2E', '#1A1A1C', '#222222'],
  dog: ['#2B2B31', '#26262A', '#2B2B31'], dogW: ['#FFFFFF', '#DCD9D2', '#F6F3EC'], cap: ['#2E3A8C', '#2D3036', '#2E3A60'],
  candyA: ['#FF7AC6', '#7E7871', '#C9A0A0'], candyB: ['#7FD8FF', '#8A857D', '#A0B8C9'],
  alertInk: ['#FF3D8B', '#C8372D', '#2F7A3A'], bubble: ['#FFFFFF', '#E8E4D8', '#F6F8F1'], bubbleInk: ['#3E1F7A', '#22211F', '#24502C'],
};
function hex(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
}
const PAL = {};
for (const k in PAL_SRC) PAL[k] = PAL_SRC[k].map(hex);
let RT = 0, RR = 0; // current pass: truth blend, real blend
let pcKey = '', pcA = {}, pcS = {};
function PA(k) {
  const key = RT + '|' + RR;
  if (key !== pcKey) { pcKey = key; pcA = {}; pcS = {}; }
  let v = pcA[k];
  if (v) return v;
  const p = PAL[k];
  v = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) v[i] = lerp(lerp(p[0][i], p[1][i], RT), p[2][i], RR);
  return (pcA[k] = v);
}
function css(v) {
  return v[3] >= 0.999 ? 'rgb(' + (v[0] | 0) + ',' + (v[1] | 0) + ',' + (v[2] | 0) + ')'
    : 'rgba(' + (v[0] | 0) + ',' + (v[1] | 0) + ',' + (v[2] | 0) + ',' + v[3].toFixed(3) + ')';
}
function P(k) { PA(k); let s = pcS[k]; if (!s) s = pcS[k] = css(pcA[k]); return s; }
function PM(k1, k2, f) { const a = PA(k1), b = PA(k2); return css([lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(a[3], b[3], f)]); }
const isTruthPass = () => RT > 0.5 && RR < 0.5;

/* ---------------- drawing primitives ---------------- */
function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
function ell(x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
function rrect(x, y, w, h, r) {
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
}
function fillC(k, x, y, r) { ctx.fillStyle = P(k); circ(x, y, r); ctx.fill(); }
function fillE(k, x, y, rx, ry, rot) { ctx.fillStyle = P(k); ell(x, y, rx, ry, rot); ctx.fill(); }
function fillR(k, x, y, w, h, r) { ctx.fillStyle = P(k); if (r) { rrect(x, y, w, h, r); ctx.fill(); } else ctx.fillRect(x, y, w, h); }
function circles(list) { ctx.beginPath(); for (const c of list) { ctx.moveTo(c[0] + c[2], c[1]); ctx.arc(c[0], c[1], c[2], 0, TAU); } }
function sparkle(x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
}

/* ---------------- text ---------------- */
const F_CANDY = '"Titan One","Arial Rounded MT Bold","Trebuchet MS",sans-serif';
const F_TRUTH = '"Special Elite","Courier New",monospace';
const F_BODY = '"Baloo 2","Trebuchet MS",sans-serif';
const fitCache = new Map();
const fontStr = (size, font, weight) => (weight ? weight + ' ' : '') + size.toFixed(2) + 'px ' + font;
function fitSize(txt, font, size, maxW, weight) {
  if (!maxW) return size;
  const key = txt + '|' + font + '|' + size + '|' + maxW + '|' + (weight || '');
  let s = fitCache.get(key);
  if (s === undefined) {
    ctx.font = fontStr(size, font, weight);
    const w = ctx.measureText(txt).width;
    s = w > maxW ? (size * maxW) / w : size;
    fitCache.set(key, s);
  }
  return s;
}
function text(txt, x, y, size, font, color, maxW, align, weight) {
  const s = fitSize(txt, font, size, maxW, weight);
  ctx.font = fontStr(s, font, weight); ctx.fillStyle = color;
  ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, x, y);
}
function textOutlined(txt, x, y, size, font, fill, stroke, weight) {
  ctx.font = fontStr(size, font, weight); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size * 0.28); ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}
function signText(candy, truth, x, y, size, maxW, colorKey) {
  let tr = RT > 0.5 || RR > 0.5;
  if (G.ch === 2) { const o = CH2_SIGNS[candy]; if (o) { candy = o[0]; truth = o[1]; } tr = RT > 0.5; }
  text(tr ? truth : candy, x, y, tr ? size * 0.95 : size, tr ? F_TRUTH : F_CANDY, P(colorKey || 'ink'), maxW);
}
if (document.fonts) {
  ['400 20px "Titan One"', '400 20px "Special Elite"', '700 20px "Baloo 2"'].forEach((f) => {
    document.fonts.load(f).then(() => fitCache.clear()).catch(() => {});
  });
  if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => fitCache.clear());
}

/* ---------------- the ranch ---------------- */
const W = 3150, H = 3000;
const MW = 1500, MH = 1300; // the ranch itself; other pastures sit further out in the same world
const FX0 = 60, FX1 = 1220, FY0 = 130, FY1 = 1050;
const HOLE0 = 770, HOLE1 = 830;
const GATE0 = 560, GATE1 = 680, GATEX = 620;
const WILD = { x0: FX1, x1: 1480, y0: 150, y1: 1035 };
const BARN = { x0: 840, y0: 210, x1: 1040, y1: 320 };
const CLINIC = { x0: 120, y0: 560, x1: 300, y1: 660 };
const SHACK = { x0: 500, y0: 700, x1: 620, y1: 760 };
const TROUGH = { x0: 660, y0: 800, x1: 800, y1: 830 };
const HILL = { x: 640, y: 520 };
const GLASSES_AT = { x: 1372, y: 806 };
const RAINBOW = { x: 500, y: 236 };

const solids = [];
function solid(x0, y0, x1, y1, tag, opaque) { const b = { x0, y0, x1, y1, tag: tag || '', opaque: !!opaque, on: true }; solids.push(b); return b; }
solid(FX0 - 6, FY0 - 6, FX1 + 6, FY0 + 6, 'fence');
solid(FX0 - 6, FY0 - 6, FX0 + 6, FY1 + 6, 'fence');
solid(FX1 - 6, FY0 - 6, FX1 + 6, HOLE0, 'fence');
solid(FX1 - 6, HOLE1, FX1 + 6, FY1 + 6, 'fence');
solid(FX0 - 6, FY1 - 6, GATE0, FY1 + 6, 'fence');
solid(GATE1, FY1 - 6, FX1 + 6, FY1 + 6, 'fence');
solid(GATE0, FY1 - 6, GATE1, FY1 + 6, 'gate');
solid(FX1, WILD.y0 - 14, WILD.x1 + 14, WILD.y0, 'wild');
solid(WILD.x1, WILD.y0 - 14, WILD.x1 + 14, WILD.y1 + 14, 'wild');
solid(FX1, WILD.y1, WILD.x1 + 14, WILD.y1 + 14, 'wild');
for (const b of [BARN, CLINIC, SHACK]) solid(b.x0, b.y0, b.x1, b.y1, 'building', true);
solid(TROUGH.x0, TROUGH.y0, TROUGH.x1, TROUGH.y1, 'prop');
solid(426, 240, 442, 256, 'prop'); solid(558, 240, 574, 256, 'prop'); // billboard posts
solid(772, 752, 808, 772, 'prop'); // feed sacks
solid(776, 318, 812, 346, 'prop'); // crate

const SIGNS = [
  { x: 470, y: 1004, w: 150, candy: 'GRAZE HAPPY!', truth: 'STAY FULL. STAY QUIET.' },
  { x: 930, y: 600, w: 196, candy: 'YOUR SHEPHERDS LOVE YOU', truth: 'YOUR SHEPHERDS ARE HUNGRY' },
  { x: 1150, y: 712, w: 172, candy: '100% FREE RANGE!', truth: 'RANGE: 40 ACRES, ELECTRIFIED' },
  { x: 150, y: 714, w: 150, candy: 'FREE LOLLIPOPS!', truth: 'REPEAT CUSTOMERS ONLY' },
  { x: 860, y: 1112, w: 190, candy: 'DANGER! WOLVES OUT THERE!', truth: 'THE WOLVES ARE INSIDE' },
];
for (const s of SIGNS) solid(s.x - 4, s.y - 5, s.x + 4, s.y, 'prop');
const LOLLI = [[160, 880], [1182, 1008], [250, 800], [760, 176]];
for (const [x, y] of LOLLI) solid(x - 4, y - 5, x + 4, y, 'prop');

const PATHS = [
  [[620, 1050], [620, 960], [640, 860], [645, 720], [640, 600]],
  [[690, 470], [790, 400], [900, 345]],
  [[580, 560], [450, 610], [330, 650], [230, 665]],
  [[600, 450], [540, 330], [505, 262]],
  [[645, 760], [700, 790]],
  [[330, 650], [290, 480], [220, 260], [195, 140]],
  [[790, 400], [1000, 420], [1140, 520], [1190, 700], [1205, 800]],
];

const SHEEP_DEFS = [
  { id: 'barbara', name: 'Barbara', kind: 'key', x: 745, y: 885, wander: 26, needs: 'label' },
  { id: 'doug', name: 'Doug', kind: 'key', x: 1110, y: 420, wander: 26, needs: 'checks' },
  { id: 'nana', name: 'Nana Fleece', kind: 'key', x: 250, y: 236, wander: 20, needs: 'prices' },
  { id: 'kevin', name: 'Kevin', kind: 'kevin', x: 352, y: 318, wander: 24 },
  { id: 'lambert', name: 'Lambert', kind: 'lamb', x: 700, y: 948, wander: 40 },
  { id: 'shirley', name: 'Shirley', kind: 'flock', x: 430, y: 862, wander: 70, line: 0 },
  { id: 'ewan', name: 'Ewan', kind: 'flock', x: 300, y: 955, wander: 70, line: 1 },
  { id: 'woolfred', name: 'Woolfred', kind: 'flock', x: 905, y: 995, wander: 70, line: 2 },
  { id: 'fleecia', name: 'Fleecia', kind: 'flock', x: 1010, y: 760, wander: 70, line: 3 },
  { id: 'rambo', name: 'Rambo', kind: 'flock', x: 270, y: 440, wander: 60, line: 4 },
  { id: 'dolly', name: 'Dolly', kind: 'flock', x: 700, y: 330, wander: 60, line: 5 },
  { id: 'cumulus', name: 'Cumulus', kind: 'flock', x: 545, y: 618, wander: 60, line: 6 },
  { id: 'baarry', name: 'Baarry', kind: 'flock', x: 1120, y: 640, wander: 60, line: 7 },
];
const WOLF_DEFS = [
  { id: 'wolfgang', name: 'Shepherd Wolfgang', type: 'shepherd', x: 640, y: 468, behavior: 'patrol', path: [[460, 440], [820, 440], [820, 640], [460, 640]], range: 210, half: 0.55, speed: 52, dir: Math.PI / 2 },
  { id: 'granny', name: 'Granny Gnasher', type: 'granny', x: 560, y: 794, behavior: 'sweep', base: Math.PI / 2, amp: 1.05, freq: 0.55, range: 220, half: 0.5, dir: Math.PI / 2 },
  { id: 'doc', name: 'Dr. Fangsworth', type: 'doctor', x: 372, y: 540, behavior: 'patrol', path: [[372, 520], [372, 800]], range: 190, half: 0.5, speed: 44, dir: Math.PI / 2 },
  { id: 'romrem', name: 'Rom & Rem', type: 'twohead', x: 950, y: 396, behavior: 'spin', spin: 0.45, range: 175, half: 0.42, dir: 0 },
  { id: 'biscuit', name: 'Sgt. Biscuit', type: 'dog', x: 1100, y: 520, behavior: 'patrol', path: [[1100, 520], [1100, 960], [860, 960], [860, 520]], range: 150, half: 0.5, speed: 70, dir: Math.PI / 2, inactive: true },
];
const GATE_ROUTES = {
  wolfgang: [[450, 690], [470, 900], [526, 990]],
  granny: [[560, 900], [584, 996]],
  doc: [[420, 920], [650, 996]],
  romrem: [[880, 780], [780, 930], [718, 990]],
};
const BFLY_PATH = [[650, 930], [760, 880], [900, 860], [1040, 830], [1160, 805], [1222, 800], [1300, 795], [1364, 788]];

const PROOF_DEFS = [
  { id: 'label', x: 790, y: 782, name: 'Clover Crunch label', short: 'the Clover Crunch label', title: 'Clover Crunch: what is actually in it',
    lines: [['Part of a balanced breakfast*', ''], ['Sugar beet', '61%'], ['Sawdust', '34%'], ['Artificial clover flavor', '5%'], ['Clover', '0%']],
    note: "*Balanced on a shepherd's plate." },
  { id: 'prices', x: 334, y: 704, name: 'Clinic price list', short: 'the clinic price list', title: "Dr. Fangsworth's Clinic: price list",
    lines: [['Free lollipop', '0 wool'], ['Itch cream', '3 wool'], ['Droop pills', '5 wool'], ['Itch cream (again)', '3 wool'], ['Cure', 'Not stocked']],
    note: 'Note to staff: never stock the cure.' },
  { id: 'checks', x: 794, y: 354, name: 'Campaign checks', short: 'the campaign checks', title: 'Two campaign checks',
    lines: [['Pay to: ROM', '500 wool'], ['Pay to: REM', '500 wool'], ['Signed', 'Wolfgang (paw print)'], ['Signed', 'Wolfgang (same paw print)']],
    note: 'Memo: either way, we eat.' },
];

const LINES = {
  barbara: {
    pron: 'her',
    intro: "Morning, hon! Isn't breakfast the BEST? Six years, never missed a meal. Never missed a jingle!",
    prompt: "Anyway! What's on your mind, hon?",
    ask: "Ever wonder why you're so sleepy after breakfast?",
    reply: "Sleepy? I'm RELAXED. Although my tummy does feel funny after the Clover Crunch. Let's not be negative!",
    hint: 'Hint: Barbara frets about breakfast.',
    proofOK: "Sugar beet... SAWDUST? Zero percent clover?! Six years, hon. Six years I've been eating a fence!",
    proofNo: "That's an awful lot of negativity before lunch, hon.",
    wolf: "WOLF? Hon, I just had breakfast. Let's not be dramatic.",
    lendOK: 'Oh. Oh no. The trough is beige. Everything is beige!',
    lendNo: "AAAH! Negativity! I'm telling Granny!",
    woke: "I'm off the Clover Crunch. I feel like a new ewe.",
  },
  doug: {
    pron: 'him',
    intro: 'Can you BELIEVE the South Pasture sheep? Rem wants to move us all south. Over my dead fleece. Rom forever!',
    prompt: "What? I'm busy being outraged.",
    ask: 'Have you ever actually met a South Pasture sheep?',
    reply: "Never! Don't need to. Rom and Rem hate each other. It's all over the Bleat.",
    hint: "Hint: Doug can't stop talking about the election.",
    proofOK: "Rom's campaign, paid by Wolfgang. Rem's campaign, paid by... WOLFGANG? Same paw print?! It's the same pasture. It was always the same pasture!",
    proofNo: 'Sounds like South Pasture propaganda to me.',
    wolf: 'Typical South Pasture fearmongering.',
    lendOK: 'Wait. Rom and Rem are one guy? With two heads? And ONE stomach?!',
    lendNo: 'AAAH! South Pasture witchcraft! SHEPHERD!',
    woke: "Two heads, one stomach. I'm never voting for a pasture again.",
  },
  nana: {
    pron: 'her',
    intro: "Hello, dear. Dr. Fangsworth says I'm off to Sunny Acres next week. A heated pool! Though my itch has never been worse.",
    prompt: 'What is it, dear?',
    ask: 'How long have you had the itch?',
    reply: 'Since my first free lollipop, dear. The cream makes me droopy, the pills make me itchy, and around we go. I remember when the grass was real...',
    hint: 'Hint: Nana Fleece has had an itch for years.',
    proofOK: "Itch cream, droop pills, itch cream again... 'Cure: not stocked'? That old crook! I'm not going to Sunny Acres, dear. Not now, not ever.",
    proofNo: "That's lovely, dear. Have you seen my reading glasses?",
    wolf: 'Oh dear. You sound like you need a lollipop.',
    lendOK: 'Oh my. There is the gray I remember. And the wolf. I remember him too.',
    lendNo: 'Oh! My heart! DOCTOR!',
    woke: 'Sunny Acres can heat its own pool, dear.',
  },
};
const FLOCK_LINES = [
  'Baa! Have you tried the Clover Crunch? Part of a balanced breakfast!',
  'I voted North Pasture! Or South. One of the pastures.',
  'Shearing Day is my favorite day. Free trim!',
  'The fence keeps the wolves out. It says so on the sign!',
  "Dr. Fangsworth gave me a lollipop. Now I itch. He'll fix it, though!",
  'Graze happy! Graze happy! Graze happy!',
  'My cousin went to Sunny Acres. She never writes. Must be the pool!',
  "Outside the fence? Ew. It's all gray out there.",
];
const FLOCK_SPECS = ['Why are you wearing those? You look... negative.', 'Glasses? On a sheep? Weird.', "Are you okay? You look like you've seen a wolf."];
const FLOCK_WOKE = ['I can SEE it now!', 'No more Clover Crunch!', 'To the gate!', 'Two heads, one stomach!', 'Baa! I mean it this time!', 'The grass is PAINTED!'];
const HERD_LINES = ['Now, now! Back to grazing!', 'Nothing to see here!', 'Who wants a sugar lick?', 'Snap election! North or South?', 'The fence is for your safety!'];
const CAUGHT_LINES = {
  wolfgang: "Now, now. What's a nice little lamb like you doing in glasses?",
  granny: 'My, what big glasses you have, dearie.',
  doc: 'Ah. A troubled one. Hold still.',
  romrem: 'ROM: Glasses! REM: Glasses! BOTH: To the clinic!',
  biscuit: 'WOOF! WOOF! (Sgt. Biscuit barks for the shepherds.)',
};
const ACH = {
  sheepish: ['Sheepish', 'Graze with your head down while a wolf is looking, 10 times'],
  wool: ['Pulled the Wool Off', 'Wake your first sheep'],
  cried: ['The Sheep Who Cried Wolf', 'Yell "WOLF!" at a sheep'],
  kevin: ['Kevin Was Right (Once)', 'Look at the rainbow with your glasses on'],
  pastures: ['Greener Pastures', 'Finish the demo'],
};

/* ---------------- decor (seeded, so it is the same every visit) ---------------- */
const R = mulberry(0x5EEB1E);
function decorBlocked(x, y, pad) {
  for (const b of solids) {
    if (b.tag === 'fence' || b.tag === 'wild' || b.tag === 'gate') continue;
    if (x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad) return true;
  }
  return false;
}
function onPath(x, y, w) {
  for (const p of PATHS) for (let i = 1; i < p.length; i++) if (distToSeg(x, y, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]) < w) return true;
  return false;
}
const insideFence = (x, y, m) => x > FX0 - m && x < FX1 + m && y > FY0 - m && y < FY1 + m;
const TUFTS_IN = [], TUFTS_OUT = [], FLOWERS = [], WILDFLOWERS = [], FOOD = [];
for (let i = 0; i < 560; i++) { const x = FX0 + 12 + R() * (FX1 - FX0 - 24), y = FY0 + 16 + R() * (FY1 - FY0 - 24); if (!decorBlocked(x, y, 8)) TUFTS_IN.push([x, y]); }
for (let i = 0; i < 520; i++) { const x = R() * MW, y = R() * MH; if (!insideFence(x, y, 8)) TUFTS_OUT.push([x, y]); }
for (let i = 0; i < 190; i++) {
  const x = FX0 + 20 + R() * (FX1 - FX0 - 40), y = FY0 + 24 + R() * (FY1 - FY0 - 40);
  if (decorBlocked(x, y, 14) || onPath(x, y, 22) || dist(x, y, HILL.x, HILL.y) < 60) continue;
  FLOWERS.push({ x, y, c: (R() * 5) | 0, s: 0.8 + R() * 0.45, ph: R() * TAU });
}
for (let i = 0; i < 260; i++) { const x = R() * MW, y = R() * MH; if (insideFence(x, y, 14) || dist(x, y, GLASSES_AT.x, GLASSES_AT.y) < 60 || Math.abs(x - GATEX) < 40 && y > FY1) continue; WILDFLOWERS.push({ x, y, c: (R() * 3) | 0 }); }
for (let i = 0; i < 26; i++) FOOD.push([TROUGH.x0 + 8 + R() * (TROUGH.x1 - TROUGH.x0 - 16), TROUGH.y0 - 3 + R() * 6, (R() * 2) | 0]);

const OUTTREES = [];
for (let x = 20; x < MW; x += 58 + R() * 30) OUTTREES.push({ x, y: 64 + R() * 46, s: 0.85 + R() * 0.35 });
for (let y = 190; y < FY1; y += 80 + R() * 30) OUTTREES.push({ x: 18 + R() * 20, y, s: 0.8 + R() * 0.3 });
for (let y = 200; y < 1020; y += 95 + R() * 40) OUTTREES.push({ x: 1494 + R() * 6, y, s: 0.9 + R() * 0.3 });
[[1300, 300, 1.1], [1430, 520, 1], [1290, 985, 1], [1440, 900, 1.15], [1420, 232, 0.95],
  [150, 1230, 1.1], [380, 1292, 1], [880, 1286, 1.05], [1120, 1200, 1.1], [1350, 1160, 1], [1450, 1275, 1.2], [60, 1120, 0.9]]
  .forEach(([x, y, s]) => OUTTREES.push({ x, y, s }));
const ROCKS = [];
for (let x = FX1 + 18; x < WILD.x1; x += 34 + R() * 16) { ROCKS.push({ x, y: WILD.y0 + 2, s: 0.8 + R() * 0.5, bush: R() < 0.5 }); ROCKS.push({ x, y: WILD.y1 + 10, s: 0.8 + R() * 0.5, bush: R() < 0.5 }); }

const FENCE = [];
function fenceRun(x0, y0, x1, y1, skip) {
  const horiz = y0 === y1; const len = horiz ? x1 - x0 : y1 - y0;
  const n = Math.round(len / 29), step = len / n;
  for (let i = 0; i < n; i++) {
    const a = (horiz ? x0 : y0) + i * step, mid = a + step / 2;
    if (skip && mid > skip[0] && mid < skip[1]) continue;
    const seg = horiz ? { x: a, y: y0, len: step, v: false } : { x: x0, y: a, len: step, v: true };
    seg.sortY = horiz ? y0 : a + step / 2;
    seg.delay = dist(horiz ? mid : x0, horiz ? y0 : mid, GATEX, FY1) / 1500;
    seg.bx0 = seg.x - 6; seg.by0 = seg.y - 34; seg.bx1 = seg.x + (horiz ? step : 0) + 6; seg.by1 = seg.y + (horiz ? 4 : step + 4);
    FENCE.push(seg);
  }
}
fenceRun(FX0, FY0, FX1, FY0, [150, 230]);
fenceRun(FX0, FY1, FX1, FY1, [GATE0, GATE1]);
fenceRun(FX0, FY0, FX0, FY1);
fenceRun(FX1, FY0, FX1, FY1, [HOLE0, HOLE1]);

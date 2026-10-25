/* ---------------- more pastures: Sunny Acres and the North/South Pasture ---------------- */
// Each pasture is its own walled area of the same world, joined by portals (a tunnel, two barn doors).
const REGIONS = {
  ranch: { x0: 0, y0: 0, x1: MW, y1: MH, ix0: FX0, iy0: FY0, ix1: FX1, iy1: FY1 },
  acres: { x0: 1880, y0: 0, x1: 3120, y1: 1000, ix0: 1940, iy0: 140, ix1: 3060, iy1: 920 },
  field: { x0: 1880, y0: 1040, x1: 2920, y1: 1780, ix0: 1926, iy0: 1146, ix1: 2874, iy1: 1640 },
};
function regionOf(x, y) {
  for (const k of ['acres', 'field', 'church', 'farm']) { const r = REGIONS[k]; if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return k; }
  return 'ranch';
}
// keep the ranch closed now that the world is wider than it
solid(MW, 0, MW + 20, MH, 'bound'); solid(0, MH, MW + 20, MH + 20, 'bound');

// Sunny Acres
solid(1920, 120, 3080, 140, 'wall'); solid(1920, 920, 3080, 940, 'wall');
solid(1920, 120, 1940, 940, 'wall'); solid(3060, 120, 3080, 940, 'wall');
const POT = { x: 2500, y: 470, rx: 128, ry: 62 };
solid(2385, 425, 2615, 515, 'pot', true);
const KITCHEN = { x0: 2820, y0: 150, x1: 3040, y1: 280 };
solid(KITCHEN.x0, KITCHEN.y0, KITCHEN.x1, KITCHEN.y1, 'building', true);
const HEDGES = [[2100, 420, 2180, 460], [2300, 610, 2380, 650], [2620, 610, 2700, 650], [2820, 430, 2900, 470], [2300, 270, 2380, 310], [2620, 270, 2700, 310], [2560, 790, 2640, 830], [2040, 600, 2110, 640]];
for (const h of HEDGES) solid(h[0], h[1], h[2], h[3], 'hedge', true);
const DESK = { x0: 2800, y0: 760, x1: 2900, y1: 790 };
solid(DESK.x0, DESK.y0, DESK.x1, DESK.y1, 'prop');
solid(2478, 160, 2522, 188, 'prop'); // tower legs
const PEN = { x0: 2160, y0: 720, x1: 2280, y1: 820, g0: 2200, g1: 2240 };
solid(PEN.x0, PEN.y0, PEN.g0, PEN.y0 + 6, 'pen'); solid(PEN.g1, PEN.y0, PEN.x1, PEN.y0 + 6, 'pen');
const PEN_GATE = solid(PEN.g0, PEN.y0, PEN.g1, PEN.y0 + 6, 'pengate');
solid(PEN.x0, PEN.y0, PEN.x0 + 6, PEN.y1, 'pen'); solid(PEN.x1 - 6, PEN.y0, PEN.x1, PEN.y1, 'pen'); solid(PEN.x0, PEN.y1 - 6, PEN.x1, PEN.y1, 'pen');

// the North Pasture and the South Pasture (one field, two doors)
solid(1900, 1134, 2900, 1146, 'wall'); solid(1900, 1134, 1926, 1660, 'wall'); solid(2874, 1134, 2900, 1660, 'wall');
solid(1900, 1640, 2100, 1660, 'wall'); solid(2700, 1640, 2900, 1660, 'wall');
const BARN_BACK = { x0: 2100, y0: 1640, x1: 2700, y1: 1700 };
solid(BARN_BACK.x0, BARN_BACK.y0, BARN_BACK.x1, BARN_BACK.y1, 'building', true);
const DIVIDER = { x: 2400, y0: 1232, y1: 1640 };
solid(DIVIDER.x - 6, DIVIDER.y0, DIVIDER.x + 6, DIVIDER.y1, 'divider');
const HQ = [{ x0: 2120, y0: 1300, x1: 2220, y1: 1330, side: 'north' }, { x0: 2580, y0: 1300, x1: 2680, y1: 1330, side: 'south' }];
for (const d of HQ) solid(d.x0, d.y0, d.x1, d.y1, 'prop');

const MORE_SIGNS = [
  { x: 2500, y: 582, w: 200, candy: 'HEATED POOL! JUMP IN!', truth: 'SOUP OF THE DAY: YOU' },
  { x: 2735, y: 344, w: 214, candy: 'TODAY: AQUA AEROBICS', truth: 'TODAY: STEW. TOMORROW: STEW.' },
  { x: 2140, y: 1214, w: 170, candy: 'NORTH PASTURE', truth: 'SAME PASTURE' },
  { x: 2660, y: 1214, w: 170, candy: 'SOUTH PASTURE', truth: 'SAME PASTURE' },
  { x: 2400, y: 1212, w: 160, candy: 'KEEP TO YOUR SIDE', truth: 'THERE ARE NO SIDES' },
];
for (const s of MORE_SIGNS) { SIGNS.push(s); solid(s.x - 4, s.y - 5, s.x + 4, s.y, 'prop'); }

const PORTALS = [
  { id: 'tunnel', region: 'ranch', x: 395, y: 270, r: 36, to: 'tunnelOut', truthOnly: true, label: "Crawl into Kevin's tunnel", arrive: [410, 300] },
  { id: 'tunnelOut', region: 'acres', x: 1990, y: 182, r: 36, to: 'tunnel', label: 'Crawl back to the ranch', arrive: [2018, 214] },
  { id: 'doorN', region: 'ranch', x: 890, y: 338, r: 32, to: 'fieldN', label: 'Go through the NORTH door', labelTruth: 'Go through the SAME door', arrive: [890, 354] },
  { id: 'doorS', region: 'ranch', x: 990, y: 338, r: 32, to: 'fieldS', label: 'Go through the SOUTH door', labelTruth: 'Go through the FIELD door', arrive: [990, 354] },
  { id: 'fieldN', region: 'field', x: 2250, y: 1626, r: 32, to: 'doorN', label: 'Back through the NORTH door', labelTruth: 'Back through the SAME door', arrive: [2250, 1598] },
  { id: 'fieldS', region: 'field', x: 2550, y: 1626, r: 32, to: 'doorS', label: 'Back through the SOUTH door', labelTruth: 'Back through the FIELD door', arrive: [2550, 1598] },
];

/* characters, proof and lines that change with the new pastures */
Object.assign(SHEEP_DEFS.find((d) => d.id === 'shirley'), { kind: 'key', needs: 'prices', wander: 30 });
SHEEP_DEFS.find((d) => d.id === 'nana').needs = 'guestbook';
SHEEP_DEFS.push(
  { id: 'gerald', name: 'Gerald', kind: 'gerald', x: 2220, y: 752, wander: 14, home: 'acres' },
  { id: 'norm', name: 'Norm', kind: 'flock', x: 2075, y: 1470, wander: 60, home: 'field',
    say: ["South Pasture sheep? Never met one. Don't need to. They're the WORST.", 'North Pasture forever! Our grass is NORTHIER.'],
    saySpecs: 'Is it just me, or does the South Pasture look... exactly like this one?' },
  { id: 'southby', name: 'Southby', kind: 'flock', x: 2725, y: 1470, wander: 60, home: 'field',
    say: ['North Pasture sheep eat NORTH grass. Disgusting.', 'South Pasture forever! Our grass is SOUTHIER.'],
    saySpecs: "Psst. Do you ever feel like we're standing in the same field?" },
);
Object.assign(PROOF_DEFS.find((p) => p.id === 'checks'), { x: 2170, y: 1348 });
PROOF_DEFS.push({ id: 'guestbook', x: 2850, y: 808, name: 'Sunny Acres guest book', short: 'the Sunny Acres guest book', title: 'Sunny Acres guest book',
  lines: [['Checked in, all time', '312'], ['Checked out, all time', '0'], ['Checked in yesterday', 'Gerald'], ['Pool temperature', 'Simmer']],
  note: 'Staff memo: stop calling it a pool. Residents are starting to notice.' });
const bis = WOLF_DEFS.find((w) => w.id === 'biscuit');
delete bis.inactive; bis.behavior = 'roam'; bis.speed = 70;
WOLF_DEFS.push(
  { id: 'howl', name: 'Nurse Howl', type: 'tower', x: 2500, y: 188, behavior: 'sweep', base: Math.PI / 2, amp: 0.95, freq: 0.42, range: 660, half: 0.12, sense: 'beam', dir: Math.PI / 2 },
  { id: 'chef', name: 'Chef Gnaw', type: 'chef', x: 2690, y: 680, behavior: 'patrol', path: [[2690, 680], [2980, 680], [2980, 890], [2690, 890]], range: 95, half: Math.PI, sense: 'sniff', speed: 50, dir: 0 },
);
Object.assign(CAUGHT_LINES, {
  howl: 'Lights out, dearie! No residents in the yard after sundown.',
  chef: 'Sniff, sniff. You smell nervous. Nervous is my favorite seasoning. NURSE!',
});
LINES.shirley = {
  pron: 'her',
  intro: "Oh, hi! Don't mind me, just itching. Dr. Fangsworth says it's nothing a few more lollipops can't fix!",
  prompt: 'Sorry, what were we talking about? I was itching.',
  ask: 'How long have you been itching?',
  reply: 'Since my first free lollipop! The cream makes me droopy, the pills make me itchy, and around we go. He always books a follow-up!',
  hint: 'Hint: Shirley has had an itch since her first free lollipop.',
  proofOK: "Itch cream, droop pills, itch cream again... 'Cure: not stocked'? He's been fleecing me! Literally!",
  proofNo: "That's nice, but is it itch cream?",
  wolf: 'Wolf? Is that contagious?',
  lendOK: 'Oh! The lollipop is gray. The doctor is GRAY. Everything itches less already.',
  lendNo: 'AAAH! Is this a side effect? DOCTOR!',
  woke: "No more lollipops. I'm itching for a revolution.",
};
Object.assign(LINES.doug, {
  reply: "Never! Don't need to. Rom and Rem hate each other. It's all over the Bleat. Their campaign offices are right through the barn doors.",
  hint: 'Hint: Doug is obsessed with the election. Rom and Rem have offices through the barn doors.',
});
Object.assign(LINES.nana, {
  intro: "Hello, dear. Dr. Fangsworth says I'm off to Sunny Acres next week. A heated pool! My friend Gerald went yesterday. He hasn't written.",
  prompt: 'What is it, dear?',
  ask: 'Has anyone ever come back from Sunny Acres?',
  reply: 'Come back? Why would they, dear? There is a pool. Although Kevin says he has been inside. Kevin says a lot of things.',
  hint: "Hint: Kevin says he's been inside Sunny Acres. Ask him.",
  proofOK: "312 checked in, and not one checked out? Gerald checked in YESTERDAY. I'm not going to Sunny Acres, dear. Not now, not ever.",
  proofNo: "That's lovely, dear. Have you seen my reading glasses?",
  lendOK: 'Oh my. There is the gray I remember. And the wolf. I remember him too.',
  lendNo: 'Oh! My heart! DOCTOR!',
  geraldOK: "Gerald! You came back! Nobody comes back! ...What do you mean, 'soup'?",
});
{
  const fin = ACH.pastures; delete ACH.pastures;
  ACH.biscuit = ['Good Boy', 'Win Sgt. Biscuit over to your side'];
  ACH.gerald = ['Early Retirement', 'Get Gerald out of Sunny Acres'];
  ACH.pasture = ['Same Pasture', 'Find out where both barn doors lead'];
  ACH.pastures = fin;
}
let WOKE_GOAL = 4; // set per chapter in newGame; PROOF_COUNT too

/* decor for the new pastures */
const ACRES_FLOWERS = [], FIELD_FLOWERS = [];
for (let i = 0; i < 120; i++) {
  const x = 1960 + R() * 1080, y = 160 + R() * 740;
  if (decorBlocked(x, y, 18) || dist(x, y, POT.x, POT.y) < 170) continue;
  ACRES_FLOWERS.push({ x, y, c: (R() * 5) | 0, s: 0.8 + R() * 0.4, ph: R() * TAU });
}
for (let i = 0; i < 150; i++) {
  const x = 1945 + R() * 910, y = 1160 + R() * 460;
  if (decorBlocked(x, y, 14) || Math.abs(x - DIVIDER.x) < 16) continue;
  FIELD_FLOWERS.push({ x, y, north: x < DIVIDER.x, s: 0.8 + R() * 0.4, ph: R() * TAU });
}
const REGION_TREES = [];
for (let x = 1900; x < 3110; x += 62 + R() * 30) REGION_TREES.push({ x, y: 40 + R() * 40, s: 0.85 + R() * 0.3 });
for (let x = 1900; x < 2910; x += 60 + R() * 30) REGION_TREES.push({ x, y: 1090 + R() * 30, s: 0.8 + R() * 0.3 });

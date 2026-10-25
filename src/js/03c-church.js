/* ---------------- the chapel: Sunday service with Pastor Fleecewell ---------------- */
// Outside: a little chapel in the southeast corner of the ranch. Inside: its own walled room, far below the ranch.
const CHAPEL = { x0: 955, y0: 860, x1: 1125, y1: 930, door: 1040 };
solid(CHAPEL.x0, CHAPEL.y0, CHAPEL.x1, CHAPEL.y1, 'building', true);
const CHAPEL_SIGN = { x: 845, y: 994 };
solid(CHAPEL_SIGN.x - 4, CHAPEL_SIGN.y - 5, CHAPEL_SIGN.x + 4, CHAPEL_SIGN.y, 'prop');
PATHS.push([[628, 915], [830, 946], [1040, 950]]);
{
  const np = PATHS[PATHS.length - 1];
  const nearPath = (x, y, w) => { for (let i = 1; i < np.length; i++) if (distToSeg(x, y, np[i - 1][0], np[i - 1][1], np[i][0], np[i][1]) < w) return true; return false; };
  const onChapel = (x, y, pad) => x > CHAPEL.x0 - pad && x < CHAPEL.x1 + pad && y > CHAPEL.y0 - pad - 30 && y < CHAPEL.y1 + pad;
  for (let i = FLOWERS.length - 1; i >= 0; i--) { const f = FLOWERS[i]; if (onChapel(f.x, f.y, 14) || nearPath(f.x, f.y, 22) || dist(f.x, f.y, CHAPEL_SIGN.x, CHAPEL_SIGN.y) < 26) FLOWERS.splice(i, 1); }
  for (let i = TUFTS_IN.length - 1; i >= 0; i--) if (onChapel(TUFTS_IN[i][0], TUFTS_IN[i][1], 4)) TUFTS_IN.splice(i, 1);
}

REGIONS.church = { x0: 160, y0: 1600, x1: 1340, y1: 2320, ix0: 250, iy0: 1720, ix1: 1250, iy1: 2280 };
const NAVE = { x0: 250, y0: 1722, x1: 1250, y1: 2278, aisle: 750 };
// walls are opaque, so nobody sees through them
solid(230, 1700, 1270, 1722, 'wall', true);
solid(230, 1700, 250, 2300, 'wall', true); solid(1250, 1700, 1270, 2300, 'wall', true);
solid(230, 2278, 1270, 2300, 'wall', true);
const CHANCEL = { x0: 560, y0: 1722, x1: 940, y1: 1822 };
solid(CHANCEL.x0, CHANCEL.y0, CHANCEL.x1, CHANCEL.y1, 'stage');
const ORGAN = { x0: 290, y0: 1722, x1: 462, y1: 1786 };
solid(ORGAN.x0, ORGAN.y0, ORGAN.x1, ORGAN.y1, 'prop');
// the pastor's study, next to the pulpit
const VESTRY = { x0: 1000, y0: 1722, x1: 1250, y1: 1864, g0: 1150, g1: 1206 };
solid(1000, 1722, 1012, 1864, 'wall', true);
solid(1000, 1852, VESTRY.g0, 1864, 'wall', true); solid(VESTRY.g1, 1852, 1250, 1864, 'wall', true);
const VDESK = { x0: 1150, y0: 1740, x1: 1236, y1: 1772 };
solid(VDESK.x0, VDESK.y0, VDESK.x1, VDESK.y1, 'prop');
const RACK = { x: 1062, y: 1770 };
solid(RACK.x - 26, RACK.y - 8, RACK.x + 26, RACK.y, 'prop');
const PEWS = [];
for (const y of [1900, 1980, 2060, 2140]) for (const [x0, x1] of [[380, 690], [810, 1120]]) { PEWS.push({ x0, x1, y }); solid(x0, y, x1, y + 12, 'pew'); }
const PILLARS = [[300, 1960], [300, 2120], [1200, 1960], [1200, 2120]];
for (const [x, y] of PILLARS) solid(x - 13, y - 13, x + 13, y + 13, 'pillar', true);

const CHURCH_SIGN = { x: 540, y: 2252, w: 206, candy: 'GIVE AND YE SHALL RECEIVE', truth: 'GIVE AND WE SHALL RECEIVE' };
SIGNS.push(CHURCH_SIGN); solid(CHURCH_SIGN.x - 4, CHURCH_SIGN.y - 5, CHURCH_SIGN.x + 4, CHURCH_SIGN.y, 'prop');

PORTALS.push(
  { id: 'chapel', region: 'ranch', x: CHAPEL.door, y: 944, r: 32, to: 'chapelOut', label: 'Go to Sunday service', labelTruth: 'Go into the chapel', arrive: [CHAPEL.door, 970] },
  { id: 'chapelOut', region: 'church', x: NAVE.aisle, y: 2262, r: 34, to: 'chapel', label: 'Leave the chapel', labelTruth: 'Get out of here', arrive: [NAVE.aisle, 2238] },
);

/* the congregation */
SHEEP_DEFS.push(
  { id: 'ewenice', name: 'Sister Ewenice', kind: 'key', x: 486, y: 1810, wander: 0, home: 'church', needs: 'fleece' },
  { id: 'bleatrice', name: 'Bleatrice', kind: 'flock', x: 440, y: 1930, wander: 0, home: 'church',
    say: ["Shh! Pastor's preaching.", 'I put my best fleece in the plate. It went somewhere wonderful.'],
    saySpecs: "Glasses? In church? Take those off. They're very... negative." },
  { id: 'shearon', name: 'Shearon', kind: 'flock', x: 620, y: 2010, wander: 0, home: 'church',
    say: ['The fence keeps the wolves out. Pastor says so every Sunday!', 'I never miss a service. We have one every day.'],
    saySpecs: 'Have you noticed Pastor never takes off his robe? Not even in summer?' },
  { id: 'ewegene', name: 'Ewegene', kind: 'flock', x: 880, y: 1930, wander: 0, home: 'church',
    say: ['Every head bowed, every eye closed. Best part of the week. So restful.'],
    saySpecs: 'Every time I bow my head, I come up a little colder. Funny, that.' },
  { id: 'fleecil', name: 'Fleecil', kind: 'flock', x: 1060, y: 2090, wander: 0, home: 'church',
    say: ['I asked Pastor a question once. ONCE.'],
    saySpecs: 'Where does the plate GO after the service?' },
  { id: 'lambuel', name: 'Lambuel', kind: 'flock', x: 480, y: 2170, wander: 0, home: 'church',
    say: ["Pastor says it's all gray outside the fence. I wouldn't know. I've never been."],
    saySpecs: 'Is it just me, or does Pastor have a tail?' },
  { id: 'woolma', name: 'Woolma', kind: 'flock', x: 960, y: 2170, wander: 0, home: 'church',
    say: ['Sister Ewenice plays the organ beautifully. Pastor says she plays it too loud.'],
    saySpecs: "Sister Ewenice always says, 'Watch for wolves in sheep's clothing.' Pastor tells her to hush." },
);
FLOCK_LINES[3] = 'The fence keeps the wolves out! Pastor Fleecewell says so every Sunday. The chapel is right over there.';

WOLF_DEFS.push(
  { id: 'pastor', name: 'Pastor Fleecewell', type: 'pastor', x: NAVE.aisle, y: 1806, behavior: 'sweep', base: Math.PI / 2, amp: 0.82, freq: 0.5, range: 470, half: 0.34, dir: Math.PI / 2 },
  { id: 'usher', name: 'Usher Howlett', type: 'usher', x: 330, y: 1880, behavior: 'patrol', path: [[330, 1880], [330, 2200], [1166, 2200], [1166, 1880]], range: 150, half: 0.55, speed: 46, dir: Math.PI / 2 },
);
Object.assign(CAUGHT_LINES, {
  pastor: 'Peeking during prayer, child? Tsk. I see everything. Usher, to the clinic.',
  usher: "Excuse me. The plate goes around ONCE. You're coming with me.",
});

PROOF_DEFS.push({ id: 'fleece', x: 1074, y: 1806, name: "The pastor's spare sheep suit", short: 'the spare sheep suit', title: "Pastor Fleecewell's closet",
  lines: [['Sheep suit, size Wolf XL', '1'], ['Laundry tag', 'Wash after every service'], ["This week's collection", '212 wool'], ['Sent up to the ranch', '212 wool']],
  note: 'Sermon notes: keep their heads bowed while the plate goes around. And ZIP UP.' });

LINES.ewenice = {
  pron: 'her',
  intro: 'Bless you, child! Pastor Fleecewell says the fence keeps the wolves out, and the plate keeps the fence up. Now hush, I have to play.',
  prompt: 'Yes, child?',
  ask: 'What does the Good Book say about wolves?',
  reply: "Oh, plenty! 'Beware of false prophets, which come to you in sheep's clothing, but inwardly they are ravenous wolves.' Matthew 7:15. Pastor says that one is about the South Pasture.",
  hint: "Hint: Sister Ewenice is watching for a wolf in sheep's clothing. Pastor Fleecewell's study is next to the pulpit.",
  proofOK: "A sheep suit... in a wolf's size? 'Keep their heads bowed while the plate goes around'? Sheep's clothing. Ravenous wolves. It was in the Book the whole time, and I let him read it to me.",
  proofNo: "Child, that is not scripture. Now hush, he's preaching.",
  wolf: 'Hush! Not during the sermon!',
  lendOK: "Lord have mercy. Pastor's robe has a ZIPPER. And a tail.",
  lendNo: 'AAAH! Devil specs! PASTOR!',
  woke: "When your flock gathers, I'll ring the chapel bell. My congregation always comes when the bell rings. And no more plate.",
};
{
  const fin = ACH.pastures; delete ACH.pastures;
  ACH.flock = ['Let My Flock Go', 'Have Sister Ewenice ring the bell for the stampede'];
  ACH.pastures = fin;
}
let PROOF_COUNT = PROOF_DEFS.length;

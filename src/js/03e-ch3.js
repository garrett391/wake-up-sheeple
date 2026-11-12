/* ---------------- Chapter 3: The Farmer ----------------
   A week after the pigs ran. The wolves are napping where their strings dropped them, the pigs moved up the hill,
   and the whole flock trusts the Farmer, whom nobody has ever seen. Up the hill stands the Big House.
   Your friends won't take proof this time: they believe what they see. So you take each one up the hill to a window.
   Everything below only exists in chapter 3 (ch: 3). */
const CH3 = 3;
const CH3_TYPES = new Set(['flood', 'scarecrow', 'hound', 'farmer']);
const CH3_PARAM = /[?&]chapter=3\b/.test(location.search);

// the hill: the Big House's yard, its own walled region below the studio
REGIONS.hill = { x0: 0, y0: 3060, x1: 1500, y1: 3940, ix0: 60, iy0: 3290, ix1: 1440, iy1: 3870 };
const BIGH = { x0: 470, y0: 3150, x1: 1030, y1: 3262, door: 750 };
chOnly(solid(BIGH.x0, BIGH.y0, BIGH.x1, BIGH.y1, 'building', true), CH3);
for (const r of [[20, 3236, BIGH.x0, 3262], [BIGH.x1, 3236, 1480, 3262], [20, 3236, 60, 3930], [1440, 3236, 1480, 3930], [20, 3880, 700, 3930], [800, 3880, 1480, 3930]]) {
  chOnly(solid(r[0], r[1], r[2], r[3], 'wall'), CH3);
}
// hedges: cover from the searchlight and the scarecrows
const HEDGES3 = [[190, 3420, 320, 3460], [1180, 3420, 1310, 3460], [400, 3580, 540, 3620], [960, 3580, 1100, 3620], [220, 3730, 360, 3770], [1140, 3730, 1280, 3770], [560, 3350, 690, 3384], [810, 3350, 940, 3384]];
for (const h of HEDGES3) chOnly(solid(h[0], h[1], h[2], h[3], 'hedge', true), CH3);
const LAMP = { x: 750, y: 3650 };
chOnly(solid(LAMP.x - 7, LAMP.y - 8, LAMP.x + 7, LAMP.y + 2, 'prop'), CH3);
const SCARECROWS = [[150, 3560, 0], [1350, 3560, Math.PI], [410, 3300, 0.1], [1090, 3300, Math.PI - 0.1]];
for (const [x, y] of SCARECROWS) chOnly(solid(x - 4, y - 6, x + 4, y, 'prop'), CH3);

// the Big House's front windows. Glasses off: lace curtains. Glasses on: what is behind them.
// Each friend believes one window, and only with their own eyes.
const WINDOWS3 = [
  { id: 'kitchen', x: 545, friend: 'barbara', name: 'the kitchen window', title: 'Through the kitchen window',
    lines: [['Year 1', 'Clover Crunch (the wolves)'], ['Year 7', 'New Clover Crunch (the pigs)'], ['Year 9', "Farmer's Own Clover Crunch"], ['Recipe', 'Unchanged']],
    note: 'Three boxes on the counter. Same sawdust in all of them.' },
  { id: 'radio', x: 640, friend: 'doug', name: 'the radio room window', title: 'Through the radio room window',
    lines: [['Tape 1', 'NORTH IS RIGHT'], ['Tape 2', 'SOUTH IS RIGHT'], ['Tape 3', 'THE PIGS ARE JUST PIGS'], ['Tape 4', 'A MESSAGE FROM THE FARMER']],
    note: 'One microphone. One chair. Both campaigns.' },
  { id: 'records', x: 860, friend: 'nana', name: 'the records room window', title: 'Through the records room window',
    lines: [['Card', 'NANA FLEECE'], ['Sunny Acres', 'Postponed (pigs ran)'], ['Reschedule', 'Harvest Festival'], ['Menu', 'See card']],
    note: 'A filing cabinet for every sheep on the farm. Yours is open.' },
  { id: 'workshop', x: 955, friend: 'ewenice', name: 'the workshop window', title: 'Through the workshop window',
    lines: [['On the bench', 'Glasses, sheep-sized'], ['Tag inside', 'PROPERTY OF GREENER PASTURES RANCH'], ['Batch', 'One pair per generation'], ['Delivery', 'Mud, east fence']],
    note: 'A note pinned over the bench: "Somebody restless always finds them."' },
];
const WIN_Y = 3286;

// the Big House, inside: a hall full of hounds, and the Farmer's study at the back
REGIONS.house = { x0: 1700, y0: 3060, x1: 3000, y1: 3940, ix0: 1800, iy0: 3200, ix1: 2900, iy1: 3800 };
const HOUSE = { x0: 1800, y0: 3200, x1: 2900, y1: 3800, wallY: 3460, door: 2350, sd: [2318, 2382] };
for (const r of [[1780, 3180, 2920, 3200], [1780, 3180, 1800, 3820], [2900, 3180, 2920, 3820], [1780, 3800, 2920, 3820],
  [1800, HOUSE.wallY, HOUSE.sd[0], HOUSE.wallY + 14], [HOUSE.sd[1], HOUSE.wallY, 2900, HOUSE.wallY + 14]]) {
  chOnly(solid(r[0], r[1], r[2], r[3], 'wall', true), CH3);
}
const FDESK = { x0: 2270, y0: 3304, x1: 2430, y1: 3332 };
chOnly(solid(FDESK.x0, FDESK.y0, FDESK.x1, FDESK.y1, 'prop'), CH3);
const GBOX = { x0: 2690, y0: 3236, x1: 2790, y1: 3262 };
chOnly(solid(GBOX.x0, GBOX.y0, GBOX.x1, GBOX.y1, 'prop'), CH3);
const HATRACK = { x: 2470, y: 3500 };
chOnly(solid(HATRACK.x - 6, HATRACK.y - 6, HATRACK.x + 6, HATRACK.y, 'prop'), CH3);

PORTALS.push(
  { id: 'hillRoad', ch: CH3, region: 'ranch', x: 604, y: 1246, r: 40, to: 'hillDown', label: 'Walk up the hill road', labelTruth: 'Climb to the Big House', arrive: [604, 1206] },
  { id: 'hillDown', ch: CH3, region: 'hill', x: 750, y: 3900, r: 40, to: 'hillRoad', label: 'Walk back down the hill', labelTruth: 'Back down to the ranch', arrive: [750, 3846] },
  { id: 'bigDoor', ch: CH3, region: 'hill', x: BIGH.door, y: 3280, r: 34, to: 'bigDoorIn', label: 'Knock on the door', labelTruth: 'Try the door', arrive: [BIGH.door, 3314], locked: () => !G.flags.march },
  { id: 'bigDoorIn', ch: CH3, region: 'house', x: HOUSE.door, y: 3786, r: 36, to: 'bigDoor', label: 'Leave the Big House', labelTruth: 'Get out of here', arrive: [HOUSE.door, 3758] },
);

SCARECROWS.forEach(([x, y, dir], i) => {
  WOLF_DEFS.push({ id: 'scare' + i, name: 'A scarecrow', type: 'scarecrow', ch: CH3, x, y, behavior: 'sweep', base: dir, amp: i < 2 ? 0.95 : 0.55, freq: 0.42 + i * 0.06, range: i < 2 ? 250 : 270, half: 0.36, dir });
});
WOLF_DEFS.push(
  { id: 'lamp', name: 'The searchlight', type: 'flood', ch: CH3, x: LAMP.x, y: LAMP.y, behavior: 'spin', spin: 0.5, range: 420, half: 0.15, sense: 'beam', dir: -Math.PI / 2 },
  { id: 'duke', name: 'Duke', type: 'hound', ch: CH3, x: 180, y: 3800, behavior: 'patrol', path: [[180, 3800], [630, 3800], [630, 3670], [180, 3670]], sense: 'sniff', range: 92, half: Math.PI, speed: 40, dir: 0 },
  { id: 'duchess', name: 'Duchess', type: 'hound', ch: CH3, x: 1320, y: 3670, behavior: 'patrol', path: [[1320, 3670], [870, 3670], [870, 3800], [1320, 3800]], sense: 'sniff', range: 92, half: Math.PI, speed: 40, dir: Math.PI },
  // inside the Big House
  { id: 'earl', name: 'Earl', type: 'hound', ch: CH3, x: 1880, y: 3560, behavior: 'patrol', path: [[1880, 3560], [2250, 3560], [2250, 3720], [1880, 3720]], sense: 'sniff', range: 88, half: Math.PI, speed: 36, dir: 0 },
  { id: 'baron', name: 'Baron', type: 'hound', ch: CH3, x: 2820, y: 3720, behavior: 'patrol', path: [[2820, 3720], [2450, 3720], [2450, 3560], [2820, 3560]], sense: 'sniff', range: 88, half: Math.PI, speed: 36, dir: Math.PI },
  { id: 'butler3', name: 'The Chairman', type: 'pig', role: 'butler', ch: CH3, x: 2170, y: 3530, behavior: 'patrol', path: [[2170, 3530], [2530, 3530]], sense: 'sniff', range: 78, half: Math.PI, speed: 24, dir: 0 },
  { id: 'farmer', name: 'The Farmer', type: 'farmer', ch: CH3, x: 2350, y: 3290, behavior: 'sit', range: 0, half: 0, dir: -Math.PI / 2 },
);

// your friends. Wolves, pigs: fine, they get it now. But the Farmer? The Farmer has always looked after them.
const LINES3 = {
  barbara: {
    pron: 'her', win: 'kitchen',
    intro: "Hon! The Farmer sent a NOTE. 'Farmer's Own Clover Crunch. Now with real clover.' Finally, somebody up there who cares!",
    prompt: "What is it, hon? I'm savoring.",
    ask: 'Have you ever actually seen the Farmer?',
    reply: "Well, no, hon. Nobody has. But you can tell from the cereal he's a lovely man. Look at this box. Real clover!",
    hint: 'Hint: Barbara will believe it when she sees it. Take her up the hill to the kitchen window.',
    told: "I'll believe it when I see it, hon. And I don't see it.",
    follow: "Up the hill? To the Farmer's? Well, I'd love to thank him for the cereal. Lead the way, hon.",
    yes: "Clover Crunch. New Clover Crunch. Farmer's Own. Same sawdust, hon. Different box. EVERY TIME. He's been feeding us the same fence for nine years!",
    farmer: 'Farmer? Hon, he sent me a NOTE. Handwritten. Well, typed. Lovely font.',
    done: 'I have thrown out all three boxes, hon. I am eating GRASS now. Real grass. It tastes like grass!',
  },
  doug: {
    pron: 'him', win: 'radio',
    intro: "No more North. No more South. No more Pig Party. I listen to ONE station now: A Message From The Farmer. He's the only one making sense.",
    prompt: "Make it quick. The Farmer's on at noon.",
    ask: 'Where does the Farmer broadcast from?',
    reply: "From the Big House, obviously. Nobody's seen the studio. Nobody needs to. He agrees with me about EVERYTHING.",
    hint: "Hint: Doug only trusts what he hears. Take him up the hill to the radio room window.",
    told: "Tapes? Sure, buddy. And I bet he does the voices, too. I'll believe it when I see it.",
    follow: "You want to see where the Farmer broadcasts? ...Fine. But if he's in there, I'm asking for an autograph.",
    yes: "NORTH IS RIGHT. SOUTH IS RIGHT. THE PIGS ARE JUST PIGS. One microphone! I've been agreeing with a TAPE RECORDER for nine years!",
    farmer: "The FARMER? He's the only sane voice on this farm. Says so himself. Every day at noon.",
    done: "I smashed my radio. Now I talk to actual sheep. They disagree with me. It's GREAT.",
  },
  nana: {
    pron: 'her', win: 'records',
    intro: "Hello, dear. The Farmer is throwing a Harvest Festival! Everyone is invited. He even remembered my name. He remembers everyone's name.",
    prompt: 'What is it, dear?',
    ask: 'How does the Farmer know everyone by name?',
    reply: "He keeps lovely records, dear. A card for every sheep. Gerald saw the cabinets once, through a window. He says there's a lot of paperwork for a party.",
    hint: 'Hint: Nana wants to see the records for herself. Take her up the hill to the records room window.',
    told: "A filing cabinet? Dear, everybody has a filing cabinet. I'll believe it when I see it.",
    follow: "Up to the Big House? At my age? ...Oh, all right. I've always wanted to see the curtains.",
    yes: "'Nana Fleece. Sunny Acres: postponed. Reschedule: Harvest Festival.' Oh, dear. I know what gets harvested. I am the HARVEST.",
    farmer: "The Farmer, dear? He sent me a birthday card. I've never told anyone my birthday.",
    done: "I've declined the Harvest Festival, dear. Gerald and I are having our own. Nobody gets harvested.",
  },
  ewenice: {
    pron: 'her', win: 'workshop',
    intro: "Bless you, child! The pastor is napping mid-sermon, and the Farmer sends a new hymn every Sunday. 'He Watches Over Us.' Such a comfort.",
    prompt: 'Yes, child?',
    ask: 'Who gave you the idea that the pastor was a wolf?',
    reply: "Why, YOU did, child! With your glasses. A gift from above, I always say. Wherever did you find them?",
    hint: 'Hint: Sister Ewenice calls your glasses a gift from above. Take her up the hill to the workshop window.',
    told: "A workshop? Child, the Lord works in mysterious ways. I'll believe it when I see it.",
    follow: "Up the hill, child? To the Farmer's own house? ...Very well. I'll bring a hymnal. Just in case.",
    yes: "Glasses. Rows of them. 'One pair per generation. Leave in the mud by the east fence.' Child... he MADE your glasses. He left them for you to find. Then who has been leading whom?",
    farmer: "The Farmer, child? He watches over us. It's right there in the hymn.",
    done: 'I have a new hymn, child. It has no words yet. We will write them together.',
  },
};
const KEVIN3 = {
  intro: "The Farmer? Never seen him, man. NOBODY has. That's how you know. Also the moon is a Farmer. Possibly a combine harvester.",
  join: "FINALLY. I'll tell everybody. Starting with the combine harvester thing.",
  done: ['The Farmer has never been seen. Have YOU ever been seen? Think about it.', "I've been awake since before it was cool. Three times now.", 'The scarecrows are wearing cameras. I saw one blink.'],
};
const FLOCK3_LINES = [
  "The Farmer will sort out those pigs. He's always looked after us.",
  "Nobody's ever seen the Farmer. That's how you know he's busy.",
  'Harvest Festival soon! I hope I get picked!',
  "The wolves are napping and the pigs moved up the hill. That's the Farmer's doing, that is.",
  "Farmer's Own Clover Crunch! Now with real clover!",
  'I wrote the Farmer a letter about the fence. He wrote back! He said relax.',
  'A Message From The Farmer said to relax. So I am relaxing. Very hard.',
  'No more wolves. No more pigs. Just the Farmer. Simple!',
];
const FLOCK3_SPECS = ['Glasses AGAIN? We woke up twice already. I am tired.', "Don't stare at the hill. It's rude.", "The Farmer doesn't like glasses. Or so I hear."];
const DOG3_LINES = ["The Farmer's hounds outrank me, sir. They have PEDIGREES.", "If you go up that hill, sir, mind Duke and Duchess. They don't bark. They just stare at you until you leave.", 'I sniffed the Farmer once, sir. He smelled like... sheep. Odd.'];
const LAMB3_LINE = "I saw the Farmer once! Through the window! He had FOUR legs! Nobody believes me because I'm a LAMB!";
const GERALD3_LINES = ["Sunny Acres is closed. The Farmer sent a card: 'Harvest Festival, all welcome.' I've learned to read the fine print.", "I peeked through a window of the Big House once. Filing cabinets. Nobody needs that many filing cabinets for a party."];

// talk balloons up the hill: hounds and pigs say one thing to the naked eye and another through the glasses
const HOUND_CHATTER = [['*sniff*', '*sniff* Property line.'], ['Hrrmf.', 'The Farmer says no visitors.'], ['*snore*', 'Not asleep. Watching.']];
const PIG3_CHATTER = [['Oink.', "We're house staff now. Don't tell the Board."], ['*snort*', 'Dust the portraits. Twice.'], ['Oink oink.', 'Nobody tells the Farmer anything. He already knows.']];
const MARCH_LINES = ['WE SAW THE WINDOWS!', 'COME OUT, FARMER!', 'SHOW YOURSELF!', 'WHO MADE THE GLASSES?!', 'SAME SAWDUST!', 'NO MORE HARVEST!', 'OPEN THE CURTAINS!'];
const REVEAL3_LINES = ["He's a SHEEP!", 'Just a sheep!', 'In OVERALLS!', 'Then who runs the farm?', 'Nobody?', 'NOBODY!', 'Baa!'];

// what the signs say in chapter 3: [no glasses, glasses], keyed by the chapter 1 wording
const CH3_SIGNS = {
  'GRAZE HAPPY!': ['THE FARMER CARES', 'THE FARMER COUNTS'],
  'YOUR SHEPHERDS LOVE YOU': ['THE WOLVES ARE NAPPING', 'THE WOLVES ARE ON RETAINER'],
  '100% FREE RANGE!': ['FREE RANGE! ASK THE FARMER', 'RANGE: WHATEVER HE SAYS'],
  'FREE LOLLIPOPS!': ['CLINIC: CLOSED FOR NAPS', 'CLINIC: REOPENS NEXT CYCLE'],
  'DANGER! WOLVES OUT THERE!': ['THE PIGS ARE GONE!', 'THE PIGS WORK UP THE HILL'],
  'HEATED POOL! JUMP IN!': ['POOL CLOSED', 'POOL: RESERVED FOR THE HARVEST'],
  'TODAY: AQUA AEROBICS': ['HARVEST FESTIVAL SOON!', 'GUESS WHAT GETS HARVESTED'],
  'NORTH PASTURE': ['NORTH PASTURE', 'ONE PASTURE'],
  'SOUTH PASTURE': ['SOUTH PASTURE', 'ONE PASTURE'],
  'KEEP TO YOUR SIDE': ['ONE FARM, ONE FARMER', 'ONE FARMER, MANY FENCES'],
  'GIVE AND YE SHALL RECEIVE': ['A HYMN FROM THE FARMER', 'THE FARMER WRITES THESE TOO'],
  'EVERY VOTE COUNTS!': ['THE FARMER KNOWS BEST', 'THE FARMER KNOWS YOU'],
  'FREE SUGAR LICKS': ["FARMER'S OWN SUGAR LICKS", 'STILL FAT, DUMB & HAPPY'],
  'CLOVER CRUNCH': ["FARMER'S OWN CRUNCH", 'SAME SAWDUST, NEW BOX'],
  'GREENER PASTURES RANCH': ["THE FARMER'S PASTURES", 'IT WAS ALWAYS HIS'],
  'SUNNY ACRES: HEATED POOL!': ['SUNNY ACRES: CLOSED', 'SUNNY ACRES: PAUSED'],
  "RELAX. YOU'VE EARNED IT.": ['RELAX. THE FARMER IS HERE.', 'RELAX. HE IS WATCHING.'],
  'WELCOME TO SUNNY ACRES': ['CLOSED FOR THE FESTIVAL', 'REOPENS AFTER THE HARVEST'],
  'SPA & MASSAGE': ['FESTIVAL KITCHEN', 'FESTIVAL KITCHEN'],
  "SPA LINE: YOU'RE NEXT!": ['FESTIVAL LINE', 'HARVEST LINE'],
  'CHECK-IN': ['FESTIVAL RSVP', 'HARVEST LIST'],
  'CHAPEL OF THE GOOD SHEPHERD': ['CHAPEL OF THE GOOD FARMER', 'CHAPEL OF THE GOOD FARMER'],
  'SUNDAY: BLESSED ARE THE MEEK': ['SERVICE: PASTOR NAPPING', 'HYMNS BY THE FARMER'],
  'THE WOLVES ARE OUT THERE': ['THE FARMER WATCHES OVER US', 'THE FARMER WATCHES'],
  'SMILE!': ['SMILE!', 'SCARECROW CAM'],
};

{
  ACH.cried3 = ['The Sheep Who Cried Farmer', 'Yell "FARMER!" at a sheep'];
  ACH.peeper = ['Window Shopping', 'Look through all four windows of the Big House'];
  ACH.hat = ['New Shepherd', 'Take the hat'];
  ACH.nobody = ["Nobody's Farm", 'Finish Chapter 3 with the curtains open'];
}
const ACH_CH3 = new Set(['cried3', 'peeper', 'hat', 'nobody']);

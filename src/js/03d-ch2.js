/* ---------------- Chapter 2: Hogwash ----------------
   Three days after the stampede, the fence is back up "under new management". The wolves are back too, wearing
   badges, and through the glasses they have strings. The strings lead to the Farmhouse, where the pigs live.
   Without glasses the pigs are dumb, muddy farm pigs. With glasses they are masterminds in suits.
   Everything below only exists in chapter 2 (ch: 2). */
const CH2 = 2;
const chOnly = (b, ch) => { b.ch = ch; return b; };

// the Farmhouse, built out by the east fence, where the glasses used to be
const FARMX = { x0: 1262, y0: 342, x1: 1462, y1: 440, door: 1362 };
chOnly(solid(FARMX.x0, FARMX.y0, FARMX.x1, FARMX.y1, 'building', true), CH2);
const HOLE_IN = [1180, 800], HOLE_OUT = [1262, 800];

// inside the Farmhouse: its own walled region, far from everything else
REGIONS.farm = { x0: 1700, y0: 2100, x1: 3100, y1: 2900, ix0: 1780, iy0: 2222, ix1: 3020, iy1: 2838 };
const FARM = { x0: 1780, y0: 2222, x1: 3020, y1: 2838, wallY: 2600, door: 2400 };
const BOARD_DOOR = [2080, 2140], PUPPET_DOOR = [2700, 2760];
for (const r of [[1760, 2200, 3040, 2222], [1760, 2200, 1780, 2860], [3020, 2200, 3040, 2860], [1760, 2838, 3040, 2860],
  [1780, 2600, BOARD_DOOR[0], 2614], [BOARD_DOOR[1], 2600, PUPPET_DOOR[0], 2614], [PUPPET_DOOR[1], 2600, 3020, 2614], [2400, 2222, 2414, 2600]]) {
  chOnly(solid(r[0], r[1], r[2], r[3], 'wall', true), CH2);
}
const BOARD_TABLE = { x0: 1900, y0: 2392, x1: 2260, y1: 2436 };
chOnly(solid(BOARD_TABLE.x0, BOARD_TABLE.y0, BOARD_TABLE.x1, BOARD_TABLE.y1, 'prop'), CH2);
const LEDGER_CAB = { x0: 1796, y0: 2232, x1: 1862, y1: 2262 };
chOnly(solid(LEDGER_CAB.x0, LEDGER_CAB.y0, LEDGER_CAB.x1, LEDGER_CAB.y1, 'prop'), CH2);
const RACK2 = { x0: 2520, x1: 2980, y: 2262, cx: 2750 };
chOnly(solid(RACK2.x0, 2222, RACK2.x1, RACK2.y, 'prop'), CH2);
const PHOTO_TABLE = { x0: 2930, y0: 2470, x1: 3006, y1: 2500 };
chOnly(solid(PHOTO_TABLE.x0, PHOTO_TABLE.y0, PHOTO_TABLE.x1, PHOTO_TABLE.y1, 'prop'), CH2);
const GUARD_DESK = { x0: 2520, y0: 2740, x1: 2620, y1: 2770 };
chOnly(solid(GUARD_DESK.x0, GUARD_DESK.y0, GUARD_DESK.x1, GUARD_DESK.y1, 'prop'), CH2);

PORTALS.push(
  { id: 'farmDoor', ch: CH2, region: 'ranch', x: FARMX.door, y: 454, r: 32, to: 'farmIn', label: 'Visit the Farmhouse', labelTruth: 'Sneak into Pig HQ', arrive: [FARMX.door, 482] },
  { id: 'farmIn', ch: CH2, region: 'farm', x: FARM.door, y: 2822, r: 34, to: 'farmDoor', label: 'Leave the Farmhouse', labelTruth: 'Get out of here', arrive: [FARM.door, 2794] },
);

// crows on poles: the Bureau's eyes. They notice glasses and report you; they don't catch you themselves.
const CROWS = [[470, 372, 1.2], [1010, 560, 2.4], [292, 900, -0.6], [905, 816, 0.4], [1320, 650, 2.8], [180, 430, 0.2]];
CROWS.forEach(([x, y, dir], i) => {
  chOnly(solid(x - 3, y - 5, x + 3, y, 'prop'), CH2);
  WOLF_DEFS.push({ id: 'crow' + i, name: 'A crow', type: 'crow', ch: CH2, x, y, behavior: 'sweep', base: dir, amp: 1.25, freq: 0.75 + i * 0.07, range: 165, half: 0.3, dir });
});
WOLF_DEFS.push(
  // the Bureau: two pig agents who come out of the Farmhouse when a crow reports you
  { id: 'agentA', name: 'Agent Bacon', type: 'pig', role: 'agent', ch: CH2, x: FARMX.door - 14, y: 482, behavior: 'agent', sense: 'sniff', range: 100, half: Math.PI, speed: 92, dir: Math.PI / 2, inactive: true },
  { id: 'agentB', name: 'Agent Ham', type: 'pig', role: 'agent', ch: CH2, x: FARMX.door + 14, y: 482, behavior: 'agent', sense: 'sniff', range: 100, half: Math.PI, speed: 92, dir: Math.PI / 2, inactive: true },
  // the Board
  { id: 'chairman', name: 'The Chairman', type: 'pig', role: 'chairman', ch: CH2, x: 2302, y: 2416, behavior: 'sit', face: -1, sense: 'sniff', range: 104, half: Math.PI, dir: Math.PI },
  { id: 'exec1', name: 'A board member', type: 'pig', role: 'exec', ch: CH2, x: 1985, y: 2384, behavior: 'sit', face: 1, sense: 'sniff', range: 70, half: Math.PI, dir: 0 },
  { id: 'exec2', name: 'A board member', type: 'pig', role: 'exec', ch: CH2, x: 2105, y: 2384, behavior: 'sit', face: -1, sense: 'sniff', range: 70, half: Math.PI, dir: Math.PI },
  { id: 'exec3', name: 'A board member', type: 'pig', role: 'exec', ch: CH2, x: 2225, y: 2384, behavior: 'sit', face: -1, sense: 'sniff', range: 70, half: Math.PI, dir: Math.PI },
  { id: 'butler', name: 'The Butler', type: 'pig', role: 'butler', ch: CH2, x: 1850, y: 2508, behavior: 'patrol', path: [[1850, 2508], [2340, 2508]], sense: 'sniff', range: 82, half: Math.PI, speed: 38, dir: 0 },
  { id: 'operator', name: 'The Operator', type: 'pig', role: 'operator', ch: CH2, x: 2560, y: 2448, behavior: 'patrol', path: [[2560, 2448], [2960, 2448]], sense: 'sniff', range: 96, half: Math.PI, speed: 30, dir: 0 },
  // Farmhouse security, at the front door
  { id: 'guard', name: 'Officer Growlsby', type: 'guard', ch: CH2, x: 2476, y: 2790, behavior: 'sweep', base: -1.95, amp: 0.85, freq: 0.5, range: 250, half: 0.4, dir: -1.95 },
);
Object.assign(CAUGHT_LINES, { guard: 'Visiting hours are over. So is your visit. To the clinic.', crow0: 'CAW!' });

// what the glasses show is attached to whom: the rack in the Farmhouse has one control bar per puppet
const PUPPET_BARS = [
  { name: 'Shepherd Wolfgang', label: 'WOLFGANG', wolves: ['wolfgang'] },
  { name: 'Granny Gnasher', label: 'GRANNY', wolves: ['granny'] },
  { name: 'Dr. Fangsworth', label: 'DR. F', wolves: ['doc'] },
  { name: 'Rom & Rem', label: 'ROM & REM', wolves: ['romrem'] },
  { name: 'Pastor Fleecewell', label: 'PASTOR', wolves: ['pastor', 'usher'] },
  { name: 'Security', label: 'SECURITY', wolves: ['guard', 'howl', 'chef'] },
];

// where friends live in chapter 2 (everyone else stays where chapter 1 left them)
const CH2_HOMES = { ewenice: [1088, 982, 'ranch'], gerald: [430, 330, 'ranch'] };

// six proofs, each friend needs a specific pair
const PROOF_DEFS2 = [
  { id: 'holdings', x: 642, y: 742, name: 'Hog Holdings annual report', short: 'the Hog Holdings report', title: 'Hog Holdings: annual report',
    lines: [['Brand', 'New Clover Crunch'], ['Clover', '1% (up from 0%)'], ['Owner', 'Hog Holdings'], ['Chairman', 'A pig, in a tie']],
    note: 'Note to shareholders: the sheep think it is a new recipe. It is the same recipe.' },
  { id: 'paystub', x: 2630, y: 1348, name: "Wolfgang's paystub", short: "Wolfgang's paystub", title: 'Farm Security payroll',
    lines: [['Employee', 'Wolfgang'], ['Title', 'Security (Reformed)'], ['Paid by', 'The Farmhouse'], ['Bonus', 'Keep them scared of the other pasture']],
    note: 'Approved by the Board. (Trotter print.)' },
  { id: 'catering', x: 2850, y: 808, name: 'Gala catering order', short: 'the Gala catering order', title: 'Sunny Acres: Gala catering order',
    lines: [['Event', 'The Farmhouse Gala'], ['Guests', '12 pigs'], ['Main course', 'Stew, 312 servings'], ['Ingredients', 'Sourced locally']],
    note: 'Chef: tell the residents it is a dance.' },
  { id: 'sermon', x: 1074, y: 1806, name: 'Sermon draft from the Board', short: 'the sermon draft', title: 'Sermon draft',
    lines: [['From', 'The Board'], ['To', 'Pastor F.'], ['This week', "'The wolves are out THERE.'"], ['Next week', "'The pigs are just pigs.'"]],
    note: 'P.S. Stop unzipping during the hymns.' },
  { id: 'ledger', x: 1830, y: 2290, name: 'The Farmhouse ledger', short: 'the ledger', title: 'The Farmhouse ledger',
    lines: [['Clover Crunch profits', '9,000 wool'], ['Gala ingredients', '312 sheep'], ['Wolves on the payroll', '7'], ['Sheep who suspect', '1 (you)']],
    note: 'Every column adds up. Neat trotter handwriting.' },
  { id: 'strings', x: 2968, y: 2526, name: 'Polaroid of the puppet rack', short: 'the puppet rack photo', title: 'Polaroid: the puppet rack',
    lines: [['Wolfgang', 'strings'], ['Rom & Rem', 'strings (shared)'], ['Granny, Dr. F', 'strings'], ['Pastor Fleecewell', 'strings (retied)']],
    note: "Sticky note: 'Retie the pastor. He keeps unzipping.' The Board" },
];

// your woke friends. They woke up about the wolves. Pigs? Pigs are just pigs.
const LINES2 = {
  barbara: {
    pron: 'her', needs: ['holdings', 'ledger'],
    intro: "Hon! Three whole days off the Clover Crunch. I'm so awake I can hear colors. Nobody's pulling the wool over MY eyes again.",
    prompt: "What's on your mind, hon?",
    ask: 'Who owns the Clover Crunch factory now?',
    reply: "Nobody, hon! The wolves ran off. Now it's 'New Clover Crunch, by Hog Holdings.' Hogs! Bless them. They can't even hold a spoon.",
    hint: "Hint: Barbara has never heard of Hog Holdings. Look around Granny's snack bar.",
    half: { holdings: 'Hog Holdings is... pigs? Owning a cereal company? Hon, pigs can\'t COUNT. Somebody is using those poor pigs.',
      ledger: "That's a lot of numbers, hon. In trotter. But what does it have to do with MY breakfast?" },
    hint2: { holdings: 'Hint: Barbara doesn\'t think pigs can count. Somebody at the Farmhouse keeps the books.',
      ledger: "Hint: Barbara needs to see what the ledger has to do with her breakfast. Look around Granny's snack bar." },
    yes: 'Clover Crunch profits, in neat little columns, signed with a curly tail. The pigs can COUNT, hon. They have been counting US.',
    no: "That's not about breakfast, hon.",
    pigs: 'Pigs? Hon, the pigs are napping in the mud. Look at them. Bless.',
    done: "I'm watching the pigs now, hon. All of them. Especially the ones in the mud.",
  },
  doug: {
    pron: 'him', needs: ['paystub', 'strings'],
    intro: "No more North! No more South! I'm a FREE THINKER now. Just like the Farmhouse told me to be.",
    prompt: "Make it quick. I'm busy thinking freely.",
    ask: "Who's paying Farm Security?",
    reply: "Nobody PAYS them. They're reformed! Wolfgang said so. He's got a badge and everything. He still has an office out back, next to Rem's.",
    hint: 'Hint: Doug thinks nobody pays the wolves. Wolfgang still has a desk at Rem HQ, through the barn doors.',
    half: { paystub: 'Okay, so somebody pays Wolfgang. Big deal. Pigs pulling strings? Pigs can barely pull a wagon.',
      strings: "A rack full of strings? That's a laundry room, buddy. And who would even PAY for all those strings?" },
    hint2: { paystub: "Hint: Doug doesn't think pigs could pull anybody's strings. Look for the strings at the Farmhouse.",
      strings: "Hint: Doug wants to know who's paying. Wolfgang still has a desk at Rem HQ." },
    yes: 'Wolfgang, Rom AND Rem, all on one rack, paid by one Farmhouse. I voted for a PUPPET. Twice. In two different pastures!',
    no: 'Fake news. Pig-free fake news.',
    pigs: 'PIGS? Now you sound like Kevin.',
    done: "I'm starting a new party. The No Strings Party. Members so far: me.",
  },
  nana: {
    pron: 'her', needs: ['catering', 'ledger'],
    intro: "Hello, dear. Sunny Acres is under new management! No more stew. Now there's a Gala, with a buffet. And I'm on the list!",
    prompt: 'What is it, dear?',
    ask: "Who's throwing the Gala?",
    reply: 'The Farmhouse, dear. The pigs! Bless them, they do love a buffet. Gerald says the kitchen has never been busier.',
    hint: 'Hint: Nana is on the Gala list. Find out what Sunny Acres is cooking. The front desk keeps the orders.',
    half: { catering: '312 servings of stew, for the pigs? Oh, dear. But pigs could never plan a party that big. They can\'t even read a menu.',
      ledger: "A ledger? I'm sure the pigs keep lovely books, dear. What has that got to do with the Gala?" },
    hint2: { catering: "Hint: Nana doesn't think pigs can plan. Somebody at the Farmhouse keeps the books.",
      ledger: 'Hint: Nana wants to know what the Gala is serving. The Sunny Acres front desk keeps the orders.' },
    yes: "'Gala ingredients: 312 sheep.' Sourced locally... Dear. WE'RE the buffet. I'm not on the guest list. I'm on the MENU.",
    no: "That's lovely, dear, but it's not about the Gala.",
    pigs: "Pigs, dear? They're having a party. Let them have their party.",
    done: "I've RSVP'd to the Gala. The answer is no.",
  },
  ewenice: {
    pron: 'her', needs: ['sermon', 'strings'],
    intro: 'Bless you, child! Our outdoor congregation is growing. Pastor Fleecewell still preaches to his pews. Attendance is mandatory now, the poor dears.',
    prompt: 'Yes, child?',
    ask: "Who writes the pastor's sermons?",
    reply: 'He does, child. Wolves can write. Badly, but they can. He keeps his drafts in his study at the chapel.',
    hint: "Hint: Sister Ewenice thinks the pastor writes his own sermons. His drafts are in his study.",
    half: { sermon: "'From: The Board'? A board of PIGS? Child, pigs can't write sermons. They can barely spell 'oink.' Somebody is putting words in their snouts.",
      strings: 'A rack of strings with names on it? Looks like Sunday laundry, child. Where would a pig learn to tie a knot?' },
    hint2: { sermon: 'Hint: Sister Ewenice thinks someone else is pulling the strings. Find the strings at the Farmhouse.',
      strings: "Hint: Sister Ewenice wants proof the pigs give the orders. The pastor keeps his drafts in his study." },
    yes: "The pastor, hanging on a rack like Sunday laundry. 'Retie the pastor.' A puppet, with a puppet's sermons. Lord, give me strength. And scissors.",
    no: 'Child, that is not scripture.',
    pigs: 'Pigs? Child, the Good Book has nothing against pigs. Well. Some of it does.',
    done: 'Pass the scissors, child. We have strings to cut.',
  },
};
const KEVIN2 = {
  intro: 'PIGS. I knew it. I KNEW it. Also the moon is a pig. Possibly a ham.',
  join: 'FINALLY. I will tell everybody. Starting with the moon thing.',
  done: ["The moon is a ham, man. Look at it.", "I've been awake since before it was cool. Twice now.", 'The crows are wearing wires. I saw one adjust its earpiece.'],
};
const FLOCK2_LINES = [
  'The wolves are Farm Security now. Reformed! They have badges.',
  'Free at last! It says so on every sign.',
  'Pigs? Running things? Ha! Pigs roll in mud.',
  'Have you tried New Clover Crunch? Now with clover!',
  "The fence is back, but it's OUR fence now. The sign says so.",
  "I don't trust wolves anymore. I trust the Farmhouse. Big difference.",
  'Mandatory chapel is actually very relaxing.',
  'Sunny Acres is having a Gala! I hope I get invited.',
];
const FLOCK2_SPECS = ['Glasses again? We already woke up. How awake do you need to be?', 'Are you staring at the pigs? They are just pigs.', 'Careful with those. The crows have been watching you.'];
const DOG2_LINES = ["They replaced me with CROWS, sir. Crows! They don't even fetch.", 'If a shepherd spots you, I bark. Squirrel trick. Still works.', 'Permission to bite a pig, sir? ...Still no? Understood.'];
const LAMB2_LINE = "The pigs wear SUITS at night! I saw them! Nobody believes me because I'm a LAMB!";
const GERALD2_LINES = ["Sunny Acres sent me a Gala invitation. 'Dress code: marinated.' I'm not going.", 'They keep asking if I would like to come back for a spa day. Twice a day.'];

// talk balloons: pigs and crows say one thing to the naked eye and another through the glasses
const BOARD_CHATTER = [['Oink.', 'Motion to raise the fence.'], ['Oink oink.', 'Seconded.'], ['*snort*', 'Clover Crunch is up nine percent.'], ['Oink?', 'Gala catering is on schedule.'], ['*chew chew*', 'Who let the dog go?'], ['Oink!', 'More truffles.']];
const CHAIR_CHATTER = [['OINK.', 'The sheep are restless. Raise the fence. Lower the lights.'], ['*snort*', 'Remind the wolves who signs their checks.'], ['Oink oink.', 'Seat the dog at the Gala. As a centerpiece.']];
const AGENT_OUT = [['Oink.', 'Bureau business.'], ['*snort*', 'Nothing to see here.'], ['Oink oink.', 'We have the paperwork.']];
const AGENT_SNIFF = [['*sniff sniff*', '*sniff* Smells like glasses.'], ['Oink?', 'Come out, come out. Retirement is lovely.'], ['*snort*', 'Somebody is retiring today.']];
const RETIRE_LINES = ["Paperwork says you're retiring. Voluntarily.", 'Congratulations on your retirement. You signed this morning.', 'All in order. See? Your hoof print. Well. A trotter print. Close enough.'];
const CROW_REPORT = ['CAW! CAW!', 'Sheep in glasses! Reporting!'];
const PROTEST_LINES = ['WE SAW THE LEDGER!', 'PIGS CAN COUNT!', 'NO MORE STRINGS!', "WHO'S THE GALA FOR?!", 'PUPPETS OUT!', 'OINK THIS!'];
const PORCH_SPEECH = [['OINK OINK. OINK.', 'Fellow animals! Freedom has never been freer!'], ['*snort*', 'Disperse! The Gala is invitation only!'], ['Oink?', 'These are not the pigs you are looking for.'], ['OINK!', 'Have you tried New Clover Crunch?']];

// what the signs say in chapter 2: [no glasses, glasses], keyed by the chapter 1 wording
const CH2_SIGNS = {
  'GRAZE HAPPY!': ['FREE AT LAST!', 'FREE AT LAST (TERMS APPLY)'],
  'YOUR SHEPHERDS LOVE YOU': ['FARM SECURITY: HERE FOR YOU', 'FARM SECURITY: ON A STRING'],
  '100% FREE RANGE!': ['UNDER NEW MANAGEMENT', 'SAME FENCE. NEW PIGS.'],
  'FREE LOLLIPOPS!': ['CLINIC: NOW PIG-APPROVED', 'CLINIC: NOW PIG-OWNED'],
  'DANGER! WOLVES OUT THERE!': ['THE WOLVES WORK FOR US NOW', 'THE WOLVES ALWAYS DID'],
  'HEATED POOL! JUMP IN!': ['GALA CATERING IN PROGRESS', 'SOUP OF THE DAY: STILL YOU'],
  'TODAY: AQUA AEROBICS': ['FARM TO TABLE!', 'YOU ARE THE FARM'],
  'NORTH PASTURE': ['NORTH PASTURE', 'PIG PASTURE'],
  'SOUTH PASTURE': ['SOUTH PASTURE', 'PIG PASTURE'],
  'KEEP TO YOUR SIDE': ['VOTE PIG-APPROVED', 'EITHER WAY, THE PIGS EAT'],
  'GIVE AND YE SHALL RECEIVE': ['ATTENDANCE IS MANDATORY', 'ATTENDANCE IS MONITORED'],
  'EVERY VOTE COUNTS!': ['NEW! PIG-APPROVED CANDIDATES', 'SAME PUPPETS, NEW STRINGS'],
  'FREE SUGAR LICKS': ['NEW! ORGANIC SUGAR LICKS', 'STILL FAT, DUMB & HAPPY'],
  'CLOVER CRUNCH': ['NEW CLOVER CRUNCH', 'NOW 1% CLOVER'],
  'GREENER PASTURES RANCH': ['UNDER NEW MANAGEMENT', 'PROPERTY OF HOG HOLDINGS'],
  'SUNNY ACRES: HEATED POOL!': ['SUNNY ACRES: GALA TONIGHT', 'YOU ARE THE GALA'],
  "RELAX. YOU'VE EARNED IT.": ['RELAX. THE PIGS INSIST.', 'RELAX. TENDER IS TASTIER.'],
  'WELCOME TO SUNNY ACRES': ['UNDER NEW MANAGEMENT', 'NOBODY CHECKS OUT'],
  'SPA & MASSAGE': ['GALA KITCHEN', 'GALA KITCHEN'],
  "SPA LINE: YOU'RE NEXT!": ['GALA GUEST LINE', 'GALA MENU LINE'],
  'CHECK-IN': ['GALA RSVP', 'GALA INGREDIENTS'],
  'CHAPEL OF THE GOOD SHEPHERD': ['CHAPEL OF THE GOOD SHEPHERD', 'CHAPEL OF THE BOARD'],
  'SUNDAY: BLESSED ARE THE MEEK': ['ATTENDANCE: MANDATORY', 'SERMONS BY THE BOARD'],
  'THE WOLVES ARE OUT THERE': ['TRUST THE FARMHOUSE', 'THE PIGS WRITE THESE'],
  'SMILE!': ['SMILE!', 'CAMERA'],
};

{
  ACH.cried2 = ['The Sheep Who Cried Pig', 'Yell "PIGS!" at a sheep'];
  ACH.unretired = ['Unretired', 'Get retired by the Bureau, then walk right back out'];
  ACH.strings = ['No Strings Attached', 'Chew through every string on the rack'];
  ACH.hogwash = ['Hogwash', 'Finish Chapter 2'];
}
const ACH_CH2 = new Set(['cried2', 'unretired', 'strings', 'hogwash']);

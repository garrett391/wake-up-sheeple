# Working notes: Wake Up Sheeple

These notes are for picking development back up in a new session. README.md has the player-facing summary.

## Links

- Live game (GitHub Pages): https://garrett391.github.io/wake-up-sheeple/
- Game artifact on claude.ai: https://claude.ai/artifact/TkgYBBRkdZg8JvFPkWXaMu (published from `wake-up-sheeple.html`, shared "anyone with the link")
- Design doc (Claude Docs): https://claude.ai/artifact/6yha8U1TeK2VFhVfD8kfPq

## Ship a change

1. Edit `src/page.html` or `src/js/*.js`.
2. `python3 build.py`. It writes `index.html` (Pages), `wake-up-sheeple.html` (artifact source) and `test/index.html` (tests).
3. Run the tests that touch what you changed (below). The only expected console error is a blocked Google Fonts request in sandboxes without internet.
4. Commit `src/` and `index.html` together, so Pages and the source never drift apart.
5. Republish the claude.ai artifact from `wake-up-sheeple.html` to the same URL, and update the design doc if the design changed.

## How the code is put together

- `build.py` concatenates `src/js/*.js` in filename order into one `'use strict'` IIFE and inlines it into `src/page.html`. Every file shares one scope, so later files extend earlier tables: `03b-regions.js` edits `SHEEP_DEFS` and `WOLF_DEFS`, `03c-church.js` adds the chapel, and `03d-ch2.js` adds Chapter 2.
- File prefixes: 01 core and palette, 02 audio (`SFX` dictionary in `02-audio.js`, synthesized bleats in `02a`), 03 world data, 04 and 05 drawing, 06 render pass, 07 state and per-frame logic (`newGame`, detection), 08 story (phases, objectives, dialogs; `08e-sugar.js` is Granny's sugar licks, `08f-studio.js` is the Bleat), 09 DOM and UI (HUD, endings, achievements), 10 boot and the debug API.
- Everything is drawn with Canvas 2D. There are no image or audio assets.
- Palettes: `PAL_SRC[key] = [candy, truth, real]`. The render pass sets `RT` (truth blend) and `RR` (real blend), and `P(key)` returns the blended color. `G.view` is 0 with the glasses off and 1 with them on; a wipe animates between them. In Chapter 2 the glasses-off view is "real", not candy (`offMode()`).
- World regions are separate rectangles in one big map, joined by portals: ranch (0..1500 × 0..1300), acres = Sunny Acres (1880..3120 × 0..1000), field = North/South Pasture (1880..2920 × 1040..1780), church (160..1340 × 1600..2320), farm = Farmhouse interior (1700..3100 × 2100..2900), studio = the Bleat's set (160..1240 × 2420..2990). `regionOf(x, y)` checks them.
- Phases: meadow → glasses → reveal → fleecing → herd → bigbaa → stampede, then an ending screen. Endings: win, counted (Ch1 bad), hogwash (Ch2 win), retired (Ch2 bad).
- Dialogs are node objects: `openDialog({ who, text, choices: [{ label, tag, run, leave }] })`. A `run` returns the next node or null. `G.afterDialog` runs once the dialog closes. Key sheep lines live in `LINES` (Ch1) and `LINES2` (Ch2).
- Saved progress is in localStorage key `wake-up-sheeple`: `ch2` (unlocked), `best` and `best2` (best times), and `ach` (achievement ids). Every read and write is wrapped in try/catch.

## Chapters

- `G.ch` is 1 or 2. `newGame({ ch, retry })` resets the world. Solids, statics, wolves and portals can carry `.ch` so they exist in one chapter only. `setupCh2()` wakes everyone, moves the friends to their Chapter 2 homes and makes Biscuit an ally.
- `WOKE_GOAL` and `PROOF_COUNT` are `let`s set per chapter: Ch1 needs 4 woke sheep out of 6 proofs; Ch2 needs 3 on the Pig-O-Meter out of 6 proofs, and each friend needs two specific proofs (`LINES2[id].needs`).
- Chapter 2 unlocks once `ch2Unlocked()` sees `store.ch2` or `store.best`, or the URL has `?chapter=2`.
- The title screen has Play, Chapters and How to play. Play (and Enter, and How to play's Play) picks up where you left off: `playNext()` starts the first open chapter without a best time, or Chapter 1 once everything is finished, and `refreshPlayButton()` labels the button with that chapter when it isn't Chapter 1. Chapters opens `#scr-chapters`, built by `openChapters()` from the `CHAPTERS` list in `09-ui.js`: one entry per chapter with `n`, `name`, `blurb`, `best` (its best-time store key) and `start()`. A chapter opens once the previous one has a best time (Chapter 2 also via `ch2Unlocked()`); until then its card says "Locked" with no name or blurb, so the list never spoils a twist. An entry without `start()` shows "Coming soon" (Chapter 3, The Farmer, once Chapter 2 is finished). The end screen's next-chapter button comes from the same list. To add a chapter: add its entry, give it a start function and a `bestN` key in `endGame`.

## Sugar licks (08e-sugar.js, Chapter 1 only)

The wolves fight back. `wakeSheep` calls `queueLick()`, so the 1st and 3rd wake-ups each earn one lick (flags `lickAt1`, `lickAt3`). `G.lickCd` only counts down while the player is in the ranch and the screen is quiet (`screenQuiet()`: no dialog, banner or toast), so the first lick lands about 9 to 10 s after the wake-up, once the wake-up toasts clear; later licks are at least 22 s apart. Then `dropLick()` picks an awake key sheep in the ranch (Barbara, Doug, Nana or Shirley) and puts the lick 170 to 220 px away. The spot must be clear of solids, have a clear straight path, and not sit behind a sign or building (`lickHidden`). Granny's bubble swaps with the glasses.

The first lick of a run gets a paused intro (`lickIntro`): `G.modal = 'lickcut'` freezes play while the camera pans to frame the lick and the sheep for 1.3 s (`updateLickCut`, called from `updatePlay`), then a two-step dialog explains it, and the countdown starts when it closes. Later licks only get a toast. On wake-up 1, "The wolves are nervous" is a toast, not a banner, so the screen stays clear for the intro.

The sheep waits 2.5 s, then walks over without collision, since the path was checked: 9 px/s for the first lick (about 20 s in all), 15 px/s after that (about 12 to 14 s). A ring on the ground and a pink edge arrow show the countdown. Kick it over (`interact` kind `lick`; E, or the touch button reads Kick) and the sheep stays awake. If the sheep gets there, `sugarCrash()` puts it back to sleep with `s.relapsed`, Woke -1. Its dialog then offers "Remind her what she saw", which wakes it with one choice and doesn't add to the "You woke" stat. The finale (`startHerd`) and `endGame` clear a live lick. Kicking both licks in one run unlocks Sugar-Free.

## The Bleat (08f-studio.js, Chapter 1 only)

Bellwether's TV studio. The building sits in the southwest pasture (`STUDIO`, door at x 171, y 1008); its portal leads into a separate set like the chapel's. `G.studio` cycles while the player is inside: ON AIR (7 s the first time, then 9 to 12 s), a 2 s wrap ("We'll be right back"), then a 6 s commercial break. `studioLive()` is true on air and during the wrap. The two cameras (`camA`, `camB`, sense `camera`) catch anything that moves while live; the producer wolf patrols the back with an ordinary cone, and when a camera catches you the producer speaks in the caught dialog. On air, Bellwether only whispers (`ONAIR_TALK`); talk to him on the break. The cue cards (`cuecards`) sit by the back door. Waking him counts 1 like anyone else, switches the broadcast off for good, rings his bell, unlocks Ringleader, and walks him around the desk and out to the ranch (`studioExit`). If the finale starts while he's still inside, `studioHerd()` brings him out. The wake-up warning banner waits until you're back in the ranch (`G.heatLater`) so the set isn't flooded. In Chapter 2 the crew is gone and Bellwether stands by the door outside.

## Detection senses (07-logic.js)

| Sense | Who | Exposed when | Hide by |
| --- | --- | --- | --- |
| camera | the Bleat's two cameras, only while ON AIR | moving | stand still |
| cone | shepherds, Biscuit, crows, the Ch2 guard, the producer | glasses on and not grazing | glasses off or graze |
| beam | Nurse Howl's searchlight | anywhere in the beam | stay out of it |
| sniff | Chef Gnaw, every pig | moving within range | freeze (graze) |
| pray | Pastor Fleecewell during prayer | head up in his line of sight | bow (graze) |

When alert fills: wolves call `caught()` (clinic, -1 Credibility). Crows call `crowReport()` instead, which sends the two pig agents to your spot (`dispatchAgents`), and then rest for 9 s. Pigs call `retire()` (a faked retirement to the Sunny Acres pen, -1 Credibility; Kevin frees you). At 0 Credibility the run ends.

## Tests

Run `python3 build.py` first. Each script prints its checks and any console errors.

- `smoke.py`: Chapter 1 start to finish on desktop and phone.
- `regions.py`: Sunny Acres, the Gerald rescue, the barn doors and Biscuit.
- `church.py`, `church_finale.py`: prayer stealth, Ewenice, the bell.
- `objective.py`: the collapsible objective card.
- `ch2.py`, `ch2_bureau.py`: Chapter 2 and the crow → agent → retirement loop.
- `chapters.py`: the Chapters screen: what is open, locked and coming soon, no spoilers, Esc and Back, starting a chapter, the end screen's next-chapter button, and phone width.
- `sugar.py`: Granny's sugar licks: drop, kick, eaten and re-woken, the second lick, Sugar-Free, the finale clearing a lick, none in Chapter 2, and the Kick button on a phone.
- `studio.py`: the Bleat: door in and out, the ON AIR cycle, cameras catch movement but not stillness and never on the break, Bellwether whispers on air, cue cards, Woke +1, his hint clearing, Ringleader, the walkout, the finale fetching him, Chapter 2, and a phone screenshot.
- `feel.py`: grazing hides you, keyboard talk and choices, pause, Main menu from pause, retry. `sizes.py`: title and How to play screenshots at several screen sizes. `bench.py`: frame times.
- `audio_check.py`, `bleat_render.js`, `bleat_analyze.py`: offline renders of the synthesized sounds.

Debug API with `?debug`: `window.__wus` exposes `state, tp, skipReveal, give, talk, choose, choices, beat, catchMe, setCred, bench, portal, interact, use, region, wolf, sheep, wear, ch2, convince, crow, retireMe, protest, chew, pig, talkDog, setZoom, church, setChurch, face, studio, setStudio, lick, dropLick, kick`.

Timing note: in headless runs, canvas work is flushed lazily, so per-call timings in `bench.py` can look slower than real frames. Use requestAnimationFrame frame deltas instead; the real median is about 16.7 ms in both chapters.

## Design decisions worth keeping

- Sister Ewenice walks out of the chapel alone. Her congregation only joins at the finale, when she rings the bell, and they don't count toward the goal. An earlier version had the whole congregation leave with her, which read as waking 7 sheep when the goal said 4.
- The "CIA fakes your death" idea became the Bureau faking your retirement. It keeps the paranoia, stays cartoonish, and ties into Sunny Acres.
- In Ch2 the pigs look like dumb farm pigs with the glasses off and like suited masterminds with them on. Their speech bubbles swap the same way ("Oink." becomes "Motion to raise the fence.").
- Sugar licks cost time, not progress: a sheep who eats one wakes again with a single "Remind her" choice. Only the key ranch sheep can be lured; Ewenice, Gerald, Kevin and Lambert never are, so the chapel walkout and the Sunny Acres rescue stay intact. The wake-up warning banners only show once each, even if a lick knocks the count back down.
- The Bleat is a separate interior behind a small building in the southwest corner instead of a wider map, so the ranch stays readable. Bellwether counts 1 like everyone else. An earlier build had him count 2 (his viewers woke too), but the jump on the meter read as confusing.
- A sheep's hint (`G.hint`, tagged with `G.hintFor`) clears once that sheep is awake.
- Tone: deadpan signs that change meaning through the glasses, sheep puns, and cartoon peril with no gore.
- Next story hook: the pigs answer to the Farmer in the Big House up the hill (Chapter 3).

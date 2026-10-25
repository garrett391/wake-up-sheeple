# Wake Up Sheeple

Sheep game version of They Live. *The grass isn't greener. It's painted.*

A satirical stealth-persuasion game for the browser. You're a sheep who finds a pair of glasses in the mud. Through them, the kindly shepherds are wolves. Find proof, wake the flock, and stampede the fence.

**Play it:** https://garrett391.github.io/wake-up-sheeple/

- **Chapter 1: Greener Pastures.** Sneak around the ranch, Sunny Acres, the North and South Pasture, and the chapel. Find the proof each sheep cares about, wake 4 of them, and lead the stampede with a Big Baa.
- **Chapter 2: Hogwash.** It unlocks once you beat Chapter 1. The wolves are back as "reformed" Farm Security, and through the glasses they have strings. The strings lead to the Farmhouse, where the pigs live. Your friends need two pieces of proof each, and the crows report you to the Bureau.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | WASD or arrow keys | Drag on the left side |
| Glasses on or off | Space | Glasses |
| Graze, bow or freeze (head down) | Hold Shift | Hold Graze |
| Talk | E | Talk |
| Baa | B | Baa |
| Show or hide the objective | O | Tap the objective |
| Pause / sound | Esc / M | |

## Build and test

The game is plain HTML, CSS and JavaScript: canvas graphics and Web Audio sound, with no libraries, images or audio files.

```sh
python3 build.py          # src/ -> index.html (GitHub Pages) + local test copies
```

Edit files in `src/`, then rebuild. `index.html` is generated, so don't edit it by hand.

The play-tests drive the game in headless Chromium with Playwright:

```sh
pip install playwright && playwright install chromium
python3 build.py
python3 test/smoke.py     # Chapter 1 start to finish, desktop and phone
python3 test/ch2.py       # Chapter 2 start to finish
```

Screenshots land in `shots/`, which is not committed.

URL options: `?chapter=2` unlocks Chapter 2 without beating Chapter 1; `?debug` adds a `window.__wus` test API.

## Layout

```
index.html        built game, served by GitHub Pages
build.py          builds index.html from src/
src/page.html     markup, styles and HUD; the scripts are inlined at /*GAME_JS*/
src/js/*.js       the game, concatenated in filename order
test/             Playwright play-tests and audio checks
CLAUDE.md         working notes for continuing development with Claude
```

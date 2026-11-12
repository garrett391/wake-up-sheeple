"""Chapter 3: The Farmer, end to end.
The intro and the reveal, a friend following you up the hill, the windows (glasses off and on), a hound catching you,
a friend seeing her window, the march, the Big House, the Farmer, both endings, the bad ending, and the post-credits line."""
import pathlib, sys
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1&chapter=3"
SHOTS = ROOT / "shots/ch3"
SHOTS.mkdir(parents=True, exist_ok=True)
errors = []
def st(pg): return pg.evaluate("__wus.state()")
def shot(pg, n): pg.screenshot(path=str(SHOTS / f"{n}.png"))
def text(pg): return pg.evaluate("document.getElementById('dlg-text').textContent")
def pick(pg, sub):
    labels = pg.evaluate("__wus.choices()")
    i = next(k for k, l in enumerate(labels) if sub in l); pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(160)
def close(pg, n=10):
    for _ in range(n):
        if st(pg)["modal"] != "dialog": return
        labels = pg.evaluate("__wus.choices()")
        i = next((k for k, l in enumerate(labels) if l.endswith('Leave')), 0)
        pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(140)
def tap(pg, touch, sel): (pg.tap if touch else pg.click)(sel)

def run(width, height, touch, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": width, "height": height}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
        pg = ctx.new_page()
        pg.on("console", lambda m: errors.append(f"[{tag}] {m.type}: {m.text}") if m.type in ("error", "warning") and "ERR_TUNNEL" not in m.text and "net::" not in m.text else None)
        pg.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))
        pg.goto(URL); pg.wait_for_timeout(800)
        ok = {}
        # 0. Chapters lists Chapter 3 as playable, and it starts with its intro
        tap(pg, touch, "#btn-chapters"); pg.wait_for_timeout(300)
        ok['listed'] = pg.is_enabled('.chapter[data-ch="3"]') and pg.text_content('.chapter[data-ch="3"] .name') == 'The Farmer'
        tap(pg, touch, '.chapter[data-ch="3"]'); pg.wait_for_timeout(1000)
        ok['intro'] = 'One week after the pigs ran' in text(pg)
        shot(pg, f"{tag}-01-intro"); close(pg)
        meter = pg.text_content("#woke-short" if touch else "#woke-long"); print(tag, "meter:", meter)
        ok['meter'] = meter in ('Eyewitnesses', 'Seen')
        # 1. the reveal: glasses on, look up the hill, back to the ranch
        pg.keyboard.press(" ") if not touch else tap(pg, touch, "#t-specs")
        pg.wait_for_timeout(2600); ok['reveal'] = st(pg)["cut"] == 'talk'; pg.evaluate("__wus.choose(0)")
        pg.wait_for_timeout(2900); shot(pg, f"{tag}-02-bighouse"); ok['pan'] = st(pg)["cut"] == 'talk2' and pg.evaluate("__wus.region()") == 'ranch'
        pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(250); pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(2300)
        ok['fleecing'] = st(pg)["phase"] == 'fleecing'
        shot(pg, f"{tag}-03-ranch-truth")
        pg.evaluate("__wus.wear(false)"); pg.wait_for_timeout(300); shot(pg, f"{tag}-04-ranch-real")
        # 2. ask Barbara, and she follows you
        pg.evaluate("__wus.tp(700, 870)"); pg.evaluate("__wus.talk('barbara')"); pg.wait_for_timeout(150)
        print(tag, "barbara:", pg.evaluate("__wus.choices()"))
        pick(pg, 'Ask a question'); pick(pg, 'Listen'); print(tag, "reply:", text(pg)[:60]); pick(pg, 'Go on')
        pick(pg, 'Come up the hill'); pick(pg, "Let's go"); pg.wait_for_timeout(200)
        ok['follows'] = pg.evaluate("__wus.sheep('barbara')")['follow']
        # 3. the hill road: she comes along through the portal
        # walk out through the open main gate to the road: no teleport, so a closed gate fails here
        pg.evaluate("__wus.tp(620, 960)"); pg.wait_for_timeout(200)
        pg.keyboard.down("ArrowDown"); pg.wait_for_timeout(1700); pg.keyboard.up("ArrowDown"); pg.wait_for_timeout(300)
        road = pg.evaluate("__wus.interact()"); print(tag, "road prompt:", road, st(pg)["py"])
        ok['walk_to_road'] = bool(road) and road['kind'] == 'portal' and 'hill' in road['label']
        pg.evaluate("__wus.portal('hillRoad')"); pg.wait_for_timeout(600)
        ok['hill'] = pg.evaluate("__wus.region()") == 'hill' and pg.evaluate("__wus.G.sheep.find(s => s.id === 'barbara').y") > 3000
        shot(pg, f"{tag}-05-hill-real")
        # 4. a window with the glasses off is just curtains; the door is locked
        pg.evaluate("__wus.G.invuln = 99"); pg.evaluate("__wus.tp(640, 3290)"); pg.wait_for_timeout(300)
        print(tag, "window prompt (off):", pg.evaluate("__wus.interact()"))
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(200)
        ok['curtains'] = st(pg)["modal"] is None and len(st(pg)["proof"]) == 0
        pg.evaluate("__wus.tp(750, 3290)"); pg.wait_for_timeout(200); pg.evaluate("__wus.use()"); pg.wait_for_timeout(300)
        ok['locked'] = pg.evaluate("__wus.region()") == 'hill' and pg.evaluate("__wus.door('bigDoor')")
        # 5. peek through the radio room window with the glasses on
        pg.evaluate("__wus.wear(true)"); pg.evaluate("__wus.tp(640, 3290)"); pg.wait_for_timeout(500)
        print(tag, "window prompt (on):", pg.evaluate("__wus.interact()"))
        shot(pg, f"{tag}-06-windows-truth")
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(300); shot(pg, f"{tag}-07-radio-doc")
        tap(pg, touch, "#doc-ok"); pg.wait_for_timeout(200)
        ok['peek'] = st(pg)["proof"] == ['radio']
        # 6. show Barbara her window: she sees, counts, and heads home
        pg.evaluate("__wus.tp(545, 3290)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.G.sheep.find(s => s.id === 'barbara').x = 560; __wus.G.sheep.find(s => s.id === 'barbara').y = 3330"); pg.wait_for_timeout(100)
        it = pg.evaluate("__wus.interact()"); print(tag, "barbara window:", it)
        ok['friend_prompt'] = it and 'Barbara' in it['label']
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(200); shot(pg, f"{tag}-08-barbara-window"); pick(pg, 'Continue')
        print(tag, "barbara sees:", text(pg)[:70]); close(pg); pg.wait_for_timeout(600)
        ok['seen'] = st(pg)["woke"] == 1 and set(st(pg)["proof"]) == {'radio', 'kitchen'}
        # 7. caught: a hound carries you down the hill, Credibility -1
        pg.evaluate("__wus.G.invuln = 0"); pg.evaluate("__wus.wear(false)")
        # walk past Duke in the open, right under his nose
        pg.evaluate("__wus.tp(680, 3800)"); pg.wait_for_timeout(100)
        pg.evaluate("(() => { const d = __wus.G.wolves.find(w => w.id === 'duke'); d.x = 640; d.y = 3740; d.pause = 9; d.wp = 0; })()")
        if not touch: pg.keyboard.down("ArrowUp"); pg.wait_for_timeout(1300); pg.keyboard.up("ArrowUp")
        else:
            for _ in range(13): pg.evaluate("__wus.G.player.vy = -170; __wus.G.player.walk = 1"); pg.wait_for_timeout(100)
        s = st(pg); print(tag, "after moving by Duke:", s["modal"], s["cred"])
        shot(pg, f"{tag}-09-caught"); close(pg); pg.wait_for_timeout(400)
        ok['caught'] = st(pg)["cred"] == 2 and pg.evaluate("__wus.region()") == 'ranch'
        # 8. two more eyewitnesses, then the march
        pg.evaluate("__wus.see('doug')"); pg.wait_for_timeout(300); pg.evaluate("__wus.see('nana')"); pg.wait_for_timeout(5000)
        ok['march'] = pg.evaluate("__wus.G.flags.march") and not pg.evaluate("__wus.door('bigDoor')")
        pg.evaluate("__wus.portal('hillRoad')"); pg.wait_for_timeout(5000)
        pg.evaluate("__wus.tp(750, 3560)"); pg.wait_for_timeout(600)
        print(tag, "crowd:", pg.evaluate("__wus.G.sheep.filter(s => s.protest).length"))
        ok['crowd'] = pg.evaluate("__wus.G.sheep.filter(s => s.protest).length") >= 8
        shot(pg, f"{tag}-10-march-real"); pg.evaluate("__wus.wear(true)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-11-march-truth")
        # 9. the Big House: hall and study
        pg.evaluate("__wus.tp(750, 3290)"); pg.wait_for_timeout(200); pg.evaluate("__wus.use()"); pg.wait_for_timeout(1300)
        ok['inside'] = pg.evaluate("__wus.region()") == 'house'
        pg.evaluate("__wus.G.invuln = 99"); pg.evaluate("__wus.tp(2350, 3600)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-12-hall-truth")
        pg.evaluate("__wus.wear(false)"); pg.wait_for_timeout(400); shot(pg, f"{tag}-13-hall-real")
        pg.evaluate("__wus.tp(2350, 3380)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-14-study-real")
        it = pg.evaluate("__wus.interact()"); print(tag, "farmer prompt:", it)
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(300); shot(pg, f"{tag}-15-farmer-human")
        pick(pg, 'Put the glasses on'); pg.wait_for_timeout(1800)
        print(tag, "farmer (glasses):", text(pg)[:50]); shot(pg, f"{tag}-16-farmer-sheep-dialog")
        for lbl in ['Continue', 'SHEEP', 'And then', 'The glasses', 'Continue']: pick(pg, lbl)
        labels = pg.evaluate("__wus.choices()"); print(tag, "choice:", labels)
        ok['choice'] = any('Take the hat' in l for l in labels) and any('Open the curtains' in l for l in labels)
        shot(pg, f"{tag}-17-choice")
        pick(pg, 'Open the curtains'); pick(pg, 'Open the curtains'); pg.wait_for_timeout(2600)
        print(tag, "porch:", st(pg)["phase"], pg.evaluate("__wus.farmer()"))
        ok['porch'] = st(pg)["phase"] == 'bigbaa' and pg.evaluate("__wus.farmer()")['region'] == 'hill'
        shot(pg, f"{tag}-18-bigbaa")
        for i in range(7): pg.evaluate("__wus.beat()"); pg.wait_for_timeout(420)
        pg.wait_for_timeout(1400); shot(pg, f"{tag}-19-just-a-sheep")
        pg.wait_for_timeout(2600); shot(pg, f"{tag}-20-fence-down")
        pg.wait_for_timeout(5000)
        s = st(pg); print(tag, "end:", s["mode"], pg.locator("#end-title").text_content(), "|", pg.locator("#ach-head").text_content())
        pg.wait_for_timeout(1200); shot(pg, f"{tag}-21-ending")
        ok['ending'] = s["mode"] == 'ending' and pg.locator("#end-title").text_content() == "Nobody's Farm"
        ok['postcredits'] = pg.is_visible('#end-post') and 'Lambert' in pg.text_content('#end-post')
        ok['best3'] = pg.evaluate("JSON.parse(localStorage.getItem('wake-up-sheeple')).best3 > 0")
        ok['no_next'] = pg.is_hidden('#btn-end-next')
        # 10. the other choice: take the hat
        tap(pg, touch, "#btn-again"); pg.wait_for_timeout(1000); close(pg)
        pg.evaluate("__wus.skipReveal(); __wus.march()"); pg.wait_for_timeout(300)
        pg.evaluate("__wus.G.invuln = 99; __wus.portal('bigDoor')"); pg.wait_for_timeout(300)
        pg.evaluate("__wus.wear(true); __wus.tp(2350, 3380)"); pg.wait_for_timeout(300); pg.evaluate("__wus.use()"); pg.wait_for_timeout(200)
        for lbl in ['Continue', 'SHEEP', 'And then', 'The glasses', 'Continue', 'Take the hat', 'Put on the hat']: pick(pg, lbl)
        pg.wait_for_timeout(2000)
        s = st(pg); print(tag, "hat end:", s["mode"], pg.locator("#end-title").text_content())
        pg.wait_for_timeout(1000); shot(pg, f"{tag}-22-new-shepherd")
        ok['hat_end'] = s["mode"] == 'ending' and pg.locator("#end-title").text_content() == 'New Shepherd' and pg.evaluate("__wus.G.ach.has('hat')")
        # 11. bad ending: lose all credibility
        tap(pg, touch, "#btn-again"); pg.wait_for_timeout(1000); close(pg)
        pg.evaluate("__wus.skipReveal(); __wus.setCred(1)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.talk('doug')"); pg.wait_for_timeout(150); pick(pg, 'FARMER'); close(pg); pg.wait_for_timeout(1200)
        s = st(pg); print(tag, "bad end:", s["mode"], pg.locator("#end-title").text_content())
        shot(pg, f"{tag}-23-farmhand")
        ok['bad_end'] = s["mode"] == 'ending' and pg.locator("#end-title").text_content() == 'Farmhand' and pg.is_hidden('#end-post')
        print(tag, ok)
        b.close()
        return all(ok.values())

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "desktop"
    res = []
    if which in ("desktop", "all"): res.append(run(1280, 800, False, "desk"))
    if which in ("phone", "all"): res.append(run(390, 844, True, "phone"))
    print("ERRORS:" if errors else "no console errors")
    for e in errors[:30]: print(e)
    print("PASS" if all(res) and not errors else "FAIL")
    sys.exit(0 if all(res) and not errors else 1)

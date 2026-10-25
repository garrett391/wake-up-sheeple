"""The chapel: enter, prayer bow mechanic, the study proof, Sister Ewenice, the walkout."""
import pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots/church"
errors = []
def st(pg): return pg.evaluate("__wus.state()")
def shot(pg, n): pg.screenshot(path=str(SHOTS / f"{n}.png"))
def close_dialogs(pg, n=6):
    for _ in range(n):
        if st(pg)["modal"] != "dialog": return
        pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(120)

def run(width, height, touch, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": width, "height": height}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
        pg = ctx.new_page()
        pg.on("console", lambda m: errors.append(f"[{tag}] console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))
        pg.goto(URL); pg.wait_for_timeout(900)
        if touch: pg.tap("#btn-play")
        else: pg.click("#btn-play")
        pg.wait_for_timeout(400)
        pg.evaluate("__wus.skipReveal()")
        # walk up to the chapel door: the interact prompt should be the portal
        pg.evaluate("__wus.tp(1040, 960)"); pg.wait_for_timeout(300)
        print(tag, "door prompt:", pg.evaluate("__wus.interact()"))
        shot(pg, f"{tag}-01-door")
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(1300)
        print(tag, "region:", pg.evaluate("__wus.region()"), st(pg))
        shot(pg, f"{tag}-02-inside-truth")
        pg.evaluate("__wus.wear(false)"); pg.wait_for_timeout(500)
        shot(pg, f"{tag}-03-inside-candy")
        # stand in the left aisle with glasses off, then a prayer: head up gets you noticed
        pg.evaluate("__wus.tp(340, 2040)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.setChurch('warn', 0)"); pg.wait_for_timeout(600)
        shot(pg, f"{tag}-04-warn")
        pg.evaluate("__wus.setChurch('pray', 0)"); pg.wait_for_timeout(500)
        print(tag, "pray (head up):", pg.evaluate("__wus.wolf('pastor')"), st(pg)["maxAlert"])
        shot(pg, f"{tag}-05-pray-headup")
        pg.wait_for_timeout(800)
        s = st(pg); print(tag, "after pray head up:", s)
        caught_by_prayer = s["modal"] == "dialog"
        close_dialogs(pg)
        pg.wait_for_timeout(600)
        # back in; this time bow
        pg.evaluate("__wus.portal('chapel')"); pg.wait_for_timeout(1500)
        pg.evaluate("__wus.tp(340, 2040)")
        if touch:
            box = pg.locator("#t-graze").bounding_box()
            print(tag, "graze label:", pg.locator("#t-graze").text_content())
            pg.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            pg.dispatch_event("#t-graze", "pointerdown")
        else:
            print(tag, "key label:", pg.locator("#k-graze").text_content())
            pg.keyboard.down("Shift")
        pg.evaluate("__wus.setChurch('pray', 0)"); pg.wait_for_timeout(1500)
        s = st(pg); print(tag, "bowed during prayer:", s, pg.evaluate("__wus.wolf('pastor')"))
        shot(pg, f"{tag}-06-pray-bowed")
        bowed_safe = s["modal"] is None
        pg.wait_for_timeout(3600)
        if touch: pg.dispatch_event("#t-graze", "pointerup")
        else: pg.keyboard.up("Shift")
        print(tag, "after amen:", pg.evaluate("__wus.church()"))
        # the study: grab the proof with the glasses on
        pg.evaluate("__wus.wear(true)")
        pg.evaluate("__wus.tp(1178, 1900)"); pg.wait_for_timeout(300)
        shot(pg, f"{tag}-07-study-door")
        pg.evaluate("__wus.tp(1090, 1812)"); pg.wait_for_timeout(500)
        print(tag, "proof:", st(pg))
        shot(pg, f"{tag}-08-proof")
        pg.click("#doc-ok"); pg.wait_for_timeout(300)
        print(tag, "objective:", pg.locator("#obj-text").text_content())
        # talk to Sister Ewenice: ask, then show the suit
        pg.evaluate("__wus.tp(530, 1846)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.talk('ewenice')"); pg.wait_for_timeout(400)
        shot(pg, f"{tag}-09-ewenice")
        print(tag, "choices:", pg.evaluate("__wus.choices()"))
        pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(100); pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(100)
        pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(100)
        print(tag, "back at choices:", pg.evaluate("__wus.choices()"))
        pg.evaluate("__wus.choose(1)"); pg.wait_for_timeout(100)
        labels = pg.evaluate("__wus.choices()"); print(tag, "proof choices:", labels)
        idx = next(i for i, l in enumerate(labels) if "suit" in l)
        pg.evaluate(f"__wus.choose({idx})"); pg.wait_for_timeout(200)
        shot(pg, f"{tag}-10-proofok")
        pg.evaluate("__wus.choose(0)"); pg.wait_for_timeout(1200)
        shot(pg, f"{tag}-11-walkout-start")
        pg.wait_for_timeout(3000)
        shot(pg, f"{tag}-12-walkout")
        pg.wait_for_timeout(9000)
        s = st(pg); print(tag, "after walkout:", s, pg.evaluate("__wus.church()"))
        church_ids = ['ewenice', 'bleatrice', 'shearon', 'ewegene', 'fleecil', 'lambuel', 'woolma']
        sh = {i: pg.evaluate(f"__wus.sheep('{i}')") for i in church_ids}
        print(tag, "congregation:", sh)
        shot(pg, f"{tag}-13-empty")
        pg.evaluate("__wus.portal('chapelOut')"); pg.wait_for_timeout(1400)
        print(tag, "back outside:", pg.evaluate("__wus.region()"))
        shot(pg, f"{tag}-14-outside-flock")
        ew = sh.pop('ewenice')
        stayed = all(v["state"] == "asleep" and v["y"] > 1600 for v in sh.values())
        ok = caught_by_prayer and bowed_safe and s["woke"] == 1 and "fleece" in s["proof"] and ew["state"] == "woke" and ew["y"] < 1300 and stayed
        print(tag, "ewenice outside:", ew, "congregation stayed asleep:", stayed)
        print(tag, "PASS" if ok else "FAIL", dict(caught_by_prayer=caught_by_prayer, bowed_safe=bowed_safe))
        b.close()
        return ok

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "desktop"
    res = []
    if which in ("desktop", "all"): res.append(run(1280, 800, False, "desk"))
    if which in ("phone", "all"): res.append(run(390, 844, True, "phone"))
    print("ERRORS:" if errors else "no console errors")
    for e in errors[:30]: print(e)
    sys.exit(0 if all(res) else 1)

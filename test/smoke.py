"""Drive the demo in headless Chromium: title, meadow, glasses, reveal, stealth, dialogs, finale, endings."""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots"
errors = []

def st(page):
    return page.evaluate("__wus.state()")

def shot(page, name):
    page.screenshot(path=str(SHOTS / f"{name}.png"))

def run(width, height, touch, tag, full=True):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": width, "height": height}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
        page = ctx.new_page()
        page.on("console", lambda m: errors.append(f"[{tag}] console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
        page.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))
        page.goto(URL)
        page.wait_for_timeout(1200)
        shot(page, f"{tag}-01-title")
        page.click("#btn-play")
        page.wait_for_timeout(700)
        shot(page, f"{tag}-02-meadow")
        # walk toward the hole a bit with the keyboard
        if not touch:
            page.keyboard.down("d"); page.wait_for_timeout(900); page.keyboard.up("d")
        page.evaluate("__wus.tp(1362, 806)")
        page.wait_for_timeout(500)
        s = st(page); print(tag, "after tp", s)
        shot(page, f"{tag}-03-glasses-dialog")
        page.evaluate("__wus.choose(0)")
        page.wait_for_timeout(300)
        print(tag, "phase", st(page)["phase"])
        if touch:
            page.tap("#t-specs")
        else:
            page.keyboard.press("Space")
        page.wait_for_timeout(300)
        shot(page, f"{tag}-04-wipe")
        page.wait_for_timeout(2600)
        s = st(page); print(tag, "reveal", s)
        shot(page, f"{tag}-05-reveal-dialog")
        for i in range(3):
            page.evaluate("__wus.choose(0)"); page.wait_for_timeout(250)
        page.wait_for_timeout(1300)
        s = st(page); print(tag, "after reveal", s)
        shot(page, f"{tag}-06-fleecing")
        if not full:
            b.close(); return
        # stand in front of Rom & Rem's spinning cones and get seen
        page.evaluate("__wus.tp(840, 400)")
        page.evaluate("__wus.face('romrem', 840, 400)")
        page.wait_for_timeout(450)
        shot(page, f"{tag}-07-seen")
        print(tag, "seen", st(page))
        page.wait_for_timeout(900)
        s = st(page); print(tag, "caught?", s)
        shot(page, f"{tag}-08-caught")
        if s["modal"] == "dialog":
            page.evaluate("__wus.choose(0)"); page.wait_for_timeout(250); page.evaluate("__wus.choose(0)"); page.wait_for_timeout(600)
        s = st(page); print(tag, "after caught", s)
        shot(page, f"{tag}-09-calm-drops")
        # proof pickup
        page.evaluate("__wus.skipReveal()")
        page.evaluate("__wus.tp(822, 784)")
        page.wait_for_timeout(500)
        s = st(page); print(tag, "proof", s)
        shot(page, f"{tag}-10-proof-doc")
        page.click("#doc-ok"); page.wait_for_timeout(200)
        # talk to Barbara and show the label
        page.evaluate("__wus.tp(700, 886)")
        page.wait_for_timeout(300)
        page.evaluate("__wus.talk('barbara')")
        page.wait_for_timeout(1600)
        shot(page, f"{tag}-11-barbara")
        print(tag, "choices", page.evaluate("__wus.choices()"))
        page.evaluate("__wus.choose(1)"); page.wait_for_timeout(200)
        print(tag, "proof choices", page.evaluate("__wus.choices()"))
        page.evaluate("__wus.choose(0)"); page.wait_for_timeout(200)
        page.evaluate("__wus.choose(0)"); page.wait_for_timeout(600)
        s = st(page); print(tag, "after barbara", s)
        shot(page, f"{tag}-12-woke")
        page.evaluate("__wus.give('checks'); __wus.give('prices'); __wus.give('guestbook')")
        for sid, need in (("doug", 1), ("nana", 1), ("shirley", 1)):
            page.evaluate(f"__wus.talk('{sid}')"); page.wait_for_timeout(100)
            page.evaluate("__wus.choose(1)"); page.wait_for_timeout(100)
            labels = page.evaluate("__wus.choices()")
            idx = next(i for i, l in enumerate(labels) if {"doug": "campaign", "nana": "guest", "shirley": "price"}[sid] in l)
            page.evaluate(f"__wus.choose({idx})"); page.wait_for_timeout(100)
            page.evaluate("__wus.choose(0)"); page.wait_for_timeout(300)
        page.wait_for_timeout(1500)
        s = st(page); print(tag, "herd", s)
        shot(page, f"{tag}-13-herd")
        page.wait_for_timeout(4500)
        page.evaluate("__wus.tp(620, 900)")
        page.wait_for_timeout(2500)
        s = st(page); print(tag, "at gate", s)
        shot(page, f"{tag}-14-gate")
        page.wait_for_timeout(1800)
        for i in range(7):
            page.evaluate("__wus.beat()"); page.wait_for_timeout(450)
        shot(page, f"{tag}-15-bigbaa")
        page.wait_for_timeout(1200)
        shot(page, f"{tag}-16-stampede")
        page.wait_for_timeout(3000)
        shot(page, f"{tag}-17-real")
        page.wait_for_timeout(3500)
        s = st(page); print(tag, "end", s)
        shot(page, f"{tag}-18-ending")
        # bad ending path
        page.click("#btn-again"); page.wait_for_timeout(400)
        page.evaluate("__wus.skipReveal(); __wus.setCred(1)")
        page.evaluate("__wus.catchMe('granny')")
        page.wait_for_timeout(400)
        page.evaluate("__wus.choose(0)"); page.wait_for_timeout(200); page.evaluate("__wus.choose(0)"); page.wait_for_timeout(900)
        s = st(page); print(tag, "counted", s)
        shot(page, f"{tag}-19-counted")
        b.close()

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "desktop"
    if which in ("desktop", "all"):
        run(1280, 800, False, "desk")
    if which in ("phone", "all"):
        run(390, 844, True, "phone", full=True)
    print("ERRORS:" if errors else "no console errors")
    for e in errors[:40]:
        print(e)

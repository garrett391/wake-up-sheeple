"""The objective card can be hidden and shown (button and O key), flags new objectives while hidden, and remembers the choice."""
import pathlib, sys
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots"
errs = []
def hud_h(pg): return pg.evaluate("document.getElementById('hud-top').offsetHeight")
def run(w, h, touch, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(); ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
        pg = ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(600)
        (pg.tap if touch else pg.click)("#btn-play"); pg.wait_for_timeout(400)
        pg.evaluate("__wus.skipReveal()"); pg.wait_for_timeout(300)
        h0 = hud_h(pg)
        (pg.tap if touch else pg.click)("#obj-toggle"); pg.wait_for_timeout(250)
        h1 = hud_h(pg); collapsed = pg.evaluate("document.getElementById('objective').classList.contains('collapsed')")
        print(tag, "hud height", h0, "->", h1, "collapsed:", collapsed, "aria:", pg.get_attribute("#obj-toggle", "aria-expanded"))
        pg.screenshot(path=str(SHOTS / f"obj-{tag}-collapsed.png"))
        # a new objective while hidden shows the New badge
        pg.evaluate("__wus.portal('chapel')"); pg.wait_for_timeout(1300)
        badge = pg.evaluate("!document.getElementById('obj-new').hidden")
        print(tag, "new badge after objective change:", badge)
        pg.screenshot(path=str(SHOTS / f"obj-{tag}-new.png"))
        # the setting survives a reload
        pg.reload(); pg.wait_for_timeout(600); (pg.tap if touch else pg.click)("#btn-play"); pg.wait_for_timeout(400)
        kept = pg.evaluate("document.getElementById('objective').classList.contains('collapsed')")
        # expand again: button on touch, O key on desktop
        if touch: pg.tap("#obj-toggle")
        else: pg.keyboard.press("o")
        pg.wait_for_timeout(250)
        expanded = not pg.evaluate("document.getElementById('objective').classList.contains('collapsed')")
        badge_gone = pg.evaluate("document.getElementById('obj-new').hidden")
        h2 = hud_h(pg)
        # Space right after clicking the toggle must still toggle the glasses, not the card
        if not touch:
            pg.click("#obj-toggle"); pg.wait_for_timeout(100)
            pg.evaluate("__wus.skipReveal(); __wus.wear(false)"); pg.wait_for_timeout(100)
            pg.keyboard.press("Space"); pg.wait_for_timeout(700)
            space_ok = pg.evaluate("__wus.state()")["view"] == 1 and pg.evaluate("document.getElementById('objective').classList.contains('collapsed')")
            pg.keyboard.press("o"); pg.wait_for_timeout(100)
        else: space_ok = True
        ok = collapsed and h1 < h0 and badge and kept and expanded and badge_gone and h2 > h1 and space_ok
        print(tag, "kept after reload:", kept, "expanded:", expanded, "badge cleared:", badge_gone, "space toggles glasses:", space_ok, "PASS" if ok else "FAIL")
        b.close(); return ok
res = [run(1280, 800, False, "desk"), run(390, 844, True, "phone")]
print("errors:", errs or "none")
sys.exit(0 if all(res) and not errs else 1)

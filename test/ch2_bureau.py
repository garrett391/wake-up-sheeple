"""Bureau agents: a moving sheep near a sniffing agent gets retired; a frozen one doesn't."""
import pathlib, sys
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / "test/index.html").as_uri() + "?debug=1&chapter=2"
errs = []
def trial(p, freeze):
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 800})
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.evaluate("__wus.ch2(false)"); pg.wait_for_timeout(300); pg.evaluate("__wus.skipReveal(); __wus.wear(false)")
    pg.evaluate("__wus.tp(980, 640)"); pg.wait_for_timeout(200)
    pg.evaluate("__wus.crow(1)"); pg.wait_for_timeout(200)
    # wait for an agent to come within sniffing range
    for _ in range(60):
        a = pg.evaluate("__wus.G.wolves.filter(w => w.role === 'agent').map(w => Math.hypot(w.x - __wus.G.player.x, w.y - __wus.G.player.y))")
        if min(a) < 140: break
        pg.wait_for_timeout(150)
    if freeze: pg.keyboard.down("Shift")
    else: pg.keyboard.down("ArrowLeft")
    for _ in range(40):
        pg.wait_for_timeout(100)
        if not freeze and _ % 8 == 4: pg.keyboard.up("ArrowLeft"); pg.keyboard.down("ArrowRight")
        if not freeze and _ % 8 == 0 and _: pg.keyboard.up("ArrowRight"); pg.keyboard.down("ArrowLeft")
        if pg.evaluate("__wus.state()")["modal"] == "dialog": break
    name = pg.locator("#dlg-name").text_content() if pg.evaluate("__wus.state()")["modal"] == "dialog" else None
    hidden = pg.evaluate("__wus.G.hiddenFrom")
    b.close()
    return name, hidden
with sync_playwright() as p:
    moving = trial(p, False); frozen = trial(p, True)
print("moving:", moving, "frozen:", frozen)
ok = moving[0] in ('Agent Bacon', 'Agent Ham') and frozen[0] is None
print("PASS" if ok and not errs else "FAIL", errs)
sys.exit(0 if ok and not errs else 1)

"""The chapel at the finale.
A: Ewenice is the 4th sheep, woken inside the chapel: the finale starts there, you can still leave, and the congregation joins the herd.
B: Ewenice woken earlier, the 4th sheep woken in the ranch: the chapel bell rings and the congregation pops out of the chapel door to follow you.
C: Ewenice never woken: nobody leaves the pews at the finale."""
import pathlib, sys
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots/church"
CONG = ['bleatrice', 'shearon', 'ewegene', 'fleecil', 'lambuel', 'woolma']
errs = []

def start(p):
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1280, "height": 800})
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(600); pg.click("#btn-play"); pg.wait_for_timeout(300)
    pg.evaluate("__wus.skipReveal()")
    return b, pg

def wake_ewenice(pg):
    pg.evaluate("__wus.portal('chapel')"); pg.wait_for_timeout(1200)
    pg.evaluate("__wus.give('fleece')"); pg.evaluate("__wus.tp(530, 1846)")
    pg.evaluate("__wus.talk('ewenice')"); pg.wait_for_timeout(200)
    for i in [1, 0, 0]: pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(150)

def cong(pg): return {i: pg.evaluate(f"__wus.sheep('{i}')") for i in CONG}

with sync_playwright() as p:
    # A
    b, pg = start(p)
    pg.evaluate("__wus.G.woke = 3")
    wake_ewenice(pg)
    pg.wait_for_timeout(2500)
    s = pg.evaluate("__wus.state()"); print("A phase:", s["phase"], "woke:", s["woke"], pg.evaluate("__wus.church()"))
    pg.wait_for_timeout(7000)
    pg.evaluate("__wus.tp(750, 2240)"); pg.wait_for_timeout(300)
    it = pg.evaluate("__wus.interact()"); print("A exit prompt in herd:", it)
    pg.evaluate("__wus.use()"); pg.wait_for_timeout(2500)
    follow = {k: v["follow"] for k, v in cong(pg).items()}; follow['ewenice'] = pg.evaluate("__wus.sheep('ewenice')")["follow"]
    print("A following:", follow)
    pg.screenshot(path=str(SHOTS / "finale-A.png"))
    okA = s["phase"] == "herd" and it and it["kind"] == "portal" and all(follow.values())
    b.close()
    # B
    b, pg = start(p)
    wake_ewenice(pg)
    pg.wait_for_timeout(8000)
    c = cong(pg); print("B before finale, pews:", {k: (v["state"], v["y"] > 1600) for k, v in c.items()}, "woke:", pg.evaluate("__wus.state()")["woke"])
    stayed = all(v["state"] == "asleep" and v["y"] > 1600 for v in c.values())
    pg.evaluate("__wus.portal('chapelOut')"); pg.wait_for_timeout(1200)
    pg.evaluate("__wus.tp(900, 960)"); pg.wait_for_timeout(300)
    pg.evaluate("__wus.G.woke = 3; __wus.give('label')"); pg.evaluate("__wus.tp(700, 886)"); pg.evaluate("__wus.talk('barbara')"); pg.wait_for_timeout(200)
    labels = None
    for i in [1, 0, 0]: pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(150)
    pg.wait_for_timeout(1900)
    print("B bell:", pg.evaluate("__wus.church()"))
    pg.screenshot(path=str(SHOTS / "finale-B-bell.png"))
    pg.wait_for_timeout(3500)
    c = cong(pg); print("B after bell:", {k: (v["state"], v["follow"], v["y"] < 1300) for k, v in c.items()})
    pg.screenshot(path=str(SHOTS / "finale-B-flock.png"))
    okB = stayed and all(v["state"] == "woke" and v["follow"] and v["y"] < 1300 for v in c.values()) and pg.evaluate("__wus.G.ach.has('flock')")
    pg.evaluate("__wus.tp(620, 900)"); pg.wait_for_timeout(3000)
    print("B at gate:", pg.evaluate("__wus.state()")["phase"])
    b.close()
    # C
    b, pg = start(p)
    pg.evaluate("__wus.G.woke = 3; __wus.give('label')"); pg.evaluate("__wus.tp(700, 886)"); pg.evaluate("__wus.talk('barbara')"); pg.wait_for_timeout(200)
    for i in [1, 0, 0]: pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(150)
    pg.wait_for_timeout(5000)
    c = cong(pg); okC = pg.evaluate("__wus.state()")["phase"] == "herd" and all(v["state"] == "asleep" and v["y"] > 1600 for v in c.values())
    print("C pews untouched:", okC, pg.evaluate("__wus.church()"))
    b.close()
print("A", okA, "B", okB, "C", okC)
print("PASS" if okA and okB and okC and not errs else "FAIL", errs)
sys.exit(0 if okA and okB and okC and not errs else 1)

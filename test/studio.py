"""Bellwether's studio, the Bleat (Chapter 1).
A: the door in the southwest pasture leads into the studio and back out.
B: the broadcast cycles ON AIR -> wrap -> commercial break -> ON AIR.
C: on air, the cameras catch you moving but not standing still; on the break they don't watch at all.
D: Bellwether won't talk on air; on the break he talks, and the cue cards wake him (Woke +1, like anyone) and Ringleader, and his hint clears.
E: he walks out to the ranch, and the finale picks him up.
F: Chapter 2 has no studio crew; Bellwether stands outside the Bleat.
G: phone width screenshot of the studio."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots"; SHOTS.mkdir(exist_ok=True)
errs, checks = [], {}

def start(p, w=1280, h=800, touch=False):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text and "net::" not in m.text else None)
    pg.goto(URL); pg.wait_for_timeout(600)
    if touch: pg.tap("#btn-play")
    else: pg.click("#btn-play")
    pg.wait_for_timeout(300)
    pg.evaluate("__wus.skipReveal()")
    return b, pg

def ev(pg, js): return pg.evaluate(js)

def go_in(pg):
    ev(pg, "__wus.tp(171, 1012)"); pg.wait_for_timeout(200)
    it = ev(pg, "__wus.interact()")
    ev(pg, "__wus.use()"); pg.wait_for_timeout(900)
    return it

def close_dialog(pg, n=8):
    for _ in range(n):
        if ev(pg, "__wus.state().modal") != "dialog": return
        print("   dlg:", ev(pg, "__wus.choices()"))
        ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(200)

def show_cards(pg):
    """In Bellwether's dialog: ask a question, then show the cue cards."""
    for _ in range(8):
        if ev(pg, "__wus.state().modal") != "dialog": break
        ch = ev(pg, "__wus.choices()"); print("   bw:", ch)
        low = [c.lower() for c in ch]
        i = next((i for i, c in enumerate(low) if "cue card" in c), None)
        if i is None: i = next((i for i, c in enumerate(low) if "proof" in c or "show" in c), None)
        if i is None: i = next((i for i, c in enumerate(low) if "ask" in c), 0)
        ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(200)
    pg.wait_for_timeout(300)

def wait_for(pg, js, timeout=20000):
    for _ in range(timeout // 100):
        if ev(pg, js): return True
        pg.wait_for_timeout(100)
    return False

with sync_playwright() as p:
    b, pg = start(p)
    # A: in and out
    it = go_in(pg)
    checks["A door at the Bleat"] = bool(it) and it["kind"] == "portal"
    checks["A inside the studio"] = ev(pg, "__wus.region()") == "studio"
    checks["A on air when you walk in"] = ev(pg, "__wus.studio().mode") == "air"
    # B: the cycle
    ev(pg, "__wus.setStudio('air', 99)"); pg.wait_for_timeout(250)
    checks["B air -> wrap"] = ev(pg, "__wus.studio().mode") == "wrap"
    ev(pg, "__wus.setStudio('wrap', 99)"); pg.wait_for_timeout(250)
    checks["B wrap -> break"] = ev(pg, "__wus.studio().mode") == "break"
    ev(pg, "__wus.setStudio('break', 99)"); pg.wait_for_timeout(250)
    m = ev(pg, "__wus.studio()")
    checks["B break -> air (9-12 s)"] = m["mode"] == "air" and 9 <= m["len"] <= 12
    # C: cameras. Stand in camera A's view, away from the producer.
    ev(pg, "__wus.G.studio.len = 999")
    ev(pg, "__wus.tp(480, 2640)"); ev(pg, "__wus.G.invuln = 0")
    ev(pg, "__wus.G.player.walk = 0")
    checks["C still on air: holding-still flag"] = wait_for(pg, "__wus.G.camHidden", 12000)  # the camera sweeps, so wait for it to pass over you
    pg.wait_for_timeout(1200)
    still = ev(pg, "__wus.wolf('camA')")
    checks["C still on air: not caught"] = ev(pg, "__wus.state().cred") == 3 and still["alert"] < 0.2
    pg.screenshot(path=str(SHOTS / "studio-still.png"))
    pg.keyboard.down("d"); pg.wait_for_timeout(120); pg.keyboard.up("d")
    pg.keyboard.down("a"); pg.wait_for_timeout(120); pg.keyboard.up("a")
    seen = wait_for(pg, "(() => { const w = __wus.wolf('camA'); return w.alert > 0.3 || __wus.state().modal === 'dialog'; })()", 1)
    # keep wiggling in place until it catches us
    caught = False
    for _ in range(40):
        pg.keyboard.down("d"); pg.wait_for_timeout(90); pg.keyboard.up("d")
        pg.keyboard.down("a"); pg.wait_for_timeout(90); pg.keyboard.up("a")
        if ev(pg, "__wus.state().modal") == "dialog": caught = True; break
    checks["C moving on air: caught by the camera"] = caught
    checks["C the producer delivers the bad news"] = caught and "Producer" in (pg.text_content("#dlg-name") or "")
    close_dialog(pg)
    pg.wait_for_timeout(600)
    checks["C caught costs 1 Credibility"] = ev(pg, "__wus.state().cred") == 2
    # back in on a commercial break: moving is safe
    go_in(pg); ev(pg, "__wus.G.invuln = 0")
    ev(pg, "__wus.setStudio('break', 0)"); ev(pg, "__wus.tp(480, 2640)")
    for _ in range(12):
        pg.keyboard.down("d"); pg.wait_for_timeout(90); pg.keyboard.up("d")
        pg.keyboard.down("a"); pg.wait_for_timeout(90); pg.keyboard.up("a")
    checks["C moving on the break: safe"] = ev(pg, "__wus.state().modal") is None and ev(pg, "__wus.wolf('camA').alert") < 0.2
    pg.screenshot(path=str(SHOTS / "studio-break.png"))
    # D: Bellwether
    ev(pg, "__wus.G.invuln = 1e9")
    ev(pg, "__wus.setStudio('air', 0)"); ev(pg, "__wus.tp(700, 2690)")
    ev(pg, "__wus.talk('bellwether')"); pg.wait_for_timeout(200)
    txt = ev(pg, "__wus.ui.dlgSr.textContent")
    checks["D won't talk on air"] = ev(pg, "__wus.choices().length") <= 1 and ("LIVE" in txt or "ON AIR" in txt or "commercial" in txt)
    close_dialog(pg)
    ev(pg, "__wus.wear(true)")  # the clinic took them off
    ev(pg, "__wus.setStudio('break', 0)"); ev(pg, "__wus.tp(1085, 2600)")
    checks["D cue cards by the back door"] = wait_for(pg, "__wus.state().modal === 'doc'", 3000) and "cue cards" in (pg.text_content("#doc-title") or "").lower()
    pg.screenshot(path=str(SHOTS / "studio-cuecards.png"))
    print("D after cards:", ev(pg, "__wus.state()"))
    if ev(pg, "__wus.state().modal") == "doc": ev(pg, "__wus.ui.docOk.click()")
    pg.wait_for_timeout(300)
    checks["D cue cards found"] = "cuecards" in ev(pg, "__wus.state().proof")
    woke0 = ev(pg, "__wus.state().woke")
    ev(pg, "__wus.setStudio('break', 0)"); ev(pg, "__wus.tp(700, 2690)")
    ev(pg, "__wus.talk('bellwether')"); pg.wait_for_timeout(200)
    checks["D talks on the break"] = ev(pg, "__wus.state().modal") == "dialog"
    show_cards(pg)
    checks["D woke +1"] = ev(pg, "__wus.state().woke") == woke0 + 1
    checks["D his cue card hint is gone"] = "cue cards" not in (ev(pg, "__wus.G.hint") or "")
    checks["D broadcast off"] = ev(pg, "__wus.studio().mode") == "off"
    checks["D Ringleader unlocked"] = "ringleader" in ev(pg, "(JSON.parse(localStorage.getItem('wake-up-sheeple') || '{}').ach || [])")
    pg.screenshot(path=str(SHOTS / "studio-woke.png"))
    # E: walkout and finale
    checks["E walks out to the ranch"] = wait_for(pg, "(() => { const s = __wus.sheep('bellwether'); return s.y < 1100; })()", 8000)
    print("E bellwether:", ev(pg, "__wus.sheep('bellwether')"))
    ev(pg, "__wus.portal('studioOut')"); pg.wait_for_timeout(500)
    checks["E back out by the Bleat"] = ev(pg, "__wus.region()") == "ranch"
    b.close()

    # E2: the finale starting while he's inside brings him out to follow
    b, pg = start(p)
    ev(pg, "__wus.G.invuln = 1e9")
    go_in(pg); ev(pg, "__wus.give('cuecards')"); ev(pg, "__wus.setStudio('break', 0)"); ev(pg, "__wus.tp(700, 2690)")
    ev(pg, "__wus.talk('bellwether')"); pg.wait_for_timeout(200); show_cards(pg)
    # wake two more ranch sheep with their proofs while he's still inside: 2 + 2 = 4 starts the finale
    ev(pg, "__wus.G.sheep.find(s => s.id === 'bellwether').run = { x: 700, y: 2700, speed: 1 }")
    ev(pg, "__wus.portal('studioOut')"); pg.wait_for_timeout(400)
    ev(pg, "__wus.give('label')"); ev(pg, "__wus.tp(700, 886)"); ev(pg, "__wus.talk('barbara')"); pg.wait_for_timeout(150)
    for i in [1, 0, 0]: ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(150)
    close_dialog(pg)
    print("E2 woke:", ev(pg, "__wus.state()")["woke"], ev(pg, "__wus.sheep('bellwether')"))
    pg.wait_for_timeout(3000)  # let his walkout start, then put him back inside as if the player beat him to it
    ev(pg, "__wus.G.sheep.find(s => s.id === 'bellwether').run = null")
    ev(pg, "(() => { const s = __wus.G.sheep.find(s => s.id === 'bellwether'); s.x = 700; s.y = 2700; })()")
    ev(pg, "__wus.give('checks')"); ev(pg, "__wus.tp(1110, 446)"); ev(pg, "__wus.talk('doug')"); pg.wait_for_timeout(150)
    for i in [1, 1, 0]: print("   doug:", ev(pg, "__wus.choices()")); ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(150)
    close_dialog(pg)
    # Bellwether counts 1 like anyone, so one more: Shirley and the clinic price list
    ev(pg, "__wus.give('prices')"); ev(pg, "(() => { const s = __wus.sheep('shirley'); __wus.tp(s.x, s.y + 26); })()"); ev(pg, "__wus.talk('shirley')"); pg.wait_for_timeout(150)
    ev(pg, "__wus.choose(1)"); pg.wait_for_timeout(150)
    ch = ev(pg, "__wus.choices()"); print("   shirley:", ch)
    ev(pg, f"__wus.choose({next(i for i, c in enumerate(ch) if 'price' in c.lower())})"); pg.wait_for_timeout(150)
    close_dialog(pg)
    print("E2 woke:", ev(pg, "__wus.state()")["woke"])
    ok = wait_for(pg, "__wus.state().phase === 'herd'", 8000)
    s = ev(pg, "__wus.sheep('bellwether')"); print("E2 phase herd:", ok, s)
    checks["E2 finale brings him out to follow"] = ok and s["y"] < 1100 and bool(s["follow"])
    b.close()

    # F: Chapter 2
    b, pg = start(p)
    ev(pg, "__wus.ch2()"); pg.wait_for_timeout(500)
    crew = ev(pg, "__wus.G.wolves.filter(w => ['producer','camA','camB'].includes(w.id)).length")
    s = ev(pg, "__wus.sheep('bellwether')")
    checks["F no studio crew in Ch2"] = crew == 0
    checks["F Bellwether outside the Bleat in Ch2"] = s and s["y"] < 1100 and s["state"] == "woke"
    checks["F no studio portal in Ch2"] = ev(pg, "__wus.tp(171, 1012), !(__wus.interact() && __wus.interact().kind === 'portal')")
    b.close()

    # G: phone
    b, pg = start(p, 390, 844, touch=True)
    go_in(pg); pg.wait_for_timeout(3800)
    pg.screenshot(path=str(SHOTS / "studio-phone.png"))
    checks["G phone: inside"] = ev(pg, "__wus.region()") == "studio"
    b.close()

for k, v in checks.items(): print("PASS" if v else "FAIL", k)
print("console errors:", errs or "none")

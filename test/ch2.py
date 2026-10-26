"""Chapter 2: Hogwash, end to end."""
import pathlib, sys
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1&chapter=2"
SHOTS = ROOT / "shots/ch2"
errors = []
def st(pg): return pg.evaluate("__wus.state()")
def shot(pg, n): pg.screenshot(path=str(SHOTS / f"{n}.png"))
def close(pg, n=10):
    for _ in range(n):
        if st(pg)["modal"] != "dialog": return
        labels = pg.evaluate("__wus.choices()")
        i = next((k for k, l in enumerate(labels) if l.endswith('Leave')), 0)
        pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(120)
def show(pg, sid, proof):
    pg.evaluate(f"__wus.talk('{sid}')"); pg.wait_for_timeout(150)
    labels = pg.evaluate("__wus.choices()")
    i = next(k for k, l in enumerate(labels) if 'Show proof' in l); pg.evaluate(f"__wus.choose({i})"); pg.wait_for_timeout(120)
    labels = pg.evaluate("__wus.choices()")
    j = next(k for k, l in enumerate(labels) if proof in l); pg.evaluate(f"__wus.choose({j})"); pg.wait_for_timeout(150)
    txt = pg.evaluate("document.getElementById('dlg-text').textContent")
    return txt

def run(width, height, touch, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": width, "height": height}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
        pg = ctx.new_page()
        pg.on("console", lambda m: errors.append(f"[{tag}] {m.type}: {m.text}") if m.type in ("error", "warning") and "ERR_TUNNEL" not in m.text else None)
        pg.on("pageerror", lambda e: errors.append(f"[{tag}] pageerror: {e}"))
        pg.goto(URL); pg.wait_for_timeout(800)
        (pg.tap if touch else pg.click)("#btn-chapters"); pg.wait_for_timeout(300)
        print(tag, "chapter 2 open in Chapters:", pg.is_enabled('.chapter[data-ch="2"]'))
        (pg.tap if touch else pg.click)('.chapter[data-ch="2"]'); pg.wait_for_timeout(1000)
        close(pg)
        pg.evaluate("__wus.skipReveal()"); pg.wait_for_timeout(300)
        ok = {}
        # 1. a crow reports, the agents come
        pg.evaluate("__wus.tp(470, 420)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.crow(0)"); pg.wait_for_timeout(1800)
        a = pg.evaluate("__wus.pig('agentA')"); print(tag, "agent after report:", a)
        ok['agents'] = a['active'] and a['mode'] in ('out', 'search')
        shot(pg, f"{tag}-01-report")
        pg.wait_for_timeout(5000)
        shot(pg, f"{tag}-02-agents")
        # 2. retirement: caught by an agent, wake up in the Sunny Acres pen, Kevin opens it
        pg.evaluate("__wus.retireMe()"); pg.wait_for_timeout(300); shot(pg, f"{tag}-03-retire-dialog"); close(pg)
        pg.wait_for_timeout(1800)
        print(tag, "retired:", st(pg)["cred"], pg.evaluate("__wus.region()"), st(pg)["modal"])
        shot(pg, f"{tag}-04-kevin")
        ok['retired'] = pg.evaluate("__wus.region()") == 'acres' and st(pg)["cred"] == 2
        close(pg)
        pen = pg.evaluate("__wus.solids.find(s => s.tag === 'pengate').on"); print(tag, "pen gate closed after Kevin:", pen)
        ok['kevin'] = pen is False
        pg.evaluate("__wus.portal('tunnelOut')"); pg.wait_for_timeout(1300)
        ok['unretired'] = pg.evaluate("__wus.G.ach.has('unretired')")
        print(tag, "back in ranch, unretired:", ok['unretired'])
        # 3. proofs: find two around the farm and convince Barbara with a pair
        pg.evaluate("__wus.wear(true)")
        pg.evaluate("__wus.tp(642, 742)"); pg.wait_for_timeout(600)
        print(tag, "holdings doc:", st(pg)["modal"]); shot(pg, f"{tag}-05-holdings")
        pg.click("#doc-ok") if not touch else pg.tap("#doc-ok"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.tp(700, 880)"); pg.wait_for_timeout(200)
        half = show(pg, 'barbara', 'Hog Holdings'); print(tag, "barbara half:", half[:70])
        shot(pg, f"{tag}-06-barbara-half"); close(pg)
        # 4. the Farmhouse: in through the front door
        pg.evaluate("__wus.tp(1362, 466)"); pg.wait_for_timeout(300)
        print(tag, "farm door prompt:", pg.evaluate("__wus.interact()"))
        pg.evaluate("__wus.wear(false)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.use()"); pg.wait_for_timeout(1400)
        print(tag, "region:", pg.evaluate("__wus.region()"))
        shot(pg, f"{tag}-07-farm-hall-real")
        pg.evaluate("__wus.tp(2110, 2560)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-08-board-real")
        pg.evaluate("__wus.wear(true)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-09-board-truth")
        # sneak to the ledger: freeze is needed near the butler, so just teleport and grab
        pg.evaluate("__wus.G.invuln = 3"); pg.evaluate("__wus.tp(1832, 2300)"); pg.wait_for_timeout(500)
        print(tag, "ledger:", st(pg)["proof"]); shot(pg, f"{tag}-10-ledger")
        (pg.tap if touch else pg.click)("#doc-ok"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.G.invuln = 3"); pg.evaluate("__wus.tp(2970, 2540)"); pg.wait_for_timeout(500)
        print(tag, "strings photo:", st(pg)["proof"]); (pg.tap if touch else pg.click)("#doc-ok"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.tp(2760, 2330)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-11-puppet-room-truth")
        pg.evaluate("__wus.wear(false)"); pg.wait_for_timeout(400); shot(pg, f"{tag}-12-puppet-room-real")
        pg.evaluate("__wus.wear(true)")
        # a sniffing pig catches a moving sheep: retirement again
        pg.evaluate("__wus.G.invuln = 0"); pg.evaluate("__wus.tp(2000, 2470)")
        pg.keyboard.down("ArrowLeft") if not touch else None
        pg.wait_for_timeout(1300)
        pg.keyboard.up("ArrowLeft") if not touch else None
        s = st(pg); print(tag, "walked past the board:", s["modal"], s["cred"])
        if s["modal"] == "dialog": shot(pg, f"{tag}-13-board-caught"); close(pg); pg.wait_for_timeout(1700); close(pg)
        # 5. convince three: Barbara (holdings + ledger), Doug and Ewenice via the debug helper, then the protest
        pg.evaluate("__wus.portal('tunnelOut')") if pg.evaluate("__wus.region()") == 'acres' else None
        pg.wait_for_timeout(1300)
        pg.evaluate("__wus.wear(false)"); pg.evaluate("__wus.tp(700, 880)"); pg.wait_for_timeout(200)
        yes = show(pg, 'barbara', 'ledger'); print(tag, "barbara yes:", yes[:60]); close(pg); pg.wait_for_timeout(1500)
        ok['two_proofs'] = st(pg)["woke"] == 1
        wrong = show(pg, 'nana', 'Hog Holdings'); print(tag, "nana wrong:", wrong[:50]); close(pg)
        ok['sulk'] = pg.evaluate("__wus.sheep('nana')")['sulk'] > 0
        pg.evaluate("__wus.convince('doug')"); pg.wait_for_timeout(300)
        pg.evaluate("__wus.convince('ewenice')"); pg.wait_for_timeout(4500)
        print(tag, "after 3:", st(pg)["woke"], "protest:", pg.evaluate("__wus.G.flags.protest"))
        pg.evaluate("__wus.tp(1362, 640)"); pg.wait_for_timeout(5000)
        shot(pg, f"{tag}-14-protest-real")
        pg.evaluate("__wus.wear(true)"); pg.wait_for_timeout(500); shot(pg, f"{tag}-15-protest-truth")
        ok['protest'] = pg.evaluate("__wus.G.sheep.filter(s => s.protest).length") >= 8
        # 6. in past the porch, chew the strings
        pg.evaluate("__wus.tp(1362, 466)"); pg.wait_for_timeout(300); print(tag, "door during protest:", pg.evaluate("__wus.interact()"), st(pg), pg.evaluate("[__wus.G.fade, __wus.region()]"), pg.locator("#dlg-name").text_content(), pg.evaluate("__wus.G.wolves.filter(w => w.active && w.alert > 0.1).map(w => [w.id, w.alert.toFixed(2), w.x|0, w.y|0])")); pg.evaluate("__wus.use()"); pg.wait_for_timeout(1400)
        pg.evaluate("__wus.tp(2760, 2320)"); pg.wait_for_timeout(300)
        print(tag, "rack prompt:", pg.evaluate("__wus.interact()"))
        for i in range(6):
            pg.evaluate("__wus.use()"); pg.wait_for_timeout(250)
            if i == 2: shot(pg, f"{tag}-16-chewing")
        print(tag, "limp:", {k: pg.evaluate(f"__wus.pig('{k}')")['limp'] for k in ['wolfgang', 'pastor', 'guard']})
        pg.wait_for_timeout(2400)
        print(tag, "phase:", st(pg)["phase"])
        shot(pg, f"{tag}-17-bigbaa")
        for i in range(7): pg.evaluate("__wus.beat()"); pg.wait_for_timeout(420)
        pg.wait_for_timeout(1600); shot(pg, f"{tag}-18-exposed")
        pg.wait_for_timeout(2600); shot(pg, f"{tag}-19-rout")
        pg.wait_for_timeout(4500)
        s = st(pg); print(tag, "end:", s["mode"], pg.locator("#end-title").text_content(), "|", pg.locator("#ach-head").text_content())
        shot(pg, f"{tag}-20-ending")
        ok['ending'] = s["mode"] == 'ending' and pg.locator("#end-title").text_content() == 'Hogwash'
        # 7. bad ending: lose all credibility
        pg.click("#btn-again") if not touch else pg.tap("#btn-again"); pg.wait_for_timeout(1000); close(pg)
        pg.evaluate("__wus.skipReveal(); __wus.setCred(1)"); pg.wait_for_timeout(200)
        pg.evaluate("__wus.retireMe()"); pg.wait_for_timeout(300); close(pg); pg.wait_for_timeout(1200)
        s = st(pg); print(tag, "bad end:", s["mode"], pg.locator("#end-title").text_content())
        shot(pg, f"{tag}-21-retired")
        ok['retired_end'] = s["mode"] == 'ending' and pg.locator("#end-title").text_content() == 'Retired'
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

"""The Chapters screen.
A: a new player: Play starts Chapter 1; Chapters lists 1 open, 2 and 3 locked with no names (no spoilers).
B: after finishing Chapter 1: Chapter 2 opens and shows its name; Chapter 3 stays locked; Esc and Back close the list.
C: after finishing Chapter 2: Chapter 3 shows as "Coming soon" and can't be started.
D: the end screen's next-chapter button and a phone-sized screenshot."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots"
errs, checks = [], {}

def page(b, w=1280, h=800, touch=False, store=None):
    ctx = b.new_context(viewport={"width": w, "height": h}, has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "net::" not in m.text else None)
    pg.goto(URL)
    if store is not None:
        pg.evaluate(f"localStorage.setItem('wake-up-sheeple', JSON.stringify({store}))"); pg.reload()
    pg.wait_for_timeout(600)
    return pg

def cards(pg):
    return pg.evaluate("""Array.from(document.querySelectorAll('#chapter-list .chapter')).map((b) => ({
      n: +b.dataset.ch, enabled: !b.disabled, name: b.querySelector('.name').textContent,
      blurb: b.querySelector('.blurb').textContent, status: (b.querySelector('.status') || {}).textContent || '' }))""")

with sync_playwright() as p:
    b = p.chromium.launch()

    # A: new player
    pg = page(b, store="{}")
    checks["chapters_button"] = pg.is_visible("#btn-chapters") and pg.is_visible("#btn-play")
    pg.click("#btn-chapters"); pg.wait_for_timeout(300)
    c = cards(pg); print("A:", c)
    checks["new_player_list"] = [x["enabled"] for x in c] == [True, False, False] and c[1]["name"] == "Locked" and c[2]["name"] == "Locked" \
        and "Hogwash" not in str(c) and "Farmer" not in str(c) and c[0]["status"] == "Not finished yet"
    checks["focus_first"] = pg.evaluate("document.activeElement.dataset.ch") == "1"
    pg.screenshot(path=str(SHOTS / "chapters-01-new.png"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    checks["esc_closes"] = pg.is_hidden("#scr-chapters") and pg.evaluate("document.activeElement.id") == "btn-chapters"
    pg.click("#btn-play"); pg.wait_for_timeout(400)
    s = pg.evaluate("__wus.state()"); checks["play_is_ch1"] = s["mode"] == "play" and pg.evaluate("__wus.G.ch") == 1
    pg.close()

    # B: Chapter 1 finished
    pg = page(b, store='{"ch2": true, "best": 252}')
    pg.click("#btn-chapters"); pg.wait_for_timeout(300)
    c = cards(pg); print("B:", c)
    checks["ch2_open"] = [x["enabled"] for x in c] == [True, True, False] and c[1]["name"] == "Hogwash" \
        and c[0]["status"] == "Finished. Best time 4:12" and c[2]["name"] == "Locked" and "Farmer" not in str(c)
    pg.screenshot(path=str(SHOTS / "chapters-02-ch2-open.png"))
    pg.click("#btn-chapters-back"); pg.wait_for_timeout(200)
    checks["back_closes"] = pg.is_hidden("#scr-chapters")
    pg.click("#btn-chapters"); pg.wait_for_timeout(200)
    pg.click('.chapter[data-ch="2"]'); pg.wait_for_timeout(800)
    checks["starts_ch2"] = pg.evaluate("__wus.G.ch") == 2 and pg.evaluate("__wus.G.mode") == "play" and pg.is_hidden("#scr-chapters")
    pg.close()

    # C: Chapter 2 finished
    pg = page(b, store='{"ch2": true, "best": 252, "best2": 431}')
    pg.click("#btn-chapters"); pg.wait_for_timeout(300)
    c = cards(pg); print("C:", c)
    checks["ch3_soon"] = c[2]["name"] == "The Farmer" and c[2]["status"] == "Coming soon" and not c[2]["enabled"] and c[1]["status"] == "Finished. Best time 7:11"
    pg.close()

    # D: end screen after a Chapter 1 win offers Chapter 2; a Chapter 2 win offers nothing (no Chapter 3 yet)
    pg = page(b, store="{}")
    pg.click("#btn-play"); pg.wait_for_timeout(300)
    pg.evaluate("__wus.skipReveal()"); pg.evaluate("__wus.G.time = 200")
    pg.evaluate("__wus.G.pendingEnd = 'win'"); pg.wait_for_timeout(400)
    nxt = pg.text_content("#btn-end-next"); vis = pg.is_visible("#btn-end-next"); print("D next:", vis, nxt)
    checks["end_next"] = vis and nxt == "Play Chapter 2: Hogwash"
    pg.click("#btn-end-next"); pg.wait_for_timeout(800)
    checks["end_next_starts"] = pg.evaluate("__wus.G.ch") == 2
    pg.evaluate("__wus.skipReveal()"); pg.evaluate("__wus.G.pendingEnd = 'hogwash'"); pg.wait_for_timeout(400)
    checks["no_next_after_ch2"] = pg.is_hidden("#btn-end-next")
    pg.close()

    pg = page(b, 390, 844, True, store='{"ch2": true, "best": 252}')
    pg.tap("#btn-chapters"); pg.wait_for_timeout(300)
    checks["phone_no_hscroll"] = pg.evaluate("document.querySelector('#scr-chapters').scrollWidth <= document.querySelector('#scr-chapters').clientWidth")
    pg.screenshot(path=str(SHOTS / "chapters-03-phone.png"))
    pg.close()
    b.close()

print(checks)
print("errors:", errs or "none")
print("PASS" if all(checks.values()) and not errs else "FAIL")

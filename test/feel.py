"""Targeted checks: render cost, grazing hides you, keyboard talk and choices, pause, retry flow."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1280, "height": 800})
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(URL); page.wait_for_timeout(800)
    page.mouse.move(300, 300); page.wait_for_timeout(400)
    lens = page.evaluate("[Math.round(__wus.G.lens.x), Math.round(__wus.G.lens.y)]")
    print("lens follows mouse:", lens)
    page.keyboard.press("Enter")  # Play button has focus
    page.wait_for_timeout(500)
    print("after Enter on title:", page.evaluate("__wus.state().mode"))
    page.evaluate("__wus.skipReveal()")
    page.wait_for_timeout(200)
    print("render ms (truth, desktop):", round(page.evaluate("__wus.bench(40)"), 2))
    # grazing inside Rom & Rem's view
    page.evaluate("__wus.tp(840, 400); __wus.face('romrem', 840, 400)")
    page.keyboard.down("Shift"); page.wait_for_timeout(1500)
    s = page.evaluate("__wus.state()"); hidden = page.evaluate("__wus.G.hiddenFrom"); sheepish = page.evaluate("__wus.G.sheepish")
    print("grazing in cone -> alert", round(s["maxAlert"], 3), "modal", s["modal"], "hidden", hidden, "sheepish", sheepish)
    page.keyboard.up("Shift"); page.wait_for_timeout(200)
    # glasses off is also safe
    page.keyboard.press("Space"); page.wait_for_timeout(700)
    page.evaluate("__wus.face('romrem', 840, 400)"); page.wait_for_timeout(1200)
    s = page.evaluate("__wus.state()")
    print("glasses off in cone -> view", s["view"], "alert", round(s["maxAlert"], 3), "modal", s["modal"])
    page.keyboard.press("Space"); page.wait_for_timeout(700)
    # keyboard talk to Barbara
    page.evaluate("__wus.tp(700, 886)"); page.wait_for_timeout(300)
    page.keyboard.press("e"); page.wait_for_timeout(200)
    s = page.evaluate("__wus.state()"); print("E opens dialog:", s["modal"])
    page.keyboard.press("Enter"); page.wait_for_timeout(150)  # finish typing
    page.keyboard.press("1"); page.wait_for_timeout(300)        # ask a question
    print("after 1:", page.evaluate("__wus.choices()"))
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    print("escape picks the only choice:", page.evaluate("__wus.state().modal"), page.evaluate("__wus.choices()"))
    for _ in range(4):
        if page.evaluate("__wus.state().modal") != "dialog": break
        page.evaluate("__wus.choose(__wus.choices().length - 1)"); page.wait_for_timeout(200)
    print("hint after asking:", page.inner_text("#obj-sub"))
    print("talk prompt target:", page.evaluate("__wus.G.talkTarget && __wus.G.talkTarget.id"))
    # pause
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    print("pause visible:", page.is_visible("#scr-pause"), page.evaluate("__wus.state().modal"))
    page.screenshot(path=str(ROOT / "shots/feel-pause.png"))
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    print("resumed:", page.evaluate("__wus.state().modal"))
    # pause -> Main menu, then back into the game
    page.keyboard.press("Escape"); page.wait_for_timeout(200)
    page.click("#btn-pause-menu"); page.wait_for_timeout(400)
    print("main menu from pause:", page.is_visible("#scr-title"), not page.is_visible("#scr-pause"), page.evaluate("__wus.state().mode"))
    page.click("#btn-play"); page.wait_for_timeout(300); page.evaluate("__wus.skipReveal()"); page.wait_for_timeout(300)
    print("playing again:", page.evaluate("__wus.state().mode"), page.evaluate("__wus.state().modal"))
    # rapid toggles
    for _ in range(6): page.keyboard.press("Space"); page.wait_for_timeout(90)
    page.wait_for_timeout(900)
    s = page.evaluate("__wus.state()"); print("after rapid toggles view", s["view"], "specsOn", page.evaluate("__wus.G.player.specsOn"), "class", page.get_attribute("#app", "class"))
    # retry flow
    page.evaluate("__wus.setCred(1); __wus.catchMe('doc')"); page.wait_for_timeout(300)
    page.evaluate("__wus.choose(0)"); page.wait_for_timeout(150); page.evaluate("__wus.choose(0)"); page.wait_for_timeout(700)
    print("ending:", page.evaluate("__wus.state().mode"), page.inner_text("#end-title"))
    page.click("#btn-again"); page.wait_for_timeout(500)
    s = page.evaluate("__wus.state()"); print("retry:", s["phase"], s["px"], s["py"], page.inner_text("#obj-text"))
    page.screenshot(path=str(ROOT / "shots/feel-retry.png"))
    page.close()
    ph = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=3, has_touch=True, is_mobile=True)
    ph.on("pageerror", lambda e: errors.append(str(e)))
    ph.goto(URL); ph.wait_for_timeout(600); ph.tap("#btn-play"); ph.wait_for_timeout(300)
    ph.evaluate("__wus.skipReveal()"); ph.wait_for_timeout(200)
    print("render ms (truth, phone dpr3):", round(ph.evaluate("__wus.bench(40)"), 2))
    ph.evaluate("__wus.tp(700, 886)"); ph.wait_for_timeout(400)
    print("talk button enabled near Barbara:", ph.evaluate("!document.getElementById('t-talk').disabled"))
    ph.tap("#t-talk"); ph.wait_for_timeout(1800)
    ph.screenshot(path=str(ROOT / "shots/feel-phone-dialog.png"))
    b.close()
print("errors:", errors or "none")

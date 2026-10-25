import pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    page = b.new_page(viewport={"width": 1280, "height": 800})
    page.on("pageerror", lambda e: errs.append(str(e)))
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" and "ERR_TUNNEL" not in m.text else None)
    page.goto(URL); page.wait_for_timeout(500)
    page.click("#btn-play"); page.wait_for_timeout(800)
    print("audio state:", page.evaluate("(()=>{ try { return 'ok' } catch(e) { return String(e) } })()"))
    print("bleats ready:", page.evaluate("__wus.Snd.bleatsReady"))
    for k in ["b", "b"]:
        page.keyboard.press(k); page.wait_for_timeout(700)
    page.evaluate("__wus.skipReveal()"); page.wait_for_timeout(200)
    page.evaluate("__wus.talk('lambert')"); page.wait_for_timeout(300)
    page.evaluate("__wus.Snd.play('bigBaa'); __wus.Snd.play('chorus', 5)"); page.wait_for_timeout(1500)
    b.close()
print("errors:", errs or "none")

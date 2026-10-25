import pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for (w, h, touch, tag) in [(844, 390, True, "land"), (768, 1024, True, "tab"), (1280, 800, False, "how")]:
        pg = b.new_page(viewport={"width": w, "height": h}, has_touch=touch, is_mobile=touch)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(700)
        if tag == "how":
            pg.click("#btn-how"); pg.wait_for_timeout(300); pg.screenshot(path=str(ROOT / f"shots/size-{tag}.png")); pg.close(); continue
        pg.screenshot(path=str(ROOT / f"shots/size-{tag}-title.png"))
        pg.tap("#btn-play"); pg.wait_for_timeout(300)
        pg.evaluate("__wus.skipReveal(); __wus.tp(860, 430)"); pg.wait_for_timeout(600)
        pg.screenshot(path=str(ROOT / f"shots/size-{tag}-play.png"))
        sw = pg.evaluate("document.documentElement.scrollWidth"); print(tag, "scrollWidth", sw, "of", w)
        pg.close()
    b.close()
print("errors:", errs or "none")

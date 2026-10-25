import pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
with sync_playwright() as p:
    b = p.chromium.launch(); page = b.new_page(viewport={"width": 1280, "height": 800})
    page.goto(URL); page.wait_for_timeout(600); page.click("#btn-play"); page.wait_for_timeout(300)
    page.evaluate("__wus.skipReveal()"); page.wait_for_timeout(300)
    for spot in [(600, 965), (640, 520), (950, 420), (1040, 980), (2500, 600), (2400, 1400), (750, 2000), (750, 1900, 'pray')]:
        page.evaluate(f"__wus.tp({spot[0]}, {spot[1]})"); page.wait_for_timeout(200)
        if len(spot) > 2: page.evaluate("__wus.setChurch('pray', 0); __wus.G.invuln = 99"); page.wait_for_timeout(100)
        r = [round(page.evaluate("__wus.bench(30)"), 2) for _ in range(3)]
        print(spot, r)
    b.close()

"""Fleeced: sit through the chapel collection with your glasses off (and not with them on)."""
import sys
import pathlib
from playwright.sync_api import sync_playwright
URL=(pathlib.Path(__file__).resolve().parent / 'index.html').as_uri()+"?debug=1"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); errs=[]
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(600); pg.click('#btn-play'); pg.wait_for_timeout(300)
    pg.evaluate("__wus.skipReveal(); __wus.wear(false); __wus.portal('chapel')"); pg.wait_for_timeout(1200)
    pg.evaluate("__wus.tp(340,2040); __wus.setChurch('warn', 0)"); pg.keyboard.down('Shift'); pg.wait_for_timeout(8500); pg.keyboard.up('Shift')
    off = pg.evaluate("__wus.G.ach.has('fleeced')"); print('glasses off:', off)
    pg.evaluate("__wus.G.ach.delete('fleeced'); __wus.wear(true); __wus.setChurch('warn', 0)"); pg.keyboard.down('Shift'); pg.wait_for_timeout(8500); pg.keyboard.up('Shift')
    on = pg.evaluate("__wus.G.ach.has('fleeced')"); print('glasses on (should stay false):', on, errs)
    b.close()
    ok = off and not on and not errs
    print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)

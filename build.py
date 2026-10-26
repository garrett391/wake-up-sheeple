#!/usr/bin/env python3
"""Build Wake Up Sheeple from src/.

Concatenates src/js/*.js (in filename order) into one IIFE, inlines it into src/page.html, and writes:
  index.html              the GitHub Pages copy (full HTML document). Commit this.
  wake-up-sheeple.html    the bare page body, as published to the claude.ai artifact (git-ignored)
  test/index.html         a local copy the Playwright tests load (git-ignored)
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent
page = (root / "src/page.html").read_text()
parts = sorted((root / "src/js").glob("*.js"))
js = "(() => {\n'use strict';\n" + "\n".join(p.read_text() for p in parts) + "\n})();"
assert "</script" not in js, "script text must not close the tag"
# a repeated name in the sound table silently replaces the earlier sound
sfx_at = js.index("const SFX = {")
sfx_names = re.findall(r"^ {4}(\w+)\(", js[sfx_at:js.index("return {", sfx_at)], re.M)
dup = sorted({n for n in sfx_names if sfx_names.count(n) > 1})
assert not dup, f"sound names used twice in SFX: {dup}"
out = page.replace("/*GAME_JS*/", js)
assert '<div id="app"' in out, "page.html must contain the #app element"

# artifact source: the artifact host wraps it in its own document skeleton
(root / "wake-up-sheeple.html").write_text(out)

# GitHub Pages: a complete document, head and body split at the #app element
PAGES_HEAD = (
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<meta name="description" content="Wake Up Sheeple. Put on the glasses, dodge the wolf shepherds, '
    'and wake the flock. Then find out who pulls the strings.">\n'
    "<style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}"
    "[hidden]{display:none!important}</style>\n"
)
i = out.index('<div id="app"')
pages = PAGES_HEAD + out[:i].rstrip() + "\n\n</head>\n<body>\n" + out[i:].rstrip() + "\n\n</body>\n</html>\n"
(root / "index.html").write_text(pages)

# test copy, wrapped like the artifact skeleton
skeleton = (
    '<!doctype html><html><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}"
    "body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>"
    "</head><body>" + out + "</body></html>"
)
(root / "test/index.html").write_text(skeleton)

# screenshot folders the tests write into (git-ignored)
for d in ("shots", "shots/ch2", "shots/church", "shots/audio"):
    (root / d).mkdir(parents=True, exist_ok=True)

print(f"built {len(out):,} bytes from {len(parts)} scripts")

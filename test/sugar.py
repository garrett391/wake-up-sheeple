"""Granny's Bonus Sugar Licks (Chapter 1).
A: waking the 1st sheep drops a lick near them once the screen is quiet, with a paused intro
   (camera pan + dialog) and a slower first walk; kicking it over keeps them awake.
B: a sheep who reaches the lick falls back asleep (Woke -1); one quick talk wakes them again.
C: kicking both licks in one run unlocks Sugar-Free; the 3rd wake-up drops the second lick.
D: the finale clears a live lick; Chapter 2 never drops one.
E: on a phone, the Talk button reads Kick next to a lick."""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / "test/index.html").as_uri() + "?debug=1"
SHOTS = ROOT / "shots"
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
    pg.evaluate("__wus.G.invuln = 1e9")  # the shepherds never catch you here; this test is about the licks
    return b, pg

def ev(pg, js): return pg.evaluate(js)

def first_lick(pg, timeout=40000):
    """Wait for the first lick's intro, check the screen was quiet when it started, then close its dialog."""
    seen = {"cut": False, "quiet": None}
    for _ in range(timeout // 150):
        st = ev(pg, "({m: __wus.G.modal, b: __wus.ui.banner.hidden, n: __wus.ui.toasts.children.length, cam: !!__wus.G.camTarget})")
        if st["m"] == "lickcut" and not seen["cut"]:
            seen["cut"] = True; seen["quiet"] = st["b"] and st["n"] == 0; seen["cam"] = st["cam"]
        if st["m"] == "dialog" and seen["cut"]: break
        pg.wait_for_timeout(150)
    seen["name"] = pg.text_content("#dlg-name")
    ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(150)
    seen["text2"] = ev(pg, "__wus.ui.dlgSr.textContent")
    ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(200)
    seen["after"] = ev(pg, "({m: __wus.G.modal, cam: !!__wus.G.camTarget})")
    return seen

def wake_barbara(pg):
    ev(pg, "__wus.give('label')"); ev(pg, "__wus.tp(700, 886)")
    ev(pg, "__wus.talk('barbara')"); pg.wait_for_timeout(150)
    for i in [1, 0, 0]: ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(150)

with sync_playwright() as p:
    # A: the first wake-up queues a lick; it drops a few seconds later
    b, pg = start(p)
    wake_barbara(pg)
    s = ev(pg, "__wus.state()"); print("A woke:", s["woke"], ev(pg, "__wus.lick()"))
    banner_after_wake = ev(pg, "__wus.ui.banner.hidden"); t0 = ev(pg, "__wus.G.time")
    ev(pg, "__wus.tp(330, 950)")  # stand away from Barbara so the lick can land
    intro = first_lick(pg); waited = ev(pg, "__wus.G.time") - t0
    L = ev(pg, "__wus.lick()"); print("A intro:", intro, "waited", round(waited, 1), "s; lick:", L)
    checks["no_wake_banner"] = banner_after_wake
    checks["intro"] = intro["cut"] and intro["quiet"] and intro["cam"] and intro["name"] == "Bonus Sugar Licks" and "kick it over" in intro["text2"]
    checks["intro_closed"] = intro["after"] == {"m": None, "cam": False}
    checks["quiet_wait"] = waited >= 6
    checks["slow_first"] = ev(pg, "__wus.G.lick.speed") == 9
    checks["drop"] = L.get("sheep") == "barbara"
    print("A objective:", ev(pg, "__wus.ui.objText.textContent"))
    checks["objective"] = "sugar lick" in ev(pg, "__wus.ui.objText.textContent")
    ev(pg, f"__wus.tp({L['x']}, {L['y'] - 60})"); pg.wait_for_timeout(250)
    pg.screenshot(path=str(SHOTS / "sugar-01-lick-truth.png"))
    ev(pg, "__wus.wear(false)"); pg.wait_for_timeout(250)
    pg.screenshot(path=str(SHOTS / "sugar-02-lick-candy.png"))
    ev(pg, "__wus.wear(true)")
    ev(pg, f"__wus.tp({L['x'] + 30}, {L['y'] + 10})"); pg.wait_for_timeout(200)
    it = ev(pg, "__wus.interact()"); print("A interact:", it)
    checks["prompt"] = bool(it) and it["kind"] == "lick"
    pg.keyboard.press("e"); pg.wait_for_timeout(300)
    L2 = ev(pg, "__wus.lick()"); bar = ev(pg, "__wus.sheep('barbara')"); print("A after kick:", L2, bar)
    checks["kick"] = "sheep" not in L2 and L2["kicked"] == 1 and bar["state"] == "woke" and ev(pg, "__wus.state()")["woke"] == 1
    pg.wait_for_timeout(3000)
    checks["no_second_drop"] = "sheep" not in ev(pg, "__wus.lick()")

    # B: let a lick get eaten
    ev(pg, "__wus.G.lickDue = 1")
    ok = ev(pg, "__wus.dropLick('barbara')"); L = ev(pg, "__wus.lick()"); print("B drop:", ok, L)
    checks["second_no_intro"] = ev(pg, "__wus.G.modal") is None and ev(pg, "__wus.G.lick.speed") == 15
    ev(pg, "__wus.talk('barbara')"); pg.wait_for_timeout(150)
    lure_txt = ev(pg, "__wus.ui.dlgSr.textContent"); print("B lured talk:", lure_txt)
    checks["lure_talk"] = lure_txt in ["Can't talk. Sugar.", "Shh. There's a sugar lick right there. It's FREE.", "Just one lick. Then we'll talk. Promise."]
    ev(pg, "__wus.choose(0)")
    ev(pg, f"__wus.G.sheep.find(s => s.id === 'barbara').x = {L['tx'] - 12}; __wus.G.sheep.find(s => s.id === 'barbara').y = {L['ty']}")
    ev(pg, "__wus.tp(330, 950)")
    pg.wait_for_timeout(4200)
    bar = ev(pg, "__wus.sheep('barbara')"); s = ev(pg, "__wus.state()"); print("B after crash:", bar, s["woke"], ev(pg, "__wus.lick()"))
    checks["crash"] = bar["state"] == "asleep" and s["woke"] == 0
    ev(pg, f"__wus.tp({bar['x'] + 40}, {bar['y']})")
    ev(pg, "__wus.talk('barbara')"); pg.wait_for_timeout(150)
    ch = ev(pg, "__wus.choices()"); print("B choices:", ch)
    checks["remind_option"] = ch[0].startswith("1Remind her")
    ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(150); ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(300)
    s = ev(pg, "__wus.state()"); wp = ev(pg, "__wus.G.wokePersonal")
    print("B rewoke:", ev(pg, "__wus.sheep('barbara')")["state"], s["woke"], "personal", wp)
    checks["rewake"] = s["woke"] == 1 and wp == 1
    b.close()

    # C: two kicks in one run, with the second lick coming from the 3rd wake-up
    b, pg = start(p)
    wake_barbara(pg)
    ev(pg, "__wus.tp(330, 950)"); first_lick(pg)
    ev(pg, "__wus.kick()")
    ev(pg, "__wus.G.woke = 2; __wus.G.flags.heat2 = true")
    ev(pg, "__wus.give('checks')"); ev(pg, "__wus.tp(1080, 440)")
    ev(pg, "__wus.talk('doug')"); pg.wait_for_timeout(150)
    for i in [1, 1, 0]: ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(150)
    print("C after doug:", ev(pg, "__wus.state()")["woke"], ev(pg, "__wus.lick()"))
    checks["gap_respected"] = ev(pg, "__wus.G.lickCd") > 15  # licks are at least 22 s apart
    ev(pg, "__wus.G.lickCd = 0.1")  # skip ahead instead of waiting out the gap
    ev(pg, "__wus.tp(330, 950)")
    for _ in range(100):  # the second lick waits for the wake-up toasts to clear
        if "sheep" in ev(pg, "__wus.lick()"): break
        pg.wait_for_timeout(150)
    L = ev(pg, "__wus.lick()"); print("C second lick:", L)
    checks["third_wake_drop"] = L.get("sheep") in ("barbara", "doug")
    ev(pg, "__wus.kick()"); pg.wait_for_timeout(200)
    got = ev(pg, "__wus.G.ach.has('sugarfree')"); print("C sugar-free:", got)
    checks["achievement"] = got

    # D: the finale clears a live lick
    ev(pg, "__wus.G.lickDue = 1"); ev(pg, "__wus.dropLick()")
    had = "sheep" in ev(pg, "__wus.lick()")
    ev(pg, "__wus.give('prices')"); ev(pg, "__wus.tp(420, 860)")
    ev(pg, "__wus.talk('shirley')"); pg.wait_for_timeout(150)
    for i in [1, 1, 0]: ev(pg, f"__wus.choose({i})"); pg.wait_for_timeout(150)
    pg.wait_for_timeout(1200)
    s = ev(pg, "__wus.state()"); L = ev(pg, "__wus.lick()")
    lured = ev(pg, "__wus.G.sheep.filter(s => s.lure).length")
    print("D herd:", had, s["phase"], s["woke"], L, "lured:", lured)
    checks["herd_clears"] = had and s["phase"] == "herd" and "sheep" not in L and lured == 0
    b.close()

    # Chapter 2 never drops a lick
    b, pg = start(p)
    ev(pg, "__wus.ch2()"); pg.wait_for_timeout(500)
    ev(pg, "__wus.skipReveal()"); ev(pg, "__wus.convince('barbara')"); pg.wait_for_timeout(5000)
    L = ev(pg, "__wus.lick()"); print("ch2 lick:", L)
    checks["ch2_none"] = "sheep" not in L and L["due"] == 0
    b.close()

    # E: phone label
    b, pg = start(p, 390, 844, True)
    wake_barbara(pg)
    ev(pg, "__wus.tp(330, 950)")
    for _ in range(260):
        if ev(pg, "__wus.G.modal") == "dialog" and ev(pg, "!!__wus.G.lick"): break
        pg.wait_for_timeout(150)
    pg.wait_for_timeout(1500); pg.screenshot(path=str(SHOTS / "sugar-05-phone-intro.png"))
    ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(150); ev(pg, "__wus.choose(0)"); pg.wait_for_timeout(200)
    L = ev(pg, "__wus.lick()")
    pg.screenshot(path=str(SHOTS / "sugar-03-phone-arrow.png"))
    ev(pg, f"__wus.tp({L['x'] + 30}, {L['y'] + 10})"); pg.wait_for_timeout(300)
    lbl = pg.text_content("#t-talk"); print("E touch label:", lbl)
    pg.screenshot(path=str(SHOTS / "sugar-04-phone-kick.png"))
    checks["touch_label"] = lbl == "Kick"
    pg.tap("#t-talk"); pg.wait_for_timeout(300)
    checks["touch_kick"] = "sheep" not in ev(pg, "__wus.lick()")
    b.close()

print(checks)
print("errors:", errs or "none")
print("PASS" if all(checks.values()) and not errs else "FAIL")

#!/usr/bin/env python3
"""Собирает бандл дизайн-системы сайта в design-system/ для заливки в Claude Design.

Сайт — «как игра»: один экран без прокрутки, главное меню, экраны разделов со
сменой шторкой, HUD, мониторы камер, слоты снаряжения; служебные страницы — как
досье. Каждое превью — самодостаточный HTML с инлайн-CSS (fonts, fonts-geist,
game, doc) и первой строкой `<!-- @dsCard group="…" name="…" viewport="…" -->`,
по которой панель Design System строит карточки. Шрифты и кадры — рядом.

  python3 tools/build_design_system.py

Дальше заливка через DesignSync: finalize_plan(localDir=design-system, deletes=[]) → write_files.
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DS = os.path.join(ROOT, "design-system")


def read(rel: str) -> str:
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def write(rel: str, text: str) -> None:
    path = os.path.join(DS, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def section(html: str, pattern: str) -> str:
    match = re.search(pattern, html, flags=re.S)
    if not match:
        raise SystemExit(f"не найден фрагмент: {pattern[:40]}")
    return re.sub(r'(src|href|srcset)="assets/', r'\1="../assets/', match.group(0))


def main() -> None:
    shutil.rmtree(DS, ignore_errors=True)
    for sub in ("tokens", "components", "pages", "fonts", "assets/img/real", "assets/audio"):
        os.makedirs(os.path.join(DS, sub), exist_ok=True)

    css = "\n".join(read(f"assets/css/{n}.css") for n in ("fonts", "fonts-geist", "game", "doc"))
    css = css.replace("url('../img/", "url('../assets/img/")
    game_js = read("assets/js/game.js")
    index = read("index.html")
    privacy = read("privacy.html")
    android = read("android.html")

    for name in os.listdir(os.path.join(ROOT, "assets/fonts")):
        shutil.copy(os.path.join(ROOT, "assets/fonts", name), os.path.join(DS, "fonts", name))
    for name in os.listdir(os.path.join(ROOT, "assets/img/real")):
        shutil.copy(os.path.join(ROOT, "assets/img/real", name), os.path.join(DS, "assets/img/real", name))
    for name in os.listdir(os.path.join(ROOT, "assets/audio")):
        shutil.copy(os.path.join(ROOT, "assets/audio", name), os.path.join(DS, "assets/audio", name))
    for name in ("og.jpg", "favicon-32.png"):
        shutil.copy(os.path.join(ROOT, "assets/img", name), os.path.join(DS, "assets/img", name))

    # Превью без JS: экраны стоят как обычные блоки, шторка — в середине кадра.
    still = """
.screen{position:relative;display:flex;flex-direction:column}
.screen--menu{height:900px}
.top,.hint{position:relative}
.scene{display:block;position:relative;height:300px}
.scene .scene__band{clip-path:inset(0)}
.scene .scene__load i{transform:scaleX(.62)}
.scene .scene__sweep{opacity:1;background-position:50% 0,0 0,0 0}
"""

    def card(title: str, body: str, group: str, viewport: str, extra: str = "", script: str = "", cls: str = "") -> str:
        js = f"<script>\n{script}\n</script>" if script else ""
        return (
            f'<!-- @dsCard group="{group}" name="{title}" viewport="{viewport}" -->\n'
            "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
            f"<title>{title} — SnowOps DS</title>\n<style>\n{css}\n{still}\n{extra}\n</style>\n</head>\n"
            f"<body class=\"{cls}\">\n{body}\n{js}\n</body>\n</html>\n"
        )

    def full_page(src: str, title: str, js: bool) -> str:
        page = re.sub(r'\s*<link rel="stylesheet" href="assets/css/[a-z-]+\.css(\?v=[0-9a-z]+)?">', "", src)
        page = page.replace("</head>", "<style>\n" + css + "\n</style>\n</head>", 1)
        inline = f"<script>\n{game_js}\n</script>" if js else ""
        page = re.sub(r'<script src="assets/js/game\.js(\?v=[0-9a-z]+)?" defer></script>', lambda m: inline, page)
        page = re.sub(r'(src|href|srcset)="assets/', r'\1="../assets/', page)
        page = page.replace('href="../assets/fonts/', 'href="../fonts/')
        page = page.replace('<html lang="ru" class="no-js">', '<html lang="ru" class="no-js" data-root="../">')
        return f'<!-- @dsCard group="Страницы" name="{title}" viewport="1440x900" -->\n' + page

    write("pages/landing.html", full_page(index, "Главная: меню и экраны (живая)", True))
    write("pages/document.html", full_page(privacy, "Документ: политика", False))

    colors = [
        ("--night", "#0b1420", "Фон, ночь над базой"),
        ("--night-2", "#101c2c", "Второй фон экранов"),
        ("--steel", "#2b3d57", "Сталь: полосы загрузки, подложки"),
        ("--steel-2", "#1a2738", "Экран «Разведка»"),
        ("--snow", "#eef3f8", "Основной текст"),
        ("--mute", "#9db2c9", "Вторичный текст, подписи HUD"),
        ("--dim", "#6f8399", "Приглушённое, номера слотов"),
        ("--red", "#e5322b", "Единственный акцент: маяк, «Начать миссию», REC, «!», выбор"),
        ("--amber", "#f2b33d", "«?» — охрана сомневается; заметки"),
        ("--paper", "#f4f3ee", "Бумага брифинга"),
        ("--ink", "#141413", "Текст на бумаге"),
    ]
    sw = "".join(f'<li><span class="sw" style="background:{hx}"></span><b>{v}</b><code>{hx}</code><span>{r}</span></li>' for v, hx, r in colors)
    write("tokens/colors.html", card("Цвета", f'<main class="wrap" style="padding:48px 0"><p class="label">Токены</p><h2>Палитра</h2><p style="color:var(--mute);max-width:62ch;margin-top:12px">Ночь над базой, снег, сталь. Красный — один акцент, тратится на действие и тревогу. Янтарь — только «?».</p><ul class="swatches">{sw}</ul></main>', "Токены", "1200x760", """
.swatches{margin-top:28px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.swatches li{display:grid;grid-template-columns:56px 1fr;gap:2px 14px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--night-2)}
.swatches .sw{grid-row:1/3;width:56px;height:56px;border-radius:6px;box-shadow:0 0 0 1px rgba(238,243,248,.2)}
.swatches b{font:500 13px var(--mono)}.swatches code{font:12px var(--mono);color:var(--mute)}
.swatches span:last-child{grid-column:2;font-size:13px;color:var(--dim)}"""))
    write("tokens/type.html", card("Типографика", """<main class="wrap" style="padding:48px 0;display:grid;gap:34px">
<div><p class="label">Tektur 700 — логотип, заголовки экранов, пункты меню, капсом</p><p class="title__name" style="font-size:120px">SNOWOPS</p><h2>Как думает охрана</h2></div>
<div><p class="label">Geist 400/500/600 — текст и кнопки</p><p style="max-width:62ch;font-size:17px;margin-top:10px">Часовой не стреляет с первого взгляда. Сначала «?» — остановится, всмотрится, пойдёт проверить.</p></div>
<div><p class="label">Geist Mono 500 — метки, HUD, счётчики, капсом с разрядкой</p><p style="font:500 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-top:10px">ALPHA.11 · ДЕМО · РАБОТАЕТ ОФЛАЙН &nbsp; КАМ 03 · ВЫШКА &nbsp; ДОНЕСЕНИЕ 2 / 6</p></div>
</main>""", "Токены", "1200x700"))

    write("components/main-menu.html", card("Главное меню поверх кадра", section(index, r'<section class="screen screen--menu".*?</section>'), "Экраны", "1440x900"))
    write("components/chrome.html", card("Вкладки сверху и полоса снизу", section(index, r'<header class="top".*?</header>') + '<div style="height:140px"></div>' + section(index, r'<footer class="hint".*?</footer>'), "Компоненты", "1440x260", ".hint__count::after{content:'Донесение 2 / 6'}"))
    write("components/scene.html", card("Смена экрана: шторка-титр", section(index, r'<div class="scene".*?</div>\s*</div>').replace("Загрузка<", "Загрузка · 02 / 05<").replace(">Брифинг<", ">Как думает охрана<"), "Компоненты", "1440x300"))
    write("components/intel.html", card("Камера: донесения и монитор", section(index, r'<section class="screen" id="intel".*?</section>'), "Экраны", "1440x900", "#intel{height:900px}"))
    write("components/recon.html", card("Пульт охраны: большой монитор и 8 каналов", section(index, r'<section class="screen screen--steel" id="recon".*?</section>'), "Экраны", "1440x900", "#recon{height:900px}"))
    gear = section(index, r'<ul class="loadout pager".*?</ul>').replace('<li class="page gear" data-os="windows">', '<li class="page gear is-mine" data-os="windows"><p class="gear__mine">Ваша система</p>', 1)
    write("components/gear.html", card("Слоты снаряжения, «Ваша система»", f'<main class="wrap" style="padding:48px 0">{gear}</main>', "Компоненты", "1440x520"))
    write("components/document.html", card("Документ: оглавление, callout, пункты", section(privacy, r'<header class="legal-hero">.*?</header>') + section(privacy, r'<section class="legal">.*?(?=<h2 id="no-collection">)') + "</article></div></section>", "Документы", "1440x900", "", "", "doc"))
    qr = section(android, r'<section class="get">.*?</section>').replace('<canvas id="qr" width="240" height="240"', '<canvas id="qr" width="240" height="240" style="background:repeating-conic-gradient(#0b1420 0 25%,#fff 0 50%) 0 0/24px 24px"')
    write("components/qr.html", card("QR для Android: карточка снаряжения", qr, "Документы", "720x900", "", "", "doc"))

    write("README.md", read("tools/design_system_README.md"))
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(DS) for f in fs]
    total = sum(os.path.getsize(f) for f in files) // 1024
    print(f"собрано {len(files)} файлов, {total} KiB")


if __name__ == "__main__":
    main()

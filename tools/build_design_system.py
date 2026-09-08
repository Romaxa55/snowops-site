#!/usr/bin/env python3
"""Собирает бандл дизайн-системы сайта в design-system/ для заливки в Claude Design.

Каждое превью — самодостаточный HTML с инлайн-CSS и первой строкой
`<!-- @dsCard group="…" name="…" viewport="…" -->`, по которой панель
Design System строит карточки. Шрифты кладутся рядом (fonts/*.woff2).

  python3 tools/build_design_system.py

Дальше заливка через DesignSync: finalize_plan(localDir=design-system, deletes=[]) → write_files.
"""
import os
import re
import shutil
import subprocess

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
    return match.group(0).replace('="assets/', '="../assets/')


def main() -> None:
    shutil.rmtree(DS, ignore_errors=True)
    for sub in ("tokens", "components", "pages", "css", "fonts", "assets/img/shots"):
        os.makedirs(os.path.join(DS, sub), exist_ok=True)

    site_css = read("assets/css/site.css")
    fonts_css = read("assets/css/fonts.css")
    site_js = read("assets/js/site.js")
    index = read("index.html")
    privacy = read("privacy.html")
    inline_css = fonts_css + "\n" + site_css.replace("url(assets/img/", "url(../assets/img/")

    # файлы
    for name in os.listdir(os.path.join(ROOT, "assets/fonts")):
        shutil.copy(os.path.join(ROOT, "assets/fonts", name), os.path.join(DS, "fonts", name))
    write("css/fonts.css", fonts_css)
    write("css/site.css", site_css.replace("url(assets/img/", "url(../assets/img/"))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", os.path.join(ROOT, "assets/img/hero.jpg"),
                    "-vf", "scale=1600:-2", "-q:v", "4", os.path.join(DS, "assets/img/hero.jpg")], check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", os.path.join(ROOT, "assets/img/hero.webp"),
                    "-vf", "scale=1600:-2", "-c:v", "libwebp", "-quality", "80", os.path.join(DS, "assets/img/hero.webp")], check=True)
    for name in ("icon-192.png", "hero-poster.jpg", "og.jpg"):
        shutil.copy(os.path.join(ROOT, "assets/img", name), os.path.join(DS, "assets/img", name))
    for name in os.listdir(os.path.join(ROOT, "assets/img/shots")):
        if name.endswith(".jpg"):
            shutil.copy(os.path.join(ROOT, "assets/img/shots", name), os.path.join(DS, "assets/img/shots", name))

    def shell(title: str, body: str, group: str, extra_css: str = "", viewport: str = "", script: str = "") -> str:
        vp = f' viewport="{viewport}"' if viewport else ""
        js = f"<script>\n{script}\n</script>" if script else ""
        return (
            f'<!-- @dsCard group="{group}" name="{title}"{vp} -->\n'
            "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
            f"<title>{title} — SnowOps DS</title>\n<style>\n{inline_css}\n{extra_css}\n</style>\n</head>\n"
            f"<body class=\"ds\">\n{body}\n{js}\n</body>\n</html>\n"
        )

    def full_page(src: str, title: str) -> str:
        page = src.replace(
            '  <link rel="stylesheet" href="assets/css/fonts.css">\n  <link rel="stylesheet" href="assets/css/site.css">\n',
            f"  <style>\n{inline_css}\n  </style>\n",
        )
        page = page.replace('<script src="assets/js/site.js" defer></script>', f"<script>\n{site_js}\n</script>")
        page = re.sub(r'(src|href|srcset)="assets/', r'\1="../assets/', page)
        page = page.replace('href="index.html', 'href="landing.html')
        return f'<!-- @dsCard group="Страницы" name="{title}" viewport="1440x900" -->\n' + page

    write("pages/landing.html", full_page(index, "Лендинг целиком"))
    write("pages/privacy.html", full_page(privacy, "Юридическая страница"))

    colors = [
        ("--night", "#0b1420", "Фон, ночь над базой"),
        ("--night-2", "#0f1a2a", "Чередующийся фон секций"),
        ("--steel", "#16243a", "Поверхности, карточки, плашки"),
        ("--rail", "#2b3d57", "Линейки, рамки"),
        ("--snow", "#eef3f8", "Основной текст, primary-кнопка"),
        ("--ice", "#9db2c9", "Вторичный текст (8.5:1 на night)"),
        ("--ice-dim", "#6e849c", "Приглушённое"),
        ("--beacon", "#e5322b", "Единственный акцент: маяк на вышке и точка у логотипа"),
        ("--lamp", "#f2b24a", "Фокус-обводка, планка callout"),
    ]
    swatches = "".join(
        f'<li><span class="sw" style="background:{hx}"></span><b>{var}</b><code>{hx}</code><span>{role}</span></li>'
        for var, hx, role in colors
    )
    write("tokens/colors.html", shell("Цвета", f"""
<main class="wrap" style="padding:48px 0">
<h2>Палитра</h2>
<p style="color:var(--ice);max-width:60ch;margin-top:12px">Снята с ключевого арта. Один акцент, красный маяк, тратится в двух местах: точка у логотипа и сам маяк на вышке в hero. Всё остальное холодное и тихое.</p>
<ul class="swatches">{swatches}</ul>
</main>""", "Токены", """
.swatches{list-style:none;margin:32px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.swatches li{display:grid;grid-template-columns:56px 1fr;grid-template-rows:auto auto;gap:2px 14px;align-items:center;padding:12px;border:1px solid var(--rail);border-radius:6px;background:var(--night-2)}
.swatches .sw{grid-row:1/3;width:56px;height:56px;border-radius:6px;box-shadow:0 0 0 1px rgba(157,178,201,.25)}
.swatches b{font-family:var(--font-display);font-weight:500}
.swatches code{font-size:.85rem;color:var(--ice)}
.swatches span:last-child{grid-column:2;font-size:.85rem;color:var(--ice-dim)}
""", "1200x700"))

    write("tokens/type.html", shell("Типографика", """
<main class="wrap" style="padding:48px 0;display:grid;gap:40px">
<div><p style="color:var(--ice)">Tektur 700, заголовок первого уровня, uppercase только для логотипа</p>
<h1 class="hero__title" style="font-size:7rem">SnowOps<span>Тактический стелс-шутер для телефона</span></h1></div>
<div><p style="color:var(--ice)">Tektur 700, h2, clamp(2rem, 4.2vw, 3.25rem)</p><h2>Тихо зашёл. Тихо вышел.</h2></div>
<div><p style="color:var(--ice)">Tektur 700, h3 в досье особенностей</p><h3 style="font-weight:700;font-size:2.1rem">Патрули ходят по маршрутам</h3></div>
<div><p style="color:var(--ice)">Golos Text 400, основной текст 17px/1.6, строка до 62ch</p>
<p style="max-width:62ch">Здесь нет укрытий с регенерацией и стрелочки к цели. Есть бинокль, карта, патрули по расписанию и много снега, на котором тебя хорошо видно.</p></div>
<div><p style="color:var(--ice)">HUD-подпись на арте: Tektur 500 0.85rem + Golos 0.75rem ice</p>
<div style="position:relative;height:60px"><span class="mark" style="display:block;opacity:1;position:absolute;left:0;top:30px"><b>Радиовышка</b><small>1 240 м. Маяк работает</small></span></div></div>
</main>""", "Токены", "", "1200x960"))

    hero_js = site_js[site_js.index("/* ---------- Hero"):site_js.index("/* ---------- Кадры")]
    write("components/nav.html", shell("Навигация", section(index, r'<nav class="nav".*?</nav>').replace('class="nav"', 'class="nav nav--solid"') + '<div style="height:120px"></div>', "Компоненты", ".nav{position:static}", "1440x140"))
    write("components/buttons.html", shell("Кнопки", """
<main class="wrap" style="padding:48px 0;display:grid;gap:28px">
<div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary" href="#">Скачать</a><a class="btn btn--ghost" href="#">Смотреть трейлер</a><button class="nav__toggle" style="display:inline-block">Меню</button><button class="shots-nav__btn" aria-label="Следующий"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button></div>
<p style="color:var(--ice);max-width:60ch">Primary: снег на ночи. Ghost: контур на полупрозрачном. Круглые: стрелки карусели. Текст кнопки называет действие. Фокус: обводка цвета лампы.</p>
</main>""", "Компоненты", "", "900x300"))
    write("components/hero.html", shell("Hero: арт, маяк, HUD-подписи", section(index, r'<header class="hero".*?</header>'), "Секции", "", "1440x900", "(function(){" + hero_js + "})();"))
    write("components/about.html", shell("Об игре: текст, факты, телефон", section(index, r'<section class="section" id="about".*?</section>'), "Секции", "", "1440x820"))
    write("components/dossier.html", shell("Досье особенностей", section(index, r'<section class="section section--steel" id="features".*?</section>'), "Секции", "", "1440x980"))
    write("components/shots.html", shell("Кадры: карусель, счётчик, стрелки", section(index, r'<section class="section" id="shots".*?</section>'), "Секции", "", "1440x700"))
    write("components/store-cards.html", shell("Скачать: карточки магазинов", section(index, r'<section class="section" id="download".*?</section>'), "Секции", "", "1440x560"))
    write("components/footer.html", shell("Футер", section(index, r'<footer class="footer">.*?</footer>'), "Компоненты", "", "1440x220"))
    toc = section(privacy, r'<nav aria-label="Содержание">.*?</nav>')
    callout = section(privacy, r'<article class="legal__body">.*?(?=<h2 id="scope">)') + "</article>"
    write("components/legal-layout.html", shell("Юридическая раскладка: оглавление, callout", f'<section class="legal"><div class="wrap">{toc}{callout}</div></section>', "Компоненты", ".legal{padding-block:32px}", "1200x520"))

    write("README.md", read("tools/design_system_README.md"))
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(DS) for f in fs]
    total = sum(os.path.getsize(f) for f in files) // 1024
    print(f"собрано {len(files)} файлов, {total} KiB")


if __name__ == "__main__":
    main()

<p align="right"><b>Русский</b> · <a href="README.en.md">English</a></p>

<p align="center">
  <a href="https://romaxa55.github.io/snowops-site/"><img src="assets/img/og.jpg" alt="SnowOps: оперативник в белом камуфляже смотрит в бинокль на заснеженную военную базу с радиовышкой" width="100%"></a>
</p>

<h1 align="center">SnowOps</h1>
<p align="center">Тактический стелс-шутер для телефона и ПК. База за Полярным кругом. Один оперативник. Никто не должен узнать, что ты здесь был.</p>

<p align="center">
  <a href="https://github.com/Romaxa55/snowops-site/releases/latest"><img alt="Последняя сборка" src="https://img.shields.io/github/v/release/Romaxa55/snowops-site?include_prereleases&label=%D1%81%D0%B1%D0%BE%D1%80%D0%BA%D0%B0&color=e5322b"></a>
  <a href="https://github.com/Romaxa55/snowops-site/releases"><img alt="Загрузок" src="https://img.shields.io/github/downloads/Romaxa55/snowops-site/total?label=%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BE%D0%BA&color=2b3d57"></a>
  <a href="https://romaxa55.github.io/snowops-site/"><img alt="Сайт" src="https://img.shields.io/badge/%D1%81%D0%B0%D0%B9%D1%82-snowops-eef3f8?labelColor=0b1420"></a>
  <img alt="Godot 4.7" src="https://img.shields.io/badge/Godot-4.7-478cbf?logo=godotengine&logoColor=white">
  <img alt="16+" src="https://img.shields.io/badge/16%2B-%D0%B2%D0%BE%D0%B7%D1%80%D0%B0%D1%81%D1%82-9db2c9?labelColor=0b1420">
</p>

---

## Что это

SnowOps — одиночная кампания про оперативника, которого высаживают у полярной военной базы с одним заданием: пройти внутрь, сделать дело и исчезнуть до рассвета.

Здесь нет укрытий с регенерацией и стрелочки к цели. Есть бинокль, карта, патрули по расписанию и много снега, на котором тебя хорошо видно. Как в шутерах конца девяностых, только на экране телефона. Игра работает полностью офлайн: без интернета, аккаунтов, рекламы и покупок.

## Скачать тестовую сборку

Игра в **альфе**: может падать, тормозить и удивлять. Именно поэтому нужны тестеры. Все сборки лежат в [релизах этого репозитория](https://github.com/Romaxa55/snowops-site/releases/latest), контрольные суммы в `SHA256SUMS`.

| Платформа | Файл | Как запустить |
|---|---|---|
| Android 8.0+, arm64 | `SnowOps-vX-android-arm64.apk` | Разрешить установку из неизвестных источников, открыть APK |
| Windows 10/11, x86_64 | `SnowOps-vX-windows-x86_64.zip` | Распаковать, запустить `SnowOps.exe` |
| Linux, x86_64 и arm64 | `SnowOps-vX-linux.tar.gz` | `tar xzf`, запустить `SnowOps.x86_64` или `SnowOps.arm64`, общий `SnowOps.pck` рядом |
| macOS 11+, universal | `SnowOps-vX-macos-universal.zip` | Правый клик → Открыть, либо `xattr -dr com.apple.quarantine SnowOps.app` |

Сборка без нотаризации Apple и без страниц в магазинах: это тестовый этап. Когда игра выйдет в Google Play, App Store и RuStore, ссылки появятся на [сайте](https://romaxa55.github.io/snowops-site/#download).

## Кадры

<table>
  <tr>
    <td><img src="assets/img/shots/01.jpg" alt="Разведка с гребня: оперативник с биноклем смотрит на базу"></td>
    <td><img src="assets/img/shots/02.jpg" alt="Оперативник на лестнице товарного вагона, состав идёт к базе"></td>
  </tr>
  <tr>
    <td><em>Разведка с гребня. База внизу, до смены караула двенадцать минут.</em></td>
    <td><em>Товарный состав идёт к базе. Лучший способ попасть внутрь без пропуска.</em></td>
  </tr>
  <tr>
    <td><img src="assets/img/shots/03.jpg" alt="Периметр базы: прожектор, оперативник у бетонной стены, охранник на мостике"></td>
    <td><img src="assets/img/shots/04.jpg" alt="Оперативник поднимается по обледеневшей радиовышке под северным сиянием"></td>
  </tr>
  <tr>
    <td><em>Периметр. Прожектор возвращается каждые восемь секунд.</em></td>
    <td><em>Радиовышка. Пока горит красный, связь у них есть.</em></td>
  </tr>
</table>

<p align="center"><img src="assets/img/shots/05.jpg" alt="Гараж базы: грузовик выезжает в метель, оперативник за ящиками" width="70%"><br><em>Гараж. Грузовик уходит через минуту, с тобой или без.</em></p>

## Что здесь есть

- **Патрули ходят по маршрутам.** Охрана обходит периметр по расписанию, камеры поворачиваются, прожекторы ищут в темноте. Запомни ритм, найди дыру и проскользни. Или подними тревогу и разбирайся с последствиями.
- **База живёт без тебя.** Товарные составы идут по расписанию, грузовик выезжает из гаража, караул меняется по часам. Любое из этого можно использовать как прикрытие.
- **Бинокль важнее автомата.** Открытые пространства и дальние дистанции. Сначала рассмотри, потом планируй, потом стреляй, если без этого не обойтись.
- **Сделано под телефон.** Крупные кнопки, раскладка под большие пальцы, короткие сессии. Игра не просит интернета, аккаунта и лишних разрешений.

## Статус и планы

| Сейчас | Дальше |
|---|---|
| Альфа, русский язык, один уровень для прохождения | Английская версия, собственные модели и уровни, выход в Google Play, App Store и RuStore, затем Steam |

Игра делается на [Godot 4.7](https://godotengine.org). Сборки собираются автоматически из приватного репозитория с кодом по релизному тегу и публикуются сюда.

## Сайт и документы

- Сайт: <https://romaxa55.github.io/snowops-site/>
- [Политика конфиденциальности](https://romaxa55.github.io/snowops-site/privacy.html) · [Пользовательское соглашение](https://romaxa55.github.io/snowops-site/terms.html) · [Удаление данных](https://romaxa55.github.io/snowops-site/data-deletion.html) · [Поддержка](https://romaxa55.github.io/snowops-site/support.html)

Этот репозиторий — исходники сайта (статический HTML, без сборки) и площадка для релизов. Код самой игры здесь не публикуется.

## Обратная связь

Нашли ошибку, игра не запускается или есть идея: [Issues](https://github.com/Romaxa55/snowops-site/issues) или письмо на <support@snowops.game>. Укажите модель устройства, версию системы и версию игры из названия файла.

---

<p align="center">© 2026 SnowOps. Все права на игру, её название и материалы принадлежат разработчику.<br>Google Play, App Store и RuStore являются товарными знаками их правообладателей.</p>

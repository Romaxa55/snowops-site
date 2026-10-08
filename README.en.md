<p align="right"><a href="README.md">Русский</a> · <b>English</b></p>

<p align="center">
  <a href="https://romaxa55.github.io/snowops-site/"><img src="assets/img/og.jpg" alt="SnowOps: a radio mast over a snowbound military base, in-game shot" width="100%"></a>
</p>

<h1 align="center">SnowOps</h1>
<p align="center">A tactical stealth shooter for phone and PC. A base beyond the Arctic Circle. One operative. Nobody must ever know you were here.</p>

<p align="center">
  <a href="https://github.com/Romaxa55/snowops-site/releases/latest"><img alt="Latest build" src="https://img.shields.io/github/v/release/Romaxa55/snowops-site?include_prereleases&label=build&color=e5322b"></a>
  <a href="https://github.com/Romaxa55/snowops-site/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/Romaxa55/snowops-site/total?label=downloads&color=2b3d57"></a>
  <a href="https://romaxa55.github.io/snowops-site/"><img alt="Website" src="https://img.shields.io/badge/website-snowops-eef3f8?labelColor=0b1420"></a>
  <img alt="Godot 4.7" src="https://img.shields.io/badge/Godot-4.7-478cbf?logo=godotengine&logoColor=white">
  <img alt="16+" src="https://img.shields.io/badge/16%2B-age%20rating-9db2c9?labelColor=0b1420">
</p>

---

## What it is

SnowOps is a single mission on a snowbound military base above the Arctic Circle. You are dropped from a helicopter onto the roof of a moving train; from there you are on your own: over the fence, past the towers and patrols, to the truck at the main gate.

There is no arrow pointing at the objective and no health that regenerates behind cover. There are the guards' eyes to fool, and a silence that a single shot can break. Thirty-six guards live by the regulations: they change posts, report on the radio and search for the missing. The game works fully offline: no internet, no accounts, no ads, no purchases.

## Download a test build

The game is in **alpha**: it may crash, stutter and surprise you. That is exactly why testers are needed. All builds live in [this repository's releases](https://github.com/Romaxa55/snowops-site/releases/latest); checksums are in `SHA256SUMS`.

| Platform | File | How to run |
|---|---|---|
| Android 8.0+, arm64 | `SnowOps-vX-android-arm64.apk` | Allow installs from unknown sources, open the APK |
| Windows 10/11, x86_64 | `SnowOps-vX-windows-x86_64-setup.exe` or `…-windows-x86_64.zip` | Installer — a normal install; archive — a portable version: unzip, run `SnowOps.exe` |
| Linux, x86_64 and arm64 | `SnowOps-vX-linux.tar.gz` | `tar xzf`, run `SnowOps.x86_64` or `SnowOps.arm64`; the shared `SnowOps.pck` must stay next to them |
| macOS 11+, universal | `SnowOps-vX-macos-universal.zip` | Right-click → Open, or `xattr -dr com.apple.quarantine SnowOps.app` |

Builds are not notarized by Apple and there are no store pages yet: this is the testing stage. Store links will appear on the [website](https://romaxa55.github.io/snowops-site/#download) once the game ships on Google Play, the App Store and RuStore.

## Screenshots

All captured in-game, untouched.

<table>
  <tr>
    <td><img src="assets/img/real/03-baza-sverkhu-800.webp" alt="The base from above: hangars, towers, tanks"></td>
    <td><img src="assets/img/real/11-snaiper-nad-zheleznoi-dorogoi-800.webp" alt="A sniper on a platform above the railway"></td>
  </tr>
  <tr>
    <td><em>The base from above. Hangars, towers, tanks.</em></td>
    <td><em>Sniper above the railway. Him first.</em></td>
  </tr>
  <tr>
    <td><img src="assets/img/real/08-oruzheinaya-800.webp" alt="Two soldiers in the armoury by the cage"></td>
    <td><img src="assets/img/real/10-boets-s-avtomatom-800.webp" alt="A patrolman with a rifle at the checkpoint"></td>
  </tr>
  <tr>
    <td><em>The armoury. Two by the cage.</em></td>
    <td><em>Patrol at the checkpoint.</em></td>
  </tr>
  <tr>
    <td><img src="assets/img/real/12-shtab-cherez-okno-800.webp" alt="HQ through a window: an officer at his desk, portraits on the wall"></td>
    <td><img src="assets/img/real/07-patrul-u-sklada-800.webp" alt="A patrolman by store 18"></td>
  </tr>
  <tr>
    <td><em>HQ. An officer at his desk, portraits on the wall.</em></td>
    <td><em>Store 18. The patrol walks its own route — learn it.</em></td>
  </tr>
</table>

## What is in it

- **The guards have doubts.** A sentry doesn't shoot at first sight. First comes a "?" — he stops, peers, goes to check. In the dark, lying down or keeping still, you take longer to recognise.
- **The base lives by the book.** Posts change, the orderly keeps his place, the officer makes his rounds. A sentry first calls out "Halt! Get back!" — and only then opens fire.
- **A silent post gets noticed.** "All posts, report." Take out a sentry and he gets called again, then: "Post not answering. Go check!" If they find the body — alarm.
- **Light and dark.** A shot into a fusebox kills the lights in the whole building; rooms have ordinary switches. In the dark they spot you later, but they hear the bang.
- **The zip line is a quiet way.** A cable runs from the radio mast across the base: from afar the guards take you for a shadow. Until the siren goes off.
- **Lost you — now they search.** They search where they last saw you, look round the corner and into the rooms. Under the siren the whole base knows over the radio where you were spotted.
- **Also:** cameras raise the alarm in three seconds; footprints in the snow and breath steaming in the cold; SVD with a scope, MP5 with a suppressor, grenades; touch controls sized for thumbs.

## Status and plans

| Now | Next |
|---|---|
| Alpha, Russian language, one playable level | English version, original models and levels, release on Google Play, the App Store and RuStore, then Steam |

The game is built with [Godot 4.7](https://godotengine.org). Builds are produced automatically from a private code repository on every release tag and published here.

## Website and documents

- Website: <https://romaxa55.github.io/snowops-site/>
- [Privacy policy](https://romaxa55.github.io/snowops-site/privacy.html) · [Terms of use](https://romaxa55.github.io/snowops-site/terms.html) · [Data deletion](https://romaxa55.github.io/snowops-site/data-deletion.html) · [Support](https://romaxa55.github.io/snowops-site/support.html) (in Russian for now)

This repository holds the website sources (static HTML, no build step) and hosts the releases. The game's source code is not published here.

## Feedback

Found a bug, the game will not start, or you have an idea: open an [issue](https://github.com/Romaxa55/snowops-site/issues) or write to <support@snowops.game>. Please include your device model, OS version and the game version from the file name.

---

<p align="center">© 2026 SnowOps. All rights to the game, its name and materials belong to the developer.<br>Google Play, App Store and RuStore are trademarks of their respective owners.</p>

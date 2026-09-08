<p align="right"><a href="README.md">Русский</a> · <b>English</b></p>

<p align="center">
  <a href="https://romaxa55.github.io/snowops-site/"><img src="assets/img/og.jpg" alt="SnowOps: an operative in white winter camouflage watches a snowbound military base with a radio tower through binoculars" width="100%"></a>
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

SnowOps is a single-player campaign about an operative dropped near a polar military base with one job: get inside, do the work, and be gone before dawn.

There is no regenerating health behind cover and no arrow pointing at the objective. There are binoculars, a map, patrols on a schedule, and a lot of snow you are very visible on. Like the shooters of the late nineties, on a phone screen. The game is fully offline: no internet, no accounts, no ads, no purchases.

The game is currently in Russian. An English version is on the roadmap.

## Download a test build

The game is in **alpha**: it may crash, stutter and surprise you. That is exactly why testers are needed. All builds live in [this repository's releases](https://github.com/Romaxa55/snowops-site/releases/latest); checksums are in `SHA256SUMS`.

| Platform | File | How to run |
|---|---|---|
| Android 8.0+, arm64 | `SnowOps-vX-android-arm64.apk` | Allow installs from unknown sources, open the APK |
| Windows 10/11, x86_64 | `SnowOps-vX-windows-x86_64.zip` | Unzip, run `SnowOps.exe` |
| Linux, x86_64 and arm64 | `SnowOps-vX-linux.tar.gz` | `tar xzf`, run `SnowOps.x86_64` or `SnowOps.arm64`; the shared `SnowOps.pck` must stay next to them |
| macOS 11+, universal | `SnowOps-vX-macos-universal.zip` | Right-click → Open, or `xattr -dr com.apple.quarantine SnowOps.app` |

Builds are not notarized by Apple and there are no store pages yet: this is the testing stage. Store links will appear on the [website](https://romaxa55.github.io/snowops-site/#download) once the game ships on Google Play, the App Store and RuStore.

## Screenshots

<table>
  <tr>
    <td><img src="assets/img/shots/01.jpg" alt="Recon from the ridge: the operative watches the base through binoculars"></td>
    <td><img src="assets/img/shots/02.jpg" alt="The operative on the ladder of a freight wagon rolling toward the base"></td>
  </tr>
  <tr>
    <td><em>Recon from the ridge. The base below, twelve minutes until the guard changes.</em></td>
    <td><em>A freight train heading for the base. The best way in without a pass.</em></td>
  </tr>
  <tr>
    <td><img src="assets/img/shots/03.jpg" alt="Base perimeter: a searchlight, the operative pressed against a concrete wall, a guard on the walkway"></td>
    <td><img src="assets/img/shots/04.jpg" alt="The operative climbing an iced radio tower under the northern lights"></td>
  </tr>
  <tr>
    <td><em>The perimeter. The searchlight comes back every eight seconds.</em></td>
    <td><em>The radio tower. While the red light is on, they have comms.</em></td>
  </tr>
</table>

<p align="center"><img src="assets/img/shots/05.jpg" alt="Base garage: a truck drives out into the blizzard, the operative hides behind crates" width="70%"><br><em>The garage. The truck leaves in a minute, with you or without.</em></p>

## What is in it

- **Patrols walk their routes.** Guards circle the perimeter on a schedule, cameras turn, searchlights probe the dark. Learn the rhythm, find the gap and slip through. Or trip the alarm and deal with what follows.
- **The base lives without you.** Freight trains run on time, a truck leaves the garage, the guard changes by the clock. Any of it can be cover if you are in the right place.
- **Binoculars over rifles.** Open ground and long distances. Look first, plan second, shoot only when there is no other way.
- **Built for the phone.** Big buttons, a thumb-friendly layout, short sessions. The game asks for no internet, no account and no unnecessary permissions.

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

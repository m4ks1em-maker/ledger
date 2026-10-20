<p align="center"><a href="README.md">Русский</a> &nbsp;·&nbsp; <b>English</b></p>

<p align="center">
  <img src="docs/hero.png?v=2" alt="DotaTraker: who reported you, and at what minute" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.13.1-d08a52?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/platform-Windows-2d2d2d?style=flat-square&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/engine-Go%20·%20manta%201.5.1-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go engine">
  <img src="https://img.shields.io/badge/chat-global%20·%20Steam-46d6a6?style=flat-square" alt="Global chat">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT">
  <a href="https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/stargazers"><img src="https://img.shields.io/github/stars/m4ks1em-maker/ledger---Dota-Report-FInder?style=flat-square&color=d08a52&label=stars" alt="Stars"></a>
</p>

<p align="center">
  <a href="https://t.me/m4ks1em"><img src="https://img.shields.io/badge/Buy_a_key-@m4ks1em-2AABEE?style=for-the-badge&logo=telegram&logoColor=white" alt="Buy a key on Telegram"></a>
  &nbsp;
  <a href="https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/archive/refs/heads/main.zip"><img src="https://img.shields.io/badge/Download-ZIP-D08A52?style=for-the-badge&logo=github&logoColor=white" alt="Download ZIP"></a>
</p>

<p align="center"><i>Star the repo if it helped — it makes the project easier to find.</i></p>

---

<h3 align="center">Your personal report detective for Dota 2</h3>
<p align="center"><sub>Load a replay and see <b>who</b>, <b>when</b> and <b>at what minute</b> reported you. Everything is parsed on your PC — no console, no risk to your account.</sub></p>

<table align="center">
<tr>
<td align="center" width="25%">🎯<br><b>Report timeline</b><br><sub>who reported whom, by minute</sub></td>
<td align="center" width="25%">💬<br><b>Global chat</b><br><sub>every player + badges</sub></td>
<td align="center" width="25%">📊<br><b>Stats</b><br><sub>across all matches</sub></td>
<td align="center" width="25%">📤<br><b>Match sharing</b><br><sub>a clean report image</sub></td>
</tr>
</table>

---

## 🎬 Demo

<p align="center">
  <img src="docs/demo.gif?v=2" alt="DotaTraker demo — from lookup to the global chat" width="92%">
</p>

## ✨ New in 2.13

- 💬 **Global chat** — talk with every DotaTraker player, full history, @mentions, day dividers, live online counter.
- 🏅 **Subscription badges** — 1 month → forever ∞, an **Admin** status, real Steam avatars.
- 🛡️ **Moderation** — mute and ban right from the chat (admins).
- 📤 **Match share card** — one button → a premium "who reported whom" image.

## 💬 Global chat

<p align="center">
  <img src="docs/chat.png?v=2" alt="DotaTraker global chat — badges, mentions, online" width="92%">
</p>

## 📤 Share a match

<p align="center">
  <img src="docs/share.png?v=2" alt="DotaTraker match share card" width="78%">
</p>

## Getting started

1. Install [Node.js](https://nodejs.org) (LTS).
2. [Download the ZIP](https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/archive/refs/heads/main.zip) and unpack it.
3. Run `setup.bat` once, then `start.bat`.
4. Sign in through Steam (the official steamcommunity.com page) and enter your key.

## Pricing

| Period | Price |
|---|---|
| 7 days | $1 |
| 30 days | $2 |
| 90 days | $5 |
| 1 year | $15 |
| **Forever** | **$30** |

Keys are sold on Telegram: [@m4ks1em](https://t.me/m4ks1em). One key works on one computer. Offline, DotaTraker keeps working for up to 3 days.

## Safe by design

- Sign-in goes through the **official Steam site** (OpenID). DotaTraker gets only your public Steam ID and never sees your password or Guard code.
- Replays are processed on your PC; only the key check goes online.
- The code is open, all of it is in this repository.

## Updates

When a new version is out, the app shows a "DotaTraker … is out" bar. The "Update now" button downloads it from GitHub and restarts the app. Your key, settings and replays stay where they are.

## What it looks like

| Sign in | Home |
|---|---|
| <img src="docs/login.png?v=2" alt="Sign in"> | <img src="docs/home.png?v=2" alt="Home"> |
| **Global chat** | **Match timeline** |
| <img src="docs/chat.png?v=2" alt="Global chat"> | <img src="docs/matches.png?v=2" alt="Match timeline"> |

- Look a player up by Steam ID: recent matches, replays download from Valve's servers by themselves.
- Drop a `.dem` on the page if a replay is already gone from the servers.
- Incoming and outgoing reports, scoreboard activity, teammate vs enemy summary.
- Stats across every analysed match, CSV and JSON export.
- Auto-sync of new matches, dark and light theme, Russian and English.
- Reads replays from the latest Dota patches (manta 1.5.1 parser).

## Author

**DotaTraker** is created and maintained by **Max** — [@m4ks1em](https://t.me/m4ks1em) · [GitHub](https://github.com/m4ks1em-maker).
Design, key server, Steam sign-in, updates and the engine build are his work.

<sub>MIT licensed. Third-party components and their licences: [NOTICE.md](NOTICE.md).</sub>

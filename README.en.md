<p align="center"><a href="README.md">Русский</a> &nbsp;·&nbsp; <b>English</b></p>

<p align="center">
  <img src="docs/banner.en.png" alt="Ledger: who reported you, and at what minute" width="100%">
</p>

<p align="center">
  <a href="https://t.me/m4ks1em"><img src="https://img.shields.io/badge/Buy_a_key-@m4ks1em-2AABEE?style=for-the-badge&logo=telegram&logoColor=white" alt="Buy a key on Telegram"></a>
  &nbsp;
  <a href="https://github.com/m4ks1em-maker/ledger/archive/refs/heads/main.zip"><img src="https://img.shields.io/badge/Download-ZIP-9DB4FF?style=for-the-badge&logo=github&logoColor=0b1230" alt="Download ZIP"></a>
</p>

Ledger reads your Dota 2 replays and puts every report on a timeline, from teammates and from enemies. Paste a Steam ID and the replays download on their own, no Steam login.

<p align="center"><img src="docs/steps.en.png" alt="Getting started" width="100%"></p>

Links from the steps: [Telegram @m4ks1em](https://t.me/m4ks1em) · [Download ZIP](https://github.com/m4ks1em-maker/ledger/archive/refs/heads/main.zip) · [Node.js](https://nodejs.org)

One key works on one computer. Replays are processed on your PC; only the key check goes online. Without internet Ledger keeps working for up to 3 days.

## What it looks like

| Sign in with a key | Home |
|---|---|
| <img src="docs/login.png" alt="Sign in"> | <img src="docs/home.png" alt="Home"> |
| **Match timeline** | **Stats** |
| <img src="docs/matches.png" alt="Match"> | <img src="docs/stats.png" alt="Stats"> |

- Look a player up by Steam ID: recent matches, replays download from Valve's servers by themselves.
- Drop a `.dem` on the page if a replay is already gone from the servers.
- Incoming and outgoing reports, scoreboard activity, teammate vs enemy summary.
- Stats across every analysed match, CSV and JSON export.
- Auto-sync of new matches, dark and light theme, Russian and English.

<details>
<summary>How it works</summary>

```
browser ──► gate (localhost:8080) ──► engine server.exe (localhost:8081)
                │
                └──► key server (Cloudflare)
```

- `gate/` is the local Node.js app with no dependencies. It checks the key and starts and restarts the engine.
- `static/` is the interface.
- Keys are checked by a server on Cloudflare and stored there only as SHA-256.
- A key is bound to the computer and checked every 10 minutes. A revoked key signs you out at once; offline you get 3 days.
- Engine: [d3nd3/dota-report-timestamps](https://github.com/d3nd3/dota-report-timestamps) (MIT), downloaded by `setup.bat` into `engine/`.
</details>

## Licences

Third-party components and licences: [NOTICE.md](NOTICE.md). MIT licensed.

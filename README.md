# Ledger

See who reported whom in Dota 2 matches, and the minute they did it. Look a player up by Steam ID,
fetch their recent replays (no Steam login), and read the incoming and outgoing reports on a timeline.

Everything sits behind an **access-key gate**. Nobody gets in, and nobody gets the admin panel,
unless the person running it issues them a key.

**[Русская версия ниже](#русская-версия)**

## Run it (Windows)

1. Install [Node.js](https://nodejs.org) (LTS).
2. Run `setup.bat` once. It downloads the replay engine from
   [d3nd3/dota-report-timestamps](https://github.com/d3nd3/dota-report-timestamps) (MIT).
3. Run `start.bat`. Open <http://localhost:8080>.
4. On the **first** start the console prints an admin password once (`admin-…`). Write it down.
   It is stored only as a salted scrypt hash. Lost it? `node gate\gate.js passwd "new password"`.
5. Sign in with that password, open **Keys** and issue keys for other people
   (name, validity, number of devices, role).

## Who can do what

| | Admin (password or admin key) | Viewer key |
|---|---|---|
| Look up players, fetch and analyse replays, upload `.dem` | yes | yes |
| Stats, Player, export CSV/JSON | yes | yes |
| Settings, Steam login, delete replays | yes | no |
| Issue / revoke keys, activity log, auto-sync | yes | no |

There are no default accounts and no keys in this repository. Keys are shown once and stored only as HMAC digests
in `gate/data/` (git-ignored).

## How replays are fetched

The **Player lookup** tile asks [OpenDota](https://www.opendota.com) for a player's recent matches, then downloads the
replay from Valve's replay servers. No Steam account is involved. Valve only keeps replays for a short time, so
older matches can't be fetched; upload the `.dem` file instead (drag it onto the page).
The player's profile must have *Expose Public Match Data* enabled.
Steam login in the engine is optional and only for the owner.

## Putting it online

By default the gate listens on `127.0.0.1` only. To let others in, either

- put a tunnel or reverse proxy in front of port 8080 (Cloudflare Tunnel, Caddy, nginx) and set
  `COOKIE_SECURE=1 TRUST_PROXY=1`, or
- set `GATE_HOST=0.0.0.0` and open port 8080.

**Block port 8081 from the outside.** `server.exe` listens there with no protection; the gate is the only safe way in:

```
netsh advfirewall firewall add rule name="Ledger8081" dir=in action=block protocol=TCP localport=8081
```

## Settings (environment variables)

`ADMIN_PASSWORD`, `GATE_PORT` (8080), `GATE_HOST` (127.0.0.1), `UPSTREAM` (http://127.0.0.1:8081),
`COOKIE_SECURE`, `TRUST_PROXY`, `GATE_DATA_DIR`, `OPENDOTA_KEY` (optional API key), `OPENDOTA_BASE`.

CLI: `node gate\gate.js passwd <password>` and `node gate\gate.js newkey "Name" 30 viewer`.

## Limits worth knowing

- Sessions live in memory. Restarting the gate signs everybody out.
- The replay folder is shared by all keys.
- Stats and saved players live in each person's browser.
- Uploads are capped at 700 MB per file and the replay library at 8 GB.

## Credits

See [NOTICE.md](NOTICE.md). MIT licensed.

---

## Русская версия

Ledger показывает, кто на кого репортил в матчах Dota 2 и в какую минуту. Вводишь Steam ID игрока, сервис
находит его последние матчи, скачивает реплеи (без входа в Steam) и рисует входящие и исходящие репорты.

Всё закрыто **ключами доступа**. Внутрь и в админку попадает только тот, кому владелец выдал ключ.

**Запуск (Windows):** установи Node.js, один раз запусти `setup.bat` (скачает движок), потом `start.bat` и открой
<http://localhost:8080>. При первом запуске в консоли один раз напечатается админ-пароль, запиши его.
Забыл: `node gate\gate.js passwd "новый пароль"`. Войди паролем, открой «Keys» и выдавай ключи людям.

**Важно:** порт 8081 закрой файрволом снаружи (команда выше). Реплеи старше нескольких дней Valve не хранит,
такие загружай файлом `.dem`. По умолчанию сервис слушает только `127.0.0.1`; чтобы пустить людей, поставь перед
ним Cloudflare Tunnel или Caddy и задай `COOKIE_SECURE=1 TRUST_PROXY=1`.

<p align="center"><b>Русский</b> &nbsp;·&nbsp; <a href="README.en.md">English</a></p>

<p align="center">
  <img src="docs/cover.png" alt="DotaTraker — кто и на какой минуте тебя зарепортил" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/версия-2.5.2-d08a52?style=flat-square" alt="Версия">
  <img src="https://img.shields.io/badge/платформа-Windows-2d2d2d?style=flat-square&logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/движок-Go%20·%20manta%201.5.1-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go engine">
  <img src="https://img.shields.io/badge/сервер-Node.js%2018%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/лицензия-MIT-blue?style=flat-square" alt="MIT">
</p>

<p align="center">
  <a href="https://t.me/m4ks1em"><img src="https://img.shields.io/badge/Купить_ключ-@m4ks1em-2AABEE?style=for-the-badge&logo=telegram&logoColor=white" alt="Купить ключ в Telegram"></a>
  &nbsp;
  <a href="https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/archive/refs/heads/main.zip"><img src="https://img.shields.io/badge/Скачать-ZIP-D08A52?style=for-the-badge&logo=github&logoColor=white" alt="Скачать ZIP"></a>
</p>

<p align="center"><i>Поставь ⭐, если проект оказался полезным — это помогает другим его найти.</i></p>

---

## Демо

<p align="center">
  <img src="docs/demo.gif" alt="Демо DotaTraker" width="86%">
</p>

## Что умеет

<p align="center">
  <img src="docs/features.png" alt="Возможности DotaTraker" width="100%">
</p>

## Как начать

1. Установи [Node.js](https://nodejs.org) (версия LTS).
2. [Скачай ZIP](https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/archive/refs/heads/main.zip) и распакуй.
3. Открой `setup.bat` (один раз), потом `start.bat`.
4. Войди через Steam (официальный сайт steamcommunity.com) и введи ключ.

> [!TIP]
> Без интернета DotaTraker продолжает работать до 3 дней — ключ проверяется периодически, а не каждый запуск.

## Цены

| Срок | Цена |
|---|---|
| 7 дней | $1 |
| 30 дней | $2 |
| 90 дней | $5 |
| 1 год | $15 |
| **Навсегда** | **$30** |

Ключ покупается в Telegram: **[@m4ks1em](https://t.me/m4ks1em)**. Один ключ работает на одном компьютере.

## Безопасно

- Вход через **официальный сайт Steam** (OpenID). DotaTraker получает только публичный Steam ID — пароль и код Guard он не видит.
- Реплеи разбираются **у тебя на ПК**, наружу уходит только проверка ключа.
- Читает реплеи **с новых патчей** Dota (парсер manta 1.5.1).

## Как это выглядит

| Вход | Главная |
|---|---|
| <img src="docs/login.png" alt="Вход"> | <img src="docs/home.png" alt="Главная"> |
| **Таймлайн матча** | **Статистика** |
| <img src="docs/matches.png" alt="Матч"> | <img src="docs/stats.png" alt="Статистика"> |

## Обновления

Когда выходит новая версия, в приложении появляется плашка «Вышел DotaTraker …». Кнопка «Обновить» скачивает её с GitHub и перезапускает программу. Ключ, настройки и реплеи остаются на месте.

## FAQ

<details>
<summary><b>Это бан-рисковый софт? Меня забанят?</b></summary><br>
Нет. DotaTraker не трогает игру и не лезет в клиент Dota. Он читает уже сыгранные реплеи (<code>.dem</code>) — те же файлы, что доступны всем через серверы Valve.
</details>

<details>
<summary><b>Нужно вводить пароль от Steam?</b></summary><br>
Нет. Вход идёт через официальный OpenID Steam на steamcommunity.com. Программа видит только твой публичный Steam ID.
</details>

<details>
<summary><b>Работает на macOS / Linux?</b></summary><br>
Сейчас сборка под Windows. Движок кросс-платформенный (Go), так что порт возможен — напиши в Telegram, если нужно.
</details>

<details>
<summary><b>Реплей уже удалён с серверов Valve. Что делать?</b></summary><br>
Перетащи файл <code>.dem</code> прямо на страницу — DotaTraker разберёт его локально.
</details>

## Автор

**DotaTraker** создал и развивает **Макс** — [@m4ks1em](https://t.me/m4ks1em) · [GitHub](https://github.com/m4ks1em-maker).
Дизайн, сервер ключей, вход через Steam, обновления и сборка движка — его работа.

<sub>Лицензия MIT. Сторонние компоненты и их лицензии: <a href="NOTICE.md">NOTICE.md</a>.</sub>

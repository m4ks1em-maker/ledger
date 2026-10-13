<p align="center"><b>Русский</b> &nbsp;·&nbsp; <a href="README.en.md">English</a></p>

<p align="center">
  <img src="docs/banner.png" alt="DotaTraker: кто тебя зарепортил и на какой минуте" width="100%">
</p>

<p align="center">
  <a href="https://t.me/m4ks1em"><img src="https://img.shields.io/badge/Купить_ключ-@m4ks1em-2AABEE?style=for-the-badge&logo=telegram&logoColor=white" alt="Купить ключ в Telegram"></a>
  &nbsp;
  <a href="https://github.com/m4ks1em-maker/ledger/archive/refs/heads/main.zip"><img src="https://img.shields.io/badge/Скачать-ZIP-D08A52?style=for-the-badge&logo=github&logoColor=white" alt="Скачать ZIP"></a>
</p>

DotaTraker разбирает реплеи Dota 2 и показывает каждый репорт на таймлайне: от союзников и от врагов. Вставь Steam ID, и реплеи скачаются сами.

## Как начать

1. Установи [Node.js](https://nodejs.org) (версия LTS).
2. [Скачай ZIP](https://github.com/m4ks1em-maker/ledger/archive/refs/heads/main.zip) и распакуй.
3. Открой `setup.bat` (один раз), потом `start.bat`.
4. Войди через Steam (официальный сайт steamcommunity.com) и введи ключ.

## Цены

| Срок | Цена |
|---|---|
| 7 дней | $1 |
| 30 дней | $2 |
| 90 дней | $5 |
| 1 год | $15 |
| **Навсегда** | **$30** |

Ключ покупается в Telegram: [@m4ks1em](https://t.me/m4ks1em). Один ключ работает на одном компьютере. Без интернета DotaTraker работает до 3 дней.

## Безопасно

- Вход через **официальный сайт Steam** (OpenID). DotaTraker получает только публичный Steam ID, пароль и код Guard он не видит.
- Реплеи разбираются у тебя на ПК, наружу уходит только проверка ключа.
- Код открыт, он весь в этом репозитории.

## Обновления

Когда выходит новая версия, в приложении появляется плашка «Вышел DotaTraker …». Кнопка «Обновить» скачивает новую версию с GitHub и перезапускает программу. Ключ, настройки и реплеи остаются на месте.

## Как это выглядит

| Вход | Главная |
|---|---|
| <img src="docs/login.png" alt="Вход"> | <img src="docs/home.png" alt="Главная"> |
| **Таймлайн матча** | **Статистика** |
| <img src="docs/matches.png" alt="Матч"> | <img src="docs/stats.png" alt="Статистика"> |

- Поиск игрока по Steam ID: последние матчи, реплеи качаются с серверов Valve сами.
- Перетащи `.dem` на страницу, если реплей уже удалён с серверов.
- Входящие и исходящие репорты, активность на табло, сводка по союзникам и врагам.
- Статистика по всем разобранным матчам, экспорт в CSV и JSON.
- Автосинк новых матчей, тёмная и светлая тема, русский и английский.
- Читает реплеи с новых патчей Dota (парсер manta 1.5.1).

## Автор

**DotaTraker** создал и развивает **Макс** — [@m4ks1em](https://t.me/m4ks1em) · [GitHub](https://github.com/m4ks1em-maker).
Дизайн, сервер ключей, вход через Steam, обновления и сборка движка — его работа.

<sub>Лицензия MIT. Сторонние компоненты и их лицензии: [NOTICE.md](NOTICE.md).</sub>

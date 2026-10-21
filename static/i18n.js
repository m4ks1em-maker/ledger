// DotaTraker: language (EN/RU) and theme (dark/light). Loaded in <head> on every page.
// Translation works on the rendered DOM, so text the app builds later is covered too.
(function () {
    'use strict';
    const root = document.documentElement;
    const get = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
    const set = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

    let lang = get('ledgerLang') || ((navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en');
    let theme = get('ledgerTheme') || 'dark';
    root.dataset.theme = theme; root.lang = lang;

    const RU = {
        // header / tabs
        'See who reported whom in your Dota 2 matches, and the minute they did it.': 'Кто на кого репортил в твоих матчах Dota 2 и в какую минуту.',
        'Replays': 'Реплеи', 'Matches': 'Матчи', 'Player': 'Игрок', 'Match': 'Матч',
        'Log out': 'Выйти', 'Keys': 'Ключи',
        // replays
        'Local replays': 'Локальные реплеи', 'All': 'Все', 'None': 'Сбросить', 'Latest': 'Последние', 'Back': 'Назад',
        'Delete selected': 'Удалить выбранные', 'Loading replays...': 'Загрузка реплеев...', 'Refresh': 'Обновить',
        'Match history': 'История матчей', 'Steam ID': 'Steam ID', 'How many matches': 'Сколько матчей', 'Fetch': 'Загрузить',
        'Turbo games only': 'Только Turbo', 'Needs a Steam connection.': 'Нужно подключение к Steam.',
        'Waiting for Steam connection...': 'Ожидание подключения к Steam...', 'Fetching match history...': 'Загружаю историю матчей...',
        'No matches found.': 'Матчи не найдены.', 'Download Replay': 'Скачать реплей', 'Downloading...': 'Скачивание...', 'Decompressing...': 'Распаковка...',
        'Complete': 'Готово', 'Downloaded': 'Скачано', 'Checking...': 'Проверка...', 'Starting...': 'Запуск...', 'Redownload': 'Скачать заново', 'Queued': 'В очереди', 'Failed': 'Ошибка',
        'Fatal game search': 'Поиск фатальных игр', 'Find fatal games': 'Найти фатальные игры', 'Max depth': 'Макс. глубина',
        'How many low priority sessions to search.': 'Сколько сессий с низким приоритетом проверять.', 'Games per fatal': 'Игр на фатал',
        'How many games to download at each fatal game.': 'Сколько игр скачивать на каждый фатал.',
        'Processing': 'Обработка', 'Start analysis': 'Запустить анализ',
        // match view
        'Select a match...': 'Выбери матч...', 'Select a player...': 'Выбери игрока...', 'Player who received reports': 'Игрок, на которого репортили',
        'Incoming': 'Входящие', 'Outgoing': 'Исходящие', 'Scoreboard': 'Табло', 'Loading graph...': 'Загрузка графика...',
        'Incoming Reports - Report Timestamps': 'Входящие репорты: время',
        'Outgoing Reports - Reports Created': 'Исходящие репорты: кто кого',
        'Scoreboard Activity': 'Активность на табло',
        'Report summary': 'Сводка репортов', 'Report summary, all matches': 'Сводка репортов по всем матчам', 'Total': 'Всего',
        'From teammates': 'От союзников', 'From enemies': 'От врагов', 'Unconfirmed reports': 'Неподтверждённые репорты',
        'Player reports per match': 'Репорты игрока по матчам', 'Loading conduct scorecard...': 'Загрузка карточки поведения...',
        'No reports found for the selected player.': 'Для выбранного игрока репортов нет.', 'No reports found for this match.': 'В этом матче репортов нет.',
        'No scoreboard activity found for the selected player.': 'Нет активности на табло для игрока.', 'No scoreboard activity found for this match.': 'Нет активности на табло в этом матче.',
        'Error rendering graph. Please try again.': 'Не удалось построить график. Попробуй ещё раз.',
        'Copy': 'Копировать', 'Copied': 'Скопировано',
        // player tab
        'Player lookup': 'Поиск игрока', 'Add': 'Добавить', 'Name (optional)': 'Имя (необязательно)',
        'Steam ID (64-bit, 32-bit or [U:1:…])': 'Steam ID (64-бит, 32-бит или [U:1:…])',
        'Reported on them': 'Репортили на него', 'They reported': 'Он репортил',
        'That does not look like a Steam ID.': 'Это не похоже на Steam ID.',
        'Pick replays in the first tab, then add a player by ID to see everything they reported and everything reported on them.': 'Выбери реплеи на первой вкладке, затем добавь игрока по ID: увидишь, кого он репортил и кто репортил его.',
        'No analysed replays yet. Select replays in the first tab and they are analysed automatically.': 'Пока нет проанализированных реплеев. Выбери их на первой вкладке, анализ запустится сам.',
        'Nobody reported them in these matches.': 'В этих матчах на него никто не репортил.', 'They did not report anyone in these matches.': 'В этих матчах он никого не репортил.', 'Not found in the analysed replays.': 'В проанализированных реплеях не найден.',
        'In matches': 'В матчах', 'Teammate': 'Союзник', 'Enemy': 'Враг', 'unconfirmed': 'не подтв.', 'Open matches': 'Открыть матчи', 'Player lookup ': 'Поиск игрока',
        'Export CSV': 'Экспорт CSV', 'Export JSON': 'Экспорт JSON',
        // stats
        'Stats': 'Статистика', 'Matches analysed': 'Матчей проанализировано', 'Reports': 'Репортов', 'Per match': 'В среднем за матч', 'Matches with reports': 'Матчей с репортами',
        'When in the game': 'В какую минуту', 'Reports per match': 'Репорты по матчам', 'Most reported': 'Чаще всего репортят', 'Most active reporters': 'Чаще всех репортят',
        'Most reported heroes': 'Чаще всего репортят (герои)', 'Teammates vs enemies': 'Союзники и враги', 'Clear saved stats': 'Очистить сохранённую статистику',
        'Saved in this browser only. Analyse replays and they are added here.': 'Хранится только в этом браузере. Проанализируй реплеи, и они добавятся сюда.',
        'No data yet. Analyse a few replays first.': 'Данных пока нет. Сначала проанализируй несколько реплеев.', 'Player ': 'Игрок', 'Reports ': 'Репортов', 'Matches ': 'Матчей',
        // setup panel
        'Configuration': 'Настройки', 'Replay directory': 'Папка с реплеями', 'Steam profile': 'Профиль Steam', 'Select a profile...': 'Выбери профиль...',
        'Add a profile': 'Добавить профиль', 'Save settings': 'Сохранить', 'Steam connection': 'Подключение к Steam', 'Connect to Steam': 'Подключиться к Steam', 'Disconnect': 'Отключить',
        'Steam: Disconnected': 'Steam: отключён', 'Steam: Connected': 'Steam: подключён',
        // account chip
        'Owner': 'Владелец',
        // login / admin
        'Enter your access key to continue.': 'Введи ключ доступа, чтобы продолжить.', 'Access key': 'Ключ доступа', 'Show': 'Показать', 'Hide': 'Скрыть', 'Enter': 'Войти',
        'Invalid key': 'Неверный ключ', 'Enter your access key.': 'Введи ключ доступа.', 'No key yet? Ask the owner for one.': 'Нет ключа? Попроси у владельца.',
        'This key was revoked.': 'Этот ключ отозван.', 'This key has expired.': 'Срок действия ключа истёк.', 'Cannot reach the server. Check your connection.': 'Нет связи с сервером.',
        'Could not sign in.': 'Не удалось войти.',
        'Access keys': 'Ключи доступа', 'Issue a key, send it to someone, revoke it when you are done.': 'Выдай ключ, отправь человеку, отзови, когда не нужен.',
        'Open DotaTraker': 'Открыть DotaTraker', 'Active': 'Активные', 'Not used yet': 'Ещё не использованы', 'Signed in now': 'Сейчас онлайн',
        'Issue keys': 'Выдать ключи', 'Who is it for': 'Для кого', 'Valid for': 'Срок', 'Devices': 'Устройства', 'Access': 'Доступ', 'How many': 'Сколько', 'Generate': 'Создать',
        'Viewer': 'Зритель', 'Admin': 'Админ', '1 day': '1 день', '3 days': '3 дня', '7 days': '7 дней', '30 days': '30 дней', '90 days': '90 дней', '1 year': '1 год', 'No expiry': 'Бессрочно',
        'New key': 'Новый ключ', 'Done': 'Готово', 'Copy all': 'Копировать все', 'Download .txt': 'Скачать .txt',
        'Copy these now. Only a hash is stored, so a key can\'t be shown again.': 'Скопируй сейчас. Хранится только хэш, повторно ключ показать нельзя.',
        'The countdown starts at the first sign-in, not when you generate. Viewers can analyse replays but never see your Steam login, settings or the delete button.': 'Отсчёт срока начинается с первого входа, а не с создания. Зрители анализируют реплеи, но не видят твой Steam-логин, настройки и удаление.',
        'All keys': 'Все ключи', 'Search': 'Поиск', 'Name': 'Имя', 'Key': 'Ключ', 'Status': 'Статус', 'Time left': 'Осталось', 'Last seen': 'Был', 'Not used': 'Не использован', 'Expired': 'Истёк', 'Revoked': 'Отозван',
        'Revoke': 'Отозвать', 'Restore': 'Вернуть', 'Sign out': 'Выкинуть', 'Delete': 'Удалить', 'Sure?': 'Точно?', 'Never': 'Никогда',
        'No keys yet. Generate your first one.': 'Ключей пока нет. Создай первый.', 'Nothing matches your search.': 'Ничего не найдено.',
        'Auto-sync': 'Автосинк', 'Steam ID to follow': 'За чьим Steam ID следить', 'Check every': 'Проверять каждые', 'Look at last': 'Смотреть последние', '5 min': '5 мин', '10 min': '10 мин', '15 min': '15 мин', '30 min': '30 мин', '1 hour': '1 час',
        '5 matches': '5 матчей', '10 matches': '10 матчей', '20 matches': '20 матчей', 'Turn on': 'Включить', 'Turn off': 'Выключить', 'Check now': 'Проверить сейчас',
        'Uses the Steam login saved in the app. New matches that are not in the replay folder yet are downloaded (up to 5 per check).': 'Использует Steam-логин, сохранённый в приложении. Новые матчи, которых нет в папке, скачиваются (до 5 за проверку).',
        'Activity': 'Активность', 'last 200 events': 'последние 200 событий', 'When': 'Когда', 'Event': 'Событие', 'Who': 'Кто', 'Device': 'Устройство', 'Nothing yet.': 'Пока пусто.',
        'Signed in': 'Вход', 'Wrong key': 'Неверный ключ', 'Locked out': 'Блокировка', 'Refused': 'Отказ', 'Signed out': 'Выход', 'Keys issued': 'Выданы ключи', 'Key revoked': 'Ключ отозван', 'Key restored': 'Ключ возвращён',
        'Kicked': 'Выкинут', 'Extended': 'Продлён', 'Key deleted': 'Ключ удалён', 'Replay uploaded': 'Реплей загружен', 'Auto-downloaded': 'Автоскачан', 'Sync problem': 'Проблема синка',
        'Copied ': 'Скопировано', 'Press Ctrl+C to copy': 'Нажми Ctrl+C',
        'Home': 'Главная', 'Player lookup ': 'Поиск игрока', 'Who do you want to check?': 'Кого проверим?',
        'Paste a Steam ID. We find their latest matches, fetch the replays and show who they reported and who reported them. No Steam login.': 'Вставь Steam ID. Найдём последние матчи, скачаем реплеи и покажем, кого он репортил и кто репортил его. Без входа в Steam.',
        'Find': 'Найти', 'Last 5': 'Последние 5', 'Last 10': 'Последние 10', 'Analyse': 'Анализ', 'Looking…': 'Ищу…', 'Getting replays…': 'Получаю реплеи…', 'Analysing…': 'Анализирую…',
        'Replays that are no longer on Valve servers can\'t be fetched. Upload those instead.': 'Реплеи, которых уже нет на серверах Valve, скачать нельзя. Загрузи их файлом.',
        'No public matches found. The profile may be private (Dota 2 → Settings → Social → Expose Public Match Data).': 'Публичных матчей не найдено. Возможно, профиль закрыт (Dota 2 → Настройки → Социальное → Открыть данные матчей).',
        'None of those replays could be fetched. Upload the .dem files instead.': 'Ни один из реплеев скачать не удалось. Загрузи .dem файлами.',
        'on server': 'уже есть', 'to download': 'скачать', 'ready': 'готов', 'queued': 'в очереди', 'expired': 'устарел', 'failed': 'ошибка', 'WIN': 'ПОБЕДА', 'LOSS': 'ПОРАЖЕНИЕ',
        'matches analysed ': 'матчей проанализировано', 'reports found': 'репортов найдено', 'matches analysed': 'матчей проанализировано', 'Saved players': 'Сохранённые игроки',
        'Nobody yet. Look someone up and they appear here.': 'Пока никого. Найди игрока, и он появится здесь.',
        'No Steam login. Ever.': 'Без входа в Steam. Никогда.', 'DotaTraker never asks for your Steam password or Guard code. Replays come from public data.': 'DotaTraker никогда не просит пароль Steam или код Guard. Реплеи берутся из публичных данных.',
        'Keys & activity': 'Ключи и активность', 'Issue keys, see sign-ins, auto-sync': 'Выдача ключей, входы, автосинк',
        'Source': 'Источник', 'OpenDota (no Steam login)': 'OpenDota (без входа в Steam)', 'Steam (host login)': 'Steam (логин хоста)', 'Replay requested': 'Запрошен реплей',
        // v2: settings, key, sync, dialogs, empty states
        'Settings': 'Настройки', 'Steam connection (only needed for match history and fatal search)': 'Подключение к Steam (нужно только для истории матчей и поиска фаталов)',
        'Replay folder': 'Папка с реплеями', 'Your Dota 2 replays folder. With a profile selected, replays are read from': 'Папка с реплеями Dota 2. Если выбран профиль, реплеи берутся из',
        'Name (e.g. Main)': 'Имя (например, Main)',
        'Only needed for match history and fatal search. Player lookup on the home tab works without it.': 'Нужно только для истории матчей и поиска фаталов. Поиск игрока на главной работает без него.',
        'Steam username': 'Логин Steam', 'Steam password': 'Пароль Steam', 'Steam Guard code': 'Код Steam Guard',
        'Submit Code': 'Отправить код', 'Connecting...': 'Подключение...', 'Submitting Code...': 'Отправка кода...', 'Connected': 'Подключено', 'Rate Limited': 'Лимит запросов', 'Disconnecting...': 'Отключение...',
        'DotaTraker checks a player\'s new matches on a timer and downloads replays that are not in the folder yet (up to 5 per check).': 'DotaTraker по таймеру проверяет новые матчи игрока и скачивает реплеи, которых ещё нет в папке (до 5 за проверку).',
        'Steam (your login)': 'Steam (твой логин)', 'On': 'Вкл.', 'just now': 'только что', 'min ago': 'мин назад', 'h ago': 'ч назад', 'last check': 'проверка', 'downloaded': 'скачано',
        'Replays expired on Valve servers': 'Реплеи уже удалены с серверов Valve', 'Nothing could be downloaded': 'Ничего скачать не удалось', 'Could not save auto-sync.': 'Не удалось сохранить автосинк.',
        'Steam is not connected': 'Steam не подключён',
        'Your key': 'Твой ключ', 'days left': 'дней осталось', 'day left': 'день остался', 'no expiry': 'бессрочно', 'Renew in Telegram': 'Продлить в Telegram',
        'Valid until': 'Действует до', 'Days left': 'Осталось дней', 'Computers': 'Компьютеры', 'Version': 'Версия', 'This key never expires.': 'Ключ бессрочный.', 'd': 'дн.',
        'Sign out on this PC': 'Выйти на этом ПК', 'Sign out on this PC?': 'Выйти на этом ПК?', 'You will need the key to come back in.': 'Чтобы вернуться, понадобится ключ.', 'Sign out': 'Выйти',
        'No connection to the key server. DotaTraker keeps working and checks again later.': 'Нет связи с сервером ключей. DotaTraker продолжает работать и проверит позже.',
        'Player lookup needs no Steam login.': 'Поиск игрока работает без входа в Steam.',
        'Replays come from public match data. Your Steam password stays out of it.': 'Реплеи берутся из публичных данных матчей. Пароль Steam не нужен.',
        'Tick replays and they are analysed on their own. Open the Matches tab to see the timeline.': 'Отметь реплеи, и анализ запустится сам. Таймлайн смотри во вкладке «Матчи».',
        'e.g. 76561198...': 'например, 76561198...', 'Filled in from your profile': 'Подставляется из профиля',
        'Depth is how many low priority sessions to search. Games per fatal is how many matches to download at each one.': 'Глубина: сколько сессий низкого приоритета проверять. Игр на фатал: сколько матчей скачать для каждого.',
        'Download all to Fatal': 'Скачать все в Fatal', 'Download to Fatal': 'Скачать в Fatal', 'All downloaded': 'Всё скачано', 'Retry': 'Повторить',
        'No match open yet': 'Матч пока не открыт', 'Tick replays on the Replays tab or look a player up on Home. The timeline appears here.': 'Отметь реплеи во вкладке «Реплеи» или найди игрока на главной. Таймлайн появится здесь.',
        'Open replays': 'Открыть реплеи', 'Reports on the selected player': 'Репорты на выбранного игрока', 'Reports the selected player made': 'Репорты, которые сделал игрок',
        'When each player had the scoreboard open': 'Когда каждый игрок открывал табло', 'Teammates': 'Союзники', 'Enemies': 'Враги',
        'No replays here yet': 'Здесь пока нет реплеев', 'Drop .dem files on the page or look a player up on the home tab.': 'Перетащи .dem на страницу или найди игрока на главной.',
        'Try again': 'Повторить', 'Connect to Steam in Settings first.': 'Сначала подключись к Steam в настройках.',
        'Could not check the Steam connection. Is the engine running?': 'Не удалось проверить подключение к Steam. Движок запущен?',
        'Enter a Steam ID first.': 'Сначала введи Steam ID.', 'Select at least one replay.': 'Выбери хотя бы один реплей.', 'Select at least one replay to delete.': 'Выбери хотя бы один реплей для удаления.',
        'Settings saved': 'Настройки сохранены', 'Cancel': 'Отмена', 'Delete profile': 'Удалить профиль', 'Disconnect from Steam?': 'Отключиться от Steam?',
        'Match history and fatal search need a Steam connection.': 'Истории матчей и поиску фаталов нужно подключение к Steam.', 'Replays on disk stay where they are.': 'Реплеи на диске останутся на месте.',
        'Are you sure?': 'Точно?', 'Close': 'Закрыть', 'Upload was interrupted.': 'Загрузка прервалась.', 'Only .dem files': 'Только файлы .dem',
        'That is not a Dota 2 replay.': 'Это не реплей Dota 2.', 'File is empty or larger than 700 MB.': 'Файл пустой или больше 700 МБ.',
        'Valve no longer keeps this replay. Upload the .dem file instead.': 'Valve уже не хранит этот реплей. Загрузи .dem файлом.',
        'OpenDota did not answer. Try again in a minute.': 'OpenDota не отвечает. Попробуй через минуту.', 'Cannot reach the server.': 'Нет связи с сервером.',
        'Could not look that up.': 'Не удалось найти.', 'Loading players...': 'Загрузка игроков...', 'All Players': 'Все игроки', 'Your Account': 'Твой аккаунт',
        'The replay engine is not running. Close DotaTraker and open start.bat again.': 'Движок реплеев не запущен. Закрой DotaTraker и снова открой start.bat.',
        'Press Ctrl+C to copy': 'Нажми Ctrl+C', 'Loading conduct scorecard...': 'Загрузка карточки поведения...',
        // login
        'Sign in with your key': 'Вход по ключу', 'Player who made reports': 'Игрок, который репортил', 'Player (scoreboard activity)': 'Игрок (активность на табло)', 'Reports on the player, by minute': 'Репорты на игрока по минутам', 'Reports the player made, by minute': 'Репорты игрока по минутам', 'Press Ctrl+V to paste the key.': 'Нажми Ctrl+V, чтобы вставить ключ.', 'Enter the key you bought to unlock DotaTraker on this computer.': 'Введи купленный ключ, чтобы открыть DotaTraker на этом компьютере.',
        'No key yet?': 'Нет ключа?', 'Buy one in Telegram': 'Купи в Telegram', 'Paste': 'Вставить', 'Checking the key…': 'Проверяю ключ…',
        'This key was revoked.': 'Этот ключ отозван.', 'This key has expired.': 'Срок действия ключа истёк.',
        'This key is already used on another computer.': 'Этот ключ уже используется на другом компьютере.',
        'This computer was signed out of that key. Enter it again.': 'Этот компьютер вышел из ключа. Введи ключ ещё раз.',
        'This computer is no longer signed in with that key.': 'Этот компьютер больше не привязан к ключу. Введи ключ ещё раз.',
        'Cannot reach the key server. Check your internet connection.': 'Нет связи с сервером ключей. Проверь интернет.',
        'The key server address is not set in ledger.config.json.': 'В ledger.config.json не указан адрес сервера ключей.',
        'Too many attempts. Try again in 15 min.': 'Слишком много попыток. Повтори через 15 мин.',
        'Renew it in Telegram': 'Продли в Telegram', 'Ask for a reset in Telegram': 'Попроси сбросить в Telegram', 'Key server is not set up': 'Сервер ключей не настроен',
        'Works on one computer per key. Keys are checked online, then DotaTraker keeps working offline for up to 3 days.': 'Один ключ на один компьютер. Ключ проверяется онлайн, без интернета DotaTraker работает до 3 дней.',
        // drop zone
        'Drop .dem files here': 'Перетащи .dem сюда', 'or click to choose': 'или нажми, чтобы выбрать', 'Uploading': 'Загрузка', 'Uploaded': 'Загружено',
        "Who reported whom in your Dota 2 matches — minute by minute, straight from the replay.": "Кто кого репортил в твоих матчах Dota 2 — по минутам, прямо из реплея.",
        "Sign in through Steam": "Войти через Steam",
        "Official Steam page. DotaTraker never sees your password or Guard code.": "Официальная страница Steam. DotaTraker никогда не видит твой пароль и код Guard.",
        "Steam account": "Аккаунт Steam",
        "Access key": "Ключ доступа",
        "Unlock DotaTraker": "Открыть DotaTraker",
        "Paste": "Вставить",
        "No key yet?": "Нет ключа?",
        "Buy one in Telegram": "Купи в Telegram",
        "Access": "Доступ",
        "Pricing": "Цены",
        "One key, one PC. No auto-renewal: you pay once for the period you pick.": "Один ключ — один ПК. Без автопродления: платишь один раз за выбранный срок.",
        "Get a key in Telegram": "Купить ключ в Telegram",
        "Key in minutes after payment": "Ключ через пару минут после оплаты",
        "All updates included": "Все обновления включены",
        "Works offline for up to 3 days": "Работает без интернета до 3 дней",
        "Forever": "Навсегда",
        "1 year": "1 год",
        "Popular": "Популярный",
        "Best value": "Выгоднее всего",
        "One payment, yours for good": "Один платёж — твой навсегда",
        "Official Steam sign-in": "Официальный вход Steam",
        "Through steamcommunity.com. No passwords are typed here.": "Через steamcommunity.com. Пароли здесь не вводятся.",
        "Runs on your PC": "Работает на твоём ПК",
        "Replays are read locally and never uploaded anywhere.": "Реплеи читаются локально и никуда не загружаются.",
        "Open source": "Открытый код",
        "The code is public on GitHub.": "Код открыт на GitHub.",
        "Works on one computer per key. Keys are checked online, then DotaTraker keeps working offline for up to 3 days.": "Один ключ на один компьютер. Ключ проверяется онлайн, без интернета DotaTraker работает до 3 дней.",
        "Steam account linked. Now enter your key.": "Steam привязан. Теперь введи ключ.",
        "Steam account linked.": "Steam привязан.",
        "This key is linked to another Steam account.": "Этот ключ привязан к другому аккаунту Steam.",
        "Steam sign-in was cancelled.": "Вход через Steam отменён.",
        "The Steam sign-in took too long. Try again.": "Вход через Steam занял слишком долго. Попробуй ещё раз.",
        "Steam could not confirm the sign-in. Try again.": "Steam не подтвердил вход. Попробуй ещё раз.",
        "Cannot reach Steam. Check your internet connection.": "Нет связи со Steam. Проверь интернет.",
        "Sign in on the official Steam site. DotaTraker gets only your public Steam ID, never your password.": "Вход на официальном сайте Steam. DotaTraker получает только твой публичный Steam ID, без пароля.",
        "Advanced: Steam bot for match history": "Дополнительно: Steam-бот для истории матчей",
        "Only needed for match history and fatal search through Valve. Use a spare account: the login goes to the engine on this PC only. Player lookup and auto-sync work without it.": "Нужен только для истории матчей и поиска фаталов через Valve. Используй запасной аккаунт: логин уходит только в движок на этом ПК. Поиск игрока и автосинк работают без него.",
        "Unlink": "Отвязать",
        "Chat & moments": "Чат и моменты",
        "Chat": "Чат",
        "Events": "События",
        "No chat in this replay.": "В этом реплее нет чата.",
        "No notable moments in this replay.": "В этом реплее нет заметных событий.",
        "Wards": "Варды",
        "Reports": "Репорты",
        "No reports in this replay.": "В этом реплее нет репортов.",
        "Report from teammate": "Репорт от союзника",
        "Report from enemy": "Репорт от врага",
        "Reports on the player": "Репорты на игрока",
        "Reports the player made": "Репорты от игрока",
        "Chat wheel": "Колесо чата",
        "killed Roshan": "убили Рошана",
        "Roshan killed": "Рошан убит",
        "courier killed": "курьер убит",
        "Roshan": "Рошан",
        "couriers": "курьеры",
        "Messages": "Сообщений",
        "Most talkative": "Больше всех писал",
        "Most toxic": "Самый токсик",
        "Toxic messages": "Токсичных",
        "Radiant": "Radiant",
        "Dire": "Dire",
        "reports": "репортов",
        "toxic": "токсик",
        "chat wheel": "колесо",
        "Most wards": "Больше вардов",
        "Dewarded (est.)": "Задеворжено (≈)",
        "Players": "Игроки",
        "Player": "Игрок",
        "Got": "Получил",
        "Sent": "Кинул",
        "Msgs": "Сообщ.",
        "On the line: FB · Roshan · ! report": "На линии: FB · Рошан · ! репорт",
        "This match is not parsed on OpenDota yet — the match-flow graph needs a parsed match.": "Матч ещё не распарсен на OpenDota — для графика «Ход матча» нужен распарсенный матч.",
        "Parse this match": "Распарсить матч",
        "Share": "Поделиться",
        "Global chat": "Общий чат",
        "Duration": "Длительность",
        "Winner": "Победитель",
        "Date": "Дата",
        "Score": "Счёт",
        "Match flow": "Ход матча",
        "Whole match": "Весь матч",
        "Lane": "Линия",
        "Midgame": "Мидгейм",
        "Late game": "Финал",
        "Gold": "Золото",
        "XP": "Опыт",
        "The Radiant": "Силы Света",
        "The Dire": "Силы Тьмы",
        "Parsing…": "Парсинг…",
        "Requesting a parse from OpenDota…": "Запрашиваю парсинг у OpenDota…",
        "Parsing… this usually takes a minute or two.": "Парсинг… обычно занимает минуту-две.",
        "Parsed, but the graph data is not ready yet — try again in a minute.": "Распарсено, но данные графика ещё не готовы — попробуй через минуту.",
        "Parsing is taking a while. Try again later.": "Парсинг затянулся. Попробуй позже.",
        "Could not request a parse right now. Try again later.": "Не удалось запросить парсинг. Попробуй позже.",
        "Try again": "Повторить",
        "Verdict": "Вердикт",
        "Clean match": "Чистый матч",
        "Calm match": "Спокойный матч",
        "Heated match": "Напряжённый матч",
        "Toxic match": "Токсичный замес",
        "reports": "репортов",
        "from teammates": "от союзников",
        "from enemies": "от врагов",
        "No ward data in this replay. Rebuild the engine to enable it.": "Нет данных о вардах в этом реплее. Пересобери движок, чтобы включить.",
        "Observers": "Обсы",
        "Sentries": "Сентри",
        "Observer": "Обс",
        "Sentry": "Сентри",
        "Observers placed": "Обсов поставлено",
        "Sentries placed": "Сентри поставлено",
        "Average observer lifetime": "Среднее время жизни обса",
        "ALL": "ВСЕ",
        "TEAM": "КОМ",
        "Toxic": "Токсик",
        "Slot": "Слот",
        "used the glyph": "нажал глиф",
        "paused the game": "поставил паузу",
        "unpaused": "снял паузу",
        "First blood": "Первая кровь",
        "disconnected": "отключился",
        "glyphs": "глифов",
        "pauses": "пауз",
        "first blood": "первая кровь",
        "disconnects": "отключений",
        "Enter the enemy heroes and get counter-picks and win rates from millions of matches.": "Введи героев врага — получишь контрпики и винрейты из миллионов матчей.",
        "Your recent matches in numbers: KDA, GPM, last hits, win rate and your best heroes.": "Твои недавние матчи в цифрах: KDA, GPM, ластхиты, винрейт и лучшие герои.",
        "Paste a Steam ID and spot smurfs and boosters by win rate, rank and match count.": "Вставь Steam ID и вычисляй смурфов и бустеров по винрейту, рангу и числу игр.",
        "Draft helper": "Помощник по драфту",
        "Personal coach": "Личный тренер",
        "Smurf check": "Проверка смурфов",
        "Tools": "Инструменты",
        "Smurf check": "Проверка смурфов",
        "Pick the enemy heroes — get the best counters by win rate.": "Выбери героев врага — получишь лучшие контрпики по винрейту.",
        "Add an enemy hero…": "Добавь героя врага…",
        "Up to 5 heroes": "До 5 героев",
        "Add 1–5 enemy heroes. Data is from millions of public matches (OpenDota).": "Добавь 1–5 героев врага. Данные из миллионов публичных матчей (OpenDota).",
        "Best picks against their draft": "Лучшие пики против их состава",
        "Advantage = win rate of this hero against the enemies you picked, above 50%.": "Преимущество = винрейт этого героя против выбранных врагов, выше 50%.",
        "No data for this combination.": "Нет данных по такой комбинации.",
        "Cannot reach OpenDota. Check your internet connection.": "Нет связи с OpenDota. Проверь интернет.",
        "Your recent matches in numbers.": "Твои недавние матчи в цифрах.",
        "Analyse": "Разобрать",
        "Paste a Steam ID to see KDA, GPM, win rate and your most played heroes from recent public matches.": "Вставь Steam ID — увидишь KDA, GPM, винрейт и любимых героев по недавним публичным матчам.",
        "Spot smurfs and boosters by the numbers.": "Вычисляй смурфов и бустеров по цифрам.",
        "Check": "Проверить",
        "Paste a Steam ID. We estimate how likely the account is a smurf from win rate, rank and how many games it has.": "Вставь Steam ID. Прикинем, насколько аккаунт похож на смурф — по винрейту, рангу и числу игр.",
        "Could not load this player. The profile may be private (Dota 2 → Settings → Expose Public Match Data).": "Не удалось загрузить игрока. Профиль может быть закрыт (Dota 2 → Настройки → Открыть публичные данные матчей).",
        "games": "игр",
        "Win rate (recent)": "Винрейт (недавний)",
        "Last hits / game": "Ластхиты / игра",
        "Overall win rate": "Общий винрейт",
        "Averages over your last": "В среднем за последние",
        "public matches": "публичных матчей",
        "Most played lately": "Чаще всего последнее время",
        "Recent matches": "Недавние матчи",
        "Win": "Победа",
        "Loss": "Поражение",
        "Unranked": "Без ранга",
        "Likely a smurf": "Скорее всего смурф",
        "Maybe a smurf": "Возможно смурф",
        "Looks like a normal account": "Похоже на обычный аккаунт",
        "Very high recent win rate": "Очень высокий недавний винрейт",
        "High recent win rate": "Высокий недавний винрейт",
        "Normal recent win rate": "Обычный недавний винрейт",
        "Few games on the account": "Мало игр на аккаунте",
        "Lots of games": "Много игр",
        "High overall win rate on a young account": "Высокий общий винрейт на молодом аккаунте",
        "High rank with few games": "Высокий ранг при малом числе игр",
        "Farming numbers above the bracket": "Фарм выше своего уровня",
        "This is an estimate from public stats, not proof. Private profiles cannot be checked.": "Это оценка по публичной статистике, не доказательство. Закрытые профили проверить нельзя.",
        "Sign in": "Вход",
        "Features": "Функции",
        "Inside DotaTraker": "Внутри DotaTraker",
        "Everything in one app": "Всё в одном приложении",
        "One key unlocks all of it. New tools are added over time — your key covers them too, free.": "Один ключ открывает всё. Новые инструменты добавляются со временем — твой ключ покрывает и их, бесплатно.",
        "Report timeline": "Таймлайн репортов",
        "Every report in a match on a timeline — who reported you and who you reported, minute by minute.": "Каждый репорт в матче на таймлайне — кто репортил тебя и кого репортил ты, по минутам.",
        "Player lookup": "Поиск игрока",
        "Paste any Steam ID: recent matches download by themselves and show everything they reported.": "Вставь любой Steam ID: последние матчи скачаются сами и покажут всё, что человек репортил.",
        "Match stats": "Статистика матчей",
        "Totals across every analysed replay — from teammates and enemies, with CSV and JSON export.": "Сводка по всем разобранным реплеям — от союзников и врагов, с экспортом в CSV и JSON.",
        "Auto replay download": "Авто-скачивание реплеев",
        "Fetches replays straight from Valve's servers — no Steam login needed for lookups.": "Качает реплеи прямо с серверов Valve — для поиска вход в Steam не нужен.",
        "Auto-sync": "Автосинк",
        "Checks a player's new matches on a timer and pulls the replays that aren't in your folder yet.": "По таймеру проверяет новые матчи игрока и подтягивает реплеи, которых ещё нет в папке.",
        "Sign in through steamcommunity.com. Your password and Guard code never touch the app.": "Вход через steamcommunity.com. Пароль и код Guard в приложение не попадают.",
        "Dota update bot": "Бот обновлений Dota",
        "Our Telegram bot pings you about every Dota 2 patch, Valve activity and hero win rates.": "Наш Telegram-бот пишет о каждом патче Dota 2, активности Valve и винрейтах героев.",
        "Russian & English, dark/light": "Русский и English, тёмная/светлая",
        "Switch language and theme in a click. Your choice is remembered.": "Меняй язык и тему в один клик. Выбор запоминается.",
        "Coming soon": "Скоро",
        "your key will cover these too": "твой ключ покроет и это",
        "Draft helper": "Помощник по драфту",
        "Enter the enemy heroes and get counter-picks and win rates for your bracket.": "Введи героев врага — получишь контрпики и винрейты для твоего ранга.",
        "Personal coach": "Личный тренер",
        "Your replays broken down into numbers: last hits, GPM, deaths, item timings and what to fix.": "Твои реплеи в цифрах: ластхиты, GPM, смерти, тайминги предметов и что исправить.",
        "Smurf & teammate check": "Проверка смурфов и тиммейтов",
        "Spot smurfs, boosters and toxic players before the game by their stats.": "Вычисляй смурфов, бустеров и токсиков до игры по их статистике.",
        "soon": "скоро",
        "Get a key in Telegram": "Купить ключ в Telegram",
        "View on GitHub": "Открыть на GitHub",
        "Bot": "Бот",
        "Telegram bot": "Телеграм-бот",
        "Know about every Dota 2 update the moment it drops — client patches, web patch notes, hero win rates and what Valve is working on, straight to your Telegram.": "Узнавай о каждом обновлении Dota 2 в момент выхода — патчи клиента, веб-патчноуты, винрейты героев и чем занята Valve, прямо в Telegram.",
        "Open the bot": "Открыть бота",
        "Join the channel": "Подписаться на канал",
        "Instant update alerts": "Мгновенные уведомления",
        "The bot watches Valve around the clock and pings the channel the second a new client or web patch goes live.": "Бот следит за Valve круглосуточно и пишет в канал сразу, как выходит новый патч клиента или веба.",
        "Full patch breakdown": "Полный разбор патча",
        "Client build, files changed, localization text updates — each post links straight to GitHub, SteamDB and dota2.com.": "Билд клиента, изменённые файлы, обновления текстов локализации — в каждом посте ссылки на GitHub, SteamDB и dota2.com.",
        "Valve dev activity": "Активность Valve",
        "See how long ago Valve last committed and which patch is current — know when the next update is close.": "Видно, как давно был последний коммит Valve и какой патч актуален — поймёшь, когда близко новое обновление.",
        "Hero win rates": "Винрейты героев",
        "Top and bottom heroes by win rate from OpenDota, so you always know who is strong this patch.": "Топ и аутсайдеры по винрейту с OpenDota, чтобы всегда знать, кто силён в этом патче.",
        "New Dota 2 update!": "Новое обновление Dota 2!",
        "CLIENT UPDATE": "ОБНОВЛЕНИЕ КЛИЕНТА",
        "125 files · 13.10.2026 13:00 UTC": "125 файлов · 13.10.2026 13:00 UTC",
        "Texts: localization update": "Тексты: обновление локализации",
        "Valve developers": "Разработчики Valve",
        "Last commit": "Последний коммит",
        "3 h ago": "3 ч назад",
        "Current patch": "Текущий патч",
        "Top win rate": "Топ по винрейту",
        "channel": "канал",
        "Tap the button and press Start in Telegram.": "Нажми кнопку и жми Start в Telegram.",
        "All updates are posted to @dota2traker — subscribe once.": "Все обновления выходят в @dota2traker — подпишись один раз.",
        "Stay ahead": "Будь первым",
        "Get every patch, dev update and win-rate shift before everyone else.": "Получай каждый патч, новости разработки и сдвиги винрейта раньше всех.",
        "Open Dota Tracker Bot": "Открыть Dota Tracker Bot",
        "Advertising": "Реклама",
        "Click to copy the match ID": "Нажми, чтобы скопировать ID матча", "Match ID copied": "ID матча скопирован", "Press Ctrl+C to copy": "Нажми Ctrl+C, чтобы скопировать", "Copied": "Скопировано",
        "Search by match ID": "Поиск по ID матча", "Search replays": "Поиск реплеев",
        "asking OpenDota…": "запрос в OpenDota…",
        "OpenDota could not get this replay from Valve (too old, or not available yet). Upload the .dem file instead.": "OpenDota не смог получить реплей у Valve (слишком старый или ещё не готов). Загрузи .dem файл.",
        "Click to open the Steam profile": "Нажми, чтобы открыть профиль Steam",
        "A new version is on GitHub.": "На GitHub вышла новая версия.",
        "Update now": "Обновить",
        "Downloading…": "Скачиваю…",
        "Installing…": "Устанавливаю…",
        "Restarting…": "Перезапуск…",
        "Done": "Готово",
        "Update failed. Download it from GitHub.": "Обновление не удалось. Скачай его с GitHub.",
        "GitHub": "GitHub",
    };
    const PAT = [
        [/^(\d+) match(?:es)? analysed$/, (m) => m[1] + ' ' + plural(+m[1], 'матч', 'матча', 'матчей') + ' проанализировано'],
        [/^Match (\d+) \((\d+) reports?\)$/, (m) => 'Матч ' + m[1] + ' (' + m[2] + ' ' + plural(+m[2], 'репорт', 'репорта', 'репортов') + ')'],
        [/^Processing (\d+) \/ (\d+): (\d+)$/, (m) => 'Обработка ' + m[1] + ' / ' + m[2] + ': ' + m[3]],
        [/^Processing \((\d+)s\)\.\.\.$/, (m) => 'Обработка (' + m[1] + ' с)...'],
        [/^Steam: (.+)$/, (m) => 'Steam: ' + ({ Connected: 'подключён', Disconnected: 'отключён', Connecting: 'подключение', 'GC Ready': 'готов', 'Need Steam Guard Code': 'нужен код Steam Guard', 'Connected to Steam': 'подключён', 'Dota 2 GC Ready': 'Dota 2 GC готов', 'Rate Limited (Wait 24h)': 'лимит запросов (подожди 24 ч)' }[m[1]] || m[1])],
        [/^Status: (.+)$/, (m) => 'Статус: ' + ({ Disconnected: 'отключён', Connecting: 'подключение', 'Need Steam Guard Code': 'нужен код Steam Guard', 'Connected to Steam': 'подключён к Steam', 'Dota 2 GC Ready': 'Dota 2 GC готов', 'Rate Limited (Wait 24h)': 'лимит запросов (подожди 24 ч)', 'Disconnected (timeout)': 'отключён (таймаут)' }[m[1]] || m[1])],
        [/^Could not open the replay folder: (.+)$/, (m) => 'Не удалось открыть папку с реплеями: ' + m[1]],
        [/^Delete profile "(.+)"\?$/, (m) => 'Удалить профиль «' + m[1] + '»?'],
        [/^Delete (\d+) replays?\?$/, (m) => 'Удалить ' + m[1] + ' ' + plural(+m[1], 'реплей', 'реплея', 'реплеев') + '?'],
        [/^(.+)\. This cannot be undone\.$/, (m) => m[1] + '. Это нельзя отменить.'],
        [/^Uploaded (\d+) \/ (\d+)$/, (m) => 'Загружено ' + m[1] + ' / ' + m[2]],
        [/^Uploading (.+)$/, (m) => 'Загрузка ' + m[1]],
        [/^Done, (\d+) failed$/, (m) => 'Готово, ошибок: ' + m[1]],
        [/^Downloading (\d+)\/(\d+)\.\.\.$/, (m) => 'Скачиваю ' + m[1] + '/' + m[2] + '...'],
        [/^Found (\d+) fatal game\(s\)$/, (m) => 'Найдено фаталов: ' + m[1]],
        [/^(\d+) of (\d+) replays could not be read\. (.*)$/, (m) => m[1] + ' из ' + m[2] + ' реплеев не прочитались. ' + m[3]],
        [/^Could not read the selected replays?\. (.*)$/, (m) => 'Не удалось прочитать выбранные реплеи. ' + m[1]],
        [/^(\d+) reports?$/, (m) => m[1] + ' ' + plural(+m[1], 'репорт', 'репорта', 'репортов')],
        [/^Fatal match (\d+)(.*)$/, (m) => 'Фатальный матч ' + m[1] + m[2]],
        [/^Match (\d+)$/, (m) => 'Матч ' + m[1]],
        [/^played (.+)$/, (m) => 'играл на ' + m[1]],
        [/^(\d+) new keys$/, (m) => m[1] + ' ' + plural(+m[1], 'новый ключ', 'новых ключа', 'новых ключей')],
        [/^(\d+) days? once used$/, (m) => m[1] + ' ' + plural(+m[1], 'день', 'дня', 'дней') + ' с первого входа'],
        [/^(\d+) (min|h|days?) ago$/, (m) => m[1] + ' ' + ({ min: 'мин', h: 'ч' }[m[2]] || 'дн.') + ' назад'],
        [/^(\d+) (min|h|days?)$/, (m) => m[1] + ' ' + ({ min: 'мин', h: 'ч' }[m[2]] || 'дн.')],
        [/^Downloading (\d+)…$/, (m) => 'Скачиваю ' + m[1] + '…'],
        [/^Downloaded (\d+) new matche?s?$/, (m) => 'Скачано новых: ' + m[1]],
        [/^Up to date$/, () => 'Всё актуально'], [/^Off$/, () => 'Выкл.'], [/^Working…$/, () => 'Работаю…'],
        [/^Starting…$/, () => 'Запуск…'], [/^Checking…$/, () => 'Проверяю…'],
        [/^Set a Steam ID first$/, () => 'Сначала укажи Steam ID'], [/^Steam is not connected on the host$/, () => 'Steam на хосте не подключён'],
        [/^Too many attempts\. Try again in (\d+) min\.$/, (m) => 'Слишком много попыток. Повтори через ' + m[1] + ' мин.'],
        [/^DotaTraker (\d+\.\d+\.\d+) is out$/, (m) => 'Вышел DotaTraker ' + m[1]],
        [/^(\d+) days$/, (m) => m[1] + ' ' + plural(+m[1], 'день', 'дня', 'дней')],
        [/^\$([\d.]+) a day$/, (m) => '$' + m[1] + ' в день'],
        [/^OpenDota did not answer \((.+)\)\. Try again in a minute\.$/, (m) => 'OpenDota не ответил (' + m[1] + '). Попробуй через минуту.'],
        [/^Could not download the replay \((.+)\)\.$/, (m) => 'Не удалось скачать реплей (' + m[1] + ').'],
        [/^downloading (\d+)%$/, (m) => 'скачивание ' + m[1] + '%'], [/^(\d+) \/ (\d+)$/, null]
    ];
    function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); }
    function tr(str) {
        const t = str.trim();
        if (!t) return str;
        let out = RU[t];
        if (out == null) for (const [re, fn] of PAT) { if (!fn) continue; const m = re.exec(t); if (m) { out = fn(m); break; } }
        if (out == null) return str;
        return str.replace(t, out);
    }

    const store = new WeakMap();     // text node / element -> { original, text } so we can switch back
    let busy = false;
    function textNode(n) {
        const v = n.nodeValue;
        const rec = store.get(n);
        if (rec && rec.text === v) { if (lang === 'en') { n.nodeValue = rec.original; store.delete(n); } return; }
        if (rec && rec.text !== v) store.delete(n);        // app wrote something new
        if (lang !== 'ru') return;
        const out = tr(v);
        if (out !== v) { store.set(n, { original: v, text: out }); n.nodeValue = out; }
    }
    const ATTRS = ['placeholder', 'title', 'aria-label'];
    function attrs(el) {
        if (!el.getAttribute) return;
        ATTRS.forEach((a) => {
            const v = el.getAttribute(a); if (v == null) return;
            const key = '__lx_' + a;
            if (el[key] && el[key].text === v) { if (lang === 'en') { el.setAttribute(a, el[key].original); delete el[key]; } return; }
            if (lang !== 'ru') return;
            const out = tr(v);
            if (out !== v) { el[key] = { original: v, text: out }; el.setAttribute(a, out); }
        });
    }
    function walk(node) {
        if (node.nodeType === 3) return textNode(node);
        if (node.nodeType !== 1) return;
        const tag = node.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CANVAS') return;
        attrs(node);
        for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
    }
    function run(node) { if (busy) return; busy = true; try { walk(node || document.body); } finally { busy = false; } }

    let pending = new Set(), raf = 0;
    const mo = new MutationObserver((list) => {
        if (busy) return;
        list.forEach((m) => {
            if (m.type === 'characterData') pending.add(m.target);
            else if (m.type === 'attributes') pending.add(m.target);
            else m.addedNodes.forEach((n) => pending.add(n));
        });
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; const items = [...pending]; pending = new Set(); busy = true; try { items.forEach((n) => { if (n.nodeType === 3) textNode(n); else if (n.nodeType === 1) { attrs(n); walk(n); } }); } finally { busy = false; } });
    });

    function setLang(l) {
        lang = l; set('ledgerLang', l); root.lang = l;
        run(document.body);
        if (!root.__title) root.__title = document.title;
        document.title = lang === 'ru' ? root.__title.replace('Sign in', 'Вход').replace('Dota 2 report timeline', 'кто кого репортил в Dota 2') : root.__title;
        refreshSwitch();
        document.dispatchEvent(new CustomEvent('ledger:lang', { detail: l }));
    }
    function setTheme(t) { theme = t; set('ledgerTheme', t); root.dataset.theme = t; refreshSwitch(); document.dispatchEvent(new CustomEvent('ledger:theme', { detail: t })); }

    const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
    let sw = null;
    function refreshSwitch() {
        if (!sw) return;
        sw.querySelectorAll('[data-l]').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
        const t = sw.querySelector('[data-t]'); t.innerHTML = theme === 'light' ? MOON : SUN;
        t.title = theme === 'light' ? 'Dark theme' : 'Light theme'; t.setAttribute('aria-label', t.title);
    }
    function buildSwitch() {
        sw = document.createElement('div'); sw.className = 'lx-switch';
        ['en', 'ru'].forEach((l) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.l = l; b.textContent = l.toUpperCase(); b.addEventListener('click', () => setLang(l)); sw.appendChild(b); });
        const t = document.createElement('button'); t.type = 'button'; t.dataset.t = '1'; t.addEventListener('click', () => setTheme(theme === 'light' ? 'dark' : 'light')); sw.appendChild(t);
        const bar = document.querySelector('.header-actions, .gate-top');
        if (bar) bar.insertBefore(sw, bar.firstChild); else { sw.classList.add('lx-float'); document.body.appendChild(sw); }
        refreshSwitch();
    }

    function src(el) {
        let out = '';
        const visit = (n) => {
            if (n.nodeType === 3) { const rec = store.get(n); out += rec && rec.text === n.nodeValue ? rec.original : n.nodeValue; }
            else if (n.nodeType === 1) for (let c = n.firstChild; c; c = c.nextSibling) visit(c);
        };
        visit(el);
        return out.trim();
    }
    window.LedgerI18n = { t: (s) => (lang === 'ru' ? tr(s) : s), src, get lang() { return lang; }, get theme() { return theme; }, plural };
    function start() {
        buildSwitch();
        if (lang === 'ru') { run(document.body); root.__title = document.title; document.title = document.title.replace('Sign in', 'Вход').replace('Dota 2 report timeline', 'кто кого репортил в Dota 2'); }
        mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    // the app's header chip is added later by ledger.js; keep the switch first in the bar
    window.addEventListener('load', () => { const bar = document.querySelector('.header-actions, .gate-top'); if (bar && sw && sw.parentElement !== bar) { sw.classList.remove('lx-float'); bar.insertBefore(sw, bar.firstChild); } });
})();

// Ledger: language (EN/RU) and theme (dark/light). Loaded in <head> on every page.
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
        'Open Ledger': 'Открыть Ledger', 'Active': 'Активные', 'Not used yet': 'Ещё не использованы', 'Signed in now': 'Сейчас онлайн',
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
        'No Steam login. Ever.': 'Без входа в Steam. Никогда.', 'Ledger never asks for your Steam password or Guard code. Replays come from public data.': 'Ledger никогда не просит пароль Steam или код Guard. Реплеи берутся из публичных данных.',
        'Keys & activity': 'Ключи и активность', 'Issue keys, see sign-ins, auto-sync': 'Выдача ключей, входы, автосинк',
        'Source': 'Источник', 'OpenDota (no Steam login)': 'OpenDota (без входа в Steam)', 'Steam (host login)': 'Steam (логин хоста)', 'Replay requested': 'Запрошен реплей',
        // drop zone
        'Drop .dem files here': 'Перетащи .dem сюда', 'or click to choose': 'или нажми, чтобы выбрать', 'Uploading': 'Загрузка', 'Uploaded': 'Загружено'
    };
    const PAT = [
        [/^(\d+) matches? analysed$/, (m) => m[1] + ' ' + plural(+m[1], 'матч', 'матча', 'матчей') + ' проанализировано'],
        [/^Match (\d+) \((\d+) reports?\)$/, (m) => 'Матч ' + m[1] + ' (' + m[2] + ' ' + plural(+m[2], 'репорт', 'репорта', 'репортов') + ')'],
        [/^Processing (\d+) \/ (\d+): (\d+)$/, (m) => 'Обработка ' + m[1] + ' / ' + m[2] + ': ' + m[3]],
        [/^Processing \((\d+)s\)\.\.\.$/, (m) => 'Обработка (' + m[1] + ' с)...'],
        [/^Steam: (.+)$/, (m) => 'Steam: ' + ({ Connected: 'подключён', Disconnected: 'отключён', Connecting: 'подключение', 'GC Ready': 'готов' }[m[1]] || m[1])],
        [/^Status: (.+)$/, (m) => 'Статус: ' + m[1]],
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
        run(document.body); document.title = lang === 'ru' ? document.title.replace('Sign in', 'Вход').replace('Access keys', 'Ключи доступа') : document.title;
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
        const bar = document.querySelector('.header-actions, .admin-actions');
        if (bar) bar.insertBefore(sw, bar.firstChild); else { sw.classList.add('lx-float'); document.body.appendChild(sw); }
        refreshSwitch();
    }

    window.LedgerI18n = { t: (s) => (lang === 'ru' ? tr(s) : s), get lang() { return lang; }, get theme() { return theme; }, plural };
    function start() {
        buildSwitch();
        if (lang === 'ru') run(document.body);
        mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    // the app's header chip is added later by ledger.js; keep the switch first in the bar
    window.addEventListener('load', () => { const bar = document.querySelector('.header-actions, .admin-actions'); if (bar && sw && sw.parentElement !== bar) { sw.classList.remove('lx-float'); bar.insertBefore(sw, bar.firstChild); } });
})();

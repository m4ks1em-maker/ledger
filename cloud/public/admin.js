// Ledger key server: owner dashboard.
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const UI = window.LedgerUI;
    const esc = window.esc;
    const DAY = 86400000;
    let data = { keys: [], events: [], stats: {} }, me = { telegram: 'm4ks1em', github: '' };
    let filter = 'all', query = '', open = null;

    /* ---------- theme (shared with the app) ---------- */
    const root = document.documentElement;
    try { root.dataset.theme = localStorage.getItem('ledgerTheme') || 'dark'; } catch (_) {}
    $('theme').addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('ledgerTheme', root.dataset.theme); } catch (_) {}
    });

    /* ---------- api ---------- */
    async function api(path, body, method) {
        const r = await fetch(path, {
            method: method || (body ? 'POST' : 'GET'),
            credentials: 'same-origin',
            headers: body ? { 'Content-Type': 'application/json' } : {},
            body: body ? JSON.stringify(body) : undefined
        });
        const j = await r.json().catch(() => ({}));
        if (r.status === 401 && path !== '/api/admin/login') { showSignin(); throw new Error('signin'); }
        if (!r.ok) throw new Error(j.error || 'Ошибка ' + r.status);
        return j;
    }

    /* ---------- formatting ---------- */
    const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c); };
    const days = (n) => n + ' ' + plural(n, 'день', 'дня', 'дней');
    function ago(t) {
        if (!t) return 'никогда';
        const s = Math.round((Date.now() - t) / 1000);
        if (s < 60) return 'только что';
        if (s < 3600) return Math.round(s / 60) + ' мин назад';
        if (s < 86400) return Math.round(s / 3600) + ' ч назад';
        return Math.round(s / 86400) + ' ' + plural(Math.round(s / 86400), 'день', 'дня', 'дней') + ' назад';
    }
    const date = (t) => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    function left(k) {
        if (k.status === 'revoked') return 'отозван';
        if (!k.durationDays) return 'навсегда';
        if (k.status === 'unused') return days(k.durationDays) + ' с первого входа';
        if (k.status === 'expired') return 'истёк ' + date(k.expiresAt);
        return 'осталось ' + days(Math.max(0, Math.ceil((k.expiresAt - Date.now()) / DAY)));
    }
    const STATUS = { active: 'активен', unused: 'не активирован', expired: 'истёк', revoked: 'отозван' };

    /* ---------- sign in ---------- */
    function showSignin() { $('app').classList.add('hidden'); $('signin').classList.remove('hidden'); setTimeout(() => $('pw').focus(), 100); }
    function showApp() { $('signin').classList.add('hidden'); $('app').classList.remove('hidden'); }
    $('signin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type=submit]');
        btn.classList.add('loading-btn'); $('signin-err').textContent = '';
        try {
            await api('/api/admin/login', { password: $('pw').value });
            $('pw').value = '';
            await boot();
        } catch (err) {
            $('signin-err').textContent = err.message === 'Wrong password' ? 'Неверный пароль' : err.message;
            e.target.classList.remove('shake'); void e.target.offsetWidth; e.target.classList.add('shake');
        } finally { btn.classList.remove('loading-btn'); }
    });
    $('logout').addEventListener('click', async () => { try { await api('/api/admin/logout', {}); } catch (_) {} showSignin(); });

    /* ---------- stats ---------- */
    function renderStats() {
        const s = data.stats || {};
        const host = $('stats'); host.textContent = '';
        [['Всего ключей', s.total], ['Активны', s.active, 'ok'], ['Ждут активации', s.unused], ['Истекли', s.expired, 'warn'], ['Отозваны', s.revoked, 'bad'], ['Онлайн за сутки', s.online, 'ok']].forEach(([label, n, cls]) => {
            const c = document.createElement('div'); c.className = 'ad-stat' + (cls ? ' ' + cls : '');
            const b = document.createElement('b'); const sp = document.createElement('span'); sp.textContent = label;
            c.append(b, sp); host.appendChild(c);
            UI.countTo(b, n || 0);
        });
    }

    /* ---------- keys ---------- */
    function matches(k) {
        if (filter !== 'all' && k.status !== filter) return false;
        if (!query) return true;
        const q = query.toLowerCase();
        return (k.label + ' ' + k.note + ' ' + k.tail).toLowerCase().includes(q);
    }
    function renderKeys() {
        const host = $('keys');
        const list = data.keys.filter(matches);
        host.textContent = '';
        if (!list.length) {
            const p = document.createElement('div'); p.className = 'list-empty';
            p.innerHTML = data.keys.length ? '<b>Ничего не найдено</b><span>Попробуй другой фильтр или запрос.</span>' : '<b>Ключей пока нет</b><span>Выдай первый слева: он появится здесь.</span>';
            host.appendChild(p); return;
        }
        list.forEach((k, i) => {
            const row = document.createElement('div');
            row.className = 'ad-key s-' + k.status + (open === k.id ? ' open' : '');
            row.style.setProperty('--i', String(Math.min(i, 12)));
            row.innerHTML = `
                <button class="ad-key-main" type="button" aria-expanded="${open === k.id}">
                    <span class="ad-av">${esc((k.label || '?').trim().charAt(0).toUpperCase())}</span>
                    <span class="ad-who"><b>${esc(k.label)}</b><small>${esc(k.note || 'без заметки')}</small></span>
                    <span class="ad-pill">${esc(STATUS[k.status] || k.status)}</span>
                    <span class="ad-left">${esc(left(k))}</span>
                    <span class="ad-pc" title="Компьютеры">${k.devices}/${k.maxDevices} ПК</span>
                    <span class="ad-tail">…${esc(k.tail)}</span>
                </button>`;
            row.querySelector('.ad-key-main').addEventListener('click', () => { open = open === k.id ? null : k.id; renderKeys(); });
            if (open === k.id) row.appendChild(details(k));
            host.appendChild(row);
        });
    }
    function btn(label, cls, fn) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small-btn ' + (cls || ''); b.textContent = label; b.addEventListener('click', fn); return b; }
    function details(k) {
        const box = document.createElement('div'); box.className = 'ad-details';
        const facts = document.createElement('dl');
        const fact = (a, b) => { const dt = document.createElement('dt'); dt.textContent = a; const dd = document.createElement('dd'); dd.textContent = b; facts.append(dt, dd); };
        fact('Создан', date(k.createdAt));
        fact('Первый вход', k.activatedAt ? date(k.activatedAt) : 'ещё не было');
        fact('Действует до', k.durationDays ? (k.expiresAt ? date(k.expiresAt) : days(k.durationDays) + ' после первого входа') : 'бессрочно');
        fact('Последний раз', ago(k.lastSeenAt));
        fact('Входов', String(k.activations || 0));
        box.appendChild(facts);

        const acts = document.createElement('div'); acts.className = 'ad-actions';
        if (k.durationDays) [1, 7, 30, 90].forEach((d) => acts.appendChild(btn('+' + days(d), '', () => act(k, { action: 'extend', days: d }, 'Продлено на ' + days(d)))));
        if (k.durationDays) acts.appendChild(btn('Сделать бессрочным', '', () => act(k, { action: 'forever' }, 'Теперь ключ бессрочный')));
        acts.appendChild(btn(k.status === 'revoked' ? 'Вернуть' : 'Отозвать', k.status === 'revoked' ? '' : 'danger-btn', () => act(k, { action: k.status === 'revoked' ? 'restore' : 'revoke' }, k.status === 'revoked' ? 'Ключ снова работает' : 'Ключ отозван')));
        box.appendChild(acts);

        const edit = document.createElement('div'); edit.className = 'ad-edit';
        const mk = (label, value, max, action, field) => {
            const wrap = document.createElement('div'); wrap.className = 'input-group';
            const l = document.createElement('label'); l.textContent = label;
            const row = document.createElement('div'); row.className = 'row-group';
            const input = document.createElement('input'); input.type = 'text'; input.value = value || ''; input.maxLength = max;
            row.append(input, btn('Сохранить', '', () => act(k, { action, [field]: input.value }, 'Сохранено')));
            wrap.append(l, row); return wrap;
        };
        edit.append(mk('Имя', k.label, 60, 'rename', 'label'), mk('Заметка', k.note, 200, 'note', 'note'));
        const dev = document.createElement('div'); dev.className = 'input-group';
        const dl = document.createElement('label'); dl.textContent = 'Сколько компьютеров можно';
        const ds = document.createElement('div'); ds.className = 'seg small';
        [1, 2, 3, 5].forEach((n) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = String(n); if (n === k.maxDevices) b.className = 'on'; b.addEventListener('click', () => act(k, { action: 'devices', maxDevices: n }, 'Лимит: ' + n + ' ПК')); ds.appendChild(b); });
        dev.append(dl, ds);
        edit.appendChild(dev);
        box.appendChild(edit);

        const devHost = document.createElement('div'); devHost.className = 'ad-devices';
        const dh = document.createElement('h4'); dh.textContent = 'Компьютеры с этим ключом';
        const dlist = document.createElement('div'); dlist.className = 'ad-dev-list'; dlist.innerHTML = '<div class="skeleton-list"><i></i><i></i></div>';
        devHost.append(dh, dlist);
        const foot = document.createElement('div'); foot.className = 'ad-actions';
        foot.append(
            btn('Сбросить все ПК', '', async () => { if (await UI.confirm({ title: 'Отвязать все компьютеры?', text: 'Ключ придётся ввести заново на каждом ПК. Удобно, если человек сменил компьютер.', ok: 'Отвязать', cancel: 'Отмена' })) act(k, { action: 'reset' }, 'Компьютеры отвязаны'); }),
            btn('Удалить ключ', 'danger-btn', async () => { if (await UI.confirm({ title: 'Удалить ключ «' + k.label + '»?', text: 'Он перестанет работать сразу и навсегда.', ok: 'Удалить', cancel: 'Отмена' })) act(k, { action: 'delete' }, 'Ключ удалён'); })
        );
        devHost.appendChild(foot);
        box.appendChild(devHost);
        loadDevices(k, dlist);
        return box;
    }
    async function loadDevices(k, host) {
        try {
            const j = await api('/api/admin/keys/' + k.id + '/devices');
            host.textContent = '';
            if (!j.devices.length) { const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Ещё ни одного. Появится после первого входа.'; host.appendChild(p); return; }
            j.devices.forEach((d) => {
                const row = document.createElement('div'); row.className = 'ad-dev';
                row.innerHTML = `<span><b>${esc(d.name || 'Компьютер')}</b><small>${esc([d.country, d.ip, d.app ? 'v' + d.app : ''].filter(Boolean).join(', '))}</small></span><em>${esc(ago(d.last_seen_at))}</em>`;
                row.appendChild(btn('Отвязать', '', async () => {
                    if (!(await UI.confirm({ title: 'Отвязать этот компьютер?', text: 'На нём придётся снова ввести ключ.', ok: 'Отвязать', cancel: 'Отмена' }))) return;
                    try { await api('/api/admin/devices/' + d.id, null, 'DELETE'); UI.toast('Компьютер отвязан', 'ok'); refresh(); } catch (e) { UI.toast(e.message, 'bad'); }
                }));
                host.appendChild(row);
            });
        } catch (e) { if (e.message !== 'signin') host.textContent = e.message; }
    }
    async function act(k, body, done) {
        try {
            await api('/api/admin/keys/' + k.id, body);
            if (body.action === 'delete') open = null;
            UI.toast(done, 'ok');
            await refresh();
        } catch (e) { if (e.message !== 'signin') UI.toast(e.message === 'This key never expires.' ? 'Ключ и так бессрочный' : e.message, 'bad'); }
    }

    /* ---------- events ---------- */
    const EV = {
        activate: (e) => ['ok', `Вход: ${e.label}`, e.detail],
        activate_fail: (e) => ['bad', 'Неверный ключ', e.detail],
        activate_denied: (e) => ['warn', `Отказ: ${e.label}`, { revoked: 'ключ отозван', expired: 'срок истёк', devices: 'лимит компьютеров' }[e.detail] || e.detail],
        keys_created: (e) => ['', `Выданы ключи: ${e.label}`, e.detail],
        key_revoke: (e) => ['bad', `Отозван: ${e.label}`],
        key_restore: (e) => ['ok', `Возвращён: ${e.label}`],
        key_extend: (e) => ['ok', `Продлён: ${e.label}`, e.detail],
        key_forever: (e) => ['ok', `Бессрочный: ${e.label}`],
        key_devices: (e) => ['', `Лимит ПК: ${e.label}`, e.detail],
        key_reset: (e) => ['warn', `Сброшены ПК: ${e.label}`],
        key_delete: (e) => ['bad', `Удалён: ${e.label}`],
        device_removed: () => ['warn', 'Компьютер отвязан'],
        admin_login: () => ['', 'Вход в админку'],
        admin_fail: () => ['bad', 'Неверный пароль админки']
    };
    function renderEvents() {
        const host = $('events'); host.textContent = '';
        if (!data.events.length) { host.innerHTML = '<p class="hint">Пока пусто.</p>'; return; }
        data.events.slice(0, 60).forEach((e) => {
            const [cls, title, detail] = (EV[e.type] || ((x) => ['', x.type, x.detail]))(e);
            const row = document.createElement('div'); row.className = 'ad-ev ' + (cls || '');
            row.innerHTML = `<i></i><span><b>${esc(title)}</b>${detail ? `<small>${esc(detail)}</small>` : ''}</span><em title="${esc(new Date(e.t).toLocaleString('ru-RU'))}">${esc(ago(e.t))}${e.country ? ' · ' + esc(e.country) : ''}</em>`;
            host.appendChild(row);
        });
    }

    /* ---------- issue keys ---------- */
    let issueDays = 30;
    $('i-days').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        $('i-days').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        issueDays = Number(b.dataset.v);
    }));
    $('issue').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submit = e.target.querySelector('button[type=submit]');
        submit.classList.add('loading-btn');
        try {
            const j = await api('/api/admin/keys', { label: $('i-label').value.trim(), note: $('i-note').value.trim(), days: issueDays, devices: Number($('i-devices').value), count: Number($('i-count').value) || 1 });
            showCreated(j.created);
            $('i-label').value = ''; $('i-note').value = ''; $('i-count').value = '1';
            refresh();
        } catch (err) { if (err.message !== 'signin') UI.toast(err.message, 'bad'); }
        finally { submit.classList.remove('loading-btn'); }
    });

    function buyerMessage(k) {
        const term = k.durationDays ? `${days(k.durationDays)} с первого входа` : 'бессрочно';
        return [
            `Твой ключ Ledger: ${k.key}`,
            `Срок: ${term}. Компьютеров: ${k.maxDevices}.`,
            '',
            'Как запустить:',
            `1. Скачай Ledger: ${me.github || 'https://github.com/m4ks1em-maker/ledger'} (зелёная кнопка Code → Download ZIP) и распакуй.`,
            '2. Установи Node.js (LTS) с https://nodejs.org',
            '3. Запусти setup.bat один раз, потом start.bat.',
            '4. Вставь ключ на странице входа.',
            '',
            `Вопросы и продление: @${me.telegram}`
        ].join('\n');
    }
    async function copy(text, okMsg) {
        try { await navigator.clipboard.writeText(text); UI.toast(okMsg || 'Скопировано', 'ok'); }
        catch (_) { UI.toast('Не удалось скопировать: выдели текст и нажми Ctrl+C', 'bad'); }
    }
    function showCreated(list) {
        const back = document.createElement('div'); back.className = 'dialog-back';
        const box = document.createElement('div'); box.className = 'dialog ad-created'; box.setAttribute('role', 'dialog');
        const h = document.createElement('h3'); h.textContent = list.length > 1 ? `Готово: ${list.length} ${plural(list.length, 'ключ', 'ключа', 'ключей')}` : 'Ключ готов';
        const p = document.createElement('p'); p.textContent = 'Скопируй сейчас: в базе хранится только хэш, ключ больше не покажется.';
        box.append(h, p);
        list.forEach((k) => {
            const row = document.createElement('div'); row.className = 'ad-new';
            const code = document.createElement('code'); code.textContent = k.key;
            const who = document.createElement('small'); who.textContent = k.label;
            const acts = document.createElement('div'); acts.className = 'ad-actions';
            acts.append(btn('Ключ', '', () => copy(k.key, 'Ключ скопирован')), btn('Сообщение покупателю', 'accent', () => copy(buyerMessage(k), 'Сообщение скопировано, вставь его в Telegram')));
            const left = document.createElement('div'); left.append(code, who);
            row.append(left, acts); box.appendChild(row);
        });
        const foot = document.createElement('div'); foot.className = 'dialog-row';
        if (list.length > 1) foot.appendChild(btn('Все ключи списком', '', () => copy(list.map((k) => `${k.label}: ${k.key}`).join('\n'), 'Скопированы все ключи')));
        const done = document.createElement('button'); done.type = 'button'; done.className = 'btn primary-btn'; done.textContent = 'Готово';
        foot.appendChild(done); box.appendChild(foot);
        back.appendChild(box); document.body.appendChild(back);
        requestAnimationFrame(() => back.classList.add('in'));
        done.addEventListener('click', () => { back.classList.remove('in'); setTimeout(() => back.remove(), 220); });
    }

    /* ---------- filters ---------- */
    $('filter').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        $('filter').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        filter = b.dataset.f; renderKeys();
    }));
    let qt = null;
    $('search').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { query = $('search').value.trim(); renderKeys(); }, 120); });
    $('refresh').addEventListener('click', () => refresh().then(() => UI.toast('Обновлено', 'ok')));

    /* ---------- load ---------- */
    async function refresh() {
        data = await api('/api/admin/overview');
        renderStats(); renderKeys(); renderEvents();
    }
    async function boot() {
        try {
            me = await api('/api/admin/me');
            showApp();
            await refresh();
        } catch (e) { if (e.message !== 'signin') { showSignin(); $('signin-err').textContent = e.message; } }
    }
    setInterval(() => { if (!document.hidden && !$('app').classList.contains('hidden')) refresh().catch(() => {}); }, 60000);
    boot();
})();

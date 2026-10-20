// DotaTraker — global chat. Talks to the gate proxy at /_ledger/chat/*,
// which injects the license token + device, so identity comes from the key server.
(function () {
    'use strict';

    const esc = (s) => (window.LedgerUI && LedgerUI.esc) ? LedgerUI.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const TIERS = {
        admin:   { label: 'Админ',    cls: 'b-admin', ring: 'ring-admin', icon: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="2"/>' },
        forever: { label: 'Вечная',   cls: 'b-prem',  ring: 'ring-prem',  icon: '<path d="M12 2l3 5 5 1-3.5 3.5L17 17l-5-2.5L7 17l.5-5.5L4 8l5-1z"/>', suffix: '∞' },
        year:    { label: '1 год',    cls: 'b-year',  ring: '',           icon: '<path d="M5 18l2-9 4 5 1-8 1 8 4-5 2 9z"/>' },
        half:    { label: '6 мес',    cls: 'b-6mo',   ring: '',           icon: '<path d="M12 2l8 6-3 12H7L4 8z"/>' },
        quarter: { label: '3 мес',    cls: 'b-3mo',   ring: '',           icon: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/>' },
        month:   { label: '1 мес',    cls: 'b-1mo',   ring: '',           icon: '<circle cx="12" cy="12" r="5"/>' }
    };
    const ORDER = ['admin', 'forever', 'year', 'half', 'quarter', 'month'];

    const $ = (id) => document.getElementById(id);
    let msgsEl, bodyEl, inputEl, sendBtn, emptyEl, onlineEl, tipEl, gateEl, inbarEl, legendEl, nickBtn, badgeEl, chatTabBtn;
    let me = null, lastId = 0, firstId = 0, timer = null, seen = {}, atBottom = true, unread = 0, primed = false;
    let hasOlder = true, loadingOlder = false;
    const baseTitle = document.title;

    const chatActive = () => { const t = document.getElementById('chat-tab'); return t && t.classList.contains('active'); };

    function updateBadge() {
        if (!badgeEl) return;
        if (unread > 0 && !chatActive()) {
            badgeEl.textContent = unread > 99 ? '99+' : String(unread);
            badgeEl.classList.remove('hidden');
            document.title = '(' + (unread > 99 ? '99+' : unread) + ') ' + baseTitle;
        } else {
            badgeEl.classList.add('hidden');
            document.title = baseTitle;
        }
    }
    function clearUnread() { unread = 0; updateBadge(); }

    function api(sub, payload) {
        return fetch('/_ledger/chat/' + sub, {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' },
            body: JSON.stringify(payload || {})
        }).then(async (r) => {
            let j = {}; try { j = await r.json(); } catch (_) {}
            return { status: r.status, body: j };
        });
    }

    function badge(tier) {
        const T = TIERS[tier] || TIERS.month;
        return '<span class="chat-badge ' + T.cls + '"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + T.icon + '</svg>' + esc(T.label) + (T.suffix ? ' ' + T.suffix : '') + '</span>';
    }

    function avatarHtml(m) {
        const T = TIERS[m.tier] || TIERS.month;
        const ring = T.ring ? ' ' + T.ring : '';
        if (m.avatar) return '<div class="chat-av' + ring + '"><img src="' + esc(m.avatar) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></div>';
        const n = (m.steamId || m.nick || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const h = n % 360;
        return '<div class="chat-av' + ring + '" style="background:linear-gradient(135deg,hsl(' + h + ' 45% 55%),hsl(' + ((h + 40) % 360) + ' 40% 30%))"></div>';
    }

    const pad = (n) => String(n).padStart(2, '0');
    function fmtTime(t) { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
    function fmtFull(t) { try { return new Date(t).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); } catch (_) { return fmtTime(t); } }
    const dayKey = (t) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
    function dayLabel(t) {
        const d = new Date(t), today = new Date(), y = new Date(); y.setDate(today.getDate() - 1);
        if (dayKey(t) === dayKey(today.getTime())) return 'Сегодня';
        if (dayKey(t) === dayKey(y.getTime())) return 'Вчера';
        try { return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); } catch (_) { return pad(d.getDate()) + '.' + pad(d.getMonth() + 1); }
    }

    function nickClass(m) { return m.role === 'admin' ? 'admin' : (m.tier === 'forever' ? 'prem' : ''); }

    // turn @mentions into highlighted spans; the current user's nick gets a stronger style
    function renderBody(text) {
        const myNick = (me && me.nick || '').toLowerCase();
        let mentionsMe = false;
        const html = esc(text).replace(/@([^\s@.,!?;:()]{2,32})/g, (full, name) => {
            const self = myNick && name.toLowerCase() === myNick;
            if (self) mentionsMe = true;
            return '<span class="chat-at' + (self ? ' chat-at-me' : '') + '">@' + name + '</span>';
        });
        return { html, mentionsMe };
    }

    function msgHtml(m) {
        const canMod = me && me.isAdmin;
        const modBtn = canMod ? '<button class="chat-del" data-del="' + m.id + '" title="Удалить">✕</button>' : '';
        const rb = renderBody(m.body);
        return '<div class="chat-msg' + (rb.mentionsMe ? ' mention' : '') + '" data-id="' + m.id + '" data-day="' + dayKey(m.t) + '" data-steam="' + esc(m.steamId) + '" data-nick="' + esc(m.nick) + '" data-tier="' + esc(m.tier) + '">' +
            '<div class="chat-av-wrap" data-who="' + esc(m.steamId) + '">' + avatarHtml(m) + '</div>' +
            '<div class="chat-main">' +
                '<div class="chat-row1"><span class="chat-nick ' + nickClass(m) + '" data-who="' + esc(m.steamId) + '">' + esc(m.nick) + '</span>' + badge(m.tier) + '</div>' +
                '<div class="chat-text">' + rb.html + '</div>' +
            '</div>' +
            '<div class="chat-meta"><span class="chat-time" title="' + esc(fmtFull(m.t)) + '">' + fmtTime(m.t) + '</span>' + modBtn + '</div>' +
        '</div>';
    }

    // re-insert day dividers by scanning messages in order (handles both append & prepend)
    function relayoutDividers() {
        msgsEl.querySelectorAll('.chat-day').forEach((e) => e.remove());
        let prev = null;
        msgsEl.querySelectorAll('.chat-msg').forEach((el) => {
            const d = el.getAttribute('data-day');
            if (d !== prev) {
                const t = Number(el.getAttribute('data-id'));
                const div = document.createElement('div');
                div.className = 'chat-day';
                div.innerHTML = '<span>' + esc(dayLabel(messageTime(el))) + '</span>';
                msgsEl.insertBefore(div, el);
                prev = d;
            }
        });
    }
    const timeCache = {};
    function messageTime(el) { return timeCache[el.getAttribute('data-id')] || Date.now(); }

    function appendMessages(list) {
        const mySteam = (me && me.steamId) || '';
        let fresh = 0, mentionFresh = false, html = '';
        list.forEach((m) => {
            if (seen[m.id]) return;
            seen[m.id] = 1; timeCache[m.id] = m.t;
            if (m.id > lastId) lastId = m.id;
            if (!firstId || m.id < firstId) firstId = m.id;
            if (primed && m.steamId !== mySteam && !chatActive()) { fresh++; if ((me && me.nick) && (m.body || '').toLowerCase().indexOf('@' + me.nick.toLowerCase()) >= 0) mentionFresh = true; }
            html += msgHtml(m);
        });
        if (!html) return;
        if (emptyEl) emptyEl.style.display = 'none';
        msgsEl.insertAdjacentHTML('beforeend', html);
        relayoutDividers();
        if (atBottom) bodyEl.scrollTop = bodyEl.scrollHeight;
        if (fresh > 0) { unread += fresh; updateBadge(); if (mentionFresh) pingMention(); }
        primed = true;
    }

    function prependMessages(list) {
        let html = '';
        const fresh = list.filter((m) => !seen[m.id]);
        if (!fresh.length) return;
        fresh.forEach((m) => { seen[m.id] = 1; timeCache[m.id] = m.t; if (!firstId || m.id < firstId) firstId = m.id; if (m.id > lastId) lastId = m.id; html += msgHtml(m); });
        const prevH = bodyEl.scrollHeight, prevT = bodyEl.scrollTop;
        msgsEl.insertAdjacentHTML('afterbegin', html);
        relayoutDividers();
        bodyEl.scrollTop = prevT + (bodyEl.scrollHeight - prevH); // keep view anchored
    }

    function pingMention() { if (badgeEl) badgeEl.classList.add('is-mention'); }

    function setGate(text) {
        if (!gateEl) return;
        if (!text) { gateEl.classList.add('hidden'); if (inbarEl) inbarEl.classList.remove('hidden'); return; }
        gateEl.classList.remove('hidden'); gateEl.innerHTML = text;
        if (inbarEl) inbarEl.classList.add('hidden');
    }

    function setOnline(n) {
        if (!onlineEl || n == null) return;
        const span = onlineEl.querySelector('span');
        if (span) span.textContent = n + (n === 1 ? ' онлайн' : ' онлайн');
    }

    async function poll() {
        const r = await api('history', { after: lastId });
        if (r.status === 401 && r.body.code === 'unknown') { setGate('Введите ключ на главной, чтобы открыть чат.'); return; }
        if (r.status === 403 && r.body.code === 'steam') { setGate('Войдите через Steam, чтобы писать в чат. <a href="/_ledger/steam/start">Войти через Steam</a>'); if (emptyEl) emptyEl.textContent = 'Войдите через Steam, чтобы читать чат.'; return; }
        if (r.status !== 200 || !r.body.ok) return;
        me = r.body.me || me;
        if (typeof r.body.online === 'number') setOnline(r.body.online);
        if (lastId === 0 && typeof r.body.older === 'boolean') hasOlder = r.body.older;
        if (me && me.banned) { setGate('Вы заблокированы в чате.'); }
        else if (me && me.mutedUntil && me.mutedUntil > Date.now()) { setGate('Вы в муте до ' + new Date(me.mutedUntil).toLocaleTimeString()); }
        else setGate('');
        appendMessages(r.body.messages || []);
        buildLegend();
    }

    async function loadOlder() {
        if (loadingOlder || !hasOlder || !firstId) return;
        loadingOlder = true;
        const r = await api('history', { before: firstId });
        if (r.status === 200 && r.body.ok) {
            prependMessages(r.body.messages || []);
            hasOlder = !!r.body.older;
        }
        loadingOlder = false;
    }

    function buildLegend() {
        if (!legendEl || legendEl.childElementCount) return;
        legendEl.innerHTML = ORDER.map((t) => badge(t)).join('');
    }

    async function send() {
        const text = (inputEl.value || '').trim();
        if (!text) return;
        inputEl.value = '';
        const r = await api('send', { body: text });
        if (r.status === 200 && r.body.ok) { atBottom = true; appendMessages([r.body.message]); }
        else if (r.body && r.body.code === 'cooldown') { toast('Слишком часто, подожди секунду'); inputEl.value = text; }
        else if (r.body && r.body.code === 'muted') { toast('Вы в муте'); }
        else if (r.body && r.body.code === 'banned') { setGate('Вы заблокированы в чате.'); }
        else if (r.body && r.body.error) { toast(r.body.error); inputEl.value = text; }
    }

    function toast(t) { if (window.LedgerUI && LedgerUI.toast) LedgerUI.toast(t); }

    function showTip(anchor, steamId, nick, tier) {
        if (!tipEl) return;
        const T = TIERS[tier] || TIERS.month;
        const admin = me && me.isAdmin && steamId && steamId !== (me.steamId || '');
        let mod = '';
        if (admin) {
            mod = '<div class="tip-mod">' +
                '<button data-mod="mute" data-t="' + esc(steamId) + '">Мут 10м</button>' +
                '<button data-mod="ban" data-t="' + esc(steamId) + '">Бан</button>' +
                '<button data-mod="unban" data-t="' + esc(steamId) + '">Разбан</button>' +
            '</div>';
        }
        const reply = '<div class="tip-mod"><button data-reply="' + esc(nick) + '">Ответить @' + esc(nick) + '</button></div>';
        tipEl.innerHTML = '<div class="tip-head"><div class="tip-name">' + esc(nick) + '</div>' + badge(tier) + '</div>' +
            '<div class="tip-rows"><div><span>Статус</span><b>' + esc(T.label) + (T.suffix ? ' ' + T.suffix : '') + '</b></div>' +
            '<div><span>Steam ID</span><b>' + esc(String(steamId).slice(0, 10)) + '…</b></div></div>' + reply + mod;
        const r = anchor.getBoundingClientRect();
        tipEl.classList.remove('hidden');
        const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
        let left = r.left, top = r.bottom + 8;
        if (left + tw > window.innerWidth - 12) left = window.innerWidth - tw - 12;
        if (top + th > window.innerHeight - 12) top = r.top - th - 8;
        tipEl.style.left = Math.max(12, left) + 'px';
        tipEl.style.top = Math.max(12, top) + 'px';
    }
    function hideTip() { if (tipEl) tipEl.classList.add('hidden'); }

    async function moderate(action, payload) {
        const r = await api('moderate', Object.assign({ action: action }, payload));
        if (r.status === 200 && r.body.ok) {
            toast('Готово');
            if (action === 'delete' && payload.id) { const el = msgsEl.querySelector('.chat-msg[data-id="' + payload.id + '"]'); if (el) el.remove(); relayoutDividers(); }
            if ((action === 'ban') && payload.target) { msgsEl.querySelectorAll('.chat-msg[data-steam="' + payload.target + '"]').forEach((e) => e.remove()); relayoutDividers(); }
            hideTip();
        } else { toast((r.body && r.body.error) || 'Ошибка'); }
    }

    function wire() {
        sendBtn.addEventListener('click', send);
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
        bodyEl.addEventListener('scroll', () => {
            atBottom = bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight < 60;
            if (bodyEl.scrollTop < 80) loadOlder();
        });

        msgsEl.addEventListener('click', (e) => {
            const del = e.target.closest('[data-del]');
            if (del) { moderate('delete', { id: Number(del.getAttribute('data-del')) }); return; }
            const who = e.target.closest('[data-who]');
            if (who) {
                const msg = who.closest('.chat-msg');
                showTip(who, msg.getAttribute('data-steam'), msg.getAttribute('data-nick'), msg.getAttribute('data-tier'));
            }
        });
        if (tipEl) tipEl.addEventListener('click', (e) => {
            const rep = e.target.closest('[data-reply]');
            if (rep) { inputEl.value = (inputEl.value ? inputEl.value.trim() + ' ' : '') + '@' + rep.getAttribute('data-reply') + ' '; inputEl.focus(); hideTip(); return; }
            const b = e.target.closest('[data-mod]');
            if (!b) return;
            const action = b.getAttribute('data-mod'), target = b.getAttribute('data-t');
            moderate(action, action === 'mute' ? { target: target, minutes: 10 } : { target: target });
        });
        document.addEventListener('click', (e) => { if (tipEl && !tipEl.contains(e.target) && !e.target.closest('[data-who]')) hideTip(); });

        if (nickBtn) nickBtn.addEventListener('click', async () => {
            const cur = (me && me.nick) || '';
            const v = window.prompt('Ваш ник в чате:', cur);
            if (v == null) return;
            const r = await api('nick', { nick: v.trim() });
            if (r.status === 200 && r.body.ok) { toast('Ник обновлён'); if (me) me.nick = r.body.nick; }
            else toast((r.body && r.body.error) || 'Не удалось');
        });
    }

    function startPolling() {
        if (timer) return;
        poll();
        let tick = 0;
        timer = setInterval(() => {
            tick++;
            if (chatActive() || tick % 3 === 0) poll();
        }, 3000);
    }

    function init() {
        msgsEl = $('chat-msgs'); bodyEl = $('chat-body'); inputEl = $('chat-input'); sendBtn = $('chat-send');
        emptyEl = $('chat-empty'); onlineEl = $('chat-online'); tipEl = $('chat-tip'); gateEl = $('chat-gate');
        inbarEl = $('chat-inbar'); legendEl = $('chat-legend'); nickBtn = $('chat-nick-btn'); badgeEl = $('chat-badge');
        if (!msgsEl) return;
        wire();
        chatTabBtn = document.querySelector('.workflow-tab[data-tab="chat"]');
        if (chatTabBtn) chatTabBtn.addEventListener('click', () => { clearUnread(); if (badgeEl) badgeEl.classList.remove('is-mention'); setTimeout(() => { bodyEl.scrollTop = bodyEl.scrollHeight; poll(); }, 60); });
        startPolling();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

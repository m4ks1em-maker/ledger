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
    let msgsEl, bodyEl, inputEl, sendBtn, emptyEl, onlineEl, tipEl, gateEl, inbarEl, legendEl, nickBtn;
    let me = null, lastId = 0, timer = null, started = false, seen = {}, atBottom = true;

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
        // deterministic gradient fallback from steamId
        const n = (m.steamId || m.nick || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const h = n % 360;
        return '<div class="chat-av' + ring + '" style="background:linear-gradient(135deg,hsl(' + h + ' 45% 55%),hsl(' + ((h + 40) % 360) + ' 40% 30%))"></div>';
    }

    function fmtTime(t) {
        const d = new Date(t);
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function nickClass(m) { return m.role === 'admin' ? 'admin' : (m.tier === 'forever' ? 'prem' : ''); }

    function msgHtml(m) {
        const canMod = me && me.isAdmin;
        const modBtn = canMod ? '<button class="chat-del" data-del="' + m.id + '" title="Удалить">✕</button>' : '';
        return '<div class="chat-msg" data-id="' + m.id + '" data-steam="' + esc(m.steamId) + '" data-nick="' + esc(m.nick) + '" data-tier="' + esc(m.tier) + '">' +
            '<div class="chat-av-wrap" data-who="' + esc(m.steamId) + '">' + avatarHtml(m) + '</div>' +
            '<div class="chat-main">' +
                '<div class="chat-row1"><span class="chat-nick ' + nickClass(m) + '" data-who="' + esc(m.steamId) + '">' + esc(m.nick) + '</span>' + badge(m.tier) + '</div>' +
                '<div class="chat-text">' + esc(m.body) + '</div>' +
            '</div>' +
            '<div class="chat-meta"><span class="chat-time">' + fmtTime(m.t) + '</span>' + modBtn + '</div>' +
        '</div>';
    }

    function render(messages, append) {
        if (!messages.length && !append && lastId === 0) return;
        const html = messages.filter((m) => !seen[m.id]).map((m) => { seen[m.id] = 1; if (m.id > lastId) lastId = m.id; return msgHtml(m); }).join('');
        if (!html) return;
        if (emptyEl) emptyEl.style.display = 'none';
        msgsEl.insertAdjacentHTML('beforeend', html);
        if (atBottom) bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    function setGate(text) {
        if (!gateEl) return;
        if (!text) { gateEl.classList.add('hidden'); if (inbarEl) inbarEl.classList.remove('hidden'); return; }
        gateEl.classList.remove('hidden'); gateEl.innerHTML = text;
        if (inbarEl) inbarEl.classList.add('hidden');
    }

    async function poll() {
        const r = await api('history', { after: lastId });
        if (r.status === 401 && r.body.code === 'unknown') { setGate('Введите ключ на главной, чтобы открыть чат.'); return; }
        if (r.status === 403 && r.body.code === 'steam') { setGate('Войдите через Steam, чтобы писать в чат. <a href="/_ledger/steam/start">Войти через Steam</a>'); if (emptyEl) emptyEl.textContent = 'Войдите через Steam, чтобы читать чат.'; return; }
        if (r.status !== 200 || !r.body.ok) return;
        me = r.body.me || me;
        if (me && me.banned) { setGate('Вы заблокированы в чате.'); }
        else if (me && me.mutedUntil && me.mutedUntil > Date.now()) { setGate('Вы в муте до ' + new Date(me.mutedUntil).toLocaleTimeString()); }
        else setGate('');
        render(r.body.messages || [], lastId > 0);
        buildLegend();
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
        if (r.status === 200 && r.body.ok) { render([r.body.message], true); }
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
        tipEl.innerHTML = '<div class="tip-head"><div class="tip-name">' + esc(nick) + '</div>' + badge(tier) + '</div>' +
            '<div class="tip-rows"><div><span>Статус</span><b>' + esc(T.label) + (T.suffix ? ' ' + T.suffix : '') + '</b></div>' +
            '<div><span>Steam ID</span><b>' + esc(String(steamId).slice(0, 10)) + '…</b></div></div>' + mod;
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
            if (action === 'delete' && payload.id) { const el = msgsEl.querySelector('.chat-msg[data-id="' + payload.id + '"]'); if (el) el.remove(); }
            if ((action === 'ban') && payload.target) { msgsEl.querySelectorAll('.chat-msg[data-steam="' + payload.target + '"]').forEach((e) => e.remove()); }
            hideTip();
        } else { toast((r.body && r.body.error) || 'Ошибка'); }
    }

    function wire() {
        sendBtn.addEventListener('click', send);
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
        bodyEl.addEventListener('scroll', () => { atBottom = bodyEl.scrollHeight - bodyEl.scrollTop - bodyEl.clientHeight < 60; });

        // delete + tooltip clicks (delegated)
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
        if (!timer) { poll(); timer = setInterval(() => { if (document.getElementById('chat-tab').classList.contains('active')) poll(); }, 3000); }
    }

    function init() {
        msgsEl = $('chat-msgs'); bodyEl = $('chat-body'); inputEl = $('chat-input'); sendBtn = $('chat-send');
        emptyEl = $('chat-empty'); onlineEl = $('chat-online'); tipEl = $('chat-tip'); gateEl = $('chat-gate');
        inbarEl = $('chat-inbar'); legendEl = $('chat-legend'); nickBtn = $('chat-nick-btn');
        if (!msgsEl) return;
        wire();
        const chatTabBtn = document.querySelector('.workflow-tab[data-tab="chat"]');
        if (chatTabBtn) chatTabBtn.addEventListener('click', () => { if (!started) { started = true; startPolling(); } else poll(); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

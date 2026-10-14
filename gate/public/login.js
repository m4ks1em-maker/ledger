(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const form = $('form'), input = $('key'), err = $('error'), btn = $('submit'), dots = $('dots'), paste = $('paste');
    const T = (s) => (window.LedgerI18n ? window.LedgerI18n.t(s) : s);
    let telegram = 'm4ks1em';

    // 16 dots, one per key symbol, in four groups like the key itself
    for (let g = 0; g < 4; g++) {
        const grp = document.createElement('span');
        for (let i = 0; i < 4; i++) grp.appendChild(document.createElement('i'));
        dots.appendChild(grp);
    }
    const dotEls = dots.querySelectorAll('i');

    const ALPHABET = /[^ABCDEFGHJKMNPQRSTVWXYZ2-9]/g;   // the symbols keys are made of (no I L O U 0 1)
    function symbols(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LDG/, '').replace(ALPHABET, '').slice(0, 16); }
    function format(s) { return s ? 'LDG-' + (s.match(/.{1,4}/g) || []).join('-') : ''; }

    function paint() {
        const s = symbols(input.value);
        dotEls.forEach((d, i) => d.classList.toggle('on', i < s.length));
        dots.classList.toggle('full', s.length === 16);
        btn.disabled = s.length !== 16;
        return s;
    }
    input.addEventListener('input', () => {
        const before = input.value;
        const caretAtEnd = input.selectionStart === before.length;
        const next = format(symbols(before));
        if (next !== before && caretAtEnd) input.value = next;
        paint();
        clearError();
    });
    input.addEventListener('blur', () => { const s = symbols(input.value); if (s) input.value = format(s); });

    paste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            input.value = format(symbols(text)); paint(); clearError(); input.focus();
        } catch (_) { input.focus(); window.LedgerUI && LedgerUI.toast(T('Press Ctrl+V to paste the key.'), 'info'); }
    });

    function clearError() { err.textContent = ''; err.className = 'gate-error'; }
    function showError(message, code) {
        err.textContent = '';
        err.className = 'gate-error show';
        const p = document.createElement('span'); p.textContent = T(message || 'Could not sign in.');
        err.appendChild(p);
        const action = { expired: 'Renew it in Telegram', revoked: 'Buy one in Telegram', devices: 'Ask for a reset in Telegram', invalid: 'Buy one in Telegram' }[code];
        if (action) {
            const a = document.createElement('a');
            a.href = 'https://t.me/' + encodeURIComponent(telegram); a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.textContent = T(action) + ' @' + telegram;
            err.appendChild(a);
        }
        form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const s = paint();
        if (s.length !== 16) { showError('Invalid key', 'invalid'); input.focus(); return; }
        btn.disabled = true; btn.classList.add('loading-btn'); clearError();
        form.classList.add('busy');
        try {
            const r = await fetch('/_ledger/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' },
                body: JSON.stringify({ key: format(s) })
            });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.ok) {
                form.classList.remove('busy'); form.classList.add('success');
                setTimeout(() => location.replace('/'), window.LedgerUI && LedgerUI.reduced() ? 0 : 650);
                return;
            }
            showError(j.error || 'Could not sign in.', j.code);
            input.select();
        } catch (_) {
            showError('Cannot reach the key server. Check your internet connection.', 'offline');
        } finally {
            if (!form.classList.contains('success')) { btn.classList.remove('loading-btn'); paint(); form.classList.remove('busy'); }
        }
    });

    // card light follows the pointer
    form.addEventListener('pointermove', (e) => { const r = form.getBoundingClientRect(); form.style.setProperty('--mx', (e.clientX - r.left) + 'px'); form.style.setProperty('--my', (e.clientY - r.top) + 'px'); });

    /* ---------- pricing ---------- */
    function periodName(days) {
        if (!days) return 'Forever';
        if (days === 365) return '1 year';
        return days + (days === 1 ? ' day' : ' days');
    }
    function perDay(p) {
        if (!p.days) return 'One payment, yours for good';
        const v = p.usd / p.days;
        return '$' + (v >= 0.1 ? v.toFixed(2) : v.toFixed(3).replace(/0$/, '')) + ' a day';
    }
    function renderPrices(list) {
        const box = $('prices'); box.textContent = '';
        list.forEach((p, i) => {
            const a = document.createElement('a');
            a.className = 'price-row' + (p.tag === 'best' ? ' best' : '');
            a.href = 'https://t.me/' + encodeURIComponent(telegram); a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.style.animationDelay = (0.32 + i * 0.06) + 's';
            const name = document.createElement('span'); name.className = 'pr-name';
            const nm = document.createElement('span'); nm.textContent = periodName(Number(p.days) || 0); name.appendChild(nm);
            if (p.tag === 'popular' || p.tag === 'best') { const t = document.createElement('span'); t.className = 'pr-tag'; t.textContent = p.tag === 'best' ? 'Best value' : 'Popular'; name.appendChild(t); }
            const sub = document.createElement('span'); sub.className = 'pr-sub'; sub.textContent = perDay({ days: Number(p.days) || 0, usd: Number(p.usd) || 0 });
            const price = document.createElement('span'); price.className = 'pr-price';
            const cur = document.createElement('small'); cur.textContent = '$';
            price.append(cur, document.createTextNode(String(Number(p.usd) || 0)));
            a.append(name, price, sub);
            box.appendChild(a);
        });
    }
    renderPrices([{ days: 7, usd: 1 }, { days: 30, usd: 2, tag: 'popular' }, { days: 90, usd: 5 }, { days: 365, usd: 15 }, { days: 0, usd: 30, tag: 'best' }]);

    /* ---------- Steam ---------- */
    const steamMsg = {
        ok: ['Steam account linked. Now enter your key.', 'ok'],
        other: ['This key is linked to another Steam account.', 'bad'],
        cancel: ['Steam sign-in was cancelled.', 'bad'],
        expired: ['The Steam sign-in took too long. Try again.', 'bad'],
        fail: ['Steam could not confirm the sign-in. Try again.', 'bad'],
        offline: ['Cannot reach Steam. Check your internet connection.', 'bad']
    };
    function renderSteam(st) {
        if (!st) return;
        $('steam-btn').classList.add('hidden');
        $('steam-me').classList.remove('hidden');
        $('steam-name').textContent = st.name || st.id;
        if (st.avatar) $('steam-av').src = st.avatar; else $('steam-av').removeAttribute('src');
    }
    const q = new URLSearchParams(location.search).get('steam');
    if (q && steamMsg[q]) {
        const n = $('steam-note'); n.textContent = steamMsg[q][0]; n.className = 'steam-note ' + steamMsg[q][1];
        history.replaceState(null, '', '/login');
    }

    // contact, prices, Steam and the reason we are here (key expired, revoked, offline...)
    fetch('/_ledger/info', { cache: 'no-store' }).then((r) => r.json()).then((info) => {
        if (info.telegram) {
            telegram = info.telegram;
            ['buy', 'price-cta'].forEach((id) => { $(id).href = 'https://t.me/' + encodeURIComponent(telegram); });
            $('buy-handle').textContent = '@' + telegram; $('price-handle').textContent = '@' + telegram;
            const fb = $('feat-buy'); if (fb) fb.href = 'https://t.me/' + encodeURIComponent(telegram);
        }
        if (info.github) { const fg = $('feat-gh'); if (fg) fg.href = info.github; }
        if (Array.isArray(info.prices) && info.prices.length) renderPrices(info.prices);
        renderSteam(info.steam);
        if (window.LedgerUI) LedgerUI.updateBar($('update'), info.update, info.github);
        if (!info.configured) showError('The key server address is not set in ledger.config.json.', 'setup');
        else if (info.denied && info.denied.code) showError(info.denied.message, info.denied.code);
        else if (info.problem === 'expired') showError('This key has expired.', 'expired');
        else if (info.problem === 'offline') showError('Cannot reach the key server. Check your internet connection.', 'offline');
    }).catch(() => {});

    // Sign in / Features switch
    (function switchView() {
        const sw = document.querySelector('.gate-switch'), vSign = $('view-signin'), vFeat = $('view-features');
        const bSign = $('sw-signin'), bFeat = $('sw-features');
        if (!sw || !vSign || !vFeat) return;
        function show(features) {
            sw.classList.toggle('f', features);
            bSign.classList.toggle('on', !features); bFeat.classList.toggle('on', features);
            bSign.setAttribute('aria-selected', String(!features)); bFeat.setAttribute('aria-selected', String(features));
            vSign.classList.toggle('hidden', features); vFeat.classList.toggle('hidden', !features);
            const shown = features ? vFeat : vSign;
            shown.style.animation = 'none'; void shown.offsetWidth; shown.style.animation = '';
            try { history.replaceState(null, '', features ? '#features' : '/login'); } catch (_) {}
        }
        bSign.addEventListener('click', () => show(false));
        bFeat.addEventListener('click', () => show(true));
        if (location.hash === '#features') show(true);
    })();

    paint();
    setTimeout(() => input.focus({ preventScroll: true }), 450);
})();

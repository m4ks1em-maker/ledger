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
        const s = symbols(before);
        const next = format(s);
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

    // contact and the reason we are here (key expired, revoked, offline...)
    fetch('/_ledger/info', { cache: 'no-store' }).then((r) => r.json()).then((info) => {
        if (info.telegram) {
            telegram = info.telegram;
            $('buy').href = 'https://t.me/' + encodeURIComponent(telegram);
            $('buy-handle').textContent = '@' + telegram;
        }
        if (!info.configured) showError('The key server address is not set in ledger.config.json.', 'setup');
        else if (info.denied && info.denied.code) showError(info.denied.message, info.denied.code);
        else if (info.problem === 'expired') showError('This key has expired.', 'expired');
        else if (info.problem === 'offline') showError('Cannot reach the key server. Check your internet connection.', 'offline');
    }).catch(() => {});

    paint();
    setTimeout(() => input.focus(), 350);
})();

(function () {
    'use strict';
    const form = document.getElementById('form');
    const input = document.getElementById('key');
    const err = document.getElementById('error');
    const btn = document.getElementById('submit');
    const reveal = document.getElementById('reveal');

    reveal.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        reveal.textContent = show ? 'Hide' : 'Show';
        reveal.setAttribute('aria-pressed', String(show));
        input.focus();
    });

    input.addEventListener('input', () => { err.textContent = ''; });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const key = input.value.trim();
        if (!key) { err.textContent = 'Enter your access key.'; input.focus(); return; }

        btn.disabled = true;
        btn.classList.add('loading-btn');
        err.textContent = '';
        try {
            const r = await fetch('/_ledger/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' },
                body: JSON.stringify({ key })
            });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.ok) { location.replace('/'); return; }
            err.textContent = j.error || 'Could not sign in.';
            form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
            input.select();
        } catch (_) {
            err.textContent = 'Cannot reach the server. Check your connection.';
        } finally {
            btn.disabled = false;
            btn.classList.remove('loading-btn');
        }
    });
})();

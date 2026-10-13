// DotaTraker UI kit: shared helpers loaded before the app.
//  - esc(): HTML-escape anything that came from a replay (player names are attacker-controlled)
//  - fetchWithRetry(): timeouts that don't cut long downloads, no blind re-sending of POSTs
//  - toasts instead of alert(), a real dialog instead of confirm()
//  - the sliding "liquid" indicator under tab bars, count-up numbers, theme colours for canvases
(function () {
    'use strict';
    const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- escaping ---------- */
    const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC[c]);
    window.esc = esc;
    // the English text of an element, even while it is shown in Russian (app code compares button labels)
    window.srcText = (el) => (el ? (window.LedgerI18n && window.LedgerI18n.src ? window.LedgerI18n.src(el) : el.textContent) : '');

    /* ---------- fetch ---------- */
    window.fetchWithRetry = async function fetchWithRetry(url, options = {}, maxRetries = 3, baseDelay = 1000) {
        const method = String(options.method || 'GET').toUpperCase();
        const idempotent = method === 'GET' || method === 'HEAD' || options.retry === true;
        const timeoutMs = options.timeout || 30000;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            const outer = options.signal;
            const relay = () => controller.abort();
            if (outer) { if (outer.aborted) controller.abort(); else outer.addEventListener('abort', relay, { once: true }); }
            try {
                const init = Object.assign({}, options, { signal: controller.signal });
                delete init.timeout; delete init.retry;
                const response = await fetch(url, init);
                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    let msg = text;
                    try { const j = JSON.parse(text); msg = j.error || j.message || text; } catch (_) {}
                    const err = new Error((msg || `HTTP ${response.status}`).trim().slice(0, 300));
                    err.status = response.status;
                    throw err;
                }
                return response;
            } catch (error) {
                lastError = error;
                const userAborted = outer && outer.aborted;
                const network = error.name === 'AbortError' || /Failed to fetch|NetworkError|Load failed/i.test(error.message || '');
                const retryable = !userAborted && attempt < maxRetries && ((network && idempotent) || (error.status >= 500 && error.status !== 501 && idempotent));
                if (!retryable) throw error;
                await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
            } finally {
                clearTimeout(timer);
                if (outer) outer.removeEventListener('abort', relay);
            }
        }
        throw lastError;
    };

    // A key that is revoked or expires while the app is open: go back to the sign-in screen.
    const rawFetch = window.fetch.bind(window);
    let leaving = false;
    window.fetch = function (input, init) {
        const p = rawFetch(input, init);
        return p.then((r) => {
            try {
                const u = new URL(typeof input === 'string' ? input : input.url, location.href);
                if (r.status === 401 && !leaving && !document.documentElement.hasAttribute('data-no-redirect') && u.origin === location.origin && /^\/(api|_ledger)\//.test(u.pathname) && !/^\/_ledger\/(login|info)/.test(u.pathname) && location.pathname !== '/login') {
                    leaving = true;
                    setTimeout(() => { location.href = '/login'; }, 50);
                }
            } catch (_) {}
            return r;
        });
    };

    /* ---------- toasts ---------- */
    let stack = null;
    function ensureStack() {
        if (stack && document.body.contains(stack)) return stack;
        stack = document.createElement('div');
        stack.className = 'toast-stack';
        stack.setAttribute('role', 'status');
        stack.setAttribute('aria-live', 'polite');
        document.body.appendChild(stack);
        return stack;
    }
    function kindOf(msg) {
        if (/error|fail|could not|cannot|invalid|не удалось|ошибк|required|timeout|denied/i.test(msg)) return 'bad';
        if (/saved|success|done|downloaded|copied|готово|сохран/i.test(msg)) return 'ok';
        return 'info';
    }
    function toast(message, kind, ms) {
        const text = String(message == null ? '' : message);
        if (!document.body) { console.log(text); return; }
        const k = kind || kindOf(text);
        const el = document.createElement('div');
        el.className = 'toast ' + k;
        const dot = document.createElement('i'); dot.className = 'toast-dot';
        const span = document.createElement('span'); span.textContent = text;
        const x = document.createElement('button'); x.type = 'button'; x.className = 'toast-x'; x.setAttribute('aria-label', 'Close'); x.textContent = '×';
        const bar = document.createElement('b'); bar.className = 'toast-bar';
        el.append(dot, span, x, bar);
        ensureStack().appendChild(el);
        const life = ms || Math.min(9000, 3200 + text.length * 35);
        bar.style.animationDuration = life + 'ms';
        let gone = false;
        const close = () => {
            if (gone) return; gone = true;
            el.classList.add('out');
            setTimeout(() => el.remove(), reduced() ? 0 : 320);
        };
        x.addEventListener('click', close);
        let t = setTimeout(close, life);
        el.addEventListener('mouseenter', () => { clearTimeout(t); el.classList.add('hold'); });
        el.addEventListener('mouseleave', () => { el.classList.remove('hold'); t = setTimeout(close, 1800); });
        while (stack.children.length > 4) stack.firstChild.remove();
        return close;
    }
    window.alert = (m) => { toast(m); };

    /* ---------- confirm dialog ---------- */
    function confirmBox(opts) {
        const o = typeof opts === 'string' ? { text: opts } : (opts || {});
        return new Promise((resolve) => {
            const back = document.createElement('div');
            back.className = 'dialog-back';
            const box = document.createElement('div');
            box.className = 'dialog';
            box.setAttribute('role', 'alertdialog');
            box.setAttribute('aria-modal', 'true');
            const h = document.createElement('h3'); h.textContent = o.title || 'Are you sure?';
            const p = document.createElement('p'); p.textContent = o.text || '';
            const row = document.createElement('div'); row.className = 'dialog-row';
            const no = document.createElement('button'); no.type = 'button'; no.className = 'btn secondary-btn'; no.textContent = o.cancel || 'Cancel';
            const yes = document.createElement('button'); yes.type = 'button'; yes.className = 'btn ' + (o.danger === false ? 'primary-btn' : 'danger-solid'); yes.textContent = o.ok || 'Delete';
            row.append(no, yes);
            box.append(h);
            if (o.text) box.append(p);
            box.append(row);
            back.appendChild(box);
            document.body.appendChild(back);
            const prev = document.activeElement;
            requestAnimationFrame(() => back.classList.add('in'));
            yes.focus();
            const done = (v) => {
                back.classList.remove('in'); back.classList.add('out');
                document.removeEventListener('keydown', key, true);
                setTimeout(() => back.remove(), reduced() ? 0 : 220);
                if (prev && prev.focus) prev.focus();
                resolve(v);
            };
            const key = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); done(false); }
                if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === yes ? no : yes).focus(); }
            };
            document.addEventListener('keydown', key, true);
            no.addEventListener('click', () => done(false));
            yes.addEventListener('click', () => done(true));
            back.addEventListener('mousedown', (e) => { if (e.target === back) done(false); });
        });
    }

    /* ---------- sliding indicator ("glider") under segmented controls ---------- */
    function glider(container, itemSelector) {
        if (!container || container.__glider) return;
        const g = document.createElement('span');
        g.className = 'glider';
        g.setAttribute('aria-hidden', 'true');
        container.insertBefore(g, container.firstChild);
        container.__glider = g;
        let cur = null;
        const place = (animate) => {
            const el = container.querySelector(itemSelector + '.active');
            if (!el || !el.offsetWidth) { g.style.opacity = '0'; return; }
            const to = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
            g.style.opacity = '1';
            if (animate && cur && !reduced() && g.animate && (cur.x !== to.x || cur.w !== to.w)) {
                const left = Math.min(cur.x, to.x), right = Math.max(cur.x + cur.w, to.x + to.w);
                g.animate([
                    { transform: `translate(${cur.x}px, ${cur.y}px)`, width: cur.w + 'px' },
                    { transform: `translate(${left}px, ${to.y}px)`, width: (right - left) + 'px', offset: 0.42 },
                    { transform: `translate(${to.x}px, ${to.y}px)`, width: to.w + 'px' }
                ], { duration: 560, easing: 'cubic-bezier(.3,.75,.2,1)' });
            }
            g.style.transform = `translate(${to.x}px, ${to.y}px)`;
            g.style.width = to.w + 'px';
            g.style.height = to.h + 'px';
            cur = to;
        };
        new MutationObserver(() => place(true)).observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });
        window.addEventListener('resize', () => place(false));
        document.addEventListener('ledger:lang', () => requestAnimationFrame(() => place(false)));
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(false));
        requestAnimationFrame(() => place(false));
        setTimeout(() => place(false), 400);
    }

    /* ---------- count-up numbers ---------- */
    // Every frame we write is remembered in el.__mine, so the observer below can tell our own writes
    // (which arrive asynchronously) from a new value the app put there.
    function write(el, text, value) { el.__mine = text; el.__shown = value; el.textContent = text; }
    function animate(el, from, to, decimals) {
        cancelAnimationFrame(el.__raf);
        if (reduced() || from === to) { write(el, to.toFixed(decimals), to); return; }
        const t0 = performance.now(), dur = 700;
        const step = (t) => {
            const k = Math.min(1, (t - t0) / dur);
            const e = 1 - Math.pow(1 - k, 3);
            const v = k === 1 ? to : from + (to - from) * e;
            write(el, v.toFixed(decimals), v);
            if (k < 1) el.__raf = requestAnimationFrame(step);
        };
        el.__raf = requestAnimationFrame(step);
    }
    function countTo(el, target) {
        if (!el) return;
        const to = Number(target);
        if (!isFinite(to)) { write(el, String(target), null); return; }
        const decimals = String(target).includes('.') ? String(target).split('.')[1].length : 0;
        const from = typeof el.__shown === 'number' ? el.__shown : (Number(el.textContent) || 0);
        animate(el, from, to, decimals);
    }
    function watchNumbers(root) {
        (root || document).querySelectorAll('.stat-value').forEach((el) => {
            if (el.__watched) return; el.__watched = true;
            el.__shown = Number(el.textContent) || 0; el.__mine = el.textContent;
            new MutationObserver(() => {
                const v = el.textContent.trim();
                if (v === el.__mine || !/^-?\d+$/.test(v)) return;
                const from = typeof el.__shown === 'number' ? el.__shown : Number(v);
                write(el, String(Math.round(from)), from);
                animate(el, from, Number(v), 0);
            }).observe(el, { childList: true, characterData: true, subtree: true });
        });
    }

    /* ---------- canvas colours that follow the theme ---------- */
    function canvasTheme() {
        const cs = getComputedStyle(document.documentElement);
        const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
        return {
            bg: v('--cv-bg', '#0d1326'), row: v('--cv-row', '#121a33'), line: v('--cv-line', '#26304d'), grid: v('--cv-grid', '#2b3657'),
            text: v('--text-primary', '#eaf0ff'), muted: v('--text-secondary', '#a3adc7'), faint: v('--text-tertiary', '#6b7591'),
            chip: v('--cv-chip', '#2b3657'), chipText: v('--text-primary', '#eaf0ff'),
            good: v('--radiant', '#3ddbb0'), bad: v('--dire', '#ff5a6e'), warn: v('--aegis', '#f2c46d'), accent: v('--accent', '#e3a46f'),
            halo: v('--cv-halo', '#0b1020'), font: v('--font-ui', 'system-ui').split(',')[0].replace(/['"]/g, '').trim() || 'system-ui'
        };
    }

    /* ---------- pointer glow on glass cards ---------- */
    function glow(e) {
        const card = e.target.closest && e.target.closest('.tile, .card, .gate-card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }


    /* "new version" banner, shared by the app and the sign-in page */
    function updateBar(box, upd, github) {
        if (!box) return;
        if (!upd) { box.classList.add('hidden'); box.textContent = ''; return; }
        const T = (s) => (window.LedgerI18n ? window.LedgerI18n.t(s) : s);
        const ru = window.LedgerI18n && window.LedgerI18n.lang === 'ru';
        box.textContent = '';
        box.classList.remove('hidden');
        const bar = document.createElement('div'); bar.className = 'update-bar';
        const dot = document.createElement('i'); dot.className = 'ub-dot';
        const txt = document.createElement('div'); txt.className = 'ub-text';
        const b = document.createElement('b'); b.textContent = T('DotaTraker ' + upd.version + ' is out');
        const sp = document.createElement('span'); sp.textContent = (ru && upd.notesRu) || upd.notes || T('A new version is on GitHub.');
        txt.append(b, sp);
        const act = document.createElement('div'); act.className = 'ub-actions';
        const gh = document.createElement('a'); gh.className = 'btn'; gh.target = '_blank'; gh.rel = 'noopener noreferrer';
        gh.href = github || 'https://github.com/m4ks1em-maker/ledger'; gh.textContent = T('GitHub');
        act.appendChild(gh);
        if (upd.auto) {
            const go = document.createElement('button'); go.type = 'button'; go.className = 'btn ub-go';
            const busy = { downloading: 'Downloading…', installing: 'Installing…', restarting: 'Restarting…' }[upd.state];
            go.textContent = T(busy || 'Update now');
            if (busy) go.disabled = true;
            go.addEventListener('click', async () => {
                go.disabled = true; go.textContent = T('Downloading…');
                try {
                    await fetch('/_ledger/update', { method: 'POST', credentials: 'same-origin', headers: { 'X-Ledger': '1' } });
                } catch (_) {}
                waitForRestart(go, upd.version);
            });
            act.appendChild(go);
        }
        if (upd.state === 'error') sp.textContent = T('Update failed. Download it from GitHub.');
        bar.append(dot, txt, act);
        box.appendChild(bar);
    }
    function waitForRestart(btn, version) {
        const T = (s) => (window.LedgerI18n ? window.LedgerI18n.t(s) : s);
        let tries = 0, sawDown = false;
        const tick = async () => {
            tries++;
            try {
                const r = await fetch('/_ledger/info', { cache: 'no-store' });
                const j = await r.json();
                if (j.version === version || (sawDown && !j.update)) { btn.textContent = T('Done'); setTimeout(() => location.reload(), 500); return; }
                if (j.update && j.update.state === 'error') { btn.disabled = false; btn.textContent = T('Update failed. Download it from GitHub.'); return; }
                if (j.update && j.update.state) btn.textContent = T({ downloading: 'Downloading…', installing: 'Installing…', restarting: 'Restarting…' }[j.update.state] || 'Downloading…');
            } catch (_) { sawDown = true; btn.textContent = T('Restarting…'); }
            if (tries < 120) setTimeout(tick, 1500);
        };
        setTimeout(tick, 1200);
    }

    window.LedgerUI = { esc, toast, confirm: confirmBox, glider, countTo, watchNumbers, canvasTheme, reduced, updateBar };

    function start() {
        document.documentElement.classList.add('js');
        document.addEventListener('pointermove', glow, { passive: true });
        document.querySelectorAll('[data-glider]').forEach((c) => glider(c, c.dataset.glider));
        watchNumbers();
        // icons that fail to load hide themselves (no inline onerror: the page runs under a strict CSP)
        document.addEventListener('error', (e) => {
            const t = e.target;
            if (t && t.tagName === 'IMG' && t.classList.contains('player-selector-icon')) t.style.display = 'none';
        }, true);
        requestAnimationFrame(() => document.documentElement.classList.add('ready'));
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const rows = $('rows');
    let keys = [];
    let serverSkew = 0;

    /* ---------- helpers ---------- */
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

    async function api(path, method, body) {
        const r = await fetch(path, {
            method: method || 'GET',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' },
            body: body ? JSON.stringify(body) : undefined
        });
        if (r.status === 401) { location.href = '/login'; throw new Error('signed out'); }
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Request failed');
        return j;
    }

    let toastTimer;
    function toast(msg, isErr) {
        const t = $('toast');
        t.textContent = msg;
        t.classList.toggle('err', !!isErr);
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
    }

    const nowMs = () => Date.now() + serverSkew;
    function span(ms) {
        const abs = Math.abs(ms);
        const m = Math.round(abs / 60000);
        if (m < 1) return 'now';
        if (m < 60) return m + ' min';
        const h = Math.round(m / 60);
        if (h < 48) return h + ' h';
        return Math.round(h / 24) + ' days';
    }
    const ago = (t) => (t ? span(nowMs() - t) + ' ago' : 'Never');

    function timeLeft(k) {
        if (k.status === 'revoked') return '—';
        if (!k.durationDays) return 'No expiry';
        if (!k.activatedAt) return k.durationDays + (k.durationDays === 1 ? ' day' : ' days') + ' once used';
        const left = k.expiresAt - nowMs();
        return left <= 0 ? 'Ended' : span(left);
    }

    const PILL = { active: ['status-success', 'Active'], unused: ['status-downloading', 'Not used'], expired: ['status-pending', 'Expired'], revoked: ['status-error', 'Revoked'] };

    /* ---------- rendering ---------- */
    function render() {
        const q = $('search').value.trim().toLowerCase();
        const list = keys.filter((k) => !q || k.label.toLowerCase().includes(q) || k.tail.toLowerCase().includes(q));
        rows.textContent = '';
        $('empty').classList.toggle('hidden', list.length > 0);
        $('empty').textContent = keys.length ? 'Nothing matches your search.' : 'No keys yet. Generate your first one.';

        list.forEach((k) => {
            const tr = el('tr');

            const name = el('td');
            name.appendChild(el('span', 'k-label', k.label));
            name.appendChild(el('span', 'k-role' + (k.role === 'admin' ? ' admin' : ''), k.role === 'admin' ? 'Admin' : 'Viewer'));
            tr.appendChild(name);

            tr.appendChild(el('td', 'k-mask', 'LDG-••••-••••-••••-' + k.tail));

            const st = el('td');
            const [cls, txt] = PILL[k.status] || PILL.active;
            st.appendChild(el('span', 'status-pill ' + cls, txt));
            tr.appendChild(st);

            tr.appendChild(el('td', 'k-dim', timeLeft(k)));
            tr.appendChild(el('td', 'k-dim', ago(k.lastSeenAt)));
            tr.appendChild(el('td', 'k-dim', k.sessions + ' / ' + k.maxSessions));

            const act = el('td');
            const box = el('div', 'row-actions');
            if (k.durationDays > 0 && k.status !== 'revoked') box.appendChild(button('+30 d', () => run(k.id, { action: 'extend', days: 30 }, 'Extended by 30 days')));
            if (k.sessions > 0) box.appendChild(button('Sign out', () => run(k.id, { action: 'kick' }, 'Signed out')));
            box.appendChild(k.status === 'revoked'
                ? button('Restore', () => run(k.id, { action: 'restore' }, 'Restored'))
                : button('Revoke', () => run(k.id, { action: 'revoke' }, 'Revoked')));
            box.appendChild(confirmButton('Delete', () => run(k.id, { action: 'delete' }, 'Deleted')));
            act.appendChild(box);
            tr.appendChild(act);

            rows.appendChild(tr);
        });

        const count = (s) => keys.filter((k) => k.status === s).length;
        $('s-total').textContent = keys.length;
        $('s-active').textContent = count('active');
        $('s-unused').textContent = count('unused');
    }

    function button(label, fn, danger) {
        const b = el('button', 'btn small-btn' + (danger ? ' danger-btn' : ''), label);
        b.type = 'button';
        b.addEventListener('click', fn);
        return b;
    }
    function confirmButton(label, fn) {
        const b = button(label, () => {
            if (b.dataset.armed) { fn(); return; }
            b.dataset.armed = '1';
            b.textContent = 'Sure?';
            b.classList.add('danger-btn');
            setTimeout(() => { delete b.dataset.armed; b.textContent = label; b.classList.remove('danger-btn'); }, 2600);
        });
        return b;
    }

    /* ---------- data ---------- */
    async function load() {
        const j = await api('/_ledger/admin/keys');
        serverSkew = j.serverTime - Date.now();
        keys = j.keys;
        $('s-live').textContent = j.liveSessions;
        render();
    }
    async function run(id, body, okMsg) {
        try { await api('/_ledger/admin/keys/' + id, 'POST', body); toast(okMsg); await load(); }
        catch (e) { toast(e.message, true); }
    }

    /* ---------- issue keys ---------- */
    let fresh = [];
    $('issue').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('f-submit');
        btn.disabled = true; btn.classList.add('loading-btn');
        try {
            const j = await api('/_ledger/admin/keys', 'POST', {
                label: $('f-label').value.trim() || 'Untitled',
                durationDays: Number($('f-days').value),
                maxSessions: Number($('f-devices').value),
                role: $('f-role').value,
                count: Number($('f-count').value) || 1
            });
            fresh = j.created;
            showFresh();
            $('f-label').value = '';
            $('f-count').value = 1;
            await load();
        } catch (err) { toast(err.message, true); }
        finally { btn.disabled = false; btn.classList.remove('loading-btn'); }
    });

    function showFresh() {
        const box = $('fresh-list');
        box.textContent = '';
        fresh.forEach((k) => {
            const line = el('div', null, k.key);
            line.appendChild(el('span', 'who', k.label));
            box.appendChild(line);
        });
        $('fresh-title').textContent = fresh.length === 1 ? 'New key' : fresh.length + ' new keys';
        $('fresh').classList.remove('hidden');
        $('fresh').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const plain = () => fresh.map((k) => k.key).join('\n');

    $('fresh-copy').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(plain()); toast('Copied'); }
        catch (_) {
            const r = document.createRange(); r.selectNodeContents($('fresh-list'));
            const s = getSelection(); s.removeAllRanges(); s.addRange(r);
            toast('Press Ctrl+C to copy');
        }
    });
    $('fresh-download').addEventListener('click', () => {
        const text = fresh.map((k) => k.key + '\t' + k.label).join('\n') + '\n';
        const a = el('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'ledger-keys.txt';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('fresh-close').addEventListener('click', () => { fresh = []; $('fresh-list').textContent = ''; $('fresh').classList.add('hidden'); });

    $('search').addEventListener('input', render);
    $('logout').addEventListener('click', () => {
        fetch('/_ledger/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Ledger': '1' } }).finally(() => { location.href = '/login'; });
    });


    /* ---------- auto-sync ---------- */
    let syncCfg = null;
    function renderSync(j) {
        syncCfg = j.config;
        const st = j.state;
        if (document.activeElement !== $('sy-id')) $('sy-id').value = j.config.steamId || '';
        $('sy-source').value = j.config.source || 'opendota';
        $('sy-every').value = String(j.config.everyMin);
        $('sy-limit').value = String(j.config.limit);
        $('sy-turbo').checked = !!j.config.turbo;
        $('sy-toggle').textContent = j.config.enabled ? 'Turn off' : 'Turn on';
        $('sy-toggle').classList.toggle('secondary-btn', !!j.config.enabled);
        $('sy-toggle').classList.toggle('primary-btn', !j.config.enabled);
        const when = st.lastRun ? ' · ' + ago(st.lastRun) : '';
        $('sy-state').textContent = (j.config.enabled ? (st.running ? 'Working…' : st.message) : 'Off') + (j.config.enabled ? when : '');
        const box = $('sy-recent'); box.textContent = '';
        (st.recent || []).slice(0, 5).forEach((r) => box.appendChild(el('div', null, r.id + '  ·  ' + ago(r.t))));
    }
    async function loadSync() { try { renderSync(await api('/_ledger/admin/sync')); } catch (_) {} }
    async function saveSync(extra) {
        const body = Object.assign({ source: $('sy-source').value, steamId: $('sy-id').value.trim(), everyMin: Number($('sy-every').value), limit: Number($('sy-limit').value), turbo: $('sy-turbo').checked }, extra || {});
        try { renderSync(await api('/_ledger/admin/sync', 'POST', body)); } catch (e) { toast(e.message, true); }
    }
    $('sync-form').addEventListener('submit', (e) => { e.preventDefault(); saveSync({ enabled: !(syncCfg && syncCfg.enabled) }); });
    ['sy-source', 'sy-every', 'sy-limit', 'sy-turbo'].forEach((id) => $(id).addEventListener('change', () => saveSync()));
    $('sy-run').addEventListener('click', async () => { await saveSync(); try { await api('/_ledger/admin/sync', 'POST', { action: 'run' }); toast('Checking…'); setTimeout(loadSync, 1500); } catch (e) { toast(e.message, true); } });

    /* ---------- activity ---------- */
    const EVENTS = {
        login_ok: ['Signed in', 'ok'], login_fail: ['Wrong key', 'bad'], login_locked: ['Locked out', 'bad'], login_denied: ['Refused', 'bad'], logout: ['Signed out', ''],
        key_created: ['Keys issued', 'warm'], key_revoke: ['Key revoked', 'warm'], key_restore: ['Key restored', 'warm'], key_kick: ['Kicked', 'warm'], key_extend: ['Extended', 'warm'], key_delete: ['Key deleted', 'warm'], key_rename: ['Renamed', 'warm'], key_devices: ['Devices changed', 'warm'],
        upload: ['Replay uploaded', 'ok'], od_fetch: ['Replay requested', ''], sync_download: ['Auto-downloaded', 'ok'], sync_error: ['Sync problem', 'bad']
    };
    function device(ua) {
        ua = ua || '';
        const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
        const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
        return [br, os].filter(Boolean).join(' · ') || '—';
    }
    async function loadLog() {
        try {
            const j = await api('/_ledger/admin/audit');
            const body = $('log-rows'); body.textContent = '';
            $('log-empty').classList.toggle('hidden', j.events.length > 0);
            j.events.forEach((e) => {
                const tr = el('tr');
                tr.appendChild(el('td', 'k-dim', ago(e.t)));
                const [txt, cls] = EVENTS[e.type] || [e.type, ''];
                const td = el('td'); td.appendChild(el('span', 'ev ' + cls, txt)); tr.appendChild(td);
                const detail = [e.who, e.label && e.label !== e.who ? e.label : '', e.match, e.name, e.why, e.count ? '×' + e.count : '', e.msg].filter(Boolean).join(' · ');
                tr.appendChild(el('td', null, detail || '—'));
                tr.appendChild(el('td', 'k-dim', e.ua ? device(e.ua) : '—'));
                tr.appendChild(el('td', 'k-mask', e.ip || '—'));
                body.appendChild(tr);
            });
        } catch (_) {}
    }
    loadSync(); loadLog();
    setInterval(() => { loadSync(); loadLog(); }, 15000);

    load().catch((e) => toast(e.message, true));
    setInterval(() => { load().catch(() => {}); }, 20000);
})();

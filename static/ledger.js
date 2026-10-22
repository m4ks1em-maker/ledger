// DotaTraker add-ons. Reads the existing UI only, never touches the parser.
//  1. Match ID of the selected match (copy + OpenDota / Dotabuff links)
//  2. Your key: account chip, days left, renew in Telegram, sign out
//  3. Auto-analysis, player lookup, export, uploads, stats, home, auto-sync
(function () {
    'use strict';

    /* ---------- 1. Match ID ---------- */
    const select = document.getElementById('match-selector');
    const meta = document.getElementById('match-meta');

    if (select && meta) {
        let lastId = null;
        let timer = null;

        const currentMatch = () => {
            const opt = select.options[select.selectedIndex];
            if (!opt || opt.value === '') return null;
            if (opt.dataset && /^\d+$/.test(opt.dataset.matchId || '')) return opt.dataset.matchId;
            const m = /(\d{6,})/.exec(opt.textContent || '');
            return m ? m[1] : null;
        };

        const render = () => {
            const id = currentMatch();
            if (id === lastId) return;
            lastId = id;
            meta.textContent = '';
            if (!id) { meta.classList.add('hidden'); return; }

            const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'match-meta-id';
            pill.title = T('Click to copy the match ID');
            const lab = document.createElement('small'); lab.textContent = 'ID';
            const num = document.createElement('b'); num.textContent = id;
            const copy = document.createElement('span'); copy.className = 'mm-copy'; copy.textContent = 'Copy';
            pill.append(lab, num, copy);
            pill.addEventListener('click', () => {
                const done = () => { copy.textContent = 'Copied'; pill.classList.add('copied'); LedgerUI.toast(T('Match ID copied') + ': ' + id, 'success'); setTimeout(() => { copy.textContent = 'Copy'; pill.classList.remove('copied'); }, 1400); };
                const fallback = () => {
                    try { const ta = document.createElement('textarea'); ta.value = id; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); if (ok) return done(); } catch (_) {}
                    LedgerUI.toast(T('Press Ctrl+C to copy') + ': ' + id, 'info');
                };
                if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(id).then(done, fallback);
                else fallback();
            });
            meta.appendChild(pill);

            [['OpenDota', 'https://www.opendota.com/matches/' + id], ['Dotabuff', 'https://www.dotabuff.com/matches/' + id]].forEach(([label, href]) => {
                const a = document.createElement('a');
                a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = label;
                meta.appendChild(a);
            });
            meta.classList.remove('hidden');
        };

        const schedule = () => { clearTimeout(timer); timer = setTimeout(render, 0); };
        new MutationObserver(schedule).observe(select, { childList: true });
        select.addEventListener('change', schedule);
        schedule();
    }


    /* ---------- 3. Auto-analysis ---------- */
    (function autoAnalysis() {
        const list = document.getElementById('replay-list');
        const startBtn = document.getElementById('start-parse');
        const browseTab = document.getElementById('browse-tab');
        const progress = document.getElementById('progress-section');
        if (!list || !startBtn || !browseTab) return;

        // progress + "done" strip live under the tabs so every tab can show them
        const strip = document.getElementById('ledger-status') || browseTab;
        if (progress) { progress.style.marginTop = '0'; strip.insertBefore(progress, strip.firstChild); }

        const bar = document.createElement('div');
        bar.id = 'ledger-done';
        bar.className = 'done-bar hidden';
        strip.insertBefore(bar, strip.firstChild);

        const goTab = (name) => { const t = document.querySelector('.workflow-tab[data-tab="' + name + '"]'); if (t) t.click(); };
        const picked = () => document.querySelectorAll('.replay-item input[type="checkbox"]:checked').length;

        let timer = null;
        const schedule = () => {
            clearTimeout(timer);
            // listeners here run before the page's own handlers tick the boxes, so only look inside the timer
            timer = setTimeout(() => {
                if (!picked()) return;
                // never yank the person away while they are still ticking: the bar under the tabs links to the result
                window.ledgerNoJump = true;
                window.ledgerPathOverride = null;
                startBtn.click();
            }, 1100);
        };
        list.addEventListener('change', schedule);
        ['select-all', 'select-last'].forEach((id) => { const b = document.getElementById(id); if (b) b.addEventListener('click', schedule); });

        document.addEventListener('ledger:analysis-done', () => {
            if (progress) progress.classList.add('hidden');
            const n = (window.ledgerMatches || []).length;
            if (!n || window.ledgerSilentDone) { bar.classList.add('hidden'); return; }
            bar.textContent = '';
            const t = document.createElement('span');
            t.textContent = (window.LedgerI18n ? window.LedgerI18n.t : (x) => x)(n + (n === 1 ? ' match analysed' : ' matches analysed'));
            const a = document.createElement('button'); a.type = 'button'; a.textContent = 'Open matches'; a.addEventListener('click', () => goTab('results'));
            const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Player lookup'; b.addEventListener('click', () => goTab('player'));
            const x = document.createElement('button'); x.type = 'button'; x.className = 'x'; x.textContent = '×'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', () => bar.classList.add('hidden'));
            bar.append(t, a, b, x);
            bar.classList.remove('hidden');
            clearTimeout(bar.__t); bar.__t = setTimeout(() => bar.classList.add('hidden'), 15000);
        });
    })();

    /* ---------- 4. Player lookup ---------- */
    (function playerLookup() {
        const $ = (id) => document.getElementById(id);
        if (!$('pl-form')) return;
        const B = 76561197960265728n;
        const KEY = 'ledgerPlayers';

        const acc = (v) => {
            if (v == null) return null;
            const s = String(v).trim();
            const m = /^\[?U:1:(\d+)\]?$/.exec(s);
            try {
                let n;
                if (m) n = BigInt(m[1]); else if (/^\d{1,20}$/.test(s)) n = BigInt(s); else return null;
                if (n >= B) n -= B;
                return n > 0n ? n.toString() : null;
            } catch (_) { return null; }
        };
        const mins = (t) => { const p = String(t || '').split(':').map((x) => parseInt(x, 10) || 0); return p.length === 3 ? p[0] * 60 + p[1] + p[2] / 60 : p[0] + (p[1] || 0) / 60; };

        let saved = [], selected = null, current = null;
        try { saved = JSON.parse(localStorage.getItem(KEY) || '[]').filter((x) => x && acc(x.id)); selected = localStorage.getItem(KEY + 'Sel'); } catch (_) {}
        const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); localStorage.setItem(KEY + 'Sel', selected || ''); } catch (_) {} document.dispatchEvent(new CustomEvent('ledger:players')); };

        const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
        const matches = () => window.ledgerMatches || [];

        function playerName(id) {
            const list = matches();
            for (let i = list.length - 1; i >= 0; i--) {
                const p = (list[i].players || []).find((x) => acc(x.SteamID) === id);
                if (p && p.Name) return p.Name;
            }
            return null;
        }

        function lookup(id) {
            const res = { present: 0, inc: [], out: [] };
            matches().forEach((m) => {
                const players = m.players || [];
                const bySlot = (s) => players.find((p) => p.Slot === s);
                const me = players.find((p) => acc(p.SteamID) === id);
                const reports = m.reports || [];
                const incoming = reports.filter((r) => acc(r.TargetSteamID) === id);
                const outgoing = reports.filter((r) => acc(r.SteamID) === id);
                if (!me && !incoming.length && !outgoing.length) return;
                res.present++;
                const hero = me ? me.Hero : (incoming[0] && incoming[0].TargetHero) || (outgoing[0] && outgoing[0].Hero) || '';
                const group = { matchID: m.matchID, hero };
                incoming.forEach((r) => res.inc.push({ g: group, time: r.Time, name: r.Name || ('Slot ' + r.Slot), sid: String(r.SteamID || ''), hero: r.Hero || '', side: r.Team === 'FRIENDLY' ? 'Teammate' : 'Enemy', ok: r.Confirmed !== false }));
                outgoing.forEach((r) => {
                    const t = bySlot(r.TargetSlot), me2 = bySlot(r.Slot);
                    const side = t && me2 && t.Team != null && me2.Team != null ? (t.Team === me2.Team ? 'Teammate' : 'Enemy') : '';
                    res.out.push({ g: group, time: r.Time, name: (t && t.Name) || r.TargetName || ('Slot ' + r.TargetSlot), sid: String(r.TargetSteamID || ''), hero: (t && t.Hero) || r.TargetHero || '', side, ok: r.Confirmed !== false });
                });
            });
            return res;
        }

        function column(host, rows, none) {
            host.textContent = '';
            if (!rows.length) { host.appendChild(el('p', 'pl-none', none)); return; }
            let last = null, box = null;
            rows.forEach((r) => {
                if (r.g !== last) {
                    last = r.g;
                    box = el('div', 'pl-group');
                    const head = el('div', 'pl-ghead');
                    const a = el('a', null, r.g.matchID);
                    a.href = 'https://www.opendota.com/matches/' + encodeURIComponent(r.g.matchID); a.target = '_blank'; a.rel = 'noopener noreferrer';
                    head.append(a);
                    if (r.g.hero) head.append(el('span', null, 'played ' + r.g.hero));
                    box.appendChild(head);
                    host.appendChild(box);
                }
                const row = el('div', 'pl-row');
                row.appendChild(el('span', 'pl-time', r.time));
                const who = el('span', 'pl-who');
                who.appendChild(el('b', null, r.name));
                if (r.hero) who.appendChild(el('small', null, r.hero));
                row.appendChild(who);
                if (!r.ok) row.appendChild(el('span', 'pl-flag', 'unconfirmed'));
                if (r.side) row.appendChild(el('span', 'pl-side ' + (r.side === 'Enemy' ? 'enemy' : 'mate'), r.side));
                box.appendChild(row);
            });
        }

        function stat(label, value) { const c = el('div', 'pl-stat'); c.append(el('span', null, label), el('b', null, String(value))); return c; }

        function render() {
            const n = matches().length;
            $('pl-scope').textContent = n ? n + (n === 1 ? ' match analysed' : ' matches analysed') : '';

            const chips = $('pl-chips'); chips.textContent = '';
            saved.forEach((p) => {
                const c = el('div', 'pl-chip' + (p.id === selected ? ' active' : ''));
                const b = el('button', 'pl-chip-main', p.label || playerName(p.id) || p.id);
                b.type = 'button'; b.title = 'Steam ID ' + p.id + ' (32-bit)';
                b.addEventListener('click', () => { selected = p.id; persist(); render(); });
                const x = el('button', 'pl-chip-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Remove');
                x.addEventListener('click', () => { saved = saved.filter((q) => q.id !== p.id); if (selected === p.id) selected = saved[0] ? saved[0].id : null; persist(); render(); });
                c.append(b, x); chips.appendChild(c);
            });

            const out = $('pl-out'), empty = $('pl-empty');
            if (!selected || !saved.some((p) => p.id === selected)) { out.classList.add('hidden'); empty.classList.remove('hidden'); empty.textContent = 'Pick replays in the first tab, then add a player by ID to see everything they reported and everything reported on them.'; return; }
            if (!n) { out.classList.add('hidden'); empty.classList.remove('hidden'); empty.textContent = 'No analysed replays yet. Select replays in the first tab and they are analysed automatically.'; return; }

            const r = lookup(selected);
            current = { id: selected, r };
            empty.classList.add('hidden'); out.classList.remove('hidden');
            const stats = $('pl-stats'); stats.textContent = '';
            stats.append(stat('In matches', r.present + ' / ' + n), stat('Reported on them', r.inc.length), stat('They reported', r.out.length));
            column($('pl-in'), r.inc, r.present ? 'Nobody reported them in these matches.' : 'Not found in the analysed replays.');
            column($('pl-outgoing'), r.out, r.present ? 'They did not report anyone in these matches.' : 'Not found in the analysed replays.');
        }

        const head = document.querySelector('#player-lookup .card-header');
        if (head) head.insertBefore(exportButtons(() => {
            if (!current) return null;
            const label = (saved.find((p) => p.id === current.id) || {}).label || playerName(current.id) || current.id;
            const rows = [].concat(
                current.r.inc.map((x) => ({ direction: 'received', match_id: x.g.matchID, time: x.time, other_player: x.name, other_steam_id: x.sid, other_hero: x.hero, other_side: x.side, confirmed: x.ok })),
                current.r.out.map((x) => ({ direction: 'made', match_id: x.g.matchID, time: x.time, other_player: x.name, other_steam_id: x.sid, other_hero: x.hero, other_side: x.side, confirmed: x.ok })));
            return { name: 'ledger-player-' + current.id, rows };
        }), head.querySelector('.hint'));

        $('pl-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const id = acc($('pl-id').value);
            const err = $('pl-error');
            if (!id) { err.textContent = 'That does not look like a Steam ID.'; return; }
            err.textContent = '';
            const label = $('pl-label').value.trim();
            const ex = saved.find((p) => p.id === id);
            if (ex) { if (label) ex.label = label; } else saved.push({ id, label });
            selected = id; persist();
            $('pl-id').value = ''; $('pl-label').value = '';
            render();
        });
        $('pl-id').addEventListener('input', () => { $('pl-error').textContent = ''; });
        window.LedgerPlayers = {
            list: () => saved.slice(),
            name: (id) => { const p = saved.find((q) => q.id === id) || {}; return p.label || playerName(id) || p.auto || id; },
            add(raw, label) { const id = acc(raw); if (!id) return null; const ex = saved.find((p) => p.id === id); if (ex) { if (label) ex.label = label; } else saved.push({ id, label: label || '' }); selected = id; persist(); render(); return id; },
            select(id) { if (saved.some((p) => p.id === id)) { selected = id; persist(); render(); } }
        };
        document.addEventListener('ledger:matches', () => {
            let changed = false;
            saved.forEach((p) => { const n = playerName(p.id); if (n && p.auto !== n) { p.auto = n; changed = true; } });
            if (changed) persist();
            render();
        });
        render();
    })();


    /* ---------- 5. Export ---------- */
    function csvCell(v) {
        let t = v == null ? '' : String(v);
        if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;          // stop spreadsheets from running a hostile player name
        return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    }
    function download(name, mime, text) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: mime }));
        a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    }
    function exportButtons(getData) {
        const box = document.createElement('div');
        box.className = 'export-btns';
        [['CSV', 'Export CSV'], ['JSON', 'Export JSON']].forEach(([kind, label]) => {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = label;
            b.addEventListener('click', () => {
                const d = getData();
                if (!d || !d.rows.length) { b.textContent = '—'; setTimeout(() => { b.textContent = label; }, 900); return; }
                if (kind === 'JSON') download(d.name + '.json', 'application/json', JSON.stringify(d.rows, null, 2));
                else {
                    const cols = Object.keys(d.rows[0]);
                    download(d.name + '.csv', 'text/csv;charset=utf-8', '﻿' + [cols.join(',')].concat(d.rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))).join('\r\n') + '\r\n');
                }
            });
            box.appendChild(b);
        });
        return box;
    }
    (function matchExport() {
        const head = document.querySelector('#results-section .card-header');
        if (!head) return;
        head.insertBefore(exportButtons(() => {
            const rows = [];
            (window.ledgerMatches || []).forEach((m) => {
                const bySlot = (sl) => (m.players || []).find((p) => p.Slot === sl) || {};
                (m.reports || []).forEach((r) => rows.push({
                    match_id: m.matchID, time: r.Time, reporter: r.Name, reporter_steam_id: r.SteamID, reporter_hero: r.Hero,
                    target: r.TargetName || bySlot(r.TargetSlot).Name || '', target_steam_id: r.TargetSteamID, target_hero: r.TargetHero || bySlot(r.TargetSlot).Hero || '',
                    reporter_side: r.Team === 'FRIENDLY' ? 'teammate' : 'enemy', confirmed: r.Confirmed !== false
                }));
            });
            return { name: 'ledger-reports', rows };
        }), document.getElementById('match-meta'));
    })();

    /* ---------- 6. Drop zone (upload through the gate) ---------- */
    (function dropZone() {
        const zone = document.getElementById('dropzone'), input = document.getElementById('dz-input'), status = document.getElementById('dz-status');
        if (!zone || !input) return;
        const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
        const say = (txt, pct) => {
            status.textContent = txt;
            if (pct != null) { const bar = document.createElement('span'); bar.className = 'dz-bar'; const i = document.createElement('i'); i.style.width = pct + '%'; bar.appendChild(i); status.appendChild(bar); }
        };
        // the gate accepts [0-9A-Za-z_-]{1,60}.dem, so "My Replay (2).DEM" becomes "My_Replay__2_.dem"
        function safeName(original) {
            const base = String(original).replace(/\.dem$/i, '').replace(/[^0-9A-Za-z_-]/g, '_').replace(/^_+|_+$/g, '').slice(-60) || ('replay_' + Date.now());
            return base + '.dem';
        }
        function send(file) {
            return new Promise((resolve) => {
                const name = safeName(file.name);
                const x = new XMLHttpRequest();
                x.open('POST', '/_ledger/upload?name=' + encodeURIComponent(name));
                x.setRequestHeader('X-Ledger', '1');
                x.upload.onprogress = (e) => { if (e.lengthComputable) say(T('Uploading') + ' ' + name, Math.round((e.loaded / e.total) * 100)); };
                x.onload = () => { let msg = ''; try { msg = JSON.parse(x.responseText).error || ''; } catch (_) {} resolve(x.status === 201 ? { ok: true } : { ok: false, msg: msg || ('HTTP ' + x.status) }); };
                x.onerror = () => resolve({ ok: false, msg: 'Network error' });
                x.onabort = () => resolve({ ok: false, msg: 'Upload was interrupted.' });
                x.send(file);
            });
        }
        async function handle(files) {
            const list = Array.from(files).filter((f) => /\.dem$/i.test(f.name));
            if (!list.length) { say('Only .dem files'); return; }
            let ok = 0, last = '';
            for (const f of list) { const r = await send(f); if (r.ok) ok++; else last = f.name + ': ' + r.msg; }
            say(last || (T('Uploaded') + ' ' + ok + ' / ' + list.length));
            if (last) LedgerUI.toast(last, 'bad'); else LedgerUI.toast(T('Uploaded') + ' ' + ok + ' / ' + list.length, 'ok');
            if (ok) {
                const refresh = document.getElementById('refresh-replays');
                if (typeof window.browseDirectory === 'function') window.browseDirectory('uploads'); else if (refresh) refresh.click();
            }
        }
        zone.addEventListener('click', () => input.click());
        zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
        input.addEventListener('change', () => { if (input.files.length) handle(input.files); input.value = ''; });
        ['dragenter', 'dragover'].forEach((ev) => document.addEventListener(ev, (e) => { if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) { e.preventDefault(); zone.classList.add('over'); } }));
        ['dragleave', 'drop'].forEach((ev) => document.addEventListener(ev, (e) => { if (ev === 'drop' || e.target === document || !e.relatedTarget) zone.classList.remove('over'); }));
        document.addEventListener('drop', (e) => {
            if (!e.dataTransfer || !e.dataTransfer.files.length) return;
            e.preventDefault();
            const browse = document.querySelector('.workflow-tab[data-tab="browse"]'); if (browse) browse.click();
            handle(e.dataTransfer.files);
        });
    })();

    /* ---------- 7. Stats (built only from replays you analysed) ---------- */
    (function stats() {
        const $ = (id) => document.getElementById(id);
        if (!$('st-out')) return;
        const KEY = 'ledgerHistory', MAX = 300;
        const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
        const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

        // replay dates come from the file list, so remember them as the app fetches it
        const dates = {};
        try {
            const orig = window.fetch;
            window.fetch = function (input) {
                const p = orig.apply(this, arguments);
                try {
                    const url = typeof input === 'string' ? input : (input && input.url) || '';
                    if (url.indexOf('/api/browse') >= 0) p.then((r) => r.clone().json()).then((items) => { (items || []).forEach((i) => { if (i && i.isFile && i.date) dates[String(i.name).replace(/\.dem$/, '')] = i.date; }); }).catch(() => {});
                } catch (_) {}
                return p;
            };
        } catch (_) {}

        let hist = {};
        try { hist = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { hist = {}; }
        const save = () => {
            const ids = Object.keys(hist);
            if (ids.length > MAX) ids.sort((a, b) => hist[a].a - hist[b].a).slice(0, ids.length - MAX).forEach((id) => delete hist[id]);
            try { localStorage.setItem(KEY, JSON.stringify(hist)); } catch (_) {}
        };
        function ingest() {
            (window.ledgerMatches || []).forEach((m) => {
                const id = String(m.matchID);
                const base = String(m.filePath || '').split('/').pop().replace(/\.dem$/, '');
                hist[id] = {
                    a: Date.now(), d: dates[base] || (hist[id] && hist[id].d) || null,
                    r: (m.reports || []).map((r) => [r.Time, r.Slot, String(r.SteamID || ''), r.Name || '', r.Hero || '', r.Team === 'FRIENDLY' ? 1 : 0, String(r.TargetSteamID || ''), r.TargetName || '', r.TargetHero || '', r.Confirmed === false ? 0 : 1])
                };
                // fill target names/heroes from the roster when the report did not carry them
                const roster = {}; (m.players || []).forEach((p) => { roster[p.Slot] = p; });
                (m.reports || []).forEach((r, i) => { const t = roster[r.TargetSlot]; if (t) { if (!hist[id].r[i][7]) hist[id].r[i][7] = t.Name || ''; if (!hist[id].r[i][8]) hist[id].r[i][8] = t.Hero || ''; } });
            });
            save();
        }
        const mins = (t) => { const p = String(t || '').split(':').map((x) => parseInt(x, 10) || 0); return p.length === 3 ? p[0] * 60 + p[1] : p[0] + (p[1] || 0) / 60; };

        function list(host, rows, max) {
            host.textContent = '';
            if (!rows.length) { host.appendChild(el('p', 'pl-none', '—')); return; }
            const top = rows[0].n || 1;
            rows.slice(0, max || 6).forEach((r) => {
                const row = el('div', 'st-row' + (r.cls ? ' ' + r.cls : ''));
                const name = el('span', null, r.label); if (r.sub) name.appendChild(el('small', null, r.sub));
                const meter = el('div', 'st-meter'); const i = el('i'); i.style.width = Math.max(4, Math.round((r.n / top) * 100)) + '%'; meter.appendChild(i);
                row.append(name, meter, el('b', null, String(r.n)));
                host.appendChild(row);
            });
        }
        function bars(host, vals, labels) {
            host.textContent = '';
            const top = Math.max(1, ...vals);
            vals.forEach((v, i) => {
                const b = el('div', 'st-bar'); b.title = labels[i] + ': ' + v;
                b.appendChild(el('b', null, v ? String(v) : ''));
                const bar = el('i'); bar.style.height = Math.round((v / top) * 100) + '%'; bar.style.setProperty('--i', String(i)); if (!v) bar.style.opacity = '0.25'; b.appendChild(bar);
                b.appendChild(el('em', null, labels[i]));
                host.appendChild(b);
            });
        }
        function render() {
            const ids = Object.keys(hist);
            $('st-empty').classList.toggle('hidden', ids.length > 0);
            $('st-out').classList.toggle('hidden', !ids.length);
            $('st-scope').textContent = ids.length ? ids.length + (ids.length === 1 ? ' match analysed' : ' matches analysed') : '';
            if (!ids.length) return;

            let total = 0, mate = 0, withRep = 0;
            const minute = new Array(10).fill(0);               // 0-9, 10-19 … 90+
            const got = new Map(), gave = new Map(), hero = new Map();
            const bump = (m, key, label, sub, matchId) => { const e = m.get(key) || { label, sub, n: 0, ms: new Set() }; e.n++; e.ms.add(matchId); if (label && !e.label) e.label = label; m.set(key, e); };

            ids.forEach((id) => {
                const rows = hist[id].r;
                if (rows.length) withRep++;
                rows.forEach((r) => {
                    total++; if (r[5]) mate++;
                    minute[Math.min(9, Math.floor(mins(r[0]) / 10))]++;
                    const tkey = r[6] || r[7]; if (tkey) bump(got, tkey, r[7] || ('…' + String(r[6]).slice(-6)), r[8], id);
                    const rkey = r[2] || r[3]; if (rkey) bump(gave, rkey, r[3] || ('…' + String(r[2]).slice(-6)), r[4], id);
                    if (r[8]) bump(hero, r[8], r[8], '', id);
                });
            });
            const kpi = $('st-kpi'); kpi.textContent = '';
            [['Matches analysed', ids.length], ['Reports', total], ['Per match', (total / ids.length).toFixed(1)], ['Matches with reports', Math.round((withRep / ids.length) * 100) + '%']].forEach(([l, v]) => {
                const c = el('div', 'pl-stat'); c.append(el('span', null, T(l)), el('b', null, String(v))); kpi.appendChild(c);
            });
            bars($('st-minutes'), minute, minute.map((_, i) => (i === 9 ? '90+' : i * 10 + '–' + (i * 10 + 9))));

            const dated = ids.map((id) => ({ id, t: hist[id].d ? new Date(hist[id].d).getTime() : hist[id].a, n: hist[id].r.length })).sort((a, b) => a.t - b.t).slice(-16);
            bars($('st-permatch'), dated.map((x) => x.n), dated.map((x) => new Date(x.t).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })));

            const toRows = (m) => [...m.values()].sort((a, b) => b.n - a.n || b.ms.size - a.ms.size).map((e) => ({ label: e.label, sub: e.sub ? e.sub : (e.ms.size > 1 ? e.ms.size + ' ' + T('Matches').toLowerCase() : ''), n: e.n }));
            list($('st-top'), toRows(got), 8); list($('st-reporters'), toRows(gave), 8); list($('st-heroes'), toRows(hero), 8);
            list($('st-split'), [{ label: T('Teammate'), n: mate, cls: 'mate' }, { label: T('Enemy'), n: total - mate, cls: 'enemy' }].filter((x) => x.n || total === 0).sort((a, b) => b.n - a.n), 2);
        }
        $('st-clear').addEventListener('click', () => { hist = {}; try { localStorage.removeItem(KEY); } catch (_) {} render(); });
        document.addEventListener('ledger:matches', () => { ingest(); render(); });
        document.addEventListener('ledger:lang', render);
        render();
    })();


    /* ---------- 8. Home: player lookup (no Steam), saved players, numbers ---------- */
    (function home() {
        const $ = (id) => document.getElementById(id);
        if (!$('lk-form')) return;
        const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
        const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
        const goTab = (name) => { const t = document.querySelector('.workflow-tab[data-tab="' + name + '"]'); if (t) t.click(); };
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

        // tiles that act like links
        document.querySelectorAll('[data-go]').forEach((t) => t.addEventListener('click', () => goTab(t.dataset.go)));

        // numbers
        function numbers() {
            let hist = {}; try { hist = JSON.parse(localStorage.getItem('ledgerHistory') || '{}') || {}; } catch (_) {}
            const ids = Object.keys(hist);
            LedgerUI.countTo($('hm-matches'), ids.length);
            LedgerUI.countTo($('hm-reports'), ids.reduce((n, id) => n + ((hist[id].r || []).length), 0));
        }
        // saved players
        function saved() {
            const box = $('hm-saved'); box.textContent = '';
            const list = window.LedgerPlayers ? window.LedgerPlayers.list() : [];
            if (!list.length) { box.appendChild(el('span', 'saved-empty', 'Nobody yet. Look someone up and they appear here.')); return; }
            list.forEach((p) => {
                const c = el('div', 'pl-chip');
                const b = el('button', 'pl-chip-main', window.LedgerPlayers.name(p.id)); b.type = 'button';
                b.addEventListener('click', () => { window.LedgerPlayers.select(p.id); goTab('player'); });
                c.appendChild(b); box.appendChild(c);
            });
        }
        document.addEventListener('ledger:matches', () => { numbers(); saved(); });
        document.addEventListener('ledger:players', saved);
        document.addEventListener('ledger:lang', saved);
        numbers(); saved();

        // lookup
        let rows = [], account = null, busy = false;
        const msg = (t, bad) => { $('lk-msg').textContent = t || ''; $('lk-msg').classList.toggle('bad', !!bad); };
        const when = (sec) => { const d = new Date(sec * 1000); return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) + ' · ' + String(Math.round(d.getHours())).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
        const dur = (s) => Math.round(s / 60) + ' min';
        function count() { const n = rows.filter((r) => r.box.checked).length; $('lk-count').textContent = n + ' / ' + rows.length; $('lk-go').disabled = busy || !n; $('lk-go').textContent = n ? T('Analyse') + ' ' + n : T('Analyse'); }
        function setState(r, text, cls) { r.state.textContent = text; r.state.className = 'lk-state ' + (cls || ''); }
        function build(list) {
            const host = $('lk-rows'); host.textContent = ''; rows = [];
            list.forEach((m, i) => {
                const row = el('label', 'lk-row'); row.style.setProperty('--i', String(Math.min(i, 12)));
                const box = document.createElement('input'); box.type = 'checkbox'; box.checked = i < 5; box.addEventListener('change', count);
                const who = el('div'); who.appendChild(el('b', null, m.hero)); who.appendChild(el('small', null, m.id));
                const wl = el('span', 'lk-wl ' + (m.win ? 'w' : 'l'), m.win ? 'WIN' : 'LOSS');
                const w = el('span', 'lk-when', when(m.start) + ' · ' + dur(m.duration));
                const state = el('span', 'lk-state');
                row.append(box, who, wl, w, state); host.appendChild(row);
                const r = { m, box, state, path: m.path || null }; rows.push(r);
                setState(r, m.have ? 'on server' : 'to download', m.have ? 'ok' : '');
            });
            count();
        }
        $('lk-list').querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
            const v = b.dataset.pick; rows.forEach((r, i) => { r.box.checked = v === 'all' ? true : v === 'none' ? false : i < Number(v); }); count();
        }));

        $('lk-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            if (busy) return;
            const id = $('lk-id').value.trim();
            if (!id) return;
            $('lk-list').classList.add('hidden'); msg(T('Looking…'));
            try {
                const r = await fetch('/_ledger/od/player?id=' + encodeURIComponent(id), { credentials: 'same-origin', cache: 'no-store' });
                const j = await r.json().catch(() => ({}));
                if (!r.ok) { msg(j.error || 'Could not look that up.', true); return; }
                account = j.account;
                if (!j.matches.length) { msg(T('No public matches found. The profile may be private (Dota 2 → Settings → Social → Expose Public Match Data).'), true); return; }
                msg(''); build(j.matches); $('lk-list').classList.remove('hidden');
            } catch (_) { msg('Cannot reach the server.', true); }
        });

        async function fetchOne(r) {
            if (r.path) { setState(r, 'ready', 'ok'); return r.path; }
            try {
                const res = await fetch('/_ledger/od/fetch', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' }, body: JSON.stringify({ matchId: r.m.id }) });
                const j = await res.json().catch(() => ({}));
                if (!res.ok) { setState(r, res.status === 429 ? 'slow down' : 'error', 'bad'); return null; }
                let job = j;
                for (let i = 0; i < 600 && job.state !== 'done' && job.state !== 'error'; i++) {
                    setState(r, ({ queued: 'queued', looking: 'looking…', requesting: 'asking OpenDota…', downloading: 'downloading ' + (job.progress || 0) + '%', unpacking: 'unpacking…' }[job.state]) || '…', 'busy');
                    await sleep(900);
                    const p = await fetch('/_ledger/od/job?id=' + encodeURIComponent(job.id), { credentials: 'same-origin', cache: 'no-store' });
                    if (!p.ok) break; job = await p.json();
                }
                if (job.state === 'done') { setState(r, 'ready', 'ok'); r.path = job.path; return job.path; }
                setState(r, job.code === 'expired' ? 'expired' : 'failed', 'bad'); r.state.title = job.error || '';
            } catch (_) { setState(r, 'failed', 'bad'); }
            return null;
        }

        $('lk-go').addEventListener('click', async () => {
            if (busy) return;
            const chosen = rows.filter((r) => r.box.checked);
            if (!chosen.length) return;
            busy = true; count(); msg(T('Getting replays…'));
            const paths = (await Promise.all(chosen.map(fetchOne))).filter(Boolean);
            if (!paths.length) {
                busy = false; count();
                const why = (chosen.map((r) => r.state && r.state.title).find(Boolean)) || '';
                msg(T('None of those replays could be fetched. Upload the .dem files instead.') + (why ? ' ' + T(why) : ''), true); return;
            }
            msg(T('Analysing…'));
            window.ledgerPathOverride = paths; window.ledgerNoJump = true; window.ledgerSilentDone = true;
            const sid = $('steam-id'); if (sid) sid.value = account;
            const done = new Promise((res) => document.addEventListener('ledger:analysis-done', res, { once: true }));
            $('start-parse').click();
            await done;
            window.ledgerPathOverride = null; window.ledgerSilentDone = false; busy = false; count(); msg('');
            if (window.LedgerPlayers) window.LedgerPlayers.add(account, '');
            goTab('player'); window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    /* ---------- conduct scorecard needs a Steam login: when it can't load, don't show a red banner ---------- */
    (function quietScorecard() {
        const sec = document.getElementById('conduct-scorecard-section');
        if (!sec) return;
        const check = () => sec.classList.toggle('is-hidden', /Error loading|not connected|Steam connection/i.test(sec.textContent || ''));
        new MutationObserver(check).observe(sec, { childList: true, subtree: true, characterData: true });
        check();
    })();


    /* ---------- replay search: filter the local replay list as you type ---------- */
    (function replaySearch() {
        const input = document.getElementById('replay-search'), list = document.getElementById('replay-list'), cnt = document.getElementById('replay-search-count');
        if (!input || !list) return;
        function apply() {
            const q = input.value.trim().toLowerCase().replace(/\s+/g, '');
            let shown = 0, total = 0;
            list.querySelectorAll('.replay-item').forEach((el) => {
                const cb = el.querySelector('input[type="checkbox"]');
                if (!cb) return;                                  // folders stay visible
                total++;
                const hit = !q || (el.textContent || '').toLowerCase().replace(/\s+/g, '').includes(q) || String(cb.value || '').toLowerCase().includes(q);
                el.classList.toggle('search-miss', !hit);
                if (hit) shown++;
            });
            cnt.textContent = q ? shown + ' / ' + total : '';
            list.classList.toggle('searching', !!q);
        }
        input.addEventListener('input', apply);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { input.value = ''; apply(); }
            if (e.key === 'Enter') {                              // Enter ticks the matches that are left
                e.preventDefault();
                const vis = [...list.querySelectorAll('.replay-item:not(.search-miss) input[type="checkbox"]')];
                if (vis.length && vis.length <= 20) vis.forEach((cb) => { if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); } });
            }
        });
        new MutationObserver(() => { if (input.value) apply(); }).observe(list, { childList: true });
        // "All" only ticks what the search shows
        const all = document.getElementById('select-all');
        if (all) all.addEventListener('click', () => {
            if (!input.value.trim()) return;
            setTimeout(() => { list.querySelectorAll('.replay-item.search-miss input[type="checkbox"]').forEach((cb) => { cb.checked = false; }); list.dispatchEvent(new Event('change', { bubbles: true })); }, 0);
        });
    })();

    /* ---------- 2. Your key: account chip, key tile, sign out ---------- */
    (function account() {
        const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
        const DAY = 86400000;
        let me = null, chip = null, pop = null;
        const daysLeft = (m) => (m && m.expiresAt ? Math.max(0, Math.ceil((m.expiresAt - Date.now()) / DAY)) : null);
        const fmtDate = (t) => new Date(t).toLocaleDateString(window.LedgerI18n && window.LedgerI18n.lang === 'ru' ? 'ru-RU' : undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        const tgUrl = (m) => 'https://t.me/' + encodeURIComponent((m && m.telegram) || 'm4ks1em');

        function signOut() {
            fetch('/_ledger/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-Ledger': '1' } })
                .finally(() => { location.href = '/login'; });
        }
        function closePop() {
            if (!pop) return;
            pop.remove(); pop = null;
            if (chip) chip.setAttribute('aria-expanded', 'false');
        }
        function openPop() {
            if (pop) { closePop(); return; }
            const d = daysLeft(me);
            pop = document.createElement('div');
            pop.className = 'account-pop';
            pop.setAttribute('role', 'dialog');
            const h = document.createElement('h4'); h.textContent = me.label || T('Your key');
            const tail = document.createElement('div'); tail.className = 'key-tail'; tail.textContent = 'LDG-••••-••••-••••-' + (me.tail || '????');
            const dl = document.createElement('dl');
            const row = (k, v) => { const dt = document.createElement('dt'); dt.textContent = T(k); const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); };
            row('Valid until', me.expiresAt ? fmtDate(me.expiresAt) : T('No expiry'));
            if (d != null) row('Days left', String(d));
            row('Computers', (me.devices || 1) + ' / ' + (me.maxDevices || 1));
            row('Version', me.version || '');
            pop.append(h, tail, dl);
            if (me.offline) { const o = document.createElement('p'); o.className = 'offline-note'; o.textContent = T('No connection to the key server. DotaTraker keeps working and checks again later.'); pop.appendChild(o); }
            const actions = document.createElement('div'); actions.className = 'pop-actions';
            const renew = document.createElement('a'); renew.className = 'tg-link'; renew.href = tgUrl(me); renew.target = '_blank'; renew.rel = 'noopener noreferrer';
            renew.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 9-7"/></svg>';
            const rs = document.createElement('span'); rs.textContent = T('Renew in Telegram'); const rb = document.createElement('b'); rb.textContent = '@' + (me.telegram || 'm4ks1em');
            renew.append(rs, rb);
            const out = document.createElement('button'); out.type = 'button'; out.className = 'btn secondary-btn'; out.textContent = T('Sign out on this PC');
            out.addEventListener('click', async () => {
                const ok = await LedgerUI.confirm({ title: T('Sign out on this PC?'), text: T('You will need the key to come back in.'), ok: T('Sign out'), danger: false });
                if (ok) signOut();
            });
            actions.append(renew, out);
            pop.appendChild(actions);
            chip.parentElement.appendChild(pop);
            chip.setAttribute('aria-expanded', 'true');
        }
        document.addEventListener('mousedown', (e) => { if (pop && !pop.contains(e.target) && e.target !== chip && !chip.contains(e.target)) closePop(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });

        function paint() {
            const bar = document.querySelector('.header-actions');
            if (!bar || !me) return;
            const d = daysLeft(me);
            if (!chip) {
                const wrap = document.createElement('div'); wrap.className = 'account';
                chip = document.createElement('button'); chip.type = 'button'; chip.className = 'account-chip'; chip.setAttribute('aria-haspopup', 'dialog'); chip.setAttribute('aria-expanded', 'false');
                chip.addEventListener('click', openPop);
                wrap.appendChild(chip);
                bar.appendChild(wrap);
            }
            chip.textContent = '';
            const av = document.createElement('span'); av.className = 'avatar';
            if (me.steam && me.steam.avatar) { const im = document.createElement('img'); im.src = me.steam.avatar; im.alt = ''; av.appendChild(im); av.classList.add('has-img'); }
            else av.textContent = ((me.steam && me.steam.name) || me.label || 'D').trim().charAt(0).toUpperCase();
            const who = document.createElement('span'); who.className = 'who'; who.textContent = (me.steam && me.steam.name) || me.label || T('Your key');
            chip.append(av, who);
            if (d != null) { const l = document.createElement('span'); l.className = 'left'; l.textContent = d + ' ' + T('d'); chip.appendChild(l); }
            chip.classList.toggle('warn', d != null && d <= 3);
            chip.title = me.offline ? T('No connection to the key server. DotaTraker keeps working and checks again later.') : '';

            // the key tile on the home tab
            const tile = document.getElementById('key-tile');
            if (tile) {
                const days = document.getElementById('key-days'), label = document.getElementById('key-days-label'), meta = document.getElementById('key-meta');
                if (d == null) { days.textContent = '∞'; label.textContent = T('no expiry'); }
                else { LedgerUI.countTo(days, d); label.textContent = window.LedgerI18n && window.LedgerI18n.lang === 'ru' ? window.LedgerI18n.plural(d, 'день остался', 'дня осталось', 'дней осталось') : (d === 1 ? 'day left' : 'days left'); }
                tile.classList.toggle('warn', d != null && d <= 3 && d > 0);
                tile.classList.toggle('bad', d === 0);
                meta.textContent = (me.label ? me.label + '. ' : '') + (me.expiresAt ? T('Valid until') + ' ' + fmtDate(me.expiresAt) + '.' : T('This key never expires.'));
                const renew = document.getElementById('key-renew'); if (renew) renew.href = tgUrl(me);
                const tg = document.getElementById('key-tg'); if (tg) tg.textContent = '@' + (me.telegram || 'm4ks1em');
            }
        }
        // Steam account (official OpenID sign-in) in the settings sheet
        function paintSteam() {
            const box = document.getElementById('steam-account');
            if (!box || !me) return;
            box.textContent = '';
            if (me.steam) {
                const row = document.createElement('div'); row.className = 'steam-acc';
                const im = document.createElement('img'); im.alt = ''; if (me.steam.avatar) im.src = me.steam.avatar;
                const t = document.createElement('div'); t.className = 'sa-text';
                const b = document.createElement('b'); b.textContent = me.steam.name || me.steam.id;
                const sm = document.createElement('small'); sm.textContent = me.steam.id;
                t.append(b, sm);
                const out = document.createElement('button'); out.type = 'button'; out.className = 'btn secondary-btn'; out.textContent = T('Unlink');
                out.addEventListener('click', () => {
                    fetch('/_ledger/steam/unlink', { method: 'POST', credentials: 'same-origin', headers: { 'X-Ledger': '1' } }).finally(load);
                });
                row.append(im, t, out);
                box.appendChild(row);
            } else {
                const a = document.createElement('a'); a.className = 'steam-signin'; a.href = '/_ledger/steam/start?from=app';
                a.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#fff"/><circle cx="20.6" cy="12.4" r="4.3" fill="none" stroke="#171a21" stroke-width="1.9"/><circle cx="20.6" cy="12.4" r="2.1" fill="#171a21"/><circle cx="11.3" cy="21.1" r="3.4" fill="none" stroke="#171a21" stroke-width="1.9"/><path d="M2.5 17.6 9 20.3M13.8 18.6l3.7-3.3" stroke="#171a21" stroke-width="2.4" stroke-linecap="round"/></svg>';
                const sp = document.createElement('span'); const b = document.createElement('b'); b.textContent = T('Sign in through Steam'); const sm = document.createElement('small'); sm.textContent = 'steamcommunity.com';
                sp.append(b, sm); a.appendChild(sp);
                box.appendChild(a);
            }
            // fill the player lookup with your own Steam ID when it is empty
            const lk = document.getElementById('lk-id');
            if (me.steam && lk && !lk.value) lk.value = me.steam.id;
        }
        function paintUpdate() {
            const slot = document.getElementById('update-slot');
            if (slot && window.LedgerUI && LedgerUI.updateBar) LedgerUI.updateBar(slot, me && me.update, me && me.github);
        }
        (function steamReturn() {
            const q = new URLSearchParams(location.search).get('steam');
            if (!q) return;
            history.replaceState(null, '', location.pathname);
            const msg = { ok: ['Steam account linked.', 'success'], other: ['This key is linked to another Steam account.', 'error'], cancel: ['Steam sign-in was cancelled.', 'info'], expired: ['The Steam sign-in took too long. Try again.', 'error'], fail: ['Steam could not confirm the sign-in. Try again.', 'error'], offline: ['Cannot reach Steam. Check your internet connection.', 'error'] }[q];
            if (msg) setTimeout(() => LedgerUI.toast(T(msg[0]), msg[1]), 600);
        })();
        function load() {
            return fetch('/_ledger/me', { credentials: 'same-origin', cache: 'no-store' })
                .then((r) => (r.ok ? r.json() : null))
                .then((m) => { if (m) { me = m; paint(); paintSteam(); paintUpdate(); } })
                .catch(() => {});
        }
        load();
        setInterval(load, 5 * 60000);
        document.addEventListener('ledger:lang', () => { paint(); paintSteam(); paintUpdate(); });
    })();

    /* ---------- 9. Settings sheet: open/close with motion, auto-sync ---------- */
    (function settingsSheet() {
        const panel = document.getElementById('setup-panel'), toggle = document.getElementById('setup-toggle');
        if (!panel || !toggle) return;
        new MutationObserver(() => toggle.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')))).observe(panel, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.classList.contains('hidden') && !document.querySelector('.dialog-back')) panel.classList.add('hidden'); });
    })();

    (function autoSync() {
        const $ = (id) => document.getElementById(id);
        if (!$('sync-section')) return;
        const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
        let cfg = null, timer = null;
        const ago = (t) => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? T('just now') : m < 60 ? m + ' ' + T('min ago') : Math.round(m / 60) + ' ' + T('h ago'); };
        function show(j) {
            if (!j || !j.config) return;
            cfg = j.config;
            if (document.activeElement !== $('sy-id')) $('sy-id').value = cfg.steamId || '';
            $('sy-every').value = String(cfg.everyMin); $('sy-limit').value = String(cfg.limit); $('sy-source').value = cfg.source;
            $('sy-on').checked = !!cfg.enabled;
            const s = j.state || {};
            const out = $('sy-state'); out.textContent = '';
            const b = document.createElement('b'); b.textContent = T(s.running ? 'Working…' : (s.message || (cfg.enabled ? 'On' : 'Off')));
            out.appendChild(b);
            if (s.lastRun) out.appendChild(document.createTextNode(' · ' + T('last check') + ' ' + ago(s.lastRun)));
            if (s.downloadedTotal) out.appendChild(document.createTextNode(' · ' + T('downloaded') + ' ' + s.downloadedTotal));
            clearTimeout(timer);
            timer = setTimeout(load, s.running ? 2000 : 30000);
        }
        function load() { return fetch('/_ledger/sync', { credentials: 'same-origin', cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then(show).catch(() => {}); }
        function save(patch) {
            return fetch('/_ledger/sync', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Ledger': '1' }, body: JSON.stringify(patch) })
                .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) { LedgerUI.toast(j.error || 'Could not save auto-sync.', 'bad'); load(); return; } show(j); })
                .catch(() => LedgerUI.toast('Could not save auto-sync.', 'bad'));
        }
        $('sy-id').addEventListener('change', () => save({ steamId: $('sy-id').value.trim() }));
        ['sy-every', 'sy-limit', 'sy-source'].forEach((id) => $(id).addEventListener('change', () => save({ everyMin: $('sy-every').value, limit: $('sy-limit').value, source: $('sy-source').value })));
        $('sy-on').addEventListener('change', () => {
            if ($('sy-on').checked && !$('sy-id').value.trim()) { $('sy-on').checked = false; LedgerUI.toast(T('Set a Steam ID first'), 'info'); $('sy-id').focus(); return; }
            save({ enabled: $('sy-on').checked, steamId: $('sy-id').value.trim() });
        });
        $('sy-run').addEventListener('click', () => {
            if (!$('sy-id').value.trim()) { LedgerUI.toast(T('Set a Steam ID first'), 'info'); $('sy-id').focus(); return; }
            save({ steamId: $('sy-id').value.trim() }).then(() => save({ action: 'run' })).then(() => setTimeout(load, 800));
        });
        load();
    })();

    /* ---------- 10. Matches tab: empty state until something is analysed ---------- */
    (function resultsEmpty() {
        const empty = document.getElementById('results-empty'), sec = document.getElementById('results-section');
        if (!empty || !sec) return;
        const sync = () => empty.classList.toggle('hidden', !sec.classList.contains('hidden'));
        new MutationObserver(sync).observe(sec, { attributes: true, attributeFilter: ['class'] });
        sync();
    })();
})();

/* ---------- Chat & moments for the selected match ---------- */
(function moments() {
    const sec = document.getElementById('moments-section');
    const sw = document.getElementById('moments-switch');
    const repPane = document.getElementById('moments-reports');
    const chatPane = document.getElementById('moments-chat');
    const evPane = document.getElementById('moments-events');
    const sel = document.getElementById('match-selector');
    if (!sec || !chatPane || !evPane) return;
    // Consolidate: move the player picker + Incoming/Outgoing/Scoreboard + report list into the "Reports" tab,
    // so everything about a match lives in one place. The app.js renderers keep writing to these by id.
    (function consolidateReports() {
        if (!repPane) return;
        const psel = document.getElementById('player-selector-container');
        const hdr = document.querySelector('.timeline-graph-header');
        const cont = document.getElementById('timeline-graph-container');
        repPane.textContent = '';
        if (psel) repPane.appendChild(psel);
        if (hdr) repPane.appendChild(hdr);
        if (cont) repPane.appendChild(cont);
        const gs = document.getElementById('graphs-section'); if (gs) gs.style.display = 'none';
    })();
    const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    const FLAME = /\b(рак|дно|днищ|ливер|слил|слей|нуб|нубас|даун|дебил|идиот|тупо?й|тупая|кал|говн|сос[иьё]|изи|изич|носок|бот|repor|report|репорт|trash|noob|ez|easy|idiot|kys|report)\b/i;
    const teamClass = (t) => (t === 2 ? 'r' : t === 3 ? 'd' : '');

    function who(x) { return x.Name || x.Hero || (x.Slot >= 0 ? T('Slot') + ' ' + x.Slot : '?'); }

    function renderReports(m) {
        if (!repPane) return;
        const reports = (m && m.reports) || [];
        repPane.textContent = '';
        if (!reports.length) { repPane.innerHTML = '<p class="moments-empty">' + T('No reports in this replay.') + '</p>'; return; }
        const list = document.createElement('div'); list.className = 'rep-list';
        [...reports].sort((a, b) => clSecs(a.Time) - clSecs(b.Time)).forEach((r) => {
            const ally = r.Team === 'FRIENDLY';
            const reporter = who(r);
            const hero = (r.Hero && String(r.Hero).toLowerCase() !== 'unknown') ? r.Hero : '';
            const target = r.TargetName || r.TargetHero || '';
            const row = document.createElement('div'); row.className = 'rep-row ' + (ally ? 'ally' : 'enemy');
            const iconUrl = (typeof getHeroIconUrl === 'function') ? getHeroIconUrl(hero || r.TargetHero || r.Hero) : null;
            const av = esc((reporter || '?').trim().charAt(0).toUpperCase())
                + (iconUrl ? '<img src="' + esc(iconUrl) + '" alt="" loading="lazy" onerror="this.remove()">' : '');
            row.innerHTML =
                '<span class="rep-time">' + esc(r.Time || '') + '</span>' +
                '<span class="rep-av">' + av + '</span>' +
                '<span class="rep-who"><b>' + esc(reporter) + '</b>' + (hero ? '<small>' + esc(hero) + '</small>' : '') + '</span>' +
                (target ? '<span class="rep-target">→ ' + esc(target) + '</span>' : '<span class="rep-target"></span>') +
                '<span class="rep-tag ' + (ally ? 'ally' : 'enemy') + '">' + esc(ally ? T('Report from teammate') : T('Report from enemy')) + '</span>';
            list.appendChild(row);
        });
        repPane.appendChild(list);
    }

    function clSecs(t) {
        if (t == null) return 0;
        const s = String(t).trim(); const neg = s.startsWith('-');
        const p = s.replace('-', '').split(':').map(Number);
        let v = 0;
        if (p.length === 3) v = p[0] * 3600 + p[1] * 60 + p[2];
        else if (p.length === 2) v = p[0] * 60 + p[1];
        else v = Number(s) || 0;
        return neg ? -v : v;
    }
    const WHEEL_IC = '<svg class="cl-wheel" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3"/></svg>';
    function wheelPhrase(e) {
        const W = window.CHAT_WHEEL || {};
        let id = e.MessageID; if (id == null) id = e.MessageId; if (id == null) id = e.Message;
        if (id == null) id = e.ChatWheelID; if (id == null) id = e.WheelID; if (id == null) id = e.Value;
        if (id == null) id = e.Text;
        const idStr = String(id == null ? '' : id).trim();
        if (W[idStr]) return { text: W[idStr].t, all: W[idStr].a === 1, sound: W[idStr].s === 1 };
        if (idStr && !/^\d+$/.test(idStr)) return { text: idStr, all: false, sound: false }; // already readable
        return { text: T('Chat wheel') + (idStr ? ' #' + idStr : ''), all: false, sound: false };
    }

    function renderChat(m) {
        const chat = ((m && m.chat) || []).map((c) => { c._k = 'chat'; return c; });
        const wheels = ((m && m.events) || []).filter((e) => e.Type === 'chat_wheel').map((e) => { e._k = 'wheel'; return e; });
        const all = chat.concat(wheels).sort((a, b) => clSecs(a.Time) - clSecs(b.Time));
        chatPane.textContent = '';
        if (!all.length) { chatPane.innerHTML = '<p class="moments-empty">' + T('No chat in this replay.') + '</p>'; return; }

        // Toxicity meter: who talked most / who flamed most (text chat only)
        const talk = {};
        chat.forEach((c) => {
            const n = who(c); if (!n) return;
            if (!talk[n]) talk[n] = { n, msgs: 0, flames: 0, team: c.Team };
            talk[n].msgs++; if (FLAME.test(c.Text || '')) talk[n].flames++;
        });
        const people = Object.values(talk);
        if (people.length) {
            const totalFlames = people.reduce((a, p) => a + p.flames, 0);
            const topTalk = people.slice().sort((a, b) => b.msgs - a.msgs)[0];
            const topTox = people.slice().sort((a, b) => b.flames - a.flames)[0];
            const stats = document.createElement('div'); stats.className = 'chat-stats';
            const chip = (cls, label, val) => '<span class="cs-chip ' + cls + '"><small>' + esc(label) + '</small><b>' + esc(val) + '</b></span>';
            let html = chip('', T('Messages'), String(chat.length));
            if (topTalk && topTalk.msgs) html += chip('talk', T('Most talkative'), topTalk.n + ' · ' + topTalk.msgs);
            if (topTox && topTox.flames) html += chip('tox', '🔥 ' + T('Most toxic'), topTox.n + ' · ' + topTox.flames);
            else html += chip('calm', T('Toxic messages'), String(totalFlames));
            stats.innerHTML = html;
            chatPane.appendChild(stats);
        }

        all.forEach((c) => {
            if (c._k === 'wheel') {
                const w = wheelPhrase(c);
                const row = document.createElement('div');
                row.className = 'chat-line wheel ' + teamClass(c.Team);
                const t = document.createElement('span'); t.className = 'cl-time'; t.textContent = c.Time;
                const scope = document.createElement('span'); scope.className = 'cl-scope';
                scope.textContent = (c.AllChat != null ? c.AllChat : w.all) ? T('ALL') : T('TEAM');
                const n = document.createElement('b'); n.className = 'cl-name'; n.textContent = who(c);
                const tx = document.createElement('span'); tx.className = 'cl-text';
                tx.innerHTML = WHEEL_IC + '<span>' + (w.sound ? '🔊 ' : '') + esc(w.text) + '</span>';
                row.append(t, scope, n, tx);
                chatPane.appendChild(row);
                return;
            }
            const row = document.createElement('div');
            const flame = FLAME.test(c.Text || '');
            row.className = 'chat-line ' + teamClass(c.Team) + (flame ? ' flame' : '');
            const t = document.createElement('span'); t.className = 'cl-time'; t.textContent = c.Time;
            const n = document.createElement('b'); n.className = 'cl-name'; n.textContent = who(c);
            const scope = document.createElement('span'); scope.className = 'cl-scope'; scope.textContent = c.AllChat ? T('ALL') : T('TEAM');
            const tx = document.createElement('span'); tx.className = 'cl-text'; tx.textContent = c.Text;
            row.append(t, scope, n, tx);
            if (flame) { const f = document.createElement('i'); f.className = 'cl-flame'; f.title = T('Toxic'); f.textContent = '🔥'; row.appendChild(f); }
            chatPane.appendChild(row);
        });
    }

    const teamName = (t) => (t === 2 ? T('Radiant') : t === 3 ? T('Dire') : '');
    // Keyed by the engine's event Type, lower-cased (engine emits firstBlood / Disconnect / roshan / courier / chat_wheel).
    const EV = {
        firstblood: ['blood', (e) => T('First blood') + ': ' + who(e) + (e.TargetName || e.TargetHero ? ' → ' + (e.TargetName || e.TargetHero) : '')],
        roshan: ['rosh', (e) => { const tn = teamName(e.Team); return tn ? tn + ' ' + T('killed Roshan') : T('Roshan killed'); }],
        courier: ['courier', (e) => { const tn = teamName(e.Team); return (tn ? tn + ': ' : '') + T('courier killed') + (e.TargetName || e.TargetHero ? ' (' + (e.TargetName || e.TargetHero) + ')' : ''); }],
        disconnect: ['plug', (e) => who(e) + ' ' + T('disconnected')],
        glyph: ['shield', (e) => who(e) + ' ' + T('used the glyph')],
        pause: ['pause', (e) => who(e) + ' ' + T('paused the game')],
        unpause: ['play', (e) => who(e) + ' ' + T('unpaused')]
    };
    const ICON = {
        shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/>',
        pause: '<path d="M8 5v14M16 5v14"/>',
        play: '<path d="M7 5l12 7-12 7z"/>',
        blood: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
        plug: '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0zM12 16v5"/>',
        rosh: '<path d="M12 3a7 7 0 0 0-7 7v3l2 2v3h3v-2h4v2h3v-3l2-2v-3a7 7 0 0 0-7-7zM9.5 10.5h.01M14.5 10.5h.01"/>',
        courier: '<path d="M3 13l2-6h7v10H4a1 1 0 0 1-1-1zM12 9h4l3 3v3h-7zM7 18a1.6 1.6 0 1 0 0-.01M16 18a1.6 1.6 0 1 0 0-.01"/>'
    };
    const evKey = (e) => String(e.Type || '').toLowerCase();
    function renderEvents(m) {
        const evs = ((m && m.events) || []).filter((e) => EV[evKey(e)]);
        evPane.textContent = '';
        if (!evs.length) { evPane.innerHTML = '<p class="moments-empty">' + T('No notable moments in this replay.') + '</p>'; return; }
        // small summary
        const count = (t) => evs.filter((e) => evKey(e) === t).length;
        const sum = document.createElement('div'); sum.className = 'ev-summary';
        [['firstblood', T('first blood')], ['roshan', T('Roshan')], ['courier', T('couriers')], ['disconnect', T('disconnects')], ['glyph', T('glyphs')], ['pause', T('pauses')]].forEach(([t, label]) => {
            const n = count(t); if (!n && t !== 'firstblood') return;
            const chip = document.createElement('span'); chip.className = 'ev-chip ' + t;
            chip.innerHTML = '<b>' + n + '</b> ' + esc(label);
            sum.appendChild(chip);
        });
        evPane.appendChild(sum);
        const list = document.createElement('div'); list.className = 'ev-list';
        evs.forEach((e) => {
            const kk = evKey(e);
            const [icon, text] = [EV[kk][0], EV[kk][1](e)];
            const row = document.createElement('div'); row.className = 'ev-row ' + kk + ' ' + teamClass(e.Team);
            row.innerHTML = '<span class="ev-time">' + esc(e.Time) + '</span><span class="ev-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[icon] + '</svg></span><span class="ev-text">' + esc(text) + '</span>';
            list.appendChild(row);
        });
        evPane.appendChild(list);
    }

    const wardPane = document.getElementById('moments-wards');
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    function wardName(m, slot) {
        const pl = (m && (m.players || m.Players)) || [];
        const p = pl[slot];
        if (p) return p.Hero || p.hero || p.Name || p.name || (T('Slot') + ' ' + slot);
        return slot >= 0 ? T('Slot') + ' ' + slot : '?';
    }
    // ---- match map geometry (normalized to img/map.png: x right 0..1, y up 0..1; Radiant bottom-left, Dire top-right) ----
    const TOW = {
        top: { 1: { x: .14, y: .72 }, 2: { x: .115, y: .50 }, 3: { x: .135, y: .33 } },
        mid: { 1: { x: .40, y: .36 }, 2: { x: .31, y: .28 }, 3: { x: .22, y: .20 } },
        bot: { 1: { x: .62, y: .07 }, 2: { x: .34, y: .07 }, 3: { x: .20, y: .115 } }
    };
    const mir = (p) => ({ x: 1 - p.x, y: 1 - p.y });
    const ROSH = { x: .29, y: .73 };
    function buildBuildings() {
        const b = [];
        ['top', 'mid', 'bot'].forEach((ln) => [1, 2, 3].forEach((t) => {
            b.push({ id: 'r_' + ln + '_t' + t, x: TOW[ln][t].x, y: TOW[ln][t].y, side: 'r', kind: 'tower', at: null });
            // Dire map is rotated 180°, so Dire's top lane mirrors Radiant's bot and vice-versa
            const dln = ln === 'top' ? 'bot' : ln === 'bot' ? 'top' : 'mid';
            const dp = mir(TOW[dln][t]);
            b.push({ id: 'd_' + ln + '_t' + t, x: dp.x, y: dp.y, side: 'd', kind: 'tower', at: null });
        }));
        b.push({ id: 'r_fort', x: .12, y: .12, side: 'r', kind: 'fort', at: null });
        b.push({ id: 'd_fort', x: .88, y: .88, side: 'd', kind: 'fort', at: null });
        return b;
    }
    function keyToId(key) {
        if (!key) return null; const k = String(key).toLowerCase();
        const side = k.indexOf('badguys') >= 0 ? 'd' : 'r';
        if (k.indexOf('fort') >= 0) return side + '_fort';
        const ln = k.indexOf('_top') >= 0 ? 'top' : k.indexOf('_mid') >= 0 ? 'mid' : k.indexOf('_bot') >= 0 ? 'bot' : null;
        const tm = k.match(/tower(\d)/); if (ln && tm) return side + '_' + ln + '_t' + tm[1];
        return null;
    }
    let mapTimer = null;
    function stopMap() { if (mapTimer) { clearInterval(mapTimer); mapTimer = null; } }
    function renderWards(m) {
        if (!wardPane) return;
        stopMap();
        const wards = (m && m.wards) || [];
        const od = (window.ledgerOD && m && String(window.ledgerOD.matchId) === String(m.matchID)) ? window.ledgerOD : null;
        const objectives = (od && od.objectives) || [];
        const deaths = (od && od.deaths) || [];
        wardPane.textContent = '';
        if (!wards.length && !objectives.length) { wardPane.innerHTML = '<p class="moments-empty">' + T('No map data for this match yet. Parse it on OpenDota for towers and deaths.') + '</p>'; return; }
        const mmss = (s) => (s < 0 ? '-' : '') + Math.floor(Math.abs(s) / 60) + ':' + String(Math.floor(Math.abs(s) % 60)).padStart(2, '0');

        // ward time windows
        const wItems = wards.map((w) => {
            const nx = clamp01((w.CellX + (w.VecX || 0) / 128 - 64) / 128);
            const ny = clamp01((w.CellY + (w.VecY || 0) / 128 - 64) / 128);
            const placeAt = clSecs(w.PlaceTime);
            const dieAt = w.DeathTime ? clSecs(w.DeathTime) : (w.LifeSecs > 0 ? placeAt + w.LifeSecs : placeAt + (w.Type === 'obs' ? 360 : 420));
            return { nx, ny, placeAt, dieAt, sen: w.Type === 'sen', who: wardName(m, w.Slot) };
        });
        // buildings + destruction
        const blds = buildBuildings(); const bById = {}; blds.forEach((b) => { bById[b.id] = b; });
        const roshKills = [];
        objectives.forEach((o) => {
            const ty = String(o.type || '').toUpperCase(), key = o.key || '';
            if (/ROSHAN/.test(ty) || /roshan/i.test(key)) { roshKills.push({ at: o.time }); return; }
            const id = keyToId(key); if (id && bById[id] && (bById[id].at == null || o.time < bById[id].at)) bById[id].at = o.time;
        });
        // duration
        let dur = (od && od.duration) || 0;
        wItems.forEach((w) => { if (w.dieAt > dur) dur = w.dieAt; });
        blds.forEach((b) => { if (b.at != null && b.at > dur) dur = b.at; });
        deaths.forEach((d) => { if (d.t > dur) dur = d.t; });
        dur = Math.max(60, Math.round(dur));

        // ---- build DOM ----
        const grid = document.createElement('div'); grid.className = 'mapgrid';
        const mapCol = document.createElement('div'); mapCol.className = 'map-col';

        const legend = document.createElement('div'); legend.className = 'map-legend';
        legend.innerHTML = '<span class="ml obs">' + esc(T('Observers')) + '</span><span class="ml sen">' + esc(T('Sentries')) + '</span>'
            + '<span class="ml tw">' + esc(T('Tower down')) + '</span><span class="ml ro">' + esc(T('Roshan')) + '</span>';

        const map = document.createElement('div'); map.className = 'matchmap';
        const layer = document.createElement('div'); layer.className = 'mm-layer'; map.appendChild(layer);
        // building markers (faint standing; red X when down)
        const bEls = blds.map((b) => {
            const el = document.createElement('div');
            el.className = 'mmk bld ' + b.side + (b.kind === 'fort' ? ' fort' : '');
            el.style.left = (b.x * 100).toFixed(1) + '%'; el.style.top = ((1 - b.y) * 100).toFixed(1) + '%';
            layer.appendChild(el); return { el, at: b.at };
        });
        // ward markers
        const wEls = wItems.map((w) => {
            const el = document.createElement('div');
            el.className = 'mmk ward ' + (w.sen ? 'sen' : 'obs');
            el.style.left = (w.nx * 100).toFixed(1) + '%'; el.style.top = ((1 - w.ny) * 100).toFixed(1) + '%';
            el.title = (w.sen ? T('Sentry') : T('Observer')) + ' · ' + w.who + ' · ' + mmss(w.placeAt);
            layer.appendChild(el); return { el, placeAt: w.placeAt, dieAt: w.dieAt };
        });
        // roshan markers
        const rEls = roshKills.map((r) => {
            const el = document.createElement('div'); el.className = 'mmk rosh';
            el.style.left = (ROSH.x * 100).toFixed(1) + '%'; el.style.top = ((1 - ROSH.y) * 100).toFixed(1) + '%';
            el.textContent = 'R'; layer.appendChild(el); return { el, at: r.at };
        });
        const mapWrap = document.createElement('div'); mapWrap.className = 'matchmap-wrap';
        mapWrap.appendChild(map);
        mapCol.appendChild(legend); mapCol.appendChild(mapWrap);

        // ---- scrubber / player ----
        // timeline for the "what's happening now" readout
        const nowline = [];
        const fbEv = ((m && m.events) || []).find((e) => String(e.Type || '').toLowerCase() === 'firstblood');
        if (fbEv) nowline.push({ t: clSecs(fbEv.Time), txt: T('First blood'), cls: 'fb' });
        blds.forEach((b) => { if (b.at != null) nowline.push({ t: b.at, txt: (b.side === 'r' ? T('The Radiant') : T('The Dire')) + ' · ' + T('Tower down'), cls: b.side === 'r' ? 'tr' : 'td' }); });
        roshKills.forEach((r) => nowline.push({ t: r.at, txt: T('Roshan killed'), cls: 'ro' }));
        nowline.sort((a, b) => a.t - b.t);

        const panel = document.createElement('div'); panel.className = 'mm-panel';
        const top = document.createElement('div'); top.className = 'mm-top';
        const clockEl = document.createElement('div'); clockEl.className = 'mm-clock';
        const nowEl = document.createElement('div'); nowEl.className = 'mm-now';
        top.append(clockEl, nowEl);

        const bar = document.createElement('div'); bar.className = 'mm-bar';
        const playBtn = document.createElement('button'); playBtn.type = 'button'; playBtn.className = 'mm-play';
        const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg>';
        const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
        playBtn.innerHTML = ICON_PLAY;
        const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = String(dur); slider.value = '0'; slider.className = 'mm-slider';
        const speedBtn = document.createElement('button'); speedBtn.type = 'button'; speedBtn.className = 'mm-speed'; speedBtn.textContent = '1×';
        const fill = document.createElement('div'); fill.className = 'mm-fill';
        const ticks = document.createElement('div'); ticks.className = 'mm-ticks';
        deaths.forEach((d) => { if (d.t < 0 || d.t > dur) return; const tk = document.createElement('i'); tk.className = 'tk ' + (d.team === 2 ? 'r' : d.team === 3 ? 'd' : ''); tk.style.left = (d.t / dur * 100).toFixed(2) + '%'; ticks.appendChild(tk); });
        const sliderWrap = document.createElement('div'); sliderWrap.className = 'mm-slider-wrap'; sliderWrap.append(fill, ticks, slider);
        bar.append(playBtn, sliderWrap, speedBtn);
        panel.append(top, bar);

        let T_now = dur, speed = 1, playing = false; const speeds = [1, 2, 4];
        function apply(t) {
            T_now = t;
            wEls.forEach((w) => { w.el.classList.toggle('on', t >= w.placeAt && t < w.dieAt); });
            bEls.forEach((b) => { b.el.classList.toggle('down', b.at != null && t >= b.at); });
            rEls.forEach((r, i) => { const last = (r.at <= t) && (i === rEls.length - 1 || !(rEls[i + 1].at <= t)); r.el.classList.toggle('on', r.at <= t); r.el.classList.toggle('fresh', last && t - r.at < 30); });
            let dr = 0, dd = 0; deaths.forEach((d) => { if (d.t <= t) { if (d.team === 2) dr++; else if (d.team === 3) dd++; } });
            clockEl.innerHTML = '<b>' + mmss(t) + '</b><span>/ ' + mmss(dur) + '</span>'
                + (deaths.length ? '<span class="kc"><i class="kr">' + dr + '</i><em>:</em><i class="kd">' + dd + '</i></span>' : '');
            fill.style.width = (dur ? (t / dur * 100) : 0).toFixed(1) + '%';
            let cur = null; for (let i = 0; i < nowline.length; i++) { if (nowline[i].t <= t) cur = nowline[i]; else break; }
            if (cur) { nowEl.innerHTML = '<i class="nd ' + cur.cls + '"></i><b>' + mmss(cur.t) + '</b> ' + esc(cur.txt); nowEl.classList.add('show'); }
            else { nowEl.innerHTML = '<span class="nd-idle">' + esc(T('Drag or play to replay the match')) + '</span>'; nowEl.classList.remove('show'); }
            slider.value = String(t);
        }
        function setPlaying(p) { playing = p; playBtn.innerHTML = p ? ICON_PAUSE : ICON_PLAY; playBtn.classList.toggle('on', p); }
        function tick() {
            if (!playing) return;
            // ~full match in 42s at 1×; each 100ms tick advances dur/420 game-seconds
            const t = T_now + Math.max(1, dur / 420) * speed;
            if (t >= dur) { apply(dur); setPlaying(false); stopMap(); return; }
            apply(t);
        }
        playBtn.addEventListener('click', () => {
            if (playing) { setPlaying(false); stopMap(); return; }
            if (T_now >= dur) { apply(0); }
            setPlaying(true); stopMap(); mapTimer = setInterval(tick, 100);
        });
        slider.addEventListener('input', () => { setPlaying(false); stopMap(); apply(Number(slider.value)); });
        speedBtn.addEventListener('click', () => { speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length]; speedBtn.textContent = speed + '×'; });
        mapCol.appendChild(panel);

        // ---- ward stats ----
        const obs = wards.filter((w) => w.Type === 'obs'), sen = wards.filter((w) => w.Type === 'sen');
        const livedObs = obs.filter((w) => w.LifeSecs > 0);
        const avgLife = livedObs.length ? Math.round(livedObs.reduce((a, w) => a + w.LifeSecs, 0) / livedObs.length) : 0;
        const byPlacer = {}; wards.forEach((w) => { const s = w.Slot; if (s == null || s < 0) return; byPlacer[s] = (byPlacer[s] || 0) + 1; });
        let topSlot = null, topN = 0; Object.keys(byPlacer).forEach((s) => { if (byPlacer[s] > topN) { topN = byPlacer[s]; topSlot = Number(s); } });
        const dewarded = obs.filter((w) => w.LifeSecs > 0 && w.LifeSecs < 340).length;
        const stats = document.createElement('div'); stats.className = 'ward-stats';
        const stat = (label, val, cls) => '<div class="ward-stat"><span>' + esc(label) + '</span><b class="' + (cls || '') + '">' + esc(val) + '</b></div>';
        stats.innerHTML = stat(T('Observers placed'), obs.length, 'y')
            + stat(T('Sentries placed'), sen.length, 'b')
            + stat(T('Average observer lifetime'), avgLife ? mmss(avgLife) : '—')
            + (topSlot != null ? stat(T('Most wards'), wardName(m, topSlot) + ' · ' + topN, 'sm') : '')
            + stat(T('Dewarded (est.)'), dewarded, dewarded ? 'r' : '');

        grid.append(mapCol, stats);
        wardPane.appendChild(grid);
        apply(dur); // start fully revealed
    }

    const hlPane = document.getElementById('match-highlights');
    const HL_SVG = {
        blood: ICON.blood, rosh: ICON.rosh, courier: ICON.courier,
        report: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h4"/>',
        flame: '<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5s.2 2.2 2 2.2c1.6 0 1-3 2-5 1 1.2 2 2.4 2 4"/>',
        wheel: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2"/><path d="M12 4.5v3M12 16.5v3M4.5 12h3M16.5 12h3"/>'
    };
    function renderHighlights(m) {
        if (!hlPane) return;
        const ev = (m && m.events) || [], chat = (m && m.chat) || [], reps = (m && m.reports) || [];
        const cnt = (t) => ev.filter((e) => evKey(e) === t).length;
        const fb = ev.find((e) => evKey(e) === 'firstblood');
        const rosh = cnt('roshan'), cour = cnt('courier');
        const tox = chat.filter((c) => FLAME.test(c.Text || '')).length;
        const wheel = cnt('chat_wheel');
        const items = [];
        if (fb) items.push(['blood', fb.Time, T('first blood')]);
        if (rosh) items.push(['rosh', rosh, T('Roshan')]);
        if (cour) items.push(['courier', cour, T('couriers')]);
        if (reps.length) items.push(['report', reps.length, T('reports')]);
        if (tox) items.push(['flame', tox, T('toxic')]);
        if (wheel) items.push(['wheel', wheel, T('chat wheel')]);
        hlPane.textContent = '';
        if (!items.length) { hlPane.classList.add('hidden'); return; }
        hlPane.classList.remove('hidden');
        const strip = document.createElement('div'); strip.className = 'hl-strip';
        items.forEach(([ic, val, label]) => {
            const chip = document.createElement('span'); chip.className = 'hl-chip ' + ic;
            chip.innerHTML = '<span class="hl-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + (HL_SVG[ic] || '') + '</svg></span>'
                + '<b>' + esc(String(val)) + '</b><small>' + esc(label) + '</small>';
            strip.appendChild(chip);
        });
        hlPane.appendChild(strip);
    }

    const ptEl = document.getElementById('players-table');
    function avatarHTML(cls, hero, name) {
        const letter = esc((String(name || '?').trim().charAt(0) || '?').toUpperCase());
        const iconUrl = (typeof getHeroIconUrl === 'function') ? getHeroIconUrl(hero) : null;
        return '<span class="' + cls + '">' + letter + (iconUrl ? '<img src="' + esc(iconUrl) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</span>';
    }
    function renderPlayersTable(m) {
        if (!ptEl) return;
        const players = (m && (m.players || m.Players)) || [];
        if (!players.length) { ptEl.classList.add('hidden'); ptEl.innerHTML = ''; return; }
        const reports = (m && m.reports) || [], chat = (m && m.chat) || [], wards = (m && m.wards) || [];
        const st = {}; players.forEach((p) => { st[p.Slot] = { recv: 0, made: 0, msgs: 0, tox: 0, wards: 0 }; });
        reports.forEach((r) => { if (st[r.TargetSlot]) st[r.TargetSlot].recv++; if (st[r.Slot]) st[r.Slot].made++; });
        chat.forEach((c) => { const s = st[c.Slot]; if (s) { s.msgs++; if (FLAME.test(c.Text || '')) s.tox++; } });
        wards.forEach((w) => { if (st[w.Slot]) st[w.Slot].wards++; });
        const num = (v, cls) => (v ? '<b class="' + (cls || '') + '">' + v + '</b>' : '<span class="pt-mu">·</span>');
        const rows = (lo, hi) => players.filter((p) => p.Slot >= lo && p.Slot <= hi).sort((a, b) => a.Slot - b.Slot).map((p) => {
            const s = st[p.Slot] || {}, hero = (p.Hero && String(p.Hero).toLowerCase() !== 'unknown') ? p.Hero : '';
            return '<tr><td class="pt-pl">' + avatarHTML('pt-av', hero, who(p))
                + '<span class="pt-who"><b>' + esc(who(p)) + '</b>' + (hero ? '<small>' + esc(hero) + '</small>' : '') + '</span></td>'
                + '<td>' + num(s.recv, 'rd') + '</td><td>' + num(s.made, 'gr') + '</td><td>' + num(s.msgs, '') + '</td><td>' + num(s.tox, 'rd') + '</td><td>' + num(s.wards, 'bl') + '</td></tr>';
        }).join('');
        ptEl.classList.remove('hidden');
        ptEl.innerHTML = '<div class="pt-head">' + esc(T('Players')) + '</div>'
            + '<table class="pt-table"><thead><tr><th>' + esc(T('Player')) + '</th><th>' + esc(T('Got')) + '</th><th>' + esc(T('Sent')) + '</th><th>' + esc(T('Msgs')) + '</th><th>🔥</th><th>' + esc(T('Wards')) + '</th></tr></thead><tbody>'
            + '<tr class="pt-side r"><td colspan="6">' + esc(T('Radiant')) + '</td></tr>' + rows(0, 4)
            + '<tr class="pt-side d"><td colspan="6">' + esc(T('Dire')) + '</td></tr>' + rows(5, 9)
            + '</tbody></table>';
    }
    function current() {
        const list = window.ledgerMatches || [];
        if (!list.length) return null;
        const idx = sel && sel.value !== '' ? Number(sel.value) : 0;
        return list[idx] || list[0];
    }
    function paint() {
        const m = current();
        const has = m && ((m.reports && m.reports.length) || (m.chat && m.chat.length) || (m.events && m.events.length) || (m.wards && m.wards.length));
        sec.classList.toggle('hidden', !has);
        if (!has) return;
        renderHighlights(m); renderChat(m); renderEvents(m); renderWards(m);
        if (sw) {
            const wb = sw.querySelector('[data-m="wards"]'); if (wb) wb.classList.toggle('hidden', !(m.wards && m.wards.length));
            const rb = sw.querySelector('[data-m="reports"]'); if (rb) rb.classList.toggle('hidden', !(m.reports && m.reports.length));
        }
    }
    if (sw) sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        sw.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        const m = b.dataset.m;
        if (repPane) repPane.classList.toggle('hidden', m !== 'reports');
        chatPane.classList.toggle('hidden', m !== 'chat');
        evPane.classList.toggle('hidden', m !== 'events');
        if (wardPane) wardPane.classList.toggle('hidden', m !== 'wards');
    }));
    document.addEventListener('ledger:matches', paint);
    if (sel) { sel.addEventListener('change', paint); new MutationObserver(paint).observe(sel, { childList: true }); }
    document.addEventListener('ledger:lang', paint);
    // OpenDota data (towers/deaths) arrives async — re-render the map when it does
    document.addEventListener('ledger:od', () => { const m = current(); if (m) try { renderWards(m); } catch (e) {} });
})();

/* ---------- Match verdict + report gauge ---------- */
(function matchVerdict() {
    const box = document.getElementById('match-verdict');
    const total = document.getElementById('total-combined-reports');
    const fr = document.getElementById('total-friendly-reports');
    const en = document.getElementById('total-enemy-reports');
    const summary = document.getElementById('report-summary');
    if (!box || !total) return;
    const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
    const arc = document.getElementById('mv-arc');
    const numEl = document.getElementById('mv-count');
    const titleEl = document.getElementById('mv-title');
    const subEl = document.getElementById('mv-sub');
    const labelEl = document.getElementById('mv-count-label');
    const C = 440;
    const verdict = (n) => n === 0 ? T('Clean match') : n <= 2 ? T('Calm match') : n <= 5 ? T('Heated match') : T('Toxic match');
    function render() {
        const visible = summary && summary.style.display !== 'none';
        if (!visible) { box.classList.add('hidden'); return; }
        const n = parseInt(total.textContent, 10) || 0;
        const f = parseInt(fr ? fr.textContent : '0', 10) || 0;
        const e = parseInt(en ? en.textContent : '0', 10) || 0;
        box.classList.remove('hidden');
        if (numEl) numEl.textContent = n;
        if (labelEl) labelEl.textContent = T('reports');
        if (titleEl) titleEl.textContent = verdict(n);
        if (subEl) subEl.textContent = f + ' ' + T('from teammates') + ' · ' + e + ' ' + T('from enemies');
        if (arc) { const frac = Math.min(n / 8, 1); arc.style.transition = 'stroke-dashoffset .9s cubic-bezier(.22,.8,.24,1)'; arc.style.strokeDashoffset = String(C * (1 - frac)); }
        box.classList.toggle('mv-toxic', n >= 6);
        box.classList.toggle('mv-calm', n > 0 && n <= 2);
    }
    new MutationObserver(render).observe(total, { childList: true, characterData: true, subtree: true });
    if (summary) new MutationObserver(render).observe(summary, { attributes: true, attributeFilter: ['style'] });
    document.addEventListener('ledger:lang', render);
    render();
})();

/* ---------- Match stat tiles: duration (from replay) + winner / score / date (OpenDota) ---------- */
(function matchStats() {
    const box = document.getElementById('match-stats');
    const select = document.getElementById('match-selector');
    const meta = document.getElementById('match-meta');
    const results = document.getElementById('results-section');
    const dEl = document.getElementById('ms-duration');
    const wEl = document.getElementById('ms-winner');
    const dateEl = document.getElementById('ms-date');
    const scoreEl = document.getElementById('ms-score');
    if (!box || !dEl) return;
    let lastId = null;
    const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);

    const matchIdNow = () => {
        if (select && select.options.length && select.value !== '') {
            const opt = select.options[select.selectedIndex];
            if (opt) {
                if (opt.dataset && /^\d+$/.test(opt.dataset.matchId || '')) return opt.dataset.matchId;
                const m = /(\d{6,})/.exec(opt.textContent || ''); if (m) return m[1];
            }
        }
        const ms = window.ledgerMatches;
        if (ms && ms.length === 1 && ms[0].matchID) return String(ms[0].matchID);
        return null;
    };
    const fmt = (sec) => { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); };
    const parseT = (t) => { if (!t) return 0; const p = String(t).split(':'); return p.length === 2 ? (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0) : 0; };
    const findMatch = (id) => { const ms = window.ledgerMatches || []; return ms.find((m) => String(m.matchID) === String(id)) || (ms.length === 1 ? ms[0] : null); };
    const durFromReplay = (match) => { if (!match) return 0; let mx = 0; ['events', 'chat', 'reports', 'wards'].forEach((k) => { (match[k] || []).forEach((e) => { const t = parseT(e && e.Time); if (t > mx) mx = t; }); }); return mx; };
    const reset = () => { wEl.textContent = '—'; dateEl.textContent = '—'; scoreEl.textContent = '—'; wEl.parentElement.classList.remove('win', 'lose'); };

    // ---- Match flow graph (gold/xp advantage over time), gold-HUD style ----
    const mfBox = document.getElementById('matchflow');
    const mfCanvas = document.getElementById('mf-canvas');
    const mfNote = document.getElementById('mf-note');
    const mfTip = document.getElementById('mf-tip');
    const mfRanges = document.getElementById('mf-ranges');
    const mfMetricBox = document.getElementById('mf-metric');
    let mfData = null, mfMetric = 'gold', mfRange = 'all', mfGeom = null;
    const cssvar = (n, d) => { try { return (getComputedStyle(document.documentElement).getPropertyValue(n) || '').trim() || d; } catch (_) { return d; } };
    const monoFont = () => cssvar('--font-mono', 'monospace').split(',')[0].replace(/['"]/g, '').trim() || 'monospace';

    function mfSlice(arr) {
        const n = arr.length;
        if (mfRange === 'lane') return { data: arr.slice(0, Math.min(n, 11)), off: 0 };
        if (mfRange === 'mid') { const s = Math.min(n, 10); return { data: arr.slice(s, Math.min(n, 26)), off: s }; }
        if (mfRange === 'late') { const s = Math.max(0, Math.min(n - 1, 25)); return { data: arr.slice(s), off: s }; }
        return { data: arr.slice(), off: 0 };
    }
    function drawMatchflow() {
      try {
        if (!mfBox || !mfCanvas || !mfData) return;
        const full = mfMetric === 'gold' ? mfData.goldAdv : mfData.xpAdv;
        if (!full || !full.length) {
            mfBox.classList.add('mf-empty');
            mfCanvas.style.display = 'none'; if (mfTip) mfTip.classList.add('hidden');
            mfNote.classList.remove('hidden');
            mfNote.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>'
                + '<span>' + T('This match is not parsed on OpenDota yet — the match-flow graph needs a parsed match.') + '</span>'
                + '<button type="button" class="mf-parse-btn" id="mf-parse">' + T('Parse this match') + '</button>';
            return;
        }
        mfBox.classList.remove('mf-empty');
        mfNote.classList.add('hidden'); mfCanvas.style.display = 'block';
        const sl = mfSlice(full), arr = sl.data, off = sl.off, n = arr.length;
        const wrap = mfCanvas.parentElement, W = Math.max(320, wrap.clientWidth), H = 184, dpr = window.devicePixelRatio || 1;
        mfCanvas.width = W * dpr; mfCanvas.height = H * dpr; mfCanvas.style.width = W + 'px'; mfCanvas.style.height = H + 'px';
        const x = mfCanvas.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
        const pad = { l: 46, r: 10, t: 12, b: 22 }, gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
        const teal = cssvar('--radiant', '#40d2a0'), dire = cssvar('--dire', '#ff5d6c'), acc = cssvar('--accent', '#d8b45a');
        const faint = cssvar('--text-tertiary', '#63717c'), grid = cssvar('--cv-grid', '#1a252c');
        // auto-scaled axis: use the data's real range (never forced symmetric), keep 0 in view
        const vmax = Math.max(0, ...arr.map((v) => v || 0)), vmin = Math.min(0, ...arr.map((v) => v || 0));
        const top = vmax > 0 ? vmax * 1.12 : 500;
        const bot = vmin < 0 ? vmin * 1.12 : -Math.max(500, vmax * 0.09);
        const span = (top - bot) || 1;
        const X = (i) => pad.l + (n <= 1 ? gW / 2 : (i / (n - 1)) * gW);
        const Y = (v) => pad.t + (top - v) / span * gH, zY = Y(0);
        mfGeom = { arr, off, n, X, Y, pad, gW, gH, W, H, midY: zY };
        x.clearRect(0, 0, W, H);
        x.font = '600 9px ' + monoFont();
        [top, 0, bot].forEach((v) => {
            const yy = Y(v);
            x.strokeStyle = v === 0 ? 'rgba(216,180,90,.42)' : grid; x.lineWidth = v === 0 ? 1.4 : 1;
            x.beginPath(); x.moveTo(pad.l, yy); x.lineTo(W - pad.r, yy); x.stroke();
            x.fillStyle = v === 0 ? acc : faint; x.textAlign = 'right';
            const k = Math.round(v / 1000); x.fillText((k > 0 ? '+' : '') + k + 'k', pad.l - 7, yy + 3);
        });
        // diverging area clipped to the curve, gradient hinged at the zero line
        const zFrac = Math.max(0.001, Math.min(0.999, (top - 0) / span));
        x.save();
        x.beginPath(); x.moveTo(X(0), zY);
        for (let i = 0; i < n; i++) x.lineTo(X(i), Y(arr[i] || 0));
        x.lineTo(X(n - 1), zY); x.closePath(); x.clip();
        const g = x.createLinearGradient(0, pad.t, 0, pad.t + gH);
        g.addColorStop(0, teal + '5e'); g.addColorStop(Math.max(0, zFrac - 0.002), teal + '12');
        g.addColorStop(zFrac, 'rgba(0,0,0,0)');
        g.addColorStop(Math.min(1, zFrac + 0.002), dire + '12'); g.addColorStop(1, dire + '5e');
        x.fillStyle = g; x.fillRect(pad.l, pad.t, gW, gH);
        x.restore();
        // line, colored by which side of zero each segment sits
        x.lineWidth = 2; x.lineJoin = 'round';
        for (let i = 1; i < n; i++) {
            x.strokeStyle = ((arr[i - 1] || 0) + (arr[i] || 0)) / 2 >= 0 ? teal : dire;
            x.beginPath(); x.moveTo(X(i - 1), Y(arr[i - 1] || 0)); x.lineTo(X(i), Y(arr[i] || 0)); x.stroke();
        }
        // x labels (minutes)
        x.fillStyle = faint; x.textAlign = 'center'; x.font = '600 9px ' + monoFont();
        const step = n > 35 ? 10 : n > 15 ? 5 : 2;
        for (let i = 0; i < n; i += step) x.fillText((off + i) + ':00', X(i), H - 7);
        if (n > 1 && ((n - 1) % step) !== 0) { x.textAlign = 'right'; x.fillText((off + n - 1) + ':00', W - pad.r, H - 7); x.textAlign = 'center'; }
        // event markers on the line: first blood, Roshan kills, reports (only when the whole match is shown)
        if (mfRange === 'all' && mfData.markers && mfData.markers.length) {
            mfData.markers.forEach((mk) => {
                if (mk.min < off || mk.min > off + n - 1) return;
                const i = Math.max(0, Math.min(n - 1, Math.round(mk.min - off)));
                const px = X(i), py = Y(arr[i] || 0);
                x.strokeStyle = mk.col + '66'; x.lineWidth = 1; x.setLineDash([2, 3]);
                x.beginPath(); x.moveTo(px, pad.t); x.lineTo(px, H - pad.b); x.stroke(); x.setLineDash([]);
                x.fillStyle = cssvar('--cv-bg', '#0e141a'); x.beginPath(); x.arc(px, py, 6.5, 0, 7); x.fill();
                x.strokeStyle = mk.col; x.lineWidth = 1.5; x.stroke(); x.lineWidth = 2;
                x.fillStyle = mk.col; x.textAlign = 'center'; x.font = '800 7px ' + (cssvar('--font-ui', 'sans-serif').split(',')[0]);
                x.fillText(mk.label, px, py + 2.4);
            });
        }
      } catch (err) { if (window.LEDGER_DEBUG) console.error('[matchflow]', err); }
    }
    function mfBuildMarkers() {
        const m = findMatch(matchIdNow()); if (!m) return [];
        const acc = cssvar('--accent', '#d8b45a'), dire = cssvar('--dire', '#ff5d6c'), aeg = cssvar('--aegis', '#f2c46d');
        const out = [];
        (m.events || []).forEach((e) => {
            const t = String(e.Type || '').toLowerCase();
            if (t === 'firstblood') out.push({ min: parseT(e.Time) / 60, label: 'FB', col: dire });
            else if (t === 'roshan') out.push({ min: parseT(e.Time) / 60, label: 'R', col: aeg });
        });
        (m.reports || []).forEach((r) => out.push({ min: parseT(r.Time) / 60, label: '!', col: dire }));
        return out.sort((a, b) => a.min - b.min).slice(0, 16);
    }
    function mfShow(j) {
        mfData = { goldAdv: j && j.goldAdv, xpAdv: j && j.xpAdv, markers: mfBuildMarkers() };
        if (!mfBox) return;
        const any = (mfData.goldAdv && mfData.goldAdv.length) || (mfData.xpAdv && mfData.xpAdv.length);
        // show the block if parsed; if not parsed, still show with the note so the user knows why
        mfBox.classList.remove('hidden');
        if (!any) { mfData = { goldAdv: null, xpAdv: null }; }
        drawMatchflow();
    }
    function mfHide() { if (mfBox) mfBox.classList.add('hidden'); mfData = null; }
    if (mfRanges) mfRanges.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-r]'); if (!b) return;
        mfRange = b.dataset.r; mfRanges.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); drawMatchflow();
    });
    if (mfMetricBox) mfMetricBox.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-k]'); if (!b) return;
        mfMetric = b.dataset.k; mfMetricBox.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); drawMatchflow();
    });
    if (mfCanvas && mfTip) {
        mfCanvas.addEventListener('mousemove', (e) => {
            if (!mfGeom) return;
            const r = mfCanvas.getBoundingClientRect(), gx = e.clientX - r.left;
            const { arr, off, n, X, Y, pad, gW } = mfGeom;
            if (gx < pad.l || gx > pad.l + gW) { mfTip.classList.add('hidden'); return; }
            let i = Math.round(((gx - pad.l) / gW) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
            const v = arr[i] || 0, k = (v / 1000);
            mfTip.classList.remove('hidden');
            mfTip.innerHTML = '<b>' + (off + i) + ':00</b> ' + (v >= 0 ? T('Radiant') : T('Dire')) + ' ' + (v >= 0 ? '+' : '') + (Math.round(k * 10) / 10) + 'k';
            mfTip.style.left = Math.min(r.width - 120, Math.max(0, X(i))) + 'px';
            mfTip.style.top = Math.max(0, Y(v) - 34) + 'px';
        });
        mfCanvas.addEventListener('mouseleave', () => mfTip.classList.add('hidden'));
    }
    let mfRz; window.addEventListener('resize', () => { clearTimeout(mfRz); mfRz = setTimeout(() => { if (mfData) drawMatchflow(); }, 150); });
    const mfCollapse = document.getElementById('mf-collapse');
    if (mfCollapse && mfBox) {
        try { if (localStorage.getItem('mfCollapsed') === '1') mfBox.classList.add('mf-collapsed'); } catch (e) {}
        mfCollapse.addEventListener('click', () => {
            const c = mfBox.classList.toggle('mf-collapsed');
            try { localStorage.setItem('mfCollapsed', c ? '1' : '0'); } catch (e) {}
            if (!c && mfData) drawMatchflow();
        });
    }

    // Request an OpenDota parse for the current match, then poll and refresh the graph.
    let mfParsing = false;
    function mfSetParse(msg, btnLabel, busy) {
        if (!mfNote) return;
        const span = mfNote.querySelector('span'); if (span && msg != null) span.textContent = msg;
        const btn = mfNote.querySelector('#mf-parse');
        if (btn) { btn.disabled = !!busy; btn.classList.toggle('busy', !!busy); if (btnLabel != null) btn.textContent = btnLabel; }
    }
    async function mfRequestParse() {
        const id = matchIdNow(); if (!id || mfParsing) return;
        mfParsing = true;
        mfSetParse(T('Requesting a parse from OpenDota…'), T('Parsing…'), true);
        try {
            const r = await fetch('/_ledger/od/parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: id }) })
                .then((x) => x.ok ? x.json() : null);
            if (!r || (r.jobId == null && !r.done)) throw new Error('no job');
            mfSetParse(T('Parsing… this usually takes a minute or two.'), null, true);
            let tries = 0;
            const finish = async () => {
                const j = await fetch('/_ledger/od/match?id=' + encodeURIComponent(id), { cache: 'no-store' }).then((x) => x.ok ? x.json() : null).catch(() => null);
                mfParsing = false;
                if (matchIdNow() !== id) return;
                if (j && j.goldAdv && j.goldAdv.length) { mfShow(j); }
                else mfSetParse(T('Parsed, but the graph data is not ready yet — try again in a minute.'), T('Try again'), false);
            };
            if (r.done) { await finish(); return; }
            const poll = async () => {
                if (matchIdNow() !== id) { mfParsing = false; return; }
                tries++;
                const s = await fetch('/_ledger/od/parsejob?id=' + encodeURIComponent(r.jobId)).then((x) => x.ok ? x.json() : null).catch(() => null);
                if (s && s.done) return finish();
                if (tries >= 40) { mfParsing = false; mfSetParse(T('Parsing is taking a while. Try again later.'), T('Try again'), false); return; }
                setTimeout(poll, 5000);
            };
            setTimeout(poll, 5000);
        } catch (_) {
            mfParsing = false;
            mfSetParse(T('Could not request a parse right now. Try again later.'), T('Try again'), false);
        }
    }
    if (mfNote) mfNote.addEventListener('click', (e) => { if (e.target.closest('#mf-parse')) mfRequestParse(); });

    function render() {
        const id = matchIdNow();
        const hidden = !id || (results && results.classList.contains('hidden'));
        if (hidden) { box.classList.add('hidden'); mfHide(); lastId = null; return; }
        if (id === lastId) return;
        lastId = id; reset(); mfHide();
        const dur = durFromReplay(findMatch(id));
        dEl.textContent = dur > 0 ? fmt(dur) : '—';
        box.classList.remove('hidden');
        fetch('/_ledger/od/match?id=' + encodeURIComponent(id), { cache: 'no-store' })
            .then((r) => r.ok ? r.json() : null)
            .then((j) => {
                if (!j || matchIdNow() !== id) return;
                if (j.duration) dEl.textContent = fmt(j.duration);
                if (typeof j.radiantWin === 'boolean') {
                    wEl.textContent = j.radiantWin ? 'Radiant' : 'Dire';
                    wEl.parentElement.classList.toggle('win', j.radiantWin);
                    wEl.parentElement.classList.toggle('lose', !j.radiantWin);
                }
                if (j.radiantScore != null && j.direScore != null) scoreEl.textContent = j.radiantScore + ' — ' + j.direScore;
                if (j.startTime) { try { dateEl.textContent = new Date(j.startTime * 1000).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }); } catch (_) {} }
                mfShow(j);
                window.ledgerOD = { matchId: id, duration: j.duration, objectives: j.objectives || null, deaths: j.deaths || null };
                try { document.dispatchEvent(new CustomEvent('ledger:od')); } catch (_) {}
            }).catch(() => {});
    }

    if (select) select.addEventListener('change', render);
    if (meta) new MutationObserver(render).observe(meta, { childList: true });
    if (results) new MutationObserver(render).observe(results, { attributes: true, attributeFilter: ['class'] });
    render();
})();

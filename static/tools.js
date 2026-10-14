// DotaTraker tools: draft helper, personal coach, smurf check. All data via the gate's OpenDota proxy.
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const T = (x) => (window.LedgerI18n ? window.LedgerI18n.t(x) : x);
    const UI = window.LedgerUI;
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    const heroImg = (short) => '/_ledger/od/heroimg?h=' + encodeURIComponent(short || '');

    async function api(path) {
        const r = await fetch(path, { credentials: 'same-origin', cache: 'no-store' });
        if (r.status === 401) { location.href = '/login'; throw new Error('signin'); }
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
        return j;
    }

    let heroes = null, heroById = {};
    async function ensureHeroes() {
        if (heroes) return heroes;
        const j = await api('/_ledger/od/heroes');
        heroes = (j.heroes || []).sort((a, b) => a.localized.localeCompare(b.localized));
        heroById = {}; heroes.forEach((h) => { heroById[h.id] = h; });
        return heroes;
    }
    function heroPortrait(h, cls) {
        const img = document.createElement('img');
        img.className = cls || 'hero-por'; img.alt = ''; img.loading = 'lazy';
        if (h && h.short) { img.src = heroImg(h.short); img.onerror = () => { img.style.visibility = 'hidden'; }; }
        return img;
    }

    /* ---------- tool switcher ---------- */
    const sw = document.querySelector('.tools-switch');
    if (sw) sw.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        sw.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        const t = b.dataset.tool;
        document.querySelectorAll('.tool-panel').forEach((p) => p.classList.add('hidden'));
        const panel = $('tool-' + t); if (panel) panel.classList.remove('hidden');
        if (t === 'draft') initDraft();
    }));
    // warm up heroes when the Tools tab is first opened
    const toolsTabBtn = document.querySelector('.workflow-tab[data-tab="tools"]');
    if (toolsTabBtn) toolsTabBtn.addEventListener('click', () => initDraft());

    /* ========================= DRAFT HELPER ========================= */
    let draftInited = false, enemies = [], draftBusy = false;
    async function initDraft() {
        if (draftInited) return; draftInited = true;
        try { await ensureHeroes(); $('draft-q').disabled = false; }
        catch (_) { $('draft-hint').textContent = T('Cannot reach OpenDota. Check your internet connection.'); }
    }
    function renderChips() {
        const host = $('draft-chips'); host.textContent = '';
        enemies.forEach((h) => {
            const chip = document.createElement('span'); chip.className = 'draft-chip';
            chip.appendChild(heroPortrait(h, 'dc-por'));
            const n = document.createElement('b'); n.textContent = h.localized; chip.appendChild(n);
            const x = document.createElement('button'); x.type = 'button'; x.className = 'dc-x'; x.setAttribute('aria-label', 'Remove'); x.textContent = '×';
            x.addEventListener('click', () => { enemies = enemies.filter((e) => e.id !== h.id); renderChips(); runDraft(); });
            chip.appendChild(x); host.appendChild(chip);
        });
        $('draft-q').placeholder = enemies.length >= 5 ? T('Up to 5 heroes') : T('Add an enemy hero…');
    }
    function closePop() { $('draft-pop').classList.add('hidden'); $('draft-pop').textContent = ''; }
    function openPop(q) {
        const pop = $('draft-pop'); pop.textContent = '';
        const picked = new Set(enemies.map((e) => e.id));
        const ql = q.toLowerCase();
        const list = heroes.filter((h) => !picked.has(h.id) && h.localized.toLowerCase().includes(ql)).slice(0, 8);
        if (!list.length) { closePop(); return; }
        list.forEach((h, i) => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'dp-opt' + (i === 0 ? ' on' : '');
            b.appendChild(heroPortrait(h, 'dp-por'));
            const n = document.createElement('span'); n.textContent = h.localized; b.appendChild(n);
            b.addEventListener('click', () => addEnemy(h));
            pop.appendChild(b);
        });
        pop.classList.remove('hidden');
    }
    function addEnemy(h) {
        if (enemies.length >= 5 || enemies.some((e) => e.id === h.id)) return;
        enemies.push(h); $('draft-q').value = ''; closePop(); renderChips(); runDraft();
    }
    const dq = $('draft-q');
    if (dq) {
        dq.disabled = true;
        dq.addEventListener('input', () => { const v = dq.value.trim(); if (v) openPop(v); else closePop(); });
        dq.addEventListener('keydown', (e) => {
            const pop = $('draft-pop'); if (pop.classList.contains('hidden')) return;
            const opts = [...pop.querySelectorAll('.dp-opt')]; let i = opts.findIndex((o) => o.classList.contains('on'));
            if (e.key === 'ArrowDown') { e.preventDefault(); i = Math.min(opts.length - 1, i + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); i = Math.max(0, i - 1); }
            else if (e.key === 'Enter') { e.preventDefault(); if (opts[i]) opts[i].click(); return; }
            else if (e.key === 'Escape') { closePop(); return; }
            else return;
            opts.forEach((o, k) => o.classList.toggle('on', k === i));
        });
        document.addEventListener('click', (e) => { if (!e.target.closest('.draft-field')) closePop(); });
    }
    async function runDraft() {
        const out = $('draft-out');
        if (!enemies.length) { out.textContent = ''; return; }
        if (draftBusy) return; draftBusy = true;
        out.innerHTML = '<div class="tool-loading"><i></i><i></i><i></i></div>';
        try {
            const agg = {};
            for (const e of enemies) {
                const { matchups } = await api('/_ledger/od/matchups?hero=' + e.id);
                for (const row of matchups) {
                    if (!row || row.games_played < 100) continue;      // enough games to be meaningful
                    const o = row.hero_id, oWins = row.games_played - row.wins;  // the counter's wins vs this enemy
                    (agg[o] = agg[o] || { w: 0, g: 0, cnt: 0 });
                    agg[o].w += oWins; agg[o].g += row.games_played; agg[o].cnt++;
                }
            }
            const enemyIds = new Set(enemies.map((e) => e.id));
            const ranked = Object.entries(agg)
                .filter(([o, v]) => v.cnt === enemies.length && !enemyIds.has(Number(o)) && v.g > 0)
                .map(([o, v]) => ({ h: heroById[Number(o)], wr: (v.w / v.g) * 100, g: v.g }))
                .filter((r) => r.h)
                .sort((a, b) => b.wr - a.wr).slice(0, 12);
            out.textContent = '';
            if (!ranked.length) { out.innerHTML = '<p class="hint">' + T('No data for this combination.') + '</p>'; return; }
            const head = document.createElement('div'); head.className = 'draft-out-head';
            head.textContent = T('Best picks against their draft'); out.appendChild(head);
            const grid = document.createElement('div'); grid.className = 'draft-grid';
            ranked.forEach((r, i) => {
                const adv = r.wr - 50;
                const card = document.createElement('div'); card.className = 'draft-pick'; card.style.setProperty('--i', String(i));
                card.appendChild(heroPortrait(r.h, 'dpk-por'));
                const info = document.createElement('div'); info.className = 'dpk-info';
                const nm = document.createElement('b'); nm.textContent = r.h.localized;
                const bar = document.createElement('div'); bar.className = 'dpk-bar';
                const fill = document.createElement('i'); fill.style.width = Math.min(100, Math.max(0, (r.wr - 40) * 5)) + '%';
                bar.appendChild(fill);
                info.append(nm, bar); card.appendChild(info);
                const pct = document.createElement('span'); pct.className = 'dpk-wr' + (adv >= 0 ? ' good' : ' bad');
                pct.textContent = (adv >= 0 ? '+' : '') + adv.toFixed(1) + '%';
                card.appendChild(pct);
                grid.appendChild(card);
            });
            out.appendChild(grid);
            const foot = document.createElement('p'); foot.className = 'hint draft-foot';
            foot.textContent = T('Advantage = win rate of this hero against the enemies you picked, above 50%.');
            out.appendChild(foot);
        } catch (e) {
            out.innerHTML = '<p class="inline-error">' + esc(e.message === 'signin' ? '' : T('Cannot reach OpenDota. Check your internet connection.')) + '</p>';
        } finally { draftBusy = false; }
    }

    /* ========================= PERSONAL COACH ========================= */
    const RANKS = ['Uncalibrated', 'Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'];
    function rankName(tier, lb) {
        if (!tier) return T('Unranked');
        const medal = Math.floor(tier / 10), star = tier % 10;
        if (medal >= 8) return 'Immortal' + (lb ? ' #' + lb : '');
        return (RANKS[medal] || 'Unranked') + (star ? ' ' + star : '');
    }
    function statTile(label, value, cls) {
        const t = document.createElement('div'); t.className = 'tool-stat' + (cls ? ' ' + cls : '');
        const b = document.createElement('b'); b.textContent = value;
        const s = document.createElement('span'); s.textContent = T(label);
        t.append(b, s); return t;
    }
    function coachRender(p) {
        const out = $('coach-out'); out.textContent = ''; out.classList.remove('hidden'); $('coach-empty').classList.add('hidden');
        const head = document.createElement('div'); head.className = 'tool-player';
        const name = document.createElement('div'); name.className = 'tp-name';
        const nb = document.createElement('b'); nb.textContent = p.name;
        const nr = document.createElement('span'); nr.textContent = rankName(p.rankTier, p.leaderboard) + (p.totalGames ? ' · ' + p.totalGames + ' ' + T('games') : '');
        name.append(nb, nr); head.appendChild(name); out.appendChild(head);

        const a = p.avg || {};
        const stats = document.createElement('div'); stats.className = 'tool-stats';
        stats.append(
            statTile('Win rate (recent)', (a.recentWR != null ? a.recentWR : '—') + '%', a.recentWR >= 50 ? 'ok' : 'bad'),
            statTile('KDA', a.kda != null ? a.kda : '—'),
            statTile('GPM', a.gpm || '—'),
            statTile('XPM', a.xpm || '—'),
            statTile('Last hits / game', a.lh || '—'),
            statTile('Overall win rate', (p.winRate != null ? p.winRate : '—') + '%', p.winRate >= 50 ? 'ok' : 'bad')
        );
        out.appendChild(stats);
        if (a.n) { const note = document.createElement('p'); note.className = 'hint'; note.textContent = T('Averages over your last') + ' ' + a.n + ' ' + T('public matches') + '.'; out.appendChild(note); }

        if (p.topHeroes && p.topHeroes.length) {
            const h = document.createElement('h3'); h.className = 'tool-h'; h.textContent = T('Most played lately'); out.appendChild(h);
            const row = document.createElement('div'); row.className = 'coach-heroes';
            p.topHeroes.forEach((th) => {
                const hero = heroById[th.heroId];
                const cell = document.createElement('div'); cell.className = 'coach-hero';
                cell.appendChild(heroPortrait(hero, 'ch-por'));
                const n = document.createElement('b'); n.textContent = hero ? hero.localized : th.hero;
                const g = document.createElement('span'); g.textContent = th.games + ' ' + T('games');
                cell.append(n, g); row.appendChild(cell);
            });
            out.appendChild(row);
        }
        if (p.recent && p.recent.length) {
            const h = document.createElement('h3'); h.className = 'tool-h'; h.textContent = T('Recent matches'); out.appendChild(h);
            const list = document.createElement('div'); list.className = 'coach-matches';
            p.recent.slice(0, 10).forEach((m) => {
                const hero = heroById[m.heroId];
                const r = document.createElement('div'); r.className = 'coach-match ' + (m.win ? 'win' : 'loss');
                r.appendChild(heroPortrait(hero, 'cm-por'));
                const res = document.createElement('span'); res.className = 'cm-res'; res.textContent = m.win ? T('Win') : T('Loss');
                const kda = document.createElement('span'); kda.className = 'cm-kda'; kda.textContent = m.k + '/' + m.d + '/' + m.a;
                const gpm = document.createElement('span'); gpm.className = 'cm-gpm'; gpm.textContent = m.gpm + ' ' + T('GPM');
                r.append(res, kda, gpm); list.appendChild(r);
            });
            out.appendChild(list);
        }
    }
    const coachForm = $('coach-form');
    if (coachForm) coachForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = $('coach-id').value.trim(); if (!id) return;
        const btn = coachForm.querySelector('button'); btn.classList.add('loading-btn'); $('coach-msg').textContent = '';
        try { await ensureHeroes().catch(() => {}); const p = await api('/_ledger/od/profile?id=' + encodeURIComponent(id)); coachRender(p); }
        catch (err) { if (err.message !== 'signin') { $('coach-msg').textContent = err.message === 'That does not look like a Steam ID.' ? T('That does not look like a Steam ID.') : T('Could not load this player. The profile may be private (Dota 2 → Settings → Expose Public Match Data).'); } }
        finally { btn.classList.remove('loading-btn'); }
    });

    /* ========================= SMURF CHECK ========================= */
    function smurfScore(p) {
        let score = 0; const reasons = [];
        const a = p.avg || {}, wr = p.winRate, rwr = a.recentWR, games = p.totalGames;
        if (rwr >= 70) { score += 40; reasons.push(['bad', T('Very high recent win rate') + ' (' + rwr + '%)']); }
        else if (rwr >= 60) { score += 25; reasons.push(['warn', T('High recent win rate') + ' (' + rwr + '%)']); }
        else if (rwr <= 45) { reasons.push(['ok', T('Normal recent win rate') + ' (' + rwr + '%)']); }
        if (games && games < 300) { score += 25; reasons.push(['warn', T('Few games on the account') + ' (' + games + ')']); }
        else if (games >= 2000) { reasons.push(['ok', T('Lots of games') + ' (' + games + ')']); }
        if (wr != null && wr >= 60 && games && games < 800) { score += 20; reasons.push(['bad', T('High overall win rate on a young account')]); }
        const medal = p.rankTier ? Math.floor(p.rankTier / 10) : 0;
        if (medal >= 6 && games && games < 500) { score += 15; reasons.push(['warn', T('High rank with few games')]); }
        if (a.gpm >= 650 || a.lh >= 320) { score += 10; reasons.push(['warn', T('Farming numbers above the bracket')]); }
        score = Math.max(0, Math.min(100, score));
        return { score, reasons };
    }
    function smurfRender(p) {
        const out = $('smurf-out'); out.textContent = ''; out.classList.remove('hidden'); $('smurf-empty').classList.add('hidden');
        const { score, reasons } = smurfScore(p);
        const verdict = score >= 65 ? ['bad', T('Likely a smurf')] : score >= 35 ? ['warn', T('Maybe a smurf')] : ['ok', T('Looks like a normal account')];

        const head = document.createElement('div'); head.className = 'smurf-head';
        const gauge = document.createElement('div'); gauge.className = 'smurf-gauge ' + verdict[0]; gauge.style.setProperty('--p', String(score));
        const num = document.createElement('b'); num.textContent = score; const pc = document.createElement('i'); pc.textContent = '%';
        gauge.append(num, pc);
        const vt = document.createElement('div'); vt.className = 'smurf-verdict';
        const vb = document.createElement('b'); vb.className = 'sv-' + verdict[0]; vb.textContent = verdict[1];
        const vn = document.createElement('span'); vn.textContent = p.name + ' · ' + rankName(p.rankTier, p.leaderboard) + (p.totalGames ? ' · ' + p.totalGames + ' ' + T('games') : '');
        vt.append(vb, vn); head.append(gauge, vt); out.appendChild(head);

        const ul = document.createElement('ul'); ul.className = 'smurf-reasons';
        reasons.forEach(([cls, text]) => { const li = document.createElement('li'); li.className = cls; const i = document.createElement('i'); const s = document.createElement('span'); s.textContent = text; li.append(i, s); ul.appendChild(li); });
        out.appendChild(ul);
        const foot = document.createElement('p'); foot.className = 'hint'; foot.textContent = T('This is an estimate from public stats, not proof. Private profiles cannot be checked.');
        out.appendChild(foot);
    }
    const smurfForm = $('smurf-form');
    if (smurfForm) smurfForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = $('smurf-id').value.trim(); if (!id) return;
        const btn = smurfForm.querySelector('button'); btn.classList.add('loading-btn'); $('smurf-msg').textContent = '';
        try { const p = await api('/_ledger/od/profile?id=' + encodeURIComponent(id)); smurfRender(p); }
        catch (err) { if (err.message !== 'signin') { $('smurf-msg').textContent = err.message === 'That does not look like a Steam ID.' ? T('That does not look like a Steam ID.') : T('Could not load this player. The profile may be private (Dota 2 → Settings → Expose Public Match Data).'); } }
        finally { btn.classList.remove('loading-btn'); }
    });

    // prefill Steam ID from the signed-in Steam account
    fetch('/_ledger/me', { credentials: 'same-origin', cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((me) => {
        if (me && me.steam && me.steam.id) { const c = $('coach-id'); if (c && !c.value) c.value = me.steam.id; }
    }).catch(() => {});
})();

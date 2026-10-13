// Ledger key server: a Cloudflare Worker with a D1 (SQLite) database.
//
//   Ledger on a player's PC  ──►  POST /v1/activate  (key + device id)  ──►  D1
//                            ──►  POST /v1/check     (token, every ~10 min)
//
// You (the owner) open /admin, sign in with ADMIN_PASSWORD and issue keys.
// Keys are stored only as SHA-256 digests: a database leak does not reveal them.

const DAY = 86400000;
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // no I L O U 0 1: nothing to misread
const ADMIN_COOKIE = 'lk_admin';
const ADMIN_TTL = 7 * DAY;
const SEEN_THROTTLE = 5 * 60000;

const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS keys (
        id TEXT PRIMARY KEY,
        digest TEXT NOT NULL UNIQUE,
        tail TEXT NOT NULL,
        label TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        duration_days INTEGER NOT NULL DEFAULT 30,
        max_devices INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        activated_at INTEGER,
        expires_at INTEGER,
        revoked INTEGER NOT NULL DEFAULT 0,
        last_seen_at INTEGER,
        activations INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        key_id TEXT NOT NULL,
        device_hash TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT '',
        app TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL,
        UNIQUE (key_id, device_hash)
    )`,
    `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        t INTEGER NOT NULL,
        type TEXT NOT NULL,
        key_id TEXT,
        label TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        country TEXT NOT NULL DEFAULT '',
        detail TEXT NOT NULL DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        ip TEXT NOT NULL DEFAULT ''
    )`,
    'CREATE INDEX IF NOT EXISTS devices_key ON devices (key_id)',
    'CREATE INDEX IF NOT EXISTS events_t ON events (t)',
    'CREATE INDEX IF NOT EXISTS events_ip ON events (ip, type, t)'
];

/* ------------------------------------------------------------------ helpers */

const now = () => Date.now();
const enc = new TextEncoder();

async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomHex(bytes) {
    const a = crypto.getRandomValues(new Uint8Array(bytes));
    return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomToken() {
    const a = crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function newKey() {
    // 16 symbols out of 30 ≈ 78 bits. Rejection sampling keeps it unbiased (240 = 30 * 8).
    const out = [];
    while (out.length < 16) {
        for (const b of crypto.getRandomValues(new Uint8Array(32))) {
            if (b < 240) out.push(ALPHABET[b % 30]);
            if (out.length === 16) break;
        }
    }
    const s = out.join('');
    return `LDG-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}`;
}
const normalizeKey = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LDG/, '');
const keyDigest = (plain) => sha256('ledger-key:' + normalizeKey(plain));

function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

const SEC_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Cache-Control': 'no-store'
};
function json(obj, status = 200, extra = {}) {
    return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SEC_HEADERS, ...extra } });
}
async function body(req, limit = 8192) {
    const text = await req.text();
    if (text.length > limit) throw new HttpError(413, 'Request too large');
    if (!text) return {};
    try { return JSON.parse(text); } catch (_) { throw new HttpError(400, 'Bad JSON'); }
}
class HttpError extends Error { constructor(status, message, code) { super(message); this.status = status; this.code = code; } }

function cookies(req) {
    const out = {};
    (req.headers.get('Cookie') || '').split(';').forEach((p) => {
        const i = p.indexOf('=');
        if (i > 0) out[p.slice(0, i).trim()] = p.slice(i + 1).trim();
    });
    return out;
}
const clientIp = (req) => req.headers.get('CF-Connecting-IP') || req.headers.get('X-Real-IP') || '';
const country = (req) => (req.cf && req.cf.country) || '';
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

let schemaReady = null;
function ensureSchema(env) {
    if (!schemaReady) schemaReady = env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s))).catch((e) => { schemaReady = null; throw e; });
    return schemaReady;
}

async function logEvent(env, req, type, extra = {}) {
    await env.DB.prepare('INSERT INTO events (t, type, key_id, label, ip, country, detail) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(now(), type, extra.keyId || null, clip(extra.label, 80), req ? clientIp(req) : '', req ? country(req) : '', clip(extra.detail, 200))
        .run();
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM events WHERE t < ?').bind(now() - 120 * DAY).run();
}
async function tooMany(env, req, type, max, windowMs) {
    const ip = clientIp(req);
    if (!ip) return false;
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM events WHERE ip = ? AND type = ? AND t > ?').bind(ip, type, now() - windowMs).first();
    return (row && row.n) >= max;
}

function keyStatus(k, t = now()) {
    if (k.revoked) return 'revoked';
    if (k.expires_at && k.expires_at <= t) return 'expired';
    if (!k.activated_at) return 'unused';
    return 'active';
}
function licenseView(k, devices) {
    return {
        label: k.label, tail: k.tail, status: keyStatus(k),
        activatedAt: k.activated_at, expiresAt: k.expires_at, durationDays: k.duration_days,
        maxDevices: k.max_devices, devices
    };
}
function adminKeyView(k) {
    return {
        id: k.id, label: k.label, note: k.note, tail: k.tail, status: keyStatus(k),
        createdAt: k.created_at, activatedAt: k.activated_at, expiresAt: k.expires_at,
        durationDays: k.duration_days, maxDevices: k.max_devices, devices: k.device_count || 0,
        lastSeenAt: k.last_seen_at, activations: k.activations
    };
}

const DENY = {
    revoked: 'This key was revoked.',
    expired: 'This key has expired.',
    devices: 'This key is already used on another computer.',
    invalid: 'Invalid key',
    unknown: 'This computer is no longer signed in with that key.'
};

/* ---------------------------------------------------------- public API (/v1) */

async function activate(req, env) {
    if (await tooMany(env, req, 'activate_fail', 12, 15 * 60000)) {
        return json({ error: 'Too many attempts. Try again in 15 min.', code: 'locked' }, 429, { 'Retry-After': '900' });
    }
    const b = await body(req);
    const raw = clip(b.key, 80);
    const device = String(b.device || '');
    if (!/^[a-f0-9]{32,128}$/.test(device)) throw new HttpError(400, 'Bad device id');
    if (normalizeKey(raw).length !== 16) {
        await logEvent(env, req, 'activate_fail', { detail: 'malformed' });
        return json({ error: DENY.invalid, code: 'invalid' }, 401);
    }
    const k = await env.DB.prepare('SELECT * FROM keys WHERE digest = ?').bind(await keyDigest(raw)).first();
    if (!k) {
        await logEvent(env, req, 'activate_fail', { detail: '…' + normalizeKey(raw).slice(-4) });
        return json({ error: DENY.invalid, code: 'invalid' }, 401);
    }
    const status = keyStatus(k);
    if (status === 'revoked' || status === 'expired') {
        await logEvent(env, req, 'activate_denied', { keyId: k.id, label: k.label, detail: status });
        return json({ error: DENY[status], code: status }, 403);
    }

    const t = now();
    const deviceHash = await sha256('ledger-device:' + device);
    const token = randomToken();
    const tokenHash = await sha256('ledger-token:' + token);
    const name = clip(b.name, 60), app = clip(b.app, 40), ip = clientIp(req), cc = country(req);

    const existing = await env.DB.prepare('SELECT id FROM devices WHERE key_id = ? AND device_hash = ?').bind(k.id, deviceHash).first();
    if (existing) {
        await env.DB.prepare('UPDATE devices SET token_hash = ?, name = ?, app = ?, ip = ?, country = ?, last_seen_at = ? WHERE id = ?')
            .bind(tokenHash, name, app, ip, cc, t, existing.id).run();
    } else {
        const used = await env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE key_id = ?').bind(k.id).first();
        if ((used && used.n) >= k.max_devices) {
            await logEvent(env, req, 'activate_denied', { keyId: k.id, label: k.label, detail: 'devices' });
            return json({ error: DENY.devices, code: 'devices', maxDevices: k.max_devices }, 403);
        }
        await env.DB.prepare('INSERT INTO devices (id, key_id, device_hash, token_hash, name, ip, country, app, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(randomHex(8), k.id, deviceHash, tokenHash, name, ip, cc, app, t, t).run();
    }

    if (!k.activated_at) {
        k.activated_at = t;
        k.expires_at = k.duration_days > 0 ? t + k.duration_days * DAY : null;
    }
    k.activations = (k.activations || 0) + 1;
    k.last_seen_at = t;
    await env.DB.prepare('UPDATE keys SET activated_at = ?, expires_at = ?, activations = ?, last_seen_at = ? WHERE id = ?')
        .bind(k.activated_at, k.expires_at, k.activations, t, k.id).run();
    const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE key_id = ?').bind(k.id).first();
    await logEvent(env, req, 'activate', { keyId: k.id, label: k.label, detail: name });
    return json({ ok: true, token, license: licenseView(k, count ? count.n : 1) });
}

async function check(req, env) {
    const b = await body(req);
    const token = String(b.token || ''), device = String(b.device || '');
    if (!token || !/^[a-f0-9]{32,128}$/.test(device)) throw new HttpError(400, 'Bad request');
    const row = await env.DB.prepare(
        `SELECT d.id AS device_id, d.device_hash, d.last_seen_at AS device_seen, k.*,
                (SELECT COUNT(*) FROM devices x WHERE x.key_id = k.id) AS device_count
         FROM devices d JOIN keys k ON k.id = d.key_id WHERE d.token_hash = ?`
    ).bind(await sha256('ledger-token:' + token)).first();
    if (!row || !safeEqual(row.device_hash, await sha256('ledger-device:' + device))) {
        return json({ error: DENY.unknown, code: 'unknown' }, 401);
    }
    const status = keyStatus(row);
    if (status === 'revoked' || status === 'expired') {
        return json({ error: DENY[status], code: status, license: licenseView(row, row.device_count) }, 403);
    }
    const t = now();
    if (t - (row.device_seen || 0) > SEEN_THROTTLE) {
        await env.DB.batch([
            env.DB.prepare('UPDATE devices SET last_seen_at = ?, ip = ?, country = ?, app = ? WHERE id = ?').bind(t, clientIp(req), country(req), clip(b.app, 40), row.device_id),
            env.DB.prepare('UPDATE keys SET last_seen_at = ? WHERE id = ?').bind(t, row.id)
        ]);
    }
    return json({ ok: true, license: licenseView(row, row.device_count), serverTime: t });
}

function info(env) {
    return json({
        name: 'Ledger',
        telegram: String(env.TELEGRAM || 'm4ks1em').replace(/^@/, ''),
        github: env.GITHUB || 'https://github.com/m4ks1em-maker/ledger',
        serverTime: now()
    }, 200, { 'Access-Control-Allow-Origin': '*' });
}

/* ------------------------------------------------------------- admin API */

async function adminSession(req, env) {
    const tok = cookies(req)[ADMIN_COOKIE];
    if (!tok) return null;
    const row = await env.DB.prepare('SELECT * FROM admin_sessions WHERE token_hash = ?').bind(await sha256('ledger-admin:' + tok)).first();
    if (!row || row.expires_at <= now()) return null;
    return row;
}
function sameOrigin(req) {
    const o = req.headers.get('Origin');
    if (!o) return true;
    try { return new URL(o).host === new URL(req.url).host; } catch (_) { return false; }
}
function adminCookie(req, value, maxAgeSec) {
    const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
    return `${ADMIN_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}${secure}`;
}

async function adminLogin(req, env) {
    if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not set on the server. Run: npx wrangler secret put ADMIN_PASSWORD' }, 503);
    if (await tooMany(env, req, 'admin_fail', 6, 15 * 60000)) return json({ error: 'Too many attempts. Try again in 15 min.' }, 429, { 'Retry-After': '900' });
    const b = await body(req);
    const ok = safeEqual(await sha256('pw:' + String(b.password || '')), await sha256('pw:' + env.ADMIN_PASSWORD));
    if (!ok) {
        await logEvent(env, req, 'admin_fail');
        await new Promise((r) => setTimeout(r, 400));
        return json({ error: 'Wrong password' }, 401);
    }
    const token = randomToken(), t = now();
    await env.DB.batch([
        env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').bind(t),
        env.DB.prepare('INSERT INTO admin_sessions (token_hash, created_at, expires_at, ip) VALUES (?, ?, ?, ?)').bind(await sha256('ledger-admin:' + token), t, t + ADMIN_TTL, clientIp(req))
    ]);
    await logEvent(env, req, 'admin_login');
    return json({ ok: true }, 200, { 'Set-Cookie': adminCookie(req, token, ADMIN_TTL / 1000) });
}

async function adminApi(req, env, path) {
    const method = req.method;
    if (path === '/api/admin/login' && method === 'POST') return adminLogin(req, env);

    const session = await adminSession(req, env);
    if (!session) return json({ error: 'Sign in required' }, 401);

    if (path === '/api/admin/me' && method === 'GET') return json({ ok: true, telegram: String(env.TELEGRAM || 'm4ks1em').replace(/^@/, ''), github: env.GITHUB || '' });
    if (path === '/api/admin/logout' && method === 'POST') {
        await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(session.token_hash).run();
        return json({ ok: true }, 200, { 'Set-Cookie': adminCookie(req, '', 0) });
    }

    if (path === '/api/admin/overview' && method === 'GET') {
        const t = now();
        const [keys, events, online] = await env.DB.batch([
            env.DB.prepare(`SELECT k.*, (SELECT COUNT(*) FROM devices d WHERE d.key_id = k.id) AS device_count FROM keys k ORDER BY k.created_at DESC LIMIT 1000`),
            env.DB.prepare('SELECT * FROM events ORDER BY id DESC LIMIT 150'),
            env.DB.prepare('SELECT COUNT(*) AS n FROM devices WHERE last_seen_at > ?').bind(t - DAY)
        ]);
        const list = keys.results.map(adminKeyView);
        const count = (s) => list.filter((k) => k.status === s).length;
        return json({
            keys: list,
            events: events.results,
            stats: { total: list.length, active: count('active'), unused: count('unused'), expired: count('expired'), revoked: count('revoked'), online: online.results[0] ? online.results[0].n : 0 },
            serverTime: t
        });
    }

    if (path === '/api/admin/keys' && method === 'POST') {
        const b = await body(req);
        const count = Math.max(1, Math.min(50, Math.floor(Number(b.count) || 1)));
        const days = Math.max(0, Math.min(3650, Math.floor(Number(b.days) || 0)));
        const devices = Math.max(1, Math.min(10, Math.floor(Number(b.devices) || 1)));
        const baseLabel = clip(b.label, 60) || 'Key';
        const note = clip(b.note, 200);
        const t = now();
        const created = [], stmts = [];
        for (let i = 0; i < count; i++) {
            const plain = newKey();
            const rec = { id: randomHex(6), digest: await keyDigest(plain), tail: plain.slice(-4), label: count > 1 ? `${baseLabel.slice(0, 54)} ${i + 1}` : baseLabel };
            stmts.push(env.DB.prepare('INSERT INTO keys (id, digest, tail, label, note, duration_days, max_devices, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
                .bind(rec.id, rec.digest, rec.tail, rec.label, note, days, devices, t));
            created.push({ id: rec.id, key: plain, label: rec.label, durationDays: days, maxDevices: devices });
        }
        await env.DB.batch(stmts);
        await logEvent(env, req, 'keys_created', { label: baseLabel, detail: `${count} × ${days || '∞'}d × ${devices}` });
        return json({ created }, 201);
    }

    let m = /^\/api\/admin\/keys\/([a-f0-9]{12})$/.exec(path);
    if (m && method === 'POST') {
        const k = await env.DB.prepare('SELECT * FROM keys WHERE id = ?').bind(m[1]).first();
        if (!k) return json({ error: 'Key not found' }, 404);
        const b = await body(req);
        const t = now();
        let stmt = null, detail = '';
        switch (b.action) {
            case 'revoke': stmt = env.DB.prepare('UPDATE keys SET revoked = 1 WHERE id = ?').bind(k.id); break;
            case 'restore': stmt = env.DB.prepare('UPDATE keys SET revoked = 0 WHERE id = ?').bind(k.id); break;
            case 'extend': {
                const d = Math.max(1, Math.min(3650, Math.floor(Number(b.days) || 30)));
                detail = '+' + d + 'd';
                if (!k.duration_days) return json({ error: 'This key never expires.' }, 400);
                if (!k.activated_at) stmt = env.DB.prepare('UPDATE keys SET duration_days = duration_days + ? WHERE id = ?').bind(d, k.id);
                else {
                    const from = k.expires_at && k.expires_at > t ? k.expires_at : t;
                    stmt = env.DB.prepare('UPDATE keys SET duration_days = duration_days + ?, expires_at = ? WHERE id = ?').bind(d, from + d * DAY, k.id);
                }
                break;
            }
            case 'forever': stmt = env.DB.prepare('UPDATE keys SET duration_days = 0, expires_at = NULL WHERE id = ?').bind(k.id); break;
            case 'devices': {
                const n = Math.max(1, Math.min(10, Math.floor(Number(b.maxDevices) || 1)));
                detail = String(n);
                stmt = env.DB.prepare('UPDATE keys SET max_devices = ? WHERE id = ?').bind(n, k.id);
                break;
            }
            case 'rename': stmt = env.DB.prepare('UPDATE keys SET label = ? WHERE id = ?').bind(clip(b.label, 60) || k.label, k.id); break;
            case 'note': stmt = env.DB.prepare('UPDATE keys SET note = ? WHERE id = ?').bind(clip(b.note, 200), k.id); break;
            case 'reset': stmt = env.DB.prepare('DELETE FROM devices WHERE key_id = ?').bind(k.id); break;
            case 'delete':
                await env.DB.batch([
                    env.DB.prepare('DELETE FROM devices WHERE key_id = ?').bind(k.id),
                    env.DB.prepare('DELETE FROM keys WHERE id = ?').bind(k.id)
                ]);
                await logEvent(env, req, 'key_delete', { keyId: k.id, label: k.label });
                return json({ ok: true, key: null });
            default: return json({ error: 'Unknown action' }, 400);
        }
        await stmt.run();
        if (b.action !== 'note' && b.action !== 'rename') await logEvent(env, req, 'key_' + b.action, { keyId: k.id, label: k.label, detail });
        const fresh = await env.DB.prepare('SELECT k.*, (SELECT COUNT(*) FROM devices d WHERE d.key_id = k.id) AS device_count FROM keys k WHERE k.id = ?').bind(k.id).first();
        return json({ ok: true, key: adminKeyView(fresh) });
    }

    m = /^\/api\/admin\/keys\/([a-f0-9]{12})\/devices$/.exec(path);
    if (m && method === 'GET') {
        const rows = await env.DB.prepare('SELECT id, name, ip, country, app, created_at, last_seen_at FROM devices WHERE key_id = ? ORDER BY last_seen_at DESC').bind(m[1]).all();
        return json({ devices: rows.results });
    }
    m = /^\/api\/admin\/devices\/([a-f0-9]{16})$/.exec(path);
    if (m && method === 'DELETE') {
        await env.DB.prepare('DELETE FROM devices WHERE id = ?').bind(m[1]).run();
        await logEvent(env, req, 'device_removed', { detail: m[1] });
        return json({ ok: true });
    }
    return json({ error: 'Not found' }, 404);
}

/* ---------------------------------------------------------------- router */

async function route(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/v1/info' && req.method === 'GET') return info(env);
    if (path.startsWith('/v1/') || path.startsWith('/api/')) {
        if (!env.DB) return json({ error: 'The D1 database is not bound. Check wrangler.toml.' }, 500);
        await ensureSchema(env);
        if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
        if (req.method !== 'GET' && !sameOrigin(req) && path.startsWith('/api/')) return json({ error: 'Cross-site request blocked' }, 403);
        if (path === '/v1/activate' && req.method === 'POST') return activate(req, env);
        if (path === '/v1/check' && req.method === 'POST') return check(req, env);
        if (path.startsWith('/api/admin/')) return adminApi(req, env, path);
        return json({ error: 'Not found' }, 404);
    }
    if (env.ASSETS) return env.ASSETS.fetch(req);
    return new Response('Not found', { status: 404 });
}

export default {
    async fetch(req, env, ctx) {
        try {
            return await route(req, env, ctx);
        } catch (e) {
            if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
            console.error('ledger-keys error:', e && (e.stack || e.message));
            return json({ error: 'Server error' }, 500);
        }
    }
};

// exported for tests
export const _internal = { normalizeKey, keyDigest, newKey, keyStatus };

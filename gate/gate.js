#!/usr/bin/env node
'use strict';
/*
 * Ledger gate: access keys in front of server.exe.
 *
 *   browser ──► gate (port 8080) ──► server.exe (127.0.0.1:8081)
 *
 * - Visitors sign in with an access key that you generate in /admin.
 * - Two roles: "viewer" (analyse replays) and "admin" (everything).
 * - Viewers can never reach the Steam login, your Steam password, the replay
 *   delete button or settings; the gate blocks those API calls itself.
 * - Zero dependencies. Needs Node 18+.
 *
 * Commands:
 *   node gate.js                      start the gate
 *   node gate.js passwd <password>    set the admin password
 *   node gate.js newkey [label] [days] [viewer|admin]   print a new key
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bzip2 = require('./vendor/seek-bzip');

const ROOT = path.resolve(__dirname, '..');
const STATIC_DIR = path.join(ROOT, 'static');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = process.env.GATE_DATA_DIR ? path.resolve(process.env.GATE_DATA_DIR) : path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ------------------------------------------------------------------ utils */

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const now = () => Date.now();
const DAY = 86400000;

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
function writeJsonAtomic(file, data) {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
}

function hashPassword(pw) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(pw, salt, 32);
    return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex');
}
function verifyPassword(pw, stored) {
    try {
        const [kind, saltHex, hashHex] = String(stored).split('$');
        if (kind !== 'scrypt') return false;
        const want = Buffer.from(hashHex, 'hex');
        const got = crypto.scryptSync(pw, Buffer.from(saltHex, 'hex'), want.length);
        return crypto.timingSafeEqual(got, want);
    } catch (_) { return false; }
}

/* ----------------------------------------------------------------- config */

const config = Object.assign({
    host: '127.0.0.1',       // loopback unless you opt in (GATE_HOST=0.0.0.0, or a tunnel / reverse proxy on this machine)
    port: 8080,
    upstream: 'http://127.0.0.1:8081',
    sessionHours: 12,
    cookieSecure: false,       // true when served over https
    trustProxy: false,         // true behind Caddy / nginx / Cloudflare (reads X-Forwarded-*)
    viewerCanDownload: true,   // viewers may fetch match history and download replays via your Steam login
    secret: '',
    adminHash: '',
    sync: { enabled: false, source: 'opendota', steamId: '', everyMin: 10, limit: 10, turbo: false }
}, readJson(CONFIG_FILE, {}));
config.sync = Object.assign({ enabled: false, source: 'opendota', steamId: '', everyMin: 10, limit: 10, turbo: false }, config.sync || {});

if (process.env.GATE_PORT) config.port = Number(process.env.GATE_PORT);
if (process.env.GATE_HOST) config.host = process.env.GATE_HOST;
if (process.env.UPSTREAM) config.upstream = process.env.UPSTREAM;
if (process.env.COOKIE_SECURE) config.cookieSecure = process.env.COOKIE_SECURE === '1';
if (process.env.TRUST_PROXY) config.trustProxy = process.env.TRUST_PROXY === '1';

let firstRunAdminPassword = null;
if (!config.secret) config.secret = crypto.randomBytes(32).toString('hex');
if (!config.adminHash && !process.env.ADMIN_PASSWORD) {
    const raw = crypto.randomBytes(9);
    firstRunAdminPassword = 'admin-' + b64url(raw);
    config.adminHash = hashPassword(firstRunAdminPassword);
}
const saveConfig = () => {
    const { host, port, upstream, sessionHours, cookieSecure, trustProxy, viewerCanDownload, secret, adminHash, sync } = config;
    writeJsonAtomic(CONFIG_FILE, { host, port, upstream, sessionHours, cookieSecure, trustProxy, viewerCanDownload, secret, adminHash, sync });
};
saveConfig();
const envAdminHash = process.env.ADMIN_PASSWORD ? hashPassword(process.env.ADMIN_PASSWORD) : null;

/* -------------------------------------------------------------------- keys */

const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // no I L O U 0 1: nothing to misread
let store = readJson(KEYS_FILE, { keys: [] });
if (!Array.isArray(store.keys)) store = { keys: [] };
const saveKeys = () => writeJsonAtomic(KEYS_FILE, store);

function normalizeKey(input) {
    return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LDG/, '');
}
const keyDigest = (normalized) => crypto.createHmac('sha256', config.secret).update(normalized).digest('hex');

function randomKey() {
    // 16 symbols from 30 letters/digits ≈ 78 bits of entropy
    const out = [];
    const bytes = crypto.randomBytes(32);
    for (let i = 0; out.length < 16; i++) {
        if (i >= bytes.length) return randomKey();
        if (bytes[i] < 240) out.push(ALPHABET[bytes[i] % ALPHABET.length]); // 240 = 30 * 8: unbiased
    }
    const s = out.join('');
    return 'LDG-' + s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12) + '-' + s.slice(12, 16);
}

function createKey({ label, role, durationDays, maxSessions }) {
    const plain = randomKey();
    const rec = {
        id: crypto.randomBytes(6).toString('hex'),
        label: String(label || 'Untitled').slice(0, 60),
        role: role === 'admin' ? 'admin' : 'viewer',
        digest: keyDigest(normalizeKey(plain)),
        tail: plain.slice(-4),
        createdAt: now(),
        durationDays: Math.max(0, Math.min(3650, Number(durationDays) || 0)),
        activatedAt: null,
        revoked: false,
        maxSessions: Math.max(1, Math.min(20, Number(maxSessions) || 2)),
        lastSeenAt: null,
        logins: 0
    };
    store.keys.push(rec);
    return { rec, plain };
}

const expiresAt = (k) => (k.durationDays && k.activatedAt ? k.activatedAt + k.durationDays * DAY : null);
function keyStatus(k) {
    if (k.revoked) return 'revoked';
    const exp = expiresAt(k);
    if (exp && exp <= now()) return 'expired';
    if (!k.activatedAt) return 'unused';
    return 'active';
}
const publicKey = (k) => ({
    id: k.id, label: k.label, role: k.role, tail: k.tail, createdAt: k.createdAt,
    durationDays: k.durationDays, activatedAt: k.activatedAt, expiresAt: expiresAt(k),
    status: keyStatus(k), maxSessions: k.maxSessions, lastSeenAt: k.lastSeenAt, logins: k.logins,
    sessions: countSessions(k.id)
});

/* ---------------------------------------------------------------- sessions */

const sessions = new Map(); // sha256(sid) -> { keyId|null, role, label, createdAt, expires, ip, ua }
const COOKIE = 'ledger_sid';

function countSessions(keyId) {
    let n = 0;
    for (const s of sessions.values()) if (s.keyId === keyId) n++;
    return n;
}
function dropSessions(keyId) {
    for (const [h, s] of sessions) if (s.keyId === keyId) sessions.delete(h);
}
function openSession({ keyId, role, label, expires, ip, ua }) {
    const sid = b64url(crypto.randomBytes(32));
    const ttl = config.sessionHours * 3600000;
    const exp = Math.min(now() + ttl, expires || Infinity);
    sessions.set(sha256(sid), { keyId, role, label, createdAt: now(), expires: exp, ip, ua: String(ua || '').slice(0, 120) });
    return { sid, exp };
}
function getSession(req) {
    const sid = parseCookies(req)[COOKIE];
    if (!sid) return null;
    const h = sha256(sid);
    const s = sessions.get(h);
    if (!s) return null;
    if (s.expires <= now()) { sessions.delete(h); return null; }
    if (s.keyId) {
        const k = store.keys.find((x) => x.id === s.keyId);
        if (!k || keyStatus(k) === 'revoked' || keyStatus(k) === 'expired') { sessions.delete(h); return null; }
        s.role = k.role; s.label = k.label;
        k.lastSeenAt = now();
    }
    return Object.assign({ hash: h }, s);
}
setInterval(() => { for (const [h, s] of sessions) if (s.expires <= now()) sessions.delete(h); }, 60000).unref();
setInterval(() => { try { saveKeys(); } catch (_) {} }, 60000).unref(); // flush lastSeenAt

function parseCookies(req) {
    const out = {};
    String(req.headers.cookie || '').split(';').forEach((p) => {
        const i = p.indexOf('=');
        if (i > 0) { try { out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (_) { /* skip malformed cookie */ } }
    });
    return out;
}
function isSecure(req) {
    return config.cookieSecure || !!req.socket.encrypted || (config.trustProxy && String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https');
}
function setSessionCookie(req, res, sid, exp) {
    const maxAge = Math.max(0, Math.floor((exp - now()) / 1000));
    res.setHeader('Set-Cookie', `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure(req) ? '; Secure' : ''}`);
}
function clearSessionCookie(req, res) {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure(req) ? '; Secure' : ''}`);
}

/* ------------------------------------------------------------ rate limiting */

const fails = new Map(); // ip -> [timestamps]
const WINDOW = 10 * 60000, MAX_FAILS = 8;
function clientIp(req) {
    if (config.trustProxy) {
        const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        if (xf) return xf;
    }
    return req.socket.remoteAddress || 'unknown';
}
function lockedFor(ip) {
    const list = (fails.get(ip) || []).filter((t) => now() - t < WINDOW);
    fails.set(ip, list);
    if (list.length >= MAX_FAILS) return Math.ceil((WINDOW - (now() - list[list.length - 1])) / 1000);
    return 0;
}
const noteFail = (ip) => { const l = fails.get(ip) || []; l.push(now()); fails.set(ip, l); };
setInterval(() => { for (const [ip, l] of fails) if (!l.some((t) => now() - t < WINDOW)) fails.delete(ip); }, 60000).unref();

/* ----------------------------------------------------------------- policy */

// What a viewer key may call on server.exe. Anything under /api/ not listed is refused.
const VIEWER_RULES = [
    ['GET', '/api/browse'],
    ['GET', '/api/replays'],
    ['POST', '/api/parse'],
    ['POST', '/api/player-info'],
    ['GET', '/api/hero-icon/'],
    ['GET', '/api/steam/status'],
    ['GET', '/api/config']          // answered with a sanitised copy
];
const VIEWER_DOWNLOAD_RULES = [
    ['GET', '/api/history'],
    ['*', '/api/download'],
    ['GET', '/api/progress']
];
function viewerAllowed(method, pathname) {
    const rules = config.viewerCanDownload ? VIEWER_RULES.concat(VIEWER_DOWNLOAD_RULES) : VIEWER_RULES;
    return rules.some(([m, p]) => (m === '*' || m === method) && (p.endsWith('/') ? pathname.startsWith(p) : pathname === p));
}

/* ------------------------------------------------------------------ http */

const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8'
};

function baseHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
}
const PAGE_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

function sendJson(res, status, obj, extra) {
    const body = JSON.stringify(obj);
    res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' }, extra || {}));
    res.end(body);
}
function sendFile(res, file, { gatePage = false } = {}) {
    fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('Not found'); }
        const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': 'no-cache' };
        if (gatePage) headers['Content-Security-Policy'] = PAGE_CSP;
        res.writeHead(200, headers);
        res.end(buf);
    });
}
function readBody(req, limit = 64 * 1024) {
    return new Promise((resolve, reject) => {
        let size = 0; const chunks = [];
        req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
        req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(e); } });
        req.on('error', reject);
    });
}
function sameOrigin(req) {
    const o = req.headers.origin;
    if (!o) return true;
    try { return new URL(o).host === req.headers.host; } catch (_) { return false; }
}
const isUnsafe = (m) => m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS';

function safeJoin(dir, rel) {
    const full = path.normalize(path.join(dir, rel));
    return full.startsWith(dir + path.sep) || full === dir ? full : null;
}

function upstreamDown(req, res) {
    if (String(req.url).startsWith('/api/')) return sendJson(res, 502, { error: 'The Ledger engine is not running. Start server.exe.' });
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>Engine offline</title><body style="font:15px system-ui;background:#08090b;color:#ecebe6;display:grid;place-items:center;height:100vh;margin:0"><div><h2 style="font-weight:500">Engine offline</h2><p style="color:#9a9ca6">server.exe is not running. Start it with start.bat and reload.</p></div>');
}

function proxy(req, res, session, pathname) {
    const up = new URL(config.upstream);
    const headers = Object.assign({}, req.headers);
    delete headers.cookie;                        // never forward the gate session
    headers.host = up.host;
    headers['x-forwarded-for'] = clientIp(req);
    const sanitize = session.role !== 'admin' && pathname === '/api/config' && req.method === 'GET';
    if (sanitize) delete headers['accept-encoding'];

    const pr = http.request({ hostname: up.hostname, port: up.port || 80, path: req.url, method: req.method, headers }, (ur) => {
        if (sanitize) {
            const chunks = [];
            ur.on('data', (c) => chunks.push(c));
            ur.on('end', () => {
                let out = Buffer.concat(chunks);
                try {
                    const j = JSON.parse(out.toString('utf8'));
                    delete j.steamUser; delete j.steamPass; delete j.steamPassword; delete j.apiKey; delete j.profiles;
                    j.replayDir = 'Shared replay library';
                    out = Buffer.from(JSON.stringify(j));
                } catch (_) { out = Buffer.from('{}'); }
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': out.length, 'Cache-Control': 'no-store' });
                res.end(out);
            });
            return;
        }
        const h = Object.assign({}, ur.headers);
        delete h['set-cookie'];
        if ((ur.headers['content-type'] || '').includes('text/event-stream')) h['x-accel-buffering'] = 'no';
        res.writeHead(ur.statusCode, h);
        ur.pipe(res);
    });
    pr.on('error', () => { if (!res.headersSent) upstreamDown(req, res); else res.end(); });
    res.on('close', () => pr.destroy());
    req.pipe(pr);
}


/* ------------------------------------------------------------ audit log */
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');
let auditLog = readJson(AUDIT_FILE, []);
if (!Array.isArray(auditLog)) auditLog = [];
let auditTimer = null;
function audit(type, req, extra) {
    const e = Object.assign({ t: now(), type, ip: req ? clientIp(req) : '', ua: req ? String(req.headers['user-agent'] || '').slice(0, 200) : '' }, extra || {});
    auditLog.push(e);
    if (auditLog.length > 600) auditLog.splice(0, auditLog.length - 500);
    clearTimeout(auditTimer);
    auditTimer = setTimeout(() => { try { writeJsonAtomic(AUDIT_FILE, auditLog); } catch (_) {} }, 400);
    return e;
}

/* ------------------------------------------------- talking to the engine */
function engine(method, apiPath, body, timeoutMs) {
    return new Promise((resolve, reject) => {
        const up = new URL(config.upstream);
        const data = body ? Buffer.from(JSON.stringify(body)) : null;
        const r = http.request({ hostname: up.hostname, port: up.port || 80, path: apiPath, method, timeout: timeoutMs || 15000,
            headers: Object.assign({ Accept: 'application/json' }, data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}) }, (ur) => {
            const chunks = [];
            ur.on('data', (c) => chunks.push(c));
            ur.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                if (ur.statusCode >= 400) return reject(new Error(`engine ${ur.statusCode}: ${text.slice(0, 120)}`));
                try { resolve(JSON.parse(text)); } catch (_) { reject(new Error('engine returned something unreadable')); }
            });
        });
        r.on('timeout', () => r.destroy(new Error('engine timed out')));
        r.on('error', reject);
        if (data) r.write(data);
        r.end();
    });
}

/* --------------------------------------------------- auto-sync of matches */
const SYNC_FILE = path.join(DATA_DIR, 'sync.json');
const syncState = Object.assign({ lastRun: 0, lastOk: null, message: 'Off', downloadedTotal: 0, recent: [], running: false }, readJson(SYNC_FILE, {}), { running: false });
const saveSync = () => { try { writeJsonAtomic(SYNC_FILE, syncState); } catch (_) {} };

async function syncTick(reason) {
    if (syncState.running) return;
    const c = config.sync;
    syncState.running = true; syncState.lastRun = now();
    try {
        if (!/^\d{5,20}$/.test(String(c.steamId || ''))) throw new Error('Set a Steam ID first');
        if (c.source !== 'steam') {
            const acc = accountId(c.steamId);
            if (!acc) throw new Error('That does not look like a Steam ID');
            playerCache.delete(acc);
            const list = (await odPlayer(acc)).slice(0, c.limit);
            const todo = [];
            for (const m of list) { if (!(await haveReplay(m.id))) todo.push(m.id); if (todo.length >= 5) break; }
            let got = 0, expired = 0;
            for (const id of todo) {
                syncState.message = `Downloading ${id}…`;
                const j = enqueue(id);
                while (j.state !== 'done' && j.state !== 'error') await new Promise((r) => setTimeout(r, 700));
                if (j.state === 'done') { got++; syncState.recent.unshift({ id, t: now() }); audit('sync_download', null, { match: id }); }
                else if (j.code === 'expired') expired++;
                else audit('sync_error', null, { msg: String(j.error).slice(0, 120), match: id });
            }
            syncState.recent = syncState.recent.slice(0, 20);
            syncState.downloadedTotal += got; syncState.lastOk = now();
            syncState.message = got ? `Downloaded ${got} new match${got > 1 ? 'es' : ''}` : (todo.length ? (expired === todo.length ? 'Replays expired on Valve servers' : 'Nothing could be downloaded') : 'Up to date');
            return;
        }
        const st = await engine('GET', '/api/steam/status');
        if (st.status !== 3 && st.status !== 4) throw new Error('Steam is not connected on the host');
        const hist = await engine('GET', `/api/history?steamId=${encodeURIComponent(c.steamId)}&limit=${c.limit}${c.turbo ? '&turboOnly=true' : ''}`, null, 60000);
        const have = new Set(((await engine('GET', '/api/replays?t=' + now())) || []).map((r) => String(r.fileName || '').replace('.dem', '')));
        const todo = (hist || []).map((m) => String(m.id)).filter((id) => /^\d+$/.test(id) && !have.has(id)).slice(0, 5);
        let got = 0;
        for (const id of todo) {
            syncState.message = `Downloading ${id}…`;
            try {
                const r = await engine('POST', '/api/download', { matchId: Number(id), profileName: '' }, 10 * 60000);
                if (r && r.success) { got++; syncState.recent.unshift({ id, t: now() }); audit('sync_download', null, { match: id }); }
            } catch (e) { audit('sync_error', null, { msg: String(e.message).slice(0, 120), match: id }); }
        }
        syncState.recent = syncState.recent.slice(0, 20);
        syncState.downloadedTotal += got;
        syncState.lastOk = now();
        syncState.message = got ? `Downloaded ${got} new match${got > 1 ? 'es' : ''}` : (todo.length ? 'Nothing could be downloaded' : 'Up to date');
    } catch (e) {
        syncState.message = String(e.message || e).slice(0, 140);
        if (reason !== 'quiet') audit('sync_error', null, { msg: syncState.message });
    } finally {
        syncState.running = false; saveSync();
    }
}
setInterval(() => {
    const c = config.sync;
    if (!c.enabled || syncState.running) return;
    if (now() - syncState.lastRun >= Math.max(1, c.everyMin) * 60000 - 2000) syncTick('quiet');
}, 30000).unref();

/* ----------------------------------------------------- replay uploads */
const MAX_UPLOAD = 700 * 1024 * 1024;
async function uploadReplay(req, res, url, session) {
    const name = String(url.searchParams.get('name') || '');
    if (!/^[0-9A-Za-z_-]{1,60}\.dem$/.test(name)) return sendJson(res, 400, { error: 'Only .dem files with a simple name.' });
    const len = Number(req.headers['content-length'] || 0);
    if (!len || len > MAX_UPLOAD) return sendJson(res, 413, { error: 'File is empty or larger than 700 MB.' });
    let dir;
    try { const cfg = await engine('GET', '/api/config'); dir = cfg && cfg.replayDir; } catch (_) { return sendJson(res, 502, { error: 'The engine is not running.' }); }
    if (!dir || typeof dir !== 'string') return sendJson(res, 500, { error: 'Replay folder is not set.' });
    const target = path.join(dir, 'uploads');
    fs.mkdirSync(target, { recursive: true });
    const finalPath = path.join(target, name);
    const tmp = finalPath + '.part';
    let received = 0, head = Buffer.alloc(0), bad = false;
    const out = fs.createWriteStream(tmp);
    await new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        req.on('data', (c) => {
            received += c.length;
            if (bad) return;                                  // keep draining so the client can read our answer
            if (head.length < 8) head = Buffer.concat([head, c]).subarray(0, 8);
            if (received > MAX_UPLOAD) { bad = true; req.destroy(); out.destroy(); return finish(); }
            if (received >= 7 && head.subarray(0, 7).toString('latin1') !== 'PBDEMS2') { bad = true; req.unpipe(out); out.destroy(); return; }
            if (!out.write(c)) { req.pause(); out.once('drain', () => req.resume()); }
        });
        req.on('end', () => { if (bad) finish(); else out.end(finish); });
        req.on('error', () => { bad = true; out.destroy(); finish(); });
        req.on('close', () => { if (!req.complete) { bad = true; out.destroy(); finish(); } });
    });
    if (bad || received !== len) { fs.rm(tmp, { force: true }, () => {}); if (!res.headersSent && !res.destroyed) return sendJson(res, 400, { error: bad ? 'That is not a Dota 2 replay.' : 'Upload was interrupted.' }); return; }
    fs.renameSync(tmp, finalPath);
    audit('upload', req, { who: session.label, name, size: received });
    return sendJson(res, 201, { ok: true, path: 'uploads/' + name });
}


/* ------------------------------------------- OpenDota mode (no Steam login) */
// Looks a player up on OpenDota and downloads the replay straight from Valve's replay
// servers. Nobody has to sign in to Steam, the host's Steam account is never involved.
const OD_BASE = (process.env.OPENDOTA_BASE || 'https://api.opendota.com/api').replace(/\/+$/, '');
const OD_KEY = process.env.OPENDOTA_KEY || '';
const REPLAY_TEMPLATES = process.env.REPLAY_URL_TEMPLATES
    ? process.env.REPLAY_URL_TEMPLATES.split(',')
    : ['http://replay{c}.valve.net/570/{m}_{s}.dem.bz2', 'http://replay{c}.steamcontent.com/570/{m}_{s}.dem.bz2'];
const MAX_BZ2 = 300 * 1024 * 1024, MAX_STORE = 8 * 1024 * 1024 * 1024;
const STEAM64 = 76561197960265728n;

function accountId(v) {
    const s = String(v == null ? '' : v).trim();
    const m = /^\[?U:1:(\d+)\]?$/.exec(s);
    try {
        let n; if (m) n = BigInt(m[1]); else if (/^\d{1,20}$/.test(s)) n = BigInt(s); else return null;
        if (n >= STEAM64) n -= STEAM64;
        return n > 0n && n < 4294967296n ? n.toString() : null;
    } catch (_) { return null; }
}

function httpGet(urlStr, { timeout = 20000, onHead, onData } = {}) {
    return new Promise((resolve, reject) => {
        let u; try { u = new URL(urlStr); } catch (_) { return reject(new Error('bad url')); }
        const lib = u.protocol === 'https:' ? https : http;
        const r = lib.get(u, { timeout, headers: { 'User-Agent': 'Ledger/1.0 (+replay report viewer)', Accept: '*/*' } }, (ur) => {
            if (ur.statusCode >= 300 && ur.statusCode < 400 && ur.headers.location) { ur.resume(); return reject(Object.assign(new Error('redirect'), { status: ur.statusCode })); }
            if (onHead) { try { onHead(ur); } catch (e) { ur.destroy(); return reject(e); } }
            if (ur.statusCode !== 200) { ur.resume(); return reject(Object.assign(new Error('HTTP ' + ur.statusCode), { status: ur.statusCode })); }
            ur.on('data', (c) => { try { if (onData) onData(c); } catch (e) { ur.destroy(); reject(e); } });
            ur.on('end', resolve); ur.on('error', reject); ur.on('aborted', () => reject(new Error('connection dropped')));
        });
        r.on('timeout', () => r.destroy(new Error('timed out')));
        r.on('error', reject);
    });
}
async function odJson(p, timeout) {
    const chunks = [];
    const sep = p.includes('?') ? '&' : '?';
    await httpGet(OD_BASE + p + (OD_KEY ? `${sep}api_key=${encodeURIComponent(OD_KEY)}` : ''), { timeout: timeout || 20000, onData: (c) => { chunks.push(c); if (chunks.length > 4000) throw new Error('too large'); } });
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

let heroCache = { at: 0, map: {} };
async function heroNames() {
    if (now() - heroCache.at < 12 * 3600000 && Object.keys(heroCache.map).length) return heroCache.map;
    try { const list = await odJson('/heroes'); const map = {}; list.forEach((h) => { map[h.id] = h.localized_name; }); heroCache = { at: now(), map }; } catch (_) {}
    return heroCache.map;
}
const playerCache = new Map();   // acc -> { at, data }
async function odPlayer(acc) {
    const c = playerCache.get(acc);
    if (c && now() - c.at < 5 * 60000) return c.data;
    const [rows, heroes] = await Promise.all([odJson(`/players/${acc}/matches?limit=20`, 25000), heroNames()]);
    if (!Array.isArray(rows)) throw new Error('OpenDota answered with something unexpected');
    const data = rows.map((m) => ({
        id: String(m.match_id), hero: heroes[m.hero_id] || ('Hero ' + m.hero_id), start: m.start_time, duration: m.duration,
        win: m.player_slot < 128 ? !!m.radiant_win : !m.radiant_win, mode: m.game_mode
    }));
    playerCache.set(acc, { at: now(), data });
    if (playerCache.size > 200) playerCache.delete(playerCache.keys().next().value);
    return data;
}

async function replayDir() {
    const cfg = await engine('GET', '/api/config');
    if (!cfg || typeof cfg.replayDir !== 'string' || !cfg.replayDir) throw new Error('Replay folder is not set');
    return cfg.replayDir;
}
function dirSize(dir) { let t = 0; try { for (const f of fs.readdirSync(dir)) { try { t += fs.statSync(path.join(dir, f)).size; } catch (_) {} } } catch (_) {} return t; }
async function haveReplay(id) {
    try { const dir = await replayDir(); if (fs.existsSync(path.join(dir, 'uploads', id + '.dem'))) return 'uploads/' + id + '.dem'; } catch (_) {}
    try { const hit = ((await engine('GET', '/api/replays?t=' + now())) || []).find((r) => String(r.fileName || '') === id + '.dem'); return hit ? hit.fileName : null; } catch (_) { return null; }
}

const jobs = new Map();            // id -> job
const jobQueue = [];
let jobsRunning = 0;
const MAX_JOBS = 2;
function publicJob(j) { return { id: j.id, matchId: j.matchId, state: j.state, progress: j.progress, error: j.error || null, code: j.code || null, path: j.state === 'done' ? 'uploads/' + j.matchId + '.dem' : null }; }
function failJob(j, code, msg) { j.state = 'error'; j.code = code; j.error = msg; }

async function runJob(j) {
    const tmpFiles = [];
    try {
        const dir = await replayDir();
        const target = path.join(dir, 'uploads'); fs.mkdirSync(target, { recursive: true });
        const finalPath = path.join(target, j.matchId + '.dem');
        if (fs.existsSync(finalPath) || await haveReplay(j.matchId)) { j.state = 'done'; j.progress = 100; return; }
        if (dirSize(target) > MAX_STORE) return failJob(j, 'full', 'The replay library is full. Ask the owner to clean it.');

        j.state = 'looking'; j.progress = 2;
        const info = await odJson('/matches/' + j.matchId, 25000).catch((e) => { throw Object.assign(e, { od: true }); });
        const cluster = Number(info && info.cluster), salt = String((info && info.replay_salt) || '');
        if (!(cluster > 0 && cluster < 100000) || !/^\d{1,12}$/.test(salt)) return failJob(j, 'expired', 'Valve no longer keeps this replay. Upload the .dem file instead.');

        j.state = 'downloading';
        const bz = path.join(target, j.matchId + '.dem.bz2.part'); tmpFiles.push(bz);
        let ok = false, lastErr = null;
        for (const tpl of REPLAY_TEMPLATES) {
            const url = tpl.replace('{c}', String(cluster)).replace('{m}', j.matchId).replace('{s}', salt);
            const out = fs.createWriteStream(bz); let got = 0, total = 0;
            try {
                await httpGet(url, {
                    timeout: 30000,
                    onHead: (ur) => { total = Number(ur.headers['content-length'] || 0); if (total > MAX_BZ2) throw new Error('file too large'); },
                    onData: (c) => { got += c.length; if (got > MAX_BZ2) throw new Error('file too large'); out.write(c); if (total) j.progress = 5 + Math.round((got / total) * 70); }
                });
                await new Promise((r) => out.end(r)); ok = true; break;
            } catch (e) { lastErr = e; out.destroy(); }
        }
        if (!ok) return failJob(j, lastErr && lastErr.status === 404 ? 'expired' : 'download', lastErr && lastErr.status === 404 ? 'Valve no longer keeps this replay. Upload the .dem file instead.' : 'Could not download the replay (' + (lastErr ? lastErr.message : 'unknown') + ').');

        j.state = 'unpacking'; j.progress = 80;
        await new Promise((r) => setImmediate(r));
        let raw;
        try { raw = bzip2.decode(fs.readFileSync(bz)); } catch (_) { return failJob(j, 'corrupt', 'The downloaded file was damaged.'); }
        if (raw.length < 1024 || raw.subarray(0, 7).toString('latin1') !== 'PBDEMS2' || raw.length > MAX_UPLOAD) return failJob(j, 'corrupt', 'That is not a Dota 2 replay.');
        const part = finalPath + '.part'; tmpFiles.push(part);
        fs.writeFileSync(part, raw); fs.renameSync(part, finalPath);
        j.state = 'done'; j.progress = 100;
    } catch (e) {
        failJob(j, e && e.od ? 'opendota' : 'internal', e && e.od ? 'OpenDota did not answer. Try again in a minute.' : 'Something went wrong while fetching the replay.');
    } finally {
        tmpFiles.forEach((f) => fs.rm(f, { force: true }, () => {}));
    }
}
function pumpJobs() {
    while (jobsRunning < MAX_JOBS && jobQueue.length) {
        const j = jobQueue.shift(); jobsRunning++;
        runJob(j).finally(() => { jobsRunning--; j.done = now(); pumpJobs(); });
    }
}
function enqueue(matchId) {
    for (const j of jobs.values()) if (j.matchId === matchId && (j.state === 'queued' || j.state === 'looking' || j.state === 'downloading' || j.state === 'unpacking')) return j;
    const j = { id: crypto.randomBytes(6).toString('hex'), matchId, state: 'queued', progress: 0, created: now() };
    jobs.set(j.id, j); jobQueue.push(j);
    if (jobs.size > 300) for (const [k, v] of jobs) { if (v.done && now() - v.done > 600000) jobs.delete(k); }
    pumpJobs();
    return j;
}
const fetchLog = new Map();        // session hash -> timestamps (throttle)
function fetchAllowed(session) {
    if (session.role === 'admin') return true;
    const k = session.hash || session.label; const l = (fetchLog.get(k) || []).filter((t) => now() - t < 10 * 60000);
    if (l.length >= 20) { fetchLog.set(k, l); return false; }
    l.push(now()); fetchLog.set(k, l); return true;
}

async function odApi(req, res, url, pathname, session) {
    if (pathname === '/_ledger/od/player' && req.method === 'GET') {
        const acc = accountId(url.searchParams.get('id'));
        if (!acc) return sendJson(res, 400, { error: 'That does not look like a Steam ID.' });
        try {
            const matches = await odPlayer(acc);
            const withHave = await Promise.all(matches.map(async (m) => { const p = await haveReplay(m.id); return Object.assign({}, m, { have: !!p, path: p }); }));
            return sendJson(res, 200, { account: acc, matches: withHave });
        } catch (e) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
    }
    if (pathname === '/_ledger/od/fetch' && req.method === 'POST') {
        const b = await readBody(req, 1024);
        const id = String(b.matchId || '');
        if (!/^\d{6,12}$/.test(id)) return sendJson(res, 400, { error: 'Bad match ID.' });
        if (!fetchAllowed(session)) return sendJson(res, 429, { error: 'Slow down a little: too many downloads in a short time.' });
        const j = enqueue(id);
        audit('od_fetch', req, { who: session.label, match: id });
        return sendJson(res, 202, publicJob(j));
    }
    if (pathname === '/_ledger/od/job' && req.method === 'GET') {
        const j = jobs.get(String(url.searchParams.get('id') || ''));
        return j ? sendJson(res, 200, publicJob(j)) : sendJson(res, 404, { error: 'Unknown job' });
    }
    return sendJson(res, 404, { error: 'Not found' });
}

/* ------------------------------------------------------------- admin API */

async function adminApi(req, res, pathname) {
    if (pathname === '/_ledger/admin/keys' && req.method === 'GET') {
        const list = store.keys.map(publicKey).sort((a, b) => b.createdAt - a.createdAt);
        return sendJson(res, 200, { keys: list, liveSessions: sessions.size, serverTime: now() });
    }
    if (pathname === '/_ledger/admin/keys' && req.method === 'POST') {
        const b = await readBody(req);
        const count = Math.max(1, Math.min(50, Number(b.count) || 1));
        const created = [];
        for (let i = 0; i < count; i++) {
            const label = count > 1 ? `${String(b.label || 'Untitled').slice(0, 52)} ${i + 1}` : b.label;
            const { rec, plain } = createKey({ label, role: b.role, durationDays: b.durationDays, maxSessions: b.maxSessions });
            created.push(Object.assign(publicKey(rec), { key: plain }));
        }
        saveKeys();
        audit('key_created', req, { who: 'Owner', count: created.length, label: String(b.label || '').slice(0, 52) });
        return sendJson(res, 201, { created });
    }
    if (pathname === '/_ledger/admin/audit' && req.method === 'GET') {
        return sendJson(res, 200, { events: auditLog.slice(-200).reverse(), serverTime: now() });
    }
    if (pathname === '/_ledger/admin/sync' && req.method === 'GET') {
        return sendJson(res, 200, { config: config.sync, state: syncState, serverTime: now() });
    }
    if (pathname === '/_ledger/admin/sync' && req.method === 'POST') {
        const b = await readBody(req);
        if (b.action === 'run') { syncTick('manual'); return sendJson(res, 200, { ok: true }); }
        const c = config.sync;
        if (b.source != null) c.source = b.source === 'steam' ? 'steam' : 'opendota';
        if (b.steamId != null) { const v = String(b.steamId).trim(); if (v && !/^\d{5,20}$/.test(v)) return sendJson(res, 400, { error: 'Steam ID must be digits only.' }); c.steamId = v; }
        if (b.everyMin != null) c.everyMin = [5, 10, 15, 30, 60].includes(Number(b.everyMin)) ? Number(b.everyMin) : 10;
        if (b.limit != null) c.limit = [5, 10, 20].includes(Number(b.limit)) ? Number(b.limit) : 10;
        if (b.turbo != null) c.turbo = !!b.turbo;
        if (b.enabled != null) { c.enabled = !!b.enabled; if (c.enabled) { syncState.lastRun = 0; syncState.message = 'Starting…'; } else syncState.message = 'Off'; }
        saveConfig(); saveSync();
        return sendJson(res, 200, { config: c, state: syncState });
    }
    const m = /^\/_ledger\/admin\/keys\/([a-f0-9]{12})$/.exec(pathname);
    if (m && req.method === 'POST') {
        const k = store.keys.find((x) => x.id === m[1]);
        if (!k) return sendJson(res, 404, { error: 'Key not found' });
        const b = await readBody(req);
        switch (b.action) {
            case 'revoke': k.revoked = true; dropSessions(k.id); break;
            case 'restore': k.revoked = false; break;
            case 'kick': dropSessions(k.id); break;
            case 'extend': {
                const d = Math.max(1, Math.min(3650, Number(b.days) || 30));
                if (!k.durationDays) { return sendJson(res, 400, { error: 'This key never expires.' }); }
                k.durationDays += d; break;
            }
            case 'rename': k.label = String(b.label || k.label).slice(0, 60); break;
            case 'devices': k.maxSessions = Math.max(1, Math.min(20, Number(b.maxSessions) || 1)); break;
            case 'delete': store.keys = store.keys.filter((x) => x.id !== k.id); dropSessions(k.id); break;
            default: return sendJson(res, 400, { error: 'Unknown action' });
        }
        saveKeys();
        audit('key_' + b.action, req, { who: 'Owner', label: k.label });
        return sendJson(res, 200, { ok: true, key: b.action === 'delete' ? null : publicKey(k) });
    }
    return sendJson(res, 404, { error: 'Not found' });
}

/* ------------------------------------------------------------- login API */

async function login(req, res) {
    const ip = clientIp(req);
    const wait = lockedFor(ip);
    if (wait) { audit('login_locked', req); }
    if (wait) return sendJson(res, 429, { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.` }, { 'Retry-After': String(wait) });

    let body;
    try { body = await readBody(req, 2048); } catch (_) { return sendJson(res, 400, { error: 'Bad request' }); }
    const raw = String(body.key || '').trim();
    if (!raw || raw.length > 200) { noteFail(ip); return sendJson(res, 401, { error: 'Invalid key' }); }

    // 1) access key
    const digest = keyDigest(normalizeKey(raw));
    const k = store.keys.find((x) => x.digest.length === digest.length && crypto.timingSafeEqual(Buffer.from(x.digest), Buffer.from(digest)));
    if (k) {
        const st = keyStatus(k);
        if (st === 'revoked') { audit('login_denied', req, { who: k.label, why: 'revoked' }); return sendJson(res, 403, { error: 'This key was revoked.' }); }
        if (st === 'expired') { audit('login_denied', req, { who: k.label, why: 'expired' }); return sendJson(res, 403, { error: 'This key has expired.' }); }
        if (!k.activatedAt) k.activatedAt = now();
        // device limit: sign out the oldest session instead of locking the owner out
        const mine = [...sessions.entries()].filter(([, s]) => s.keyId === k.id).sort((a, b) => a[1].createdAt - b[1].createdAt);
        while (mine.length >= k.maxSessions) sessions.delete(mine.shift()[0]);
        k.logins++; k.lastSeenAt = now();
        saveKeys();
        const { sid, exp } = openSession({ keyId: k.id, role: k.role, label: k.label, expires: expiresAt(k), ip, ua: req.headers['user-agent'] });
        setSessionCookie(req, res, sid, exp);
        audit('login_ok', req, { who: k.label, role: k.role });
        return sendJson(res, 200, { ok: true, role: k.role });
    }

    // 2) master admin password
    const adminOk = verifyPassword(raw, envAdminHash || config.adminHash);
    if (adminOk) {
        const { sid, exp } = openSession({ keyId: null, role: 'admin', label: 'Owner', expires: null, ip, ua: req.headers['user-agent'] });
        setSessionCookie(req, res, sid, exp);
        audit('login_ok', req, { who: 'Owner', role: 'admin' });
        return sendJson(res, 200, { ok: true, role: 'admin' });
    }

    noteFail(ip);
    audit('login_fail', req);
    await new Promise((r) => setTimeout(r, 350)); // slow guessing down a little more
    return sendJson(res, 401, { error: 'Invalid key' });
}

/* ---------------------------------------------------------------- router */

async function handle(req, res) {
    baseHeaders(res);
    const url = new URL(req.url, 'http://gate');
    const pathname = url.pathname;
    const method = req.method;

    if (isUnsafe(method) && !sameOrigin(req)) return sendJson(res, 403, { error: 'Cross-site request blocked' });

    // ---- public
    if (pathname === '/login' && method === 'GET') {
        if (getSession(req)) { res.writeHead(302, { Location: '/' }); return res.end(); }
        return sendFile(res, path.join(PUBLIC_DIR, 'login.html'), { gatePage: true });
    }
    if (pathname === '/_ledger/login' && method === 'POST') return login(req, res);
    if (pathname.startsWith('/gate/') && (method === 'GET' || method === 'HEAD')) {
        const f = safeJoin(PUBLIC_DIR, pathname.slice('/gate/'.length));
        if (f && ['.css', '.js', '.svg', '.png'].includes(path.extname(f))) return sendFile(res, f);
        res.writeHead(404); return res.end('Not found');
    }
    if ((pathname === '/style.css' || pathname === '/i18n.js') && method === 'GET') return sendFile(res, path.join(STATIC_DIR, pathname.slice(1)));
    if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }

    // ---- everything below needs a session
    const session = getSession(req);
    if (!session) {
        if (pathname.startsWith('/api/') || pathname.startsWith('/_ledger/')) return sendJson(res, 401, { error: 'Sign in required' });
        res.writeHead(302, { Location: '/login' });
        return res.end();
    }

    if (pathname === '/_ledger/me' && method === 'GET') {
        return sendJson(res, 200, { role: session.role, label: session.label, expiresAt: session.expires });
    }
    if (pathname === '/_ledger/logout' && method === 'POST') {
        sessions.delete(session.hash);
        audit('logout', req, { who: session.label });
        clearSessionCookie(req, res);
        return sendJson(res, 200, { ok: true });
    }

    // ---- admin only
    if (pathname === '/admin' && method === 'GET') {
        if (session.role !== 'admin') { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }   // do not reveal that an admin page exists
        return sendFile(res, path.join(PUBLIC_DIR, 'admin.html'), { gatePage: true });
    }
    if (pathname.startsWith('/_ledger/admin/')) {
        if (session.role !== 'admin') return sendJson(res, 403, { error: 'Admins only' });
        try { return await adminApi(req, res, pathname); } catch (e) { return sendJson(res, 400, { error: 'Bad request' }); }
    }
    if (pathname === '/_ledger/upload' && method === 'POST') return uploadReplay(req, res, url, session);
    if (pathname.startsWith('/_ledger/od/')) { try { return await odApi(req, res, url, pathname, session); } catch (e) { return sendJson(res, 400, { error: 'Bad request' }); } }
    if (pathname.startsWith('/_ledger/')) return sendJson(res, 404, { error: 'Not found' });

    // ---- the app
    if (pathname.startsWith('/api/')) {
        if (session.role !== 'admin' && !viewerAllowed(method, pathname)) {
            return sendJson(res, 403, { error: 'This key cannot do that.' });
        }
        return proxy(req, res, session, pathname);
    }

    if (method === 'GET' || method === 'HEAD') {
        const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
        const f = safeJoin(STATIC_DIR, rel);
        if (f && fs.existsSync(f) && fs.statSync(f).isFile()) return sendFile(res, f);
    }
    return proxy(req, res, session, pathname);
}

/* ------------------------------------------------------------------- CLI */

const [, , cmd, ...args] = process.argv;
if (cmd === 'passwd') {
    if (!args[0] || args[0].length < 8) { console.error('Usage: node gate.js passwd <password, 8+ characters>'); process.exit(1); }
    config.adminHash = hashPassword(args[0]); saveConfig();
    console.log('Admin password updated.'); process.exit(0);
}
if (cmd === 'newkey') {
    const [label = 'CLI key', days = '30', role = 'viewer'] = args;
    const { plain } = createKey({ label, role, durationDays: Number(days), maxSessions: 2 }); saveKeys();
    console.log(plain); process.exit(0);
}

/* ----------------------------------------------------------------- start */

const server = http.createServer((req, res) => {
    handle(req, res).catch((e) => {
        console.error('[gate] error:', e && e.message);
        if (!res.headersSent) sendJson(res, 500, { error: 'Server error' }); else res.end();
    });
});
server.requestTimeout = 0;      // long downloads / SSE must not be cut
server.headersTimeout = 20000;

server.listen(config.port, config.host, () => {
    const line = '─'.repeat(58);
    console.log('\n' + line);
    console.log('  Ledger gate is running');
    console.log(`  Open:      http://localhost:${config.port}`);
    if (firstRunAdminPassword) {
        console.log(line);
        console.log('  FIRST RUN. Your admin password (shown once):');
        console.log('\n      ' + firstRunAdminPassword + '\n');
        console.log('  Change it any time:  node gate.js passwd <new password>');
    }
    console.log(line + '\n');
});

process.on('SIGINT', () => { try { saveKeys(); } catch (_) {} process.exit(0); });
process.on('SIGTERM', () => { try { saveKeys(); } catch (_) {} process.exit(0); });

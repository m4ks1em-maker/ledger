#!/usr/bin/env node
'use strict';
/*
 * DotaTraker gate: the local web app, behind an access key.
 *
 *   browser ──► gate (127.0.0.1:8080) ──► server.exe (127.0.0.1:8081)
 *                  │
 *                  └──► key server in the cloud (activate / check the key)
 *
 * - The key is checked against the DotaTraker key server (see /cloud). Keys are sold by the owner.
 * - One key works on a limited number of computers. The key server remembers which ones.
 * - If the internet drops, DotaTraker keeps working for a while (OFFLINE_GRACE) and checks again later.
 * - Zero npm dependencies. Needs Node 18+.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const { execFileSync, spawn } = require('child_process');
const { Worker } = require('worker_threads');

const ROOT = path.resolve(__dirname, '..');
const STATIC_DIR = path.join(ROOT, 'static');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = process.env.GATE_DATA_DIR ? path.resolve(process.env.GATE_DATA_DIR) : path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'config.json');
const LICENSE_FILE = path.join(DATA_DIR, 'license.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SYNC_FILE = path.join(DATA_DIR, 'sync.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ------------------------------------------------------------------ utils */

const now = () => Date.now();
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
function writeJsonAtomic(file, data) {
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
}
const PKG = readJson(path.join(ROOT, 'package.json'), {});
const VERSION = PKG.version || '2.0.0';
const ENGINE_REV = String(PKG.engineRev || '');

/* ----------------------------------------------------------------- config */

const DEFAULT_PRICES = [{ days: 7, usd: 1 }, { days: 30, usd: 2, tag: 'popular' }, { days: 90, usd: 5 }, { days: 365, usd: 15 }, { days: 0, usd: 30, tag: 'best' }];
const APP = Object.assign({ licenseServer: '', telegram: 'm4ks1em', github: 'https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder', prices: DEFAULT_PRICES,
    updateUrl: 'https://raw.githubusercontent.com/m4ks1em-maker/ledger---Dota-Report-FInder/main/package.json',
    updateArchive: 'https://github.com/m4ks1em-maker/ledger---Dota-Report-FInder/archive/refs/heads/main.tar.gz',
    engineBase: 'https://raw.githubusercontent.com/m4ks1em-maker/ledger---Dota-Report-FInder/engine/' },
    readJson(path.join(ROOT, 'ledger.config.json'), {}));
const LICENSE_SERVER = String(process.env.LICENSE_SERVER || APP.licenseServer || '').replace(/\/+$/, '');
const SERVER_CONFIGURED = /^https?:\/\/[^/]+/.test(LICENSE_SERVER) && !/CHANGE-ME|example\./i.test(LICENSE_SERVER);
let TELEGRAM = String(APP.telegram || 'm4ks1em').replace(/^@/, '');
let GITHUB = String(APP.github || '');

const SYNC_DEFAULTS = { enabled: false, source: 'opendota', steamId: '', everyMin: 10, limit: 10, turbo: false };
const settings = Object.assign({
    host: '127.0.0.1',            // loopback only: DotaTraker is a personal app
    port: 8080,
    upstream: 'http://127.0.0.1:8081',
    sessionDays: 30
}, readJson(SETTINGS_FILE, {}));
settings.sync = Object.assign({}, SYNC_DEFAULTS, settings.sync || {});
delete settings.secret; delete settings.adminHash; delete settings.viewerCanDownload;   // v1 leftovers

if (process.env.GATE_PORT) settings.port = Number(process.env.GATE_PORT);
if (process.env.GATE_HOST) settings.host = process.env.GATE_HOST;
if (process.env.UPSTREAM) settings.upstream = process.env.UPSTREAM;
const saveSettings = () => { try { writeJsonAtomic(SETTINGS_FILE, settings); } catch (e) { console.error('[gate] cannot save settings:', e.message); } };
saveSettings();

const OFFLINE_GRACE = 72 * HOUR;     // keep working this long without reaching the key server
const CHECK_EVERY = 10 * MIN;

/* --------------------------------------------------------- this computer */

// A stable id for this computer, so a key bought for one PC is not shared around.
// Same machine + same Windows user ⇒ same id, even after reinstalling DotaTraker.
function machineFingerprint() {
    const parts = [];
    try {
        if (process.platform === 'win32') {
            const out = execFileSync('reg', ['query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'], { encoding: 'utf8', timeout: 4000, windowsHide: true });
            const m = /MachineGuid\s+REG_\w+\s+([0-9a-fA-F-]{20,})/.exec(out);
            if (m) parts.push(m[1].toLowerCase());
        } else if (process.platform === 'darwin') {
            const out = execFileSync('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice'], { encoding: 'utf8', timeout: 4000 });
            const m = /"IOPlatformUUID"\s*=\s*"([^"]+)"/.exec(out);
            if (m) parts.push(m[1]);
        } else {
            for (const f of ['/etc/machine-id', '/var/lib/dbus/machine-id']) {
                try { const v = fs.readFileSync(f, 'utf8').trim(); if (v) { parts.push(v); break; } } catch (_) {}
            }
        }
    } catch (_) {}
    if (!parts.length) {
        const cpu = (os.cpus()[0] || {}).model || '';
        parts.push(os.hostname(), process.platform, os.arch(), cpu, String(Math.round(os.totalmem() / 1e9)));
    }
    try { parts.push(os.userInfo().username); } catch (_) {}
    return parts.join('|');
}
const DEVICE_ID = sha256('ledger-device-v1|' + machineFingerprint());
const DEVICE_NAME = (() => { try { return `${os.hostname()} (${process.platform === 'win32' ? 'Windows' : os.type()})`.slice(0, 60); } catch (_) { return 'PC'; } })();

/* -------------------------------------------------------------- license */

// { token, license: { label, tail, status, expiresAt, maxDevices, devices, ... }, lastOk, lastCheck, offline, denied: { code, message, at } }
let lic = Object.assign({ token: '', license: null, lastOk: 0, lastCheck: 0, offline: false, denied: null }, readJson(LICENSE_FILE, {}));
const saveLicense = () => { try { writeJsonAtomic(LICENSE_FILE, lic); } catch (e) { console.error('[gate] cannot save license:', e.message); } };

function licenseProblem() {
    if (!lic.token || !lic.license) return lic.denied ? lic.denied.code : 'none';
    if (lic.license.expiresAt && lic.license.expiresAt <= now()) return 'expired';
    if (now() - (lic.lastOk || 0) > OFFLINE_GRACE) return 'offline';
    return null;
}

const DENY_TEXT = {
    invalid: 'Invalid key',
    revoked: 'This key was revoked.',
    expired: 'This key has expired.',
    devices: 'This key is already used on another computer.',
    unknown: 'This computer was signed out of that key. Enter it again.',
    offline: 'Cannot reach the key server. Check your internet connection.',
    locked: 'Too many attempts. Try again in 15 min.',
    setup: 'The key server address is not set in ledger.config.json.'
};

// Steam identity fields sent to the key server with activate/check, so chat
// can show the player's Steam nick + avatar and bind them to the key.
function steamFields() {
    const s = settings.steam;
    if (!s || !s.id) return {};
    return { steam: s.id, steamName: s.name || undefined, steamAvatar: s.avatar || undefined };
}

async function keyServer(pathname, payload, timeoutMs = 15000) {
    const r = await fetch(LICENSE_SERVER + pathname, {
        method: payload ? 'POST' : 'GET',
        headers: Object.assign({ 'User-Agent': `DotaTraker/${VERSION}` }, payload ? { 'Content-Type': 'application/json' } : {}),
        body: payload ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(timeoutMs)
    });
    let j = {};
    try { j = await r.json(); } catch (_) {}
    return { status: r.status, body: j };
}

function forgetLicense(code, message) {
    lic.token = '';
    lic.denied = code ? { code, message: message || DENY_TEXT[code] || 'Signed out.', at: now() } : null;
    if (code !== 'unknown' && lic.license && code) lic.license.status = code;
    saveLicense();
    sessions.clear(); saveSessions();
}

let checking = null;
function checkLicense() {
    if (!SERVER_CONFIGURED || !lic.token) return Promise.resolve();
    if (checking) return checking;
    checking = (async () => {
        lic.lastCheck = now();
        try {
            const { status, body } = await keyServer('/v1/check', Object.assign({ token: lic.token, device: DEVICE_ID, app: VERSION }, steamFields()));
            if (status === 200 && body.ok) {
                lic.license = body.license; lic.lastOk = now(); lic.offline = false; lic.denied = null;
                saveLicense();
            } else if ((status === 401 || status === 403) && body.code) {
                console.log(`[gate] key refused by the server: ${body.code}`);
                forgetLicense(body.code, body.error);
            } else {
                lic.offline = true; saveLicense();
            }
        } catch (_) {
            lic.offline = true; saveLicense();
        } finally { checking = null; }
    })();
    return checking;
}
setInterval(() => { checkLicense(); }, CHECK_EVERY).unref();
setInterval(() => { if (lic.token && lic.license && lic.license.expiresAt && lic.license.expiresAt <= now()) checkLicense(); }, MIN).unref();

async function refreshInfo() {
    if (!SERVER_CONFIGURED) return;
    try {
        const { status, body } = await keyServer('/v1/info', null, 8000);
        if (status === 200 && body.telegram) { TELEGRAM = String(body.telegram).replace(/^@/, '').slice(0, 40); if (body.github) GITHUB = String(body.github).slice(0, 200); }
    } catch (_) {}
}

/* ---------------------------------------------------------------- sessions */

const COOKIE = 'ledger_sid';
const sessions = new Map(); // sha256(sid) -> { created, expires, ua }
(readJson(SESSIONS_FILE, []) || []).forEach(([h, s]) => { if (s && s.expires > now()) sessions.set(h, s); });
let sessTimer = null;
function saveSessions() {
    clearTimeout(sessTimer);
    sessTimer = setTimeout(() => { try { writeJsonAtomic(SESSIONS_FILE, [...sessions.entries()]); } catch (_) {} }, 300);
}
function openSession(req) {
    const sid = b64url(crypto.randomBytes(32));
    const exp = now() + Math.max(1, settings.sessionDays) * DAY;
    sessions.set(sha256(sid), { created: now(), expires: exp, ua: String(req.headers['user-agent'] || '').slice(0, 120) });
    saveSessions();
    return { sid, exp };
}
function parseCookies(req) {
    const out = {};
    String(req.headers.cookie || '').split(';').forEach((p) => {
        const i = p.indexOf('=');
        if (i > 0) { try { out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (_) {} }
    });
    return out;
}
function getSession(req) {
    const sid = parseCookies(req)[COOKIE];
    if (!sid) return null;
    const h = sha256(sid);
    const s = sessions.get(h);
    if (!s) return null;
    if (s.expires <= now()) { sessions.delete(h); saveSessions(); return null; }
    return Object.assign({ hash: h }, s);
}
setInterval(() => { let gone = false; for (const [h, s] of sessions) if (s.expires <= now()) { sessions.delete(h); gone = true; } if (gone) saveSessions(); }, 10 * MIN).unref();

function setSessionCookie(res, sid, exp) {
    const maxAge = Math.max(0, Math.floor((exp - now()) / 1000));
    res.setHeader('Set-Cookie', `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`);
}
const clearSessionCookie = (res) => res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);

/* ------------------------------------------------------------ rate limiting */

const fails = new Map(); // ip -> [timestamps]
const WINDOW = 10 * MIN, MAX_FAILS = 8;
const clientIp = (req) => req.socket.remoteAddress || 'unknown';
function lockedFor(ip) {
    const list = (fails.get(ip) || []).filter((t) => now() - t < WINDOW);
    fails.set(ip, list);
    // unlocked once the oldest of the last MAX_FAILS attempts leaves the window
    if (list.length >= MAX_FAILS) return Math.ceil((WINDOW - (now() - list[list.length - MAX_FAILS])) / 1000);
    return 0;
}
const noteFail = (ip) => { const l = fails.get(ip) || []; l.push(now()); fails.set(ip, l); };
setInterval(() => { for (const [ip, l] of fails) if (!l.some((t) => now() - t < WINDOW)) fails.delete(ip); }, MIN).unref();

/* ------------------------------------------------------------------ http */

const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.webp': 'image/webp'
};
const PAGE_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob: https://*.steamstatic.com https://*.akamaihd.net; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

function baseHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
}
function sendJson(res, status, obj, extra) {
    const body = JSON.stringify(obj);
    res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store' }, extra || {}));
    res.end(body);
}
function sendFile(req, res, file, { page = false } = {}) {
    fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
        const ext = path.extname(file).toLowerCase();
        // HTML must never be cached, or a stale page keeps pointing at old ?v= assets after an update.
        const cache = (page || ext === '.html') ? 'no-store, must-revalidate' : 'no-cache';
        const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': buf.length, 'Cache-Control': cache };
        if (page) headers['Content-Security-Policy'] = PAGE_CSP;
        res.writeHead(200, headers);
        res.end(req.method === 'HEAD' ? undefined : buf);
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
    if (!o || o === 'null') return !o;
    try { return new URL(o).host === req.headers.host; } catch (_) { return false; }
}
const isUnsafe = (m) => m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS';

// Only answer to names that point at this computer. Stops DNS-rebinding pages on the internet from talking to DotaTraker.
const EXTRA_HOSTS = String(process.env.ALLOWED_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
function hostAllowed(req) {
    const host = String(req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
    if (!host) return false;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost')) return true;
    if (settings.host !== '127.0.0.1' && settings.host !== 'localhost' && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    return EXTRA_HOSTS.includes(host);
}

function safeJoin(dir, rel) {
    let decoded;
    try { decoded = decodeURIComponent(rel); } catch (_) { return null; }
    if (decoded.includes('\0')) return null;
    const full = path.normalize(path.join(dir, decoded));
    return full.startsWith(dir + path.sep) || full === dir ? full : null;
}

function upstreamDown(req, res) {
    if (String(req.url).startsWith('/api/')) return sendJson(res, 502, { error: 'The replay engine is not running. Close DotaTraker and open start.bat again.', code: 'engine' });
    res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset="utf-8"><title>Engine offline</title><body style="font:15px system-ui;background:#0b1020;color:#eaf0ff;display:grid;place-items:center;height:100vh;margin:0"><div><h2 style="font-weight:600">The replay engine is not running</h2><p style="color:#a3adc7">Close DotaTraker and open start.bat again.</p></div>');
}

function proxy(req, res) {
    const up = new URL(settings.upstream);
    const headers = Object.assign({}, req.headers);
    delete headers.cookie;                        // never forward the gate session
    delete headers.origin; delete headers.referer;
    headers.host = up.host;
    const pr = http.request({ hostname: up.hostname, port: up.port || 80, path: req.url, method: req.method, headers }, (ur) => {
        const h = Object.assign({}, ur.headers);
        delete h['set-cookie'];
        delete h['access-control-allow-origin'];
        if ((ur.headers['content-type'] || '').includes('text/event-stream')) h['x-accel-buffering'] = 'no';
        res.writeHead(ur.statusCode, h);
        ur.pipe(res);
    });
    pr.on('error', () => { if (!res.headersSent) upstreamDown(req, res); else res.end(); });
    res.on('close', () => pr.destroy());
    req.pipe(pr);
}

/* ------------------------------------------------- talking to the engine */

function engine(method, apiPath, body, timeoutMs) {
    return new Promise((resolve, reject) => {
        const up = new URL(settings.upstream);
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

function writable(dir) {
    try {
        fs.mkdirSync(dir, { recursive: true });
        const probe = path.join(dir, '.ledger-write-test');
        fs.writeFileSync(probe, ''); fs.rmSync(probe, { force: true });
        return true;
    } catch (_) { return false; }
}
// The engine does not remember its settings between runs, so the gate does: the folder picked in
// Settings is saved in gate/data/config.json and handed to the engine whenever it starts.
// With nothing picked and Dota's default folder missing or read-only, <DotaTraker>/replays is used.
let replayDirCache = { at: 0, dir: null };
async function replayDir() {
    if (replayDirCache.dir && now() - replayDirCache.at < 30000) return replayDirCache.dir;
    const cfg = await engine('GET', '/api/config');
    let dir = cfg && typeof cfg.replayDir === 'string' ? cfg.replayDir : '';
    const chosen = typeof settings.replayDir === 'string' ? settings.replayDir : '';
    if (chosen) {
        if (dir !== chosen) { await engine('POST', '/api/config', { replayDir: chosen }); dir = chosen; }
    } else if (!dir || !fs.existsSync(dir) || !writable(path.join(dir, 'uploads'))) {
        const fallback = path.join(ROOT, 'replays');
        fs.mkdirSync(path.join(fallback, 'uploads'), { recursive: true });
        if (dir !== fallback) {
            await engine('POST', '/api/config', { replayDir: fallback });
            console.log(`[gate] replay folder: ${fallback}`);
        }
        dir = fallback;
    }
    replayDirCache = { at: now(), dir };
    return dir;
}
// Settings → "Replay folder" goes through here so the choice survives a restart.
async function configApi(req, res) {
    let body;
    try { body = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Bad request' }); }
    if (typeof body.replayDir === 'string' && body.replayDir.trim()) {
        settings.replayDir = body.replayDir.trim().slice(0, 500);
        saveSettings();
        replayDirCache = { at: 0, dir: null };
    }
    try { return sendJson(res, 200, await engine('POST', '/api/config', body)); }
    catch (e) { return sendJson(res, 502, { error: 'The replay engine is not running.' }); }
}
setTimeout(async function warm(tries = 0) {
    try { await replayDir(); } catch (_) { if (tries < 20) setTimeout(() => warm(tries + 1), 3000).unref(); }
}, 1500).unref();


/* ------------------------------------------------- running the engine */
// server.exe and bot.exe live in ./engine. DotaTraker starts them, restarts them if they crash and stops
// them on exit. The engine gets its own folder with a tiny static page, so opening :8081 directly
// only redirects to the gate: the app itself is served here, behind the key.

const ENGINE_DIR = path.join(ROOT, 'engine');
const engineExe = (n) => path.join(ENGINE_DIR, process.platform === 'win32' ? n + '.exe' : n);
const children = new Set();
let shuttingDown = false;

function portOpen(host, port) {
    return new Promise((resolve) => {
        const sock = net.connect({ host, port: Number(port) });
        const done = (v) => { sock.destroy(); resolve(v); };
        sock.setTimeout(800, () => done(false));
        sock.once('connect', () => done(true));
        sock.once('error', () => done(false));
    });
}
function ensureDecoy() {
    const dir = path.join(ENGINE_DIR, 'static');
    const file = path.join(dir, 'index.html');
    const html = `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=http://localhost:${settings.port}/"><title>DotaTraker</title><body style="font:15px system-ui;background:#110b07;color:#eaf0ff;display:grid;place-items:center;height:100vh;margin:0"><a style="color:#e3a46f" href="http://localhost:${settings.port}/">Open DotaTraker</a>`;
    try { fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== html) fs.writeFileSync(file, html); } catch (_) {}
}
function supervise(name, file, extraEnv) {
    let restarts = 0;
    const run = () => {
        if (shuttingDown) return;
        let errFd = 'ignore';
        try { errFd = fs.openSync(path.join(DATA_DIR, name + '.log'), 'w'); } catch (_) {}
        const child = spawn(file, [], { cwd: ENGINE_DIR, env: Object.assign({}, process.env, extraEnv || {}), windowsHide: true, stdio: ['ignore', 'ignore', errFd] });
        if (typeof errFd === 'number') fs.close(errFd, () => {});
        const startedAt = now();
        children.add(child);
        child.once('error', (e) => console.error(`[gate] could not start ${name}: ${e.message}`));
        child.once('exit', (code) => {
            children.delete(child);
            replayDirCache = { at: 0, dir: null };
            if (shuttingDown) return;
            if (now() - startedAt > 5 * MIN) restarts = 0;
            restarts++;
            if (restarts > 6) { console.error(`[gate] ${name} keeps stopping (exit ${code}). See gate/data/${name}.log`); return; }
            console.log(`[gate] ${name} stopped (exit ${code}), starting it again…`);
            setTimeout(() => { run(); setTimeout(() => replayDir().catch(() => {}), 2500).unref(); }, Math.min(30000, 1500 * restarts)).unref();
        });
    };
    run();
}
function engineRevNow() { try { return fs.readFileSync(path.join(ENGINE_DIR, 'engine-rev.txt'), 'utf8').trim(); } catch (_) { return ''; } }
function winPortOwner(port) {
    try {
        const ps = `$c=Get-NetTCPConnection -LocalPort ${Number(port)} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if($c){ $p=Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; Write-Output ([string]$c.OwningProcess + '|' + $p.Path) }`;
        const out = execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { windowsHide: true, timeout: 20000 }).toString().trim();
        const [pid, file] = out.split('|');
        return pid && /^\d+$/.test(pid) ? { pid: Number(pid), path: file || '' } : null;
    } catch (_) { return null; }
}
async function startEngine() {
    if (process.env.LEDGER_NO_ENGINE === '1') return;
    const up = new URL(settings.upstream);
    if (!/^(127\.0\.0\.1|localhost)$/.test(up.hostname)) return;
    // an engine left running (often from an older DotaTraker folder) would keep the old parser: replace it
    if (process.platform === 'win32' && fs.existsSync(engineExe('server'))) {
        let killed = false;
        for (const port of [Number(up.port || 80), 8082]) {
            const o = winPortOwner(port);
            if (o && /\\(server|bot)\.exe$/i.test(o.path)) {
                console.log(`  Engine:  stopping the engine already running on port ${port} (${o.path})`);
                try { execFileSync('taskkill', ['/PID', String(o.pid), '/F'], { windowsHide: true, stdio: 'ignore', timeout: 15000 }); killed = true; } catch (_) {}
            }
        }
        if (killed) await sleep(1500);
    }
    if (fs.existsSync(engineExe('server')) && !(await portOpen(up.hostname, up.port || 80))) await ensureEngine();
    if (await portOpen(up.hostname, up.port || 80)) { console.log('  Engine:  already running (not started by DotaTraker, it may be an old version)'); return; }
    console.log(`  Engine:  ${engineRevNow() === ENGINE_REV ? 'up to date (parser manta 1.5.1)' : 'OLD version, could not update: see the message above'}`);
    if (!fs.existsSync(engineExe('server'))) {
        console.log('  ! The replay engine is missing. Run setup.bat first.');
        return;
    }
    ensureDecoy();
    if (fs.existsSync(engineExe('bot'))) { supervise('bot', engineExe('bot'), { BOT_PORT: '8082' }); await sleep(1200); }
    supervise('server', engineExe('server'));
}
function stopEngine() {
    shuttingDown = true;
    for (const c of children) { try { c.kill(); } catch (_) {} }
}

/* ----------------------------------------------------- replay uploads */

const MAX_UPLOAD = 700 * 1024 * 1024;
async function uploadReplay(req, res, url) {
    const name = String(url.searchParams.get('name') || '');
    if (!/^[0-9A-Za-z_-]{1,60}\.dem$/.test(name)) return sendJson(res, 400, { error: 'Only .dem files with a simple name.' });
    const len = Number(req.headers['content-length'] || 0);
    if (!len || len > MAX_UPLOAD) return sendJson(res, 413, { error: 'File is empty or larger than 700 MB.' });
    let dir;
    try { dir = await replayDir(); } catch (_) { return sendJson(res, 502, { error: 'The replay engine is not running.' }); }
    const target = path.join(dir, 'uploads');
    if (!writable(target)) return sendJson(res, 500, { error: 'Cannot write to the replay folder. Pick another folder in Settings.' });
    const finalPath = path.join(target, name);
    const tmp = finalPath + '.' + crypto.randomBytes(4).toString('hex') + '.part';
    let received = 0, head = Buffer.alloc(0), bad = null;
    const out = fs.createWriteStream(tmp);
    await new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        out.on('error', () => { bad = bad || 'disk'; req.resume(); finish(); });
        req.on('data', (c) => {
            received += c.length;
            if (bad) return;                                  // keep draining so the client can read our answer
            if (head.length < 8) head = Buffer.concat([head, c]).subarray(0, 8);
            if (received > MAX_UPLOAD) { bad = 'size'; out.destroy(); req.destroy(); return finish(); }
            if (head.length >= 7 && head.subarray(0, 7).toString('latin1') !== 'PBDEMS2') { bad = 'type'; out.destroy(); return; }
            if (!out.write(c)) { req.pause(); out.once('drain', () => req.resume()); }
        });
        req.on('end', () => { if (bad) finish(); else out.end(finish); });
        req.on('error', () => { bad = bad || 'net'; out.destroy(); finish(); });
        req.on('close', () => { if (!req.complete) { bad = bad || 'net'; out.destroy(); finish(); } });
    });
    if (bad || received !== len) {
        fs.rm(tmp, { force: true }, () => {});
        const msg = bad === 'type' ? 'That is not a Dota 2 replay.' : bad === 'disk' ? 'Could not save the file. Is the disk full?' : 'Upload was interrupted.';
        if (!res.headersSent && !res.destroyed) return sendJson(res, 400, { error: msg });
        return;
    }
    try { fs.renameSync(tmp, finalPath); } catch (_) { fs.rm(tmp, { force: true }, () => {}); return sendJson(res, 500, { error: 'Could not save the file.' }); }
    return sendJson(res, 201, { ok: true, path: 'uploads/' + name });
}

/* ------------------------------------------- OpenDota mode (no Steam login) */
// Looks a player up on OpenDota and downloads the replay straight from Valve's replay servers.

const OD_BASE = (process.env.OPENDOTA_BASE || 'https://api.opendota.com/api').replace(/\/+$/, '');
const OD_KEY = process.env.OPENDOTA_KEY || '';
const REPLAY_TEMPLATES = process.env.REPLAY_URL_TEMPLATES
    ? process.env.REPLAY_URL_TEMPLATES.split(',')
    : ['http://replay{c}.valve.net/570/{m}_{s}.dem.bz2', 'http://replay{c}.steamcontent.com/570/{m}_{s}.dem.bz2'];
const MAX_BZ2 = 300 * 1024 * 1024, MAX_STORE = 8 * 1024 * 1024 * 1024;
const STEAM64 = 76561197960265728n;

function accountId(v) {
    const s = String(v == null ? '' : v).trim();
    const m = /^\[?U:1:(\d+)\]?$/i.exec(s);
    try {
        let n; if (m) n = BigInt(m[1]); else if (/^\d{1,20}$/.test(s)) n = BigInt(s); else return null;
        if (n >= STEAM64) n -= STEAM64;
        return n > 0n && n < 4294967296n ? n.toString() : null;
    } catch (_) { return null; }
}

function httpGet(urlStr, { timeout = 20000, onHead, onData, hops = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let u; try { u = new URL(urlStr); } catch (_) { return reject(new Error('bad url')); }
        const lib = u.protocol === 'https:' ? https : http;
        const r = lib.get(u, { timeout, headers: { 'User-Agent': `DotaTraker/${VERSION} (+replay report viewer)`, Accept: '*/*' } }, (ur) => {
            if (ur.statusCode >= 300 && ur.statusCode < 400 && ur.headers.location) {
                ur.resume();
                if (hops > 4) return reject(Object.assign(new Error('too many redirects'), { status: ur.statusCode }));
                let next; try { next = new URL(ur.headers.location, u).href; } catch (_) { return reject(new Error('bad redirect')); }
                return httpGet(next, { timeout, onHead, onData, hops: (hops || 0) + 1 }).then(resolve, reject);
            }
            if (ur.statusCode !== 200) { ur.resume(); return reject(Object.assign(new Error('HTTP ' + ur.statusCode), { status: ur.statusCode })); }
            if (onHead) { try { onHead(ur); } catch (e) { ur.destroy(); return reject(e); } }
            ur.on('data', (c) => { try { if (onData) onData(c); } catch (e) { ur.destroy(); reject(e); } });
            ur.on('end', resolve); ur.on('error', reject); ur.on('aborted', () => reject(new Error('connection dropped')));
        });
        r.on('timeout', () => r.destroy(new Error('timed out')));
        r.on('error', reject);
    });
}
async function odJson(p, timeout, method) {
    const sep = p.includes('?') ? '&' : '?';
    const url = OD_BASE + p + (OD_KEY ? `${sep}api_key=${encodeURIComponent(OD_KEY)}` : '');
    let last;
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const buf = await fetchBuf(url, { method: method || 'GET', timeout: timeout || 20000, max: 20 * 1024 * 1024, headers: { Accept: 'application/json' } });
            return JSON.parse(buf.toString('utf8'));
        } catch (e) {
            last = e;
            if (e.status && e.status !== 429 && e.status < 500) throw e;     // 404 and friends: no point retrying
            await sleep(e.status === 429 ? 4000 * (attempt + 1) : 1500 * (attempt + 1));
        }
    }
    throw last;
}

let heroCache = { at: 0, map: {} };
async function heroNames() {
    if (now() - heroCache.at < 12 * HOUR && Object.keys(heroCache.map).length) return heroCache.map;
    try { const list = await odJson('/heroes'); const map = {}; list.forEach((h) => { map[h.id] = h.localized_name; }); heroCache = { at: now(), map }; } catch (_) {}
    return heroCache.map;
}
const playerCache = new Map();   // acc -> { at, data }
async function odPlayer(acc) {
    const c = playerCache.get(acc);
    if (c && now() - c.at < 5 * MIN) return c.data;
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

function dirSize(dir) { let t = 0; try { for (const f of fs.readdirSync(dir)) { try { t += fs.statSync(path.join(dir, f)).size; } catch (_) {} } } catch (_) {} return t; }
// Everything we already have, as matchId -> path relative to the replay folder.
async function replayIndex() {
    const out = new Map();
    try {
        const dir = await replayDir();
        for (const f of fs.readdirSync(path.join(dir, 'uploads'))) { const m = /^(\d+)\.dem$/.exec(f); if (m) out.set(m[1], 'uploads/' + f); }
    } catch (_) {}
    try {
        for (const r of (await engine('GET', '/api/replays?t=' + now())) || []) {
            const m = /^(\d+)\.dem$/.exec(String(r.fileName || ''));
            if (m && !out.has(m[1])) out.set(m[1], r.fileName);
        }
    } catch (_) {}
    return out;
}

const jobs = new Map();            // id -> job
const jobQueue = [];
let jobsRunning = 0;
const MAX_JOBS = 2;
function publicJob(j) { return { id: j.id, matchId: j.matchId, state: j.state, progress: j.progress, error: j.error || null, code: j.code || null, path: j.state === 'done' ? j.path : null }; }
function failJob(j, code, msg) { j.state = 'error'; j.code = code; j.error = msg; }

function unpack(src, dst) {
    return new Promise((resolve) => {
        const w = new Worker(path.join(__dirname, 'bz2-worker.js'), { workerData: { src, dst, maxBytes: MAX_UPLOAD } });
        let settled = false;
        const done = (v) => { if (!settled) { settled = true; resolve(v); } };
        w.once('message', done);
        w.once('error', () => done({ ok: false, code: 'corrupt', error: 'The downloaded file was damaged.' }));
        w.once('exit', () => done({ ok: false, code: 'corrupt', error: 'The downloaded file was damaged.' }));
    });
}

async function runJob(j) {
    const tmpFiles = [];
    try {
        const dir = await replayDir();
        const target = path.join(dir, 'uploads'); fs.mkdirSync(target, { recursive: true });
        const finalPath = path.join(target, j.matchId + '.dem');
        const have = (await replayIndex()).get(j.matchId);
        if (have) { j.state = 'done'; j.progress = 100; j.path = have; return; }
        if (dirSize(target) > MAX_STORE) return failJob(j, 'full', 'The replay library is full (8 GB). Delete some replays first.');

        j.state = 'looking'; j.progress = 2;
        const od = (p, t, m) => odJson(p, t, m).catch((e) => { throw Object.assign(e, { od: true }); });
        const hasSalt = (i) => i && Number(i.cluster) > 0 && /^\d{1,12}$/.test(String(i.replay_salt || ''));
        let info = await od('/matches/' + j.matchId, 25000);
        if (!hasSalt(info)) {
            // fresh matches: OpenDota learns the replay address only after a parse request
            j.state = 'requesting'; j.progress = 3;
            let jobId = null;
            try { const rq = await od('/request/' + j.matchId, 20000, 'POST'); jobId = rq && rq.job && rq.job.jobId; } catch (_) {}
            const until = now() + 150000;
            let tick = 0;
            while (now() < until && !hasSalt(info)) {
                await sleep(5000); tick++;
                let finished = !jobId;
                if (jobId) { try { const st = await odJson('/request/' + jobId, 15000); if (st && st.state === 'failed') break; finished = !st; } catch (_) {} }
                if (finished || tick % 3 === 0) { try { info = await odJson('/matches/' + j.matchId, 20000); } catch (_) {} }
                j.progress = Math.min(4, j.progress + 0.05);
            }
        }
        if (!hasSalt(info)) return failJob(j, 'expired', 'OpenDota could not get this replay from Valve (too old, or not available yet). Upload the .dem file instead.');
        const cluster = Number(info.cluster), salt = String(info.replay_salt);

        j.state = 'downloading';
        const bz = path.join(target, j.matchId + '.' + crypto.randomBytes(3).toString('hex') + '.dem.bz2.part'); tmpFiles.push(bz);
        let ok = false, lastErr = null;
        const urls = REPLAY_TEMPLATES.map((tpl) => tpl.replace('{c}', String(cluster)).replace('{m}', j.matchId).replace('{s}', salt));
        if (info.replay_url && /^https?:\/\/replay\d+\.(valve\.net|steamcontent\.com|wmsj\.cn)\//.test(info.replay_url)) urls.unshift(info.replay_url);
        for (const url of [...new Set(urls)]) {
            const out = fs.createWriteStream(bz); let got = 0, total = 0, diskErr = null;
            out.on('error', (e) => { diskErr = e; });
            try {
                await httpGet(url, {
                    timeout: 30000,
                    onHead: (ur) => { total = Number(ur.headers['content-length'] || 0); if (total > MAX_BZ2) throw new Error('file too large'); },
                    onData: (c) => { got += c.length; if (got > MAX_BZ2) throw new Error('file too large'); if (diskErr) throw diskErr; out.write(c); if (total) j.progress = 5 + Math.round((got / total) * 70); }
                });
                await new Promise((r, rej) => out.end((e) => (e || diskErr ? rej(e || diskErr) : r())));
                ok = true; break;
            } catch (e) { lastErr = e; out.destroy(); }
        }
        if (!ok) {
            const gone = lastErr && lastErr.status === 404;
            return failJob(j, gone ? 'expired' : 'download', gone ? 'Valve no longer keeps this replay. Upload the .dem file instead.' : 'Could not download the replay (' + (lastErr ? lastErr.message : 'unknown') + ').');
        }

        j.state = 'unpacking'; j.progress = 80;
        tmpFiles.push(finalPath + '.part');
        const r = await unpack(bz, finalPath);
        if (!r.ok) return failJob(j, r.code, r.error);
        j.state = 'done'; j.progress = 100; j.path = 'uploads/' + j.matchId + '.dem';
    } catch (e) {
        console.error('[gate] replay job', j.matchId, e && e.message);
        failJob(j, e && e.od ? 'opendota' : 'internal', e && e.od ? 'OpenDota did not answer (' + (e.status ? 'HTTP ' + e.status : e.message) + '). Try again in a minute.' : 'Something went wrong while fetching the replay: ' + (e && e.message));
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
    for (const j of jobs.values()) if (j.matchId === matchId && !j.done) return j;
    const j = { id: crypto.randomBytes(6).toString('hex'), matchId, state: 'queued', progress: 0, created: now() };
    jobs.set(j.id, j); jobQueue.push(j);
    if (jobs.size > 300) for (const [k, v] of jobs) { if (v.done && now() - v.done > 10 * MIN) jobs.delete(k); }
    pumpJobs();
    return j;
}

let heroListCache = { at: 0, list: [] };
async function heroList() {
    if (now() - heroListCache.at < 12 * HOUR && heroListCache.list.length) return heroListCache.list;
    const list = await odJson('/heroes');
    const out = (Array.isArray(list) ? list : []).map((h) => ({
        id: h.id, name: h.name, localized: h.localized_name,
        short: String(h.name || '').replace('npc_dota_hero_', ''),
        attr: h.primary_attr, roles: h.roles || []
    })).filter((h) => h.id && h.short);
    if (out.length) heroListCache = { at: now(), list: out };
    return heroListCache.list;
}
const matchupCache = new Map();   // heroId -> { at, rows }
async function heroMatchups(id) {
    const c = matchupCache.get(id);
    if (c && now() - c.at < 6 * HOUR) return c.rows;
    const rows = await odJson('/heroes/' + id + '/matchups', 25000);
    const r = Array.isArray(rows) ? rows : [];
    matchupCache.set(id, { at: now(), rows: r });
    if (matchupCache.size > 250) matchupCache.delete(matchupCache.keys().next().value);
    return r;
}
async function playerProfile(acc) {
    const [p, wl, recent] = await Promise.all([
        odJson('/players/' + acc, 20000).catch(() => ({})),
        odJson('/players/' + acc + '/wl', 20000).catch(() => ({ win: 0, lose: 0 })),
        odJson('/players/' + acc + '/recentMatches', 20000).catch(() => [])
    ]);
    const heroes = await heroNames().catch(() => ({}));
    const prof = (p && p.profile) || {};
    const rec = (Array.isArray(recent) ? recent : []).slice(0, 20).map((m) => {
        const isRad = m.player_slot < 128;
        return {
            id: String(m.match_id), hero: heroes[m.hero_id] || ('Hero ' + m.hero_id), heroId: m.hero_id,
            k: m.kills, d: m.deaths, a: m.assists, gpm: m.gold_per_min, xpm: m.xp_per_min,
            lh: m.last_hits, dur: m.duration, win: isRad ? !!m.radiant_win : !m.radiant_win, start: m.start_time
        };
    });
    const n = rec.length || 1;
    const sum = (f) => rec.reduce((t, m) => t + (Number(m[f]) || 0), 0);
    const wins = rec.filter((m) => m.win).length;
    const heroCount = {};
    rec.forEach((m) => { heroCount[m.heroId] = (heroCount[m.heroId] || 0) + 1; });
    const topHeroes = Object.entries(heroCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([hid, c]) => ({ heroId: Number(hid), hero: heroes[hid] || ('Hero ' + hid), games: c }));
    const totalGames = (wl.win || 0) + (wl.lose || 0);
    return {
        account: acc, name: prof.personaname || ('Player ' + acc), avatar: prof.avatarfull || '',
        rankTier: p.rank_tier || null, leaderboard: p.leaderboard_rank || null,
        wins: wl.win || 0, losses: wl.lose || 0, totalGames,
        winRate: totalGames ? Math.round((wl.win / totalGames) * 1000) / 10 : null,
        recent: rec,
        avg: {
            kda: Math.round(((sum('k') + sum('a')) / Math.max(1, sum('d'))) * 100) / 100,
            k: Math.round(sum('k') / n * 10) / 10, d: Math.round(sum('d') / n * 10) / 10, a: Math.round(sum('a') / n * 10) / 10,
            gpm: Math.round(sum('gpm') / n), xpm: Math.round(sum('xpm') / n), lh: Math.round(sum('lh') / n),
            recentWR: Math.round((wins / n) * 1000) / 10, n: rec.length
        },
        topHeroes
    };
}

async function odApi(req, res, url, pathname) {
    if (pathname === '/_ledger/od/player' && req.method === 'GET') {
        const acc = accountId(url.searchParams.get('id'));
        if (!acc) return sendJson(res, 400, { error: 'That does not look like a Steam ID.' });
        let matches;
        try { matches = await odPlayer(acc); } catch (e) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
        const index = await replayIndex();
        return sendJson(res, 200, { account: acc, matches: matches.map((m) => Object.assign({}, m, { have: index.has(m.id), path: index.get(m.id) || null })) });
    }
    if (pathname === '/_ledger/od/fetch' && req.method === 'POST') {
        const b = await readBody(req, 1024);
        const id = String(b.matchId || '');
        if (!/^\d{6,12}$/.test(id)) return sendJson(res, 400, { error: 'Bad match ID.' });
        return sendJson(res, 202, publicJob(enqueue(id)));
    }
    if (pathname === '/_ledger/od/job' && req.method === 'GET') {
        const j = jobs.get(String(url.searchParams.get('id') || ''));
        return j ? sendJson(res, 200, publicJob(j)) : sendJson(res, 404, { error: 'Unknown job' });
    }
    if (pathname === '/_ledger/od/heroes' && req.method === 'GET') {
        try { return sendJson(res, 200, { heroes: await heroList() }, { 'Cache-Control': 'private, max-age=3600' }); }
        catch (_) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
    }
    if (pathname === '/_ledger/od/matchups' && req.method === 'GET') {
        const id = Number(url.searchParams.get('hero'));
        if (!(id > 0 && id < 500)) return sendJson(res, 400, { error: 'Bad hero id.' });
        try { return sendJson(res, 200, { hero: id, matchups: await heroMatchups(id) }); }
        catch (_) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
    }
    if (pathname === '/_ledger/od/profile' && req.method === 'GET') {
        const acc = accountId(url.searchParams.get('id'));
        if (!acc) return sendJson(res, 400, { error: 'That does not look like a Steam ID.' });
        try { return sendJson(res, 200, await playerProfile(acc)); }
        catch (_) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
    }
    if (pathname === '/_ledger/od/match' && req.method === 'GET') {
        const id = String(url.searchParams.get('id') || '');
        if (!/^\d{6,12}$/.test(id)) return sendJson(res, 400, { error: 'Bad match ID.' });
        try {
            const m = await odJson('/matches/' + id, 15000);
            return sendJson(res, 200, {
                matchId: id,
                duration: m && m.duration != null ? m.duration : null,
                radiantWin: m && typeof m.radiant_win === 'boolean' ? m.radiant_win : null,
                radiantScore: m && m.radiant_score != null ? m.radiant_score : null,
                direScore: m && m.dire_score != null ? m.dire_score : null,
                startTime: m && m.start_time != null ? m.start_time : null
            }, { 'Cache-Control': 'private, max-age=86400' });
        } catch (_) { return sendJson(res, 502, { error: 'OpenDota did not answer. Try again in a minute.' }); }
    }
    if (pathname === '/_ledger/od/heroimg' && (req.method === 'GET' || req.method === 'HEAD')) {
        const h = String(url.searchParams.get('h') || '').toLowerCase();
        if (!/^[a-z0-9_]{1,40}$/.test(h)) { res.writeHead(400); return res.end(); }
        try {
            const buf = await fetchBuf('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/' + h + '.png', { timeout: 12000, max: 2 * 1024 * 1024 });
            res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=604800' });
            return res.end(req.method === 'HEAD' ? undefined : buf);
        } catch (_) { res.writeHead(404); return res.end(); }
    }
    return sendJson(res, 404, { error: 'Not found' });
}

/* --------------------------------------------------- auto-sync of matches */

const syncState = Object.assign({ lastRun: 0, lastOk: null, message: 'Off', downloadedTotal: 0, recent: [] }, readJson(SYNC_FILE, {}), { running: false });
const saveSync = () => { try { writeJsonAtomic(SYNC_FILE, syncState); } catch (_) {} };

async function syncTick(reason) {
    if (syncState.running) return;
    const c = settings.sync;
    syncState.running = true; syncState.lastRun = now();
    try {
        const acc = accountId(c.steamId);
        if (!acc) throw new Error('Set a Steam ID first');
        let todo = [], got = 0, expired = 0;
        if (c.source !== 'steam') {
            playerCache.delete(acc);
            const list = (await odPlayer(acc)).slice(0, c.limit);
            const have = await replayIndex();
            todo = list.map((m) => m.id).filter((id) => !have.has(id)).slice(0, 5);
            for (const id of todo) {
                syncState.message = `Downloading ${id}…`;
                const j = enqueue(id);
                while (j.state !== 'done' && j.state !== 'error') await sleep(700);
                if (j.state === 'done') { got++; syncState.recent.unshift({ id, t: now() }); }
                else if (j.code === 'expired') expired++;
            }
        } else {
            const st = await engine('GET', '/api/steam/status');
            if (st.status !== 3 && st.status !== 4) throw new Error('Steam is not connected');
            const steam64 = (BigInt(acc) + STEAM64).toString();
            const hist = await engine('GET', `/api/history?steamId=${steam64}&limit=${c.limit}${c.turbo ? '&turboOnly=true' : ''}`, null, 60000);
            const have = await replayIndex();
            todo = (hist || []).map((m) => String(m.id)).filter((id) => /^\d+$/.test(id) && !have.has(id)).slice(0, 5);
            for (const id of todo) {
                syncState.message = `Downloading ${id}…`;
                try {
                    const r = await engine('POST', '/api/download', { matchId: Number(id), profileName: '' }, 10 * MIN);
                    if (r && r.success) { got++; syncState.recent.unshift({ id, t: now() }); }
                } catch (_) {}
            }
        }
        syncState.recent = syncState.recent.slice(0, 20);
        syncState.downloadedTotal += got; syncState.lastOk = now();
        syncState.message = got ? `Downloaded ${got} new match${got > 1 ? 'es' : ''}` : (todo.length ? (expired === todo.length ? 'Replays expired on Valve servers' : 'Nothing could be downloaded') : 'Up to date');
    } catch (e) {
        syncState.message = String(e.message || e).slice(0, 140);
    } finally {
        syncState.running = false; saveSync();
    }
}
setInterval(() => {
    const c = settings.sync;
    if (!c.enabled || syncState.running || licenseProblem()) return;
    if (now() - syncState.lastRun >= Math.max(1, c.everyMin) * MIN - 2000) syncTick('timer');
}, 30000).unref();

function syncApi(req, res) {
    if (req.method === 'GET') return sendJson(res, 200, { config: settings.sync, state: syncState, serverTime: now() });
    return readBody(req).then((b) => {
        if (b.action === 'run') { syncTick('manual'); return sendJson(res, 200, { ok: true, config: settings.sync, state: syncState }); }
        const c = settings.sync;
        if (b.source != null) c.source = b.source === 'steam' ? 'steam' : 'opendota';
        if (b.steamId != null) {
            const v = String(b.steamId).trim();
            if (v && !accountId(v)) return sendJson(res, 400, { error: 'That does not look like a Steam ID.' });
            c.steamId = v;
        }
        if (b.everyMin != null) c.everyMin = [5, 10, 15, 30, 60].includes(Number(b.everyMin)) ? Number(b.everyMin) : 10;
        if (b.limit != null) c.limit = [5, 10, 20].includes(Number(b.limit)) ? Number(b.limit) : 10;
        if (b.turbo != null) c.turbo = !!b.turbo;
        if (b.enabled != null) { c.enabled = !!b.enabled; if (c.enabled) { syncState.lastRun = 0; syncState.message = 'Starting…'; } else syncState.message = 'Off'; }
        saveSettings(); saveSync();
        return sendJson(res, 200, { config: c, state: syncState });
    });
}

/* ------------------------------------------------------ downloads helper */

async function fetchBuf(urlStr, { timeout = 30000, max = 5 * 1024 * 1024, method = 'GET', body, headers } = {}) {
    const r = await fetch(urlStr, {
        method, body, redirect: 'follow', signal: AbortSignal.timeout(timeout),
        headers: Object.assign({ 'User-Agent': `DotaTraker/${VERSION}` }, headers || {})
    });
    if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });
    const len = Number(r.headers.get('content-length') || 0);
    if (len && len > max) throw new Error('too large');
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > max) throw new Error('too large');
    return buf;
}
function writeFileAtomic(file, buf) {
    const tmp = file + '.part';
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, file);
}

/* ------------------------------------------------- patched replay engine */
// The stock engine ships manta v1.5.0, which stops on replays from Dota build 6951+ with
// "nextByte: insufficient buffer". Our build (branch "engine") has manta v1.5.1. It is fetched
// once per engineRev from package.json, so a new engine reaches everyone with a normal update.

async function ensureEngine() {
    if (process.platform !== 'win32' || !ENGINE_REV) return;
    const marker = path.join(ENGINE_DIR, 'engine-rev.txt');
    let cur = '';
    try { cur = fs.readFileSync(marker, 'utf8').trim(); } catch (_) {}
    if (cur === ENGINE_REV) return;
    console.log('  Engine:  downloading the updated replay parser…');
    const names = ['server.exe', 'bot.exe'];
    try {
        fs.mkdirSync(ENGINE_DIR, { recursive: true });
        for (const n of names) {
            const buf = await fetchBuf(APP.engineBase + n + '?rev=' + encodeURIComponent(ENGINE_REV), { timeout: 180000, max: 120 * 1024 * 1024 });
            if (buf.length < 1024 * 1024 || buf[0] !== 0x4d || buf[1] !== 0x5a) throw new Error('bad file ' + n);
            writeFileAtomic(path.join(ENGINE_DIR, n + '.new'), buf);
        }
        for (const n of names) fs.renameSync(path.join(ENGINE_DIR, n + '.new'), path.join(ENGINE_DIR, n));
        fs.writeFileSync(marker, ENGINE_REV);
        console.log('  Engine:  updated');
    } catch (e) {
        for (const n of names) { try { fs.unlinkSync(path.join(ENGINE_DIR, n + '.new')); } catch (_) {} }
        console.log(`  ! Could not update the engine (${e.message}). The current one keeps working; will try again next start.`);
    }
}

/* ------------------------------------------------------------- app update */
// Checks package.json on GitHub. "Update" downloads the main branch, copies it over this folder
// (keeps gate/data, engine and replays) and exits with code 75: start.bat starts DotaTraker again.

const update = { latest: null, notes: '', checkedAt: 0, state: 'idle', error: null };
function newer(a, b) {
    const pa = String(a || '').split('.').map((n) => parseInt(n, 10) || 0), pb = String(b || '').split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < 3; i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); }
    return false;
}
async function checkUpdate() {
    if (!APP.updateUrl || process.env.DOTATRAKER_NO_UPDATE === '1') return;
    try {
        // GitHub API first (fresh within a minute), raw.githubusercontent as a fallback (cached up to 5 min)
        let j = null;
        const api = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/.exec(APP.updateUrl);
        if (api) {
            try { j = JSON.parse((await fetchBuf(`https://api.github.com/repos/${api[1]}/${api[2]}/contents/${api[4]}?ref=${api[3]}`, { timeout: 15000, max: 64 * 1024, headers: { Accept: 'application/vnd.github.raw+json' } })).toString('utf8')); } catch (_) { j = null; }
        }
        if (!j) j = JSON.parse((await fetchBuf(APP.updateUrl + '?t=' + now(), { timeout: 15000, max: 64 * 1024 })).toString('utf8'));
        if (j && /^\d+\.\d+\.\d+$/.test(j.version || '')) {
            update.latest = j.version;
            update.notes = String(j.releaseNotes || '').slice(0, 600);
            update.notesRu = String(j.releaseNotesRu || '').slice(0, 600);
        }
        update.checkedAt = now();
        if (updateView()) console.log(`  Update:  DotaTraker ${update.latest} is out. Open the app and press "Update".`);
    } catch (_) {}
}
function updateView() {
    if (!update.latest || !newer(update.latest, VERSION)) return null;
    return { version: update.latest, notes: update.notes, notesRu: update.notesRu, state: update.state, error: update.error, auto: process.platform === 'win32' || process.env.DOTATRAKER_SELF_UPDATE === '1' };
}
setInterval(() => { checkUpdate(); }, 10 * MIN).unref();

const KEEP = new Set(['gate/data', 'engine', 'replays', 'uploads', 'cloud', '.git', 'node_modules']);
function copyTree(src, dst, rel = '') {
    let n = 0;
    for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
        const r = rel ? rel + '/' + ent.name : ent.name;
        if (KEEP.has(r)) continue;
        const s = path.join(src, ent.name), d = path.join(dst, ent.name);
        if (ent.isDirectory()) { fs.mkdirSync(d, { recursive: true }); n += copyTree(s, d, r); continue; }
        if (!ent.isFile()) continue;
        const buf = fs.readFileSync(s);
        let same = false;
        try { same = fs.readFileSync(d).equals(buf); } catch (_) {}
        if (same) continue;                       // never rewrite unchanged files (start.bat is running)
        writeFileAtomic(d, buf); n++;
    }
    return n;
}
async function selfUpdate() {
    if (update.state === 'downloading' || update.state === 'installing' || update.state === 'restarting') return;
    update.state = 'downloading'; update.error = null;
    let tmp;
    try {
        tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dotatraker-'));
        const tgz = path.join(tmp, 'src.tar.gz');
        fs.writeFileSync(tgz, await fetchBuf(APP.updateArchive + '?t=' + now(), { timeout: 120000, max: 80 * 1024 * 1024 }));
        update.state = 'installing';
        const winTar = process.env.SystemRoot ? path.join(process.env.SystemRoot, 'System32', 'tar.exe') : '';
        const tar = winTar && fs.existsSync(winTar) ? winTar : 'tar';
        execFileSync(tar, ['-xzf', 'src.tar.gz'], { cwd: tmp, windowsHide: true, stdio: 'ignore', timeout: 120000 });
        const dir = fs.readdirSync(tmp, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(tmp, e.name))
            .find((d) => fs.existsSync(path.join(d, 'package.json')) && fs.existsSync(path.join(d, 'gate', 'gate.js')));
        if (!dir) throw new Error('archive looks wrong');
        const pkg = readJson(path.join(dir, 'package.json'), {});
        if (!/^\d+\.\d+\.\d+$/.test(pkg.version || '')) throw new Error('archive has no version');
        const changed = copyTree(dir, ROOT);
        console.log(`[gate] updated to ${pkg.version} (${changed} files). Restarting…`);
        update.state = 'restarting';
        setTimeout(() => restart(), 900);
    } catch (e) {
        update.state = 'error'; update.error = e.message;
        console.error('[gate] update failed:', e.message);
    } finally {
        if (tmp) { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {} }
    }
}
function restart() {
    try { writeJsonAtomic(SESSIONS_FILE, [...sessions.entries()]); } catch (_) {}
    stopEngine();
    process.env.LEDGER_OPEN = '0';
    if (process.env.DOTATRAKER_LOOP === '1') return setTimeout(() => process.exit(75), 400);
    // started without the start.bat loop: start a fresh copy of ourselves, then leave
    setTimeout(() => {
        try {
            server.close();
            const child = spawn(process.execPath, [path.join(__dirname, 'gate.js')], { cwd: ROOT, stdio: 'inherit', env: Object.assign({}, process.env, { LEDGER_OPEN: '0' }) });
            child.on('exit', (c) => process.exit(c || 0));
        } catch (_) { process.exit(75); }
    }, 600);
}

/* ------------------------------------------------------- Steam sign-in */
// Official Steam OpenID: the user signs in on steamcommunity.com, Steam sends back a signed
// SteamID, and we ask Steam to confirm the signature. DotaTraker never sees a password.

const STEAM_OP = 'https://steamcommunity.com/openid/login';
const steamStates = new Map();   // state -> { at, from }
const AVATAR_FILE = path.join(DATA_DIR, 'steam-avatar.jpg');
const originOf = (req) => `http://${String(req.headers.host || ('localhost:' + settings.port))}`;

function steamStart(req, res, url) {
    for (const [k, v] of steamStates) if (now() - v.at > 10 * MIN) steamStates.delete(k);
    if (steamStates.size > 50) steamStates.clear();
    const state = b64url(crypto.randomBytes(18));
    steamStates.set(state, { at: now(), from: url.searchParams.get('from') === 'app' ? 'app' : 'login' });
    const origin = originOf(req);
    const q = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': `${origin}/_ledger/steam/return?state=${state}`,
        'openid.realm': origin,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });
    res.writeHead(302, { Location: `${STEAM_OP}?${q}`, 'Cache-Control': 'no-store' });
    res.end();
}
async function steamProfile(id) {
    const xml = (await fetchBuf(`https://steamcommunity.com/profiles/${id}/?xml=1`, { timeout: 12000, max: 512 * 1024 })).toString('utf8');
    const tag = (t) => { const m = new RegExp(`<${t}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*</${t}>`).exec(xml); return m ? (m[1] != null ? m[1] : m[2] || '').trim() : ''; };
    return { name: tag('steamID').slice(0, 64), avatar: tag('avatarFull') || tag('avatarMedium') };
}
// Older sign-ins stored no public avatar URL. Fetch it once so chat can show the Steam picture
// without the player having to sign in with Steam again.
async function refreshSteamAvatar() {
    try {
        if (!settings.steam || !settings.steam.id || settings.steam.avatar) return;
        const prof = await steamProfile(settings.steam.id);
        if (prof && prof.avatar) { settings.steam.avatar = prof.avatar; if (prof.name && !settings.steam.name) settings.steam.name = prof.name; saveSettings(); }
    } catch (_) {}
}
async function steamReturn(req, res, url) {
    const p = url.searchParams;
    const st = steamStates.get(p.get('state') || '');
    steamStates.delete(p.get('state') || '');
    const go = (where) => { res.writeHead(302, { Location: where, 'Cache-Control': 'no-store' }); res.end(); };
    const back = (code) => go((st && st.from === 'app' ? '/?steam=' : '/login?steam=') + code);
    if (!st || now() - st.at > 10 * MIN) return back('expired');
    if (p.get('openid.mode') !== 'id_res') return back('cancel');
    const origin = originOf(req);
    const m = /^https:\/\/steamcommunity\.com\/openid\/id\/(7656119\d{10})$/.exec(p.get('openid.claimed_id') || '');
    if (!m || p.get('openid.op_endpoint') !== STEAM_OP || !String(p.get('openid.return_to') || '').startsWith(`${origin}/_ledger/steam/return?`)) return back('fail');
    try {
        const form = new URLSearchParams();
        for (const [k, v] of p) if (k.startsWith('openid.')) form.set(k, v);
        form.set('openid.mode', 'check_authentication');
        const txt = (await fetchBuf(STEAM_OP, { method: 'POST', body: form.toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000, max: 64 * 1024 })).toString('utf8');
        if (!/^is_valid\s*:\s*true\s*$/m.test(txt)) return back('fail');
    } catch (_) { return back('offline'); }

    const id = m[1];
    const prof = await steamProfile(id).catch(() => ({ name: '', avatar: '' }));
    settings.steam = { id, name: prof.name || id, avatar: prof.avatar || '', at: now() };
    if (!settings.sync.steamId) settings.sync.steamId = id;
    saveSettings();
    try {
        if (prof.avatar && /^https:\/\/[a-z0-9.-]+\.(steamstatic|akamaihd)\.(com|net)\//.test(prof.avatar)) {
            const img = await fetchBuf(prof.avatar, { timeout: 12000, max: 1024 * 1024 });
            fs.mkdirSync(DATA_DIR, { recursive: true }); writeFileAtomic(AVATAR_FILE, img);
        } else { fs.rmSync(AVATAR_FILE, { force: true }); }
    } catch (_) {}

    // a working key on this PC + the same Steam account = signed in
    if (lic.token && !licenseProblem()) {
        if (lic.steamId && lic.steamId !== id) return back('other');
        if (!lic.steamId) { lic.steamId = id; saveLicense(); }
        if (!getSession(req)) { const { sid, exp } = openSession(req); setSessionCookie(res, sid, exp); }
        return go('/?steam=ok');
    }
    return back('ok');
}
function steamView() {
    if (!settings.steam || !settings.steam.id) return null;
    return { id: settings.steam.id, name: settings.steam.name || settings.steam.id, avatar: fs.existsSync(AVATAR_FILE) ? '/_ledger/steam/avatar?v=' + (settings.steam.at || 0) : '' };
}

/* ------------------------------------------------------------- login API */

function meView() {
    const l = lic.license || {};
    return {
        label: l.label || '', tail: l.tail || '', status: l.status || '', expiresAt: l.expiresAt || null,
        activatedAt: l.activatedAt || null, maxDevices: l.maxDevices || 1, devices: l.devices || 1,
        offline: !!lic.offline, lastOk: lic.lastOk || 0, telegram: TELEGRAM, github: GITHUB, version: VERSION, serverTime: now(),
        steam: steamView(), update: updateView(), engine: { rev: engineRevNow(), want: ENGINE_REV }
    };
}

async function login(req, res) {
    const ip = clientIp(req);
    const wait = lockedFor(ip);
    if (wait) return sendJson(res, 429, { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.`, code: 'locked' }, { 'Retry-After': String(wait) });
    if (!SERVER_CONFIGURED) return sendJson(res, 503, { error: DENY_TEXT.setup, code: 'setup' });

    let body;
    try { body = await readBody(req, 2048); } catch (_) { return sendJson(res, 400, { error: 'Bad request' }); }
    const raw = String(body.key || '').trim();
    const norm = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^LDG/, '');
    if (norm.length !== 16) { noteFail(ip); return sendJson(res, 401, { error: DENY_TEXT.invalid, code: 'invalid' }); }

    let r;
    try {
        r = await keyServer('/v1/activate', Object.assign({ key: raw, device: DEVICE_ID, name: DEVICE_NAME, app: VERSION }, steamFields()));
    } catch (_) {
        return sendJson(res, 502, { error: DENY_TEXT.offline, code: 'offline' });
    }
    if (r.status === 200 && r.body.ok && r.body.token) {
        lic = { token: r.body.token, license: r.body.license, lastOk: now(), lastCheck: now(), offline: false, denied: null, steamId: (settings.steam && settings.steam.id) || '' };
        saveLicense();
        const { sid, exp } = openSession(req);
        setSessionCookie(res, sid, exp);
        refreshInfo();
        return sendJson(res, 200, { ok: true, license: meView() });
    }
    const code = r.body.code || (r.status === 429 ? 'locked' : 'offline');
    if (code === 'invalid') { noteFail(ip); await sleep(300); }
    return sendJson(res, r.status >= 400 && r.status < 600 ? r.status : 502, { error: r.body.error || DENY_TEXT[code] || 'Could not sign in.', code });
}

/* ---------------------------------------------------------------- router */

async function handle(req, res) {
    baseHeaders(res);
    if (!hostAllowed(req)) { res.writeHead(421, { 'Content-Type': 'text/plain' }); return res.end('Open DotaTraker at http://localhost:' + settings.port); }
    const url = new URL(req.url, 'http://gate');
    const pathname = url.pathname;
    const method = req.method;

    if (isUnsafe(method) && !sameOrigin(req)) return sendJson(res, 403, { error: 'Cross-site request blocked' });

    // ---- public
    if (pathname === '/favicon.ico' || pathname === '/favicon.svg' || pathname === '/favicon.png') return sendFile(req, res, path.join(STATIC_DIR, 'img', 'logo-64.png'));
    if (pathname === '/login' && (method === 'GET' || method === 'HEAD')) {
        if (getSession(req) && !licenseProblem()) { res.writeHead(302, { Location: '/' }); return res.end(); }
        return sendFile(req, res, path.join(PUBLIC_DIR, 'login.html'), { page: true });
    }
    if (pathname === '/_ledger/login' && method === 'POST') return login(req, res);
    if (pathname === '/_ledger/info' && method === 'GET') {
        const problem = licenseProblem();
        return sendJson(res, 200, {
            telegram: TELEGRAM, github: GITHUB, configured: SERVER_CONFIGURED, version: VERSION,
            problem: problem === 'none' ? null : problem,
            denied: lic.denied, label: lic.license ? lic.license.label : '', offline: !!lic.offline,
            prices: Array.isArray(APP.prices) ? APP.prices.slice(0, 8) : DEFAULT_PRICES, steam: steamView(), update: updateView()
        });
    }
    if (pathname === '/_ledger/update' && method === 'POST') {
        if (!updateView()) { await checkUpdate(); if (!updateView()) return sendJson(res, 200, { ok: true, update: null }); }
        if (!updateView().auto) return sendJson(res, 400, { error: 'Download the update from GitHub.' });
        selfUpdate();
        return sendJson(res, 202, { ok: true, update: updateView() });
    }
    if (pathname === '/_ledger/update' && method === 'GET') return sendJson(res, 200, { update: updateView(), version: VERSION });
    if (pathname.startsWith('/_ledger/chat/') && method === 'POST') {
        const sub = pathname.slice('/_ledger/chat/'.length);
        if (!['history', 'send', 'nick', 'moderate'].includes(sub)) { res.writeHead(404); return res.end(); }
        if (!SERVER_CONFIGURED) return sendJson(res, 503, { error: DENY_TEXT.setup, code: 'setup' });
        if (!lic.token) return sendJson(res, 401, { error: 'Enter your key first.', code: 'unknown' });
        let b = {};
        try { b = await readBody(req); } catch (_) { return sendJson(res, 400, { error: 'Bad request' }); }
        try {
            const payload = Object.assign({}, b, { token: lic.token, device: DEVICE_ID });
            const { status, body } = await keyServer('/v1/chat/' + sub, payload, 12000);
            return sendJson(res, status, body);
        } catch (_) {
            return sendJson(res, 502, { error: 'Cannot reach the chat server.', code: 'offline' });
        }
    }
    if (pathname === '/_ledger/steam/start' && method === 'GET') return steamStart(req, res, url);
    if (pathname === '/_ledger/steam/return' && method === 'GET') return steamReturn(req, res, url);
    if (pathname === '/_ledger/steam/avatar' && (method === 'GET' || method === 'HEAD')) {
        if (!fs.existsSync(AVATAR_FILE)) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', 'image/jpeg'); res.setHeader('Cache-Control', 'private, max-age=86400');
        return res.end(method === 'HEAD' ? undefined : fs.readFileSync(AVATAR_FILE));
    }
    if (pathname.startsWith('/gate/') && (method === 'GET' || method === 'HEAD')) {
        const f = safeJoin(PUBLIC_DIR, pathname.slice('/gate/'.length));
        if (f && ['.css', '.js', '.svg', '.png', '.woff2'].includes(path.extname(f))) return sendFile(req, res, f);
        res.writeHead(404); return res.end('Not found');
    }
    if ((/^\/(style\.css|fonts\.css|i18n\.js|ui\.js|favicon\.svg)$/.test(pathname) || /^\/fonts\/[a-z0-9-]+\.woff2$/.test(pathname) || /^\/img\/[a-z0-9-]+\.(webp|png)$/.test(pathname)) && (method === 'GET' || method === 'HEAD')) {
        return sendFile(req, res, path.join(STATIC_DIR, pathname.slice(1)));
    }

    // ---- everything below needs a session and a working key
    const session = getSession(req);
    const problem = licenseProblem();
    if (!session || problem) {
        if (session && problem && problem !== 'offline') { sessions.delete(session.hash); saveSessions(); }
        if (pathname.startsWith('/api/') || pathname.startsWith('/_ledger/')) return sendJson(res, 401, { error: 'Sign in required', code: problem || 'signin' });
        res.writeHead(302, { Location: '/login' });
        return res.end();
    }
    if (lic.token && now() - (lic.lastCheck || 0) > CHECK_EVERY) checkLicense();

    if (pathname === '/_ledger/me' && method === 'GET') return sendJson(res, 200, meView());
    if (pathname === '/_ledger/me/refresh' && method === 'POST') { await checkLicense(); return licenseProblem() ? sendJson(res, 401, { error: 'Sign in required', code: licenseProblem() }) : sendJson(res, 200, meView()); }
    if (pathname === '/_ledger/logout' && method === 'POST') {
        sessions.delete(session.hash); saveSessions();
        if (url.searchParams.get('forget') !== '0') { lic.token = ''; lic.denied = null; saveLicense(); }
        clearSessionCookie(res);
        return sendJson(res, 200, { ok: true });
    }
    if (pathname === '/_ledger/steam/unlink' && method === 'POST') {
        delete settings.steam; saveSettings(); try { fs.rmSync(AVATAR_FILE, { force: true }); } catch (_) {}
        return sendJson(res, 200, { ok: true });
    }
    if (pathname === '/_ledger/sync') { try { return await syncApi(req, res); } catch (_) { return sendJson(res, 400, { error: 'Bad request' }); } }
    if (pathname === '/_ledger/upload' && method === 'POST') return uploadReplay(req, res, url);
    if (pathname.startsWith('/_ledger/od/')) { try { return await odApi(req, res, url, pathname); } catch (e) { return sendJson(res, 400, { error: 'Bad request' }); } }
    if (pathname.startsWith('/_ledger/')) return sendJson(res, 404, { error: 'Not found' });

    // ---- the app
    if (pathname === '/api/config' && method === 'POST') return configApi(req, res);
    if (pathname.startsWith('/api/')) return proxy(req, res);

    if (method === 'GET' || method === 'HEAD') {
        const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
        const f = safeJoin(STATIC_DIR, rel);
        if (f && fs.existsSync(f) && fs.statSync(f).isFile()) return sendFile(req, res, f, { page: path.extname(f) === '.html' });
        if (/^\/assets\//.test(pathname)) return proxy(req, res);    // hero portraits come from the engine
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
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
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') console.error(`\n  Port ${settings.port} is busy. Is DotaTraker already open? Close the other window or set GATE_PORT.\n`);
    else console.error('[gate]', e.message);
    process.exit(1);
});

server.listen(settings.port, settings.host, () => {
    const line = '─'.repeat(58);
    console.log('\n' + line);
    console.log(`  DotaTraker ${VERSION} is running`);
    console.log(`  Open:  http://localhost:${settings.port}`);
    if (!SERVER_CONFIGURED) console.log('\n  ! Key server is not set. Put its address into ledger.config.json');
    else if (lic.license && lic.token) console.log(`  Key:   ${lic.license.label || '…' + (lic.license.tail || '')}`);
    console.log(line + '\n');
    refreshInfo();
    setTimeout(() => checkLicense(), 1500).unref();
    setTimeout(() => { refreshSteamAvatar().then(() => checkLicense()); }, 2500).unref();
    setTimeout(() => checkUpdate(), 4000).unref();
    startEngine().then(() => {
        if (process.platform === 'win32' && process.env.LEDGER_OPEN !== '0') {
            try { spawn('cmd', ['/c', 'start', '', `http://localhost:${settings.port}/`], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch (_) {}
        }
    });
});

const bye = () => { try { writeJsonAtomic(SESSIONS_FILE, [...sessions.entries()]); } catch (_) {} stopEngine(); process.exit(0); };
['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'].forEach((sig) => { try { process.on(sig, bye); } catch (_) {} });
process.on('exit', stopEngine);

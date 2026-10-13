#!/usr/bin/env node
// One-time setup and every later update of the Ledger key server on Cloudflare (free plan).
//   1. signs you in to Cloudflare (browser window)
//   2. creates the D1 database and writes its id into wrangler.toml
//   3. deploys the worker
//   4. sets the admin password (first run, or with --password)
//   5. writes the server address into ../ledger.config.json, which the Ledger app reads
'use strict';
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DIR = __dirname;
const TOML = path.join(DIR, 'wrangler.toml');
const APP_CONFIG = path.join(DIR, '..', 'ledger.config.json');
const STATE = path.join(DIR, '.deployed.json');
const isWin = process.platform === 'win32';
const npx = isWin ? 'npx.cmd' : 'npx';

function run(args, { input, quiet } = {}) {
    const r = spawnSync(npx, ['wrangler', ...args], { cwd: DIR, encoding: 'utf8', input, shell: isWin, stdio: [input == null ? 'inherit' : 'pipe', 'pipe', 'pipe'] });
    const out = (r.stdout || '') + (r.stderr || '');
    if (!quiet) process.stdout.write(out);
    return { code: r.status, out };
}
function runLive(args) {
    // shows wrangler's own prompts (e.g. "pick a workers.dev subdomain") and still captures the output
    return new Promise((resolve) => {
        const p = spawn(npx, ['wrangler', ...args], { cwd: DIR, shell: isWin, stdio: ['inherit', 'pipe', 'pipe'] });
        let out = '';
        p.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
        p.stderr.on('data', (d) => { out += d; process.stderr.write(d); });
        p.on('close', (code) => resolve({ code, out }));
    });
}
function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}
const say = (s) => console.log('\n  ' + s + '\n');

(async () => {
    say('Ledger key server: setup / update');

    // 1. Cloudflare account
    let who = run(['whoami'], { quiet: true });
    if (/not authenticated|You are not logged in/i.test(who.out)) {
        say('Sign in to Cloudflare in the browser window that opens (a free account is enough).');
        const r = await runLive(['login']);
        if (r.code !== 0) { say('Cloudflare sign-in failed. Run this again.'); process.exit(1); }
    }

    // 2. database
    let toml = fs.readFileSync(TOML, 'utf8');
    if (/database_id = "0{8}-/.test(toml)) {
        say('Creating the database (D1)…');
        let id = null;
        const c = run(['d1', 'create', 'ledger-keys']);
        let m = /database_id\s*[=:]\s*"?([0-9a-f-]{36})/i.exec(c.out);
        if (m) id = m[1];
        if (!id) {
            const l = run(['d1', 'list', '--json'], { quiet: true });
            try { const db = JSON.parse(l.out.slice(l.out.indexOf('['))).find((d) => d.name === 'ledger-keys'); if (db) id = db.uuid; } catch (_) {}
        }
        if (!id) { say('Could not create or find the D1 database "ledger-keys". Check the messages above.'); process.exit(1); }
        toml = toml.replace(/database_id = "[^"]*"/, `database_id = "${id}"`);
        fs.writeFileSync(TOML, toml);
        console.log('  Database id saved to wrangler.toml');
    }

    // 3. deploy
    say('Deploying the key server…');
    const d = await runLive(['deploy']);
    if (d.code !== 0) { say('Deploy failed. Read the messages above, fix and run again.'); process.exit(1); }
    const url = (/(https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev)/i.exec(d.out) || [])[1];

    // 4. admin password
    const state = (() => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch (_) { return {}; } })();
    const wantPw = process.argv.includes('--password') || !state.passwordSet;
    if (wantPw) {
        let pw = '';
        while (pw.length < 8) {
            pw = await ask('  Admin password for /admin (8+ characters, write it down): ');
            if (pw.length < 8) console.log('  Too short.');
        }
        const s = run(['secret', 'put', 'ADMIN_PASSWORD'], { input: pw + '\n', quiet: true });
        if (s.code !== 0) { console.log(s.out); say('Could not save the password. Run: npx wrangler secret put ADMIN_PASSWORD'); }
        else { state.passwordSet = true; console.log('  Admin password saved.'); }
    }

    // 5. tell the app where the server is
    if (url) {
        const cfg = (() => { try { return JSON.parse(fs.readFileSync(APP_CONFIG, 'utf8')); } catch (_) { return {}; } })();
        if (cfg.licenseServer !== url) {
            cfg.licenseServer = url;
            fs.writeFileSync(APP_CONFIG, JSON.stringify(cfg, null, 2) + '\n');
            console.log('  ledger.config.json now points at ' + url);
        }
        state.url = url;
    }
    state.deployedAt = new Date().toISOString();
    fs.writeFileSync(STATE, JSON.stringify(state, null, 2));

    say([
        'Done.',
        url ? `Site:   ${url}` : 'Site:   see the workers.dev address above',
        url ? `Admin:  ${url}/admin  (issue keys here)` : '',
        '',
        'Next: upload the changed ledger.config.json to GitHub so every new download talks to this server.'
    ].filter((l) => l !== null).join('\n  '));
})().catch((e) => { console.error(e); process.exit(1); });

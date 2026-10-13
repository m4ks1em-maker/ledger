// Copies the shared design files from ../static into public/shared before every deploy or dev run,
// so the key server's pages look exactly like the app.
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'static');
const dst = path.join(__dirname, 'public', 'shared');
fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(path.join(dst, 'fonts'), { recursive: true });
for (const f of ['style.css', 'fonts.css', 'ui.js', 'i18n.js', 'favicon.svg']) fs.copyFileSync(path.join(src, f), path.join(dst, f));
for (const f of fs.readdirSync(path.join(src, 'fonts'))) fs.copyFileSync(path.join(src, 'fonts', f), path.join(dst, 'fonts', f));
console.log('shared design files copied to public/shared');

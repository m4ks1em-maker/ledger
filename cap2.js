const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8103/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  try{ await p.click('text=RU',{timeout:1500}); }catch(e){}
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/claude-0/redesign/hud_home.png' });
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});

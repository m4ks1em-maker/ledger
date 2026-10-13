// Landing: pull the Telegram contact from the server so it can be changed without editing the page.
fetch('/v1/info').then((r) => r.json()).then((i) => {
    if (i.telegram) {
        document.getElementById('buy').href = 'https://t.me/' + encodeURIComponent(i.telegram);
        document.getElementById('buy-handle').textContent = '@' + i.telegram;
    }
    if (i.github) document.getElementById('gh').href = i.github;
}).catch(() => {});
try { document.documentElement.dataset.theme = localStorage.getItem('ledgerTheme') || 'dark'; } catch (_) {}

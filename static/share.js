// DotaTraker — match share card. Renders a premium PNG "who reported whom" from the
// current match verdict and lets the player download or share it.
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const btn = $('mv-share');
    if (!btn) return;

    const num = (id) => { const e = $(id); return e ? (parseInt(e.textContent, 10) || 0) : 0; };
    const text = (id) => { const e = $(id); return e ? (e.textContent || '').trim() : ''; };
    const matchId = () => { const e = document.querySelector('.match-meta-id b'); return e ? e.textContent.trim() : ''; };

    const DISP = "'Bricolage Grotesque','Unbounded',system-ui,sans-serif";
    const UI = "'Inter Tight',system-ui,sans-serif";

    function levelColor(n) {
        if (n === 0) return '#46d6a6';
        if (n <= 2) return '#e0965a';
        if (n <= 5) return '#ff9a5a';
        return '#ff5d6c';
    }

    function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    async function renderCard() {
        const W = 1200, H = 675, S = 2;
        const cv = document.createElement('canvas');
        cv.width = W * S; cv.height = H * S;
        const ctx = cv.getContext('2d');
        ctx.scale(S, S);

        const n = num('total-combined-reports');
        const f = num('total-friendly-reports');
        const e = num('total-enemy-reports');
        const verdict = text('mv-title') || '—';
        const id = matchId();
        const color = levelColor(n);

        // background
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0c0a09'); bg.addColorStop(1, '#141110');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        // ember glow behind the number
        const glow = ctx.createRadialGradient(W - 320, H / 2, 20, W - 320, H / 2, 360);
        glow.addColorStop(0, color + '33'); glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow; ctx.fillRect(W - 700, 0, 700, H);
        // hairline frame
        ctx.strokeStyle = 'rgba(255,228,196,.12)'; ctx.lineWidth = 2;
        roundRect(ctx, 24, 24, W - 48, H - 48, 28); ctx.stroke();

        // wordmark
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f6ece2'; ctx.font = '800 34px ' + DISP;
        ctx.fillText('DotaTraker', 64, 96);
        ctx.fillStyle = '#e0965a'; ctx.font = '800 15px ' + UI;
        ctx.fillText('О Т Ч Ё Т   П О   Р Е П О Р Т А М', 66, 124);

        // match id
        if (id) {
            ctx.fillStyle = '#8b7664'; ctx.font = '600 20px ' + UI;
            ctx.fillText('Матч #' + id, 66, 168);
        }

        // verdict big word (left/middle)
        ctx.fillStyle = color; ctx.font = '800 92px ' + DISP;
        const vy = 300;
        const words = verdict.split(' ');
        let line = '', lines = [];
        ctx.font = '800 92px ' + DISP;
        words.forEach((w) => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > 600 && line) { lines.push(line); line = w; } else line = t; });
        if (line) lines.push(line);
        lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 64, vy + i * 96));

        // teammates / enemies breakdown — anchored to the bottom-left so it never collides
        const teamY = H - 128, enemyY = H - 84;
        ctx.font = '700 30px ' + UI;
        ctx.fillStyle = '#46d6a6'; ctx.fillText('● ' + f, 66, teamY);
        ctx.fillStyle = '#9a8f82'; ctx.font = '600 24px ' + UI; ctx.fillText('от союзников', 66 + ctx.measureText('● ' + f).width + 14, teamY);
        ctx.font = '700 30px ' + UI; ctx.fillStyle = '#ff5d6c'; ctx.fillText('● ' + e, 66, enemyY);
        ctx.fillStyle = '#9a8f82'; ctx.font = '600 24px ' + UI; ctx.fillText('от врагов', 66 + ctx.measureText('● ' + e).width + 14, enemyY);

        // big gauge on the right
        const cx = W - 300, cyc = H / 2, R = 150;
        ctx.lineWidth = 16; ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,228,196,.08)';
        ctx.beginPath(); ctx.arc(cx, cyc, R, 0, Math.PI * 2); ctx.stroke();
        const frac = Math.min(n / 8, 1);
        ctx.strokeStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 24;
        ctx.beginPath(); ctx.arc(cx, cyc, R, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f6ece2'; ctx.textAlign = 'center'; ctx.font = '800 110px ' + DISP;
        ctx.fillText(String(n), cx, cyc + 28);
        ctx.fillStyle = '#8b7664'; ctx.font = '700 22px ' + UI; ctx.fillText('репортов', cx, cyc + 66);
        ctx.textAlign = 'left';

        // footer
        ctx.fillStyle = '#6b6158'; ctx.font = '600 18px ' + UI;
        ctx.fillText('Сгенерировано в DotaTraker · трекер репортов Dota 2', 66, H - 56);

        return new Promise((resolve) => cv.toBlob((b) => resolve(b), 'image/png'));
    }

    async function doShare() {
        btn.disabled = true;
        try {
            if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) {} }
            const blob = await renderCard();
            if (!blob) throw new Error('render');
            const id = matchId() || 'match';
            const file = new File([blob], 'dotatraker-' + id + '.png', { type: 'image/png' });

            // native share with the image, when the browser supports it
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try { await navigator.share({ files: [file], title: 'DotaTraker', text: 'Отчёт по репортам, матч #' + id }); btn.disabled = false; return; } catch (_) { /* fall through to download */ }
            }
            // otherwise download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            if (window.LedgerUI && LedgerUI.toast) LedgerUI.toast('Картинка сохранена', 'success');
        } catch (e) {
            if (window.LedgerUI && LedgerUI.toast) LedgerUI.toast('Не удалось создать картинку', 'error');
        }
        btn.disabled = false;
    }

    btn.addEventListener('click', doShare);
})();

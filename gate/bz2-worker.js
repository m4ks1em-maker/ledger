'use strict';
// Unpacks one .dem.bz2 off the main thread, so the gate keeps answering while a 100 MB replay is decoded.
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const bzip2 = require('./vendor/seek-bzip');

const { src, dst, maxBytes } = workerData;
try {
    const raw = bzip2.decode(fs.readFileSync(src));
    if (raw.length < 1024 || raw.subarray(0, 7).toString('latin1') !== 'PBDEMS2') {
        parentPort.postMessage({ ok: false, code: 'corrupt', error: 'That is not a Dota 2 replay.' });
    } else if (raw.length > maxBytes) {
        parentPort.postMessage({ ok: false, code: 'corrupt', error: 'The replay is too large.' });
    } else {
        const part = dst + '.part';
        fs.writeFileSync(part, raw);
        fs.renameSync(part, dst);
        parentPort.postMessage({ ok: true });
    }
} catch (e) {
    parentPort.postMessage({ ok: false, code: 'corrupt', error: 'The downloaded file was damaged.' });
}

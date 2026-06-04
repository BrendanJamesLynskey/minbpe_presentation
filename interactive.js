// ========== minbpe interactive demos ==========
// Faithful JS ports of get_stats + merge from minbpe/base.py, plus a
// UTF-8 byte viewer. Every getElementById is DOM-guarded with `if (!el) return;`.

// ----- get_stats: count consecutive pairs (base.py) -----
function getStats(ids) {
    const counts = new Map();
    for (let i = 0; i < ids.length - 1; i++) {
        const key = ids[i] + ',' + ids[i + 1];
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
}

// ----- merge: replace all occurrences of `pair` with `idx` (base.py) -----
function merge(ids, pair, idx) {
    const newids = [];
    let i = 0;
    while (i < ids.length) {
        if (ids[i] === pair[0] && i < ids.length - 1 && ids[i + 1] === pair[1]) {
            newids.push(idx);
            i += 2;
        } else {
            newids.push(ids[i]);
            i += 1;
        }
    }
    return newids;
}

// Render the bytes a token id expands to as a short printable label.
function bytesToLabel(byteList) {
    try {
        const dec = new TextDecoder('utf-8', { fatal: false });
        let s = dec.decode(new Uint8Array(byteList));
        s = s.replace(/\n/g, '↵').replace(/ /g, '␣');
        if (s.length === 0 || s.length > 6) return byteList.join(' ');
        return s;
    } catch (e) {
        return byteList.join(' ');
    }
}

// ========== UTF-8 byte viewer (Part 2) ==========
function updateUtf8() {
    const input = document.getElementById('utf8-input');
    const output = document.getElementById('utf8-output');
    const charsEl = document.getElementById('utf8-chars');
    const bytesEl = document.getElementById('utf8-bytes');
    if (!input || !output) return;

    const text = input.value;
    const bytes = Array.from(new TextEncoder().encode(text));
    output.innerHTML = '';

    // Walk code points, mapping each to its run of UTF-8 bytes.
    const enc = new TextEncoder();
    for (const ch of text) {
        const chBytes = Array.from(enc.encode(ch));
        const multi = chBytes.length > 1;
        for (let k = 0; k < chBytes.length; k++) {
            const box = document.createElement('div');
            box.className = 'byte-box' + (multi ? ' multi' : '');
            const c = document.createElement('span');
            c.className = 'b-char';
            // show the character only on its first byte; '·' for continuation bytes
            c.textContent = k === 0 ? (ch === ' ' ? '␣' : ch === '\n' ? '↵' : ch) : '·';
            const v = document.createElement('span');
            v.className = 'b-val';
            v.textContent = chBytes[k];
            box.appendChild(c);
            box.appendChild(v);
            output.appendChild(box);
        }
    }

    if (charsEl) charsEl.textContent = Array.from(text).length;
    if (bytesEl) bytesEl.textContent = bytes.length;
}

// ========== Live BPE tokeniser (Part 4) ==========
function updateBpe() {
    const input = document.getElementById('bpe-input');
    const slider = document.getElementById('bpe-merges');
    const mergesVal = document.getElementById('bpe-merges-val');
    const output = document.getElementById('bpe-output');
    const bytesEl = document.getElementById('bpe-bytes');
    const tokensEl = document.getElementById('bpe-tokens');
    const ratioEl = document.getElementById('bpe-ratio');
    const logEl = document.getElementById('bpe-log');
    if (!input || !slider || !output) return;

    const numMerges = parseInt(slider.value, 10);
    if (mergesVal) mergesVal.textContent = numMerges;

    // encode to UTF-8 bytes (the base tokens 0..255)
    let ids = Array.from(new TextEncoder().encode(input.value));
    const numBytes = ids.length;

    // vocab: id -> list of bytes it expands to
    const vocab = {};
    for (let b = 0; b < 256; b++) vocab[b] = [b];

    const learned = []; // {pair:[a,b], idx, count}
    for (let i = 0; i < numMerges; i++) {
        if (ids.length < 2) break;
        const stats = getStats(ids);
        // pick most frequent pair (max by count); ties: first seen
        let bestKey = null, bestCount = -1;
        for (const [key, count] of stats) {
            if (count > bestCount) { bestCount = count; bestKey = key; }
        }
        if (!bestKey || bestCount < 1) break;
        const pair = bestKey.split(',').map(Number);
        const idx = 256 + i;
        ids = merge(ids, pair, idx);
        vocab[idx] = vocab[pair[0]].concat(vocab[pair[1]]);
        learned.push({ pair, idx, count: bestCount });
    }

    // render token chips
    output.innerHTML = '';
    for (const id of ids) {
        const chip = document.createElement('div');
        chip.className = 'token-chip ' + (id >= 256 ? 'merge-tok' : 'byte-tok');

        const charSpan = document.createElement('span');
        charSpan.className = 'token-char';
        charSpan.textContent = bytesToLabel(vocab[id]);

        const idSpan = document.createElement('span');
        idSpan.className = 'token-id';
        idSpan.textContent = id;

        chip.appendChild(charSpan);
        chip.appendChild(idSpan);
        output.appendChild(chip);
    }

    // stats
    if (bytesEl) bytesEl.textContent = numBytes;
    if (tokensEl) tokensEl.textContent = ids.length;
    if (ratioEl) {
        const ratio = ids.length > 0 ? (numBytes / ids.length) : 1;
        ratioEl.textContent = ratio.toFixed(2) + '×';
    }

    // merge log
    if (logEl) {
        logEl.innerHTML = '';
        if (learned.length === 0) {
            logEl.innerHTML = '<div class="merge-line">No merges yet — drag the slider to learn some.</div>';
        } else {
            learned.forEach((m, n) => {
                const line = document.createElement('div');
                line.className = 'merge-line';
                const a = bytesToLabel(vocab[m.pair[0]]);
                const b = bytesToLabel(vocab[m.pair[1]]);
                line.innerHTML = `${n + 1}. (${m.pair[0]},${m.pair[1]}) "${a}"+"${b}" ` +
                    `<span class="merge-arrow">→</span> ` +
                    `<span class="merge-newid">${m.idx}</span> (×${m.count})`;
                logEl.appendChild(line);
            });
        }
    }
}

// ========== Wire up on load ==========
document.addEventListener('DOMContentLoaded', () => {
    const utf8Input = document.getElementById('utf8-input');
    if (utf8Input) {
        utf8Input.addEventListener('input', updateUtf8);
        updateUtf8();
    }

    const bpeInput = document.getElementById('bpe-input');
    const bpeSlider = document.getElementById('bpe-merges');
    if (bpeInput) bpeInput.addEventListener('input', updateBpe);
    if (bpeSlider) bpeSlider.addEventListener('input', updateBpe);
    if (bpeInput || bpeSlider) updateBpe();
});

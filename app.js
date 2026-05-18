// ===== KRYPTOS — Main Application =====
(function() {
  'use strict';

  // State
  let currentCategory = 'classic';
  let currentAlgo = 'caesar';
  let isEncrypt = true;
  let history = JSON.parse(localStorage.getItem('kryptos_history') || '[]');
  let matrixEnabled = true;

  // DOM refs
  const $ = id => document.getElementById(id);
  const inputText = $('input-text');
  const outputText = $('output-text');
  const algoBar = $('algorithm-bar');
  const keyInputs = $('key-inputs');
  const inputCount = $('input-char-count');
  const outputCount = $('output-char-count');

  // ===== MATRIX RAIN =====
  function initMatrix() {
    const canvas = $('matrix-rain');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:<>?/~αβγδεζηθ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);
    function draw() {
      if (!matrixEnabled) { requestAnimationFrame(draw); return; }
      ctx.fillStyle = 'rgba(10,10,15,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00f0ff';
      ctx.font = fontSize + 'px JetBrains Mono';
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
  }

  // ===== PARTICLES =====
  function initParticles() {
    const container = $('particles');
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 4 + 's';
      p.style.animationDuration = (3 + Math.random() * 4) + 's';
      container.appendChild(p);
    }
  }

  // ===== NAVIGATION =====
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      $('section-' + btn.dataset.section).classList.add('active');
      // Auto-close mobile menu
      document.querySelector('.header-nav')?.classList.remove('mobile-open');
    });
  });

  // Mobile hamburger toggle
  $('mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('.header-nav')?.classList.toggle('mobile-open');
  });

  // ===== CIPHER CATEGORIES =====
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderAlgorithms();
    });
  });

  function renderAlgorithms() {
    const algos = CipherEngine.algorithms[currentCategory] || [];
    algoBar.innerHTML = algos.map(a =>
      `<button class="algo-btn ${a.id === currentAlgo ? 'active' : ''}" data-algo="${a.id}">${a.name}</button>`
    ).join('');
    algoBar.querySelectorAll('.algo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentAlgo = btn.dataset.algo;
        algoBar.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderKeyInputs();
        updateAlgoInfo();
      });
    });
    // Auto-select first if current not in category
    if (!algos.find(a => a.id === currentAlgo) && algos.length) {
      currentAlgo = algos[0].id;
      algoBar.querySelector('.algo-btn')?.classList.add('active');
    }
    renderKeyInputs();
    updateAlgoInfo();
  }

  function getAlgoInfo(id) {
    for (const cat of Object.values(CipherEngine.algorithms)) {
      const found = cat.find(a => a.id === id);
      if (found) return found;
    }
    return null;
  }

  function renderKeyInputs() {
    const algo = getAlgoInfo(currentAlgo);
    if (!algo || algo.keyLabel === 'None') {
      keyInputs.innerHTML = '';
      return;
    }
    let html = '';
    if (currentAlgo === 'affine') {
      html = `<div class="key-input-group"><label>a, b (comma-separated)</label><input type="text" id="cipher-key" value="5,8" placeholder="5,8"></div>`;
    } else if (currentAlgo === 'caesar') {
      html = `<div class="key-input-group"><label>Shift (0-25)</label><input type="number" id="cipher-key" min="0" max="25" value="3"></div>`;
    } else if (currentAlgo === 'railfence') {
      html = `<div class="key-input-group"><label>Rails</label><input type="number" id="cipher-key" min="2" max="20" value="3"></div>`;
    } else if (currentAlgo === 'substitution') {
      html = `<div class="key-input-group"><label>Key Alphabet (26 chars)</label><input type="text" id="cipher-key" value="ZYXWVUTSRQPONMLKJIHGFEDCBA" maxlength="26"></div>`;
    } else {
      html = `<div class="key-input-group"><label>${algo.keyLabel}</label><input type="text" id="cipher-key" placeholder="Enter key..." value="SECRET"></div>`;
    }
    keyInputs.innerHTML = html;
  }

  function updateAlgoInfo() {
    const algo = getAlgoInfo(currentAlgo);
    if (!algo) return;
    $('algo-info-name').textContent = algo.name;
    $('algo-info-badge').textContent = currentCategory;
    $('algo-info-desc').textContent = algo.desc;
    $('algo-info-security').textContent = '🔓 ' + algo.security + ' Security';
    $('algo-info-type').textContent = '📝 ' + algo.type;
    $('algo-info-key').textContent = '🔑 ' + algo.keyLabel;
  }

  // ===== DIRECTION TOGGLE =====
  $('encrypt-btn').addEventListener('click', () => {
    isEncrypt = true;
    $('encrypt-btn').classList.add('active');
    $('decrypt-btn').classList.remove('active');
  });
  $('decrypt-btn').addEventListener('click', () => {
    isEncrypt = false;
    $('decrypt-btn').classList.add('active');
    $('encrypt-btn').classList.remove('active');
  });

  // ===== PROCESS =====
  $('process-btn').addEventListener('click', processText);

  function processText() {
    const text = inputText.value;
    if (!text) { showToast('Enter some text first', 'error'); return; }
    const key = document.getElementById('cipher-key')?.value || '';
    const result = CipherEngine.process(currentAlgo, text, key, isEncrypt);
    outputText.value = result;
    updateCounts();
    // Animate
    $('process-btn').style.transform = 'scale(0.95)';
    setTimeout(() => $('process-btn').style.transform = '', 150);
    // Add to history
    addHistory(currentAlgo, isEncrypt ? 'encrypt' : 'decrypt', text, result, key);
    showToast(isEncrypt ? 'Encrypted!' : 'Decrypted!', 'success');
  }

  // Enter key shortcut
  inputText.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') processText(); });

  // ===== SWAP =====
  $('swap-btn').addEventListener('click', () => {
    const tmp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = tmp;
    updateCounts();
  });

  // ===== CHAR COUNTS =====
  function updateCounts() {
    inputCount.textContent = inputText.value.length + ' chars';
    outputCount.textContent = outputText.value.length + ' chars';
  }
  inputText.addEventListener('input', updateCounts);

  // ===== CLIPBOARD =====
  $('copy-btn').addEventListener('click', () => {
    if (outputText.value) {
      navigator.clipboard.writeText(outputText.value);
      showToast('Copied to clipboard!', 'success');
    }
  });
  $('paste-btn').addEventListener('click', async () => {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    updateCounts();
  });

  // ===== SAMPLE TEXT =====
  $('sample-btn').addEventListener('click', () => {
    const samples = [
      'The quick brown fox jumps over the lazy dog',
      'Attack at dawn, bring reinforcements',
      'HELLO WORLD THIS IS A SECRET MESSAGE',
      'Cryptography is the practice of secure communication',
      'The enemy knows the system - Claude Shannon',
    ];
    inputText.value = samples[Math.floor(Math.random() * samples.length)];
    updateCounts();
  });

  // ===== DOWNLOAD =====
  $('download-btn').addEventListener('click', () => {
    if (!outputText.value) return;
    const blob = new Blob([outputText.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kryptos_${currentAlgo}_${Date.now()}.txt`;
    a.click();
  });

  // ===== CLEAR =====
  $('clear-all-btn').addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    updateCounts();
  });

  // ===== THEME =====
  $('theme-toggle').addEventListener('click', () => {
    matrixEnabled = !matrixEnabled;
    const canvas = $('matrix-rain');
    canvas.style.opacity = matrixEnabled ? '0.06' : '0';
    showToast(matrixEnabled ? 'Matrix effect on' : 'Matrix effect off', 'info');
  });

  // ===== HISTORY =====
  function addHistory(algo, direction, input, output, key) {
    history.unshift({ algo, direction, input: input.substring(0, 200), output: output.substring(0, 200), key, time: new Date().toISOString() });
    if (history.length > 100) history.pop();
    localStorage.setItem('kryptos_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const list = $('history-list');
    if (!history.length) {
      list.innerHTML = '<div class="history-empty"><span class="empty-icon">🕐</span><p>No operations yet.</p></div>';
      return;
    }
    list.innerHTML = history.map((h, i) => `
      <div class="history-item" data-index="${i}">
        <span class="history-algo">${h.algo.toUpperCase()} ${h.direction === 'encrypt' ? '🔒' : '🔓'}</span>
        <div class="history-preview">
          <div class="history-input-preview">IN: ${escapeHtml(h.input)}</div>
          <div class="history-output-preview">OUT: ${escapeHtml(h.output)}</div>
        </div>
        <span class="history-time">${new Date(h.time).toLocaleTimeString()}</span>
      </div>
    `).join('');
    list.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const h = history[item.dataset.index];
        inputText.value = h.input;
        outputText.value = h.output;
        updateCounts();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        $('nav-cipher').classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        $('section-cipher').classList.add('active');
      });
    });
  }

  $('clear-history-btn')?.addEventListener('click', () => {
    history = [];
    localStorage.setItem('kryptos_history', '[]');
    renderHistory();
    showToast('History cleared', 'info');
  });

  $('export-history-btn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kryptos_history_${Date.now()}.json`;
    a.click();
  });

  // ===== ANALYSIS HANDLERS =====
  $('run-freq-btn').addEventListener('click', () => {
    const text = $('freq-input').value;
    if (!text) return;
    const result = AnalysisEngine.frequencyAnalysis(text);
    const chart = $('freq-chart');
    const maxCount = Math.max(...result.sorted.map(([,v]) => v.count), 1);
    chart.innerHTML = result.sorted.map(([letter, data]) =>
      `<div class="freq-bar-wrapper"><span class="freq-bar-count">${data.count}</span><div class="freq-bar" style="height:${Math.max(data.count/maxCount*140,2)}px" title="${letter}: ${data.percent}%"></div><span class="freq-bar-label">${letter}</span></div>`
    ).join('');
    $('freq-stats').innerHTML = `
      <div class="freq-stat"><div class="freq-stat-label">Total Letters</div><div class="freq-stat-value">${result.total}</div></div>
      <div class="freq-stat"><div class="freq-stat-label">Unique Chars</div><div class="freq-stat-value">${result.uniqueChars}</div></div>
      <div class="freq-stat"><div class="freq-stat-label">Entropy</div><div class="freq-stat-value">${result.entropy}</div></div>
      <div class="freq-stat"><div class="freq-stat-label">Most Frequent</div><div class="freq-stat-value">${result.sorted[0]?result.sorted[0][0]+' ('+result.sorted[0][1].percent+'%)':'—'}</div></div>
    `;
    $('freq-results').classList.add('visible');
  });

  $('run-brute-btn').addEventListener('click', () => {
    const text = $('brute-input').value;
    if (!text) return;
    const results = AnalysisEngine.bruteForceCaesar(text);
    $('brute-results').innerHTML = results.map((r, i) =>
      `<div class="brute-item ${i===0?'highlight':''}"><span class="brute-shift">Shift ${r.shift}</span><span class="brute-text">${escapeHtml(r.text.substring(0,80))}</span><span class="brute-score">Score: ${r.score}</span></div>`
    ).join('');
  });

  $('run-detect-btn').addEventListener('click', () => {
    const text = $('detect-input').value;
    if (!text) return;
    const results = AnalysisEngine.autoDetect(text);
    $('detect-results').innerHTML = results.map(r =>
      `<div class="detect-item"><div class="detect-label">${r.type}</div><div class="detect-value">${escapeHtml(r.decoded.substring(0,200))}</div><span class="detect-confidence ${r.confidence}">${r.confidence} confidence</span></div>`
    ).join('');
  });

  $('run-ioc-btn').addEventListener('click', () => {
    const text = $('ioc-input').value;
    if (!text) return;
    const result = AnalysisEngine.indexOfCoincidence(text);
    let html = `<div class="result-row result-highlight"><span class="result-row-label">Index of Coincidence</span><span class="result-row-value">${result.ic}</span></div>`;
    html += `<div class="result-row"><span class="result-row-label">Assessment</span><span class="result-row-value">${result.lang}</span></div>`;
    html += '<div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted)">Estimated Key Lengths:</div>';
    result.keyLengths.filter(k=>k.likely).slice(0,5).forEach(k => {
      html += `<div class="result-row"><span class="result-row-label">Length ${k.length}</span><span class="result-row-value">IC: ${k.ic} ✓</span></div>`;
    });
    $('ioc-results').innerHTML = html;
  });

  $('run-kasiski-btn').addEventListener('click', () => {
    const text = $('kasiski-input').value;
    if (!text) return;
    const result = AnalysisEngine.kasiskiExamination(text);
    let html = '<div style="margin-bottom:8px;font-size:0.75rem;color:var(--text-muted)">Most Likely Key Lengths:</div>';
    result.possibleKeyLengths.forEach(k => {
      html += `<div class="result-row"><span class="result-row-label">Length ${k.length}</span><span class="result-row-value">${k.count} factors</span></div>`;
    });
    if (result.trigrams.length) {
      html += '<div style="margin:12px 0 8px;font-size:0.75rem;color:var(--text-muted)">Repeated Trigrams:</div>';
      result.trigrams.slice(0,5).forEach(t => {
        html += `<div class="result-row"><span class="result-row-label">${t.trigram}</span><span class="result-row-value">×${t.positions.length} at positions ${t.positions.slice(0,4).join(', ')}</span></div>`;
      });
    }
    $('kasiski-results').innerHTML = html;
  });

  $('run-stats-btn').addEventListener('click', () => {
    const text = $('stats-input').value;
    if (!text) return;
    const s = AnalysisEngine.textStatistics(text);
    $('stats-results').innerHTML = [
      ['Total Characters', s.len], ['Words', s.words], ['Lines', s.lines],
      ['Letters', s.letters], ['Digits', s.digits], ['Spaces', s.spaces],
      ['Special Chars', s.special], ['Uppercase', s.upper], ['Lowercase', s.lower],
      ['Unique Characters', s.unique], ['Entropy', s.entropy + ' bits'],
    ].map(([l,v]) => `<div class="result-row"><span class="result-row-label">${l}</span><span class="result-row-value">${v}</span></div>`).join('');
  });

  // ===== HASH HANDLERS =====
  $('hash-all-btn').addEventListener('click', async () => {
    const text = $('hash-input').value;
    if (!text) return;
    const results = await HashEngine.hashAll(text);
    $('hash-md5-value').textContent = results.md5;
    $('hash-sha1-value').textContent = results.sha1;
    $('hash-sha256-value').textContent = results.sha256;
    $('hash-sha384-value').textContent = results.sha384;
    $('hash-sha512-value').textContent = results.sha512;
    $('hash-crc32-value').textContent = results.crc32;
    showToast('Hashes generated!', 'success');
  });

  document.querySelectorAll('.hash-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = $('hash-' + btn.dataset.hash + '-value').textContent;
      if (val && val !== '—') { navigator.clipboard.writeText(val); showToast('Hash copied!', 'success'); }
    });
  });

  $('compare-btn').addEventListener('click', () => {
    const h1 = $('compare-hash1').value.trim().toLowerCase();
    const h2 = $('compare-hash2').value.trim().toLowerCase();
    const el = $('compare-result');
    if (!h1 || !h2) return;
    if (h1 === h2) { el.className = 'compare-result match'; el.textContent = '✅ MATCH — Hashes are identical'; }
    else { el.className = 'compare-result no-match'; el.textContent = '❌ NO MATCH — Hashes differ'; }
  });

  $('hash-text-mode').addEventListener('click', () => {
    $('hash-text-mode').classList.add('active');
    $('hash-hex-mode').classList.remove('active');
  });
  $('hash-hex-mode').addEventListener('click', () => {
    $('hash-hex-mode').classList.add('active');
    $('hash-text-mode').classList.remove('active');
  });

  // ===== TOAST =====
  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = msg;
    $('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ===== UTILS =====
  function escapeHtml(s) {
    const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
  }

  // ===== BRUTE FORCE HANDLERS =====
  let bfResults = [];
  let bfOriginalInput = '';
  let bfSortMode = 'score';

  // Char count for bf input
  const bfInput = $('bf-input');
  if (bfInput) {
    bfInput.addEventListener('input', () => {
      $('bf-char-count').textContent = bfInput.value.length + ' chars';
    });
  }

  // Launch attack
  $('bf-launch-btn')?.addEventListener('click', async () => {
    const text = $('bf-input').value.trim();
    if (!text) { showToast('Enter ciphertext first', 'error'); return; }
    bfOriginalInput = text;

    // Read category filters
    const filter = {
      classic: $('bf-filter-classic').checked,
      encoding: $('bf-filter-encoding').checked,
      modern: $('bf-filter-modern').checked,
      esoteric: $('bf-filter-esoteric').checked,
    };

    if (!filter.classic && !filter.encoding && !filter.modern && !filter.esoteric) {
      showToast('Select at least one category', 'error');
      return;
    }

    // Reset UI
    $('bf-progress-container').style.display = 'block';
    $('bf-progress').style.width = '0%';
    $('bf-progress-percent').textContent = '0%';
    $('bf-progress-label').textContent = 'Initializing...';
    $('bf-results-header').style.display = 'none';
    $('bf-results').innerHTML = '<div class="history-empty"><span class="empty-icon">⏳</span><p>Running attack...</p></div>';

    // Disable launch button
    const launchBtn = $('bf-launch-btn');
    launchBtn.disabled = true;
    launchBtn.style.opacity = '0.5';

    try {
      bfResults = await BruteForceEngine.runAll(text, filter, (percent, cipherName) => {
        $('bf-progress').style.width = percent + '%';
        $('bf-progress-percent').textContent = percent + '%';
        $('bf-progress-label').textContent = 'Attacking: ' + cipherName;
      });

      // Sort by score descending
      bfSortMode = 'score';
      $('bf-sort-score').classList.add('active');
      $('bf-sort-cipher').classList.remove('active');
      bfResults.sort((a, b) => b.score - a.score);

      renderBfResults();
      showToast(`Attack complete — ${bfResults.length} candidates found`, 'success');
    } catch (e) {
      showToast('Attack failed: ' + e.message, 'error');
    }

    // Re-enable
    launchBtn.disabled = false;
    launchBtn.style.opacity = '1';
  });

  // Sort toggle
  $('bf-sort-score')?.addEventListener('click', () => {
    bfSortMode = 'score';
    $('bf-sort-score').classList.add('active');
    $('bf-sort-cipher').classList.remove('active');
    bfResults.sort((a, b) => b.score - a.score);
    renderBfResults();
  });
  $('bf-sort-cipher')?.addEventListener('click', () => {
    bfSortMode = 'cipher';
    $('bf-sort-cipher').classList.add('active');
    $('bf-sort-score').classList.remove('active');
    bfResults.sort((a, b) => a.algoName.localeCompare(b.algoName) || b.score - a.score);
    renderBfResults();
  });

  function renderBfResults() {
    const container = $('bf-results');
    const header = $('bf-results-header');

    if (!bfResults.length) {
      header.style.display = 'none';
      container.innerHTML = '<div class="history-empty"><span class="empty-icon">🚫</span><p>No plausible decryptions found. The ciphertext may use an unknown key or unsupported algorithm.</p></div>';
      return;
    }

    header.style.display = 'flex';
    $('bf-results-count').textContent = bfResults.length + ' candidate' + (bfResults.length !== 1 ? 's' : '');

    container.innerHTML = bfResults.map((r, i) => {
      const scoreClass = r.score >= 20 ? 'high' : r.score >= 5 ? 'medium' : 'low';
      const scoreLabel = r.score >= 20 ? 'HIGH' : r.score >= 5 ? 'MED' : 'LOW';
      const preview = escapeHtml(r.decrypted.substring(0, 120)) + (r.decrypted.length > 120 ? '...' : '');
      return `
        <div class="bf-result-card score-${scoreClass}" data-index="${i}">
          <div class="bf-card-top">
            <div class="bf-card-cipher">
              <span class="bf-card-name">${escapeHtml(r.algoName)}</span>
              <span class="bf-card-id">${escapeHtml(r.algoId)}</span>
            </div>
            <div class="bf-card-badges">
              <span class="bf-cat-badge ${r.category}">${r.category}</span>
              <span class="bf-score-badge ${scoreClass}">${scoreLabel} ${r.score.toFixed(1)}</span>
            </div>
          </div>
          <div class="bf-card-key">🔑 ${escapeHtml(r.key)}</div>
          <div class="bf-card-preview">${preview}</div>
          <div class="bf-card-bottom">
            <button class="bf-use-btn" data-bf-index="${i}">Use This →</button>
          </div>
        </div>`;
    }).join('');
  }

  // Event-delegated "Use This" handler
  $('bf-results')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.bf-use-btn');
    if (!btn) return;
    const idx = parseInt(btn.dataset.bfIndex);
    const r = bfResults[idx];
    if (!r) return;

    inputText.value = bfOriginalInput;
    outputText.value = r.decrypted;
    updateCounts();

    // Navigate to Ciphers tab
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    $('nav-cipher').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    $('section-cipher').classList.add('active');

    showToast('Loaded into Cipher workbench', 'success');
  });

  // ===== INIT =====
  initMatrix();
  initParticles();
  renderAlgorithms();
  renderHistory();
  updateCounts();
})();

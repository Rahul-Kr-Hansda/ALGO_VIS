/**
 * AlgoView — Main Visualizer Controller
 * Handles playback, stepping, speed control, code highlighting,
 * custom input, and connects renderers to algorithm generators.
 */

'use strict';

(function () {
  /* ── DOM references ── */
  const canvas         = document.getElementById('algo-canvas');
  const btnPlay        = document.getElementById('btn-play-pause');
  const btnRestart     = document.getElementById('btn-restart');
  const btnStepBack    = document.getElementById('btn-step-back');
  const btnStepFwd     = document.getElementById('btn-step-fwd');
  const speedSlider    = document.getElementById('speed-slider');
  const speedValue     = document.getElementById('speed-value');
  const stepCounter    = document.getElementById('step-counter');
  const progressBar    = document.getElementById('progress-bar');
  const progressCont   = document.getElementById('progress-container');
  const stepInfoText   = document.getElementById('step-info-text');
  const codeBlock      = document.getElementById('code-block');
  const stepLog        = document.getElementById('step-log');
  const complexityBody = document.getElementById('complexity-body');
  const algoDescription= document.getElementById('algo-description');
  const vizTitle       = document.getElementById('viz-algo-title');
  const vizBadge       = document.getElementById('viz-category-badge');
  const sidebarNav     = document.getElementById('sidebar-nav');
  const sidebarSearch  = document.getElementById('sidebar-search');
  const customInput    = document.getElementById('custom-input');
  const btnApply       = document.getElementById('btn-apply-input');
  const btnRandom      = document.getElementById('btn-random-input');
  const valComparisons = document.getElementById('val-comparisons');
  const valSwaps       = document.getElementById('val-swaps');
  const panelTabBtns   = document.querySelectorAll('.panel-tab-btn');
  const panelContents  = document.querySelectorAll('.panel-content');
  const canvasLegend   = document.getElementById('canvas-legend');

  /* ── State ── */
  let frames       = [];   // All precomputed frames
  let currentFrame = -1;
  let isPlaying    = false;
  let playTimer    = null;
  let currentAlgo  = null;
  let currentArray = [64, 34, 25, 12, 22, 11, 90];

  /* ── Speed mapping (ms per step) ── */
  function getDelay() {
    const s = parseInt(speedSlider.value, 10);
    // 1 = slow (800ms), 10 = fast (50ms)
    return Math.round(800 - (s - 1) * (750 / 9));
  }

  /* ── Lookup all algorithms ── */
  const ALL_ALGOS = {
    ...SORTING_ALGORITHMS,
    ...SEARCHING_ALGORITHMS,
    ...DS_ALGORITHMS,
    ...GRAPH_ALGORITHMS,
  };

  /* ── Build the sidebar ── */
  function buildSidebar(filter = '') {
    const groups = {};
    ALGO_REGISTRY.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });

    sidebarNav.innerHTML = '';
    const q = filter.toLowerCase();

    Object.entries(groups).forEach(([cat, algos]) => {
      const meta    = CATEGORY_META[cat];
      const matched = q ? algos.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      ) : algos;

      if (matched.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'sidebar-group';
      groupEl.innerHTML = `
        <div class="sidebar-group-label">
          <span class="group-icon">${meta.emoji}</span>
          ${meta.label}
        </div>`;

      matched.forEach(a => {
        const item = document.createElement('div');
        item.className = `sidebar-item${currentAlgo?.id === a.id ? ' active' : ''}`;
        item.textContent = a.name;
        item.dataset.id  = a.id;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Visualize ${a.name}`);
        item.addEventListener('click',   () => loadAlgorithm(a.id));
        item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadAlgorithm(a.id); } });
        groupEl.appendChild(item);
      });

      sidebarNav.appendChild(groupEl);
    });
  }

  /* ── Load algorithm ── */
  function loadAlgorithm(id) {
    const meta = getAlgoById(id);
    if (!meta) return;

    // Update active state in sidebar
    sidebarNav.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    currentAlgo = meta;
    stop();

    // Update navbar
    vizTitle.textContent = meta.name;
    const catMeta = CATEGORY_META[meta.category];
    vizBadge.textContent  = catMeta.label;
    vizBadge.className    = `algo-category-badge badge ${catMeta.badgeClass}`;

    // Update info panel
    algoDescription.innerHTML = meta.description;
    buildComplexityTable(meta.complexity);

    // Load pseudocode
    const algoImpl = ALL_ALGOS[id];
    if (algoImpl) {
      buildCodePanel(algoImpl.pseudocode);
    }

    // Update URL
    history.replaceState(null, '', `?algo=${id}`);

    // Adjust legend & custom input
    const isSorting   = meta.category === 'sorting';
    const isSearching = meta.category === 'searching';
    const isGraph     = meta.category === 'graph' || meta.category === 'dynamic';
    const isDS        = meta.category === 'data-structure';

    canvasLegend.style.display = (isSorting || isSearching) ? 'flex' : 'none';
    document.getElementById('counter-swaps').style.display = isSorting ? 'flex' : 'none';
    document.querySelector('.input-control').style.display =
      (isSorting || isSearching) ? 'flex' : 'none';

    // Generate frames
    generateFrames(id, meta);
  }

  function generateFrames(id, meta) {
    const algoImpl = ALL_ALGOS[id];
    if (!algoImpl) return;

    frames       = [];
    currentFrame = -1;

    try {
      let gen;
      if (meta.category === 'sorting') {
        gen = algoImpl.generator(currentArray.slice());
      } else if (meta.category === 'searching') {
        const target = parseInt(customInput.value.trim(), 10) ||
                       currentArray[Math.floor(currentArray.length / 2)];
        gen = algoImpl.generator(currentArray.slice(), target);
      } else if (meta.category === 'data-structure') {
        gen = algoImpl.generator(currentArray.slice().map(v => Math.abs(v % 100)));
      } else if (meta.category === 'graph') {
        gen = algoImpl.generator(currentArray.slice());
      } else if (meta.category === 'dynamic') {
        gen = algoImpl.generator([Math.min(currentArray[0] || 10, 15)]);
      } else {
        return;
      }

      // Collect all frames
      let result = gen.next();
      while (!result.done) {
        frames.push(result.value);
        result = gen.next();
      }
    } catch (e) {
      console.error('Frame generation error:', e);
    }

    if (frames.length > 0) {
      renderFrame(0);
    }

    updateStepCounter();
  }

  /* ── Render a single frame ── */
  function renderFrame(idx) {
    if (idx < 0 || idx >= frames.length) return;
    currentFrame = idx;
    const frame = frames[idx];

    // Canvas
    if (frame.type === 'graph' || frame.type === 'bst') {
      GraphRenderer.render(canvas, frame);
    } else {
      ArrayRenderer.render(canvas, frame);
    }

    // Step info
    if (frame.message) {
      stepInfoText.innerHTML = frame.message;
    }

    // Counters
    valComparisons.textContent = frame.comparisons ?? 0;
    valSwaps.textContent       = frame.swaps ?? 0;

    // Code highlighting
    highlightCodeLine(frame.codeLine ?? -1);

    // Step log
    addLogEntry(frame.message, idx === frames.length - 1);

    // Progress bar
    const pct = frames.length > 1 ? (idx / (frames.length - 1)) * 100 : 0;
    progressBar.style.width = `${pct}%`;
    progressCont.setAttribute('aria-valuenow', Math.round(pct));

    updateStepCounter();
    updatePlayBtn();
  }

  /* ── Code panel ── */
  function buildCodePanel(lines) {
    codeBlock.innerHTML = '';
    if (!lines) return;
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'code-line';
      div.dataset.line = i;
      div.innerHTML = `
        <span class="line-num">${i + 1}</span>
        <span class="line-text">${escapeHtml(line)}</span>`;
      codeBlock.appendChild(div);
    });
  }

  function highlightCodeLine(lineIdx) {
    codeBlock.querySelectorAll('.code-line').forEach(el => {
      el.classList.toggle('highlighted', parseInt(el.dataset.line, 10) === lineIdx);
    });

    // Scroll into view
    const active = codeBlock.querySelector('.code-line.highlighted');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ── Step log ── */
  function addLogEntry(msg, isLast) {
    if (!msg) return;
    const div = document.createElement('div');
    div.className = `log-entry${isLast ? ' latest' : ''}`;
    div.innerHTML = msg;

    // Keep only last 30 entries
    while (stepLog.children.length >= 30) {
      stepLog.removeChild(stepLog.firstChild);
    }
    stepLog.querySelectorAll('.log-entry.latest').forEach(el => el.classList.remove('latest'));
    stepLog.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  /* ── Complexity table ── */
  function buildComplexityTable(c) {
    if (!c) { complexityBody.innerHTML = '<tr><td colspan="3">—</td></tr>'; return; }
    complexityBody.innerHTML = `
      <tr>
        <td>Best</td>
        <td>${c.best.time}</td>
        <td>${c.best.space}</td>
      </tr>
      <tr>
        <td>Average</td>
        <td>${c.average.time}</td>
        <td>${c.average.space}</td>
      </tr>
      <tr>
        <td>Worst</td>
        <td>${c.worst.time}</td>
        <td>${c.worst.space}</td>
      </tr>`;
  }

  /* ── Playback control ── */
  function play() {
    if (frames.length === 0) return;
    if (currentFrame >= frames.length - 1) restart();
    isPlaying = true;
    updatePlayBtn();
    tick();
  }

  function pause() {
    isPlaying = false;
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    updatePlayBtn();
  }

  function stop() {
    pause();
    currentFrame = -1;
    progressBar.style.width = '0%';
    updateStepCounter();
  }

  function restart() {
    pause();
    // Re-generate frames to reset counters
    if (currentAlgo) generateFrames(currentAlgo.id, currentAlgo);
    else currentFrame = 0;
  }

  function tick() {
    if (!isPlaying) return;
    if (currentFrame >= frames.length - 1) {
      pause();
      return;
    }
    renderFrame(currentFrame + 1);
    playTimer = setTimeout(tick, getDelay());
  }

  function stepForward() {
    pause();
    if (currentFrame < frames.length - 1) renderFrame(currentFrame + 1);
  }

  function stepBack() {
    pause();
    if (currentFrame > 0) renderFrame(currentFrame - 1);
  }

  function updatePlayBtn() {
    if (isPlaying) {
      btnPlay.textContent = '⏸';
      btnPlay.setAttribute('aria-label', 'Pause');
    } else {
      btnPlay.textContent = '▶';
      btnPlay.setAttribute('aria-label', 'Play');
    }
    // Dim step buttons when playing
    btnStepBack.style.opacity = isPlaying ? '0.5' : '1';
    btnStepFwd.style.opacity  = isPlaying ? '0.5' : '1';
  }

  function updateStepCounter() {
    if (frames.length === 0) {
      stepCounter.textContent = '—';
    } else {
      stepCounter.textContent = `${currentFrame + 1} / ${frames.length}`;
    }
  }

  /* ── Event listeners ── */
  btnPlay.addEventListener('click', () => {
    if (isPlaying) pause(); else play();
  });

  btnRestart.addEventListener('click', () => {
    restart();
  });

  btnStepBack.addEventListener('click', () => { if (!isPlaying) stepBack(); });
  btnStepFwd.addEventListener('click',  () => { if (!isPlaying) stepForward(); });

  speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${speedSlider.value}x`;
    speedSlider.setAttribute('aria-valuenow', speedSlider.value);
  });

  /* Custom input */
  btnApply.addEventListener('click', () => {
    const vals = customInput.value.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
    if (vals.length >= 2) {
      currentArray = vals.slice(0, 20);
      if (currentAlgo) generateFrames(currentAlgo.id, currentAlgo);
    }
  });

  btnRandom.addEventListener('click', () => {
    const n = Math.floor(Math.random() * 8) + 6;
    currentArray = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    customInput.value = currentArray.join(', ');
    if (currentAlgo) generateFrames(currentAlgo.id, currentAlgo);
  });

  /* Panel tabs */
  panelTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      panelTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const target = btn.dataset.panel;
      panelContents.forEach(c => {
        c.classList.toggle('active', c.id === `panel-${target}`);
      });
    });
  });

  /* Sidebar search */
  sidebarSearch.addEventListener('input', () => {
    buildSidebar(sidebarSearch.value);
  });

  /* Keyboard shortcuts */
  document.addEventListener('keydown', e => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (isPlaying) pause(); else play();
        break;
      case 'ArrowRight':
        if (!isPlaying) stepForward();
        break;
      case 'ArrowLeft':
        if (!isPlaying) stepBack();
        break;
      case 'KeyR':
        restart();
        break;
    }
  });

  /* Canvas resize observer */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (currentFrame >= 0 && frames.length > 0) {
        renderFrame(currentFrame);
      }
    });
    ro.observe(canvas.parentElement);
  }

  /* ── Utilities ── */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
  }

  /* ── Init ── */
  function init() {
    buildSidebar();

    // Read algo from URL
    const params = new URLSearchParams(window.location.search);
    const algoId = params.get('algo');

    if (algoId && getAlgoById(algoId)) {
      loadAlgorithm(algoId);
    } else {
      // Default: first algo
      loadAlgorithm('bubble-sort');
    }

    // Initial random array
    customInput.value = currentArray.join(', ');
  }

  init();
})();

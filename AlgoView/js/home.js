/**
 * AlgoView — Homepage JavaScript
 * Handles search, category filtering, and card rendering.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid       = document.getElementById('algorithms-grid');
  const searchInput = document.getElementById('global-search');
  const titleEl    = document.getElementById('section-title-el');
  const countEl    = document.getElementById('section-count-el');
  const tabButtons = document.querySelectorAll('.tab-btn');

  let currentCategory = 'all';
  let searchQuery     = '';

  /* ── Render Cards ── */
  function renderCards() {
    let list = ALGO_REGISTRY;

    // Filter by category
    if (currentCategory !== 'all') {
      list = list.filter(a => a.category === currentCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => {
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // Update header
    const cat = CATEGORY_META[currentCategory] || { label: 'All Algorithms' };
    titleEl.textContent = currentCategory === 'all'
      ? `All Algorithms`
      : `${cat.label}`;
    countEl.textContent = `${list.length} algorithm${list.length !== 1 ? 's' : ''}`;

    // Clear grid
    grid.innerHTML = '';

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="no-results" role="status" aria-live="polite">
          <div class="no-results-icon" aria-hidden="true">🔍</div>
          <p>No algorithms found for "<strong>${escapeHtml(searchQuery)}</strong>"</p>
          <p style="margin-top:0.5rem; font-size:0.8rem;">Try a different keyword or clear the filter.</p>
        </div>`;
      return;
    }

    // Group by category if showing all
    if (currentCategory === 'all' && !searchQuery.trim()) {
      const groups = {};
      list.forEach(a => {
        if (!groups[a.category]) groups[a.category] = [];
        groups[a.category].push(a);
      });

      Object.entries(groups).forEach(([cat, algos]) => {
        const meta = CATEGORY_META[cat];
        const groupEl = document.createElement('div');
        groupEl.className = 'category-group';
        groupEl.setAttribute('aria-label', meta.label);
        groupEl.style.gridColumn = '1 / -1';

        groupEl.innerHTML = `
          <div class="category-group-header">
            <span style="font-size:1.2rem" aria-hidden="true">${meta.emoji}</span>
            <h3 class="category-group-title">${meta.label}</h3>
            <div class="category-divider"></div>
          </div>
          <div class="algorithms-grid" style="margin:0;" role="list">
            ${algos.map(a => buildCard(a, searchQuery)).join('')}
          </div>`;
        grid.appendChild(groupEl);
      });
    } else {
      list.forEach(a => {
        const div = document.createElement('div');
        div.innerHTML = buildCard(a, searchQuery);
        grid.appendChild(div.firstElementChild);
      });
    }

    // Add click listeners
    grid.querySelectorAll('.algo-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        window.location.href = `visualizer.html?algo=${id}`;
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  function buildCard(algo, query) {
    const meta = CATEGORY_META[algo.category];
    const highlightedName = query ? highlight(algo.name, query) : algo.name;

    return `
    <article
      class="algo-card ${algo.category}"
      data-id="${algo.id}"
      role="listitem"
      tabindex="0"
      aria-label="${algo.name} - ${meta.label}"
    >
      <div class="algo-card-header">
        <div class="algo-icon" aria-hidden="true">${algo.emoji}</div>
        <div style="flex:1;min-width:0;">
          <h3 class="algo-card-name">${highlightedName}</h3>
          <span class="badge ${meta.badgeClass}" style="margin-top:4px;">${meta.label}</span>
        </div>
        <div class="algo-card-action" aria-hidden="true">▶</div>
      </div>
      <p class="algo-card-desc">${truncate(algo.description, 110)}</p>
      <div class="algo-card-footer">
        <div class="complexity-info" aria-label="Complexity info">
          <div class="complexity-row">
            <span class="label">Avg Time</span>
            <span class="value">${algo.complexity.average.time}</span>
          </div>
          <div class="complexity-row">
            <span class="label">Space</span>
            <span class="value">${algo.complexity.average.space}</span>
          </div>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;max-width:120px;">
          ${algo.tags.slice(0,2).map(t => `<span class="badge badge-violet" style="font-size:0.65rem;">${t}</span>`).join('')}
        </div>
      </div>
    </article>`;
  }

  /* ── Category Tab Handling ── */
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentCategory = btn.dataset.category;
      renderCards();
    });
  });

  /* ── Search ── */
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    if (searchQuery.trim() && currentCategory !== 'all') {
      // Reset category when searching
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.getElementById('tab-all').classList.add('active');
      document.getElementById('tab-all').setAttribute('aria-selected', 'true');
      currentCategory = 'all';
    }
    renderCards();
  });

  /* ── "Start Visualizing" nav button ── */
  document.getElementById('nav-start-btn').addEventListener('click', () => {
    document.getElementById('algorithms-section').scrollIntoView({ behavior: 'smooth' });
  });

  /* ── Utilities ── */
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${escapeRe(query)})`, 'gi');
    return text.replace(re, '<mark class="highlight">$1</mark>');
  }

  function truncate(str, len) {
    return str.length <= len ? str : str.slice(0, len).trimEnd() + '…';
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ── Initial render ── */
  renderCards();

  /* ── Entrance animation for cards ── */
  function animateEntrance() {
    const cards = grid.querySelectorAll('.algo-card, .category-group');
    cards.forEach((c, i) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(20px)';
      c.style.transition = `opacity 0.4s ease ${i * 0.04}s, transform 0.4s ease ${i * 0.04}s`;
      setTimeout(() => {
        c.style.opacity = '1';
        c.style.transform = 'translateY(0)';
      }, 50);
    });
  }

  // Call after first render
  setTimeout(animateEntrance, 10);
});

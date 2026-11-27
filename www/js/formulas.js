/* ==========================================================================
   formulas.js — Interactive Quick Formula Carousel (Swipe + Keyboard + Pin)
   ========================================================================== */

(function (global) {
  'use strict';

  const { FORMULAS } = global.HudData;

  let activeCategory = 'all';
  let searchQuery = '';
  let currentIndex = 0;

  function getFiltered() {
    const state = global.HudStorage.getState();
    const pinnedSet = new Set(state.pinnedFormulas || []);
    const q = searchQuery.trim().toLowerCase();

    return FORMULAS.filter((item) => {
      if (activeCategory === 'pinned') {
        if (!pinnedSet.has(item.id)) return false;
      } else if (activeCategory !== 'all' && item.cat !== activeCategory) {
        return false;
      }

      if (!q) return true;
      const haystack = [
        item.title,
        item.catLabel,
        item.tip,
        item.equations.map((e) => e.label + ' ' + e.html).join(' ')
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function updatePinBadges() {
    const pinnedCount = (global.HudStorage.getState().pinnedFormulas || []).length;
    const badgeEl = document.getElementById('pinned-count');
    if (badgeEl) badgeEl.textContent = String(pinnedCount);

    const drawerSub = document.getElementById('drawer-formula-count');
    if (drawerSub) {
      drawerSub.textContent = pinnedCount > 0 ? `${FORMULAS.length} kartu (${pinnedCount} ★)` : `${FORMULAS.length} kartu`;
    }
  }

  function togglePin(formulaId) {
    const state = global.HudStorage.getState();
    const idx = state.pinnedFormulas.indexOf(formulaId);
    if (idx === -1) {
      state.pinnedFormulas.push(formulaId);
    } else {
      state.pinnedFormulas.splice(idx, 1);
    }
    global.HudStorage.saveState();
    updatePinBadges();
    render();
  }

  function stepCarousel(delta) {
    const list = getFiltered();
    if (list.length === 0) return;
    currentIndex = (currentIndex + delta + list.length) % list.length;
    render();
  }

  function render() {
    const list = getFiltered();
    const counterEl = document.getElementById('formula-counter');
    const cardEl = document.getElementById('formula-card-container');
    const stripEl = document.getElementById('formula-index-strip');
    const prevBtn = document.getElementById('btn-formula-prev');
    const nextBtn = document.getElementById('btn-formula-next');

    updatePinBadges();

    if (!cardEl || !stripEl || !counterEl) return;

    if (list.length === 0) {
      counterEl.textContent = '0 / 0';
      cardEl.innerHTML =
        '<div class="muted">Tidak ada kartu rumus yang cocok dengan filter/pencarian ini.</div>';
      stripEl.innerHTML = '';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    if (prevBtn) prevBtn.disabled = list.length <= 1;
    if (nextBtn) nextBtn.disabled = list.length <= 1;

    if (currentIndex >= list.length) currentIndex = 0;
    const item = list[currentIndex];
    const isPinned = (global.HudStorage.getState().pinnedFormulas || []).includes(item.id);

    counterEl.textContent = `${currentIndex + 1} / ${list.length}`;

    const eqHtml = item.equations
      .map(
        (eq) => `
        <div class="formula-eq">
          <span class="eq-label">${eq.label}</span>
          <div class="eq-math">${eq.html}</div>
        </div>`
      )
      .join('');

    cardEl.innerHTML = `
      <div class="formula-head">
        <div>
          <span class="card-tag">${item.catLabel}</span>
          <h3 class="formula-title">${item.title}</h3>
        </div>
        <button type="button" class="btn-chip ${isPinned ? 'active-pin' : ''}" id="btn-pin-formula">
          ${isPinned ? '★ Ditandai' : '☆ Tandai'}
        </button>
      </div>
      <div class="formula-eq-list">${eqHtml}</div>
      <div class="formula-tip"><strong>Trik Cepat UTBK:</strong> ${item.tip}</div>
    `;

    const pinBtn = document.getElementById('btn-pin-formula');
    if (pinBtn) {
      pinBtn.addEventListener('click', () => togglePin(item.id));
    }

    stripEl.innerHTML = '';
    list.forEach((f, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `idx-chip ${idx === currentIndex ? 'active' : ''}`;
      chip.textContent = `${idx + 1}. ${f.title.split(' ')[0]}`;
      chip.title = f.title;
      chip.addEventListener('click', () => {
        currentIndex = idx;
        render();
      });
      stripEl.appendChild(chip);
    });
  }

  function init() {
    const catBar = document.getElementById('formula-cat-bar');
    if (catBar) {
      catBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill');
        if (!btn) return;
        catBar.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat || 'all';
        currentIndex = 0;
        render();
      });
    }

    const searchInput = document.getElementById('formula-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value;
        currentIndex = 0;
        render();
      });
    }

    const prevBtn = document.getElementById('btn-formula-prev');
    const nextBtn = document.getElementById('btn-formula-next');
    if (prevBtn) prevBtn.addEventListener('click', () => stepCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepCarousel(1));

    const stage = document.getElementById('formula-carousel-stage');
    if (stage) {
      let touchStartX = 0;
      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      stage.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 45) stepCarousel(dx < 0 ? 1 : -1);
      }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
      const tab = document.getElementById('view-formulas');
      if (!tab || !tab.classList.contains('active')) return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') stepCarousel(-1);
      if (e.key === 'ArrowRight') stepCarousel(1);
    });

    render();
  }

  global.HudFormulas = {
    init,
    render
  };
})(window);

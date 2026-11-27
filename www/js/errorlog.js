/* ==========================================================================
   errorlog.js — Error Log & Bank Soal Evaluasi + Analytics + Flash Review
   ========================================================================== */

(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let reviewQueue = [];
  let reviewPos = 0;

  function getTopKey(counts) {
    let bestKey = '-';
    let bestVal = 0;
    Object.keys(counts).forEach((k) => {
      if (counts[k] > bestVal) {
        bestVal = counts[k];
        bestKey = k;
      }
    });
    return bestKey;
  }

  function addEntry(entry) {
    const state = global.HudStorage.getState();
    const item = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      subtes: entry.subtes || 'PK',
      reason: entry.reason || 'Kurang Teliti',
      source: (entry.source || 'Latihan Mandiri').trim(),
      topic: (entry.topic || 'Umum').trim(),
      question: (entry.question || '').trim(),
      solution: (entry.solution || '').trim(),
      mastered: false,
      reviewCount: 0,
      createdAt: global.HudStorage.getLocalDateKey()
    };
    state.errorLogs.unshift(item);
    global.HudStorage.saveState();
    render();
    return item;
  }

  function toggleMastered(id) {
    const state = global.HudStorage.getState();
    const found = state.errorLogs.find((x) => x.id === id);
    if (!found) return;
    found.mastered = !found.mastered;
    found.reviewCount = (found.reviewCount || 0) + 1;
    global.HudStorage.saveState();
    render();
  }

  function deleteEntry(id) {
    const state = global.HudStorage.getState();
    state.errorLogs = state.errorLogs.filter((x) => x.id !== id);
    global.HudStorage.saveState();
    render();
  }

  function renderStats(logs) {
    const pending = logs.filter((l) => !l.mastered);
    const reasonCounts = {};
    const subtesCounts = {};

    logs.forEach((l) => {
      reasonCounts[l.reason] = (reasonCounts[l.reason] || 0) + 1;
      if (!l.mastered) {
        subtesCounts[l.subtes] = (subtesCounts[l.subtes] || 0) + 1;
      }
    });

    const totalEl = document.getElementById('err-stat-total');
    const pendEl = document.getElementById('err-stat-pending');
    const topReasonEl = document.getElementById('err-stat-top-reason');
    const topSubEl = document.getElementById('err-stat-top-subtes');
    const drawerBadge = document.getElementById('drawer-error-count');
    const reviewBtn = document.getElementById('btn-start-review');
    const statsErrEl = document.getElementById('stats-error-summary');

    if (totalEl) totalEl.textContent = String(logs.length);
    if (pendEl) pendEl.textContent = String(pending.length);
    if (topReasonEl) topReasonEl.textContent = getTopKey(reasonCounts);
    if (topSubEl) topSubEl.textContent = getTopKey(subtesCounts);
    if (drawerBadge) drawerBadge.textContent = `${pending.length} pending`;
    if (reviewBtn) {
      reviewBtn.textContent = `Review Ulang (${pending.length})`;
      reviewBtn.disabled = pending.length === 0;
    }
    if (statsErrEl) {
      statsErrEl.textContent = logs.length > 0
        ? `${pending.length} soal belum dikuasai (terbanyak: ${getTopKey(reasonCounts)})`
        : 'Belum ada catatan soal salah';
    }
  }

  function render() {
    const state = global.HudStorage.getState();
    const logs = state.errorLogs || [];
    renderStats(logs);

    const subFilter = (document.getElementById('err-filter-subtes') || {}).value || 'ALL';
    const reasonFilter = (document.getElementById('err-filter-reason') || {}).value || 'ALL';
    const statusFilter = (document.getElementById('err-filter-status') || {}).value || 'ALL';

    const filtered = logs.filter((item) => {
      if (subFilter !== 'ALL' && item.subtes !== subFilter) return false;
      if (reasonFilter !== 'ALL' && item.reason !== reasonFilter) return false;
      if (statusFilter === 'pending' && item.mastered) return false;
      if (statusFilter === 'mastered' && !item.mastered) return false;
      return true;
    });

    const listEl = document.getElementById('error-list');
    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML =
        '<div class="go-card muted">Belum ada catatan soal salah untuk filter ini. Klik "+ Catat Soal Salah" atau kirim dari hasil Latihan Soal Subtes.</div>';
      return;
    }

    listEl.innerHTML = filtered
      .map(
        (item) => `
      <article class="error-item ${item.mastered ? 'mastered' : ''}" data-id="${escapeHtml(item.id)}">
        <div class="error-item-top">
          <div class="tag-row">
            <span class="tag-pill subtes">${escapeHtml(item.subtes)}</span>
            <span class="tag-pill reason">${escapeHtml(item.reason)}</span>
            <span class="tag-pill">${escapeHtml(item.source)}</span>
          </div>
          <span class="mono-meta">${escapeHtml(item.createdAt)} ${item.mastered ? '&bull; PAHAM' : ''}</span>
        </div>
        <div class="error-topic">${escapeHtml(item.topic)}</div>
        <div class="muted">${escapeHtml(item.question)}</div>
        <div class="error-sol-box">
          <strong>Solusi Benar:</strong> ${escapeHtml(item.solution)}
        </div>
        <div class="error-actions">
          <button type="button" class="btn-chip ${item.mastered ? '' : 'active-green'}" data-action="toggle">
            ${item.mastered ? 'Tandai Perlu Review' : 'Tandai Sudah Paham'}
          </button>
          <button type="button" class="btn-chip btn-danger-soft" data-action="delete">Hapus</button>
        </div>
      </article>`
      )
      .join('');
  }

  function renderReviewModalCard() {
    const modal = document.getElementById('review-modal');
    const body = document.getElementById('review-card-body');
    if (!modal || !body) return;

    if (reviewQueue.length === 0 || reviewPos >= reviewQueue.length) {
      body.innerHTML = `
        <div class="stack-form">
          <p>Mantap! Semua soal pada antrean review selesai ditinjau.</p>
          <button type="button" class="btn-primary" id="btn-finish-review">Selesai</button>
        </div>`;
      const finBtn = document.getElementById('btn-finish-review');
      if (finBtn) finBtn.addEventListener('click', () => modal.classList.add('hidden'));
      return;
    }

    const item = reviewQueue[reviewPos];
    body.innerHTML = `
      <div class="tag-row" style="margin-bottom: 10px;">
        <span class="tag-pill subtes">${escapeHtml(item.subtes)}</span>
        <span class="tag-pill reason">${escapeHtml(item.reason)}</span>
        <span class="mono-meta">Kartu ${reviewPos + 1} / ${reviewQueue.length}</span>
      </div>
      <div class="error-topic">${escapeHtml(item.topic)}</div>
      <p style="white-space: pre-line;">${escapeHtml(item.question)}</p>
      <div id="rev-solution-box" class="error-sol-box hidden">
        <strong>Konsep &amp; Solusi:</strong> ${escapeHtml(item.solution)}
      </div>
      <div class="error-actions" style="margin-top: 14px;">
        <button type="button" class="btn-secondary" id="btn-rev-reveal">Tampilkan Solusi</button>
        <button type="button" class="btn-secondary hidden" id="btn-rev-keep">Masih Ragu (Ulangi)</button>
        <button type="button" class="btn-primary hidden" id="btn-rev-master">Sudah Paham!</button>
      </div>
    `;

    const revealBtn = document.getElementById('btn-rev-reveal');
    const keepBtn = document.getElementById('btn-rev-keep');
    const masterBtn = document.getElementById('btn-rev-master');
    const solBox = document.getElementById('rev-solution-box');

    revealBtn.addEventListener('click', () => {
      solBox.classList.remove('hidden');
      revealBtn.classList.add('hidden');
      keepBtn.classList.remove('hidden');
      masterBtn.classList.remove('hidden');
    });

    keepBtn.addEventListener('click', () => {
      item.reviewCount = (item.reviewCount || 0) + 1;
      global.HudStorage.saveState();
      reviewPos += 1;
      renderReviewModalCard();
    });

    masterBtn.addEventListener('click', () => {
      item.mastered = true;
      item.reviewCount = (item.reviewCount || 0) + 1;
      global.HudStorage.saveState();
      render();
      reviewPos += 1;
      renderReviewModalCard();
    });
  }

  function startReviewSession() {
    const state = global.HudStorage.getState();
    reviewQueue = (state.errorLogs || []).filter((x) => !x.mastered);
    if (reviewQueue.length === 0) return;
    reviewPos = 0;
    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.remove('hidden');
    renderReviewModalCard();
  }

  function init() {
    const formEl = document.getElementById('form-error-log');
    const toggleBtn = document.getElementById('btn-toggle-error-form');
    const closeFormBtn = document.getElementById('btn-close-error-form');

    if (toggleBtn && formEl) {
      toggleBtn.addEventListener('click', () => formEl.classList.toggle('hidden'));
    }
    if (closeFormBtn && formEl) {
      closeFormBtn.addEventListener('click', () => formEl.classList.add('hidden'));
    }

    if (formEl) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        addEntry({
          subtes: document.getElementById('err-subtes').value,
          reason: document.getElementById('err-reason').value,
          source: document.getElementById('err-source').value,
          topic: document.getElementById('err-topic').value,
          question: document.getElementById('err-question').value,
          solution: document.getElementById('err-solution').value
        });
        formEl.reset();
        formEl.classList.add('hidden');
        if (typeof global.showHudToast === 'function') {
          global.showHudToast('Soal berhasil dicatat ke Error Log.');
        }
      });
    }

    ['err-filter-subtes', 'err-filter-reason', 'err-filter-status'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', render);
    });

    const listEl = document.getElementById('error-list');
    if (listEl) {
      listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const card = btn.closest('.error-item');
        if (!card) return;
        const id = card.dataset.id;
        if (btn.dataset.action === 'toggle') toggleMastered(id);
        if (btn.dataset.action === 'delete') deleteEntry(id);
      });
    }

    const reviewBtn = document.getElementById('btn-start-review');
    const closeReviewBtn = document.getElementById('btn-close-review');
    const reviewModal = document.getElementById('review-modal');
    if (reviewBtn) reviewBtn.addEventListener('click', startReviewSession);
    if (closeReviewBtn && reviewModal) {
      closeReviewBtn.addEventListener('click', () => reviewModal.classList.add('hidden'));
    }

    render();
  }

  global.HudErrorLog = {
    init,
    render,
    addEntry
  };
})(window);

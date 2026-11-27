/* ==========================================================================
   app.js — GO Expert SNBT 2027 App Coordinator, SVG Curve Chart & Modals
   ========================================================================== */

(function (global) {
  'use strict';

  const { SUBTESTS, SUBTEST_ORDER } = global.HudData;

  let subtesExpanded = false;
  let currentSubtesFilter = 'daily';

  let toastTimer = null;
  global.showHudToast = function (msg) {
    const el = document.getElementById('hud-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatHoursMins(totalMins) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}j ${String(m).padStart(2, '0')}m`;
  }

  function formatIndonesianDate(isoDate) {
    const parts = (isoDate || '2027-05-10').split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    if (parts.length !== 3) return isoDate;
    return `${parts[2]} ${months[(parts[1] - 1 + 12) % 12]} ${parts[0]}`;
  }

  function switchView(viewName, skipHistoryPush) {
    if (global.HudGoSpeak && typeof global.HudGoSpeak.stop === 'function') {
      global.HudGoSpeak.stop();
    }

    document.querySelectorAll('.app-view').forEach((v) => {
      v.classList.toggle('active', v.id === `view-${viewName}`);
    });

    // Sync bottom nav active state
    const navGroup = ['formulas', 'schedule', 'pomodoro'].includes(viewName)
      ? 'home'
      : ['quiz', 'errorlog', 'speeddrill'].includes(viewName)
      ? 'latihan'
      : viewName;

    document.querySelectorAll('.bnav-btn[data-nav]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.nav === navGroup);
    });

    if (!skipHistoryPush && window.history && window.history.pushState) {
      if (viewName !== 'home') {
        window.history.pushState({ view: viewName }, '', `#${viewName}`);
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function updateHeaderAndCountdown() {
    const state = global.HudStorage.getState();
    const s = state.settings;

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const parts = (s.targetDate || '2027-05-10').split('-').map(Number);
    const targetMidnight = new Date(parts[0], (parts[1] || 5) - 1, parts[2] || 10);
    const diffDays = Math.max(0, Math.ceil((targetMidnight - todayMidnight) / 86400000));
    const diffWeeks = (diffDays / 7).toFixed(1);

    document.getElementById('hero-greeting').textContent = `Halo, ${s.userName || 'Adam Candra Mahesa'}`;
    document.getElementById('hero-countdown-pill').textContent = `H-${diffDays} UTBK • ${formatIndonesianDate(s.targetDate)}`;
    document.getElementById('hero-countdown-sub').textContent = `${diffWeeks} minggu lagi menuju SNBT 2027`;

    const streak = global.HudStorage.getActiveStreakDays();
    document.getElementById('hero-streak-pill').textContent = `${streak} Hari Streak`;

    // Daily Study Target (6-8 hours)
    const today = global.HudStorage.getTodayLog();
    const totalMins = today.heavyMins + today.lightMins;
    const minHours = Number(s.minHours || 6);
    const maxHours = Math.max(minHours, Number(s.maxHours || 8));
    const maxMins = maxHours * 60;
    const minPctMarker = Math.min(100, (minHours / maxHours) * 100);
    const fillPct = Math.min(100, (totalMins / maxMins) * 100);
    const pctOfMin = Math.round((totalMins / (minHours * 60)) * 100);

    document.getElementById('daily-hours-big').textContent = `${formatHoursMins(totalMins)} / ${minHours}–${maxHours} Jam`;
    document.getElementById('daily-percent').textContent = `${pctOfMin}%`;
    document.getElementById('daily-min-marker').style.left = `${minPctMarker}%`;

    const barFill = document.getElementById('daily-progress-fill');
    barFill.style.width = `${fillPct.toFixed(1)}%`;
    barFill.classList.toggle('goal-met', totalMins >= minHours * 60);

    document.getElementById('daily-split-meta').textContent =
      `Berat ${today.heavyMins}m • Ringan ${today.lightMins}m • ${today.sessions} sesi Pomodoro`;

    renderStudyHoursChart(maxMins);
  }

  function renderScoreAndAccuracy() {
    const s = global.HudStorage.getState().settings;
    const summary = global.HudStorage.getPracticeSummary('all');
    const targetTotal = Math.max(100, Number(s.targetTotalQuestions || 12000));

    const totalPct = Math.min(100, (summary.total / targetTotal) * 100);
    const totalFormatted = summary.total.toLocaleString('id-ID');
    const targetFormatted = targetTotal.toLocaleString('id-ID');

    document.getElementById('score-total-text').textContent = `${totalFormatted} / ${targetFormatted} Soal`;
    document.getElementById('score-total-pct').textContent = `${totalPct.toFixed(1)}%`;
    document.getElementById('score-total-bar').style.width = `${totalPct.toFixed(1)}%`;

    const judged = summary.correct + summary.wrong;
    const correctPct = judged > 0 ? Math.round((summary.correct / judged) * 100) : 0;
    const wrongPct = judged > 0 ? 100 - correctPct : 0;

    document.getElementById('acc-correct-text').textContent = `Benar: ${summary.correct.toLocaleString('id-ID')} (${correctPct}%)`;
    document.getElementById('acc-wrong-text').textContent = `Salah: ${summary.wrong.toLocaleString('id-ID')} (${wrongPct}%)`;
    document.getElementById('acc-bar-correct').style.width = judged > 0 ? `${correctPct}%` : '50%';
    document.getElementById('acc-bar-wrong').style.width = judged > 0 ? `${wrongPct}%` : '50%';
    document.getElementById('acc-empty-note').classList.toggle('hidden', judged > 0);

    // Mirror to Statistik view
    const stTotal = document.getElementById('stats-total-questions');
    const stAcc = document.getElementById('stats-accuracy-overall');
    if (stTotal) stTotal.textContent = `${totalFormatted} soal`;
    if (stAcc) stAcc.textContent = `${correctPct}% (${summary.correct} benar / ${summary.wrong} salah)`;

    renderPracticeHistoryList();
  }

  function renderSubtesList() {
    const summary = global.HudStorage.getPracticeSummary(currentSubtesFilter);
    const listEl = document.getElementById('subtes-list');
    const toggleBtn = document.getElementById('btn-subtes-expand');
    if (!listEl) return;

    const visibleCodes = subtesExpanded ? SUBTEST_ORDER : SUBTEST_ORDER.slice(0, 4);

    listEl.innerHTML = visibleCodes
      .map((code) => {
        const sub = SUBTESTS[code];
        const stat = summary.bySubtes[code] || { total: 0, correct: 0 };
        return `
        <button type="button" class="subtes-row" data-sub="${code}">
          <div class="subtes-left">
            <span class="subtes-icon-box" style="background:${sub.bg}; color:${sub.color};">
              ${sub.code}
            </span>
            <div class="subtes-info">
              <div class="subtes-name">${sub.name}</div>
              <div class="subtes-meta">${sub.load === 'heavy' ? 'Materi Berat' : 'Materi Ringan'} • Pace ${sub.paceSec}s/soal</div>
            </div>
          </div>
          <div class="subtes-right">
            <span class="subtes-count">${stat.total} soal</span>
            <span class="chevron">&rsaquo;</span>
          </div>
        </button>`;
      })
      .join('');

    if (toggleBtn) {
      toggleBtn.textContent = subtesExpanded ? 'Tampilkan Ringkas' : `Lihat Semua (${SUBTEST_ORDER.length})`;
    }
  }

  function buildSmoothSvgPath(points, yTop, yBottom) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const cy0 = Math.min(yBottom, Math.max(yTop, p0.y));
      const cy1 = Math.min(yBottom, Math.max(yTop, p1.y));
      d += ` C ${midX.toFixed(1)} ${cy0.toFixed(1)}, ${midX.toFixed(1)} ${cy1.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  }

  function renderWeeklyCurveChart(targetSvgId) {
    const svg = document.getElementById(targetSvgId || 'weekly-curve-svg');
    if (!svg) return;

    const state = global.HudStorage.getState();
    const dailyTarget = Math.max(10, Number(state.settings.dailyQuestionTarget || 50));
    const weekDates = global.HudStorage.getCurrentWeekDates();
    const logs = state.practiceLogs || [];

    const dayTotals = weekDates.map((d) => {
      let total = 0;
      let correct = 0;
      logs.forEach((p) => {
        if (p.date === d.key) {
          total += p.total || 0;
          correct += p.correct || 0;
        }
      });
      return { ...d, total, correct };
    });

    const W = 420;
    const H = 190;
    const padL = 34;
    const padR = 14;
    const padT = 18;
    const padB = 28;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const yBottom = padT + plotH;

    const maxVal = Math.max(
      dailyTarget * 1.2,
      ...dayTotals.map((d) => d.total),
      20
    );
    const niceMax = Math.ceil(maxVal / 10) * 10;

    function yOf(val) {
      return yBottom - (val / niceMax) * plotH;
    }

    const totalPts = dayTotals.map((d, i) => ({
      x: padL + (i / 6) * plotW,
      y: yOf(d.total),
      val: d.total,
      label: d.dayLabel,
      isToday: d.isToday
    }));

    const correctPts = dayTotals.map((d, i) => ({
      x: padL + (i / 6) * plotW,
      y: yOf(d.correct),
      val: d.correct
    }));

    const targetY = yOf(dailyTarget);
    const totalPath = buildSmoothSvgPath(totalPts, padT, yBottom);
    const correctPath = buildSmoothSvgPath(correctPts, padT, yBottom);
    const totalArea = `${totalPath} L ${totalPts[6].x.toFixed(1)} ${yBottom} L ${totalPts[0].x.toFixed(1)} ${yBottom} Z`;
    const correctArea = `${correctPath} L ${correctPts[6].x.toFixed(1)} ${yBottom} L ${correctPts[0].x.toFixed(1)} ${yBottom} Z`;

    const gridSteps = [0, 0.5, 1];
    const gridHtml = gridSteps
      .map((ratio) => {
        const val = Math.round(niceMax * ratio);
        const gy = yOf(val).toFixed(1);
        return `
          <line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" stroke="#E2E8F0" stroke-width="1"/>
          <text x="${padL - 6}" y="${Number(gy) + 3}" text-anchor="end" font-size="10" fill="#64748B" font-family="ui-monospace, monospace">${val}</text>
        `;
      })
      .join('');

    const xLabelsHtml = totalPts
      .map(
        (pt) => `
        <text x="${pt.x.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" font-weight="${pt.isToday ? '800' : '600'}" fill="${pt.isToday ? '#DC2626' : '#64748B'}">${pt.label}</text>
      `
      )
      .join('');

    const dotsHtml = totalPts
      .map(
        (pt, idx) => `
        <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5">
          <title>${pt.label}: ${pt.val} soal dikerjakan</title>
        </circle>
        <circle cx="${correctPts[idx].x.toFixed(1)}" cy="${correctPts[idx].y.toFixed(1)}" r="3.5" fill="#22C55E" stroke="#FFFFFF" stroke-width="1.5">
          <title>${pt.label}: ${correctPts[idx].val} benar</title>
        </circle>
      `
      )
      .join('');

    const gradSuffix = targetSvgId || 'main';
    svg.innerHTML = `
      <defs>
        <linearGradient id="areaRed_${gradSuffix}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EF4444" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#EF4444" stop-opacity="0.01"/>
        </linearGradient>
        <linearGradient id="areaGreen_${gradSuffix}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#22C55E" stop-opacity="0.24"/>
          <stop offset="100%" stop-color="#22C55E" stop-opacity="0.01"/>
        </linearGradient>
      </defs>
      ${gridHtml}
      <line x1="${padL}" y1="${targetY.toFixed(1)}" x2="${W - padR}" y2="${targetY.toFixed(1)}" stroke="#EAB308" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="${W - padR}" y="${(targetY - 5).toFixed(1)}" text-anchor="end" font-size="9.5" font-weight="700" fill="#B45309">Target ${dailyTarget}</text>
      <path d="${totalArea}" fill="url(#areaRed_${gradSuffix})"/>
      <path d="${correctArea}" fill="url(#areaGreen_${gradSuffix})"/>
      <path d="${totalPath}" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round"/>
      <path d="${correctPath}" fill="none" stroke="#22C55E" stroke-width="2.8" stroke-linecap="round"/>
      ${dotsHtml}
      ${xLabelsHtml}
    `;

    const targetLabelEl = document.getElementById('legend-target-val');
    if (targetLabelEl) targetLabelEl.textContent = `Target Harian (${dailyTarget} soal)`;
  }

  function renderStudyHoursChart(maxMins) {
    const wrap = document.getElementById('stats-hours-chart');
    if (!wrap) return;
    const state = global.HudStorage.getState();
    const week = global.HudStorage.getCurrentWeekDates();
    wrap.innerHTML = '';

    week.forEach((d) => {
      const entry = state.dailyLogs[d.key];
      const mins = entry ? entry.heavyMins + entry.lightMins : 0;
      const pct = Math.min(100, Math.round((mins / maxMins) * 100));
      const col = document.createElement('div');
      col.className = 'wbar-col';
      col.title = `${d.key}: ${formatHoursMins(mins)}`;
      col.innerHTML = `
        <div class="wbar-track">
          <div class="wbar-fill ${d.isToday ? 'today' : ''}" style="height: ${pct}%"></div>
        </div>
        <span class="wbar-day">${d.dayLabel}</span>
      `;
      wrap.appendChild(col);
    });
  }

  function renderPracticeHistoryList() {
    const wrap = document.getElementById('stats-practice-history');
    if (!wrap) return;
    const logs = (global.HudStorage.getState().practiceLogs || []).slice(0, 15);
    if (logs.length === 0) {
      wrap.innerHTML = '<div class="muted">Belum ada riwayat pengerjaan soal. Mulai latihan atau klik "+ Catat Latihan Soal".</div>';
      return;
    }

    wrap.innerHTML = logs
      .map((item) => {
        const sub = SUBTESTS[item.subtes] || SUBTESTS.PK;
        return `
        <div class="history-row" data-id="${escapeHtml(item.id)}">
          <div>
            <span class="tag-pill subtes">${escapeHtml(sub.code)}</span>
            <strong>${escapeHtml(item.source)}</strong>
            <div class="muted">${escapeHtml(item.date)} &bull; ${item.total} soal (<span class="txt-green">${item.correct} benar</span>, <span class="txt-red">${item.wrong} salah</span>)</div>
          </div>
          <button type="button" class="btn-chip btn-danger-soft js-del-prac" title="Hapus catatan">&times;</button>
        </div>`;
      })
      .join('');
  }

  function refreshAllDashboard() {
    updateHeaderAndCountdown();
    renderScoreAndAccuracy();
    renderSubtesList();
    renderWeeklyCurveChart('weekly-curve-svg');
    renderWeeklyCurveChart('stats-curve-svg');
  }

  function initModals() {
    // 1. + Catat Latihan Soal Modal
    const pracModal = document.getElementById('practice-log-modal');
    const pracTotal = document.getElementById('prac-total');
    const pracCorrect = document.getElementById('prac-correct');
    const pracWrong = document.getElementById('prac-wrong');

    function openPracticeModal(defaultSubtes) {
      if (defaultSubtes) document.getElementById('prac-subtes').value = defaultSubtes;
      document.getElementById('prac-date').value = global.HudStorage.getLocalDateKey();
      pracModal.classList.remove('hidden');
    }

    ['btn-open-practice-modal', 'btn-latihan-log-manual'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => openPracticeModal());
    });
    document.getElementById('btn-close-practice').addEventListener('click', () => {
      pracModal.classList.add('hidden');
    });

    function autoSyncWrong() {
      const t = Math.max(0, Number(pracTotal.value) || 0);
      const c = Math.min(t, Math.max(0, Number(pracCorrect.value) || 0));
      pracWrong.value = String(Math.max(0, t - c));
    }
    pracTotal.addEventListener('input', autoSyncWrong);
    pracCorrect.addEventListener('input', autoSyncWrong);

    document.getElementById('form-practice-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const total = Number(pracTotal.value) || 0;
      const correct = Number(pracCorrect.value) || 0;
      const wrong = Number(pracWrong.value) || 0;
      const subtes = document.getElementById('prac-subtes').value;
      const source = document.getElementById('prac-source').value;
      const date = document.getElementById('prac-date').value || global.HudStorage.getLocalDateKey();

      global.HudStorage.logPracticeSession({ subtes, total, correct, wrong, source, date });
      pracModal.classList.add('hidden');
      document.getElementById('form-practice-log').reset();
      pracTotal.value = '20';
      pracCorrect.value = '15';
      pracWrong.value = '5';
      refreshAllDashboard();
      global.showHudToast(`+${total} soal ${subtes} (${correct} benar) tercatat!`);
    });

    // 2. Manual Study Hours Modal
    const manualModal = document.getElementById('manual-log-modal');
    const manualInput = document.getElementById('manual-minutes');
    document.getElementById('btn-manual-log').addEventListener('click', () => {
      manualModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-manual').addEventListener('click', () => {
      manualModal.classList.add('hidden');
    });
    document.querySelectorAll('.manual-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        manualInput.value = btn.dataset.mins;
      });
    });
    document.getElementById('form-manual-log').addEventListener('submit', (e) => {
      e.preventDefault();
      const subCode = document.getElementById('manual-subtes').value;
      const mins = Number(manualInput.value) || 25;
      const load = (SUBTESTS[subCode] || SUBTESTS.PK).load;
      global.HudStorage.logStudyMinutes(mins, load, false);
      manualModal.classList.add('hidden');
      refreshAllDashboard();
      global.showHudToast(`+${mins} menit (${subCode}) ditambahkan ke target harian.`);
    });

    // 3. Settings & Backup Modal
    const setModal = document.getElementById('settings-modal');
    document.getElementById('btn-settings').addEventListener('click', () => {
      const s = global.HudStorage.getState().settings;
      document.getElementById('set-user-name').value = s.userName || 'Adam Candra Mahesa';
      document.getElementById('set-target-date').value = s.targetDate;
      document.getElementById('set-min-hours').value = s.minHours;
      document.getElementById('set-max-hours').value = s.maxHours;
      document.getElementById('set-focus-mins').value = s.focusMinutes;
      document.getElementById('set-break-mins').value = s.breakMinutes;
      document.getElementById('set-total-questions').value = s.targetTotalQuestions || 12000;
      document.getElementById('set-daily-questions').value = s.dailyQuestionTarget || 50;
      setModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-settings').addEventListener('click', () => {
      setModal.classList.add('hidden');
    });
    document.getElementById('form-settings').addEventListener('submit', (e) => {
      e.preventDefault();
      const s = global.HudStorage.getState().settings;
      s.userName = document.getElementById('set-user-name').value.trim() || 'Adam Candra Mahesa';
      s.targetDate = document.getElementById('set-target-date').value || '2027-05-10';
      s.minHours = Number(document.getElementById('set-min-hours').value) || 6;
      s.maxHours = Math.max(s.minHours, Number(document.getElementById('set-max-hours').value) || 8);
      s.focusMinutes = Number(document.getElementById('set-focus-mins').value) || 25;
      s.breakMinutes = Number(document.getElementById('set-break-mins').value) || 5;
      s.targetTotalQuestions = Number(document.getElementById('set-total-questions').value) || 12000;
      s.dailyQuestionTarget = Number(document.getElementById('set-daily-questions').value) || 50;
      global.HudStorage.saveState();
      global.HudPomodoro.syncSettings();
      refreshAllDashboard();
      setModal.classList.add('hidden');
      global.showHudToast('Pengaturan disimpan.');
    });

    // Export & Import JSON Backup (File + Android WebView Text Fallback)
    const backupTextarea = document.getElementById('backup-json-text');
    function applyImportedJson(rawText) {
      global.HudStorage.importBackup(rawText);
      global.HudPomodoro.syncSettings();
      global.HudFormulas.render();
      global.HudErrorLog.render();
      global.HudSchedule.render();
      refreshAllDashboard();
      setModal.classList.add('hidden');
      global.showHudToast('Data backup berhasil dipulihkan!');
    }

    document.getElementById('btn-export-data').addEventListener('click', () => {
      const content = global.HudStorage.exportBackup();
      if (backupTextarea) backupTextarea.value = content;
      try {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snbt-go-backup-${global.HudStorage.getLocalDateKey()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        // Fallback handled by text box / clipboard
      }
      global.showHudToast('Backup JSON siap (unduhan / kotak teks).');
    });

    document.getElementById('btn-copy-backup').addEventListener('click', () => {
      const content = global.HudStorage.exportBackup();
      if (backupTextarea) {
        backupTextarea.value = content;
        backupTextarea.select();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(
          () => global.showHudToast('Teks backup disalin ke clipboard!'),
          () => global.showHudToast('Backup tampil di kotak teks — salin manual.')
        );
      } else {
        try {
          document.execCommand('copy');
          global.showHudToast('Teks backup disalin!');
        } catch (e) {
          global.showHudToast('Silakan salin teks dari kotak di bawah.');
        }
      }
    });

    document.getElementById('btn-restore-text-backup').addEventListener('click', () => {
      const raw = backupTextarea ? backupTextarea.value.trim() : '';
      if (!raw) {
        global.showHudToast('Tempel dulu teks JSON backup.');
        return;
      }
      try {
        applyImportedJson(raw);
      } catch (err) {
        global.showHudToast('Format teks JSON tidak valid.');
      }
    });

    document.getElementById('input-import-data').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          applyImportedJson(reader.result);
        } catch (err) {
          global.showHudToast('Gagal membaca file backup JSON.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    // 4. Center FAB Quick Action Modal (Start Pomodoro or Latihan Soal)
    const fabModal = document.getElementById('fab-action-modal');
    document.getElementById('btn-fab-center').addEventListener('click', () => {
      fabModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-fab').addEventListener('click', () => {
      fabModal.classList.add('hidden');
    });
    document.getElementById('fab-go-pomodoro').addEventListener('click', () => {
      fabModal.classList.add('hidden');
      switchView('pomodoro');
    });
    document.getElementById('fab-go-quiz').addEventListener('click', () => {
      fabModal.classList.add('hidden');
      switchView('quiz');
    });
    document.getElementById('fab-go-drill').addEventListener('click', () => {
      fabModal.classList.add('hidden');
      switchView('speeddrill');
    });
    const fabSched = document.getElementById('fab-go-schedule');
    if (fabSched) {
      fabSched.addEventListener('click', () => {
        fabModal.classList.add('hidden');
        switchView('schedule');
      });
    }
  }

  function registerServiceWorker() {
    const isNativeCap = Boolean(
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === 'function' &&
      window.Capacitor.isNativePlatform()
    );
    if (isNativeCap) return;

    if (
      'serviceWorker' in navigator &&
      (location.protocol === 'http:' || location.protocol === 'https:')
    ) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  window.addEventListener('popstate', () => {
    const openModal = document.querySelector('.modal-backdrop:not(.hidden)');
    if (openModal) {
      openModal.classList.add('hidden');
      return;
    }
    const hashView = (location.hash || '').replace('#', '');
    if (hashView && document.getElementById(`view-${hashView}`)) {
      switchView(hashView, true);
    } else {
      switchView('home', true);
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    // View navigation bindings
    document.querySelectorAll('[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Subtes Filter & Expand Toggle
    const subtesFilterEl = document.getElementById('subtes-period-filter');
    if (subtesFilterEl) {
      subtesFilterEl.addEventListener('change', () => {
        currentSubtesFilter = subtesFilterEl.value;
        renderSubtesList();
      });
    }
    const subtesExpandBtn = document.getElementById('btn-subtes-expand');
    if (subtesExpandBtn) {
      subtesExpandBtn.addEventListener('click', () => {
        subtesExpanded = !subtesExpanded;
        renderSubtesList();
      });
    }

    // Click any subtest row to launch Mini-Quiz for that subtest
    const subtesListEl = document.getElementById('subtes-list');
    if (subtesListEl) {
      subtesListEl.addEventListener('click', (e) => {
        const row = e.target.closest('.subtes-row');
        if (!row) return;
        const code = row.dataset.sub;
        global.HudQuiz.selectSubtes(code);
        switchView('quiz');
      });
    }

    // Delete practice history item in Statistik view
    const histEl = document.getElementById('stats-practice-history');
    if (histEl) {
      histEl.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.js-del-prac');
        if (!delBtn) return;
        const row = delBtn.closest('.history-row');
        if (!row) return;
        global.HudStorage.deletePracticeLog(row.dataset.id);
        refreshAllDashboard();
        global.showHudToast('Catatan latihan dihapus.');
      });
    }

    global.HudPomodoro.init(refreshAllDashboard);
    global.HudFormulas.init();
    global.HudErrorLog.init();
    if (global.HudGoSpeak && typeof global.HudGoSpeak.init === 'function') {
      global.HudGoSpeak.init();
    }
    global.HudQuiz.init(refreshAllDashboard);
    global.HudSpeedDrill.init(refreshAllDashboard);
    global.HudSchedule.init(() => switchView('pomodoro'), refreshAllDashboard, switchView);
    initModals();
    refreshAllDashboard();
    registerServiceWorker();
  });
})(window);

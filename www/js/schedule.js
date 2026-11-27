/* ==========================================================================
   schedule.js — Jadwal & Rencana Belajar + Auto-Shift Time-Blocking Mode
   - Daily blocks: Jam Mulai, Jam Selesai, Subtes UTBK, Target Jumlah Soal
   - Active Scheduled Mode: global countdown header + auto-shift / pembahasan
   - Soft Web Audio chime + brief transition banner
   ========================================================================== */

(function (global) {
  'use strict';

  const { SUBTESTS } = global.HudData;
  let onNavigatePomodoro = null;
  let onDataUpdated = null;
  let onNavigateView = null;

  let scheduled = {
    active: false,
    paused: false,
    queue: [],
    currentPos: 0,
    totalBlockMs: 0,
    remainingMs: 0,
    endTs: 0,
    elapsedActiveMs: 0,
    lastTickTs: 0,
    quizAnswered: 0,
    quizTarget: 0,
    quizCompletedEarly: false,
    reviewPendingNext: false,
    tickTimerId: null,
    transitionTimerId: null,
    transitionSecLeft: 0
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDuration(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function playSoftChime() {
    const state = global.HudStorage.getState();
    if (state.settings && state.settings.muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startAt = ctx.currentTime + i * 0.13;
        gain.gain.setValueAtTime(0.001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.09, startAt + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.35);
      });
    } catch (e) {
      // Ignore Web Audio blocks cleanly
    }
  }

  function flushActiveMinutesForBlock(block) {
    if (!block) return;
    const mins = Math.floor(scheduled.elapsedActiveMs / 60000);
    if (mins >= 1) {
      const sub = SUBTESTS[block.subtes] || SUBTESTS.PK;
      global.HudStorage.logStudyMinutes(mins, sub.load, false);
      scheduled.elapsedActiveMs -= mins * 60000;
      if (typeof onDataUpdated === 'function') onDataUpdated();
    }
  }

  function getActiveBlock() {
    if (!scheduled.active || scheduled.currentPos >= scheduled.queue.length) return null;
    return scheduled.queue[scheduled.currentPos];
  }

  function getNextBlock() {
    if (!scheduled.active || scheduled.currentPos + 1 >= scheduled.queue.length) return null;
    return scheduled.queue[scheduled.currentPos + 1];
  }

  function renderActiveHeader() {
    const header = document.getElementById('scheduled-active-header');
    const drawerSub = document.getElementById('drawer-schedule-sub');
    const block = getActiveBlock();

    if (!scheduled.active || !block) {
      if (header) header.classList.add('hidden');
      if (drawerSub) {
        const list = global.HudStorage.getState().studyPlan || [];
        drawerSub.textContent = `${list.length} blok • Auto-Shift`;
      }
      return;
    }

    if (header) header.classList.remove('hidden');

    const next = getNextBlock();
    const timeText = formatDuration(scheduled.remainingMs);
    const pct = scheduled.totalBlockMs > 0
      ? Math.min(100, Math.max(0, ((scheduled.totalBlockMs - scheduled.remainingMs) / scheduled.totalBlockMs) * 100))
      : 0;

    const timerEl = document.getElementById('sch-active-timer');
    const titleEl = document.getElementById('sch-active-block-info');
    const nextEl = document.getElementById('sch-active-next-info');
    const barEl = document.getElementById('sch-active-bar-fill');
    const pauseBtn = document.getElementById('btn-sch-pause');
    const noteEl = document.getElementById('sch-early-finish-note');

    if (timerEl) timerEl.textContent = timeText;
    if (titleEl) {
      titleEl.textContent = `Blok ${scheduled.currentPos + 1}/${scheduled.queue.length}: ${block.subtes} (${block.startTime}–${block.endTime}) • Soal ${scheduled.quizAnswered}/${scheduled.quizTarget}`;
    }
    if (nextEl) {
      nextEl.textContent = next
        ? `Berikutnya: ${next.subtes} • ${next.targetQuestions} Soal (${next.startTime}–${next.endTime})`
        : 'Blok Terakhir → Pembahasan Akhir';
    }
    if (barEl) barEl.style.width = `${pct.toFixed(1)}%`;
    if (pauseBtn) pauseBtn.textContent = scheduled.paused ? '▶ Lanjut' : '⏸ Jeda';
    if (noteEl) noteEl.classList.toggle('hidden', !scheduled.quizCompletedEarly);

    if (drawerSub) {
      drawerSub.textContent = `AKTIF ${timeText} • ${block.subtes}`;
    }
  }

  function computeInitialRemainingMs(block) {
    const mins = Math.max(1, Number(block.mins) || 60);
    const now = new Date();
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const startMin = global.HudStorage.timeStrToMins(block.startTime);
    const endMin = global.HudStorage.timeStrToMins(block.endTime);

    if (startMin !== null && endMin !== null) {
      const startSec = startMin * 60;
      let endSec = endMin * 60;
      if (endMin <= startMin) endSec += 86400;
      let adjNowSec = nowSec;
      if (endMin <= startMin && nowSec < startSec) adjNowSec += 86400;

      if (adjNowSec >= startSec && adjNowSec < endSec) {
        const diffMs = (endSec - adjNowSec) * 1000;
        if (diffMs >= 10000) return diffMs;
      }
    }
    return mins * 60 * 1000;
  }

  function startCurrentBlock() {
    clearInterval(scheduled.transitionTimerId);
    scheduled.transitionTimerId = null;
    const modal = document.getElementById('schedule-transition-modal');
    if (modal) modal.classList.add('hidden');

    const block = getActiveBlock();
    if (!block) {
      stopScheduledMode(false);
      return;
    }

    const remMs = computeInitialRemainingMs(block);
    scheduled.totalBlockMs = remMs;
    scheduled.remainingMs = remMs;
    scheduled.endTs = Date.now() + remMs;
    scheduled.lastTickTs = Date.now();
    scheduled.paused = false;
    scheduled.elapsedActiveMs = 0;
    scheduled.quizAnswered = 0;
    scheduled.quizTarget = block.targetQuestions || 10;
    scheduled.quizCompletedEarly = false;
    scheduled.reviewPendingNext = false;

    clearInterval(scheduled.tickTimerId);
    scheduled.tickTimerId = setInterval(tickScheduledTimer, 500);

    if (typeof onNavigateView === 'function') {
      onNavigateView('quiz');
    }
    if (global.HudQuiz && typeof global.HudQuiz.startScheduledSession === 'function') {
      global.HudQuiz.startScheduledSession(block.subtes, block.targetQuestions || 10, block);
    }

    render();
    renderActiveHeader();
  }

  function executeTransitionTarget(modeAction, hasNext) {
    clearInterval(scheduled.transitionTimerId);
    scheduled.transitionTimerId = null;
    const modal = document.getElementById('schedule-transition-modal');
    if (modal) modal.classList.add('hidden');

    if (!scheduled.active) return;

    if (hasNext && modeAction === 'next') {
      scheduled.currentPos += 1;
      startCurrentBlock();
    } else if (hasNext && modeAction === 'review') {
      scheduled.reviewPendingNext = true;
      scheduled.paused = true;
      if (typeof onNavigateView === 'function') onNavigateView('quiz');
      if (global.HudQuiz && typeof global.HudQuiz.showResultsView === 'function') {
        global.HudQuiz.showResultsView();
      }
      renderActiveHeader();
    } else {
      // Final block completed -> open Pembahasan cleanly and stop timer
      stopScheduledMode(true);
      if (typeof onNavigateView === 'function') onNavigateView('quiz');
      if (global.HudQuiz && typeof global.HudQuiz.showResultsView === 'function') {
        global.HudQuiz.showResultsView();
      }
    }
  }

  function finishBlockAndTransition() {
    clearInterval(scheduled.tickTimerId);
    scheduled.tickTimerId = null;

    const block = getActiveBlock();
    if (!block) {
      stopScheduledMode(false);
      return;
    }

    // Flush active minutes & mark block done today
    const sub = SUBTESTS[block.subtes] || SUBTESTS.PK;
    const minsLogged = Math.max(1, Math.round(scheduled.elapsedActiveMs / 60000));
    global.HudStorage.logStudyMinutes(minsLogged, sub.load, false);
    scheduled.elapsedActiveMs = 0;

    const state = global.HudStorage.getState();
    const todayKey = global.HudStorage.getLocalDateKey();
    const realBlock = (state.studyPlan || []).find((x) => x.id === block.id);
    if (realBlock) {
      realBlock.doneDate = todayKey;
      global.HudStorage.saveState();
    }
    if (typeof onDataUpdated === 'function') onDataUpdated();
    render();

    // Finalize partial quiz answers silently so stats are recorded
    if (!scheduled.quizCompletedEarly && global.HudQuiz && typeof global.HudQuiz.finalizeScheduledPartial === 'function') {
      global.HudQuiz.finalizeScheduledPartial(false);
    }

    const next = getNextBlock();
    const hasNext = Boolean(next);
    const endAction = (state.settings && state.settings.scheduleEndAction) || 'next';

    playSoftChime();

    // Show brief transition notification with 3-second countdown
    const modal = document.getElementById('schedule-transition-modal');
    const titleEl = document.getElementById('sch-trans-title');
    const descEl = document.getElementById('sch-trans-desc');
    const subEl = document.getElementById('sch-trans-countdown');
    const goNowBtn = document.getElementById('btn-sch-trans-now');

    if (titleEl) {
      titleEl.textContent = `⏰ Waktu Blok ${block.subtes} (${block.startTime}–${block.endTime}) Selesai!`;
    }
    if (descEl) {
      if (hasNext && endAction === 'next') {
        descEl.textContent = `Progres tercatat (${scheduled.quizAnswered}/${scheduled.quizTarget} soal). Otomatis pindah ke sesi berikutnya: ${next.subtes} (${next.targetQuestions} Soal).`;
      } else {
        descEl.textContent = hasNext
          ? `Blok ${block.subtes} selesai. Membuka halaman pembahasan hasil latihanmu.`
          : `Semua blok terjadwal selesai! Membuka halaman pembahasan akhir untuk evaluasi.`;
      }
    }

    if (!modal) {
      executeTransitionTarget(endAction, hasNext);
      return;
    }

    scheduled.transitionSecLeft = 3;
    if (subEl) {
      subEl.textContent = hasNext && endAction === 'next'
        ? `Pindah otomatis ke ${next.subtes} dalam ${scheduled.transitionSecLeft} detik...`
        : `Membuka halaman pembahasan dalam ${scheduled.transitionSecLeft} detik...`;
    }
    if (goNowBtn) {
      goNowBtn.textContent = hasNext && endAction === 'next'
        ? `Mulai ${next.subtes} Sekarang →`
        : 'Buka Pembahasan Sekarang →';
      goNowBtn.onclick = () => executeTransitionTarget(endAction, hasNext);
    }

    modal.classList.remove('hidden');
    clearInterval(scheduled.transitionTimerId);
    scheduled.transitionTimerId = setInterval(() => {
      scheduled.transitionSecLeft -= 1;
      if (subEl && scheduled.transitionSecLeft > 0) {
        subEl.textContent = hasNext && endAction === 'next'
          ? `Pindah otomatis ke ${next.subtes} dalam ${scheduled.transitionSecLeft} detik...`
          : `Membuka halaman pembahasan dalam ${scheduled.transitionSecLeft} detik...`;
      }
      if (scheduled.transitionSecLeft <= 0) {
        executeTransitionTarget(endAction, hasNext);
      }
    }, 1000);
  }

  function tickScheduledTimer() {
    if (!scheduled.active || scheduled.paused) return;
    const now = Date.now();
    const delta = Math.max(0, now - scheduled.lastTickTs);
    scheduled.lastTickTs = now;
    scheduled.elapsedActiveMs += delta;
    scheduled.remainingMs = Math.max(0, scheduled.endTs - now);

    renderActiveHeader();

    if (scheduled.remainingMs <= 0) {
      finishBlockAndTransition();
    }
  }

  function togglePauseScheduled() {
    if (!scheduled.active) return;
    if (scheduled.paused) {
      scheduled.paused = false;
      scheduled.endTs = Date.now() + scheduled.remainingMs;
      scheduled.lastTickTs = Date.now();
      clearInterval(scheduled.tickTimerId);
      scheduled.tickTimerId = setInterval(tickScheduledTimer, 500);
    } else {
      scheduled.remainingMs = Math.max(0, scheduled.endTs - Date.now());
      scheduled.paused = true;
      clearInterval(scheduled.tickTimerId);
      scheduled.tickTimerId = null;
      flushActiveMinutesForBlock(getActiveBlock());
    }
    renderActiveHeader();
  }

  function stopScheduledMode(keepFinishedQuizResults) {
    clearInterval(scheduled.tickTimerId);
    clearInterval(scheduled.transitionTimerId);
    scheduled.tickTimerId = null;
    scheduled.transitionTimerId = null;

    if (scheduled.active) {
      flushActiveMinutesForBlock(getActiveBlock());
    }

    const modal = document.getElementById('schedule-transition-modal');
    if (modal) modal.classList.add('hidden');

    scheduled.active = false;
    scheduled.paused = false;
    scheduled.reviewPendingNext = false;
    scheduled.queue = [];
    scheduled.currentPos = 0;

    if (global.HudQuiz && typeof global.HudQuiz.clearScheduledContext === 'function') {
      global.HudQuiz.clearScheduledContext();
    }

    if (!keepFinishedQuizResults && typeof global.showHudToast === 'function') {
      global.showHudToast('Mode Belajar Terjadwal dihentikan.');
    }
    render();
    renderActiveHeader();
  }

  function startScheduledMode(startFromBlockId) {
    const state = global.HudStorage.getState();
    const plan = global.HudStorage.normalizeStudyPlan(state.studyPlan || []);
    if (plan.length === 0) {
      if (typeof global.showHudToast === 'function') {
        global.showHudToast('Tambahkan minimal 1 blok jadwal terlebih dahulu!');
      }
      return;
    }

    const todayKey = global.HudStorage.getLocalDateKey();
    let startIdx = 0;

    if (startFromBlockId) {
      const found = plan.findIndex((b) => b.id === startFromBlockId);
      startIdx = found >= 0 ? found : 0;
    } else {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const activeByClock = plan.findIndex((b) => {
        const s = global.HudStorage.timeStrToMins(b.startTime);
        const e = global.HudStorage.timeStrToMins(b.endTime);
        if (s === null || e === null) return false;
        return e > s ? (nowMin >= s && nowMin < e) : (nowMin >= s || nowMin < e);
      });

      if (activeByClock >= 0 && plan[activeByClock].doneDate !== todayKey) {
        startIdx = activeByClock;
      } else {
        const firstPending = plan.findIndex((b) => b.doneDate !== todayKey);
        startIdx = firstPending >= 0 ? firstPending : 0;
      }
    }

    scheduled.active = true;
    scheduled.queue = plan;
    scheduled.currentPos = startIdx;
    startCurrentBlock();
  }

  function onQuizProgress(answeredCount, totalTarget) {
    if (!scheduled.active) return;
    scheduled.quizAnswered = answeredCount;
    scheduled.quizTarget = totalTarget;
    renderActiveHeader();
  }

  function onQuizCompletedEarly() {
    if (!scheduled.active) return;
    scheduled.quizCompletedEarly = true;
    scheduled.quizAnswered = scheduled.quizTarget;
    renderActiveHeader();
    if (typeof global.showHudToast === 'function') {
      global.showHudToast('Target soal blok tercapai! Pelajari pembahasan sambil menunggu blok selesai.');
    }
  }

  function advanceAfterReview() {
    if (!scheduled.active) return;
    const next = getNextBlock();
    if (next) {
      scheduled.currentPos += 1;
      startCurrentBlock();
    } else {
      stopScheduledMode(true);
    }
  }

  function render() {
    const state = global.HudStorage.getState();
    const list = global.HudStorage.normalizeStudyPlan(state.studyPlan || []);
    state.studyPlan = list;

    const todayKey = global.HudStorage.getLocalDateKey();
    const container = document.getElementById('schedule-list');
    const summaryEl = document.getElementById('schedule-summary');
    const endActionSelect = document.getElementById('sch-end-action');
    if (endActionSelect && state.settings) {
      endActionSelect.value = state.settings.scheduleEndAction || 'next';
    }
    if (!container) return;

    let doneCount = 0;
    let totalMins = 0;
    let totalQ = 0;
    list.forEach((b) => {
      totalMins += Number(b.mins || 60);
      totalQ += Number(b.targetQuestions || 10);
      if (b.doneDate === todayKey) doneCount += 1;
    });

    if (summaryEl) {
      summaryEl.textContent = `${doneCount} / ${list.length} blok selesai hari ini • Total ${(totalMins / 60).toFixed(1)} jam • ${totalQ} soal terencana`;
    }

    if (list.length === 0) {
      container.innerHTML = '<div class="muted">Belum ada jadwal belajar. Tambahkan blok baru di atas.</div>';
      renderActiveHeader();
      return;
    }

    const activeBlock = getActiveBlock();
    container.innerHTML = list
      .map((item) => {
        const isDone = item.doneDate === todayKey;
        const isRunningRow = activeBlock && activeBlock.id === item.id;
        const sub = SUBTESTS[item.subtes] || SUBTESTS.PK;
        return `
        <div class="schedule-row ${isDone ? 'done' : ''} ${isRunningRow ? 'running-now' : ''}" data-id="${escapeHtml(item.id)}">
          <button type="button" class="sch-check ${isDone ? 'checked' : ''}" data-action="toggle" aria-label="Tandai Selesai">
            ${isDone ? '✓' : ''}
          </button>
          <div class="sch-body">
            <div class="sch-top">
              <span class="sch-time">${escapeHtml(item.startTime)} – ${escapeHtml(item.endTime)}</span>
              <span class="tag-pill subtes">${escapeHtml(sub.code)}</span>
              <span class="tag-pill target-q">${item.targetQuestions} Soal</span>
              <span class="load-badge ${sub.load}">${sub.load === 'heavy' ? 'BERAT' : 'RINGAN'}</span>
              <span class="mono-meta">${item.mins}m</span>
            </div>
            <div class="sch-title">${escapeHtml(item.title)}</div>
          </div>
          <div class="sch-actions">
            <button type="button" class="btn-chip active-gold" data-action="start-block" title="Mulai Belajar Terjadwal dari blok ini">▶ Mulai</button>
            <button type="button" class="btn-chip" data-action="edit" title="Edit blok">Edit</button>
            <button type="button" class="btn-chip" data-action="focus" title="Buka di Pomodoro">Pomo</button>
            <button type="button" class="btn-chip btn-danger-soft" data-action="delete" title="Hapus">&times;</button>
          </div>
        </div>`;
      })
      .join('');

    renderActiveHeader();
  }

  function resetFormToAdd() {
    const form = document.getElementById('form-schedule-add');
    const editIdEl = document.getElementById('sch-edit-id');
    const submitBtn = document.getElementById('btn-sch-submit');
    const cancelEditBtn = document.getElementById('btn-sch-cancel-edit');
    if (form) form.reset();
    if (editIdEl) editIdEl.value = '';
    if (submitBtn) submitBtn.textContent = '+ Tambah Blok';
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    const sEl = document.getElementById('sch-start-time');
    const eEl = document.getElementById('sch-end-time');
    const qEl = document.getElementById('sch-target-q');
    if (sEl) sEl.value = '07:00';
    if (eEl) eEl.value = '08:00';
    if (qEl) qEl.value = '10';
  }

  function init(navigatePomoCb, dataUpdatedCb, navigateViewCb) {
    onNavigatePomodoro = navigatePomoCb;
    onDataUpdated = dataUpdatedCb;
    onNavigateView = navigateViewCb;

    const form = document.getElementById('form-schedule-add');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const state = global.HudStorage.getState();
        const startTime = document.getElementById('sch-start-time').value || '07:00';
        const endTime = document.getElementById('sch-end-time').value || '08:00';
        if (startTime === endTime) {
          if (typeof global.showHudToast === 'function') {
            global.showHudToast('Jam mulai dan jam selesai tidak boleh sama!');
          }
          return;
        }
        const subtes = document.getElementById('sch-subtes').value;
        const targetQuestions = Math.max(1, Math.min(100, Number(document.getElementById('sch-target-q').value) || 10));
        const customTitle = document.getElementById('sch-title').value.trim();
        const editId = (document.getElementById('sch-edit-id') || {}).value || '';
        const sub = SUBTESTS[subtes] || SUBTESTS.PK;
        const mins = global.HudStorage.computeBlockMins(startTime, endTime, 60);

        const payload = {
          id: editId || ('sch_' + Date.now()),
          startTime,
          endTime,
          time: startTime,
          title: customTitle || `${targetQuestions} Soal ${sub.code} (${sub.name})`,
          subtes,
          targetQuestions,
          mins,
          load: sub.load,
          doneDate: ''
        };

        if (editId) {
          const idx = state.studyPlan.findIndex((x) => x.id === editId);
          if (idx !== -1) {
            payload.doneDate = state.studyPlan[idx].doneDate || '';
            state.studyPlan[idx] = payload;
          }
        } else {
          state.studyPlan.push(payload);
        }

        state.studyPlan = global.HudStorage.normalizeStudyPlan(state.studyPlan);
        global.HudStorage.saveState();
        resetFormToAdd();
        render();
        if (typeof global.showHudToast === 'function') {
          global.showHudToast(editId ? 'Blok jadwal diperbarui.' : `Blok ${subtes} (${targetQuestions} soal) ditambahkan.`);
        }
      });
    }

    const cancelEditBtn = document.getElementById('btn-sch-cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetFormToAdd);

    const endActionSelect = document.getElementById('sch-end-action');
    if (endActionSelect) {
      endActionSelect.addEventListener('change', () => {
        const state = global.HudStorage.getState();
        state.settings.scheduleEndAction = endActionSelect.value;
        global.HudStorage.saveState();
      });
    }

    const startAutoBtn = document.getElementById('btn-start-scheduled-mode');
    if (startAutoBtn) startAutoBtn.addEventListener('click', () => startScheduledMode(null));

    const resetDefaultBtn = document.getElementById('btn-sch-reset-default');
    if (resetDefaultBtn) {
      resetDefaultBtn.addEventListener('click', () => {
        const state = global.HudStorage.getState();
        state.studyPlan = global.HudStorage.createDefaultSchedule();
        global.HudStorage.saveState();
        resetFormToAdd();
        render();
        if (typeof global.showHudToast === 'function') {
          global.showHudToast('Jadwal dikembalikan ke blueprint default SNBT.');
        }
      });
    }

    const pauseBtn = document.getElementById('btn-sch-pause');
    const nextNowBtn = document.getElementById('btn-sch-next-block');
    const stopBtn = document.getElementById('btn-sch-stop');
    const transCancelBtn = document.getElementById('btn-sch-trans-stop');

    if (pauseBtn) pauseBtn.addEventListener('click', togglePauseScheduled);
    if (nextNowBtn) {
      nextNowBtn.addEventListener('click', () => {
        if (scheduled.reviewPendingNext) advanceAfterReview();
        else finishBlockAndTransition();
      });
    }
    if (stopBtn) stopBtn.addEventListener('click', () => stopScheduledMode(false));
    if (transCancelBtn) transCancelBtn.addEventListener('click', () => stopScheduledMode(true));

    const container = document.getElementById('schedule-list');
    if (container) {
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const row = btn.closest('.schedule-row');
        if (!row) return;
        const id = row.dataset.id;
        const state = global.HudStorage.getState();
        const idx = state.studyPlan.findIndex((x) => x.id === id);
        if (idx === -1) return;

        const item = state.studyPlan[idx];
        const action = btn.dataset.action;

        if (action === 'toggle') {
          const todayKey = global.HudStorage.getLocalDateKey();
          item.doneDate = item.doneDate === todayKey ? '' : todayKey;
          global.HudStorage.saveState();
          render();
        } else if (action === 'delete') {
          state.studyPlan.splice(idx, 1);
          global.HudStorage.saveState();
          render();
        } else if (action === 'edit') {
          document.getElementById('sch-edit-id').value = item.id;
          document.getElementById('sch-start-time').value = item.startTime || '07:00';
          document.getElementById('sch-end-time').value = item.endTime || '08:00';
          document.getElementById('sch-subtes').value = item.subtes || 'PK';
          document.getElementById('sch-target-q').value = String(item.targetQuestions || 10);
          document.getElementById('sch-title').value = item.title || '';
          document.getElementById('btn-sch-submit').textContent = 'Simpan Perubahan';
          document.getElementById('btn-sch-cancel-edit').classList.remove('hidden');
          form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (action === 'start-block') {
          startScheduledMode(item.id);
        } else if (action === 'focus') {
          if (global.HudPomodoro && typeof global.HudPomodoro.setSubject === 'function') {
            global.HudPomodoro.setSubject(item.subtes);
          }
          if (typeof onNavigatePomodoro === 'function') onNavigatePomodoro();
        }
      });
    }

    render();
  }

  global.HudSchedule = {
    init,
    render,
    isActive: () => scheduled.active,
    getActiveBlock,
    getNextBlock,
    startScheduledMode,
    stopScheduledMode,
    advanceAfterReview,
    onQuizProgress,
    onQuizCompletedEarly
  };
})(window);

/* ==========================================================================
   quiz.js — Latihan Soal Subtes (Mini-Quiz Pace UTBK + Tips Langkah Pertama + GOSpeak)
   Supports Standalone Mode & Jadwal Belajar Otomatis (Scheduled Time-Blocking).
   ========================================================================== */

(function (global) {
  'use strict';

  const { SUBTESTS, QUIZ_BANK } = global.HudData;

  let sessionQuestions = [];
  let currentIdx = 0;
  let selectedOption = null;
  let questionStartTs = 0;
  let paceTimer = null;
  let results = [];
  let sessionLogged = false;
  let activeScheduledBlock = null;
  let onDataUpdated = null;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function fmtSec(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }

  function updatePacePreview() {
    const subCode = (document.getElementById('quiz-subtes-select') || {}).value || 'ALL';
    const preview = document.getElementById('quiz-pace-preview');
    if (!preview) return;
    if (subCode === 'ALL') {
      preview.textContent =
        'Standar Pace: Campuran otomatis menyesuaikan target waktu resmi tiap subtes (45–90 detik/soal).';
    } else {
      const sub = SUBTESTS[subCode];
      preview.textContent = `Standar Pace ${sub.code} (${sub.name}): maksimal ${sub.paceSec} detik per soal agar aman di UTBK.`;
    }
  }

  function updatePaceUI() {
    const q = sessionQuestions[currentIdx];
    if (!q) return;
    const sub = SUBTESTS[q.subtes] || SUBTESTS.PK;
    const target = sub.paceSec;
    const elapsed = (Date.now() - questionStartTs) / 1000;
    const ratio = elapsed / target;

    const timerEl = document.getElementById('quiz-pace-timer');
    const statusEl = document.getElementById('quiz-pace-status');
    const barEl = document.getElementById('quiz-pace-bar-fill');

    if (timerEl) timerEl.textContent = `${fmtSec(elapsed)} / ${fmtSec(target)} target`;
    if (barEl) {
      barEl.style.width = `${Math.min(100, ratio * 100).toFixed(1)}%`;
      barEl.className = `pace-bar-fill ${ratio > 1 ? 'over' : ratio >= 0.7 ? 'warn' : ''}`;
    }
    if (statusEl) {
      if (ratio > 1) {
        statusEl.textContent = 'OVER PACE';
        statusEl.className = 'pace-pill over';
      } else if (ratio >= 0.7) {
        statusEl.textContent = 'WASPADA';
        statusEl.className = 'pace-pill warn';
      } else {
        statusEl.textContent = 'ON PACE';
        statusEl.className = 'pace-pill ok';
      }
    }
  }

  function showView(viewId) {
    ['quiz-setup', 'quiz-active', 'quiz-results'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', id !== viewId);
    });
  }

  function renderQuestion() {
    const q = sessionQuestions[currentIdx];
    if (!q) {
      finishQuiz(true);
      return;
    }

    if (global.HudGoSpeak && typeof global.HudGoSpeak.stop === 'function') {
      global.HudGoSpeak.stop();
    }

    selectedOption = null;
    questionStartTs = Date.now();

    const sub = SUBTESTS[q.subtes] || SUBTESTS.PK;
    document.getElementById('quiz-q-progress').textContent = `SOAL ${currentIdx + 1} / ${sessionQuestions.length}`;

    const subBadge = document.getElementById('quiz-q-subtes');
    subBadge.textContent = `${sub.code} • ${sub.paceSec}s`;
    subBadge.className = `load-badge ${sub.load}`;

    // Bubble 💡 Tips Langkah Pertama
    const tipText = q.firstStepTip || 'Identifikasi kata kunci utama dan konsep dasar yang ditanyakan pada soal.';
    const tipEl = document.getElementById('quiz-first-step-tip');
    if (tipEl) tipEl.textContent = tipText;

    const tipSpeakBtn = document.getElementById('btn-gospeak-tip');
    if (tipSpeakBtn) {
      tipSpeakBtn.dataset.defaultLabel = q.subtes === 'LBE' ? 'Dengarkan GOSpeak (EN)' : 'Dengarkan GOSpeak';
      const lbl = tipSpeakBtn.querySelector('.js-gospeak-btn-label');
      if (lbl) lbl.textContent = tipSpeakBtn.dataset.defaultLabel;
    }

    const qSpeakBtn = document.getElementById('btn-gospeak-question');
    if (qSpeakBtn) {
      qSpeakBtn.dataset.defaultLabel = q.subtes === 'LBE' ? 'Bacakan Teks Soal (EN)' : 'Bacakan Soal (ID)';
      const lbl = qSpeakBtn.querySelector('.js-gospeak-btn-label');
      if (lbl) lbl.textContent = qSpeakBtn.dataset.defaultLabel;
    }

    document.getElementById('quiz-question-text').textContent = q.q;

    const optWrap = document.getElementById('quiz-options');
    optWrap.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span class="opt-letter">${letters[idx]}.</span><span>${escapeHtml(optText)}</span>`;
      btn.addEventListener('click', () => {
        selectedOption = idx;
        optWrap.querySelectorAll('.quiz-opt-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('btn-quiz-next').disabled = false;
      });
      optWrap.appendChild(btn);
    });

    const nextBtn = document.getElementById('btn-quiz-next');
    nextBtn.disabled = true;
    nextBtn.textContent = currentIdx === sessionQuestions.length - 1 ? 'Selesaikan Sesi' : 'Jawab & Lanjut →';

    if (global.HudGoSpeak && typeof global.HudGoSpeak.syncUI === 'function') {
      global.HudGoSpeak.syncUI();
    }

    clearInterval(paceTimer);
    updatePaceUI();
    paceTimer = setInterval(updatePaceUI, 250);
  }

  function buildQuestionBatch(subFilter, count) {
    const pool = subFilter === 'ALL'
      ? QUIZ_BANK
      : QUIZ_BANK.filter((q) => q.subtes === subFilter);
    if (pool.length === 0) return [];

    const batch = [];
    while (batch.length < count) {
      const shuffled = shuffle(pool);
      for (let i = 0; i < shuffled.length && batch.length < count; i++) {
        batch.push(shuffled[i]);
      }
    }
    return batch;
  }

  function startQuizInternal(subFilter, count, scheduledBlock) {
    activeScheduledBlock = scheduledBlock || null;
    sessionQuestions = buildQuestionBatch(subFilter, count);
    currentIdx = 0;
    results = [];
    sessionLogged = false;

    showView('quiz-active');
    renderQuestion();

    if (activeScheduledBlock && global.HudSchedule && typeof global.HudSchedule.onQuizProgress === 'function') {
      global.HudSchedule.onQuizProgress(0, sessionQuestions.length);
    }
  }

  function startQuiz(overrideSubtes) {
    const selectEl = document.getElementById('quiz-subtes-select');
    if (overrideSubtes && selectEl) {
      selectEl.value = overrideSubtes;
      updatePacePreview();
    }
    const subFilter = selectEl ? selectEl.value : 'ALL';
    const count = Number((document.getElementById('quiz-count-select') || {}).value) || 5;
    startQuizInternal(subFilter, count, null);
  }

  function startScheduledSession(subCode, targetCount, blockObj) {
    const selectEl = document.getElementById('quiz-subtes-select');
    if (selectEl && subCode) {
      selectEl.value = subCode;
      updatePacePreview();
    }
    startQuizInternal(subCode || 'PK', Math.max(1, Number(targetCount) || 10), blockObj);
  }

  function commitAnswer() {
    if (selectedOption === null) return;
    const q = sessionQuestions[currentIdx];
    const sub = SUBTESTS[q.subtes] || SUBTESTS.PK;
    const elapsedSec = Math.max(1, Math.round((Date.now() - questionStartTs) / 1000));

    results.push({
      question: q,
      chosen: selectedOption,
      isCorrect: selectedOption === q.answer,
      elapsedSec,
      targetSec: sub.paceSec,
      overPace: elapsedSec > sub.paceSec
    });

    if (activeScheduledBlock && global.HudSchedule && typeof global.HudSchedule.onQuizProgress === 'function') {
      global.HudSchedule.onQuizProgress(results.length, sessionQuestions.length);
    }

    currentIdx += 1;
    if (currentIdx >= sessionQuestions.length) {
      finishQuiz(true);
    } else {
      renderQuestion();
    }
  }

  function renderResultsContent() {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const overCount = results.filter((r) => r.overPace).length;
    const totalSec = results.reduce((acc, r) => acc + r.elapsedSec, 0);
    const avgSec = results.length > 0 ? Math.round(totalSec / results.length) : 0;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    document.getElementById('res-score').textContent = `${correctCount} / ${results.length}`;
    document.getElementById('res-accuracy').textContent = `${accuracy}%`;
    document.getElementById('res-avg-pace').textContent = `${avgSec} dtk/soal`;
    document.getElementById('res-overpace').textContent = `${overCount} soal`;

    // Show scheduled next-block banner if Scheduled Mode is active
    const schedBanner = document.getElementById('quiz-scheduled-next-banner');
    const schedBannerText = document.getElementById('quiz-scheduled-banner-text');
    if (schedBanner) {
      const isSchedActive = global.HudSchedule && global.HudSchedule.isActive();
      schedBanner.classList.toggle('hidden', !isSchedActive);
      if (isSchedActive && schedBannerText) {
        const nextBlock = global.HudSchedule.getNextBlock();
        schedBannerText.textContent = nextBlock
          ? `Blok saat ini selesai lebih cepat / berakhir. Jadwal berikutnya: ${nextBlock.subtes} (${nextBlock.targetQuestions} Soal • ${nextBlock.startTime}–${nextBlock.endTime}).`
          : 'Ini blok terakhir hari ini. Pelajari pembahasan dan dengarkan penjelasan dengan GOSpeak!';
      }
    }

    const letters = ['A', 'B', 'C', 'D', 'E'];
    const listEl = document.getElementById('quiz-review-list');
    listEl.innerHTML = '';

    if (results.length === 0) {
      listEl.innerHTML = '<div class="go-card muted">Belum ada soal yang sempat dijawab pada blok ini.</div>';
      return;
    }

    results.forEach((r, idx) => {
      const q = r.question;
      const card = document.createElement('div');
      card.className = `quiz-review-item ${r.isCorrect ? '' : 'wrong'}`;
      const expKey = `exp-${idx}`;
      const isEn = q.subtes === 'LBE';
      const defaultSpeakLabel = isEn ? 'Dengarkan GOSpeak (EN)' : 'Dengarkan GOSpeak';

      card.innerHTML = `
        <div class="error-item-top">
          <div class="tag-row">
            <span class="tag-pill subtes">${escapeHtml(q.subtes)}</span>
            <span class="tag-pill">${r.isCorrect ? 'BENAR' : 'SALAH'}</span>
            <span class="tag-pill ${r.overPace ? 'reason' : ''}">${r.elapsedSec}s / ${r.targetSec}s ${r.overPace ? '(Over-Pace)' : '(On Pace)'}</span>
          </div>
          <button type="button" class="btn-chip js-push-error">+ Catat ke Error Log</button>
        </div>
        <div class="error-topic">#${idx + 1} ${escapeHtml(q.topic)}</div>
        <div class="muted" style="margin-bottom: 6px;">
          Jawabanmu: <strong>${letters[r.chosen]}</strong> &bull; Kunci: <strong>${letters[q.answer]}</strong> (${escapeHtml(q.options[q.answer])})
        </div>
        ${q.firstStepTip ? `<div class="rev-tip-mini"><strong>💡 Tips Langkah Pertama:</strong> ${escapeHtml(q.firstStepTip)}</div>` : ''}
        <div class="error-sol-box">
          <div class="sol-box-head">
            <strong>Pembahasan:</strong>
            <button type="button" class="btn-gospeak btn-gospeak-sm js-speak-exp" data-gospeak-key="${expKey}" data-default-label="${defaultSpeakLabel}">
              <span class="gospeak-icon" aria-hidden="true">🔊</span>
              <span class="js-gospeak-btn-label">${defaultSpeakLabel}</span>
            </button>
          </div>
          <div class="sol-box-text">${escapeHtml(q.exp)}</div>
        </div>
      `;

      const speakExpBtn = card.querySelector('.js-speak-exp');
      if (speakExpBtn) {
        speakExpBtn.addEventListener('click', () => {
          if (global.HudGoSpeak) {
            global.HudGoSpeak.speak(q.exp, {
              subtes: q.subtes,
              label: `Pembahasan #${idx + 1} (${q.subtes})`,
              sourceKey: expKey
            });
          }
        });
      }

      const pushBtn = card.querySelector('.js-push-error');
      pushBtn.addEventListener('click', () => {
        const guessedReason = r.overPace ? 'Kehabisan Waktu' : 'Salah Konsep';
        global.HudErrorLog.addEntry({
          subtes: q.subtes,
          reason: guessedReason,
          source: activeScheduledBlock ? 'Jadwal Terjadwal GO' : 'Mini-Quiz GO',
          topic: q.topic,
          question: q.q,
          solution: `Kunci ${letters[q.answer]} (${q.options[q.answer]}). ${q.exp}`
        });
        pushBtn.textContent = 'Tercatat ✓';
        pushBtn.disabled = true;
        if (typeof global.showHudToast === 'function') {
          global.showHudToast('Soal ditambahkan ke Error Log.');
        }
      });

      listEl.appendChild(card);
    });

    if (global.HudGoSpeak && typeof global.HudGoSpeak.syncUI === 'function') {
      global.HudGoSpeak.syncUI();
    }
  }

  function recordResultsToStorage() {
    if (sessionLogged || results.length === 0) return;
    sessionLogged = true;

    let heavySec = 0;
    let lightSec = 0;
    const subtesTally = {};

    results.forEach((r) => {
      const code = r.question.subtes;
      const load = (SUBTESTS[code] || SUBTESTS.PK).load;
      if (load === 'heavy') heavySec += r.elapsedSec;
      else lightSec += r.elapsedSec;

      if (!subtesTally[code]) subtesTally[code] = { total: 0, correct: 0, wrong: 0 };
      subtesTally[code].total += 1;
      if (r.isCorrect) subtesTally[code].correct += 1;
      else subtesTally[code].wrong += 1;
    });

    if (!activeScheduledBlock) {
      if (heavySec > 0) global.HudStorage.logStudyMinutes(Math.max(1, Math.round(heavySec / 60)), 'heavy', false);
      if (lightSec > 0) global.HudStorage.logStudyMinutes(Math.max(1, Math.round(lightSec / 60)), 'light', false);
    }

    Object.keys(subtesTally).forEach((code) => {
      const t = subtesTally[code];
      global.HudStorage.logPracticeSession({
        subtes: code,
        total: t.total,
        correct: t.correct,
        wrong: t.wrong,
        source: activeScheduledBlock ? 'Jadwal Belajar Terjadwal' : 'Mini-Quiz Aplikasi'
      });
    });

    if (typeof onDataUpdated === 'function') onDataUpdated();
  }

  function finishQuiz(shouldShowResultsView) {
    clearInterval(paceTimer);
    paceTimer = null;

    if (global.HudGoSpeak && typeof global.HudGoSpeak.stop === 'function') {
      global.HudGoSpeak.stop();
    }

    if (results.length === 0 && !activeScheduledBlock) {
      showView('quiz-setup');
      return;
    }

    recordResultsToStorage();
    renderResultsContent();

    if (shouldShowResultsView !== false) {
      showView('quiz-results');
      if (
        activeScheduledBlock &&
        global.HudSchedule &&
        global.HudSchedule.isActive() &&
        typeof global.HudSchedule.onQuizCompletedEarly === 'function'
      ) {
        global.HudSchedule.onQuizCompletedEarly();
      }
    }
  }

  function finalizeScheduledPartial(showResultsPage) {
    clearInterval(paceTimer);
    paceTimer = null;
    if (global.HudGoSpeak && typeof global.HudGoSpeak.stop === 'function') {
      global.HudGoSpeak.stop();
    }
    recordResultsToStorage();
    renderResultsContent();
    if (showResultsPage) {
      showView('quiz-results');
    }
  }

  function showResultsView() {
    renderResultsContent();
    showView('quiz-results');
  }

  function clearScheduledContext() {
    activeScheduledBlock = null;
  }

  function selectSubtes(subCode) {
    const selectEl = document.getElementById('quiz-subtes-select');
    if (selectEl) {
      selectEl.value = subCode || 'ALL';
      updatePacePreview();
    }
    showView('quiz-setup');
  }

  function init(callback) {
    onDataUpdated = callback;
    const subSelect = document.getElementById('quiz-subtes-select');
    if (subSelect) {
      subSelect.addEventListener('change', updatePacePreview);
      updatePacePreview();
    }

    document.getElementById('btn-start-quiz').addEventListener('click', () => startQuiz());
    document.getElementById('btn-quiz-next').addEventListener('click', commitAnswer);
    document.getElementById('btn-quiz-quit').addEventListener('click', () => finishQuiz(true));
    document.getElementById('btn-quiz-retry').addEventListener('click', () => {
      if (global.HudGoSpeak) global.HudGoSpeak.stop();
      showView('quiz-setup');
    });

    const tipSpeakBtn = document.getElementById('btn-gospeak-tip');
    if (tipSpeakBtn) {
      tipSpeakBtn.addEventListener('click', () => {
        const q = sessionQuestions[currentIdx];
        if (!q || !global.HudGoSpeak) return;
        global.HudGoSpeak.speak(q.firstStepTip || '', {
          subtes: q.subtes,
          label: `Tips ${q.subtes}: ${q.topic}`,
          sourceKey: 'tip'
        });
      });
    }

    const qSpeakBtn = document.getElementById('btn-gospeak-question');
    if (qSpeakBtn) {
      qSpeakBtn.addEventListener('click', () => {
        const q = sessionQuestions[currentIdx];
        if (!q || !global.HudGoSpeak) return;
        global.HudGoSpeak.speak(q.q || '', {
          subtes: q.subtes,
          label: `Soal ${q.subtes}: ${q.topic}`,
          sourceKey: 'question'
        });
      });
    }

    const schedNextBtn = document.getElementById('btn-quiz-sched-next');
    if (schedNextBtn) {
      schedNextBtn.addEventListener('click', () => {
        if (global.HudSchedule) global.HudSchedule.advanceAfterReview();
      });
    }
  }

  global.HudQuiz = {
    init,
    selectSubtes,
    startScheduledSession,
    finalizeScheduledPartial,
    showResultsView,
    clearScheduledContext
  };
})(window);

/* ==========================================================================
   pomodoro.js — Timestamp-Based 25/5 Pomodoro + Smart Subject Rotator
   Zero external audio files; uses Web Audio API chime & Date.now() deltas.
   ========================================================================== */

(function (global) {
  'use strict';

  const { SUBTESTS } = global.HudData;

  let phase = 'focus'; // 'focus' | 'break'
  let running = false;
  let endTimestamp = 0;
  let remainingMs = 25 * 60 * 1000;
  let tickTimer = null;
  let onDataUpdated = null;

  function getSettings() {
    return global.HudStorage.getState().settings;
  }

  function getPomoState() {
    return global.HudStorage.getState().pomodoro;
  }

  function getPhaseDurationMs(targetPhase) {
    const s = getSettings();
    const mins = targetPhase === 'focus' ? Number(s.focusMinutes || 25) : Number(s.breakMinutes || 5);
    return mins * 60 * 1000;
  }

  function formatMMSS(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function playHudChime(isBreakStart) {
    if (getSettings().muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = isBreakStart ? [523.25, 659.25, 783.99] : [440, 587.33];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch (e) {
      // Ignore Web Audio blocks gracefully
    }
  }

  function getSuggestedCounterpart(currentLoad) {
    if (currentLoad === 'heavy') {
      const p = getPomoState();
      return p.subject === 'LBE' ? 'LBI' : 'LBE';
    }
    return 'PK';
  }

  function setSubject(code) {
    if (!SUBTESTS[code]) return;
    const p = getPomoState();
    p.subject = code;
    global.HudStorage.saveState();
    updateSubjectUI();
    renderClock();
  }

  function updateSubjectUI() {
    const p = getPomoState();
    const sub = SUBTESTS[p.subject] || SUBTESTS.PK;

    const selectEl = document.getElementById('pomo-subject-select');
    if (selectEl && selectEl.value !== sub.code) {
      selectEl.value = sub.code;
    }

    const tagEl = document.getElementById('pomo-load-tag');
    if (tagEl) {
      tagEl.textContent = sub.load === 'heavy' ? 'MATERI BERAT' : 'MATERI RINGAN';
      tagEl.className = `load-badge ${sub.load}`;
    }

    const banner = document.getElementById('pomo-rotator-banner');
    const textEl = document.getElementById('pomo-rotator-text');
    const acceptBtn = document.getElementById('btn-accept-rotation');
    const dotsEl = document.getElementById('pomo-streak-dots');
    const noteEl = document.getElementById('pomo-cycle-note');

    const count = p.consecutiveCount || 0;
    const sameLoad = p.consecutiveType === sub.load;
    const displayCount = sameLoad ? count : 0;

    if (dotsEl) {
      const filled = Math.min(2, displayCount);
      dotsEl.textContent = `${'● '.repeat(filled)}${'○ '.repeat(2 - filled)}`.trim();
    }
    if (noteEl) {
      noteEl.textContent = `(${Math.min(2, displayCount)}/2 sesi ${sub.load === 'heavy' ? 'Berat' : 'Ringan'} beruntun)`;
    }

    if (banner && textEl && acceptBtn) {
      if (sameLoad && displayCount >= 2) {
        const nextCode = getSuggestedCounterpart(sub.load);
        const nextSub = SUBTESTS[nextCode];
        banner.classList.add('alert');
        textEl.textContent =
          sub.load === 'heavy'
            ? `Saran Rotasi Anti-Burnout: Sudah ${displayCount} sesi Berat beruntun. Pindah ke ${nextSub.code} (${nextSub.name}) agar otak tetap segar!`
            : `Saran Rotasi: Sudah ${displayCount} sesi Ringan beruntun. Saatnya kembali ke materi Berat (${nextSub.code})!`;
        acceptBtn.textContent = `Pindah ke ${nextSub.code}`;
        acceptBtn.dataset.targetSub = nextSub.code;
        acceptBtn.classList.remove('hidden');
      } else {
        banner.classList.remove('alert');
        textEl.textContent =
          displayCount === 1 && sameLoad
            ? `1 sesi ${sub.load === 'heavy' ? 'Berat' : 'Ringan'} selesai. Setelah 1 sesi lagi, sistem akan menyarankan rotasi mapel.`
            : 'Rotasi cerdas aktif: selang-seling materi Berat (PK/PM/PU) & Ringan (LBE/LBI) untuk cegah burnout.';
        acceptBtn.classList.add('hidden');
      }
    }
  }

  function renderClock() {
    const s = getSettings();
    const p = getPomoState();
    const totalMs = getPhaseDurationMs(phase);
    const pct = totalMs > 0 ? Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100)) : 0;

    const digitsEl = document.getElementById('pomo-timer-display');
    const badgeEl = document.getElementById('pomo-phase-badge');
    const fillEl = document.getElementById('pomo-progress-fill');
    const startBtn = document.getElementById('btn-pomo-start');
    const muteBtn = document.getElementById('btn-pomo-mute');
    const drawerSubEl = document.getElementById('drawer-pomo-status');

    const timeStr = formatMMSS(remainingMs);
    if (digitsEl) {
      digitsEl.textContent = timeStr;
      digitsEl.classList.toggle('break-mode', phase === 'break');
    }
    if (badgeEl) {
      badgeEl.textContent =
        phase === 'focus'
          ? `FOKUS POMODORO // ${s.focusMinutes}:00`
          : `ISTIRAHAT // ${String(s.breakMinutes).padStart(2, '0')}:00`;
    }
    if (fillEl) {
      fillEl.style.width = `${pct.toFixed(1)}%`;
      fillEl.classList.toggle('break-mode', phase === 'break');
    }
    if (startBtn) {
      if (running) {
        startBtn.textContent = 'Jeda';
      } else {
        startBtn.textContent = phase === 'focus' ? 'Mulai Fokus' : 'Mulai Istirahat';
      }
    }
    if (muteBtn) {
      muteBtn.textContent = s.muted ? 'Suara: OFF' : 'Suara: ON';
    }
    if (drawerSubEl) {
      drawerSubEl.textContent = running ? `${timeStr} • ${p.subject}` : `${s.focusMinutes}/${s.breakMinutes}m`;
    }

    document.title = running
      ? `[${timeStr}] ${p.subject} • SNBT GO 2027`
      : 'SNBT GO 2027 // Adam Candra Mahesa';
  }

  function completePhase(logMinutesIfFocus) {
    running = false;
    clearInterval(tickTimer);
    tickTimer = null;

    const p = getPomoState();
    const sub = SUBTESTS[p.subject] || SUBTESTS.PK;

    if (phase === 'focus') {
      if (logMinutesIfFocus) {
        const mins = Number(getSettings().focusMinutes || 25);
        global.HudStorage.logStudyMinutes(mins, sub.load, true);

        if (p.consecutiveType === sub.load) {
          p.consecutiveCount = (p.consecutiveCount || 0) + 1;
        } else {
          p.consecutiveType = sub.load;
          p.consecutiveCount = 1;
        }
        p.lastCompletedType = sub.load;
        global.HudStorage.saveState();
      }
      playHudChime(true);
      phase = 'break';
      remainingMs = getPhaseDurationMs('break');
      if (typeof global.showHudToast === 'function') {
        global.showHudToast(`Sesi ${sub.code} selesai! Istirahat ${getSettings().breakMinutes} menit dulu ya.`);
      }
    } else {
      playHudChime(false);
      phase = 'focus';
      remainingMs = getPhaseDurationMs('focus');
      if (typeof global.showHudToast === 'function') {
        global.showHudToast('Istirahat selesai! Siap lanjut sesi fokus berikutnya.');
      }
    }

    updateSubjectUI();
    renderClock();
    if (typeof onDataUpdated === 'function') onDataUpdated();
  }

  function tick() {
    if (!running) return;
    remainingMs = Math.max(0, endTimestamp - Date.now());
    renderClock();
    if (remainingMs <= 0) {
      completePhase(true);
    }
  }

  function toggleStartPause() {
    if (running) {
      remainingMs = Math.max(0, endTimestamp - Date.now());
      running = false;
      clearInterval(tickTimer);
      tickTimer = null;
      renderClock();
    } else {
      if (remainingMs <= 0) {
        remainingMs = getPhaseDurationMs(phase);
      }
      endTimestamp = Date.now() + remainingMs;
      running = true;
      tickTimer = setInterval(tick, 500);
      renderClock();
    }
  }

  function resetTimer() {
    running = false;
    clearInterval(tickTimer);
    tickTimer = null;
    remainingMs = getPhaseDurationMs(phase);
    renderClock();
  }

  function skipPhase() {
    completePhase(false);
  }

  function syncSettings() {
    if (!running) {
      remainingMs = getPhaseDurationMs(phase);
    }
    renderClock();
    updateSubjectUI();
  }

  function init(callback) {
    onDataUpdated = callback;
    remainingMs = getPhaseDurationMs('focus');

    const selectEl = document.getElementById('pomo-subject-select');
    if (selectEl) {
      selectEl.addEventListener('change', () => setSubject(selectEl.value));
    }

    const acceptBtn = document.getElementById('btn-accept-rotation');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        const target = acceptBtn.dataset.targetSub || 'LBE';
        const p = getPomoState();
        p.subject = target;
        p.consecutiveCount = 0;
        p.consecutiveType = (SUBTESTS[target] || SUBTESTS.LBE).load;
        global.HudStorage.saveState();
        updateSubjectUI();
        renderClock();
        if (typeof global.showHudToast === 'function') {
          global.showHudToast(`Subtes dipindah ke ${target}.`);
        }
      });
    }

    const startBtn = document.getElementById('btn-pomo-start');
    const resetBtn = document.getElementById('btn-pomo-reset');
    const skipBtn = document.getElementById('btn-pomo-skip');
    const muteBtn = document.getElementById('btn-pomo-mute');

    if (startBtn) startBtn.addEventListener('click', toggleStartPause);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (skipBtn) skipBtn.addEventListener('click', skipPhase);
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const s = getSettings();
        s.muted = !s.muted;
        global.HudStorage.saveState();
        renderClock();
      });
    }

    updateSubjectUI();
    renderClock();
  }

  global.HudPomodoro = {
    init,
    syncSettings,
    setSubject,
    isRunning: () => running
  };
})(window);

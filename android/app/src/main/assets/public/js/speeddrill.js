/* ==========================================================================
   speeddrill.js — Hitung Cepat (Smart Auto-Submit Satuan/Puluhan/Ratusan)
   - Supports satuan (1 digit), puluhan (2 digit), & ratusan (3 digit)
   - Smart Auto-Submit: userInput.length === correctAnswer.toString().length
   - Supports keyboard Enter & manual Submit button across all modes
   ========================================================================== */

(function (global) {
  'use strict';

  let mode = 'arith'; // 'arith' | 'quant' | 'pauli'
  let running = false;
  let endTs = 0;
  let timerId = null;
  let solved = 0;
  let correct = 0;
  let currentAnswer = '';
  let inputBuffer = '';
  let onDataUpdated = null;

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function nextProblem() {
    inputBuffer = '';
    const promptEl = document.getElementById('drill-prompt');
    const hintEl = document.getElementById('drill-hint');
    const ansEl = document.getElementById('drill-input-display');
    if (ansEl) ansEl.textContent = '_';

    if (mode === 'pauli') {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      currentAnswer = String((a + b) % 10);
      if (promptEl) promptEl.textContent = `${a} + ${b}`;
      if (hintEl) hintEl.textContent = 'Mode Pauli: ketik digit satuan saja (contoh 7 + 8 = 5).';
    } else if (mode === 'arith') {
      const bucket = randInt(0, 4);
      if (bucket === 0) {
        // 1-digit answer (satuan, misal 4 + 3 = 7)
        const a = randInt(1, 6);
        const b = randInt(1, 9 - a);
        currentAnswer = String(a + b);
        if (promptEl) promptEl.textContent = `${a} + ${b}`;
      } else if (bucket === 1) {
        // 2-digit answer from 1-digit sums (misal 6 + 8 = 14)
        const a = randInt(5, 9);
        const b = randInt(10 - a, 9);
        currentAnswer = String(a + b);
        if (promptEl) promptEl.textContent = `${a} + ${b}`;
      } else if (bucket === 2) {
        // 2-digit +/- (misal 27 + 18 = 45 atau 54 - 19 = 35)
        if (randInt(0, 1) === 0) {
          const a = randInt(12, 58);
          const b = randInt(11, 39);
          currentAnswer = String(a + b);
          if (promptEl) promptEl.textContent = `${a} + ${b}`;
        } else {
          const a = randInt(35, 92);
          const b = randInt(12, a - 10);
          currentAnswer = String(a - b);
          if (promptEl) promptEl.textContent = `${a} − ${b}`;
        }
      } else if (bucket === 3) {
        // 2-digit / 3-digit multiplication (misal 14 x 6 = 84 atau 18 x 7 = 126)
        const a = randInt(11, 24);
        const b = randInt(3, 9);
        currentAnswer = String(a * b);
        if (promptEl) promptEl.textContent = `${a} × ${b}`;
      } else {
        // 3-digit addition or square (misal 125 + 48 = 173)
        const a = randInt(105, 240);
        const b = randInt(25, 95);
        currentAnswer = String(a + b);
        if (promptEl) promptEl.textContent = `${a} + ${b}`;
      }
      if (hintEl) hintEl.textContent = 'Smart Auto-Submit aktif (satuan, puluhan & ratusan) atau tekan Enter / Submit.';
    } else {
      const type = randInt(0, 3);
      if (type === 0) {
        const pcts = [10, 15, 20, 25, 30, 50];
        const p = pick(pcts);
        const base = randInt(2, 12) * 20;
        currentAnswer = String((p * base) / 100);
        if (promptEl) promptEl.textContent = `${p}% × ${base}`;
      } else if (type === 1) {
        const a = randInt(11, 20);
        const b = randInt(1, 9);
        currentAnswer = String(a * a - b * b);
        if (promptEl) promptEl.textContent = `${a}² − ${b}²`;
      } else if (type === 2) {
        const a = randInt(12, 29);
        const b = randInt(3, 9);
        currentAnswer = String(a * b);
        if (promptEl) promptEl.textContent = `${a} × ${b}`;
      } else {
        const x = randInt(2, 12);
        const a = randInt(2, 6);
        const b = randInt(1, 15);
        const c = a * x + b;
        currentAnswer = String(x);
        if (promptEl) promptEl.textContent = `${a}x + ${b} = ${c}  (x = ?)`;
      }
      if (hintEl) hintEl.textContent = 'Smart Auto-Submit aktif sesuai panjang digit jawaban, atau tekan Enter / Submit.';
    }
  }

  function showFeedback(isCorrect, entered, expected) {
    const fb = document.getElementById('drill-feedback');
    if (!fb) return;
    fb.classList.remove('hidden', 'ok', 'err');
    if (isCorrect) {
      fb.classList.add('ok');
      fb.textContent = `✓ Tepat! (${expected})`;
    } else {
      fb.classList.add('err');
      fb.textContent = `✗ Jawaban benar: ${expected} (kamu ketik: ${entered})`;
    }
  }

  function submitCurrent() {
    if (!running || inputBuffer === '') return;
    const isCorrect = inputBuffer === currentAnswer.toString();
    solved += 1;
    if (isCorrect) {
      correct += 1;
    }
    showFeedback(isCorrect, inputBuffer, currentAnswer);
    updateLiveStats();
    nextProblem();
  }

  function pushDigit(d) {
    if (!running) return;
    if (inputBuffer.length >= 5) return;

    inputBuffer += String(d);
    const ansEl = document.getElementById('drill-input-display');
    if (ansEl) ansEl.textContent = inputBuffer;

    // Smart Auto-Submit: bandingkan panjang input user dengan panjang digit jawaban benar
    if (inputBuffer.length === currentAnswer.toString().length) {
      submitCurrent();
    }
  }

  function backspace() {
    if (!running) return;
    inputBuffer = inputBuffer.slice(0, -1);
    const ansEl = document.getElementById('drill-input-display');
    if (ansEl) ansEl.textContent = inputBuffer || '_';
  }

  function updateLiveStats() {
    const remSec = running ? Math.max(0, Math.ceil((endTs - Date.now()) / 1000)) : 60;
    const tEl = document.getElementById('drill-timer');
    const sEl = document.getElementById('drill-score');
    if (tEl) tEl.textContent = `${remSec}s`;
    if (sEl) sEl.textContent = `Benar ${correct} / ${solved}`;
  }

  function finishDrill(saveToStats) {
    running = false;
    clearInterval(timerId);
    timerId = null;

    document.getElementById('drill-setup').classList.remove('hidden');
    document.getElementById('drill-active').classList.add('hidden');

    if (saveToStats && solved > 0) {
      const wrong = Math.max(0, solved - correct);
      global.HudStorage.logStudyMinutes(1, 'heavy', false);
      const sourceLabel =
        mode === 'pauli'
          ? 'Hitung Cepat (Pauli)'
          : mode === 'arith'
          ? 'Hitung Cepat (Puluhan/Ratusan)'
          : 'Hitung Cepat (Kuantitatif)';

      global.HudStorage.logPracticeSession({
        subtes: 'PK',
        total: solved,
        correct,
        wrong,
        source: sourceLabel
      });
      if (typeof onDataUpdated === 'function') onDataUpdated();
      const resBox = document.getElementById('drill-last-result');
      if (resBox) {
        const acc = Math.round((correct / solved) * 100);
        resBox.textContent = `Sesi terakhir: ${correct}/${solved} benar (${acc}%) dalam 60 detik — otomatis masuk Statistik PK!`;
        resBox.classList.remove('hidden');
      }
      if (typeof global.showHudToast === 'function') {
        global.showHudToast(`Hitung Cepat selesai: ${correct}/${solved} benar tercatat!`);
      }
    }
  }

  function startDrill() {
    mode = (document.getElementById('drill-mode-select') || {}).value || 'arith';
    solved = 0;
    correct = 0;
    running = true;
    endTs = Date.now() + 60 * 1000;

    document.getElementById('drill-setup').classList.add('hidden');
    document.getElementById('drill-active').classList.remove('hidden');

    const fb = document.getElementById('drill-feedback');
    if (fb) {
      fb.classList.add('hidden');
      fb.textContent = '';
    }

    const enterBtn = document.getElementById('drill-key-enter');
    if (enterBtn) enterBtn.classList.remove('hidden');

    updateLiveStats();
    nextProblem();

    clearInterval(timerId);
    timerId = setInterval(() => {
      const rem = endTs - Date.now();
      updateLiveStats();
      if (rem <= 0) finishDrill(true);
    }, 250);
  }

  function init(callback) {
    onDataUpdated = callback;
    const startBtn = document.getElementById('btn-start-drill');
    const stopBtn = document.getElementById('btn-stop-drill');
    if (startBtn) startBtn.addEventListener('click', startDrill);
    if (stopBtn) stopBtn.addEventListener('click', () => finishDrill(true));

    const pad = document.getElementById('drill-keypad');
    if (pad) {
      pad.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-key]');
        if (!btn) return;
        const k = btn.dataset.key;
        if (k === 'back') backspace();
        else if (k === 'enter') submitCurrent();
        else pushDigit(k);
      });
    }

    const manualSubmitBtn = document.getElementById('btn-drill-submit-manual');
    if (manualSubmitBtn) {
      manualSubmitBtn.addEventListener('click', submitCurrent);
    }

    document.addEventListener('keydown', (e) => {
      const view = document.getElementById('view-speeddrill');
      if (!running || !view || !view.classList.contains('active')) return;
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        pushDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitCurrent();
      }
    });
  }

  global.HudSpeedDrill = { init };
})(window);

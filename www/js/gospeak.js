/* ==========================================================================
   gospeak.js — AI Voice Tutor "GOSpeak" (Zero-Dependency Web Speech API)
   - Reads Tips Langkah Pertama & Pembahasan Step-by-Step naturally
   - Auto id-ID for general subtests, en-US for Literasi Bahasa Inggris (LBE)
   - Soundwave indicator, Pause/Resume, Stop, & 1.0x / 1.25x Speed Control
   ========================================================================== */

(function (global) {
  'use strict';

  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const UtteranceCtor = typeof window !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function'
    ? window.SpeechSynthesisUtterance
    : null;

  let isSpeaking = false;
  let isPaused = false;
  let currentLang = 'id-ID';
  let currentLabel = '';
  let currentText = '';
  let currentSubtes = 'PK';
  let currentSourceKey = '';
  let cachedVoices = [];
  let watchdogTimer = null;
  let pendingSpeakTimer = null;

  function isSupported() {
    return Boolean(synth && UtteranceCtor);
  }

  function getRate() {
    const state = global.HudStorage ? global.HudStorage.getState() : null;
    const raw = state && state.settings ? Number(state.settings.speechRate) : 1.0;
    return raw === 1.25 ? 1.25 : 1.0;
  }

  function loadVoices() {
    if (!synth || typeof synth.getVoices !== 'function') return [];
    try {
      cachedVoices = synth.getVoices() || [];
    } catch (e) {
      cachedVoices = [];
    }
    return cachedVoices;
  }

  if (synth) {
    loadVoices();
    if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = loadVoices;
    }
  }

  function pickVoice(targetLang) {
    const voices = cachedVoices.length ? cachedVoices : loadVoices();
    if (!voices.length) return null;
    const lower = targetLang.toLowerCase();
    const prefix = lower.split('-')[0];
    return (
      voices.find((v) => v.lang && v.lang.toLowerCase() === lower) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix)) ||
      null
    );
  }

  function prepareSpeechText(rawText, lang) {
    let txt = String(rawText || '').trim();
    if (!txt) return '';

    const isEn = lang === 'en-US';
    txt = txt
      .replace(/\n+/g, '. ')
      .replace(/x₁/g, isEn ? 'x one' : 'x satu')
      .replace(/x₂/g, isEn ? 'x two' : 'x dua')
      .replace(/([a-zA-Z0-9])₁/g, '$1 1')
      .replace(/([a-zA-Z0-9])₂/g, '$1 2')
      .replace(/([a-zA-Z0-9])₀/g, '$1 0')
      .replace(/([a-zA-Z0-9])ₙ/g, '$1 n')
      .replace(/²/g, isEn ? ' squared' : ' kuadrat')
      .replace(/³/g, isEn ? ' cubed' : ' pangkat tiga')
      .replace(/⁵/g, isEn ? ' to the fifth' : ' pangkat lima')
      .replace(/√/g, isEn ? 'square root of ' : 'akar ')
      .replace(/->|→/g, isEn ? ' leads to ' : ' menghasilkan ')
      .replace(/≤/g, isEn ? ' less than or equal to ' : ' kurang dari atau sama dengan ')
      .replace(/≥/g, isEn ? ' greater than or equal to ' : ' lebih dari atau sama dengan ')
      .replace(/≠/g, isEn ? ' not equal to ' : ' tidak sama dengan ')
      .replace(/×|·/g, isEn ? ' times ' : ' dikali ')
      .replace(/÷/g, isEn ? ' divided by ' : ' dibagi ')
      .replace(/π/g, 'pi ')
      .replace(/°/g, isEn ? ' degrees' : ' derajat')
      .replace(/Ω/g, isEn ? ' ohms' : ' ohm')
      .replace(/\s+/g, ' ');

    if (!isEn) {
      txt = txt.replace(/\bLangkah (\d+):/gi, 'Langkah ke $1.');
    } else {
      txt = txt.replace(/\bStep (\d+):/gi, 'Step $1.');
    }

    return txt;
  }

  function clearWatchdog() {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }

  function syncUI() {
    const rate = getRate();

    // Update speed toggle buttons anywhere on page
    document.querySelectorAll('.js-gospeak-rate').forEach((btn) => {
      const btnRate = Number(btn.dataset.rate);
      const isMatch = Math.abs(btnRate - rate) < 0.01;
      btn.classList.toggle('active-gold', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });

    // Update active state on speaker trigger buttons
    document.querySelectorAll('[data-gospeak-key]').forEach((btn) => {
      const activeThis = isSpeaking && btn.dataset.gospeakKey === currentSourceKey;
      btn.classList.toggle('speaking', activeThis);
      const textSpan = btn.querySelector('.js-gospeak-btn-label');
      if (textSpan) {
        textSpan.textContent = activeThis
          ? (isPaused ? 'Dijeda (GOSpeak)' : 'Sedang Bicara...')
          : (btn.dataset.defaultLabel || 'Dengarkan GOSpeak');
      }
    });

    // Update live player bar
    const bar = document.getElementById('gospeak-live-bar');
    if (!bar) return;

    bar.classList.toggle('hidden', !isSpeaking);
    if (!isSpeaking) return;

    const waveEl = document.getElementById('gospeak-wave');
    const titleEl = document.getElementById('gospeak-bar-status');
    const badgeEl = document.getElementById('gospeak-bar-lang');
    const pauseBtn = document.getElementById('btn-gospeak-pause');

    if (waveEl) {
      waveEl.classList.toggle('active', isSpeaking && !isPaused);
      waveEl.classList.toggle('paused', isPaused);
    }
    if (badgeEl) {
      badgeEl.textContent = `${currentLang} • ${rate.toFixed(rate === 1.25 ? 2 : 1)}x`;
    }
    if (titleEl) {
      titleEl.textContent = isPaused
        ? `Dijeda: ${currentLabel || 'GOSpeak'}`
        : `GOSpeak: ${currentLabel || 'Membacakan penjelasan...'}`;
    }
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? '▶ Lanjut' : '⏸ Jeda';
    }
  }

  function resetState() {
    clearWatchdog();
    clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
    isSpeaking = false;
    isPaused = false;
    currentSourceKey = '';
    syncUI();
  }

  function stop() {
    clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
    clearWatchdog();
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {
        // Ignore TTS cancel errors gracefully
      }
    }
    isSpeaking = false;
    isPaused = false;
    currentSourceKey = '';
    syncUI();
  }

  function speakInternal(text, subtes, label, sourceKey) {
    if (!isSupported()) {
      if (typeof global.showHudToast === 'function') {
        global.showHudToast('Perangkat/browser ini tidak mendukung Web Speech API (GOSpeak).');
      }
      return false;
    }

    const clean = String(text || '').trim();
    if (!clean) return false;

    const lang = subtes === 'LBE' ? 'en-US' : 'id-ID';
    const rate = getRate();
    const spoken = prepareSpeechText(clean, lang);

    const wasActive = Boolean(synth.speaking || synth.pending);
    if (wasActive) {
      try {
        synth.cancel();
      } catch (e) {
        // ignore
      }
    }

    currentText = clean;
    currentSubtes = subtes || 'PK';
    currentLang = lang;
    currentLabel = label || (lang === 'en-US' ? 'English Tutor (en-US)' : 'Pembahasan Tutor (id-ID)');
    currentSourceKey = sourceKey || '';
    isSpeaking = true;
    isPaused = false;
    syncUI();

    clearTimeout(pendingSpeakTimer);
    const launch = () => {
      try {
        const utter = new UtteranceCtor(spoken);
        utter.lang = lang;
        utter.rate = rate;
        utter.pitch = 1.0;

        const chosenVoice = pickVoice(lang);
        if (chosenVoice) {
          utter.voice = chosenVoice;
        }

        utter.onstart = () => {
          isSpeaking = true;
          isPaused = false;
          syncUI();
        };
        utter.onpause = () => {
          isPaused = true;
          syncUI();
        };
        utter.onresume = () => {
          isPaused = false;
          syncUI();
        };
        utter.onend = () => {
          resetState();
        };
        utter.onerror = () => {
          resetState();
        };

        clearWatchdog();
        watchdogTimer = setInterval(() => {
          if (!isSpeaking) {
            clearWatchdog();
            return;
          }
          if (synth && !synth.speaking && !synth.pending && !isPaused) {
            resetState();
          }
        }, 500);

        synth.speak(utter);
      } catch (err) {
        resetState();
        if (typeof global.showHudToast === 'function') {
          global.showHudToast('Gagal memutar suara GOSpeak.');
        }
      }
    };

    if (wasActive) {
      pendingSpeakTimer = setTimeout(launch, 60);
    } else {
      launch();
    }
    return true;
  }

  function speak(text, opts) {
    const options = opts || {};
    const key = options.sourceKey || '';
    if (isSpeaking && key && key === currentSourceKey) {
      stop();
      return false;
    }
    return speakInternal(text, options.subtes || 'PK', options.label || '', key);
  }

  function togglePause() {
    if (!synth || !isSpeaking) return;
    try {
      if (isPaused || synth.paused) {
        synth.resume();
        isPaused = false;
      } else {
        synth.pause();
        isPaused = true;
      }
      syncUI();
    } catch (e) {
      // Fallback: if WebView cannot pause, stop gracefully
      stop();
    }
  }

  function setRate(newRate) {
    const normalized = Number(newRate) === 1.25 ? 1.25 : 1.0;
    if (global.HudStorage) {
      const s = global.HudStorage.getState().settings;
      s.speechRate = normalized;
      global.HudStorage.saveState();
    }
    syncUI();

    if (isSpeaking && currentText) {
      const textCopy = currentText;
      const subCopy = currentSubtes;
      const lblCopy = currentLabel;
      const keyCopy = currentSourceKey;
      speakInternal(textCopy, subCopy, lblCopy, keyCopy);
    }
    if (typeof global.showHudToast === 'function') {
      global.showHudToast(`Kecepatan GOSpeak diatur ke ${normalized === 1.25 ? '1.25x Cepat' : '1.0x Normal'}.`);
    }
  }

  function init() {
    document.addEventListener('click', (e) => {
      const rateBtn = e.target.closest('.js-gospeak-rate');
      if (rateBtn) {
        setRate(rateBtn.dataset.rate);
        return;
      }
      if (e.target.closest('#btn-gospeak-stop')) {
        stop();
        return;
      }
      if (e.target.closest('#btn-gospeak-pause')) {
        togglePause();
      }
    });

    global.addEventListener('beforeunload', stop);
    syncUI();
  }

  global.HudGoSpeak = {
    init,
    speak,
    stop,
    togglePause,
    setRate,
    getRate,
    syncUI,
    isSupported,
    isSpeaking: () => isSpeaking
  };
})(window);

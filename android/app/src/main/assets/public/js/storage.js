/* ==========================================================================
   storage.js — LocalStorage State Manager + Practice & Study Rollups + Backup
   Zero external dependencies, synchronous fast reads/writes.
   ========================================================================== */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'snbt_hud_v1_state';

  function getLocalDateKey(dateObj) {
    const d = dateObj || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const todayKey = getLocalDateKey(now);
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const key = getLocalDateKey(d);
      result.push({
        key,
        dayLabel: dayLabels[i],
        isToday: key === todayKey
      });
    }
    return result;
  }

  function timeStrToMins(hhmm) {
    const parts = String(hhmm || '').split(':').map(Number);
    if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return parts[0] * 60 + parts[1];
  }

  function minsToTimeStr(totalMins) {
    const norm = ((Math.round(totalMins) % 1440) + 1440) % 1440;
    const h = String(Math.floor(norm / 60)).padStart(2, '0');
    const m = String(norm % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  function computeBlockMins(startTime, endTime, fallbackMins) {
    const s = timeStrToMins(startTime);
    const e = timeStrToMins(endTime);
    if (s === null || e === null) return Math.max(1, Number(fallbackMins) || 60);
    if (e > s) return e - s;
    if (e < s) return (e + 1440) - s;
    return Math.max(1, Number(fallbackMins) || 60);
  }

  function normalizeStudyPlan(plan) {
    if (!Array.isArray(plan)) return [];
    return plan
      .map((item, idx) => {
        const startTime = item.startTime || item.time || '07:00';
        const fallbackMins = Number(item.mins) || 60;
        const startM = timeStrToMins(startTime);
        const endTime = item.endTime || (startM !== null ? minsToTimeStr(startM + fallbackMins) : '08:00');
        const mins = computeBlockMins(startTime, endTime, fallbackMins);
        const subtes = item.subtes || 'PK';
        const targetQuestions = Math.max(1, Math.min(100, Number(item.targetQuestions) || 10));
        const load = item.load || (['PK', 'PM', 'PU'].includes(subtes) ? 'heavy' : 'light');
        return {
          id: item.id || ('sch_' + idx + '_' + Date.now()),
          startTime,
          endTime,
          time: startTime,
          title: (item.title && String(item.title).trim()) || `${targetQuestions} Soal ${subtes}`,
          subtes,
          targetQuestions,
          mins,
          load,
          doneDate: item.doneDate || ''
        };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  function createDefaultSchedule() {
    return [
      { id: 'sch_1', startTime: '07:00', endTime: '08:00', time: '07:00', title: 'Pemanasan & 10 Soal PK Pagi', subtes: 'PK', targetQuestions: 10, mins: 60, load: 'heavy', doneDate: '' },
      { id: 'sch_2', startTime: '08:00', endTime: '09:00', time: '08:00', title: 'Rotasi Ringan: 10 Soal PPU', subtes: 'PPU', targetQuestions: 10, mins: 60, load: 'light', doneDate: '' },
      { id: 'sch_3', startTime: '09:15', endTime: '10:15', time: '09:15', title: 'Drill Penalaran Matematika', subtes: 'PM', targetQuestions: 10, mins: 60, load: 'heavy', doneDate: '' },
      { id: 'sch_4', startTime: '10:30', endTime: '11:30', time: '10:30', title: 'Rotasi Ringan: Reading LBE', subtes: 'LBE', targetQuestions: 10, mins: 60, load: 'light', doneDate: '' },
      { id: 'sch_5', startTime: '13:30', endTime: '14:30', time: '13:30', title: 'Logika Deduktif Penalaran Umum', subtes: 'PU', targetQuestions: 10, mins: 60, load: 'heavy', doneDate: '' },
      { id: 'sch_6', startTime: '15:30', endTime: '16:30', time: '15:30', title: 'Literasi Bahasa Indonesia', subtes: 'LBI', targetQuestions: 10, mins: 60, load: 'light', doneDate: '' },
      { id: 'sch_7', startTime: '19:30', endTime: '20:30', time: '19:30', title: 'Ejaan & Kalimat Efektif PBM', subtes: 'PBM', targetQuestions: 10, mins: 60, load: 'light', doneDate: '' }
    ];
  }

  function createDefaultState() {
    return {
      settings: {
        userName: 'Adam Candra Mahesa',
        targetDate: '2027-05-10',
        minHours: 6,
        maxHours: 8,
        focusMinutes: 25,
        breakMinutes: 5,
        targetTotalQuestions: 12000,
        dailyQuestionTarget: 50,
        muted: false,
        speechRate: 1.0,
        scheduleEndAction: 'next'
      },
      pomodoro: {
        subject: 'PK',
        consecutiveType: 'heavy',
        consecutiveCount: 0,
        lastCompletedType: null
      },
      // Map of YYYY-MM-DD -> { heavyMins, lightMins, sessions }
      dailyLogs: {},
      // Array of { id, date, subtes, total, correct, wrong, source }
      practiceLogs: [],
      studyPlan: createDefaultSchedule(),
      pinnedFormulas: [],
      errorLogs: []
    };
  }

  function loadState() {
    const fallback = createDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        settings: Object.assign({}, fallback.settings, parsed.settings || {}),
        pomodoro: Object.assign({}, fallback.pomodoro, parsed.pomodoro || {}),
        dailyLogs: parsed.dailyLogs && typeof parsed.dailyLogs === 'object' ? parsed.dailyLogs : {},
        practiceLogs: Array.isArray(parsed.practiceLogs) ? parsed.practiceLogs : [],
        studyPlan: Array.isArray(parsed.studyPlan) && parsed.studyPlan.length > 0
          ? normalizeStudyPlan(parsed.studyPlan)
          : fallback.studyPlan,
        pinnedFormulas: Array.isArray(parsed.pinnedFormulas) ? parsed.pinnedFormulas : [],
        errorLogs: Array.isArray(parsed.errorLogs) ? parsed.errorLogs : []
      };
    } catch (e) {
      return fallback;
    }
  }

  let appState = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      // Ignore storage quota issues gracefully
    }
  }

  function getState() {
    return appState;
  }

  function getTodayLog() {
    const key = getLocalDateKey();
    if (!appState.dailyLogs[key]) {
      appState.dailyLogs[key] = { heavyMins: 0, lightMins: 0, sessions: 0 };
    }
    return appState.dailyLogs[key];
  }

  function logStudyMinutes(minutes, loadType, isPomodoroSession) {
    const mins = Math.max(1, Math.round(Number(minutes) || 0));
    const log = getTodayLog();
    if (loadType === 'heavy') {
      log.heavyMins += mins;
    } else {
      log.lightMins += mins;
    }
    if (isPomodoroSession) {
      log.sessions += 1;
    }
    saveState();
    return log;
  }

  function logPracticeSession(entry) {
    const total = Math.max(1, Math.round(Number(entry.total) || 0));
    const correct = Math.min(total, Math.max(0, Math.round(Number(entry.correct) || 0)));
    const wrong = entry.wrong !== undefined
      ? Math.min(total - correct, Math.max(0, Math.round(Number(entry.wrong) || 0)))
      : Math.max(0, total - correct);

    const record = {
      id: 'prac_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      date: entry.date || getLocalDateKey(),
      subtes: entry.subtes || 'PK',
      total,
      correct,
      wrong,
      source: (entry.source || 'Latihan Mandiri').trim()
    };
    appState.practiceLogs.unshift(record);
    saveState();
    return record;
  }

  function deletePracticeLog(id) {
    appState.practiceLogs = appState.practiceLogs.filter((p) => p.id !== id);
    saveState();
  }

  function getPracticeSummary(period) {
    const todayKey = getLocalDateKey();
    const weekSet = new Set(getCurrentWeekDates().map((d) => d.key));
    const logs = appState.practiceLogs || [];

    const filtered = logs.filter((item) => {
      if (period === 'daily') return item.date === todayKey;
      if (period === 'weekly') return weekSet.has(item.date);
      return true;
    });

    let total = 0;
    let correct = 0;
    let wrong = 0;
    const bySubtes = {};

    filtered.forEach((item) => {
      total += item.total || 0;
      correct += item.correct || 0;
      wrong += item.wrong || 0;
      if (!bySubtes[item.subtes]) {
        bySubtes[item.subtes] = { total: 0, correct: 0, wrong: 0 };
      }
      bySubtes[item.subtes].total += item.total || 0;
      bySubtes[item.subtes].correct += item.correct || 0;
      bySubtes[item.subtes].wrong += item.wrong || 0;
    });

    return { total, correct, wrong, bySubtes, logs: filtered };
  }

  function getActiveStreakDays() {
    let streak = 0;
    const now = new Date();
    for (let offset = 0; offset < 365; offset++) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      const key = getLocalDateKey(d);
      const entry = appState.dailyLogs[key];
      const hasMinutes = entry && (entry.heavyMins + entry.lightMins) > 0;
      const hasPractice = (appState.practiceLogs || []).some((p) => p.date === key);
      if (hasMinutes || hasPractice) {
        streak += 1;
      } else if (offset === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }

  function exportBackup() {
    const payload = {
      app: 'SNBT_2027_GO_HUD',
      exportedAt: new Date().toISOString(),
      data: appState
    };
    return JSON.stringify(payload, null, 2);
  }

  function importBackup(jsonText) {
    const parsed = JSON.parse(jsonText);
    const incoming = parsed && parsed.data ? parsed.data : parsed;
    if (!incoming || typeof incoming !== 'object' || !incoming.settings) {
      throw new Error('Format file backup tidak valid.');
    }
    const def = createDefaultState();
    appState = {
      settings: Object.assign({}, def.settings, incoming.settings || {}),
      pomodoro: Object.assign({}, def.pomodoro, incoming.pomodoro || {}),
      dailyLogs: incoming.dailyLogs && typeof incoming.dailyLogs === 'object' ? incoming.dailyLogs : {},
      practiceLogs: Array.isArray(incoming.practiceLogs) ? incoming.practiceLogs : [],
      studyPlan: Array.isArray(incoming.studyPlan) && incoming.studyPlan.length > 0
        ? normalizeStudyPlan(incoming.studyPlan)
        : def.studyPlan,
      pinnedFormulas: Array.isArray(incoming.pinnedFormulas) ? incoming.pinnedFormulas : [],
      errorLogs: Array.isArray(incoming.errorLogs) ? incoming.errorLogs : []
    };
    saveState();
    return appState;
  }

  global.HudStorage = {
    getLocalDateKey,
    getCurrentWeekDates,
    timeStrToMins,
    minsToTimeStr,
    computeBlockMins,
    normalizeStudyPlan,
    createDefaultSchedule,
    getState,
    saveState,
    getTodayLog,
    logStudyMinutes,
    logPracticeSession,
    deletePracticeLog,
    getPracticeSummary,
    getActiveStreakDays,
    exportBackup,
    importBackup
  };
})(window);

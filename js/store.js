// js/store.js : progress store. Always works from localStorage
// (LocalAdapter-equivalent below); optionally layers Firebase sync on top
// once the user signs in from #/login. The app must be fully usable with no
// login at all.
//
// Shape (SPEC.md §6):
// { v:1, lessons: { [slug]: { stages:{start,learn,practice,quiz,finish},
//   practiceText:{exercise,thinking}, quizBest, quizLast, taskDone,
//   completedAt } }, last:{slug,stage}, updatedAt }
import { firebaseConfig } from '../firebase-config.js';

const LOCAL_KEY = 'finance-course:progress:v1';
const STAGE_KEYS = ['start', 'learn', 'practice', 'quiz', 'finish'];

function emptyProgress() {
  return { v: 1, lessons: {}, last: null, updatedAt: Date.now() };
}

function emptyLesson() {
  return {
    stages: { start: false, learn: false, practice: false, quiz: false, finish: false },
    practiceText: { exercise: '', thinking: '' },
    quizBest: null,
    quizLast: [],
    taskDone: false,
    completedAt: null,
  };
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || typeof parsed.lessons !== 'object') return emptyProgress();
    return parsed;
  } catch (e) {
    return emptyProgress();
  }
}

function writeLocal(state) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch (e) {
    // storage full/unavailable (e.g. private browsing): keep working in memory
  }
}

// per lesson: take the more-advanced/most-recent side; quizBest = max
function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const lessons = {};
  const slugs = new Set([...Object.keys(a.lessons || {}), ...Object.keys(b.lessons || {})]);
  for (const slug of slugs) {
    const la = a.lessons[slug];
    const lb = b.lessons[slug];
    if (!la) { lessons[slug] = lb; continue; }
    if (!lb) { lessons[slug] = la; continue; }
    const stages = {};
    for (const k of STAGE_KEYS) stages[k] = !!((la.stages && la.stages[k]) || (lb.stages && lb.stages[k]));
    const laDone = la.completedAt ? new Date(la.completedAt).getTime() : 0;
    const lbDone = lb.completedAt ? new Date(lb.completedAt).getTime() : 0;
    const newer = lbDone >= laDone ? lb : la;
    lessons[slug] = {
      stages,
      practiceText: {
        exercise: (newer.practiceText && newer.practiceText.exercise) || (la.practiceText && la.practiceText.exercise) || (lb.practiceText && lb.practiceText.exercise) || '',
        thinking: (newer.practiceText && newer.practiceText.thinking) || (la.practiceText && la.practiceText.thinking) || (lb.practiceText && lb.practiceText.thinking) || '',
      },
      quizBest: Math.max(la.quizBest || 0, lb.quizBest || 0) || null,
      quizLast: newer.quizLast || la.quizLast || lb.quizLast || [],
      taskDone: !!(la.taskDone || lb.taskDone),
      completedAt: laDone >= lbDone ? la.completedAt || null : lb.completedAt || null,
    };
  }
  const aUpdated = a.updatedAt || 0;
  const bUpdated = b.updatedAt || 0;
  return {
    v: 1,
    lessons,
    last: bUpdated > aUpdated ? b.last : a.last,
    updatedAt: Math.max(aUpdated, bUpdated),
  };
}

export function createStore() {
  let state = readLocal();
  const listeners = new Set();
  let syncStatus = 'local'; // 'local' | 'syncing' | 'synced' | 'error'
  let firebaseSync = null;
  let uid = null;

  function notify() {
    for (const cb of listeners) cb(state, syncStatus);
  }

  function persist() {
    state.updatedAt = Date.now();
    writeLocal(state);
    if (firebaseSync && uid) firebaseSync.writeDebounced(uid, state);
    notify();
  }

  function ensureLesson(slug) {
    if (!state.lessons[slug]) state.lessons[slug] = emptyLesson();
    return state.lessons[slug];
  }

  async function bindUser(user) {
    uid = user.uid;
    syncStatus = 'syncing';
    notify();
    let remote = null;
    try {
      remote = await firebaseSync.fetchRemote(uid);
    } catch (e) {
      remote = null;
    }
    if (remote && remote.__denied) {
      syncStatus = 'error';
      notify();
      return;
    }
    if (remote) {
      state = mergeProgress(state, remote);
      writeLocal(state);
    }
    syncStatus = 'synced';
    firebaseSync.watch(uid, (data) => {
      if (data) {
        state = mergeProgress(state, data);
        writeLocal(state);
        notify();
      }
    });
    notify();
  }

  const api = {
    getState() {
      return state;
    },
    getSyncStatus() {
      return syncStatus;
    },
    isSignedIn() {
      return !!uid;
    },
    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    getLessonProgress(slug) {
      return state.lessons[slug] || emptyLesson();
    },
    setStageDone(slug, stage, done = true) {
      const lesson = ensureLesson(slug);
      lesson.stages[stage] = done;
      persist();
    },
    savePracticeText(slug, field, text) {
      const lesson = ensureLesson(slug);
      lesson.practiceText[field] = text;
      persist();
    },
    saveQuizResult(slug, correctCount, answers) {
      const lesson = ensureLesson(slug);
      lesson.quizBest = Math.max(lesson.quizBest || 0, correctCount);
      lesson.quizLast = answers;
      lesson.stages.quiz = true;
      persist();
    },
    setTaskDone(slug, done) {
      const lesson = ensureLesson(slug);
      lesson.taskDone = done;
      persist();
    },
    completeLesson(slug) {
      const lesson = ensureLesson(slug);
      lesson.stages.finish = true;
      lesson.completedAt = new Date().toISOString();
      persist();
    },
    setLast(slug, stage) {
      state.last = { slug, stage };
      persist();
    },
    // Count of lessons marked complete. Note: this counts every completed
    // slug in progress, including the test-only "_fixture" lesson if it was
    // ever completed directly via its URL. harmless, since _fixture is
    // never linked from any menu a real learner can reach.
    completedCount() {
      return Object.values(state.lessons).filter((l) => l.completedAt).length;
    },

    async enableSync() {
      if (!firebaseConfig) {
        syncStatus = 'error';
        notify();
        return;
      }
      try {
        const { createFirebaseSync } = await import('./firebase-adapter.js');
        firebaseSync = await createFirebaseSync(firebaseConfig, {
          onPermissionDenied: () => {
            syncStatus = 'error';
            notify();
          },
        });
        if (firebaseSync.user) await bindUser(firebaseSync.user);
      } catch (e) {
        syncStatus = 'error';
        notify();
      }
    },
    async signIn(email, password) {
      if (!firebaseSync) await api.enableSync();
      if (!firebaseSync) throw new Error('sync-unavailable');
      const user = await firebaseSync.signIn(email, password);
      await bindUser(user);
      return user;
    },
  };

  return api;
}

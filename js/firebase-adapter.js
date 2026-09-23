// js/firebase-adapter.js : Firestore-backed progress sync + email/password
// sign-in. Adapted from the eyal-planner project (js/firebase-adapter.js)
// (same SDK version, via gstatic). Loaded only when the user opts in to sync
// from #/login. the app works fully offline/local without ever importing
// this file.
//
// Difference from the eyal-planner original: that app syncs a whole
// collection of items; this app syncs ONE document per user
// (users/{uid}/financeCourse/progress) holding the entire progress object
// (SPEC.md §6), since progress is small and always read/written as a whole.
//
// The planner's Firestore rules may only allow the planner's own paths under
// users/{uid}. a permission-denied error here is expected until the rules
// are updated in the console (not done by this app; see SPEC.md §6).
const SDK = 'https://www.gstatic.com/firebasejs/12.9.0';

function isPermissionDenied(err) {
  return !!(err && (err.code === 'permission-denied' || String(err.code || '').includes('permission-denied')));
}

export async function createFirebaseSync(config, { onPermissionDenied } = {}) {
  const [{ initializeApp }, authMod, fsMod] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);

  const app = initializeApp(config);
  const auth = authMod.getAuth(app);
  const db = fsMod.initializeFirestore(app, {
    localCache: fsMod.persistentLocalCache({
      tabManager: fsMod.persistentMultipleTabManager(),
    }),
  });

  const initialUser = await new Promise((resolve) => {
    const unsub = authMod.onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });

  function progressDoc(uid) {
    return fsMod.doc(db, 'users', uid, 'financeCourse', 'progress');
  }

  let unsubWatch = null;
  let writeTimer = null;

  return {
    user: initialUser,

    async signIn(email, password) {
      const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    },

    // same Firebase project as the planner, so the new password works there too
    async resetPassword(email) {
      auth.languageCode = 'he';
      await authMod.sendPasswordResetEmail(auth, email);
    },

    async signOut() {
      if (unsubWatch) unsubWatch();
      return authMod.signOut(auth);
    },

    // returns the remote progress object, or { __denied: true } on
    // permission-denied (kept working locally, caller shows "לא זמין").
    async fetchRemote(uid) {
      try {
        const snap = await fsMod.getDoc(progressDoc(uid));
        return snap.exists() ? snap.data() : null;
      } catch (err) {
        if (isPermissionDenied(err)) {
          onPermissionDenied && onPermissionDenied();
          return { __denied: true };
        }
        throw err;
      }
    },

    watch(uid, cb) {
      if (unsubWatch) unsubWatch();
      unsubWatch = fsMod.onSnapshot(
        progressDoc(uid),
        (snap) => cb(snap.exists() ? snap.data() : null),
        (err) => {
          if (isPermissionDenied(err)) onPermissionDenied && onPermissionDenied();
        }
      );
      return unsubWatch;
    },

    // debounced 1.5s per SPEC.md §6
    writeDebounced(uid, data) {
      clearTimeout(writeTimer);
      writeTimer = setTimeout(() => {
        fsMod.setDoc(progressDoc(uid), data).catch((err) => {
          if (isPermissionDenied(err)) onPermissionDenied && onPermissionDenied();
        });
      }, 1500);
    },
  };
}

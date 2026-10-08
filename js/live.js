// Live-Klassenraum über Firebase (Firestore + anonyme Anmeldung).
// Ohne Konfiguration in js/firebase-config.js bleibt der Live-Modus aus,
// die Lernwerkstatt läuft dann im bisherigen Modus mit Stimmkarten.
const V = '10.12.2';
const cfg = window.FIREBASE_CONFIG;
const ready = api => { window.LiveFB = api; window.dispatchEvent(new Event('live-ready')); };
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DAY = 24 * 60 * 60 * 1000;

if (!cfg || !cfg.apiKey || cfg.apiKey.startsWith('HIER')) {
  ready(null);
} else {
  try {
    const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    const A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
    const F = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
    const app = initializeApp(cfg);
    const auth = A.getAuth(app);
    const db = F.getFirestore(app);
    if (cfg.emulator) { // nur für Tests
      A.connectAuthEmulator(auth, cfg.emulator.auth, { disableWarnings: true });
      F.connectFirestoreEmulator(db, cfg.emulator.host, cfg.emulator.port);
    }
    const user = await new Promise((res, rej) => {
      const stop = A.onAuthStateChanged(auth, u => { if (u) { stop(); res(u); } });
      A.signInAnonymously(auth).catch(rej);
    });
    const uid = user.uid;
    const roomRef = code => F.doc(db, 'rooms', code);
    const playerRef = (code, id) => F.doc(db, 'rooms', code, 'players', id || uid);
    const expire = () => F.Timestamp.fromMillis(Date.now() + DAY);
    const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => ALPHA[b % ALPHA.length]).join('');

    ready({
      uid,
      async createRoom(gameId) {
        for (let i = 0; i < 6; i++) {
          const code = newCode();
          const snap = await F.getDoc(roomRef(code));
          if (snap.exists()) continue;
          await F.setDoc(roomRef(code), { owner: uid, open: true, gameId, round: 0, phase: 'lobby', decisions: [], createdAt: F.serverTimestamp(), expireAt: expire() });
          return code;
        }
        throw new Error('Kein freier Code gefunden');
      },
      async getRoom(code) {
        try { const s = await F.getDoc(roomRef(code)); return s.exists() ? s.data() : null; } catch (e) { return null; }
      },
      updateRoom: (code, patch) => F.updateDoc(roomRef(code), patch),
      watchRoom(code, cb) {
        return F.onSnapshot(roomRef(code), s => cb(s.exists() ? s.data() : null), () => cb(null));
      },
      watchPlayers(code, cb) {
        return F.onSnapshot(F.collection(db, 'rooms', code, 'players'),
          s => cb(s.docs.map(d => ({ uid: d.id, ...d.data() }))), e => console.warn('Teilnehmerliste', e));
      },
      watchMe(code, cb) {
        return F.onSnapshot(playerRef(code), s => cb(s.exists()), () => {});
      },
      joinRoom: (code, data) => F.setDoc(playerRef(code), { ...data, joinedAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(), expireAt: expire() }),
      updatePlayer: (code, data) => F.setDoc(playerRef(code), { ...data, updatedAt: F.serverTimestamp() }, { merge: true }),
      kick: (code, id) => F.deleteDoc(playerRef(code, id)),
      async deleteRoom(code) {
        const s = await F.getDocs(F.collection(db, 'rooms', code, 'players'));
        await Promise.all(s.docs.map(d => F.deleteDoc(d.ref)));
        await F.deleteDoc(roomRef(code));
      }
    });
  } catch (e) {
    console.warn('Live-Modus nicht verfügbar:', e);
    ready(null);
  }
}

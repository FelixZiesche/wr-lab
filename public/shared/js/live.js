// Live-Klassenraum über Firebase (Firestore + anonyme Anmeldung).
// Das ist die einzige Datei, die Firebase kennt. Wer Firebase gegen eine andere Lösung tauschen will,
// ersetzt nur diese Datei und behält die Schnittstelle bei:
//
//   connect()                      → Promise mit dem Live-Objekt, oder null, wenn kein Live-Modus möglich ist
//   live.uid                       → Kennung dieses Geräts
//   live.createRoom(topic, gameId) → neuer Raumcode (6 Zeichen aus ABCDEFGHJKLMNPQRSTUVWXYZ23456789)
//   live.getRoom(code)             → Raumdaten {owner, open, topic, gameId, round, phase, decisions} oder null
//   live.updateRoom(code, patch)   → nur das Gerät, das den Raum erstellt hat
//   live.watchRoom(code, cb)       → cb(raum oder null), gibt eine Abmeldefunktion zurück
//   live.watchPlayers(code, cb)    → cb([{uid, nick, fig, r, ph, votes, checks, choices, stats, joinedAt}])
//   live.watchMe(code, cb)         → cb(eigener Eintrag existiert: true/false)
//   live.joinRoom(code, data)      → eigenen Eintrag anlegen
//   live.updatePlayer(code, data)  → eigenen Eintrag ändern
//   live.kick(code, uid)           → Eintrag entfernen (Lehrkraft oder man selbst)
//   live.closeRoom(code)           → Raum beenden: alle sehen „beendet“, danach werden alle Daten gelöscht
//
// Die Zugangsdaten kommen automatisch von Firebase Hosting (/__/firebase/init.json).
// Für Hosting außerhalb von Firebase kann vor dieser Datei window.FIREBASE_CONFIG gesetzt werden.
// Projekte, deren ID mit „demo-“ beginnt, gibt es nur im Emulator: Dann verbindet sich die Seite mit ihm.
const V = '10.12.2';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DAY = 24 * 60 * 60 * 1000;
const TIMEOUT = 10000;

let pending = null;

/** Verbindet sich beim ersten Aufruf mit Firebase. Spätere Aufrufe bekommen dieselbe Verbindung. */
export function connect() {
  if (!pending) {
    pending = Promise.race([
      init().catch(e => { console.warn('Live-Modus nicht verfügbar:', e); return null; }),
      new Promise(res => setTimeout(() => res(null), TIMEOUT))
    ]);
  }
  return pending;
}

async function loadConfig() {
  if (window.FIREBASE_CONFIG) return window.FIREBASE_CONFIG;
  try {
    const res = await fetch('/__/firebase/init.json');
    if (res.ok) return await res.json();
  } catch (e) { /* kein Firebase Hosting */ }
  return null;
}

async function init() {
  const cfg = await loadConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) return null;
  const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
  const F = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  if (cfg.projectId.startsWith('demo-')) { // nur lokal mit `npm run dev` und in den Tests
    A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
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

  return {
    uid,
    async createRoom(topic, gameId) {
      for (let i = 0; i < 6; i++) {
        const code = newCode();
        const snap = await F.getDoc(roomRef(code));
        if (snap.exists()) continue;
        await F.setDoc(roomRef(code), { owner: uid, open: true, topic, gameId, round: 0, phase: 'lobby', decisions: [], createdAt: F.serverTimestamp(), expireAt: expire() });
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
    async closeRoom(code) {
      // Zuerst schließen, damit alle Geräte „beendet“ anzeigen, dann löschen.
      // Die Einträge der Schüler müssen vor dem Raum weg, weil die Regeln dafür den Raum prüfen.
      await F.updateDoc(roomRef(code), { open: false, phase: 'closed' }).catch(() => {});
      const s = await F.getDocs(F.collection(db, 'rooms', code, 'players'));
      await Promise.all(s.docs.map(d => F.deleteDoc(d.ref)));
      await F.deleteDoc(roomRef(code));
    }
  };
}

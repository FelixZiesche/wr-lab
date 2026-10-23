// Verbindung zum Server für den Lernraum über Firebase (Firestore + anonyme Anmeldung).
// Das ist die einzige Datei, die Firebase kennt. Wer Firebase gegen eine andere Lösung tauschen will,
// ersetzt nur diese Datei und behält die Schnittstelle bei:
//
//   connect()                      → Promise mit dem Live-Objekt, oder null, wenn kein Live-Modus möglich ist.
//                                    Nach null ist ein neuer Aufruf ein neuer Versuch (eine langsame Verbindung wird weiterverwendet).
//   liveFehler()                   → warum connect() zuletzt null lieferte: 'config' (kein Server eingerichtet),
//                                    'netz' (Server nicht erreichbar oder zu langsam, ein neuer Versuch kann helfen),
//                                    'laden' (Bibliothek nicht geladen, hilft nur Neuladen der Seite) oder '' (verbunden)
//   live.uid                       → Kennung dieses Geräts
//   live.createRoom(topic, gameId) → neuer Raumcode (6 Zeichen aus ABCDEFGHJKLMNPQRSTUVWXYZ23456789)
//   live.getRoom(code)             → Raumdaten oder null: {owner, open, topic, gameId, round, phase, decisions}
//                                    und für den Lernraum {pause, ziel, zielN, gesperrt, ki, umfrage:{id, n, auf},
//                                    quiz:{id, n, ph, i, nr, von, t, s, team, pkt, teams}, bankMonat}
//   live.raumStatus(code)          → {raum} wie getRoom, {fehlt: true}, wenn es den Raum sicher nicht gibt,
//                                    oder {fehler: true} bei einem Verbindungsproblem (dann nichts verwerfen)
//   live.updateRoom(code, patch)   → nur das Gerät, das den Raum erstellt hat
//   live.watchRoom(code, cb)       → cb(raum oder null), gibt eine Abmeldefunktion zurück (null nur, wenn der Server
//                                    meldet, dass es den Raum nicht mehr gibt, nicht bei Verbindungsproblemen)
//   live.watchPlayers(code, cb)    → cb([{uid, nick, ort, wc, bk, stimme:{n, w}, q:{n, w, at}, team, fig, r, ph, votes, checks, choices, stats, joinedAt}])
//   live.watchMe(code, cb)         → cb(eigener Eintrag existiert: true/false)
//   live.joinRoom(code, data)      → eigenen Eintrag anlegen
//   live.updatePlayer(code, data)  → eigenen Eintrag ändern
//   live.kick(code, uid)           → Eintrag entfernen (Lehrkraft oder man selbst)
//   live.sendAnswer(code, aufgabe, text) → eigene Antwort „an die Wand“ schicken (überschreibt die vorige)
//   live.deleteAnswer(code, aufgabe, uid) → Antwort von der Wand löschen (ohne uid die eigene; fremde nur die Lehrkraft)
//   live.watchAnswers(code, cb)    → cb([{uid, aufgabe, text, at}]), nur für die Lehrkraft
//   live.oeffneKonto(code, iban, name) → Übungskonto der Klassenbank (bank.js) anlegen: rooms/{code}/konten/{iban}
//   live.konto(code, iban)         → {uid, name} oder null (nur mit bekannter IBAN, auflisten dürfen nur Lehrkräfte)
//   live.loescheKonto(code, iban)  → eigenes Übungskonto löschen (oder als Lehrkraft jedes)
//   live.ueberweise(code, nr, b)   → Buchung nr (1–300) schicken: {an, vonIban, anIban, vonName, anName, betrag (Cent), zweck, echtzeit}
//   live.watchBuchungen(code, cb, alle) → cb([{id, von, an, vonIban, anIban, vonName, anName, betrag, zweck, echtzeit, at}]):
//                                    Schüler bekommen nur eigene und an sie gerichtete Buchungen, die Lehrkraft mit alle = true alle
//   live.closeRoom(code)           → Raum beenden: alle sehen „beendet“, danach werden alle Daten gelöscht
//   live.zeit()                    → Platzhalter für die Uhrzeit des Servers (als Wert in updateRoom und updatePlayer).
//                                    Gelesene Zeitstempel haben toMillis(); solange der Server sie noch nicht kennt, sind sie null.
//
// Die Zugangsdaten kommen automatisch von Firebase Hosting (/__/firebase/init.json).
// Für Hosting außerhalb von Firebase kann vor dieser Datei window.FIREBASE_CONFIG gesetzt werden.
// Projekte, deren ID mit „demo-“ beginnt, gibt es nur im Emulator: Dann verbindet sich die Seite mit ihm.
// Jeder neue Raum, Eintrag und jede Antwort trägt expireAt (24 Stunden nach dem Anlegen, Uhr des Geräts).
// Die Regeln verlangen es beim Anlegen; automatisch gelöscht wird nur mit eingerichteter TTL-Richtlinie (README).
const V = '10.12.2';
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DAY = 24 * 60 * 60 * 1000;
const TIMEOUT = 10000;

let initP = null, grund = '', basis = null;

/** Verbindet sich beim ersten Aufruf mit Firebase. Spätere Aufrufe bekommen dieselbe Verbindung.
 *  Gewartet wird höchstens TIMEOUT: Läuft der Aufbau danach noch, nutzt der nächste Aufruf ihn weiter
 *  (kein zweiter paralleler Aufbau). Nach einem Fehler startet der nächste Aufruf einen neuen Versuch. */
export function connect() {
  if (!initP) {
    initP = init().catch(e => { console.warn('Live-Modus nicht verfügbar:', e); return { grund: e && e.laden ? 'laden' : 'netz' }; })
      .then(r => { if (!r || r.grund) initP = null; return r || { grund: 'config' }; });
  }
  return Promise.race([initP, new Promise(res => setTimeout(() => res({ grund: 'netz' }), TIMEOUT))])
    .then(r => { grund = r.grund || ''; return r.grund ? null : r; });
}
/** Grund für das letzte null aus connect(): 'config', 'netz', 'laden' oder '' */
export const liveFehler = () => grund;

// null: kein Firebase Hosting (nicht eingerichtet). Ein Netzfehler wirft dagegen (keine Verbindung).
async function loadConfig() {
  if (window.FIREBASE_CONFIG) return window.FIREBASE_CONFIG;
  const res = await fetch('/__/firebase/init.json');
  if (!res.ok) return null;
  try { return await res.json(); } catch (e) { return null; }
}

async function init() {
  const cfg = await loadConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) return null;
  // App und Emulator-Verbindung nur einmal einrichten, ein neuer Versuch wiederholt nur die Anmeldung.
  // Ein fehlgeschlagener import() wird vom Browser nicht neu geladen: Dann hilft nur Neuladen der Seite ('laden').
  if (!basis) {
    let initializeApp, A, F;
    try {
      ({ initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`));
      A = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`);
      F = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
    } catch (e) { e.laden = true; throw e; }
    const app = initializeApp(cfg);
    // initializeAuth statt getAuth: ohne popupRedirectResolver (Anmelden per Popup braucht die Seite nicht).
    // Sonst lädt Firebase auf Handys und in Safari von sich aus apis.google.com und ein unsichtbares iframe nach.
    const auth = A.initializeAuth(app, { persistence: [A.indexedDBLocalPersistence, A.browserLocalPersistence] });
    const db = F.getFirestore(app);
    if (cfg.projectId.startsWith('demo-')) { // nur lokal mit `npm run dev` und in den Tests
      A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      F.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    basis = { A, F, auth, db };
  }
  const { A, F, auth, db } = basis;
  const user = await new Promise((res, rej) => {
    const stop = A.onAuthStateChanged(auth, u => { if (u) { stop(); res(u); } });
    A.signInAnonymously(auth).catch(e => { stop(); rej(e); });
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
        await F.setDoc(roomRef(code), { owner: uid, open: true, topic, gameId, round: 0, phase: 'lobby', decisions: [],
          pause: false, ziel: '', zielN: 0, gesperrt: [], ki: '', createdAt: F.serverTimestamp(), expireAt: expire() });
        return code;
      }
      throw new Error('Kein freier Code gefunden');
    },
    async getRoom(code) {
      try { const s = await F.getDoc(roomRef(code)); return s.exists() ? s.data() : null; } catch (e) { return null; }
    },
    async raumStatus(code) {
      try { const s = await F.getDoc(roomRef(code)); return s.exists() ? { raum: s.data() } : { fehlt: true }; }
      catch (e) { console.warn('Raum', e); return { fehler: true }; }
    },
    updateRoom: (code, patch) => F.updateDoc(roomRef(code), patch),
    // Ohne Verbindung liefert Firestore „gibt es nicht“ aus dem leeren Zwischenspeicher (fromCache): das zählt nicht
    watchRoom(code, cb) {
      return F.onSnapshot(roomRef(code), s => { if (s.exists()) cb(s.data()); else if (!s.metadata.fromCache) cb(null); },
        e => console.warn('Raum', e));
    },
    watchPlayers(code, cb) {
      return F.onSnapshot(F.collection(db, 'rooms', code, 'players'),
        s => cb(s.docs.map(d => ({ uid: d.id, ...d.data() }))), e => console.warn('Teilnehmerliste', e));
    },
    watchMe(code, cb) {
      return F.onSnapshot(playerRef(code), s => { if (s.exists() || !s.metadata.fromCache) cb(s.exists()); }, () => {});
    },
    joinRoom: (code, data) => F.setDoc(playerRef(code), { ...data, joinedAt: F.serverTimestamp(), updatedAt: F.serverTimestamp(), expireAt: expire() }),
    updatePlayer: (code, data) => F.setDoc(playerRef(code), { ...data, updatedAt: F.serverTimestamp() }, { merge: true }),
    kick: (code, id) => F.deleteDoc(playerRef(code, id)),
    sendAnswer: (code, aufgabe, text) => F.setDoc(F.doc(db, 'rooms', code, 'antworten', `${uid}_${aufgabe}`),
      { uid, aufgabe, text, at: F.serverTimestamp(), expireAt: expire() }),
    deleteAnswer: (code, aufgabe, id) => F.deleteDoc(F.doc(db, 'rooms', code, 'antworten', `${id || uid}_${aufgabe}`)),
    watchAnswers(code, cb) {
      return F.onSnapshot(F.collection(db, 'rooms', code, 'antworten'),
        s => cb(s.docs.map(d => d.data())), e => console.warn('Antworten', e));
    },
    oeffneKonto: (code, iban, name) => F.setDoc(F.doc(db, 'rooms', code, 'konten', iban), { uid, name, expireAt: expire() }),
    async konto(code, iban) {
      const s = await F.getDoc(F.doc(db, 'rooms', code, 'konten', iban));
      return s.exists() ? s.data() : null;
    },
    loescheKonto: (code, iban) => F.deleteDoc(F.doc(db, 'rooms', code, 'konten', iban)),
    ueberweise: (code, nr, b) => F.setDoc(F.doc(db, 'rooms', code, 'buchungen', `${uid}_${nr}`),
      { ...b, von: uid, at: F.serverTimestamp(), expireAt: expire() }),
    // Schüler dürfen nur Buchungen lesen, die sie selbst betreffen: zwei Abfragen (gesendet, empfangen)
    watchBuchungen(code, cb, alle) {
      const sammlung = F.collection(db, 'rooms', code, 'buchungen'), teile = {};
      const melde = (k, s) => { teile[k] = s.docs.map(d => ({ id: d.id, ...d.data() })); cb(Object.values(teile).flat()); };
      const fehler = e => console.warn('Buchungen', e);
      if (alle) return F.onSnapshot(sammlung, s => melde('alle', s), fehler);
      const stopp = [F.onSnapshot(F.query(sammlung, F.where('von', '==', uid)), s => melde('von', s), fehler),
        F.onSnapshot(F.query(sammlung, F.where('an', '==', uid)), s => melde('an', s), fehler)];
      return () => stopp.forEach(f => f());
    },
    zeit: () => F.serverTimestamp(),
    async closeRoom(code) {
      // Zuerst schließen, damit alle Geräte „beendet“ anzeigen, dann löschen.
      // Einträge und Antworten der Schüler müssen vor dem Raum weg, weil die Regeln dafür den Raum prüfen.
      await F.updateDoc(roomRef(code), { open: false, phase: 'closed' }).catch(() => {});
      for (const sammlung of ['antworten', 'buchungen', 'konten', 'players']) {
        const s = await F.getDocs(F.collection(db, 'rooms', code, sammlung));
        await Promise.all(s.docs.map(d => F.deleteDoc(d.ref)));
      }
      await F.deleteDoc(roomRef(code));
    }
  };
}

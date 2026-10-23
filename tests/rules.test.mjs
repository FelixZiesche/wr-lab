// Tests der Firestore-Sicherheitsregeln gegen den Emulator. Start mit `npm run test:rules`.
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

let env;
const CODE = 'K7Q2XM';
const room = (owner, extra = {}) => ({ owner, open: true, topic: 'sechseck', gameId: 'abc123', round: 0, phase: 'lobby', decisions: [], createdAt: new Date(), expireAt: new Date(), ...extra });
const player = (extra = {}) => ({ nick: 'Testi', fig: 'mia', r: 0, ph: 'event', votes: {}, checks: {}, choices: {}, stats: { konto: 1200, mood: 60 }, joinedAt: new Date(), updatedAt: new Date(), expireAt: new Date(), ...extra });
// Pro Gerät eine Firestore-Instanz (eine zweite würde die Einstellungen erneut setzen)
const dbs = new Map();
const db = uid => {
  if (!dbs.has(uid)) dbs.set(uid, (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore());
  return dbs.get(uid);
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wr-lab',
    firestore: { rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const admin = ctx.firestore();
    await admin.doc(`rooms/${CODE}`).set(room('lehrkraft'));
    await admin.doc(`rooms/${CODE}/players/schueler`).set(player());
  });
});

test('Raum anlegen: nur für sich selbst, mit Thema und gültigem Code', async () => {
  await assertSucceeds(db('neu').doc('rooms/ABCDEF').set(room('neu')));
  await assertSucceeds(db('neu').doc('rooms/ABCDEG').set(room('neu', { topic: 'kaufvertrag-2' })));
  await assertFails(db(null).doc('rooms/ABCDEH').set(room('neu')));
  await assertFails(db('neu').doc('rooms/ABCDEJ').set(room('jemand-anderes')));
  await assertFails(db('neu').doc('rooms/abcdef').set(room('neu')));
  const { topic, ...ohneThema } = room('neu');
  await assertFails(db('neu').doc('rooms/ABCDEK').set(ohneThema));
  await assertFails(db('neu').doc('rooms/ABCDEL').set(room('neu', { topic: 'Sechseck!' })));
  await assertFails(db('neu').doc('rooms/ABCDEM').set(room('neu', { extra: 1 })));
  await assertFails(db('neu').doc('rooms/ABCDEN').set(room('neu', { decisions: Array(31).fill('A') })));
});

test('Raum lesen: mit Code ja, auflisten nein', async () => {
  await assertSucceeds(db('schueler').doc(`rooms/${CODE}`).get());
  await assertFails(db(null).doc(`rooms/${CODE}`).get());
  await assertFails(db('schueler').collection('rooms').get());
});

test('Raum steuern und löschen: nur das Gerät der Lehrkraft, Thema bleibt fest', async () => {
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ round: 1, phase: 'vote', decisions: ['A'] }));
  await assertFails(db('schueler').doc(`rooms/${CODE}`).update({ phase: 'end' }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ topic: 'anderes-thema' }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ owner: 'schueler' }));
  await assertFails(db('schueler').doc(`rooms/${CODE}`).delete());
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).delete());
});

test('Beitreten: nur der eigene Eintrag, gültige Figur, nur bei offenem Raum', async () => {
  const ref = uid => db(uid).doc(`rooms/${CODE}/players/${uid}`);
  await assertSucceeds(ref('neu').set(player({ fig: 'landwirt-paul' })));
  await assertFails(db('neu').doc(`rooms/${CODE}/players/fremd`).set(player()));
  await assertFails(ref('a').set(player({ fig: 'Mia' })));
  await assertFails(ref('b').set(player({ fig: 'x'.repeat(25) })));
  await assertFails(ref('c').set(player({ nick: '' })));
  await assertFails(ref('d').set(player({ nick: 'x'.repeat(21) })));
  await assertFails(ref('e').set(player({ stats: Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, i])) })));
  await assertFails(ref('f').set(player({ geheim: true })));
  await assertSucceeds(db('schueler').doc(`rooms/${CODE}/players/schueler`).set({ r: 1, ph: 'vote', votes: { 0: 'A' } }, { merge: true }));
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ open: false }));
  await assertFails(ref('g').set(player()));
});

test('Einträge lesen und entfernen: Schüler nur den eigenen, Lehrkraft alle', async () => {
  await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc(`rooms/${CODE}/players/kalle`).set(player({ nick: 'Kalle' })));
  await assertSucceeds(db('schueler').doc(`rooms/${CODE}/players/schueler`).get());
  await assertFails(db('schueler').doc(`rooms/${CODE}/players/kalle`).get());
  await assertFails(db('schueler').collection(`rooms/${CODE}/players`).get());
  await assertSucceeds(db('lehrkraft').collection(`rooms/${CODE}/players`).get());
  await assertFails(db('schueler').doc(`rooms/${CODE}/players/kalle`).delete());
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}/players/kalle`).delete());
  await assertSucceeds(db('schueler').doc(`rooms/${CODE}/players/schueler`).delete());
});

test('Planspiel: Stimmen nur A, B oder C, Checks nur richtig oder falsch, Entscheidungen nur 0 bis 2', async () => {
  const ich = db('schueler').doc(`rooms/${CODE}/players/schueler`);
  // So schreibt planspiel.js: Schlüssel ist die Runde
  await assertSucceeds(ich.set({ votes: { 0: 'A', 1: 'B', 2: 'C' }, checks: { 0: true, 1: false }, choices: { 0: 0, 1: 1, 2: 2 } }, { merge: true }));
  await assertSucceeds(db('neu').doc(`rooms/${CODE}/players/neu`).set(player({ votes: { 0: 'C' }, checks: { 0: false }, choices: { 0: 2 } })));
  for (const falsch of [
    { votes: { 0: 'Ich stimme für A, weil die Preise sinken' } }, { votes: { 0: 'D' } }, { votes: { 0: 1 } }, { votes: { 0: 'a' } },
    { checks: { 0: 'ja' } }, { checks: { 0: 1 } },
    { choices: { 0: 3 } }, { choices: { 0: -1 } }, { choices: { 0: '1' } }, { choices: { 0: 1.5 } }
  ]) await assertFails(ich.set(falsch, { merge: true }));
  await assertFails(ich.set({ votes: Object.fromEntries(Array.from({ length: 31 }, (_, i) => [i, 'A'])) }, { merge: true }));
});

test('Lernraum: Steuerfelder nur für die Lehrkraft und mit gültigen Typen', async () => {
  await assertSucceeds(db('neu').doc('rooms/ABCDEP').set(room('neu', { pause: false, ziel: '', zielN: 0, gesperrt: [] })));
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ pause: true, ziel: 'preis', zielN: 3, gesperrt: ['phillips', 'quiz'] }));
  await assertFails(db('schueler').doc(`rooms/${CODE}`).update({ pause: false }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ pause: 'ja' }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ ziel: 'x'.repeat(41) }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ gesperrt: Array(61).fill('a') }));
});

test('Lernraum: Beitritt ohne Figur, Ort begrenzt', async () => {
  const { fig, ...ohneFigur } = player();
  await assertSucceeds(db('neu').doc(`rooms/${CODE}/players/neu`).set({ ...ohneFigur, ort: 'preis' }));
  await assertFails(db('neu2').doc(`rooms/${CODE}/players/neu2`).set({ ...ohneFigur, ort: 'x'.repeat(41) }));
});

test('Antworten an die Wand: nur eigene, begrenzt, nur im offenen Raum, lesen nur die Lehrkraft', async () => {
  const antwort = (uid, aufgabe, extra = {}) => ({ uid, aufgabe, text: 'Weil die Preise sonst sinken.', at: new Date(), expireAt: new Date(), ...extra });
  const ref = (uid, id) => db(uid).doc(`rooms/${CODE}/antworten/${id}`);
  await assertSucceeds(ref('schueler', 'schueler_preis-wand').set(antwort('schueler', 'preis-wand')));
  await assertSucceeds(ref('schueler', 'schueler_preis-wand').set(antwort('schueler', 'preis-wand', { text: 'Geändert.' })));
  await assertFails(ref('schueler', 'fremd_preis-wand').set(antwort('schueler', 'preis-wand')));
  await assertFails(ref('schueler', 'schueler_andere').set(antwort('schueler', 'preis-wand')));
  await assertFails(ref('schueler', 'schueler_x').set(antwort('fremd', 'x')));
  await assertFails(ref('schueler', 'schueler_lang').set(antwort('schueler', 'lang', { text: 'x'.repeat(1001) })));
  await assertFails(ref('schueler', 'schueler_leer').set(antwort('schueler', 'leer', { text: '' })));
  await assertFails(ref('schueler', 'schueler_Gross').set(antwort('schueler', 'Gross')));
  await assertFails(ref('schueler', 'schueler_extra').set(antwort('schueler', 'extra', { nick: 'Testi' })));
  // Wer nicht (mehr) im Raum ist, schreibt nichts an die Wand
  await assertFails(ref('aussen', 'aussen_preis-wand').set(antwort('aussen', 'preis-wand')));
  // Lesen: eigene ja, fremde und Liste nur die Lehrkraft
  await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc(`rooms/${CODE}/antworten/kalle_preis-wand`).set(antwort('kalle', 'preis-wand')));
  await assertSucceeds(ref('schueler', 'schueler_preis-wand').get());
  await assertFails(ref('schueler', 'kalle_preis-wand').get());
  await assertFails(db('schueler').collection(`rooms/${CODE}/antworten`).get());
  await assertSucceeds(db('lehrkraft').collection(`rooms/${CODE}/antworten`).get());
  await assertFails(ref('schueler', 'kalle_preis-wand').delete());
  await assertSucceeds(ref('lehrkraft', 'kalle_preis-wand').delete());
  // Geschlossener Raum: keine neuen Antworten mehr
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ open: false }));
  await assertFails(ref('schueler', 'schueler_zu').set(antwort('schueler', 'zu')));
});

test('Wissenscheck und KI-Coach: nur Punkte als kurze Zeichenkette, Link nur von der Lehrkraft', async () => {
  const ich = db('schueler').doc(`rooms/${CODE}/players/schueler`);
  await assertSucceeds(ich.set({ wc: 'a5-0--9a' }, { merge: true }));
  await assertSucceeds(ich.set({ wc: '' }, { merge: true }));
  await assertFails(ich.set({ wc: 'Meine Antwort: weil die Preise steigen' }, { merge: true }));
  await assertFails(ich.set({ wc: 'a'.repeat(61) }, { merge: true }));
  await assertFails(ich.set({ wc: 7 }, { merge: true }));
  // AIS.chat-Link: nur https, begrenzt, nur die Lehrkraft
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ ki: 'https://chat.example.de/szenario/abc123' }));
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ ki: '' }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ ki: 'javascript:alert(1)' }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ ki: 'https://x.de/' + 'a'.repeat(300) }));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}`).update({ ki: 'https://x.de/mit leerzeichen' }));
  await assertFails(db('schueler').doc(`rooms/${CODE}`).update({ ki: 'https://boese.example/' }));
});

test('Live-Abstimmung: Umfrage nur von der Lehrkraft, Stimme nur als kleine Zahl im eigenen Eintrag', async () => {
  const raumRef = uid => db(uid).doc(`rooms/${CODE}`);
  await assertSucceeds(raumRef('lehrkraft').update({ umfrage: { id: 'gericht-simson', n: 1, auf: false } }));
  await assertSucceeds(raumRef('lehrkraft').update({ umfrage: { id: 'gericht-simson', n: 1, auf: true } }));
  await assertSucceeds(raumRef('lehrkraft').update({ umfrage: { id: '', n: 1, auf: false } }));
  await assertFails(raumRef('schueler').update({ umfrage: { id: 'gericht-simson', n: 2, auf: false } }));
  await assertFails(raumRef('lehrkraft').update({ umfrage: { id: 'Gericht!', n: 1, auf: false } }));
  await assertFails(raumRef('lehrkraft').update({ umfrage: { id: 'gericht', n: 1 } }));
  await assertFails(raumRef('lehrkraft').update({ umfrage: { id: 'gericht', n: 1, auf: false, frage: 'Text' } }));
  const ich = db('schueler').doc(`rooms/${CODE}/players/schueler`);
  await assertSucceeds(ich.set({ stimme: { n: 1, w: 2 } }, { merge: true }));
  await assertFails(ich.set({ stimme: { n: 1, w: 10 } }, { merge: true }));
  await assertFails(ich.set({ stimme: { n: 1, w: 'wirksam' } }, { merge: true }));
  await assertFails(ich.set({ stimme: { n: 1, w: 1, text: 'Begründung' } }, { merge: true }));
  await assertFails(db('fremd').doc(`rooms/${CODE}/players/schueler`).set({ stimme: { n: 1, w: 0 } }, { merge: true }));
});

test('Klassen-Quiz: Steuerung nur von der Lehrkraft ohne Spitznamen, eine Antwort pro Frage mit Serverzeit, nur während die Frage läuft', async () => {
  const raumRef = uid => db(uid).doc(`rooms/${CODE}`);
  const quiz = (extra = {}) => ({ id: 'wissenscheck', n: 1, ph: 'frage', i: 3, nr: 1, von: 10, t: new Date(), s: 30, team: 0, ...extra });
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: quiz({ ph: 'lobby' }) }));
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: quiz({ ph: 'auf', pkt: { schueler: [870, 870, 1, 1] }, teams: [870, 0] }) }));
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: { id: '', n: 1, ph: '' } }));
  await assertFails(raumRef('schueler').update({ quiz: quiz() }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ ph: 'gewonnen' }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ i: 60 }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ team: 7 }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ s: 601 }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ top: ['Testi'] }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: quiz({ teams: [1, 2, 3, 4, 5, 6, 7] }) }));
  await assertFails(raumRef('lehrkraft').update({ quiz: { id: 'wissenscheck', n: 1 } }));

  const jetzt = firebase.firestore.FieldValue.serverTimestamp();
  const ich = db('schueler').doc(`rooms/${CODE}/players/schueler`);
  // Läuft keine Frage, nimmt der Raum keine Antwort an
  await assertFails(ich.set({ q: { n: 1, w: 2, at: jetzt } }, { merge: true }));
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: quiz() }));
  // Zeitpunkt nur vom Server, Antwort nur als Zahl, nur zum laufenden Durchgang
  await assertFails(ich.set({ q: { n: 1, w: 2, at: new Date(Date.now() - 20000) } }, { merge: true }));
  await assertFails(ich.set({ q: { n: 1, w: 'die Inflation', at: jetzt } }, { merge: true }));
  await assertFails(ich.set({ q: { n: 2, w: 2, at: jetzt } }, { merge: true }));
  await assertFails(ich.set({ q: { n: 1, w: 2, at: jetzt, text: 'Begründung' } }, { merge: true }));
  await assertSucceeds(ich.set({ q: { n: 1, w: 2, at: jetzt } }, { merge: true }));
  // Eine Antwort pro Frage; andere Felder ändern geht weiter
  await assertFails(ich.set({ q: { n: 1, w: 0, at: jetzt } }, { merge: true }));
  await assertSucceeds(ich.set({ ort: 'wissenscheck', team: 2 }, { merge: true }));
  await assertFails(ich.set({ team: 7 }, { merge: true }));
  // Nach dem Ende der Frage keine Antwort mehr, in der nächsten Frage wieder
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: quiz({ ph: 'zu' }) }));
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}/players/lehrkraft`).set(player({ expireAt: new Date(Date.now() + 3600e3) })));
  await assertFails(db('lehrkraft').doc(`rooms/${CODE}/players/lehrkraft`).set({ q: { n: 1, w: 1, at: jetzt } }, { merge: true }));
  await assertSucceeds(raumRef('lehrkraft').update({ quiz: quiz({ n: 2, i: 5, nr: 2 }) }));
  await assertSucceeds(ich.set({ q: { n: 2, w: 1.5, at: jetzt } }, { merge: true }));
  // Beim Beitreten noch keine Antwort, fremde Einträge nie
  await assertFails(db('neu').doc(`rooms/${CODE}/players/neu`).set(player({ q: { n: 2, w: 1, at: jetzt }, expireAt: new Date(Date.now() + 3600e3) })));
  await assertFails(db('fremd').doc(`rooms/${CODE}/players/schueler`).set({ q: { n: 2, w: 0, at: jetzt } }, { merge: true }));
});

test('Ablaufdatum: beim Anlegen Pflicht und höchstens 72 Stunden in der Zukunft, beim Ändern bleibt es', async () => {
  const in_ = h => new Date(Date.now() + h * 3600 * 1000);
  const ohne = ({ expireAt, ...rest }) => rest;
  // Räume
  await assertFails(db('neu').doc('rooms/ABCDEQ').set(ohne(room('neu'))));
  await assertFails(db('neu').doc('rooms/ABCDER').set(room('neu', { expireAt: in_(100) })));
  await assertFails(db('neu').doc('rooms/ABCDES').set(room('neu', { expireAt: 'morgen' })));
  await assertSucceeds(db('neu').doc('rooms/ABCDET').set(room('neu', { expireAt: in_(24) })));
  // Geräteuhr geht zwei Tage vor: noch erlaubt
  await assertSucceeds(db('neu').doc('rooms/ABCDEU').set(room('neu', { expireAt: in_(70) })));
  await assertSucceeds(db('neu').doc('rooms/ABCDET').update({ round: 1 }));
  await assertFails(db('neu').doc('rooms/ABCDET').update({ expireAt: in_(100) }));
  // Alte Räume ohne Ablaufdatum lassen sich weiter steuern und beenden
  await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc('rooms/ALTRM2').set(ohne(room('lehrkraft'))));
  await assertSucceeds(db('lehrkraft').doc('rooms/ALTRM2').update({ open: false, phase: 'closed' }));
  // Einträge
  const ich = uid => db(uid).doc(`rooms/${CODE}/players/${uid}`);
  await assertFails(ich('neu1').set(ohne(player())));
  await assertFails(ich('neu2').set(player({ expireAt: in_(100) })));
  await assertSucceeds(ich('neu3').set(player({ expireAt: in_(24) })));
  await assertSucceeds(ich('neu3').set({ ort: 'preis' }, { merge: true }));
  await assertFails(ich('neu3').set({ expireAt: in_(100) }, { merge: true }));
  // Ein entfernter Schüler legt seinen Eintrag ohne Ablaufdatum nicht neu an
  await assertFails(ich('neu4').set({ nick: 'Testi', ort: 'preis' }, { merge: true }));
  // Antworten
  const antwort = extra => ({ uid: 'schueler', aufgabe: 'preis-wand', text: 'Weil die Preise sonst sinken.', at: new Date(), expireAt: in_(24), ...extra });
  const ref = db('schueler').doc(`rooms/${CODE}/antworten/schueler_preis-wand`);
  await assertFails(ref.set(ohne(antwort())));
  await assertFails(ref.set(antwort({ expireAt: in_(100) })));
  await assertSucceeds(ref.set(antwort()));
  await assertSucceeds(ref.set(antwort({ text: 'Geändert.', expireAt: in_(24) })));
});

test('Raum verlassen und Wand aufräumen: Schüler löschen nur eigene Antworten, die Lehrkraft jede', async () => {
  const antwort = (uid, aufgabe) => ({ uid, aufgabe, text: 'Text', at: new Date(), expireAt: new Date() });
  await env.withSecurityRulesDisabled(async ctx => {
    const admin = ctx.firestore();
    await admin.doc(`rooms/${CODE}/antworten/schueler_preis-wand`).set(antwort('schueler', 'preis-wand'));
    await admin.doc(`rooms/${CODE}/antworten/schueler_politik-wand`).set(antwort('schueler', 'politik-wand'));
    await admin.doc(`rooms/${CODE}/antworten/kalle_preis-wand`).set(antwort('kalle', 'preis-wand'));
    await admin.doc(`rooms/${CODE}/antworten/troll_preis-wand`).set(antwort('troll', 'preis-wand'));
  });
  const ref = (uid, id) => db(uid).doc(`rooms/${CODE}/antworten/${id}`);
  // Eigene Antwort: ja, auch nachdem der eigene Eintrag schon entfernt ist
  await assertSucceeds(ref('schueler', 'schueler_preis-wand').delete());
  await assertSucceeds(db('schueler').doc(`rooms/${CODE}/players/schueler`).delete());
  await assertSucceeds(ref('schueler', 'schueler_politik-wand').delete());
  // Fremde Antwort: nein; fehlende Antwort: abgelehnt (der Client fängt das ab)
  await assertFails(ref('schueler', 'kalle_preis-wand').delete());
  await assertFails(ref('schueler', 'schueler_gibts-nicht').delete());
  // Lehrkraft nimmt eine einzelne Antwort von der Wand, andere bleiben
  await assertFails(ref('kalle', 'troll_preis-wand').delete());
  await assertSucceeds(ref('lehrkraft', 'troll_preis-wand').delete());
  await assertSucceeds(ref('lehrkraft', 'kalle_preis-wand').get());
});

test('Klassenbank: Konto nur für sich, finden nur mit IBAN, Überweisung nur vom Absender an ein passendes Konto', async () => {
  const IBAN_S = 'DE12002305000000000001', IBAN_K = 'DE34002305000000000002';
  const in24 = () => new Date(Date.now() + 24 * 3600 * 1000);
  await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc(`rooms/${CODE}/players/kalle`).set(player({ nick: 'Kalle' })));
  const konto = (uid, iban) => db(uid).doc(`rooms/${CODE}/konten/${iban}`);
  // Konto anlegen: nur Teilnehmer, nur mit eigener uid, gültiger IBAN und Spitzname
  await assertSucceeds(konto('schueler', IBAN_S).set({ uid: 'schueler', name: 'Testi', expireAt: in24() }));
  await assertSucceeds(konto('kalle', IBAN_K).set({ uid: 'kalle', name: 'Kalle', expireAt: in24() }));
  await assertFails(konto('fremd', 'DE56002305000000000003').set({ uid: 'fremd', name: 'Fremd', expireAt: in24() }));
  await assertFails(konto('schueler', 'DE56002305000000000003').set({ uid: 'kalle', name: 'Kalle', expireAt: in24() }));
  await assertFails(konto('schueler', 'XX56002305000000000003').set({ uid: 'schueler', name: 'Testi', expireAt: in24() }));
  await assertFails(konto('schueler', 'DE56002305000000000003').set({ uid: 'schueler', name: 'x'.repeat(21), expireAt: in24() }));
  await assertFails(konto('schueler', 'DE56002305000000000003').set({ uid: 'schueler', name: 'Testi', saldo: 99999, expireAt: in24() }));
  await assertFails(konto('kalle', IBAN_S).set({ uid: 'kalle', name: 'Kalle', expireAt: in24() }));
  // Finden mit IBAN ja, auflisten nur die Lehrkraft
  await assertSucceeds(konto('schueler', IBAN_K).get());
  await assertFails(db('schueler').collection(`rooms/${CODE}/konten`).get());
  await assertSucceeds(db('lehrkraft').collection(`rooms/${CODE}/konten`).get());

  const jetzt = firebase.firestore.FieldValue.serverTimestamp();
  const b = extra => ({ von: 'schueler', an: 'kalle', vonIban: IBAN_S, anIban: IBAN_K, vonName: 'Testi', anName: 'Kalle', betrag: 650, zweck: 'Pizza', echtzeit: true, at: jetzt, expireAt: in24(), ...extra });
  const buchung = (uid, id) => db(uid).doc(`rooms/${CODE}/buchungen/${id}`);
  await assertSucceeds(buchung('schueler', 'schueler_1').set(b()));
  await assertSucceeds(buchung('schueler', 'schueler_300').set(b({ echtzeit: false })));
  // Nummer, Absender, Betrag, Namen und Konten werden geprüft
  await assertFails(buchung('schueler', 'schueler_301').set(b()));
  await assertFails(buchung('schueler', 'kalle_2').set(b()));
  await assertFails(buchung('kalle', 'kalle_1').set(b()));
  await assertFails(buchung('schueler', 'schueler_2').set(b({ betrag: 0 })));
  await assertFails(buchung('schueler', 'schueler_3').set(b({ betrag: 100001 })));
  await assertFails(buchung('schueler', 'schueler_4').set(b({ betrag: 6.5 })));
  await assertFails(buchung('schueler', 'schueler_5').set(b({ anName: 'Paul' })));
  await assertFails(buchung('schueler', 'schueler_6').set(b({ vonName: 'Kalle' })));
  await assertFails(buchung('schueler', 'schueler_7').set(b({ an: 'lehrkraft' })));
  await assertFails(buchung('schueler', 'schueler_8').set(b({ anIban: 'DE56002305000000000003' })));
  await assertFails(buchung('schueler', 'schueler_9').set(b({ zweck: 'x'.repeat(141) })));
  await assertFails(buchung('schueler', 'schueler_10').set(b({ at: new Date(0) })));
  await assertFails(buchung('schueler', 'schueler_11').set(b({ geheim: 1 })));
  // Nicht ändern, nicht überschreiben
  await assertFails(buchung('schueler', 'schueler_1').update({ betrag: 1 }));
  await assertFails(buchung('kalle', 'schueler_1').delete());
  // Lesen: Absender und Empfänger, nicht die anderen; die Lehrkraft alle
  await env.withSecurityRulesDisabled(ctx => ctx.firestore().doc(`rooms/${CODE}/players/mira`).set(player({ nick: 'Mira' })));
  await assertSucceeds(buchung('schueler', 'schueler_1').get());
  await assertSucceeds(buchung('kalle', 'schueler_1').get());
  await assertFails(buchung('mira', 'schueler_1').get());
  await assertSucceeds(db('kalle').collection(`rooms/${CODE}/buchungen`).where('an', '==', 'kalle').get());
  await assertFails(db('mira').collection(`rooms/${CODE}/buchungen`).get());
  await assertSucceeds(db('lehrkraft').collection(`rooms/${CODE}/buchungen`).get());
  // Geschlossener Raum: keine neuen Konten und Überweisungen; Konto löschen: eigenes oder die Lehrkraft
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}`).update({ open: false }));
  await assertFails(buchung('schueler', 'schueler_12').set(b()));
  await assertFails(konto('schueler', IBAN_K).delete());
  await assertSucceeds(konto('kalle', IBAN_K).delete());
  await assertSucceeds(konto('schueler', IBAN_S).delete());
  await assertSucceeds(db('lehrkraft').doc(`rooms/${CODE}/buchungen/schueler_1`).delete());
});

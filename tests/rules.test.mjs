// Tests der Firestore-Sicherheitsregeln gegen den Emulator. Start mit `npm run test:rules`.
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

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

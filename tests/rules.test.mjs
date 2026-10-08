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

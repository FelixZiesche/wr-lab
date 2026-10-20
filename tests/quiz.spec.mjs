// Klassen-Quiz: Die Lehrkraft spielt den Wissenscheck im Lernraum mit der Klasse (quiz.js).
import AxeBuilder from '@axe-core/playwright';
import { test, expect, device, readDoc, SECHSECK } from './helpers.mjs';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const axe = async (page, wo) => (await new AxeBuilder({ page }).include('#qz').withTags(TAGS).analyze()).violations
  .map(v => `${wo} – ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);

async function beitreten(browser, code, nick) {
  const s = await device(browser, { viewport: { width: 390, height: 844 }, kontext: { reducedMotion: 'reduce' } });
  await s.goto(`${SECHSECK}#raum=${code}`);
  await s.locator('#lr-nick').fill(nick);
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
  await s.locator('#modal-close').click();
  return s;
}
// Beantwortet die laufende Frage auf dem Handy mit der ersten Möglichkeit (oder einer Zahl)
async function antworten(s) {
  const qz = s.locator('#qz');
  await expect(qz.locator('[data-qz-w], [data-qz-m], [data-qz-zahl]').first()).toBeVisible();
  if (await qz.locator('[data-qz-zahl]').count()) {
    await qz.locator('[data-qz-zahl]').fill('2,5');
    await qz.locator('[data-qz-abgeben]').click();
  } else if (await qz.locator('[data-qz-m]').count()) {
    await qz.locator('[data-qz-m]').first().click();
    await qz.locator('[data-qz-abgeben]').click();
  } else await qz.locator('[data-qz-w]').first().click();
  await expect(qz).toContainText('Deine Antwort ist abgegeben');
}

test('Klassen-Quiz: Teams, Antworten auf Zeit, Lösung, Rangliste mit Spitznamen nur bei der Lehrkraft, Übernahme in den Wissenscheck', async ({ page: lk, browser }) => {
  test.setTimeout(180_000);
  // Feste Auswahl der Fragen (sonst zufällig)
  await lk.addInitScript(() => { Math.random = () => 0.5; });
  await lk.setViewportSize({ width: 1280, height: 800 });
  await lk.goto(SECHSECK);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  const mia = await beitreten(browser, code, 'Mia');
  const ben = await beitreten(browser, code, 'Ben');

  // Lehrkraft: über das Dashboard in den Wissenscheck, Quiz einstellen und starten
  await expect(lk.locator('#lr-wc [data-lr-quiz]')).toBeVisible();
  await lk.locator('#lr-wc [data-lr-quiz]').click();
  const kasten = lk.locator('[data-quiz]');
  await expect(kasten).toContainText('Klassen-Quiz');
  await expect(kasten).toContainText('Offene Aufgaben, Zuordnen und Reihenfolge bleiben im Wissenscheck');
  await kasten.locator('[data-qz-anzahl]').selectOption('5');
  await kasten.locator('[data-qz-zeit-wahl]').selectOption('60');
  await kasten.locator('[data-qz-teams]').selectOption('2');
  await kasten.locator('[data-qz-start]').click();

  // Lobby: Auf den Handys erscheint das Quiz, jeder wählt sein Team
  const qz = lk.locator('#qz');
  await expect(qz).toBeVisible();
  await expect(qz.locator('#qz-t')).toHaveText('Klassen-Quiz: Macht mit!');
  await expect(qz).toContainText('2 Geräte im Raum');
  await expect(qz).toContainText('2 noch ohne Team');
  for (const s of [mia, ben]) {
    await expect(s.locator('#qz')).toBeVisible();
    await expect(s.locator('#qz-t')).toHaveText('Wähle dein Team');
    await expect(s.locator('.app')).toHaveJSProperty('inert', true);
  }
  await mia.locator('[data-qz-team="1"]').click();
  await expect(mia.locator('[data-qz-team="1"]')).toHaveAttribute('aria-pressed', 'true');
  await ben.locator('[data-qz-team="2"]').click();
  await expect(qz).toContainText('0 noch ohne Team');
  expect([...await axe(lk, 'Lobby Lehrkraft'), ...await axe(mia, 'Lobby Handy')]).toEqual([]);

  // Frage 1: Countdown, Antworten zählen mit; haben alle geantwortet, löst das Quiz von selbst auf
  await qz.locator('[data-qz-weiter]').click();
  await expect(qz.locator('[data-qz-kopf]')).toContainText('Frage 1 von 5');
  await expect(qz.locator('[data-qz-zeit]')).toHaveText(/^noch \d+ s$/);
  await expect(qz.locator('[data-qz-n]')).toHaveText('0 von 2 haben geantwortet');
  await expect(mia.locator('#qz [data-qz-kopf]')).toContainText('Frage 1 von 5');
  expect(await axe(mia, 'Frage Handy')).toEqual([]);
  await antworten(mia);
  await expect(qz.locator('[data-qz-n]')).toHaveText('1 von 2 haben geantwortet');
  // Eine zweite Antwort auf dieselbe Frage nimmt der Server nicht an (Regeln), die Knöpfe sind gesperrt
  const knoepfe = mia.locator('#qz :is([data-qz-w], [data-qz-m])');
  if (await knoepfe.count()) for (const b of await knoepfe.all()) await expect(b).toBeDisabled();
  await antworten(ben);
  await expect(qz).toContainText('2 von 2 haben geantwortet');
  await expect(qz.locator('[data-qz-rang]')).toBeVisible();
  for (const s of [mia, ben]) {
    await expect(s.locator('#qz [data-qz-ergebnis]')).toContainText('Richtig ist:');
    await expect(s.locator('#qz .qz-platz')).toContainText(/Platz [12] von 2/);
    await expect(s.locator('#qz .qz-platz')).toContainText(/Team (Saale|Ilm): Platz [12] von 2/);
  }
  expect([...await axe(lk, 'Lösung Lehrkraft'), ...await axe(ben, 'Lösung Handy')]).toEqual([]);

  // Rangliste: Teams und Einzelwertung mit Spitznamen, die Lehrkraft kann die Namen ausblenden
  await qz.locator('[data-qz-rang]').click();
  await expect(qz.locator('#qz-t')).toHaveText('Rangliste nach Frage 1');
  await expect(qz).toContainText('Team Saale');
  await expect(qz).toContainText('Beste Einzelwertung');
  await expect(qz.locator('.qz-rang').last()).toContainText('Mia');
  await qz.locator('[data-qz-namen]').click();
  await expect(qz.locator('[data-qz-namen]')).toHaveAttribute('aria-pressed', 'false');
  await expect(qz.locator('.qz-rang').last()).not.toContainText('Mia');
  await qz.locator('[data-qz-namen]').click();
  // Im Raum stehen keine Spitznamen, nur Punkte pro Gerät
  const raumDoc = JSON.stringify((await readDoc(`rooms/${code}`)).fields.quiz);
  expect(raumDoc).toContain('pkt');
  expect(raumDoc).not.toContain('Mia');

  // Frage 2: Ben antwortet nicht, die Lehrkraft gibt mehr Zeit und löst dann selbst auf
  await qz.locator('[data-qz-weiter]').click();
  await expect(qz.locator('[data-qz-kopf]')).toContainText('Frage 2 von 5');
  await qz.locator('[data-qz-mehr]').click();
  await antworten(mia);
  await qz.locator('[data-qz-schliessen]').click();
  await expect(ben.locator('#qz [data-qz-ergebnis]')).toContainText('Keine Antwort.');
  await expect(qz).toContainText('1 von 2 haben geantwortet');
  // Ein Schüler kann das Fenster schließen, bei der nächsten Frage öffnet es sich wieder
  await ben.locator('#qz [data-qz-zu]').click();
  await expect(ben.locator('#qz')).toBeHidden();
  await expect(ben.locator('.app')).toHaveJSProperty('inert', false);

  // Fragen 3 bis 5, dann der Endstand
  for (let nr = 3; nr <= 5; nr++) {
    await qz.locator('[data-qz-weiter]').click();
    await expect(qz.locator('[data-qz-kopf]')).toContainText(`Frage ${nr} von 5`);
    await antworten(mia);
    await antworten(ben);
    await expect(qz.locator('[data-qz-rang]')).toBeVisible();
  }
  await expect(qz.locator('[data-qz-weiter]')).toContainText('Zum Endstand');
  await qz.locator('[data-qz-weiter]').click();
  await expect(qz.locator('#qz-t')).toContainText('Endstand');
  await expect(qz.locator('.qz-p1')).toBeVisible();
  await expect(mia.locator('#qz-t')).toContainText('Endstand');
  await expect(mia.locator('#qz .qz-platz')).toContainText('von 2');
  expect([...await axe(lk, 'Endstand Lehrkraft'), ...await axe(mia, 'Endstand Handy')]).toEqual([]);

  // Die Antworten zählen im Wissenscheck der Schüler und im Dashboard
  await qz.locator('[data-qz-ende]').click();
  await expect(qz).toHaveCount(0);
  for (const s of [mia, ben]) await expect(s.locator('#qz')).toHaveCount(0);
  await lk.locator('#modal [data-raum-btn]').click();
  await expect(lk.locator('#lr-wc')).toContainText('2 von 2 haben Aufgaben bearbeitet');
  await mia.goto(`${SECHSECK}#wissenscheck`);
  await expect(mia.locator('[data-wc-gesamt]')).not.toHaveText(/^0 von/);
  await expect(mia.locator('.wc-a[data-art] [data-wc-fb]:not([hidden])').first()).toBeVisible();
});

test('Klassen-Quiz: ohne Lernraum kein Kasten, Schüler sehen keine Einstellungen', async ({ page }) => {
  await page.goto(`${SECHSECK}#wissenscheck`);
  await expect(page.locator('[data-wc]')).toBeVisible();
  await expect(page.locator('[data-quiz]')).toBeHidden();
});

test('Klassen-Quiz: Rechenaufgabe ohne Zeitlimit, Ergebnis mit Komma, jeder für sich', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.addInitScript(() => { Math.random = () => 0.5; });
  await lk.goto(SECHSECK);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  const mia = await beitreten(browser, code, 'Mia');
  await lk.locator('#lr-wc [data-lr-quiz]').click();
  const kasten = lk.locator('[data-quiz]');
  await kasten.locator('[data-qz-stufe]').selectOption('2');
  await kasten.locator('[data-qz-anzahl]').selectOption('0');
  await kasten.locator('[data-qz-zeit-wahl]').selectOption('0');
  await kasten.locator('[data-qz-start]').click();
  const qz = lk.locator('#qz');
  // Jeder für sich: keine Teamwahl
  await expect(mia.locator('#qz-t')).toHaveText("Gleich geht's los!");
  await expect(qz).not.toContainText('Team');
  // Bis zur ersten Rechenaufgabe vorspulen (die Lehrkraft löst ohne Antworten auf)
  for (let i = 0; i < 15; i++) {
    await qz.locator('[data-qz-weiter]').click();
    await expect(qz.locator('[data-qz-schliessen]')).toBeVisible();
    // Ohne Zeitlimit kein Countdown und kein „mehr Zeit“
    await expect(qz.locator('[data-qz-zeit], [data-qz-mehr]')).toHaveCount(0);
    if (await qz.locator('[data-qz-kopf]', { hasText: 'Rechnen' }).count()) break;
    await qz.locator('[data-qz-schliessen]').click();
    await expect(qz.locator('[data-qz-rang]')).toBeVisible();
  }
  await expect(qz.locator('[data-qz-kopf]')).toContainText('Rechnen');
  const feld = mia.locator('#qz [data-qz-zahl]');
  await expect(mia.locator('#qz [data-qz-abgeben]')).toBeDisabled();
  await feld.fill('abc');
  await expect(mia.locator('#qz [data-qz-abgeben]')).toBeDisabled();
  await feld.fill('1,5');
  await feld.press('Enter');
  await expect(mia.locator('#qz')).toContainText('Deine Antwort: 1,5');
  // Mia war die Einzige: Das Quiz löst von selbst auf
  await expect(qz.locator('[data-qz-rang]')).toBeVisible();
  await expect(qz).toContainText(/\d+ richtig · \d+ falsch · 0 ohne Antwort/);
  await expect(mia.locator('#qz [data-qz-ergebnis]')).toContainText('Richtig ist:');
  await expect(mia.locator('#qz .qz-platz')).toContainText('Platz 1 von 1');
});

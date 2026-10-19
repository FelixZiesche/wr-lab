// Lernstrecke Deliktsfähigkeit: Übersicht mit Lektionsplan und Tafelbild, Lektionen mit vier Stationen,
// Rechts-Navi und Fall-Akte, Mission Simson und der Lernraum (wo steht die Klasse, Wand, Lehrerpanel).
import { test, expect, device, readDoc } from './helpers.mjs';

const DF = '/deliktsfaehigkeit/';
const TITEL = {
  haftung: 'Lektion 1: Wer zahlt, wenn\'s kracht?', stufen: 'Lektion 2: Zu klein zum Zahlen?', strassenverkehr: 'Lektion 3: Achtung, Straßenverkehr!',
  einsicht: 'Lektion 4: Kommt drauf an!', eltern: 'Lektion 5: Und die Eltern?', wissenscheck: 'Wissenscheck'
};
const plan = page => page.locator('#ls-plan');

test('Übersicht: Leitfrage, Lektionsplan, zwei Wege und Tafelbild', async ({ page }) => {
  await page.goto(DF);
  await expect(page).toHaveTitle('Lernstrecke Deliktsfähigkeit');
  await expect(page.locator('.banner h2')).toHaveText('Wer zahlt, wenn\'s kracht?');
  await expect(plan(page).locator('.ls-plan-item')).toHaveCount(7);
  await expect(plan(page)).toContainText('Mission Simson');
  await expect(page.locator('.ls-wege')).toContainText('Mit der Klasse im Lernraum');
  await expect(page.locator('.ls-tafel-teile li.leer')).toHaveCount(5);
  // „Lernraum beitreten“ öffnet den Lernraum-Dialog
  await page.locator('[data-ls-raum]').click();
  await expect(page.locator('#lr-nick')).toBeVisible();
});

test('Alle Lektionen und der Wissenscheck öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${DF}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
  await page.goto('about:blank');
  await page.goto(`${DF}#mission`);
  await expect(page.locator('[data-chat="simson-chat"]')).toBeVisible();
  await expect(page.locator('#view-title')).toHaveText('Mission Simson');
});

test('Lektion: vier Stationen nacheinander, Fortschritt im Plan, Tafelbild füllt sich, weiter zur nächsten Lektion', async ({ page }) => {
  await page.goto(DF);
  await page.locator('.ls-start .fab').click();
  await expect(page.locator('#modal-title')).toHaveText(TITEL.haftung);
  const station = i => page.locator(`[data-ls-station="${i}"]`);
  await expect(station(0)).toBeVisible();
  await expect(station(1)).toBeHidden();
  await expect(page.locator('.ls-schritt[aria-current="step"]')).toContainText('Der Fall');
  await expect(station(0).locator('.ls-sozial')).toHaveText(/Mit der Klasse/);
  // Vermutung aufschreiben (ohne Lernraum bleibt sie im Browser)
  await station(0).locator('[data-schreib="simson-vermutung"] textarea').fill('Ich glaube, meine Eltern müssen zahlen.');
  await station(0).locator('[data-ls-zu="1"]').click();
  await expect(station(1)).toBeVisible();
  await expect(page.locator('#ls-haftung-1')).toBeFocused();
  // Direkt zur Station „Sichern“ springen und die Erkenntnis sichern
  await page.locator('.ls-schritt[data-ls-zu="2"]').click();
  await expect(station(2).locator('[data-erk="haftung"]')).toBeVisible();
  await station(2).locator('[data-erk-btn]').click();
  await expect(station(2).locator('[data-erk-body]')).toContainText('§ 823 Abs. 1 BGB');
  await station(2).locator('[data-ls-zu="3"]').click();
  await expect(station(3)).toContainText('Frisbee im Ilmpark');
  // Hinter dem Fenster: Lektion 1 gesichert, das Tafelbild zeigt ihren Teil
  await expect(plan(page).locator('.ls-plan-item').first()).toHaveClass(/erledigt/);
  await expect(page.locator('.ls-tafel-teile li').first()).toContainText('Haftung (§ 823 Abs. 1 BGB)');
  // Weiter zu Lektion 2
  await station(3).locator('[data-gehzu="stufen"]').click();
  await expect(page.locator('#modal-title')).toHaveText(TITEL.stufen);
  // Lektion 1 öffnet wieder an der zuletzt besuchten Station
  await page.goto('about:blank'); await page.goto(`${DF}#haftung`);
  await expect(station(3)).toBeVisible();
  // Lektion 5: Blick zurück auf die eigene Vermutung
  await page.goto('about:blank'); await page.goto(`${DF}#eltern`);
  await page.locator('.ls-schritt[data-ls-zu="3"]').click();
  await expect(page.locator('.ls-rueckblick blockquote')).toHaveText('Ich glaube, meine Eltern müssen zahlen.');
});

test.describe('Mission Simson', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('Chat-Abenteuer: Entscheidungen mit Rechts-Check, Enden werden gesammelt und gemerkt', async ({ page }) => {
    await page.goto(`${DF}#mission`);
    const chat = page.locator('[data-chat="simson-chat"]'), verlauf = chat.locator('[data-chat-verlauf]');
    const waehle = async t => { await chat.locator('[data-chat-wahl] button', { hasText: t }).click(); };
    await expect(verlauf).toContainText('Wo bleibst du??');
    await expect(chat.locator('[data-chat-n]')).toHaveText('0 von 4 entdeckt');
    await expect(chat.locator('[data-chat-wahl] button').first()).toBeFocused();
    // Bester Weg: anhalten, Ausrede „Ich bin 15“ (Rechts-Check), Daten, Versicherung, gültiges Kennzeichen
    await waehle('Anhalten');
    await waehle('Ich bin 15');
    await expect(verlauf.locator('.chat-recht').last()).toContainText('§ 828 Abs. 3 BGB');
    await expect(verlauf.locator('.chat-zeile.ich').last()).toContainText('Ich bin 15. Ich muss gar nichts zahlen.');
    await waehle('Jonas antworten');
    await waehle('Papa die Familienhaftpflicht');
    await expect(verlauf.locator('.chat-recht').last()).toContainText('Privathaftpflicht zahlt keine Schäden');
    await waehle('das schwarze für 2026/27');
    await expect(verlauf.locator('.chat-ende')).toContainText('Schaden sauber geregelt');
    await expect(verlauf.locator('.chat-ende')).toBeFocused();
    await expect(chat.locator('[data-chat-n]')).toHaveText('1 von 4 entdeckt');
    // Neues Spiel: abhauen
    await chat.locator('[data-chat-nochmal]').click();
    await expect(verlauf.locator('.chat-ende')).toHaveCount(0);
    await waehle('Gas geben');
    await waehle('Mama anrufen');
    await expect(verlauf.locator('.chat-recht')).toContainText('§ 142 StGB');
    await expect(chat.locator('[data-chat-enden] li.bad')).toContainText('Abgehauen');
    // Nach dem Neuladen bleiben die gefundenen Enden
    await page.reload();
    await expect(page.locator('[data-chat="simson-chat"] [data-chat-n]')).toHaveText('2 von 4 entdeckt');
  });
});

test('Altersschieber: Stufen mit Sonderregel im Straßenverkehr, Altersrätsel', async ({ page }) => {
  await page.goto(`${DF}#stufen`);
  await page.locator('.ls-schritt[data-ls-zu="1"]').click();
  const r = page.locator('#da-r');
  await r.fill('5');
  await expect(page.locator('#da-stufe')).toHaveText('Deliktsunfähig');
  await r.fill('8');
  await expect(page.locator('#da-stufe')).toHaveText('Beschränkt deliktsfähig – mit Schutz im Straßenverkehr');
  await expect(page.locator('#da-box')).toHaveClass(/df-stufe-blau/);
  await r.fill('16');
  await expect(page.locator('#da-p')).toHaveText('§ 828 Abs. 3 BGB');
  await r.fill('7');
  await page.locator('#da-pruefen').click();
  await expect(page.locator('#da-fb')).toContainText('Richtig!');
});

test('Fall-Akte: Marie mit dem Rechts-Navi lösen', async ({ page }) => {
  await page.goto(`${DF}#einsicht`);
  await page.locator('.ls-schritt[data-ls-zu="3"]').click();
  const akte = page.locator('[data-akte="akte"]');
  await akte.locator('[data-fall="4"]').click();
  await expect(akte).toContainText('Die hilfsbereite Marie');
  const antwort = t => akte.locator('[data-route] button', { hasText: t }).last();
  await antwort('Ja').click();                         // Schaden
  await antwort('Ja').click();                         // verursacht
  await antwort('7 bis 9 Jahre').click();
  await antwort('Nein (kein solcher Unfall').click();
  // Falsche Abzweigung: Tipp statt Weiterfahrt
  await antwort('Nein, dafür war sie noch nicht weit genug').click();
  await expect(akte.locator('.fb.amb')).toContainText('Weiß eine Achtjährige');
  await antwort('Ja, sie hatte die nötige Einsicht').click();
  await akte.locator('[data-route] button', { hasText: /^Nein$/ }).last().click();
  await antwort('Nein, sie war so vorsichtig').click();
  await expect(akte.locator('.navi-ergebnis')).toContainText('Haftet nicht');
});

test('Lernraum: Klasse in eine Lektion holen, Lektionsplan zeigt den Stand, Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(DF);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  expect((await readDoc(`rooms/${code}`)).fields.topic.stringValue).toBe('deliktsfaehigkeit');

  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.goto(`${DF}#raum=${code}`);
  await s.locator('#lr-nick').fill('Kalle');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kalle`);
  await s.locator('#modal-close').click();

  // Alle in Lektion 3 holen: Das Handy öffnet sie, der Lektionsplan zeigt „Hier ist eure Klasse“
  await lk.locator('#lr-ziel').selectOption('strassenverkehr');
  await lk.locator('#lr-holen').click();
  await expect(s.locator('#modal-title')).toHaveText(TITEL.strassenverkehr);
  await lk.locator('#modal-close').click();
  await expect(plan(lk).locator('.ls-plan-item', { hasText: 'Achtung, Straßenverkehr!' })).toContainText('1 Gerät hier');
  await s.locator('#modal-close').click();
  await expect(plan(s).locator('.ls-plan-item', { hasText: 'Achtung, Straßenverkehr!' })).toContainText('Hier ist eure Klasse');
  await expect(plan(lk).locator('.ls-klasse')).toHaveCount(0);

  // Antwort an die Wand aus Lektion 1, Lehrerpanel nur bei der Lehrkraft
  await s.locator('#ls-plan [data-tool="haftung"]').click();
  const feld = s.locator('[data-schreib="simson-vermutung"]');
  await feld.locator('textarea').fill('Ich glaube, die Versicherung zahlt.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  await lk.locator('#ls-plan [data-tool="haftung"]').click();
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Stundenvorschlag');
  const wand = lk.locator('[data-schreib="simson-vermutung"]');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toContainText('Ich glaube, die Versicherung zahlt.');

  expect(s.errors).toEqual([]);
  await s.context().close();
});

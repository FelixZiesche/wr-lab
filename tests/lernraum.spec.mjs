// Lernraum: ein Raum für die ganze Lernwerkstatt (Werkstätten und Planspiel).
import { test, expect, device, readDoc, SECHSECK } from './helpers.mjs';

async function raumOeffnen(lk) {
  await lk.goto(SECHSECK);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  return (await lk.locator('.lr-code').textContent()).trim();
}
async function beitreten(browser, code, nick, viewport) {
  const s = await device(browser, viewport ? { viewport } : {});
  await s.goto(`${SECHSECK}#raum=${code}`);
  await expect(s.locator('#lr-code')).toHaveValue(code);
  await s.locator('#lr-nick').fill(nick);
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
  await s.locator('#modal-close').click();
  return s;
}
// Lernraum-Knopf: in der Kopfleiste oder, wenn eine Werkstatt offen ist, in deren Kopfzeile
const knopf = page => page.locator('[data-raum-btn]:visible').last();
const werkstatt = async (page, bereich, id) => {
  await page.locator(`${page.viewportSize().width < 600 ? '#nav-bar' : '#rail-items'} [data-dest="${bereich}"]`).click();
  await page.locator(`#view [data-tool="${id}"]`).click();
};

test('Lernraum: beitreten, Ort sehen, Antwort an die Wand, Lehrerpanel nur für die Lehrkraft, Beamer-Modus', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  const code = await raumOeffnen(lk);
  await expect(lk.locator('.lr-qr svg')).toBeVisible();

  const s = await beitreten(browser, code, 'Testi', { width: 390, height: 844 });
  await expect(s.locator('#btn-raum .lr-dot')).toBeVisible();
  await expect(lk.locator('#lr-teil')).toContainText('Testi');
  await expect(lk.locator('#lr-teil')).toContainText('1 Person im Raum');

  // Wo ist das Gerät gerade?
  await werkstatt(s, 'ziele', 'preis');
  await expect(lk.locator('#lr-teil tr', { hasText: 'Testi' })).toContainText('Warenkorb-Werkstatt');

  // Antwort abschicken
  const feld = s.locator('[data-schreib="preis-wand"]');
  await expect(feld.locator('[data-schreib-senden]')).toBeVisible();
  await feld.locator('textarea').fill('Bei 0 % droht Deflation, dann warten alle mit dem Kaufen.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('An der Wand');
  await expect(lk.locator('#lr-antw tr', { hasText: 'Die EZB strebt' })).toContainText('1');

  // Schüler sehen weder Lehrerpanel noch Erwartungshorizont
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  await expect(s.getByText('Sicherheitsabstand zur Deflation')).toHaveCount(0);

  // Lehrkraft öffnet die Wand der Werkstatt
  await lk.locator('[data-lr-wand="preis"]').first().click();
  await expect(lk.locator('#modal-title')).toHaveText('Warenkorb-Werkstatt');
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await expect(panel).toBeVisible();
  await panel.locator('summary').click();
  await expect(panel).toContainText('Sicherheitsabstand zur Deflation');
  await expect(panel).toContainText('Vorab Hausaufgabe');
  const wand = lk.locator('[data-schreib="preis-wand"] [data-wand]');
  await expect(wand.locator('[data-wand-n]')).toHaveText('1');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toContainText('Bei 0 % droht Deflation');
  await expect(wand.locator('.wand-karte')).toContainText('Testi');

  // Beamer-Modus: keine Spitznamen an der Wand, kein Lehrerpanel
  await knopf(lk).click();
  await lk.locator('#lr-beamer').click();
  await expect(lk.locator('#lr-teil')).toContainText('Gerät 1');
  await lk.locator('[data-lr-wand="preis"]').first().click();
  await expect(lk.locator('.lehrerpanel')).toHaveCount(0);
  // Die Wand bleibt offen, wie die Lehrkraft sie verlassen hat
  await expect(lk.locator('[data-schreib="preis-wand"] [data-wand-zeigen]')).toHaveAttribute('aria-pressed', 'true');
  await expect(lk.locator('.wand-karte')).toContainText('Bei 0 % droht Deflation');
  await expect(lk.locator('.wand-karte')).not.toContainText('Testi');

  // Antwort ändern und erneut abschicken überschreibt die alte
  await feld.locator('textarea').fill('Mit 2 % bleibt Abstand zur Deflation.');
  await expect(feld.locator('[data-schreib-status]')).toContainText('Geändert');
  await feld.locator('[data-schreib-senden]').click();
  await expect(lk.locator('.wand-karte')).toHaveCount(1);
  await expect(lk.locator('.wand-karte')).toContainText('Mit 2 % bleibt Abstand');

  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Lernraum: anhalten, alle holen, Werkstätten sperren, drucken, beenden', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.addInitScript(() => { window.print = () => { window.__gedruckt = (window.__gedruckt || 0) + 1; }; });
  const code = await raumOeffnen(lk);
  const s = await beitreten(browser, code, 'Kalle');

  // Alle anhalten
  await lk.locator('#lr-anhalten').click();
  await expect(s.locator('#lr-pause')).toBeVisible();
  await expect(s.locator('#lr-pause')).toContainText('Schau nach vorn');
  await lk.locator('#lr-anhalten').click();
  await expect(s.locator('#lr-pause')).toBeHidden();

  // Alle in eine Werkstatt holen
  await lk.locator('#lr-ziel').selectOption('phillips');
  await lk.locator('#lr-holen').click();
  await expect(s.locator('#modal-title')).toHaveText('Phillips-Kurven-Labor');
  await expect(lk.locator('#lr-teil tr', { hasText: 'Kalle' })).toContainText('Phillips-Kurven-Labor');
  await s.locator('#modal-close').click();

  // Werkstätten sperren: Politik-Simulator und Planspiel
  await lk.locator('#lr-frei summary').click();
  await lk.locator('[data-frei="politik"]').click();
  await lk.locator('[data-frei="leben"]').click();
  await expect(lk.locator('[data-frei="politik"]')).toHaveAttribute('aria-pressed', 'false');
  await s.locator('#rail-items [data-dest="abwaegen"]').click();
  const karte = s.locator('#view [data-tool="politik"]');
  await expect(karte).toHaveClass(/gesperrt/);
  await expect(karte).toContainText('Noch gesperrt');
  await karte.click({ force: true }); // aria-disabled: Playwright klickt sonst nicht
  await expect(s.locator('#modal')).toBeHidden();
  await expect(s.locator('#snackbar')).toContainText('noch nicht freigegeben');
  await s.locator('#rail-items [data-dest="spiel"]').click();
  await expect(s.locator('#view')).toContainText('Noch gesperrt');
  await lk.locator('#lr-alle-frei').click();
  await expect(s.locator('#view .mode-card')).toHaveCount(3);
  await s.locator('#rail-items [data-dest="abwaegen"]').click();
  await expect(s.locator('#view [data-tool="politik"]')).not.toHaveClass(/gesperrt/);

  // Antwort schicken und drucken
  await s.locator('#view [data-tool="politik"]').click();
  await s.locator('[data-schreib="politik-wand"] textarea').fill('Jede Maßnahme hat Nebenwirkungen.');
  await s.locator('[data-schreib="politik-wand"] [data-schreib-senden]').click();
  await expect(s.locator('[data-schreib="politik-wand"] [data-schreib-status]')).toContainText('An der Wand');
  await expect(lk.locator('#lr-antw tr', { hasText: 'Warum schafft es kein Maßnahmenpaket' })).toContainText('1');
  await lk.locator('#lr-druck').click();
  await expect(lk.locator('#druck')).toContainText('Jede Maßnahme hat Nebenwirkungen.');
  await expect(lk.locator('#druck')).toContainText('Kalle');
  expect(await lk.evaluate(() => window.__gedruckt)).toBe(1);

  // Beenden löscht alles
  const uid = await s.evaluate(async () => (await import('/shared/js/lernraum.js')).raum.live().uid);
  expect(await readDoc(`rooms/${code}/antworten/${uid}_politik-wand`)).not.toBeNull();
  await lk.locator('#lr-ende').click();
  await lk.locator('#lr-ende-y').click();
  await expect(s.locator('#snackbar')).toContainText('Der Lernraum wurde beendet.');
  await expect(s.locator('#btn-raum .lr-dot')).toBeHidden();
  await expect.poll(() => readDoc(`rooms/${code}`)).toBeNull();
  expect(await readDoc(`rooms/${code}/antworten/${uid}_politik-wand`)).toBeNull();
  await expect(lk.locator('#lr-open')).toBeVisible();

  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Lernraum und Planspiel nutzen denselben Raum', async ({ page: lk, browser }) => {
  const code = await raumOeffnen(lk);
  await lk.locator('#modal-close').click();
  await lk.locator('#rail-items [data-dest="spiel"]').click();
  await lk.locator('.mode-card[data-m="lk"]').click();
  await expect(lk.locator('.panel .code').first()).toHaveText(code);

  const s = await beitreten(browser, code, 'Mia-Fan');
  await s.locator('#rail-items [data-dest="spiel"]').click();
  await s.locator('.mode-card[data-m="schueler"]').click();
  // Kein zweiter Beitritt nötig: direkt zur Figurenwahl
  await s.locator('[data-f="mia"]').click();
  await expect(s.locator('.hud')).toContainText(`Live in Raum ${code} als Mia-Fan`);
  await expect(lk.getByText('1 Person im Raum')).toBeVisible();

  // Planspiel-Beamer-Modus und Lernraum-Beamer-Modus sind dasselbe
  await lk.locator('#anon').click();
  await knopf(lk).click();
  await expect(lk.locator('#lr-beamer')).toHaveAttribute('aria-pressed', 'true');

  expect(s.errors).toEqual([]);
  await s.context().close();
});

// Planspiel Sechseck-Leben: Einzelspiel, Klassenspiel mit Stimmkarten und Live-Klassenraum.
import { test, expect, device, readDoc, SECHSECK } from './helpers.mjs';

// Beschlüsse, Antworten im Fachbegriff-Check und private Entscheidungen für eine ganze Partie.
// Bei der Abschlussfrage (Runde 4) wählen wir den ETF-Sparplan, damit kein Zufall im Spiel ist.
const PARTIE = [
  { dec: 'A', check: 1, choice: 1 },
  { dec: 'B', check: 0, choice: 1 },
  { dec: 'C', check: 0, choice: 0 },
  { dec: 'A', check: 1, choice: 1 }
];
// Erwartete Abschlussbilanz für Mia bei dieser Partie (berechnet mit dem Stand vor dem Umbau).
const MIA_ENDE = 'Mia startete mit 1.200 € und hat jetzt 9.004 €. Die Politik der vier Jahre hat Mia insgesamt +1.104 € gebracht.';
const MIA_KONTO = '9.004 €';

/** Spielt eine Runde auf dem Gerät eines Spielers bis zur nächsten Runde (oder Bilanz). */
async function spieleRunde(page, r, { dec, check, choice }, { live = false, warten } = {}) {
  await expect(page.locator('.hud')).toContainText(`${r + 1}/4`);
  await page.locator('#go').click(); // Zur Abstimmung
  await page.locator(`[data-o="${dec}"]`).click();
  if (live) {
    await expect(page.locator('.stimmkarte')).toContainText(dec);
    await expect(page.getByText('Deine Stimme ist beim Beamer angekommen.')).toBeVisible();
    if (warten) await warten();
    await page.locator('#go').click(); // Beschluss abwarten
  }
  await expect(page.locator('h3', { hasText: 'Beschluss:' })).toBeVisible();
  await page.locator('#go').click(); // Fachbegriff-Check
  await page.locator(`.choice [data-k="${check}"]`).click();
  await expect(page.locator('.fb').filter({ hasText: /Richtig!|Nicht ganz\./ })).toBeVisible();
  await page.locator('#go').click(); // private Entscheidung
  await page.locator(`[data-c="${choice}"]`).click();
  await page.locator('#go').click(); // nächste Runde oder Bilanz
}

test('Einzelspiel: ganze Partie, Spielstand bleibt nach dem Neuladen', async ({ page }) => {
  await page.goto(`${SECHSECK}#spiel`);
  await expect(page.locator('.mode-card')).toHaveCount(3);
  await page.locator('.mode-card[data-m="solo"]').click();
  await expect(page.locator('[data-f]')).toHaveCount(8);
  await page.locator('[data-f="mia"]').click();
  await expect(page.locator('.hud')).toContainText('Mia, 17');

  // Fotos mit Infopunkten
  await page.locator('.photo .hotspot').first().click();
  await expect(page.locator('[data-hsi]')).toBeVisible();

  for (const [r, zug] of PARTIE.entries()) await spieleRunde(page, r, zug);

  await expect(page.getByText('Abschlussbilanz 2029')).toBeVisible();
  await expect(page.locator('p', { hasText: 'startete mit' })).toHaveText(new RegExp(MIA_ENDE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.*'));
  await expect(page.locator('.chart svg')).toBeVisible();

  await page.reload();
  await expect(page.locator('.mode-card[data-m="solo"]')).toContainText('Spielstand vorhanden: Mia');
  await page.locator('.mode-card[data-m="solo"]').click();
  await expect(page.getByText('Abschlussbilanz 2029')).toBeVisible();

  await page.locator('#again').click();
  await expect(page.locator('.hud')).toContainText('1/4');
});

test.describe('Klassenspiel ohne Live-Verbindung (Stimmkarten)', () => {
  test.use({ ohneLive: true });

  test('Lehrkraft zählt Stimmen, Schüler tippen den Beschluss ein', async ({ page, browser }) => {
    await page.goto(`${SECHSECK}#spiel`);
    await page.locator('.mode-card[data-m="lk"]').click();
    await expect(page.getByText('Live-Modus nicht eingerichtet.')).toBeVisible();
    await page.locator('#go').click(); // Runde 1 starten
    await expect(page.locator('.photo')).toBeVisible();
    await page.locator('#go').click(); // Abstimmung starten
    await page.locator('[data-up="B"]').click();
    await page.locator('[data-up="B"]').click();
    await page.locator('[data-up="A"]').click();
    await page.locator('[data-win="B"]').click();
    await expect(page.locator('h3', { hasText: 'Der Bundestag beschließt: Klimageld auszahlen' })).toBeVisible();
    await expect(page.locator('.fb .code')).toHaveText('B');

    const schueler = await device(browser, { offline: true });
    await schueler.goto(`${SECHSECK}#spiel`);
    await schueler.locator('.mode-card[data-m="schueler"]').click();
    await schueler.locator('[data-f="sabine"]').click();
    await expect(schueler.locator('.hud')).toContainText('Ohne Live-Verbindung');
    await schueler.locator('#go').click();
    await schueler.locator('[data-o="B"]').click();
    await expect(schueler.getByText('Halte die Karte hoch')).toBeVisible();
    await schueler.locator('#go').click();
    await schueler.locator('[data-d="B"]').click();
    await expect(schueler.locator('h3', { hasText: 'Beschluss: Klimageld auszahlen' })).toBeVisible();
    expect(schueler.errors).toEqual([]);
    await schueler.context().close();
  });
});

test('Live-Klassenraum: Beitreten, Abstimmen, Dashboard, Beamer-Modus, Entfernen, Raum beenden', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(`${SECHSECK}#spiel`);
  await lk.locator('.mode-card[data-m="lk"]').click();
  await lk.locator('#mkroom').click();
  const codeEl = lk.locator('.panel .code').first();
  await expect(codeEl).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await codeEl.textContent()).trim();
  await expect(lk.locator('.panel [style*="background:#fff"] svg')).toBeVisible(); // QR-Code
  expect(await lk.locator('.panel [style*="background:#fff"] svg rect, .panel [style*="background:#fff"] svg path').count()).toBeGreaterThan(0);

  // Schüler 1 kommt über den QR-Link, Schüler 2 tippt den Code ein.
  const s1 = await device(browser, { viewport: { width: 390, height: 844 } });
  await s1.goto(`${SECHSECK}#join=${code}`);
  await expect(s1.locator('#jc')).toHaveValue(code);
  await s1.locator('#jn').fill('Testi');
  await s1.locator('#jgo').click();
  await s1.locator('[data-f="mia"]').click();
  await expect(s1.locator('.hud')).toContainText(`Live in Raum ${code} als Testi`);

  const s2 = await device(browser);
  await s2.goto(`${SECHSECK}#spiel`);
  await s2.locator('.mode-card[data-m="schueler"]').click();
  await s2.locator('#jc').fill(code.toLowerCase());
  await s2.locator('#jn').fill('Kalle');
  await s2.locator('#jgo').click();
  await s2.locator('[data-f="jonas"]').click();
  await expect(s2.locator('.hud')).toContainText(`Live in Raum ${code} als Kalle`);

  // Lobby: beide sichtbar, Beamer-Modus blendet Spitznamen aus
  await expect(lk.getByText('2 Personen im Raum')).toBeVisible();
  const dash = lk.locator('section.panel', { hasText: 'Live-Dashboard' });
  await expect(dash).toContainText('Testi');
  await expect(dash).toContainText('Kalle');
  await lk.locator('#anon').click();
  await expect(dash).toContainText('Mia 1');
  await expect(dash).toContainText('Jonas 1');
  await expect(dash).not.toContainText('Testi');
  await lk.locator('#anon').click();
  await expect(dash).toContainText('Testi');

  // Runde 1
  await lk.locator('#go').click(); // Runde 1 starten
  await expect(dash).toContainText('Ereignis gelesen und weiter zur Abstimmung: 0 von 2');
  await s1.locator('#go').click();
  await s2.locator('#go').click();
  await expect(dash).toContainText('Ereignis gelesen und weiter zur Abstimmung: 2 von 2');
  await lk.locator('#go').click(); // Abstimmung starten
  await s1.locator('[data-o="A"]').click();
  await s2.locator('[data-o="A"]').click();
  await expect(dash).toContainText('Abgestimmt: 2 von 2');
  await expect(lk.locator('[data-win="A"]')).toBeVisible();
  await s2.locator('#go').click(); // Kalle wartet auf den Beschluss
  await expect(s2.getByText('Warte auf den Beschluss …')).toBeVisible();
  await lk.locator('[data-win="A"]').click();
  await expect(lk.locator('h3', { hasText: 'Der Bundestag beschließt: Energiepreisbremse' })).toBeVisible();
  // Kalle springt automatisch zum Ergebnis, Testi nach dem Weitertippen
  await expect(s2.locator('h3', { hasText: 'Beschluss: Energiepreisbremse' })).toBeVisible();
  await s1.locator('#go').click();
  await expect(s1.locator('h3', { hasText: 'Beschluss: Energiepreisbremse' })).toBeVisible();

  // Fachbegriff-Check: Testi richtig, Kalle falsch
  await s1.locator('#go').click();
  await s1.locator('.choice [data-k="1"]').click();
  await expect(s1.getByText('Richtig!')).toBeVisible();
  await s2.locator('#go').click();
  await s2.locator('.choice [data-k="0"]').click();
  await expect(s2.getByText('Nicht ganz.')).toBeVisible();
  await expect(dash).toContainText('50 % richtig (1 von 2 Antworten)');
  await s1.locator('#go').click();
  await s1.locator('[data-c="0"]').click();
  await expect(dash.locator('.stack', { hasText: 'Private Entscheidung' })).toContainText('Day One kaufen');

  // Runde 2: Kalle wird entfernt
  await lk.locator('#go').click(); // Nächste Runde
  await lk.getByRole('button', { name: 'Kalle entfernen' }).click();
  await expect(s2.getByText('Deine Lehrkraft hat dich aus dem Raum entfernt.')).toBeVisible();
  await expect(lk.getByText('1 Person im Raum')).toBeVisible();

  // Neu laden: Raum bleibt erhalten
  await lk.reload();
  await lk.locator('.mode-card[data-m="lk"]').click();
  await expect(lk.locator('.hud')).toContainText(code);
  await expect(lk.locator('.hud')).toContainText('1 live verbunden');

  // Raum beenden löscht alles
  expect(await readDoc(`rooms/${code}`)).not.toBeNull();
  await lk.locator('#close').click();
  await lk.locator('#close-y').click();
  await expect(s1.getByText('Der Klassenraum wurde beendet oder ist abgelaufen.')).toBeVisible();
  await expect.poll(() => readDoc(`rooms/${code}`)).toBeNull();
  await expect(lk.locator('.hud')).toContainText('Klassencode');
  await expect(lk.locator('.hud')).not.toContainText(code);

  expect(s1.errors).toEqual([]);
  expect(s2.errors).toEqual([]);
  await s1.context().close();
  await s2.context().close();
});

test('Live-Klassenraum: ganze Partie, Bilanz im Dashboard stimmt mit dem Handy überein', async ({ page: lk, browser }) => {
  test.setTimeout(180_000);
  await lk.goto(`${SECHSECK}#spiel`);
  await lk.locator('.mode-card[data-m="lk"]').click();
  await lk.locator('#mkroom').click();
  await expect(lk.locator('.panel .code').first()).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.panel .code').first().textContent()).trim();

  const s = await device(browser);
  await s.goto(`${SECHSECK}#join=${code}`);
  await s.locator('#jn').fill('Mia-Fan');
  await s.locator('#jgo').click();
  await s.locator('[data-f="mia"]').click();
  await expect(lk.getByText('1 Person im Raum')).toBeVisible();

  await lk.locator('#go').click(); // Runde 1 starten
  for (const [r, zug] of PARTIE.entries()) {
    await lk.locator('#go').click(); // Abstimmung starten
    await spieleRunde(s, r, zug, {
      live: true,
      warten: async () => {
        await lk.locator(`[data-win="${zug.dec}"]`).click();
        await expect(lk.locator('h3', { hasText: 'Der Bundestag beschließt' })).toBeVisible();
      }
    });
    await lk.locator('#go').click(); // Nächste Runde oder Abschlussbilanz
  }

  await expect(s.getByText('Abschlussbilanz 2029')).toBeVisible();
  await expect(s.locator('p', { hasText: 'startete mit' })).toContainText(MIA_ENDE);
  await expect(lk.getByText('Abschlussbilanz der Klasse')).toBeVisible();
  const zeile = lk.locator('section.panel', { hasText: 'Live-Dashboard' }).locator('tr', { hasText: 'Mia-Fan' });
  await expect(zeile).toContainText(MIA_KONTO);
  await expect(zeile).toContainText('2/4');

  expect(s.errors).toEqual([]);
  await s.context().close();
});

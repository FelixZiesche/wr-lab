// Aufgaben-Bausteine ohne Lernraum: Lückentext, Zuordnen, Test, Schreibfeld (Werkstatt „Hefteintrag und Kurztest“).
import { test, expect, SECHSECK } from './helpers.mjs';

test.use({ ohneLive: true });

test('Lückentext: prüfen, Fehler markieren, Lösungen zeigen', async ({ page }) => {
  await page.goto(`${SECHSECK}#sichern`);
  await expect(page.locator('#modal-title')).toHaveText('Hefteintrag und Kurztest');
  const box = page.locator('[data-luecken="sichern-heft"]');
  const felder = box.locator('.lt-luecke');
  await expect(felder).toHaveCount(13);
  const antworten = ['StabG', '1967', 'Preisniveau', 'beschäftigungsstand', 'Gleichgewicht', 'Wachstum', 'Verteilung', 'Umwelt', 'gleichzeitig', 'Zielharmonie', 'Zielkonflikt', 'VPI', 'Gini'];
  for (const [i, a] of antworten.entries()) await felder.nth(i).fill(a);
  await felder.nth(1).fill('1968');
  await box.locator('[data-pruefen]').click();
  await expect(box.locator('[data-ergebnis]')).toHaveText('12 von 13 richtig');
  await expect(felder.nth(1)).toHaveClass(/wrong/);
  await box.locator('[data-zeigen]').click();
  await expect(felder.nth(1)).toHaveValue('1967');
  await box.locator('[data-pruefen]').click();
  await expect(box.locator('[data-ergebnis]')).toHaveText('13 von 13 richtig');
});

test('Zuordnen: antippen, ziehen, prüfen', async ({ page }) => {
  await page.goto(`${SECHSECK}#sichern`);
  const box = page.locator('[data-zuordnen="sichern-schlagzeilen"]');
  const loesung = ['P', 'B', 'U', 'W', 'V', 'A', 'P', 'B', 'A', 'U', 'W', 'V'];
  // Antippen: Karte wählen, dann Fach
  await box.locator('.zu-karte[data-k="0"]').click();
  await expect(box.locator('.zu-karte[data-k="0"]')).toHaveAttribute('aria-pressed', 'true');
  await box.locator('.zu-ziel[data-ziel="B"]').click();
  await expect(box.locator('.zu-fach[data-fach="B"] .zu-karte[data-k="0"]')).toBeVisible();
  await box.locator('[data-pruefen]').click();
  await expect(box.locator('[data-ergebnis]')).toHaveText('0 von 12 richtig – 11 noch nicht zugeordnet');
  await expect(box.locator('.zu-karte[data-k="0"]')).toHaveClass(/wrong/);
  // Ziehen
  await box.locator('.zu-karte[data-k="1"]').dragTo(box.locator('.zu-fach[data-fach="B"]'));
  await expect(box.locator('.zu-fach[data-fach="B"] .zu-karte[data-k="1"]')).toBeVisible();
  // Rest antippen
  for (const [i, f] of loesung.entries()) {
    await box.locator(`.zu-karte[data-k="${i}"]`).click();
    await box.locator(`.zu-ziel[data-ziel="${f}"]`).click();
  }
  await box.locator('[data-pruefen]').click();
  await expect(box.locator('[data-ergebnis]')).toHaveText('12 von 12 richtig – stark!');
  // Bleibt nach dem Neuladen erhalten
  await page.reload();
  await expect(page.locator('[data-zuordnen="sichern-schlagzeilen"] .zu-fach[data-fach="P"] .zu-karte')).toHaveCount(2);
});

test('Test: ein Versuch, Auswertung, noch einmal', async ({ page }) => {
  await page.goto(`${SECHSECK}#sichern`);
  const box = page.locator('[data-test="sichern-test"]');
  const pruefen = box.locator('[data-pruefen]');
  await expect(pruefen).toBeDisabled();
  for (const [i, j] of [1, 0, 0, 1].entries()) await box.locator(`input[name="t-sichern-test-${i}"][value="${j}"]`).check();
  await pruefen.click();
  await expect(box.locator('[data-ergebnis]')).toHaveText('3 von 4 richtig');
  await expect(box.locator('input[type=radio]').first()).toBeDisabled();
  await expect(box.locator('.test-opt.wrong')).toHaveCount(1);
  await expect(box.locator('.test-erkl').nth(2)).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-test="sichern-test"] [data-ergebnis]')).toHaveText('3 von 4 richtig');
  await page.locator('[data-test="sichern-test"] [data-neu]').click();
  await expect(page.locator('[data-test="sichern-test"] input[type=radio]').first()).toBeEnabled();
});

test('Schreibfeld ohne Lernraum: ins Heft, Entwurf bleibt gespeichert, keine Lösungen sichtbar', async ({ page }) => {
  await page.goto(`${SECHSECK}#sichern`);
  const feld = page.locator('[data-schreib="sichern-wand"]');
  await expect(feld.locator('[data-schreib-senden]')).toBeHidden();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Ab ins Heft');
  await feld.locator('summary', { hasText: 'So kannst du anfangen' }).click();
  await expect(feld).toContainText('Am wichtigsten ist mir');
  await feld.locator('textarea').fill('Mir ist Umweltschutz am wichtigsten.');
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('[data-schreib="sichern-wand"] textarea')).toHaveValue('Mir ist Umweltschutz am wichtigsten.');
  await expect(page.locator('.lehrerpanel')).toHaveCount(0);
  await expect(page.getByText('Persönliche Gewichtung mit Bezug')).toHaveCount(0);
});

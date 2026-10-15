// Lernraum: ein Raum für die ganze Lernwerkstatt (Werkstätten und Planspiel).
import { test, expect, device, readDoc, writeDoc, SECHSECK } from './helpers.mjs';

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

  // Wo ist das Gerät gerade? Das Dashboard aktualisiert sich, der Fokus der Lehrkraft bleibt auf ihrem Knopf
  await lk.locator('[data-lr-kick]').first().focus();
  await werkstatt(s, 'ziele', 'preis');
  await expect(lk.locator('#lr-teil tr', { hasText: 'Testi' })).toContainText('Warenkorb-Werkstatt');
  await expect(lk.locator('[data-lr-kick]').first()).toBeFocused();

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

test('Mein Wissen: „Alle anzeigen“ nur für die Lehrkraft im Lernraum, auch im Beamer-Modus, ohne zu speichern', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  const alle = page => page.locator('#ws-all');
  // Ohne Lernraum: kein Knopf, alle Merksätze noch gesperrt
  await lk.goto(SECHSECK);
  await lk.locator('#btn-wissen').click();
  await expect(lk.locator('#ws .ms-item').first()).toBeVisible();
  await expect(alle(lk)).toBeHidden();
  const n = await lk.locator('#ws .ms-item').count();
  await expect(lk.locator('#ws .ms-item.locked')).toHaveCount(n);

  // Lehrkraft mit offenem Lernraum: Knopf ohne Klammerzusatz, deckt alles auf, speichert aber nichts
  const code = await raumOeffnen(lk);
  await lk.locator('#modal-close').click();
  await lk.locator('#btn-wissen').click();
  await expect(alle(lk)).toBeVisible();
  await expect(alle(lk)).toHaveText('Alle anzeigen');
  await alle(lk).click();
  await expect(alle(lk)).toHaveAttribute('aria-pressed', 'true');
  await expect(lk.locator('#ws .ms-item.locked')).toHaveCount(0);
  await expect(lk.locator('#ms-count')).toHaveText(`0/${n}`);
  expect(await lk.evaluate(() => JSON.parse(localStorage.getItem('ms6-wissen') || '[]'))).toEqual([]);
  // Wieder geöffnet: nur die entdeckten Merksätze
  await lk.locator('#modal-close').click();
  await lk.locator('#btn-wissen').click();
  await expect(lk.locator('#ws .ms-item.locked')).toHaveCount(n);

  // Beamer-Modus: Der Knopf bleibt, denn dort zeigt die Lehrkraft der Klasse alle Merksätze
  await lk.locator('#modal-close').click();
  await knopf(lk).click();
  await lk.locator('#lr-beamer').click();
  await expect(lk.locator('#lr-beamer')).toHaveAttribute('aria-pressed', 'true');
  await lk.locator('#modal-close').click();
  await lk.locator('#btn-wissen').click();
  await expect(alle(lk)).toBeVisible();

  // Schüler im selben Raum sehen den Knopf nicht
  const s = await beitreten(browser, code, 'Lotte');
  await s.locator('#btn-wissen').click();
  await expect(s.locator('#ws .ms-item').first()).toBeVisible();
  await expect(alle(s)).toHaveCount(1);
  await expect(alle(s)).toBeHidden();
  await expect(s.locator('#ws .ms-item.locked')).toHaveCount(n);

  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Lernraum: anhalten, alle holen, Werkstätten sperren, drucken, beenden', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.addInitScript(() => { window.print = () => { window.__gedruckt = (window.__gedruckt || 0) + 1; }; });
  const code = await raumOeffnen(lk);
  const s = await beitreten(browser, code, 'Kalle');

  // Alle anhalten: alles hinter der Pause ist gesperrt, Esc hebt sie nicht auf, danach geht es an derselben Stelle weiter
  await s.locator('#btn-glossar').focus();
  await lk.locator('#lr-anhalten').click();
  await expect(s.locator('#lr-pause')).toBeVisible();
  await expect(s.locator('#lr-pause')).toContainText('Schau nach vorn');
  await expect(s.locator('#lr-pause')).toBeFocused();
  await expect(s.locator('.app')).toHaveJSProperty('inert', true);
  await s.keyboard.press('Escape');
  await expect(s.locator('#lr-pause')).toBeVisible();
  await lk.locator('#lr-anhalten').click();
  await expect(s.locator('#lr-pause')).toBeHidden();
  await expect(s.locator('.app')).toHaveJSProperty('inert', false);
  await expect(s.locator('#btn-glossar')).toBeFocused();

  // Alle in eine Werkstatt holen
  await lk.locator('#lr-ziel').selectOption('phillips');
  await lk.locator('#lr-holen').click();
  await expect(s.locator('#modal-title')).toHaveText('Phillips-Kurven-Labor');
  await expect(lk.locator('#lr-teil tr', { hasText: 'Kalle' })).toContainText('Phillips-Kurven-Labor');
  await s.locator('#modal-close').click();

  // Werkstätten sperren: Politik-Simulator und Planspiel
  await lk.locator('#lr-frei summary').click();
  await lk.locator('[data-frei="politik"]').click();
  await expect(lk.locator('[data-frei="politik"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(lk.locator('[data-frei="politik"]')).toBeFocused();
  await lk.locator('[data-frei="leben"]').click();
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

test('Beitreten: Der Fokus steht im Feld, Fehler werden angesagt und am Feld markiert', async ({ page }) => {
  await page.goto(`${SECHSECK}#raum=K7Q2XM`);
  await expect(page.locator('#lr-nick')).toBeFocused();
  await page.locator('#lr-code').fill('AB');
  await page.locator('#lr-nick').fill('Testi');
  await page.locator('#lr-jgo').click();
  const fehler = page.locator('#lr-jerr');
  await expect(fehler).toHaveText('Der Code hat sechs Zeichen, zum Beispiel K7Q2XM.');
  await expect(fehler).toHaveAttribute('role', 'alert');
  const feld = page.locator('#lr-code');
  await expect(feld).toHaveAttribute('aria-invalid', 'true');
  await expect(feld).toHaveAttribute('aria-describedby', 'lr-jerr');
  await expect(page.locator('#lr-nick')).not.toHaveAttribute('aria-invalid', 'true');
  // Wer das Feld korrigiert, bekommt es wieder als gültig angezeigt
  await feld.fill('K7Q2XM');
  expect(await feld.getAttribute('aria-invalid')).toBeNull();
});

// Firebase-Bibliothek von gstatic.com (wie in helpers.mjs) und der Firestore-Emulator: zum Simulieren von Verbindungsproblemen
const SDK = /^https:\/\/www\.gstatic\.com\/firebasejs\//;
const DB = 'http://127.0.0.1:8080/**';
const uidVon = page => page.evaluate(async () => (await import('/shared/js/lernraum.js')).raum.live().uid);
const antwortSchicken = async (s, bereich, tool, text) => {
  await werkstatt(s, bereich, tool);
  const feld = s.locator(`[data-schreib="${tool}-wand"]`);
  await feld.locator('textarea').fill(text);
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('An der Wand');
  await s.locator('#modal-close').click();
};

test('Wand: einzelne Antworten mit Rückfrage löschen (auch im Beamer-Modus), beim Entfernen Antworten auf Wunsch mitlöschen', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  const code = await raumOeffnen(lk);
  const troll = await beitreten(browser, code, 'Troll');
  const lotte = await beitreten(browser, code, 'Lotte');
  await antwortSchicken(troll, 'ziele', 'preis', 'Unpassender Text über eine Mitschülerin');
  await antwortSchicken(lotte, 'ziele', 'preis', 'Bei 0 % droht Deflation.');
  const [uidT, uidL] = [await uidVon(troll), await uidVon(lotte)];
  await expect(lk.locator('#lr-antw tr', { hasText: 'Die EZB strebt' })).toContainText('2');

  // Beamer-Modus: Löschknopf ohne Spitznamen
  await lk.locator('#lr-beamer').click();
  await lk.locator('[data-lr-wand="preis"]').first().click();
  const wand = lk.locator('[data-schreib="preis-wand"] [data-wand]');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toHaveCount(2);
  const karte = wand.locator('.wand-karte', { hasText: 'Unpassender Text' });
  await expect(karte.locator('[data-wand-weg]')).toHaveAttribute('aria-label', 'Antwort löschen');
  await expect(karte).not.toContainText('Troll');
  // Rückfrage: Abbrechen führt zurück zum Knopf
  await karte.locator('[data-wand-weg]').click();
  await expect(karte.getByRole('group', { name: 'Diese Antwort von der Wand löschen?' })).toBeVisible();
  await expect(karte.locator('[data-wand-ja]')).toBeFocused();
  await karte.locator('[data-wand-nein]').click();
  await expect(karte.locator('[data-wand-ja]')).toHaveCount(0);
  await expect(karte.locator('[data-wand-weg]')).toBeFocused();
  // Löschen: nur diese Antwort, der Fokus springt zur nächsten Karte
  await karte.locator('[data-wand-weg]').click();
  await karte.locator('[data-wand-ja]').click();
  await expect(wand.locator('.wand-karte')).toHaveCount(1);
  await expect(wand.locator('.wand-karte')).toContainText('Bei 0 % droht Deflation.');
  await expect(wand.locator('[data-wand-weg]')).toBeFocused();
  await expect.poll(() => readDoc(`rooms/${code}/antworten/${uidT}_preis-wand`)).toBeNull();
  expect(await readDoc(`rooms/${code}/antworten/${uidL}_preis-wand`)).not.toBeNull();

  // Entfernen: Rückfrage, Antworten nur auf Wunsch mitlöschen
  await knopf(lk).click();
  await lk.locator('#lr-beamer').click();
  const zeile = name => lk.locator('#lr-teil tr', { hasText: name });
  await zeile('Troll').locator('[data-lr-kick]').click();
  await expect(lk.locator('#lr-kick-q')).toContainText('Troll aus dem Lernraum entfernen?');
  await expect(lk.locator('#lr-kick-antw')).toHaveCount(0); // keine Antworten mehr an der Wand
  await expect(lk.locator('#lr-kick-y')).toBeFocused();
  await lk.locator('#lr-kick-n').click();
  await expect(lk.locator('#lr-kick-q')).toHaveCount(0);
  await expect(zeile('Troll').locator('[data-lr-kick]')).toBeFocused();
  await zeile('Troll').locator('[data-lr-kick]').click();
  await lk.locator('#lr-kick-y').click();
  await expect(troll.locator('#snackbar')).toContainText('aus dem Lernraum entfernt');
  await expect(zeile('Troll')).toHaveCount(0);

  await zeile('Lotte').locator('[data-lr-kick]').click();
  await expect(lk.locator('#lr-kick-q')).toContainText('Auch die Antwort von Lotte an der Wand löschen');
  await expect(lk.locator('#lr-kick-antw')).not.toBeChecked();
  await lk.locator('#lr-kick-antw').check();
  await lk.locator('#lr-kick-y').click();
  await expect(lotte.locator('#snackbar')).toContainText('aus dem Lernraum entfernt');
  await expect.poll(() => readDoc(`rooms/${code}/antworten/${uidL}_preis-wand`)).toBeNull();
  await expect(lk.locator('#lr-teil')).toContainText('Noch niemand im Raum.');

  for (const s of [troll, lotte]) { expect(s.errors).toEqual([]); await s.context().close(); }
});

test('Raum verlassen löscht den eigenen Eintrag und die eigenen Antworten', async ({ page: lk, browser }) => {
  test.setTimeout(90_000);
  const code = await raumOeffnen(lk);
  const s = await beitreten(browser, code, 'Kalle');
  await antwortSchicken(s, 'ziele', 'preis', 'Mit 2 % bleibt Abstand zur Deflation.');
  const uid = await uidVon(s);
  expect(await readDoc(`rooms/${code}/antworten/${uid}_preis-wand`)).not.toBeNull();
  await knopf(s).click();
  await s.locator('#lr-leave').click();
  await expect(s.locator('#lr-leave-q')).toContainText('Dein Eintrag und deine Antworten an der Wand werden gelöscht.');
  await s.locator('#lr-leave-y').click();
  await expect(s.locator('#lr-join')).toBeVisible();
  await expect.poll(() => readDoc(`rooms/${code}/antworten/${uid}_preis-wand`)).toBeNull();
  await expect.poll(() => readDoc(`rooms/${code}/players/${uid}`)).toBeNull();
  await expect(lk.locator('#lr-teil')).toContainText('Noch niemand im Raum.');
  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Datenschutz und Beitrittsweg: ehrlicher Hinweis, ein neuer Raum beendet den alten Raum dieses Geräts', async ({ page: lk }) => {
  await lk.goto(SECHSECK);
  await lk.locator('#btn-raum').click();
  const hinweis = lk.locator('#lr-datenschutz');
  for (const t of ['Spitzname', 'geöffnete Werkstatt', 'Antworten, die du abschickst', 'Stimmen', 'Punkte im Wissenscheck (keine Texte)', 'Figur und dein Spielstand', '„Raum beenden“ löscht alles sofort'])
    await expect(hinweis).toContainText(t);
  await expect(hinweis).not.toContainText('24 Stunden');
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const alt = (await lk.locator('.lr-code').textContent()).trim();
  await expect(lk.locator('#lr-weg')).toContainText('→ Thema „Magisches Sechseck“ → oben das Symbol Lernraum → Code eingeben. Oder QR-Code scannen.');
  expect(await lk.evaluate(() => JSON.parse(localStorage.getItem('ms6-eigener-raum')))).toBe(alt);

  // Die Sitzung geht verloren (z. B. Browserdaten teilweise gelöscht), der Raum ist noch offen
  await lk.evaluate(() => localStorage.removeItem('ms6-raum'));
  await lk.reload();
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const neu = (await lk.locator('.lr-code').textContent()).trim();
  expect(neu).not.toBe(alt);
  await expect.poll(() => readDoc(`rooms/${alt}`)).toBeNull();
  expect(await readDoc(`rooms/${neu}`)).not.toBeNull();
  expect(await lk.evaluate(() => JSON.parse(localStorage.getItem('ms6-eigener-raum')))).toBe(neu);
  // Raum beenden: danach merkt sich das Gerät keinen Raum mehr
  await lk.locator('#lr-ende').click();
  await lk.locator('#lr-ende-y').click();
  await expect(lk.locator('#lr-open')).toBeVisible();
  expect(await lk.evaluate(() => localStorage.getItem('ms6-eigener-raum'))).toBe('null');
});

test('Gesperrte Werkstatt per Link oder Neuladen: zurück mit Hinweis, beim Sperren offene Werkstätten bleiben offen', async ({ page: lk, browser }) => {
  test.setTimeout(90_000);
  const code = await raumOeffnen(lk);
  await lk.locator('#lr-frei summary').click();
  await lk.locator('[data-frei="politik"]').click();
  await expect(lk.locator('[data-frei="politik"]')).toHaveAttribute('aria-pressed', 'false');
  const s = await beitreten(browser, code, 'Kalle');
  await s.goto(`${SECHSECK}#politik`);
  await s.reload();
  await expect(s.locator('#snackbar')).toContainText('Deine Lehrkraft hat diese Werkstatt noch nicht freigegeben.');
  await expect(s.locator('#snackbar')).toHaveAttribute('role', 'status');
  await expect(s.locator('#modal')).toBeHidden();
  const karte = s.locator('#view [data-tool="politik"]');
  await expect(karte).toContainText('Noch gesperrt');
  await expect(karte).toBeFocused();

  // Offen beim Sperren: bleibt offen
  await werkstatt(s, 'ziele', 'preis');
  await lk.locator('[data-frei="preis"]').click();
  await expect(s.locator('#view [data-tool="preis"]')).toHaveClass(/gesperrt/);
  await expect(s.locator('#modal-title')).toHaveText('Warenkorb-Werkstatt');
  await expect(s.locator('#modal')).toBeVisible();
  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Verbindungsproblem beim Neuladen: Lehrkraft und Schüler behalten ihre Sitzung und verbinden sich neu', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  const code = await raumOeffnen(lk);
  const s = await beitreten(browser, code, 'Kalle');

  // Lehrkraft: Firestore nicht erreichbar → „Erneut verbinden“
  const offline = r => r.abort();
  await lk.context().route(DB, offline);
  await lk.reload();
  await expect(lk.locator('#snackbar')).toContainText('Keine Verbindung zum Lernraum.');
  await knopf(lk).click();
  await expect(lk.locator('#lr-netz')).toContainText('Keine Verbindung zum Lernraum.');
  await expect(lk.locator('#lr-netz')).toHaveAttribute('role', 'alert');
  await expect(lk.locator('#lr-dialog')).toContainText(`Dein Lernraum ${code} (Lehrkraft) bleibt auf diesem Gerät gespeichert.`);
  expect(await lk.evaluate(() => JSON.parse(localStorage.getItem('ms6-raum')).code)).toBe(code);
  await expect(knopf(lk)).toHaveAttribute('aria-label', `Lernraum ${code} (Lehrkraft) – keine Verbindung`);
  await lk.context().unroute(DB, offline);
  await lk.locator('#lr-neu').click();
  await expect(lk.locator('.lr-code')).toHaveText(code);
  await expect(lk.locator('#lr-teil')).toContainText('Kalle');

  // Schüler: Bibliothek lädt nicht → ehrlich „Seite neu laden“, die Sitzung bleibt
  const sperren = r => r.abort();
  await s.context().route(SDK, sperren);
  await s.reload();
  await knopf(s).click();
  await expect(s.locator('#lr-netz')).toContainText('Keine Verbindung zum Lernraum. Prüfe das WLAN und lade die Seite neu.');
  await expect(s.locator('#lr-dialog')).toContainText(`Dein Lernraum ${code} (du bist Kalle)`);
  await expect(s.locator('#lr-neu')).toHaveCount(0);
  await s.context().unroute(SDK, sperren);
  await Promise.all([s.waitForEvent('load'), s.locator('#lr-dialog [data-neu-laden]').click()]);
  await knopf(s).click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kalle`);
  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Keine Verbindung beim Beitreten: ehrliche Meldung, neuer Versuch möglich, „nicht eingerichtet“ nur ohne Konfiguration', async ({ page: lk, browser }) => {
  test.setTimeout(90_000);
  const code = await raumOeffnen(lk);

  // Kurzer Aussetzer: Der erste Versuch scheitert, der zweite klappt (kein Neuladen nötig)
  const s = await device(browser);
  let einmal = true;
  await s.route('**/__/firebase/init.json', r => { if (einmal) { einmal = false; return r.abort(); } return r.continue(); });
  await s.goto(`${SECHSECK}#raum=${code}`);
  await s.locator('#lr-nick').fill('Kalle');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-jerr')).toHaveText('Keine Verbindung zum Lernraum. Prüfe das WLAN und versuch es noch einmal.');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kalle`);

  // Bibliothek gesperrt (z. B. Schulfilter): ehrlich „Seite neu laden“, der Code bleibt dabei erhalten
  const o = await device(browser, { offline: true });
  await o.goto(`${SECHSECK}#raum=${code}`);
  await o.locator('#lr-nick').fill('Lotte');
  for (let i = 0; i < 2; i++) {
    await o.locator('#lr-jgo').click();
    await expect(o.locator('#lr-jerr')).toContainText('Keine Verbindung zum Lernraum. Prüfe das WLAN und lade die Seite neu.');
    await expect(o.locator('#lr-jerr')).not.toContainText('nicht eingerichtet');
  }
  await Promise.all([o.waitForEvent('load'), o.locator('#lr-jerr [data-neu-laden]').click()]);
  await expect(o.locator('#lr-code')).toHaveValue(code);

  // Ohne Firebase-Konfiguration: nicht eingerichtet
  const k = await device(browser);
  await k.route('**/__/firebase/init.json', r => r.fulfill({ status: 404, body: '' }));
  await k.goto(`${SECHSECK}#raum=${code}`);
  await k.locator('#lr-nick').fill('Mia');
  await k.locator('#lr-jgo').click();
  await expect(k.locator('#lr-jerr')).toHaveText('Der Live-Modus ist nicht eingerichtet.');
  await k.locator('#lr-open').click();
  await expect(k.locator('#lr-oerr')).toContainText('Der Live-Modus ist nicht eingerichtet.');

  for (const p of [s, o, k]) { expect(p.errors).toEqual([]); await p.context().close(); }
});

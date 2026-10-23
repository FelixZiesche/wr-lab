// Lernwerkstatt Zahlungsmethoden: Navigation, alle Werkstätten, Kassen-Rush, Fake-Detektor, Krypto-Achterbahn,
// die Klassenbank allein (Prüfziffer, Empfängerprüfung, Echtzeit, Dauerauftrag, Lastschrift) und im Lernraum
// (zwei Schüler überweisen sich Geld, Bank-Monitor der Lehrkraft, Wand, Lehrerpanel).
import { test, expect, device } from './helpers.mjs';

const ZM = '/zahlungsmethoden/';
const TITEL = {
  bauchgefuehl: 'Stimmt das?', kassenrush: 'Kassen-Rush', klassenbank: 'Dein Konto bei Z-Invest', fake: 'Fake-Detektor',
  krypto: 'Die Krypto-Achterbahn', paylater: 'Jetzt kaufen, später zahlen', sichern: 'Hefteintrag und Bauchgefühl-Check', wissenscheck: 'Wissenscheck'
};
const regler = (loc, v) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(v));

test('Startseite: Leitfrage, verblüffende Zahl, Bereiche in der Navigation', async ({ page }) => {
  await page.goto(ZM);
  await expect(page).toHaveTitle('Lernwerkstatt Zahlungsmethoden');
  await expect(page.locator('.banner h2')).toContainText('Wie bezahlst du clever und sicher?');
  await expect(page.locator('.banner .credit')).toContainText('CC BY 3.0');
  await expect(page.locator('.zm-zahl')).toContainText('55 %');
  await expect(page.locator('.dest-cards .dest')).toHaveCount(4);
  for (const [bereich, karte] of [['alltag', 'kassenrush'], ['banking', 'klassenbank'], ['neu', 'paylater'], ['wissen', 'wissenscheck']]) {
    await page.locator(`#rail-items [data-dest="${bereich}"]`).click();
    await expect(page.locator(`#view [data-tool="${karte}"]`)).toBeVisible();
  }
});

test('Alle Werkstätten öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${ZM}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
  await expect(page.locator('[data-wc]')).toBeVisible();
});

test('Kassen-Rush: sechs Kassen mit Rückmeldung und Auswertung', async ({ page }) => {
  await page.goto(`${ZM}#kassenrush`);
  const kr = page.locator('#kr');
  await expect(kr.locator('#kr-n')).toContainText('Kasse 1 von 6');
  // Weihnachtsmarkt: ohne Kartengerät gewinnt Bargeld
  await kr.locator('[data-kr="bar"]').click();
  await expect(kr.locator('#kr-fb .fb.ok')).toContainText('Top-Wahl');
  await kr.locator('#kr-weiter').click();
  await kr.locator('[data-kr="karte"]').click();
  await expect(kr.locator('#kr-fb .fb.bad')).toContainText('Kein Kartengerät');
  await expect(kr.locator('[data-kr="bar"]')).toHaveClass(/ok/);
  for (let i = 2; i < 6; i++) { await kr.locator('#kr-weiter').click(); await kr.locator('[data-kr]').first().click(); }
  await kr.locator('#kr-weiter').click();
  await expect(kr.locator('.fb')).toContainText('von 12 Punkten');
  await expect(kr.locator('.zm-bilanz li')).toHaveCount(6);
  await page.reload();
  await expect(page.locator('#kr .zm-bilanz li')).toHaveCount(6);
});

test('Fake-Detektor: Warnsignale leuchten erst nach der Entscheidung auf', async ({ page }) => {
  await page.goto(`${ZM}#fake`);
  const fd = page.locator('#fd');
  await expect(fd.locator('mark.zm-warn')).toHaveCount(0);
  await fd.locator('[data-fd="1"]').click();
  await expect(fd.locator('#fd-fb .fb.ok')).toContainText('Das ist Betrug');
  await expect(fd.locator('mark.zm-warn').first()).toContainText('vorübergehend gesperrt');
  for (let i = 1; i < 8; i++) { await fd.locator('#fd-weiter').click(); await fd.locator('[data-fd="1"]').click(); }
  await fd.locator('#fd-weiter').click();
  await expect(fd.locator('.fb')).toContainText('5 von 8 richtig erkannt');
});

test('Krypto-Achterbahn: Zeitpunkt wählen, bezahlen, Key aufbewahren', async ({ page }) => {
  await page.goto(`${ZM}#krypto`);
  await expect(page.locator('#kb-chart .zm-zukunft')).toHaveCount(1);
  await regler(page.locator('#kb-t'), 0);
  await expect(page.locator('#kb-info')).toContainText('14:00 Uhr');
  await page.locator('#kb-zahlen').click();
  await expect(page.locator('#kb-fb .fb.bad')).toContainText('mehr als gedacht');
  await expect(page.locator('#kb-fb')).toContainText('33,27 €');
  await expect(page.locator('#kb-chart .zm-zukunft')).toHaveCount(0);
  await expect(page.locator('#kb-t')).toBeDisabled();
  await page.locator('[data-key="usb"]').click();
  await expect(page.locator('#kb-keyfb .fb.ok')).toContainText('Am sichersten');
  await page.locator('#kb-neu').click();
  await expect(page.locator('#kb-t')).toBeEnabled();
});

test('Konto allein: Aufträge mit den Vorlagen und sechs Monate Kontosimulation', async ({ page }) => {
  await page.goto(`${ZM}#klassenbank`);
  const b = page.locator('[data-bank="klassenbank"]');
  const saldo = b.locator('[data-bank-saldo]');
  await expect(saldo).toHaveText('250,00 €');
  await expect(b.locator('[data-bank-n]')).toHaveText('0 von 6');
  await expect(b.locator('[data-bank-monitor]')).toBeHidden();
  const weiter = () => b.locator('[data-bank-form] button[type=submit]').click();

  // Pizza teilen: Vorlage Mia, Freigabe, Standardüberweisung
  await b.locator('[data-bank-kontakte=""] [data-bank-k="0"]').click();
  await b.locator('[data-bank-betrag]').fill('6,50');
  await b.locator('[data-bank-zweck]').fill('Pizza');
  await weiter();
  await expect(b.locator('.bank-tan')).toContainText('Mia Krause');
  await b.locator('[data-bank-frei]').click();
  await expect(b.locator('[data-bank-schritt] .fb.ok')).toContainText('Auftrag angenommen');
  await expect(saldo).toHaveText('243,50 €');

  // Zahlendreher: Die Prüfziffer erkennt die falsche IBAN
  const falsch = (await b.locator('[data-bank-auftraege] .mono').textContent()).trim();
  await b.locator('[data-bank-name]').fill('Mia Krause');
  await b.locator('[data-bank-ibanfeld]').fill(falsch);
  await b.locator('[data-bank-betrag]').fill('1');
  await weiter();
  await expect(b.locator('[data-bank-schritt] .fb.bad')).toContainText('Diese IBAN gibt es nicht');

  // Empfängerprüfung: falscher Name, abbrechen
  await b.locator('[data-bank-kontakte=""] [data-bank-k="1"]').click();
  await b.locator('[data-bank-name]').fill('Pizza Saale');
  await b.locator('[data-bank-betrag]').fill('5');
  await weiter();
  await expect(b.locator('.bank-pruef')).toContainText('Empfängerprüfung');
  await b.locator('[data-bank-abbrechen]').click();
  await expect(saldo).toHaveText('243,50 €');

  // Echtzeitüberweisung, zu viel Geld wird abgelehnt
  await b.locator('[data-bank-kontakte=""] [data-bank-k="0"]').click();
  await b.locator('[data-bank-betrag]').fill('1.000');
  await weiter();
  await expect(b.locator('[data-bank-schritt] .fb.bad')).toContainText('nicht genug Geld');
  await b.locator('[data-bank-betrag]').fill('3,50');
  await b.locator('[data-bank-echtzeit]').check();
  await weiter();
  await b.locator('[data-bank-frei]').click();
  await expect(b.locator('[data-bank-schritt] .fb.ok')).toContainText('in Sekunden');
  await expect(saldo).toHaveText('240,00 €');

  // Dauerauftrag an Handyfuchs, dann startet der November mit einer unbekannten Lastschrift
  await b.locator('[data-bank-tab="dauer"]').click();
  await b.locator('[data-bank-kontakte="d"] [data-bank-k="2"]').click();
  await b.locator('[data-bank-dbetrag]').fill('9,99');
  await b.locator('[data-bank-dauerform] button[type=submit]').click();
  await expect(b.locator('[data-bank-dfb]')).toContainText('Eingerichtet');
  const monat = b.locator('[data-bank-monat]');
  await expect(monat).toContainText('November starten');
  await monat.click();
  await expect(b.locator('[data-bank-mname]')).toHaveText('November · Monat 1 von 6');
  await expect(saldo).toHaveText('382,61 €');
  await expect(monat).toBeDisabled();
  const nov = b.locator('[data-bank-ev="1"]');
  await expect(nov).toContainText('Unbekannte Abbuchung');
  await expect(nov.locator('[data-bank-w="1:0"]')).toBeFocused();
  await nov.locator('[data-bank-w="1:0"]').click();
  await expect(nov.locator('.fb.ok')).toContainText('13 Monate');
  await expect(saldo).toHaveText('422,51 €');
  await expect(b.locator('[data-bank-n]')).toHaveText('6 von 6');
  await b.locator('[data-bank-tab="umsaetze"]').click();
  await expect(b.locator('[data-bank-liste]')).toContainText('Rückgabe der Lastschrift');

  // Dezember: Phishing-SMS erkannt, Sicherheit und Überblick steigen
  await monat.click();
  await b.locator('[data-bank-ev="2"] [data-bank-w="2:1"]').click();
  await expect(b.locator('[data-bank-ev="2"] .fb.ok')).toContainText('Phishing');
  await expect(saldo).toHaveText('616,62 €');
  await expect(b.locator('[data-bank-werte]')).toContainText('Sicherheit8 von 10');
  // Bis April durchspielen, dann kommt die Auswertung
  for (let m = 3; m <= 6; m++) { await monat.click(); await b.locator(`[data-bank-w="${m}:0"]`).click(); }
  await expect(monat).toBeHidden();
  await expect(b.locator('[data-bank-werte]')).toContainText('Dein Halbjahr bei Z-Invest');
  const ende = await saldo.textContent();

  // Tastatur: Pfeiltasten wechseln die Tabs
  await b.locator('[data-bank-tab="umsaetze"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(b.locator('[data-bank-tab="dauer"]')).toBeFocused();
  await expect(b.locator('[data-bank-seite="dauer"]')).toBeVisible();

  // Der Kontostand bleibt nach dem Neuladen
  await page.reload();
  await expect(page.locator('[data-bank-saldo]')).toHaveText(ende);
  await expect(page.locator('[data-bank-ev="6"] .fb')).toBeVisible();
});

test('Lernraum: Überweisungen live, Monate für alle, Bank-Monitor, Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(ZM);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  await lk.locator('#modal-close').click();

  const schueler = [];
  for (const nick of ['Kim', 'Luca']) {
    const s = await device(browser, { viewport: { width: 390, height: 844 } });
    await s.goto(`${ZM}#raum=${code}`);
    await s.locator('#lr-nick').fill(nick);
    await s.locator('#lr-jgo').click();
    await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
    await s.locator('#modal-close').click();
    await s.goto(`${ZM}#klassenbank`);
    await expect(s.locator('[data-bank-inhaber]')).toHaveText(nick);
    await expect(s.locator('[data-bank-modus]')).toContainText(`Lernraum ${code}`);
    schueler.push(s);
  }
  const [kim, luca] = schueler;
  const ibanLuca = (await luca.locator('[data-bank-iban]').textContent()).trim();
  expect(ibanLuca).toMatch(/^DE\d{2}( \d{4}){4} \d{2}$/);

  // Kim überweist Luca 6,50 € in Echtzeit, die Empfängerprüfung erkennt den Spitznamen
  await kim.locator('[data-bank-name]').fill('luca');
  await kim.locator('[data-bank-ibanfeld]').fill(ibanLuca);
  await kim.locator('[data-bank-betrag]').fill('6,50');
  await kim.locator('[data-bank-zweck]').fill('Pizza');
  await kim.locator('[data-bank-echtzeit]').check();
  await kim.locator('[data-bank-form] button[type=submit]').click();
  await expect(kim.locator('.bank-tan')).toContainText('Luca');
  await kim.locator('[data-bank-frei]').click();
  await expect(kim.locator('[data-bank-schritt] .fb.ok')).toContainText('Erledigt');
  await expect(kim.locator('[data-bank-saldo]')).toHaveText('243,50 €');
  await expect(luca.locator('[data-bank-saldo]')).toHaveText('256,50 €');
  await luca.locator('[data-bank-tab="umsaetze"]').click();
  await expect(luca.locator('[data-bank-liste]')).toContainText('Kim');

  // Falscher Name: Die Empfängerprüfung warnt
  await kim.locator('[data-bank-name]').fill('Paul');
  await kim.locator('[data-bank-ibanfeld]').fill(ibanLuca);
  await kim.locator('[data-bank-betrag]').fill('2');
  await kim.locator('[data-bank-form] button[type=submit]').click();
  await expect(kim.locator('.bank-pruef')).toContainText('Der Name passt nicht zur IBAN');

  // Lehrkraft: Bank-Monitor statt Konto, Lehrerpanel, Wand
  await lk.goto(`${ZM}#klassenbank`);
  const mon = lk.locator('[data-bank-monitor]');
  await expect(mon).toBeVisible();
  await expect(lk.locator('[data-bank-app]')).toBeHidden();
  await expect(mon).toContainText('1 Überweisung');
  await expect(mon).toContainText('Kim → Luca');
  await expect(kim.locator('.lehrerpanel')).toHaveCount(0);
  await expect(kim.locator('[data-bank-monitor]')).toBeHidden();
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Kontosimulation bei Z-Invest');

  // Die Lehrkraft startet den November für alle, die Klasse reagiert, der Monitor zählt ohne Spitznamen
  await expect(kim.locator('[data-bank-monat]')).toBeVisible();
  await mon.locator('[data-bank-lkmonat="1"]').click();
  await expect(mon).toContainText('November, Monat 1 von 6');
  for (const s of schueler) {
    await expect(s.locator('[data-bank-mname]')).toHaveText('November · Monat 1 von 6');
    await expect(s.locator('[data-bank-monat]')).toBeHidden();
    await expect(s.locator('[data-bank-mhinweis]')).toContainText('startet eure Lehrkraft');
  }
  await kim.locator('[data-bank-w="1:1"]').click();
  await expect(kim.locator('[data-bank-ev="1"] .fb.bad')).toBeVisible();
  await expect(mon.locator('.bank-reak')).toContainText('1 von 2 haben reagiert');
  await expect(mon.locator('.bank-reak')).not.toContainText('Kim');
  await mon.locator('[data-bank-lkmonat="2"]').click();
  await expect(luca.locator('[data-bank-ev="2"]')).toContainText('Dein Konto wird gesperrt');
  // Luca hat im November noch nicht reagiert: Das Ereignis bleibt offen
  await expect(luca.locator('[data-bank-ev="1"] [data-bank-w]')).toHaveCount(3);

  const feld = kim.locator('[data-schreib="zm-bank-wand"]');
  await feld.locator('textarea').fill('Die Empfängerprüfung hat gemerkt, dass der Name nicht passt.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  const wand = lk.locator('[data-schreib="zm-bank-wand"] [data-wand]');
  await expect(wand.locator('[data-wand-n]')).toHaveText('1');

  expect(kim.errors).toEqual([]);
  expect(luca.errors).toEqual([]);
  for (const s of schueler) await s.context().close();
});

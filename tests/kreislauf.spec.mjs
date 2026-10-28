// Lernwerkstatt Der Wirtschaftskreislauf: Navigation, alle Werkstätten, Euro-Reise, den Kreislauf in vier Stufen bauen
// (Pfeile einzeichnen, Geld oder Güter, rechnen, Lücke beim Sparen) und Schockwellen allein und live im Lernraum
// (Lehrkraft löst auf, die Welle läuft auf dem Handy, Lehrerpanel nur bei der Lehrkraft).
import { test, expect, device } from './helpers.mjs';

const WK = '/kreislauf/';
const TITEL = {
  euro: 'Ein Euro auf Reise', einfach: 'Stufe 1: Der einfache Kreislauf', banken: 'Stufe 2: Die Banken', staat: 'Stufe 3: Der Staat',
  ausland: 'Stufe 4: Das Ausland', schockwellen: 'Schockwellen', sichern: 'Tafelbild und Hefteintrag', wissenscheck: 'Wissenscheck'
};
// Richtige Pfeile: Karte, Start, Ziel (und in Stufe 1 die Art)
const PFEILE = {
  1: [['faktor', 'h', 'u', 'gut'], ['y', 'u', 'h', 'geld'], ['gueter', 'u', 'h', 'gut'], ['ch', 'h', 'u', 'geld']],
  2: [['sh', 'h', 'b'], ['in', 'b', 'u']],
  3: [['tdir', 'h', 's'], ['zh', 's', 'h'], ['tind', 'u', 's'], ['zu', 's', 'u'], ['cst', 's', 'u'], ['kr', 'b', 's']],
  4: [['x', 'a', 'u'], ['m', 'u', 'a'], ['xm', 'b', 'a']]
};
async function zeichne(page, [k, von, nach, art]) {
  await page.locator(`[data-wk-k="${k}"]`).click();
  await page.locator(`.wk-sek[data-sek="${von}"]`).click();
  await page.locator(`.wk-sek[data-sek="${nach}"]`).click();
  if (art) await page.locator(`[data-wk-art="${art}"]`).click();
}

test('Startseite: Leitfrage, verblüffende Zahl, Bereiche in der Navigation, Eintrag auf der WR-Lab-Startseite', async ({ page }) => {
  await page.goto(WK);
  await expect(page).toHaveTitle('Lernwerkstatt Der Wirtschaftskreislauf');
  await expect(page.locator('.banner h2')).toContainText('Wohin fließt dein Geld');
  await expect(page.locator('.banner .credit')).toContainText('CC BY-SA 4.0');
  await expect(page.locator('.wk-zahl')).toContainText('10,30 €');
  await expect(page.locator('.dest-cards .dest')).toHaveCount(4);
  for (const [bereich, karte] of [['einstieg', 'euro'], ['bauen', 'ausland'], ['wellen', 'schockwellen'], ['wissen', 'wissenscheck']]) {
    await page.locator(`#rail-items [data-dest="${bereich}"]`).click();
    await expect(page.locator(`#view [data-tool="${karte}"]`)).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator('a[href*="kreislauf"]').first()).toBeVisible();
});

test('Alle Werkstätten öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${WK}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
  await expect(page.locator('[data-wc]')).toBeVisible();
});

test('Ein Euro auf Reise: tippen, auflösen, am Ende Gegenströme und Trefferzahl', async ({ page }) => {
  await page.goto(`${WK}#euro`);
  const r = page.locator('[data-wk-reise]');
  await expect(r.locator('.wk-station.hier')).toHaveAttribute('data-st', '0');
  await r.locator('[data-wk-tipp="1"]').click();
  await expect(r.locator('.fb.amb')).toContainText('Peter kauft bei Mr. Kebab einen Döner');
  await expect(r.locator('[data-wk-tipp="0"]')).toHaveClass(/richtig/);
  await r.locator('[data-wk-weiter]').click();
  for (const t of [1, 2, 0, 1]) { await r.locator(`[data-wk-tipp="${t}"]`).click(); await r.locator('[data-wk-weiter]').click(); }
  await expect(r.locator('.fb.ok')).toContainText('Der Euro ist wieder bei Peter');
  await expect(r.locator('.wk-treffer')).toContainText('4 von 5');
  await expect(r.locator('.wk-gegen')).toHaveCount(4);
  await page.reload();
  await expect(page.locator('.wk-treffer')).toContainText('4 von 5');
});

test('Stufe 1: Pfeile einzeichnen, falsche Richtung erkennen, Geld oder Güter, rechnen, Güterströme ausblenden', async ({ page }) => {
  await page.goto(`${WK}#einfach`);
  const bau = page.locator('[data-wk-bau="1"]');
  await expect(bau.locator('.wk-geist')).toHaveCount(3);
  await expect(bau.locator('[data-wk-schritt]')).toContainText('Wähle eine Karte');
  // Sektoren sind erst nach der Wahl einer Karte Knöpfe
  await expect(bau.locator('.wk-sek[data-sek="h"]')).toHaveAttribute('aria-disabled', 'true');
  await bau.locator('[data-wk-k="ch"]').click();
  await expect(bau.locator('.wk-sek[data-sek="h"]')).toHaveAttribute('tabindex', '0');
  await bau.locator('.wk-sek[data-sek="u"]').click();
  await bau.locator('.wk-sek[data-sek="h"]').click();
  await expect(bau.locator('[data-wk-fb] .fb.amb')).toContainText('falsche Richtung');
  await expect(bau.locator('.wk-pf')).toHaveCount(0);
  // Per Tastatur: Karte, dann Start und Ziel mit Enter
  await bau.locator('[data-wk-k="ch"]').click();
  await bau.locator('.wk-sek[data-sek="h"]').focus();
  await page.keyboard.press('Enter');
  await bau.locator('.wk-sek[data-sek="u"]').focus();
  await page.keyboard.press('Enter');
  await expect(bau.locator('[data-wk-fb] .fb.ok')).toContainText('Richtig eingezeichnet');
  await expect(bau.locator('.wk-pf[data-pf="ch"]')).toHaveClass(/offen/);
  await bau.locator('[data-wk-art="gut"]').click();
  await expect(bau.locator('.wk-hinweis')).toContainText('Euros den Besitzer');
  await bau.locator('[data-wk-art="geld"]').click();
  await expect(bau.locator('.wk-pf[data-pf="ch"]')).toHaveClass(/geld/);
  for (const p of PFEILE[1].slice(0, 3)) await zeichne(page, p);
  await expect(bau.locator('.wk-pf')).toHaveCount(4);
  await expect(bau.locator('[data-wk-ende]')).toContainText('Kreislauf geschlossen');
  // Rechnen mit typischem Fehler, dann richtig
  await bau.locator('.wk-eingabe').fill('0');
  await bau.locator('[data-wk-pruefe="ch"]').click();
  await expect(bau.locator('[data-wk-rfb] .fb')).toContainText('sparen die Haushalte nichts');
  await bau.locator('.wk-eingabe').fill('100');
  await bau.locator('.wk-eingabe').press('Enter');
  await expect(bau.locator('.wk-waage li')).toHaveCount(2);
  await expect(bau.locator('.wk-lab.geld').first()).toContainText('100');
  await bau.locator('[data-wk-gb]').click();
  await expect(bau.locator('.wk-pf')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('[data-wk-bau="1"] .wk-pf')).toHaveCount(2);
  await expect(page.locator('[data-wk-bau="1"] .wk-waage')).toBeVisible();
});

test('Stufe 2 bis 4: Lücke beim Sparen, Banken, Staat und Ausland einbauen, alle Sektoren ausgeglichen', async ({ page }) => {
  await page.goto(`${WK}#banken`);
  const lu = page.locator('[data-wk-luecke]');
  await expect(lu.locator('[data-wk-luecke-fb] .fb.bad')).toContainText('Es fehlen 15 Mrd. €');
  // Frühere Stufen sind schon eingezeichnet, nur Geldströme
  await expect(page.locator('[data-wk-bau="2"] .wk-pf')).toHaveCount(2);
  for (const p of PFEILE[2]) await zeichne(page, p);
  await expect(lu.locator('[data-wk-luecke-fb] .fb.ok')).toContainText('Lücke geschlossen');
  await page.locator('[data-wk-r="sh"] .wk-eingabe').fill('15');
  await page.locator('[data-wk-pruefe="sh"]').click();
  await page.locator('[data-wk-r="in"] .wk-eingabe').fill('15');
  await page.locator('[data-wk-pruefe="in"]').click();
  await expect(page.locator('[data-wk-bau="2"] .wk-waage .ms.ok')).toHaveCount(3);

  await page.goto(`${WK}#staat`);
  await page.locator('[data-wk-k="kr"]').click();
  await page.locator('.wk-sek[data-sek="h"]').click();
  await page.locator('.wk-sek[data-sek="s"]').click();
  await expect(page.locator('[data-wk-fb] .fb.amb')).toContainText('Wer leiht sich hier Geld');
  for (const p of PFEILE[3]) await zeichne(page, p);
  await page.locator('[data-wk-r="kr"] .wk-eingabe').fill('85');
  await page.locator('[data-wk-pruefe="kr"]').click();
  await expect(page.locator('[data-wk-r="kr"] [data-wk-rfb]')).toContainText('alles addiert');
  await page.locator('[data-wk-r="kr"] .wk-eingabe').fill('5');
  await page.locator('[data-wk-pruefe="kr"]').click();
  await page.locator('[data-wk-r="in"] .wk-eingabe').fill('10');
  await page.locator('[data-wk-pruefe="in"]').click();
  await expect(page.locator('[data-wk-bau="3"] .wk-waage .ms.ok')).toHaveCount(4);

  await page.goto(`${WK}#ausland`);
  await expect(page.locator('[data-wk-bau="4"] .wk-geist')).toHaveCount(0);
  for (const p of PFEILE[4]) await zeichne(page, p);
  await page.locator('[data-wk-r="xm"] .wk-eingabe').fill('4');
  await page.locator('[data-wk-pruefe="xm"]').click();
  await page.locator('[data-wk-r="in"] .wk-eingabe').fill('6');
  await page.locator('[data-wk-pruefe="in"]').click();
  await expect(page.locator('[data-wk-bau="4"] .wk-waage .ms.ok')).toHaveCount(5);
  await expect(page.locator('[data-wk-bau="4"] .wk-pf')).toHaveCount(13);
});

test('Schockwellen allein: erst abstimmen, dann läuft die Welle mit Wirkungskette', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${WK}#schockwellen`);
  const w = page.locator('[data-wk-wellen]');
  await expect(w.locator('[data-wk-welle]')).toBeDisabled();
  await w.locator('[data-wk-s="1"]').click();
  await expect(w.locator('[data-wk-s="1"]')).toHaveAttribute('aria-pressed', 'true');
  // Modell mit Banken: Staat und Ausland sind ausgeblendet
  await expect(w.locator('.wk-sek[data-sek="s"]')).toBeHidden();
  await expect(w.locator('.wk-pf')).toHaveCount(4);
  const s = w.locator('[data-wk-schock="1"]');
  await s.locator('label', { hasText: 'Es sinkt' }).click();
  await s.locator('[data-abst-urteil]').click();
  await expect(s.locator('.fb.ok')).toContainText('Sparparadox');
  await expect(w.locator('[data-wk-kette] li')).toHaveCount(4);
  await expect(w.locator('.wk-pf[data-pf="sh"]')).toHaveClass(/plus/);
  await expect(w.locator('.wk-pf[data-pf="y"]')).toHaveClass(/minus/);
  await expect(w.locator('[data-wk-welle]')).toBeEnabled();
  await w.locator('[data-wk-s="5"]').click();
  await expect(w.locator('.wk-sek[data-sek="a"]')).toBeVisible();
  await expect(w.locator('[data-wk-kette] li')).toHaveCount(0);
});

test('Tafelbild: alle 13 Geldströme mit Werten', async ({ page }) => {
  await page.goto(`${WK}#sichern`);
  await expect(page.locator('[data-wk-tafel] .wk-pf')).toHaveCount(13);
  await expect(page.locator('[data-wk-tafel] .wk-lab', { hasText: 'X − M' })).toContainText('4');
  await expect(page.locator('.wk-legende li')).toHaveCount(13);
});

test('Schockwellen im Lernraum: Lehrkraft startet und löst auf, die Welle läuft auf dem Handy; Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(WK);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  await lk.locator('#modal-close').click();

  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.emulateMedia({ reducedMotion: 'reduce' });
  await s.goto(`${WK}#raum=${code}`);
  await s.locator('#lr-nick').fill('Kim');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kim`);
  await s.locator('#modal-close').click();
  await s.goto(`${WK}#schockwellen`);
  await expect(s.locator('[data-wk-wellen] [data-wk-welle]')).toBeDisabled();

  await lk.goto(`${WK}#schockwellen`);
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Live mit der Klasse');
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  // Die Lehrkraft kann jede Welle sofort zeigen
  await expect(lk.locator('[data-wk-welle]')).toBeEnabled();

  await lk.locator('[data-wk-s="5"]').click();
  const abst = lk.locator('[data-abst="wk-schock-zoelle"]');
  await abst.locator('[data-abst-start]').click();
  const fenster = s.locator('#lr-umfrage');
  await expect(fenster).toContainText('Ihr seid die Wirtschaftsforscher · Zölle in den USA');
  await fenster.locator('[data-u-w="0"]').click();
  await expect(abst.locator('[data-abst-n]')).toContainText('1 von 1');
  await abst.locator('[data-abst-auf]').click();
  await expect(fenster.locator('[data-u-urteil]')).toContainText('Richtig!');
  // Die Welle läuft auf dem Handy und bei der Lehrkraft
  await expect(s.locator('[data-wk-s="5"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(s.locator('[data-wk-kette] li')).toHaveCount(4);
  await expect(s.locator('.wk-pf[data-pf="x"]')).toHaveClass(/minus/);
  await expect(lk.locator('[data-wk-kette] li')).toHaveCount(4, { timeout: 15_000 });

  await s.locator('[data-u-zu]').click();
  const feld = s.locator('[data-schreib="wk-wellen-wand"]');
  await feld.locator('textarea').fill('Zuerst sinken die Exporte, dadurch gibt es Kurzarbeit und weniger Lohn.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  await expect(lk.locator('[data-schreib="wk-wellen-wand"] [data-wand-n]')).toHaveText('1');
  expect(s.errors).toEqual([]);
  await s.context().close();
});

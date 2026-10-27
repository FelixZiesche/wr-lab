// Lernwerkstatt Haushaltsplan und Schulden: Navigation, alle Werkstätten, Lohnzettel, Schätzregler, Dispo-Rechner,
// Gläubiger-Tipp und das Haushaltsspiel „Benjamins Monat“ allein (Abrechnung, Verträge, Kündigen, Auswertung)
// und im Lernraum (Lehrkraft startet die Monate, Klassenspiegel ohne Spitznamen, Wand, Lehrerpanel).
import { test, expect, device } from './helpers.mjs';

const HH = '/haushalt/';
const TITEL = {
  schaetzduell: 'Das Schätzduell', geldquellen: 'Woher kommt das Geld?', geldfluss: 'Wohin fließt das Geld?', benjamin: 'Benjamins Monat',
  schuldenfalle: 'Die Schuldenfalle', auswege: 'Raus aus den Schulden', sichern: 'Hefteintrag und Schätz-Check', wissenscheck: 'Wissenscheck'
};
const regler = (loc, v) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(v));
// Spielt einen Monat: Option i bei jeder Entscheidung (Kassensturz: nichts kündigen), Reaktion e auf das Ereignis
async function monat(g, i, e) {
  await g.locator('[data-hh-start]').click();
  while (true) {
    if (await g.locator('[data-hh-kuend]').count()) { await g.locator('[data-hh-kuend]').click(); await g.locator('[data-hh-weiter]').click(); continue; }
    if (!(await g.locator('[data-hh-o]').count())) break;
    await g.locator(`[data-hh-o="${i}"]`).click();
  }
  await g.locator(`[data-hh-w="${e}"]`).click();
  await g.locator('[data-hh-abrechnen]').click();
}

test('Startseite: Leitfrage, verblüffende Zahl, Bereiche in der Navigation, Eintrag auf der WR-Lab-Startseite', async ({ page }) => {
  await page.goto(HH);
  await expect(page).toHaveTitle('Lernwerkstatt Haushaltsplan und Schulden');
  await expect(page.locator('.banner h2')).toContainText('Wie kommst du mit deinem Geld über den Monat?');
  await expect(page.locator('.banner .credit')).toContainText('CC0');
  await expect(page.locator('.hh-zahl')).toContainText('5,67 Mio.');
  await expect(page.locator('.dest-cards .dest')).toHaveCount(4);
  for (const [bereich, karte] of [['geld', 'geldfluss'], ['monat', 'benjamin'], ['schulden', 'auswege'], ['wissen', 'wissenscheck']]) {
    await page.locator(`#rail-items [data-dest="${bereich}"]`).click();
    await expect(page.locator(`#view [data-tool="${karte}"]`)).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator('a[href*="haushalt"]').first()).toBeVisible();
});

test('Alle Werkstätten öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${HH}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
  await expect(page.locator('[data-wc]')).toBeVisible();
});

test('Lohnzettel und Schätzregler: erst schätzen, dann aufdecken', async ({ page }) => {
  await page.goto(`${HH}#geldquellen`);
  await regler(page.locator('#lz-t'), 900);
  await expect(page.locator('#lz-t-o')).toHaveText('900 €');
  await page.locator('#lz-auf').click();
  await expect(page.locator('#lz-erg .fb')).toContainText('72 € zu hoch');
  await expect(page.locator('#lz-erg table')).toContainText('827,92 €');
  await expect(page.locator('#lz-t')).toBeDisabled();
  await page.reload();
  await expect(page.locator('#lz-erg table')).toContainText('Rentenversicherung');

  await page.goto(`${HH}#geldfluss`);
  await expect(page.locator('.hh-vergleich:visible')).toHaveCount(0);
  await regler(page.locator('#gf-wohnen'), 36);
  await page.locator('#gf-auf').click();
  await expect(page.locator('.hh-vergleich:visible')).toHaveCount(5);
  await expect(page.locator('[data-gf="wohnen"] .hh-vergleich')).toContainText('Treffer');
  await expect(page.locator('#gf-fb .fb')).toBeFocused();
});

test('Schuldenfalle: Dispo-Rechner in Döner und Gläubiger antippen', async ({ page }) => {
  await page.goto(`${HH}#schuldenfalle`);
  await regler(page.locator('#dr-minus'), 600);
  await regler(page.locator('#dr-monate'), 12);
  await expect(page.locator('#dr-erg .big-num')).toHaveText('66,00 €');
  await expect(page.locator('#dr-erg')).toContainText('8 Döner');
  for (const id of ['handy', 'staat', 'bank', 'online']) await page.locator(`[data-gl="${id}"]`).click();
  await expect(page.locator('#gl-fb .fb')).toContainText('2 von 4 an der richtigen Stelle');
  await expect(page.locator('#gl-fb .hh-glist li').first()).toContainText('57 %');
});

test('Benjamins Monat allein: Abrechnung, Verträge mit Laufzeit, Kündigen und Auswertung', async ({ page }) => {
  await page.goto(`${HH}#benjamin`);
  const g = page.locator('[data-hh]');
  await expect(g.locator('[data-hh-monitor]')).toBeHidden();
  await expect(g.locator('.hh-ein')).toContainText('1.086,92 €');
  await expect(g.locator('[data-hh-konto] .big-num')).toHaveText('150,00 €');

  // November günstig: WG, Deutschlandticket, Prepaid, selbst kochen, Kaution in drei Raten
  await g.locator('[data-hh-start]').click();
  await expect(g.locator('[data-hh-titel]')).toHaveText('November: Einzug');
  await expect(g.locator('[data-hh-frage]')).toHaveText('Wo wohnt Benjamin?');
  for (let i = 0; i < 4; i++) await g.locator('[data-hh-o="0"]').click();
  await expect(g.locator('[data-hh-ev]')).toContainText('780 €');
  await g.locator('[data-hh-w="0"]').click();
  await expect(g.locator('[data-hh-ev] .fb.ok')).toContainText('§ 551 BGB');
  await g.locator('[data-hh-abrechnen]').click();
  const auszug = g.locator('[data-hh-auszug]');
  await expect(auszug).toContainText('Kaution (Rate)');
  await expect(auszug).toContainText('Deutschlandticket');
  await expect(auszug.locator('.hh-summe')).toContainText('300,56 €');
  await expect(g.locator('[data-hh-konto] .big-num')).toHaveText('300,56 €');
  await expect(g.locator('[data-hh-vertraege]')).toContainText('bis Monat 3');

  // Dezember teuer: Sparplan 110 €, alle Abos, große Geschenke, jedes Wochenende unterwegs, Handy auf Raten
  await g.locator('[data-hh-start]').click();
  for (let i = 0; i < 4; i++) await g.locator('[data-hh-o="2"]').click();
  await g.locator('[data-hh-w="1"]').click();
  await expect(g.locator('[data-hh-ev] .fb.bad')).toContainText('720 €');
  await g.locator('[data-hh-abrechnen]').click();
  await expect(g.locator('[data-hh-buehne] .fb.bad')).toContainText('Sparen mit Schulden');
  await expect(g.locator('[data-hh-konto]')).toContainText('110,00 €');

  // Januar: Fitness mit Laufzeit, keine Haftpflicht – der Fernseher kostet dann selbst
  await g.locator('[data-hh-start]').click();
  await g.locator('[data-hh-o="1"]').click();
  await g.locator('[data-hh-o="2"]').click();
  await g.locator('[data-hh-o="0"]').click();
  await g.locator('[data-hh-o="0"]').click();
  await g.locator('[data-hh-w="0"]').click();
  await expect(g.locator('[data-hh-ev] .fb.bad')).toContainText('keine Haftpflichtversicherung');
  await g.locator('[data-hh-abrechnen]').click();
  await expect(g.locator('[data-hh-auszug]')).toContainText('Schaden am Fernseher');

  // Februar: Kassensturz – Abos lassen sich kündigen, das Fitnessstudio nicht
  await g.locator('[data-hh-start]').click();
  await g.locator('.hh-kliste label', { hasText: 'Musik, Netflix' }).locator('input').check();
  await g.locator('.hh-kliste label', { hasText: 'Fitnessstudio' }).locator('input').check();
  await g.locator('[data-hh-kuend]').click();
  await expect(g.locator('[data-hh-kfb] .fb.ok')).toContainText('Gekündigt');
  await expect(g.locator('[data-hh-kfb] .fb.bad')).toContainText('Laufzeit läuft noch');
  await g.locator('[data-hh-weiter]').click();
  await g.locator('[data-hh-o="0"]').click();
  await g.locator('[data-hh-o="0"]').click();
  await g.locator('[data-hh-w="0"]').click();
  await g.locator('[data-hh-abrechnen]').click();
  await g.locator('[data-hh-ende]').click();
  await expect(g.locator('[data-hh-titel]')).toContainText('Benjamin');
  await expect(g.locator('.hh-kacheln')).toContainText('Sparquote');
  await expect(g.locator('.hh-ende')).toContainText('Deine teuerste Entscheidung');
  await expect(g.locator('.hh-chart svg polyline')).toHaveCount(1);
  await expect(g.locator('.hh-regeln li')).toHaveCount(3);

  // Der Spielstand bleibt nach dem Neuladen, „Neu anfangen“ setzt zurück
  await page.reload();
  await expect(page.locator('.hh-ende')).toBeVisible();
  await page.locator('[data-hh-neu]').click();
  await expect(page.locator('[data-hh-konto] .big-num')).toHaveText('150,00 €');
  await expect(page.locator('[data-hh-start]')).toBeFocused();
});

test('Benjamins Monat im Lernraum: Lehrkraft startet die Monate, Klassenspiegel ohne Spitznamen, Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(HH);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  await lk.locator('#modal-close').click();

  const schueler = [];
  for (const nick of ['Kim', 'Luca']) {
    const s = await device(browser, { viewport: { width: 390, height: 844 } });
    await s.goto(`${HH}#raum=${code}`);
    await s.locator('#lr-nick').fill(nick);
    await s.locator('#lr-jgo').click();
    await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
    await s.locator('#modal-close').click();
    await s.goto(`${HH}#benjamin`);
    await expect(s.locator('[data-hh-start]')).toBeVisible();
    schueler.push(s);
  }
  const [kim, luca] = schueler;

  await lk.goto(`${HH}#benjamin`);
  const mon = lk.locator('[data-hh-monitor]');
  await expect(mon).toBeVisible();
  await expect(lk.locator('[data-hh-app]')).toBeHidden();
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Herzstück der Stunde');
  await expect(kim.locator('.lehrerpanel')).toHaveCount(0);

  // Die Lehrkraft übernimmt: Ab jetzt starten die Monate nur noch für alle
  await mon.locator('[data-hh-lkmonat="1"]').click();
  await expect(mon).toContainText('November: Monat 1 von 4 läuft');
  await monat(kim.locator('[data-hh]'), 0, 0);
  await monat(luca.locator('[data-hh]'), 2, 1);
  await expect(mon.locator('.hh-spiegel')).toContainText('2 von 2 haben abgerechnet');
  await expect(mon.locator('.hh-kachel.a b')).toHaveText('1');
  await expect(mon.locator('.hh-kachel.c b')).toHaveText('1');
  await expect(mon).not.toContainText('Kim');
  await expect(kim.locator('[data-hh-warten]')).toContainText('Den Dezember startet eure Lehrkraft');
  await expect(kim.locator('[data-hh-start]')).toHaveCount(0);

  await mon.locator('[data-hh-lkmonat="2"]').click();
  await expect(kim.locator('[data-hh-start]')).toContainText('Dezember starten');
  await expect(mon.locator('.hh-spiegel')).toHaveCount(2);

  const feld = kim.locator('[data-schreib="hh-benjamin-wand"]');
  await feld.locator('textarea').fill('Am teuersten war der Handyvertrag, weil er 24 Monate läuft.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  await expect(lk.locator('[data-schreib="hh-benjamin-wand"] [data-wand-n]')).toHaveText('1');
  for (const s of schueler) expect(s.errors).toEqual([]);
});

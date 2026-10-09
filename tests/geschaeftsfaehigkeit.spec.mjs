// Lernwerkstatt Geschäftsfähigkeit: Navigation, Werkstätten, Blitzrunde, Rechts-Navi, Fall-Akte, Mission Zwergspitz
// und die Live-Abstimmung „Ihr seid das Gericht“ im Lernraum.
import { test, expect, device, readDoc } from './helpers.mjs';

const GF = '/geschaeftsfaehigkeit/';
const WERKSTAETTEN = {
  bauchgefuehl: 'Darfst du das?', alter: 'Vom Baby zum Vertragsprofi', haus: 'Das Haus der Geschäftsfähigkeit', navi: 'Der Rechts-Navi',
  fallakte: 'Fall-Akte', gericht: 'Ihr seid das Gericht', taschengeld: 'Taschengeld-Detektiv', online: 'Gaming, Abos und Klarna', job: 'Der erste Job',
  sichern: 'Hefteintrag und Kurztest', wissenscheck: 'Wissenscheck'
};
const nav = page => page.locator(page.viewportSize().width < 600 ? '#nav-bar' : '#rail-items');
const oeffne = async (page, id) => { await page.goto('about:blank'); await page.goto(`${GF}#${id}`); await expect(page.locator('#modal-title')).toHaveText(WERKSTAETTEN[id]); };

test.describe('ohne Lernraum', () => {
  test.use({ ohneLive: true });

  test('Navigation: Startseite, alle Bereiche und alle Werkstätten', async ({ page }) => {
    await page.goto(GF);
    await expect(page.locator('#view-title')).toHaveText('Lernwerkstatt Geschäftsfähigkeit');
    await expect(page.locator('.banner')).toContainText('Ich bin 15 – welche Verträge darf ich eigentlich schon allein abschließen?');
    await expect(page.locator('.banner .credit')).toContainText('Andreas Praefcke / Wikimedia Commons');
    await expect(nav(page).locator('[data-dest]')).toHaveText([/Start$/, /Regeln$/, /Fälle$/, /Mission$/, /Wissen$/]);

    // Jede Werkstatt lässt sich über ihre Karte öffnen
    const bereiche = { start: ['bauchgefuehl'], regeln: ['alter', 'haus', 'navi'], faelle: ['fallakte', 'gericht', 'taschengeld', 'online', 'job'], wissen: ['sichern', 'wissenscheck'] };
    for (const [bereich, ids] of Object.entries(bereiche)) {
      await nav(page).locator(`[data-dest="${bereich}"]`).click();
      await expect(page.locator('#view [data-tool]')).toHaveCount(ids.length);
      for (const id of ids) {
        await page.locator(`#view [data-tool="${id}"]`).click();
        await expect(page.locator('#modal-title')).toHaveText(WERKSTAETTEN[id]);
        await expect(page.locator('#modal-body .task')).toBeVisible();
        await page.locator('#modal-close').click();
      }
    }
    // Die Mission ist ein eigener Bereich
    await nav(page).locator('[data-dest="mission"]').click();
    await expect(page.locator('#view-title')).toHaveText('Mission Zwergspitz');
    await expect(page.locator('#view [data-weg]')).toHaveCount(7);
    // Startseite: Knöpfe zur Blitzrunde und zur Mission
    await nav(page).locator('[data-dest="start"]').click();
    await page.locator('[data-gf-tool="bauchgefuehl"]').click();
    await expect(page.locator('#modal-title')).toHaveText('Darfst du das?');
    // Werkstatt und Bereich „Fälle“ haben verschiedene Adressen
    await page.goto('about:blank'); await page.goto(`${GF}#faelle`);
    await expect(page.locator('#view-title')).toHaveText('Fälle lösen');
    await expect(page.locator('#modal')).toBeHidden();
    // Keine Hinweise für die Lehrkraft auf der Seite der Schüler
    await expect(page.locator('.lehrerpanel')).toHaveCount(0);
  });

  test('Blitzrunde: Bauchgefühl verdeckt, Auflösung erst in „Hefteintrag und Kurztest“', async ({ page }) => {
    await oeffne(page, 'sichern');
    const aufl = page.locator('[data-blitz-aufl="bauch"]');
    await expect(aufl).toContainText('noch nicht gemacht');
    await aufl.locator('[data-gehzu="bauchgefuehl"]').click();
    await expect(page.locator('#modal-title')).toHaveText('Darfst du das?');

    const box = page.locator('[data-blitz="bauch"]');
    await expect(box.locator('[data-blitz-n]')).toHaveText('Karte 1 von 8');
    // Karte 1 per Wischen nach rechts: „Geht klar“ (richtig)
    const karte = box.locator('[data-blitz-karte]');
    const k = await karte.boundingBox();
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
    await page.mouse.down();
    await page.mouse.move(k.x + k.width / 2 + 60, k.y + k.height / 2, { steps: 3 });
    await page.mouse.move(k.x + k.width / 2 + 160, k.y + k.height / 2, { steps: 3 });
    await page.mouse.up();
    // Verdeckt: keine Rückmeldung, gleich die nächste Karte
    await expect(box.locator('[data-blitz-n]')).toHaveText('Karte 2 von 8');
    await expect(box.locator('[data-blitz-fb]')).toBeHidden();
    // Der Rest per Knopf: immer „Geht klar“ → richtig sind dann die Karten 1, 3, 6 und 7
    for (let i = 2; i <= 8; i++) await box.locator('[data-wahl="ja"]').click();
    await expect(box.locator('[data-blitz-ende]')).toContainText('Dein Bauchgefühl ist gespeichert');

    await oeffne(page, 'sichern');
    await expect(aufl).toContainText('Dein Bauchgefühl: 4 von 8 richtig');
    await expect(aufl.locator('li.right')).toHaveCount(4);
    await expect(aufl.locator('li.wrong').first()).toContainText('Handyvertrag');
  });

  test('Der erste Job: Blitzrunde mit sofortiger Rückmeldung', async ({ page }) => {
    await oeffne(page, 'job');
    const box = page.locator('[data-blitz="job-blitz"]');
    await box.locator('[data-wahl="allein"]').click();
    await expect(box.locator('[data-blitz-fb] .fb.ok')).toContainText('Richtig.');
    await box.locator('[data-blitz-weiter]').click();
    // Karte 2: E-Bike auf Raten – „Darf sie allein“ ist falsch
    await box.locator('[data-wahl="allein"]').click();
    await expect(box.locator('[data-blitz-fb] .fb.bad')).toContainText('richtig ist: Nur mit Eltern');
    await expect(box.locator('[data-blitz-fb]')).toContainText('§ 110 BGB');
  });

  test('Altersschieber und Altersrätsel', async ({ page }) => {
    await oeffne(page, 'alter');
    await expect(page.locator('#al-stufe')).toHaveText('Geschäftsunfähig');
    await page.locator('#al-r').fill('5');
    await page.locator('#al-pruefen').click();
    await expect(page.locator('#al-fb')).toContainText('Zu jung.');
    await page.locator('#al-r').fill('7');
    await expect(page.locator('#al-stufe')).toHaveText('Beschränkt geschäftsfähig');
    await expect(page.locator('#al-meilen li.erreicht')).toHaveCount(2);
    await page.locator('#al-pruefen').click();
    await expect(page.locator('#al-fb')).toContainText('Richtig!');
    await page.locator('#al-weiter').click();
    await expect(page.locator('#al-rf')).toContainText('Kommunalwahl');
    await page.locator('#al-r').fill('16');
    await page.locator('#al-pruefen').click();
    await expect(page.locator('#al-fb')).toContainText('Richtig!');
    await page.locator('#al-r').fill('18');
    await expect(page.locator('#al-stufe')).toHaveText('Voll geschäftsfähig');
    await expect(page.locator('#al-naechste')).toHaveText('Alle Altersgrenzen erreicht.');
  });

  test('Haus der Geschäftsfähigkeit: zuordnen mit Erklärungen, Lückentext', async ({ page }) => {
    await oeffne(page, 'haus');
    const haus = page.locator('[data-zuordnen="haus-bauen"]');
    await expect(haus).toHaveClass(/haus/);
    await expect(haus.locator('[data-zu-warum]')).toBeHidden();
    await haus.locator('.zu-karte', { hasText: 'Ein Baby erbt' }).click();
    await haus.locator('[data-ziel="basis"]').click();
    await expect(haus.locator('.zu-fach[data-fach="basis"] .zu-karte')).toHaveCount(1);
    await haus.locator('[data-pruefen]').click();
    await expect(haus.locator('[data-ergebnis]')).toHaveText('1 von 11 richtig – 10 noch nicht zugeordnet');
    // Die Erklärungen erscheinen erst, wenn alle Karten liegen
    await expect(haus.locator('[data-zu-warum]')).toBeHidden();
    const raeume = { 'Leon (5)': 'unfaehig', 'Franz (30)': 'unfaehig', 'Lukas (12)': 'beschraenkt', 'Ohne Zustimmung': 'beschraenkt', 'nachträglich': 'beschraenkt',
      'Lea hat gestern': 'voll', 'haftet auch allein': 'voll', 'Emma (10)': 'ausnahme', 'Jonas (14)': 'ausnahme', 'Sophie (16)': 'voll' };
    for (const [text, fach] of Object.entries(raeume)) {
      await haus.locator('.zu-karte', { hasText: text }).click();
      await haus.locator(`[data-ziel="${fach}"]`).click();
    }
    await haus.locator('[data-pruefen]').click();
    await expect(haus.locator('[data-ergebnis]')).toHaveText('10 von 11 richtig – rot markierte Karten noch einmal verschieben.');
    await expect(haus.locator('.zu-karte.wrong')).toHaveText('Sophie (16) kündigt ihren Minijob, den ihre Eltern erlaubt haben.');
    await expect(haus.locator('[data-zu-warum]')).toBeVisible();
    await expect(haus.locator('[data-zu-warum]')).toContainText('§ 1 BGB');
    await expect(haus.locator('[data-zu-warum]')).toContainText('(§ 113 BGB)');

    const lt = page.locator('[data-luecken="haus-luecken"]');
    await lt.locator('.lt-luecke').nth(0).fill('7');
    await lt.locator('.lt-luecke').nth(1).fill('geschäftsunfähig');
    await lt.locator('.lt-luecke').nth(2).fill('schwebend unwirksam');
    await lt.locator('[data-pruefen]').click();
    await expect(lt.locator('.lt-luecke').nth(1)).toHaveClass(/right/);
    await expect(lt.locator('.lt-luecke').nth(2)).toHaveClass(/wrong/);
  });

  test('Rechts-Navi: Probefahrt und die ganze Route', async ({ page }) => {
    await oeffne(page, 'navi');
    const navi = page.locator('[data-navi="navi-probe"]');
    const antwort = (sid, j) => navi.locator(`[data-sid="${sid}"][data-j="${j}"]`).click();
    await antwort('person', 3);
    await antwort('vorteil', 1);
    await antwort('einwilligung', 1);
    await antwort('taschengeld', 0);
    await expect(navi.locator('.navi-ergebnis')).toContainText('Wirksam');
    await expect(navi.locator('.navi-ergebnis')).toContainText('§ 110 BGB');
    await expect(navi.locator('.navi-schritt.fertig')).toHaveCount(4);
    // Neue Fahrt: ein Kind unter 7
    await navi.locator('[data-navi-neu]').click();
    await expect(navi.locator('.navi-ergebnis')).toHaveCount(0);
    await antwort('person', 0);
    await expect(navi.locator('.navi-ergebnis')).toContainText('Nichtig');
    await navi.locator('summary', { hasText: 'Die ganze Route' }).click();
    await expect(navi.locator('.navi-karte > li')).toHaveCount(6);
  });

  test('Fall-Akte: Steckbrief, falsche Abzweigung mit Tipp, Gutachten-Baukasten, gelöste Fälle bleiben gespeichert', async ({ page }) => {
    await oeffne(page, 'fallakte');
    const akte = page.locator('[data-akte="akte"]');
    await expect(akte.locator('[data-akte-stand]')).toHaveText('0 von 8 gelöst');
    await expect(akte.locator('.akte-thumb')).toHaveCount(8);
    // Steckbrief mit Foto und Bildnachweis
    await expect(akte.locator('.akte-fakten')).toContainText('Gaming-PC');
    await expect(akte.locator('.akte-bild figcaption')).toContainText('Wikimedia Commons');
    // Fall 1: Franz ist 30 – aber dauerhaft geisteskrank
    await akte.locator('[data-sid="person"][data-j="2"]').click();
    await expect(akte.locator('.navi-schritt .fb.amb')).toContainText('§ 104 Nr. 2 BGB');
    await expect(akte.locator('[data-akte-loesung]')).toBeEmpty();
    await akte.locator('[data-sid="person"][data-j="1"]').click();
    await expect(akte.locator('.navi-ergebnis')).toContainText('Nichtig');
    await expect(akte.locator('[data-akte-stand]')).toHaveText('1 von 8 gelöst');
    // Gutachten-Baukasten: falscher Satz gibt einen Hinweis, dann alle Sätze in der richtigen Reihenfolge
    const bau = akte.locator('.gutachten');
    await expect(bau.locator('[data-satz]')).toHaveCount(6);
    await bau.locator('[data-satz="5"]').click();
    await expect(bau.locator('[data-gut-fb]')).toContainText('Obersatz');
    for (let j = 0; j < 6; j++) await bau.locator(`[data-satz="${j}"]`).click();
    await expect(akte.locator('[data-akte-loesung]')).toContainText('Gutachten gebaut!');
    await expect(akte.locator('[data-akte-loesung]')).toContainText('Betreuerin');

    // Fall 8: Partybox II endet über § 108 Abs. 3 BGB bei „Wirksam“, Lösung direkt zeigen
    await akte.locator('[data-fall="7"]').click();
    for (const [sid, j] of [['person', 3], ['vorteil', 1], ['einwilligung', 1], ['taschengeld', 1], ['job', 1]]) await akte.locator(`[data-sid="${sid}"][data-j="${j}"]`).click();
    await akte.locator('[data-sid="genehmigung"][data-j="1"]').click();
    await expect(akte.locator('.navi-schritt .fb.amb')).toContainText('Wie alt ist Finn');
    await akte.locator('[data-sid="genehmigung"][data-j="2"]').click();
    await expect(akte.locator('.navi-ergebnis')).toContainText('§ 108 Abs. 3 BGB');
    await expect(akte.locator('.navi-ergebnis')).toHaveClass(/ok/);
    await akte.locator('[data-gut-zeigen]').click();
    await expect(akte.locator('[data-akte-loesung]')).toContainText('So schreibst du die Lösung auf');
    await expect(akte.locator('[data-akte-loesung]')).not.toContainText('Gutachten gebaut!');
    await expect(akte.locator('[data-akte-stand]')).toHaveText('2 von 8 gelöst');

    // Nach dem Neuladen bleiben beide Fälle gelöst
    await oeffne(page, 'fallakte');
    await expect(akte.locator('[data-akte-stand]')).toHaveText('2 von 8 gelöst');
    await expect(akte.locator('[data-fall="7"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(akte.locator('[data-akte-loesung]')).toContainText('§ 108 Abs. 3 BGB');
    await expect(akte.locator('[data-fall="0"]')).toHaveClass(/geloest/);
    await akte.locator('[data-fall="0"]').click();
    await expect(akte.locator('[data-akte-loesung]')).toContainText('Gutachten gebaut!');
  });

  test('Taschengeld-Detektiv: Glurak-Jackpot und Raten-PS5', async ({ page }) => {
    await oeffne(page, 'taschengeld');
    const akte = page.locator('[data-akte="akte-taschengeld"]');
    await expect(akte.locator('[data-fall]')).toHaveCount(6);
    await expect(page.locator('.gf-check li')).toHaveCount(3);
    // Glurak-Jackpot: Der Gewinn ist kein überlassenes Geld
    await akte.locator('[data-fall="1"]').click();
    for (const [sid, j] of [['person', 3], ['vorteil', 1], ['einwilligung', 1]]) await akte.locator(`[data-sid="${sid}"][data-j="${j}"]`).click();
    await akte.locator('[data-sid="taschengeld"][data-j="0"]').click();
    await expect(akte.locator('.navi-schritt .fb.amb')).toContainText('600 €');
    for (const [sid, j] of [['taschengeld', 1], ['job', 1], ['genehmigung', 1]]) await akte.locator(`[data-sid="${sid}"][data-j="${j}"]`).click();
    await expect(akte.locator('.navi-ergebnis')).toContainText('Endgültig unwirksam');
    // Raten-PS5: mit der letzten Rate wirksam
    await akte.locator('[data-fall="5"]').click();
    for (const [sid, j] of [['person', 3], ['vorteil', 1], ['einwilligung', 1], ['taschengeld', 0]]) await akte.locator(`[data-sid="${sid}"][data-j="${j}"]`).click();
    await expect(akte.locator('.navi-ergebnis')).toContainText('Wirksam');
    await akte.locator('[data-gut-zeigen]').click();
    await expect(akte.locator('[data-akte-loesung]')).toContainText('Mit der letzten Rate ist der Kauf');
  });

  test('Mission Zwergspitz: schätzen, auflösen, alle Wege erkunden', async ({ page }) => {
    await page.goto(`${GF}#mission`);
    await expect(page.locator('#zs-stand')).toHaveText('0 von 7 Wegen erkundet');
    await expect(page.locator('.gf-lab-fig figcaption')).toContainText('CC0');
    await expect(page.locator('#zs-lab .lab-nr')).toHaveCount(7);
    // Im Labyrinth auf die Nummer tippen öffnet den Weg
    await page.locator('#zs-lab [data-lab="3"]').click();
    await expect(page.locator('#zs-weg')).toContainText('Ratenkauf beim Züchter');
    await page.locator('[data-weg="2"]').click();
    await expect(page.locator('#zs-weg')).toContainText('Angespartes Taschengeld');
    await page.locator('[data-tipp="ziel"]').click();
    await expect(page.locator('#zs-fb .fb.bad')).toContainText('Sackgasse');
    await expect(page.locator('#zs-fb')).toContainText('Du hattest „Führt zum Hund“ getippt.');
    await expect(page.locator('#zs-stand')).toHaveText('1 von 7 Wegen erkundet');
    await expect(page.locator('#zs-lab .lab-weg')).toHaveCount(1);
    await expect(page.locator('#zs-lab .lab-wand')).toHaveCount(1);
    for (const i of [0, 1, 3, 4, 5, 6]) {
      await page.locator(`[data-weg="${i}"]`).click();
      await page.locator('[data-tipp="sackgasse"]').click();
    }
    await expect(page.locator('#zs-profi')).toContainText('Mission erfüllt!');
    await expect(page.locator('#zs-profi')).toContainText('2 von 7 Wegen richtig');
    await expect(page.locator('#zs-lab .lab-ziel')).toHaveClass(/erreicht/);
  });

  test('Ihr seid das Gericht: ohne Lernraum allein urteilen', async ({ page }) => {
    await oeffne(page, 'gericht');
    await expect(page.locator('[data-abst]')).toHaveCount(6);
    const fall = page.locator('[data-abst="gericht-wohnung"]');
    await expect(fall).toContainText('Ihr seid das Gericht · Die Wohnung');
    await expect(fall.locator('[data-abst-urteil]')).toBeDisabled();
    await fall.getByLabel('Wirksam', { exact: true }).check();
    await fall.locator('[data-abst-urteil]').click();
    await expect(fall.locator('.fb.bad')).toContainText('Richtig ist: Schwebend unwirksam');
    await fall.locator('[data-abst-neu]').click();
    await expect(fall.locator('[data-abst-urteil]')).toBeVisible();
    await expect(page.locator('[data-abst="gericht-simson"] .gf-fig figcaption')).toContainText('CC BY-SA 4.0');
  });
});

test('Lernraum: Live-Abstimmung mit zwei Schülern, Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(GF);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  expect((await readDoc(`rooms/${code}`)).fields.topic.stringValue).toBe('geschaeftsfaehigkeit');
  // Das Dashboard listet die Abstimmungen
  await expect(lk.locator('#lr-abst')).toContainText('Die Wohnung: Ist die Schenkung wirksam?');

  const beitreten = async nick => {
    const s = await device(browser, { viewport: { width: 390, height: 844 } });
    await s.goto(`${GF}#raum=${code}`);
    await s.locator('#lr-nick').fill(nick);
    await s.locator('#lr-jgo').click();
    await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
    await s.locator('#modal-close').click();
    return s;
  };
  const mia = await beitreten('Mia');
  const ben = await beitreten('Ben');

  // Lehrkraft öffnet die Werkstatt über das Dashboard und startet die Abstimmung
  await lk.locator('[data-lr-abst="gericht"]').first().click();
  await expect(lk.locator('#modal-title')).toHaveText('Ihr seid das Gericht');
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('V ZB 44/04');
  const fall = lk.locator('[data-abst="gericht-wohnung"]');
  await fall.locator('[data-abst-start]').click();
  await expect(fall.locator('[data-abst-n]')).toHaveText('0 von 2 Personen haben abgestimmt.');

  // Auf den Handys erscheint der Fall
  for (const s of [mia, ben]) {
    await expect(s.locator('#lr-umfrage')).toBeVisible();
    await expect(s.locator('#lr-umfrage')).toContainText('Ihr seid das Gericht · Die Wohnung');
    await expect(s.locator('#lr-umfrage')).toContainText('Lina (12)');
    await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  }
  await mia.locator('[data-u-w="1"]').click();
  await expect(mia.locator('#lr-umfrage [role="status"]')).toContainText('Deine Stimme ist abgegeben');
  await ben.locator('[data-u-w="0"]').click();
  await expect(fall.locator('[data-abst-n]')).toHaveText('2 von 2 Personen haben abgestimmt.');
  await expect(fall.locator('[data-abst-zahl="0"]')).toHaveText('1 · 50 %');
  await expect(fall.locator('[data-abst-zahl="1"]')).toHaveText('1 · 50 %');
  // Ben ändert seine Stimme noch
  await ben.locator('[data-u-w="2"]').click();
  await expect(fall.locator('[data-abst-zahl="2"]')).toHaveText('1 · 50 %');
  await expect(fall.locator('[data-abst-zahl="0"]')).toHaveText('0 · 0 %');

  // Auflösen
  await fall.locator('[data-abst-auf]').click();
  await expect(fall.locator('.abst-zeile.richtig')).toContainText('Schwebend unwirksam');
  await expect(fall.locator('.fb.ok')).toContainText('Urteil: Schwebend unwirksam.');
  await expect(mia.locator('#lr-umfrage .fb.ok')).toContainText('Richtig geurteilt!');
  await expect(ben.locator('#lr-umfrage .fb.bad')).toContainText('Das Gericht entscheidet anders.');
  await expect(mia.locator('[data-u-w="0"]')).toBeDisabled();
  await mia.locator('[data-u-zu]').click();
  await expect(mia.locator('#lr-umfrage')).toBeHidden();

  // Beenden: Die Fenster verschwinden, in der Werkstatt steht das eigene Urteil
  await fall.locator('[data-abst-ende]').click();
  await expect(fall.locator('[data-abst-start]')).toBeVisible();
  await expect(ben.locator('#lr-umfrage')).toBeHidden();
  await ben.locator('#nav-bar [data-dest="faelle"]').click();
  await ben.locator('#view [data-tool="gericht"]').click();
  await expect(ben.locator('[data-abst="gericht-wohnung"] .fb.bad')).toContainText('Richtig ist: Schwebend unwirksam');
  await expect(ben.locator('[data-abst="gericht-konzert"]')).toContainText('sobald eure Lehrkraft die Abstimmung startet');

  // Blitzrunde als Klassenrunde: Karten auf allen Handys, Stimmen zählen als eigenes Bauchgefühl
  await lk.locator('#modal-close').click();
  await lk.locator('#rail-items [data-dest="start"]').click();
  await lk.locator('#view [data-tool="bauchgefuehl"]').click();
  const runde = lk.locator('[data-blitz="bauch"] [data-blitz-klasse]');
  await expect(runde).toContainText('Spielt die Blitzrunde mit der ganzen Klasse');
  await runde.locator('[data-bk-start="0"]').click();
  await expect(runde).toContainText('Karte 1 von 8');
  for (const s of [mia, ben]) await expect(s.locator('#lr-umfrage')).toContainText('Blitzrunde · Karte 1 von 8');
  await expect(mia.locator('#lr-umfrage h2')).toContainText('Döner');
  await mia.locator('[data-u-w="1"]').click();
  await ben.locator('[data-u-w="1"]').click();
  await expect(runde.locator('[data-abst-zahl="1"]')).toHaveText('2 · 100 %');
  // verdeckt: keine Auflösung, weiter zur nächsten Karte
  await expect(runde.locator('[data-bk-auf]')).toHaveCount(0);
  await runde.locator('[data-bk-start="1"]').click();
  await expect(mia.locator('#lr-umfrage')).toContainText('Karte 2 von 8');
  await mia.locator('[data-u-w="0"]').click();
  await expect(runde.locator('[data-abst-zahl="0"]')).toHaveText('1 · 100 %');
  await runde.locator('[data-bk-ende]').click();
  await expect(mia.locator('#lr-umfrage')).toBeHidden();
  // Bauchgefühl-Check: Mia sieht ihr eigenes Ergebnis, die Lehrkraft das der Klasse
  await mia.goto('about:blank'); await mia.goto(`${GF}#sichern`);
  await expect(mia.locator('[data-blitz-aufl="bauch"]')).toContainText('Dein Bauchgefühl: 2 von 2 richtig');
  await lk.goto('about:blank'); await lk.goto(`${GF}#sichern`);
  await expect(lk.locator('[data-blitz-aufl="bauch"]')).toContainText('Eure Klasse: 2 von 2 Karten mehrheitlich richtig');
  await lk.goto('about:blank'); await lk.goto(`${GF}#gericht`);

  // Antwort an die Wand
  const feld = ben.locator('[data-schreib="gericht-wand"]');
  await feld.locator('textarea').fill('Bei der Wohnung dachten viele, ein Geschenk ist immer wirksam.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('An der Wand');
  const wand = lk.locator('[data-schreib="gericht-wand"] [data-wand]');
  await expect(wand.locator('[data-wand-n]')).toHaveText('1');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toContainText('ein Geschenk ist immer wirksam');

  expect(mia.errors).toEqual([]);
  expect(ben.errors).toEqual([]);
  await mia.context().close();
  await ben.context().close();
});

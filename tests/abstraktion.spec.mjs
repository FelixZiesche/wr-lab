// Lernstrecke Abstraktionsprinzip: Übersicht, Lektionen mit vier Stationen, Eigentums-Detektiv, Stecker,
// Rechts-Navi und Fall-Akte und der Lernraum (wo steht die Klasse, Wand, Lehrerpanel).
import { test, expect, device, readDoc } from './helpers.mjs';

const AP = '/abstraktion/';
const TITEL = {
  drei: 'Lektion 1: Ein Kauf, drei Geschäfte', abstraktion: 'Lektion 2: Kauf geplatzt – Rad weg?', doppelt: 'Lektion 3: Zweimal verkauft',
  warum: 'Lektion 4: Warum so kompliziert?', wissenscheck: 'Wissenscheck'
};
const plan = page => page.locator('#ls-plan');

test('Übersicht: Leitfrage, Lektionsplan, zwei Wege und Tafelbild', async ({ page }) => {
  await page.goto(AP);
  await expect(page).toHaveTitle('Lernstrecke Abstraktionsprinzip');
  await expect(page.locator('.banner h2')).toHaveText('Gekauft heißt gehört?');
  await expect(plan(page).locator('.ls-plan-item')).toHaveCount(5);
  await expect(page.locator('.ls-tafel-teile li.leer')).toHaveCount(4);
});

test('Alle Lektionen und der Wissenscheck öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${AP}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
});

test('Eigentums-Detektiv: Handy in drei Akten, falsche Antwort mit Tipp, Schema und Eigentum wachsen mit', async ({ page }) => {
  await page.goto(`${AP}#drei`);
  await page.locator('.ls-schritt[data-ls-zu="1"]').click();
  const dt = page.locator('[data-dt="detektiv-handy"]');
  const antwort = t => dt.locator('[data-dt-j]').filter({ hasText: t === 'Wirksam' ? /^Wirksam$/ : t }).click();
  const weiter = () => dt.locator('[data-dt-weiter]').click();
  const eigentuemer = sache => dt.locator('.dt-tab tbody tr', { hasText: sache }).locator('td').first();
  const besitzer = sache => dt.locator('.dt-tab tbody tr', { hasText: sache }).locator('td').nth(1);
  // Akt 1: Kaufvertrag – zuerst falsch geraten
  await antwort('Übereignung der Ware');
  await expect(dt.locator('.fb.amb')).toContainText('Nicht ganz.');
  await expect(dt.locator('[data-dt-j].falsch')).toBeFocused();
  await antwort('Kaufvertrag');
  await antwort('Wirksam');
  await expect(dt.locator('.dt-schema li')).toHaveCount(1);
  await expect(dt.locator('.dt-schema li').first()).toContainText('Kaufvertrag');
  await expect(eigentuemer('iPhone')).toContainText('Max');
  await weiter();
  // Lea testet das Handy: Besitz ja, Eigentum nein
  await antwort('Kein neuer Teil');
  await antwort('Max ist Eigentümer, Lea ist Besitzerin');
  await expect(besitzer('iPhone')).toContainText('Lea');
  await expect(eigentuemer('iPhone')).toContainText('Max');
  await weiter();
  await weiter();
  // Akt 2 und 3
  await antwort('Übereignung der Ware'); await antwort('Wirksam');
  await expect(eigentuemer('iPhone')).toContainText('Lea');
  await expect(eigentuemer('350 €')).toContainText('Lea');
  await weiter();
  await antwort('Übereignung des Geldes'); await antwort('Wirksam');
  await expect(eigentuemer('350 €')).toContainText('Max');
  await weiter();
  await expect(dt.locator('.fb.ok')).toContainText('Fall gelöst');
  await expect(dt.locator('.dt-schema li')).toHaveCount(3);
  // Nach dem Neuladen bleibt der Fall gelöst
  await page.reload();
  await expect(page.locator('[data-dt="detektiv-handy"] .fb.ok')).toContainText('Fall gelöst');
});

test('Stecker und Fahrrad-Fall: Kim bleibt Eigentümerin, ohne Abstraktionsprinzip nicht', async ({ page }) => {
  await page.goto(`${AP}#abstraktion`);
  await page.locator('.ls-schritt[data-ls-zu="1"]').click();
  const st = page.locator('#stecker');
  await expect(st.locator('[data-stecker-ergebnis]')).toContainText('Kim');
  await st.locator('[data-sw="nein"]').click();
  await expect(st.locator('[data-sw="nein"]')).toHaveAttribute('aria-checked', 'true');
  await expect(st.locator('[data-block="kv"]')).toHaveClass(/tot/);
  await expect(st.locator('[data-stecker-ergebnis]')).toContainText('Kim');
  await st.locator('[data-sw="ohne"]').click();
  await expect(st.locator('[data-stecker-ergebnis]')).toContainText('der Laden');

  const dt = page.locator('[data-dt="detektiv-fahrrad"]');
  const antwort = t => dt.locator('[data-dt-j]').filter({ hasText: t === 'Wirksam' ? /^Wirksam$/ : t }).click();
  await antwort('Kaufvertrag'); await antwort('Schwebend unwirksam');
  await dt.locator('[data-dt-weiter]').click();
  await antwort('Übereignung der Ware'); await antwort('Wirksam');
  await dt.locator('[data-dt-weiter]').click();
  await antwort('Kein neuer Teil'); await antwort('Er wird endgültig unwirksam');
  await expect(dt.locator('.dt-schema li').first()).toContainText('unwirksam');
  await dt.locator('[data-dt-weiter]').click();
  await antwort('Nein, es wurde noch kein Geld übergeben');
  await expect(dt.locator('.dt-schema li').last()).toContainText('noch nicht passiert');
  await dt.locator('[data-dt-weiter]').click();
  await antwort('Kim, weil die Übereignung wirksam ist');
  await expect(dt.locator('.fb.ok')).toContainText('Abstraktionsprinzip');
});

test('Fall-Akte: Gaming-PC auf Raten mit dem Rechts-Navi lösen', async ({ page }) => {
  await page.goto(`${AP}#doppelt`);
  await page.locator('.ls-schritt[data-ls-zu="3"]').click();
  const akte = page.locator('[data-akte="akte"]');
  await akte.locator('[data-fall="3"]').click();
  await expect(akte).toContainText('Gaming-PC auf Raten');
  // Falsche Abzweigung: Tipp statt Weiterfahrt
  await akte.locator('[data-route] button', { hasText: /^Ja$/ }).last().click();
  await expect(akte.locator('.fb.amb')).toContainText('Wann soll das Eigentum übergehen?');
  await akte.locator('[data-route] button', { hasText: 'Nein, oder erst später' }).last().click();
  await expect(akte.locator('.navi-ergebnis')).toContainText('Noch nicht Eigentümer');
});

test('Lernraum: Klasse in eine Lektion holen, Wand und Lehrerpanel', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(AP);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  expect((await readDoc(`rooms/${code}`)).fields.topic.stringValue).toBe('abstraktion');

  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.goto(`${AP}#raum=${code}`);
  await s.locator('#lr-nick').fill('Kalle');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kalle`);
  await s.locator('#modal-close').click();

  await lk.locator('#lr-ziel').selectOption('doppelt');
  await lk.locator('#lr-holen').click();
  await expect(s.locator('#modal-title')).toHaveText(TITEL.doppelt);
  await lk.locator('#modal-close').click();
  await s.locator('#modal-close').click();
  await expect(plan(s).locator('.ls-plan-item', { hasText: 'Zweimal verkauft' })).toContainText('Hier ist eure Klasse');

  await s.locator('#ls-plan [data-tool="drei"]').click();
  const feld = s.locator('[data-schreib="handy-vermutung"]');
  await feld.locator('textarea').fill('Ab dem Handschlag.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  await lk.locator('#ls-plan [data-tool="drei"]').click();
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Stundenvorschlag');
  const wand = lk.locator('[data-schreib="handy-vermutung"]');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toContainText('Ab dem Handschlag.');

  expect(s.errors).toEqual([]);
  await s.context().close();
});

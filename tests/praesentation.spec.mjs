// Präsentationsansicht (praesentation.js): Der Laptop der Lehrkraft steuert, ein zweites Fenster ist der Beamer.
// Der Beamer folgt nicht, er zeigt nur, was die Lehrkraft schickt, nie Lehrerpanel, Lösungen vorab oder Spitznamen an der Wand.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, device, SECHSECK } from './helpers.mjs';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const axe = async (page, sel) => (await new AxeBuilder({ page }).include(sel).withTags(TAGS).analyze()).violations
  .map(v => `${sel} – ${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`);

async function beitreten(browser, code, nick) {
  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.goto(`${SECHSECK}#raum=${code}`);
  await s.locator('#lr-nick').fill(nick);
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als ${nick}`);
  await s.locator('#modal-close').click();
  return s;
}
async function antworten(s) {
  const qz = s.locator('#qz');
  await expect(qz.locator('[data-qz-w], [data-qz-m], [data-qz-zahl]').first()).toBeVisible();
  if (await qz.locator('[data-qz-zahl]').count()) {
    await qz.locator('[data-qz-zahl]').fill('2,5');
    await qz.locator('[data-qz-abgeben]').click();
  } else if (await qz.locator('[data-qz-m]').count()) {
    await qz.locator('[data-qz-m]').first().click();
    await qz.locator('[data-qz-abgeben]').click();
  } else await qz.locator('[data-qz-w]').first().click();
  await expect(qz).toContainText('Deine Antwort ist abgegeben');
}

test('Präsentationsansicht: Startbild, Wand und Quiz auf dem Beamer, Lehrerpanel und Lösung nur auf dem Laptop', async ({ page: lk, context, browser }) => {
  test.setTimeout(180_000);
  const fehler = [];
  context.on('page', p => p.on('pageerror', e => fehler.push(e.message)));
  await lk.setViewportSize({ width: 1280, height: 800 });
  await lk.goto(SECHSECK);
  // Ohne Lernraum gibt es keine Leiste
  await expect(lk.locator('#praes-leiste')).toHaveCount(0);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  const mia = await beitreten(browser, code, 'Mia');

  // Präsentationsansicht öffnen: Das Beamer-Fenster ist dieselbe Lehrkraft und zeigt das Startbild
  await expect(lk.locator('[data-praes-status]')).toContainText('zweiten Bildschirm');
  const [beamer] = await Promise.all([context.waitForEvent('page'), lk.locator('[data-praes-oeffnen]').click()]);
  await beamer.setViewportSize({ width: 1280, height: 720 });
  await expect(beamer).toHaveURL(/\?praesentation/);
  const buehne = beamer.locator('#praes');
  await expect(buehne).toBeVisible();
  await expect(buehne.locator('.praes-code')).toHaveText(code);
  await expect(buehne).toContainText('1 Gerät im Raum');
  await expect(buehne.locator('.praes-qr svg')).toBeVisible();
  await expect(beamer.locator('.topbar')).toBeHidden();
  await expect(beamer.locator('.app')).toHaveJSProperty('inert', true);
  expect(await axe(beamer, '#praes')).toEqual([]);
  await expect(lk.locator('[data-praes-status]')).toContainText('Das Beamer-Fenster ist offen und zeigt: Startbild mit Raumcode');
  const leiste = lk.locator('#praes-leiste');
  await expect(leiste).toBeVisible();
  await expect(leiste).toContainText('Beamer: Startbild mit Raumcode');
  await expect(leiste.locator('[data-praes-start]')).toHaveCount(0);

  // Mia schickt eine Antwort an die Wand
  await mia.locator('#nav-bar [data-dest="ziele"]').click();
  await mia.locator('#view [data-tool="preis"]').click();
  const feld = mia.locator('[data-schreib="preis-wand"]');
  await feld.locator('textarea').fill('Bei 0 % droht Deflation, dann warten alle mit dem Kaufen.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');

  // Der Laptop öffnet die Werkstatt: Der Beamer folgt nicht, er zeigt weiter das Startbild
  await lk.locator('[data-lr-wand="preis"]').first().click();
  await expect(lk.locator('#modal-title')).toHaveText('Warenkorb-Werkstatt');
  await expect(lk.locator('#modal-body > .lehrerpanel')).toHaveCount(1);
  await expect(buehne.locator('.praes-code')).toBeVisible();
  await expect(leiste.locator('[data-praes-hier]')).toHaveText('Diese Werkstatt zeigen');

  // „Antworten zeigen“ schickt die Wand von selbst auf den Beamer, dort ohne Spitznamen und ohne Löschen
  const wand = lk.locator('[data-schreib="preis-wand"] [data-wand]');
  await expect(wand.locator('[data-wand-beamer]')).toBeVisible();
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand).toContainText('Mia');
  await expect(buehne.locator('.praes-wand')).toContainText('Bei 0 % droht Deflation');
  await expect(buehne.locator('.praes-wand')).toContainText('1 Antwort');
  await expect(buehne).not.toContainText('Mia');
  await expect(buehne.locator('[data-wand-weg]')).toHaveCount(0);
  await expect(wand.locator('[data-wand-beamer]')).toHaveAttribute('aria-pressed', 'true');
  await expect(leiste).toContainText('Beamer: Wand');
  expect(await axe(beamer, '#praes')).toEqual([]);
  // Neue Antworten erscheinen live, gelöscht wird nur am Laptop und verschwindet dann auch am Beamer
  await feld.locator('textarea').fill('Zweite Antwort von Mia');
  await feld.locator('[data-schreib-senden]').click();
  await expect(buehne.locator('.praes-wand')).toContainText('Zweite Antwort von Mia');
  await wand.locator('[data-wand-weg]').click();
  await wand.locator('[data-wand-ja]').click();
  await expect(buehne.locator('.praes-wand')).toContainText('Noch keine Antworten');

  // Die Werkstatt selbst auf den Beamer: ohne Lehrerpanel und ohne Wand mit Spitznamen
  await leiste.locator('[data-praes-hier]').click();
  await expect(buehne).toBeHidden();
  await expect(beamer.locator('#modal')).toBeVisible();
  await expect(beamer.locator('#modal-title')).toHaveText('Warenkorb-Werkstatt');
  await expect(beamer.locator('.lehrerpanel')).toHaveCount(0);
  await expect(beamer.locator('[data-schreib="preis-wand"] [data-wand]')).toBeHidden();
  await expect(beamer.getByText('Sicherheitsabstand zur Deflation')).toHaveCount(0);
  await expect(leiste).toContainText('Beamer: „Warenkorb-Werkstatt“');
  await expect(leiste.locator('[data-praes-hier]')).toHaveCount(0);
  // Zurück zum Startbild
  await leiste.locator('[data-praes-start]').click();
  await expect(buehne.locator('.praes-code')).toHaveText(code);

  // Klassen-Quiz: Starten schickt es auf den Beamer, dort ohne Knöpfe
  await lk.locator('#modal-close').click();
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-wc [data-lr-quiz]').click();
  const kasten = lk.locator('[data-quiz]');
  await kasten.locator('[data-qz-anzahl]').selectOption('5');
  await kasten.locator('[data-qz-zeit-wahl]').selectOption('60');
  await kasten.locator('[data-qz-start]').click();
  const qz = lk.locator('#qz'), bq = beamer.locator('#qz');
  await expect(bq).toBeVisible();
  await expect(buehne).toBeHidden();
  await expect(bq.locator('#qz-t')).toHaveText('Klassen-Quiz: Macht mit!');
  await expect(bq.locator('button')).toHaveCount(0);
  await expect(bq.locator('.lr-qr svg')).toBeVisible();
  await expect(qz.locator('[data-qz-referent]')).toContainText('Erste Frage');
  await expect(bq.locator('[data-qz-referent]')).toHaveCount(0);
  await expect(mia.locator('#qz')).toBeVisible();

  // Weiter mit Pfeil rechts: Frage 1. Lösung und wer noch fehlt nur auf dem Laptop
  await lk.keyboard.press('ArrowRight');
  await expect(bq.locator('[data-qz-kopf]')).toContainText('Frage 1 von 5');
  await expect(bq.locator('[data-qz-zeit]')).toHaveText(/^noch \d+ s$/);
  await expect(qz.locator('[data-qz-referent]')).toContainText('Lösung:');
  await expect(qz.locator('[data-qz-referent]')).toContainText('Noch ohne Antwort: Mia');
  await expect(bq.locator('[data-qz-referent]')).toHaveCount(0);
  await expect(bq).not.toContainText('Mia');
  expect(await axe(beamer, '#qz')).toEqual([]);
  await antworten(mia);
  // Alle haben geantwortet: aufgelöst, auch am Beamer
  await expect(bq).toContainText('1 von 1 haben geantwortet');
  await expect(qz.locator('[data-qz-rang]')).toBeVisible();

  // Rangliste: Der Beamer zeigt dieselbe Ansicht wie der Laptop, die Top 5 mit Spitznamen, auf Wunsch ohne
  await lk.keyboard.press('ArrowRight');
  await expect(bq.locator('#qz-t')).toHaveText('Rangliste nach Frage 1');
  await expect(bq.locator('.qz-rang')).toContainText('Mia');
  await qz.locator('[data-qz-namen]').click();
  await expect(bq.locator('.qz-rang')).toContainText('Platz 1');
  await expect(bq.locator('.qz-rang')).not.toContainText('Mia');
  await qz.locator('[data-qz-namen]').click();
  await expect(bq.locator('.qz-rang')).toContainText('Mia');

  // Das Quiz-Fenster auf dem Laptop schließen: Der Beamer zeigt das Quiz weiter, die Zeit läuft weiter
  await qz.locator('[data-qz-weiter]').click();
  await expect(bq.locator('[data-qz-kopf]')).toContainText('Frage 2 von 5');
  await qz.locator('[data-qz-zu]').click();
  await expect(qz).toBeHidden();
  await expect(bq).toBeVisible();
  await expect(leiste).toContainText('Beamer: Klassen-Quiz, Frage 2 von 5');

  // Quiz beenden: Der Beamer zeigt wieder das Startbild
  await lk.locator('[data-quiz] [data-qz-ende]').click();
  await expect(bq).toBeHidden();
  await expect(buehne.locator('.praes-code')).toHaveText(code);
  await expect(leiste).toContainText('Beamer: Startbild mit Raumcode');

  // Raum beenden (Lernraum-Knopf in der Kopfzeile der offenen Werkstatt): Das Beamer-Fenster merkt es
  await lk.locator('[data-raum-btn]:visible').last().click();
  await lk.locator('#lr-ende').click();
  await lk.locator('#lr-ende-y').click();
  await expect(buehne).toContainText('Öffne am Laptop einen Lernraum');
  await expect(leiste).toBeHidden();
  expect(fehler, 'JavaScript-Fehler im Beamer-Fenster').toEqual([]);
});

// Barrierefreiheit automatisch mit axe-core (WCAG 2.2 AA): Startseite, Fehlerseite, Datenschutz, Impressum und jedes Thema aus themen.js
// mit Startansicht, allen Bereichen und allen Werkstätten, bei 390 px (Handy) und 1280 px (Beamer), hell und dunkel.
// Pro Kombination nur eine Seite: Die Ansichten wechseln über die Adresse hinter # (wie Zurück/Vor im Browser).
// Nach dem Laden prüft AxeBuilder die ganze Seite und lädt dabei axe in die Seite. Für die weiteren Ansichten derselben
// Seite läuft dieses axe direkt weiter (AxeBuilder lädt es sonst bei jedem Aufruf neu, das kostet etwa 1 s pro Ansicht).
// Material-Symbols-Ligaturen hält axe für normalen Text; dass Icon-Namen nicht vorgelesen werden, prüfen
// tests/wrlab.spec.mjs und tests/barrierefreiheit.spec.mjs.
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './helpers.mjs';

// Ohne Animationen: axe soll den fertigen Zustand prüfen, nicht eine Karte mitten im Einblenden (halb durchsichtig)
test.use({ ohneLive: true, contextOptions: { reducedMotion: 'reduce' } });

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Ein Verstoß als kurze Zeile: Ansicht, Regel und die ersten betroffenen Elemente
const zeilen = (wo, violations) => violations.map(v => `${wo} – ${v.id} (${v.impact}): ${v.nodes.slice(0, 5).map(n => n.target.join(' ')).join(' | ')}`);
const ganzeSeite = async (page, wo) => zeilen(wo, (await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations);
// nur: Ausschnitt der Seite, z. B. das Werkstatt-Fenster
const ansicht = async (page, wo, nur) => zeilen(wo, await page.evaluate(([nur, tags]) =>
  window.axe.run(nur ? { include: [nur] } : document, { runOnly: { type: 'tag', values: tags } }).then(r => r.violations), [nur, TAGS]));
// Wechselt die Ansicht über die Adresse und wartet, bis sie gezeichnet ist
const zeige = async (page, h) => {
  await page.evaluate(h => { location.hash = h; }, h);
  await expect(page).toHaveURL(new RegExp(`#${h}$`));
};

for (const breite of [390, 1280]) for (const schema of ['light', 'dark']) {
  test.describe(`${breite} px, ${schema === 'light' ? 'hell' : 'dunkel'}`, () => {
    test.use({ viewport: { width: breite, height: breite < 600 ? 844 : 800 }, colorScheme: schema });

    test('Startseite, Fehlerseite, Rechtstexte und alle Themen ohne Verstöße gegen WCAG 2.2 AA', async ({ page }) => {
      test.setTimeout(180_000);
      const fehler = [];
      await page.goto('/');
      await expect(page.locator('.topic-link').first()).toBeVisible();
      expect(await page.evaluate(() => [matchMedia('(prefers-color-scheme: dark)').matches, matchMedia('(prefers-reduced-motion: reduce)').matches])).toEqual([schema === 'dark', true]);
      fehler.push(...await ganzeSeite(page, 'Startseite'));
      await page.goto('/gibtsnicht');
      await expect(page.locator('h1')).toHaveText('Diese Seite gibt es nicht.');
      fehler.push(...await ganzeSeite(page, 'Fehlerseite'));
      for (const [seite, titel] of [['datenschutz', 'Datenschutz'], ['impressum', 'Impressum']]) {
        await page.goto(`/${seite}.html`);
        await expect(page.locator('h1')).toHaveText(titel);
        fehler.push(...await ganzeSeite(page, titel));
      }

      const themen = await page.evaluate(async () => (await import('/themen.js')).THEMEN.map(t => t.id));
      for (const id of themen) {
        await page.goto(`/${id}/`);
        await expect(page.locator('#view .card').first()).toBeVisible();
        fehler.push(...await ganzeSeite(page, `${id} Start`));
        const bereiche = await page.locator('#rail-items [data-dest]').evaluateAll(b => b.map(x => x.dataset.dest));
        expect(bereiche.length, id).toBeGreaterThan(1);
        for (const b of bereiche) {
          await zeige(page, b);
          await expect(page.locator('#view-title')).toBeVisible();
          if (b !== 'start') fehler.push(...await ansicht(page, `${id}#${b}`));
          // Werkstätten: nur das Fenster, der gesperrte Hintergrund ist als Bereich schon geprüft
          for (const w of await page.locator('#view [data-tool]').evaluateAll(els => els.map(e => e.dataset.tool))) {
            await zeige(page, w);
            await expect(page.locator('#modal-body > *').first()).toBeVisible();
            fehler.push(...await ansicht(page, `${id}#${w}`, '#modal'));
            await zeige(page, b);
            await expect(page.locator('#modal')).toBeHidden();
          }
        }
      }
      expect(fehler).toEqual([]);
    });
  });
}

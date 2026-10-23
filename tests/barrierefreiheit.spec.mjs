// Barrierefreiheit (WCAG 2.2 AA) ohne Lernraum: Werkstatt-Fenster, Gliederung, Icons, Rückmeldungen, Tastatur.
// Sichert dauerhaft ab, was Paket B behoben hat. Die Live-Teile (Pause, Abstimmung, Dashboard) prüft tests/lernraum.spec.mjs.
import { test, expect, SECHSECK } from './helpers.mjs';

test.use({ ohneLive: true });

const GF = '/geschaeftsfaehigkeit/';
// Neu laden statt nur die Adresse hinter # zu wechseln (sonst bleibt die Seite stehen)
const oeffne = async (page, url) => { await page.goto('about:blank'); await page.goto(url); };

// Überschriften in Lesereihenfolge, wie sie ein Screenreader findet (ohne verborgene und gesperrte Bereiche)
const ueberschriften = (page, wurzel = 'body') => page.locator(wurzel).evaluate(w => [...w.querySelectorAll('h1,h2,h3,h4,h5,h6')]
  .filter(h => h.checkVisibility() && !h.closest('[inert],[aria-hidden="true"]'))
  .map(h => ({ n: +h.tagName[1], t: h.textContent.trim().slice(0, 40) })));
// Keine Stufe darf übersprungen werden (z. B. h1 → h3)
const spruenge = (liste, start) => liste.filter((h, i) => h.n > (i ? liste[i - 1].n : start) + 1).map(h => `h${h.n} „${h.t}“`);

test('Werkstatt-Fenster: Hintergrund ist gesperrt, danach wieder frei, Fokus kehrt zur Karte zurück', async ({ page }) => {
  for (const [url, tool] of [[`${SECHSECK}#ziele`, 'preis'], [`${GF}#faelle`, 'fallakte']]) {
    await oeffne(page, url);
    const karte = page.locator(`#view [data-tool="${tool}"]`);
    await expect(page.locator('.pane')).toHaveJSProperty('inert', false);
    // Öffnen per Tastatur: Fokus im Fenster, Kopfleiste und Karten dahinter gesperrt, Navigation bleibt bedienbar
    await karte.press('Enter');
    await expect(page.locator('#modal')).toBeVisible();
    await expect(page.locator('#modal-close')).toBeFocused();
    await expect(page.locator('.pane')).toHaveJSProperty('inert', true);
    await expect(page.locator('#rail-items [data-dest]').first()).not.toHaveJSProperty('inert', true);
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !document.activeElement.closest('.pane'))).toBe(true);
    // Esc schließt, der Fokus steht wieder auf der Karte
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('.pane')).toHaveJSProperty('inert', false);
    await expect(karte).toBeFocused();
    // Ebenso mit dem Knopf „Zurück“
    await karte.press('Enter');
    await page.locator('#modal-close').press('Enter');
    await expect(page.locator('.pane')).toHaveJSProperty('inert', false);
    await expect(karte).toBeFocused();
  }
  // Direkt über die Adresse geöffnet: Beim Schließen landet der Fokus auf der Karte, nicht auf der Seite
  await oeffne(page, `${GF}#haus`);
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('.pane')).toHaveJSProperty('inert', true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#view [data-tool="haus"]')).toBeFocused();
});

test('Gliederung: Überschriften ohne Sprung (h1 → h2 → h3) auf der Startseite, in allen Bereichen und im Fenster', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topic-link').first()).toBeVisible();
  const start = await ueberschriften(page);
  expect(start[0].n, 'Startseite beginnt mit h1').toBe(1);
  expect(spruenge(start, 0), 'Startseite').toEqual([]);
  for (const thema of [SECHSECK, GF]) {
    await page.goto(thema);
    for (const z of await page.locator('#rail-items [data-dest]').evaluateAll(b => b.map(x => x.dataset.dest))) {
      await page.locator(`#rail-items [data-dest="${z}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${z}$`));
      const liste = await ueberschriften(page);
      expect(liste[0], `${thema}#${z} beginnt mit h1`).toMatchObject({ n: 1 });
      expect(spruenge(liste, 0), `${thema}#${z}`).toEqual([]);
    }
  }
  // Im Werkstatt-Fenster: Titel h2, darunter h3 (gilt für den Wissenscheck und die Fall-Akte)
  for (const url of [`${SECHSECK}#wissenscheck`, `${GF}#fallakte`, `${GF}#haus`]) {
    await oeffne(page, url);
    await expect(page.locator('#modal-title')).toHaveText(url.endsWith('haus') ? 'Das Haus der Geschäftsfähigkeit' : /./);
    const liste = await ueberschriften(page, '#modal');
    expect(liste[0]).toMatchObject({ n: 2 });
    expect(spruenge(liste, 1), url).toEqual([]);
  }
});

test('Icons in Navigation, Kopfleiste und Karten sind für Screenreader ausgeblendet', async ({ page }) => {
  const offen = sel => page.locator(sel).evaluateAll(els => els.filter(e => !e.closest('[aria-hidden="true"]')).map(e => e.textContent.trim()));
  await page.goto('/');
  await expect(page.locator('.topic .ms').first()).toBeAttached();
  expect(await offen('.topic .ms, .wr-facts .ms')).toEqual([]);
  // Die Themenkarte ist ein Link mit kurzem Namen; die ganze Karte bleibt antippbar
  const link = page.getByRole('link', { name: 'Geschäftsfähigkeit', exact: true });
  await expect(link).toHaveAccessibleDescription(/.+/);
  await page.locator('.topic', { has: link }).scrollIntoViewIfNeeded();
  const text = await page.locator('.topic', { has: link }).locator('p').boundingBox();
  await page.mouse.click(text.x + 4, text.y + text.height / 2);
  await expect(page).toHaveURL(/\/geschaeftsfaehigkeit\//);
  for (const url of [`${SECHSECK}#ziele`, `${GF}#regeln`, `${GF}#start`]) {
    await oeffne(page, url);
    await expect(page.locator('#view .card').first()).toBeVisible();
    expect(await offen('.nav-item .ms, .topbar .ms, .card .ms, .dest .ms, .chapter-h .ms'), url).toEqual([]);
    // Jeder Navigationseintrag heißt wie sein Text, ohne Icon-Namen
    const items = page.locator('#rail-items .nav-item');
    for (const [i, text] of (await items.evaluateAll(b => b.map(x => x.lastElementChild.textContent.trim()))).entries())
      await expect(items.nth(i)).toHaveAccessibleName(text);
  }
  await expect(page.locator('#rail-items [data-dest="regeln"]')).toHaveAccessibleName('Regeln');
});

test('Lückentext: richtig und falsch nicht nur über die Farbe', async ({ page }) => {
  await page.goto(`${SECHSECK}#sichern`);
  const box = page.locator('[data-luecken="sichern-heft"]');
  const felder = box.locator('.lt-luecke');
  await felder.nth(0).fill('StabG');
  await felder.nth(1).fill('1968');
  await box.locator('[data-pruefen]').click();
  // Richtig: Häkchen, falsch: Kreuz, gestrichelte Linie und aria-invalid; die Zeichen selbst liest der Screenreader nicht
  await expect(felder.nth(0)).toHaveAttribute('aria-invalid', 'false');
  await expect(felder.nth(1)).toHaveAttribute('aria-invalid', 'true');
  await expect(box.locator('.lt-l').nth(0).locator('.lt-mark')).toHaveText('check');
  await expect(box.locator('.lt-l').nth(1).locator('.lt-mark')).toHaveText('close');
  await expect(box.locator('.lt-mark').first()).toHaveAttribute('aria-hidden', 'true');
  expect(await felder.nth(1).evaluate(f => getComputedStyle(f).borderBottomStyle)).toBe('dashed');
  expect(await felder.nth(0).evaluate(f => getComputedStyle(f).borderBottomStyle)).toBe('solid');
  // Das Ergebnis kommt als Text in einer Live-Region
  const ergebnis = box.locator('[data-ergebnis]');
  await expect(ergebnis).toHaveAttribute('role', 'status');
  await expect(ergebnis).toContainText('falsche Lücken sind mit einem Kreuz markiert');
});

test('Rückmeldungen nach „Prüfen“ werden angesagt: Wissenscheck, Kurztest, Zuordnen', async ({ page }) => {
  await page.goto(`${SECHSECK}#wissenscheck`);
  const a = page.locator('[data-wc="wissenscheck"] .wc-a[data-wc-i="0"]');
  await expect(a.locator('[data-wc-status]')).toHaveAttribute('role', 'status');
  await a.locator('input').first().check();
  await a.locator('[data-wc-pruefen]').press('Enter');
  // Der Fokus springt auf die Rückmeldung, damit sie vorgelesen wird (statt einer zweiten, doppelten Statusansage)
  const fb = a.locator('[data-wc-fb] .fb');
  await expect(fb).toBeFocused();
  await expect(fb).toContainText(/Richtig\.|Teilweise richtig\.|Nicht ganz\./);
  await expect(a.locator('[data-wc-status]')).toHaveText('');

  await oeffne(page, `${SECHSECK}#sichern`);
  const t = page.locator('[data-test="sichern-test"]');
  for (const i of [0, 1, 2, 3]) await t.locator(`input[name="t-sichern-test-${i}"]`).first().check();
  await t.locator('[data-pruefen]').press('Enter');
  await expect(t.locator('[data-ergebnis][role="status"]')).toHaveText(/^\d von 4 richtig$/);
  await expect(t.locator('[data-neu]')).toBeFocused();

  const z = page.locator('[data-zuordnen="sichern-schlagzeilen"]');
  await z.locator('.zu-karte[data-k="0"]').press('Enter');
  await z.locator('.zu-ziel[data-ziel="P"]').press('Enter');
  await expect(z.locator('[data-ergebnis][role="status"]')).toHaveText(/^Karte liegt jetzt bei „.+“\.$/);
  await z.locator('[data-pruefen]').press('Enter');
  await expect(z.locator('[data-ergebnis]')).toHaveText(/von 12 richtig/);
});

test('Tastatur: Schieberegler mit sichtbarem Fokus, Phillips-Jahre und Ecken des Sechsecks', async ({ page }) => {
  await page.goto(`${GF}#alter`);
  const regler = page.locator('#al-r');
  await regler.focus();
  await page.keyboard.press('ArrowRight');
  await expect(regler).toHaveValue('1');
  const rahmen = await regler.evaluate(r => { const s = getComputedStyle(r); return `${s.outlineStyle} ${s.outlineWidth}`; });
  expect(rahmen).toBe('solid 2px');

  // Phillips-Kurve: Jahresleiste statt winziger Punkte, das Ergebnis steht in einer Live-Region
  await oeffne(page, `${SECHSECK}#phillips`);
  const jahr = page.locator('#ph-jahre button', { hasText: '2023' });
  await jahr.focus();
  await page.keyboard.press('Space');
  await expect(jahr).toHaveAttribute('aria-pressed', 'true');
  await expect(jahr).toBeFocused();
  await expect(page.locator('#ph-info')).toHaveAttribute('role', 'status');
  await expect(page.locator('#ph-info')).toContainText('2023');
  // Die Punkte im Diagramm bleiben antippbar und markieren dasselbe Jahr
  const punkt = page.locator('#ph-svg .hexcorner[data-i="0"] circle').first();
  await punkt.evaluate(e => e.scrollIntoView({ block: 'center' }));
  const p = await punkt.boundingBox();
  // knapp neben den sichtbaren Punkt: Der unsichtbare Trefferkreis vergrößert die Klickfläche
  await page.mouse.click(p.x + p.width / 2 + 9, p.y + p.height / 2);
  await expect(page.locator('#ph-jahre button[data-i="0"]')).toHaveAttribute('aria-pressed', 'true');

  // Start-Sechseck: Ecken sind Knöpfe mit sichtbarem Namen am Anfang, Enter öffnet den Steckbrief, Esc führt zurück
  await oeffne(page, SECHSECK);
  await expect(page.locator('#hero-hex svg')).toHaveAttribute('role', 'group');
  const ecke = page.getByRole('button', { name: /^U Umwelt – .*Steckbrief öffnen$/ });
  await ecke.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#modal-title')).toContainText('Steckbrief: Umwelt');
  await page.keyboard.press('Escape');
  await expect(ecke).toBeFocused();
});

test('Bewegung reduzieren: Infopunkte pulsieren nicht, sonst nur kurz', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${SECHSECK}#spiel`);
  await page.locator('.mode-card[data-m="solo"]').click();
  await page.locator('[data-f]').first().click();
  const punkt = page.locator('.photo .hotspot').first();
  expect(await punkt.evaluate(p => getComputedStyle(p, '::after').animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await punkt.evaluate(p => getComputedStyle(p, '::after').animationIterationCount)).toBe('3');
});

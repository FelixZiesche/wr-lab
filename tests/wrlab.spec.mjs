// WR-Lab: Startseite, Navigation zwischen Themen und themenübergreifender Live-Klassenraum.
import { readFile, readdir } from 'node:fs/promises';
import { test, expect, device, readDoc, writeDoc, FIREBASE_VERSION } from './helpers.mjs';

const datei = async f => readFile(new URL(`../${f}`, import.meta.url), 'utf8');
const ICONS = async () => (await datei('public/shared/vendor/fonts/icons.txt')).split('\n').map(z => z.trim()).filter(z => z && !z.startsWith('#'));

test('Firebase-SDK: live.js, package.json und das installierte Paket haben dieselbe Version', async () => {
  // Weicht live.js ab, greift die Umleitung in helpers.mjs nicht mehr, und die Tests laden still das echte SDK
  expect(FIREBASE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  expect(await datei('public/shared/js/live.js'), 'live.js: const V').toContain(`const V = '${FIREBASE_VERSION}';`);
  expect(JSON.parse(await datei('node_modules/firebase/package.json')).version, 'node_modules/firebase (npm ci)').toBe(FIREBASE_VERSION);
});

test('Schriften kommen von der eigenen Seite: icons.txt ist vollständig und fonts.css aktuell', async () => {
  const icons = await ICONS(), css = await datei('public/shared/vendor/fonts/fonts.css');
  expect(css.match(/Icons: ([a-z0-9_,]+)/)?.[1], 'Nach jeder Änderung an icons.txt: npm run schriften').toBe(icons.join(','));
  for (const [, f] of css.matchAll(/url\(([^)]+)\)/g)) expect(await datei(`public/shared/vendor/fonts/${f}`).then(() => true, () => false), f).toBe(true);
  // Jedes fest im Code stehende Icon muss in icons.txt stehen, sonst zeigt die Seite nur seinen Namen
  const benutzt = new Set();
  for (const f of await readdir(new URL('../public/', import.meta.url), { recursive: true })) {
    if (!/\.(html|js|css)$/.test(f) || f.includes('vendor')) continue;
    const t = await datei(`public/${f}`);
    for (const [, i] of t.matchAll(/class="ms[^"]*"[^>]*>([a-z0-9_]+)</g)) benutzt.add(i);
    for (const [, i] of t.matchAll(/content:"([a-z0-9_]+)"/g)) benutzt.add(i);
  }
  expect([...benutzt].filter(i => !icons.includes(i)), 'in icons.txt eintragen, dann npm run schriften').toEqual([]);
});

test('Schriften: keine Anfrage an Google Fonts, Google Sans und Icons sind geladen', async ({ page }) => {
  const fremd = [], icons = await ICONS();
  page.on('request', r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) fremd.push(r.url()); });
  for (const url of ['/', '/sechseck/#preis', '/geschaeftsfaehigkeit/#haus', '/gibtsnicht']) {
    await page.goto(url);
    await expect(page.locator('.ms').first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const geladen = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')));
    expect(geladen, url).toContain('Google Sans');
    expect(geladen, url).toContain('Material Symbols Rounded');
    // Auch Icons, die erst das Skript einsetzt
    const sichtbar = await page.locator('.ms').evaluateAll(els => [...new Set(els.map(e => e.textContent.trim()).filter(Boolean))]);
    expect(sichtbar.filter(i => !icons.includes(i)), url).toEqual([]);
  }
  expect(fremd).toEqual([]);
});

test('Impressum und Datenschutz: von jeder Seite erreichbar, mit Verantwortlichem und ehrlicher Liste der Daten', async ({ page }) => {
  // Von der Startseite, aus einem Thema (auch am Handy unter der Ansicht), von der Fehlerseite und aus dem Lernraum
  await page.goto('/');
  await page.getByRole('link', { name: 'Impressum' }).click();
  await expect(page.locator('h1')).toHaveText('Impressum');
  await expect(page.locator('main')).toContainText('§ 5 DDG');
  await page.getByRole('link', { name: 'Datenschutz' }).click();
  await expect(page.locator('h1')).toHaveText('Datenschutz');
  const text = page.locator('main');
  for (const t of ['Verantwortlich', 'Firebase Hosting', 'localStorage', 'Spitzname', 'Punkte im Wissenscheck, keine Texte', '„Raum beenden“ löscht sofort alle Daten', 'AIS.chat', 'Art. 6 Abs. 1 lit. f DSGVO', 'Thüringer Landesbeauftragten'])
    await expect(text).toContainText(t);
  // Was die Seite nicht tut, steht auch nicht drin: keine Schriften von Google Fonts mehr
  await expect(text).not.toContainText('Google Fonts');
  await page.getByRole('link', { name: 'Zur Startseite', exact: true }).click();
  await expect(page).toHaveTitle('WR-Lab');
  for (const [breite, url] of [[1280, '/sechseck/'], [390, '/geschaeftsfaehigkeit/#faelle']]) {
    await page.setViewportSize({ width: breite, height: 800 });
    await page.goto(url);
    const link = page.locator('.app-foot').getByRole('link', { name: 'Datenschutz' });
    await link.scrollIntoViewIfNeeded();
    await expect(link, url).toBeInViewport();
    await link.click();
    await expect(page.locator('h1')).toHaveText('Datenschutz');
  }
  await page.goto('/gibtsnicht/tief/drin');
  await page.getByRole('link', { name: 'Impressum' }).click();
  await expect(page.locator('h1')).toHaveText('Impressum');
  await page.goto('/sechseck/');
  await page.locator('#btn-raum').click();
  await expect(page.locator('#lr-datenschutz').getByRole('link', { name: 'Mehr zum Datenschutz' })).toHaveAttribute('href', '/datenschutz.html');
});

test('Falsche Adresse: deutsche Fehlerseite mit Weg zur Startseite', async ({ page }) => {
  for (const url of ['/gibtsnicht', '/sechseck/gibts/auch/nicht.html']) {
    const res = await page.goto(url);
    expect(res.status(), url).toBe(404);
    await expect(page).toHaveTitle('Seite nicht gefunden – WR-Lab');
    await expect(page.locator('h1')).toHaveText('Diese Seite gibt es nicht.');
    // Auch tief in einem Ordner: Stil und Icons laden über absolute Pfade
    expect(await page.locator('.wr-logo').evaluate(e => getComputedStyle(e).width), url).toBe('48px');
  }
  await page.getByRole('link', { name: 'Zur Startseite' }).click();
  await expect(page).toHaveTitle('WR-Lab');
});

test('Startseite zeigt die Themen als Karten mit Foto und Bildnachweis', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('WR-Lab');
  const karte = page.locator('.topic', { has: page.locator('a[href="sechseck/"]') });
  await expect(karte).toContainText('Magisches Sechseck');
  await expect(karte.locator('img')).toHaveJSProperty('complete', true);
  expect(await karte.locator('img').evaluate(i => i.naturalWidth)).toBeGreaterThan(0);
  await expect(karte.locator('figcaption')).toHaveText('Foto: Lukas D. / Unsplash');
  // Fußzeile: CC-BY-Foto mit Link zur Datei und zur Lizenz
  const fotos = page.locator('#fotos');
  await expect(fotos).toContainText('Fotos: Andreas Praefcke / Wikimedia Commons, CC BY 3.0 · ');
  await expect(fotos).toContainText(' · Lukas D. / Unsplash');
  await expect(fotos.getByRole('link', { name: 'Andreas Praefcke / Wikimedia Commons' })).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:Jena_Goethe-Galerie_2010_1.jpg');
  await expect(fotos.getByRole('link', { name: 'CC BY 3.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/3.0/');
  await karte.click();
  await expect(page).toHaveURL(/\/sechseck\/(#start)?$/);
  await expect(page.locator('#view-title')).toHaveText('Lernwerkstatt Magisches Sechseck');

  // Zurück zur Startseite über das Logo in der Navigation Rail
  await page.locator('.rail-logo').click();
  await expect(page).toHaveTitle('WR-Lab');
});

test('Startseite sortiert die Themen nach Klassenstufe 9 bis 12', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#themen .wr-stufe-h')).toHaveText(['Klasse 9', 'Klasse 10', 'Klasse 11', 'Klasse 12']);
  const themen = await page.evaluate(async () => (await import('/themen.js')).THEMEN);
  for (const t of themen) {
    expect([9, 10, 11, 12], `Klassenstufe von ${t.id}`).toContain(t.stufe);
    await expect(page.locator(`#klasse-${t.stufe} .topic a[href="${t.id}/"]`)).toBeVisible();
  }
  await expect(page.locator('#klasse-11 .topic a[href="sechseck/"]')).toContainText('Magisches Sechseck');
  // Stufen ohne Thema zeigen einen Hinweis statt einer leeren Fläche
  for (const k of [9, 10, 11, 12]) {
    const n = themen.filter(t => t.stufe === k).length;
    await expect(page.locator(`#klasse-${k} .wr-leer`)).toHaveCount(n ? 0 : 1);
  }
});

test('Auf dem Handy führt das Symbol in der Kopfleiste zur Startseite', async ({ browser }) => {
  const handy = await device(browser, { viewport: { width: 390, height: 844 } });
  await handy.goto('/sechseck/');
  await expect(handy.locator('.rail-logo')).toBeHidden();
  await handy.locator('.home-link').click();
  await expect(handy).toHaveTitle('WR-Lab');
  expect(handy.errors).toEqual([]);
  await handy.context().close();
});

test('Adresse ohne Schrägstrich am Ende funktioniert', async ({ page }) => {
  await page.goto('/sechseck');
  await expect(page.locator('#hero-hex .hexcorner')).toHaveCount(6);
});

test('Live-Raum speichert das Thema, Codes aus anderen Themen werden erkannt', async ({ page, browser }) => {
  await page.goto('/sechseck/#spiel');
  await page.locator('.mode-card[data-m="lk"]').click();
  await page.locator('#mkroom').click();
  await expect(page.locator('.panel .code').first()).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await page.locator('.panel .code').first().textContent()).trim();
  const raum = await readDoc(`rooms/${code}`);
  expect(raum.fields.topic.stringValue).toBe('sechseck');

  // Ein Raum aus einem Thema, das es hier nicht gibt
  await writeDoc('rooms/FREMD2', { owner: 'x', open: true, topic: 'kaufvertrag', gameId: 'g', round: 0, phase: 'lobby', decisions: [] });
  const s = await device(browser);
  await s.goto('/sechseck/#join=FREMD2');
  await s.locator('#jn').fill('Testi');
  await s.locator('#jgo').click();
  await expect(s.locator('#jerr')).toHaveText('Dieser Code gehört zu einem anderen Thema.');
  // Der richtige Code funktioniert weiter
  await s.locator('#jc').fill(code);
  await s.locator('#jgo').click();
  await expect(s.locator('[data-f]')).toHaveCount(8);
  expect(s.errors).toEqual([]);
  await s.context().close();
});

test('Code eines anderen Themas im Lernraum: Hinweis mit Link zum richtigen Thema', async ({ page }) => {
  await writeDoc('rooms/GFRAUM', { owner: 'x', open: true, topic: 'geschaeftsfaehigkeit', phase: 'lobby' });
  await page.goto('/sechseck/#raum=GFRAUM');
  await page.locator('#lr-nick').fill('Testi');
  await page.locator('#lr-jgo').click();
  await expect(page.locator('#lr-jerr')).toContainText('Dieser Code gehört zum Thema „Geschäftsfähigkeit“.');
  await page.locator('#lr-jerr a').click();
  await expect(page).toHaveURL(/\/geschaeftsfaehigkeit\/#raum=GFRAUM$/);
  await expect(page.locator('#lr-code')).toHaveValue('GFRAUM');
});

test('Werkstatt-Fenster: Hintergrund gesperrt, Navigation bedienbar, Fokus kommt zurück', async ({ page }) => {
  await page.goto('/geschaeftsfaehigkeit/#regeln');
  // Gliederung: h1 in der Kopfleiste, h2 für das Kapitel, h3 auf den Karten
  await expect(page.locator('#view .chapter-h h2')).toHaveText('Kapitel 2 – Die Regeln');
  const karte = page.locator('#view [data-tool="haus"]');
  await expect(karte.locator('h3')).toHaveText('Das Haus der Geschäftsfähigkeit');
  await karte.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#modal-close')).toBeFocused();
  // Kopfleiste und Karten hinter dem Fenster sind gesperrt, Shift+Tab führt in die Navigation Rail
  await expect(page.locator('.pane')).toHaveJSProperty('inert', true);
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement.closest('.rail'))).toBe(true);
  // Erkenntnis aufdecken: Der Knopf verschwindet, der Fokus springt auf die Merksätze
  await page.locator('#modal-body [data-erk-btn]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#modal-body [data-erk-body]')).toBeFocused();
  // Zurück per Tastatur: Hintergrund wieder frei, Fokus auf der Karte (auch wenn die Ansicht neu gezeichnet wurde)
  await page.locator('#modal-close').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.pane')).toHaveJSProperty('inert', false);
  await expect(karte).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  await expect(karte).toBeFocused();
  // Das Suchfeld behält den Fokus, den das Fenster beim Öffnen setzt
  await page.locator('#btn-glossar').click();
  await expect(page.locator('#gs')).toBeFocused();
});

test('Planspiel per Tastatur: Fokus springt nach jedem Schritt auf die neue Überschrift', async ({ page }) => {
  await page.goto('/sechseck/#spiel');
  const taste = async sel => { await page.locator(sel).first().focus(); await page.keyboard.press('Enter'); };
  await taste('[data-m="solo"]');
  await expect(page.locator('#view h3', { hasText: 'Wähle deine Figur' })).toBeFocused();
  await taste('[data-f]');
  await expect(page.locator('#view h3').first()).toBeFocused();
  await taste('#go');
  await expect(page.locator('#view h3').first()).toBeFocused();
  await taste('[data-o="A"]');
  await expect(page.locator('#view h3', { hasText: 'Beschluss:' })).toBeFocused();
  await taste('#go');
  await expect(page.locator('#view h3', { hasText: 'Fachbegriff-Check' })).toBeFocused();
  // Nach der Antwort im Check: Fokus auf die Rückmeldung
  await taste('[data-k="0"]');
  await expect(page.locator('#view .fb:not([hidden])')).toBeFocused();
  await taste('#bk');
  await expect(page.locator('#view .task')).toBeFocused();
});

// Material-Symbols-Icons sind Ligaturen: Ohne aria-hidden liest der Screenreader „arrow_forward“ oder „task_alt“ vor.
// Erlaubt sind nur Icons in einem ausgeblendeten Bereich oder in einem Knopf mit aria-label.
const offeneIcons = async page => (await page.locator('.ms').evaluateAll(els => els
  .filter(e => !e.closest('[aria-hidden="true"], button[aria-label], a[aria-label]')).map(e => e.textContent.trim())));

test('Screenreader lesen keine Icon-Namen vor, Themenkarten haben einen kurzen Namen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.topic-link').first()).toBeVisible();
  expect(await offeneIcons(page), 'Startseite').toEqual([]);
  // Der Link einer Themenkarte heißt wie das Thema, die Beschreibung kommt dazu, der Bildnachweis nicht
  const karte = page.getByRole('link', { name: 'Magisches Sechseck', exact: true });
  await expect(karte).toHaveAttribute('href', 'sechseck/');
  await expect(karte).toHaveAccessibleDescription(/Sechseck/);
  for (const thema of ['sechseck', 'geschaeftsfaehigkeit']) {
    await page.goto(`/${thema}/`);
    const ziele = await page.locator('#rail-items [data-dest]').evaluateAll(b => b.map(x => x.dataset.dest));
    for (const z of ziele) {
      await page.locator(`#rail-items [data-dest="${z}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${z}$`));
      expect(await offeneIcons(page), `${thema} #${z}`).toEqual([]);
      for (const id of await page.locator('#view [data-tool]').evaluateAll(els => els.map(e => e.dataset.tool))) {
        await page.locator(`#view [data-tool="${id}"]`).click();
        await expect(page.locator('#modal')).toBeVisible();
        expect(await offeneIcons(page), `${thema} Werkstatt ${id}`).toEqual([]);
        await page.locator('#modal-close').click();
        await expect(page.locator('#modal')).toBeHidden();
      }
    }
  }
  // Lage-Chips im Sechseck: Der Knopf heißt nach dem Ziel, nicht nach der Fotobeschreibung
  await page.goto('/sechseck/');
  await expect(page.locator('.lage .chip[data-k="P"]')).toHaveAccessibleName(/^Preisniveau/);
  // Icons per CSS: leerer Alternativtext, wo sie nur schmücken; richtig und falsch bekommen ein Wort
  const alt = (sel, pseudo) => page.evaluate(([s, p]) => { const el = document.createElement('div'); el.className = s; document.body.append(el); const c = getComputedStyle(el, p).content; el.remove(); return c; }, [sel, pseudo]);
  expect(await alt('task', '::before')).toBe('"assignment" / ""');
  expect(await alt('zu-karte right', '::after')).toBe('"check" / "richtig"');
  expect(await alt('zu-karte wrong', '::after')).toBe('"close" / "falsch"');
});

test('Begriffe nachschlagen: Suche ohne Rücksicht auf Leerzeichen, Bindestriche, Groß- und Kleinschreibung und Umlaute', async ({ page }) => {
  const suche = async (thema, q, begriff) => {
    await page.locator('#gs').fill(q);
    await expect(page.locator('#gl dt').first(), `${thema}: „${q}“`).toHaveText(begriff);
  };
  await page.goto('/sechseck/');
  await page.locator('#btn-glossar').click();
  await suche('sechseck', 'Gini Koeffizient', 'Gini-Koeffizient');
  await suche('sechseck', 'Phillipskurve', 'Phillips-Kurve');
  await suche('sechseck', 'schuldenbremse', 'Schuldenbremse');
  // Treffer im Begriff stehen vor Treffern in der Erklärung
  await page.locator('#gs').fill('Inflation');
  await expect(page.locator('#gl dt', { hasText: 'Inflation / Inflationsrate' })).toHaveCount(1);
  expect(await page.locator('#gl dt').evaluateAll(d => d.map(x => x.textContent.toLowerCase().includes('inflation')).join(''))).toMatch(/^(true)+(false)*$/);
  await suche('sechseck', 'kalte progression', 'Kalte Progression');
  await page.locator('#gs').fill('Wort, das es nicht gibt');
  await expect(page.locator('#gl')).toHaveText('Kein Treffer.');
  await page.goto('/geschaeftsfaehigkeit/');
  await page.locator('#btn-glossar').click();
  await suche('geschaeftsfaehigkeit', 'Geschaftsfahigkeit', 'Geschäftsfähigkeit');
  await suche('geschaeftsfaehigkeit', 'geschaeftsunfaehig', 'Geschäftsunfähig');
  await suche('geschaeftsfaehigkeit', 'Raten', 'Ratenkauf');
});

test('Geschütztes Leerzeichen nach §, Abs., Nr. und Art.: kein Umbruch zwischen Zeichen und Zahl, Eingaben bleiben unverändert', async ({ page }) => {
  await page.goto('/geschaeftsfaehigkeit/#haus');
  await expect(page.locator('#modal')).toBeVisible();
  // Im angezeigten Text steht nach § nie ein normales Leerzeichen vor einer Zahl (auch nicht in später gezeichneten Teilen)
  const offen = () => page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), r = [];let n;
    while ((n = w.nextNode())) if (/(§§?|\bAbs\.|\bNr\.|\bArt\.) \d/.test(n.data) && !n.parentElement.closest('textarea,input,script,style,pre,code')) r.push(n.data.slice(0, 60));
    return r;
  });
  expect(await offen()).toEqual([]);
  expect(await page.locator('#modal-body').evaluate(el => el.textContent.includes('§ 108'))).toBe(true);
  // Locators mit normalem Leerzeichen greifen weiter
  await expect(page.locator('#modal-body').getByText('§ 108 BGB').first()).toBeVisible();
  await page.locator('#modal-close').click();
  await page.locator('#btn-glossar').click();
  await page.locator('#gs').fill('§ 110');
  await expect(page.locator('#gl dt', { hasText: 'Taschengeldparagraf' })).toBeVisible();
  expect(await offen()).toEqual([]);
  // Eingaben behalten das normale Leerzeichen
  expect(await page.locator('#gs').inputValue()).toBe('§ 110');
});

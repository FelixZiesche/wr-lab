// Wissenscheck: alle Aufgabenformate, Feedback ohne KI, Erwartungshorizont erst nach der Antwort, Auswertung,
// Punkte im Lernraum-Dashboard (ohne Texte) und KI-Coach mit AIS.chat-Link.
import { test, expect, device, readDoc, SECHSECK } from './helpers.mjs';

const aufgabe = (page, i) => page.locator(`[data-wc="wissenscheck"] .wc-a[data-wc-i="${i}"]`);

test.describe('ohne Lernraum', () => {
  test.use({ ohneLive: true });

  test('Geschlossene Aufgaben: Erklärung zur falschen Antwort, Erwartungshorizont erst danach, Punkte bleiben gespeichert', async ({ page }) => {
    await page.goto(`${SECHSECK}#wissenscheck`);
    await expect(page.locator('#modal-title')).toHaveText('Wissenscheck');
    const wc = page.locator('[data-wc="wissenscheck"]');
    const a = i => aufgabe(page, i);
    await expect(wc.locator('.wc-a')).toHaveCount(31);
    await expect(wc.locator('.wc-a:visible')).toHaveCount(12);
    await expect(wc.locator('[data-wc-gesamt]')).toHaveText('0 von 64 Punkten');
    // Vor der Antwort kein Erwartungshorizont
    await expect(wc.locator('.wc-eh')).toHaveCount(0);
    await expect(page.getByText('§ 1 StabG nennt')).toHaveCount(0);

    // Auswahl: falsche Antwort mit eigener Erklärung und Link zum Wiederholen
    await expect(a(0).locator('[data-wc-pruefen]')).toBeDisabled();
    await a(0).locator('label', { hasText: 'Grundgesetz' }).click();
    await a(0).locator('[data-wc-pruefen]').click();
    await expect(a(0).locator('.fb')).toContainText('Nicht ganz. Art. 20a GG kam erst 1994');
    await expect(a(0).locator('.wc-eh')).toContainText('§ 1 StabG nennt');
    await expect(a(0).locator('[data-gehzu="grundlagen"]')).toContainText('Sechseck-Baukasten');
    await expect(a(0).locator('input').first()).toBeDisabled();

    // Mehrfachauswahl: drei richtige und eine falsche ergeben die Hälfte der Punkte
    for (const t of ['Stabilität des Preisniveaus', 'Hoher Beschäftigungsstand', 'Außenwirtschaftliches Gleichgewicht', 'Ausgeglichener Staatshaushalt'])
      await a(1).locator('label', { hasText: t }).click();
    await a(1).locator('[data-wc-pruefen]').click();
    await expect(a(1).locator('.fb')).toContainText('Teilweise richtig. Du hast 3 von 4 richtigen Antworten gefunden und mindestens eine falsche angekreuzt.');
    await expect(a(1).locator('.fb')).toContainText('Schuldenbremse');
    await expect(a(1).locator('.wc-eh')).toContainText('1 von 2 Punkten');

    // Zuordnen: eine Karte falsch – volle Punkte gibt es nur, wenn alles stimmt
    const gewaehlt = ['P', 'B', 'W', 'A', 'U', 'V', 'B', 'B'];
    await expect(a(3).locator('[data-wc-pruefen]')).toBeDisabled();
    for (const [j, f] of gewaehlt.entries()) await a(3).locator('select').nth(j).selectOption(f);
    await a(3).locator('[data-wc-pruefen]').click();
    await expect(a(3).locator('.fb')).toContainText('Teilweise richtig. 1 Karte ist falsch zugeordnet (rot markiert).');
    await expect(a(3).locator('.wc-zu-k.right')).toHaveCount(7);
    await expect(a(3).locator('.wc-zu-k.wrong')).toContainText('Armutsgefährdungsquote');
    await expect(a(3).locator('.wc-eh')).toContainText('1,5 von 2 Punkten');
    await expect(a(3).locator('[data-gehzu="verteilung"]')).toBeVisible();
    await a(4).locator('label', { hasText: 'falsch' }).click();
    await a(4).locator('[data-wc-pruefen]').click();
    await expect(a(4).locator('.fb')).toContainText('Richtig.');
    await expect(wc.locator('[data-wc-n="1"]')).toHaveText('4/12');
    await expect(wc.locator('[data-wc-gesamt]')).toHaveText('3,5 von 64 Punkten');

    // Anwenden: Rechnen mit typischem Fehler, Komma und Prozentzeichen
    await wc.locator('.wc-tabs [data-wc-tab="2"]').click();
    await expect(a(12)).toBeVisible();
    await expect(a(0)).toBeHidden();
    await a(12).locator('input').fill('16,50');
    await a(12).locator('[data-wc-pruefen]').click();
    await expect(a(12).locator('.fb')).toContainText('16,50 € ist der Preisanstieg in Euro');
    await expect(a(12).locator('.wc-eh')).toContainText('3,3 %');
    await a(13).locator('input').fill('28,6 %');
    await a(13).locator('input').press('Enter');
    await expect(a(13).locator('.fb')).toContainText('Richtig.');

    // Reihenfolge mit den Pfeilen sortieren
    const schritte = ['Die EZB erhöht den Leitzins.', 'Banken verlangen', 'Haushalte und Unternehmen', 'Die Nachfrage nach Gütern sinkt.', 'Die Preise steigen langsamer'];
    for (const [ziel, text] of schritte.entries()) {
      let pos = (await a(20).locator('.wc-schritt').allInnerTexts()).findIndex(t => t.includes(text));
      while (pos > ziel) { await a(20).locator(`[data-hoch="${pos}"]`).click(); pos--; }
    }
    await a(20).locator('[data-wc-pruefen]').click();
    await expect(a(20).locator('.fb')).toContainText('Richtig.');
    await expect(a(20).locator('.wc-schritt.right')).toHaveCount(5);

    // Nach dem Neuladen: gleiche Stufe, gleiche Antworten, gleiche Punkte
    await page.reload();
    await expect(aufgabe(page, 13)).toBeVisible();
    await expect(aufgabe(page, 13).locator('.fb')).toContainText('Richtig.');
    await expect(page.locator('[data-wc-gesamt]')).toHaveText('7,5 von 64 Punkten');
  });

  test('Offene Aufgabe: Feedback ohne KI, Erwartungshorizont abhaken, überarbeiten; Auswertung, wiederholen, neu starten', async ({ page }) => {
    await page.goto(`${SECHSECK}#wissenscheck`);
    const wc = page.locator('[data-wc="wissenscheck"]');
    const a = i => aufgabe(page, i);
    await wc.locator('.wc-tabs [data-wc-tab="3"]').click();
    const w = a(27); // Windpark bei Bad Berka
    await w.locator('summary', { hasText: 'Was heißt „beurteilen“?' }).click();
    await expect(w).toContainText('begründeten Urteil');
    await expect(w.locator('[data-wc-ki]')).toBeHidden();

    // Kurze Antwort: Hinweise, aber keine Lösung
    await w.locator('textarea').fill('Der Windpark ist gut fürs Klima.');
    await w.locator('[data-wc-hinweis]').click();
    const h = w.locator('[data-wc-hinweise]');
    await expect(h).toContainText('Deine Antwort ist noch sehr kurz');
    await expect(h).toContainText('Welche Ziele des Sechsecks sind betroffen?');
    await expect(h).toContainText('ohne KI');
    await expect(h).not.toContainText('Wägt Pro und Contra ab');
    await expect(w.locator('.wc-eh')).toHaveCount(0);

    // Ausführliche Antwort: alles erkannt, Erwartungshorizont vorausgefüllt
    await w.locator('textarea').fill('Betroffen sind der Klimaschutz, weil Windräder CO2 sparen, und das Wachstum, weil die Gemeinde Einnahmen bekommt. Die Ziele stehen hier in Harmonie. Allerdings stört der Lärm die Anwohner. Insgesamt halte ich das Projekt für sinnvoll, weil der Nutzen für Klima und Gemeinde überwiegt.');
    await w.locator('[data-wc-hinweis]').click();
    await expect(h).toContainText('Sieht vollständig aus');
    await expect(h).toContainText('Das steckt schon drin');
    await w.locator('[data-wc-fertig]').click();
    await expect(h).toBeHidden();
    const haken = w.locator('[data-wc-fb] input[type=checkbox]');
    await expect(haken).toHaveCount(4);
    for (let j = 0; j < 4; j++) await expect(haken.nth(j)).toBeChecked();
    await expect(w.locator('[data-wc-punkte]')).toHaveText('4 von 4 Punkten (Selbsteinschätzung)');
    await expect(w.locator('textarea')).toHaveAttribute('readonly', '');
    await haken.nth(2).uncheck();
    await expect(w.locator('[data-wc-punkte]')).toHaveText('3 von 4 Punkten (Selbsteinschätzung)');
    await w.locator('summary', { hasText: 'Beispiel für eine gelungene Antwort' }).click();
    await expect(w).toContainText('Insgesamt halte ich das Projekt für sinnvoll, weil der Nutzen für Klima und Gemeinde überwiegt. Die Anwohner');

    // Überarbeiten und erneut abschließen
    await w.locator('[data-wc-ueberarbeiten]').click();
    await expect(w.locator('textarea')).not.toHaveAttribute('readonly', '');
    await w.locator('[data-wc-fertig]').click();
    await expect(w.locator('[data-wc-punkte]')).toHaveText('4 von 4 Punkten (Selbsteinschätzung)');

    // Eine falsche Auswahl in Stufe III
    await a(25).locator('label', { hasText: 'kein Ziel des Sechsecks' }).click();
    await a(25).locator('[data-wc-pruefen]').click();
    await expect(a(25).locator('.fb')).toContainText('Doch: Ein hoher Beschäftigungsstand');

    // Auswertung
    await wc.locator('.wc-tabs [data-wc-tab="0"]').click();
    const aus = wc.locator('[data-wc-stufe="0"]');
    await expect(aus).toContainText('4 von 22 Punkten · 2/6 bearbeitet');
    await expect(aus).toContainText('Gesamt: 4 von 64 Punkten (6 %)');
    await expect(aus).toContainText('Noch 29 Aufgaben sind offen.');
    await expect(aus).toContainText('Tipp für „Beurteilen“');

    // Neu starten (mit Rückfrage)
    await aus.locator('[data-wc-neu]').click();
    await aus.locator('[data-wc-neu-n]').click();
    await expect(wc.locator('[data-wc-gesamt]')).toHaveText('4 von 64 Punkten');

    // „Wiederholen“ öffnet die passende Werkstatt
    await aus.locator('[data-gehzu="politik"]').click();
    await expect(page.locator('#modal-title')).toHaveText('Wirtschaftspolitik-Simulator');

    // Zurück: Die Auswertung bleibt die zuletzt gewählte Ansicht, dann neu starten
    await page.goto(`${SECHSECK}#wissenscheck`);
    await page.reload();
    await expect(page.locator('[data-wc-stufe="0"]')).toBeVisible();
    await page.locator('[data-wc-neu]').click();
    await page.locator('[data-wc-neu-y]').click();
    await expect(page.locator('[data-wc-gesamt]')).toHaveText('0 von 64 Punkten');
    await expect(aufgabe(page, 0)).toBeVisible();
    await expect(aufgabe(page, 0).locator('input:checked')).toHaveCount(0);
  });
});

test('Lernraum: Punkte pro Stufe im Dashboard, keine Texte; KI-Coach mit AIS.chat-Link', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await lk.goto(SECHSECK);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  const wcBox = lk.locator('#lr-wc');
  await expect(wcBox).toContainText('Sobald die Schüler im Wissenscheck Aufgaben prüfen');

  // Schüler am Handy; window.open und die Zwischenablage werden mitgeschnitten
  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.addInitScript(() => {
    window.__geoeffnet = []; window.__kopiert = [];
    window.open = url => { window.__geoeffnet.push(url); return null; };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { window.__kopiert.push(t); return Promise.resolve(); } } });
  });
  await s.goto(`${SECHSECK}#raum=${code}`);
  await s.locator('#lr-nick').fill('Mia');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText('Du bist im Lernraum');
  await s.locator('#modal-close').click();
  await s.locator('#nav-bar [data-dest="wissen"]').click();
  await s.locator('#view [data-tool="wissenscheck"]').click();
  const a = i => aufgabe(s, i);
  await a(0).locator('label', { hasText: 'Stabilitäts- und Wachstumsgesetz' }).click();
  await a(0).locator('[data-wc-pruefen]').click();
  await a(2).locator('label', { hasText: 'geheim' }).click();
  await a(2).locator('[data-wc-pruefen]').click();

  // Dashboard: Grundlagen zu 50 %, schwierigste Aufgabe, Tabelle mit Spitzname
  await expect(wcBox).toContainText('1 von 1 haben Aufgaben bearbeitet');
  await expect(wcBox.locator('.wc-erg').first()).toContainText('50 % · 2 Bearbeitungen');
  await expect(wcBox).toContainText('Am schwierigsten');
  await expect(wcBox).toContainText('Aufgabe 3: Warum heißt das Sechseck');
  await expect(wcBox.locator('tr', { hasText: 'Mia' })).toContainText('50 %');
  // In der Datenbank stehen nur Punkte, ein Zeichen pro Aufgabe
  const uid = await s.evaluate(async () => (await import('/shared/js/lernraum.js')).raum.live().uid);
  const eintrag = await readDoc(`rooms/${code}/players/${uid}`);
  expect(eintrag.fields.wc.stringValue).toBe('a-0' + '-'.repeat(28));
  // Beamer-Modus: keine Spitznamen
  await lk.locator('#lr-beamer').click();
  await expect(wcBox.locator('table')).toHaveCount(0);
  await expect(wcBox).not.toContainText('Mia');
  await lk.locator('#lr-beamer').click();

  // KI-Coach: erst mit Link sichtbar
  await s.locator('[data-wc="wissenscheck"] .wc-tabs [data-wc-tab="2"]').click();
  await expect(a(23)).toBeVisible();
  await expect(a(23).locator('[data-wc-ki]')).toBeHidden();
  await lk.locator('#lr-ki-link').fill('http://unsicher.example/szenario');
  await lk.locator('#lr-ki-ok').click();
  await expect(lk.locator('#lr-ki-st')).toContainText('beginnt mit https://');
  await lk.locator('#lr-ki-link').fill('https://ais.example/lernszenario/abc');
  await lk.locator('#lr-ki-ok').click();
  await expect(lk.locator('#lr-ki-st')).toContainText('Gespeichert');
  await expect(a(23).locator('[data-wc-ki]')).toBeVisible();
  await a(23).locator('[data-wc-ki]').click();
  await expect(a(23).locator('[data-wc-status]')).toHaveText('Schreib zuerst eine Antwort.');
  await a(23).locator('textarea').fill('Die Preise steigen schneller als die Vergütung.');
  await a(23).locator('[data-wc-ki]').click();
  await expect(a(23).locator('[data-wc-status]')).toContainText('Deine Antwort ist kopiert');
  expect(await s.evaluate(() => window.__geoeffnet)).toEqual(['https://ais.example/lernszenario/abc']);
  const kopiert = await s.evaluate(() => window.__kopiert[0]);
  expect(kopiert).toContain('Aufgabe 24 (Anwenden, Operator: erklären)');
  expect(kopiert).toContain('Meine Antwort:\nDie Preise steigen schneller als die Vergütung.');
  await lk.locator('#lr-ki-weg').click();
  await expect(a(23).locator('[data-wc-ki]')).toBeHidden();

  // Lehrerpanel: Anweisung für AIS.chat kopieren
  await lk.locator('#modal-close').click();
  await lk.locator('#rail-items [data-dest="wissen"]').click();
  await lk.locator('#view [data-tool="wissenscheck"]').click();
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').first().click();
  await expect(panel).toContainText('KI-Coach mit AIS.chat');
  await expect(panel).toContainText('Abschluss der Reihe');
  await expect(lk.locator('#ki-wissenscheck')).toContainText('Aufgabe 28 (Anforderungsbereich III, Operator: beurteilen)');
  await panel.locator('[data-kopiere="#ki-wissenscheck"]').click();
  await expect(lk.locator('#snackbar')).toHaveText('Kopiert.');
  expect(await lk.evaluate(() => navigator.clipboard.readText())).toContain('Du bist ein freundlicher Feedback-Coach für Schüler der Klasse 11');
  // Schüler sehen weder Lehrerpanel noch die Anweisung
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  await expect(s.locator('#ki-wissenscheck')).toHaveCount(0);

  expect(s.errors).toEqual([]);
  await s.context().close();
});

// Gilt für jedes Thema mit <id>/wissenscheck.js: Regeln aus CLAUDE.md und Stimmigkeit der Lösungen
test('Inhalte aller Wissenschecks: mindestens 20 Aufgaben, alle Stufen, 5 Formate, Lösungen passen zum Erwartungshorizont', async ({ page }) => {
  await page.goto('/');
  const berichte = await page.evaluate(async () => {
    const F = await import('/shared/js/feedback.js');
    const { THEMEN } = await import('/themen.js');
    const out = [];
    for (const t of THEMEN) {
      let W;
      try { ({ WISSENSCHECK: W } = await import(`/${t.id}/wissenscheck.js`)); } catch (e) { out.push({ id: t.id, fehlt: true }); continue; }
      const fehler = [];
      W.aufgaben.forEach((a, i) => {
        const n = `${t.id}, Aufgabe ${i + 1}`;
        if (![1, 2, 3].includes(a.afb)) fehler.push(`${n}: afb fehlt`);
        if (a.art === 'offen') {
          if (!F.OPERATOREN[a.op]) fehler.push(`${n}: unbekannter Operator ${a.op}`);
          if (!a.muster) fehler.push(`${n}: Musterlösung fehlt`);
          else { const r = F.textFeedback({ text: a.muster, op: a.op, erwartung: a.erwartung }); if (r.fehlt.length || r.tipps.length) fehler.push(`${n}: Musterlösung erfüllt den Erwartungshorizont nicht: ${r.tipps.join(' | ')}`); }
          if (a.erwartung.some(e => !e.tipp)) fehler.push(`${n}: Erwartung ohne Tipp`);
        }
        if (a.art === 'zahl') {
          if (!F.zahlFeedback(a.r, a).richtig) fehler.push(`${n}: Lösung gilt nicht als richtig`);
          (a.fehler || []).forEach(f => { if (F.zahlFeedback(f.wert, a).richtig) fehler.push(`${n}: typischer Fehler ${f.wert} gilt als richtig`); });
        }
        if (a.art === 'wahl' && !(a.r >= 0 && a.r < a.o.length)) fehler.push(`${n}: r außerhalb`);
        if (a.art === 'mehrfach' && a.r.some(j => j >= a.o.length)) fehler.push(`${n}: r außerhalb`);
        if (a.art === 'wahl' && a.fehler && a.fehler[a.r]) fehler.push(`${n}: Fehlertext an der richtigen Antwort`);
        if (a.art === 'zuordnen' && a.karten.some(k => !a.faecher.some(f => f.id === k.f))) fehler.push(`${n}: Karte ohne passendes Fach`);
        if (['wahl', 'mehrfach', 'richtigfalsch', 'zahl', 'reihe', 'zuordnen'].includes(a.art) && !a.e) fehler.push(`${n}: Erklärung e fehlt`);
      });
      out.push({ id: t.id, n: W.aufgaben.length, stufen: [1, 2, 3].map(s => W.aufgaben.filter(a => a.afb === s).length), formate: new Set(W.aufgaben.map(a => a.art)).size, fehler });
    }
    return out;
  });
  for (const b of berichte) {
    expect(b.fehlt, `${b.id}: wissenscheck.js fehlt`).toBeUndefined();
    expect(b.fehler, b.id).toEqual([]);
    expect(b.n, `${b.id}: Aufgaben`).toBeGreaterThanOrEqual(20);
    expect(b.stufen.every(x => x > 0), `${b.id}: alle drei Stufen`).toBe(true);
    expect(b.formate, `${b.id}: Formate`).toBeGreaterThanOrEqual(5);
  }
});

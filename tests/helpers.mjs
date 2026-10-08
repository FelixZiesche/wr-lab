// Gemeinsame Hilfen für die Playwright-Tests.
// Die Tests laufen gegen den Firebase-Emulator (Projekt demo-wr-lab), siehe package.json.
import { test as base, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export { expect };
export const SECHSECK = '/sechseck/';
export const PROJECT = 'demo-wr-lab';
export const FIRESTORE = 'http://127.0.0.1:8080';

// Die Firebase-Bibliothek kommt im Test aus dem npm-Paket (dieselbe Version wie auf gstatic.com).
// So hängen die Tests nicht davon ab, ob gstatic.com erreichbar ist.
const SDK = /^https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+\.js)$/;

/** Bereitet einen Browser-Kontext vor. offline: true simuliert eine Seite ohne Live-Klassenraum. */
export async function prepare(context, { offline = false } = {}) {
  await context.route(SDK, async route => {
    if (offline) return route.abort();
    const file = SDK.exec(route.request().url())[1];
    await route.fulfill({ contentType: 'text/javascript', body: await readFile(path.join(root, 'node_modules/firebase', file)) });
  });
}

/** Merkt sich JavaScript-Fehler einer Seite, damit der Test daran scheitert. */
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  return errors;
}

/** Öffnet einen weiteren, unabhängigen Browser (eigenes Gerät, eigene anonyme Anmeldung). */
export async function device(browser, opts = {}) {
  const context = await browser.newContext(opts.viewport ? { viewport: opts.viewport } : {});
  await prepare(context, opts);
  const page = await context.newPage();
  page.errors = trackErrors(page);
  return page;
}

export const test = base.extend({
  ohneLive: [false, { option: true }],
  context: async ({ context, ohneLive }, use) => {
    await prepare(context, { offline: ohneLive });
    await use(context);
  },
  page: async ({ page }, use) => {
    const errors = trackErrors(page);
    await use(page);
    expect(errors, 'JavaScript-Fehler auf der Seite').toEqual([]);
  }
});

/** Liest ein Dokument direkt aus dem Emulator (an den Regeln vorbei). */
export async function readDoc(docPath) {
  const res = await fetch(`${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents/${docPath}`,
    { headers: { Authorization: 'Bearer owner' } });
  return res.status === 404 ? null : res.json();
}

/** Schreibt ein Dokument direkt in den Emulator (an den Regeln vorbei). Nur einfache Werte. */
export async function writeDoc(docPath, data) {
  const toValue = v => typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v }
    : Number.isInteger(v) ? { integerValue: String(v) } : Array.isArray(v) ? { arrayValue: { values: v.map(toValue) } } : { nullValue: null };
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toValue(v)]));
  const res = await fetch(`${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents/${docPath}`,
    { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
  if (!res.ok) throw new Error(`writeDoc ${res.status}`);
}

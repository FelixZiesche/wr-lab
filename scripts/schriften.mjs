// Lädt die Schriften einmalig von Google Fonts nach public/shared/vendor/fonts/.
// Die Seite liefert sie dann selbst aus: Beim Aufruf geht keine Verbindung (und keine IP-Adresse) an Google.
// Aufruf: npm run schriften – nach jedem neuen Icon in public/shared/vendor/fonts/icons.txt
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ZIEL = new URL('../public/shared/vendor/fonts/', import.meta.url);
// Ein aktueller Chrome bekommt woff2 mit unicode-range
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
// Untermengen für deutsche Texte, €, „“, →, ≈, CO₂ – andere Schriftsysteme braucht WR-Lab nicht
const TEILE = ['latin', 'latin-ext', 'math', 'symbols'];

const icons = readFileSync(new URL('icons.txt', ZIEL), 'utf8').split('\n').map(z => z.trim()).filter(z => z && !z.startsWith('#'));
const falsch = icons.filter(i => !/^[a-z0-9_]+$/.test(i));
if (falsch.length) throw new Error(`Ungültige Icon-Namen in icons.txt: ${falsch.join(', ')}`);
if (icons.join() !== [...new Set(icons)].sort().join()) throw new Error('icons.txt muss alphabetisch sortiert sein und darf keinen Namen doppelt enthalten.');

const API = 'https://fonts.googleapis.com/css2?family=';
const SCHRIFTEN = [
  { name: 'google-sans', url: `${API}Google+Sans:wght@400;500;600;700&display=swap` },
  { name: 'google-sans-code', url: `${API}Google+Sans+Code:wght@400;600&display=swap` },
  { name: 'material-symbols-rounded', url: `${API}Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${icons.join(',')}&display=block` },
];
const LIZENZEN = {
  'OFL-GoogleSans.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/googlesans/OFL.txt',
  'OFL-GoogleSansCode.txt': 'https://raw.githubusercontent.com/google/fonts/main/ofl/googlesanscode/OFL.txt',
  'LICENSE-MaterialSymbols.txt': 'https://raw.githubusercontent.com/google/material-design-icons/master/LICENSE',
};

const laden = async (url, art) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} bei ${url}`);
  return art === 'bin' ? Buffer.from(await r.arrayBuffer()) : r.text();
};

for (const f of readdirSync(ZIEL)) if (f.endsWith('.woff2')) rmSync(new URL(f, ZIEL));
const css = [], dateien = new Map();
for (const s of SCHRIFTEN) {
  // Google liefert pro Untermenge einen Block „/* latin */ @font-face {…}“, Material Symbols nur einen Block ohne Kommentar
  const bloecke = (await laden(s.url)).match(/(\/\* [\w-]+ \*\/\s*)?@font-face\s*\{[^}]*\}/g) || [];
  for (const b of bloecke) {
    const teil = b.match(/^\/\* ([\w-]+) \*\//)?.[1];
    if (teil && !TEILE.includes(teil)) continue;
    const url = b.match(/url\(([^)]+)\)/)[1];
    if (!dateien.has(url)) {
      // Kurzer Inhalts-Hash im Namen: Ändert sich die Schrift (z. B. neue Icons), lädt der Browser sie neu
      const daten = await laden(url, 'bin');
      const datei = `${s.name}${teil ? '-' + teil : ''}-${createHash('sha256').update(daten).digest('hex').slice(0, 8)}.woff2`;
      writeFileSync(new URL(datei, ZIEL), daten);
      dateien.set(url, datei);
    }
    css.push(`/* ${s.name}${teil ? ' ' + teil : ''} */\n` + b.replace(/^\/\* [\w-]+ \*\/\s*/, '').replace(url, dateien.get(url)));
  }
}
for (const [datei, url] of Object.entries(LIZENZEN)) writeFileSync(new URL(datei, ZIEL), await laden(url));

writeFileSync(new URL('fonts.css', ZIEL), `/* Schriften für WR-Lab, selbst ausgeliefert: Beim Laden der Seite geht keine Anfrage an Google.
   Erzeugt mit scripts/schriften.mjs (npm run schriften), bitte nicht von Hand ändern.
   Google Sans und Google Sans Code: SIL Open Font License 1.1 (OFL-GoogleSans.txt, OFL-GoogleSansCode.txt)
   Material Symbols Rounded: Apache License 2.0 (LICENSE-MaterialSymbols.txt)
   Icons: ${icons.join(',')} */
${css.join('\n')}
`);
console.log(`${dateien.size} Schriftdateien und ${icons.length} Icons nach public/shared/vendor/fonts/ geschrieben.`);

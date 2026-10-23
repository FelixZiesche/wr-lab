// WR-Lab-Startseite: zeigt alle Themen aus themen.js als Fotokarten, nach Klassenstufe sortiert, mit Filter nach Klasse und Bereich.
import { esc } from './shared/js/ui.js';
import { THEMEN } from './themen.js';

const STUFEN = [9, 10, 11, 12];
const BEREICHE = { VWL: ['Volkswirtschaft', 'account_balance'], BWL: ['Betriebswirtschaft', 'storefront'], Recht: ['Recht', 'gavel'] };
const liste = [...THEMEN].sort((a, b) => a.stufe - b.stufe);
const filter = { k: 0, b: '' };   // 0 bzw. '' heißt „Alle“

// Barrierefrei als Karte mit einem Link: Der Link sitzt im Titel (kurzer Name, Beschreibung per aria-describedby)
// und deckt über ::after die ganze Karte ab, damit sie überall antippbar bleibt (m3.css .topic-link).
// Die ersten Fotos sind sofort zu sehen und laden deshalb gleich, alle anderen erst beim Hinscrollen.
const karte = (t, i) => `<article class="st-card topic" data-k="${t.stufe}" data-b="${esc(t.bereich)}">
  <figure><img src="${t.bild}" alt="${esc(t.alt)}" ${i > 3 ? 'loading="lazy"' : ''}><figcaption>Foto: ${esc(t.foto)}</figcaption></figure>
  <div class="st-badges"><span>Klasse ${t.stufe}</span><span class="${t.bereich.toLowerCase()}"><span class="ms sm" aria-hidden="true">${BEREICHE[t.bereich][1]}</span>${esc(t.bereich)}</span></div>
  <div class="st-card-in">
    <h3><a class="topic-link" href="${t.id}/" aria-describedby="thema-${t.id}-d">${esc(t.titel)}</a></h3>
    <p id="thema-${t.id}-d">${esc(t.text)}</p>
    <span class="go" aria-hidden="true">Thema öffnen<span class="ms sm">arrow_forward</span></span>
  </div>
</article>`;
const leer = k => `<div class="wr-leer" data-k="${k}"><span class="ms" aria-hidden="true">schedule</span><b class="title-m">Klasse ${k}</b><span class="small">Hier kommen bald Themen dazu.</span></div>`;

// Nach Klassenstufe sortiert; eine Stufe ohne Thema zeigt einen Platzhalter an ihrer Stelle
const grid = document.getElementById('themen-liste');
grid.innerHTML = STUFEN.map(k => {
  const t = liste.filter(x => x.stufe === k);
  return t.length ? t.map(x => karte(x, liste.indexOf(x))).join('') : leer(k);
}).join('') + `<div class="wr-leer st-keins" hidden><span class="ms" aria-hidden="true">search</span><b class="title-m">Dazu gibt es noch kein Thema</b>
  <button class="btn" type="button" id="filter-weg">Alle Themen zeigen</button></div>`;

const chip = (art, wert, text) => `<button class="btn" type="button" aria-pressed="false" data-${art}="${wert}">${text}</button>`;
document.getElementById('filter-k').insertAdjacentHTML('beforeend', chip('fk', 0, 'Alle') + STUFEN.map(k => chip('fk', k, k)).join(''));
document.getElementById('filter-b').insertAdjacentHTML('beforeend', chip('fb', '', 'Alle')
  + Object.entries(BEREICHE).map(([b, [lang]]) => chip('fb', b, b === lang ? b : `<abbr title="${lang}">${b}</abbr>`)).join(''));

function zeige() {
  let n = 0;
  for (const el of grid.querySelectorAll('[data-k]')) {
    const passt = (!filter.k || +el.dataset.k === filter.k) && (el.classList.contains('topic') ? !filter.b || el.dataset.b === filter.b : !filter.b);
    el.hidden = !passt;
    if (passt && el.classList.contains('topic')) n++;
  }
  grid.querySelector('.st-keins').hidden = !!grid.querySelector('[data-k]:not([hidden])');
  for (const b of document.querySelectorAll('[data-fk]')) b.setAttribute('aria-pressed', +b.dataset.fk === filter.k);
  for (const b of document.querySelectorAll('[data-fb]')) b.setAttribute('aria-pressed', b.dataset.fb === filter.b);
  document.getElementById('themen-anzahl').textContent = `${n} ${n === 1 ? 'Thema' : 'Themen'}`;
}
document.querySelector('.st-filter').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('fk' in b.dataset) filter.k = +b.dataset.fk; else filter.b = b.dataset.fb;
  zeige();
});
document.getElementById('filter-weg').addEventListener('click', () => {
  filter.k = 0; filter.b = '';
  zeige();
  document.querySelector('[data-fk="0"]').focus();
});

// Adressen wie #klasse-10 (Links in der Kopfleiste) setzen den Klassenfilter und springen zu den Themen
function ausAdresse() {
  const m = location.hash.match(/^#klasse-(\d+)$/);
  if (!m || !STUFEN.includes(+m[1])) return;
  filter.k = +m[1]; filter.b = '';
  zeige();
  document.getElementById('themen').scrollIntoView();
}
addEventListener('hashchange', ausAdresse);
zeige();
ausAdresse();

// Bildnachweise; bei CC-Lizenzen mit Link zur Datei und zur Lizenz (in der Karte nur Text, weil die Karte selbst ein Link ist)
const nachweis = t => {
  if (!t.fotoLink) return esc(t.foto);
  const [wer, lizenz] = t.foto.split(', ');
  const link = (href, text) => `<a href="${esc(href)}" rel="noopener" target="_blank">${esc(text)}</a>`;
  return lizenz && t.lizenzLink ? `${link(t.fotoLink, wer)}, ${link(t.lizenzLink, lizenz)}` : link(t.fotoLink, t.foto);
};
document.getElementById('fotos').innerHTML = 'Fotos: ' + THEMEN.map(nachweis).join(' · ');

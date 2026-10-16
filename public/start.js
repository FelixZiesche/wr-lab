// WR-Lab-Startseite: zeigt alle Themen aus themen.js als Karten, nach Klassenstufe sortiert.
import { esc } from './shared/js/ui.js';
import { THEMEN } from './themen.js';

const STUFEN = [9, 10, 11, 12];

// Barrierefrei als Karte mit einem Link: Der Link sitzt im Titel (kurzer Name, Beschreibung per aria-describedby)
// und deckt über ::after die ganze Karte ab, damit sie überall antippbar bleibt (m3.css .topic-link).
// Das Foto der ersten Karte ist sofort zu sehen und lädt deshalb gleich, alle anderen erst beim Hinscrollen.
let nr = 0;
const karte = t => `<article class="topic">
  <figure class="topic-img"><img src="${t.bild}" alt="${esc(t.alt)}" ${nr++ ? 'loading="lazy"' : 'loading="eager" fetchpriority="high"'}><figcaption>Foto: ${esc(t.foto)}</figcaption></figure>
  <div class="topic-body">
    <span class="eyebrow">${esc(t.bereich)}</span>
    <h4 class="title-l"><a class="topic-link" href="${t.id}/" aria-describedby="thema-${t.id}-d">${esc(t.titel)}</a></h4>
    <p class="body-m muted" id="thema-${t.id}-d">${esc(t.text)}</p>
    <ul class="topic-tags">${t.stichworte.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <span class="go" aria-hidden="true">Thema öffnen<span class="ms sm">arrow_forward</span></span>
  </div>
</article>`;

document.getElementById('themen').innerHTML = STUFEN.map(k => {
  const liste = THEMEN.filter(t => t.stufe === k);
  return `<section class="wr-stufe" id="klasse-${k}" aria-labelledby="klasse-${k}-h">
  <h3 class="title-l wr-stufe-h" id="klasse-${k}-h">Klasse ${k}</h3>
  ${liste.length ? `<div class="wr-topics">${liste.map(karte).join('')}</div>`
    : '<p class="wr-leer body-m"><span class="ms sm" aria-hidden="true">schedule</span>Hier kommen bald Themen dazu.</p>'}
</section>`;
}).join('');

// Bildnachweise; bei CC-Lizenzen mit Link zur Datei und zur Lizenz (in der Karte nur Text, weil die Karte selbst ein Link ist)
const nachweis = t => {
  if (!t.fotoLink) return esc(t.foto);
  const [wer, lizenz] = t.foto.split(', ');
  const link = (href, text) => `<a href="${esc(href)}" rel="noopener" target="_blank">${esc(text)}</a>`;
  return lizenz && t.lizenzLink ? `${link(t.fotoLink, wer)}, ${link(t.lizenzLink, lizenz)}` : link(t.fotoLink, t.foto);
};
document.getElementById('fotos').innerHTML = 'Fotos: ' + THEMEN.map(nachweis).join(' · ');

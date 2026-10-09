// WR-Lab-Startseite: zeigt alle Themen aus themen.js als Karten, nach Klassenstufe sortiert.
import { esc } from './shared/js/ui.js';
import { THEMEN } from './themen.js';

const STUFEN = [9, 10, 11, 12];

const karte = t => `<a class="topic" href="${t.id}/">
  <figure class="topic-img"><img src="${t.bild}" alt="${esc(t.alt)}" loading="lazy"><figcaption>Foto: ${esc(t.foto)}</figcaption></figure>
  <div class="topic-body">
    <span class="eyebrow">${esc(t.bereich)}</span>
    <h4 class="title-l">${esc(t.titel)}</h4>
    <p class="body-m muted">${esc(t.text)}</p>
    <ul class="topic-tags">${t.stichworte.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <span class="go">Thema öffnen<span class="ms sm">arrow_forward</span></span>
  </div>
</a>`;

document.getElementById('themen').innerHTML = STUFEN.map(k => {
  const liste = THEMEN.filter(t => t.stufe === k);
  return `<section class="wr-stufe" id="klasse-${k}" aria-labelledby="klasse-${k}-h">
  <h3 class="title-l wr-stufe-h" id="klasse-${k}-h">Klasse ${k}</h3>
  ${liste.length ? `<div class="wr-topics">${liste.map(karte).join('')}</div>`
    : '<p class="wr-leer body-m"><span class="ms sm" aria-hidden="true">schedule</span>Hier kommen bald Themen dazu.</p>'}
</section>`;
}).join('');

document.getElementById('fotos').textContent = 'Fotos: ' + THEMEN.map(t => t.foto).join(', ') + ' (Unsplash-Lizenz)';

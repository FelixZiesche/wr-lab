// WR-Lab-Startseite: zeigt alle Themen aus themen.js als Karten.
import { esc } from './shared/js/ui.js';
import { THEMEN } from './themen.js';

document.getElementById('themen').innerHTML = THEMEN.map(t => `<a class="topic" href="${t.id}/">
  <figure class="topic-img"><img src="${t.bild}" alt="${esc(t.alt)}" loading="lazy"><figcaption>Foto: ${esc(t.foto)}</figcaption></figure>
  <div class="topic-body">
    <span class="eyebrow">${esc(t.bereich)}</span>
    <h3 class="title-l">${esc(t.titel)}</h3>
    <p class="body-m muted">${esc(t.text)}</p>
    <ul class="topic-tags">${t.stichworte.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    <span class="go">Thema öffnen<span class="ms sm">arrow_forward</span></span>
  </div>
</a>`).join('');

document.getElementById('fotos').textContent = 'Fotos: ' + THEMEN.map(t => t.foto).join(', ') + ' (Unsplash-Lizenz)';

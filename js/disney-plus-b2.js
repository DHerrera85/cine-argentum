
// Cine Argentum — Disney+ B2. Solo alimenta las secciones nuevas.
// El catálogo y los filtros siguen a cargo de js/disney+.js.
(() => {
  'use strict';
  const dataUrl = 'data.json?v=20261011-b2';
  const upcomingSection = document.getElementById('disney-upcoming-section');
  const featuredSection = document.getElementById('disney-featured-section');
  const upcomingTrack = document.getElementById('disney-upcoming-list');
  const featuredSlider = document.getElementById('disney-featured-slider');
  if (!upcomingSection || !featuredSection || !upcomingTrack || !featuredSlider) return;

  function isDisney(item) {
    const fields = [item.channel, item.platform, ...(Array.isArray(item.platforms) ? item.platforms : [])];
    return fields.some(value => /disney\s*(?:\+|plus)/i.test(String(value || '')));
  }

  function isSeries(item) {
    return String(item.type || '').toLowerCase() !== 'pelicula';
  }

  function dateValue(value) {
    const match = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const day = +match[1], month = +match[2], year = +match[3];
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  function releaseDate(item) {
    return dateValue(item.release_date || item.fecha_estreno);
  }

  function text(tag, value, className) {
    const el = document.createElement(tag);
    el.textContent = value;
    if (className) el.className = className;
    return el;
  }

  function link(item) {
    const a = document.createElement('a');
    a.href = 'show.html?id=' + encodeURIComponent(item.id);
    return a;
  }

  function poster(item, src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = item.title || 'Serie de Disney+';
    img.loading = 'lazy';
    return img;
  }

  function buildUpcoming(items) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = items.filter(item => item.image && releaseDate(item) && releaseDate(item) > today)
      .sort((a, b) => releaseDate(a) - releaseDate(b));

    for (const item of upcoming) {
      const card = document.createElement('article');
      card.className = 'disney-upcoming-card';
      const a = link(item);
      a.append(poster(item, item.image), text('h3', item.title || '', 'disney-card-name'));
      const d = releaseDate(item);
      a.append(text('p', d.toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' }), 'disney-card-detail'));
      card.append(a);
      upcomingTrack.append(card);
    }

    upcomingSection.hidden = upcoming.length === 0;
  }

  function buildFeatured(items) {
    // Orden editorial reproducible: alfabético. No representa popularidad ni visualizaciones.
    const featured = items.filter(item => item.horizontal_image && item.id && item.title)
      .sort((a, b) => a.title.localeCompare(b.title, 'es'));

    for (const item of featured) {
      const li = document.createElement('li');
      li.className = 'disney-featured-card';
      const a = link(item);
      a.append(poster(item, item.horizontal_image), text('h3', item.title, 'disney-card-name'));
      li.append(a);
      featuredSlider.append(li);
    }

    featuredSection.hidden = featured.length === 0;

    if (featured.length && window.jQuery && typeof window.jQuery.fn.lightSlider === 'function') {
      window.jQuery(featuredSlider).lightSlider({
        item: 3,
        slideMove: 1,
        slideMargin: 14,
        loop: false,
        controls: true,
        pager: false,
        enableTouch: true,
        enableDrag: true,
        responsive: [
          { breakpoint: 900, settings: { item: 2, slideMove: 1, slideMargin: 12 } },
          { breakpoint: 600, settings: { item: 1, slideMove: 1, slideMargin: 10 } }
        ]
      });
    }
  }

  fetch(dataUrl, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(data => {
      const items = (Array.isArray(data.items) ? data.items : [])
        .filter(item => isDisney(item) && isSeries(item));
      buildUpcoming(items);
      buildFeatured(items);
    })
    .catch(error => console.error('Disney+ B2: no se pudieron cargar las secciones', error));
})();


/* Cine Argentum — Disney+ B3: catálogo y filtros */
(() => {
  'use strict';

  const grid = document.getElementById('actorMoviesList');
  const yearContainer = document.getElementById('disney-year-filters');
  const genreContainer = document.getElementById('disney-genre-filters');
  const clearButton = document.getElementById('disney-clear-filters');
  const count = document.getElementById('disney-catalog-count');
  const totalCount = document.getElementById('actor-movie-count');

  if (!grid || !yearContainer || !genreContainer) return;

  function isDisney(item) {
    const values = [
      item.channel,
      item.platform,
      ...(Array.isArray(item.platforms) ? item.platforms : [])
    ];

    return values.some(value =>
      /disney\s*(?:\+|plus)/i.test(String(value || ''))
    );
  }

  function isSeries(item) {
    return String(item.type || '').toLowerCase() !== 'pelicula';
  }

  function parseDate(value) {
    const match = String(value || '')
      .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const timestamp = Date.UTC(year, month - 1, day);
    const date = new Date(timestamp);

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return null;

    return timestamp;
  }

  function latestTimestamp(item) {
    const dates = [
      parseDate(item.release_date || item.fecha_estreno),
      ...(Array.isArray(item.temporadas)
        ? item.temporadas.map(season =>
          parseDate(season.release_date || season.fecha_estreno)
        )
        : [])
    ].filter(value => value !== null);

    return dates.length ? Math.max(...dates) : null;
  }

  function catalogYear(item) {
    // Año de estreno original, no el de la última temporada.
    const date = parseDate(item.release_date || item.fecha_estreno);
    if (date !== null) return new Date(date).getUTCFullYear();

    const year = Number(item.year);
    return Number.isInteger(year) ? year : null;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function createOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function render(items) {
    grid.replaceChildren();

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'actor-movie-card';

      const a = document.createElement('a');
      a.href = 'show.html?id=' + encodeURIComponent(item.id);

      const img = document.createElement('img');
      img.src = item.image || '';
      img.alt = item.title || '';
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.className = 'actor-movie-info';

      const title = document.createElement('div');
      title.className = 'actor-movie-title';
      title.textContent = item.title || '';

      const meta = document.createElement('div');
      meta.className = 'actor-movie-meta';
      meta.textContent = [item.year, item.genre].filter(Boolean).join(' · ');

      info.append(title, meta);

      if (item.tipo_emision &&
        normalize(item.tipo_emision) !== 'serie') {
        const emission = document.createElement('div');
        emission.className = 'actor-movie-meta';
        emission.textContent = item.tipo_emision;
        info.append(emission);
      }

      a.append(img, info);
      card.append(a);
      grid.append(card);
    }

    if (count) {
      count.textContent = `${items.length} series encontradas`;
    }
  }


  function setup(items) {
    const years = [...new Set(
      items.map(catalogYear).filter(year => year !== null)
    )].sort((a, b) => b - a);

    const genres = [...new Set(
      items.map(item => String(item.genre || '').trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es'));

    let selectedYear = 'all';
    let selectedGenre = 'all';

    function addButton(container, label, value, type) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'disney-filter-button';
      button.textContent = label;
      button.dataset.value = value;

      const active = type === 'year'
        ? selectedYear === value
        : selectedGenre === value;

      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));

      button.addEventListener('click', () => {
        if (type === 'year') {
          selectedYear = value;
        } else {
          selectedGenre = value;
        }

        updateButtons();
        applyFilters();
      });

      container.append(button);
    }

    function updateButtons() {
      yearContainer.querySelectorAll('button').forEach(button => {
        const active = button.dataset.value === selectedYear;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      genreContainer.querySelectorAll('button').forEach(button => {
        const active = button.dataset.value === selectedGenre;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    function applyFilters() {
      const filtered = items.filter(item => {
        const matchesYear =
          selectedYear === 'all' ||
          String(catalogYear(item)) === selectedYear;

        const matchesGenre =
          selectedGenre === 'all' ||
          normalize(item.genre) === selectedGenre;

        return matchesYear && matchesGenre;
      });

      filtered.sort((a, b) => {
        const difference =
          (latestTimestamp(b) ?? 0) -
          (latestTimestamp(a) ?? 0);

        return difference ||
          String(a.title || '').localeCompare(
            String(b.title || ''), 'es'
          );
      });

      render(filtered);
    }

    yearContainer.replaceChildren();
    genreContainer.replaceChildren();

    addButton(yearContainer, 'Todas', 'all', 'year');

    years.forEach(year => {
      addButton(yearContainer, String(year), String(year), 'year');
    });

    addButton(genreContainer, 'Todos', 'all', 'genre');

    genres.forEach(genre => {
      addButton(genreContainer, genre, normalize(genre), 'genre');
    });

    if (totalCount) {
      totalCount.textContent = `${items.length} series de Disney+`;
    }

    applyFilters();
  }

  fetch('data.json?v=20261011-b3', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(data => {
      const items = (Array.isArray(data.items) ? data.items : [])
        .filter(item => isDisney(item) && isSeries(item));

      setup(items);
    })
    .catch(error => {
      console.error('Disney+ B3: error al cargar catálogo', error);
      if (count) count.textContent = 'No se pudo cargar el catálogo.';
    });
})();

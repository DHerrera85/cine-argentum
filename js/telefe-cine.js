/* Telefe Cine: selección por ID; las fichas se leen de data.json. */
(function () {
  'use strict';

  // Filmografía oficial publicada por Telefe:
  // https://www.mitelefe.com/entretenimientos/cine--series/wanda-nara-protagonizara-su-primera-pelicula-de-la-mano-de-telefe-studios-pid2546092
  //
  // También se incluyen vínculos históricos revisados.
  //
  // Estos IDs hacen referencia a fichas existentes.
  const SELECTION = [
    { id: 'P1002', basis: 'filmografia-oficial' },
    { id: 'P1003', basis: 'filmografia-oficial' },
    { id: 'P1012', basis: 'filmografia-oficial' },
    { id: 'P1017', basis: 'filmografia-oficial' },
    { id: 'P1152', basis: 'filmografia-oficial' },
    { id: 'P1018', basis: 'filmografia-oficial' },
    { id: 'P1120', basis: 'filmografia-oficial' },
    { id: 'P1177', basis: 'filmografia-oficial' },
    { id: 'P1022', basis: 'filmografia-oficial' },
    { id: 'P1131', basis: 'filmografia-oficial' },
    { id: 'P1218', basis: 'filmografia-oficial' },
    { id: 'P1026', basis: 'filmografia-oficial' },
    { id: 'P1105', basis: 'filmografia-oficial' },
    { id: 'P2087', basis: 'filmografia-oficial' },
    { id: 'P1187', basis: 'filmografia-oficial' },
    { id: 'P1136', basis: 'filmografia-oficial' },
    { id: 'P1111', basis: 'filmografia-oficial' },
    { id: 'P1034', basis: 'filmografia-oficial' },
    { id: 'P1033', basis: 'filmografia-oficial' },
    { id: 'P1156', basis: 'filmografia-oficial' },
    { id: 'P1189', basis: 'filmografia-oficial' },
    { id: 'P1227', basis: 'filmografia-oficial' },
    { id: 'P1144', basis: 'filmografia-oficial' },
    { id: 'P1164', basis: 'filmografia-oficial' },
    { id: 'P1160', basis: 'filmografia-oficial' },
    { id: 'P1125', basis: 'filmografia-oficial' },
    { id: 'P1050', basis: 'filmografia-oficial' },
    { id: 'P1132', basis: 'filmografia-oficial' },
    { id: 'P1181', basis: 'filmografia-oficial' },
    { id: 'P1053', basis: 'filmografia-oficial' },
    { id: 'P1051', basis: 'filmografia-oficial' },
    { id: 'P1056', basis: 'filmografia-oficial' },
    { id: 'P1159', basis: 'filmografia-oficial' },
    { id: 'P1191', basis: 'filmografia-oficial' },
    { id: 'P1112', basis: 'filmografia-oficial' },
    { id: 'P1063', basis: 'filmografia-oficial' },
    { id: 'P1059', basis: 'filmografia-oficial' },
    { id: 'P1116', basis: 'filmografia-oficial' },
    { id: 'P1179', basis: 'filmografia-oficial' },
    { id: 'P1165', basis: 'filmografia-oficial' },
    { id: 'P1127', basis: 'filmografia-oficial' },
    { id: 'P1064', basis: 'filmografia-oficial' },
    { id: 'P1121', basis: 'filmografia-oficial' },
    { id: 'P1151', basis: 'filmografia-oficial' },
    { id: 'P1123', basis: 'filmografia-oficial' },
    { id: 'P1300', basis: 'filmografia-oficial' },
    { id: 'P1068', basis: 'filmografia-oficial' },
    { id: 'P1075', basis: 'filmografia-oficial' },
    { id: 'P1175', basis: 'filmografia-oficial' },
    { id: 'P1228', basis: 'filmografia-oficial' },
    { id: 'P1200', basis: 'filmografia-oficial' },
    { id: 'P1072', basis: 'filmografia-oficial' },
    { id: 'P1071', basis: 'filmografia-oficial' },
    { id: 'P1077', basis: 'filmografia-oficial' },
    { id: 'P1122', basis: 'filmografia-oficial' },
    { id: 'P1079', basis: 'filmografia-oficial' },
    { id: 'P1128', basis: 'filmografia-oficial' },
    { id: 'P1084', basis: 'filmografia-oficial' },

    { id: 'P1005', basis: 'fuente-complementaria' },
    { id: 'P1006', basis: 'fuente-complementaria' },
    { id: 'P1024', basis: 'fuente-complementaria' },
    { id: 'P1055', basis: 'fuente-complementaria' },
    { id: 'P1103', basis: 'fuente-complementaria' },
    { id: 'P1110', basis: 'fuente-complementaria' },
    { id: 'P1148', basis: 'fuente-complementaria' },
    { id: 'P1167', basis: 'fuente-complementaria' },
    { id: 'P1180', basis: 'fuente-complementaria' },
    { id: 'P1186', basis: 'fuente-complementaria' },
    { id: 'P1221', basis: 'fuente-complementaria' },
    { id: 'P2042', basis: 'fuente-complementaria' },
    { id: 'P2077', basis: 'fuente-complementaria' },
    { id: 'P2088', basis: 'fuente-complementaria' }
  ];

  const selectedIds = new Set(SELECTION.map(entry => entry.id));

  const state = {
    decade: 'all',
    year: 'all',
    genre: 'all',
    sort: 'viewers'
  };

  const formatter = new Intl.NumberFormat('es-AR');

  let movies = [];
  let elements;

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function getYear(movie) {
    return Number.parseInt(movie.year, 10) || 0;
  }

  function getViewers(movie) {
    const raw =
      movie.theatrical_stats &&
        movie.theatrical_stats.viewers != null
        ? movie.theatrical_stats.viewers
        : movie.viewers;

    if (raw == null || String(raw).trim() === '') {
      return null;
    }

    const value = Number(raw);

    return Number.isFinite(value) && value > 0
      ? value
      : null;
  }

  function compareMovies(a, b) {
    const byTitle = String(a.title || '').localeCompare(
      String(b.title || ''),
      'es'
    );

    if (state.sort === 'title') {
      return byTitle;
    }

    if (state.sort === 'year-asc') {
      return getYear(a) - getYear(b) || byTitle;
    }

    if (state.sort === 'year-desc') {
      return getYear(b) - getYear(a) || byTitle;
    }

    const av = getViewers(a);
    const bv = getViewers(b);

    if (av === null && bv !== null) {
      return 1;
    }

    if (bv === null && av !== null) {
      return -1;
    }

    return (bv || 0) - (av || 0) || byTitle;
  }

  function createText(tag, className, value) {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;

    return node;
  }

  function createCard(movie) {
    const card = document.createElement('article');
    card.className = 'telefe-cine-card telefe-card';
    card.dataset.movieId = movie.id;

    const link = document.createElement('a');
    link.href = 'show.html?id=' + encodeURIComponent(movie.id);
    link.setAttribute(
      'aria-label',
      'Ver ficha de ' + movie.title
    );

    const image = document.createElement('img');
    image.src = movie.image;
    image.alt = movie.title;
    image.width = 280;
    image.height = 420;
    image.loading = 'lazy';
    image.decoding = 'async';

    link.appendChild(image);

    const text = document.createElement('div');
    text.className = 'telefe-cine-card-text';

    text.appendChild(
      createText(
        'h3',
        'telefe-cine-card-title',
        movie.title
      )
    );

    text.appendChild(
      createText(
        'p',
        'telefe-cine-card-meta',
        [movie.year, movie.genre].filter(Boolean).join(' · ')
      )
    );

    const viewers = getViewers(movie);

    if (viewers !== null) {
      text.appendChild(
        createText(
          'p',
          'telefe-cine-card-viewers',
          formatter.format(viewers) + ' espectadores'
        )
      );
    }

    link.appendChild(text);
    card.appendChild(link);

    return card;
  }

  function renderFeatured() {
    const section = document.getElementById('telefe-cine-featured');
    const slider = document.getElementById('telefe-cine-featured-slider');

    if (!section || !slider) {
      return;
    }

    const featured = movies.filter(movie =>
      typeof movie.horizontal_image === 'string' &&
      movie.horizontal_image.trim() !== ''
    );

    if (!featured.length) {
      return;
    }

    const fragment = document.createDocumentFragment();

    featured.forEach(movie => {
      const item = document.createElement('li');
      item.className = 'telefe-cine-featured-item';

      const link = document.createElement('a');
      link.href = 'show.html?id=' + encodeURIComponent(movie.id);
      link.draggable = false;

      const image = document.createElement('img');
      image.src = movie.horizontal_image;
      image.alt = movie.title;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = 1024;
      image.height = 576;
      image.draggable = false;

      const title = document.createElement('span');
      title.className = 'telefe-cine-featured-title';
      title.textContent = movie.title;

      link.append(image, title);
      item.appendChild(link);
      fragment.appendChild(item);
    });

    slider.replaceChildren(fragment);
    slider.classList.remove('cs-hidden');
    section.hidden = false;

    const previousButton = document.getElementById('telefe-cine-featured-prev');
    const nextButton = document.getElementById('telefe-cine-featured-next');

    if (!previousButton || !nextButton) {
      return;
    }

    const updateControls = () => {
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      previousButton.disabled = slider.scrollLeft <= 1;
      nextButton.disabled = slider.scrollLeft >= maxScrollLeft - 1;
    };

    const scrollByCard = direction => {
      const firstItem = slider.querySelector('.telefe-cine-featured-item');

      if (!firstItem) {
        return;
      }

      const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 0;
      slider.scrollBy({
        left: direction * (firstItem.getBoundingClientRect().width + gap),
        behavior: 'smooth'
      });
    };

    previousButton.addEventListener('click', () => scrollByCard(-1));
    nextButton.addEventListener('click', () => scrollByCard(1));
    slider.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);

    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let didDrag = false;
    let suppressClickTimeout;

    slider.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) {
        return;
      }

      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScrollLeft = slider.scrollLeft;
      didDrag = false;
    });

    window.addEventListener('pointermove', event => {
      if (event.pointerId !== dragPointerId) {
        return;
      }

      const distance = event.clientX - dragStartX;

      if (!didDrag && Math.abs(distance) > 5) {
        didDrag = true;
        slider.classList.add('is-dragging');
      }

      if (didDrag) {
        slider.scrollLeft = dragStartScrollLeft - distance;
        event.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);

    slider.addEventListener('click', event => {
      if (!didDrag) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    }, true);

    updateControls();

    function finishDrag(event) {
      if (event.pointerId !== dragPointerId) {
        return;
      }

      dragPointerId = null;
      slider.classList.remove('is-dragging');

      if (didDrag) {
        clearTimeout(suppressClickTimeout);
        suppressClickTimeout = setTimeout(() => {
          didDrag = false;
        }, 300);
      }
    }
  }

  function renderCatalogue() {
    const visible = movies
      .filter(movie => {
        const year = getYear(movie);

        return (
          (
            state.decade === 'all' ||
            Math.floor(year / 10) * 10 === Number(state.decade)
          ) &&
          (
            state.year === 'all' ||
            year === Number(state.year)
          ) &&
          (
            state.genre === 'all' ||
            normalize(movie.genre) === state.genre
          )
        );
      })
      .sort(compareMovies);

    const fragment = document.createDocumentFragment();

    visible.forEach(movie => {
      fragment.appendChild(createCard(movie));
    });

    elements.grid.replaceChildren(fragment);

    elements.count.textContent =
      visible.length === movies.length
        ? movies.length + (
          movies.length === 1 ? ' película' : ' películas'
        )
        : visible.length + ' de ' + movies.length + ' películas';

    elements.empty.hidden = visible.length !== 0;
  }

  function createFilterGroup(key, label, options) {
    const group = document.createElement('div');
    group.className = 'telefe-cine-filter-group telefe-section';

    const heading = createText(
      'h3',
      'telefe-cine-filter-heading latest-heading',
      label
    );

    heading.id = 'telefe-cine-filter-' + key;

    const carousel = document.createElement('div');
    carousel.className = 'filter-carousel';

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'filter-arrow filter-arrow-prev';
    previous.setAttribute('aria-label', 'Ver opciones anteriores');
    previous.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';

    const list = document.createElement('div');
    const isYearGroup = key === 'decade' || key === 'year';
    list.className = 'telefe-cine-filter-list filter-scroll ' +
      (isYearGroup ? 'telefe-year-filter' : 'telefe-category-filter');
    list.setAttribute('role', 'group');
    list.setAttribute('aria-labelledby', heading.id);

    options.forEach(option => {
      const button = createText(
        'button',
        'telefe-cine-filter-button ' +
        (isYearGroup ? 'year-button' : 'category-button'),
        option.label
      );

      button.type = 'button';
      button.dataset.filter = key;
      button.dataset.value = String(option.value);

      button.setAttribute(
        'aria-pressed',
        String(state[key] === String(option.value))
      );
      button.classList.toggle(
        'active',
        state[key] === String(option.value)
      );

      list.appendChild(button);
    });

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'filter-arrow filter-arrow-next';
    next.setAttribute('aria-label', 'Ver opciones siguientes');
    next.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';

    carousel.append(previous, list, next);
    group.append(heading, carousel);

    return group;
  }

  function yearOptions() {
    const years = [
      ...new Set(
        movies
          .filter(movie => {
            return (
              state.decade === 'all' ||
              Math.floor(getYear(movie) / 10) * 10 ===
              Number(state.decade)
            );
          })
          .map(getYear)
      )
    ]
      .filter(Boolean)
      .sort((a, b) => b - a)
      .map(year => ({
        value: String(year),
        label: String(year)
      }));

    return [
      { value: 'all', label: 'Todos' }
    ].concat(years);
  }

  function updateButtons() {
    elements.filters
      .querySelectorAll('button[data-filter]')
      .forEach(button => {
        const active =
          state[button.dataset.filter] === button.dataset.value;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
      });
  }

  function bindFilterCarousels() {
    elements.filters.querySelectorAll('.filter-carousel').forEach(carousel => {
      const scrollArea = carousel.querySelector('.filter-scroll');
      const previous = carousel.querySelector('.filter-arrow-prev');
      const next = carousel.querySelector('.filter-arrow-next');

      if (!scrollArea || !previous || !next) {
        return;
      }

      const refresh = () => {
        previous.disabled = scrollArea.scrollLeft <= 2;
        next.disabled =
          scrollArea.scrollLeft + scrollArea.clientWidth >=
          scrollArea.scrollWidth - 2;
      };

      previous.addEventListener('click', () => {
        scrollArea.scrollBy({
          left: -Math.max(180, Math.round(scrollArea.clientWidth * .65)),
          behavior: 'smooth'
        });
      });

      next.addEventListener('click', () => {
        scrollArea.scrollBy({
          left: Math.max(180, Math.round(scrollArea.clientWidth * .65)),
          behavior: 'smooth'
        });
      });

      scrollArea.addEventListener('scroll', refresh, { passive: true });
      window.addEventListener('resize', refresh);
      refresh();
    });
  }

  function renderFilters() {
    const decades = [
      ...new Set(
        movies.map(movie => {
          return Math.floor(getYear(movie) / 10) * 10;
        })
      )
    ]
      .filter(Boolean)
      .sort((a, b) => a - b);

    const genres = new Map();

    movies.forEach(movie => {
      if (movie.genre) {
        genres.set(
          normalize(movie.genre),
          movie.genre
        );
      }
    });

    const decadeOptions = [
      { value: 'all', label: 'Todas' }
    ].concat(
      decades.map(decade => ({
        value: String(decade),
        label: decade + '–' + (decade + 9)
      }))
    );

    const genreOptions = [
      { value: 'all', label: 'Todos' }
    ].concat(
      [...genres]
        .sort((a, b) => a[1].localeCompare(b[1], 'es'))
        .map(([value, label]) => ({
          value,
          label
        }))
    );

    elements.filters.replaceChildren(
      createFilterGroup(
        'decade',
        'Explorar por década',
        decadeOptions
      ),
      createFilterGroup(
        'year',
        'Explorar por año',
        yearOptions()
      ),
      createFilterGroup(
        'genre',
        'Géneros',
        genreOptions
      ),
      createFilterGroup(
        'sort',
        'Ordenar películas',
        [
          { value: 'viewers', label: 'Más vistas en cines' },
          { value: 'year-desc', label: 'Más recientes' },
          { value: 'year-asc', label: 'Más antiguas' },
          { value: 'title', label: 'Título A–Z' }
        ]
      )
    );

    elements.filters.hidden = false;
    bindFilterCarousels();
  }

  async function init() {
    const catalogue = document.getElementById(
      'telefe-cine-catalogue'
    );

    if (!catalogue) {
      return;
    }

    elements = {
      catalogue,
      filters: document.getElementById('telefe-cine-filters'),
      grid: document.getElementById('telefe-cine-grid'),
      count: document.getElementById('telefe-cine-count'),
      empty: document.getElementById('telefe-cine-empty'),
      error: document.getElementById('telefe-cine-error')
    };

    try {
      const response = await fetch(
        'data.json?v=20261004-telefe-cine-1'
      );

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      if (!Array.isArray(data.items)) {
        throw new Error('data.json no contiene items');
      }

      const found = new Map();

      data.items.forEach(movie => {
        if (
          selectedIds.has(movie.id) &&
          normalize(movie.type) === 'pelicula' &&
          !found.has(movie.id)
        ) {
          found.set(movie.id, movie);
        }
      });

      movies = [...found.values()];

      const missing = [...selectedIds].filter(id => {
        return !found.has(id);
      });

      if (missing.length) {
        console.warn(
          'Telefe Cine: IDs sin ficha de película:',
          missing
        );
      }

      renderFilters();
      renderCatalogue();
      renderFeatured();

      elements.filters.addEventListener('click', event => {
        const button = event.target.closest(
          'button[data-filter]'
        );

        if (!button) {
          return;
        }

        state[button.dataset.filter] = button.dataset.value;

        if (button.dataset.filter === 'decade') {
          state.year = 'all';

          const yearGroup = document.getElementById(
            'telefe-cine-filter-year'
          ).parentElement;

          yearGroup.replaceWith(
            createFilterGroup(
              'year',
              'Explorar por año',
              yearOptions()
            )
          );
          bindFilterCarousels();
        }

        updateButtons();
        renderCatalogue();
      });
    } catch (error) {
      console.error(
        'Telefe Cine: no se pudo cargar el catálogo.',
        error
      );

      elements.count.textContent = '';
      elements.error.hidden = false;
    } finally {
      catalogue.setAttribute('aria-busy', 'false');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
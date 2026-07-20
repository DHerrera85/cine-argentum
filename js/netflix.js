// js/netflix.js: Logica para filtrar y mostrar series y peliculas de Netflix
const netflixDataVersion = '20260525-2';

function normalizeNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getReportOrder(reportId) {
  if (!reportId) return -1;
  const match = String(reportId).match(/^(\d{4})-H([12])$/);
  if (!match) return -1;
  return Number(match[1]) * 10 + Number(match[2]);
}

function getLatestByReport(entries) {
  if (!Array.isArray(entries) || !entries.length) return null;
  const sorted = entries.slice().sort((a, b) => {
    return getReportOrder(b.report_id) - getReportOrder(a.report_id);
  });
  return sorted[0] || null;
}

function getAggregateFromItem(item) {
  const aggregate = getLatestByReport(item.netflix_aggregates);
  if (aggregate && aggregate.report_id) {
    return {
      report_id: aggregate.report_id,
      periodo: aggregate.periodo || aggregate.report_id,
      visualizaciones_totales: normalizeNumber(aggregate.visualizaciones_totales),
      temporada_mas_vista: normalizeNumber(aggregate.temporada_mas_vista),
      visualizaciones_temporada_mas_vista: normalizeNumber(aggregate.visualizaciones_temporada_mas_vista)
    };
  }

  const topLevelReport = getLatestByReport(item.netflix_reports);
  if (topLevelReport && topLevelReport.report_id) {
    return {
      report_id: topLevelReport.report_id,
      periodo: topLevelReport.periodo || topLevelReport.report_id,
      visualizaciones_totales: normalizeNumber(topLevelReport.visualizaciones),
      temporada_mas_vista: null,
      visualizaciones_temporada_mas_vista: null
    };
  }

  if (!Array.isArray(item.temporadas) || !item.temporadas.length) return null;

  const byReport = Object.create(null);
  item.temporadas.forEach((temp, idx) => {
    if (!temp || !Array.isArray(temp.netflix_reports)) return;
    temp.netflix_reports.forEach((report) => {
      if (!report || !report.report_id) return;
      const views = normalizeNumber(report.visualizaciones);
      const key = String(report.report_id);
      if (!byReport[key]) {
        byReport[key] = {
          report_id: key,
          periodo: report.periodo || key,
          visualizaciones_totales: 0,
          temporada_mas_vista: null,
          visualizaciones_temporada_mas_vista: -1
        };
      }
      if (views === null) return;
      byReport[key].visualizaciones_totales += views;
      if (views > byReport[key].visualizaciones_temporada_mas_vista) {
        byReport[key].visualizaciones_temporada_mas_vista = views;
        byReport[key].temporada_mas_vista = normalizeNumber(temp.numero) || normalizeNumber(temp.season) || (idx + 1);
      }
    });
  });

  const entries = Object.values(byReport).sort((a, b) => getReportOrder(b.report_id) - getReportOrder(a.report_id));
  if (!entries.length) return null;

  const latest = entries[0];
  if (latest.visualizaciones_temporada_mas_vista < 0) {
    latest.visualizaciones_temporada_mas_vista = null;
  }
  return latest;
}

function formatViews(value) {
  const n = normalizeNumber(value);
  if (n === null) return 'Dato pendiente';
  return n.toLocaleString('es-AR');
}

function getPlaceholderImageSrc() {
  return 'images/verticals/placeholder-280x420.svg';
}

function getItemImageSrc(item) {
  const rawValue = item && item.image ? String(item.image).trim() : '';
  if (!rawValue) return getPlaceholderImageSrc();
  return rawValue.replace(/ /g, '%20');
}

function escapeAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isNetflixItem(item) {
  const channel = (item.channel || '').toLowerCase();
  const producer = (item.producer || '').toLowerCase();
  const platforms = Array.isArray(item.platforms) ? item.platforms.map(p => String(p).toLowerCase()) : [];
  return channel.includes('netflix') || producer.includes('netflix') || platforms.some(p => p.includes('netflix'));
}

function normalizeGenre(value) {
  return value ? String(value).trim().toLowerCase() : '';
}

function displayGenre(value) {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function metricValue(item) {
  if (!item || !item.netflix_metric) return -1;
  const n = normalizeNumber(item.netflix_metric.visualizaciones_totales);
  return n === null ? -1 : n;
}

function parseReleaseDateValue(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const isoDate = Date.parse(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`);
    return Number.isNaN(isoDate) ? null : isoDate;
  }

  const localMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (localMatch) {
    const day = Number(localMatch[1]);
    const month = Number(localMatch[2]) - 1;
    const year = Number(localMatch[3]);
    const localDate = Date.UTC(year, month, day);
    return Number.isNaN(localDate) ? null : localDate;
  }

  return null;
}

function getSeriesLatestReleaseValue(item) {
  const timestamps = [];
  const pushTimestamp = (value) => {
    const parsed = parseReleaseDateValue(value);
    if (parsed !== null) timestamps.push(parsed);
  };

  pushTimestamp(item.release_date);
  pushTimestamp(item.fecha_estreno);

  if (Array.isArray(item.temporadas)) {
    item.temporadas.forEach((temp) => {
      if (!temp) return;
      pushTimestamp(temp.release_date);
      pushTimestamp(temp.fecha_estreno);
    });
  }

  if (timestamps.length) {
    return Math.max(...timestamps);
  }

  const fallbackYear = parseInt(item.year, 10);
  return Number.isFinite(fallbackYear) ? Date.UTC(fallbackYear, 0, 1) : 0;
}

function compareSeriesByLatestReleaseDesc(a, b) {
  const diff = getSeriesLatestReleaseValue(b) - getSeriesLatestReleaseValue(a);
  if (diff !== 0) return diff;
  return String(a.title || '').localeCompare(String(b.title || ''), 'es');
}

function compareSeriesByLatestReleaseAsc(a, b) {
  const diff = getSeriesLatestReleaseValue(a) - getSeriesLatestReleaseValue(b);
  if (diff !== 0) return diff;
  return String(a.title || '').localeCompare(String(b.title || ''), 'es');
}

function compareMoviesByReleaseDesc(a, b) {
  const diff = getMovieReleaseValue(b) - getMovieReleaseValue(a);
  if (diff !== 0) return diff;
  return String(a.title || '').localeCompare(String(b.title || ''), 'es');
}

function getMovieReleaseValue(movie) {
  if (!movie) return 0;

  const directValue = parseReleaseDateValue(movie.release_date);
  if (directValue !== null) return directValue;

  const alternateValue = parseReleaseDateValue(movie.fecha_estreno);
  if (alternateValue !== null) return alternateValue;

  const fallbackYear = parseInt(movie.year, 10);
  return Number.isFinite(fallbackYear) ? Date.UTC(fallbackYear, 0, 1) : 0;
}

function renderIndexMovieCard(movie) {
  const li = document.createElement('li');
  li.className = 'item-a';
  const title = movie.title || '';

  function formatDateFromTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(Number(ts));
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // Prefer explicit release_date, then fecha_estreno, then fallback to year
  let displayDate = '';
  const rd = parseReleaseDateValue(movie.release_date);
  if (rd !== null) {
    displayDate = formatDateFromTimestamp(rd);
  } else {
    const fe = parseReleaseDateValue(movie.fecha_estreno);
    if (fe !== null) displayDate = formatDateFromTimestamp(fe);
    else if (movie.year) displayDate = String(movie.year);
  }
  const imageSrc = getItemImageSrc(movie);
  const escapedTitle = escapeAttribute(title);

  li.innerHTML = `
    <a href="show.html?id=${movie.id}">
      <div class="latest-box">
        <div class="latest-b-img">
          <img src="${imageSrc}" alt="${escapedTitle}" loading="lazy" onerror="this.onerror=null;this.src='${getPlaceholderImageSrc()}';">
        </div>
        <div class="latest-b-text">
          <strong>${title}</strong>
          <p>${displayDate}</p>
        </div>
      </div>
    </a>
  `;

  return li;
}

function renderPlatformCarousel(options) {
  console.log('[Netflix] renderPlatformCarousel called, options:', options);
  const containerId = options && options.containerId ? String(options.containerId) : '';
  console.log('[Netflix] containerId:', containerId);
  const container = document.getElementById(containerId);
  console.log('[Netflix] container found:', !!container, 'container:', container);
  if (!container) {
    console.error('[Netflix] ERROR: container not found with id:', containerId);
    return;
  }

  const items = Array.isArray(options && options.items) ? options.items : [];
  container.innerHTML = '';

  const sortedItems = [...items].sort(compareMoviesByReleaseDesc);
  sortedItems.forEach(item => {
    container.appendChild(renderIndexMovieCard(item));
  });

  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.lightSlider) {
    const $container = window.jQuery(container);
    const previousInstance = $container.data('lightSlider');
    if (previousInstance && typeof previousInstance.destroy === 'function') {
      previousInstance.destroy();
    }
    $container.data('lightSlider', null);

    $container.lightSlider({
      item: 5,
      slideMove: 1,
      slideMargin: 12,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,
      responsive: [
        { breakpoint: 1100, settings: { item: 4 } },
        { breakpoint: 768, settings: { item: 2 } }
      ]
    });
  }
}

function isMovieReleased(movie) {
  if (!movie) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidates = [];

  const releaseDateParsed = parseReleaseDateValue(movie.release_date);
  if (releaseDateParsed !== null) {
    candidates.push(new Date(releaseDateParsed));
  }

  const fechaEstrenoParsed = parseReleaseDateValue(movie.fecha_estreno);
  if (fechaEstrenoParsed !== null) {
    candidates.push(new Date(fechaEstrenoParsed));
  }

  if (movie.year) {
    const year = parseInt(movie.year, 10);
    if (Number.isFinite(year)) {
      candidates.push(new Date(year, 0, 1));
    }
  }

  if (candidates.length === 0) return false;

  const latestDate = new Date(Math.max(...candidates.map(d => d.getTime())));
  return latestDate <= today;
}

function renderIndexNetflixCarousel(movies) {
  const releasedMovies = movies.filter(isMovieReleased);
  renderPlatformCarousel({
    containerId: 'indexNetflixMoviesList',
    items: releasedMovies
  });
}

window.netflixDebug = window.netflixDebug || {};

function initializeNetflixCarousel() {
  console.log('[Netflix] Initializing Netflix data');

  window.netflixDebug.initialized = true;

  const indexContainer = document.getElementById(
    'indexNetflixMoviesList'
  );

  window.netflixDebug.containerFound = !!indexContainer;

  fetch('data.json?v=' + netflixDataVersion, {
    cache: 'no-store'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: no se pudo cargar data.json`
        );
      }

      window.netflixDebug.fetchOk = true;
      return response.json();
    })
    .then(data => {
      const items = Array.isArray(data.items)
        ? data.items
        : [];

      window.netflixDebug.dataLoaded = true;
      window.netflixDebug.itemsCount = items.length;

      const netflixItems = items
        .filter(item => isNetflixItem(item))
        .map(item => {
          const aggregate = getAggregateFromItem(item);

          return {
            ...item,
            netflix_metric: aggregate
          };
        });

      const series = netflixItems.filter(
        item => item.type !== 'pelicula'
      );

      const movies = netflixItems.filter(
        item => item.type === 'pelicula'
      );

      window.netflixDebug.netflixItemsCount =
        netflixItems.length;

      window.netflixDebug.seriesCount = series.length;
      window.netflixDebug.moviesCount = movies.length;

      const shouldRenderIndexCarousel = !!indexContainer;
      const shouldRenderNetflixPage = !!document.getElementById('actorSortCustom') || !!document.getElementById('movieSortCustom');

      if (shouldRenderIndexCarousel) {
        renderIndexNetflixCarousel(movies);
        window.netflixDebug.renderCalled = true;
      }

      if (shouldRenderNetflixPage) {
        setupSeriesFilters(series);
        setupMovieFilters(movies);
      }
    })
    .catch(error => {
      console.error(
        '[Netflix] Error al cargar Netflix data:',
        error
      );

      window.netflixDebug.error =
        'fetch_error: ' + error.message;
    });
}

console.log('[Netflix] Script loaded, readyState:', document.readyState);
window.netflixDebug.scriptLoaded = true;
window.netflixDebug.readyState = document.readyState;

if (document.readyState === 'loading') {
  console.log('[Netflix] DOM still loading, adding DOMContentLoaded listener');
  document.addEventListener('DOMContentLoaded', initializeNetflixCarousel);
  window.netflixDebug.strategy = 'DOMContentLoaded listener';
} else {
  console.log('[Netflix] DOM already loaded, using setTimeout');
  setTimeout(initializeNetflixCarousel, 50);
  window.netflixDebug.strategy = 'setTimeout';
}

function renderCards(items, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'actor-movie-card';
    const tipoEmision = type === 'series' && item.tipo_emision ? item.tipo_emision : '';
    let imageSrc = getItemImageSrc(item);
    if (type === 'series' && item.id === 'V180' && Array.isArray(item.temporadas)) {
      const season5 = item.temporadas.find(t => t && Number(t.numero || t.season) === 5 && t.image);
      if (season5 && season5.image) {
        imageSrc = String(season5.image).replace(/ /g, '%20');
      }
    }

    let netflixMetricHtml = '';
    if (item.netflix_metric) {
      const m = item.netflix_metric;
      netflixMetricHtml = '<div class="actor-movie-viewers">'
        + 'Visualizaciones (' + (m.periodo || m.report_id || 'Netflix') + '): '
        + formatViews(m.visualizaciones_totales)
        + '</div>';

      if (type === 'series' && normalizeNumber(m.temporada_mas_vista) !== null) {
        netflixMetricHtml += '<div class="actor-movie-meta" style="color:#9ca3af;">'
          + 'Temporada mas vista: T' + m.temporada_mas_vista
          + (normalizeNumber(m.visualizaciones_temporada_mas_vista) !== null
            ? ' (' + formatViews(m.visualizaciones_temporada_mas_vista) + ')'
            : '')
          + '</div>';
      }
    }

    const escapedTitle = escapeAttribute(item.title);
    card.innerHTML = `
      <a href="show.html?id=${item.id}">
        <img src="${imageSrc}" alt="${escapedTitle}" onerror="this.onerror=null;this.src='${getPlaceholderImageSrc()}';">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${escapedTitle}</div>
          <div class="actor-movie-meta">${item.year} · ${item.genre || ''}</div>
          ${tipoEmision ? '<div class="actor-movie-meta" style="color:#b0b0b0;">' + tipoEmision + '</div>' : ''}
          ${netflixMetricHtml}
        </div>
      </a>
    `;
    container.appendChild(card);
  });
}

function setupCustomSelect(selectId, onChange) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const selectOptions = select.querySelector('.custom-select-options');
  const selectSelected = select.querySelector('.custom-select-selected');

  select.addEventListener('click', function () {
    select.classList.toggle('open');
    selectOptions.style.display = select.classList.contains('open') ? 'block' : 'none';
  });
  select.addEventListener('blur', function () {
    select.classList.remove('open');
    selectOptions.style.display = 'none';
  });
  selectOptions.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
      selectOptions.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      e.target.classList.add('selected');
      selectSelected.textContent = e.target.textContent;
      onChange(e.target.getAttribute('data-value'));
    }
  });
}

function sortAndFilterSeries(list, sort) {
  let filtered = [...list];
  filtered = filtered.map(item => ({ ...item, genre: normalizeGenre(item.genre) }));

  if (sort === 'netflix-views-desc') {
    filtered.sort((a, b) => {
      const diff = metricValue(b) - metricValue(a);
      if (diff !== 0) return diff;
      return compareSeriesByLatestReleaseDesc(a, b);
    });
  } else if (sort === 'year') {
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'year-asc') {
    filtered.sort(compareSeriesByLatestReleaseAsc);
  } else if (sort === 'comedias') {
    filtered = filtered.filter(item => item.genre === 'comedia');
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'telenovelas') {
    filtered = filtered.filter(item => item.genre === 'telenovela');
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'juveniles') {
    filtered = filtered.filter(item => item.genre === 'juvenil');
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'sitcoms') {
    filtered = filtered.filter(item => item.genre === 'sitcom');
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'policiales') {
    filtered = filtered.filter(item => item.genre === 'thriller' || item.genre === 'policial');
    filtered.sort(compareSeriesByLatestReleaseDesc);
  } else if (sort === 'unitarios') {
    filtered = filtered.filter(item => item.genre === 'drama' || (item.tipo_emision && item.tipo_emision.toLowerCase().includes('unitario')));
    filtered.sort(compareSeriesByLatestReleaseDesc);
  }

  filtered = filtered.map(item => ({ ...item, genre: displayGenre(item.genre) }));
  return filtered;
}

function sortAndFilterMovies(list, sort) {
  let filtered = [...list];
  filtered = filtered.map(item => ({ ...item, genre: normalizeGenre(item.genre) }));

  if (sort === 'netflix-views-desc') {
    filtered.sort((a, b) => {
      const diff = metricValue(b) - metricValue(a);
      if (diff !== 0) return diff;
      return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
    });
  } else if (sort === 'year') {
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'year-asc') {
    filtered.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
  } else if (sort.indexOf('genre:') === 0) {
    const genre = sort.slice('genre:'.length);
    filtered = filtered.filter(item => item.genre === genre);
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  }

  filtered = filtered.map(item => ({ ...item, genre: displayGenre(item.genre) }));
  return filtered;
}

function setupSeriesFilters(allSeries) {
  const select = document.getElementById('actorSortCustom');
  if (!select) return;

  let currentSort = 'year';

  function renderFiltered() {
    const filtered = sortAndFilterSeries(
      allSeries,
      currentSort
    );

    const countElement =
      document.getElementById('actor-movie-count');

    if (countElement) {
      countElement.textContent =
        `${filtered.length} series de Netflix`;
    }

    renderCards(
      filtered,
      'actorMoviesList',
      'series'
    );
  }

  setupCustomSelect(
    'actorSortCustom',
    function (value) {
      currentSort = value;
      renderFiltered();
    }
  );

  renderFiltered();
}

function setupMovieFilters(allMovies) {
  const select = document.getElementById('movieSortCustom');
  if (!select) return;
  const optionsList = select.querySelector('.custom-select-options');
  if (!optionsList) return;

  let currentSort = 'netflix-views-desc';
  const genreValues = Array.from(new Set(allMovies
    .map(item => normalizeGenre(item.genre))
    .filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'es'));

  genreValues.forEach((genre) => {
    const li = document.createElement('li');
    li.setAttribute('data-value', 'genre:' + genre);
    li.textContent = displayGenre(genre);
    optionsList.appendChild(li);
  });

  function renderFiltered() {
    const filtered = sortAndFilterMovies(allMovies, currentSort);
    document.getElementById('netflix-movie-count').textContent = `${filtered.length} peliculas de Netflix`;
    renderCards(filtered, 'netflixMoviesList', 'movies');
  }

  setupCustomSelect('movieSortCustom', function (value) {
    currentSort = value;
    renderFiltered();
  });

  renderFiltered();
}

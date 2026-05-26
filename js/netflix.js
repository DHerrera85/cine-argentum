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

fetch('data.json?v=' + netflixDataVersion, { cache: 'no-store' })
  .then(response => response.json())
  .then(data => {
    const netflixItems = data.items
      .filter(item => isNetflixItem(item))
      .map(item => {
        const aggregate = getAggregateFromItem(item);
        return {
          ...item,
          netflix_metric: aggregate
        };
      });

    const series = netflixItems.filter(item => item.type !== 'pelicula');
    const movies = netflixItems.filter(item => item.type === 'pelicula');

    setupSeriesFilters(series);
    setupMovieFilters(movies);
  });

function renderCards(items, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'actor-movie-card';
    const tipoEmision = type === 'series' && item.tipo_emision ? item.tipo_emision : '';
    let imageSrc = item.image ? String(item.image).replace(/ /g, '%20') : 'images/verticals/placeholder-280x420.svg';
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

    card.innerHTML = `
      <a href="show.html?id=${item.id}">
        <img src="${imageSrc}" alt="${item.title}">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${item.title}</div>
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
      return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
    });
  } else if (sort === 'year') {
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'year-asc') {
    filtered.sort((a, b) => (parseInt(a.year, 10) || 0) - (parseInt(b.year, 10) || 0));
  } else if (sort === 'comedias') {
    filtered = filtered.filter(item => item.genre === 'comedia');
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'telenovelas') {
    filtered = filtered.filter(item => item.genre === 'telenovela');
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'juveniles') {
    filtered = filtered.filter(item => item.genre === 'juvenil');
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'sitcoms') {
    filtered = filtered.filter(item => item.genre === 'sitcom');
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'policiales') {
    filtered = filtered.filter(item => item.genre === 'thriller' || item.genre === 'policial');
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
  } else if (sort === 'unitarios') {
    filtered = filtered.filter(item => item.genre === 'drama' || (item.tipo_emision && item.tipo_emision.toLowerCase().includes('unitario')));
    filtered.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0));
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
    const filtered = sortAndFilterSeries(allSeries, currentSort);
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de Netflix`;
    renderCards(filtered, 'actorMoviesList', 'series');
  }

  setupCustomSelect('actorSortCustom', function (value) {
    currentSort = value;
    renderFiltered();
  });

  renderFiltered();
}

function setupMovieFilters(allMovies) {
  const select = document.getElementById('movieSortCustom');
  if (!select) return;
  let currentSort = 'netflix-views-desc';

  const optionsList = select.querySelector('.custom-select-options');
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

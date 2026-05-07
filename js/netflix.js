// js/netflix.js: Lógica para filtrar y mostrar series de Netflix
const netflixDataVersion = '20260507-1';

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

fetch('data.json?v=' + netflixDataVersion, { cache: 'no-store' })
  .then(response => response.json())
  .then(data => {
    const items = data.items
      .filter(item => {
        const channel = (item.channel || '').toLowerCase();
        const platforms = Array.isArray(item.platforms) ? item.platforms.map(p => String(p).toLowerCase()) : [];
        const inPrimaryChannel = channel.includes('netflix');
        const inPlatformsArray = platforms.some(p => p.includes('netflix'));
        if (!inPrimaryChannel && !inPlatformsArray) return false;
        return item.type !== 'pelicula';
      })
      .map(item => {
        const aggregate = getAggregateFromItem(item);
        return {
          ...item,
          netflix_metric: aggregate
        };
      });

    renderSeries(items);
    setupFilters(items);
  });

function renderSeries(series) {
  const container = document.getElementById('actorMoviesList');
  container.innerHTML = '';
  series.forEach(item => {
    const card = document.createElement('div');
    card.className = 'actor-movie-card';
    const tipoEmision = item.tipo_emision ? item.tipo_emision : '';
    const imageSrc = item.image ? String(item.image).replace(/ /g, '%20') : 'images/verticals/placeholder-280x420.svg';

    let netflixMetricHtml = '';
    if (item.netflix_metric) {
      const m = item.netflix_metric;
      netflixMetricHtml = '<div class="actor-movie-viewers">'
        + 'Visualizaciones (' + (m.periodo || m.report_id || 'Netflix') + '): '
        + formatViews(m.visualizaciones_totales)
        + '</div>';

      if (normalizeNumber(m.temporada_mas_vista) !== null) {
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
          <div class="actor-movie-meta" style="color:#b0b0b0;">${tipoEmision}</div>
          ${netflixMetricHtml}
        </div>
      </a>
    `;
    container.appendChild(card);
  });
}

function setupFilters(allSeries) {
  const select = document.getElementById('actorSortCustom');
  const selectOptions = select.querySelector('.custom-select-options');
  const selectSelected = select.querySelector('.custom-select-selected');
  let currentSort = 'netflix-views-desc';

  function normalizeGenre(value) {
    return value ? value.trim().toLowerCase() : '';
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

  function sortAndFilter(list, sort) {
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

  function renderFiltered() {
    const filtered = sortAndFilter(allSeries, currentSort);
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de Netflix`;
    renderSeries(filtered);
  }

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
      currentSort = e.target.getAttribute('data-value');
      renderFiltered();
    }
  });
  renderFiltered();
}

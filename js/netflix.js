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

  return entries
    .slice()
    .sort((a, b) => getReportOrder(b.report_id) - getReportOrder(a.report_id))[0] || null;
}

function getAggregateFromItem(item) {
  const aggregate = getLatestByReport(item && item.netflix_aggregates);
  if (aggregate && aggregate.report_id) {
    return {
      report_id: aggregate.report_id,
      periodo: aggregate.periodo || aggregate.report_id,
      visualizaciones_totales: normalizeNumber(aggregate.visualizaciones_totales),
      temporada_mas_vista: normalizeNumber(aggregate.temporada_mas_vista),
      visualizaciones_temporada_mas_vista: normalizeNumber(aggregate.visualizaciones_temporada_mas_vista)
    };
  }

  if (!item || !Array.isArray(item.temporadas) || !item.temporadas.length) return null;

  const byReport = Object.create(null);
  item.temporadas.forEach((temp, index) => {
    if (!temp || !Array.isArray(temp.netflix_reports)) return;

    temp.netflix_reports.forEach(report => {
      if (!report || !report.report_id) return;

      const reportId = String(report.report_id);
      const views = normalizeNumber(report.visualizaciones);
      if (!byReport[reportId]) {
        byReport[reportId] = {
          report_id: reportId,
          periodo: report.periodo || reportId,
          visualizaciones_totales: 0,
          temporada_mas_vista: null,
          visualizaciones_temporada_mas_vista: -1
        };
      }

      if (views === null) return;

      byReport[reportId].visualizaciones_totales += views;
      if (views > byReport[reportId].visualizaciones_temporada_mas_vista) {
        byReport[reportId].visualizaciones_temporada_mas_vista = views;
        byReport[reportId].temporada_mas_vista =
          normalizeNumber(temp.numero) ??
          normalizeNumber(temp.season) ??
          (index + 1);
      }
    });
  });

  const entries = Object.values(byReport).sort(
    (a, b) => getReportOrder(b.report_id) - getReportOrder(a.report_id)
  );
  if (!entries.length) return null;

  const latest = entries[0];
  if (latest.visualizaciones_temporada_mas_vista < 0) {
    latest.visualizaciones_temporada_mas_vista = null;
  }
  return latest;
}

function sortReportIdsDesc(reportIds) {
  return [...new Set(reportIds)]
    .filter(Boolean)
    .sort((a, b) => getReportOrder(b) - getReportOrder(a));
}

function getNetflixReportIds(items) {
  const reportIds = [];

  (items || []).forEach(item => {
    if (Array.isArray(item.netflix_reports)) {
      item.netflix_reports.forEach(report => {
        if (report && report.report_id) {
          reportIds.push(String(report.report_id));
        }
      });
    }

    if (Array.isArray(item.temporadas)) {
      item.temporadas.forEach(temp => {
        if (!temp || !Array.isArray(temp.netflix_reports)) return;

        temp.netflix_reports.forEach(report => {
          if (report && report.report_id) {
            reportIds.push(String(report.report_id));
          }
        });
      });
    }
  });

  return sortReportIdsDesc(reportIds);
}

function getPreviousReportId(reportIds, selectedReportId) {
  const ordered = sortReportIdsDesc(reportIds);
  const index = ordered.indexOf(selectedReportId);

  if (index === -1 || index === ordered.length - 1) {
    return null;
  }

  return ordered[index + 1];
}

function getReportPeriodLabel(reportId, items) {
  let label = '';

  (items || []).some(item => {
    const reports = Array.isArray(item.netflix_reports)
      ? item.netflix_reports
      : [];

    const report = reports.find(entry =>
      entry && entry.report_id === reportId
    );

    if (report) {
      label = report.periodo || reportId;
      return true;
    }

    if (!Array.isArray(item.temporadas)) {
      return false;
    }

    return item.temporadas.some(temp => {
      const seasonReports =
        temp && Array.isArray(temp.netflix_reports)
          ? temp.netflix_reports
          : [];

      const seasonReport = seasonReports.find(entry =>
        entry && entry.report_id === reportId
      );

      if (!seasonReport) {
        return false;
      }

      label = seasonReport.periodo || reportId;
      return true;
    });
  });

  return label || reportId;
}

function getMovieReportForPeriod(item, reportId) {
  if (!item || !Array.isArray(item.netflix_reports)) {
    return null;
  }

  return item.netflix_reports.find(report =>
    report &&
    String(report.report_id) === String(reportId)
  ) || null;
}

function getSeriesReportsForPeriod(item, reportId) {
  if (!item || !Array.isArray(item.temporadas)) {
    return [];
  }

  const rows = [];

  item.temporadas.forEach((temp, index) => {
    if (!temp || !Array.isArray(temp.netflix_reports)) {
      return;
    }

    const report = temp.netflix_reports.find(entry =>
      entry &&
      String(entry.report_id) === String(reportId)
    );

    if (!report) {
      return;
    }

    const seasonNumber =
      normalizeNumber(temp.numero) ??
      normalizeNumber(temp.season) ??
      (index + 1);

    rows.push({
      item,
      season: temp,
      seasonNumber,
      report
    });
  });

  return rows;
}

/*
 * Construye las entradas de series correspondientes
 * exclusivamente al informe seleccionado.
 *
 * Netflix rankea temporadas individualmente:
 * una misma producción puede tener más de una temporada
 * dentro del mismo informe.
 */
function buildSeriesRankingEntries(items, reportId) {
  const entries = [];

  (items || []).forEach(item => {
    if (!item || item.type === 'pelicula') {
      return;
    }

    const seasonReports =
      getSeriesReportsForPeriod(item, reportId);

    seasonReports.forEach(row => {
      const views =
        normalizeNumber(row.report.visualizaciones);

      const ranking =
        normalizeNumber(row.report.ranking_series);

      if (views === null || ranking === null) {
        return;
      }

      entries.push({
        kind: 'series',
        key:
          String(item.id) +
          '::season-' +
          String(row.seasonNumber),
        item,
        season: row.season,
        seasonNumber: row.seasonNumber,
        report: row.report,
        reportId,
        views,
        ranking,
        totalRanking:
          normalizeNumber(
            row.report.total_ranking_series
          )
      });
    });
  });

  return entries.sort((a, b) => {
    if (a.ranking !== b.ranking) {
      return a.ranking - b.ranking;
    }

    if (a.views !== b.views) {
      return b.views - a.views;
    }

    return String(a.item.title || '')
      .localeCompare(
        String(b.item.title || ''),
        'es'
      );
  });
}


/*
 * Construye las entradas de películas correspondientes
 * exclusivamente al informe seleccionado.
 */
function buildMovieRankingEntries(items, reportId) {
  const entries = [];

  (items || []).forEach(item => {
    if (!item || item.type !== 'pelicula') {
      return;
    }

    const report =
      getMovieReportForPeriod(item, reportId);

    if (!report) {
      return;
    }

    const views =
      normalizeNumber(report.visualizaciones);

    const ranking =
      normalizeNumber(report.ranking_peliculas);

    if (views === null || ranking === null) {
      return;
    }

    entries.push({
      kind: 'movies',
      key: String(item.id),
      item,
      report,
      reportId,
      views,
      ranking,
      totalRanking:
        normalizeNumber(
          report.total_ranking_peliculas
        )
    });
  });

  return entries.sort((a, b) => {
    if (a.ranking !== b.ranking) {
      return a.ranking - b.ranking;
    }

    if (a.views !== b.views) {
      return b.views - a.views;
    }

    return String(a.item.title || '')
      .localeCompare(
        String(b.item.title || ''),
        'es'
      );
  });
}


/*
 * Devuelve solamente las primeras diez posiciones
 * disponibles en Cine Argentum para el informe.
 */
function getNetflixTop10(items, reportId, type) {
  const entries =
    type === 'movies'
      ? buildMovieRankingEntries(items, reportId)
      : buildSeriesRankingEntries(items, reportId);

  return entries.slice(0, 10);
}


/*
 * NUEVO no significa estreno de Netflix.
 *
 * Una entrada es NUEVO cuando aparece en el Top 10
 * del informe seleccionado pero no estaba en el Top 10
 * del informe inmediatamente anterior.
 */
function markNewTop10Entries(
  currentEntries,
  previousEntries
) {
  const previousKeys = new Set(
    (previousEntries || []).map(entry => entry.key)
  );

  return (currentEntries || []).map(entry => ({
    ...entry,
    isNew: !previousKeys.has(entry.key)
  }));
}


/*
 * Obtiene el Top 10 completo de un período y,
 * si existe un informe anterior, calcula NUEVO.
 */
function getNetflixTop10ForReport(
  items,
  reportIds,
  reportId,
  type
) {
  const currentTop10 =
    getNetflixTop10(items, reportId, type);

  const previousReportId =
    getPreviousReportId(reportIds, reportId);

  /*
   * Si no existe informe anterior no marcamos todas
   * las entradas como NUEVO. No tenemos base
   * comparativa suficiente.
   */
  if (!previousReportId) {
    return currentTop10.map(entry => ({
      ...entry,
      isNew: false
    }));
  }

  const previousTop10 =
    getNetflixTop10(
      items,
      previousReportId,
      type
    );

  return markNewTop10Entries(
    currentTop10,
    previousTop10
  );
}

/*
 * Formato compacto para visualizaciones Netflix.
 *
 * 9.900.000 -> 9,9 M
 * 9.000.000 -> 9 M
 * 800.000   -> 800 mil
 */
function formatNetflixViews(value) {
  const n = normalizeNumber(value);

  if (n === null) {
    return 'Dato pendiente';
  }

  if (n >= 1000000) {
    const millions = n / 1000000;

    return (
      millions.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }) + ' M'
    );
  }

  if (n >= 1000) {
    const thousands = n / 1000;

    return (
      thousands.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }) + ' mil'
    );
  }

  return n.toLocaleString('es-AR');
}


/*
 * Formato de enteros para rankings.
 *
 * 8196 -> 8.196
 */
function formatNetflixRankingNumber(value) {
  const n = normalizeNumber(value);

  if (n === null) {
    return '';
  }

  return Math.trunc(n).toLocaleString('es-AR');
}


/*
 * Texto completo del ranking general.
 *
 * Ranking general: 130 de 8.196
 */
function formatNetflixRanking(entry) {
  if (!entry) {
    return '';
  }

  const ranking =
    formatNetflixRankingNumber(entry.ranking);

  const total =
    formatNetflixRankingNumber(entry.totalRanking);

  if (!ranking) {
    return '';
  }

  if (!total) {
    return 'Ranking general: ' + ranking;
  }

  return (
    'Ranking general: ' +
    ranking +
    ' de ' +
    total
  );
}


/*
 * Normaliza el nombre visible del período.
 *
 * Ene-Jun 2026 -> Ene–Jun 2026
 * Jul-Dic 2025 -> Jul–Dic 2025
 */
function formatNetflixPeriodLabel(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/Ene-Jun/gi, 'Ene–Jun')
    .replace(/Jul-Dic/gi, 'Jul–Dic');
}

function getNetflixTop10Image(entry) {
  const item =
    entry && entry.item
      ? entry.item
      : null;

  if (!item) {
    return getPlaceholderImageSrc();
  }

  if (item.horizontal_image) {
    return String(
      item.horizontal_image
    ).replace(/ /g, '%20');
  }

  if (
    entry.kind === 'series' &&
    entry.season &&
    entry.season.horizontal_image
  ) {
    return String(
      entry.season.horizontal_image
    ).replace(/ /g, '%20');
  }

  return getItemImageSrc(item);
}


function renderNetflixTop10Card(entry, position) {
  const li = document.createElement('li');

  const item = entry.item || {};
  const title = item.title || '';
  const escapedTitle = escapeAttribute(title);

  const imageSrc = getNetflixTop10Image(entry);

  const usesPosterFallback =
    !item.horizontal_image &&
    !(
      entry.kind === 'series' &&
      entry.season &&
      entry.season.horizontal_image
    );

  const seasonLabel =
    entry.kind === 'series'
      ? 'Temporada ' + entry.seasonNumber
      : '';

  const viewsLabel =
    formatNetflixViews(entry.views) +
    ' visualizaciones';

  const rankingLabel =
    formatNetflixRanking(entry);

  li.innerHTML = `
    <a href="show.html?id=${item.id}">
      <div
        class="showcase-box${usesPosterFallback ? ' uses-poster-fallback' : ''}"
        data-rank="${position}"
      >
        <img
          src="${imageSrc}"
          alt="${escapedTitle}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${getPlaceholderImageSrc()}';"
        >
      </div>

      <div class="latest-b-text">
        <strong>${escapedTitle}</strong>

        ${seasonLabel
      ? `<span class="netflix-top10-meta">${seasonLabel}</span>`
      : ''
    }

        <span class="netflix-top10-meta netflix-top10-views">
          ${viewsLabel}
        </span>

        ${rankingLabel
      ? `<span class="netflix-top10-meta">${rankingLabel}</span>`
      : ''
    }

        ${entry.isNew
      ? '<span class="netflix-new-badge">NUEVO</span>'
      : ''
    }
      </div>
    </a>
  `;

  return li;
}


let netflixTop10Slider = null;

function initNetflixTop10Slider(container) {
  if (
    !container ||
    !window.jQuery ||
    !window.jQuery.fn ||
    !window.jQuery.fn.lightSlider
  ) {
    return;
  }

  const $container = window.jQuery(container);

  netflixTop10Slider = $container.lightSlider({
    item: 5,
    slideMove: 1,
    slideMargin: 18,
    loop: false,
    pager: false,
    controls: true,
    enableTouch: true,
    enableDrag: true,
    freeMove: false,
    onSliderLoad: function () {
      $container.removeClass('cs-hidden');
    },

    responsive: [
      {
        breakpoint: 1100,
        settings: {
          item: 3,
          slideMove: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          item: 2,
          slideMove: 1
        }
      }
    ]
  });
}


function renderNetflixSeriesTop10(
  items,
  reportIds,
  reportId
) {
  const container =
    document.getElementById(
      'netflix-series-top10-slider'
    );

  if (!container) {
    return;
  }

  const entries =
    getNetflixTop10ForReport(
      items,
      reportIds,
      reportId,
      'series'
    );

  if (netflixTop10Slider && typeof netflixTop10Slider.destroy === 'function') {
    netflixTop10Slider.destroy();
    netflixTop10Slider = null;
  }
  container.classList.add('cs-hidden');
  container.innerHTML = '';

  entries.forEach((entry, index) => {
    container.appendChild(
      renderNetflixTop10Card(
        entry,
        index + 1
      )
    );
  });

  initNetflixTop10Slider(container);
}

function renderNetflixReportTabs(
  items,
  reportIds,
  activeReportId
) {
  const tabsContainer =
    document.getElementById(
      'netflix-series-report-tabs'
    );

  if (!tabsContainer) {
    return;
  }

  tabsContainer.innerHTML = '';

  reportIds.forEach(reportId => {
    const button =
      document.createElement('button');

    button.type = 'button';

    button.className =
      'netflix-report-tab' +
      (
        reportId === activeReportId
          ? ' active'
          : ''
      );

    button.setAttribute(
      'role',
      'tab'
    );

    button.setAttribute(
      'aria-selected',
      reportId === activeReportId
        ? 'true'
        : 'false'
    );

    button.dataset.reportId =
      reportId;

    button.textContent =
      formatNetflixPeriodLabel(
        getReportPeriodLabel(
          reportId,
          items
        )
      );

    button.addEventListener(
      'click',
      function () {
        const selectedReportId =
          this.dataset.reportId;

        tabsContainer
          .querySelectorAll(
            '.netflix-report-tab'
          )
          .forEach(tab => {
            const isActive =
              tab.dataset.reportId ===
              selectedReportId;

            tab.classList.toggle(
              'active',
              isActive
            );

            tab.setAttribute(
              'aria-selected',
              isActive
                ? 'true'
                : 'false'
            );
          });

        renderNetflixSeriesTop10(
          items,
          reportIds,
          selectedReportId
        );
      }
    );

    tabsContainer.appendChild(button);
  });
}

/* =========================================================
   TOP 10 DE PELÍCULAS NETFLIX
========================================================= */

let netflixMoviesTop10Slider = null;

function initNetflixMoviesTop10Slider(container) {
  if (
    !container ||
    !window.jQuery ||
    !window.jQuery.fn ||
    !window.jQuery.fn.lightSlider
  ) {
    return;
  }

  const $container =
    window.jQuery(container);

  netflixMoviesTop10Slider =
    $container.lightSlider({
      item: 5,
      slideMove: 1,
      slideMargin: 18,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,

      onSliderLoad: function () {
        $container.removeClass(
          'cs-hidden'
        );
      },

      responsive: [
        {
          breakpoint: 1100,
          settings: {
            item: 3,
            slideMove: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            item: 2,
            slideMove: 1
          }
        }
      ]
    });
}

function renderNetflixMoviesTop10(
  movies,
  reportIds,
  reportId
) {
  const section =
    document.getElementById(
      'netflix-movies-top10'
    );

  const container =
    document.getElementById(
      'netflix-movies-top10-slider'
    );

  if (!section || !container) {
    return;
  }

  const entries =
    getNetflixTop10ForReport(
      movies,
      reportIds,
      reportId,
      'movies'
    );

  if (
    netflixMoviesTop10Slider &&
    typeof netflixMoviesTop10Slider.destroy ===
    'function'
  ) {
    netflixMoviesTop10Slider.destroy();
    netflixMoviesTop10Slider = null;
  }

  container.classList.add('cs-hidden');
  container.innerHTML = '';

  if (!entries.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  entries.forEach((entry, index) => {
    container.appendChild(
      renderNetflixTop10Card(
        entry,
        index + 1
      )
    );
  });

  initNetflixMoviesTop10Slider(
    container
  );
}

function renderNetflixMovieReportTabs(
  movies,
  reportIds,
  activeReportId
) {
  const tabsContainer =
    document.getElementById(
      'netflix-movies-report-tabs'
    );

  if (!tabsContainer) {
    return;
  }

  tabsContainer.innerHTML = '';

  reportIds.forEach(reportId => {
    const button =
      document.createElement('button');

    button.type = 'button';

    button.className =
      'netflix-report-tab' +
      (
        reportId === activeReportId
          ? ' active'
          : ''
      );

    button.setAttribute(
      'role',
      'tab'
    );

    button.setAttribute(
      'aria-selected',
      reportId === activeReportId
        ? 'true'
        : 'false'
    );

    button.dataset.reportId =
      reportId;

    button.textContent =
      formatNetflixPeriodLabel(
        getReportPeriodLabel(
          reportId,
          movies
        )
      );

    button.addEventListener(
      'click',
      function () {
        const selectedReportId =
          this.dataset.reportId;

        tabsContainer
          .querySelectorAll(
            '.netflix-report-tab'
          )
          .forEach(tab => {
            const isActive =
              tab.dataset.reportId ===
              selectedReportId;

            tab.classList.toggle(
              'active',
              isActive
            );

            tab.setAttribute(
              'aria-selected',
              isActive
                ? 'true'
                : 'false'
            );
          });

        renderNetflixMoviesTop10(
          movies,
          reportIds,
          selectedReportId
        );
      }
    );

    tabsContainer.appendChild(button);
  });
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

/* =========================================================
   PRÓXIMAS SERIES DE NETFLIX
========================================================= */

function isNetflixUpcomingSeries(item) {
  if (!item || item.type === 'pelicula') {
    return false;
  }

  const status = String(item.status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const releaseValue = parseReleaseDateValue(
    item.release_date ||
    item.fecha_estreno
  );

  const today = new Date();
  const releaseYear = parseInt(item.year, 10);
  const currentYear = today.getFullYear();

  const todayValue = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    status === 'en produccion' ||
    (
      releaseValue !== null &&
      releaseValue > todayValue
    ) ||
    (
      releaseValue === null &&
      Number.isFinite(releaseYear) &&
      releaseYear > currentYear
    )
  );
}

function compareNetflixUpcomingSeries(a, b) {
  const releaseA = parseReleaseDateValue(
    a.release_date ||
    a.fecha_estreno
  );

  const releaseB = parseReleaseDateValue(
    b.release_date ||
    b.fecha_estreno
  );

  if (
    releaseA !== null &&
    releaseB !== null &&
    releaseA !== releaseB
  ) {
    return releaseA - releaseB;
  }

  if (releaseA !== null && releaseB === null) {
    return -1;
  }

  if (releaseA === null && releaseB !== null) {
    return 1;
  }

  return String(a.title || '').localeCompare(
    String(b.title || ''),
    'es',
    {
      sensitivity: 'base'
    }
  );
}

function buildNetflixUpcomingCard(item) {
  const itemId = String(item.id || '').trim();
  const title = escapeAttribute(
    item.title || 'Sin título'
  );

  const image = escapeAttribute(
    getItemImageSrc(item)
  );

  const year = escapeAttribute(
    item.year || ''
  );

  const genre = escapeAttribute(
    Array.isArray(item.genre)
      ? item.genre.join(' · ')
      : item.genre || ''
  );

  const status = String(item.status || '')
    .trim();

  const statusLabel =
    status || 'Próximamente';

  const meta = [year, genre]
    .filter(Boolean)
    .join(' · ');

  return `
    <li class="netflix-upcoming-item">
      <a
        href="show.html?id=${encodeURIComponent(itemId)}"
        class="netflix-upcoming-card"
        aria-label="Ver ficha de ${title}"
      >
        <div class="netflix-upcoming-poster">
          <img
            src="${image}"
            alt="${title}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${getPlaceholderImageSrc()}';"
          >
        </div>

        <div class="netflix-upcoming-info">
          <strong class="netflix-upcoming-title">
            ${title}
          </strong>

          <span class="netflix-upcoming-meta">
            ${meta}
          </span>

          <span class="netflix-upcoming-status">
            ${escapeAttribute(statusLabel)}
          </span>
        </div>
      </a>
    </li>
  `;
}

function renderNetflixUpcomingSeries(series) {
  const section = document.getElementById(
    'netflix-upcoming'
  );

  const container = document.getElementById(
    'netflix-upcoming-slider'
  );

  const countElement = document.getElementById(
    'netflix-upcoming-count'
  );

  if (!section || !container) {
    return;
  }

  const upcomingSeries = series
    .filter(isNetflixUpcomingSeries)
    .sort(compareNetflixUpcomingSeries);

  if (!upcomingSeries.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  if (countElement) {
    countElement.textContent =
      upcomingSeries.length +
      ' ' +
      (
        upcomingSeries.length === 1
          ? 'serie próxima'
          : 'series próximas'
      );
  }

  container.innerHTML = upcomingSeries
    .map(buildNetflixUpcomingCard)
    .join('');

  if (
    window.jQuery &&
    window.jQuery.fn &&
    window.jQuery.fn.lightSlider
  ) {
    window.jQuery(container).lightSlider({
      item: 5,
      autoWidth: false,
      slideMove: 1,
      slideMargin: 18,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,
      responsive: [
        {
          breakpoint: 1100,
          settings: {
            item: 4,
            slideMove: 1,
            slideMargin: 14
          }
        },
        {
          breakpoint: 768,
          settings: {
            item: 2,
            slideMove: 1,
            slideMargin: 10
          }
        }
      ]
    });
  }

  container.classList.remove('cs-hidden');
  container.classList.add('slider-ready');
}

/* =========================================================
   SERIES DE NETFLIX EMITIDAS EN TV
========================================================= */

function getNetflixTvChannels(item) {
  const channels = [];

  if (Array.isArray(item.air_channels)) {
    channels.push(...item.air_channels);
  }

  if (Array.isArray(item.air_broadcasts)) {
    item.air_broadcasts.forEach(broadcast => {
      if (broadcast && broadcast.channel) {
        channels.push(broadcast.channel);
      }
    });
  }

  return Array.from(
    new Set(
      channels
        .filter(Boolean)
        .map(channel => String(channel).trim())
        .filter(channel => {
          const normalized = channel.toLowerCase();
          return normalized && !normalized.includes('netflix');
        })
    )
  );
}

function buildNetflixTvCard(item) {
  const itemId = String(item.id || '').trim();
  const title = escapeAttribute(item.title || 'Sin título');
  const image = escapeAttribute(getItemImageSrc(item));
  const year = escapeAttribute(item.year || '');
  const channels = getNetflixTvChannels(item);
  const channelLabel = escapeAttribute(channels.join(' · '));

  return `
  <a
    href="show.html?id=${encodeURIComponent(itemId)}"
    class="actor-movie-card"
    aria-label="Ver ficha de ${title}"
  >
    <img
      src="${image}"
      alt="${title}"
      loading="lazy"
      onerror="this.onerror=null;this.src='${getPlaceholderImageSrc()}';"
    >

    <div class="actor-movie-info">
      <div class="actor-movie-title">
        ${title}
      </div>

      ${year
      ? `<div class="actor-movie-meta">${year}</div>`
      : ''
    }

      <div class="netflix-tv-channel">
        ${channelLabel}
      </div>
    </div>
  </a>
`;
}

function renderNetflixTvSeries(series) {
  const section = document.getElementById('netflix-tv-broadcasts');
  const container = document.getElementById('netflix-tv-list');
  const countElement = document.getElementById('netflix-tv-count');

  if (!section || !container) {
    return;
  }

  const tvSeries = series
    .filter(item => getNetflixTvChannels(item).length > 0)
    .sort(compareSeriesByLatestReleaseDesc);

  if (!tvSeries.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  container.innerHTML = tvSeries
    .map(buildNetflixTvCard)
    .join('');

  if (countElement) {
    countElement.textContent =
      `${tvSeries.length} ${tvSeries.length === 1
        ? 'serie emitida en televisión'
        : 'series emitidas en televisión'
      }.`;
  }
}

/* =========================================================
   PRÓXIMAS PELÍCULAS DE NETFLIX
========================================================= */

function isNetflixUpcomingMovie(item) {
  if (!item || item.type !== 'pelicula') {
    return false;
  }

  const status = String(item.status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const releaseValue = parseReleaseDateValue(
    item.release_date ||
    item.fecha_estreno
  );

  const releaseYear = parseInt(item.year, 10);
  const today = new Date();
  const currentYear = today.getFullYear();

  const todayValue = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    status === 'en produccion' ||
    (
      releaseValue !== null &&
      releaseValue > todayValue
    ) ||
    (
      releaseValue === null &&
      Number.isFinite(releaseYear) &&
      releaseYear > currentYear
    )
  );
}

function renderNetflixUpcomingMovies(movies) {
  const section = document.getElementById(
    'netflix-upcoming-movies'
  );

  const container = document.getElementById(
    'netflix-upcoming-movies-slider'
  );

  const countElement = document.getElementById(
    'netflix-upcoming-movies-count'
  );

  if (!section || !container) {
    return;
  }

  const upcomingMovies = movies
    .filter(isNetflixUpcomingMovie)
    .sort(compareNetflixUpcomingSeries);

  if (!upcomingMovies.length) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  if (countElement) {
    countElement.textContent =
      upcomingMovies.length +
      ' ' +
      (
        upcomingMovies.length === 1
          ? 'película próxima'
          : 'películas próximas'
      );
  }

  container.innerHTML = upcomingMovies
    .map(buildNetflixUpcomingCard)
    .join('');

  if (
    window.jQuery &&
    window.jQuery.fn &&
    window.jQuery.fn.lightSlider
  ) {
    window.jQuery(container).lightSlider({
      item: 5,
      autoWidth: false,
      slideMove: 1,
      slideMargin: 18,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,
      responsive: [
        {
          breakpoint: 1100,
          settings: {
            item: 4,
            slideMove: 1,
            slideMargin: 14
          }
        },
        {
          breakpoint: 768,
          settings: {
            item: 2,
            slideMove: 1,
            slideMargin: 10
          }
        }
      ]
    });
  }

  container.classList.remove('cs-hidden');
  container.classList.add('slider-ready');
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
      const shouldRenderNetflixPage =
        !!document.getElementById(
          'actorMoviesList'
        ) ||
        !!document.getElementById(
          'netflixMoviesList'
        );
      if (shouldRenderIndexCarousel) {
        renderIndexNetflixCarousel(movies);
        window.netflixDebug.renderCalled = true;
      }

      if (shouldRenderNetflixPage) {
        renderNetflixUpcomingSeries(series);
        renderNetflixTvSeries(series);
        renderNetflixUpcomingMovies(movies);

        const reportIds =
          getNetflixReportIds(
            netflixItems
          );

        if (reportIds.length) {
          const activeReportId =
            reportIds[0];

          renderNetflixReportTabs(
            netflixItems,
            reportIds,
            activeReportId
          );

          renderNetflixSeriesTop10(
            netflixItems,
            reportIds,
            activeReportId
          );
        }

        const movieReportIds =
          getNetflixReportIds(movies);

        if (movieReportIds.length) {
          const activeMovieReportId =
            movieReportIds[0];

          renderNetflixMovieReportTabs(
            movies,
            movieReportIds,
            activeMovieReportId
          );

          renderNetflixMoviesTop10(
            movies,
            movieReportIds,
            activeMovieReportId
          );
        }

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

/*
 * Obtiene la medición de una película correspondiente
 * al informe Netflix más reciente disponible.
 */
function getMovieCatalogMetric(item) {
  const reportIds =
    getNetflixReportIds([item]);

  for (const reportId of reportIds) {
    const entries =
      buildMovieRankingEntries(
        [item],
        reportId
      );

    if (entries.length) {
      return entries[0];
    }
  }

  return null;
}

/*
 * Obtiene la medición de una película correspondiente
 * al informe Netflix más reciente disponible.
 */
function getMovieCatalogMetric(item) {
  const reportIds =
    getNetflixReportIds([item]);

  for (const reportId of reportIds) {
    const entries =
      buildMovieRankingEntries(
        [item],
        reportId
      );

    if (entries.length) {
      return entries[0];
    }
  }

  return null;
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

    /*
 * Obtiene la temporada más vista de una serie dentro
 * del informe Netflix más reciente disponible.
 *
 * Mantiene el mismo criterio utilizado por el Top 10:
 * temporada, visualizaciones y ranking pertenecen
 * al mismo informe.
 */
    function getSeriesCatalogMetric(item) {
      const reportIds = getNetflixReportIds([item]);

      for (const reportId of reportIds) {
        const entries = buildSeriesRankingEntries(
          [item],
          reportId
        );

        if (!entries.length) {
          continue;
        }

        return entries
          .slice()
          .sort((a, b) => {
            if (a.views !== b.views) {
              return b.views - a.views;
            }

            return a.ranking - b.ranking;
          })[0];
      }

      return null;
    }

    let netflixMetricHtml = '';

    if (type === 'series') {
      const catalogMetric =
        getSeriesCatalogMetric(item);

      if (catalogMetric) {
        const periodLabel =
          formatNetflixPeriodLabel(
            catalogMetric.report.periodo ||
            catalogMetric.reportId
          );

        const seasonLabel =
          'Temporada ' +
          catalogMetric.seasonNumber;

        const seasonAndPeriod = [
          seasonLabel,
          periodLabel
        ]
          .filter(Boolean)
          .join(' · ');

        const viewsLabel =
          formatNetflixViews(
            catalogMetric.views
          ) +
          ' visualizaciones';

        const rankingLabel =
          formatNetflixRanking(
            catalogMetric
          );

        netflixMetricHtml = `
      <div class="actor-movie-meta netflix-catalog-season">
        ${seasonAndPeriod}
      </div>

      <div class="actor-movie-viewers">
        ${viewsLabel}
      </div>

      ${rankingLabel
            ? `
            <div class="actor-movie-meta netflix-catalog-ranking">
              ${rankingLabel}
            </div>
          `
            : ''
          }
    `;
      }
    } else if (item.netflix_metric) {
      const metric = item.netflix_metric;

      netflixMetricHtml = `
    <div class="actor-movie-viewers">
      Visualizaciones (${metric.periodo ||
        metric.report_id ||
        'Netflix'
        }): ${formatViews(metric.visualizaciones_totales)}
    </div>
  `;
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
  const select = document.getElementById(
    'actorSortCustom'
  );

  const yearContainer = document.getElementById(
    'netflix-year-filters'
  );

  const genreContainer = document.getElementById(
    'netflix-genre-filters'
  );

  let currentSort = 'year';
  let currentYear = 'all';
  let currentGenre = 'all';

  function getSeriesGenreValues(item) {
    const genres = Array.isArray(item.genre)
      ? item.genre
      : [item.genre];

    return genres
      .filter(Boolean)
      .map(genre => normalizeGenre(genre));
  }

  function getAvailableYears() {
    return Array.from(
      new Set(
        allSeries
          .map(item => parseInt(item.year, 10))
          .filter(Number.isFinite)
      )
    ).sort((a, b) => b - a);
  }

  function getAvailableGenres() {
    const genreMap = new Map();

    allSeries.forEach(item => {
      const originalGenres = Array.isArray(item.genre)
        ? item.genre
        : [item.genre];

      originalGenres
        .filter(Boolean)
        .forEach(genre => {
          const normalizedGenre =
            normalizeGenre(genre);

          if (
            normalizedGenre &&
            !genreMap.has(normalizedGenre)
          ) {
            genreMap.set(
              normalizedGenre,
              displayGenre(normalizedGenre)
            );
          }
        });
    });

    return Array.from(genreMap.entries())
      .map(([value, label]) => ({
        value,
        label
      }))
      .sort((a, b) => {
        return a.label.localeCompare(
          b.label,
          'es',
          {
            sensitivity: 'base'
          }
        );
      });
  }

  function updateYearButtons() {
    if (!yearContainer) {
      return;
    }

    yearContainer
      .querySelectorAll('[data-netflix-year]')
      .forEach(button => {
        const value =
          button.getAttribute(
            'data-netflix-year'
          ) || 'all';

        const isActive =
          value === currentYear;

        button.classList.toggle(
          'active',
          isActive
        );

        button.setAttribute(
          'aria-pressed',
          isActive ? 'true' : 'false'
        );
      });
  }

  function updateGenreButtons() {
    if (!genreContainer) {
      return;
    }

    genreContainer
      .querySelectorAll('[data-netflix-genre]')
      .forEach(button => {
        const value =
          button.getAttribute(
            'data-netflix-genre'
          ) || 'all';

        const isActive =
          value === currentGenre;

        button.classList.toggle(
          'active',
          isActive
        );

        button.setAttribute(
          'aria-pressed',
          isActive ? 'true' : 'false'
        );
      });
  }

  function renderYearFilters() {
    if (!yearContainer) {
      return;
    }

    const filters = [
      {
        value: 'all',
        label: 'Todas'
      },
      ...getAvailableYears().map(year => ({
        value: String(year),
        label: String(year)
      }))
    ];

    yearContainer.innerHTML = filters
      .map(filter => {
        const isActive =
          filter.value === currentYear;

        return `
          <button
            type="button"
            class="netflix-filter-button${isActive ? ' active' : ''}"
            data-netflix-year="${filter.value}"
            aria-pressed="${isActive ? 'true' : 'false'}"
          >
            ${filter.label}
          </button>
        `;
      })
      .join('');

    yearContainer
      .querySelectorAll('[data-netflix-year]')
      .forEach(button => {
        button.addEventListener(
          'click',
          function () {
            currentYear =
              button.getAttribute(
                'data-netflix-year'
              ) || 'all';

            updateYearButtons();
            renderFiltered();
          }
        );
      });
  }

  function renderGenreFilters() {
    if (!genreContainer) {
      return;
    }

    const filters = [
      {
        value: 'all',
        label: 'Todos'
      },
      ...getAvailableGenres()
    ];

    genreContainer.innerHTML = filters
      .map(filter => {
        const isActive =
          filter.value === currentGenre;

        return `
          <button
            type="button"
            class="netflix-filter-button${isActive ? ' active' : ''}"
            data-netflix-genre="${filter.value}"
            aria-pressed="${isActive ? 'true' : 'false'}"
          >
            ${filter.label}
          </button>
        `;
      })
      .join('');

    genreContainer
      .querySelectorAll('[data-netflix-genre]')
      .forEach(button => {
        button.addEventListener(
          'click',
          function () {
            currentGenre =
              button.getAttribute(
                'data-netflix-genre'
              ) || 'all';

            updateGenreButtons();
            renderFiltered();
          }
        );
      });
  }

  function renderFiltered() {
    let sourceItems = allSeries.filter(item => {
      const matchesYear =
        currentYear === 'all' ||
        parseInt(item.year, 10) ===
        parseInt(currentYear, 10);

      const matchesGenre =
        currentGenre === 'all' ||
        getSeriesGenreValues(item)
          .includes(currentGenre);

      return matchesYear && matchesGenre;
    });

    const filtered = sortAndFilterSeries(
      sourceItems,
      currentSort
    );

    const countElement =
      document.getElementById(
        'actor-movie-count'
      );

    if (countElement) {
      countElement.textContent =
        filtered.length +
        ' ' +
        (
          filtered.length === 1
            ? 'serie de Netflix'
            : 'series de Netflix'
        );
    }

    renderCards(
      filtered,
      'actorMoviesList',
      'series'
    );
  }

  renderYearFilters();
  renderGenreFilters();

  if (select) {
    setupCustomSelect(
      'actorSortCustom',
      function (value) {
        currentSort = value;
        renderFiltered();
      }
    );
  }

  renderFiltered();
}

function setupMovieFilters(allMovies) {
  const yearContainer =
    document.getElementById(
      'netflix-movie-year-filters'
    );

  const genreContainer =
    document.getElementById(
      'netflix-movie-genre-filters'
    );

  let currentYear = 'all';
  let currentGenre = 'all';

  function getMovieGenres(item) {
    const genres = Array.isArray(item.genre)
      ? item.genre
      : [item.genre];

    return genres
      .filter(Boolean)
      .map(genre =>
        normalizeGenre(genre)
      );
  }

  const availableYears =
    Array.from(
      new Set(
        allMovies
          .map(item =>
            parseInt(item.year, 10)
          )
          .filter(Number.isFinite)
      )
    ).sort((a, b) => b - a);

  const genreMap = new Map();

  allMovies.forEach(item => {
    const genres = Array.isArray(item.genre)
      ? item.genre
      : [item.genre];

    genres
      .filter(Boolean)
      .forEach(genre => {
        const normalized =
          normalizeGenre(genre);

        if (
          normalized &&
          !genreMap.has(normalized)
        ) {
          genreMap.set(
            normalized,
            displayGenre(normalized)
          );
        }
      });
  });

  const availableGenres =
    Array.from(genreMap.entries())
      .map(([value, label]) => ({
        value,
        label
      }))
      .sort((a, b) =>
        a.label.localeCompare(
          b.label,
          'es',
          {
            sensitivity: 'base'
          }
        )
      );

  function updateYearButtons() {
    if (!yearContainer) {
      return;
    }

    yearContainer
      .querySelectorAll(
        '[data-netflix-movie-year]'
      )
      .forEach(button => {
        const value =
          button.dataset.netflixMovieYear ||
          'all';

        const isActive =
          value === currentYear;

        button.classList.toggle(
          'active',
          isActive
        );

        button.setAttribute(
          'aria-pressed',
          isActive ? 'true' : 'false'
        );
      });
  }

  function updateGenreButtons() {
    if (!genreContainer) {
      return;
    }

    genreContainer
      .querySelectorAll(
        '[data-netflix-movie-genre]'
      )
      .forEach(button => {
        const value =
          button.dataset.netflixMovieGenre ||
          'all';

        const isActive =
          value === currentGenre;

        button.classList.toggle(
          'active',
          isActive
        );

        button.setAttribute(
          'aria-pressed',
          isActive ? 'true' : 'false'
        );
      });
  }

  function renderFiltered() {
    const sourceItems =
      allMovies.filter(item => {
        const matchesYear =
          currentYear === 'all' ||
          parseInt(item.year, 10) ===
          parseInt(currentYear, 10);

        const matchesGenre =
          currentGenre === 'all' ||
          getMovieGenres(item)
            .includes(currentGenre);

        return (
          matchesYear &&
          matchesGenre
        );
      });

    const filtered =
      sortAndFilterMovies(
        sourceItems,
        'netflix-views-desc'
      );

    const countElement =
      document.getElementById(
        'netflix-movie-count'
      );

    if (countElement) {
      countElement.textContent =
        filtered.length +
        ' ' +
        (
          filtered.length === 1
            ? 'película de Netflix'
            : 'películas de Netflix'
        );
    }

    renderCards(
      filtered,
      'netflixMoviesList',
      'movies'
    );
  }

  if (yearContainer) {
    const yearFilters = [
      {
        value: 'all',
        label: 'Todas'
      },
      ...availableYears.map(year => ({
        value: String(year),
        label: String(year)
      }))
    ];

    yearContainer.innerHTML =
      yearFilters
        .map(filter => `
          <button
            type="button"
            class="netflix-filter-button${filter.value === currentYear ? ' active' : ''}"
            data-netflix-movie-year="${filter.value}"
            aria-pressed="${filter.value === currentYear ? 'true' : 'false'}"
          >
            ${filter.label}
          </button>
        `)
        .join('');

    yearContainer
      .querySelectorAll(
        '[data-netflix-movie-year]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          function () {
            currentYear =
              this.dataset.netflixMovieYear ||
              'all';

            updateYearButtons();
            renderFiltered();
          }
        );
      });
  }

  if (genreContainer) {
    const genreFilters = [
      {
        value: 'all',
        label: 'Todos'
      },
      ...availableGenres
    ];

    genreContainer.innerHTML =
      genreFilters
        .map(filter => `
          <button
            type="button"
            class="netflix-filter-button${filter.value === currentGenre ? ' active' : ''}"
            data-netflix-movie-genre="${filter.value}"
            aria-pressed="${filter.value === currentGenre ? 'true' : 'false'}"
          >
            ${filter.label}
          </button>
        `)
        .join('');

    genreContainer
      .querySelectorAll(
        '[data-netflix-movie-genre]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          function () {
            currentGenre =
              this.dataset.netflixMovieGenre ||
              'all';

            updateGenreButtons();
            renderFiltered();
          }
        );
      });
  }

  renderFiltered();
}
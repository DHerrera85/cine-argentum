(function () {
  function parseReleaseDate(value) {
    if (!value) return null;
    var parts = String(value).trim().split('/');
    if (parts.length !== 3) return null;

    var day = Number(parts[0]);
    var month = Number(parts[1]);
    var year = Number(parts[2]);
    if (!day || !month || !year) return null;

    var date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  function collectSeasonDateStrings(item) {
    var out = [];

    // New simple format: season_release_dates: ["dd/mm/yyyy", ...]
    if (Array.isArray(item.season_release_dates)) {
      item.season_release_dates.forEach(function (dateStr) {
        if (dateStr) out.push(String(dateStr));
      });
    }

    // Alternative detailed format:
    // temporadas: [{ season: 1, release_date: "dd/mm/yyyy" }, { season: 2, fecha_estreno: "dd/mm/yyyy" }]
    if (Array.isArray(item.temporadas)) {
      item.temporadas.forEach(function (season) {
        if (!season || typeof season !== 'object') return;
        if (season.release_date) {
          out.push({ label: String(season.release_date), image: season.image ? String(season.image) : '' });
        }
        if (season.fecha_estreno) {
          out.push({ label: String(season.fecha_estreno), image: season.image ? String(season.image) : '' });
        }
      });
    }

    return out;
  }

  function getReleaseCandidates(item) {
    var candidates = [];

    if (item.release_date) {
      candidates.push({
        label: String(item.release_date),
        date: parseReleaseDate(item.release_date),
        source: 'release_date'
      });
    }

    if (item.fecha_estreno) {
      candidates.push({
        label: String(item.fecha_estreno),
        date: parseReleaseDate(item.fecha_estreno),
        source: 'fecha_estreno'
      });
    }

    collectSeasonDateStrings(item).forEach(function (raw) {
      var dateLabel = '';
      var imageOverride = '';

      if (raw && typeof raw === 'object') {
        dateLabel = raw.label || raw.release_date || raw.fecha_estreno || '';
        imageOverride = raw.image || '';
      } else {
        dateLabel = raw;
      }

      candidates.push({
        label: String(dateLabel),
        date: parseReleaseDate(dateLabel),
        source: 'season',
        imageOverride: imageOverride ? String(imageOverride) : ''
      });
    });

    return candidates.filter(function (c) { return c.date !== null; });
  }

  function getBestReleaseForYear(item, year) {
    var candidates = getReleaseCandidates(item);
    if (!candidates.length) return null;

    var inYear = candidates.filter(function (c) {
      return String(c.date.getFullYear()) === String(year);
    });

    var list = inYear.length ? inYear : candidates;
    list.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); });
    return list[0];
  }

  function getBestReleaseForYears(item, years) {
    var candidates = getReleaseCandidates(item);
    if (!candidates.length) return null;

    var normalizedYears = (years || []).map(function (y) { return String(y).trim(); });
    var inYears = candidates.filter(function (c) {
      return normalizedYears.indexOf(String(c.date.getFullYear())) !== -1;
    });

    var list = inYears.length ? inYears : candidates;
    list.sort(function (a, b) { return b.date.getTime() - a.date.getTime(); });
    return list[0];
  }

  function getSectionYears(section) {
    var yearsAttr = section.getAttribute('data-years');
    if (yearsAttr) {
      return String(yearsAttr)
        .split(',')
        .map(function (v) { return String(v).trim(); })
        .filter(function (v) { return v.length > 0; });
    }

    var year = section.getAttribute('data-year') || '2026';
    return [String(year).trim()];
  }

  function normalizeType(value, item) {
    var t = (value || '').toString().toLowerCase();
    if (t === 'pelicula' || t === 'movie') return 'pelicula';
    if (t === 'serie' || t === 'series') return 'serie';

    var id = (item && item.id ? String(item.id) : '').toUpperCase();
    if (id.indexOf('V') === 0) return 'serie';

    return '';
  }

  function normalizeText(value) {
    var text = value == null ? '' : String(value);

    if (typeof text.normalize === 'function') {
      text = text.normalize('NFD');
    }

    return text
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function isStreamingProduction(item) {
    var streamingPlatforms = [
      'Netflix',
      'Flow',
      'Disney+',
      'HBO Max',
      'Prime Video',
      'Streaming',
      'Reelshort',
      'Shorta'
    ].map(normalizeText);

    var values = [];

    if (item.platform) {
      values.push(item.platform);
    }

    if (item.channel) {
      values.push(item.channel);
    }

    if (Array.isArray(item.platforms)) {
      values = values.concat(item.platforms);
    }

    if (Array.isArray(item.channels)) {
      values = values.concat(item.channels);
    }

    return values.some(function (value) {
      return streamingPlatforms.indexOf(normalizeText(value)) !== -1;
    });
  }

  function normalizeText(value) {
    var text = value == null ? '' : String(value);

    if (typeof text.normalize === 'function') {
      text = text.normalize('NFD');
    }

    return text
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function isStreamingProduction(item) {
    var streamingPlatforms = [
      'Netflix',
      'Flow',
      'Disney+',
      'HBO Max',
      'Prime Video',
      'Streaming',
      'Reelshort',
      'Shorta'
    ].map(normalizeText);

    var values = [];

    if (item.platform) values.push(item.platform);
    if (item.channel) values.push(item.channel);
    if (Array.isArray(item.platforms)) values = values.concat(item.platforms);
    if (Array.isArray(item.channels)) values = values.concat(item.channels);

    return values.some(function (value) {
      return streamingPlatforms.indexOf(normalizeText(value)) !== -1;
    });
  }

  function buildCardHtml(item, isUpcoming) {
    var fallbackYear = (item && item.year) ? String(item.year) : '';
    var releaseLabel = item.releaseDate
      ? item.releaseDate
      : (isUpcoming ? ('Proximamente ' + (fallbackYear || '2026')) : fallbackYear);
    var typeLabel =
      item.category === 'vertical'
        ? 'Vertical'
        : (
          item.type === 'pelicula'
            ? 'Película'
            : 'Serie'
        ); var statusBadge = isUpcoming
          ? '<span class="cartelera-status cartelera-status-upcoming">PROXIMAMENTE</span>'
          : '';

    return '' +
      '<li class="' + (item.type === 'pelicula' ? 'item-a' : 'item-b') + '" data-cartelera-type="' + item.type + '">' +
      '<a href="show.html?id=' + encodeURIComponent(item.id) + '">' +
      '<div class="latest-box">' +
      '<div class="latest-b-img">' +
      statusBadge +
      '<img src="' + item.image + '" loading="lazy" alt="' + item.title + '">' +
      '</div>' +
      '<div class="latest-b-text">' +
      '<strong>' + item.title + '</strong>' +
      '<p>' + releaseLabel + '</p>' +
      '<span class="cartelera-chip">' + typeLabel + '</span>' +
      '</div>' +
      '</div>' +
      '</a>' +
      '</li>';
  }

  function ensureSlider(ulEl) {
    if (
      !window.jQuery ||
      !window.jQuery.fn ||
      !window.jQuery.fn.lightSlider
    ) {
      return;
    }

    var $ul = window.jQuery(ulEl);
    var slider = ulEl._carteleraSlider;

    /*
     * LightSlider devuelve la instancia al inicializarse.
     * La conservamos en el elemento para poder actualizarla.
     */
    if (
      slider &&
      typeof slider.refresh === 'function'
    ) {
      slider.refresh();
      return;
    }

    /*
     * streaming.html utiliza la proporción de tv-90s.html.
     * Las demás carteleras conservan su configuración original.
     */
    var streamingSection = ulEl.closest
      ? ulEl.closest(
        '.cartelera-2026-section[data-cartelera-content="streaming-series"]'
      )
      : null;

    var useStreamingLayout = Boolean(streamingSection);

    ulEl._carteleraSlider = $ul.lightSlider({
      item: 5,
      autoWidth: false,
      slideMove: 1,
      slideMargin: useStreamingLayout ? 18 : 16,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: useStreamingLayout ? false : true,

      responsive: useStreamingLayout
        ? [
          {
            breakpoint: 1100,
            settings: {
              item: 3,
              slideMove: 1,
              slideMargin: 14
            }
          },
          {
            breakpoint: 768,
            settings: {
              item: 2,
              slideMove: 1,
              slideMargin: 12
            }
          }
        ]
        : [
          {
            breakpoint: 1200,
            settings: {
              item: 4,
              slideMove: 1,
              slideMargin: 14
            }
          },
          {
            breakpoint: 860,
            settings: {
              item: 3,
              slideMove: 1,
              slideMargin: 12
            }
          },
          {
            breakpoint: 640,
            settings: {
              item: 2,
              slideMove: 1,
              slideMargin: 10
            }
          }
        ]
    });
  }

  function destroySlider(ulEl) {
    if (!ulEl) return;

    var slider = ulEl._carteleraSlider;

    /*
     * Se utiliza la misma instancia devuelta
     * originalmente por LightSlider.
     */
    if (
      slider &&
      typeof slider.destroy === 'function'
    ) {
      slider.destroy();
    }

    ulEl._carteleraSlider = null;
  }

  function renderFilteredList(section, type) {
    var listEl = section.querySelector(
      'ul[data-cartelera-list="all"]'
    );

    if (!listEl) {
      return;
    }

    var allRows =
      section._carteleraRows || [];

    var rows = allRows.filter(
      function (row) {
        var rowType =
          row.item.category ||
          row.item.type;

        return (
          type === 'all' ||
          rowType === type
        );
      }
    );

    destroySlider(listEl);

    listEl.innerHTML = rows.length
      ? rows
        .map(function (row) {
          return buildCardHtml(
            row.item,
            row.upcoming
          );
        })
        .join('')
      : [
        '<li class="item-a">',
        '<div class="latest-box">',
        '<div class="latest-b-text">',
        '<strong>Sin resultados</strong>',
        '<p class="cartelera-empty">',
        'No hay títulos para este filtro.',
        '</p>',
        '</div>',
        '</div>',
        '</li>'
      ].join('');

    ensureSlider(listEl);
  }

  function getFilterCountLabel(
    type,
    count,
    section
  ) {
    var contentMode = String(
      section.getAttribute(
        'data-cartelera-content'
      ) || 'all'
    ).toLowerCase();

    var filterMode = String(
      section.getAttribute(
        'data-cartelera-filters'
      ) || ''
    ).toLowerCase();

    /*
     * Contadores específicos de
     * Series en Streaming.
     */
    if (
      contentMode === 'streaming-series' &&
      filterMode === 'series-verticals'
    ) {
      if (type === 'serie') {
        return String(count) + ' series';
      }

      if (type === 'vertical') {
        return String(count) + ' verticales';
      }

      return String(count) +
        ' series y verticales';
    }

    /*
     * En Producción:
     * solo contiene series.
     */
    if (contentMode === 'streaming-series') {
      return String(count) + ' series';
    }

    /*
     * Comportamiento general utilizado
     * por Cine y Series 2026.
     */
    var label = 'películas y series';

    if (type === 'pelicula') {
      label = 'películas';
    }

    if (type === 'serie') {
      label = 'series';
    }

    return String(count) + ' ' + label;
  }

  function updateSectionCount(
    section,
    type
  ) {
    var countEl =
      section.querySelector(
        '.cartelera-count'
      );

    if (!countEl) {
      return;
    }

    var rows =
      section._carteleraRows || [];

    var count = rows.filter(
      function (row) {
        var rowType =
          row.item.category ||
          row.item.type;

        return (
          type === 'all' ||
          rowType === type
        );
      }
    ).length;

    countEl.textContent =
      getFilterCountLabel(
        type,
        count,
        section
      );
  }

  function applyTypeFilter(section, type) {
    renderFilteredList(section, type);
    updateSectionCount(section, type);
  }

  function mountSection(section, items) {
    var years = getSectionYears(section);
    var primaryYear = years[0] || '2026';

    var mode = String(
      section.getAttribute('data-cartelera-mode') || 'released'
    ).toLowerCase();

    var contentMode = String(
      section.getAttribute('data-cartelera-content') || 'all'
    ).toLowerCase();

    var listEl = section.querySelector(
      'ul[data-cartelera-list="all"]'
    );

    if (!listEl) {
      return;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var filtered = items
      .filter(function (item) {
        if (!item || !item.id) {
          return false;
        }

        var best = getBestReleaseForYears(item, years);
        var itemYear = String(item.year || '');

        var yearMatch =
          years.indexOf(itemYear) !== -1;

        var releaseYearMatch =
          best &&
          years.indexOf(
            String(best.date.getFullYear())
          ) !== -1;

        if (!yearMatch && !releaseYearMatch) {
          return false;
        }

        var itemType =
          normalizeType(
            item.type,
            item
          );

        var isVertical =
          item.streaming_row ===
          'ficciones_verticales';

        if (
          contentMode ===
          'streaming-series'
        ) {
          return (
            itemType === 'serie' &&
            (
              isStreamingProduction(item) ||
              isVertical
            )
          );
        }

        /*
         * Las secciones marcadas como streaming-series
         * admiten únicamente series pertenecientes a
         * plataformas de streaming.
         */
        if (contentMode === 'streaming-series') {
          return (
            itemType === 'serie' &&
            isStreamingProduction(item)
          );
        }

        return (
          itemType === 'pelicula' ||
          itemType === 'serie'
        );
      })
      .map(function (item) {
        var best = getBestReleaseForYears(
          item,
          years
        );

        var releaseDateValue =
          best ? best.label : '';

        var releaseDateObj =
          best ? best.date : null;

        var bestImage =
          best &&
            best.imageOverride &&
            String(best.imageOverride).trim()
            ? String(best.imageOverride).trim()
            : '';

        var itemType = normalizeType(
          item.type,
          item
        );

        var isVertical =
          item.streaming_row ===
          'ficciones_verticales';

        return {
          id: item.id,

          category:
            isVertical
              ? 'vertical'
              : itemType,

          title:
            item.title || 'Sin título',

          image:
            bestImage ||
            (
              item.image &&
                String(item.image).trim()
                ? item.image
                : 'images/verticals/placeholder-280x420.svg'
            ),

          type:
            itemType,

          year:
            item.year &&
              String(item.year).trim()
              ? String(item.year).trim()
              : (
                best
                  ? String(
                    best.date.getFullYear()
                  )
                  : primaryYear
              ),

          releaseDate:
            releaseDateValue,

          releaseTs:
            releaseDateObj
              ? releaseDateObj.getTime()
              : null
        };
      });

    /*
     * Series ya estrenadas.
     * Se muestran desde la más reciente.
     */
    var released = filtered
      .filter(function (item) {
        return (
          item.releaseTs !== null &&
          item.releaseTs <= today.getTime()
        );
      })
      .sort(function (a, b) {
        return b.releaseTs - a.releaseTs;
      });

    /*
     * Series en producción o próximas.
     * Primero aparecen las que tienen fecha confirmada.
     */
    var upcoming = filtered
      .filter(function (item) {
        return (
          item.releaseTs === null ||
          item.releaseTs > today.getTime()
        );
      })
      .sort(function (a, b) {
        var timeA =
          a.releaseTs === null
            ? Number.MAX_SAFE_INTEGER
            : a.releaseTs;

        var timeB =
          b.releaseTs === null
            ? Number.MAX_SAFE_INTEGER
            : b.releaseTs;

        if (timeA !== timeB) {
          return timeA - timeB;
        }

        var yearA =
          Number(a.year) ||
          Number.MAX_SAFE_INTEGER;

        var yearB =
          Number(b.year) ||
          Number.MAX_SAFE_INTEGER;

        if (yearA !== yearB) {
          return yearA - yearB;
        }

        return String(a.title || '')
          .localeCompare(
            String(b.title || ''),
            'es',
            { sensitivity: 'base' }
          );
      });

    var rows =
      mode === 'upcoming'
        ? upcoming.map(function (item) {
          return {
            item: item,
            upcoming: true
          };
        })
        : released.map(function (item) {
          return {
            item: item,
            upcoming: false
          };
        });

    section._carteleraRows = rows;

    var defaultType = 'all';

    updateSectionCount(
      section,
      defaultType
    );

    listEl.innerHTML =
      rows.length
        ? rows
          .map(function (row) {
            return buildCardHtml(
              row.item,
              row.upcoming
            );
          })
          .join('')
        : [
          '<li class="item-a">',
          '<div class="latest-box">',
          '<div class="latest-b-text">',
          '<strong>Sin títulos</strong>',
          '<p class="cartelera-empty">',
          'No hay series para esta sección.',
          '</p>',
          '</div>',
          '</div>',
          '</li>'
        ].join('');

    Array.prototype.forEach.call(
      section.querySelectorAll(
        '[data-cartelera-filter]'
      ),
      function (button) {
        button.addEventListener(
          'click',
          function () {
            Array.prototype.forEach.call(
              section.querySelectorAll(
                '[data-cartelera-filter]'
              ),
              function (otherButton) {
                otherButton.classList.toggle(
                  'is-active',
                  otherButton === button
                );
              }
            );

            applyTypeFilter(
              section,
              button.getAttribute(
                'data-cartelera-filter'
              ) || defaultType
            );
          }
        );
      }
    );

    applyTypeFilter(
      section,
      defaultType
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var sections = document.querySelectorAll('.cartelera-2026-section');
    if (!sections.length) return;

    fetch('data.json?v=20260525-6', { cache: 'no-store' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = (data && data.items) ? data.items : [];
        Array.prototype.forEach.call(sections, function (section) {
          mountSection(section, items);
        });
      })
      .catch(function () {
        Array.prototype.forEach.call(sections, function (section) {
          mountSection(section, []);
        });
      });
  });
})();
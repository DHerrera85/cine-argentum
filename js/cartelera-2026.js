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

  function buildCardHtml(item, isUpcoming) {
    var releaseLabel = item.releaseDate ? item.releaseDate : ('Proximamente ' + (isUpcoming ? '2027' : item.year));
    var typeLabel = item.type === 'pelicula' ? 'Pelicula' : 'Serie';
    var statusBadge = isUpcoming
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
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.lightSlider) return;

    var $ul = window.jQuery(ulEl);
    var inst = $ul.data('lightSlider');
    if (inst && typeof inst.refresh === 'function') {
      inst.refresh();
      return;
    }

    $ul.lightSlider({
      item: 5,
      autoWidth: false,
      slideMove: 1,
      slideMargin: 16,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      responsive: [
        { breakpoint: 1200, settings: { item: 4, slideMove: 1, slideMargin: 14 } },
        { breakpoint: 860, settings: { item: 3, slideMove: 1, slideMargin: 12 } },
        { breakpoint: 640, settings: { item: 2, slideMove: 1, slideMargin: 10 } }
      ]
    });
  }

  function destroySlider(ulEl) {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.lightSlider) return;

    var $ul = window.jQuery(ulEl);
    var inst = $ul.data('lightSlider');
    if (inst && typeof inst.destroy === 'function') {
      inst.destroy();
    }
  }

  function renderFilteredList(section, type) {
    var listEl = section.querySelector('ul[data-cartelera-list="all"]');
    if (!listEl) return;

    var allRows = section._carteleraRows || [];
    var rows = allRows.filter(function (row) {
      return type === 'all' || row.item.type === type;
    });

    destroySlider(listEl);

    listEl.innerHTML = rows.length
      ? rows.map(function (row) { return buildCardHtml(row.item, row.upcoming); }).join('')
      : '<li class="item-a"><div class="latest-box"><div class="latest-b-text"><strong>Sin resultados</strong><p class="cartelera-empty">No hay títulos para este filtro.</p></div></div></li>';

    ensureSlider(listEl);
  }

  function applyTypeFilter(section, type) {
    renderFilteredList(section, type);
  }

  function mountSection(section, items) {
    var years = getSectionYears(section);
    var primaryYear = years[0] || '2026';
    var mode = String(section.getAttribute('data-cartelera-mode') || 'released').toLowerCase();
    var listEl = section.querySelector('ul[data-cartelera-list="all"]');
    if (!listEl) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var filtered = items
      .filter(function (item) {
        if (!item || !item.id) return false;
        var best = getBestReleaseForYears(item, years);
        var itemYear = (item.year || '').toString();
        var yearMatch = years.indexOf(itemYear) !== -1;
        var releaseYearMatch = best && years.indexOf(String(best.date.getFullYear())) !== -1;
        if (!yearMatch && !releaseYearMatch) return false;
        return normalizeType(item.type, item) === 'pelicula' || normalizeType(item.type, item) === 'serie';
      })
      .map(function (item) {
        var best = getBestReleaseForYears(item, years);
        var releaseDateValue = best ? best.label : '';
        var releaseDateObj = best ? best.date : null;
        var bestImage = (best && best.imageOverride && String(best.imageOverride).trim())
          ? String(best.imageOverride).trim()
          : '';
        return {
          id: item.id,
          title: item.title || 'Sin titulo',
          image: bestImage || ((item.image && String(item.image).trim()) ? item.image : 'images/verticals/placeholder-280x420.svg'),
          type: normalizeType(item.type, item),
          year: primaryYear,
          releaseDate: releaseDateValue,
          releaseTs: releaseDateObj ? releaseDateObj.getTime() : null
        };
      });

    var released = filtered
      .filter(function (item) { return item.releaseTs !== null && item.releaseTs <= today.getTime(); })
      .sort(function (a, b) { return b.releaseTs - a.releaseTs; });

    var upcoming = filtered
      .filter(function (item) { return item.releaseTs === null || item.releaseTs > today.getTime(); })
      .sort(function (a, b) {
        var ta = a.releaseTs === null ? Number.MAX_SAFE_INTEGER : a.releaseTs;
        var tb = b.releaseTs === null ? Number.MAX_SAFE_INTEGER : b.releaseTs;
        return ta - tb;
      });

    var rows = mode === 'upcoming'
      ? upcoming.map(function (item) { return { item: item, upcoming: true }; })
      : released.map(function (item) { return { item: item, upcoming: false }; });

    section._carteleraRows = rows;

    listEl.innerHTML = rows.length
      ? rows.map(function (row) { return buildCardHtml(row.item, row.upcoming); }).join('')
      : '<li class="item-a"><div class="latest-box"><div class="latest-b-text"><strong>Sin titulos</strong><p class="cartelera-empty">No hay titulos para esta seccion.</p></div></div></li>';

    ensureSlider(listEl);

    Array.prototype.forEach.call(section.querySelectorAll('[data-cartelera-filter]'), function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call(section.querySelectorAll('[data-cartelera-filter]'), function (other) {
          other.classList.toggle('is-active', other === btn);
        });

        applyTypeFilter(section, btn.getAttribute('data-cartelera-filter') || 'all');
      });
    });

    applyTypeFilter(section, 'all');
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

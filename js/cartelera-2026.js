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

  function normalizeType(value, item) {
    var t = (value || '').toString().toLowerCase();
    if (t === 'pelicula' || t === 'movie') return 'pelicula';
    if (t === 'serie' || t === 'series') return 'serie';

    var id = (item && item.id ? String(item.id) : '').toUpperCase();
    if (id.indexOf('V') === 0) return 'serie';

    return '';
  }

  function buildCardHtml(item) {
    var releaseLabel = item.releaseDate ? item.releaseDate : ('Proximamente ' + item.year);
    var typeLabel = item.type === 'pelicula' ? 'Pelicula' : 'Serie';

    return '' +
      '<li class="' + (item.type === 'pelicula' ? 'item-a' : 'item-b') + '" data-cartelera-type="' + item.type + '">' +
        '<a href="show.html?id=' + encodeURIComponent(item.id) + '">' +
          '<div class="latest-box">' +
            '<div class="latest-b-img"><img src="' + item.image + '" loading="lazy" alt="' + item.title + '"></div>' +
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

  function applyTypeFilter(section, type) {
    var activeList = section.querySelector('ul[data-cartelera-list]:not([hidden])');
    if (!activeList) return;

    Array.prototype.forEach.call(activeList.querySelectorAll('li[data-cartelera-type]'), function (li) {
      var currentType = li.getAttribute('data-cartelera-type');
      var show = type === 'all' || type === currentType;
      li.style.display = show ? '' : 'none';
    });

    if (typeof window.faRefreshSliders === 'function') {
      setTimeout(function () { window.faRefreshSliders(); }, 80);
    } else {
      ensureSlider(activeList);
    }
  }

  function mountSection(section, items) {
    var year = section.getAttribute('data-year') || '2026';
    var releasedList = section.querySelector('ul[data-cartelera-list="released"]');
    var upcomingList = section.querySelector('ul[data-cartelera-list="upcoming"]');
    if (!releasedList || !upcomingList) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var filtered = items
      .filter(function (item) {
        if (!item || !item.id) return false;
        if ((item.year || '').toString() !== year) return false;
        return normalizeType(item.type, item) === 'pelicula' || normalizeType(item.type, item) === 'serie';
      })
      .map(function (item) {
        var releaseDateObj = parseReleaseDate(item.release_date);
        return {
          id: item.id,
          title: item.title || 'Sin titulo',
          image: (item.image && String(item.image).trim()) ? item.image : 'images/verticals/placeholder-280x420.svg',
          type: normalizeType(item.type, item),
          year: year,
          releaseDate: item.release_date || '',
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

    releasedList.innerHTML = released.length
      ? released.map(buildCardHtml).join('')
      : '<li class="item-a"><div class="latest-box"><div class="latest-b-text"><strong>Sin titulos estrenados</strong><p class="cartelera-empty">No hay estrenos cargados para ' + year + '.</p></div></div></li>';

    upcomingList.innerHTML = upcoming.length
      ? upcoming.map(buildCardHtml).join('')
      : '<li class="item-a"><div class="latest-box"><div class="latest-b-text"><strong>Sin proximos estrenos</strong><p class="cartelera-empty">No hay proximos titulos cargados para ' + year + '.</p></div></div></li>';

    ensureSlider(releasedList);
    ensureSlider(upcomingList);

    Array.prototype.forEach.call(section.querySelectorAll('[data-cartelera-view]'), function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-cartelera-view');
        var showReleased = view === 'released';

        releasedList.hidden = !showReleased;
        upcomingList.hidden = showReleased;

        Array.prototype.forEach.call(section.querySelectorAll('[data-cartelera-view]'), function (other) {
          var active = other === btn;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        var activeFilter = section.querySelector('.cartelera-filter.is-active');
        applyTypeFilter(section, activeFilter ? activeFilter.getAttribute('data-cartelera-filter') : 'all');
      });
    });

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

    fetch('data.json?v=20260501-1', { cache: 'no-store' })
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

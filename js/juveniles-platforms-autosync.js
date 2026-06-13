(function () {
  var dataVersion = '20260613-1';
  var itemClasses = ['item-a', 'item-b', 'item-c', 'item-d', 'item-e', 'item-f', 'item-g'];
  var placeholderImage = 'images/verticals/placeholder-280x420.svg';

  function normalizeText(value) {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function parseDate(value) {
    if (!value) return null;

    var raw = String(value).trim();
    if (!raw || raw === '-') return null;

    var parts = raw.split('/');
    if (parts.length !== 3) return null;

    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;

    var date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function isUpcoming(item) {
    var releaseDate = parseDate(item.release_date || item.fecha_estreno);

    if (!releaseDate) {
      var year = parseInt(item.year, 10);
      var currentYear = new Date().getFullYear();
      return Number.isFinite(year) && year > currentYear;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    releaseDate.setHours(0, 0, 0, 0);

    return releaseDate > today;
  }

  function getSortTimestamp(item) {
    var releaseDate = parseDate(item.release_date || item.fecha_estreno);
    if (releaseDate) return releaseDate.getTime();

    var year = parseInt(item.year, 10);
    if (Number.isFinite(year)) return new Date(year, 0, 1).getTime();

    return 0;
  }

  function getChannelText(item) {
    var values = [];

    if (item && item.channel) values.push(item.channel);
    if (item && item.platform) values.push(item.platform);
    if (item && Array.isArray(item.platforms)) values = values.concat(item.platforms);
    if (item && Array.isArray(item.channels)) values = values.concat(item.channels);
    if (item && Array.isArray(item.air_channels)) values = values.concat(item.air_channels);
    if (item && Array.isArray(item.cable_channels)) values = values.concat(item.cable_channels);

    return values.join(' ');
  }

  function getGenreText(item) {
    return item && (item.genre || item.subtitle || '') || '';
  }

  function isSerie(item) {
    var type = normalizeText(item && item.type);
    return type !== 'pelicula' && type !== 'movie';
  }

  function isJuvenil(item) {
    return normalizeText(getGenreText(item)) === 'juvenil';
  }

  function hasDisney(item) {
    var channel = normalizeText(getChannelText(item));
    return channel.indexOf('disney+') !== -1 || channel.indexOf('disney plus') !== -1;
  }

  function hasNetflix(item) {
    var channel = normalizeText(getChannelText(item));
    return channel.indexOf('netflix') !== -1;
  }

  function isStreamingOrPlatform(item) {
    var channel = normalizeText(getChannelText(item));
    var type = normalizeText(item && item.type);

    return (
      channel.indexOf('streaming') !== -1 ||
      channel.indexOf('prime video') !== -1 ||
      channel.indexOf('hbo max') !== -1 ||
      channel.indexOf('max') !== -1 ||
      channel.indexOf('flow') !== -1 ||
      channel.indexOf('paramount') !== -1 ||
      channel.indexOf('star+') !== -1 ||
      channel.indexOf('starzplay') !== -1 ||
      channel.indexOf('viu') !== -1 ||
      type === 'serie'
    );
  }

  function buildCard(item, index) {
    var cardClass = itemClasses[index % itemClasses.length];
    var href = 'show.html?id=' + encodeURIComponent(item.id || '');
    var title = item.title || 'Sin título';
    var image = item.image || placeholderImage;

    var badge = isUpcoming(item)
      ? '<span class="cartelera-status cartelera-status-upcoming">PRÓXIMAMENTE</span>'
      : '';

    return ''
      + '<li class="' + cardClass + '">'
      +   '<a href="' + href + '">'
      +     '<div class="latest-box">'
      +       '<div class="latest-b-img">'
      +         badge
      +         '<img src="' + image + '" loading="lazy" alt="' + title + '">'
      +       '</div>'
      +       '<div class="latest-b-text">'
      +         '<strong>' + title + '</strong>'
      +         '<p></p>'
      +       '</div>'
      +     '</div>'
      +   '</a>'
      + '</li>';
  }

  function refreshSlider(container) {
    if (!window.jQuery || !jQuery.fn || !jQuery.fn.lightSlider) return;

    var $container = jQuery(container);
    var sliderInstance = $container.data('lightSlider');

    if (sliderInstance && typeof sliderInstance.refresh === 'function') {
      sliderInstance.refresh();
      return;
    }

    if ($container.parent().hasClass('lSSlideOuter')) {
      try {
        $container.data('lightSlider').destroy();
      } catch (error) {}
    }

    $container.lightSlider({
      autoWidth: true,
      slideMove: 1,
      slideMargin: 12,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,
      onSliderLoad: function () {
        $container.removeClass('cs-hidden');
      }
    });
  }

  function sortItems(filtered) {
    filtered.sort(function (a, b) {
      var timestampDiff = getSortTimestamp(b.item) - getSortTimestamp(a.item);
      if (timestampDiff !== 0) return timestampDiff;

      return b.sourceIndex - a.sourceIndex;
    });

    return filtered;
  }

  function renderList(containerId, items, filterFn) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var filtered = items.reduce(function (accumulator, item, index) {
      if (!item || !item.id) return accumulator;

      if (isJuvenil(item) && isSerie(item) && filterFn(item)) {
        accumulator.push({
          item: item,
          sourceIndex: index
        });
      }

      return accumulator;
    }, []);

    sortItems(filtered);

    container.innerHTML = filtered.map(function (entry, index) {
      return buildCard(entry.item, index);
    }).join('');

    refreshSlider(container);
  }

  function loadJuvenilesPlatforms() {
    fetch('data.json?v=' + dataVersion, { cache: 'no-store' })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var items = Array.isArray(data && data.items) ? data.items : [];

        renderList('juveniles-disney-list', items, function (item) {
          return hasDisney(item);
        });

        renderList('juveniles-netflix-list', items, function (item) {
          return hasNetflix(item);
        });

        renderList('juveniles-otros-streamers-list', items, function (item) {
          return !hasDisney(item) && !hasNetflix(item) && isStreamingOrPlatform(item);
        });
      })
      .catch(function (error) {
        console.error('No se pudieron cargar juveniles por plataforma:', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadJuvenilesPlatforms);
    return;
  }

  loadJuvenilesPlatforms();
})();
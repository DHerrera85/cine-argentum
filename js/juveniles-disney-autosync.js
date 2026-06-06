(function () {
  var dataVersion = '20260606-1';
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
    if (!releaseDate) return false;

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
    if (item && item.channel) return item.channel;
    if (item && item.platform) return item.platform;
    if (item && Array.isArray(item.platforms) && item.platforms.length) return item.platforms.join(' ');
    if (item && Array.isArray(item.channels) && item.channels.length) return item.channels.join(' ');
    return '';
  }

  function getGenreText(item) {
    return item && (item.genre || item.subtitle || '') || '';
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

  function loadDisneyJuveniles() {
    var container = document.getElementById('juveniles-disney-list');
    if (!container) return;

    fetch('data.json?v=' + dataVersion, { cache: 'no-store' })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var items = Array.isArray(data && data.items) ? data.items : [];

        var filtered = items.reduce(function (accumulator, item, index) {
          if (!item || !item.id) return accumulator;

          var channel = normalizeText(getChannelText(item));
          var genre = normalizeText(getGenreText(item));
          var type = normalizeText(item.type);
          var isDisney = channel.indexOf('disney+') !== -1 || channel.indexOf('disney plus') !== -1;
          var isJuvenil = genre === 'juvenil';
          var isSerie = type !== 'pelicula' && type !== 'movie';

          if (isDisney && isJuvenil && isSerie) {
            accumulator.push({
              item: item,
              sourceIndex: index
            });
          }

          return accumulator;
        }, []);

        filtered.sort(function (a, b) {
          var timestampDiff = getSortTimestamp(b.item) - getSortTimestamp(a.item);
          if (timestampDiff !== 0) return timestampDiff;

          return b.sourceIndex - a.sourceIndex;
        });

        container.innerHTML = filtered.map(function (entry, index) {
          return buildCard(entry.item, index);
        }).join('');
        refreshSlider(container);
      })
      .catch(function (error) {
        console.error('No se pudo cargar Disney+ juveniles:', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDisneyJuveniles);
    return;
  }

  loadDisneyJuveniles();
})();
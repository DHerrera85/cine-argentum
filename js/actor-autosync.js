(function () {
  var path = (window.location.pathname || '').toLowerCase();
  if (path.indexOf('actor-') === -1) return;

  function normalizeText(value) {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function getActorNameFromTitle() {
    var titleEl = document.querySelector('.actor-info h1');
    if (!titleEl) return '';
    var text = (titleEl.textContent || '').trim();
    var prefix = 'Películas de ';
    if (text.indexOf(prefix) === 0) {
      return text.slice(prefix.length).trim();
    }
    return text;
  }

  function buildMovieCard(movie) {
    var viewersText = (movie.viewers !== null && movie.viewers !== undefined)
      ? Number(movie.viewers).toLocaleString('es-AR')
      : '—';

    return '\n        <a href="' + movie.slug + '" class="actor-movie-card">\n          <img src="' + movie.image + '" alt="' + movie.title + '">\n          <div class="actor-movie-info">\n            <div class="actor-movie-title">' + movie.title + '</div>\n            <div class="actor-movie-meta">Año: ' + movie.year + '</div>\n            <div class="actor-movie-viewers">Espectadores: ' + viewersText + '</div>\n          </div>\n        </a>\n        ';
  }

  function isMovieItem(item) {
    var itemType = normalizeText(item && item.type);
    if (itemType) {
      return itemType === 'movie' || itemType === 'pelicula';
    }

    var id = (item && item.id ? String(item.id) : '').toUpperCase();
    return id.indexOf('P') === 0;
  }

  async function loadMoviesForActor() {
    var actorName = getActorNameFromTitle();
    if (!actorName) return;

    var actorKey = normalizeText(actorName);
    var listEl = document.getElementById('actorMoviesList');
    var countEl = document.getElementById('actor-movie-count');
    if (!listEl || !countEl) return;

    try {
      var response = await fetch('data.json?v=20260225-actor1', { cache: 'no-store' });
      var data = await response.json();
      var items = Array.isArray(data && data.items) ? data.items : [];

      var movies = items
        .filter(function (item) {
          if (!item || !item.id) return false;
          if (!isMovieItem(item)) return false;
          if (!Array.isArray(item.actors)) return false;

          return item.actors.some(function (actor) {
            return normalizeText(actor) === actorKey;
          });
        })
        .map(function (item) {
          return {
            title: item.title || 'Sin título',
            year: Number(item.year) || 0,
            viewers: item.viewers,
            image: item.image || 'images/verticals/placeholder-280x420.png',
            slug: 'show.html?id=' + item.id
          };
        });

      function renderDynamicMovies(sortBy) {
        var sorted = movies.slice();

        if (sortBy === 'year') {
          sorted.sort(function (a, b) { return b.year - a.year; });
        } else if (sortBy === 'year-asc') {
          sorted.sort(function (a, b) { return a.year - b.year; });
        } else {
          sorted.sort(function (a, b) { return (Number(b.viewers) || 0) - (Number(a.viewers) || 0); });
        }

        listEl.innerHTML = sorted.map(buildMovieCard).join('');
        countEl.textContent = sorted.length + ' película' + (sorted.length === 1 ? '' : 's');
      }

      window.renderMovies = renderDynamicMovies;

      var selectedOption = document.querySelector('#actorSortCustom .custom-select-options li.selected');
      var activeSort = selectedOption ? selectedOption.getAttribute('data-value') : 'viewers';
      renderDynamicMovies(activeSort || 'viewers');
    } catch (error) {
      console.error('No se pudo cargar filmografía dinámica del actor:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMoviesForActor);
    return;
  }

  loadMoviesForActor();
})();

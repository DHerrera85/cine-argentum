(function () {
  var path = (window.location.pathname || '').toLowerCase();
  var match = path.match(/genero-([a-z\-]+)\.html$/);
  if (!match) return;

  var genreSlug = match[1];

  function normalizeText(value) {
    return (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function genreKeyFromSlug(slug) {
    var map = {
      animacion: 'animacion',
      terror: 'terror',
      biografica: 'biografica',
      comedia: 'comedia',
      drama: 'drama',
      familiar: 'familiar',
      historica: 'historica',
      policial: 'policial',
      romance: 'romance'
    };

    return map[slug] || normalizeText(slug);
  }

  function resolveGenreField(item) {
    if (!item) return '';

    if (Array.isArray(item.genre)) {
      return item.genre.map(function (part) { return normalizeText(part); }).join('|');
    }

    return normalizeText(item.genre || '');
  }

  var COMEDIA_TITLES = [
    'Esa maldita costilla', 'Déjala Correr', 'Sólo por Hoy', 'Papá se Volvió Loco', 'Los Incorregibles', 'Dos hermanos', 'Pájaros volando', 'Igualita a mí', 'Mi primera boda', 'Extraños en la noche', 'Vino para robar', 'Bañeros 4: los rompeolas', 'Kryptonita', 'Voley', 'Permitidos', 'La última fiesta', 'El rey del Once', 'El fútbol o yo', '27: El club de los malditos', 'Re loca', 'Bañeros 5: Lentos y cargosos', 'El cuento de las comadrejas', 'No soy tu mami', 'Corazón Loco', 'Ex Casados', 'Matrimillas', 'Más Respeto que soy Tu Madre', '30 Noches con mi Ex', 'Blondi', 'Puan', 'Casi Muerta', 'Culpa Cero', 'Transmitvah', 'El Hombre que Amaba los Platos Voladores', 'No Puedo Vivir Sin Ti', 'Mazel Tov', 'Homo Argentum', 'Me casé con un boludo', 'Socios por accidente', 'Dos más dos', 'La odisea de los giles', 'Corazón de león', 'Mi obra maestra', 'El Gerente',
    'Papá por Dos', 'Las Hermanas Fantásticas', 'No Me Rompan', 'Granizo', 'Casi leyendas', 'Sin hijos', 'Peter Capusoto y sus 3 dimensiones', 'Días de vinilo', 'Un cuento chino', 'Un Novio para mi Mujer', 'Los Super Agentes: La Nueva Generación', 'Bañeros 3, todopoderosos', 'Cohen vs Rosi', 'La Noche Mágica'
  ];

  var DRAMA_TITLES = [
    'La Mujer de la Fila', 'Parque Lezama', '27 Noches', 'Belén', 'Linda', 'El Jockey', 'Elena Sabe', 'Una Flor en el Barro', 'Hoy se Arregla el Mundo', 'Errante Corazón', 'El Cuaderno de Tomy', 'Yo, Adolescente', 'La misma sangre', 'Recreo', 'La reina del miedo', 'El amor menos pensado', 'La Quietud', 'Los que aman, odian', 'Los padecientes', 'El ciudadano ilustre', 'Inseparables', 'Abzurdah', 'Papeles en el viento', 'La patota', 'Truman', 'El misterio de la felicidad', 'La pelea de mi vida', 'El último Elvis', 'Viudas', 'XXY', 'El Aura', 'Elsa y Fred', 'Luna de Avellaneda', 'Corazón de Fuego', 'Vidas Privadas', 'Antigua vida mía', 'La Cienaga', 'El Hijo de la Novia'
  ];

  var FAMILIAR_FORCED_TITLES = ['El Ratón Pérez y los Guardianes del Libro Mágico'];

  var HISTORICA_TITLES = [
    'Iluminados por el Fuego', 'Revolución, el cruce de los andes', 'El Ángel', 'El clan', 'Infancia clandestina', 'Kamchatka', 'Felicitas', 'Atraco', 'Wakolda, el Médico Alemán', 'Whisky, Romeo, Zulú', 'Aballay, el hombre sin miedo', 'La Fuga', 'Crónica de una Fuga', 'Hermanas', 'Argentina, 1985'
  ];

  var POLICIAL_TITLES = [
    'Parking', 'Playa de Lobos', 'Una Muerte Silenciosa', 'Gatillero', 'Descansar en Paz', 'Jaque Mate', 'El Duelo', 'La Extorsión', 'El Rapto', 'Pipa', 'La Ira de Dios', 'Ecos de un Crimen', 'Un Crimen Argentino', 'En la Mira', 'El robo del siglo', 'La Corazonada', 'Crimenes de Familia', '4×4', 'Animal', 'Acusada', 'Perdida', 'Las Grietas de Jara', 'Nieve negra', 'La cordillera', 'Sólo se vive una vez', '100 años de perdón', 'Kóblic', 'Al final del túnel', 'Relatos salvajes', 'Muerte en Buenos Aires', 'Tesis sobre un homicidio', 'Séptimo', 'Elefante blanco', 'Todos tenemos un Plan', 'Fase 7', 'Carancho', 'Paco', 'El secreto de sus ojos', 'Las viudas de los jueves', 'Leonera', 'Tiempo de Valientes', 'Peligrosa Obsesión', 'Gallito Ciego', 'Nueve Reinas', 'Plata quemada', 'La venganza', 'Comodines', 'La furia', 'Cenizas de paraíso', 'Nahir'
  ];

  var ROMANCE_TITLES = [
    'Corazón Delator', 'Mensaje en una Botella', 'Goyo', 'El hilo rojo', 'Una noche de amor', 'El desafío', 'La suerte en tus manos', 'Felicitas', 'Música en espera', 'Motivos para no enamorarse', '¿Quién Dice qué es Fácil?', 'No Sos Vos, Soy Yo', 'Un Día en el Paraíso', 'El Día que me Amen', 'Cleopatra', 'Apasionados', 'Todas las Azafatas van al Cielo', 'Apariencias', 'Alma mía', 'El mismo amor, la misma lluvia', 'Amor de Película'
  ];

  function isStreamingWithoutViewers(item) {
    var channel = item && (item.channel || '').toString();
    return (channel === 'Netflix' || channel === 'Streaming') && (!item.viewers || item.viewers === 0);
  }

  function shouldIncludeBySlug(item, genreValue, genreKey) {
    if (genreSlug === 'comedia') {
      return genreValue.indexOf('comedia') !== -1 && COMEDIA_TITLES.indexOf(item.title) !== -1;
    }

    if (genreSlug === 'drama') {
      return DRAMA_TITLES.indexOf(item.title) !== -1;
    }

    if (genreSlug === 'familiar') {
      var includeByGenre = genreValue.indexOf('familiar') !== -1;
      var includeForced = FAMILIAR_FORCED_TITLES.indexOf(item.title) !== -1;
      return (includeByGenre || includeForced) && item.title !== 'La Noche Mágica';
    }

    if (genreSlug === 'historica') {
      return HISTORICA_TITLES.indexOf(item.title) !== -1;
    }

    if (genreSlug === 'policial') {
      return genreValue.indexOf('policial') !== -1 && POLICIAL_TITLES.indexOf(item.title) !== -1;
    }

    if (genreSlug === 'romance') {
      return ROMANCE_TITLES.indexOf(item.title) !== -1;
    }

    return genreValue.indexOf(genreKey) !== -1;
  }

  function normalizeViewersForSlug(item) {
    if (genreSlug === 'comedia') {
      if (item.title === 'No Puedo Vivir Sin Ti' || item.title === 'Granizo' || item.title === 'Las Hermanas Fantásticas') {
        return '-';
      }
      if (isStreamingWithoutViewers(item)) return '-';
      return item.viewers || 0;
    }

    if (genreSlug === 'drama') {
      if (item.title === 'Yo, Adolescente' || item.title === 'Elena Sabe' || item.title === 'El Cuaderno de Tomy') {
        return '-';
      }
      if (isStreamingWithoutViewers(item)) return '-';
      return (item.viewers === undefined || item.viewers === null || item.viewers === 0) ? 0 : item.viewers;
    }

    if (genreSlug === 'familiar') {
      if (typeof item.viewers === 'number') {
        return item.viewers === 0 ? '-' : item.viewers;
      }
      return '-';
    }

    if (genreSlug === 'historica') {
      if (item.title === 'Argentina, 1985') return 1160067;
      if (item.title === 'El Ángel') return 1367803;
      if (item.title === 'El clan') return 2652757;
      if (isStreamingWithoutViewers(item)) return '-';
      return (item.viewers === undefined || item.viewers === null || item.viewers === 0) ? 0 : item.viewers;
    }

    if (genreSlug === 'policial') {
      if (isStreamingWithoutViewers(item)) return '-';
      return item.viewers;
    }

    if (genreSlug === 'romance') {
      if (item.title === 'Corazón Delator' || item.title === 'Goyo') return '-';
      if (isStreamingWithoutViewers(item)) return '-';
      return (item.viewers === undefined || item.viewers === null || item.viewers === 0) ? 0 : item.viewers;
    }

    return item.viewers;
  }

  function compareViewersDesc(a, b) {
    if (a.viewers === '-' && b.viewers !== '-') return 1;
    if (b.viewers === '-' && a.viewers !== '-') return -1;
    return (Number(b.viewers) || 0) - (Number(a.viewers) || 0);
  }

  function buildMovieCard(movie) {
    if (movie.viewers === '-') {
      return '\n      <div class="actor-movie-card">\n        <a href="' + movie.slug + '" tabindex="0">\n          <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy" />\n        </a>\n        <div class="actor-movie-info">\n          <div class="actor-movie-title">' + movie.title + ' (' + movie.year + ')</div>\n          <div class="actor-movie-viewers">-</div>\n        </div>\n      </div>\n    ';
    }

    var viewersValue = Number(movie.viewers);
    var viewersText = Number.isFinite(viewersValue)
      ? viewersValue.toLocaleString('es-AR') + ' espectadores'
      : '—';

    return '\n      <div class="actor-movie-card">\n        <a href="' + movie.slug + '" tabindex="0">\n          <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy" />\n        </a>\n        <div class="actor-movie-info">\n          <div class="actor-movie-title">' + movie.title + ' (' + movie.year + ')</div>\n          <div class="actor-movie-viewers">' + viewersText + '</div>\n        </div>\n      </div>\n    ';
  }

  function initializeCustomSelect(onSortChange) {
    var customSelect = document.getElementById('actorSortCustom');
    if (!customSelect) {
      onSortChange('viewers');
      return;
    }

    var selectedSpan = customSelect.querySelector('.custom-select-selected');
    var optionsList = customSelect.querySelector('.custom-select-options');
    if (!selectedSpan || !optionsList) {
      onSortChange('viewers');
      return;
    }

    function setSort(value, label) {
      selectedSpan.textContent = label;
      optionsList.querySelectorAll('li').forEach(function (li) {
        li.classList.remove('selected');
      });

      var selectedLi = optionsList.querySelector('li[data-value="' + value + '"]');
      if (selectedLi) selectedLi.classList.add('selected');

      optionsList.style.display = 'none';
      customSelect.classList.remove('open');
      onSortChange(value);
    }

    if (customSelect.dataset.autosyncBound !== '1') {
      selectedSpan.addEventListener('click', function () {
        optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
        customSelect.classList.toggle('open');
      });

      optionsList.querySelectorAll('li').forEach(function (li) {
        li.addEventListener('click', function () {
          setSort(li.getAttribute('data-value'), li.textContent);
        });
      });

      document.addEventListener('click', function (event) {
        if (!customSelect.contains(event.target)) {
          optionsList.style.display = 'none';
          customSelect.classList.remove('open');
        }
      });

      customSelect.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          optionsList.style.display = optionsList.style.display === 'block' ? 'none' : 'block';
          customSelect.classList.toggle('open');
        }

        if (event.key === 'Escape') {
          optionsList.style.display = 'none';
          customSelect.classList.remove('open');
        }
      });

      customSelect.dataset.autosyncBound = '1';
    }

    var initiallySelected = optionsList.querySelector('li.selected');
    var initialSort = initiallySelected ? initiallySelected.getAttribute('data-value') : 'viewers';
    var initialLabel = initiallySelected ? initiallySelected.textContent : 'Cantidad de espectadores';
    setSort(initialSort || 'viewers', initialLabel);
  }

  async function loadGenreMovies() {
    var genreKey = genreKeyFromSlug(genreSlug);
    var listEl = document.getElementById('actorMoviesList');
    var countEl = document.getElementById('actor-movie-count');

    if (!listEl || !countEl) return;

    try {
      var response = await fetch('data.json?v=20260225-genero1', { cache: 'no-store' });
      var data = await response.json();
      var items = Array.isArray(data && data.items) ? data.items : [];

      var movies = items
        .filter(function (item) {
          if (!item || !item.id) return false;
          var itemType = normalizeText(item.type);
          if (itemType && itemType !== 'movie' && itemType !== 'pelicula') return false;

          var genreValue = resolveGenreField(item);
          if (!genreValue) return false;

          return shouldIncludeBySlug(item, genreValue, genreKey);
        })
        .map(function (item) {
          return {
            title: item.title || 'Sin título',
            year: Number(item.year) || 0,
            viewers: normalizeViewersForSlug(item),
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
        } else if (sortBy === 'decada-1990') {
          sorted = sorted.filter(function (movie) { return movie.year >= 1990 && movie.year < 2000; });
          sorted.sort(function (a, b) { return a.year - b.year; });
        } else if (sortBy === 'decada-2000') {
          sorted = sorted.filter(function (movie) { return movie.year >= 2000 && movie.year < 2010; });
          sorted.sort(function (a, b) { return a.year - b.year; });
        } else if (sortBy === 'decada-2010') {
          sorted = sorted.filter(function (movie) { return movie.year >= 2010 && movie.year < 2020; });
          sorted.sort(function (a, b) { return a.year - b.year; });
        } else if (sortBy === 'decada-2020') {
          sorted = sorted.filter(function (movie) { return movie.year >= 2020; });
          sorted.sort(function (a, b) { return a.year - b.year; });
        } else {
          sorted.sort(compareViewersDesc);
        }

        listEl.innerHTML = sorted.map(buildMovieCard).join('');
        countEl.textContent = sorted.length + ' película' + (sorted.length === 1 ? '' : 's');
      }

      window.renderMovies = renderDynamicMovies;
      initializeCustomSelect(renderDynamicMovies);
    } catch (error) {
      console.error('No se pudo cargar filmografía dinámica por género:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGenreMovies);
    return;
  }

  loadGenreMovies();
})();

/* js/canal13-90s-autosync.js */

(function () {
  'use strict';

  /* =========================================================
     CONFIGURACIÓN GENERAL
     ========================================================= */

var DATA_URL = 'data.json?v=20260804-tv90s-1';

var CHANNEL_NAMES = [
  'Telefe',
  'Canal 13',
  'Canal 9',
  'Canal 9/Azul TV',
  'Azul TV',
  'América',
  'ATC',
  'ATC/Canal 7',
  'Canal 7'
];

var START_YEAR = 1989;
var END_YEAR = 1999;

var PLACEHOLDER_IMAGE =
  'images/verticals/placeholder-280x420.svg';

var SELECTORS = {
  grid: '#tv90s-grid',

  telenovelasSlider: '#tv90s-telenovelas-slider',
  comediasSlider: '#tv90s-comedias-slider',
comediasSemanalesSlider:
  '#tv90s-comedias-semanales-slider',

comediasDiariasSlider:
  '#tv90s-comedias-diarias-slider',
  juvenilesSlider: '#tv90s-juveniles-slider',
  dramasSlider: '#tv90s-dramas-slider',

dramasVerticalSlider:
  '#tv90s-dramas-vertical-slider',

thrillersSlider:
  '#tv90s-thrillers-slider',

  telenovelasNocheSlider:
    '#tv90s-telenovelas-noche-slider',

  telenovelasTarde8994Slider:
    '#tv90s-telenovelas-tarde-89-94-slider',

  telenovelasTarde9599Slider:
    '#tv90s-telenovelas-tarde-95-99-slider',

juvenilesDiariasSlider:
  '#tv90s-juveniles-diarias-slider',

juvenilesSemanalesSlider:
  '#tv90s-juveniles-semanales-slider',

infantilesSlider:
  '#tv90s-infantiles-slider',

  yearFilters: '[data-tv90s-year]',
  categoryFilters: '[data-tv90s-category]',
  channelFilters: '[data-tv90s-channel]',

  title: '#tv90s-catalogue-title',
  description: '#tv90s-catalogue-description',
  empty: '#tv90s-empty-state',

  filterCarousels: '.filter-carousel'
};

  var allProductions = [];
  var activeYear = 'all';
  var activeCategory = 'all';
  var activeChannel = 'all';
  var initializedSliders = {};

  /* =========================================================
     NORMALIZACIÓN Y SEGURIDAD
     ========================================================= */

  function normalizeText(value) {
    var text = value == null
      ? ''
      : String(value);

    if (typeof text.normalize === 'function') {
      text = text.normalize('NFD');
    }

    return text
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/gi, 'n')
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* =========================================================
     CANALES
     ========================================================= */

  function getChannelValues(item) {
    var values = [];

    if (!item || typeof item !== 'object') {
      return values;
    }

    if (item.channel) {
      values.push(item.channel);
    }

    if (Array.isArray(item.channels)) {
      values = values.concat(item.channels);
    }

    if (Array.isArray(item.air_channels)) {
      values = values.concat(item.air_channels);
    }

    return values
      .filter(function (value) {
        return (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ''
        );
      })
      .map(function (value) {
        return String(value).trim();
      });
  }

  function belongsToTv90s(item) {
    var expectedChannels = CHANNEL_NAMES.map(normalizeText);

    return getChannelValues(item).some(function (channel) {
      return expectedChannels.indexOf(
        normalizeText(channel)
      ) !== -1;
    });
  }

  function belongsToSelectedChannel(item, selectedChannel) {
  if (
    !selectedChannel ||
    selectedChannel === 'all'
  ) {
    return true;
  }

  var channelAliases = {
    america: [
      'América',
      'America'
    ],

    atc: [
      'ATC',
      'ATC/Canal 7',
      'Canal 7'
    ]
  };

  var expectedValues =
    channelAliases[selectedChannel] ||
    [selectedChannel];

  var normalizedExpected =
    expectedValues.map(normalizeText);

  return getChannelValues(item).some(function (channel) {
    return normalizedExpected.indexOf(
      normalizeText(channel)
    ) !== -1;
  });
}


  /* =========================================================
     AÑOS Y FECHAS
     ========================================================= */

  function getYear(item) {
    var year = Number(item && item.year);

    return Number.isFinite(year)
      ? year
      : null;
  }

  function parseDate(value) {
    if (!value) {
      return null;
    }

    var text = String(value).trim();
    var parts;
    var date;

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      parts = text.split('-');

      date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );

      return Number.isNaN(date.getTime())
        ? null
        : date;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
      parts = text.split('/');

      date = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
      );

      return Number.isNaN(date.getTime())
        ? null
        : date;
    }

    return null;
  }

  function getReleaseDate(item) {
    if (!item) {
      return null;
    }

    return parseDate(
      item.fecha_estreno ||
      item.release_date ||
      item.premiere_date
    );
  }

  function compareProductions(a, b) {
    var yearA = getYear(a) || 0;
    var yearB = getYear(b) || 0;

    if (yearA !== yearB) {
      return yearA - yearB;
    }

    var dateA = getReleaseDate(a);
    var dateB = getReleaseDate(b);

    if (
      dateA &&
      dateB &&
      dateA.getTime() !== dateB.getTime()
    ) {
      return dateA.getTime() - dateB.getTime();
    }

    if (dateA && !dateB) {
      return -1;
    }

    if (!dateA && dateB) {
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

  function isValidProduction(item) {
    var year = getYear(item);

    return Boolean(
      item &&
      item.id &&
      year !== null &&
      year >= START_YEAR &&
      year <= END_YEAR &&
      belongsToTv90s(item)
    );
  }
  /* =========================================================
     GÉNEROS Y CATEGORÍAS
     ========================================================= */

  function getSubtitle(item) {
    if (!item) {
      return '';
    }

    if (
      item.subtitle &&
      String(item.subtitle).trim() !== ''
    ) {
      return String(item.subtitle).trim();
    }

    if (Array.isArray(item.genre)) {
      return item.genre
        .filter(function (genre) {
          return (
            genre !== undefined &&
            genre !== null &&
            String(genre).trim() !== ''
          );
        })
        .map(function (genre) {
          return String(genre).trim();
        })
        .join(' · ');
    }

    if (
      item.genre &&
      String(item.genre).trim() !== ''
    ) {
      return String(item.genre).trim();
    }

    return '';
  }

  function getGenreText(item) {
    if (!item || !item.genre) {
      return '';
    }

    if (Array.isArray(item.genre)) {
      return normalizeText(
        item.genre
          .filter(Boolean)
          .join(' ')
      );
    }

    return normalizeText(item.genre);
  }

  function belongsToCategory(item, category) {
    if (
      !category ||
      category === 'all'
    ) {
      return true;
    }

    var genreText = getGenreText(item);

    if (!genreText) {
      return false;
    }

    var aliases = {
      telenovela: [
        'telenovela'
      ],

      comedia: [
        'comedia',
        'sitcom'
      ],

      drama: [
        'drama'
      ],

      thriller: [
        'thriller',
        'suspenso'
      ],

      juvenil: [
        'juvenil',
        'infanto juvenil',
        'infantojuvenil'
      ],

      infantil: [
  'infantil'
]
    };

    var values = aliases[category] || [category];

    return values.some(function (value) {
      return genreText.indexOf(
        normalizeText(value)
      ) !== -1;
    });
  }

/* =========================================================
   MOTOR EDITORIAL
   ========================================================= */


/*
 * Convierte el campo horario en una lista numérica.
 *
 * Ejemplos:
 * "18hs"            -> [18]
 * "17:30hs"         -> [17.5]
 * "18hs, 17hs"      -> [18, 17]
 * "22hs, 21hs"      -> [22, 21]
 * "-"               -> []
 */
function extractHours(horario) {

  if (
    horario === undefined ||
    horario === null ||
    String(horario).trim() === ''
  ) {
    return [];
  }

  var matches =
    String(horario).match(
      /\d{1,2}(?::\d{2})?/g
    );

  if (!matches) {
    return [];
  }

  return matches
    .map(function (value) {

      var parts =
        value.split(':');

      var hour =
        parseInt(parts[0], 10);

      var minutes =
        parts.length > 1
          ? parseInt(parts[1], 10)
          : 0;

      if (
        Number.isNaN(hour) ||
        Number.isNaN(minutes)
      ) {
        return null;
      }

      return hour + (minutes / 60);

    })
    .filter(function (value) {
      return value !== null;
    });
}


/*
 * Comprueba si al menos uno de los horarios
 * de la producción se encuentra dentro del rango.
 */
function hasHourBetween(
  horario,
  fromHour,
  toHour
) {

  return extractHours(horario)
    .some(function (hour) {

      return (
        hour >= fromHour &&
        hour <= toHour
      );

    });
}


/*
 * Determina si una producción es una telenovela.
 */
function isTelenovela(item) {
  return belongsToCategory(
    item,
    'telenovela'
  );
}


function isJuvenil(item) {
  return belongsToCategory(
    item,
    'juvenil'
  );
}


function isInfantil(item) {
  return belongsToCategory(
    item,
    'infantil'
  );
}


function getEmissionType(item) {
  return normalizeText(
    item &&
    (
      item.tipo_emision ||
      item.emission_type ||
      ''
    )
  );
}


function isDailyFiction(item) {
  var tipo =
    getEmissionType(item);

  return (
    tipo.indexOf('tira diaria') !== -1 ||
    tipo.indexOf('ficcion diaria') !== -1 ||
    tipo.indexOf('diaria') !== -1
  );
}


function isWeeklyFiction(item) {
  var tipo =
    getEmissionType(item);

  return (
    tipo.indexOf('semanal') !== -1 ||
    tipo.indexOf('ficcion semanal') !== -1
  );
}

function isComedia(item) {
  return belongsToCategory(
    item,
    'comedia'
  );
}

function isDrama(item) {
  return belongsToCategory(
    item,
    'drama'
  );
}


function isThriller(item) {
  return belongsToCategory(
    item,
    'thriller'
  );
}


function getDramas(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {
      return isDrama(item);
    })
    .sort(compareProductions);
}


function getThrillers(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {
      return isThriller(item);
    })
    .sort(compareProductions);
}


function getComediasSemanales(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      return (
        isComedia(item) &&
        isWeeklyFiction(item)
      );

    })
    .sort(compareProductions);
}


function getComediasDiarias(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      return (
        isComedia(item) &&
        isDailyFiction(item)
      );

    })
    .sort(compareProductions);
}

/*
 * Devuelve todas las telenovelas comprendidas
 * entre dos años.
 */
function getTelenovelas(
  productions,
  fromYear,
  toYear
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      var year = getYear(item);

      return (
        isTelenovela(item) &&
        year !== null &&
        year >= fromYear &&
        year <= toYear
      );

    })
    .sort(compareProductions);
}


/*
 * Devuelve telenovelas según:
 *
 * - rango de años;
 * - rango horario.
 *
 * Si una producción posee más de un horario,
 * alcanza con que uno de ellos coincida.
 */
function getTelenovelasBySchedule(
  productions,
  fromYear,
  toYear,
  fromHour,
  toHour
) {

  return getTelenovelas(
    productions,
    fromYear,
    toYear
  )
    .filter(function (item) {

      return hasHourBetween(
        item.horario,
        fromHour,
        toHour
      );

    });
}

function getJuvenilesDiarias(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      return (
        isJuvenil(item) &&
        isDailyFiction(item)
      );

    })
    .sort(compareProductions);
}


function getJuvenilesSemanales(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      return (
        isJuvenil(item) &&
        isWeeklyFiction(item)
      );

    })
    .sort(compareProductions);
}


function getInfantiles(
  productions
) {

  if (!Array.isArray(productions)) {
    return [];
  }

  return productions
    .filter(function (item) {

      return isInfantil(item);

    })
    .sort(compareProductions);
}

  /* =========================================================
     IMÁGENES
     ========================================================= */

  function getPosterImage(item) {
    if (
      item &&
      item.image &&
      String(item.image).trim() !== ''
    ) {
      return String(item.image).trim();
    }

    return PLACEHOLDER_IMAGE;
  }

  function getHorizontalImage(item) {
    if (
      item &&
      item.horizontal_image &&
      String(item.horizontal_image).trim() !== ''
    ) {
      return String(item.horizontal_image).trim();
    }

    return null;
  }

  /* =========================================================
     TARJETAS
     ========================================================= */

function buildCard(item) {
  var itemId = String(item.id || '').trim();

  var itemTitle = String(
    item.title || 'Sin título'
  ).trim();

  var itemYear = getYear(item);

  var itemChannel = String(
    item.channel || ''
  ).trim();

  var genre = getSubtitle(item);
  var posterImage = getPosterImage(item);

  var href =
    'show.html?id=' +
    encodeURIComponent(itemId);

  var safeTitle = escapeHtml(itemTitle);

  var safeYear = escapeHtml(
    itemYear !== null ? itemYear : ''
  );

  var safeChannel = escapeHtml(itemChannel);
  var safeGenre = escapeHtml(genre);
  var safeImage = escapeHtml(posterImage);
  var safeHref = escapeHtml(href);

  var metaParts = [];

  if (safeYear) {
    metaParts.push(safeYear);
  }

  if (safeChannel) {
    metaParts.push(safeChannel);
  }

  var metaHtml = '';

  if (metaParts.length > 0) {
    metaHtml =
      '<span class="tv90s-card-meta">' +
        metaParts.join(' · ') +
      '</span>';
  }

  var genreHtml = '';

  if (safeGenre) {
    genreHtml =
      '<span class="tv90s-card-genre">' +
        safeGenre +
      '</span>';
  }

  return [
    '<article',
      ' class="tv90s-card"',
      ' data-production-id="', escapeHtml(itemId), '"',
      ' data-year="', safeYear, '"',
    '>',

      '<a',
        ' class="tv90s-card-link"',
        ' href="', safeHref, '"',
        ' aria-label="Ver ficha de ', safeTitle, '"',
      '>',

        '<div class="tv90s-card-image">',

          '<img',
            ' src="', safeImage, '"',
            ' alt="', safeTitle, '"',
            ' loading="lazy"',
          '>',

        '</div>',

        '<div class="tv90s-card-text">',

          '<strong class="tv90s-card-title">',
            safeTitle,
          '</strong>',

          metaHtml,
          genreHtml,

        '</div>',

      '</a>',

    '</article>'
  ].join('');
}

/* =========================================================
   TARJETAS VERTICALES EDITORIALES
   ========================================================= */

function buildVerticalSlide(item) {

  var itemId =
    String(item.id || '').trim();

  var title =
    String(
      item.title || 'Sin título'
    ).trim();

  var year =
    getYear(item);

  var image =
    getPosterImage(item);

  var href =
    'show.html?id=' +
    encodeURIComponent(itemId);

  var safeTitle =
    escapeHtml(title);

  var safeImage =
    escapeHtml(image);

  var safeHref =
    escapeHtml(href);

  var safeYear =
    year !== null
      ? escapeHtml(year)
      : '';

  return [
    '<li class="item-f">',

      '<article class="tv90s-card">',

        '<a',
          ' class="tv90s-card-link"',
          ' href="', safeHref, '"',
          ' aria-label="Ver ficha de ', safeTitle, '"',
        '>',

          '<div class="tv90s-card-image">',

            '<img',
              ' src="', safeImage, '"',
              ' alt="', safeTitle, '"',
              ' loading="lazy"',
            '>',

          '</div>',

          '<div class="tv90s-card-text">',

            '<strong class="tv90s-card-title">',
              safeTitle,
            '</strong>',

            '<span class="tv90s-card-meta">',
              safeYear,
            '</span>',

          '</div>',

        '</a>',

      '</article>',

    '</li>'
  ].join('');
}

function renderVerticalSlider(
  selector,
  items
) {

  var slider =
    document.querySelector(selector);

  if (!slider) {
    return;
  }

  slider.innerHTML = items
    .map(buildVerticalSlide)
    .join('');

if (items.length === 0) {

  slider.classList.remove('cs-hidden');

  updateVerticalSectionVisibility(
    selector,
    0
  );

  return;
}

  if (
    !initializedSliders[selector] &&
    window.jQuery &&
    window.jQuery.fn &&
    window.jQuery.fn.lightSlider
  ) {

    window.jQuery(slider).lightSlider({
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
    });

    window.jQuery(slider)
      .removeClass('cs-hidden')
      .addClass('slider-ready');

    initializedSliders[selector] = true;

  } else {

    slider.classList.remove(
      'cs-hidden'
    );

  }
  updateVerticalSectionVisibility(
  selector,
  items.length
);
}

function updateVerticalSectionVisibility(
  sliderSelector,
  itemCount
) {

  var slider =
    document.querySelector(sliderSelector);

  if (!slider) {
    return;
  }

  var section =
    slider.closest('.tv90s-vertical-showcase');

  if (!section) {
    return;
  }

  section.hidden = itemCount === 0;
}

/* =========================================================
   GALERÍAS VERTICALES EDITORIALES
   ========================================================= */

function renderTelenovelaEditorialSliders(
  productions
) {

  var noche =
    getTelenovelasBySchedule(
      productions,
      1989,
      1999,
      19,
      22.99
    );

  var tarde8994 =
    getTelenovelasBySchedule(
      productions,
      1989,
      1994,
      13,
      18.99
    );

  var tarde9599 =
    getTelenovelasBySchedule(
      productions,
      1995,
      1999,
      13,
      18.99
    );


  renderVerticalSlider(
    SELECTORS.telenovelasNocheSlider,
    noche
  );

  renderVerticalSlider(
    SELECTORS.telenovelasTarde8994Slider,
    tarde8994
  );

  renderVerticalSlider(
    SELECTORS.telenovelasTarde9599Slider,
    tarde9599
  );
}


function renderJuvenilEditorialSliders(
  productions
) {

  var juvenilesDiarias =
    getJuvenilesDiarias(
      productions
    );

  var juvenilesSemanales =
    getJuvenilesSemanales(
      productions
    );

  var infantiles =
    getInfantiles(
      productions
    );


  renderVerticalSlider(
    SELECTORS.juvenilesDiariasSlider,
    juvenilesDiarias
  );

  renderVerticalSlider(
    SELECTORS.juvenilesSemanalesSlider,
    juvenilesSemanales
  );

  renderVerticalSlider(
    SELECTORS.infantilesSlider,
    infantiles
  );
}

function renderComediaEditorialSliders(
  productions
) {

  var comediasSemanales =
    getComediasSemanales(
      productions
    );

  var comediasDiarias =
    getComediasDiarias(
      productions
    );


  renderVerticalSlider(
    SELECTORS.comediasSemanalesSlider,
    comediasSemanales
  );

  renderVerticalSlider(
    SELECTORS.comediasDiariasSlider,
    comediasDiarias
  );
}

function renderDramaThrillerEditorialSliders(
  productions
) {

  var dramas =
    getDramas(
      productions
    );

  var thrillers =
    getThrillers(
      productions
    );


  renderVerticalSlider(
    SELECTORS.dramasVerticalSlider,
    dramas
  );

  renderVerticalSlider(
    SELECTORS.thrillersSlider,
    thrillers
  );
}

  /* =========================================================
     GALERÍAS HORIZONTALES POR GÉNERO
     ========================================================= */

function buildHorizontalSlide(item) {
  var image = getHorizontalImage(item);

  var title = escapeHtml(
    item.title || ''
  );

  var href =
    'show.html?id=' +
    encodeURIComponent(item.id || '');

  return [
    '<li class="item-f">',

      '<a href="',
      escapeHtml(href),
      '">',

        '<div class="showcase-box">',

          '<img',
            ' src="',
            escapeHtml(image),
            '"',
            ' alt="',
            title,
            '"',
            ' loading="lazy"',
          '>',

        '</div>',

        '<div class="latest-b-text">',

          '<strong>',
            title,
          '</strong>',

          '<p></p>',

        '</div>',

      '</a>',

    '</li>'
  ].join('');
}


function renderHorizontalSlider(selector, items) {
  var slider = document.querySelector(selector);

  if (!slider) {
    return;
  }

  slider.innerHTML = items
    .map(buildHorizontalSlide)
    .join('');

if (items.length === 0) {
  slider.classList.remove('cs-hidden');
  return;
}

  if (
    !initializedSliders[selector] &&
    window.jQuery &&
    window.jQuery.fn &&
    window.jQuery.fn.lightSlider
  ) {
    window.jQuery(slider).lightSlider({
      item: 3,
      autoWidth: false,
      slideMove: 1,
      slideMargin: 20,
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
            item: 2,
            slideMove: 1,
            slideMargin: 14
          }
        },
        {
          breakpoint: 768,
          settings: {
            item: 1,
            slideMove: 1,
            slideMargin: 12
          }
        }
      ]
    });

    window.jQuery(slider)
      .removeClass('cs-hidden')
      .addClass('slider-ready');

    initializedSliders[selector] = true;

  } else {
    slider.classList.remove('cs-hidden');
  }
}

function getHorizontalProductionsByCategories(
  productions,
  categories
) {
  if (!Array.isArray(productions)) {
    return [];
  }

  return productions.filter(function (item) {
    if (!getHorizontalImage(item)) {
      return false;
    }

    return categories.some(function (category) {
      return belongsToCategory(
        item,
        category
      );
    });
  });
}


function renderGenreSlider(config, productions) {
  if (
    !config ||
    !config.selector ||
    !Array.isArray(config.categories)
  ) {
    return;
  }

  var items =
    getHorizontalProductionsByCategories(
      productions,
      config.categories
    );

  renderHorizontalSlider(
    config.selector,
    items
  );

  updateGenreSectionVisibility(
    config.selector,
    items.length
  );
}

function updateGenreSectionVisibility(
  sliderSelector,
  itemCount
) {
  var slider =
    document.querySelector(sliderSelector);

  if (!slider) {
    return;
  }

  var section =
    slider.closest('.tv90s-genre-showcase');

  if (!section) {
    return;
  }

  section.hidden = itemCount === 0;
}

function renderAllHorizontalSliders(productions) {
  renderGenreSlider(
    {
      selector: SELECTORS.telenovelasSlider,
      categories: [
        'telenovela'
      ]
    },
    productions
  );

  renderGenreSlider(
    {
      selector: SELECTORS.comediasSlider,
      categories: [
        'comedia'
      ]
    },
    productions
  );

renderGenreSlider(
  {
    selector: SELECTORS.juvenilesSlider,
    categories: [
      'juvenil',
      'infantil'
    ]
  },
  productions
);

  renderGenreSlider(
    {
      selector: SELECTORS.dramasSlider,
      categories: [
        'drama',
        'thriller'
      ]
    },
    productions
  );
}
  /* =========================================================
     FILTRADO
     ========================================================= */

function getVisibleProductions() {
  return allProductions.filter(function (item) {
    var matchesYear =
      activeYear === 'all' ||
      getYear(item) === Number(activeYear);

    var matchesCategory =
      belongsToCategory(
        item,
        activeCategory
      );

    var matchesChannel =
      belongsToSelectedChannel(
        item,
        activeChannel
      );

    return (
      matchesYear &&
      matchesCategory &&
      matchesChannel
    );
  });
}


  /* =========================================================
     RENDER DEL CATÁLOGO
     ========================================================= */

  function renderProductionCards(productions) {

    var gridElement = document.querySelector(
      SELECTORS.grid
    );

    if (!gridElement) {

      console.warn(
        'No se encontró ' +
        SELECTORS.grid
      );

      return;

    }

    gridElement.innerHTML = '';

    if (
      !Array.isArray(productions) ||
      productions.length === 0
    ) {
      return;
    }

    gridElement.innerHTML =

      productions
        .map(buildCard)
        .join('');

  }


function getCategoryLabel() {
  var labels = {
    all: '',
    telenovela: 'telenovelas',
    comedia: 'comedias',
    drama: 'dramas',
    thriller: 'thrillers',
    juvenil: 'ficciones juveniles'
  };

  return labels[activeCategory] || activeCategory;
}


function getChannelLabel() {
  var labels = {
    all: '',
    america: 'América',
    atc: 'ATC / Canal 7'
  };

  return labels[activeChannel] || activeChannel;
}


function updateHeading(count) {
  var titleElement =
    document.querySelector(SELECTORS.title);

  var descriptionElement =
    document.querySelector(SELECTORS.description);

  var categoryLabel = getCategoryLabel();
  var channelLabel = getChannelLabel();

  var title = 'Todas las ficciones';

  if (
    activeYear !== 'all' &&
    activeCategory === 'all'
  ) {
    title =
      'Ficciones de ' +
      activeYear;

  } else if (
    activeYear === 'all' &&
    activeCategory !== 'all'
  ) {
    title =
      categoryLabel.charAt(0).toUpperCase() +
      categoryLabel.slice(1);

  } else if (
    activeYear !== 'all' &&
    activeCategory !== 'all'
  ) {
    title =
      categoryLabel.charAt(0).toUpperCase() +
      categoryLabel.slice(1) +
      ' de ' +
      activeYear;
  }

  if (activeChannel !== 'all') {
    title += ' · ' + channelLabel;
  }

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (!descriptionElement) {
    return;
  }

  var productionText =
    count === 1
      ? 'producción'
      : 'producciones';

  var description =
    count +
    ' ' +
    productionText;

  if (
    activeYear === 'all' &&
    activeCategory === 'all' &&
    activeChannel === 'all'
  ) {
    description +=
      ' emitidas por los canales de aire argentinos entre ' +
      START_YEAR +
      ' y ' +
      END_YEAR +
      '.';

    descriptionElement.textContent = description;
    return;
  }

  description += ' encontradas';

  if (activeYear !== 'all') {
    description +=
      ' para ' +
      activeYear;
  }

  if (activeCategory !== 'all') {
    description +=
      ' en la categoría ' +
      categoryLabel;
  }

  if (activeChannel !== 'all') {
    description +=
      ' en ' +
      channelLabel;
  }

  description += '.';

  descriptionElement.textContent = description;
}


function updateEmptyState(count) {
  var emptyElement =
    document.querySelector(SELECTORS.empty);

  if (!emptyElement) {
    return;
  }

  emptyElement.hidden = count !== 0;
}


function updateActiveButtons() {
  document.querySelectorAll(
    SELECTORS.yearFilters
  ).forEach(function (button) {
    var value =
      button.getAttribute(
        'data-tv90s-year'
      ) || 'all';

    var active =
      value === activeYear;

    button.classList.toggle(
      'active',
      active
    );

    button.setAttribute(
      'aria-pressed',
      active ? 'true' : 'false'
    );
  });

  document.querySelectorAll(
    SELECTORS.categoryFilters
  ).forEach(function (button) {
    var value =
      button.getAttribute(
        'data-tv90s-category'
      ) || 'all';

    var active =
      value === activeCategory;

    button.classList.toggle(
      'active',
      active
    );

    button.setAttribute(
      'aria-pressed',
      active ? 'true' : 'false'
    );
  });

  document.querySelectorAll(
    SELECTORS.channelFilters
  ).forEach(function (button) {
    var value =
      button.getAttribute(
        'data-tv90s-channel'
      ) || 'all';

    var active =
      value === activeChannel;

    button.classList.toggle(
      'active',
      active
    );

    button.setAttribute(
      'aria-pressed',
      active ? 'true' : 'false'
    );
  });
}

function renderCatalogue() {
  var productions =
    getVisibleProductions();

  renderProductionCards(
    productions
  );

  renderAllHorizontalSliders(
    productions
  );

renderTelenovelaEditorialSliders(
  productions
);

renderComediaEditorialSliders(
  productions
);

renderDramaThrillerEditorialSliders(
  productions
);

renderJuvenilEditorialSliders(
  productions
);

  updateHeading(
    productions.length
  );

  updateEmptyState(
    productions.length
  );

  updateActiveButtons();
}

  /* =========================================================
     EVENTOS DE FILTROS
     ========================================================= */

function bindYearFilters() {
  document.querySelectorAll(
    SELECTORS.yearFilters
  ).forEach(function (button) {
    if (button.dataset.bound === '1') {
      return;
    }

    button.addEventListener(
      'click',
      function () {
        activeYear =
          button.getAttribute(
            'data-tv90s-year'
          ) || 'all';

        renderCatalogue();
      }
    );

    button.dataset.bound = '1';
  });
}


function bindCategoryFilters() {
  document.querySelectorAll(
    SELECTORS.categoryFilters
  ).forEach(function (button) {
    if (button.dataset.bound === '1') {
      return;
    }

    button.addEventListener(
      'click',
      function () {
        activeCategory =
          button.getAttribute(
            'data-tv90s-category'
          ) || 'all';

        renderCatalogue();
      }
    );

    button.dataset.bound = '1';
  });
}


function bindChannelFilters() {
  document.querySelectorAll(
    SELECTORS.channelFilters
  ).forEach(function (button) {
    if (button.dataset.bound === '1') {
      return;
    }

    button.addEventListener(
      'click',
      function () {
        var selectedChannel =
          button.getAttribute(
            'data-tv90s-channel'
          ) || 'all';

        activeChannel =
          activeChannel === selectedChannel
            ? 'all'
            : selectedChannel;

        renderCatalogue();
      }
    );

    button.dataset.bound = '1';
  });
}

  /* =========================================================
     CARRUSEL DE FILTROS (MÓVIL)
     ========================================================= */

  function updateCarouselArrows(
    scrollArea,
    previousButton,
    nextButton
  ) {

    if (!scrollArea) {
      return;
    }

    var tolerance = 3;

    var maxScrollLeft =
      scrollArea.scrollWidth -
      scrollArea.clientWidth;

    var isAtStart =
      scrollArea.scrollLeft <= tolerance;

    var isAtEnd =
      scrollArea.scrollLeft >=
      maxScrollLeft - tolerance;

    var hasOverflow =
      maxScrollLeft > tolerance;

    if (previousButton) {
      previousButton.disabled =
        !hasOverflow || isAtStart;
    }

    if (nextButton) {
      nextButton.disabled =
        !hasOverflow || isAtEnd;
    }

  }


  function scrollFilterCarousel(
    scrollArea,
    direction
  ) {

    if (!scrollArea) {
      return;
    }

    var distance =
      Math.max(
        180,
        Math.round(
          scrollArea.clientWidth * 0.65
        )
      );

    scrollArea.scrollBy({
      left: direction * distance,
      behavior: 'smooth'
    });

  }


  function bindCarouselButtons() {

    document.querySelectorAll(
      SELECTORS.filterCarousels
    ).forEach(function (carousel) {

      var scrollArea =
        carousel.querySelector(
          '.filter-scroll'
        );

      var previousButton =
        carousel.querySelector(
          '.filter-arrow-prev'
        );

      var nextButton =
        carousel.querySelector(
          '.filter-arrow-next'
        );

      if (!scrollArea) {
        return;
      }

      function refreshArrows() {

        updateCarouselArrows(
          scrollArea,
          previousButton,
          nextButton
        );

      }

      if (
        previousButton &&
        previousButton.dataset.bound !== '1'
      ) {

        previousButton.addEventListener(
          'click',
          function () {

            scrollFilterCarousel(
              scrollArea,
              -1
            );

          }
        );

        previousButton.dataset.bound = '1';

      }

      if (
        nextButton &&
        nextButton.dataset.bound !== '1'
      ) {

        nextButton.addEventListener(
          'click',
          function () {

            scrollFilterCarousel(
              scrollArea,
              1
            );

          }
        );

        nextButton.dataset.bound = '1';

      }

      if (
        scrollArea.dataset.arrowBound !== '1'
      ) {

        scrollArea.addEventListener(
          'scroll',
          refreshArrows,
          {
            passive: true
          }
        );

        scrollArea.dataset.arrowBound = '1';

      }

      refreshArrows();

      window.requestAnimationFrame(
        refreshArrows
      );

      window.addEventListener(
        'resize',
        refreshArrows
      );

    });

  }


  /* =========================================================
     CARGA DEL JSON
     ========================================================= */

  function loadCatalogue() {

    fetch(DATA_URL, {

      cache: 'no-cache'

    })

    .then(function (response) {

      if (!response.ok) {

        throw new Error(
          'No fue posible cargar data.json'
        );

      }

      return response.json();

    })

.then(function (data) {

  var items = [];

  if (Array.isArray(data)) {

    items = data;

  } else if (
    data &&
    Array.isArray(data.items)
  ) {

    items = data.items;

  } else {

    throw new Error(
      'Formato inválido de data.json: no se encontró el array "items".'
    );

  }

  allProductions = items
    .filter(isValidProduction)
    .sort(compareProductions);

renderCatalogue();

})

    .catch(function (error) {

      console.error(error);

      var grid =
        document.querySelector(
          SELECTORS.grid
        );

      if (grid) {

        grid.innerHTML =
          '<p class="catalog-error">' +
          'No fue posible cargar el catálogo de TV de los años 90.' +
          '</p>';

      }

    });

  }


/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

function initTv90sCatalogue() {
  bindYearFilters();
  bindCategoryFilters();
  bindChannelFilters();
  bindCarouselButtons();

  loadCatalogue();
}

if (document.readyState === 'loading') {

  document.addEventListener(
    'DOMContentLoaded',
    initTv90sCatalogue
  );

} else {

  initTv90sCatalogue();

}

})();
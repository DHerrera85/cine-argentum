/* js/canal9-90s-autosync.js */

(function () {
  'use strict';

  /* =========================================================
     CONFIGURACIÓN GENERAL
     ========================================================= */

  var DATA_URL = 'data.json?v=20260728-canal9-1';

  var CHANNEL_NAMES = [
    'Canal 9',
    'Canal 9/Azul TV',
    'Azul TV'
  ];

  var START_YEAR = 1989;
  var END_YEAR = 1999;

  var PLACEHOLDER_IMAGE =
    'images/verticals/placeholder-280x420.svg';

  var SELECTORS = {
    grid: '#canal9-90s-grid',
    featuredSlider: '#canal9-featured-slider',
    yearFilters: '[data-canal9-year]',
    categoryFilters: '[data-canal9-category]',
    title: '#canal9-catalogue-title',
    description: '#canal9-catalogue-description',
    empty: '#canal9-empty-state',
    filterCarousels: '.filter-carousel'
  };

  var allProductions = [];
  var activeYear = 'all';
  var activeCategory = 'all';
  var featuredSliderInitialized = false;


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

  function belongsToCanal9(item) {
    var expectedChannels = CHANNEL_NAMES.map(normalizeText);

    return getChannelValues(item).some(function (channel) {
      return expectedChannels.indexOf(
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
      belongsToCanal9(item)
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
        'comedia'
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

  function getFeaturedProductions() {
    return allProductions.filter(function (item) {
      return getHorizontalImage(item);
    });
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
    var subtitle = getSubtitle(item);
    var posterImage = getPosterImage(item);

    var href =
      'show.html?id=' +
      encodeURIComponent(itemId);

    var safeTitle = escapeHtml(itemTitle);

    var safeYear = escapeHtml(
      itemYear !== null ? itemYear : ''
    );

    var safeSubtitle = escapeHtml(subtitle);
    var safeImage = escapeHtml(posterImage);
    var safeHref = escapeHtml(href);

    var subtitleHtml = '';

    if (safeSubtitle) {
      subtitleHtml =
        '<span class="canal9-card-subtitle">' +
          safeSubtitle +
        '</span>';
    }

    return [
      '<article',
        ' class="canal9-card"',
        ' data-production-id="', escapeHtml(itemId), '"',
        ' data-year="', safeYear, '"',
      '>',

        '<a',
          ' class="canal9-card-link"',
          ' href="', safeHref, '"',
          ' aria-label="Ver ficha de ', safeTitle, '"',
        '>',

          '<div class="canal9-card-image">',

            '<img',
              ' src="', safeImage, '"',
              ' alt="', safeTitle, '"',
              ' loading="lazy"',
            '>',

          '</div>',

          '<div class="canal9-card-text">',

            '<strong class="canal9-card-title">',
              safeTitle,
            '</strong>',

            '<span class="canal9-card-year">',
              safeYear,
            '</span>',

            subtitleHtml,

          '</div>',

        '</a>',

      '</article>'
    ].join('');
  }
  /* =========================================================
     SLIDER DE DESTACADAS
     ========================================================= */

  function renderFeaturedSlider() {

    var slider = document.querySelector(
      SELECTORS.featuredSlider
    );

    if (!slider) {
      return;
    }

    var items = getFeaturedProductions();

    slider.innerHTML = items.map(function (item) {

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

    }).join('');

    if (items.length === 0) {
      slider.classList.remove('cs-hidden');
      return;
    }

    if (
      !featuredSliderInitialized &&
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

      featuredSliderInitialized = true;

    } else {

      slider.classList.remove('cs-hidden');

    }

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

      return (
        matchesYear &&
        matchesCategory
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

    return (
      labels[activeCategory] ||
      activeCategory
    );

  }

    function updateHeading(count) {

    var titleElement = document.querySelector(
      SELECTORS.title
    );

    var descriptionElement = document.querySelector(
      SELECTORS.description
    );

    var categoryLabel = getCategoryLabel();

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
        categoryLabel
          .charAt(0)
          .toUpperCase() +
        categoryLabel.slice(1);

    } else if (
      activeYear !== 'all' &&
      activeCategory !== 'all'
    ) {

      title =
        categoryLabel
          .charAt(0)
          .toUpperCase() +
        categoryLabel.slice(1) +
        ' de ' +
        activeYear;

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

    if (
      activeYear === 'all' &&
      activeCategory === 'all'
    ) {

      descriptionElement.textContent =
        count +
        ' ' +
        productionText +
        ' emitidas por Canal 9 y Azul TV entre ' +
        START_YEAR +
        ' y ' +
        END_YEAR +
        '.';

      return;

    }

    if (activeYear !== 'all') {

      descriptionElement.textContent =
        count +
        ' ' +
        productionText +
        ' encontradas para ' +
        activeYear +
        (
          activeCategory !== 'all'
            ? ' en la categoría ' +
              categoryLabel
            : ''
        ) +
        '.';

      return;

    }

    descriptionElement.textContent =
      count +
      ' ' +
      productionText +
      ' encontradas en la categoría ' +
      categoryLabel +
      '.';

  }


  function updateEmptyState(count) {

    var emptyElement = document.querySelector(
      SELECTORS.empty
    );

    if (!emptyElement) {
      return;
    }

    emptyElement.hidden =
      count !== 0;

  }


  function updateActiveButtons() {

    document.querySelectorAll(
      SELECTORS.yearFilters
    ).forEach(function (button) {

      var value =
        button.getAttribute(
          'data-canal9-year'
        ) || 'all';

      var active =
        value === activeYear;

      button.classList.toggle(
        'active',
        active
      );

      button.setAttribute(
        'aria-pressed',
        active
          ? 'true'
          : 'false'
      );

    });


    document.querySelectorAll(
      SELECTORS.categoryFilters
    ).forEach(function (button) {

      var value =
        button.getAttribute(
          'data-canal9-category'
        ) || 'all';

      var active =
        value === activeCategory;

      button.classList.toggle(
        'active',
        active
      );

      button.setAttribute(
        'aria-pressed',
        active
          ? 'true'
          : 'false'
      );

    });

  }


  function renderCatalogue() {

    var productions =
      getVisibleProductions();

    renderProductionCards(
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

      if (
        button.dataset.bound === '1'
      ) {
        return;
      }

      button.addEventListener(
        'click',
        function () {

          activeYear =
            button.getAttribute(
              'data-canal9-year'
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

      if (
        button.dataset.bound === '1'
      ) {
        return;
      }

      button.addEventListener(
        'click',
        function () {

          activeCategory =
            button.getAttribute(
              'data-canal9-category'
            ) || 'all';

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

  console.log(
    'Canal 9 / Azul TV: ' +
    allProductions.length +
    ' producciones cargadas.'
  );

  renderFeaturedSlider();

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
          'No fue posible cargar el catálogo.' +
          '</p>';

      }

    });

  }
    /* =========================================================
     INICIALIZACIÓN
     ========================================================= */

  function init() {

    bindYearFilters();

    bindCategoryFilters();

    bindCarouselButtons();

    loadCatalogue();

  }


  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

})();
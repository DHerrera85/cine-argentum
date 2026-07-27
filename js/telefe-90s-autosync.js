/* js/telefe-90s-autosync.js */

(function () {
  'use strict';

  /* =========================================================
     CONFIGURACIÓN GENERAL
     ========================================================= */

  var DATA_URL = 'data.json?v=20260726-telefe90s-1';

  var CHANNEL_NAME = 'Telefe';

  var START_YEAR = 1990;
  var END_YEAR = 1999;

  var PLACEHOLDER_IMAGE =
    'images/verticals/placeholder-280x420.svg';

var SELECTORS = {
  grid: '#telefe-90s-grid',
  yearFilters: '[data-telefe-year]',
  categoryFilters: '[data-telefe-category]',
  title: '#telefe-catalogue-title',
  description: '#telefe-catalogue-description',
  empty: '#telefe-empty-state'
};

var allProductions = [];
var activeYear = 'all';
var activeCategory = 'all';


  /* =========================================================
     NORMALIZACIÓN DE TEXTO
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


  /* =========================================================
     PROTECCIÓN BÁSICA DE TEXTO HTML
     ========================================================= */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  /* =========================================================
     OBTENER LOS CANALES DE UNA PRODUCCIÓN
     ========================================================= */

  function getChannelValues(item) {
    var values = [];

    if (!item || typeof item !== 'object') {
      return values;
    }

    /*
     * Formato simple:
     *
     * "channel": "Telefe"
     */
    if (item.channel) {
      values.push(item.channel);
    }

    /*
     * Formato múltiple:
     *
     * "channels": ["Telefe", "Canal 9"]
     */
    if (Array.isArray(item.channels)) {
      values = values.concat(item.channels);
    }

    /*
     * Formato utilizado por el catálogo general:
     *
     * "air_channels": ["Telefe"]
     */
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


  /* =========================================================
     COMPROBAR SI LA PRODUCCIÓN PERTENECE A TELEFE
     ========================================================= */

  function belongsToTelefe(item) {
    var expectedChannel =
      normalizeText(CHANNEL_NAME);

    return getChannelValues(item).some(
      function (channel) {
        return (
          normalizeText(channel) ===
          expectedChannel
        );
      }
    );
  }


  /* =========================================================
     OBTENER EL AÑO
     ========================================================= */

  function getYear(item) {
    var year = Number(
      item && item.year
    );

    return Number.isFinite(year)
      ? year
      : null;
  }


  /* =========================================================
     INTERPRETAR FECHAS
     ========================================================= */

  function parseDate(value) {
    if (!value) {
      return null;
    }

    var text = String(value).trim();
    var parts;
    var date;

    /*
     * Formato:
     *
     * 1998-11-16
     */
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

    /*
     * Formato:
     *
     * 16/11/1998
     */
    if (
      /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)
    ) {
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


  /* =========================================================
     OBTENER FECHA DE ESTRENO
     ========================================================= */

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


  /* =========================================================
     ORDENAR LAS PRODUCCIONES
     ========================================================= */

  function compareProductions(a, b) {
    var yearA = getYear(a) || 0;
    var yearB = getYear(b) || 0;

    /*
     * Primero se ordenan por año:
     *
     * 1990
     * 1991
     * 1992
     * ...
     * 1999
     */
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    var dateA = getReleaseDate(a);
    var dateB = getReleaseDate(b);

    /*
     * Dentro del mismo año:
     * se ordenan por fecha de estreno.
     */
    if (
      dateA &&
      dateB &&
      dateA.getTime() !== dateB.getTime()
    ) {
      return (
        dateA.getTime() -
        dateB.getTime()
      );
    }

    /*
     * Las producciones que tienen fecha
     * aparecen antes que las que no la tienen.
     */
    if (dateA && !dateB) {
      return -1;
    }

    if (!dateA && dateB) {
      return 1;
    }

    /*
     * Si no existe fecha o ambas coinciden,
     * se utiliza el título.
     */
    return String(a.title || '')
      .localeCompare(
        String(b.title || ''),
        'es',
        {
          sensitivity: 'base'
        }
      );
  }


  /* =========================================================
     VALIDAR PRODUCCIÓN PARA TELEFE 90
     ========================================================= */

  function isValidProduction(item) {
    var year = getYear(item);

    return Boolean(
      item &&
      item.id &&
      year !== null &&
      year >= START_YEAR &&
      year <= END_YEAR &&
      belongsToTelefe(item)
    );
  }

    /* =========================================================
     OBTENER EL SUBTÍTULO DE LA PRODUCCIÓN
     ========================================================= */

  function getSubtitle(item) {
    if (!item) {
      return '';
    }

    /*
     * Si el registro ya tiene un subtítulo específico,
     * se utiliza sin modificarlo.
     */
    if (
      item.subtitle &&
      String(item.subtitle).trim() !== ''
    ) {
      return String(item.subtitle).trim();
    }

    /*
     * Si genre es un arreglo:
     *
     * "genre": ["Drama", "Romance"]
     *
     * se muestra:
     *
     * Drama · Romance
     */
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

    /*
     * Si genre es un texto simple:
     *
     * "genre": "Telenovela"
     */
    if (
      item.genre &&
      String(item.genre).trim() !== ''
    ) {
      return String(item.genre).trim();
    }

    return '';
  }

  /* =========================================================
     OBTENER EL GÉNERO NORMALIZADO
     ========================================================= */

  function getGenreText(item) {

    if (!item || !item.genre) {
      return '';
    }

    /*
     * genre puede venir como:
     *
     * "Comedia"
     *
     * o
     *
     * ["Comedia","Familiar"]
     */

    if (Array.isArray(item.genre)) {

      return normalizeText(

        item.genre
          .filter(Boolean)
          .join(' ')

      );

    }

    return normalizeText(item.genre);

  }


  /* =========================================================
     COMPROBAR SI UNA PRODUCCIÓN
     PERTENECE A UNA CATEGORÍA
     ========================================================= */

  function belongsToCategory(item, category) {

    if (
      !category ||
      category === 'all'
    ) {
      return true;
    }

    var genreText =
      getGenreText(item);

    if (!genreText) {
      return false;
    }

    /*
     * Alias permitidos
     */

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

    var values =
      aliases[category] ||
      [category];

    return values.some(function(value){

      return (
        genreText.indexOf(
          normalizeText(value)
        ) !== -1
      );

    });

  }
  /* =========================================================
     OBTENER LA IMAGEN VERTICAL
     ========================================================= */

  function getPosterImage(item) {
    if (
      item &&
      item.image &&
      String(item.image).trim() !== ''
    ) {
      /*
       * Se utiliza exactamente la ruta almacenada
       * en data.json.
       *
       * No se modifica ni se renombra el archivo.
       */
      return String(item.image).trim();
    }

    return PLACEHOLDER_IMAGE;
  }

/* =========================================================
   OBTENER LA IMAGEN HORIZONTAL
   ========================================================= */

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
   OBTENER PRODUCCIONES DESTACADAS
   ========================================================= */

function getFeaturedProductions() {

  return allProductions.filter(function(item){

    return getHorizontalImage(item);

  });

}

  /* =========================================================
     CONSTRUIR UNA TARJETA
     ========================================================= */

  function buildCard(item) {
    var itemId = String(
      item.id || ''
    ).trim();

    var itemTitle = String(
      item.title || 'Sin título'
    ).trim();

    var itemYear = getYear(item);
    var subtitle = getSubtitle(item);
    var posterImage = getPosterImage(item);

    /*
     * El ID se codifica únicamente para utilizarlo
     * dentro de la URL.
     *
     * Ejemplo:
     *
     * show.html?id=T0041
     */
    var href =
      'show.html?id=' +
      encodeURIComponent(itemId);

    /*
     * Todos los textos visibles se protegen antes
     * de incorporarse al HTML.
     */
    var safeTitle = escapeHtml(itemTitle);
    var safeYear = escapeHtml(
      itemYear !== null ? itemYear : ''
    );

    var safeSubtitle = escapeHtml(subtitle);
    var safeImage = escapeHtml(posterImage);
    var safeHref = escapeHtml(href);

    /*
     * El subtítulo solamente se incorpora
     * cuando existe un valor.
     */
    var subtitleHtml = '';

    if (safeSubtitle) {
      subtitleHtml =
        '<span class="telefe-card-subtitle">' +
          safeSubtitle +
        '</span>';
    }

    return [
      '<article',
        ' class="telefe-card"',
        ' data-production-id="', escapeHtml(itemId), '"',
        ' data-year="', safeYear, '"',
      '>',

        '<a',
          ' class="telefe-card-link"',
          ' href="', safeHref, '"',
          ' aria-label="Ver ficha de ', safeTitle, '"',
        '>',

          '<div class="telefe-card-image">',

            '<img',
              ' src="', safeImage, '"',
              ' alt="', safeTitle, '"',
              ' loading="lazy"',
            '>',

          '</div>',

          '<div class="telefe-card-text">',

            '<strong class="telefe-card-title">',
              safeTitle,
            '</strong>',

            '<span class="telefe-card-year">',
              safeYear,
            '</span>',

            subtitleHtml,

          '</div>',

        '</a>',

      '</article>'
    ].join('');
  }

/* =========================================================
   GENERAR EL SLIDER SUPERIOR
   ========================================================= */

function renderFeaturedSlider() {

  var slider =
    document.querySelector('#telefe-featured-slider');

  if (!slider) {
    return;
  }

  var items = getFeaturedProductions();

  slider.innerHTML = items.map(function(item){

    var image = getHorizontalImage(item);
    var title = escapeHtml(item.title || '');
    var href =
      'show.html?id=' +
      encodeURIComponent(item.id || '');

    return `
      <li class="item-f">
        <a href="${href}">
          <div class="showcase-box">
            <img
              src="${escapeHtml(image)}"
              alt="${title}"
              loading="lazy">
          </div>

          <div class="latest-b-text">
            <strong>${title}</strong>
            <p></p>
          </div>
        </a>
      </li>
    `;

  }).join('');

  if (
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
  }

}

  /* =========================================================
     FILTRAR POR AÑO Y CATEGORÍA
     ========================================================= */

  function getVisibleProductions() {

    return allProductions.filter(
      function (item) {

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

      }
    );

  }

  /* =========================================================
     GENERAR LAS TARJETAS DENTRO DE LA GRILLA
     ========================================================= */

  function renderProductionCards(productions) {
    var gridElement =
      document.querySelector(SELECTORS.grid);

    if (!gridElement) {
      console.warn(
        'Telefe 90s: no se encontró el contenedor ' +
        SELECTORS.grid
      );

      return;
    }

    /*
     * Se reemplaza el contenido anterior de la grilla.
     */
    gridElement.innerHTML = '';

    if (
      !Array.isArray(productions) ||
      productions.length === 0
    ) {
      return;
    }

    /*
     * Se construyen todas las tarjetas
     * y luego se insertan en una sola operación.
     */
    gridElement.innerHTML = productions
      .map(function (item) {
        return buildCard(item);
      })
      .join('');
  }

    /* =========================================================
     ACTUALIZAR TÍTULO Y DESCRIPCIÓN
     ========================================================= */

  function updateHeading(count) {
    var titleElement =
      document.querySelector(SELECTORS.title);

    var descriptionElement =
      document.querySelector(
        SELECTORS.description
      );

    if (titleElement) {
      titleElement.textContent =
        activeYear === 'all'
          ? 'Todas las ficciones'
          : 'Ficciones de ' + activeYear;
    }

    if (descriptionElement) {

      if (activeYear === 'all') {

        descriptionElement.textContent =
          count +
          ' ' +
          (count === 1
            ? 'producción'
            : 'producciones') +
          ' emitidas por Telefe entre ' +
          START_YEAR +
          ' y ' +
          END_YEAR +
          '.';

      } else {

        descriptionElement.textContent =
          count +
          ' ' +
          (count === 1
            ? 'producción'
            : 'producciones') +
          ' emitidas durante ' +
          activeYear +
          '.';

      }

    }
  }


  /* =========================================================
     MOSTRAR / OCULTAR MENSAJE SIN RESULTADOS
     ========================================================= */

  function updateEmptyState(count) {

    var emptyElement =
      document.querySelector(
        SELECTORS.empty
      );

    if (!emptyElement) {
      return;
    }

    emptyElement.hidden =
      count !== 0;
  }


  /* =========================================================
     MARCAR BOTÓN ACTIVO
     ========================================================= */

function updateActiveButtons() {

  var yearButtons =
    document.querySelectorAll(
      SELECTORS.yearFilters
    );

  yearButtons.forEach(function (button) {

    var value =
      button.getAttribute(
        'data-telefe-year'
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

  var categoryButtons =
    document.querySelectorAll(
      SELECTORS.categoryFilters
    );

  categoryButtons.forEach(function (button) {

    var value =
      button.getAttribute(
        'data-telefe-category'
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

}


  /* =========================================================
     RENDER GENERAL DEL CATÁLOGO
     ========================================================= */

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
     ASIGNAR EVENTOS A LOS FILTROS DE AÑO
     ========================================================= */

  function bindYearFilters() {

    var buttons =
      document.querySelectorAll(
        SELECTORS.yearFilters
      );

    buttons.forEach(function (button) {

      /*
       * Evitar registrar el mismo evento
       * más de una vez.
       */
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
              'data-telefe-year'
            ) || 'all';

          renderCatalogue();

        }
      );

      button.dataset.bound = '1';

    });

  }


  /* =========================================================
     ASIGNAR EVENTOS A LOS FILTROS DE CATEGORÍA
     ========================================================= */

  function bindCategoryFilters() {

    var buttons =
      document.querySelectorAll(
        SELECTORS.categoryFilters
      );

    buttons.forEach(function (button) {

      /*
       * Evitar registrar el mismo evento
       * más de una vez.
       */
      if (
        button.dataset.categoryBound === '1'
      ) {
        return;
      }

      button.addEventListener(
        'click',
        function () {

          activeCategory =
            button.getAttribute(
              'data-telefe-category'
            ) || 'all';

          renderCatalogue();

        }
      );

      button.dataset.categoryBound = '1';

    });

  }

  /* =========================================================
     CAMBIAR EL FILTRO DESDE CÓDIGO
     ========================================================= */

  function setYearFilter(year) {

    if (
      year === undefined ||
      year === null ||
      year === ''
    ) {

      activeYear = 'all';

    } else {

      activeYear =
        String(year);

    }

    renderCatalogue();

  }
  /* =========================================================
     MOSTRAR ERROR DE CARGA
     ========================================================= */

  function renderLoadError() {
    var gridElement =
      document.querySelector(
        SELECTORS.grid
      );

    var descriptionElement =
      document.querySelector(
        SELECTORS.description
      );

    var emptyElement =
      document.querySelector(
        SELECTORS.empty
      );

    if (gridElement) {
      gridElement.innerHTML =
        '<p class="telefe-load-error">' +
          'No se pudo cargar el catálogo de Telefe.' +
        '</p>';
    }

    if (descriptionElement) {
      descriptionElement.textContent =
        'Revisá la ruta de data.json y la consola del navegador.';
    }

    if (emptyElement) {
      emptyElement.hidden = true;
    }
  }


  /* =========================================================
     CARGAR DATA.JSON
     ========================================================= */

  async function loadCatalogue() {
    try {
      var response = await fetch(
        DATA_URL,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error(
          'data.json respondió con estado ' +
          response.status
        );
      }

      var data =
        await response.json();

      var items =
        Array.isArray(
          data && data.items
        )
          ? data.items
          : [];

      /*
       * Se seleccionan únicamente:
       *
       * - producciones con ID;
       * - canal Telefe;
       * - años 1990 a 1999.
       */
      allProductions = items
        .filter(function (item) {
          return isValidProduction(item);
        })
        .sort(compareProductions);

      /*
       * Una vez cargados los datos:
       *
       * - se conectan los botones;
       * - se genera la grilla;
       * - se actualizan título y contador.
       */
      bindYearFilters();
      bindCategoryFilters();

      renderFeaturedSlider();

      renderCatalogue();

    } catch (error) {
      console.error(
        'Telefe 90s: no se pudo cargar data.json',
        error
      );

      renderLoadError();
    }
  }


  /* =========================================================
     INICIALIZAR EL MÓDULO
     ========================================================= */

  function initTelefe90sCatalogue() {
    /*
     * Los filtros se conectan antes de cargar
     * data.json para que la interfaz quede preparada.
     */
    bindYearFilters();
    bindCategoryFilters();

    /*
     * Iniciar la carga del catálogo.
     */
    loadCatalogue();
  }


  /* =========================================================
     API PÚBLICA OPCIONAL
     ========================================================= */

  window.Telefe90sCatalogue = {
    render: renderCatalogue,
    setYear: setYearFilter,
    getItems: function () {
      return allProductions.slice();
    },
    getActiveYear: function () {
      return activeYear;
    }
  };


  /* =========================================================
     EJECUCIÓN AL CARGAR LA PÁGINA
     ========================================================= */

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initTelefe90sCatalogue
    );
  } else {
    initTelefe90sCatalogue();
  }

})();
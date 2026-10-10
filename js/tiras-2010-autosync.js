(function () {
    'use strict';

    /* =========================================================
       CONFIGURACIÓN GENERAL
       ========================================================= */

    var DATA_URL = 'data.json';

    /*
     * Las filas se incorporarán progresivamente durante
     * la migración desde tiras_2010.html.
     *
     * No agregamos todavía ninguna producción ni regla
     * editorial para no modificar el comportamiento actual.
     */

    var HORIZONTAL_ROWS = [
        {
            key: 'ultimas',
            sectionId: 'tiras-2010-ultimas',
            containerId: 'tiras-2010-ultimas-list',
            countId: 'tiras-2010-ultimas-count'
        },

        {
            key: 'historias-epoca',
            sectionId: 'tiras-2010-historias-epoca',
            containerId: 'tiras-2010-historias-epoca-list',
            countId: 'tiras-2010-historias-epoca-count'
        },

        {
            key: 'telenovelas-estelares',
            sectionId: 'tiras-2010-telenovelas-estelares',
            containerId: 'tiras-2010-telenovelas-estelares-list',
            countId: 'tiras-2010-telenovelas-estelares-count'
        },
    ];

    var VERTICAL_ROWS = [
        {
            key: 'comedias-estelares',

            sectionId:
                'tiras-2010-comedias-estelares',

            containerId:
                'tiras-2010-comedias-estelares-list',

            countId:
                'tiras-2010-comedias-estelares-count'
        },

        {
            key: 'thrillers-dramas',

            sectionId:
                'tiras-2010-thrillers-dramas',

            containerId:
                'tiras-2010-thrillers-dramas-list',

            countId:
                'tiras-2010-thrillers-dramas-count'
        },

        {
            key: 'para-toda-la-familia',

            sectionId:
                'tiras-2010-para-toda-la-familia',

            containerId:
                'tiras-2010-para-toda-la-familia-list',

            countId:
                'tiras-2010-para-toda-la-familia-count'
        },
        {
            key: 'telenovelas-noche-2010-2022',

            sectionId:
                'tiras-2010-telenovelas-noche-2010-2022',

            containerId:
                'tiras-2010-telenovelas-noche-2010-2022-list',

            countId:
                'tiras-2010-telenovelas-noche-2010-2022-count'
        },
        {
            key: 'telenovelas-tarde-2010-2019',

            sectionId:
                'tiras-2010-telenovelas-tarde-2010-2019',

            containerId:
                'tiras-2010-telenovelas-tarde-2010-2019-list',

            countId:
                'tiras-2010-telenovelas-tarde-2010-2019-count'
        },

        {
            key: 'webseries',
            sectionId: 'tiras-2010-webseries',
            containerId: 'tiras-2010-webseries-list',
            countId: 'tiras-2010-webseries-count'
        },
        {
            key: 'no-emitidos',
            sectionId: 'tiras-2010-no-emitidos',
            containerId: 'tiras-2010-no-emitidos-list',
            countId: 'tiras-2010-no-emitidos-count'
        }
    ];

    /*
     * Calendario editorial equivalente a Estrenos 2000–2009,
     * adaptado al período de las tiras 2010–2022.
     *
     * Su renderizado se incorporará en un bloque posterior.
     */

    var EDITORIAL_CALENDAR = {
        minYear: 2010,
        maxYear: 2022,

        sectionId:
            'tiras-2010-historical-premieres',

        tabsId:
            'tiras-2010-historical-month-tabs',

        previousButtonId:
            'tiras-2010-months-previous',

        nextButtonId:
            'tiras-2010-months-next',

        containerId:
            'tiras-2010-historical-premieres-list',

        countId:
            'tiras-2010-historical-premieres-count',

        emptyId:
            'tiras-2010-historical-premieres-empty'
    };

    var VALID_EDITORIAL_EMISSIONS = [
        'tira diaria',
        'semanal',
        'fines de semana',
        'webserie'
    ];

    var MONTH_NAMES = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ];

    /* =========================================================
   UTILIDADES
   ========================================================= */

    function normalizeText(value) {
        var text = String(
            value === undefined || value === null
                ? ''
                : value
        );

        if (typeof text.normalize === 'function') {
            text = text.normalize('NFD');
        }

        return text
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function escapeHtml(value) {
        return String(
            value === undefined || value === null
                ? ''
                : value
        )
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /* =========================================================
       FECHAS
       ========================================================= */

    function parseDate(value) {
        if (!value) {
            return null;
        }

        var text = String(value).trim();
        var parts;
        var day;
        var month;
        var year;

        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
            parts = text.split('/');

            day = Number(parts[0]);
            month = Number(parts[1]);
            year = Number(parts[2]);
        } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
            parts = text.split('-');

            year = Number(parts[0]);
            month = Number(parts[1]);
            day = Number(parts[2]);
        } else {
            return null;
        }

        var date = new Date(
            year,
            month - 1,
            day
        );

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }


    /* =========================================================
       IMÁGENES
       ========================================================= */

    function getPosterImage(item) {
        if (!item) {
            return '';
        }

        return String(
            item.image || ''
        ).trim();
    }

    function getHorizontalImage(item) {
        if (!item) {
            return '';
        }

        return String(
            item.horizontal_image ||
            item.image ||
            ''
        ).trim();
    }


    /* =========================================================
       ORDEN
       ========================================================= */

    function getItemReleaseDate(item) {
        if (!item) {
            return null;
        }

        return parseDate(
            item.release_date ||
            item.fecha_estreno
        );
    }

    function compareRecentFirst(a, b) {
        var dateA = getItemReleaseDate(a);
        var dateB = getItemReleaseDate(b);

        if (dateA && dateB) {
            return dateB - dateA;
        }

        if (dateA) {
            return -1;
        }

        if (dateB) {
            return 1;
        }

        var yearA = Number(a && a.year) || 0;
        var yearB = Number(b && b.year) || 0;

        return yearB - yearA;
    }

    /* =========================================================
   CALENDARIO HISTÓRICO — DATOS
   ========================================================= */

    function getEditorialEmission(item) {
        if (!item) {
            return '';
        }

        return normalizeText(
            item.tipo_emision || ''
        );
    }


    function isValidEditorialPremiere(item) {
        if (!item || !item.id) {
            return false;
        }

        var date = getItemReleaseDate(item);

        if (!date) {
            return false;
        }

        var year = date.getFullYear();

        if (
            year < EDITORIAL_CALENDAR.minYear ||
            year > EDITORIAL_CALENDAR.maxYear
        ) {
            return false;
        }

        var emission = getEditorialEmission(item);

        return VALID_EDITORIAL_EMISSIONS.indexOf(
            emission
        ) !== -1;
    }


    function getMonthlyPremieres(items, monthIndex) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items
            .filter(function (item) {
                if (!isValidEditorialPremiere(item)) {
                    return false;
                }

                var date = getItemReleaseDate(item);

                return (
                    date &&
                    date.getMonth() === monthIndex
                );
            })
            .sort(function (a, b) {
                var dateA = getItemReleaseDate(a);
                var dateB = getItemReleaseDate(b);

                return dateB - dateA;
            });
    }


    function formatEditorialDate(item) {
        var date = getItemReleaseDate(item);

        if (!date) {
            return '';
        }

        var day = date.getDate();
        var month = MONTH_NAMES[
            date.getMonth()
        ];
        var year = date.getFullYear();

        return (
            day +
            ' de ' +
            month +
            ' de ' +
            year
        );
    }


    function getEditorialFormatLabel(item) {
        var emission = getEditorialEmission(item);

        if (emission === 'tira diaria') {
            return 'TIRA';
        }

        if (emission === 'semanal') {
            return 'SEMANAL';
        }

        if (emission === 'fines de semana') {
            return 'FIN DE SEMANA';
        }

        if (emission === 'webserie') {
            return 'WEBSERIE';
        }

        return '';
    }

    /* =========================================================
   FILAS EDITORIALES
   ========================================================= */

    function belongsToRow(item, rowKey) {
        if (
            !item ||
            !rowKey ||
            !Array.isArray(item.tiras_2010_rows)
        ) {
            return false;
        }

        var normalizedRowKey =
            normalizeText(rowKey);

        return item.tiras_2010_rows.some(
            function (row) {
                return normalizeText(row) ===
                    normalizedRowKey;
            }
        );
    }

    function getVerticalRowProductions(
        items,
        rowConfig
    ) {
        if (
            !Array.isArray(items) ||
            !rowConfig ||
            !rowConfig.key
        ) {
            return [];
        }

        return items
            .filter(function (item) {
                return Boolean(
                    item &&
                    item.id &&
                    belongsToRow(
                        item,
                        rowConfig.key
                    ) &&
                    getPosterImage(item)
                );
            })
            .sort(compareRecentFirst);
    }

    function getHorizontalRowProductions(
        items,
        rowConfig
    ) {
        if (
            !Array.isArray(items) ||
            !rowConfig ||
            !rowConfig.key
        ) {
            return [];
        }

        return items
            .filter(function (item) {
                return Boolean(
                    item &&
                    item.id &&
                    belongsToRow(
                        item,
                        rowConfig.key
                    ) &&
                    getHorizontalImage(item)
                );
            })
            .sort(compareRecentFirst);
    }

    /* =========================================================
   TARJETAS
   ========================================================= */

    function buildHorizontalCard(item) {
        var id = String(
            item.id || ''
        ).trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var image = getHorizontalImage(item);

        var href =
            'show.html?id=' +
            encodeURIComponent(id);

        return [
            '<li class="item-f">',

            '<a href="',
            escapeHtml(href),
            '" aria-label="Ver ficha de ',
            escapeHtml(title),
            '">',

            '<div class="showcase-box">',

            '<img',
            ' src="',
            escapeHtml(image),
            '"',
            ' loading="lazy"',
            ' alt="',
            escapeHtml(title),
            '"',
            '>',

            '</div>',

            '<div class="latest-b-text">',

            '<strong>',
            escapeHtml(title),
            '</strong>',

            '<p></p>',

            '</div>',

            '</a>',

            '</li>'
        ].join('');
    }


    function buildVerticalCard(item) {
        var id = String(
            item.id || ''
        ).trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var year =
            item.year !== undefined &&
                item.year !== null
                ? String(item.year).trim()
                : '';

        var image = getPosterImage(item);

        var href =
            'show.html?id=' +
            encodeURIComponent(id);

        return [
            '<li class="item-f">',

            '<a href="',
            escapeHtml(href),
            '" aria-label="Ver ficha de ',
            escapeHtml(title),
            '">',

            '<div class="latest-box">',

            '<div class="latest-b-img">',

            '<img',
            ' src="',
            escapeHtml(image),
            '"',
            ' loading="lazy"',
            ' alt="',
            escapeHtml(title),
            '"',
            '>',

            '</div>',

            '<div class="latest-b-text">',

            '<strong>',
            escapeHtml(title),
            '</strong>',

            year
                ? '<span class="year">' +
                escapeHtml(year) +
                '</span>'
                : '',

            '<p></p>',

            '</div>',

            '</div>',

            '</a>',

            '</li>'
        ].join('');
    }

    function buildHistoricalPremiereCard(item) {
        var id = String(
            item.id || ''
        ).trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var image = getPosterImage(item);
        var date = formatEditorialDate(item);
        var format = getEditorialFormatLabel(item);

        var href =
            'show.html?id=' +
            encodeURIComponent(id);

        return [
            '<li class="item-f">',

            '<a href="',
            escapeHtml(href),
            '" aria-label="Ver ficha de ',
            escapeHtml(title),
            '">',

            '<div class="latest-box">',

            '<div class="latest-b-img">',

            '<img',
            ' src="',
            escapeHtml(image),
            '"',
            ' loading="lazy"',
            ' alt="',
            escapeHtml(title),
            '"',
            '>',

            format
                ? '<span class="tiras-2000-format-badge">' +
                escapeHtml(format) +
                '</span>'
                : '',

            '</div>',

            '<div class="latest-b-text">',

            '<strong>',
            escapeHtml(title),
            '</strong>',

            date
                ? '<span class="year">' +
                escapeHtml(date) +
                '</span>'
                : '',

            '<p></p>',

            '</div>',

            '</div>',

            '</a>',

            '</li>'
        ].join('');
    }

    /* =========================================================
   LIGHTSLIDER
   ========================================================= */

    function destroyHorizontalSlider(list) {
        if (
            list &&
            list._tiras2010Slider &&
            typeof list._tiras2010Slider.destroy === 'function'
        ) {
            list._tiras2010Slider.destroy();
            list._tiras2010Slider = null;
        }
    }


    function destroyVerticalSlider(list) {
        if (
            list &&
            list._tiras2010Slider &&
            typeof list._tiras2010Slider.destroy === 'function'
        ) {
            list._tiras2010Slider.destroy();
            list._tiras2010Slider = null;
        }
    }


    function initializeHorizontalSlider(list) {
        if (
            !list ||
            typeof window.jQuery !== 'function' ||
            typeof window.jQuery.fn.lightSlider !== 'function'
        ) {
            if (list) {
                list.classList.remove('cs-hidden');
            }

            return null;
        }

        destroyHorizontalSlider(list);

        list.classList.remove('cs-hidden');

        var slider = window.jQuery(list).lightSlider({
            item: 3,
            autoWidth: false,
            slideMove: 1,
            slideMargin: 20,
            loop: false,
            controls: true,
            pager: false,
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

        list._tiras2010Slider = slider;

        return slider;
    }

    // Navegación móvil para pilotos no emitidos.
    function enableUnairedPilotNavigation(list) {
        if (!list || list.dataset.pilotNavigationReady === 'true') {
            return;
        }

        list.dataset.pilotNavigationReady = 'true';

        var startX = 0;
        var startY = 0;
        var moved = false;
        var touchActive = false;
        var touchedLink = null;

        list.addEventListener('touchstart', function (event) {
            if (event.touches.length !== 1) {
                touchActive = false;
                touchedLink = null;
                return;
            }

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            moved = false;
            touchActive = true;
            touchedLink = event.target.closest('a[href]');
        }, { passive: true });

        list.addEventListener('touchmove', function (event) {
            if (!touchActive || !event.touches.length) return;

            var dx = Math.abs(event.touches[0].clientX - startX);
            var dy = Math.abs(event.touches[0].clientY - startY);

            if (dx >= 40 && dx > dy) {
                moved = true;
            }
        }, { passive: true });

        list.addEventListener('touchend', function (event) {
            if (!touchActive) return;

            var touch = event.changedTouches[0];
            var dx = Math.abs(touch.clientX - startX);
            var dy = Math.abs(touch.clientY - startY);
            var link = touchedLink;

            if (dx >= 40 && dx > dy) {
                moved = true;
            }

            touchActive = false;
            touchedLink = null;

            if (!moved && link && list.contains(link)) {
                window.location.assign(link.href);
            }

            moved = false;
        }, { passive: true });

        list.addEventListener('touchcancel', function () {
            moved = true;
            touchActive = false;
            touchedLink = null;
        }, { passive: true });
    }


    function initializeVerticalSlider(list) {
        list.classList.remove('cs-hidden');

        if (
            !window.jQuery ||
            !window.jQuery.fn ||
            !window.jQuery.fn.lightSlider
        ) {
            return null;
        }

        var $list = window.jQuery(list);

        var instance =
            list._tiras2010Slider;

        if ($list.hasClass('lightSlider')) {
            if (
                !instance &&
                typeof $list.refresh === 'function'
            ) {
                instance = $list;
            }

            if (
                instance &&
                typeof instance.refresh === 'function'
            ) {
                instance.refresh();
            }

            list._tiras2010Slider =
                instance || null;

            return list._tiras2010Slider;
        }

        instance = $list.lightSlider({
            item: 5,
            autoWidth: false,
            slideMove: 1,
            slideMargin: 12,
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
                        item: 4,
                        slideMove: 1,
                        slideMargin: 12
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

        list._tiras2010Slider = instance;

        return instance;
    }
    /* =========================================================
   CONTADORES
   ========================================================= */

    function updateRowCount(
        rowConfig,
        total
    ) {
        if (!rowConfig || !rowConfig.countId) {
            return;
        }

        var count = document.getElementById(
            rowConfig.countId
        );

        if (!count) {
            return;
        }

        count.textContent =
            total === 1
                ? '1 producción'
                : total + ' producciones';

        count.hidden = false;
    }


    /* =========================================================
       RENDER DE FILAS VERTICALES
       ========================================================= */

    /* =========================================================
RENDER DE FILAS HORIZONTALES
========================================================= */

    function renderHorizontalRow(
        items,
        rowConfig
    ) {
        var list = document.getElementById(
            rowConfig.containerId
        );

        if (!list) {
            return;
        }

        var productions =
            getHorizontalRowProductions(
                items,
                rowConfig
            );

        destroyHorizontalSlider(list);

        list.innerHTML = productions
            .map(buildHorizontalCard)
            .join('');

        updateRowCount(
            rowConfig,
            productions.length
        );

        initializeHorizontalSlider(list);
    }

    function renderVerticalRow(
        items,
        rowConfig
    ) {
        var list = document.getElementById(
            rowConfig.containerId
        );

        if (!list) {
            return;
        }

        var productions =
            getVerticalRowProductions(
                items,
                rowConfig
            );

        list.innerHTML = productions
            .map(buildVerticalCard)
            .join('');

        updateRowCount(
            rowConfig,
            productions.length
        );

        if (rowConfig.key === 'no-emitidos') {
            enableUnairedPilotNavigation(list);
        }

        initializeVerticalSlider(list);
    }

    /* =========================================================
   CALENDARIO HISTÓRICO — RENDER
   ========================================================= */

    function renderEditorialMonth(
        items,
        monthIndex
    ) {
        var section = document.getElementById(
            EDITORIAL_CALENDAR.sectionId
        );

        var list = document.getElementById(
            EDITORIAL_CALENDAR.containerId
        );

        var count = document.getElementById(
            EDITORIAL_CALENDAR.countId
        );

        var empty = document.getElementById(
            EDITORIAL_CALENDAR.emptyId
        );

        if (!section || !list) {
            return;
        }

        var premieres = getMonthlyPremieres(
            items,
            monthIndex
        );

        destroyVerticalSlider(list);

        list.innerHTML = premieres
            .map(buildHistoricalPremiereCard)
            .join('');

        if (count) {
            count.textContent =
                premieres.length === 1
                    ? '1 estreno'
                    : premieres.length + ' estrenos';

            count.hidden = false;
        }

        if (empty) {
            empty.hidden =
                premieres.length !== 0;
        }

        section.hidden = false;

        if (premieres.length) {
            list.hidden = false;
            initializeVerticalSlider(list);
        } else {
            list.hidden = true;
            list.classList.remove('cs-hidden');
        }
    }

    function initializeEditorialCalendar(items) {
        var section = document.getElementById(
            EDITORIAL_CALENDAR.sectionId
        );

        var tabsContainer = document.getElementById(
            EDITORIAL_CALENDAR.tabsId
        );

        var previousButton = document.getElementById(
            EDITORIAL_CALENDAR.previousButtonId
        );

        var nextButton = document.getElementById(
            EDITORIAL_CALENDAR.nextButtonId
        );

        if (!section || !tabsContainer) {
            return;
        }

        var tabs = Array.prototype.slice.call(
            tabsContainer.querySelectorAll(
                '[data-month]'
            )
        );

        if (!tabs.length) {
            return;
        }

        var currentMonth =
            new Date().getMonth();

        function selectMonth(monthIndex) {
            tabs.forEach(function (tab) {
                var tabMonth = Number(
                    tab.getAttribute('data-month')
                );

                var selected =
                    tabMonth === monthIndex;

                tab.setAttribute(
                    'aria-selected',
                    selected ? 'true' : 'false'
                );

                tab.classList.toggle(
                    'is-active',
                    selected
                );
            });

            renderEditorialMonth(
                items,
                monthIndex
            );
        }

        tabs.forEach(function (tab) {
            tab.addEventListener(
                'click',
                function () {
                    var monthIndex = Number(
                        tab.getAttribute('data-month')
                    );

                    if (
                        monthIndex >= 0 &&
                        monthIndex <= 11
                    ) {
                        selectMonth(monthIndex);
                    }
                }
            );
        });

        if (previousButton) {
            previousButton.addEventListener(
                'click',
                function () {
                    tabsContainer.scrollBy({
                        left: -240,
                        behavior: 'smooth'
                    });
                }
            );
        }

        if (nextButton) {
            nextButton.addEventListener(
                'click',
                function () {
                    tabsContainer.scrollBy({
                        left: 240,
                        behavior: 'smooth'
                    });
                }
            );
        }

        selectMonth(currentMonth);
    }

    function renderAllRows(items) {
        HORIZONTAL_ROWS.forEach(
            function (rowConfig) {
                renderHorizontalRow(
                    items,
                    rowConfig
                );
            }
        );

        VERTICAL_ROWS.forEach(
            function (rowConfig) {
                renderVerticalRow(
                    items,
                    rowConfig
                );
            }
        );
    }


    /* =========================================================
       CARGA DE DATA.JSON
       ========================================================= */

    fetch(DATA_URL, {
        cache: 'no-store'
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    'No se pudo cargar data.json'
                );
            }

            return response.json();
        })
        .then(function (data) {
            var items =
                data && Array.isArray(data.items)
                    ? data.items
                    : [];

            renderAllRows(items);
            initializeEditorialCalendar(items);
        })
        .catch(function () {
            VERTICAL_ROWS.forEach(
                function (rowConfig) {
                    var list =
                        document.getElementById(
                            rowConfig.containerId
                        );

                    if (list) {
                        list.classList.remove(
                            'cs-hidden'
                        );
                    }
                }
            );
        });

})();
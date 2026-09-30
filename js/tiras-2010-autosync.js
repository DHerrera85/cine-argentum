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

    var HORIZONTAL_ROWS = [];

    var VERTICAL_ROWS = [
        {
            key: 'comedias-estelares',

            sectionId:
                'tiras-2010-comedias-estelares',

            containerId:
                'tiras-2010-comedias-estelares-list',

            countId:
                'tiras-2010-comedias-estelares-count'
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
        maxYear: 2022
    };

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

        initializeVerticalSlider(list);
    }


    function renderAllRows(items) {
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
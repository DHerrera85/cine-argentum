(function () {
    'use strict';

    /* =========================================================
       CONFIGURACIÓN
       ========================================================= */

    var DATA_URL =
        'data.json?v=20260906-tiras2000-3';

    var HORIZONTAL_ROWS = [
        {
            key: 'comedias-exitosas',
            containerId:
                'tiras-2000-comedias-exitosas-list',
            countId:
                'tiras-2000-comedias-exitosas-count'
        },
        {
            key: 'dramas-exitosos',
            containerId:
                'tiras-2000-dramas-exitosos-list',
            countId:
                'tiras-2000-dramas-exitosos-count'
        }
    ];

    var VERTICAL_ROWS = [
        {
            key: 'comedias-estelares',
            minYear: 2005,
            maxYear: 2009,
            containerId:
                'tiras-2000-comedias-estelares-2005-09-list',
            countId:
                'tiras-2000-comedias-estelares-2005-09-count'
        },
        {
            key: 'comedias-estelares',
            minYear: 2000,
            maxYear: 2004,
            containerId:
                'tiras-2000-comedias-estelares-2000-04-list',
            countId:
                'tiras-2000-comedias-estelares-2000-04-count'
        },
        {
            key: 'ficciones-tarde',
            minYear: 2005,
            maxYear: 2009,
            containerId:
                'tiras-2000-ficciones-tarde-2005-09-list',
            countId:
                'tiras-2000-ficciones-tarde-2005-09-count'
        },
        {
            key: 'ficciones-tarde',
            minYear: 2000,
            maxYear: 2004,
            containerId:
                'tiras-2000-ficciones-tarde-2000-04-list',
            countId:
                'tiras-2000-ficciones-tarde-2000-04-count'
        }
    ];

    var STATIC_ROWS = [
        {
            sectionId: 'tiras-2000-telenovelas-estelares',
            countId: 'tiras-2000-telenovelas-estelares-count'
        },
        {
            sectionId: 'tiras-2000-thrillers',
            countId: 'tiras-2000-thrillers-count'
        },
        {
            sectionId: 'tiras-2000-sitcoms',
            countId: 'tiras-2000-sitcoms-count'
        },
        {
            sectionId: 'tiras-2000-protagonistas-latinoamerica',
            countId: 'tiras-2000-protagonistas-latinoamerica-count'
        }
    ];

    var VERTICAL_PLACEHOLDER =
        'images/verticals/placeholder-280x420.svg';

    /* =========================================================
       NORMALIZACIÓN Y SEGURIDAD
       ========================================================= */

    function normalizeText(value) {
        var text =
            value === undefined || value === null
                ? ''
                : String(value);

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
       FECHAS Y ORDEN
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
        } else if (
            /^\d{4}-\d{1,2}-\d{1,2}$/.test(text)
        ) {
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

    function getReleaseTimestamp(item) {
        var date = parseDate(
            item &&
            (
                item.fecha_estreno ||
                item.release_date ||
                item.premiere_date
            )
        );

        if (date) {
            return date.getTime();
        }

        var year = Number(item && item.year);

        if (Number.isFinite(year)) {
            return new Date(year, 0, 1).getTime();
        }

        return 0;
    }

    function compareRecentFirst(a, b) {
        var dateDifference =
            getReleaseTimestamp(b) -
            getReleaseTimestamp(a);

        if (dateDifference !== 0) {
            return dateDifference;
        }

        return String(a.title || '').localeCompare(
            String(b.title || ''),
            'es',
            {
                sensitivity: 'base'
            }
        );
    }

    /* =========================================================
       FILAS EDITORIALES
       ========================================================= */

    function belongsToRow(item, rowKey) {
        if (
            !item ||
            !Array.isArray(item.tiras_2000_rows)
        ) {
            return false;
        }

        var expectedKey =
            normalizeText(rowKey);

        return item.tiras_2000_rows.some(
            function (value) {
                return normalizeText(value) === expectedKey;
            }
        );
    }

    function getHorizontalImage(item) {
        if (
            item &&
            item.horizontal_image &&
            String(item.horizontal_image).trim()
        ) {
            return String(
                item.horizontal_image
            ).trim();
        }

        return '';
    }

    function getPosterImage(item) {
        if (
            item &&
            item.image &&
            String(item.image).trim()
        ) {
            return String(item.image).trim();
        }

        return VERTICAL_PLACEHOLDER;
    }

    function getVerticalRowProductions(
        items,
        rowConfig
    ) {
        if (
            !Array.isArray(items) ||
            !rowConfig
        ) {
            return [];
        }

        var minYear = Number(rowConfig.minYear);
        var maxYear = Number(rowConfig.maxYear);

        return items
            .filter(function (item) {
                if (
                    !item ||
                    !item.id ||
                    !belongsToRow(item, rowConfig.key)
                ) {
                    return false;
                }

                var itemYear = Number(item.year);

                if (
                    Number.isFinite(minYear) &&
                    (
                        !Number.isFinite(itemYear) ||
                        itemYear < minYear
                    )
                ) {
                    return false;
                }

                if (
                    Number.isFinite(maxYear) &&
                    (
                        !Number.isFinite(itemYear) ||
                        itemYear > maxYear
                    )
                ) {
                    return false;
                }

                return true;
            })
            .sort(compareRecentFirst);
    }

    function getRowProductions(items, rowKey) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items
            .filter(function (item) {
                return Boolean(
                    item &&
                    item.id &&
                    belongsToRow(item, rowKey) &&
                    getHorizontalImage(item)
                );
            })
            .sort(compareRecentFirst);
    }

    /* =========================================================
       TARJETAS HORIZONTALES
       ========================================================= */

    function buildHorizontalCard(item) {
        var id = String(item.id || '').trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var image =
            getHorizontalImage(item);

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
        var id = String(item.id || '').trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var year =
            item.year !== undefined &&
                item.year !== null
                ? String(item.year).trim()
                : '';

        var image =
            getPosterImage(item);

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

    function initializeHorizontalSlider(list) {
        list.classList.remove('cs-hidden');

        if (
            !window.jQuery ||
            !window.jQuery.fn ||
            !window.jQuery.fn.lightSlider
        ) {
            return;
        }

        var $list = window.jQuery(list);

        if ($list.hasClass('lightSlider')) {
            var instance =
                $list.data('lightSlider');

            if (
                instance &&
                typeof instance.refresh === 'function'
            ) {
                instance.refresh();
            }

            return;
        }

        $list.lightSlider({
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
    }

    function initializeVerticalSlider(list) {
        list.classList.remove('cs-hidden');

        if (
            !window.jQuery ||
            !window.jQuery.fn ||
            !window.jQuery.fn.lightSlider
        ) {
            return;
        }

        var $list = window.jQuery(list);

        if ($list.hasClass('lightSlider')) {
            var instance =
                $list.data('lightSlider');

            if (
                instance &&
                typeof instance.refresh === 'function'
            ) {
                instance.refresh();
            }

            return;
        }

        $list.lightSlider({
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
    }

    function updateRowCount(
        rowConfig,
        itemCount
    ) {
        if (!rowConfig || !rowConfig.countId) {
            return;
        }

        var countElement =
            document.getElementById(
                rowConfig.countId
            );

        if (!countElement) {
            return;
        }

        countElement.textContent =
            itemCount === 1
                ? '1 ficción'
                : itemCount + ' ficciones';

        countElement.hidden = false;
    }
    function updateStaticRowCounts() {
        STATIC_ROWS.forEach(function (rowConfig) {
            var section = document.getElementById(
                rowConfig.sectionId
            );

            if (!section) {
                return;
            }

            var list = section.querySelector(
                '.slider-h, .slider-v'
            );

            if (!list) {
                return;
            }

            var itemCount = Array.prototype.filter.call(
                list.children,
                function (element) {
                    return (
                        element.tagName === 'LI' &&
                        !element.classList.contains('clone')
                    );
                }
            ).length;

            updateRowCount(
                rowConfig,
                itemCount
            );
        });
    }

    /* =========================================================
       RENDER
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
            getRowProductions(
                items,
                rowConfig.key
            );

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

        initializeVerticalSlider(list);
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
       INICIALIZACIÓN
       ========================================================= */

    updateStaticRowCounts();

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
            HORIZONTAL_ROWS
                .concat(VERTICAL_ROWS)
                .forEach(function (rowConfig) {
                    var list = document.getElementById(
                        rowConfig.containerId
                    );

                    if (list) {
                        list.classList.remove(
                            'cs-hidden'
                        );
                    }
                });
        });
})();
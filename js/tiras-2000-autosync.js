(function () {
    'use strict';

    /* =========================================================
       CONFIGURACIÓN
       ========================================================= */

    var DATA_URL =
        'data.json?v=20260908-tiras2000-3';

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
        },
        {
            key: 'telenovelas-estelares',
            minYear: 2000,
            maxYear: 2009,
            containerId:
                'tiras-2000-telenovelas-estelares-list',
            countId:
                'tiras-2000-telenovelas-estelares-count'
        },
        {
            key: 'thrillers',
            minYear: 2000,
            maxYear: 2009,
            containerId:
                'tiras-2000-thrillers-list',
            countId:
                'tiras-2000-thrillers-count'
        },
        {
            key: 'sitcoms',
            minYear: 2000,
            maxYear: 2009,
            containerId:
                'tiras-2000-sitcoms-list',
            countId:
                'tiras-2000-sitcoms-count'
        },
        {
            key: 'protagonistas-latinoamerica',
            minYear: 2000,
            maxYear: 2009,
            containerId:
                'tiras-2000-protagonistas-latinoamerica-list',
            countId:
                'tiras-2000-protagonistas-latinoamerica-count'
        },
        {
            key: 'webseries',
            minYear: 2000,
            maxYear: 2009,
            containerId:
                'tiras-2000-webseries-list',
            countId:
                'tiras-2000-webseries-count'
        }
    ];

    var EDITORIAL_CALENDAR = {
        minYear: 2000,
        maxYear: 2009,
        sectionId:
            'tiras-2000-historical-premieres',
        tabsId:
            'tiras-2000-historical-month-tabs',
        previousButtonId:
            'tiras-2000-months-previous',
        nextButtonId:
            'tiras-2000-months-next',
        containerId:
            'tiras-2000-historical-premieres-list',
        countId:
            'tiras-2000-historical-premieres-count',
        emptyId:
            'tiras-2000-historical-premieres-empty'
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

    function getItemReleaseDate(item) {
        if (!item) {
            return null;
        }

        return parseDate(
            item.fecha_estreno ||
            item.release_date ||
            item.premiere_date
        );
    }

    function hasEditorialSource(item) {
        return Boolean(
            item &&
            (
                item.channel ||
                item.platform ||
                (
                    Array.isArray(item.platforms) &&
                    item.platforms.length
                ) ||
                (
                    Array.isArray(item.air_channels) &&
                    item.air_channels.length
                ) ||
                (
                    Array.isArray(item.cable_channels) &&
                    item.cable_channels.length
                )
            )
        );
    }

    function getEditorialFormatLabel(item) {
        var emission = normalizeText(
            item && item.tipo_emision
        );

        if (emission === 'tira diaria') {
            return 'TIRA';
        }

        if (
            emission === 'semanal' ||
            emission === 'fines de semana'
        ) {
            return 'SEMANAL';
        }

        if (emission === 'webserie') {
            return 'WEBSERIE';
        }

        return '';
    }

    function formatEditorialDate(item) {
        var date = getItemReleaseDate(item);

        if (!date) {
            return '';
        }

        var day = String(
            date.getDate()
        ).padStart(2, '0');

        var month = String(
            date.getMonth() + 1
        ).padStart(2, '0');

        return (
            day +
            '/' +
            month +
            '/' +
            date.getFullYear()
        );
    }

    function isTiras2000EditorialCandidate(
        item,
        rowConfig
    ) {
        if (
            !item ||
            !item.id ||
            !item.image ||
            !hasEditorialSource(item) ||
            !getItemReleaseDate(item)
        ) {
            return false;
        }

        var year = Number(item.year);
        var minYear = Number(rowConfig.minYear);
        var maxYear = Number(rowConfig.maxYear);

        var emission = normalizeText(
            item.tipo_emision
        );

        if (
            !Number.isFinite(year) ||
            year < minYear ||
            year > maxYear
        ) {
            return false;
        }

        if (
            normalizeText(item.type) ===
            'pelicula' ||
            normalizeText(item.type) ===
            'movie'
        ) {
            return false;
        }

        return VALID_EDITORIAL_EMISSIONS
            .indexOf(emission) !== -1;
    }

    function getMonthlyPremieres(
        items,
        rowConfig,
        monthIndex
    ) {
        if (
            !Array.isArray(items) ||
            !rowConfig ||
            !Number.isFinite(monthIndex)
        ) {
            return [];
        }

        return items
            .filter(function (item) {
                if (
                    !isTiras2000EditorialCandidate(
                        item,
                        rowConfig
                    )
                ) {
                    return false;
                }

                return (
                    getItemReleaseDate(item)
                        .getMonth() === monthIndex
                );
            })
            .sort(compareRecentFirst);
    }

    function getMonthlyPremieres(
        items,
        rowConfig,
        monthIndex
    ) {
        if (
            !Array.isArray(items) ||
            !rowConfig ||
            !Number.isFinite(monthIndex)
        ) {
            return [];
        }

        return items
            .filter(function (item) {
                if (
                    !isTiras2000EditorialCandidate(
                        item,
                        rowConfig
                    )
                ) {
                    return false;
                }

                var releaseDate =
                    getItemReleaseDate(item);

                return Boolean(
                    releaseDate &&
                    releaseDate.getMonth() ===
                    monthIndex);
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

    function buildHistoricalPremiereCard(item) {
        var id = String(
            item.id || ''
        ).trim();

        var title = String(
            item.title || 'Sin título'
        ).trim();

        var image = getPosterImage(item);
        var date = formatEditorialDate(item);

        var formatLabel =
            getEditorialFormatLabel(item);

        var href =
            'show.html?id=' +
            encodeURIComponent(id);

        return [
            '<li class="item-f">',

            '<a href="',
            escapeHtml(href),
            '" aria-label="Ver ficha de ',
            escapeHtml(title),

            date
                ? ', estrenada el ' +
                escapeHtml(date)
                : '',

            '">',

            '<div class="latest-box">',

            '<div class="latest-b-img ',
            'tiras-2000-premiere-image">',

            '<span class="',
            'tiras-2000-premiere-badge',
            '">',

            escapeHtml(formatLabel),

            '</span>',

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

            '<span class="',
            'tiras-2000-premiere-date',
            '">',

            escapeHtml(date),

            '</span>',

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
            return null;
        }

        var $list = window.jQuery(list);

        var instance =
            list._tiras2000Slider;

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

            list._tiras2000Slider =
                instance || null;

            return list._tiras2000Slider;
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

        list._tiras2000Slider = instance;

        return instance;
    }

    function destroyVerticalSlider(list) {
        if (!list) {
            return;
        }

        var instance =
            list._tiras2000Slider;

        if (
            instance &&
            typeof instance.destroy === 'function'
        ) {
            instance.destroy();
        }

        list._tiras2000Slider = null;
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

    function renderEditorialMonth(
        items,
        rowConfig,
        monthIndex,
        animateTabs
    ) {
        var section = document.getElementById(
            rowConfig.sectionId
        );

        var list = document.getElementById(
            rowConfig.containerId
        );

        var tabs = document.getElementById(
            rowConfig.tabsId
        );

        var empty = document.getElementById(
            rowConfig.emptyId
        );

        if (!section || !list || !tabs) {
            return;
        }

        var productions =
            getMonthlyPremieres(
                items,
                rowConfig,
                monthIndex
            );

        var buttons = tabs.querySelectorAll(
            '[data-month]'
        );

        destroyVerticalSlider(list);

        list.innerHTML = productions
            .map(buildHistoricalPremiereCard)
            .join('');

        list.setAttribute(
            'aria-label',
            'Estrenos históricos de ' +
            MONTH_NAMES[monthIndex]
        );

        updateRowCount(
            rowConfig,
            productions.length
        );

        Array.prototype.forEach.call(
            buttons,
            function (button) {
                var isActive =
                    Number(
                        button.getAttribute(
                            'data-month'
                        )
                    ) === monthIndex;

                button.classList.toggle(
                    'is-active',
                    isActive
                );

                button.setAttribute(
                    'aria-selected',
                    isActive
                        ? 'true'
                        : 'false'
                );

                button.tabIndex =
                    isActive ? 0 : -1;

                if (isActive) {
                    button.scrollIntoView({
                        behavior: animateTabs
                            ? 'smooth'
                            : 'auto',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            }
        );

        if (empty) {
            empty.hidden =
                productions.length !== 0;
        }

        list.hidden =
            productions.length === 0;

        section.hidden = false;

        if (productions.length) {
            list._tiras2000Slider =
                initializeVerticalSlider(list);
        }
    }

    function enableMonthTabsMouseDrag(tabs) {
        var isPointerDown = false;
        var didDrag = false;
        var startX = 0;
        var startScrollLeft = 0;
        var activePointerId = null;
        var suppressClick = false;

        if (
            !tabs ||
            !window.PointerEvent
        ) {
            return function () {
                return false;
            };
        }

        function finishDrag(event) {
            if (
                !isPointerDown ||
                event.pointerId !==
                activePointerId
            ) {
                return;
            }

            var releasedPointerId =
                activePointerId;

            var dragged = didDrag;

            isPointerDown = false;
            didDrag = false;
            activePointerId = null;

            tabs.classList.remove(
                'is-dragging'
            );

            if (
                typeof tabs.hasPointerCapture ===
                'function' &&
                tabs.hasPointerCapture(
                    releasedPointerId
                )
            ) {
                tabs.releasePointerCapture(
                    releasedPointerId
                );
            }

            if (dragged) {
                suppressClick = true;

                window.setTimeout(
                    function () {
                        suppressClick = false;
                    },
                    100
                );
            }
        }

        tabs.addEventListener(
            'pointerdown',
            function (event) {
                if (
                    event.pointerType !== 'mouse' ||
                    event.button !== 0
                ) {
                    return;
                }

                isPointerDown = true;
                didDrag = false;

                activePointerId =
                    event.pointerId;

                startX = event.clientX;

                startScrollLeft =
                    tabs.scrollLeft;

                if (
                    typeof tabs.setPointerCapture ===
                    'function'
                ) {
                    tabs.setPointerCapture(
                        activePointerId
                    );
                }
            }
        );

        tabs.addEventListener(
            'pointermove',
            function (event) {
                if (
                    !isPointerDown ||
                    event.pointerId !==
                    activePointerId
                ) {
                    return;
                }

                var movement =
                    event.clientX - startX;

                if (
                    !didDrag &&
                    Math.abs(movement) > 5
                ) {
                    didDrag = true;

                    tabs.classList.add(
                        'is-dragging'
                    );
                }

                if (!didDrag) {
                    return;
                }

                event.preventDefault();

                tabs.scrollLeft =
                    startScrollLeft -
                    movement;
            }
        );

        tabs.addEventListener(
            'pointerup',
            finishDrag
        );

        tabs.addEventListener(
            'pointercancel',
            finishDrag
        );

        return function () {
            return suppressClick;
        };
    }

    function initializeEditorialCalendar(
        items,
        rowConfig
    ) {
        var tabs = document.getElementById(
            rowConfig.tabsId
        );

        if (!tabs) {
            return;
        }

        var previousButton =
            document.getElementById(
                rowConfig.previousButtonId
            );

        var nextButton =
            document.getElementById(
                rowConfig.nextButtonId
            );

        var buttons = tabs.querySelectorAll(
            '[data-month]'
        );

        var currentMonth =
            new Date().getMonth();

        var shouldSuppressMonthClick =
            enableMonthTabsMouseDrag(tabs);

        function updateNavigationState() {
            var maximumScroll = Math.max(
                0,
                tabs.scrollWidth -
                tabs.clientWidth
            );

            if (previousButton) {
                previousButton.disabled =
                    tabs.scrollLeft <= 4;
            }

            if (nextButton) {
                nextButton.disabled =
                    tabs.scrollLeft >=
                    maximumScroll - 4;
            }
        }

        function scrollMonthTabs(direction) {
            var distance = Math.max(
                240,
                Math.round(
                    tabs.clientWidth * 0.7
                )
            );

            tabs.scrollBy({
                left: direction * distance,
                behavior: 'smooth'
            });

            window.setTimeout(
                updateNavigationState,
                400
            );
        }

        if (previousButton) {
            previousButton.addEventListener(
                'click',
                function () {
                    scrollMonthTabs(-1);
                }
            );
        }

        if (nextButton) {
            nextButton.addEventListener(
                'click',
                function () {
                    scrollMonthTabs(1);
                }
            );
        }

        tabs.addEventListener(
            'scroll',
            updateNavigationState
        );

        window.addEventListener(
            'resize',
            updateNavigationState
        );

        Array.prototype.forEach.call(
            buttons,
            function (button) {
                button.addEventListener(
                    'click',
                    function (event) {
                        if (
                            shouldSuppressMonthClick()
                        ) {
                            event.preventDefault();
                            return;
                        }

                        var monthIndex =
                            Number(
                                button.getAttribute(
                                    'data-month'
                                )
                            );

                        if (
                            !Number.isFinite(
                                monthIndex
                            )
                        ) {
                            return;
                        }

                        renderEditorialMonth(
                            items,
                            rowConfig,
                            monthIndex,
                            true
                        );
                    }
                );
            }
        );

        renderEditorialMonth(
            items,
            rowConfig,
            currentMonth,
            false
        );

        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(
                updateNavigationState
            );
        } else {
            window.setTimeout(
                updateNavigationState,
                0
            );
        }
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

        initializeEditorialCalendar(
            items,
            EDITORIAL_CALENDAR
        );
    }

    /* =========================================================
       INICIALIZACIÓN
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
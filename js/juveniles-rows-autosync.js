(function () {
    'use strict';

    var dataVersion = '20260917-1';
    var targetYear = 2026;

    var verticalItemClasses = [
        'item-a',
        'item-b',
        'item-c',
        'item-d',
        'item-e',
        'item-f',
        'item-g'
    ];

    var verticalPlaceholder =
        'images/verticals/placeholder-280x420.svg';

    function normalizeText(value) {
        var text = value == null ? '' : String(value);

        if (typeof text.normalize === 'function') {
            text = text.normalize('NFD');
        }

        return text
            .replace(/[\u0300-\u036f]/g, '')
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

    function parseDate(value) {
        if (!value) return null;

        var raw = String(value).trim();
        var parts;
        var day;
        var month;
        var year;

        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
            parts = raw.split('/');
            day = Number(parts[0]);
            month = Number(parts[1]);
            year = Number(parts[2]);
        } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
            parts = raw.split('-');
            year = Number(parts[0]);
            month = Number(parts[1]);
            day = Number(parts[2]);
        } else {
            return null;
        }

        var date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    function isSeries(item) {
        var type = normalizeText(item && item.type);

        return type !== 'pelicula' && type !== 'movie';
    }

    function isJuvenilOrInfantil(item) {
        var genre = normalizeText(
            item && (item.genre || item.subtitle)
        );

        return (
            genre.indexOf('juvenil') !== -1 ||
            genre.indexOf('infantil') !== -1
        );
    }

    function belongsToJuvenilesRow(item, rowKey) {
        if (
            !item ||
            !Array.isArray(item.juveniles_rows)
        ) {
            return false;
        }

        return item.juveniles_rows.some(function (value) {
            return normalizeText(value) === normalizeText(rowKey);
        });
    }

    function isStreamingProduction(item) {
        var text = normalizeText(
            getDistributionValues(item).join(' ')
        );

        return (
            text.indexOf('streaming') !== -1 ||
            text.indexOf('disney+') !== -1 ||
            text.indexOf('disney plus') !== -1 ||
            text.indexOf('netflix') !== -1 ||
            text.indexOf('prime video') !== -1 ||
            text.indexOf('hbo max') !== -1 ||
            text.indexOf('flow') !== -1 ||
            text.indexOf('paramount') !== -1 ||
            text.indexOf('star+') !== -1 ||
            text.indexOf('starzplay') !== -1 ||
            text.indexOf('viu') !== -1 ||
            text.indexOf('shorta') !== -1 ||
            text.indexOf('reelshort') !== -1
        );
    }

    function addReleaseCandidate(
        candidates,
        dateValue,
        horizontalImage,
        seasonPriority
    ) {
        var date = parseDate(dateValue);

        if (!date) return;

        candidates.push({
            date: date,
            timestamp: date.getTime(),
            horizontalImage: horizontalImage || '',
            seasonPriority: seasonPriority
        });
    }

    function getLatestRelease(item) {
        var candidates = [];

        addReleaseCandidate(
            candidates,
            item.release_date || item.fecha_estreno,
            item.horizontal_image,
            0
        );

        var seasons = [];

        if (Array.isArray(item.temporadas)) {
            seasons = seasons.concat(item.temporadas);
        }

        if (Array.isArray(item.seasons)) {
            seasons = seasons.concat(item.seasons);
        }

        seasons.forEach(function (season) {
            addReleaseCandidate(
                candidates,
                season.release_date || season.fecha_estreno,
                season.horizontal_image,
                1
            );
        });

        if (!candidates.length) return null;

        candidates.sort(function (a, b) {
            if (a.timestamp !== b.timestamp) {
                return b.timestamp - a.timestamp;
            }

            return b.seasonPriority - a.seasonPriority;
        });

        var latest = candidates[0];

        /*
         * Si la temporada más reciente no tiene imagen propia,
         * se utiliza la imagen horizontal principal.
         */
        latest.horizontalImage =
            latest.horizontalImage || item.horizontal_image || '';

        return latest;
    }

    function buildCard(entry) {
        var item = entry.item;
        var title =
            item.juveniles_row_title ||
            item.title ||
            'Sin título';
        return (
            '<li class="item-f">' +
            '<a href="show.html?id=' +
            encodeURIComponent(item.id || '') +
            '">' +
            '<div class="showcase-box">' +
            '<img src="' +
            escapeHtml(entry.horizontalImage) +
            '" loading="lazy" alt="' +
            escapeHtml(title) +
            '">' +
            '</div>' +
            '<div class="latest-b-text">' +
            '<strong>' +
            escapeHtml(title) +
            '</strong>' +
            '<p></p>' +
            '</div>' +
            '</a>' +
            '</li>'
        );
    }

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
            if (typeof $list.refresh === 'function') {
                $list.refresh();
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

    function renderLaunches2026(items) {
        var list = document.getElementById(
            'juveniles-launches-2026-list'
        );

        if (!list) return;

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var launches = items
            .filter(function (item) {
                return (
                    item &&
                    isSeries(item) &&
                    isJuvenilOrInfantil(item) &&
                    isStreamingProduction(item)
                );
            })
            .map(function (item) {
                var release = getLatestRelease(item);

                if (!release) return null;

                return {
                    item: item,
                    date: release.date,
                    timestamp: release.timestamp,
                    horizontalImage: release.horizontalImage
                };
            })
            .filter(function (entry) {
                return (
                    entry &&
                    entry.date.getFullYear() === targetYear &&
                    entry.date.getTime() <= today.getTime() &&
                    entry.horizontalImage
                );
            })
            .sort(function (a, b) {
                if (a.timestamp !== b.timestamp) {
                    return b.timestamp - a.timestamp;
                }

                return String(a.item.title || '').localeCompare(
                    String(b.item.title || ''),
                    'es',
                    { sensitivity: 'base' }
                );
            });

        list.innerHTML = launches
            .map(buildCard)
            .join('');

        initializeHorizontalSlider(list);
    }

    function renderCuratedHorizontalRow(
        items,
        containerId,
        rowKey
    ) {
        var list = document.getElementById(containerId);

        if (!list) return;

        var entries = items
            .filter(function (item) {
                return (
                    item &&
                    item.id &&
                    isSeries(item) &&
                    isJuvenilOrInfantil(item) &&
                    belongsToJuvenilesRow(item, rowKey)
                );
            })
            .map(function (item) {
                var release = getLatestRelease(item);

                if (!release) return null;

                return {
                    item: item,
                    timestamp: release.timestamp,
                    horizontalImage:
                        item.horizontal_image ||
                        release.horizontalImage
                };
            })
            .filter(function (entry) {
                return (
                    entry &&
                    entry.horizontalImage
                );
            })
            .sort(function (a, b) {
                if (a.timestamp !== b.timestamp) {
                    return b.timestamp - a.timestamp;
                }

                return String(a.item.title || '').localeCompare(
                    String(b.item.title || ''),
                    'es',
                    { sensitivity: 'base' }
                );
            });

        list.innerHTML = entries
            .map(buildCard)
            .join('');

        initializeHorizontalSlider(list);
    }

    function getDistributionValues(item) {
        var values = [];

        if (!item) return values;

        if (item.channel) {
            values.push(item.channel);
        }

        if (item.platform) {
            values.push(item.platform);
        }

        if (Array.isArray(item.channels)) {
            values = values.concat(item.channels);
        }

        if (Array.isArray(item.platforms)) {
            values = values.concat(item.platforms);
        }

        if (Array.isArray(item.air_channels)) {
            values = values.concat(item.air_channels);
        }

        if (Array.isArray(item.cable_channels)) {
            values = values.concat(item.cable_channels);
        }

        return values;
    }

    function hasAnyChannel(item, acceptedChannels) {
        var normalizedAccepted = acceptedChannels.map(
            normalizeText
        );

        return getDistributionValues(item).some(
            function (channel) {
                return normalizedAccepted.indexOf(
                    normalizeText(channel)
                ) !== -1;
            }
        );
    }

    function getPrimaryReleaseTimestamp(item) {
        var releaseDate = parseDate(
            item.release_date ||
            item.fecha_estreno
        );

        if (releaseDate) {
            return releaseDate.getTime();
        }

        var year = Number(item.year);

        if (Number.isFinite(year)) {
            return new Date(year, 0, 1).getTime();
        }

        return 0;
    }

    function buildVerticalCard(entry, index) {
        var item = entry.item;
        var title =
            item.juveniles_row_title ||
            item.title ||
            'Sin título';

        var image =
            entry.image ||
            item.juveniles_row_image ||
            item.image ||
            verticalPlaceholder;

        var metaText =
            entry.meta || '';
        var itemClass =
            verticalItemClasses[
            index % verticalItemClasses.length
            ];

        return (
            '<li class="' + itemClass + '">' +
            '<a href="show.html?id=' +
            encodeURIComponent(item.id || '') +
            '">' +
            '<div class="latest-box">' +
            '<div class="latest-b-img">' +
            '<img src="' +
            escapeHtml(image) +
            '" loading="lazy" alt="' +
            escapeHtml(title) +
            '">' +
            '</div>' +
            '<div class="latest-b-text">' +
            '<strong>' +
            escapeHtml(title) +
            '</strong>' +
            '<p>' +
            escapeHtml(metaText) +
            '</p>' +
            '</div>' +
            '</div>' +
            '</a>' +
            '</li>'
        );
    }

    // Navegación móvil para pilotos no emitidos.
    // Distingue un toque breve de un desplazamiento horizontal.
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
            return;
        }

        var $list = window.jQuery(list);

        if ($list.hasClass('lightSlider')) {
            return;
        }

        $list.lightSlider({
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
                        item: 4,
                        slideMove: 1,
                        slideMargin: 18
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        item: 2,
                        slideMove: 1,
                        slideMargin: 18
                    }
                }
            ],

            onSliderLoad: function () {
                $list.removeClass('cs-hidden');
            }
        });
    }

    function renderCuratedVerticalRow(
        items,
        containerId,
        rowKey
    ) {
        var list = document.getElementById(containerId);

        if (!list) return;

        var entries = items
            .filter(function (item) {
                return (
                    item &&
                    item.id &&
                    isSeries(item) &&
                    belongsToJuvenilesRow(item, rowKey)
                );
            })
            .map(function (item) {
                return {
                    item: item,
                    timestamp:
                        getPrimaryReleaseTimestamp(item)
                };
            })
            .sort(function (a, b) {
                if (a.timestamp !== b.timestamp) {
                    return b.timestamp - a.timestamp;
                }

                return String(a.item.title || '')
                    .localeCompare(
                        String(b.item.title || ''),
                        'es',
                        { sensitivity: 'base' }
                    );
            });

        list.innerHTML = entries
            .map(buildVerticalCard)
            .join('');

        if (containerId === 'juveniles-no-emitidos-list') {
            enableUnairedPilotNavigation(list);
        }

        initializeVerticalSlider(list);
    }

    function renderCableBroadcastsRow(items) {
        var list = document.getElementById(
            'juveniles-cable-broadcasts-list'
        );

        if (!list) return;

        var entries = [];

        items.forEach(function (item) {
            if (
                !item ||
                !item.id ||
                !isSeries(item) ||
                !isJuvenilOrInfantil(item) ||
                !Array.isArray(item.cable_broadcasts)
            ) {
                return;
            }

            item.cable_broadcasts.forEach(
                function (broadcast) {
                    if (
                        !broadcast ||
                        !broadcast.channel
                    ) {
                        return;
                    }

                    entries.push({
                        item: item,

                        image:
                            broadcast.image ||
                            item.juveniles_row_image ||
                            item.image ||
                            verticalPlaceholder,

                        meta:
                            String(
                                broadcast.channel
                            ).trim(),

                        timestamp:
                            getPrimaryReleaseTimestamp(item)
                    });
                }
            );
        });

        entries.sort(function (a, b) {
            if (a.timestamp !== b.timestamp) {
                return b.timestamp - a.timestamp;
            }

            return String(a.item.title || '')
                .localeCompare(
                    String(b.item.title || ''),
                    'es',
                    { sensitivity: 'base' }
                );
        });

        list.innerHTML = entries
            .map(buildVerticalCard)
            .join('');

        initializeVerticalSlider(list);
    }

    function belongsToPreviousEditorialRow(item) {
        var previousVerticalRows = [
            'cris-morena',
            'pol-ka',
            'webseries'
        ];

        var previousHorizontalRows = [
            'hits-2010',
            'hits-2000'
        ];

        var belongsToVerticalRow =
            previousVerticalRows.some(function (rowKey) {
                return belongsToJuvenilesRow(item, rowKey);
            });

        var belongsToRenderedHorizontalRow =
            previousHorizontalRows.some(function (rowKey) {
                if (!belongsToJuvenilesRow(item, rowKey)) {
                    return false;
                }

                var release = getLatestRelease(item);

                return Boolean(
                    release &&
                    (
                        item.horizontal_image ||
                        release.horizontalImage
                    )
                );
            });

        return (
            belongsToVerticalRow ||
            belongsToRenderedHorizontalRow
        );
    }

    function wasShownBeforeResidualRows(item) {
        return (
            isStreamingProduction(item) ||
            hasAnyChannel(
                item,
                [
                    'Disney Channel',
                    'Disney XD',
                    'Nickelodeon'
                ]
            ) ||
            belongsToPreviousEditorialRow(item)
        );
    }

    function matchesResidualGenre(item, genreKey) {
        var genre = normalizeText(
            item && (item.genre || item.subtitle)
        );

        /*
         * Si una producción estuviera clasificada simultáneamente
         * como juvenil e infantil, se prioriza la fila Infantil
         * para evitar duplicados.
         */
        if (genreKey === 'infantil') {
            return genre.indexOf('infantil') !== -1;
        }

        return (
            genre.indexOf('juvenil') !== -1 &&
            genre.indexOf('infantil') === -1
        );
    }

    function renderResidualPeriodRow(
        items,
        containerId,
        genreKey
    ) {
        var list = document.getElementById(containerId);

        if (!list) return;

        var entries = items
            .filter(function (item) {
                var year = Number(item && item.year);

                return (
                    item &&
                    item.id &&
                    isSeries(item) &&
                    Number.isFinite(year) &&
                    year >= 2000 &&
                    year <= 2019 &&
                    matchesResidualGenre(item, genreKey) &&
                    !belongsToJuvenilesRow(item, 'no-emitidos') &&
                    normalizeText(item.production_status) !== 'no-emitidos' &&
                    !wasShownBeforeResidualRows(item)

                );
            })
            .map(function (item) {
                return {
                    item: item,
                    timestamp:
                        getPrimaryReleaseTimestamp(item)
                };
            })
            .sort(function (a, b) {
                if (a.timestamp !== b.timestamp) {
                    return b.timestamp - a.timestamp;
                }

                return String(a.item.title || '')
                    .localeCompare(
                        String(b.item.title || ''),
                        'es',
                        { sensitivity: 'base' }
                    );
            });

        list.innerHTML = entries
            .map(buildVerticalCard)
            .join('');

        initializeVerticalSlider(list);
    }

    function renderChannelVerticalRow(items, options) {
        var list = document.getElementById(
            options.containerId
        );

        if (!list) return;

        var entries = items
            .filter(function (item) {
                return (
                    item &&
                    item.id &&
                    isSeries(item) &&
                    isJuvenilOrInfantil(item) &&
                    hasAnyChannel(
                        item,
                        options.channels
                    )
                );
            })
            .map(function (item) {
                return {
                    item: item,
                    timestamp:
                        getPrimaryReleaseTimestamp(item)
                };
            })
            .sort(function (a, b) {
                if (a.timestamp !== b.timestamp) {
                    return b.timestamp - a.timestamp;
                }

                return String(a.item.title || '')
                    .localeCompare(
                        String(b.item.title || ''),
                        'es',
                        { sensitivity: 'base' }
                    );
            });

        list.innerHTML = entries
            .map(buildVerticalCard)
            .join('');

        initializeVerticalSlider(list);
    }

    function renderJuvenilesPremiereCalendar(items) {
        var section = document.getElementById('juveniles-premieres');
        if (!section) return;
        var months = document.getElementById('juveniles-premieres-months');
        var yearTabs = document.getElementById('juveniles-premieres-years');
        var list = document.getElementById('juveniles-premieres-list');
        var count = document.getElementById('juveniles-premieres-count');
        var empty = document.getElementById('juveniles-premieres-empty');
        var previous = document.getElementById('juveniles-premieres-months-previous');
        var next = document.getElementById('juveniles-premieres-months-next');
        if (!months || !yearTabs || !list) return;


        var yearsPrevious = document.getElementById(
            'juveniles-premieres-years-previous'
        );
        var yearsNext = document.getElementById(
            'juveniles-premieres-years-next'
        );


        var currentYear = new Date().getFullYear();
        var today = new Date();
        today.setHours(23, 59, 59, 999);
        var sliderInstance = null;

        // Incorporar la opción general sin cambiar la navegación de meses.
        var allButton = months.querySelector('[data-month="all"]');
        if (!allButton) {
            allButton = document.createElement('button');
            allButton.type = 'button';
            allButton.className = 'juveniles-calendar-month';
            allButton.setAttribute('data-month', 'all');
            allButton.textContent = 'Todos los meses';
            months.insertBefore(allButton, months.firstChild);
        }

        var entries = items.filter(function (item) {
            return item && item.id && item.title &&
                isSeries(item) &&
                (isJuvenilOrInfantil(item) ||
                    (Array.isArray(item.juveniles_rows) && item.juveniles_rows.length > 0)) &&
                !belongsToJuvenilesRow(item, 'no-emitidos') &&
                normalizeText(item.production_status) !== 'no-emitidos';
        }).map(function (item) {
            var date = parseDate(
                item.release_date ||
                item.fecha_estreno ||
                item.premiere_date
            );
            return date && date.getFullYear() >= 2000 &&
                date.getFullYear() <= currentYear && date <= today
                ? { item: item, date: date }
                : null;
        }).filter(Boolean).sort(function (a, b) {
            return b.date - a.date || String(a.item.title).localeCompare(String(b.item.title), 'es');
        });


        var years = Array.from({ length: currentYear - 1999 }, function (_, i) {
            return currentYear - i;
        });

        var selectedMonth = 'all';
        var selectedYear = 'all';

        yearTabs.innerHTML = '';

        ['all'].concat(years).forEach(function (year) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'juveniles-calendar-year-tab';
            button.setAttribute('data-year', String(year));
            button.setAttribute('aria-pressed', String(year === 'all'));
            button.textContent = year === 'all' ? 'Todos' : String(year);
            yearTabs.appendChild(button);
        });

        var selectedMonth = 'all';

        function updateArrows() {
            var maximum = Math.max(0, months.scrollWidth - months.clientWidth);
            if (previous) previous.disabled = months.scrollLeft <= 4;
            if (next) next.disabled = months.scrollLeft >= maximum - 4;
        }


        function updateYearArrows() {
            var maximum = Math.max(
                0,
                yearTabs.scrollWidth - yearTabs.clientWidth
            );
            if (yearsPrevious) {
                yearsPrevious.disabled = yearTabs.scrollLeft <= 4;
            }

            if (yearsNext) {
                yearsNext.disabled =
                    yearTabs.scrollLeft >= maximum - 4;
            }
        }

        function enableHorizontalDrag(container) {
            if (!container || !window.PointerEvent) return;
            var pointerId = null;
            var startX = 0;
            var startScrollLeft = 0;
            var moved = false;

            container.addEventListener('pointerdown', function (event) {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                pointerId = event.pointerId;
                startX = event.clientX;
                startScrollLeft = container.scrollLeft;
                moved = false;
                container.classList.add('is-dragging');
            });

            container.addEventListener('pointermove', function (event) {
                if (event.pointerId !== pointerId) return;
                var distance = event.clientX - startX;
                if (Math.abs(distance) > 3) moved = true;
                container.scrollLeft = startScrollLeft - distance;
            });

            function finishDrag(event) {
                if (event.pointerId !== pointerId) return;
                container.classList.remove('is-dragging');
                if (!moved) {
                    var button = event.target.closest(
                        'button[data-month], button[data-year]'
                    );
                    if (button && container.contains(button)) {
                        moved = true;
                        button.click();
                    }
                }
                pointerId = null;
            }

            container.addEventListener('pointerup', finishDrag);
            container.addEventListener('pointercancel', finishDrag);
            container.addEventListener('click', function (event) {
                if (!moved) return;
                event.preventDefault();
                event.stopPropagation();
                moved = false;
            }, true);
        }


        function update(animate) {
            var year = selectedYear;
            var filtered = entries.filter(function (entry) {
                return (selectedMonth === 'all' || entry.date.getMonth() === Number(selectedMonth)) &&
                    (year === 'all' || entry.date.getFullYear() === Number(year));
            });
            // Destruir la instancia real antes de reemplazar el contenido.
            if (sliderInstance && typeof sliderInstance.destroy === 'function') {
                sliderInstance.destroy();
                sliderInstance = null;
            }
            list.innerHTML = filtered.map(function (entry, index) {
                var date = entry.date;
                var formatted = String(date.getDate()).padStart(2, '0') + '/' +
                    String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
                return buildVerticalCard({ item: entry.item, meta: formatted }, index);
            }).join('');
            count.textContent = filtered.length === 1 ? '1 estreno' : filtered.length + ' estrenos';
            empty.hidden = filtered.length > 0;
            list.hidden = filtered.length === 0;
            if (filtered.length) {
                list.classList.remove('cs-hidden');
                if (
                    window.innerWidth <= 768
                ) {
                    list.classList.remove('lightSlider', 'lSSlide');
                } else if (window.jQuery && window.jQuery.fn && window.jQuery.fn.lightSlider) {
                    sliderInstance = window.jQuery(list).lightSlider({
                        item: 5, autoWidth: false, slideMove: 1, slideMargin: 16,
                        loop: false, pager: false, controls: true,
                        enableTouch: true, enableDrag: true, freeMove: false,
                        responsive: [
                            { breakpoint: 1100, settings: { item: 4, slideMargin: 14 } },
                            { breakpoint: 768, settings: { item: 2, slideMargin: 12 } }
                        ]
                    });
                }
            }

            months.querySelectorAll('[data-month]').forEach(function (button) {
                var active = button.getAttribute('data-month') === String(selectedMonth);
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-selected', String(active));
                button.tabIndex = active ? 0 : -1;
                if (active) {
                    button.scrollIntoView({
                        behavior: animate ? 'smooth' : 'auto',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            });

            yearTabs.querySelectorAll('[data-year]').forEach(function (button) {
                var active = button.getAttribute('data-year') === selectedYear;

                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
                if (active) {
                    var left = button.offsetLeft - (yearTabs.clientWidth - button.offsetWidth) / 2;
                    yearTabs.scrollTo({
                        left: Math.max(0, left),
                        behavior: animate ? 'smooth' : 'auto'
                    });
                }
            });

            updateArrows();
            requestAnimationFrame(updateYearArrows);
        }
        months.addEventListener('click', function (event) {
            var button = event.target.closest('button[data-month]');
            if (!button) return;
            selectedMonth = button.getAttribute('data-month');
            update(true);
        });

        yearTabs.addEventListener('click', function (event) {
            var button = event.target.closest('button[data-year]');
            if (!button || !yearTabs.contains(button)) return;

            selectedYear = button.getAttribute('data-year');

            update(true);

            button.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        });

        months.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        window.addEventListener('resize', function () {
            window.clearTimeout(window._juvenilesCalendarResizeTimer);
            window._juvenilesCalendarResizeTimer = window.setTimeout(function () {
                update(false);
            }, 150);
        });
        if (previous) previous.addEventListener('click', function () {
            months.scrollBy({
                left: -Math.max(240, months.clientWidth * 0.7),
                behavior: 'smooth'
            });
        });
        if (next) next.addEventListener('click', function () {
            months.scrollBy({
                left: Math.max(240, months.clientWidth * 0.7),
                behavior: 'smooth'
            });
        });

        yearTabs.addEventListener('scroll', updateYearArrows);
        window.addEventListener('resize', updateYearArrows);

        if (yearsPrevious) {
            yearsPrevious.addEventListener('click', function () {
                yearTabs.scrollBy({
                    left: -Math.max(240, yearTabs.clientWidth * 0.7),
                    behavior: 'smooth'
                });
            });
        }

        if (yearsNext) {
            yearsNext.addEventListener('click', function () {
                yearTabs.scrollBy({
                    left: Math.max(240, yearTabs.clientWidth * 0.7),
                    behavior: 'smooth'
                });
            });
        }

        requestAnimationFrame(updateYearArrows);


        update(false);
        requestAnimationFrame(updateArrows);
    }

    function loadJuvenilesRows() {
        fetch(
            'data.json?v=' + dataVersion,
            { cache: 'no-store' }
        )
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('No se pudo cargar data.json');
                }

                return response.json();
            })
            .then(function (data) {
                var items =
                    data && Array.isArray(data.items)
                        ? data.items
                        : [];

                renderJuvenilesPremiereCalendar(items);
                renderLaunches2026(items);

                renderCuratedHorizontalRow(
                    items,
                    'juveniles-hits-2010-list',
                    'hits-2010'
                );

                renderCuratedHorizontalRow(
                    items,
                    'juveniles-hits-2000-list',
                    'hits-2000'
                );

                renderCableBroadcastsRow(items);


                renderCuratedVerticalRow(
                    items,
                    'juveniles-no-emitidos-list',
                    'no-emitidos'
                );


                renderCuratedVerticalRow(
                    items,
                    'juveniles-cris-morena-list',
                    'cris-morena'
                );

                renderCuratedVerticalRow(
                    items,
                    'juveniles-polka-list',
                    'pol-ka'
                );

                renderCuratedVerticalRow(
                    items,
                    'juveniles-webseries-list',
                    'webseries'
                );

                renderResidualPeriodRow(
                    items,
                    'juveniles-2000-2019-list',
                    'juvenil'
                );

                renderResidualPeriodRow(
                    items,
                    'infantiles-2000-2019-list',
                    'infantil'
                );

                renderChannelVerticalRow(
                    items,
                    {
                        containerId:
                            'juveniles-disney-channel-list',

                        channels: [
                            'Disney Channel',
                            'Disney XD'
                        ]
                    }
                );

                renderChannelVerticalRow(
                    items,
                    {
                        containerId:
                            'juveniles-nickelodeon-list',

                        channels: [
                            'Nickelodeon'
                        ]
                    }
                );
            })
            .catch(function (error) {
                console.error(
                    'No se pudieron cargar las filas juveniles:',
                    error
                );
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            loadJuvenilesRows
        );
    } else {
        loadJuvenilesRows();
    }
})();
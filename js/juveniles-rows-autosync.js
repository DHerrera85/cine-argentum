(function () {
    'use strict';

    var dataVersion = '20260903-5';
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
        var values = [];

        if (item.channel) values.push(item.channel);
        if (item.platform) values.push(item.platform);

        if (Array.isArray(item.platforms)) {
            values = values.concat(item.platforms);
        }

        var text = normalizeText(values.join(' '));

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

        if (Array.isArray(item.channels)) {
            values = values.concat(item.channels);
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
            item.juveniles_row_image ||
            item.image ||
            verticalPlaceholder;
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
            '<p></p>' +
            '</div>' +
            '</div>' +
            '</a>' +
            '</li>'
        );
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
                        slideMargin: 10
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        item: 2,
                        slideMove: 1,
                        slideMargin: 8
                    }
                }
            ],

            onSliderLoad: function () {
                $list.removeClass('cs-hidden');
            }
        });
    }
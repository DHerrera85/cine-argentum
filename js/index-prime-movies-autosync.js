(function () {
    'use strict';

    var dataVersion = '20260825-1';
    var placeholderImage =
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

    function parseReleaseDate(value) {
        if (!value) return null;

        var parts = String(value).trim().split('/');

        if (parts.length !== 3) return null;

        var day = Number(parts[0]);
        var month = Number(parts[1]);
        var year = Number(parts[2]);

        if (!day || !month || !year) return null;

        var date = new Date(year, month - 1, day);

        if (Number.isNaN(date.getTime())) return null;

        date.setHours(0, 0, 0, 0);

        return date;
    }

    function isMovie(item) {
        var type = normalizeText(item && item.type);
        var id = normalizeText(item && item.id);

        return (
            type === 'pelicula' ||
            type === 'movie' ||
            id.indexOf('p') === 0
        );
    }

    function isPrimeVideoMovie(item) {
        if (!item || !isMovie(item)) return false;

        var values = [];

        if (item.channel) values.push(item.channel);
        if (item.platform) values.push(item.platform);
        if (item.producer) values.push(item.producer);
        if (item.productora) values.push(item.productora);

        if (Array.isArray(item.platforms)) {
            values = values.concat(item.platforms);
        }

        var text = normalizeText(values.join(' '));

        return (
            text.indexOf('prime video') !== -1 ||
            text.indexOf('amazon studios') !== -1 ||
            text.indexOf('amazon mgm studios') !== -1 ||
            text.indexOf('infinity hill amazon') !== -1
        );
    }

    function isUpcoming(date) {
        if (!date) return false;

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        return date.getTime() > today.getTime();
    }

    function sortMovies(a, b) {
        /*
         * Próximamente primero.
         */
        if (a.upcoming !== b.upcoming) {
            return a.upcoming ? -1 : 1;
        }

        /*
         * Entre próximos estrenos:
         * el más cercano aparece primero.
         */
        if (a.upcoming && b.upcoming) {
            return a.releaseTs - b.releaseTs;
        }

        /*
         * Entre películas ya estrenadas:
         * de la más reciente a la más antigua.
         */
        if (a.releaseTs !== b.releaseTs) {
            return b.releaseTs - a.releaseTs;
        }

        return String(a.item.title || '').localeCompare(
            String(b.item.title || ''),
            'es',
            { sensitivity: 'base' }
        );
    }

    function buildCard(entry) {
        var item = entry.item;
        var title = item.title || 'Sin título';
        var image =
            item.image && String(item.image).trim()
                ? item.image
                : placeholderImage;

        var badge = entry.upcoming
            ? '<span class="cartelera-status cartelera-status-upcoming">' +
            'PRÓXIMAMENTE' +
            '</span>'
            : '';

        return (
            '<li class="item-ap">' +
            '<a href="show.html?id=' +
            encodeURIComponent(item.id || '') +
            '">' +
            '<div class="latest-box">' +
            '<div class="latest-b-img">' +
            badge +
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
            escapeHtml(item.release_date || item.year || '') +
            '</p>' +
            '</div>' +
            '</div>' +
            '</a>' +
            '</li>'
        );
    }

    function initializeSlider(list) {
        list.classList.remove('cs-hidden');

        if (
            !window.jQuery ||
            !window.jQuery.fn ||
            !window.jQuery.fn.lightSlider
        ) {
            return;
        }

        var $list = window.jQuery(list);
        var instance = $list.data('lightSlider');

        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }

        $list.lightSlider({
            item: 5,
            autoWidth: false,
            slideMove: 1,
            slideMargin: 16,
            loop: false,
            pager: false,
            controls: true,
            enableTouch: true,
            enableDrag: true,
            freeMove: false,

            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        item: 4,
                        slideMove: 1,
                        slideMargin: 14
                    }
                },
                {
                    breakpoint: 860,
                    settings: {
                        item: 3,
                        slideMove: 1,
                        slideMargin: 12
                    }
                },
                {
                    breakpoint: 640,
                    settings: {
                        item: 2,
                        slideMove: 1,
                        slideMargin: 10
                    }
                }
            ]
        });
    }

    function renderPrimeMovies(items) {
        var list = document.getElementById(
            'indexPrimeMoviesList'
        );

        if (!list) return;

        var movies = items
            .filter(isPrimeVideoMovie)
            .map(function (item) {
                var releaseDate = parseReleaseDate(
                    item.release_date
                );

                return {
                    item: item,
                    releaseDate: releaseDate,
                    releaseTs: releaseDate
                        ? releaseDate.getTime()
                        : 0,
                    upcoming: isUpcoming(releaseDate)
                };
            })
            .sort(sortMovies);

        list.innerHTML = movies.length
            ? movies.map(buildCard).join('')
            : (
                '<li class="item-ap">' +
                '<div class="latest-box">' +
                '<div class="latest-b-text">' +
                '<strong>Sin resultados</strong>' +
                '</div>' +
                '</div>' +
                '</li>'
            );

        window.setTimeout(function () {
            initializeSlider(list);
        }, 150);
    }

    function loadPrimeMovies() {
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

                renderPrimeMovies(items);
            })
            .catch(function (error) {
                console.error(
                    'No se pudieron cargar las películas de Prime Video:',
                    error
                );
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            loadPrimeMovies
        );
    } else {
        loadPrimeMovies();
    }
})();
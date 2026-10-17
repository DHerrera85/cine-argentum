
(function () {
    'use strict';

    var section = document.getElementById('tv90s-historical-premieres');
    var tabs = document.getElementById('tv90s-historical-month-tabs');
    var list = document.getElementById('tv90s-historical-premieres-list');
    var count = document.getElementById('tv90s-historical-premieres-count');
    var empty = document.getElementById('tv90s-historical-premieres-empty');
    var previous = document.getElementById('tv90s-months-previous');
    var next = document.getElementById('tv90s-months-next');

    if (!section || !tabs || !list) return;

    var MONTHS = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    var slider = null;
    var items = [];

    function normalize(value) {
        return String(value == null ? '' : value)
            .normalize('NFD')
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

        var text = String(value).trim();
        var match;
        var day, month, year;

        if ((match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) {
            day = Number(match[1]);
            month = Number(match[2]);
            year = Number(match[3]);
        } else if ((match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) {
            year = Number(match[1]);
            month = Number(match[2]);
            day = Number(match[3]);
        } else {
            return null;
        }

        var date = new Date(year, month - 1, day);

        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day ? date : null;
    }

    function releaseDate(item) {
        return parseDate(
            item.fecha_estreno ||
            item.release_date ||
            item.premiere_date
        );
    }

    function formatLabel(item) {
        var type = normalize(item.tipo_emision);

        if (type === 'tira diaria') return 'TIRA';
        if (
            type === 'semanal' ||
            type === 'serie semanal' ||
            type === 'fines de semana'
        ) return 'SEMANAL';
        if (type === 'webserie') return 'WEBSERIE';

        return '';
    }

    function isCandidate(item) {
        if (!item || !item.id || !item.image) return false;

        var date = releaseDate(item);
        if (!date || date.getFullYear() < 1990 || date.getFullYear() > 1999) {
            return false;
        }

        if (normalize(item.production_status) === 'no-emitidos') return false;

        var type = normalize(item.type);
        if (type === 'pelicula' || type === 'movie') return false;

        if (!formatLabel(item)) return false;

        return Boolean(
            item.channel ||
            item.platform ||
            (Array.isArray(item.air_channels) && item.air_channels.length)
        );
    }

    function buildCard(item) {
        var date = releaseDate(item);
        var formattedDate = String(date.getDate()).padStart(2, '0') + '/' +
            String(date.getMonth() + 1).padStart(2, '0') + '/' +
            date.getFullYear();

        return '<li class="item-f">' +
            '<a href="show.html?id=' + encodeURIComponent(item.id) + '">' +
            '<div class="latest-box">' +
            '<div class="latest-b-img tiras-2000-premiere-image">' +
            '<img src="' + escapeHtml(item.image) + '" loading="lazy" alt="' +
            escapeHtml(item.title) + '">' +
            '</div>' +
            '<div class="latest-b-text">' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<span class="tv90s-premiere-label tv90s-premiere-label--' +
            escapeHtml(formatLabel(item).toLowerCase()) + '">' +
            escapeHtml(formatLabel(item)) +
            '</span>' +
            '<span class="tiras-2000-premiere-date">' +
            formattedDate + '</span>' +
            '<p></p>' +
            '</div></div></a></li>';
    }

    function renderMonth(month, animate) {
        var selected = items.filter(function (item) {
            return releaseDate(item).getMonth() === month;
        }).sort(function (a, b) {
            return releaseDate(b) - releaseDate(a);
        });

        if (slider && typeof slider.destroy === 'function') {
            slider.destroy();
            slider = null;
        }

        list.innerHTML = selected.map(buildCard).join('');
        list.setAttribute('aria-label', 'Estrenos de ' + MONTHS[month]);

        count.textContent = selected.length + ' ficciones';
        count.hidden = false;

        empty.hidden = selected.length !== 0;
        list.hidden = selected.length === 0;
        section.hidden = false;

        tabs.querySelectorAll('[data-month]').forEach(function (button) {
            var active = Number(button.dataset.month) === month;

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

        if (selected.length && window.jQuery && window.jQuery.fn.lightSlider) {
            list.classList.remove('cs-hidden');

            slider = window.jQuery(list).lightSlider({
                item: 5,
                slideMove: 1,
                slideMargin: 18,
                loop: false,
                pager: false,
                controls: true,
                enableTouch: true,
                enableDrag: true,
                responsive: [
                    { breakpoint: 1100, settings: { item: 4, slideMove: 1 } },
                    { breakpoint: 768, settings: { item: 2, slideMove: 1 } }
                ]
            });
        }
    }

    function updateArrows() {
        var maximum = Math.max(0, tabs.scrollWidth - tabs.clientWidth);

        if (previous) previous.disabled = tabs.scrollLeft <= 4;
        if (next) next.disabled = tabs.scrollLeft >= maximum - 4;
    }

    function moveTabs(direction) {
        tabs.scrollBy({
            left: direction * Math.max(240, tabs.clientWidth * 0.7),
            behavior: 'smooth'
        });
    }

    if (previous) {
        previous.addEventListener('click', function () {
            moveTabs(-1);
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            moveTabs(1);
        });
    }

    tabs.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    tabs.querySelectorAll('[data-month]').forEach(function (button) {
        button.addEventListener('click', function () {
            renderMonth(Number(button.dataset.month), true);
            updateArrows();
        });
    });

    fetch('data.json?v=20261017-tv90s-premieres', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) throw new Error('No se pudo cargar data.json');
            return response.json();
        })
        .then(function (data) {
            var catalogue = Array.isArray(data) ? data : data.items;

            if (!Array.isArray(catalogue)) {
                throw new Error('Formato de catálogo inválido');
            }

            items = catalogue.filter(isCandidate);

            renderMonth(new Date().getMonth(), false);
            requestAnimationFrame(updateArrows);
        })
        .catch(function (error) {
            console.error('Calendario TV 90s:', error);
        });
})();

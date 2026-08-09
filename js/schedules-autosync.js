(function () {
    'use strict';

    var SCHEDULES_URL = 'schedules.json';
    var DATA_URL = 'data.json';

    var SELECTORS = {
        period: '#schedule-period',
        channel: '#schedule-channel',
        content: '#schedule-content'
    };

    var schedulesData = [];
    var productionsData = [];


    function getElement(selector) {
        return document.querySelector(selector);
    }


    function getSelectedPeriodId() {
        var select = getElement(SELECTORS.period);

        if (!select) {
            return '';
        }

        return select.value;
    }


    function getSelectedChannel() {
        var select = getElement(SELECTORS.channel);

        if (!select) {
            return '';
        }

        return select.value;
    }


    function findScheduleById(scheduleId) {
        return schedulesData.find(function (schedule) {
            return schedule.id === scheduleId;
        });
    }


    function findChannelSchedule(schedule, channelName) {
        if (
            !schedule ||
            !Array.isArray(schedule.channels)
        ) {
            return null;
        }

        return schedule.channels.find(function (channel) {
            return channel.channel === channelName;
        });
    }


    function getProductionById(
        productionId
    ) {

        return productionsData.find(
            function (production) {
                return production.id === productionId;
            }
        );
    }


    function getEntryTitle(
        entry
    ) {

        if (
            entry.type === 'production' &&
            entry.production_id
        ) {

            var production =
                getProductionById(
                    entry.production_id
                );

            if (production) {
                return production.title;
            }

        }

        return entry.title || 'Sin título';
    }


    function getEntryImage(
        entry
    ) {

        if (
            entry.type !== 'production' ||
            !entry.production_id
        ) {
            return '';
        }

        var production =
            getProductionById(
                entry.production_id
            );

        if (!production) {
            return '';
        }

        if (
            production.tipo_emision ===
            'Tira Diaria'
        ) {

            return (
                production.horizontal_image ||
                production.image ||
                ''
            );
        }

        return (
            production.image ||
            production.horizontal_image ||
            ''
        );
    }

    function timeToMinutes(time) {
        if (!time || typeof time !== 'string') {
            return null;
        }

        var parts = time.split(':');

        if (parts.length !== 2) {
            return null;
        }

        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes)
        ) {
            return null;
        }

        return (hours * 60) + minutes;
    }


    function getScheduleBounds(entries) {
        var starts = [];
        var ends = [];

        entries.forEach(function (entry) {
            var start =
                timeToMinutes(entry.start);

            var end =
                timeToMinutes(entry.end);

            if (start !== null) {
                starts.push(start);
            }

            if (end !== null) {
                ends.push(end);
            } else if (start !== null) {
                ends.push(start + 30);
            }
        });

        if (
            starts.length === 0 ||
            ends.length === 0
        ) {
            return null;
        }

        var minStart =
            Math.min.apply(null, starts);

        var maxEnd =
            Math.max.apply(null, ends);

        return {
            start: minStart,
            end: maxEnd + 30
        };
    }


    function minutesToTime(minutes) {
        var hours =
            Math.floor(minutes / 60);

        var mins =
            minutes % 60;

        return (
            String(hours).padStart(2, '0') +
            ':' +
            String(mins).padStart(2, '0')
        );
    }


    function getEntryRowSpan(entry) {
        var start =
            timeToMinutes(entry.start);

        var end =
            timeToMinutes(entry.end);

        if (start === null) {
            return 1;
        }

        if (end === null) {
            return 1;
        }

        var duration =
            end - start;

        if (duration <= 0) {
            return 1;
        }

        return Math.max(
            1,
            Math.round(duration / 30)
        );
    }

    function renderChannelSchedule(
        schedule,
        channelSchedule
    ) {

        var content =
            getElement(
                SELECTORS.content
            );

        if (!content) {
            return;
        }

        var days = [
            'lunes',
            'martes',
            'miércoles',
            'jueves',
            'viernes'
        ];

        var bounds =
            getScheduleBounds(
                channelSchedule.entries
            );

        if (!bounds) {

            content.innerHTML =
                '<div class="schedule-placeholder">' +
                'No hay horarios disponibles.' +
                '</div>';

            return;
        }

        var slotMinutes = 30;

        var rowCount =
            Math.ceil(
                (bounds.end - bounds.start) /
                slotMinutes
            );

        var html =
            '<section class="schedule-channel-view">' +

            '<header class="schedule-channel-header">' +

            '<h2>' +
            schedule.label +
            ' — ' +
            channelSchedule.channel +
            '</h2>' +

            '</header>' +

            '<div class="schedule-grid schedule-grid-timeline" ' +
            'style="grid-template-rows: auto repeat(' +
            rowCount +
            ', 74px);">' +

            '<div class="schedule-grid-corner" ' +
            'style="grid-column: 1; grid-row: 1;">' +
            'Hora' +
            '</div>';

        /*
         * Encabezados de días
         */
        days.forEach(
            function (day, dayIndex) {

                html +=
                    '<div class="schedule-grid-day" ' +
                    'style="grid-column: ' +
                    (dayIndex + 2) +
                    '; grid-row: 1;">' +

                    day.charAt(0).toUpperCase() +
                    day.slice(1) +

                    '</div>';

            }
        );


        /*
         * Horarios
         */
        for (
            var rowIndex = 0;
            rowIndex < rowCount;
            rowIndex++
        ) {

            var currentMinutes =
                bounds.start +
                (rowIndex * slotMinutes);

            var gridRow =
                rowIndex + 2;

            html +=
                '<div class="schedule-grid-time" ' +
                'style="grid-column: 1; grid-row: ' +
                gridRow +
                ';">' +

                minutesToTime(
                    currentMinutes
                ) +

                '</div>';
        }


        /*
         * Programas
         */
        channelSchedule.entries.forEach(
            function (entry) {

                var startMinutes =
                    timeToMinutes(
                        entry.start
                    );

                if (startMinutes === null) {
                    return;
                }

                var startRow =
                    Math.floor(
                        (
                            startMinutes -
                            bounds.start
                        ) /
                        slotMinutes
                    ) + 2;

                var rowSpan =
                    getEntryRowSpan(
                        entry
                    );

                if (
                    !Array.isArray(entry.days)
                ) {
                    return;
                }

                entry.days.forEach(
                    function (day) {

                        var dayIndex =
                            days.indexOf(day);

                        if (dayIndex === -1) {
                            return;
                        }

                        var gridColumn =
                            dayIndex + 2;

                        var title =
                            getEntryTitle(
                                entry
                            );

                        html +=
                            '<div class="schedule-grid-cell schedule-grid-program" ' +

                            'style="' +
                            'grid-column: ' +
                            gridColumn +
                            '; ' +

                            'grid-row: ' +
                            startRow +
                            ' / span ' +
                            rowSpan +
                            ';' +
                            '">' +

                            '<strong>' +
                            title +
                            '</strong>' +

                            '<span class="schedule-grid-program-time">' +
                            entry.start +
                            (
                                entry.end
                                    ? '–' +
                                    entry.end
                                    : ''
                            ) +
                            '</span>' +

                            '</div>';

                    }
                );

            }
        );


        html +=
            '</div>' +
            '</section>';

        content.innerHTML =
            html;
    }


    function renderCurrentView() {

        var content =
            getElement(
                SELECTORS.content
            );

        if (!content) {
            return;
        }

        var scheduleId =
            getSelectedPeriodId();

        var channelName =
            getSelectedChannel();

        var schedule =
            findScheduleById(
                scheduleId
            );

        var channelSchedule =
            findChannelSchedule(
                schedule,
                channelName
            );

        if (!schedule) {

            content.innerHTML =
                '<div class="schedule-placeholder">' +
                'No se encontró el período seleccionado.' +
                '</div>';

            return;

        }

        if (!channelSchedule) {

            content.innerHTML =
                '<div class="schedule-placeholder">' +
                'No se encontró programación para ' +
                channelName +
                '.' +
                '</div>';

            return;

        }

        renderChannelSchedule(
            schedule,
            channelSchedule
        );
    }


    function bindControls() {
        var periodSelect =
            getElement(SELECTORS.period);

        var channelSelect =
            getElement(SELECTORS.channel);

        if (periodSelect) {
            periodSelect.addEventListener(
                'change',
                renderCurrentView
            );
        }

        if (channelSelect) {
            channelSelect.addEventListener(
                'change',
                renderCurrentView
            );
        }
    }


    function loadData() {
        Promise.all([
            fetch(SCHEDULES_URL)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error(
                            'No se pudo cargar schedules.json'
                        );
                    }

                    return response.json();
                }),

            fetch(DATA_URL)
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error(
                            'No se pudo cargar data.json'
                        );
                    }

                    return response.json();
                })
        ])
            .then(function (results) {
                var schedulesJson = results[0];
                var dataJson = results[1];

                schedulesData =
                    Array.isArray(schedulesJson.schedules)
                        ? schedulesJson.schedules
                        : [];

                productionsData =
                    Array.isArray(dataJson.items)
                        ? dataJson.items
                        : [];

                bindControls();
                renderCurrentView();
            })
            .catch(function (error) {
                var content =
                    getElement(SELECTORS.content);

                if (content) {
                    content.innerHTML =
                        '<div class="schedule-placeholder">' +
                        'Error al cargar la programación.' +
                        '</div>';
                }

                console.error(
                    'Schedules:',
                    error
                );
            });
    }


    document.addEventListener(
        'DOMContentLoaded',
        loadData
    );

})();
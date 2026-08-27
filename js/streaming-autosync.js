(function ($) {
    "use strict";

    if (!$ || !$.fn || !$.fn.lightSlider) {
        console.warn(
            "streaming-autosync: LightSlider no está disponible."
        );
        return;
    }

    var PLACEHOLDER =
        "images/verticals/placeholder-280x420.svg";

    var ITEM_CLASSES = [
        "item-a",
        "item-b",
        "item-c",
        "item-d",
        "item-e",
        "item-f",
        "item-g"
    ];

    var STREAMING_PLATFORMS = [
        "netflix",
        "flow",
        "disney+",
        "disney +",
        "disney plus",
        "prime video",
        "amazon prime video",
        "hbo max",
        "max",
        "hulu",
        "reelshort",
        "shorta",
        "paramount+",
        "paramount plus",
        "star+",
        "star plus",
        "apple tv+",
        "apple tv plus",
        "streaming"
    ];

    var MULTI_SEASON_PLATFORMS = [
        "netflix",
        "flow",
        "disney+",
        "disney +",
        "disney plus",
        "prime video",
        "amazon prime video",
        "hbo max",
        "max"
    ];

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    function toArray(value) {
        if (Array.isArray(value)) {
            return value;
        }

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return [];
        }

        return [value];
    }

    function getSources(item) {
        return []
            .concat(toArray(item.channel))
            .concat(toArray(item.channels))
            .concat(toArray(item.platform))
            .concat(toArray(item.platforms))
            .concat(toArray(item.plataforma))
            .map(normalize)
            .filter(Boolean);
    }

    function isStreamingSeries(item) {
        var type = normalize(
            item.type || item.tipo_emision
        );

        var id = String(item.id || "");

        var isSeries =
            type === "serie" ||
            type === "series" ||
            /^v/i.test(id);

        var sources = getSources(item);

        var isStreaming = sources.some(function (source) {
            return STREAMING_PLATFORMS.indexOf(source) !== -1;
        });

        return isSeries && isStreaming;
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }

        var text = String(value).trim();
        var match;

        match = text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        );

        if (match) {
            var localDate = new Date(
                Number(match[3]),
                Number(match[2]) - 1,
                Number(match[1])
            );

            return Number.isNaN(localDate.getTime())
                ? null
                : localDate;
        }

        match = text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

        if (match) {
            var isoDate = new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            );

            return Number.isNaN(isoDate.getTime())
                ? null
                : isoDate;
        }

        return null;
    }

    function getLatestReleasedDate(item, today) {
        var candidates = [];

        var baseDate = parseDate(
            item.release_date || item.fecha_estreno
        );

        if (baseDate) {
            candidates.push(baseDate);
        }

        toArray(item.temporadas).forEach(function (season) {
            var seasonDate = parseDate(
                season.release_date || season.fecha_estreno
            );

            if (seasonDate) {
                candidates.push(seasonDate);
            }
        });

        var releasedDates = candidates
            .filter(function (date) {
                return date.getTime() <= today.getTime();
            })
            .sort(function (a, b) {
                return b.getTime() - a.getTime();
            });

        if (releasedDates.length) {
            return releasedDates[0];
        }

        /*
         * Si existen fechas concretas pero todas son futuras,
         * la producción todavía no debe entrar en estas filas.
         */
        if (candidates.length) {
            return null;
        }

        /*
 * Las producciones anunciadas sin fecha no deben ingresar
 * en las filas de títulos ya estrenados.
 */
        var status = normalize(item.status);

        if (
            status === "en produccion" ||
            status === "proximamente"
        ) {
            return null;
        }

        /*
         * Los registros históricos sin día y mes utilizan
         * el año como criterio secundario.
         */
        var year = Number(item.year);

        if (year && year <= today.getFullYear()) {
            return new Date(year, 0, 1);
        }

        return null;
    }

    function getCategory(item) {
        return normalize(
            [
                item.genre,
                item.subtitle
            ].filter(Boolean).join(" ")
        );
    }

    function isComedy(item) {
        var category = getCategory(item);

        return (
            category.indexOf("comedia") !== -1 ||
            category.indexOf("sitcom") !== -1
        );
    }

    function isThrillerOrCrime(item) {
        var category = getCategory(item);

        return (
            category.indexOf("thriller") !== -1 ||
            category.indexOf("policial") !== -1 ||
            category.indexOf("policiaco") !== -1 ||
            category.indexOf("crimen") !== -1 ||
            category.indexOf("suspenso") !== -1
        );
    }

    function isDrama(item) {
        var category = normalize(
            item.genre || item.subtitle
        );

        return category.indexOf("drama") !== -1;
    }

    function isMultiSeasonPlatform(item) {
        return getSources(item).some(function (source) {
            return (
                MULTI_SEASON_PLATFORMS.indexOf(source) !== -1
            );
        });
    }

    function getSeasonNumber(season, index) {
        var value = Number(
            season.numero ||
            season.season ||
            season.season_number ||
            index + 1
        );

        return Number.isNaN(value)
            ? index + 1
            : value;
    }

    function getReleasedSeasons(item, today) {
        return toArray(item.temporadas)
            .map(function (season, index) {
                var number = getSeasonNumber(
                    season,
                    index
                );

                var date = parseDate(
                    season.release_date ||
                    season.fecha_estreno
                );

                if (!date && number === 1) {
                    date = parseDate(
                        item.release_date ||
                        item.fecha_estreno
                    );
                }

                return {
                    season: season,
                    number: number,
                    date: date
                };
            })
            .filter(function (entry) {
                return (
                    entry.date &&
                    entry.date.getTime() <=
                    today.getTime()
                );
            });
    }

    function hasMultipleReleasedSeasons(item, today) {
        return (
            getReleasedSeasons(item, today).length > 1
        );
    }

    function getFirstSeasonImage(item) {
        var seasons = toArray(item.temporadas)
            .map(function (season, index) {
                return {
                    season: season,
                    number: getSeasonNumber(
                        season,
                        index
                    )
                };
            })
            .sort(function (a, b) {
                return a.number - b.number;
            });

        var firstSeason = seasons.filter(
            function (entry) {
                return (
                    entry.number === 1 &&
                    entry.season.image &&
                    String(entry.season.image).trim()
                );
            }
        )[0];

        if (!firstSeason && seasons.length) {
            firstSeason = seasons[0];
        }

        if (
            firstSeason &&
            firstSeason.season.image &&
            String(firstSeason.season.image).trim()
        ) {
            return String(
                firstSeason.season.image
            ).trim();
        }

        return (
            String(
                item.first_season_image || ""
            ).trim() ||
            String(item.image || "").trim() ||
            PLACEHOLDER
        );
    }

    function isJuvenile(item) {
        return getCategory(item).indexOf("juvenil") !== -1;
    }

    function getTelevisionBroadcasts(item) {
        return []
            .concat(toArray(item.air_broadcasts))
            .concat(toArray(item.cable_broadcasts))
            .filter(function (broadcast) {
                return (
                    broadcast &&
                    typeof broadcast === "object"
                );
            });
    }

    function getTelevisionChannels(item) {
        var channels = []
            .concat(toArray(item.air_channels))
            .concat(toArray(item.cable_channels));

        getTelevisionBroadcasts(item).forEach(
            function (broadcast) {
                channels = channels.concat(
                    toArray(broadcast.channel)
                );
            }
        );

        return channels
            .map(function (channel) {
                return String(channel || "").trim();
            })
            .filter(function (channel, index, values) {
                if (!channel) {
                    return false;
                }

                return values.findIndex(
                    function (value) {
                        return (
                            normalize(value) ===
                            normalize(channel)
                        );
                    }
                ) === index;
            });
    }

    function getLatestTelevisionDate(item, today) {
        var televisionDates = [];

        getTelevisionBroadcasts(item).forEach(
            function (broadcast) {
                var broadcastDate = parseDate(
                    broadcast.premiere_date ||
                    broadcast.release_date ||
                    broadcast.start_date ||
                    broadcast.fecha_estreno
                );

                if (
                    broadcastDate &&
                    broadcastDate.getTime() <=
                    today.getTime()
                ) {
                    televisionDates.push(broadcastDate);
                }
            }
        );

        televisionDates.sort(function (a, b) {
            return b.getTime() - a.getTime();
        });

        /*
         * La fecha televisiva más reciente tiene prioridad.
         * El estreno en streaming se utiliza únicamente
         * como respaldo para registros sin air_broadcasts
         * o cable_broadcasts fechados.
         */
        if (televisionDates.length) {
            return televisionDates[0];
        }

        return getLatestReleasedDate(item, today);
    }

    function getAverageTelevisionRating(item) {
        var broadcasts = getTelevisionBroadcasts(item)
            .slice()
            .sort(function (a, b) {
                var dateA = parseDate(
                    a.premiere_date ||
                    a.release_date ||
                    a.start_date
                );

                var dateB = parseDate(
                    b.premiere_date ||
                    b.release_date ||
                    b.start_date
                );

                return (
                    (dateB ? dateB.getTime() : 0) -
                    (dateA ? dateA.getTime() : 0)
                );
            });

        var broadcastWithRating = broadcasts.filter(
            function (broadcast) {
                return (
                    broadcast.rating !== undefined &&
                    broadcast.rating !== null &&
                    String(broadcast.rating).trim() !== ""
                );
            }
        )[0];

        if (broadcastWithRating) {
            return broadcastWithRating.rating;
        }

        if (
            item.rating !== undefined &&
            item.rating !== null &&
            String(item.rating).trim() !== ""
        ) {
            return item.rating;
        }

        return "";
    }

    function getTelevisionMeta(item) {
        var parts = getTelevisionChannels(item);
        var rating = getAverageTelevisionRating(item);

        if (rating !== "") {
            parts.push(
                "Rating: " +
                String(rating).replace(".", ",")
            );
        }

        return parts.join(" · ");
    }

    function isVerticalFiction(item) {
        return (
            item.streaming_row === "ficciones_verticales"
        );
    }

    function isBioseries(item) {
        return (
            normalize(item.streaming_row) ===
            "bioseries"
        );
    }

    function isPoliticalThriller(item) {
        return (
            normalize(item.streaming_row) ===
            "thrillers_politicos"
        );
    }

    function prepareItems(items) {
        var today = new Date();

        today.setHours(23, 59, 59, 999);

        return items
            .filter(function (item) {
                return (
                    item &&
                    normalize(item.orientation) === "vertical" &&
                    (
                        isStreamingSeries(item) ||
                        isVerticalFiction(item)
                    )
                );
            })
            .map(function (item) {
                return {
                    item: item,
                    latestDate: getLatestReleasedDate(
                        item,
                        today
                    )
                };
            })
            .filter(function (entry) {
                return entry.latestDate !== null;
            })
            .sort(function (a, b) {
                return (
                    b.latestDate.getTime() -
                    a.latestDate.getTime()
                );
            });
    }

    function createCard(item, index) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        var box = document.createElement("div");
        var imageBox = document.createElement("div");
        var image = document.createElement("img");
        var textBox = document.createElement("div");
        var title = document.createElement("strong");
        var paragraph = document.createElement("p");

        li.className =
            ITEM_CLASSES[index % ITEM_CLASSES.length];

        link.href =
            "show.html?id=" +
            encodeURIComponent(item.id || "");

        box.className = "latest-box";
        imageBox.className = "latest-b-img";
        textBox.className = "latest-b-text";

        image.src =
            String(
                item.displayImage ||
                item.image ||
                ""
            ).trim() ||
            PLACEHOLDER;

        image.alt = item.title || "";
        image.loading = "lazy";

        title.textContent = item.title || "";

        title.textContent = item.title || "";

        if (item.displaySeasonCount) {
            paragraph.textContent =
                item.displaySeasonCount +
                (
                    item.displaySeasonCount === 1
                        ? " temporada"
                        : " temporadas"
                );
        } else if (item.displayMeta) {
            paragraph.textContent = item.displayMeta;
        }

        imageBox.appendChild(image);
        textBox.appendChild(title);
        textBox.appendChild(paragraph);

        box.appendChild(imageBox);
        box.appendChild(textBox);
        link.appendChild(box);
        li.appendChild(link);

        return li;
    }

    function createHorizontalCard(item, index) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        var imageBox = document.createElement("div");
        var image = document.createElement("img");
        var textBox = document.createElement("div");
        var title = document.createElement("strong");
        var paragraph = document.createElement("p");

        li.className =
            ITEM_CLASSES[index % ITEM_CLASSES.length];

        link.href =
            "show.html?id=" +
            encodeURIComponent(item.id || "");

        imageBox.className = "showcase-box";
        textBox.className = "latest-b-text";

        image.src = String(
            item.horizontal_image || ""
        ).trim();

        image.alt = item.title || "";
        image.loading = "lazy";

        title.textContent = item.title || "";

        imageBox.appendChild(image);
        textBox.appendChild(title);
        textBox.appendChild(paragraph);

        link.appendChild(imageBox);
        link.appendChild(textBox);
        li.appendChild(link);

        return li;
    }

    function initializeSlider($slider) {
        if (
            !$slider.length ||
            $slider.data("lightSlider")
        ) {
            return;
        }

        $slider.lightSlider({
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
                        item: 3,
                        slideMove: 1,
                        slideMargin: 14
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
            ],

            onSliderLoad: function () {
                $slider
                    .removeClass("cs-hidden")
                    .addClass("slider-ready");
            }
        });
    }

    function initializeHorizontalSlider($slider) {
        if (
            !$slider.length ||
            $slider.data("lightSlider")
        ) {
            return;
        }

        $slider.addClass("slider-h");

        $slider.lightSlider({
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
            ],

            onSliderLoad: function () {
                $slider
                    .removeClass("cs-hidden")
                    .addClass("slider-ready");
            }
        });
    }

    function renderSlider(catalogName, entries) {
        var $slider = $(
            '[data-streaming-catalog="' +
            catalogName +
            '"]'
        );

        if (!$slider.length) {
            return;
        }

        $slider.empty();

        entries.forEach(function (entry, index) {
            $slider[0].appendChild(
                createCard(entry.item, index)
            );
        });

        if (!entries.length) {
            $slider.removeClass("cs-hidden");

            console.warn(
                "streaming-autosync: no se encontraron fichas para " +
                catalogName
            );

            return;
        }

        /*
         * El carrusel se inicializa después de agregar
         * la totalidad de las fichas.
         */
        initializeSlider($slider);
    }

    function renderHorizontalSlider(
        catalogName,
        entries
    ) {
        var $slider = $(
            '[data-streaming-catalog="' +
            catalogName +
            '"]'
        );

        if (!$slider.length) {
            return;
        }

        $slider
            .empty()
            .addClass("slider-h");

        entries.forEach(function (entry, index) {
            $slider[0].appendChild(
                createHorizontalCard(
                    entry.item,
                    index
                )
            );
        });

        if (!entries.length) {
            $slider.removeClass("cs-hidden");

            console.warn(
                "streaming-autosync: no se encontraron fichas para " +
                catalogName
            );

            return;
        }

        initializeHorizontalSlider($slider);
    }

    function loadStreamingCatalog() {
        fetch("data.json?v=20260820-1", {
            cache: "no-store"
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        "No se pudo cargar data.json: " +
                        response.status
                    );
                }

                return response.json();
            })
            .then(function (data) {
                var items = Array.isArray(data)
                    ? data
                    : (
                        Array.isArray(data.items)
                            ? data.items
                            : []
                    );

                var preparedItems = prepareItems(items);

                var comedies = preparedItems.filter(
                    function (entry) {
                        return (
                            isComedy(entry.item) &&
                            !isJuvenile(entry.item) &&
                            !entry.item.streaming_row
                        );
                    }
                );

                var thrillers = preparedItems.filter(
                    function (entry) {
                        return (
                            isThrillerOrCrime(entry.item) &&
                            !isJuvenile(entry.item) &&
                            !entry.item.streaming_row
                        );
                    }
                );

                var dramas = preparedItems.filter(
                    function (entry) {
                        return (
                            isDrama(entry.item) &&
                            !isJuvenile(entry.item) &&
                            !entry.item.streaming_row
                        );
                    }
                );

                var today = new Date();

                today.setHours(23, 59, 59, 999);

                var multipleSeasons = preparedItems
                    .filter(function (entry) {
                        return (
                            isMultiSeasonPlatform(entry.item) &&
                            hasMultipleReleasedSeasons(
                                entry.item,
                                today
                            ) &&
                            !isJuvenile(entry.item) &&
                            !isVerticalFiction(entry.item)
                        );
                    })
                    .map(function (entry) {
                        return {
                            item: Object.assign(
                                {},
                                entry.item,
                                {
                                    displayImage:
                                        getFirstSeasonImage(
                                            entry.item
                                        ),
                                    displaySeasonCount:
                                        getReleasedSeasons(
                                            entry.item,
                                            today
                                        ).length
                                }
                            ),
                            latestDate: entry.latestDate
                        };
                    });

                var bioseries = preparedItems.filter(
                    function (entry) {
                        return (
                            isBioseries(entry.item) &&
                            String(
                                entry.item.horizontal_image ||
                                ""
                            ).trim()
                        );
                    }
                );

                var politicalThrillers =
                    preparedItems.filter(
                        function (entry) {
                            return (
                                isPoliticalThriller(
                                    entry.item
                                ) &&
                                String(
                                    entry.item.horizontal_image ||
                                    ""
                                ).trim()
                            );
                        }
                    );

                var streamingAndTv = preparedItems
                    .filter(function (entry) {
                        var latestTelevisionDate =
                            getLatestTelevisionDate(
                                entry.item,
                                today
                            );

                        return (
                            getTelevisionChannels(
                                entry.item
                            ).length > 0 &&
                            latestTelevisionDate &&
                            latestTelevisionDate.getFullYear() >= 2016
                        );
                    })
                    .map(function (entry) {
                        return {
                            item: Object.assign(
                                {},
                                entry.item,
                                {
                                    displayMeta:
                                        getTelevisionMeta(
                                            entry.item
                                        )
                                }
                            ),
                            latestDate:
                                getLatestTelevisionDate(
                                    entry.item,
                                    today
                                )
                        };
                    })
                    .sort(function (a, b) {
                        return (
                            b.latestDate.getTime() -
                            a.latestDate.getTime()
                        );
                    });

                var verticalFictions = preparedItems.filter(
                    function (entry) {
                        return isVerticalFiction(entry.item);
                    }
                );

                renderSlider("comedias", comedies);
                renderSlider("thrillers", thrillers);
                renderSlider("dramas", dramas);

                renderSlider(
                    "multiples_temporadas",
                    multipleSeasons
                );

                renderSlider(
                    "ficciones_verticales",
                    verticalFictions
                );

                renderHorizontalSlider(
                    "bioseries",
                    bioseries
                );

                renderHorizontalSlider(
                    "thrillers_politicos",
                    politicalThrillers
                );

                renderSlider(
                    "streaming_tv",
                    streamingAndTv
                );
            })
            .catch(function (error) {
                console.error(
                    "streaming-autosync:",
                    error
                );
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            loadStreamingCatalog
        );
    } else {
        loadStreamingCatalog();
    }
})(window.jQuery);
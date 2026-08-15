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
    "paramount+",
    "paramount plus",
    "star+",
    "star plus",
    "apple tv+",
    "apple tv plus",
    "streaming"
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

  function isJuvenile(item) {
    return getCategory(item).indexOf("juvenil") !== -1;
  }

  function isVerticalFiction(item) {
    return (
      item.streaming_row === "ficciones_verticales"
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
          isStreamingSeries(item)
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
      String(item.image || "").trim() ||
      PLACEHOLDER;

    image.alt = item.title || "";
    image.loading = "lazy";

    title.textContent = item.title || "";

    imageBox.appendChild(image);
    textBox.appendChild(title);
    textBox.appendChild(paragraph);

    box.appendChild(imageBox);
    box.appendChild(textBox);
    link.appendChild(box);
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

  function loadStreamingCatalog() {
    fetch("data.json?v=20260815-2", {
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

        var verticalFictions = preparedItems.filter(
          function (entry) {
            return isVerticalFiction(entry.item);
          }
        );

        renderSlider("comedias", comedies);

        renderSlider(
          "ficciones_verticales",
          verticalFictions
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
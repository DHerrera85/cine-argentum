(function () {
  'use strict';

  var ROWS = [
    {
      id: 'unitarios-ultimas',
      countId: 'unitarios-ultimas-count',
      category: 'ultimas-unitarios',
      horizontal: true,
      order: [
        'V221', 'V280', 'V248', 'S1001',
        'V180', 'V232', 'V240', 'V264'
      ]
    },
    {
      id: 'unitarios-elencos-rotativos',
      countId: 'unitarios-elencos-rotativos-count',
      category: 'elencos-rotativos',
      order: [
        'V223', 'V226', 'V274', 'V291',
        'V275', 'V276', 'V277', 'V278',
        'V279'
      ]
    },
    {
      id: 'unitarios-tv-streaming',
      countId: 'unitarios-tv-streaming-count',
      category: 'tv-streaming',
      order: [
        'V219', 'V220', 'V221', 'V179',
        'V222', 'V223', 'V224', 'V225',
        'V226', 'V227', 'V228', 'V229',
        'V230', 'V180', 'V231', 'V232'
      ]
    },
    {
      id: 'unitarios-lanzamientos-cable',
      countId: 'unitarios-lanzamientos-cable-count',
      category: 'lanzamientos-cable',
      order: [
        'V280', 'V233', 'S1001', 'V234',
        'V235', 'V236', 'V237', 'V238',
        'V239'
      ]
    },
    {
      id: 'unitarios-exitos-2000',
      countId: 'unitarios-exitos-2000-count',
      category: 'exitos-2000',
      horizontal: true,
      order: [
        'V251', 'V242', 'V245', 'V324',
        'V247', 'V279', 'V260'
      ]
    },

    {
      id: 'unitarios-suspenso-crimen',
      countId: 'unitarios-suspenso-crimen-count',
      category: 'suspenso-crimen',
      order: [
        'V293', 'V240', 'V241', 'V242',
        'V243', 'V244', 'V324', 'V245'
      ]
    },

    {
      id: 'unitarios-dramas',
      countId: 'unitarios-dramas-count',
      category: 'dramas-unitarios',
      order: [
        'V248', 'V249', 'V250', 'V251',
        'V252', 'V253', 'V289', 'V254',
        'V255', 'V256', 'V257', 'V258',
        'V259', 'V260'
      ]
    },

    {
      id: 'unitarios-comedias',
      countId: 'unitarios-comedias-count',
      category: 'comedias-unitarios',
      order: [
        'V261', 'V165', 'V262', 'V263',
        'V264', 'V265', 'V266', 'V267',
        'V268', 'V269', 'V270', 'V271',
        'V272', 'V273'
      ]
    }

  ];


  function createCard(item, horizontal, premiereDate) {
    var li = document.createElement('li');
    li.className = horizontal ? 'item-b' : 'item-d';

    var box = document.createElement('div');
    box.className = horizontal ? 'showcase-box' : 'latest-box';

    var link = document.createElement('a');
    link.href = 'show.html?id=' + encodeURIComponent(item.id);
    link.setAttribute('aria-label', 'Ver ficha de ' + item.title);

    var img = document.createElement('img');
    img.src = horizontal ? item.horizontal_image : item.image;
    img.alt = item.title;
    img.loading = 'lazy';

    var textBox = document.createElement('div');
    textBox.className = 'latest-b-text';

    var title = document.createElement('strong');
    title.textContent = item.title;
    textBox.appendChild(title);

    if (premiereDate) {
      var date = document.createElement('span');
      date.className = 'tiras-2000-premiere-date';
      date.textContent = premiereDate;
      textBox.appendChild(date);
    } else if (!horizontal && item.year) {
      var year = document.createElement('span');
      year.className = 'year';
      year.textContent = item.year;
      textBox.appendChild(year);
    }

    if (horizontal) {
      box.appendChild(img);
      link.appendChild(box);
      link.appendChild(textBox);
      li.appendChild(link);
    } else {
      var imageBox = document.createElement('div');
      imageBox.className = 'latest-b-img';
      imageBox.appendChild(img);

      box.appendChild(imageBox);
      box.appendChild(textBox);
      link.appendChild(box);
      li.appendChild(link);
    }

    if (horizontal) {
      var description = document.createElement('p');
      textBox.appendChild(description);
    }

    return li;
  }

  function initializeSlider(element, horizontal) {
    if (!window.jQuery ||
      !window.jQuery.fn.lightSlider) {
      console.warn('LightSlider no está disponible');
      element.classList.remove('cs-hidden');
      return null;
    }

    var $slider = window.jQuery(element);

    if ($slider.closest('.lSSlideOuter').length) {
      return element._unitariosSlider || null;
    }

    $slider.lightSlider({
      item: horizontal ? 3 : 5,
      slideMove: 1,
      slideMargin: 12,
      loop: false,
      pager: false,
      controls: true,
      enableTouch: true,
      enableDrag: true,
      freeMove: false,
      responsive: horizontal
        ? [
          {
            breakpoint: 1100,
            settings: { item: 2, slideMove: 1 }
          },
          {
            breakpoint: 768,
            settings: { item: 1, slideMove: 1 }
          }
        ]
        : [
          {
            breakpoint: 1100,
            settings: { item: 4, slideMove: 1 }
          },
          {
            breakpoint: 768,
            settings: { item: 2, slideMove: 1 }
          }
        ],
      onSliderLoad: function () {
        $slider.removeClass('cs-hidden');
      }
    });

    element._unitariosSlider = $slider;
    return $slider;
  }

  function parseReleaseDate(item) {
    var value = item && (item.release_date || item.fecha_estreno);

    if (!value) return null;

    var text = String(value).trim();
    var match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    var date;

    if (match) {
      date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
      var parts = text.split('-');
      date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      return null;
    }

    if (!Number.isFinite(date.getTime())) return null;

    if (
      date.getFullYear() !== (match ? Number(match[3]) : Number(text.split('-')[0])) ||
      date.getMonth() !== (match ? Number(match[2]) - 1 : Number(text.split('-')[1]) - 1) ||
      date.getDate() !== (match ? Number(match[1]) : Number(text.split('-')[2]))
    ) {
      return null;
    }

    return date;
  }

  function formatReleaseDate(date) {
    return [
      String(date.getDate()).padStart(2, '0'),
      String(date.getMonth() + 1).padStart(2, '0'),
      date.getFullYear()
    ].join('/');
  }

  function initializePremiereCalendar(items) {
    var section = document.getElementById('unitarios-historical-premieres');
    var tabsContainer = document.getElementById('unitarios-historical-month-tabs');
    var list = document.getElementById('unitarios-historical-premieres-list');

    if (!section || !tabsContainer || !list) return;

    var count = document.getElementById('unitarios-historical-premieres-count');
    var empty = document.getElementById('unitarios-historical-premieres-empty');
    var tabs = Array.prototype.slice.call(tabsContainer.querySelectorAll('[data-month]'));

    function renderMonth(monthIndex) {
      var premieres = items.map(function (item) {
        return {
          item: item,
          date: parseReleaseDate(item)
        };
      }).filter(function (entry) {
        var item = entry.item;
        return item &&
          item.id &&
          item.title &&
          item.image &&
          Array.isArray(item.unitarios_rows) &&
          item.unitarios_rows.length > 0 &&
          entry.date &&
          entry.date.getMonth() === monthIndex;
      }).sort(function (a, b) {
        return b.date - a.date;
      });

      if (list._unitariosSlider && typeof list._unitariosSlider.destroy === 'function') {
        list._unitariosSlider.destroy();
        list._unitariosSlider = null;
      }

      var fragment = document.createDocumentFragment();
      premieres.forEach(function (premiere) {
        fragment.appendChild(createCard(
          premiere.item,
          false,
          formatReleaseDate(premiere.date)
        ));
      });
      list.replaceChildren(fragment);

      if (count) {
        count.textContent = premieres.length === 1
          ? '1 estreno'
          : premieres.length + ' estrenos';
        count.hidden = false;
      }
      if (empty) empty.hidden = premieres.length > 0;
      list.hidden = premieres.length === 0;

      if (premieres.length) {
        initializeSlider(list, false);
      } else {
        list.classList.remove('cs-hidden');
      }
    }

    function selectMonth(monthIndex) {
      tabs.forEach(function (tab) {
        var selected = Number(tab.getAttribute('data-month')) === monthIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.classList.toggle('is-active', selected);
      });
      renderMonth(monthIndex);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        selectMonth(Number(tab.getAttribute('data-month')));
      });
    });

    [
      ['unitarios-months-previous', -240],
      ['unitarios-months-next', 240]
    ].forEach(function (control) {
      var button = document.getElementById(control[0]);
      if (button) {
        button.addEventListener('click', function () {
          tabsContainer.scrollBy({ left: control[1], behavior: 'smooth' });
        });
      }
    });

    section.hidden = false;
    selectMonth(new Date().getMonth());
  }

  function updateCount(row, total) {
    var count = document.getElementById(row.countId);
    if (!count) return;

    count.textContent = total === 1
      ? '1 producción'
      : total + ' producciones';
    count.hidden = false;
  }

  async function init() {
    var activeRows = ROWS.filter(function (row) {
      return document.getElementById(row.id);
    });

    if (!activeRows.length) return;

    try {
      var response = await fetch('data.json', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar data.json');
      }

      var data = await response.json();
      var items = Array.isArray(data.items)
        ? data.items
        : [];

      var catalog = new Map();

      items.forEach(function (item) {
        if (item && item.id) {
          catalog.set(item.id, item);
        }
      });

      activeRows.forEach(function (row) {
        var slider = document.getElementById(row.id);
        var fragment = document.createDocumentFragment();

        row.order.forEach(function (id) {
          var item = catalog.get(id);

          if (
            item &&
            Array.isArray(item.unitarios_rows) &&
            item.unitarios_rows.includes(row.category) &&
            (row.horizontal ? item.horizontal_image : item.image) &&
            item.title
          ) {
            fragment.appendChild(createCard(item, row.horizontal));
          } else {
            console.warn(
              'Unitarios: entrada faltante o sin clasificar:',
              row.category,
              id
            );
          }
        });

        updateCount(row, fragment.childNodes.length);

        if (!fragment.childNodes.length) {
          console.warn(
            'Unitarios: galería sin producciones:',
            row.category
          );
          return;
        }

        slider.replaceChildren(fragment);
        initializeSlider(slider, row.horizontal);
      });

      initializePremiereCalendar(items);
    } catch (error) {
      console.error(
        'Error al cargar galerías de Unitarios:',
        error
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

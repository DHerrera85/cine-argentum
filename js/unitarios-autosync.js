(function () {
  'use strict';

  var ROWS = [
    {
      id: 'unitarios-ultimas',
      category: 'ultimas-unitarios',
      horizontal: true,
      order: [
        'V221', 'V280', 'V248', 'S1001',
        'V180', 'V232', 'V240', 'V264'
      ]
    },
    {
      id: 'unitarios-elencos-rotativos',
      category: 'elencos-rotativos',
      order: [
        'V223', 'V226', 'V274', 'V291',
        'V275', 'V276', 'V277', 'V278',
        'V279'
      ]
    },
    {
      id: 'unitarios-tv-streaming',
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
      category: 'lanzamientos-cable',
      order: [
        'V280', 'V233', 'S1001', 'V234',
        'V235', 'V236', 'V237', 'V238',
        'V239'
      ]
    },
    {
      id: 'unitarios-exitos-2000',
      category: 'exitos-2000',
      horizontal: true,
      order: [
        'V251', 'V242', 'V245', 'V324',
        'V247', 'V279', 'V260'
      ]
    },

    {
      id: 'unitarios-suspenso-crimen',
      category: 'suspenso-crimen',
      order: [
        'V293', 'V240', 'V241', 'V242',
        'V243', 'V244', 'V324', 'V245'
      ]
    }
  ];


  function createCard(item, horizontal) {
    var li = document.createElement('li');
    li.className = horizontal ? 'item-b' : 'item-d';

    var box = document.createElement('div');
    box.className = horizontal ? 'showcase-box' : 'latest-box';

    var link = document.createElement('a');
    link.href = 'show.html?id=' + encodeURIComponent(item.id);

    var img = document.createElement('img');
    img.src = horizontal ? item.horizontal_image : item.image;
    img.alt = item.title;
    img.loading = 'lazy';

    var textBox = document.createElement('div');
    textBox.className = 'latest-b-text';

    var titleLink = document.createElement('a');
    titleLink.href = link.href;

    var title = document.createElement('strong');
    title.textContent = item.title;

    titleLink.appendChild(title);
    textBox.appendChild(titleLink);

    if (horizontal) {
      // Mantener la imagen como hija directa de showcase-box.
      box.appendChild(img);
      li.appendChild(box);
      li.appendChild(textBox);
    } else {
      // Conservar la estructura original de las tarjetas verticales.
      var imageBox = document.createElement('div');
      imageBox.className = 'latest-b-img';

      link.appendChild(img);
      imageBox.appendChild(link);

      box.appendChild(imageBox);
      box.appendChild(textBox);
      li.appendChild(box);
    }

    return li;
  }

  function initializeSlider(element, horizontal) {
    if (!window.jQuery ||
      !window.jQuery.fn.lightSlider) {
      console.warn('LightSlider no está disponible');
      return;
    }

    var $slider = window.jQuery(element);

    if ($slider.closest('.lSSlideOuter').length) {
      return;
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

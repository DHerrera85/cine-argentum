/* js/script.js */
(function () {
  var scriptDataVersion = '20260225-3';
  // Esperar a que el DOM esté listo
  document.addEventListener('DOMContentLoaded', function () {
    // Verificaciones básicas
    if (!window.jQuery) {
      console.error('jQuery NO está cargado. Revisá la ruta de js/JQuery3.3.1.js');
      return;
    }
    if (!jQuery.fn.lightSlider) {
      console.error('LightSlider NO está cargado. Revisá la ruta de js/lightslider.js');
      return;
    }

    var $ = jQuery;
    window.faConfig = window.faConfig || { showSynopsisInSearch: false, filterMissingPosters: false };
    var verticalItems = [];
    var horizontalItems = [];
    var PLACEHOLDER_V = 'images/verticals/placeholder-280x420.svg';
    var PLACEHOLDER_H = 'images/horizontals-320x180/placeholder-320x180.svg';

    // Render helpers
    function renderHorizontalItems($container, items) {
      items.forEach(function (item) {
        if (window.faConfig.filterMissingPosters && !(item.image && String(item.image).trim())) return;
        var $li = $('<li>').addClass('item-js cs-hidden');
        var src = (item.image && String(item.image).trim()) ? item.image : PLACEHOLDER_H;
        var img = '<div class="showcase-box"><img src="' + src + '" loading="lazy" alt="' + (item.title || '') + '" /></div>';
        var text = '<div class="latest-b-text"><strong>' + (item.title || '') + '</strong><p>' + (item.subtitle || '') + '</p></div>';
        $li.append(img + text);
        $container.append($li);
      });
    }

    function renderVerticalItems($container, items) {
      items.forEach(function (item) {
        if (window.faConfig.filterMissingPosters && !(item.image && String(item.image).trim())) return;
        var $li = $('<li>').addClass('item-js cs-hidden');
        var src = (item.image && String(item.image).trim()) ? item.image : PLACEHOLDER_V;
        var img = '<div class="latest-box"><div class="latest-b-img"><img src="' + src + '" loading="lazy" alt="' + (item.title || '') + '" /></div>';
        var text = '<div class="latest-b-text"><strong>' + (item.title || '') + '</strong><p>' + (item.subtitle || '') + '</p></div></div>';
        $li.append(img + text);
        $container.append($li);
      });
    }

    // Buscador: mostrar resultados que solo pertenezcan a verticalItems
    function createSearchDropdown() {
      var $search = $('.search');
      if ($search.find('.search-results').length) return;
      var $res = $('<div>').addClass('search-results').attr('aria-live','polite');
      $res.css({ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', zIndex: 9999, border: '1px solid #eee', display: 'none', maxHeight: '280px', overflowY: 'auto' });
      $search.append($res);
      return $res;
    }

    function searchVerticals(term) {
      term = (term || '').toLowerCase().trim();
      if (!term) return [];
      var results = verticalItems.filter(function (it) {
        if (!it) return false;
        var hay = (it.title || '') + ' ' + (it.year || '') + ' ' + (it.channel || '') + ' ' + (it.genre || '') + ' ' + (it.actors || []).join(' ');
        return hay.toLowerCase().indexOf(term) !== -1;
      });
      return results;
    }

    // util: valores únicos
    function unique(arr) { return Array.from(new Set((arr||[]).filter(Boolean))); }

    function populateFiltersFromItems(items) {
      var years = unique(items.map(function(i){return i.year;})).sort().reverse();
      var channels = unique(items.map(function(i){return i.channel;})).sort();
      var actors = unique(items.reduce(function(acc,i){ return acc.concat((i.actors||[]).slice(0,6)); },[])).sort();

      var $year = $('.filter-year'); if ($year.length) { $year.find('option:not(:first)').remove(); years.forEach(function(y){ $year.append($('<option>').attr('value',y).text(y)); }); }
      var $channel = $('.filter-channel'); if ($channel.length) { $channel.find('option:not(:first)').remove(); channels.forEach(function(c){ $channel.append($('<option>').attr('value',c).text(c)); }); }
      var $actor = $('.filter-actor'); if ($actor.length) { $actor.find('option:not(:first)').remove(); actors.forEach(function(a){ $actor.append($('<option>').attr('value',a).text(a)); }); }
    }

    function combinedSearch(term, filters) {
      term = (term||'').toLowerCase().trim();
      return verticalItems.filter(function(it){
        if (!it) return false;
        if (filters.year && it.year !== filters.year) return false;
        if (filters.channel && it.channel !== filters.channel) return false;
        if (filters.actor) {
          var actorLower = filters.actor.toLowerCase();
          var found = (it.actors||[]).slice(0,6).some(function(a){ return (a||'').toLowerCase().indexOf(actorLower) !== -1; });
          if (!found) return false;
        }
        if (!term) return true;
        var hay = ((it.title||'') + ' ' + (it.year||'') + ' ' + (it.channel||'') + ' ' + (it.genre||'') + ' ' + (it.actors||[]).join(' ')).toLowerCase();
        return hay.indexOf(term) !== -1;
      });
    }

    // Reemplazo attachSearchHandlers para usar filtros y resultados con enlace a show.html
    function attachSearchHandlers() {
      var $input = $('.search input[type="search"]');
      var $res = $('.search .search-results');
      if (!$res.length) {
        // crear si no existe
        $res = $('<div>').addClass('search-results').attr('aria-live','polite').css({ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', zIndex: 9999, border: '1px solid #eee', display: 'none', maxHeight: '320px', overflowY: 'auto' });
        $('.search').append($res);
      }

      // poblar filtros inicialmente
      populateFiltersFromItems(verticalItems);

      var debounce;
      function update() {
        var val = $input.val();
        var filters = { year: $('.filter-year').val(), channel: $('.filter-channel').val(), actor: $('.filter-actor').val() };
        var results = combinedSearch(val, filters);
        if (!results.length) { $res.hide().empty(); return; }
        $res.empty();
        results.slice(0,50).forEach(function (it) {
          var $row = $('<div>').addClass('search-row').css({padding:'8px 10px', borderBottom:'1px solid #f2f2f2'});
          var href = 'show.html?id=' + encodeURIComponent(it.id || it.title || '');
          var $link = $('<a>').attr('href', href).css({color:'#222', textDecoration:'none', display:'block'});
          var html = '<strong>' + (it.title||'') + '</strong>' + (it.year ? ' ('+it.year+')' : '');
          html += '<div style="font-size:12px;color:#666;">' + (it.channel||'') + ' • ' + (it.genre||'') + ' • ' + ((it.actors||[]).slice(0,3).join(', ')) + '</div>';
          if (window.faConfig.showSynopsisInSearch && it.synopsis) {
            var syn = String(it.synopsis).trim();
            if (syn.length > 140) syn = syn.slice(0, 140) + '…';
            html += '<div style="font-size:12px;color:#555;margin-top:4px;">' + syn + '</div>';
          }
          $link.html(html);
          $link.on('click', function () { $res.hide(); });
          $row.append($link);
          $res.append($row);
        });

        // fila para ver todos los resultados en search.html
        var q = encodeURIComponent(($input.val()||'').trim());
        var yr = encodeURIComponent(($('.filter-year').val()||''));
        var ch = encodeURIComponent(($('.filter-channel').val()||''));
        var ac = encodeURIComponent(($('.filter-actor').val()||''));
        var params = [];
        if (q) params.push('q=' + q);
        if (yr) params.push('year=' + yr);
        if (ch) params.push('channel=' + ch);
        if (ac) params.push('actor=' + ac);
        var allHref = 'search.html' + (params.length ? ('?' + params.join('&')) : '');
        var $allRow = $('<div>').addClass('search-row search-all').css({padding:'8px 10px', background:'#f7f7f7', textAlign:'center'});
        var $allLink = $('<a>').attr('href', allHref).css({display:'inline-block', padding:'6px 10px', background:'#222', color:'#fff', borderRadius:'4px', textDecoration:'none'}).text('Ver todos los resultados');
        $allLink.on('click', function () { $res.hide(); });
        $allRow.append($allLink);
        $res.append($allRow);

        $res.show();
      }

      $input.on('input', function () { clearTimeout(debounce); debounce = setTimeout(update, 180); });
      $('.filter-year, .filter-channel, .filter-actor').on('change', update);
      $(document).on('click', function (e) { if (!$(e.target).closest('.search').length) $('.search .search-results').hide(); });
    }

    // Intentar cargar data.json (si no existe, script seguirá usando el HTML estático)
    (function loadDataJson(){
      fetch('data.json?v=' + scriptDataVersion, { cache: 'no-store' }).then(function (res) {
        if (!res.ok) throw new Error('no ok');
        return res.json();
      }).then(function (data) {
        try {
          if (data && Array.isArray(data.items)) {
            data.items.forEach(function (it) {
              if (it.orientation === 'vertical') verticalItems.push(it);
              else horizontalItems.push(it);
            });
            // render horizontals into ALL .slider-h if empty
            $('.slider-h').each(function () {
              var $c = $(this);
              if ($c.data('skipAuto')) return;
              if ($c.length && $c.children().length === 0) renderHorizontalItems($c, horizontalItems);
            });
            // render verticals into ALL .slider-v if empty
            $('.slider-v').each(function () {
              var $c = $(this);
              if ($c.length && $c.children().length === 0) renderVerticalItems($c, verticalItems);
            });

            // refrescar sliders si ya están inicializados
            setTimeout(function () { try { if (typeof window.faRefreshSliders === 'function') window.faRefreshSliders(); } catch (e) {} }, 250);

            // attach search handlers
            attachSearchHandlers();
          }
        } catch (e) { console.warn('render data.json failed', e); }
      }).catch(function () {
        // no data.json -> usar HTML estático
        // cargar verticalItems desde DOM para búsqueda
        $('.slider-v li').each(function () {
          var $img = $(this).find('img').first();
          verticalItems.push({ id: '', title: $(this).find('strong').first().text().trim(), year: '', channel: '', genre: '', actors: [], orientation: 'vertical', image: $img.attr('src'), subtitle: '' });
        });
        attachSearchHandlers();
      });
    })();

    // ----- util para iniciar cada UL -----
    function initLightSlider($ul, opts) {
      if (!$ul.length) return;
      $ul.each(function () {
        var $this = $(this);
        // Evitar doble init
        if ($this.data('lightSlider')) return;

        // Iniciar
        $this.lightSlider($.extend(
          {
            autoWidth: true,      // para permitir peek; los anchos los controla CSS
            slideMove: 1,
            slideMargin: 16,
            loop: true,
            pager: true,
            controls: true,
            enableDrag: true,
            enableTouch: true,
            keyPress: true,
            pauseOnHover: true,
            speed: 500,
            onSliderLoad: function (el) {
              $this.removeClass('cs-hidden').addClass('slider-ready');
              // eliminar controles extras generados por doble inicialización accidental
              // dejamos visibles sólo nuestros botones prev/next personalizados
              $this.closest('.lSSlideOuter').find('.lSAction').each(function () {
                $(this).find('a').not('.ls-btn-prev, .ls-btn-next').remove();
              });
              // pequeño timeout para forzar reflow
              setTimeout(function () { try { var inst = $this.data('lightSlider'); if (inst && typeof inst.refresh === 'function') inst.refresh(); } catch (e) {} }, 60);
            }
          },
          opts || {}
        ));
      });
    }

    // Inyectar CSS para ocultar clear nativo del input[type=search] (tanto en desktop como móvil)
    (function injectSearchResetCSS(){
      var css = 'input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-ms-clear { display:none !important; }';
      var style = document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet) style.styleSheet.cssText = css; else style.appendChild(document.createTextNode(css));
      document.getElementsByTagName('head')[0].appendChild(style);
    })();

    // ===============================
    // Cine Argentum – LightSlider init
    // H: Desktop 3, Tablet 2, Móvil 1 + peek
    // V: Desktop 6, Tablet 4, Móvil 2 (mueve de a 1)
    // ===============================
    $(function () {
      // HORIZONTALES
      $('.slider-h').lightSlider({
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
          { breakpoint: 1100, settings: { item: 2, slideMove: 1, slideMargin: 14 } },
          { breakpoint: 768,  settings: { item: 1, slideMove: 1, slideMargin: 12 } }
        ]
      });

      // VERTICALES (genéricos - NO Top 10)
      $('.slider-v:not(.top10)').lightSlider({
        item: 5,
        slideMove: 1,
        slideMargin: 12,
        loop: false,
        pager: false,
        controls: true,
        enableTouch: true,
        enableDrag: true,
        freeMove: false,
        responsive: [
          { breakpoint: 1100, settings: { item: 4, slideMove: 1 } },
          { breakpoint: 768,  settings: { item: 2, slideMove: 1 } }
        ]
      });

      // VERTICALES (Top 10 - estilo HBO Max)
      $('.slider-v.top10').lightSlider({
        item: 4, // 4 en desktop
        slideMove: 1,
        slideMargin: 8,
        loop: false,
        pager: false,
        controls: true,
        enableTouch: true,
        enableDrag: true,
        freeMove: false,
        responsive: [
          { breakpoint: 1100, settings: { item: 3, slideMove: 1, slideMargin: 8 } },
          { breakpoint: 768,  settings: { item: 2, slideMove: 1, slideMargin: 6 } }
        ]
      });

      // ACTORES (Circular Gallery)
      $('.slider-actors').lightSlider({
        item: 4, // 4 en desktop
        autoWidth: false,
        slideMove: 1,
        slideMargin: 12,
        loop: false,
        pager: false,
        controls: true,
        enableTouch: true,
        enableDrag: true,
        freeMove: false,
        onSliderLoad: function(el) {
          $('.slider-actors').removeClass('cs-hidden');
          // Forzar recalculo después de carga
          setTimeout(function() {
            var sliderInstance = $('.slider-actors').data('lightSlider');
            if (sliderInstance && sliderInstance.refresh) {
              sliderInstance.refresh();
            }
          }, 100);
        },
        responsive: [
          { breakpoint: 1100, settings: { item: 4, slideMove: 1, slideMargin: 10 } },
          { breakpoint: 768,  settings: { item: 3, slideMove: 1, slideMargin: 8 } },
          { breakpoint: 480,  settings: { item: 3, slideMove: 1, slideMargin: 6 } }
        ]
      });

      // GÉNEROS (Horizontal Carousel - HBO Max style)
      $('.slider-genres').lightSlider({
        item: 5, // 5 en desktop
        autoWidth: false,
        slideMove: 1,
        slideMargin: 16,
        loop: false,
        pager: false,
        controls: true,
        enableTouch: true,
        enableDrag: true,
        freeMove: false,
        onSliderLoad: function(el) {
          $('.slider-genres').removeClass('cs-hidden').addClass('slider-ready');
        },
        responsive: [
          { breakpoint: 1200, settings: { item: 5, slideMove: 1, slideMargin: 14 } },
          { breakpoint: 768,  settings: { item: 3, slideMove: 1, slideMargin: 12 } },
          { breakpoint: 480,  settings: { item: 2, slideMove: 1, slideMargin: 10 } }
        ]
      });
    });


    // Forzar refresh tras load de imágenes para evitar fallback apilado
    $(window).on('load', function () {
      try {
        $('.slider-h, .horizontal-gallery, .slider-v, .vertical-gallery, #heroSlider').each(function () {
          var inst = $(this).data('lightSlider');
          if (inst && typeof inst.refresh === 'function') inst.refresh();
        });
      } catch (e) { console.warn('Refresh sliders falló', e); }
    });

    // Exponer una utilidad para refrescar desde consola si cambiás tamaños
    window.faRefreshSliders = function () {
      $('.js-slider-h, .js-slider-v, #autoWidth, #autoWidth2').each(function () {
        var inst = $(this).data('lightSlider');
        if (inst && typeof inst.refresh === 'function') inst.refresh();
      });
    };
  });
})();

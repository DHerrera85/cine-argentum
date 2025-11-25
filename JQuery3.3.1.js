(function ($) {
  $(function () {
    // 1) Actualizar currentPage / prevPage en sessionStorage
    var current = location.href;
    var storedCurrent = sessionStorage.getItem('currentPage') || '';
    var ref = document.referrer || '';

    if (storedCurrent && storedCurrent !== current) {
      sessionStorage.setItem('prevPage', storedCurrent);
    } else if (!storedCurrent && ref && ref !== current) {
      sessionStorage.setItem('prevPage', ref);
    }
    sessionStorage.setItem('currentPage', current);

    // 2) Resolver la mejor URL de retorno (solo si es del mismo origen)
    function resolveBackUrl() {
      var prev = sessionStorage.getItem('prevPage') || '';
      try {
        if (prev) {
          var p = new URL(prev, location.href);
          if (p.origin === location.origin) return prev;
        }
      } catch (e) { /* ignore malformed */ }

      if (ref) {
        try {
          var r = new URL(ref, location.href);
          if (r.origin === location.origin) return ref;
        } catch (e) {}
      }

      return null; // indicar uso de history.back()
    }
    var backUrl = resolveBackUrl();

    // 3) Interceptar enlaces "Volver" / "<-Volver" / index.html / class/data-back
    $('a').each(function () {
      var $a = $(this);
      var rawText = ($a.text() || '').trim();
      var text = rawText.toLowerCase();
      var href = $a.attr('href') || '';

      var isVolverText = text.indexOf('volver') !== -1 ||
                         text.indexOf('←') !== -1 ||
                         text.indexOf('<-') !== -1 ||
                         /^\s*<-\s*/.test(rawText);

      var isIndexLink = href && href.replace(/[#?].*$/, '').toLowerCase().endsWith('index.html');

      // ignorar enlaces externos / mailto / tel / javascript / anclas vacías
      var isSkippable = /^mailto:|^tel:|^javascript:|^#/.test(href);

      var wantsBack = $a.hasClass('back-link') || $a.data('back') === 'last' || isVolverText || isIndexLink;

      if (!wantsBack || isSkippable) return;

      if (backUrl) {
        // si existe prevPage válida, sustituir el href para navegación directa
        $a.attr('href', backUrl);
        if (!$a.attr('aria-label')) $a.attr('aria-label', 'Volver a la página anterior');
      } else {
        // si no hay prevPage válida, interceptar el click y usar history.back()
        $a.on('click', function (ev) {
          ev.preventDefault();
          if (window.history && window.history.length > 1) {
            window.history.back();
            return;
          }
          // fallback seguro
          location.href = 'index.html';
        });
        $a.attr('role', 'button');
        if (isIndexLink) $a.removeAttr('href');
      }
    });

    // Aquí debe permanecer intacta la inicialización de lightSlider que ya estaba
    // (la parte que configura $('[id="autoWidth"]') y $('[id="autoWidth2"]') y demás).
    // No repetirla aquí en la respuesta para evitar duplicados; se mantiene tal cual.
  });
})(jQuery);

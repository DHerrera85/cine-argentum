// ===============================
// Cine Argentum – LightSlider init
// Mantiene estructura de Argentina Content
// H: 1 completa + peek (NO TOCAR). V: móvil 2 por vista, mueve de a 1.
// ===============================
$(function () {

  // -------------------------------
  // HORIZONTALES
  // Desktop: 3 (o el ancho que tengas por CSS).
  // Tablet: 2. Móvil: 1 completa + peek (gracias a widths en CSS).
  // -------------------------------
  $('.slider-h').lightSlider({
    item: 3,
    slideMove: 1,
    slideMargin: 14,
    loop: false,
    pager: false,
    controls: true,
    enableTouch: true,
    enableDrag: true,
    freeMove: false,
    responsive: [
      { breakpoint: 1100, settings: { item: 2, slideMove: 1 } },
      { breakpoint: 768,  settings: { item: 1, slideMove: 1 } }
    ]
  });

  // -------------------------------
  // VERTICALES
  // Desktop: 6 -> 4 en tablet. Móvil: 2 por vista, mueve de a 1.
  // -------------------------------
  $('.slider-v').lightSlider({
    item: 6,
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

});

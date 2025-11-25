/*!
 * carousel.js — ScrollBy + scroll-snap para Argentina Content
 * Requisitos de HTML/CSS:
 *  - Contenedor:  <div class="carousel-wrap"> … <ul class="carousel …"> … </ul> … </div>
 *  - Botones:     <button class="car-btn prev"> y <button class="car-btn next">
 *  - CSS:         .carousel usa display:flex + gap + scroll-snap-type:x mandatory
 * Comportamiento:
 *  - Click prev/next -> desplaza exactamente 1 ítem (ancho del primer <li> + gap)
 *  - Accesibilidad: flechas ← → cuando el contenedor tiene foco
 *  - Botones se desactivan al llegar a extremos o cuando no son necesarios
 */

(function () {
  'use strict';

  const BP_MOBILE = 768;

  // Lee data-desktop / data-mobile del UL; por defecto 3 (H) / 1 (H en mobile) y 4 (V) / 2 (V en mobile)
  function getPerView(ul) {
    const dDesktop = parseInt(ul.getAttribute('data-desktop'), 10);
    const dMobile  = parseInt(ul.getAttribute('data-mobile'), 10);
    const desktop  = Number.isFinite(dDesktop) ? dDesktop : 3;
    const mobile   = Number.isFinite(dMobile)  ? dMobile  : 1;
    return (window.innerWidth <= BP_MOBILE) ? mobile : desktop;
  }

  // Obtiene el gap de la lista (flex gap)
  function getGapPx(list) {
    const cs = window.getComputedStyle(list);
    const g  = parseFloat(cs.columnGap || cs.gap || 0);
    return Number.isFinite(g) ? g : 0;
  }

  // Ancho de un paso: 1 tarjeta = ancho del primer <li> + gap
  function getStepPx(list) {
    const first = list.querySelector(':scope > li');
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    return rect.width + getGapPx(list);
  }

  // ¿Cuántos items hay?
  function getTotalItems(list) {
    return list.querySelectorAll(':scope > li').length;
  }

  // Actualiza estados de botones según posición de scroll
  function updateButtons(list, prevBtn, nextBtn) {
    if (!prevBtn || !nextBtn) return;

    const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth - 1);
    const atStart = list.scrollLeft <= 0;
    const atEnd   = list.scrollLeft >= maxScrollLeft;

    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
    prevBtn.setAttribute('aria-disabled', String(prevBtn.disabled));
    nextBtn.setAttribute('aria-disabled', String(nextBtn.disabled));
  }

  // Deshabilita ambos botones si no hacen falta (p.ej., pocos ítems)
  function maybeDisableAllWhenNotNeeded(list, prevBtn, nextBtn) {
    const perView   = getPerView(list);
    const total     = getTotalItems(list);
    const notNeeded = total <= perView;

    if (prevBtn) {
      prevBtn.disabled = notNeeded || prevBtn.disabled;
      prevBtn.setAttribute('aria-disabled', String(prevBtn.disabled));
    }
    if (nextBtn) {
      nextBtn.disabled = notNeeded || nextBtn.disabled;
      nextBtn.setAttribute('aria-disabled', String(nextBtn.disabled));
    }
  }

  // Desplaza 1 paso (1 tarjeta)
  function go(list, dir) {
    const step = getStepPx(list);
    if (step <= 0) return;

    list.scrollBy({
      left: dir * step,
      behavior: 'smooth'
    });
  }

  // Throttle con rAF para eventos de scroll
  function onScrollRaf(list, prevBtn, nextBtn) {
    let ticking = false;
    function handler() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateButtons(list, prevBtn, nextBtn);
          ticking = false;
        });
        ticking = true;
      }
    }
    list.addEventListener('scroll', handler, { passive: true });
    return () => list.removeEventListener('scroll', handler);
  }

  function initCarousel(wrap) {
    const list    = wrap.querySelector('.carousel');
    const prevBtn = wrap.querySelector('.car-btn.prev');
    const nextBtn = wrap.querySelector('.car-btn.next');
    if (!list) return;

    // Clicks
    prevBtn && prevBtn.addEventListener('click', () => go(list, -1));
    nextBtn && nextBtn.addEventListener('click', () => go(list, +1));

    // Teclado (cuando el wrap tiene foco)
    if (!wrap.hasAttribute('tabindex')) wrap.setAttribute('tabindex', '0');
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(list, -1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(list, +1); }
    });

    // Sync inicial de botones
    updateButtons(list, prevBtn, nextBtn);
    maybeDisableAllWhenNotNeeded(list, prevBtn, nextBtn);

    // rAF scroll observer
    const detachScroll = onScrollRaf(list, prevBtn, nextBtn);

    // Recalcular en resize/orientation
    let rTO;
    function onRelayout() {
      updateButtons(list, prevBtn, nextBtn);
      maybeDisableAllWhenNotNeeded(list, prevBtn, nextBtn);
    }
    function onResize() {
      clearTimeout(rTO);
      rTO = setTimeout(onRelayout, 120);
    }
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    // Limpieza si fuera necesario (no se usa en este caso)
    return function destroy() {
      detachScroll();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    document.querySelectorAll('.carousel-wrap').forEach(initCarousel);
  });
})();

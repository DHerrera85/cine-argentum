(function () {
  'use strict';

  function getDirectHeading(section) {
    return Array.prototype.find.call(
      section.children,
      function (element) {
        return element.matches(
          '.showcase-heading, .latest-heading'
        );
      }
    );
  }

  function getList(section) {
    return section.querySelector(
      'ul.slider-h, ul.slider-v'
    );
  }

  function countProductions(list) {
    if (!list) return 0;

    return Array.prototype.filter.call(
      list.children,
      function (element) {
        return (
          element.tagName === 'LI' &&
          !element.classList.contains('clone')
        );
      }
    ).length;
  }

  function updateCounter(section) {
    var list = getList(section);
    var counter = section.querySelector(
      '.juveniles-count'
    );

    if (!list || !counter) return;

    var total = countProductions(list);

    counter.textContent =
      total + (total === 1 ? ' serie' : ' series');

    counter.hidden = total === 0;
  }

  function enhanceSection(section) {
    var heading = getDirectHeading(section);
    var list = getList(section);

    if (!heading || !list) return;

    var headingContainer = document.createElement('div');
    headingContainer.className =
      'juveniles-section-heading';

    section.insertBefore(headingContainer, heading);
    headingContainer.appendChild(heading);

    var counter = document.createElement('span');
    counter.className = 'juveniles-count';
    counter.setAttribute('aria-live', 'polite');

    headingContainer.appendChild(counter);

    updateCounter(section);

    /*
     * Actualiza automáticamente el contador cuando
     * juveniles-platforms-autosync.js carga una fila.
     */
    var observer = new MutationObserver(function () {
      updateCounter(section);
    });

    observer.observe(list, {
      childList: true
    });
  }

  function initializeJuvenilesUI() {
    var sections = document.querySelectorAll(
      '.juveniles-section'
    );

    sections.forEach(enhanceSection);

    window.updateJuvenilesCounters = function () {
      sections.forEach(updateCounter);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initializeJuvenilesUI
    );
  } else {
    initializeJuvenilesUI();
  }
})();
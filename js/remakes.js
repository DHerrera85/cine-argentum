var dataVersion = '20260225-8';
fetch('data.json?v=' + dataVersion, { cache: 'no-store' })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    var items = (data && data.items) ? data.items : [];
    var remakesByCountry = new Map();
    var argentineShowsWithRemakes = [];

    items.forEach(function (item) {
      if (!item || !item.remakes || !item.remakes.length) return;
      var remakeCount = item.remakes.length;
      argentineShowsWithRemakes.push({
        title: item.title || '',
        id: item.id || '',
        image: item.image || '',
        remakeCount: remakeCount
      });
      item.remakes.forEach(function (remake) {
        if (!remake || !remake.country) return;
        var entry = {
          title: remake.title || '',
          country: remake.country || '',
          year: remake.year || '',
          image: remake.image || '',
          originalTitle: item.title || '',
          originalId: item.id || ''
        };
        if (!remakesByCountry.has(entry.country)) {
          remakesByCountry.set(entry.country, []);
        }
        remakesByCountry.get(entry.country).push(entry);
      });
    });

    var countries = Array.from(remakesByCountry.keys());
    countries.sort(function (a, b) {
      var countDiff = remakesByCountry.get(b).length - remakesByCountry.get(a).length;
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b, 'es');
    });

    argentineShowsWithRemakes.sort(function (a, b) {
      var countDiff = b.remakeCount - a.remakeCount;
      if (countDiff !== 0) return countDiff;
      return a.title.localeCompare(b.title, 'es');
    });

    var mostAdaptedContainer = document.getElementById('mostAdaptedContainer');
    if (argentineShowsWithRemakes.length > 0) {
      mostAdaptedContainer.innerHTML = '';
      var section = document.createElement('section');
      section.className = 'country-section';

      var header = document.createElement('div');
      header.className = 'country-header';
      var titleWrap = document.createElement('div');
      var title = document.createElement('h2');
      title.className = 'country-title';
      title.textContent = 'Ficciones con más adaptaciones';
      var count = document.createElement('div');
      count.className = 'country-count';
      count.textContent = argentineShowsWithRemakes.length + (argentineShowsWithRemakes.length === 1 ? ' ficción' : ' ficciones');
      titleWrap.appendChild(title);
      titleWrap.appendChild(count);

      var controls = document.createElement('div');
      controls.className = 'country-controls';
      var btnLeft = document.createElement('button');
      btnLeft.className = 'scroll-btn';
      btnLeft.type = 'button';
      btnLeft.setAttribute('aria-label', 'Desplazar a la izquierda');
      btnLeft.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
      var btnRight = document.createElement('button');
      btnRight.className = 'scroll-btn';
      btnRight.type = 'button';
      btnRight.setAttribute('aria-label', 'Desplazar a la derecha');
      btnRight.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
      controls.appendChild(btnLeft);
      controls.appendChild(btnRight);

      header.appendChild(titleWrap);
      header.appendChild(controls);

      var track = document.createElement('div');
      track.className = 'remakes-track';

      argentineShowsWithRemakes.forEach(function (show) {
        var card = document.createElement('a');
        card.className = 'remake-card';
        card.href = 'show.html?id=' + show.id;
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';

        var img = document.createElement('img');
        img.src = show.image;
        img.alt = show.title;

        var info = document.createElement('div');
        info.className = 'remake-info';

        var titleEl = document.createElement('div');
        titleEl.className = 'remake-title';
        titleEl.textContent = show.title;

        var meta = document.createElement('div');
        meta.className = 'remake-meta';
        meta.textContent = show.remakeCount + ' remake' + (show.remakeCount === 1 ? '' : 's');

        info.appendChild(titleEl);
        info.appendChild(meta);
        card.appendChild(img);
        card.appendChild(info);
        track.appendChild(card);
      });

      btnLeft.addEventListener('click', function () {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
      });
      btnRight.addEventListener('click', function () {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      });

      section.appendChild(header);
      section.appendChild(track);
      mostAdaptedContainer.appendChild(section);
    }

    var container = document.getElementById('remakesRows');
    container.innerHTML = '';

    countries.forEach(function (country) {
      var remakes = remakesByCountry.get(country);
      remakes.sort(function (a, b) {
        var ay = parseInt(a.year, 10) || 0;
        var by = parseInt(b.year, 10) || 0;
        return ay - by;
      });

      var section = document.createElement('section');
      section.className = 'country-section';

      var header = document.createElement('div');
      header.className = 'country-header';

      var titleWrap = document.createElement('div');
      var title = document.createElement('h2');
      title.className = 'country-title';
      title.textContent = country;
      var count = document.createElement('div');
      count.className = 'country-count';
      count.textContent = remakes.length + ' remake' + (remakes.length === 1 ? '' : 's');
      titleWrap.appendChild(title);
      titleWrap.appendChild(count);

      var controls = document.createElement('div');
      controls.className = 'country-controls';
      var btnLeft = document.createElement('button');
      btnLeft.className = 'scroll-btn';
      btnLeft.type = 'button';
      btnLeft.setAttribute('aria-label', 'Desplazar a la izquierda');
      btnLeft.innerHTML = '<i class="fas fa-chevron-left" aria-hidden="true"></i>';
      var btnRight = document.createElement('button');
      btnRight.className = 'scroll-btn';
      btnRight.type = 'button';
      btnRight.setAttribute('aria-label', 'Desplazar a la derecha');
      btnRight.innerHTML = '<i class="fas fa-chevron-right" aria-hidden="true"></i>';
      controls.appendChild(btnLeft);
      controls.appendChild(btnRight);

      header.appendChild(titleWrap);
      header.appendChild(controls);

      var track = document.createElement('div');
      track.className = 'remakes-track';

      remakes.forEach(function (remake) {
        var card = document.createElement('div');
        card.className = 'remake-card';

        var img = document.createElement('img');
        img.src = remake.image;
        img.alt = remake.title + ' (' + remake.country + ' ' + remake.year + ')';

        var info = document.createElement('div');
        info.className = 'remake-info';

        var titleEl = document.createElement('div');
        titleEl.className = 'remake-title';
        titleEl.textContent = remake.title;

        var meta = document.createElement('div');
        meta.className = 'remake-meta';
        meta.textContent = remake.country + ' · ' + remake.year;

        info.appendChild(titleEl);
        info.appendChild(meta);

        if (remake.originalTitle) {
          var origin = document.createElement('a');
          origin.className = 'remake-origin';
          origin.textContent = 'Basada en: ' + remake.originalTitle;
          if (remake.originalId) {
            origin.href = 'show.html?id=' + remake.originalId;
          } else {
            origin.href = '#';
          }
          info.appendChild(origin);
        }

        card.appendChild(img);
        card.appendChild(info);
        track.appendChild(card);
      });

      btnLeft.addEventListener('click', function () {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
      });
      btnRight.addEventListener('click', function () {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
      });

      section.appendChild(header);
      section.appendChild(track);
      container.appendChild(section);
    });
  });

// js/disney+.js: Lógica para filtrar y mostrar series de Disney+
const disneyDataVersion = '20260604-2';

fetch('data.json?v=' + disneyDataVersion, { cache: 'no-store' })
  .then(response => response.json())
  .then(data => {
    const items = data.items.filter(item => {
      const channel = (item.channel || '').toLowerCase();
      if (!channel) return false;
      const isDisney = channel.includes('disney+') || channel.includes('disney plus');
      if (!isDisney) return false;
      return item.type !== 'pelicula';
    });
    renderSeries(items);
    setupFilters(items);
  });

function renderSeries(series) {
  const container = document.getElementById('actorMoviesList');
  container.innerHTML = '';
  series.forEach(item => {
    const card = document.createElement('div');
    card.className = 'actor-movie-card';
    const rawTipoEmision = item.tipo_emision ? String(item.tipo_emision).trim() : '';
    const tipoEmision = rawTipoEmision.toLowerCase() === 'serie' ? '' : rawTipoEmision;
    card.innerHTML = `
      <a href="show.html?id=${item.id}">
        <img src="${item.image}" alt="${item.title}">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${item.title}</div>
          <div class="actor-movie-meta">${item.year} · ${item.genre || ''}</div>
          ${tipoEmision ? `<div class="actor-movie-meta" style="color:#b0b0b0;">${tipoEmision}</div>` : ''}
        </div>
      </a>
    `;
    container.appendChild(card);
  });
}

function setupFilters(allSeries) {
  const select = document.getElementById('actorSortCustom');
  const selectOptions = select.querySelector('.custom-select-options');
  const selectSelected = select.querySelector('.custom-select-selected');
  let currentSort = 'year';

  function extractYearFromDate(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw || raw === '-') return null;

    const parts = raw.split('/');
    if (parts.length === 3) {
      const y = parseInt(parts[2], 10);
      return Number.isFinite(y) ? y : null;
    }

    const direct = parseInt(raw, 10);
    return Number.isFinite(direct) ? direct : null;
  }

  function parseDateToTimestamp(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw || raw === '-') return null;

    const parts = raw.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;

    return Date.UTC(year, month - 1, day);
  }

  function getSortKey(item) {
    let maxSeasonTs = null;

    if (Array.isArray(item.temporadas) && item.temporadas.length) {
      item.temporadas.forEach(season => {
        if (!season || typeof season !== 'object') return;
        const ts = parseDateToTimestamp(season.release_date || season.fecha_estreno);
        if (ts !== null && (maxSeasonTs === null || ts > maxSeasonTs)) {
          maxSeasonTs = ts;
        }
      });
    }

    if (maxSeasonTs !== null) {
      return {
        year: new Date(maxSeasonTs).getUTCFullYear(),
        hasExactDate: 1,
        timestamp: maxSeasonTs
      };
    }

    const ownTs = parseDateToTimestamp(item.release_date || item.fecha_estreno);
    if (ownTs !== null) {
      return {
        year: new Date(ownTs).getUTCFullYear(),
        hasExactDate: 1,
        timestamp: ownTs
      };
    }

    const fallbackYear = extractYearFromDate(item.year) || 0;
    return {
      year: fallbackYear,
      hasExactDate: 0,
      timestamp: 0
    };
  }

  function sortByComputedYearDesc(a, b) {
    const aKey = getSortKey(a);
    const bKey = getSortKey(b);

    if (bKey.year !== aKey.year) return bKey.year - aKey.year;
    if (bKey.hasExactDate !== aKey.hasExactDate) return bKey.hasExactDate - aKey.hasExactDate;
    if (bKey.timestamp !== aKey.timestamp) return bKey.timestamp - aKey.timestamp;

    return String(a.title || '').localeCompare(String(b.title || ''));
  }

  function sortByComputedYearAsc(a, b) {
    const aKey = getSortKey(a);
    const bKey = getSortKey(b);

    if (aKey.year !== bKey.year) return aKey.year - bKey.year;
    if (bKey.hasExactDate !== aKey.hasExactDate) return bKey.hasExactDate - aKey.hasExactDate;
    if (aKey.timestamp !== bKey.timestamp) return aKey.timestamp - bKey.timestamp;

    return String(a.title || '').localeCompare(String(b.title || ''));
  }

  function normalizeGenre(value) {
    return value ? value.trim().toLowerCase() : '';
  }

  function displayGenre(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function sortAndFilter(list, sort) {
    let filtered = [...list];
    filtered = filtered.map(item => ({ ...item, genre: normalizeGenre(item.genre) }));

    if (sort === 'year') {
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'year-asc') {
      filtered.sort(sortByComputedYearAsc);
    } else if (sort === 'comedias') {
      filtered = filtered.filter(item => item.genre === 'comedia');
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'telenovelas') {
      filtered = filtered.filter(item => item.genre === 'telenovela');
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'juveniles') {
      filtered = filtered.filter(item => item.genre === 'juvenil');
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'sitcoms') {
      filtered = filtered.filter(item => item.genre === 'sitcom');
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'policiales') {
      filtered = filtered.filter(item => item.genre === 'thriller' || item.genre === 'policial');
      filtered.sort(sortByComputedYearDesc);
    } else if (sort === 'unitarios') {
      filtered = filtered.filter(item => item.genre === 'drama' || (item.tipo_emision && item.tipo_emision.toLowerCase().includes('unitario')));
      filtered.sort(sortByComputedYearDesc);
    }

    filtered = filtered.map(item => ({ ...item, genre: displayGenre(item.genre) }));
    return filtered;
  }

  function renderFiltered() {
    const filtered = sortAndFilter(allSeries, currentSort);
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de Disney+`;
    renderSeries(filtered);
  }

  select.addEventListener('click', function() {
    select.classList.toggle('open');
    selectOptions.style.display = select.classList.contains('open') ? 'block' : 'none';
  });
  select.addEventListener('blur', function() {
    select.classList.remove('open');
    selectOptions.style.display = 'none';
  });
  selectOptions.addEventListener('click', function(e) {
    if (e.target.tagName === 'LI') {
      selectOptions.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      e.target.classList.add('selected');
      selectSelected.textContent = e.target.textContent;
      currentSort = e.target.getAttribute('data-value');
      renderFiltered();
    }
  });
  renderFiltered();
}

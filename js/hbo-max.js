// js/hbo-max.js: Lógica para filtrar y mostrar series de HBO Max

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const items = data.items.filter(item => {
      const channel = (item.channel || '').toLowerCase();
      if (!channel) return false;
      const isHbo = channel.includes('hbo max');
      if (!isHbo) return false;
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
    const tipoEmision = item.tipo_emision ? item.tipo_emision : '';
    card.innerHTML = `
      <a href="show.html?id=${item.id}">
        <img src="${item.image}" alt="${item.title}">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${item.title}</div>
          <div class="actor-movie-meta">${item.year} · ${item.genre || ''}</div>
          <div class="actor-movie-meta" style="color:#b0b0b0;">${tipoEmision}</div>
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
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'year-asc') {
      filtered.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    } else if (sort === 'comedias') {
      filtered = filtered.filter(item => item.genre === 'comedia');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'telenovelas') {
      filtered = filtered.filter(item => item.genre === 'telenovela');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'juveniles') {
      filtered = filtered.filter(item => item.genre === 'juvenil');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'sitcoms') {
      filtered = filtered.filter(item => item.genre === 'sitcom');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'policiales') {
      filtered = filtered.filter(item => item.genre === 'thriller' || item.genre === 'policial');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'unitarios') {
      filtered = filtered.filter(item => item.genre === 'drama' || (item.tipo_emision && item.tipo_emision.toLowerCase().includes('unitario')));
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    }

    filtered = filtered.map(item => ({ ...item, genre: displayGenre(item.genre) }));
    return filtered;
  }

  function renderFiltered() {
    const filtered = sortAndFilter(allSeries, currentSort);
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de HBO Max`;
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

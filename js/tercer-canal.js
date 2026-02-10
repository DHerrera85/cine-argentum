// js/tercer-canal.js: Series combinadas de Canal 9, America y TV Publica

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const items = data.items.filter(item => {
      const channel = (item.channel || '').toLowerCase();
      if (!channel) return false;
      return (
        channel.includes('canal 9') ||
        channel.includes('azul tv') ||
        channel.includes('america') ||
        channel.includes('américa') ||
        channel.includes('tv pública') ||
        channel.includes('tv publica') ||
        channel.includes('canal 7')
      );
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
    const ratingText = item.rating ? item.rating : '-';
    card.innerHTML = `
      <a href="show.html?id=${item.id}">
        <img src="${item.image}" alt="${item.title}">
        <div class="actor-movie-info">
          <div class="actor-movie-title">${item.title}</div>
          <div class="actor-movie-meta">${item.year} · ${item.genre || ''}</div>
          <div class="actor-movie-viewers">Rating: ${ratingText}</div>
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
  let currentSort = 'viewers';

  function parseRating(val) {
    if (!val || val === '-' || val === '') return -Infinity;
    const numStr = String(val).replace(',', '.');
    const num = parseFloat(numStr);
    return Number.isNaN(num) ? -Infinity : num;
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

    if (sort === 'viewers') {
      filtered.sort((a, b) => parseRating(b.rating) - parseRating(a.rating));
    } else if (sort === 'year') {
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'year-asc') {
      filtered.sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    } else if (sort.startsWith('decada-')) {
      let start = 0, end = 0;
      if (sort === 'decada-2000') { start = 2000; end = 2009; }
      else if (sort === 'decada-2010') { start = 2010; end = 2019; }
      else if (sort === 'decada-2020') { start = 2020; end = 2029; }
      filtered = filtered.filter(item => {
        const y = parseInt(item.year);
        return y >= start && y <= end;
      });
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
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de Tercer Canal`;
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

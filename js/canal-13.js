// js/canal-13.js: Lógica para filtrar y mostrar series de Canal 13, basado en js/telefe.js

// Cargar data.json y filtrar por Canal 13
const flowCoproducciones = ["V228", "V227", "V225", "V223", "V222", "V221"];

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const items = data.items.filter(item =>
      (item.channel && item.channel.toLowerCase().includes('canal 13')) ||
      (item.channel && item.channel.toLowerCase().includes('el trece')) ||
      (item.channel && item.channel.toLowerCase().includes('flow') && flowCoproducciones.includes(item.id))
    );
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
          <div class="actor-movie-viewers">Rating: ${item.rating ? item.rating : '-'}</div>
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

  function sortAndFilter(list, sort) {
    let filtered = [...list];
    filtered = filtered.map(item => ({ ...item, genre: item.genre ? item.genre.trim().toLowerCase() : '' }));
    if (sort === 'viewers') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
    filtered = filtered.map(item => ({ ...item, genre: item.genre.charAt(0).toUpperCase() + item.genre.slice(1) }));
    return filtered;
  }

  function renderFiltered() {
    const filtered = sortAndFilter(allSeries, currentSort);
    document.getElementById('actor-movie-count').textContent = `${filtered.length} series de Canal 13`;
    renderSeries(filtered);
  }

  select.addEventListener('click', function(e) {
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

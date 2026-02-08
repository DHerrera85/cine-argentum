// telefe.js - Renderiza las series de Telefe con filtros avanzados

// Cargar data.json y filtrar solo series de Telefe
document.addEventListener('DOMContentLoaded', async function() {
  const grid = document.getElementById('actorMoviesList');
  const count = document.getElementById('actor-movie-count');
  let series = [];
  // Listado estricto de series Telefe (título, año, género)
    const telefeList = [
      { id: 'V149', year: '2000', title: 'Chiquititas', genre: 'Juvenil' },
     { year: '2000', title: "Verano del '98", genre: 'Juvenil' },
    { year: '2000', title: 'Luna Salvaje', genre: 'Telenovela' },
    { year: '2001', title: 'EnAmorArte', genre: 'Juvenil' },
    { year: '2001', title: 'Yago, Pasión Morena', genre: 'Telenovela' },
    { year: '2001', title: 'Provócame', genre: 'Telenovela' },
    { year: '2002', title: 'Franco Buenaventura, el Profe', genre: 'Telenovela' },
    { year: '2002', title: 'Kachorra', genre: 'Telenovela' },
    { year: '2002', title: 'Máximo Corazón', genre: 'Telenovela' },
    { year: '2003', title: 'Costumbres Argentinas', genre: 'Comedia' },
    { year: '2003', title: 'Resistiré', genre: 'Telenovela' },
    { year: '2004', title: 'Culpable de este Amor', genre: 'Telenovela' },
    { year: '2004', title: 'La Niñera', genre: 'Sitcom' },
    { year: '2004', title: 'Los Roldán', genre: 'Comedia' },
    { year: '2004', title: 'Frecuencia 04', genre: 'Juvenil' },
    { year: '2004', title: 'El Deseo', genre: 'Telenovela' },
    { year: '2005', title: 'Amor en Custodia', genre: 'Telenovela' },
    { year: '2005', title: 'Amor Mio', genre: 'Sitcom' },
    { year: '2005', title: 'Casados con Hijos', genre: 'Sitcom' },
    { year: '2005', title: '¿Quién es el Jefe?', genre: 'Sitcom' },
    { year: '2005', title: 'Se Dice Amor', genre: 'Telenovela' },
    { year: '2006', title: 'Alma Pirata', genre: 'Juvenil' },
    { year: '2006', title: 'Chiquititas 2006', genre: 'Juvenil' },
    { year: '2006', title: 'Montecristo', genre: 'Thriller' },
    { year: '2006', title: 'La Ley del Amor', genre: 'Telenovela' },
    { year: '2007', title: 'Hechizada', genre: 'Sitcom' },
    { year: '2007', title: 'Casi Angeles', genre: 'Juvenil' },
    { year: '2007', title: 'El Capo', genre: 'Telenovela' },
    { year: '2008', title: 'B&B', genre: 'Juvenil' },
    { year: '2008', title: 'Aquí no hay quien Viva', genre: 'Comedia' },
    { year: '2008', title: 'Una de Dos', genre: 'Sitcom' },
    { year: '2008', title: 'Vidas Robadas', genre: 'Telenovela' },
    { year: '2008', title: 'Don Juan y su Bella Dama', genre: 'Telenovela' },
    { year: '2008', title: 'Los Exitosos Pells', genre: 'Comedia' },
    { year: '2009', title: 'Herencia de Amor', genre: 'Telenovela' },
    { year: '2009', title: 'Nini', genre: 'Juvenil' },
    { year: '2009', title: 'Botineras', genre: 'Thriller' },
    { year: '2010', title: 'Secretos de Amor', genre: 'Telenovela' },
    { year: '2010', title: 'Cain & Abel', genre: 'Thriller' },
    { year: '2011', title: 'El Elegido', genre: 'Thriller' },
    { year: '2011', title: 'Un Año para Recordar', genre: 'Comedia' },
    { year: '2011', title: 'Cuando me sonreis', genre: 'Sitcom' },
    { year: '2011', title: 'Supertorpe', genre: 'Juvenil' },
    { year: '2012', title: 'Dulce Amor', genre: 'Telenovela' },
    { year: '2012', title: 'Graduados', genre: 'Comedia' },
    { year: '2012', title: 'Mi Amor Mi Amor', genre: 'Comedia' },
    { year: '2013', title: 'Los Vecinos en Guerra', genre: 'Comedia' },
    { year: '2013', title: 'Aliados', genre: 'Juvenil' },
    { year: '2013', title: 'Taxxi Amores Cruzados', genre: 'Telenovela' },
    { year: '2014', title: 'Somos Familia', genre: 'Telenovela' },
    { year: '2014', title: 'Señores Papis', genre: 'Telenovela' },
    { year: '2014', title: 'Camino al Amor', genre: 'Telenovela' },
    { year: '2014', title: 'Viudas e Hijos del Rock & Roll', genre: 'Comedia' },
    { year: '2015', title: 'Entre Canibales', genre: 'Thriller' },
    { year: '2016', title: 'La Leona', genre: 'Thriller' },
    { year: '2016', title: 'Educando a Nina', genre: 'Comedia' },
    { year: '2016', title: 'Loco x Vos', genre: 'Sitcom' },
    { year: '2016', title: 'Por Amarte Asi', genre: 'Telenovela' },
    { year: '2017', title: 'Amar Después de Amar', genre: 'Thriller' },
    { year: '2017', title: 'El Regreso de Lucas', genre: 'Thriller' },
    { year: '2017', title: 'Fanny, la Fan', genre: 'Comedia' },
    { year: '2017', title: 'Golpe al Corazón', genre: 'Telenovela' },
    { year: '2018', title: 'Cien Dias para Enamorarse', genre: 'Comedia' },
    { year: '2019', title: 'Campanas en la Noche', genre: 'Thriller' },
    { year: '2019', title: 'Pequeña Victoria', genre: 'Comedia' },
    { year: '2022', title: 'El Primero de Nosotros', genre: 'Telenovela' },
    { year: '2018', title: 'Sandro, la Serie', genre: 'Drama' },
    { year: '2015', title: 'Historia de un Clan', genre: 'Thriller' },
    { year: '2011', title: 'El Hombre de tu Vida', genre: 'Comedia' },
    { year: '2019', title: 'Atrapa a un Ladrón', genre: 'Comedia' },
    { year: '2019', title: 'Inconvivencia', genre: 'Drama' },
    { year: '2018', title: 'Morir de Amor', genre: 'Thriller' },
    { year: '2017', title: 'Un Gallo para Esculapio', genre: 'Thriller' },
    { year: '2006', title: 'Hermanos y Detectives', genre: 'Thriller' },
    { year: '2004', title: 'Sangre Fría', genre: 'Thriller' },
    { year: '2002', title: 'Los Simuladores', genre: 'Thriller' },
    { year: '2001', title: 'El Hacker', genre: 'Thriller' },
    { year: '2005', title: 'Ambiciones', genre: 'Thriller' },
    { year: '2004', title: 'Historias de Sexo de Gente Común', genre: 'Drama' },
    { year: '2003', title: 'Disputas', genre: 'Thriller' },
    { year: '2001', title: 'Cuatro Amigas', genre: 'Drama' },
    { year: '2013', title: 'Qitapenas', genre: 'Comedia' },
    { year: '2012', title: 'El Donante', genre: 'Comedia' },
    { year: '2012', title: 'Mi Problema con las Mujeres', genre: 'Comedia' },
    { year: '2009', title: 'Acompañantes', genre: 'Comedia' },
    { year: '2004', title: 'Mosca & Smith en el Once', genre: 'Comedia' },
    { year: '2003', title: 'Tres Padres Solteros', genre: 'Comedia' },
    { year: '2013', title: 'Historias de Diván', genre: 'Drama' },
    { year: '2013', title: 'Historias de Corazón', genre: 'Drama' },
    { year: '2006', title: 'Al Límite', genre: 'Thriller' },
    { year: '2002', title: 'Infieles', genre: 'Thriller' },
    { year: '2000', title: 'Tiempo Final', genre: 'Thriller' }
  ];
  try {
    const res = await fetch('data.json');
    const data = await res.json();
    // Filtrar solo los títulos del listado estricto
    series = telefeList.map(ref => {
      const item = ref.id
        ? data.items.find(i => i.id === ref.id)
        : data.items.find(i => i.title && i.title.trim().toLowerCase() === ref.title.trim().toLowerCase() && String(i.year) === ref.year);
      let base = item ? { ...item, title: ref.title, genre: ref.genre, year: ref.year } : {
        title: ref.title,
        genre: ref.genre,
        year: ref.year,
        image: 'images/verticals/no-poster.png',
        viewers: '-',
        type: 'serie',
        channel: 'Telefe',
      };
      // Asignar imágenes personalizadas si corresponde
      const imgOverrides = {
        'Chiquititas|2000': 'images/verticals/chiquititas2000-poster-280x420.png',
        'Máximo Corazón|2002': 'images/verticals/maximo-corazon-poster-280x420.png',
        'Los Roldán|2004': 'images/verticals/los-roldan-poster-280x-420.png',
        'Amor Mio|2005': 'images/verticals/amor-mio-poster-280x420.png',
        'Chiquititas 2006|2006': 'images/verticals/chiquititas-poster-280x420.png',
        'La Ley del Amor|2006': 'images/verticals/la-ley-del-amor-poster-280x420.png',
        'Casi Angeles|2007': 'images/verticals/casi-angeles-poster-280x420.png',
        'B&B|2008': 'images/verticals/byb-poster-280x420.png',
        'Nini|2009': 'images/verticals/nini-poster-280x420.png',
        'Cain & Abel|2010': 'images/verticals/cain-abel-poster-280x420.png',
        'Cuando me sonreis|2011': 'images/verticals/cuando-me-sonreis-poster-420x280.png',
        'Supertorpe|2011': 'images/verticals/supertorpe-poster-280x420.png',
        'Mi Amor Mi Amor|2012': 'images/verticals/mi-amor-mi-amor-poster-280x420.png',
        'Taxxi Amores Cruzados|2013': 'images/verticals/taxxi-amores-cruzados-280x420.png',
        'Entre Canibales|2015': 'images/verticals/entre-canibales-poster-280x420.png',
        'Loco x Vos|2016': 'images/verticals/loco-por-vos-poster-280x420.png',
        'Por Amarte Asi|2016': 'images/verticals/por-amarte-asi-poster-280x420.png',
        'El Regreso de Lucas|2017': 'images/verticals/el-regreso-de-lucas-poster-280x420.png',
        'Cien Dias para Enamorarse|2018': 'images/verticals/100-Dias-para-enamorarse-poster-280x420.png',
        'Sandro, la Serie|2018': 'images/verticals/sandro-la-serie-poster-280x420.png',
        'Un Gallo para Esculapio|2017': 'images/verticals/un-gallo-para-esculapio-poster-280x420.png',
        'Sangre Fría|2004': 'images/verticals/sangre-fria-poster-280x420.png',
        'Historias de Sexo de Gente Común|2004': 'images/verticals/historias-de-sexo-gente-comun-poster-280x420.png',
        'Acompañantes|2009': 'images/verticals/acompanantes-poster-280x420.png',
        'Mosca & Smith en el Once|2004': 'images/verticals/mosca-smith-poster-280x420.png',
        'Historias de Corazón|2013': 'images/verticals/historias-de-corazon-poster-280x420.png',
      };
      const key = `${ref.title}|${ref.year}`;
      if (imgOverrides[key]) base.image = imgOverrides[key];
      return base;
    });
  } catch (e) {
    count.textContent = 'Error cargando las series.';
    return;
  }

  // Filtros y orden
  const select = document.getElementById('actorSortCustom');
  const selectOptions = select.querySelector('.custom-select-options');
  const selectSelected = select.querySelector('.custom-select-selected');
  let currentSort = 'viewers';

  function formatRating(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return String(value).replace('.', ',');
    return String(value);
  }

  function parseRating(value) {
    if (value === null || value === undefined || value === '' || value === '-') return -Infinity;
    const numStr = String(value).replace(',', '.');
    const num = parseFloat(numStr);
    return Number.isNaN(num) ? -Infinity : num;
  }

  function renderList(list) {
    grid.innerHTML = '';
    if (!list.length) {
      count.textContent = 'No se encontraron series.';
      return;
    }
    count.textContent = `${list.length} series de Telefe`;
    for (const item of list) {
      const year = item.year || '';
      const ratingText = formatRating(item.rating);
      const img = item.image || 'images/verticals/no-poster.png';
      const card = document.createElement('div');
      card.className = 'actor-movie-card';
      const linkStart = item.id ? `<a href="show.html?id=${encodeURIComponent(item.id)}">` : '';
      const linkEnd = item.id ? '</a>' : '';
      card.innerHTML = `
        ${linkStart}
          <img src="${img}" alt="${item.title}" loading="lazy" />
          <div class="actor-movie-info">
            <div class="actor-movie-title">${item.title}</div>
            <div class="actor-movie-meta">${year} · ${item.genre || ''}</div>
            <div class="actor-movie-viewers">Rating: ${ratingText}</div>
          </div>
        ${linkEnd}
      `;
      grid.appendChild(card);
    }
  }

  function sortAndFilter(list, sort) {
    let filtered = [...list];
    // Normalizar género para todos los items (por si hay diferencias de mayúsculas/minúsculas)
    filtered = filtered.map(item => ({ ...item, genre: item.genre ? item.genre.trim().toLowerCase() : '' }));
    if (sort === 'viewers') {
      filtered.sort((a, b) => parseRating(b.rating) - parseRating(a.rating));
    } else if (sort === 'year') {
      filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sort === 'year-asc') {
      filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sort.startsWith('decada-')) {
      // Rango de décadas: 2000-2009, 2010-2019, 2020-2029
      let start = 0, end = 0;
      if (sort === 'decada-2000') { start = 2000; end = 2009; }
      else if (sort === 'decada-2010') { start = 2010; end = 2019; }
      else if (sort === 'decada-2020') { start = 2020; end = 2029; }
      filtered = filtered.filter(item => {
        const y = parseInt(item.year);
        return y >= start && y <= end;
      });
      filtered.sort((a, b) => (a.year || 0) - (b.year || 0)); // ascendente: más antigua primero
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
      filtered = filtered.filter(item => item.genre === 'drama' || item.type === 'unitario');
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    }
    // Restaurar género capitalizado para visualización
    filtered = filtered.map(item => ({ ...item, genre: item.genre.charAt(0).toUpperCase() + item.genre.slice(1) }));
    return filtered;
  }

  // Custom select logic
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
      renderList(sortAndFilter(series, currentSort));
      select.classList.remove('open');
      selectOptions.style.display = 'none';
    }
  });
  // Cerrar select si se hace click fuera
  document.addEventListener('click', function(e) {
    if (!select.contains(e.target)) {
      select.classList.remove('open');
      selectOptions.style.display = 'none';
    }
  });

  // Inicial
  renderList(sortAndFilter(series, currentSort));
});

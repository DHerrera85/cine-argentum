// telefe.js - Renderiza las series de Telefe con filtros avanzados
const telefeDataVersion = '20260227-2';

// Cargar data.json y filtrar solo series de Telefe
document.addEventListener('DOMContentLoaded', async function() {
  const grid = document.getElementById('actorMoviesList');
  const count = document.getElementById('actor-movie-count');
  let series = [];
  // Listado estricto de series Telefe (título, año, género)
    const telefeList = [
      { id: 'V149', year: '2000', title: 'Chiquititas', genre: 'Juvenil' },
    { year: '2000', title: "Verano del '98", genre: 'Juvenil' },
      { id: 'v75', year: '2000', title: 'Luna Salvaje', genre: 'Telenovela' },
      { id: 'V162', year: '2001', title: 'EnAmorArte', genre: 'Juvenil' },
      { id: 'v63', year: '2001', title: 'Yago, Pasión Morena', genre: 'Telenovela' },
      { id: 'v64', year: '2001', title: 'Provócame', genre: 'Telenovela' },
      { id: 'v95', year: '2002', title: 'Franco Buenaventura, el Profe', genre: 'Telenovela' },
      { id: 'v77', year: '2002', title: 'Kachorra', genre: 'Telenovela' },
      { id: 'v78', year: '2002', title: 'Máximo Corazón', genre: 'Telenovela' },
      { id: 'v99', year: '2003', title: 'Costumbres Argentinas', genre: 'Comedia' },
      { id: 'v10', year: '2003', title: 'Resistiré', genre: 'Telenovela' },
      { id: 'v80', year: '2004', title: 'Culpable de este Amor', genre: 'Telenovela' },
      { id: 'v43', year: '2004', title: 'La Niñera', genre: 'Sitcom' },
      { id: 'h8', year: '2004', title: 'Los Roldán', genre: 'Comedia' },
      { id: 'V161', year: '2004', title: 'Frecuencia 04', genre: 'Juvenil' },
      { id: 'v101', year: '2004', title: 'El Deseo', genre: 'Telenovela' },
      { id: 'v49', year: '2005', title: 'Amor en Custodia', genre: 'Telenovela' },
    { id: 'v46', year: '2005', title: 'Amor Mio', genre: 'Sitcom' },
    { id: 'h3', year: '2005', title: 'Casados con Hijos', genre: 'Sitcom' },
    { id: 'v47', year: '2005', title: '¿Quién es el Jefe?', genre: 'Sitcom' },
    { id: 'v84', year: '2005', title: 'Se Dice Amor', genre: 'Telenovela' },
    { id: 'V143', year: '2006', title: 'Alma Pirata', genre: 'Juvenil' },
    { id: 'V144', year: '2006', title: 'Chiquititas 2006', genre: 'Juvenil' },
    { id: 'v11', year: '2006', title: 'Montecristo', genre: 'Thriller' },
    { id: 'v51', year: '2006', title: 'La Ley del Amor', genre: 'Telenovela' },
    { id: 'v106', year: '2007', title: 'Hechizada', genre: 'Sitcom' },
    { id: 'V142', year: '2007', title: 'Casi Angeles', genre: 'Juvenil' },
    { id: 'v107', year: '2007', title: 'El Capo', genre: 'Telenovela' },
    { id: 'V141', year: '2008', title: 'B&B', genre: 'Juvenil' },
    { id: 'v45', year: '2008', title: 'Aquí no hay quien Viva', genre: 'Comedia' },
    { id: 'v108', year: '2008', title: 'Una de Dos', genre: 'Sitcom' },
    { id: 'v13', year: '2008', title: 'Vidas Robadas', genre: 'Telenovela' },
    { id: 'v52', year: '2008', title: 'Don Juan y su Bella Dama', genre: 'Telenovela' },
    { id: 'v4', year: '2008', title: 'Los Exitosos Pells', genre: 'Comedia' },
    { id: 'v53', year: '2009', title: 'Herencia de Amor', genre: 'Telenovela' },
    { id: 'V151', year: '2009', title: 'Nini', genre: 'Juvenil' },
    { id: 'v34', year: '2009', title: 'Botineras', genre: 'Thriller' },
    { id: 'v54', year: '2010', title: 'Secretos de Amor', genre: 'Telenovela' },
    { id: 'v16', year: '2010', title: 'Cain & Abel', genre: 'Thriller' },
    { id: 'v15', year: '2011', title: 'El Elegido', genre: 'Thriller' },
    { id: 'v57', year: '2011', title: 'Un Año para Recordar', genre: 'Comedia' },
    { id: 'v44', year: '2011', title: 'Cuando me sonreis', genre: 'Sitcom' },
    { id: 'V164', year: '2011', title: 'Supertorpe', genre: 'Juvenil' },
    { id: 'v71', year: '2012', title: 'Dulce Amor', genre: 'Telenovela' },
    { id: 'h7', year: '2012', title: 'Graduados', genre: 'Comedia' },
    { id: 'V290', year: '2012', title: 'Mi Amor Mi Amor', genre: 'Comedia' },
    { id: 'V293', year: '2012', title: 'La Dueña', genre: 'Thriller' },
    { id: 'v8', year: '2013', title: 'Los Vecinos en Guerra', genre: 'Comedia' },
    { id: 'V139', year: '2013', title: 'Aliados', genre: 'Juvenil' },
    { id: 'v61', year: '2013', title: 'Taxxi Amores Cruzados', genre: 'Telenovela' },
    { id: 'v24', year: '2014', title: 'Somos Familia', genre: 'Telenovela' },
    { id: 'v5', year: '2014', title: 'Señores Papis', genre: 'Telenovela' },
    { id: 'v73', year: '2014', title: 'Camino al Amor', genre: 'Telenovela' },
    { id: 'v7', year: '2014', title: 'Viudas e Hijos del Rock & Roll', genre: 'Comedia' },
    { id: 'v12', year: '2015', title: 'Entre Canibales', genre: 'Thriller' },
    { id: 'h9', year: '2016', title: 'La Leona', genre: 'Thriller' },
    { id: 'v1', year: '2016', title: 'Educando a Nina', genre: 'Comedia' },
    { id: 'v42', year: '2016', title: 'Loco x Vos', genre: 'Sitcom' },
    { id: 'v50', year: '2016', title: 'Por Amarte Asi', genre: 'Telenovela' },
    { id: 'v9', year: '2017', title: 'Amar Después de Amar', genre: 'Thriller' },
    { id: 'v60', year: '2017', title: 'El Regreso de Lucas', genre: 'Thriller' },
    { id: 'v23', year: '2017', title: 'Fanny, la Fan', genre: 'Comedia' },
    { id: 'v72', year: '2017', title: 'Golpe al Corazón', genre: 'Telenovela' },
    { id: 'h6', year: '2018', title: 'Cien Dias para Enamorarse', genre: 'Comedia' },
    { id: 'v14', year: '2019', title: 'Campanas en la Noche', genre: 'Thriller' },
    { id: 'v28', year: '2019', title: 'Pequeña Victoria', genre: 'Comedia' },
    { id: 'h2', year: '2022', title: 'El Primero de Nosotros', genre: 'Telenovela' },
    { id: 'V248', year: '2018', title: 'Sandro, la Serie', genre: 'Drama' },
    { id: 'V232', year: '2015', title: 'Historia de un Clan', genre: 'Thriller' },
    { id: 'V264', year: '2011', title: 'El Hombre de tu Vida', genre: 'Comedia' },
    { id: 'V219', year: '2019', title: 'Atrapa a un Ladrón', genre: 'Comedia' },
    { id: 'V220', year: '2019', title: 'Inconvivencia', genre: 'Drama' },
    { id: 'V224', year: '2018', title: 'Morir de Amor', genre: 'Thriller' },
    { id: 'V230', year: '2017', title: 'Un Gallo para Esculapio', genre: 'Thriller' },
    { id: 'V242', year: '2006', title: 'Hermanos y Detectives', genre: 'Thriller' },
    { id: 'V244', year: '2004', title: 'Sangre Fría', genre: 'Thriller' },
    { id: 'V245', year: '2002', title: 'Los Simuladores', genre: 'Thriller' },
    { id: 'V246', year: '2001', title: 'El Hacker', genre: 'Thriller' },
    { id: 'V254', year: '2005', title: 'Ambiciones', genre: 'Thriller' },
    { id: 'V256', year: '2004', title: 'Historias de Sexo de Gente Común', genre: 'Drama' },
    { id: 'V257', year: '2003', title: 'Disputas', genre: 'Thriller' },
    { id: 'V259', year: '2001', title: 'Cuatro Amigas', genre: 'Drama' },
    { id: 'V165', year: '2013', title: 'Qitapenas', genre: 'Comedia' },
    { id: 'V262', year: '2012', title: 'El Donante', genre: 'Comedia' },
    { id: 'V263', year: '2012', title: 'Mi Problema con las Mujeres', genre: 'Comedia' },
    { id: 'V265', year: '2009', title: 'Acompañantes', genre: 'Comedia' },
    { id: 'V270', year: '2004', title: 'Mosca & Smith en el Once', genre: 'Comedia' },
    { id: 'V297', year: '2004', title: 'Panadería Los Felipe', genre: 'Comedia' },
    { id: 'V271', year: '2003', title: 'Tres Padres Solteros', genre: 'Comedia' },
    { id: 'V274', year: '2013', title: 'Historias de Diván', genre: 'Drama' },
    { id: 'V291', year: '2013', title: 'Historias de Corazón', genre: 'Drama' },
    { id: 'V275', year: '2006', title: 'Al Límite', genre: 'Thriller' },
    { id: 'V278', year: '2002', title: 'Infieles', genre: 'Thriller' },
    { id: 'V279', year: '2000', title: 'Tiempo Final', genre: 'Thriller' }
  ];
  try {
    const res = await fetch('data.json?v=' + telefeDataVersion, { cache: 'no-store' });
    const data = await res.json();
    // Filtrar solo los títulos del listado estricto
    series = telefeList.map(ref => {
      const item = ref.id
        ? data.items.find(i => i.id === ref.id)
        : data.items.find(i => i.title && i.title.trim().toLowerCase() === ref.title.trim().toLowerCase() && String(i.year) === ref.year);
      let base = item ? { ...item, title: ref.title, genre: item.genre || ref.genre, year: ref.year } : {
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
    } else if (sort === 'tira-diaria') {
      filtered = filtered.filter(item => {
        const tipo = item.tipo_emision ? String(item.tipo_emision).trim().toLowerCase() : '';
        return tipo.includes('tira diaria');
      });
      filtered.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (sort === 'semanal') {
      filtered = filtered.filter(item => {
        const tipo = item.tipo_emision ? String(item.tipo_emision).trim().toLowerCase() : '';
        return tipo.includes('semanal');
      });
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

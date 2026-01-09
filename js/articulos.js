// Cargar y renderizar artículos desde JSON
async function loadArticulos() {
  try {
    // Detectar si estamos en GitHub Pages (/cine-argentum/) o en Live Server/local
    const isGhPages = window.location.pathname.includes('/cine-argentum/');
    const baseMedia = isGhPages ? '/cine-argentum' : '';

    // Construir rutas candidatas usando URL absoluta según el documento y el origen
    const candidates = [
      new URL('data/articulos.json', window.location.href).toString(),
      new URL('/data/articulos.json', window.location.origin).toString(),
      new URL('/cine-argentum/data/articulos.json', window.location.origin).toString()
    ];

    let articulos;
    let lastText = '';
    for (const url of candidates) {
      try {
        const res = await fetch(`${url}?v=${Date.now()}`); // bust caché del navegador
        if (!res.ok) continue;
        const raw = await res.text();
        const text = raw.replace(/^\uFEFF/, '').trim(); // quita BOM y espacios
        lastText = text;
        try {
          // Extrae solo el bloque JSON por si el servidor inyecta scripts/reloads
          const start = text.indexOf('[');
          const end = text.lastIndexOf(']');
          const slice = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text;
          articulos = JSON.parse(slice);
          break;
        } catch (parseErr) {
          console.error('Parse error JSON', { message: parseErr?.message, url });
          // intenta siguiente candidato
        }
      } catch (err) {
        // Continúa al siguiente candidato
      }
    }

    if (!articulos) {
      const len = lastText.length;
      const tail = lastText.slice(-200);
      throw new Error(`No se pudo parsear JSON. Intentos: ${candidates.join(', ')}. Len=${len}. Inicio: ${lastText.slice(0, 200)} ... Fin: ${tail}`);
    }
    
    const container = document.getElementById('articulos-list');
    const detailView = document.getElementById('article-detail');
    
    // Renderizar listado
    function renderLista() {
      container.innerHTML = articulos.map(art => `
        <article class="article-card" onclick="showDetail('${art.id}')">
          <div class="article-media">
            <img src="${baseMedia}${art.featured_image}" alt="${art.title}" loading="lazy" />
          </div>
          <div class="article-body">
            <div class="article-tags">
              ${art.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
            </div>
            <h2 class="article-title">${art.title}</h2>
            <p class="article-excerpt">${art.description}</p>
            <div class="article-meta">
              <span><i class="fa-regular fa-clock"></i> ${art.reading_time} min</span>
              <span><i class="fa-regular fa-calendar"></i> ${formatDate(art.date)}</span>
            </div>
          </div>
        </article>
      `).join('');
    }
    
    // Mostrar detalle de artículo
    window.showDetail = (id) => {
      const articulo = articulos.find(a => a.id === id);
      if (!articulo) return;
      
      detailView.innerHTML = `
        <div class="article-header">
          <button onclick="hidDetail()" class="back-btn">← Volver</button>
          <h1>${articulo.title}</h1>
          <p class="article-meta-detail">
            <span>${articulo.author}</span> • <span>${formatDate(articulo.date)}</span> • <span>${articulo.reading_time} min de lectura</span>
          </p>
        </div>
        <div class="article-featured">
          <img src="${baseMedia}${articulo.featured_image}" alt="${articulo.title}" />
        </div>
        <div class="article-tags">
          ${articulo.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}
        </div>
        <div class="article-content">
          ${articulo.content}
        </div>
      `;
      
      container.style.display = 'none';
      detailView.style.display = 'block';
      window.scrollTo(0, 0);
    };
    
    // Volver al listado
    window.hidDetail = () => {
      container.style.display = 'grid';
      detailView.style.display = 'none';
    };
    
    // Formatear fecha
    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Renderizar inicialmente
    renderLista();
    
  } catch (error) {
    console.error('Error loading artículos:', error);
    document.getElementById('articulos-list').innerHTML = '<p style="color: #ccc; padding: 20px;">Error cargando artículos. Asegúrate de abrir la página desde un servidor web (no file://).<br><small>' + (error?.message || '') + '</small></p>';
  }
}

// Cargar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadArticulos);

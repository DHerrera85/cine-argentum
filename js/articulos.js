// Cargar y renderizar artículos desde JSON
async function loadArticulos() {
  try {
    const response = await fetch('/data/articulos.json');
    const articulos = await response.json();
    
    const container = document.getElementById('articulos-list');
    const detailView = document.getElementById('article-detail');
    
    // Renderizar listado
    function renderLista() {
      container.innerHTML = articulos.map(art => `
        <article class="article-card" onclick="showDetail('${art.id}')">
          <div class="article-media">
            <img src="${art.featured_image}" alt="${art.title}" loading="lazy" />
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
          <img src="${articulo.featured_image}" alt="${articulo.title}" />
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
    document.getElementById('articulos-list').innerHTML = '<p>Error cargando artículos</p>';
  }
}

// Cargar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadArticulos);

# Cine Argentum - Argentina Content

Portal de contenido audiovisual argentino con información de películas, series, actores y análisis.

## 🔗 Demo en vivo
[Ver sitio en GitHub Pages](https://dherrera85.github.io/cine-argentum/)

## ✨ Características
- Diseño responsive (móvil y desktop)
- Sliders de actores y contenido
- Sección de artículos dinámicos
- Información de series y películas
- Buscador integrado

## 🛠 Tecnologías
- **HTML5 / CSS3 / JavaScript** - Puro y simple
- **LightSlider** - Para sliders responsivos
- **Font Awesome** - Iconografía
- **GitHub Pages** - Hosting estático gratuito

## 📝 Agregar Artículos

### 1. Edita `data/articulos.json`

Agrega un nuevo objeto al array:

```json
{
  "id": "slug-unico-articulo",
  "title": "Título del artículo",
  "description": "Resumen breve (2-3 líneas)",
  "date": "2026-01-08",
  "author": "Argentina Content",
  "featured_image": "/images/articulos/nombre-imagen.jpg",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time": 8,
  "content": "<h2>Subtítulo</h2><p>Contenido aquí...</p>"
}
```

### 2. Contenido HTML

El campo `content` acepta HTML puro:
- `<h2>`, `<h3>` para subtítulos
- `<p>` para párrafos
- `<strong>` para destacar

Ejemplo:
```html
"<h2>Título sección</h2>
<p>Párrafo de contenido.</p>
<h3>Subsección</h3>
<p>Más contenido con <strong>énfasis</strong>.</p>"
```

### 3. Imágenes

- Guardar en `images/articulos/`
- Formato: JPG (~800x450px, 16:9)
- Tamaño: ~100-200 KB
- Nombres: minúsculas, guiones: `perspectivas-series.jpg`

## 📁 Estructura de archivos

```
articulos.html           # Página de artículos (HTML puro)
data/
  └─ articulos.json     # Data de artículos (edita aquí)
js/
  ├─ articulos.js       # Script que renderiza artículos
  ├─ lightslider.js
  └─ script.js
css/
  ├─ style.css          # Estilos globales
  └─ articles.css       # Estilos de artículos
images/
  ├─ articulos/         # Imágenes de artículos
  ├─ round-actores/
  ├─ horizontals-*/
  └─ verticals/

## ▶️ Servidor local (pruebas)

Para probar `fetch('data.json')` en local, usa el servidor de Python:

```powershell
& ".\.venv\Scripts\python.exe" -m http.server 5500 -b 127.0.0.1
# Abrí: http://127.0.0.1:5500/index.html
```

## 🗃️ Base unificada de series y películas

- El archivo `data.json` contiene la clave `items` con series y películas.
- Los nuevos registros de películas importados desde Excel incluyen `type: "pelicula"` y, cuando está disponible, `synopsis`.
- Si falta imagen, se muestra un placeholder automático.

## 🔧 Scripts de mantenimiento (carpeta `tools/`)

1. Importar Excel → `data.json`

```powershell
& ".\.venv\Scripts\python.exe" ".\tools\merge_excel_to_datajson.py" ".\data\Cine Argentino.xlsx"
```

2. Asignar posters automáticamente (por título)

```powershell
# Simulación (no modifica data.json)
& ".\.venv\Scripts\python.exe" ".\tools\assign_posters.py" --dry-run
# Actualizar data.json
& ".\.venv\Scripts\python.exe" ".\tools\assign_posters.py"
```

3. Sinopsis placeholder para series/TV

```powershell
& ".\.venv\Scripts\python.exe" ".\tools\set_synopsis_placeholders.py"
```

4. Arreglar IDs duplicados

```powershell
# Simulación
& ".\.venv\Scripts\python.exe" ".\tools\fix_duplicate_ids.py" --dry-run
# Aplicar cambios
& ".\.venv\Scripts\python.exe" ".\tools\fix_duplicate_ids.py"
```

## ⚙️ Config opcional (sliders y búsqueda)

En `js/script.js` podés activar/desactivar:

- `window.faConfig.filterMissingPosters`: `false` por defecto. Si `true`, oculta ítems sin poster real en sliders.
- `window.faConfig.showSynopsisInSearch`: `false` por defecto. Si `true`, muestra un snippet de sinopsis en resultados de búsqueda.

Ejemplo:

```html
<script>
  window.faConfig = { filterMissingPosters: false, showSynopsisInSearch: false };
  // incluir luego js/script.js
</script>
```
```

## 🚀 Publicar cambios

```bash
git add .
git commit -m "feat: agrega nuevo artículo sobre..."
git push origin main
```

Cambios están en vivo en ~30 segundos en GitHub Pages.

## 📸 Gestión de imágenes

| Tipo | Ubicación | Tamaño recomendado | Formato |
|------|-----------|-------------------|---------|
| Artículos | `images/articulos/` | 800x450 (16:9) | JPG |
| Actores | `images/round-actores/` | 300x300 (1:1) | JPG |
| Horizontales | `images/horizontals-*/` | 1024x576 | JPG |
| Verticales | `images/verticals/` | Variable | JPG |

**Optimización:** Mantener < 200 KB por imagen.

## 🎯 Notas

- Sin build tools, sin npm, sin dependencias complejas
- HTML + CSS + JavaScript estándar
- GitHub Pages hospeda gratis
- Cambios inmediatos (no requiere build)


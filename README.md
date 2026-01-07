# Cine Argentum

Portal de cine argentino con información de películas, actores y directores.

## Demo en vivo
[Ver sitio](https://github.com/DHerrera85/cine-argentum)
![Preview del sitio](github/preview.png)

## Características
- Diseño responsive (móvil y desktop)
- Sliders horizontales y verticales
- Buscador de películas
- Información de espectadores

## Tecnologías
- HTML5
- CSS3
- JavaScript
- LightSlider
- Font Awesome

## Gestión de imágenes
- Ubicación: usar carpetas dedicadas como `images/round-actores`, `images/verticals`, `images/horizontals-1024x576`.
- Tamaño recomendado: 16:9 para horizontales (~1024x576) y 1:1 para retratos circulares (~100x100 a 400x400); mantener archivos en ~100–300 KB.
- Formatos: preferir JPG/WebP para fotos; PNG solo si hay transparencia imprescindible.
- Nombres: minúsculas y guiones (`ricardo-darin.jpg`), sin espacios ni acentos en el nombre del archivo.
- Rutas: usar rutas relativas (por ejemplo `images/...`) para que funcionen tanto en desarrollo local como en GitHub Pages.
- Accesibilidad: completar `alt` descriptivo en cada imagen.
- Cacheo: si reemplazas un archivo con el mismo nombre y no ves cambios, limpia caché del navegador o versiona el nombre del archivo.

## Commits y flujo de trabajo
- Versionar imágenes en el repositorio es conveniente: quedan históricas, viajan con el sitio y se publican automáticamente en GitHub Pages.
- Evitar archivos muy grandes (>1–2 MB) para no inflar el repo; comprimir antes de hacer commit.
- Usar ramas para cambios de contenido: crear `content/actores` o similar y hacer PR a `main`.
- Mensajes de commit claros: ejemplo `feat(actors): agrega retratos redondos y corrige alt`.
- Publicación: al fusionar en `main`, GitHub Pages despliega automáticamente.

### Tips de optimización rápida (opcional)
- PowerShell + ImageMagick instalado: `magick mogrify -path images/round-actores -resize 400x400^ -quality 82 images/round-actores/*.jpg`
- Node + sharp (script aparte): comprimir lote antes de commit.

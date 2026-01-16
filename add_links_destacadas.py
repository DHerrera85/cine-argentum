import json
import re

# Cargar data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# Crear un diccionario para mapear títulos con IDs (case-insensitive)
title_to_id = {}
for item in items:
    title = item.get('title', '').strip()
    if title:
        title_to_id[title.lower()] = item.get('id')

# Leer genero-comedias.html
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Reemplazos para la sección Comedias Destacadas
destacadas_replacements = [
    ('Me Casé con un Boludo', 'P1147'),
    ('La Odisea de los Giles', 'P1122'),
    ('Homo Argentum', 'P1115'),
    ('Corazón de León', 'P1125'),
    ('Papá se Volvió Loco', 'P1024'),
    ('Un Novio para mi Mujer', 'P1114'),
]

# Procesar la sección de Destacadas
# Encontrar la sección de Comedias Destacadas
destacadas_section_start = html_content.find('<h1 class="showcase-heading">Comedias Destacadas</h1>')
destacadas_section_end = html_content.find('</section>', destacadas_section_start)
destacadas_section = html_content[destacadas_section_start:destacadas_section_end]

# Para cada película en Destacadas, agregar enlace
for title, movie_id in destacadas_replacements:
    # Patrón para la película en la sección
    pattern = f'<li class="item-[ab]">\s*<div class="showcase-box">\s*<img src="([^"]*)" loading="lazy" alt="{re.escape(title)}"'
    replacement = f'<li class="item-a">\n      <a href="show.html?id={movie_id}" style="text-decoration:none; color:inherit;">\n      <div class="showcase-box">\n        <img src="\\1" loading="lazy" alt="{title}"'
    
    # Reemplazar en la sección
    old_html = html_content
    html_content = re.sub(pattern, replacement, html_content, flags=re.MULTILINE)

# Ahora cerrar los <a> tags después de </div> de latest-b-text
# Buscar en la sección de Destacadas
for title, _ in destacadas_replacements:
    # Encontrar el closing tag correspondiente
    pattern = f'(<div class="latest-b-text">.*?<strong>{re.escape(title)}</strong>.*?</div>\s*</li>)'
    replacement = lambda m: m.group(1).replace('</li>', '</a></li>')
    html_content = re.sub(pattern, replacement, html_content, flags=re.DOTALL)

# Mejor enfoque: reemplazar manualmente la sección completa
# Leer genero-comedias.html de nuevo sin modificaciones
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Crear la nueva sección de Destacadas con enlaces
new_destacadas = '''<!-- Comedias Destacadas (H) -->
<section id="main">
  <h1 class="showcase-heading">Comedias Destacadas</h1>
  <ul class="slider-h cs-hidden">
    <li class="item-a">
      <a href="show.html?id=P1147" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/me-case-con-un-boludo-2016-slide-1024x576.png" loading="lazy" alt="Me Casé con un Boludo"/>
      </div>
      <div class="latest-b-text">
        <strong>Me Casé con un Boludo</strong>
        <p></p>
      </div>
      </a>
    </li>
    <li class="item-a">
      <a href="show.html?id=P1122" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/la-odisea-de-los-giles-2019-slide-1024x576.png" loading="lazy" alt="La Odisea de los Giles"/>
      </div>
      <div class="latest-b-text">
        <strong>La Odisea de los Giles</strong>
        <p></p>
      </div>
      </a>
    </li>
    <li class="item-a">
      <a href="show.html?id=P1115" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/homo-argentum-2025-slide-1024x576.png" loading="lazy" alt="Homo Argentum"/>
      </div>
      <div class="latest-b-text">
        <strong>Homo Argentum</strong>
        <p></p>
      </div>
      </a>
    </li>
    <li class="item-b">
      <a href="show.html?id=P1125" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/corazon-de-leon-2013-slide-1024x576.png" loading="lazy" alt="Corazón de León"/>
      </div>
      <div class="latest-b-text">
        <strong>Corazón de León</strong>
        <p></p>
      </div>
      </a>
    </li>
    <li class="item-b">
      <a href="show.html?id=P1024" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/papá-se-volvió-loco-slide-1024x576.png" loading="lazy" alt="Papá se Volvió Loco"/>
      </div>
      <div class="latest-b-text">
        <strong>Papá se Volvió Loco</strong>
        <p></p>
      </div>
      </a>
    </li>
    <li class="item-b">
      <a href="show.html?id=P1114" style="text-decoration:none; color:inherit;">
      <div class="showcase-box">
        <img src="images/horizontals-1024x576/un-novio-para-mi-mujer-2008-slide-1024x576.png" loading="lazy" alt="Un Novio para mi Mujer"/>
      </div>
      <div class="latest-b-text">
        <strong>Un Novio para mi Mujer</strong>
        <p></p>
      </div>
      </a>
    </li>
  </ul>
</section>'''

# Encontrar y reemplazar la sección de Destacadas
old_destacadas_start = html_content.find('<!-- Comedias Destacadas (H) -->')
old_destacadas_end = html_content.find('</section>', old_destacadas_start) + len('</section>')
old_destacadas_section = html_content[old_destacadas_start:old_destacadas_end]

html_content = html_content.replace(old_destacadas_section, new_destacadas)

# Guardar el archivo
with open('genero-comedias.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Enlaces agregados a la sección de Comedias Destacadas")

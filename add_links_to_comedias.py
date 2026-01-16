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

# Función para agregar enlaces a una sección
def add_links_to_section(html, section_title):
    # Buscar la sección por h2 o h1
    section_pattern = f'(<h[12] class="[^"]*heading">{re.escape(section_title)}</h[12]>.*?</section>)'
    
    def process_section(match):
        section_html = match.group(1)
        
        # Patrón para encontrar cada elemento de la lista
        # <li ...><div class="latest-box"><div class="latest-b-img"><img src="..." alt="...">
        item_pattern = r'<li[^>]*>(\s*<div class="latest-box">.*?</li>)'
        
        def process_item(item_match):
            item_html = item_match.group(0)
            
            # Extraer el título del alt text de la imagen
            alt_pattern = r'alt="([^"]*)"'
            alt_match = re.search(alt_pattern, item_html)
            
            if alt_match:
                title = alt_match.group(1).strip()
                title_lower = title.lower()
                
                movie_id = title_to_id.get(title_lower)
                
                if movie_id:
                    # Envolver el <div class="latest-box"> con un enlace
                    item_html_modified = item_html.replace(
                        '<div class="latest-box">',
                        f'<a href="show.html?id={movie_id}" style="text-decoration:none; color:inherit;"><div class="latest-box">'
                    )
                    item_html_modified = item_html_modified.replace(
                        '</li>',
                        '</div></a></li>'
                    )
                    return item_html_modified
            
            return item_html
        
        # Procesar todos los items en la sección
        section_html_modified = re.sub(item_pattern, process_item, section_html, flags=re.DOTALL)
        return section_html_modified
    
    # Buscar y procesar la sección (usando DOTALL para que . coincida con newlines)
    html_modified = re.sub(section_pattern, process_section, html, flags=re.DOTALL)
    
    return html_modified

# Procesar todas las secciones
sections_to_link = [
    'Comedias Destacadas',
    'Comedias de Guillermo Francella',
    'Comedias de Adrián Suar',
    'Comedias en Streaming',
    'Grandes Éxitos',
    'La Saga "Bañeros" y "Super Agentes"',
    'Historias de Amigos',
    'Para Seguir Riendo',
    'Comedias Negras'
]

for section in sections_to_link:
    html_content = add_links_to_section(html_content, section)

# Guardar el HTML modificado
with open('genero-comedias.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ Enlaces agregados exitosamente a genero-comedias.html")

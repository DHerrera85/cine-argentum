import json
import re

# Cargar data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# Leer genero-comedias.html
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extraer todos los títulos de <strong> en las listas de carouseles (slider-v y slider-h)
# Patrón: <strong>Título</strong>
titles_pattern = r'<strong>(.*?)</strong>'
titles = re.findall(titles_pattern, html_content)

# Agrupar por sección
sections = {
    'Comedias Destacadas': [],
    'Comedias de Guillermo Francella': [],
    'Comedias de Adrián Suar': [],
    'Comedias en Streaming': [],
    'Grandes Éxitos': [],
    'La Saga "Bañeros" y "Super Agentes"': [],
    'Historias de Amigos': [],
    'Para Seguir Riendo': [],
    'Comedias Negras': []
}

# Encontrar los índices de cada sección en el HTML
section_positions = {}
for section_name in sections.keys():
    pos = html_content.find(f'<h2 class="latest-heading">{section_name}</h2>')
    if pos == -1:
        pos = html_content.find(f'<h1 class="showcase-heading">{section_name}</h1>')
    if pos != -1:
        section_positions[section_name] = pos

# Crear un diccionario para mapear títulos con IDs
title_to_id = {}
for item in items:
    title = item.get('title', '').strip()
    if title:
        title_to_id[title.lower()] = item.get('id')

print("=== MAPEO DE PELÍCULAS A IDs ===\n")

# Para cada sección, encontrar los títulos
current_pos = 0
for section_name in ['Comedias Destacadas', 'Comedias de Guillermo Francella', 'Comedias de Adrián Suar', 
                     'Comedias en Streaming', 'Grandes Éxitos', 'La Saga "Bañeros" y "Super Agentes"',
                     'Historias de Amigos', 'Para Seguir Riendo', 'Comedias Negras']:
    
    # Buscar el inicio de la sección
    section_start_h2 = html_content.find(f'<h2 class="latest-heading">{section_name}</h2>')
    section_start_h1 = html_content.find(f'<h1 class="showcase-heading">{section_name}</h1>')
    
    if section_start_h2 != -1:
        section_start = section_start_h2
        # Buscar hasta la siguiente </section>
        section_end = html_content.find('</section>', section_start)
    elif section_start_h1 != -1:
        section_start = section_start_h1
        section_end = html_content.find('</section>', section_start)
    else:
        continue
    
    # Extraer el contenido de la sección
    section_content = html_content[section_start:section_end]
    
    # Encontrar todos los títulos en esta sección
    section_titles = re.findall(r'<strong>(.*?)</strong>', section_content)
    
    print(f"\n{section_name}:")
    print("-" * 60)
    
    for title in section_titles:
        title_clean = title.strip()
        title_lower = title_clean.lower()
        
        # Buscar en el diccionario
        movie_id = None
        for key in title_to_id.keys():
            if key == title_lower:
                movie_id = title_to_id[key]
                break
        
        if movie_id:
            print(f"  {title_clean}: {movie_id} → show.html?id={movie_id}")
        else:
            print(f"  {title_clean}: NO ENCONTRADO")

import json
import re

# Cargar data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# Crear diccionario ID -> año
id_to_info = {}
for item in items:
    movie_id = item.get('id')
    year = item.get('year', '')
    title = item.get('title', '')
    espectadores = item.get('espectadores', '')
    
    id_to_info[movie_id] = {
        'year': year,
        'title': title,
        'espectadores': espectadores
    }

# Leer genero-comedias.html
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Función para procesar cada item y agregar año
def add_year_to_movie(match):
    full_match = match.group(0)
    movie_id = match.group(1)
    current_title = match.group(2)
    
    if movie_id in id_to_info:
        info = id_to_info[movie_id]
        year = info['year']
        title = info['title']
        
        # Si el título ya tiene año entre paréntesis, no hacer nada
        if f'({year})' in current_title:
            return full_match
        
        # Agregar el año al título
        new_title = f"{current_title} ({year})" if year else current_title
        
        # Reemplazar en el HTML
        updated = full_match.replace(
            f'<strong>{current_title}</strong>',
            f'<strong>{new_title}</strong>'
        )
        
        return updated
    
    return full_match

# Patrón para encontrar todos los elementos <a href="show.html?id=...">
# Captura el ID y el contenido del <strong>
pattern = r'<a href="show\.html\?id=(P\d+)"[^>]*>.*?<strong>([^<]+)</strong>.*?</a>'

# Aplicar la transformación
html_content_updated = re.sub(pattern, add_year_to_movie, html_content, flags=re.DOTALL)

# Guardar el archivo actualizado
with open('genero-comedias.html', 'w', encoding='utf-8') as f:
    f.write(html_content_updated)

print("✅ genero-comedias.html actualizado con años en los títulos de las películas")
print(f"   Total de películas procesadas: {len(id_to_info)}")

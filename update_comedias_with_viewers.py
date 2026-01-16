import json
import re

# Cargar data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# Crear diccionario ID -> información
id_to_info = {}
for item in items:
    movie_id = item.get('id')
    year = item.get('year', '')
    title = item.get('title', '')
    viewers = item.get('viewers', 0)  # Campo correcto es 'viewers'
    
    id_to_info[movie_id] = {
        'year': year,
        'title': title,
        'viewers': viewers
    }

# Leer genero-comedias.html
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Función para formatear número de espectadores
def format_viewers(viewers):
    if not viewers or viewers == 0:
        return ""
    # Formatear con puntos como separadores de miles
    return f"{viewers:,}".replace(',', '.')

# Función para procesar cada item y agregar espectadores
def add_viewers_to_movie(match):
    full_match = match.group(0)
    movie_id = match.group(1)
    
    if movie_id in id_to_info:
        info = id_to_info[movie_id]
        viewers = info['viewers']
        
        if viewers and viewers > 0:
            viewers_text = f"{format_viewers(viewers)} espectadores"
            
            # Reemplazar el <p></p> vacío con los espectadores
            updated = full_match.replace(
                '<p></p>',
                f'<p>{viewers_text}</p>'
            )
            
            return updated
    
    return full_match

# Patrón para encontrar todos los elementos <a href="show.html?id=...">
pattern = r'<a href="show\.html\?id=(P\d+)"[^>]*>.*?</a>'

# Aplicar la transformación
html_content_updated = re.sub(pattern, add_viewers_to_movie, html_content, flags=re.DOTALL)

# Guardar el archivo actualizado
with open('genero-comedias.html', 'w', encoding='utf-8') as f:
    f.write(html_content_updated)

# Contar cuántas películas tienen datos de espectadores
movies_with_viewers = sum(1 for info in id_to_info.values() if info['viewers'] and info['viewers'] > 0)
total_movies = len(id_to_info)

print(f"✅ genero-comedias.html actualizado con información de espectadores")
print(f"   Películas con datos de espectadores: {movies_with_viewers}/{total_movies}")

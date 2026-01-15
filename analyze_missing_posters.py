import json
from pathlib import Path
from difflib import SequenceMatcher

ROOT = Path(__file__).resolve().parent
IMG_VERT = ROOT / 'images' / 'verticals'

# Cargar películas sin poster
with open(ROOT / 'data.json', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])
movies_no_poster = [m for m in items if m.get('type') == 'pelicula' and (not m.get('image') or 'placeholder' in m.get('image', ''))]

# Listar archivos disponibles
available_files = {p.stem: p.name for p in IMG_VERT.glob('*.png') if 'placeholder' not in p.stem}

print("ANALISIS DE PELICULAS SIN POSTER Y ARCHIVOS DISPONIBLES:\n")
print("=" * 120)

for movie in movies_no_poster:
    title = movie['title']
    year = movie['year']
    
    # Buscar archivos que contienen el año
    matching_files = [(fname, fstem) for fstem, fname in available_files.items() if year in fstem]
    
    print(f"\n[{title} ({year})]")
    print(f"   Datos en BD: title='{title}', year='{year}'")
    
    if matching_files:
        print(f"   OK - Archivos encontrados con ese ano:")
        for fname, fstem in matching_files:
            ratio = SequenceMatcher(a=title.lower(), b=fstem.lower()).ratio()
            print(f"      - {fname} (similitud: {ratio:.2%})")
    else:
        print(f"   FALTA - No hay archivos con ano {year}")
        # Buscar por título sin año
        title_slugs = title.lower().replace(' ', '-').replace('ñ', 'n').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
        partial_matches = [(fname, fstem) for fstem, fname in available_files.items() if any(part in fstem for part in title_slugs.split('-'))]
        if partial_matches:
            print(f"   NOTA - Posibles archivos sin ano (busqueda parcial):")
            for fname, fstem in partial_matches[:5]:
                print(f"      - {fname}")

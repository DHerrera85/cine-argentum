import json
import re
import unicodedata
from pathlib import Path
from difflib import SequenceMatcher

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def normalize_text(s):
    s = strip_accents(s.lower())
    s = re.sub(r'[^a-z0-9\s-]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def slugify(s):
    s = normalize_text(s)
    s = s.replace(' ', '-')
    s = re.sub(r'-{2,}', '-', s)
    return s

# Load movies without posters
with open('data.json', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])
movies_no_poster = [m for m in items if m.get('type') == 'pelicula' and (not m.get('image') or 'placeholder' in m.get('image', ''))]

# List available posters
IMG_VERT = Path('images/verticals')
poster_files = {p.stem: p.name for p in IMG_VERT.glob('*.png') if 'placeholder' not in p.stem}

print(f"Movies without poster: {len(movies_no_poster)}")
print(f"Available posters: {len(poster_files)}\n")

print("=" * 100)
print("ANÁLISIS DE DISCREPANCIAS:\n")

for movie in movies_no_poster[:15]:  # Primeras 15
    title = movie['title']
    year = movie['year']
    title_slug = slugify(title)
    search_key = f"{title_slug}-{year}"
    
    # Buscar en posters
    matches = []
    for poster_slug, poster_name in poster_files.items():
        if title_slug in poster_slug or poster_slug in title_slug:
            ratio = SequenceMatcher(a=search_key, b=poster_slug).ratio()
            matches.append((ratio, poster_name))
    
    matches.sort(reverse=True)
    
    print(f"📽️  {title} ({year})")
    print(f"   Slug esperado: {title_slug}")
    print(f"   Busca exacta: {search_key}")
    if matches:
        print(f"   ✅ Encontrado:")
        for ratio, fname in matches[:3]:
            print(f"      - {fname} (ratio: {ratio:.2f})")
    else:
        print(f"   ❌ No encontrado en carpeta")
    print()

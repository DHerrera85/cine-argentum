import json
from pathlib import Path

DATA_JSON = Path(__file__).resolve().parent.parent / 'data.json'

with DATA_JSON.open('r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', []) if isinstance(data, dict) else data
movies_without_poster = []

for it in items:
    t = str(it.get('type', '')).strip().lower()
    img = str(it.get('image', '')).strip()
    if t == 'pelicula' and (not img or 'placeholder' in img):
        title = it.get('title', 'Sin título')
        year = it.get('year', '')
        movies_without_poster.append(f"{title} ({year})")

print(f"Total de películas sin poster: {len(movies_without_poster)}\n")
for i, movie in enumerate(movies_without_poster, 1):
    print(f"{i}. {movie}")

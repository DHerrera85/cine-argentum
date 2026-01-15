import json
from pathlib import Path

DATA_JSON = Path(__file__).resolve().parent.parent / 'data.json'

with DATA_JSON.open('r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', data)
series_without_poster = []

for it in items:
    t = str(it.get('type', '')).strip().lower()
    if t == 'pelicula':
        continue  # skip movies
    img = str(it.get('image', '')).strip()
    if not img or 'placeholder' in img:
        title = it.get('title', 'Sin título')
        year = it.get('year', '')
        series_without_poster.append(f"{title} ({year})")

print(f"Total de series/tv sin poster: {len(series_without_poster)}\n")
for i, s in enumerate(series_without_poster, 1):
    print(f"{i}. {s}")

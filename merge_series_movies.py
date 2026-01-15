import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
movies_path = ROOT / 'data.json'
series_path = ROOT / 'old_series_data.json'

movies = json.load(movies_path.open(encoding='utf-8'))
movies_items = movies.get('items', movies)
series_raw = json.load(series_path.open(encoding='utf-16'))
series_items = series_raw.get('items', series_raw)

by_id = {item.get('id'): item for item in movies_items if item.get('id')}
added = 0
for it in series_items:
    idv = it.get('id')
    if not idv or idv in by_id:
        continue
    by_id[idv] = it
    movies_items.append(it)
    added += 1

print(f"Movies existing: {len(movies_items)-added}")
print(f"Series added: {added}")
print(f"Total combined: {len(movies_items)}")

# ensure wrapped format
out = {'items': movies_items}
json.dump(out, movies_path.open('w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"Written to {movies_path}")

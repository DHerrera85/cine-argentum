import json

with open('data.json', encoding='utf-8') as f:
    data = json.load(f)

movies = [m for m in data.get('items', []) if m.get('type') == 'pelicula']
print(f"Total movies: {len(movies)}")
print("\nFirst 30 movie titles:")
for i, m in enumerate(sorted(movies, key=lambda x: (x['year'], x['title']))[:30]):
    poster = m.get('image', 'NO POSTER')
    print(f"{i+1}. {m['title']} ({m['year']}) - {poster}")

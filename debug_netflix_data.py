#!/usr/bin/env python3
import json
import urllib.request

r = urllib.request.urlopen('http://127.0.0.1:5502/data.json', timeout=10)
data = json.load(r)

# Define isNetflixItem like in javascript
def is_netflix_item(item):
    channel = (item.get('channel') or '').lower()
    producer = (item.get('producer') or '').lower()
    platforms = item.get('platforms', [])
    if isinstance(platforms, list):
        platforms = [str(p).lower() for p in platforms]
    else:
        platforms = []
    
    return 'netflix' in channel or 'netflix' in producer or any('netflix' in p for p in platforms)

# Find Netflix items
netflix_items = [item for item in data['items'] if is_netflix_item(item)]
print(f'Total Netflix items: {len(netflix_items)}')

# Find Netflix movies (not series)
netflix_movies = [item for item in netflix_items if item.get('type') != 'serie']
print(f'Netflix movies: {len(netflix_movies)}')

# List them
print('\nNetflix Movies:')
for m in netflix_movies[:10]:
    title = m.get('title', '?')
    year = m.get('year', '?')
    fecha_estreno = m.get('fecha_estreno', '?')
    tipo = m.get('type', '?')
    print(f'  - {title} (year:{year}, fecha:{fecha_estreno}, type:{tipo})')

if not netflix_movies:
    print('\nNo Netflix movies found. Checking structure of first Netflix item:')
    if netflix_items:
        print(json.dumps(netflix_items[0], indent=2)[:1000])
    else:
        print('No Netflix items at all!')


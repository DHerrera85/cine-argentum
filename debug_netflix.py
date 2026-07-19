#!/usr/bin/env python3
import json
import urllib.request
from datetime import datetime

# Load data
r = urllib.request.urlopen('http://127.0.0.1:5502/data.json', timeout=10)
data = json.load(r)

print(f'Total items: {len(data["items"])}')

# Filter Netflix items
netflix_items = [item for item in data['items'] if 'netflix' in str(item.get('plataformas', '')).lower()]
print(f'Netflix items: {len(netflix_items)}')

# Check for movies
netflix_movies = [item for item in netflix_items if item.get('type') != 'serie']
print(f'Netflix movies: {len(netflix_movies)}')

# List all Netflix movies with their dates
print('\nNetflix Movies:')
for movie in netflix_movies:
    titulo = movie.get('titulo', movie.get('title', 'Unknown'))
    fecha = movie.get('fecha_estreno', movie.get('year', 'No date'))
    movie_type = movie.get('type', 'unknown')
    print(f'  - {titulo} ({fecha}) - type: {movie_type}')

print('\n\nChecking data structure:')
if netflix_movies:
    first = netflix_movies[0]
    print(f'First movie keys: {list(first.keys())}')

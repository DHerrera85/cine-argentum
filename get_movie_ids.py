import json

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# Películas de Guillermo Francella
francella_movies = [
    'Homo Argentum',
    'Granizo',
    'Corazón de león',
    'Papá se Volvió Loco',
    'Los Incorregibles',
    'Mi obra maestra'
]

print("=== PELÍCULAS DE GUILLERMO FRANCELLA ===\n")
for movie_name in francella_movies:
    found = False
    for item in items:
        if item.get('title', '').lower() == movie_name.lower():
            print(f"Título: {item.get('title')}")
            print(f"ID: {item.get('id')}")
            print(f"URL: show.html?id={item.get('id')}")
            print('---')
            found = True
            break
    if not found:
        print(f"NO ENCONTRADO: {movie_name}")
        print('---')

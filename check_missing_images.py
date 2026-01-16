import json
import os

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])
missing = []

for item in items:
    if item.get('image'):
        img_path = item['image']
        # Construir la ruta del archivo
        full_path = os.path.join('.', img_path)
        if not os.path.exists(full_path):
            missing.append({
                'id': item.get('id'),
                'title': item.get('title'),
                'image': img_path
            })

if missing:
    print(f'Total de películas sin imagen: {len(missing)}\n')
    for m in missing:
        print(f"ID: {m['id']}")
        print(f"Título: {m['title']}")
        print(f"Imagen faltante: {m['image']}")
        print('---')
else:
    print('Todas las imágenes existen!')

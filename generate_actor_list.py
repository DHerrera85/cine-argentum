#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

# Recolectar todos los actores únicos
all_actors = set()
for item in data.get('items', []):
    for actor in item.get('actors', []):
        if actor and str(actor).strip():
            all_actors.add(str(actor).strip())

# Ordenar alfabéticamente
sorted_actors = sorted(all_actors)

# Guardar en archivo
with open('LISTADO_ACTORES.txt', 'w', encoding='utf-8') as f:
    f.write(f"LISTADO COMPLETO DE ACTORES - {len(sorted_actors)} únicos\n")
    f.write("=" * 60 + "\n\n")
    for actor in sorted_actors:
        f.write(f"{actor}\n")

# Mostrar en pantalla
print(f"LISTADO COMPLETO DE ACTORES ({len(sorted_actors)} únicos)")
print("=" * 60)
for i, actor in enumerate(sorted_actors, 1):
    print(f"{i:3}. {actor}")

print(f"\n✓ Listado guardado en LISTADO_ACTORES.txt")

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Eliminar películas sin poster de data.json
"""
import json

REMOVE_TITLES = [
    "Rodrigo, la Película",
    "Bu y Bu, una aventura interdimensional",
    "La gran aventura de los Lunnis y el libro mágico"
]

# Cargar data.json
with open("data.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

items = data.get("items", [])
original_count = len(items)

# Filtrar películas a eliminar
filtered_items = [it for it in items if it.get("title") not in REMOVE_TITLES]
removed_count = original_count - len(filtered_items)

# Actualizar data
data["items"] = filtered_items

print(f"✓ {removed_count} películas eliminadas")
print(f"  Total antes: {original_count}")
print(f"  Total después: {len(filtered_items)}")

# Guardar data.json
with open("data.json", "w", encoding="utf-8-sig") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✓ data.json guardado")

# Verificar
movie_count = len([it for it in filtered_items if it.get("type") == "pelicula"])
series_count = len([it for it in filtered_items if it.get("type") != "pelicula"])
print(f"\n✓ Total de películas: {movie_count}")
print(f"✓ Total de series: {series_count}")
print(f"✓ Total de items: {len(filtered_items)}")

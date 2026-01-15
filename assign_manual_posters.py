#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Asignar posters manualmente a las películas proporcionadas por el usuario.
"""
import json
from pathlib import Path

# Rutas de imágenes proporcionadas por el usuario (entrada 1-29, sin #11)
MANUAL_MAPPINGS = {
    "Dibu la película": "dibu-1997-poster-280x420.png",
    "Dibu 2: la venganza de Nasty": "dibu-2-1998-poster-280x420.png",
    "Los Incorregibles": "incorregibles-2007-poster-280x420.png",
    "Selkirk, el verdadero Robinson Crusoe": "selkirk-robinson-crusoe-2012-poster-280x420.png",
    "100 años de perdón": "cien-años-de-perdon-2016-poster-280x420.png",
    "Re loca": "reloca-2018-poster-280x420.png",
    "Yanka y el espíritu del volcán": "yanka-espiritu-volcan-2018-poster-280x420.png",
    "Bañeros 5: Lentos y cargosos": "bañeros-5-2018-poster-280x420.png",
    "4×4": "4x4-2019-poster-280x420.png",
    "Ex Casados": "excasados-2021-poster-280x420.png",
    "Transmitvah": "transmitzvah-2024-poster-280x420.png",
    "Bañeros 3, todopoderosos": "baneros-3-2006-poster-280x420.png",
    "100% lucha: el amo de los clones": "100-lucha-amo-clones-2009-poster-280x420.png",
    "Caídos del mapa": "caidos-del-mapa-2013-poster-280x420.png",
    "Corazón, las alegrías de Pantriste": "corazon-pantriste-poster-2000-280x420.png",
    "Boogie el aceitoso": "boogie-2009-poster-280x420.png",
    "Valentina, la película": "valentina-2008-poster-280x420.png",
    "Micaela, una película mágica": "micaela-2002-poster-280x420.png",
    "Elsa y Fred": "elsa-fred-2005-poster-280x420.png",
    "Patoruzito 2: La Gran Aventura": "patoruzito2-pelicula-2006-poster-280x420.png",
}

# Cargar data.json
with open("data.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

items = data.get("items", [])
updated_count = 0

for item in items:
    title = item.get("title", "")
    year = item.get("year", "")
    
    # Buscar coincidencia en los mappings manuales
    if title in MANUAL_MAPPINGS:
        filename = MANUAL_MAPPINGS[title]
        rel_path = f"images/verticals/{filename}"
        
        # Solo actualizar si no tiene una imagen válida aún
        if not item.get("image") or "placeholder" in item.get("image", "").lower():
            item["image"] = rel_path
            updated_count += 1
            print(f"✓ {title} ({year}) → {filename}")

print(f"\n=== Total: {updated_count} películas actualizadas ===")

# Guardar data.json actualizado
with open("data.json", "w", encoding="utf-8-sig") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("✓ data.json guardado")

# Listar películas aún sin poster
missing = [it for it in items if it.get("type") == "pelicula" and (not it.get("image") or "placeholder" in it.get("image", "").lower())]
if missing:
    print(f"\n⚠ Películas aún sin poster: {len(missing)}")
    for m in missing:
        print(f"  - {m.get('title')} ({m.get('year')})")
else:
    print("\n✅ Todas las películas tienen poster asignado!")

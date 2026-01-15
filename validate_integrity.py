#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validación completa de integridad de data.json
- Verificar IDs duplicados
- Validar campos requeridos
- Revisar estructura de datos
"""
import json
from collections import defaultdict

def validate_data():
    # Cargar data.json
    with open("data.json", "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    items = data.get("items", [])
    
    print("=" * 70)
    print("VALIDACIÓN DE INTEGRIDAD DE DATA.JSON")
    print("=" * 70)
    
    # 1. Verificar estructura
    print("\n1. ESTRUCTURA:")
    print(f"   ✓ Total de items: {len(items)}")
    movies = [it for it in items if it.get("type") == "pelicula"]
    series = [it for it in items if it.get("type") != "pelicula"]
    print(f"   ✓ Películas: {len(movies)}")
    print(f"   ✓ Series/TV: {len(series)}")
    
    # 2. Verificar IDs duplicados
    print("\n2. VERIFICACIÓN DE IDs:")
    id_map = defaultdict(list)
    for idx, item in enumerate(items):
        item_id = item.get("id")
        if item_id:
            id_map[item_id].append((idx, item.get("title")))
    
    duplicates = {id_val: occurrences for id_val, occurrences in id_map.items() if len(occurrences) > 1}
    
    if duplicates:
        print(f"   ⚠ IDs duplicados encontrados: {len(duplicates)}")
        for dup_id, occurrences in sorted(duplicates.items()):
            for idx, title in occurrences:
                print(f"      - {dup_id}: {title}")
    else:
        print("   ✓ No hay IDs duplicados")
    
    # 3. Verificar campos requeridos
    print("\n3. CAMPOS REQUERIDOS:")
    required_fields = ["id", "title", "year"]
    missing_by_field = defaultdict(list)
    
    for idx, item in enumerate(items):
        for field in required_fields:
            if field not in item or not item[field]:
                missing_by_field[field].append((idx, item.get("title", "SIN TÍTULO")))
    
    if missing_by_field:
        print(f"   ⚠ Campos faltantes:")
        for field, items_list in missing_by_field.items():
            print(f"      {field}: {len(items_list)} items")
            for idx, title in items_list[:3]:
                print(f"         - [{idx}] {title}")
            if len(items_list) > 3:
                print(f"         ... y {len(items_list) - 3} más")
    else:
        print("   ✓ Todos los campos requeridos están poblados")
    
    # 4. Verificar campos opcionales
    print("\n4. CAMPOS OPCIONALES:")
    optional_fields = ["actors", "genre", "image", "synopsis", "channel", "orientation"]
    
    for field in optional_fields:
        count_with_field = sum(1 for it in items if it.get(field))
        count_without = len(items) - count_with_field
        print(f"   • {field:15} : {count_with_field:3} items ({count_without} sin)")
    
    # 5. Verificar imágenes
    print("\n5. VALIDACIÓN DE IMÁGENES:")
    images_with_path = sum(1 for it in items if it.get("image") and not "placeholder" in it.get("image", "").lower())
    placeholders = sum(1 for it in items if "placeholder" in it.get("image", "").lower())
    no_image = sum(1 for it in items if not it.get("image"))
    
    print(f"   ✓ Con imágenes reales    : {images_with_path}")
    print(f"   • Placeholders           : {placeholders}")
    print(f"   • Sin imagen definida    : {no_image}")
    
    # 6. Películas sin poster (solo para tipo "pelicula")
    movies_no_poster = [it for it in movies if not it.get("image") or "placeholder" in it.get("image", "").lower()]
    if movies_no_poster:
        print(f"\n6. PELÍCULAS SIN POSTER ({len(movies_no_poster)}):")
        for m in movies_no_poster[:10]:
            print(f"   - {m.get('title')} ({m.get('year')})")
        if len(movies_no_poster) > 10:
            print(f"   ... y {len(movies_no_poster) - 10} más")
    else:
        print(f"\n6. PELÍCULAS SIN POSTER:")
        print("   ✓ Todas las películas tienen poster asignado")
    
    # 7. Resumen final
    print("\n" + "=" * 70)
    print("RESUMEN:")
    print(f"   Total de items: {len(items)}")
    print(f"   IDs duplicados: {len(duplicates)}")
    print(f"   Campos faltantes: {sum(len(v) for v in missing_by_field.values())}")
    print(f"   Películas sin poster: {len(movies_no_poster)}")
    
    if not duplicates and not missing_by_field:
        print("\n   ✅ BASE DE DATOS EN BUEN ESTADO")
    else:
        print("\n   ⚠ REVISAR PROBLEMAS DETECTADOS")
    print("=" * 70)

if __name__ == "__main__":
    validate_data()

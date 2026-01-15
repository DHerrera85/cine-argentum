#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para validar que los datos de productora y director se integraron correctamente
"""

import json

def main():
    print("Validando integración de productora y director...\n")
    
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    items = json_data.get('items', [])
    
    # Contar películas con producer/director
    movies_with_producer = 0
    movies_with_director = 0
    movies_with_both = 0
    movies_without_data = 0
    
    movies = [item for item in items if item.get('id', '').startswith(('P', 'H'))]
    
    print(f"Total de películas: {len(movies)}\n")
    
    for item in movies:
        has_producer = 'producer' in item and item['producer']
        has_director = 'director' in item and item['director']
        
        if has_producer:
            movies_with_producer += 1
        if has_director:
            movies_with_director += 1
        if has_producer and has_director:
            movies_with_both += 1
        if not has_producer and not has_director:
            movies_without_data += 1
    
    print("📊 ESTADÍSTICAS DE INTEGRACIÓN:")
    print(f"  ✓ Películas con Productora: {movies_with_producer}")
    print(f"  ✓ Películas con Director: {movies_with_director}")
    print(f"  ✓ Películas con ambos datos: {movies_with_both}")
    print(f"  ✗ Películas sin datos: {movies_without_data}\n")
    
    # Mostrar algunas películas de ejemplo
    print("📌 EJEMPLOS DE PELÍCULAS CON DATOS:")
    sample_count = 0
    for item in movies:
        if sample_count >= 5:
            break
        has_producer = 'producer' in item and item['producer']
        has_director = 'director' in item and item['director']
        if has_producer or has_director:
            print(f"\n  {item.get('title', '')}")
            if has_producer:
                print(f"    Productora: {item['producer']}")
            if has_director:
                print(f"    Director: {item['director']}")
            sample_count += 1
    
    print(f"\n✅ Validación completada")

if __name__ == '__main__':
    main()

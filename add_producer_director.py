#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para agregar datos de Productora/Distribuidora y Director a data.json
"""

import json

def normalize_title(title):
    """Normaliza títulos para comparación"""
    return title.strip().lower()

def main():
    print("Leyendo datos de productora y director...\n")
    
    # Leer archivo de datos
    data_map = {}
    with open('DATOS_PRODUCTORA_DIRECTOR.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        # Saltar encabezado
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t')
            if len(parts) >= 3:
                title = parts[0].strip()
                producer = parts[1].strip() if parts[1].strip() != '-' else None
                director = parts[2].strip() if parts[2].strip() != '-' else None
                normalized = normalize_title(title)
                data_map[normalized] = {
                    'original_title': title,
                    'producer': producer,
                    'director': director
                }
    
    print(f"Películas cargadas: {len(data_map)}\n")
    
    # Leer data.json
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    data = json_data.get('items', [])
    
    # Actualizar películas
    matches = 0
    no_matches = []
    
    for item in data:
        item_id = item.get('id', '')
        # Solo procesar películas (comienzan con P o H)
        if not (item_id.startswith('P') or item_id.startswith('H')):
            continue
        
        title = item.get('title', '').strip()
        normalized = normalize_title(title)
        
        if normalized in data_map:
            data_info = data_map[normalized]
            matches += 1
            
            if data_info['producer']:
                item['producer'] = data_info['producer']
            
            if data_info['director']:
                item['director'] = data_info['director']
            
            print(f"✓ {title}")
            if data_info['producer']:
                print(f"  Productora: {data_info['producer']}")
            if data_info['director']:
                print(f"  Director: {data_info['director']}")
        else:
            no_matches.append(f"{title} (ID: {item_id})")
    
    # Guardar data.json actualizado
    json_data['items'] = data
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Películas actualizadas: {matches}")
    print(f"Películas sin encontrar: {len(no_matches)}")
    
    if no_matches:
        print(f"\n❌ Películas sin datos de productora/director:")
        for movie in no_matches[:10]:
            print(f"  - {movie}")
        if len(no_matches) > 10:
            print(f"  ... y {len(no_matches) - 10} más")
    
    print(f"\n✅ data.json actualizado con productora y director")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para actualizar data.json con el reporte de espectadores corregido
"""

import json
from datetime import datetime

def normalize_title(title):
    """Normaliza títulos para comparación"""
    return title.strip().lower()

def parse_viewers(value):
    """Convierte el valor de espectadores a número o None"""
    if isinstance(value, str):
        value = value.strip()
        if value in ['-', '—', '']:
            return None  # Película de streaming sin espectadores de cine
        # Remover comas y puntos de formato
        value = value.replace('.', '').replace(',', '')
        try:
            return int(value)
        except ValueError:
            return None
    elif isinstance(value, (int, float)):
        return int(value) if value else None
    return None

def main():
    print("Leyendo reporte de espectadores...")
    
    # Leer reporte TSV
    reporte = {}
    with open('ESPECTADORES_REPORTE.txt', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t')
            if len(parts) == 2:
                title = parts[0].strip()
                viewers_str = parts[1].strip()
                viewers = parse_viewers(viewers_str)
                normalized = normalize_title(title)
                reporte[normalized] = {
                    'original_title': title,
                    'viewers': viewers,
                    'viewers_str': viewers_str
                }
    
    print(f"Películas en reporte: {len(reporte)}")
    
    # Leer data.json
    print("Leyendo data.json...")
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    data = json_data.get('items', [])
    
    # Actualizar películas
    matches = 0
    updates = 0
    no_matches = []
    conflicting_values = []
    
    for item in data:
        item_id = item.get('id', '')
        # Solo procesar películas (comienzan con P o H)
        if not (item_id.startswith('P') or item_id.startswith('H')):
            continue
        
        title = item.get('title', '').strip()
        normalized = normalize_title(title)
        
        if normalized in reporte:
            matches += 1
            repo_data = reporte[normalized]
            new_viewers = repo_data['viewers']
            old_viewers = item.get('viewers')
            
            # Si hay valor anterior diferente
            if old_viewers is not None and new_viewers is not None and old_viewers != new_viewers:
                conflicting_values.append({
                    'title': title,
                    'id': item_id,
                    'old': old_viewers,
                    'new': new_viewers,
                    'difference': abs(old_viewers - new_viewers)
                })
            
            # Actualizar o agregar campo
            if new_viewers is not None:
                item['viewers'] = new_viewers
                updates += 1
                print(f"✓ {title}: {new_viewers:,} espectadores")
            else:
                # Películas de streaming sin espectadores de cine
                if 'viewers' in item:
                    del item['viewers']  # Remover el campo si no tiene datos
                print(f"◆ {title}: sin espectadores (streaming)")
        else:
            no_matches.append(f"{title} (ID: {item_id})")
    
    print(f"\n{'='*60}")
    print(f"Películas encontradas en reporte: {matches}")
    print(f"Películas actualizadas: {updates}")
    print(f"Películas sin encontrar en reporte: {len(no_matches)}")
    
    if conflicting_values:
        print(f"\n⚠️  VALORES CONFLICTIVOS ({len(conflicting_values)}):")
        for conf in sorted(conflicting_values, key=lambda x: x['difference'], reverse=True)[:10]:
            print(f"  {conf['title']}: {conf['old']:,} → {conf['new']:,} (diferencia: {conf['difference']:,})")
    
    if no_matches:
        print(f"\n❌ Películas en JSON sin reporte:")
        for movie in sorted(no_matches)[:10]:
            print(f"  - {movie}")
        if len(no_matches) > 10:
            print(f"  ... y {len(no_matches) - 10} más")
    
    # Guardar data.json actualizado
    json_data['items'] = data
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ data.json actualizado exitosamente")
    
    # Generar reporte detallado
    with open('REPORTE_ESPECTADORES_ACTUALIZADO.txt', 'w', encoding='utf-8') as f:
        f.write(f"REPORTE DE ACTUALIZACIÓN DE ESPECTADORES\n")
        f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"{'='*70}\n\n")
        f.write(f"RESUMEN:\n")
        f.write(f"  Películas en reporte: {len(reporte)}\n")
        f.write(f"  Películas encontradas en JSON: {matches}\n")
        f.write(f"  Películas actualizadas: {updates}\n")
        f.write(f"  Películas sin reporte: {len(no_matches)}\n")
        f.write(f"  Valores conflictivos: {len(conflicting_values)}\n\n")
        
        if conflicting_values:
            f.write(f"VALORES CONFLICTIVOS:\n")
            for conf in sorted(conflicting_values, key=lambda x: x['difference'], reverse=True):
                f.write(f"  {conf['id']} - {conf['title']}\n")
                f.write(f"    Anterior: {conf['old']:,}\n")
                f.write(f"    Nuevo: {conf['new']:,}\n")
                f.write(f"    Diferencia: {conf['difference']:,}\n\n")
        
        if no_matches:
            f.write(f"\nPELÍCULAS SIN REPORTE ({len(no_matches)}):\n")
            for movie in sorted(no_matches):
                f.write(f"  - {movie}\n")
    
    print("📄 Reporte detallado: REPORTE_ESPECTADORES_ACTUALIZADO.txt")

if __name__ == '__main__':
    main()

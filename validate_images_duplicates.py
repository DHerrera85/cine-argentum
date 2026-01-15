#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para validar imágenes y detectar duplicados en data.json
"""

import json
import os
from pathlib import Path

def main():
    print("Validando imágenes y detectando duplicados...\n")
    
    # Leer data.json
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    data = json_data.get('items', [])
    
    # Validación de imágenes
    print("="*80)
    print("VALIDACIÓN DE IMÁGENES")
    print("="*80)
    
    missing_images = []
    images_checked = 0
    images_ok = 0
    
    for item in data:
        image_path = item.get('image')
        if not image_path:
            continue
            
        images_checked += 1
        full_path = Path(image_path)
        
        if not full_path.exists():
            missing_images.append({
                'id': item.get('id'),
                'title': item.get('title'),
                'path': image_path
            })
        else:
            images_ok += 1
    
    print(f"\nImágenes verificadas: {images_checked}")
    print(f"  ✓ OK: {images_ok}")
    print(f"  ✗ FALTANTES: {len(missing_images)}")
    
    if missing_images:
        print(f"\n⚠️  Imágenes faltantes:")
        for img in missing_images[:20]:
            print(f"  - [{img['id']}] {img['title']}")
            print(f"    Path: {img['path']}\n")
        if len(missing_images) > 20:
            print(f"  ... y {len(missing_images) - 20} más\n")
    
    # Detección de duplicados
    print(f"\n{'='*80}")
    print("DETECCIÓN DE DUPLICADOS")
    print("="*80)
    
    # Verificar IDs duplicados
    ids = {}
    duplicate_ids = []
    for item in data:
        item_id = item.get('id')
        if item_id:
            if item_id in ids:
                duplicate_ids.append(item_id)
            else:
                ids[item_id] = item.get('title')
    
    if duplicate_ids:
        print(f"\n⚠️  IDs DUPLICADOS ({len(duplicate_ids)}):")
        for dup_id in duplicate_ids:
            matches = [item for item in data if item.get('id') == dup_id]
            print(f"  - ID: {dup_id}")
            for match in matches:
                print(f"    • {match.get('title')} ({match.get('year')})")
    else:
        print(f"\n✓ No hay IDs duplicados")
    
    # Verificar títulos duplicados
    titles = {}
    duplicate_titles = []
    for item in data:
        title = item.get('title', '').lower().strip()
        if title:
            if title in titles:
                duplicate_titles.append(title)
            else:
                titles[title] = item.get('id')
    
    if duplicate_titles:
        print(f"\n⚠️  TÍTULOS DUPLICADOS ({len(duplicate_titles)}):")
        for dup_title in duplicate_titles:
            matches = [item for item in data if item.get('title', '').lower().strip() == dup_title]
            print(f"  - Título: {matches[0].get('title')}")
            for match in matches:
                print(f"    • [{match.get('id')}] {match.get('year')} - {match.get('channel')}")
            print()
    else:
        print(f"\n✓ No hay títulos duplicados")
    
    # Resumen general
    print(f"\n{'='*80}")
    print("RESUMEN GENERAL")
    print("="*80)
    print(f"Total de items: {len(data)}")
    print(f"Imágenes verificadas: {images_checked}")
    print(f"  - Con imagen: {images_ok}")
    print(f"  - Faltantes: {len(missing_images)}")
    print(f"IDs únicos: {len(ids)}")
    print(f"IDs duplicados: {len(duplicate_ids)}")
    print(f"Títulos únicos: {len(titles)}")
    print(f"Títulos duplicados: {len(duplicate_titles)}")
    
    # Generar reporte
    with open('REPORTE_VALIDACION.txt', 'w', encoding='utf-8') as f:
        f.write(f"REPORTE DE VALIDACIÓN DE IMÁGENES Y DUPLICADOS\n")
        f.write(f"{'='*80}\n\n")
        
        f.write(f"IMÁGENES\n")
        f.write(f"{'-'*80}\n")
        f.write(f"Total verificadas: {images_checked}\n")
        f.write(f"OK: {images_ok}\n")
        f.write(f"Faltantes: {len(missing_images)}\n\n")
        
        if missing_images:
            f.write(f"IMÁGENES FALTANTES:\n")
            for img in missing_images:
                f.write(f"  [{img['id']}] {img['title']}\n")
                f.write(f"  Path: {img['path']}\n\n")
        
        f.write(f"\n{'='*80}\n")
        f.write(f"DUPLICADOS\n")
        f.write(f"{'-'*80}\n")
        f.write(f"IDs duplicados: {len(duplicate_ids)}\n")
        f.write(f"Títulos duplicados: {len(duplicate_titles)}\n\n")
        
        if duplicate_ids:
            f.write(f"IDS DUPLICADOS:\n")
            for dup_id in duplicate_ids:
                matches = [item for item in data if item.get('id') == dup_id]
                f.write(f"  ID: {dup_id}\n")
                for match in matches:
                    f.write(f"    - {match.get('title')} ({match.get('year')})\n")
                f.write("\n")
        
        if duplicate_titles:
            f.write(f"\nTÍTULOS DUPLICADOS:\n")
            for dup_title in duplicate_titles:
                matches = [item for item in data if item.get('title', '').lower().strip() == dup_title]
                f.write(f"  Título: {matches[0].get('title')}\n")
                for match in matches:
                    f.write(f"    [{match.get('id')}] {match.get('year')} - {match.get('channel')}\n")
                f.write("\n")
        
        f.write(f"\n{'='*80}\n")
        f.write(f"RESUMEN\n")
        f.write(f"{'-'*80}\n")
        f.write(f"Total de items: {len(data)}\n")
        f.write(f"IDs únicos: {len(ids)}\n")
        f.write(f"Títulos únicos: {len(titles)}\n")
    
    print(f"\n✅ Validación completada")
    print(f"📄 Reporte guardado en: REPORTE_VALIDACION.txt")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar listado de series para revisión de typos
"""

import json

def main():
    # Leer data.json
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    data = json_data.get('items', [])
    
    # Filtrar solo series (IDs que comienzan con 'v', 'V')
    series = []
    for item in data:
        item_id = item.get('id', '')
        if item_id.startswith('v') or item_id.startswith('V'):
            if not (item_id.startswith('V') and item_id[1:].isdigit() and int(item_id[1:]) > 180):  # Excluir películas con ID V
                if item_id.islower() or (item_id[0] == 'V' and len(item_id) <= 4):
                    series.append(item)
    
    # Ordenar por ID
    series.sort(key=lambda x: x.get('id', ''))
    
    # Imprimir en formato TSV para fácil revisión
    print(f"{'ID':<6} {'TÍTULO':<50} {'AÑO':<6} {'CANAL':<20} {'GÉNERO'}")
    print("="*140)
    
    for item in series:
        item_id = item.get('id', '')
        title = item.get('title', '')[:48]
        year = str(item.get('year', ''))
        channel = item.get('channel', '')[:18]
        genre = item.get('genre', '')
        
        print(f"{item_id:<6} {title:<50} {year:<6} {channel:<20} {genre}")
    
    # Guardar en archivo
    with open('LISTADO_SERIES_PARA_REVISION.txt', 'w', encoding='utf-8') as f:
        f.write(f"LISTADO DE SERIES PARA REVISIÓN DE TYPOS\n")
        f.write(f"{'='*140}\n\n")
        f.write(f"{'ID':<6} {'TÍTULO':<50} {'AÑO':<6} {'CANAL':<20} {'GÉNERO'}\n")
        f.write(f"{'-'*140}\n")
        
        for item in series:
            item_id = item.get('id', '')
            title = item.get('title', '')
            year = str(item.get('year', ''))
            channel = item.get('channel', '')
            genre = item.get('genre', '')
            actors = ', '.join(item.get('actors', [])[:2]) if item.get('actors') else ''
            
            f.write(f"{item_id:<6} {title:<50} {year:<6} {channel:<20} {genre}\n")
            if actors:
                f.write(f"       Actores: {actors}\n")
    
    print(f"\n📄 Listado guardado en: LISTADO_SERIES_PARA_REVISION.txt")
    print(f"Total de series: {len(series)}")

if __name__ == '__main__':
    main()

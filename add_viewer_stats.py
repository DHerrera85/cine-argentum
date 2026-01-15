#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para agregar datos de espectadores/visualizaciones desde el Excel a data.json
"""

import json
import pandas as pd
from datetime import datetime

def normalize_title(title):
    """Normaliza títulos para comparación"""
    return title.strip().lower()

def main():
    # Leer el Excel
    print("Leyendo Excel...")
    df = pd.read_excel('data/Cine Argentino.xlsx')
    print(f"Total películas en Excel: {len(df)}")
    
    # Leer data.json
    print("Leyendo data.json...")
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    # Obtener el array de items
    data = json_data.get('items', [])
    
    # Crear diccionario de películas del Excel con título normalizado como key
    excel_movies = {}
    for _, row in df.iterrows():
        title = str(row['Título']).strip()
        normalized = normalize_title(title)
        entradas = row['Entradas']
        
        # Convertir entradas a número entero si es posible
        if pd.notna(entradas):
            try:
                # Si viene como string con puntos (ej: "2.210.600")
                if isinstance(entradas, str):
                    entradas = int(entradas.replace('.', '').replace(',', ''))
                else:
                    entradas = int(entradas)
            except (ValueError, AttributeError):
                entradas = None
        else:
            entradas = None
            
        excel_movies[normalized] = {
            'original_title': title,
            'entradas': entradas,
            'year': str(row['Año']) if pd.notna(row['Año']) else None
        }
    
    print(f"\nPelículas procesadas del Excel: {len(excel_movies)}")
    
    # Actualizar películas en data.json
    matches = 0
    no_matches = []
    updated_items = []
    
    for item in data:
        # Solo procesar películas (items sin 'channel' o con 'movies' en algún campo)
        # Verificamos si el ID comienza con 'P' o 'H' (películas)
        item_id = item.get('id', '')
        if not (item_id.startswith('P') or item_id.startswith('H')):
            continue
            
        title = item.get('title', '').strip()
        normalized = normalize_title(title)
        year = str(item.get('year', '')).strip()
        
        if normalized in excel_movies:
            excel_data = excel_movies[normalized]
            
            # Verificar que el año coincida (si ambos tienen año)
            excel_year = excel_data.get('year', '')
            if excel_year and year and str(excel_year) != year:
                print(f"⚠️ Año diferente para '{title}': JSON={year}, Excel={excel_year}")
                # Aún así agregamos el dato
            
            entradas = excel_data['entradas']
            if entradas is not None:
                item['viewers'] = entradas
                matches += 1
                updated_items.append({
                    'id': item_id,
                    'title': title,
                    'viewers': entradas
                })
                print(f"✓ {title} ({year}): {entradas:,} espectadores")
            else:
                print(f"⚠️ {title}: sin datos de entradas en Excel")
        else:
            no_matches.append(f"{title} ({year}) [ID: {item_id}]")
    
    # Guardar data.json actualizado
    print(f"\n{'='*60}")
    print(f"Películas actualizadas: {matches}")
    print(f"Películas sin match: {len(no_matches)}")
    
    if no_matches:
        print("\n❌ Películas en JSON sin datos en Excel:")
        for movie in sorted(no_matches)[:20]:  # Mostrar primeras 20
            print(f"  - {movie}")
        if len(no_matches) > 20:
            print(f"  ... y {len(no_matches) - 20} más")
    
    # Guardar
    json_data['items'] = data
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ data.json actualizado con {matches} registros de espectadores")
    
    # Guardar reporte
    with open('REPORTE_VIEWERS.txt', 'w', encoding='utf-8') as f:
        f.write(f"REPORTE DE ACTUALIZACIÓN DE ESPECTADORES\n")
        f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"{'='*60}\n\n")
        f.write(f"Películas actualizadas: {matches}\n\n")
        
        if updated_items:
            f.write("PELÍCULAS ACTUALIZADAS:\n")
            for item in sorted(updated_items, key=lambda x: x['viewers'], reverse=True):
                f.write(f"  {item['id']} - {item['title']}: {item['viewers']:,} espectadores\n")
        
        if no_matches:
            f.write(f"\n\nPELÍCULAS SIN DATOS ({len(no_matches)}):\n")
            for movie in sorted(no_matches):
                f.write(f"  - {movie}\n")
    
    print("📄 Reporte guardado en REPORTE_VIEWERS.txt")

if __name__ == '__main__':
    main()

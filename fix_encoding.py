#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Limpiar caracteres de box-drawing que reemplazan a acentos españoles.
Los caracteres U+251C (├), U+2592 (▒), U+2551 (║) están reemplazando vocales acentuadas.
"""
import json

def fix_box_drawing_chars(text):
    """Reemplaza caracteres de box-drawing por acentos españoles"""
    if not text:
        return text
    
    # Mappings de box-drawing chars a acentos españoles
    replacements = {
        '├│': 'ó',    # ├ + │ -> ó
        '├▒': 'ñ',    # ├ + ▒ -> ñ
        '├®': 'é',    # ├ + ® -> é
        '├║': 'ü',    # ├ + ║ -> ü
        '├í': 'í',    # ├ + í -> í
        '├ü': 'ü',    # ├ + ü -> ü
        '├á': 'á',    # ├ + á -> á
        '├©': 'é',    # ├ + © -> é
        '├Û': 'ú',    # ├ + Û -> ú
        '├Á': 'Á',    # ├ + Á -> Á
        '├ú': 'ú',    # ├ + ú -> ú
        '├µ': 'á',    # Otro patrón
        '┤│': 'ó',
        '┤▒': 'ñ',
        '┤®': 'é',
    }
    
    result = str(text)
    
    # Primero los reemplazos de dos caracteres
    for bad, good in sorted(replacements.items(), key=lambda x: len(x[0]), reverse=True):
        result = result.replace(bad, good)
    
    # Limpiar box-drawing chars solos que quedaron
    # En español, ├ y ▒ por sí solos generalmente debería ser ñ
    for pattern in ['├▒', '├┐', '├┤', '├─', '├│', '├┘', '├└', '├║']:
        if pattern in result:
            # Intentar deducir qué debería ser
            result = result.replace(pattern, 'ñ')
    
    return result

def clean_data():
    """Limpiar toda la base de datos"""
    
    print("Cargando data.json...")
    with open("data.json", "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    items = data.get("items", [])
    fixed_count = 0
    fixed_fields = 0
    
    print(f"Procesando {len(items)} items...")
    
    for item in items:
        # Limpiar todos los campos de texto
        for field in ["title", "genre", "synopsis", "channel", "subtitle"]:
            if field in item and item[field]:
                original = item[field]
                item[field] = fix_box_drawing_chars(item[field])
                if original != item[field]:
                    fixed_fields += 1
        
        # Limpiar actores
        if "actors" in item and isinstance(item["actors"], list):
            for i in range(len(item["actors"])):
                if item["actors"][i]:
                    original = item["actors"][i]
                    item["actors"][i] = fix_box_drawing_chars(str(item["actors"][i]))
                    if original != item["actors"][i]:
                        fixed_fields += 1
                        if fixed_count == 0:
                            print(f"  Ejemplo: '{original}' -> '{item['actors'][i]}'")
        
        if fixed_fields > 0 and fixed_count == 0:
            fixed_count += 1
    
    print(f"✓ {fixed_fields} campos actualizados")
    
    # Guardar
    print("Guardando data.json...")
    with open("data.json", "w", encoding="utf-8-sig") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✓ data.json guardado")
    
    # Verificar
    print("\nVerificando...")
    with open("data.json", "r", encoding="utf-8-sig") as f:
        data_check = json.load(f)
    
    remaining_issues = []
    for item in data_check.get("items", []):
        for actor in item.get("actors", []):
            actor_str = str(actor)
            if any(c in actor_str for c in '├┤┥┦║┌┐└┘─│▒'):
                remaining_issues.append(actor_str)
    
    if not remaining_issues:
        print("✅ TODOS LOS CARACTERES CORREGIDOS")
    else:
        print(f"⚠ Aún hay {len(set(remaining_issues))} problemas únicos")

if __name__ == "__main__":
    clean_data()

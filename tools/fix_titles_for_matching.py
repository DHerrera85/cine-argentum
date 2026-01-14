#!/usr/bin/env python3
"""
Fix titles in data.json to match poster filenames more accurately.
This helps the fuzzy matching algorithm find better matches.
"""

import json
import os

# Manual mappings of current titles to better versions for matching
TITLE_FIXES = {
    "Cenizas de paraíso": "Cenizas del Paraíso",
    "Dibu la película": "Dibu",
    "Dibu 2: la venganza de Nasty": "Dibu 2",
    "Los Incorregibles": "Incorregibles",
    "Revolución, el cruce de los andes": "Revolución, cruce de los andes",
    "Selkirk, el verdadero Robinson Crusoe": "Selkirk, Robinson Crusoe",
    "Tini: el gran cambio de Violetta": "Tini, gran cambio de Violetta",
    "100 años de perdón": "100 años de perdón", # Already in file format
    "Re loca": "Reloca",
    "Yanka y el espíritu del volcán": "Yanka, espíritu del volcán",
    "Bañeros 5: Lentos y cargosos": "Bañeros 5",
    "4×4": "4x4",
    "Ex Casados": "Excasados",
    "Hermanitos del fin del mundo": "Hermanitos, fin del mundo",
    "100% lucha: el amo de los clones": "100 lucha, amo de los clones",
    "Wakolda, el Médico Alemán": "Wakolda, Médico Alemán",
    "Corazón, las alegrías de Pantriste": "Corazón, alegrías de Pantriste",
    "Crimenes de Familia": "Crimenes en Familia",
    "Boogie el aceitoso": "Boogie",
    "Los Super Agentes: La Nueva Generación": "Los Super Agentes, Nueva Generación",
    "Valentina, la película": "Valentina",
    "Peter Capusotto y sus 3 dimensiones": "Peter Capusotto, 3 dimensiones",
    "Micaela, una película mágica": "Micaela",
    "Elsa y Fred": "Elsa Fred",
    "Patoruzito 2: La Gran Aventura": "Patoruzito 2",
}

def fix_titles():
    """Fix titles in data.json for better poster matching."""
    data_file = "data.json"
    
    # Load data
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = 0
    for item in data:
        if item.get('type') == 'pelicula':
            current_title = item.get('title')
            if current_title in TITLE_FIXES:
                new_title = TITLE_FIXES[current_title]
                print(f"Updating: '{current_title}' → '{new_title}'")
                item['title'] = new_title
                updated += 1
    
    # Save updated data
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\nUpdated {updated} titles in {data_file}")

if __name__ == '__main__':
    fix_titles()

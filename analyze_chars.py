#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

# Analizar caracteres problemáticos
problematic_example = 'Benjamán Vicu├▒a'
print(f'Ejemplo: {problematic_example}')
print(f'Longitud: {len(problematic_example)}')

for i, c in enumerate(problematic_example):
    print(f'  [{i}] {c} = U+{ord(c):04X} ({ord(c)})')

print('\n\nBuscando patrones en data.json...')
problematic_chars = set()

for item in data.get('items', []):
    for actor in item.get('actors', []):
        actor_str = str(actor)
        for c in actor_str:
            if ord(c) > 127:  # Caracteres no-ASCII
                problematic_chars.add((c, ord(c)))

print(f'Caracteres problemáticos encontrados: {len(problematic_chars)}')
for c, code in sorted(problematic_chars, key=lambda x: x[1]):
    print(f'  U+{code:04X} = {c}')

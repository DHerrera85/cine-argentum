#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

fixed = 0
for item in data.get('items', []):
    for i, actor in enumerate(item.get('actors', [])):
        if actor == 'Juan Minuján':
            item['actors'][i] = 'Juan Minujín'
            fixed += 1
            print(f"Corregido en: {item['title']}")

print(f"\nTotal corregido: {fixed}")

with open('data.json', 'w', encoding='utf-8-sig') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✓ data.json guardado")

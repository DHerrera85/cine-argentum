#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

# Buscar ejemplos corregidos
for item in data.get('items', []):
    for actor in item.get('actors', []):
        if 'Vicu' in str(actor) and 'ñ' in str(actor):
            print(f"Item: {item['title']}")
            print(f"Actor: {actor}")
            break

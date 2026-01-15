#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

movies = [it for it in data.get('items', []) if it.get('type') == 'pelicula']
missing = [it for it in movies if not it.get('image') or 'placeholder' in it.get('image', '').lower()]

print("Películas aún sin poster:")
for m in missing:
    print(f"  {m['title']} ({m['year']})")

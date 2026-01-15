#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

with open('data.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

count = 0
for item in data.get('items', []):
    for actor in item.get('actors', []):
        if 'Minuján' in str(actor) or 'Minujín' in str(actor):
            print(f"Title: {item['title']}, Actor: {actor}")
            count += 1

print(f"\nTotal encontrado: {count}")

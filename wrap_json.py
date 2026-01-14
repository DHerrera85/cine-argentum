import json

with open('data.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# Convertir a formato esperado
data = {'items': items if isinstance(items, list) else []}

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Converted to wrapped format. Total items: {len(data['items'])}")

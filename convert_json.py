import json

with open('data.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

items = d.get('items', d) if isinstance(d, dict) else d

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Converted. Total items: {len(items)}")

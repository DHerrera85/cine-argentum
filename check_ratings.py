import json

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filtrar por Canal 13
canal13 = [item for item in data.get('items', []) 
           if item.get('channel') and ('Canal 13' in item['channel'] or 'trece' in item['channel'].lower())]

print(f"Total Canal 13 series: {len(canal13)}")

# Contar cuantos tienen rating
with_rating = [item for item in canal13 if 'rating' in item and item['rating'] not in [None, '', 0]]
print(f"Con rating definido (no 0): {len(with_rating)}")

print("\n=== Primeros 15 items de Canal 13 ===")
for i, item in enumerate(canal13[:15]):
    rating = item.get('rating', 'NO TIENE')
    print(f"{i+1}. {item.get('id', 'SIN ID'):8} | {item['title']:30} | Rating: {rating}")

print("\n=== Items con rating definido (ordenado) ===")
def get_rating_num(item):
    r = item.get('rating')
    if r is None or r == '' or r == '-':
        return 0
    try:
        return float(r) if isinstance(r, str) else r
    except:
        return 0

for item in sorted(canal13, key=get_rating_num, reverse=True)[:10]:
    print(f"  {item['id']:8} | {item['title']:30} | Rating: {item.get('rating', 'N/A')}")

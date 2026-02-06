import json

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Buscar esos títulos específicos
titles_to_search = ['Sodero', 'Vulnerables']

for search_term in titles_to_search:
    items = [i for i in data.get('items', []) if search_term.lower() in i.get('title', '').lower()]
    print(f"\n=== Buscando: {search_term} ===")
    if items:
        for item in items:
            print(f"  ID: {item.get('id', 'N/A'):8} | Title: {item.get('title', 'N/A'):40} | Channel: {item.get('channel', 'N/A'):20} | Rating: {item.get('rating', 'N/A')}")
    else:
        print("  No encontrado")

# Ahora vamos a ver cuáles son los primeros items ordenados por rating en Canal 13
print("\n\n=== PRIMEROS 20 ITEMS DE CANAL 13 ORDENADOS POR RATING (Lógica actual) ===")
canal13 = [item for item in data.get('items', []) 
           if item.get('channel') and ('Canal 13' in item['channel'] or 'trece' in item['channel'].lower())]

def sort_key(item):
    rating = item.get('rating')
    if rating and rating != '-' and rating != '':
        try:
            return (-float(rating), item.get('title', ''))  # negativo para orden descendente
        except:
            return (float('inf'), item.get('title', ''))
    else:
        return (float('inf'), item.get('title', ''))

sorted_items = sorted(canal13, key=sort_key)

for i, item in enumerate(sorted_items[:20]):
    rating = item.get('rating', 'N/A')
    print(f"{i+1:2}. {item.get('id', 'N/A'):8} | {item.get('title', 'N/A'):40} | Rating: {str(rating):5}")

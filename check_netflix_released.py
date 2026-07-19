import urllib.request
import json
from datetime import datetime

r = urllib.request.urlopen('http://127.0.0.1:5502/data.json', timeout=10)
data = json.load(r)

today = datetime.now()
today_str = today.strftime('%Y-%m-%d')

released = []
for i in data['items']:
    # Check if it's Netflix
    channel = (i.get('channel', '') or '').lower()
    platforms = [str(p).lower() for p in (i.get('platforms', []) or [])]
    is_netflix = 'netflix' in channel or 'netflix' in platforms
    
    # Check if it's a movie
    is_movie = i.get('type') == 'pelicula'
    
    # Check if it has a release date
    release_date = i.get('release_date') or i.get('fecha_estreno') or ''
    
    if is_netflix and is_movie and release_date and release_date < today_str:
        released.append(i)

print(f'Released Netflix movies before {today_str}: {len(released)}')
for m in released[:10]:
    print(f"  - {m.get('title')} ({m.get('release_date') or m.get('fecha_estreno')})")

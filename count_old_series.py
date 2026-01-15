import json
from pathlib import Path

p = Path('old_series_data.json')
raw = p.read_bytes()
for enc in ('utf-8', 'utf-16', 'latin-1'):
	try:
		data = json.loads(raw.decode(enc))
		break
	except Exception:
		data = None

if data is None:
	raise SystemExit('Could not decode old_series_data.json')

items = data.get('items', data)
print('old items', len(items))
print('sample ids', [items[0].get('id'), items[1].get('id')])

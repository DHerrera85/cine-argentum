import json

with open('data.json') as f:
    d = json.load(f)

print(f"Type: {type(d)}")
if isinstance(d, list):
    print(f"List length: {len(d)}")
    if d:
        print(f"First item keys: {list(d[0].keys())}")
elif isinstance(d, dict):
    print(f"Dict keys: {list(d.keys())}")

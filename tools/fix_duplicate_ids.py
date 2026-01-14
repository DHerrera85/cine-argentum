import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = PROJECT_ROOT / 'data.json'
NEW_PREFIX = 'S'  # New IDs for non-movie duplicates
START_AT = 3000


def main():
    dry_run = '--dry-run' in sys.argv
    if not DATA_JSON.exists():
        print(f"Not found: {DATA_JSON}", file=sys.stderr)
        sys.exit(2)
    with DATA_JSON.open('r', encoding='utf-8') as f:
        data = json.load(f)
    items = data.get('items', []) if isinstance(data, dict) else data

    seen = {}
    duplicates = []
    for i, it in enumerate(items):
        idv = str(it.get('id', '')).strip()
        if not idv:
            continue
        if idv in seen:
            duplicates.append((i, idv))
        else:
            seen[idv] = i

    if not duplicates:
        print('No duplicate IDs found.')
        return

    # Determine next available number
    used_ids = set(seen.keys())
    current = START_AT - 1
    def next_id():
        nonlocal current
        current += 1
        nid = f"{NEW_PREFIX}{current}"
        while nid in used_ids:
            current += 1
            nid = f"{NEW_PREFIX}{current}"
        used_ids.add(nid)
        return nid

    updates = 0
    for idx, old_id in duplicates:
        # skip movies that already use 'P' prefix; create series prefix otherwise
        t = str(items[idx].get('type', '')).strip().lower()
        if t == 'pelicula':
            # use next available P-series after 4000
            prefix = 'P'
            num = 4000 + updates
            nid = f"{prefix}{num}"
            while nid in used_ids:
                num += 1
                nid = f"{prefix}{num}"
            used_ids.add(nid)
        else:
            nid = next_id()
        items[idx]['id'] = nid
        updates += 1
        print(f"Reassigned duplicate id '{old_id}' -> '{nid}' for item: {items[idx].get('title','')} ({items[idx].get('year','')})")

    if dry_run:
        print(f"Dry-run: would reassign {updates} duplicate IDs.")
        return

    with DATA_JSON.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Reassigned {updates} duplicate IDs.")

if __name__ == '__main__':
    main()

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = PROJECT_ROOT / 'data.json'
PLACEHOLDER_TEXT = 'Próximamente'


def main():
    dry_run = '--dry-run' in sys.argv
    if not DATA_JSON.exists():
        print(f"Not found: {DATA_JSON}", file=sys.stderr)
        sys.exit(2)
    with DATA_JSON.open('r', encoding='utf-8') as f:
        data = json.load(f)
    items = data.get('items', []) if isinstance(data, dict) else data

    updates = 0
    checked = 0
    for it in items:
        checked += 1
        t = str(it.get('type', '')).strip().lower()
        syn = str(it.get('synopsis', '')).strip()
        if t != 'pelicula' and not syn:
            it['synopsis'] = PLACEHOLDER_TEXT
            updates += 1

    if dry_run:
        print(f"Dry-run: would set placeholder on {updates} items (checked {checked}).")
        return

    if updates:
        with DATA_JSON.open('w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Set placeholder on {updates} items (checked {checked}).")
    else:
        print(f"No placeholders needed (checked {checked}).")

if __name__ == '__main__':
    main()

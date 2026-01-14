import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Dict, List, Tuple
from difflib import SequenceMatcher

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_JSON = PROJECT_ROOT / 'data.json'
IMG_VERT = PROJECT_ROOT / 'images' / 'verticals'
IMG_HORZ = PROJECT_ROOT / 'images' / 'horizontals-320x180'
PLACEHOLDER_V = 'images/verticals/placeholder-280x420.svg'
PLACEHOLDER_H = 'images/horizontals-320x180/placeholder-320x180.svg'

# --- helpers ---

def strip_accents(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c))

def normalize_text(s: str) -> str:
    s = strip_accents(s.lower())
    s = re.sub(r'[^a-z0-9\s-]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def slugify(s: str) -> str:
    s = normalize_text(s)
    s = s.replace(' ', '-')
    s = re.sub(r'-{2,}', '-', s)
    return s

# --- image index ---

def index_images(folder: Path) -> Dict[str, Path]:
    idx: Dict[str, Path] = {}
    if not folder.exists():
        return idx
    for p in folder.glob('*'):
        if p.is_file():
            name = p.stem  # filename without extension
            key = slugify(name)
            idx[key] = p
    return idx

# --- matching ---

def best_match(title: str, year: str, index: Dict[str, Path]) -> Tuple[float, Path]:
    title_slug = slugify(title)
    # exact
    if title_slug in index:
        return 1.0, index[title_slug]
    # contains / startswith / endswith
    for k, p in index.items():
        if title_slug in k or k in title_slug or k.startswith(title_slug) or title_slug.startswith(k):
            return 0.95, p
    # fuzzy: highest ratio (including year for better matches)
    best_ratio = 0.0
    best_path: Path = None
    search_with_year = f"{title_slug}-{year}" if year else title_slug
    for k, p in index.items():
        # Try matching with and without year
        r = SequenceMatcher(a=title_slug, b=k).ratio()
        if year and year in k:
            r = max(r, SequenceMatcher(a=search_with_year, b=k).ratio())
        if r > best_ratio:
            best_ratio = r
            best_path = p
    return best_ratio, best_path

# --- main ---

def main():
    dry_run = '--dry-run' in sys.argv
    # load data
    if not DATA_JSON.exists():
        print(f"Not found: {DATA_JSON}", file=sys.stderr)
        sys.exit(2)
    with DATA_JSON.open('r', encoding='utf-8') as f:
        data = json.load(f)
    items = data.get('items', []) if isinstance(data, dict) else data

    # build indexes
    idx_v = index_images(IMG_VERT)
    idx_h = index_images(IMG_HORZ)

    updates = 0
    checked = 0
    for it in items:
        title = str(it.get('title', '')).strip()
        if not title:
            continue
        orientation = str(it.get('orientation', 'vertical')).lower()
        image = str(it.get('image', '')).strip()
        # skip if already set and not placeholder
        if image and PLACEHOLDER_V not in image and PLACEHOLDER_H not in image:
            continue
        checked += 1
        idx = idx_v if orientation == 'vertical' else idx_h
        year = str(it.get('year', '')).strip()
        ratio, path = best_match(title, year, idx)
        # require reasonable confidence (lowered to 0.70 for better matching)
        if path and ratio >= 0.70:
            rel = path.relative_to(PROJECT_ROOT).as_posix()
            it['image'] = rel
            updates += 1

    if dry_run:
        print(f"Dry-run: would update {updates} items (checked {checked}).")
        return

    if updates:
        with DATA_JSON.open('w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {updates} items (checked {checked}).")
    else:
        print(f"No updates needed (checked {checked}).")

if __name__ == '__main__':
    main()

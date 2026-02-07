import json
import unicodedata
import re
from collections import defaultdict

SOURCE_FILE = "data.json"


STOPWORDS = {"de", "del", "la", "las", "los", "y"}


def strip_accents(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in text if not unicodedata.combining(ch))


def normalize_name(name: str) -> str:
    name = name.strip()
    name = strip_accents(name)
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s]", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def token_key(name: str) -> str:
    norm = normalize_name(name)
    tokens = [t for t in norm.split() if t and t not in STOPWORDS]
    # Drop 1-letter initials to avoid over-grouping
    tokens = [t for t in tokens if len(t) > 1]
    return " ".join(sorted(tokens))


with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

name_map = defaultdict(set)
count_map = defaultdict(int)
token_map = defaultdict(set)
token_count_map = defaultdict(int)

for item in data.get("items", []):
    for actor in item.get("actors", []) or []:
        if not isinstance(actor, str):
            continue
        norm = normalize_name(actor)
        if not norm:
            continue
        name_map[norm].add(actor)
        count_map[norm] += 1
        tkey = token_key(actor)
        if tkey:
            token_map[tkey].add(actor)
            token_count_map[tkey] += 1

# Only show groups with more than one distinct variant
candidates = [(norm, sorted(list(variants)), count_map[norm]) for norm, variants in name_map.items() if len(variants) > 1]
token_candidates = [(key, sorted(list(variants)), token_count_map[key]) for key, variants in token_map.items() if len(variants) > 1]

# Sort by number of variants, then total occurrences
candidates.sort(key=lambda x: (-len(x[1]), -x[2], x[0]))
token_candidates.sort(key=lambda x: (-len(x[1]), -x[2], x[0]))

print(f"Total posibles duplicados (normalizados): {len(candidates)}\n")
for norm, variants, total in candidates:
    print(f"- Normalizado: {norm} | Variantes: {len(variants)} | Apariciones: {total}")
    for v in variants:
        print(f"  - {v}")
    print("")

print(f"Total posibles duplicados (tokens reordenados): {len(token_candidates)}\n")
for key, variants, total in token_candidates:
    print(f"- Tokens: {key} | Variantes: {len(variants)} | Apariciones: {total}")
    for v in variants:
        print(f"  - {v}")
    print("")

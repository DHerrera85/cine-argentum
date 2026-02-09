import json
import re

SOURCE_FILE = "data.json"

with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

items = data.get("items", [])
updated = 0

for item in items:
    if "viewers" not in item:
        continue
    value = item["viewers"]
    if isinstance(value, str):
        raw = value.strip()
        if raw == "-":
            continue
        # Remove any separators and non-digits
        digits = re.sub(r"\D", "", raw)
        if digits:
            item["viewers"] = int(digits)
            updated += 1
    elif isinstance(value, (int, float)):
        # Keep numeric values as integers
        if isinstance(value, float):
            item["viewers"] = int(value)
            updated += 1

with open(SOURCE_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"Updated viewers fields: {updated}")

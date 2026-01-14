from pathlib import Path

IMG_VERT = Path('images/verticals')
posters = sorted([p.name for p in IMG_VERT.glob('*.png') if 'placeholder' not in p.name and 'poster' in p.name])

print(f"Total de archivos PNG con poster: {len(posters)}\n")
print("Primeros 50:")
for i, poster in enumerate(posters[:50], 1):
    print(f"{i:2d}. {poster}")

print(f"\n... y {len(posters) - 50} más" if len(posters) > 50 else "")

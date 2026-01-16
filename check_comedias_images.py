import re
import os

# Leer genero-comedias.html
with open('genero-comedias.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extraer todas las rutas de imágenes
img_paths = re.findall(r'src="(images/[^"]+)"', html_content)

# Verificar cuáles no existen
missing = []
for img_path in set(img_paths):
    if not os.path.exists(img_path):
        missing.append(img_path)

if missing:
    print(f'Imágenes faltantes en genero-comedias.html: {len(missing)}\n')
    for img in sorted(missing):
        print(img)
else:
    print('Todas las imágenes referenciadas existen!')

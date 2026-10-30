from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json
import math

BASE = Path(r"D:\Proyectos Github\CineArgentum")
DESTINO = BASE / "images" / "schedules-thumbnails"
DESTINO.mkdir(parents=True, exist_ok=True)

ANCHO = 1024
ALTO = 576

# Porcentaje vertical de la imagen que se conserva.
# Se excluye inicialmente el 20% inferior para intentar
# evitar los logos ubicados debajo de los actores.
RECORTES = {
    "T0040": 0.30,  # Mi Familia es un Dibujo
    "T0009": 0.25,  # Mi Cuñado
    "T0020": 0.10,  # Chiquititas
    "T0068": 0.35,  # Por Siempre Mujercitas
    "T0024": 0.10,  # Zíngara
}

PRODUCCIONES = {
    "T0040": "1996-mi-familia-es-un-dibujo",
    "T0009": "1996-mi-cunado",
    "T0020": "1996-chiquititas",
    "T0068": "1996-por-siempre-mujercitas",
    "T0024": "1996-zingara",
}

with open(BASE / "data.json", encoding="utf-8-sig") as archivo:
    datos = json.load(archivo)

catalogo = {
    item["id"]: item
    for item in datos["items"]
    if item.get("id")
}

resultados = []

for production_id, nombre in PRODUCCIONES.items():

    produccion = catalogo.get(production_id)

    if not produccion:
        print(f"No encontrada: {production_id}")
        continue

    rutas = [
        produccion.get("horizontal_image"),
        produccion.get("image"),
    ]

    origen = None

    for ruta in rutas:
        if ruta and (BASE / ruta).exists():
            origen = BASE / ruta
            break

    if origen is None:
        print(f"Sin imagen: {produccion['title']}")
        continue

    salida = DESTINO / f"{nombre}.webp"

    with Image.open(origen) as original:

        imagen = ImageOps.exif_transpose(original).convert("RGB")

        ancho, alto = imagen.size

        # Recorte personalizado según la producción
        recorte_inferior = RECORTES.get(production_id, 0.20)

        nuevo_alto = int(alto * (1 - recorte_inferior))

        imagen = imagen.crop(
            (0, 0, ancho, nuevo_alto)
        )

        # Adaptar a formato horizontal sin deformar
        imagen = ImageOps.fit(
            imagen,
            (ANCHO, ALTO),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.35)
        )

        imagen.save(
            salida,
            "WEBP",
            quality=92,
            method=6
        )

        resultados.append(
            (produccion["title"], salida)
        )

        print(f"Generada: {salida.name}")

# Crear una vista previa ampliada para revisión.
if resultados:

    COLUMNAS = 2
    CELDA_ANCHO = 380
    CELDA_ALTO = 250
    FILAS = math.ceil(len(resultados) / COLUMNAS)

    vista = Image.new(
        "RGB",
        (COLUMNAS * CELDA_ANCHO, FILAS * CELDA_ALTO),
        "#202832"
    )

    dibujo = ImageDraw.Draw(vista)

    for indice, (titulo, ruta) in enumerate(resultados):

        columna = indice % COLUMNAS
        fila = indice // COLUMNAS

        x = columna * CELDA_ANCHO
        y = fila * CELDA_ALTO

        with Image.open(ruta) as miniatura:
            ampliada = miniatura.resize(
                (320, 180),
                Image.Resampling.NEAREST
            )

            vista.paste(
                ampliada,
                (x + 25, y + 35)
            )

        dibujo.text(
            (x + 25, y + 12),
            titulo,
            fill="white"
        )

archivo_vista = DESTINO / "vista-previa-v2.png"

try:
    vista.save(str(archivo_vista), format="PNG")
    print(f"\nVista previa: {archivo_vista}")
except OSError as error:
    print(f"No se pudo guardar la vista previa: {error}")

    print(f"\nVista previa: {archivo_vista}")

print("\nPROCESO FINALIZADO")
print(f"Miniaturas generadas: {len(resultados)}")
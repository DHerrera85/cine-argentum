from pathlib import Path
from PIL import Image

BASE = Path(r"D:\Proyectos Github\CineArgentum")

CARPETAS = [
    {
        "origen": BASE / "images" / "verticals-280x420 non-scripted PNG",
        "destino": BASE / "images" / "verticals",
        "dimension": (280, 420),
    },
    {
        "origen": BASE / "images" / "horizontals-1024x576-non-scripted-PNG",
        "destino": BASE / "images" / "horizontals-1024x576",
        "dimension": (1024, 576),
    },
]

CALIDAD = 90

total_convertidas = 0
total_omitidas = 0

for carpeta in CARPETAS:

    origen = carpeta["origen"]
    destino = carpeta["destino"]
    dimension = carpeta["dimension"]

    if not origen.exists():
        print(f"Carpeta no encontrada: {origen}")
        continue

    destino.mkdir(parents=True, exist_ok=True)

    for archivo in origen.iterdir():

        if not archivo.is_file() or archivo.suffix.lower() != ".png":
            continue

        salida = destino / f"{archivo.stem}.webp"

        if salida.exists():
            print(f"Ya existe, se omite: {salida.name}")
            total_omitidas += 1
            continue

        try:
            with Image.open(archivo) as imagen:

                imagen.save(
                    salida,
                    "WEBP",
                    quality=CALIDAD,
                    method=6
                )

                print(f"Convertida: {archivo.name} -> {salida.name}")
                total_convertidas += 1

        except Exception as error:
            print(f"Error con {archivo.name}: {error}")

print("\nCONVERSIÓN FINALIZADA")
print(f"Convertidas: {total_convertidas}")
print(f"Omitidas: {total_omitidas}")
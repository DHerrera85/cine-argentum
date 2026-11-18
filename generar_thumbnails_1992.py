import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

BASE = Path(__file__).resolve().parent
CARPETA = BASE / "images" / "schedules-thumbnails"
ANCHO, ALTO = 320, 180

FICCIONES = {
    "T0007": "1992-brigada-cola",
    "T0001": "1992-amigos-son-los-amigos",
    "T0004": "1992-grande-pa",
    "T0006": "1992-el-gordo-y-el-flaco",
    "T0008": "1992-amores",
    "T0097": "1992-soy-gina",
    "T0093": "1992-la-banda-del-golden-rocket",
    "T0098": "1992-zona-de-riesgo",
    "T0096": "1992-son-de-diez",
    "T0055": "1992-princesa",
    "T0054": "1992-flavia-corazon-de-tiza",
    "T0108": "1992-los-libonatti",
    "T0151": "1992-corazones-de-fuego"
}

def buscar_imagen(item):
    for campo in ("horizontal_image", "image"):
        valor = item.get(campo)
        if valor:
            ruta = BASE / valor
            if ruta.is_file():
                return ruta
    return None

def crear_thumbnail(origen, destino):
    with Image.open(origen) as original:
        imagen = ImageOps.exif_transpose(original).convert("RGB")

    # Fondo desenfocado para conservar la imagen completa
    # sin cortar rostros ni otros elementos.
    fondo = ImageOps.fit(
        imagen,
        (ANCHO, ALTO),
        method=Image.Resampling.LANCZOS
    )

    from PIL import ImageFilter
    fondo = fondo.filter(ImageFilter.GaussianBlur(12))

    # Imagen principal: sin recortes.
    principal = ImageOps.contain(
        imagen,
        (ANCHO, ALTO),
        method=Image.Resampling.LANCZOS
    )

    x = (ANCHO - principal.width) // 2
    y = (ALTO - principal.height) // 2

    fondo.paste(principal, (x, y))

    destino.parent.mkdir(parents=True, exist_ok=True)
    fondo.save(destino, "WEBP", quality=88, method=6)

datos = json.loads(
    (BASE / "data.json").read_text(encoding="utf-8-sig")
)

catalogo = {
    item.get("id"): item
    for item in datos.get("items", [])
}

creadas = []
pendientes = []

for identificador, nombre in FICCIONES.items():
    item = catalogo.get(identificador)

    if not item:
        pendientes.append((identificador, "ID no encontrado"))
        continue

    origen = buscar_imagen(item)

    if not origen:
        pendientes.append((identificador, "Imagen no encontrada"))
        continue

    destino = CARPETA / (nombre + ".webp")
    crear_thumbnail(origen, destino)

    creadas.append((identificador, destino.name))
    print("OK:", identificador, destino.name)

print("\nTHUMBNAILS GENERADOS:", len(creadas))
print("PENDIENTES:", len(pendientes))

for identificador, motivo in pendientes:
    print("PENDIENTE:", identificador, motivo)

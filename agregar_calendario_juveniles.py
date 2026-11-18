from pathlib import Path
import sys


root = Path(__file__).resolve().parent
if not (root / "juveniles.html").exists():
    root = Path.cwd()

html = root / "juveniles.html"
js = root / "js" / "juveniles-rows-autosync.js"
css = root / "css" / "juveniles-catalog.css"

for path in (html, js, css):
    if not path.exists():
        sys.exit(f"Falta archivo: {path}")


def replace_once(path, old, new, label):
    text = path.read_text(encoding="utf-8-sig")
    if new in text:
        print(f"Ya actualizado: {label}")
        return
    if old not in text:
        sys.exit(f"No encuentro {label} en {path}; no se modifico el archivo")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"Actualizado: {path}")


replace_once(
    html,
    'css/juveniles-catalog.css?v=2.2',
    'css/juveniles-catalog.css?v=20261101-3',
    "version de juveniles-catalog.css",
)
replace_once(
    html,
    'css/juveniles-catalog.css?v=20261101-1',
    'css/juveniles-catalog.css?v=20261101-3',
    "actualizacion de juveniles-catalog.css",
)
replace_once(
    html,
    'css/juveniles-catalog.css?v=20261101-2',
    'css/juveniles-catalog.css?v=20261101-3',
    "actualizacion secundaria de juveniles-catalog.css",
)
replace_once(
    html,
    'js/juveniles-rows-autosync.js?v=20261101-5',
    'js/juveniles-rows-autosync.js?v=20261101-5',
    "version de juveniles-rows-autosync.js",
)

html_text = html.read_text(encoding="utf-8-sig")
required_markers = (
    'class="tiras-2000-section tiras-2000-calendar-section juveniles-calendar"',
    'id="juveniles-premieres-months"',
    'id="juveniles-premieres-year"',
    'id="juveniles-premieres-list"',
)
missing = [marker for marker in required_markers if marker not in html_text]
if missing:
    sys.exit("El calendario no tiene la estructura esperada: " + ", ".join(missing))

print("Calendario de estrenos juveniles: estructura validada")

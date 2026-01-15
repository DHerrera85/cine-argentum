import json
from pathlib import Path
from typing import List, Dict

DATA_PATH = Path("data.json")


def format_entry(item: Dict) -> str:
    actors = item.get("actors") or []
    return (
        f"{item.get('id','')} | {item.get('title','')} | "
        f"{item.get('year','')} | {item.get('channel','')} | "
        f"{item.get('genre','')} | actores:{len(actors)}"
    )


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8-sig"))
    items: List[Dict] = data.get("items", [])

    peliculas = [it for it in items if it.get("type") == "pelicula"]
    series = [it for it in items if it.get("type") != "pelicula"]

    # Write movies
    movies_path = Path("LISTADO_PELICULAS.txt")
    movies_path.write_text(
        "LISTADO DE PELÍCULAS\n" + "=" * 60 + "\n" +
        "\n".join(format_entry(it) for it in sorted(peliculas, key=lambda x: x.get("id",""))),
        encoding="utf-8",
    )

    # Write series
    series_path = Path("LISTADO_SERIES.txt")
    series_path.write_text(
        "LISTADO DE SERIES\n" + "=" * 60 + "\n" +
        "\n".join(format_entry(it) for it in sorted(series, key=lambda x: x.get("id",""))),
        encoding="utf-8",
    )

    print(f"Total items: {len(items)}")
    print(f"Películas: {len(peliculas)} -> {movies_path}")
    print(f"Series: {len(series)} -> {series_path}")

    # Quick sanity checks
    missing_imgs = [it for it in items if not it.get("image")]
    if missing_imgs:
        print(f"WARN: {len(missing_imgs)} items sin imagen")
    missing_syn = [it for it in items if not it.get("synopsis")]
    if missing_syn:
        print(f"WARN: {len(missing_syn)} items sin sinopsis")


if __name__ == "__main__":
    main()

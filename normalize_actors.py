import json
import pathlib
from typing import Iterable, List

# Canonical replacements for common typos/encoding issues
REPLACEMENTS = {
    "-": None,
    "Alberto Ammannn": "Alberto Ammann",
    "Ana María Orozco": "Ana Maria Orozco",  # prefer spelling indicado por el usuario
    "Araceli Gonzílez": "Araceli González",
    "Benjamin Amadeo": "Benjamín Amadeo",
    "Benjamin Rojas": "Benjamín Rojas",
    "Antonella Podestí": "Antonella Podestá",
    "Camila Pláate": "Camila Plaate",
    "Edda Dáaz": "Edda Díaz",
    "Eugenia Suarez": "Eugenia Suárez",
    "Eugenia Suírez": "Eugenia Suárez",
    "Inés Estevez": "Inés Estévez",
    "Fernín Mirís": "Fernán Mirás",
    "Fabiín Gianola": "Fabián Gianola",
    "Fabiín Vena": "Fabián Vena",
    "Germín Palacios": "Germán Palacios",
    "Guido Kackzca": "Guido Kaczka",
    "Gustavo Bermüdez": "Gustavo Bermúdez",
    "Gloria Carrí": "Gloria Carrá",
    "Jazmán Stuart": "Jazmín Stuart",
    "Ivín Espeche": "Iván Espeche",
    "Ivín Hochman": "Iván Hochman",
    "Joaquán Ferreira": "Joaquín Ferreira",
    "Joaquán Furriel": "Joaquín Furriel",
    "Jorge Romín": "Jorge Román",
    "Juan Minuji": "Juan Minujín",
    "Juan Minujin": "Juan Minujín",
    "Juliín Cerati": "Julián Cerati",
    "Juliín Romín": "Julián Román",
    "Julieta Dáaz": "Julieta Díaz",
    "Julio Chívez": "Julio Chávez",
    "Laurita Ferníndez": "Laurita Fernández",
    "Lali Gonzílez": "Lali González",
    "Leticia Bredice": "Leticia Brédice",
        "Liliana Gonzílez": "Liliana Gonzílez",
        "Liliana González": "Liliana González",
    "Luciano Cíceres": "Luciano Cáceres",
    "Luis Machán": "Luis Machín",
    "Malena Sínchez": "Malena Sánchez",
    "Maria Leal": "María Leal",
    "Maria Marull": "María Marull",
    "Maria Socas": "María Socas",
    "Mariano Martinez": "Mariano Martínez",
    "Mariano Martánez": "Mariano Martínez",
    "Mariano Gonzílez-Guerineau": "Mariano González-Guerineau",
    "Martán Bossi": "Martín Bossi",
    "Martán Piroyanski": "Martín Piroyansky",
    "Martán Slipak": "Martín Slipak",
    "Martin Garabal": "Martín Garabal",
    "Martin Seefeld": "Martín Seefeld",
    "Martina Gusman": "Martina Gusmán",
    "Martina Gusmín": "Martina Gusmán",
    "Maráa Leal": "María Leal",
    "Maráa Valenzuela": "María Valenzuela",
    "Matáas Desiderio": "Matías Desiderio",
    "Matáas Mayer": "Matías Mayer",
    "Matáas Recalt": "Matías Recalt",
    "Mercedes Morín": "Mercedes Morán",
    "Miguel üngel Rodráguez": "Miguel Ángel Rodríguez",
    "Milo Zeus Lis": "Milo Zeus Lis",
    "Moria Casín": "Moria Casán",
    "Miranda de la Serna": "Miranda De la Serna",
    "Natalia Ramárez": "Natalia Ramírez",
    "Nancy Duplaá": "Nancy Dupláa",
    "Nancy Duplía": "Nancy Dupláa",
    "Nico Garcáa Hume": "Nico García Hume",
    "Nico Vísquez": "Nico Vázquez",
    "Nicolís Cabré": "Nicolás Cabré",
    "Nicolís Francella": "Nicolás Francella",
    "Nicolís Goldschmidt": "Nicolás Goldschmidt",
    "Nicolís Pauls": "Nicolás Pauls",
    "Nicolás Vásquez": "Nicolás Vázquez",
    "Norbero Adrián Fernández": "Norberto Adrián Fernández",
    "Oscar Martinez": "Oscar Martínez",
    "Oscar Martánez": "Oscar Martínez",
    "Pablo Martánez": "Pablo Martínez",
    "Rodrigo Naya": "Rodrigo Noya",
    "Piru Síez": "Piru Sáez",
    "Raül Taibo": "Raúl Taibo",
    "Ricardo Darán": "Ricardo Darín",
    "Rocáo Igarzabal": "Rocío Igarzabal",
    "Rodrigo De La Serna": "Rodrigo de la Serna",
    "Rodrigo De la Serna": "Rodrigo de la Serna",
    "Sofáa Carrera": "Sofía Carrera",
    "Sofáa Gala": "Sofía Gala",
    "Sofáa Morandi": "Sofía Morandi",
    "Sofi Morandi": "Sofía Morandi",
    "Sofia Reca": "Sofía Reca",
    "Sebastiín Athié": "Sebastián Athié",
    "Sebastiín Estevanez": "Sebastián Estevanez",
    "Sebastiín Wainraich": "Sebastián Wainraich",
    "Susü Pecoraro": "Susú Pecoraro",
    "Thaás Rippel": "Thaís Rippel",
    "Tini Stoeseel": "Tini Stoessel",
    "Tomís De las Heras": "Tomás De las Heras",
    "Tomís Fonzi": "Tomás Fonzi",
    "Tomís Kirzner": "Tomás Kirzner",
    "Tomís Wicz": "Tomás Wicz",
    "Valentán Villafañe": "Valentín Villafañe",
    "Valeria Bertucelli": "Valeria Bertuccelli",
    "Vanesa Gonzílez": "Vanesa González",
    "Verónica Llinís": "Verónica Llinás",
    "Victor Varona": "Víctor Varona",
    "üngela Torres": "Ángela Torres",
}

SPLIT_ENTRIES = {
    "Malena Sánchez Dario Grandinetti": ["Malena Sánchez", "Darío Grandinetti"],
    "Ricardo Darín. Valeria Bertucelli": ["Ricardo Darín", "Valeria Bertuccelli"],
}


def split_actor(raw: str) -> List[str]:
    """Split an actor field into individual names (handles embedded newlines)."""
    raw = raw.replace("\r", "\n")
    parts: List[str] = []
    for piece in raw.split("\n"):
        name = piece.strip()
        if not name or name == "-":
            continue
        parts.append(name)
    return parts


def expand_actor(name: str) -> Iterable[str]:
    if name in SPLIT_ENTRIES:
        yield from SPLIT_ENTRIES[name]
    else:
        yield name


def normalize_name(name: str) -> str | None:
    if name in REPLACEMENTS:
        return REPLACEMENTS[name]
    return name


def main() -> None:
    path = pathlib.Path("data.json")
    data = json.loads(path.read_text(encoding="utf-8-sig"))

    total_repl = 0
    total_removed = 0
    total_split = 0

    for item in data.get("items", []):
        cleaned: List[str] = []
        seen = set()
        for raw_actor in item.get("actors", []):
            if not raw_actor:
                continue
            raw_str = str(raw_actor)
            total_split += int("\n" in raw_str)
            for partial in split_actor(raw_str):
                for name in expand_actor(partial):
                    normalized = normalize_name(name)
                    if normalized is None:
                        total_removed += 1
                        continue
                    if normalized != name:
                        total_repl += 1
                    if normalized not in seen:
                        seen.add(normalized)
                        cleaned.append(normalized)
        item["actors"] = cleaned

    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Done.")
    print(f"Replacements applied: {total_repl}")
    print(f"Removed empty/dash actors: {total_removed}")
    print(f"Split entries with newlines: {total_split}")


if __name__ == "__main__":
    main()

import pathlib

REPLACEMENTS = {
    "Adriín Navarro": "Adrián Navarro",
    "Adriín Suar": "Adrián Suar",
    "Agustán Aristarín": "Agustín Aristarán",
    "Agustán Bernasconi": "Agustín Bernasconi",
    "Agustán Sullivan": "Agustín Sullivan",
    "Alberto Amman": "Alberto Ammann",
    "Ana Maráa Orozco": "Ana Maria Orozco",
    "Ana Maráa Picchio": "Ana Maria Picchio",
    "Benjamán Amadeo": "Benjamín Amadeo",
    "Benjamán Vicuña": "Benjamín Vicuña",
    "Carlos Santamaráa": "Carlos Santamaría",
    "Carolina Ramárez": "Carolina Ramírez",
    "Chino Darin": "Chino Darín",
    "Chino Darán": "Chino Darín",
    "Claudia Fontín": "Claudia Fontán",
    "Damiín De Santo": "Damián De Santo",
    "Daráo Barassi": "Darío Barassi",
    "Daráo Grandinetti": "Darío Grandinetti",
    "Daráo Lopilato": "Darío Lopilato",
    "Delfina Chíves": "Delfina Cháves",
    "Diego Dománguez": "Diego Domínguez",
    "Diego Velásquez": "Diego Velázquez",
    "Diego Velízquez": "Diego Velázquez",
    "Eiza Gonzílez": "Eiza González",
    "Eláas Viñoles": "Elías Viñoles",
}


def main() -> None:
    path = pathlib.Path("data.json")
    text = path.read_text(encoding="utf-8")
    counts = {src: text.count(src) for src in REPLACEMENTS}

    updated = text
    for src, dst in REPLACEMENTS.items():
        updated = updated.replace(src, dst)

    path.write_text(updated, encoding="utf-8")

    print("Replacements applied:")
    for src, dst in REPLACEMENTS.items():
        count = counts[src]
        status = "MISSING" if count == 0 else str(count)
        print(f"{status:>7} | {src} -> {dst}")


if __name__ == "__main__":
    main()

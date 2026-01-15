import pathlib

REPLACEMENTS = {
    "Los ├Ünicos": "Los Únicos",
    "├Ültimo Primer Dáa": "Último Primer Día",
    "Sílvame Maráa": "Sálvame María",
    "Maráa Marta: El Crimen del Country": "María Marta: El Crimen del Country",
    "Casi üngeles": "Casi Ángeles",
    "Sueños Mígicos": "Sueños Mágicos",
    "Paraáso Rock": "Paraíso Rock",
    "Dáas de Gallos": "Días de Gallos",
    "30 Dáas Juntos": "30 Días Juntos",
    "Cien Dáas para Enamorarse": "Cien Días para Enamorarse",
    "Esperanza Máa": "Esperanza Mía",
    "Familia de Divín": "Familia de Diván",
    "Historias de Divín": "Historias de Diván",
    "Divina, estí en tu Corazón": "Divina, está en tu Corazón",
    "WTF! Con la müsica a otra parte": "WTF! Con la música a otra parte",
    "Jesüs, el Heredero": "Jesús, el Heredero",
    "Nafta Süper": "Nafta Súper",
    "TV Püblica": "TV Pública",
    "Comedia Romíntica": "Comedia Romántica",
    "Comedia romíntica": "Comedia romántica",
    "Comedia Dramítica": "Comedia Dramática",
    "Comedia dramítica": "Comedia dramática",
    "images/verticals/sue├▒a-conmigo-poster-280x420.png": "images/verticals/suena-conmigo-poster-280x420.png",
}


def main() -> None:
    path = pathlib.Path("data.json")
    text = path.read_text(encoding="utf-8")
    counts = {k: text.count(k) for k in REPLACEMENTS}
    new_text = text
    for src, dst in REPLACEMENTS.items():
        new_text = new_text.replace(src, dst)
    path.write_text(new_text, encoding="utf-8")

    print("Replacements summary:")
    for src, dst in REPLACEMENTS.items():
        n = counts[src]
        status = "MISSING" if n == 0 else n
        print(f"{status:>7} | {src} -> {dst}")


if __name__ == "__main__":
    main()

import json

# Cargar data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', [])

# IDs de las películas en genero-comedias.html (obtenidos del script anterior)
comedias_ids = {
    # Destacadas
    'P1147': 'Me Casé con un Boludo',
    'P1122': 'La Odisea de los Giles',
    'P1115': 'Homo Argentum',
    'P1125': 'Corazón de León',
    'P1024': 'Papá se Volvió Loco',
    'P1114': 'Un Novio para mi Mujer',
    # Guillermo Francella
    'P1224': 'Granizo',
    'P1026': 'Los Incorregibles',
    'P1130': 'Mi obra maestra',
    # Adrián Suar
    'P1083': 'Corazón Loco',
    'P1138': 'No Puedo Vivir Sin Ti',
    'P1067': 'El fútbol o yo',
    'P1137': 'Dos más dos',
    'P1041': 'Igualita a mí',
    'P1090': '30 Noches con mi Ex',
    'P1215': 'Cohen vs Rosi',
    'P1141': 'Mazel Tov',
    # Streaming
    'P1094': 'Casi Muerta',
    'P1091': 'Blondi',
    'P1088': 'Matrimillas',
    'P1092': 'Puan',
    'P1100': 'El Hombre que Amaba los Platos Voladores',
    'P1084': 'Ex Casados',
    'P1170': 'El Gerente',
    'P1229': 'Las Hermanas Fantásticas',
    # Grandes Éxitos
    'P1189': 'Un cuento chino',
    'P1005': 'Esa maldita costilla',
    'P1072': 'Re loca',
    'P1077': 'El cuento de las comadrejas',
    'P1117': 'Sin hijos',
    # Bañeros y Super Agentes
    'P1103': 'Bañeros 3, todopoderosos',
    'P1053': 'Bañeros 4: los rompeolas',
    'P1076': 'Bañeros 5: Lentos y cargosos',
    'P1187': 'Los Super Agentes: La Nueva Generación',
    # Historias de Amigos
    'P1150': 'Socios por accidente',
    'P1060': 'Permitidos',
    'P1199': 'Casi leyendas',
    'P1045': 'Extraños en la noche',
    'P1061': 'La última fiesta',
    'P1057': 'Voley',
    'P1201': 'Días de vinilo',
    'P1049': 'Vino para robar',
    'P1011': 'Déjala Correr',
    'P1013': 'Sólo por Hoy',
    # Para Seguir Riendo
    'P1036': 'Dos hermanos',
    'P1042': 'Mi primera boda',
    'P1079': 'No soy tu mami',
    'P1089': 'Más Respeto que soy Tu Madre',
    'P1097': 'Culpa Cero',
    'P1063': 'El rey del Once',
    'P1099': 'Transmitvah',
    # Comedias Negras
    'P1198': 'Peter Capusoto y sus 3 dimensiones',
    'P1038': 'Pájaros volando',
    'P1054': 'Kryptonita',
    'P1176': 'No Me Rompan',
    'P1070': '27: El club de los malditos'
}

# Crear diccionario con información completa
movie_info = {}

for item in items:
    movie_id = item.get('id')
    if movie_id in comedias_ids:
        title = item.get('title', '')
        year = item.get('year', '')
        espectadores = item.get('espectadores', '')
        
        movie_info[movie_id] = {
            'title': title,
            'year': year,
            'espectadores': espectadores
        }

# Imprimir información
print("=== INFORMACIÓN DE PELÍCULAS PARA GENERO-COMEDIAS.HTML ===\n")

for movie_id, info in sorted(movie_info.items()):
    title = info['title']
    year = info['year']
    espectadores = info['espectadores']
    
    # Formato para el HTML
    title_with_year = f"{title} ({year})" if year else title
    espectadores_text = f"{espectadores:,} espectadores".replace(',', '.') if espectadores else ""
    
    print(f"ID: {movie_id}")
    print(f"  Título original: {title}")
    print(f"  Título con año: {title_with_year}")
    print(f"  Espectadores: {espectadores_text if espectadores_text else 'N/A'}")
    print(f"  HTML sugerido:")
    print(f"    <strong>{title_with_year}</strong>")
    if espectadores_text:
        print(f"    <p>{espectadores_text}</p>")
    else:
        print(f"    <p></p>")
    print()

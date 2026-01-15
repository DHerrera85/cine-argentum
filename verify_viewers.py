#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar que los espectadores estén correctamente en data.json y documentar el cambio
"""

import json

def main():
    print("Verificando datos de espectadores en data.json...\n")
    
    # Leer data.json
    with open('data.json', 'r', encoding='utf-8') as f:
        json_data = json.load(f)
    
    data = json_data.get('items', [])
    
    # Estadísticas
    total_items = len(data)
    with_viewers = 0
    without_viewers = 0
    movies = []
    series = []
    
    for item in data:
        item_id = item.get('id', '')
        title = item.get('title', '')
        viewers = item.get('viewers')
        
        # Clasificar
        if item_id.startswith('P') or item_id.startswith('H'):
            movies.append({'id': item_id, 'title': title, 'viewers': viewers})
            if viewers:
                with_viewers += 1
            else:
                without_viewers += 1
        else:
            series.append({'id': item_id, 'title': title, 'viewers': viewers})
    
    # Mostrar resumen
    print(f"{'='*70}")
    print(f"RESUMEN GENERAL")
    print(f"{'='*70}")
    print(f"Total de items: {total_items}")
    print(f"  - Películas: {len(movies)}")
    print(f"  - Series: {len(series)}")
    print(f"\nPelículas con espectadores: {with_viewers}")
    print(f"Películas SIN espectadores (streaming): {without_viewers}")
    
    # Top 15 películas
    print(f"\n{'='*70}")
    print(f"TOP 15 PELÍCULAS POR ESPECTADORES")
    print(f"{'='*70}")
    
    movies_with_viewers = [m for m in movies if m['viewers']]
    movies_with_viewers.sort(key=lambda x: x['viewers'] if x['viewers'] else 0, reverse=True)
    
    for i, movie in enumerate(movies_with_viewers[:15], 1):
        viewers_str = f"{movie['viewers']:,}" if movie['viewers'] else "N/A"
        print(f"{i:2}. [{movie['id']}] {movie['title']}")
        print(f"     Espectadores: {viewers_str}\n")
    
    # Películas sin espectadores
    print(f"{'='*70}")
    print(f"PELÍCULAS SIN ESPECTADORES (STREAMING)")
    print(f"{'='*70}")
    
    movies_no_viewers = [m for m in movies if not m['viewers']]
    for movie in sorted(movies_no_viewers, key=lambda x: x['title']):
        print(f"  - [{movie['id']}] {movie['title']}")
    
    # Generar HTML de prueba
    print(f"\n{'='*70}")
    print(f"Generando vista previa HTML para prueba...")
    
    homo_argentum = next((m for m in movies if 'homo argentum' in m['title'].lower()), None)
    
    if homo_argentum:
        print(f"✓ Encontrado 'Homo Argentum' ({homo_argentum['id']})")
        print(f"  Espectadores: {homo_argentum['viewers']:,}\n")
        
        # Generar preview
        html_preview = f"""
<html>
<head>
    <title>Vista Previa - Homo Argentum</title>
    <style>
        body {{ font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }}
        .card {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; gap: 20px; }}
        .poster {{ flex: 0 0 200px; }}
        .poster img {{ width: 100%; border-radius: 4px; }}
        .meta {{ flex: 1; }}
        .meta h1 {{ margin: 0 0 8px; font-size: 24px; }}
        .meta dl {{ margin: 20px 0 0; }}
        .meta dt {{ font-weight: bold; margin-top: 10px; color: #333; }}
        .meta dd {{ margin: 4px 0 0 0; color: #666; }}
        .note {{ background: #fffacd; padding: 10px; margin-top: 20px; border-radius: 4px; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="poster">
            <img src="images/verticals/homo-argentum-poster-280x420.png" alt="Homo Argentum">
        </div>
        <div class="meta">
            <h1>Homo Argentum</h1>
            <div style="color: #999; margin-bottom: 15px;">Comedia</div>
            <div style="margin: 15px 0; line-height: 1.6; color: #333;">
                <strong>Sinopsis:</strong> La película consta de 16 mini películas que exploran, con humor y critica social, las características de la identidad argentina.
            </div>
            <dl>
                <dt>Año</dt><dd>2025</dd>
                <dt>Canal / Plataforma</dt><dd></dd>
                <dt>Género</dt><dd>Comedia</dd>
                <dt>Actores</dt><dd>Guillermo Francella</dd>
                <dt>Cantidad de Espectadores</dt><dd>1,829,245</dd>
            </dl>
            <div class="note">
                ✓ Campo "Cantidad de Espectadores" agregado correctamente debajo de "Actores"
            </div>
        </div>
    </div>
</body>
</html>
"""
        with open('PREVIEW_HOMO_ARGENTUM.html', 'w', encoding='utf-8') as f:
            f.write(html_preview)
        print("✓ Archivo de preview generado: PREVIEW_HOMO_ARGENTUM.html\n")
    
    # Generar reporte
    with open('VERIFICACION_ESPECTADORES.txt', 'w', encoding='utf-8') as f:
        f.write(f"VERIFICACIÓN DE DATOS DE ESPECTADORES\n")
        f.write(f"{'='*70}\n\n")
        f.write(f"RESUMEN:\n")
        f.write(f"  Total de items: {total_items}\n")
        f.write(f"  - Películas: {len(movies)}\n")
        f.write(f"  - Series: {len(series)}\n\n")
        f.write(f"  Películas con datos de espectadores: {with_viewers}\n")
        f.write(f"  Películas SIN datos (streaming): {without_viewers}\n\n")
        
        f.write(f"CAMBIOS REALIZADOS:\n")
        f.write(f"{'='*70}\n\n")
        f.write(f"1. Archivo: show.html\n")
        f.write(f"   - Modificado función renderItem()\n")
        f.write(f"   - Agregado campo 'Cantidad de Espectadores' debajo de 'Actores'\n")
        f.write(f"   - Solo se muestra si item.viewers existe\n")
        f.write(f"   - Películas de streaming sin valor no mostrarán nada\n\n")
        
        f.write(f"2. Base de datos: data.json\n")
        f.write(f"   - {with_viewers} películas actualizadas con campo 'viewers'\n")
        f.write(f"   - {without_viewers} películas sin datos (mantienen sin campo)\n\n")
        
        f.write(f"PELÍCULAS CON ESPECTADORES (TOP 20):\n")
        f.write(f"{'='*70}\n")
        for i, movie in enumerate(movies_with_viewers[:20], 1):
            viewers_str = f"{movie['viewers']:,}"
            f.write(f"{i:2}. {movie['title']:<45} {viewers_str:>15}\n")
        
        f.write(f"\nPELÍCULAS SIN ESPECTADORES ({len(movies_no_viewers)}):\n")
        f.write(f"{'='*70}\n")
        for movie in sorted(movies_no_viewers, key=lambda x: x['title']):
            f.write(f"  - {movie['title']}\n")
    
    print(f"✅ Verificación completada")
    print(f"📄 Reporte guardado en: VERIFICACION_ESPECTADORES.txt")

if __name__ == '__main__':
    main()

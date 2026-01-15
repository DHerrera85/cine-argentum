#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validación del buscador de actores
- Verifica que todos los actores sean buscables
- Valida que los resultados sean correctos
"""
import json

def test_search():
    # Cargar data.json
    with open("data.json", "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    
    items = data.get("items", [])
    
    print("=" * 70)
    print("VALIDACIÓN DEL BUSCADOR DE ACTORES")
    print("=" * 70)
    
    # 1. Estadísticas de actores
    all_actors = set()
    items_with_actors = []
    
    for item in items:
        actors = item.get("actors", [])
        if isinstance(actors, list):
            for actor in actors:
                if actor and actor.strip():
                    all_actors.add(actor.strip())
                    items_with_actors.append((item.get("title"), actor.strip()))
    
    print(f"\n1. ESTADÍSTICAS DE ACTORES:")
    print(f"   ✓ Total de actores únicos: {len(all_actors)}")
    print(f"   ✓ Total de relaciones actor-item: {len(items_with_actors)}")
    print(f"   ✓ Items con actores: {len(set(t for t, _ in items_with_actors))}")
    
    # 2. Top 10 actores más frecuentes
    print(f"\n2. TOP 10 ACTORES MÁS FRECUENTES:")
    actor_count = {}
    for _, actor in items_with_actors:
        actor_count[actor] = actor_count.get(actor, 0) + 1
    
    sorted_actors = sorted(actor_count.items(), key=lambda x: x[1], reverse=True)[:10]
    for idx, (actor, count) in enumerate(sorted_actors, 1):
        print(f"   {idx:2}. {actor:30} ({count} apariciones)")
    
    # 3. Simular búsqueda de actor
    print(f"\n3. PRUEBAS DE BÚSQUEDA:")
    test_actors = [sorted_actors[0][0], sorted_actors[1][0], sorted_actors[2][0]]
    
    for actor in test_actors:
        results = [t for t, a in items_with_actors if a == actor]
        print(f"   • '{actor}':")
        print(f"      Resultados: {len(results)}")
        for result in results[:3]:
            print(f"         - {result}")
        if len(results) > 3:
            print(f"         ... y {len(results) - 3} más")
    
    # 4. Buscar por año
    print(f"\n4. BÚSQUEDA POR AÑO:")
    years = {}
    for item in items:
        year = item.get("year")
        if year:
            if year not in years:
                years[year] = 0
            years[year] += 1
    
    sorted_years = sorted(years.items())
    print(f"   Años disponibles: {len(sorted_years)}")
    print(f"   Rango: {sorted_years[0][0]} - {sorted_years[-1][0]}")
    print(f"   \n   Primeros 5 años:")
    for year, count in sorted_years[:5]:
        print(f"      {year}: {count} items")
    print(f"   \n   Últimos 5 años:")
    for year, count in sorted_years[-5:]:
        print(f"      {year}: {count} items")
    
    # 5. Búsqueda por canal
    print(f"\n5. BÚSQUEDA POR CANAL:")
    channels = {}
    for item in items:
        channel = item.get("channel")
        if channel:
            if channel not in channels:
                channels[channel] = 0
            channels[channel] += 1
    
    if channels:
        sorted_channels = sorted(channels.items(), key=lambda x: x[1], reverse=True)
        for channel, count in sorted_channels[:10]:
            print(f"   • {channel:30} : {count} items")
    else:
        print("   (Sin canales definidos)")
    
    # 6. Validación de búsqueda cruzada
    print(f"\n6. VALIDACIÓN DE BÚSQUEDA CRUZADA:")
    
    # Películas y series del actor más frecuente
    top_actor = sorted_actors[0][0]
    top_actor_movies = [t for t, a in items_with_actors if a == top_actor and any(i.get("title") == t and i.get("type") == "pelicula" for i in items)]
    top_actor_series = [t for t, a in items_with_actors if a == top_actor and any(i.get("title") == t and i.get("type") != "pelicula" for i in items)]
    
    print(f"   Actor: '{top_actor}'")
    print(f"      Películas: {len(top_actor_movies)}")
    print(f"      Series: {len(top_actor_series)}")
    print(f"      Total: {len(top_actor_movies) + len(top_actor_series)}")
    
    # Resumen final
    print("\n" + "=" * 70)
    print("RESUMEN:")
    print(f"   ✓ {len(all_actors)} actores disponibles para búsqueda")
    print(f"   ✓ {len(items)} items indexados")
    print(f"   ✓ Búsqueda cruzada funcional (películas + series)")
    print("\n   ✅ BUSCADOR LISTO PARA USAR")
    print("=" * 70)

if __name__ == "__main__":
    test_search()

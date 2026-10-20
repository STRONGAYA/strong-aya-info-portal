#!/usr/bin/env python3
"""
Writes the outlines of the European countries to web/data/europe_countries.json.

The topic pages use these outlines to find out, in the browser, in which
country a visitor is: when the visitor allows the browser to share the
device position, the coordinates are matched against the outlines on the
visitor's own device, so they never leave the browser (see README.md,
"National networks for young people with cancer").

Source: Natural Earth, Admin 0 - Countries, 1:10m scale (public domain),
https://www.naturalearthdata.com/, read from the GeoJSON files published at
https://github.com/nvkelso/natural-earth-vector. Only Europe is kept (plus
Cyprus, Turkey and the Caucasus), Russia is cut off at 70 degrees east, and
the outlines are simplified (0.01 degrees, about 1 km; Russia 0.02) and
rounded to three decimals (about 100 m) to keep the file small. Standard library only.

Usage:
    python scripts/fetch_europe_countries.py [web/data/europe_countries.json]
        [--source FILE_OR_URL] [--tolerance DEGREES]

After writing the file the script checks it by locating a number of
European cities; it exits with status 1 when a city lands in the wrong
country.
"""
import argparse
import datetime
import json
import math
import re
import sys
import urllib.request

SOURCE_URL = ('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/'
              'master/geojson/ne_10m_admin_0_countries.geojson')
DEFAULT_OUTPUT = 'web/data/europe_countries.json'

# Countries that Natural Earth files under Asia but that belong to Europe
# here (Council of Europe members and Cyprus), by their ADM0_A3 code
EXTRA_COUNTRIES = {'CYP', 'TUR', 'GEO', 'ARM', 'AZE'}

# Territories that are part of another country, by ADM0_A3 code
MERGE_INTO = {'ALD': 'FI'}  # Åland is part of Finland

CLIP_EAST = 70.0      # degrees east; cuts off the Asian part of Russia
DROP_WEST_OF = -65.0  # drops polygons entirely west of this (Russia's bit beyond the antimeridian)
TOLERANCE = 0.01      # degrees (about 1 km); simplification tolerance
TOLERANCE_FACTOR = {'RU': 2}  # coarser outlines where precision matters less
DECIMALS = 3          # about 100 m
NEAR_DEGREES = 0.1    # a point this close (about 10 km) to a country counts as in it

# City checks (longitude, latitude, expected country code or None when
# the point lies outside the file's countries)
CHECKS = [
    ('Maastricht', 5.691, 50.851, 'NL'), ('Eijsden', 5.709, 50.780, 'NL'),
    ('Heerlen', 5.979, 50.888, 'NL'), ('Visé', 5.699, 50.738, 'BE'), ('Herzogenrath', 6.094, 50.869, 'DE'),
    ('Amsterdam', 4.900, 52.379, 'NL'), ('Scheveningen', 4.277, 52.108, 'NL'),
    ('Liège', 5.571, 50.633, 'BE'), ('Brussels', 4.352, 50.847, 'BE'),
    ('Aachen', 6.084, 50.776, 'DE'), ('Berlin', 13.405, 52.520, 'DE'),
    ('Luxembourg', 6.130, 49.611, 'LU'), ('London', -0.128, 51.507, 'GB'),
    ('Belfast', -5.930, 54.597, 'GB'), ('Dublin', -6.260, 53.350, 'IE'),
    ('Paris', 2.352, 48.857, 'FR'), ('Nice', 7.262, 43.710, 'FR'),
    ('Warsaw', 21.012, 52.230, 'PL'), ('Gdańsk', 18.646, 54.352, 'PL'),
    ('Rome', 12.496, 41.903, 'IT'), ('Venice', 12.327, 45.438, 'IT'),
    ('Bucharest', 26.103, 44.427, 'RO'), ('Constanța', 28.634, 44.173, 'RO'),
    ('Lisbon', -9.139, 38.722, 'PT'), ('Funchal', -16.909, 32.650, 'PT'),
    ('Madrid', -3.704, 40.417, 'ES'), ('Las Palmas', -15.413, 28.124, 'ES'),
    ('Vienna', 16.373, 48.208, 'AT'), ('Bern', 7.447, 46.948, 'CH'),
    ('Vaduz', 9.521, 47.141, 'LI'), ('Copenhagen', 12.568, 55.676, 'DK'),
    ('Oslo', 10.752, 59.914, 'NO'), ('Stockholm', 18.069, 59.329, 'SE'),
    ('Helsinki', 24.938, 60.170, 'FI'), ('Mariehamn', 19.935, 60.097, 'FI'),
    ('Reykjavik', -21.942, 64.146, 'IS'), ('Tallinn', 24.754, 59.437, 'EE'),
    ('Riga', 24.105, 56.950, 'LV'), ('Vilnius', 25.280, 54.687, 'LT'),
    ('Prague', 14.421, 50.088, 'CZ'), ('Bratislava', 17.107, 48.149, 'SK'),
    ('Budapest', 19.040, 47.498, 'HU'), ('Ljubljana', 14.506, 46.057, 'SI'),
    ('Zagreb', 15.982, 45.815, 'HR'), ('Split', 16.440, 43.509, 'HR'),
    ('Sarajevo', 18.413, 43.856, 'BA'), ('Belgrade', 20.457, 44.787, 'RS'),
    ('Podgorica', 19.263, 42.442, 'ME'), ('Pristina', 21.166, 42.663, 'XK'),
    ('Skopje', 21.432, 41.997, 'MK'), ('Tirana', 19.819, 41.328, 'AL'),
    ('Athens', 23.728, 37.984, 'GR'), ('Sofia', 23.322, 42.698, 'BG'),
    ('Chisinau', 28.858, 47.011, 'MD'), ('Kyiv', 30.524, 50.450, 'UA'),
    ('Minsk', 27.567, 53.902, 'BY'), ('Moscow', 37.618, 55.751, 'RU'),
    ('Novosibirsk', 82.921, 55.030, None), ('Istanbul', 28.979, 41.015, 'TR'),
    ('Limassol', 33.035, 34.675, 'CY'), ('Tbilisi', 44.827, 41.693, 'GE'),
    ('Yerevan', 44.515, 40.182, 'AM'), ('Baku', 49.867, 40.409, 'AZ'),
    ('Valletta', 14.514, 35.899, 'MT'), ('Monaco', 7.420, 43.738, 'MC'),
    ('Andorra la Vella', 1.521, 42.507, 'AD'), ('San Marino', 12.447, 43.936, 'SM'),
    ('Cayenne', -52.326, 4.933, 'FR'), ('New York', -74.006, 40.713, None),
    ('Tunis', 10.182, 36.806, None), ('Tel Aviv', 34.781, 32.085, None),
    ('Tangier', -5.813, 35.759, None), ('Mid North Sea', 3.0, 56.0, None),
]


def load_source(source):
    if re.match(r'https?://', source):
        request = urllib.request.Request(source, headers={'User-Agent': 'strong-aya-info-portal'})
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.load(response)
    with open(source, encoding='utf-8') as handle:
        return json.load(handle)


def iso2_of(properties):
    """The ISO 3166-1 alpha-2 code; ISO_A2_EH fills in the codes that
    Natural Earth leaves at -99 (France, Norway, Kosovo)."""
    for key in ('ISO_A2_EH', 'ISO_A2'):
        value = properties.get(key)
        if isinstance(value, str) and re.fullmatch(r'[A-Z]{2}', value):
            return value
    return None


def is_european(properties):
    return (properties.get('CONTINENT') == 'Europe'
            or properties.get('REGION_UN') == 'Europe'
            or properties.get('ADM0_A3') in EXTRA_COUNTRIES)


def clip_east(ring, xmax):
    """Keeps the part of a ring west of xmax (Sutherland-Hodgman against
    one half-plane); returns a closed ring, or [] when nothing is left."""
    points = ring[:-1] if len(ring) > 1 and ring[0] == ring[-1] else ring
    result = []
    for i, current in enumerate(points):
        previous = points[i - 1]
        current_in = current[0] <= xmax
        previous_in = previous[0] <= xmax
        if current_in != previous_in:
            t = (xmax - previous[0]) / (current[0] - previous[0])
            result.append([xmax, previous[1] + t * (current[1] - previous[1])])
        if current_in:
            result.append(current)
    if len(result) < 3:
        return []
    result.append(result[0])
    return result


def simplify(points, tolerance):
    """Douglas-Peucker; keeps the first and last point."""
    if len(points) < 3:
        return list(points)
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    tolerance_squared = tolerance * tolerance
    while stack:
        a, b = stack.pop()
        if b - a < 2:
            continue
        ax, ay = points[a]
        bx, by = points[b]
        dx, dy = bx - ax, by - ay
        length_squared = dx * dx + dy * dy
        farthest, index = -1.0, None
        for i in range(a + 1, b):
            px, py = points[i]
            if length_squared == 0:
                distance_squared = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / length_squared))
                distance_squared = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if distance_squared > farthest:
                farthest, index = distance_squared, i
        if farthest > tolerance_squared:
            keep[index] = True
            stack.append((a, index))
            stack.append((index, b))
    return [point for point, kept in zip(points, keep) if kept]


def clean_ring(ring):
    """Rounds the coordinates, drops repeated points and closes the ring;
    returns [] when fewer than three distinct points remain."""
    rounded = []
    for x, y in ring:
        point = [round(x, DECIMALS), round(y, DECIMALS)]
        if not rounded or point != rounded[-1]:
            rounded.append(point)
    if len(rounded) > 1 and rounded[0] == rounded[-1]:
        rounded.pop()
    if len(rounded) < 3:
        return []
    rounded.append(rounded[0])
    return rounded


def flatten(ring):
    return [value for point in ring for value in point]


def process_feature(geometry, tolerance):
    """The polygons of a feature as lists of flat rings (outer ring first,
    then holes), clipped, simplified and rounded."""
    if geometry['type'] == 'Polygon':
        polygons = [geometry['coordinates']]
    elif geometry['type'] == 'MultiPolygon':
        polygons = geometry['coordinates']
    else:
        return []
    result = []
    for polygon in polygons:
        if max(point[0] for point in polygon[0]) < DROP_WEST_OF:
            continue
        rings = []
        for ring in polygon:
            cleaned = clean_ring(simplify(clip_east(ring, CLIP_EAST), tolerance))
            if cleaned:
                rings.append(flatten(cleaned))
            elif not rings:
                break  # the outer ring vanished: skip this polygon
        if rings:
            result.append(rings)
    return result


def build(source_data, tolerance):
    countries = {}
    for feature in source_data['features']:
        properties = feature['properties']
        if not is_european(properties):
            continue
        adm0 = properties.get('ADM0_A3')
        iso2 = MERGE_INTO.get(adm0) or iso2_of(properties)
        if not iso2:
            print('skipped (no ISO code):', properties.get('NAME_EN'), file=sys.stderr)
            continue
        polygons = process_feature(feature['geometry'], tolerance * TOLERANCE_FACTOR.get(iso2, 1))
        if not polygons:  # too small for the tolerance (e.g. Vatican City): keep its outline as it is
            polygons = process_feature(feature['geometry'], 0.0)
        entry = countries.setdefault(iso2, {'iso2': iso2, 'name': None, 'polygons': []})
        if adm0 not in MERGE_INTO or entry['name'] is None:
            entry['name'] = properties.get('NAME_EN') or properties.get('NAME')
        entry['polygons'].extend(polygons)
    for iso2 in [key for key, entry in countries.items() if not entry['polygons']]:
        print('skipped (no outline left):', countries.pop(iso2)['name'], file=sys.stderr)
    for entry in countries.values():
        xs = [v for polygon in entry['polygons'] for ring in polygon for v in ring[0::2]]
        ys = [v for polygon in entry['polygons'] for ring in polygon for v in ring[1::2]]
        entry['bbox'] = [min(xs), min(ys), max(xs), max(ys)]
    ordered = [countries[key] for key in sorted(countries)]
    return {
        'source': 'Natural Earth, Admin 0 - Countries, 1:10m (public domain), '
                  'https://www.naturalearthdata.com/',
        'generated': datetime.date.today().isoformat(),
        'simplified': {'tolerance_degrees': tolerance, 'decimals': DECIMALS, 'clip_east_degrees': CLIP_EAST},
        'near_degrees': NEAR_DEGREES,
        'countries': [{'iso2': e['iso2'], 'name': e['name'], 'bbox': e['bbox'], 'polygons': e['polygons']}
                      for e in ordered],
    }


# --- Lookup: the same algorithm as countryAtPoint() in web/js/portal.js ---

def ring_contains(ring, x, y):
    inside = False
    count = len(ring) // 2
    j = count - 1
    for i in range(count):
        xi, yi = ring[2 * i], ring[2 * i + 1]
        xj, yj = ring[2 * j], ring[2 * j + 1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def ring_distance(ring, x, y, cos_lat):
    """Distance (in degrees of latitude) from the point to the ring's edge."""
    best = float('inf')
    count = len(ring) // 2
    for i in range(count - 1):
        ax, ay = (ring[2 * i] - x) * cos_lat, ring[2 * i + 1] - y
        bx, by = (ring[2 * i + 2] - x) * cos_lat, ring[2 * i + 3] - y
        dx, dy = bx - ax, by - ay
        length_squared = dx * dx + dy * dy
        t = 0.0 if length_squared == 0 else max(0.0, min(1.0, -(ax * dx + ay * dy) / length_squared))
        distance_squared = (ax + t * dx) ** 2 + (ay + t * dy) ** 2
        if distance_squared < best:
            best = distance_squared
    return math.sqrt(best)


def country_at(data, x, y):
    """The country containing the point, else the nearest country within
    NEAR_DEGREES (simplified coastlines leave coastal cities just
    offshore), else None."""
    near = data.get('near_degrees', NEAR_DEGREES)
    cos_lat = math.cos(math.radians(y))
    nearest, nearest_distance = None, near
    for country in data['countries']:
        bbox = country['bbox']
        if x < bbox[0] - near or x > bbox[2] + near or y < bbox[1] - near or y > bbox[3] + near:
            continue
        for polygon in country['polygons']:
            if ring_contains(polygon[0], x, y):
                if not any(ring_contains(hole, x, y) for hole in polygon[1:]):
                    return country['iso2']
                continue
            distance = ring_distance(polygon[0], x, y, cos_lat)
            if distance < nearest_distance:
                nearest, nearest_distance = country['iso2'], distance
    return nearest


def check(data):
    failures = 0
    for name, x, y, expected in CHECKS:
        found = country_at(data, x, y)
        if found != expected:
            failures += 1
            print(f'CHECK FAILED: {name} -> {found}, expected {expected}', file=sys.stderr)
    print(f'checked {len(CHECKS)} cities, {failures} wrong')
    return failures == 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('output', nargs='?', default=DEFAULT_OUTPUT)
    parser.add_argument('--source', default=SOURCE_URL, help='GeoJSON file or URL (default: Natural Earth 1:10m)')
    parser.add_argument('--tolerance', type=float, default=TOLERANCE, help='simplification tolerance in degrees')
    args = parser.parse_args()

    data = build(load_source(args.source), args.tolerance)
    with open(args.output, 'w', encoding='utf-8') as handle:
        json.dump(data, handle, separators=(',', ':'), ensure_ascii=False)
    points = sum(len(ring) // 2 for c in data['countries'] for polygon in c['polygons'] for ring in polygon)
    print(f"wrote {args.output}: {len(data['countries'])} countries, {points} points")
    sys.exit(0 if check(data) else 1)


if __name__ == '__main__':
    main()

import { SearchResult } from '../types';
import { CONTINENTS_AND_OCEANS, ALL_COUNTRIES, ALL_STATES, ALL_PLACES, NEItem } from '../data/naturalEarthIndex';

export async function searchLocation(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  // Check direct coordinate format (e.g. "13.0827, 80.2707" or "13.0827 80.2707")
  const coordRegex = /^([-+]?\d{1,2}\.?\d*)[,\s]+([-+]?\d{1,3}\.?\d*)$/;
  const match = trimmed.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [{
        displayName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
        lat,
        lon,
        type: 'coordinate',
        category: 'coordinate',
      }];
    }
  }

  const results: SearchResult[] = [];

  // 1. Search Continents & Oceans
  CONTINENTS_AND_OCEANS.forEach((item) => {
    if (item.name.toLowerCase().includes(trimmed)) {
      results.push({
        displayName: item.name,
        lat: item.lat,
        lon: item.lon,
        type: item.category,
        category: item.category,
      });
    }
  });

  // 2. Search Countries
  ALL_COUNTRIES.forEach((c) => {
    if (c.name.toLowerCase().includes(trimmed)) {
      results.push({
        displayName: c.name,
        lat: c.lat,
        lon: c.lon,
        type: 'country',
        category: 'country',
      });
    }
  });

  // 3. Search States / Provinces
  ALL_STATES.forEach((s) => {
    if (s.name.toLowerCase().includes(trimmed)) {
      results.push({
        displayName: s.country ? `${s.name}, ${s.country}` : s.name,
        lat: s.lat,
        lon: s.lon,
        type: 'state',
        category: 'state',
      });
    }
  });

  // 4. Search Populated Places (Cities / Towns)
  ALL_PLACES.forEach((p) => {
    if (p.name.toLowerCase().includes(trimmed)) {
      results.push({
        displayName: p.state ? `${p.name}, ${p.state}, ${p.country}` : p.country ? `${p.name}, ${p.country}` : p.name,
        lat: p.lat,
        lon: p.lon,
        type: p.category,
        category: p.category,
      });
    }
  });

  if (results.length > 0) {
    return results.slice(0, 10);
  }

  // 5. Fallback to Nominatim OSM API if not found in local Natural Earth dataset
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'OceanVis3D-SIH2026/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.map((item: any) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        boundingbox: item.boundingbox,
        type: item.type || item.class,
        category: item.type || 'place',
      }));
    }
  } catch (error) {
    console.warn('Geocoding notice:', error);
  }

  return [];
}

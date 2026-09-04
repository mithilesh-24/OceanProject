import placesData from './natural_earth_places.json';
import countriesData from './natural_earth_countries.json';
import statesData from './natural_earth_states.json';

export interface NEItem {
  id: string;
  name: string;
  category: 'continent' | 'ocean' | 'sea' | 'country' | 'state' | 'city' | 'place';
  lat: number;
  lon: number;
  pop?: number;
  rank?: number;
  country?: string;
  state?: string;
}

// Fixed Continents and Oceans dataset
export const CONTINENTS_AND_OCEANS: NEItem[] = [
  { id: 'cont-asia', name: 'ASIA', category: 'continent', lat: 34.0479, lon: 100.6197, pop: 4600000000 },
  { id: 'cont-africa', name: 'AFRICA', category: 'continent', lat: 8.7832, lon: 34.5085, pop: 1300000000 },
  { id: 'cont-europe', name: 'EUROPE', category: 'continent', lat: 54.5260, lon: 15.2551, pop: 740000000 },
  { id: 'cont-na', name: 'NORTH AMERICA', category: 'continent', lat: 54.5260, lon: -105.2551, pop: 580000000 },
  { id: 'cont-sa', name: 'SOUTH AMERICA', category: 'continent', lat: -8.7832, lon: -55.4915, pop: 430000000 },
  { id: 'cont-aus', name: 'AUSTRALIA', category: 'continent', lat: -25.2744, lon: 133.7751, pop: 40000000 },
  { id: 'cont-ant', name: 'ANTARCTICA', category: 'continent', lat: -82.8628, lon: 135.0000, pop: 1000 },

  { id: 'oc-pacific', name: 'Pacific Ocean', category: 'ocean', lat: 0.0, lon: -160.0 },
  { id: 'oc-atlantic', name: 'Atlantic Ocean', category: 'ocean', lat: 0.0, lon: -30.0 },
  { id: 'oc-indian', name: 'Indian Ocean', category: 'ocean', lat: -20.0, lon: 80.0 },
  { id: 'oc-arctic', name: 'Arctic Ocean', category: 'ocean', lat: 85.0, lon: 0.0 },
  { id: 'oc-southern', name: 'Southern Ocean', category: 'ocean', lat: -65.0, lon: 0.0 },

  { id: 'sea-arabian', name: 'Arabian Sea', category: 'sea', lat: 15.0, lon: 65.0 },
  { id: 'sea-bob', name: 'Bay of Bengal', category: 'sea', lat: 15.0, lon: 88.0 },
  { id: 'sea-andaman', name: 'Andaman Sea', category: 'sea', lat: 10.0, lon: 95.0 },
  { id: 'sea-red', name: 'Red Sea', category: 'sea', lat: 20.0, lon: 38.0 },
  { id: 'sea-med', name: 'Mediterranean Sea', category: 'sea', lat: 35.0, lon: 18.0 },
  { id: 'sea-scs', name: 'South China Sea', category: 'sea', lat: 12.0, lon: 113.0 },
];

export const ALL_COUNTRIES: NEItem[] = (countriesData as any[]).map((c, i) => ({
  id: `c-${i}`,
  name: c.name,
  category: 'country',
  lat: c.lat,
  lon: c.lon,
  pop: c.pop,
}));

export const ALL_STATES: NEItem[] = (statesData as any[]).map((s, i) => ({
  id: `s-${i}`,
  name: s.name,
  category: 'state',
  country: s.country,
  lat: s.lat,
  lon: s.lon,
}));

export const ALL_PLACES: NEItem[] = (placesData as any[]).map((p, i) => ({
  id: `p-${i}`,
  name: p.name,
  category: p.rank <= 3 ? 'city' : 'place',
  lat: p.lat,
  lon: p.lon,
  pop: p.pop,
  rank: p.rank,
  country: p.country,
  state: p.state,
}));

export interface GeoLabelItem {
  id: string;
  name: string;
  category: 'continent' | 'ocean' | 'sea' | 'country' | 'state' | 'city';
  lat: number;
  lon: number;
  minAlt: number; // meters
  maxAlt: number; // meters
  parent?: string;
  font?: string;
  color?: string;
}

export const GEOGRAPHIC_DATASET: GeoLabelItem[] = [
  // ==================== CONTINENTS ====================
  { id: 'cont-asia', name: 'ASIA', category: 'continent', lat: 34.0479, lon: 100.6197, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-africa', name: 'AFRICA', category: 'continent', lat: 8.7832, lon: 34.5085, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-europe', name: 'EUROPE', category: 'continent', lat: 54.5260, lon: 15.2551, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-na', name: 'NORTH AMERICA', category: 'continent', lat: 54.5260, lon: -105.2551, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-sa', name: 'SOUTH AMERICA', category: 'continent', lat: -8.7832, lon: -55.4915, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-aus', name: 'AUSTRALIA', category: 'continent', lat: -25.2744, lon: 133.7751, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },
  { id: 'cont-ant', name: 'ANTARCTICA', category: 'continent', lat: -82.8628, lon: 135.0000, minAlt: 2000000, maxAlt: 50000000, font: 'bold 18px Inter, sans-serif', color: '#f3f4f6' },

  // ==================== OCEANS ====================
  { id: 'oc-pacific', name: 'Pacific Ocean', category: 'ocean', lat: 0.0, lon: -160.0, minAlt: 1500000, maxAlt: 50000000, font: 'italic 16px Inter, sans-serif', color: '#38bdf8' },
  { id: 'oc-atlantic', name: 'Atlantic Ocean', category: 'ocean', lat: 0.0, lon: -30.0, minAlt: 1500000, maxAlt: 50000000, font: 'italic 16px Inter, sans-serif', color: '#38bdf8' },
  { id: 'oc-indian', name: 'Indian Ocean', category: 'ocean', lat: -20.0, lon: 80.0, minAlt: 1500000, maxAlt: 50000000, font: 'italic 16px Inter, sans-serif', color: '#38bdf8' },
  { id: 'oc-arctic', name: 'Arctic Ocean', category: 'ocean', lat: 85.0, lon: 0.0, minAlt: 1500000, maxAlt: 50000000, font: 'italic 16px Inter, sans-serif', color: '#38bdf8' },
  { id: 'oc-southern', name: 'Southern Ocean', category: 'ocean', lat: -65.0, lon: 0.0, minAlt: 1500000, maxAlt: 50000000, font: 'italic 16px Inter, sans-serif', color: '#38bdf8' },

  // ==================== MAJOR SEAS ====================
  { id: 'sea-arabian', name: 'Arabian Sea', category: 'sea', lat: 15.0, lon: 65.0, minAlt: 100000, maxAlt: 6000000, font: 'italic 14px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-bob', name: 'Bay of Bengal', category: 'sea', lat: 15.0, lon: 88.0, minAlt: 100000, maxAlt: 6000000, font: 'italic 14px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-andaman', name: 'Andaman Sea', category: 'sea', lat: 10.0, lon: 95.0, minAlt: 50000, maxAlt: 4000000, font: 'italic 13px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-laccadive', name: 'Laccadive Sea', category: 'sea', lat: 8.0, lon: 75.0, minAlt: 50000, maxAlt: 3000000, font: 'italic 13px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-red', name: 'Red Sea', category: 'sea', lat: 20.0, lon: 38.0, minAlt: 50000, maxAlt: 5000000, font: 'italic 13px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-med', name: 'Mediterranean Sea', category: 'sea', lat: 35.0, lon: 18.0, minAlt: 100000, maxAlt: 6000000, font: 'italic 14px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-scs', name: 'South China Sea', category: 'sea', lat: 12.0, lon: 113.0, minAlt: 100000, maxAlt: 6000000, font: 'italic 14px Inter, sans-serif', color: '#7dd3fc' },
  { id: 'sea-coral', name: 'Coral Sea', category: 'sea', lat: -18.0, lon: 152.0, minAlt: 100000, maxAlt: 5000000, font: 'italic 13px Inter, sans-serif', color: '#7dd3fc' },

  // ==================== COUNTRIES ====================
  { id: 'country-ind', name: 'India', category: 'country', lat: 20.5937, lon: 78.9629, minAlt: 300000, maxAlt: 12000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-usa', name: 'United States', category: 'country', lat: 37.0902, lon: -95.7129, minAlt: 500000, maxAlt: 15000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-chn', name: 'China', category: 'country', lat: 35.8617, lon: 104.1954, minAlt: 500000, maxAlt: 15000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-bra', name: 'Brazil', category: 'country', lat: -14.2350, lon: -51.9253, minAlt: 500000, maxAlt: 15000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-rus', name: 'Russia', category: 'country', lat: 61.5240, lon: 105.3188, minAlt: 800000, maxAlt: 20000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-aus', name: 'Australia', category: 'country', lat: -25.2744, lon: 133.7751, minAlt: 500000, maxAlt: 15000000, font: 'bold 15px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-gbr', name: 'United Kingdom', category: 'country', lat: 55.3781, lon: -3.4360, minAlt: 100000, maxAlt: 5000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-fra', name: 'France', category: 'country', lat: 46.2276, lon: 2.2137, minAlt: 100000, maxAlt: 5000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-deu', name: 'Germany', category: 'country', lat: 51.1657, lon: 10.4515, minAlt: 100000, maxAlt: 5000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-jpn', name: 'Japan', category: 'country', lat: 36.2048, lon: 138.2529, minAlt: 100000, maxAlt: 5000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-sza', name: 'South Africa', category: 'country', lat: -30.5595, lon: 22.9375, minAlt: 200000, maxAlt: 8000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-egy', name: 'Egypt', category: 'country', lat: 26.8206, lon: 30.8025, minAlt: 200000, maxAlt: 8000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-srb', name: 'Saudi Arabia', category: 'country', lat: 23.8859, lon: 45.0792, minAlt: 300000, maxAlt: 10000000, font: 'bold 14px Inter, sans-serif', color: '#ffffff' },
  { id: 'country-sri', name: 'Sri Lanka', category: 'country', lat: 7.8731, lon: 80.7718, minAlt: 50000, maxAlt: 3000000, font: 'bold 13px Inter, sans-serif', color: '#ffffff' },

  // ==================== STATES / PROVINCES ====================
  { id: 'state-tn', name: 'Tamil Nadu', category: 'state', parent: 'India', lat: 11.1271, lon: 78.6569, minAlt: 20000, maxAlt: 1500000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-kl', name: 'Kerala', category: 'state', parent: 'India', lat: 10.8505, lon: 76.2711, minAlt: 20000, maxAlt: 1500000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-ka', name: 'Karnataka', category: 'state', parent: 'India', lat: 15.3173, lon: 75.7139, minAlt: 20000, maxAlt: 1500000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-mh', name: 'Maharashtra', category: 'state', parent: 'India', lat: 19.7515, lon: 75.7139, minAlt: 30000, maxAlt: 2000000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-gj', name: 'Gujarat', category: 'state', parent: 'India', lat: 22.2587, lon: 71.1924, minAlt: 30000, maxAlt: 2000000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-ap', name: 'Andhra Pradesh', category: 'state', parent: 'India', lat: 15.9129, lon: 79.7400, minAlt: 30000, maxAlt: 2000000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-wb', name: 'West Bengal', category: 'state', parent: 'India', lat: 22.9868, lon: 87.8550, minAlt: 30000, maxAlt: 2000000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-cal', name: 'California', category: 'state', parent: 'United States', lat: 36.7783, lon: -119.4179, minAlt: 50000, maxAlt: 2500000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },
  { id: 'state-ny', name: 'New York', category: 'state', parent: 'United States', lat: 40.7128, lon: -74.0060, minAlt: 30000, maxAlt: 2000000, font: '600 13px Inter, sans-serif', color: '#e2e8f0' },

  // ==================== CITIES ====================
  { id: 'city-chennai', name: 'Chennai', category: 'city', parent: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-mumbai', name: 'Mumbai', category: 'city', parent: 'Maharashtra', lat: 19.0760, lon: 72.8777, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-delhi', name: 'New Delhi', category: 'city', parent: 'India', lat: 28.6139, lon: 77.2090, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-bengaluru', name: 'Bengaluru', category: 'city', parent: 'Karnataka', lat: 12.9716, lon: 77.5946, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-kochi', name: 'Kochi', category: 'city', parent: 'Kerala', lat: 9.9312, lon: 76.2673, minAlt: 0, maxAlt: 500000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-kolkata', name: 'Kolkata', category: 'city', parent: 'West Bengal', lat: 22.5726, lon: 88.3639, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-london', name: 'London', category: 'city', parent: 'United Kingdom', lat: 51.5074, lon: -0.1278, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-ny', name: 'New York City', category: 'city', parent: 'New York', lat: 40.7128, lon: -74.0060, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-tokyo', name: 'Tokyo', category: 'city', parent: 'Japan', lat: 35.6762, lon: 139.6503, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-sydney', name: 'Sydney', category: 'city', parent: 'Australia', lat: -33.8688, lon: 151.2093, minAlt: 0, maxAlt: 800000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-colombo', name: 'Colombo', category: 'city', parent: 'Sri Lanka', lat: 6.9271, lon: 79.8612, minAlt: 0, maxAlt: 500000, font: '500 12px Inter, sans-serif', color: '#cbd5e1' },
  { id: 'city-everest', name: 'Mount Everest', category: 'city', parent: 'Himalayas', lat: 27.9881, lon: 86.9250, minAlt: 0, maxAlt: 600000, font: 'bold 12px Inter, sans-serif', color: '#fca5a5' },
];

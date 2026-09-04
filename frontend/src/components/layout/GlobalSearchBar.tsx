import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Globe, Database, Radio, Waves, BarChart2, ArrowRight } from 'lucide-react';
import { searchLocation } from '../../utils/geocoding';

interface SearchCategoryResult {
  category: 'Pages & Routes' | 'Datasets' | 'Argo Floats' | 'Numerical Models' | 'Earth Places';
  title: string;
  subtitle?: string;
  path?: string;
  icon: any;
  action?: () => void;
}

const STATIC_QUICK_SEARCH: SearchCategoryResult[] = [
  { category: 'Pages & Routes', title: 'Ocean Explorer 3D Globe', subtitle: 'Live INCOIS Argo & Earth GIS', path: '/explorer', icon: Globe },
  { category: 'Pages & Routes', title: 'Dataset Catalog', subtitle: 'Browse all in-situ and model feeds', path: '/datasets', icon: Database },
  { category: 'Pages & Routes', title: 'Model vs Observation Comparison', subtitle: 'Statistical error metrics & depth matching', path: '/comparison', icon: BarChart2 },
  { category: 'Pages & Routes', title: 'Accuracy Assessment', subtitle: 'Bias, MAE, RMSE and R² analytics', path: '/accuracy', icon: BarChart2 },
  { category: 'Pages & Routes', title: 'Error Analysis Heatmaps', subtitle: 'Spatial model error distributions', path: '/errors', icon: BarChart2 },
  { category: 'Pages & Routes', title: 'Anomaly Detection', subtitle: 'Marine heatwaves & unexpected readings', path: '/anomalies', icon: BarChart2 },
  { category: 'Numerical Models', title: 'HYCOM 1/12° Global Ocean Model', subtitle: 'High-resolution ocean circulation', path: '/models/hycom', icon: Waves },
  { category: 'Numerical Models', title: 'ROMS Regional Ocean Modeling', subtitle: 'Coastal & shelf sea dynamics', path: '/models/roms', icon: Waves },
  { category: 'Numerical Models', title: 'NEMO European Model', subtitle: 'Global ocean engine dataset', path: '/models/nemo', icon: Waves },
  { category: 'Argo Floats', title: 'Float #1902670 (Bay of Bengal)', subtitle: 'Cycle #11 • Temp: 28.92°C • Salinity: 33.18', path: '/argo?float=1902670', icon: Radio },
  { category: 'Argo Floats', title: 'Float #2902224 (Southern Ocean)', subtitle: 'Cycle #252 • Temp: 27.50°C • Salinity: 34.80', path: '/argo?float=2902224', icon: Radio },
  { category: 'Argo Floats', title: 'Float #7902190 (Northern Bay)', subtitle: 'Cycle #4 • Temp: 29.80°C • Salinity: 32.90', path: '/argo?float=7902190', icon: Radio },
  { category: 'Datasets', title: 'INCOIS Indian Argo Float Profiles', subtitle: 'CTD in-situ temperature & salinity', path: '/datasets?id=incois_argo', icon: Database },
  { category: 'Datasets', title: 'GEBCO High-Res Bathymetry', subtitle: 'Global ocean depth grid 15 arc-seconds', path: '/datasets?id=gebco_bathy', icon: Database },
];

export const GlobalSearchBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCategoryResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const q = query.toLowerCase();

      const matchedCatalog = STATIC_QUICK_SEARCH.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );

      const geoResults = await searchLocation(query);
      const matchedGeo: SearchCategoryResult[] = geoResults.slice(0, 4).map((geo) => ({
        category: 'Earth Places',
        title: geo.displayName,
        subtitle: `Coordinates: ${geo.lat.toFixed(3)}°, ${geo.lon.toFixed(3)}°`,
        path: `/explorer?lat=${geo.lat}&lon=${geo.lon}`,
        icon: Globe,
      }));

      setResults([...matchedCatalog, ...matchedGeo]);
      setIsLoading(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (item: SearchCategoryResult) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
    setIsOpen(false);
    setQuery('');
  };

  const groupedResults = results.reduce<Record<string, SearchCategoryResult[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        alignItems: 'center',
      }}
      ref={dropdownRef}
      className={className}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Search
          className="w-4 h-4 text-[var(--text-muted)]"
          style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setResults.length > 0 && setIsOpen(true)}
          placeholder="Global search: Float ID, Model, Dataset, Coordinates..."
          style={{
            width: '100%',
            height: '34px',
            padding: '0 32px 0 32px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '12.5px',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            style={{
              position: 'absolute',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            maxHeight: '380px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Searching scientific catalog & global geonames...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No matching ocean datasets, models, or locations found.
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '4px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 8px 2px' }}>
                  {category}
                </div>
                {items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <ItemIcon className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

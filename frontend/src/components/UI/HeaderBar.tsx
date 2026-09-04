import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Search, Layers, Ruler, Bookmark, 
  RotateCcw, Maximize, Minimize, X, Sparkles 
} from 'lucide-react';
import { searchLocation } from '../../utils/geocoding';
import { SearchResult } from '../../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

interface HeaderBarProps {
  onSelectSearchResult: (result: SearchResult) => void;
  activePanel: 'none' | 'layers' | 'measure' | 'placemarks';
  setActivePanel: (panel: 'none' | 'layers' | 'measure' | 'placemarks') => void;
  onResetView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenDesignSystem?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onSelectSearchResult,
  activePanel,
  setActivePanel,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
  onOpenDesignSystem,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchLocation(query);
      setResults(res);
      setIsLoading(false);
      setShowDropdown(res.length > 0);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectSearchResult(item);
    setShowDropdown(false);
    setQuery(item.displayName);
  };

  return (
    <header className="header-bar">
      {/* Brand Title */}
      <div className="brand-title">
        <div className="p-1.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-xs tracking-wider text-[var(--text-primary)]">
            SIH2026 OCEAN DATA
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">
            SCIENTIFIC PLATFORM
          </span>
        </div>
        <span className="brand-badge ml-1">GIS 3D</span>
      </div>

      {/* Earth Search Bar */}
      <div className="search-box-container" ref={dropdownRef}>
        <Search className="search-icon w-4 h-4" />
        <input
          type="text"
          className="search-input"
          placeholder="Search Earth locations, coordinates (lat, lon)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
        />
        {query && (
          <X
            className="clear-icon w-4 h-4"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowDropdown(false);
            }}
          />
        )}

        {/* Dropdown Suggestions */}
        {showDropdown && (
          <div className="search-dropdown">
            {isLoading ? (
              <div className="search-item text-[var(--text-muted)]">Searching geographic index...</div>
            ) : (
              results.map((item, idx) => (
                <div
                  key={idx}
                  className="search-item"
                  onClick={() => handleSelect(item)}
                >
                  <Globe className="w-4 h-4 text-[var(--primary)] shrink-0" />
                  <span className="truncate">{item.displayName}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Header Tools */}
      <div className="header-actions">
        {onOpenDesignSystem && (
          <Tooltip content="Inspect Phase 1 UI Design System Catalog">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDesignSystem}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
            >
              UI Tokens
            </Button>
          </Tooltip>
        )}

        <ThemeSwitcher size="sm" />

        <Tooltip content="Atmospheric & Bathymetric Layers">
          <Button
            variant={activePanel === 'layers' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'layers' ? 'none' : 'layers')}
            aria-label="Layers"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Geographic Measurement Tools">
          <Button
            variant={activePanel === 'measure' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'measure' ? 'none' : 'measure')}
            aria-label="Measurement"
          >
            <Ruler className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Bookmarks & Placemarks">
          <Button
            variant={activePanel === 'placemarks' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'placemarks' ? 'none' : 'placemarks')}
            aria-label="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Reset Camera View to Indian Ocean">
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={onResetView}
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={onToggleFullscreen}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};

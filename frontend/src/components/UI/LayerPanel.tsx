import React from 'react';
import { X, Globe, Building2, Waves, Eye, Sun, Cloud, Mountain, Map } from 'lucide-react';
import { LayerState } from '../../types';

interface LayerPanelProps {
  layerState: LayerState;
  onToggleLayer: (layerKey: keyof LayerState) => void;
  onSelectLightingMode?: (mode: 'realistic' | 'readable') => void;
  onUpdateTerrainExaggeration: (factor: number) => void;
  onClose: () => void;
}

const LayerToggle: React.FC<{
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  dimmed?: boolean;
}> = ({ label, icon, active, onClick, dimmed }) => (
  <div
    className="layer-item"
    onClick={onClick}
    style={{ opacity: dimmed && !active ? 0.75 : 1, cursor: 'pointer' }}
  >
    <div className="layer-label">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`toggle-switch ${active ? 'on' : ''}`}>
      <div className="toggle-thumb" />
    </div>
  </div>
);

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layerState,
  onToggleLayer,
  onSelectLightingMode,
  onUpdateTerrainExaggeration,
  onClose,
}) => {
  const handleLightingClick = (mode: 'realistic' | 'readable') => {
    if (onSelectLightingMode) {
      onSelectLightingMode(mode);
    } else {
      onToggleLayer('lightingMode' as any);
    }
  };

  return (
    <div className="layer-panel glass-panel">
      {/* Header */}
      <div className="layer-panel-header">
        <div className="layer-panel-title">
          <Map className="w-4 h-4" style={{ color: '#38bdf8' }} />
          <span>Map Layers</span>
        </div>
        <button className="layer-close-btn" onClick={onClose} aria-label="Close Map Layers Panel">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lighting Mode */}
      <div className="layer-section">
        <div className="layer-section-label">Lighting</div>
        <div className="lighting-toggle-group">
          <button
            type="button"
            className={`lighting-btn ${layerState.lightingMode === 'realistic' ? 'active' : ''}`}
            onClick={() => handleLightingClick('realistic')}
          >
            <Sun className="w-3.5 h-3.5" />
            Day / Night
          </button>
          <button
            type="button"
            className={`lighting-btn ${layerState.lightingMode === 'readable' ? 'active' : ''}`}
            onClick={() => handleLightingClick('readable')}
          >
            <Globe className="w-3.5 h-3.5" />
            Always Lit
          </button>
        </div>
      </div>

      {/* Base Layers */}
      <div className="layer-section">
        <div className="layer-section-label">Base Layers</div>

        <LayerToggle
          label="Satellite Imagery"
          icon={<Globe className="w-4 h-4" style={{ color: '#22d3ee' }} />}
          active={layerState.satellite !== false}
          onClick={() => onToggleLayer('satellite')}
        />
        <LayerToggle
          label="Cloud Layer"
          icon={<Cloud className="w-4 h-4" style={{ color: '#7dd3fc' }} />}
          active={!!layerState.clouds}
          onClick={() => onToggleLayer('clouds')}
        />
        <LayerToggle
          label="3D Terrain"
          icon={<Mountain className="w-4 h-4" style={{ color: '#34d399' }} />}
          active={layerState.terrain !== false}
          onClick={() => onToggleLayer('terrain')}
        />

        {layerState.terrain !== false && (
          <div className="terrain-slider">
            <div className="terrain-slider-header">
              <span>Terrain Exaggeration</span>
              <span className="terrain-slider-value">{(layerState.terrainExaggeration || 1.5).toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={layerState.terrainExaggeration || 1.5}
              onChange={(e) => onUpdateTerrainExaggeration(parseFloat(e.target.value))}
              className="terrain-range"
            />
          </div>
        )}

        <LayerToggle
          label="Bathymetry"
          icon={<Waves className="w-4 h-4" style={{ color: '#818cf8' }} />}
          active={!!layerState.bathymetry}
          onClick={() => onToggleLayer('bathymetry')}
        />
        <LayerToggle
          label="3D Buildings"
          icon={<Building2 className="w-4 h-4" style={{ color: '#fbbf24' }} />}
          active={!!layerState.buildings3D}
          onClick={() => onToggleLayer('buildings3D')}
        />
        <LayerToggle
          label="Boundaries"
          icon={<Eye className="w-4 h-4" style={{ color: '#a78bfa' }} />}
          active={layerState.borders !== false}
          onClick={() => onToggleLayer('borders')}
        />
        <LayerToggle
          label="Geographic Labels"
          icon={<Eye className="w-4 h-4" style={{ color: '#60a5fa' }} />}
          active={layerState.labels !== false}
          onClick={() => onToggleLayer('labels')}
        />
      </div>

      {/* Scientific Layers */}
      <div className="layer-section">
        <div className="layer-section-label">Ocean Science</div>

        <LayerToggle
          label="Surface Currents"
          icon={<Waves className="w-4 h-4" style={{ color: '#22d3ee' }} />}
          active={layerState.oceanCurrents !== false}
          onClick={() => onToggleLayer('oceanCurrents')}
        />
        <LayerToggle
          label="Sea Surface Temp"
          icon={<Waves className="w-4 h-4" style={{ color: '#f87171' }} />}
          active={!!layerState.sst}
          onClick={() => onToggleLayer('sst')}
        />
        <LayerToggle
          label="Salinity"
          icon={<Waves className="w-4 h-4" style={{ color: '#60a5fa' }} />}
          active={!!layerState.salinity}
          onClick={() => onToggleLayer('salinity')}
        />
        <LayerToggle
          label="Wave Height"
          icon={<Waves className="w-4 h-4" style={{ color: '#818cf8' }} />}
          active={!!layerState.waveHeight}
          onClick={() => onToggleLayer('waveHeight')}
        />
        <LayerToggle
          label="Chlorophyll-a"
          icon={<Waves className="w-4 h-4" style={{ color: '#34d399' }} />}
          active={!!layerState.chlorophyll}
          onClick={() => onToggleLayer('chlorophyll')}
        />
      </div>
    </div>
  );
};

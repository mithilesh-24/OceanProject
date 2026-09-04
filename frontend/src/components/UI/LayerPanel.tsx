import React from 'react';
import { X, Globe, Building2, Waves, Eye, Sun, Cloud, Mountain, Map } from 'lucide-react';
import { LayerState } from '../../types';

interface LayerPanelProps {
  layerState: LayerState;
  onToggleLayer: (layerKey: keyof LayerState) => void;
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
    style={{ opacity: dimmed ? 0.7 : 1 }}
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
  onUpdateTerrainExaggeration,
  onClose,
}) => {
  return (
    <div className="layer-panel glass-panel">
      {/* Header */}
      <div className="layer-panel-header">
        <div className="layer-panel-title">
          <Map className="w-4 h-4" style={{ color: '#60a5fa' }} />
          <span>Map Layers</span>
        </div>
        <button className="layer-close-btn" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lighting Mode */}
      <div className="layer-section">
        <div className="layer-section-label">Lighting</div>
        <div className="lighting-toggle-group">
          <button
            className={`lighting-btn ${layerState.lightingMode === 'realistic' ? 'active' : ''}`}
            onClick={() => onToggleLayer('lightingMode' as any)}
          >
            <Sun className="w-3.5 h-3.5" />
            Day / Night
          </button>
          <button
            className={`lighting-btn ${layerState.lightingMode === 'readable' ? 'active' : ''}`}
            onClick={() => onToggleLayer('lightingMode' as any)}
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
          active={layerState.satellite}
          onClick={() => onToggleLayer('satellite')}
        />
        <LayerToggle
          label="Cloud Layer"
          icon={<Cloud className="w-4 h-4" style={{ color: '#7dd3fc' }} />}
          active={layerState.clouds}
          onClick={() => onToggleLayer('clouds')}
        />
        <LayerToggle
          label="3D Terrain"
          icon={<Mountain className="w-4 h-4" style={{ color: '#34d399' }} />}
          active={layerState.terrain}
          onClick={() => onToggleLayer('terrain')}
        />

        {layerState.terrain && (
          <div className="terrain-slider">
            <div className="terrain-slider-header">
              <span>Terrain Exaggeration</span>
              <span className="terrain-slider-value">{layerState.terrainExaggeration.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={layerState.terrainExaggeration}
              onChange={(e) => onUpdateTerrainExaggeration(parseFloat(e.target.value))}
              className="terrain-range"
            />
          </div>
        )}

        <LayerToggle
          label="Bathymetry"
          icon={<Waves className="w-4 h-4" style={{ color: '#818cf8' }} />}
          active={layerState.bathymetry}
          onClick={() => onToggleLayer('bathymetry')}
        />
        <LayerToggle
          label="3D Buildings"
          icon={<Building2 className="w-4 h-4" style={{ color: '#fbbf24' }} />}
          active={layerState.buildings3D}
          onClick={() => onToggleLayer('buildings3D')}
        />
        <LayerToggle
          label="Boundaries"
          icon={<Eye className="w-4 h-4" style={{ color: '#a78bfa' }} />}
          active={layerState.borders}
          onClick={() => onToggleLayer('borders')}
        />
        <LayerToggle
          label="Geographic Labels"
          icon={<Eye className="w-4 h-4" style={{ color: '#60a5fa' }} />}
          active={layerState.labels}
          onClick={() => onToggleLayer('labels')}
        />
      </div>

      {/* Scientific Layers */}
      <div className="layer-section">
        <div className="layer-section-label">Ocean Science</div>

        <LayerToggle
          label="Surface Currents"
          icon={<Waves className="w-4 h-4" style={{ color: '#22d3ee' }} />}
          active={layerState.oceanCurrents}
          onClick={() => onToggleLayer('oceanCurrents')}
          dimmed
        />
        <LayerToggle
          label="Sea Surface Temp"
          icon={<Waves className="w-4 h-4" style={{ color: '#f87171' }} />}
          active={layerState.sst}
          onClick={() => onToggleLayer('sst')}
          dimmed
        />
        <LayerToggle
          label="Salinity"
          icon={<Waves className="w-4 h-4" style={{ color: '#60a5fa' }} />}
          active={layerState.salinity}
          onClick={() => onToggleLayer('salinity')}
          dimmed
        />
        <LayerToggle
          label="Wave Height"
          icon={<Waves className="w-4 h-4" style={{ color: '#818cf8' }} />}
          active={layerState.waveHeight}
          onClick={() => onToggleLayer('waveHeight')}
          dimmed
        />
        <LayerToggle
          label="Chlorophyll-a"
          icon={<Waves className="w-4 h-4" style={{ color: '#34d399' }} />}
          active={layerState.chlorophyll}
          onClick={() => onToggleLayer('chlorophyll')}
          dimmed
        />
      </div>
    </div>
  );
};

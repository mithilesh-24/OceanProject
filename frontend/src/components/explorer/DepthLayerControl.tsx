import React, { useState, useEffect } from 'react';
import { Layers, Eye, EyeOff, Sliders, Info, Shield, Droplets } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { DepthLayerConfig, api } from '../../services/apiClient';

interface DepthLayerControlProps {
  selectedDepth: number;
  onSelectDepth: (depth: number) => void;
  visibleLayers: Set<number>;
  onToggleLayerVisibility: (depth: number) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
}

export const DepthLayerControl: React.FC<DepthLayerControlProps> = ({
  selectedDepth,
  onSelectDepth,
  visibleLayers,
  onToggleLayerVisibility,
  opacity,
  onChangeOpacity,
}) => {
  const [layers, setLayers] = useState<DepthLayerConfig[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getDepthLayers()
      .then((data) => {
        if (isMounted) setLayers(data);
      })
      .catch((err) => console.error('Failed to load depth layers:', err));
    return () => { isMounted = false; };
  }, []);

  const activeLayer = layers.find((l) => l.depth_m === selectedDepth) || layers[0];

  return (
    <div
      style={{
        position: 'absolute',
        top: '14px',
        left: '14px',
        zIndex: 30,
        width: '320px',
        backgroundColor: 'var(--backdrop-panel)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            3D Depth Layer Stack
          </h3>
        </div>
        <Badge variant="primary">{selectedDepth}m Focus</Badge>
      </div>

      {/* Vertical Depth Buttons Slicer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {layers.map((l) => {
          const isSelected = selectedDepth === l.depth_m;
          const isVisible = visibleLayers.has(l.depth_m);

          return (
            <div
              key={l.depth_m}
              onClick={() => onSelectDepth(l.depth_m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface-secondary)' : 'rgba(255,255,255,0.02)',
                border: isSelected ? `1.5px solid ${l.color}` : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: l.color,
                    boxShadow: isSelected ? `0 0 8px ${l.color}` : 'none'
                  }}
                />
                <div>
                  <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                    {l.depth_m === 0 ? 'Surface (0m)' : `${l.depth_m} m`}
                  </span>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {l.name.split('(')[0]}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {l.pressure_dbar} dbar
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLayerVisibility(l.depth_m);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isVisible ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title={isVisible ? 'Hide Layer Isosurface' : 'Show Layer Isosurface'}
                >
                  {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Layer Opacity Slider */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Subsurface Isosurface Opacity</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.05}
          max={0.9}
          step={0.05}
          value={opacity}
          onChange={(e) => onChangeOpacity(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
      </div>

      {/* Active Layer Water Mass Breakdown */}
      {activeLayer && (
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {activeLayer.name}
          </div>
          <p style={{ lineHeight: 1.4, marginBottom: '6px', fontSize: '10.5px' }}>
            {activeLayer.desc}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
            <div>Temp: <strong style={{ color: 'var(--primary)' }}>{activeLayer.temp_range}</strong></div>
            <div>Salinity: <strong style={{ color: 'var(--accent)' }}>{activeLayer.sal_range}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Layers, Activity, GitCompare, Info } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface GlobeScientificLegendProps {
  mode: 'observations' | 'model' | 'inter_comparison' | 'obs_comparison';
  modelName?: string;
  modelBName?: string;
  variableName?: string;
  units?: string;
  depthM?: number;
  minVal?: number;
  maxVal?: number;
  isDifference?: boolean;
}

export const GlobeScientificLegend: React.FC<GlobeScientificLegendProps> = ({
  mode,
  modelName = 'HYCOM Global 1/12°',
  modelBName = 'ROMS Regional 1/24°',
  variableName = 'Temperature',
  units = '°C',
  depthM = 0,
  minVal = 10,
  maxVal = 30,
  isDifference = false,
}) => {
  if (mode === 'observations') {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '16px',
          zIndex: 25,
          backgroundColor: 'var(--backdrop-panel)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-panel)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minWidth: '220px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
            In-Situ Sensor Platforms
          </span>
          <Badge variant="primary">Active</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
            <span>Argo Floats</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf' }} />
            <span>Gliders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }} />
            <span>Moored Buoys</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8' }} />
            <span>CTD Casts</span>
          </div>
        </div>
      </div>
    );
  }

  const isDivergent = isDifference || mode === 'inter_comparison';
  const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal), 0.5);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '48px',
        left: '16px',
        zIndex: 25,
        backgroundColor: 'var(--backdrop-panel)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '240px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isDivergent ? (
            <GitCompare className="w-3.5 h-3.5 text-[var(--primary)]" />
          ) : (
            <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
          )}
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isDivergent
              ? `Δ: ${modelName.toUpperCase()} − ${modelBName.toUpperCase()}`
              : `${modelName.toUpperCase()} ${variableName}`}
          </span>
        </div>
        <Badge variant="primary">{depthM === 0 ? '0m (Surface)' : `${depthM}m`}</Badge>
      </div>

      {/* Colormap Bar */}
      <div>
        <div
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '4px',
            background: isDivergent
              ? 'linear-gradient(to right, #2563eb, #38bdf8, #0f172a, #f43f5e, #dc2626)'
              : 'linear-gradient(to right, #0a1e5a, #06b6d4, #f59e0b, #ef4444)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9.5px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            marginTop: '3px',
          }}
        >
          <span>{isDivergent ? `−${maxAbs.toFixed(1)} ${units}` : `${minVal.toFixed(1)} ${units}`}</span>
          {isDivergent && <span>0 (Equivalence)</span>}
          <span>{isDivergent ? `+${maxAbs.toFixed(1)} ${units}` : `${maxVal.toFixed(1)} ${units}`}</span>
        </div>
      </div>
    </div>
  );
};

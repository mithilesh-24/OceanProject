import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, BarChart2, Layers, Cpu, Database, Play, Compass } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/UI/Card';
import { ModelSliceVisualizer } from '../components/models/ModelSliceVisualizer';
import { ModelVerticalTransectChart } from '../components/models/ModelVerticalTransectChart';
import { ModelDepthProfileChart } from '../components/models/ModelDepthProfileChart';

export const NemoView: React.FC = () => {
  const [probeCoord, setProbeCoord] = useState<{ lat: number; lon: number }>({ lat: 0.12, lon: 80.54 });

  const nemoLayers = [
    { level: 'Level 1 – 15', depth: '0 – 50 m', res: '1.0 m spacing (High Res Mixed Layer)' },
    { level: 'Level 16 – 35', depth: '50 – 250 m', res: '5.0 – 10.0 m (Thermocline Transition)' },
    { level: 'Level 36 – 55', depth: '250 – 1,000 m', res: '25.0 – 50.0 m (Intermediate Water)' },
    { level: 'Level 56 – 75', depth: '1,000 – 6,000 m', res: '100.0 – 200.0 m (Abyssal Ocean)' },
  ];

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">
              <Waves className="w-5 h-5 text-[var(--primary)]" />
              NEMO European Global Ocean Model (v4.2) Explorer
            </h1>
            <Badge variant="primary">75 VERTICAL z-STAR LEVELS</Badge>
            <Badge variant="success" dot>COPERNICUS CMEMS</Badge>
          </div>
          <p className="page-subtitle">
            Nucleus for European Modelling of the Ocean engine resolving global thermohaline conveyor circulation and sea-ice thermodynamics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              Display on 3D Globe
            </Button>
          </Link>
          <Link to="/comparison">
            <Button variant="outline" size="sm" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
              Compare with In-Situ
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Horizontal Resolution</span>
            <Cpu className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">1/4° (~28 km)</div>
          <div className="metric-stat-sub">ORCA025 tripolar global grid</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Levels</span>
            <Layers className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">75 z-Levels</div>
          <div className="metric-stat-sub">Partial steps (z* coordinate)</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Time Step / Output</span>
            <Play className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">Daily Means</div>
          <div className="metric-stat-sub">Available 2000 – Present</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Data Format</span>
            <Database className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '16px' }}>NetCDF-4 / CF</div>
          <div className="metric-stat-sub">Copernicus Marine CMEMS</div>
        </div>
      </div>

      {/* 2D Subsetting Slice Visualizer */}
      <ModelSliceVisualizer
        modelId="nemo"
        initialVariable="temperature"
        initialDepth={0}
        onSelectCoordinate={(lat, lon) => setProbeCoord({ lat, lon })}
      />

      {/* Vertical Hydrographic Transect & Point Column Depth Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        <ModelVerticalTransectChart
          modelId="nemo"
          initialTransect="bob_meridional"
          initialVariable="temperature"
        />

        <ModelDepthProfileChart
          modelId="nemo"
          latitude={probeCoord.lat}
          longitude={probeCoord.lon}
        />
      </div>

      {/* Vertical Discretization Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              NEMO 75-Level Vertical Depth Discretization Scheme
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Optimized for mixed layer resolving capabilities in the upper 100 meters.
            </p>
          </div>
          <Badge variant="primary">Standard z-Star Grid</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Vertical Layer Band</th>
                <th>Depth Span (Meters)</th>
                <th>Vertical Cell Spacing (Δz)</th>
              </tr>
            </thead>
            <tbody>
              {nemoLayers.map((l, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{l.level}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>{l.depth}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.res}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

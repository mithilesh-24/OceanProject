import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Waves, ArrowRight, BarChart2, Cpu, ExternalLink, Activity, Compass } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { ModelSliceVisualizer } from '../components/models/ModelSliceVisualizer';

export const ModelsView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('hycom');

  const models = [
    {
      id: 'hycom',
      title: 'HYCOM 1/12° Global Ocean Model',
      res: '1/12° (~8.5 km) • 40 Depth Levels',
      provider: 'HYCOM Consortium / NOAA NCODA',
      desc: 'Hybrid Coordinate Ocean Model with isopycnal layers in the open stratified ocean and z-levels in the unstratified surface mixed layer.',
      path: '/models/hycom',
      badge: 'GLOBAL 1/12°',
      skill: '0.964 Willmott',
      levels: 40,
      coord: 'Hybrid (Isopycnal/σ/z)'
    },
    {
      id: 'roms',
      title: 'ROMS Regional Ocean Modeling System',
      res: '1/24° (~4.2 km) • 32 S-Levels',
      provider: 'INCOIS Coastal Dynamics Division',
      desc: 'High-resolution hydrostatic primitive equations model with terrain-following s-coordinates for coastal upwelling and shelf circulation.',
      path: '/models/roms',
      badge: 'REGIONAL 1/24°',
      skill: '0.978 Willmott',
      levels: 32,
      coord: 'Terrain-Following S-Levels'
    },
    {
      id: 'nemo',
      title: 'NEMO Global Ocean Physics',
      res: '1/4° (~28 km) • 75 Depth Levels',
      provider: 'Copernicus Marine / CMEMS',
      desc: 'State-of-the-art European community model simulating global thermohaline conveyor circulation and sea ice dynamics.',
      path: '/models/nemo',
      badge: 'GLOBAL 1/4°',
      skill: '0.952 Willmott',
      levels: 75,
      coord: 'Partial Steps z-Star (z*)'
    },
  ];

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Layers className="w-5 h-5 text-[var(--primary)]" />
            Numerical Ocean Circulation Models
          </h1>
          <p className="page-subtitle">
            Operational hydrodynamic and thermodynamic circulation models assimilated with Indian Ocean satellite and in-situ observation systems.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              3D Globe Explorer
            </Button>
          </Link>
          <Link to="/comparison">
            <Button variant="primary" size="sm" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
              Run Cross-Model Comparison
            </Button>
          </Link>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid-cols-3">
        {models.map((m) => {
          const isSelected = selectedModel === m.id;
          return (
            <div
              key={m.id}
              className="ui-card cursor-pointer transition-all"
              onClick={() => setSelectedModel(m.id)}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
                boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.15)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</h3>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{m.res}</span>
                  </div>
                  <Badge variant={isSelected ? 'primary' : 'neutral'}>{m.badge}</Badge>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                  {m.desc}
                </p>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Provider: <strong style={{ color: 'var(--text-primary)' }}>{m.provider}</strong></span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{m.skill}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setSelectedModel(m.id); }}
                  style={{ flex: 1 }}
                >
                  {isSelected ? 'Active Slice Preview' : 'Select for Preview'}
                </Button>
                <Link to={m.path} style={{ textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Interactive Quick Slice Preview */}
      <div className="space-y-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity className="w-4 h-4 text-[var(--primary)]" />
            <h2 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interactive Subsetting & Slice Generation (Active: {selectedModel.toUpperCase()})
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Server-side NetCDF subsetting on Indian Ocean domain (50°E–95°E, 0°N–24°N)
          </span>
        </div>

        <ModelSliceVisualizer
          key={selectedModel}
          modelId={selectedModel}
          initialVariable="temperature"
          initialDepth={0}
        />
      </div>

      {/* Specification Comparison Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Numerical Architecture Comparison Matrix
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Side-by-side comparison of coordinate systems, spatial grids, and temporal update frequencies.
            </p>
          </div>
          <Badge variant="primary">Multi-Model Framework</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Model Framework</th>
                <th>Vertical Coordinate System</th>
                <th>Horizontal Resolution</th>
                <th>Vertical Levels</th>
                <th>Data Output Frequency</th>
                <th>Assimilated Data</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>HYCOM (Hybrid)</td>
                <td>Isopycnal / σ / z-level hybrid</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>0.08° (~8.5 km)</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>40 Levels</td>
                <td>3-Hourly / Daily</td>
                <td>Argo, Altimetry, SST</td>
                <td><Link to="/models/hycom"><Button variant="outline" size="sm">Explore</Button></Link></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>ROMS (Regional)</td>
                <td>Terrain-following S-coordinates</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>0.04° (~4.2 km)</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>32 S-Levels</td>
                <td>Hourly / Daily</td>
                <td>OMNI Buoys, Tide gauges</td>
                <td><Link to="/models/roms"><Button variant="outline" size="sm">Explore</Button></Link></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>NEMO (Global)</td>
                <td>Partial steps z-star (z*)</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>0.25° (~28 km)</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>75 z-Levels</td>
                <td>Daily / Monthly</td>
                <td>Global GTS, Argo, Satellites</td>
                <td><Link to="/models/nemo"><Button variant="outline" size="sm">Explore</Button></Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

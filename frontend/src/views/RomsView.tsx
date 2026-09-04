import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, BarChart2, Layers, Cpu, CheckCircle2, Compass, ArrowRight } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/UI/Card';
import { ModelSliceVisualizer } from '../components/models/ModelSliceVisualizer';
import { ModelVerticalTransectChart } from '../components/models/ModelVerticalTransectChart';
import { ModelDepthProfileChart } from '../components/models/ModelDepthProfileChart';

export const RomsView: React.FC = () => {
  const [probeCoord, setProbeCoord] = useState<{ lat: number; lon: number }>({ lat: 15.45, lon: 73.60 });

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">
              <Waves className="w-5 h-5 text-[var(--primary)]" />
              ROMS Regional Ocean Modeling System Explorer
            </h1>
            <Badge variant="primary">COASTAL S-LEVELS</Badge>
            <Badge variant="success" dot>INCOIS OPERATIONAL</Badge>
          </div>
          <p className="page-subtitle">
            High-resolution terrain-following primitive equations model tailored for coastal upwelling, river plume dynamics, and tidal shelf mixing.
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
              Compare with OMNI Buoys
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Key Specifications */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Spatial Resolution</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.04°</div>
          <div className="metric-stat-sub">~4.2 km Coastal Grid</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Discretization</span>
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">32 S-Levels</div>
          <div className="metric-stat-sub">Terrain-Following (Sigma)</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Domain Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '18px' }}>Arabian Sea & BoB</div>
          <div className="metric-stat-sub">INCOIS Coastal Domain</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Atmospheric Coupling</span>
            <ExternalLink className="w-4 h-4 text-teal-500" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '18px' }}>WRF 3km Hourly</div>
          <div className="metric-stat-sub">Coupled Ocean-Atmosphere</div>
        </div>
      </div>

      {/* 2D Subsetting Slice Visualizer */}
      <ModelSliceVisualizer
        modelId="roms"
        initialVariable="temperature"
        initialDepth={0}
        onSelectCoordinate={(lat, lon) => setProbeCoord({ lat, lon })}
      />

      {/* Vertical Hydrographic Transect & Point Column Depth Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        <ModelVerticalTransectChart
          modelId="roms"
          initialTransect="arabian_zonal"
          initialVariable="temperature"
        />

        <ModelDepthProfileChart
          modelId="roms"
          latitude={probeCoord.lat}
          longitude={probeCoord.lon}
        />
      </div>

      {/* Technical Model Cards */}
      <div className="grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Terrain-Following S-Coordinate Transformations</CardTitle>
            <Badge variant="neutral">Sigma Stretched Grid</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ROMS uses stretching transformations to concentrate vertical layers near the sea surface and bottom boundary layers, capturing coastal upwelling, river runoff fronts, and internal solitary waves with high fidelity.
            </p>
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Surface Stretching ($\theta_s$):</span>
                <strong style={{ color: 'var(--text-primary)' }}>6.5 (High Surface Resolution)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bottom Stretching ($\theta_b$):</span>
                <strong style={{ color: 'var(--text-primary)' }}>1.8 (Benthic Boundary Layer)</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/comparison" style={{ width: '100%' }}>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>
                Compare ROMS with Moored Buoy Array
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Assessment & Coastal Sensor Verification</CardTitle>
            <Badge variant="success">0.978 Willmott</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Evaluated against OMNI and coastal met-ocean buoy stations across the West and East coasts of India.
            </p>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>Root Mean Square Error: <strong style={{ color: 'var(--primary)' }}>RMSE = 0.36 °C</strong></div>
                <div>Mean Bias: <strong style={{ color: 'var(--success)' }}>Bias = -0.04 °C</strong></div>
                <div>Pearson Correlation: <strong style={{ color: 'var(--success)' }}>R = 0.978</strong></div>
                <div>Skill Rating: <strong style={{ color: 'var(--accent)' }}>High Skill (Tier 1)</strong></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/errors" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Inspect Coastal Error Heatmap
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

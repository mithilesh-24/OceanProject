import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, BarChart2, CheckCircle2, Layers, Cpu, Compass, Info, ArrowRight } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/UI/Card';
import { ModelSliceVisualizer } from '../components/models/ModelSliceVisualizer';
import { ModelVerticalTransectChart } from '../components/models/ModelVerticalTransectChart';
import { ModelDepthProfileChart } from '../components/models/ModelDepthProfileChart';

export const HycomView: React.FC = () => {
  const [probeCoord, setProbeCoord] = useState<{ lat: number; lon: number }>({ lat: 14.28, lon: 87.45 });

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">
              <Waves className="w-5 h-5 text-[var(--primary)]" />
              HYCOM Global 1/12° Model Explorer
            </h1>
            <Badge variant="primary">HYBRID COORDINATES</Badge>
            <Badge variant="success" dot>ONLINE (NCODA)</Badge>
          </div>
          <p className="page-subtitle">
            Hybrid Coordinate Ocean Model resolving eddy-permitting thermohaline stratification, Wyrtki jets, and monsoonal reversals.
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
              Compare with Argo Floats
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Key Specifications */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Horizontal Resolution</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.08°</div>
          <div className="metric-stat-sub">~8.5 km Global Grid</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Levels</span>
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">40 Hybrid Layers</div>
          <div className="metric-stat-sub">Isopycnal / σ / z-Level</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Temporal Output</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">3-Hourly</div>
          <div className="metric-stat-sub">Daily & Forecast Ready</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Assimilated Systems</span>
            <ExternalLink className="w-4 h-4 text-teal-500" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '16px' }}>NOAA NCODA</div>
          <div className="metric-stat-sub">Argo, Altimetry, SST</div>
        </div>
      </div>

      {/* Main 2D Subsetting Slice Visualizer */}
      <ModelSliceVisualizer
        modelId="hycom"
        initialVariable="temperature"
        initialDepth={0}
        onSelectCoordinate={(lat, lon) => setProbeCoord({ lat, lon })}
      />

      {/* Dual Analytics Row: Vertical Transect & Point Column Depth Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        <ModelVerticalTransectChart
          modelId="hycom"
          initialTransect="equator"
          initialVariable="temperature"
        />

        <ModelDepthProfileChart
          modelId="hycom"
          latitude={probeCoord.lat}
          longitude={probeCoord.lon}
        />
      </div>

      {/* Technical Architecture & Oceanographic Dynamics Cards */}
      <div className="grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hybrid Vertical Coordinate System (Isopycnal / σ / z)</CardTitle>
            <Badge variant="neutral">Equation of State</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              HYCOM transitions seamlessly between three coordinate schemes:
            </p>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Surface Layer:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Fixed Z-coordinates (high resolution mixing)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Open Stratified Ocean:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Isopycnal (constant target density surfaces)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shallow Coastal Shelves:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Terrain-Following Sigma (σ) levels</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/comparison" style={{ width: '100%' }}>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>
                Validate HYCOM Against In-Situ Argo Floats
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indian Ocean Validation & Skill Assessment</CardTitle>
            <Badge variant="success">0.964 Willmott</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Quantified statistical validation over 4,200+ Argo profiles in the Arabian Sea, Bay of Bengal, and Equatorial Channel.
            </p>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>Root Mean Square Error: <strong style={{ color: 'var(--primary)' }}>RMSE = 0.41 °C</strong></div>
                <div>Mean Bias: <strong style={{ color: 'var(--success)' }}>Bias = +0.08 °C</strong></div>
                <div>Pearson Correlation: <strong style={{ color: 'var(--success)' }}>R = 0.962</strong></div>
                <div>Willmott Index: <strong style={{ color: 'var(--accent)' }}>d = 0.964</strong></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/accuracy" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Inspect Multi-Depth Accuracy Breakdown
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

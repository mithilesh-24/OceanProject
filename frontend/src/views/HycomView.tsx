import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, BarChart2, CheckCircle2, Layers, Cpu, Compass } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/UI/Card';

export const HycomView: React.FC = () => {
  return (
    <div className="page-scroll-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">
              <Waves className="w-5 h-5 text-[var(--primary)]" />
              HYCOM Global 1/12° Model
            </h1>
            <Badge variant="primary">OPERATIONAL REANALYSIS</Badge>
            <Badge variant="success" dot>ONLINE</Badge>
          </div>
          <p className="page-subtitle">
            Hybrid Coordinate Ocean Model with high-resolution isopycnal, terrain-following, and z-level vertical coordinate systems.
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

      {/* Grid Specifications */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Spatial Resolution</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.08°</div>
          <div className="metric-stat-sub">~8.5 km Horizontal Grid</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Levels</span>
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">40 Levels</div>
          <div className="metric-stat-sub">Surface to 5,500 m Depth</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Temporal Step</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">3-Hourly</div>
          <div className="metric-stat-sub">Daily Averages & Real-Time</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Source Format</span>
            <ExternalLink className="w-4 h-4 text-teal-500" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '16px' }}>NetCDF / OPeNDAP</div>
          <div className="metric-stat-sub">NOAA / NCODA Assimilated</div>
        </div>
      </div>

      {/* Technical Model Details */}
      <div className="grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ocean Physics & Vertical Slicing</CardTitle>
            <Badge variant="neutral">Hydrodynamics</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              HYCOM utilizes isopycnal coordinates in the open, stratified ocean, smooth terrain-following sigma coordinates in shallow coastal regions, and z-level coordinates in the mixed layer.
            </p>
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assimilated In-Situ Data:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Argo, Satellite Altimetry, SST, Gliders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Atmospheric Forcing:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>NCEP Climate Forecast System (CFSR)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Output Variables:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Temperature, Salinity, U/V Velocity, SSH</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/comparison" style={{ width: '100%' }}>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>
                Launch HYCOM Validation Pipeline
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Focus: Indian Ocean Basin</CardTitle>
            <Badge variant="primary">Equatorial & Bay Dynamics</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Evaluates strong monsoonal current reversals, Wyrtki jets, and fresh water plume dispersal in the Bay of Bengal and Arabian Sea.
            </p>
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Validation Accuracy Summary (vs 4,232 Argo Floats):
              </span>
              Overall Pearson Correlation: <strong style={{ color: 'var(--success)' }}>R = 0.962</strong> • Root Mean Square Error: <strong style={{ color: 'var(--primary)' }}>RMSE = 0.52 °C</strong>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/errors" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                View Spatial Error Heatmap
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

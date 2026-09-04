import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, BarChart2, Layers, Cpu, CheckCircle2, Compass } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/UI/Card';

export const RomsView: React.FC = () => {
  return (
    <div className="page-scroll-container">
      <div className="page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">
              <Waves className="w-5 h-5 text-[var(--primary)]" />
              ROMS Regional Ocean Modeling System
            </h1>
            <Badge variant="primary">COASTAL RESOLUTION</Badge>
            <Badge variant="success" dot>ONLINE</Badge>
          </div>
          <p className="page-subtitle">
            Free-surface, terrain-following primitive equations model for coastal shelf dynamics, upwelling zones, and boundary currents.
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
              Compare with Argo
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Spatial Resolution</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.05°</div>
          <div className="metric-stat-sub">~5.0 km Coastal Grid</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Levels</span>
            <Cpu className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">32 S-Levels</div>
          <div className="metric-stat-sub">Terrain-Following (Sigma)</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Domain Scope</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '18px' }}>Arabian Sea & BoB</div>
          <div className="metric-stat-sub">INCOIS Coastal Domain</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Forcing Model</span>
            <ExternalLink className="w-4 h-4 text-teal-500" />
          </div>
          <div className="metric-stat-value" style={{ fontSize: '18px' }}>WRF 3km Hourly</div>
          <div className="metric-stat-sub">Coupled Ocean-Atmosphere</div>
        </div>
      </div>

      <div className="grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Terrain-Following Sigma Coordinates</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ROMS uses stretching transformations in the vertical coordinate system to concentrate resolution near the sea surface and bottom boundary layers, capturing coastal upwelling, river runoff fronts, and internal tides with high fidelity.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/comparison" style={{ width: '100%' }}>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>
                Compare ROMS with Moored Buoys
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Assessment & Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Coastal Sensor Verification:
              </span>
              Mean Absolute Error: <strong style={{ color: 'var(--primary)' }}>MAE = 0.38 °C</strong> • Correlation with OMNI buoys: <strong style={{ color: 'var(--success)' }}>R = 0.954</strong>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/errors" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                Inspect Coastal Error Map
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

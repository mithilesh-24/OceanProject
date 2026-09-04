import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Database, Radio, Waves, BarChart2, 
  Thermometer, Layers, CheckCircle, ArrowRight 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useRole } from '../context/RoleContext';

export const DashboardView: React.FC = () => {
  const { currentRole, profile } = useRole();

  return (
    <div className="page-scroll-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Welcome, {profile.name}
            </h1>
            <Badge variant="primary">{currentRole.toUpperCase()} WORKSPACE</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {profile.organization} • {profile.department || 'National Ocean Data Center'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/explorer">
            <Button variant="primary" leftIcon={<Compass className="w-4 h-4" />}>
              Launch 3D Explorer
            </Button>
          </Link>
          <Link to="/comparison">
            <Button variant="outline" leftIcon={<BarChart2 className="w-4 h-4" />}>
              Model Comparison
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Argo Floats</span>
            <Radio className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">4,232</div>
          <div className="metric-stat-sub" style={{ color: 'var(--success)' }}>
            <CheckCircle className="w-3.5 h-3.5" />
            <span>INCOIS ERDDAP Synced</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Numerical Models</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="metric-stat-value">3 Operational</div>
          <div className="metric-stat-sub">
            HYCOM 1/12°, ROMS, NEMO
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Basin Mean Temp</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="metric-stat-value">27.42 °C</div>
          <div className="metric-stat-sub">
            Indian Ocean (0–500m depth)
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Catalog Datasets</span>
            <Database className="w-4 h-4 text-teal-500" />
          </div>
          <div className="metric-stat-value">14 Feeds</div>
          <div className="metric-stat-sub">
            NetCDF, OPeNDAP, WMS
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ocean Explorer 3D</CardTitle>
            <Badge variant="primary">Interactive Globe</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Explore multi-depth in-situ observations across the Indian Ocean basin with CesiumJS.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link to="/explorer" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} style={{ width: '100%' }}>
                Open 3D Explorer
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dataset Catalog</CardTitle>
            <Badge variant="neutral">Data Feeds</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Search, filter, and inspect registered oceanographic datasets, spatial grids, and temporal coverages.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link to="/datasets" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} style={{ width: '100%' }}>
                Browse Datasets
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Comparison Engine</CardTitle>
            <Badge variant="success">Scientific Analytics</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Validate HYCOM, ROMS, and NEMO model outputs directly against in-situ Argo and Glider profiles.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link to="/comparison" style={{ width: '100%' }}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} style={{ width: '100%' }}>
                Run Comparison
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

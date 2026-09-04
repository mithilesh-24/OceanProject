import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Activity, Battery, RefreshCw } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const GlidersView: React.FC = () => {
  const gliders = [
    {
      id: 'SG-642 (Slocum G3)',
      mission: 'South-West BoB Coastal Transect',
      coords: '11.85°N, 82.40°E',
      dives: 342,
      depthRange: '0 – 1,000 m',
      battery: '74%',
      sensors: 'CTD, DO, Backscatter, Chl-a',
      status: 'Active Sawtooth Dive',
    },
    {
      id: 'SG-591 (SeaExplorer)',
      mission: 'Arabian Sea Oxygen Minimum Zone Survey',
      coords: '17.20°N, 68.10°E',
      dives: 618,
      depthRange: '0 – 700 m',
      battery: '48%',
      sensors: 'CTD, Dissolved Oxygen, Nitrate',
      status: 'Active Sawtooth Dive',
    },
    {
      id: 'SG-704 (Seaglider)',
      mission: 'Equatorial Current Boundary Transect',
      coords: '0.40°N, 85.10°E',
      dives: 120,
      depthRange: '0 – 1,000 m',
      battery: '91%',
      sensors: 'CTD, Microstructure Turbulence',
      status: 'Deploy Phase',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Compass className="w-5 h-5 text-[var(--primary)]" />
            Autonomous Underwater Gliders
          </h1>
          <p className="page-subtitle">
            Buoyancy-driven autonomous submersibles conducting high-resolution sawtooth hydrographic cross-sections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">3 Active Missions</Badge>
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              View on 3D Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Gliders</span>
            <Compass className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">3 Deployed</div>
          <div className="metric-stat-sub"><span>Indian Ocean coastal & open sea</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Completed Sawtooth Dives</span>
            <Activity className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">1,080</div>
          <div className="metric-stat-sub"><span>Continuous vertical profiles</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Horizontal Trajectory</span>
            <RefreshCw className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">2,840 km</div>
          <div className="metric-stat-sub"><span>Total distance navigated</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Battery State</span>
            <Battery className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">71%</div>
          <div className="metric-stat-sub"><span>Estimated endurance: 45 days</span></div>
        </div>
      </div>

      {/* Gliders Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Underwater Glider Fleet Missions
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              INCOIS glider transects targeting boundary currents, upwelling fronts, and oxygen minimum zones.
            </p>
          </div>
          <Badge variant="success">Real-Time Telemetry</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Glider Platform</th>
                <th>Mission Description</th>
                <th>Current Position</th>
                <th>Dives Completed</th>
                <th>Depth Envelope</th>
                <th>Payload Sensors</th>
                <th>Battery</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {gliders.map((g, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{g.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.mission}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{g.coords}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{g.dives}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{g.depthRange}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{g.sensors}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{g.battery}</td>
                  <td>
                    <Badge variant="success">{g.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

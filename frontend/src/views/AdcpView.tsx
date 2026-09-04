import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, ExternalLink, Activity, Wind, Compass, Zap } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const AdcpView: React.FC = () => {
  const adcpStations = [
    {
      id: 'ADCP-EQ-01',
      mooring: 'Equatorial Jet Mooring Array',
      location: '0.0°N, 77.0°E (0–500m)',
      freq: '75 kHz Long-Ranger',
      maxCurrent: '1.24 m/s (Eastward)',
      shear: '0.014 s⁻¹',
      status: 'Online',
    },
    {
      id: 'ADCP-SOMALI-03',
      mooring: 'Somali Boundary Array',
      location: '8.4°N, 52.1°E (0–300m)',
      freq: '150 kHz QuarterMaster',
      maxCurrent: '2.10 m/s (North-East)',
      shear: '0.022 s⁻¹',
      status: 'Online',
    },
    {
      id: 'ADCP-EICC-02',
      mooring: 'East India Coastal Current Mooring',
      location: '14.0°N, 80.5°E (0–200m)',
      freq: '300 kHz Workhorse',
      maxCurrent: '0.85 m/s (Poleward)',
      shear: '0.009 s⁻¹',
      status: 'Online',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Waves className="w-5 h-5 text-[var(--primary)]" />
            ADCP Ocean Current Profilers
          </h1>
          <p className="page-subtitle">
            Acoustic Doppler Current Profilers measuring 3D water velocity vectors (u, v, w) and vertical shear across depth bins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">Velocity Vectors Live</Badge>
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
            <span>Peak Current Velocity</span>
            <Zap className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">2.10 m/s</div>
          <div className="metric-stat-sub"><span>Somali Jet Core (Surface Bin)</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active ADCP Moorings</span>
            <Activity className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">12 Moored Arrays</div>
          <div className="metric-stat-sub"><span>Equatorial & Coastal straits</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Bin Resolution</span>
            <Waves className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">4 – 8 m bins</div>
          <div className="metric-stat-sub"><span>Continuous velocity column</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Vertical Shear</span>
            <Compass className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">0.012 s⁻¹</div>
          <div className="metric-stat-sub"><span>Richardson Number stability &gt; 0.25</span></div>
        </div>
      </div>

      {/* ADCP Stations Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Moored ADCP Velocity Profiler Stations
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Zonal (u) and meridional (v) current component velocity streams integrated with numerical model verification engines.
            </p>
          </div>
          <Badge variant="success">Broadband Acoustic Stream</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Station Identifier</th>
                <th>Mooring Array Target</th>
                <th>Coordinates & Depth Range</th>
                <th>Acoustic Frequency</th>
                <th>Peak Measured Current</th>
                <th>Max Vertical Shear (∂u/∂z)</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {adcpStations.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{a.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.mooring}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>{a.location}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.freq}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>{a.maxCurrent}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.shear}</td>
                  <td>
                    <Badge variant="success">{a.status}</Badge>
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

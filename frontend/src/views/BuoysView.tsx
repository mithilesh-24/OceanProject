import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, ExternalLink, Wind, Waves, Thermometer, Radio } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const BuoysView: React.FC = () => {
  const buoys = [
    {
      id: 'OMNI-BD08',
      network: 'INCOIS OMNI Moored Array',
      location: 'Central Bay of Bengal (18.2°N, 89.7°E)',
      sst: '29.40 °C',
      airTemp: '28.10 °C',
      windSpeed: '12.4 kts',
      waveHeight: '1.8 m',
      status: 'Online (Transmitting)',
    },
    {
      id: 'OMNI-AD06',
      network: 'INCOIS OMNI Moored Array',
      location: 'Eastern Arabian Sea (18.5°N, 67.5°E)',
      sst: '27.95 °C',
      airTemp: '27.20 °C',
      windSpeed: '16.2 kts',
      waveHeight: '2.4 m',
      status: 'Online (Transmitting)',
    },
    {
      id: 'RAMA-23001',
      network: 'RAMA Tropical Mooring',
      location: 'Equatorial Indian Ocean (0.0°N, 80.5°E)',
      sst: '28.80 °C',
      airTemp: '27.90 °C',
      windSpeed: '8.5 kts',
      waveHeight: '1.2 m',
      status: 'Online (Transmitting)',
    },
    {
      id: 'COASTAL-CB02',
      network: 'Coastal Met-Ocean Network',
      location: 'Off Visakhapatnam Coast (17.6°N, 83.3°E)',
      sst: '29.10 °C',
      airTemp: '28.80 °C',
      windSpeed: '9.0 kts',
      waveHeight: '0.9 m',
      status: 'Online (Transmitting)',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Anchor className="w-5 h-5 text-[var(--primary)]" />
            Moored & Drifting Ocean Buoys
          </h1>
          <p className="page-subtitle">
            INCOIS OMNI & RAMA deep-sea moored buoy network delivering real-time surface meteorology and subsurface oceanography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">OMNI Telemetry Live</Badge>
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
            <span>Active Moored Buoys</span>
            <Anchor className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">28 Stations</div>
          <div className="metric-stat-sub"><span>100% Operational Telemetry</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Surface Temp</span>
            <Thermometer className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">28.81 °C</div>
          <div className="metric-stat-sub"><span>Indian Ocean Buoy Array</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Wind Speed</span>
            <Wind className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">11.5 kts</div>
          <div className="metric-stat-sub"><span>Monsoonal flow baseline</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Significant Wave Height</span>
            <Waves className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">1.58 m</div>
          <div className="metric-stat-sub"><span>Direction: South-West</span></div>
        </div>
      </div>

      {/* Buoys Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Moored Buoy Network Telemetry Stream
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              High-frequency 10-minute meteorological and oceanographic observations transmitted via INSAT satellite.
            </p>
          </div>
          <Badge variant="primary">INSAT Synchronized</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Station ID</th>
                <th>Network / Program</th>
                <th>Location & Coordinates</th>
                <th>Sea Surface Temp</th>
                <th>Air Temp</th>
                <th>Wind Speed</th>
                <th>Wave Height (Hs)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {buoys.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{b.id}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{b.network}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.location}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>{b.sst}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.airTemp}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.windSpeed}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.waveHeight}</td>
                  <td>
                    <Badge variant="success">{b.status}</Badge>
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

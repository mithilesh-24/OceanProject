import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ExternalLink, RefreshCw, Thermometer, Droplets, ArrowDown, Search, Filter, Play } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';

export const ArgoView: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState('');

  const sampleFloats = [
    {
      wmo: '1902670',
      basin: 'Bay of Bengal (Central)',
      lat: 14.285,
      lon: 87.450,
      cycle: 11,
      lastDate: 'Sep 04, 2026',
      surfaceTemp: '28.92 °C',
      surfaceSal: '33.18 PSU',
      maxDepth: '2,000 m',
      status: 'Active (Ascending)',
    },
    {
      wmo: '2902224',
      basin: 'Southern Indian Ocean',
      lat: -22.450,
      lon: 74.820,
      cycle: 252,
      lastDate: 'Sep 03, 2026',
      surfaceTemp: '21.50 °C',
      surfaceSal: '35.40 PSU',
      maxDepth: '2,000 m',
      status: 'Active (Parked)',
    },
    {
      wmo: '7902190',
      basin: 'Northern Bay of Bengal',
      lat: 19.820,
      lon: 89.210,
      cycle: 4,
      lastDate: 'Sep 04, 2026',
      surfaceTemp: '29.80 °C',
      surfaceSal: '32.90 PSU',
      maxDepth: '1,500 m',
      status: 'Active (Transmitting)',
    },
    {
      wmo: '2901540',
      basin: 'Arabian Sea (West)',
      lat: 16.450,
      lon: 61.200,
      cycle: 89,
      lastDate: 'Sep 01, 2026',
      surfaceTemp: '27.85 °C',
      surfaceSal: '36.20 PSU',
      maxDepth: '2,000 m',
      status: 'Active (Drifting)',
    },
    {
      wmo: '1901842',
      basin: 'Equatorial Indian Ocean',
      lat: 0.120,
      lon: 80.540,
      cycle: 142,
      lastDate: 'Sep 02, 2026',
      surfaceTemp: '28.75 °C',
      surfaceSal: '34.80 PSU',
      maxDepth: '2,000 m',
      status: 'Active (Descending)',
    },
  ];

  const filteredFloats = sampleFloats.filter(
    (f) =>
      f.wmo.includes(searchFilter) ||
      f.basin.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Radio className="w-5 h-5 text-[var(--primary)]" />
            Argo Profiling Floats Network
          </h1>
          <p className="page-subtitle">
            Global fleet of robotic in-situ floats measuring temperature, salinity, and pressure down to 2,000 meters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">INCOIS ERDDAP LIVE</Badge>
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open 3D Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Float Telemetry</span>
            <Radio className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">4,232</div>
          <div className="metric-stat-sub">
            <span style={{ color: 'var(--success)' }}>● 100% In-Situ Quality Controlled</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Sampling Depths</span>
            <ArrowDown className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">0 – 2,000 dbar</div>
          <div className="metric-stat-sub">
            <span>Full thermocline & intermediate water</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Cycle Periodicity</span>
            <RefreshCw className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">10 Days</div>
          <div className="metric-stat-sub">
            <span>Ascending CTD profile cycle</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Total Profiles Harvested</span>
            <Thermometer className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">84,520</div>
          <div className="metric-stat-sub">
            <span>Indian Ocean Basin Archive</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <Search className="w-4 h-4" />
          <span>SEARCH FLOAT DIRECTORY:</span>
        </div>
        <div style={{ width: '260px' }}>
          <Input
            size="sm"
            placeholder="Search by WMO ID (e.g. 1902670) or Basin..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Float Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Argo Floats in Indian Ocean
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Real-time telemetry stream synchronized with INCOIS and Coriolis GDAC repositories.
            </p>
          </div>
          <Badge variant="primary">{filteredFloats.length} Floats Listed</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>WMO Platform ID</th>
                <th>Ocean Sector</th>
                <th>Coordinates (Lat, Lon)</th>
                <th>Cycle #</th>
                <th>Last Transmission</th>
                <th>Surface Temp</th>
                <th>Surface Salinity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFloats.map((f) => (
                <tr key={f.wmo}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    #{f.wmo}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.basin}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {f.lat.toFixed(3)}°, {f.lon.toFixed(3)}°
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.cycle}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>{f.lastDate}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>{f.surfaceTemp}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.surfaceSal}</td>
                  <td>
                    <Badge variant={f.status.includes('Ascending') || f.status.includes('Transmitting') ? 'success' : 'neutral'}>
                      {f.status}
                    </Badge>
                  </td>
                  <td>
                    <Link to={`/explorer?lat=${f.lat}&lon=${f.lon}&wmo=${f.wmo}`}>
                      <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3 h-3" />}>
                        Inspect
                      </Button>
                    </Link>
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

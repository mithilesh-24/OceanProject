import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Waves, ExternalLink, Activity, Wind, Compass, Zap, 
  Search, Eye 
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { AdcpVelocityProfileChart } from '../components/charts/AdcpVelocityProfileChart';
import { ObservationDetailDrawer, SelectedObservation } from '../components/explorer/ObservationDetailDrawer';
import { api } from '../services/apiClient';

export const AdcpView: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArray, setSelectedArray] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState<SelectedObservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fallbackStations = [
    {
      station_id: 'ADCP-EQ-01',
      mooring_array: 'Equatorial Jet Mooring Array',
      location_desc: '0.0°N, 77.0°E (0–500m)',
      latitude: 0.0,
      longitude: 77.0,
      depth_range: '0 – 500 m',
      acoustic_freq: '75 kHz Long-Ranger',
      peak_current: 1.24,
      max_shear: 0.014,
      status: 'Online',
      velocity_profile: {
        bins: [
          { depth: 20, u_velocity: 1.18, v_velocity: 0.22, magnitude: 1.20, direction: 79.4, shear: 0.004 },
          { depth: 50, u_velocity: 1.22, v_velocity: 0.20, magnitude: 1.24, direction: 80.7, shear: 0.006 },
          { depth: 100, u_velocity: 0.95, v_velocity: 0.12, magnitude: 0.96, direction: 82.8, shear: 0.014 },
          { depth: 150, u_velocity: 0.54, v_velocity: 0.04, magnitude: 0.54, direction: 85.8, shear: 0.011 },
          { depth: 200, u_velocity: 0.22, v_velocity: -0.05, magnitude: 0.23, direction: 102.8, shear: 0.008 },
          { depth: 300, u_velocity: -0.15, v_velocity: -0.08, magnitude: 0.17, direction: 241.9, shear: 0.005 },
          { depth: 500, u_velocity: -0.08, v_velocity: -0.02, magnitude: 0.08, direction: 256.0, shear: 0.002 }
        ]
      }
    },
    {
      station_id: 'ADCP-SOMALI-03',
      mooring_array: 'Somali Boundary Array',
      location_desc: '8.4°N, 52.1°E (0–300m)',
      latitude: 8.4,
      longitude: 52.1,
      depth_range: '0 – 300 m',
      acoustic_freq: '150 kHz QuarterMaster',
      peak_current: 2.10,
      max_shear: 0.022,
      status: 'Online',
      velocity_profile: {
        bins: [
          { depth: 15, u_velocity: 1.35, v_velocity: 1.61, magnitude: 2.10, direction: 40.0, shear: 0.012 },
          { depth: 40, u_velocity: 1.22, v_velocity: 1.48, magnitude: 1.92, direction: 39.5, shear: 0.022 },
          { depth: 80, u_velocity: 0.92, v_velocity: 1.15, magnitude: 1.47, direction: 38.7, shear: 0.018 },
          { depth: 150, u_velocity: 0.45, v_velocity: 0.62, magnitude: 0.77, direction: 36.0, shear: 0.012 },
          { depth: 300, u_velocity: 0.12, v_velocity: 0.18, magnitude: 0.22, direction: 33.7, shear: 0.004 }
        ]
      }
    },
    {
      station_id: 'ADCP-EICC-02',
      mooring_array: 'East India Coastal Current Mooring',
      location_desc: '14.0°N, 80.5°E (0–200m)',
      latitude: 14.0,
      longitude: 80.5,
      depth_range: '0 – 200 m',
      acoustic_freq: '300 kHz Workhorse',
      peak_current: 0.85,
      max_shear: 0.009,
      status: 'Online',
      velocity_profile: {
        bins: [
          { depth: 10, u_velocity: 0.20, v_velocity: 0.83, magnitude: 0.85, direction: 13.5, shear: 0.006 },
          { depth: 30, u_velocity: 0.18, v_velocity: 0.76, magnitude: 0.78, direction: 13.3, shear: 0.009 },
          { depth: 60, u_velocity: 0.12, v_velocity: 0.52, magnitude: 0.53, direction: 13.0, shear: 0.008 },
          { depth: 100, u_velocity: 0.06, v_velocity: 0.28, magnitude: 0.29, direction: 12.1, shear: 0.006 },
          { depth: 200, u_velocity: 0.02, v_velocity: 0.10, magnitude: 0.10, direction: 11.3, shear: 0.002 }
        ]
      }
    },
  ];

  useEffect(() => {
    const fetchAdcp = async () => {
      try {
        const arrParam = selectedArray !== 'ALL' ? selectedArray : undefined;
        const data = await api.getAdcp(arrParam, searchQuery || undefined);
        if (data && data.length > 0) {
          setStations(data);
        } else {
          setStations(fallbackStations);
        }
      } catch {
        setStations(fallbackStations);
      }
    };
    fetchAdcp();
  }, [selectedArray, searchQuery]);

  const handleInspectAdcp = (a: any) => {
    setSelectedStation({
      type: 'adcp',
      id: a.station_id,
      title: `${a.station_id}`,
      subtitle: `${a.mooring_array} • ${a.acoustic_freq}`,
      latitude: a.latitude,
      longitude: a.longitude,
      maxDepth: a.depth_range,
      status: a.status,
      velocityProfile: a.velocity_profile,
    });
    setIsDrawerOpen(true);
  };

  const filteredStations = stations.filter(
    (a) =>
      a.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mooring_array?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location_desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5" style={{ position: 'relative' }}>
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

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
            <span>SEARCH:</span>
          </div>
          <div style={{ width: '220px' }}>
            <Input
              size="sm"
              placeholder="Station or mooring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Array Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Arrays' },
            { key: 'Equatorial', label: 'Equatorial Jet' },
            { key: 'Somali', label: 'Somali Boundary' },
            { key: 'EICC', label: 'East India Current' }
          ].map((arr) => (
            <button
              key={arr.key}
              onClick={() => setSelectedArray(arr.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: selectedArray === arr.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedArray === arr.key ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: selectedArray === arr.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {arr.label}
            </button>
          ))}
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

        <div className="table-scroll-container">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((a) => (
                <tr key={a.station_id} style={{ cursor: 'pointer' }} onClick={() => handleInspectAdcp(a)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {a.station_id}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.mooring_array}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '11.5px' }}>{a.location_desc}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.acoustic_freq}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                    {a.peak_current} m/s
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.max_shear} s⁻¹</td>
                  <td>
                    <Badge variant="success">{a.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => handleInspectAdcp(a)}
                      >
                        Velocity
                      </Button>
                      <Link to={`/explorer?lat=${a.latitude}&lon=${a.longitude}`}>
                        <Button variant="outline" size="sm" leftIcon={<Compass className="w-3 h-3" />}>
                          3D
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Detail Drawer */}
      <ObservationDetailDrawer
        observation={selectedStation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};


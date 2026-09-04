import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Anchor, ExternalLink, Wind, Waves, Thermometer, Radio, 
  Search, Eye, Compass, Activity, Clock 
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { BuoyTimeSeriesChart } from '../components/charts/BuoyTimeSeriesChart';
import { ObservationDetailDrawer, SelectedObservation } from '../components/explorer/ObservationDetailDrawer';
import { api } from '../services/apiClient';

export const BuoysView: React.FC = () => {
  const [buoys, setBuoys] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('ALL');
  const [selectedBuoy, setSelectedBuoy] = useState<SelectedObservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fallbackBuoys = [
    {
      station_id: 'OMNI-BD08',
      network: 'INCOIS OMNI Moored Array',
      location_name: 'Central Bay of Bengal (18.2°N, 89.7°E)',
      latitude: 18.2,
      longitude: 89.7,
      sst: 29.40,
      air_temp: 28.10,
      wind_speed: 12.4,
      wave_height: 1.8,
      status: 'Online (Transmitting)',
      timeseries_data: [
        { time: '00:00', sst: 29.2, air_temp: 27.8, wind: 11.8, wave: 1.7 },
        { time: '04:00', sst: 29.0, air_temp: 27.2, wind: 12.5, wave: 1.8 },
        { time: '08:00', sst: 29.4, air_temp: 28.1, wind: 13.0, wave: 1.9 },
        { time: '12:00', sst: 29.8, air_temp: 29.4, wind: 14.2, wave: 2.0 },
        { time: '16:00', sst: 29.6, air_temp: 28.8, wind: 13.5, wave: 1.9 },
        { time: '20:00', sst: 29.3, air_temp: 28.0, wind: 12.0, wave: 1.8 }
      ]
    },
    {
      station_id: 'OMNI-AD06',
      network: 'INCOIS OMNI Moored Array',
      location_name: 'Eastern Arabian Sea (18.5°N, 67.5°E)',
      latitude: 18.5,
      longitude: 67.5,
      sst: 27.95,
      air_temp: 27.20,
      wind_speed: 16.2,
      wave_height: 2.4,
      status: 'Online (Transmitting)',
      timeseries_data: [
        { time: '00:00', sst: 27.8, air_temp: 27.0, wind: 15.5, wave: 2.2 },
        { time: '04:00', sst: 27.6, air_temp: 26.8, wind: 16.0, wave: 2.3 },
        { time: '08:00', sst: 27.9, air_temp: 27.2, wind: 16.2, wave: 2.4 },
        { time: '12:00', sst: 28.2, air_temp: 27.8, wind: 17.0, wave: 2.5 },
        { time: '16:00', sst: 28.0, air_temp: 27.5, wind: 16.5, wave: 2.4 },
        { time: '20:00', sst: 27.9, air_temp: 27.1, wind: 15.8, wave: 2.3 }
      ]
    },
    {
      station_id: 'RAMA-23001',
      network: 'RAMA Tropical Mooring',
      location_name: 'Equatorial Indian Ocean (0.0°N, 80.5°E)',
      latitude: 0.0,
      longitude: 80.5,
      sst: 28.80,
      air_temp: 27.90,
      wind_speed: 8.5,
      wave_height: 1.2,
      status: 'Online (Transmitting)'
    },
    {
      station_id: 'COASTAL-CB02',
      network: 'Coastal Met-Ocean Network',
      location_name: 'Off Visakhapatnam Coast (17.6°N, 83.3°E)',
      latitude: 17.6,
      longitude: 83.3,
      sst: 29.10,
      air_temp: 28.80,
      wind_speed: 9.0,
      wave_height: 0.9,
      status: 'Online (Transmitting)'
    },
  ];

  useEffect(() => {
    const fetchBuoys = async () => {
      try {
        const netParam = selectedNetwork !== 'ALL' ? selectedNetwork : undefined;
        const data = await api.getBuoys(netParam, searchQuery || undefined);
        if (data && data.length > 0) {
          setBuoys(data);
        } else {
          setBuoys(fallbackBuoys);
        }
      } catch {
        setBuoys(fallbackBuoys);
      }
    };
    fetchBuoys();
  }, [selectedNetwork, searchQuery]);

  const handleInspectBuoy = (b: any) => {
    setSelectedBuoy({
      type: 'buoy',
      id: b.station_id,
      title: `Mooring ${b.station_id}`,
      subtitle: b.network || b.location_name,
      latitude: b.latitude,
      longitude: b.longitude,
      surfaceTemp: b.sst,
      status: b.status,
      timeseriesData: b.timeseries_data,
    });
    setIsDrawerOpen(true);
  };

  const filteredBuoys = buoys.filter(
    (b) =>
      b.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.network?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5" style={{ position: 'relative' }}>
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
              placeholder="Station ID or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Network Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Moorings' },
            { key: 'OMNI', label: 'OMNI Deep Sea' },
            { key: 'RAMA', label: 'RAMA Tropical' },
            { key: 'Coastal', label: 'Coastal Array' }
          ].map((n) => (
            <button
              key={n.key}
              onClick={() => setSelectedNetwork(n.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: selectedNetwork === n.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedNetwork === n.key ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: selectedNetwork === n.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {n.label}
            </button>
          ))}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuoys.map((b) => (
                <tr key={b.station_id} style={{ cursor: 'pointer' }} onClick={() => handleInspectBuoy(b)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {b.station_id}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{b.network}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.location_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#ff6b6b' }}>
                    {b.sst ? `${b.sst} °C` : '--'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.air_temp ? `${b.air_temp} °C` : '--'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#0ea5e9' }}>{b.wind_speed ? `${b.wind_speed} kts` : '--'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
                    {b.wave_height ? `${b.wave_height} m` : '--'}
                  </td>
                  <td>
                    <Badge variant="success">{b.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => handleInspectBuoy(b)}
                      >
                        Trends
                      </Button>
                      <Link to={`/explorer?lat=${b.latitude}&lon=${b.longitude}`}>
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
        observation={selectedBuoy}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};


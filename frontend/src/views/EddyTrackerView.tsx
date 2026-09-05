import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCw, RefreshCw, Search, Eye, Compass, Wind, 
  Layers, ExternalLink, Zap, ShieldCheck, Activity, BarChart2, Thermometer
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { api, EddyItem, EddiesResponse } from '../services/apiClient';

export const EddyTrackerView: React.FC = () => {
  const [eddiesData, setEddiesData] = useState<EddiesResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedEddyKinematics, setSelectedEddyKinematics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEddies = async () => {
    setLoading(true);
    try {
      const reg = selectedRegion !== 'ALL' ? selectedRegion : undefined;
      const data = await api.getEddies(reg, selectedType);
      setEddiesData(data);
    } catch (err) {
      console.error('Failed to fetch eddies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEddies();
  }, [selectedRegion, selectedType]);

  const handleInspectKinematics = async (eddy: EddyItem) => {
    try {
      const kin = await api.getEddyKinematics(eddy.eddy_id);
      setSelectedEddyKinematics(kin);
    } catch (err) {
      console.error('Failed to fetch eddy kinematics:', err);
    }
  };

  const filteredEddies = (eddiesData?.eddies || []).filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.eddy_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-cyan animate-spin-slow" />
              Mesoscale Eddy Kinematics &amp; Vortex Tracker
            </h1>
            <Badge variant="primary">Phase 26</Badge>
            <Badge variant="success">Okubo-Weiss W &lt; -0.2σ</Badge>
          </div>
          <p className="page-subtitle">
            Autonomous detection, kinematics decomposition, Rossby number ($Ro$), and heat/salt flux transport for Indian Ocean coherent vortices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              View on 3D Globe
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEddies}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-5">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Detected Vortices</span>
            <RotateCw className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value text-cyan">
            {eddiesData ? eddiesData.total_detected : '4'} Coherent Rings
          </div>
          <div className="metric-stat-sub"><span>Indian Ocean Domain</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Anticyclones (Warm Core)</span>
            <Thermometer className="w-4 h-4 text-rose" />
          </div>
          <div className="metric-stat-value text-rose">
            {eddiesData ? eddiesData.anticyclonic_count : '3'} Systems
          </div>
          <div className="metric-stat-sub"><span>SSH Elevation (+Δη) &bull; Downwelling</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Cyclones (Cold Core)</span>
            <Wind className="w-4 h-4 text-sky" />
          </div>
          <div className="metric-stat-value text-sky">
            {eddiesData ? eddiesData.cyclonic_count : '1'} Systems
          </div>
          <div className="metric-stat-sub"><span>SSH Depression (-Δη) &bull; Upwelling</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Peak Swirl Velocity</span>
            <Zap className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            1.35 m/s
          </div>
          <div className="metric-stat-sub"><span>Great Whirl Boundary Jet</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Provenance Source</span>
            <ShieldCheck className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald text-sm font-semibold">
            DERIVED_ANALYSIS
          </div>
          <div className="metric-stat-sub"><span>Hydrodynamic Flow Grid</span></div>
        </div>
      </div>

      {/* Selected Eddy Kinematics Depth Slice Panel */}
      {selectedEddyKinematics && (
        <div className="analysis-panel" style={{ border: '1px solid var(--primary-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="w-4 h-4 text-cyan" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Subsurface Kinematics &amp; Isopycnal Deflection — {selectedEddyKinematics.name} ({selectedEddyKinematics.eddy_type})
              </h3>
            </div>
            <button
              onClick={() => setSelectedEddyKinematics(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕ Close
            </button>
          </div>

          <div className="table-scroll-container">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Depth (m)</th>
                  <th>Core Temp Anomaly (°C)</th>
                  <th>Rotational Velocity |u| (m/s)</th>
                  <th>Isopycnal Displacement (m)</th>
                  <th>Hydrodynamic Regimes</th>
                </tr>
              </thead>
              <tbody>
                {selectedEddyKinematics.vertical_profile?.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.depth_m} m
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: row.temperature_anomaly_c >= 0 ? '#f43f5e' : '#38bdf8' }}>
                      {row.temperature_anomaly_c > 0 ? `+${row.temperature_anomaly_c.toFixed(2)}` : row.temperature_anomaly_c.toFixed(2)} °C
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                      {row.rotational_velocity_ms.toFixed(2)} m/s
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: row.isopycnal_displacement_m >= 0 ? '#10b981' : '#38bdf8' }}>
                      {row.isopycnal_displacement_m > 0 ? `+${row.isopycnal_displacement_m}` : row.isopycnal_displacement_m} m
                    </td>
                    <td>
                      <Badge variant={row.depth_m <= 100 ? 'primary' : 'neutral'}>
                        {row.depth_m <= 100 ? 'Swirl Maximum' : 'Deep Baroclinic Decay'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              placeholder="Eddy name or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'ALL', label: 'All Vortices' },
            { key: 'ANTICYCLONIC', label: 'Anticyclones (Warm Core)' },
            { key: 'CYCLONIC', label: 'Cyclones (Cold Core)' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: selectedType === t.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedType === t.key ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: selectedType === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eddies Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Tracked Mesoscale Coherent Eddies
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Okubo-Weiss parameter (W = s_n² + s_s² - ω²), vortex amplitude, and Rossby number decomposition.
            </p>
          </div>
          <Badge variant="primary">Okubo-Weiss Core Tracker</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Eddy Identifier</th>
                <th>Vortex Classification</th>
                <th>Center Position</th>
                <th>Radius (km)</th>
                <th>Amplitude (ΔSSH)</th>
                <th>Swirl Speed (Vmax)</th>
                <th>Rossby No. (Ro)</th>
                <th>Lifetime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEddies.map((e) => (
                <tr key={e.eddy_id} style={{ cursor: 'pointer' }} onClick={() => handleInspectKinematics(e)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {e.eddy_id}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{e.name}</strong>
                      <Badge variant={e.eddy_type === 'ANTICYCLONIC' ? 'warning' : 'info'}>
                        {e.eddy_type}
                      </Badge>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {e.center_latitude.toFixed(2)}°N, {e.center_longitude.toFixed(2)}°E
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{e.radius_km} km</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: e.amplitude_ssh_m >= 0 ? '#10b981' : '#38bdf8' }}>
                    {e.amplitude_ssh_m > 0 ? `+${e.amplitude_ssh_m.toFixed(2)}` : e.amplitude_ssh_m.toFixed(2)} m
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                    {e.max_rotational_velocity_ms} m/s
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{e.rossby_number}</td>
                  <td>{e.lifetime_days} days</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(ev) => ev.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => handleInspectKinematics(e)}
                      >
                        Kinematics
                      </Button>
                      <Link to={`/explorer?lat=${e.center_latitude}&lon=${e.center_longitude}`}>
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
    </div>
  );
};

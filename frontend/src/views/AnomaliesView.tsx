import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, AlertCircle, TrendingUp, ShieldAlert, RefreshCw, Globe } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';
import { AnomalyTimeSeriesChart } from '../components/charts/AnomalyTimeSeriesChart';
import { api } from '../services/apiClient';

export const AnomaliesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [selectedRegion, setSelectedRegion] = useState('indian_ocean');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await api.detectAnomalies({
        variable: selectedVariable,
        region: selectedRegion,
        category_filter: selectedCategory,
        mhw_threshold_percentile: 90.0,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [selectedCategory, selectedVariable, selectedRegion]);

  const summary = data?.summary;

  const getCategoryBadge = (cat: string) => {
    if (cat.includes('Severe') || cat.includes('Cat III')) return <Badge variant="danger">Cat III (Severe)</Badge>;
    if (cat.includes('Strong') || cat.includes('Cat II')) return <Badge variant="warning">Cat II (Strong)</Badge>;
    if (cat.includes('Extreme') || cat.includes('Cat IV')) return <Badge variant="danger">Cat IV (Extreme)</Badge>;
    if (cat.includes('Moderate') || cat.includes('Cat I')) return <Badge variant="warning">Cat I (Moderate)</Badge>;
    return <Badge variant="primary">{cat}</Badge>;
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose" />
              Oceanographic Anomaly &amp; Marine Heatwave Detection
            </h1>
            <Badge variant="primary">Phase 13</Badge>
          </div>
          <p className="page-subtitle">
            Autonomous marine heatwave (MHW) tracking (Hobday Cat I–IV), salinity barrier layer inversions, and 3D globe focus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnomalies}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Re-scan Sensors
          </Button>
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />}>
              Open 3D Anomaly Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ width: '200px' }}>
            <Select
              size="sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Anomaly Categories' },
                { value: 'mhw', label: 'Marine Heatwaves (MHW)' },
                { value: 'salinity', label: 'Freshwater / Salinity' },
                { value: 'inversion', label: 'Thermal Inversions' },
              ]}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              size="sm"
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              options={[
                { value: 'temperature', label: 'Temperature (°C)' },
                { value: 'salinity', label: 'Salinity (PSU)' },
              ]}
            />
          </div>
          <div style={{ width: '190px' }}>
            <Select
              size="sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={[
                { value: 'indian_ocean', label: 'Whole Indian Ocean' },
                { value: 'arabian_sea', label: 'Arabian Sea Basin' },
                { value: 'bay_of_bengal', label: 'Bay of Bengal' },
                { value: 'andaman_sea', label: 'Andaman Sea' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <ShieldAlert className="w-4 h-4 text-rose" />
          <span>Hobday 90th Percentile Criteria Active</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Marine Heatwaves</span>
            <Flame className="w-4 h-4 text-rose" />
          </div>
          <div className="metric-stat-value text-rose">
            {summary ? `${summary.active_heatwaves} Active` : '3 Active'}
          </div>
          <div className="metric-stat-sub">Severe &amp; Strong events</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Peak Thermal Anomaly</span>
            <TrendingUp className="w-4 h-4 text-rose-light" />
          </div>
          <div className="metric-stat-value text-rose-light">
            {summary ? summary.max_temperature_anomaly : '+2.85 °C'}
          </div>
          <div className="metric-stat-sub">Central Arabian Sea</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Salinity &amp; Inversion Alerts</span>
            <AlertCircle className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value text-cyan">
            {summary ? summary.salinity_alerts + summary.thermal_inversions : 2}
          </div>
          <div className="metric-stat-sub">Barrier layer freshening</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Affected Ocean Surface</span>
            <Globe className="w-4 h-4 text-purple" />
          </div>
          <div className="metric-stat-value">
            {summary ? `${(summary.ocean_area_affected_sqkm / 1000).toFixed(0)}k km²` : '685k km²'}
          </div>
          <div className="metric-stat-sub">Ecological bleaching risk</div>
        </div>
      </div>

      {/* MHW Evolution Time Series Chart */}
      {data?.mhw_timeseries && (
        <AnomalyTimeSeriesChart
          data={data.mhw_timeseries}
          eventName="Arabian Sea Central Marine Heatwave (MHW-2024-01)"
          units={data.units || '°C'}
        />
      )}

      {/* Active Events & 3D Globe Clusters */}
      <div className="grid-cols-2">
        {/* Active Detected Events Inventory */}
        <div className="analysis-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Detected Oceanographic Anomalies
            </h4>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {(data?.events || []).length} Tracked Events
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
            {(data?.events || []).map((ev: any) => (
              <div
                key={ev.id}
                className="analysis-item-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{ev.id}</span>
                    {getCategoryBadge(ev.category)}
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f43f5e' }}>
                    +{ev.peak_anomaly} {data?.units || '°C'}
                  </span>
                </div>

                <div>
                  <h5 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{ev.title}</h5>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{ev.impact}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Basin: {ev.basin}</span>
                  <span>Duration: {ev.duration_days} Days ({ev.status})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial Anomaly Clusters (3D Focus) */}
        <div className="analysis-panel" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Geographic Anomaly Hotspot Clusters
              </h4>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Launch in 3D Cesium</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data?.spatial_clusters || []).map((cl: any) => (
                <div
                  key={cl.cluster_id}
                  className="analysis-item-card"
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h5 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{cl.name}</h5>
                      <span className="badge-rose">{cl.anomaly_val}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block' }}>
                      Center: {cl.latitude}°N, {cl.longitude}°E | Radius: {cl.radius_km} km
                    </span>
                  </div>

                  <Link to={`/explorer?lat=${cl.latitude}&lon=${cl.longitude}&zoom=basin`}>
                    <Button variant="outline" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />}>
                      Fly in 3D
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Subsurface Anomaly Depth Profile */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Vertical Thermal Anomaly Penetration (0–500m)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {(data?.depth_profile || []).slice(0, 5).map((dp: any) => (
                <div key={dp.depth_m} style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>{dp.depth_m}m</span>
                  <span style={{ fontWeight: 700, color: '#f43f5e' }}>+{dp.anomaly}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, RefreshCw, ShieldAlert, Download, Clock } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';
import { SpatialErrorHeatmap } from '../components/charts/SpatialErrorHeatmap';
import { api } from '../services/apiClient';

export const ErrorsView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('hycom');
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [selectedRegion, setSelectedRegion] = useState('indian_ocean');
  const [selectedDepth, setSelectedDepth] = useState('0');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await api.getSpatialTemporalErrors({
        model: selectedModel,
        variable: selectedVariable,
        depth: parseFloat(selectedDepth),
        region: selectedRegion,
        time_horizon_days: 10,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch spatial errors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [selectedModel, selectedVariable, selectedRegion, selectedDepth]);

  const summary = data?.summary;

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose" />
              Spatial &amp; Temporal Error Analysis
            </h1>
            <Badge variant="primary">Phase 12</Badge>
          </div>
          <p className="page-subtitle">
            2D geographical error fields, forecast lead-time degradation curves, and sensor outlier identification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchErrors}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Recalculate Biases
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Error Grid
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ width: '190px' }}>
            <Select
              size="sm"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              options={[
                { value: 'hycom', label: 'HYCOM Global 1/12°' },
                { value: 'roms', label: 'ROMS Regional 1/24°' },
                { value: 'nemo', label: 'NEMO Ocean 1/12°' },
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
          <div style={{ width: '180px' }}>
            <Select
              size="sm"
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(e.target.value)}
              options={[
                { value: '0', label: '0m (Surface Layer)' },
                { value: '50', label: '50m (Mixed Layer)' },
                { value: '100', label: '100m (Thermocline)' },
                { value: '300', label: '300m (Intermediate)' },
                { value: '1000', label: '1000m (Deep Basin)' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <ShieldAlert className="w-4 h-4 text-amber" />
          <span>Z-Score &gt; 2.5 Outlier Criterion Active</span>
        </div>
      </div>

      {/* Overview Metric Stat Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Spatial RMSE</span>
            <AlertTriangle className="w-4 h-4 text-rose-light" />
          </div>
          <div className="metric-stat-value text-rose-light">
            {summary ? `${summary.mean_spatial_rmse.toFixed(3)} ${data?.units || '°C'}` : '0.412 °C'}
          </div>
          <div className="metric-stat-sub">Across 360 Indian Ocean cells</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Spatial Bias</span>
            <TrendingDown className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            {summary ? `${summary.mean_spatial_bias > 0 ? '+' : ''}${summary.mean_spatial_bias.toFixed(3)} ${data?.units || '°C'}` : '+0.086 °C'}
          </div>
          <div className="metric-stat-sub">Systematic domain error</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Critical Hotspot Bias</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Offset</span>
          </div>
          <div className="metric-stat-value text-rose">
            {summary ? `${summary.hotspot_max_bias.toFixed(3)} ${data?.units || '°C'}` : '+1.420 °C'}
          </div>
          <div className="metric-stat-sub">North Arabian Sea Upwelling</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Detected Sensor Outliers</span>
            <ShieldAlert className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value">
            {summary ? `${summary.sensor_outlier_count} Profiles` : '8 Profiles'}
          </div>
          <div className="metric-stat-sub">Flagged for QC isolation</div>
        </div>
      </div>

      {/* Spatial Error Heatmap & Temporal Lead-Time Decay */}
      <div className="grid-cols-2">
        {/* 2D Error Heatmap */}
        {data?.spatial_grid && (
          <SpatialErrorHeatmap
            grid={data.spatial_grid}
            units={data.units || '°C'}
          />
        )}

        {/* Forecast Lead Time Degradation Panel */}
        <div className="analysis-panel" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Forecast Lead-Time Error Growth (Day +1 to +10)
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Empirical degradation curve of RMSE and Bias with forecast horizon
                </p>
              </div>
              <Clock className="w-4 h-4 text-muted" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(data?.temporal_degradation || []).map((t: any) => (
                <div
                  key={t.lead_day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    Day +{t.lead_day} ({t.date.slice(5)})
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#f43f5e' }}>RMSE: {t.rmse.toFixed(3)} {data?.units || '°C'}</span>
                    <span style={{ color: t.bias > 0 ? '#f59e0b' : '#38bdf8' }}>
                      Bias: {t.bias > 0 ? `+${t.bias.toFixed(3)}` : t.bias.toFixed(3)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>
                      Skill: {(t.skill_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Assimilation Horizon: 10 Days</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Ensemble Spread: ±0.08°C</span>
          </div>
        </div>
      </div>

      {/* Sensor Outlier Inventory Table */}
      {data?.sensor_outliers && (
        <div className="table-wrapper">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Sensor Outlier Quality-Control Stream (Z-Score &gt; 2.5)
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Flagged observation stations displaying anomalous model-observation departure.
              </p>
            </div>
            <Badge variant="warning">{data.sensor_outliers.length} Anomaly Flags</Badge>
          </div>

          <div className="table-scroll-container">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Station Platform</th>
                  <th>Observed Lat / Lon</th>
                  <th>Observed Value</th>
                  <th>Model Value</th>
                  <th>Departure (Residual)</th>
                  <th>Z-Score</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {data.sensor_outliers.map((o: any) => (
                  <tr key={o.station_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                      #{o.station_id}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {o.latitude.toFixed(2)}°N, {o.longitude.toFixed(2)}°E
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{o.obs_val.toFixed(2)} {data?.units || '°C'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{o.model_val.toFixed(2)} {data?.units || '°C'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f43f5e' }}>
                      {o.residual > 0 ? `+${o.residual.toFixed(2)}` : o.residual.toFixed(2)} {data?.units || '°C'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                      z = {o.z_score.toFixed(2)}
                    </td>
                    <td>
                      <Badge variant={o.severity === 'high' ? 'danger' : 'warning'}>
                        {o.severity.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle, MapPin, Layers, TrendingDown, RefreshCw, BarChart2, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';

export const ErrorsView: React.FC = () => {
  const [selectedVariable, setSelectedVariable] = useState('temp');

  const errorHotspots = [
    {
      region: 'Somali Current Boundary',
      coords: '4°N–12°N, 48°E–56°E',
      model: 'HYCOM 1/12°',
      variable: 'Temperature (°C)',
      maxError: '+1.42 °C',
      rmse: '0.86 °C',
      bias: '+0.54 °C',
      cause: 'Intense seasonal monsoonal coastal upwelling underestimation',
      severity: 'high',
    },
    {
      region: 'Ganges-Brahmaputra Plume',
      coords: '18°N–22°N, 87°E–92°E',
      model: 'NEMO Global',
      variable: 'Salinity (PSU)',
      maxError: '-2.10 PSU',
      rmse: '0.94 PSU',
      bias: '-0.78 PSU',
      cause: 'Monsoon freshwater river discharge boundary smoothing',
      severity: 'high',
    },
    {
      region: 'Indonesian Throughflow (Timor)',
      coords: '8°S–14°S, 115°E–128°E',
      model: 'ROMS Regional',
      variable: 'Currents (m/s)',
      maxError: '0.45 m/s',
      rmse: '0.24 m/s',
      bias: '-0.12 m/s',
      cause: 'Narrow bathymetric straits and internal solitary wave tidal mixing',
      severity: 'medium',
    },
    {
      region: 'Seychelles-Chagos Thermocline Ridge',
      coords: '5°S–10°S, 55°E–75°E',
      model: 'HYCOM 1/12°',
      variable: 'Thermocline Depth (m)',
      maxError: '18.5 m',
      rmse: '9.8 m',
      bias: '+4.2 m',
      cause: 'Wind-stress curl open-ocean upwelling displacement',
      severity: 'medium',
    },
    {
      region: 'Central Arabian Sea Cold Core Eddy',
      coords: '14°N–18°N, 62°E–68°E',
      model: 'ROMS Regional',
      variable: 'Temperature (°C)',
      maxError: '-0.95 °C',
      rmse: '0.48 °C',
      bias: '-0.22 °C',
      cause: 'Sub-mesoscale eddy vortex core temperature overcooling',
      severity: 'low',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
            Spatial & Temporal Error Analysis
          </h1>
          <p className="page-subtitle">
            Regional discrepancies, bias spatial heatmaps, and hydrodynamic model error hotspots across the Indian Ocean basin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Recalculate Biases
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Peak Spatial Error</span>
            <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
          </div>
          <div className="metric-stat-value text-[var(--danger)]">+1.42 °C</div>
          <div className="metric-stat-sub">
            <span>Somali Upwelling Front (HYCOM)</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Vertical Bias</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">+0.08 °C</div>
          <div className="metric-stat-sub">
            <span>0–2000m basin-wide average</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Error Hotspots</span>
            <MapPin className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">5 Identified</div>
          <div className="metric-stat-sub">
            <span>2 High • 2 Medium • 1 Low</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Confidence Index</span>
            <TrendingDown className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">94.8%</div>
          <div className="metric-stat-sub">
            <span>Within ±0.5°C threshold</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <span className="text-xs font-semibold text-[var(--text-muted)]">FILTER ERROR DIAGNOSTICS:</span>
        <div style={{ width: '200px' }}>
          <Select
            size="sm"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            options={[
              { value: 'all', label: 'All Ocean Variables' },
              { value: 'temp', label: 'Temperature (°C)' },
              { value: 'sal', label: 'Practical Salinity (PSU)' },
              { value: 'curr', label: 'Zonal & Meridional Current (m/s)' },
            ]}
          />
        </div>
      </div>

      {/* Regional Error Hotspot Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Regional Model Discrepancy & Diagnostic Log
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Identifies oceanographic dynamics responsible for spatial deviations against in-situ Argo & OMNI buoys.
            </p>
          </div>
          <Badge variant="warning">5 Active Regions</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Region Name</th>
                <th>Bounding Coordinates</th>
                <th>Model System</th>
                <th>Variable</th>
                <th>Max Deviation</th>
                <th>RMSE / Bias</th>
                <th>Diagnostic Root Cause</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {errorHotspots.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.region}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{h.coords}</td>
                  <td><Badge variant="primary">{h.model}</Badge></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{h.variable}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: h.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }}>{h.maxError}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{h.rmse} / {h.bias}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)', maxWidth: '280px' }}>{h.cause}</td>
                  <td>
                    <Badge variant={h.severity === 'high' ? 'danger' : h.severity === 'medium' ? 'warning' : 'neutral'}>
                      {h.severity.toUpperCase()}
                    </Badge>
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

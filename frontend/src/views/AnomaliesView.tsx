import React, { useState } from 'react';
import { Flame, AlertCircle, TrendingUp, Compass, ShieldAlert, Radio, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';

export const AnomaliesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const anomalyEvents = [
    {
      id: 'MHW-2026-08',
      type: 'Marine Heatwave (Category III)',
      region: 'Central Arabian Sea (15.2°N, 64.5°E)',
      anomaly: '+2.85 °C above 90th percentile climatology',
      depth: 'Surface to 45 m',
      sensor: 'Argo Float #2902224 & INSAT-3D SST',
      duration: '14 Days (Active)',
      severity: 'extreme',
    },
    {
      id: 'SAL-2026-04',
      type: 'Freshwater Lens Inversion',
      region: 'Northern Bay of Bengal (19.8°N, 89.2°E)',
      anomaly: '-3.40 PSU freshening anomaly',
      depth: '0 – 20 m barrier layer',
      sensor: 'Argo Float #7902190',
      duration: '6 Days',
      severity: 'moderate',
    },
    {
      id: 'COLD-2026-01',
      type: 'Cold Core Upwelling Pulse',
      region: 'Oman Coast (21.4°N, 59.8°E)',
      anomaly: '-3.10 °C below monthly mean',
      depth: '0 – 120 m',
      sensor: 'RAMA Moored Buoy #23001',
      duration: '21 Days',
      severity: 'moderate',
    },
    {
      id: 'DRIFT-2026-11',
      type: 'Sensor Calibration Drift Alert',
      region: 'Equatorial Indian Ocean (1.2°S, 80.5°E)',
      anomaly: '+0.18 PSU continuous offset',
      depth: '500 – 2,000 m (Deep Stable Layer)',
      sensor: 'Argo Float #1902670 (CTD Cell)',
      duration: 'Flagged for QC Review',
      severity: 'low',
    },
    {
      id: 'MHW-2026-09',
      type: 'Marine Heatwave (Category II)',
      region: 'Lakshadweep Sea (9.5°N, 72.1°E)',
      anomaly: '+1.92 °C SST anomaly',
      depth: 'Surface to 30 m',
      sensor: 'OMNI Buoy AD06 & HYCOM Assimilation',
      duration: '9 Days (Active)',
      severity: 'moderate',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Flame className="w-5 h-5 text-rose-500" />
            Ocean Anomaly & Extreme Event Detection
          </h1>
          <p className="page-subtitle">
            Autonomous marine heatwave (MHW) tracking, salinity barrier layer inversions, and in-situ sensor drift alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}>
            Configure Alarm Thresholds
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Active Marine Heatwaves</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="metric-stat-value text-rose-500">2 Ongoing</div>
          <div className="metric-stat-sub">
            <span>Arabian Sea & Lakshadweep Sea</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Max SST Anomaly</span>
            <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">+2.85 °C</div>
          <div className="metric-stat-sub">
            <span>Above 1993–2020 climatology</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Salinity Inversions</span>
            <Compass className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">1 Detected</div>
          <div className="metric-stat-sub">
            <span>North BoB barrier layer</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>QC Flagged Sensors</span>
            <Radio className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <div className="metric-stat-value">1 Float</div>
          <div className="metric-stat-sub">
            <span>Float #1902670 drift alert</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <span className="text-xs font-semibold text-[var(--text-muted)]">FILTER ANOMALY EVENTS:</span>
        <div style={{ width: '220px' }}>
          <Select
            size="sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Anomaly Categories' },
              { value: 'mhw', label: 'Marine Heatwaves (MHW)' },
              { value: 'sal', label: 'Salinity Inversions' },
              { value: 'upwelling', label: 'Cold Core Upwelling' },
              { value: 'drift', label: 'Sensor Calibration Drift' },
            ]}
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Detected Oceanographic Anomalies & In-Situ Alerts
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Algorithms compute deviations against the NOAA OISST / INCOIS Ocean Climatological Atlas (90th percentile threshold).
            </p>
          </div>
          <Badge variant="danger">2 Active Alerts</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Event Code</th>
                <th>Classification</th>
                <th>Geographic Position</th>
                <th>Anomaly Amplitude</th>
                <th>Depth Influence</th>
                <th>Detection Instrument</th>
                <th>Duration / Status</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {anomalyEvents.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{ev.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.type}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{ev.region}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: ev.severity === 'extreme' ? 'var(--danger)' : 'var(--warning)' }}>{ev.anomaly}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{ev.depth}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{ev.sensor}</td>
                  <td>
                    <Badge variant={ev.duration.includes('Active') ? 'danger' : 'neutral'}>
                      {ev.duration}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={ev.severity === 'extreme' ? 'danger' : ev.severity === 'moderate' ? 'warning' : 'neutral'}>
                      {ev.severity.toUpperCase()}
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

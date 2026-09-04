import React, { useState } from 'react';
import { Activity, BarChart2, PieChart, TrendingUp, Download, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';

export const StatisticsView: React.FC = () => {
  const [selectedDepth, setSelectedDepth] = useState('0-500');

  const depthStats = [
    { level: '0 m (Surface)', meanTemp: '28.45 °C', stdTemp: '±1.12 °C', meanSal: '33.85 PSU', stdSal: '±0.92 PSU', meanDens: '1021.4 kg/m³', sampleCount: '4,232' },
    { level: '50 m (Mixed Layer Base)', meanTemp: '26.80 °C', stdTemp: '±1.45 °C', meanSal: '34.40 PSU', stdSal: '±0.55 PSU', meanDens: '1022.8 kg/m³', sampleCount: '4,180' },
    { level: '100 m (Thermocline)', meanTemp: '22.15 °C', stdTemp: '±2.30 °C', meanSal: '34.95 PSU', stdSal: '±0.38 PSU', meanDens: '1024.9 kg/m³', sampleCount: '4,120' },
    { level: '200 m (Upper Mesopelagic)', meanTemp: '16.40 °C', stdTemp: '±1.80 °C', meanSal: '35.10 PSU', stdSal: '±0.25 PSU', meanDens: '1026.5 kg/m³', sampleCount: '4,050' },
    { level: '500 m (Intermediate Water)', meanTemp: '10.25 °C', stdTemp: '±0.85 °C', meanSal: '35.05 PSU', stdSal: '±0.15 PSU', meanDens: '1027.2 kg/m³', sampleCount: '3,890' },
    { level: '1000 m (Deep Stable)', meanTemp: '6.80 °C', stdTemp: '±0.42 °C', meanSal: '34.82 PSU', stdSal: '±0.08 PSU', meanDens: '1027.6 kg/m³', sampleCount: '3,650' },
    { level: '2000 m (Abyssal Boundary)', meanTemp: '2.45 °C', stdTemp: '±0.18 °C', meanSal: '34.72 PSU', stdSal: '±0.04 PSU', meanDens: '1027.9 kg/m³', sampleCount: '2,810' },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Activity className="w-5 h-5 text-[var(--primary)]" />
            Oceanographic Statistics & Distribution Engine
          </h1>
          <p className="page-subtitle">
            Vertical hydrographic profiles, Gaussian density fits, variance structures, and standard deviations across the Indian Ocean basin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export CSV Summary
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Total Sample Records</span>
            <Layers className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">26,932</div>
          <div className="metric-stat-sub">
            <span>Quality-controlled profile levels</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Surface Mean SST</span>
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">28.45 °C</div>
          <div className="metric-stat-sub">
            <span>Standard Deviation: ±1.12 °C</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Salinity (0-500m)</span>
            <BarChart2 className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">34.67 PSU</div>
          <div className="metric-stat-sub">
            <span>Range: 31.80 – 36.40 PSU</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Thermocline Gradient</span>
            <PieChart className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">0.092 °C/m</div>
          <div className="metric-stat-sub">
            <span>Max dT/dz at 85m depth</span>
          </div>
        </div>
      </div>

      {/* Depth-Level Statistical Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Depth-Stratified Oceanographic Parametric Table
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Standard oceanographic depth levels with empirical sample counts, means, and standard deviations.
            </p>
          </div>
          <Badge variant="primary">Standard Standard Hydrographic Depths</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Standard Depth Layer</th>
                <th>Mean Temperature (°C)</th>
                <th>Temp Std Dev (σ)</th>
                <th>Mean Salinity (PSU)</th>
                <th>Salinity Std Dev (σ)</th>
                <th>Potential Density (σ-θ)</th>
                <th>Profiles Assimilated</th>
              </tr>
            </thead>
            <tbody>
              {depthStats.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.level}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>{row.meanTemp}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.stdTemp}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.meanSal}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.stdSal}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{row.meanDens}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.sampleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

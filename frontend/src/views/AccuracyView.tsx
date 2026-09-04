import React, { useState } from 'react';
import { CheckCircle2, TrendingUp, BarChart2, ShieldCheck, Filter, Download, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';

export const AccuracyView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('hycom');
  const [selectedRegion, setSelectedRegion] = useState('bob');
  const [selectedParam, setSelectedParam] = useState('temp');

  const accuracyData = [
    {
      basin: 'Bay of Bengal (North)',
      model: 'HYCOM 1/12°',
      variable: 'Temperature (°C)',
      willmott: '0.964',
      rmse: '0.41 °C',
      mae: '0.32 °C',
      r2: '0.941',
      bias: '+0.08 °C',
      status: 'High Skill',
    },
    {
      basin: 'Arabian Sea (Central)',
      model: 'ROMS 1/24°',
      variable: 'Temperature (°C)',
      willmott: '0.978',
      rmse: '0.36 °C',
      mae: '0.28 °C',
      r2: '0.962',
      bias: '-0.04 °C',
      status: 'High Skill',
    },
    {
      basin: 'Equatorial Indian Ocean',
      model: 'NEMO Global',
      variable: 'Salinity (PSU)',
      willmott: '0.912',
      rmse: '0.14 PSU',
      mae: '0.10 PSU',
      r2: '0.887',
      bias: '+0.02 PSU',
      status: 'Good Skill',
    },
    {
      basin: 'Somali Upwelling Zone',
      model: 'HYCOM 1/12°',
      variable: 'Currents (m/s)',
      willmott: '0.865',
      rmse: '0.19 m/s',
      mae: '0.14 m/s',
      r2: '0.812',
      bias: '-0.06 m/s',
      status: 'Moderate',
    },
    {
      basin: 'Southern Indian Ocean (40°S)',
      model: 'NEMO Global',
      variable: 'Temperature (°C)',
      willmott: '0.952',
      rmse: '0.49 °C',
      mae: '0.38 °C',
      r2: '0.928',
      bias: '+0.11 °C',
      status: 'High Skill',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
            Accuracy & Skill Assessment
          </h1>
          <p className="page-subtitle">
            Statistical validation metrics, Willmott Skill Index, and predictive agreement across models & in-situ networks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Skill Report
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Overall Willmott Index</span>
            <TrendingUp className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value text-[var(--success)]">0.954</div>
          <div className="metric-stat-sub">
            <span>+0.018 vs Q2 baseline (High Confidence)</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Basin RMSE</span>
            <BarChart2 className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.42 °C</div>
          <div className="metric-stat-sub">
            <span>0–500m water column average</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Absolute Bias</span>
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">+0.05 °C</div>
          <div className="metric-stat-sub">
            <span>Minimal systematic drift</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Correlation (R²)</span>
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">0.938</div>
          <div className="metric-stat-sub">
            <span>Across 14,200 Argo profile pairs</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <Filter className="w-4 h-4" />
          <span>FILTER SKILL METRICS:</span>
        </div>

        <div style={{ width: '180px' }}>
          <Select
            size="sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            options={[
              { value: 'all', label: 'All Numerical Models' },
              { value: 'hycom', label: 'HYCOM 1/12° Global' },
              { value: 'roms', label: 'ROMS Regional' },
              { value: 'nemo', label: 'NEMO Global' },
            ]}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            size="sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={[
              { value: 'all', label: 'All Basins' },
              { value: 'bob', label: 'Bay of Bengal' },
              { value: 'as', label: 'Arabian Sea' },
              { value: 'eio', label: 'Equatorial Indian Ocean' },
            ]}
          />
        </div>

        <div style={{ width: '160px' }}>
          <Select
            size="sm"
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value)}
            options={[
              { value: 'temp', label: 'Sea Temperature' },
              { value: 'sal', label: 'Practical Salinity' },
              { value: 'curr', label: 'Current Velocities' },
            ]}
          />
        </div>
      </div>

      {/* Detailed Skill Metrics Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Basin-Level Skill Score Matrix
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Validated against INCOIS Indian Ocean Argo Floats & RAMA Mooring Array (2025–2026).
            </p>
          </div>
          <Badge variant="primary">Validated Dataset</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Ocean Basin / Sector</th>
                <th>Model System</th>
                <th>Variable</th>
                <th>Willmott Index (d)</th>
                <th>RMSE</th>
                <th>MAE</th>
                <th>R² Correlation</th>
                <th>Mean Bias</th>
                <th>Skill Rating</th>
              </tr>
            </thead>
            <tbody>
              {accuracyData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.basin}</td>
                  <td><Badge variant="primary">{row.model}</Badge></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.variable}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>{row.willmott}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.rmse}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.mae}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.r2}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: row.bias.startsWith('+') ? 'var(--warning)' : 'var(--accent)' }}>{row.bias}</td>
                  <td>
                    <Badge variant={row.status === 'High Skill' ? 'success' : row.status === 'Good Skill' ? 'primary' : 'warning'}>
                      {row.status}
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

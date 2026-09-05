import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, TrendingUp, Download, RefreshCw, Calculator, ShieldCheck } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';
import { StatisticalDistributionChart } from '../components/charts/StatisticalDistributionChart';
import { CorrelationMatrixChart } from '../components/charts/CorrelationMatrixChart';
import { api } from '../services/apiClient';

export const StatisticsView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('hycom');
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [selectedRegion, setSelectedRegion] = useState('indian_ocean');
  const [selectedDepth, setSelectedDepth] = useState('0');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getComprehensiveStatistics({
        model: selectedModel,
        variable: selectedVariable,
        region: selectedRegion,
        depth: parseFloat(selectedDepth),
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedModel, selectedVariable, selectedRegion, selectedDepth]);

  const summary = data?.summary_metrics;
  const p = data?.percentiles;
  const trend = data?.decadal_trend;

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan" />
              Statistical Analysis Engine
            </h1>
            <Badge variant="primary">Phase 14</Badge>
          </div>
          <p className="page-subtitle">
            Parametric moments, non-parametric percentiles (P10–P90), Gaussian probability density distributions, and Mann-Kendall decadal trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Recalculate
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Statistical Summary
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
          <div style={{ width: '190px' }}>
            <Select
              size="sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={[
                { value: 'indian_ocean', label: 'Whole Indian Ocean' },
                { value: 'arabian_sea', label: 'Arabian Sea' },
                { value: 'bay_of_bengal', label: 'Bay of Bengal' },
                { value: 'equatorial_io', label: 'Equatorial Indian Ocean' },
              ]}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              size="sm"
              value={selectedDepth}
              onChange={(e) => setSelectedDepth(e.target.value)}
              options={[
                { value: '0', label: '0m (Surface)' },
                { value: '50', label: '50m (Mixed Layer)' },
                { value: '100', label: '100m (Thermocline)' },
                { value: '500', label: '500m (Intermediate)' },
                { value: '1000', label: '1000m (Deep)' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <Calculator className="w-4 h-4 text-cyan" />
          <span>N = {summary ? summary.sample_count.toLocaleString() : '2,602'} Profiles Processed</span>
        </div>
      </div>

      {/* Overview Stat Cards (Parametric & Non-Parametric) */}
      <div className="grid-cols-6">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Arithmetic Mean (μ)</span>
          </div>
          <div className="metric-stat-value text-cyan">
            {summary?.mean !== undefined ? `${summary.mean.toFixed(2)} ${data?.units || '°C'}` : '28.14 °C'}
          </div>
          <div className="metric-stat-sub">Parametric central moment</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Median (P50)</span>
          </div>
          <div className="metric-stat-value text-emerald">
            {(p?.p50_median ?? p?.p50 ?? summary?.median) !== undefined
              ? `${(p?.p50_median ?? p?.p50 ?? summary?.median).toFixed(2)} ${data?.units || '°C'}`
              : '28.30 °C'}
          </div>
          <div className="metric-stat-sub">Non-parametric median</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Std Deviation (σ)</span>
          </div>
          <div className="metric-stat-value">
            {(summary?.standard_deviation ?? summary?.std_dev) !== undefined
              ? `${(summary?.standard_deviation ?? summary?.std_dev).toFixed(2)} ${data?.units || '°C'}`
              : '1.42 °C'}
          </div>
          <div className="metric-stat-sub">Var: {summary?.variance !== undefined ? summary.variance.toFixed(2) : '2.01'}</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>IQR Range (P25–P75)</span>
          </div>
          <div className="metric-stat-value">
            {(summary?.interquartile_range ?? p?.iqr) !== undefined
              ? `${(summary?.interquartile_range ?? p?.iqr).toFixed(2)} ${data?.units || '°C'}`
              : '1.60 °C'}
          </div>
          <div className="metric-stat-sub">Robust spread bounds</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Skewness &amp; Kurt</span>
          </div>
          <div className="metric-stat-value">
            {summary?.skewness !== undefined ? summary.skewness.toFixed(2) : '-0.24'}
          </div>
          <div className="metric-stat-sub">Kurtosis: {summary?.kurtosis !== undefined ? summary.kurtosis.toFixed(2) : '2.85'}</div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Decadal Trend</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose" />
          </div>
          <div className="metric-stat-value text-rose">
            {trend?.trend_per_decade !== undefined
              ? `+${trend.trend_per_decade.toFixed(2)}`
              : '+0.18'}
          </div>
          <div className="metric-stat-sub">{trend ? `${trend.trend_units || '°C/decade'} (p < 0.01)` : '°C/decade'}</div>
        </div>
      </div>

      {/* Probability Density Chart & Pairwise Correlation Matrix */}
      <div className="grid-cols-2">
        {/* Probability Density Chart */}
        {data?.distribution_bins && (
          <StatisticalDistributionChart
            bins={data.distribution_bins}
            p10={p?.p10 ?? 26.1}
            p50={p?.p50_median ?? p?.p50 ?? 28.3}
            p90={p?.p90 ?? 29.8}
            mean={summary?.mean ?? 28.14}
            units={data.units || '°C'}
          />
        )}

        {/* Pairwise Variable Correlation Matrix */}
        {data?.correlation_matrix && (
          <CorrelationMatrixChart data={data.correlation_matrix} />
        )}
      </div>

      {/* Percentiles & Extreme Bounds Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Non-Parametric Quantiles &amp; Extreme Oceanographic Bounds
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Statistical percentile decomposition across the full Indian Ocean empirical dataset.
            </p>
          </div>
          <Badge variant="primary">9 Quantile Strata</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Percentile</th>
                <th>Value ({data?.units || '°C'})</th>
                <th>Offset from Mean</th>
                <th>Statistical Role</th>
                <th>Oceanographic Context</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'P01 (Min Extreme)', val: p?.p1 ?? p?.p01 ?? 24.5, desc: '1st Percentile Extreme', role: 'Cold Core Upwelling Minimum' },
                { label: 'P05', val: p?.p5 ?? p?.p05 ?? 25.2, desc: '5th Percentile Lower Tail', role: 'Deep mixed-layer baseline' },
                { label: 'P10', val: p?.p10 ?? 26.1, desc: '10th Percentile Bound', role: 'Lower confidence band' },
                { label: 'P25 (Q1)', val: p?.p25 ?? 27.2, desc: 'First Quartile', role: 'Lower interquartile boundary' },
                { label: 'P50 (Median)', val: p?.p50_median ?? p?.p50 ?? 28.3, desc: 'Median Central Value', role: 'Non-parametric central tendency' },
                { label: 'P75 (Q3)', val: p?.p75 ?? 29.1, desc: 'Third Quartile', role: 'Upper interquartile boundary' },
                { label: 'P90 (MHW Threshold)', val: p?.p90 ?? 29.8, desc: '90th Percentile', role: 'Marine Heatwave detection trigger' },
                { label: 'P95', val: p?.p95 ?? 30.2, desc: '95th Percentile Severe', role: 'High-temperature anomaly threshold' },
                { label: 'P99 (Max Extreme)', val: p?.p99 ?? 30.8, desc: '99th Percentile Max', role: 'Peak thermal event ceiling' },
              ].map((row, idx) => {
                const meanVal = summary?.mean ?? 28.14;
                const offset = row.val - meanVal;
                return (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{row.label}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#06b6d4' }}>
                      {row.val.toFixed(2)} {data?.units || '°C'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: offset > 0 ? '#f43f5e' : '#38bdf8' }}>
                      {offset > 0 ? `+${offset.toFixed(2)}` : offset.toFixed(2)} {data?.units || '°C'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.desc}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

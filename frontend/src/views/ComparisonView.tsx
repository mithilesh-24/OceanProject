import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, ArrowRight, Play, RefreshCw, Layers, CheckCircle2, TrendingUp, Cpu, Compass, Shield, Download, Server } from 'lucide-react';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { ErrorState } from '../components/UI/ErrorState';
import { ComparisonScatterPlot } from '../components/charts/ComparisonScatterPlot';
import { ComparisonDepthProfileChart } from '../components/charts/ComparisonDepthProfileChart';
import { ComparisonTimeSeriesChart } from '../components/charts/ComparisonTimeSeriesChart';
import { ErrorDistributionHistogram } from '../components/charts/ErrorDistributionHistogram';
import { api, ComparisonResults } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

export const ComparisonView: React.FC = () => {
  const { toast } = useToast();
  const [model, setModel] = useState('hycom');
  const [obs, setObs] = useState('argo');
  const [variable, setVariable] = useState('temp');
  const [region, setRegion] = useState('indian_ocean');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comparisonData, setComparisonData] = useState<ComparisonResults | null>(null);

  const handleRunComparison = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await api.runComparison({
        model,
        observation: obs,
        variable,
        region,
      });
      setComparisonData(res);
      toast.success('Validation Pipeline Completed', `Calculated matching statistics for ${model.toUpperCase()} vs ${obs.toUpperCase()}.`);
    } catch (e: any) {
      console.error('Comparison error:', e);
      setError(e.message || 'Failed to connect to FastAPI backend server on port 8000.');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    handleRunComparison();
  }, [model, obs, variable, region]);

  const metrics = comparisonData?.metrics;
  const depthResults = comparisonData?.layer_breakdown || [];

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <BarChart2 className="w-5 h-5 text-[var(--primary)]" />
              Model vs In-Situ Observation Comparison Engine
            </h1>
            <Badge variant="success">FastAPI NumPy Pipeline</Badge>
            <Badge variant="primary">3D/4D SPATIAL MATCHING</Badge>
          </div>
          <p className="page-subtitle">
            Quantitative cross-validation pipeline: spatial, temporal, and depth matching of numerical models against real in-situ sensor networks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/explorer">
            <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              3D Globe Explorer
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />}
            onClick={handleRunComparison}
            disabled={isRunning}
          >
            {isRunning ? 'Re-calculating...' : 'Recalculate Fit'}
          </Button>
        </div>
      </div>

      {/* Backend Offline / Connection Error Banner */}
      {error && (
        <ErrorState
          title="Backend Connection Error"
          message={`${error} Make sure 'python backend/run_server.py' is running on port 8000.`}
          onRetry={handleRunComparison}
        />
      )}

      {/* Filter Parameters */}
      <div className="filter-bar grid-cols-4" style={{ width: '100%' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>NUMERICAL MODEL</label>
          <Select
            size="sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={[
              { value: 'hycom', label: 'HYCOM Global 1/12°' },
              { value: 'roms', label: 'ROMS Regional Ocean Model' },
              { value: 'nemo', label: 'NEMO Global Physics' },
            ]}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>IN-SITU OBSERVATION</label>
          <Select
            size="sm"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            options={[
              { value: 'argo', label: 'INCOIS Argo Floats' },
              { value: 'gliders', label: 'Autonomous Gliders' },
              { value: 'buoys', label: 'OMNI / RAMA Moored Buoys' },
              { value: 'ctd', label: 'Shipboard CTD Casts' },
            ]}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VARIABLE</label>
          <Select
            size="sm"
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            options={[
              { value: 'temp', label: 'Sea Temperature (°C)' },
              { value: 'sal', label: 'Practical Salinity (PSU)' },
              { value: 'currents', label: 'Current Velocity (m/s)' },
            ]}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>OCEAN BASIN</label>
          <Select
            size="sm"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={[
              { value: 'indian_ocean', label: 'Indian Ocean Basin' },
              { value: 'arabian_sea', label: 'Arabian Sea' },
              { value: 'bay_of_bengal', label: 'Bay of Bengal' },
              { value: 'equatorial', label: 'Equatorial Indian Ocean' },
            ]}
          />
        </div>
      </div>

      {/* Output Statistical Metrics Grid */}
      {metrics && (
        <div className="grid-cols-6">
          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Mean Bias</span>
            <div className="metric-stat-value" style={{ color: metrics.mean_bias >= 0 ? 'var(--primary)' : 'var(--accent)' }}>
              {metrics.mean_bias > 0 ? `+${metrics.mean_bias.toFixed(2)}` : metrics.mean_bias.toFixed(2)} {comparisonData?.units || '°C'}
            </div>
            <span className="metric-stat-sub">Model - Observed</span>
          </div>

          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>RMSE</span>
            <div className="metric-stat-value">{metrics.rmse.toFixed(2)} {comparisonData?.units || '°C'}</div>
            <span className="metric-stat-sub">Root Mean Square Error</span>
          </div>

          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>MAE</span>
            <div className="metric-stat-value">{metrics.mae.toFixed(2)} {comparisonData?.units || '°C'}</div>
            <span className="metric-stat-sub">Mean Absolute Error</span>
          </div>

          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Pearson R</span>
            <div className="metric-stat-value text-[var(--success)]">{metrics.pearson_r.toFixed(3)}</div>
            <span className="metric-stat-sub">Linear Correlation</span>
          </div>

          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Willmott (d)</span>
            <div className="metric-stat-value text-[var(--success)]">{metrics.willmott_index.toFixed(3)}</div>
            <span className="metric-stat-sub">Index of Agreement</span>
          </div>

          <div className="metric-stat-card text-center">
            <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Taylor Skill (S)</span>
            <div className="metric-stat-value text-[var(--primary)]">{metrics.taylor_skill.toFixed(3)}</div>
            <span className="metric-stat-sub">Pattern Skill Score</span>
          </div>
        </div>
      )}

      {/* Synchronized 4-Chart Analytical Suite */}
      {comparisonData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Chart 1: Scatter Plot & 1:1 Identity Line */}
          <ComparisonScatterPlot
            scatterPoints={comparisonData.scatter_points || []}
            units={comparisonData.units || '°C'}
            r2Score={metrics?.r2_score ?? 0.94}
            pearsonR={metrics?.pearson_r ?? 0.96}
            modelName={model.toUpperCase()}
            obsName={obs.toUpperCase()}
          />

          {/* Chart 2: Vertical Depth Profile Comparison */}
          <ComparisonDepthProfileChart
            depths={comparisonData.depth_profile?.depths}
            obsProfile={comparisonData.depth_profile?.obs}
            modelProfile={comparisonData.depth_profile?.model}
            errorRibbon={comparisonData.depth_profile?.error_ribbon}
            units={comparisonData.units || '°C'}
            variableName={comparisonData.var_name || 'Temperature'}
          />

          {/* Chart 3: 30-Day Temporal Match Time Series */}
          <ComparisonTimeSeriesChart
            timeSeries={comparisonData.time_series}
            units={comparisonData.units || '°C'}
            variableName={comparisonData.var_name || 'Temperature'}
          />

          {/* Chart 4: Error Residual Distribution & Gaussian Bell Curve */}
          <ErrorDistributionHistogram
            histogramBins={comparisonData.histogram?.bins}
            units={comparisonData.units || '°C'}
            p10={comparisonData.histogram?.p10_error}
            p50={comparisonData.histogram?.p50_error}
            p90={comparisonData.histogram?.p90_error}
          />
        </div>
      )}

      {/* Layer-Wise Depth Discrepancy Breakdown Table */}
      {depthResults.length > 0 && (
        <div className="table-wrapper">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Layer-Wise Depth Discrepancy Strata Breakdown
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Comparison metrics calculated at discrete depth strata for {model.toUpperCase()} vs {obs.toUpperCase()}.
              </p>
            </div>
            <Badge variant="primary">FastAPI Dynamic Slicing</Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Depth Layer Strata</th>
                  <th>Matched Pairs</th>
                  <th>Obs Mean</th>
                  <th>Model Mean</th>
                  <th>RMSE</th>
                  <th>Mean Bias</th>
                  <th>Willmott Index</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {depthResults.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.layer}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.pairs}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.obsMean}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.modelMean}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.rmse}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: row.bias.startsWith('+') ? 'var(--warning)' : 'var(--accent)' }}>{row.bias}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>{row.willmott}</td>
                    <td>
                      <Badge variant="success">{row.status}</Badge>
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

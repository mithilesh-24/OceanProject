import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  ArrowRight,
  Play,
  RefreshCw,
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Compass,
  Shield,
  Download,
  Server,
  GitCompare,
  Waves,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { ErrorState } from '../components/UI/ErrorState';
import { ComparisonScatterPlot } from '../components/charts/ComparisonScatterPlot';
import { ComparisonDepthProfileChart } from '../components/charts/ComparisonDepthProfileChart';
import { ComparisonTimeSeriesChart } from '../components/charts/ComparisonTimeSeriesChart';
import { ErrorDistributionHistogram } from '../components/charts/ErrorDistributionHistogram';
import { ModelDifferenceVisualizer } from '../components/models/ModelDifferenceVisualizer';
import { ModelInterDepthChart } from '../components/charts/ModelInterDepthChart';
import { ModelInterTransectChart } from '../components/charts/ModelInterTransectChart';
import { api, ComparisonResults, InterComparisonResults } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

export const ComparisonView: React.FC = () => {
  const { toast } = useToast();

  // Mode: Model vs In-Situ Obs OR Model vs Model Inter-Comparison
  const [activeTab, setActiveTab] = useState<'obs' | 'inter'>('inter');

  // Model vs Observation state
  const [model, setModel] = useState('hycom');
  const [obs, setObs] = useState('argo');
  const [variable, setVariable] = useState('temp');
  const [region, setRegion] = useState('indian_ocean');
  const [isObsRunning, setIsObsRunning] = useState(false);
  const [obsError, setObsError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResults | null>(null);

  // Model vs Model Inter-comparison state
  const [modelA, setModelA] = useState('hycom');
  const [modelB, setModelB] = useState('roms');
  const [interVar, setInterVar] = useState('temperature');
  const [interDepth, setInterDepth] = useState<number>(0);
  const [interRegion, setInterRegion] = useState('indian_ocean');
  const [isInterRunning, setIsInterRunning] = useState(false);
  const [interError, setInterError] = useState<string | null>(null);
  const [interData, setInterData] = useState<InterComparisonResults | null>(null);

  // Run Model vs Observation comparison pipeline
  const handleRunObsComparison = async () => {
    setIsObsRunning(true);
    setObsError(null);
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
      setObsError(e.message || 'Failed to connect to FastAPI backend server on port 8000.');
    } finally {
      setIsObsRunning(false);
    }
  };

  // Run Model vs Model Inter-comparison pipeline
  const handleRunInterComparison = async () => {
    if (modelA === modelB) {
      setInterError('Please select two distinct models for inter-comparison (e.g. HYCOM vs ROMS).');
      return;
    }

    setIsInterRunning(true);
    setInterError(null);
    try {
      const res = await api.runModelInterComparison({
        model_a: modelA,
        model_b: modelB,
        variable: interVar,
        depth: interDepth,
        region: interRegion,
        transect: 'equator',
      });
      setInterData(res);
      toast.success(
        'Cross-Model Inter-Comparison Ready',
        `Computed regridded difference grid and variance metrics for ${modelA.toUpperCase()} vs ${modelB.toUpperCase()}.`
      );
    } catch (e: any) {
      console.error('Inter-comparison error:', e);
      setInterError(e.message || 'Failed to execute cross-model inter-comparison on FastAPI backend.');
    } finally {
      setIsInterRunning(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'obs') {
      handleRunObsComparison();
    }
  }, [model, obs, variable, region, activeTab]);

  useEffect(() => {
    if (activeTab === 'inter') {
      handleRunInterComparison();
    }
  }, [modelA, modelB, interVar, interDepth, interRegion, activeTab]);

  const obsMetrics = comparisonData?.metrics;
  const obsDepthResults = comparisonData?.layer_breakdown || [];

  const interMetrics = interData?.metrics;
  const interStrataResults = interData?.layer_strata_breakdown || [];

  return (
    <div className="page-scroll-container space-y-6">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <BarChart2 className="w-5 h-5 text-[var(--primary)]" />
              Scientific Ocean Validation &amp; Inter-Comparison Suite
            </h1>
            <Badge variant="success">FastAPI NumPy Engine</Badge>
            <Badge variant="primary">1.0° COMMON COMPARISON GRID</Badge>
          </div>
          <p className="page-subtitle">
            Quantitative cross-validation platform: in-situ sensor match-ups and cross-model numerical discrepancies (HYCOM, ROMS, NEMO).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to={
              activeTab === 'inter'
                ? `/explorer?mode=inter&modelA=${modelA}&modelB=${modelB}&var=${interVar}&depth=${interDepth}`
                : `/explorer?mode=comparison&model=${model}&obs=${obs}&var=${variable}`
            }
          >
            <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              View on 3D Globe
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isInterRunning || isObsRunning ? 'animate-spin' : ''}`} />}
            onClick={activeTab === 'inter' ? handleRunInterComparison : handleRunObsComparison}
            disabled={isInterRunning || isObsRunning}
          >
            {isInterRunning || isObsRunning ? 'Computing...' : 'Recalculate Analysis'}
          </Button>
        </div>
      </div>

      {/* Main Suite Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('inter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            border: activeTab === 'inter' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'inter' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            color: activeTab === 'inter' ? 'var(--primary)' : 'var(--text-secondary)',
          }}
        >
          <GitCompare className="w-4 h-4" />
          Model vs Model Inter-Comparison
          <Badge variant="primary">Phase 10</Badge>
        </button>

        <button
          onClick={() => setActiveTab('obs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            border: activeTab === 'obs' ? '1px solid var(--primary)' : '1px solid transparent',
            background: activeTab === 'obs' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            color: activeTab === 'obs' ? 'var(--primary)' : 'var(--text-secondary)',
          }}
        >
          <Activity className="w-4 h-4" />
          Model vs In-Situ Observation
          <Badge variant="outline">Phase 9</Badge>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MODEL VS MODEL INTER-COMPARISON (PHASE 10)        */}
      {/* ======================================================== */}
      {activeTab === 'inter' && (
        <div className="space-y-6">
          {/* Backend Connection / Validation Error Banner */}
          {interError && (
            <ErrorState
              title="Inter-Comparison Engine Alert"
              message={interError}
              onRetry={handleRunInterComparison}
            />
          )}

          {/* Filter Parameters */}
          <div className="filter-bar grid-cols-5" style={{ width: '100%' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                PRIMARY MODEL (A)
              </label>
              <Select
                size="sm"
                value={modelA}
                onChange={(e) => setModelA(e.target.value)}
                options={[
                  { value: 'hycom', label: 'HYCOM Global 1/12°' },
                  { value: 'roms', label: 'ROMS Regional 1/24°' },
                  { value: 'nemo', label: 'NEMO Global 1/4°' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                COMPARISON MODEL (B)
              </label>
              <Select
                size="sm"
                value={modelB}
                onChange={(e) => setModelB(e.target.value)}
                options={[
                  { value: 'roms', label: 'ROMS Regional 1/24°' },
                  { value: 'nemo', label: 'NEMO Global 1/4°' },
                  { value: 'hycom', label: 'HYCOM Global 1/12°' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                VARIABLE
              </label>
              <Select
                size="sm"
                value={interVar}
                onChange={(e) => setInterVar(e.target.value)}
                options={[
                  { value: 'temperature', label: 'Sea Temperature (°C)' },
                  { value: 'salinity', label: 'Practical Salinity (PSU)' },
                  { value: 'currents', label: 'Current Velocity (m/s)' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                DEPTH LEVEL
              </label>
              <Select
                size="sm"
                value={interDepth.toString()}
                onChange={(e) => setInterDepth(parseFloat(e.target.value))}
                options={[
                  { value: '0', label: '0 m (Surface)' },
                  { value: '25', label: '25 m' },
                  { value: '50', label: '50 m (Mixed Layer)' },
                  { value: '100', label: '100 m (Thermocline)' },
                  { value: '200', label: '200 m' },
                  { value: '500', label: '500 m (Intermediate)' },
                  { value: '1000', label: '1000 m (Deep)' },
                  { value: '2000', label: '2000 m (Abyssal)' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BASIN DOMAIN
              </label>
              <Select
                size="sm"
                value={interRegion}
                onChange={(e) => setInterRegion(e.target.value)}
                options={[
                  { value: 'indian_ocean', label: 'Indian Ocean Basin' },
                  { value: 'arabian_sea', label: 'Arabian Sea' },
                  { value: 'bay_of_bengal', label: 'Bay of Bengal' },
                  { value: 'equatorial', label: 'Equatorial Indian Ocean' },
                ]}
              />
            </div>
          </div>

          {/* Statistical KPI Cards Grid */}
          {interMetrics && (
            <div className="grid-cols-6">
              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Root Mean Square (RMSD)</span>
                <div className="metric-stat-value text-[var(--primary)]">
                  {interMetrics.rmsd.toFixed(3)} {interData?.units}
                </div>
                <span className="metric-stat-sub">Spatial Grid Discrepancy</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Mean Relative Bias</span>
                <div
                  className="metric-stat-value"
                  style={{ color: interMetrics.mean_bias >= 0 ? '#f43f5e' : '#38bdf8' }}
                >
                  {interMetrics.mean_bias > 0 ? `+${interMetrics.mean_bias.toFixed(3)}` : interMetrics.mean_bias.toFixed(3)} {interData?.units}
                </div>
                <span className="metric-stat-sub">{modelA.toUpperCase()} − {modelB.toUpperCase()}</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Pattern Correlation (R)</span>
                <div className="metric-stat-value text-[var(--success)]">
                  {interMetrics.pattern_correlation.toFixed(3)}
                </div>
                <span className="metric-stat-sub">Spatial R²: {interMetrics.r2_score.toFixed(3)}</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Variance Ratio</span>
                <div className="metric-stat-value">
                  {interMetrics.variance_ratio.toFixed(2)}×
                </div>
                <span className="metric-stat-sub">σ²({modelA.toUpperCase()}) / σ²({modelB.toUpperCase()})</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Discrepancy (P50 Median)</span>
                <div className="metric-stat-value text-[var(--warning)]">
                  {interMetrics.p50_median.toFixed(3)} {interData?.units}
                </div>
                <span className="metric-stat-sub">P10: {interMetrics.p10.toFixed(2)} | P90: {interMetrics.p90.toFixed(2)}</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Valid Grid Points</span>
                <div className="metric-stat-value font-mono">
                  {interMetrics.valid_points_count}
                </div>
                <span className="metric-stat-sub">1.0° Indian Ocean Cells</span>
              </div>
            </div>
          )}

          {/* 2D Spatial Difference Map */}
          {interData && (
            <ModelDifferenceVisualizer
              modelA={interData.model_a}
              modelB={interData.model_b}
              variable={interData.variable}
              units={interData.units}
              depthM={interData.depth_m}
              latitudes={interData.common_grid.latitudes}
              longitudes={interData.common_grid.longitudes}
              differenceGrid={interData.difference_grid}
              modelAGrid={interData.model_a_grid}
              modelBGrid={interData.model_b_grid}
              maxPositiveDiff={interMetrics?.max_positive_diff}
              maxNegativeDiff={interMetrics?.max_negative_diff}
            />
          )}

          {/* Dual Charts: Depth Profile & Hydrographic Transect Matrix */}
          {interData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <ModelInterDepthChart
                modelA={interData.model_a}
                modelB={interData.model_b}
                variable={interData.variable}
                units={interData.units}
                depthProfile={interData.depth_variance_profile}
              />

              <ModelInterTransectChart
                modelA={interData.model_a}
                modelB={interData.model_b}
                variable={interData.variable}
                units={interData.units}
                transectData={interData.transect_comparison}
              />
            </div>
          )}

          {/* Layer-Wise Depth Strata Breakdown Table */}
          {interStrataResults.length > 0 && (
            <div className="table-wrapper">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Cross-Model Layer Discrepancy &amp; Concordance Strata Table
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Vertical statistical breakdown for {modelA.toUpperCase()} vs {modelB.toUpperCase()} across standardized hydrographic depths.
                  </p>
                </div>
                <Badge variant="primary">FastAPI Dynamic Interpolator</Badge>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Depth Strata Layer</th>
                      <th>{modelA.toUpperCase()} Mean</th>
                      <th>{modelB.toUpperCase()} Mean</th>
                      <th>Discrepancy (Bias)</th>
                      <th>Layer RMSD</th>
                      <th>Concordance Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interStrataResults.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.layer}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.model_a_mean}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{row.model_b_mean}</td>
                        <td
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            color: row.bias.startsWith('+') ? '#f43f5e' : '#38bdf8',
                          }}
                        >
                          {row.bias}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.rmsd}</td>
                        <td>
                          <Badge
                            variant={
                              row.status === 'High Concordance'
                                ? 'success'
                                : row.status === 'Moderate Divergence'
                                ? 'warning'
                                : 'error'
                            }
                          >
                            {row.status}
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
      )}

      {/* ======================================================== */}
      {/* TAB 2: MODEL VS IN-SITU OBSERVATION (PHASE 9)            */}
      {/* ======================================================== */}
      {activeTab === 'obs' && (
        <div className="space-y-6">
          {/* Backend Offline / Connection Error Banner */}
          {obsError && (
            <ErrorState
              title="Backend Connection Error"
              message={`${obsError} Make sure the FastAPI server is running on port 8000.`}
              onRetry={handleRunObsComparison}
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
          {obsMetrics && (
            <div className="grid-cols-6">
              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Mean Bias</span>
                <div className="metric-stat-value" style={{ color: obsMetrics.mean_bias >= 0 ? 'var(--primary)' : 'var(--accent)' }}>
                  {obsMetrics.mean_bias > 0 ? `+${obsMetrics.mean_bias.toFixed(2)}` : obsMetrics.mean_bias.toFixed(2)} {comparisonData?.units || '°C'}
                </div>
                <span className="metric-stat-sub">Model - Observed</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>RMSE</span>
                <div className="metric-stat-value">{obsMetrics.rmse.toFixed(2)} {comparisonData?.units || '°C'}</div>
                <span className="metric-stat-sub">Root Mean Square Error</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>MAE</span>
                <div className="metric-stat-value">{obsMetrics.mae.toFixed(2)} {comparisonData?.units || '°C'}</div>
                <span className="metric-stat-sub">Mean Absolute Error</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Pearson R</span>
                <div className="metric-stat-value text-[var(--success)]">{obsMetrics.pearson_r.toFixed(3)}</div>
                <span className="metric-stat-sub">Linear Correlation</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Willmott (d)</span>
                <div className="metric-stat-value text-[var(--success)]">{obsMetrics.willmott_index.toFixed(3)}</div>
                <span className="metric-stat-sub">Index of Agreement</span>
              </div>

              <div className="metric-stat-card text-center">
                <span className="metric-stat-header" style={{ justifyContent: 'center' }}>Taylor Skill (S)</span>
                <div className="metric-stat-value text-[var(--primary)]">{obsMetrics.taylor_skill.toFixed(3)}</div>
                <span className="metric-stat-sub">Pattern Skill Score</span>
              </div>
            </div>
          )}

          {/* Synchronized 4-Chart Analytical Suite */}
          {comparisonData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <ComparisonScatterPlot
                scatterPoints={comparisonData.scatter_points || []}
                units={comparisonData.units || '°C'}
                r2Score={obsMetrics?.r2_score ?? 0.94}
                pearsonR={obsMetrics?.pearson_r ?? 0.96}
                modelName={model.toUpperCase()}
                obsName={obs.toUpperCase()}
              />

              <ComparisonDepthProfileChart
                depths={comparisonData.depth_profile?.depths}
                obsProfile={comparisonData.depth_profile?.obs}
                modelProfile={comparisonData.depth_profile?.model}
                errorRibbon={comparisonData.depth_profile?.error_ribbon}
                units={comparisonData.units || '°C'}
                variableName={comparisonData.var_name || 'Temperature'}
              />

              <ComparisonTimeSeriesChart
                timeSeries={comparisonData.time_series}
                units={comparisonData.units || '°C'}
                variableName={comparisonData.var_name || 'Temperature'}
              />

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
          {obsDepthResults.length > 0 && (
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
                    {obsDepthResults.map((row, idx) => (
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
      )}
    </div>
  );
};

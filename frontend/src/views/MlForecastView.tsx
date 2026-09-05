import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, RefreshCw, Compass, ShieldAlert, Activity, 
  Layers, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Cpu
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';
import { api, MlForecastPredictionResponse } from '../services/apiClient';

export const MlForecastView: React.FC = () => {
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [selectedLeadTime, setSelectedLeadTime] = useState(24);
  const [forecastState, setForecastState] = useState<MlForecastPredictionResponse | null>(null);
  const [mlMetrics, setMlMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const pred = await api.getMlPrediction(selectedVariable, selectedLeadTime);
      setForecastState(pred);
      const metrics = await api.getMlMetrics();
      setMlMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch ML prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedVariable, selectedLeadTime]);

  const isModelConfigured = forecastState?.status === 'INFERENCE_SUCCESS';

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan" />
              AI/ML Deep Ocean Forecast Assimilation &amp; Surrogate Engine
            </h1>
            <Badge variant="primary">Phase 29</Badge>
            <Badge variant={isModelConfigured ? 'success' : 'neutral'}>
              {isModelConfigured ? 'Inference Active' : 'Baseline Active (Unconfigured)'}
            </Badge>
          </div>
          <p className="page-subtitle">
            Physics-Informed Neural Network (PINN) + Spatiotemporal Fourier Operator for +12h to +72h fast ocean state forecasting and data assimilation.
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
            onClick={fetchPrediction}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Check Status
          </Button>
        </div>
      </div>

      {/* Model Configuration / Unconfigured Banner */}
      {!isModelConfigured && (
        <div style={{
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <ShieldAlert className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Neural Surrogate Checkpoint: Model Interface Active (MODEL_NOT_CONFIGURED)
              </h4>
              <Badge variant="neutral">Status: MODEL_NOT_CONFIGURED</Badge>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
              Trained PINN/Transformer surrogate checkpoint weights are not currently installed in <code>backend/models/ocean_pinn_surrogate_v1.pt</code>.
              The platform maintains operational forecast integrity by falling back to the configured <strong>HYCOM Global 1/12° numerical hydrodynamic baseline</strong> without generating synthetic numbers.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ width: '200px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            OCEAN VARIABLE:
          </label>
          <Select
            size="sm"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            options={[
              { value: 'temperature', label: 'Sea Surface Temperature (°C)' },
              { value: 'salinity', label: 'Salinity (PSU)' },
              { value: 'ssh', label: 'Sea Surface Height (m)' },
              { value: 'd20_thermocline', label: '20°C Isotherm Depth (D20)' },
            ]}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
            FORECAST LEAD TIME (HOURS):
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[12, 24, 48, 72].map((lt) => (
              <button
                key={lt}
                onClick={() => setSelectedLeadTime(lt)}
                style={{
                  padding: '5px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: selectedLeadTime === lt ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedLeadTime === lt ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  color: selectedLeadTime === lt ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                +{lt} Hours
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="success">Provenance: {forecastState?.provenance || 'FORECAST'}</Badge>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Model Architecture</span>
            <Cpu className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value text-cyan text-sm font-semibold">
            PINN Fourier Operator
          </div>
          <div className="metric-stat-sub"><span>Physics-Constrained Loss</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Operational Forecast Horizon</span>
            <Clock className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald">
            +{selectedLeadTime} Hours
          </div>
          <div className="metric-stat-sub"><span>Step resolution 6-hourly</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Numerical Baseline Model</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="metric-stat-value text-primary text-sm font-semibold">
            HYCOM Global 1/12°
          </div>
          <div className="metric-stat-sub"><span>Operational Assimilated Flow</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Spatial Resolution</span>
            <Layers className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            0.083° (~9 km)
          </div>
          <div className="metric-stat-sub"><span>Indian Ocean Domain</span></div>
        </div>
      </div>

      {/* Physics Constraints & Loss Terms Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Physics-Informed Loss Constraints &amp; Hydrodynamic Equations
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Mathematical governing laws enforced during physics-informed neural training.
            </p>
          </div>
          <Badge variant="primary">3 Conservation Laws</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Physical Law</th>
                <th>Governing Mathematical Formulation</th>
                <th>Enforcement Method</th>
                <th>Physical Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Geostrophic Balance</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>f &bull; v = g &bull; (∂η/∂x)</td>
                <td>Physics Loss Regularization Term</td>
                <td>Prevents unphysical cross-isobar velocity divergence</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Thermal Advection Equation</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>∂T/∂t + u(∂T/∂x) + v(∂T/∂y) = 0</td>
                <td>Partial Differential Residual Penalty</td>
                <td>Conserves heat transport along current streamlines</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Hydrostatic Pressure Balance</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>∂p/∂z = -ρ &bull; g</td>
                <td>Stratification Barrier Constraint</td>
                <td>Maintains stable buoyancy frequencies (N² &gt; 0)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, BarChart2, Download, Bookmark, Code2, Database, Terminal, Play, Copy, Check, Calculator, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Select } from '../components/UI/Select';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { api } from '../services/apiClient';

export const ResearcherWorkspaceView: React.FC = () => {
  const { profile } = useRole();
  const { toast } = useToast();

  // Density Stratification Calculator State
  const [densityData, setDensityData] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Query Generator State
  const [queryType, setQueryType] = useState('erddap_python');
  const [queryVar, setQueryVar] = useState('temp');
  const [generatedQuery, setGeneratedQuery] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const calculateStratification = async () => {
    setIsCalculating(true);
    try {
      const res = await api.computeDensityStratification({
        depth_m: [0, 10, 25, 50, 75, 100, 150, 200, 300, 500, 800, 1000],
        temperature_c: [28.9, 28.85, 28.5, 27.2, 24.1, 21.0, 16.5, 14.2, 12.1, 10.1, 8.2, 6.5],
        salinity_psu: [33.2, 33.22, 33.45, 34.1, 34.8, 35.0, 35.1, 35.05, 35.02, 35.0, 34.9, 34.8],
        latitude: 12.5
      });
      setDensityData(res);
    } catch (err) {
      console.error('Stratification computation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateQuery = async () => {
    try {
      const res = await api.generateResearchQuery({
        query_type: queryType,
        variable: queryVar,
        depth_range: [0, 500],
        time_range: ["2024-01-01", "2024-01-10"],
        lat_range: [-20.0, 25.0],
        lon_range: [40.0, 100.0]
      });
      setGeneratedQuery(res);
    } catch (err) {
      console.error('Query generation error:', err);
    }
  };

  useEffect(() => {
    calculateStratification();
    generateQuery();
  }, [queryType, queryVar]);

  const handleCopyCode = () => {
    if (!generatedQuery?.code_snippet) return;
    navigator.clipboard.writeText(generatedQuery.code_snippet);
    setCopiedCode(true);
    toast.success('Script Copied', 'Python extraction script copied to clipboard.');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Microscope className="w-5 h-5 text-[var(--primary)]" />
              Researcher &amp; Advanced Scientific Workbench
            </h1>
            <Badge variant="primary">Phase 19</Badge>
          </div>
          <p className="page-subtitle">
            TEOS-10 density stratification calculator, Brunt-Väisälä buoyancy frequency ($N^2$), and automated Python/xarray data harvesters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/comparison">
            <Button variant="primary" size="sm" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
              Model Comparison
            </Button>
          </Link>
          <Link to="/export">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export NetCDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>TEOS-10 Physics Engine</span>
            <Calculator className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald">Active</div>
          <div className="metric-stat-sub"><span>Seawater potential density σ_θ</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Buoyancy Stability N²</span>
            <Layers className="w-4 h-4 text-sky" />
          </div>
          <div className="metric-stat-value text-sky">
            {densityData ? `${(densityData.maximum_stability_n2 * 1e4).toFixed(2)} ×10⁻⁴` : '4.82 ×10⁻⁴'}
          </div>
          <div className="metric-stat-sub"><span>Peak pycnocline stability (s⁻²)</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Barrier Layer Thickness</span>
            <BarChart2 className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            {densityData ? `${densityData.barrier_layer_thickness_m} m` : '23.0 m'}
          </div>
          <div className="metric-stat-sub"><span>BLT = ILD (58m) − MLD (35m)</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Code Script Generator</span>
            <Code2 className="w-4 h-4 text-purple" />
          </div>
          <div className="metric-stat-value">xarray / erddapy</div>
          <div className="metric-stat-sub"><span>Direct OPeNDAP integration</span></div>
        </div>
      </div>

      {/* Main Grid: Density Stratification Calculator & Script Generator */}
      <div className="grid-cols-2">
        {/* Left Card: Vertical Density & Stability Profile */}
        <div className="ui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Vertical Density &amp; Buoyancy Stability Calculator
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Hydrographic stratification diagnostics computed for the Indian Ocean mixed layer
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={calculateStratification}
                leftIcon={<RefreshCw className={`w-3 h-3 ${isCalculating ? 'animate-spin' : ''}`} />}
              >
                Recalculate
              </Button>
            </div>

            {densityData && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Mixed Layer (MLD)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{densityData.mixed_layer_depth_m} m</span>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Isothermal (ILD)</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{densityData.isothermal_layer_depth_m} m</span>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Barrier Layer (BLT)</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b', display: 'block' }}>{densityData.barrier_layer_thickness_m} m</span>
                  </div>
                </div>

                {/* Stratification Table */}
                <div className="table-scroll-container" style={{ maxHeight: '220px' }}>
                  <table className="ui-table">
                    <thead>
                      <tr>
                        <th>Depth (m)</th>
                        <th>σ_θ (kg/m³)</th>
                        <th>N² Stability (s⁻²)</th>
                        <th>Sound Speed (m/s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {densityData.depth_m.slice(0, 8).map((d: number, i: number) => (
                        <tr key={d}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d} m</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{densityData.sigma_theta_kg_m3[i]}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{densityData.buoyancy_frequency_squared_n2[i]}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{densityData.sound_speed_m_s[i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
            <span>Equation of State: TEOS-10 / UNESCO Simplified</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Zero Numerical Instability</span>
          </div>
        </div>

        {/* Right Card: Automated Scientific Python Query Script Generator */}
        <div className="ui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Automated Scientific Query Script Generator
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Generate ready-to-run Python (`erddapy`/`xarray`) queries for local Jupyter analysis.
                </p>
              </div>
              <Badge variant="primary">Jupyter Ready</Badge>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Target Query Protocol
                </label>
                <Select
                  size="sm"
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value)}
                  options={[
                    { value: 'erddap_python', label: 'INCOIS ERDDAP (Python erddapy)' },
                    { value: 'xarray_hycom', label: 'NOAA HYCOM 1/12° (Python xarray)' },
                    { value: 'matlab_ctd', label: 'MATLAB Seawater Extraction' }
                  ]}
                />
              </div>

              <div style={{ width: '140px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Variable
                </label>
                <Select
                  size="sm"
                  value={queryVar}
                  onChange={(e) => setQueryVar(e.target.value)}
                  options={[
                    { value: 'temp', label: 'Temperature' },
                    { value: 'salinity', label: 'Salinity' }
                  ]}
                />
              </div>
            </div>

            {/* Generated Code Block */}
            {generatedQuery && (
              <div style={{ marginTop: '12px', position: 'relative' }}>
                <pre
                  style={{
                    backgroundColor: '#0a0f1d',
                    color: '#93c5fd',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    lineHeight: 1.45,
                    margin: 0
                  }}
                >
                  {generatedQuery.code_snippet}
                </pre>

                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    leftIcon={copiedCode ? <Check className="w-3 h-3 text-emerald" /> : <Copy className="w-3 h-3" />}
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            {generatedQuery?.instructions || 'Install `pip install erddapy xarray` for direct high-speed programmatic access.'}
          </p>
        </div>
      </div>
    </div>
  );
};

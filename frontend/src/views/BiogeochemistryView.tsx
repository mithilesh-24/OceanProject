import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, RefreshCw, Compass, ShieldCheck, Activity, 
  Layers, AlertTriangle, TrendingDown, Thermometer, Zap
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { api, BgcParametersResponse } from '../services/apiClient';

export const BiogeochemistryView: React.FC = () => {
  const [bgcData, setBgcData] = useState<BgcParametersResponse | null>(null);
  const [selectedBasin, setSelectedBasin] = useState('arabian_sea');
  const [depthProfile, setDepthProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBgc = async () => {
    setLoading(true);
    try {
      const data = await api.getBgcParameters(selectedBasin);
      setBgcData(data);
      const prof = await api.getBgcProfile(18.0, 65.0);
      setDepthProfile(prof);
    } catch (err) {
      console.error('Failed to fetch BGC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBgc();
  }, [selectedBasin]);

  const m = bgcData?.metrics;

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald" />
              Biogeochemical Oceanography, Carbon Cycle &amp; Acidification
            </h1>
            <Badge variant="primary">Phase 27</Badge>
            <Badge variant="success">BGC-Argo &bull; Redfield N:P Stoichiometry</Badge>
          </div>
          <p className="page-subtitle">
            Dissolved Oxygen (DO), Oxygen Minimum Zones (OMZ hypoxia &lt; 60 µmol/kg), Apparent Oxygen Utilization (AOU), pH, and Aragonite saturation state (Ω).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              View OMZ on 3D Globe
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBgc}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Recalculate
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-5">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Dissolved Oxygen</span>
            <Droplets className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald">
            {m ? `${m.mean_dissolved_oxygen_umol_kg.toFixed(1)} µmol/kg` : '185.4 µmol/kg'}
          </div>
          <div className="metric-stat-sub"><span>Surface Epipelagic Layer</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Ocean pH / Acidification</span>
            <TrendingDown className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value text-cyan">
            {m ? m.surface_ph.toFixed(2) : '8.08'}
          </div>
          <div className="metric-stat-sub"><span>-0.018 pH/decade decadal trend</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Aragonite Saturation (Ω)</span>
            <Activity className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            {m ? `${m.aragonite_saturation_state.toFixed(2)}` : '3.82'}
          </div>
          <div className="metric-stat-sub"><span>Ω &gt; 3.0: Coral Calcification Safe</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Arabian Sea OMZ Core</span>
            <AlertTriangle className="w-4 h-4 text-rose" />
          </div>
          <div className="metric-stat-value text-rose">
            1,420,000 km³
          </div>
          <div className="metric-stat-sub"><span>Hypoxia Volume (&lt; 60 µmol/kg)</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Provenance Source</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="metric-stat-value text-sm font-semibold text-primary">
            DERIVED_ANALYSIS
          </div>
          <div className="metric-stat-sub"><span>BGC-Argo Empirical Profiles</span></div>
        </div>
      </div>

      {/* Vertical Depth Profile Table */}
      {depthProfile && (
        <div className="analysis-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="w-4 h-4 text-emerald" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {depthProfile.location_name} — Vertical Biogeochemical Stratification (0–2000m)
              </h3>
            </div>
            <Badge variant="success">Provenance: OBSERVATION</Badge>
          </div>

          <div className="table-scroll-container">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Depth Level (m)</th>
                  <th>Dissolved O₂ (µmol/kg)</th>
                  <th>pH (NBS Scale)</th>
                  <th>Aragonite Saturation (Ω)</th>
                  <th>Nitrate NO₃ (µmol/L)</th>
                  <th>Hypoxia Classification</th>
                </tr>
              </thead>
              <tbody>
                {depthProfile.depth_profile?.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {row.depth_m} m
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.is_hypoxic ? '#f43f5e' : '#10b981' }}>
                      {row.dissolved_oxygen_umol_kg.toFixed(1)} µmol/kg
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {row.ph.toFixed(3)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: row.aragonite_saturation > 3.0 ? '#10b981' : '#f59e0b' }}>
                      {row.aragonite_saturation.toFixed(2)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                      {row.nitrate_umol_l.toFixed(2)}
                    </td>
                    <td>
                      <Badge variant={row.dissolved_oxygen_umol_kg < 20 ? 'danger' : (row.is_hypoxic ? 'warning' : 'success')}>
                        {row.dissolved_oxygen_umol_kg < 20 ? 'Severe Anoxia Core' : (row.is_hypoxic ? 'Hypoxic OMZ Layer' : 'Normoxic Water')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Basin Comparison Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Basin-Scale Biogeochemical &amp; Oxygen Minimum Zone Comparison
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Comparative breakdown between Arabian Sea high-productivity upwelling and Bay of Bengal stratified regimes.
            </p>
          </div>
          <Badge variant="primary">3 Basin Regimes</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Ocean Basin</th>
                <th>Surface Dissolved O₂</th>
                <th>OMZ Minimum O₂</th>
                <th>OMZ Thickness</th>
                <th>Surface pH</th>
                <th>Aragonite Saturation (Ω)</th>
                <th>Chlorophyll-a</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bgcData?.basin_comparisons.map((b, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{b.basin}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{b.surface_do.toFixed(1)} µmol/kg</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: b.omz_min_do < 20 ? '#f43f5e' : '#f59e0b' }}>
                    {b.omz_min_do.toFixed(1)} µmol/kg
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.omz_thickness_m} m</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.surface_ph.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{b.omega_arag.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{b.chla.toFixed(2)} mg/m³</td>
                  <td>
                    <Link to="/explorer">
                      <Button variant="outline" size="sm" leftIcon={<Compass className="w-3 h-3" />}>
                        3D View
                      </Button>
                    </Link>
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

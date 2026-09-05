import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, RefreshCw, Compass, AlertTriangle, Activity, 
  Wind, Waves, Layers, Info, CheckCircle2, Download
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { api, DisasterThreatsResponse } from '../services/apiClient';

export const DisasterSurgeView: React.FC = () => {
  const [disasterData, setDisasterData] = useState<DisasterThreatsResponse | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDisasterData = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveDisasters();
      setDisasterData(data);
    } catch (err) {
      console.error('Failed to fetch disaster threats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasterData();
  }, []);

  const sys = disasterData?.cyclone_system;

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose" />
              Tropical Cyclone Storm Surge &amp; Coastal Inundation Warning
            </h1>
            <Badge variant="danger">Phase 30</Badge>
            <Badge variant="warning">Provenance: MODEL_ESTIMATE</Badge>
          </div>
          <p className="page-subtitle">
            Holland parametric wind field, shallow-water bathymetric shoaling (&Delta;&eta; surge), and coastal district inundation threat indices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              View Cone of Uncertainty on 3D Globe
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDisasterData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Threat Data
          </Button>
        </div>
      </div>

      {/* Official Feed Notice Banner */}
      <div style={{
        backgroundColor: 'rgba(244, 63, 94, 0.08)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info className="w-5 h-5 text-rose shrink-0 mt-0.5" />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              Meteorological Modeling Scenario &bull; Official Alert Feed Status: OFFICIAL_FEED_NOT_CONFIGURED
            </strong>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
            {sys?.feed_disclaimer || 'Hydrodynamic surge simulation for coastal vulnerability research. Live public safety evacuations must adhere to official bulletins from IMD / Disaster Management Authorities.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Peak Modeled Surge</span>
            <Waves className="w-4 h-4 text-rose" />
          </div>
          <div className="metric-stat-value text-rose">
            {sys ? `+${sys.estimated_peak_surge_m.toFixed(2)} m` : '+2.85 m'}
          </div>
          <div className="metric-stat-sub"><span>Above astronomical high tide</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Max Sustained Winds</span>
            <Wind className="w-4 h-4 text-amber" />
          </div>
          <div className="metric-stat-value text-amber">
            {sys ? `${sys.max_sustained_winds_knots} kn (${sys.max_sustained_winds_kmh} km/h)` : '85 kn'}
          </div>
          <div className="metric-stat-sub"><span>Category: {sys?.classification || 'Very Severe Cyclone'}</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Central Minimum Pressure</span>
            <Activity className="w-4 h-4 text-cyan" />
          </div>
          <div className="metric-stat-value text-cyan">
            {sys ? `${sys.central_pressure_hpa} hPa` : '962 hPa'}
          </div>
          <div className="metric-stat-sub"><span>Barometric Inverted Effect</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Forward Translation</span>
            <Compass className="w-4 h-4 text-emerald" />
          </div>
          <div className="metric-stat-value text-emerald">
            {sys ? `${sys.forward_motion_speed_kmh} km/h` : '14.5 km/h'}
          </div>
          <div className="metric-stat-sub"><span>Heading: {sys?.forward_motion_heading_deg || 340}° (NNW)</span></div>
        </div>
      </div>

      {/* Coastal District Inundation Threat Matrix Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Coastal District Threat Matrix &amp; Combined Water Levels
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Combined astronomical tide + hydrodynamic storm surge inundation elevation.
            </p>
          </div>
          <Badge variant="danger">4 Vulnerable Sectors Evaluated</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>District / Coastal Sector</th>
                <th>Threat Level</th>
                <th>Estimated Surge Height</th>
                <th>Astronomical Tide Phase</th>
                <th>Combined Sea Water Elevation</th>
                <th>Landfall Proximity</th>
                <th>Evacuation Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {disasterData?.coastal_threat_districts.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.district}</td>
                  <td>
                    <Badge variant={d.threat_level === 'SEVERE_RISK' ? 'danger' : (d.threat_level === 'HIGH_RISK' ? 'warning' : 'info')}>
                      {d.threat_level.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f43f5e' }}>
                    +{d.inundation_height_m.toFixed(2)} m
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.astronomical_tide_phase}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                    +{d.combined_water_level_m.toFixed(2)} m
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.distance_to_landfall_km} km</td>
                  <td>
                    {d.evacuation_recommended ? (
                      <Badge variant="danger">Evacuation Advisory</Badge>
                    ) : (
                      <Badge variant="neutral">Standby Watch</Badge>
                    )}
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

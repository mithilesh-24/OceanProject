import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, ExternalLink, Thermometer, Droplets, Gauge, Ship, 
  Search, Eye, Compass, ShieldCheck 
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { VerticalProfileChart } from '../components/charts/VerticalProfileChart';
import { ObservationDetailDrawer, SelectedObservation } from '../components/explorer/ObservationDetailDrawer';
import { api } from '../services/apiClient';

export const CtdView: React.FC = () => {
  const [casts, setCasts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVessel, setSelectedVessel] = useState('ALL');
  const [selectedCast, setSelectedCast] = useState<SelectedObservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fallbackCasts = [
    {
      cast_id: 'CTD-SAGAR-2026-041',
      vessel: 'ORV Sagar Kanya',
      station_name: 'Stn #14 (BoB Central)',
      latitude: 15.50,
      longitude: 88.00,
      max_depth: 3800,
      bottles_count: 24,
      cruise_date: '2026-08-24',
      parameters: 'Conductivity, Temp, Pressure, DO, Fluorescence, Nutrients',
      qc_status: 'Quality Controlled (QC-1)',
      profile_data: {
        depths: [5, 25, 50, 100, 200, 500, 1000, 1500, 2000, 3000, 3800],
        temp: [28.85, 28.80, 27.10, 20.80, 14.10, 9.80, 6.20, 3.90, 2.40, 1.80, 1.45],
        sal: [33.15, 33.25, 34.00, 34.85, 35.05, 35.00, 34.85, 34.75, 34.70, 34.72, 34.74],
        dissolved_o2: [210.0, 208.5, 172.0, 80.5, 24.0, 42.0, 95.0, 135.0, 160.0, 175.0, 182.0]
      }
    },
    {
      cast_id: 'CTD-NIDHI-2026-112',
      vessel: 'ORV Sagar Nidhi',
      station_name: 'Stn #08 (Arabian Sea)',
      latitude: 19.10,
      longitude: 65.40,
      max_depth: 2500,
      bottles_count: 24,
      cruise_date: '2026-08-29',
      parameters: 'Conductivity, Temp, Salinity, Nutrients (NO3, PO4)',
      qc_status: 'Quality Controlled (QC-1)',
      profile_data: {
        depths: [5, 25, 50, 100, 200, 400, 800, 1200, 2000, 2500],
        temp: [28.10, 28.05, 26.80, 22.00, 16.20, 12.50, 9.10, 6.00, 2.70, 2.10],
        sal: [36.30, 36.35, 36.45, 36.20, 35.85, 35.40, 35.10, 34.92, 34.80, 34.76]
      }
    },
    {
      cast_id: 'CTD-MANJUSHA-2026-019',
      vessel: 'CRV Sagar Manjusha',
      station_name: 'Stn #03 (Goa Shelf)',
      latitude: 15.45,
      longitude: 73.60,
      max_depth: 200,
      bottles_count: 12,
      cruise_date: '2026-09-02',
      parameters: 'CTD, Turbidity, PAR, Chlorophyll',
      qc_status: 'Verified',
      profile_data: {
        depths: [2, 10, 25, 50, 75, 100, 150, 200],
        temp: [28.9, 28.7, 27.5, 24.2, 21.8, 19.4, 16.2, 14.8],
        sal: [35.2, 35.3, 35.6, 35.9, 36.1, 36.2, 36.2, 36.1]
      }
    },
  ];

  useEffect(() => {
    const fetchCasts = async () => {
      try {
        const vesselParam = selectedVessel !== 'ALL' ? selectedVessel : undefined;
        const data = await api.getCtd(vesselParam, searchQuery || undefined);
        if (data && data.length > 0) {
          setCasts(data);
        } else {
          setCasts(fallbackCasts);
        }
      } catch {
        setCasts(fallbackCasts);
      }
    };
    fetchCasts();
  }, [selectedVessel, searchQuery]);

  const handleInspectCast = (c: any) => {
    setSelectedCast({
      type: 'ctd',
      id: c.cast_id,
      title: `${c.cast_id}`,
      subtitle: `${c.vessel} • ${c.station_name}`,
      latitude: c.latitude,
      longitude: c.longitude,
      maxDepth: c.max_depth,
      status: c.qc_status,
      profileData: c.profile_data,
    });
    setIsDrawerOpen(true);
  };

  const filteredCasts = casts.filter(
    (c) =>
      c.cast_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vessel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.station_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Layers className="w-5 h-5 text-[var(--primary)]" />
            Shipboard CTD Casts & Hydrographic Rosettes
          </h1>
          <p className="page-subtitle">
            Gold-standard full-depth oceanographic cruise stations providing ultra-high precision calibration profiles and chemical bottle assays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">Research Vessel Feeds</Badge>
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              View on 3D Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Hydrographic Cast Stations</span>
            <Ship className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">1,420 Casts</div>
          <div className="metric-stat-sub"><span>MoES Research Fleet</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Maximum Cast Depth</span>
            <Gauge className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">5,800 m</div>
          <div className="metric-stat-sub"><span>Central Indian Basin Abyssal</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Vertical Resolution</span>
            <Layers className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">1 dbar (1 m)</div>
          <div className="metric-stat-sub"><span>Seabird SBE-911plus standard</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Water Bottle Samples</span>
            <Droplets className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">34,080</div>
          <div className="metric-stat-sub"><span>Niskin bottle chemical lab assays</span></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
            <span>SEARCH:</span>
          </div>
          <div style={{ width: '220px' }}>
            <Input
              size="sm"
              placeholder="Cast ID or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Vessel Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Fleet' },
            { key: 'Sagar Kanya', label: 'ORV Sagar Kanya' },
            { key: 'Sagar Nidhi', label: 'ORV Sagar Nidhi' },
            { key: 'Manjusha', label: 'CRV Sagar Manjusha' }
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setSelectedVessel(v.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: selectedVessel === v.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedVessel === v.key ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: selectedVessel === v.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTD Casts Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Shipboard CTD Cast Profiles
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Calibrated Seabird CTD rosette profiles assimilated into the ocean data validation engine.
            </p>
          </div>
          <Badge variant="success">Gold Standard Data</Badge>
        </div>

        <div className="table-scroll-container">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Cruise Cast ID</th>
                <th>Research Vessel</th>
                <th>Station Name</th>
                <th>Coordinates</th>
                <th>Cast Depth</th>
                <th>Assayed Parameters</th>
                <th>QC Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCasts.map((c) => (
                <tr key={c.cast_id} style={{ cursor: 'pointer' }} onClick={() => handleInspectCast(c)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {c.cast_id}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.vessel}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.station_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {c.latitude?.toFixed(2)}°, {c.longitude?.toFixed(2)}°
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.max_depth} m</td>
                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '240px' }}>{c.parameters}</td>
                  <td>
                    <Badge variant="success">{c.qc_status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => handleInspectCast(c)}
                      >
                        Profile
                      </Button>
                      <Link to={`/explorer?lat=${c.latitude}&lon=${c.longitude}`}>
                        <Button variant="outline" size="sm" leftIcon={<Compass className="w-3 h-3" />}>
                          3D
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Detail Drawer */}
      <ObservationDetailDrawer
        observation={selectedCast}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};


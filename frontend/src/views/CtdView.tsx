import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ExternalLink, Thermometer, Droplets, Gauge, Ship } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const CtdView: React.FC = () => {
  const ctdCasts = [
    {
      id: 'CTD-SAGAR-2026-041',
      vessel: 'ORV Sagar Kanya',
      station: 'Stn #14 (BoB Central)',
      coords: '15.50°N, 88.00°E',
      maxDepth: '3,800 m',
      bottles: 24,
      date: 'Aug 24, 2026',
      params: 'Conductivity, Temp, Pressure, DO, Fluorescence',
      status: 'Quality Controlled (QC-1)',
    },
    {
      id: 'CTD-NIDHI-2026-112',
      vessel: 'ORV Sagar Nidhi',
      station: 'Stn #08 (Arabian Sea)',
      coords: '19.10°N, 65.40°E',
      maxDepth: '2,500 m',
      bottles: 24,
      date: 'Aug 29, 2026',
      params: 'Conductivity, Temp, Salinity, Nutrients (NO3, PO4)',
      status: 'Quality Controlled (QC-1)',
    },
    {
      id: 'CTD-MANJUSHA-2026-019',
      vessel: 'CRV Sagar Manjusha',
      station: 'Stn #03 (Goa Shelf)',
      coords: '15.45°N, 73.60°E',
      maxDepth: '200 m',
      bottles: 12,
      date: 'Sep 02, 2026',
      params: 'CTD, Turbidity, PAR, Chlorophyll',
      status: 'Verified',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Layers className="w-5 h-5 text-[var(--primary)]" />
            Shipboard CTD Casts & Hydrographic Rosettes
          </h1>
          <p className="page-subtitle">
            Gold-standard full-depth oceanographic cruise stations providing ultra-high precision calibration profiles.
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

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Cruise Cast ID</th>
                <th>Research Vessel</th>
                <th>Station Name</th>
                <th>Coordinates</th>
                <th>Cast Depth</th>
                <th>Assayed Parameters</th>
                <th>Cruise Date</th>
                <th>QC Status</th>
              </tr>
            </thead>
            <tbody>
              {ctdCasts.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.vessel}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.station}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{c.coords}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{c.maxDepth}</td>
                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '240px' }}>{c.params}</td>
                  <td style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{c.date}</td>
                  <td>
                    <Badge variant="success">{c.status}</Badge>
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

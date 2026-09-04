import React from 'react';
import { Settings, Globe, Shield, Moon, Sun, Server, Sliders, Database } from 'lucide-react';
import { ThemeSwitcher } from '../components/UI/ThemeSwitcher';
import { RoleSwitcher } from '../components/layout/RoleSwitcher';
import { Badge } from '../components/UI/Badge';

export const SettingsView: React.FC = () => {
  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Settings className="w-5 h-5 text-[var(--primary)]" />
            Platform Settings & System Preferences
          </h1>
          <p className="page-subtitle">
            Manage visual appearance, scientific units, developer roles, and geospatial coordinate projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">SIH2026 Core Config</Badge>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Appearance & Workspace */}
        <div className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Appearance & Theme
            </h3>
            <Badge variant="outline">Client UI</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Interface Theme</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Light (Default Scientific GIS) or Dark (Night Operations)</span>
            </div>
            <ThemeSwitcher />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>Development Role Mode</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Instantly switch between Public, Student, Researcher, and Admin</span>
            </div>
            <RoleSwitcher />
          </div>
        </div>

        {/* Oceanographic Units & GIS */}
        <div className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Scientific Units & Projections
            </h3>
            <Badge variant="success">WGS-84 Standard</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Coordinate Datum</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>EPSG:4326 (WGS 84 Ellipsoid)</span>
            </div>
            <Badge variant="outline">Default</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Depth Unit</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>Meters & Decibars (1 dbar ≈ 1 m depth)</span>
            </div>
            <Badge variant="outline">Meters / dbar</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Salinity Scale</span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>Practical Salinity Scale 1978 (PSS-78 / PSU)</span>
            </div>
            <Badge variant="outline">PSS-78</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

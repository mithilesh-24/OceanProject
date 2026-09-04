import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, BarChart2, Download, Bookmark, FileSpreadsheet, Play, Code2, Database, Terminal } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useRole } from '../context/RoleContext';

export const ResearcherWorkspaceView: React.FC = () => {
  const { profile } = useRole();

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <Microscope className="w-5 h-5 text-[var(--primary)]" />
              Researcher Scientific Workspace
            </h1>
            <Badge variant="success">ADVANCED ANALYTICS</Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Lead Scientist: <strong className="text-[var(--text-primary)]">{profile.name}</strong> • {profile.organization} • {profile.researchArea}
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
              Batch Export Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Saved Workspaces</span>
            <Bookmark className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">3 Active</div>
          <div className="metric-stat-sub"><span>Bay of Bengal & Arabian Sea</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Extracted Profiles</span>
            <Database className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">18,420</div>
          <div className="metric-stat-sub"><span>CTD & Argo paired samples</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Validation Scripts</span>
            <Code2 className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">Python / R</div>
          <div className="metric-stat-sub"><span>xarray & netCDF4 pipelines</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Export Quota</span>
            <Terminal className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">Unlimited</div>
          <div className="metric-stat-sub"><span>High-throughput NetCDF-4</span></div>
        </div>
      </div>

      {/* Main Workspace Panels */}
      <div className="grid-cols-2">
        <div className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Research Projects & Studies
            </h3>
            <Badge variant="primary">2 Projects</Badge>
          </div>

          <div className="space-y-3">
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Arabian Sea Summer Monsoonal Upwelling & Barrier Layer Dynamics
                </span>
                <Badge variant="success">IN PROGRESS</Badge>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                HYCOM 1/12° vs OMNI Buoys & Argo floats • Depth band: 0–300m • Target: Thermocline displacement
              </p>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <Link to="/comparison"><Button variant="primary" size="sm">Resume Analysis</Button></Link>
                <Link to="/export"><Button variant="outline" size="sm">Export Subset</Button></Link>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Marine Heatwave Frequency & Cyclone Intensification in BoB
                </span>
                <Badge variant="warning">ALERT ACTIVE</Badge>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                ROMS regional model SST anomaly detection vs Argo Float #1902670 continuous series
              </p>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <Link to="/anomalies"><Button variant="primary" size="sm">Inspect Anomalies</Button></Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Scientific Pipeline Utilities
            </h3>
            <Badge variant="outline">Automation</Badge>
          </div>

          <div className="space-y-2">
            <Link to="/comparison" style={{ textDecoration: 'none', display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>● Multi-Model Spatial Inter-Comparison Engine</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generate difference grids and statistical Taylor diagrams for HYCOM vs ROMS vs NEMO</span>
            </Link>

            <Link to="/errors" style={{ textDecoration: 'none', display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>● Spatial Error Distribution & Bias Mapping</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Regional error heatmaps, Willmott Skill Index, and root cause diagnostics</span>
            </Link>

            <Link to="/export" style={{ textDecoration: 'none', display: 'block', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>● NetCDF-4 / CF-Compliant Scientific Exporter</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Export spatial bounding box queries directly to Python/R analysis pipelines</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

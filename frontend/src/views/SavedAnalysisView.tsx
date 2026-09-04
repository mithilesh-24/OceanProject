import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Play, Trash2, Calendar, Database, Layers, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const SavedAnalysisView: React.FC = () => {
  const savedSessions = [
    {
      id: 'saved_1',
      name: 'HYCOM vs Bay of Bengal Argo (Summer Monsoonal Profile)',
      model: 'HYCOM 1/12° Global',
      obs: 'INCOIS Argo Floats',
      variables: ['Temperature', 'Salinity'],
      region: 'Bay of Bengal (8°N–22°N, 80°E–94°E)',
      depth: '0 – 500 m',
      samples: '1,840 profiles',
      date: 'Aug 28, 2026',
      rmse: '0.48 °C',
      bias: '+0.12 °C',
    },
    {
      id: 'saved_2',
      name: 'ROMS Coastal Upwelling Error Analysis (Somali & Arabian Coast)',
      model: 'ROMS Regional Ocean',
      obs: 'OMNI Moored Buoys',
      variables: ['SST', 'Currents (u, v)'],
      region: 'Arabian Sea (10°N–25°N, 55°E–75°E)',
      depth: 'Surface to 200 m',
      samples: '720 station records',
      date: 'Sep 02, 2026',
      rmse: '0.61 °C',
      bias: '-0.08 °C',
    },
    {
      id: 'saved_3',
      name: 'NEMO Thermocline Depth Verification',
      model: 'NEMO Global Physics',
      obs: 'Argo Deep Floats',
      variables: ['Temperature', 'Pressure'],
      region: 'Equatorial Indian Ocean',
      depth: '0 – 2,000 m',
      samples: '960 profiles',
      date: 'Sep 04, 2026',
      rmse: '0.39 °C',
      bias: '+0.05 °C',
    },
  ];

  return (
    <div className="page-scroll-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Bookmark className="w-5 h-5 text-[var(--primary)]" />
            Saved Analyses & Configurations
          </h1>
          <p className="page-subtitle">
            Persisted model validation sessions, cross-comparison queries, and regional analysis workspaces.
          </p>
        </div>

        <Link to="/comparison">
          <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
            New Comparison Session
          </Button>
        </Link>
      </div>

      {/* Saved Sessions Grid */}
      <div className="space-y-4">
        {savedSessions.map((session) => (
          <div key={session.id} className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {session.name}
                </h3>
                <Badge variant="primary">{session.model}</Badge>
                <Badge variant="success">{session.obs}</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Saved on {session.date}</span>
              </div>
            </div>

            <div className="grid-cols-4" style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Variables</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{session.variables.join(', ')}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Depth Band</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{session.depth}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Sample Count</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{session.samples}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Computed RMSE / Bias</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{session.rmse} / {session.bias}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Region: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{session.region}</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/comparison">
                  <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
                    Resume Session
                  </Button>
                </Link>
                <Button variant="outline" size="sm" iconOnly aria-label="Delete Session">
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

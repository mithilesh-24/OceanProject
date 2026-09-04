import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Database, Globe, Compass, ExternalLink, Download, 
  Layers, Clock, ShieldCheck, MapPin, Code2, Play, Check 
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { DatasetItem } from '../../services/apiClient';

interface DatasetDetailDrawerProps {
  dataset: DatasetItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetDetailDrawer: React.FC<DatasetDetailDrawerProps> = ({
  dataset,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !dataset) return null;

  const sampleEndpoint = dataset.endpoint_url || `http://localhost:8000/api/v1/datasets/${dataset.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ui-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ui-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1200,
          animation: 'slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant={dataset.type === 'Observation' ? 'success' : dataset.type === 'Model' ? 'primary' : 'neutral'}>
                {dataset.type.toUpperCase()}
              </Badge>
              {dataset.protocol && (
                <Badge variant="outline" style={{ fontSize: '10px' }}>
                  {dataset.protocol}
                </Badge>
              )}
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {dataset.name}
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Custodian: <strong style={{ color: 'var(--text-secondary)' }}>{dataset.provider}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Key Parameters */}
          <div className="grid-cols-2">
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Spatial Grid</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{dataset.resolution}</span>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Temporal Extent</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{dataset.time_coverage}</span>
            </div>
          </div>

          {/* Measured / Modeled Variables */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Assimilated Oceanographic Variables
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {dataset.variables.map((v, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Geographic Region & Coordinate Datum */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Geospatial Domain & Datum
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Coverage: <strong style={{ color: 'var(--text-primary)' }}>{dataset.region}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Horizontal Datum: <strong style={{ color: 'var(--text-primary)' }}>EPSG:4326 (WGS 84 Ellipsoid)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck className="w-4 h-4 text-[var(--success)] shrink-0" />
                <span>Licensing: <strong style={{ color: 'var(--text-primary)' }}>Open Access / MoES Data Policy</strong></span>
              </div>
            </div>
          </div>

          {/* API Access Endpoint */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                REST / OPeNDAP Endpoint
              </h4>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? 'var(--success)' : 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                {copied ? 'Copied URL!' : 'Copy Endpoint'}
              </button>
            </div>
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                wordBreak: 'break-all',
                border: '1px solid var(--border)',
              }}
            >
              {sampleEndpoint}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <Link to={`/explorer?dataset=${dataset.id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-4 h-4" />} className="w-full">
              Open in 3D Globe
            </Button>
          </Link>
          <Link to="/comparison" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
              Compare
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

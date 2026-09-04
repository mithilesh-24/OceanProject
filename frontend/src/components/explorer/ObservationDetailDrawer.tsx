import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Radio, Compass, Thermometer, Droplets, ArrowDown, 
  Battery, Clock, ShieldCheck, Download, Play, ExternalLink, Activity
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';

export interface SelectedObservation {
  type: 'argo' | 'glider' | 'buoy' | 'ctd' | 'adcp';
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  cycle?: number;
  lastDate?: string;
  surfaceTemp?: number | string;
  surfaceSal?: number | string;
  maxDepth?: number | string;
  battery?: number | string;
  status?: string;
  profileData?: {
    depths: number[];
    temp: number[];
    sal: number[];
  };
}

interface ObservationDetailDrawerProps {
  observation: SelectedObservation | null;
  isOpen: boolean;
  onClose: () => void;
  onCenterCamera?: (lat: number, lon: number) => void;
}

export const ObservationDetailDrawer: React.FC<ObservationDetailDrawerProps> = ({
  observation,
  isOpen,
  onClose,
  onCenterCamera,
}) => {
  if (!isOpen || !observation) return null;

  const depths = observation.profileData?.depths || [0, 25, 50, 100, 200, 500, 1000, 2000];
  const temps = observation.profileData?.temp || [28.9, 28.8, 27.2, 21.0, 14.2, 10.1, 6.5, 2.4];
  const sals = observation.profileData?.sal || [33.2, 33.5, 34.1, 35.0, 35.1, 35.0, 34.8, 34.7];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '380px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        animation: 'slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              shrink: 0,
            }}
          >
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {observation.title}
              </h3>
              <Badge variant="success" style={{ fontSize: '9px', padding: '1px 5px' }}>
                {observation.type.toUpperCase()}
              </Badge>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {observation.subtitle}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Coordinates & Status */}
        <div className="grid-cols-2">
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Coordinates</span>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {observation.latitude.toFixed(3)}°, {observation.longitude.toFixed(3)}°
            </span>
          </div>
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Operational Status</span>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--success)' }}>
              {observation.status || 'Active (Live)'}
            </span>
          </div>
        </div>

        {/* Surface Readings */}
        <div className="grid-cols-3">
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Surface Temp</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {observation.surfaceTemp ? `${observation.surfaceTemp}°C` : '28.92°C'}
            </div>
          </div>
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Surface Salinity</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {observation.surfaceSal ? `${observation.surfaceSal}` : '33.18 PSU'}
            </div>
          </div>
          <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Max Depth</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {observation.maxDepth ? `${observation.maxDepth}m` : '2,000m'}
            </div>
          </div>
        </div>

        {/* Depth Profile Table Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Vertical CTD Hydrographic Profile
            </h4>
            <Badge variant="primary" style={{ fontSize: '9px' }}>Assimilated Profile</Badge>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table className="ui-table" style={{ fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 10px' }}>Depth (dbar)</th>
                  <th style={{ padding: '6px 10px' }}>Temp (°C)</th>
                  <th style={{ padding: '6px 10px' }}>Salinity (PSU)</th>
                </tr>
              </thead>
              <tbody>
                {depths.slice(0, 6).map((d, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d} m</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{temps[i] || '--'} °C</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>{sals[i] || '--'} PSU</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metadata Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>Quality Control: <strong style={{ color: 'var(--text-primary)' }}>QC-1 Real-Time Mode Verified</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>Last Telemetry: <strong style={{ color: 'var(--text-secondary)' }}>{observation.lastDate || 'Just now'}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onCenterCamera && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Compass className="w-3.5 h-3.5" />}
            onClick={() => onCenterCamera(observation.latitude, observation.longitude)}
            style={{ flex: 1 }}
          >
            Center Camera
          </Button>
        )}
        <Link to="/comparison" style={{ textDecoration: 'none', flex: 1 }}>
          <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} className="w-full">
            Compare
          </Button>
        </Link>
      </div>
    </div>
  );
};

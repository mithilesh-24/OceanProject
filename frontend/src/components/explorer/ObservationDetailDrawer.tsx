import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, Radio, Compass, Thermometer, Droplets, ArrowDown, 
  Battery, Clock, ShieldCheck, Download, Play, ExternalLink, Activity,
  Waves, Anchor, Layers, Cpu, BarChart2
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { VerticalProfileChart } from '../charts/VerticalProfileChart';
import { SawtoothGliderChart } from '../charts/SawtoothGliderChart';
import { BuoyTimeSeriesChart } from '../charts/BuoyTimeSeriesChart';
import { AdcpVelocityProfileChart } from '../charts/AdcpVelocityProfileChart';

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
  profileData?: any;
  timeseriesData?: any;
  velocityProfile?: any;
  trajectory?: any;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'table' | 'meta'>('profile');

  if (!isOpen || !observation) return null;

  const getPlatformIcon = () => {
    switch (observation.type) {
      case 'argo': return Radio;
      case 'glider': return Waves;
      case 'buoy': return Anchor;
      case 'ctd': return Layers;
      case 'adcp': return Cpu;
      default: return Activity;
    }
  };

  const IconComp = getPlatformIcon();

  const depths = observation.profileData?.depths || [0, 25, 50, 100, 200, 500, 1000, 2000];
  const temps = observation.profileData?.temp || [28.92, 28.85, 27.20, 21.00, 14.20, 10.10, 6.50, 2.40];
  const sals = observation.profileData?.sal || [33.18, 33.45, 34.10, 35.00, 35.10, 35.00, 34.80, 34.70];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
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
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              shrink: 0,
            }}
          >
            <IconComp className="w-4 h-4" />
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

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Profile Chart
        </button>
        <button
          onClick={() => setActiveTab('table')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'table' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'table' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Data Points
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'meta' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'meta' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Diagnostics
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

        {/* Tab 1: Profile Chart */}
        {activeTab === 'profile' && (
          <div className="space-y-3">
            {observation.type === 'argo' || observation.type === 'ctd' ? (
              <VerticalProfileChart
                data={{
                  depths: observation.profileData?.depths || depths,
                  temp: observation.profileData?.temp || temps,
                  sal: observation.profileData?.sal || sals,
                  dissolved_o2: observation.profileData?.dissolved_o2,
                  density: observation.profileData?.density,
                }}
                width={386}
                height={280}
              />
            ) : observation.type === 'glider' ? (
              <SawtoothGliderChart
                dives={observation.profileData?.sawtooth_dives}
                width={386}
                height={220}
              />
            ) : observation.type === 'buoy' ? (
              <BuoyTimeSeriesChart
                data={observation.timeseriesData}
                width={386}
                height={220}
              />
            ) : observation.type === 'adcp' ? (
              <AdcpVelocityProfileChart
                bins={observation.velocityProfile?.bins}
                width={386}
                height={240}
              />
            ) : (
              <VerticalProfileChart
                data={{ depths, temp: temps, sal: sals }}
                width={386}
                height={280}
              />
            )}
          </div>
        )}

        {/* Tab 2: Table Data */}
        {activeTab === 'table' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Discrete Vertical Sensor Bins
              </h4>
              <Badge variant="primary" style={{ fontSize: '9px' }}>Assimilated</Badge>
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
                  {depths.map((d: number, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d} m</td>
                      <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', color: '#ff6b6b' }}>
                        {temps[i] !== undefined ? `${temps[i]} °C` : '--'}
                      </td>
                      <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', color: '#0ea5e9' }}>
                        {sals[i] !== undefined ? `${sals[i]} PSU` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Diagnostics */}
        {activeTab === 'meta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Quality Control Flags</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <ShieldCheck className="w-4 h-4" />
                <span>QC-1 (Good In-Situ Real-Time Mode Data)</span>
              </div>
            </div>

            <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Telemetry & Health</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Last Transmission: <strong>{observation.lastDate || 'Sep 04, 2026'}</strong></span>
              </div>
              {observation.battery && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <Battery className="w-3.5 h-3.5 text-[var(--warning)]" />
                  <span>Battery State: <strong>{observation.battery}%</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
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
            Center Globe
          </Button>
        )}
        <Link to={`/comparison?obs=${observation.id}&type=${observation.type}`} style={{ textDecoration: 'none', flex: 1 }}>
          <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} className="w-full">
            Model Match
          </Button>
        </Link>
      </div>
    </div>
  );
};


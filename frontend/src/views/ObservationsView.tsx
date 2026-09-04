import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Radio, Waves, Anchor, Layers, Cpu, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const ObservationsView: React.FC = () => {
  const observationTypes = [
    { title: 'Argo Profiling Floats', count: '4,232 Active Floats', path: '/argo', icon: Radio, desc: 'Autonomous CTD floats measuring temperature & practical salinity down to 2,000 m depth.', badge: 'INCOIS LIVE' },
    { title: 'Underwater Gliders', count: '3 Active Missions', path: '/gliders', icon: Waves, desc: 'Sawtooth buoyancy gliders resolving thermal fronts and oxygen minimum boundaries.', badge: 'TELEMETRY' },
    { title: 'Moored Buoy Arrays', count: '28 Deep Moorings', path: '/buoys', icon: Anchor, desc: 'OMNI and RAMA ocean-atmosphere moored buoys with real-time met-ocean & SST feeds.', badge: 'INSAT SYNC' },
    { title: 'Ship-based CTD Casts', count: '1,420 Cast Stations', path: '/ctd', icon: Layers, desc: 'Research vessel rosette hydrographic profiles providing high-precision chemical & physical lab assays.', badge: 'CALIBRATED' },
    { title: 'ADCP Current Profilers', count: '12 Moored Profilers', path: '/adcp', icon: Cpu, desc: 'Acoustic Doppler Current Profilers recording full vertical velocity vectors (u, v, w).', badge: 'ACOUSTIC' },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Activity className="w-5 h-5 text-[var(--primary)]" />
            In-Situ Ocean Observation Portals
          </h1>
          <p className="page-subtitle">
            Comprehensive directory of in-situ marine sensing platforms operating across the Indian Ocean basin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open 3D Multi-Layer Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Observation Platform Cards */}
      <div className="grid-cols-3">
        {observationTypes.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h3>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.count}</span>
                    </div>
                  </div>
                  <Badge variant="success">{item.badge}</Badge>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '12px' }}>
                  {item.desc}
                </p>
              </div>

              <Link to={item.path} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="w-full">
                  Explore {item.title.split(' ')[0]}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Network Overview Summary */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              In-Situ Observational Network Integration Status
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Summary of data pipelines connecting in-situ telemetry feeds to the SIH2026 visualization core.
            </p>
          </div>
          <Badge variant="primary">Synchronized Real-Time</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Observational Network</th>
                <th>Data Custodian / Agency</th>
                <th>Assimilated Variables</th>
                <th>Update Cycle</th>
                <th>Harvest Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Indian Argo Program</td>
                <td>INCOIS (MoES, Govt of India)</td>
                <td>Temperature, Practical Salinity, Pressure</td>
                <td>Continuous / 10-Day Cycles</td>
                <td><Badge variant="success">Operational (Live)</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>OMNI Moored Buoys</td>
                <td>NIOT / INCOIS</td>
                <td>SST, Air Temp, Wind, Wave Height, Currents</td>
                <td>10-Minute Telemetry</td>
                <td><Badge variant="success">Operational (Live)</Badge></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Research Cruise Fleet</td>
                <td>NCPOR / INCOIS (ORV Sagar Kanya)</td>
                <td>Full-Depth CTD, Dissolved Oxygen, Chlorophyll</td>
                <td>Per Expedition Leg</td>
                <td><Badge variant="primary">Batch Harvested</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

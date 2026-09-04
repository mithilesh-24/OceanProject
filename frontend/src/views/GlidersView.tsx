import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, ExternalLink, Activity, Battery, RefreshCw, 
  Search, Eye, Waves, Navigation, MapPin 
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { SawtoothGliderChart } from '../components/charts/SawtoothGliderChart';
import { ObservationDetailDrawer, SelectedObservation } from '../components/explorer/ObservationDetailDrawer';
import { api } from '../services/apiClient';

export const GlidersView: React.FC = () => {
  const [gliders, setGliders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGlider, setSelectedGlider] = useState<SelectedObservation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fallbackGliders = [
    {
      id: 'SG-642',
      platform_name: 'Slocum G3 Glider #642',
      mission_name: 'South-West BoB Coastal Transect',
      latitude: 11.85,
      longitude: 82.40,
      dives_completed: 342,
      depth_range: '0 – 1,000 m',
      battery_pct: 74,
      sensors: 'CTD, DO, Backscatter, Chl-a',
      status: 'Active Sawtooth Dive',
      trajectory: [
        { lat: 11.20, lon: 81.80, time: '2026-08-20' },
        { lat: 11.45, lon: 82.05, time: '2026-08-25' },
        { lat: 11.65, lon: 82.22, time: '2026-08-30' },
        { lat: 11.85, lon: 82.40, time: '2026-09-04' }
      ],
      profile_data: {
        sawtooth_dives: [
          { dive: 340, depth_profile: [0, 50, 100, 200, 400, 600, 800, 1000], temp: [29.1, 28.4, 23.2, 16.4, 11.8, 8.9, 7.1, 5.8], sal: [33.4, 34.1, 34.9, 35.1, 35.0, 34.9, 34.8, 34.7] },
          { dive: 341, depth_profile: [0, 50, 100, 200, 400, 600, 800, 1000], temp: [29.0, 28.2, 22.8, 16.1, 11.5, 8.7, 7.0, 5.7], sal: [33.5, 34.2, 34.95, 35.1, 35.0, 34.9, 34.8, 34.7] },
          { dive: 342, depth_profile: [0, 50, 100, 200, 400, 600, 800, 1000], temp: [28.9, 28.0, 22.5, 15.9, 11.4, 8.6, 6.9, 5.6], sal: [33.6, 34.3, 35.0, 35.1, 35.0, 34.9, 34.8, 34.7] }
        ]
      }
    },
    {
      id: 'SG-591',
      platform_name: 'SeaExplorer Glider #591',
      mission_name: 'Arabian Sea Oxygen Minimum Zone Survey',
      latitude: 17.20,
      longitude: 68.10,
      dives_completed: 618,
      depth_range: '0 – 700 m',
      battery_pct: 48,
      sensors: 'CTD, Dissolved Oxygen, Nitrate',
      status: 'Active Sawtooth Dive',
      trajectory: [
        { lat: 16.50, lon: 67.20, time: '2026-08-15' },
        { lat: 16.85, lon: 67.65, time: '2026-08-25' },
        { lat: 17.20, lon: 68.10, time: '2026-09-04' }
      ]
    },
    {
      id: 'SG-704',
      platform_name: 'Seaglider #704',
      mission_name: 'Equatorial Current Boundary Transect',
      latitude: 0.40,
      longitude: 85.10,
      dives_completed: 120,
      depth_range: '0 – 1,000 m',
      battery_pct: 91,
      sensors: 'CTD, Microstructure Turbulence',
      status: 'Deploy Phase',
      trajectory: [
        { lat: 0.10, lon: 84.80, time: '2026-09-01' },
        { lat: 0.40, lon: 85.10, time: '2026-09-04' }
      ]
    },
  ];

  useEffect(() => {
    const fetchGliders = async () => {
      try {
        const data = await api.getGliders(searchQuery || undefined);
        if (data && data.length > 0) {
          setGliders(data);
        } else {
          setGliders(fallbackGliders);
        }
      } catch {
        setGliders(fallbackGliders);
      }
    };
    fetchGliders();
  }, [searchQuery]);

  const handleInspectGlider = (g: any) => {
    setSelectedGlider({
      type: 'glider',
      id: g.id,
      title: `${g.platform_name || g.id}`,
      subtitle: g.mission_name || 'Autonomous Transect',
      latitude: g.latitude,
      longitude: g.longitude,
      maxDepth: g.depth_range,
      battery: g.battery_pct,
      status: g.status,
      profileData: g.profile_data,
      trajectory: g.trajectory,
    });
    setIsDrawerOpen(true);
  };

  const filteredGliders = gliders.filter(
    (g) =>
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.mission_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.platform_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-scroll-container space-y-5" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Compass className="w-5 h-5 text-[var(--primary)]" />
            Autonomous Underwater Gliders
          </h1>
          <p className="page-subtitle">
            Buoyancy-driven submersibles performing high-resolution sawtooth hydrographic cross-sections and boundary surveys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">{gliders.length} Active Missions</Badge>
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
            <span>Active Gliders</span>
            <Compass className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">{gliders.length} Deployed</div>
          <div className="metric-stat-sub"><span>Indian Ocean coastal & open sea</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Completed Sawtooth Dives</span>
            <Activity className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value">1,080</div>
          <div className="metric-stat-sub"><span>Continuous vertical profiles</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Horizontal Trajectory</span>
            <RefreshCw className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">2,840 km</div>
          <div className="metric-stat-sub"><span>Total distance navigated</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Mean Battery State</span>
            <Battery className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">71%</div>
          <div className="metric-stat-sub"><span>Estimated endurance: 45 days</span></div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <Search className="w-4 h-4" />
          <span>FILTER GLIDER MISSIONS:</span>
        </div>
        <div style={{ width: '280px' }}>
          <Input
            size="sm"
            placeholder="Search by Glider ID or Mission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Gliders Table */}
      <div className="table-wrapper">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Underwater Glider Fleet Missions
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              INCOIS glider transects targeting boundary currents, upwelling fronts, and oxygen minimum zones.
            </p>
          </div>
          <Badge variant="success">Real-Time Telemetry</Badge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Glider Platform</th>
                <th>Mission Description</th>
                <th>Position (Lat, Lon)</th>
                <th>Dives Completed</th>
                <th>Depth Range</th>
                <th>Payload Sensors</th>
                <th>Battery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGliders.map((g) => (
                <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => handleInspectGlider(g)}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                    {g.platform_name || g.id}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.mission_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {g.latitude?.toFixed(2)}°, {g.longitude?.toFixed(2)}°
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{g.dives_completed}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{g.depth_range}</td>
                  <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{g.sensors}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{g.battery_pct}%</td>
                  <td>
                    <Badge variant={g.status.includes('Deploy') ? 'primary' : 'success'}>
                      {g.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3 h-3" />}
                        onClick={() => handleInspectGlider(g)}
                      >
                        Transect
                      </Button>
                      <Link to={`/explorer?lat=${g.latitude}&lon=${g.longitude}`}>
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
        observation={selectedGlider}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};


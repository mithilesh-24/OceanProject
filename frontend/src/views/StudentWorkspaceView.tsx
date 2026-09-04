import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Compass, BarChart2, CheckCircle2, Award, Play } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useRole } from '../context/RoleContext';

export const StudentWorkspaceView: React.FC = () => {
  const { profile } = useRole();

  const lessons = [
    {
      id: 1,
      title: 'Ocean Temperature & The Thermocline Layer',
      badge: 'Completed',
      desc: 'Understand how solar radiation warms the upper 50m mixed layer and examine the sharp vertical drop in temperature (thermocline) down to cold abyssal waters.',
      tags: ['SST', 'Thermocline', 'Mixed Layer Depth'],
      link: '/explorer',
    },
    {
      id: 2,
      title: 'Salinity Dynamics: Arabian Sea vs Bay of Bengal',
      badge: 'In Progress',
      desc: 'Investigate why excessive evaporation makes the Arabian Sea salty (>36 PSU) while monsoonal river discharge (Ganges-Brahmaputra) freshens the Bay of Bengal (<33 PSU).',
      tags: ['PSAL', 'Evaporation', 'River Runoff'],
      link: '/explorer',
    },
    {
      id: 3,
      title: 'Argo Profiling Cycle & Satellite Telemetry',
      badge: 'Next Up',
      desc: 'Follow the 10-day lifecycle of a robotic float: parking at 1,000m, descending to 2,000m, taking continuous CTD measurements on ascent, and transmitting data via Iridium.',
      tags: ['Argo Float', 'CTD Rosette', 'Iridium Satellite'],
      link: '/argo',
    },
  ];

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header Banner */}
      <div className="welcome-banner">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
              Ocean Science Educational Workspace
            </h1>
            <Badge variant="primary">STUDENT MODE</Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Enrolled Student: <strong className="text-[var(--text-primary)]">{profile.name}</strong> • {profile.organization} • {profile.course}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
              Launch 3D Earth Explorer
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid-cols-4">
        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Course Progress</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="metric-stat-value text-[var(--success)]">68%</div>
          <div className="metric-stat-sub"><span>2 of 3 core modules completed</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Interactive Labs</span>
            <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="metric-stat-value">5 Completed</div>
          <div className="metric-stat-sub"><span>3D GIS depth slicing exercises</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Explored Floats</span>
            <Compass className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="metric-stat-value">14 Profiles</div>
          <div className="metric-stat-sub"><span>Indian Ocean Argo trajectories</span></div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-stat-header">
            <span>Badge Level</span>
            <Award className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="metric-stat-value">Junior Oceanographer</div>
          <div className="metric-stat-sub"><span>Next: Hydrographic Analyst</span></div>
        </div>
      </div>

      {/* Educational Modules Grid */}
      <div className="grid-cols-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lesson.title}
                </h3>
                <Badge variant={lesson.badge === 'Completed' ? 'success' : lesson.badge === 'In Progress' ? 'primary' : 'neutral'}>
                  {lesson.badge}
                </Badge>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '8px' }}>
                {lesson.desc}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                {lesson.tags.map((t, idx) => (
                  <Badge key={idx} variant="outline" style={{ fontSize: '10px' }}>{t}</Badge>
                ))}
              </div>
            </div>

            <Link to={lesson.link} style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" rightIcon={<Play className="w-3.5 h-3.5" />} className="w-full">
                Open Interactive Lab
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

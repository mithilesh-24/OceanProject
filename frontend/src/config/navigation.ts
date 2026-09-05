import { 
  Compass, Database, Layers, Activity, 
  BarChart2, FileText, Settings, Shield, 
  GraduationCap, Microscope, Download, Bookmark,
  TrendingUp, AlertTriangle, CheckCircle2, Box,
  Waves, Radio, Anchor, Gauge, Cpu, Home
} from 'lucide-react';
import { UserRole } from '../context/RoleContext';

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: any;
  badge?: string;
  roles?: UserRole[]; // If undefined, available to all
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  title: string;
  roles?: UserRole[];
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavSection[] = [
  {
    id: 'core',
    title: 'Core Platform',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        icon: Home,
      },
      {
        id: 'explorer',
        title: 'Ocean Explorer',
        path: '/explorer',
        icon: Compass,
        badge: '3D GIS',
      },
      {
        id: 'datasets',
        title: 'Dataset Catalog',
        path: '/datasets',
        icon: Database,
      },
    ],
  },
  {
    id: 'observations',
    title: 'Observations',
    items: [
      {
        id: 'obs-all',
        title: 'All Observations',
        path: '/observations',
        icon: Activity,
      },
      {
        id: 'argo',
        title: 'Argo Floats',
        path: '/argo',
        icon: Radio,
        badge: 'LIVE',
      },
      {
        id: 'gliders',
        title: 'Gliders',
        path: '/gliders',
        icon: Waves,
        roles: ['student', 'researcher', 'admin'],
      },
      {
        id: 'buoys',
        title: 'Moored Buoys',
        path: '/buoys',
        icon: Anchor,
      },
      {
        id: 'ctd',
        title: 'CTD Casts',
        path: '/ctd',
        icon: Gauge,
        roles: ['student', 'researcher', 'admin'],
      },
      {
        id: 'adcp',
        title: 'ADCP Currents',
        path: '/adcp',
        icon: Cpu,
        roles: ['student', 'researcher', 'admin'],
      },
      {
        id: 'satellite',
        title: 'Satellite Remote Sensing',
        path: '/satellite',
        icon: Radio,
        badge: 'EARTH OBS',
      },
    ],
  },
  {
    id: 'models',
    title: 'Numerical Models',
    roles: ['researcher', 'admin', 'student'],
    items: [
      {
        id: 'models-all',
        title: 'Model Overview',
        path: '/models',
        icon: Layers,
      },
      {
        id: 'hycom',
        title: 'HYCOM Global',
        path: '/models/hycom',
        icon: Waves,
      },
      {
        id: 'roms',
        title: 'ROMS Regional',
        path: '/models/roms',
        icon: Waves,
      },
      {
        id: 'nemo',
        title: 'NEMO Ocean',
        path: '/models/nemo',
        icon: Waves,
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Scientific Analysis',
    roles: ['researcher', 'admin'],
    items: [
      {
        id: 'comparison',
        title: 'Model Comparison',
        path: '/comparison',
        icon: BarChart2,
        badge: 'ENGINE',
      },
      {
        id: 'accuracy',
        title: 'Accuracy Assessment',
        path: '/accuracy',
        icon: CheckCircle2,
      },
      {
        id: 'errors',
        title: 'Error Analysis',
        path: '/errors',
        icon: AlertTriangle,
      },
      {
        id: 'anomalies',
        title: 'Anomaly Detection',
        path: '/anomalies',
        icon: TrendingUp,
      },
      {
        id: 'statistics',
        title: 'Statistics Engine',
        path: '/analysis',
        icon: FileText,
      },
    ],
  },
  {
    id: 'visualization',
    title: '3D & 4D Spaces',
    items: [
      {
        id: '3d-space',
        title: '3D Globe & Depth',
        path: '/3d',
        icon: Box,
      },
      {
        id: '4d-space',
        title: '4D Temporal Engine',
        path: '/4d',
        icon: Activity,
        roles: ['student', 'researcher', 'admin'],
        badge: 'TIME',
      },
    ],
  },
  {
    id: 'workspaces',
    title: 'Dedicated Workspaces',
    items: [
      {
        id: 'student-workspace',
        title: 'Student Workspace',
        path: '/student',
        icon: GraduationCap,
        roles: ['student', 'admin', 'researcher'],
      },
      {
        id: 'researcher-workspace',
        title: 'Researcher Workspace',
        path: '/researcher',
        icon: Microscope,
        roles: ['researcher', 'admin'],
      },
      {
        id: 'admin-workspace',
        title: 'Admin Workspace',
        path: '/admin',
        icon: Shield,
        roles: ['admin'],
        badge: 'SYSTEM',
      },
    ],
  },
  {
    id: 'utilities',
    title: 'Utilities & Tools',
    items: [
      {
        id: 'saved-analysis',
        title: 'Saved Analyses',
        path: '/saved',
        icon: Bookmark,
        roles: ['researcher', 'admin'],
      },
      {
        id: 'export-data',
        title: 'Data Export',
        path: '/export',
        icon: Download,
        roles: ['researcher', 'admin', 'student'],
      },
      {
        id: 'settings',
        title: 'Platform Settings',
        path: '/settings',
        icon: Settings,
      },
    ],
  },
];

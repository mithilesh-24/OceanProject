import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, Search, Filter, ExternalLink, LayoutGrid, 
  List as ListIcon, RefreshCw, Eye, Compass, Play, Download 
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Pagination } from '../components/UI/Pagination';
import { DatasetDetailDrawer } from '../components/datasets/DatasetDetailDrawer';
import { api, DatasetItem } from '../services/apiClient';

export const DatasetsView: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatasets(typeFilter, search);
      let filtered = data;
      if (protocolFilter !== 'ALL') {
        filtered = filtered.filter((d) => d.protocol === protocolFilter);
      }
      setDatasets(filtered);
    } catch (err) {
      console.warn('Backend offline or loading fallback datasets:', err);
      // Fallback
      setDatasets([
        {
          id: 'incois_argo',
          name: 'INCOIS Indian Argo Float Profiles',
          provider: 'INCOIS / MoES',
          type: 'Observation',
          variables: ['Temperature', 'Salinity', 'Pressure'],
          region: 'Indian Ocean (30°E–120°E)',
          time_coverage: '2002 – Present',
          resolution: 'Point In-Situ Profiles',
          status: 'Online',
          protocol: 'ERDDAP',
        },
        {
          id: 'hycom_global',
          name: 'HYCOM Global 1/12° Reanalysis & Forecast',
          provider: 'HYCOM Consortium / NOAA',
          type: 'Model',
          variables: ['Temperature', 'Salinity', 'Velocity (u,v)', 'Elevation'],
          region: 'Global (-80°S–90°N)',
          time_coverage: '1994 – Present',
          resolution: '0.08° (~8.5km) • 40 Depth Levels',
          status: 'Online',
          protocol: 'OPeNDAP',
        },
        {
          id: 'roms_indian',
          name: 'ROMS Regional Ocean Modeling System',
          provider: 'INCOIS Coastal Modeling',
          type: 'Model',
          variables: ['Temperature', 'Salinity', 'Currents', 'SSH'],
          region: 'Arabian Sea & Bay of Bengal',
          time_coverage: '2015 – Present',
          resolution: '0.04° (~4.2km) • 32 S-Levels',
          status: 'Online',
          protocol: 'NetCDF',
        },
        {
          id: 'nemo_global',
          name: 'NEMO Global Ocean Circulation Engine',
          provider: 'Copernicus Marine / CMEMS',
          type: 'Model',
          variables: ['Temperature', 'Salinity', 'Mixed Layer Depth'],
          region: 'Global',
          time_coverage: '2000 – Present',
          resolution: '0.25° (~28km) • 75 Depth Levels',
          status: 'Online',
          protocol: 'WMS',
        },
        {
          id: 'gebco_2023',
          name: 'GEBCO High-Resolution Bathymetric Grid',
          provider: 'GEBCO / BODC',
          type: 'Bathymetry',
          variables: ['Seafloor Depth', 'Elevation'],
          region: 'Global Oceans',
          time_coverage: '2023 Release',
          resolution: '15 Arc-Second (~450m)',
          status: 'Online',
          protocol: 'WMS',
        },
        {
          id: 'incois_gliders',
          name: 'INCOIS Autonomous Underwater Glider Transects',
          provider: 'INCOIS / NIOT',
          type: 'Observation',
          variables: ['Temperature', 'Salinity', 'Dissolved Oxygen', 'Chlorophyll'],
          region: 'Bay of Bengal & Equatorial Channel',
          time_coverage: '2019 – Present',
          resolution: 'High-Density Sawtooth',
          status: 'Online',
          protocol: 'ERDDAP',
        },
        {
          id: 'omni_buoys',
          name: 'OMNI / RAMA Deep-Sea Moored Buoys',
          provider: 'NIOT / INCOIS',
          type: 'Observation',
          variables: ['SST', 'Salinity', 'Wind Speed', 'Air Pressure', 'Radiation'],
          region: 'Tropical Indian Ocean',
          time_coverage: '1997 – Present',
          resolution: 'Hourly Time-Series',
          status: 'Online',
          protocol: 'Satellite Relay',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [typeFilter, protocolFilter, search]);

  const handleInspect = (item: DatasetItem) => {
    setSelectedDataset(item);
    setIsDrawerOpen(true);
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">
              <Database className="w-5 h-5 text-[var(--primary)]" />
              Ocean Data Catalog
            </h1>
            <Badge variant="success">FastAPI Synced</Badge>
          </div>
          <p className="page-subtitle">
            Registered in-situ observation repositories, numerical reanalysis models, and high-resolution bathymetric grids.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                fontWeight: viewMode === 'grid' ? 600 : 500,
                boxShadow: viewMode === 'grid' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                fontWeight: viewMode === 'table' ? 600 : 500,
                boxShadow: viewMode === 'table' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Link to="/explorer">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
              Open 3D Globe
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Search datasets by title, provider, variables, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
          />
        </div>

        <div style={{ width: '190px' }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              { value: 'Observation', label: 'In-Situ Observations' },
              { value: 'Model', label: 'Numerical Models' },
              { value: 'Bathymetry', label: 'Bathymetry & Grids' },
            ]}
          />
        </div>

        <div style={{ width: '160px' }}>
          <Select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Protocols' },
              { value: 'ERDDAP', label: 'ERDDAP' },
              { value: 'OPeNDAP', label: 'OPeNDAP' },
              { value: 'NetCDF', label: 'NetCDF-4' },
              { value: 'WMS', label: 'OGC WMS' },
            ]}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          iconOnly
          onClick={fetchDatasets}
          title="Refresh Catalog"
          aria-label="Refresh Catalog"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* View Mode: Cards Grid */}
      {viewMode === 'grid' && (
        <div className="grid-cols-3">
          {datasets.map((item) => (
            <div
              key={item.id}
              className="ui-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      {item.provider}
                    </span>
                  </div>
                  <Badge variant={item.type === 'Observation' ? 'success' : item.type === 'Model' ? 'primary' : 'neutral'}>
                    {item.type}
                  </Badge>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {item.variables.map((v, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-secondary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div>Resolution: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.resolution}</strong></div>
                  <div>Coverage: <span style={{ color: 'var(--text-secondary)' }}>{item.region}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => handleInspect(item)}
                  style={{ flex: 1 }}
                >
                  Inspect
                </Button>
                <Link to={`/explorer?dataset=${item.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" iconOnly title="Open on 3D Globe" aria-label="Open on 3D Globe">
                    <Compass className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode: Scientific Table */}
      {viewMode === 'table' && (
        <div className="table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead>Region Coverage</TableHead>
                <TableHead>Resolution</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{item.name}</div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.time_coverage}</span>
                  </TableCell>
                  <TableCell style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.provider}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'Observation' ? 'success' : item.type === 'Model' ? 'primary' : 'neutral'}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.variables.map((v, i) => (
                        <span key={i} style={{ fontSize: '10px', padding: '1px 5px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-secondary)', color: 'var(--text-secondary)' }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.region}</TableCell>
                  <TableCell style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.resolution}</TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ fontSize: '10px' }}>
                      {item.protocol || 'ERDDAP'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Button variant="outline" size="sm" onClick={() => handleInspect(item)}>
                        Inspect
                      </Button>
                      <Link to={`/explorer?dataset=${item.id}`}>
                        <Button variant="ghost" size="sm" iconOnly title="Open in 3D Explorer" aria-label="Open in 3D Explorer">
                          <Compass className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={1}
              totalRecords={datasets.length}
              pageSize={10}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* Slide-out Dataset Detail Drawer */}
      <DatasetDetailDrawer
        dataset={selectedDataset}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

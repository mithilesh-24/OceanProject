import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Database, CheckCircle2, ShieldCheck, Layers, FileCode } from 'lucide-react';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { useToast } from '../context/ToastContext';

export const ExportView: React.FC = () => {
  const { toast } = useToast();
  const [format, setFormat] = useState('csv');
  const [dataset, setDataset] = useState('argo');
  const [depthRange, setDepthRange] = useState('0-500');

  const handleExport = () => {
    toast.success('Extraction Queued', `Generating ${format.toUpperCase()} archive for ${dataset.toUpperCase()} (${depthRange}m depth layer).`);
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">
            <Download className="w-5 h-5 text-[var(--primary)]" />
            Scientific Data Export & Extraction
          </h1>
          <p className="page-subtitle">
            Extract quality-controlled ocean observations, model comparison difference grids, and error statistics in CF-compliant formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">High-Throughput Streaming</Badge>
        </div>
      </div>

      {/* Export Configuration Card */}
      <div className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Export Query Configuration
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select target dataset, depth layers, and output format.
            </p>
          </div>
          <Badge variant="primary">CF-1.8 Compliant</Badge>
        </div>

        <div className="grid-cols-3">
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target Dataset / Source
            </label>
            <Select
              size="md"
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              options={[
                { value: 'argo', label: 'INCOIS Argo Float Profiles (CTD)' },
                { value: 'hycom', label: 'HYCOM 1/12° Model Reanalysis Grids' },
                { value: 'roms', label: 'ROMS Coastal Modeling Output' },
                { value: 'comparison', label: 'Model vs In-Situ Difference Pairs' },
              ]}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Vertical Depth Slice
            </label>
            <Select
              size="md"
              value={depthRange}
              onChange={(e) => setDepthRange(e.target.value)}
              options={[
                { value: '0-50', label: 'Surface Mixed Layer (0 – 50 m)' },
                { value: '0-500', label: 'Upper Thermocline (0 – 500 m)' },
                { value: '0-2000', label: 'Full In-Situ Water Column (0 – 2,000 m)' },
              ]}
            />
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Output Data Format
            </label>
            <Select
              size="md"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={[
                { value: 'csv', label: 'CSV (Comma-Separated Values Table)' },
                { value: 'json', label: 'GeoJSON (Spatial Feature Collection)' },
                { value: 'netcdf', label: 'NetCDF-4 (CF-1.8 Multi-Dimensional)' },
                { value: 'parquet', label: 'Apache Parquet (High Performance Columnar)' },
              ]}
            />
          </div>
        </div>

        <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck className="w-5 h-5 text-[var(--success)] shrink-0" />
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
            <strong>Integrity Guarantee:</strong> Export files embed CF metadata conventions, WMO platform identifiers, and quality flags (QC-1 verified).
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '4px' }}>
          <Button
            variant="primary"
            size="md"
            leftIcon={format === 'csv' ? <FileSpreadsheet className="w-4 h-4" /> : format === 'json' ? <FileJson className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
            onClick={handleExport}
          >
            Download Filtered Dataset ({format.toUpperCase()})
          </Button>
        </div>
      </div>
    </div>
  );
};

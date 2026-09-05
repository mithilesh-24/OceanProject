import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, FileCode, ShieldCheck, FileText, CheckCircle2, RefreshCw, Layers, Copy, Check } from 'lucide-react';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { useToast } from '../context/ToastContext';
import { api } from '../services/apiClient';

export const ExportView: React.FC = () => {
  const { toast } = useToast();
  const [format, setFormat] = useState('csv');
  const [dataSource, setDataSource] = useState('argo');
  const [variable, setVariable] = useState('temperature');
  const [depthSlice, setDepthSlice] = useState('0');
  const [region, setRegion] = useState('indian_ocean');
  const [latMin, setLatMin] = useState('-35.0');
  const [latMax, setLatMax] = useState('25.0');
  const [lonMin, setLonMin] = useState('40.0');
  const [lonMax, setLonMax] = useState('110.0');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<any>(null);

  // Bulletin Generator States
  const [bulletinModel, setBulletinModel] = useState('hycom');
  const [bulletinData, setBulletinData] = useState<any>(null);
  const [isGeneratingBulletin, setIsGeneratingBulletin] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.exportOceanData({
        export_format: format,
        data_source: dataSource,
        variable: variable,
        region: region,
        depth_m: parseFloat(depthSlice),
        lat_min: parseFloat(latMin),
        lat_max: parseFloat(latMax),
        lon_min: parseFloat(lonMin),
        lon_max: parseFloat(lonMax)
      });
      setLastExport(res);

      // Trigger actual browser download
      let blob: Blob;
      if (format === 'csv') {
        blob = new Blob([res.data_payload], { type: 'text/csv;charset=utf-8;' });
      } else {
        blob = new Blob([JSON.stringify(res.data_payload, null, 2)], { type: 'application/json;charset=utf-8;' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Export Successful', `Downloaded ${res.filename} (${res.record_count} records).`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export Failed', 'Unable to generate dataset extract.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateBulletin = async () => {
    setIsGeneratingBulletin(true);
    try {
      const res = await api.exportScientificBulletin({
        title: `Indian Ocean Hydrodynamic Validation Bulletin (${bulletinModel.toUpperCase()})`,
        model: bulletinModel,
        variable: variable,
        region: region
      });
      setBulletinData(res);
      toast.success('Bulletin Generated', `Created official validation bulletin for ${bulletinModel.toUpperCase()}.`);
    } catch (err) {
      console.error('Bulletin generation error:', err);
    } finally {
      setIsGeneratingBulletin(false);
    }
  };

  const handleCopyChecksum = (chk: string) => {
    navigator.clipboard.writeText(chk);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Download className="w-5 h-5 text-[var(--primary)]" />
              Multi-Format Data &amp; Report Export Engine
            </h1>
            <Badge variant="primary">Phase 17</Badge>
          </div>
          <p className="page-subtitle">
            Extract CF-compliant ocean observations (CSV, GeoJSON, JSON), download difference grids, and generate scientific reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">CF-1.8 &amp; OGC Compliant</Badge>
        </div>
      </div>

      {/* Main Grid: Data Export Engine + Scientific Bulletin Generator */}
      <div className="grid-cols-2">
        {/* Left Card: Structured Data Extractor */}
        <div className="ui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Hydrographic Data Slicer &amp; Extractor
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Extract in-situ observations and model slices directly into analytical formats.
              </p>
            </div>
            <Badge variant="primary">Streaming Fast</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Data Source Platform
              </label>
              <Select
                size="sm"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                options={[
                  { value: 'argo', label: 'INCOIS Argo CTD Floats' },
                  { value: 'hycom', label: 'HYCOM 1/12° Global Hydrodynamics' },
                  { value: 'roms', label: 'ROMS 1/24° Coastal Model' },
                  { value: 'nemo', label: 'NEMO Ocean 1/12° Global' },
                  { value: 'comparison', label: 'Model vs In-Situ Difference Pairs' }
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Target Variable
              </label>
              <Select
                size="sm"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                options={[
                  { value: 'temperature', label: 'Temperature (°C)' },
                  { value: 'salinity', label: 'Practical Salinity (PSU)' },
                  { value: 'dissolved_o2', label: 'Dissolved Oxygen (μmol/kg)' }
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Depth Layer (Meters)
              </label>
              <Select
                size="sm"
                value={depthSlice}
                onChange={(e) => setDepthSlice(e.target.value)}
                options={[
                  { value: '0', label: 'Surface (0 m)' },
                  { value: '50', label: 'Mixed Layer (50 m)' },
                  { value: '100', label: 'Upper Thermocline (100 m)' },
                  { value: '500', label: 'Intermediate Water (500 m)' },
                  { value: '1000', label: 'Deep Ocean (1,000 m)' }
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Output File Format
              </label>
              <Select
                size="sm"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={[
                  { value: 'csv', label: 'CSV Table (.csv)' },
                  { value: 'geojson', label: 'GeoJSON FeatureCollection (.geojson)' },
                  { value: 'json', label: 'Structured JSON (.json)' }
                ]}
              />
            </div>
          </div>

          {/* Spatial Bounding Box */}
          <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Spatial Bounds (Lat/Lon Degrees)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lat Min</span>
                <Input size="sm" value={latMin} onChange={(e) => setLatMin(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lat Max</span>
                <Input size="sm" value={latMax} onChange={(e) => setLatMax(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lon Min</span>
                <Input size="sm" value={lonMin} onChange={(e) => setLonMin(e.target.value)} />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lon Max</span>
                <Input size="sm" value={lonMax} onChange={(e) => setLonMax(e.target.value)} />
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />}
            onClick={handleDataExport}
            disabled={isExporting}
          >
            {isExporting ? 'Generating Extract...' : `Download ${dataSource.toUpperCase()} (${format.toUpperCase()})`}
          </Button>

          {lastExport && (
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Generated File: {lastExport.filename}</span>
                <Badge variant="success">{lastExport.record_count} Records</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>SHA-256: {lastExport.checksum_sha256.slice(0, 16)}...</span>
                <button
                  onClick={() => handleCopyChecksum(lastExport.checksum_sha256)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  {copiedChecksum ? <Check className="w-3 h-3 text-emerald" /> : <Copy className="w-3 h-3" />}
                  {copiedChecksum ? 'Copied' : 'Copy Hash'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Automated Scientific Bulletin Report */}
        <div className="ui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Automated Scientific Bulletin Generator
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Compile peer-review grade validation summaries, Taylor scores, and MHW warnings.
                </p>
              </div>
              <Badge variant="primary">Official INCOIS Template</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Target Numerical Model
                </label>
                <Select
                  size="sm"
                  value={bulletinModel}
                  onChange={(e) => setBulletinModel(e.target.value)}
                  options={[
                    { value: 'hycom', label: 'HYCOM Global 1/12°' },
                    { value: 'roms', label: 'ROMS Regional 1/24°' },
                    { value: 'nemo', label: 'NEMO Ocean 1/12°' }
                  ]}
                />
              </div>
              <div style={{ marginTop: '18px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBulletin ? 'animate-spin' : ''}`} />}
                  onClick={handleGenerateBulletin}
                >
                  Compile Bulletin
                </Button>
              </div>
            </div>

            {/* Bulletin Preview Box */}
            {bulletinData ? (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{bulletinData.title}</h4>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{bulletinData.generated_at}</span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {bulletinData.executive_summary}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '4px' }}>
                  <div style={{ padding: '4px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Skill Score</span>
                    <span style={{ fontWeight: 700, color: '#10b981', display: 'block' }}>{bulletinData.key_performance_metrics?.skill_score_pct}%</span>
                  </div>
                  <div style={{ padding: '4px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Corr (R)</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8', display: 'block' }}>{bulletinData.key_performance_metrics?.correlation_coefficient}</span>
                  </div>
                  <div style={{ padding: '4px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Mean Bias</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b', display: 'block' }}>{bulletinData.key_performance_metrics?.domain_mean_bias}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '16px', padding: '24px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '12px' }}>
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted" />
                Click <strong>Compile Bulletin</strong> above to synthesize the latest hydrographic report.
              </div>
            )}
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="w-4 h-4 text-emerald shrink-0" />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Compliant with INCOIS Open-Access Data Publishing Protocol.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

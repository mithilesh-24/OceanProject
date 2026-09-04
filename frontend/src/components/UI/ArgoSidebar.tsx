import React, { useState } from 'react';
import { 
  Sliders, RefreshCw, AlertCircle, Database, Calendar, 
  Thermometer, Droplets, ArrowDown, ChevronLeft, ChevronRight, Activity 
} from 'lucide-react';
import { ArgoColorVariable, ArgoFilterOptions } from '../../types/argo';
import { Button } from './Button';
import { Badge } from './Badge';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { Input } from './Input';

interface ArgoSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  filters: ArgoFilterOptions;
  onApplyFilters: (newFilters: ArgoFilterOptions) => void;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

export const ArgoSidebar: React.FC<ArgoSidebarProps> = ({
  isOpen,
  onToggleOpen,
  filters,
  onApplyFilters,
  totalCount,
  loading,
  error,
}) => {
  const [localFilters, setLocalFilters] = useState<ArgoFilterOptions>(filters);

  const handleCheckboxChange = (key: keyof ArgoFilterOptions['variables']) => {
    setLocalFilters((prev) => ({
      ...prev,
      variables: {
        ...prev.variables,
        [key]: !prev.variables[key],
      },
    }));
  };

  const handleColorVarChange = (colorVar: ArgoColorVariable) => {
    setLocalFilters((prev) => ({
      ...prev,
      colorByVariable: colorVar,
    }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const applyPreset = (from: string, to: string, minD: number, maxD: number) => {
    const updated = {
      ...localFilters,
      dateFrom: from,
      dateTo: to,
      minDepth: minD,
      maxDepth: maxD,
    };
    setLocalFilters(updated);
    onApplyFilters(updated);
  };

  if (!isOpen) {
    return (
      <button
        className="argo-toggle-btn"
        onClick={onToggleOpen}
        title="Open Argo Data Controls"
      >
        <Database className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">ARGO IN-SITU</span>
        <Badge variant="primary">{totalCount}</Badge>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>
    );
  }

  return (
    <aside className="argo-sidebar">
      {/* Header */}
      <div className="argo-header bg-[var(--bg-surface-secondary)]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[var(--primary)]" />
          <span className="font-bold text-xs tracking-wide text-[var(--text-primary)]">
            INCOIS ARGO IN-SITU
          </span>
          <Badge variant="success" dot>LIVE GATEWAY</Badge>
        </div>
        <button className="argo-close-btn" onClick={onToggleOpen} title="Collapse Sidebar">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleApply} className="argo-body">
        {/* Variables Section */}
        <div className="argo-section">
          <div className="argo-section-title">
            <Sliders className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Observed Variables</span>
          </div>

          <div className="space-y-1 mt-1">
            <Checkbox
              label="Temperature (°C)"
              checked={localFilters.variables.temperature}
              onChange={() => handleCheckboxChange('temperature')}
              badge={<span className="text-rose-500 font-mono text-[10px]">TEMP</span>}
            />
            <Checkbox
              label="Salinity (PSAL)"
              checked={localFilters.variables.salinity}
              onChange={() => handleCheckboxChange('salinity')}
              badge={<span className="text-teal-500 font-mono text-[10px]">PSAL</span>}
            />
            <Checkbox
              label="Pressure / Depth (dbar)"
              checked={localFilters.variables.pressure}
              onChange={() => handleCheckboxChange('pressure')}
              badge={<span className="text-sky-500 font-mono text-[10px]">PRES</span>}
            />
          </div>
        </div>

        {/* Color Coding Section */}
        <div className="argo-section border-t border-[var(--border-subtle)] pt-2.5">
          <div className="argo-section-title">
            <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>3D Point Color Scheme</span>
          </div>

          <div className="space-y-1 mt-1">
            <Radio
              name="argo_color_var"
              label="Color by Sea Temperature"
              checked={localFilters.colorByVariable === 'temperature'}
              onChange={() => handleColorVarChange('temperature')}
            />
            <Radio
              name="argo_color_var"
              label="Color by Practical Salinity"
              checked={localFilters.colorByVariable === 'salinity'}
              onChange={() => handleColorVarChange('salinity')}
            />
            <Radio
              name="argo_color_var"
              label="Color by Pressure / Depth"
              checked={localFilters.colorByVariable === 'pressure'}
              onChange={() => handleColorVarChange('pressure')}
            />
          </div>
        </div>

        {/* Temporal Constraints */}
        <div className="argo-section border-t border-[var(--border-subtle)] pt-2.5">
          <div className="argo-section-title">
            <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Date Range</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input
              type="date"
              label="From"
              value={localFilters.dateFrom}
              onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value })}
            />
            <Input
              type="date"
              label="To"
              value={localFilters.dateTo}
              onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* Depth Band Constraints */}
        <div className="argo-section border-t border-[var(--border-subtle)] pt-2.5">
          <div className="argo-section-title">
            <ArrowDown className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Vertical Depth Range (Meters)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Input
              type="number"
              label="Min (m)"
              min={0}
              max={2000}
              value={localFilters.minDepth ?? 0}
              onChange={(e) => setLocalFilters({ ...localFilters, minDepth: Number(e.target.value) })}
            />
            <Input
              type="number"
              label="Max (m)"
              min={0}
              max={2000}
              value={localFilters.maxDepth ?? 500}
              onChange={(e) => setLocalFilters({ ...localFilters, maxDepth: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="argo-section border-t border-[var(--border-subtle)] pt-2.5">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Quick Filter Presets
          </span>
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('2024-01-01', '2024-01-10', 0, 500)}
            >
              Surface (500m)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('2024-01-01', '2024-01-31', 0, 1000)}
            >
              Mid (1000m)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset('2024-01-01', '2024-06-30', 0, 2000)}
            >
              Deep (2000m)
            </Button>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
          {error && (
            <div className="p-2 text-xs bg-[var(--error-subtle)] text-[var(--error)] border border-[var(--error)]/20 rounded flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="w-full"
          >
            Apply Filters
          </Button>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
            <span>Rendered Observations:</span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{totalCount}</span>
          </div>
        </div>
      </form>
    </aside>
  );
};

import React from 'react';
import { X, Navigation, Thermometer, Droplets, ArrowDown, Calendar, Info } from 'lucide-react';
import { ArgoObservation } from '../../types/argo';
import { Badge } from './Badge';
import { Button } from './Button';

interface ArgoFloatCardProps {
  observation: ArgoObservation;
  onClose: () => void;
  onFlyTo?: () => void;
  onBookmark?: () => void;
  onViewDetails?: () => void;
}

export const ArgoFloatCard: React.FC<ArgoFloatCardProps> = ({ observation, onClose, onFlyTo, onBookmark, onViewDetails }) => {
  const formattedDate = new Date(observation.time).toUTCString();

  return (
    <div className="argo-float-card animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[var(--primary-subtle)] text-[var(--primary)]">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-mono font-bold text-xs text-[var(--text-primary)]">
                FLOAT {observation.platformNumber}
              </h4>
              <Badge variant="primary">Cycle #{observation.cycleNumber}</Badge>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Apex Profiling Float</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-surface-hover)]"
          aria-label="Close float card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3">
        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>{formattedDate}</span>
        </div>

        {/* Coordinates */}
        <div className="flex items-center justify-between p-2 bg-[var(--bg-surface-secondary)] rounded border border-[var(--border-subtle)] text-xs font-mono">
          <span className="text-[var(--text-muted)]">Coordinates</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {observation.latitude.toFixed(3)}°, {observation.longitude.toFixed(3)}°
          </span>
        </div>

        {/* Oceanographic Parameters Grid */}
        <div className="argo-param-grid">
          {/* Temperature */}
          <div className="argo-param-box">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Thermometer className="w-3.5 h-3.5" />
              <span className="argo-param-label">Temperature</span>
            </div>
            <div className="argo-param-value">
              {observation.temperature !== null ? `${observation.temperature.toFixed(2)} °C` : 'N/A'}
            </div>
          </div>

          {/* Salinity */}
          <div className="argo-param-box">
            <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
              <Droplets className="w-3.5 h-3.5" />
              <span className="argo-param-label">Salinity</span>
            </div>
            <div className="argo-param-value">
              {observation.salinity !== null ? `${observation.salinity.toFixed(2)} PSU` : 'N/A'}
            </div>
          </div>

          {/* Pressure / Depth */}
          <div className="argo-param-box">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="argo-param-label">Depth (calc)</span>
            </div>
            <div className="argo-param-value">
              {observation.depth !== null ? `${observation.depth.toFixed(1)} m` : 'N/A'}
            </div>
          </div>

          {/* Pressure dbar */}
          <div className="argo-param-box">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Navigation className="w-3.5 h-3.5" />
              <span className="argo-param-label">Pressure</span>
            </div>
            <div className="argo-param-value">
              {observation.pressure !== null ? `${observation.pressure.toFixed(1)} dbar` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          {onViewDetails && (
            <Button
              variant="primary"
              size="sm"
              onClick={onViewDetails}
              className="w-full"
            >
              Open Full CTD Profile & Telemetry
            </Button>
          )}
          {onFlyTo && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFlyTo}
              leftIcon={<Navigation className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Center Camera on Float
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

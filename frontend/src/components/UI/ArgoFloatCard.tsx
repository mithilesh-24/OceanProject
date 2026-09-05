import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Navigation, Thermometer, Droplets, ArrowDown, Calendar, Info, GripHorizontal, Move } from 'lucide-react';
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

export const ArgoFloatCard: React.FC<ArgoFloatCardProps> = ({
  observation,
  onClose,
  onFlyTo,
  onBookmark,
  onViewDetails,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // References for drag calculation
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Initialize position on first mount (top-right, avoiding top bar)
  useEffect(() => {
    if (!position && typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 340);
      const defaultY = 68;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Keep inside viewport bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev || !cardRef.current) return prev;
        const width = cardRef.current.offsetWidth || 320;
        const height = cardRef.current.offsetHeight || 380;
        return {
          x: Math.min(Math.max(10, prev.x), Math.max(10, window.innerWidth - width - 10)),
          y: Math.min(Math.max(10, prev.y), Math.max(10, window.innerHeight - height - 10)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only allow dragging on header, not on buttons/inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    e.preventDefault();
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };

    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;
      const cardWidth = cardRef.current?.offsetWidth || 320;
      const cardHeight = cardRef.current?.offsetHeight || 380;

      const newX = Math.min(
        Math.max(10, dragRef.current.initialX + deltaX),
        Math.max(10, window.innerWidth - cardWidth - 10)
      );
      const newY = Math.min(
        Math.max(10, dragRef.current.initialY + deltaY),
        Math.max(10, window.innerHeight - cardHeight - 10)
      );

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Touch Drag Handlers for Tablets / Touchscreens
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    if (e.touches.length !== 1 || !cardRef.current) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();

    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };

    setIsDragging(true);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      moveEvent.preventDefault();
      const moveTouch = moveEvent.touches[0];
      const deltaX = moveTouch.clientX - dragRef.current.startX;
      const deltaY = moveTouch.clientY - dragRef.current.startY;
      const cardWidth = cardRef.current?.offsetWidth || 320;
      const cardHeight = cardRef.current?.offsetHeight || 380;

      const newX = Math.min(
        Math.max(10, dragRef.current.initialX + deltaX),
        Math.max(10, window.innerWidth - cardWidth - 10)
      );
      const newY = Math.min(
        Math.max(10, dragRef.current.initialY + deltaY),
        Math.max(10, window.innerHeight - cardHeight - 10)
      );

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }, []);

  const formattedDate = new Date(observation.time).toUTCString();

  const cardStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
        zIndex: 1000,
      }
    : {
        position: 'fixed',
        top: '68px',
        right: '18px',
        zIndex: 1000,
      };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      className={`argo-float-card ${
        isDragging ? 'cursor-grabbing shadow-2xl ring-2 ring-cyan-500/50 select-none scale-[1.01]' : ''
      } transition-shadow duration-150`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex items-center justify-between cursor-grab select-none group"
        title="Drag anywhere on header to move card"
      >
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

        {/* Header Actions & Drag Grip */}
        <div className="flex items-center gap-1.5">
          <div
            className="p-1 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] opacity-60 group-hover:opacity-100 transition-opacity"
            title="Drag to move card"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-surface-hover)] bg-transparent border-0 cursor-pointer transition-colors"
            aria-label="Close float card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-3 bg-[var(--backdrop-panel)]">
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

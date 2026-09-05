import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, X, Bookmark, Globe, Compass, GripHorizontal } from 'lucide-react';
import { CoordinateInfo, LocationDetails } from '../../types';
import { formatCoordinate, formatAltitude } from '../../utils/formatters';

interface LocationInfoCardProps {
  locationInfo: CoordinateInfo & { details?: LocationDetails; addressName?: string };
  onClose: () => void;
  onBookmark: () => void;
}

export const LocationInfoCard: React.FC<LocationInfoCardProps> = ({
  locationInfo,
  onClose,
  onBookmark,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (!position && typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 340);
      const defaultY = 68;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
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
      const cardHeight = cardRef.current?.offsetHeight || 300;

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
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
      const cardHeight = cardRef.current?.offsetHeight || 300;

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

  const formattedLat = formatCoordinate(locationInfo.latitude, true);
  const formattedLon = formatCoordinate(locationInfo.longitude, false);
  const formattedAlt = formatAltitude(locationInfo.cameraAltitude);

  const titleName = locationInfo.details?.name || locationInfo.addressName || 'Geographic Marker';
  const categoryLabel = locationInfo.details?.category ? locationInfo.details.category.toUpperCase() : 'LOCATION';

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
      className={`location-card glass-panel ${
        isDragging ? 'cursor-grabbing shadow-2xl ring-2 ring-blue-500/50 select-none scale-[1.01]' : ''
      } transition-shadow duration-150`}
    >
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="flex items-center justify-between mb-2 cursor-grab select-none group pb-1.5 border-b border-white/10"
        title="Drag anywhere on header to move card"
      >
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
          <Globe className="w-4 h-4" />
          <span>{categoryLabel} INSPECTOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="p-1 text-gray-400 group-hover:text-gray-200 opacity-60 group-hover:opacity-100 transition-opacity"
            title="Drag to move card"
          >
            <GripHorizontal className="w-3.5 h-3.5" />
          </div>
          <button
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 bg-transparent border-0 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close location card"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-sm font-bold text-white mb-2 leading-tight">
        {titleName}
      </div>

      {locationInfo.details?.country && (
        <div className="text-xs text-blue-300 font-medium mb-2">
          Country: {locationInfo.details.country}
        </div>
      )}

      <div className="space-y-1.5 font-mono text-xs text-gray-300 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Latitude:</span>
          <span className="text-white font-medium">{formattedLat}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Longitude:</span>
          <span className="text-white font-medium">{formattedLon}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Elevation:</span>
          <span className="text-white font-medium">{locationInfo.height} m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Camera Alt:</span>
          <span className="text-white font-medium">{formattedAlt}</span>
        </div>
      </div>

      <button
        className="glass-button w-full py-1.5 text-xs font-semibold gap-1.5 text-blue-300 cursor-pointer hover:bg-blue-600/20 transition-colors"
        onClick={onBookmark}
      >
        <Bookmark className="w-3.5 h-3.5" />
        Bookmark Position
      </button>
    </div>
  );
};

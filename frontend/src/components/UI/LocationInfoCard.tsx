import React from 'react';
import { MapPin, X, Bookmark, Globe, Compass } from 'lucide-react';
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
  const formattedLat = formatCoordinate(locationInfo.latitude, true);
  const formattedLon = formatCoordinate(locationInfo.longitude, false);
  const formattedAlt = formatAltitude(locationInfo.cameraAltitude);

  const titleName = locationInfo.details?.name || locationInfo.addressName || 'Geographic Marker';
  const categoryLabel = locationInfo.details?.category ? locationInfo.details.category.toUpperCase() : 'LOCATION';

  return (
    <div className="location-card glass-panel">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
          <Globe className="w-4 h-4" />
          <span>{categoryLabel} INSPECTOR</span>
        </div>
        <button className="glass-button p-1" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </button>
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
        className="glass-button w-full py-1.5 text-xs font-semibold gap-1.5 text-blue-300"
        onClick={onBookmark}
      >
        <Bookmark className="w-3.5 h-3.5" />
        Bookmark Position
      </button>
    </div>
  );
};

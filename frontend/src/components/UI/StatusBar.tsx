import React from 'react';
import { CoordinateInfo } from '../../types';
import { formatCoordinate, formatAltitude } from '../../utils/formatters';

interface StatusBarProps {
  coordInfo: CoordinateInfo;
}

export const StatusBar: React.FC<StatusBarProps> = ({ coordInfo }) => {
  // Calculate dynamic scale bar length based on camera altitude
  const getScaleInfo = (altitude: number) => {
    if (altitude > 10000000) return { label: '4,000 km', width: 90 };
    if (altitude > 5000000) return { label: '2,000 km', width: 80 };
    if (altitude > 2000000) return { label: '1,000 km', width: 75 };
    if (altitude > 800000) return { label: '500 km', width: 70 };
    if (altitude > 300000) return { label: '200 km', width: 65 };
    if (altitude > 100000) return { label: '100 km', width: 60 };
    if (altitude > 30000) return { label: '30 km', width: 55 };
    if (altitude > 10000) return { label: '10 km', width: 50 };
    if (altitude > 3000) return { label: '3 km', width: 45 };
    if (altitude > 1000) return { label: '1 km', width: 40 };
    return { label: '200 m', width: 35 };
  };

  const scaleInfo = getScaleInfo(coordInfo.cameraAltitude);

  const formattedLat = formatCoordinate(coordInfo.latitude, true);
  const formattedLon = formatCoordinate(coordInfo.longitude, false);
  const formattedAlt = formatAltitude(coordInfo.cameraAltitude);

  return (
    <footer className="status-bar">
      {/* Left side: Coordinates & Altitude */}
      <div className="status-left">
        <div className="status-item">
          <span className="status-label">Lat:</span>
          <span className="status-val">{formattedLat} ({coordInfo.latitude.toFixed(4)}°)</span>
        </div>

        <div className="status-item">
          <span className="status-label">Lon:</span>
          <span className="status-val">{formattedLon} ({coordInfo.longitude.toFixed(4)}°)</span>
        </div>

        <div className="status-item">
          <span className="status-label">Camera:</span>
          <span className="status-val">{formattedAlt}</span>
        </div>

        <div className="status-item">
          <span className="status-label">Elev:</span>
          <span className="status-val">{coordInfo.height} m</span>
        </div>
      </div>

      {/* Right side: Pitch, Heading & Dynamic Scale Bar */}
      <div className="status-right">
        <div className="status-item">
          <span className="status-label">Heading:</span>
          <span className="status-val">{coordInfo.heading}°</span>
        </div>

        <div className="status-item">
          <span className="status-label">Pitch:</span>
          <span className="status-val">{coordInfo.pitch}°</span>
        </div>

        {/* Dynamic Scale Bar */}
        <div className="scale-bar-container">
          <span className="status-val">{scaleInfo.label}</span>
          <div className="scale-line" style={{ width: `${scaleInfo.width}px` }} />
        </div>
      </div>
    </footer>
  );
};

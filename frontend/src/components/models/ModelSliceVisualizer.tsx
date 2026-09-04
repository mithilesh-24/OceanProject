import React, { useState, useEffect, useRef } from 'react';
import { Layers, Activity, Eye, Compass, RefreshCw, ZoomIn, Info, Play, Pause } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { ModelSliceData, api } from '../../services/apiClient';

interface ModelSliceVisualizerProps {
  modelId: string;
  initialVariable?: string;
  initialDepth?: number;
  onSelectCoordinate?: (lat: number, lon: number) => void;
}

export const ModelSliceVisualizer: React.FC<ModelSliceVisualizerProps> = ({
  modelId,
  initialVariable = 'temperature',
  initialDepth = 0,
  onSelectCoordinate,
}) => {
  const [variable, setVariable] = useState<string>(initialVariable);
  const [depth, setDepth] = useState<number>(initialDepth);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [sliceData, setSliceData] = useState<ModelSliceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<{ lat: number; lon: number; val: number | null; x: number; y: number } | null>(null);
  const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lon: number } | null>({ lat: 14.28, lon: 87.45 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const availableDepths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 500, 1000, 2000];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getModelSlice(modelId, { variable, depth })
      .then((data) => {
        if (isMounted) {
          setSliceData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load slice data:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [modelId, variable, depth]);

  // Render scientific canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sliceData || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const lats = sliceData.latitudes;
    const lons = sliceData.longitudes;
    const grid = sliceData.grid_values;
    const nLat = lats.length;
    const nLon = lons.length;

    const minVal = sliceData.min_value;
    const maxVal = sliceData.max_value;
    const range = maxVal - minVal || 1.0;

    // Helper colormaps
    const getColor = (val: number | null): string => {
      if (val === null) return '#101726'; // Land / No Data mask
      const norm = Math.max(0, Math.min(1, (val - minVal) / range));

      if (variable === 'temperature') {
        // Jet-like ocean thermal colormap (Deep Navy -> Cyan -> Green -> Yellow -> Orange -> Crimson)
        const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 3))));
        const g = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 2))));
        const b = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 1))));
        return `rgb(${r}, ${g}, ${b})`;
      } else if (variable === 'salinity') {
        // Salinity colormap (Teal-to-Purple-to-Amber: Low BoB -> High Arabian)
        const r = Math.round(180 * norm + 20);
        const g = Math.round(200 * (1 - norm * 0.5) + 30);
        const b = Math.round(240 * (1 - norm) + 60);
        return `rgb(${r}, ${g}, ${b})`;
      } else if (variable === 'velocity' || variable === 'currents') {
        // Speed colormap (Electric Cyan to Coral Red)
        const r = Math.round(240 * norm + 20);
        const g = Math.round(180 * (1 - Math.abs(norm - 0.5) * 2) + 40);
        const b = Math.round(255 * (1 - norm) + 40);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // SSH colormap
        const r = Math.round(255 * norm);
        const g = Math.round(200 * Math.sin(norm * Math.PI));
        const b = Math.round(255 * (1 - norm));
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    const cellW = width / nLon;
    const cellH = height / nLat;

    // Draw bilinear interpolated grid cells
    for (let r = 0; r < nLat; r++) {
      const y = height - (r + 1) * cellH; // Invert Y so latitude 0 is bottom
      for (let c = 0; c < nLon; c++) {
        const x = c * cellW;
        const val = grid[r][c];

        ctx.fillStyle = getColor(val);
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);

        // Coastline border highlight for land
        if (val === null) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.fillRect(x, y, cellW, cellH);
        }
      }
    }

    // Draw Grid Lines & Lat/Lon Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let c = 0; c < nLon; c += 2) {
      const x = c * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let r = 0; r < nLat; r += 2) {
      const y = height - r * cellH;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render Ocean Current Vectors
    if (showVectors && sliceData.vectors && (variable === 'velocity' || variable === 'currents' || variable === 'temperature')) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;

      sliceData.vectors.forEach((vec) => {
        // Map lat/lon to canvas coordinates
        const minLat = lats[0];
        const maxLat = lats[nLat - 1];
        const minLon = lons[0];
        const maxLon = lons[nLon - 1];

        const x = ((vec.lon - minLon) / (maxLon - minLon)) * width;
        const y = height - ((vec.lat - minLat) / (maxLat - minLat)) * height;

        const arrowLen = Math.min(22, Math.max(6, vec.speed * 18));
        const rad = (vec.angle_deg * Math.PI) / 180;
        const dx = Math.cos(rad) * arrowLen;
        const dy = -Math.sin(rad) * arrowLen;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();

        // Arrow head
        const headLen = 4;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx - headLen * Math.cos(angle - Math.PI / 6), y + dy - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x + dx - headLen * Math.cos(angle + Math.PI / 6), y + dy - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw Selected Coordinate Target Pin
    if (selectedCoord) {
      const minLat = lats[0];
      const maxLat = lats[nLat - 1];
      const minLon = lons[0];
      const maxLon = lons[nLon - 1];

      const sx = ((selectedCoord.lon - minLon) / (maxLon - minLon)) * width;
      const sy = height - ((selectedCoord.lat - minLat) / (maxLat - minLat)) * height;

      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx - 12, sy);
      ctx.lineTo(sx + 12, sy);
      ctx.moveTo(sx, sy - 12);
      ctx.lineTo(sx, sy + 12);
      ctx.stroke();

      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [sliceData, loading, variable, showVectors, selectedCoord]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !sliceData) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nLat = sliceData.latitudes.length;
    const nLon = sliceData.longitudes.length;

    const c = Math.floor((x / canvas.width) * nLon);
    const r = Math.floor(((canvas.height - y) / canvas.height) * nLat);

    if (r >= 0 && r < nLat && c >= 0 && c < nLon) {
      const lat = sliceData.latitudes[r];
      const lon = sliceData.longitudes[c];
      const val = sliceData.grid_values[r][c];
      setHoveredCell({ lat, lon, val, x, y });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoveredCell || hoveredCell.val === null) return;
    setSelectedCoord({ lat: hoveredCell.lat, lon: hoveredCell.lon });
    if (onSelectCoordinate) {
      onSelectCoordinate(hoveredCell.lat, hoveredCell.lon);
    }
  };

  return (
    <div className="ui-card space-y-4" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      {/* Controls Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            2D Horizontal Model Slice Generator
          </h3>
          <Badge variant="primary">{modelId.toUpperCase()}</Badge>
          <Badge variant="neutral">{sliceData?.units || ''}</Badge>
        </div>

        {/* Variable & Depth Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Variable:</span>
            <select
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              className="ui-select"
              style={{ fontSize: '11.5px', padding: '4px 8px', height: '28px', minWidth: '120px' }}
            >
              <option value="temperature">Temperature (°C)</option>
              <option value="salinity">Salinity (PSU)</option>
              <option value="velocity">Current Velocity (m/s)</option>
              <option value="ssh">Sea Surface Height (m)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Depth:</span>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="ui-select"
              style={{ fontSize: '11.5px', padding: '4px 8px', height: '28px', minWidth: '100px' }}
            >
              {availableDepths.map((d) => (
                <option key={d} value={d}>
                  {d === 0 ? '0 m (Surface)' : `${d} m`}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant={showVectors ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowVectors(!showVectors)}
            style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}
          >
            {showVectors ? 'Hide Vectors' : 'Show Vectors'}
          </Button>
        </div>
      </div>

      {/* Interactive Canvas Grid Viewport */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#090d16', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9, 13, 22, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <RefreshCw className="w-6 h-6 text-[var(--primary)] animate-spin" />
            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Generating Backend Model Slice...
            </span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={760}
          height={380}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        />

        {/* Hover Probe Tooltip */}
        {hoveredCell && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(hoveredCell.x + 12, 600)}px`,
              top: `${Math.max(hoveredCell.y - 45, 10)}px`,
              pointerEvents: 'none',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 20,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>Lat: <strong>{hoveredCell.lat.toFixed(1)}°N</strong> | Lon: <strong>{hoveredCell.lon.toFixed(1)}°E</strong></div>
            <div style={{ color: hoveredCell.val !== null ? 'var(--primary)' : '#94a3b8', fontWeight: 700 }}>
              {hoveredCell.val !== null ? `${variable.toUpperCase()}: ${hoveredCell.val} ${sliceData?.units}` : 'Land / Masked'}
            </div>
            <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>Click to probe vertical profile</span>
          </div>
        )}

        {/* Lat/Lon Axes Annotations */}
        <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>
          50°E — Indian Ocean Basin — 95°E
        </div>
        <div style={{ position: 'absolute', top: '6px', right: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>
          0°N (Equator) to 24°N (North BoB)
        </div>
      </div>

      {/* Palette Legend & Probe Info Footer */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '11.5px' }}>
        {/* Colorbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {sliceData?.min_value ?? 0} {sliceData?.units}
          </span>
          <div
            style={{
              width: '180px',
              height: '10px',
              borderRadius: '4px',
              background: variable === 'temperature'
                ? 'linear-gradient(to right, #000080, #00ffff, #00ff00, #ffff00, #ff0000)'
                : (variable === 'salinity'
                  ? 'linear-gradient(to right, #22d3ee, #818cf8, #f59e0b)'
                  : 'linear-gradient(to right, #06b6d4, #10b981, #f43f5e)'),
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {sliceData?.max_value ?? 30} {sliceData?.units}
          </span>
        </div>

        {/* Active Probe Status */}
        {selectedCoord && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <Compass className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Active Point Probe:</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {selectedCoord.lat.toFixed(2)}°N, {selectedCoord.lon.toFixed(2)}°E
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

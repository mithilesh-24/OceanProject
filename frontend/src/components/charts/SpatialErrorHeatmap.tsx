import React, { useEffect, useRef, useState } from 'react';

export interface SpatialGridCell {
  latitude: number;
  longitude: number;
  bias: number;
  rmse: number;
  sample_density: number;
}

interface SpatialErrorHeatmapProps {
  grid: SpatialGridCell[];
  units: string;
  width?: number;
  height?: number;
}

export const SpatialErrorHeatmap: React.FC<SpatialErrorHeatmapProps> = ({
  grid,
  units,
  width = 600,
  height = 360,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metricMode, setMetricMode] = useState<'bias' | 'rmse'>('bias');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Geographic domain bounds (Indian Ocean: Lat -35 to 25, Lon 40 to 110)
    const minLat = -35.0, maxLat = 25.0;
    const minLon = 40.0, maxLon = 110.0;

    const padLeft = 45;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;

    const mapW = width - padLeft - padRight;
    const mapH = height - padTop - padBottom;

    // Draw ocean background
    ctx.fillStyle = '#0a1526';
    ctx.fillRect(padLeft, padTop, mapW, mapH);

    // Compute range for color scaling
    const maxVal = metricMode === 'bias' ? 0.6 : 0.8;

    // Render cells
    grid.forEach((pt) => {
      const x = padLeft + ((pt.longitude - minLon) / (maxLon - minLon)) * mapW;
      const y = padTop + ((maxLat - pt.latitude) / (maxLat - minLat)) * mapH;
      const cellW = (mapW / 20) * 1.05;
      const cellH = (mapH / 18) * 1.05;

      const val = metricMode === 'bias' ? pt.bias : pt.rmse;
      let color = '#38bdf8';

      if (metricMode === 'bias') {
        const norm = Math.max(-1.0, Math.min(1.0, val / maxVal));
        if (norm > 0) {
          const intensity = Math.min(1.0, norm * 1.2);
          color = `rgba(239, 68, 68, ${0.2 + intensity * 0.75})`;
        } else {
          const intensity = Math.min(1.0, Math.abs(norm) * 1.2);
          color = `rgba(56, 189, 248, ${0.2 + intensity * 0.75})`;
        }
      } else {
        const norm = Math.max(0.0, Math.min(1.0, val / maxVal));
        if (norm > 0.6) {
          color = `rgba(244, 63, 94, ${0.3 + norm * 0.65})`;
        } else if (norm > 0.3) {
          color = `rgba(245, 158, 11, ${0.3 + norm * 0.6})`;
        } else {
          color = `rgba(16, 185, 129, ${0.3 + norm * 0.5})`;
        }
      }

      ctx.fillStyle = color;
      ctx.fillRect(x - cellW / 2, y - cellH / 2, cellW, cellH);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(x - cellW / 2, y - cellH / 2, cellW, cellH);
    });

    // Draw grid axes & labels
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, mapW, mapH);

    ctx.fillStyle = '#64748b';
    ctx.font = '9.5px monospace';

    // Latitude labels
    for (let lat = -30; lat <= 20; lat += 10) {
      const y = padTop + ((maxLat - lat) / (maxLat - minLat)) * mapH;
      ctx.fillText(`${lat > 0 ? lat + '°N' : lat === 0 ? 'EQ' : Math.abs(lat) + '°S'}`, 5, y + 3);
    }

    // Longitude labels
    for (let lon = 50; lon <= 100; lon += 15) {
      const x = padLeft + ((lon - minLon) / (maxLon - minLon)) * mapW;
      ctx.fillText(`${lon}°E`, x - 10, height - 12);
    }
  }, [grid, metricMode, width, height]);

  return (
    <div className="chart-wrapper-card" style={{ alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            2D Geographical Error Field Distribution
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Spatial distribution across Indian Ocean Basin ({grid.length} cells)
          </span>
        </div>

        {/* Metric Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setMetricMode('bias')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: metricMode === 'bias' ? 'var(--primary)' : 'transparent',
              color: metricMode === 'bias' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Spatial Bias (M − O)
          </button>
          <button
            onClick={() => setMetricMode('rmse')}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: metricMode === 'rmse' ? 'var(--primary)' : 'transparent',
              color: metricMode === 'rmse' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Spatial RMSE
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
        />
      </div>

      {/* Colormap Legend */}
      <div style={{ width: '100%', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>{metricMode === 'bias' ? `−0.6 ${units} (Cold Bias)` : `0.0 ${units} (Zero Error)`}</span>
        <div
          style={{
            height: '10px',
            width: '180px',
            borderRadius: '4px',
            background:
              metricMode === 'bias'
                ? 'linear-gradient(to right, #38bdf8, #0a1526, #ef4444)'
                : 'linear-gradient(to right, #10b981, #f59e0b, #f43f5e)',
          }}
        />
        <span>{metricMode === 'bias' ? `+0.6 ${units} (Warm Bias)` : `0.8+ ${units} (High Error)`}</span>
      </div>
    </div>
  );
};

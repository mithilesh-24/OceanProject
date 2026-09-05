import React, { useState, useRef, useEffect } from 'react';
import { Layers, Eye, Compass, Info, Maximize2 } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface ModelDifferenceVisualizerProps {
  modelA: string;
  modelB: string;
  variable: string;
  units: string;
  depthM: number;
  latitudes: number[];
  longitudes: number[];
  differenceGrid: (number | null)[][];
  modelAGrid: (number | null)[][];
  modelBGrid: (number | null)[][];
  maxPositiveDiff?: number;
  maxNegativeDiff?: number;
}

export const ModelDifferenceVisualizer: React.FC<ModelDifferenceVisualizerProps> = ({
  modelA,
  modelB,
  variable,
  units,
  depthM,
  latitudes,
  longitudes,
  differenceGrid,
  modelAGrid,
  modelBGrid,
  maxPositiveDiff = 2.0,
  maxNegativeDiff = -2.0,
}) => {
  const [viewMode, setViewMode] = useState<'diff' | 'side_by_side'>('diff');
  const [hoverCoord, setHoverCoord] = useState<{
    lat: number;
    lon: number;
    valA: number | null;
    valB: number | null;
    diff: number | null;
    x: number;
    y: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasARef = useRef<HTMLCanvasElement | null>(null);
  const canvasBRef = useRef<HTMLCanvasElement | null>(null);

  const nLat = latitudes.length;
  const nLon = longitudes.length;

  // Divergent Colormap for Differences: Blue (neg) -> Dark Slate (zero) -> Coral Red (pos)
  const getDiffColor = (diff: number | null, maxAbs: number): string => {
    if (diff === null || isNaN(diff)) return 'rgba(15, 23, 42, 0.2)';
    const clamped = Math.max(-maxAbs, Math.min(maxAbs, diff));
    const normalized = clamped / (maxAbs || 1.0); // -1.0 to +1.0

    if (normalized < 0) {
      // Negative: Model A < Model B (Blue spectrum)
      const t = Math.abs(normalized);
      const r = Math.round(15 + (59 - 15) * (1 - t));
      const g = Math.round(23 + (130 - 23) * t);
      const b = Math.round(42 + (246 - 42) * t);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Positive: Model A > Model B (Coral / Crimson spectrum)
      const t = normalized;
      const r = Math.round(15 + (244 - 15) * t);
      const g = Math.round(23 + (63 - 23) * (1 - t));
      const b = Math.round(42 + (94 - 42) * (1 - t));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Absolute Colormap for Scalar Values (Turbo / Ocean style)
  const getScalarColor = (val: number | null, minVal: number, maxVal: number): string => {
    if (val === null || isNaN(val)) return 'rgba(15, 23, 42, 0.2)';
    const range = maxVal - minVal || 1.0;
    const t = Math.max(0, Math.min(1, (val - minVal) / range));
    // Ocean palette: Deep Navy (0) -> Cyan (0.4) -> Amber (0.8) -> Red (1.0)
    let r = 0, g = 0, b = 0;
    if (t < 0.4) {
      const u = t / 0.4;
      r = Math.round(10 * (1 - u) + 6 * u);
      g = Math.round(30 * (1 - u) + 182 * u);
      b = Math.round(90 * (1 - u) + 212 * u);
    } else if (t < 0.8) {
      const u = (t - 0.4) / 0.4;
      r = Math.round(6 * (1 - u) + 245 * u);
      g = Math.round(182 * (1 - u) + 158 * u);
      b = Math.round(212 * (1 - u) + 11 * u);
    } else {
      const u = (t - 0.8) / 0.2;
      r = Math.round(245 * (1 - u) + 239 * u);
      g = Math.round(158 * (1 - u) + 68 * u);
      b = Math.round(11 * (1 - u) + 68 * u);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const maxAbsDiff = Math.max(Math.abs(maxPositiveDiff), Math.abs(maxNegativeDiff), 0.5);

  // Render main difference canvas
  useEffect(() => {
    if (!canvasRef.current || nLat === 0 || nLon === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cellW = width / nLon;
    const cellH = height / nLat;

    for (let r = 0; r < nLat; r++) {
      // Row 0 is highest latitude (north) at top of canvas
      const canvasRow = nLat - 1 - r;
      for (let c = 0; c < nLon; c++) {
        const diffVal = differenceGrid[r]?.[c] ?? null;
        ctx.fillStyle = getDiffColor(diffVal, maxAbsDiff);
        ctx.fillRect(c * cellW, canvasRow * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw subtle grid lines & coastlines outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= nLon; c += 5) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, height);
      ctx.stroke();
    }
    for (let r = 0; r <= nLat; r += 5) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(width, r * cellH);
      ctx.stroke();
    }
  }, [differenceGrid, nLat, nLon, maxAbsDiff]);

  // Render side-by-side canvases when active
  useEffect(() => {
    if (viewMode !== 'side_by_side') return;

    const renderGrid = (
      canvas: HTMLCanvasElement | null,
      grid: (number | null)[][]
    ) => {
      if (!canvas || nLat === 0 || nLon === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Find min / max
      let minVal = Infinity;
      let maxVal = -Infinity;
      grid.forEach(row => {
        row.forEach(v => {
          if (v !== null && !isNaN(v)) {
            if (v < minVal) minVal = v;
            if (v > maxVal) maxVal = v;
          }
        });
      });
      if (minVal === Infinity) { minVal = 0; maxVal = 1; }

      const cellW = width / nLon;
      const cellH = height / nLat;

      for (let r = 0; r < nLat; r++) {
        const canvasRow = nLat - 1 - r;
        for (let c = 0; c < nLon; c++) {
          const val = grid[r]?.[c] ?? null;
          ctx.fillStyle = getScalarColor(val, minVal, maxVal);
          ctx.fillRect(c * cellW, canvasRow * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    };

    renderGrid(canvasARef.current, modelAGrid);
    renderGrid(canvasBRef.current, modelBGrid);
  }, [viewMode, modelAGrid, modelBGrid, nLat, nLon]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement | null
  ) => {
    if (!canvas || nLat === 0 || nLon === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor((x / rect.width) * nLon);
    const rowFromTop = Math.floor((y / rect.height) * nLat);
    const r = nLat - 1 - rowFromTop; // convert to latitude index

    if (r >= 0 && r < nLat && col >= 0 && col < nLon) {
      const lat = latitudes[r] ?? 0;
      const lon = longitudes[col] ?? 0;
      const valA = modelAGrid[r]?.[col] ?? null;
      const valB = modelBGrid[r]?.[col] ?? null;
      const diff = differenceGrid[r]?.[col] ?? null;

      setHoverCoord({
        lat,
        lon,
        valA,
        valB,
        diff,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            2D Spatial Regridded Difference Field (Δ = {modelA} − {modelB})
          </h3>
          <Badge variant="primary">{depthM === 0 ? 'Surface (0m)' : `${depthM}m Depth`}</Badge>
          <Badge variant="outline">1.0° Common Grid</Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('diff')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              border: viewMode === 'diff' ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: viewMode === 'diff' ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-elevated)',
              color: viewMode === 'diff' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            Difference Heatmap (Δ)
          </button>
          <button
            onClick={() => setViewMode('side_by_side')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              border: viewMode === 'side_by_side' ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: viewMode === 'side_by_side' ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-elevated)',
              color: viewMode === 'side_by_side' ? 'var(--primary)' : 'var(--text-secondary)',
            }}
          >
            Side-by-Side (M₁ | M₂)
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      {viewMode === 'diff' ? (
        <div style={{ position: 'relative', width: '100%', height: '340px', background: '#090d16', borderRadius: '6px', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width={600}
            height={340}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
            onMouseMove={(e) => handleMouseMove(e, canvasRef.current)}
            onMouseLeave={handleMouseLeave}
          />

          {/* Coordinate Overlay Box */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: '12px',
              pointerEvents: 'none',
            }}
          >
            <span>Lat: 0.0°N – 24.0°N</span>
            <span>Lon: 50.0°E – 95.0°E</span>
            <span>Grid: {nLat} × {nLon} cells</span>
          </div>

          {/* Hover Tooltip Probe */}
          {hoverCoord && (
            <div
              style={{
                position: 'absolute',
                top: Math.min(hoverCoord.y + 10, 240),
                left: Math.min(hoverCoord.x + 10, 420),
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: '#fff',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>
                {hoverCoord.lat.toFixed(1)}°N, {hoverCoord.lon.toFixed(1)}°E
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{modelA}:</span>
                <span style={{ fontWeight: 600 }}>{hoverCoord.valA !== null ? `${hoverCoord.valA.toFixed(2)} ${units}` : 'NaN / Land'}</span>

                <span style={{ color: 'var(--text-muted)' }}>{modelB}:</span>
                <span style={{ fontWeight: 600 }}>{hoverCoord.valB !== null ? `${hoverCoord.valB.toFixed(2)} ${units}` : 'NaN / Land'}</span>

                <span style={{ color: 'var(--text-muted)' }}>Δ (A − B):</span>
                <span style={{
                  fontWeight: 700,
                  color: hoverCoord.diff === null ? 'var(--text-muted)' : (hoverCoord.diff > 0 ? '#f43f5e' : '#38bdf8')
                }}>
                  {hoverCoord.diff !== null ? `${hoverCoord.diff > 0 ? '+' : ''}${hoverCoord.diff.toFixed(3)} ${units}` : 'NaN'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Side-by-Side Dual Visualizer */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
              {modelA} ({variable.toUpperCase()})
            </div>
            <div style={{ height: '280px', background: '#090d16', borderRadius: '6px', overflow: 'hidden' }}>
              <canvas
                ref={canvasARef}
                width={300}
                height={280}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
              {modelB} ({variable.toUpperCase()})
            </div>
            <div style={{ height: '280px', background: '#090d16', borderRadius: '6px', overflow: 'hidden' }}>
              <canvas
                ref={canvasBRef}
                width={300}
                height={280}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Divergent Color Legend */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span style={{ color: '#38bdf8', fontWeight: 600 }}>
          {modelA} &lt; {modelB} (−{maxAbsDiff.toFixed(1)} {units})
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '220px' }}>
          <div
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #2563eb, #38bdf8, #0f172a, #f43f5e, #dc2626)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '2px', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
            <span>−{maxAbsDiff.toFixed(1)}</span>
            <span>0 (Equivalence)</span>
            <span>+{maxAbsDiff.toFixed(1)}</span>
          </div>
        </div>

        <span style={{ color: '#f43f5e', fontWeight: 600 }}>
          {modelA} &gt; {modelB} (+{maxAbsDiff.toFixed(1)} {units})
        </span>
      </div>
    </div>
  );
};

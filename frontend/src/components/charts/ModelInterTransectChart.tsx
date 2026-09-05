import React, { useRef, useEffect, useState } from 'react';
import { Waves, Activity } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface TransectComparisonData {
  transect_name: string;
  title: string;
  coords_label: string;
  coords_points: Array<{ name: string; lat: number; lon: number; dist_km: number }>;
  depths: number[];
  diff_matrix: number[][];
  model_a_matrix: number[][];
  model_b_matrix: number[][];
}

interface ModelInterTransectChartProps {
  modelA: string;
  modelB: string;
  variable: string;
  units: string;
  transectData?: TransectComparisonData;
}

export const ModelInterTransectChart: React.FC<ModelInterTransectChartProps> = ({
  modelA,
  modelB,
  variable,
  units,
  transectData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverProbe, setHoverProbe] = useState<{
    x: number;
    y: number;
    depth: number;
    station: string;
    valA: number;
    valB: number;
    diff: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !transectData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const depths = transectData.depths;
    const coords = transectData.coords_points;
    const diffMatrix = transectData.diff_matrix;

    const nDepths = depths.length;
    const nCoords = coords.length;

    const padLeft = 45;
    const padBottom = 28;
    const padTop = 15;
    const padRight = 20;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Find max absolute difference for scale
    let maxAbs = 0.5;
    diffMatrix.forEach((row) => {
      row.forEach((v) => {
        if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v);
      });
    });

    const getDiffColor = (val: number): string => {
      const normalized = Math.max(-1, Math.min(1, val / maxAbs));
      if (normalized < 0) {
        const t = Math.abs(normalized);
        const r = Math.round(15 + (59 - 15) * (1 - t));
        const g = Math.round(23 + (130 - 23) * t);
        const b = Math.round(42 + (246 - 42) * t);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const t = normalized;
        const r = Math.round(15 + (244 - 15) * t);
        const g = Math.round(23 + (63 - 23) * (1 - t));
        const b = Math.round(42 + (94 - 42) * (1 - t));
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    const cellW = chartW / (nCoords - 1);
    const cellH = chartH / (nDepths - 1);

    for (let r = 0; r < nDepths - 1; r++) {
      const y1 = padTop + r * cellH;
      const y2 = padTop + (r + 1) * cellH;

      for (let c = 0; c < nCoords - 1; c++) {
        const x1 = padLeft + c * cellW;
        const x2 = padLeft + (c + 1) * cellW;

        const val =
          (diffMatrix[r][c] +
            diffMatrix[r][c + 1] +
            diffMatrix[r + 1][c] +
            diffMatrix[r + 1][c + 1]) /
          4;

        ctx.fillStyle = getDiffColor(val);
        ctx.fillRect(x1, y1, x2 - x1 + 0.5, y2 - y1 + 0.5);
      }
    }

    // Draw Depth Axis Ticks
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';

    [0, 2, 4, 6, 8].forEach((rIdx) => {
      if (rIdx < nDepths) {
        const y = padTop + rIdx * cellH;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();
        ctx.fillText(`${depths[rIdx]}m`, padLeft - 6, y + 3);
      }
    });

    // Draw Station X Axis Ticks
    ctx.textAlign = 'center';
    [0, Math.floor(nCoords / 2), nCoords - 1].forEach((cIdx) => {
      if (cIdx < nCoords) {
        const x = padLeft + cIdx * cellW;
        ctx.fillText(coords[cIdx].name, x, height - 8);
      }
    });
  }, [transectData, modelA, modelB]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !transectData) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padLeft = 45;
    const padTop = 15;
    const chartW = canvasRef.current.width - 65;
    const chartH = canvasRef.current.height - 43;

    if (x >= padLeft && x <= padLeft + chartW && y >= padTop && y <= padTop + chartH) {
      const cFrac = (x - padLeft) / chartW;
      const rFrac = (y - padTop) / chartH;

      const cIdx = Math.min(
        transectData.coords_points.length - 1,
        Math.max(0, Math.round(cFrac * (transectData.coords_points.length - 1)))
      );
      const rIdx = Math.min(
        transectData.depths.length - 1,
        Math.max(0, Math.round(rFrac * (transectData.depths.length - 1)))
      );

      const st = transectData.coords_points[cIdx];
      const d = transectData.depths[rIdx];
      const va = transectData.model_a_matrix[rIdx][cIdx];
      const vb = transectData.model_b_matrix[rIdx][cIdx];
      const diff = transectData.diff_matrix[rIdx][cIdx];

      setHoverProbe({
        x,
        y,
        depth: d,
        station: st.name,
        valA: va,
        valB: vb,
        diff,
      });
    } else {
      setHoverProbe(null);
    }
  };

  return (
    <div className="card" style={{ padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Waves className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Vertical Hydrographic Transect Discrepancy Matrix (Δ = {modelA} − {modelB})
          </h3>
        </div>
        <Badge variant="primary">{transectData?.title || 'Equatorial Transect'}</Badge>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '280px', background: '#090d16', borderRadius: '6px' }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={280}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverProbe(null)}
        />

        {hoverProbe && (
          <div
            style={{
              position: 'absolute',
              top: Math.min(hoverProbe.y + 10, 180),
              left: Math.min(hoverProbe.x + 10, 320),
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#fff',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {hoverProbe.station} @ {hoverProbe.depth}m
            </div>
            <div>{modelA}: {hoverProbe.valA.toFixed(2)} {units}</div>
            <div>{modelB}: {hoverProbe.valB.toFixed(2)} {units}</div>
            <div style={{ color: hoverProbe.diff > 0 ? '#f43f5e' : '#38bdf8', fontWeight: 700 }}>
              Δ: {hoverProbe.diff > 0 ? '+' : ''}{hoverProbe.diff.toFixed(2)} {units}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Equatorial Transect (50°E → 95°E)</span>
        <span>Depth Range: 0–2000m Iso-surfaces</span>
      </div>
    </div>
  );
};

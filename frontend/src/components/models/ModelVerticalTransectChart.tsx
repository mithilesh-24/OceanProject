import React, { useState, useEffect, useRef } from 'react';
import { Waves, Activity, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { ModelTransectData, api } from '../../services/apiClient';

interface ModelVerticalTransectChartProps {
  modelId: string;
  initialTransect?: string;
  initialVariable?: string;
}

export const ModelVerticalTransectChart: React.FC<ModelVerticalTransectChartProps> = ({
  modelId,
  initialTransect = 'equator',
  initialVariable = 'temperature',
}) => {
  const [transect, setTransect] = useState<string>(initialTransect);
  const [variable, setVariable] = useState<string>(initialVariable);
  const [transectData, setTransectData] = useState<ModelTransectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getModelTransect(modelId, { transect, variable })
      .then((data) => {
        if (isMounted) {
          setTransectData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load transect data:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [modelId, transect, variable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !transectData || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const depths = transectData.depths;
    const coords = transectData.coords_points;
    const matrix = transectData.matrix_data;
    const minVal = transectData.min_val;
    const maxVal = transectData.max_val;
    const range = maxVal - minVal || 1.0;

    const nDepths = depths.length;
    const nCoords = coords.length;

    const padLeft = 45;
    const padBottom = 25;
    const padTop = 15;
    const padRight = 20;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const getColor = (val: number): string => {
      const norm = Math.max(0, Math.min(1, (val - minVal) / range));
      if (variable === 'temperature') {
        const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 3))));
        const g = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 2))));
        const b = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(norm * 4 - 1))));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const r = Math.round(200 * norm + 20);
        const g = Math.round(220 * (1 - norm * 0.5) + 30);
        const b = Math.round(255 * (1 - norm) + 50);
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    const cellW = chartW / (nCoords - 1);
    const cellH = chartH / (nDepths - 1);

    // Draw grid cells with color interpolation
    for (let r = 0; r < nDepths - 1; r++) {
      const y1 = padTop + r * cellH;
      const y2 = padTop + (r + 1) * cellH;

      for (let c = 0; c < nCoords - 1; c++) {
        const x1 = padLeft + c * cellW;
        const x2 = padLeft + (c + 1) * cellW;

        const val = (matrix[r][c] + matrix[r][c + 1] + matrix[r + 1][c] + matrix[r + 1][c + 1]) / 4;
        ctx.fillStyle = getColor(val);
        ctx.fillRect(x1, y1, x2 - x1 + 0.5, y2 - y1 + 0.5);
      }
    }

    // Draw Thermocline Line (Dashed White / Cyan Line)
    if (transectData.thermocline_depths && transectData.thermocline_depths.length > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();

      const maxDepth = depths[depths.length - 1];
      transectData.thermocline_depths.forEach((td, idx) => {
        const x = padLeft + idx * cellW;
        // Non-linear depth scaling for upper thermocline focus
        const yFrac = Math.sqrt(td / maxDepth);
        const y = padTop + yFrac * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Depth Axis (Left)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    [0, 100, 200, 500, 1000, 2000].forEach((d) => {
      const idx = depths.findIndex((depthVal) => depthVal >= d);
      if (idx !== -1) {
        const y = padTop + idx * cellH;
        ctx.fillText(`${d}m`, padLeft - 6, y + 3);
        ctx.beginPath();
        ctx.moveTo(padLeft - 3, y);
        ctx.lineTo(padLeft, y);
        ctx.stroke();
      }
    });

    // Draw Bottom Coordinate Axis
    ctx.textAlign = 'center';
    coords.forEach((c, idx) => {
      const x = padLeft + idx * cellW;
      ctx.fillText(`${c}°`, x, padTop + chartH + 16);
    });
  }, [transectData, loading, variable]);

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Waves className="w-4 h-4 text-[var(--accent)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Vertical Hydrographic Transect (Distance vs Depth)
          </h3>
          <Badge variant="primary">{transect.toUpperCase()}</Badge>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant={transect === 'equator' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTransect('equator')}
            style={{ fontSize: '11px', height: '26px' }}
          >
            Equatorial 0°N
          </Button>
          <Button
            variant={transect === 'bob_meridional' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTransect('bob_meridional')}
            style={{ fontSize: '11px', height: '26px' }}
          >
            BoB 88°E Plume
          </Button>
          <Button
            variant={transect === 'arabian_zonal' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTransect('arabian_zonal')}
            style={{ fontSize: '11px', height: '26px' }}
          >
            Arabian 15°N
          </Button>
        </div>
      </div>

      <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
        {transectData?.title || 'Section view across Indian Ocean hydrographic boundaries with thermocline isopycnal depth overlay.'}
      </p>

      {/* Canvas Viewport */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#090d16', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9, 13, 22, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <RefreshCw className="w-5 h-5 text-[var(--primary)] animate-spin" />
            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-primary)' }}>Subsetting vertical transect...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={720}
          height={260}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* Thermocline Legend Tag */}
        <div style={{ position: 'absolute', top: '8px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', backgroundColor: 'rgba(15,23,42,0.85)', padding: '3px 8px', borderRadius: '4px', color: '#ffffff' }}>
          <span style={{ display: 'inline-block', width: '14px', height: '2px', borderTop: '2px dashed #ffffff' }} />
          <span>Thermocline Depth Layer</span>
        </div>
      </div>
    </div>
  );
};

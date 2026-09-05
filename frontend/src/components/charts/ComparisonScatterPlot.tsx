import React, { useRef, useEffect, useState } from 'react';
import { Target, TrendingUp, Info } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface ComparisonScatterPlotProps {
  scatterPoints: Array<{ obs: number; model: number; error: number }>;
  units?: string;
  r2Score?: number;
  pearsonR?: number;
  modelName?: string;
  obsName?: string;
}

export const ComparisonScatterPlot: React.FC<ComparisonScatterPlotProps> = ({
  scatterPoints = [],
  units = '°C',
  r2Score = 0.998,
  pearsonR = 0.999,
  modelName = 'HYCOM',
  obsName = 'Argo Floats'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ obs: number; model: number; error: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || scatterPoints.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 40;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Find min and max across all points
    const allVals = scatterPoints.flatMap((p) => [p.obs, p.model]);
    const minVal = Math.floor(Math.min(...allVals));
    const maxVal = Math.ceil(Math.max(...allVals));
    const range = maxVal - minVal || 1.0;

    // 1. Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const v = minVal + (i / ticks) * range;
      const x = padLeft + (i / ticks) * chartW;
      const y = padTop + chartH - (i / ticks) * chartH;

      // Vertical grid
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + chartH);
      ctx.stroke();

      // Horizontal grid
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${v.toFixed(0)}`, x, padTop + chartH + 16);

      ctx.textAlign = 'right';
      ctx.fillText(`${v.toFixed(0)}`, padLeft - 6, y + 3);
    }

    // 2. Draw 1:1 Identity Line (Ideal Match: y = x, dashed green)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + chartH);
    ctx.lineTo(padLeft + chartW, padTop);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Linear Regression Trendline (solid cyan)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Regression line from minVal to maxVal
    const x1 = padLeft;
    const y1 = padTop + chartH;
    const x2 = padLeft + chartW;
    const y2 = padTop;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 4. Render Scatter Points
    scatterPoints.forEach((p) => {
      const x = padLeft + ((p.obs - minVal) / range) * chartW;
      const y = padTop + chartH - ((p.model - minVal) / range) * chartH;

      const isOver = p.error > 0;
      ctx.fillStyle = isOver ? 'rgba(0, 242, 254, 0.75)' : 'rgba(244, 63, 94, 0.75)';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 5. Axes Titles
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Observed: ${obsName} (${units})`, padLeft + chartW / 2, height - 6);

    ctx.save();
    ctx.translate(12, padTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`Model: ${modelName} (${units})`, 0, 0);
    ctx.restore();
  }, [scatterPoints, units, modelName, obsName]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || scatterPoints.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 40;
    const chartW = canvas.width - padLeft - padRight;
    const chartH = canvas.height - padTop - padBottom;

    const allVals = scatterPoints.flatMap((p) => [p.obs, p.model]);
    const minVal = Math.floor(Math.min(...allVals));
    const maxVal = Math.ceil(Math.max(...allVals));
    const range = maxVal - minVal || 1.0;

    let closest: any = null;
    let minDist = 15; // Pixel threshold

    scatterPoints.forEach((p) => {
      const px = padLeft + ((p.obs - minVal) / range) * chartW;
      const py = padTop + chartH - ((p.model - minVal) / range) * chartH;
      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist < minDist) {
        minDist = dist;
        closest = { ...p, x: px, y: py };
      }
    });

    setHoveredPoint(closest);
  };

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Scatter Plot & 1:1 Identity Regression
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Badge variant="primary">R² = {r2Score.toFixed(3)}</Badge>
          <Badge variant="success">R = {pearsonR.toFixed(3)}</Badge>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', backgroundColor: '#090d16', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          width={440}
          height={260}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
        />

        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(hoveredPoint.x + 10, 320)}px`,
              top: `${Math.max(hoveredPoint.y - 45, 10)}px`,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '10.5px',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
              zIndex: 20
            }}
          >
            <div>Obs: <strong>{hoveredPoint.obs} {units}</strong></div>
            <div>Model: <strong>{hoveredPoint.model} {units}</strong></div>
            <div style={{ color: hoveredPoint.error >= 0 ? '#00f2fe' : '#f43f5e' }}>
              Error: {hoveredPoint.error >= 0 ? `+${hoveredPoint.error}` : hoveredPoint.error} {units}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #10b981', display: 'inline-block' }} />
          1:1 Ideal Concordance
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#00f2fe', display: 'inline-block' }} />
          Model Fitted Linear Trend
        </span>
      </div>
    </div>
  );
};

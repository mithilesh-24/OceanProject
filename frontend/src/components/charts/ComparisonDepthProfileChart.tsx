import React, { useRef, useEffect } from 'react';
import { Layers, Activity } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface ComparisonDepthProfileChartProps {
  depths?: number[];
  obsProfile?: Array<{ depth: number; value: number }>;
  modelProfile?: Array<{ depth: number; value: number }>;
  errorRibbon?: Array<{ depth: number; model: number; upper: number; lower: number; rmse: number }>;
  units?: string;
  variableName?: string;
}

export const ComparisonDepthProfileChart: React.FC<ComparisonDepthProfileChartProps> = ({
  depths = [0, 25, 50, 100, 150, 200, 300, 500, 1000, 2000],
  obsProfile = [],
  modelProfile = [],
  errorRibbon = [],
  units = '°C',
  variableName = 'Temperature'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || obsProfile.length === 0 || modelProfile.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxDepth = depths[depths.length - 1] || 2000;
    const allVals = [
      ...obsProfile.map((p) => p.value),
      ...modelProfile.map((p) => p.value),
      ...errorRibbon.map((p) => p.upper),
      ...errorRibbon.map((p) => p.lower)
    ];

    const minVal = Math.floor(Math.min(...allVals));
    const maxVal = Math.ceil(Math.max(...allVals));
    const valRange = maxVal - minVal || 1.0;

    // 1. Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0, 200, 500, 1000, 2000].forEach((d) => {
      const y = padTop + (d / maxDepth) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${d}m`, padLeft - 6, y + 3);
    });

    // 2. Draw Error Discrepancy Ribbon (Shaded area around model curve: ±RMSE)
    if (errorRibbon.length > 0) {
      ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      // Forward path (upper bound)
      errorRibbon.forEach((p, idx) => {
        const x = padLeft + ((p.upper - minVal) / valRange) * chartW;
        const y = padTop + (p.depth / maxDepth) * chartH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      // Reverse path (lower bound)
      for (let i = errorRibbon.length - 1; i >= 0; i--) {
        const p = errorRibbon[i];
        const x = padLeft + ((p.lower - minVal) / valRange) * chartW;
        const y = padTop + (p.depth / maxDepth) * chartH;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // 3. Draw Observed Profile (Solid White with Points)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    obsProfile.forEach((p, idx) => {
      const x = padLeft + ((p.value - minVal) / valRange) * chartW;
      const y = padTop + (p.depth / maxDepth) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    obsProfile.forEach((p) => {
      const x = padLeft + ((p.value - minVal) / valRange) * chartW;
      const y = padTop + (p.depth / maxDepth) * chartH;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw Model Forecast Profile (Dashed Cyan)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    modelProfile.forEach((p, idx) => {
      const x = padLeft + ((p.value - minVal) / valRange) * chartW;
      const y = padTop + (p.depth / maxDepth) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Value Axis Labels (Bottom)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${minVal} ${units}`, padLeft + 20, height - 10);
    ctx.fillText(`${maxVal} ${units}`, padLeft + chartW - 20, height - 10);
  }, [depths, obsProfile, modelProfile, errorRibbon, units]);

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="w-4 h-4 text-[var(--accent)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Vertical Depth Profile (Obs vs Model)
          </h3>
        </div>
        <Badge variant="primary">±RMSE Error Ribbon</Badge>
      </div>

      <div style={{ position: 'relative', width: '100%', backgroundColor: '#090d16', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          width={440}
          height={260}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'inline-block' }} />
          In-Situ Profile
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #00f2fe', display: 'inline-block' }} />
          Interpolated Model
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '8px', backgroundColor: 'rgba(0, 242, 254, 0.2)', display: 'inline-block' }} />
          ±RMSE Uncertainty
        </span>
      </div>
    </div>
  );
};

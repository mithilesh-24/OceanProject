import React, { useRef, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface ComparisonTimeSeriesChartProps {
  timeSeries?: Array<{ day: string; obs: number; model: number; residual: number }>;
  units?: string;
  variableName?: string;
}

export const ComparisonTimeSeriesChart: React.FC<ComparisonTimeSeriesChartProps> = ({
  timeSeries = [],
  units = '°C',
  variableName = 'Temperature'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || timeSeries.length === 0) return;

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

    const allVals = timeSeries.flatMap((d) => [d.obs, d.model]);
    const minVal = Math.floor(Math.min(...allVals) * 10) / 10;
    const maxVal = Math.ceil(Math.max(...allVals) * 10) / 10;
    const range = maxVal - minVal || 1.0;

    const nPoints = timeSeries.length;
    const xStep = chartW / (nPoints - 1);

    // 1. Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const v = minVal + (i / 4) * range;
      const y = padTop + chartH - (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${v.toFixed(1)}`, padLeft - 6, y + 3);
    }

    // 2. Draw Residual Bars at bottom
    timeSeries.forEach((d, i) => {
      const x = padLeft + i * xStep;
      const barH = Math.min(25, Math.abs(d.residual) * 40);
      const isPos = d.residual >= 0;

      ctx.fillStyle = isPos ? 'rgba(0, 242, 254, 0.35)' : 'rgba(244, 63, 94, 0.35)';
      ctx.fillRect(x - 2, padTop + chartH - barH, 4, barH);
    });

    // 3. Observed Curve (Solid White)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    timeSeries.forEach((d, i) => {
      const x = padLeft + i * xStep;
      const y = padTop + chartH - ((d.obs - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 4. Model Forecast Curve (Solid Cyan)
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.beginPath();
    timeSeries.forEach((d, i) => {
      const x = padLeft + i * xStep;
      const y = padTop + chartH - ((d.model - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Day labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    [0, 7, 14, 21, 29].forEach((idx) => {
      if (timeSeries[idx]) {
        const x = padLeft + idx * xStep;
        ctx.fillText(timeSeries[idx].day, x, height - 10);
      }
    });
  }, [timeSeries, units]);

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock className="w-4 h-4 text-[var(--success)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            30-Day Temporal Match Time Series
          </h3>
        </div>
        <Badge variant="neutral">Synchronous Diurnal Match</Badge>
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
          <span style={{ width: '12px', height: '2px', backgroundColor: '#ffffff', display: 'inline-block' }} />
          Observed Telemetry
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#00f2fe', display: 'inline-block' }} />
          Model Hindcast
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'rgba(0, 242, 254, 0.4)', display: 'inline-block' }} />
          Residual Error
        </span>
      </div>
    </div>
  );
};

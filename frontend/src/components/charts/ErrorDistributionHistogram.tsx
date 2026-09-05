import React, { useRef, useEffect } from 'react';
import { BarChart2, Info } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface ErrorDistributionHistogramProps {
  histogramBins?: Array<{
    bin_start: number;
    bin_end: number;
    bin_mid: number;
    count: number;
    gaussian_fit: number;
    label: string;
  }>;
  units?: string;
  p10?: number;
  p50?: number;
  p90?: number;
}

export const ErrorDistributionHistogram: React.FC<ErrorDistributionHistogramProps> = ({
  histogramBins = [],
  units = '°C',
  p10 = -0.32,
  p50 = -0.02,
  p90 = 0.28
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || histogramBins.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 40;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxCount = Math.max(...histogramBins.map((b) => Math.max(b.count, b.gaussian_fit))) || 10;
    const nBins = histogramBins.length;
    const binW = chartW / nBins;

    // 1. Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padTop + chartH - (i / 3) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      const cnt = Math.round((i / 3) * maxCount);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${cnt}`, padLeft - 6, y + 3);
    }

    // 2. Draw Histogram Bars
    histogramBins.forEach((b, i) => {
      const x = padLeft + i * binW + 2;
      const barH = (b.count / maxCount) * chartH;
      const y = padTop + chartH - barH;

      const isPos = b.bin_mid >= 0;
      ctx.fillStyle = isPos ? 'rgba(0, 242, 254, 0.65)' : 'rgba(244, 63, 94, 0.65)';
      ctx.fillRect(x, y, binW - 4, barH);

      ctx.strokeStyle = isPos ? '#00f2fe' : '#f43f5e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, binW - 4, barH);
    });

    // 3. Draw Gaussian Normal Curve Overlay (Smooth Yellow Line)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    histogramBins.forEach((b, i) => {
      const x = padLeft + i * binW + binW / 2;
      const y = padTop + chartH - (b.gaussian_fit / maxCount) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 4. Zero Error Baseline Marker
    const zeroBinIdx = histogramBins.findIndex((b) => b.bin_start <= 0 && b.bin_end >= 0);
    if (zeroBinIdx !== -1) {
      const zx = padLeft + zeroBinIdx * binW + binW / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(zx, padTop);
      ctx.lineTo(zx, padTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Bin labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8.5px monospace';
    ctx.textAlign = 'center';
    histogramBins.forEach((b, i) => {
      if (i % 2 === 0) {
        const x = padLeft + i * binW + binW / 2;
        ctx.fillText(b.label.split(' to ')[0], x, height - 10);
      }
    });
  }, [histogramBins, units]);

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 className="w-4 h-4 text-[var(--accent)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Error Residual Distribution & Gaussian Fit
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '4px', fontSize: '10.5px' }}>
          <Badge variant="neutral">P50: {p50 > 0 ? `+${p50}` : p50} {units}</Badge>
        </div>
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
          <span style={{ width: '10px', height: '10px', backgroundColor: 'rgba(0, 242, 254, 0.65)', display: 'inline-block' }} />
          Sample Discrepancy Frequencies
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '2px', backgroundColor: '#facc15', display: 'inline-block' }} />
          Gaussian Normal Density (N(μ, σ²))
        </span>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';

export interface TaylorPoint {
  model_id: string;
  name: string;
  full_name?: string;
  correlation: number;
  std_dev_norm: number;
  centered_rmsd: number;
  theta_rad?: number;
  is_current?: boolean;
  color: string;
}

interface TaylorDiagramChartProps {
  points: TaylorPoint[];
  width?: number;
  height?: number;
  title?: string;
}

export const TaylorDiagramChart: React.FC<TaylorDiagramChartProps> = ({
  points,
  width = 440,
  height = 360,
  title = 'Taylor Diagram (Model Skill Decomposition)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI retina display
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const originX = 50;
    const originY = height - 40;
    const maxRadius = Math.min(width - 80, height - 70);
    const maxStdDev = 1.6;

    // 1. Draw Polar Grid Arcs (Standard Deviation)
    const stdDevSteps = [0.5, 1.0, 1.5];
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    stdDevSteps.forEach((sd) => {
      const r = (sd / maxStdDev) * maxRadius;
      ctx.beginPath();
      ctx.arc(originX, originY, r, -Math.PI / 2, 0, false);
      ctx.stroke();

      // Label
      ctx.setLineDash([]);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText(`σ=${sd}`, originX + r - 12, originY + 14);
      ctx.setLineDash([3, 3]);
    });

    // 2. Draw Reference Arc at StdDev = 1.0 (Observations)
    const refR = (1.0 / maxStdDev) * maxRadius;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.arc(originX, originY, refR, -Math.PI / 2, 0, false);
    ctx.stroke();

    // 3. Draw Centered RMSD Circles (from Reference Point (refR, originY))
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.setLineDash([2, 4]);
    const rmsdSteps = [0.25, 0.5, 0.75, 1.0];
    rmsdSteps.forEach((rmsd) => {
      const r = (rmsd / maxStdDev) * maxRadius;
      ctx.beginPath();
      ctx.arc(originX + refR, originY, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Draw Radial Correlation Rays (acos(R))
    const corrValues = [0.99, 0.95, 0.9, 0.8, 0.6, 0.4, 0.2, 0.0];
    ctx.setLineDash([1, 4]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';

    corrValues.forEach((corr) => {
      const angle = Math.acos(corr);
      const endX = originX + maxRadius * Math.cos(angle);
      const endY = originY - maxRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Label at circumference
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px sans-serif';
      const labelX = originX + (maxRadius + 12) * Math.cos(angle);
      const labelY = originY - (maxRadius + 12) * Math.sin(angle);
      ctx.fillText(`${corr}`, labelX - 6, labelY + 3);
      ctx.setLineDash([1, 4]);
    });

    // 5. Draw Axes
    ctx.setLineDash([]);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + maxRadius + 15, originY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - maxRadius - 15);
    ctx.stroke();

    // 6. Draw Reference Point (Observation: R=1.0, StdDev=1.0)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(originX + refR, originY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('REF (Obs)', originX + refR - 18, originY - 10);

    // 7. Plot Model Points
    points.forEach((pt) => {
      const corr = Math.max(-1.0, Math.min(1.0, pt.correlation));
      const angle = Math.acos(corr);
      const r = (pt.std_dev_norm / maxStdDev) * maxRadius;

      const px = originX + r * Math.cos(angle);
      const py = originY - r * Math.sin(angle);

      // Outer glow for active model
      if (pt.is_current) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Point marker
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(pt.name, px + 8, py - 4);
    });
  }, [points, width, height]);

  return (
    <div className="chart-wrapper-card" style={{ alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Radial: σ_norm | Angle: acos(R)</span>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
        />
      </div>
      <div style={{ width: '100%', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '11.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', border: '1px solid #ffffff' }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>HYCOM (0.95, σ=1.05)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', border: '1px solid #ffffff' }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ROMS (0.96, σ=0.97)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#a855f7', border: '1px solid #ffffff' }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>NEMO (0.93, σ=1.09)</span>
        </div>
      </div>
    </div>
  );
};

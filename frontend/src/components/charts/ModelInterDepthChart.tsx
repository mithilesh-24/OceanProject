import React, { useRef, useEffect, useState } from 'react';
import { Layers, Activity, Info } from 'lucide-react';
import { Badge } from '../UI/Badge';

interface DepthPoint {
  depth_m: number;
  model_a_val: number;
  model_b_val: number;
  difference: number;
  rmsd: number;
}

interface ModelInterDepthChartProps {
  modelA: string;
  modelB: string;
  variable: string;
  units: string;
  depthProfile?: DepthPoint[];
}

export const ModelInterDepthChart: React.FC<ModelInterDepthChartProps> = ({
  modelA,
  modelB,
  variable,
  units,
  depthProfile = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DepthPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || depthProfile.length === 0) return;

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

    const depths = depthProfile.map((p) => p.depth_m);
    const maxDepth = Math.max(...depths, 2000);

    const allVals = [
      ...depthProfile.map((p) => p.model_a_val),
      ...depthProfile.map((p) => p.model_b_val),
    ];

    const minVal = Math.floor(Math.min(...allVals) * 10) / 10;
    const maxVal = Math.ceil(Math.max(...allVals) * 10) / 10;
    const valRange = maxVal - minVal || 1.0;

    // 1. Grid lines (Depth)
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

    // 2. Shaded Discrepancy Band between Model A and Model B
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.beginPath();
    // Forward path: Model A
    depthProfile.forEach((p, idx) => {
      const x = padLeft + ((p.model_a_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    // Reverse path: Model B
    for (let i = depthProfile.length - 1; i >= 0; i--) {
      const p = depthProfile[i];
      const x = padLeft + ((p.model_b_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // 3. Draw Model A Profile Curve (Cyan #38bdf8)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    depthProfile.forEach((p, idx) => {
      const x = padLeft + ((p.model_a_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points for Model A
    depthProfile.forEach((p) => {
      const x = padLeft + ((p.model_a_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw Model B Profile Curve (Amber #f59e0b)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    depthProfile.forEach((p, idx) => {
      const x = padLeft + ((p.model_b_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points for Model B
    depthProfile.forEach((p) => {
      const x = padLeft + ((p.model_b_val - minVal) / valRange) * chartW;
      const y = padTop + (p.depth_m / maxDepth) * chartH;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. X-Axis Values and labels
    const step = (maxVal - minVal) / 4;
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const val = minVal + step * i;
      const x = padLeft + (i / 4) * chartW;
      ctx.fillText(`${val.toFixed(1)} ${units}`, x, height - 10);
    }
  }, [depthProfile, modelA, modelB, units]);

  return (
    <div className="card" style={{ padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Vertical Depth Profile Variance (0–2000m)
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{modelA}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{modelB}</span>
          </div>
          <Badge variant="outline">Discrepancy Ribbon</Badge>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '280px', background: '#090d16', borderRadius: '6px' }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={280}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Thermocline Gradient Variance</span>
        <span>Reference Point: BoB Central (14.3°N, 87.5°E)</span>
      </div>
    </div>
  );
};

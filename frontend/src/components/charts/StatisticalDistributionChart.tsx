import React from 'react';

export interface DistributionBin {
  bin_center: number;
  bin_range: string;
  empirical_density: number;
  gaussian_fit: number;
  cumulative_prob: number;
}

interface StatisticalDistributionChartProps {
  bins: DistributionBin[];
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  units: string;
  height?: number;
}

export const StatisticalDistributionChart: React.FC<StatisticalDistributionChartProps> = ({
  bins,
  p10,
  p50,
  p90,
  mean,
  units,
  height = 240,
}) => {
  if (!bins || bins.length === 0) return null;

  const maxDensity = Math.max(...bins.map((b) => Math.max(b.empirical_density, b.gaussian_fit))) * 1.15;
  const minX = bins[0].bin_center;
  const maxX = bins[bins.length - 1].bin_center;
  const rangeX = maxX - minX;

  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const width = 600;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (val: number) => padLeft + ((val - minX) / rangeX) * plotW;
  const getY = (density: number) => padTop + (1.0 - density / maxDensity) * plotH;

  // Gaussian Curve Path
  const curvePath = bins
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${getX(b.bin_center)} ${getY(b.gaussian_fit)}`)
    .join(' ');

  const barW = (plotW / bins.length) * 0.85;

  return (
    <div className="chart-wrapper-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Probability Density Function (PDF) &amp; Gaussian Fit
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Empirical histogram bars with Gaussian theoretical distribution curve
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          <span className="badge-emerald">
            Median (P50): {p50.toFixed(2)} {units}
          </span>
          <span className="badge-cyan">
            Mean: {mean.toFixed(2)} {units}
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', maxWidth: '600px' }}>
          {/* Y Axis Gridlines */}
          {[0, maxDensity * 0.5, maxDensity].map((d, i) => {
            const y = getY(d);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {d.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {bins.map((b, i) => {
            const bx = getX(b.bin_center) - barW / 2;
            const by = getY(b.empirical_density);
            const bh = plotH - (by - padTop);
            return (
              <rect
                key={i}
                x={bx}
                y={by}
                width={barW}
                height={Math.max(0, bh)}
                fill="rgba(56, 189, 248, 0.35)"
                stroke="#38bdf8"
                strokeWidth="1"
                rx="1"
              />
            );
          })}

          {/* Smooth Gaussian Fit Line */}
          <path d={curvePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

          {/* P10, P50, P90 Marker Lines */}
          {[
            { label: 'P10', val: p10, color: '#94a3b8' },
            { label: 'P50 (Med)', val: p50, color: '#10b981' },
            { label: 'P90', val: p90, color: '#94a3b8' },
          ].map((m, idx) => {
            const px = getX(m.val);
            return (
              <g key={idx}>
                <line
                  x1={px}
                  y1={padTop}
                  x2={px}
                  y2={padTop + plotH}
                  stroke={m.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={px}
                  y={padTop - 4}
                  textAnchor="middle"
                  fill={m.color}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {m.label} ({m.val.toFixed(1)})
                </text>
              </g>
            );
          })}

          {/* X Axis labels */}
          {bins.filter((_, i) => i % 4 === 0).map((b, i) => (
            <text
              key={i}
              x={getX(b.bin_center)}
              y={height - 8}
              textAnchor="middle"
              fill="#64748b"
              fontSize="9.5"
              fontFamily="monospace"
            >
              {b.bin_center.toFixed(1)} {units}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ width: '100%', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'rgba(56, 189, 248, 0.4)', border: '1px solid #38bdf8' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Empirical Frequency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '2.5px', backgroundColor: '#f59e0b', borderRadius: '1px' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Gaussian PDF Fit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #10b981' }} />
          <span style={{ color: '#10b981', fontWeight: 600 }}>Median (P50)</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

export interface BuoyTimePoint {
  time: string;
  sst: number;
  air_temp?: number;
  wind?: number;
  wave?: number;
}

interface BuoyTimeSeriesChartProps {
  data?: BuoyTimePoint[];
  title?: string;
  width?: number;
  height?: number;
}

export const BuoyTimeSeriesChart: React.FC<BuoyTimeSeriesChartProps> = ({
  data = [],
  title = '24-Hour Moored Buoy Met-Ocean Telemetry',
  width = 340,
  height = 200,
}) => {
  const [activeParam, setActiveParam] = useState<'sst' | 'wind' | 'wave'>('sst');

  const points = data.length > 0 ? data : [
    { time: '00:00', sst: 29.2, air_temp: 27.8, wind: 11.8, wave: 1.7 },
    { time: '04:00', sst: 29.0, air_temp: 27.2, wind: 12.5, wave: 1.8 },
    { time: '08:00', sst: 29.4, air_temp: 28.1, wind: 13.0, wave: 1.9 },
    { time: '12:00', sst: 29.8, air_temp: 29.4, wind: 14.2, wave: 2.0 },
    { time: '16:00', sst: 29.6, air_temp: 28.8, wind: 13.5, wave: 1.9 },
    { time: '20:00', sst: 29.3, air_temp: 28.0, wind: 12.0, wave: 1.8 },
  ];

  const padding = { top: 30, right: 30, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  let values = points.map((p) => {
    if (activeParam === 'sst') return p.sst;
    if (activeParam === 'wind') return p.wind || 0;
    return p.wave || 0;
  });

  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;
  const unit = activeParam === 'sst' ? '°C' : activeParam === 'wind' ? 'kts' : 'm';
  const color = activeParam === 'sst' ? '#ff6b6b' : activeParam === 'wind' ? '#0ea5e9' : '#10b981';

  const getY = (val: number) => {
    return height - padding.bottom - ((val - minVal) / (maxVal - minVal || 1)) * chartHeight;
  };

  const getX = (i: number) => {
    return padding.left + (i / (points.length - 1 || 1)) * chartWidth;
  };

  const pathStr = points
    .map((p, i) => {
      const val = activeParam === 'sst' ? p.sst : activeParam === 'wind' ? p.wind || 0 : p.wave || 0;
      const x = getX(i);
      const y = getY(val);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h5 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h5>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['sst', 'wind', 'wave'] as const).map((param) => (
            <button
              key={param}
              onClick={() => setActiveParam(param)}
              style={{
                fontSize: '9.5px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: activeParam === param ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: activeParam === param ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: activeParam === param ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {param.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Y Axis Grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const val = minVal + pct * (maxVal - minVal);
          const y = getY(val);
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                fill="var(--text-muted)"
                fontSize="9px"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Trend line */}
        <path
          d={pathStr}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => {
          const val = activeParam === 'sst' ? p.sst : activeParam === 'wind' ? p.wind || 0 : p.wave || 0;
          const x = getX(i);
          const y = getY(val);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          );
        })}

        {/* X Axis Time Labels */}
        {points.map((p, i) => {
          const x = getX(i);
          return (
            <text
              key={i}
              x={x}
              y={height - padding.bottom + 16}
              fill="var(--text-muted)"
              fontSize="9px"
              fontFamily="var(--font-mono)"
              textAnchor="middle"
            >
              {p.time}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

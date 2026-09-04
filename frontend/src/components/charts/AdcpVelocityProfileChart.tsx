import React from 'react';

export interface AdcpBin {
  depth: number;
  u_velocity: number;
  v_velocity: number;
  magnitude: number;
  direction: number;
  shear?: number;
}

interface AdcpVelocityProfileChartProps {
  bins?: AdcpBin[];
  title?: string;
  width?: number;
  height?: number;
}

export const AdcpVelocityProfileChart: React.FC<AdcpVelocityProfileChartProps> = ({
  bins = [],
  title = 'Acoustic Current Velocity Column (m/s)',
  width = 340,
  height = 260,
}) => {
  const sampleBins: AdcpBin[] = bins.length > 0 ? bins : [
    { depth: 20, u_velocity: 1.18, v_velocity: 0.22, magnitude: 1.20, direction: 79.4, shear: 0.004 },
    { depth: 50, u_velocity: 1.22, v_velocity: 0.20, magnitude: 1.24, direction: 80.7, shear: 0.006 },
    { depth: 100, u_velocity: 0.95, v_velocity: 0.12, magnitude: 0.96, direction: 82.8, shear: 0.014 },
    { depth: 150, u_velocity: 0.54, v_velocity: 0.04, magnitude: 0.54, direction: 85.8, shear: 0.011 },
    { depth: 200, u_velocity: 0.22, v_velocity: -0.05, magnitude: 0.23, direction: 102.8, shear: 0.008 },
    { depth: 300, u_velocity: -0.15, v_velocity: -0.08, magnitude: 0.17, direction: 241.9, shear: 0.005 },
    { depth: 500, u_velocity: -0.08, v_velocity: -0.02, magnitude: 0.08, direction: 256.0, shear: 0.002 },
  ];

  const padding = { top: 30, right: 30, bottom: 35, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxDepth = Math.max(...sampleBins.map((b) => b.depth), 100);
  const maxVel = Math.max(...sampleBins.map((b) => b.magnitude), 1.0) * 1.15;

  const getY = (depth: number) => {
    return padding.top + (depth / maxDepth) * chartHeight;
  };

  const getX = (mag: number) => {
    return padding.left + (mag / maxVel) * chartWidth;
  };

  const pathStr = sampleBins
    .map((b, i) => {
      const x = getX(b.magnitude);
      const y = getY(b.depth);
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
        <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
          {sampleBins.length} Depth Bins
        </span>
      </div>

      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Depth Grid Lines */}
        {sampleBins.map((b, i) => {
          const y = getY(b.depth);
          return (
            <g key={i}>
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
                {b.depth}m
              </text>
            </g>
          );
        })}

        {/* Velocity Axis Top */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={width - padding.right}
          y2={padding.top}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x={padding.left}
          y={padding.top - 8}
          fill="var(--accent)"
          fontSize="9px"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          0.0 m/s
        </text>
        <text
          x={width - padding.right}
          y={padding.top - 8}
          fill="var(--accent)"
          fontSize="9px"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          textAnchor="end"
        >
          {maxVel.toFixed(2)} m/s
        </text>

        {/* Velocity Profile Line */}
        <path
          d={pathStr}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bin Vector Dots with Direction Tooltips */}
        {sampleBins.map((b, i) => {
          const x = getX(b.magnitude);
          const y = getY(b.depth);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="var(--accent)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Velocity annotation */}
              <text
                x={x + 8}
                y={y + 3}
                fill="var(--text-primary)"
                fontSize="9px"
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                {b.magnitude.toFixed(2)} m/s ({b.direction.toFixed(0)}°)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

import React, { useState } from 'react';

export interface SawtoothDive {
  dive: number;
  depth_profile: number[];
  temp: number[];
  sal?: number[];
  oxygen?: number[];
}

interface SawtoothGliderChartProps {
  dives?: SawtoothDive[];
  title?: string;
  width?: number;
  height?: number;
}

export const SawtoothGliderChart: React.FC<SawtoothGliderChartProps> = ({
  dives = [],
  title = 'Underwater Glider Sawtooth Undulation Profile',
  width = 340,
  height = 220,
}) => {
  const [activeDive, setActiveDive] = useState<number | null>(null);

  if (!dives || dives.length === 0) {
    // Default synthetic sawtooth profile if not provided
    dives = [
      {
        dive: 340,
        depth_profile: [0, 100, 300, 600, 1000, 600, 300, 100, 0],
        temp: [29.1, 26.5, 20.2, 14.8, 6.2, 14.5, 20.1, 26.4, 28.9],
      },
      {
        dive: 341,
        depth_profile: [0, 100, 300, 600, 1000, 600, 300, 100, 0],
        temp: [29.0, 26.3, 19.8, 14.2, 6.0, 14.1, 19.9, 26.2, 28.8],
      },
      {
        dive: 342,
        depth_profile: [0, 100, 300, 600, 1000, 600, 300, 100, 0],
        temp: [28.9, 26.1, 19.5, 13.9, 5.8, 13.8, 19.6, 26.0, 28.6],
      },
    ];
  }

  const padding = { top: 30, right: 25, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxDepth = 1000;
  const totalPoints = dives.length * 8;

  const getY = (depth: number) => {
    return padding.top + (depth / maxDepth) * chartHeight;
  };

  const getX = (globalIndex: number) => {
    return padding.left + (globalIndex / totalPoints) * chartWidth;
  };

  // Generate sawtooth path
  let globalIdx = 0;
  let pathStr = '';

  dives.forEach((d, dIdx) => {
    const pts = d.depth_profile || [0, 200, 500, 1000, 500, 200, 0];
    pts.forEach((depth, pIdx) => {
      const x = getX(globalIdx);
      const y = getY(depth);
      if (globalIdx === 0) {
        pathStr += `M ${x} ${y}`;
      } else {
        pathStr += ` L ${x} ${y}`;
      }
      globalIdx++;
    });
  });

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h5 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h5>
        <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
          {dives.length} Dives Sequence
        </span>
      </div>

      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Depth grid lines */}
        {[0, 250, 500, 750, 1000].map((depth) => {
          const y = getY(depth);
          return (
            <g key={depth}>
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
                {depth}m
              </text>
            </g>
          );
        })}

        {/* Sea Surface Baseline */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={width - padding.right}
          y2={padding.top}
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Sawtooth Flight Path */}
        <path
          d={pathStr}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dive Labels along bottom */}
        {dives.map((d, i) => {
          const midX = padding.left + ((i + 0.5) / dives.length) * chartWidth;
          return (
            <text
              key={d.dive}
              x={midX}
              y={height - padding.bottom + 18}
              fill="var(--text-secondary)"
              fontSize="9.5px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              textAnchor="middle"
            >
              Dive #{d.dive}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

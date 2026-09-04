import React, { useState } from 'react';

export interface VerticalProfileData {
  depths: number[];
  temp: number[];
  sal?: number[];
  dissolved_o2?: number[];
  density?: number[];
}

interface VerticalProfileChartProps {
  data: VerticalProfileData;
  title?: string;
  width?: number;
  height?: number;
  primaryVariable?: 'temp' | 'sal' | 'dissolved_o2' | 'density';
  showDualAxis?: boolean;
}

export const VerticalProfileChart: React.FC<VerticalProfileChartProps> = ({
  data,
  title = 'Vertical Hydrographic Profile (T/S vs Depth)',
  width = 340,
  height = 360,
  showDualAxis = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const depths = data.depths || [];
  const temps = data.temp || [];
  const sals = data.sal || [];
  const o2s = data.dissolved_o2 || [];

  if (depths.length === 0) {
    return (
      <div
        style={{
          width,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: '12px',
        }}
      >
        No profile sensor levels available
      </div>
    );
  }

  const padding = { top: 35, right: 40, bottom: 40, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Depth range (0 to max depth)
  const maxDepth = Math.max(...depths, 100);
  const minDepth = 0;

  // Temp range
  const minTemp = temps.length ? Math.floor(Math.min(...temps)) - 1 : 0;
  const maxTemp = temps.length ? Math.ceil(Math.max(...temps)) + 1 : 30;

  // Salinity range
  const minSal = sals.length ? Math.floor(Math.min(...sals) * 10) / 10 - 0.2 : 32.0;
  const maxSal = sals.length ? Math.ceil(Math.max(...sals) * 10) / 10 + 0.2 : 36.5;

  const getY = (depth: number) => {
    return padding.top + ((depth - minDepth) / (maxDepth - minDepth)) * chartHeight;
  };

  const getTempX = (temp: number) => {
    return padding.left + ((temp - minTemp) / (maxTemp - minTemp)) * chartWidth;
  };

  const getSalX = (sal: number) => {
    return padding.left + ((sal - minSal) / (maxSal - minSal)) * chartWidth;
  };

  // Generate SVG path strings
  const tempPath = depths
    .map((d, i) => {
      if (temps[i] === undefined) return '';
      const x = getTempX(temps[i]);
      const y = getY(d);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const salPath =
    showDualAxis && sals.length > 0
      ? depths
          .map((d, i) => {
            if (sals[i] === undefined) return '';
            const x = getSalX(sals[i]);
            const y = getY(d);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')
      : '';

  // Depth grid ticks (e.g. 5 ticks)
  const depthTicks = [0, 0.25, 0.5, 0.75, 1.0].map((pct) => Math.round(minDepth + pct * (maxDepth - minDepth)));

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
        <h5 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.02em' }}>
          {title}
        </h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b6b', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '2px', backgroundColor: '#ff6b6b', display: 'inline-block' }} />
            Temp (°C)
          </span>
          {showDualAxis && sals.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '2px', backgroundColor: '#0ea5e9', display: 'inline-block' }} />
              Salinity (PSU)
            </span>
          )}
        </div>
      </div>

      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {/* Depth Grid Lines */}
        {depthTicks.map((d, i) => {
          const y = getY(d);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fill="var(--text-muted)"
                fontSize="9.5px"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {d} m
              </text>
            </g>
          );
        })}

        {/* Temperature X-Axis (Top) */}
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
          fill="#ff6b6b"
          fontSize="9px"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          {minTemp}°C
        </text>
        <text
          x={width - padding.right}
          y={padding.top - 8}
          fill="#ff6b6b"
          fontSize="9px"
          fontFamily="var(--font-mono)"
          fontWeight="600"
          textAnchor="end"
        >
          {maxTemp}°C
        </text>

        {/* Salinity X-Axis (Bottom) */}
        {showDualAxis && sals.length > 0 && (
          <>
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={padding.left}
              y={height - padding.bottom + 16}
              fill="#0ea5e9"
              fontSize="9px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {minSal.toFixed(1)} PSU
            </text>
            <text
              x={width - padding.right}
              y={height - padding.bottom + 16}
              fill="#0ea5e9"
              fontSize="9px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              textAnchor="end"
            >
              {maxSal.toFixed(1)} PSU
            </text>
          </>
        )}

        {/* Depth Y-Axis Line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Salinity Curve */}
        {salPath && (
          <path
            d={salPath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        )}

        {/* Temperature Curve */}
        {tempPath && (
          <path
            d={tempPath}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data Point Circles & Hover interaction */}
        {depths.map((d, i) => {
          const y = getY(d);
          const tx = getTempX(temps[i]);
          const sx = sals[i] !== undefined ? getSalX(sals[i]) : null;
          const isHovered = hoverIndex === i;

          return (
            <g key={i}>
              {/* Temp Point */}
              <circle
                cx={tx}
                cy={y}
                r={isHovered ? 5 : 3}
                fill="#ff6b6b"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />

              {/* Salinity Point */}
              {sx !== null && (
                <circle
                  cx={sx}
                  cy={y}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#0ea5e9"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              )}
            </g>
          );
        })}

        {/* Hover Crosshair Tooltip */}
        {hoverIndex !== null && depths[hoverIndex] !== undefined && (
          <g transform={`translate(${getTempX(temps[hoverIndex])}, ${getY(depths[hoverIndex])})`}>
            <circle r="7" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.6" />
          </g>
        )}
      </svg>

      {/* Hover Info Card */}
      {hoverIndex !== null && depths[hoverIndex] !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 10px',
            boxShadow: 'var(--shadow-md)',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            zIndex: 10,
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Depth: <strong>{depths[hoverIndex]} m</strong></div>
          <div style={{ color: '#ff6b6b' }}>Temp: <strong>{temps[hoverIndex]?.toFixed(2)} °C</strong></div>
          {sals[hoverIndex] !== undefined && (
            <div style={{ color: '#0ea5e9' }}>Salinity: <strong>{sals[hoverIndex]?.toFixed(2)} PSU</strong></div>
          )}
          {o2s[hoverIndex] !== undefined && (
            <div style={{ color: 'var(--accent)' }}>DO: <strong>{o2s[hoverIndex]?.toFixed(1)} µmol/kg</strong></div>
          )}
        </div>
      )}
    </div>
  );
};

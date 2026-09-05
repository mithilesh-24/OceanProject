import React from 'react';

export interface MhwTimePoint {
  day: number;
  date: string;
  observed_temp: number;
  climatology_mean: number;
  threshold_90th: number;
  threshold_2x?: number;
  threshold_3x?: number;
  anomaly: number;
  is_heatwave: boolean;
  mhw_category: string;
}

interface AnomalyTimeSeriesChartProps {
  data: MhwTimePoint[];
  eventName: string;
  units?: string;
  height?: number;
}

export const AnomalyTimeSeriesChart: React.FC<AnomalyTimeSeriesChartProps> = ({
  data,
  eventName,
  units = '°C',
  height = 240,
}) => {
  if (!data || data.length === 0) return null;

  // Compute min and max for scaling
  const allVals = data.flatMap((d) => [d.observed_temp, d.climatology_mean, d.threshold_90th]);
  const minVal = Math.floor(Math.min(...allVals) - 0.5);
  const maxVal = Math.ceil(Math.max(...allVals) + 0.5);
  const range = Math.max(1.0, maxVal - minVal);

  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const width = 620;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / (data.length - 1)) * plotW;
  const getY = (val: number) => padTop + (1.0 - (val - minVal) / range) * plotH;

  // Generate SVG path strings
  const obsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.observed_temp)}`).join(' ');
  const climPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.climatology_mean)}`).join(' ');
  const threshPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.threshold_90th)}`).join(' ');

  return (
    <div className="chart-wrapper-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {eventName} — Marine Heatwave Evolution
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Hobday et al. MHW definition (90th percentile climatology exceedance)
          </span>
        </div>
        <span className="badge-rose">
          Peak: +{Math.max(...data.map((d) => d.anomaly)).toFixed(2)} {units}
        </span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', maxWidth: '620px' }}>
          {/* Grid lines */}
          {[minVal, minVal + range * 0.33, minVal + range * 0.66, maxVal].map((val, i) => {
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.15)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Climatology Baseline (Dashed Slate) */}
          <path d={climPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* 90th Percentile Threshold (Dashed Amber) */}
          <path d={threshPath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Observed Temperature Line (Solid Vibrant Crimson) */}
          <path d={obsPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

          {/* Data Points */}
          {data.map((d, i) => {
            if (!d.is_heatwave) return null;
            return (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.observed_temp)}
                r="3.5"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1"
              />
            );
          })}

          {/* X Axis Date labels */}
          {data.filter((_, i) => i % 5 === 0).map((d, i) => (
            <text
              key={i}
              x={getX(data.indexOf(d))}
              y={height - 8}
              textAnchor="middle"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {d.date.slice(5)}
            </text>
          ))}
        </svg>
      </div>

      {/* Chart Legend */}
      <div style={{ width: '100%', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#f43f5e', borderRadius: '1px' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Observed Temperature</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #f59e0b' }} />
          <span style={{ color: 'var(--text-secondary)' }}>90th Percentile Threshold</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #64748b' }} />
          <span style={{ color: 'var(--text-muted)' }}>Climatology Mean Baseline</span>
        </div>
      </div>
    </div>
  );
};

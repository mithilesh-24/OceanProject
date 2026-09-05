import React from 'react';

export interface CorrelationMatrixPayload {
  variables: string[];
  matrix: number[][];
}

interface CorrelationMatrixChartProps {
  data: CorrelationMatrixPayload;
}

export const CorrelationMatrixChart: React.FC<CorrelationMatrixChartProps> = ({ data }) => {
  if (!data || !data.variables || !data.matrix) return null;

  const { variables, matrix } = data;

  const getCellStyle = (r: number): React.CSSProperties => {
    if (r === 1.0) {
      return { backgroundColor: 'rgba(6, 182, 212, 0.25)', color: '#67e8f9', fontWeight: 700 };
    }
    if (r > 0.6) {
      return { backgroundColor: 'rgba(37, 99, 235, 0.3)', color: '#93c5fd', fontWeight: 600 };
    }
    if (r > 0.2) {
      return { backgroundColor: 'rgba(30, 58, 138, 0.3)', color: '#60a5fa' };
    }
    if (r < -0.6) {
      return { backgroundColor: 'rgba(225, 29, 72, 0.3)', color: '#fda4af', fontWeight: 600 };
    }
    if (r < -0.2) {
      return { backgroundColor: 'rgba(136, 19, 55, 0.3)', color: '#fb7185' };
    }
    return { backgroundColor: 'rgba(30, 41, 59, 0.3)', color: '#94a3b8' };
  };

  return (
    <div className="chart-wrapper-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Multi-Variable Oceanographic Correlation Matrix
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Pairwise Pearson correlation coefficients (r ∈ [−1.0, +1.0])
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '12px', textAlign: 'center', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Variable
              </th>
              {variables.map((v, i) => (
                <th key={i} style={{ padding: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            {variables.map((rowVar, rowIdx) => (
              <tr key={rowIdx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px', textAlign: 'left', fontFamily: 'var(--font-main)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {rowVar}
                </td>
                {matrix[rowIdx].map((rVal, colIdx) => (
                  <td
                    key={colIdx}
                    style={{
                      padding: '8px',
                      transition: 'background-color 0.15s ease',
                      ...getCellStyle(rVal),
                    }}
                    title={`${rowVar} vs ${variables[colIdx]}: r = ${rVal.toFixed(2)}`}
                  >
                    {rVal > 0 && rVal !== 1.0 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Matrix Legend */}
      <div style={{ width: '100%', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>−1.0 (Strong Negative)</span>
        <div
          style={{
            height: '8px',
            width: '160px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, #f43f5e, #1e293b, #06b6d4)',
          }}
        />
        <span>+1.0 (Strong Positive)</span>
      </div>
    </div>
  );
};

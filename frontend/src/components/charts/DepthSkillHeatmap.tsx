import React from 'react';

export interface DepthStrataItem {
  strata_id: string;
  name: string;
  depth_range: string;
  rmse: number;
  bias: number;
  correlation: number;
  skill_score: number;
  sample_count: number;
  rating?: string;
}

interface DepthSkillHeatmapProps {
  strata: DepthStrataItem[];
  modelName: string;
  variable: string;
  units: string;
}

export const DepthSkillHeatmap: React.FC<DepthSkillHeatmapProps> = ({
  strata,
  modelName,
  variable,
  units,
}) => {
  const getBadgeClass = (score: number) => {
    if (score >= 0.9) return 'badge-emerald';
    if (score >= 0.8) return 'badge-cyan';
    if (score >= 0.7) return 'badge-amber';
    return 'badge-rose';
  };

  return (
    <div className="chart-wrapper-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Depth Strata Accuracy &amp; Skill Decomposition
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Model skill score SS = 1 − (MSE / σ_obs²) across ocean layers
          </p>
        </div>
        <span className="badge-cyan">
          {modelName.toUpperCase()}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 10px', fontWeight: 600 }}>Ocean Layer</th>
              <th style={{ padding: '8px 8px', fontWeight: 600 }}>Depth</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600 }}>Skill Score (SS)</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 600 }}>RMSE ({units})</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 600 }}>Bias ({units})</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 600 }}>Corr (R)</th>
              <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 600 }}>Samples</th>
            </tr>
          </thead>
          <tbody style={{ fontFamily: 'var(--font-mono)' }}>
            {strata.map((s) => (
              <tr key={s.strata_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '8px 10px', fontFamily: 'var(--font-main)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {s.name}
                </td>
                <td style={{ padding: '8px 8px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {s.depth_range}
                </td>
                <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                  <span className={getBadgeClass(s.skill_score)}>
                    {(s.skill_score * 100).toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {s.rmse.toFixed(3)}
                </td>
                <td
                  style={{
                    padding: '8px 8px',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: s.bias > 0 ? '#f59e0b' : s.bias < 0 ? '#38bdf8' : '#10b981',
                  }}
                >
                  {s.bias > 0 ? `+${s.bias.toFixed(3)}` : s.bias.toFixed(3)}
                </td>
                <td style={{ padding: '8px 8px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                  {s.correlation.toFixed(3)}
                </td>
                <td style={{ padding: '8px 8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '11px' }}>
                  {s.sample_count.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

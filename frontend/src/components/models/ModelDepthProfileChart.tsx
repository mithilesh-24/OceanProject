import React, { useState, useEffect, useRef } from 'react';
import { Activity, Compass, RefreshCw, Layers } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { ModelProfileData, api } from '../../services/apiClient';

interface ModelDepthProfileChartProps {
  modelId: string;
  latitude: number;
  longitude: number;
}

export const ModelDepthProfileChart: React.FC<ModelDepthProfileChartProps> = ({
  modelId,
  latitude,
  longitude,
}) => {
  const [profile, setProfile] = useState<ModelProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVar, setActiveVar] = useState<'temperature' | 'salinity' | 'density'>('temperature');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getModelProfile(modelId, { lat: latitude, lon: longitude, variable: activeVar })
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to extract model profile:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [modelId, latitude, longitude, activeVar]);

  // Render Depth Profile Curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !profile || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const depths = profile.depths;
    const maxDepth = depths[depths.length - 1];

    const values = activeVar === 'temperature'
      ? profile.temperature_profile
      : (activeVar === 'salinity' ? profile.salinity_profile : profile.density_profile);

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1.0;

    // Draw Mixed Layer Depth (MLD) band
    if (profile.mixed_layer_depth_m) {
      const mldY = padTop + (profile.mixed_layer_depth_m / maxDepth) * chartH;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fillRect(padLeft, padTop, chartW, mldY - padTop);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, mldY);
      ctx.lineTo(padLeft + chartW, mldY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9.5px monospace';
      ctx.fillText(`MLD: ${profile.mixed_layer_depth_m}m`, padLeft + 6, mldY - 4);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padTop + (i / 5) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      const dVal = Math.round((i / 5) * maxDepth);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${dVal}m`, padLeft - 6, y + 3);
    }

    // Curve Path
    const colorMap = {
      temperature: '#f43f5e',
      salinity: '#06b6d4',
      density: '#a855f7'
    };
    const strokeColor = colorMap[activeVar];

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    depths.forEach((d, idx) => {
      const val = values[idx];
      const x = padLeft + ((val - minVal) / valRange) * chartW;
      const y = padTop + (d / maxDepth) * chartH;

      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points
    depths.forEach((d, idx) => {
      const val = values[idx];
      const x = padLeft + ((val - minVal) / valRange) * chartW;
      const y = padTop + (d / maxDepth) * chartH;

      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Value Axis Labels at bottom
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${minVal.toFixed(1)} ${profile.units}`, padLeft + 20, height - 8);
    ctx.fillText(`${maxVal.toFixed(1)} ${profile.units}`, padLeft + chartW - 20, height - 8);
  }, [profile, loading, activeVar]);

  return (
    <div className="ui-card space-y-3" style={{ padding: '16px', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Vertical Column Profile (Point Extraction)
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Probe: {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
          </span>
        </div>

        {/* Variable Switcher */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            variant={activeVar === 'temperature' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveVar('temperature')}
            style={{ fontSize: '10.5px', height: '24px', padding: '0 6px' }}
          >
            Temp (°C)
          </Button>
          <Button
            variant={activeVar === 'salinity' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveVar('salinity')}
            style={{ fontSize: '10.5px', height: '24px', padding: '0 6px' }}
          >
            Sal (PSU)
          </Button>
          <Button
            variant={activeVar === 'density' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveVar('density')}
            style={{ fontSize: '10.5px', height: '24px', padding: '0 6px' }}
          >
            Density (σₜ)
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '100%', backgroundColor: '#090d16', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9, 13, 22, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <RefreshCw className="w-5 h-5 text-[var(--primary)] animate-spin" />
            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-primary)' }}>Extracting column...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={360}
          height={260}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Physics Stats Pill */}
      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', backgroundColor: 'var(--bg-surface-secondary)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Surface Temp:</span>{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{profile.surface_temp} °C</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Thermocline:</span>{' '}
            <strong style={{ color: 'var(--primary)' }}>~{profile.thermocline_depth_m} m</strong>
          </div>
        </div>
      )}
    </div>
  );
};

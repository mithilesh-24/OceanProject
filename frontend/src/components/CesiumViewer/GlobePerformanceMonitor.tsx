import React, { useState, useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { detectGpuCapabilities } from '../../utils/gpuAcceleration';

interface GlobePerformanceMonitorProps {
  viewer: Cesium.Viewer | null;
  particleCount?: number;
  observationCount?: number;
  onDynamicQualityAdjust?: (level: 'high' | 'medium' | 'low') => void;
}

export const GlobePerformanceMonitor: React.FC<GlobePerformanceMonitorProps> = ({
  viewer,
  particleCount = 1800,
  observationCount = 0,
  onDynamicQualityAdjust,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [frameTimeMs, setFrameTimeMs] = useState(16.6);
  const [cameraAlt, setCameraAlt] = useState(18000);
  const [primitivesCount, setPrimitivesCount] = useState(0);
  const [gpuInfo] = useState(() => detectGpuCapabilities());

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (now: number) => {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (delta > 0 && delta < 200) {
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 30) {
          frameTimesRef.current.shift();
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    // 1-second telemetry refresh interval
    const timer = setInterval(() => {
      if (frameTimesRef.current.length > 0) {
        const avgDelta = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        const currentFps = Math.round(1000 / Math.max(1, avgDelta));
        setFps(Math.min(60, currentFps));
        setFrameTimeMs(Number(avgDelta.toFixed(1)));

        // Dynamic quality adaptation if FPS drops below 30
        if (currentFps < 28 && onDynamicQualityAdjust) {
          onDynamicQualityAdjust('low');
        } else if (currentFps < 45 && onDynamicQualityAdjust) {
          onDynamicQualityAdjust('medium');
        }
      }

      if (viewer && !viewer.isDestroyed()) {
        const alt = viewer.camera.positionCartographic?.height || 18000000;
        setCameraAlt(Math.round(alt / 1000));
        try {
          setPrimitivesCount(viewer.scene.primitives.length);
        } catch {
          // Ignore
        }
      }
    }, 800);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      clearInterval(timer);
    };
  }, [viewer, onDynamicQualityAdjust]);

  const fpsColor = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '36px',
        right: '16px',
        zIndex: 40,
        fontFamily: 'Inter, monospace',
        fontSize: '11px',
        pointerEvents: 'auto',
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(10, 10, 10, 0.85)',
            border: '1px solid #262626',
            borderRadius: '6px',
            padding: '4px 8px',
            color: '#e5e5e5',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
          title="Toggle Real-Time GIS Rendering Performance Telemetry"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: fpsColor,
              display: 'inline-block',
              boxShadow: `0 0 6px ${fpsColor}`,
            }}
          />
          <span style={{ fontWeight: 600 }}>{fps} FPS</span>
          <span style={{ color: '#737373' }}>| {frameTimeMs}ms</span>
        </button>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(10, 10, 10, 0.92)',
            border: '1px solid #262626',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#d4d4d4',
            width: '240px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f1f1f', paddingBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: fpsColor, boxShadow: `0 0 6px ${fpsColor}` }} />
              Rendering Telemetry
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#737373',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>Frame Rate</span>
            <span style={{ fontWeight: 700, color: fpsColor }}>{fps} FPS ({frameTimeMs} ms)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>GPU Acceleration</span>
            <span style={{ color: gpuInfo.isGpuAvailable ? '#38bdf8' : '#f59e0b', fontWeight: 600 }}>
              {gpuInfo.isGpuAvailable ? `WebGL 2.0 (${gpuInfo.tier.toUpperCase()})` : 'CPU Rasterizer'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>Ocean Particles</span>
            <span style={{ color: '#e5e5e5' }}>{particleCount.toLocaleString()} pts</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>Visible Platforms</span>
            <span style={{ color: '#e5e5e5' }}>{observationCount.toLocaleString()} units</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>Cesium Primitives</span>
            <span style={{ color: '#e5e5e5' }}>{primitivesCount} collections</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a3a3a3' }}>Camera Altitude</span>
            <span style={{ color: '#e5e5e5' }}>{cameraAlt.toLocaleString()} km</span>
          </div>
        </div>
      )}
    </div>
  );
};

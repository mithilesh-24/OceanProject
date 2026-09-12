import React, { useEffect, useRef, useState } from 'react';
import { Wind, Waves, Gauge, Compass, Play, Pause, Zap } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  speed: number;
  color: string;
}

type StreamMode = 'wind' | 'current' | 'jetstream';

interface WindStreamCanvasProps {
  onExploreClick?: () => void;
  className?: string;
}

export const WindStreamCanvas: React.FC<WindStreamCanvasProps> = ({
  onExploreClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<StreamMode>('wind');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [telemetry, setTelemetry] = useState({
    speedKts: 18.2,
    directionDeg: 236,
    directionText: 'SW',
    tempC: 28.6,
    activeParticles: 1400
  });

  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = 460);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = 460;
    };

    window.addEventListener('resize', handleResize);

    // High contrast, vibrant palettes designed specifically for crystal visibility
    const modeConfigs = {
      wind: {
        count: 1400,
        baseSpeed: 2.6,
        colors: [
          '#0369a1', // Deep Sky Blue
          '#0284c7', // Cerulean
          '#0ea5e9', // Vivid Cyan
          '#38bdf8', // Light Cyan Glow
          '#004e89', // Navy Accent
          '#ffffff', // High-Visibility White
        ],
        trailAlpha: 0.08,
        lineWidth: 2.2,
        noiseScale: 0.0032,
        timeScale: 0.001,
      },
      current: {
        count: 1500,
        baseSpeed: 2.0,
        colors: [
          '#0f766e', // Deep Teal
          '#0d9488', // Teal
          '#14b8a6', // Bright Teal
          '#059669', // Emerald
          '#10b981', // Sea Green
          '#ffffff', // White Core
        ],
        trailAlpha: 0.07,
        lineWidth: 2.4,
        noiseScale: 0.0038,
        timeScale: 0.0007,
      },
      jetstream: {
        count: 1600,
        baseSpeed: 3.8,
        colors: [
          '#4338ca', // Deep Indigo
          '#6366f1', // Electric Indigo
          '#818cf8', // Vivid Periwinkle
          '#0ea5e9', // Sky Glow
          '#9333ea', // Purple Core
          '#ffffff', // White Flash
        ],
        trailAlpha: 0.09,
        lineWidth: 2.5,
        noiseScale: 0.0024,
        timeScale: 0.0014,
      }
    };

    const currentCfg = modeConfigs[mode];
    const particles: Particle[] = [];

    const initParticle = (p?: Particle): Particle => {
      const color = currentCfg.colors[Math.floor(Math.random() * currentCfg.colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        age: Math.floor(Math.random() * 90),
        maxAge: 80 + Math.floor(Math.random() * 90),
        speed: (0.75 + Math.random() * 0.7) * currentCfg.baseSpeed * speedMultiplier,
        color
      };
    };

    for (let i = 0; i < currentCfg.count; i++) {
      particles.push(initParticle());
    }

    // Dynamic hydrodynamic vector calculations
    const getFieldAngle = (x: number, y: number, t: number) => {
      const s = currentCfg.noiseScale;
      let angle =
        Math.sin(x * s + t) * 1.9 +
        Math.cos(y * s * 1.3 + t * 0.8) * 1.5 +
        Math.sin((x + y) * s * 0.6 + t * 1.4) * 0.9;

      // Cursor interaction vortex deflection
      if (mousePosRef.current.active) {
        const dx = x - mousePosRef.current.x;
        const dy = y - mousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 1) {
          const mouseAngle = Math.atan2(dy, dx);
          const force = (1 - dist / 180) * 2.2;
          angle += mouseAngle * force;
        }
      }

      return angle;
    };

    let time = 0;

    // Fill initial canvas state with subtle contrast tint
    ctx.fillStyle = '#ebf5ff';
    ctx.fillRect(0, 0, width, height);

    const render = () => {
      if (isPlaying) {
        time += currentCfg.timeScale;

        // Fading semi-transparent backdrop creates clean trailing streamlines
        ctx.fillStyle = `rgba(235, 245, 255, ${currentCfg.trailAlpha})`;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const prevX = p.x;
          const prevY = p.y;

          const angle = getFieldAngle(p.x, p.y, time);
          p.vx = Math.cos(angle) * p.speed;
          p.vy = Math.sin(angle) * p.speed;

          p.x += p.vx;
          p.y += p.vy;
          p.age++;

          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = currentCfg.lineWidth;
          ctx.lineCap = 'round';

          // Bright smooth fade in/out
          const lifeRatio = p.age / p.maxAge;
          const alpha = lifeRatio < 0.15 ? lifeRatio / 0.15 : (1 - lifeRatio);
          ctx.globalAlpha = Math.max(0.05, Math.min(1.0, alpha * 1.2));
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Wrap or respawn
          if (
            p.x < -20 ||
            p.x > width + 20 ||
            p.y < -20 ||
            p.y > height + 20 ||
            p.age >= p.maxAge
          ) {
            particles[i] = initParticle(p);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Live realistic telemetry updates
    const telemetryInterval = setInterval(() => {
      setTelemetry((prev) => {
        const baseSpeed = mode === 'wind' ? 18.2 : mode === 'current' ? 4.2 : 46.5;
        const speedDelta = (Math.random() - 0.5) * 0.9;
        const dirDelta = Math.floor((Math.random() - 0.5) * 6);
        return {
          ...prev,
          speedKts: parseFloat(Math.max(1, baseSpeed + speedDelta).toFixed(1)),
          directionDeg: (prev.directionDeg + dirDelta + 360) % 360,
          tempC: parseFloat((28.6 + (Math.random() - 0.5) * 0.2).toFixed(1)),
          activeParticles: currentCfg.count
        };
      });
    }, 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearInterval(telemetryInterval);
    };
  }, [mode, isPlaying, speedMultiplier]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className={`cir-wind-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '980px',
        margin: '6px auto 32px auto',
        borderRadius: '26px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ebf5ff 0%, #d8ecfe 100%)',
        border: '1.5px solid rgba(227, 232, 238, 0.95)',
        boxShadow: '0 24px 48px -20px rgba(14, 17, 22, 0.16), 0 2px 4px rgba(14, 17, 22, 0.04)',
      }}
    >
      {/* Top Floating Controls Bar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '18px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          pointerEvents: 'auto',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Layer Mode Switcher Pills */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            padding: '4px 6px',
            borderRadius: '999px',
            border: '1px solid rgba(200, 215, 230, 0.9)',
            boxShadow: '0 4px 14px rgba(14, 17, 22, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('wind')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'wind' ? '#0e1116' : 'transparent',
              color: mode === 'wind' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: mode === 'wind' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Surface Wind (10m)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('current')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'current' ? '#0e1116' : 'transparent',
              color: mode === 'current' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: mode === 'current' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Ocean Currents (0m)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('jetstream')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'jetstream' ? '#0e1116' : 'transparent',
              color: mode === 'jetstream' ? '#ffffff' : '#475569',
              fontSize: '13px',
              fontWeight: mode === 'jetstream' ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Jet Stream (250 hPa)</span>
          </button>
        </div>

        {/* Play / Speed Controls */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(12px)',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(200, 215, 230, 0.9)',
            boxShadow: '0 4px 14px rgba(14, 17, 22, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(14, 17, 22, 0.08)',
              color: '#0e1116',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} />

          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Speed:</span>
          {[1, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeedMultiplier(s)}
              style={{
                border: 'none',
                background: speedMultiplier === s ? '#0e1116' : 'transparent',
                color: speedMultiplier === s ? '#ffffff' : '#64748b',
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* The Animated Canvas Element - Unobstructed View */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'block',
          width: '100%',
          height: '460px',
          cursor: 'crosshair',
        }}
      />

      {/* Bottom Live Telemetry HUD Strip */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '18px',
          right: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(200, 215, 230, 0.9)',
          borderRadius: '16px',
          padding: '10px 20px',
          zIndex: 10,
          fontSize: '12.5px',
          color: '#0e1116',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 16px rgba(14, 17, 22, 0.06)',
        }}
      >
        {/* Left Telemetry Points */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge className="w-4 h-4 text-sky-600" />
            <span style={{ color: '#64748b' }}>Mean Speed:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {telemetry.speedKts} kts ({((telemetry.speedKts * 1.852)).toFixed(1)} km/h)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass className="w-4 h-4 text-teal-600" />
            <span style={{ color: '#64748b' }}>Direction:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {telemetry.directionDeg}° {telemetry.directionText}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#64748b' }}>SST:</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{telemetry.tempC} °C</span>
          </div>
        </div>

        {/* Right Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#64748b' }}>
          <span>Indian Ocean Hydrodynamics</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#94a3b8' }} />
          <span>{telemetry.activeParticles} Streamlines</span>
        </div>
      </div>
    </div>
  );
};

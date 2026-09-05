import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Clock, Calendar, Bookmark, Radio, Activity } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { TimelineData, api } from '../../services/apiClient';

interface TimelineControlBarProps {
  currentProgressPct: number;
  onSeek: (pct: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentTimestamp: string;
  activePlatformCount?: number;
}

export const TimelineControlBar: React.FC<TimelineControlBarProps> = ({
  currentProgressPct,
  onSeek,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  currentTimestamp,
  activePlatformCount = 5,
}) => {
  const [timelineMeta, setTimelineMeta] = useState<TimelineData | null>(null);
  const [hoverMilestone, setHoverMilestone] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getTimeline()
      .then((data) => {
        if (isMounted) setTimelineMeta(data);
      })
      .catch((err) => console.error('Failed to load timeline metadata:', err));
    return () => { isMounted = false; };
  }, []);

  const speeds = [0.5, 1, 2, 5, 10];

  const handleStepBack = () => {
    onSeek(Math.max(0, currentProgressPct - 2.85)); // ~1 day step
  };

  const handleStepForward = () => {
    onSeek(Math.min(100, currentProgressPct + 2.85));
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
    } catch {
      return iso;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 360px)',
        maxWidth: '960px',
        zIndex: 35,
        backgroundColor: 'var(--backdrop-panel)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        padding: '12px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Top Header Row of Timeline Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity className="w-4 h-4 text-[var(--primary)] animate-pulse" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            4D Spatiotemporal Time Machine
          </span>
          <Badge variant="primary" dot>LIVE PLAYBACK</Badge>
          <Badge variant="neutral">{activePlatformCount} Active Assets</Badge>
        </div>

        {/* Current Date & UTC Time Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
          <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{formatDate(currentTimestamp)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>({currentProgressPct.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Scrubbing Timeline Track with Milestone Markers */}
      <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={currentProgressPct}
          onChange={(e) => onSeek(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            appearance: 'none',
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${currentProgressPct}%, rgba(255,255,255,0.15) ${currentProgressPct}%, rgba(255,255,255,0.15) 100%)`,
            outline: 'none',
            cursor: 'pointer'
          }}
        />

        {/* Milestone Marker Pins */}
        {timelineMeta?.milestones.map((m, idx) => {
          // Calculate percentage along 35 days
          const startMs = new Date(timelineMeta.start_date).getTime();
          const endMs = new Date(timelineMeta.end_date).getTime();
          const mMs = new Date(m.date).getTime();
          const mPct = Math.max(0, Math.min(100, ((mMs - startMs) / (endMs - startMs)) * 100));

          return (
            <div
              key={m.id}
              onClick={() => onSeek(mPct)}
              onMouseEnter={() => setHoverMilestone(m)}
              onMouseLeave={() => setHoverMilestone(null)}
              style={{
                position: 'absolute',
                left: `${mPct}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: m.type === 'anomaly' ? '#f43f5e' : (m.type === 'glider' ? '#10b981' : '#00f2fe'),
                border: '2px solid #090d16',
                cursor: 'pointer',
                boxShadow: '0 0 6px rgba(0,242,254,0.6)',
                zIndex: 5
              }}
            />
          );
        })}

        {/* Milestone Tooltip Hover */}
        {hoverMilestone && (
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10.5px',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              zIndex: 30
            }}
          >
            <strong>{hoverMilestone.label}</strong> • {hoverMilestone.date} ({hoverMilestone.platform})
          </div>
        )}
      </div>

      {/* Playback Controls & Speed Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Media Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStepBack}
            iconOnly
            style={{ width: '28px', height: '28px' }}
            aria-label="Step Back 24 Hours"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onTogglePlay}
            style={{ height: '28px', padding: '0 12px', fontSize: '11px', gap: '4px' }}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play 4D Time'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStepForward}
            iconOnly
            style={{ width: '28px', height: '28px' }}
            aria-label="Step Forward 24 Hours"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSeek(0)}
            iconOnly
            style={{ width: '28px', height: '28px' }}
            aria-label="Reset to Start Date"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Start / End Date Bounds */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Aug 01, 2026</span>
          <span>••••••••••••</span>
          <span>Sep 04, 2026</span>
        </div>

        {/* Playback Speed Multiplier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              style={{
                fontSize: '10.5px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: playbackSpeed === s ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                color: playbackSpeed === s ? '#090d16' : 'var(--text-secondary)',
                fontWeight: playbackSpeed === s ? 700 : 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

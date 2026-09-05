import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as Cesium from 'cesium';
import { CesiumViewer } from '../components/CesiumViewer/CesiumViewer';
import { NavigationControls } from '../components/UI/NavigationControls';
import { StatusBar } from '../components/UI/StatusBar';
import { TimelineControlBar } from '../components/explorer/TimelineControlBar';
import { TimeSnapshotData, TimelineData, api } from '../services/apiClient';
import { CoordinateInfo, LayerState, SceneModeType } from '../types';
import { Clock, Activity, Wind, Waves, Play, Pause, Layers, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

const FOUR_D_INITIAL_LAYERS: LayerState = {
  satellite: true,
  vectorMap: false,
  terrain: true,
  terrainExaggeration: 1.5,
  buildings3D: false,
  borders: true,
  labels: true,
  clouds: false,
  bathymetry: false,
  lightingMode: 'readable',
  argoFloats: false, // Managed dynamically by 4D engine
  oceanCurrents: true,
  sst: true,
  salinity: false,
  waveHeight: false,
  seaLevelAnomaly: false,
  chlorophyll: false,
  oceanDepth: false,
};

export const FourDView: React.FC = () => {
  const [layerState, setLayerState] = useState<LayerState>(FOUR_D_INITIAL_LAYERS);
  const [sceneMode, setSceneMode] = useState<SceneModeType>('3D');
  const [timelineMeta, setTimelineMeta] = useState<TimelineData | null>(null);
  
  // 4D Playback State
  const [progressPct, setProgressPct] = useState<number>(100.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [snapshot, setSnapshot] = useState<TimeSnapshotData | null>(null);

  const [coordInfo, setCoordInfo] = useState<CoordinateInfo>({
    latitude: 10.0,
    longitude: 78.0,
    height: 0,
    cameraAltitude: 14000000,
    heading: 0,
    pitch: -75,
  });

  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const dynamicEntitiesRef = useRef<Cesium.Entity[]>([]);

  // Load timeline meta on mount
  useEffect(() => {
    let isMounted = true;
    api.getTimeline()
      .then((data) => {
        if (isMounted) setTimelineMeta(data);
      })
      .catch((err) => console.error('Failed to load timeline metadata:', err));

    return () => { isMounted = false; };
  }, []);

  // Compute current timestamp from progress percentage
  const getCurrentTimestamp = useCallback(() => {
    if (!timelineMeta) return '2026-09-04T12:00:00Z';
    const startMs = new Date(timelineMeta.start_date).getTime();
    const endMs = new Date(timelineMeta.end_date).getTime();
    const currentMs = startMs + ((endMs - startMs) * (progressPct / 100));
    return new Date(currentMs).toISOString();
  }, [timelineMeta, progressPct]);

  // Fetch state snapshot whenever progress changes
  useEffect(() => {
    let isMounted = true;
    const currentIso = getCurrentTimestamp();

    api.getSnapshotAtTime({ timestamp: currentIso })
      .then((data) => {
        if (isMounted) {
          setSnapshot(data);
        }
      })
      .catch((err) => console.error('Failed to load snapshot at time:', err));

    return () => { isMounted = false; };
  }, [progressPct, getCurrentTimestamp]);

  // 4D Animation Playback Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgressPct((prev) => {
        const step = 0.25 * speed;
        if (prev + step >= 100) {
          return 0; // Loop back to start
        }
        return prev + step;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Render moving 4D platform markers & animated trails in Cesium
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !snapshot) return;

    // Clear old 4D entities
    dynamicEntitiesRef.current.forEach((ent) => viewer.entities.remove(ent));
    dynamicEntitiesRef.current = [];

    // 1. Render Moving Argo Floats with Drift Trails
    snapshot.argo_floats.forEach((f) => {
      // Historical trail line
      if (f.trail && f.trail.length > 1) {
        const positions = f.trail.map((p) => Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 1000.0));
        const trailEntity = viewer.entities.add({
          name: `Drift Trail: ${f.name}`,
          polyline: {
            positions,
            width: 3,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.fromCssColorString('#00f2fe').withAlpha(0.8),
            }),
          },
        });
        dynamicEntitiesRef.current.push(trailEntity);
      }

      // Current moving float marker
      const floatEntity = viewer.entities.add({
        name: f.name,
        position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 5000.0),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#00f2fe'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: `Apex #${f.wmo_id} (${f.temp}°C)`,
          font: '11px monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          fillColor: Cesium.Color.WHITE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
        }
      });
      dynamicEntitiesRef.current.push(floatEntity);
    });

    // 2. Render Moving Gliders
    snapshot.gliders.forEach((g) => {
      const gliderEntity = viewer.entities.add({
        name: g.name,
        position: Cesium.Cartesian3.fromDegrees(g.lon, g.lat, 8000.0),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString('#10b981'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
        },
        label: {
          text: `Glider ${g.id} (Dive ${g.dive_depth}m)`,
          font: '11px monospace',
          fillColor: Cesium.Color.fromCssColorString('#10b981'),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
        }
      });
      dynamicEntitiesRef.current.push(gliderEntity);
    });

    // 3. Render Moored Buoys
    snapshot.buoys.forEach((b) => {
      const buoyEntity = viewer.entities.add({
        name: b.name,
        position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, 2000.0),
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          text: `${b.id} (${b.sst}°C)`,
          font: '10px monospace',
          fillColor: Cesium.Color.fromCssColorString('#f59e0b'),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
        }
      });
      dynamicEntitiesRef.current.push(buoyEntity);
    });
  }, [snapshot]);

  return (
    <div className="explorer-viewport">
      {/* Cesium Globe */}
      <CesiumViewer
        layerState={layerState}
        sceneMode={sceneMode}
        measureMode="none"
        placemarks={[]}
        argoColorVariable="temperature"
        onCoordinateUpdate={setCoordInfo}
        onLocationClick={() => {}}
        onMeasurementChange={() => {}}
        viewerRefOut={viewerRef}
      />

      {/* Floating 4D Spatiotemporal Telemetry HUD (Top-Left) */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 30,
          width: '320px',
          backgroundColor: 'var(--backdrop-panel)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-panel)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity className="w-4 h-4 text-[var(--primary)] animate-pulse" />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              4D Ocean Dynamics HUD
            </h3>
          </div>
          <Badge variant={isPlaying ? 'success' : 'neutral'} dot>
            {isPlaying ? 'ANIMATING' : 'PAUSED'}
          </Badge>
        </div>

        {/* Dynamic Ocean State Metrics */}
        {snapshot && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px' }}>Atmospheric-Oceanic Forcing Phase:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{snapshot.current_monsoon_phase}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Mean Basin SST:</span>
                <strong style={{ display: 'block', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {snapshot.mean_basin_temp} °C
                </strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Wyrtki Jet Speed:</span>
                <strong style={{ display: 'block', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {snapshot.wyrtki_jet_velocity} m/s
                </strong>
              </div>
            </div>

            {/* Active Platform Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', padding: '4px 0', borderTop: '1px solid var(--border-subtle)' }}>
              <span>Synchronized In-Situ Assets:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{snapshot.active_platforms_count} Telemetry Feeds</strong>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px' }}>
          <Link to="/3d" style={{ flex: 1, textDecoration: 'none' }}>
            <Button variant="outline" size="sm" style={{ width: '100%', fontSize: '11px' }} leftIcon={<Layers className="w-3.5 h-3.5" />}>
              3D Depth Slicer
            </Button>
          </Link>
          <Link to="/comparison" style={{ flex: 1, textDecoration: 'none' }}>
            <Button variant="primary" size="sm" style={{ width: '100%', fontSize: '11px' }}>
              Compare Models
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating 4D Timeline Control Bar at Bottom */}
      <TimelineControlBar
        currentProgressPct={progressPct}
        onSeek={setProgressPct}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playbackSpeed={speed}
        onChangeSpeed={setSpeed}
        currentTimestamp={getCurrentTimestamp()}
        activePlatformCount={snapshot?.active_platforms_count || 5}
      />

      {/* Navigation Controls (Right Side) */}
      <NavigationControls
        heading={coordInfo.heading}
        pitch={coordInfo.pitch}
        sceneMode={sceneMode}
        onResetNorth={() => {
          if (viewerRef.current) {
            viewerRef.current.camera.flyTo({
              destination: viewerRef.current.camera.position,
              orientation: { heading: 0, pitch: viewerRef.current.camera.pitch, roll: 0 },
              duration: 1.0,
            });
          }
        }}
        onToggleSceneMode={() => setSceneMode((prev) => (prev === '3D' ? '2D' : '3D'))}
        onZoomIn={() => viewerRef.current?.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.4)}
        onZoomOut={() => viewerRef.current?.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.6)}
        onResetTilt={() => {
          viewerRef.current?.camera.flyTo({
            destination: viewerRef.current.camera.position,
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
            duration: 1.0,
          });
        }}
      />

      {/* Bottom Status Bar */}
      <StatusBar coordInfo={coordInfo} />
    </div>
  );
};

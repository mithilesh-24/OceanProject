import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Cesium from 'cesium';
import { CesiumViewer } from '../components/CesiumViewer/CesiumViewer';
import { NavigationControls } from '../components/UI/NavigationControls';
import { StatusBar } from '../components/UI/StatusBar';
import { DepthLayerControl } from '../components/explorer/DepthLayerControl';
import { DepthLayerVisualizationManager } from '../components/CesiumViewer/DepthLayerVisualizationManager';
import { DepthLayerConfig, TimeSnapshotData, api } from '../services/apiClient';
import { CoordinateInfo, LayerState, SceneModeType } from '../types';
import { Layers, Clock, Compass, Activity, Play, RotateCcw, Info, ArrowRight } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

const THREE_D_INITIAL_LAYERS: LayerState = {
  satellite: true,
  vectorMap: false,
  terrain: true,
  terrainExaggeration: 2.0,
  buildings3D: false,
  borders: true,
  labels: true,
  clouds: false,
  bathymetry: true,
  lightingMode: 'readable',
  argoFloats: true,
  oceanCurrents: true,
  sst: true,
  salinity: false,
  waveHeight: false,
  seaLevelAnomaly: false,
  chlorophyll: false,
  oceanDepth: true,
};

export const ThreeDView: React.FC = () => {
  const [layerState, setLayerState] = useState<LayerState>(THREE_D_INITIAL_LAYERS);
  const [sceneMode, setSceneMode] = useState<SceneModeType>('3D');
  const [selectedDepth, setSelectedDepth] = useState<number>(0);
  const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([0, 50, 100, 500, 1000]));
  const [opacity, setOpacity] = useState<number>(0.35);
  const [depthConfigs, setDepthConfigs] = useState<DepthLayerConfig[]>([]);
  const [snapshot, setSnapshot] = useState<TimeSnapshotData | null>(null);

  const [coordInfo, setCoordInfo] = useState<CoordinateInfo>({
    latitude: 12.0,
    longitude: 80.0,
    height: 0,
    cameraAltitude: 12000000,
    heading: 0,
    pitch: -65,
  });

  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const depthManagerRef = useRef<DepthLayerVisualizationManager | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getDepthLayers(), api.getSnapshotAtTime({ depth: selectedDepth })])
      .then(([layers, snap]) => {
        if (isMounted) {
          setDepthConfigs(layers);
          setSnapshot(snap);
        }
      })
      .catch((err) => console.error('Failed to load 3D data:', err));

    return () => { isMounted = false; };
  }, [selectedDepth]);

  // Synchronize 3D Subsurface planes with Cesium viewer
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed() || !viewer.entities) return;

    if (!depthManagerRef.current) {
      depthManagerRef.current = new DepthLayerVisualizationManager(viewer);
    } else {
      depthManagerRef.current.setViewer(viewer);
    }

    if (depthConfigs.length > 0) {
      depthManagerRef.current.updateDepthPlanes(depthConfigs, visibleLayers, opacity);
    }

    if (snapshot && snapshot.argo_floats) {
      depthManagerRef.current.updateVerticalColumnProfiles(snapshot.argo_floats);
    }
  }, [depthConfigs, visibleLayers, opacity, snapshot]);

  const handleToggleLayerVisibility = (depth: number) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(depth)) next.delete(depth);
      else next.add(depth);
      return next;
    });
  };

  const handleResetTiltPerspective = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78.0, 5.0, 9500000.0),
      orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-45.0),
        roll: 0.0,
      },
      duration: 1.8,
    });
  };

  return (
    <div className="explorer-viewport">
      {/* Cesium 3D Earth Viewer */}
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

      {/* Floating 3D Depth Layer Stack Control (Left Side) */}
      <DepthLayerControl
        selectedDepth={selectedDepth}
        onSelectDepth={setSelectedDepth}
        visibleLayers={visibleLayers}
        onToggleLayerVisibility={handleToggleLayerVisibility}
        opacity={opacity}
        onChangeOpacity={setOpacity}
      />

      {/* Floating Header Banner / Perspective Controls (Top Center) */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          backgroundColor: 'var(--backdrop-panel)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-panel)'
        }}
      >
        <Layers className="w-4 h-4 text-[var(--primary)]" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          3D Subsurface Layer & Bathymetric Perspective
        </span>
        <Badge variant="primary">DEPTH-AWARE ISO-SURFACES</Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetTiltPerspective}
          leftIcon={<Compass className="w-3.5 h-3.5" />}
          style={{ fontSize: '11px', height: '26px' }}
        >
          45° Subsurface Tilt
        </Button>

        <Link to="/4d">
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            style={{ fontSize: '11px', height: '26px' }}
          >
            Switch to 4D Time Machine
          </Button>
        </Link>
      </div>

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
        onResetTilt={() => handleResetTiltPerspective()}
      />

      {/* Bottom Status Bar */}
      <StatusBar coordInfo={coordInfo} />
    </div>
  );
};

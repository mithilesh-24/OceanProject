import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Cesium from 'cesium';
import { CesiumViewer } from '../components/CesiumViewer/CesiumViewer';
import { NavigationControls } from '../components/UI/NavigationControls';
import { StatusBar } from '../components/UI/StatusBar';
import { LayerPanel } from '../components/UI/LayerPanel';
import { MeasurePanel } from '../components/UI/MeasurePanel';
import { PlacemarkPanel } from '../components/UI/PlacemarkPanel';
import { LocationInfoCard } from '../components/UI/LocationInfoCard';
import { ArgoSidebar } from '../components/UI/ArgoSidebar';
import { ArgoFloatCard } from '../components/UI/ArgoFloatCard';
import { ObservationDetailDrawer, SelectedObservation } from '../components/explorer/ObservationDetailDrawer';
import { CoordinateInfo, LayerState, LocationDetails, MeasureModeType, Placemark, SceneModeType } from '../types';
import { ArgoFilterOptions, ArgoObservation } from '../types/argo';
import { fetchArgoObservations } from '../services/argoService';
import { 
  Layers, Ruler, Bookmark, RotateCcw, Maximize, Minimize 
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Tooltip } from '../components/UI/Tooltip';

const INITIAL_LAYERS: LayerState = {
  satellite: true,
  vectorMap: false,
  terrain: true,
  terrainExaggeration: 1.5,
  buildings3D: false,
  borders: true,
  labels: true,
  clouds: true,
  bathymetry: false,
  lightingMode: 'readable',
  argoFloats: true,
  oceanCurrents: false,
  sst: false,
  salinity: false,
  waveHeight: false,
  seaLevelAnomaly: false,
  chlorophyll: false,
  oceanDepth: false,
};

const INITIAL_ARGO_FILTERS: ArgoFilterOptions = {
  variables: {
    temperature: true,
    salinity: true,
    pressure: true,
  },
  colorByVariable: 'temperature',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-10',
  minDepth: 0,
  maxDepth: 500,
};

export const OceanExplorerView: React.FC = () => {
  const [layerState, setLayerState] = useState<LayerState>(INITIAL_LAYERS);
  const [sceneMode, setSceneMode] = useState<SceneModeType>('3D');
  const [measureMode, setMeasureMode] = useState<MeasureModeType>('none');
  const [measurementResult, setMeasurementResult] = useState('');
  const [activePanel, setActivePanel] = useState<'none' | 'layers' | 'measure' | 'placemarks'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cartographic Status Info
  const [coordInfo, setCoordInfo] = useState<CoordinateInfo>({
    latitude: 15.0,
    longitude: 77.0,
    height: 0,
    cameraAltitude: 18000000,
    heading: 0,
    pitch: -90,
  });

  // Selected Location for Info Card
  const [clickedLocation, setClickedLocation] = useState<(CoordinateInfo & { details?: LocationDetails; addressName?: string }) | null>(null);

  // ARGO Data State
  const [argoSidebarOpen, setArgoSidebarOpen] = useState(true);
  const [argoFilters, setArgoFilters] = useState<ArgoFilterOptions>(INITIAL_ARGO_FILTERS);
  const [argoObservations, setArgoObservations] = useState<ArgoObservation[]>([]);
  const [argoLoading, setArgoLoading] = useState(false);
  const [argoError, setArgoError] = useState<string | null>(null);
  const [selectedArgoFloat, setSelectedArgoFloat] = useState<ArgoObservation | null>(null);
  // Selected Observation Detail Drawer State
  const [drawerObservation, setDrawerObservation] = useState<SelectedObservation | null>(null);

  const handleOpenTelemetryDrawer = (obs: ArgoObservation) => {
    setDrawerObservation({
      type: 'argo',
      id: obs.id,
      title: `Apex Float #${obs.platformNumber}`,
      subtitle: `Cycle ${obs.cycleNumber} • Indian Ocean Basin`,
      latitude: obs.latitude,
      longitude: obs.longitude,
      cycle: obs.cycleNumber,
      lastDate: new Date(obs.time).toISOString().split('T')[0],
      surfaceTemp: obs.temperature !== null ? Number(obs.temperature.toFixed(2)) : 28.5,
      surfaceSal: obs.salinity !== null ? Number(obs.salinity.toFixed(2)) : 34.2,
      maxDepth: obs.depth !== null ? Number(obs.depth.toFixed(0)) : 2000,
      battery: 92,
      status: 'Active',
      profileData: {
        depths: [0, 10, 25, 50, 100, 200, 500, 1000, 2000],
        temp: [
          obs.temperature ?? 28.5,
          (obs.temperature ?? 28.5) - 0.2,
          (obs.temperature ?? 28.5) - 0.8,
          (obs.temperature ?? 28.5) - 4.5,
          16.2, 11.4, 7.8, 4.5, 2.1
        ],
        sal: [
          obs.salinity ?? 34.2,
          (obs.salinity ?? 34.2) + 0.1,
          (obs.salinity ?? 34.2) + 0.3,
          35.1, 35.2, 35.0, 34.9, 34.8, 34.7
        ]
      }
    });
  };

  const handleFlyToFloat = (obs: ArgoObservation) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(obs.longitude, obs.latitude, 120000.0),
      duration: 1.8,
    });
  };

  // Placemarks list with localStorage persistence
  const [placemarks, setPlacemarks] = useState<Placemark[]>(() => {
    try {
      const saved = localStorage.getItem('oceanvis_placemarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    localStorage.setItem('oceanvis_placemarks', JSON.stringify(placemarks));
  }, [placemarks]);

  const argoReqIdRef = useRef(0);

  // Handle Fetching Argo Data from INCOIS ERDDAP API with Request Race Prevention
  const loadArgoData = useCallback(async (filtersToUse: ArgoFilterOptions) => {
    const reqId = ++argoReqIdRef.current;
    setArgoLoading(true);
    setArgoError(null);

    try {
      const result = await fetchArgoObservations(filtersToUse);
      if (reqId !== argoReqIdRef.current) return;

      setArgoObservations(result.observations);

      setSelectedArgoFloat((prevSelected) => {
        if (!prevSelected) return null;
        const exists = result.observations.some(
          (obs) => obs.id === prevSelected.id || (obs.platformNumber === prevSelected.platformNumber && obs.cycleNumber === prevSelected.cycleNumber)
        );
        return exists ? prevSelected : null;
      });

      if (result.observations.length === 0) {
        setArgoError('No Argo observations found for the selected filters.');
      }
    } catch (err: any) {
      if (reqId !== argoReqIdRef.current) return;
      console.error('Failed to load Argo data:', err);
      setArgoError(err.message || 'Unable to load Argo data. Please try again.');
    } finally {
      if (reqId === argoReqIdRef.current) {
        setArgoLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadArgoData(argoFilters);
  }, []);

  const handleApplyArgoFilters = (newFilters: ArgoFilterOptions) => {
    setArgoFilters(newFilters);
    setSelectedArgoFloat(null);
    loadArgoData(newFilters);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleToggleLayer = (layerKey: keyof LayerState) => {
    setLayerState((prev) => {
      if (layerKey === 'lightingMode') {
        return {
          ...prev,
          lightingMode: prev.lightingMode === 'realistic' ? 'readable' : 'realistic',
        };
      }
      return {
        ...prev,
        [layerKey]: !prev[layerKey],
      };
    });
  };

  const handleUpdateTerrainExaggeration = (factor: number) => {
    setLayerState((prev) => ({
      ...prev,
      terrainExaggeration: factor,
    }));
  };

  const handleResetNorth = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const camera = viewer.camera;
    camera.flyTo({
      destination: camera.position,
      orientation: {
        heading: 0,
        pitch: camera.pitch,
        roll: 0,
      },
      duration: 1.0,
    });
  };

  const handleResetTilt = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const camera = viewer.camera;
    camera.flyTo({
      destination: camera.position,
      orientation: {
        heading: camera.heading,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.0,
    });
  };

  const handleZoomIn = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.4);
  };

  const handleZoomOut = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.6);
  };

  const handleToggleSceneMode = () => {
    setSceneMode((prev) => (prev === '3D' ? '2D' : '3D'));
  };

  const handleResetView = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(77.0, 15.0, 18000000.0),
      orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0,
      },
      duration: 2.0,
    });
  };

  const handleAddPlacemark = (name: string, desc: string) => {
    const newPlacemark: Placemark = {
      id: 'pin_' + Date.now(),
      name,
      description: desc,
      latitude: coordInfo.latitude,
      longitude: coordInfo.longitude,
      height: coordInfo.height,
      createdAt: Date.now(),
    };
    setPlacemarks((prev) => [newPlacemark, ...prev]);
  };

  const handleFlyToPlacemark = (p: Placemark) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, 50000.0),
      duration: 2.0,
    });
  };

  const handleDeletePlacemark = (id: string) => {
    setPlacemarks((prev) => prev.filter((p) => p.id !== id));
  };

  const handleArgoFloatClick = (obs: ArgoObservation) => {
    setSelectedArgoFloat(obs);
    setClickedLocation(null);
  };

  return (
    <div className="explorer-viewport">
      {/* 3D Earth Cesium Viewer */}
      <CesiumViewer
        layerState={layerState}
        sceneMode={sceneMode}
        measureMode={measureMode}
        placemarks={placemarks}
        argoObservations={argoObservations}
        argoColorVariable={argoFilters.colorByVariable}
        selectedArgoFloatId={selectedArgoFloat?.id || null}
        onCoordinateUpdate={setCoordInfo}
        onLocationClick={(info) => {
          setSelectedArgoFloat(null);
          setClickedLocation(info);
        }}
        onArgoFloatClick={handleArgoFloatClick}
        onArgoFloatVisibilityChange={(id, isVisible) => {
          if (!isVisible && selectedArgoFloat?.id === id) {
            setSelectedArgoFloat(null);
          }
        }}
        onMeasurementChange={({ result }) => setMeasurementResult(result)}
        viewerRefOut={viewerRef}
      />

      {/* Floating Toolbar (Top-Right of Globe Viewport) */}
      <div style={{
        position: 'absolute',
        top: '14px',
        right: '14px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 8px',
        backgroundColor: 'var(--backdrop-panel)',
        backdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)'
      }}>
        <Tooltip content="Atmospheric & Bathymetric Layers">
          <Button
            variant={activePanel === 'layers' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'layers' ? 'none' : 'layers')}
            aria-label="Layers"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Geographic Measurement Tools">
          <Button
            variant={activePanel === 'measure' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'measure' ? 'none' : 'measure')}
            aria-label="Measurement"
          >
            <Ruler className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Bookmarks & Placemarks">
          <Button
            variant={activePanel === 'placemarks' ? 'primary' : 'outline'}
            size="sm"
            iconOnly
            onClick={() => setActivePanel(activePanel === 'placemarks' ? 'none' : 'placemarks')}
            aria-label="Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border)', margin: '0 2px' }} />

        <Tooltip content="Reset View to Indian Ocean">
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={handleResetView}
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={handleToggleFullscreen}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </Tooltip>
      </div>

      {/* Collapsible Argo Data Sidebar (Left Side) */}
      <ArgoSidebar
        isOpen={argoSidebarOpen}
        onToggleOpen={() => setArgoSidebarOpen(!argoSidebarOpen)}
        filters={argoFilters}
        onApplyFilters={handleApplyArgoFilters}
        totalCount={argoObservations.length}
        loading={argoLoading}
        error={argoError}
      />

      {/* Floating Right Navigation Controls */}
      <NavigationControls
        heading={coordInfo.heading}
        pitch={coordInfo.pitch}
        sceneMode={sceneMode}
        onResetNorth={handleResetNorth}
        onToggleSceneMode={handleToggleSceneMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetTilt={handleResetTilt}
      />

      {/* Floating Side Panels (Right Side) */}
      {activePanel === 'layers' && (
        <LayerPanel
          layerState={layerState}
          onToggleLayer={handleToggleLayer}
          onUpdateTerrainExaggeration={handleUpdateTerrainExaggeration}
          onClose={() => setActivePanel('none')}
        />
      )}

      {activePanel === 'measure' && (
        <MeasurePanel
          measureMode={measureMode}
          setMeasureMode={setMeasureMode}
          measurementResult={measurementResult}
          onClear={() => setMeasurementResult('')}
          onClose={() => {
            setMeasureMode('none');
            setActivePanel('none');
          }}
        />
      )}

      {activePanel === 'placemarks' && (
        <PlacemarkPanel
          placemarks={placemarks}
          onAddPlacemark={handleAddPlacemark}
          onFlyToPlacemark={handleFlyToPlacemark}
          onDeletePlacemark={handleDeletePlacemark}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* Selected Argo Float Inspection Card */}
      {selectedArgoFloat && !drawerObservation && (
        <ArgoFloatCard
          observation={selectedArgoFloat}
          onClose={() => setSelectedArgoFloat(null)}
          onFlyTo={() => handleFlyToFloat(selectedArgoFloat)}
          onViewDetails={() => handleOpenTelemetryDrawer(selectedArgoFloat)}
          onBookmark={() => {
            handleAddPlacemark(
              `Float #${selectedArgoFloat.platformNumber} (Cycle ${selectedArgoFloat.cycleNumber})`,
              `Temp: ${selectedArgoFloat.temperature?.toFixed(1)}°C, PSAL: ${selectedArgoFloat.salinity?.toFixed(1)}`
            );
          }}
        />
      )}

      {/* Observation Telemetry & Vertical Profile Drawer */}
      <ObservationDetailDrawer
        observation={drawerObservation}
        isOpen={drawerObservation !== null}
        onClose={() => setDrawerObservation(null)}
        onCenterCamera={(lat, lon) => {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 120000.0),
            duration: 1.8,
          });
        }}
      />

      {/* Location Inspector Info Card */}
      {clickedLocation && !selectedArgoFloat && !drawerObservation && (
        <LocationInfoCard
          locationInfo={clickedLocation}
          onClose={() => setClickedLocation(null)}
          onBookmark={() => {
            handleAddPlacemark(
              clickedLocation.details?.name || clickedLocation.addressName || `Pin (${clickedLocation.latitude.toFixed(2)}°, ${clickedLocation.longitude.toFixed(2)}°)`,
              'Saved location'
            );
          }}
        />
      )}

      {/* Bottom Status Bar & Dynamic Scale */}
      <StatusBar coordInfo={coordInfo} />
    </div>
  );
};

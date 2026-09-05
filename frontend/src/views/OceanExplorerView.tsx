import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
import { TimelineControlBar } from '../components/explorer/TimelineControlBar';
import { DepthLayerControl } from '../components/explorer/DepthLayerControl';
import { GlobeScientificLegend } from '../components/CesiumViewer/GlobeScientificLegend';
import { DepthLayerVisualizationManager } from '../components/CesiumViewer/DepthLayerVisualizationManager';
import { ModelGridConfig } from '../components/CesiumViewer/ModelGridLayerManager';
import { PlatformItem } from '../components/CesiumViewer/ObservationPlatformsManager';
import { CoordinateInfo, LayerState, LocationDetails, MeasureModeType, Placemark, SceneModeType } from '../types';
import { ArgoFilterOptions, ArgoObservation } from '../types/argo';
import { fetchArgoObservations } from '../services/argoService';
import { api, DepthLayerConfig, TimeSnapshotData, TimelineData } from '../services/apiClient';
import {
  Layers,
  Ruler,
  Bookmark,
  RotateCcw,
  Maximize,
  Minimize,
  Radio,
  Waves,
  Anchor,
  Cpu,
  GitCompare,
  Clock,
  RefreshCw,
  Compass,
  Sliders,
  Eye,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Tooltip } from '../components/UI/Tooltip';
import { Select } from '../components/UI/Select';

const INITIAL_LAYERS: LayerState = {
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
  const [searchParams] = useSearchParams();

  // Primary Explorer Tab: 'observations' | 'models' | 'comparison' | 'depth_time'
  const [explorerTab, setExplorerTab] = useState<'observations' | 'models' | 'comparison' | 'depth_time'>('observations');

  const [layerState, setLayerState] = useState<LayerState>(INITIAL_LAYERS);
  const [sceneMode, setSceneMode] = useState<SceneModeType>('3D');
  const [measureMode, setMeasureMode] = useState<MeasureModeType>('none');
  const [measurementResult, setMeasurementResult] = useState('');
  const [activePanel, setActivePanel] = useState<'none' | 'layers' | 'measure' | 'placemarks'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string>('');

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

  // ═════════════════════════════════════════════════════
  // 1. OBSERVATIONS DATA STATE (ARGO, GLIDER, BUOY, CTD, ADCP)
  // ═════════════════════════════════════════════════════
  const [argoSidebarOpen, setArgoSidebarOpen] = useState(true);
  const [argoFilters, setArgoFilters] = useState<ArgoFilterOptions>(INITIAL_ARGO_FILTERS);
  const [argoObservations, setArgoObservations] = useState<ArgoObservation[]>([]);
  const [selectedArgoFloat, setSelectedArgoFloat] = useState<ArgoObservation | null>(null);

  const [platformItems, setPlatformItems] = useState<PlatformItem[]>([]);
  const [visiblePlatformTypes, setVisiblePlatformTypes] = useState<Set<string>>(new Set(['argo', 'glider', 'buoy', 'ctd', 'adcp']));
  const [drawerObservation, setDrawerObservation] = useState<SelectedObservation | null>(null);

  // ═════════════════════════════════════════════════════
  // 2. NUMERICAL MODELS STATE (HYCOM, ROMS, NEMO)
  // ═════════════════════════════════════════════════════
  const [selectedModel, setSelectedModel] = useState<string>('hycom');
  const [modelVariable, setModelVariable] = useState<string>('temperature');
  const [modelDepth, setModelDepth] = useState<number>(0);
  const [modelOpacity, setModelOpacity] = useState<number>(0.75);
  const [modelGridConfig, setModelGridConfig] = useState<ModelGridConfig | null>(null);

  // ═════════════════════════════════════════════════════
  // 3. SCIENTIFIC COMPARISONS (MODEL VS MODEL & MODEL VS OBS)
  // ═════════════════════════════════════════════════════
  const [comparisonSubMode, setComparisonSubMode] = useState<'inter' | 'obs'>('inter');
  const [interModelA, setInterModelA] = useState<string>('hycom');
  const [interModelB, setInterModelB] = useState<string>('roms');
  const [interVariable, setInterVariable] = useState<string>('temperature');
  const [interDepth, setInterDepth] = useState<number>(0);
  const [interSummary, setInterSummary] = useState<{ rmsd: number; bias: number; r: number; points: number } | null>(null);

  // ═════════════════════════════════════════════════════
  // 4. 3D DEPTH PLANES & 4D TIME
  // ═════════════════════════════════════════════════════
  const [depthConfigs, setDepthConfigs] = useState<DepthLayerConfig[]>([]);
  const [visibleDepths, setVisibleDepths] = useState<Set<number>>(new Set([0, 50, 100, 500, 1000]));
  const [depthPlanesOpacity, setDepthPlanesOpacity] = useState<number>(0.35);
  const [timelineMeta, setTimelineMeta] = useState<TimelineData | null>(null);
  const [timelineProgressPct, setTimelineProgressPct] = useState<number>(100.0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [timelineSpeed, setTimelineSpeed] = useState<number>(1);
  const [timeSnapshot, setTimeSnapshot] = useState<TimeSnapshotData | null>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const depthManagerRef = useRef<DepthLayerVisualizationManager | null>(null);

  // Placemarks list
  const [placemarks, setPlacemarks] = useState<Placemark[]>(() => {
    try {
      const saved = localStorage.getItem('oceanvis_placemarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('oceanvis_placemarks', JSON.stringify(placemarks));
  }, [placemarks]);

  // ═════════════════════════════════════════════════════
  // PRE-POPULATE FROM URL SEARCH PARAMS
  // ═════════════════════════════════════════════════════
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const modelParam = searchParams.get('model');
    const modelBParam = searchParams.get('modelB');
    const varParam = searchParams.get('var');
    const depthParam = searchParams.get('depth');

    if (modeParam === 'inter') {
      setExplorerTab('comparison');
      setComparisonSubMode('inter');
      if (modelParam) setInterModelA(modelParam);
      if (modelBParam) setInterModelB(modelBParam);
      if (varParam) setInterVariable(varParam);
      if (depthParam) setInterDepth(parseFloat(depthParam));
    } else if (modeParam === 'model' || modelParam) {
      setExplorerTab('models');
      if (modelParam) setSelectedModel(modelParam);
      if (varParam) setModelVariable(varParam);
      if (depthParam) setModelDepth(parseFloat(depthParam));
    } else if (modeParam === 'depth_time') {
      setExplorerTab('depth_time');
    }
  }, [searchParams]);

  // ═════════════════════════════════════════════════════
  // LOAD ALL IN-SITU OBSERVATIONS (ARGO, GLIDER, BUOY, CTD, ADCP)
  // ═════════════════════════════════════════════════════
  const loadObservationsData = useCallback(async () => {
    setIsDataLoading(true);
    setLoadingLabel('Loading In-Situ Ocean Observation Networks...');
    try {
      const [argoRes, glidersRes, buoysRes, ctdRes, adcpRes] = await Promise.allSettled([
        fetchArgoObservations(argoFilters),
        api.getGliders(),
        api.getBuoys(),
        api.getCtd(),
        api.getAdcp(),
      ]);

      const items: PlatformItem[] = [];

      if (argoRes.status === 'fulfilled') {
        setArgoObservations(argoRes.value.observations);
      }

      if (glidersRes.status === 'fulfilled') {
        glidersRes.value.forEach((g: any) => {
          items.push({
            id: `glider_${g.id}`,
            type: 'glider',
            name: g.name || `Glider ${g.id}`,
            latitude: g.latitude,
            longitude: g.longitude,
            depth: g.dive_depth,
            temperature: g.temperature,
            salinity: g.salinity,
            battery: g.battery_level,
            status: g.status,
            raw: g,
          });
        });
      }

      if (buoysRes.status === 'fulfilled') {
        buoysRes.value.forEach((b: any) => {
          items.push({
            id: `buoy_${b.station_id}`,
            type: 'buoy',
            name: `Moored Buoy ${b.station_id} (${b.network})`,
            latitude: b.latitude,
            longitude: b.longitude,
            temperature: b.sea_surface_temp,
            status: b.status,
            raw: b,
          });
        });
      }

      if (ctdRes.status === 'fulfilled') {
        ctdRes.value.forEach((c: any) => {
          items.push({
            id: `ctd_${c.cast_id}`,
            type: 'ctd',
            name: `CTD Cast ${c.cast_id} (${c.vessel_name})`,
            latitude: c.latitude,
            longitude: c.longitude,
            depth: c.max_depth_m,
            temperature: c.surface_temp,
            salinity: c.surface_salinity,
            status: 'Completed',
            raw: c,
          });
        });
      }

      if (adcpRes.status === 'fulfilled') {
        adcpRes.value.forEach((a: any) => {
          items.push({
            id: `adcp_${a.station_id}`,
            type: 'adcp',
            name: `ADCP Mooring ${a.station_id}`,
            latitude: a.latitude,
            longitude: a.longitude,
            depth: a.mooring_depth_m,
            velocity: a.surface_current_speed,
            status: 'Operational',
            raw: a,
          });
        });
      }

      setPlatformItems(items);
    } catch (err) {
      console.error('Failed to load observation platforms:', err);
    } finally {
      setIsDataLoading(false);
      setLoadingLabel('');
    }
  }, [argoFilters]);

  useEffect(() => {
    loadObservationsData();
  }, [loadObservationsData]);

  // ═════════════════════════════════════════════════════
  // LOAD NUMERICAL MODEL SLICE ONTO CESIUM GLOBE
  // ═════════════════════════════════════════════════════
  const loadModelSlice = useCallback(async () => {
    if (explorerTab !== 'models') return;

    setIsDataLoading(true);
    setLoadingLabel(`Generating ${selectedModel.toUpperCase()} ${modelVariable} (${modelDepth}m) slice...`);
    try {
      const sliceData = await api.getModelSlice(selectedModel, {
        variable: modelVariable,
        depth: modelDepth,
      });

      setModelGridConfig({
        modelId: selectedModel,
        variable: modelVariable,
        depthM: modelDepth,
        units: sliceData.units || '°C',
        latitudes: sliceData.latitudes,
        longitudes: sliceData.longitudes,
        gridValues: sliceData.grid_values,
        minVal: sliceData.min_value,
        maxVal: sliceData.max_value,
        opacity: modelOpacity,
        isDifferenceField: false,
      });
    } catch (err) {
      console.error('Failed to load model slice:', err);
    } finally {
      setIsDataLoading(false);
      setLoadingLabel('');
    }
  }, [selectedModel, modelVariable, modelDepth, modelOpacity, explorerTab]);

  useEffect(() => {
    if (explorerTab === 'models') {
      loadModelSlice();
    } else if (explorerTab !== 'comparison') {
      setModelGridConfig(null);
    }
  }, [explorerTab, loadModelSlice]);

  // ═════════════════════════════════════════════════════
  // LOAD CROSS-MODEL INTER-COMPARISON DIFFERENCE ON GLOBE
  // ═════════════════════════════════════════════════════
  const loadInterComparisonField = useCallback(async () => {
    if (explorerTab !== 'comparison') return;

    if (comparisonSubMode === 'inter') {
      if (interModelA === interModelB) return;
      setIsDataLoading(true);
      setLoadingLabel(`Computing Δ = ${interModelA.toUpperCase()} − ${interModelB.toUpperCase()} on 1.0° Grid...`);

      try {
        const res = await api.runModelInterComparison({
          model_a: interModelA,
          model_b: interModelB,
          variable: interVariable,
          depth: interDepth,
          region: 'indian_ocean',
        });

        setInterSummary({
          rmsd: res.metrics.rmsd,
          bias: res.metrics.mean_bias,
          r: res.metrics.pattern_correlation,
          points: res.metrics.valid_points_count,
        });

        setModelGridConfig({
          modelId: interModelA,
          variable: interVariable,
          depthM: interDepth,
          units: res.units,
          latitudes: res.common_grid.latitudes,
          longitudes: res.common_grid.longitudes,
          gridValues: res.difference_grid,
          minVal: res.metrics.max_negative_diff,
          maxVal: res.metrics.max_positive_diff,
          opacity: modelOpacity,
          isDifferenceField: true,
          modelA: interModelA,
          modelB: interModelB,
        });
      } catch (err) {
        console.error('Failed to load inter-comparison field:', err);
      } finally {
        setIsDataLoading(false);
        setLoadingLabel('');
      }
    } else {
      // Model vs In-Situ Observation Matchups
      setIsDataLoading(true);
      setLoadingLabel('Matching Model predictions with In-Situ observations...');
      try {
        const res = await api.runComparison({
          model: selectedModel,
          observation: 'argo',
          variable: modelVariable,
          region: 'indian_ocean',
        });

        // Add residual points to platform items
        const residualPlatforms: PlatformItem[] = (res.scatter_points || []).slice(0, 50).map((pt, idx) => {
          // Spread across Indian Ocean
          const lat = 2.0 + (idx % 10) * 2.0;
          const lon = 60.0 + Math.floor(idx / 10) * 7.0;
          return {
            id: `res_${idx}`,
            type: 'residual',
            name: `Matchup Point #${idx + 1}`,
            latitude: lat,
            longitude: lon,
            modelVal: pt.model,
            obsVal: pt.obs,
            residual: pt.error,
          };
        });

        setPlatformItems((prev) => [...prev.filter((p) => p.type !== 'residual'), ...residualPlatforms]);
        setModelGridConfig(null);
      } catch (err) {
        console.error('Failed to load model vs obs comparison:', err);
      } finally {
        setIsDataLoading(false);
        setLoadingLabel('');
      }
    }
  }, [explorerTab, comparisonSubMode, interModelA, interModelB, interVariable, interDepth, selectedModel, modelVariable, modelOpacity]);

  useEffect(() => {
    if (explorerTab === 'comparison') {
      loadInterComparisonField();
    }
  }, [explorerTab, loadInterComparisonField]);

  // ═════════════════════════════════════════════════════
  // 3D DEPTH PLANES & 4D TIME INITIALIZATION
  // ═════════════════════════════════════════════════════
  useEffect(() => {
    if (explorerTab === 'depth_time') {
      Promise.all([api.getDepthLayers(), api.getTimeline()])
        .then(([layers, tMeta]) => {
          setDepthConfigs(layers);
          setTimelineMeta(tMeta);
        })
        .catch((err) => console.error('Failed to load 3D/4D metadata:', err));
    }
  }, [explorerTab]);

  // Synchronize 3D Subsurface planes with Cesium
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (!depthManagerRef.current) {
      depthManagerRef.current = new DepthLayerVisualizationManager(viewer);
    }

    if (explorerTab === 'depth_time' && depthConfigs.length > 0) {
      depthManagerRef.current.updateDepthPlanes(depthConfigs, visibleDepths, depthPlanesOpacity);
    } else if (depthManagerRef.current) {
      depthManagerRef.current.updateDepthPlanes([], new Set(), 0);
    }
  }, [explorerTab, depthConfigs, visibleDepths, depthPlanesOpacity]);

  // 4D Timeline Snapshot Loading
  const getCurrentTimelineTimestamp = useCallback(() => {
    if (!timelineMeta) return '2026-09-04T12:00:00Z';
    const startMs = new Date(timelineMeta.start_date).getTime();
    const endMs = new Date(timelineMeta.end_date).getTime();
    const currentMs = startMs + (endMs - startMs) * (timelineProgressPct / 100);
    return new Date(currentMs).toISOString();
  }, [timelineMeta, timelineProgressPct]);

  useEffect(() => {
    if (explorerTab !== 'depth_time') return;
    const currentIso = getCurrentTimelineTimestamp();

    api.getSnapshotAtTime({ timestamp: currentIso })
      .then((data) => setTimeSnapshot(data))
      .catch((err) => console.error('Failed to load snapshot at time:', err));
  }, [explorerTab, timelineProgressPct, getCurrentTimelineTimestamp]);

  // 4D Playback Loop
  useEffect(() => {
    if (!isTimelinePlaying || explorerTab !== 'depth_time') return;

    const interval = setInterval(() => {
      setTimelineProgressPct((prev) => {
        const step = 0.5 * timelineSpeed;
        if (prev + step >= 100) return 0;
        return prev + step;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isTimelinePlaying, timelineSpeed, explorerTab]);

  // ═════════════════════════════════════════════════════
  // PLATFORM & ARGO CLICK HANDLERS (TELEMETRY DRAWER)
  // ═════════════════════════════════════════════════════
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
          16.2, 11.4, 7.8, 4.5, 2.1,
        ],
        sal: [
          obs.salinity ?? 34.2,
          (obs.salinity ?? 34.2) + 0.1,
          (obs.salinity ?? 34.2) + 0.3,
          35.1, 35.2, 35.0, 34.9, 34.8, 34.7,
        ],
      },
    });
  };

  const handlePlatformClick = (platform: PlatformItem) => {
    if (platform.type === 'residual') {
      setClickedLocation({
        latitude: platform.latitude,
        longitude: platform.longitude,
        height: 0,
        cameraAltitude: 50000,
        heading: 0,
        pitch: -90,
        details: {
          name: platform.name,
          category: 'ocean',
          elevation: 0,
        },
      });
      return;
    }

    setDrawerObservation({
      type: platform.type,
      id: platform.id,
      title: platform.name,
      subtitle: `${platform.type.toUpperCase()} Station • Indian Ocean Domain`,
      latitude: platform.latitude,
      longitude: platform.longitude,
      surfaceTemp: platform.temperature ?? '28.4',
      surfaceSal: platform.salinity ?? '34.5',
      maxDepth: platform.depth ?? '1000',
      battery: platform.battery ?? '94%',
      status: platform.status ?? 'Active',
      profileData: {
        depths: [0, 25, 50, 100, 200, 500, 1000],
        temp: [28.8, 28.5, 26.1, 20.4, 15.1, 10.2, 6.4],
        sal: [34.1, 34.3, 34.8, 35.1, 35.0, 34.9, 34.7],
      },
    });
  };

  const handleTogglePlatformType = (type: string) => {
    setVisiblePlatformTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleToggleDepthLayer = (depth: number) => {
    setVisibleDepths((prev) => {
      const next = new Set(prev);
      if (next.has(depth)) next.delete(depth);
      else next.add(depth);
      return next;
    });
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
        modelGridConfig={modelGridConfig}
        platformItems={platformItems}
        visiblePlatformTypes={visiblePlatformTypes}
        modelLayerOpacity={modelOpacity}
        onCoordinateUpdate={setCoordInfo}
        onLocationClick={(info) => {
          setSelectedArgoFloat(null);
          setClickedLocation(info);
        }}
        onArgoFloatClick={(obs) => {
          setSelectedArgoFloat(obs);
          setClickedLocation(null);
        }}
        onPlatformClick={handlePlatformClick}
        onArgoFloatVisibilityChange={(id, isVisible) => {
          if (!isVisible && selectedArgoFloat?.id === id) {
            setSelectedArgoFloat(null);
          }
        }}
        onMeasurementChange={({ result }) => setMeasurementResult(result)}
        viewerRefOut={viewerRef}
      />

      {/* Non-Blocking Data Loading Pill */}
      {isDataLoading && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--primary)',
            borderRadius: '20px',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            fontSize: '11.5px',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
          <span>{loadingLabel || 'Updating 3D Earth Data...'}</span>
        </div>
      )}

      {/* Floating Toolbar (Top-Right of Globe Viewport) */}
      <div
        style={{
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
          boxShadow: 'var(--shadow-panel)',
        }}
      >
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
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
              } else {
                document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
              }
            }}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </Tooltip>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* UNIFIED 3D OCEAN EXPLORER DOCK (LEFT SIDEBAR)          */}
      {/* ═════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          bottom: explorerTab === 'depth_time' ? '120px' : '48px',
          width: argoSidebarOpen ? '340px' : '44px',
          zIndex: 30,
          backgroundColor: 'var(--backdrop-panel)',
          backdropFilter: 'var(--backdrop-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-panel)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Dock Header & Tab Navigation */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass className="w-4 h-4 text-[var(--primary)]" />
            {argoSidebarOpen && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                3D Ocean Layers
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setArgoSidebarOpen(!argoSidebarOpen)}
            style={{ width: '24px', height: '24px' }}
          >
            <Sliders className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Mode Selector Tabs */}
        {argoSidebarOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '6px 8px', gap: '4px', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setExplorerTab('observations')}
              title="In-Situ Sensor Networks"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 2px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: explorerTab === 'observations' ? '1px solid var(--primary)' : '1px solid transparent',
                background: explorerTab === 'observations' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: explorerTab === 'observations' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Sensors</span>
            </button>

            <button
              onClick={() => setExplorerTab('models')}
              title="Numerical Circulation Models (HYCOM, ROMS, NEMO)"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 2px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: explorerTab === 'models' ? '1px solid var(--primary)' : '1px solid transparent',
                background: explorerTab === 'models' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: explorerTab === 'models' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Models</span>
            </button>

            <button
              onClick={() => setExplorerTab('comparison')}
              title="Cross-Model & Observation Validation"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 2px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: explorerTab === 'comparison' ? '1px solid var(--primary)' : '1px solid transparent',
                background: explorerTab === 'comparison' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: explorerTab === 'comparison' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>

            <button
              onClick={() => setExplorerTab('depth_time')}
              title="3D Depth Planes & 4D Timeline"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 2px',
                borderRadius: '4px',
                fontSize: '9.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: explorerTab === 'depth_time' ? '1px solid var(--primary)' : '1px solid transparent',
                background: explorerTab === 'depth_time' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: explorerTab === 'depth_time' ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>3D/4D</span>
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        {argoSidebarOpen && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="space-y-4">
            {/* ──────────────────────────────────────────────── */}
            {/* TAB 1: IN-SITU OBSERVATIONS (ARGO, GLIDER, BUOY) */}
            {/* ──────────────────────────────────────────────── */}
            {explorerTab === 'observations' && (
              <div className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Active In-Situ Platforms ({platformItems.length + argoObservations.length})
                  </span>
                  <Badge variant="success">INCOIS Live</Badge>
                </div>

                {/* Sensor Platform Toggles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { id: 'argo', label: 'Argo Floats', icon: Radio, count: argoObservations.length },
                    { id: 'glider', label: 'Gliders', icon: Waves, count: platformItems.filter((p) => p.type === 'glider').length },
                    { id: 'buoy', label: 'Moored Buoys', icon: Anchor, count: platformItems.filter((p) => p.type === 'buoy').length },
                    { id: 'ctd', label: 'CTD Casts', icon: Layers, count: platformItems.filter((p) => p.type === 'ctd').length },
                    { id: 'adcp', label: 'ADCP Moorings', icon: Cpu, count: platformItems.filter((p) => p.type === 'adcp').length },
                  ].map((plat) => {
                    const active = visiblePlatformTypes.has(plat.id);
                    const Icon = plat.icon;
                    return (
                      <button
                        key={plat.id}
                        onClick={() => handleTogglePlatformType(plat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                          background: active ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface-elevated)',
                          color: active ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{plat.label}</span>
                        </div>
                        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{plat.count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Argo Color Variable */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    COLOR PLATFORMS BY
                  </label>
                  <Select
                    size="sm"
                    value={argoFilters.colorByVariable}
                    onChange={(e) => setArgoFilters((prev) => ({ ...prev, colorByVariable: e.target.value as any }))}
                    options={[
                      { value: 'temperature', label: 'Sea Temperature (°C)' },
                      { value: 'salinity', label: 'Practical Salinity (PSU)' },
                      { value: 'pressure', label: 'Pressure (dbar)' },
                    ]}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Link to="/observations/argo">
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Dedicated Argo Explorer →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────── */}
            {/* TAB 2: NUMERICAL CIRCULATION MODELS (HYCOM, ROMS) */}
            {/* ──────────────────────────────────────────────── */}
            {explorerTab === 'models' && (
              <div className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Numerical Model Field
                  </span>
                  <Badge variant="primary">FastAPI Slice</Badge>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    CIRCULATION MODEL
                  </label>
                  <Select
                    size="sm"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    options={[
                      { value: 'hycom', label: 'HYCOM Global 1/12° (~8.5km)' },
                      { value: 'roms', label: 'ROMS Regional 1/24° (~4.2km)' },
                      { value: 'nemo', label: 'NEMO Global 1/4° (~28km)' },
                    ]}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    VARIABLE FIELD
                  </label>
                  <Select
                    size="sm"
                    value={modelVariable}
                    onChange={(e) => setModelVariable(e.target.value)}
                    options={[
                      { value: 'temperature', label: 'Sea Temperature (°C)' },
                      { value: 'salinity', label: 'Practical Salinity (PSU)' },
                      { value: 'currents', label: 'Current Velocity (m/s)' },
                    ]}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    DEPTH LEVEL
                  </label>
                  <Select
                    size="sm"
                    value={modelDepth.toString()}
                    onChange={(e) => setModelDepth(parseFloat(e.target.value))}
                    options={[
                      { value: '0', label: '0 m (Surface)' },
                      { value: '25', label: '25 m' },
                      { value: '50', label: '50 m (Mixed Layer)' },
                      { value: '100', label: '100 m (Thermocline)' },
                      { value: '200', label: '200 m' },
                      { value: '500', label: '500 m (Intermediate)' },
                      { value: '1000', label: '1000 m (Deep)' },
                      { value: '2000', label: '2000 m (Abyssal)' },
                    ]}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>LAYER OPACITY</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(modelOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={modelOpacity}
                    onChange={(e) => setModelOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Link to="/models">
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Dedicated Model Suite →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────── */}
            {/* TAB 3: SCIENTIFIC COMPARISON (MODEL VS MODEL)    */}
            {/* ──────────────────────────────────────────────── */}
            {explorerTab === 'comparison' && (
              <div className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Cross-Validation in 3D
                  </span>
                  <Badge variant="primary">Phase 10</Badge>
                </div>

                {/* Sub-mode toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => setComparisonSubMode('inter')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: comparisonSubMode === 'inter' ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: comparisonSubMode === 'inter' ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-elevated)',
                      color: comparisonSubMode === 'inter' ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    Model vs Model (Δ)
                  </button>
                  <button
                    onClick={() => setComparisonSubMode('obs')}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: comparisonSubMode === 'obs' ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: comparisonSubMode === 'obs' ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-elevated)',
                      color: comparisonSubMode === 'obs' ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    Model vs Obs
                  </button>
                </div>

                {comparisonSubMode === 'inter' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          MODEL A
                        </label>
                        <Select
                          size="sm"
                          value={interModelA}
                          onChange={(e) => setInterModelA(e.target.value)}
                          options={[
                            { value: 'hycom', label: 'HYCOM' },
                            { value: 'roms', label: 'ROMS' },
                            { value: 'nemo', label: 'NEMO' },
                          ]}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                          MODEL B
                        </label>
                        <Select
                          size="sm"
                          value={interModelB}
                          onChange={(e) => setInterModelB(e.target.value)}
                          options={[
                            { value: 'roms', label: 'ROMS' },
                            { value: 'nemo', label: 'NEMO' },
                            { value: 'hycom', label: 'HYCOM' },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        VARIABLE &amp; DEPTH
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                        <Select
                          size="sm"
                          value={interVariable}
                          onChange={(e) => setInterVariable(e.target.value)}
                          options={[
                            { value: 'temperature', label: 'Temperature' },
                            { value: 'salinity', label: 'Salinity' },
                            { value: 'currents', label: 'Currents' },
                          ]}
                        />
                        <Select
                          size="sm"
                          value={interDepth.toString()}
                          onChange={(e) => setInterDepth(parseFloat(e.target.value))}
                          options={[
                            { value: '0', label: '0m' },
                            { value: '50', label: '50m' },
                            { value: '100', label: '100m' },
                            { value: '500', label: '500m' },
                          ]}
                        />
                      </div>
                    </div>

                    {interSummary && (
                      <div style={{ background: 'var(--surface-elevated)', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>RMSD:</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{interSummary.rmsd.toFixed(3)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Relative Bias:</span>
                        <span style={{ fontWeight: 700, color: interSummary.bias >= 0 ? '#f43f5e' : '#38bdf8' }}>
                          {interSummary.bias > 0 ? `+${interSummary.bias.toFixed(3)}` : interSummary.bias.toFixed(3)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>Pattern R:</span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>{interSummary.r.toFixed(3)}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Grid Cells:</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{interSummary.points}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Rendering matched Argo float positions with color representing model residual error (Δ = Model − Observed).
                    </p>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Link to="/comparison">
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Full Comparison Charts →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* ──────────────────────────────────────────────── */}
            {/* TAB 4: 3D DEPTH PLANES & 4D TIME CONTROLS        */}
            {/* ──────────────────────────────────────────────── */}
            {explorerTab === 'depth_time' && (
              <div className="space-y-4">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Subsurface Depth Strata (3D)
                  </span>
                  <Badge variant="primary">0–2000m</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {depthConfigs.map((cfg) => {
                    const active = visibleDepths.has(cfg.depth_m);
                    return (
                      <button
                        key={cfg.depth_m}
                        onClick={() => handleToggleDepthLayer(cfg.depth_m)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          border: active ? `1px solid ${cfg.color || 'var(--primary)'}` : '1px solid var(--border)',
                          background: active ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface-elevated)',
                          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color }} />
                          <span>{cfg.depth_m}m</span>
                        </div>
                        <Eye className={`w-3 h-3 ${active ? 'text-[var(--primary)]' : 'opacity-30'}`} />
                      </button>
                    );
                  })}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>PLANES OPACITY</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(depthPlanesOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={depthPlanesOpacity}
                    onChange={(e) => setDepthPlanesOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <Link to="/4d">
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      Open Dedicated 4D Time Portal →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Scientific Legend on Globe */}
      <GlobeScientificLegend
        mode={
          explorerTab === 'models'
            ? 'model'
            : explorerTab === 'comparison'
            ? comparisonSubMode === 'inter'
              ? 'inter_comparison'
              : 'obs_comparison'
            : 'observations'
        }
        modelName={selectedModel}
        modelBName={interModelB}
        variableName={explorerTab === 'comparison' ? interVariable : modelVariable}
        units={modelGridConfig?.units || '°C'}
        depthM={explorerTab === 'comparison' ? interDepth : modelDepth}
        minVal={modelGridConfig?.minVal ?? 10}
        maxVal={modelGridConfig?.maxVal ?? 30}
        isDifference={modelGridConfig?.isDifferenceField}
      />

      {/* 4D Bottom Timeline Bar (When 3D/4D tab is selected) */}
      {explorerTab === 'depth_time' && (
        <TimelineControlBar
          currentProgressPct={timelineProgressPct}
          onSeek={setTimelineProgressPct}
          isPlaying={isTimelinePlaying}
          onTogglePlay={() => setIsTimelinePlaying(!isTimelinePlaying)}
          playbackSpeed={timelineSpeed}
          onChangeSpeed={setTimelineSpeed}
          currentTimestamp={getCurrentTimelineTimestamp()}
          activePlatformCount={platformItems.length + argoObservations.length}
        />
      )}

      {/* Floating Right Navigation Controls */}
      <NavigationControls
        heading={coordInfo.heading}
        pitch={coordInfo.pitch}
        sceneMode={sceneMode}
        onResetNorth={() => {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.flyTo({
            destination: viewer.camera.position,
            orientation: { heading: 0, pitch: viewer.camera.pitch, roll: 0 },
            duration: 1.0,
          });
        }}
        onToggleSceneMode={() => setSceneMode((prev) => (prev === '3D' ? '2D' : '3D'))}
        onZoomIn={() => {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.4);
        }}
        onZoomOut={() => {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.6);
        }}
        onResetTilt={() => {
          const viewer = viewerRef.current;
          if (!viewer) return;
          viewer.camera.flyTo({
            destination: viewer.camera.position,
            orientation: { heading: viewer.camera.heading, pitch: Cesium.Math.toRadians(-90), roll: 0 },
            duration: 1.0,
          });
        }}
      />

      {/* Floating Side Panels */}
      {activePanel === 'layers' && (
        <LayerPanel
          layerState={layerState}
          onToggleLayer={(layerKey: keyof LayerState) => {
            setLayerState((prev) => ({
              ...prev,
              [layerKey]: !prev[layerKey],
            }));
          }}
          onUpdateTerrainExaggeration={(factor: number) => {
            setLayerState((prev) => ({ ...prev, terrainExaggeration: factor }));
          }}
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
          onAddPlacemark={(name: string, desc: string) => {
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
          }}
          onFlyToPlacemark={(p: Placemark) => {
            const viewer = viewerRef.current;
            if (!viewer) return;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, 50000.0),
              duration: 2.0,
            });
          }}
          onDeletePlacemark={(id: string) => setPlacemarks((prev) => prev.filter((p) => p.id !== id))}
          onClose={() => setActivePanel('none')}
        />
      )}

      {/* Selected Argo Float Card */}
      {selectedArgoFloat && !drawerObservation && (
        <ArgoFloatCard
          observation={selectedArgoFloat}
          onClose={() => setSelectedArgoFloat(null)}
          onFlyTo={() => {
            const viewer = viewerRef.current;
            if (!viewer) return;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(selectedArgoFloat.longitude, selectedArgoFloat.latitude, 120000.0),
              duration: 1.8,
            });
          }}
          onViewDetails={() => handleOpenTelemetryDrawer(selectedArgoFloat)}
          onBookmark={() => {
            setPlacemarks((prev) => [
              {
                id: 'pin_' + Date.now(),
                name: `Float #${selectedArgoFloat.platformNumber}`,
                description: `Temp: ${selectedArgoFloat.temperature?.toFixed(1)}°C, PSAL: ${selectedArgoFloat.salinity?.toFixed(1)}`,
                latitude: selectedArgoFloat.latitude,
                longitude: selectedArgoFloat.longitude,
                height: 0,
                createdAt: Date.now(),
              },
              ...prev,
            ]);
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
            setPlacemarks((prev) => [
              {
                id: 'pin_' + Date.now(),
                name: clickedLocation.details?.name || `Pin (${clickedLocation.latitude.toFixed(2)}°, ${clickedLocation.longitude.toFixed(2)}°)`,
                description: 'Saved location',
                latitude: clickedLocation.latitude,
                longitude: clickedLocation.longitude,
                height: clickedLocation.height,
                createdAt: Date.now(),
              },
              ...prev,
            ]);
          }}
        />
      )}

      {/* Bottom Status Bar */}
      <StatusBar coordInfo={coordInfo} />
    </div>
  );
};

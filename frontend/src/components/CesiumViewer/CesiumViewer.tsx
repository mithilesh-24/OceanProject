import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { CoordinateInfo, LayerState, LocationDetails, MeasureModeType, Placemark, SceneModeType } from '../../types';
import { ArgoColorVariable, ArgoObservation } from '../../types/argo';
import { GeographicLabelsManager } from './GeographicLabelsManager';
import { BoundariesManager } from './BoundariesManager';
import { CloudsManager } from './CloudsManager';
import { BathymetryManager } from './BathymetryManager';
import { ArgoVisualizationManager } from './ArgoVisualizationManager';
import { ModelGridLayerManager, ModelGridConfig } from './ModelGridLayerManager';
import { ObservationPlatformsManager, PlatformItem } from './ObservationPlatformsManager';
import { OceanCurrentParticlesManager } from './OceanCurrentParticlesManager';
import { detectGpuCapabilities, applyGpuOptimizationsToViewer } from '../../utils/gpuAcceleration';
import { ALL_PLACES, ALL_COUNTRIES, ALL_STATES } from '../../data/naturalEarthIndex';

interface CesiumViewerProps {
  layerState: LayerState;
  sceneMode: SceneModeType;
  measureMode: MeasureModeType;
  placemarks: Placemark[];
  argoObservations?: ArgoObservation[];
  argoColorVariable?: ArgoColorVariable;
  selectedArgoFloatId?: string | null;
  modelGridConfig?: ModelGridConfig | null;
  platformItems?: PlatformItem[];
  visiblePlatformTypes?: Set<string>;
  modelLayerOpacity?: number;
  particlesEnabled?: boolean;
  onCoordinateUpdate: (info: CoordinateInfo) => void;
  onLocationClick: (info: CoordinateInfo & { details?: LocationDetails }) => void;
  onArgoFloatClick?: (obs: ArgoObservation) => void;
  onPlatformClick?: (platform: PlatformItem) => void;
  onArgoFloatVisibilityChange?: (id: string, isVisible: boolean) => void;
  onMeasurementChange: (value: { type: 'distance' | 'area'; result: string }) => void;
  viewerRefOut?: React.MutableRefObject<Cesium.Viewer | null>;
}

export const CesiumViewer: React.FC<CesiumViewerProps> = ({
  layerState,
  sceneMode,
  measureMode,
  placemarks,
  argoObservations = [],
  argoColorVariable = 'temperature',
  selectedArgoFloatId = null,
  modelGridConfig = null,
  platformItems = [],
  visiblePlatformTypes = new Set(['argo', 'glider', 'buoy', 'ctd', 'adcp', 'residual']),
  modelLayerOpacity = 0.75,
  particlesEnabled = true,
  onCoordinateUpdate,
  onLocationClick,
  onArgoFloatClick,
  onPlatformClick,
  onArgoFloatVisibilityChange,
  onMeasurementChange,
  viewerRefOut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const buildingTilesetRef = useRef<Cesium.Cesium3DTileset | null>(null);
  const placemarkEntitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());
  const baseImageryLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const worldTerrainProviderRef = useRef<Cesium.TerrainProvider | null>(null);
  const ellipsoidTerrainRef = useRef<Cesium.TerrainProvider>(new Cesium.EllipsoidTerrainProvider());

  // Managers
  const labelsManagerRef = useRef<GeographicLabelsManager | null>(null);
  const boundariesManagerRef = useRef<BoundariesManager | null>(null);
  const cloudsManagerRef = useRef<CloudsManager | null>(null);
  const bathymetryManagerRef = useRef<BathymetryManager | null>(null);
  const argoManagerRef = useRef<ArgoVisualizationManager | null>(null);
  const modelGridManagerRef = useRef<ModelGridLayerManager | null>(null);
  const platformsManagerRef = useRef<ObservationPlatformsManager | null>(null);
  const particlesManagerRef = useRef<OceanCurrentParticlesManager | null>(null);

  // Measurement state
  const measurePointsRef = useRef<Cesium.Cartesian3[]>([]);
  const measureEntitiesRef = useRef<Cesium.Entity[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect hardware GPU capabilities vs software rasterizer fallback
    const gpuInfo = detectGpuCapabilities();

    // ═══════════════════════════════════════════
    // CESIUM VIEWER INITIALIZATION WITH GPU OPTIONS
    // ═══════════════════════════════════════════
    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: ellipsoidTerrainRef.current,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: false,
      shouldAnimate: true,
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity,
      contextOptions: {
        webgl: {
          alpha: false,
          depth: true,
          stencil: false,
          antialias: gpuInfo.isGpuAvailable,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          powerPreference: gpuInfo.isGpuAvailable ? 'high-performance' : 'default',
        },
      },
    });

    viewerRef.current = viewer;
    if (viewerRefOut) {
      viewerRefOut.current = viewer;
    }

    const scene = viewer.scene;
    const globe = scene.globe;

    // Apply GPU vs CPU hardware optimizations
    applyGpuOptimizationsToViewer(viewer, gpuInfo);

    (globe as any).terrainExaggeration = layerState.terrainExaggeration || 1.5;

    // Atmosphere
    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = true;
      scene.skyAtmosphere.brightnessShift = 0.0;
      scene.skyAtmosphere.saturationShift = 0.05;
      scene.skyAtmosphere.hueShift = 0.0;
    }

    // Day/Night lighting default setup
    const isRealisticLighting = layerState.lightingMode === 'realistic';
    globe.enableLighting = isRealisticLighting;
    if (viewer.scene.sun) viewer.scene.sun.show = isRealisticLighting;

    // ═══════════════════════════════════════════
    // 2. CAMERA & TOUCH CONTROLLER
    // ═══════════════════════════════════════════
    const controller = scene.screenSpaceCameraController;
    controller.enableInputs = true;
    controller.inertiaSpin = 0.9;
    controller.inertiaTranslate = 0.9;
    controller.inertiaZoom = 0.8;
    controller.minimumZoomDistance = 50;
    controller.maximumZoomDistance = 40000000;
    controller.enableRotate = true;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableTilt = true;
    controller.enableLook = true;
    controller.rotateEventTypes = [Cesium.CameraEventType.LEFT_DRAG];
    controller.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.RIGHT_DRAG];

    // Pinch-to-zoom & two-finger tilt
    const cesiumCanvas = scene.canvas;
    let initialPinchDistance = 0;
    let initialAltitude = 0;

    const handlePinchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
        if (viewer && !viewer.isDestroyed()) {
          const carto = viewer.camera.positionCartographic;
          if (carto) initialAltitude = carto.height;
        }
      }
    };

    const handlePinchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);
        const ratio = initialPinchDistance / currentDistance;
        const targetAlt = Math.max(100, Math.min(35000000, initialAltitude * ratio));
        if (viewer && !viewer.isDestroyed()) {
          const carto = viewer.camera.positionCartographic;
          if (carto) {
            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, targetAlt),
            });
          }
        }
      }
    };

    const handlePinchEnd = () => {
      initialPinchDistance = 0;
    };

    cesiumCanvas.addEventListener('touchstart', handlePinchStart, { passive: false });
    cesiumCanvas.addEventListener('touchmove', handlePinchMove, { passive: false });
    cesiumCanvas.addEventListener('touchend', handlePinchEnd);

    // ═══════════════════════════════════════════
    // 3. BASE IMAGERY LAYER
    // ═══════════════════════════════════════════
    try {
      Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      ).then((esriImagery) => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          const layer = viewerRef.current.imageryLayers.addImageryProvider(esriImagery);
          baseImageryLayerRef.current = layer;
          layer.show = layerState.satellite !== false;
        }
      }).catch(() => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          const layer = viewerRef.current.imageryLayers.addImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
              url: 'https://a.tile.openstreetmap.org/',
            })
          );
          baseImageryLayerRef.current = layer;
          layer.show = layerState.satellite !== false;
        }
      });
    } catch (e) {
      console.warn('Imagery provider notice:', e);
    }

    // ═══════════════════════════════════════════
    // 4. REAL 3D TERRAIN
    // ═══════════════════════════════════════════
    try {
      Cesium.createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true,
      }).then((terrainProvider: Cesium.TerrainProvider) => {
        worldTerrainProviderRef.current = terrainProvider;
        if (viewerRef.current && !viewerRef.current.isDestroyed() && layerState.terrain !== false) {
          viewerRef.current.terrainProvider = terrainProvider;
        }
      }).catch((err: unknown) => {
        console.warn('World Terrain notice:', err);
      });
    } catch (err) {
      console.warn('Terrain initialization notice:', err);
    }

    // ═══════════════════════════════════════════
    // 5. MANAGERS INITIALIZATION
    // ═══════════════════════════════════════════
    labelsManagerRef.current = new GeographicLabelsManager(viewer);
    boundariesManagerRef.current = new BoundariesManager(viewer);
    cloudsManagerRef.current = new CloudsManager(viewer);
    bathymetryManagerRef.current = new BathymetryManager(viewer);
    argoManagerRef.current = new ArgoVisualizationManager(viewer);
    modelGridManagerRef.current = new ModelGridLayerManager(viewer);
    platformsManagerRef.current = new ObservationPlatformsManager(viewer);
    particlesManagerRef.current = new OceanCurrentParticlesManager(viewer);

    // Initial Camera View (Indian Ocean)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(77.0, 15.0, 18000000),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0,
      },
    });

    viewer.camera.percentageChanged = 0.01;

    // ═══════════════════════════════════════════
    // 6. HIGH-PERFORMANCE CAMERA EVENT LIFECYCLE
    // ═══════════════════════════════════════════
    // Camera movement takes strict priority: during active rotation/pan/zoom,
    // heavy calculations and React setState re-renders are bypassed.
    const removeMoveStartListener = viewer.camera.moveStart.addEventListener(() => {
      particlesManagerRef.current?.onCameraMoveStart();
      labelsManagerRef.current?.onCameraMoveStart();
      argoManagerRef.current?.onCameraMoveStart();
    });

    const removeMoveEndListener = viewer.camera.moveEnd.addEventListener(() => {
      if (!viewer || viewer.isDestroyed()) return;

      particlesManagerRef.current?.onCameraMoveEnd();
      labelsManagerRef.current?.onCameraMoveEnd();
      argoManagerRef.current?.onCameraMoveEnd();

      const camera = viewer.camera;
      const position = camera.positionCartographic;
      if (position) {
        onCoordinateUpdate({
          latitude: Cesium.Math.toDegrees(position.latitude),
          longitude: Cesium.Math.toDegrees(position.longitude),
          height: 0,
          cameraAltitude: position.height,
          heading: Math.round(Cesium.Math.toDegrees(camera.heading || 0)),
          pitch: Math.round(Cesium.Math.toDegrees(camera.pitch || 0)),
        });
      }
    });


    // ═══════════════════════════════════════════
    // 7. CLICK HANDLER
    // ═══════════════════════════════════════════
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;

      if (argoManagerRef.current) {
        const pickedObject = scene.pick(click.position);
        const argoPick = argoManagerRef.current.pick(
          pickedObject ? (pickedObject.primitive || pickedObject) : null,
          click.position
        );
        if (argoPick) {
          if (argoPick.type === 'cluster') {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                argoPick.cluster.centroidLon,
                argoPick.cluster.centroidLat,
                1600000.0
              ),
              duration: 1.2,
            });
            return;
          } else if (argoPick.type === 'float' && onArgoFloatClick) {
            onArgoFloatClick(argoPick.observation);
            return;
          }
        }
      }

      if (platformsManagerRef.current) {
        const platform = platformsManagerRef.current.pickPlatform(click.position);
        if (platform && onPlatformClick) {
          onPlatformClick(platform);
          return;
        }
      }

      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;

      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);

      let groundHeight = 0;
      try {
        const globeHeight = scene.globe.getHeight(cartographic);
        if (globeHeight !== undefined && globeHeight !== null && !isNaN(globeHeight)) {
          groundHeight = Math.round(globeHeight);
        } else {
          groundHeight = Math.round(Math.max(0, cartographic.height));
        }
      } catch {
        groundHeight = Math.max(0, Math.round(cartographic.height));
      }
      if (groundHeight < -400) groundHeight = 0;
      if (groundHeight > 9000) groundHeight = Math.round(cartographic.height);

      let nearestPlace = ALL_PLACES[0];
      let minDist = Number.MAX_VALUE;
      ALL_PLACES.forEach((p) => {
        const d = Math.hypot(p.lat - lat, p.lon - lon);
        if (d < minDist) {
          minDist = d;
          nearestPlace = p;
        }
      });

      let nearestCountry = '';
      let nearestState = '';
      let minCountryDist = Number.MAX_VALUE;
      ALL_COUNTRIES.forEach((c) => {
        const d = Math.hypot(c.lat - lat, c.lon - lon);
        if (d < minCountryDist) {
          minCountryDist = d;
          nearestCountry = c.name;
        }
      });
      let minStateDist = Number.MAX_VALUE;
      ALL_STATES.forEach((s) => {
        const d = Math.hypot(s.lat - lat, s.lon - lon);
        if (d < minStateDist) {
          minStateDist = d;
          nearestState = s.name;
        }
      });

      const details: LocationDetails = {
        name: nearestPlace ? nearestPlace.name : 'Location',
        category: nearestPlace ? (nearestPlace.category as any) : 'coordinate',
        country: nearestPlace?.country || nearestCountry || undefined,
        state: nearestPlace?.state || nearestState || undefined,
        elevation: groundHeight,
      };

      onLocationClick({
        latitude: lat,
        longitude: lon,
        height: groundHeight,
        cameraAltitude: viewer.camera.positionCartographic?.height || 50000,
        heading: Math.round(Cesium.Math.toDegrees(viewer.camera.heading || 0)),
        pitch: Math.round(Cesium.Math.toDegrees(viewer.camera.pitch || 0)),
        details,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Double click to fly in smoothly
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;
      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;
      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const targetHeight = Math.max(10000, (viewer.camera.positionCartographic?.height || 500000) * 0.35);

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, targetHeight),
        duration: 1.5,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    return () => {
      cesiumCanvas.removeEventListener('touchstart', handlePinchStart);
      cesiumCanvas.removeEventListener('touchmove', handlePinchMove);
      cesiumCanvas.removeEventListener('touchend', handlePinchEnd);
      removeMoveStartListener();
      removeMoveEndListener();
      handler.destroy();
      labelsManagerRef.current?.destroy();
      boundariesManagerRef.current?.destroy();
      cloudsManagerRef.current?.destroy();
      bathymetryManagerRef.current?.destroy();
      argoManagerRef.current?.destroy();
      modelGridManagerRef.current?.destroy();
      platformsManagerRef.current?.destroy();
      particlesManagerRef.current?.destroy();
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  // ═══════════════════════════════════════════
  // Day/Night Lighting Mode
  // ═══════════════════════════════════════════
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const globe = viewer.scene.globe;
    const isRealistic = layerState.lightingMode === 'realistic';
    globe.enableLighting = isRealistic;
    if (viewer.scene.sun) viewer.scene.sun.show = isRealistic;

    if (isRealistic) {
      (globe as any).nightFadeOutDistance = 1e7;
      (globe as any).nightFadeInDistance = 5e6;
    } else {
      (globe as any).nightFadeOutDistance = 1e10;
      (globe as any).nightFadeInDistance = 5e9;
    }
  }, [layerState.lightingMode]);

  // ═══════════════════════════════════════════
  // Base Layers (Satellite, Terrain, Clouds, Borders, Labels, Bathymetry)
  // ═══════════════════════════════════════════
  useEffect(() => {
    // Satellite imagery visibility
    if (baseImageryLayerRef.current) {
      baseImageryLayerRef.current.show = layerState.satellite !== false;
    }

    // Terrain provider switching
    const viewer = viewerRef.current;
    if (viewer && !viewer.isDestroyed()) {
      if (layerState.terrain !== false && worldTerrainProviderRef.current) {
        viewer.terrainProvider = worldTerrainProviderRef.current;
      } else {
        viewer.terrainProvider = ellipsoidTerrainRef.current;
      }
      (viewer.scene.globe as any).terrainExaggeration = layerState.terrainExaggeration || 1.5;
    }

    labelsManagerRef.current?.setEnabled(layerState.labels !== false);
    boundariesManagerRef.current?.setEnabled(layerState.borders !== false);
    cloudsManagerRef.current?.setEnabled(!!layerState.clouds);
    bathymetryManagerRef.current?.setEnabled(!!layerState.bathymetry);
    particlesManagerRef.current?.setEnabled(particlesEnabled && layerState.oceanCurrents !== false);
  }, [layerState, particlesEnabled]);

  // Handle Argo Observations, Color Variable & Selection Highlights
  useEffect(() => {
    if (argoManagerRef.current) {
      const enabled = layerState.argoFloats !== false;
      argoManagerRef.current.setEnabled(enabled);
      if (enabled) {
        argoManagerRef.current.setObservations(argoObservations, argoColorVariable, selectedArgoFloatId);
      }
    }
  }, [argoObservations, argoColorVariable, selectedArgoFloatId, layerState.argoFloats]);

  // Handle Numerical Model Slices & Difference Fields on Cesium
  useEffect(() => {
    if (modelGridManagerRef.current) {
      if (modelGridConfig) {
        modelGridManagerRef.current.setEnabled(true);
        modelGridManagerRef.current.updateGridLayer({
          ...modelGridConfig,
          opacity: modelLayerOpacity,
        });
      } else {
        modelGridManagerRef.current.removeLayer();
      }
    }
  }, [modelGridConfig, modelLayerOpacity]);

  // Handle Multi-Sensor Observation Platforms
  useEffect(() => {
    if (platformsManagerRef.current) {
      platformsManagerRef.current.setVisibleTypes(visiblePlatformTypes);
      platformsManagerRef.current.setPlatforms(platformItems);
    }
  }, [platformItems, visiblePlatformTypes]);

  // ═══════════════════════════════════════════
  // Scene Mode Switching (3D / 2D / COLUMBUS)
  // ═══════════════════════════════════════════
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (sceneMode === '2D') {
      viewer.scene.morphTo2D(1.5);
    } else if (sceneMode === 'COLUMBUS') {
      viewer.scene.morphToColumbusView(1.5);
    } else {
      viewer.scene.morphTo3D(1.5);
    }
  }, [sceneMode]);

  // ═══════════════════════════════════════════
  // 3D Buildings Layer
  // ═══════════════════════════════════════════
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    if (layerState.buildings3D) {
      if (!buildingTilesetRef.current) {
        Cesium.createOsmBuildingsAsync()
          .then((tileset) => {
            buildingTilesetRef.current = tileset;
            if (viewerRef.current && !viewerRef.current.isDestroyed()) {
              viewerRef.current.scene.primitives.add(tileset);
            }
          })
          .catch((err) => console.warn('OSM Buildings notice:', err));
      } else {
        buildingTilesetRef.current.show = true;
      }
    } else if (buildingTilesetRef.current) {
      buildingTilesetRef.current.show = false;
    }
  }, [layerState.buildings3D]);

  // ═══════════════════════════════════════════
  // Placemarks
  // ═══════════════════════════════════════════
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const currentMap = placemarkEntitiesRef.current;
    const currentIds = new Set(placemarks.map((p) => p.id));

    currentMap.forEach((entity, id) => {
      if (!currentIds.has(id)) {
        viewer.entities.remove(entity);
        currentMap.delete(id);
      }
    });

    placemarks.forEach((p) => {
      if (!currentMap.has(p.id)) {
        const entity = viewer.entities.add({
          id: p.id,
          name: p.name,
          position: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, p.height + 10),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#38bdf8'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
          label: {
            text: p.name,
            font: '13px Inter, sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        currentMap.set(p.id, entity);
      }
    });
  }, [placemarks]);

  // ═══════════════════════════════════════════
  // Measurement Tool
  // ═══════════════════════════════════════════
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    measureEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    measureEntitiesRef.current = [];
    measurePointsRef.current = [];

    if (measureMode === 'none') return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      measurePointsRef.current.push(cartesian);
      const points = measurePointsRef.current;

      const ptEntity = viewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 8,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
      });
      measureEntitiesRef.current.push(ptEntity);

      if (measureMode === 'distance' && points.length >= 2) {
        const lineEntity = viewer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(() => measurePointsRef.current, false),
            width: 3,
            material: Cesium.Color.YELLOW,
            clampToGround: true,
          },
        });
        measureEntitiesRef.current.push(lineEntity);

        let totalDist = 0;
        for (let i = 0; i < points.length - 1; i++) {
          totalDist += Cesium.Cartesian3.distance(points[i], points[i + 1]);
        }
        onMeasurementChange({
          type: 'distance',
          result: `${(totalDist / 1000).toFixed(2)} km`,
        });
      } else if (measureMode === 'area' && points.length >= 3) {
        const polyEntity = viewer.entities.add({
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(measurePointsRef.current), false),
            material: Cesium.Color.CYAN.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.CYAN,
          },
        });
        measureEntitiesRef.current.push(polyEntity);

        const carts = points.map((p) => Cesium.Cartographic.fromCartesian(p));
        let approxArea = 0;
        for (let i = 0; i < carts.length; i++) {
          const j = (i + 1) % carts.length;
          approxArea += carts[i].longitude * carts[j].latitude - carts[j].longitude * carts[i].latitude;
        }
        approxArea = Math.abs(approxArea * 0.5 * 6378137 * 6378137);
        onMeasurementChange({
          type: 'area',
          result: `${(approxArea / 1000000).toFixed(2)} km²`,
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [measureMode]);

  return <div ref={containerRef} className="cesium-viewer-container" />;
};

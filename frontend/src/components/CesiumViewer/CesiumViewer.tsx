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
  viewerRefOut
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const buildingTilesetRef = useRef<Cesium.Cesium3DTileset | null>(null);
  const placemarkEntitiesRef = useRef<Map<string, Cesium.Entity>>(new Map());
  
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

    // ═══════════════════════════════════════════
    // CESIUM VIEWER INITIALIZATION
    // ═══════════════════════════════════════════
    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false, // Disable green bracket selection indicator
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: false,
      shouldAnimate: true,
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity,
    });

    viewerRef.current = viewer;
    if (viewerRefOut) {
      viewerRefOut.current = viewer;
    }

    const scene = viewer.scene;
    const globe = scene.globe;

    // ═══════════════════════════════════════════
    // 1. EARTH VISUAL QUALITY
    // ═══════════════════════════════════════════
    globe.depthTestAgainstTerrain = true;
    globe.showGroundAtmosphere = true;
    globe.showWaterEffect = true;
    (globe as any).terrainExaggeration = layerState.terrainExaggeration || 1.5;

    // Atmosphere
    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = true;
      scene.skyAtmosphere.brightnessShift = 0.0;
      scene.skyAtmosphere.saturationShift = 0.05;
      scene.skyAtmosphere.hueShift = 0.0;
    }

    // Day/Night lighting - enable by default with sun
    globe.enableLighting = true;
    if (viewer.scene.sun) viewer.scene.sun.show = true;

    // ═══════════════════════════════════════════
    // 2. CAMERA & TOUCH CONTROLLER
    // ═══════════════════════════════════════════
    const controller = scene.screenSpaceCameraController;
    controller.enableInputs = true;
    
    // Smooth inertia for Google-Earth-like feel
    controller.inertiaSpin = 0.9;
    controller.inertiaTranslate = 0.9;
    controller.inertiaZoom = 0.8;
    
    // Zoom limits
    controller.minimumZoomDistance = 50;
    controller.maximumZoomDistance = 40000000;
    
    // Enable all interaction modes
    controller.enableRotate = true;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableTilt = true;
    controller.enableLook = true;

    // Touch gesture mapping
    controller.rotateEventTypes = [
      Cesium.CameraEventType.LEFT_DRAG,
    ];

    controller.zoomEventTypes = [
      Cesium.CameraEventType.WHEEL,
      Cesium.CameraEventType.RIGHT_DRAG,
    ];

    controller.tiltEventTypes = [
      Cesium.CameraEventType.MIDDLE_DRAG,
      {
        eventType: Cesium.CameraEventType.LEFT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL,
      },
      {
        eventType: Cesium.CameraEventType.RIGHT_DRAG,
        modifier: Cesium.KeyboardEventModifier.CTRL,
      },
    ];

    controller.lookEventTypes = [
      {
        eventType: Cesium.CameraEventType.LEFT_DRAG,
        modifier: Cesium.KeyboardEventModifier.SHIFT,
      },
    ];

    // Prevent browser touch scroll & native page zoom
    const cesiumCanvas = viewer.canvas;
    cesiumCanvas.style.touchAction = 'none';
    if (containerRef.current) {
      containerRef.current.style.touchAction = 'none';
    }
    const cesiumWidget = containerRef.current?.querySelector('.cesium-widget') as HTMLElement;
    if (cesiumWidget) {
      cesiumWidget.style.touchAction = 'none';
    }

    // Explicit 2-finger pinch zoom controller for standard mobile map behavior
    // Distance increases (pinch outward) -> zoomIn (move camera closer to Earth)
    // Distance decreases (pinch inward) -> zoomOut (move camera farther from Earth)
    let lastPinchDistance = 0;

    const handlePinchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        lastPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      }
    };

    const handlePinchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

        if (lastPinchDistance > 0 && viewerRef.current && !viewerRef.current.isDestroyed()) {
          const delta = currentDistance - lastPinchDistance;
          if (Math.abs(delta) > 0.5) {
            const camera = viewerRef.current.camera;
            const alt = camera.positionCartographic ? camera.positionCartographic.height : 100000;
            const normDelta = delta / Math.max(window.innerWidth, window.innerHeight);
            const zoomAmount = Math.min(alt * 0.4, alt * Math.abs(normDelta) * 2.2);

            if (delta > 0) {
              // Pinch OUTWARD (fingers moving AWAY) -> ZOOM IN (closer to Earth)
              camera.zoomIn(zoomAmount);
            } else if (delta < 0) {
              // Pinch INWARD (fingers moving CLOSER) -> ZOOM OUT (farther from Earth)
              camera.zoomOut(zoomAmount);
            }
          }
        }
        lastPinchDistance = currentDistance;
      }
    };

    const handlePinchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastPinchDistance = 0;
      }
    };

    cesiumCanvas.addEventListener('touchstart', handlePinchStart, { passive: false });
    cesiumCanvas.addEventListener('touchmove', handlePinchMove, { passive: false });
    cesiumCanvas.addEventListener('touchend', handlePinchEnd, { passive: true });

    // ═══════════════════════════════════════════
    // 3. SATELLITE IMAGERY PROVIDER
    // ═══════════════════════════════════════════
    try {
      viewer.imageryLayers.removeAll();
      Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      ).then((esriImagery) => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.imageryLayers.addImageryProvider(esriImagery);
        }
      }).catch(() => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.imageryLayers.addImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
              url: 'https://a.tile.openstreetmap.org/',
            })
          );
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
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.terrainProvider = terrainProvider;
        }
      }).catch((err: unknown) => {
        console.warn('World Terrain notice:', err);
      });
    } catch (err) {
      console.warn('Terrain initialization notice:', err);
    }

    // ═══════════════════════════════════════════
    // 5. GEOGRAPHIC & ARGO MANAGERS
    // ═══════════════════════════════════════════
    labelsManagerRef.current = new GeographicLabelsManager(viewer);
    boundariesManagerRef.current = new BoundariesManager(viewer);
    cloudsManagerRef.current = new CloudsManager(viewer);
    bathymetryManagerRef.current = new BathymetryManager(viewer);
    argoManagerRef.current = new ArgoVisualizationManager(viewer);
    modelGridManagerRef.current = new ModelGridLayerManager(viewer);
    platformsManagerRef.current = new ObservationPlatformsManager(viewer);
    particlesManagerRef.current = new OceanCurrentParticlesManager(viewer);

    // Initial Camera View (Indian Ocean View)
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
    // 6. CAMERA UPDATE LISTENER (Status Bar & Geographic Visibility)
    // ═══════════════════════════════════════════
    const removeCameraListener = viewer.camera.changed.addEventListener(() => {
      if (!viewer || viewer.isDestroyed()) return;
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

        // Trigger dynamic clustering LOD transition based on camera altitude
        if (argoManagerRef.current) {
          argoManagerRef.current.updateCameraAltitude(position.height);
        }
      }

      // Recalculate 3D Argo float geographic camera view & horizon visibility
      if (argoManagerRef.current) {
        const { hiddenSelectedId } = argoManagerRef.current.updateCameraVisibility();
        if (hiddenSelectedId && onArgoFloatVisibilityChange) {
          onArgoFloatVisibilityChange(hiddenSelectedId, false);
        }
      }
    });

    // ═══════════════════════════════════════════
    // 7. CLICK & DOUBLE-CLICK HANDLERS
    // ═══════════════════════════════════════════
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    // Single Left Click Handler
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;

      // First check if an Argo Float observation or Cluster badge was tapped/clicked!
      if (argoManagerRef.current) {
        const pickedObject = scene.pick(click.position);
        const argoPick = argoManagerRef.current.pick(
          pickedObject ? (pickedObject.primitive || pickedObject) : null,
          click.position
        );
        if (argoPick) {
          if (argoPick.type === 'cluster') {
            // Smoothly fly into cluster centroid to unpack individual floats!
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
            return; // Handled Argo float click!
          }
        }
      }

      // Check if a multi-platform observation (Glider, Buoy, CTD, ADCP, Residual) was tapped!
      if (platformsManagerRef.current) {
        const platform = platformsManagerRef.current.pickPlatform(click.position);
        if (platform && onPlatformClick) {
          onPlatformClick(platform);
          return;
        }
      }

      // Otherwise handle location pick on globe
      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;

      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      const camAlt = viewer.camera.positionCartographic
        ? viewer.camera.positionCartographic.height
        : 50000;

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
      ALL_COUNTRIES.forEach(c => {
        const d = Math.hypot(c.lat - lat, c.lon - lon);
        if (d < minCountryDist) {
          minCountryDist = d;
          nearestCountry = c.name;
        }
      });
      let minStateDist = Number.MAX_VALUE;
      ALL_STATES.forEach(s => {
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
        cameraAltitude: camAlt,
        heading: Math.round(Cesium.Math.toDegrees(viewer.camera.heading || 0)),
        pitch: Math.round(Cesium.Math.toDegrees(viewer.camera.pitch || 0)),
        details,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Double Click / Double Tap: Zoom toward clicked location
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      if (!viewer || viewer.isDestroyed()) return;

      const ray = viewer.camera.getPickRay(click.position);
      if (!ray) return;

      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      const currentAlt = viewer.camera.positionCartographic
        ? viewer.camera.positionCartographic.height
        : 100000;

      const targetAlt = Math.max(200, currentAlt * 0.35);

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, targetAlt),
        orientation: {
          heading: viewer.camera.heading,
          pitch: viewer.camera.pitch,
          roll: 0.0,
        },
        duration: 1.5,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // ═══════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════
    return () => {
      cesiumCanvas.removeEventListener('touchstart', handlePinchStart);
      cesiumCanvas.removeEventListener('touchmove', handlePinchMove);
      cesiumCanvas.removeEventListener('touchend', handlePinchEnd);
      removeCameraListener();
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
    globe.enableLighting = true;
    if (viewer.scene.sun) viewer.scene.sun.show = true;

    if (layerState.lightingMode === 'realistic') {
      (globe as any).nightFadeOutDistance = 1e7;
      (globe as any).nightFadeInDistance = 5e6;
    } else {
      (globe as any).nightFadeOutDistance = 1e10;
      (globe as any).nightFadeInDistance = 5e9;
    }
  }, [layerState.lightingMode]);

  // ═══════════════════════════════════════════
  // Layer Manager Toggles & Argo Data Updates
  // ═══════════════════════════════════════════
  useEffect(() => {
    labelsManagerRef.current?.setEnabled(layerState.labels);
    boundariesManagerRef.current?.setEnabled(layerState.borders);
    cloudsManagerRef.current?.setEnabled(layerState.clouds);
    bathymetryManagerRef.current?.setEnabled(layerState.bathymetry);
    particlesManagerRef.current?.setEnabled(particlesEnabled && layerState.oceanCurrents !== false);

    const viewer = viewerRef.current;
    if (viewer && !viewer.isDestroyed()) {
      (viewer.scene.globe as any).terrainExaggeration = layerState.terrainExaggeration;
    }
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

  // Handle Multi-Sensor Observation Platforms (Glider, Buoy, CTD, ADCP, Residuals)
  useEffect(() => {
    if (platformsManagerRef.current) {
      platformsManagerRef.current.setVisibleTypes(visiblePlatformTypes);
      platformsManagerRef.current.setPlatforms(platformItems);
    }
  }, [platformItems, visiblePlatformTypes]);

  // ═══════════════════════════════════════════
  // Scene Mode Switching (3D / 2D)
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
            color: Cesium.Color.fromCssColorString('#3b82f6'),
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

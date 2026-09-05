/**
 * GPU Hardware Acceleration & Fallback Detection Engine for Cesium 3D/4D Globe
 * Detects discrete/integrated GPU capabilities vs software/CPU rasterization (SwiftShader, llvmpipe)
 * and provides optimized WebGL context parameters and rendering settings.
 */

export interface GpuCapabilities {
  isGpuAvailable: boolean;
  gpuVendor: string;
  gpuRenderer: string;
  webglVersion: number;
  tier: 'high' | 'medium' | 'cpu_fallback';
  maxTextureSize: number;
  supportsParallelShaderCompile: boolean;
  supportsFloatTextures: boolean;
}

/**
 * Probes browser WebGL/WebGL2 hardware context to determine GPU availability
 */
export function detectGpuCapabilities(): GpuCapabilities {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Try WebGL2 first with high-performance power preference
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let webglVersion = 2;

    try {
      gl = canvas.getContext('webgl2', {
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      webglVersion = 1;
      try {
        gl = (canvas.getContext('webgl', {
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }) ||
          canvas.getContext('experimental-webgl', {
            powerPreference: 'high-performance',
          })) as WebGLRenderingContext | null;
      } catch {
        gl = null;
      }
    }

    if (!gl) {
      // No WebGL support at all -> CPU fallback
      return {
        isGpuAvailable: false,
        gpuVendor: 'Unknown',
        gpuRenderer: 'Software CPU Fallback',
        webglVersion: 0,
        tier: 'cpu_fallback',
        maxTextureSize: 2048,
        supportsParallelShaderCompile: false,
        supportsFloatTextures: false,
      };
    }

    // Query unmasked renderer info extension
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let vendor = '';
    let renderer = '';

    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    }

    if (!renderer) {
      renderer = gl.getParameter(gl.RENDERER) || '';
    }
    if (!vendor) {
      vendor = gl.getParameter(gl.VENDOR) || '';
    }

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
    const parallelCompileExt = gl.getExtension('KHR_parallel_shader_compile');
    const floatTextureExt =
      gl.getExtension('EXT_color_buffer_float') ||
      gl.getExtension('OES_texture_float');

    // Check if renderer is a software/CPU rasterizer
    const rendererLower = renderer.toLowerCase();
    const isSoftwareRenderer =
      rendererLower.includes('swiftshader') ||
      rendererLower.includes('llvmpipe') ||
      rendererLower.includes('softpipe') ||
      rendererLower.includes('software') ||
      rendererLower.includes('microsoft basic render') ||
      rendererLower.includes('mesa software');

    const isGpuAvailable = !isSoftwareRenderer;

    // Classify GPU tier
    let tier: 'high' | 'medium' | 'cpu_fallback' = 'cpu_fallback';
    if (isGpuAvailable) {
      const isHighEnd =
        rendererLower.includes('nvidia') ||
        rendererLower.includes('geforce') ||
        rendererLower.includes('rtx') ||
        rendererLower.includes('gtx') ||
        rendererLower.includes('radeon') ||
        rendererLower.includes('apple m') ||
        rendererLower.includes('arc') ||
        maxTextureSize >= 8192;

      tier = isHighEnd ? 'high' : 'medium';
    }

    // Clean up WebGL context resources
    const loseContext = gl.getExtension('WEBGL_lose_context');
    if (loseContext) {
      loseContext.loseContext();
    }

    return {
      isGpuAvailable,
      gpuVendor: vendor || 'Generic GPU',
      gpuRenderer: renderer || (isGpuAvailable ? 'Hardware Accelerated GPU' : 'Software Renderer'),
      webglVersion,
      tier,
      maxTextureSize,
      supportsParallelShaderCompile: !!parallelCompileExt,
      supportsFloatTextures: !!floatTextureExt,
    };
  } catch (err) {
    console.warn('GPU capability detection fallback:', err);
    return {
      isGpuAvailable: true, // Default optimistic
      gpuVendor: 'Generic',
      gpuRenderer: 'Standard WebGL',
      webglVersion: 2,
      tier: 'medium',
      maxTextureSize: 4096,
      supportsParallelShaderCompile: false,
      supportsFloatTextures: true,
    };
  }
}

/**
 * Returns tailored Cesium Scene & Globe settings based on GPU capabilities
 */
export function applyGpuOptimizationsToViewer(
  viewer: any,
  gpuInfo: GpuCapabilities
) {
  if (!viewer || viewer.isDestroyed()) return;

  const scene = viewer.scene;
  const globe = scene.globe;

  if (gpuInfo.isGpuAvailable) {
    // ══════════════════════════════════════════════════
    // HARDWARE GPU ACCELERATED RENDERING MODE
    // ══════════════════════════════════════════════════
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1.0, 1.5);
    
    // Crisp high-resolution tile geometry
    globe.maximumScreenSpaceError = gpuInfo.tier === 'high' ? 1.33 : 1.75;
    globe.tileCacheSize = gpuInfo.tier === 'high' ? 250 : 150;
    globe.loadingDescendantLimit = gpuInfo.tier === 'high' ? 24 : 12;
    globe.preloadAncestors = true;
    globe.preloadSiblings = true;

    // Atmospheric & Water Shader Effects
    globe.showWaterEffect = true;
    globe.showGroundAtmosphere = true;
    globe.depthTestAgainstTerrain = true;

    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = true;
    }

    if (scene.postProcessStages && scene.postProcessStages.fxaa) {
      scene.postProcessStages.fxaa.enabled = true;
    }

    if (scene.fog) {
      scene.fog.enabled = true;
      scene.fog.density = 0.0002;
    }

    // High dynamic range on high tier GPU
    if (gpuInfo.tier === 'high') {
      try {
        scene.highDynamicRange = true;
      } catch {
        // Ignore if unsupported
      }
    }
  } else {
    // ══════════════════════════════════════════════════
    // CPU-COMPATIBLE FALLBACK RENDERING MODE
    // ══════════════════════════════════════════════════
    // Reduce pixel load on software rasterizer
    viewer.resolutionScale = 0.85;

    // Coarser tile LOD to reduce CPU geometry transform load by >60%
    globe.maximumScreenSpaceError = 3.5;
    globe.tileCacheSize = 50;
    globe.loadingDescendantLimit = 4;
    globe.preloadAncestors = false;
    globe.preloadSiblings = false;

    // Disable expensive pixel shaders on CPU
    globe.showWaterEffect = false;
    globe.showGroundAtmosphere = false;
    globe.depthTestAgainstTerrain = false;

    if (scene.postProcessStages && scene.postProcessStages.fxaa) {
      scene.postProcessStages.fxaa.enabled = false;
    }

    if (scene.fog) {
      scene.fog.enabled = false;
    }

    try {
      scene.highDynamicRange = false;
    } catch {
      // Ignore
    }
  }
}

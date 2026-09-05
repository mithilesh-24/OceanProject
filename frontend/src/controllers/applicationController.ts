/**
 * Central Application Controller & Navigation Transaction Engine
 * Bridges AI Copilot actions with real React route changes and Cesium 3D camera flights.
 */

import { cesiumController } from './cesiumController';
import { StructuredCesiumAction } from '../services/apiClient';

export interface AppNavigationState {
  currentRoute: string;
  currentView: string;
  cesiumReady: boolean;
}

type NavigateFn = (to: string) => void;
type GetRouteFn = () => string;

class ApplicationController {
  private navigateFn: NavigateFn | null = null;
  private getRouteFn: GetRouteFn | null = null;

  /**
   * Initialize bridge with router methods from App Shell / Copilot
   */
  public init(navigate: NavigateFn, getRoute: GetRouteFn): void {
    this.navigateFn = navigate;
    this.getRouteFn = getRoute;
  }

  public getCurrentRoute(): string {
    return this.getRouteFn ? this.getRouteFn() : window.location.pathname;
  }

  public isCesiumReady(): boolean {
    return cesiumController.isReady();
  }

  public navigateToRoute(route: string): void {
    const current = this.getCurrentRoute();
    if (current !== route && this.navigateFn) {
      this.navigateFn(route);
    }
  }

  public open3D(): void {
    this.navigateToRoute('/explorer');
  }

  public open4D(): void {
    this.navigateToRoute('/4d');
  }

  public openAnalysis(type: string): void {
    switch (type) {
      case 'errors':
        this.navigateToRoute('/errors');
        break;
      case 'accuracy':
        this.navigateToRoute('/accuracy');
        break;
      case 'anomalies':
        this.navigateToRoute('/anomalies');
        break;
      case 'comparison':
        this.navigateToRoute('/comparison');
        break;
      case 'eddies':
        this.navigateToRoute('/eddies');
        break;
      case 'bgc':
        this.navigateToRoute('/bgc');
        break;
      case 'routing':
        this.navigateToRoute('/routing');
        break;
      case 'ml-forecast':
        this.navigateToRoute('/ml-forecast');
        break;
      case 'disaster':
      case 'disaster-surge':
        this.navigateToRoute('/disaster-surge');
        break;
      default:
        this.navigateToRoute('/errors');
        break;
    }
  }

  /**
   * Navigation Transaction:
   * Coordinates cross-page 3D globe transitions, waits for Cesium readiness,
   * then executes camera and visualization operations with real progress tracking.
   */
  public async navigateAndExecute(
    action: StructuredCesiumAction,
    onProgress?: (statusText: string, state: 'RUNNING' | 'SUCCESS' | 'FAILED') => void
  ): Promise<{ success: boolean; error?: string }> {
    const currentRoute = this.getCurrentRoute();
    const type = action.type;
    const payload = action.payload || {};

    try {
      // 1. CESIUM MAP NAVIGATION (GO_TO_REGION, GO_TO_LOCATION)
      if (type === 'GO_TO_REGION' || type === 'GO_TO_LOCATION') {
        const isAlreadyOnGlobe = currentRoute === '/explorer' || currentRoute === '/3d';

        if (!isAlreadyOnGlobe) {
          onProgress?.('Opening 3D Ocean Explorer...', 'RUNNING');
          this.navigateToRoute('/explorer');

          // Wait for Cesium Viewer mount and handshake
          const isReady = await cesiumController.waitForReady(9000);
          if (!isReady) {
            onProgress?.('Failed to initialize 3D Globe.', 'FAILED');
            return { success: false, error: 'Cesium 3D viewer initialization timed out.' };
          }
          onProgress?.('3D Explorer ready', 'RUNNING');
          // Brief render settle
          await new Promise(r => setTimeout(r, 200));
        }

        if (type === 'GO_TO_REGION') {
          const region = (payload.region || 'Arabian Sea').toString();
          onProgress?.(`Navigating to ${region}...`, 'RUNNING');
          const res = await cesiumController.goToRegion(region);
          if (!res.success) {
            onProgress?.(`Navigation failed: ${res.error}`, 'FAILED');
            return { success: false, error: res.error };
          }
          onProgress?.(`Map centered on ${region}`, 'SUCCESS');
          return { success: true };
        } else {
          onProgress?.('Navigating to target coordinates...', 'RUNNING');
          const res = await cesiumController.goToLocation(payload as any);
          if (!res.success) {
            onProgress?.(`Navigation failed: ${res.error}`, 'FAILED');
            return { success: false, error: res.error };
          }
          onProgress?.('Map centered on location', 'SUCCESS');
          return { success: true };
        }
      }

      // 2. LAYER CONTROLS (SHOW_LAYER, HIDE_LAYER)
      if (type === 'SHOW_LAYER' || type === 'HIDE_LAYER') {
        const isAlreadyOnGlobe = currentRoute === '/explorer' || currentRoute === '/3d';
        const layer = payload.layer || 'eddies';

        if (!isAlreadyOnGlobe && payload.target_path) {
          // If specific sub-page exists and action targets it
          this.navigateToRoute(payload.target_path);
          onProgress?.(`Opened ${payload.target_path}`, 'SUCCESS');
          return { success: true };
        }

        if (!isAlreadyOnGlobe) {
          onProgress?.('Opening 3D Ocean Explorer...', 'RUNNING');
          this.navigateToRoute('/explorer');
          await cesiumController.waitForReady(8000);
        }

        if (type === 'SHOW_LAYER') {
          cesiumController.showLayer(layer);
          onProgress?.(`Activated ${layer} layer`, 'SUCCESS');
        } else {
          cesiumController.hideLayer(layer);
          onProgress?.(`Hidden ${layer} layer`, 'SUCCESS');
        }
        return { success: true };
      }

      // 3. APPLICATION ROUTE NAVIGATION (NAVIGATE_ROUTE, OPEN_VIEW, RUN_ANALYSIS)
      if (type === 'NAVIGATE_ROUTE' || type === 'OPEN_VIEW' || type === 'RUN_ANALYSIS' || type === 'OPEN_PANEL') {
        const targetRoute = payload.route || payload.target_path || '/dashboard';
        const viewName = payload.page_name || payload.view || targetRoute;

        onProgress?.(`Opening ${viewName}...`, 'RUNNING');
        this.navigateToRoute(targetRoute);
        onProgress?.(`Opened ${viewName}`, 'SUCCESS');
        return { success: true };
      }

      // Default fallback dispatch
      window.dispatchEvent(new CustomEvent('bluesphere:cesium-action', { detail: action }));
      onProgress?.('Action executed', 'SUCCESS');
      return { success: true };

    } catch (err: any) {
      console.error('ApplicationController action error:', err);
      onProgress?.(`Action failed: ${err?.message || 'Unknown error'}`, 'FAILED');
      return { success: false, error: err?.message };
    }
  }
}

export const applicationController = new ApplicationController();

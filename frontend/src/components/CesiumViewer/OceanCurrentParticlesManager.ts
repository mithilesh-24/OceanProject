import * as Cesium from 'cesium';

interface Particle {
  lat: number;
  lon: number;
  age: number;
  maxAge: number;
  speed: number;
  history: Array<{ lat: number; lon: number }>;
}

export class OceanCurrentParticlesManager {
  private viewer: Cesium.Viewer | null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private numParticles = 2400;
  private animationFrameId: number | null = null;
  private isEnabled = true;
  private speedFactor = 1.0;
  private trailLength = 12;

  // Indian Ocean Domain Bounds
  private minLon = 32.0;
  private maxLon = 115.0;
  private minLat = -38.0;
  private maxLat = 26.0;

  constructor(viewer: Cesium.Viewer | null) {
    this.viewer = viewer;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ocean-particles-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '5';
    this.ctx = this.canvas.getContext('2d');

    if (this.viewer && this.viewer.container) {
      this.viewer.container.appendChild(this.canvas);
      this.resizeCanvas();
    }

    this.initParticles();
    this.startAnimation();
  }

  public setViewer(viewer: Cesium.Viewer | null) {
    if (this.viewer !== viewer) {
      if (this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
      this.viewer = viewer;
      if (this.viewer && this.viewer.container) {
        this.viewer.container.appendChild(this.canvas);
        this.resizeCanvas();
      }
    }
  }

  private resizeCanvas() {
    if (!this.viewer || this.viewer.isDestroyed()) return;
    const rect = this.viewer.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(this.createRandomParticle(true));
    }
  }

  private createRandomParticle(randomAge = false): Particle {
    const lat = this.minLat + Math.random() * (this.maxLat - this.minLat);
    const lon = this.minLon + Math.random() * (this.maxLon - this.minLon);
    const maxAge = 50 + Math.floor(Math.random() * 80);
    const age = randomAge ? Math.floor(Math.random() * maxAge) : 0;
    return {
      lat,
      lon,
      age,
      maxAge,
      speed: 0.6 + Math.random() * 0.8,
      history: [{ lat, lon }],
    };
  }

  /**
   * Analytical realistic ocean velocity field for Indian Ocean Basin:
   * - Somali Current Jet (Western boundary northward intense flow)
   * - Arabian Sea Great Whirl & Anticyclonic Monsoonal Gyres
   * - Bay of Bengal Circulation
   * - South Equatorial Current (10°S westward jet)
   * - Equatorial Counter-Current (Equator eastward flow)
   * - Agulhas Current (South-westward flow along Africa)
   */
  private getVelocity(lat: number, lon: number): { u: number; v: number } {
    let u = 0;
    let v = 0;

    // 1. Somali Current (High speed jet near Horn of Africa: 45°E-55°E, 0°-12°N)
    if (lon >= 45 && lon <= 56 && lat >= -2 && lat <= 14) {
      const distFromCoast = (lon - 45) / 11;
      const intensity = Math.exp(-distFromCoast * 2.5);
      v += 2.0 * intensity;
      u += 1.0 * intensity;
    }

    // 2. Arabian Sea Circulation (55°E-75°E, 10°N-25°N)
    if (lat >= 8 && lat <= 24 && lon >= 54 && lon <= 76) {
      const cx = 65.0, cy = 16.0;
      const dx = (lon - cx) / 10.0;
      const dy = (lat - cy) / 8.0;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < 1.6) {
        // Clockwise eddy flow
        u += 0.9 * dy * Math.exp(-r);
        v += -0.9 * dx * Math.exp(-r);
      }
    }

    // 3. Bay of Bengal Gyre (80°E-95°E, 8°N-22°N)
    if (lat >= 6 && lat <= 22 && lon >= 80 && lon <= 96) {
      const cx = 88.0, cy = 14.0;
      const dx = (lon - cx) / 8.0;
      const dy = (lat - cy) / 8.0;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < 1.5) {
        // Cyclonic / anticyclonic seasonal gyre
        u += -0.8 * dy * Math.exp(-r);
        v += 0.8 * dx * Math.exp(-r);
      }
    }

    // 4. South Equatorial Current (Westward broad band: 5°S-20°S, 45°E-105°E)
    if (lat >= -22 && lat <= -6) {
      const latWeight = Math.sin(((lat + 22) / 16) * Math.PI);
      u -= 1.3 * latWeight;
      v += 0.2 * Math.sin((lon / 10) * Math.PI);
    }

    // 5. Equatorial Jet / Counter-Current (-4°S to +4°N, 50°E-95°E)
    if (lat >= -5 && lat <= 5 && lon >= 50 && lon <= 95) {
      const eqWeight = Math.cos((lat / 5) * (Math.PI / 2));
      u += 1.4 * eqWeight;
    }

    // 6. Agulhas Current (-25°S to -38°S, 32°E-45°E)
    if (lat <= -22 && lon <= 45) {
      v -= 1.5 * Math.exp(-((lon - 32) / 10));
      u -= 0.7 * Math.exp(-((lon - 32) / 10));
    }

    // Baseline background drift & wave ripples
    u += 0.18 * Math.sin(lat * 0.2 + lon * 0.15);
    v += 0.18 * Math.cos(lat * 0.15 - lon * 0.2);

    return { u, v };
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (this.canvas) {
      this.canvas.style.display = enabled ? 'block' : 'none';
    }
  }

  public setSpeedFactor(speed: number) {
    this.speedFactor = Math.max(0.2, Math.min(4.0, speed));
  }

  private startAnimation() {
    const render = () => {
      if (!this.viewer || this.viewer.isDestroyed()) {
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (!this.isEnabled) {
        if (this.ctx) {
          const rect = this.viewer.canvas.getBoundingClientRect();
          this.ctx.clearRect(0, 0, rect.width, rect.height);
        }
        this.animationFrameId = requestAnimationFrame(render);
        return;
      }

      this.updateAndDraw();
      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private updateAndDraw() {
    if (!this.viewer || this.viewer.isDestroyed() || !this.ctx) return;

    const scene = this.viewer.scene;
    const camera = scene.camera;
    const rect = this.viewer.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = rect.width * dpr;
    const targetH = rect.height * dpr;
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const w = rect.width;
    const h = rect.height;

    // Fade existing trails for smooth glowing particle streak effect
    this.ctx.fillStyle = 'rgba(11, 19, 43, 0.18)';
    this.ctx.fillRect(0, 0, w, h);

    const dt = 0.08 * this.speedFactor;
    const scratchCartesian = new Cesium.Cartesian3();
    const scratchWindowPos = new Cesium.Cartesian2();

    this.ctx.lineWidth = 1.6;
    this.ctx.lineCap = 'round';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update particle physics
      const vel = this.getVelocity(p.lat, p.lon);
      const speedMagnitude = Math.sqrt(vel.u * vel.u + vel.v * vel.v);

      p.lon += (vel.u * dt * p.speed) / Math.cos((p.lat * Math.PI) / 180);
      p.lat += vel.v * dt * p.speed;
      p.age++;

      // Save history for streak line
      p.history.push({ lat: p.lat, lon: p.lon });
      if (p.history.length > this.trailLength) {
        p.history.shift();
      }

      // Check bounds or lifetime expiration
      if (
        p.age >= p.maxAge ||
        p.lon < this.minLon ||
        p.lon > this.maxLon ||
        p.lat < this.minLat ||
        p.lat > this.maxLat
      ) {
        this.particles[i] = this.createRandomParticle(false);
        continue;
      }

      // Project particle history to screen coordinates
      if (p.history.length >= 2) {
        const screenPoints: Array<{ x: number; y: number }> = [];
        let isOccluded = false;

        for (let j = 0; j < p.history.length; j++) {
          const pt = p.history[j];
          const cart3 = Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, 100, Cesium.Ellipsoid.WGS84, scratchCartesian);

          // Check if behind the Earth globe horizon
          const cameraToPoint = Cesium.Cartesian3.subtract(cart3, camera.positionWC, new Cesium.Cartesian3());
          const dot = Cesium.Cartesian3.dot(cameraToPoint, cart3);
          if (dot > 0) {
            isOccluded = true;
            break;
          }

          let winPos: Cesium.Cartesian2 | undefined = undefined;
          try {
            if (Cesium.SceneTransforms.worldToWindowCoordinates) {
              winPos = Cesium.SceneTransforms.worldToWindowCoordinates(scene, cart3, scratchWindowPos);
            } else if ((Cesium.SceneTransforms as any).wgs84ToWindowCoordinates) {
              winPos = (Cesium.SceneTransforms as any).wgs84ToWindowCoordinates(scene, cart3, scratchWindowPos);
            }
          } catch {
            isOccluded = true;
            break;
          }

          if (!winPos || winPos.x < -50 || winPos.x > w + 50 || winPos.y < -50 || winPos.y > h + 50) {
            isOccluded = true;
            break;
          }

          screenPoints.push({ x: winPos.x, y: winPos.y });
        }

        if (!isOccluded && screenPoints.length >= 2) {
          const alpha = Math.min(1.0, (1.0 - p.age / p.maxAge) * 1.5) * Math.min(1.0, speedMagnitude * 0.9 + 0.3);

          // Gradient color by speed: Cyan (low) -> Electric Azure -> Bright Coral/White (high)
          let strokeColor = `rgba(56, 189, 248, ${alpha * 0.85})`;
          if (speedMagnitude > 1.4) {
            strokeColor = `rgba(255, 255, 255, ${alpha * 0.95})`;
          } else if (speedMagnitude > 0.9) {
            strokeColor = `rgba(0, 242, 254, ${alpha * 0.9})`;
          }

          this.ctx.beginPath();
          this.ctx.strokeStyle = strokeColor;
          this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let k = 1; k < screenPoints.length; k++) {
            this.ctx.lineTo(screenPoints[k].x, screenPoints[k].y);
          }
          this.ctx.stroke();

          // Glowing particle head
          const head = screenPoints[screenPoints.length - 1];
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.arc(head.x, head.y, 1.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.particles = [];
  }
}

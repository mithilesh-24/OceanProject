import React from 'react';
import { Compass, Plus, Minus, RotateCcw } from 'lucide-react';
import { SceneModeType } from '../../types';

interface NavigationControlsProps {
  heading: number;
  pitch: number;
  sceneMode: SceneModeType;
  onResetNorth: () => void;
  onToggleSceneMode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetTilt: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  heading,
  pitch,
  sceneMode,
  onResetNorth,
  onToggleSceneMode,
  onZoomIn,
  onZoomOut,
  onResetTilt,
}) => {
  return (
    <div className="nav-controls">
      {/* Compass Widget */}
      <div className="compass-widget glass-panel" title="Click to align North" onClick={onResetNorth}>
        <div
          className="compass-pointer"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <Compass style={{ width: 28, height: 28, color: '#60a5fa' }} />
        </div>
      </div>

      {/* Control Buttons Group */}
      <div className="nav-button-group">
        {/* 3D/2D Toggle: Show what it will SWITCH TO */}
        <button
          className="nav-btn"
          title={sceneMode === '3D' ? 'Switch to 2D Map' : 'Switch to 3D Globe'}
          onClick={onToggleSceneMode}
        >
          <span className="nav-btn-label">{sceneMode === '3D' ? '3D' : '2D'}</span>
        </button>

        {/* Reset Tilt */}
        <button
          className="nav-btn"
          title="Reset Tilt (Top-down View)"
          onClick={onResetTilt}
        >
          <RotateCcw style={{ width: 18, height: 18 }} />
        </button>

        {/* Zoom In */}
        <button
          className="nav-btn"
          title="Zoom In"
          onClick={onZoomIn}
        >
          <Plus style={{ width: 18, height: 18 }} />
        </button>

        {/* Zoom Out */}
        <button
          className="nav-btn"
          title="Zoom Out"
          onClick={onZoomOut}
        >
          <Minus style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Ruler, Triangle, X, RotateCcw } from 'lucide-react';
import { MeasureModeType } from '../../types';

interface MeasurePanelProps {
  measureMode: MeasureModeType;
  setMeasureMode: (mode: MeasureModeType) => void;
  measurementResult: string;
  onClear: () => void;
  onClose: () => void;
}

export const MeasurePanel: React.FC<MeasurePanelProps> = ({
  measureMode,
  setMeasureMode,
  measurementResult,
  onClear,
  onClose,
}) => {
  return (
    <div className="side-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Ruler className="w-5 h-5 text-blue-400" />
          <span>Geographic Measurement</span>
        </div>
        <button className="glass-button p-1" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-300 mb-3">
        Click points on the 3D Earth surface to measure geodesic distance or polygon area.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          className={`glass-button flex-1 py-2 text-xs font-semibold gap-2 ${measureMode === 'distance' ? 'active' : ''}`}
          onClick={() => setMeasureMode('distance')}
        >
          <Ruler className="w-4 h-4" />
          Distance
        </button>

        <button
          className={`glass-button flex-1 py-2 text-xs font-semibold gap-2 ${measureMode === 'area' ? 'active' : ''}`}
          onClick={() => setMeasureMode('area')}
        >
          <Triangle className="w-4 h-4" />
          Area
        </button>
      </div>

      {measurementResult && (
        <div className="p-3 mb-3 bg-blue-950/40 border border-blue-500/30 rounded-lg text-center">
          <span className="text-xs text-blue-300 block mb-1">
            {measureMode === 'distance' ? 'Measured Distance' : 'Measured Area'}
          </span>
          <span className="text-lg font-mono font-bold text-white">{measurementResult}</span>
        </div>
      )}

      <button
        className="glass-button w-full py-2 text-xs font-semibold gap-2"
        onClick={() => {
          onClear();
          setMeasureMode('none');
        }}
      >
        <RotateCcw className="w-4 h-4" />
        Clear Measurement
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { Bookmark, X, Plus, Navigation, Trash2 } from 'lucide-react';
import { Placemark } from '../../types';

interface PlacemarkPanelProps {
  placemarks: Placemark[];
  onAddPlacemark: (name: string, desc: string) => void;
  onFlyToPlacemark: (p: Placemark) => void;
  onDeletePlacemark: (id: string) => void;
  onClose: () => void;
}

export const PlacemarkPanel: React.FC<PlacemarkPanelProps> = ({
  placemarks,
  onAddPlacemark,
  onFlyToPlacemark,
  onDeletePlacemark,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlacemark(name.trim(), desc.trim());
    setName('');
    setDesc('');
  };

  return (
    <div className="side-panel glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Bookmark className="w-5 h-5 text-blue-400" />
          <span>Saved Placemarks & Bookmarks</span>
        </div>
        <button className="glass-button p-1" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Add Pin Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          className="search-input text-xs h-8"
          placeholder="Placemark Title (e.g. Chennai Port)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="search-input text-xs h-8"
          placeholder="Description or notes..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button
          type="submit"
          className="glass-button w-full py-1.5 text-xs font-semibold gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Bookmark Current Center Position
        </button>
      </form>

      {/* List of Placemarks */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {placemarks.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            No saved placemarks yet.
          </div>
        ) : (
          placemarks.map((p) => (
            <div
              key={p.id}
              className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-lg flex items-center justify-between group"
            >
              <div className="overflow-hidden">
                <div className="font-semibold text-xs text-blue-300 truncate">{p.name}</div>
                {p.description && <div className="text-[11px] text-gray-400 truncate">{p.description}</div>}
                <div className="font-mono text-[10px] text-gray-400">
                  {p.latitude.toFixed(4)}°, {p.longitude.toFixed(4)}°
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className="glass-button p-1 text-blue-400"
                  title="Fly camera to location"
                  onClick={() => onFlyToPlacemark(p)}
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
                <button
                  className="glass-button p-1 text-red-400"
                  title="Delete bookmark"
                  onClick={() => onDeletePlacemark(p.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

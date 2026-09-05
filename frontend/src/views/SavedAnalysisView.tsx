import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Play, Trash2, Calendar, Copy, Plus, Search, Star, ExternalLink, Globe, Filter, Layers, RefreshCw } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { api } from '../services/apiClient';

export const SavedAnalysisView: React.FC = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('comparison');

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await api.getWorkspaces({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchQuery || undefined
      });
      if (res && res.workspaces) {
        setWorkspaces(res.workspaces);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [categoryFilter, searchQuery]);

  const handleClone = async (id: string) => {
    try {
      await api.cloneWorkspace(id);
      fetchWorkspaces();
    } catch (err) {
      console.error('Clone failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteWorkspace(id);
      fetchWorkspaces();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createWorkspace({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        tags: [newCategory.toUpperCase(), "Indian Ocean"],
        state: {
          selected_model: "hycom",
          comparison_model: "roms",
          selected_variable: "temperature",
          depth_level: 0.0,
          region: "indian_ocean"
        }
      });
      setNewTitle('');
      setNewDesc('');
      setShowCreateModal(false);
      fetchWorkspaces();
    } catch (err) {
      console.error('Creation failed:', err);
    }
  };

  return (
    <div className="page-scroll-container space-y-5">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[var(--primary)]" />
              Saved Analyses &amp; Comparison Workspaces
            </h1>
            <Badge variant="primary">Phase 16</Badge>
          </div>
          <p className="page-subtitle">
            Persisted model validation sessions, cross-comparison queries, bounding boxes, and research presets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWorkspaces}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Save New Workspace
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Search className="w-4 h-4 text-muted" />
          <div style={{ width: '280px' }}>
            <Input
              size="sm"
              placeholder="Search workspaces, models, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Workspaces' },
            { key: 'comparison', label: 'Model Comparison' },
            { key: 'accuracy', label: 'Accuracy & Taylor' },
            { key: 'anomaly', label: 'Marine Heatwaves' },
            { key: 'statistical', label: 'Statistics' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: categoryFilter === cat.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: categoryFilter === cat.key ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: categoryFilter === cat.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspaces List */}
      <div className="space-y-4">
        {workspaces.map((ws) => (
          <div key={ws.id} className="ui-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ws.title}
                </h3>
                <Badge variant={ws.category === 'anomaly' ? 'danger' : ws.category === 'accuracy' ? 'success' : 'primary'}>
                  {ws.category.toUpperCase()}
                </Badge>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Star className="w-3 h-3 text-amber fill-amber" />
                  <span>{ws.star_count}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Author: <strong style={{ color: 'var(--text-secondary)' }}>{ws.author}</strong></span>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(ws.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {ws.description}
            </p>

            {/* Filter Configuration Grid */}
            <div className="grid-cols-4" style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Models</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {ws.state?.selected_model?.toUpperCase() || 'HYCOM'} vs {ws.state?.comparison_model?.toUpperCase() || 'ROMS'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Variable &amp; Depth</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {ws.state?.selected_variable || 'Temperature'} @ {ws.state?.depth_level ?? 0}m
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Geographic Region</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ws.state?.region?.replace('_', ' ').toUpperCase() || 'INDIAN OCEAN'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Session ID</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  #{ws.id}
                </span>
              </div>
            </div>

            {/* Actions & Tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {(ws.tags || []).map((t: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '10.5px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  onClick={() => handleClone(ws.id)}
                >
                  Clone Preset
                </Button>
                <Link to={`/explorer?region=${ws.state?.region || 'indian_ocean'}`}>
                  <Button variant="outline" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />}>
                    3D Globe
                  </Button>
                </Link>
                <Link to={`/comparison?modelA=${ws.state?.selected_model || 'hycom'}&modelB=${ws.state?.comparison_model || 'roms'}`}>
                  <Button variant="primary" size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
                    Resume Session
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(ws.id)}
                  aria-label="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="ui-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ui-modal-header">
              <h3 className="ui-modal-title">Save New Analysis Workspace</h3>
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="ui-modal-body space-y-3">
                <div className="ui-form-group">
                  <label className="ui-label">Workspace Title</label>
                  <Input
                    placeholder="e.g. Somali Current Coastal Upwelling Validation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="ui-form-group">
                  <label className="ui-label">Category</label>
                  <Select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    options={[
                      { value: 'comparison', label: 'Model vs Observation Comparison' },
                      { value: 'accuracy', label: 'Accuracy & Taylor Decomposition' },
                      { value: 'anomaly', label: 'Marine Heatwave & Anomaly' },
                      { value: 'statistical', label: 'Comprehensive Statistical Baseline' },
                      { value: 'custom', label: 'Custom Hydrographic Research' }
                    ]}
                  />
                </div>
                <div className="ui-form-group">
                  <label className="ui-label">Description / Research Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Document active boundary conditions, assimilated Argo cycles, or key findings..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
              <div className="ui-modal-footer">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

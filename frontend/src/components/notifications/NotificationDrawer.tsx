import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Flame, Droplets, ShieldAlert, Check, Globe, RefreshCw, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { api } from '../../services/apiClient';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCountChange?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onAlertCountChange
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getActiveAlerts({
        severity: severityFilter !== 'all' ? severityFilter : undefined,
        status: 'ACTIVE'
      });
      if (res && res.alerts) {
        setAlerts(res.alerts);
        if (onAlertCountChange) {
          onAlertCountChange(res.critical_count + res.warning_count);
        }
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 30000); // 30s auto-refresh
    return () => clearInterval(timer);
  }, [severityFilter]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Ack error:', err);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await api.dismissAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Dismiss error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="ui-drawer-backdrop" onClick={onClose} />
      <div className="ui-drawer-right" style={{ width: '440px', maxWidth: '95vw', padding: '0', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell className="w-4 h-4 text-amber" />
            <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Real-Time Alert &amp; Warning Center
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={fetchAlerts}
              title="Refresh Alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={onClose}
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px', backgroundColor: 'var(--bg-surface)' }}>
          {[
            { key: 'all', label: 'All Alerts' },
            { key: 'CRITICAL', label: 'Critical' },
            { key: 'WARNING', label: 'Warnings' },
            { key: 'INFO', label: 'Telemetry' }
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSeverityFilter(s.key)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: severityFilter === s.key ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: severityFilter === s.key ? 'var(--primary-subtle)' : 'transparent',
                color: severityFilter === s.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Alert Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald" />
              All physical parameters within normal climatological bounds. Zero active alerts.
            </div>
          ) : (
            alerts.map((al) => (
              <div
                key={al.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface)',
                  border: `1px solid ${al.severity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.4)' : al.severity === 'WARNING' ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={al.severity === 'CRITICAL' ? 'badge-rose' : al.severity === 'WARNING' ? 'badge-amber' : 'badge-cyan'}>
                      {al.severity}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{al.basin}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: al.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b' }}>
                    {al.trigger_value}
                  </span>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {al.title}
                </h4>

                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {al.description}
                </p>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-secondary)' }}>
                  <strong>Impact:</strong> {al.impact}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(al.actions || []).map((act: any, idx: number) => (
                      <Link key={idx} to={act.path} onClick={onClose} style={{ textDecoration: 'none' }}>
                        <Button variant="outline" size="sm" leftIcon={<Globe className="w-3 h-3" />}>
                          {act.label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleAcknowledge(al.id)}>
                      Ack
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDismiss(al.id)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Evaluated via Phase 21 Alert Engine</span>
          <Link to="/anomalies" onClick={onClose} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Open Anomaly Center →
          </Link>
        </div>
      </div>
    </>
  );
};

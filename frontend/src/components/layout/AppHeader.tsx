import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Globe, Sparkles, Activity, Server, AlertTriangle } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import { RoleSwitcher } from './RoleSwitcher';
import { UserProfilePopover } from './UserProfilePopover';
import { ThemeSwitcher } from '../UI/ThemeSwitcher';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Tooltip } from '../UI/Tooltip';
import { api, HealthStatus } from '../../services/apiClient';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onOpenDesignSystem?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, onOpenDesignSystem }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);

  const checkHealth = () => {
    api.getHealth()
      .then((data) => {
        setHealth(data);
        setIsHealthy(true);
      })
      .catch(() => {
        setIsHealthy(false);
      });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      {/* Left: Hamburger & Brand Logo */}
      <div className="app-header-left">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <Link to="/dashboard" className="brand-logo-btn">
          <img
            src="/icon.png"
            alt="Bluesphere Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'contain',
              boxShadow: 'var(--shadow-xs)',
              flexShrink: 0,
            }}
          />
          <div className="brand-text-wrap">
            <div className="brand-heading-row">
              <span className="brand-title-text" style={{ letterSpacing: '0.04em' }}>Bluesphere</span>
              <Badge variant="primary" style={{ fontSize: '9px', padding: '1px 5px' }}>3D GIS</Badge>
            </div>
            <span className="brand-subtitle-text">Ocean Data & Earth Intelligence</span>
          </div>
        </Link>
      </div>

      {/* Center: Global Search Bar */}
      <div className="app-header-search">
        <GlobalSearchBar />
      </div>

      {/* Right: Actions */}
      <div className="app-header-right">
        {/* Real Live Backend Health Indicator */}
        <Tooltip content={isHealthy ? `FastAPI connected (${health?.database || 'Database'} ready)` : "Backend server offline! Run 'python backend/run_server.py' on port 8000"}>
          <div
            onClick={checkHealth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.4)'}`,
              fontSize: '11px',
              cursor: 'pointer',
              color: isHealthy ? 'var(--success)' : 'var(--error)',
              fontWeight: 600
            }}
          >
            {isHealthy ? <Server className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{isHealthy ? 'FastAPI :8000' : 'Backend Offline'}</span>
          </div>
        </Tooltip>

        {onOpenDesignSystem && (
          <Tooltip content="Inspect Phase 1 UI Design System Catalog">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDesignSystem}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
            >
              UI Tokens
            </Button>
          </Tooltip>
        )}

        <RoleSwitcher />

        <ThemeSwitcher size="sm" />

        <UserProfilePopover />
      </div>
    </header>
  );
};

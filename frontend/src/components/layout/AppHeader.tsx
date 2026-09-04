import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Globe, Sparkles } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import { RoleSwitcher } from './RoleSwitcher';
import { UserProfilePopover } from './UserProfilePopover';
import { ThemeSwitcher } from '../UI/ThemeSwitcher';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';
import { Tooltip } from '../UI/Tooltip';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onOpenDesignSystem?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, onOpenDesignSystem }) => {
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

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, LogOut } from 'lucide-react';
import { NAVIGATION_CONFIG, NavItem } from '../../config/navigation';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';
import { Tooltip } from '../UI/Tooltip';
import { Badge } from '../UI/Badge';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentRole, setRole } = useRole();
  const { toast } = useToast();
  const location = useLocation();

  const handleLogout = () => {
    setRole('public');
    toast.info('Session Ended', 'Logged out. Active workspace set to Public Guest Scientist.');
  };

  // Filter sections and items based on active role
  const visibleSections = NAVIGATION_CONFIG.filter((sec) => {
    if (sec.roles && !sec.roles.includes(currentRole)) return false;
    return true;
  }).map((sec) => ({
    ...sec,
    items: sec.items.filter((item) => {
      if (item.roles && !item.roles.includes(currentRole)) return false;
      return true;
    }),
  })).filter((sec) => sec.items.length > 0);

  const renderNavItem = (item: NavItem) => {
    const IconComponent = item.icon;
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

    const content = (
      <NavLink
        to={item.path}
        onClick={() => {
          if (isMobileOpen) onCloseMobile();
        }}
        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <IconComponent className="w-4 h-4 shrink-0" />
        {!isCollapsed && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
            {item.badge && (
              <Badge variant={isActive ? 'neutral' : 'primary'} style={{ fontSize: '9px', padding: '1px 4px' }}>
                {item.badge}
              </Badge>
            )}
          </div>
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} content={`${item.title}${item.badge ? ` (${item.badge})` : ''}`}>
          <div style={{ width: '100%' }}>{content}</div>
        </Tooltip>
      );
    }

    return <div key={item.id}>{content}</div>;
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="ui-drawer-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Nav Sections */}
        <div className="app-sidebar-nav">
          {visibleSections.map((section) => (
            <div key={section.id} className="sidebar-section">
              {!isCollapsed && (
                <span className="sidebar-section-title">
                  {section.title}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => renderNavItem(item))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Collapse Toggle & Role / Logout */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontWeight: 600 }}>
                {currentRole}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon-only"
                style={{ color: 'var(--text-muted)' }}
                title="Sign Out / Reset to Public"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ui-btn ui-btn-ghost ui-btn-sm ui-btn-icon-only"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

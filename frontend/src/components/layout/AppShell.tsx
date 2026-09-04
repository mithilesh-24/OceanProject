import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { DesignSystemShowcase } from '../UI/DesignSystemShowcase';

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  return (
    <div className="app-shell">
      {/* Top Application Header */}
      <AppHeader
        onToggleSidebar={() => {
          if (window.innerWidth < 768) {
            setIsMobileSidebarOpen((prev) => !prev);
          } else {
            setIsSidebarCollapsed((prev) => !prev);
          }
        }}
        onOpenDesignSystem={() => setShowDesignSystem(true)}
      />

      {/* Main Layout (Sidebar + Content Outlet) */}
      <div className="app-main-layout">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="app-content-container">
          <Outlet />
        </div>
      </div>

      {/* Interactive Phase 1 Design System Catalog */}
      <DesignSystemShowcase
        isOpen={showDesignSystem}
        onClose={() => setShowDesignSystem(false)}
      />
    </div>
  );
};

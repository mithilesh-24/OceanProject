import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { DesignSystemShowcase } from '../UI/DesignSystemShowcase';
import { RightSideCopilotPanel } from '../copilot/RightSideCopilotPanel';

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(() => {
    return sessionStorage.getItem('bluesphere_copilot_open') === 'true';
  });

  const toggleCopilot = () => {
    setIsCopilotOpen((prev) => {
      const nextState = !prev;
      sessionStorage.setItem('bluesphere_copilot_open', String(nextState));
      return nextState;
    });
  };

  const closeCopilot = () => {
    setIsCopilotOpen(false);
    sessionStorage.setItem('bluesphere_copilot_open', 'false');
  };

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
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={toggleCopilot}
      />

      {/* Main Layout (Sidebar + Content Outlet + Right-Side AI Drawer) */}
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

        {/* Right-Side AI Copilot Drawer (Anchored within app-main-layout) */}
        <RightSideCopilotPanel
          isOpen={isCopilotOpen}
          onClose={closeCopilot}
        />
      </div>

      {/* Interactive Phase 1 Design System Catalog */}
      <DesignSystemShowcase
        isOpen={showDesignSystem}
        onClose={() => setShowDesignSystem(false)}
      />
    </div>
  );
};

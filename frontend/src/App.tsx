import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Route Views
import { DashboardView } from './views/DashboardView';
import { OceanExplorerView } from './views/OceanExplorerView';
import { DatasetsView } from './views/DatasetsView';
import { ObservationsView } from './views/ObservationsView';
import { ArgoView } from './views/ArgoView';
import { GlidersView } from './views/GlidersView';
import { BuoysView } from './views/BuoysView';
import { CtdView } from './views/CtdView';
import { AdcpView } from './views/AdcpView';
import { ModelsView } from './views/ModelsView';
import { HycomView } from './views/HycomView';
import { RomsView } from './views/RomsView';
import { NemoView } from './views/NemoView';
import { ComparisonView } from './views/ComparisonView';
import { AccuracyView } from './views/AccuracyView';
import { ErrorsView } from './views/ErrorsView';
import { AnomaliesView } from './views/AnomaliesView';
import { StatisticsView } from './views/StatisticsView';
import { ThreeDView } from './views/ThreeDView';
import { FourDView } from './views/FourDView';
import { StudentWorkspaceView } from './views/StudentWorkspaceView';
import { ResearcherWorkspaceView } from './views/ResearcherWorkspaceView';
import { AdminWorkspaceView } from './views/AdminWorkspaceView';
import { SavedAnalysisView } from './views/SavedAnalysisView';
import { ExportView } from './views/ExportView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Core Routes */}
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/explorer" element={<OceanExplorerView />} />
          <Route path="/datasets" element={<DatasetsView />} />

          {/* Observations */}
          <Route path="/observations" element={<ObservationsView />} />
          <Route path="/argo" element={<ArgoView />} />
          <Route path="/gliders" element={<GlidersView />} />
          <Route path="/buoys" element={<BuoysView />} />
          <Route path="/ctd" element={<CtdView />} />
          <Route path="/adcp" element={<AdcpView />} />

          {/* Models */}
          <Route path="/models" element={<ModelsView />} />
          <Route path="/models/hycom" element={<HycomView />} />
          <Route path="/models/roms" element={<RomsView />} />
          <Route path="/models/nemo" element={<NemoView />} />

          {/* Scientific Analysis */}
          <Route path="/comparison" element={<ComparisonView />} />
          <Route path="/accuracy" element={<AccuracyView />} />
          <Route path="/errors" element={<ErrorsView />} />
          <Route path="/anomalies" element={<AnomaliesView />} />
          <Route path="/analysis" element={<StatisticsView />} />

          {/* 3D & 4D */}
          <Route path="/3d" element={<ThreeDView />} />
          <Route path="/4d" element={<FourDView />} />

          {/* Workspaces */}
          <Route path="/student" element={<StudentWorkspaceView />} />
          <Route path="/researcher" element={<ResearcherWorkspaceView />} />
          <Route path="/admin" element={<AdminWorkspaceView />} />

          {/* Utilities */}
          <Route path="/saved" element={<SavedAnalysisView />} />
          <Route path="/export" element={<ExportView />} />
          <Route path="/settings" element={<SettingsView />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

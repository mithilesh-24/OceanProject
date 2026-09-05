import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.schemas.workspace import SavedWorkspaceItem, SavedWorkspaceCreate, AnalysisFilterState

class WorkspaceService:
    """
    Phase 16: Saved Analysis & Workspace Management Service
    Provides storage, retrieval, preset templates, and cloning for scientific sessions.
    """
    def __init__(self):
        # In-memory store seeded with curated oceanographic research workspaces
        self._workspaces: Dict[str, SavedWorkspaceItem] = {}
        self._seed_default_presets()

    def _seed_default_presets(self):
        now = datetime.now(timezone.utc)
        presets = [
            SavedWorkspaceItem(
                id="ws-mhw-arabian-2024",
                title="Arabian Sea Marine Heatwave Evolution (Cat III)",
                description="Analysis of extreme sea surface temperature anomalies (+2.85°C) across Central & Western Arabian Sea using HYCOM vs In-Situ Argo validation.",
                category="anomaly",
                tags=["Marine Heatwave", "Arabian Sea", "Hobday Cat III", "Argo", "HYCOM"],
                state=AnalysisFilterState(
                    selected_model="hycom",
                    comparison_model="roms",
                    selected_variable="temperature",
                    depth_level=0.0,
                    region="arabian_sea",
                    lat_bounds=[10.0, 22.0],
                    lon_bounds=[55.0, 72.0],
                    active_chart_types=["anomaly_timeseries", "spatial_heatmap"]
                ),
                author="Dr. S. K. Roy (INCOIS)",
                is_public=True,
                created_at=now,
                updated_at=now,
                view_count=142,
                star_count=38
            ),
            SavedWorkspaceItem(
                id="ws-bob-salinity-barrier",
                title="Northern Bay of Bengal Barrier Layer & Freshwater Plume",
                description="River runoff stratification investigation tracking the low-salinity freshwater lens (<32.5 PSU) and subsurface thermal inversion layer.",
                category="comparison",
                tags=["Salinity", "Bay of Bengal", "Barrier Layer", "Inversion", "CTD"],
                state=AnalysisFilterState(
                    selected_model="roms",
                    comparison_model="hycom",
                    selected_variable="salinity",
                    depth_level=20.0,
                    region="bay_of_bengal",
                    lat_bounds=[12.0, 22.0],
                    lon_bounds=[80.0, 95.0],
                    active_chart_types=["depth_skill", "correlation_matrix"]
                ),
                author="Ocean Dynamics Group",
                is_public=True,
                created_at=now,
                updated_at=now,
                view_count=96,
                star_count=24
            ),
            SavedWorkspaceItem(
                id="ws-hycom-roms-intercomparison",
                title="HYCOM vs ROMS Thermocline Skill Benchmark",
                description="Multi-model Taylor diagram decomposition and root-mean-square deviation comparison across equatorial thermocline depths (50-200m).",
                category="accuracy",
                tags=["Model Comparison", "Taylor Diagram", "Thermocline", "Equatorial IO"],
                state=AnalysisFilterState(
                    selected_model="hycom",
                    comparison_model="roms",
                    selected_variable="temperature",
                    depth_level=100.0,
                    region="equatorial_io",
                    lat_bounds=[-5.0, 5.0],
                    lon_bounds=[60.0, 90.0],
                    active_chart_types=["taylor_diagram", "depth_heatmap"]
                ),
                author="Numerical Modeling Division",
                is_public=True,
                created_at=now,
                updated_at=now,
                view_count=180,
                star_count=52
            ),
            SavedWorkspaceItem(
                id="ws-deep-ocean-statistics",
                title="Indian Ocean Basin-Wide Parametric & Quantile Baseline",
                description="Comprehensive non-parametric quantiles (P10-P90) and Gaussian distribution fits for 2,600+ deep-profiling floats (0-2000m).",
                category="statistical",
                tags=["Statistics", "Percentiles", "Decadal Trend", "Gaussian Fit"],
                state=AnalysisFilterState(
                    selected_model="hycom",
                    comparison_model="nemo",
                    selected_variable="temperature",
                    depth_level=0.0,
                    region="indian_ocean",
                    lat_bounds=[-40.0, 30.0],
                    lon_bounds=[30.0, 120.0],
                    active_chart_types=["distribution_chart", "correlation_matrix"]
                ),
                author="Data Assimilation Core",
                is_public=True,
                created_at=now,
                updated_at=now,
                view_count=215,
                star_count=67
            )
        ]
        for p in presets:
            self._workspaces[p.id] = p

    def get_all_workspaces(self, category: Optional[str] = None, search: Optional[str] = None) -> List[SavedWorkspaceItem]:
        items = list(self._workspaces.values())
        if category and category != "all":
            items = [w for w in items if w.category == category]
        if search:
            q = search.lower()
            items = [
                w for w in items
                if q in w.title.lower() or q in w.description.lower() or any(q in t.lower() for t in w.tags)
            ]
        # Sort by updated_at desc
        return sorted(items, key=lambda x: x.updated_at, reverse=True)

    def get_workspace_by_id(self, ws_id: str) -> Optional[SavedWorkspaceItem]:
        ws = self._workspaces.get(ws_id)
        if ws:
            ws.view_count += 1
        return ws

    def create_workspace(self, payload: SavedWorkspaceCreate) -> SavedWorkspaceItem:
        ws_id = f"ws-{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc)
        item = SavedWorkspaceItem(
            id=ws_id,
            title=payload.title,
            description=payload.description or "",
            category=payload.category,
            tags=payload.tags,
            state=payload.state,
            author=payload.author or "Oceanographer",
            is_public=payload.is_public if payload.is_public is not None else True,
            created_at=now,
            updated_at=now,
            view_count=1,
            star_count=0
        )
        self._workspaces[ws_id] = item
        return item

    def delete_workspace(self, ws_id: str) -> bool:
        if ws_id in self._workspaces:
            del self._workspaces[ws_id]
            return True
        return False

    def clone_workspace(self, ws_id: str) -> Optional[SavedWorkspaceItem]:
        src = self._workspaces.get(ws_id)
        if not src:
            return None
        clone_id = f"ws-copy-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc)
        cloned = SavedWorkspaceItem(
            id=clone_id,
            title=f"Copy of {src.title}",
            description=src.description,
            category=src.category,
            tags=list(src.tags),
            state=src.state.copy(deep=True),
            author="User (Cloned)",
            is_public=False,
            created_at=now,
            updated_at=now,
            view_count=0,
            star_count=0
        )
        self._workspaces[clone_id] = cloned
        return cloned

workspace_service = WorkspaceService()

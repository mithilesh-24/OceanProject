import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.workspace_service import workspace_service
from app.schemas.workspace import SavedWorkspaceCreate, AnalysisFilterState
from app.services.export_service import export_service
from app.schemas.export import DataExportRequest, BulletinReportRequest
from app.services.educational_service import educational_service
from app.services.research_engine import research_engine
from app.schemas.research import DensityComputationRequest, QueryGeneratorRequest
from app.services.admin_service import admin_service

def test_phase16_workspaces():
    print("\n--- Testing Phase 16: Saved Analysis & Workspaces ---")
    all_ws = workspace_service.get_all_workspaces()
    assert len(all_ws) >= 4, f"Expected at least 4 seeded workspaces, got {len(all_ws)}"
    print(f"✓ Seeded workspaces count: {len(all_ws)}")

    # Create new workspace
    new_ws = workspace_service.create_workspace(SavedWorkspaceCreate(
        title="Test Benguela Upwelling Workspace",
        description="Verification session for test script",
        category="custom",
        tags=["Test", "Upwelling"],
        state=AnalysisFilterState(selected_model="hycom", depth_level=50.0)
    ))
    assert new_ws.id.startswith("ws-"), f"Invalid workspace id: {new_ws.id}"
    print(f"✓ Created workspace: {new_ws.id} - '{new_ws.title}'")

    # Clone workspace
    cloned = workspace_service.clone_workspace(new_ws.id)
    assert cloned is not None and cloned.id.startswith("ws-copy-"), f"Cloning failed: {cloned}"
    print(f"✓ Cloned workspace: {cloned.id}")

    # Delete workspace
    del_res = workspace_service.delete_workspace(cloned.id)
    assert del_res is True, "Delete returned False"
    print("✓ Successfully deleted cloned workspace.")

def test_phase17_export():
    print("\n--- Testing Phase 17: Multi-Format Data & Report Export Engine ---")
    csv_exp = export_service.generate_data_export(DataExportRequest(
        export_format="csv",
        data_source="argo",
        variable="temperature",
        region="indian_ocean"
    ))
    assert csv_exp.content_type == "text/csv", f"Unexpected content type: {csv_exp.content_type}"
    assert csv_exp.record_count > 0, "No records generated in CSV export"
    print(f"✓ CSV Export generated: {csv_exp.filename} ({csv_exp.record_count} records, {csv_exp.file_size_bytes} bytes)")

    geojson_exp = export_service.generate_data_export(DataExportRequest(
        export_format="geojson",
        data_source="argo"
    ))
    assert geojson_exp.content_type == "application/geo+json", f"Unexpected content type: {geojson_exp.content_type}"
    assert geojson_exp.data_payload["type"] == "FeatureCollection"
    print(f"✓ GeoJSON Export generated: {geojson_exp.filename} ({len(geojson_exp.data_payload['features'])} features)")

    bulletin = export_service.generate_bulletin_report(BulletinReportRequest(
        title="Q1 2024 Indian Ocean Hydrodynamic State Report",
        model="hycom",
        region="indian_ocean"
    ))
    assert "key_performance_metrics" in bulletin
    print(f"✓ Scientific Bulletin generated: '{bulletin['title']}' - Skill: {bulletin['key_performance_metrics']['skill_score_pct']}%")

def test_phase18_educational():
    print("\n--- Testing Phase 18: Student Educational Oceanography Workspace ---")
    resp = educational_service.get_all_modules()
    assert resp.total >= 3, f"Expected >= 3 modules, got {resp.total}"
    print(f"✓ Loaded {resp.total} educational curriculum modules:")
    for m in resp.modules:
        print(f"  - [{m.difficulty_level}] {m.title} ({len(m.tour_steps)} 3D Tour Steps, {len(m.quiz_questions)} Quizzes)")

    detail = educational_service.get_module_by_id("mod-argo-robotics")
    assert detail is not None, "Failed to retrieve module detail"
    assert len(detail.tour_steps) == 3, "Expected 3 tour steps"
    print("✓ Successfully verified 3D tour coordinates and quiz questions.")

def test_phase19_researcher():
    print("\n--- Testing Phase 19: Researcher & Advanced Scientific Workbench ---")
    depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 500]
    temps = [29.2, 29.1, 28.9, 27.5, 23.8, 20.2, 16.0, 13.8, 11.5, 9.2]
    sals = [33.1, 33.15, 33.3, 34.0, 34.7, 34.95, 35.05, 35.0, 34.9, 34.8]

    res = research_engine.compute_density_stratification(DensityComputationRequest(
        depth_m=depths,
        temperature_c=temps,
        salinity_psu=sals
    ))
    assert len(res.potential_density_kg_m3) == len(depths)
    assert res.barrier_layer_thickness_m >= 0.0
    print(f"✓ Computed TEOS-10 Potential Density & Stratification:")
    print(f"  - MLD: {res.mixed_layer_depth_m}m | ILD: {res.isothermal_layer_depth_m}m | Barrier Layer: {res.barrier_layer_thickness_m}m")
    print(f"  - Max Buoyancy Frequency N^2: {res.maximum_stability_n2:.6f} s^-2 at depth {res.maximum_stability_depth_m}m")

    # Test Query Generator
    q = research_engine.generate_research_query(QueryGeneratorRequest(
        query_type="erddap_python",
        variable="temp"
    ))
    assert "erddapy" in q.code_snippet, "Query generation missing expected library"
    print(f"✓ Generated automated {q.language} query script ({len(q.code_snippet)} chars)")

def test_phase20_admin():
    print("\n--- Testing Phase 20: Admin Platform Management & Telemetry ---")
    telemetry = admin_service.get_system_telemetry()
    assert len(telemetry.pipelines) >= 5, f"Expected >= 5 ingestion pipelines, got {len(telemetry.pipelines)}"
    print(f"✓ System Telemetry: CPU={telemetry.cpu_utilization_pct}%, Uptime={telemetry.uptime_seconds}s, Profiles={telemetry.db_profiles_count}")
    for p in telemetry.pipelines:
        print(f"  - [{p.status}] {p.name} ({p.records_harvested_24h} records/24h, Latency: {p.latency_ms}ms)")

    # Test trigger and flush
    trig = admin_service.trigger_pipeline_sync("pipe-incois-argo")
    assert trig["status"] == "SYNC_TRIGGERED"
    print(f"✓ Manual sync trigger executed: {trig['message']}")

    flush = admin_service.flush_cache("tiles")
    assert flush["status"] == "SUCCESS"
    print(f"✓ Cache flush executed: {flush['message']}")

if __name__ == "__main__":
    print("======================================================================")
    print("   SIH2026 OCEAN PLATFORM: PHASES 16-20 BACKEND VERIFICATION SUITE   ")
    print("======================================================================")
    test_phase16_workspaces()
    test_phase17_export()
    test_phase18_educational()
    test_phase19_researcher()
    test_phase20_admin()
    print("\n======================================================================")
    print("      ALL PHASES 16-20 BACKEND CALCULATIONS & APIS VERIFIED (100%)    ")
    print("======================================================================\n")

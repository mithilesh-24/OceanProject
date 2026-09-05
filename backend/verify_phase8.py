import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.spatiotemporal_engine import SpatiotemporalEngine
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== Testing Phase 8: 3D & 4D Visualization Backend ===", flush=True)

    # 1. Test Spatiotemporal Engine Direct
    timeline_meta = SpatiotemporalEngine.get_timeline_metadata()
    assert timeline_meta["total_days"] == 35
    assert len(timeline_meta["milestones"]) >= 5
    print(f"✓ Timeline metadata verified: {timeline_meta['start_date']} to {timeline_meta['end_date']} with {len(timeline_meta['milestones'])} milestones", flush=True)

    # 2. Test Depth Layers
    depth_layers = SpatiotemporalEngine.get_depth_layers()
    assert len(depth_layers) >= 7
    depth_values = [d["depth_m"] for d in depth_layers]
    assert 0 in depth_values and 50 in depth_values and 100 in depth_values and 1000 in depth_values and 2000 in depth_values
    print(f"✓ 3D Depth layers verified: {len(depth_layers)} depth zones from 0m to 2000m", flush=True)

    # 3. Test 4D State Interpolation Snapshot
    snapshot_start = SpatiotemporalEngine.get_state_at_time("2026-08-01T00:00:00Z")
    assert snapshot_start["time_progress_pct"] == 0.0
    assert len(snapshot_start["argo_floats"]) >= 4
    assert len(snapshot_start["gliders"]) >= 2
    assert len(snapshot_start["buoys"]) >= 2
    print(f"✓ Snapshot at Start (t=0%): {snapshot_start['active_platforms_count']} active platforms", flush=True)

    snapshot_mid = SpatiotemporalEngine.get_state_at_time("2026-08-18T00:00:00Z")
    assert snapshot_mid["time_progress_pct"] > 40.0 and snapshot_mid["time_progress_pct"] < 60.0
    print(f"✓ Snapshot at Midpoint: time_progress={snapshot_mid['time_progress_pct']}%, Mean basin temp={snapshot_mid['mean_basin_temp']}°C", flush=True)

    snapshot_end = SpatiotemporalEngine.get_state_at_time("2026-09-04T12:00:00Z")
    assert snapshot_end["time_progress_pct"] == 100.0
    print(f"✓ Snapshot at Real-Time End: {snapshot_end['argo_floats'][0]['name']} at lat={snapshot_end['argo_floats'][0]['lat']}, lon={snapshot_end['argo_floats'][0]['lon']}", flush=True)

    # 4. Test REST API Endpoints via TestClient
    client = TestClient(app)

    res_tl = client.get("/api/v1/visualization/timeline")
    assert res_tl.status_code == 200
    assert "start_date" in res_tl.json()
    print("✓ GET /api/v1/visualization/timeline returned 200 OK", flush=True)

    res_dl = client.get("/api/v1/visualization/depth-layers")
    assert res_dl.status_code == 200
    assert len(res_dl.json()) >= 7
    print("✓ GET /api/v1/visualization/depth-layers returned 200 OK", flush=True)

    res_st = client.get("/api/v1/visualization/state-at-time?timestamp=2026-08-20T12:00:00Z&variable=temperature&depth=50")
    assert res_st.status_code == 200
    assert len(res_st.json()["argo_floats"]) >= 4
    assert res_st.json()["depth_m"] == 50.0
    print("✓ GET /api/v1/visualization/state-at-time returned 200 OK", flush=True)

    print("=== ALL PHASE 8 BACKEND TESTS PASSED SUCCESSFULLY! ===", flush=True)

if __name__ == "__main__":
    run_tests()

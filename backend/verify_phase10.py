import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.inter_comparison_engine import InterComparisonEngine
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== Testing Phase 10: Model vs Model Inter-Comparison Backend ===", flush=True)

    # 1. Test HYCOM vs ROMS (Temperature at 0m surface)
    res_hycom_roms = InterComparisonEngine.run_inter_comparison(
        model_a="hycom",
        model_b="roms",
        variable="temperature",
        depth_m=0.0,
        region="indian_ocean"
    )

    assert res_hycom_roms["model_a"] == "HYCOM"
    assert res_hycom_roms["model_b"] == "ROMS"
    assert res_hycom_roms["variable"] == "temperature"
    assert "common_grid" in res_hycom_roms
    assert "metrics" in res_hycom_roms
    assert "difference_grid" in res_hycom_roms
    assert "depth_variance_profile" in res_hycom_roms
    assert "layer_strata_breakdown" in res_hycom_roms
    assert "transect_comparison" in res_hycom_roms

    m = res_hycom_roms["metrics"]
    assert m["rmsd"] >= 0.0, "RMSD must be non-negative"
    assert -1.0 <= m["pattern_correlation"] <= 1.0, "Pattern correlation must be between -1 and 1"
    assert m["valid_points_count"] > 100, "Should have valid comparison grid points"
    assert len(res_hycom_roms["depth_variance_profile"]) == len(InterComparisonEngine.STANDARD_DEPTHS)

    print(f"[OK] HYCOM vs ROMS (Temp 0m): RMSD={m['rmsd']} C, Bias={m['mean_bias']} C, R={m['pattern_correlation']}, Points={m['valid_points_count']}", flush=True)

    # 2. Test HYCOM vs NEMO (Salinity at 50m thermocline)
    res_hycom_nemo = InterComparisonEngine.run_inter_comparison(
        model_a="hycom",
        model_b="nemo",
        variable="salinity",
        depth_m=50.0,
        region="bay_of_bengal"
    )
    assert res_hycom_nemo["units"] == "PSU"
    assert res_hycom_nemo["depth_m"] == 50.0
    print(f"[OK] HYCOM vs NEMO (Salinity 50m): RMSD={res_hycom_nemo['metrics']['rmsd']} PSU, Bias={res_hycom_nemo['metrics']['mean_bias']} PSU", flush=True)

    # 3. Test ROMS vs NEMO (Currents at 100m)
    res_roms_nemo = InterComparisonEngine.run_inter_comparison(
        model_a="roms",
        model_b="nemo",
        variable="currents",
        depth_m=100.0,
        region="arabian_sea"
    )
    assert res_roms_nemo["units"] == "m/s"
    print(f"[OK] ROMS vs NEMO (Currents 100m): RMSD={res_roms_nemo['metrics']['rmsd']} m/s, Variance Ratio={res_roms_nemo['metrics']['variance_ratio']}", flush=True)

    # 4. Test Invalid Model Selection (Identical models)
    try:
        InterComparisonEngine.run_inter_comparison(
            model_a="hycom",
            model_b="hycom",
            variable="temperature"
        )
        assert False, "Should raise ValueError when model_a == model_b"
    except ValueError as e:
        print(f"[OK] Invalid model validation confirmed: {str(e)}", flush=True)

    # 5. Test REST API Endpoint via TestClient
    client = TestClient(app)
    api_res = client.post("/api/v1/analysis/inter-comparison", json={
        "model_a": "hycom",
        "model_b": "roms",
        "variable": "temperature",
        "depth": 0.0,
        "region": "indian_ocean",
        "transect": "equator"
    })
    assert api_res.status_code == 200
    data = api_res.json()
    assert data["model_a"] == "HYCOM"
    assert data["model_b"] == "ROMS"
    assert "metrics" in data
    assert "difference_grid" in data
    assert "layer_strata_breakdown" in data
    assert len(data["layer_strata_breakdown"]) >= 5
    print("[OK] POST /api/v1/analysis/inter-comparison returned 200 OK with full inter-comparison payload", flush=True)

    # 6. Test 400 Bad Request on invalid identical model selection
    bad_res = client.post("/api/v1/analysis/inter-comparison", json={
        "model_a": "roms",
        "model_b": "roms",
        "variable": "temperature",
        "depth": 0.0,
        "region": "indian_ocean"
    })
    assert bad_res.status_code == 400
    print("[OK] POST /api/v1/analysis/inter-comparison returned 400 on identical models as expected", flush=True)

    print("=== ALL PHASE 10 BACKEND TESTS PASSED SUCCESSFULLY! ===", flush=True)

if __name__ == "__main__":
    run_tests()

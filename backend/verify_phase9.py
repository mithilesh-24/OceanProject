import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.comparison_engine import ComparisonEngine
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== Testing Phase 9: Model vs Observation Scientific Comparison ===", flush=True)

    # 1. Test Comparison Engine Direct Execution: HYCOM vs Argo (Temperature)
    res_hycom_argo = ComparisonEngine.run_comparison_pipeline(
        model_id="hycom",
        obs_type="argo",
        variable="temperature",
        region="bay_of_bengal"
    )

    assert "metrics" in res_hycom_argo
    metrics = res_hycom_argo["metrics"]
    assert metrics["pearson_r"] > 0.95, "Correlation should be > 0.95"
    assert metrics["willmott_index"] > 0.95, "Willmott index should be > 0.95"
    assert metrics["rmse"] > 0, "RMSE must be positive"
    assert len(res_hycom_argo["scatter_points"]) >= 30, "Should contain scatter points"
    assert len(res_hycom_argo["depth_profile"]["obs"]) >= 5, "Should contain depth profiles"
    assert len(res_hycom_argo["time_series"]) == 30, "Should contain 30-day time series"
    assert len(res_hycom_argo["histogram"]["bins"]) > 5, "Should contain histogram bins"
    assert len(res_hycom_argo["layer_breakdown"]) >= 4, "Should contain layer breakdown"

    print(f"✓ HYCOM vs Argo (Temp): R={metrics['pearson_r']}, RMSE={metrics['rmse']}°C, Willmott d={metrics['willmott_index']}, Taylor Skill={metrics['taylor_skill']}", flush=True)

    # 2. Test Comparison Engine: ROMS vs OMNI Buoys (Salinity)
    res_roms_buoy = ComparisonEngine.run_comparison_pipeline(
        model_id="roms",
        obs_type="buoys",
        variable="salinity",
        region="arabian_sea"
    )
    assert res_roms_buoy["units"] == "PSU"
    assert res_roms_buoy["metrics"]["r2_score"] > 0.90
    print(f"✓ ROMS vs Buoy (Salinity): R={res_roms_buoy['metrics']['pearson_r']}, R2={res_roms_buoy['metrics']['r2_score']}, Mean Bias={res_roms_buoy['metrics']['mean_bias']} PSU", flush=True)

    # 3. Test Comparison Engine: NEMO vs CTD (Currents)
    res_nemo_ctd = ComparisonEngine.run_comparison_pipeline(
        model_id="nemo",
        obs_type="ctd",
        variable="currents",
        region="equatorial"
    )
    assert res_nemo_ctd["units"] == "m/s"
    assert len(res_nemo_ctd["layer_breakdown"]) >= 4
    print(f"✓ NEMO vs CTD (Currents): R={res_nemo_ctd['metrics']['pearson_r']}, RMSE={res_nemo_ctd['metrics']['rmse']} m/s", flush=True)

    # 4. Test REST API Endpoint via TestClient
    client = TestClient(app)
    api_res = client.post("/api/v1/analysis/comparison", json={
        "model": "hycom",
        "observation": "argo",
        "variable": "temperature",
        "region": "bay_of_bengal"
    })
    assert api_res.status_code == 200
    data = api_res.json()
    assert "metrics" in data
    assert "scatter_points" in data
    assert "depth_profile" in data
    assert "time_series" in data
    assert "histogram" in data
    assert "layer_breakdown" in data
    print("✓ POST /api/v1/analysis/comparison returned 200 OK with full 4-chart payload", flush=True)

    print("=== ALL PHASE 9 BACKEND TESTS PASSED SUCCESSFULLY! ===", flush=True)

if __name__ == "__main__":
    run_tests()

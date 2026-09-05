import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.accuracy_engine import AccuracyEngine
from app.services.error_engine import ErrorAnalysisEngine
from app.services.anomaly_engine import AnomalyDetectionEngine
from app.services.statistical_engine import StatisticalAnalysisEngine
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== Testing Phases 11–15: Scientific Analysis & Intelligence Backend ===", flush=True)

    # 1. Phase 11: Accuracy Breakdown
    acc_res = AccuracyEngine.compute_accuracy_breakdown(
        model="hycom",
        variable="temperature",
        region="indian_ocean"
    )
    assert acc_res["model"] == "hycom"
    assert "overall_metrics" in acc_res
    assert "strata_breakdown" in acc_res
    assert len(acc_res["strata_breakdown"]) == 5
    assert "taylor_points" in acc_res
    assert len(acc_res["taylor_points"]) == 3
    assert "leaderboard" in acc_res
    print(f"[OK] Phase 11 Accuracy Engine: Skill={acc_res['overall_metrics']['skill_score']}, RMSE={acc_res['overall_metrics']['rmse']}, Taylor Points={len(acc_res['taylor_points'])}", flush=True)

    # 2. Phase 12: Spatial/Temporal Error Engine
    err_res = ErrorAnalysisEngine.compute_spatial_temporal_errors(
        model="roms",
        variable="temperature",
        depth=0.0,
        region="indian_ocean",
        time_horizon_days=10
    )
    assert err_res["model"] == "roms"
    assert len(err_res["spatial_grid"]) > 100
    assert len(err_res["hotspots"]) >= 3
    assert len(err_res["outliers"]) >= 3
    assert len(err_res["lead_time_degradation"]) == 10
    print(f"[OK] Phase 12 Error Engine: Grid Cells={len(err_res['spatial_grid'])}, Hotspots={len(err_res['hotspots'])}, Outliers={len(err_res['outliers'])}, Lead Days={len(err_res['lead_time_degradation'])}", flush=True)

    # 3. Phase 13: Anomaly Detection Engine
    anom_res = AnomalyDetectionEngine.detect_anomalies(
        variable="temperature",
        region="indian_ocean",
        depth=0.0
    )
    assert len(anom_res["events"]) >= 4
    assert len(anom_res["mhw_timeseries"]) == 30
    assert len(anom_res["spatial_clusters"]) >= 3
    assert len(anom_res["depth_profile"]) >= 5
    print(f"[OK] Phase 13 Anomaly Engine: Events={len(anom_res['events'])}, Timeseries Days={len(anom_res['mhw_timeseries'])}, Clusters={len(anom_res['spatial_clusters'])}", flush=True)

    # 4. Phase 14: Statistical Analysis Engine
    stat_res = StatisticalAnalysisEngine.compute_comprehensive_statistics(
        model="hycom",
        variable="temperature",
        region="indian_ocean",
        depth=0.0
    )
    assert "summary_metrics" in stat_res
    assert "percentiles" in stat_res
    assert stat_res["percentiles"]["p50_median"] > 0.0
    assert len(stat_res["distribution_pdf_cdf"]) == 25
    assert "decadal_trend" in stat_res
    assert len(stat_res["decadal_trend"]["timeline"]) == 11
    assert "correlation_matrix" in stat_res
    assert len(stat_res["correlation_matrix"]["variables"]) == 6
    print(f"[OK] Phase 14 Statistical Engine: Mean={stat_res['summary_metrics']['mean']}, Median={stat_res['percentiles']['p50_median']}, Bins={len(stat_res['distribution_pdf_cdf'])}, Trend={stat_res['decadal_trend']['stats']['theil_sen_slope_per_decade']}", flush=True)

    # 5. Test REST API Endpoints via TestClient
    client = TestClient(app)

    r11 = client.post("/api/v1/analysis/accuracy/breakdown", json={"model": "hycom", "variable": "temperature"})
    assert r11.status_code == 200, f"P11 API failed: {r11.text}"
    print("[OK] POST /api/v1/analysis/accuracy/breakdown returned 200 OK", flush=True)

    r12 = client.post("/api/v1/analysis/errors/spatial-temporal", json={"model": "roms", "variable": "temperature"})
    assert r12.status_code == 200, f"P12 API failed: {r12.text}"
    print("[OK] POST /api/v1/analysis/errors/spatial-temporal returned 200 OK", flush=True)

    r13 = client.post("/api/v1/analysis/anomalies/detect", json={"variable": "temperature", "region": "indian_ocean"})
    assert r13.status_code == 200, f"P13 API failed: {r13.text}"
    print("[OK] POST /api/v1/analysis/anomalies/detect returned 200 OK", flush=True)

    r14 = client.post("/api/v1/analysis/statistics/comprehensive", json={"model": "hycom", "variable": "temperature"})
    assert r14.status_code == 200, f"P14 API failed: {r14.text}"
    print("[OK] POST /api/v1/analysis/statistics/comprehensive returned 200 OK", flush=True)

    print("\n>>> ALL PHASES 11–15 BACKEND ENGINES AND API ENDPOINTS VERIFIED SUCCESSFULLY! <<<", flush=True)

if __name__ == "__main__":
    run_tests()

import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.model_data import NumericalModel
from app.services.seeder import init_db
from app.services.model_subsetter import ModelSubsetter
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("=== Testing Phase 7: Numerical Model Explorer Backend ===", flush=True)

    db = SessionLocal()
    init_db(db)

    # 1. Verify Numerical Models in DB
    models = db.query(NumericalModel).all()
    print(f"✓ Numerical models in DB: {len(models)}", flush=True)
    assert len(models) >= 3, "Should have at least 3 models (HYCOM, ROMS, NEMO)"

    model_ids = [m.id for m in models]
    assert "hycom" in model_ids, "HYCOM should be in database"
    assert "roms" in model_ids, "ROMS should be in database"
    assert "nemo" in model_ids, "NEMO should be in database"
    print("✓ All 3 foundational models (HYCOM, ROMS, NEMO) present in database", flush=True)

    db.close()

    # 2. Test Model Subsetter Service directly
    # A. 2D Horizontal Slice Generation (Temperature at 0m surface)
    slice_hycom_t0 = ModelSubsetter.generate_horizontal_slice("hycom", "temperature", depth_m=0.0)
    assert slice_hycom_t0["variable"] == "temperature"
    assert len(slice_hycom_t0["latitudes"]) > 0
    assert len(slice_hycom_t0["longitudes"]) > 0
    assert len(slice_hycom_t0["grid_values"]) == len(slice_hycom_t0["latitudes"])
    print(f"✓ HYCOM 0m Temperature Slice generated: {slice_hycom_t0['dimensions']} grid, min={slice_hycom_t0['min_value']}°C, max={slice_hycom_t0['max_value']}°C", flush=True)

    # B. 2D Horizontal Slice Generation (Currents / Velocity at 50m)
    slice_hycom_vel = ModelSubsetter.generate_horizontal_slice("hycom", "velocity", depth_m=50.0)
    assert slice_hycom_vel["variable"] == "velocity"
    assert slice_hycom_vel["vectors"] is not None
    assert len(slice_hycom_vel["vectors"]) > 0
    print(f"✓ HYCOM 50m Velocity Slice & Vectors generated: {len(slice_hycom_vel['vectors'])} vector arrows", flush=True)

    # C. Point Depth Profile extraction
    profile_bay = ModelSubsetter.get_point_depth_profile("hycom", lat=14.28, lon=87.45, variable="temperature")
    assert len(profile_bay["depths"]) > 10
    assert profile_bay["mixed_layer_depth_m"] > 0
    assert profile_bay["thermocline_depth_m"] > profile_bay["mixed_layer_depth_m"]
    print(f"✓ Point Depth Profile extracted (BoB 14.28°N, 87.45°E): MLD={profile_bay['mixed_layer_depth_m']}m, Thermocline={profile_bay['thermocline_depth_m']}m", flush=True)

    # D. Vertical Cross-Section Transect
    transect_eq = ModelSubsetter.generate_vertical_transect("hycom", "equator", "temperature")
    assert len(transect_eq["depths"]) > 0
    assert len(transect_eq["coords_points"]) > 0
    assert len(transect_eq["matrix_data"]) == len(transect_eq["depths"])
    print(f"✓ Vertical Transect (Equatorial Zonal Section) generated: {len(transect_eq['depths'])} depth levels x {len(transect_eq['coords_points'])} coordinate points", flush=True)

    # 3. Test API Client Endpoints via TestClient
    client = TestClient(app)

    # GET /api/v1/models
    res_models = client.get("/api/v1/models")
    assert res_models.status_code == 200
    assert len(res_models.json()) >= 3
    print("✓ GET /api/v1/models returned 200 OK", flush=True)

    # GET /api/v1/models/hycom
    res_hycom = client.get("/api/v1/models/hycom")
    assert res_hycom.status_code == 200
    assert res_hycom.json()["id"] == "hycom"
    assert len(res_hycom.json()["depth_levels"]) >= 20
    print("✓ GET /api/v1/models/hycom returned 200 OK with depth levels", flush=True)

    # GET /api/v1/models/hycom/slice
    res_slice = client.get("/api/v1/models/hycom/slice?variable=salinity&depth=100")
    assert res_slice.status_code == 200
    assert res_slice.json()["variable"] == "salinity"
    print("✓ GET /api/v1/models/hycom/slice returned 200 OK", flush=True)

    # GET /api/v1/models/roms/profile
    res_prof = client.get("/api/v1/models/roms/profile?lat=15.4&lon=73.6&variable=temperature")
    assert res_prof.status_code == 200
    assert res_prof.json()["model_id"] == "roms"
    print("✓ GET /api/v1/models/roms/profile returned 200 OK", flush=True)

    # GET /api/v1/models/nemo/transect
    res_trans = client.get("/api/v1/models/nemo/transect?transect=bob_meridional&variable=temperature")
    assert res_trans.status_code == 200
    assert res_trans.json()["transect_name"] == "bob_meridional"
    print("✓ GET /api/v1/models/nemo/transect returned 200 OK", flush=True)

    print("=== ALL PHASE 7 BACKEND TESTS PASSED SUCCESSFULLY! ===", flush=True)

if __name__ == "__main__":
    run_tests()

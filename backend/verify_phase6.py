import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.observation import ArgoFloat, GliderMission, MooredBuoy, CtdCast, AdcpStation
from app.services.seeder import init_db
from fastapi.testclient import TestClient
from app.main import app

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.observation import ArgoFloat, GliderMission, MooredBuoy, CtdCast, AdcpStation
from app.services.seeder import init_db

def run_tests():
    print("=== Testing Phase 6: Observation Explorer Backend ===", flush=True)

    db = SessionLocal()
    # Ensure database is seeded
    init_db(db)

    # 1. Verify Argo float records & profiles
    argo_count = db.query(ArgoFloat).count()
    print(f"✓ Argo floats in DB: {argo_count}", flush=True)
    assert argo_count >= 5, "Should have at least 5 Argo floats"

    float_1902670 = db.query(ArgoFloat).filter(ArgoFloat.wmo_id == "1902670").first()
    assert float_1902670 is not None, "Float 1902670 should exist"
    print(f"✓ Float 1902670 profile data verified: {len(float_1902670.profile_data['depths'])} depth levels", flush=True)

    # 2. Verify Glider missions & sawtooth profiles
    gliders_count = db.query(GliderMission).count()
    print(f"✓ Glider missions in DB: {gliders_count}", flush=True)
    assert gliders_count >= 3, "Should have at least 3 Glider missions"

    # 3. Verify Moored Buoys
    buoys_count = db.query(MooredBuoy).count()
    print(f"✓ Moored buoys in DB: {buoys_count}", flush=True)
    assert buoys_count >= 4, "Should have at least 4 Moored Buoys"

    # 4. Verify CTD casts
    ctd_count = db.query(CtdCast).count()
    print(f"✓ CTD casts in DB: {ctd_count}", flush=True)
    assert ctd_count >= 3, "Should have at least 3 CTD casts"

    # 5. Verify ADCP stations & velocity profiles
    adcp_count = db.query(AdcpStation).count()
    print(f"✓ ADCP stations in DB: {adcp_count}", flush=True)
    assert adcp_count >= 3, "Should have at least 3 ADCP stations"

    db.close()

    # Test API Client endpoints
    client = TestClient(app)
    
    # Test Argo listing & detail
    res_argo = client.get("/api/v1/observations/argo?basin=Bengal")
    assert res_argo.status_code == 200, "Argo listing should return 200"
    assert len(res_argo.json()) >= 2, "Filtered basin query should match floats"
    
    res_float = client.get("/api/v1/observations/argo/1902670")
    assert res_float.status_code == 200, "Argo float detail should return 200"
    assert res_float.json()["wmo_id"] == "1902670"
    print("✓ /api/v1/observations/argo & /argo/{wmo_id} verified", flush=True)

    # Test Gliders listing & detail
    res_gliders = client.get("/api/v1/observations/gliders")
    assert res_gliders.status_code == 200
    res_glider_detail = client.get("/api/v1/observations/gliders/SG-642")
    assert res_glider_detail.status_code == 200
    assert res_glider_detail.json()["id"] == "SG-642"
    print("✓ /api/v1/observations/gliders & /gliders/{id} verified", flush=True)

    # Test Buoys listing & detail
    res_buoys = client.get("/api/v1/observations/buoys")
    assert res_buoys.status_code == 200
    res_buoy_detail = client.get("/api/v1/observations/buoys/OMNI-BD08")
    assert res_buoy_detail.status_code == 200
    print("✓ /api/v1/observations/buoys & /buoys/{station_id} verified", flush=True)

    # Test CTD listing & detail
    res_ctd = client.get("/api/v1/observations/ctd")
    assert res_ctd.status_code == 200
    res_ctd_detail = client.get("/api/v1/observations/ctd/CTD-SAGAR-2026-041")
    assert res_ctd_detail.status_code == 200
    print("✓ /api/v1/observations/ctd & /ctd/{cast_id} verified", flush=True)

    # Test ADCP listing & detail
    res_adcp = client.get("/api/v1/observations/adcp")
    assert res_adcp.status_code == 200
    res_adcp_detail = client.get("/api/v1/observations/adcp/ADCP-EQ-01")
    assert res_adcp_detail.status_code == 200
    print("✓ /api/v1/observations/adcp & /adcp/{station_id} verified", flush=True)

    print("=== ALL PHASE 6 BACKEND TESTS PASSED SUCCESSFULLY! ===", flush=True)

if __name__ == "__main__":
    run_tests()


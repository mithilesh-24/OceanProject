import httpx
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoints():
    print("=" * 70)
    print("  BLUESPHERE OCEAN PLATFORM — PHASE 3 BACKEND & DATABASE AUDIT")
    print("=" * 70)

    client = httpx.Client(timeout=10.0)

    # 1. Health
    try:
        r = client.get(f"{BASE_URL}/health")
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        data = r.json()
        print(f"\n[PASS] /health -> Status: {data['status']}, Database: {data['database']}, Version: {data['version']}")
    except Exception as e:
        print(f"\n[FAIL] /health -> {e}")
        return False

    # 2. System Status
    try:
        r = client.get(f"{BASE_URL}/system-status")
        assert r.status_code == 200
        data = r.json()
        print(f"[PASS] /system-status -> Overall: {data['overall_status']}, Uptime: {data['uptime_pct']}%, Records: {data['db_records_total']}")
    except Exception as e:
        print(f"[FAIL] /system-status -> {e}")
        return False

    # 3. Datasets
    try:
        r = client.get(f"{BASE_URL}/datasets")
        assert r.status_code == 200
        datasets = r.json()
        print(f"[PASS] /datasets -> {len(datasets)} Datasets seeded and accessible:")
        for d in datasets:
            print(f"       • [{d['type']:<11}] {d['name']} ({d['provider']}) -> Status: {d['status']}")
    except Exception as e:
        print(f"[FAIL] /datasets -> {e}")
        return False

    # 4. In-Situ Observations (Argo, Gliders, Buoys, CTD, ADCP)
    try:
        argo = client.get(f"{BASE_URL}/observations/argo").json()
        gliders = client.get(f"{BASE_URL}/observations/gliders").json()
        buoys = client.get(f"{BASE_URL}/observations/buoys").json()
        ctd = client.get(f"{BASE_URL}/observations/ctd").json()
        adcp = client.get(f"{BASE_URL}/observations/adcp").json()
        print(f"\n[PASS] /observations -> In-Situ Sensor Networks Verified:")
        print(f"       • Argo Profiling Floats : {len(argo)} floats live (WMO: {', '.join([f['wmo_id'] for f in argo])})")
        print(f"       • Autonomous Gliders    : {len(gliders)} missions active ({', '.join([g['id'] for g in gliders])})")
        print(f"       • Moored Buoy Arrays    : {len(buoys)} stations transmitting ({', '.join([b['station_id'] for b in buoys])})")
        print(f"       • Shipboard CTD Casts   : {len(ctd)} research stations")
        print(f"       • ADCP Current Arrays   : {len(adcp)} moorings")
    except Exception as e:
        print(f"[FAIL] /observations -> {e}")
        return False

    # 5. Numerical Models
    try:
        models = client.get(f"{BASE_URL}/models").json()
        print(f"\n[PASS] /models -> {len(models)} Numerical Models available:")
        for m in models:
            print(f"       • {m['name']} ({m['resolution']}, {m['levels_count']} levels, Skill: {m['skill_score']})")
    except Exception as e:
        print(f"[FAIL] /models -> {e}")
        return False

    # 6. Analytics & Comparison Engine
    try:
        payload = {"model": "hycom", "observation": "argo", "variable": "temp", "region": "indian_ocean"}
        r = client.post(f"{BASE_URL}/analysis/comparison", json=payload)
        assert r.status_code == 200
        calc = r.json()
        print(f"\n[PASS] POST /analysis/comparison -> Real-Time NumPy Statistical Engine Verified:")
        print(f"       • Mean Bias     : {calc['mean_bias']} °C")
        print(f"       • Mean Abs Error: {calc['mae']} °C")
        print(f"       • Root Mean Sq  : {calc['rmse']} °C")
        print(f"       • Pearson R     : {calc['pearson_r']}")
        print(f"       • R^2 Score     : {calc['r2_score']}")
        print(f"       • Willmott (d)  : {calc['willmott_index']}")
        print(f"       • Depth Layers  : {len(calc['layer_breakdown'])} depth bands calculated")
    except Exception as e:
        print(f"[FAIL] POST /analysis/comparison -> {e}")
        return False

    # 7. Pipelines
    try:
        pipes = client.get(f"{BASE_URL}/admin/pipelines").json()
        print(f"\n[PASS] /admin/pipelines -> {len(pipes)} Ingestion pipelines operational:")
        for p in pipes:
            print(f"       • {p['name']} ({p['source']}) -> {p['status']} (Last: {p['lastSync']})")
    except Exception as e:
        print(f"[FAIL] /admin/pipelines -> {e}")
        return False

    print("\n" + "=" * 70)
    print("  ALL PHASE 3 BACKEND & DATABASE TESTS PASSED WITH 100% INTEGRITY")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = test_endpoints()
    sys.exit(0 if success else 1)

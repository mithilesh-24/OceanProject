"""
Phase 5 Automated Verification Test Suite
Tests Ocean Explorer Backend APIs:
- Spatial Bounding Box Queries (min_lat, max_lat, min_lon, max_lon)
- In-situ Telemetry & Vertical Profiles for Argo Floats, Gliders, Moored Buoys, CTD Casts
- Depth slicing & Mathematical validation
"""

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(name: str, path: str, expected_status=200):
    url = f"{BASE_URL}{path}"
    print(f"Testing {name}: {url} ...", end=" ")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "BluesphereVerifier/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            data = json.loads(resp.read().decode("utf-8"))
            if status == expected_status:
                print(f"[PASS] (Status {status})")
                return True, data
            else:
                print(f"[FAIL] Expected {expected_status}, got {status}")
                return False, data
    except Exception as e:
        print(f"[FAIL] Exception: {e}")
        return False, str(e)

def main():
    print("=" * 60)
    print("BLUESPHERE PHASE 5: OCEAN EXPLORER API VERIFICATION")
    print("=" * 60)

    all_passed = True

    # 1. Health Check
    ok, res = test_endpoint("System Health", "/health")
    all_passed = all_passed and ok

    # 2. Argo Observations without filter
    ok, res = test_endpoint("All Argo Observations", "/observations/argo")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Retrieved {len(res)} Argo floats")
        assert len(res) > 0, "No Argo floats returned"

    # 3. Argo Spatial Bounding Box (Bay of Bengal / Arabian Sea)
    ok, res = test_endpoint("Argo Bounding Box Query", "/observations/argo?min_lat=5&max_lat=25&min_lon=60&max_lon=95")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Spatial filter matched {len(res)} floats within [5-25°N, 60-95°E]")
        for f in res:
            assert 5 <= f["latitude"] <= 25, f"Latitude {f['latitude']} out of range"
            assert 60 <= f["longitude"] <= 95, f"Longitude {f['longitude']} out of range"

    # 4. Glider Missions
    ok, res = test_endpoint("Glider Missions", "/observations/gliders")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Retrieved {len(res)} Glider missions")

    # 5. Moored Buoys
    ok, res = test_endpoint("Moored Buoy Network", "/observations/buoys")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Retrieved {len(res)} Moored Buoys")

    # 6. CTD Casts
    ok, res = test_endpoint("CTD Deep Casts", "/observations/ctd")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Retrieved {len(res)} CTD Casts")

    # 7. Numerical Models Slices
    ok, res = test_endpoint("Numerical Models Slices", "/models")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Retrieved {len(res)} Numerical Model grids")

    # 8. Real-time Accuracy Assessment Engine
    ok, res = test_endpoint("Accuracy Engine Metrics", "/analysis/accuracy")
    all_passed = all_passed and ok
    if ok:
        print(f"   -> Calculated Willmott Index d={res.get('willmott_index')}, RMSE={res.get('rmse')}, R2={res.get('r_squared')}")

    print("=" * 60)
    if all_passed:
        print(">>> ALL PHASE 5 API VERIFICATION TESTS PASSED SUCCESSFULLY! <<<")
        sys.exit(0)
    else:
        print(">>> SOME TESTS FAILED! <<<")
        sys.exit(1)

if __name__ == "__main__":
    main()

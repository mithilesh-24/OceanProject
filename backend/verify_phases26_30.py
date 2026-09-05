import sys
import os
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.eddy_engine import eddy_engine
from app.services.bgc_engine import bgc_engine
from app.services.routing_engine import routing_engine
from app.services.ml_forecast_engine import ml_forecast_engine
from app.services.disaster_engine import disaster_engine
from app.services.copilot.tool_registry import CopilotToolRegistry
from app.services.copilot.provider import get_llm_provider
from app.schemas.copilot import CopilotChatRequest, CopilotChatMessage, CopilotClientContext, ProvenanceType

def test_phase26_eddies():
    print("\n--- Testing Phase 26: Ocean Eddy Kinematics & Okubo-Weiss Tracker ---")
    res = eddy_engine.get_active_eddies()
    assert res["total_detected"] >= 3, f"Expected >= 3 eddies, got {res['total_detected']}"
    assert res["provenance"] == "DERIVED_ANALYSIS"
    print(f"✓ Total Eddies Detected: {res['total_detected']} (Anticyclonic: {res['anticyclonic_count']}, Cyclonic: {res['cyclonic_count']})")
    for e in res["eddies"]:
        print(f"  - [{e['eddy_type']}] {e['name']} (Radius: {e['radius_km']} km, Ro: {e['rossby_number']}, Vmax: {e['max_rotational_velocity_ms']} m/s)")
    
    # Test individual kinematics
    kin = eddy_engine.get_eddy_kinematics(res["eddies"][0]["eddy_id"])
    assert len(kin["vertical_profile"]) >= 5
    print(f"✓ Vertical Profile for {kin['name']}: {len(kin['vertical_profile'])} depth layers")

def test_phase27_bgc():
    print("\n--- Testing Phase 27: Biogeochemical Oceanography & Carbon Cycle ---")
    bgc = bgc_engine.get_basin_parameters("arabian_sea")
    assert bgc["provenance"] == "DERIVED_ANALYSIS"
    assert "metrics" in bgc
    print(f"✓ Arabian Sea BGC Metrics: Mean DO = {bgc['metrics']['mean_dissolved_oxygen_umol_kg']} µmol/kg, pH = {bgc['metrics']['surface_ph']}, Ω_arag = {bgc['metrics']['aragonite_saturation_state']}")
    
    omz = bgc_engine.get_omz_extent("arabian_sea", 200.0)
    assert omz["hypoxia_volume_km3"] > 1000000
    assert len(omz["omz_polygons"]) >= 1
    print(f"✓ Arabian Sea OMZ Volume (< 60 µmol/kg): {omz['hypoxia_volume_km3']:,} km³ ({len(omz['omz_polygons'])} hypoxia contours)")

def test_phase28_routing():
    print("\n--- Testing Phase 28: Maritime Routing & Vessel Weather Optimization ---")
    route = routing_engine.calculate_optimal_route(origin="Chennai", destination="Singapore", vessel_type="container_ultra")
    assert route["provenance"] == "DERIVED_ANALYSIS"
    assert route["fuel_saved_tons"] > 0
    assert route["co2_avoided_tons"] > 0
    assert len(route["isochrone_waypoints"]) >= 5
    print(f"✓ Passage: {route['origin']} → {route['destination']} ({route['vessel_type']})")
    print(f"  - Great Circle: {route['great_circle_distance_nm']} nm | Optimized: {route['optimized_distance_nm']} nm")
    print(f"  - Time Saved: {route['time_saved_hours']} hrs | Fuel Saved: {route['fuel_saved_tons']} t | CO₂ Avoided: {route['co2_avoided_tons']} t")

def test_phase29_ml_forecast():
    print("\n--- Testing Phase 29: AI/ML Deep Ocean Forecast Surrogate (Unconfigured Check) ---")
    fc = ml_forecast_engine.get_prediction("temperature", 24)
    # Weights should be absent by default in standard repo
    assert fc["status"] in ["MODEL_NOT_CONFIGURED", "INFERENCE_SUCCESS"]
    print(f"✓ ML Forecast Status: {fc['status']} (Provenance: {fc['provenance']})")
    print(f"  - Message: {fc['message']}")
    
    metrics = ml_forecast_engine.get_forecast_metrics()
    assert len(metrics["physics_loss_terms"]) >= 2
    print(f"✓ ML Physics Loss Constraints: {len(metrics['physics_loss_terms'])} conservation laws")

def test_phase30_disaster():
    print("\n--- Testing Phase 30: Disaster Management & Cyclone Storm Surge Warning ---")
    dis = disaster_engine.get_active_threats()
    assert dis["provenance"] == "MODEL_ESTIMATE"
    assert dis["cyclone_system"]["official_alert_feed_status"] == "OFFICIAL_FEED_NOT_CONFIGURED"
    print(f"✓ Active Cyclone: {dis['cyclone_system']['name']} ({dis['cyclone_system']['classification']})")
    print(f"  - Peak Modeled Surge: {dis['cyclone_system']['estimated_peak_surge_m']} m | Feed Status: {dis['cyclone_system']['official_alert_feed_status']}")
    print(f"  - Vulnerable Districts: {len(dis['coastal_threat_districts'])} coastal sectors")

async def test_agentic_copilot():
    print("\n--- Testing Agentic AI Copilot & Controlled Tool Execution ---")
    provider = get_llm_provider()
    
    # Query 1: Navigation tool
    req1 = CopilotChatRequest(
        message="Go to the Arabian Sea",
        context=CopilotClientContext(current_route="/explorer")
    )
    res1 = await provider.process_chat(req1)
    assert len(res1.structured_actions) >= 1
    assert res1.structured_actions[0].type.value == "GO_TO_REGION"
    print(f"✓ Copilot Query 1: '{req1.message}' -> Action: {res1.structured_actions[0].type} ({res1.structured_actions[0].payload.get('region')})")
    
    # Query 2: Phase 26 Eddies Tool
    req2 = CopilotChatRequest(
        message="Show active eddies near Sri Lanka",
        context=CopilotClientContext(current_route="/explorer")
    )
    res2 = await provider.process_chat(req2)
    assert len(res2.tool_calls) >= 1
    assert res2.tool_calls[0].tool_name == "get_eddies"
    print(f"✓ Copilot Query 2: '{req2.message}' -> Tool Executed: {res2.tool_calls[0].tool_name} (Status: {res2.tool_calls[0].status})")
    
    # Query 3: Phase 28 Routing Tool
    req3 = CopilotChatRequest(
        message="Find a favorable route from Chennai to Singapore",
        context=CopilotClientContext(current_route="/explorer")
    )
    res3 = await provider.process_chat(req3)
    assert any(t.tool_name == "optimize_maritime_route" for t in res3.tool_calls)
    print(f"✓ Copilot Query 3: '{req3.message}' -> Tool Executed: optimize_maritime_route")

if __name__ == "__main__":
    print("======================================================================")
    print("   SIH2026 OCEAN PLATFORM: PHASES 26-30 BACKEND & COPILOT VERIFIER   ")
    print("======================================================================")
    test_phase26_eddies()
    test_phase27_bgc()
    test_phase28_routing()
    test_phase29_ml_forecast()
    test_phase30_disaster()
    asyncio.run(test_agentic_copilot())
    print("\n======================================================================")
    print("      ALL PHASES 26-30 BACKEND CALCULATIONS & TOOLS VERIFIED (100%)   ")
    print("======================================================================\n")

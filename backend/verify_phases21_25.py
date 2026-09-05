import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.alert_engine import alert_engine
from app.services.cache_service import cache_service
from app.services.adcp_engine import adcp_engine
from app.services.satellite_service import satellite_service
from app.services.copilot_engine import copilot_engine
from app.schemas.copilot import CopilotQuery

def test_phase21_alerts():
    print("\n--- Testing Phase 21: Real-time Alert & Notification System ---")
    res = alert_engine.get_alerts()
    assert res.total_active >= 3, f"Expected >= 3 active alerts, got {res.total_active}"
    assert len(res.rules) >= 4, f"Expected >= 4 alert rules, got {len(res.rules)}"
    print(f"✓ Active Alerts: {res.total_active} (Critical: {res.critical_count}, Warnings: {res.warning_count})")
    for a in res.alerts:
        print(f"  - [{a.severity}] {a.title} ({a.basin}) -> {a.trigger_value}")

    # Test acknowledgement
    ack = alert_engine.acknowledge_alert(res.alerts[0].id)
    assert ack is not None and ack.status == "ACKNOWLEDGED", "Failed to acknowledge alert"
    print(f"✓ Successfully acknowledged alert: {ack.id}")

def test_phase22_caching():
    print("\n--- Testing Phase 22: High-Performance Caching & Redis Grid ---")
    metrics = cache_service.get_cache_metrics()
    assert metrics["hit_ratio_pct"] > 85.0
    assert metrics["total_keys_cached"] > 1000
    print(f"✓ Cache Grid Status: {metrics['status']} (Hit Ratio: {metrics['hit_ratio_pct']}%, Keys: {metrics['total_keys_cached']})")
    for pool_name, pool in metrics["sub_pools"].items():
        print(f"  - Pool '{pool_name}': {pool['keys']} keys, {pool['hit_ratio']}% hit, {pool['size_mb']} MB")

    inv = cache_service.invalidate_cache("3d_imagery_tiles")
    assert inv["status"] == "SUCCESS"
    print(f"✓ Cache Invalidation: {inv['message']}")

def test_phase23_adcp():
    print("\n--- Testing Phase 23: Acoustic Doppler (ADCP) 3D Vector Fields ---")
    adcp_data = adcp_engine.compute_vector_field("ADCP-EQ01")
    assert len(adcp_data["vectors"]) >= 10
    assert len(adcp_data["shear_profile"]) >= 9
    assert adcp_data["max_surface_speed_m_s"] > 0.5
    print(f"✓ Station: {adcp_data['station_name']} ({adcp_data['flow_regime']})")
    print(f"  - Surface Speed: {adcp_data['max_surface_speed_m_s']} m/s | Zonal Transport: {adcp_data['zonal_transport_sv']} Sv")
    print(f"  - Max Vertical Shear ∂u/∂z: {adcp_data['max_vertical_shear_s_inv']} s⁻¹")

def test_phase24_satellite():
    print("\n--- Testing Phase 24: Satellite Remote Sensing & Matchup Validation ---")
    layers = satellite_service.get_satellite_layers()
    assert len(layers) >= 3, f"Expected >= 3 satellite layers, got {len(layers)}"
    print(f"✓ Loaded {len(layers)} Remote Sensing Satellite Layers:")
    for lay in layers:
        print(f"  - [{lay.satellite}] {lay.name} ({lay.parameter}, Res: {lay.spatial_resolution})")

    matchup = satellite_service.generate_matchup_validation("sat-modis-sst")
    assert len(matchup.points) >= 8
    assert matchup.correlation_satellite_insitu > 0.95
    print(f"✓ Triple-Collocation Matchup ({matchup.satellite_layer} vs {matchup.in_situ_platform}):")
    print(f"  - Correlation R: {matchup.correlation_satellite_insitu:.3f} | RMSE: {matchup.rmse_satellite_insitu:.3f} °C | Bias: {matchup.mean_bias_satellite:.3f} °C")

def test_phase25_copilot():
    print("\n--- Testing Phase 25: AI Oceanographic Forecasting Copilot ---")
    q1 = copilot_engine.process_query(CopilotQuery(message="Tell me about active Marine Heatwaves in the Arabian Sea"))
    assert q1.intent_detected == "ANOMALY_MARINE_HEATWAVE"
    assert len(q1.globe_actions) >= 1
    print(f"✓ Query 1 Intent: {q1.intent_detected} (Confidence: {q1.confidence * 100}%)")
    print(f"  - Action: {q1.globe_actions[0].action_type} -> Lat {q1.globe_actions[0].latitude}°N, Lon {q1.globe_actions[0].longitude}°E")

    q2 = copilot_engine.process_query(CopilotQuery(message="Why is salinity low in the Bay of Bengal?"))
    assert q2.intent_detected == "SALINITY_BARRIER_LAYER"
    print(f"✓ Query 2 Intent: {q2.intent_detected} ({len(q2.scientific_insights)} insights, {len(q2.suggested_followups)} followups)")

    q3 = copilot_engine.process_query(CopilotQuery(message="Compare HYCOM and ROMS accuracy"))
    assert q3.intent_detected == "MODEL_COMPARISON_ACCURACY"
    print(f"✓ Query 3 Intent: {q3.intent_detected}")

if __name__ == "__main__":
    print("======================================================================")
    print("   SIH2026 OCEAN PLATFORM: PHASES 21-25 BACKEND VERIFICATION SUITE   ")
    print("======================================================================")
    test_phase21_alerts()
    test_phase22_caching()
    test_phase23_adcp()
    test_phase24_satellite()
    test_phase25_copilot()
    print("\n======================================================================")
    print("      ALL PHASES 21-25 BACKEND CALCULATIONS & APIS VERIFIED (100%)    ")
    print("======================================================================\n")

import math
from typing import List, Dict, Any, Optional

class ADCPEngine:
    """
    Phase 23: Acoustic Doppler Current Profiler (ADCP) 3D Flow & Shear Engine
    Calculates 3D velocity vectors (u, v, w), vertical current shear ∂u/∂z, and volume transport.
    """

    def compute_vector_field(self, station_id: str = "ADCP-EQ01") -> Dict[str, Any]:
        # Realistic vertical levels from surface (10m) to deep mooring (500m)
        depths = [10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500]
        vectors = []
        shear_profile = []

        total_transport_sv = 0.0

        for i, z in enumerate(depths):
            # Wyrtki Jet / Monsoon Current profile simulation
            if z <= 50:
                # Strong eastward surface jet
                u = 0.95 - (z * 0.008)
                v = 0.22 - (z * 0.003)
                w = 0.002
            elif z <= 150:
                # Thermocline undercurrent
                u = 0.55 - ((z - 50) * 0.004)
                v = -0.15 + ((z - 50) * 0.002)
                w = -0.001
            else:
                # Intermediate deep current
                u = 0.15 - ((z - 150) * 0.0003)
                v = 0.05
                w = 0.0

            speed = math.sqrt(u**2 + v**2 + w**2)
            direction_deg = (math.degrees(math.atan2(u, v)) + 360) % 360
            v_shear = 0.004 if z <= 50 else (0.014 if z <= 150 else 0.005)
            ri = 0.85 if z <= 50 else (0.38 if z <= 150 else 0.92)

            vector_item = {
                "depth": z,
                "depth_m": z,
                "u_zonal_ms": round(u, 3),
                "u_zonal_m_s": round(u, 3),
                "v_meridional_ms": round(v, 3),
                "v_meridional_m_s": round(v, 3),
                "w_vertical_ms": round(w, 4),
                "w_vertical_m_s": round(w, 4),
                "velocity_magnitude_ms": round(speed, 3),
                "horizontal_speed_m_s": round(speed, 3),
                "current_direction_deg": round(direction_deg, 1),
                "direction_deg": round(direction_deg, 1),
                "vertical_shear_s_inv": v_shear,
                "richardson_number": ri
            }
            vectors.append(vector_item)

            # Transport approximation (Sv = 10^6 m^3/s per 100km width)
            dz = 25.0 if i == 0 else (depths[i] - depths[i-1])
            layer_transport = (u * 100000.0 * dz) / 1e6
            total_transport_sv += layer_transport

        # Compute vertical shear: S = sqrt((du/dz)^2 + (dv/dz)^2) in s^-1
        for i in range(1, len(depths)):
            dz = depths[i] - depths[i-1]
            du = vectors[i]["u_zonal_m_s"] - vectors[i-1]["u_zonal_m_s"]
            dv = vectors[i]["v_meridional_m_s"] - vectors[i-1]["v_meridional_m_s"]
            shear = math.sqrt((du / dz)**2 + (dv / dz)**2)
            mid_z = (depths[i] + depths[i-1]) / 2.0
            shear_profile.append({
                "depth_m": round(mid_z, 1),
                "shear_s_inv": round(shear, 5),
                "shear_intensity": "HIGH" if shear > 0.008 else "MODERATE" if shear > 0.004 else "LOW"
            })
            vectors[i]["vertical_shear_s_inv"] = round(shear, 5)

        return {
            "station_id": station_id,
            "station_name": "Equatorial Indian Ocean Deep Mooring #01",
            "mooring_array": "Equatorial Jet Mooring Array",
            "latitude": 0.000,
            "longitude": 80.500,
            "acoustic_frequency_khz": 75,
            "depth_range_m": "10m to 500m",
            "surface_current_speed_ms": round(vectors[0]["horizontal_speed_m_s"], 2),
            "max_surface_speed_m_s": round(vectors[0]["horizontal_speed_m_s"], 2),
            "depth_averaged_speed_ms": round(sum(v["horizontal_speed_m_s"] for v in vectors) / len(vectors), 2),
            "wyrtki_jet_transport_sv": round(total_transport_sv, 2),
            "zonal_transport_sv": round(total_transport_sv, 2),
            "max_vertical_shear_s_inv": round(max(s["shear_s_inv"] for s in shear_profile), 5),
            "bulk_richardson_number": 0.42,
            "vectors": vectors,
            "vector_field": vectors,
            "shear_profile": shear_profile,
            "flow_regime": "Equatorial Wyrtki Jet (Eastward Spring Phase)"
        }

adcp_engine = ADCPEngine()

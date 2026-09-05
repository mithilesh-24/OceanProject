import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

class SpatiotemporalEngine:
    """
    Spatiotemporal Engine for 3D and 4D Ocean Visualizations:
    - 3D Subsurface depth layers (0m to 2000m), water mass properties, thermocline layers.
    - 4D Time-series interpolation for Argo float drift, Glider sawtooth dives, Buoy telemetry.
    - Synchronous time snapshots combining observations and model fields.
    """

    START_DATE = "2026-08-01T00:00:00Z"
    END_DATE = "2026-09-04T12:00:00Z"
    TOTAL_DAYS = 35

    MILESTONES = [
        {"id": "m1", "date": "2026-08-05", "label": "Argo Cycle #8 Transmission", "type": "observation", "platform": "Apex #1902670"},
        {"id": "m2", "date": "2026-08-15", "label": "Glider #591 Oxygen Survey Start", "type": "glider", "platform": "SeaExplorer #591"},
        {"id": "m3", "date": "2026-08-20", "label": "Monsoon Wind Surge (OMNI AD06)", "type": "buoy", "platform": "OMNI-AD06"},
        {"id": "m4", "date": "2026-08-25", "label": "BoB Freshwater Plume Inversion", "type": "anomaly", "platform": "Argo #7902190"},
        {"id": "m5", "date": "2026-09-01", "label": "Marine Heatwave (MHW-2026-08)", "type": "anomaly", "platform": "Argo #2902224"},
        {"id": "m6", "date": "2026-09-04", "label": "Current Real-Time State", "type": "sync", "platform": "All Systems"}
    ]

    DEPTH_LAYERS = [
        {
            "depth_m": 0,
            "name": "Surface Mixed Layer (0m)",
            "desc": "Air-sea interaction, solar warming, and wind-driven wave mixing.",
            "color": "#00f2fe",
            "opacity": 0.35,
            "temp_range": "27.5°C – 29.8°C",
            "sal_range": "32.8 – 36.4 PSU",
            "pressure_dbar": 0
        },
        {
            "depth_m": 25,
            "name": "Upper Epipelagic (25m)",
            "desc": "Chlorophyll maximum layer and active photosynthesis zone.",
            "color": "#06b6d4",
            "opacity": 0.30,
            "temp_range": "26.8°C – 29.1°C",
            "sal_range": "33.2 – 36.5 PSU",
            "pressure_dbar": 25
        },
        {
            "depth_m": 50,
            "name": "Base of Mixed Layer (50m)",
            "desc": "Barrier layer boundary and seasonal pycnocline inception.",
            "color": "#3b82f6",
            "opacity": 0.28,
            "temp_range": "24.5°C – 27.8°C",
            "sal_range": "34.0 – 36.4 PSU",
            "pressure_dbar": 50
        },
        {
            "depth_m": 100,
            "name": "Upper Thermocline (100m)",
            "desc": "Steepest thermal gradient zone (Equatorial Undercurrent core).",
            "color": "#6366f1",
            "opacity": 0.25,
            "temp_range": "18.0°C – 23.5°C",
            "sal_range": "34.8 – 35.8 PSU",
            "pressure_dbar": 101
        },
        {
            "depth_m": 200,
            "name": "Permanent Thermocline (200m)",
            "desc": "Transition to intermediate water masses; Oxygen Minimum Zone (OMZ).",
            "color": "#8b5cf6",
            "opacity": 0.22,
            "temp_range": "13.5°C – 16.5°C",
            "sal_range": "35.0 – 35.5 PSU",
            "pressure_dbar": 202
        },
        {
            "depth_m": 500,
            "name": "Intermediate Water Mass (500m)",
            "desc": "Red Sea / Persian Gulf outflow water spreading across Indian Ocean.",
            "color": "#a855f7",
            "opacity": 0.20,
            "temp_range": "9.5°C – 11.5°C",
            "sal_range": "34.9 – 35.1 PSU",
            "pressure_dbar": 505
        },
        {
            "depth_m": 1000,
            "name": "Argo Float Parking Depth (1000m)",
            "desc": "Isobaric parking drift depth for autonomous profiling floats.",
            "color": "#ec4899",
            "opacity": 0.18,
            "temp_range": "5.5°C – 7.2°C",
            "sal_range": "34.7 – 34.9 PSU",
            "pressure_dbar": 1012
        },
        {
            "depth_m": 2000,
            "name": "Deep Abyssal Layer (2000m)",
            "desc": "Cold North Atlantic Deep Water & Antarctic Bottom Water circulation.",
            "color": "#4338ca",
            "opacity": 0.15,
            "temp_range": "1.8°C – 2.8°C",
            "sal_range": "34.70 – 34.75 PSU",
            "pressure_dbar": 2025
        }
    ]

    @classmethod
    def get_timeline_metadata(cls) -> Dict[str, Any]:
        """Returns the timeline extent, time step specifications, and key events."""
        return {
            "start_date": cls.START_DATE,
            "end_date": cls.END_DATE,
            "total_days": cls.TOTAL_DAYS,
            "recommended_step_hours": 6,
            "milestones": cls.MILESTONES,
            "available_variables": ["temperature", "salinity", "currents", "ssh"],
            "depth_layers_count": len(cls.DEPTH_LAYERS)
        }

    @classmethod
    def get_depth_layers(cls) -> List[Dict[str, Any]]:
        """Returns 3D depth layer specifications."""
        return cls.DEPTH_LAYERS

    @classmethod
    def get_state_at_time(
        cls,
        timestamp_str: str,
        variable: str = "temperature",
        depth_m: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates the synchronous 4D state of all observation platforms and model fields at the given timestamp.
        """
        try:
            target_dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except Exception:
            target_dt = datetime.utcnow()

        start_dt = datetime.fromisoformat(cls.START_DATE.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(cls.END_DATE.replace("Z", "+00:00"))

        # Compute normalized time progress [0.0 to 1.0]
        total_seconds = (end_dt - start_dt).total_seconds()
        elapsed_seconds = (target_dt - start_dt).total_seconds()
        t_norm = max(0.0, min(1.0, elapsed_seconds / total_seconds if total_seconds > 0 else 1.0))

        # 1. Interpolated Argo Floats
        argo_platforms = [
            {
                "wmo_id": "1902670",
                "name": "Apex #1902670 (Bay of Bengal)",
                "lat": round(13.82 + (14.285 - 13.82) * t_norm, 3),
                "lon": round(86.99 + (87.450 - 86.99) * t_norm, 3),
                "depth_current": round(1000.0 * math.sin(t_norm * math.pi * 3.5)**2, 1),
                "cycle": int(8 + 3 * t_norm),
                "temp": round(29.5 - 0.58 * t_norm, 2),
                "sal": round(33.42 - 0.24 * t_norm, 2),
                "status": "Drifting" if t_norm < 0.8 else "Ascending",
                "trail": [
                    {"lat": 13.82, "lon": 86.99, "t": 0.0},
                    {"lat": 13.98, "lon": 87.15, "t": 0.3},
                    {"lat": 14.12, "lon": 87.31, "t": 0.6},
                    {"lat": round(13.82 + (14.285 - 13.82) * t_norm, 3), "lon": round(86.99 + (87.450 - 86.99) * t_norm, 3), "t": t_norm}
                ]
            },
            {
                "wmo_id": "2902224",
                "name": "Apex #2902224 (Central Indian)",
                "lat": round(-22.80 + (-22.45 - -22.80) * t_norm, 3),
                "lon": round(74.20 + (74.82 - 74.20) * t_norm, 3),
                "depth_current": round(2000.0 * math.cos(t_norm * math.pi * 2.0)**2, 1),
                "cycle": int(248 + 4 * t_norm),
                "temp": round(21.2 + 0.3 * t_norm, 2),
                "sal": round(35.38 + 0.02 * t_norm, 2),
                "status": "Parked (1000m)",
                "trail": [
                    {"lat": -22.80, "lon": 74.20, "t": 0.0},
                    {"lat": -22.62, "lon": 74.50, "t": 0.5},
                    {"lat": round(-22.80 + (-22.45 - -22.80) * t_norm, 3), "lon": round(74.20 + (74.82 - 74.20) * t_norm, 3), "t": t_norm}
                ]
            },
            {
                "wmo_id": "7902190",
                "name": "Argo #7902190 (North BoB)",
                "lat": round(19.40 + (19.82 - 19.40) * t_norm, 3),
                "lon": round(88.80 + (89.21 - 88.80) * t_norm, 3),
                "depth_current": round(1500.0 * math.sin(t_norm * math.pi * 4.0)**2, 1),
                "cycle": int(1 + 3 * t_norm),
                "temp": round(30.1 - 0.3 * t_norm, 2),
                "sal": round(32.7 + 0.2 * t_norm, 2),
                "status": "Transmitting",
                "trail": [
                    {"lat": 19.40, "lon": 88.80, "t": 0.0},
                    {"lat": 19.60, "lon": 89.00, "t": 0.5},
                    {"lat": round(19.40 + (19.82 - 19.40) * t_norm, 3), "lon": round(88.80 + (89.21 - 88.80) * t_norm, 3), "t": t_norm}
                ]
            },
            {
                "wmo_id": "2901540",
                "name": "Apex #2901540 (West Arabian Sea)",
                "lat": round(16.10 + (16.45 - 16.10) * t_norm, 3),
                "lon": round(60.60 + (61.20 - 60.60) * t_norm, 3),
                "depth_current": round(1000.0 * math.sin(t_norm * math.pi * 2.5)**2, 1),
                "cycle": int(85 + 4 * t_norm),
                "temp": round(27.4 + 0.45 * t_norm, 2),
                "sal": round(36.15 + 0.05 * t_norm, 2),
                "status": "Drifting",
                "trail": [
                    {"lat": 16.10, "lon": 60.60, "t": 0.0},
                    {"lat": 16.28, "lon": 60.90, "t": 0.5},
                    {"lat": round(16.10 + (16.45 - 16.10) * t_norm, 3), "lon": round(60.60 + (61.20 - 60.60) * t_norm, 3), "t": t_norm}
                ]
            }
        ]

        # 2. Interpolated Glider Missions (Sawtooth Dive Profile)
        glider_platforms = [
            {
                "id": "SG-642",
                "name": "Slocum G3 #642 (BoB Transect)",
                "lat": round(11.20 + (11.85 - 11.20) * t_norm, 3),
                "lon": round(81.80 + (82.40 - 81.80) * t_norm, 3),
                "dive_depth": round(500.0 * abs(math.sin(t_norm * math.pi * 12.0)), 1),
                "battery": round(88 - 14 * t_norm, 1),
                "temp": round(29.1 - 0.2 * t_norm, 2),
                "sal": round(33.4 + 0.2 * t_norm, 2)
            },
            {
                "id": "SG-591",
                "name": "SeaExplorer #591 (Arabian Sea OMZ)",
                "lat": round(16.50 + (17.20 - 16.50) * t_norm, 3),
                "lon": round(67.20 + (68.10 - 67.20) * t_norm, 3),
                "dive_depth": round(700.0 * abs(math.sin(t_norm * math.pi * 10.0)), 1),
                "battery": round(65 - 17 * t_norm, 1),
                "temp": round(28.4 - 0.2 * t_norm, 2),
                "sal": round(36.4 - 0.1 * t_norm, 2)
            }
        ]

        # 3. Moored Buoys (Real-time diurnal cycle)
        hour_of_day = target_dt.hour + target_dt.minute / 60.0
        diurnal_temp = 0.6 * math.sin((hour_of_day - 6.0) * math.pi / 12.0)

        buoy_platforms = [
            {
                "id": "OMNI-BD08",
                "name": "OMNI BoB Central (18.2°N, 89.7°E)",
                "lat": 18.2, "lon": 89.7,
                "sst": round(29.2 + diurnal_temp, 2),
                "wind": round(12.0 + 2.5 * math.sin(t_norm * math.pi * 6.0), 1),
                "wave": round(1.7 + 0.4 * math.sin(t_norm * math.pi * 4.0), 2)
            },
            {
                "id": "OMNI-AD06",
                "name": "OMNI Arabian Sea (18.5°N, 67.5°E)",
                "lat": 18.5, "lon": 67.5,
                "sst": round(27.8 + diurnal_temp, 2),
                "wind": round(15.5 + 3.0 * math.sin(t_norm * math.pi * 5.0), 1),
                "wave": round(2.3 + 0.5 * math.sin(t_norm * math.pi * 5.0), 2)
            }
        ]

        # 4. Summary dynamic statistics for 4D dashboard
        return {
            "timestamp": target_dt.isoformat(),
            "time_progress_pct": round(t_norm * 100, 1),
            "variable": variable,
            "depth_m": depth_m,
            "argo_floats": argo_platforms,
            "gliders": glider_platforms,
            "buoys": buoy_platforms,
            "active_platforms_count": len(argo_platforms) + len(glider_platforms) + len(buoy_platforms),
            "mean_basin_temp": round(28.6 + 0.3 * math.sin(t_norm * math.pi * 2.0), 2),
            "mean_basin_sal": round(34.8 + 0.1 * math.cos(t_norm * math.pi * 2.0), 2),
            "current_monsoon_phase": "Southwest (Summer) Monsoon Jet Flow",
            "wyrtki_jet_velocity": round(0.92 + 0.25 * math.sin(t_norm * math.pi * 3.0), 2)
        }

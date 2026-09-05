import time
from typing import Dict, Any, List, Optional
from app.schemas.copilot import ToolCallRecord, ProvenanceType

# Centralized Application Capability & Routing Map
APPLICATION_ROUTES: Dict[str, Dict[str, str]] = {
    "dashboard": {"route": "/dashboard", "name": "Main Dashboard"},
    "ocean_explorer": {"route": "/explorer", "name": "3D Ocean Explorer"},
    "3d": {"route": "/3d", "name": "3D View"},
    "4d": {"route": "/4d", "name": "4D Temporal & Depth View"},
    "datasets": {"route": "/datasets", "name": "Dataset Catalog"},
    "observations": {"route": "/observations", "name": "In-Situ Observations"},
    "argo": {"route": "/argo", "name": "Argo Profiling Floats"},
    "gliders": {"route": "/gliders", "name": "Autonomous Gliders"},
    "buoys": {"route": "/buoys", "name": "Moored Buoy Network"},
    "ctd": {"route": "/ctd", "name": "CTD Hydrographic Casts"},
    "adcp": {"route": "/adcp", "name": "ADCP Current Profiler"},
    "satellite": {"route": "/satellite", "name": "Satellite Collocation"},
    "models": {"route": "/models", "name": "Hydrodynamic Models Overview"},
    "hycom": {"route": "/models/hycom", "name": "HYCOM 1/12° Model"},
    "roms": {"route": "/models/roms", "name": "ROMS 1/24° Model"},
    "nemo": {"route": "/models/nemo", "name": "NEMO 1/4° Model"},
    "comparison": {"route": "/comparison", "name": "Model Intercomparison"},
    "accuracy": {"route": "/accuracy", "name": "Model Accuracy Analysis"},
    "errors": {"route": "/errors", "name": "Observation Error Analysis"},
    "anomalies": {"route": "/anomalies", "name": "Ocean Anomaly & MHW Detection"},
    "statistics": {"route": "/analysis", "name": "Basin Statistics & Quantiles"},
    "eddies": {"route": "/eddies", "name": "Mesoscale Eddy Tracker"},
    "bgc": {"route": "/bgc", "name": "Biogeochemistry & OMZ Hypoxia"},
    "routing": {"route": "/routing", "name": "Maritime Weather Routing"},
    "ml_forecast": {"route": "/ml-forecast", "name": "Physics-Informed ML Forecast"},
    "disaster_surge": {"route": "/disaster-surge", "name": "Coastal Inundation & Storm Surge Warning"},
    "student": {"route": "/student", "name": "Student Educational Workspace"},
    "researcher": {"route": "/researcher", "name": "Researcher Workspace"},
    "admin": {"route": "/admin", "name": "Admin Control Panel"},
    "export": {"route": "/export", "name": "Scientific Data Export"},
    "settings": {"route": "/settings", "name": "Application Settings"},
}

REGION_BOUNDS = {
    "arabian_sea": {"name": "Arabian Sea", "latitude": 16.0, "longitude": 64.0, "altitude_m": 2200000.0},
    "bay_of_bengal": {"name": "Bay of Bengal", "latitude": 15.0, "longitude": 88.0, "altitude_m": 2200000.0},
    "equatorial_io": {"name": "Equatorial Indian Ocean", "latitude": 0.0, "longitude": 80.0, "altitude_m": 3500000.0},
    "sri_lanka": {"name": "Sri Lanka & Southern Tip", "latitude": 7.5, "longitude": 81.0, "altitude_m": 900000.0},
    "somali_coast": {"name": "Somali Current Upwelling", "latitude": 8.5, "longitude": 52.0, "altitude_m": 1200000.0},
    "maldives": {"name": "Maldives Archipelago", "latitude": 3.2, "longitude": 73.2, "altitude_m": 800000.0},
    "andaman_sea": {"name": "Andaman Sea & Nicobar", "latitude": 11.5, "longitude": 94.0, "altitude_m": 1100000.0},
    "whole_indian_ocean": {"name": "Indian Ocean Basin", "latitude": 5.0, "longitude": 78.0, "altitude_m": 9500000.0},
}


class CopilotToolRegistry:
    """
    Centralized BlueSphere Application & Scientific Tool Registry.
    Executes existing backend scientific engines and returns validated results.
    Zero arbitrary SQL, shell execution, or client-side code generation.
    """

    @classmethod
    def get_tool_definitions(cls) -> List[Dict[str, Any]]:
        return [
            # 1. Application-Level Navigation Tool
            {
                "type": "function",
                "function": {
                    "name": "navigate_to_page",
                    "description": "Navigate the BlueSphere web application to any page, view, or analysis module (e.g. 3D, 4D, error analysis, model comparison, eddy tracker, routing, biogeochemistry, ML forecast, disaster surge, etc.).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "page_name": {
                                "type": "string",
                                "enum": list(APPLICATION_ROUTES.keys()),
                                "description": "Identifier of the target page or view"
                            }
                        },
                        "required": ["page_name"]
                    }
                }
            },
            # 2. Cesium 3D Globe Navigation
            {
                "type": "function",
                "function": {
                    "name": "go_to_region",
                    "description": "Navigate Cesium 3D camera to a key Indian Ocean geographical basin (e.g. Arabian Sea, Bay of Bengal, Sri Lanka, Somali Coast).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "region_name": {
                                "type": "string",
                                "enum": list(REGION_BOUNDS.keys()),
                                "description": "Target basin identifier"
                            }
                        },
                        "required": ["region_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "go_to_location",
                    "description": "Navigate Cesium 3D camera to specific latitude, longitude, and altitude coordinates.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "latitude": {"type": "number", "minimum": -90.0, "maximum": 90.0},
                            "longitude": {"type": "number", "minimum": -180.0, "maximum": 180.0},
                            "altitude_m": {"type": "number", "minimum": 100.0, "maximum": 50000000.0}
                        },
                        "required": ["latitude", "longitude"]
                    }
                }
            },
            # 3. Layer and Visualization Control
            {
                "type": "function",
                "function": {
                    "name": "set_active_layer",
                    "description": "Toggle visibility of a 3D GIS layer (eddies, omz, temperature, salinity, currents, argo, cyclone_tracks, particles).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "layer_name": {"type": "string", "enum": ["eddies", "omz", "temperature", "salinity", "currents", "argo", "cyclone_tracks", "particles"]},
                            "visible": {"type": "boolean"}
                        },
                        "required": ["layer_name", "visible"]
                    }
                }
            },
            # 4. 4D Temporal & Depth View Control
            {
                "type": "function",
                "function": {
                    "name": "control_4d_view",
                    "description": "Control 4D ocean temporal and depth exploration (set variable, set depth level, or navigate to 4D).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "variable": {"type": "string", "enum": ["temperature", "salinity", "currents", "ssh"]},
                            "depth_m": {"type": "number", "description": "Target depth in meters (e.g. 0, 50, 100, 200, 500)"},
                            "action": {"type": "string", "enum": ["open", "play", "pause", "set_state"]}
                        }
                    }
                }
            },
            # 5. Scientific Model Intercomparison
            {
                "type": "function",
                "function": {
                    "name": "run_model_intercomparison",
                    "description": "Compute spatial hydrodynamic difference field and statistical discrepancy metrics (Bias, RMSE, Pearson r) between two numerical models (HYCOM, ROMS, NEMO).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "model_a": {"type": "string", "enum": ["hycom", "roms", "nemo"]},
                            "model_b": {"type": "string", "enum": ["hycom", "roms", "nemo"]},
                            "variable": {"type": "string", "enum": ["temperature", "salinity", "currents", "ssh"], "default": "temperature"},
                            "depth": {"type": "number", "default": 0.0, "description": "Depth level in meters"},
                            "region": {"type": "string", "default": "indian_ocean"}
                        },
                        "required": ["model_a", "model_b"]
                    }
                }
            },
            # 6. Error Analysis Tool
            {
                "type": "function",
                "function": {
                    "name": "run_error_analysis",
                    "description": "Execute spatial and temporal observation-vs-model error analysis (Bias, RMSE, regional hotspot ranking, outlier detection).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "model": {"type": "string", "enum": ["hycom", "roms", "nemo"], "default": "hycom"},
                            "variable": {"type": "string", "enum": ["temperature", "salinity"], "default": "temperature"},
                            "depth": {"type": "number", "default": 0.0},
                            "region": {"type": "string", "default": "indian_ocean"}
                        }
                    }
                }
            },
            # 7. Accuracy Breakdown
            {
                "type": "function",
                "function": {
                    "name": "get_accuracy_analysis",
                    "description": "Retrieve comprehensive model skill scores (RMSE, Bias, Pearson r, Taylor Skill score) against in-situ Argo observations.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "model": {"type": "string", "enum": ["hycom", "roms", "nemo"], "default": "hycom"},
                            "variable": {"type": "string", "default": "temperature"},
                            "basin": {"type": "string", "default": "indian_ocean"}
                        }
                    }
                }
            },
            # 8. Anomaly Detection
            {
                "type": "function",
                "function": {
                    "name": "get_anomaly_analysis",
                    "description": "Detect and track oceanographic anomalies (Marine Heatwaves Cat I-IV, extreme salinity excursions, thermal inversions).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "variable": {"type": "string", "enum": ["temperature", "salinity", "all"], "default": "temperature"},
                            "region": {"type": "string", "default": "indian_ocean"},
                            "depth": {"type": "number", "default": 0.0}
                        }
                    }
                }
            },
            # 9. Mesoscale Eddy Kinematics
            {
                "type": "function",
                "function": {
                    "name": "get_eddies",
                    "description": "Search and track active cyclonic/anticyclonic mesoscale ocean eddies identified by Okubo-Weiss vortex criterion.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "region": {"type": "string", "description": "Optional basin filter: arabian_sea, bay_of_bengal, sri_lanka, etc."},
                            "eddy_type": {"type": "string", "enum": ["ALL", "CYCLONIC", "ANTICYCLONIC"]}
                        }
                    }
                }
            },
            # 10. Biogeochemistry & OMZ
            {
                "type": "function",
                "function": {
                    "name": "get_omz",
                    "description": "Query Oxygen Minimum Zone (OMZ hypoxia < 60 µmol/kg) spatial boundaries and volume in the Arabian Sea / Bay of Bengal.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "basin": {"type": "string", "description": "arabian_sea or bay_of_bengal", "default": "arabian_sea"},
                            "depth_m": {"type": "number", "default": 200.0}
                        }
                    }
                }
            },
            # 11. Maritime Routing
            {
                "type": "function",
                "function": {
                    "name": "optimize_maritime_route",
                    "description": "Calculate minimum-fuel, current and wave-optimized vessel passage across Indian Ocean sea lanes.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "origin_port": {"type": "string", "default": "Chennai"},
                            "dest_port": {"type": "string", "default": "Singapore"},
                            "vessel_type": {"type": "string", "enum": ["container_ultra", "tanker_vlcc", "bulk_carrier", "research_vessel"]}
                        },
                        "required": ["origin_port", "dest_port"]
                    }
                }
            },
            # 12. ML Forecast
            {
                "type": "function",
                "function": {
                    "name": "get_ml_forecast",
                    "description": "Query physics-informed neural surrogate model for fast ocean state prediction (+24h, +48h, +72h).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "variable": {"type": "string", "enum": ["temperature", "salinity", "ssh", "d20_thermocline"]},
                            "lead_time_hours": {"type": "integer", "enum": [12, 24, 48, 72, 120], "default": 24}
                        }
                    }
                }
            },
            # 13. Disaster & Storm Surge
            {
                "type": "function",
                "function": {
                    "name": "get_active_disasters",
                    "description": "Query active tropical cyclones, storm surge inundation heights, and coastal threat classifications.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "basin": {"type": "string", "description": "Optional basin filter: arabian_sea, bay_of_bengal"}
                        }
                    }
                }
            }
        ]

    @classmethod
    def execute_tool(cls, tool_name: str, tool_args: Dict[str, Any]) -> ToolCallRecord:
        start_t = time.perf_counter()
        
        try:
            # 1. Application Page Navigation
            if tool_name == "navigate_to_page":
                p_name = str(tool_args.get("page_name", "dashboard")).lower().strip()
                target_info = APPLICATION_ROUTES.get(p_name, APPLICATION_ROUTES["dashboard"])
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result={
                        "page_name": p_name,
                        "name": target_info["name"],
                        "route": target_info["route"],
                        "status": "NAVIGATED"
                    },
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 2. Cesium 3D Globe Navigation
            elif tool_name == "go_to_region":
                r_key = str(tool_args.get("region_name", "arabian_sea")).lower().replace(" ", "_").replace("-", "_")
                if "sri" in r_key or "ceylon" in r_key:
                    r_key = "sri_lanka"
                elif "arab" in r_key:
                    r_key = "arabian_sea"
                elif "bengal" in r_key:
                    r_key = "bay_of_bengal"
                elif "somal" in r_key:
                    r_key = "somali_coast"
                elif "maldiv" in r_key:
                    r_key = "maldives"
                elif "andaman" in r_key:
                    r_key = "andaman_sea"

                region_info = REGION_BOUNDS.get(r_key, REGION_BOUNDS["arabian_sea"])
                res = {
                    "region": r_key,
                    "name": region_info["name"],
                    "latitude": region_info["latitude"],
                    "longitude": region_info["longitude"],
                    "altitude_m": region_info["altitude_m"],
                }
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=res,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "go_to_location":
                res = {
                    "latitude": float(tool_args.get("latitude", 12.0)),
                    "longitude": float(tool_args.get("longitude", 78.0)),
                    "altitude_m": float(tool_args.get("altitude_m", 1500000.0))
                }
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=res,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "set_active_layer":
                layer = str(tool_args.get("layer_name", "eddies")).lower()
                vis = bool(tool_args.get("visible", True))
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result={"layer": layer, "visible": vis, "status": "updated"},
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "control_4d_view":
                var = str(tool_args.get("variable", "temperature")).lower()
                depth = float(tool_args.get("depth_m", 50.0))
                action = str(tool_args.get("action", "open")).lower()
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result={
                        "route": "/4d",
                        "variable": var,
                        "depth_m": depth,
                        "action": action,
                        "status": "VIEW_UPDATED"
                    },
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 3. Model Intercomparison
            elif tool_name == "run_model_intercomparison":
                from app.services.inter_comparison_engine import InterComparisonEngine
                m_a = str(tool_args.get("model_a", "hycom")).lower()
                m_b = str(tool_args.get("model_b", "roms")).lower()
                if m_a == m_b:
                    m_b = "roms" if m_a == "hycom" else "hycom"

                inter_data = InterComparisonEngine.run_inter_comparison(
                    model_a=m_a,
                    model_b=m_b,
                    variable=tool_args.get("variable", "temperature"),
                    depth_m=float(tool_args.get("depth", 0.0) or 0.0),
                    region=tool_args.get("region", "indian_ocean")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=inter_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 4. Error Analysis
            elif tool_name == "run_error_analysis":
                from app.services.error_engine import ErrorAnalysisEngine
                err_data = ErrorAnalysisEngine.compute_spatial_temporal_errors(
                    model=tool_args.get("model", "hycom"),
                    variable=tool_args.get("variable", "temperature"),
                    depth=float(tool_args.get("depth", 0.0) or 0.0),
                    region=tool_args.get("region", "indian_ocean")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=err_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 5. Accuracy Breakdown
            elif tool_name == "get_accuracy_analysis":
                from app.services.accuracy_engine import AccuracyEngine
                acc_data = AccuracyEngine.compute_accuracy_breakdown(
                    model=tool_args.get("model", "hycom"),
                    variable=tool_args.get("variable", "temperature"),
                    region=tool_args.get("basin", "indian_ocean")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=acc_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 6. Anomaly Detection
            elif tool_name == "get_anomaly_analysis":
                from app.services.anomaly_engine import AnomalyDetectionEngine
                anom_data = AnomalyDetectionEngine.detect_anomalies(
                    variable=tool_args.get("variable", "temperature"),
                    region=tool_args.get("region", "indian_ocean"),
                    depth=float(tool_args.get("depth", 0.0) or 0.0)
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=anom_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 7. Eddies
            elif tool_name == "get_eddies":
                from app.services.eddy_engine import eddy_engine
                eddies_data = eddy_engine.get_active_eddies(
                    region=tool_args.get("region"),
                    eddy_type=tool_args.get("eddy_type", "ALL")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=eddies_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 8. Biogeochemistry & OMZ
            elif tool_name == "get_omz":
                from app.services.bgc_engine import bgc_engine
                omz_data = bgc_engine.get_omz_extent(
                    basin=tool_args.get("basin", "arabian_sea"),
                    depth_m=float(tool_args.get("depth_m", 200.0) or 200.0)
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=omz_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 9. Maritime Routing
            elif tool_name == "optimize_maritime_route":
                from app.services.routing_engine import routing_engine
                route_data = routing_engine.calculate_optimal_route(
                    origin=tool_args.get("origin_port", "Chennai"),
                    destination=tool_args.get("dest_port", "Singapore"),
                    vessel_type=tool_args.get("vessel_type", "container_ultra")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=route_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 10. ML Forecast
            elif tool_name == "get_ml_forecast":
                from app.services.ml_forecast_engine import ml_forecast_engine
                forecast_data = ml_forecast_engine.get_prediction(
                    variable=tool_args.get("variable", "temperature"),
                    lead_time_hours=int(tool_args.get("lead_time_hours", 24) or 24)
                )
                status_val = "MODEL_NOT_CONFIGURED" if forecast_data.get("status") == "MODEL_NOT_CONFIGURED" else "SUCCESS"
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=forecast_data,
                    provenance=ProvenanceType.FORECAST,
                    status=status_val,
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 11. Disaster Management
            elif tool_name == "get_active_disasters":
                from app.services.disaster_engine import disaster_engine
                disaster_data = disaster_engine.get_active_threats(basin=tool_args.get("basin"))
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=disaster_data,
                    provenance=ProvenanceType.MODEL_OUTPUT,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            else:
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result={"error": f"Unknown tool: {tool_name}"},
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="ERROR",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

        except Exception as ex:
            return ToolCallRecord(
                tool_name=tool_name,
                tool_args=tool_args,
                tool_result={"error": str(ex)},
                provenance=ProvenanceType.DERIVED_ANALYSIS,
                status="ERROR",
                execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
            )

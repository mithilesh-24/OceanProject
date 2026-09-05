import time
from typing import Dict, Any, List, Tuple
from app.schemas.copilot import ToolCallRecord, ProvenanceType

# Region coordinates map for safe navigation
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
    Controlled AI Tool Execution Registry.
    Executes existing backend scientific engines and strictly returns typed, validated results.
    Zero arbitrary SQL, code execution, or direct DB mutation permitted.
    """

    @classmethod
    def get_tool_definitions(cls) -> List[Dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": "go_to_region",
                    "description": "Navigate Cesium 3D camera to a key Indian Ocean geographical region.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "region_name": {
                                "type": "string",
                                "enum": list(REGION_BOUNDS.keys()),
                                "description": "Target oceanographic basin identifier"
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
                            "altitude_m": {"type": "number", "minimum": 100.0, "maximum": 40000000.0}
                        },
                        "required": ["latitude", "longitude"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_eddies",
                    "description": "Phase 26: Search and track active cyclonic/anticyclonic mesoscale ocean eddies identified by Okubo-Weiss vortex criterion.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "region": {"type": "string", "description": "Optional region filter: arabian_sea, bay_of_bengal, sri_lanka, etc."},
                            "eddy_type": {"type": "string", "enum": ["ALL", "CYCLONIC", "ANTICYCLONIC"]}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_bgc_parameters",
                    "description": "Phase 27: Retrieve biogeochemical parameters including Dissolved Oxygen, Aragonite saturation state, and pH.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "region": {"type": "string", "description": "Regional basin: arabian_sea, bay_of_bengal, etc."}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_omz",
                    "description": "Phase 27: Query Oxygen Minimum Zone (OMZ hypoxia < 60 µmol/kg) spatial boundaries and volume in the Arabian Sea / Bay of Bengal.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "basin": {"type": "string", "description": "arabian_sea or bay_of_bengal"},
                            "depth_m": {"type": "number", "description": "Depth slice in meters (default 200m)"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "optimize_maritime_route",
                    "description": "Phase 28: Calculate minimum-fuel, weather-optimized vessel passage considering ocean currents and wave resistance.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "origin_port": {"type": "string", "description": "Origin port name (e.g., Chennai, Mumbai, Singapore, Colombo)"},
                            "dest_port": {"type": "string", "description": "Destination port name"},
                            "vessel_type": {"type": "string", "enum": ["container_ultra", "tanker_vlcc", "bulk_carrier", "research_vessel"]}
                        },
                        "required": ["origin_port", "dest_port"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_ml_forecast",
                    "description": "Phase 29: Query physics-informed neural surrogate model for fast ocean state prediction (+24h, +48h, +72h).",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "variable": {"type": "string", "enum": ["temperature", "salinity", "ssh", "d20_thermocline"]},
                            "lead_time_hours": {"type": "integer", "enum": [12, 24, 48, 72]}
                        },
                        "required": ["variable"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_active_disasters",
                    "description": "Phase 30: Query active tropical cyclones, storm surge inundation models, and coastal threat classifications.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "basin": {"type": "string", "description": "Optional basin filter: arabian_sea, bay_of_bengal"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "run_model_intercomparison",
                    "description": "Compare two numerical hydrodynamic models (e.g., HYCOM vs ROMS) across temperature or salinity fields.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "model_a": {"type": "string", "enum": ["hycom", "roms", "nemo"]},
                            "model_b": {"type": "string", "enum": ["hycom", "roms", "nemo"]},
                            "variable": {"type": "string", "enum": ["temperature", "salinity"]},
                            "depth": {"type": "number", "default": 0}
                        },
                        "required": ["model_a", "model_b", "variable"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_accuracy_analysis",
                    "description": "Retrieve comprehensive model accuracy scores (RMSE, Bias, Pearson r, Taylor Skill) against in-situ Argo observations.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "model": {"type": "string", "enum": ["hycom", "roms", "nemo"]},
                            "basin": {"type": "string", "default": "indian_ocean"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_anomaly_analysis",
                    "description": "Detect oceanographic anomalies such as Marine Heatwaves (MHW Cat I-IV) or low-salinity freshwater plumes.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "anomaly_type": {"type": "string", "enum": ["all", "mhw", "salinity", "sla"]}
                        }
                    }
                }
            }
        ]

    @classmethod
    def execute_tool(cls, tool_name: str, tool_args: Dict[str, Any]) -> ToolCallRecord:
        start_t = time.perf_counter()
        
        try:
            # 1. Navigation Tools
            if tool_name == "go_to_region":
                r_key = tool_args.get("region_name", "arabian_sea")
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

            # 2. Phase 26: Eddies
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

            # 3. Phase 27: Biogeochemistry
            elif tool_name == "get_bgc_parameters":
                from app.services.bgc_engine import bgc_engine
                bgc_data = bgc_engine.get_basin_parameters(region=tool_args.get("region"))
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=bgc_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "get_omz":
                from app.services.bgc_engine import bgc_engine
                omz_data = bgc_engine.get_omz_extent(
                    basin=tool_args.get("basin", "arabian_sea"),
                    depth_m=tool_args.get("depth_m", 200.0)
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=omz_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            # 4. Phase 28: Maritime Routing
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

            # 5. Phase 29: ML Forecast (With strict unconfigured check)
            elif tool_name == "get_ml_forecast":
                from app.services.ml_forecast_engine import ml_forecast_engine
                forecast_data = ml_forecast_engine.get_prediction(
                    variable=tool_args.get("variable", "temperature"),
                    lead_time_hours=tool_args.get("lead_time_hours", 24)
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

            # 6. Phase 30: Disaster Management (With official feed check)
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

            # 7. Model Intercomparison & Accuracy
            elif tool_name == "run_model_intercomparison":
                from app.services.inter_comparison_engine import inter_comparison_engine
                inter_data = inter_comparison_engine.compare_models(
                    model_a=tool_args.get("model_a", "hycom"),
                    model_b=tool_args.get("model_b", "roms"),
                    variable=tool_args.get("variable", "temperature"),
                    depth_m=tool_args.get("depth", 0)
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=inter_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "get_accuracy_analysis":
                from app.services.accuracy_engine import accuracy_engine
                acc_data = accuracy_engine.get_breakdown(
                    model=tool_args.get("model", "hycom"),
                    basin=tool_args.get("basin", "indian_ocean")
                )
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=acc_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
                    status="SUCCESS",
                    execution_time_ms=round((time.perf_counter() - start_t) * 1000, 2)
                )

            elif tool_name == "get_anomaly_analysis":
                from app.services.anomaly_engine import anomaly_engine
                anom_data = anomaly_engine.get_active_anomalies(type_filter=tool_args.get("anomaly_type"))
                return ToolCallRecord(
                    tool_name=tool_name,
                    tool_args=tool_args,
                    tool_result=anom_data,
                    provenance=ProvenanceType.DERIVED_ANALYSIS,
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

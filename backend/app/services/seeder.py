from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.dataset import Dataset, DataSource
from app.models.observation import ArgoFloat, GliderMission, MooredBuoy, CtdCast, AdcpStation
from app.models.model_data import NumericalModel
from app.models.analysis import AccuracyMetric, ErrorHotspot, AnomalyAlert, SavedWorkspace
from app.models.pipeline import IngestionPipeline, UserProfile

def init_db(db: Session):
    # Create all tables in database
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(Dataset).first():
        return

    print("[Bluesphere Seeder] Seeding Indian Ocean datasets, observations, and models...")

    # 1. Datasets
    datasets = [
        Dataset(
            id="incois_argo",
            name="INCOIS Indian Argo Float Profiles",
            provider="INCOIS / MoES",
            type="Observation",
            variables=["Temperature", "Salinity", "Pressure"],
            region="Indian Ocean (30°E–120°E)",
            time_coverage="2002 – Present",
            resolution="Point In-Situ Profiles",
            status="Online",
            protocol="ERDDAP",
            endpoint_url="https://erddap.incois.gov.in/erddap/tabledap/ArgoFloats.json"
        ),
        Dataset(
            id="hycom_global",
            name="HYCOM Global 1/12° Reanalysis & Forecast",
            provider="HYCOM Consortium / NOAA",
            type="Model",
            variables=["Temperature", "Salinity", "Velocity (u,v)", "Elevation"],
            region="Global (-80°S–90°N)",
            time_coverage="1994 – Present",
            resolution="0.08° (~8.5km) • 40 Depth Levels",
            status="Online",
            protocol="OPeNDAP",
            endpoint_url="https://tds.hycom.org/thredds/dodsC/GLBy0.08/latest"
        ),
        Dataset(
            id="roms_indian",
            name="ROMS Regional Ocean Modeling System",
            provider="INCOIS Coastal Modeling",
            type="Model",
            variables=["Temperature", "Salinity", "Currents", "SSH"],
            region="Arabian Sea & Bay of Bengal",
            time_coverage="2015 – Present",
            resolution="0.04° (~4.2km) • 32 S-Levels",
            status="Online",
            protocol="NetCDF",
            endpoint_url="http://incois.gov.in/thredds/dodsC/roms_io"
        ),
        Dataset(
            id="nemo_global",
            name="NEMO Global Ocean Circulation Engine",
            provider="Copernicus Marine / CMEMS",
            type="Model",
            variables=["Temperature", "Salinity", "Mixed Layer Depth"],
            region="Global",
            time_coverage="2000 – Present",
            resolution="0.25° (~28km) • 75 Depth Levels",
            status="Online",
            protocol="WMS",
            endpoint_url="https://nrt.cmems-du.eu/thredds/dodsC/global-analysis-forecast-phy-001-024"
        ),
        Dataset(
            id="gebco_2023",
            name="GEBCO High-Resolution Bathymetric Grid",
            provider="GEBCO / BODC",
            type="Bathymetry",
            variables=["Seafloor Depth", "Elevation"],
            region="Global Oceans",
            time_coverage="2023 Release",
            resolution="15 Arc-Second (~450m)",
            status="Online",
            protocol="WMS",
            endpoint_url="https://www.gebco.net/data_and_products/gebco_web_services/web_map_service/mapserv"
        ),
        Dataset(
            id="incois_gliders",
            name="INCOIS Autonomous Underwater Glider Transects",
            provider="INCOIS / NIOT",
            type="Observation",
            variables=["Temperature", "Salinity", "Dissolved Oxygen", "Chlorophyll"],
            region="Bay of Bengal & Equatorial Channel",
            time_coverage="2019 – Present",
            resolution="High-Density Sawtooth",
            status="Online",
            protocol="ERDDAP"
        ),
        Dataset(
            id="omni_buoys",
            name="OMNI / RAMA Deep-Sea Moored Buoys",
            provider="NIOT / INCOIS",
            type="Observation",
            variables=["SST", "Salinity", "Wind Speed", "Air Pressure", "Radiation"],
            region="Tropical Indian Ocean",
            time_coverage="1997 – Present",
            resolution="Hourly Time-Series",
            status="Online",
            protocol="Satellite Relay"
        ),
    ]
    db.add_all(datasets)

    # 2. Numerical Models
    models = [
        NumericalModel(
            id="hycom",
            name="HYCOM 1/12° Global Ocean Model",
            resolution="1/12° (~8.5 km)",
            levels_count=40,
            coordinate_type="Hybrid (Isopycnal / Sigma / Z-Level)",
            provider="HYCOM Consortium / NOAA NCODA",
            description="Hybrid Coordinate Ocean Model resolving eddy-permitting circulation and thermohaline stratification.",
            update_frequency="3-Hourly / Daily",
            skill_score=0.964,
            parameters={"temp_min": -2.0, "temp_max": 34.0, "sal_min": 25.0, "sal_max": 40.0},
            layers_metadata=[
                {"layer": 1, "depth_m": 0, "name": "Surface"},
                {"layer": 5, "depth_m": 25, "name": "Upper Mixed"},
                {"layer": 10, "depth_m": 50, "name": "Mixed Layer Base"},
                {"layer": 15, "depth_m": 100, "name": "Upper Thermocline"},
                {"layer": 20, "depth_m": 200, "name": "Core Thermocline"},
                {"layer": 30, "depth_m": 500, "name": "Intermediate"},
                {"layer": 40, "depth_m": 2000, "name": "Deep Abyssal"}
            ]
        ),
        NumericalModel(
            id="roms",
            name="ROMS Regional Ocean Modeling System",
            resolution="1/24° (~4.2 km)",
            levels_count=32,
            coordinate_type="Terrain-Following S-Coordinates",
            provider="INCOIS Coastal Modeling Division",
            description="Hydrostatic primitive equation model tailored for coastal upwelling, tidal shelf mixing, and boundary currents.",
            update_frequency="Hourly / Daily",
            skill_score=0.978,
            parameters={"temp_min": 0.0, "temp_max": 35.0, "sal_min": 20.0, "sal_max": 41.0},
            layers_metadata=[{"s_level": i, "desc": f"Terrain-following layer {i}"} for i in range(1, 33)]
        ),
        NumericalModel(
            id="nemo",
            name="NEMO Global Ocean Physics",
            resolution="1/4° (~28 km)",
            levels_count=75,
            coordinate_type="Partial Step z-Star (z*) Coordinates",
            provider="Copernicus Marine / CMEMS",
            description="European community ocean engine simulating global multi-decadal thermohaline circulation.",
            update_frequency="Daily / Monthly",
            skill_score=0.952,
            parameters={"temp_min": -2.5, "temp_max": 33.0, "sal_min": 28.0, "sal_max": 39.0},
            layers_metadata=[{"level": i, "depth_range": f"Level {i}"} for i in range(1, 76)]
        )
    ]
    db.add_all(models)

    # 3. Argo Floats
    now = datetime.utcnow()
    argo_floats = [
        ArgoFloat(
            wmo_id="1902670",
            basin="Bay of Bengal (Central)",
            latitude=14.285,
            longitude=87.450,
            cycle_number=11,
            last_transmission=now - timedelta(hours=3),
            surface_temp=28.92,
            surface_sal=33.18,
            max_depth=2000.0,
            status="Active (Ascending)",
            battery_state=94.0,
            institution="INCOIS",
            profile_data={"depths": [0, 10, 25, 50, 75, 100, 150, 200, 500, 1000, 2000], "temp": [28.92, 28.90, 28.85, 27.2, 24.1, 21.0, 16.5, 14.2, 10.1, 6.5, 2.4], "sal": [33.18, 33.20, 33.45, 34.1, 34.8, 35.0, 35.1, 35.05, 35.0, 34.8, 34.7]}
        ),
        ArgoFloat(
            wmo_id="2902224",
            basin="Southern Indian Ocean",
            latitude=-22.450,
            longitude=74.820,
            cycle_number=252,
            last_transmission=now - timedelta(hours=14),
            surface_temp=21.50,
            surface_sal=35.40,
            max_depth=2000.0,
            status="Active (Parked)",
            battery_state=78.0,
            institution="Coriolis GDAC"
        ),
        ArgoFloat(
            wmo_id="7902190",
            basin="Northern Bay of Bengal",
            latitude=19.820,
            longitude=89.210,
            cycle_number=4,
            last_transmission=now - timedelta(hours=1),
            surface_temp=29.80,
            surface_sal=32.90,
            max_depth=1500.0,
            status="Active (Transmitting)",
            battery_state=99.0,
            institution="INCOIS"
        ),
        ArgoFloat(
            wmo_id="2901540",
            basin="Arabian Sea (West)",
            latitude=16.450,
            longitude=61.200,
            cycle_number=89,
            last_transmission=now - timedelta(days=2),
            surface_temp=27.85,
            surface_sal=36.20,
            max_depth=2000.0,
            status="Active (Drifting)",
            battery_state=86.0,
            institution="INCOIS"
        ),
        ArgoFloat(
            wmo_id="1901842",
            basin="Equatorial Indian Ocean",
            latitude=0.120,
            longitude=80.540,
            cycle_number=142,
            last_transmission=now - timedelta(days=1),
            surface_temp=28.75,
            surface_sal=34.80,
            max_depth=2000.0,
            status="Active (Descending)",
            battery_state=91.0,
            institution="INCOIS"
        )
    ]
    db.add_all(argo_floats)

    # 4. Glider Missions
    gliders = [
        GliderMission(
            id="SG-642",
            platform_name="Slocum G3 Glider #642",
            mission_name="South-West BoB Coastal Transect",
            latitude=11.85,
            longitude=82.40,
            dives_completed=342,
            depth_range="0 - 1000 m",
            battery_pct=74,
            sensors="CTD, DO, Backscatter, Chl-a",
            status="Active Sawtooth Dive"
        ),
        GliderMission(
            id="SG-591",
            platform_name="SeaExplorer Glider #591",
            mission_name="Arabian Sea Oxygen Minimum Zone Survey",
            latitude=17.20,
            longitude=68.10,
            dives_completed=618,
            depth_range="0 - 700 m",
            battery_pct=48,
            sensors="CTD, Dissolved Oxygen, Nitrate",
            status="Active Sawtooth Dive"
        ),
        GliderMission(
            id="SG-704",
            platform_name="Seaglider #704",
            mission_name="Equatorial Current Boundary Transect",
            latitude=0.40,
            longitude=85.10,
            dives_completed=120,
            depth_range="0 - 1000 m",
            battery_pct=91,
            sensors="CTD, Microstructure Turbulence",
            status="Deploy Phase"
        )
    ]
    db.add_all(gliders)

    # 5. Moored Buoys
    buoys = [
        MooredBuoy(
            station_id="OMNI-BD08",
            network="INCOIS OMNI Moored Array",
            location_name="Central Bay of Bengal (18.2°N, 89.7°E)",
            latitude=18.2,
            longitude=89.7,
            sst=29.40,
            air_temp=28.10,
            wind_speed=12.4,
            wave_height=1.8,
            status="Online (Transmitting)"
        ),
        MooredBuoy(
            station_id="OMNI-AD06",
            network="INCOIS OMNI Moored Array",
            location_name="Eastern Arabian Sea (18.5°N, 67.5°E)",
            latitude=18.5,
            longitude=67.5,
            sst=27.95,
            air_temp=27.20,
            wind_speed=16.2,
            wave_height=2.4,
            status="Online (Transmitting)"
        ),
        MooredBuoy(
            station_id="RAMA-23001",
            network="RAMA Tropical Mooring Array",
            location_name="Equatorial Indian Ocean (0.0°N, 80.5°E)",
            latitude=0.0,
            longitude=80.5,
            sst=28.80,
            air_temp=27.90,
            wind_speed=8.5,
            wave_height=1.2,
            status="Online (Transmitting)"
        ),
        MooredBuoy(
            station_id="COASTAL-CB02",
            network="Coastal Met-Ocean Network",
            location_name="Off Visakhapatnam Coast (17.6°N, 83.3°E)",
            latitude=17.6,
            longitude=83.3,
            sst=29.10,
            air_temp=28.80,
            wind_speed=9.0,
            wave_height=0.9,
            status="Online (Transmitting)"
        )
    ]
    db.add_all(buoys)

    # 6. CTD Casts & ADCP Stations
    ctds = [
        CtdCast(
            cast_id="CTD-SAGAR-2026-041",
            vessel="ORV Sagar Kanya",
            station_name="Stn #14 (BoB Central)",
            latitude=15.50,
            longitude=88.00,
            max_depth=3800.0,
            bottles_count=24,
            parameters="Conductivity, Temp, Pressure, DO, Fluorescence",
            cruise_date=now - timedelta(days=12),
            qc_status="Quality Controlled (QC-1)"
        ),
        CtdCast(
            cast_id="CTD-NIDHI-2026-112",
            vessel="ORV Sagar Nidhi",
            station_name="Stn #08 (Arabian Sea)",
            latitude=19.10,
            longitude=65.40,
            max_depth=2500.0,
            bottles_count=24,
            parameters="Conductivity, Temp, Salinity, Nutrients (NO3, PO4)",
            cruise_date=now - timedelta(days=7),
            qc_status="Quality Controlled (QC-1)"
        )
    ]
    db.add_all(ctds)

    adcps = [
        AdcpStation(
            station_id="ADCP-EQ-01",
            mooring_array="Equatorial Jet Mooring Array",
            location_desc="0.0°N, 77.0°E (0–500m)",
            latitude=0.0,
            longitude=77.0,
            depth_range="0 - 500 m",
            acoustic_freq="75 kHz Long-Ranger",
            peak_current=1.24,
            max_shear=0.014,
            status="Online"
        ),
        AdcpStation(
            station_id="ADCP-SOMALI-03",
            mooring_array="Somali Boundary Array",
            location_desc="8.4°N, 52.1°E (0–300m)",
            latitude=8.4,
            longitude=52.1,
            depth_range="0 - 300 m",
            acoustic_freq="150 kHz QuarterMaster",
            peak_current=2.10,
            max_shear=0.022,
            status="Online"
        )
    ]
    db.add_all(adcps)

    # 7. Accuracy & Error Analysis Records
    accuracy_records = [
        AccuracyMetric(basin="Bay of Bengal (North)", model_name="HYCOM 1/12°", variable="Temperature (°C)", willmott_index=0.964, rmse=0.41, mae=0.32, r2_score=0.941, mean_bias=0.08, skill_rating="High Skill", sample_pairs=1840),
        AccuracyMetric(basin="Arabian Sea (Central)", model_name="ROMS 1/24°", variable="Temperature (°C)", willmott_index=0.978, rmse=0.36, mae=0.28, r2_score=0.962, mean_bias=-0.04, skill_rating="High Skill", sample_pairs=1220),
        AccuracyMetric(basin="Equatorial Indian Ocean", model_name="NEMO Global", variable="Salinity (PSU)", willmott_index=0.912, rmse=0.14, mae=0.10, r2_score=0.887, mean_bias=0.02, skill_rating="Good Skill", sample_pairs=980),
        AccuracyMetric(basin="Somali Upwelling Zone", model_name="HYCOM 1/12°", variable="Currents (m/s)", willmott_index=0.865, rmse=0.19, mae=0.14, r2_score=0.812, mean_bias=-0.06, skill_rating="Moderate", sample_pairs=640)
    ]
    db.add_all(accuracy_records)

    hotspots = [
        ErrorHotspot(region_name="Somali Current Boundary", coords_bounds="4°N–12°N, 48°E–56°E", model_name="HYCOM 1/12°", variable="Temperature (°C)", max_error="+1.42 °C", rmse=0.86, bias=0.54, root_cause="Intense seasonal monsoonal coastal upwelling underestimation", severity="high"),
        ErrorHotspot(region_name="Ganges-Brahmaputra Plume", coords_bounds="18°N–22°N, 87°E–92°E", model_name="NEMO Global", variable="Salinity (PSU)", max_error="-2.10 PSU", rmse=0.94, bias=-0.78, root_cause="Monsoon freshwater river discharge boundary smoothing", severity="high"),
        ErrorHotspot(region_name="Indonesian Throughflow (Timor)", coords_bounds="8°S–14°S, 115°E–128°E", model_name="ROMS Regional", variable="Currents (m/s)", max_error="0.45 m/s", rmse=0.24, bias=-0.12, root_cause="Narrow bathymetric straits and internal solitary wave tidal mixing", severity="medium")
    ]
    db.add_all(hotspots)

    anomalies = [
        AnomalyAlert(id="MHW-2026-08", alert_type="Marine Heatwave (Category III)", region="Central Arabian Sea (15.2°N, 64.5°E)", amplitude="+2.85 °C above 90th percentile", depth_layer="Surface to 45 m", sensor_origin="Argo Float #2902224 & INSAT-3D", duration="14 Days (Active)", severity="extreme"),
        AnomalyAlert(id="SAL-2026-04", alert_type="Freshwater Lens Inversion", region="Northern Bay of Bengal (19.8°N, 89.2°E)", amplitude="-3.40 PSU freshening anomaly", depth_layer="0 – 20 m barrier layer", sensor_origin="Argo Float #7902190", duration="6 Days", severity="moderate")
    ]
    db.add_all(anomalies)

    # 8. Ingestion Pipelines
    pipelines = [
        IngestionPipeline(id="pipe_argo", name="INCOIS Argo Live Stream", source_protocol="ERDDAP / WMS API", schedule="Every 6 Hours", last_sync="12 min ago", records_count="4,232 profiles", status="Healthy"),
        IngestionPipeline(id="pipe_hycom", name="HYCOM 1/12° Forecast Harvester", source_protocol="OPeNDAP / NOAA NCODA", schedule="Daily at 02:00 UTC", last_sync="3 hrs ago", records_count="40 depth grids", status="Healthy"),
        IngestionPipeline(id="pipe_buoy", name="OMNI Moored Buoy Telemetry", source_protocol="NIOT / INCOIS Sat Relay", schedule="Every 10 Minutes", last_sync="4 min ago", records_count="28 buoys", status="Healthy"),
        IngestionPipeline(id="pipe_roms", name="ROMS Coastal Model Ingestion", source_protocol="Local HPC NetCDF Mount", schedule="Hourly", last_sync="22 min ago", records_count="32 s-levels", status="Healthy")
    ]
    db.add_all(pipelines)

    # Commit all seeds
    db.commit()
    print("[Bluesphere Seeder] Successfully seeded database with Indian Ocean records!")
